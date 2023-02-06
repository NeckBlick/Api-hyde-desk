const express = require("express");
const db = require("../../conexao");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const login = require("../../middlewares/login");
const routes = express.Router();

// Buscar todas as empresas
routes.get("/", (req, res, next) => {
  db.getConnection((error, conn) => {
    if (error) {
      return console.log(error);
    }

    let query = "SELECT * FROM empresas";

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

// Buscar uma empresa
routes.get("/:id", (req, res, next) => {
  const empresa = req.params.id;

  let query = `SELECT * FROM empresas WHERE id_empresa='${empresa}'`;

  db.getConnection((error, conn) => {
    if (error) {
      return res.status(500).send({
        message: error,
      });
    }
    conn.query(query, (error, result, field) => {
      conn.release();

      if (error) {
        res.status(500).send({
          error: error,
          response: null,
        });
      }
      res.status(200).send(result[0]);
    });
  });
});

// Cadastro das empresas
routes.post("/cadastro", (req, res, next) => {
  const {
    nome,
    cnpj,
    cep,
    numero_endereco,
    telefone,
    email,
    senha,
    confirmarsenha,
  } = req.body;

  if (!nome) {
    return res.status(422).send({ message: "O nome é obrigatório!" });
  }
  if (!cnpj) {
    return res.status(422).send({ message: "O cnpj é obrigatório!" });
  }
  if (!cep) {
    return res.status(422).send({ message: "O cep é obrigatório!" });
  }
  if (!numero_endereco) {
    return res
      .status(422)
      .send({ message: "O número do endereço é obrigatório!" });
  }
  if (!telefone) {
    return res.status(422).send({ message: "O telefone é obrigatório!" });
  }
  if (!email) {
    return res.status(422).send({ message: "O email é obrigatório!" });
  }
  if (!senha) {
    return res.status(422).send({ message: "A senha é obrigatório!" });
  }
  if (senha != confirmarsenha) {
    return res.status(422).send({ message: "As senhas são diferentes!" });
  }

  // Conexão com o banco de dados
  db.getConnection((error, conn) => {
    if (error) {
      return res.status(500).send({
        message: error,
      });
    }
    let query = "SELECT * FROM empresas WHERE cnpj = ?";
    conn.query(query, [cnpj], (erro, result) => {
      if (erro) {
        return res.status(500).send({ erro: erro });
      }
      if (result.length > 0) {
        return res.status(409).send({ message: "Empresa já cadastada!" });
      } else {
        // Criptografia da senha
        bcrypt.genSalt(10, (err, salt) => {
          if (err) {
            return next(err);
          }
          bcrypt.hash(senha, salt, (errorCrypt, hashSenha) => {
            if (errorCrypt) {
              return console.log(errorCrypt);
            }

            let query =
              "INSERT INTO empresas (nome, cnpj, cep, numero_endereco, telefone, email, senha, status_empresa) VALUES (?, ?, ?, ?, ?, ?, ?, 'Ativo')";

            conn.query(
              query,
              [nome, cnpj, cep, numero_endereco, telefone, email, hashSenha],

              (error, result, field) => {
                //conn.release() serve para liberar a conexão com o banco de dados para que as conexões abertas não travem as apis
                conn.release();
                if (error) {
                  res.status(500).send({
                    error: error,
                    response: null,
                  });
                }
                res.status(201).send({
                  message: "Empresa inserida com sucesso!",
                  id_empresa: result.insertId,
                });
              }
            );
          });
        });
      }
    });
  });
});

// Login
routes.post("/login", (req, res) => {
  const { cnpj, senha } = req.body;

  if (!cnpj) {
    return res.status(422).send({ message: "O cnpj é obrigatório!" });
  }
  if (!senha) {
    return res.status(422).send({ message: "A senha é obrigatória!" });
  }

  db.getConnection((err, conn) => {
    if (err) {
      console.log(err);
      return res.status(500).send({ erro: err });
    }
    const query = "SELECT * FROM empresas WHERE cnpj = ?";
    conn.query(query, [cnpj], (erro, result, fields) => {
      conn.release();
      if (erro) {
        console.log(erro);
        return res.status(500).send({ erro: erro });
      }
      let results = JSON.parse(JSON.stringify(result));
      console.log(results);
      if (results.length < 1) {
        return res.status(401).send({ message: "Falha na autenticação!" });
      }
      console.log(senha);
      console.log(results[0].senha);
      bcrypt.compare(senha, results[0].senha, (erro, result) => {
        if (erro) {
          return res.status(401).send({ message: "Falha na autenticação!" });
        }
        console.log(result);
        if (result) {
          let token = jwt.sign(
            {
              id_empresa: results[0].id_tecnico,
              cnpj: results[0].matricula,
            },
            process.env.JWT_KEY,
            {
              expiresIn: "1d",
            }
          );
          return res
            .status(200)
            .send({ message: "Autenticado com sucesso!", token: token });
        }
        return res
          .status(401)
          .send({ message: "Matricula ou senha inválida!" });
      });
    });
  });
});

module.exports = routes;
