const express = require("express");
const cors = require("cors");

const app = express();
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

// Rotas
const tecnicoRoutes = require("./Routes/tecnico.routes");
const chamadoRoutes = require("./Routes/chamado.routes");
const empresaRoutes = require("./Routes/empresa.routes");
const funcionarioRoutes = require("./Routes/funcionario.routes");

// Definição das rotas
app.use("/uploads", express.static("uploads"))
app.use("/tecnicos", tecnicoRoutes);
app.use("/chamados", chamadoRoutes);
app.use("/empresas", empresaRoutes);
app.use("/funcionario", funcionarioRoutes);

module.exports = app;
