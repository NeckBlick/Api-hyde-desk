const express = require("express")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const cors = require("cors")

// Rotas
const userRoutes = require("./Routes/Usuario/routes")
const tecnicoRoutes = require("./Routes/Tecnico/routes")
const chamadoRoutes = require("./Routes/Chamados/routes")
const empresaRoutes = require("./Routes/Empresa/routes")

const app = express()
app.use(cors())
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