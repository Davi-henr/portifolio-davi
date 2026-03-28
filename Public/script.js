// ==========================================
// 1. ANIMAÇÕES QUANDO ROLA A TELA
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
            vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.5
        });
    }
}

function animateBg() {
    bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
    for(let i=0; i<particles.length; i++) {
        let p = particles[i];
        p.x += p.vx; p.y += p.vy;
        
        if(p.x < 0 || p.x > bgCanvas.width) p.vx *= -1;
        if(p.y < 0 || p.y > bgCanvas.height) p.vy *= -1;

        if (mouse.x != null) {
            let dx = p.x - mouse.x;
            let dy = p.y - mouse.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < mouse.r) {
                let forceDirectionX = dx / distance;
                let forceDirectionY = dy / distance;
                let force = (mouse.r - distance) / mouse.r;
                p.x += forceDirectionX * force * 5;
                p.y += forceDirectionY * force * 5;
            }
        }

        bgCtx.beginPath(); bgCtx.arc(p.x, p.y, p.size, 0, Math.PI*2);
        bgCtx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        bgCtx.fill();

        for(let j=i; j<particles.length; j++) {
            let p2 = particles[j];
            let dist = Math.hypot(p.x - p2.x, p.y - p2.y);
            if(dist < 150) {
                bgCtx.beginPath();
                bgCtx.strokeStyle = `rgba(0, 243, 255, ${0.15 - dist/1000})`; // Linhas azul neon fracas
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
// 3. MOTOR HOLOGRÁFICO 3D (Girar Cartões)
// ==========================================
const cards3D = document.querySelectorAll('.card-3d');

cards3D.forEach(card => {
    let isDragging = false;
    let startX, startY;
    let currentRotateX = 0;
    let currentRotateY = 0;

    // Detecta o clique/toque no cartão
    card.addEventListener('mousedown', startDrag);
    card.addEventListener('touchstart', startDrag, {passive: true});

    function startDrag(e) {
        isDragging = true;
        // Pega a posição do mouse ou do toque na tela do celular
        startX = e.type.includes('mouse') ? e.pageX : e.touches[0].pageX;
        startY = e.type.includes('mouse') ? e.pageY : e.touches[0].pageY;
        
        // Remove a transição suave para grudar no mouse perfeitamente
        card.style.transition = 'none'; 
    }

    // Movimento do mouse/dedo
    document.addEventListener('mousemove', drag);
    document.addEventListener('touchmove', drag, {passive: true});

    function drag(e) {
        if (!isDragging) return;

        const x = e.type.includes('mouse') ? e.pageX : e.touches[0].pageX;
        const y = e.type.includes('mouse') ? e.pageY : e.touches[0].pageY;

        // Calcula a distância que o mouse moveu
        const deltaX = x - startX;
        const deltaY = y - startY;

        // Atualiza a rotação (multiplicador ajusta a sensibilidade)
        const newRotateY = currentRotateY + deltaX * 0.5;
        const newRotateX = currentRotateX - deltaY * 0.5;

        // Aplica a rotação 3D ao cartão
        card.style.transform = `rotateX(${newRotateX}deg) rotateY(${newRotateY}deg)`;
    }

    // Soltar o mouse/dedo
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchend', endDrag);

    function endDrag(e) {
        if (!isDragging) return;
        isDragging = false;
        
        // Devolve a transição suave
        card.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)';

        // Pega a rotação atual baseada na matriz de transformação (matemática pura do CSS)
        const st = window.getComputedStyle(card, null);
        const tr = st.getPropertyValue("transform");
        
        let rotY = 0;
        if(tr !== 'none') {
            const values = tr.split('(')[1].split(')')[0].split(',');
            const a = values[0];
            const b = values[1];
            rotY = Math.round(Math.atan2(b, a) * (180/Math.PI));
        }

        // Snap: Se passou do meio (90 graus), vira de costas (Inglês). Se não, volta de frente (Português).
        if (Math.abs(rotY) > 90) {
            currentRotateY = 180; 
        } else {
            currentRotateY = 0;
        }
        
        // Reseta o eixo X (pra cima e pra baixo) para o cartão não ficar torto
        currentRotateX = 0; 
        
        card.style.transform = `rotateX(0deg) rotateY(${currentRotateY}deg)`;
    }
});
