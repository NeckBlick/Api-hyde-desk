const http = require("http");
const app = require("./app");
const server = http.createServer(app);

// Inicializar o servidor
server.listen(process.env.PORT, () => {
    console.log("Running...")
});
