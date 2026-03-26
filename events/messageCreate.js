const { Events } = require('discord.js');
const logger = require('../logger');
const { generateBotResponse } = require('../ia/openrouter');
const config = require('../config/config.json');

let lastRandomResponse = 0;

module.exports = {
  name: Events.MessageCreate,
  async execute(message) {
    if (message.author.bot) return;

    logger.info(`Message from ${message.author.tag}: ${message.content}`);

    const isMentioned = message.mentions.users.has(message.client.user.id);
    const shouldRespond = this.shouldBotRespond(message, isMentioned);

    if (shouldRespond) {
      await message.channel.sendTyping();

      // Obtener mensajes previos para contexto
      const previousMessages = await this.getChannelContext(message.channel);

      const response = await generateBotResponse(
        message.author.tag,
        message.content,
        previousMessages
      );

      if (response && response.trim() !== '') {
        // Delay aleatorio para parecer más humano (1-3 segundos)
        const delay = 1000 + Math.random() * 2000;
        await new Promise(resolve => setTimeout(resolve, delay));

        await message.reply(response);

        if (!isMentioned) {
          lastRandomResponse = Date.now();
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

  shouldBotRespond(message, isMentioned) {
    // Always respond when mentioned
    if (isMentioned) {
      return Math.random() < config.ai.mentionResponseChance;
    }

    // Don't respond messages in some guild channels
    if (message.guild && config.ai.ignoredGuilds.includes(message.guild.id)) {
      return false;
    }

    // Don't respond to short messages
    if (message.content.length < config.ai.minMessageLength) {
      return false;
    }

    // Don't respond if we're on cooldown
    if (Date.now() - lastRandomResponse < config.ai.cooldownMs) {
      return false;
    }

    // Increase the probability if the message contains keywords related to bots or AI
    const hasKeyword = config.ai.keywords.some(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'i');
      return regex.test(message.content);
    });

    const chance = hasKeyword ? config.ai.randomResponseChance * 2 : config.ai.randomResponseChance;
    return Math.random() < chance;
  },
};
