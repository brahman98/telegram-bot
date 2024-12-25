const TelegramApi = require("node-telegram-bot-api");
const { testOptions, againOptions} = require('./options')
const token = "7790283577:AAHIiLLwB1G_sLSksQ_EK7mGp-JKUbnZSds";

const bot = new TelegramApi(token, { polling: true });

const chats = {}

const startGame = async (chatId) => {
  const randomNumber = Math.floor(Math.random() * 10)
  chats[chatId] = String(randomNumber)
  console.log(randomNumber)
  await bot.sendMessage(chatId, "Угадай число от 0 до 9", testOptions)
}

const start = () => {
  bot.setMyCommands([
    { command: "/start", description: "Запустить бота" },
    { command: "/info", description: "Информация" },
    { command: "/test", description: "Режим тестирования" },
  ]);

  bot.on("message", async (msg) => {
    const text = msg.text;
    const chatId = msg.chat.id;
    const miniAppUrl = "https://telegram-mini-app-beta-one.vercel.app/";

    // Создание кнопки для открытия Mini App
    const options = {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Открыть Mini App",
              web_app: { url: miniAppUrl },
            },
          ],
        ],
      },
    };

    if (text === "/start") {
      return bot.sendMessage(chatId, "Нажмите на кнопку ниже, чтобы открыть Mini App:", options);
    }

    if (text === "/info") {
      return bot.sendMessage(chatId, "information will be here some later...")
    }

    if (text === "/test") {
      return startGame(chatId)
    }
    
    return bot.sendMessage(chatId, "Is not correct a command...")

  });

  bot.on('callback_query', async msg => {
    const data = msg.data
    const chatId = msg.message.chat.id
    if (data === '/again') {
      return startGame(chatId)
    }
    if (data === chats[chatId]) {
      return bot.sendMessage(chatId, `Ты угадал число ${chats[chatId]}, молодец`, againOptions)
    } else {
      return bot.sendMessage(chatId, `Не угадал! Загадано число ${chats[chatId]}, твой ответ ${data}`, againOptions)
    }
  })
};

start();
