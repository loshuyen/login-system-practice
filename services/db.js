const mysql = require('mysql');
const keys = require('../config/keys');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: keys.mysqlPwd,
});

db.connect(function (err) {
  if (err) throw err;
  console.log('DB Connected!');
});

module.exports = db;
