// script-flappy-bird.js
// Juego: Flappy Bird con niveles

(function(){
  let canvas, ctx, width, height;
  let bird, pipes, score, gameOver, level, keys;
  const BIRD_SIZE = 24;
  const PIPE_WIDTH = 50;
  const PIPE_GAP = 120;
  const PIPE_SPEED = 2;
  const GRAVITY = 0.5;
  const FLAP = -8;

  function initGame() {
    bird = { x: 100, y: height/2, vy: 0 };
    pipes = [];
    score = 0;
    gameOver = false;
    level = 1;
    keys = {};
    spawnPipes();
  }

  function spawnPipes() {
    pipes = [];
    for (let i = 0; i < 5; i++) {
      const gapY = Math.random() * (height - PIPE_GAP - 40) + 20;
      pipes.push({ x: width + i * 200, gapY, moving: level === 2 });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    // Fondo
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, width, height);
    // Pájaro
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(bird.x, bird.y, BIRD_SIZE, BIRD_SIZE);
    // Tuberías
    ctx.fillStyle = '#228B22';
    for (const pipe of pipes) {
      ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.gapY);
      ctx.fillRect(pipe.x, pipe.gapY + PIPE_GAP, PIPE_WIDTH, height - pipe.gapY - PIPE_GAP);
    }
    // Marcador
    ctx.fillStyle = '#000';
    ctx.font = '20px Arial';
    ctx.fillText(`Puntuación: ${score}`, 10, 30);
    ctx.fillText(`Nivel: ${level}`, width - 100, 30);
    if (gameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, height / 2 - 40, width, 80);
      ctx.fillStyle = '#FFF';
      ctx.font = '30px Arial';
      ctx.fillText('¡Fin del juego!', width / 2 - 100, height / 2);
      ctx.font = '20px Arial';
      ctx.fillText('Pulsa ESPACIO para reiniciar', width / 2 - 140, height / 2 + 30);
    }
  }

  function update() {
    if (gameOver) return;
    // Gravedad
    bird.vy += GRAVITY;
    bird.y += bird.vy;
    // Movimiento de tuberías
    for (const pipe of pipes) {
      pipe.x -= PIPE_SPEED;
      if (pipe.moving) {
        pipe.gapY += Math.sin(Date.now() / 500) * 2;
      }
      if (pipe.x + PIPE_WIDTH < 0) {
        pipe.x = width;
        pipe.gapY = Math.random() * (height - PIPE_GAP - 40) + 20;
        score++;
        if (score === 10) level = 2; // Cambiar a nivel 2
      }
      // Colisión
      if (
        bird.x < pipe.x + PIPE_WIDTH &&
        bird.x + BIRD_SIZE > pipe.x &&
        (bird.y < pipe.gapY || bird.y + BIRD_SIZE > pipe.gapY + PIPE_GAP)
      ) {
        gameOver = true;
      }
    }
    // Fuera de la pantalla
    if (bird.y < 0 || bird.y + BIRD_SIZE > height) {
      gameOver = true;
    }
  }

  function keydown(e) {
    if (e.key === ' ' && !gameOver) {
      bird.vy = FLAP;
    } else if (e.key === ' ' && gameOver) {
      initGame();
    }
  }

  function start(canvasElement) {
    canvas = canvasElement;
    ctx = canvas.getContext('2d');
    width = canvas.width;
    height = canvas.height;
    document.addEventListener('keydown', keydown);
    initGame();
    loop();
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  window.registerGame = function registerGame() {
    const canvasEl = document.getElementById('gameCanvas');
    start(canvasEl);
    return function cleanup() {
      document.removeEventListener('keydown', keydown);
    };
  };
})();