const express = require("express");
const db = require("../../conexao");
const login = require("../../middlewares/login");

const routes = express.Router();

/**
 * @swagger
 * /conclusoes:
 *   get:
 *     tags: [Conclusões]
 *     summary: Busca todas as conclusões
 *     description: Essa rota serve para buscar todas as conclusões
 *     produces: application/json
 *     parameters:
 *       - name: num_avaliacao
 *         description: Nota da conclusão
 *         in: query
 *         type: String
 *         required: false
 *       - name: chamado_id
 *         description: ID do chamado concluído
 *         in: query
 *         type: String
 *         required: false
 *     responses:
 *       '200':
 *         description: Sucesso ao buscar as conclusões!
 *       '401':
 *         description: Não autorizado.
 *       '500':
 *         description: Houve um erro ao conectar ao servidor, tente novamente mais tarde...
 */

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

    let query =
      "SELECT *, con.descricao AS descricao_conclusao, con.anexo AS anexo_conclusao FROM conclusoes AS con INNER JOIN chamados AS c ON con.chamado_id = c.id_chamado INNER JOIN funcionarios AS f ON c.funcionario_id = f.id_funcionario INNER JOIN tecnicos AS t ON c.tecnico_id = t.id_tecnico INNER JOIN empresas AS e ON e.id_empresa = f.empresa_id";

    let keysFilters = Object.keys(filters);

    if (keysFilters.length !== 0) {
      query += " WHERE";

      try {
        keysFilters.forEach((key, index) => {
          if (index !== keysFilters.length - 1) {
            console.log(filters);
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

    conn.query(query, (error, results, fields) => {
      conn.release();
      if (error) {
        return res.status(500).send({
          message: "Não foi possível consultar conclusões.",
          error: error,
        });
      }

      if (results.length === 0) {
        return res.status(200).send([])
      }

      return res.status(200).send([{
        id_conclusao: results[0].id_conclusao,
        descricao: results[0].descricao_conclusao,
        anexo: results[0].anexo_conclusao,
        data_termino: results[0].data_termino,
        num_avaliacao: results[0].num_avaliacao,
        desc_avaliacao: results[0].desc_avaliacao,
        chamado_id: results[0].chamado_id,
        nome_empresa: results[0].nome_empresa,
        nome_tecnico: results[0].nome_tecnico,
      }]);
    });
  });
});

/**
 * @swagger
 * /conclusoes/{id_conclusao}:
 *   get:
 *     tags: [Conclusões]
 *     summary: Busca a conclusão pelo ID
 *     description: Essa rota serve para buscar a conclusão pelo ID
 *     produces: application/json
 *     parameters:
 *       - name: id_conclusao
 *         description: ID da conclusão
 *         in: path
 *         type: String
 *         required: true
 *     responses:
 *       '200':
 *         description: Sucesso ao buscar a conclusão!
 *       '401':
 *         description: Não autorizado.
 *       '500':
 *         description: Houve um erro ao conectar ao servidor, tente novamente mais tarde...
 */

// Buscar conclusões pelo ID
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
      conn.release();
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
