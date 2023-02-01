const mysql =  require("mysql")

const db = mysql.createPool({
    host:"localhost",
    user: "root",
    password:"",
    database: "hyde_desk"
})

module.exports = db