const conf = require(__dirname + '/conf.js');
const VkBot = require('node-vk-bot-api');
const Markup = require('node-vk-bot-api/lib/markup');
const bot = new VkBot(conf.access_token);
const AmoCRM = require('amocrm-js');
const axios = require('axios');

function notificationForAdministrators(user) {
    var msg = `Новая анкета:
[id${user.id}|${user.name} ${user.surname}]
${user.options}
${user.phone}

https://vk.com/gim${conf.group_id}?sel=${user.id}`;
    if (user.is_allowed == 'Нет') {
        msg = msg + `
Пользователь не разрешил отправлять сообщения!`;
    }
    conf.administrators.forEach(id => {
        bot.sendMessage(id, msg);
    });
}

function userNormalizeFromForm(reqBody) {
    var user = { ...reqBody };
    var date = new Date();
    date = new Date(date.getTime() + (3600000 * 3));
    var min = date.getMinutes();
    min = min / 10 >> 0 == 0 ? '0' + min : min;
    user.dateOfCommit = `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()} ${date.getHours()}:${min}`;
    user.is_allowed = user.allowed == '1' ? 'Да' : 'Нет';
    user.id = +user.id;
    return user;
}

function isNotApprovedUserData(user) {
    return !(user.date && user.phone && user.markTS && user.modelTS && user.options && user.name && user.surname && user.link);
}

function sendUserHelloMsg(user_name, user_id) {
    var keyboard = Markup
        .keyboard([
            [
                Markup.button('Узнать подробнее', 'primary')
            ],
        ]).oneTime();
    var msg = `${user_name}, привет!
Благодарю тебя за интерес к ТУРНИРУ ДАЛЬНОБОЙЩИКОВ!

Я Штурман 😀 - твой электронный помощник. Буду помогать тебе тут осваиваться!

Чтобы продолжить, нажми на кнопку «Узнать подробнее».`;

    bot.sendMessage(user_id, msg, null/*, keyboard*/);
}

function _amocrm_get_contact(user, store) {
    var arr = [{
        name: user.name + ' ' + user.surname,
        custom_fields: [{
            id: store['Телефон'].id,
            values: [
                {
                    value: user.phone,
                    enum: store['Телефон'].enums['MOB']
                }
            ]
        },
        {
            id: store['Возраст'].id,
            values: [
                {
                    value: user.age
                }
            ]
        },
        {
            id: store['Город'].id,
            values: [
                {
                    value: user.city
                }
            ]
        },
        {
            id: store['Стаж профессионального вождения'].id,
            values: [{
                value: user.experience
            }]
        },
        {
            id: store['Средний пробег за месяц'].id,
            values: [{
                value: user.mileage
            }]
        },
        {
            id: store['Марка ТС'].id,
            values: [
                {
                    value: user.markTS
                }
            ]
        },
        {
            id: store['Модель ТС'].id,
            values: [
                {
                    value: user.modelTS
                }
            ]
        },
        {
            id: store['Год выпуска ТС'].id,
            values: [
                {
                    value: user.yearTS
                }
            ]
        },
        {
            id: store['Планируемая дата присоединения'].id,
            values: [
                {
                    value: user.date
                }
            ]
        },
        {
            id: store['Юзернейм'].id,
            values: [
                {
                    value: user.nickname
                }
            ]
        },
        {
            id: store['Vkontakte'].id,
            values: [
                {
                    value: user.link
                }
            ]
        },
        {
            id: store['Квалификация'].id,
            values: [{
                value: store['Квалификация'].enums[user.options]
            }]
        },
        {
            id: store['Можно писать от группы'].id,
            values: [{
                value: store['Можно писать от группы'].enums[user.is_allowed]
            }]
        }
        ]
    }]

    return arr;
}

async function pushDataToAmo(user) {
    const crm = new AmoCRM(conf.amocrm);
    crm.connect();
    crm.on('connection:connected', function () {
        (async () => {
            var data = await crm.request.get('/api/v2/account', { with: 'custom_fields,pipelines' });
            var arr = Object.values(data._embedded.custom_fields.contacts),
                pipelines_arr = Object.values(data._embedded.pipelines),
                store = { pipelines: {} };
            arr.forEach(fields => {
                store[fields.name] = {};
                store[fields.name].id = fields.id;
                if (fields.enums) {
                    var obj = fields.enums;
                    store[fields.name].enums = {};
                    for (key in obj) {
                        store[fields.name].enums[obj[key]] = key;
                    }
                }
            });
            pipelines_arr.forEach(fields => {
                store.pipelines[fields.name] = fields.id;
            });
            var contact = await crm.Contact.insert(_amocrm_get_contact(user, store));
            var contact_id = contact._response._embedded.items[0].id;
            var lead = await crm.Lead.insert([
                {
                    name: conf.name,
                    tags: conf.tags,
                    pipeline_id: conf.pipeline_id,
                    contacts_id: [contact_id]
                }
            ]);
            return lead;
        })();
    });
    return "OK";
}

async function isMessagesFromGroupAllowed(userId) {
    return bot.api('messages.isMessagesFromGroupAllowed', { access_token: conf.access_token, group_id: conf.group_id, user_id: userId });
}

async function pushDataToServer(user) {
    var res = await axios.post(conf.serverURL, user, {
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Postman-Token': 'aa1181c3-94fb-48a7-86dc-b87b68749c95',
            'cache-control': 'no-cache'
        }
    });
    
    return res.status;
}

module.exports = {
    notificationForAdministrators: notificationForAdministrators,
    userNormalizeFromForm: userNormalizeFromForm,
    isNotApprovedUserData: isNotApprovedUserData,
    sendUserHelloMsg: sendUserHelloMsg,
    pushDataToAmo: pushDataToAmo,
    isMessagesFromGroupAllowed: isMessagesFromGroupAllowed,
    pushDataToServer: pushDataToServer
}