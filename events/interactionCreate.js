const { Events, MessageFlags } = require('discord.js');
const logger = require('../logger');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    let commandId = interaction.commandName;
    let params = null;
    if (interaction.isModalSubmit()) {
      commandId = interaction.customId.split(':')[0]; // Extract command ID from customId
      params = interaction.customId.split(':').slice(1); // Extract parameters from customId if needed
    }

    const command = interaction.client.commands.get(commandId);
    if (!command) {
      logger.error(`No command matching ${commandId} was found.`);
      return;
    }

    try {
      if (interaction.isChatInputCommand() || interaction.isContextMenuCommand()) {
        // Chat input command
        await command.execute(interaction);
      } else if (interaction.isAutocomplete()) {
        // Autocomplete command
        await command.autocomplete(interaction);
      } else if (interaction.isModalSubmit()) {
        // Modal submit command
        await command.submit(interaction, params);
      }
    } catch (error) {
      logger.error(error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
      } else {
        await interaction.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
      }
    }
  },
};
