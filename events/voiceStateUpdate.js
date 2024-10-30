const { Events } = require('discord.js');
const logger = require('../logger');
const textToSpeech = require('../sounds/tts');
const config = require('../config/config.json');
const { text } = require('express');

module.exports = {
  name: Events.VoiceStateUpdate,
  async execute(oldState, newState) {
    if (newState.member.user.bot) return;

    if (newState.channelId === null) {
      logger.debug(`${oldState.member.displayName} left ${oldState.channel.name} channel.`);

      let msg = config.voice.leaveVoiceChannel
        .replace('{user}', oldState.member.displayName)
        .replace('{guild}', oldState.member.guild.name)
        .replace('{channel}', oldState.channel.name);

      try {
        const audioFile = await textToSpeech.textToSpeech(msg);
        console.log(audioFile);
      } catch (error) {
        logger.error(error);
      };

    } else if (oldState.channelId === null) {
      logger.debug(`${newState.member.displayName} joined ${newState.channel.name} channel.`);

      let msg = config.voice.joinVoiceChannel
        .replace('{user}', newState.member.displayName)
        .replace('{guild}', newState.member.guild.name)
        .replace('{channel}', newState.channel.name);

      try {
        const audioFile = await textToSpeech.textToSpeech(msg);
        console.log(audioFile);
      } catch (error) {
        logger.error(error);
      };

    } else if (oldState.channelId !== newState.channelId) {
      if (newState.channelId === newState.guild.afkChannelId) {
        logger.debug(`${newState.member.user.tag} joined the AFK voice channel.`);



      } else if (oldState.channelId === oldState.guild.afkChannelId) {
        logger.debug(`${newState.member.user.tag} left the AFK voice channel.`);
      } else {
        logger.debug(`${newState.member.user.tag} switched voice channels.`);
      }
    } else if (newState.streaming != oldState.streaming) {
      if (newState.streaming) {
        logger.debug(`${newState.member.user.tag} started streaming.`);
      } else {
        logger.debug(`${newState.member.user.tag} stopped streaming.`);
      }
    }
  },
};
