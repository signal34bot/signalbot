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
                    console.log("msg.text: " + msg.text);
                    rtxt = msg.text;
                    var upsidedown = rtxt.replace(/[bвbВoоaаpрxхcсeе]/g, function(l) {
                        console.log("ITERATION");
                        if (Math.round(Math.random())) return l
                        var en = "bboapxce",
                            ru = "вВоархсе",
                            s;
                        return (s = en.indexOf(l)) != -1 ? ru[s] : en[ru.indexOf(l)]
                    });
                    console.log("upsidedown: " + upsidedown);

                    var newkeywords = encodeURIComponent(upsidedown);
                    // ___
                    axios.get('https://test.signal34.ru/index.php?route=product/ajaxsearch/ajax&keyword=' + newkeywords)
                        .then(function(response) {
                            console.log(response.data);
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
                                console.log("change layout");

                                function Auto(str) {
                                    var search = new Array(
                                        "q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "\\[", "\\]",
                                        "a", "s", "d", "f", "g", "h", "j", "k", "l", ";", "'",
                                        "z", "x", "c", "v", "b", "n", "m", ",", "\\."
                                    );
                                    var replace = new Array(
                                        "й", "ц", "у", "к", "е", "н", "г", "ш", "щ", "з", "х", "ъ",
                                        "ф", "ы", "в", "а", "п", "р", "о", "л", "д", "ж", "э",
                                        "я", "ч", "с", "м", "и", "т", "ь", "б", "ю"
                                    );

                                    for (var i = 0; i < replace.length; i++) {
                                        var reg = new RegExp(replace[i], 'mig');
                                        str = str.replace(reg, function(a) {
                                            return a == a.toLowerCase() ? search[i] : search[i].toUpperCase();
                                        })
                                    }
                                    return str
                                }
                                var reversekey = Auto(rtxt);
                                console.log("reversekey");
                                // ___
                                axios.get('https://test.signal34.ru/index.php?route=product/ajaxsearch/ajax&keyword=' + reversekey)
                                    .then(function(response) {
                                        console.log(response.data);
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



        axios({
            url: `${restdb}/rest/faq-buttons/` + button,
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
            bot.sendMessage(chatid, `
                <b>${data.name}</b> \n <i>${data.text}</i>
            `, { parse_mode: "HTML" });
        });



    }



});
// ____________________________________________________