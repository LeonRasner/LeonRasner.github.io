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
let gameSpeed = 1000;
let StabilityMode = false;
let MagnetismMode = false;
let stabillity = 3; //How many grains from a settled piece pieces will stick vertically
let magnetism = 5; //How many grains from a settled piece pieces will move towards
let colorMode = 0; //0 = static, 1 = gradient, 3 = random
let color = "#e8b254"; //Current color

//Handle clicking
let mousedown = false;
let mouseX;
let mouseY;
// Store references to event listener functions
let mouseMoveListener, mouseUpListener;

canvas.addEventListener('mousedown', function (evt) {
    //Click in canvas -> sand falls
    mousedown = true;
    let pos = getMousePos(canvas,evt)
    mouseX = pos.x;
    mouseY = pos.y

    // Add mousemove event listener
    mouseMoveListener = function (e) {
        //Mouse moved -> update position
        let pos = getMousePos(canvas, e);
        mouseX = pos.x;
        mouseY = pos.y;
    };
    canvas.addEventListener('mousemove', mouseMoveListener);

    // Add mouseup event listener
    mouseUpListener = function () {
        //Click stopped -> no more sand
        mousedown = false;

        // Remove event listeners
        canvas.removeEventListener('mousemove', mouseMoveListener);
        canvas.removeEventListener('mouseup', mouseUpListener);
    };
    canvas.addEventListener('mouseup', mouseUpListener);
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
function getArrayIndexForMouse(x, y) {
    return {
        x: Math.floor(x / grainSize),
        y: Math.floor(y / grainSize)
    };
}
function checkClick() {
    if (mousedown) {
        const mouseIndex = getArrayIndexForMouse(mouseY, mouseX);
        spawnSand(mouseIndex.x, mouseIndex.y, chooseColor());
    }
}
function spawnSand(x, y, color) {
    sandbox[x][y] = new Grain(chooseColor(), null);
}

//Game Loop
startGame();

function startGame() {
    isrunning = true;
    clearScreen();
    emptySandbox();
    gameLoop();
}
function gameLoop() {
    checkClick();
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
    for (let i = grainNum - 1; i > 0; i--) {
        for (let j = grainNum - 1; j > 0; j--) {
            sandbox[i][j] = 0
        }
    }
}

//draw #000 for 0 and #fff for 1 in sandbox array
function drawSandbox() {
    for (let i = sandbox.length - 1; i >= 0; i--) {
        for (let j = sandbox[i].length - 1; j >= 0; j--) {
            if (sandbox[j][i] === 0) {
                ctx.fillStyle = '#000';
            } else {
                ctx.fillStyle = sandbox[j][i].color;
            }
            ctx.beginPath();
            ctx.rect(i * grainSize, j * grainSize, grainSize, grainSize);
            ctx.fill();
        }
    }
}

function chooseColor() {
    debugger;
    switch (colorMode) {
        case 0:
            return color;
        case 1:
            return '#' + (Math.floor(Math.random() * 16777215*2)/2).toString(16);
        case 2:
            return shiftGradient();
        default:
            return color;
      }
}

function setColorMode(c) {
    colorMode = c;
}

function physics() {
    //Magnetism ---------------
    if (MagnetismMode) {
        for (let i = sandbox.length - 1; i >= 0; i--) {
            for (let j = sandbox[i].length - 1; j >= 0; j--) {
                if (sandbox[i][j] != 0 && sandbox[i][j].settled == null) {
                    //Check for every grain
                    if ((j == 0 || sandbox[i][j - 1] == 0) && (j == sandbox[i].length - 1 || sandbox[i][j + 1] == 0)) {
                        //Direct neighbours are empty -> can move horizontally
                        if (i < sandbox.length - 1) {
                            //Not floor row
                            if (sandbox[i + 1][j] == 0) {
                                //Nothing stable below
                                let minDistance = magnetism;
                                let magnetismDirection;
                                let min = j - magnetism < 0 ? 0 : j - magnetism;
                                let max = j + magnetism >= sandbox[i].length ? sandbox[i].length - 1 : j + magnetism;
                                for (let k = min; k <= max; k++) {
                                    //Chek if stable piece is nearby
                                    if ((k > j + 1 || k < j - 1) && sandbox[i][k] != 0 && sandbox[i][k].settled != null && sandbox[i][k].settled < stabillity) {
                                        if (sandbox[i][k].settled < stabillity) {
                                            let distance = Math.abs(k - j);
                                            if (minDistance > distance) {
                                                
                                                minDistance = distance;
                                                magnetismDirection = k - j;
                                                magnetismDirection = magnetismDirection < 0 ? magnetismDirection + 1 : magnetismDirection - 1;
                                            }
                                        }
                                    }
                                }
                                if (minDistance != magnetism) {
                                    //neares settled piece in magnetic range -> move next to it
                                    
                                    sandbox[i][j + magnetismDirection] = sandbox[i][j];
                                    sandbox[i][j] = 0;
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    //Gravity -----------
    for (let i = sandbox.length - 1; i >= 0; i--) {
        for (let j = sandbox[i].length - 1; j >= 0; j--) {
            if (sandbox[i][j] !== 0) {
                //Check for every grain
                if (i < sandbox.length - 1) {
                    //Not floor row
                    if (sandbox[i + 1][j] == 0) {
                        //Stabillity ----------------
                        if (StabilityMode) {
                            let leftEdge = j == 0;
                            let rightEdge = j == sandbox[i].length - 1;
                            if (!leftEdge && sandbox[i][j - 1] != 0 && sandbox[i][j - 1].settled != null && sandbox[i][j - 1].settled < stabillity) {
                                //settled piece to left
                                sandbox[i][j].settled = sandbox[i][j - 1].settled + 1;
                            } else if (!rightEdge && sandbox[i][j + 1] != 0 && sandbox[i][j + 1].settled != null && sandbox[i][j + 1].settled < stabillity) {
                                //settled piece to right
                                sandbox[i][j].settled = sandbox[i][j + 1].settled + 1;
                            } else {
                                //No settled piece left or right -> move down
                                sandbox[i + 1][j] = sandbox[i][j];
                                sandbox[i][j] = 0;
                            }
                        } else {
                            //Stabillity mode disable -> move down
                            sandbox[i + 1][j] = sandbox[i][j];
                            sandbox[i][j] = 0;
                        }

                    } else {
                        //sits on top of settled piece -> settled == piece below
                        sandbox[i][j].settled = sandbox[i + 1][j].settled;
                    }
                } else {
                    //sits on floor -> settled = 0
                    sandbox[i][j].settled = 0;
                }
            }
        }
    }
}

function Grain(color, settled) {
    this.color = color; //Color of the grain as a hex value "#0f0"
    this.settled = settled; //0 -> directly above a grain with settled = 0 or the floor, 1 -> 1 grain away (only horicontal!!) ...
}

function toogleMagnetism() {
    MagnetismMode = !MagnetismMode;
}

function toggleStability() {
    StabilityMode = !StabilityMode;
}

let colorI = parseInt(color.substring(1), 16); // Starting color in hexadecimal as an integer

function shiftGradient() {
    colorI = (colorI + 1) % 0xFFFFFF; // Increment and wrap around before reaching 0xFFFFFF
    let hexStr = colorI.toString(16); // Convert back to a hexadecimal string
    hexStr = hexStr.padStart(6, '0'); // Ensure the string has at least 6 digits
    return `#${hexStr}`;
}

