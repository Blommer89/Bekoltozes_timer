// --- VISSZASZÁMLÁLÓ ---
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

const stops = [
    { pos: 25, q: "Hány szobás lesz az új ház?", a: "3", x: 130, y: 250, label: "1. Híd" },
    { pos: 55, q: "Milyen színű a kerítés? (szürke/barna/zöld)", a: "szürke", x: 130, y: 150, label: "2. Híd" },
    { pos: 85, q: "Mi a kutyus kedvenc játéka?", a: "labda", x: 230, y: 100, label: "3. Híd" }
];

function draw() {
    // 1. Zöld fű (Alap)
    ctx.fillStyle = "#2d5a27";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Barna földút rajzolása
    ctx.beginPath();
    ctx.strokeStyle = "#8B4513"; // Sötétbarna földút
    ctx.lineWidth = 25;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.moveTo(30, 250);
    ctx.lineTo(130, 250);
    ctx.lineTo(130, 150);
    ctx.lineTo(230, 150);
    ctx.lineTo(230, 50);
    ctx.lineTo(270, 50);
    ctx.stroke();

    // Díszítés: Virágok és fák
    ctx.font = "15px Arial";
    ctx.fillText("🌸", 40, 40); ctx.fillText("🌲", 200, 250);
    ctx.fillText("🌼", 180, 40); ctx.fillText("🌳", 50, 180);

    // 3. Hidak rajzolása (ahol a kérdések vannak)
    stops.forEach(s => {
        ctx.fillStyle = completedStops.includes(s.pos) ? "#A0522D" : "#555"; // Barna ha kész, szürke ha zárva
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

    // Cél: Ház és Csont
    ctx.font = "30px Arial";
    ctx.fillText("🏠", 260, 50);
    ctx.fillText("🦴", 270, 85);

    // Kutyus pozíciója (számítás a progress alapján)
    let px, py;
    if (progress <= 25) { px = 30 + (progress * 4); py = 250; }
    else if (progress <= 50) { px = 130; py = 250 - ((progress - 25) * 4); }
    else if (progress <= 75) { px = 130 + ((progress - 50) * 4); py = 150; }
    else { px = 230 + ((progress - 75) * 1.6); py = 150 - ((progress - 75) * 4); }

    ctx.fillText("🐶", px - 15, py + 10);
}

function handleMove(currentX) {
    if (progress >= 100) return;
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
            progress += 0.8;
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

draw();
