const express = require("express")
const routes = express.Router()


routes.get("/",(req, res, next) => {
    // Pegar dados do formulario
    const { nome, email } =  req.body


    // Validação dos dados
    if(!nome){
        return res.status(422).json({data:"Nome invalido!"})
    }

    const dados = {}

    // Resposta da API
    return res.status(200).send(dados)
})

module.exports = routes