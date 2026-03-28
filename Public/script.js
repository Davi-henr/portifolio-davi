// ==========================================
// 1. ANIMAÇÕES QUANDO ROLA A TELA (Páginas 2 e 3)
// ==========================================
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('show');
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.animate-on-scroll').forEach((el) => {
    observer.observe(el);
});

// ==========================================
// 2. REDE NEURAL (FUGINDO DO MOUSE)
// ==========================================
const bgCanvas = document.getElementById('neural-network');
const bgCtx = bgCanvas.getContext('2d');
let particles = [];
const mouse = { x: null, y: null, r: 150 };

window.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
window.addEventListener('mouseout', () => { mouse.x = null; mouse.y = null; });

function initBg() {
    bgCanvas.width = window.innerWidth; bgCanvas.height = window.innerHeight;
    particles = [];
    let num = (bgCanvas.width * bgCanvas.height) / 10000;
    for(let i=0; i<num; i++) {
        particles.push({
            x: Math.random() * bgCanvas.width, y: Math.random() * bgCanvas.height,
            size: Math.random() * 2 + 0.5,
            vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.5,
            baseX: this.x, baseY: this.y // Para saber a origem
        });
    }
}

function animateBg() {
    bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
    for(let i=0; i<particles.length; i++) {
        let p = particles[i];
        p.x += p.vx; p.y += p.vy;

        // Rebate nas bordas
        if(p.x < 0 || p.x > bgCanvas.width) p.vx *= -1;
        if(p.y < 0 || p.y > bgCanvas.height) p.vy *= -1;

        // FÍSICA: FUGIR DO MOUSE
        if (mouse.x != null) {
            let dx = p.x - mouse.x;
            let dy = p.y - mouse.y;
            let distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < mouse.r) {
                // Força de empurrão
                let forceDirectionX = dx / distance;
                let forceDirectionY = dy / distance;
                let force = (mouse.r - distance) / mouse.r;

                // Aplica a força empurrando a partícula para longe
                p.x += forceDirectionX * force * 5;
                p.y += forceDirectionY * force * 5;
            }
        }

        // Desenha a partícula
        bgCtx.beginPath(); bgCtx.arc(p.x, p.y, p.size, 0, Math.PI*2);
        bgCtx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        bgCtx.fill();

        // Conecta as partículas próximas
        for(let j=i; j<particles.length; j++) {
            let p2 = particles[j];
            let dist = Math.hypot(p.x - p2.x, p.y - p2.y);
            if(dist < 120) {
                bgCtx.beginPath();
                bgCtx.strokeStyle = `rgba(255, 255, 255, ${0.15 - dist/800})`;
                bgCtx.lineWidth = 0.5;
                bgCtx.moveTo(p.x, p.y); bgCtx.lineTo(p2.x, p2.y); bgCtx.stroke();
            }
        }
    }
    requestAnimationFrame(animateBg);
}
initBg(); animateBg();
window.addEventListener('resize', initBg);

// ==========================================
// 3. JOGO DO PLANETA (COMER O VERMELHO)
// ==========================================
const gCanvas = document.getElementById('predator-game');
const gCtx = gCanvas.getContext('2d');
const scoreEl = document.getElementById('game-score');

let player = { x: 0, y: 0, r: 15 };
let foods = []; let viruses = [];

function initGame() {
    gCanvas.width = window.innerWidth; gCanvas.height = window.innerHeight;
    player.x = gCanvas.width/2; player.y = gCanvas.height/2;
    foods = []; viruses = [];

    for(let i=0; i<70; i++) foods.push({ x: Math.random()*gCanvas.width, y: Math.random()*gCanvas.height, r: 3 });
    for(let i=0; i<10; i++) viruses.push({ x: Math.random()*gCanvas.width, y: Math.random()*gCanvas.height, r: 25 + Math.random()*20, vx: (Math.random()-0.5)*4, vy: (Math.random()-0.5)*4 });
}
initGame(); window.addEventListener('resize', initGame);

let gMouseX = gCanvas.width/2, gMouseY = gCanvas.height/2;
document.getElementById('scroll-box').addEventListener('mousemove', (e) => { gMouseX = e.clientX; gMouseY = e.clientY; });

function drawGame() {
    gCtx.clearRect(0, 0, gCanvas.width, gCanvas.height);
    player.x += (gMouseX - player.x) * 0.1; player.y += (gMouseY - player.y) * 0.1;

    // COMIDA
    gCtx.fillStyle = 'rgba(255,255,255,0.6)';
    foods.forEach(f => {
        gCtx.beginPath(); gCtx.arc(f.x, f.y, f.r, 0, Math.PI*2); gCtx.fill();
        if(Math.hypot(player.x - f.x, player.y - f.y) < player.r + f.r) {
            player.r += 0.5; scoreEl.innerText = Math.floor(player.r);
            f.x = Math.random()*gCanvas.width; f.y = Math.random()*gCanvas.height;
        }
    });

    // VÍRUS
    viruses.forEach(v => {
        v.x += v.vx; v.y += v.vy;
        if(v.x < 0 || v.x > gCanvas.width) v.vx *= -1;
        if(v.y < 0 || v.y > gCanvas.height) v.vy *= -1;

        if (player.r > v.r) {
            gCtx.fillStyle = 'rgba(255, 95, 86, 0.2)';
            gCtx.strokeStyle = '#ff5f56'; gCtx.lineWidth = 1;
        } else {
            gCtx.fillStyle = '#ff5f56';
            gCtx.strokeStyle = 'transparent';
        }

        gCtx.beginPath(); gCtx.arc(v.x, v.y, v.r, 0, Math.PI*2); gCtx.fill();
        if (player.r > v.r) gCtx.stroke();

        if(Math.hypot(player.x - v.x, player.y - v.y) < player.r + v.r) {
            if (player.r > v.r) {
                player.r += 3; scoreEl.innerText = Math.floor(player.r);
                v.x = Math.random()*gCanvas.width; v.y = Math.random()*gCanvas.height; v.r = player.r + Math.random()*20;
            } else if(player.r > 15) {
                player.r -= 2; scoreEl.innerText = Math.floor(player.r);
            }
        }
    });

    // JOGADOR
    gCtx.beginPath(); gCtx.arc(player.x, player.y, player.r, 0, Math.PI*2);
    gCtx.fillStyle = '#ffffff'; gCtx.shadowBlur = 25; gCtx.shadowColor = 'rgba(255,255,255,0.8)';
    gCtx.fill(); gCtx.shadowBlur = 0;

    requestAnimationFrame(drawGame);
}
drawGame();