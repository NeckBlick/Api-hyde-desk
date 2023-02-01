const mysql = require("mysql");

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "42035843",
  database: "hyde_desk",
});

module.exports = db;
