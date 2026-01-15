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
    const list = await articlesService.listArticles();
    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load articles' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const article = await articlesService.getArticleById(req.params.id);
    if (!article) return res.status(404).json({ error: 'Article not found' });
    res.json(article);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load article' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title, content } = req.body || {};
    if (!isValidString(title)) return res.status(400).json({ error: 'Title is required' });
    if (!isValidString(content)) return res.status(400).json({ error: 'Content is required' });

    const created = await articlesService.createArticle({ title: title.trim(), content });

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
    const { title, content } = req.body || {};
    if (!isValidString(title)) return res.status(400).json({ error: 'Title is required' });
    if (!isValidString(content)) return res.status(400).json({ error: 'Content is required' });

    const updated = await articlesService.updateArticle(req.params.id, { title: title.trim(), content });
    if (!updated) return res.status(404).json({ error: 'Article not found' });

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
