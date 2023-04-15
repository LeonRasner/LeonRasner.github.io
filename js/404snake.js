//Initialize Canvas
const canvas = document.getElementById('snake');
const ctx = canvas.getContext('2d');

//Grid dimesnions
let tileCount = 30;
let tileSize = canvas.width / tileCount;

//Game parameters
var gameRunning = false;
var gameSpeed = 9; //TODO: Fix Input Lag
var keyPressed = false;

//Snake length
var snakeLength;
const snakeBits = [];

//Snake Position
let headX = 1;
let headY = 1;

//Snake speed
let xvelocity = 0;
let yvelocity = 0;

//Apple Position
let appleX = 1;
let appleY = 1;

//Listen for start Game
document.getElementById('StartSnake').addEventListener('click', evt => {
    if (!gameRunning) {
        startGame();
    } else {
        endGame();
    }
});
document.addEventListener('keyup', evt => {
    if (evt.code == "Space" && !gameRunning) {
        startGame();
    }
});

//Key-inputs
document.body.addEventListener('keydown', keyDown);
//TODO: Mobile Controls

//Initialize Game
function startGame() {
    //change text
    document.getElementById("404p").innerText = "Currently paying 404 snake!"
    document.getElementById("404a").innerText = "";
    document.getElementById("StartSnake").innerText = "Stop playing 404 snake"
    document.getElementById("404h1").style.color = "black";
    
    //Set variables
    gameRunning = true;

    snakeLength = 3;
    snakeBits.length = 0;
    
    //Set random positions for snake heade and apple - if they overlap, set new random location
    headX = Math.floor(Math.random()*tileCount);
    headY = Math.floor(Math.random()*tileCount);
    appleX = Math.floor(Math.random()*tileCount);
    appleY = Math.floor(Math.random()*tileCount);
    if ((headX == appleX && headY == appleY)){
        headX = Math.floor(Math.random()*tileCount);
        headY = Math.floor(Math.random()*tileCount);
        appleX = Math.floor(Math.random()*tileCount);
        appleY = Math.floor(Math.random()*tileCount);
    }

    xvelocity = 0;
    yvelocity = 0;

    //Draw
    drawGame();
}

//Draw game every tick
function drawGame() {
    console.log("Snake position: " + headX + ", " + headY);
    clearScreen();
    drawSnake();
    changeSnakePosition();
    checkCollision();
    keyPressed = false;
    drawApple();
    if (checkGameOver()) {
        endGame(snakeLength);
        console.warn("Game over");
        return;
    }
    setTimeout(drawGame, 1000 / gameSpeed); //update screen "gameSpeed" times a second
}

function clearScreen() {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawSnake() {
    ctx.fillStyle = '#333333';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = "2";
    //Add new sankeBit for head position
    snakeBits.push(new snakeBit(headX, headY));
    //remove last snakeBit (if more bits than length)
    if (snakeBits.length > snakeLength) {
        snakeBits.shift();
    }
    //Loop through Snake bits
    for (let i = 0; i < snakeBits.length; i++) {
        let currentBit = snakeBits[i];
        ctx.fillRect(currentBit.xPos * tileCount, currentBit.yPos * tileCount, tileSize, tileSize);
        ctx.strokeRect(currentBit.xPos * tileCount, currentBit.yPos * tileCount, tileSize, tileSize);
    }
}

function drawApple() {
    ctx.fillStyle = "#8AE393";
    ctx.fillRect(appleX * tileCount, appleY * tileCount, tileSize, tileSize)//position apple within tile count
}

function keyDown(event) {
    //up
    if (event.keyCode == 38 || event.keyCode == 87) {
        if (yvelocity == 1 || keyPressed) return; //prevent snake from moving in opposite direction
        yvelocity = -1; //move one tile up
        xvelocity = 0;
        keyPressed = true;
    }
    //down
    if (event.keyCode == 40 || event.keyCode == 83) {
        if (yvelocity == -1 || keyPressed) return; //prevent snake from moving in opposite direction
        yvelocity = 1; //move one tile down
        xvelocity = 0;
        keyPressed = true;
    }
    //left
    if (event.keyCode == 37 || event.keyCode == 65) {
        if (xvelocity == 1 || keyPressed) return; //prevent snake from moving in opposite direction
        yvelocity = 0;
        xvelocity = -1; //move one tile left
        keyPressed = true;
    }
    //right
    if (event.keyCode == 39 || event.keyCode == 68) {
        if (xvelocity == -1 || keyPressed) return; //prevent snake from moving in opposite direction
        yvelocity = 0;
        xvelocity = 1; //move one tile right
        keyPressed = true;
    }
}

function changeSnakePosition() {
    headX = headX + xvelocity;
    headY = headY + yvelocity;
}

function checkCollision() {
    if (appleX == headX && appleY == headY) {
        appleX = Math.floor(Math.random() * tileCount);
        appleY = Math.floor(Math.random() * tileCount);
        snakeLength++;
        drawScore(snakeLength);
        if (snakeLength % 3 == 0) gameSpeed++;
    }
}

function drawScore(score) {
    let score404 = score + 401;
    document.getElementById("404h1").innerText = score404.toString();
    //ToDo: Animate 404
}

function checkGameOver() {
    let isGameOver = false;
    //Check if game is running
    if (gameRunning && !(yvelocity === 0 && xvelocity === 0)) {
        //If snake head has left bounds, game is over;
        if (headX < 0 || headX > tileCount || headY < 0 || headY > tileCount) {
            isGameOver = true;
        } else {
            //Check collision of head with body for each snakeBit
            for (let i = 0; i < snakeBits.length; i++) {
                let currentBit = snakeBits[i];
                if (currentBit.xPos === headX && currentBit.yPos === headY) {
                    isGameOver = true;
                    break;
                }
            }
        }
    }
    return isGameOver;
}

function endGame(score) {
    gameRunning = false;
        //change text
        document.getElementById("404p").innerText = "Game Over"
        document.getElementById("404a").innerText = "Go back to Homepage";
        document.getElementById("StartSnake").innerText = "Play again"
        document.getElementById("404h1").style.color = "green";
}

class snakeBit {
    constructor(x, y) {
        this.xPos = x;
        this.yPos = y;
    }
}