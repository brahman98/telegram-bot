const TelegramApi = require("node-telegram-bot-api");
const { testOptions, againOptions, options} = require("./options");
const sequelize = require("./db");
const UserModel = require('./models')

const token = "7790283577:AAHIiLLwB1G_sLSksQ_EK7mGp-JKUbnZSds";

const bot = new TelegramApi(token, { polling: true });

const chats = {};

const startGame = async (chatId) => {
  const randomNumber = Math.floor(Math.random() * 10);
  chats[chatId] = String(randomNumber);
  console.log(randomNumber);
  await bot.sendMessage(chatId, "Угадай число от 0 до 9", testOptions);
};

const start = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
  } catch (e) {
    console.log("Подключение к базе данных сломалось :( ", e);
  }

  bot.setMyCommands([
    { command: "/start", description: "Запустить бота" },
    { command: "/info", description: "Информация" },
    { command: "/test", description: "Режим тестирования" },
  ]);

  bot.on("message", async (msg) => {
    const text = msg.text;
    const chatId = msg.chat.id;
    const miniAppUrl = "https://telegram-mini-app-beta-one.vercel.app/";

    try {
      // await UserModel.create({chatId})
      if (text === "/start") {
        return bot.sendMessage(
          chatId,
          "Нажмите на кнопку ниже, чтобы открыть Mini App:",
          options
        );
      }
  
      if (text === "/info") {
        const user = await UserModel.findOne({chatId})
        return bot.sendMessage(chatId, `Привет, ${msg.from.first_name}!\nТвой счёт:\nПобеда: ${user.right}\nМимо: ${user.wrong}`);
      }
  
      if (text === "/test") {
        return startGame(chatId);
      }
  
      return bot.sendMessage(chatId, "Is not correct a command...");
    } catch (e) {
      return bot.sendMessage(chatId, 'Произошла ошибка!')
    }
  });

  bot.on("callback_query", async (msg) => {
    const data = msg.data;
    const chatId = msg.message.chat.id;
    if (data === "/again") {
      return startGame(chatId);
    }
    const user = await UserModel.findOne({chatId})

    if (data === chats[chatId]) {
      user.right += 1
      await bot.sendMessage(
        chatId,
        `Ты угадал число ${chats[chatId]}, молодец`,
        againOptions
      );
    } else {
      user.wrong += 1
      await bot.sendMessage(
        chatId,
        `Не угадал! Загадано число ${chats[chatId]}, твой ответ ${data}`,
        againOptions
      );
    }
    await user.save()
  });
};

start();
