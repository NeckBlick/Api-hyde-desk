require('dotenv').config()
const mysql = require("mysql");
const fs = require("fs");





const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  // ssl:{
  //   rejectUnauthorized: true,
  //   ca: process.env.DB_SSL
  // }
});

module.exports = db;
