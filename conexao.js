const mysql = require("mysql");

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  port: 3307,
  database: "hyde_desk",
});

module.exports = db;
