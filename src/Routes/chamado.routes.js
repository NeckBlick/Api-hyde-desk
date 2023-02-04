const express = require("express");
const db = require("../../conexao");
const upload = require("../../middlewares/uploadImagens");

const routes = express.Router();

//Buscar todos os chamados
routes.get("/", (req, res, next) => {
    db.getConnection((error, conn) => {

        
      conn.query(
        "SELECT * FROM chamados",
  
        (error, result, field) => {
          conn.resume();
  
          if (error) {
            res.status(500).send({
              error: error,
              response: null,
            });
          }
          res.status(200).send(result);
        }
      );
    });
  });
  
// Buscar um tecnico
  routes.get("/:id", (req, res, next) =>{
    const id_chamado = req.params.id

    const query = `SELECT * FROM chamados WHERE id_chamados = ${id_chamado}`

    db.getConnection((error, conn) =>{
        conn.query(query, (error, result) =>{
            if(error){
                return res.status(500).send({
                    error: error
                })
            }

            return res.status(200).send({
                result: result
            })
        })
    })
  })


// Criação dos chamados
routes.post("/criar", upload.single("anexo"), (req, res, next) => {
  const anexo = req.file.path;
  const { prioridade, patrimonio, problema, descricao, setor, funcionario_id } =
    req.body;
  if (!prioridade) {
    return res.status(422).send({ message: "A prioridade é obrigatório." });
  }
  if (!patrimonio) {
    return res.status(422).send({ message: "O patrimonio é obrigatório." });
  }
  if (!problema) {
    return res.status(422).send({ message: "A problema é obrigatório." });
  }
  if (!descricao) {
    return res.status(422).send({ message: "A descrição é obrigatório." });
  }
  if (!setor) {
    return res.status(422).send({ message: "O setor é obrigatório." });
  }
  if (!funcionario_id) {
    return res
      .status(422)
      .send({ message: "O ID do funcionário é obrigatório." });
  }

  var randomized = Math.ceil(Math.random() * Math.pow(12, 8)); //Cria um n�mero aleat�rio do tamanho definido em size.
  var digito = Math.floor(Math.random() * 10); // Cria o d�gito verificador inicial

  var cod_verificacao = randomized + "-" + digito;

  db.getConnection((error, conn) => {
    if (error) {
      console.log(error);
      return res.status(500).send({
        message: "Houve um erro, tente novamente mais tarde...",
        erro: error,
      });
    }

    let query =
      "INSERT INTO chamados (prioridade, patrimonio, problema, descricao, anexo, setor, cod_verificacao, status, data, tecnico_id, funcionario_id) VALUES (?, ?, ?, ?, ?, ?, ?, 'pendente', NOW(), NULL, ?)";

    conn.query(
      query,
      [
        prioridade,
        patrimonio,
        problema,
        descricao,
        anexo,
        setor,
        cod_verificacao,
        funcionario_id,
      ],
      (error, result, fields) => {
        conn.release();
        if (error) {
          console.log(error);
          return res.status(500).send({
            message: "Houve um erro, tente novamente mais tarde...",
            erro: error,
          });
        }

        return res.status(200).send({ message: "Chamado aberto com sucesso." });
      }
    );
  });
});

module.exports = routes;
