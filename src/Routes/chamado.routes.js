const express = require("express")
const db = require("../../conexao")

const routes = express.Router()
//criando um get para o chamados
routes.get("/", (req, res, next) => {
    db.getConnection((error, conn) => {

      conn.query(
        "SELECT * FROM chamados",
  
        (error, result, field) => {
          conn.resume();
  
          if (error) {
            res.status(500).send({
              error: error,
              response: null,
            });
          }
          res.status(200).send(result);
        }
      );
    });
  });


module.exports = routes