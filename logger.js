const winston = require('winston');
const path = require('path');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
      let line = `${timestamp} [${level.toUpperCase()}]: ${stack || message}`;

      if (Object.keys(meta).length > 0) {
        line += ` ${JSON.stringify(meta)}`;
      }

      return line;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: path.join(__dirname, 'logs', 'bot.log') }),
  ],
});

module.exports = logger;