function registerGame(){
// Vega la bailarina - Juego sencillo para 3 años
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let af = null;

let vega = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  size: 40,
  color: '#e91e63'
};
let corazones = [];
let bailando = false;
let totalCorazones = 0;
let nivel = 1;
let highScore = Number(localStorage.getItem('bailarinaHighScore')||0);
let highName = localStorage.getItem('bailarinaHighName')||'-';
const playerName = localStorage.getItem('playerName')||'';

// Sistema de niveles y objetos
const tiposObjetos = ['corazones', 'cintas', 'pelotas', 'estrellas', 'flores'];
const coloresVestidos = ['#e91e63', '#9c27b0', '#3f51b5', '#00bcd4', '#4caf50'];
const fondosEscenarios = ['teatro', 'gimnasio', 'parque', 'salon', 'estudio'];
let objetoActual = 'corazones';

// Assets: fondo y personaje (PNG con fallback a SVG)
const backgroundImage = new Image();
backgroundImage.src = 'assets/vega-bailarina-background.png';
backgroundImage.onerror = () => { backgroundImage.src = 'assets/vega-bailarina-background.svg'; };
const characterImage = new Image();
characterImage.src = 'assets/vega-bailarina-character.png';
characterImage.onerror = () => { characterImage.src = 'assets/vega-bailarina-character.svg'; };
function backgroundReady(){ return backgroundImage.complete && backgroundImage.naturalWidth>0; }
function characterReady(){ return characterImage.complete && characterImage.naturalWidth>0; }

// Sistema de niveles
function actualizarNivel() {
  const nuevoNivel = Math.floor(totalCorazones / 30) + 1;
  if (nuevoNivel !== nivel && nuevoNivel <= 5) {
    nivel = nuevoNivel;
    objetoActual = tiposObjetos[nivel - 1];
    vega.color = coloresVestidos[nivel - 1];
  }
}

function obtenerFondoActual() {
  return fondosEscenarios[nivel - 1] || 'teatro';
}

function dibujarFondo() {
  const tipoFondo = obtenerFondoActual();
  
  if (backgroundReady()) {
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
  } else {
    // Fondos personalizados según el nivel
    switch(tipoFondo) {
      case 'teatro':
        if(window.GameUI) GameUI.softBg(ctx,canvas.width,canvas.height,['#fce4ec','#f8bbd0']);
        break;
      case 'gimnasio':
        if(window.GameUI) GameUI.softBg(ctx,canvas.width,canvas.height,['#e8f5e9','#c8e6c9']);
        break;
      case 'parque':
        if(window.GameUI) GameUI.softBg(ctx,canvas.width,canvas.height,['#e3f2fd','#bbdefb']);
        break;
      case 'salon':
        if(window.GameUI) GameUI.softBg(ctx,canvas.width,canvas.height,['#fff3e0','#ffccbc']);
        break;
      case 'estudio':
        if(window.GameUI) GameUI.softBg(ctx,canvas.width,canvas.height,['#f3e5f5','#e1bee7']);
        break;
    }
  }
}

function drawCharacterSprite(){
  const w = 60, h = 80;
  ctx.drawImage(characterImage, vega.x - w/2, vega.y - h/2, w, h);
}

function drawVega() {
  ctx.save();
  // Cabeza
  ctx.beginPath();
  ctx.arc(vega.x, vega.y - 20, 16, 0, Math.PI * 2);
  ctx.fillStyle = '#ffe0b2';
  ctx.fill();
  ctx.closePath();
  
  // Pelo largo (según nivel)
  ctx.beginPath();
  ctx.ellipse(vega.x, vega.y - 20, 18, 12, 0, 0, Math.PI);
  ctx.fillStyle = nivel <= 2 ? '#8d6e63' : nivel <= 4 ? '#3e2723' : '#ff6f00';
  ctx.fill();
  ctx.closePath();
  
  // Pelo largo que cae hacia los lados
  ctx.beginPath();
  ctx.ellipse(vega.x - 15, vega.y - 5, 8, 20, -0.3, 0, Math.PI * 2);
  ctx.ellipse(vega.x + 15, vega.y - 5, 8, 20, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.closePath();
  
  // Cuerpo
  ctx.beginPath();
  ctx.rect(vega.x - 10, vega.y, 20, 30);
  ctx.fillStyle = vega.color;
  ctx.fill();
  ctx.closePath();
  
  // Falda/tutú según nivel
  ctx.beginPath();
  if (nivel === 1) {
    // Falda clásica
    ctx.ellipse(vega.x, vega.y + 30, 18, 10, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#f8bbd0';
  } else if (nivel === 2) {
    // Tutú de gimnasia
    ctx.ellipse(vega.x, vega.y + 30, 22, 8, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#c8e6c9';
  } else {
    // Falda larga elegante
    ctx.ellipse(vega.x, vega.y + 35, 20, 15, 0, 0, Math.PI * 2);
    ctx.fillStyle = nivel === 3 ? '#bbdefb' : nivel === 4 ? '#ffccbc' : '#e1bee7';
  }
  ctx.fill();
  ctx.closePath();
  
  // Brazos
  ctx.beginPath();
  ctx.moveTo(vega.x - 10, vega.y + 10);
  ctx.lineTo(vega.x - 30, vega.y + 10 + (bailando ? 20 : 0));
  ctx.moveTo(vega.x + 10, vega.y + 10);
  ctx.lineTo(vega.x + 30, vega.y + 10 + (bailando ? 20 : 0));
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.closePath();
  
  // Piernas
  ctx.beginPath();
  ctx.moveTo(vega.x - 5, vega.y + 30);
  ctx.lineTo(vega.x - 5, vega.y + 50);
  ctx.moveTo(vega.x + 5, vega.y + 30);
  ctx.lineTo(vega.x + 5, vega.y + 50);
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.closePath();
  
  ctx.restore();
}

function drawCorazones() {
  for (let c of corazones) {
    ctx.save();
    ctx.globalAlpha = c.alpha;
    
    switch(c.tipo || 'corazones') {
      case 'corazones':
        // Corazón original
        ctx.beginPath();
        ctx.moveTo(c.x, c.y);
        ctx.bezierCurveTo(c.x - 8, c.y - 8, c.x - 12, c.y + 8, c.x, c.y + 12);
        ctx.bezierCurveTo(c.x + 12, c.y + 8, c.x + 8, c.y - 8, c.x, c.y);
        ctx.fillStyle = '#ff4081';
        ctx.fill();
        ctx.closePath();
        break;
        
      case 'cintas':
        // Cinta de gimnasia rítmica
        ctx.beginPath();
        ctx.moveTo(c.x, c.y);
        ctx.quadraticCurveTo(c.x + 15, c.y - 10, c.x + 25, c.y);
        ctx.quadraticCurveTo(c.x + 35, c.y + 10, c.x + 50, c.y - 5);
        ctx.strokeStyle = '#9c27b0';
        ctx.lineWidth = 4;
        ctx.stroke();
        ctx.closePath();
        break;
        
      case 'pelotas':
        // Pelota de gimnasia
        ctx.beginPath();
        ctx.arc(c.x, c.y, 10, 0, Math.PI * 2);
        ctx.fillStyle = '#3f51b5';
        ctx.fill();
        // Brillo en la pelota
        ctx.beginPath();
        ctx.arc(c.x - 3, c.y - 3, 4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.fill();
        ctx.closePath();
        break;
        
      case 'estrellas':
        // Estrella de baile
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          const angle = (i * 4 * Math.PI) / 5;
          const x = c.x + 12 * Math.cos(angle);
          const y = c.y + 12 * Math.sin(angle);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.fillStyle = '#00bcd4';
        ctx.fill();
        ctx.closePath();
        break;
        
      case 'flores':
        // Flor elegante
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (i * Math.PI) / 3;
          ctx.ellipse(
            c.x + 8 * Math.cos(angle), 
            c.y + 8 * Math.sin(angle), 
            6, 4, angle, 0, Math.PI * 2
          );
        }
        ctx.fillStyle = '#4caf50';
        ctx.fill();
        // Centro de la flor
        ctx.beginPath();
        ctx.arc(c.x, c.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#ffeb3b';
        ctx.fill();
        ctx.closePath();
        break;
    }
    
    ctx.restore();
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // Fondo de escenario personalizado según nivel
  dibujarFondo();
  
  // Barra superior
  if(window.GameUI) GameUI.gradientBar(ctx,canvas.width,60,'#ad1457','#d81b60'); else { ctx.fillStyle='#d81b60'; ctx.fillRect(0,0,canvas.width,60);}
  
  ctx.fillStyle='#fff'; 
  ctx.font='bold 26px Arial'; 
  ctx.textAlign='center'; 
  ctx.fillText('Vega la bailarina', canvas.width/2,32);
  
  ctx.font='14px Arial'; 
  ctx.fillStyle='#ffeef5'; 
  const escenarioNombres = ['Teatro', 'Gimnasio', 'Parque', 'Salón', 'Estudio'];
  const objetoNombres = ['Corazones', 'Cintas', 'Pelotas', 'Estrellas', 'Flores'];
  ctx.fillText(`Nivel ${nivel} - ${escenarioNombres[nivel-1]} | ${objetoNombres[nivel-1]}: ${totalCorazones} | Récord: ${highScore} (${highName})`, canvas.width/2,52);
  
  // Vega: sprite si existe, si no el vector actual
  if (characterReady()) drawCharacterSprite(); else drawVega();
  drawCorazones();
  ctx.save(); 
  ctx.font='18px Arial'; 
  ctx.fillStyle='#444'; 
  ctx.textAlign='center'; 
  ctx.fillText('Flechas: mover  |  Espacio: bailar', canvas.width/2, canvas.height-34); 
  ctx.restore();
}

function moveVega() {
  if (leftPressed && vega.x - vega.size > 0) vega.x -= 10;
  if (rightPressed && vega.x + vega.size < canvas.width) vega.x += 10;
  if (upPressed && vega.y - vega.size > 0) vega.y -= 10;
  if (downPressed && vega.y + vega.size < canvas.height) vega.y += 10;
}

function updateCorazones() {
  for (let c of corazones) {
    c.y -= 2;
    c.alpha -= 0.02;
  }
  corazones = corazones.filter(c => c.alpha > 0);
}

let leftPressed = false;
let rightPressed = false;
let upPressed = false;
let downPressed = false;

function keydown(e){
  if (e.key === 'ArrowLeft') leftPressed = true;
  if (e.key === 'ArrowRight') rightPressed = true;
  if (e.key === 'ArrowUp') upPressed = true;
  if (e.key === 'ArrowDown') downPressed = true;
  if (e.code === 'Space') {
    bailando = true;
    // Crear diferentes objetos según el nivel
    for (let i = 0; i < 6; i++) {
      corazones.push({ 
        x: vega.x + Math.random() * 40 - 20, 
        y: vega.y - 10, 
        alpha: 1,
        tipo: objetoActual
      });
      totalCorazones++;
    }
    
    // Actualizar nivel cada 30 puntos
    actualizarNivel();
    
    if(totalCorazones>highScore){ 
      highScore=totalCorazones; 
      highName=playerName||'-'; 
      localStorage.setItem('bailarinaHighScore', String(highScore)); 
      localStorage.setItem('bailarinaHighName', highName); 
    }
    setTimeout(() => { bailando = false; }, 400);
  }
}
function keyup(e){
  if (e.key === 'ArrowLeft') leftPressed = false;
  if (e.key === 'ArrowRight') rightPressed = false;
  if (e.key === 'ArrowUp') upPressed = false;
  if (e.key === 'ArrowDown') downPressed = false;
}
document.addEventListener('keydown',keydown);
document.addEventListener('keyup',keyup);

function gameLoop() {
  moveVega();
  updateCorazones();
  actualizarNivel();
  draw();
  af = requestAnimationFrame(gameLoop);
}
gameLoop();
return function cleanup(){
  if (af) cancelAnimationFrame(af);
  document.removeEventListener('keydown',keydown);
  document.removeEventListener('keyup',keyup);
};
}
window.registerGame = registerGame;
