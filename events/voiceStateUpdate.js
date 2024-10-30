const { Events } = require('discord.js');
const logger = require('../logger');
const textToSpeech = require('../sounds/tts');
const VoicePlayer = require('../sounds/VoicePlayer');
const config = require('../config/config.json');

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
        VoicePlayer.playSound(oldState.channel, audioFile);
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
        VoicePlayer.playSound(newState.channel, audioFile);
      } catch (error) {
        logger.error(error);
      };

    } else if (oldState.channelId !== newState.channelId) {
      if (newState.channelId === newState.guild.afkChannelId) {
        logger.debug(`${newState.member.user.tag} joined the AFK voice channel.`);

        let msg = config.voice.joinAfkChannel
          .replace('{user}', newState.member.displayName)
          .replace('{guild}', newState.member.guild.name)
          .replace('{channel}', newState.channel.name);

        try {
          const audioFile = await textToSpeech.textToSpeech(msg);
          VoicePlayer.playSound(newState.channel, audioFile);
        } catch (error) {
          logger.error(error);
        };

      } else if (oldState.channelId === oldState.guild.afkChannelId) {
        logger.debug(`${newState.member.user.tag} left the AFK voice channel.`);

        let msg = config.voice.leaveAfkChannel
          .replace('{user}', newState.member.displayName)
          .replace('{guild}', newState.member.guild.name)
          .replace('{channel}', newState.channel.name);

        try {
          const audioFile = await textToSpeech.textToSpeech(msg);
          VoicePlayer.playSound(newState.channel, audioFile);
        } catch (error) {
          logger.error(error);
        };

      } else {
        logger.debug(`${newState.member.user.tag} moved from ${oldState.channel.name} to ${newState.channel.name} channel.`);

        let msgOld = config.voice.moveOldChannel
          .replace('{user}', oldState.member.displayName)
          .replace('{guild}', oldState.member.guild.name)
          .replace('{channel}', oldState.channel.name);
        let msgNew = config.voice.moveNewChannel
          .replace('{user}', newState.member.displayName)
          .replace('{guild}', newState.member.guild.name)
          .replace('{channel}', newState.channel.name);

        try {
          const audioFileOld = await textToSpeech.textToSpeech(msgOld);
          VoicePlayer.playSound(oldState.channel, audioFileOld);

          const audioFileNew = await textToSpeech.textToSpeech(msgNew);
          VoicePlayer.playSound(newState.channel, audioFileNew);
        } catch (error) {
          logger.error(error);
        };
      }
    } else if (newState.streaming != oldState.streaming) {
      if (newState.streaming) {
        logger.debug(`${newState.member.user.tag} started streaming.`);

        let msg = config.voice.startStreaming
          .replace('{user}', newState.member.displayName)
          .replace('{guild}', newState.member.guild.name)
          .replace('{channel}', newState.channel.name);

        try {
          const audioFile = await textToSpeech.textToSpeech(msg);
          VoicePlayer.playSound(newState.channel, audioFile);
        } catch (error) {
          logger.error(error);
        };
      } else {
        logger.debug(`${newState.member.user.tag} stopped streaming.`);

        let msg = config.voice.stopStreaming
          .replace('{user}', newState.member.displayName)
          .replace('{guild}', newState.member.guild.name)
          .replace('{channel}', newState.channel.name);

        try {
          const audioFile = await textToSpeech.textToSpeech(msg);
          VoicePlayer.playSound(newState.channel, audioFile);
        } catch (error) {
          logger.error(error);
        };
      }
    }
  },
};
