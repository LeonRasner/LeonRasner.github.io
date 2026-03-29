//Initialize UI
const gameSpeedSlider = document.getElementById('gameSpeed');
const pauseButton = document.getElementById('pauseButton');
const resetButton = document.getElementById('resetButton');
const speciesButton = document.getElementById('speciesButton');
const speciesContainer = document.getElementById('speciesContainer');
const openSpeciesButton = document.getElementById('openSpeciesButton');
const spawnNumberInput = document.getElementById('spawnNumberInput');
const validationMessageCreateSpecies = document.getElementById('validationMessageCreateSpecies');
const validationMessageSpeciesSpawn = document.getElementById('validationMessageSpeciesSpawn');

gameSpeed = gameSpeedSlider.value;
gamePaused = false;

//Listen for UI
//Speed
gameSpeedSlider.addEventListener('input', (e) => {
  gameSpeed = parseFloat(e.target.value);
});
//Pause
pauseButton.addEventListener('click', () => {
  pauseUnpause();
});
document.body.onkeyup = function (e) {
  if (e.key == " " ||
    e.code == "Space" ||
    e.keyCode == 32
  ) {
    pauseUnpause();
  }
}
//Reset
resetButton.addEventListener('click', () => {
  restartGame();
});
//Create Species
openSpeciesButton.addEventListener('click', () => {
  if (speciesContainer.classList.contains("hidden")) {
    speciesContainer.classList.remove("hidden");
  } else {
    speciesContainer.classList.add("hidden")
  }
});

speciesButton.addEventListener('click', () => {
  const name = document.getElementById('SpeciesName').value;
  const color = document.getElementById('SpeciesColor').value;
  const speed = document.getElementById('SpeciesSpeed').value;
  const directionBehavior = document.getElementById('SpeciesDirection').value;
  const agression = document.getElementById('SpeciesAgression').value;
  const speciesId = speciesList.length ? speciesList.length + 1 : 0;

  const newSpecies = createSpecies(name, color, speed, directionBehavior, agression);
  if (speciesList.findIndex(s => s.displayName == name) == -1) {
    if (speciesList.findIndex(s => s.displayColor == color) == -1) {
      speciesList.push(newSpecies);
      validationMessageCreateSpecies.innerHTML = '';
      updateSpeciesList();
      randomizeColor();
    } else {
      validationMessageCreateSpecies.innerHTML = 'Color already exists';
    }

  } else {
    validationMessageCreateSpecies.innerHTML = 'Name already exists';
  }
});

//Fill Species List
function updateSpeciesList() {
  const speciesListContainer = document.getElementById('speciesListContainer');
  speciesListContainer.innerHTML = ''; // Clear the container
  const markup = document.createElement('div');
  markup.style.width = '100%';
  speciesList.forEach(species => {
    const div = document.createElement('div');
    const innerDiv = document.createElement('div');
    innerDiv.classList.add("speciesInnerDiv");
    div.appendChild(innerDiv);
    div.classList.add("speciesContainer");
    const buttonsDiv = document.createElement('div');
    buttonsDiv.style.display = 'flex';
    buttonsDiv.style.flexDirection = 'column';
    buttonsDiv.style.marginLeft = '6px';

    //Spawn Buttons
    const btnSpawnClick = document.createElement('div');
    btnSpawnClick.innerHTML= '<button class="btnSpawn"><small>Spawn</small> 👉</button>';
    buttonsDiv.appendChild(btnSpawnClick);

    const btnSpawnRandom = document.createElement('div');
    btnSpawnRandom.innerHTML= '<button class="btnSpawn"><small>Spawn</small> 🎲</button>';
    buttonsDiv.appendChild(btnSpawnRandom);

    const btnSpawnCluster = document.createElement('div');
    btnSpawnCluster.innerHTML= '<button class="btnSpawn"><small>Spawn</small> ⭕</button>';
    buttonsDiv.appendChild(btnSpawnCluster);

    
    btnSpawnClick.addEventListener('click', () => {
      const numberOfCreatures = parseInt(spawnNumberInput.value);
      spawnCreatures(species, numberOfCreatures, 'ClickSpawn');
    });
    btnSpawnRandom.addEventListener('click', () => {
      const numberOfCreatures = parseInt(spawnNumberInput.value);
      spawnCreatures(species, numberOfCreatures, 'randomSpwan');
    });
    btnSpawnCluster.addEventListener('click', () => {
      const numberOfCreatures = parseInt(spawnNumberInput.value);
      spawnCreatures(species, numberOfCreatures, 'ClusterSpwan');
    });

    div.appendChild(buttonsDiv);
  
    const colorDiv = document.createElement('div');
    colorDiv.style.width = '40px';
    colorDiv.style.height = '40px';
    colorDiv.style.margin = '0 8px';
    colorDiv.style.backgroundColor = species.displayColor;
    colorDiv.style.border = '1px solid lightgrey';
  
    //🏃💪↩
    const infoDiv = document.createElement('div');
    infoDiv.innerHTML = `
      <strong>${species.displayName}</strong><br>
      ${bar(species.displaySpeed, 1, 5, "⚡")}
      ${bar(species.displayRandomness, 0.01, 0.99, "🔀")}
      ${bar(species.displayAgression, 1, 10, "⚔️")}
    `;
  
    innerDiv.appendChild(colorDiv);
    innerDiv.appendChild(infoDiv);
    markup.appendChild(div);
  });
  

  speciesListContainer.appendChild(markup);
}
//Helper species list bars:
const bar = (value, min, max, icon, color) => {
  const pct = ((value - min) / (max - min)) * 100;
  const alpha = 0.5 + (pct / 100) * 0.5; // 0.2 -> 1.0
  return `
    <div style="display:flex; align-items:center; gap:0px; width:100%; margin:0px 0;">
      <span>${icon}</span>
      <div style="flex:1; height:10px; background:#333; border-radius:999px; overflow:hidden;">
        <div style="width:${pct}%; height:100%; background:rgba(155,155,155,${alpha});"></div>
      </div>
    </div>
  `;
};


//randomize color picker
function randomizeColor () {
  document.getElementById('SpeciesColor').value = '#'+ Math.floor(Math.random()*16777215).toString(16);
}
document.addEventListener("DOMContentLoaded", function(event) { 
  randomizeColor();
  updateSpeciesList();
});