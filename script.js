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

let progress = 0; // 0-tól 100-ig tartó haladás
let lastTouchX = 0;

// Megállók és logikai kérdések
const stops = [
    { pos: 25, q: "Hány szobás lesz az új ház?", a: "3", icon: "🚪" },
    { pos: 55, q: "Milyen színű a kerítés? (szürke/barna/zöld)", a: "szürke", icon: "🚧" },
    { pos: 85, q: "Mi a kutyus kedvenc játéka? (labda/csont/pluss)", a: "labda", icon: "🎾" }
];
let completedStops = [];

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Fix kanyargós útvonal rajzolása (háttér)
    ctx.beginPath();
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 30;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.moveTo(30, 250);   // Start
    ctx.lineTo(130, 250);  // 1. szakasz
    ctx.lineTo(130, 150);  // 2. szakasz (felfelé)
    ctx.lineTo(230, 150);  // 3. szakasz (jobbra)
    ctx.lineTo(230, 50);   // 4. szakasz (felfelé)
    ctx.lineTo(270, 50);   // Cél
    ctx.stroke();

    // Út menti díszítés
    ctx.font = "20px Arial";
    ctx.fillText("🌳", 50, 210);
    ctx.fillText("🚶", 160, 260);
    ctx.fillText("🏘️", 40, 60);
    ctx.fillText("🏠", 270, 40); // A ház
    ctx.fillText("🦴", 275, 75); // A jutalom csont a ház előtt

    // Aktuális pozíció kiszámítása az úton a progress alapján
    let px, py;
    if (progress <= 25) { // vízszintesen megy 30-tól 130-ig
        px = 30 + (progress * 4); py = 250;
    } else if (progress <= 50) { // függőlegesen fel 250-ről 150-ig
        px = 130; py = 250 - ((progress - 25) * 4);
    } else if (progress <= 75) { // vízszintesen jobbra 130-tól 230-ig
        px = 130 + ((progress - 50) * 4); py = 150;
    } else { // függőlegesen fel 150-ről 50-ig, majd kicsit jobbra
        px = 230 + ((progress - 75) * 1.6); py = 150 - ((progress - 75) * 4);
    }

    // Akadályok megjelenítése, ha még nem értünk oda
    stops.forEach(s => {
        if (!completedStops.includes(s.pos)) {
            ctx.fillText(s.icon, 100, 100); // Ez csak egy példa, a rajzolás bonyolultabb, maradjunk a jelzésnél:
            ctx.fillStyle = "red";
            ctx.beginPath();
            ctx.arc(130, 200, 5, 0, Math.PI*2); // Megálló pontok a kanyarokban
            ctx.fillStyle = "white";
        }
    });

    // Kutyus rajzolása
    ctx.font = "30px Arial";
    ctx.fillText("🐶", px - 15, py + 10);
}

// Swipe kezelése
function handleMove(currentX) {
    if (progress >= 100) return;

    let diff = currentX - lastTouchX;
    if (diff > 2) { // Csak ha jobbra/előre húzzuk
        
        // Ellenőrizzük, van-e megálló
        let nextStop = stops.find(s => progress < s.pos && (progress + 1) >= s.pos);
        
        if (nextStop && !completedStops.includes(nextStop.pos)) {
            let answer = prompt(nextStop.q);
            if (answer && answer.toLowerCase() === nextStop.a.toLowerCase()) {
                completedStops.push(nextStop.pos);
                progress += 2;
            } else {
                alert("Hoppá! Gondold át újra!");
                return;
            }
        } else {
            progress += 1;
        }
    }
    lastTouchX = currentX;
    draw();

    if (progress >= 100) {
        setTimeout(() => alert("Hazaértél! Megkaptad a csontot! 🦴🐾"), 100);
    }
}

// Touch események mobilra
canvas.addEventListener('touchstart', e => {
    lastTouchX = e.touches[0].clientX;
});

canvas.addEventListener('touchmove', e => {
    handleMove(e.touches[0].clientX);
});

// Egér események teszteléshez (gépen)
canvas.addEventListener('mousedown', e => {
    lastTouchX = e.clientX;
    const moveMouse = (me) => handleMove(me.clientX);
    window.addEventListener('mousemove', moveMouse);
    window.addEventListener('mouseup', () => window.removeEventListener('mousemove', moveMouse), {once:true});
});

draw();
