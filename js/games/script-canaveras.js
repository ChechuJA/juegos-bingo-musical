// script-canaveras.js
// Juego: Cañas verás
// Autor: ChechuJA + GitHub Copilot

(function(){
  let canvas, ctx, width, height;
  let player, canas, score, gameOver, keys, timer, timeLeft;
  let backgroundImage, playerImage, canaImage;
  const PLAYER_WIDTH = 36, PLAYER_HEIGHT = 36;
  const CANA_WIDTH = 18, CANA_HEIGHT = 60;
  const GAME_TIME = 40; // segundos
  const CANA_COUNT = 6;
  let gameSpeed = 1; // Variable global para controlar la velocidad del juego
  function bgReady(){ return backgroundImage && backgroundImage.complete && backgroundImage.naturalWidth>0; }
  function playerReady(){ return playerImage && playerImage.complete && playerImage.naturalWidth>0; }
  function canaReady(){ return canaImage && canaImage.complete && canaImage.naturalWidth>0; }

  function initGame() {
    score = 0;
    timeLeft = GAME_TIME;
    gameOver = false;
    player = { x: width/2-PLAYER_WIDTH/2, y: height-PLAYER_HEIGHT-10, speed: 6 };
    canas = [];
    for(let i=0; i<CANA_COUNT; i++) {
      canas.push({ x: Math.random()*(width-CANA_WIDTH), y: -Math.random()*height, speed: 2+Math.random()*2, caught: false });
    }
    keys = {};
    if(timer) clearInterval(timer);
    timer = setInterval(()=>{
      if(!gameOver) {
        timeLeft--;
        if(timeLeft<=0) endGame();
      }
    }, 1000);
  }

  function draw() {
    ctx.clearRect(0,0,width,height);
  // Fondo
  if(bgReady()) ctx.drawImage(backgroundImage, 0, 0, width, height);
  else { ctx.fillStyle = '#b3e5fc'; ctx.fillRect(0,0,width,height); }
  // Jugador (niño/a)
  if(playerReady()) ctx.drawImage(playerImage, player.x, player.y, PLAYER_WIDTH, PLAYER_HEIGHT);
  else { ctx.fillStyle = '#ffb300'; ctx.fillRect(player.x, player.y, PLAYER_WIDTH, PLAYER_HEIGHT); }
    // Cañas
    for(let cana of canas) {
      if(!cana.caught) {
  if(canaReady()) ctx.drawImage(canaImage, cana.x, cana.y, CANA_WIDTH, CANA_HEIGHT);
  else { ctx.fillStyle = '#8d6e63'; ctx.fillRect(cana.x, cana.y, CANA_WIDTH, CANA_HEIGHT); ctx.fillStyle = '#388e3c'; ctx.fillRect(cana.x, cana.y, CANA_WIDTH, 18); }
      }
    }
    // Marcadores
    ctx.fillStyle = '#222';
    ctx.font = '18px Arial';
    ctx.fillText('Cañas: '+score, 10, 24);
    ctx.fillText('Tiempo: '+timeLeft+'s', width-120, 24);
    ctx.fillText('Récord: '+(localStorage.getItem('canaverasRecord') || 0), width-120, 50); // Mostrar récord
    if(gameOver) {
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(0, height/2-40, width, 80);
      ctx.fillStyle = '#fff';
      ctx.font = '32px Arial';
      ctx.fillText('¡Fin del juego!', width/2-110, height/2);
      ctx.font = '20px Arial';
      ctx.fillText('Puntuación: '+score, width/2-60, height/2+30);
      ctx.fillText('Pulsa ESPACIO para reiniciar', width/2-120, height/2+60);
    }
  }

  function update() {
    if(gameOver) return;
    // Movimiento jugador
    if(keys['ArrowLeft'] && player.x>0) player.x -= player.speed;
    if(keys['ArrowRight'] && player.x<width-PLAYER_WIDTH) player.x += player.speed;
    // Caída de cañas
    for(let cana of canas) {
      if(!cana.caught) {
        cana.y += cana.speed;
        if(cana.y > height) {
          cana.x = Math.random()*(width-CANA_WIDTH);
          cana.y = -CANA_HEIGHT;
          cana.speed = 2+Math.random()*2;
        }
        // Colisión
        if(collide(player, PLAYER_WIDTH, PLAYER_HEIGHT, cana, CANA_WIDTH, CANA_HEIGHT)) {
          cana.caught = true;
          score++;
        }
      }
    }
    // Si todas atrapadas, reponer
    if(canas.every(c=>c.caught)) {
      for(let cana of canas) {
        cana.x = Math.random()*(width-CANA_WIDTH);
        cana.y = -Math.random()*height;
        cana.speed = 2+Math.random()*2;
        cana.caught = false;
      }
    }
  }

  function collide(a, aw, ah, b, bw, bh) {
    return a.x < b.x+bw && a.x+aw > b.x && a.y < b.y+bh && a.y+ah > b.y;
  }

  function endGame() {
    gameOver = true;
    clearInterval(timer);
    // Guardar récord si es el mejor
    let best = parseInt(localStorage.getItem('canaverasRecord')||'0');
    if(score>best) localStorage.setItem('canaverasRecord', score);
  }

  function loop() {
    update();
    draw();
    setTimeout(() => {
      requestAnimationFrame(loop);
    }, 1000 / (60 * gameSpeed)); // Ajusta la velocidad del juego
  }

  function keydown(e) {
    keys[e.key] = true;
    if(gameOver && e.key===' ') {
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
  backgroundImage = new Image(); backgroundImage.src = 'assets/canaveras-background.png'; backgroundImage.onerror = ()=>{ backgroundImage.src = 'assets/canaveras-background.svg'; };
  playerImage = new Image(); playerImage.src = 'assets/canaveras-player.png'; playerImage.onerror = ()=>{ playerImage.src = 'assets/canaveras-player.svg'; };
  canaImage = new Image(); canaImage.src = 'assets/canaveras-cana.png'; canaImage.onerror = ()=>{ canaImage.src = 'assets/canaveras-cana.svg'; };
    canvas.style.zIndex = '10';
    document.addEventListener('keydown', keydown);
    document.addEventListener('keyup', keyup);
    initGame();
    loop();
  }

  window.registerGame = function registerGame(){
    const canvasEl = document.getElementById('gameCanvas');
    start(canvasEl);
    return function cleanup(){
      document.removeEventListener('keydown', keydown);
      document.removeEventListener('keyup', keyup);
      if(timer) clearInterval(timer);
    };
  };

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
})();
