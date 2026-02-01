const express = require('express');
const router = express.Router();
const articlesService = require('../services/articlesService');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const notifications = require('../services/notificationsService');
const attachmentsService = require('../services/attachmentsService');

function isValidString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function parseWorkspaceId(value) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
fs.ensureDirSync(UPLOAD_DIR);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + '-' + file.originalname);
  }
});

const allowedMimes = ['image/jpeg', 'image/png', 'application/pdf'];

const fileFilter = (req, file, cb) => {
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    req.fileValidationError = 'Only JPG, PNG, PDF allowed';
    cb(null, false);
  }
};

const upload = multer({ storage, fileFilter });

router.get('/', async (req, res) => {
  try {
    const workspaceId = parseWorkspaceId(req.query.workspaceId);
    const list = await articlesService.listArticles(workspaceId);
    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load articles' });
  }
});

router.get('/:id/versions', async (req, res) => {
  try {
    const versions = await articlesService.listArticleVersions(req.params.id);
    if (!versions) return res.status(404).json({ error: 'Article not found' });
    res.json(versions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load article versions' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const versionParam = req.query.version;
    let version = null;
    if (versionParam !== undefined) {
      const parsed = Number(versionParam);
      if (!Number.isInteger(parsed) || parsed <= 0) {
        return res.status(400).json({ error: 'Invalid version' });
      }
      version = parsed;
    }

    const article = await articlesService.getArticleById(req.params.id, version);
    if (!article) return res.status(404).json({ error: 'Article not found' });
    res.json(article);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load article' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title, content, workspaceId } = req.body || {};
    if (!isValidString(title)) return res.status(400).json({ error: 'Title is required' });
    if (!isValidString(content)) return res.status(400).json({ error: 'Content is required' });
    const parsedWorkspaceId = parseWorkspaceId(workspaceId);
    if (!parsedWorkspaceId) return res.status(400).json({ error: 'Workspace is required' });

    const created = await articlesService.createArticle({
      title: title.trim(),
      content,
      workspaceId: parsedWorkspaceId,
      userId: req.user.id,
    });

    notifications.notifyArticleUpdate({
      articleId: created.id,
      type: 'created',
      message: 'New article created'
    });

    res.status(201).json(created);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create article' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { title, content, workspaceId } = req.body || {};
    if (!isValidString(title)) return res.status(400).json({ error: 'Title is required' });
    if (!isValidString(content)) return res.status(400).json({ error: 'Content is required' });
    const parsedWorkspaceId = parseWorkspaceId(workspaceId);
    if (!parsedWorkspaceId) return res.status(400).json({ error: 'Workspace is required' });

    const existing = await articlesService.getArticleOwner(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Article not found' });

    const isAdmin = req.user.role === 'admin';
    const isOwner = existing.userId && req.user.id === existing.userId;
    if (!isAdmin && !isOwner) {
      return res.status(403).json({ error: 'You do not have permission to edit this article' });
    }

    const updated = await articlesService.updateArticle(req.params.id, {
      title: title.trim(),
      content,
      workspaceId: parsedWorkspaceId
    });

    notifications.notifyArticleUpdate({
      articleId: req.params.id,
      type: 'updated',
      message: 'Article updated'
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update article' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await articlesService.deleteArticle(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Article not found' });

    notifications.notifyArticleUpdate({
      articleId: req.params.id,
      type: 'deleted',
      message: 'Article deleted'
    });

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete article' });
  }
});

router.get('/:id/comments', async (req, res) => {
  try {
    const comments = await articlesService.listComments(req.params.id);
    res.json(comments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load comments' });
  }
});

router.post('/:id/comments', async (req, res) => {
  try {
    const { content } = req.body || {};
    if (!isValidString(content)) return res.status(400).json({ error: 'Content is required' });

    const comment = await articlesService.addComment(req.params.id, content.trim());

    notifications.notifyArticleUpdate({
      articleId: req.params.id,
      type: 'comment-created',
      message: 'New comment added'
    });

    res.status(201).json(comment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

router.put('/:id/comments/:commentId', async (req, res) => {
  try {
    const { content } = req.body || {};
    if (!isValidString(content)) return res.status(400).json({ error: 'Content is required' });

    const updated = await articlesService.updateComment(req.params.id, req.params.commentId, content.trim());
    if (!updated) return res.status(404).json({ error: 'Comment not found' });

    notifications.notifyArticleUpdate({
      articleId: req.params.id,
      type: 'comment-updated',
      message: 'Comment updated'
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update comment' });
  }
});

router.delete('/:id/comments/:commentId', async (req, res) => {
  try {
    const deleted = await articlesService.deleteComment(req.params.id, req.params.commentId);
    if (!deleted) return res.status(404).json({ error: 'Comment not found' });

    notifications.notifyArticleUpdate({
      articleId: req.params.id,
      type: 'comment-deleted',
      message: 'Comment deleted'
    });

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

router.post('/:id/attachments', upload.array('files'), async (req, res) => {
  try {
    const articleId = req.params.id;

    if (req.fileValidationError) return res.status(400).json({ error: req.fileValidationError });
    if (!req.files || req.files.length === 0) return res.status(400).json({ error: 'No files uploaded' });

    const article = await attachmentsService.addFiles(articleId, req.files);
    if (!article) return res.status(404).json({ error: 'Article not found' });

    notifications.notifyArticleUpdate({
      articleId,
      type: 'attachment',
      message: 'New file(s) added'
    });

    res.json(article);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Failed to upload files' });
  }
});

router.delete('/:id/attachments/:filename', async (req, res) => {
  try {
    const article = await attachmentsService.removeFile(req.params.id, req.params.filename);
    if (!article) return res.status(404).json({ error: 'Article or attachment not found' });

    notifications.notifyArticleUpdate({
      articleId: req.params.id,
      type: 'attachment-removed',
      message: `Attachment removed: ${req.params.filename}`
    });

    res.json(article);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Failed to remove attachment' });
  }
});

module.exports = router;
