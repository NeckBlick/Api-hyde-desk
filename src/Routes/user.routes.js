const express = require("express");
const bcrypt = require("bcrypt");
const path = require("path")
const jwt = require("jsonwebtoken");
const routes = express.Router();
const db = require("../conexao");
const multer = require("multer")

// Configurações para imagem
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.resolve("./uploads/"))
  },
  filename: (req, file, cb) => {
    let date = new Date().toISOString()
    cb(null, date +  file.originalname)
  }
})
const upload = multer({storage: storage})

// Cadastro do técnico
routes.post("/tecnico", upload.single("anexo"), async (req, res) => {
  console.log(req.file)
  const foto = req.file.path
  const { nome, cpf_cnpj, email, especialidade, telefone, matricula, senha, confirmsenha } = req.body

  // Validação 
  if(!nome){
    return res.status(422).send({message: "O nome e obrigatorio!"})
  }
  if(!cpf_cnpj){
    return res.status(422).send({message: "O CPF ou CNPJ e obrigatorio!"})
  }
  if(!email){
    return res.status(422).send({message: "O email e obrigatorio!"})
  }
  if(!especialidade){
    return res.status(422).send({message: "A especialidade e obrigatorio!"})
  }
  if(!telefone){
    return res.status(422).send({message: "O telefone e obrigatorio!"})
  }
  if(!matricula){
    return res.status(422).send({message: "A matricula e obrigatorio!"})
  }
  if(!senha){
    return res.status(422).send({message: "A senha e obrigatorio!"})
  }
  if(senha != confirmsenha){
    return res.status(422).send({message: "As senhas sao diferentes!"})
  }
  if(!foto){
    return res.status(422).send({message: "A foto e obrigatorio!"})
  }

  // Criptografia de senha
  const salt = await bcrypt.genSalt(12)
  const hashSenha = await bcrypt.hash(senha, salt)
  let query = "INSERT INTO tecnico (nome, cpf_cnpj, email, telefone, especialidade, matricula, senha, foto) VALUES (?,?,?,?,?,?,?,?)"

  // Conexão com o banco e busca de dados
  db.getConnection((erro, conn) => {
    if(erro){
      console.log(erro)
      return res.status(400).send({ message: "Houve um erro, tente novamente mais tarde...", erro: erro }); 
    }
    conn.query(query,[nome, cpf_cnpj, email, telefone, especialidade,matricula, hashSenha, foto ], (error, result, fields) => {
      
      if(error){
        console.log(error)
        return res.status(400).send({message: "Houve um erro, tente novamente mais tarde...", erro: error})
      }
      
      return res.send(201).send({message: "Usuario cadastrado com sucesso", result})
      
    })
  })

})


routes.get("/", (req, res) => {
  // Faz a conexão com o banco de dados
  // error -> se houver erro
  // conn -> a conexão com o banco
  db.getConnection((error, conn) => {
    // Se houver um erro com a conexão retorna um erro
    if (error) {
      console.log(error);
      return res.status(400).send({ message: "Houve erro", erro: error});
    }

    // Pegar dados do formulário
    let query = "SELECT * FROM tecnico";

    // Faz a consulta no banco de dados passando a query acima
    // result -> resultado da query
    // fields -> os campos que acessou na tabela
    conn.query(query, (error, result, fields) => {
      // Fecha a conexão para ela não ficar aberta e dar problema
      conn.resume();

      // Se houver erro retorna
      if (error) {
        console.log(error);
        return res.status(400).send({ message: "Houve erro", erro: error});
      }

      // Se não retornar nenhum erro retorna o resultado da query
      return res.status(200).send(result);
    });
  });
});

module.exports = routes;
