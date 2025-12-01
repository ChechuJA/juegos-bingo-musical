function registerGame(){
  // Ping Pong Multijugador - Juego para dos jugadores
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 800;
  canvas.height = 500;
  let af = null;

  // Game state
  let gameState = 'intro'; // 'intro', 'nameInput', 'playing', 'gameOver'
  let player1Name = '';
  let player2Name = '';
  let showInstructions = true;

  // Game objects
  const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    vx: 5,
    vy: 3,
    radius: 8,
    speed: 5
  };

  const paddle1 = {
    x: 30,
    y: canvas.height / 2 - 40,
    width: 12,
    height: 80,
    speed: 6,
    score: 0
  };

  const paddle2 = {
    x: canvas.width - 42,
    y: canvas.height / 2 - 40,
    width: 12,
    height: 80,
    speed: 6,
    score: 0
  };

  // Controls state
  const keys = {};
  const maxScore = 5; // Win condition

  // Background image loading
  const backgroundImage = new Image();
  backgroundImage.src = 'assets/ping-pong-background.png';
  backgroundImage.onerror = () => { backgroundImage.src = 'assets/ping-pong-background.svg'; };

  function backgroundReady() {
    return backgroundImage && backgroundImage.complete && backgroundImage.naturalWidth > 0;
  }

  function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.vx = (Math.random() > 0.5 ? 1 : -1) * ball.speed;
    ball.vy = (Math.random() - 0.5) * 4;
  }

  function resetGame() {
    paddle1.score = 0;
    paddle2.score = 0;
    paddle1.y = canvas.height / 2 - 40;
    paddle2.y = canvas.height / 2 - 40;
    resetBall();
    gameState = 'playing';
  }

  function updateBall() {
    ball.x += ball.vx;
    ball.y += ball.vy;

    // Wall collisions (top/bottom)
    if (ball.y - ball.radius <= 0 || ball.y + ball.radius >= canvas.height) {
      ball.vy = -ball.vy;
    }

    // Paddle collisions
    // Left paddle
    if (ball.x - ball.radius <= paddle1.x + paddle1.width &&
        ball.y >= paddle1.y && ball.y <= paddle1.y + paddle1.height &&
        ball.vx < 0) {
      ball.vx = -ball.vx;
      // Add some spin based on where ball hits paddle
      const hitPos = (ball.y - paddle1.y) / paddle1.height;
      ball.vy += (hitPos - 0.5) * 3;
    }

    // Right paddle
    if (ball.x + ball.radius >= paddle2.x &&
        ball.y >= paddle2.y && ball.y <= paddle2.y + paddle2.height &&
        ball.vx > 0) {
      ball.vx = -ball.vx;
      // Add some spin based on where ball hits paddle
      const hitPos = (ball.y - paddle2.y) / paddle2.height;
      ball.vy += (hitPos - 0.5) * 3;
    }

    // Score conditions
    if (ball.x < 0) {
      paddle2.score++;
      resetBall();
    } else if (ball.x > canvas.width) {
      paddle1.score++;
      resetBall();
    }

    // Check win condition
    if (paddle1.score >= maxScore || paddle2.score >= maxScore) {
      gameState = 'gameOver';
    }
  }

  function updatePaddles() {
    // Player 1 controls (A/Z keys)
    if (keys['KeyA'] || keys['KeyA'.toLowerCase()]) {
      paddle1.y = Math.max(0, paddle1.y - paddle1.speed);
    }
    if (keys['KeyZ'] || keys['KeyZ'.toLowerCase()]) {
      paddle1.y = Math.min(canvas.height - paddle1.height, paddle1.y + paddle1.speed);
    }

    // Player 2 controls (Arrow Up/Down)
    if (keys['ArrowUp']) {
      paddle2.y = Math.max(0, paddle2.y - paddle2.speed);
    }
    if (keys['ArrowDown']) {
      paddle2.y = Math.min(canvas.height - paddle2.height, paddle2.y + paddle2.speed);
    }
  }

  function draw() {
    // Clear canvas
    ctx.fillStyle = '#0f1419';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (gameState === 'intro') {
      drawIntro();
    } else if (gameState === 'nameInput') {
      drawNameInput();
    } else if (gameState === 'playing' || gameState === 'gameOver') {
      drawGame();
    }
  }

  function drawIntro() {
    // Background image or gradient fallback
    if (backgroundReady()) {
      ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
    } else if (window.GameUI) {
      GameUI.softBg(ctx, canvas.width, canvas.height, ['#1a0033', '#2d1b69']);
    } else {
      ctx.fillStyle = '#1a0033';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Semi-transparent overlay for better text readability
    ctx.save();
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = '#1a0033';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();

    // Title
    ctx.save();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 42px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🏓 PING PONG', canvas.width / 2, 120);

    ctx.font = '24px Arial';
    ctx.fillStyle = '#f0f0f0';
    ctx.fillText('MULTIJUGADOR', canvas.width / 2, 160);

    // Instructions
    ctx.font = '18px Arial';
    ctx.fillStyle = '#ccc';
    ctx.textAlign = 'left';
    
    const instructions = [
      'Jugador 1: Teclas A (subir) y Z (bajar)',
      'Jugador 2: Flechas ↑ (subir) y ↓ (bajar)',
      '',
      'Primer jugador en llegar a 5 puntos gana',
      '',
      'Presiona ESPACIO para configurar nombres'
    ];

    let startY = 220;
    instructions.forEach((line, i) => {
      ctx.textAlign = 'center';
      ctx.fillText(line, canvas.width / 2, startY + i * 25);
    });

    ctx.restore();
  }

  function drawNameInput() {
    // Background image or gradient fallback
    if (backgroundReady()) {
      ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
    } else if (window.GameUI) {
      GameUI.softBg(ctx, canvas.width, canvas.height, ['#1a0033', '#2d1b69']);
    } else {
      ctx.fillStyle = '#1a0033';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Semi-transparent overlay for better text readability
    ctx.save();
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = '#1a0033';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();

    ctx.save();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Nombres de Jugadores', canvas.width / 2, 150);

    ctx.font = '18px Arial';
    ctx.fillStyle = '#f0f0f0';
    ctx.fillText('Los nombres serán solicitados mediante diálogos', canvas.width / 2, 220);
    ctx.fillText('Presiona cualquier tecla para continuar', canvas.width / 2, 280);

    ctx.restore();
  }

  function drawGame() {
    // Game background with image
    if (backgroundReady()) {
      ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
      // Add slight overlay to darken for better gameplay visibility
      ctx.save();
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = '#0f1419';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
    } else {
      ctx.fillStyle = '#0f1419';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Center line
    ctx.setLineDash([10, 10]);
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw paddles
    ctx.fillStyle = '#00ff88';
    ctx.fillRect(paddle1.x, paddle1.y, paddle1.width, paddle1.height);
    
    ctx.fillStyle = '#ff6b35';
    ctx.fillRect(paddle2.x, paddle2.y, paddle2.width, paddle2.height);

    // Draw ball
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();

    // Draw scores and names
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    
    // Player 1
    ctx.fillStyle = '#00ff88';
    ctx.fillText(player1Name || 'Jugador 1', canvas.width / 4, 40);
    ctx.font = 'bold 32px Arial';
    ctx.fillText(paddle1.score.toString(), canvas.width / 4, 75);

    // Player 2
    ctx.fillStyle = '#ff6b35';
    ctx.font = 'bold 24px Arial';
    ctx.fillText(player2Name || 'Jugador 2', (canvas.width / 4) * 3, 40);
    ctx.font = 'bold 32px Arial';
    ctx.fillText(paddle2.score.toString(), (canvas.width / 4) * 3, 75);

    // Game over screen
    if (gameState === 'gameOver') {
      ctx.save();
      ctx.globalAlpha = 0.8;
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = 1;

      const winner = paddle1.score >= maxScore ? player1Name || 'Jugador 1' : player2Name || 'Jugador 2';
      const winnerColor = paddle1.score >= maxScore ? '#00ff88' : '#ff6b35';
      
      ctx.fillStyle = winnerColor;
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('¡GANADOR!', canvas.width / 2, 200);
      
      ctx.font = 'bold 36px Arial';
      ctx.fillText(winner, canvas.width / 2, 250);

      ctx.font = '20px Arial';
      ctx.fillStyle = '#fff';
      ctx.fillText('Presiona R para jugar otra vez', canvas.width / 2, 320);
      ctx.fillText('ESC para volver al menú', canvas.width / 2, 350);

      ctx.restore();
    }

    // Instructions at bottom
    if (showInstructions && gameState === 'playing') {
      ctx.save();
      ctx.font = '14px Arial';
      ctx.fillStyle = '#666';
      ctx.textAlign = 'center';
      ctx.fillText('A/Z: Jugador 1  •  ↑/↓: Jugador 2  •  ESC: Menú', canvas.width / 2, canvas.height - 15);
      ctx.restore();
    }
  }

  function handleKeyDown(e) {
    keys[e.code] = true;

    if (gameState === 'intro') {
      if (e.code === 'Space') {
        gameState = 'nameInput';
        // Request player names
        setTimeout(() => {
          player1Name = prompt('Nombre del Jugador 1 (teclas A/Z):') || 'Jugador 1';
          player2Name = prompt('Nombre del Jugador 2 (flechas ↑/↓):') || 'Jugador 2';
          resetGame();
        }, 100);
      }
    } else if (gameState === 'nameInput') {
      resetGame();
    } else if (gameState === 'gameOver') {
      if (e.code === 'KeyR') {
        resetGame();
      } else if (e.code === 'Escape') {
        // Return to menu - this will be handled by the main system
        return;
      }
    } else if (gameState === 'playing') {
      if (e.code === 'Escape') {
        // Return to menu
        return;
      }
    }

    e.preventDefault();
  }

  function handleKeyUp(e) {
    keys[e.code] = false;
  }

  function update() {
    if (gameState === 'playing') {
      updatePaddles();
      updateBall();
    }
  }

  function loop() {
    update();
    draw();
    af = requestAnimationFrame(loop);
  }

  // Initialize
  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);
  canvas.focus();
  
  loop();

  // Cleanup function
  return function cleanup() {
    if (af) cancelAnimationFrame(af);
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);
  };
}

window.registerGame = registerGame;