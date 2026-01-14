window.registerGame = function() {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        return () => {};
    }
    const ctx = canvas.getContext('2d');
    
    // Config
    const TARGET_WIDTH_PERCENT = 0.05; // 5% width is the 'bullseye'
    const BAR_WIDTH_PERCENT = 0.02;     // Cursor width
    const MAX_ROUNDS = 5;
    
    // State
    let gameState = 'menu'; // menu, playing, result
    let animationFrameId = null;
    let rounds = 0;
    let totalScore = 0; // sum of differences? or sum of points 0-100? Let's use 0-100 precision.
    let scores = [];
    
    let cursorPos = 0; // 0.0 to 1.0
    let cursorSpeed = 0.5; // screen widths per second
    let direction = 1;
    let isMoving = true;
    
    // Feedback
    let lastResult = null; // {score: 0, text: '', color: ''}
    let feedbackTimer = 0;

    // --- INPUT ---
    function handleInput(e) {
        if (gameState === 'menu' || gameState === 'result') {
            const rect = canvas.getBoundingClientRect();
            let cy = e.clientY;
            if(e.changedTouches) cy = e.changedTouches[0].clientY;
            
            // Check vertical pos for result retry button?
            // Simple generic click to start
             // Check y pos for retry button if in result
             if (gameState === 'result') {
                 // rough check
                 startGame();
             } else {
                 startGame();
             }
        } else if (gameState === 'playing') {
            if (isMoving) {
                stopCursor();
            } else {
                // If stopped, click to next round
                nextRound();
            }
        }
    }
    
    function startGame() {
        rounds = 0;
        scores = [];
        totalScore = 0;
        startRound();
    }
    
    function startRound() {
        if (rounds >= MAX_ROUNDS) {
            endGame();
            return;
        }
        
        gameState = 'playing';
        isMoving = true;
        cursorPos = 0;
        direction = 1;
        
        // Randomize speed slightly
        cursorSpeed = 0.5 + Math.random() * 0.8; 
        
        // Randomize starting direction?
        if (Math.random() > 0.5) {
            cursorPos = 1;
            direction = -1;
        }
    }
    
    function stopCursor() {
        isMoving = false;
        
        // Calculate precision
        // Center is 0.5
        const diff = Math.abs(cursorPos - 0.5);
        // Max diff is 0.5.
        // We want score 0-100.
        // Perfect is diff < TARGET_WIDTH_PERCENT/2 roughly
        
        // Linear drop off?
        // Let's make it sharp.
        let points = 0;
        
        if (diff < 0.01) points = 100; // Super precise
        else if (diff < 0.05) {
            // 0.01 -> 100, 0.06 -> 50 approx
            points = Math.round(100 - (diff - 0.01) * 1200); 
            // example: diff 0.04 -> 100 - 0.03*1200 = 100 - 36 = 64
        } else if (diff < 0.2) {
            points = Math.round(50 - (diff - 0.05) * 200);
        } else {
            points = 0;
        }
        if (points < 0) points = 0;
        
        scores.push(points);
        totalScore += points;
        
        // Feedback
        let txt = 'MAL';
        let col = '#e74c3c';
        
        if (points === 100) { txt = '¡PERFECTO!'; col = '#00e676'; }
        else if (points >= 80) { txt = 'EXCELENTE'; col = '#2ecc71'; }
        else if (points >= 50) { txt = 'BIEN'; col = '#f1c40f'; }
        else if (points >= 1) { txt = 'REGULAR'; col = '#f39c12'; }
        
        lastResult = { score: points, text: txt, color: col };
        rounds++;
        
        playSound(points);
    }
    
    function nextRound() {
        if (rounds >= MAX_ROUNDS) {
            endGame();
        } else {
            startRound();
        }
    }
    
    function playSound(points) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctxAudio = new AudioContext();
        const osc = ctxAudio.createOscillator();
        const gain = ctxAudio.createGain();
        osc.connect(gain);
        gain.connect(ctxAudio.destination);
        
        if (points >= 90) {
            osc.frequency.setValueAtTime(600, ctxAudio.currentTime);
            osc.frequency.exponentialRampToValueAtTime(1200, ctxAudio.currentTime + 0.1);
            osc.type = 'sine';
        } else if (points >= 50) {
            osc.frequency.setValueAtTime(400, ctxAudio.currentTime);
            osc.type = 'triangle';
        } else {
            osc.frequency.setValueAtTime(200, ctxAudio.currentTime);
            osc.frequency.linearRampToValueAtTime(100, ctxAudio.currentTime + 0.1);
            osc.type = 'sawtooth';
        }
        
        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.01, ctxAudio.currentTime + 0.15);
        osc.stop(ctxAudio.currentTime + 0.15);
    }
    
    function endGame() {
        gameState = 'result';
        const finalAvg = Math.round(totalScore / MAX_ROUNDS);
        
        const best = parseInt(localStorage.getItem('ajustePrecisoBest') || '0');
        if (finalAvg > best) {
            localStorage.setItem('ajustePrecisoBest', finalAvg);
            const n = localStorage.getItem('playerName');
            if (n) localStorage.setItem('ajustePrecisoBestName', n);
        }
    }
    
    function update(dt) {
        if (gameState === 'playing' && isMoving) {
            cursorPos += cursorSpeed * direction * dt;
            
            // Bounce
            if (cursorPos >= 1) {
                cursorPos = 1;
                direction = -1;
            } else if (cursorPos <= 0) {
                cursorPos = 0;
                direction = 1;
            }
        }
    }
    
    function draw() {
        // BG
        ctx.fillStyle = '#222';
        ctx.fillRect(0,0, canvas.width, canvas.height);
        
        const cx = canvas.width/2;
        const cy = canvas.height/2; 
        
        if (gameState === 'menu') {
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.font = '36px Arial';
            ctx.fillText('📏 Ajuste Preciso', cx, 150);
            
            ctx.font = '20px Arial';
            ctx.fillStyle = '#ccc';
            ctx.fillText('Detén la barra exactamente', cx, 200);
            ctx.fillText('en la marca central.', cx, 230);
            
            ctx.fillStyle = '#e056fd';
            ctx.fillRect(cx - 90, 300, 180, 50);
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 24px Arial';
            ctx.fillText('EMPEZAR', cx, 333);
            return;
        }
        
        if (gameState === 'playing') {
            const barY = cy;
            const barH = 40;
            const trackW = canvas.width - 100;
            const startX = 50;
            
            // Track
            ctx.fillStyle = '#333';
            ctx.fillRect(startX, barY - barH/2, trackW, barH);
            
            // Center Mark (Target)
            ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
            const targetW = trackW * TARGET_WIDTH_PERCENT;
            ctx.fillRect(startX + trackW/2 - targetW/2, barY - barH/2, targetW, barH);
            
            ctx.fillStyle = '#0f0';
            ctx.fillRect(startX + trackW/2 - 1, barY - barH/2 - 10, 2, barH + 20); // Center line
            
            // Moving Cursor
            ctx.fillStyle = '#e056fd'; // Bright purple
            const cursorW = trackW * BAR_WIDTH_PERCENT;
            const cursorX = startX + (cursorPos * trackW) - cursorW/2;
            ctx.fillRect(cursorX, barY - barH/2 - 5, cursorW, barH + 10);
            
            // Score info
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.font = '24px Arial';
            ctx.fillText(`Ronda ${Math.min(rounds+1, MAX_ROUNDS)} / ${MAX_ROUNDS}`, cx, 100);
            
            if (!isMoving) {
                // Show result of this tap
                ctx.fillStyle = lastResult.color;
                ctx.font = 'bold 40px Arial';
                ctx.fillText(lastResult.text, cx, cy + 80);
                
                ctx.fillStyle = '#fff';
                ctx.font = '20px Arial';
                ctx.fillText(`Precisión: ${lastResult.score}%`, cx, cy + 120);
                
                if (rounds < MAX_ROUNDS) {
                    ctx.fillStyle = '#aaa';
                    ctx.font = '16px Arial';
                    ctx.fillText('Toca para continuar', cx, cy + 160);
                }
            }
            return;
        }
        
        if (gameState === 'result') {
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.font = '40px Arial';
            ctx.fillText('Resultado Final', cx, 150);
            
            const avg = Math.round(totalScore / MAX_ROUNDS);
            
            ctx.font = 'bold 80px Arial';
            // Color grade
            let c = '#e74c3c';
            if (avg >= 90) c = '#00e676';
            else if (avg >= 70) c = '#f1c40f';
            
            ctx.fillStyle = c;
            ctx.fillText(`${avg}%`, cx, 250);
            
            ctx.fillStyle = '#fff';
            ctx.font = '20px Arial';
            ctx.fillText('Precisión Media', cx, 290);
            
            const best = localStorage.getItem('ajustePrecisoBest') || 0;
            ctx.fillStyle = '#ccc';
            ctx.fillText(`Récord Personal: ${best}%`, cx, 330);
            
            ctx.fillStyle = '#e056fd';
            ctx.fillRect(cx - 90, 380, 180, 50);
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 24px Arial';
            ctx.fillText('REPETIR', cx, 413);
        }
    }
    
    function loop(now) {
        if(!lastTime) lastTime = now;
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
