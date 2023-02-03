require('dotenv').config()
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const routes = express.Router();
const db = require("../../conexao");
const multer = require("multer");
const login = require("../../middlewares/login");
const upload = require("../../middlewares/uploadImagens")

// Cadastro
routes.post("/cadastro", upload.single("anexo"), async (req, res) => {
  const foto = req.file.path;
  const {
    nome,
    cpf_cnpj,
    email,
    especialidade,
    telefone,
    senha,
    confirmsenha,
  } = req.body;

  // Validação
  if (!nome) {
    return res.status(422).send({ message: "O nome e obrigatorio!" });
  }
  if (!cpf_cnpj) {
    return res.status(422).send({ message: "O CPF ou CNPJ e obrigatorio!" });
  }
  if (!email) {
    return res.status(422).send({ message: "O email e obrigatorio!" });
  }
  if (!especialidade) {
    return res.status(422).send({ message: "A especialidade e obrigatorio!" });
  }
  if (!telefone) {
    return res.status(422).send({ message: "O telefone e obrigatorio!" });
  }
  if (!senha) {
    return res.status(422).send({ message: "A senha e obrigatorio!" });
  }
  if (senha != confirmsenha) {
    return res.status(422).send({ message: "As senhas sao diferentes!" });
  }
  if (!foto) {
    return res.status(422).send({ message: "A foto e obrigatorio!" });
  }

  // Matricula
  var randomized = Math.ceil(Math.random() * Math.pow(10, 6)); //Cria um n�mero aleat�rio do tamanho definido em size.
  var digito = Math.ceil(Math.log(randomized)); //Cria o d�gito verificador inicial
  while (digito > 10) {
    //Pega o digito inicial e vai refinando at� ele ficar menor que dez
    digito = Math.ceil(Math.log(digito));
  }
  var matricula = randomized + "-" + digito;

  // Conexão com o banco e busca de dados
  db.getConnection((erro, conn) => {
    if (erro) {
      console.log(erro);
      return res.status(500).send({
        message: "Houve um erro, tente novamente mais tarde...",
        erro: erro,
      });
    }

    // Criptografia de senha
    bcrypt.hash(senha, 10, (errorCrypt, hashSenha) => {
      if (errorCrypt) {
        return console.log(errorCrypt);
      }

      let query =
        "INSERT INTO tecnico (nome, cpf_cnpj, email, telefone, especialidade, matricula, senha, foto) VALUES (?,?,?,?,?,?,?,?)";

      conn.query(
        query,
        [
          nome,
          cpf_cnpj,
          email,
          telefone,
          especialidade,
          matricula,
          hashSenha,
          foto,
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

          return res
            .send(201)
            .send({ message: "Usuario cadastrado com sucesso", result });
        }
      );
    });
  });
});


// Login
routes.post("/login", login, (req, res) => {
  const { cnpf_cnpj, senha } =  req.body

  if(!cnpf_cnpj){
    return  res.status(422).send({message: "Usuario ou senha invalido!"})
  }
  if(!senha){
    return  res.status(422).send({message: "Usuario ou senha invalido!"})
  }


  db.getConnection((erro, conn) => {
    if(erro){
      return console.log(erro)
    }
    let query = `SELECT * FROM tecnico WHERE cpf_cnpj = ?`
    conn.query(query,[user,user],(error, result, fields) => {
      conn.release()
      if(error){
        return res.status(500).send({ erro: true, error })
      }
      if(result.length > 0){
        const senhaBanco = result[0].senha
        bcrypt.compare(senha, senhaBanco, (err, data) => {
          if(err){
            return  res.status(422).send({message: "Usuario ou senha invalido!"})
          }

          if(data){
            let token = jwt.sign({
              id_tecnico: result[0].id_tecnico,
              email: result[0].senha
            }, process.env.JWT_KEY,
            {
              expiresIn: "1d"
            })
            return res.status(200).send({message: "Logado com sucesso", token: token})
            
          }
        })
      }
    })
  })
})

module.exports = routes;
