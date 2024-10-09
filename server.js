// the most versatile way to initialize socket.io in to first crate a plain Node.js
// HTTP server
const server = require("http").createServer();

// Importing the socket.io, then attach it to the server we created
const io = require("socket.io")(server);

const PORT = 3000;

server.listen(PORT);
console.log(`Listening on port ${PORT} ...`);

// Keeping track of how many players have told us they're ready, so we know we have
// enough players for a game.

let readyPlayerCount = 0;

// Creating an event emitter that our socket server uses to register an event lister
io.on("connection", (socket) => {
  //to have the same id on the server and on the client side we have to add socket.id.
  // the only diference being that on the server side, we have multiple sockets being
  // connected at the same time.
  console.log("a user connected", socket.id);

  // Listening to Ready event before the server starts the game
  socket.on("ready", () => {
    console.log("Player ready", socket.id);

    // Increament by 1 every time a player sends us a READY event
    readyPlayerCount++;

    // Checking if the number of players are two
    if (readyPlayerCount === 2) {
      // We need to broadcast to players that the game starts, then starts the game
      // We have to broadcast messages to all connected players(Cfr Socket.io cheatsheet)

      // io.emit('start the game'); // then let's add the referee who is the second player

      io.emit("startGame", socket.id); // by passing the socket.id here it is effectively choosing the second player as the referee
    }
  });

  //Adding a listener with our socket.on function listening for our paddleMove event
  socket.on("paddleMove", (paddleData) => {
    // We need to keep both players in sync, to mean when we receive these updates, we will need to broadcast data back to the other clients.
    // Notice here the sender does not need to receive the information he/she already has.
    // we have to change the broadcaster
    socket.broadcast.emit("paddleMove", paddleData);
  });
});
