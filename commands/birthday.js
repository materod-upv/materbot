const {
  ApplicationCommandType,
  ActionRowBuilder,
  ContextMenuCommandBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle
} = require('discord.js');
const { setUser } = require('../database/firebase');
const logger = require('../logger');

module.exports = {
  data: new ContextMenuCommandBuilder()
    .setName('Add Birthday')
    .setNameLocalizations({
      'es-ES': 'Agregar cumpleaños',
      'es-419': 'Agregar cumpleaños',
    })
    .setType(ApplicationCommandType.User),
  async execute(interaction) {
    const targetUser = interaction.targetUser;
    const executingUser = interaction.user;
    const member = interaction.guild.members.cache.get(executingUser.id);

    if ((targetUser.id !== executingUser.id) && !member.permissions.has('ADMINISTRATOR')) {
      const locales = {
        'es-ES': `No puedes establecer el cumpleaños de otra persona`,
        'es-419': `No puedes establecer el cumpleños de otra persona`,
      };
      logger.warn(`User ${executingUser.id} tried to set the birthday of another user ${targetUser.id}`);
      await interaction.reply({ content: locales[interaction.locale] ?? `You can't set the birthday of another person`, ephemeral: true });
      return;
    }

    const localesTitle = {
      'es-ES': `Cumpleaños`,
      'es-419': `Cumpleaños`,
    }
    const modal = new ModalBuilder()
      .setCustomId('Add Birthday')
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

    const row1 = new ActionRowBuilder().addComponents(dateInput);

    if (targetUser.id !== executingUser.id) {
      const localesUser = {
        'es-ES': `Id del usuario`,
        'es-419': `Id del usuario`,
      }
      const userInput = new TextInputBuilder()
        .setCustomId('userInput')
        .setLabel(localesUser[interaction.locale] ?? 'User Id')
        .setStyle(TextInputStyle.Short)
        .setValue(targetUser.id)
        .setRequired(false);

      const row2 = new ActionRowBuilder().addComponents(userInput);
      modal.addComponents(row1, row2);
    } else {
      modal.addComponents(row1);
    }

    await interaction.showModal(modal);
  },
  async submit(interaction) {
    const date = interaction.fields.getTextInputValue('dateInput');
    let targetUser = interaction.user;
    try {
      const userId = interaction.fields.getTextInputValue('userInput');
      targetUser = await interaction.client.users.fetch(userId);
    } catch (error) {
    }

    // Check if the date is valid
    if (!date.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      const locales = {
        'es-ES': `La fecha introducida no es válida`,
        'es-419': `La fecha introducida no es válida`,
      };
      logger.error(`Invalid date format for user ${targetUser.id}: ${date}`);
      await interaction.reply({ content: locales[interaction.locale] ?? `Invalid date format`, ephemeral: true });
      return;
    }

    // Convert date
    const [day, month, year] = date.split('/');
    const birthday = year + '-' + month + '-' + day;

    // Send a temporal message
    const locales = {
      'es-ES': `Actualizando cumpleaños...`,
      'es-419': `Actualizando cumpleaños...`,
    };
    await interaction.reply({ content: locales[interaction.locale] ?? `Updating birthday...`, ephemeral: true });

    // Set the birthday in the database
    try {
      await setUser(targetUser.id, {
        username: targetUser.username,
        birthday: birthday
      });
      const locales = {
        'es-ES': `El cumpleaños de ${targetUser.username} se ha establecido en ${date}`,
        'es-419': `El cumpleaños de ${targetUser.username} se ha establecido en ${date}`,
      };
      logger.info(`Set birthday of user ${targetUser.id} to ${date}`);
      await interaction.editReply({ content: locales[interaction.locale] ?? `The birthday of ${targetUser.username} is set to ${date}`, ephemeral: true });
    } catch (error) {
      const locales = {
        'es-ES': `No se ha podido actualizar el cumpleaños`,
        'es-419': `No se ha podido actualizar el cumpleaños`,
      };
      logger.error(`Error setting birthday for user ${targetUser.id}: `, error);
      await interaction.reply({ content: locales[interaction.locale] ?? `Could not set the birthday`, ephemeral: true });
    }
  }
};