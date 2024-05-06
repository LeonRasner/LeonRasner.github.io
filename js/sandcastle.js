let mousedown = false;
let mouseX;
let mouseY;

//Initialize Canvas
let canvas = document.getElementById('sandCanvas');
let ctx = canvas.getContext("2d", { alpha: false });
//Initialise Grid
const grainSize = 5;
let grainNum = parseInt(canvas.width / grainSize);
let grainNumV = parseInt(canvas.height / grainSize);
//Sand array
let sandbox;
//Game variables
let isrunning = false;
let gameSpeed = 70;
//Physics variables
let ZeroGMode = false;
let StabilityMode = false;
let MagnetismMode = false;
let stabillity = 30; //How many grains from a settled piece pieces will stick vertically
let magnetism = 5; //How many grains from a settled piece pieces will move towards

//Draw Variables
let spawnAmount = 6;
let eraserMode = false;

//COLOR
let colorBackground = '#000'
let colorH = 40; // Hue component of color
let colorS = 81; // Saturation Component
let colorL = 62; // Lightness Component
let colorMode = 0; //0 = static, 1 = gradient, 3 = random
//let shiftSpeed = 1; //by how much the Hue of colorH shifts each shiftGradient in %

function resizeCanvas() {
    let container = canvas.parentNode; // Assuming the canvas is wrapped by a div or similar element

    let maxWidth = 1200;
    let maxHeight = 1200;

    // Aspect ratio
    let ratio = Math.min(maxWidth / container.clientWidth, maxHeight / container.clientHeight);

    let width = container.clientWidth * ratio;
    let height = container.clientHeight * ratio;
  
    width = Math.min(width, maxWidth);
    height = Math.min(height, maxHeight);

    canvas.width = width;
    canvas.height = height;
    loadingAnimation();
}

// Adjust canvas size on document load and resize
document.addEventListener('DOMContentLoaded', resizeCanvas);

function loadingAnimation () {
    ZeroGMode = true;
    prepCanvas();
    loadAndProcessImage(canvas, ctx, true)
    canvas.addEventListener("touchend",userstart);
    canvas.addEventListener("click",userstart);
}

function userstart() {
    canvas.removeEventListener("touchend",userstart);
    canvas.removeEventListener("click",userstart);
    startGame()
}

function prepCanvas() {
    grainNum = parseInt(canvas.width / grainSize);
    grainNumV = parseInt(canvas.height / grainSize);
    ctx = canvas.getContext("2d", { alpha: false });
    sandbox = new Array(grainNumV).fill(null).map(() => new Array(grainNum).fill(1));

    clearScreen();
    emptySandbox();
}

function startGame() {
    isrunning = true;
    ZeroGMode = false;
    setTimeout(() => {
        gameSpeed = 150;
    }, 2000);

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
        eraserMode ? deleteSand(mouseIndex.x, mouseIndex.y, false) : spawnSand(mouseIndex.x, mouseIndex.y, chooseColor());
        setPickerColor(colorH,colorS,colorL);
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
            sandbox[nx][ny] = new Grain(color, colorS, colorL, null, true);
        }
    }
}

function deleteSand(x, y,deletefast) {
    let startX = x - Math.floor(spawnAmount / 2);
    let startY = y - Math.floor(spawnAmount / 2);
    if(deletefast) {
        for (let i = startX; i < x + (spawnAmount / 2); i++) {
            for (let j = startY; j < y + (spawnAmount / 2); j++) {
                // Check if coordinates are within array
                if (i >= 0 && i < sandbox.length && j >= 0 && j < sandbox[i].length) {
                    sandbox[i][j] = 1;
                }
            }
        }
    } else {
        for (let i = 0; i < spawnAmount; i++) {
            // Generate random position
            let nx = startX + Math.floor(Math.random() * spawnAmount);
            let ny = startY + Math.floor(Math.random() * spawnAmount);
    
            // Check if coordinates are within array
            if (nx >= 0 && nx < sandbox.length && ny >= 0 && ny < sandbox[nx].length) {
                sandbox[nx][ny] = 1;
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
            sandbox[i][j] = 1
        }
    }
}

//draw #000 for 0 and #fff for 1 in sandbox array
function drawSandbox() {
    ctx.beginPath();
    for (let i = sandbox.length - 1; i >= 0; i--) {
        for (let j = sandbox[i].length - 1; j >= 0; j--) {
            if (sandbox[i][j] == 1) {
                ctx.fillStyle = colorBackground;
                ctx.fillRect(j * grainSize, i * grainSize, grainSize, grainSize);
                sandbox[i][j] = 0;
            } else if (sandbox[i][j] != 0 && sandbox[i][j].changed == true) {
                ctx.fillStyle = "hsl(" + sandbox[i][j].colorH + "," + sandbox[i][j].colorS + "%," + sandbox[i][j].colorL + "%)";
                ctx.fillRect(j * grainSize, i * grainSize, grainSize, grainSize);
                sandbox[i][j].changed = false;
            }
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
    // if (MagnetismMode) {
    //     for (let i = sandbox.length - 1; i >= 0; i--) {
    //         for (let j = sandbox[i].length - 1; j >= 0; j--) {
    //             if (sandbox[i][j] != 0 && sandbox[i][j] != 1 && sandbox[i][j].settled == null) {
    //                 //Check for every grain
    //                 if ((j == 0 || sandbox[i][j - 1] == 0 || sandbox[i][j - 1] == 1) && (j == sandbox[i].length - 1 || sandbox[i][j + 1] == 0 || sandbox[i][j + 1] == 1)) {
    //                     //Direct neighbours are empty -> can move horizontally
    //                     if (i < sandbox.length - 1) {
    //                         //Not floor row
    //                         if (sandbox[i + 1][j] == 0 ||sandbox[i + 1][j] == 1) {
    //                             //Nothing stable below
    //                             let minDistance = magnetism;
    //                             let magnetismDirection;
    //                             let min = j - magnetism < 0 ? 0 : j - magnetism;
    //                             let max = j + magnetism >= sandbox[i].length ? sandbox[i].length - 1 : j + magnetism;
    //                             for (let k = min; k <= max; k++) {
    //                                 //Chek if stable piece is nearby
    //                                 if ((k > j + 1 || k < j - 1) && sandbox[i][k] != 0 && sandbox[i][k] != 1 && sandbox[i][k].settled != null && sandbox[i][k].settled < stabillity) {
    //                                     if (sandbox[i][k].settled < stabillity) {
    //                                         let distance = Math.abs(k - j);
    //                                         if (minDistance > distance) {
    //                                             minDistance = distance;
    //                                             magnetismDirection = k - j;
    //                                             magnetismDirection = magnetismDirection < 0 ? magnetismDirection + 1 : magnetismDirection - 1;
    //                                         }
    //                                     }
    //                                 }
    //                             }
    //                             if (minDistance != magnetism) {
    //                                 //neares settled piece in magnetic range -> move next to it
    //                                 sandbox[i][j].changed = true;
    //                                 sandbox[i][j + magnetismDirection] = sandbox[i][j];
    //                                 sandbox[i][j] = 1;
    //                             }
    //                         }
    //                     }
    //                 }
    //             }
    //         }
    //     }
    // }
    //Gravity -----------
    for (let i = sandbox.length - 1; i >= 0; i--) {
        for (let j = sandbox[i].length - 1; j >= 0; j--) {
            if (sandbox[i][j] !== 0 && sandbox[i][j] !== 1) {
                //Check for every grain
                if (i < sandbox.length - 1) {
                    //Not floor row
                    if (sandbox[i + 1][j] === 0 || sandbox[i + 1][j] === 1) {
                        //Zero G --------------------
                        if (ZeroGMode) {

                        }
                        //Stabillity ----------------
                        else if (StabilityMode) {
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
                                sandbox[i][j].changed = true;
                                sandbox[i + 1][j] = sandbox[i][j];
                                sandbox[i][j] = 1;
                                sandbox[i][j].changed = true;
                            }
                        } else {
                            //Stabillity mode disable -> move down
                            sandbox[i][j].changed = true;
                            sandbox[i + 1][j] = sandbox[i][j];
                            sandbox[i][j] = 1;
                            sandbox[i][j].changed = true;
                        }

                    } else {
                        //sits on top of settled piece -> settled == piece below
                        sandbox[i][j].settled = sandbox[i + 1][j].settled;
                    }
                } else {
                    //sits on floor -> settled = 0
                    sandbox[i][j].settled = 0;
                    sandbox[i][j].changed = true;
                }
            }
        }
    }
}

function Grain(colorH,colorS,colorL,settled, changed) {
    this.colorH = colorH; //Hue component of the Grains color
    this.colorS = colorS; //Saturation
    this.colorL = colorL; //Lightness
    this.settled = settled; //0 -> directly above a grain with settled = 0 or the floor, 1 -> 1 grain away (only horicontal!!) ...
    this.changed = changed; //true -> will be redrawn
}

const colorPicker = document.getElementById("sandColor");
colorPicker.addEventListener("input", x => changColorFromPicker(colorPicker.value));

function changColorFromPicker (hexColor) {
    let [r, g, b] = hexToRgb(hexColor);
    let [h, s, l] = rgbToHsl(r, g, b);
    colorH = h;
    colorS = s;
    colorL = l;
}

function setPickerColor(h,s,l) {
    let rgb = hslToRgb(h,s,l)
    colorPicker.value = rgbToHex(rgb[0],rgb[1],rgb[2]);
}

function hslToRgb(h, s, l){
    s /= 100;
    l /= 100;
    let c = (1 - Math.abs(2 * l - 1)) * s;
    let x = c * (1 - Math.abs((h / 60) % 2 - 1));
    let m = l - c / 2;
    let r = 0;
    let g = 0;
    let b = 0;

    if (0 <= h && h < 60) {
        r = c; g = x; b = 0;  
    } else if (60 <= h && h < 120) {
        r = x; g = c; b = 0;
    } else if (120 <= h && h < 180) {
        r = 0; g = c; b = x;
    } else if (180 <= h && h < 240) {
        r = 0; g = x; b = c;
    } else if (240 <= h && h < 300) {
        r = x; g = 0; b = c;
    } else if (300 <= h && h < 360) {
        r = c; g = 0; b = x;
    }
    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);

    return [r, g, b];
}

function rgbToHex(r, g, b) {
    r = r.toString(16).padStart(2, '0');
    g = g.toString(16).padStart(2, '0');
    b = b.toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
}


function hexToRgb(hex) {
    // Remove the hash at the start if it's there
    hex = hex.replace(/^\s*#|\s*$/g, '');

    // Parse the hex into RGB
    let r = parseInt(hex.substr(0, 2), 16);
    let g = parseInt(hex.substr(2, 2), 16);
    let b = parseInt(hex.substr(4, 2), 16);

    return [r, g, b];
}

function rgbToHsl(r, g, b) {
    r /= 255, g /= 255, b /= 255;
    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if(max == min){
        h = s = 0; // achromatic
    } else {
        let d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max){
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
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

function toggleZeroG() {
    ZeroGMode = !ZeroGMode;
}

const controlls = document.getElementById("controlls");

function toggleControllVisibility() {
    if (controlls.classList.contains("hidden")) {
        controlls.classList.remove("hidden");
    } else {
        controlls.classList.add("hidden");
    }
}


function loadAndProcessImage(canvas, ctx, keepAspect) {
    const image = new Image();
    image.src = '/images/sandbox.png'; // Path to your image
    image.onload = () => {
        emptySandbox();
        drawSandbox();
        if (keepAspect) {
            let a = Math.min(canvas.width, canvas.height)
            let offx = (canvas.width - a) / 2;
            let offy = (canvas.height - a) / 2;
            ctx.drawImage(image, offx, offy, a, a);
        } else {
            ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        }
        processImage(ctx, canvas.width, canvas.height);
    };
}


function processImage(ctx, width, height) {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    for (let i = sandbox.length - 1; i >= 0; i--) {
        for (let j = sandbox[i].length - 1; j >= 0; j--) {
            const ii = Math.floor(i * grainSize * 4);
            const ij = Math.floor(j * grainSize * 4);
            const index = (ii * width + ij);
            const r = data[index];
            const g = data[index + 1];
            const b = data[index + 2];

            if (r == null || r < 50 && b < 50 && g < 50) {
                sandbox[i][j] = 1;
            } else {55
                const hsl = rgbToHsl(r, g, b);
                sandbox[i][j] = new Grain(hsl[0],hsl[1],hsl[2], null, true);
            }
        }
    }
}
