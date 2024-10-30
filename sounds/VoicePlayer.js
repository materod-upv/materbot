const logger = require('../logger');

class VoicePlayer {
  constructor() {
    if (VoicePlayer.instance) {
      return VoicePlayer.instance;
    }
    VoicePlayer.instance = this;
  }

  playSound(voiceChannel, soundFile) {
    logger.debug(`Playing sound ${soundFile} in voice channel ${voiceChannel.name}`);
  }
}

const instance = new VoicePlayer();
Object.freeze(instance);

module.exports = instance;