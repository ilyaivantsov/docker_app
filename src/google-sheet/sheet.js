var { google } = require('googleapis');

class Sheet {
    constructor(auth,spreadsheetId, range) {
        this.spreadsheetId = spreadsheetId;
        this.range = range;
        this.auth = auth;
        this.sheet = google.sheets({ version: 'v4', auth: auth });
    }
    addRow(data) {
        var W = this;
        return new Promise(function (resolve, reject) {
            W.sheet.spreadsheets.values.append({
                auth: W.auth,
                spreadsheetId: W.spreadsheetId,
                range: W.range,
                valueInputOption: "USER_ENTERED",
                resource: {
                    values: [W.data2Arr(data)]
                }
            }, (err, response) => {
                if (err) {
                    reject(new Error(err));
                } else {
                    resolve(response.status);
                }
            })
        }
        )

    }
    data2Arr(data) {
        var data = ['','',data.id,data.dateOfCommit,'','','',data.is_allowed,'','','В работу','',data.nickname,data.mileage,data.date,data.name,data.surname,'',data.phone,data.age,data.city,data.markTS,data.modelTS,data.yearTS,data.experience,'',data.options,data.link];
        return data;
    }
};

module.exports = Sheet;