const express = require("express")
const bcrypt = require("bcrypt");
const db = require("../../conexao");
const routes = express.Router()

routes.post("/cadastro", async (req, res) => {
    const {
      nome,
      nome_empresa,
      matricula,
      usuario,
      senha,
      confirmsenha,
    } = req.body;
  
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
  
    // Criptografia de senha
    const salt = await bcrypt.genSalt(12);
    const hashSenha = await bcrypt.hash(senha, salt);
    let query =
      `INSERT INTO funcionarios (nome,usuario, matricula, senha, empresa_id) SELECT ${nome},${usuario},${matricula},${hashSenha}, id_empresa FROM empresa WHERE nome LIKE ${nome_empresa}`
  
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

module.exports = routes