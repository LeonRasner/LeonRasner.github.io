
let mousedown = false;
let mouseX;
let mouseY;

//Initialize Canvas
const canvas = document.getElementById('sandCanvas');
let ctx = canvas.getContext("2d", { alpha: false });
//Initialise Grid
const grainSize = 10;
let grainNum = parseInt(canvas.width / grainSize);
let grainNumV = parseInt(canvas.height / grainSize);
//Sand array
let sandbox = new Array(grainNumV).fill(null).map(() => new Array(grainNum).fill(0));
//Game variables
let isrunning = false;
let gameSpeed = 100;
//Physics variables
let StabilityMode = false;
let MagnetismMode = false;
let stabillity = 30; //How many grains from a settled piece pieces will stick vertically
let magnetism = 5; //How many grains from a settled piece pieces will move towards

//Draw Variables
let spawnAmount = 6;
let eraserMode = false;

//COLOR
let colorH = 40; // Hue component of color
let colorS = 81; // Saturation Component
let colorL = 62; // Lightness Component
let colorMode = 0; //0 = static, 1 = gradient, 3 = random
//let shiftSpeed = 1; //by how much the Hue of colorH shifts each shiftGradient in %

function resizeCanvas() {
    var canvas = document.getElementById('sandCanvas');
    var container = canvas.parentNode; // Assuming the canvas is wrapped by a div or similar element

    // Set the canvas dimensions to match the container
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    startGame();
}

// Adjust canvas size on document load
document.addEventListener('DOMContentLoaded', resizeCanvas);


//Game Loop
startGame();

function startGame() {
    isrunning = true;

    grainNum = parseInt(canvas.width / grainSize);
    grainNumV = parseInt(canvas.height / grainSize);
    ctx = canvas.getContext("2d", { alpha: false });
    sandbox = new Array(grainNumV).fill(null).map(() => new Array(grainNum).fill(0));

    clearScreen();
    emptySandbox();
    gameLoop();
    requestAnimationFrame(renderLoop);
}
function gameLoop() {
    checkClick();
    physics();
    setTimeout(gameLoop, 1000 / gameSpeed);
}

function renderLoop() {
    drawSandbox();
    requestAnimationFrame(renderLoop);
}


//USER INTERACTION --------------------------------------------------------------------------
// Store references to event listener functions
let mouseMoveListener, mouseUpListener;

function getPositionFromEvent(evt, canvas) {
    if (evt.touches) {
        evt = evt.touches[0]; // Get the first touch
    }
    return getMousePos(canvas, evt);
}

function addTouchListeners() {
    // Add touchmove event listener
    touchMoveListener = function (e) {
        e.preventDefault(); // Prevent scrolling and other default actions
        let pos = getPositionFromEvent(e, canvas);
        mouseX = pos.x;
        mouseY = pos.y;
    };
    canvas.addEventListener('touchmove', touchMoveListener);

    // Add touchend event listener
    touchEndListener = function () {
        mousedown = false;

        // Remove event listeners
        canvas.removeEventListener('touchmove', touchMoveListener);
        canvas.removeEventListener('touchend', touchEndListener);
        canvas.removeEventListener('touchcancel', touchEndListener); // Handle cancellation
    };
    canvas.addEventListener('touchend', touchEndListener);
    canvas.addEventListener('touchcancel', touchEndListener); // Handle cancellation
}

function addMouseListeners() {
    // Add mousemove event listener
    mouseMoveListener = function (e) {
        let pos = getPositionFromEvent(e, canvas);
        mouseX = pos.x;
        mouseY = pos.y;
    };
    canvas.addEventListener('mousemove', mouseMoveListener);

    // Add mouseup event listener
    mouseUpListener = function () {
        mousedown = false;

        // Remove event listeners
        canvas.removeEventListener('mousemove', mouseMoveListener);
        canvas.removeEventListener('mouseup', mouseUpListener);
    };
    document.addEventListener('mouseup', mouseUpListener);
}

canvas.addEventListener('mousedown', function (evt) {
    mousedown = true;
    let pos = getPositionFromEvent(evt, canvas);
    mouseX = pos.x;
    mouseY = pos.y;

    addMouseListeners(); // Set up additional mouse event handlers
});

canvas.addEventListener('touchstart', function (evt) {
    evt.preventDefault(); // Prevent default actions like scrolling
    mousedown = true;
    let pos = getPositionFromEvent(evt, canvas);
    mouseX = pos.x;
    mouseY = pos.y;

    addTouchListeners(); // Set up additional touch event handlers
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
        eraserMode ? deleteSand(mouseIndex.x, mouseIndex.y) : spawnSand(mouseIndex.x, mouseIndex.y, chooseColor());
        
    }
}
function spawnSand(x, y, color) {
    let startX = x - Math.floor(spawnAmount / 2);
    let startY = y - Math.floor(spawnAmount / 2);

    for (let i = 0; i < spawnAmount; i++) {
        // Generate random position
        let nx = startX + Math.floor(Math.random() * spawnAmount);
        let ny = startY + Math.floor(Math.random() * spawnAmount);

        // Check if coordinates are within array
        if (nx >= 0 && nx < sandbox.length && ny >= 0 && ny < sandbox[nx].length) {
            sandbox[nx][ny] = new Grain(color, null);
        }
    }
}

function deleteSand(x, y) {
    let startX = x - Math.floor(spawnAmount / 2);
    let startY = y - Math.floor(spawnAmount / 2);
    for (let i = startX; i < x+(spawnAmount/2); i++) {
        for (let j = startY; j < y+(spawnAmount/2)  ; j++) {
            debugger
            // Check if coordinates are within array
            if (i >= 0 && i < sandbox.length && j >= 0 && j < sandbox[i].length) {
                sandbox[i][j] = 0;
            }
        }
    }
}

const sizeRange = document.getElementById("sizeRange");
sizeRange.value = spawnAmount;
sizeRange.addEventListener("change", () => spawnAmount = parseInt(sizeRange.value));

//------------------------------------------------------------------------



function clearScreen() {
    ctx.fillStyle = '#ccc';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

//fill sandbox array with 0s
function emptySandbox() {
    for (let i = grainNumV - 1; i >= 0; i--) {
        for (let j = grainNum - 1; j >= 0; j--) {
            sandbox[i][j] = 0
        }
    }
}

//draw #000 for 0 and #fff for 1 in sandbox array
function drawSandbox() {
    ctx.beginPath();
    for (let i = sandbox.length - 1; i >= 0; i--) {
        for (let j = sandbox[i].length - 1; j >= 0; j--) {
            if (sandbox[i][j] === 0) {
                ctx.fillStyle = '#000';
            } else {
                ctx.fillStyle = "hsl(" + sandbox[i][j].colorH + ","+colorS+"%,"+colorL+"%)";
            }
            
            ctx.fillRect(j * grainSize, i * grainSize, grainSize, grainSize);
        }
    }
    
}

function chooseColor() {
    switch (colorMode) {
        case 0:
            return colorH;
        case 1:
            return Math.floor(Math.random() * 361); //Random number between 0 and 360
        case 2:
            return shiftGradient();
        default:
            return colorH;
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

function Grain(colorH, settled) {
    this.colorH = colorH; //Hue component of the Grains color
    this.settled = settled; //0 -> directly above a grain with settled = 0 or the floor, 1 -> 1 grain away (only horicontal!!) ...
}

function toogleMagnetism() {
    MagnetismMode = !MagnetismMode;
}

function toggleStability() {
    StabilityMode = !StabilityMode;
}

function shiftGradient() {
    colorH = colorH == 361 ? 0 : colorH + 1;
    return colorH;
}

function toggleEraser() {
    eraserMode = !eraserMode;
}