window.registerGame = function() {
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
    
    let currentProblem = { str: '', ans: 0 };
    let options = []; // [{val: 12, correct: true, x,y,w,h}]
    
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
        nextProblem();
    }
    
    function nextProblem() {
        // Difficulty scaler
        // 0-10 pts: +, - with numbers < 20
        // 10-25 pts: +, -, * with < 50
        // > 25 pts: +, -, *, / with < 100
        
        let operations = ['+', '-'];
        let maxVal = 20;
        
        if (score > 10) { operations.push('*'); maxVal = 12; } // Multipliers smaller
        if (score > 25) { operations.push('/'); maxVal = 20; }
        if (score > 40) { maxVal = 50; }
        
        const op = operations[Math.floor(Math.random() * operations.length)];
        let a = Math.floor(Math.random() * maxVal) + 1;
        let b = Math.floor(Math.random() * maxVal) + 1;
        let ans = 0;
        
        // Ensure clean division and avoid negatives for simplicity if desired
        // Actually negatives are fine for math test, but avoid fractions
        
        if (op === '/') {
            ans = a; // result is a smallish number
            a = ans * b; // dividend is product
            // e.g. 5 = 20 / 4
        } else if (op === '-') {
            if (a < b) { const t=a; a=b; b=t; } // Ensure positive result
            ans = a - b;
        } else if (op === '*') {
            ans = a * b;
        } else {
            ans = a + b;
        }
        
        let opSymbol = op;
        if (op === '*') opSymbol = '×';
        if (op === '/') opSymbol = '÷';
        
        currentProblem = { str: `${a} ${opSymbol} ${b}`, ans: ans };
        
        generateOptions(ans);
    }
    
    function generateOptions(ans) {
        options = [];
        // Add correct
        options.push({ val: ans, correct: true });
        
        // Add 3 distractors
        while(options.length < 4) {
            // Generate distinct wrong answer close to real one
            let offset = Math.floor(Math.random() * 10) - 5; // -5 to +5
            if (offset === 0) offset = 1;
            let val = ans + offset;
            
            // Avoid duplicates
            if (!options.find(o => o.val === val)) {
                options.push({ val: val, correct: false });
            }
        }
        
        // Shuffle
        options.sort(() => Math.random() - 0.5);
        
        // Layout 2x2 grid
        const centerX = canvas.width/2;
        const startY = 250;
        const gap = 20;
        const w = 180;
        const h = 80;
        
        // Positions: 
        // 0: top-left, 1: top-right, 2: bot-left, 3: bot-right
        const positions = [
            {x: centerX - w - gap/2, y: startY},
            {x: centerX + gap/2, y: startY},
            {x: centerX - w - gap/2, y: startY + h + gap},
            {x: centerX + gap/2, y: startY + h + gap}
        ];
        
        options.forEach((opt, i) => {
            opt.x = positions[i].x;
            opt.y = positions[i].y;
            opt.w = w;
            opt.h = h;
        });
    }
    
    function checkOption(mx, my) {
        for(let opt of options) {
            if (mx >= opt.x && mx <= opt.x + opt.w && my >= opt.y && my <= opt.y + opt.h) {
                if (opt.correct) {
                    score++;
                    playSound(true);
                    // Time bonus? Maybe +0.5s?
                    timeLeft += 0.5;
                } else {
                    // Penalty
                    timeLeft -= 3;
                    playSound(false);
                }
                nextProblem();
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
             osc.frequency.setValueAtTime(800, actx.currentTime);
             osc.frequency.linearRampToValueAtTime(1200, actx.currentTime + 0.1);
             osc.type = 'sine';
        } else {
             osc.frequency.setValueAtTime(200, actx.currentTime);
             osc.frequency.linearRampToValueAtTime(100, actx.currentTime + 0.1);
             osc.type = 'sawtooth';
        }
        
        osc.start();
        g.gain.exponentialRampToValueAtTime(0.01, actx.currentTime + 0.1);
        osc.stop(actx.currentTime + 0.1);
    }
    
    function endGame() {
        gameState = 'result';
        const best = parseInt(localStorage.getItem('calculoRapidoBest') || '0');
        if (score > best) {
            localStorage.setItem('calculoRapidoBest', score);
            const n = localStorage.getItem('playerName');
            if (n) localStorage.setItem('calculoRapidoBestName', n);
        }
    }
    
    function update(dt) {
        if (gameState === 'playing') {
            timeLeft -= dt;
            if (timeLeft <= 0) {
                timeLeft = 0;
                endGame();
            }
        }
    }
    
    function draw() {
        // BG
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(0,0, canvas.width, canvas.height);
        
        const cx = canvas.width/2;
        
        if (gameState === 'menu') {
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.font = '36px Arial';
            ctx.fillText('🧮 Cálculo Rápido', cx, 150);
            
            ctx.font = '20px Arial';
            ctx.fillStyle = '#bdc3c7';
            ctx.fillText('Resuelve tantas operaciones como puedas', cx, 200);
            ctx.fillText('antes de que se agote el tiempo.', cx, 230);
            
            ctx.fillStyle = '#27ae60';
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
            
            // Problem
            ctx.textAlign = 'center';
            ctx.font = 'bold 80px Arial';
            ctx.fillStyle = '#fff';
            ctx.fillText(currentProblem.str, cx, 180);
            
            // Options
            ctx.font = 'bold 30px Arial';
            options.forEach(opt => {
                ctx.fillStyle = '#34495e';
                ctx.fillRect(opt.x, opt.y, opt.w, opt.h);
                
                // Text
                ctx.fillStyle = '#ecf0f1';
                ctx.fillText(opt.val, opt.x + opt.w/2, opt.y + opt.h/2 + 10);
            });
            return;
        }
        
        if (gameState === 'result') {
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.font = '40px Arial';
            ctx.fillText('¡Tiempo!', cx, 150);
            
            ctx.font = 'bold 80px Arial';
            ctx.fillStyle = '#27ae60';
            ctx.fillText(score, cx, 250);
            
            ctx.fillStyle = '#fff';
            ctx.font = '20px Arial';
            ctx.fillText('Operaciones correctas', cx, 290);
            
            const best = localStorage.getItem('calculoRapidoBest') || 0;
            ctx.fillStyle = '#f39c12';
            ctx.fillText(`Mejor Récord: ${best}`, cx, 330);
            
            ctx.fillStyle = '#27ae60';
            ctx.fillRect(cx - 90, 380, 180, 50);
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 24px Arial';
            ctx.fillText('REPETIR', cx, 413);
        }
    }
    
    function loop(now) {
        if (!lastTime) lastTime = now;
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
