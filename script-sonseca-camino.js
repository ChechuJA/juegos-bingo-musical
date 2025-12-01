// script-sonseca-camino.js
// Juego: Sonseca - "Andándose hace el camino"
// Autor: ChechuJA + GitHub Copilot

(function(){
  // Frases curiosas y datos de Sonseca
  const curiosidades = [
    "Sonseca tiene una población de 11,000 habitantes censados.",
    "La superficie de Sonseca es de 145 km².",
    "El mazapán de Sonseca es reconocido a nivel nacional.",
    "La industria del mueble en Sonseca tiene más de 50 años de historia.",
    "El dedal es un pequeño objeto usado para proteger los dedos al coser.",
    "La rueca es una herramienta antigua para hilar fibras naturales.",
    "La madera de olivo es muy valorada por su resistencia y belleza.",
    "El bordado es una técnica de costura decorativa con hilos de colores.",
    "El martillo de carpintero tiene una cara plana y una uña para clavos.",
    "La gubia es una herramienta usada para tallar madera con precisión."
  ];

  let canvas, ctx, width, height;
  let player, camino, paso, fraseIndex, showFrase, gameOver, keys;
  const PLAYER_SIZE = 36;
  const PASO_SIZE = 32;
  const PASOS_TOTAL = 10;

  function initGame() {
    player = { x: width/2-PLAYER_SIZE/2, y: height-PLAYER_SIZE-10, speed: 5 };
    camino = [];
    for(let i=0; i<PASOS_TOTAL; i++) {
      camino.push({ x: Math.random()*(width-PASO_SIZE), y: 60+i*(height-120)/PASOS_TOTAL, visible: true });
    }
    paso = 0;
    fraseIndex = 0;
    showFrase = false;
    gameOver = false;
    keys = {};
  }

  function draw() {
    ctx.clearRect(0,0,width,height);
    // Fondo
    ctx.fillStyle = '#e0e0e0';
    ctx.fillRect(0,0,width,height);
    // Camino con costura
    for(let i=0; i<camino.length; i++) {
      if(camino[i].visible) {
        ctx.fillStyle = '#8d6e63';
        ctx.fillRect(camino[i].x, camino[i].y, PASO_SIZE, PASO_SIZE);
        ctx.fillStyle = '#fff';
        ctx.font = '16px Arial';
        ctx.fillText((i+1), camino[i].x+10, camino[i].y+22);
      } else {
        // Dibujar costura detrás del jugador
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(camino[i].x + PASO_SIZE / 2, camino[i].y + PASO_SIZE / 2);
        ctx.lineTo(player.x + PLAYER_SIZE / 2, player.y + PLAYER_SIZE / 2);
        ctx.stroke();
      }
    }
    // Jugador
    ctx.fillStyle = '#1976d2';
    ctx.fillRect(player.x, player.y, PLAYER_SIZE, PLAYER_SIZE);
    ctx.fillStyle = '#fff';
    ctx.font = '15px Arial';
    ctx.fillText('Tú', player.x+7, player.y+24);
    // Frase
    if(showFrase) {
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(0, height/2-60, width, 120);
      ctx.fillStyle = '#fffde7';
      ctx.font = '20px Arial';
      ctx.fillText('Dato curioso:', width/2-80, height/2-10);
      ctx.font = '18px Arial';
      ctx.fillText(curiosidades[fraseIndex], width/2-ctx.measureText(curiosidades[fraseIndex]).width/2, height/2+30);
      ctx.font = '16px Arial';
      ctx.fillText('Pulsa ESPACIO para seguir el camino', width/2-120, height/2+60);
    }
    // Lema
    ctx.fillStyle = '#388e3c';
    ctx.font = 'bold 18px Arial';
    ctx.fillText('"Andando se hace el camino"', width/2-110, 36);
    if(gameOver) {
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(0, height/2-40, width, 80);
      ctx.fillStyle = '#fff';
      ctx.font = '32px Arial';
      ctx.fillText('¡Fin del camino!', width/2-110, height/2);
      ctx.font = '20px Arial';
      ctx.fillText('Has descubierto '+PASOS_TOTAL+' curiosidades.', width/2-110, height/2+30);
      ctx.fillText('Pulsa ESPACIO para reiniciar', width/2-120, height/2+60);
    }
  }

  function update() {
    if(gameOver || showFrase) return;
    // Movimiento jugador
    if(keys['ArrowLeft'] && player.x>0) player.x -= player.speed;
    if(keys['ArrowRight'] && player.x<width-PLAYER_SIZE) player.x += player.speed;
    if(keys['ArrowUp'] && player.y>0) player.y -= player.speed;
    if(keys['ArrowDown'] && player.y<height-PLAYER_SIZE) player.y += player.speed;
    // Colisión con paso
    if(paso < camino.length && camino[paso].visible && collide(player, PLAYER_SIZE, camino[paso], PASO_SIZE)) {
      camino[paso].visible = false;
      showFrase = true;
      fraseIndex = Math.floor(Math.random()*curiosidades.length);
      paso++;
      if(paso>=PASOS_TOTAL) gameOver = true;
    }
  }

  function collide(a, asize, b, bsize) {
    return a.x < b.x+bsize && a.x+asize > b.x && a.y < b.y+bsize && a.y+asize > b.y;
  }

  function keydown(e) {
    keys[e.key] = true;
    if(showFrase && e.key===' ') {
      showFrase = false;
    }
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
    document.addEventListener('keydown', keydown);
    document.addEventListener('keyup', keyup);
    initGame();
    loop();
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  window.registerGame = function() {
    const canvas = document.getElementById('gameCanvas');
    start(canvas);
    return function cleanup() {
      document.removeEventListener('keydown', keydown);
      document.removeEventListener('keyup', keyup);
    };
  };
})();
