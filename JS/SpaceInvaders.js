const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');

const startButton = document.getElementById('start-button');
const restartButton = document.getElementById('restart-button');
const gameOverScreen= document.getElementById('game-over-container');
const gameOverMessage = document.getElementById('game-over-message');

const keys = {};

let aliens = []; // Array to store alien invaders
let bullets = []; // Array to store bullets fired by the player
let asteroids = []; //array to store asteroid barrier objects

let playerLives = 3; 
let playerLasthitTime = 0;
let playerInvinsibleTime = 5000; //invulnerable for 5 seconds after being hit 

let score = 0; // Player's score

let lastShotTime = 0;   //tracks time since last shot for delay
let shootDelay = 250;   //250 ms between shots

let enemyDirection = 1; //positive for right, -1 for left
let enemyVerticalSpeed = 10;    
let enemyHorizontalSpeed = 1;
let enemyChanceToShoot = 0.0005;

canvas.backgroundColor = '#000000';

document.addEventListener('keydown', function (event) {
    keys[event.key] = true;
    if (event.key === 32 || event.key === ' ') {
        event.preventDefault(); //stopp page scrolling to bottom when you press space
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

    draw(ctx) {
        ctx.fillStyle = this.colour;
        ctx.fillRect(this.x, this.y, this.width, this.height);
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
        this._bullets = [];
    }

    shoot() {
        this._bullets.push(new Bullet((this.x + this.width / 2), this.y + 1, 5, 10, '#ff7800', 5));
    }

    draw(ctx) {
        super.draw(ctx);
        for (let i = 0; i < this.bullets.length; i++) {
            this._bullets[i].update();
            this._bullets[i].draw(ctx);
        }
    }

    get bullets() {
        return this._bullets;
    }

    removeBullet(index) {
        if (index >= 0 && index < this._bullets.length) {
            this._bullets.splice(index, 1);
        }
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
    ctx.clearRect(0, 0, canvas.width, canvas.height);   //clear canvas at the start of the frame

    keydown();  //get player input
 
    updateGameState();  //update game variables - game object positions

    drawGameElements(); //render game objects

    checkCollision();   //check for collisions 

    updateScoreDisplay();   //update score text
}

function checkCollision() {
    if (aliens.length === 0) {
        gameWon();
    }

    for (let i = aliens.length - 1; i >= 0; i--) {
        if (aliens[i] !== undefined) {
            for (var j = 0; j < bullets.length; j++) {
                if (aliens[i].collision(bullets[j])) {
                    aliens.splice(i, 1);
                    bullets.splice(j, 1);
                    score += 10;
                }
            }

            if (aliens[i].collision(player)) {
                aliens.splice(i, 1);
                killPlayer();
                score += 10;
            }

            for (let x = aliens[i].bullets.length - 1; x >= 0; x--) {
                if (aliens[i].bullets[x].collision(player)) {
                    aliens[j].removeBullet(x);
                    killPlayer();
                }
            }

            if (aliens[i].y > player.y + 50) {
                gameOver();
            }
        }
    }

    for (let i = asteroids.length - 1; i >= 0; i--) {
        for (let j = aliens.length - 1; j >= 0; j--) {
            if (aliens[j] !== undefined) {
                if (asteroids[i].collision(aliens[j])) {
                    asteroids[i].removeOnCollide(aliens[j]);
                }
                for (let x = aliens[j].bullets.length - 1; x >= 0; x--) {
                    if (asteroids[i].collision(aliens[j].bullets[x])) {
                        asteroids[i].removeOnCollide(aliens[j].bullets[x]);
                        aliens[j].removeBullet(x);
                    }
                }
            }
        }

        for (let j = bullets.length - 1; j >= 0; j--) {
            if (asteroids[i].collision(bullets[j])) {
                asteroids[i].removeOnCollide(bullets[j]);
                bullets.splice(j, 1);
            }
        }
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
                aliens[i].update(enemyDirection * enemyHorizontalSpeed, 0)
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
                aliens[i].update(enemyDirection * enemyHorizontalSpeed, 0)
            }
        }
    }

    if (aliens !== undefined) {
        for (let i = aliens.length-1; i >= 0; i--) {
            if (Math.random() < enemyChanceToShoot) {
                aliens[i].shoot();
            }
        }
    }

}

function drawGameElements() {
    ctx.fillStyle = canvas.backgroundColor;

    ctx.fillRect(0, 0, canvas.width, canvas.height);    //fill with black background colour

    player.draw(ctx);

    for (let i = 0; i < aliens.length; i++) {
        aliens[i].draw(ctx);
    }

    for (let i = 0; i < bullets.length; i++) {
        bullets[i].draw(ctx);
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

function killPlayer() {
    const currentTime = Date.now();
    if (currentTime - playerLasthitTime >= playerInvinsibleTime) {
        playerLives -= 1;
        if (playerLives < 0) {
            livesElement.textContent = `Lives: DEAD`;
            gameOver();
            return;
        }
        livesElement.textContent = `Lives: ${playerLives}`;
        playerLasthitTime = currentTime;
    }
}

function stop() {
    clearInterval(canvas.interval);
}

function restartlose() {
    score = 0;
    gameOverScreen.style.display = 'none';
    init(score);
}

function restartWin() {
    gameOverScreen.style.display = 'none';
    init(score);
}
function spawnShips() {
    aliens = [];
    for (let i = 0; i < 18; i++) {
        for (let j = 0; j < 5; j++) {
            aliens.push(new SpaceShip((i * 40) + 10, (j * 40) + 10, 30, 30, '#005e19', enemyDirection));
        }
    }
}

function spawnAsteroids() {
    asteroids = [];
    for (let i = 0; i < 8; i++) {
        asteroids.push(new Asteroid((i * 100) + 20, canvas.height - 130, 8, 5, '#e0e0e0', 8));
    }
}

function init(newScore) {
    ctx.clearRect(0, 0, canvas.width, canvas.height); 
    score = newScore;
    bullets = [];
    spawnShips();
    spawnAsteroids();
    canvas.interval = setInterval(update, 1000 / 60);    //set interval of 60 calls per second
}

// Start the game loop
function startGame() {
    init(score);
    startButton.style.display = 'none';
}

function gameOver() {
    stop();
    restartButton.addEventListener("click", restartlose);
    gameOverScreen.style.display = 'block';
    gameOverMessage.textContent = 'GAME OVER';
}

function gameWon() {
    stop();
    restartButton.addEventListener("click", restartWin);
    gameOverMessage.textContent = 'YOU WON!';
    gameOverScreen.style.display = 'block';
}

startButton.addEventListener("click", startGame);