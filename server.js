const http = require("http");
const io = require("socket.io");

// Importing the api.js then pass it to the createServer as a handler
const apiServer = require("./api");

// the most versatile way to initialize socket.io in to first crate a plain Node.js
// HTTP server
const httpServer = http.createServer(apiServer); // over here

// Importing the socket.io, then attach it to the server we created
const socketServer = io(httpServer);

// requiring the sockets code
const sockets = require("./sockets");

const PORT = 3000;

httpServer.listen(PORT);
console.log(`Listening on port ${PORT}...`);

sockets.listen(socketServer);
