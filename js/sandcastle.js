//Initialize Canvas
const canvas = document.getElementById('sandCanvas');
const ctx = canvas.getContext('2d');
//Initialise Grid
const grainSize = 10;
const grainNum = parseInt(canvas.width / grainSize);
//Sand array
const sandbox = new Array(grainNum).fill(null).map(() => new Array(grainNum).fill(0));
//Game variables
let isrunning = false;
let gameSpeed = 20;

//Handle clicking
canvas.addEventListener('click', function(evt) {
    const mousePos = getMousePos(canvas, evt);
    const index = getArrayIndexForMouse(mousePos.x, mousePos.y);
    spawnSand(index.x,index.y,randomizeColor());
});
function getMousePos(canvas, evt) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;    
    const scaleY = canvas.height / rect.height;  

    return {
        x: (evt.clientX - rect.left) * scaleX,  
        y: (evt.clientY - rect.top) * scaleY    
    };
}
function getArrayIndexForMouse(x,y) {
    return {
        x: Math.floor(x/grainSize), 
        y: Math.floor(y/grainSize)   
    };
}
function spawnSand(x,y, color) {
    sandbox[x][y] = color;
}

startGame();


function startGame() {
    isrunning = true;
    clearScreen();
    emptySandbox();
    sandbox[45][45] = randomizeColor(); //test
    sandbox[45][40] = randomizeColor(); //test
    gameLoop();
}

function gameLoop() {
    physics();
    drawSandbox();
    setTimeout(gameLoop, 1000 / gameSpeed);
}

function clearScreen() {
    ctx.fillStyle = '#ccc';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

//fill sandbox array with 0s
function emptySandbox() {
    for (let i = grainNum-1; i > 0; i--) {
        for (let j = grainNum-1; j > 0; j--) {
            sandbox[i][j] = 0
        } 
    }
}

//draw #000 for 0 and #fff for 1 in sandbox array
function drawSandbox() {
    for (let i = sandbox.length-1; i >= 0; i--) {
        for (let j = sandbox[i].length-1; j >= 0; j--) {
            if (sandbox[i][j] === 0) {
                ctx.fillStyle = '#000';
            } else {
                ctx.fillStyle = sandbox[i][j];
            }
            ctx.beginPath();
            ctx.rect(i*grainSize, j*grainSize, grainSize, grainSize);
            ctx.fill();
        }
    }
}

function randomizeColor () {
    return '#'+ Math.floor(Math.random()*16777215).toString(16);
  }

function physics() {
    for (let i = sandbox.length-1; i >= 0; i--) {
        for (let j = sandbox[i].length-1; j >= 0; j--) {
            // debugger
            if (sandbox[i][j] !== 0) {
                if(j < sandbox[i].length-1 && sandbox[i][j+1] == 0) {
                    sandbox[i][j+1] = sandbox[i][j];
                    sandbox[i][j] = 0;
                }
            }
        }
    }
}