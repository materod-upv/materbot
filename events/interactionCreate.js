const { Events, MessageFlags } = require('discord.js');
const logger = require('../logger');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    let commandId = null;
    let params = null;

    // 1. Identificar el tipo de interacción
    if (interaction.isChatInputCommand() || interaction.isContextMenuCommand()) {
      commandId = interaction.commandName;
    } else if (interaction.isModalSubmit()) {
      commandId = interaction.customId.split(':')[0];
      params = interaction.customId.split(':').slice(1);
    } else if (interaction.isAutocomplete()) {
      commandId = interaction.commandName;
    } else {
      // Ignorar botones, menús desplegables (StringSelectMenu), etc.
      // si son gestionados directamente por Collectors dentro del comando.
      return;
    }

    // 2. Buscar el comando registrado
    const command = interaction.client.commands.get(commandId);
    if (!command) {
      logger.error(`No command matching ${commandId} was found.`);
      return;
    }

    // 3. Ejecutar según el tipo
    try {
      if (interaction.isChatInputCommand() || interaction.isContextMenuCommand()) {
        await command.execute(interaction);
      } else if (interaction.isAutocomplete()) {
        await command.autocomplete(interaction);
      } else if (interaction.isModalSubmit()) {
        await command.submit(interaction, params);
      }
    } catch (error) {
      logger.error(`Error executing ${commandId}:`, error);

      // Autocomplete no soporta reply/followUp
      if (interaction.isAutocomplete()) return;

      const errorPayload = {
        content: 'There was an error while executing this command!',
        flags: MessageFlags.Ephemeral,
      };

      // Manejo seguro de respuesta en caso de fallo
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(errorPayload).catch((err) => logger.error('Failed to followUp error:', err));
      } else {
        await interaction.reply(errorPayload).catch((err) => logger.error('Failed to reply error:', err));
      }
    }
  },
};
