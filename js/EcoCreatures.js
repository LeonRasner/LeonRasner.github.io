//Creature Class with general atributes
class Creature {
    constructor(color, posX, posY, speed, directionBehavior, agression) {
        this.color = color;
        this.posX = posX;
        this.posY = posY;
        this.speed = speed;
        this.direction = { x: 0, y: 0 };
        this.directionBehavior = directionBehavior;
        this.currentGrid = getGridCoordinates(posX, posY, gridSize);
        this.neighbours = [];
        this.agression = agression;
    }
    update() {
        this.getNearbyEnteties();
        this.interact();
        this.updateDirection();
        this.move();
        this.gridPos();
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.posX, this.posY, 5, 0, 2 * Math.PI);
        ctx.fillStyle = this.color;
        ctx.fill();
    }

    getNearbyEnteties() {
        this.neighbours = [];
        if (grid && grid[this.currentGrid.x] && grid[this.currentGrid.x][this.currentGrid.y]) {
            grid[this.currentGrid.x][this.currentGrid.y].forEach(el => {
                this.neighbours.push(el);
            });
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
            const index = entities.indexOf(this);
            if (index !== -1) {
                entities.splice(index, 1);
            }
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
        if (this.neighbours[1]) {
            this.neighbours.forEach(entity => {
                if (entity != this) {
                    //This is agressor
                    if (entity.agression < this.agression) {
                        if (Math.random < 0.90) {
                            this.direction = entity.direction;
                        }
                        //Kill
                        if (Math.abs(entity.posX - this.posX) < 4 && Math.abs(entity.posY - this.posY) < 4) {
                            const index = entities.indexOf(entity);
                            if (index !== -1) {
                                misc.push(new DeathMarker(entity.posX, entity.posY, entity.color))
                                entities.splice(index, 1);
                            }
                        }
                    }
                    //Entity is agressor
                    else if (entity.agression > this.agression) {
                        if (Math.random < 0.99) {
                            this.direction.x = entity.direction.x * -1;
                            this.direction.y = entity.direction.y * -1;
                        }

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

    }
}

//Dynamically Create Species
function createSpecies(name, color, speed, directionBehavior, agression) {
    const Species = class extends Creature {
        constructor(posX, posY) {
            super(color, posX, posY, speed, directionBehavior, agression);
        }
    };

    Species.displayName = name;
    Species.displayColor = color;
    Species.displaySpeed = speed;
    Species.displayAgression = agression;
    Species.displayRandomness = directionBehavior;
    return Species;
}

class DeathMarker {
    constructor(posX, posY, color) {
        this.posX = posX;
        this.posY = posY;
        this.color = color;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.posX, this.posY, 8, 0, 2 * Math.PI);
        ctx.strokeStyle  = "#990000";
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}