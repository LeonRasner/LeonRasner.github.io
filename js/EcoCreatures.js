//Creature Class with general atributes
class Creature {
    constructor(color, posX, posY, speed, directionBehavior, agression, speciesId) {
        this.color = color;
        this.posX = posX;
        this.posY = posY;
        this.speed = speed;
        this.direction = { x: 0, y: 0 };
        this.directionBehavior = directionBehavior;
        this.currentGrid = getGridCoordinates(posX, posY, gridSize);
        this.neighbours = [];
        this.agression = agression;
        this.speciesId = speciesId;
        this.isDead = false;
        this.multiplyChance = 0;
    }

    update() {
        if (this.isDead) return;

        this.getNearbyEnteties();
        this.interact();
        if (this.isDead) return;

        this.updateDirection();
        if (this.isDead) return;

        this.move();
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.posX, this.posY, 5, 0, 2 * Math.PI);
        ctx.fillStyle = this.color;
        ctx.fill();
    }

    getNearbyEnteties() {
        this.neighbours = [];

        const scanRadius = 1;

        if (!grid || !this.currentGrid) return;

        const startX = this.currentGrid.x - scanRadius;
        const endX = this.currentGrid.x + scanRadius;
        const startY = this.currentGrid.y - scanRadius;
        const endY = this.currentGrid.y + scanRadius;

        for (let x = startX; x <= endX; x++) {
            if (!grid[x]) continue;

            for (let y = startY; y <= endY; y++) {
                if (!grid[x][y]) continue;

                for (const el of grid[x][y]) {
                    if (!el.isDead && el !== this) {
                        this.neighbours.push(el);
                    }
                }
            }
        }
    }


    //Set random new direction (directionBehavior*100)% of time
    updateDirection() {
        // Check for walls
        if (this.posX >= canvas.width - 1) {
            this.direction = { x: -1, y: 0 };
        } else if (this.posX <= 1) {
            this.direction = { x: 1, y: 0 };
        } else if (this.posY >= canvas.height - 1) {
            this.direction = { x: 0, y: -1 };
        } else if (this.posY <= 1) {
            this.direction = { x: 0, y: 1 };
        }
        //self destruct if outside canvas (for click spawn)
        if (this.posX > canvas.width + 10 || this.posX < -10 ||this.posY > canvas.height + 10 || this.posY < -10 ) {
            removeEntity(this);
            return;
        }
    };

    //Move Creature based on speed & direction
    move() {
        this.posX += this.speed * this.direction.x;
        this.posY += this.speed * this.direction.y;
        this.posX = Math.round(this.posX);
        this.posY = Math.round(this.posY);
    }

    //Update grid Position
    gridPos() {
        if (this.isDead) return;
        // Remove this creature from its previous grid position
        const prevGrid = this.currentGrid;
        if (grid[prevGrid.x] && grid[prevGrid.x][prevGrid.y]) {
            const index = grid[prevGrid.x][prevGrid.y].indexOf(this);
            if (index !== -1) {
                grid[prevGrid.x][prevGrid.y].splice(index, 1);
            }
        }
        // Update creature's grid position
        const { x, y } = getGridCoordinates(this.posX, this.posY, gridSize);
        if (!grid[x]) grid[x] = {};
        if (!grid[x][y]) grid[x][y] = [];
        grid[x][y].push(this);
        this.currentGrid.x = x;
        this.currentGrid.y = y;
    }

    interact() {
        if (this.neighbours[0]) {
            this.neighbours.forEach(entity => {
                if (entity != this && !entity.isDead) {
                    //This is agressor
                    if (entity.speciesId != this.speciesId && entity.agression < this.agression) {
                        //Move towards prey
                        const dx = entity.posX - this.posX;
                        const dy = entity.posY - this.posY;
                        const length = Math.hypot(dx, dy);
                        this.direction = length === 0
                        ? { x: 0, y: 0 }
                        : { x: dx / length, y: dy / length };

                        //Kill
                        if (Math.abs(entity.posX - this.posX) <= 5 && Math.abs(entity.posY - this.posY) <= 5) {
                            misc.push(new Marker(entity.posX, entity.posY, "💀"));
                            removeEntity(entity);
                            this.multiplyChance++;
                        }
                    }
                    //Entity is agressor
                    else if (entity.speciesId != this.speciesId && entity.agression > this.agression) {
                        //Flee
                        const dx = this.posX - entity.posX;
                        const dy = this.posY - entity.posY;
                        const length = Math.hypot(dx, dy);
                        this.direction = length === 0
                            ? { x: 0, y: 0 }
                            : { x: dx / length, y: dy / length };
                    }
                    //Set Random direction
                    else if (Math.random() < this.directionBehavior) {
                        const angle = Math.random() * 2 * Math.PI;
                        const directions = [
                            { x: 1, y: 0 },
                            { x: -1, y: 0 },
                            { x: 0, y: 1 },
                            { x: 0, y: -1 },
                        ];
                        this.direction = directions[Math.floor(Math.random() * directions.length)];
                    };
                }
            })
        } else {
            //Set Random direction
            if (Math.random() < this.directionBehavior) {
                const angle = Math.random() * 2 * Math.PI;
                const directions = [
                    { x: 1, y: 0 },
                    { x: -1, y: 0 },
                    { x: 0, y: 1 },
                    { x: 0, y: -1 },
                ];
                this.direction = directions[Math.floor(Math.random() * directions.length)];
            };
        }

        //Multiply
        if (this.multiplyChance > 2 && this.multiplyChance > Math.random() * 5) {
            this.multiplyChance = 0;
            const offsetX = Math.random() * 20 - 10;
            const offsetY = Math.random() * 20 - 10;

            const offspring = new this.constructor(
                this.posX + offsetX,
                this.posY + offsetY
            );

            entities.push(offspring);
            misc.push(new Marker(this.posX, this.posY, "❤️"));
        }

    }
}

function removeEntity(entity) {
    entity.isDead = true;
}

function purgeDeadEntities() {
    entities = entities.filter(entity => !entity.isDead);
}

//Dynamically Create Species
function createSpecies(name, color, speed, directionBehavior, agression, species) {
    const Species = class extends Creature {
        constructor(posX, posY) {
            super(color, posX, posY, speed, directionBehavior, agression, species);
        }
    };

    Species.displayName = name;
    Species.displayColor = color;
    Species.displaySpeed = speed;
    Species.displayAgression = agression;
    Species.displayRandomness = directionBehavior;
    return Species;
}


class Marker {
    constructor(x, y, character) {
        this.posX = x;
        this.posY = y;

        this.maxDespawnCounter = 60;
        this.despawnCounter = 60;

        this.character = character;
        this.fontSize = 15;
    }

    draw() {
        if (this.despawnCounter <= 0) {
            const index = misc.indexOf(this);
            if (index > -1) {
                misc.splice(index, 1);
            }
            return;
        }

        const alpha = this.despawnCounter / this.maxDespawnCounter;

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.font = `${this.fontSize}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(this.character, this.posX, this.posY);
        ctx.restore();

        this.despawnCounter--;
    }
}