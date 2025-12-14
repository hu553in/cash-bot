const TelegramBot = require("node-telegram-bot-api");
const sqlite3 = require("sqlite3").verbose();

const token = process.env.BOT_TOKEN;
if (!token) {
  console.error("Error: BOT_TOKEN is not defined!");
  process.exit(1);
}

const dbPath = process.env.DB_PATH || "db.sqlite";

const bot = new TelegramBot(token, { polling: true });

const db = new sqlite3.Database(dbPath);
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS sums (
      id INTEGER PRIMARY KEY,
      currentSum INTEGER NOT NULL,
      previousSum INTEGER NOT NULL
    )
  `);
});

function getSum(chatId, callback) {
  db.get(
    "SELECT currentSum, previousSum FROM sums WHERE id = ?",
    [chatId],
    (err, row) => {
      if (err) {
        console.error(err);
        return callback(0, 0);
      }
      if (!row) {
        db.run(
          "INSERT INTO sums (id, currentSum, previousSum) VALUES (?, ?, ?)",
          [chatId, 0, 0],
          (insertErr) => {
            if (insertErr) console.error(insertErr);
            callback(0, 0);
          }
        );
      } else {
        callback(row.currentSum, row.previousSum);
      }
    }
  );
}

function updateSum(chatId, newSum, prevSum, callback) {
  db.run(
    "UPDATE sums SET currentSum = ?, previousSum = ? WHERE id = ?",
    [newSum, prevSum, chatId],
    (err) => {
      if (err) console.error(err);
      if (callback) callback();
    }
  );
}

const keyboard = {
  reply_markup: {
    keyboard: [
      [{ text: "Undo" }],
      [{ text: "Show sum" }],
      [{ text: "Reset to 0" }],
    ],
    resize_keyboard: true,
  },
};

bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const text = (msg.text || "").trim();

  if (text === "/start" || text === "Show sum") {
    getSum(chatId, (currentSum) => {
      bot.sendMessage(chatId, `Current sum is ${currentSum}.`, keyboard);
    });
  } else if (text === "Undo") {
    getSum(chatId, (currentSum, previousSum) => {
      updateSum(chatId, previousSum, currentSum, () => {
        bot.sendMessage(
          chatId,
          `Latest operation is cancelled. Current sum is ${previousSum}.`,
          keyboard
        );
      });
    });
  } else if (text === "Reset to 0") {
    getSum(chatId, (currentSum) => {
      updateSum(chatId, 0, currentSum, () => {
        bot.sendMessage(chatId, `Sum has been reset to 0.`, keyboard);
      });
    });
  } else if (/^(\+|-)\d+$/.test(text)) {
    const amount = parseInt(text, 10);
    getSum(chatId, (currentSum) => {
      const newSum = currentSum + amount;
      updateSum(chatId, newSum, currentSum, () => {
        bot.sendMessage(
          chatId,
          `Sum changed by ${amount}. Current sum is ${newSum}.`,
          keyboard
        );
      });
    });
  } else {
    bot.sendMessage(
      chatId,
      "I don't recognize that command. Send /start, +amount, or -amount.",
      keyboard
    );
  }
});
