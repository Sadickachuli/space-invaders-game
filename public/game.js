const canvas = document.getElementById('gameBoard');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const gameOverElement = document.getElementById('gameOver');

// Game objects
const player = {
    x: canvas.width / 2 - 25,
    y: canvas.height - 50,
    width: 50,
    height: 20,
    speed: 7,
    isAlive: true
};

let aliens = [];
let bullets = [];
let alienBullets = [];
let score = 0;
let lives = 3;
let rightPressed = false;
let leftPressed = false;

// Create aliens
function createAliens() {
    for(let row = 0; row < 4; row++) {
        for(let col = 0; col < 8; col++) {
            aliens.push({
                x: 80 + col * 60,
                y: 50 + row * 40,
                width: 40,
                height: 25,
                isAlive: true
            });
        }
    }
}

// Player movement
function movePlayer() {
    if(rightPressed && player.x < canvas.width - player.width) {
        player.x += player.speed;
    } else if(leftPressed && player.x > 0) {
        player.x -= player.speed;
    }
}

// Shooting
function shoot() {
    bullets.push({
        x: player.x + player.width/2 - 2.5,
        y: player.y,
        width: 5,
        height: 10,
        speed: 7
    });
}

// Alien shooting
function alienShoot(alien) {
    alienBullets.push({
        x: alien.x + alien.width/2 - 2.5,
        y: alien.y + alien.height,
        width: 5,
        height: 10,
        speed: 3
    });
}

// Collision detection
function collisionDetection(obj1, obj2) {
    return obj1.x < obj2.x + obj2.width &&
           obj1.x + obj1.width > obj2.x &&
           obj1.y < obj2.y + obj2.height &&
           obj1.y + obj1.height > obj2.y;
}

// Game loop
function update() {
    movePlayer();

    // Move bullets
    bullets = bullets.filter(bullet => {
        bullet.y -= bullet.speed;
        return bullet.y > 0;
    });

    // Move alien bullets
    alienBullets = alienBullets.filter(bullet => {
        bullet.y += bullet.speed;
        return bullet.y < canvas.height;
    });

    // Check bullet collisions
    bullets.forEach((bullet, bulletIndex) => {
        aliens.forEach((alien, alienIndex) => {
            if(alien.isAlive && collisionDetection(bullet, alien)) {
                aliens[alienIndex].isAlive = false;
                bullets.splice(bulletIndex, 1);
                score += 10;
                scoreElement.textContent = `Score: ${score}`;
            }
        });
    });

    // Check alien bullet collisions with player
    alienBullets.forEach(bullet => {
        if(collisionDetection(bullet, player) && player.isAlive) {
            lives--;
            if(lives <= 0) {
                gameOver();
            }
        }
    });

    // Alien movement
    const aliveAliens = aliens.filter(alien => alien.isAlive);
    if(aliveAliens.length === 0) {
        gameOver(true);
    }

    // Random alien shooting
    if(Math.random() < 0.01 && aliveAliens.length > 0) {
        const shooter = aliveAliens[Math.floor(Math.random() * aliveAliens.length)];
        alienShoot(shooter);
    }
}

function draw() {
    // Clear canvas
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw player
    if(player.isAlive) {
        ctx.fillStyle = 'blue';
        ctx.beginPath();
        ctx.moveTo(player.x, player.y);
        ctx.lineTo(player.x + player.width, player.y);
        ctx.lineTo(player.x + player.width/2, player.y - 20);
        ctx.closePath();
        ctx.fill();
    }

    // Draw aliens
    aliens.forEach(alien => {
        if(alien.isAlive) {
            ctx.fillStyle = 'green';
            ctx.fillRect(alien.x, alien.y, alien.width, alien.height);
        }
    });

    // Draw bullets
    ctx.fillStyle = 'white';
    bullets.forEach(bullet => {
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });

    // Draw alien bullets
    ctx.fillStyle = 'red';
    alienBullets.forEach(bullet => {
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });
}

function gameLoop() {
    if(player.isAlive) {
        update();
        draw();
        requestAnimationFrame(gameLoop);
    }
}

function gameOver(win = false) {
    player.isAlive = false;
    gameOverElement.style.display = 'block';
    gameOverElement.textContent = win ? 'You Win!\n' : 'Game Over!\n';
    gameOverElement.innerHTML += '<button onclick="resetGame()">Play Again</button>';
}

function resetGame() {
    player.x = canvas.width / 2 - 25;
    player.isAlive = true;
    aliens = [];
    bullets = [];
    alienBullets = [];
    score = 0;
    lives = 3;
    scoreElement.textContent = `Score: ${score}`;
    gameOverElement.style.display = 'none';
    createAliens();
    gameLoop();
}

// Event listeners
document.addEventListener('keydown', (e) => {
    if(e.key === 'ArrowRight') rightPressed = true;
    if(e.key === 'ArrowLeft') leftPressed = true;
    if(e.key === ' ') shoot();
});

document.addEventListener('keyup', (e) => {
    if(e.key === 'ArrowRight') rightPressed = false;
    if(e.key === 'ArrowLeft') leftPressed = false;
});

// Prevent spacebar from scrolling
window.addEventListener('keydown', (e) => {
    if(e.key === ' ' && e.target == document.body) {
        e.preventDefault();
    }
});

// Start game
createAliens();
gameLoop();