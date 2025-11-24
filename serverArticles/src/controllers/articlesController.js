const express = require('express');
const router = express.Router();
const articlesService = require('../services/articlesService');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');

function isValidString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
fs.ensureDirSync(UPLOAD_DIR);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + '-' + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'application/pdf'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Only JPG, PNG, PDF allowed'));
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
    const id = req.params.id;
    const article = await articlesService.getArticleById(id);
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
    const io = req.app.get('io');
    io.emit('article-updated', {
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
    const id = req.params.id;
    const { title, content } = req.body || {};
    if (!isValidString(title)) return res.status(400).json({ error: 'Title is required' });
    if (!isValidString(content)) return res.status(400).json({ error: 'Content is required' });

    const updated = await articlesService.updateArticle(id, { title: title.trim(), content });
    if (!updated) return res.status(404).json({ error: 'Article not found' });

    const io = req.app.get('io');
    io.emit('article-updated', {
      articleId: id,
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
    const id = req.params.id;
    const deleted = await articlesService.deleteArticle(id);
    if (!deleted) return res.status(404).json({ error: 'Article not found' });

    const io = req.app.get('io');
    io.emit('article-updated', {
      articleId: id,
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
    const files = req.files.map(f => ({
      filename: f.filename,
      originalName: f.originalname,
      path: `/uploads/${f.filename}`
    }));

    const article = await articlesService.addAttachments(articleId, files);
    if (!article) return res.status(404).json({ error: 'Article not found' });

    const io = req.app.get('io');
    io.emit('article-updated', {
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

module.exports = router;
