const express = require("express");
const bcrypt = require("bcrypt");
const path = require("path");
const jwt = require("jsonwebtoken");
const routes = express.Router();
const db = require("../../conexao");
const multer = require("multer");

// Configurações para imagem
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/');
  },
  filename: (req, file, cb) => {
    let date = new Date().toISOString();
    cb(null, date + file.originalname);
  },
});
const upload = multer({ storage: storage });

// Cadastro
routes.post("/cadastro", upload.single("anexo"), async (req, res) => {
  const foto = req.file.path
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
  var randomized = Math.ceil(Math.random() * Math.pow(10,6));//Cria um n�mero aleat�rio do tamanho definido em size.
	var digito = Math.ceil(Math.log(randomized));//Cria o d�gito verificador inicial
	while(digito > 10){   //Pega o digito inicial e vai refinando at� ele ficar menor que dez
			digito = Math.ceil(Math.log(digito));
		}
	var matricula = randomized + '-' + digito;
  // Criptografia de senha
  const salt = await bcrypt.genSalt(12);
  const hashSenha = await bcrypt.hash(senha, salt);
  let query =
    "INSERT INTO tecnico (nome, cpf_cnpj, email, telefone, especialidade, matricula, senha, foto) VALUES (?,?,?,?,?,?,?,?)";

  // Conexão com o banco e busca de dados
  db.getConnection((erro, conn) => {
    if (erro) {
      console.log(erro);
      return res
        .status(500)
        .send({
          message: "Houve um erro, tente novamente mais tarde...",
          erro: erro,
        });
    }
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
        conn.resume();
        if (error) {
          console.log(error);
          return res
            .status(500)
            .send({
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

module.exports = routes;
