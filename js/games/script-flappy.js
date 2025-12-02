function registerGame() {
  const canvas = document.getElementById('gameCanvas');

  // Ensure proper canvas size initialization
  canvas.width = 800;
  canvas.height = 500;

  return initFlappy(canvas);
}

function initFlappy(canvas) {
  if (!canvas || !canvas.getContext) {
    console.error("Canvas no disponible para Flappy");
    return function cleanup(){};
  }

  const ctx = canvas.getContext('2d');
  let animationFrame = null;
  canvas.width = 800;
  canvas.height = 500;

  // Configuración del juego
  const ui = window.GameUI;
  const playerName = localStorage.getItem('playerName') || 'Jugador';

  // Variables del juego
  let score = 0;
  let highScore = +(localStorage.getItem('flappyHighScore') || 0);
  let highScoreName = localStorage.getItem('flappyHighScoreName') || '';
  let gameOver = false;
  let showIntro = true;
  let particles = [];

  // Constantes
  const gravity = 0.4;
  const flapPower = 7;
  const buildingWidth = 80;
  const windowGapHeight = 130;
  const buildingSpacing = 220;
  const groundHeight = 80;

  // Colores
  const COLORS = {
    sky: ['#81d4fa', '#4fc3f7'],
    bird: ['#f4ce4a', '#f4b400'],
    buildings: ['#455a64', '#37474f', '#263238'],
    windows: ['#ffeb3b', '#fdd835'],
    ground: ['#8d6e63', '#795548'],
    clouds: 'rgba(255, 255, 255, 0.8)',
    text: '#ffffff',
    particles: ['#f4ce4a', '#ffeb3b', '#ffc107', '#ff9800']
  };

  // Pájaro
  const bird = {
    x: canvas.width / 4,
    y: canvas.height / 2,
    width: 34,
    height: 24,
    velocity: 0,
    rotation: 0,
    wingPosition: 0,
    wingDirection: 1,
    wingSpeed: 0.15,

    flap: function () {
      if (gameOver) return;
      this.velocity = -flapPower;
      createParticles(this.x, this.y + this.height / 2, 5, COLORS.particles);
    },

    update: function () {
      this.wingPosition += this.wingSpeed * this.wingDirection;
      if (this.wingPosition > 1 || this.wingPosition < 0) {
        this.wingDirection *= -1;
      }

      this.velocity += gravity;
      this.y += this.velocity;

      const targetRotation = this.velocity * 3;
      this.rotation = this.rotation * 0.8 + targetRotation * 0.2;
      if (this.rotation > 60) this.rotation = 60;
      if (this.rotation < -30) this.rotation = -30;

      if (this.y + this.height > canvas.height - groundHeight) {
        this.y = canvas.height - groundHeight - this.height;
        if (!gameOver) {
          gameOver = true;
          createParticles(this.x, this.y + this.height / 2, 40, COLORS.particles);
          if (score > highScore) {
            highScore = score;
            highScoreName = playerName;
            localStorage.setItem('flappyHighScore', highScore);
            localStorage.setItem('flappyHighScoreName', highScoreName);
          }
        }
      }
      if (this.y < 0) {
        this.y = 0;
        this.velocity = 1;
      }
    },

    draw: function () {
      ctx.save();
      ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
      ctx.rotate(this.rotation * Math.PI / 180);

      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetY = 5;

      const gradient = ctx.createLinearGradient(-this.width / 2, -this.height / 2, -this.width / 2, this.height / 2);
      gradient.addColorStop(0, COLORS.bird[0]);
      gradient.addColorStop(1, COLORS.bird[1]);

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.ellipse(0, 0, this.width / 2, this.height / 2, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      const wingY = this.wingPosition * 6 - 3;
      ctx.ellipse(-2, wingY, this.width / 3, this.height / 4, 0.5, 0, Math.PI * 2);
      ctx.fillStyle = COLORS.bird[0];
      ctx.fill();

      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(this.width / 4, -this.height / 6, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.beginPath();
      ctx.arc(-this.width / 4, -this.height / 4, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ff9800';
      ctx.beginPath();
      ctx.moveTo(this.width / 2, -2);
      ctx.lineTo(this.width / 2 + 10, 0);
      ctx.lineTo(this.width / 2, 2);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }
  };

  let buildings = [];

  function addBuilding() {
    const windowY = Math.random() * (canvas.height - groundHeight - windowGapHeight - 120) + 60;
    const buildingHeight = canvas.height - groundHeight;
    const windowPattern = Math.floor(Math.random() * 3);

    buildings.push({
      x: canvas.width,
      y: 0,
      height: buildingHeight,
      width: buildingWidth,
      windowY: windowY,
      windowHeight: windowGapHeight,
      windowPattern: windowPattern,
      color: COLORS.buildings[Math.floor(Math.random() * COLORS.buildings.length)],
      passed: false
    });
  }

  function drawClouds() {
    const cloudPositions = [
      { x: canvas.width * 0.1, y: canvas.height * 0.15, size: 40 },
      { x: canvas.width * 0.4, y: canvas.height * 0.1, size: 50 },
      { x: canvas.width * 0.7, y: canvas.height * 0.2, size: 35 },
      { x: canvas.width * 0.9, y: canvas.height * 0.12, size: 45 }
    ];
    ctx.fillStyle = COLORS.clouds;
    cloudPositions.forEach(cloud => {
      ctx.beginPath();
      ctx.arc(cloud.x, cloud.y, cloud.size, 0, Math.PI * 2);
      ctx.arc(cloud.x + cloud.size * 0.8, cloud.y, cloud.size * 0.7, 0, Math.PI * 2);
      ctx.arc(cloud.x + cloud.size * 1.5, cloud.y, cloud.size * 0.9, 0, Math.PI * 2);
      ctx.arc(cloud.x + cloud.size * 0.6, cloud.y - cloud.size * 0.4, cloud.size * 0.8, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function createParticles(x, y, count, colors) {
    for (let i = 0; i < count; i++) {
      particles.push({
        x: x,
        y: y,
        size: Math.random() * 5 + 2,
        speedX: (Math.random() - 0.5) * 6,
        speedY: (Math.random() - 0.5) * 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 30 + Math.random() * 20
      });
    }
  }

  function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
      particles[i].x += particles[i].speedX;
      particles[i].y += particles[i].speedY;
      particles[i].speedY += 0.1;
      particles[i].life--;
      particles[i].size *= 0.95;
      if (particles[i].life <= 0 || particles[i].size <= 0.5) {
        particles.splice(i, 1);
      }
    }
  }

  function drawParticles() {
    particles.forEach(p => {
      ctx.globalAlpha = p.life / 50;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  }

  function drawGround() {
    const groundGradient = ctx.createLinearGradient(0, canvas.height - groundHeight, 0, canvas.height);
    groundGradient.addColorStop(0, COLORS.ground[0]);
    groundGradient.addColorStop(1, COLORS.ground[1]);
    ctx.fillStyle = groundGradient;
    ctx.fillRect(0, canvas.height - groundHeight, canvas.width, groundHeight);
  }

  function drawBuildings() {
    buildings.forEach(building => {
      ctx.fillStyle = building.color;
      ctx.fillRect(building.x, building.y, building.width, building.height);
      ctx.clearRect(building.x, building.windowY, building.width, building.windowHeight);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 3;
      ctx.strokeRect(building.x, building.windowY, building.width, building.windowHeight);
    });
  }

  function checkCollisions() {
    if (gameOver) return;
    for (let i = 0; i < buildings.length; i++) {
      const building = buildings[i];
      if (!building.passed && bird.x > building.x + building.width) {
        building.passed = true;
        score++;
        createParticles(bird.x + bird.width, bird.y, 10, COLORS.particles);
      }
      if (bird.x + bird.width > building.x && bird.x < building.x + building.width) {
        const isThroughWindow = (bird.y > building.windowY && bird.y + bird.height < building.windowY + building.windowHeight);
        if (!isThroughWindow) {
          gameOver = true;
          createParticles(bird.x, bird.y, 30, COLORS.particles);
          if (score > highScore) {
            highScore = score;
            highScoreName = playerName;
            localStorage.setItem('flappyHighScore', highScore);
            localStorage.setItem('flappyHighScoreName', highScoreName);
          }
        }
      }
    }
  }

  function drawInfo() {
    try {
      if (ui && typeof ui.gradientBar === "function") {
        ui.gradientBar(ctx, canvas, { from: '#3949ab', to: '#1a237e' });
        ui.shadowText(ctx, 'Flappy City', 20, 25, { size: 20 });
      } else {
        const headerGrad = ctx.createLinearGradient(0, 0, 0, 50);
        headerGrad.addColorStop(0, '#3949ab');
        headerGrad.addColorStop(1, '#1a237e');
        ctx.fillStyle = headerGrad;
        ctx.fillRect(0, 0, canvas.width, 50);
        ctx.font = 'bold 20px Arial';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'left';
        ctx.fillText('Flappy City', 20, 25);
      }
    } catch (err) {
      console.error("Error en drawInfo:", err);
    }
    ctx.font = '16px Arial';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.fillText('Puntuación: ' + score, canvas.width / 2, 25);
    ctx.textAlign = 'right';
    ctx.fillText('Récord: ' + highScore + (highScoreName ? ' (' + highScoreName + ')' : ''), canvas.width - 20, 25);
    ctx.textAlign = 'left';
  }

  function drawIntro() {
    const lines = [
      "Pulsa ESPACIO o CLICK para que el pájaro aletee.",
      "Pasa por las ventanas de los edificios sin chocar.",
      "Cada edificio superado suma un punto.",
      "No toques el suelo ni el techo.",
      "Pulsa cualquier tecla para empezar."
    ];
    const w = canvas.width - 140;
    const h = 220;
    const x = 70;
    const y = 120;
    ctx.fillStyle = 'rgba(15, 25, 40, 0.95)';
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = '#ffeb3b';
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Flappy City', canvas.width / 2, y + 40);
    ctx.fillStyle = '#fff';
    ctx.font = '15px Arial';
    for (let i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], canvas.width / 2, y + 80 + i * 26);
    }
    bird.draw();
  }

  function drawGameOver() {
    const w = canvas.width - 200;
    const h = 200;
    const x = 100;
    const y = 150;
    ctx.fillStyle = 'rgba(30, 30, 60, 0.9)';
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('¡GAME OVER!', canvas.width / 2, y + 60);
    ctx.font = '22px Arial';
    ctx.fillText('Puntuación final: ' + score, canvas.width / 2, y + 100);
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    bgGradient.addColorStop(0, COLORS.sky[0]);
    bgGradient.addColorStop(1, COLORS.sky[1]);
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawClouds();
    drawBuildings();
    drawGround();
    bird.draw();
    drawParticles();
    drawInfo();
    if (showIntro) { drawIntro(); return; }
    if (gameOver) { drawGameOver(); }
  }

  let frameCount = 0;
  let buildingTimer = 0;

  function update() {
    if (showIntro || gameOver) return;
    frameCount++;
    buildingTimer++;
    bird.update();
    if (buildingTimer >= buildingSpacing) {
      addBuilding();
      buildingTimer = 0;
    }
    for (let i = buildings.length - 1; i >= 0; i--) {
      buildings[i].x -= 3;
      if (buildings[i].x + buildings[i].width < 0) {
        buildings.splice(i, 1);
      }
    }
    checkCollisions();
    updateParticles();
  }

  function resetGame() {
    score = 0;
    gameOver = false;
    bird.y = canvas.height / 2;
    bird.velocity = 0;
    bird.rotation = 0;
    buildings = [];
    particles = [];
    frameCount = 0;
    buildingTimer = 0;
  }

  function keyDownHandler(e) {
    if (showIntro) { showIntro = false; return; }
    if (e.code === 'Space') {
      if (gameOver) resetGame();
      else bird.flap();
    }
    if (e.code === 'ArrowUp' || e.code === 'ArrowDown') {
      if (!gameOver) bird.flap();
    }
  }

  function clickHandler() {
    if (showIntro) { showIntro = false; return; }
    if (gameOver) resetGame();
    else bird.flap();
  }

  const keyDownListener = e => keyDownHandler(e);
  const clickListener = () => clickHandler();
  document.addEventListener('keydown', keyDownListener);
  canvas.addEventListener('click', clickListener);

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

  // Bucle principal
  function gameLoop() {
    try {
      update();
      draw();
    } catch (err) {
      console.error("Error en gameLoop:", err);
    }
    setTimeout(() => {
      animationFrame = requestAnimationFrame(gameLoop);
    }, 1000 / (60 * gameSpeed)); // Ajusta la velocidad del juego
  }

  gameLoop();

  return function cleanup() {
    document.removeEventListener('keydown', keyDownListener);
    canvas.removeEventListener('click', clickListener);
    if (animationFrame) cancelAnimationFrame(animationFrame);
  };
}

window.registerGame = registerGame;
