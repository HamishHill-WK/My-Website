const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

const keys = {};

let aliens = []; // Array to store alien invaders
let bullets = []; // Array to store bullets fired by the player

let score = 0; // Player's score
let gameOver = false; // Flag to track if the game is over
let lastShotTime = 0;

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

class GameObject {
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

let player = new GameObject(canvas.width / 2, canvas.height - 60, 40, 40, '#FF0000');

function update() {
    // Update game state
    if (!gameOver) {
        // Clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        keydown();
 
        updateGameState();

        // Draw game elements
        drawGameElements();

        // Update the score display
        updateScoreDisplay();
    } else {
        // Display game over message or handle game over logic
        // (e.g., show a "Game Over" message, allow the player to restart)
    }
}

function updateScoreDisplay() {
    scoreElement.textContent = `Score : ${score}`;
}

function updateGameState() {
    for (let i = 0; i < bullets.length; i++) {
        bullets[i].update();
    }
}

function drawGameElements() {
    ctx.fillStyle = canvas.backgroundColor;

    ctx.fillRect(0, 0, canvas.width, canvas.height);    //fill with black background colour

    player.draw(ctx);

    for (let i = 0; i < bullets.length; i++) {
        bullets[i].draw(ctx);
    }
}

function init() {
    canvas.interval = setInterval(update, 1000/ 60);    //set interval of 60 calls per second
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

    if (keys[' '] && currentTime - lastShotTime >= 500) {
        bullets.push(new Bullet((player.x + player.width / 2), player.y + 1, 5, 10, '#FFFFFF', -5));

        lastShotTime = currentTime;
    }
}

function stop() {
    clearInterval(canvas.interval);
}

function restart() {
    stop();
    init();
}

// Start the game loop
init();