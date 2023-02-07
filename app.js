const express = require("express");
const cors = require("cors");

const app = express();
app.use("/uploads", express.static("uploads"))
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
    message: "Seja bem vindo a API do Hyde Desk"
  })
})
// Rotas
const tecnicoRoutes = require("./src/Routes/tecnico.routes");
const chamadoRoutes = require("./src/Routes/chamado.routes");
const empresaRoutes = require("./src/Routes/empresa.routes");
const funcionarioRoutes = require("./src/Routes/funcionario.routes");

// Definição das rotas
app.use("/tecnicos", tecnicoRoutes);
app.use("/chamados", chamadoRoutes);
app.use("/empresas", empresaRoutes);
app.use("/funcionarios", funcionarioRoutes);


module.exports = app;
