window.registerGame = function() {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        console.error('Canvas gameCanvas no encontrado');
        return () => {};
    }
    const ctx = canvas.getContext('2d');
    
    // Estados: 'menu', 'countdown', 'measuring', 'result'
    let gameState = 'menu';
    let animationFrameId = null;
    
    // Variables de lógica
    let targetTime = 3000; // ms
    let startTime = 0;
    let endTime = 0;
    let timerText = '';
    let rounds = 0;
    const maxRounds = 3;
    let scores = [];
    
    // UI Helpers
    let lastTime = 0;
    
    // --- EVENTOS ---
    function handleInput(e) {
        if (e.target.tagName !== 'BUTTON') {
             // e.preventDefault();
        }

        if (gameState === 'menu') {
            startGame();
        } else if (gameState === 'playing') {
            // Detener el cronómetro
            stopTimer();
        } else if (gameState === 'result') {
            if (rounds < maxRounds) {
                startRound();
            } else {
                startGame(); // Reinicia todo
            }
        }
    }

    // --- LÓGICA ---
    function startGame() {
        rounds = 0;
        scores = [];
        startRound();
    }

    function startRound() {
        // Elegir tiempo objetivo aleatorio: 3, 4, 5, 6, 7 seg
        const sec = 3 + Math.floor(Math.random() * 5); 
        targetTime = sec * 1000;
        
        gameState = 'countdown';
        
        // Secuencia "Preparados... 3... 2... 1... YA"
        // Simulada con Timeouts para simpleza
        let count = 3;
        timerText = count.toString();
        
        const interval = setInterval(() => {
            count--;
            if (count > 0) {
                timerText = count.toString();
                playSound('tick');
            } else if (count === 0) {
                timerText = '¡YA!';
                playSound('go');
            } else {
                clearInterval(interval);
                gameState = 'playing';
                startTime = performance.now();
                timerText = ''; // Ocultar
            }
        }, 1000);
    }

    function stopTimer() {
        endTime = performance.now();
        const duration = endTime - startTime;
        
        const diff = Math.abs(duration - targetTime);
        const diffSec = diff / 1000;
        
        // Puntuación
        // < 0.1s => 100
        // < 0.5s => 80
        // > 2.0s => 0
        let p = 0;
        if (diff < 100) p = 100;
        else if (diff < 2000) {
            p = 100 * (1 - (diff / 2000));
        }
        
        scores.push({
            puntos: Math.round(p),
            target: targetTime,
            actual: duration
        });
        
        rounds++;
        gameState = 'result';
        playSound('result', Math.round(p));
    }

    function playSound(type, val) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctxAudio = new AudioContext();
        const osc = ctxAudio.createOscillator();
        const gain = ctxAudio.createGain();
        osc.connect(gain);
        gain.connect(ctxAudio.destination);
        
        const now = ctxAudio.currentTime;
        
        if (type === 'tick') {
            osc.frequency.setValueAtTime(600, now);
            osc.start();
            osc.stop(now + 0.1);
            gain.gain.setValueAtTime(0.1, now);
        } else if (type === 'go') {
            osc.frequency.setValueAtTime(800, now);
            osc.frequency.linearRampToValueAtTime(1200, now + 0.3);
            osc.start();
            osc.stop(now + 0.3);
            gain.gain.setValueAtTime(0.2, now);
        } else if (type === 'result') {
            if (val >= 90) {
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(500, now);
                osc.frequency.exponentialRampToValueAtTime(1000, now + 0.2);
            } else {
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(300, now);
                osc.frequency.linearRampToValueAtTime(100, now + 0.2);
            }
            osc.start();
            osc.stop(now + 0.3);
            gain.gain.setValueAtTime(0.1, now);
        }
    }

    // --- RENDER ---
    function draw() {
        // Fondo grisáceo oscuro
        ctx.fillStyle = '#222';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;

        if (gameState === 'menu') {
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            
            ctx.font = '36px Arial';
            ctx.fillText('⏱️ Estimación Temporal', cx, cy - 60);
            
            ctx.font = '20px Arial';
            ctx.fillText('Pulsa la pantalla cuando', cx, cy - 10);
            ctx.fillText('creas que ha pasado el tiempo indicado.', cx, cy + 20);
            
            ctx.fillStyle = '#4cc9f0';
            ctx.fillRect(cx - 80, cy + 80, 160, 50);
            ctx.fillStyle = '#000';
            ctx.font = 'bold 20px Arial';
            ctx.fillText('EMPEZAR', cx, cy + 112);
            return;
        }

        if (gameState === 'countdown') {
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.font = '24px Arial';
            ctx.fillText(`Objetivo: ${targetTime/1000} Segundos`, cx, cy - 60);
            
            ctx.font = 'bold 80px Arial';
            ctx.fillStyle = (timerText === '¡YA!') ? '#0f0' : '#ff0';
            ctx.fillText(timerText, cx, cy + 30);
            return;
        }

        if (gameState === 'playing') {
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.font = '24px Arial';
            ctx.fillText(`Objetivo: ${targetTime/1000} Segundos`, cx, cy - 60);
            
            // Reloj visual o "..."
            ctx.font = 'italic 30px Arial';
            ctx.fillStyle = '#aaa';
            const dots = Math.floor((performance.now() / 500) % 4); 
            ctx.fillText('Contando' + '.'.repeat(dots), cx, cy + 20);
            
            ctx.font = '20px Arial';
            ctx.fillStyle = '#fff';
            ctx.fillText('¡Pulsa ahora!', cx, cy + 100);
            return;
        }

        if (gameState === 'result') {
            const last = scores[scores.length - 1];
            
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            
            if (rounds < maxRounds) {
                // Info resultado parcial
                ctx.font = '30px Arial';
                ctx.fillText(`Objetivo: ${last.target/1000}s`, cx, cy - 80);
                
                ctx.font = 'bold 50px Arial';
                const actualSec = (last.actual / 1000).toFixed(2);
                const diffSec = ((last.actual - last.target) / 1000).toFixed(2);
                
                let col = '#fff';
                if (last.puntos >= 90) col = '#0f0';
                else if (last.puntos >= 50) col = '#ff0';
                else col = '#f00';
                
                ctx.fillStyle = col;
                ctx.fillText(`${actualSec}s`, cx, cy - 20);
                
                ctx.font = '24px Arial';
                ctx.fillStyle = '#ccc';
                const sign = diffSec > 0 ? '+' : '';
                ctx.fillText(`(${sign}${diffSec}s)`, cx, cy + 20);
                
                ctx.font = '20px Arial';
                ctx.fillStyle = '#fff';
                ctx.fillText('Toca para siguiente', cx, cy + 80);
            } else {
                // Resultado final
                let sum = 0;
                scores.forEach(s => sum += s.puntos);
                const avg = Math.round(sum / scores.length);
                
                ctx.font = '30px Arial';
                ctx.fillText('Resultado Final', cx, cy - 60);
                
                ctx.font = 'bold 70px Arial';
                let col = '#fff';
                if (avg >= 90) col = '#0f0';
                else if (avg >= 60) col = '#ff0';
                else col = '#f00';
                
                ctx.fillStyle = col;
                ctx.fillText(avg + '%', cx, cy + 20);
                
                ctx.fillStyle = '#fff';
                ctx.font = '20px Arial';
                ctx.fillText('Precisión Media', cx, cy + 60);

                // Botón
                ctx.fillStyle = '#4cc9f0';
                ctx.fillRect(cx - 90, cy + 100, 180, 45);
                ctx.fillStyle = '#000';
                ctx.font = '20px Arial';
                ctx.fillText('REINTENTAR', cx, cy + 130);

                // Guardar
                const best = parseInt(localStorage.getItem('estimacionTiempoBest') || '0');
                if (avg > best) {
                    localStorage.setItem('estimacionTiempoBest', avg);
                    const name = localStorage.getItem('playerName');
                    if (name) localStorage.setItem('estimacionTiempoBestName', name);
                    
                    ctx.fillStyle = '#ff0';
                    ctx.font = '16px Arial';
                    ctx.fillText('¡RÉCORD!', cx, cy - 100);
                }
            }
        }
    }

    function gameLoop(timestamp) {
        draw();
        animationFrameId = requestAnimationFrame(gameLoop);
    }
    
    // Listeners
    canvas.addEventListener('mousedown', handleInput);
    canvas.addEventListener('touchstart', (e) => { e.preventDefault(); handleInput(e); });

    gameLoop();

    return function cleanup() {
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        canvas.removeEventListener('mousedown', handleInput);
        canvas.removeEventListener('touchstart', handleInput);
    };
};
