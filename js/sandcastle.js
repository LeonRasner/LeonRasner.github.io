//Leon's Sand Box

//INITIAL SETUP ----------------------------------------------------------------------------------------------------------

//Initialise Canvas
let canvas = document.getElementById('sandCanvas');
let ctx;
//Initialise Grid
let sandbox;
let grainSize = 6; //Determins "resolution" of sand box. 5 - 30 should work well. Anything below 5 can lead to significant performance losses, over 50 to crashes.
let grainNum = parseInt(canvas.width / grainSize);
let grainNumV = parseInt(canvas.height / grainSize);
//Game variables
let isrunning = false;
let gameSpeed = 150;
//Physics variables
let ZeroGMode = false; //Disables physics (blocks stay in place) 
let stickyMode = false; //Grains will only stack verticall and not settle sideways
let veryStickyMode = false; //Grains will stick together horizontally (up to stabillity limit)
let MagnetismMode = false; //Magnetic sand (currently not working right)
let stabillity = 30; //How many grains from a settled piece pieces will stick vertically
let magnetism = 2; //How many grains from a settled piece pieces will move towards (Only works with MagnetismMode)
//Help (help.js)
defineHelpBox('helpBox');
//User-Interaction Variables
let mousedown = false;
let mouseX;
let mouseY;
//Bucket / Eraser Variables
let spawnAmount = 6; //How much sand is spawned / erased by clicking
let eraserMode = false;
//Color Variables
let colorBackground = '#000' //Color of empty space
let colorH = 40; // Hue component of color
let colorS = 81; // Saturation Component
let colorL = 62; // Lightness Component
let colorMode = 2; //0 = static, 1 = gradient, 3 = random

//Grain object represents 1 cell in sandbox
function Grain(colorH, colorS, colorL, settled, changed) {
    this.colorH = colorH; //Hue component of the Grains color
    this.colorS = colorS; //Saturation
    this.colorL = colorL; //Lightness
    this.settled = settled; //0 -> directly above a grain with settled = 0 or the floor, 1 -> 1 grain away (only horicontal!!) ...
    this.changed = changed; //true -> will be redrawn
}

// Adjust canvas size on document load
document.addEventListener('DOMContentLoaded', prepGame);

function prepGame() {
    resizeCanvas();
    //Start Game by showing initial screen
    loadingAnimation();
}
//Set Canvas size based on screen. Limit to 1200px w/h
function resizeCanvas() {
    let container = canvas.parentNode;

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
}

//START GAME ------------------------------------------------------------------------------------------------------------------------

//Prep initial screen with physics-based Logo
function loadingAnimation() {
    ZeroGMode = true;
    prepCanvas();
    loadInitialImage(false)
    document.addEventListener("touchstart", userstart);
    document.addEventListener("mousedown", userstart);
    setPickerColor(colorH,colorS,colorL);
    setTimeout(() => {
        //Show help for inactive user
        if (!isrunning) centerHelpBox("Click and hold to start pouring sand");
    }, 6000);
}

//Real game starts when User interacts with screen 
function userstart() {
    hideHelpBox()
    document.removeEventListener("touchstart", userstart);
    document.removeEventListener("mousedown", userstart);
    startGame()
    //Show Initial help
    moveHelpBox("menuBtn", "Click here for fun options");
    setTimeout(() => {
        hideHelpBox()
    }, 6000);
}

//Starts Physics- and Rendering-Loops
function startGame() {
    isrunning = true;
    ZeroGMode = false;

    gameLoop();
    requestAnimationFrame(renderLoop);
}
//Restart game and reset canvas + sandbox (allows resize)
//Optional image will be loaded to sandbox after reset
function restartGame(image = false) {
    isrunning = false;
    setTimeout(() => {
        resizeCanvas();
        prepCanvas();
        if (image) {
            prepImage(image, true);
        }
        startGame();
    }, 300);
}

//Set canvas variables
function prepCanvas() {
    grainNum = parseInt(canvas.width / grainSize);
    grainNumV = parseInt(canvas.height / grainSize);
    ctx = canvas.getContext("2d", { alpha: false, willReadFrequently: true  });
    sandbox = new Array(grainNumV).fill(null).map(() => new Array(grainNum).fill(1));

    clearScreen();
    emptySandbox();
}

//Advances Logical state of sandbox repeatedly
function gameLoop() {
    checkClick();
    physics();
    if (isrunning) setTimeout(gameLoop, 1000 / gameSpeed);
}

//Renders Current Sandbox to Canvas based on browser framerate
let frameToggle = true;
function renderLoop() {
    drawSandbox();
    if (isrunning) {
        requestAnimationFrame(renderLoop);
    } 
}


//USER INTERACTION --------------------------------------------------------------------------

let mouseMoveListener;
let mouseUpListener;

function getPositionFromEvent(evt, canvas) {
    if (evt.touches) {
        evt = evt.touches[0]; // Get first touch
    }
    return getMousePos(canvas, evt);
}

//Listen for klick
canvas.addEventListener('mousedown', function (evt) {
    mousedown = true;
    let pos = getPositionFromEvent(evt, canvas);
    mouseX = pos.x;
    mouseY = pos.y;

    addMouseListeners(); // Add listeneres for end of klick
});
//Listen for touch
canvas.addEventListener('touchstart', function (evt) {
    evt.preventDefault(); // Prevent default actions like scrolling
    mousedown = true;
    let pos = getPositionFromEvent(evt, canvas);
    mouseX = pos.x;
    mouseY = pos.y;

    addTouchListeners(); // Add listeneres for end of touch
});
//Handle touch moves
function addTouchListeners() {
    touchMoveListener = function (e) {
        e.preventDefault(); // Prevent scrolling
        let pos = getPositionFromEvent(e, canvas);
        mouseX = pos.x;
        mouseY = pos.y;
    };
    canvas.addEventListener('touchmove', touchMoveListener);

    // Listen for end
    touchEndListener = function () {
        mousedown = false;

        // Remove listeners
        canvas.removeEventListener('touchmove', touchMoveListener);
        canvas.removeEventListener('touchend', touchEndListener);
        canvas.removeEventListener('touchcancel', touchEndListener); // Handle cancellation
    };
    canvas.addEventListener('touchend', touchEndListener);
    canvas.addEventListener('touchcancel', touchEndListener); // Handle cancellation
}
//Handle mouse moves
function addMouseListeners() {
    mouseMoveListener = function (e) {
        let pos = getPositionFromEvent(e, canvas);
        mouseX = pos.x;
        mouseY = pos.y;
    };
    canvas.addEventListener('mousemove', mouseMoveListener);

    // Listen for end
    mouseUpListener = function () {
        mousedown = false;

        // Remove listeners
        canvas.removeEventListener('mousemove', mouseMoveListener);
        canvas.removeEventListener('mouseup', mouseUpListener);
    };
    document.addEventListener('mouseup', mouseUpListener);
}
//Calculate position on canvas
function getMousePos(canvas, evt) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
        x: (evt.clientX - rect.left) * scaleX,
        y: (evt.clientY - rect.top) * scaleY
    };
}
//Calculate index in sandbox array
function getArrayIndexForMouse(x, y) {
    return {
        x: Math.floor(x / grainSize),
        y: Math.floor(y / grainSize)
    };
}
//Every frame trigger interaction if mouse is clicked / touched
function checkClick() {
    if (mousedown) {
        const mouseIndex = getArrayIndexForMouse(mouseY, mouseX);
        eraserMode ? deleteSand(mouseIndex.x, mouseIndex.y) : spawnSand(mouseIndex.x, mouseIndex.y, chooseColor());
        setPickerColor(colorH, colorS, colorL);
    }
}
//Spawn sand at position
function spawnSand(x, y, color) {
    let startX = x - Math.floor(spawnAmount / 2);
    let startY = y - Math.floor(spawnAmount / 2);

    for (let i = 0; i < spawnAmount; i++) {
        // Randomize position within spawnAmount
        let nx = startX + Math.floor(Math.random() * spawnAmount);
        let ny = startY + Math.floor(Math.random() * spawnAmount);

        // Check if within array
        if (nx >= 0 && nx < sandbox.length && ny >= 0 && ny < sandbox[nx].length) {
            sandbox[nx][ny] = new Grain(color, colorS, colorL, null, true); //Fill cell with grain
        }
    }
}
//Delete sand at position
function deleteSand(x, y) {
    let startX = x - Math.floor(spawnAmount / 2);
    let startY = y - Math.floor(spawnAmount / 2);
    for (let i = 0; i < spawnAmount; i++) {
        // Randomize position within spawnAmount
        let nx = startX + Math.floor(Math.random() * spawnAmount);
        let ny = startY + Math.floor(Math.random() * spawnAmount);

        // Check if coordinates are within array
        if (nx >= 0 && nx < sandbox.length && ny >= 0 && ny < sandbox[nx].length) {
            sandbox[nx][ny] = 1; //Empty cell
        }
    }
}
//MENU ELEMENTS ----------------------------------------------------------------------------------------------

// Bucket Size
const sizeRange = document.getElementById("sizeRange");
sizeRange.value = spawnAmount;
sizeRange.addEventListener("change", () => spawnAmount = parseInt(sizeRange.value));

//choose single sand color
const colorPicker = document.getElementById("sandColor");
const c0Btn = document.getElementById("c0Btn");
colorPicker.addEventListener("input", x => setHslColorFromHex(colorPicker.value));

//Upload / download Image
document.getElementById('imageInput').addEventListener('change', function (e) {loadCustomImage(e)});
document.getElementById('downloadCanvas').addEventListener('click', x => saveCanvasAsPNG());

//Initialize choice buttons butotons
let choiceBtns = document.getElementsByClassName("btnChoice");
for (var i = 0; i < choiceBtns.length; i++) {
    choiceBtns[i].addEventListener('click', x => choiceBtnClick(x), false);
}

//Handle keyboard inputs
window.addEventListener("keydown", (e) => {

    switch (e.key) {
        case "m":
        case"M":
        case "Escape":
            //Menu (controlls)
            toggleControllVisibility();
            break;  
    }
});

const controlls = document.getElementById("controlls");
const menuBtn = document.getElementById("menuBtn");

//Open / close menu
function toggleControllVisibility() {
    if (controlls.classList.contains("hidden")) {
        controlls.classList.remove("hidden");
        menuBtn.innerHTML = "❌"
    } else {
        controlls.classList.add("hidden");
        menuBtn.innerHTML = "🛠️"
    }
}

//Return Hue component of HSL color depending on current colorMode
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
function setHslColorFromHex(hexColor) {
    let [r, g, b] = hexToRgb(hexColor);
    let [h, s, l] = rgbToHsl(r, g, b);
    colorH = h;
    colorS = s;
    colorL = l;
}
//Change Color picker based on hsl colors
function setPickerColor(h, s, l) {
    let rgb = hslToRgb(h, s, l)
    let hex = rgbToHex(rgb[0], rgb[1], rgb[2]);
    colorPicker.value = hex;
    c0Btn.style.background = hex;

}


//Toggle options based on onclick events ------------
//Magnetism on/off
function toogleMagnetism() {
    MagnetismMode = !MagnetismMode;
}
//ZeroG on/off
function toggleZeroG() {
    if (ZeroGMode) {
        // document.getElementById("zeroGBtn").innerHTML = "👩‍🚀"
        document.getElementById("zeroGBtn").classList.remove("active")
    } else{
        // document.getElementById("zeroGBtn").innerHTML = "🌍" 	        
        document.getElementById("zeroGBtn").classList.add("active")
    }
    ZeroGMode = !ZeroGMode;
}
//Choice Buttons (color-modes / eraser) - only one can be active
function choiceBtnClick(x) {
    let targetBtn = x.currentTarget
    //Remove active style from all buttons and add it to click-target.
    let toggleEraser = false;
        for (var i = 0; i < choiceBtns.length; i++) {
            if (choiceBtns[i].classList.contains("active")) {
                choiceBtns[i].classList.remove("active");
                //Change color mode based on click-target
                switch (targetBtn.id) {
                    case "c0Btn":
                        colorMode = 0;
                        eraserMode = false;
                        break;
                    case "c1Btn":
                        colorMode = 1;
                        eraserMode = false;
                        break;
                    case "c2Btn":
                        colorMode = 2;
                        eraserMode = false;
                        break;
                    case "erBtn":
                        if (eraserMode) {
                            toggleEraser = true;
                        } else {
                            eraserMode = true;
                        }
                        break;
                    default:
                        break
                }
            }
        }
        if (toggleEraser) {
            choiceBtns[colorMode].classList.add("active");
            eraserMode = false;
        } else {
            targetBtn.classList.add("active");
        }

}

//Initialize resolution buttons
let resBtns = document.getElementsByClassName("resBtn");
for (var i = 0; i < resBtns.length; i++) {
    resBtns[i].addEventListener('click', x => resolutionBtnClick(x), false);
}

function resolutionBtnClick(x) {
    let targetBtn = x.currentTarget
    //Remove active style from all buttons and add it to click-target.
        for (var i = 0; i < resBtns.length; i++) {
            if (resBtns[i].classList.contains("active")) {
                resBtns[i].classList.remove("active");
            }
        }
        changeGrainSize(targetBtn.getAttribute("data-size"));
        targetBtn.classList.add("active");
        
}


// Change stability mode
// 0 -> "Normal Sand" ; 1 -> "Sticky Sand" ; 2 -> "Very Sticky Sand"; (Only one can be active at once)
function toggleStability(a) {
    if (a == 0) {
            document.getElementById("stickyBtn").classList.remove("active");
            document.getElementById("veryStickyBtn").classList.remove("active");
            document.getElementById("normalBtn").classList.add("active");
            stickyMode = false
            veryStickyMode = false;
    } else if (a == 1) {
        if (veryStickyMode || !stickyMode) {
            document.getElementById("stickyBtn").classList.add("active");
            document.getElementById("veryStickyBtn").classList.remove("active");
            document.getElementById("normalBtn").classList.remove("active");
            stickyMode = true;
            veryStickyMode = false;
        } else if (stickyMode) {
            document.getElementById("stickyBtn").classList.remove("active");
            document.getElementById("veryStickyBtn").classList.remove("active");
            document.getElementById("normalBtn").classList.add("active");
            stickyMode = false
            veryStickyMode = false;
        }
    } else {
        if (veryStickyMode) {
            document.getElementById("veryStickyBtn").classList.remove("active");
            document.getElementById("stickyBtn").classList.remove("active");
            document.getElementById("normalBtn").classList.add("active");
            veryStickyMode = false;
            stickyMode = false;
        } else{
            document.getElementById("veryStickyBtn").classList.add("active");
            document.getElementById("stickyBtn").classList.remove("active");
            document.getElementById("normalBtn").classList.remove("active");
            veryStickyMode = true;
            stickyMode = true;
        }
    }
}

//RENDERING -----------------------------------------------------------------------------------------------------------------------

//Clear canvas (paint it black)
function clearScreen() {
    ctx.fillStyle = '#000';
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

// Render sandbox to canvas. 1 and 0 -> colorBackground ; Grain -> hsl color of grain
// 1 or Grain.changed -> Will be drawn; Otherwise no change, so won't be drawn again
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

//Change grainSize and reset game while keeping curent image
function changeGrainSize(size){
    let sizeFactor = parseInt(grainSize / size);
    grainSize = size;

    const tempCanvas = document.createElement('canvas');   
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.filter = 'blur('+sizeFactor+'px)';
    tempCtx.drawImage(canvas, 0, 0);

    const imageDataUrl = tempCanvas.toDataURL('image/png');
    const image = new Image();
    image.src = imageDataUrl;
    image.onload = function() {
        restartGame(image)
    };
}

let gradientCnt = 0
//Slowly shift color for Gradient mode
function shiftGradient() {
    if (gradientCnt == 2) {
        colorH = colorH == 361 ? 0 : colorH + 1;
        gradientCnt = 0;
    }
    gradientCnt++;
    return colorH;
}

//COLOR Conversion (AI generated) ------------------------------------------------------------------------------------------------
function hslToRgb(h, s, l) {
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

    if (max == min) {
        h = s = 0;
    } else {
        let d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}


// IMAGE PROCESSING --------------------------------------------------------------------------------------------------------------

//Determin image scaling and draw it to canvas
function prepImage(image, keepAspect) {
    //Empty sandbox and canvas
    emptySandbox();
    drawSandbox();
    //Draw Image
    if (!keepAspect) {
        //Draw in a 1-1- ratio
        let a = Math.min(canvas.width, canvas.height)
        let offx = (canvas.width - a) / 2;
        let offy = (canvas.height - a) / 2;
        ctx.drawImage(image, offx, offy, a, a);
    } else {
        //Draw in real image ratio
        let canvasWidth = canvas.width;
        let canvasHeight = canvas.height;
        let canvasRatio = canvasWidth / canvasHeight;
        
        let width = image.naturalWidth;
        let height = image.naturalHeight;
        let imageRatio = width / height;
        
        let drawWidth, drawHeight, offsetX, offsetY;
        
        // Determine image scale
        if (imageRatio < canvasRatio) {
            // Fit to height and adjust width
            drawHeight = canvasHeight;
            drawWidth = canvasHeight * imageRatio;
            offsetX = (canvasWidth - drawWidth) / 2;  // Center horizontally
            offsetY = 0;  // Align top
        } else {
            // Fit to width and adjust height
            drawWidth = canvasWidth;
            drawHeight = canvasWidth / imageRatio;
            offsetX = 0;  // Align left
            offsetY = (canvasHeight - drawHeight) / 2;  // Center vertically
        }

        // Draw the image scaled within the canvas and centered
        ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
        
    }
    processImage(canvas.width, canvas.height);
}

//Read image from canvas and translate it to sandbox
function processImage(width, height) {
    //Read image
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    //Place according grains in sandbox
    for (let i = sandbox.length - 1; i >= 0; i--) {
        for (let j = sandbox[i].length - 1; j >= 0; j--) {
            //Read color data from imageDate
            const ii = Math.floor(i * grainSize * 4);
            const ij = Math.floor(j * grainSize * 4);
            const index = (ii * width + ij);
            const r = data[index];
            const g = data[index + 1];
            const b = data[index + 2];
            //Place grains based on data
            if (r == null || r < 50 && b < 50 && g < 50) {
                //Dark pixles become empty space
                sandbox[i][j] = 1;
            } else {
                //Grain with pixle color is placed
                const hsl = rgbToHsl(r, g, b);
                sandbox[i][j] = new Grain(hsl[0], hsl[1], hsl[2], null, true);
            }
        }
    }
    //Render sandbox
    clearScreen();
    drawSandbox();
}

//Loade an image from upload event and check it
function loadCustomImage(e) {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];

        // Ensure it's an image
        if (file.type.match('image.*')) {
            const reader = new FileReader();

            reader.onload = function(evt) {
                const img = new Image();
                img.onload = function() {
                    prepImage(img, true);
                };
                
                img.src = evt.target.result; // Set image source to data URL
                canvas.style.display = 'block'; // Show canvas
            };

            // Read the file as Data URL
            reader.readAsDataURL(file);
        } else {
            console.error('File is not an image.');
        }
    }
}

//Save current canvas state as PNG and download it to client
//Optionally append metadata string to filename (current game settings)
function saveCanvasAsPNG(metadata = "") {
    let dataURL = canvas.toDataURL('image/png');

    // Create "fake" download link for image
    let downloadLink = document.createElement('a');
    downloadLink.href = dataURL;
    downloadLink.download = 'sandbox_'+ Date.now() + metadata +'.png';

    // Trigger link click to start download
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}

//Load Logo for game start
function loadInitialImage(keepAspect) {
    const image = new Image();
    image.src = '/images/sandbox.png'; // Path to your image
    image.onload = () => {
        prepImage(image, keepAspect);
    };
}

// SIMULATION -------------------------------------------------------------------------------------------------------------

// Determin logical state of all grains in sandbox (position)
function physics() {
    //Magnetism (Currently not working right)
    if (MagnetismMode) {
        for (let i = sandbox.length - 1; i >= 0; i--) {
            for (let j = sandbox[i].length - 1; j >= 0; j--) {
                if (sandbox[i][j] != 0 && sandbox[i][j] != 1 && sandbox[i][j].settled == null) {
                    //Check for every grain
                    if ((j == 0 || sandbox[i][j - 1] == 0 || sandbox[i][j - 1] == 1) && (j == sandbox[i].length - 1 || sandbox[i][j + 1] == 0 || sandbox[i][j + 1] == 1)) {
                        //Direct neighbours are empty -> can move horizontally
                        if (i < sandbox.length - 1) {
                            //Not floor row
                            if (sandbox[i + 1][j] == 0 ||sandbox[i + 1][j] == 1) {
                                //Nothing stable below
                                let minDistance = magnetism;
                                let magnetismDirection;
                                let min = j - magnetism < 0 ? 0 : j - magnetism;
                                let max = j + magnetism >= sandbox[i].length ? sandbox[i].length - 1 : j + magnetism;
                                for (let k = min; k <= max; k++) {
                                    //Chek if stable piece is nearby
                                    if ((k > j + 1 || k < j - 1) && sandbox[i][k] != 0 && sandbox[i][k] != 1 && sandbox[i][k].settled != null && sandbox[i][k].settled < stabillity) {
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
                                    sandbox[i][j].changed = true;
                                    sandbox[i][j + magnetismDirection] = sandbox[i][j];
                                    sandbox[i][j] = 1;
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    //Gravity -----------
    let direction = false;
    for (let i = sandbox.length - 1; i >= 0; i--) {
        if (direction) {
            direction = false
            for (let j = sandbox[i].length - 1; j >= 0; j--) { 
                gravity(i,j);
            }
        } else {
            direction = true
            for (let j = 0 ; j < sandbox[i].length; j++) {
                gravity(i,j);
            }
        }
    }
}

//Determin direction of movement for every grain in sandbox
function gravity(i,j) {
    if (sandbox[i][j] !== 0 && sandbox[i][j] !== 1) {
        //Check for every grain
        if (i < sandbox.length - 1) {
            //Not floor row
            if (sandbox[i + 1][j] === 0 || sandbox[i + 1][j] === 1) {
                //Zero G --------------------
                if (!ZeroGMode) {
                    //Stabillity ----------------
                    if (veryStickyMode) {
                        let leftEdge = j == 0;
                        let rightEdge = j == sandbox[i].length - 1;
                        if (sandbox[i][j].settled == null || sandbox[i][j].settled > stabillity) {
                            if (!leftEdge && sandbox[i][j - 1] != 0 && sandbox[i][j - 1] != 1 && sandbox[i][j - 1].settled != null && sandbox[i][j - 1].settled < stabillity) {
                                //settled piece to left
                                sandbox[i][j].settled = sandbox[i][j - 1].settled + 1;
                            } else if (!rightEdge && sandbox[i][j + 1] != 0 && sandbox[i][j + 1] != 1 && sandbox[i][j + 1].settled != null && sandbox[i][j + 1].settled < stabillity) {
                                //settled piece to right
                                sandbox[i][j].settled = sandbox[i][j + 1].settled + 1;
                            } else {
                                //No settled piece left or right -> move down
                                sandbox[i][j].changed = true;
                                sandbox[i + 1][j] = sandbox[i][j];
                                sandbox[i][j] = 1;
                                sandbox[i][j].changed = true;
                            }
                        }

                    } else {
                        //Stabillity mode disable -> move down
                        sandbox[i][j].changed = true;
                        sandbox[i + 1][j] = sandbox[i][j];
                        sandbox[i][j] = 1;
                    }
                }
            } else {
                //sits on top of settled piece -> settled == piece below
                if (!stickyMode && !ZeroGMode) {
                    let leftFree = j >= 0 && (sandbox[i+1][j-1] === 0 || sandbox[i+1][j-1] === 1);
                    let rightFree = j <= sandbox[i].length && (sandbox[i+1][j+1] === 0 || sandbox[i+1][j+1] === 1);
                    if(leftFree && rightFree) {
                        //Move in random direction down
                        if (Math.random > .499) {
                            sandbox[i][j].changed = true;
                            sandbox[i + 1][j + 1] = sandbox[i][j];
                            sandbox[i][j] = 1;
                        } else {
                            sandbox[i][j].changed = true;
                            sandbox[i + 1][j - 1] = sandbox[i][j];
                            sandbox[i][j] = 1;
                        }
                    } else if (leftFree) {
                        sandbox[i][j].changed = true;
                        sandbox[i + 1][j - 1] = sandbox[i][j];
                        sandbox[i][j] = 1;
                    } else if (rightFree) {
                        sandbox[i][j].changed = true;
                        sandbox[i + 1][j + 1] = sandbox[i][j];
                        sandbox[i][j] = 1;
                    } else {
                        sandbox[i][j].settled = sandbox[i + 1][j].settled;
                    }
                } else {
                    sandbox[i][j].settled = sandbox[i + 1][j].settled;
                }
            }
        } else {
            //sits on floor -> settled = 0
            sandbox[i][j].settled = 0;
            sandbox[i][j].changed = true;
        }
    }
}