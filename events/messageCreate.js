const { Events } = require('discord.js');
const logger = require('../logger');

module.exports = {
  name: Events.MessageCreate,
  async execute(message) {
    if (message.author.bot) return;

    logger.info(`Message from ${message.author.tag}: ${message.content}`);
  },
};
