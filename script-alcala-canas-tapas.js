// script-alcala-canas-tapas.js
// Juego: Alcalá: Cañas y Tapas
// Autor: ChechuJA + GitHub Copilot

(function(){
  let canvas, ctx, width, height;
  let player, cañas, tapas, score, gameOver, keys, timer, timeLeft;
  let showIntro = true;  // Nueva variable para controlar pantalla de intro
  const PLAYER_SIZE = 34;
  const CAÑA_SIZE = 22;
  const TAPA_SIZE = 26;
  const GAME_TIME = 45; // segundos
  const CAÑA_COUNT = 3;
  const TAPA_COUNT = 3;
  
  // Colores y estilos mejorados
  const COLORS = {
    background: '#fffde7',
    backgroundGradient: ['#fff8e1', '#ffe082'],
    player: {
      fill: '#1976d2',
      stroke: '#0d47a1',
      text: '#ffffff'
    },
    caña: {
      glass: '#fffde7',
      beer: '#fbc02d',
      foam: '#fff9c4',
      stroke: '#bdbdbd'
    },
    tapa: {
      fill: '#d84315',
      stroke: '#6d4c41',
      details: '#ffab91'
    },
    scorePanel: {
      background: 'rgba(38, 50, 56, 0.8)',
      text: '#ffffff',
      highlight: '#ffee58'
    },
    gameOver: {
      background: 'rgba(0, 0, 0, 0.7)',
      text: '#ffffff',
      score: '#ffee58'
    }
  };

  function initGame() {
    score = 0;
    timeLeft = GAME_TIME;
    gameOver = false;
    showIntro = true;  // Mostrar intro al iniciar
    player = { x: width/2-PLAYER_SIZE/2, y: height-PLAYER_SIZE-10, speed: 5 };
    cañas = [];
    tapas = [];
    for(let i=0; i<CAÑA_COUNT; i++) {
      cañas.push({ x: Math.random()*(width-CAÑA_SIZE), y: -Math.random()*height, speed: 2+Math.random()*2, caught: false });
    }
    for(let i=0; i<TAPA_COUNT; i++) {
      tapas.push({ x: Math.random()*(width-TAPA_SIZE), y: -Math.random()*height, speed: 2+Math.random()*2, caught: false });
    }
    keys = {};
    if(timer) clearInterval(timer);
    timer = setInterval(()=>{
      if(!gameOver && !showIntro) {
        timeLeft--;
        if(timeLeft<=0) endGame();
      }
    }, 1000);
  }

  function draw() {
    ctx.clearRect(0,0,width,height);
    
    // Fondo con gradiente mejorado
    if(window.GameUI) {
      GameUI.softBg(ctx, width, height, COLORS.backgroundGradient);
    } else {
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, COLORS.backgroundGradient[0]);
      gradient.addColorStop(1, COLORS.backgroundGradient[1]);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    }
    
    // Si estamos en la intro, mostramos la pantalla de inicio
    if(showIntro) {
      drawIntro();
      return;
    }
    
    // Dibujar escenario - silueta de Alcalá al fondo
    drawAlcalaBackground();
    
    // Jugador con efecto 3D y sombra
    drawPlayer();
    
    // Cañas con animación y detalles
    for(let c of cañas) {
      if(!c.caught) {
        drawCaña(c);
      }
    }
    
    // Tapas con detalles y aspecto más apetitoso
    for(let t of tapas) {
      if(!t.caught) {
        drawTapa(t);
      }
    }
    
    // Panel de puntuación mejorado
    drawScorePanel();
    
    // Pantalla de fin de juego
    if(gameOver) {
      drawGameOver();
    }
  }
  
  // Nueva función para dibujar una silueta simple de Alcalá
  function drawAlcalaBackground() {
    ctx.save();
    ctx.globalAlpha = 0.1;
    ctx.fillStyle = '#607d8b';
    
    // Silueta sencilla de edificios
    // Torre/iglesia central
    ctx.beginPath();
    ctx.moveTo(width/2 - 50, height - 100);
    ctx.lineTo(width/2 - 50, height - 200);
    ctx.lineTo(width/2 - 30, height - 230);
    ctx.lineTo(width/2 + 30, height - 230);
    ctx.lineTo(width/2 + 50, height - 200);
    ctx.lineTo(width/2 + 50, height - 100);
    ctx.fill();
    
    // Edificios laterales
    for (let i = 0; i < 4; i++) {
      // Izquierda
      ctx.beginPath();
      const buildingWidth = 30 + Math.random() * 20;
      const buildingHeight = 60 + Math.random() * 40;
      const x = width/2 - 70 - i * (buildingWidth + 10);
      ctx.rect(x, height - 100, buildingWidth, -buildingHeight);
      ctx.fill();
      
      // Derecha
      ctx.beginPath();
      const buildingWidth2 = 30 + Math.random() * 20;
      const buildingHeight2 = 60 + Math.random() * 40;
      const x2 = width/2 + 70 + i * (buildingWidth2 + 10);
      ctx.rect(x2, height - 100, buildingWidth2, -buildingHeight2);
      ctx.fill();
    }
    
    ctx.restore();
  }
  
  // Función para dibujar el jugador
  function drawPlayer() {
    ctx.save();
    
    // Sombra
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 5;
    ctx.shadowOffsetY = 3;
    
    // Base del jugador con bordes redondeados
    ctx.fillStyle = COLORS.player.fill;
    ctx.beginPath();
    ctx.roundRect(player.x, player.y, PLAYER_SIZE, PLAYER_SIZE, 6);
    ctx.fill();
    
    // Borde
    ctx.strokeStyle = COLORS.player.stroke;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    
    // Texto con sombra interna
    ctx.shadowColor = 'transparent';
    ctx.font = 'bold 15px Arial';
    ctx.fillStyle = COLORS.player.text;
    ctx.fillText('Tú', player.x + PLAYER_SIZE/2 - 10, player.y + PLAYER_SIZE/2 + 5);
    
    ctx.restore();
  }
  
  // Función para dibujar una caña con detalles
  function drawCaña(c) {
    ctx.save();
    
    // Efecto de brillos/movimiento
    const time = Date.now() / 1000;
    const wobble = Math.sin(time * 3 + c.x) * 0.5;
    
    // Vaso
    ctx.fillStyle = COLORS.caña.glass;
    ctx.beginPath();
    ctx.roundRect(c.x, c.y, CAÑA_SIZE, CAÑA_SIZE, 2);
    ctx.fill();
    
    // Cerveza con ondulación
    ctx.fillStyle = COLORS.caña.beer;
    ctx.beginPath();
    ctx.moveTo(c.x + 2, c.y + CAÑA_SIZE - 4);
    ctx.lineTo(c.x + 2, c.y + CAÑA_SIZE - 2);
    ctx.lineTo(c.x + CAÑA_SIZE - 2, c.y + CAÑA_SIZE - 2);
    ctx.lineTo(c.x + CAÑA_SIZE - 2, c.y + CAÑA_SIZE - 4 + wobble);
    ctx.fill();
    
    // Espuma de la cerveza
    ctx.fillStyle = COLORS.caña.foam;
    ctx.beginPath();
    ctx.ellipse(c.x + CAÑA_SIZE/2, c.y + CAÑA_SIZE - 4 + wobble, CAÑA_SIZE/2 - 2, 2, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Reflejo en el vaso
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.beginPath();
    ctx.ellipse(c.x + CAÑA_SIZE/2 - 3, c.y + CAÑA_SIZE/4, 2, 5, Math.PI/4, 0, Math.PI * 2);
    ctx.fill();
    
    // Borde del vaso
    ctx.strokeStyle = COLORS.caña.stroke;
    ctx.lineWidth = 1;
    ctx.stroke();
    
    ctx.restore();
  }
  
  // Función para dibujar una tapa con detalles
  function drawTapa(t) {
    ctx.save();
    
    // Sombra
    ctx.shadowColor = 'rgba(0,0,0,0.2)';
    ctx.shadowBlur = 3;
    ctx.shadowOffsetY = 2;
    
    // Base de la tapa
    ctx.beginPath();
    ctx.arc(t.x + TAPA_SIZE/2, t.y + TAPA_SIZE/2, TAPA_SIZE/2, 0, 2*Math.PI);
    ctx.fillStyle = COLORS.tapa.fill;
    ctx.fill();
    
    // Borde
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = COLORS.tapa.stroke;
    ctx.stroke();
    
    // Detalles de la tapa (por ejemplo, trozos de tortilla o jamón)
    ctx.fillStyle = COLORS.tapa.details;
    
    // Detalle 1
    ctx.beginPath();
    ctx.arc(t.x + TAPA_SIZE/2 - 5, t.y + TAPA_SIZE/2 - 3, 3, 0, 2*Math.PI);
    ctx.fill();
    
    // Detalle 2
    ctx.beginPath();
    ctx.arc(t.x + TAPA_SIZE/2 + 4, t.y + TAPA_SIZE/2 + 5, 4, 0, 2*Math.PI);
    ctx.fill();
    
    // Brillo
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.beginPath();
    ctx.arc(t.x + TAPA_SIZE/2 - 5, t.y + TAPA_SIZE/2 - 5, 3, 0, 2*Math.PI);
    ctx.fill();
    
    ctx.restore();
  }
  
  // Panel de puntuación mejorado
  function drawScorePanel() {
    // Panel superior semi-transparente
    ctx.save();
    ctx.fillStyle = COLORS.scorePanel.background;
    ctx.fillRect(0, 0, width, 40);
    
    // Gradiente de brillo en la parte superior
    const gradient = ctx.createLinearGradient(0, 0, 0, 20);
    gradient.addColorStop(0, 'rgba(255,255,255,0.15)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, 20);
    
    // Textos
    ctx.font = 'bold 18px Arial';
    
    // Cañas
    ctx.fillStyle = COLORS.scorePanel.text;
    ctx.fillText('Cañas: ', 10, 26);
    ctx.fillStyle = COLORS.scorePanel.highlight;
    ctx.fillText(cañas.filter(c=>c.caught).length, 70, 26);
    
    // Tapas
    ctx.fillStyle = COLORS.scorePanel.text;
    ctx.fillText('Tapas: ', 120, 26);
    ctx.fillStyle = COLORS.scorePanel.highlight;
    ctx.fillText(tapas.filter(t=>t.caught).length, 180, 26);
    
    // Tiempo con efecto parpadeante en los últimos 10 segundos
    ctx.fillStyle = COLORS.scorePanel.text;
    ctx.fillText('Tiempo: ', width-120, 26);
    
    if(timeLeft <= 10 && !gameOver) {
      // Parpadeo para advertencia de tiempo
      const blink = Math.floor(Date.now() / 500) % 2 === 0;
      ctx.fillStyle = blink ? '#ff5252' : COLORS.scorePanel.highlight;
    } else {
      ctx.fillStyle = COLORS.scorePanel.highlight;
    }
    ctx.fillText(timeLeft+'s', width-60, 26);
    
    // Puntos en el centro
    ctx.fillStyle = COLORS.scorePanel.text;
    ctx.fillText('Puntos: ', width/2-60, 26);
    ctx.fillStyle = COLORS.scorePanel.highlight;
    ctx.fillText(score, width/2+10, 26);
    
    ctx.restore();
  }
  
  // Pantalla de fin de juego mejorada
  function drawGameOver() {
    ctx.save();
    
    // Fondo semitransparente
    ctx.fillStyle = COLORS.gameOver.background;
    ctx.fillRect(0, 0, width, height);
    
    // Panel central
    if(window.GameUI) {
      GameUI.glassPanel(ctx, width/2 - 200, height/2 - 100, 400, 200);
    } else {
      ctx.fillStyle = 'rgba(38, 50, 56, 0.9)';
      ctx.beginPath();
      ctx.roundRect(width/2 - 200, height/2 - 100, 400, 200, 16);
      ctx.fill();
      
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    
    // Título
    ctx.fillStyle = COLORS.gameOver.text;
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('¡Fin del juego!', width/2, height/2 - 40);
    
    // Puntuación con efecto de brillo
    ctx.fillStyle = COLORS.gameOver.score;
    ctx.font = 'bold 24px Arial';
    ctx.fillText('Puntuación: ' + score, width/2, height/2 + 10);
    
    // Instrucción para reiniciar
    const restartText = 'Pulsa ESPACIO para reiniciar';
    ctx.font = '20px Arial';
    ctx.fillStyle = COLORS.gameOver.text;
    
    // Efecto pulsante
    const pulse = Math.sin(Date.now() / 300) * 0.1 + 0.9;
    ctx.globalAlpha = pulse;
    ctx.fillText(restartText, width/2, height/2 + 60);
    
    ctx.restore();
  }

  function update() {
    if(gameOver || showIntro) return;
    
    // Movimiento jugador
    if(keys['ArrowLeft'] && player.x>0) player.x -= player.speed;
    if(keys['ArrowRight'] && player.x<width-PLAYER_SIZE) player.x += player.speed;
    // Caída de cañas
    for(let c of cañas) {
      if(!c.caught) {
        c.y += c.speed;
        if(c.y > height) {
          c.x = Math.random()*(width-CAÑA_SIZE);
          c.y = -CAÑA_SIZE;
          c.speed = 2+Math.random()*2;
        }
        if(collide(player, PLAYER_SIZE, c, CAÑA_SIZE)) {
          c.caught = true;
          score++;
        }
      }
    }
    // Caída de tapas
    for(let t of tapas) {
      if(!t.caught) {
        t.y += t.speed;
        if(t.y > height) {
          t.x = Math.random()*(width-TAPA_SIZE);
          t.y = -TAPA_SIZE;
          t.speed = 2+Math.random()*2;
        }
        if(collide(player, PLAYER_SIZE, t, TAPA_SIZE)) {
          t.caught = true;
          score++;
        }
      }
    }
    // Si todas atrapadas, reponer
    if(cañas.every(c=>c.caught) && tapas.every(t=>t.caught)) {
      for(let c of cañas) {
        c.x = Math.random()*(width-CAÑA_SIZE);
        c.y = -Math.random()*height;
        c.speed = 2+Math.random()*2;
        c.caught = false;
      }
      for(let t of tapas) {
        t.x = Math.random()*(width-TAPA_SIZE);
        t.y = -Math.random()*height;
        t.speed = 2+Math.random()*2;
        t.caught = false;
      }
    }
  }

  function collide(a, asize, b, bsize) {
    return a.x < b.x+bsize && a.x+asize > b.x && a.y < b.y+bsize && a.y+asize > b.y;
  }

  function endGame() {
    gameOver = true;
    clearInterval(timer);
    // Guardar récord si es el mejor
    let best = parseInt(localStorage.getItem('alcalaCañasTapasRecord')||'0');
    if(score>best) localStorage.setItem('alcalaCañasTapasRecord', score);
  }
  
  // Función para dibujar la pantalla de introducción
  function drawIntro() {
    ctx.save();
    
    // Fondo del juego
    drawAlcalaBackground();
    
    // Panel de instrucciones
    if(window.GameUI) {
      const title = "Alcalá: Cañas y Tapas";
      const lines = [
        "¡Disfruta de las tapas y cañas típicas de Alcalá!",
        "Usa las flechas ← → para moverte.",
        "Recoge todas las cañas y tapas que puedas.",
        "¡Consigue la mayor puntuación antes de que se acabe el tiempo!",
        "",
        "Pulsa cualquier tecla para comenzar"
      ];
      
      GameUI.drawInstructionPanel(ctx, title, lines, {
        panelY: height/2 - 150,
        titleColor: '#ffd54f',
        textColor: '#ffffff'
      });
      
    } else {
      // Versión alternativa si no está disponible GameUI
      const panelWidth = width - 100;
      const panelHeight = 300;
      const panelX = width/2 - panelWidth/2;
      const panelY = height/2 - 150;
      
      // Panel oscuro semitransparente
      ctx.fillStyle = 'rgba(15,25,40,0.92)';
      ctx.beginPath();
      ctx.roundRect(panelX, panelY, panelWidth, panelHeight, 16);
      ctx.fill();
      
      ctx.strokeStyle = 'rgba(255,255,255,0.25)';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Título
      ctx.font = 'bold 30px Arial';
      ctx.fillStyle = '#ffd54f';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#000';
      ctx.shadowBlur = 8;
      ctx.fillText("Alcalá: Cañas y Tapas", width/2, panelY + 50);
      
      // Instrucciones
      ctx.shadowBlur = 0;
      ctx.font = '16px Arial';
      ctx.fillStyle = '#ffffff';
      ctx.fillText("¡Disfruta de las tapas y cañas típicas de Alcalá!", width/2, panelY + 100);
      ctx.fillText("Usa las flechas ← → para moverte.", width/2, panelY + 130);
      ctx.fillText("Recoge todas las cañas y tapas que puedas.", width/2, panelY + 160);
      ctx.fillText("¡Consigue la mayor puntuación antes de que se acabe el tiempo!", width/2, panelY + 190);
      
      // Instrucción para comenzar
      ctx.font = 'bold 18px Arial';
      
      // Efecto pulsante
      const pulse = Math.sin(Date.now() / 300) * 0.1 + 0.9;
      ctx.globalAlpha = pulse;
      ctx.fillStyle = '#4fc3f7';
      ctx.fillText("Pulsa cualquier tecla para comenzar", width/2, panelY + 250);
    }
    
    // Ejemplos visuales de cañas y tapas
    // Dibujar algunas cañas y tapas decorativas alrededor del panel
    ctx.globalAlpha = 1;
    
    // Caña decorativa a la izquierda
    const demoCanX = width/2 - 200;
    const demoCanY = height/2 + 80;
    const demoCanSize = 40;
    
    drawDecorativeCana(demoCanX, demoCanY, demoCanSize);
    
    // Tapa decorativa a la derecha
    const demoTapaX = width/2 + 160;
    const demoTapaY = height/2 + 80;
    const demoTapaSize = 50;
    
    drawDecorativeTapa(demoTapaX, demoTapaY, demoTapaSize);
    
    ctx.restore();
  }
  
  // Dibujar una caña decorativa grande
  function drawDecorativeCana(x, y, size) {
    ctx.save();
    
    // Vaso
    ctx.fillStyle = COLORS.caña.glass;
    ctx.beginPath();
    ctx.roundRect(x, y, size, size*1.4, 4);
    ctx.fill();
    
    // Cerveza
    ctx.fillStyle = COLORS.caña.beer;
    ctx.fillRect(x+4, y+size*0.4, size-8, size);
    
    // Espuma
    ctx.fillStyle = COLORS.caña.foam;
    ctx.beginPath();
    ctx.ellipse(x+size/2, y+size*0.4, size/2-4, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Brillos
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.beginPath();
    ctx.ellipse(x+size/2-5, y+size*0.7, 3, 8, Math.PI/4, 0, Math.PI * 2);
    ctx.fill();
    
    // Borde
    ctx.strokeStyle = COLORS.caña.stroke;
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.restore();
  }
  
  // Dibujar una tapa decorativa grande
  function drawDecorativeTapa(x, y, size) {
    ctx.save();
    
    // Sombra
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 5;
    ctx.shadowOffsetY = 3;
    
    // Plato
    ctx.beginPath();
    ctx.arc(x+size/2, y+size/2, size/2, 0, 2*Math.PI);
    ctx.fillStyle = '#f5f5f5';
    ctx.fill();
    
    // Borde del plato
    ctx.strokeStyle = '#bdbdbd';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Tapa (por ejemplo, tortilla)
    ctx.beginPath();
    ctx.arc(x+size/2, y+size/2, size/2-8, 0, 2*Math.PI);
    ctx.fillStyle = COLORS.tapa.fill;
    ctx.fill();
    
    // Detalles de la tapa
    ctx.fillStyle = COLORS.tapa.details;
    
    // Detalles variados
    for(let i=0; i<5; i++) {
      ctx.beginPath();
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * (size/2-15);
      const detailX = x + size/2 + Math.cos(angle) * dist;
      const detailY = y + size/2 + Math.sin(angle) * dist;
      const detailSize = 2 + Math.random() * 4;
      ctx.arc(detailX, detailY, detailSize, 0, 2*Math.PI);
      ctx.fill();
    }
    
    ctx.restore();
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  function keydown(e) {
    keys[e.key] = true;
    
    // Si estamos en la intro, cualquier tecla la quita
    if(showIntro) {
      showIntro = false;
      return;
    }
    
    // Reiniciar juego con espacio si terminó
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
