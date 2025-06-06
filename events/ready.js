const { Events } = require('discord.js');
const logger = require('../logger');
const { loadCommands, deleteCommands } = require('../deploy-commands');
const { loadUserCache } = require('../database/firebase');
const { startCron } = require('../scheduler/cron');

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    logger.info(`Ready! Logged in as ${client.user.tag}`);

    // Delete all commands (Uncomment this line to delete all commands)
    //deleteCommands(client);

    // Load commands
    loadCommands(client);

    // Load user cache
    await loadUserCache();

    // Initialize the cron
    startCron(client);

    // Show guilds data
    /*client.guilds.cache.map(guild => {
      logger.debug(
        `REGISTERED GUILD: id=${guild.id}, name=${guild.name}, created=${new Date(
          guild.createdTimestamp
        ).toLocaleDateString('es-ES')}`
      );

      guild.channels.cache.map((channel) => {
        logger.debug(
          `\t\tCHANNEL: id=${channel.id}, name=${channel.name}, type=${channel.isVoiceBased() ? 'voice' : 'text'
          }`
        );
      });
    });*/
  },
};