const express = require("express");
const db = require("../../conexao");
const upload = require("../../middlewares/uploadImagens");

const routes = express.Router();

// Buscar todos os chamados
routes.get("/", (req, res, next) => {
  const { status, tecnico_id } = req.query;

  db.getConnection((error, conn) => {
    if (error) {
      return res.status(500).send({
        message: "Houve um erro, tente novamente mais tarde...",
        erro: error,
      });
    }

    let query = "SELECT * FROM chamados";

    if (tecnico_id) {
      query = `SELECT * FROM chamados WHERE tecnico_id = '${tecnico_id}'`;
    }

    if (status) {
      query = `SELECT * FROM chamados WHERE status_chamado = '${status}'`;
    }

    if (tecnico_id && status) {
      query = `SELECT * FROM chamados WHERE status_chamado = '${status}' AND tecnico_id = '${tecnico_id}'`;
    }

    conn.query(query, (error, result, field) => {
      conn.release();

      if (error) {
        res.status(500).send({
          error: error,
          response: null,
        });
      }
      res.status(200).send(result);
    });
  });
});

// Buscar um único chamado
routes.get("/:id", (req, res, next) => {
  const id_chamado = req.params.id;

  db.getConnection((error, conn) => {
    if (error) {
      return res.status(500).send({
        message: "Houve um erro, tente novamente mais tarde...",
        erro: error,
      });
    }

    const query = `SELECT * FROM chamados WHERE id_chamado = ${id_chamado}`;

    conn.query(query, (error, result) => {
      conn.release();

      if (error) {
        return res.status(500).send({
          error: error,
        });
      }

      return res.status(200).send(result);
    });
  });
});

// Criação dos chamados
routes.post("/criar", upload.single("anexo"), (req, res, next) => {
  let anexo = null;
  const { prioridade, patrimonio, problema, descricao, setor, funcionario_id } =
    req.body;

  if (req.file) {
    anexo = req.file.path;
  }

  if (!prioridade) {
    return res.status(422).send({ message: "A prioridade é obrigatório." });
  }
  if (!patrimonio) {
    return res.status(422).send({ message: "O patrimonio é obrigatório." });
  }
  if (!problema) {
    return res.status(422).send({ message: "A problema é obrigatório." });
  }
  if (!descricao) {
    return res.status(422).send({ message: "A descrição é obrigatório." });
  }
  if (!setor) {
    return res.status(422).send({ message: "O setor é obrigatório." });
  }
  if (!funcionario_id) {
    return res
      .status(422)
      .send({ message: "O ID do funcionário é obrigatório." });
  }

  var randomized = Math.ceil(Math.random() * Math.pow(12, 8)); //Cria um n�mero aleat�rio do tamanho definido em size.
  var digito = Math.floor(Math.random() * 10); // Cria o d�gito verificador inicial

  var cod_verificacao = randomized + "-" + digito;

  db.getConnection((error, conn) => {
    if (error) {
      return res.status(500).send({
        message: "Houve um erro, tente novamente mais tarde...",
        erro: error,
      });
    }

    let query =
      "INSERT INTO chamados (prioridade, patrimonio, problema, descricao, anexo, setor, cod_verificacao, status_chamado, data, tecnico_id, funcionario_id) VALUES (?, ?, ?, ?, ?, ?, ?, 'pendente', NOW(), NULL, ?)";

    conn.query(
      query,
      [
        prioridade,
        patrimonio,
        problema,
        descricao,
        anexo,
        setor,
        cod_verificacao,
        funcionario_id,
      ],
      (error, result, fields) => {
        conn.release();
        if (error) {
          console.log(error);
          return res.status(500).send({
            message: "Houve um erro, tente novamente mais tarde...",
            erro: error,
          });
        }

        return res.status(200).send({ message: "Chamado aberto com sucesso." });
      }
    );
  });
});

// Atualizar status chamado
routes.put("/atualizar/:id", (req, res, next) => {
  const { id } = req.params;
  const { status, tecnico_id } = req.body;

  if (!status) {
    return res
      .status(422)
      .send({ message: "O campo status deve ser especifícado." });
  }

  db.getConnection((error, conn) => {
    if (error) {
      return res.status(500).send({
        message: "Não foi possível atualizar o status do chamado.",
        error: error,
      });
    }

    let query = "";
    if (tecnico_id) {
      query = `UPDATE chamados SET status_chamado = '${status}', tecnico_id = ${tecnico_id} WHERE id_chamado = ${id}`;
    } else {
      query = `UPDATE chamados SET status_chamado = '${status}' WHERE id_chamado = ${id}`;
    }

    conn.query(query, (error, result, fields) => {
      conn.release();
      if (error) {
        return res.status(500).send({
          message: "Não foi possível atualizar o status do chamado.",
          error: error,
        });
      }

      return res
        .status(200)
        .send({ message: "Status do chamado atualizado com sucesso." });
    });
  });
});

module.exports = routes;
