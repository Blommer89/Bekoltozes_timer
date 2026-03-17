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

// --- KALANDJÁTÉK ---
const canvas = document.getElementById('mazeCanvas');
const ctx = canvas.getContext('2d');

// Az útvonal pontjai (x, y koordináták)
const path = [
    {x: 30, y: 250}, {x: 100, y: 250}, // Start szakasz
    {x: 100, y: 150}, {x: 200, y: 150}, // Első kanyar
    {x: 200, y: 50},  {x: 270, y: 50}   // Cél szakasz
];

let progress = 0; // Mennyit haladtunk az úton (0-100%)
let currentStop = 0;
const stops = [
    { pos: 30, question: "Mennyi 12 + 15?", answer: "27", label: "Zárt kapu 🚪" },
    { pos: 60, question: "Milyen színű a kutyusod? (barna/fekete/feher)", answer: "fekete", label: "Morgó macska 🐱" },
    { pos: 85, question: "Hány lába van a kutyának?", answer: "4", label: "Nagy pocsolya 💧" }
];

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Út megrajzolása
    ctx.strokeStyle = "#444";
    ctx.lineWidth = 20;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(path[0].x, path[0].y);
    for(let i=1; i<path.length; i++) ctx.lineTo(path[i].x, path[i].y);
    ctx.stroke();

    // Díszítés (Házak, emberek szimbólumai)
    ctx.font = "20px serif";
    ctx.fillText("🏘️", 50, 100);
    ctx.fillText("🌳", 230, 200);
    ctx.fillText("🚶", 150, 280);
    ctx.fillText("🏠", 270, 50);

    // Aktuális pozíció kiszámítása az úton
    let currentX = path[0].x + (path[path.length-1].x - path[0].x) * (progress/100);
    // (Egyszerűsített mozgás a szemléltetéshez)
    // Megjegyzés: Ez egy egyenes vonalú közelítés, de a célra megfelel
    
    // Kutyus megjelenítése
    ctx.fillText("🐶", 25 + (progress * 2.4), 250 - (progress * 2)); 

    // Megállók jelzése
    stops.forEach(s => {
        if (progress < s.pos) ctx.fillText(s.label, 25 + (s.pos * 2.2), 250 - (s.pos * 1.8));
    });
}

function move() {
    if (progress < 100) {
        let nextStop = stops.find(s => Math.abs(progress - s.pos) < 1);
        
        if (nextStop && currentStop < stops.indexOf(nextStop) + 1) {
            let valasz = prompt(nextStop.question);
            if (valasz && valasz.toLowerCase() === nextStop.answer.toLowerCase()) {
                currentStop++;
                progress += 2;
            } else {
                alert("Hoppá, ez nem talált! Próbáld újra.");
                return;
            }
        }
        progress += 0.5;
        draw();
        requestAnimationFrame(move);
    } else {
        alert("Gratulálok! A kutyus szerencsésen haazaért a házba! 🐾");
    }
}

// Indítás gombnyomásra (vagy swipe-ra)
canvas.onclick = () => {
    if(progress === 0) move();
};

draw();
