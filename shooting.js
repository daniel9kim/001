const canvas = document.getElementById('gameCanvas');
const context = canvas.getContext('2d');
const gameOverScreen = document.getElementById('gameOverScreen');
const finalScoreElement = document.getElementById('finalScore');
const finalMessageElement = document.getElementById('finalMessage');
const restartButton = document.getElementById('restartButton');
const backgroundMusic = document.getElementById('backgroundMusic');
const shootSound = document.getElementById('shootSound');
const explosionSound = document.getElementById('explosionSound');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let score = 0;
let gameOver = false;

class Player {
    constructor(x, y, width, height, imageSrc) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.image = new Image();
        this.image.src = imageSrc;
        this.speed = 5;
        this.bullets = [];
        this.direction = {
            left: false,
            right: false,
            up: false,
            down: false
        };
        this.targetX = this.x;
        this.targetY = this.y;
        this.shootInterval = setInterval(() => this.shoot(), 500); // Shoot every 500ms
    }

    draw() {
        context.drawImage(this.image, this.x, this.y, this.width, this.height);
    }

    update() {
        if (this.direction.left && this.x > 0) this.x -= this.speed;
        if (this.direction.right && this.x + this.width < canvas.width) this.x += this.speed;
        if (this.direction.up && this.y > 0) this.y -= this.speed;
        if (this.direction.down && this.y + this.height < canvas.height) this.y += this.speed;

        // Smoothly move towards target position on mobile
        const deltaX = this.targetX - this.x;
        const deltaY = this.targetY - this.y;
        this.x += deltaX * 0.05; // Adjust the multiplier to control the speed
        this.y += deltaY * 0.05; // Adjust the multiplier to control the speed
    }

    shoot() {
        shootSound.currentTime = 0;  // Restart the shoot sound
        shootSound.play();
        const bullet = new Bullet(this.x + this.width / 2 - 2.5, this.y, 5, 10, 'red');
        this.bullets.push(bullet);
    }
}

class Bullet {
    constructor(x, y, width, height, color) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.speed = 7;
    }

    draw() {
        context.fillStyle = this.color;
        context.fillRect(this.x, this.y, this.width, this.height);
    }

    update() {
        this.y -= this.speed;
    }
}

class Enemy {
    constructor(x, y, width, height, imageSrc) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.image = new Image();
        this.image.src = imageSrc;
        this.speed = 3;
    }

    draw() {
        context.drawImage(this.image, this.x, this.y, this.width, this.height);
    }

    update() {
        this.y += this.speed;
    }
}

const player = new Player(canvas.width / 2 - 25, canvas.height - 60, 50, 50, 'player.png');
const enemies = [];
let spawnInterval = 2000;

function spawnEnemy() {
    const enemy = new Enemy(Math.random() * (canvas.width - 50), 0, 50, 50, 'enemy.png');
    enemies.push(enemy);
}

setInterval(spawnEnemy, spawnInterval);

function detectCollision(rect1, rect2) {
    return !(rect1.x > rect2.x + rect2.width ||
             rect1.x + rect1.width < rect2.x ||
             rect1.y > rect2.y + rect2.height ||
             rect1.y + rect1.height < rect2.y);
}

function endGame() {
    gameOver = true;
    clearInterval(player.shootInterval);
    backgroundMusic.pause();
    explosionSound.play();
    finalScoreElement.textContent = `Final Score: ${score}`;
    let message = '';
    if (score < 10) {
        message = 'Better luck next time!';
    } else if (score < 20) {
        message = 'Good job!';
    } else {
        message = 'Excellent!';
    }
    finalMessageElement.textContent = message;
    gameOverScreen.classList.remove('hidden');
}

function gameLoop() {
    if (gameOver) return;

    context.clearRect(0, 0, canvas.width, canvas.height);

    player.update();
    player.draw();
    player.bullets.forEach((bullet, bulletIndex) => {
        bullet.update();
        bullet.draw();

        // Remove bullets that are off-screen
        if (bullet.y + bullet.height < 0) {
            player.bullets.splice(bulletIndex, 1);
        }

        // Check collision with enemies
        enemies.forEach((enemy, enemyIndex) => {
            if (detectCollision(bullet, enemy)) {
                player.bullets.splice(bulletIndex, 1);
                enemies.splice(enemyIndex, 1);
                score += 1;
            }
        });
    });

    enemies.forEach((enemy, enemyIndex) => {
        enemy.update();
        enemy.draw();

        // Remove enemies that are off-screen
        if (enemy.y > canvas.height) {
            enemies.splice(enemyIndex, 1);
        }

        // Check collision with player
        if (detectCollision(enemy, player)) {
            endGame();
        }
    });

    requestAnimationFrame(gameLoop);
}

window.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'ArrowLeft':
            player.direction.left = true;
            break;
        case 'ArrowRight':
            player.direction.right = true;
            break;
        case 'ArrowUp':
            player.direction.up = true;
            break;
        case 'ArrowDown':
            player.direction.down = true;
            break;
    }
});

window.addEventListener('keyup', (event) => {
    switch (event.key) {
        case 'ArrowLeft':
            player.direction.left = false;
            break;
        case 'ArrowRight':
            player.direction.right = false;
            break;
        case 'ArrowUp':
            player.direction.up = false;
            break;
        case 'ArrowDown':
            player.direction.down = false;
            break;
    }
});

// Mobile touch controls
canvas.addEventListener('touchstart', (event) => {
    const touchX = event.touches[0].clientX;
    const touchY = event.touches[0].clientY;

    if (touchY < player.y) {
        player.shoot();
    }
});

canvas.addEventListener('touchmove', (event) => {
    const touchX = event.touches[0].clientX;
    const touchY = event.touches[0].clientY;

    // Set the target position for smooth movement
    player.targetX = touchX - player.width / 2;
    player.targetY = touchY - player.height / 2;
});

restartButton.addEventListener('click', () => {
    location.reload();
});

// Start background music
backgroundMusic.play();

gameLoop();
