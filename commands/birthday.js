// birthday.js
const { ActionRowBuilder, ModalBuilder, SlashCommandBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const logger = require('../logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('birthday')
    .setNameLocalizations({
      'es-ES': 'cumple',
      'es-419': 'cumple',
    })
    .setDescription('Set your birthday date to receive a special message')
    .setDescriptionLocalizations({
      'es-ES': 'Establece tu fecha de cumpleaños para recibir un mensaje especial',
      'es-419': 'Establece tu fecha de cumpleaños para recibir un mensaje especial',
    }),
  async execute(interaction) {
    const localesTitle = {
      'es-ES': `Cumpleaños`,
      'es-419': `Cumpleaños`,
    }
    const modal = new ModalBuilder()
      .setCustomId('birthday')
      .setTitle(localesTitle[interaction.locale] ?? 'Birthday');

    const localesDate = {
      'es-ES': `¿Cuál es tu fecha de nacimiento?`,
      'es-419': `¿Cuál es tu fecha de nacimiento?`,
    }
    const dateInput = new TextInputBuilder()
      .setCustomId('dateInput')
      .setLabel(localesDate[interaction.locale] ?? 'What is your birthday?')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('DD/MM/YYYY')
      .setRequired(true);

    const row = new ActionRowBuilder()
      .addComponents(dateInput);

    modal.addComponents(row);

    await interaction.showModal(modal);
  },
  async submit(interaction) {
    const date = interaction.fields.getTextInputValue('dateInput');
    logger.info(`User ${interaction.user.id} set their birthday to ${date}`);
    const locales = {
      'es-ES': `Tu cumpleaños se ha establecido en ${date}`,
      'es-419': `Tu cumpleaños se ha establecido en ${date}`,
    };
    await interaction.reply({ content: locales[interaction.locale] ?? `Your birthday is set to ${date}`, ephemeral: true });
  }
};