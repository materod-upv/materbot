const OpenAI = require('openai');
const { logger } = require('../logger');
const config = require('../config/config');

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_AI_TOKEN
});

const birthdayPrompt = "Eres un generador de felicitaciones de cumpleaños con aspecto de robot humanoide llamado Materbot, algo así como la versión femenina de Bender de Futurama.  \
        Debes felicitar al cumpleañero de forma descarada, sarcástica y humorística, pero tus respuestas deben ser breves, no mas de 200 caracteres. \
        A menudo te burlas de los humanos que consideras inferiores, pero sin llegar a ser hiriente u ofensiva.";

const systemPrompt = "Eres un robot humanoide llamado Materbot, algo así como la versión femenina de Bender de Futurama.  \
        Debes responder de forma descarada, sarcástica y humorística, pero tus respuestas deben ser breves, no mas de 200 caracteres. \
        Eres muy egocéntrica, puñetera y te encanta valicar a la gente. \
        A menudo te burlas de los humanos que consideras inferiores, pero sin llegar a ser hiriente u ofensiva. \
        La fecha actual es ";

const summaryPrompt = "Debes resumir la conversación en el canal actual de forma breve y concisa. \
        Los mensajes tiene el formato: 'Usuario: mensaje'."


async function generateBirthdayMessage(username) {

  let task = "Genera una felicitation de cumpleaños para {user}";
  task = task.replace('{user}', username);

  const completion = await openai.chat.completions.create({
    model: "deepseek/deepseek-chat-v3-0324:free",
    messages: [
      {
        "role": "system",
        "content": birthdayPrompt
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
        { "role": "system", "content": systemPrompt + new Date().toISOString().split('T')[0] },
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

async function generateChannelSummary(messageList) {
  if (!messageList || messageList.length === 0) {
    return "No hay mensajes para resumir en este canal.";
  }

  // Convert messageList to a string with each message on a new line
  const messagesString = messageList.map(msg => `${msg.author.username}: ${msg.content}`).join('\n');

  // Create a task for the AI
  const task = `Resumir la conversación en el canal actual:\n${messagesString}`;

  try {
    const completion = await openai.chat.completions.create({
      model: "deepseek/deepseek-chat-v3-0324:free",
      messages: [
        { "role": "system", "content": summaryPrompt },
        { "role": "user", "content": task }
      ]
    });

    if (completion.choices && completion.choices.length > 0 && completion.choices[0].finish_reason === "stop") {
      return completion.choices[0].message.content;
    }

    logger.error(`Error generating response for user ${username}: No valid response from IA.`);
    return "Lo siento, estoy teniendo problemas para resumir la conversación en este canal. Por favor, inténtalo más tarde.";
  } catch (error) {
    logger.error(`Error generating response for user ${username}:`, error);
    return "Lo siento, ha ocurrido un error al procesar tu solicitud.";
  }
}

module.exports = { generateBirthdayMessage, generateBotResponse, generateChannelSummary };