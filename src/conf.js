module.exports = {
    access_token: process.env.ACCESS_TOKEN,
    spreadsheetId: process.env.SPREADSHEET_ID,
    range: "'Анкеты УЧАСТНИКОВ'!A1:AB1",
    group_id: 142840734,
    administrators: [
      '380013488'
    ],
    amocrm: {
      domain: 'iivantsov11',
      auth: {
        login: 'iivantsov11@gmail.com',
        hash: process.env.HASH
      },
      name: 'Анкета вк',
      tags: 'Заполнил анкету',
      pipeline_id: 1767745
    },
    serverURL: process.env.SERVER_URL
  }