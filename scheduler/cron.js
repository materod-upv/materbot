const cron = require('node-cron');
const logger = require('../logger');
const { sendHappyBirthDayMsg } = require('./birthdayCron');

function startCron(bot) {
  // Schedule cron to check for birthdays every day at 09:00
  cron.schedule('0 0 9 * * *', function () {
    sendHappyBirthDayMsg(bot.guilds.cache);
  });
}

module.exports = { startCron };