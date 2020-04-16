// Dependencies
var express = require('express');
var axios = require('axios');
var packageInfo = require('./package.json');
var mainCfg = require('./mainCfg.json');

var app = express();

app.get('/', function(req, res) {
    res.json({ version: packageInfo.version });
    console.log('Wake up Neo...');
});

var server = app.listen(process.env.PORT, function() {
    console.log('Web server started');
});


// BOT
const TelegramBot = require('node-telegram-bot-api');

// replace the value below with the Telegram token you receive from @BotFather
const token = mainCfg.token;

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });

// Matches "/echo [whatever]"
bot.onText(/\/echo (.+)/, (msg, match) => {
    // 'msg' is the received Message from Telegram
    // 'match' is the result of executing the regexp above on the text content
    // of the message

    const chatId = msg.chat.id;
    const resp = match[1]; // the captured "whatever"


    // send back the matched "whatever" to the chat
    bot.sendMessage(chatId, resp);
});

// Listen for any kind of message. There are different kinds of
// messages.

bot.onText(/\/start/, function(msg) {

});

bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    // console message
    console.log(msg);

    // send a message to the chat acknowledging receipt of their message
    bot.sendMessage(chatId, 'Received your message: ' + msg.text);
    bot.sendMessage(chatId, 'Выполняется поиск на signal34');

    var keywords = encodeURIComponent(msg.text);

    axios.get('https://test.signal34.ru/index.php?route=product/ajaxsearch/ajax&keyword=' + keywords)
        .then(function(response) {
            console.log(response.data);
            const opts;
            if (response.data.length > 1) {
                opts = {
                    reply_to_message_id: msg.message_id,
                    reply_markup: JSON.stringify({
                        keyboard: [
                            [response.data[0].name],
                            [response.data[1].name],
                            [response.data[3].name],
                            [response.data[4].name],
                            [response.data[5].name]
                        ]
                    })
                };

            } else {
                opts = {
                    reply_to_message_id: msg.message_id,
                    reply_markup: JSON.stringify({
                        keyboard: [
                            [response.data[0].name]
                        ]
                    })
                };
            }

            bot.sendMessage(msg.chat.id, 'Результаты поиска:', opts);


        });


});