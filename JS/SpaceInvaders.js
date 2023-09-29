const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

const keys = {};

let aliens = []; // Array to store alien invaders
let bullets = []; // Array to store bullets fired by the player
let asteroids = []; //array to store asteroid barrier objects

let score = 0; // Player's score
let gameOver = false; // Flag to track if the game is over
let lastShotTime = 0;
let shootDelay = 250;
let enemyDirection = 1;
let enemyVerticalSpeed = 5;
let enemyHorizontalSpeed = 1;

canvas.backgroundColor = '#000000';

document.addEventListener('keydown', function (event) {
    keys[event.key] = true;
    if (event.key === 32 || event.key === ' ') {
        event.preventDefault();
    }
});

document.addEventListener('keyup', function (event) {
    keys[event.key] = false;
});

class GameObject {  //base class used for spaceship and bullet 
    constructor(x, y, width, height, colour) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.colour = colour; 
    }

    draw(ctx1) {
        ctx1.fillStyle = this.colour;
        ctx1.fillRect(this.x, this.y, this.width, this.height);
    }

    update(dx, dy) {
        this.x += dx;
        this.y += dy;
    }

    collision(obj) {
        return (this.x < obj.x + obj.width
            && this.x + this.width > obj.x
            && this.y < obj.y + obj.height
            && this.y + this.height > obj.y);
    }
}

class Bullet extends GameObject {
    constructor(x, y, width, height, color, dy) {
        super(x, y, width, height, color);

        this.dy = dy;
    }

    update() {
        this.y += this.dy;
    }
}

class SpaceShip extends GameObject {
    constructor(x, y, width, height, color, dx) {
        super(x, y, width, height, color);
        this.dx = dx;
        this.bullets = [];
    }

    shoot() {
        this.bullets.push(new Bullet((this.x + this.width / 2), player.y + 1, 4, 8, '#ff7800', 5));
    }
}

class Asteroid {
    constructor(x, y, width, height, colour, numParts) {
        this.parts = [];

        for (let i = 0; i < numParts; i++) {
            for (let j = 0; j < numParts; j++) {
                this.parts.push(new GameObject(
                    x + i * width,
                    y + j * height,
                    width,
                    height,
                    colour
                ));
            }
        }
    }

    draw(ctx) {
        for (var i = 0; i < this.parts.length; i++) {
            this.parts[i].draw(ctx);
        }
    }

    collision(obj) {
        for (let i = 0; i < this.parts.length; i++) {
            if (obj !== undefined && this.parts[i].collision(obj)) {
                return true;
            }
        }
        return false;
    }

    removeOnCollide(obj) {
        for (var i = 0; i < this.parts.length; i++) {
            if (this.parts[i].collision(obj)) {
                this.parts.splice(i, 1);
                break;
            }
        }
    }
}

let player = new GameObject(canvas.width / 2, canvas.height - 60, 40, 40, '#FF0000');

function update() {
    if (!gameOver) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);   //clear canvas at the start of the frame

        keydown();  //get player input
 
        updateGameState();  //update game variables - game object positions

        drawGameElements(); //render game objects

        checkCollision();   //check for collisions 

        updateScoreDisplay();   //update score text
    } else {
        // Display game over message or handle game over logic
        // (e.g., show a "Game Over" message, allow the player to restart)
        restart();
    }
}

function checkCollision() {
    for (let i = aliens.length -1; i >= 0; i--) {
        for (var j = 0; j < bullets.length; j++) {
            if (aliens[i] !== undefined && aliens[i].collision(bullets[j])) {
                aliens.splice(i, 1);
                bullets.splice(j, 1);
                score += 10;
            }
        }
    }

    for (let i = asteroids.length - 1; i >= 0; i--) {
        for (let j = aliens.length; j >= 0; j--) {
            if (aliens[j] !== undefined) {
                asteroids[i].collision(aliens[j]);
                for (let x = aliens[j].bullets; x >= 0; x--) {
                    asteroids[i].collision(aliens[j].bullets[x]);
                }
            }
        }

        for (let j = bullets.length; j >= 0; j--) {
            if (asteroids[i].collision(bullets[j])) {
                asteroids[i].removeOnCollide(bullets[j]);
                bullets.splice(j, 1);
            }
        }
    }
}

function spawnShips() {
    for (let i = 0; i < 18; i++) {
        for (let j = 0; j < 5; j++) {
            aliens.push(new SpaceShip((i * 40) + 10, (j * 40) + 10, 30, 30, '#005e19', enemyDirection));
        }
    }
}

function spawnAsteroids() {
    for (let i = 0; i < 8; i++) {
        asteroids.push(new Asteroid((i * 100) + 20, canvas.height - 130, 5, 5, '#e0e0e0', 12));       
    }
}

function updateScoreDisplay() {
    scoreElement.textContent = `Score : ${score}`;
}

function updateGameState() {
    for (let i = 0; i < bullets.length; i++) {
        bullets[i].update();
    }

    if (enemyDirection === 1) {   //if ships are moving right
        if (aliens.length !== 0) {
            let closestToRightSideEnemy = aliens[0];
            for (let i = 0; i < aliens.length; i++) {
                if (aliens[i].x > closestToRightSideEnemy.x) {
                    closestToRightSideEnemy = aliens[i];
                }
            }

            if (closestToRightSideEnemy.x + closestToRightSideEnemy.width > canvas.width) {
                enemyDirection = -1;
                for (let i = 0; i < aliens.length; i++) {
                    aliens[i].update(0, enemyVerticalSpeed)
                }
            }

            for (let i = 0; i < aliens.length; i++) {
                aliens[i].update(enemyDirection, 0)
            }
        }
    }

    if (enemyDirection === -1) {   //if ships are moving left
        if (aliens.length !== 0) {
            let closestToLeftSideEnemy = aliens[0];
            for (let i = 0; i < aliens.length; i++) {
                if (aliens[i].x < closestToLeftSideEnemy.x) {
                    closestToLeftSideEnemy = aliens[i];
                }
            }

            if (closestToLeftSideEnemy.x <= 0) {
                enemyDirection = 1;
                for (let i = 0; i < aliens.length; i++) {
                    aliens[i].update(0, enemyVerticalSpeed)
                }
            }

            for (let i = 0; i < aliens.length; i++) {
                aliens[i].update(enemyDirection, 0)
            }
        }
    }
}

function drawGameElements() {
    ctx.fillStyle = canvas.backgroundColor;

    ctx.fillRect(0, 0, canvas.width, canvas.height);    //fill with black background colour

    player.draw(ctx);

    for (let i = 0; i < bullets.length; i++) {
        bullets[i].draw(ctx);
    }

    for (let i = 0; i < aliens.length; i++) {
        aliens[i].draw(ctx);
    }

    for (let i = 0; i < asteroids.length; i++) {
        asteroids[i].draw(ctx);
    }
}

function keydown() {
    const currentTime = Date.now();

    if (keys['a']) {
        if (player.x > 0) {
            player.update(-5, 0);
        }
    } else if (keys['d']) {
        if (player.x + player.width < canvas.width) {
            player.update(5, 0);
        }
    }

    if (keys[' '] && currentTime - lastShotTime >= shootDelay) {
        bullets.push(new Bullet((player.x + player.width / 2), player.y + 1, 7, 10, '#FFFFFF', -5));

        lastShotTime = currentTime;
    }
}

function stop() {
    clearInterval(canvas.interval);
}

function restart() {
    stop();
    init(score);
}

function init(newScore) {
    score = newScore;
    spawnShips();
    spawnAsteroids();
    canvas.interval = setInterval(update, 1000 / 60);    //set interval of 60 calls per second
}

// Start the game loop
init(score);