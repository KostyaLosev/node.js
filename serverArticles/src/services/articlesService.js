const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DATA_DIR = path.join(__dirname, '..', 'data');

async function ensureDataDir() {
  await fs.ensureDir(DATA_DIR);
}

async function listArticles() {
  await ensureDataDir();
  const files = await fs.readdir(DATA_DIR);
  const articles = [];
  for (const f of files) {
    if (!f.endsWith('.json')) continue;
    const full = path.join(DATA_DIR, f);
    try {
      const txt = await fs.readFile(full, 'utf8');
      const obj = JSON.parse(txt);
      articles.push({
        id: obj.id,
        title: obj.title,
        createdAt: obj.createdAt
      });
    } catch (e) {
    }
  }
  articles.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return articles;
}

async function getArticleById(id) {
  await ensureDataDir();
  const file = path.join(DATA_DIR, `${id}.json`);
  if (!await fs.pathExists(file)) return null;
  const txt = await fs.readFile(file, 'utf8');
  return JSON.parse(txt);
}

async function createArticle({ title, content }) {
  await ensureDataDir();
  const id = uuidv4();
  const createdAt = new Date().toISOString();
  const article = { id, title, content, createdAt };
  const file = path.join(DATA_DIR, `${id}.json`);
  await fs.writeFile(file, JSON.stringify(article, null, 2), 'utf8');
  return article;
}

async function updateArticle(id, { title, content }) {
  await ensureDataDir();
  const file = path.join(DATA_DIR, `${id}.json`);
  if (!await fs.pathExists(file)) return null;

  const article = JSON.parse(await fs.readFile(file, 'utf8'));
  article.title = title;
  article.content = content;
  article.updatedAt = new Date().toISOString();

  await fs.writeFile(file, JSON.stringify(article, null, 2), 'utf8');
  return article;
}

async function deleteArticle(id) {
  await ensureDataDir();
  const file = path.join(DATA_DIR, `${id}.json`);
  if (!await fs.pathExists(file)) return null;

  await fs.remove(file);
  return true;
}

module.exports = {
  listArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle
};
