const express = require("express");
const db = require("../../conexao");
const bcrypt = require("bcryptjs");
const routes = express.Router();

// Buscar todas as empresas
routes.get("/", (req, res, next) => {
  db.getConnection((error, conn) => {
    conn.query(
      "SELECT * FROM empresa",

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
    confirmarSenha,
  } = req.body;

  if (!nome) {
    return res.status(422).send({ message: "O nome e obrigatorio!" });
  }
  if (!cnpj) {
    return res.status(422).send({ message: "O cnpj e obrigatorio!" });
  }
  if (!cep) {
    return res.status(422).send({ message: "O cep e obrigatorio!" });
  }
  if (!numero_endereco) {
    return res
      .status(422)
      .send({ message: "O número do endereço e obrigatorio!" });
  }
  if (!telefone) {
    return res.status(422).send({ message: "O telefone e obrigatorio!" });
  }
  if (!email) {
    return res.status(422).send({ message: "O email e obrigatorio!" });
  }
  if (!senha) {
    return res.status(422).send({ message: "A senha e obrigatorio!" });
  }
  if (senha != confirmarSenha) {
    return res.status(422).send({ message: "As senhas sao diferentes!" });
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
        return res.status(409).send({ message: "Empresa ja cadastado" });
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
              "INSERT INTO empresa (nome, cnpj, cep, numero_endereco, telefone, email, senha) VALUES (?, ?, ?, ?, ?,?, ?)";
           
            conn.query(
              query,
              [nome, cnpj, cep, numero_endereco, telefone, email, hashSenha],

              (error, result, field) => {
                //conn.resume() serve para liberar a conexão com o banco de dados para que as conexões abertas não travem as apis
                conn.resume();
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

module.exports = routes;
