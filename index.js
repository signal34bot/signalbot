// Dependencies
var express = require('express');
var axios = require('axios');
var packageInfo = require('./package.json');


const config = require('./serverconfig');
const { main: { host, port, restdb }, token: { tgtoken, restdbtoken, xpb, blck } } = config;

// replace the value below with the Telegram token you receive from @BotFather
const TELTOKEN = tgtoken;
// restdb.io token
const axiostoken = restdbtoken;

// ____________________________________________________
// Будим инстанс на HEROKU
var app = express();
app.get('/', function(req, res) {
    res.json({ version: packageInfo.version });
    console.log('Wake up Neo...');
});
var server = app.listen(process.env.PORT, function() {
    console.log('Web server started');
});
// ____________________________________________________

// ____________________________________________________
// BOT
const TelegramBot = require('node-telegram-bot-api');
// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(TELTOKEN, { polling: true });

bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    // console message
    // console.log(msg);
    // проверяем сообщение на наличие команды /start
    if (msg.text !== '/start') {
        bot.sendMessage(chatId, 'Выполняется поиск на signal34');
        var keywords = encodeURIComponent(msg.text);
        console.log('search: ' + keywords);

        axios.get('https://test.signal34.ru/index.php?route=product/ajaxsearch/ajax&keyword=' + keywords)
            .then(function(response) {
                // console.log(response.data);
                var data = response.data;
                data = data.map(function(a) {
                    return [{ text: `${a.name}`, callback_data: `productbutton_` + msg.chat.id + `_` + a.product_id }]
                });
                // console.log(data.length);
                if (data.length !== 0) {
                    // Формируем меню
                    var options = {
                        reply_markup: JSON.stringify({
                            inline_keyboard: data
                        })
                    };

                    bot.sendMessage(msg.chat.id, 'Результаты поиска:', options);
                } else {

                    var upsidedown = keywords.replace(/[oоaаpрxхcсeе]/g, function(l) {
                        if (Math.round(Math.random())) return l
                        var en = "oapxce",
                            ru = "оархсе",
                            s;
                        return (s = en.indexOf(l)) != -1 ? ru[s] : en[ru.indexOf(l)]
                    });
                    // ___

                    axios.get('https://test.signal34.ru/index.php?route=product/ajaxsearch/ajax&keyword=' + upsidedown)
                        .then(function(response) {
                            // console.log(response.data);
                            var data = response.data;
                            data = data.map(function(a) {
                                return [{ text: `${a.name}`, callback_data: `productbutton_` + msg.chat.id + `_` + a.product_id }]
                            });
                            // console.log(data.length);
                            if (data.length !== 0) {
                                // Формируем меню
                                var options = {
                                    reply_markup: JSON.stringify({
                                        inline_keyboard: data
                                    })
                                };

                                bot.sendMessage(msg.chat.id, 'Результаты поиска:', options);
                            }

                        });

                    // ___
                }

            });
    } else {
        // bot.sendMessage(msg.chat.id, "Добро пожаловать! Введите в чат интересующий вас товар - и мы выполним поиск по сайту.");




        const opts = {
            reply_markup: {
                inline_keyboard: [
                    [{
                            text: 'Часто задаваемые вопросы',
                            callback_data: 'faqbutton_' + msg.chat.id
                        },
                        {
                            text: 'Перейти на сайт',
                            callback_data: 'sitebutton_' + msg.chat.id
                        }
                    ]
                ]
            }
        };
        bot.sendMessage(msg.chat.id, 'Добро пожаловать! Введите в чат интересующий вас товар - и мы выполним поиск по сайту.', opts);






    }
});
// ____________________________________________________

// ____________________________________________________
// Нажатие на кнопку
bot.on('callback_query', function(msg) {
    // Получение значения кнопки (состоит из префикса с типом кнопки и ID)
    var answer = msg.data.split('_');
    var typeofbtn = answer[0];
    var chatid = answer[1];
    var button = answer[2];
    console.log('typeofbtn');
    console.log(typeofbtn);
    console.log('chatid1');
    console.log(chatid);

    // Проверяем тип кнопки

    if (typeofbtn == "productbutton") {
        // console.log(button);
        axios.get('https://test.signal34.ru/index.php?route=product/product/getProductAjax&productid=' + button)
            .then(function(response) {
                // console.log(response.data);
                bot.sendMessage(chatid, `
                    <b>${response.data.name}</b>
                    <i>Цена: ${response.data.price}</i>
                    <i>Наличие на складе: ${response.data.stock_status}</i>
                    <a href=\"${response.data.producturl}\">Просмотреть товар на сайте</a>
                `, { parse_mode: "HTML" });

            });
    }

    if (typeofbtn == "faqbutton") {
        // получаем список кнопок из бд
        axios({
            url: `${restdb}/rest/faq-buttons`,
            method: "get",
            headers: {
                "content-type": "application/json",
                "x-apikey": axiostoken,
                "cache-control": "no-cache"
            }
        }).then(function(response) {
            console.log(response.data);
            // _id, name, text
            var data = response.data;
            data = data.map(function(a) {
                return [{ text: `${a.name}`, callback_data: `faqquestion_` + chatid + `_` + a._id }]
            });
            // console.log(data.length);
            if (data.length !== 0) {
                // Формируем меню
                var options = {
                    reply_markup: JSON.stringify({
                        inline_keyboard: data
                    })
                };
                console.log('chatid');
                console.log(chatid);
                bot.sendMessage(chatid, 'Ответы на часто задаваемые вопросы:', options);
            }
        });
    }

    if (typeofbtn == "faqquestion") {

        console.log('faqquestion:');

    }



});
// ____________________________________________________