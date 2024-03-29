const express = require("express");
const axios = require("axios");
const db = require("../../conexao");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const login = require("../../middlewares/login");
const routes = express.Router();
const upload = require("../../middlewares/uploadImagens");

/**
 * @swagger
 * /empresas/{id}:
 *   get:
 *     tags: [Empresa]
 *     summary: Buscar a empresa pelo id
 *     description: Essa rota serve para buscar a empresa pelo id
 *     produces: application/json
 *     parameters:
 *       - name: id
 *         description: Id da empresa
 *         in: formData
 *         type: integer
 *         required: true
 *     requestBody:
 *       description: Precisará passar os seguintes dados no corpo da requisição
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Empresa'
 *     responses:
 *       '200':
 *         description: Resultado do banco.
 *       '422':
 *         description: Alguma informção faltando.
 *       '500':
 *         description: Houve um erro ao conectar ao servidor, tente novamente mais tarde...
 * components:
 *  schemas:
 *    Empresa:
 *      type: object
 *      properties:
 *        id:
 *         type: integer
 *         example: 2
 */
// Buscar uma empresa
routes.get("/:id", login, (req, res, next) => {
  const empresa = req.params.id;

  let query = `SELECT * FROM empresas WHERE id_empresa='${empresa}'`;

  db.getConnection((error, conn) => {
    if (error) {
      return res.status(500).send({
        message: error,
      });
    }
    conn.query(query, (error, result, field) => {
      conn.release();

      if (error) {
        res.status(500).send({
          error: error,
          response: null,
        });
      }
      res.status(200).send(result[0]);
    });
  });
});

/**
 * @swagger
 * /empresas/cadastro:
 *   post:
 *     tags: [Empresa]
 *     summary: Cadastrar uma empresa
 *     description: Essa rota serve para cadastrar uma empresa
 *     produces: application/json
 *     parameters:
 *       - name: nome
 *         description: Nome da empresa
 *         in: formData
 *         type: String
 *         required: true
 *       - name: cnpj
 *         description: CNPJ da empresa
 *         in: formData
 *         type: String
 *         required: true
 *       - name: email
 *         description: Email da empresa
 *         in: formData
 *         type: String
 *         required: true
 *       - name: telefone
 *         description: Telefone da empresa
 *         in: formData
 *         type: String
 *         required: true
 *       - name: foto
 *         description: Foto de perfil
 *         in: formData
 *         type: String
 *         required: true
 *       - name: cep
 *         description: Cep da empresa
 *         in: formData
 *         type: String
 *         required: true
 *       - name: numero_endereco
 *         description: Número de endereço da empresa
 *         in: formData
 *         type: String
 *         required: true
 *       - name: senha
 *         description: Senha do técnico
 *         in: formData
 *         type: String
 *         required: true
 *       - name: confirmarsenha
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
 *             $ref: '#/components/schemas/Empresa'
 *     responses:
 *       '200':
 *         description: Resultado do banco.
 *       '422':
 *         description: Alguma informção faltando.
 *       '500':
 *         description: Houve um erro ao conectar ao servidor, tente novamente mais tarde...
 * components:
 *  schemas:
 *    Empresa:
 *      type: object
 *      properties:
 *        nome:
 *         type: string
 *         example: Empresa do joão
 *        cnpj:
 *         type: string
 *         example: 33333333322
 *        email:
 *         type: string
 *         example: example@example.com
 *        telefone:
 *         type: string
 *         example: 11955554444
 *        foto:
 *         type: string
 *         example: Minha foto
 *        cep:
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
// Cadastro das empresas
routes.post("/cadastro", upload.single("foto"), async (req, res, next) => {
  const {
    nome,
    cnpj,
    cep,
    numero_endereco,
    telefone,
    email,
    senha,
    confirmarsenha,
  } = req.body;
  const foto = req.file;

  if (!nome) {
    return res.status(422).send({ message: "O nome é obrigatório!" });
  }
  if (!cnpj) {
    return res.status(422).send({ message: "O cnpj é obrigatório!" });
  }
  if (!email) {
    return res.status(422).send({ message: "O email é obrigatório!" });
  }
  if (!telefone) {
    return res.status(422).send({ message: "O telefone é obrigatório!" });
  }
  if (!cep) {
    return res.status(422).send({ message: "O cep é obrigatório!" });
  }
  if (!numero_endereco) {
    return res
      .status(422)
      .send({ message: "O número do endereço é obrigatório!" });
  }
  if (!foto) {
    return res.status(422).send({ message: "A foto é obrigatório!" });
  }
  if (!senha) {
    return res.status(422).send({ message: "A senha é obrigatório!" });
  }
  if (senha != confirmarsenha) {
    return res.status(422).send({ message: "As senhas são diferentes!" });
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
        return res.status(409).send({ message: "Empresa já cadastada!" });
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
              "INSERT INTO empresas (nome_empresa, cnpj, cep, numero_endereco, telefone, email_empresa,foto, senha, status_empresa) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Ativo')";

            conn.query(
              query,
              [
                nome,
                cnpj,
                cep,
                numero_endereco,
                telefone,
                email,
                foto.path,
                hashSenha,
              ],

              async (error, result, field) => {
                conn.release();
                if (error) {
                  res.status(500).send({
                    error: error,
                    response: null,
                  });
                }

                return res.status(201).send({
                  message: "Empresa cadastrada com sucesso!",
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

/**
 * @swagger
 * /empresas/login:
 *   post:
 *     tags: [Empresa]
 *     summary: Login da empresa a partir do cnpj
 *     description: Essa rota serve para a empresa efetuar o login através do cnpj
 *     produces: application/json
 *     parameters:
 *       - name: cnpj
 *         description: CNPJ da empresa
 *         in: formData
 *         type: String
 *         required: true
 *       - name: senha
 *         description: Senha do técnico
 *         in: formData
 *         type: String
 *         required: true
 *     requestBody:
 *       description: Precisará passar os seguintes dados no corpo da requisição
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmpresaLogin'
 *     responses:
 *       '200':
 *         description: Resultado do banco.
 *       '422':
 *         description: Alguma informção faltando.
 *       '500':
 *         description: Houve um erro ao conectar ao servidor, tente novamente mais tarde...
 * components:
 *  schemas:
 *    EmpresaLogin:
 *      type: object
 *      properties:
 *        cnpj:
 *         type: string
 *         example: 33333333322
 *        senha:
 *         type: string
 *         example: senha123
 */
// Login
routes.post("/login", (req, res) => {
  const { cnpj, senha } = req.body;

  if (!cnpj) {
    return res.status(422).send({ message: "O cnpj é obrigatório!" });
  }
  if (!senha) {
    return res.status(422).send({ message: "A senha é obrigatória!" });
  }

  db.getConnection((err, conn) => {
    if (err) {
      console.log(err);
      return res.status(500).send({ erro: err });
    }
    const query = "SELECT * FROM empresas WHERE cnpj = ?";
    conn.query(query, [cnpj], (erro, result, fields) => {
      conn.release();
      if (erro) {
        console.log(erro);
        return res.status(500).send({ erro: erro });
      }
      let results = JSON.parse(JSON.stringify(result));
      console.log(results);
      if (results.length < 1) {
        return res.status(401).send({ message: "Falha na autenticação!" });
      }

      let id = results[0].id_empresa;

      bcrypt.compare(senha, results[0].senha, (erro, result) => {
        if (erro) {
          return res.status(401).send({ message: "Falha na autenticação!" });
        }
        console.log(result);
        if (result) {
          let token = jwt.sign(
            {
              id_empresa: results[0].id_empresa,

              cnpj: results[0].matricula,
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
            tipo: "empresas",
          });
        }
        return res.status(401).send({ message: "CNPJ ou senha inválidos!" });
      });
    });
  });
});

/**
 * @swagger
 * /empresas/editar/{id}:
 *   put:
 *     tags: [Empresa]
 *     summary: Editar a empresa pelo id
 *     description: Essa rota serve para editar a empresa pelo id
 *     produces: application/json
 *     parameters:
 *       - name: nome
 *         description: Nome da empresa
 *         in: formData
 *         type: String
 *         required: true
 *       - name: email
 *         description: Email da empresa
 *         in: formData
 *         type: String
 *         required: true
 *       - name: telefone
 *         description: Telefone da empresa
 *         in: formData
 *         type: String
 *         required: true
 *       - name: foto
 *         description: Foto de perfil
 *         in: formData
 *         type: String
 *         required: true
 *       - name: cep
 *         description: Cep da empresa
 *         in: formData
 *         type: String
 *         required: true
 *       - name: numero_endereco
 *         description: Número de endereço da empresa
 *         in: formData
 *         type: String
 *         required: true
 *       - name: senha
 *         description: Senha do técnico
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
 *       '201':
 *         description: Editado com sucesso.
 *       '422':
 *         description: Alguma informção faltando.
 *       '500':
 *         description: Houve um erro ao conectar ao servidor, tente novamente mais tarde...
 * components:
 *  schemas:
 *    EmpresaId:
 *      type: object
 *      properties:
 *        nome:
 *         type: string
 *         example: Empresa do joão
 *        email:
 *         type: string
 *         example: example@example.com
 *        telefone:
 *         type: string
 *         example: 11955554444
 *        foto:
 *         type: string
 *         example: Minha foto
 *        cep:
 *         type: string
 *         example: 12345678
 *        numero_endereco:
 *         type: string
 *         example: 100
 *        senha:
 *         type: string
 *         example: senha123
 */
// atualizar empresa
routes.put("/editar/:id", login, upload.single("foto"),(req, res, next) => {
  const { nome, cep, numero_endereco, telefone, email } = req.body;
  const id_empresa = req.params.id;
  
  if (!nome) {
    return res.status(422).send({ message: "O nome é obrigatório!" });
  }
  if (!email) {
    return res.status(422).send({ message: "O email é obrigatório!" });
  }
  if (!telefone) {
    return res.status(422).send({ message: "O telefone é obrigatório!" });
  }
  if (!numero_endereco) {
    return res.status(422).send({ message: "O número de endereço é obrigatório!" });
  }
  if (!cep) {
    return res.status(422).send({ message: "O CEP é obrigatório!" });
  }
  const foto = req.file;
  db.getConnection((error, conn) => {
    if (error) {
      return res.status(500).send({ error: error });
    }
    const query_get = `SELECT nome_empresa, senha, cep, foto, numero_endereco, telefone, email_empresa FROM empresas WHERE id_empresa = ${id_empresa}`;

    conn.query(query_get, (error, result) => {
      // conn.release();
      if (error) {
        return res.status(500).send({ error: error });
      }

      const foto_antiga = result[0].foto;
      if (foto) {
        const query = `UPDATE empresas SET nome_empresa = '${nome}', foto = ?, cep = '${cep}', numero_endereco = '${numero_endereco}', telefone = '${telefone}', email_empresa = '${email}' WHERE id_empresa = ${id_empresa}`;

        conn.query(query, [foto.path], (error, result) => {
          conn.release();
          if (error) {
            return res.status(500).send({ error: error });
          }
          console.log(foto_antiga);
          fs.unlinkSync(foto_antiga);
        });
      } else {
        const query = `UPDATE empresas SET nome_empresa = '${nome}', foto = ?, cep = '${cep}', numero_endereco = '${numero_endereco}', telefone = '${telefone}', email_empresa = '${email}' WHERE id_empresa = ${id_empresa}`;
        conn.query(query, [result[0].foto], (error, result) => {
          conn.release();
          if (error) {
            return res.status(500).send({ error: error });
          }
        });
      }

      return res.status(200).send({ message: "Dados alterados com sucesso." });
    });
  });
});

/**
 * @swagger
 * /empresas/redefinir-senha/{email}:
 *   put:
 *     tags: [Empresa]
 *     summary: Editar a empresa pelo email
 *     description: Essa rota serve para editar a empresa pelo email
 *     produces: application/json
 *     parameters:
 *       - name: email
 *         description: Email da empresa
 *         in: formData
 *         type: String
 *         required: true
 *       - name: senha
 *         description: Nova senha da empresa
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

  console.log(senha);
  if (!senha) {
    return res.status(422).send({ message: "A senha é obrigatória!" });
  }

  db.getConnection((error, conn) => {
    if (error) {
      return res.status(500).send({ error: error });
    }
    const query_get = `SELECT senha FROM empresas WHERE email = '${email}'`;

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
              const query = `UPDATE empresas SET senha = '${hashSenha}' WHERE email_empresa = '${email}'`;

              conn.query(query, (error, result) => {
                conn.release();
                if (error) {
                  return res.status(500).send({ error: error });
                }
                return res
                  .status(200)
                  .send({ message: "Senha alterada com sucesso." });
              });
            });
          });
        } else {
          return res
            .status(401)
            .send({ message: "A nova senha não pode ser igual a anterior !" });
        }
      });
    });
  });
});

/**
 * @swagger
 * /empresas/desativar/{id}:
 *   put:
 *     tags: [Empresa]
 *     summary: Desativar a empresa no banco de dados
 *     description: Essa rota serve para desativar a empresa no banco de dados
 *     produces: application/json
 *     parameters:
 *       - name: id_empresa
 *         description: Id da empresa
 *         in: formData
 *         type: Number
 *         required: true
 *     requestBody:
 *       description: Precisará passar os seguintes dados no corpo da requisição
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmpresaDesativar'
 *     responses:
 *       '201':
 *         description: Editado com sucesso.
 *       '500':
 *         description: Houve um erro ao conectar ao servidor, tente novamente mais tarde...
 * components:
 *  schemas:
 *    EmpresaDesativar:
 *      type: object
 *      properties:
 *        id:
 *         type: Number
 *         example: 2
 */
routes.put("/desativar/:id_empresa", login, (req, res, next) => {
  const { id_empresa } = req.params;

  db.getConnection((error, conn) => {
    if (error) {
      return res.status(500).send({
        message: "Não foi possível desativar a empresa.",
        error: error,
      });
    }

    const query =
      "UPDATE empresas SET status_empresa = 'Desativado' WHERE id_empresa = ?";

    conn.query(query, [id_empresa], (error, result, fields) => {
      if (error) {
        return res.status(500).send({
          message: "Não foi possível desativar a empresa.",
          error: error,
        });
      }

      return res.status(200).send({
        message: "Empresa desativada com sucesso.",
      });
    });
  });
});

/**
 * @swagger
 * /empresas/ativar/{id}:
 *   put:
 *     tags: [Empresa]
 *     summary: Ativar a empresa no banco de dados
 *     description: Essa rota serve para ativar a empresa no banco de dados
 *     produces: application/json
 *     parameters:
 *       - name: id_empresa
 *         description: Id da empresa
 *         in: formData
 *         type: Number
 *         required: true
 *     requestBody:
 *       description: Precisará passar os seguintes dados no corpo da requisição
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmpresaDesativar'
 *     responses:
 *       '201':
 *         description: Editado com sucesso.
 *       '500':
 *         description: Houve um erro ao conectar ao servidor, tente novamente mais tarde...
 * components:
 *  schemas:
 *    EmpresaDesativar:
 *      type: object
 *      properties:
 *        id:
 *         type: Number
 *         example: 2
 */
routes.put("/ativar/:id_empresa", login, (req, res, next) => {
  const { id_empresa } = req.params;

  db.getConnection((error, conn) => {
    if (error) {
      return res.status(500).send({
        message: "Não foi possível ativar a empresa.",
        error: error,
      });
    }

    const query =
      "UPDATE empresas SET status_empresa = 'Ativo' WHERE id_empresa = ?";

    conn.query(query, [id_empresa], (error, result, fields) => {
      if (error) {
        return res.status(500).send({
          message: "Não foi possível ativar a empresa.",
          error: error,
        });
      }

      return res.status(200).send({
        message: "Empresa ativada com sucesso.",
      });
    });
  });
});

module.exports = routes;
