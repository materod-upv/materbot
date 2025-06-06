const { Events } = require('discord.js');
const logger = require('../logger');
const { generateBotResponse } = require('../ia/openrouter');

module.exports = {
  name: Events.MessageUpdate,
  async execute(oldMessage, newMessage) {
    if (newMessage.author.bot) return;

    logger.info(`Message from ${newMessage.author.tag}: ${newMessage.content}`);

    // Responde si el mensaje editado menciona al bot
    if (newMessage.mentions.users.has(newMessage.client.user.id)) {
      // Busca la última respuesta del bot al usuario en el canal
      const fetched = await newMessage.channel.messages.fetch({ limit: 10 });
      const botReply = fetched.find(m =>
        m.reference &&
        m.reference.messageId === newMessage.id &&
        m.author.id === newMessage.client.user.id
      );

      await newMessage.channel.sendTyping();
      const response = await generateBotResponse(newMessage.author.tag, newMessage.content);
      if (botReply) {
        await botReply.edit(response);
      } else {
        await newMessage.reply(response);
      }
    }
  },
};
