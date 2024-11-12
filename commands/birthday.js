// birthday.js
const { ActionRowBuilder, ModalBuilder, SlashCommandBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const logger = require('../logger');
const { setUser } = require('../database/firebase');

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
    console.log("Me llega el submit");

    const date = interaction.fields.getTextInputValue('dateInput');


    // Check if the date is valid
    if (!date.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      const locales = {
        'es-ES': `La fecha introducida no es válida`,
        'es-419': `La fecha introducida no es válida`,
      };
      logger.error(`Invalid date format for user ${interaction.user.id}: ${date}`);
      await interaction.reply({ content: locales[interaction.locale] ?? `Invalid date format`, ephemeral: true });
      return;
    }

    // Convert date
    const [day, month, year] = date.split('/');
    const birthday = year + '-' + month + '-' + day;

    // Send a temporal message
    const locales = {
      'es-ES': `Actualizando tu cumpleaños...`,
      'es-419': `Actualizando tu cumpleaños...`,
    };
    await interaction.reply({ content: locales[interaction.locale] ?? `Updating your birthday...`, ephemeral: true });

    // Set the birthday in the database
    try {
      await setUser(interaction.user.id, { birthday: birthday });
      const locales = {
        'es-ES': `Tu cumpleaños se ha establecido en ${date}`,
        'es-419': `Tu cumpleaños se ha establecido en ${date}`,
      };
      logger.info(`User ${interaction.user.id} set their birthday to ${date}`);
      await interaction.editReply({ content: locales[interaction.locale] ?? `Your birthday is set to ${date}`, ephemeral: true });
    } catch (error) {
      const locales = {
        'es-ES': `No se ha podido establecer tu cumpleaños`,
        'es-419': `No se ha podido establecer tu cumpleaños`,
      };
      logger.error(`Error setting birthday for user ${interaction.user.id}: `, error);
      await interaction.reply({ content: locales[interaction.locale] ?? `Could not set your birthday`, ephemeral: true });
    }
  }
};