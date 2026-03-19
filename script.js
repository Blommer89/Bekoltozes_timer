// --- VISSZASZÁMLÁLÓ (Marad a régi) ---
const targetDate = new Date("May 4, 2026 08:00:00").getTime();
function updateTimer() {
    const now = new Date().getTime();
    const diff = targetDate - now;
    if (diff <= 0) {
        document.getElementById("timer").innerHTML = "Hazaértünk! 🏠🍾";
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

// --- VIRTUÁLIS KERT JÁTÉK ---
const canvas = document.getElementById('mazeCanvas');
const ctx = canvas.getContext('2d');

// --- A KISKUTYA KÉP BETÖLTÉSE ---
let puppyReady = false;
const puppyImg = new Image();
puppyImg.src = 'puppy.png'; // Használjuk a feltöltött képedet
const puppySize = 50; // A kép mérete pixelben

puppyImg.onload = function() {
    puppyReady = true;
    draw(); // Kirajzoljuk a kertet az induláskor
};

// Kutyus aktuális és cél pozíciója
let puppy = {
    x: canvas.width / 2, // Kezdés középen
    y: canvas.height / 2,
    speed: 4, // Szaladási sebesség
    targetX: canvas.width / 2,
    targetY: canvas.height / 2,
    moving: false
};

// Ugatás felirat állapota
let barkInfo = {
    visible: false,
    text: "Vau-vau! 🐾",
    timer: 0
};

// --- DÍSZÍTÉS: KERT ELEMEK ---
function drawGarden() {
    // 1. Zöld fű (Alap)
    ctx.fillStyle = "#3a7d44"; // Sötétebb, dúsabb zöld
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. A ház (Fix helyen)
    ctx.font = "50px Arial";
    ctx.fillText("🏠", 20, 70); 

    // 3. Fák, bokrok, virágok (szétszórva)
    ctx.font = "25px Arial";
    ctx.fillText("🌳", 200, 80);  ctx.fillText("🌲", 250, 150);
    ctx.fillText("🌿", 50, 250);   ctx.fillText("🌺", 150, 280);
    ctx.fillText("🌼", 220, 220);  ctx.fillText("🌸", 100, 120);
    ctx.fillText("🌻", 180, 50);   ctx.fillText("🌳", 30, 180);
}

function draw() {
    // 1. Kert újrarajzolása (letörli az előző képkockát)
    drawGarden();

    // 2. Kutyus kirajzolása (ha a kép betöltődött)
    if (puppyReady) {
        ctx.drawImage(puppyImg, puppy.x - puppySize/2, puppy.y - puppySize/2, puppySize, puppySize);
    }

    // 3. Ugatás felirat megjelenítése
    if (barkInfo.visible) {
        ctx.fillStyle = "white"; // Szöveg színe
        ctx.strokeStyle = "black"; // Körvonal
        ctx.lineWidth = 3;
        ctx.font = "bold 24px Arial";
        ctx.textAlign = "center";
        
        // Szöveg és körvonal
        ctx.strokeText(barkInfo.text, puppy.x, puppy.y - puppySize/2 - 15);
        ctx.fillText(barkInfo.text, puppy.x, puppy.y - puppySize/2 - 15);
        
        // Visszaállítjuk az alapértelmezett igazítást
        ctx.textAlign = "left";
    }
}

// --- JÁTÉK LOGIKA (Mozgás) ---
function gameLoop() {
    if (puppy.moving) {
        // Kiszámoljuk a távolságot a célig
        let dx = puppy.targetX - puppy.x;
        let dy = puppy.targetY - puppy.y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > puppy.speed) {
            // Mozgatjuk a kutyust a cél felé
            puppy.x += (dx / distance) * puppy.speed;
            puppy.y += (dy / distance) * puppy.speed;
        } else {
            // Megérkezett a célhoz
            puppy.x = puppy.targetX;
            puppy.y = puppy.targetY;
            puppy.moving = false;
            
            // Megszólaltatjuk (Vau-vau!)
            showBark();
        }
    }

    // Ugatás időzítő csökkentése
    if (barkInfo.visible) {
        barkInfo.timer--;
        if (barkInfo.timer <= 0) {
            barkInfo.visible = false;
        }
    }

    draw(); // Újrarajzoljuk a képernyőt
    requestAnimationFrame(gameLoop); // Következő képkocka kérése
}

// Felvillantja az ugatást 2 másodpercre
function showBark() {
    barkInfo.visible = true;
    barkInfo.timer = 120; // Kb 2 másodperc (60 képkocka/mp)
}

// --- ESEMÉNYKEZELŐK ---
function setTarget(e) {
    // Lekérdezzük, hova kattintott/bökött a felhasználó
    let rect = canvas.getBoundingClientRect();
    let x, y;
    
    if (e.touches) { // Érintés (mobil)
        x = e.touches[0].clientX - rect.left;
        y = e.touches[0].clientY - rect.top;
    } else { // Kattintás (egér)
        x = e.clientX - rect.left;
        y = e.clientY - rect.top;
    }

    // Beállítjuk az új célt, és elindítjuk a kutyust
    puppy.targetX = x;
    puppy.targetY = y;
    puppy.moving = true;
    
    // Ha szaladás közben böksz máshova, az ugatás eltűnik
    barkInfo.visible = false; 
}

// Érintés és Kattintás események hozzáadása
canvas.addEventListener('mousedown', setTarget);
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault(); // Megakadályozza a görgetést érintéskor
    setTarget(e);
});

// Restart gomb (id=reset-btn) letiltása, mert ehhez nem kell
if(document.getElementById('reset-btn')) {
    document.getElementById('reset-btn').style.display = 'none';
}

// Indítjuk a játék ciklust
gameLoop();
