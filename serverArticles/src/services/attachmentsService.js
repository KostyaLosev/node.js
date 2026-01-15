const path = require('path');
const fs = require('fs-extra');
const articlesService = require('./articlesService');

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
fs.ensureDirSync(UPLOAD_DIR);

async function addFiles(articleId, files) {
  const newFiles = files.map(f => ({
    filename: f.filename,
    originalName: f.originalname,
    path: `/uploads/${f.filename}`
  }));

  return articlesService.addAttachments(articleId, newFiles);
}

async function removeFile(articleId, filename) {
  const article = await articlesService.getArticleById(articleId);
  if (!article || !article.attachments) return null;

  const attachment = article.attachments.find(att => att.filename === filename);
  if (!attachment) return article;

  const filePath = path.join(__dirname, '..', 'uploads', attachment.filename);
  if (await fs.pathExists(filePath)) {
    await fs.remove(filePath);
  }

  return articlesService.removeAttachment(articleId, filename);
}

module.exports = { addFiles, removeFile, UPLOAD_DIR };
