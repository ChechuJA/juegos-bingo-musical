// script-juego-habilidad.js
// Juego: Esquiva Obstáculos
// Autor: ChechuJA + GitHub Copilot

(function(){
  let canvas, ctx, width, height;
  let player, obstacles, score, gameOver, keys;
  let backgroundImage, characterImage;
  const PLAYER_SIZE = 30;
  const OBSTACLE_SIZE = 20;
  const OBSTACLE_COUNT = 5;
  const GAME_SPEED = 3;
  function bgReady(){ return backgroundImage && backgroundImage.complete && backgroundImage.naturalWidth>0; }
  function charReady(){ return characterImage && characterImage.complete && characterImage.naturalWidth>0; }

  function initGame() {
    score = 0;
    gameOver = false;
    player = { x: width/2 - PLAYER_SIZE/2, y: height - PLAYER_SIZE - 10, speed: 5 };
    obstacles = [];
    for(let i=0; i<OBSTACLE_COUNT; i++) {
      obstacles.push({ x: Math.random() * (width - OBSTACLE_SIZE), y: -Math.random() * height, speed: GAME_SPEED + Math.random() * 2 });
    }
    keys = {};
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    // Fondo
    if (bgReady()) {
      ctx.drawImage(backgroundImage, 0, 0, width, height);
    } else {
      // Mejorar el fondo con un degradado
      const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
      bgGradient.addColorStop(0, '#81d4fa');
      bgGradient.addColorStop(1, '#4fc3f7');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, width, height);
      
      // Añadir algunas nubes decorativas
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      for (let i = 0; i < 5; i++) {
        const cloudX = (i * width / 5) + Math.sin(Date.now() / 10000 + i) * 50;
        const cloudY = 50 + i * 20;
        const cloudSize = 30 + i * 5;
        
        ctx.beginPath();
        ctx.arc(cloudX, cloudY, cloudSize, 0, Math.PI * 2);
        ctx.arc(cloudX + cloudSize * 0.6, cloudY - 10, cloudSize * 0.7, 0, Math.PI * 2);
        ctx.arc(cloudX - cloudSize * 0.6, cloudY - 5, cloudSize * 0.7, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    // Jugador
    if (charReady()) {
      ctx.drawImage(characterImage, player.x, player.y, PLAYER_SIZE, PLAYER_SIZE);
    } else {
      // Dibujar una nave más detallada
      ctx.fillStyle = '#ff5722';
      ctx.beginPath();
      ctx.moveTo(player.x + PLAYER_SIZE/2, player.y);
      ctx.lineTo(player.x + PLAYER_SIZE, player.y + PLAYER_SIZE);
      ctx.lineTo(player.x, player.y + PLAYER_SIZE);
      ctx.closePath();
      ctx.fill();
      
      // Añadir detalles a la nave
      ctx.fillStyle = '#ffd54f';
      ctx.beginPath();
      ctx.moveTo(player.x + PLAYER_SIZE/2, player.y + PLAYER_SIZE/4);
      ctx.lineTo(player.x + PLAYER_SIZE*0.7, player.y + PLAYER_SIZE);
      ctx.lineTo(player.x + PLAYER_SIZE*0.3, player.y + PLAYER_SIZE);
      ctx.closePath();
      ctx.fill();
      
      // Efectos de propulsión
      const flameHeight = 10 + Math.random() * 5;
      ctx.fillStyle = '#f57c00';
      ctx.beginPath();
      ctx.moveTo(player.x + PLAYER_SIZE*0.3, player.y + PLAYER_SIZE);
      ctx.lineTo(player.x + PLAYER_SIZE/2, player.y + PLAYER_SIZE + flameHeight);
      ctx.lineTo(player.x + PLAYER_SIZE*0.7, player.y + PLAYER_SIZE);
      ctx.closePath();
      ctx.fill();
    }
    
    // Obstáculos
    for(let obstacle of obstacles) {
      // Mejorar visualmente los obstáculos con gradientes y sombras
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 5;
      ctx.shadowOffsetY = 3;
      
      const gradient = ctx.createLinearGradient(
        obstacle.x, obstacle.y, 
        obstacle.x + OBSTACLE_SIZE, obstacle.y + OBSTACLE_SIZE
      );
      gradient.addColorStop(0, '#81c784');
      gradient.addColorStop(1, '#4caf50');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(
        obstacle.x + OBSTACLE_SIZE/2, 
        obstacle.y + OBSTACLE_SIZE/2, 
        OBSTACLE_SIZE/2, 0, Math.PI * 2
      );
      ctx.fill();
      
      // Añadir detalles a los obstáculos
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.beginPath();
      ctx.arc(
        obstacle.x + OBSTACLE_SIZE*0.35, 
        obstacle.y + OBSTACLE_SIZE*0.35, 
        OBSTACLE_SIZE*0.15, 0, Math.PI * 2
      );
      ctx.fill();
      
      // Restaurar sombras
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;
    }
    
    // Marcadores
    ctx.fillStyle = '#222';
    ctx.font = 'bold 20px Arial';
    ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
    ctx.shadowBlur = 3;
    ctx.fillText('Puntos: ' + score, 15, 30);
    ctx.shadowBlur = 0;
    
    if(gameOver) {
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(0, height/2 - 60, width, 120);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 32px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('¡Fin del juego!', width/2, height/2 - 20);
      ctx.font = '22px Arial';
      ctx.fillText('Puntuación: ' + score, width/2, height/2 + 15);
      
      // Efecto pulsante en el texto de reinicio
      const pulse = Math.sin(Date.now() / 300) * 0.1 + 0.9;
      ctx.globalAlpha = pulse;
      ctx.fillText('Pulsa ESPACIO para reiniciar', width/2, height/2 + 50);
      ctx.globalAlpha = 1;
      ctx.textAlign = 'left';
    }
  }

  function update() {
    if(gameOver) return;
    // Movimiento jugador
    if(keys['ArrowLeft'] && player.x > 0) player.x -= player.speed;
    if(keys['ArrowRight'] && player.x < width - PLAYER_SIZE) player.x += player.speed;
    if(keys['ArrowUp'] && player.y > 0) player.y -= player.speed;
    if(keys['ArrowDown'] && player.y < height - PLAYER_SIZE) player.y += player.speed;
    // Movimiento obstáculos
    for(let obstacle of obstacles) {
      obstacle.y += obstacle.speed;
      if(obstacle.y > height) {
        obstacle.y = -OBSTACLE_SIZE;
        obstacle.x = Math.random() * (width - OBSTACLE_SIZE);
        score++;
      }
      // Colisión
      if(collide(player, PLAYER_SIZE, OBSTACLE_SIZE, obstacle, OBSTACLE_SIZE, OBSTACLE_SIZE)) {
        endGame();
      }
    }
  }

  function collide(a, aw, ah, b, bw, bh) {
    return a.x < b.x + bw && a.x + aw > b.x && a.y < b.y + bh && a.y + ah > b.y;
  }

  function endGame() {
    gameOver = true;
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  function keydown(e) {
    keys[e.key] = true;
    if(gameOver && e.key === ' ') {
      initGame();
    }
  }
  function keyup(e) {
    keys[e.key] = false;
  }

  function start(canvasElement) {
    canvas = canvasElement;
    ctx = canvas.getContext('2d');
    width = canvas.width;
    height = canvas.height;
  // Carga de imágenes
  backgroundImage = new Image();
  backgroundImage.src = 'assets/juego-habilidad-background.png';
  backgroundImage.onerror = () => { backgroundImage.src = 'assets/juego-habilidad-background.svg'; };
  characterImage = new Image();
  characterImage.src = 'assets/juego-habilidad-character.png';
  characterImage.onerror = () => { characterImage.src = 'assets/juego-habilidad-character.svg'; };
    document.addEventListener('keydown', keydown);
    document.addEventListener('keyup', keyup);
    initGame();
    loop();
  }

  window.registerGame = function registerGame() {
    const canvasEl = document.getElementById('gameCanvas');
    start(canvasEl);
    return function cleanup() {
      document.removeEventListener('keydown', keydown);
      document.removeEventListener('keyup', keyup);
    };
  };
})();
