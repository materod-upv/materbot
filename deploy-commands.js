// deploy-commands.js
const fs = require('fs');
const path = require('path');
const { Collection, REST, Routes } = require('discord.js');
const logger = require('./logger');

const commandsPath = path.join(__dirname, 'commands');

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

function loadCommands(client) {
  let commands = new Collection();
  let commandList = [];

  // Loop through all the folders in the commands directory
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    // Set a new item in the Collection with the key as the command name and the value as the exported module
    if ('data' in command && 'execute' in command) {
      commands.set(command.data.name, command);
      commandList.push(command.data.toJSON());
    } else {
      logger.warn(`The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
  }

  client.commands = commands;

  // Register commands globally in Discord (It could take up to 1 hour to update)
  /*rest.put(Routes.applicationCommands(process.env.DISCORD_CLIENT_ID), { body: commandList })
    .then(() => {
      logger.info(`Successfully reloaded ${commandList.length} application (/) commands.`);
    })
    .catch((error) => {
      logger.error(`Error reloading application (/) commands: ${error.message}`);
    });*/

  // Register commands in each guild (For dev-porpouses)
  client.guilds.cache.map((guild) => {
    rest.put(Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID, guild.id), { body: commandList })
      .then(() => {
        logger.info(`Successfully reloaded ${commandList.length} guild (/) commands in guild ${guild.id}.`);
      })
      .catch((error) => {
        logger.error(`Error reloading guild (/) commands in guild ${guild.id}: ${error.message}`);
      });
  });

  return commands;
}


function deleteCommands(client) {
  // Delete all guild commands
  client.guilds.cache.map((guild) => {
    rest.put(Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID, guild.id), { body: [] })
      .then(() => {
        logger.debug(`Deleted all commands in guild ${guild.id}`);
      })
      .catch((error) => {
        logger.error(`Error deleting commands: ${error.message}`);
      });
  });

  // Delete all global commands
  rest.put(Routes.applicationCommands(process.env.DISCORD_CLIENT_ID), { body: [] })
    .then(() => {
      logger.debug('Deleted all global commands');
    })
    .catch((error) => {
      logger.error(`Error deleting commands: ${error.message}`);
    });
}

module.exports = { loadCommands, deleteCommands };