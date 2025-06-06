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
      logger.debug(`Today is the birthday of user ${users[id].username}...`);

      // For each guild, fetch the member and send the birthday message
      guilds.map((guild) => {
        guild.members.fetch(id)
          .then(member => {
            let title = config.birthday.title
                .replace('{user}', member.displayName)
                .replace('{guild}', guild.name);

            logger.debug(`Birthday message title: ${title}`);

            generateBirthdayMessage(member.displayName).then((message) => {
              logger.debug(`Birthday message: ${message}`);
              logger.debug(`Channel: ${guild.systemChannel}`);

              // Create birthday message embed
              const messageEmbed = new EmbedBuilder()
                .setColor(parseInt("0xFF0084"))
                .setTitle(title)
                .setAuthor({
                  name: 'MaterBot',
                  iconURL: config.server.url + 'img/materbot.png',
                })
                .setDescription(message)
                .setThumbnail(member.user.displayAvatarURL());

              if (guild.systemChannel) {
                guild.systemChannel.send({ embeds: [messageEmbed] });
              }

            }).catch((err) => {
              logger.error(`Error generating birthday message for user ${id}: ${err}`);
            });
          })
          .catch(error => {
            if (error.code === 10007) {
              logger.debug(`User ${id} not found in guild ${guild.name}.`);
            } else {
              logger.error(`Error fetching user ${id} in guild ${guild.name}: ${error.message}`);
            }
          });
      });
    }
  }
}

module.exports = { sendHappyBirthDayMsg };