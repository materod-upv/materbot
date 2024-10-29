// bot.js
const { Client, Events, GatewayIntentBits } = require('discord.js');
const logger = require('./logger');
const loadCommands = require('./deploy-commands');

class Bot {
  constructor() {
    // Create a new Discord client
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
      ],
    });
    // Set commands
    this.client.commands = loadCommands();

    // Client Ready event
    this.client.once(Events.ClientReady, readyClient => {
      logger.info(`Ready! Logged in as ${readyClient.user.tag}`);
    });

    // Interaction Create event
    this.client.on(Events.InteractionCreate, async interaction => {
      if (!interaction.isChatInputCommand()) return;

      const command = interaction.client.commands.get(interaction.commandName);
      if (!command) {
        logger.error(`No command matching ${interaction.commandName} was found.`);
        return;
      }

      try {
        await command.execute(interaction);
      } catch (error) {
        logger.error(error);
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
        } else {
          await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
      }
    });
  }

  start() {
    this.client.login(process.env.DISCORD_TOKEN);
  }

  stop() {
    this.client.destroy();
  }
}

module.exports = { Bot };