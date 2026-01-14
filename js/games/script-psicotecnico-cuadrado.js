window.registerGame = function() {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        console.error('Canvas gameCanvas no encontrado');
        return () => {};
    }
    const ctx = canvas.getContext('2d');
    
    // --- ESTADO DEL JUEGO ---
    let gameState = 'menu'; // menu, instruction, playing, result, education
    let animationFrameId = null;
    let score = 0;
    let lastTime = 0;
    let morphTime = 0;
    let morphSpeed = 1.0; // Velocidad de transformación
    let currentT = 0; // 0 a 1 param (controla la forma)
    let shapeType = 'circle'; // 'circle', 'triangle', 'pentagon' (formas iniciales)
    let targetT = 0.5; // El punto donde es un cuadrado perfecto
    // Para simplificar: usaremos una interpolación entre formas.
    // La forma "objetivo" es siempre un CUADRADO.
    // La forma inicial varía.
    
    // Definimos vértices base para un Cuadrado (centrado en 0,0, tamaño 1x1)
    // Orden: TL, TR, BR, BL
    const squareVertices = [
        {x: -1, y: -1}, {x: 1, y: -1}, {x: 1, y: 1}, {x: -1, y: 1}
    ];

    // Círculo aproximado por 12 vértices (o curva bez, pero vértices es más fácil para morph genérico)
    // Para que sea "psicotécnico" visualmente limpio, usaremos RoundRect logic para Círculo->Cuadrado
    // Y para Triángulo->Cuadrado interpolación de vértices.
    // Vamos a implementar solo: Círculo <-> Cuadrado <-> Estrella (puntas hacia dentro)
    // Usando Superelipse o RoundRect es lo más limpio visualmente.
    // Hagamos: Círculo (radius=50%) -> Cuadrado (radius=0%) -> Inverso?
    // Mejor: Oscilar entre Círculo y Cuadrado.
    
    // Definicón de parámetros de oscilación
    // t va de 0 a 1.
    // en t=0 forma Círculo.
    // en t=1 forma Cuadrado.
    // El jugador debe dar en t=1 (o cerca).
    // Pero para que sea difícil, puede pasarse y volver, o ir rápido.
    // Vamos a hacer que oscile: 0 -> 1 -> 0 ...
    
    let t = 0; 
    let tDirection = 1;
    let difficulty = 1;

    // --- MANEJO DE EVENTOS ---
    function handleInput(e) {
        // Prevenir default solo si no es un botón HTML
        if (e.target.tagName !== 'BUTTON') {
             // e.preventDefault(); // A veces bloquea clicks necesarios
        }

        if (gameState === 'menu') {
            startGame();
        } else if (gameState === 'playing') {
            checkWin();
        } else if (gameState === 'result') {
            // Un pequeño delay para evitar clicks accidentales
            // Se maneja con botones en pantalla
        }
    }

    // --- LÓGICA DEL JUEGO ---
    function startGame() {
        gameState = 'playing';
        score = 0;
        t = 0;
        tDirection = 1;
        // Velocidad aleatoria entre 0.5 y 1.5
        difficulty = 0.5 + Math.random(); 
        lastTime = performance.now();
    }

    function checkWin() {
        // El objetivo es t=1 (Cuadrado perfecto)
        // t oscila entre 0 (Círculo) y 1.2 (Cuadrado 'pasado'?? No, roundness 0 es tope visual)
        // Hagamos que oscile entre Roundness 100% (círculo) y Roundness 0% (cuadrado)
        // La variable 't' representará "Cuadratura". 
        // 0 = Círculo, 1 = Cuadrado.
        
        // Calculamos precisión
        // Si t=1 -> 100%. Si t=0 -> 0%.
        // Pero t oscila constantemente en el Update.
        
        // Qué pasa si t llega a 1? Rebota?
        // Sí, rebota. 0 -> 1 -> 0.
        
        const dist = Math.abs(1 - t); // Distancia al cuadrado perfecto (1)
        
        // Puntuación:
        // Si dist=0 (exacto) -> 100%
        // Si dist=0.5 (medio camino) -> 50%
        // Si dist=1 (círculo) -> 0%
        
        // Formula exponencial para que sea exigente:
        // Score = 100 * (1 - dist)^2  o similar.
        // Lineal: 100 * (1 - dist)
        
        let precision = Math.max(0, 100 * (1 - dist));
        precision = Math.round(precision);
        
        score = precision;
        gameState = 'result';
        playSound(precision);
    }

    function playSound(puntos) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctxAudio = new AudioContext();
        const osc = ctxAudio.createOscillator();
        const gain = ctxAudio.createGain();
        osc.connect(gain);
        gain.connect(ctxAudio.destination);
        
        if (puntos >= 90) {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(500, ctxAudio.currentTime);
            osc.frequency.exponentialRampToValueAtTime(1000, ctxAudio.currentTime + 0.1);
        } else if (puntos >= 50) {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(400, ctxAudio.currentTime);
        } else {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(200, ctxAudio.currentTime);
            osc.frequency.linearRampToValueAtTime(100, ctxAudio.currentTime + 0.3);
        }
        
        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.01, ctxAudio.currentTime + 0.3);
        osc.stop(ctxAudio.currentTime + 0.3);
    }

    function update(dt) {
        if (gameState === 'playing') {
            // Oscilación
            // Usamos sinusoide para suavidad o lineal?
            // Lineal es más predecible para "tests psicotécnicos".
            // t va de 0 a 1 y vuelve.
            
            t += difficulty * dt * tDirection;
            
            if (t >= 1) {
                t = 1;
                tDirection = -1;
            } else if (t <= 0) {
                t = 0;
                tDirection = 1;
                // Opcional: cambiar velocidad cada vez que vuelve a círculo
                difficulty = 0.5 + Math.random(); 
            }
        }
    }

    // --- RENDER ---
    function drawRoundedRect(ctx, x, y, size, radius) {
        if (radius < 0) radius = 0;
        const half = size / 2;
        if (radius > half) radius = half;
        
        ctx.beginPath();
        ctx.moveTo(x - half + radius, y - half);
        ctx.lineTo(x + half - radius, y - half);
        ctx.quadraticCurveTo(x + half, y - half, x + half, y - half + radius);
        ctx.lineTo(x + half, y + half - radius);
        ctx.quadraticCurveTo(x + half, y + half, x + half - radius, y + half);
        ctx.lineTo(x - half + radius, y + half);
        ctx.quadraticCurveTo(x - half, y + half, x - half, y + half - radius);
        ctx.lineTo(x - half, y - half + radius);
        ctx.quadraticCurveTo(x - half, y - half, x - half + radius, y - half);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }

    // Función para dibujar una "Superelipse" que interpola Círculo <-> Cuadrado <-> Estrella
    // Pero 'drawRoundedRect' es perfecto para Círculo <-> Cuadrado.
    // radius = size/2 * (1 - t).
    // Si t=0 -> radius=size/2 -> Círculo
    // Si t=1 -> radius=0 -> Cuadrado.
    // Esto es simple y efectivo.
    
    function draw() {
        // Fondo
        ctx.fillStyle = '#1a1a2e'; // Azul oscuro psicotécnico
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const size = 300; // Tamaño base

        if (gameState === 'menu') {
            ctx.fillStyle = '#ffffff';
            ctx.font = '40px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('🧠 Test Psicotécnico: Cuadratura', centerX, centerY - 50);
            
            ctx.font = '24px Arial';
            ctx.fillText('Pulsa cuando la figura sea un', centerX, centerY + 20);
            ctx.fillStyle = '#4cc9f0';
            ctx.font = 'bold 28px Arial';
            ctx.fillText('CUADRADO PERFECTO', centerX, centerY + 60);

            // Dibujar botón start falso
            ctx.fillStyle = '#4cc9f0';
            ctx.fillRect(centerX - 100, centerY + 120, 200, 50);
            ctx.fillStyle = '#000';
            ctx.font = '20px Arial';
            ctx.fillText('EMPEZAR', centerX, centerY + 152);
            return;
        }

        // DIBUJAR LA FORMA
        // Color varía según t para dar pista sutil? No, mejor fijo para test puro.
        // O sutil gradiente.
        ctx.fillStyle = '#4cc9f0'; 
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 4;
        
        let currentRadius = (size / 2) * (1 - t);
        // t=1 => radius=0 (cuadrado)
        // t=0 => radius=size/2 (círculo)

        drawRoundedRect(ctx, centerX, centerY, size, currentRadius);

        // UI Text
        ctx.fillStyle = '#fff';
        ctx.font = '20px monospace';
        ctx.textAlign = 'left';
        // ctx.fillText('Cuadratura: ' + Math.round(t*100) + '%', 20, 40); // Debug

        if (gameState === 'result') {
            // Overlay resultado
            ctx.fillStyle = 'rgba(0,0,0,0.8)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.font = '30px Arial';
            ctx.fillText('Resultado:', centerX, centerY - 80);
            
            // Color según score
            let color = '#ff4d4d'; // Rojo
            if (score >= 90) color = '#2ecc71'; // Verde
            else if (score >= 70) color = '#f1c40f'; // Amarillo

            ctx.fillStyle = color;
            ctx.font = 'bold 80px Arial';
            ctx.fillText(score + '%', centerX, centerY + 10);
            
            ctx.fillStyle = '#ccc';
            ctx.font = '20px Arial';
            let msg = 'Inténtalo de nuevo';
            if (score === 100) msg = '¡PERFECTO! 🎯';
            else if (score >= 90) msg = '¡Excelente precisión!';
            else if (score >= 70) msg = 'Bien hecho';
            
            ctx.fillText(msg, centerX, centerY + 60);
            
            // Botón Repetir
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(centerX - 90, centerY + 100, 180, 50);
            ctx.fillStyle = '#000';
            ctx.font = '20px Arial';
            ctx.fillText('REPETIR', centerX, centerY + 132);

            // Guardar récord
            const currentBest = parseInt(localStorage.getItem('psicotecnicoCuadradoBest') || '0');
            if (score > currentBest) {
                localStorage.setItem('psicotecnicoCuadradoBest', score);
                const name = localStorage.getItem('playerName');
                if (name) localStorage.setItem('psicotecnicoCuadradoBestName', name);
                
                ctx.fillStyle = '#ffff00';
                ctx.font = '16px Arial';
                ctx.fillText('¡NUEVO RÉCORD!', centerX, centerY - 120);
            }
        }
    }

    // --- LOOP ---
    function gameLoop(timestamp) {
        if (!lastTime) lastTime = timestamp;
        const dt = (timestamp - lastTime) / 1000;
        lastTime = timestamp;

        update(dt);
        draw();
        
        animationFrameId = requestAnimationFrame(gameLoop);
    }

    // Listeners
    canvas.addEventListener('mousedown', handleInput);
    // Para móviles
    canvas.addEventListener('touchstart', (e) => {
        // Evitar doble input
        e.preventDefault(); 
        handleInput(e);
    });

    // Iniciar loop
    gameLoop(0);

    // CLEANUP
    return function cleanup() {
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        canvas.removeEventListener('mousedown', handleInput);
        canvas.removeEventListener('touchstart', handleInput);
    };
};
