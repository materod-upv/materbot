const { Events } = require('discord.js');
const logger = require('../logger');

module.exports = {
  name: Events.GuildMemberAdd,
  async execute(member) {
    if (member.user.bot) return;

    logger.debug(`User ${member.user.tag} joined the server.`);
  },
};
