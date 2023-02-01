const express = require("express");

const routes = express.Router();
const db = require("../../conexao");

routes.get("/", (req, res) => {
  // Faz a conexão com o banco de dados
  // error -> se houver erro
  // conn -> a conexão com o banco
  db.getConnection((error, conn) => {
    // Se houver um erro com a conexão retorna um erro
    if (error) {
      console.log(error);
      return res.status(400).send({ message: "Houve erro" });
    }

    // Pegar dados do formulário
    let query = "SELECT * FROM tecnico";

    // Faz a consulta no banco de dados passando a query acima
    // result -> resultado da query
    // fields -> os campos que acessou na tabela
    conn.query(query, (error, result, fields) => {
      // Fecha a conexão para ela não ficar aberta e dar problema
      conn.resume();

      // Se houver erro retorna
      if (error) {
        console.log(error);
        return res.status(400).send({ message: "Houve erro" });
      }

      // Se não retornar nenhum erro retorna o resultado da query
      return res.status(200).send(result);
    });
  });
});

module.exports = routes;
