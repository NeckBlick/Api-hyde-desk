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
const userRoutes = require("./Routes/user.routes");
const tecnicoRoutes = require("./Routes/Tecnico/routes");
const chamadoRoutes = require("./Routes/Chamados/routes");
const empresaRoutes = require("./Routes/Empresa/routes");

// Definição das rotas
app.use("/uploads", express.static("uploads"))
app.use("/usuarios", userRoutes);
app.use("/tecnicos", tecnicoRoutes);
app.use("/chamados", chamadoRoutes);
app.use("/empresas", empresaRoutes);

module.exports = app;
