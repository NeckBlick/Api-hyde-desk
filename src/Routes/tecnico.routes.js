require("dotenv").config();
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const axios = require("axios");
const routes = express.Router();
const db = require("../../conexao");
const upload = require("../../middlewares/uploadImagens");
const login = require("../../middlewares/login");

// Cadastrar tecnico
routes.post("/cadastro", upload.single("foto"), async (req, res) => {
  const { nome, cpf, email, especialidade, telefone, senha, confirmsenha } =
    req.body;
  const foto = req.file;

  // Validação
  if (!nome) {
    return res.status(422).send({ message: "O nome é obrigatório!" });
  }
  if (!cpf) {
    return res.status(422).send({ message: "O CPF é obrigatório!" });
  }
  if (!email) {
    return res.status(422).send({ message: "O email é obrigatório!" });
  }
  if (!telefone) {
    return res.status(422).send({ message: "O telefone é obrigatório!" });
  }
  if (!especialidade) {
    return res.status(422).send({ message: "A especialidade é obrigatório!" });
  }
  if (!foto) {
    return res.status(422).send({ message: "A foto é obrigatório!" });
  }
  if (!senha) {
    return res.status(422).send({ message: "A senha é obrigatório!" });
  }
  if (senha != confirmsenha) {
    return res.status(422).send({ message: "As senhas são diferentes!" });
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
    let query = "SELECT * FROM tecnicos WHERE cpf = ?";
    conn.query(query, [cpf], (erro, result) => {
      if (erro) {
        return res.status(500).send({ erro: erro });
      }
      if (result.length > 0) {
        return res.status(409).send({ message: "Técnico já cadastado!" });
      } else {
        // Criptografia de senha
        bcrypt.genSalt(10, (err, salt) => {
          if (err) {
            return next(err);
          }
          bcrypt.hash(senha, salt, (errorCrypt, hashSenha) => {
            if (errorCrypt) {
              return console.log(errorCrypt);
            }

            let query =
              "INSERT INTO tecnicos (nome, cpf, email, telefone, especialidade, matricula, senha, foto, status_tecnico) VALUES (?,?,?,?,?,?,?,?, 'Ativo')";

            conn.query(
              query,
              [
                nome,
                cpf,
                email,
                telefone,
                especialidade,
                matricula,
                hashSenha,
                foto.path,
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
                try {
                  var jsonData = {
                    toemail: email,
                    nome: nome,
                    tipo: cadastro
                  };
                  const response = await axios.post("https://prod2-16.eastus.logic.azure.com:443/workflows/84d96003bf1947d3a28036ee78348d4b/triggers/manual/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=5BhPfg9NSmVU4gYJeUVD9yqkJPZACBFFxj0m1-KIY0o", jsonData);
                  if(response.status == 200){
                    return res.status(201).send({
                      message: "Técnico cadastrado com sucesso!",
                      id_tecnico: result.insertId,
                    });
                  }
                } catch (error) {
                  return res.status(401).send({menssage: error})
                }
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
  const { cpf, senha } = req.body;

  if (!cpf) {
    return res.status(422).send({ message: "O cpf é obrigatório!" });
  }
  if (!senha) {
    return res.status(422).send({ message: "A senha é obrigatória!" });
  }

  db.getConnection((err, conn) => {
    if (err) {
      console.log(err);
      return res.status(500).send({ erro: err });
    }
    const query = "SELECT * FROM tecnicos WHERE cpf = ?";
    conn.query(query, [cpf], (erro, result, fields) => {
      conn.release();
      if (erro) {
        console.log(erro);
        return res.status(500).send({ erro: erro });
      }
      let results = JSON.parse(JSON.stringify(result));
      if (results.length < 1) {
        return res.status(401).send({ message: "Cpf ou senha inválidos!" });
      }

      let id = results[0].id_tecnico

      bcrypt.compare(senha, results[0].senha, (erro, result) => {
        if (erro) {
          return res.status(401).send({ message: "Falha na autenticação!" });
        }
        if (result) {
          let token = jwt.sign(
            {
              id_tecnico: results[0].id_tecnico,
              cpf: results[0].cpf,
            },
            process.env.JWT_KEY,
            {
              expiresIn: "1d",
            }
          );
          return res
            .status(200)
            .send({ message: "Autenticado com sucesso!", token: token, id: id, tipo: "tecnicos" });
        }
        return res.status(401).send({ message: "Cpf ou senha inválidos!" });
      });
    });
  });
});

// Chamar técnico em específico
routes.get("/:id", login, (req, res, next) => {
  const id_tecnico = req.params.id;
  const query = `SELECT * FROM tecnicos WHERE id_tecnico = ${id_tecnico}`;

  db.getConnection((error, conn) => {
    if (error) {
      return res.status(500).send({ error: error });
    }

    conn.query(query, (error, result) => {
      conn.release();
      if (error) {
        return res.status(500).send({
          error: error,
        });
      }
      return res.status(200).send(result[0]);
    });
  });
});

// Editar um Tecnico
routes.put("/editar/:id", login, upload.single("foto"), (req, res, next) => {
  const { nome, email, especialidade, telefone } = req.body;
  const id_tecnico = req.params.id;
  

  if (!nome) {
    return res.status(422).send({ message: "O nome é obrigatório!" });
  }

  if (!email) {
    return res.status(422).send({ message: "O email é obrigatório!" });
  }
  if (!telefone) {
    return res.status(422).send({ message: "O telefone é obrigatório!" });
  }
  if (!especialidade) {
    return res.status(422).send({ message: "A especialidade é obrigatório!" });
  }

  const foto = req.file;
  db.getConnection((error, conn) => {
    if (error) {
      return res.status(500).send({ error: error });
    }
    const query_get = `SELECT nome, email, foto, especialidade, telefone FROM tecnicos WHERE id_tecnico = ${id_tecnico}`;

    conn.query(query_get, (error, result) => {
      // conn.release();
      if (error) {
        return res.status(500).send({ error: error });
      }

      const foto_antiga = result[0].foto
      if (foto) {
        const query = `UPDATE tecnicos SET nome = '${nome}', foto = ?, especialidade = '${especialidade}', telefone = '${telefone}', email = '${email}' WHERE id_tecnico = ${id_tecnico}`;

        conn.query(query, [foto.path], (error, result) => {
          conn.release();
          if (error) {
            return res.status(500).send({ error: error });
          }
          console.log(foto_antiga)
          fs.unlinkSync(foto_antiga)

        });

      
      } else {
        const query = `UPDATE tecnicos SET nome = '${nome}', foto = ?, especialidade = '${especialidade}', telefone = '${telefone}', email = '${email}' WHERE id_tecnico = ${id_tecnico}`;
        conn.query(query, [result[0].foto], (error, result) => {
          conn.release();
          if (error) {
            return res.status(500).send({ error: error });
          }
        });
      }



      return res
        .status(200)
        .send({ mensagem: "Dados alterados com sucesso." });
    });
  });
});

routes.put("/editar/:email", (req, res, next) => {
  const { senha } = req.body;
  const email = req.params.id;

  db.getConnection((error, conn) => {
    if (error) {
      return res.status(500).send({ error: error });
    }
    const query_get = `SELECT senha FROM tecnicos WHERE email = ${email}`;

    conn.query(query_get, (error, result) => {
      // conn.release();
      if (error) {
        return res.status(500).send({ error: error });
      }
      bcrypt.compare(senha, result[0].senha, (erro, result) => {
        if (erro) {
          return res.status(401).send({ message: "Falha na autenticação!" });
        }
        console.log(result);
        if (result) {
          return res.status(422).send({
            message: "A nova senha não pode ser igual a antiga!",
          });
        }


        bcrypt.genSalt(10, (err, salt) => {
          if (err) {
            return next(err);
          }

          bcrypt.hash(senha, salt, (errorCrypt, hashSenha) => {

            const query = `UPDATE tecnicos SET senha = '${hashSenha}' WHERE email = ${email}`;

            conn.query(query, (error, result) => {
              conn.release();
              if (error) {
                return res.status(500).send({ error: error });
              }
            });
    
            return res.status(200).send({ mensagem: "Dados alterados com sucesso." })

          })
        })
        
      });
    });
  });
});
module.exports = routes;
