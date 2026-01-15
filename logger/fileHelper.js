const fs = require('fs');
const path = require('path');

const FileHelper = {
  ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  },

  writeLog(folderPath, fileName, content) {
    this.ensureDir(folderPath);
    const filePath = path.join(folderPath, fileName);
    fs.appendFileSync(filePath, content + '\n');
    return filePath;
  },

  readLogFile(filePath) {
    try {
      return fs.readFileSync(filePath, 'utf8');
    } catch {
      return '';
    }
  },

  listFolders(baseDir) {
    if (!fs.existsSync(baseDir)) return [];
    return fs.readdirSync(baseDir).filter(f => fs.statSync(path.join(baseDir, f)).isDirectory());
  },

  listFiles(folderPath) {
    if (!fs.existsSync(folderPath)) return [];
    return fs.readdirSync(folderPath).filter(f => fs.statSync(path.join(folderPath, f)).isFile());
  }
};

module.exports = FileHelper;
