window.registerGame(function() {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        console.error('Canvas gameCanvas no encontrado');
        return () => {};
    }
    const ctx = canvas.getContext('2d');

    // Estado
    let gameState = 'menu'; // menu, playing, result
    let animationFrameId = null;
    
    // Variables Gameplay
    let timeElapsed = 0;
    const GAME_DURATION = 15; // segundos
    let scoreTime = 0; // tiempo acumulado dentro
    
    // Target
    let target = { x: 0, y: 0, r: 40 };
    // Mouse
    let mouse = { x: -1000, y: -1000 };
    let isInside = false;
    
    // Variables movimiento (ondas sinusoidales compuestas)
    let t = 0;
    let paramsX = [Math.random(), Math.random(), Math.random()];
    let paramsY = [Math.random(), Math.random(), Math.random()];
    
    // --- INPUT ---
    function handleStart(e) {
        if (gameState === 'menu' || gameState === 'result') {
            startGame();
        }
    }
    
    function handleMove(e) {
        const rect = canvas.getBoundingClientRect();
        let clientX, clientY;
        
        if (e.touches && e.touches.length > 0) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }
        
        // Escalar coordenadas del canvas real vs visual
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        mouse.x = (clientX - rect.left) * scaleX;
        mouse.y = (clientY - rect.top) * scaleY;
    }
    
    function startGame() {
        gameState = 'playing';
        timeElapsed = 0;
        scoreTime = 0;
        t = 0;
        
        // Randomizar trayectorias
        paramsX = [0.5 + Math.random(), 0.3 + Math.random(), 1 + Math.random()];
        paramsY = [0.5 + Math.random(), 0.3 + Math.random(), 1 + Math.random()];
    }
    
    function update(dt) {
        if (gameState === 'playing') {
            timeElapsed += dt;
            t += dt;
            
            if (timeElapsed >= GAME_DURATION) {
                gameState = 'result';
                return;
            }
            
            // Movimiento complejo del target
            // x = Center + A*sin(t*f1) + B*cos(t*f2) ...
            const w = canvas.width;
            const h = canvas.height;
            const pad = 100;
            
            // Normalizado -1 a 1 aprox, luego mapeado a pantalla
            let nx = Math.sin(t * paramsX[0]) + 0.5 * Math.cos(t * paramsX[1] * 2.3);
            let ny = Math.cos(t * paramsY[0]) + 0.5 * Math.sin(t * paramsY[1] * 2.3);
            
            // Clamp aproximado para mantener en pantalla
            // Rango de waves es -1.5 a 1.5 aprox
            target.x = (w/2) + (nx / 1.8) * (w/2 - pad);
            target.y = (h/2) + (ny / 1.8) * (h/2 - pad);
            
            // Chequeo colisión
            const dx = mouse.x - target.x;
            const dy = mouse.y - target.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            
            isInside = (dist < target.r);
            
            if (isInside) {
                scoreTime += dt;
            }
        }
    }
    
    function draw() {
        // Fondo
        ctx.fillStyle = '#102027'; // Azul muy oscuro
        ctx.fillRect(0,0,canvas.width, canvas.height);
        
        const cx = canvas.width/2;
        const cy = canvas.height/2;
        
        if (gameState === 'menu') {
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.font = '36px Arial';
            ctx.fillText('🌀 Rastreo de Ruta', cx, cy - 60);
            
            ctx.font = '20px Arial';
            ctx.fillStyle = '#ccc';
            ctx.fillText('Mantén el cursor/dedo DENTRO', cx, cy - 10);
            ctx.fillText('de la esfera mientras se mueve.', cx, cy + 20);
            
            ctx.fillStyle = '#00bcd4';
            ctx.fillRect(cx - 90, cy + 80, 180, 50);
            ctx.fillStyle = '#000';
            ctx.font = 'bold 20px Arial';
            ctx.fillText('EMPEZAR', cx, cy + 112);
            return;
        }
        
        if (gameState === 'playing') {
            // Dibujar "trail" o camino pasado (opcional, por ahora solo target)
            
            // Target
            ctx.beginPath();
            ctx.arc(target.x, target.y, target.r, 0, Math.PI*2);
            
            if (isInside) {
                ctx.fillStyle = '#00e676'; // Verde brillante
                ctx.shadowBlur = 20;
                ctx.shadowColor = '#00e676';
            } else {
                ctx.fillStyle = '#f44336'; // Rojo
                ctx.shadowBlur = 0;
            }
            ctx.fill();
            ctx.shadowBlur = 0; // Reset
            
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 3;
            ctx.stroke();
            
            // Barra de progreso y score
            // Arriba: Tiempo restante
            const progress = timeElapsed / GAME_DURATION;
            ctx.fillStyle = '#333';
            ctx.fillRect(0, 0, canvas.width, 10);
            ctx.fillStyle = '#00bcd4';
            ctx.fillRect(0, 0, canvas.width * (1-progress), 10);
            
            // Centro puntuación en vivo
            const percent = Math.round((scoreTime / Math.max(0.1, timeElapsed)) * 100);
            ctx.fillStyle = 'rgba(255,255,255,0.2)';
            ctx.font = '100px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(percent + '%', cx, cy);
            
            // Cursor (solo si no es táctil para debug, o feedback visual donde está el dedo)
            // No dibujar cursor si es desktop (ya se ve), dibujarlo si touch? 
            // Mejor no dibujar nada extra del mouse.
        }
        
        if (gameState === 'result') {
            const finalPercent = Math.round((scoreTime / GAME_DURATION) * 100);
            
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.font = '30px Arial';
            ctx.fillText('Resultado Final', cx, cy - 60);
            
            let c = '#f44336';
            if (finalPercent > 80) c = '#00e676';
            else if (finalPercent > 50) c = '#ffeb3b';
            
            ctx.fillStyle = c;
            ctx.font = 'bold 80px Arial';
            ctx.fillText(finalPercent + '%', cx, cy + 20);
            
            ctx.fillStyle = '#ccc';
            ctx.font = '20px Arial';
            ctx.fillText('Precisión de Rastreo', cx, cy + 60);
            
            // Récord
            const best = parseInt(localStorage.getItem('rutaBest') || '0');
            if (finalPercent > best) {
                localStorage.setItem('rutaBest', finalPercent);
                const n = localStorage.getItem('playerName');
                if (n) localStorage.setItem('rutaBestName', n);
                ctx.fillStyle = '#ff0';
                ctx.fillText('¡NUEVO RÉCORD!', cx, cy - 100);
            }
            
            ctx.fillStyle = '#00bcd4';
            ctx.fillRect(cx - 90, cy + 100, 180, 50);
            ctx.fillStyle = '#000';
            ctx.font = '20px Arial';
            ctx.fillText('REPETIR', cx, cy + 132);
        }
    }
    
    let lastTime = 0;
    function loop(now) {
        if(!lastTime) lastTime = now;
        const dt = (now - lastTime) / 1000;
        lastTime = now;
        
        update(dt);
        draw();
        
        animationFrameId = requestAnimationFrame(loop);
    }
    
    // Listeners
    // Mousedown/Touchstart para menu/retry
    canvas.addEventListener('mousedown', handleStart);
    canvas.addEventListener('touchstart', (e) => {
        // e.preventDefault(); // Puede bloquear scroll
        handleStart(e);
    });
    
    // Mousemove para el juego
    canvas.addEventListener('mousemove', handleMove);
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault(); // Bloquear scroll durante el juego
        handleMove(e);
    }, {passive: false});
    
    loop(0);
    
    return function cleanup() {
        if(animationFrameId) cancelAnimationFrame(animationFrameId);
        canvas.removeEventListener('mousedown', handleStart);
        canvas.removeEventListener('touchstart', handleStart);
        canvas.removeEventListener('mousemove', handleMove);
        canvas.removeEventListener('touchmove', handleMove);
    };
});
