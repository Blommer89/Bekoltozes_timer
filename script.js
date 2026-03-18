// --- VISSZASZÁMLÁLÓ (Marad a régi) ---
const targetDate = new Date("May 4, 2026 08:00:00").getTime();
function updateTimer() {
    const now = new Date().getTime();
    const diff = targetDate - now;
    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);
    document.getElementById("timer").innerHTML = diff < 0 ? "Hazaértünk! 🏠" : `${d}n ${h}ó ${m}p ${s}mp`;
}
setInterval(updateTimer, 1000);
updateTimer();

// --- KALANDJÁTÉK ---
const canvas = document.getElementById('mazeCanvas');
const ctx = canvas.getContext('2d');

let progress = 0; 
let lastTouchX = 0;
let completedStops = [];
let gameReady = false; // Új változó: kész-e a játék a rajzolásra?

// --- ÚJ RÉSZ: A KISKUTYA KÉP BETÖLTÉSE ---
const puppyImg = new Image();
puppyImg.src = 'puppy.png'; // A feltöltött PNG fájl neve

// Megvárjuk, amíg a kép betöltődik
puppyImg.onload = function() {
    gameReady = true;
    draw(); // Csak akkor rajzolunk először, ha a kép megvan
};

const roadPoints = [
    { x: 30, y: 250 },  // Start
    { x: 130, y: 250 }, // 1. kanyar (STOP 1)
    { x: 130, y: 150 }, // 2. kanyar (STOP 2)
    { x: 230, y: 150 }, // 3. kanyar (STOP 3)
    { x: 230, y: 50 },  // 4. kanyar
    { x: 270, y: 50 }   // Cél
];

const stops = [
    { pos: 20, q: "Hány szobás lesz az új ház?", a: "3", x: roadPoints[1].x, y: roadPoints[1].y, icon: "🚪" },
    { pos: 50, q: "Milyen színű a kerítés? (szürke/barna/zöld)", a: "szürke", x: roadPoints[2].x, y: roadPoints[2].y, icon: "🚧" },
    { pos: 80, q: "Mi a kutyus kedvenc játéka?", a: "labda", x: roadPoints[3].x, y: roadPoints[3].y, icon: "🎾" }
];

function draw() {
    if (!gameReady) return; // Ha nincs kész a kép, nem rajzolunk semmit

    // 1. Zöld fű (Alap)
    ctx.fillStyle = "#2d5a27";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Barna földút rajzolása
    ctx.beginPath();
    ctx.strokeStyle = "#8B4513";
    ctx.lineWidth = 25;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.moveTo(roadPoints[0].x, roadPoints[0].y);
    for(let i=1; i<roadPoints.length; i++) {
        ctx.lineTo(roadPoints[i].x, roadPoints[i].y);
    }
    ctx.stroke();

    // Díszítés
    ctx.font = "20px Arial";
    ctx.fillText("🏠", 50, 210); ctx.fillText("🏡", 70, 280); ctx.fillText("🌳", 90, 200);
    ctx.fillText("🏘️", 160, 100); ctx.fillText("🌳", 180, 180); ctx.fillText("🚶", 100, 130);
    ctx.fillText("🏡", 250, 120); ctx.fillText("🌸", 210, 30); ctx.fillText("🌲", 250, 200);

    // Cél: Ház és Csont
    ctx.font = "30px Arial";
    ctx.fillText("🏠", roadPoints[5].x - 10, roadPoints[5].y - 10);
    ctx.fillText("🦴", roadPoints[5].x + 10, roadPoints[5].y + 25);

    // 3. Hidak/STOP jelek
    stops.forEach(s => {
        ctx.fillStyle = completedStops.includes(s.pos) ? "#A0522D" : "#555";
        ctx.fillRect(s.x - 15, s.y - 15, 30, 30); 
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
        ctx.strokeRect(s.x - 15, s.y - 15, 30, 30);
        if (!completedStops.includes(s.pos)) {
            ctx.fillStyle = "white";
            ctx.font = "10px Arial";
            ctx.fillText("STOP", s.x - 13, s.y + 4);
        }
    });

    // 4. Kutyus pozíciójának kiszámítása
    let px, py;
    let point1, point2;
    let ratio;

    if (progress <= 20) { point1 = roadPoints[0]; point2 = roadPoints[1]; ratio = progress / 20; }
    else if (progress <= 50) { point1 = roadPoints[1]; point2 = roadPoints[2]; ratio = (progress - 20) / 30; }
    else if (progress <= 80) { point1 = roadPoints[2]; point2 = roadPoints[3]; ratio = (progress - 50) / 30; }
    else if (progress <= 95) { point1 = roadPoints[3]; point2 = roadPoints[4]; ratio = (progress - 80) / 15; }
    else { point1 = roadPoints[4]; point2 = roadPoints[5]; ratio = (progress - 95) / 5; }
    
    px = point1.x + (point2.x - point1.x) * ratio;
    py = point1.y + (point2.y - point1.y) * ratio;

    // --- MÓDOSÍTOTT RÉSZ: A KÉP KIRAJZOLÁSA AZ EMOJI HELYETT ---
    // A képet középre igazítjuk (px, py a közepe)
    const puppySize = 40; // A kép mérete pixelben
    ctx.drawImage(puppyImg, px - puppySize/2, py - puppySize/2, puppySize, puppySize);
}

function handleMove(currentX) {
    if (progress >= 100 || !gameReady) return;
    let diff = currentX - lastTouchX;
    if (diff > 2) { 
        let nextStop = stops.find(s => progress < s.pos && (progress + 1) >= s.pos);
        if (nextStop && !completedStops.includes(nextStop.pos)) {
            let answer = prompt(nextStop.q);
            if (answer && answer.toLowerCase() === nextStop.a.toLowerCase()) {
                completedStops.push(nextStop.pos);
                progress += 2;
            } else {
                alert("A híd zárva marad! Próbáld újra!");
                return;
            }
        } else {
            progress += 0.6; 
        }
    }
    lastTouchX = currentX;
    draw();
    if (progress >= 100) setTimeout(() => alert("Hazaértél! 🦴🐾"), 100);
}

// Restart funkció
document.getElementById('reset-btn').innerText = "Restart";
document.getElementById('reset-btn').onclick = function() {
    progress = 0;
    completedStops = [];
    draw();
};

// Eseménykezelők
canvas.addEventListener('touchstart', e => { lastTouchX = e.touches[0].clientX; });
canvas.addEventListener('touchmove', e => { handleMove(e.touches[0].clientX); });
canvas.addEventListener('mousedown', e => {
    lastTouchX = e.clientX;
    const moveM = (me) => handleMove(me.clientX);
    window.addEventListener('mousemove', moveM);
    window.addEventListener('mouseup', () => window.removeEventListener('mousemove', moveM), {once:true});
});

// Az első draw() hívást kivettük innen, mert a kép onload eseménye fogja meghívni!
