const express = require("express");
const routes = express.Router();
const db = require("../../conexao");



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
  let token = ""
  for (let index = 0; index < 6; index++) {
    let aleatorio = Math.floor(Math.random() * 9)
    token = token + String(aleatorio)
  }
  let nome = ""
  const { toemail, tipoTabela } = req.body;
  let query = `SELECT * FROM ${tipoTabela} WHERE email = '${toemail}'`

  db.getConnection((error, conn) => {
    if(error){
      return res.status(500).send({ message: error, })
    }
    conn.query(query, (error, result) => {
      conn.release();
      if (error) {
        res.status(500).send({
          error: error,
          response: null,
        });
      }
      nome = result[0].nome
    })
  })
  var jsonData = {
    toemail: toemail,
    nome: nome,
    token: token,
    tipo: "senha"
  };

  try {
    const response = await axios.post("https://prod2-16.eastus.logic.azure.com:443/workflows/84d96003bf1947d3a28036ee78348d4b/triggers/manual/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=5BhPfg9NSmVU4gYJeUVD9yqkJPZACBFFxj0m1-KIY0o", jsonData);
    return res.status(201).send({menssage: "Email enviado com sucesso!", token: token})
    console.log(response.status);
  } catch (error) {
    console.log(error);
    return res.status(401).send({menssage: error})
  }
  
});

module.exports = routes
