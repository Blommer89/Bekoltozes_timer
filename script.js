// --- VISSZASZÁMLÁLÓ ---
const targetDate = new Date("May 4, 2026 08:00:00").getTime();
function updateTimer() {
    const now = new Date().getTime();
    const diff = targetDate - now;
    if (diff < 0) {
        document.getElementById("timer").innerHTML = "Itt az idő! 🏠🐶";
        return;
    }
    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);
    document.getElementById("timer").innerHTML = `${d}n ${h}ó ${m}p ${s}mp`;
}
setInterval(updateTimer, 1000);
updateTimer();

// --- JÁTÉK ---
const canvas = document.getElementById('mazeCanvas');
const ctx = canvas.getContext('2d');
const gridSize = 12;
const cellSize = canvas.width / gridSize;

let player = { x: 0, y: 0 };
let goal = { x: gridSize - 1, y: gridSize - 1 };
let obstacles = [];

function generateGame() {
    player = { x: 0, y: 0 }; 
    obstacles = [];
    for (let i = 0; i < 8; i++) {
        obstacles.push({
            x: Math.floor(Math.random() * (gridSize - 2)) + 1,
            y: Math.floor(Math.random() * (gridSize - 2)) + 1,
            type: Math.random() < 0.5 ? "🚗" : "🚶",
            dx: Math.random() < 0.5 ? 1 : -1,
            dy: Math.random() < 0.5 ? 1 : -1
        });
    }
    draw();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Cél és Játékos
    ctx.font = `${cellSize*0.8}px serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🏠", goal.x * cellSize + cellSize/2, goal.y * cellSize + cellSize/2);
    ctx.fillText("🐶", player.x * cellSize + cellSize/2, player.y * cellSize + cellSize/2);
    // Akadályok
    for (let o of obstacles) {
        ctx.fillText(o.type, o.x * cellSize + cellSize/2, o.y * cellSize + cellSize/2);
    }
}

function moveObstacles() {
    for (let o of obstacles) {
        o.x += o.dx; o.y += o.dy;
        if (o.x < 1 || o.x >= gridSize - 1) o.dx *= -1;
        if (o.y < 1 || o.y >= gridSize - 1) o.dy *= -1;
        if (player.x === o.x && player.y === o.y) {
            alert("Vigyázz! Próbáld újra!");
            player = { x: 0, y: 0 };
        }
    }
    draw();
}
setInterval(moveObstacles, 600);

// --- ÉRINTÉS VEZÉRLÉS (SWIPE) ---
let touchStartX = 0;
let touchStartY = 0;

canvas.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
}, false);

canvas.addEventListener('touchend', e => {
    let x = e.changedTouches[0].screenX;
    let y = e.changedTouches[0].screenY;
    handleSwipe(x, y);
}, false);

function handleSwipe(endX, endY) {
    let dx = endX - touchStartX;
    let dy = endY - touchStartY;
    let newX = player.x;
    let newY = player.y;

    if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 30) newX++; else if (dx < -30) newX--;
    } else {
        if (dy > 30) newY++; else if (dy < -30) newY--;
    }

    if (newX >= 0 && newX < gridSize && newY >= 0 && newY < gridSize) {
        player.x = newX; player.y = newY;
    }
    if (player.x === goal.x && player.y === goal.y) {
        alert("Hazaértél! 🐾");
        generateGame();
    }
    draw();
}

document.getElementById('reset-btn').onclick = generateGame;
generateGame();
