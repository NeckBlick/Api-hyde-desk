const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../../conexao");
const jwt = require("jsonwebtoken");
const login = require("../../middlewares/login");
const fs = require("fs");
const upload = require("../../middlewares/uploadImagens");
const routes = express.Router();

// Buscar todos os funcionários
routes.get("/", login, (req, res, next) => {
  const filters = req.query;

  db.getConnection((erro, conn) => {
    if (erro) {
      return res.status(500).status({
        erro: erro,
      });
    }
    let query =
      "SELECT f.id_funcionario,f.nome,f.matricula,f.usuario,f.status_funcionario,f.senha,f.foto FROM funcionarios AS f INNER JOIN empresas AS e ON e.id_empresa = f.empresa_id";
    let keysFilters = Object.keys(filters);
    if (keysFilters.includes("nome")) {
      query += ` AND f.nome LIKE '${filters["nome"]}'`;
      keysFilters = keysFilters.filter((item) => item !== "nome");
    }
    if (keysFilters.length !== 0) {
      query += " WHERE";

      try {
        keysFilters.forEach((key, index) => {
          if (index !== keysFilters.length - 1) {
            query += ` ${key} LIKE '${filters[key]}' AND`;
          } else {
            query += ` ${key} LIKE '${filters[key]}'`;
          }
        });
      } catch (error) {
        return res.status(500).send({
          message: "Houve um erro, tente novamente mais tarde...",
          erro: error,
        });
      }
    }
    conn.query(query, (error, result, field) => {
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
routes.get("/:id", login, (req, res, next) => {
  const id_funcionario = req.params.id;
  const query = `SELECT * FROM funcionarios AS f INNER JOIN empresas AS e ON e.id_empresa = f.empresa_id WHERE id_funcionario = ${id_funcionario}`;

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

// Cadastro
routes.post("/cadastro", upload.single("foto"), async (req, res, next) => {
  const { nome, id_empresa, matricula, usuario, senha, confirmsenha } =
    req.body;
  const foto = req.file;

  // Validação
  if (!nome) {
    return res.status(422).send({ message: "O nome é obrigatório!" });
  }
  if (!matricula) {
    return res.status(422).send({ message: "A matricula é obrigatório!" });
  }
  if (!usuario) {
    return res.status(422).send({ message: "O usuario é obrigatório!" });
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

            let query = `INSERT INTO funcionarios (nome, usuario, matricula, foto, senha, status_funcionario, empresa_id) SELECT '${nome}','${usuario}','${matricula}','${foto.path}','${hashSenha}', 'Ativo', '${id_empresa}'`;

            conn.query(query, (error, result, fields) => {
              conn.release();
              if (error) {
                console.log(error);
                return res.status(500).send({
                  message: "Houve um erro, tente novamente mais tarde...",
                  erro: error,
                });
              }
              return res.status(201).send({
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
routes.post("/login", (req, res) => {
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

      let id = results[0].id_funcionario;

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
          return res.status(200).send({
            message: "Autenticado com sucesso!",
            token: token,
            id: id,
            tipo: "funcionarios",
          });
        }
        return res
          .status(401)
          .send({ message: "Matricula ou senha inválida!" });
      });
    });
  });
});

// Editar um funcionário
routes.put("/editar/:id", login, upload.single("foto"), (req, res, next) => {
  const { nome, usuario } = req.body;
  const id_funcionario = req.params.id;
  const foto = req.file;

  db.getConnection((error, conn) => {
    if (error) {
      return res.status(500).send({ error: error });
    }
    const query_get = `SELECT nome, usuario, foto FROM funcionarios WHERE id_funcionario = ${id_funcionario}`;

    conn.query(query_get, (error, result) => {
      // conn.release();
      if (error) {
        return res.status(500).send({ error: error });
      }
      const foto_antiga = result[0].foto;
      if (foto) {
        const query = `UPDATE funcionarios SET nome = '${nome}', usuario = '${usuario}', foto = ? WHERE id_funcionario = ${id_funcionario}`;

        conn.query(query, [foto.path], (error, result) => {
          conn.release();
          if (error) {
            return res.status(500).send({ error: error });
          }
          fs.unlinkSync(foto_antiga);
          return res
            .status(200)
            .send({ mensagem: "Dados alterados com sucesso." });
        });
      } else {
        const query = `UPDATE funcionarios SET nome = '${nome}', usuario = '${usuario}', foto = ? WHERE id_funcionario = ${id_funcionario}`;
        conn.query(query, [result[0].foto], (error, result) => {
          conn.release();
          if (error) {
            return res.status(500).send({ error: error });
          }
          return res
            .status(200)
            .send({ mensagem: "Dados alterados com sucesso." });
        });
      }
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
    const query_get = `SELECT senha FROM funcionarios WHERE email = ${email}`;

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

            const query = `UPDATE funcionarios SET senha = '${hashSenha}' WHERE email = ${email}`;

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
