// tts.js
const Text2Speech = require('better-node-gtts').Text2Speech;
const path = require('path');
const logger = require('../logger');

const gtts = new Text2Speech('es-es');

async function textToSpeech(text) {
  logger.debug(`Text to speech: ${text}`);

  return new Promise((resolve, reject) => {
    const audioFile = path.join(__dirname, `tmp/${Date.now()}.mp3`);

    gtts.save(audioFile, text)
      .then(() => {
        resolve(audioFile);
      }).catch((error) => {
        reject(error);
      });
  });
}

module.exports = { textToSpeech };