const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../../conexao");
const routes = express.Router();

// Buscar todos os funcionarios
routes.get("/", (req, res, next) => {
  db.getConnection((erro, conn) =>{

    if(erro){
      return res.status(500).status({
        erro: erro
      })
    }

    conn.query("SELECT * FROM funcionarios", 
          (error, result, field) => {

            conn.resume()
            if(error){
              return res.status(500).send({
                erro: error
              })
            }

            res.status(200).send({
              result: result
            })
          }
    )
  } 
  )
})

// Buscar um funcionario
routes.get("/:id", (req, res, next) =>{
  const id_funcionario = req.params.id;
  const query = `SELECT * FROM funcionarios WHERE id_funcionario = ${id_funcionario}`

  db.getConnection((error, conn) => {
    if(error){
      return res.status(500).send({error : error})
    }


    conn.query(query, (error, result) => {
      conn.resume()
      if(error){
        return res.status(500).send({error: error})
      }

      res.status(200).send({result: result})
    })
  })
})

// Editar um funcionario
routes.put("/editar/:id", (req, res, next) => {
  const {nome_usuario, senha} = req.body 
  const id_funcionario = req.params.id

  db.getConnection((error, conn) =>{
    if(error){
      return res.status(500).send({error: error})
    }
    const query_get = `SELECT senha, usuario FROM funcionarios WHERE id_funcionario = ${id_funcionario}`

    conn.query(query_get , (error, result) =>{
      conn.resume()
      if(error){
        return res.status(500).send({error: error})
      }

      if(senha === result[0].senha){
        res.status(422).send({
          message: "A nova senha não pode ser igual a antiga."
        })
      }
    })
    const query = `UPDATE funcionarios SET usuario = '${nome_usuario}', senha = '${senha}' WHERE id_funcionario = ${id_funcionario}`

    conn.query(query, (error, result) =>{
      conn.resume()
      if(error){
        return res.status(500).send({ error: error})
      }
      res.status(200).send({ result : result})
    })
  })
})

// Cadastro
routes.post("/cadastro", async (req, res, next) => {
  const { nome, nome_empresa, matricula, usuario, senha, confirmsenha } =
    req.body;

  // Validação
  if (!nome) {
    return res.status(422).send({ message: "O nome e obrigatorio!" });
  }
  if (!usuario) {
    return res.status(422).send({ message: "O usuario e obrigatorio!" });
  }
  if (!matricula) {
    return res.status(422).send({ message: "A matricula e obrigatorio!" });
  }
  if (!senha) {
    return res.status(422).send({ message: "A senha e obrigatorio!" });
  }
  if (senha != confirmsenha) {
    return res.status(422).send({ message: "As senhas sao diferentes!" });
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
        return res.status(409).send({ message: "Funcionario ja cadastado" });
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

            let query = `INSERT INTO funcionarios (nome, usuario, matricula, senha, empresa_id) SELECT '${nome}','${usuario}','${matricula}','${hashSenha}', id_empresa FROM empresa WHERE nome LIKE '${nome_empresa}'`;

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
                .send(201)
                .send({ message: "Usuario cadastrado com sucesso" });
            });
          });
        });
      }
    });
  });
});

module.exports = routes;
