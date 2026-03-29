const chartCanvas = document.getElementById("chartCanvas");
const chartCtx = chartCanvas.getContext("2d");

const speciesColors = {};

const speciesHistory = [];
const maxHistoryPoints = 300;
let tick = 0;

function countSpeciesAlive() {
    const counts = {};

    for (const entity of entities) {
        if (entity.isDead) continue;

        if (!counts[entity.speciesId]) {
            counts[entity.speciesId] = 0;
        }

        counts[entity.speciesId]++;
    }

    return counts;
}

function recordSpeciesHistory() {
    tick++;

    if (tick % 5 !== 0) return;

    speciesHistory.push(countSpeciesAlive());

    if (speciesHistory.length > maxHistoryPoints) {
        speciesHistory.shift();
    }
}

function drawSpeciesChart() {
    chartCtx.clearRect(0, 0, chartCanvas.width, chartCanvas.height);

    if (speciesHistory.length < 2) return;

    const speciesIds = new Set();
    let maxCount = 1;

    for (const snapshot of speciesHistory) {
        for (const speciesId in snapshot) {
            speciesIds.add(speciesId);
            if (snapshot[speciesId] > maxCount) {
                maxCount = snapshot[speciesId];
            }
        }
    }

    for (const speciesId of speciesIds) {
        const color = speciesColors[speciesId] || "black";

        chartCtx.beginPath();
        chartCtx.strokeStyle = color;
        chartCtx.lineWidth = 2;

        for (let i = 0; i < speciesHistory.length; i++) {
            const snapshot = speciesHistory[i];
            const count = snapshot[speciesId] || 0;

            const x = (i / (speciesHistory.length - 1)) * chartCanvas.width;
            const y = chartCanvas.height - (count / maxCount) * chartCanvas.height;

            if (i === 0) {
                chartCtx.moveTo(x, y);
            } else {
                chartCtx.lineTo(x, y);
            }
        }

        chartCtx.stroke();
    }
}