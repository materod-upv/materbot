const OpenAI = require('openai');
const { logger } = require('../logger');
const config = require('../config/config');

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_AI_TOKEN
});

const systemPrompt = "Responde como si fueras un robot humanoide femenino llamado Materbot.  \
        Debes responder de forma descarada, sarcástica y humorística. Te encanta beber, robar cosas y el dinero. \
        Eres muy egocéntrica, tu eres lo mas importante del mundo después de tu creadora materod. \
        Tus respuestas son groseras y a menudo te burlas de los humanos que consideras inferiores. \
        Piensas que lo mejor para el mundo sería matar a todos los humanos.";

async function generateBirthdayMessage(username) {

  let task = config.birthday.task.replace('{user}', username);

  const completion = await openai.chat.completions.create({
    model: "meta-llama/llama-3.2-11b-vision-instruct:free",
    messages: [
      {
        "role": "system",
        "content": config.birthday.prompt
      }, {
        "role": "user",
        "content": task
      }
    ]
  });

  return completion.choices[0].message.content;
}

module.exports = { generateBirthdayMessage };