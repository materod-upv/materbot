const fs = require('fs');
const path = require('path');
const { SlashCommandBuilder, ChannelType, MessageFlags, PermissionFlagsBits } = require('discord.js');

const VoicePlayer = require('../sounds/VoicePlayer');
const logger = require('../logger');

// Sound list
const soundList = {};

// Load souns
const baseAudioDir = path.join(__dirname + '/../resources/audio');
const soundFiles = fs.readdirSync(baseAudioDir);
for (const file of soundFiles) {
  const fileName = file.split('.')[0];
  const filePath = path.join(baseAudioDir, file);
  soundList[fileName] = filePath
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setNameLocalizations({
      'es-ES': 'reproducir',
      'es-419': 'reproducir',
    })
    .setDescription('Play a sound in a voice channel')
    .setDescriptionLocalizations({
      'es-ES': 'Reproduce un sonido en un canal de voz',
      'es-419': 'Reproduce un sonido en un canal de voz',
    })
    .addStringOption((option) =>
      option
        .setName('sound')
        .setNameLocalizations({
          'es-ES': 'sonido',
          'es-419': 'sonido',
        })
        .setDescription('Choose a sound to play')
        .setDescriptionLocalizations({
          'es-ES': 'Elige un sonido para reproducir',
          'es-419': 'Elige un sonido para reproducir',
        })
        .setAutocomplete(true)
        .setRequired(true)
    ).addChannelOption((option) =>
      option
        .setName('channel')
        .setNameLocalizations({
          'es-ES': 'canal',
          'es-419': 'canal',
        })
        .setDescription('Choose a channel to play the sound')
        .setDescriptionLocalizations({
          'es-ES': 'Elige un canal para reproducir el sonido',
          'es-419': 'Elige un canal para reproducir el sonido',
        })
        .addChannelTypes(ChannelType.GuildVoice)
    ).setDefaultMemberPermissions(PermissionFlagsBits.UseSoundboard)
    .setDMPermission(false),
  async autocomplete(interaction) {
    const focusedValue = interaction.options.getFocused();
    const choices = Object.keys(soundList);
    const filtered = choices.filter((choice) =>
      choice.startsWith(focusedValue)
    );
    // Show the first 25 results
    await interaction.respond(
      filtered.slice(0, 25).map((choice) => ({ name: choice, value: choice }))
    );
  },
  async execute(interaction) {
    const sound = interaction.options.getString('sound');
    let channel = interaction.options.getChannel('channel');
    if (!channel) {
      channel = interaction.member.voice.channel;
    }

    logger.info(`Command Play - execute: channel = ${channel}, sound = ${sound}`);

    const audioFile = soundList[sound];
    if (audioFile) {
      VoicePlayer.playSound(channel, audioFile);
      const locales = {
        'es-ES': `Añadido sonido "${sound}" a la cola de reproducción actual`,
        'es-419': `Añadido sonido "${sound}" a la cola de reproducción actual`,
      }
      await interaction.reply({
        content: locales[interaction.locale] ?? `Added sound "${sound}" to the current playing queue`,
        flags: MessageFlags.Ephemeral,
      });
    } else {
      const locales = {
        'es-ES': `Sonido "${sound}" no encontrado`,
        'es-419': `Sonido "${sound}" no encontrado`,
      }
      await interaction.reply({
        content: locales[interaction.locale] ?? `Sound "${sound}" not found`,
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};