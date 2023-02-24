const express = require("express");
const db = require("../../conexao");
const login = require("../../middlewares/login");

const routes = express.Router();

// Buscar todas conclusões
routes.get("/", login, (req, res, next) => {
  const filters = req.query;

  db.getConnection((error, conn) => {
    if (error) {
      return res.status(500).send({
        message: "Não foi possível consultar conclusões.",
        error: error,
      });
    }

    let query = "SELECT * FROM conclusoes";

    let keysFilters = Object.keys(filters);

    if (keysFilters.length !== 0) {
      query += " WHERE";

      try {
        keysFilters.forEach((key, index) => {
          if (index !== keysFilters.length - 1) {
            query += ` ${key} LIKE '${filters[key]}' AND`;
          } else {
            query += ` ${key} LIKE '${filters[key]}'`;
          }
        });
      } catch (error) {
        return res.status(500).send({
          message: "Houve um erro, tente novamente mais tarde...",
          erro: error,
        });
      }
    }

    console.log(query);

    conn.query(query, (error, results, fields) => {
      if (error) {
        return res.status(500).send({
          message: "Não foi possível consultar conclusões.",
          error: error,
        });
      }

      return res.status(200).send(results);
    });
  });
});

// Buscar conclusões pelo ID do chamado
routes.get("/:id_conclusao", login, (req, res, next) => {
  const { id_conclusao } = req.params;

  db.getConnection((error, conn) => {
    if (error) {
      return res.status(500).send({
        message: "Não foi possível consultar conclusão.",
        error: error,
      });
    }

    const query = "SELECT * FROM conclusoes WHERE id_conclusao = ?";

    conn.query(query, [id_conclusao], (error, result, fields) => {
      if (error) {
        return res.status(500).send({
          message: "Não foi possível consultar conclusão.",
          error: error,
        });
      }

      if (result.length !== 0) {
        return res.status(200).send(result[0]);
      } else {
        return res.status(404).send({
          message: "Esse chamado não está concluído ou não foi encontrado.",
        });
      }
    });
  });
});

module.exports = routes;
