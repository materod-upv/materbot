const fs = require('fs');
const Queue = require('better-queue');
const { AudioPlayerStatus,
  createAudioPlayer,
  createAudioResource,
  joinVoiceChannel,
  getVoiceConnections,
  NoSubscriberBehavior,
  VoiceConnectionStatus,
  entersState } = require('@discordjs/voice');
const { deleteFile } = require('./cleanTmpFiles');
const logger = require('../logger');

// Queue time limit
const MAX_QUEUE_TIME = 300000;

async function processTask(task, cb) {
  logger.debug(`Playing sound ${task.soundFile} in channel ${task.voiceChannel.name}`);

  // Check if voice channel is empty
  if (task.voiceChannel.members.size === 0) {
    logger.debug(`Voice channel ${task.voiceChannel.name} is empty, skipping sound ${task.soundFile}`);
    cb();
    return;
  }

  // Join voice channel
  const connection = joinVoiceChannel({
    channelId: task.voiceChannel.id,
    guildId: task.voiceChannel.guild.id,
    adapterCreator: task.voiceChannel.guild.voiceAdapterCreator
  });

  // Handle connection disconnects
  connection.on(VoiceConnectionStatus.Disconnected, async () => {
    try {
      await Promise.race([
        entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
        entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
      ]);
      // Seems to be reconnecting to a new channel - ignore disconnect
    } catch {
      // Seems to be a real disconnect which SHOULDN'T be recovered from
      connection.destroy();
      cb(new Error('Disconnected from voice channel'));
    }
  });

  // Timeout for connection
  const connectionTimeout = setTimeout(() => {
    logger.error(`Connection timeout for ${task.voiceChannel.name}`);
    connection.destroy();
    cb(new Error('Connection timeout'));
  }, 30_000);

  // Wait for connection to be ready
  connection.on(VoiceConnectionStatus.Ready, () => {
    clearTimeout(connectionTimeout);
    logger.debug(`Connection ready for ${task.voiceChannel.name}, playing sound`);

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
      logger.error(`Error: ${error.message} with resource ${error.resource?.metadata?.title || 'unknown'}`);
      cb(error);
    });

    // Create audio resource
    const resource = createAudioResource(task.soundFile, {
      inlineVolume: true
    });

    // Subscribe connection to player
    const subscription = connection.subscribe(player);

    if (!subscription) {
      logger.error('Failed to subscribe to audio player - connection may be destroyed');
      cb(new Error('Failed to subscribe'));
      return;
    }

    // Play audio
    player.play(resource);
  });
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