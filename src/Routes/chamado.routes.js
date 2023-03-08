const express = require("express");
const axios = require("axios");
const db = require("../../conexao");
const upload = require("../../middlewares/uploadImagens");
const login = require("../../middlewares/login");

const routes = express.Router();

/**
 * @swagger
 * /chamados:
 *   get:
 *     tags: [Chamados]
 *     summary: Busca todos os chamados
 *     description: Essa rota serve para buscar todos os chamados
 *     produces: application/json
 *     parameters:
 *       - name: status_chamado
 *         description: Status do chamado
 *         in: query
 *         type: String
 *         required: false
 *       - name: prioridade
 *         description: Prioridade do chamado
 *         in: query
 *         type: String
 *         required: false
 *       - name: patrimonio
 *         description: Patrimônio do hardaware associado ao chamado
 *         in: query
 *         type: String
 *         required: false
 *       - name: problema
 *         description: Problema do chamado
 *         in: query
 *         type: String
 *         required: false
 *       - name: setor
 *         description: Setor do problema
 *         in: query
 *         type: String
 *         required: false
 *       - name: cod_verificacao
 *         description: Codigo de verificação do chamado
 *         in: query
 *         type: String
 *         required: false
 *       - name: tecnico_id
 *         description: ID do técnico associado ao chamado
 *         in: query
 *         type: String
 *         required: false
 *       - name: funcionario_id
 *         description: ID do funcionário que abriu o chamado
 *         in: query
 *         type: String
 *         required: false
 *     responses:
 *       '200':
 *         description: Sucesso ao buscar os chamados!
 *       '401':
 *         description: Não autorizado.
 *       '500':
 *         description: Houve um erro ao conectar ao servidor, tente novamente mais tarde...
 */

// Buscar todos os chamados
routes.get("/", login, (req, res, next) => {
  const filters = req.query;

  db.getConnection((error, conn) => {
    if (error) {
      return res.status(500).send({
        message: "Houve um erro, tente novamente mais tarde...",
        erro: error,
      });
    }

    let query =
      "SELECT * FROM chamados AS c INNER JOIN funcionarios AS f ON f.id_funcionario = c.funcionario_id INNER JOIN empresas AS e ON e.id_empresa = f.empresa_id";

    let keysFilters = Object.keys(filters);

    if (keysFilters.includes("nome_empresa")) {
      query += ` AND e.nome = '${filters["nome_empresa"]}'`;
      keysFilters = keysFilters.filter((item) => item !== "nome_empresa");
    }

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
        return res.status(500).send({
          error: error,
          response: null,
        });
      }

      const responseFormatada = results.map((result) => {
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
          nome_funcionario: result.nome_funcionario,
          empresa_id: result.id_empresa,
          nome_empresa: result.nome_empresa,
          cep: result.cep,
          numero_endereco: result.numero_endereco,
          telefone: result.telefone,
        };
      });

      res.status(200).send(responseFormatada);
    });
  });
});

/**
 * @swagger
 * /chamados/{id_chamado}:
 *   get:
 *     tags: [Chamados]
 *     summary: Busca um chamado pelo ID
 *     description: Essa rota serve para buscar o chamado pelo ID
 *     produces: application/json
 *     parameters:
 *       - name: id
 *         description: ID do chamado
 *         in: path
 *         type: String
 *         required: false
 *     responses:
 *       '200':
 *         description: Sucesso ao buscar o chamado!
 *       '401':
 *         description: Não autorizado.
 *       '500':
 *         description: Houve um erro ao conectar ao servidor, tente novamente mais tarde...
 */

// Buscar um único chamado
routes.get("/:id", login, (req, res, next) => {
  const id_chamado = req.params.id;

  db.getConnection((error, conn) => {
    if (error) {
      return res.status(500).send({
        message: "Houve um erro, tente novamente mais tarde...",
        erro: error,
      });
    }

    const query = `SELECT * FROM chamados AS c INNER JOIN funcionarios AS f ON f.id_funcionario = c.funcionario_id INNER JOIN empresas AS e ON e.id_empresa = f.empresa_id WHERE id_chamado = ${id_chamado}`;

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
            nome_funcionario: result.nome_funcionario,
            empresa_id: result.id_empresa,
            nome_empresa: result.nome_empresa,
            cep: result.cep,
            numero_endereco: result.numero_endereco,
            telefone: result.telefone,
          };
        })
      );
    });
  });
});

/**
 * @swagger
 * /chamados/criar:
 *   post:
 *     tags: [Chamados]
 *     summary: Cria um chamado
 *     description: Essa rota serve para criar um chamado
 *     produces: multipart/form-data
 *     parameters:
 *       - name: prioridade
 *         description: Prioridade do chamado
 *         in: formData
 *         type: String
 *         required: true
 *       - name: patrimonio
 *         description: Patrimônio do hardware associado ao chamado
 *         in: formData
 *         type: String
 *         required: true
 *       - name: problema
 *         description: Problema do chamado
 *         in: formData
 *         type: String
 *         required: true
 *       - name: descricao
 *         description: Descrição do problema
 *         in: formData
 *         type: String
 *         required: true
 *       - name: setor
 *         description: Setor do problema
 *         in: formData
 *         type: String
 *         required: true
 *       - name: funcionario_id
 *         description: ID do funcionário que irá abrir o chamado
 *         in: formData
 *         type: int32
 *         required: true
 *       - name: anexo
 *         description: Anexo do problema
 *         in: formData
 *         type: String
 *         format: binary
 *         required: false
 *     requestBody:
 *       description: Precisará passar os seguintes dados no corpo da requisição
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/Chamado'
 *     responses:
 *       '201':
 *         description: Chamado criado com sucesso!
 *       '422':
 *         description: Alguma informação faltando.
 *       '500':
 *         description: Houve um erro ao conectar ao servidor, tente novamente mais tarde...
 * components:
 *  schemas:
 *    Chamado:
 *      type: object
 *      properties:
 *        prioridade:
 *         type: string
 *         example: Alta
 *        patrimonio:
 *         type: string
 *         example: 23456781
 *        problema:
 *         type: string
 *         example: Hardware
 *        descricao:
 *         type: string
 *         example: Monitor não liga
 *        setor:
 *         type: string
 *         example: RH
 *        funcionario:
 *         type: int32
 *         example: 1
 *        anexo:
 *         type: string
 *         contentMediaType: image/png
 *         contentEncoding: base64
 */

// Criação dos chamados
routes.post("/criar", login, upload.single("anexo"), (req, res, next) => {
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
      async (error, result, fields) => {
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

/**
 * @swagger
 * /chamados/aceitar/{id_chamado}:
 *   put:
 *     tags: [Chamados]
 *     summary: Aceita um chamado
 *     description: Essa rota serve para aceitar um chamado aberto
 *     produces: application/json
 *     parameters:
 *       - name: id_chamado
 *         description: ID do chamado
 *         in: path
 *         type: String
 *         required: true
 *       - name: tecnico_id
 *         description: ID do técnico que aceitou o chamado
 *         in: formData
 *         type: Number
 *         required: true
 *     requestBody:
 *       description: Precisará passar o seguinte dado no corpo da requisição
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AceitarChamado'
 *     responses:
 *       '200':
 *         description: Sucesso ao aceitar o chamado!
 *       '401':
 *         description: Não autorizado.
 *       '422':
 *         description: Alguma informação faltando.
 *       '500':
 *         description: Houve um erro ao conectar ao servidor, tente novamente mais tarde...
 * components:
 *  schemas:
 *    AceitarChamado:
 *      type: object
 *      properties:
 *        tecnico_id:
 *         type: number
 *         example: 1
 */

// Aceitar chamado
routes.put("/aceitar/:id_chamado", login, (req, res, next) => {
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

    const queryUm = "SELECT status_chamado FROM chamados WHERE id_chamado = ?";

    conn.query(queryUm, [id_chamado], (error, result, fields) => {
      if (error) {
        return res.status(500).send({
          message: "Não foi possível aceitar o chamado.",
          error: error,
        });
      }

      if (result[0].status_chamado === "pendente") {
        const queryDois =
          "UPDATE chamados SET status_chamado = 'andamento', tecnico_id = ? WHERE id_chamado = ?";

        conn.query(
          queryDois,
          [tecnico_id, id_chamado],
          (error, results, fields) => {
            conn.release();
            if (error) {
              return res.status(500).send({
                message: "Não foi possível aceitar o chamado.",
                error: error,
              });
            }

            return res
              .status(200)
              .send({ message: "Chamado aceito com sucesso." });
          }
        );
      } else {
        conn.release();
        return res.status(422).send({
          message: "O chamado já está em andamento ou foi concluído.",
        });
      }
    });
  });
});

/**
 * @swagger
 * /chamados/cancelar/{id_chamado}:
 *   put:
 *     tags: [Chamados]
 *     summary: Cancela um chamado
 *     description: Essa rota serve para cancelar um chamado
 *     produces: application/json
 *     parameters:
 *       - name: id_chamado
 *         description: ID do chamado
 *         in: path
 *         type: String
 *         required: true
 *     responses:
 *       '200':
 *         description: Sucesso ao cancelar o chamado!
 *       '401':
 *         description: Não autorizado.
 *       '422':
 *         description: Alguma informação faltando.
 *       '500':
 *         description: Houve um erro ao conectar ao servidor, tente novamente mais tarde...
 */

// Cancelar chamado
routes.put("/cancelar/:id_chamado", login, (req, res, next) => {
  const { id_chamado } = req.params;

  db.getConnection((error, conn) => {
    if (error) {
      return res.status(500).send({
        message: "Não foi possível cancelar o chamado.",
        error: error,
      });
    }

    const queryUm = "SELECT status_chamado FROM chamados WHERE id_chamado = ?";

    conn.query(queryUm, [id_chamado], (error, result, fields) => {
      if (error) {
        return res.status(500).send({
          message: "Não foi possível cancelar o chamado.",
          error: error,
        });
      }

      if (result[0].status_chamado === "pendente") {
        const queryDois =
          "UPDATE chamados SET status_chamado = 'cancelado', tecnico_id = NULL WHERE id_chamado = ?";

        conn.query(queryDois, [id_chamado], (error, results, fields) => {
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
      } else {
        conn.release();
        return res.status(422).send({
          message: "O chamado já está em andamento ou foi concluído.",
        });
      }
    });
  });
});

/**
 * @swagger
 * /chamados/suspender/{id_chamado}:
 *   put:
 *     tags: [Chamados]
 *     summary: Suspende um chamado
 *     description: Essa rota serve para suspender um chamado em andamento
 *     produces: application/json
 *     parameters:
 *       - name: id_chamado
 *         description: ID do chamado
 *         in: path
 *         type: String
 *         required: true
 *     responses:
 *       '200':
 *         description: Sucesso ao suspender o chamado!
 *       '401':
 *         description: Não autorizado.
 *       '422':
 *         description: Alguma informação faltando.
 *       '500':
 *         description: Houve um erro ao conectar ao servidor, tente novamente mais tarde...
 */

// Suspender chamado
routes.put("/suspender/:id_chamado", login, (req, res, next) => {
  const { id_chamado } = req.params;

  if (!id_chamado) {
    return res.status(422).send({ message: "O ID do chamado é obrigatório." });
  }

  db.getConnection((error, conn) => {
    if (error) {
      return res.status(500).send({
        message: "Não foi possível suspender o chamado.",
        error: error,
      });
    }

    const queryUm = "SELECT status_chamado FROM chamados WHERE id_chamado = ?";

    conn.query(queryUm, [id_chamado], (error, result, fields) => {
      if (error) {
        return res.status(500).send({
          message: "Não foi possível suspender o chamado.",
          error: error,
        });
      }

      if (result[0].status_chamado === "andamento") {
        const queryDois =
          "UPDATE chamados SET status_chamado = 'pendente', tecnico_id = NULL WHERE id_chamado = ?";

        conn.query(queryDois, [id_chamado], (error, results, fields) => {
          conn.release();
          if (error) {
            return res.status(500).send({
              message: "Não foi possível suspender o chamado.",
              error: error,
            });
          }

          return res
            .status(200)
            .send({ message: "Chamado suspenso com sucesso." });
        });
      } else {
        conn.release();
        return res.status(422).send({
          message: "O chamado está pendente ou foi concluído.",
        });
      }
    });
  });
});

/**
 * @swagger
 * /chamados/concluir/{id_chamado}:
 *   put:
 *     tags: [Chamados]
 *     summary: Conclui um chamado
 *     description: Essa rota serve para concluir um chamado em andamento
 *     produces: multipart/form-data
 *     parameters:
 *       - name: id_chamado
 *         description: ID do chamado
 *         in: path
 *         type: String
 *         required: true
 *       - name: descricao
 *         description: Decrição do problema resolvido
 *         in: formData
 *         type: Number
 *         required: true
 *       - name: anexo
 *         description: Anexo do problema resolvido
 *         in: formData
 *         type: String
 *         required: false
 *     requestBody:
 *       description: Precisará passar o seguinte dado no corpo da requisição
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/ConcluirChamado'
 *     responses:
 *       '201':
 *         description: Sucesso ao concluir o chamado!
 *       '401':
 *         description: Não autorizado.
 *       '422':
 *         description: Alguma informação faltando.
 *       '500':
 *         description: Houve um erro ao conectar ao servidor, tente novamente mais tarde...
 * components:
 *  schemas:
 *    ConcluirChamado:
 *      type: object
 *      properties:
 *        descricao:
 *         type: string
 *         example: O problema no monitor foi resolvido
 *        anexo:
 *         type: string
 *         contentMediaType: image/png
 *         contentEncoding: base64
 */

// Concluir chamado
routes.put(
  "/concluir/:id_chamado",
  login,
  upload.single("anexo"),
  (req, res, next) => {
    let anexo = null;
    const { id_chamado } = req.params;
    const { descricao } = req.body;

    if (req.file) {
      anexo = req.file.path;
    }

    if (!descricao) {
      return res.status(422).send({ message: "A descrição é obrigatório." });
    }

    if (!id_chamado) {
      return res
        .status(422)
        .send({ message: "O ID do chamado é obrigatório." });
    }

    db.getConnection((error, conn) => {
      if (error) {
        return res.status(500).send({
          message: "Não foi possível concluir chamado.",
          error: error,
        });
      }

      const queryUm = "SELECT * FROM conclusoes WHERE chamado_id = ?";

      conn.query(queryUm, [id_chamado], (error, result, fields) => {
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
            [descricao, anexo, id_chamado],
            (error, result, fields) => {
              if (error) {
                return res.status(500).send({
                  message: "Não foi possível concluir o chamado.",
                  error: error,
                });
              }

              const queryTres =
                "UPDATE chamados SET status_chamado = 'concluido' WHERE id_chamado = ?";

              conn.query(queryTres, [id_chamado], (error, result, fields) => {
                conn.release();
                if (error) {
                  return res.status(500).send({
                    message: "Não foi possível concluir o chamado.",
                    error: error,
                  });
                }

                return res
                  .status(201)
                  .send({ message: "Chamado concluído com sucesso!" });
              });
            }
          );
        }
      });
    });
  }
);

/**
 * @swagger
 * /chamados/avaliar/{id_chamado}:
 *   put:
 *     tags: [Chamados]
 *     summary: Avalia a conclusão do chamado
 *     description: Essa rota serve para avaliar a conlusão do chamado
 *     produces: application/json
 *     parameters:
 *       - name: id_chamado
 *         description: ID do chamado
 *         in: path
 *         type: String
 *         required: true
 *       - name: num_avaliacao
 *         description: Nota para a conclusão do chamado
 *         in: formData
 *         type: Number
 *         required: true
 *       - name: desc_avaliacao
 *         description: Descrição da nota da conclusão
 *         in: formData
 *         type: String
 *         required: true
 *     requestBody:
 *       description: Precisará passar o seguinte dado no corpo da requisição
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AvaliarChamado'
 *     responses:
 *       '200':
 *         description: Sucesso ao avaliar o chamado!
 *       '401':
 *         description: Não autorizado.
 *       '422':
 *         description: Alguma informação faltando.
 *       '500':
 *         description: Houve um erro ao conectar ao servidor, tente novamente mais tarde...
 * components:
 *  schemas:
 *    AvaliarChamado:
 *      type: object
 *      properties:
 *        num_avaliacao:
 *         type: number
 *         example: 5
 *        desc_avaliacao:
 *         type: string
 *         example: Funcionou muito bem
 */

// Avaliar chamado
routes.put("/avaliar/:id_chamado", login, (req, res, next) => {
  const { id_chamado } = req.params;
  const { num_avaliacao, desc_avaliacao } = req.body;

  if (!num_avaliacao) {
    return res
      .status(422)
      .send({ message: "O número da avaliação é obrigatório." });
  }

  if (!id_chamado) {
    return res.status(422).send({ message: "O ID do chamado é obrigatório." });
  }

  if (Number(num_avaliacao) <= 2 && !desc_avaliacao) {
    return res.status(422).send({
      message: "A descrição é obrigatória pois a nota está abaixo de 3.",
    });
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
      [num_avaliacao, !desc_avaliacao ? null : desc_avaliacao, id_chamado],
      (error, result, fields) => {
        if (error) {
          return res.status(500).send({
            message: "Não foi possível avaliar o chamado.",
            error: error,
          });
        }

        return res
          .status(200)
          .send({ message: "Chamado avaliado com sucesso!" });
      }
    );
  });
});

module.exports = routes;
