const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../../conexao");
const jwt = require("jsonwebtoken");
const login = require("../../middlewares/login");
const routes = express.Router();

// Buscar todos os funcionários
routes.get("/", (req, res, next) => {
  db.getConnection((erro, conn) => {
    if (erro) {
      return res.status(500).status({
        erro: erro,
      });
    }

    conn.query("SELECT * FROM funcionarios", (error, result, field) => {
      conn.release();
      if (error) {
        return res.status(500).send({
          erro: error,
        });
      }

      res.status(200).send(result);
    });
  });
});

// Buscar um funcionário
routes.get("/:id", (req, res, next) => {
  const id_funcionario = req.params.id;
  const query = `SELECT * FROM funcionarios WHERE id_funcionario = ${id_funcionario}`;

  db.getConnection((error, conn) => {
    if (error) {
      return res.status(500).send({ error: error });
    }

    conn.query(query, (error, result) => {
      conn.release();
      if (error) {
        return res.status(500).send({ error: error });
      }

      res.status(200).send(result[0]);
    });
  });
});

// Editar um funcionário
routes.put("/editar/:id", (req, res, next) => {
  const { nome_usuario, senha } = req.body;
  const id_funcionario = req.params.id;

  db.getConnection((error, conn) => {
    if (error) {
      return res.status(500).send({ error: error });
    }
    const query_get = `SELECT senha, usuario FROM funcionarios WHERE id_funcionario = ${id_funcionario}`;

    conn.query(query_get, (error, result) => {
      conn.release();
      if (error) {
        return res.status(500).send({ error: error });
      }

      if (senha === result[0].senha) {
        res.status(422).send({
          message: "A nova senha não pode ser igual a antiga!",
        });
      }
    });
    const query = `UPDATE funcionarios SET usuario = '${nome_usuario}', senha = '${senha}' WHERE id_funcionario = ${id_funcionario}`;

    conn.query(query, (error, result) => {
      conn.release();
      if (error) {
        return res.status(500).send({ error: error });
      }
      res.status(200).send({ result: result });
    });
  });
});

// Cadastro
routes.post("/cadastro", async (req, res, next) => {
  const { nome, id_empresa, matricula, usuario, senha, confirmsenha } =
    req.body;

  // Validação
  if (!nome) {
    return res.status(422).send({ message: "O nome é obrigatório!" });
  }
  if (!usuario) {
    return res.status(422).send({ message: "O usuario é obrigatório!" });
  }
  if (!matricula) {
    return res.status(422).send({ message: "A matricula é obrigatório!" });
  }
  if (!senha) {
    return res.status(422).send({ message: "A senha é obrigatório!" });
  }
  if (senha != confirmsenha) {
    return res.status(422).send({ message: "As senhas são diferentes!" });
  }

  // Conexão com o banco e busca de dados
  db.getConnection((erro, conn) => {
    if (erro) {
      console.log(erro);
      return res.status(500).send({
        message: "Houve um erro, tente novamente mais tarde...",
        erro: erro,
      });
    }
    let query = "SELECT * FROM funcionarios WHERE matricula = ?";
    conn.query(query, [matricula], (erro, result) => {
      if (erro) {
        return res.status(500).send({ erro: erro });
      }
      if (result.length > 0) {
        return res.status(409).send({ message: "Funcionário já cadastado" });
      } else {
        bcrypt.genSalt(10, (err, salt) => {
          if (err) {
            return next(err);
          }
          // Criptografia de senha
          bcrypt.hash(senha, salt, (errorCrypt, hashSenha) => {
            if (errorCrypt) {
              return console.log(errorCrypt);
            }


            let query = `INSERT INTO funcionarios (nome, usuario, matricula, senha, status_funcionario, empresa_id) SELECT '${nome}','${usuario}','${matricula}','${hashSenha}', 'Ativo', '${id_empresa}'`;


            conn.query(query, (error, result, fields) => {
              conn.release();
              if (error) {
                console.log(error);
                return res.status(500).send({
                  message: "Houve um erro, tente novamente mais tarde...",
                  erro: error,
                });
              }

              return res
                .status(201)
                .send({
                  message: "Funcionário cadastrado com sucesso!",
                  id_funcionario: result.insertId,
                });
            });
          });
        });
      }
    });
  });
});

// Login
routes.post("/login",  (req, res) => {
  const { matricula, senha } = req.body;

  if (!matricula) {
    return res.status(422).send({ message: "A matricula é obrigatória!" });
  }
  if (!senha) {
    return res.status(422).send({ message: "A senha é obrigatória!" });
  }

  db.getConnection((err, conn) => {
    if (err) {
      console.log(err);
      return res.status(500).send({ erro: err });
    }
    const query = "SELECT * FROM funcionarios WHERE matricula = ?";
    conn.query(query, [matricula], (erro, result, fields) => {
      conn.release();
      if (erro) {
        console.log(erro);
        return res.status(500).send({ erro: erro });
      }
      let results = JSON.parse(JSON.stringify(result));
      console.log(results);
      if (results.length < 1) {
        return res.status(401).send({ message: "Falha na autenticação" });
      }

      let id = results[0].id_funcionario

      bcrypt.compare(senha, results[0].senha, (erro, result) => {
        if (erro) {
          return res.status(401).send({ message: "Falha na autenticação" });
        }
        console.log(result);
        if (result) {
          let token = jwt.sign(
            {
              id_funcionario: results[0].id_funcionario,
              matricula: results[0].matricula,
            },
            process.env.JWT_KEY,
            {
              expiresIn: "1d",
            }
          );
          return res
            .status(200)
            .send({ message: "Autenticado com sucesso!", token: token, id: id , tipo: "funcionarios" });
        }
        return res
          .status(401)
          .send({ message: "Matricula ou senha inválida!" });
      });
    });
  });
});

module.exports = routes;
