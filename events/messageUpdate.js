const { Events } = require('discord.js');
const logger = require('../logger');

module.exports = {
  name: Events.MessageUpdate,
  async execute(oldMessage, newMessage) {
    if (newMessage.author.bot) return;

    logger.info(`Message from ${newMessage.author.tag}: ${newMessage.content}`);
  },
};
