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
// chamando um chamado unico 
  routes.get("/:id", (req, res, next) =>{
    const id_chamado = req.params.id

    const query = `SELECT * FROM chamados WHERE id_chamados = ${id_chamado}`

    db.getConnection((error, conn) =>{
        conn.query(query, (error, result) =>{
            if(error){
                return res.status(500).send({
                    error: error
                })
            }

            return res.status(200).send({
                result: result
            })
        })
    })
  })


module.exports = routes