const http = require("http");
const app = require("./app");
const server = http.createServer(app);

// Inicializar o servidor
server.listen(process.env.PORT || 8080, () => {
    console.log("Running...")
});
