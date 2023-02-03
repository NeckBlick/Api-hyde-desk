const express = require("express");
const db = require("../../conexao");
const bcrypt = require("bcryptjs");
const routes = express.Router();

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

routes.post("/cadastro", (req, res, next) => {
  //aqui faremos o a query com o banco de dados
  const { nome, cnpj, cep, numero_endereco, telefone, email, senha, confirmarSenha} = req.body



  db.getConnection((error, conn) => {
    if (error) {
      return res.status(500).send({
        message: error,
      });
    }

    if(!nome){
      return res.status(422).send({message: "O nome precisa ser válido"})
    }
    if(!cnpj){
      return res.status(422).send({message: "O cnpj precisa ser válido"})
    }
    if(!cep){
      return res.status(422).send({message: "O cep precisa ser válido"})
    }
    if(!numero_endereco){
      return res.status(422).send({message: "O número do endereço precisa ser válido"})
    }
    if(!telefone){
      return res.status(422).send({message: "O telefone precisa ser válido"})
    }
    if(!email){
      return res.status(422).send({message: "O email precisa ser válido"})
    }
    if(!senha){
      return res.status(422).send({message: "A senha precisa ser válida"})
    }
    if(senha != confirmarSenha){
      return res.status(422).send({message: "A senha precisa ser igual"})
    }

    bcrypt.hash(senha, 10, (errorCrypt, hashSenha) => {
      if (errorCrypt) {
        return console.log(errorCrypt);
      }

      let query = "INSERT INTO empresa (nome, cnpj, cep, numero_endereco, telefone, email, senha) VALUES (?, ?, ?, ?, ?,?, ?)"
    //após escrevermos a query normalmente, criamos um array para iresirmos os valores
    conn.query(
      query,
      [
        nome,
        cnpj,
        cep,
        numero_endereco,
        telefone,
        email,
        hashSenha
      ],
      
      (error, result, field) => {
        //conn.resume() serve para liberar a conexão com o banco de dados para que as conexões abertas não travem as apis
        conn.resume();
      
        //com esse callback pegaremos os erros e a resposta do servidor
        if (error) {
          //aqui capturamos o erro
          res.status(500).send({
            error: error,
            response: null,
          });
        }
        //se não tiver erro retornaremos a mensagem e o id da empresa criada
        res.status(201).send({
          message: "Iserindo empresa",
          id_empresa: result.insertId,
        });
      }
      );
    })
  });
});

module.exports = routes;
