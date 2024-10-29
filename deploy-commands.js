// deploy-commands.js
const fs = require('node:fs');
const path = require('node:path');
const { Collection, REST, Routes } = require('discord.js');
const logger = require('./logger');

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

function loadCommands() {
  let commandCollection = new Collection();

  // Loop through all the folders in the commands directory
  for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      const command = require(filePath);
      // Set a new item in the Collection with the key as the command name and the value as the exported module
      if ('data' in command && 'execute' in command) {
        commandCollection.set(command.data.name, command);
      } else {
        logger.warn(`The command at ${filePath} is missing a required "data" or "execute" property.`);
      }
    }
  }

  rest.put(Routes.applicationCommands(process.env.DISCORD_CLIENT_ID), { body: commandCollection }).then(() => {
    logger.info(`Successfully reloaded ${commandCollection.size} application (/) commands.`);
  }).catch(error => {
    logger.error(error);
  });

  return commandCollection;
}

module.exports = loadCommands;