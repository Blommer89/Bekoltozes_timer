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

let progress = 0; // 0-tól 100-ig tartó haladás az ÚTVONALON
let lastTouchX = 0;
let completedStops = [];

// Az útvonal pontos kanyarpontjai
const roadPoints = [
    { x: 30, y: 250 },  // Start
    { x: 130, y: 250 }, // 1. kanyar (STOP 1)
    { x: 130, y: 150 }, // 2. kanyar (STOP 2)
    { x: 230, y: 150 }, // 3. kanyar (STOP 3)
    { x: 230, y: 50 },  // 4. kanyar
    { x: 270, y: 50 }   // Cél
];

// Megállók és logikai kérdések (pontosan a kanyarokra helyezve)
const stops = [
    { pos: 20, q: "Hány szobás lesz az új ház?", a: "3", x: roadPoints[1].x, y: roadPoints[1].y, icon: "🚪" },
    { pos: 50, q: "Milyen színű a kerítés? (szürke/barna/zöld)", a: "szürke", x: roadPoints[2].x, y: roadPoints[2].y, icon: "🚧" },
    { pos: 80, q: "Mi a kutyus kedvenc játéka?", a: "labda", x: roadPoints[3].x, y: roadPoints[3].y, icon: "🎾" }
];

function draw() {
    // 1. Zöld fű (Alap)
    ctx.fillStyle = "#2d5a27";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Barna földút rajzolása (kanyargósan)
    ctx.beginPath();
    ctx.strokeStyle = "#8B4513"; // Sötétbarna földút
    ctx.lineWidth = 25;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.moveTo(roadPoints[0].x, roadPoints[0].y);
    for(let i=1; i<roadPoints.length; i++) {
        ctx.lineTo(roadPoints[i].x, roadPoints[i].y);
    }
    ctx.stroke();

    // Díszítés: Falvak, fák, emberek
    ctx.font = "20px Arial";
    // 1. Falu (Kezdet)
    ctx.fillText("🏠", 50, 210); ctx.fillText("🏡", 70, 280); ctx.fillText("🌳", 90, 200);
    // 2. Falu (Közép)
    ctx.fillText("🏘️", 160, 100); ctx.fillText("🌳", 180, 180); ctx.fillText("🚶", 100, 130);
    // 3. Falu (Cél felé)
    ctx.fillText("🏡", 250, 120); ctx.fillText("🌸", 210, 30); ctx.fillText("🌲", 250, 200);

    // Cél: Ház és Csont
    ctx.font = "30px Arial";
    ctx.fillText("🏠", roadPoints[5].x - 10, roadPoints[5].y - 10);
    ctx.fillText("🦴", roadPoints[5].x + 10, roadPoints[5].y + 25);

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

    // 4. Kutyus pozíciójának kiszámítása PONTOSAN az úton
    let px, py;
    let point1, point2;
    let ratio;

    if (progress <= 20) { // Start -> Kanyar 1
        point1 = roadPoints[0]; point2 = roadPoints[1]; ratio = progress / 20;
    } else if (progress <= 50) { // Kanyar 1 -> Kanyar 2
        point1 = roadPoints[1]; point2 = roadPoints[2]; ratio = (progress - 20) / 30;
    } else if (progress <= 80) { // Kanyar 2 -> Kanyar 3
        point1 = roadPoints[2]; point2 = roadPoints[3]; ratio = (progress - 50) / 30;
    } else if (progress <= 95) { // Kanyar 3 -> Kanyar 4
        point1 = roadPoints[3]; point2 = roadPoints[4]; ratio = (progress - 80) / 15;
    } else { // Kanyar 4 -> Cél
        point1 = roadPoints[4]; point2 = roadPoints[5]; ratio = (progress - 95) / 5;
    }
    // Lineáris interpoláció a két pont között
    px = point1.x + (point2.x - point1.x) * ratio;
    py = point1.y + (point2.y - point1.y) * ratio;

    ctx.font = "30px Arial";
    ctx.fillText("🐶", px - 15, py + 10);
}

function handleMove(currentX) {
    if (progress >= 100) return;
    let diff = currentX - lastTouchX;
    if (diff > 2) { 
        // Ellenőrizzük, elértünk-e egy STOP-ot
        let nextStop = stops.find(s => progress < s.pos && (progress + 1) >= s.pos);
        if (nextStop && !completedStops.includes(nextStop.pos)) {
            let answer = prompt(nextStop.q);
            if (answer && answer.toLowerCase() === nextStop.a.toLowerCase()) {
                completedStops.push(nextStop.pos);
                progress += 2; // Egy kicsit tovább visszük, hogy ne kérdezzen újra
            } else {
                alert("A híd zárva marad! Próbáld újra!");
                return;
            }
        } else {
            progress += 0.6; // Haladási sebesség (csökkentve a pontosságért)
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
