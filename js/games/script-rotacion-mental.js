window.registerGame(function() {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        return () => {};
    }
    const ctx = canvas.getContext('2d');
    
    // Config
    const SHAPE_SIZE = 40;
    
    // State
    let gameState = 'menu'; // menu, playing, result
    let animationFrameId = null;
    let score = 0;
    let rounds = 0;
    const MAX_ROUNDS = 10;
    
    let currentShape = null; // { points: [], color: '' }
    let targetRotation = 0; 
    let options = []; // [{points: [], correct: bool}, ...]
    
    // Shapes definitions (Tetris-like blocks centered at 0,0)
    const shapesLib = [
        // L-shape
        [{x:0,y:0}, {x:0,y:-1}, {x:0,y:1}, {x:1,y:1}], 
        // J-shape
        [{x:0,y:0}, {x:0,y:-1}, {x:0,y:1}, {x:-1,y:1}],
        // T-shape
        [{x:0,y:0}, {x:-1,y:0}, {x:1,y:0}, {x:0,y:1}],
        // S-shape
        [{x:0,y:0}, {x:1,y:0}, {x:0,y:1}, {x:-1,y:1}],
        // Z-shape
        [{x:0,y:0}, {x:-1,y:0}, {x:0,y:1}, {x:1,y:1}],
        // Tripod
        [{x:0,y:0}, {x:0,y:-1}, {x:-1,y:1}, {x:1,y:1}]
    ];
    
    // --- UTILS ---
    function clonePoints(points) {
        return points.map(p => ({...p}));
    }
    
    function rotate90(points) {
        // x' = -y, y' = x
        return points.map(p => ({x: -p.y, y: p.x}));
    }
    
    function mirror(points) {
        // x' = -x
        return points.map(p => ({x: -p.x, y: p.y}));
    }
    
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
        rounds = 0;
        nextRound();
        gameState = 'playing';
    }
    
    function nextRound() {
        if (rounds >= MAX_ROUNDS) {
            endGame();
            return;
        }
        
        rounds++;
        
        // 1. Pick random shape
        const baseShapeIdx = Math.floor(Math.random() * shapesLib.length);
        const baseShape = clonePoints(shapesLib[baseShapeIdx]);
        const color = `hsl(${Math.random()*360}, 70%, 60%)`;
        
        // 2. Prepare Target (Question)
        // Rotate random times
        let rots = Math.floor(Math.random() * 4);
        let questionShape = baseShape;
        for(let i=0; i<rots; i++) questionShape = rotate90(questionShape);
        
        currentShape = { points: questionShape, color: color };
        
        // 3. Prepare Options (3 options)
        options = [];
        
        // Correct Option: Same shape, rotated DIFFERENTLY from question
        // Or same rotation? Usually mental rotation asks to find the match.
        // Let's say: Find the same figure (rotated).
        // To make it tricky, distractors must be MIRROR images (which cannot be obtained by rotation in 2D).
        
        // Correct answer
        let correctRots = (rots + 1 + Math.floor(Math.random() * 3)) % 4; // Ensure valid rotation
        let correctPoints = baseShape;
        for(let i=0; i<correctRots; i++) correctPoints = rotate90(correctPoints);
        
        options.push({ points: correctPoints, correct: true, x:0, y:0, w:100, h:100 });
        
        // Distractors: Mirrored version
        const mirroredBase = mirror(baseShape);
        
        // Distractor 1
        let d1Points = mirroredBase;
        let d1Rots = Math.floor(Math.random() * 4);
        for(let i=0; i<d1Rots; i++) d1Points = rotate90(d1Points);
        options.push({ points: d1Points, correct: false, x:0, y:0, w:100, h:100 });
        
        // Distractor 2 (Another mirror rot OR different shape?)
        // Mirror is best distractor for rotation tasks
        let d2Points = mirroredBase;
        let d2Rots = (d1Rots + 1) % 4;
        for(let i=0; i<d2Rots; i++) d2Points = rotate90(d2Points);
        options.push({ points: d2Points, correct: false, x:0, y:0, w:100, h:100 });
        
        // Shuffle options
        options.sort(() => Math.random() - 0.5);
        
        // Assign positions
        const gap = 20;
        const optW = 100;
        const totalW = (optW * 3) + (gap * 2);
        const startX = (canvas.width - totalW) / 2;
        const optY = 350;
        
        options.forEach((opt, i) => {
            opt.x = startX + i * (optW + gap);
            opt.y = optY;
            opt.w = optW;
            opt.h = optW;
        });
    }
    
    function checkOption(mx, my) {
        for(let opt of options) {
            // Check bounding box + tolerance
            if (mx >= opt.x && mx <= opt.x + opt.w && my >= opt.y && my <= opt.y + opt.h) {
                if (opt.correct) {
                    score++;
                    playSound(true);
                } else {
                    playSound(false);
                }
                
                // Delay for next round? Or immediate?
                // Immediate feels snappier
                setTimeout(nextRound, 200);
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
             osc.type = 'sine';
        } else {
             osc.frequency.setValueAtTime(150, actx.currentTime);
             osc.type = 'sawtooth';
        }
        
        osc.start();
        g.gain.exponentialRampToValueAtTime(0.01, actx.currentTime + 0.1);
        osc.stop(actx.currentTime + 0.1);
    }
    
    function endGame() {
        gameState = 'result';
        const best = parseInt(localStorage.getItem('rotacionMentalBest') || '0');
        if (score > best) {
            localStorage.setItem('rotacionMentalBest', score);
            const n = localStorage.getItem('playerName');
            if (n) localStorage.setItem('rotacionMentalBestName', n);
        }
    }

    function drawShape(ctx, cx, cy, points, color, scale=1) {
        const size = SHAPE_SIZE * scale;
        ctx.fillStyle = color;
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        
        points.forEach(p => {
            ctx.fillRect(cx + p.x*size - size/2, cy + p.y*size - size/2, size, size);
            ctx.strokeRect(cx + p.x*size - size/2, cy + p.y*size - size/2, size, size);
        });
        
        // Center marker
        // ctx.fillStyle = 'red';
        // ctx.fillRect(cx-2, cy-2, 4, 4);
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
            ctx.fillText('🧭 Rotación Mental', cx, 150);
            
            ctx.font = '20px Arial';
            ctx.fillStyle = '#bdc3c7';
            ctx.fillText('Encuentra la figura que es igual a la principal', cx, 200);
            ctx.fillText('(solo está rotada, no reflejada).', cx, 230);
            
            ctx.fillStyle = '#e67e22';
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
            ctx.fillText(`Aciertos: ${score} / ${rounds}`, 20, 40);
            
            // Draw Main Shape
            drawShape(ctx, cx, 150, currentShape.points, currentShape.color, 1.2);
            
            ctx.textAlign = 'center';
            ctx.fillStyle = '#bdc3c7';
            ctx.font = '18px Arial';
            ctx.fillText('¿Cuál de estas es la misma figura?', cx, 250);
            
            // Draw Options
            options.forEach((opt, i) => {
                // Background for option zone
                ctx.fillStyle = 'rgba(255,255,255,0.1)';
                ctx.fillRect(opt.x, opt.y, opt.w, opt.h);
                
                // Draw Shape centered in box
                drawShape(ctx, opt.x + opt.w/2, opt.y + opt.h/2, opt.points, currentShape.color, 0.8);
            });
            
            return;
        }
        
        if (gameState === 'result') {
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.font = '40px Arial';
            ctx.fillText('Fin del Test', cx, 150);
            
            ctx.font = 'bold 80px Arial';
            // Color grade
            let c = '#e74c3c';
            if (score >= 9) c = '#2ecc71';
            else if (score >= 6) c = '#f1c40f';
            
            ctx.fillStyle = c;
            ctx.fillText(`${score}/${MAX_ROUNDS}`, cx, 250);
            
            ctx.fillStyle = '#fff';
            ctx.font = '20px Arial';
            ctx.fillText('Aciertos', cx, 290);
            
            // Best
            const best = localStorage.getItem('rotacionMentalBest') || 0;
            ctx.fillStyle = '#f39c12';
            ctx.fillText(`Mejor Récord: ${best}`, cx, 330);
            
            ctx.fillStyle = '#e67e22';
            ctx.fillRect(cx - 90, 380, 180, 50);
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 24px Arial';
            ctx.fillText('REPETIR', cx, 413);
        }
    }

    function loop() {
        draw();
        animationFrameId = requestAnimationFrame(loop);
    }
    
    canvas.addEventListener('mousedown', handleInput);
    canvas.addEventListener('touchstart', (e)=>{ e.preventDefault(); handleInput(e); });
    
    loop();
    
    return function cleanup() {
        if(animationFrameId) cancelAnimationFrame(animationFrameId);
        canvas.removeEventListener('mousedown', handleInput);
        canvas.removeEventListener('touchstart', handleInput);
    };
});
