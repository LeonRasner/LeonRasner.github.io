//TODO: Idea: Show Error codes matching current score: https://umbraco.com/knowledge-base/http-status-codes/
//Initialize Canvas
const canvas = document.getElementById('snake');
const ctx = canvas.getContext('2d');

//Grid dimesnions
let tileCount = 30;
let tileSize = canvas.width / tileCount;

//Game parameters
var gameRunning = false;
var gameSpeed = 8; //TODO: Fix Input Lag
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

//Sprites
const appleImage = new Image();
appleImage.src = '/images/Apple2.png';
const snakeImage = new Image();
snakeImage.src = '/images/SnakePart2.png';

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
//Mobile Inputs
let touchstartX = 0
let touchendX = 0
let touchstartY = 0
let touchendY = 0
document.addEventListener('touchstart', e => {
    touchstartX = e.changedTouches[0].screenX
    touchstartY = e.changedTouches[0].screenY
})

document.addEventListener('touchend', e => {
    touchendX = e.changedTouches[0].screenX
    touchendY = e.changedTouches[0].screenY
    checkDirection()
})

//Initialize Game
function startGame() {
    //change text
    document.getElementById("404p").style.display = "absolute"
    document.getElementById("404p").innerText = "Use Arrow-Keys or Swipe to move"
    document.getElementById("404a").innerText = "";
    document.getElementById("StartSnake").innerText = ""
    document.getElementById("StartSnake").classList.remove("animate");
    document.getElementById("404h1").classList.add("animate");
    document.getElementById("body").classList.add("playing");
    document.getElementById("404h2").innerText = "Page Not Found";

    //Set variables
    gameRunning = true;

    snakeLength = 3;
    snakeBits.length = 0;

    //Set random positions for snake heade and apple - if they overlap, set new random location
    headX = Math.floor(Math.random() * tileCount);
    headY = Math.floor(Math.random() * tileCount);
    appleX = Math.floor(Math.random() * tileCount);
    appleY = Math.floor(Math.random() * tileCount);
    if ((headX == appleX && headY == appleY)) {
        headX = Math.floor(Math.random() * tileCount);
        headY = Math.floor(Math.random() * tileCount);
        appleX = Math.floor(Math.random() * tileCount);
        appleY = Math.floor(Math.random() * tileCount);
    }

    xvelocity = 0;
    yvelocity = 0;

    //Draw
    drawGame();
}   	

//Draw game every tick
function drawGame() {
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
    ctx.lineWidth = "5";
    //Add new sankeBit for head position
    snakeBits.push(new snakeBit(headX, headY));
    //remove last snakeBit (if more bits than length)
    if (snakeBits.length > snakeLength) {
        snakeBits.shift();
    }
    //Loop through Snake bits
    for (let i = 0; i < snakeBits.length; i++) {
        let currentBit = snakeBits[i];
        if (snakeImage.complete) {
            ctx.drawImage(snakeImage, currentBit.xPos * tileCount, currentBit.yPos * tileCount);
        }
        // ctx.fillRect(currentBit.xPos * tileCount, currentBit.yPos * tileCount, tileSize, tileSize);
        // ctx.strokeRect(currentBit.xPos * tileCount, currentBit.yPos * tileCount, tileSize, tileSize);
    }
}

function drawApple() {
    if (appleImage.complete) {
        ctx.drawImage(appleImage, appleX * tileCount, appleY * tileCount);
    }
    // ctx.fillStyle = "#8AE393";
    // ctx.strokeStyle = '#ffffff';
    // ctx.lineWidth = "2";
    // ctx.fillRect(appleX * tileCount, appleY * tileCount, tileSize, tileSize)
    // ctx.strokeRect(appleX * tileCount, appleY * tileCount, tileSize, tileSize)
}

function keyDown(event) {
    event.preventDefault();
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

//Mobile Controls    
function checkDirection() {
    if (Math.abs(touchendX - touchstartX) > Math.abs(touchendY - touchstartY)) {
        //Horizontal
        if (touchendX < touchstartX && (touchstartX - touchendX)) {
            //Left
            if (xvelocity == 1 || keyPressed) return; //prevent snake from moving in opposite direction
            yvelocity = 0;
            xvelocity = -1; //move one tile left
            keyPressed = true;
        } else {
            //Right
            if (xvelocity == -1 || keyPressed) return; //prevent snake from moving in opposite direction
            yvelocity = 0;
            xvelocity = 1; //move one tile right
            keyPressed = true;
        }
    } else {
        //Vertical
        if (touchendY < touchstartY && (touchstartY - touchendY)) {
            //Up
            if (yvelocity == 1 || keyPressed) return; //prevent snake from moving in opposite direction
            yvelocity = -1; //move one tile up
            xvelocity = 0;
            keyPressed = true;
        } else {
            //Down
            if (yvelocity == -1 || keyPressed) return; //prevent snake from moving in opposite direction
            yvelocity = 1; //move one tile down
            xvelocity = 0;
            keyPressed = true;
        }
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
    drawCodes(score);
    //Hiede tutorial after first point
    if (snakeLength > 3) {
        document.getElementById("404p").innerText = ""
    }
}

function drawCodes(score) {
    let code = errors[score + 401];
    if (code != null) {
        document.getElementById("404h2").innerText = code;
        if (score + 401 === 511) {
            win();
        }
    } else {
        document.getElementById("404h2").innerText = "???";
    }
}

function win() {
    document.getElementById("body").classList.add("animateWin");
}

function checkGameOver() {
    let isGameOver = false;
    //Check if game is running
    if (gameRunning && !(yvelocity === 0 && xvelocity === 0)) {
        //If snake head has left bounds, game is over;
        if (headX < 0 || headX >= tileCount || headY < 0 || headY >= tileCount) {
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
    document.getElementById("StartSnake").innerText = "Or Play again!"
    document.getElementById("StartSnake").classList.add("animate");
    document.getElementById("404h1").classList.remove("animate");
    document.getElementById("404h1").style.color = "green";
    document.getElementById("body").classList.remove("playing");
}

class snakeBit {
    constructor(x, y) {
        this.xPos = x;
        this.yPos = y;
    }
}

var errors = {
    404 : "Page Not Found",
    405	: "Method Not Allowed",
    406	: "Not Acceptable",
    407	: "Proxy Authentication Required",
    408	: "Request Timeout",
    409	: "Conflict",
    410	: "Gone",
    411	: "Length Required",
    412	: "Precondition Failed",
    413	: "Payload Too Large",
    414	: "URI Too Long",
    415	: "Unsupported Media Type",
    416	: "Range Not Satisfiable",
    417	: "Expectation Failed",
    418	: "I'm a Teapot",
    421	: "Misdirected Request",
    422	: "Unprocessable Entity",
    423	: "Locked",
    424	: "Failed Dependency",
    425	: "Too Early",
    426	: "Upgrade Required",
    428	: "Precondition Required",
    429	: "Too Many Requests",
    431	: "Request Header Fields Too Large",
    451	: "Unavailable For Legal Reasons",
    500	: "Internal Server Error",
    501	: "Not Implemented",
    502	: "Bad Gateway",
    503	: "Service Unavailable",
    504	: "Gateway Timeout",
    505	: "HTTP Version Not Supported",
    506	: "Variant Also Negotiates",
    507	: "Insufficient Storage",
    508	: "Loop Detected",
    510	: "Not Extended",
    511	: "Network Authentication Required"
}