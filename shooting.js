const canvas = document.getElementById('gameCanvas');
const context = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

class Player {
    constructor(x, y, width, height, imageSrc) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.image = new Image();
        this.image.src = imageSrc;
        this.speed = 10; // Increased speed for mobile control
        this.bullets = [];
        this.direction = {
            left: false,
            right: false,
            up: false,
            down: false
        };
    }

    draw() {
        context.drawImage(this.image, this.x, this.y, this.width, this.height);
    }

    update() {
        if (this.direction.left && this.x > 0) this.x -= this.speed;
        if (this.direction.right && this.x + this.width < canvas.width) this.x += this.speed;
        if (this.direction.up && this.y > 0) this.y -= this.speed;
        if (this.direction.down && this.y + this.height < canvas.height) this.y += this.speed;
    }

    shoot() {
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

function gameLoop() {
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
            // End game logic here
            console.log('Game Over');
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
        case ' ':
            player.shoot();
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

    // Increase the speed of the player's movement on mobile
    player.x += (touchX - (player.x + player.width / 2)) * 0.1;
    player.y += (touchY - (player.y + player.height / 2)) * 0.1;
});

gameLoop();
