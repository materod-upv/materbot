const { Events } = require('discord.js');
const logger = require('../logger');

module.exports = {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    logger.info(`Ready! Logged in as ${client.user.tag}`);

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