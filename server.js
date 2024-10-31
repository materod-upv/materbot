// server.js
const express = require('express');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');

const logger = require('./logger');
const { cleanTemporalFiles } = require('./sounds/cleanTmpFiles');
const { Bot } = require('./bot');

const app = express();
const port = process.env.PORT || 8080;
const bot = new Bot();

// Use morgan as middleware to log HTTP requests
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });
app.use(morgan('combined', { stream: accessLogStream }));

// Servir archivos estáticos desde el directorio 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Status page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'status.html'));
});

// Start the server
const server = app.listen(port, () => {
  logger.info(`Server listening on http://localhost:${port}`);

  // Clean tmp files
  cleanTemporalFiles();

  // Start the bot
  bot.start();
});

function shutdown() {
  logger.info('Shutting down server...');
  server.close(() => {
    logger.info('Server has been shut down.');
    bot.stop();
    process.exit(0);
  });
}

// Stop the bot when the server is stopped
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);