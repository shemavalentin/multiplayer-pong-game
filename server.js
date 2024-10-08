// the most versatile way to initialize socket.io in to first crate a plain Node.js
// HTTP server
const server = require("http").createServer();

// Importing the socket.io, then attach it to the server we created
const io = require("socket.io")(server);

const PORT = 3000;

server.listen(PORT);
console.log(`Listening on port ${PORT} ...`);

// Creating an event emitter that our socket server uses to register an event lister
io.on("connection", (socket) => {
  console.log("A user connected");
});
