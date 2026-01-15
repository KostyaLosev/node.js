const path = require('path');
const Logger = require('../logger/logger');
const FileHelper = require('../logger/fileHelper');

const BASE_DIR = path.join(__dirname, '../data');
const logger = new Logger();
let currentFolder = path.join(BASE_DIR, new Date().toISOString().replace(/[:.]/g, '-'));

const types = ['success', 'error', 'info', 'warn'];

const createNewFolder = () => {
  currentFolder = path.join(BASE_DIR, new Date().toISOString().replace(/[:.]/g, '-'));
  FileHelper.ensureDir(currentFolder);
  console.log(`[LOG] Created folder: ${currentFolder}`);
};

const createNewLogFile = () => {
  const type = types[Math.floor(Math.random() * types.length)];
  const fileName = `${Date.now()}.txt`;
  FileHelper.writeLog(currentFolder, fileName, logger.format(type));
  console.log(`[LOG] Added log: [${type.toUpperCase()}]`);
};

FileHelper.ensureDir(currentFolder);
console.log(`[LOG] Created initial folder: ${currentFolder}`);

setInterval(createNewFolder, 60_000);
setInterval(createNewLogFile, 10_000);
