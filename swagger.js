const options = {
    swaggerOptions:{
        openapi: "3.0.0",
        info: {
          title: "API de acesso hyde-desk",
          version: "0.1.0",
          description:
            "Essa API tem como objetivo a manipulação dos dados de quem está cadastrado em nosso site, tanto empresa, funcionário e técnico.",
            termsOfService: "http://swagger.io/terms/",
            contact: {
            name: "Equipe HydeDesk",
            url: "https://localhost:3001",
            email: "hydedesk@gmail.com",
          },
        },
        servers: [
          {
            url: "https://hdteste.azurewebsites.net",
            description: "Base URL"
          },
        ],
        apis: ["swagger.js"]
    }
}


/**
 * @swagger
 * /tecnicos:
 * post:
 *    description: Essa rota serve para cadastrar um técnico
 *    response: 
 *         '201':
 *              description: Técnico criado com sucesso!
 */
module.exports = options
