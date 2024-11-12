// bot.js
const { Client, GatewayIntentBits } = require('discord.js');
const { loadEvents } = require('./deploy-events');
const { initUsersCache } = require('./database/firebase');

class Bot {
  constructor() {
    // Create a new Discord client
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.MessageContent,
      ],
    });

    // Load events
    loadEvents(this.client);

    // Load users cache
    initUsersCache();
  }

  start() {
    this.client.login(process.env.DISCORD_TOKEN);
  }

  stop() {
    this.client.destroy();
  }
}

module.exports = { Bot };