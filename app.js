const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

const app = express();
app.use("/uploads", express.static("uploads"));
app.use(cors());
app.use(express.json());

// Cabeçalho de permissões, define quem pode acessar e os tipos de requisições
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );

  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    return res.status(200).send({});
  }

  next();
});

app.get("/", (req, res) => {
  return res.status(200).send({
    message: "Seja bem vindo a API do Hyde Desk",
  });
});

// Rotas
const tecnicoRoutes = require("./src/Routes/tecnico.routes");
const chamadoRoutes = require("./src/Routes/chamado.routes");
const empresaRoutes = require("./src/Routes/empresa.routes");
const funcionarioRoutes = require("./src/Routes/funcionario.routes");
const conclusaoRoutes = require("./src/Routes/conclusao.routes");
const emailRoutes = require("./src/Routes/email.routes");




const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API do sistema help desk HydeDesk",
      version: "0.1.0",
      description:
        "Essa API tem como objetivo a manipulação dos dados de quem está cadastrado em nosso site.Empresa, funcionário e técnico.",
      termsOfService: "http://swagger.io/terms/",
      contact: {
        name: "Equipe HydeDesk",
        url: "https://localhost:3001",
        email: "hydedesk@gmail.com",
      },
    },
  },
  servers: [{
    url: "https://hdteste.azurewebsites.net",
    description: "Base URL"
  }],
  apis:["./src/Routes/*.js"]
};

const openapiSpecification = swaggerJsdoc(options);

/**
 * @swagger
 *  /empresas/cadastro:
 *    post:
 *      tags: [Empresas]

 *      description: Essa rota serve para cadastrar um técnico
 *      produces: application/json
 *      parameters:
 *        - name: nome
 *          description: Nome da empresa
 *          in: formData
 *          type: String
 *          required: true
 *        - name: cnpj
 *          description: CNPJ da empresa
 *          in: formData
 *          type: String
 *          required: true
 *        - name: email
 *          description: Email do técnico
 *          in: formData
 *          type: String
 *          required: true
 *        - name: foto
 *          description: Foto de perfil
 *          in: formData
 *          type: String
 *          required: true
 *        - name: especialidade
 *          description: Especialidade do técnico
 *          in: formData
 *          type: String
 *          required: true
 *        - name: telefone
 *          description: Telefone do técnico
 *          in: formData
 *          type: String
 *          required: true
 *        - name: senha
 *          description: Senha do técnico
 *          in: formData
 *          type: String
 *          required: true
 *        - name: confirmsenha
 *          description: Confirmar a senha 
 *          in: formData
 *          type: String
 *          required: true
 *      requestBody:
 *        description: Precisará passar os seguintes dados no corpo da requisição
 *        required: true
 *        content:
 *          multipart/form-data:
 *            schema:
 *              $ref: '#/components/schemas/Tecnico'
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Tecnico'
 *      responses:
 *        '201':
 *          description: Técnico criado com sucesso!
 *        '422':
 *          description: Alguma informção faltando.
 *        '500':
 *          description: Houve um erro ao conectar ao servidor, tente novamente mais tarde...
 *  /empresas/login:
 *    post:
 *      tags: [Empresas]
 *      description: Essa rota serve para o técnico efetuar o login
 *      produces: application/json
 *      parameters:
 *        - name: cpf
 *          description: CPF do técnico
 *          in: formData
 *          type: String
 *          required: true
 *        - name: senha
 *          description: Senha do técnico
 *          in: formData
 *          type: String
 *          required: true
 *      requestBody:
 *        description: Precisará passar os seguintes dados no corpo da requisição
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Tecnicologin'
 *      responses:
 *        '201':
 *          description: Autenticado com sucesso!
 *        '422':
 *          description: Alguma informção faltando.
 *        '500':
 *          description: Houve um erro ao conectar ao servidor, tente novamente mais tarde...
 *components:
 *  schemas:
 *    Tecnico:
 *      type: object
 *      properties:
 *        nome:
 *         type: string
 *         example: João
 *        cpf:
 *         type: string
 *         example: 33333333322
 *        telefone:
 *         type: string
 *         example: 11955554444
 *        email:
 *         type: string
 *         example: example@example.com
 *        especialidade:
 *         type: string
 *         example: Desenvolvedor
 *        foto:
 *         type: string
 *         example: Minha foto
 *        senha:
 *         type: string
 *         example: senha123
 *        confirmsenha:
 *         type: string
 *         example: senha123
 *    Tecnicologin:
 *      type: object
 *      properties:
 *        cpf:
 *         type: string
 *         example: 33333333322
 *        senha:
 *         type: string
 *         example: senha123
 */


// Definição das rotas
app.use("/tecnicos", tecnicoRoutes);
app.use("/chamados", chamadoRoutes);
app.use("/empresas", empresaRoutes);
app.use("/funcionarios", funcionarioRoutes);
app.use("/email", emailRoutes);
app.use("/conclusoes", conclusaoRoutes);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openapiSpecification));
module.exports = app;
