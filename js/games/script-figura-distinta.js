window.registerGame = function() {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        return () => {};
    }
    const ctx = canvas.getContext('2d');
    
    // Config
    const TIME_LIMIT = 60; // 60s
    
    // State
    let gameState = 'menu'; // menu, playing, result
    let animationFrameId = null;
    let score = 0;
    let timeLeft = TIME_LIMIT;
    let grid = []; // {x, y, w, h, isTarget}
    let cols = 3; 
    let rows = 3;
    let shapeType = 'square'; // square, circle, triangle
    let oddType = 'color'; // color, rotation, size
    
    // --- INPUT ---
    function handleInput(e) {
        const rect = canvas.getBoundingClientRect();
        let clientX = e.clientX;
        let clientY = e.clientY;
        if (e.changedTouches && e.changedTouches.length > 0) {
            clientX = e.changedTouches[0].clientX;
            clientY = e.changedTouches[0].clientY;
        }
        
        const x = (clientX - rect.left) * (canvas.width / rect.width);
        const y = (clientY - rect.top) * (canvas.height / rect.height);
        
        if (gameState === 'menu' || gameState === 'result') {
            if (gameState === 'result') {
                // Retry area center bottom
                if (y > 350 && y < 450) startGame();
            } else {
                startGame();
            }
        } else if (gameState === 'playing') {
            checkClick(x, y);
        }
    }
    
    function startGame() {
        score = 0;
        timeLeft = TIME_LIMIT;
        cols = 3;
        rows = 3;
        startRound();
        gameState = 'playing';
    }
    
    function startRound() {
        // Incrementar dificultad cada 5 puntos
        if (score > 5) { cols = 4; rows = 4; }
        if (score > 15) { cols = 5; rows = 4; }
        if (score > 25) { cols = 5; rows = 5; }
        if (score > 40) { cols = 6; rows = 5; }
        
        // Generar grid
        grid = [];
        const padding = 20;
        const totalW = canvas.width - (padding*2);
        const totalH = canvas.height - 100; // Leave header space
        
        const cellW = totalW / cols;
        const cellH = totalH / rows;
        const size = Math.min(cellW, cellH) * 0.6; // Shape size
        
        const startX = padding + cellW/2;
        const startY = 80 + cellH/2;
        
        // Elegir target random
        const total = cols * rows;
        const targetIndex = Math.floor(Math.random() * total);
        
        // Randomizar tipo de fig y diferencia para esta ronda
        const shapes = ['square', 'circle', 'triangle', 'pentagon'];
        shapeType = shapes[Math.floor(Math.random() * shapes.length)];
        
        const diffs = ['color', 'rotation', 'size'];
        oddType = diffs[Math.floor(Math.random() * diffs.length)];
        // Simplificar: Triangle rota bien, Circle solo color/size
        if (shapeType === 'circle' && oddType === 'rotation') oddType = 'color';
        
        // Base Props
        const baseColor = `hsl(${Math.random()*360}, 70%, 50%)`;
        const baseAngle = 0;
        
        // Odd Props
        let oddColor = baseColor;
        let oddAngle = baseAngle;
        let oddSize = size;
        
        if (oddType === 'color') {
            // Cambiar hue 30 grados
            oddColor = changeHue(baseColor, 35);
        } else if (oddType === 'rotation') {
            oddAngle = Math.PI / (shapeType === 'square' ? 4 : 1); // 45deg for square, 180 (flip) for triangle
            if (shapeType === 'triangle') oddAngle = Math.PI; 
            if (shapeType === 'pentagon') oddAngle = Math.PI;
        } else if (oddType === 'size') {
            oddSize = size * 0.65;
        }
        
        let idx = 0;
        for(let r=0; r<rows; r++) {
            for(let c=0; c<cols; c++) {
                const isTarget = (idx === targetIndex);
                grid.push({
                    x: startX + c*cellW,
                    y: startY + r*cellH,
                    size: isTarget ? oddSize : size,
                    color: isTarget ? oddColor : baseColor,
                    angle: isTarget ? oddAngle : baseAngle,
                    isTarget: isTarget,
                    shape: shapeType
                });
                idx++;
            }
        }
    }
    
    function changeHue(hslStr, amount) {
        // hsl(123, 70%, 50%)
        const parts = hslStr.match(/hsl\((\d+(\.\d+)?),\s*(\d+)%,\s*(\d+)%\)/);
        if (!parts) return hslStr; // Fallback
        let h = parseFloat(parts[1]);
        h = (h + amount) % 360;
        return `hsl(${h}, ${parts[3]}%, ${parts[4]}%)`;
    }
    
    function checkClick(mx, my) {
        // Simplificado: Distancia al centro
        // No bounding box exacto, área de influencia generosa
        // Pero cuidado con falsos positivos en grid denso.
        // Mejor: Encontrar celda más cercana.
        
        let closest = null;
        let minD = 9999;
        
        for(let item of grid) {
            const dx = mx - item.x;
            const dy = my - item.y;
            const d = Math.sqrt(dx*dx + dy*dy);
            if (d < minD) {
                minD = d;
                closest = item;
            }
        }
        
        // Si click está razonablemente cerca del centro de la celda (< cellRadius)
        // item.size es radius aprox. Use item.size * 1.5 tolerance
        if (closest && minD < closest.size * 2) {
            if (closest.isTarget) {
                // Correct
                score++;
                startRound(); // Next
                playSound(true);
            } else {
                // Wrong - Penalty
                timeLeft -= 3;
                playSound(false);
                // Feedback visual de error? 
                // Shake effect global or red flash
            }
        }
    }
    
    function playSound(good) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const actx = new AudioContext();
        const osc = actx.createOscillator();
        const g = actx.createGain();
        osc.connect(g);
        g.connect(actx.destination);
        
        if (good) {
            osc.frequency.setValueAtTime(600, actx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(1200, actx.currentTime + 0.1);
            osc.type = 'sine';
        } else {
            osc.frequency.setValueAtTime(200, actx.currentTime);
            osc.frequency.linearRampToValueAtTime(100, actx.currentTime + 0.2);
            osc.type = 'sawtooth';
        }
        
        osc.start();
        g.gain.exponentialRampToValueAtTime(0.01, actx.currentTime + 0.2);
        osc.stop(actx.currentTime + 0.2);
    }
    
    function gameOver() {
        gameState = 'result';
        const best = parseInt(localStorage.getItem('figuraDistintaBest') || '0');
        if (score > best) {
            localStorage.setItem('figuraDistintaBest', score);
            const n = localStorage.getItem('playerName');
            if (n) localStorage.setItem('figuraDistintaBestName', n);
        }
    }
    
    function update(dt) {
        if (gameState === 'playing') {
            timeLeft -= dt;
            if (timeLeft <= 0) {
                timeLeft = 0;
                gameOver();
            }
        }
    }
    
    function drawShape(ctx, item) {
        ctx.save();
        ctx.translate(item.x, item.y);
        ctx.rotate(item.angle);
        ctx.fillStyle = item.color;
        
        ctx.beginPath();
        const s = item.size; // radius roughly
        
        if (item.shape === 'square') {
            ctx.fillRect(-s, -s, s*2, s*2);
        } else if (item.shape === 'circle') {
            ctx.arc(0, 0, s, 0, Math.PI*2);
            ctx.fill();
        } else if (item.shape === 'triangle') {
            ctx.moveTo(0, -s);
            ctx.lineTo(s, s);
            ctx.lineTo(-s, s);
            ctx.closePath();
            ctx.fill();
        } else if (item.shape === 'pentagon') {
            for(let i=0; i<5; i++) {
                const a = (Math.PI*2 * i / 5) - Math.PI/2;
                const px = Math.cos(a) * s;
                const py = Math.sin(a) * s;
                if (i===0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.fill();
        }
        
        ctx.restore();
    }
    
    function draw() {
        // BG
        ctx.fillStyle = '#2d3436';
        ctx.fillRect(0,0, canvas.width, canvas.height);
        
        const cx = canvas.width/2;
        
        if (gameState === 'menu') {
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.font = '36px Arial';
            ctx.fillText('🧩 Encuentra la Diferencia', cx, 150);
            
            ctx.font = '20px Arial';
            ctx.fillStyle = '#aaa'; 
            ctx.fillText('Una de las figuras es diferente.', cx, 200);
            ctx.fillText('Encuéntrala antes de que acabe el tiempo.', cx, 230);
            
            ctx.fillStyle = '#fab1a0';
            ctx.fillRect(cx - 90, 300, 180, 50);
            ctx.fillStyle = '#2d3436';
            ctx.font = 'bold 24px Arial';
            ctx.fillText('JUGAR', cx, 333);
            return;
        }
        
        if (gameState === 'playing') {
            // Header
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'left';
            ctx.font = '24px Arial';
            ctx.fillText(`Puntos: ${score}`, 20, 40);
            
            ctx.textAlign = 'right';
            const timeCol = timeLeft < 10 ? '#ff7675' : '#fff';
            ctx.fillStyle = timeCol;
            ctx.fillText(`Tiempo: ${Math.ceil(timeLeft)}s`, canvas.width - 20, 40);
            
            // Grid
            for(let item of grid) {
                drawShape(ctx, item);
            }
        }
        
        if (gameState === 'result') {
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.font = '40px Arial';
            ctx.fillText('¡Tiempo Agotado!', cx, 150);
            
            ctx.font = 'bold 80px Arial';
            ctx.fillStyle = '#fab1a0';
            ctx.fillText(score, cx, 250);
            
            ctx.fillStyle = '#fff';
            ctx.font = '20px Arial';
            ctx.fillText('Figuras encontradas', cx, 290);
            
            // Best
            const best = localStorage.getItem('figuraDistintaBest') || 0;
            ctx.fillStyle = '#ffeaa7';
            ctx.fillText(`Récord Personal: ${best}`, cx, 330);
            
            ctx.fillStyle = '#fab1a0';
            ctx.fillRect(cx - 90, 380, 180, 50);
            ctx.fillStyle = '#2d3436';
            ctx.font = 'bold 24px Arial';
            ctx.fillText('REPETIR', cx, 413);
        }
    }
    
    function loop(now) {
        update((now - lastTime)/1000);
        lastTime = now;
        draw();
        animationFrameId = requestAnimationFrame(loop);
    }
    let lastTime = 0;
    
    canvas.addEventListener('mousedown', handleInput);
    canvas.addEventListener('touchstart', (e)=>{ e.preventDefault(); handleInput(e); });
    
    loop(0);
    
    return function cleanup() {
        if(animationFrameId) cancelAnimationFrame(animationFrameId);
        canvas.removeEventListener('mousedown', handleInput);
        canvas.removeEventListener('touchstart', handleInput);
    };
};
