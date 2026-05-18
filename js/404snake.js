//Initialize Canvas
const canvas = document.getElementById('snake');
const ctx = canvas.getContext('2d');

//Grid dimensions
let tileCount = 30;
let tileSize = canvas.width / tileCount;

//Game parameters
let gameRunning = false;
const initialGameSpeed = 8;
const initialGameSpeedMod = 1.0;
let gameSpeed;
let gameSpeedMod;

//Input buffering
let directionQueue = [];
const maxDirectionQueue = 2;

//Game loop timing
let animationFrameId = null;
let lastFrameTime = 0;
let tickAccumulator = 0;
const maxTicksPerFrame = 5;

//Snake length
let snakeLength;
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
        endGame(snakeLength);
    }
});

document.addEventListener('keyup', evt => {
    if (evt.code === "Space" && !gameRunning) {
        startGame();
    }
});

//Keyboard inputs
document.body.addEventListener('keydown', keyDown);

//Mobile Inputs
let touchstartX = 0;
let touchendX = 0;
let touchstartY = 0;
let touchendY = 0;

document.addEventListener('touchstart', e => {
    if (!gameRunning) return;

    if (e.cancelable) {
        e.preventDefault();
    }

    touchstartX = e.changedTouches[0].screenX;
    touchstartY = e.changedTouches[0].screenY;
}, { passive: false });

document.addEventListener('touchmove', e => {
    if (!gameRunning) return;

    if (e.cancelable) {
        e.preventDefault();
    }
}, { passive: false });

document.addEventListener('touchend', e => {
    if (!gameRunning) return;

    if (e.cancelable) {
        e.preventDefault();
    }

    touchendX = e.changedTouches[0].screenX;
    touchendY = e.changedTouches[0].screenY;

    checkDirection();
}, { passive: false });

//Initialize Game
function startGame() {
    //Stop any previous loop safely
    if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }

    //Change text
    document.getElementById("404p").style.display = "";
    document.getElementById("404p").innerText = "Use Arrow-Keys or Swipe to move";
    document.getElementById("404a").innerText = "";
    document.getElementById("StartSnake").innerText = "";
    document.getElementById("StartSnake").classList.remove("animate");
    document.getElementById("404h1").classList.add("animate");
    document.getElementById("404h1").style.color = "";
    document.getElementById("body").classList.add("playing");
    document.getElementById("body").classList.remove("animateWin");
    document.getElementById("404h2").innerText = "Page Not Found";
    document.getElementById("404h1").innerText = "404";

    //Set variables
    gameRunning = true;
    gameSpeed = initialGameSpeed;
    gameSpeedMod = initialGameSpeedMod;

    snakeLength = 3;
    snakeBits.length = 0;
    directionQueue.length = 0;

    //Set random snake position
    headX = Math.floor(Math.random() * tileCount);
    headY = Math.floor(Math.random() * tileCount);

    xvelocity = 0;
    yvelocity = 0;

    snakeBits.push(new snakeBit(headX, headY));

    placeApple();

    //Reset loop timing
    tickAccumulator = 0;
    lastFrameTime = performance.now();

    renderGame();
    animationFrameId = requestAnimationFrame(drawGame);
}

//Main loop
function drawGame(now = performance.now()) {
    if (!gameRunning) return;

    const delta = Math.min(now - lastFrameTime, 250);
    lastFrameTime = now;
    tickAccumulator += delta;

    let ticks = 0;
    let tickLength = 1000 / gameSpeed;

    while (tickAccumulator >= tickLength && ticks < maxTicksPerFrame) {
        updateGame();

        if (!gameRunning) {
            renderGame();
            return;
        }

        tickAccumulator -= tickLength;
        ticks++;
        tickLength = 1000 / gameSpeed;
    }

    renderGame();
    animationFrameId = requestAnimationFrame(drawGame);
}

//Game state update
function updateGame() {
    applyQueuedDirection();

    //Do not move until the player chooses a direction
    if (xvelocity === 0 && yvelocity === 0) {
        return;
    }

    const nextHeadX = headX + xvelocity;
    const nextHeadY = headY + yvelocity;

    const willEatApple = nextHeadX === appleX && nextHeadY === appleY;

    //Wall collision
    if (
        nextHeadX < 0 ||
        nextHeadX >= tileCount ||
        nextHeadY < 0 ||
        nextHeadY >= tileCount
    ) {
        endGame(snakeLength);
        return;
    }

    //If not eating, the tail moves away this tick.
    //Moving into the current tail cell should be legal.
    const tailWillMove = !willEatApple && snakeBits.length >= snakeLength;
    const collisionStartIndex = tailWillMove ? 1 : 0;

    //Body collision
    for (let i = collisionStartIndex; i < snakeBits.length; i++) {
        const currentBit = snakeBits[i];

        if (currentBit.xPos === nextHeadX && currentBit.yPos === nextHeadY) {
            endGame(snakeLength);
            return;
        }
    }

    //Move head
    headX = nextHeadX;
    headY = nextHeadY;

    //Add new head position
    snakeBits.push(new snakeBit(headX, headY));

    //Apple collision
    if (willEatApple) {
        snakeLength++;
        drawScore(snakeLength);

        if (Math.random() < gameSpeedMod) {
            gameSpeed++;
        }

        gameSpeedMod = Math.max(gameSpeedMod * 0.9, 0.10);

        placeApple();
    }

    //Trim tail
    while (snakeBits.length > snakeLength) {
        snakeBits.shift();
    }
}

//Render only. No game-state mutation here.
function renderGame() {
    clearScreen();
    drawSnake();
    drawApple();
}

function clearScreen() {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawSnake() {
    ctx.fillStyle = '#333333';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 5;
    //Loop through Snake bits
    for (let i = 0; i < snakeBits.length; i++) {
        const currentBit = snakeBits[i];
        if (snakeImage.complete) {
            ctx.drawImage(
                snakeImage,
                currentBit.xPos * tileSize,
                currentBit.yPos * tileSize,
                tileSize * 0.9,
                tileSize * 0.9
            );
        } else {
            ctx.fillRect(
                currentBit.xPos * tileSize,
                currentBit.yPos * tileSize,
                tileSize * 0.9,
                tileSize * 0.9
            );
            ctx.strokeRect(
                currentBit.xPos * tileSize,
                currentBit.yPos * tileSize,
                tileSize * 0.9,
                tileSize * 0.9
            );
        }
    }
}

function drawApple() {
    if (appleImage.complete) {
        ctx.drawImage(
            appleImage,
            appleX * tileSize,
            appleY * tileSize,
            tileSize * 0.9,
            tileSize * 0.9
        );
    } else {
        ctx.fillStyle = "#8AE393";
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;

        ctx.fillRect(
            appleX * tileSize,
            appleY * tileSize,
            tileSize * 0.9,
            tileSize * 0.9
        );

        ctx.strokeRect(
            appleX * tileSize,
            appleY * tileSize,
            tileSize * 0.9,
            tileSize * 0.9
        );
    }
}

function keyDown(event) {
    const directions = {
        ArrowUp: { x: 0, y: -1 },
        KeyW: { x: 0, y: -1 },

        ArrowDown: { x: 0, y: 1 },
        KeyS: { x: 0, y: 1 },

        ArrowLeft: { x: -1, y: 0 },
        KeyA: { x: -1, y: 0 },

        ArrowRight: { x: 1, y: 0 },
        KeyD: { x: 1, y: 0 }
    };

    const direction = directions[event.code];

    if (!direction) return;

    event.preventDefault();

    queueDirection(direction.x, direction.y);
}

function queueDirection(x, y) {
    const lastDirection = directionQueue.length > 0
        ? directionQueue[directionQueue.length - 1]
        : { x: xvelocity, y: yvelocity };

    //Ignore duplicate direction
    if (lastDirection.x === x && lastDirection.y === y) {
        return;
    }

    //Prevent instant 180-degree turns
    if (lastDirection.x === -x && lastDirection.y === -y) {
        return;
    }

    if (directionQueue.length < maxDirectionQueue) {
        directionQueue.push({ x, y });
    }
}

function applyQueuedDirection() {
    if (directionQueue.length === 0) return;

    const nextDirection = directionQueue.shift();

    //Extra safety against reversing
    if (
        xvelocity === -nextDirection.x &&
        yvelocity === -nextDirection.y
    ) {
        return;
    }

    xvelocity = nextDirection.x;
    yvelocity = nextDirection.y;
}

//Mobile Controls
function checkDirection() {
    const dx = touchendX - touchstartX;
    const dy = touchendY - touchstartY;

    const minimumSwipeDistance = 24;

    if (
        Math.abs(dx) < minimumSwipeDistance &&
        Math.abs(dy) < minimumSwipeDistance
    ) {
        return;
    }

    if (Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0) {
            queueDirection(-1, 0);
        } else {
            queueDirection(1, 0);
        }
    } else {
        if (dy < 0) {
            queueDirection(0, -1);
        } else {
            queueDirection(0, 1);
        }
    }
}

function placeApple() {
    const freeTiles = [];

    for (let y = 0; y < tileCount; y++) {
        for (let x = 0; x < tileCount; x++) {
            const occupied = snakeBits.some(bit => {
                return bit.xPos === x && bit.yPos === y;
            });

            if (!occupied) {
                freeTiles.push({ x, y });
            }
        }
    }

    if (freeTiles.length === 0) {
        win();
        endGame(snakeLength);
        return;
    }

    const chosenTile = freeTiles[Math.floor(Math.random() * freeTiles.length)];

    appleX = chosenTile.x;
    appleY = chosenTile.y;
}

function drawScore(score) {
    let score404 = score + 401;
    document.getElementById("404h1").innerText = score404.toString();
    drawCodes(score);
    //Hiede tutorial after first point
    if (snakeLength > 3) {
        document.getElementById("404p").innerText = "";
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

function endGame(score) {
    gameRunning = false;

    if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }

    document.getElementById("404p").innerText = "Game Over";
    document.getElementById("404a").innerText = "Go back to Homepage";
    document.getElementById("StartSnake").innerText = "Or Play again!";
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

let errors = {
    404 : "Page Not Found",
    405 : "Method Not Allowed",
    406 : "Not Acceptable",
    407 : "Proxy Authentication Required",
    408 : "Request Timeout",
    409 : "Conflict",
    410 : "Gone",
    411 : "Length Required",
    412 : "Precondition Failed",
    413 : "Payload Too Large",
    414 : "URI Too Long",
    415 : "Unsupported Media Type",
    416 : "Range Not Satisfiable",
    417 : "Expectation Failed",
    418 : "I'm a Teapot",
    421 : "Misdirected Request",
    422 : "Unprocessable Entity",
    423 : "Locked",
    424 : "Failed Dependency",
    425 : "Too Early",
    426 : "Upgrade Required",
    428 : "Precondition Required",
    429 : "Too Many Requests",
    431 : "Request Header Fields Too Large",
    451 : "Unavailable For Legal Reasons",
    500 : "Internal Server Error",
    501 : "Not Implemented",
    502 : "Bad Gateway",
    503 : "Service Unavailable",
    504 : "Gateway Timeout",
    505 : "HTTP Version Not Supported",
    506 : "Variant Also Negotiates",
    507 : "Insufficient Storage",
    508 : "Loop Detected",
    510 : "Not Extended",
    511 : "Network Authentication Required"
};