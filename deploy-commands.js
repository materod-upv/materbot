// deploy-commands.js
const fs = require('node:fs');
const path = require('node:path');
const { Collection, REST, Routes } = require('discord.js');
const logger = require('./logger');

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

function loadCommands() {
  let commands = new Collection();
  let commandList = [];

  // Loop through all the folders in the commands directory
  for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
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
  }

  rest.put(Routes.applicationCommands(process.env.DISCORD_CLIENT_ID), { body: commandList }).then(() => {
    logger.info(`Successfully reloaded ${commandList.size} application (/) commands.`);
  }).catch(error => {
    logger.error(error);
  });

  return commands;
}

function loadEvents(client) {
  const eventsPath = path.join(__dirname, 'events');
  const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

  for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args));
    } else {
      client.on(event.name, (...args) => event.execute(...args));
    }
  }
}

module.exports = { loadCommands, loadEvents };