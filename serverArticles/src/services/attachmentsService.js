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
  return articlesService.removeAttachment(articleId, filename);
}

module.exports = { addFiles, removeFile, UPLOAD_DIR };
