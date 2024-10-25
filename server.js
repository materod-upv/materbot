// server.js
const express = require('express');
const morgan = require('morgan');
const path = require('path');

const logger = require('./controllers/logger');
const { Bot } = require('./controllers/bot');

const app = express();
const port = 8080;
const bot = new Bot();



// Use morgan as middleware to log HTTP requests
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Servir archivos estáticos desde el directorio 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Status page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'status.html'));
});

// Start the server
app.listen(port, () => {
  logger.info(`Server listening on http://localhost:${port}`);
  bot.start();
});