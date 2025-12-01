// script-recoge-moras.js
// Juego: Recoge Moras
// Autor: ChechuJA + GitHub Copilot

(function(){
  let canvas, ctx, width, height;
  let player, moras, score, gameOver, keys, timer, timeLeft;
  let backgroundImage, playerImage, moraImage;
  const PLAYER_SIZE = 32;
  const MORA_SIZE = 20;
  const GAME_TIME = 30; // segundos
  const MORA_COUNT = 5;
  function bgReady(){ return backgroundImage && backgroundImage.complete && backgroundImage.naturalWidth>0; }
  function playerReady(){ return playerImage && playerImage.complete && playerImage.naturalWidth>0; }
  function moraReady(){ return moraImage && moraImage.complete && moraImage.naturalWidth>0; }

  function initGame() {
    score = 0;
    timeLeft = GAME_TIME;
    gameOver = false;
    player = { x: width/2 - PLAYER_SIZE/2, y: height-PLAYER_SIZE-10, speed: 5 };
    moras = [];
    for(let i=0; i<MORA_COUNT; i++) {
      moras.push({ x: Math.random()*(width-MORA_SIZE), y: Math.random()*(height/2), collected: false });
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
    if (bgReady()) ctx.drawImage(backgroundImage, 0, 0, width, height);
    else { ctx.fillStyle = '#b6e685'; ctx.fillRect(0,0,width,height); }
    // Jugador
    if (playerReady()) ctx.drawImage(playerImage, player.x, player.y, PLAYER_SIZE, PLAYER_SIZE);
    else {
      ctx.fillStyle = '#6b3e26';
      ctx.fillRect(player.x, player.y, PLAYER_SIZE, PLAYER_SIZE);
    }
    // Moras
    for(let mora of moras) {
      if(!mora.collected) {
        if (moraReady()) ctx.drawImage(moraImage, mora.x, mora.y, MORA_SIZE, MORA_SIZE);
        else {
          ctx.beginPath();
          ctx.arc(mora.x+MORA_SIZE/2, mora.y+MORA_SIZE/2, MORA_SIZE/2, 0, 2*Math.PI);
          ctx.fillStyle = '#7b1fa2';
          ctx.fill();
          ctx.strokeStyle = '#4a148c';
          ctx.stroke();
        }
      }
    }
    // Marcadores
    ctx.fillStyle = '#222';
    ctx.font = '18px Arial';
    ctx.fillText('Moras: '+score, 10, 24);
    ctx.fillText('Tiempo: '+timeLeft+'s', width-120, 24);
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
    if(keys['ArrowRight'] && player.x<width-PLAYER_SIZE) player.x += player.speed;
    if(keys['ArrowUp'] && player.y>0) player.y -= player.speed;
    if(keys['ArrowDown'] && player.y<height-PLAYER_SIZE) player.y += player.speed;
    // Colisión con moras
    for(let mora of moras) {
      if(!mora.collected && collide(player, PLAYER_SIZE, mora, MORA_SIZE)) {
        mora.collected = true;
        score++;
      }
    }
    // Si todas recogidas, reponer
    if(moras.every(m=>m.collected)) {
      for(let mora of moras) {
        mora.x = Math.random()*(width-MORA_SIZE);
        mora.y = Math.random()*(height/2);
        mora.collected = false;
      }
    }
  }

  function collide(a, as, b, bs) {
    return a.x < b.x+bs && a.x+as > b.x && a.y < b.y+bs && a.y+as > b.y;
  }

  function endGame() {
    gameOver = true;
    clearInterval(timer);
    // Guardar récord si es el mejor
    let best = parseInt(localStorage.getItem('recogeMorasRecord')||'0');
    if(score>best) localStorage.setItem('recogeMorasRecord', score);
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
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
  backgroundImage = new Image(); backgroundImage.src = 'assets/recoge-moras-background.png'; backgroundImage.onerror = ()=>{ backgroundImage.src = 'assets/recoge-moras-background.svg'; };
  playerImage = new Image(); playerImage.src = 'assets/recoge-moras-player.png'; playerImage.onerror = ()=>{ playerImage.src = 'assets/recoge-moras-player.svg'; };
  moraImage = new Image(); moraImage.src = 'assets/recoge-moras-mora.png'; moraImage.onerror = ()=>{ moraImage.src = 'assets/recoge-moras-mora.svg'; };
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
})();
