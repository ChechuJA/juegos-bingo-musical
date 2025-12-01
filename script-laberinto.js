function registerGame(){
// Laberinto de colores (generación simple + recolección secuencial)
const canvas=document.getElementById('gameCanvas'); const ctx=canvas.getContext('2d'); let af=null;
canvas.width=800; canvas.height=520; // margen para barra
const playerName=localStorage.getItem('playerName')||'';
const cell=30; const cols=Math.floor(canvas.width/cell); const rows=Math.floor(canvas.height/cell);
let showIntro = true; // Mostrar pantalla de intro
let gameOver = false; // Variable para controlar el estado de Game Over

// Colores mejorados
const COLORS = {
  background: ['#e0f7fa', '#e8f5e9'], // Fondo gradiente
  header: ['#0d47a1', '#1565c0'],     // Barra superior gradiente
  wall: ['#263238', '#37474f'],       // Muros gradiente
  player: ['#ff5722', '#ff7043'],     // Jugador gradiente
  items: {                           // Colores para los objetos
    '🔴': '#f44336',
    '🟢': '#4caf50',
    '🔵': '#2196f3',
    '🟡': '#ffeb3b',
  },
  text: '#ffffff',                   // Color texto
  grid: 'rgba(255,255,255,0.1)',     // Líneas de cuadrícula
  path: 'rgba(255,255,255,0.07)'     // Camino recorrido
};

// grid: 0 vacío, 1 muro
let grid=[]; for(let r=0;r<rows;r++){ let row=[]; for(let c=0;c<cols;c++){ row.push(Math.random()<0.22?1:0);} grid.push(row);} // start-end claros
for(let r=0;r<rows;r++){ grid[r][0]=0; grid[r][cols-1]=0; }
const player={c:1,r:1,steps:0, trail:[]}; grid[player.r][player.c]=0; const objetivoSecuencia=['🔴','🟢','🔵','🟡']; let idx=0; let items=[]; let bestSteps=Number(localStorage.getItem('laberintoBest')||0); let bestName=localStorage.getItem('laberintoBestName')||'-';
let gameOverMessage = ""; // Mensaje para pantalla de Game Over

function placeItems(){ items=[]; for(let i=0;i<objetivoSecuencia.length;i++){ let placed=false; while(!placed){ const c=2+Math.floor(Math.random()*(cols-4)); const r=2+Math.floor(Math.random()*(rows-4)); if(grid[r][c]===0 && !items.find(it=>it.c===c&&it.r===r)){ items.push({c,r,icon:objetivoSecuencia[i]}); placed=true; } } } }
placeItems();

// Agregar rastro del jugador
function addToTrail(c, r) {
  player.trail.push({c, r});
  // Mantener solo las últimas 20 posiciones
  if (player.trail.length > 20) {
    player.trail.shift();
  }
}

// Función para reiniciar el juego
function resetGame() {
  player.c = 1;
  player.r = 1;
  player.steps = 0;
  player.trail = [];
  idx = 0;
  gameOver = false;
  gameOverMessage = "";
  placeItems();
}

function draw(){
	ctx.clearRect(0,0,canvas.width,canvas.height);
	
	// Fondo con gradiente mejorado
	if(window.GameUI) {
	  GameUI.softBg(ctx, canvas.width, canvas.height, COLORS.background);
	} else { 
	  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
	  gradient.addColorStop(0, COLORS.background[0]);
	  gradient.addColorStop(1, COLORS.background[1]);
	  ctx.fillStyle = gradient;
	  ctx.fillRect(0, 0, canvas.width, canvas.height);
	}
	
	// Barra superior con gradiente
	if(window.GameUI){
	  GameUI.gradientBar(ctx, canvas.width, 50, COLORS.header[0], COLORS.header[1]);
	} else {
	  const headerGrad = ctx.createLinearGradient(0, 0, 0, 50);
	  headerGrad.addColorStop(0, COLORS.header[0]);
	  headerGrad.addColorStop(1, COLORS.header[1]);
	  ctx.fillStyle = headerGrad;
	  ctx.fillRect(0, 0, canvas.width, 50);
	}
	
	// Textos de la barra
	ctx.fillStyle = COLORS.text;
	ctx.font = '18px Arial';
	ctx.textAlign = 'left';
	ctx.textBaseline = 'middle';
	
	// Título con icono del objetivo actual
	ctx.fillText('Laberinto: objetivo ' + objetivoSecuencia[idx], 12, 25);
	
	// Información de puntuación
	ctx.textAlign = 'right';
	ctx.font = '14px Arial';
	ctx.fillText('Pasos: ' + player.steps + '  Mejor: ' + (bestSteps > 0 ? bestSteps : '-') + ' (' + bestName + ')', canvas.width - 12, 22);
	
	// Si estamos en la pantalla de intro, mostrarla y salir
	if (showIntro) {
	  drawIntro();
	  return;
	}
	
	// Si es Game Over, mostrar pantalla de Game Over
	if (gameOver) {
	  drawGameOver();
	  return;
	}
	
	// Ajustar offset para el área de juego
	ctx.save();
	ctx.translate(0, 50);
	
	// Dibujar cuadrícula sutilmente
	ctx.strokeStyle = COLORS.grid;
	ctx.lineWidth = 0.5;
	for (let r = 0; r <= rows; r++) {
	  ctx.beginPath();
	  ctx.moveTo(0, r * cell);
	  ctx.lineTo(cols * cell, r * cell);
	  ctx.stroke();
	}
	for (let c = 0; c <= cols; c++) {
	  ctx.beginPath();
	  ctx.moveTo(c * cell, 0);
	  ctx.lineTo(c * cell, rows * cell);
	  ctx.stroke();
	}
	
	// Dibujar el rastro del jugador
	player.trail.forEach((pos, index) => {
	  const alpha = 0.6 * (index / player.trail.length); // Más transparente cuanto más antiguo
	  ctx.fillStyle = COLORS.path;
	  ctx.globalAlpha = alpha;
	  ctx.fillRect(pos.c * cell, pos.r * cell, cell, cell);
	});
	ctx.globalAlpha = 1;
	
	// Dibujar muros con gradiente
	for(let r = 0; r < rows; r++) {
	  for(let c = 0; c < cols; c++) {
	    if(grid[r][c] === 1) {
	      // Crear gradiente para cada muro
	      const wallGrad = ctx.createLinearGradient(
	        c * cell, r * cell,
	        c * cell, (r + 1) * cell
	      );
	      wallGrad.addColorStop(0, COLORS.wall[0]);
	      wallGrad.addColorStop(1, COLORS.wall[1]);
	      
	      ctx.fillStyle = wallGrad;
	      
	      // Muro con esquinas redondeadas
	      ctx.beginPath();
	      ctx.roundRect(c * cell, r * cell, cell, cell, 4);
	      ctx.fill();
	      
	      // Añadir sombra suave
	      ctx.shadowColor = 'rgba(0,0,0,0.3)';
	      ctx.shadowBlur = 5;
	      ctx.shadowOffsetY = 2;
	      
	      // Borde suave
	      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
	      ctx.lineWidth = 1;
	      ctx.stroke();
	      
	      // Eliminar sombra para el resto
	      ctx.shadowColor = 'transparent';
	      ctx.shadowBlur = 0;
	      ctx.shadowOffsetY = 0;
	    }
	  }
	}
	
	// Dibujar items con efecto visual
	ctx.font = '20px serif';
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	
	for(let it of items) {
	  // Dibujar círculo de fondo para el ítem
	  const itemColor = COLORS.items[it.icon];
	  
	  // Añadir brillo/resplandor
	  ctx.shadowColor = itemColor;
	  ctx.shadowBlur = 15;
	  
	  // Círculo de fondo
	  ctx.fillStyle = itemColor;
	  ctx.beginPath();
	  ctx.arc(it.c * cell + cell/2, it.r * cell + cell/2, cell/3, 0, Math.PI * 2);
	  ctx.fill();
	  
	  // Eliminar sombra
	  ctx.shadowColor = 'transparent';
	  ctx.shadowBlur = 0;
	  
	  // Dibujar ícono encima
	  ctx.fillText(it.icon, it.c * cell + cell/2, it.r * cell + cell/2);
	}
	
	// Dibujar jugador con un estilo mejorado
	const playerGrad = ctx.createRadialGradient(
	  player.c * cell + cell/2, player.r * cell + cell/2, 0,
	  player.c * cell + cell/2, player.r * cell + cell/2, cell/2
	);
	playerGrad.addColorStop(0, COLORS.player[0]);
	playerGrad.addColorStop(1, COLORS.player[1]);
	
	// Sombra para el jugador
	ctx.shadowColor = 'rgba(0,0,0,0.4)';
	ctx.shadowBlur = 8;
	ctx.shadowOffsetY = 3;
	
	// Círculo para el jugador
	ctx.fillStyle = playerGrad;
	ctx.beginPath();
	ctx.arc(player.c * cell + cell/2, player.r * cell + cell/2, cell/3, 0, Math.PI * 2);
	ctx.fill();
	
	// Brillo
	ctx.fillStyle = 'rgba(255,255,255,0.4)';
	ctx.beginPath();
	ctx.arc(player.c * cell + cell/2 - 3, player.r * cell + cell/2 - 3, cell/8, 0, Math.PI * 2);
	ctx.fill();
	
	ctx.restore();
}

// Función para dibujar la pantalla de introducción
function drawIntro() {
  if(window.GameUI) {
    const lines = [
      "Guía el círculo naranja a través del laberinto.",
      "Recoge los elementos de colores EN EL ORDEN indicado.",
      "Si recoges un color incorrecto, pierdes (Game Over).",
      "Usa las flechas ←↑→↓ para moverte.",
      "Trata de completar el laberinto con el mínimo de pasos.",
      "Pulsa cualquier tecla para empezar."
    ];
    
    GameUI.drawInstructionPanel(ctx, "Laberinto de Colores", lines, {
      bgColor: 'rgba(15, 25, 40, 0.95)'
    });
  } else {
    // Versión manual del panel si GameUI no está disponible
    const w = canvas.width - 140;
    const h = 280;
    const x = 70;
    const y = 120;
    
    // Panel semi-transparente
    ctx.fillStyle = 'rgba(15, 25, 40, 0.95)';
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 16);
    ctx.fill();
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Título
    ctx.fillStyle = '#4fc3f7';
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 8;
    ctx.fillText('Laberinto de Colores', canvas.width/2, y + 40);
    
    // Texto de instrucciones
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffffff';
    ctx.font = '15px Arial';
    ctx.fillText('Guía el círculo naranja a través del laberinto.', canvas.width/2, y + 80);
    ctx.fillText('Recoge los elementos de colores EN EL ORDEN indicado.', canvas.width/2, y + 110);
    ctx.fillText('Si recoges un color incorrecto, pierdes (Game Over).', canvas.width/2, y + 140);
    ctx.fillText('Usa las flechas ←↑→↓ para moverte.', canvas.width/2, y + 170);
    ctx.fillText('Trata de completar el laberinto con el mínimo de pasos.', canvas.width/2, y + 200);
    ctx.fillText('Pulsa cualquier tecla para empezar.', canvas.width/2, y + 240);
  }
}

// Función para dibujar la pantalla de Game Over
function drawGameOver() {
  // Panel semi-transparente para Game Over
  const w = canvas.width - 140;
  const h = 200;
  const x = 70;
  const y = 150;
  
  // Fondo oscuro semitransparente
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(0, 50, canvas.width, canvas.height - 50);
  
  // Panel de Game Over
  ctx.fillStyle = 'rgba(180, 0, 0, 0.85)';
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 16);
  ctx.fill();
  
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = 3;
  ctx.stroke();
  
  // Texto de Game Over
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 32px Arial';
  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 8;
  ctx.fillText('¡GAME OVER!', canvas.width/2, y + 50);
  
  // Mensaje de error
  ctx.font = '18px Arial';
  ctx.fillText(gameOverMessage, canvas.width/2, y + 90);
  
  // Indicación para reiniciar
  ctx.font = '16px Arial';
  ctx.shadowBlur = 0;
  
  // Efecto pulsante en el texto de reinicio
  const pulse = Math.sin(Date.now() / 300) * 0.1 + 0.9;
  ctx.globalAlpha = pulse;
  ctx.fillStyle = '#ffffff';
  ctx.fillText('Pulsa ESPACIO para reiniciar', canvas.width/2, y + 150);
  ctx.globalAlpha = 1;
}

function canMove(c,r){ return c>=0&&c<cols&&r>=0&&r<rows&&grid[r][c]===0; }

function key(e){
  // Si estamos en la pantalla de intro, iniciar el juego con cualquier tecla
  if (showIntro) {
    showIntro = false;
    return;
  }
  
  // Si es Game Over, reiniciar con la tecla espacio
  if (gameOver) {
    if (e.key === ' ' || e.code === 'Space') {
      resetGame();
    }
    return;
  }

  let nc=player.c, nr=player.r;
  if(e.key==='ArrowLeft') nc--;
  else if(e.key==='ArrowRight') nc++;
  else if(e.key==='ArrowUp') nr--;
  else if(e.key==='ArrowDown') nr++;
  else if(e.key==='Escape') {
    // Implementar retorno al menú principal
    if(typeof goBack === 'function') goBack();
    return;
  }
  
  if(canMove(nc,nr)){
    player.c=nc;
    player.r=nr;
    player.steps++;
    
    // Añadir posición a la estela
    addToTrail(nc, nr);
    
    const item = items.find(i=>i.c===player.c&&i.r===player.r);
    if(item){
      // Verificar si es el color correcto en la secuencia
      if(item.icon === objetivoSecuencia[idx]){
        idx++;
        items=items.filter(it=>it!==item);
        
        // Si completamos la secuencia, finalizar el nivel
        if(idx === objetivoSecuencia.length){
          if(bestSteps === 0 || player.steps < bestSteps){
            bestSteps = player.steps;
            bestName = playerName || '-';
            localStorage.setItem('laberintoBest', String(bestSteps));
            localStorage.setItem('laberintoBestName', bestName);
          }
          setTimeout(() => {
            alert('¡Laberinto completado! Pasos: ' + player.steps);
            resetGame();
          }, 50);
        }
      } else {
        // Game Over si se recoge un color incorrecto
        gameOver = true;
        gameOverMessage = `¡Color incorrecto! Recogiste ${item.icon} cuando debías recoger ${objetivoSecuencia[idx]}`;
        // También podríamos añadir un efecto de sonido o vibración aquí
      }
    }
  }
}

function loop(){ draw(); af=requestAnimationFrame(loop);}
window.addEventListener('keydown',key); loop();
return function cleanup(){ if(af) cancelAnimationFrame(af); window.removeEventListener('keydown',key); };
}
window.registerGame=registerGame;
