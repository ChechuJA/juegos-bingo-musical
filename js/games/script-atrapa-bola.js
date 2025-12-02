function registerGame() {
  const canvas = document.getElementById('gameCanvas');

  if (!canvas || !canvas.getContext) {
    console.error("Canvas no disponible para Atrapa la Bola");
    return function cleanup() {};
  }

  canvas.width = 800;
  canvas.height = 500;

  return initAtrapa(canvas);
}

function initAtrapa(canvas) {
  const ctx = canvas.getContext('2d');
  let animationFrame = null;

  // Configuración inicial
  const basketHeight = 60;
  const basketWidth = 100;
  let basketX = (canvas.width - basketWidth) / 2;

  const ballRadius = 15;
  let balls = [];
  let ballSpeed = 4;

  let level = 1;
  let ballsCaught = 0;
  let ballsToNextLevel = 15;

  let score = 0;
  let lives = 3;
  let highScore = +(localStorage.getItem('atrapaBallHigh') || 0);
  let highScoreName = localStorage.getItem('atrapaBallHighName') || '';
  let playerName = localStorage.getItem('playerName') || 'Jugador';

  let showIntro = true;
  let gameOver = false;
  let particles = [];
  let basketScore = 0;

  let rightPressed = false;
  let leftPressed = false;

  const COLORS = {
    ball: ['#ff7043', '#f4511e', '#e64a19'],
    basket: ['#795548', '#6d4c41', '#5d4037'],
    net: ['#e0e0e0', '#bdbdbd', '#9e9e9e'],
    court: ['#81c784', '#66bb6a', '#4caf50'],
    particleColors: ['#ffeb3b', '#fdd835', '#fbc02d', '#f9a825', '#f57f17']
  };

  // ---------------------------
  // FUNCIONES DE DIBUJO
  // ---------------------------
  function drawBall(x, y) {
    // Dibujar sombra bajo la pelota
    ctx.beginPath();
    ctx.arc(x + 2, y + 2, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0,0,0,0.3)";
    ctx.fill();
    
    // Dibujar balón de baloncesto
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, ballRadius);
    gradient.addColorStop(0, COLORS.ball[0]);
    gradient.addColorStop(0.6, COLORS.ball[1]);
    gradient.addColorStop(1, COLORS.ball[2]);

    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Líneas del balón
    ctx.beginPath();
    ctx.arc(x, y, ballRadius * 0.8, 0, Math.PI * 2);
    ctx.strokeStyle = "#7e3300";
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Líneas del balón
    ctx.beginPath();
    ctx.moveTo(x - ballRadius * 0.7, y);
    ctx.lineTo(x + ballRadius * 0.7, y);
    ctx.moveTo(x, y - ballRadius * 0.7);
    ctx.lineTo(x, y + ballRadius * 0.7);
    ctx.strokeStyle = "#7e3300";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    
    // Brillo
    ctx.beginPath();
    ctx.arc(x - ballRadius/3, y - ballRadius/3, ballRadius/4, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.fill();
  }

  function drawBasket() {
    // Dibujar el aro de la canasta
    const rimWidth = basketWidth * 0.9;
    const rimHeight = basketHeight * 0.3;
    const rimX = basketX + (basketWidth - rimWidth) / 2;
    const rimY = canvas.height - basketHeight;
    
    // Sombra para profundidad
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    ctx.fillRect(rimX + 3, rimY + 3, rimWidth, rimHeight);
    
    // Tablero de la canasta
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(basketX, rimY - 30, basketWidth, 30);
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2;
    ctx.strokeRect(basketX, rimY - 30, basketWidth, 30);
    
    // Cuadrado dentro del tablero
    const squareSize = 30;
    const squareX = basketX + (basketWidth - squareSize) / 2;
    const squareY = rimY - 30 + 3;
    ctx.strokeStyle = "#e53935";
    ctx.strokeRect(squareX, squareY, squareSize, squareSize - 5);
    
    // Soporte del aro
    ctx.fillStyle = COLORS.basket[0];
    ctx.fillRect(rimX - 5, rimY, 5, rimHeight);
    ctx.fillRect(rimX + rimWidth, rimY, 5, rimHeight);
    
    // Aro de la canasta
    const rimGradient = ctx.createLinearGradient(rimX, rimY, rimX, rimY + rimHeight);
    rimGradient.addColorStop(0, "#ff5722");
    rimGradient.addColorStop(0.5, "#e64a19");
    rimGradient.addColorStop(1, "#bf360c");
    
    ctx.fillStyle = rimGradient;
    ctx.fillRect(rimX, rimY, rimWidth, rimHeight);
    ctx.strokeStyle = "#7e3300";
    ctx.lineWidth = 2;
    ctx.strokeRect(rimX, rimY, rimWidth, rimHeight);
    
    // Red de la canasta
    const netHeight = basketHeight * 0.7;
    const netY = rimY + rimHeight;
    
    ctx.beginPath();
    ctx.moveTo(rimX, netY);
    
    // Dibujar la malla con patrón en zigzag
    const netSegments = 10;
    const segmentWidth = rimWidth / netSegments;
    
    for (let i = 0; i <= netSegments; i++) {
      const offset = i % 2 === 0 ? 0 : 5;
      ctx.lineTo(rimX + i * segmentWidth, netY + offset);
    }
    
    // Líneas verticales de la red
    for (let i = 0; i <= netSegments; i++) {
      const x = rimX + i * segmentWidth;
      const startOffset = i % 2 === 0 ? 0 : 5;
      
      ctx.moveTo(x, netY + startOffset);
      
      // Patrón en zigzag hacia abajo
      for (let j = 0; j < 8; j++) {
        const yOffset = j % 2 === 0 ? 5 : -5;
        ctx.lineTo(x + yOffset, netY + startOffset + (j + 1) * 7);
      }
    }
    
    ctx.strokeStyle = COLORS.net[1];
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Efecto visual cuando se mete un balón
    if (basketScore > 0) {
      // Mostrar una animación o indicador cuando se anota
      ctx.fillStyle = "rgba(255,255,0,0.3)";
      ctx.fillRect(rimX, rimY, rimWidth, rimHeight);
      basketScore -= 1;
    }
  }

  function drawInfo() {
    // Barra superior de estadísticas
    const headerGrad = ctx.createLinearGradient(0, 0, 0, 50);
    headerGrad.addColorStop(0, '#2e7d32');
    headerGrad.addColorStop(1, '#1b5e20');
    ctx.fillStyle = headerGrad;
    ctx.fillRect(0, 0, canvas.width, 50);

    // Marcador con diseño de baloncesto
    ctx.font = 'bold 18px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText(`Nivel: ${level}`, 20, 30);
    ctx.fillText(`Canastas: ${ballsCaught}/${ballsToNextLevel}`, 120, 30);
    ctx.fillText(`Vidas: ${lives}`, 300, 30);
    ctx.fillText(`Puntos: ${score}`, 400, 30);
    
    // Récord
    ctx.font = '14px Arial';
    ctx.fillText(`Récord: ${highScore} (${highScoreName || "---"})`, 520, 30);
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dibujar la cancha de baloncesto
    const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    bgGradient.addColorStop(0, COLORS.court[0]);
    bgGradient.addColorStop(1, COLORS.court[2]);
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Dibujar líneas de la cancha
    ctx.strokeStyle = "rgba(255,255,255,0.7)";
    ctx.lineWidth = 2;
    
    // Círculo central
    ctx.beginPath();
    ctx.arc(canvas.width/2, canvas.height/2, 70, 0, Math.PI*2);
    ctx.stroke();
    
    // Línea central
    ctx.beginPath();
    ctx.moveTo(0, canvas.height/2);
    ctx.lineTo(canvas.width, canvas.height/2);
    ctx.stroke();
    
    // Otros elementos decorativos de cancha
    ctx.beginPath();
    ctx.arc(canvas.width/2, canvas.height/2, 15, 0, Math.PI*2);
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.fill();

    drawInfo();

    if (showIntro) {
      // Panel de introducción
      const introWidth = 500;
      const introHeight = 300;
      const introX = (canvas.width - introWidth) / 2;
      const introY = (canvas.height - introHeight) / 2;
      
      ctx.fillStyle = "rgba(0,0,0,0.7)";
      ctx.fillRect(introX, introY, introWidth, introHeight);
      ctx.strokeStyle = "#ff6f00";
      ctx.lineWidth = 3;
      ctx.strokeRect(introX, introY, introWidth, introHeight);
      
      ctx.fillStyle = "#fff";
      ctx.font = "bold 28px Arial";
      ctx.fillText("BASKET BALL CHALLENGE", canvas.width / 2 - 170, introY + 60);
      
      ctx.font = "18px Arial";
      ctx.fillText("Usa las flechas ← → para mover la canasta", canvas.width / 2 - 160, introY + 120);
      ctx.fillText("Intenta atrapar todas las pelotas que puedas", canvas.width / 2 - 170, introY + 160);
      ctx.fillText("¡Cada 15 canastas subes de nivel!", canvas.width / 2 - 140, introY + 200);
      
      ctx.font = "bold 22px Arial";
      ctx.fillStyle = "#ffeb3b";
      ctx.fillText("Pulsa cualquier tecla para empezar", canvas.width / 2 - 180, introY + 250);
      return;
    }

    if (gameOver) {
      // Panel de fin de juego
      const gameOverWidth = 500;
      const gameOverHeight = 300;
      const gameOverX = (canvas.width - gameOverWidth) / 2;
      const gameOverY = (canvas.height - gameOverHeight) / 2;
      
      ctx.fillStyle = "rgba(0,0,0,0.85)";
      ctx.fillRect(gameOverX, gameOverY, gameOverWidth, gameOverHeight);
      ctx.strokeStyle = "#d32f2f";
      ctx.lineWidth = 4;
      ctx.strokeRect(gameOverX, gameOverY, gameOverWidth, gameOverHeight);
      
      ctx.fillStyle = "#fff";
      ctx.font = "bold 32px Arial";
      ctx.fillText("GAME OVER", canvas.width / 2 - 100, gameOverY + 70);
      
      ctx.font = "22px Arial";
      ctx.fillText(`Puntuación Final: ${score}`, canvas.width / 2 - 90, gameOverY + 120);
      
      if (score > highScore) {
        ctx.fillStyle = "#ffd600";
        ctx.fillText("¡NUEVO RÉCORD!", canvas.width / 2 - 90, gameOverY + 160);
      } else {
        ctx.fillText(`Récord actual: ${highScore}`, canvas.width / 2 - 85, gameOverY + 160);
      }
      
      ctx.fillStyle = "#4caf50";
      ctx.font = "bold 22px Arial";
      ctx.fillText("Pulsa ESPACIO para jugar de nuevo", canvas.width / 2 - 180, gameOverY + 220);
      return;
    }

    // Dibujar partículas si hay
    particles.forEach((p, i) => {
      p.life--;
      p.x += p.vx;
      p.y += p.vy;
      p.size *= 0.95;
      
      if (p.life <= 0 || p.size < 0.5) {
        particles.splice(i, 1);
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life / 30;
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    });

    // Dibujar pelotas y canasta
    balls.forEach(ball => drawBall(ball.x, ball.y));
    drawBasket();
  }

  // ---------------------------
  // FUNCIONES DE JUEGO
  // ---------------------------
  
  function createParticles(x, y, count, isScore) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 2 + 1;
      const size = Math.random() * 4 + 2;
      const life = Math.random() * 20 + 10;
      
      const colors = isScore ? COLORS.particleColors : ["#ffffff", "#e0e0e0"];
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size,
        life,
        color
      });
    }
  }
  
  function spawnBall() {
    const x = Math.random() * (canvas.width - 100) + 50;
    const y = -ballRadius * 2;
    balls.push({
      x,
      y,
      speed: ballSpeed * (0.8 + Math.random() * 0.4)
    });
  }
  
  function updateBalls() {
    // Mover pelotas
    for (let i = balls.length - 1; i >= 0; i--) {
      const ball = balls[i];
      ball.y += ball.speed;
      
      // Verificar colisión con la canasta
      const rimWidth = basketWidth * 0.9;
      const rimHeight = basketHeight * 0.3;
      const rimX = basketX + (basketWidth - rimWidth) / 2;
      const rimY = canvas.height - basketHeight;
      
      if (ball.y >= rimY - ballRadius && 
          ball.y <= rimY + rimHeight && 
          ball.x >= rimX - ballRadius && 
          ball.x <= rimX + rimWidth + ballRadius) {
        
        // ¡Canasta!
        balls.splice(i, 1);
        ballsCaught++;
        score += level * 10;
        basketScore = 5; // Duración del efecto visual
        
        // Actualizar récord
        if (score > highScore) {
          highScore = score;
          highScoreName = playerName;
          localStorage.setItem('atrapaBallHigh', String(highScore));
          localStorage.setItem('atrapaBallHighName', highScoreName);
        }
        
        // Crear partículas para celebrar
        createParticles(ball.x, ball.y, 15, true);
        
        // Subir de nivel
        if (ballsCaught >= ballsToNextLevel) {
          level++;
          ballsCaught = 0;
          ballSpeed += 0.5;
        }
        
      } else if (ball.y > canvas.height + ballRadius) {
        // La pelota cayó fuera
        balls.splice(i, 1);
        lives--;
        createParticles(ball.x, canvas.height - 10, 10, false);
        
        if (lives <= 0) {
          gameOver = true;
        }
      }
    }
    
    // Generar nuevas pelotas aleatoriamente
    if (!gameOver && !showIntro && Math.random() < 0.02 + (level * 0.005)) {
      spawnBall();
    }
  }
  
  function updateBasketPosition() {
    const moveSpeed = 7 + level;
    
    if (rightPressed) {
      basketX = Math.min(canvas.width - basketWidth, basketX + moveSpeed);
    }
    if (leftPressed) {
      basketX = Math.max(0, basketX - moveSpeed);
    }
  }
  
  // ---------------------------
  // GAME LOOP
  // ---------------------------
  function gameLoop() {
    try {
      if (!showIntro && !gameOver) {
        updateBasketPosition();
        updateBalls();
      }
      draw();
    } catch (err) {
      console.error("Error en gameLoop:", err);
    }
    animationFrame = requestAnimationFrame(gameLoop);
  }

  // ---------------------------
  // INPUT
  // ---------------------------
  document.addEventListener('keydown', e => {
    if (showIntro) {
      showIntro = false;
      return;
    }
    if (gameOver && e.code === "Space") {
      resetGame();
      return;
    }
    if (e.code === "ArrowRight") rightPressed = true;
    if (e.code === "ArrowLeft") leftPressed = true;
  });

  document.addEventListener('keyup', e => {
    if (e.code === "ArrowRight") rightPressed = false;
    if (e.code === "ArrowLeft") leftPressed = false;
  });

  // Variable global para controlar la velocidad del juego
let gameSpeed = 1;

// Función para ajustar la velocidad
function adjustSpeed(delta) {
    gameSpeed = Math.max(0.1, gameSpeed + delta); // Evita que sea menor a 0.1
    console.log(`Velocidad del juego: ${gameSpeed}`);
}

// Escuchar teclas para ajustar la velocidad
document.addEventListener('keydown', (e) => {
    if (e.key === '+') adjustSpeed(0.1);
    if (e.key === '-') adjustSpeed(-0.1);
});

  // ---------------------------
  // RESET
  // ---------------------------
  function resetGame() {
    score = 0;
    level = 1;
    ballsCaught = 0;
    basketScore = 0;
    lives = 3;
    ballSpeed = 4;
    balls = [];
    particles = [];
    basketX = (canvas.width - basketWidth) / 2;
    gameOver = false;
    showIntro = false;
  }

  // ---------------------------
  // START
  // ---------------------------
  gameLoop();

  return function cleanup() {
    if (animationFrame) cancelAnimationFrame(animationFrame);
  };
}

window.registerGame = registerGame;
