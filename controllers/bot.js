// bot.js
const { Client, GatewayIntentBits } = require('discord.js');

const logger = require('./logger');

// Discord dashboard
// https://discordapp.com/developers/applications

class Bot {
  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
      ],
    });
    this.client.once('ready', () => {
      logger.info('Bot is ready');
    });
  }

  start() {
    this.client.login(process.env.DISCORD_TOKEN);
  }
}

module.exports = { Bot };