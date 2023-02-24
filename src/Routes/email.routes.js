const express = require("express");
const routes = express.Router();

//Email
const axios = require("axios");
routes.post("/", async (req, res) => {
  const { toemail, menssage, assunto, nome } = req.body;
  
  var jsonData = {
    toemail: toemail,
    menssage: menssage,
    assunto: assunto,
    nome: nome,
  };
  

  try {
    const response = await axios.post("https://prod2-16.eastus.logic.azure.com:443/workflows/84d96003bf1947d3a28036ee78348d4b/triggers/manual/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=5BhPfg9NSmVU4gYJeUVD9yqkJPZACBFFxj0m1-KIY0o", jsonData);
    return res.status(201).send({menssage: "Email enviado com sucesso!"})
    console.log(response.status);
  } catch (error) {
    console.log(error);
    return res.status(401).send({menssage: error})
  }
});

module.exports = routes
