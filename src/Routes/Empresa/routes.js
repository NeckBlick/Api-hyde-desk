const express = require("express")
const db = require('../../conexao')

const routes = express.Router()

routes.post('/', (req, res, next) => {

    //aqui faremos o a query com o banco de dados
    db.getConnection((error, conn) => {

        if (error) {
            return res.status(500).send({
                message: error
            })
        }

        //após escrevermos a query normalmente, criamos um array para iresirmos os valores req.bodu.{alguma coisa}
        conn.query(
            'INSERT INTO empresa (nome, cnpj, cep, numero_endereco, telefone, email, senha) VALUES (?, ?, ?, ?, ?,?, ?)',
            [req.body.nome, req.body.cnpj, req.body.cep, req.body.numero_endereco, req.body.telefone, req.body.email, req.body.senha],


            (error, result, field) => {

                //conn.resume() serve para liberar a conexão com o banco de dados para que as conexões abertas não travem as apis
                conn.resume()

                //com esse callback pegaremos os erros e a resposta do servidor
                if (error) {
                    //aqui capturamos o erro
                    res.status(500).send({
                        error: error,
                        response: null
                    })
                }
                //se não tiver erro retornaremos a mensagem e o id da empresa criada
                res.status(201).send({
                    message: "Iserindo empresa",
                    id_empresa: result.insertId
                })
            }
        )
    })

})


module.exports = routes