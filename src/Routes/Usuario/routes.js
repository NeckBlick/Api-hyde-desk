const express = require("express")

const routes = express.Router()
const db = require("../../conexao")


routes.get("/",  (req, res) => {
    // Pegar dados do formulario
    let query = "SELECT * FROM tecnico"
    db.query(query, (rows, err) => {
        if(err){
            console.log(err)
        }
        return res.send("Foi")
        
    })


})

module.exports = routes