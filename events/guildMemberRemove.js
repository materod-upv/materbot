const { Events } = require('discord.js');
const logger = require('../logger');

module.exports = {
  name: Events.GuildMemberRemove,
  async execute(member) {
    if (member.user.bot) return;

    logger.debug(`User ${member.user.tag} left the server.`);
  },
};
