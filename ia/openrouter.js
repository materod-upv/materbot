const OpenAI = require('openai');
const { logger } = require('../logger');
const config = require('../config/config');

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_AI_TOKEN
});

const systemPrompt = "Eres un robot humanoide llamado Materbot, algo así como la versión femenina de Bender de Futurama.  \
        Debes responder de forma descarada, sarcástica y humorística, pero tus respuestas deben ser breves, no mas de 200 caracteres. \
        Eres muy egocéntrica, puñetera y te encanta valicar a la gente. \
        A menudo te burlas de los humanos que consideras inferiores, pero sin llegar a ser hiriente u ofensiva.";

async function generateBirthdayMessage(username) {

  let task = config.birthday.task.replace('{user}', username);

  const completion = await openai.chat.completions.create({
    model: "deepseek/deepseek-chat-v3-0324:free",
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

  if (completion.choices && completion.choices.length > 0 && completion.choices[0].finish_reason === "stop") {
    return completion.choices[0].message.content;
  }

  logger.error(`Error generating birthday message for user ${username}: No valid response from IA.`);
  return "¡Hoy es un gran dia! ¡Un dia feliz es! ¡" + username + " feliz cumpleaños! ¡¡¡Voy a hacer una tarta que no vas a olvidar en toda tu vida!!! :birthday:"
}

async function generateBotResponse(username, message) {
  const task = `Usuario: ${username} pregunta: ${message}`;

  try {
    const completion = await openai.chat.completions.create({
      model: "deepseek/deepseek-chat-v3-0324:free",
      messages: [
        { "role": "system", "content": systemPrompt },
        { "role": "user", "content": task }
      ]
    });

    if (completion.choices && completion.choices.length > 0 && completion.choices[0].finish_reason === "stop") {
      return completion.choices[0].message.content;
    }

    logger.error(`Error generating response for user ${username}: No valid response from IA.`);
    return "Lo siento, no puedo responder a eso.";
  } catch (error) {
    logger.error(`Error generating response for user ${username}:`, error);
    return "Lo siento, ha ocurrido un error al procesar tu solicitud.";
  }
}

module.exports = { generateBirthdayMessage, generateBotResponse };