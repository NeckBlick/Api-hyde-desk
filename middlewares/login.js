const jwt = require("jsonwebtoken");
const JWT_KEY = process.env.JWT_KEY


module.exports = (req, res, next) => {

    try {
        const token = req.headers.authorization.split(" ")[1]
        const decode = jwt.verify(token, JWT_KEY)
        req.usuario = decode
        next()
    } catch (error) {
        res.status(401).send({ message: "Falha na autenticacao" })
    }
}