window.registerGame = function() {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        console.error('Canvas gameCanvas no encontrado');
        return () => {};
    }
    const ctx = canvas.getContext('2d');

    // Estado
    let gameState = 'menu'; // menu, playing, result
    let animationFrameId = null;
    let scores = [];
    let currentBeatIndex = 0;
    const totalBeats = 10;
    let bpm = 60; 
    let msPerBeat = 1000;
    
    let nextBeatTime = 0;
    let lastTapTime = 0;
    let startTime = 0;
    
    let feedback = '';
    let feedbackColor = '#fff';
    let feedbackTimer = 0;
    
    let audioCtx = null;

    // --- AUDIO ---
    function initAudio() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    function playBeep(freq = 440, type = 'sine') {
        if (!audioCtx) return;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.value = freq;
        osc.type = type;
        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
        osc.stop(audioCtx.currentTime + 0.1);
    }
    
    // --- INPUT ---
    function handleInput(e) {
        if (e.target.tagName !== 'BUTTON') {
            // e.preventDefault();
        }
        
        if (gameState === 'menu') {
            initAudio();
            startGame();
        } else if (gameState === 'playing') {
            registerTap();
        } else if (gameState === 'result') {
            startGame();
        }
    }
    
    // --- LOGICA ---
    function startGame() {
        gameState = 'playing';
        scores = [];
        currentBeatIndex = 0;
        bpm = 60 + Math.floor(Math.random() * 40); // 60-100 BPM
        msPerBeat = 60000 / bpm;
        
        // Empezamos en breve
        startTime = performance.now() + 2000;
        
        // Generamos la secuencia de tiempos esperados
        // No almacenamos todos, calculamos el siguiente dinamicamente
        nextBeatTime = startTime;
    }
    
    function registerTap() {
        // El usuario pulsa intentando coincidir con el beat actual o el siguiente
        // Determinamos a qué beat se refiere (al más cercano)
        const now = performance.now();
        
        if (now < startTime - msPerBeat/2) return; // Ignorar taps muy tempranos
        
        // Distancia al beat actual (que acaba de sonar o va a sonar)
        // nextBeatTime es el tiempo del *próximo* beep que NO ha sonado aun?
        // En el loop visual/sonoro:
        // Si estamos en t, y el beat suena en t_beat.
        
        // Simplificación:
        // El juego emite un sonido. El usuario debe pulsar SINCRONIZADO.
        // Medimos error respecto al beat más cercano.
        
        // Calcular el beat más cercano en el tiempo
        // (now - startTime) / msPerBeat
        const beatFloat = (now - startTime) / msPerBeat;
        const closestBeatIndex = Math.round(beatFloat);
        const closestBeatTime = startTime + (closestBeatIndex * msPerBeat);
        
        const diff = now - closestBeatTime; // + tarde, - temprano
        
        // Solo registrar un tap por beat index
        // Pero el usuario puede equivocarse.
        // Vamos a registrar taps y asignarlos al index.
        
        // Simplificado: Solo cuenta si está dentro de un rango razonable (+- 300ms)
        if (Math.abs(diff) < 400) {
            const quality = Math.abs(diff);
            let score = 0;
            // < 20ms: Perfect (100)
            // < 50ms: Great (80)
            // < 100ms: Good (50)
            // else: Bad (0)
            
            if (quality < 25) {
                score = 100;
                feedback = '¡PERFECTO!';
                feedbackColor = '#0f0';
            } else if (quality < 60) {
                score = 80;
                feedback = 'BIEN';
                feedbackColor = '#ff0';
            } else if (quality < 150) {
                score = 40;
                feedback = 'REGULAR';
                feedbackColor = '#f90';
            } else {
                score = 10;
                feedback = 'MAL';
                feedbackColor = '#f00';
            }
            
            scores.push(score);
            feedbackTimer = 0.5;
            
            // Si llegamos acumulamos los beats requeridos
            if (scores.length >= totalBeats) {
                endGame();
            }
        }
    }
    
    function endGame() {
        gameState = 'result';
    }
    
    function update(dt) {
        if (gameState === 'playing') {
            const now = performance.now();
            
            // Gestión del audio mudo/rítmico
            // Solo tocar beats hasta cumplir el total (+ un margen para que no pare en seco)
            if (scores.length < totalBeats) {
                 if (now >= nextBeatTime) {
                     playBeep(440);
                     // Efecto visual de "pulso"
                     pulseAnim = 1.0; 
                     nextBeatTime += msPerBeat;
                 }
            }
            
            if (feedbackTimer > 0) feedbackTimer -= dt;
            if (pulseAnim > 0) pulseAnim -= dt * 5;
        }
    }
    
    let pulseAnim = 0;
    
    function draw() {
        // Fondo
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0,0,canvas.width, canvas.height);
        
        const cx = canvas.width/2;
        const cy = canvas.height/2;
        
        if (gameState === 'menu') {
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.font = '30px Arial';
            ctx.fillText('🔊 Sincronización', cx, cy - 60);
            ctx.fillText('de Ritmo', cx, cy - 20);
            
            ctx.font = '18px Arial';
            ctx.fillStyle = '#aaa';
            ctx.fillText('Escucha el metrónomo y pulsa la pantalla', cx, cy + 30);
            ctx.fillText('exactamente cuando escuches el "BEEP"', cx, cy + 55);
            
            ctx.fillStyle = '#e91e63';
            ctx.fillRect(cx - 80, cy + 90, 160, 50);
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 20px Arial';
            ctx.fillText('EMPEZAR', cx, cy + 122);
            return;
        }
        
        if (gameState === 'playing') {
            // Visualizador del beat
            const radius = 50 + (pulseAnim * 30);
            
            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, Math.PI*2);
            ctx.fillStyle = `rgba(233, 30, 99, ${0.5 + pulseAnim/2})`;
            ctx.fill();
            
            // Feedback texto
            if (feedbackTimer > 0) {
                ctx.globalAlpha = Math.min(1, feedbackTimer * 2);
                ctx.fillStyle = feedbackColor;
                ctx.textAlign = 'center';
                ctx.font = 'bold 40px Arial';
                ctx.fillText(feedback, cx, cy - 100);
                
                // Mostrar ms
                // ctx.font = '20px Arial';
                // ctx.fillText(lastTapDiff + 'ms', cx, cy - 70);
                
                ctx.globalAlpha = 1;
            }
            
            // Progreso
            ctx.fillStyle = '#fff';
            ctx.font = '20px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`Beats: ${scores.length} / ${totalBeats}`, cx, cy + 120);
            
            // "PULSA"
            ctx.fillStyle = '#666';
            ctx.font = '16px monospace';
            ctx.fillText('TOCA AL RITMO', cx, cy + 150);
        }
        
        if (gameState === 'result') {
            // Calcular media
            let sum = 0;
            scores.forEach(s => sum+=s);
            let avg = scores.length ? Math.round(sum/scores.length) : 0;
            
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.font = '30px Arial';
            ctx.fillText('Resultado', cx, cy - 60);
            
            let c = '#f00';
            if (avg >= 80) c = '#0f0';
            else if (avg >= 50) c = '#ff0';
            
            ctx.fillStyle = c;
            ctx.font = 'bold 80px Arial';
            ctx.fillText(avg + '%', cx, cy + 20);
            
            ctx.fillStyle = '#fff';
            ctx.font = '20px Arial';
            ctx.fillText('Sincronización Media', cx, cy + 60);
            
            // Guardar récord
            const best = parseInt(localStorage.getItem('ritmoBest') || '0');
            if (avg > best) {
                localStorage.setItem('ritmoBest', avg);
                const n = localStorage.getItem('playerName');
                if (n) localStorage.setItem('ritmoBestName', n);
                ctx.fillStyle = '#ff0';
                ctx.fillText('¡NUEVO RÉCORD!', cx, cy - 100);
            }
            
            ctx.fillStyle = '#e91e63';
            ctx.fillRect(cx - 90, cy + 100, 180, 50);
            ctx.fillStyle = '#fff';
            ctx.fillText('REPETIR', cx, cy + 132);
        }
    }
    
    function loop(t) {
        if (!lastBeatTime) lastBeatTime = t;
        const dt = (t - lastBeatTime) / 1000;
        lastBeatTime = t;
        
        update(dt);
        draw();
        animationFrameId = requestAnimationFrame(loop);
    }
    
    let lastBeatTime = 0;
    
    canvas.addEventListener('mousedown', handleInput);
    canvas.addEventListener('touchstart', (e)=>{e.preventDefault(); handleInput(e);});
    
    loop(0);
    
    return function cleanup() {
        if(animationFrameId) cancelAnimationFrame(animationFrameId);
        canvas.removeEventListener('mousedown', handleInput);
        canvas.removeEventListener('touchstart', handleInput);
        if(audioCtx) audioCtx.close();
    };
};
