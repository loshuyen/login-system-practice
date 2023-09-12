const mysql = require('mysql2');
const keys = require('../config/keys');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: keys.mysqlPwd,
  database: 'shop_website'
});

db.connect(function (err) {
  if (err) throw err;
  console.log('DB Connected!');
});

module.exports = db;

