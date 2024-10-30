// bot.js
const { Client, Events, GatewayIntentBits } = require('discord.js');
const logger = require('./logger');
const { loadCommands, loadEvents } = require('./deploy-commands');

class Bot {
  constructor() {
    // Create a new Discord client
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.MessageContent,
      ],
    });
    // Set commands
    this.client.commands = loadCommands();

    // Load events
    loadEvents(this.client);
  }

  start() {
    this.client.login(process.env.DISCORD_TOKEN);
  }

  stop() {
    this.client.destroy();
  }
}

module.exports = { Bot };