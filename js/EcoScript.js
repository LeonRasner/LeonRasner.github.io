//Initialize Canvas
const canvas = document.getElementById('evoCanvas');
const ctx = canvas.getContext('2d');

let gameSpeed = 1;
let gamePaused = false;


//Initialize Enteties
var entities = new Array();
var misc = new Array();

//Initialize grid
const gridSize = 50;
const grid = {};

//Initialize Creatures
var speciesList = new Array();

// Default Species
speciesList.push(createSpecies("TameGreens", "green", 2, 0.3, 1));
speciesList.push(createSpecies("QuickYellows", "yellow", 6, 0.1, 3));
speciesList.push(createSpecies("HungryBlues", "blue", 3, 0.4, 5));

// for (i = 1; i < 200; i++) {
//     entities.push(new speciesList[0] (Math.floor(Math.random()*canvas.width),Math.floor(Math.random()*canvas.height)));
// }
// for (i = 1; i < 100; i++) {
//   entities.push(new speciesList[1] (Math.floor(Math.random()*canvas.width),Math.floor(Math.random()*canvas.height)));
// }
// for (i = 1; i < 50; i++) {
//   entities.push(new speciesList[2] (Math.floor(Math.random()*canvas.width),Math.floor(Math.random()*canvas.height)));
// }

// for (i = 1; i < 100; i++) {
//     enteties.push(new Creature ('#'+ Math.floor(Math.random()*16777215).toString(16), 300+5*i, 300+5*i, 5, 0.2));
// }


//Start Game
gameLoop();

function gameLoop() {
  if (gamePaused) return;

  clearScreen();
  drawMisc();
  updateEnteties();

  setTimeout(gameLoop, 1000 / gameSpeed); //update screen "gameSpeed" times a second
}

function clearScreen() {
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function updateEnteties() {
  entities.forEach(entity => {
    entity.update();
    entity.draw();
  })
}

function drawMisc() {
  misc.forEach(obj => {
    obj.draw();
  })
}

function getGridCoordinates(posX, posY, gridSize) {
  return {
    x: Math.floor(posX / gridSize),
    y: Math.floor(posY / gridSize),
  };
}

function pauseUnpause() {
  gamePaused = !gamePaused;
  pauseButton.textContent = gamePaused ? 'Resume' : 'Pause';
  if (!gamePaused) {
    gameLoop();
  }
}

function restartGame() {
  entities = new Array();
  misc = new Array();

  gameLoop();
}

function spawnCreatures(species, number, pattern) {
  number = number < 1000 ? number : 1000; //limit number to 1k
  //Randomly spawn all over canvas
  if (pattern == 'randomSpwan') {
    for (i = 0; i < number; i++) {
      entities.push(new species(Math.floor(Math.random() * canvas.width), Math.floor(Math.random() * canvas.height)));
    }
  }
  // Randomly spawn in a 50px radius of a random point on canvas
  else if (pattern == 'ClusterSpwan') {
    const randomPosX = Math.floor(Math.random() * (canvas.height - canvas.height / 10)) + canvas.height / 20;
    const randomPosY = Math.floor(Math.random() * (canvas.height - canvas.height / 10)) + canvas.height / 20;

    for (i = 0; i < number; i++) {
      entities.push(new species(randomPosX - (canvas.height / 20) + Math.floor(Math.random() * (canvas.height / 10)), randomPosY - (canvas.width / 20) + Math.floor(Math.random() * (canvas.width / 10))));
    }

  }
  // Randomly spawn in a 50px radius of next click on canvas
  else if (pattern == 'ClickSpawn') {
    validationMessageSpeciesSpawn.innerHTML = "Click anywhere on Canvas"
    function handleClick(event) {
      event.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const x = (event.clientX - rect.left) * scaleX;
      const y = (event.clientY - rect.top) * scaleY;

      // Create and add the creature to entities
      for (i = 0; i < number; i++) {
        entities.push(new species(x - (canvas.height / 20) + Math.floor(Math.random() * (canvas.height / 10)), y - (canvas.width / 20) + Math.floor(Math.random() * (canvas.width / 10))));
      }

      // Remove the click event listener after the creature is added
      canvas.removeEventListener('click', handleClick);
    }

    // Add the click event listener
    canvas.addEventListener('click', handleClick);
  }

}