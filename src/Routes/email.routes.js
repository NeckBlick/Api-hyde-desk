const express = require("express");
const routes = express.Router();
const db = require("../../conexao");
const bcrypt = require("bcryptjs");

/**
 * @swagger
 * /email:
 *   put:
 *     tags: [Email]
 *     summary: Enviar email
 *     description: Essa rota serve para enviar email
 *     produces: application/json
 *     parameters:
 *       - name: toemail
 *         description: Email do destinatário
 *         in: formData
 *         type: String
 *         required: true
 *       - name: tipoTabela
 *         description: o tpo da tabela em que o usuário está  cadastrado
 *         in: formData
 *         type: String
 *         required: true
 *     requestBody:
 *       description: Precisará passar os seguintes dados no corpo da requisição
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Email'
 *     responses:
 *       '201':
 *         description: Email enviado com sucesso!
 *       '500':
 *         description: Houve um erro ao conectar ao servidor, tente novamente mais tarde...
 * components:
 *  schemas:
 *    Email:
 *      type: object
 *      properties:
 *        toemail:
 *         type: string
 *         example: example@example.com
 *        tipoTabela:
 *         type: string
 *         example: tecnicos
 */
//Email
const axios = require("axios");
routes.post("/", async (req, res) => {
  const { toemail, tipoTabela } = req.body;
  let tipoEmail = "";

// Verificar o para quem vai o email
  if (tipoTabela === "empresas") {
    tipoEmail = "email_empresa";
  } else if (tipoTabela === "tecnicos") {
    tipoEmail = "email_tecnico";
  } else {
    tipoEmail = "email_funcionario";
  }
// Gerar token
  let token = "";
  for (let index = 0; index < 6; index++) {
    let aleatorio = Math.floor(Math.random() * 9);
    token = token + String(aleatorio);
  }
  let query = `SELECT * FROM ${tipoTabela} WHERE ${tipoEmail} = '${toemail}'`;

  var jsonData = {
    toemail: "",
    token: token,
    tipo: "senha",
  };
  // Conexão com o banco
  db.getConnection((error, conn) => {
    if (error) {
      return res
        .status(500)
        .send({ message: "Erro ao conectar com o banco", error: error });
    }

    conn.query(query, (error, result) => {
      conn.release();
      if (error) {
        return res.status(500).send({
          message: "Não foi possível enviar o email",
          error: error,
        });
      }
      if (result.length > 0) {
        // Criptografar o token
        bcrypt.genSalt(10, (err, salt) => {
          if(err){
            return res.status(500).send({message: "Erro ao criar a hash!"})
          }
          bcrypt.hash(token,salt,(error, hash) => {
            if (error) {
              return console.log(error);
            }
            nome = result[0].nome;
            jsonData.toemail = result[0][tipoEmail];
            if (jsonData.toemail.length > 0) {
              try {
                async function enviarEmail() {
                  const response = await axios.post(
                    "https://prod-13.eastus.logic.azure.com:443/workflows/fee1142331314a4a9bb6a563d49a7129/triggers/manual/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=aNldPawtiGMsBFfCrC1gKC0gwoUGchCaOjjLltr2pMg",
                    jsonData
                  );
                  return res
                    .status(201)
                    .send({ message: "Email enviado com sucesso!", token: hash });
                }
                enviarEmail();
              } catch (error) {
                return res.status(400).send({
                  message: "Não foi possível enviar o email",
                  error: error,
                });
              }
            }
          } )
        })
       
      } else {
        return res.status(404).send({
          message: "Não foi possivel encontrar o email nos nossos servidores",
        });
      }
    });
  });
});

module.exports = routes;
