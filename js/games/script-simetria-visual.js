window.registerGame(function() {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        return () => {};
    }
    const ctx = canvas.getContext('2d');
    
    // Config
    const TIME_LIMIT = 60;
    
    // State
    let gameState = 'menu'; // menu, playing, result
    let animationFrameId = null;
    let score = 0;
    let timeLeft = TIME_LIMIT;
    
    let gridRows = 4;
    let gridCols = 4; // Total grid size. 
    // We show Left Half (Cols 0, 1). User must complete Right Half (Cols 2, 3) 
    // which is the mirror of Left.
    
    let leftPattern = []; // 2D array or list of filled cells
    let options = []; // Array of pattern objects for the right side
    
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
                if (y > 350 && y < 450) startGame();
            } else {
                startGame();
            }
        } else if (gameState === 'playing') {
            checkOption(x, y);
        }
    }
    
    function startGame() {
        score = 0;
        timeLeft = TIME_LIMIT;
        gameState = 'playing';
        nextRound();
    }
    
    function nextRound() {
        // Difficulty
        gridRows = 4;
        gridCols = 4;
        if (score > 5) { gridRows = 6; gridCols = 6; }
        if (score > 15) { gridRows = 8; gridCols = 8; }
        
        // Generate Left Pattern
        leftPattern = [];
        const halfCols = gridCols / 2;
        
        // Fill random cells (~40%)
        for(let r=0; r<gridRows; r++) {
            let rowP = [];
            for(let c=0; c<halfCols; c++) {
                rowP.push(Math.random() > 0.6 ? 1 : 0);
            }
            leftPattern.push(rowP);
        }
        
        // Ensure at least some cells are filled
        // ... skip for brevity, prob ok
        
        // Create Options for Right Side
        // Correct Option: Mirror of leftPattern
        let correctRight = [];
        for(let r=0; r<gridRows; r++) {
            let rowP = [];
            for(let c=0; c<halfCols; c++) {
                 // Mirror logic: 
                 // Left side col 0 -> Right side col (halfCols-1) ??
                 // Simetria axial vertical en el centro.
                 // Left col (hypothetically 0,1) | Right col (2,3)
                 // Col 1 mirrors to Col 2
                 // Col 0 mirrors to Col 3
                 
                 // If leftPattern[r][c] is the value.
                 // The "right side grid" col 0 corresponds to center-right col. 
                 // So we need to reverse the row of the left pattern?
                 // Left row: [a, b] -> Mirror is [b, a] on the right side.
                 rowP.unshift(leftPattern[r][c]); 
            }
            correctRight.push(rowP);
        }
        
        options = [];
        options.push({ pattern: correctRight, correct: true });
        
        // Distractors
        while (options.length < 3) {
            // Random changes to correct pattern
            let dist = JSON.parse(JSON.stringify(correctRight));
            let changes = Math.floor(Math.random() * 2) + 1; // 1 or 2 flips
            for(let i=0; i<changes; i++) {
                let rr = Math.floor(Math.random() * gridRows);
                let cc = Math.floor(Math.random() * halfCols);
                dist[rr][cc] = 1 - dist[rr][cc];
            }
            options.push({ pattern: dist, correct: false });
        }
        
        // Shuffle
        options.sort(() => Math.random() - 0.5);
        
        // Layout Config
        layoutOptions();
    }
    
    function layoutOptions() {
        // Define where to draw options
        const gap = 20;
        // Calculate max size
        const zoneW = canvas.width;
        const optWidth = (zoneW - gap * 4) / 3;
        const optHeight = optWidth; // Keep square aspect ratio for options? 
        // Need to match grid aspect ratio
        
        const startY = 320;
        const startX = gap;
        
        options.forEach((opt, i) => {
            opt.x = startX + i * (optWidth + gap);
            opt.y = startY;
            opt.w = optWidth;
            opt.h = optWidth; // Approx
        });
    }
    
    function checkOption(mx, my) {
        for(let opt of options) {
            if (mx >= opt.x && mx <= opt.x + opt.w && my >= opt.y && my <= opt.y + opt.h) {
                if (opt.correct) {
                    score++;
                    timeLeft += 2; // Bonus
                    playSound(true);
                } else {
                    timeLeft -= 5;
                    playSound(false);
                }
                nextRound();
                return;
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
             osc.frequency.setValueAtTime(900, actx.currentTime);
             osc.type = 'sine';
        } else {
             osc.frequency.setValueAtTime(150, actx.currentTime);
             osc.type = 'sawtooth';
        }
        
        osc.start();
        g.gain.exponentialRampToValueAtTime(0.01, actx.currentTime + 0.1);
        osc.stop(actx.currentTime + 0.1);
    }

    function drawGrid(ctx, x, y, w, h, pattern, isLeft) {
        const rows = pattern.length;
        const cols = pattern[0].length;
        const cellW = w / cols;
        const cellH = h / rows;
        
        ctx.strokeStyle = '#555';
        ctx.lineWidth = 1;
        
        // Background
        ctx.fillStyle = '#222';
        ctx.fillRect(x, y, w, h);
        
        for(let r=0; r<rows; r++) {
            for(let c=0; c<cols; c++) {
                const px = x + c * cellW;
                const py = y + r * cellH;
                
                ctx.strokeRect(px, py, cellW, cellH);
                
                if (pattern[r][c] === 1) {
                    ctx.fillStyle = '#0984e3';
                    ctx.fillRect(px + 2, py + 2, cellW - 4, cellH - 4);
                }
            }
        }
        
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(x,y,w,h);
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
            ctx.fillText('🔄 Simetría Visual', cx, 150);
            
            ctx.font = '20px Arial';
            ctx.fillStyle = '#bdc3c7';
            ctx.fillText('Selecciona la pieza que completa', cx, 200);
            ctx.fillText('la simetría perfecta.', cx, 230);
            
            ctx.fillStyle = '#0984e3';
            ctx.fillRect(cx - 90, 300, 180, 50);
            ctx.fillStyle = '#fff';
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
            const timeCol = timeLeft < 10 ? '#e74c3c' : '#fff';
            ctx.fillStyle = timeCol;
            ctx.fillText(`Tiempo: ${Math.ceil(timeLeft)}`, canvas.width - 20, 40);
            
            // Draw Main Problem area
            const mainH = 200;
            const mainW = mainH * (gridCols / gridRows); // Keep cell aspect ratio 1:1 if possible
            const halfW = mainW / 2;
            
            const startY = 80;
            const startX = cx - halfW; // Start of Left side, so center is met at cx
            
            // Draw Left Pattern
            drawGrid(ctx, startX, startY, halfW, mainH, leftPattern, true);
            
            // Draw "Problem" right side (Empty or question mark)
            ctx.fillStyle = '#333';
            ctx.fillRect(cx, startY, halfW, mainH);
            ctx.strokeStyle = '#fff';
            ctx.strokeRect(cx, startY, halfW, mainH);
            
            ctx.fillStyle = '#555';
            ctx.textAlign = 'center';
            ctx.font = '50px Arial';
            ctx.fillText('?', cx + halfW/2, startY + mainH/2 + 20);
            
            // Center Axis Line
            ctx.strokeStyle = '#fdcb6e'; // Gold axis
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(cx, startY - 10);
            ctx.lineTo(cx, startY + mainH + 10);
            ctx.stroke();
            
            // Draw Options
            options.forEach(opt => {
                drawGrid(ctx, opt.x, opt.y, opt.w, opt.h, opt.pattern, false);
            });
            
            return;
        }
        
        if (gameState === 'result') {
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.font = '40px Arial';
            ctx.fillText('Tiempo Agotado', cx, 150);
            
            ctx.font = 'bold 80px Arial';
            ctx.fillStyle = '#0984e3';
            ctx.fillText(score, cx, 250);
            
            ctx.fillStyle = '#fff';
            ctx.font = '20px Arial';
            ctx.fillText('Figuras completadas', cx, 290);
            
            const best = localStorage.getItem('simetriaBest') || 0;
            ctx.fillStyle = '#fdcb6e';
            ctx.fillText(`Récord Personal: ${best}`, cx, 330);
            
            ctx.fillStyle = '#0984e3';
            ctx.fillRect(cx - 90, 380, 180, 50);
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 24px Arial';
            ctx.fillText('REPETIR', cx, 413);
        }
    }
    
    function loop(now) {
        if(!lastTime) lastTime = now;
        const dt = (now - lastTime)/1000;
        lastTime = now;
        
        if(gameState==='playing') {
            timeLeft -= dt;
            if(timeLeft<=0) endGame();
        }
        
        draw();
        animationFrameId = requestAnimationFrame(loop);
    }
    
    function endGame() {
        timeLeft = 0;
        gameState = 'result';
        const best = parseInt(localStorage.getItem('simetriaBest') || '0');
        if (score > best) {
            localStorage.setItem('simetriaBest', score);
            const n = localStorage.getItem('playerName');
            if (n) localStorage.setItem('simetriaBestName', n);
        }
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
});
