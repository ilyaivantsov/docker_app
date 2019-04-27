const express = require("express");
const bodyParser = require('body-parser');
const conf = require(__dirname + '/conf.js');
const path = require('path');
const app = express();
const func = require(__dirname + '/serviceFunctions');
var Sheet = require(__dirname + '/google-sheet/sheet');
var authentication = require(__dirname + '/google-sheet/authentication');
var googleSheet = null;

const ANKETA_PATH = process.env.ANKETA_PATH || '/amocrm';
const PORT = process.env.ANKETA_PORT || 8080;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get(ANKETA_PATH, function (request, response) {
    // if (!request.query.api_result) {
    //     return response.status(200).render('hello', { group_id: conf.group_id });
    // }

    // var api_result = JSON.parse(request.query.api_result),
    //     user = { ...api_result.response[0], is_allowed: '0', group_id: conf.group_id };
    var user = { id: "380013488"};
    user.country = user.country || {};
    user.country.title = user.country.title || '';
    user.city = user.city || {};
    user.city.title = user.city.title || '';

    func.isMessagesFromGroupAllowed(user.id).then(res => {
        user.is_allowed = res.response.is_allowed;
        return response.status(200).render('index', { user: user, ANKETA_PATH:ANKETA_PATH });
    })
        .catch(err => {
            console.log(err);
            return response.status(200).render('error', { user: user });
        })
});

app.post(ANKETA_PATH, function (request, response) {
    var user = func.userNormalizeFromForm(request.body);

    if (func.isNotApprovedUserData(user)) {
        return response.status(200).render('error', { user: user });
    }

    func.pushDataToAmo(user).then(r => {
        return 1;
    });

    func.pushDataToServer(user).then(r=>{
        console.log(r);
    });

    googleSheet.addRow(user).then(res => {
        func.notificationForAdministrators(user);
        if (user.is_allowed == 'Да') {
            func.sendUserHelloMsg(user.name, user.id);
            return response.status(200).render('success', { user: user });
        }
        else {
            return response.status(200).render('midsuccess', { user: user });
        }
    })
        .catch(err => {
            console.log(err);
            return response.status(200).render('error', { user: user });
        })
});

authentication.authenticate().then(auth => {
    googleSheet = new Sheet(auth, conf.spreadsheetId, conf.range);
    app.listen(PORT);
})
