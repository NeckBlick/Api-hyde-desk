const express = require("express");
const db = require("../../conexao");
const upload = require("../../middlewares/uploadImagens");

const routes = express.Router();

// Buscar todos os chamados
routes.get("/", (req, res, next) => {
  const filters = req.query;

  db.getConnection((error, conn) => {
    if (error) {
      return res.status(500).send({
        message: "Houve um erro, tente novamente mais tarde...",
        erro: error,
      });
    }

    let query =
      "SELECT *, e.nome AS nome_empresa FROM chamados AS c INNER JOIN funcionarios AS f ON f.id_funcionario = c.funcionario_id INNER JOIN empresas AS e ON e.id_empresa = f.empresa_id";

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

    conn.query(query, (error, results, field) => {
      conn.release();

      if (error) {
        res.status(500).send({
          error: error,
          response: null,
        });
      }

      res.status(200).send(
        results.map((result) => {
          return {
            id_chamado: result.id_chamado,
            prioridade: result.prioridade,
            patrimonio: result.patrimonio,
            problema: result.problema,
            anexo: result.anexo,
            setor: result.setor,
            descricao: result.descricao,
            cod_verificacao: result.cod_verificacao,
            status_chamado: result.status_chamado,
            data: result.data,
            tecnico_id: result.tecnico_id,
            funcionario_id: result.funcionario_id,
            empresa: {
              empresa_id: result.id_empresa,
              nome_empresa: result.nome_empresa,
              cep: result.cep,
              numero_endereco: result.numero_endereco,
              telefone: result.telefone,
            },
          };
        })
      );
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

    const query = `SELECT *, e.nome AS nome_empresa FROM chamados AS c INNER JOIN funcionarios AS f ON f.id_funcionario = c.funcionario_id INNER JOIN empresas AS e ON e.id_empresa = f.empresa_id WHERE id_chamado = ${id_chamado}`;

    conn.query(query, (error, result) => {
      conn.release();

      if (error) {
        return res.status(500).send({
          error: error,
        });
      }

      res.status(200).send(
        result.map((result) => {
          return {
            id_chamado: result.id_chamado,
            prioridade: result.prioridade,
            patrimonio: result.patrimonio,
            problema: result.problema,
            anexo: result.anexo,
            setor: result.setor,
            descricao: result.descricao,
            cod_verificacao: result.cod_verificacao,
            status_chamado: result.status_chamado,
            data: result.data,
            tecnico_id: result.tecnico_id,
            funcionario_id: result.funcionario_id,
            empresa: {
              empresa_id: result.id_empresa,
              nome_empresa: result.nome_empresa,
              cep: result.cep,
              numero_endereco: result.numero_endereco,
              telefone: result.telefone,
            },
          };
        })
      );
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

routes.post("/filtrar", (req, res) => {
  const { status } = req.body
  let query = `SELECT * FROM chamados AS c INNER JOIN funcionarios AS f ON f.id_funcionario = c.funcionario_id INNER JOIN empresas AS e ON e.id_empresa = f.empresa_id `;
  if(status == "pendente"){
    query += `WHERE status_chamado = 'pendente'`;
  }else
      if(status == "aberto"){
        query += `WHERE status_chamado = 'aberto'`;
      }
      else 
        if(status == "em andamento"){
          query += `WHERE status_chamado = 'em andamento'`;
        }
  db.getConnection((error, conn) => {
    if (error)
      return res
        .status(500)
        .send({
          message: "Houve um erro, tente novamente mais tarde.",
          erro: error,
        });
    
    conn.query(query, (error, result) => {
      if (error) {
        return res.status(500).send({
          message: "Não foi possível encontrar o chamado.",
          error: error,
        });
      }
      return res.status(200).send(
        result.map((result) => {
          return {
            id_chamado: result.id_chamado,
            prioridade: result.prioridade,
            patrimonio: result.patrimonio,
            problema: result.problema,
            anexo: result.anexo,
            setor: result.setor,
            descricao: result.descricao,
            cod_verificacao: result.cod_verificacao,
            status_chamado: result.status_chamado,
            data: result.data,
            tecnico_id: result.tecnico_id,
            funcionario_id: result.funcionario_id,
            empresa: {
              empresa_id: result.id_empresa,
              nome_empresa: result.nome_empresa,
              cep: result.cep,
              numero_endereco: result.numero_endereco,
              telefone: result.telefone,
            },
          };
        })
      );
    });
  });
});

module.exports = routes;
