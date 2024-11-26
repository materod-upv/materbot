const { EmbedBuilder } = require('@discordjs/builders');
const logger = require('../logger');
const config = require('../config/config');
const { getUsersList } = require('../database/firebase');
const { generateBirthdayMessage } = require('../ia/openrouter');

function sendHappyBirthDayMsg(guilds) {
  const today = new Date();
  const users = getUsersList();
  for (id in users) {
    const birthDate = new Date(users[id].birthday);
    if (birthDate.getDate() === today.getDate() && birthDate.getMonth() === today.getMonth()) {
      logger.debug(`Today is the birthday of user ${id}...`);

      generateBirthdayMessage(users[id].username).then((message) => {
        guilds.forEach((guild) => {
          guild.members
            .fetch(id)
            .then((member) => {
              logger.debug(`Sending birthday message to user ${member.user.tag} in channel ${member.guild.systemChannel} of guild ${member.guild.name}`);

              let title = config.birthday.title
                .replace('{user}', member.displayName)
                .replace('{guild}', member.guild.name);

              // Create birthday message
              const messageEmbed = new EmbedBuilder()
                .setColor(parseInt("0xFF0084"))
                .setTitle(title)
                .setAuthor({
                  name: 'MaterBot',
                  iconURL: config.server.url + 'img/materbot.png',
                })
                .setDescription(message)
                .setThumbnail(member.user.displayAvatarURL());

              if (member.guild.systemChannel) {
                member.guild.systemChannel.send({ embeds: [messageEmbed] });
              }
            });
        });
      }).catch((err) => {
        logger.error(`Error generating birthday message for user ${id}: ${err}`);
      });
    }
  }
}

module.exports = { sendHappyBirthDayMsg };