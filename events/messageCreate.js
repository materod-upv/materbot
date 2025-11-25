const { Events } = require('discord.js');
const logger = require('../logger');
const { generateBotResponse } = require('../ia/openrouter');

module.exports = {
  name: Events.MessageCreate,
  async execute(message) {
    if (message.author.bot) return;

    logger.info(`Message from ${message.author.tag}: ${message.content}`);

    // Responde to the message if it is for the bot
    if (message.mentions.users.has(message.client.user.id)) {
      await message.channel.sendTyping();
      const response = await generateBotResponse(message.author.tag, message.content);
      if (response && response.trim() !== '') {
        await message.reply(response);
      }
    }
  },
};
