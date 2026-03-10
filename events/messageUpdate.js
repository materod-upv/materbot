const { Events } = require('discord.js');
const logger = require('../logger');
const { generateBotResponse } = require('../ia/openrouter');
const config = require('../config/config.json');

module.exports = {
  name: Events.MessageUpdate,
  async execute(oldMessage, newMessage) {
    if (newMessage.author.bot) return;

    logger.info(`Message updated by ${newMessage.author.tag}: ${newMessage.content}`);

    // Solo responde si el mensaje editado menciona al bot
    if (newMessage.mentions.users.has(newMessage.client.user.id)) {
      // Busca la última respuesta del bot al usuario en el canal
      const fetched = await newMessage.channel.messages.fetch({ limit: 10 });
      const botReply = fetched.find(m =>
        m.reference &&
        m.reference.messageId === newMessage.id &&
        m.author.id === newMessage.client.user.id
      );

      await newMessage.channel.sendTyping();
      
      // Obtener contexto del canal
      const previousMessages = await this.getChannelContext(newMessage.channel);
      
      const response = await generateBotResponse(
        newMessage.author.tag, 
        newMessage.content,
        previousMessages
      );
      
      if (response && response.trim() !== '') {
        // Delay aleatorio para parecer más humano
        const delay = 1000 + Math.random() * 2000;
        await new Promise(resolve => setTimeout(resolve, delay));
        
        if (botReply) {
          await botReply.edit(response);
        } else {
          await newMessage.reply(response);
        }
      }
    }
  },

  async getChannelContext(channel) {
    try {
      const messages = await channel.messages.fetch({ 
        limit: config.ai.contextMessages 
      });
      
      // Convertir a array y ordenar del más antiguo al más reciente
      return messages
        .sort((a, b) => a.createdTimestamp - b.createdTimestamp)
        .map(msg => ({
          author: msg.author.tag,
          content: msg.content,
          timestamp: msg.createdAt
        }))
        .filter(msg => msg.content.trim() !== ''); // Ignorar mensajes vacíos
    } catch (error) {
      logger.error('Error fetching channel context:', error);
      return [];
    }
  },
};
