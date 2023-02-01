const express = require("express")
const app = express()
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const mysql =  require("mysql")

// Rotas
const userRoutes = require("./Routes/Usuario/routes")
const tecnicoRoutes = require("./Routes/Tecnico/routes")
const chamadoRoutes = require("./Routes/Chamados/routes")
const empresaRoutes = require("./Routes/Empresa/routes")

app.use(express.json())

// Definição das rotas
app.use("/usuarios", userRoutes)
app.use("/tecnicos", tecnicoRoutes)
app.use("/chamados",chamadoRoutes)
app.use("/empresas",empresaRoutes)


// Inicializar o servidor
app.listen( 4001 ,() => {
    console.log("Running")
})