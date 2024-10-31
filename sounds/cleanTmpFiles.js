// cleanTemporal.js 
const path = require('path');
const logger = require('../logger');
const fs = require('fs');

function deleteFile(filePath) {
  fs.unlink(filePath, err => {
    if (err) {
      logger.error(`Unable to delete temporary file: ${filePath} - ${err}`);
    } else {
      logger.debug(`Deleted temporary file: ${filePath}`);
    }
  });
}

function cleanTemporalFiles() {
  const tmpDir = path.join(__dirname, 'tmp');

  fs.readdir(tmpDir, (err, files) => {
    if (err) {
      logger.error(`Unable to scan temporary directory: ${err}`);
      return;
    }

    files.forEach(file => {
      const filePath = path.join(tmpDir, file);
      deleteFile(filePath);
    });
  });
}

module.exports = { deleteFile, cleanTemporalFiles };