// Canvas Related
const canvas = document.createElement("canvas");
const context = canvas.getContext("2d");
const socket = io("http://localhost:3000");

// keeping track of the referee
isReferee = false; // if a certain condition is met --->

let paddleIndex = 0;

let width = 500;
let height = 700;

// Paddle
let paddleHeight = 10;
let paddleWidth = 50;
let paddleDiff = 25;
let paddleX = [225, 225];
let trajectoryX = [0, 0];
let playerMoved = false;

// Ball
let ballX = 250;
let ballY = 350;
let ballRadius = 5;
let ballDirection = 1;

// Speed
let speedY = 2;
let speedX = 0;
// let computerSpeed = 4;

// Score for Both Players
let score = [0, 0];

// Create Canvas Element
function createCanvas() {
  canvas.id = "canvas";
  canvas.width = width;
  canvas.height = height;
  document.body.appendChild(canvas);
  renderCanvas();
}

// Wait for Opponents
function renderIntro() {
  // Canvas Background
  context.fillStyle = "black";
  context.fillRect(0, 0, width, height);

  // Intro Text
  context.fillStyle = "white";
  context.font = "32px Courier New";
  context.fillText("Waiting for opponent...", 20, canvas.height / 2 - 30);
}

// Render Everything on Canvas
function renderCanvas() {
  // Canvas Background
  context.fillStyle = "black";
  context.fillRect(0, 0, width, height);

  // Paddle Color
  context.fillStyle = "white";

  // Bottom Paddle
  context.fillRect(paddleX[0], height - 20, paddleWidth, paddleHeight);

  // Top Paddle
  context.fillRect(paddleX[1], 10, paddleWidth, paddleHeight);

  // Dashed Center Line
  context.beginPath();
  context.setLineDash([4]);
  context.moveTo(0, 350);
  context.lineTo(500, 350);
  context.strokeStyle = "grey";
  context.stroke();

  // Ball
  context.beginPath();
  context.arc(ballX, ballY, ballRadius, 2 * Math.PI, false);
  context.fillStyle = "white";
  context.fill();

  // Score
  context.font = "32px Courier New";
  context.fillText(score[0], 20, canvas.height / 2 + 50);
  context.fillText(score[1], 20, canvas.height / 2 - 30);
}

// Reset Ball to Center
function ballReset() {
  ballX = width / 2;
  ballY = height / 2;
  speedY = 3;
}

// Adjust Ball Movement
function ballMove() {
  // Vertical Speed
  ballY += speedY * ballDirection;
  // Horizontal Speed
  if (playerMoved) {
    ballX += speedX;
  }
}

// Determine What Ball Bounces Off, Score Points, Reset Ball
function ballBoundaries() {
  // Bounce off Left Wall
  if (ballX < 0 && speedX < 0) {
    speedX = -speedX;
  }
  // Bounce off Right Wall
  if (ballX > width && speedX > 0) {
    speedX = -speedX;
  }
  // Bounce off player paddle (bottom)
  if (ballY > height - paddleDiff) {
    if (ballX >= paddleX[0] && ballX <= paddleX[0] + paddleWidth) {
      // Add Speed on Hit
      if (playerMoved) {
        speedY += 1;
        // Max Speed
        if (speedY > 5) {
          speedY = 5;
        }
      }
      ballDirection = -ballDirection;
      trajectoryX[0] = ballX - (paddleX[0] + paddleDiff);
      speedX = trajectoryX[0] * 0.3;
    } else {
      // Reset Ball, add to Computer Score
      ballReset();
      score[1]++;
    }
  }
  // Bounce off computer paddle (top)
  if (ballY < paddleDiff) {
    if (ballX >= paddleX[1] && ballX <= paddleX[1] + paddleWidth) {
      // Add Speed on Hit
      if (playerMoved) {
        speedY += 1;
        // Max Speed
        if (speedY > 5) {
          speedY = 5;
        }
      }
      ballDirection = -ballDirection;
      trajectoryX[1] = ballX - (paddleX[1] + paddleDiff);
      speedX = trajectoryX[1] * 0.3;
    } else {
      // Reset Ball, Increase Computer Difficulty, add to Player Score
      ballReset();
      score[0]++;
    }
  }
}

// Called Every Frame
function animate() {
  // computerAI();
  ballMove();
  renderCanvas();
  ballBoundaries();
  window.requestAnimationFrame(animate);
}

// Load Game, Reset Everything
function loadGame() {
  createCanvas();
  renderIntro();
  socket.emit("ready"); // to emit that the player is ready to start the game
  // but the socket.io has generated the uuid for us to identify each client uniquely.
}

// Start Game

function startGame() {
  // paddleIndex = 0;  this can work when there is one player. but when they are two we need
  // to decide who controls the bottom paddle, or the top.
  paddleIndex = isReferee ? 0 : 1;
  window.requestAnimationFrame(animate);
  canvas.addEventListener("mousemove", (e) => {
    playerMoved = true;
    paddleX[paddleIndex] = e.offsetX;
    if (paddleX[paddleIndex] < 0) {
      paddleX[paddleIndex] = 0;
    }
    if (paddleX[paddleIndex] > width - paddleWidth) {
      paddleX[paddleIndex] = width - paddleWidth;
    }

    // Emitting the position of the paddle to the server to have the same paddle position
    // on both player screen(the opponent screen)
    socket.emit("paddleMove", {
      xPosition: paddleX[paddleIndex],

      // Now the two paddles are in sync
    });

    // Hide Cursor
    canvas.style.cursor = "none";
  });
}

// On Load
loadGame();

// Generating the socket id to the front end when connected
socket.on("connect", () => {
  console.log("connected as...", socket.id);
});

// Adding a handler to start the game
socket.on("startGame", (refereeId) => {
  console.log("Referee is", refereeId); // Here we need to keep track of the refereeId
  // to know exactly if it the referee in order to know we are the one to keep track of the score, or the ball position

  // And now we can know who the referee is
  isReferee = socket.id === refereeId;

  // Then here call the start game function to start the game when we've received the signal from the server

  startGame();
});

// On the client side here we need to handle updates on our opponet's paddle position.
// It means we need to listen for, using socket.on paddleMove event. and this is where
// need to update the game state in this client to teflect the game state on our opponent's client
// specifically updating our paddleX.

socket.on("paddleMove", (paddleData) => {
  // Let's set the Xposition.
  // Here we are always Togggle 1 into 0, and 0 into 1

  const opponentPaddleIndex = 1 - paddleIndex;
  paddleX[opponentPaddleIndex] = paddleData.xPosition;
});
