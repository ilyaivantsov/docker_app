module.exports = {
  access_token: process.env.ACCESS_TOKEN,
  spreadsheetId: process.env.SPREADSHEET_ID,
  range: "'Анкеты УЧАСТНИКОВ'!A1:AB1",
  group_id: process.env.GROUP_ID,
  administrators: process.env.ADMINISTRATORS ? process.env.ADMINISTRATORS.split(',') : ['380013488'],
  amocrm: {
    domain: process.env.AMOCRM_DOMAIN || 'iivantsov11',
    auth: {
      login: process.env.AMOCRM_AUTH_LOGIN || 'iivantsov11@gmail.com',
      hash: process.env.HASH
    },
    name: 'Анкета вк',
    tags: 'Заполнил анкету',
    pipeline_id: process.env.AMOCRM_PIPELINE_ID || 1767745
  },
  serverURL: process.env.SERVER_URL
}