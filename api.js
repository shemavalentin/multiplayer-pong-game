const express = require("express");

// To look into the folder we use the path module
const path = require("path");

// Initializing the server
const api = express();

// Creating a basic middleware
// Here I'm serving statically the website from the folder called public
api.use(express.static(path.join(__dirname, "public")));

// then serve the index.html file at the root route using static the express static file
api.use("/", express.static("index.html"));

// api.listen(3000);

//exporting express sever from our API  and it means that we won't be listening
// using express's application listen. It is the http in the server.js file that is listening
module.exports = api;
