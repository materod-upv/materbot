const fs = require('fs');
const path = require('path');
const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { generateChannelSummary } = require('../ia/openrouter');

const logger = require('../logger');


module.exports = {
  data: new SlashCommandBuilder()
    .setName('summary')
    .setNameLocalizations({
      'es-ES': 'resumen',
      'es-419': 'resumen',
    })
    .setDescription('Summarize the conversation in the current channel')
    .setDescriptionLocalizations({
      'es-ES': 'Resumir la conversación en el canal actual',
      'es-419': 'Resumir la conversación en el canal actual',
    })
    .addIntegerOption((option) =>
      option
        .setName('hours')
        .setNameLocalizations({
          'es-ES': 'horas',
          'es-419': 'horas',
        })
        .setDescription('Number of hours to summarize (Max 24 hours)')
        .setDescriptionLocalizations({
          'es-ES': 'Número de horas a resumir (Máximo 24 horas)',
          'es-419': 'Número de horas a resumir (Máximo 24 horas)',
        })
        .setMinValue(1)
        .setMaxValue(24)
        .setRequired(true)
    ).setDMPermission(false),
  async execute(interaction) {
    const hours = interaction.options.getInteger('hours');
    if (hours < 1 || hours > 24) {
      return interaction.reply({
        content: interaction.locale.startsWith('es')
          ? 'Por favor, proporciona un número de horas válido entre 1 y 24.'
          : 'Please provide a valid number of hours between 1 and 24.',
        flags: MessageFlags.Ephemeral,
      });
    } else {
      const now = Date.now();
      const since = now - hours * 60 * 60 * 1000;
      let messages = [];
      let lastId;

      while (true) {
        const fetched = await interaction.channel.messages.fetch({ limit: 100, before: lastId });
        if (fetched.size === 0) break;

        const filtered = fetched.filter(msg => msg.createdTimestamp >= since);
        messages.push(...filtered.values());

        // Stop if the oldest fetched message is older than the time window
        if (fetched.last().createdTimestamp < since) break;

        lastId = fetched.last().id;
      }

      logger.debug(`Fetched ${messages.length} messages from the last ${hours} hours in channel ${interaction.channel.id}`);
      await interaction.deferReply({ 
        content: interaction.locale.startsWith('es')
          ? `Resumiendo ${messages.length} mensajes en las últimas ${hours} horas...`
          : `Summarizing ${messages.length} messages from the last ${hours} hours...`,
          flags: MessageFlags.Ephemeral
       });

      const response = await generateChannelSummary(messages);
      await interaction.editReply({
        content: response,
        flags: MessageFlags.Ephemeral
      });
    }
  },
};
