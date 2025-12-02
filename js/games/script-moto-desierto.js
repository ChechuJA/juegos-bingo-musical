// script-moto-desierto.js
// Juego: Moto en el Desierto
// Autor: ChechuJA + GitHub Copilot

(function(){
  let canvas, ctx, width, height;
  let backgroundImage, characterImage;
  let player, obstacles, score, gameOver, keys, timer;
  const PLAYER_WIDTH = 40, PLAYER_HEIGHT = 80;
  const OBSTACLE_WIDTH = 40, OBSTACLE_HEIGHT = 40;
  const OBSTACLE_COUNT = 5;
  const GAME_SPEED = 5;
  function bgReady(){ return backgroundImage && backgroundImage.complete && backgroundImage.naturalWidth>0; }
  function charReady(){ return characterImage && characterImage.complete && characterImage.naturalWidth>0; }

  function initGame() {
    score = 0;
    gameOver = false;
    player = { x: width/2 - PLAYER_WIDTH/2, y: height - PLAYER_HEIGHT - 20, speed: 6 };
    obstacles = [];
    for(let i=0; i<OBSTACLE_COUNT; i++) {
      obstacles.push({ x: Math.random() * (width - OBSTACLE_WIDTH), y: -Math.random() * height, speed: GAME_SPEED + Math.random() * 2 });
    }
    keys = {};
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    // Fondo/Carretera mejorada
    if (bgReady()) {
      ctx.drawImage(backgroundImage, 0, 0, width, height);
    } else {
      // Fondo del desierto mejorado con atardecer
      const skyGradient = ctx.createLinearGradient(0, 0, 0, height * 0.6);
      skyGradient.addColorStop(0, '#1a237e');  // Azul oscuro arriba
      skyGradient.addColorStop(0.3, '#5e35b1'); // Púrpura
      skyGradient.addColorStop(0.6, '#e91e63'); // Rosa
      skyGradient.addColorStop(0.8, '#ff9800'); // Naranja
      skyGradient.addColorStop(1, '#ffeb3b');   // Amarillo en el horizonte
      ctx.fillStyle = skyGradient;
      ctx.fillRect(0, 0, width, height * 0.6);
      
      // Sol/puesta de sol
      const sunGradient = ctx.createRadialGradient(
        width * 0.7, height * 0.5, 5,
        width * 0.7, height * 0.5, 70
      );
      sunGradient.addColorStop(0, '#ffffff');
      sunGradient.addColorStop(0.3, '#ffeb3b');
      sunGradient.addColorStop(0.6, '#ff9800');
      sunGradient.addColorStop(1, 'rgba(255, 152, 0, 0)');
      ctx.fillStyle = sunGradient;
      ctx.beginPath();
      ctx.arc(width * 0.7, height * 0.5, 70, 0, Math.PI * 2);
      ctx.fill();
      
      // Estrellas en el cielo
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 50; i++) {
        const size = Math.random() * 2 + 1;
        const x = Math.random() * width;
        const y = Math.random() * height * 0.4;
        // Solo dibujar estrellas en la parte superior del cielo
        if (y < height * 0.3) {
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      
      // Montañas de fondo con más detalle
      for(let i = 0; i < 8; i++) {
        const mountainHeight = 120 + Math.random() * 100;
        const mountainWidth = 200 + Math.random() * 150;
        const x = i * width/6 - 100;
        
        // Degradado para montañas
        const mountainGrad = ctx.createLinearGradient(
          x, height * 0.6 - mountainHeight, 
          x, height * 0.6
        );
        mountainGrad.addColorStop(0, '#37474f'); // Gris oscuro en cima
        mountainGrad.addColorStop(0.5, '#546e7a'); // Gris medio
        mountainGrad.addColorStop(1, '#78909c'); // Gris claro en base
        
        ctx.fillStyle = mountainGrad;
        ctx.beginPath();
        ctx.moveTo(x, height * 0.6);
        
        // Picos de montaña más detallados
        let currentX = x;
        const peakCount = Math.floor(mountainWidth / 30);
        const peakWidth = mountainWidth / peakCount;
        
        for (let j = 0; j <= peakCount; j++) {
          const peakHeight = (j === 0 || j === peakCount) 
            ? 0 
            : (Math.random() * 0.5 + 0.5) * mountainHeight;
          ctx.lineTo(
            x + j * peakWidth, 
            height * 0.6 - peakHeight
          );
        }
        
        ctx.lineTo(x + mountainWidth, height * 0.6);
        ctx.closePath();
        ctx.fill();
        
        // Nieve en las cimas
        if (mountainHeight > 180) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
          ctx.beginPath();
          ctx.moveTo(x + mountainWidth * 0.3, height * 0.6 - mountainHeight * 0.8);
          ctx.lineTo(x + mountainWidth * 0.4, height * 0.6 - mountainHeight * 0.9);
          ctx.lineTo(x + mountainWidth * 0.6, height * 0.6 - mountainHeight * 0.9);
          ctx.lineTo(x + mountainWidth * 0.7, height * 0.6 - mountainHeight * 0.8);
          ctx.closePath();
          ctx.fill();
        }
      }
      
      // Arena del desierto con textura
      const sandGradient = ctx.createLinearGradient(0, height * 0.6, 0, height);
      sandGradient.addColorStop(0, '#ff9800'); // Naranja claro
      sandGradient.addColorStop(0.3, '#e65100'); // Naranja oscuro
      sandGradient.addColorStop(1, '#bf360c'); // Marrón rojizo
      ctx.fillStyle = sandGradient;
      ctx.fillRect(0, height * 0.6, width, height * 0.4);
      
      // Textura de arena
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      for (let i = 0; i < 300; i++) {
        const x = Math.random() * width;
        const y = height * 0.6 + Math.random() * height * 0.4;
        const size = Math.random() * 3 + 1;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Cactus en el desierto
      for (let i = 0; i < 3; i++) {
        const cactusHeight = 40 + Math.random() * 30;
        const cactusWidth = 15 + Math.random() * 10;
        const x = (width * 0.1) + i * (width * 0.4) + Math.random() * 100;
        const y = height * 0.75 - cactusHeight;
        
        // Tronco del cactus
        ctx.fillStyle = '#2e7d32';
        ctx.beginPath();
        ctx.roundRect(x, y, cactusWidth, cactusHeight, 5);
        ctx.fill();
        
        // Brazos del cactus
        if (Math.random() > 0.3) {
          const armHeight = cactusHeight * 0.4;
          const armWidth = cactusWidth * 0.7;
          const armY = y + cactusHeight * 0.3;
          
          ctx.beginPath();
          ctx.roundRect(x - armWidth, armY, armWidth, armHeight, 3);
          ctx.fill();
          
          if (Math.random() > 0.5) {
            ctx.beginPath();
            ctx.roundRect(x + cactusWidth, armY - cactusHeight * 0.1, armWidth, armHeight, 3);
            ctx.fill();
          }
        }
        
        // Detalles del cactus
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.lineWidth = 1;
        for (let j = 0; j < 3; j++) {
          ctx.beginPath();
          ctx.moveTo(x + cactusWidth / 2, y + j * cactusHeight / 3);
          ctx.lineTo(x + cactusWidth / 2, y + (j + 0.7) * cactusHeight / 3);
          ctx.stroke();
        }
      }
      
      // Carretera con efecto de perspectiva
      const roadGradient = ctx.createLinearGradient(0, height * 0.6, 0, height);
      roadGradient.addColorStop(0, '#424242'); // Gris oscuro arriba
      roadGradient.addColorStop(1, '#212121'); // Casi negro abajo
      
      ctx.fillStyle = roadGradient;
      ctx.beginPath();
      ctx.moveTo(width * 0.35, height * 0.6);
      ctx.lineTo(width * 0.65, height * 0.6);
      ctx.lineTo(width * 0.8, height);
      ctx.lineTo(width * 0.2, height);
      ctx.closePath();
      ctx.fill();
      
      // Líneas centrales de la carretera con perspectiva
      ctx.strokeStyle = '#ffeb3b'; // Amarillo más vibrante
      ctx.lineWidth = 6;
      ctx.setLineDash([30, 20]);
      
      const dashCount = 10;
      const dashHeight = (height * 0.4) / dashCount;
      
      for (let i = 0; i < dashCount; i++) {
        const perspectiveWidth = 0.3 - (i / dashCount) * 0.2; // Disminuye con la distancia
        const y = height * 0.6 + i * dashHeight;
        const widthAtY = width * perspectiveWidth;
        
        ctx.beginPath();
        ctx.moveTo(width * 0.5 - widthAtY * 0.02, y);
        ctx.lineTo(width * 0.5 + widthAtY * 0.02, y + dashHeight * 0.8);
        ctx.stroke();
      }
      
      ctx.setLineDash([]);
      
      // Bordes reflectantes de la carretera
      ctx.strokeStyle = '#f5f5f5';
      ctx.lineWidth = 3;
      
      // Borde izquierdo
      ctx.beginPath();
      ctx.moveTo(width * 0.35, height * 0.6);
      ctx.lineTo(width * 0.2, height);
      ctx.stroke();
      
      // Borde derecho
      ctx.beginPath();
      ctx.moveTo(width * 0.65, height * 0.6);
      ctx.lineTo(width * 0.8, height);
      ctx.stroke();
    }
    
    // Jugador (moto) con efectos mejorados
    if (charReady()) {
      ctx.drawImage(characterImage, player.x, player.y, PLAYER_WIDTH, PLAYER_HEIGHT);
    } else {
      // Sombra de la moto
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.beginPath();
      ctx.ellipse(player.x + PLAYER_WIDTH/2, player.y + PLAYER_HEIGHT - 5, PLAYER_WIDTH/2, 10, 0, 0, Math.PI*2);
      ctx.fill();
      
      // Efectos de velocidad/humo
      ctx.fillStyle = 'rgba(255,255,255,0.1)';
      for (let i = 0; i < 10; i++) {
        const offsetX = Math.random() * 10 - 5;
        const offsetY = Math.random() * 10;
        const size = Math.random() * 15 + 5;
        ctx.beginPath();
        ctx.arc(player.x + PLAYER_WIDTH/2 + offsetX, player.y + PLAYER_HEIGHT - 10 + offsetY, size, 0, Math.PI*2);
        ctx.fill();
      }
      
      // Rueda trasera
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(player.x + 12, player.y + PLAYER_HEIGHT - 15, 14, 0, Math.PI*2);
      ctx.fill();
      
      // Llanta trasera
      ctx.fillStyle = '#9e9e9e';
      ctx.beginPath();
      ctx.arc(player.x + 12, player.y + PLAYER_HEIGHT - 15, 7, 0, Math.PI*2);
      ctx.fill();
      
      // Radios de la rueda trasera
      ctx.strokeStyle = '#e0e0e0';
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 8; i++) {
        const angle = i * Math.PI / 4;
        ctx.beginPath();
        ctx.moveTo(player.x + 12, player.y + PLAYER_HEIGHT - 15);
        ctx.lineTo(
          player.x + 12 + Math.cos(angle) * 14,
          player.y + PLAYER_HEIGHT - 15 + Math.sin(angle) * 14
        );
        ctx.stroke();
      }
      
      // Cuerpo de la moto con degradado metálico
      const bodyGradient = ctx.createLinearGradient(
        player.x, player.y + 20, 
        player.x + PLAYER_WIDTH, player.y + 20
      );
      bodyGradient.addColorStop(0, '#c62828'); // Rojo oscuro
      bodyGradient.addColorStop(0.5, '#ef5350'); // Rojo medio
      bodyGradient.addColorStop(1, '#c62828'); // Rojo oscuro
      
      ctx.fillStyle = bodyGradient;
      ctx.beginPath();
      ctx.roundRect(player.x + 8, player.y + 20, PLAYER_WIDTH - 16, PLAYER_HEIGHT - 35, 5);
      ctx.fill();
      
      // Detalles del cuerpo
      ctx.strokeStyle = '#ffcdd2';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(player.x + 10, player.y + 30);
      ctx.lineTo(player.x + PLAYER_WIDTH - 10, player.y + 30);
      ctx.stroke();
      
      // Motor y escapes
      ctx.fillStyle = '#424242';
      ctx.beginPath();
      ctx.roundRect(player.x + 12, player.y + 45, PLAYER_WIDTH - 24, 15, 3);
      ctx.fill();
      
      // Tubos de escape
      ctx.fillStyle = '#757575';
      ctx.beginPath();
      ctx.roundRect(player.x + 5, player.y + 50, 5, 20, 2);
      ctx.roundRect(player.x + PLAYER_WIDTH - 10, player.y + 50, 5, 20, 2);
      ctx.fill();
      
      // Rueda delantera
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(player.x + PLAYER_WIDTH - 12, player.y + PLAYER_HEIGHT - 15, 14, 0, Math.PI*2);
      ctx.fill();
      
      // Llanta delantera
      ctx.fillStyle = '#9e9e9e';
      ctx.beginPath();
      ctx.arc(player.x + PLAYER_WIDTH - 12, player.y + PLAYER_HEIGHT - 15, 7, 0, Math.PI*2);
      ctx.fill();
      
      // Radios de la rueda delantera
      for (let i = 0; i < 8; i++) {
        const angle = i * Math.PI / 4;
        ctx.beginPath();
        ctx.moveTo(player.x + PLAYER_WIDTH - 12, player.y + PLAYER_HEIGHT - 15);
        ctx.lineTo(
          player.x + PLAYER_WIDTH - 12 + Math.cos(angle) * 14,
          player.y + PLAYER_HEIGHT - 15 + Math.sin(angle) * 14
        );
        ctx.stroke();
      }
      
      // Manillar y cabina
      ctx.fillStyle = '#b71c1c';
      ctx.beginPath();
      ctx.roundRect(player.x + 5, player.y + 5, PLAYER_WIDTH - 10, 20, 5);
      ctx.fill();
      
      // Parabrisas
      ctx.fillStyle = 'rgba(100, 181, 246, 0.7)';
      ctx.beginPath();
      ctx.moveTo(player.x + 15, player.y + 5);
      ctx.lineTo(player.x + PLAYER_WIDTH - 15, player.y + 5);
      ctx.lineTo(player.x + PLAYER_WIDTH - 20, player.y - 5);
      ctx.lineTo(player.x + 20, player.y - 5);
      ctx.closePath();
      ctx.fill();
      
      // Piloto
      ctx.fillStyle = '#212121';
      ctx.beginPath();
      ctx.arc(player.x + PLAYER_WIDTH/2, player.y + 15, 8, 0, Math.PI*2);
      ctx.fill();
      
      // Casco del piloto
      ctx.fillStyle = '#ffc107';
      ctx.beginPath();
      ctx.arc(player.x + PLAYER_WIDTH/2, player.y + 10, 6, 0, Math.PI, true);
      ctx.fill();
      
      // Reflejo en el casco
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(player.x + PLAYER_WIDTH/2 - 2, player.y + 8, 2, 0, Math.PI*2);
      ctx.fill();
      
      // Efectos de velocidad en los laterales
      ctx.strokeStyle = 'rgba(255,255,255,0.7)';
      ctx.lineWidth = 2;
      for(let i = 0; i < 5; i++) {
        const length = Math.random() * 20 + 10;
        ctx.beginPath();
        ctx.moveTo(player.x - length, player.y + 20 + i*10);
        ctx.lineTo(player.x, player.y + 20 + i*10);
        ctx.stroke();
      }
    }
    
    // Obstáculos (rocas) mejorados con variaciones
    for(let obstacle of obstacles) {
      // Sombra
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.beginPath();
      ctx.ellipse(obstacle.x + OBSTACLE_WIDTH/2, obstacle.y + OBSTACLE_HEIGHT - 3, OBSTACLE_WIDTH/2, 8, 0, 0, Math.PI*2);
      ctx.fill();
      
      // Determinar tipo de obstáculo (roca o cactus) basado en posición
      const isRock = (obstacle.x % 2 === 0);
      
      if (isRock) {
        // Gradiente para roca
        const rockGradient = ctx.createRadialGradient(
          obstacle.x + OBSTACLE_WIDTH/2 - 5, obstacle.y + OBSTACLE_HEIGHT/2 - 5, 2,
          obstacle.x + OBSTACLE_WIDTH/2, obstacle.y + OBSTACLE_HEIGHT/2, OBSTACLE_WIDTH/2
        );
        rockGradient.addColorStop(0, '#78909c');
        rockGradient.addColorStop(0.5, '#546e7a');
        rockGradient.addColorStop(1, '#37474f');
        
        // Roca (forma irregular)
        ctx.fillStyle = rockGradient;
        ctx.beginPath();
        ctx.moveTo(obstacle.x + OBSTACLE_WIDTH/2, obstacle.y);
        ctx.lineTo(obstacle.x + OBSTACLE_WIDTH, obstacle.y + OBSTACLE_HEIGHT/3);
        ctx.lineTo(obstacle.x + OBSTACLE_WIDTH - 5, obstacle.y + OBSTACLE_HEIGHT - 8);
        ctx.lineTo(obstacle.x + OBSTACLE_WIDTH/3, obstacle.y + OBSTACLE_HEIGHT);
        ctx.lineTo(obstacle.x + 5, obstacle.y + OBSTACLE_HEIGHT - 8);
        ctx.lineTo(obstacle.x, obstacle.y + OBSTACLE_HEIGHT/2);
        ctx.closePath();
        ctx.fill();
        
        // Detalles de la roca
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(obstacle.x + 10, obstacle.y + OBSTACLE_HEIGHT/2);
        ctx.lineTo(obstacle.x + OBSTACLE_WIDTH - 10, obstacle.y + OBSTACLE_HEIGHT/2 + 5);
        ctx.moveTo(obstacle.x + 15, obstacle.y + OBSTACLE_HEIGHT/4);
        ctx.lineTo(obstacle.x + OBSTACLE_WIDTH - 5, obstacle.y + OBSTACLE_HEIGHT/3);
        ctx.stroke();
      } else {
        // Cactus como obstáculo alternativo
        ctx.fillStyle = '#2e7d32';
        
        // Tronco del cactus
        ctx.beginPath();
        ctx.roundRect(
          obstacle.x + OBSTACLE_WIDTH/4, 
          obstacle.y, 
          OBSTACLE_WIDTH/2, 
          OBSTACLE_HEIGHT - 5, 
          5
        );
        ctx.fill();
        
        // Brazos del cactus
        ctx.beginPath();
        ctx.roundRect(
          obstacle.x, 
          obstacle.y + OBSTACLE_HEIGHT/3, 
          OBSTACLE_WIDTH/2, 
          OBSTACLE_HEIGHT/4, 
          3
        );
        ctx.fill();
        
        ctx.beginPath();
        ctx.roundRect(
          obstacle.x + OBSTACLE_WIDTH/2, 
          obstacle.y + OBSTACLE_HEIGHT/2, 
          OBSTACLE_WIDTH/2, 
          OBSTACLE_HEIGHT/4, 
          3
        );
        ctx.fill();
        
        // Detalles del cactus
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 2; i++) {
          ctx.beginPath();
          ctx.moveTo(
            obstacle.x + OBSTACLE_WIDTH/2, 
            obstacle.y + i * OBSTACLE_HEIGHT/3
          );
          ctx.lineTo(
            obstacle.x + OBSTACLE_WIDTH/2, 
            obstacle.y + (i + 0.8) * OBSTACLE_HEIGHT/3
          );
          ctx.stroke();
        }
        
        // Espinas del cactus
        ctx.fillStyle = '#f5f5f5';
        for (let i = 0; i < 6; i++) {
          const x = obstacle.x + OBSTACLE_WIDTH/4 + (i % 2) * OBSTACLE_WIDTH/2;
          const y = obstacle.y + 5 + Math.floor(i/2) * OBSTACLE_HEIGHT/3;
          
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + (i % 2 ? 5 : -5), y);
          ctx.lineTo(x, y + 2);
          ctx.closePath();
          ctx.fill();
        }
      }
    }
    
    // Marcadores mejorados con estilo de tablero
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(10, 10, 180, 40);
    ctx.strokeStyle = '#ffeb3b';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, 180, 40);
    
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 22px Arial';
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 5;
    ctx.fillText('Puntos: ' + score, 25, 38);
    
    // Velocímetro en la esquina
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.beginPath();
    ctx.arc(width - 50, 50, 40, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ff5722';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(width - 50, 50, 40, Math.PI * 0.75, Math.PI * 0.75 + Math.PI * 1.5 * (score/100 % 1 + 0.1));
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('SPEED', width - 50, 40);
    ctx.font = 'bold 20px Arial';
    ctx.fillText(Math.min(220, 80 + score), width - 50, 65);
    ctx.textAlign = 'left';
    ctx.shadowBlur = 0;
    
    if(gameOver) {
      // Panel de Game Over mejorado con efecto de cristal roto
      ctx.fillStyle = 'rgba(0,0,0,0.8)';
      ctx.fillRect(0, 0, width, height);
      
      // Efecto de cristal roto
      ctx.strokeStyle = '#f44336';
      ctx.lineWidth = 3;
      const centerX = width / 2;
      const centerY = height / 2;
      for (let i = 0; i < 15; i++) {
        const angle = Math.random() * Math.PI * 2;
        const length = Math.random() * 200 + 100;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(
          centerX + Math.cos(angle) * length,
          centerY + Math.sin(angle) * length
        );
        ctx.stroke();
      }
      
      // Panel central con degradado
      const panelGradient = ctx.createLinearGradient(
        0, height/2 - 100, 
        0, height/2 + 100
      );
      panelGradient.addColorStop(0, '#212121');
      panelGradient.addColorStop(1, '#000000');
      
      ctx.fillStyle = panelGradient;
      ctx.fillRect(width/2 - 200, height/2 - 100, 400, 200);
      ctx.strokeStyle = '#f44336';
      ctx.lineWidth = 4;
      ctx.strokeRect(width/2 - 200, height/2 - 100, 400, 200);
      
      // Texto de Game Over con efecto de fuego
      const textGradient = ctx.createLinearGradient(
        0, height/2 - 50, 
        0, height/2
      );
      textGradient.addColorStop(0, '#ffeb3b');
      textGradient.addColorStop(0.5, '#ff9800');
      textGradient.addColorStop(1, '#f44336');
      
      ctx.fillStyle = textGradient;
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#ff5722';
      ctx.shadowBlur = 15;
      ctx.fillText('¡FIN DEL JUEGO!', width/2, height/2 - 40);
      
      // Puntuación con estilo metálico
      const scoreGradient = ctx.createLinearGradient(
        width/2 - 100, height/2, 
        width/2 + 100, height/2
      );
      scoreGradient.addColorStop(0, '#9e9e9e');
      scoreGradient.addColorStop(0.5, '#e0e0e0');
      scoreGradient.addColorStop(1, '#9e9e9e');
      
      ctx.fillStyle = scoreGradient;
      ctx.font = '32px Arial';
      ctx.fillText('Puntuación: ' + score, width/2, height/2 + 10);
      
      // Botón de reinicio con efecto pulsante
      const pulse = Math.sin(Date.now() / 300) * 0.2 + 0.8;
      const btnWidth = 240;
      const btnHeight = 50;
      
      // Sombra del botón
      ctx.fillStyle = 'rgba(244, 67, 54, 0.5)';
      ctx.fillRect(width/2 - btnWidth/2 + 5, height/2 + 40 + 5, btnWidth, btnHeight);
      
      // Botón con degradado
      const btnGradient = ctx.createLinearGradient(
        0, height/2 + 40, 
        0, height/2 + 40 + btnHeight
      );
      btnGradient.addColorStop(0, '#f44336');
      btnGradient.addColorStop(1, '#d32f2f');
      
      ctx.fillStyle = btnGradient;
      ctx.fillRect(width/2 - btnWidth/2, height/2 + 40, btnWidth, btnHeight);
      ctx.strokeStyle = '#ffcdd2';
      ctx.lineWidth = 2;
      ctx.strokeRect(width/2 - btnWidth/2, height/2 + 40, btnWidth, btnHeight);
      
      // Texto del botón
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px Arial';
      ctx.globalAlpha = pulse;
      ctx.fillText('PRESIONA ESPACIO', width/2, height/2 + 40 + 32);
      ctx.globalAlpha = 1;
      
      ctx.shadowBlur = 0;
      ctx.textAlign = 'left';
    }
  }

  function update() {
    if(gameOver) return;
    // Movimiento jugador
    if(keys['ArrowLeft'] && player.x > width/4) player.x -= player.speed;
    if(keys['ArrowRight'] && player.x < width/4 + width/2 - PLAYER_WIDTH) player.x += player.speed;
    // Movimiento obstáculos
    for(let obstacle of obstacles) {
      obstacle.y += obstacle.speed;
      if(obstacle.y > height) {
        obstacle.y = -OBSTACLE_HEIGHT;
        obstacle.x = Math.random() * (width - OBSTACLE_WIDTH);
        score++;
      }
      // Colisión
      if(collide(player, PLAYER_WIDTH, PLAYER_HEIGHT, obstacle, OBSTACLE_WIDTH, OBSTACLE_HEIGHT)) {
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
  backgroundImage.src = 'assets/moto-desierto-background.png';
  backgroundImage.onerror = () => { backgroundImage.src = 'assets/moto-desierto-background.svg'; };
  characterImage = new Image();
  characterImage.src = 'assets/moto-desierto-character.png';
  characterImage.onerror = () => { characterImage.src = 'assets/moto-desierto-character.svg'; };
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
