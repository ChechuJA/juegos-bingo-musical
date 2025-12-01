function registerGame(){
// Dispara Colores (estilo bubble shooter sencillo con match >=4)
const canvas=document.getElementById('gameCanvas'); const ctx=canvas.getContext('2d'); let af=null;
canvas.width=800; canvas.height=500;
let showIntro=true;
const GRID_ROWS=10, GRID_COLS=14; const R=18; const TOP_OFFSET=70; const LEFT_OFFSET= (canvas.width - (GRID_COLS*R*2))/2 + R; // centrado
// Colores más vibrantes y atractivos
const COLORS=['#e91e63','#ff9800','#4caf50','#2196f3','#9c27b0'];
// Elementos visuales
const background = {
  gradient: ['#e3f2fd', '#bbdefb'],
  gridBg: 'rgba(213, 235, 255, 0.5)',
  gridStroke: 'rgba(255, 255, 255, 0.3)',
  gridRadius: 10
};
let grid = Array.from({length:GRID_ROWS},()=>Array(GRID_COLS).fill(null));
// Prellenar algunas filas
for(let r=0;r<5;r++) for(let c=0;c<GRID_COLS;c++){ if(Math.random()<0.75) grid[r][c]=COLORS[Math.floor(Math.random()*COLORS.length)]; }
let shooter={x:canvas.width/2, y:canvas.height-40, angle:Math.PI/2, speed:8};
let currentBall = {x:shooter.x, y:shooter.y, vx:0, vy:0, color:COLORS[Math.floor(Math.random()*COLORS.length)], moving:false};
let nextColor = COLORS[Math.floor(Math.random()*COLORS.length)];
let score=0; let high=Number(localStorage.getItem('bubbleHigh')||0); let highName=localStorage.getItem('bubbleHighName')||'-'; let playerName=localStorage.getItem('playerName')||'';
function newBall(){ currentBall={x:shooter.x,y:shooter.y,vx:0,vy:0,color:nextColor,moving:false}; nextColor=COLORS[Math.floor(Math.random()*COLORS.length)]; }
function update(){ if(showIntro) return; if(currentBall.moving){ currentBall.x += currentBall.vx; currentBall.y += currentBall.vy; // rebote paredes
 if(currentBall.x < R || currentBall.x > canvas.width-R) currentBall.vx*=-1; if(currentBall.y < TOP_OFFSET){ snapBall(); }
 else { // colisión con bolas existentes
  outer: for(let r=0;r<GRID_ROWS;r++) for(let c=0;c<GRID_COLS;c++){ if(grid[r][c]){ const cx=LEFT_OFFSET + c*R*2; const cy=TOP_OFFSET + r*R*2; const dx=currentBall.x-cx; const dy=currentBall.y-cy; if(dx*dx+dy*dy < (R*2)*(R*2)-4){ snapBall(); break outer; } } }
 }
 }
}
function snapBall(){ // colocar en celda más cercana
 let c = Math.round((currentBall.x-LEFT_OFFSET)/(R*2)); c=Math.max(0,Math.min(GRID_COLS-1,c)); let r = Math.round((currentBall.y-TOP_OFFSET)/(R*2)); r=Math.max(0,Math.min(GRID_ROWS-1,r)); // buscar hueco libre hacia abajo
 while(r<GRID_ROWS && grid[r][c]) r++; if(r>=GRID_ROWS) { // fila añadida? scroll down
  scrollDown(); r=GRID_ROWS-1; }
 grid[r][c]=currentBall.color; currentBall.moving=false; matchAndClear(r,c); newBall(); checkGameOver(); }
function scrollDown(){ // desplaza una fila hacia abajo perdiendo última
 for(let r=GRID_ROWS-1;r>0;r--) grid[r]=grid[r-1].slice(); grid[0]=Array(GRID_COLS).fill(null); }
function matchAndClear(sr,sc){ const target=grid[sr][sc]; if(!target) return; const stack=[[sr,sc]]; const visited=new Set(); const cluster=[]; while(stack.length){ const [r,c]=stack.pop(); const key=r+','+c; if(visited.has(key)) continue; visited.add(key); if(r<0||r>=GRID_ROWS||c<0||c>=GRID_COLS) continue; if(grid[r][c]!==target) continue; cluster.push([r,c]); // vecinos 4-dir
 stack.push([r-1,c]); stack.push([r+1,c]); stack.push([r,c-1]); stack.push([r,c+1]); }
 if(cluster.length>=4){ cluster.forEach(([r,c])=> grid[r][c]=null); const gained=cluster.length*10; score+=gained; if(score>high){ high=score; highName=playerName||'-'; localStorage.setItem('bubbleHigh',String(high)); localStorage.setItem('bubbleHighName', playerName||'-'); } }
}
function checkGameOver(){ for(let r=GRID_ROWS-1;r>=GRID_ROWS-3;r--){ for(let c=0;c<GRID_COLS;c++){ if(grid[r][c]) return; } } }
function drawGrid(){ for(let r=0;r<GRID_ROWS;r++) for(let c=0;c<GRID_COLS;c++){ if(grid[r][c]) drawBall(LEFT_OFFSET + c*R*2, TOP_OFFSET + r*R*2, grid[r][c]); } }
function drawBall(x,y,color){
  // Crear gradiente para efecto 3D
  const gradient = ctx.createRadialGradient(
    x - R/3, y - R/3, R/10, // Punto de luz
    x, y, R              // Borde exterior
  );
  
  // Color original y sus variantes para el gradiente
  const lighterColor = lightenColor(color, 50);
  const darkerColor = darkenColor(color, 30);
  
  gradient.addColorStop(0, lighterColor);
  gradient.addColorStop(0.6, color);
  gradient.addColorStop(1, darkerColor);
  
  // Dibujar bola con gradiente
  ctx.beginPath();
  ctx.arc(x, y, R, 0, Math.PI*2);
  ctx.fillStyle = gradient;
  ctx.fill();
  
  // Borde más suave
  ctx.strokeStyle = 'rgba(0,0,0,0.3)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  
  // Reflejo (brillo)
  ctx.beginPath();
  ctx.arc(x - R/3, y - R/3, R/3, 0, Math.PI*2);
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.fill();
}

// Funciones auxiliares para manipular colores
function lightenColor(color, percent) {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, ((num >> 16) & 0xff) + amt);
  const G = Math.min(255, ((num >> 8) & 0xff) + amt);
  const B = Math.min(255, (num & 0xff) + amt);
  return '#' + ((1 << 24) + (R << 16) + (G << 8) + B).toString(16).slice(1);
}

function darkenColor(color, percent) {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.max(0, ((num >> 16) & 0xff) - amt);
  const G = Math.max(0, ((num >> 8) & 0xff) - amt);
  const B = Math.max(0, (num & 0xff) - amt);
  return '#' + ((1 << 24) + (R << 16) + (G << 8) + B).toString(16).slice(1);
}
function drawShooter(){
  // Base con efecto 3D
  const baseX = shooter.x - 30;
  const baseY = shooter.y - 10;
  const baseWidth = 60;
  const baseHeight = 20;
  
  // Gradiente para la base
  const baseGradient = ctx.createLinearGradient(baseX, baseY, baseX, baseY + baseHeight);
  baseGradient.addColorStop(0, '#607d8b');
  baseGradient.addColorStop(1, '#455a64');
  
  // Dibujar base con esquinas redondeadas
  ctx.fillStyle = baseGradient;
  ctx.beginPath();
  ctx.roundRect(baseX, baseY, baseWidth, baseHeight, 5);
  ctx.fill();
  
  // Sombra suave para efecto 3D
  ctx.shadowColor = 'rgba(0,0,0,0.3)';
  ctx.shadowBlur = 5;
  ctx.shadowOffsetY = 2;
  
  // Cañón con brillo
  ctx.save(); 
  ctx.translate(shooter.x, shooter.y); 
  ctx.rotate(-shooter.angle + Math.PI/2); 
  
  // Gradiente para el cañón
  const cannonGradient = ctx.createLinearGradient(-6, -32, 6, -32);
  cannonGradient.addColorStop(0, '#64b5f6');
  cannonGradient.addColorStop(0.5, '#90caf9');
  cannonGradient.addColorStop(1, '#64b5f6');
  
  ctx.fillStyle = cannonGradient;
  
  // Cañón con extremo redondeado
  ctx.beginPath();
  ctx.roundRect(-6, -32, 12, 40, 3);
  ctx.fill();
  
  // Borde del cañón
  ctx.strokeStyle = 'rgba(0,0,0,0.2)';
  ctx.lineWidth = 1;
  ctx.stroke();
  
  ctx.restore(); 
  
  // Resetear sombra
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  
  // Bola actual
  drawBall(shooter.x, shooter.y, currentBall.color); 
  
  // Siguiente bola con indicador
  drawBall(shooter.x+50, shooter.y+0, nextColor); 
  
  // Texto de "Siguiente" más atractivo
  ctx.font = 'bold 12px Arial';
  ctx.fillStyle = '#37474f';
  ctx.fillText('Siguiente', shooter.x+50, shooter.y+26);
}
function drawHUD() {
  // Barra superior con gradiente más atractivo
  if(window.GameUI) {
    GameUI.gradientBar(ctx, canvas.width, 60, '#0d47a1', '#1976d2');
  } else { 
    // Gradiente propio si no está disponible GameUI
    const gradient = ctx.createLinearGradient(0, 0, 0, 60);
    gradient.addColorStop(0, '#0d47a1');
    gradient.addColorStop(1, '#1976d2');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, 60);
    
    // Línea de brillo en la parte superior
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.fillRect(0, 0, canvas.width, 30);
  }
  
  // Textos con sombra para mejor legibilidad
  if(window.GameUI) {
    // Puntuación
    GameUI.shadowedText(ctx, 'Puntos: ' + score, 14, 38, '#fff', 'rgba(0,0,0,0.5)');
    
    // Título del juego
    ctx.textAlign = 'center';
    GameUI.shadowedText(ctx, 'Dispara Colores', canvas.width/2, 38, '#fff', 'rgba(0,0,0,0.5)');
    
    // Récord
    ctx.textAlign = 'right';
    GameUI.shadowedText(ctx, 'Récord: ' + high + ' (' + highName + ')', canvas.width-14, 38, '#fff', 'rgba(0,0,0,0.5)');
  } else {
    // Sombra manual si no está disponible GameUI
    ctx.font = 'bold 22px Arial';
    ctx.textAlign = 'left';
    
    // Sombra
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillText('Puntos: ' + score, 16, 40);
    
    // Texto principal
    ctx.fillStyle = '#fff';
    ctx.fillText('Puntos: ' + score, 14, 38);
    
    // Título
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillText('Dispara Colores', canvas.width/2 + 2, 40);
    ctx.fillStyle = '#fff';
    ctx.fillText('Dispara Colores', canvas.width/2, 38);
    
    // Récord
    ctx.textAlign = 'right';
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillText('Récord: ' + high + ' (' + highName + ')', canvas.width - 12, 40);
    ctx.fillStyle = '#fff';
    ctx.fillText('Récord: ' + high + ' (' + highName + ')', canvas.width - 14, 38);
  }
  
  // Restablecer alineación de texto
  ctx.textAlign = 'left';
}
function drawIntro() {
  ctx.save();
  const w = canvas.width - 140;
  const h = 280;
  const x = 70;
  const y = 90;
  
  // Fondo de panel con efecto oscuro
  if(window.GameUI) {
    // Usar el panel de instrucciones estándar con fondo oscuro
    const lines = [
      "• Apunta con el ratón y haz clic para disparar.",
      "• Junta 4 o más del mismo color para sumar puntos.",
      "• Evita que las filas bajen demasiado.",
      "• Sesiones cortas (máx. 10 min)."
    ];
    
    GameUI.drawInstructionPanel(ctx, "Dispara Colores", lines, {
      bgColor: 'rgba(15, 25, 40, 0.95)',
      titleColor: '#4fc3f7'
    });
    
    // Dibujar ejemplos de bolas con sus colores debajo del panel
    const colorExamples = [
      {x: canvas.width/2 - 160, color: COLORS[0]},
      {x: canvas.width/2 - 80, color: COLORS[1]},
      {x: canvas.width/2, color: COLORS[2]},
      {x: canvas.width/2 + 80, color: COLORS[3]},
      {x: canvas.width/2 + 160, color: COLORS[4]}
    ];
    
    // Dibujamos ejemplos de bolas en la parte inferior
    colorExamples.forEach(example => {
      drawBall(example.x, y + 220, example.color);
    });
    
    // Instrucción para empezar con efecto pulsante
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    
    // Efecto pulsante basado en tiempo
    const pulse = Math.sin(Date.now() / 300) * 0.1 + 0.9;
    ctx.globalAlpha = pulse;
    ctx.fillStyle = '#2196f3';
    ctx.fillText('Pulsa cualquier tecla para empezar', canvas.width/2, y + 270);
    
  } else {
    // Fondo oscuro semitransparente con borde
    ctx.globalAlpha = 0.95;
    ctx.fillStyle = 'rgba(15, 25, 40, 0.95)';
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 16);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Título con efecto de sombra
    ctx.fillStyle = '#4fc3f7';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetY = 2;
    ctx.fillText('Dispara Colores', canvas.width/2, y + 50);
    
    // Eliminar sombra para el resto del texto
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    
    // Instrucciones con mejor formato y separación
    ctx.font = '16px Arial';
    ctx.fillStyle = '#ffffff';
    
    const instructions = [
      '• Apunta con el ratón y haz clic para disparar.',
      '• Junta 4 o más del mismo color para sumar puntos.',
      '• Evita que las filas bajen demasiado.',
      '• Sesiones cortas (máx. 10 min).'
    ];
    
    let lineY = y + 100;
    const lineHeight = 28;
    
    instructions.forEach(line => {
      ctx.fillText(line, canvas.width/2, lineY);
      lineY += lineHeight;
    });
    
    // Instrucción para empezar con efecto pulsante
    ctx.font = 'bold 16px Arial';
    
    // Efecto pulsante basado en tiempo
    const pulse = Math.sin(Date.now() / 300) * 0.1 + 0.9;
    ctx.globalAlpha = pulse;
    ctx.fillStyle = '#2196f3';
    ctx.fillText('Pulsa cualquier tecla para empezar', canvas.width/2, y + 230);
    
    // Dibujar ejemplos de bolas con sus colores
    const colorExamples = [
      {x: canvas.width/2 - 160, color: COLORS[0]},
      {x: canvas.width/2 - 80, color: COLORS[1]},
      {x: canvas.width/2, color: COLORS[2]},
      {x: canvas.width/2 + 80, color: COLORS[3]},
      {x: canvas.width/2 + 160, color: COLORS[4]}
    ];
    
    // Dibujamos ejemplos de bolas en la parte inferior
    colorExamples.forEach(example => {
      drawBall(example.x, y + 190, example.color);
    });
  }
  
  ctx.restore();
}
function draw(){ 
  ctx.clearRect(0,0,canvas.width,canvas.height); 
  
  // Fondo mejorado con gradiente
  if(window.GameUI) {
    GameUI.softBg(ctx, canvas.width, canvas.height, background.gradient);
  } else {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, background.gradient[0]);
    gradient.addColorStop(1, background.gradient[1]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  
  // Área de juego con borde redondeado
  const gridWidth = GRID_COLS * R * 2 + 20;
  const gridHeight = GRID_ROWS * R * 2 + 20;
  const gridX = LEFT_OFFSET - R - 10;
  const gridY = TOP_OFFSET - R - 10;
  
  // Dibujar fondo del área de juego
  ctx.fillStyle = background.gridBg;
  if (window.GameUI) {
    GameUI.roundRect(ctx, gridX, gridY, gridWidth, gridHeight, background.gridRadius);
  } else {
    ctx.beginPath();
    ctx.roundRect(gridX, gridY, gridWidth, gridHeight, background.gridRadius);
  }
  ctx.fill();
  
  // Borde del área de juego
  ctx.strokeStyle = background.gridStroke;
  ctx.lineWidth = 2;
  ctx.stroke();
  
  // Dibujar elementos del juego
  drawGrid(); 
  drawShooter(); 
  drawHUD(); 
  
  // Mostrar pantalla de inicio si es necesario
  if(showIntro) drawIntro(); 
}
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
function loop(){ update(); draw(); setTimeout(() => { af = requestAnimationFrame(loop); }, 1000 / (60 * gameSpeed)); }
function key(e){ if(showIntro){ showIntro=false; return; } }
function mouseMove(e){ const rect=canvas.getBoundingClientRect(); const mx=e.clientX-rect.left; const my=e.clientY-rect.top; const ang=Math.atan2(shooter.y - my, mx - shooter.x); shooter.angle = ang; }
function mouseClick(e){ if(showIntro) return; if(currentBall.moving) return; currentBall.moving=true; const speed=10; const ang=shooter.angle; currentBall.vx = Math.cos(ang)*speed; currentBall.vy = -Math.sin(ang)*speed; }
canvas.addEventListener('mousemove',mouseMove); canvas.addEventListener('click',mouseClick); window.addEventListener('keydown',key); requestAnimationFrame(loop);
return function cleanup(){ if(af) cancelAnimationFrame(af); canvas.removeEventListener('mousemove',mouseMove); canvas.removeEventListener('click',mouseClick); window.removeEventListener('keydown',key); };
}
window.registerGame=registerGame;
