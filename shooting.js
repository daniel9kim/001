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
        this.speed = 5;
        this.bullets = [];
    }

    draw() {
        context.drawImage(this.image, this.x, this.y, this.width, this.height);
    }

    move(direction) {
        switch (direction) {
            case 'left':
                if (this.x > 0) this.x -= this.speed;
                break;
            case 'right':
                if (this.x + this.width < canvas.width) this.x += this.speed;
                break;
            case 'up':
                if (this.y > 0) this.y -= this.speed;
                break;
            case 'down':
                if (this.y + this.height < canvas.height) this.y += this.speed;
                break;
        }
    }

    shoot() {
        const bullet = new Bullet(this.x + this.width / 2, this.y, 5, 10, 'red');
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
            player.move('left');
            break;
        case 'ArrowRight':
            player.move('right');
            break;
        case 'ArrowUp':
            player.move('up');
            break;
        case 'ArrowDown':
            player.move('down');
            break;
        case ' ':
            player.shoot();
            break;
    }
});

// Mobile touch controls
canvas.addEventListener('touchstart', (event) => {
    const touchX = event.touches[0].clientX;
    const touchY = event.touches[0].clientY;

    if (touchY < player.y) {
        player.shoot();
    } else if (touchX < player.x) {
        player.move('left');
    } else if (touchX > player.x + player.width) {
        player.move('right');
    }
});

gameLoop();
