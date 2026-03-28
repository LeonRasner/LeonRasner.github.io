//Initialize UI
const gameSpeedSlider = document.getElementById('gameSpeed');
const pauseButton = document.getElementById('pauseButton');
const resetButton = document.getElementById('resetButton');
const speciesButton = document.getElementById('speciesButton');
const speciesContainer = document.getElementById('speciesContainer');
const openSpeciesButton = document.getElementById('openSpeciesButton');
const validationMessageCreateSpecies = document.getElementById('validationMessageCreateSpecies');
const validationMessageSpeciesSpawn = document.getElementById('validationMessageSpeciesSpawn');
let selectedSpawnBehavior = 'ClusterSpwan';

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
  let name = document.getElementById('SpeciesName').value;
  let color = document.getElementById('SpeciesColor').value;
  let speed = document.getElementById('SpeciesSpeed').value;
  let directionBehavior = document.getElementById('SpeciesDirection').value;
  let agression = document.getElementById('SpeciesAgression').value;

  let newSpecies = createSpecies(name, color, speed, directionBehavior, agression);
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

//Change spawn behavior
document.getElementById('randomSpwan').addEventListener('click', () => {
  selectedSpawnBehavior = 'randomSpwan';
  validationMessageSpeciesSpawn.innerHTML = ""
});
document.getElementById('ClusterSpwan').addEventListener('click', () => {
  selectedSpawnBehavior = 'ClusterSpwan';
  validationMessageSpeciesSpawn.innerHTML = ""
});
document.getElementById('ClickSpawn').addEventListener('click', () => {
  selectedSpawnBehavior = 'ClickSpawn';
  validationMessageSpeciesSpawn.innerHTML = "Click on spawn first"
});


//Fill Species List
function updateSpeciesList() {
  const speciesListContainer = document.getElementById('speciesListContainer');
  speciesListContainer.innerHTML = ''; // Clear the container
  const markup = document.createElement('div');
  speciesList.forEach(species => {
    const div = document.createElement('div');
    const innerDiv = document.createElement('div');
    innerDiv.classList.add("speciesInnerDiv");
    div.appendChild(innerDiv);
    div.classList.add("speciesContainer");
  
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
      ${bar(species.displayRandomness, 0.01, 0.99, "🎲")}
      ${bar(species.displayAgression, 1, 10, "⚔️")}
    `;
  
    const inputDiv = document.createElement('div');
    inputDiv.style.margin = "0 0 0 10px";
    const spawnNumberInput = document.createElement('input');
    spawnNumberInput.type = 'number';
    spawnNumberInput.style.width = '46px';
    spawnNumberInput.value = '50';
    spawnNumberInput.max = '1000';
    spawnNumberInput.min = '1';
    spawnNumberInput.setAttribute('data-species', species.displayName);
    inputDiv.appendChild(spawnNumberInput);
    inputDiv.appendChild(document.createElement('br'));
  
    const spawnButton = document.createElement('button');
    spawnButton.classList.add('spawnButton');
    spawnButton.setAttribute('data-species', species.displayName);
    spawnButton.innerText = 'Spawn';
    inputDiv.appendChild(spawnButton);
  
    spawnButton.addEventListener('click', () => {
      const speciesName = spawnButton.dataset.species;
      const numberOfCreatures = parseInt(spawnNumberInput.value);
      spawnCreatures(speciesList[speciesList.findIndex(species => species.displayName == speciesName)], numberOfCreatures, selectedSpawnBehavior);
    });
  
    innerDiv.appendChild(colorDiv);
    innerDiv.appendChild(infoDiv);
    div.appendChild(inputDiv);
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