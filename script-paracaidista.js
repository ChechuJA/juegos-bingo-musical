function registerGame(){
// Bruno el paracaidista - Base Jump Simulator
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
// Aumentamos el tamaño para que el título se vea completo
canvas.width = 800; canvas.height = 500;
let af = null;

let altura = 10000; // metros
let velocidad = 30; // metros por segundo
let baseX = canvas.width / 2;
let baseWidth = 80;
let baseHeight = 20;
let gameOver = false;
let showInstructions = true;
let humoActivo = false;
let humoParticulas = []; // Array para partículas de humo
let score = 0;
let highScore = Number(localStorage.getItem('paracaHighScore')||0);
let nivel = 1;
let maxNivel = 5;
let vidas = 3;
let estrellas = [];
let obstaculos = [];
let obstaculoInterval = 80;
let frameCount = 0;
let preguntaPendiente = false;
let preguntaActual = null;
let mensajeNivel = '';

// Muñeco fijo en vertical
let bruno = {
  x: canvas.width / 2,
  y: canvas.height / 2 + 60,
  size: 30,
  color: '#2196f3',
  dx: 0,
  anim: 0
};

// Teclas
let leftPressed = false;
let rightPressed = false;
function drawInstructions() {
  ctx.save();
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = '#fff';
  // Caja más alta para que quepan todas las líneas
  ctx.fillRect(40, 40, canvas.width - 80, 160);
  ctx.font = 'bold 22px Arial';
  ctx.fillStyle = '#333';
  ctx.textAlign = 'center';
  ctx.fillText('Bruno el paracaidista', canvas.width / 2, 80);
  ctx.font = '16px Arial';
  ctx.fillText('Usa las flechas ← → para moverte', canvas.width / 2, 110);
  ctx.fillText('Pulsa H para echar humo', canvas.width / 2, 135);
  ctx.fillText('Evita los pájaros, globos y drones. Recoge estrellas para puntos extra.', canvas.width / 2, 160);
  ctx.fillText('Tienes 3 vidas. Pulsa cualquier tecla para empezar', canvas.width / 2, 185);
  ctx.restore();
}

function drawBruno() {
  ctx.save();
  bruno.anim += 0.16; const sway = Math.sin(bruno.anim)*4; const limb = Math.sin(bruno.anim*1.8)*6;
  // Sombra
  ctx.globalAlpha=0.25; ctx.fillStyle='#000'; ctx.beginPath(); ctx.ellipse(bruno.x, bruno.y+52, 14,6,0,0,Math.PI*2); ctx.fill(); ctx.globalAlpha=1;
  // Si hay sprite de personaje cargado, dibujarlo y salir
  if (characterImgReady()){
    const w = 60, h = 80; // tamaño objetivo del sprite
    ctx.drawImage(characterImage, bruno.x - w/2, bruno.y - h/2, w, h);
    ctx.restore();
    return;
  }
  // Paracaídas segmentado
  const radius=22; const segs=6; for(let i=0;i<segs;i++){ const a0=Math.PI + i*(Math.PI/segs); const a1=Math.PI + (i+1)*(Math.PI/segs); ctx.beginPath(); ctx.moveTo(bruno.x, bruno.y - 22); ctx.arc(bruno.x, bruno.y - 22, radius, a0, a1); ctx.closePath(); ctx.fillStyle= i%2? '#ffd54f':'#ffb300'; ctx.fill(); }
  ctx.strokeStyle='#333'; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(bruno.x, bruno.y - 22, radius, Math.PI, 2*Math.PI); ctx.stroke();
  // Cuerdas
  ctx.beginPath(); ctx.moveTo(bruno.x - radius*0.8, bruno.y - 10); ctx.lineTo(bruno.x - 6 + sway*0.2, bruno.y + 14); ctx.moveTo(bruno.x + radius*0.8, bruno.y - 10); ctx.lineTo(bruno.x + 6 + sway*0.2, bruno.y + 14); ctx.stroke();
  // Cabeza
  ctx.beginPath(); ctx.arc(bruno.x + sway*0.3, bruno.y, 12, 0, Math.PI*2); ctx.fillStyle='#ffe0b2'; ctx.fill();
  // Casco simple
  ctx.beginPath(); ctx.arc(bruno.x + sway*0.3, bruno.y - 4, 12, Math.PI, 2*Math.PI); ctx.fillStyle='#1976d2'; ctx.fill();
  // Cuerpo gradiente
  let g=ctx.createLinearGradient(bruno.x-6, bruno.y+12, bruno.x+6, bruno.y+34); g.addColorStop(0, '#64b5f6'); g.addColorStop(1,'#1976d2');
  ctx.fillStyle=g; ctx.fillRect(bruno.x - 6, bruno.y + 12, 12, 22);
  // Brazos (anim)
  ctx.strokeStyle='#333'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(bruno.x - 6, bruno.y + 18); ctx.lineTo(bruno.x - 16 - limb*0.3, bruno.y + 28 + limb*0.2); ctx.moveTo(bruno.x + 6, bruno.y + 18); ctx.lineTo(bruno.x + 16 + limb*0.3, bruno.y + 28 + limb*0.2); ctx.stroke();
  // Piernas (anim)
  ctx.beginPath(); ctx.moveTo(bruno.x - 4, bruno.y + 34); ctx.lineTo(bruno.x - 4 - limb*0.2, bruno.y + 46); ctx.moveTo(bruno.x + 4, bruno.y + 34); ctx.lineTo(bruno.x + 4 + limb*0.2, bruno.y + 46); ctx.stroke();
  // Humo
  if(humoActivo){ 
    // Dibujar partículas de humo existentes
    for(let p of humoParticulas) {
      ctx.beginPath(); 
      ctx.arc(p.x, p.y, p.size, 0, Math.PI*2); 
      ctx.fillStyle = `rgba(220,220,220,${p.opacity})`; 
      ctx.fill();
    }
  }
  ctx.restore();
}

function drawObstaculos() {
  for (let o of obstaculos) {
    ctx.save();
    ctx.fillStyle = o.color;
    if (o.tipo === 'pajaro') {
      ctx.beginPath();
      ctx.ellipse(o.x, o.y, o.size, o.size/2, 0, 0, Math.PI*2);
      ctx.fill();
    } else if (o.tipo === 'globo') {
      ctx.beginPath();
      ctx.arc(o.x, o.y, o.size*0.7, 0, Math.PI*2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(o.x, o.y + o.size*0.7);
      ctx.lineTo(o.x, o.y + o.size*1.1);
      ctx.strokeStyle = o.color;
      ctx.stroke();
    } else if (o.tipo === 'drone') {
      ctx.beginPath();
      ctx.rect(o.x - o.size*0.8, o.y - o.size*0.3, o.size*1.6, o.size*0.6);
      ctx.fill();
      ctx.fillStyle = '#000';
      ctx.fillRect(o.x - 2, o.y - 2, 4, 4);
    } else if (o.tipo === 'nube') {
      ctx.fillStyle = '#ccc';
      ctx.beginPath();
      ctx.arc(o.x - o.size*0.5, o.y, o.size*0.6, 0, Math.PI*2);
      ctx.arc(o.x, o.y - o.size*0.3, o.size*0.7, 0, Math.PI*2);
      ctx.arc(o.x + o.size*0.5, o.y, o.size*0.6, 0, Math.PI*2);
      ctx.fill();
    } else if (o.tipo === 'avion') {
      ctx.beginPath();
      ctx.moveTo(o.x - o.size, o.y);
      ctx.lineTo(o.x + o.size, o.y);
      ctx.lineWidth = 4;
      ctx.strokeStyle = o.color;
      ctx.stroke();
      ctx.fillStyle = o.color;
      ctx.fillRect(o.x - o.size*0.3, o.y - o.size*0.2, o.size*0.6, o.size*0.4);
    }
    ctx.restore();
  }
}

function drawBase() {
  ctx.save();
  ctx.fillStyle = '#4caf50';
  ctx.fillRect(baseX - baseWidth / 2, canvas.height - baseHeight, baseWidth, baseHeight);
  ctx.font = 'bold 18px Arial';
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.fillText('BASE', baseX, canvas.height - baseHeight / 2 + 6);
  ctx.restore();
}

function drawAltura() {
  ctx.save();
  ctx.font = 'bold 22px Arial';
  ctx.fillStyle = '#e91e63';
  ctx.textAlign = 'right';
  ctx.fillText('Altura: ' + Math.max(0, Math.floor(altura)) + ' m', canvas.width - 30, 40);
  ctx.restore();
}

function drawScore() {
  ctx.save();
  ctx.font = 'bold 20px Arial';
  ctx.fillStyle = '#ff9800';
  ctx.textAlign = 'left';
  ctx.fillText('Puntos: ' + score + '  Récord: ' + highScore, 20, 70);
  ctx.restore();
}

function drawVidas() {
  ctx.save();
  ctx.font = 'bold 20px Arial';
  ctx.fillStyle = '#e91e63';
  ctx.textAlign = 'left';
  ctx.fillText('Vidas: ' + vidas, 20, 100);
  ctx.restore();
}

function drawEstrellas() {
  for (let e of estrellas) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(e.x, e.y, 10, 0, Math.PI * 2);
    ctx.fillStyle = '#ffd700';
    ctx.shadowColor = '#fff';
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.closePath();
    ctx.shadowBlur = 0;
    ctx.restore();
  }
}

function drawMensajeNivel() {
  ctx.save();
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = '#fff';
  ctx.fillRect(60, canvas.height / 2 - 60, canvas.width - 120, 80);
  ctx.font = 'bold 22px Arial';
  ctx.fillStyle = '#333';
  ctx.textAlign = 'center';
  ctx.fillText(mensajeNivel, canvas.width / 2, canvas.height / 2);
  ctx.restore();
}

function drawPregunta() {
  ctx.save();
  ctx.globalAlpha = 0.95;
  ctx.fillStyle = '#fff';
  ctx.fillRect(60, canvas.height / 2 - 80, canvas.width - 120, 120);
  ctx.font = 'bold 20px Arial';
  ctx.fillStyle = '#333';
  ctx.textAlign = 'center';
  ctx.fillText('Pregunta lógica para puntos extra:', canvas.width / 2, canvas.height / 2 - 30);
  ctx.font = '18px Arial';
  ctx.fillText(preguntaActual.pregunta, canvas.width / 2, canvas.height / 2);
  ctx.font = '16px Arial';
  ctx.fillText('Responde con el número correcto usando el teclado.', canvas.width / 2, canvas.height / 2 + 40);
  ctx.restore();
}

const backgroundImage = new Image();
backgroundImage.src = 'assets/paracaidista-background.png';
const characterImage = new Image();
// Prefer PNG if present; fallback to SVG we ship
characterImage.src = 'assets/paracaidista-character.png';
characterImage.onerror = () => { characterImage.src = 'assets/paracaidista-character.svg'; };

function characterImgReady(){
  return characterImage && characterImage.complete && characterImage.naturalWidth > 0;
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.globalAlpha = 0.12;
  ctx.font = 'bold 48px Comic Sans MS, Arial';
  ctx.fillStyle = '#0288d1';
  ctx.textAlign = 'center';
  ctx.fillText('Bruno el paracaidista', canvas.width / 2, canvas.height / 2);
  ctx.restore();
  drawBase();
  drawBruno();
  drawObstaculos();
  drawEstrellas();
  drawAltura();
  drawScore();
  drawVidas();
  if (showInstructions) drawInstructions();
  if (mensajeNivel) drawMensajeNivel();
  if (preguntaPendiente) drawPregunta();
}

function updateHumo() {
  // Crear nuevas partículas de humo si está activo
  if (humoActivo) {
    // Añadir 1-3 partículas nuevas por frame
    const particleCount = 1 + Math.floor(Math.random() * 3);
    for (let i = 0; i < particleCount; i++) {
      humoParticulas.push({
        x: bruno.x + (Math.random() * 20 - 10),
        y: bruno.y + 50,
        size: 8 + Math.random() * 6,
        opacity: 0.8,
        speedX: (Math.random() * 2 - 1) * 0.5,
        speedY: Math.random() * 0.5 + 0.5
      });
    }
  }
  
  // Actualizar partículas existentes
  for (let i = humoParticulas.length - 1; i >= 0; i--) {
    const p = humoParticulas[i];
    p.x += p.speedX;
    p.y += p.speedY;
    p.size *= 1.03;
    p.opacity -= 0.02;
    
    if (p.opacity <= 0 || p.size > 30) {
      humoParticulas.splice(i, 1);
    }
  }
  
  // Limitar el número de partículas para evitar problemas de rendimiento
  if (humoParticulas.length > 100) {
    humoParticulas = humoParticulas.slice(-100);
  }
}

function moveBruno() {
  if (leftPressed && bruno.x - bruno.size > 0) bruno.x -= 7;
  if (rightPressed && bruno.x + bruno.size < canvas.width) bruno.x += 7;
}

function crearObstaculo() {
  let r = Math.random();
  let tipo, color, size;
  if (r < 0.3) { tipo = 'pajaro'; color = '#795548'; size = 22; }
  else if (r < 0.5) { tipo = 'globo'; color = '#e91e63'; size = 26; }
  else if (r < 0.7) { tipo = 'drone'; color = '#607d8b'; size = 20; }
  else if (r < 0.85) { tipo = 'nube'; color = '#bbb'; size = 30; }
  else { tipo = 'avion'; color = '#9e9e9e'; size = 28; }
  let x = 40 + Math.random() * (canvas.width - 80);
  obstaculos.push({ x, y: -30, size, color, tipo });
}

function crearEstrella() {
  let x = 40 + Math.random() * (canvas.width - 80);
  estrellas.push({ x, y: -30 });
}

function updateObstaculos() {
  for (let o of obstaculos) {
    o.y += 6 + Math.random() * (2 + nivel);
  }
  obstaculos = obstaculos.filter(o => o.y < canvas.height + 40);
  for (let e of estrellas) {
    e.y += 5 + nivel;
  }
  estrellas = estrellas.filter(e => e.y < canvas.height + 20);
}

function checkColisiones() {
  for (let o of obstaculos) {
    let dx = bruno.x - o.x;
    let dy = bruno.y - o.y;
    let dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < bruno.size + o.size / 2) {
      vidas--;
      if (vidas <= 0) {
        gameOver = true;
      } else {
        mensajeNivel = '¡Cuidado! Has perdido una vida.';
        setTimeout(() => { mensajeNivel = ''; }, 1200);
  bruno.x = canvas.width / 2;
  bruno.y = canvas.height / 2 + 60;
      }
      obstaculos = [];
      estrellas = [];
      break;
    }
  }
  for (let i = estrellas.length - 1; i >= 0; i--) {
    let e = estrellas[i];
    let dx = bruno.x - e.x;
    let dy = bruno.y - e.y;
    let dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < bruno.size + 10) {
      score += 50;
      estrellas.splice(i, 1);
      mensajeNivel = '¡Has recogido una estrella! +50 puntos';
      setTimeout(() => { mensajeNivel = ''; }, 1200);
    }
  }
}

function checkLanding() {
  if (altura <= 0 && bruno.y + bruno.size > canvas.height - baseHeight) {
    if (bruno.x > baseX - baseWidth / 2 && bruno.x < baseX + baseWidth / 2) {
      score += 100;
      if (nivel < maxNivel) {
        nivel++;
        mensajeNivel = '¡Nivel superado! Curiosidad: El récord mundial de salto BASE es de más de 7.600 metros.';
        setTimeout(() => { mensajeNivel = ''; preguntaLogica(); }, 1800);
      } else {
        setTimeout(() => {
          if(score>highScore){ highScore=score; localStorage.setItem('paracaHighScore', String(highScore)); }
          alert('¡Has completado todos los niveles! Puntuación final: ' + score);
          reiniciar();
        }, 100);
      }
    } else {
      setTimeout(() => {
        alert('¡Has caído fuera de la base!');
        reiniciar();
      }, 100);
    }
  }
}

function reiniciar() {
  if(score>highScore){ highScore=score; localStorage.setItem('paracaHighScore', String(highScore)); }
  altura = 10000;
  bruno.x = canvas.width / 2;
  bruno.y = canvas.height / 2 + 60;
  obstaculos = [];
  estrellas = [];
  humoParticulas = [];
  gameOver = false;
  showInstructions = true;
  humoActivo = false;
  score = 0;
  nivel = 1;
  vidas = 3;
  preguntaPendiente = false;
  preguntaActual = null;
  mensajeNivel = '';
}

function preguntaLogica() {
  preguntaPendiente = true;
  let preguntas = [
    { pregunta: '¿Cuánto es 3 + 4?', respuesta: '7' },
    { pregunta: '¿Cuánto es 12 - 5?', respuesta: '7' },
    { pregunta: '¿Cuánto es 2 x 6?', respuesta: '12' },
    { pregunta: '¿Cuánto es 15 / 3?', respuesta: '5' },
    { pregunta: '¿Cuánto es 9 + 8?', respuesta: '17' }
  ];
  preguntaActual = preguntas[Math.floor(Math.random() * preguntas.length)];
}

function gameLoop() {
  if (gameOver) {
    setTimeout(() => {
  if(score>highScore){ highScore=score; localStorage.setItem('paracaHighScore', String(highScore)); }
      alert('¡Te has quedado sin vidas! Intenta de nuevo.');
      reiniciar();
    }, 100);
    return;
  }
  if (preguntaPendiente) {
    draw();
    return;
  }
  if (showInstructions) {
    draw();
    return;
  }
  frameCount++;
  if (frameCount % obstaculoInterval === 0) crearObstaculo();
  if (frameCount % (obstaculoInterval * 2) === 0) crearEstrella();
  altura -= velocidad * 0.03 + nivel * 0.01;
  // Bruno está fijo, los objetos se mueven
  moveBruno();
  updateHumo();
  updateObstaculos();
  checkColisiones();
  checkLanding();
  draw();
  if (altura > 0) af = requestAnimationFrame(gameLoop);
  else draw();
}

function keydown(e){
  if (showInstructions) {
    showInstructions = false;
    gameLoop();
    return;
  }
  if (preguntaPendiente) {
    if (e.key === preguntaActual.respuesta) {
      score += 100;
      mensajeNivel = '¡Respuesta correcta! +100 puntos';
      preguntaPendiente = false;
      preguntaActual = null;
  setTimeout(() => { mensajeNivel = ''; altura = 10000; bruno.x = canvas.width / 2; bruno.y = canvas.height / 2 + 60; obstaculos = []; estrellas = []; gameLoop(); }, 1200);
    } else if (!isNaN(Number(e.key))) {
      mensajeNivel = 'Respuesta incorrecta.';
      preguntaPendiente = false;
      preguntaActual = null;
  setTimeout(() => { mensajeNivel = ''; altura = 10000; bruno.x = canvas.width / 2; bruno.y = canvas.height / 2 + 60; obstaculos = []; estrellas = []; gameLoop(); }, 1200);
    }
    return;
  }
  if (e.key === 'ArrowLeft') leftPressed = true;
  if (e.key === 'ArrowRight') rightPressed = true;
  if (e.key.toLowerCase() === 'h') humoActivo = true;
}
function keyup(e){
  if (e.key === 'ArrowLeft') leftPressed = false;
  if (e.key === 'ArrowRight') rightPressed = false;
  if (e.key.toLowerCase() === 'h') humoActivo = false;
}
document.addEventListener('keydown',keydown);
document.addEventListener('keyup',keyup);

draw();
return function cleanup(){
  if (af) cancelAnimationFrame(af);
  document.removeEventListener('keydown',keydown);
  document.removeEventListener('keyup',keyup);
};
}
window.registerGame = registerGame;