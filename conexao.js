require('dotenv').config()
const mysql = require("mysql");
const fs = require("fs");


const serverca = fs.readFileSync('./DigiCertGlobalRootCA.crt.pem', "utf8");


const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
<<<<<<< HEAD
  database: process.env.DB_NAME,
  ssl:{
    rejectUnauthorized: true,
    ca: serverca
  }
=======
  database: process.env.DB_DATABASE
>>>>>>> 958c9ad46dc4f1ddfab875132015d4bd6f1fdcd1
});

module.exports = db;
