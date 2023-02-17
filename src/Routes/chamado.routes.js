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

// Aceitar chamado
routes.put("/aceitar/:id_chamado", (req, res, next) => {
  const { id_chamado } = req.params;
  const { tecnico_id } = req.body;

  if (!id_chamado) {
    return res.status(422).send({ message: "O ID do chamado é obrigatório." });
  }

  if (!tecnico_id) {
    return res.status(422).send({ message: "O ID do técnico é obrigatório." });
  }

  db.getConnection((error, conn) => {
    if (error) {
      return res.status(500).send({
        message: "Não foi possível aceitar o chamado.",
        error: error,
      });
    }

    const query =
      "UPDATE chamados SET status_chamado = 'andamento', tecnico_id = ? WHERE id_chamado = ?";

    conn.query(query, [tecnico_id, id_chamado], (error, results, fields) => {
      conn.release();
      if (error) {
        return res.status(500).send({
          message: "Não foi possível aceitar o chamado.",
          error: error,
        });
      }

      return res.status(200).send({ message: "Chamado aceito com sucesso." });
    });
  });
});

// Cancelar chamado
routes.put("/cancelar/:id_chamado", (req, res, next) => {
  const { id_chamado } = req.params;

  if (!id_chamado) {
    return res.status(422).send({ message: "O ID do chamado é obrigatório." });
  }

  db.getConnection((error, conn) => {
    if (error) {
      return res.status(500).send({
        message: "Não foi possível cancelar o chamado.",
        error: error,
      });
    }

    const query =
      "UPDATE chamados SET status_chamado = 'cancelado', tecnico_id = NULL WHERE id_chamado = ?";

    conn.query(query, [id_chamado], (error, results, fields) => {
      conn.release();
      if (error) {
        return res.status(500).send({
          message: "Não foi possível cancelar o chamado.",
          error: error,
        });
      }

      return res
        .status(200)
        .send({ message: "Chamado cancelado com sucesso." });
    });
  });
});

// Técnico cancelar chamado
routes.put("/tecnico/cancelar/:id_chamado", (req, res, next) => {
  const { id_chamado } = req.params;

  if (!id_chamado) {
    return res.status(422).send({ message: "O ID do chamado é obrigatório." });
  }

  db.getConnection((error, conn) => {
    if (error) {
      return res.status(500).send({
        message: "Não foi possível cancelar o chamado.",
        error: error,
      });
    }

    const query =
      "UPDATE chamados SET status_chamado = 'pendente', tecnico_id = NULL WHERE id_chamado = ?";

    conn.query(query, [id_chamado], (error, results, fields) => {
      conn.release();
      if (error) {
        return res.status(500).send({
          message: "Não foi possível cancelar o chamado.",
          error: error,
        });
      }

      return res
        .status(200)
        .send({ message: "Chamado cancelado com sucesso." });
    });
  });
});

// Concluir chamado
routes.post("/concluir", upload.single("anexo"), (req, res, next) => {
  let anexo = null;
  const { descricao, chamado_id } = req.body;

  if (req.file) {
    anexo = req.file.path;
  }

  if (!descricao) {
    return res.status(422).send({ message: "A descrição é obrigatório." });
  }

  if (!chamado_id) {
    return res.status(422).send({ message: "O ID do chamado é obrigatório." });
  }

  db.getConnection((error, conn) => {
    if (error) {
      return res.status(500).send({
        message: "Não foi possível atualizar o status do chamado.",
        error: error,
      });
    }

    const queryUm = "SELECT * FROM conclusoes WHERE chamado_id = ?";

    conn.query(queryUm, [chamado_id], (error, result, fields) => {
      if (error) {
        return res.status(500).send({
          message: "Não foi possível concluir o chamado.",
          error: error,
        });
      }

      if (result.length !== 0) {
        return res
          .status(422)
          .send({ message: "Este chamado já está concluído." });
      } else {
        const queryDois =
          "INSERT INTO conclusoes (descricao, data_termino, anexo, chamado_id) VALUES (?, NOW(), ?, ?)";

        conn.query(
          queryDois,
          [descricao, anexo, chamado_id],
          (error, result, fields) => {
            if (error) {
              return res.status(500).send({
                message: "Não foi possível concluir o chamado.",
                error: error,
              });
            }

            const queryTres =
              "UPDATE chamados SET status_chamado = 'concluido' WHERE id_chamado = ?";

            conn.query(queryTres, [chamado_id], (error, result, fields) => {
              conn.release();
              if (error) {
                return res.status(500).send({
                  message: "Não foi possível concluir o chamado.",
                  error: error,
                });
              }

              res
                .status(201)
                .send({ message: "Chamado concluído com sucesso!" });
            });
          }
        );
      }
    });
  });
});

routes.put("/avaliar", (req, res, next) => {
  const { num_avaliacao, desc_avaliacao, chamado_id } = req.body;

  if (!num_avaliacao) {
    return res
      .status(422)
      .send({ message: "O número da avaliação é obrigatório." });
  }

  if (!chamado_id) {
    return res.status(422).send({ message: "O ID do chamado é obrigatório." });
  }

  if (Number(num_avaliacao) <= 2 && !desc_avaliacao) {
    return res.status(422).send({ message: "A descrição é obrigatória." });
  }

  db.getConnection((error, conn) => {
    if (error) {
      return res.status(500).send({
        message: "Não foi possível avaliar o chamado.",
        error: error,
      });
    }

    const query =
      "UPDATE conclusoes SET num_avaliacao = ?, desc_avaliacao = ? WHERE chamado_id = ?";

    conn.query(
      query,
      [num_avaliacao, !desc_avaliacao ? null : desc_avaliacao, chamado_id],
      (error, result, fields) => {
        if (error) {
          return res.status(500).send({
            message: "Não foi possível avaliar o chamado.",
            error: error,
          });
        }

        res.status(200).send({ message: "Chamado avaliado com sucesso!" });
      }
    );
  });
});

module.exports = routes;
