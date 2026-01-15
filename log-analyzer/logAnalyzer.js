const path = require('path');
const FileHelper = require('../logger/fileHelper');

const BASE_DIR = path.join(__dirname, '../data');
const typeArg = process.argv.find(arg => arg.startsWith('--type='));
const filterType = typeArg ? typeArg.split('=')[1].toLowerCase() : null;

function analyzeLogs() {
  const summary = {};
  const folders = FileHelper.listFolders(BASE_DIR);

  folders.forEach(folder => {
    const files = FileHelper.listFiles(path.join(BASE_DIR, folder));
    files.forEach(file => {
      const data = FileHelper.readLogFile(path.join(BASE_DIR, folder, file));
      const match = data.match(/\[(.*?)\]/g);
      if (match && match[0]) {
        const type = match[0].replace(/\[|\]/g, '').toLowerCase();
        summary[type] = (summary[type] || 0) + 1;
      }
    });
  });

  printSummary(summary);
}

function printSummary(result) {
  console.log('\n[Log Analysis Report]');
  console.log('--------------------');

  if (filterType) {
    if (!result[filterType]) {
      console.log(`No logs found with type '${filterType}'.`);
    } else {
      console.log(`Filtered by type: ${filterType.toUpperCase()}`);
      console.log(`Total logs: ${result[filterType]}`);
    }
  } else {
    if (Object.keys(result).length === 0) {
      console.log('No logs found.');
    } else {
      Object.entries(result).forEach(([type, count]) => {
        console.log(`${type.toUpperCase()}: ${count}`);
      });
    }
  }

  console.log('[LOG] Analysis complete.\n');
}

analyzeLogs();
