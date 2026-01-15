const express = require('express');
const router = express.Router();
const articlesService = require('../services/articlesService');

function isValidString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

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
    if (!isValidString(title)) {
      return res.status(400).json({ error: 'Title is required' });
    }
    if (!isValidString(content)) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const created = await articlesService.createArticle({ title: title.trim(), content });
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

    if (!isValidString(title)) {
      return res.status(400).json({ error: 'Title is required' });
    }
    if (!isValidString(content)) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const updated = await articlesService.updateArticle(id, { title: title.trim(), content });
    if (!updated) return res.status(404).json({ error: 'Article not found' });

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

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete article' });
  }
});

module.exports = router;
