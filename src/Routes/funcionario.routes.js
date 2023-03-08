const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../../conexao");
const jwt = require("jsonwebtoken");
const login = require("../../middlewares/login");
const fs = require("fs");
const upload = require("../../middlewares/uploadImagens");
const routes = express.Router();


/**
 * @swagger
 * /funcionarios/:
 *   get:
 *     tags: [Funcionarios]
 *     summary: Buscar todos os funcionários
 *     description: Essa rota serve para buscar todos os funcionarios
 *     produces: application/json
 *     requestBody:
 *       description: Precisará passar os seguintes dados no corpo da requisição
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Funcionarios'
 *     responses:
 *       '200':
 *         description: Resultado do banco.
 *       '500':
 *         description: Houve um erro ao conectar ao servidor, tente novamente mais tarde...
 * components:
 *  schemas:
 *    Funcionarios:
 *      type: array
 *      items:
 *        id:
 *         type: integer
 *         example: 2
 */

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
      "SELECT f.id_funcionario,f.nome_funcionario,f.email_funcionario,f.matricula,f.usuario,f.status_funcionario,f.senha,f.foto FROM funcionarios AS f INNER JOIN empresas AS e ON e.id_empresa = f.empresa_id";
    let keysFilters = Object.keys(filters);
    if (keysFilters.includes("nome_funcionario")) {
      query += ` AND f.nome LIKE '${filters["nome_funcionario"]}'`;
      keysFilters = keysFilters.filter((item) => item !== "nome_funcionario");
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


/**
 * @swagger
 * /funcionarios/{id}:
 *   get:
 *     tags: [Funcionarios]
 *     summary: Buscar um funcionário
 *     description: Essa rota serve para buscar um funcionario
 *     produces: application/json
 *     requestBody:
 *       description: Precisará passar os seguintes dados no corpo da requisição
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Funcionarios'
 *     responses:
 *       '200':
 *         description: Resultado do banco.
 *       '500':
 *         description: Houve um erro ao conectar ao servidor, tente novamente mais tarde...
 * components:
 *  schemas:
 *    Funcionarios:
 *      type: array
 *      items:
 *        id:
 *         type: integer
 *         example: 2
 */
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

/**
 * @swagger
 * /funcionarios/cadastro:
 *   post:
 *     tags: [Funcionarios]
 *     summary: Cadastrar um funcionário
 *     description: Essa rota serve para cadastrar um funcionário
 *     produces: application/json
 *     parameters:
 *       - name: nome
 *         description: Nome do funcionário
 *         in: formData
 *         type: String
 *         required: true
 *       - name: email
 *         description: Email do funcionário
 *         in: formData
 *         type: String
 *         required: true
 *       - name: matricula
 *         description: Matricula do funcionário
 *         in: formData
 *         type: String
 *         required: true
 *       - name: usuario
 *         description: Usuário do funcionario
 *         in: formData
 *         type: String
 *         required: true
 *       - name: id_empresa
 *         description: Id da empresa que ele presta serviço
 *         in: formData
 *         type: String
 *         required: true
 *       - name: senha
 *         description: Senha do funcionário
 *         in: formData
 *         type: String
 *         required: true
 *       - name: confirmsenha
 *         description: Confirmar a senha 
 *         in: formData
 *         type: String
 *         required: true
 *     requestBody:
 *       description: Precisará passar os seguintes dados no corpo da requisição
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/FuncionarioCadastro'
 *     responses:
 *       '201':
 *         description: Cadastrado com sucesso!
 *       '422':
 *         description: Alguma informção faltando.
 *       '500':
 *         description: Houve um erro ao conectar ao servidor, tente novamente mais tarde...
 * components:
 *  schemas:
 *    FuncionarioCadastro:
 *      type: object
 *      properties:
 *        nome:
 *         type: string
 *         example: Empresa do joão
 *        email:
 *         type: string
 *         example: example@example.com
 *        matricula:
 *         type: string
 *         example: 11955554444
 *        id_empresa:
 *         type: Number
 *         example: 1
 *        usuario:
 *         type: string
 *         example: 12345678
 *        numero_endereco:
 *         type: string
 *         example: 100
 *        senha:
 *         type: string
 *         example: senha123
 *        confirmsenha:
 *         type: string
 *         example: senha123
 */
// Cadastro
routes.post("/cadastro", upload.single("foto"), async (req, res, next) => {
  const { nome, id_empresa, matricula, email, usuario, senha, confirmsenha } =
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

            let query = `INSERT INTO funcionarios (nome_funcionario, usuario, email_funcionario ,matricula, foto, senha, status_funcionario, empresa_id) SELECT '${nome}','${usuario}','${email}','${matricula}','${foto.path}','${hashSenha}', 'Ativo', '${id_empresa}'`;

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



/**
 * @swagger
 * /funcionarios/login:
 *   post:
 *     tags: [Funcionarios]
 *     summary: Login do funcionário
 *     description: Essa rota serve para o funcionário fazer login
 *     produces: application/json
 *     parameters:
 *       - name: usuario
 *         description: Usuario do funcionário
 *         in: formData
 *         type: String
 *         required: true
 *       - name: senha
 *         description: Senha do funcionário
 *         in: formData
 *         type: String
 *         required: true
 *     requestBody:
 *       description: Precisará passar os seguintes dados no corpo da requisição
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/FuncionarioLogin'
 *     responses:
 *       '200':
 *         description: Resultado do banco.
 *       '422':
 *         description: Alguma informção faltando.
 *       '500':
 *         description: Houve um erro ao conectar ao servidor, tente novamente mais tarde...
 * components:
 *  schemas:
 *    FuncionarioLogin:
 *      type: object
 *      properties:
 *        usuario:
 *         type: string
 *         example: joão
 *        senha:
 *         type: string
 *         example: senha123
 */
// Login
routes.post("/login", (req, res) => {
  const { usuario , senha } = req.body;

  if (!usuario) {
    return res.status(422).send({ message: "O usuário ou email são obrigatórios!" });
  }
  if (!senha) {
    return res.status(422).send({ message: "A senha é obrigatória!" });
  }

  db.getConnection((err, conn) => {
    if (err) {
      console.log(err);
      return res.status(500).send({ erro: err });
    }
    const query = "SELECT * FROM funcionarios WHERE usuario = ? OR email_funcionario = ?";
    conn.query(query, [usuario,usuario], (erro, result, fields) => {
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


/**
 * @swagger
 * /funcionarios/editar/{id}:
 *   put:
 *     tags: [Funcionarios]
 *     summary: Editar o funcionario pelo id
 *     description: Essa rota serve para editar o funcionario pelo id
 *     produces: application/json
 *     parameters:
 *       - name: nome
 *         description: Nome do funcionario
 *         in: formData
 *         type: String
 *         required: true
 *       - name: email
 *         description: Email do funcionario
 *         in: formData
 *         type: String
 *         required: true
 *       - name: foto
 *         description: Foto do funcionario
 *         in: formData
 *         type: String
 *         required: false
 *       - name: usuario
 *         description: Usuario do funcionario
 *         in: formData
 *         type: String
 *         required: true
 *     requestBody:
 *       description: Precisará passar os seguintes dados no corpo da requisição
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/EmpresaId'
 *     responses:
 *       '200':
 *         description: Dados alterados com sucesso..
 *       '500':
 *         description: Houve um erro ao conectar ao servidor, tente novamente mais tarde...
 * components:
 *  schemas:
 *    EmpresaId:
 *      type: object
 *      properties:
 *        nome:
 *         type: string
 *         example: Nome do joão
 *        email:
 *         type: string
 *         example: example@example.com
 *        foto:
 *         type: string
 *         example: Minha foto
 */
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
        const query = `UPDATE funcionarios SET nome_funcionario = '${nome}', usuario = '${usuario}', foto = ? WHERE id_funcionario = ${id_funcionario}`;

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
        const query = `UPDATE funcionarios SET nome_funcionario = '${nome}', usuario = '${usuario}', foto = ? WHERE id_funcionario = ${id_funcionario}`;
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


/**
 * @swagger
 * /funcionarios/redefinir-senha/{email}:
 *   put:
 *     tags: [Funcionarios]
 *     summary: Editar o funcionário pelo email
 *     description: Essa rota serve para editar o funcionario pelo email
 *     produces: application/json
 *     parameters:
 *       - name: email
 *         description: Email do funcionario
 *         in: formData
 *         type: String
 *         required: true
 *       - name: senha
 *         description: Nova senha do funcionario
 *         in: formData
 *         type: String
 *         required: true
 *     requestBody:
 *       description: Precisará passar os seguintes dados no corpo da requisição
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmailEmpresa'
 *     responses:
 *       '201':
 *         description: Editado com sucesso.
 *       '422':
 *         description: Alguma informção faltando.
 *       '500':
 *         description: Houve um erro ao conectar ao servidor, tente novamente mais tarde...
 * components:
 *  schemas:
 *    EmailEmpresa:
 *      type: object
 *      properties:
 *        email:
 *         type: string
 *         example: example@example.com
 *        senha:
 *         type: string
 *         example: senha123
 */
routes.put("/redefinir-senha/:email", (req, res, next) => {
  const { senha } = req.body;
  const { email } = req.params;

  console.log(senha)
  if (!senha) {
    return res.status(422).send({ message: "A senha é obrigatória!" });
  }

  db.getConnection((error, conn) => {
    if (error) {
      return res.status(500).send({ error: error });
    }
    const query_get = `SELECT senha FROM funcionarios WHERE email_funcionario = '${email}'`;

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
        if (!result) {
          bcrypt.genSalt(10, (err, salt) => {
            if (err) {
              return next(err);
            }
            
            bcrypt.hash(senha, salt, (errorCrypt, hashSenha) => {
              const query = `UPDATE funcionarios SET senha = '${hashSenha}' WHERE email_funcionario = '${email}'`;
  
              conn.query(query, (error, result) => {
                conn.release();
                if (error) {
                  return res.status(500).send({ error: error });
                }
                return res
                .status(200)
                .send({ mensagem: "Senha alterada com sucesso." });
              });
            });
          });
        }else{
          return res.status(401).send({ message: "A nova senha não pode ser igual a anterior !" });
        }
      });
    });
  });
});



/**
 * @swagger
 * /funcionarios/desativar/{id}:
 *   post:
 *     tags: [Funcionarios]
 *     summary: Desativar o funcionário
 *     description: Essa rota serve para desativar o funcionario
 *     produces: application/json
 *     parameters:
 *       - name: id_funcionario
 *         description: Id do funcionário
 *         in: formData
 *         type: String
 *         required: true
 *     requestBody:
 *       description: Precisará passar os seguintes dados no corpo da requisição
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/FuncionarioDesativar'
 *     responses:
 *       '200':
 *         description: Resultado do banco.
 *       '422':
 *         description: Alguma informção faltando.
 *       '500':
 *         description: Houve um erro ao conectar ao servidor, tente novamente mais tarde...
 * components:
 *  schemas:
 *    FuncionarioDesativar:
 *      type: object
 *      properties:
 *        id:
 *         type: integer
 *         example: joao
 */
routes.put("/desativar/:id_funcionario", login, (req, res, next) => {
  const { id_funcionario } = req.params;

  db.getConnection((error, conn) => {
    if (error) {
      return res.status(500).send({
        message: "Não foi possível desativar o funcionário.",
        error: error,
      });
    }

    const query =
      "UPDATE funcionarios SET status_funcionario = 'Desativado' WHERE id_funcionario = ?";

    conn.query(query, [id_funcionario], (error, result, fields) => {
      if (error) {
        return res.status(500).send({
          message: "Não foi possível desativar o funcionário.",
          error: error,
        });
      }

      return res.status(200).send({
        message: "Funcionário desativado com sucesso.",
      });
    });
  });
});


/**
 * @swagger
 * /funcionarios/ativar/{id}:
 *   post:
 *     tags: [Funcionarios]
 *     summary: Ativar o funcionário
 *     description: Essa rota serve para ativar o funcionario
 *     produces: application/json
 *     parameters:
 *       - name: id_funcionario
 *         description: Id do funcionário
 *         in: formData
 *         type: String
 *         required: true
 *     requestBody:
 *       description: Precisará passar os seguintes dados no corpo da requisição
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/FuncionarioAtivar'
 *     responses:
 *       '200':
 *         description: Resultado do banco.
 *       '422':
 *         description: Alguma informção faltando.
 *       '500':
 *         description: Houve um erro ao conectar ao servidor, tente novamente mais tarde...
 * components:
 *  schemas:
 *    FuncionarioAtivar:
 *      type: object
 *      properties:
 *        id:
 *         type: integer
 *         example: joao
 */
routes.put("/ativar/:id_funcionario", login, (req, res, next) => {
  const { id_funcionario } = req.params;

  db.getConnection((error, conn) => {
    if (error) {
      return res.status(500).send({
        message: "Não foi possível ativar o funcionário.",
        error: error,
      });
    }

    const query =
      "UPDATE funcionarios SET status_funcionario = 'Ativo' WHERE id_funcionario = ?";

    conn.query(query, [id_funcionario], (error, result, fields) => {
      if (error) {
        return res.status(500).send({
          message: "Não foi possível ativar o funcionário.",
          error: error,
        });
      }

      return res.status(200).send({
        message: "Funcionário ativado com sucesso.",
      });
    });
  });
});

module.exports = routes;