const path = require('path');
const fs = require('fs');
const Queue = require('better-queue');
const { AudioPlayerStatus,
  createAudioPlayer,
  createAudioResource,
  demuxProbe,
  joinVoiceChannel,
  getVoiceConnection,
  getVoiceConnections,
  NoSubscriberBehavior,
  VoiceConnectionStatus } = require('@discordjs/voice');
const { deleteFile } = require('./cleanTmpFiles');
const logger = require('../logger');

// Queue time limit
const MAX_QUEUE_TIME = 300000;

async function processTask(task, cb) {
  logger.debug(`Playing sound ${task.soundFile} in channel ${task.voiceChannel.name}`);

  // Join voice channel
  const connection = joinVoiceChannel({
    channelId: task.voiceChannel.id,
    guildId: task.voiceChannel.guild.id,
    adapterCreator: task.voiceChannel.guild.voiceAdapterCreator
  });

  // Create audio player
  const player = createAudioPlayer({
    behaviors: {
      noSubscriber: NoSubscriberBehavior.Pause,
    },
  });

  player.on('stateChange', (oldState, newState) => {
    if (newState.status === AudioPlayerStatus.Idle) {
      logger.debug(`Finished playing sound ${task.soundFile} in channel ${task.voiceChannel.name}`);
      cb();
    }
  });

  player.on('error', error => {
    logger.error(`Error: ${error.message} with resource ${error.resource.metadata.title}`);
    cb(error);
  });

  // Create audio resource
  const readStream = fs.createReadStream(task.soundFile);
  const resource = createAudioResource(readStream);

  // Play audio
  player.play(resource);
  connection.subscribe(player);
}

function filterTask(task, cb) {
  // Remove old tasks
  const now = Date.now();
  if (now - task.timestamp > MAX_QUEUE_TIME) {
    logger.debug(`Task ${task.soundFile} is too old, removing from queue in channel ${task.voiceChannel.name}`);
    cb('Time out');
  } else {
    cb(null, task);
  }
}

function orderTask(task, cb) {
  // Order task by channel to avoid changing channels
  return cb(null, task.voiceChannel.id);
}

function clearConnections() {
  // Clean connection
  const pendingConnections = getVoiceConnections().values();
  for (const con of pendingConnections) {
    con.destroy();
  }
}

class VoicePlayer {
  constructor() {
    if (VoicePlayer.instance) {
      return VoicePlayer.instance;
    }

    // Create sound event queue
    this.eventQueue = new Queue(processTask, {
      filter: filterTask,
      order: orderTask,
      maxTimeout: MAX_QUEUE_TIME
    });
    this.eventQueue.on('empty', clearConnections);
    this.eventQueue.on('drain', clearConnections);

    VoicePlayer.instance = this;
  }

  playSound(voiceChannel, soundFile, removeAfterPlay = false) {
    var audioTask = {
      timestamp: Date.now(),
      voiceChannel: voiceChannel,
      soundFile: soundFile,
      removeAfterPlay: removeAfterPlay
    }

    this.eventQueue.push(audioTask).on('finish', (result) => {
      logger.debug(`Finished playing sound ${soundFile} in channel ${voiceChannel.name}`);
      if (removeAfterPlay) {
        deleteFile(soundFile);
      }
    }).on('failed', (error) => {
      logger.error(`Error playing sound ${soundFile} in channel ${voiceChannel.name}: ${error}`);
      if (removeAfterPlay) {
        deleteFile(soundFile);
      }
    });

    logger.debug(`Added sound ${soundFile} to queue in channel ${voiceChannel.name}`);
  }
}

const instance = new VoicePlayer();
Object.freeze(instance);

module.exports = instance;