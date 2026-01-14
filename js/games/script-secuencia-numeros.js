window.registerGame(function() {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        console.error('Canvas gameCanvas no encontrado');
        return () => {};
    }
    const ctx = canvas.getContext('2d');
    
    // Estados
    let gameState = 'menu'; // menu, memorize, input, result, wrong
    let animationFrameId = null;
    
    // Lógica del juego
    let sequence = [];
    let inputSequence = [];
    let startDigits = 3;
    let currentDigits = 3;
    let showTime = 2000; // ms iniciales
    let memorizeStartTime = 0;
    
    // UI
    let feedback = '';
    
    // --- INPUT ---
    function handleInput(e) {
        if (e.target.tagName !== 'BUTTON') {
             // e.preventDefault();
        }
        
        const rect = canvas.getBoundingClientRect();
        let clientX, clientY;
        if (e.changedTouches) {
            clientX = e.changedTouches[0].clientX;
            clientY = e.changedTouches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }
        
        // Escalar
        const x = (clientX - rect.left) * (canvas.width / rect.width);
        const y = (clientY - rect.top) * (canvas.height / rect.height);
        
        if (gameState === 'menu' || gameState === 'result') {
            if (gameState === 'result') {
                 // Check retry button area
                 if (y > canvas.height/2 + 50 && y < canvas.height/2 + 120) {
                     startGame();
                 }
            } else {
                startGame();
            }
        } else if (gameState === 'input') {
            // Detectar clicks en teclado numérico virtual
            checkKeypad(x, y);
        }
    }
    
    function startGame() {
        currentDigits = startDigits;
        sequence = [];
        startRound();
    }
    
    function startRound() {
        // Generar secuencia
        sequence = [];
        // Evitar ceros a la izquierda? No importa.
        for(let i=0; i<currentDigits; i++) {
            sequence.push(Math.floor(Math.random() * 10));
        }
        
        inputSequence = [];
        gameState = 'memorize';
        memorizeStartTime = performance.now();
        // Tiempo de muestra: base 1.5s + 0.5s por digito adicional sobre 3?
        // O fijo rápido para dificultad?
        // Vamos a hacerlo: 1000ms + (digits * 500ms)
        showTime = 1000 + (currentDigits * 400); 
    }
    
    // Keypad layout
    const keys = [
        {val:1, x:0, y:0}, {val:2, x:1, y:0}, {val:3, x:2, y:0},
        {val:4, x:0, y:1}, {val:5, x:1, y:1}, {val:6, x:2, y:1},
        {val:7, x:0, y:2}, {val:8, x:1, y:2}, {val:9, x:2, y:2},
        {val:0, x:1, y:3}, {val:'DEL', x:0, y:3}, {val:'OK', x:2, y:3}
    ];
    
    const kw = 80; // width key
    const kh = 60;
    const gap = 10;
    const kStartX = (canvas.width - (3*kw + 2*gap))/2 + kw/2; // Center X offset
    const kStartY = 250; 
    
    function checkKeypad(mx, my) {
        // Calcular posición base
        const startX = (canvas.width - (3*kw + 2*gap))/2;
        
        for(let k of keys) {
            let kx = startX + k.x * (kw + gap);
            let ky = kStartY + k.y * (kh + gap);
            
            if (mx >= kx && mx <= kx + kw && my >= ky && my <= ky + kh) {
                keyPress(k.val);
                return;
            }
        }
    }
    
    function keyPress(val) {
        if (val === 'DEL') {
            inputSequence.pop();
        } else if (val === 'OK') {
            checkSequence();
        } else {
            if (inputSequence.length < sequence.length) {
                inputSequence.push(val);
                // Auto-check si longitud completa?
                // Mejor dejar al usuario dar OK para que revise, 
                // pero si rellenó todo, podría ser auto. 
                // "Estilo simon" suele ser inmediato. Vamos a hacerlo inmediato al completar longitud.
                if (inputSequence.length === sequence.length) {
                    checkSequence();
                }
            }
        }
    }
    
    function checkSequence() {
        let correct = true;
        if (inputSequence.length !== sequence.length) correct = false;
        else {
            for(let i=0; i<sequence.length; i++) {
                if(sequence[i] !== inputSequence[i]) {
                    correct = false;
                    break;
                }
            }
        }
        
        if (correct) {
            feedback = '¡CORRECTO!';
            // Próxima ronda breve delay
            gameState = 'feedback';
            setTimeout(() => {
                currentDigits++;
                startRound();
            }, 1000);
        } else {
            feedback = 'INCORRECTO';
            gameState = 'result';
            
            // Guardar Score (max digitos superados = currentDigits - 1)
            // O actual si fallaste este nivel
            const score = currentDigits - 1;
            const best = parseInt(localStorage.getItem('secuenciaNumBest') || '0');
            if (score > best) {
                localStorage.setItem('secuenciaNumBest', score);
                const n = localStorage.getItem('playerName');
                if (n) localStorage.setItem('secuenciaNumBestName', n);
            }
        }
    }

    function update(dt) {
        if (gameState === 'memorize') {
            if (performance.now() - memorizeStartTime > showTime) {
                gameState = 'input';
            }
        }
    }

    function draw() {
        // BG
        ctx.fillStyle = '#1e272e';
        ctx.fillRect(0,0, canvas.width, canvas.height);
        
        const cx = canvas.width/2;
        
        if (gameState === 'menu') {
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.font = '36px Arial';
            ctx.fillText('🔢 Secuencia Numérica', cx, 150);
            
            ctx.font = '20px Arial';
            ctx.fillStyle = '#ccc';
            ctx.fillText('Memoriza los números que aparecen', cx, 200);
            ctx.fillText('y repítelos en orden.', cx, 230);
            
            ctx.fillStyle = '#0fbcf9';
            ctx.fillRect(cx - 90, 300, 180, 50);
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 24px Arial';
            ctx.fillText('JUGAR', cx, 333);
            return;
        }
        
        if (gameState === 'memorize') {
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.font = '24px Arial';
            ctx.fillText(`Memoriza (${currentDigits} dígitos)`, cx, 100);
            
            // Barra tiempo
            const timeLeft = Math.max(0, showTime - (performance.now() - memorizeStartTime));
            const pct = timeLeft / showTime;
            ctx.fillStyle = '#444';
            ctx.fillRect(cx - 150, 120, 300, 10);
            ctx.fillStyle = '#0fbcf9';
            ctx.fillRect(cx - 150, 120, 300 * pct, 10);
            
            // Números grandes
            ctx.font = 'bold 80px Arial';
            ctx.fillStyle = '#fff';
            // Mostrar secuencia con espacios
            ctx.fillText(sequence.join(' '), cx, canvas.height/2);
            return;
        }
        
        if (gameState === 'input' || gameState === 'feedback') {
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.font = '24px Arial';
            const msg = (gameState === 'feedback') ? feedback : 'Repite la secuencia';
            ctx.fillText(msg, cx, 80);
            
            // Display input
            ctx.font = 'bold 40px monospace';
            ctx.fillStyle = '#0fbcf9';
            // Placeholder hints
            let displayStr = '';
            for(let i=0; i<sequence.length; i++) {
                if (i < inputSequence.length) displayStr += inputSequence[i] + ' ';
                else displayStr += '_ ';
            }
            ctx.fillText(displayStr, cx, 150);
            
            // Draw Keypad
            if (gameState === 'input') {
                const startX = (canvas.width - (3*kw + 2*gap))/2;
                ctx.font = '24px Arial';
                
                for(let k of keys) {
                    let kx = startX + k.x * (kw + gap);
                    let ky = kStartY + k.y * (kh + gap);
                    
                    ctx.fillStyle = '#333';
                    ctx.fillRect(kx, ky, kw, kh);
                    ctx.fillStyle = '#555'; // Border effect
                    ctx.fillRect(kx, ky + kh - 4, kw, 4);
                    
                    ctx.fillStyle = '#fff';
                    // Center text in rect
                    
                    if (k.val === 'DEL') ctx.fillStyle = '#ff5e57';
                    if (k.val === 'OK') ctx.fillStyle = '#00d2d3';
                    
                    ctx.fillText(k.val, kx + kw/2, ky + kh/2 + 8);
                }
            }
            return;
        }
        
        if (gameState === 'result') {
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.font = '40px Arial';
            ctx.fillText('Fin del Juego', cx, 150);
            
            ctx.font = '20px Arial';
            ctx.fillStyle = '#ccc';
            ctx.fillText('Fallaste en la secuencia:', cx, 200);
            
            ctx.font = '30px monospace';
            ctx.fillStyle = '#ff5e57';
            ctx.fillText(sequence.join(' '), cx, 250);
            
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 24px Arial';
            ctx.fillText('Nivel alcanzado: ' + (currentDigits - 1), cx, 320);
            
            // Botón Retry
            ctx.fillStyle = '#0fbcf9';
            ctx.fillRect(cx - 90, 360, 180, 50);
            ctx.fillStyle = '#fff';
            ctx.fillText('REINTENTAR', cx, 393);
        }
    }
    
    function loop(now) {
        update((now - lastTime)/1000);
        lastTime = now;
        draw();
        animationFrameId = requestAnimationFrame(loop);
    }
    let lastTime = 0;
    
    // Listeners
    canvas.addEventListener('mousedown', handleInput);
    canvas.addEventListener('touchstart', (e)=>{ e.preventDefault(); handleInput(e); });
    
    loop(0);
    
    return function cleanup() {
        if(animationFrameId) cancelAnimationFrame(animationFrameId);
        canvas.removeEventListener('mousedown', handleInput);
        canvas.removeEventListener('touchstart', handleInput);
    };
});
