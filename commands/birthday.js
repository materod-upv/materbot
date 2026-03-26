const {
  ApplicationCommandType,
  ContextMenuCommandBuilder,
  ModalBuilder,
  MessageFlags,
  PermissionFlagsBits,
  TextInputBuilder,
  TextInputStyle,
  TextDisplayBuilder,
  LabelBuilder
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

    // Check if target user is a bot
    if (targetUser.bot) {
      const locales = {
        'es-ES': `No puedes establecer el cumpleaños de un bot`,
        'es-419': `No puedes establecer el cumpleaños de un bot`,
      };
      logger.warn(`User ${executingUser.id} tried to set the birthday of a bot ${targetUser.id}`);
      await interaction.reply({ content: locales[interaction.locale] ?? `You can't set the birthday of a bot`, flags: MessageFlags.Ephemeral });
      return;
    }

    if ((targetUser.id !== executingUser.id) && !(member.permissions.has(PermissionFlagsBits.Administrator) || member.permissions.has(PermissionFlagsBits.ManageGuild))) {
      const locales = {
        'es-ES': `No puedes establecer el cumpleaños de otra persona`,
        'es-419': `No puedes establecer el cumpleños de otra persona`,
      };
      logger.warn(`User ${executingUser.id} tried to set the birthday of another user ${targetUser.id}`);
      await interaction.reply({ content: locales[interaction.locale] ?? `You can't set the birthday of another person`, flags: MessageFlags.Ephemeral });
      return;
    }

    const localesTitle = {
      'es-ES': `Cumpleaños`,
      'es-419': `Cumpleaños`,
    }
    const modal = new ModalBuilder()
      .setCustomId(`Add Birthday:${targetUser.id}`)
      .setTitle(localesTitle[interaction.locale] ?? 'Birthday');


    if (targetUser.id !== executingUser.id) {
      const localeUsername = {
        'es-ES': `**¿Cuál es el usuario?**: \n${targetUser.username}`,
        'es-419': `**¿Cuál es el usuario?**: \n${targetUser.username}`,
      }
      const username = new TextDisplayBuilder().setContent(
        localeUsername[interaction.locale] ?? `**What is the user?**: ${targetUser.username}`
      );

      modal.addTextDisplayComponents(username);

      const inputDate = new TextInputBuilder()
        .setCustomId('dateInput')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('DD/MM/YYYY')
        .setRequired(true);

      const localesDate = {
        'es-ES': `¿Cuál es su fecha de nacimiento?`,
        'es-419': `¿Cuál es su fecha de nacimiento?`,
      }
      const labelDate = new LabelBuilder()
        .setLabel(localesDate[interaction.locale] ?? 'What is their birthday?')
        .setTextInputComponent(inputDate);

      modal.addLabelComponents(labelDate);
    } else {
      const inputDate = new TextInputBuilder()
        .setCustomId('dateInput')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('DD/MM/YYYY')
        .setRequired(true);

      const localesDate = {
        'es-ES': `¿Cuál es tu fecha de nacimiento?`,
        'es-419': `¿Cuál es tu fecha de nacimiento?`,
      }
      const labelDate = new LabelBuilder()
        .setLabel(localesDate[interaction.locale] ?? 'What is their birthday?')
        .setTextInputComponent(inputDate);

      modal.addLabelComponents(labelDate);
    }
    await interaction.showModal(modal);
  },
  async submit(interaction, params) {
    // Get target user from params
    const userId = params[0];
    let targetUser = null;
    try {
      targetUser = await interaction.client.users.fetch(userId);
    } catch (error) {
      logger.error(`Error fetching user with ID ${userId}: `, error);
      const locales = {
        'es-ES': `No se ha podido encontrar el usuario`,
        'es-419': `No se ha podido encontrar el usuario`,
      };
      await interaction.reply({ content: locales[interaction.locale] ?? `Could not find the user`, flags: MessageFlags.Ephemeral });
      return
    }

    const executingUser = interaction.user;
    const isChangingOtherUser = (targetUser.id !== executingUser.id);

    // Get date from modal input
    const date = interaction.fields.getTextInputValue('dateInput');

    // Check if the date is valid
    if (!date.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      const locales = {
        'es-ES': `La fecha introducida no es válida`,
        'es-419': `La fecha introducida no es válida`,
      };
      logger.error(`Invalid date format for user ${targetUser.id}: ${date}`);
      await interaction.reply({ content: locales[interaction.locale] ?? `Invalid date format`, flags: MessageFlags.Ephemeral });
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
    await interaction.reply({ content: locales[interaction.locale] ?? `Updating birthday...`, flags: MessageFlags.Ephemeral });

    // Set the birthday in the database
    try {
      await setUser(targetUser.id, {
        username: targetUser.username,
        birthday: birthday
      });

      // Send DM to target user if someone else changed their birthday
      if (isChangingOtherUser) {
        try {
          const dmLocales = {
            'es-ES': `**${executingUser.username}** ha cambiado tu cumpleaños.`,
            'es-419': `**${executingUser.username}** ha cambiado tu cumpleaños.`,
          };
          await targetUser.send(dmLocales[interaction.locale] ?? `**${executingUser.username}** has changed your birthday.`);
          logger.info(`Sent DM to user ${targetUser.id} about birthday change by ${executingUser.id}`);
        } catch (dmError) {
          logger.warn(`Could not send DM to user ${targetUser.id}: ${dmError.message}`);
          // Continue even if DM fails (user might have DMs disabled)
        }
      }

      // Reply user
      const locales = {
        'es-ES': `El cumpleaños de ${targetUser.username} se ha establecido en ${date}`,
        'es-419': `El cumpleaños de ${targetUser.username} se ha establecido en ${date}`,
      };
      logger.info(`Set birthday of user ${targetUser.id} to ${date}`);
      await interaction.editReply({ content: locales[interaction.locale] ?? `The birthday of ${targetUser.username} is set to ${date}` });
    } catch (error) {
      const locales = {
        'es-ES': `No se ha podido actualizar el cumpleaños`,
        'es-419': `No se ha podido actualizar el cumpleaños`,
      };
      logger.error(`Error setting birthday for user ${targetUser.id}: `, error);
      await interaction.editReply({ content: locales[interaction.locale] ?? `Could not set the birthday` });
    }
  }
};