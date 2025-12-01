function registerGame() {
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let af = null;
 let showIntro = true;

// Barra (paddle)
let level = 1;
let maxLevel = 5;
let score = 0;
let highScore = Number(localStorage.getItem('arkanoidHighScore')||0);
let paddle = {
	width: 100,
	height: 18,
	x: canvas.width / 2 - 50,
	y: canvas.height - 30,
	speed: 8,
	dx: 0
};

// Power-ups temporales
let powerups=[]; // {x,y,dy,type,size}
let basePaddleWidth = paddle.width;
let bigActive=false, bigUntil=0; const BIG_EXTRA=40; const BIG_DURATION=7000;
let slowActive=false, slowUntil=0; const SLOW_FACTOR=0.6; const SLOW_DURATION=7000;
function now(){ return performance.now(); }

// Bolita
const ball = {
		x: canvas.width / 2,
		y: canvas.height - 45,
		size: 12,
		speed: 4,
		dx: 4,
		dy: -4
};

// Bloques (ajustados dinámicamente al ancho del canvas)
const blockRowCount = 4;
const blockColumnCount = 10; // más columnas para rellenar ancho
const blockHeight = 22;
const blockPaddingX = 8;
const blockPaddingY = 10;
const blockOffsetTop = 60;
const blockSideMargin = 30;
let blockWidth = 50; // recalculado luego
function recalcBlockWidth(){
	blockWidth = (canvas.width - blockSideMargin*2 - (blockColumnCount-1)*blockPaddingX)/blockColumnCount;
}
recalcBlockWidth();

let blocks = [];
function createBlocks() {
	blocks = [];
	for (let c = 0; c < blockColumnCount; c++) {
		blocks[c] = [];
		for (let r = 0; r < blockRowCount; r++) {
			blocks[c][r] = { x: 0, y: 0, status: 1 };
		}
	}
}
createBlocks();

// Teclas
let rightPressed = false;
let leftPressed = false;

// Background image loading
const backgroundImage = new Image();
backgroundImage.src = 'assets/arkanoid-background.png';
backgroundImage.onerror = () => { backgroundImage.src = 'assets/arkanoid-background.svg'; };

function backgroundReady() {
  return backgroundImage && backgroundImage.complete && backgroundImage.naturalWidth > 0;
}

// Dibuja fondo con texto bonito
function drawBackground() {
  // Draw space background if available
  if (backgroundReady()) {
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
  }
  
  // Text overlay with semi-transparent background for readability
  ctx.save();
  ctx.globalAlpha = 0.15;
  ctx.font = 'bold 48px Comic Sans MS, Arial';
  ctx.fillStyle = '#e91e63';
  ctx.textAlign = 'center';
  ctx.fillText('El juego de', canvas.width / 2, canvas.height / 2 - 40);
  ctx.font = 'bold 54px Comic Sans MS, Arial';
  ctx.fillStyle = '#0288d1';
  ctx.fillText('Bruno y Vega', canvas.width / 2, canvas.height / 2 + 10);
  ctx.font = 'bold 32px Comic Sans MS, Arial';
  ctx.fillStyle = '#00ffcc'; // Cambié el color a un fluorescente claro
  ctx.fillText('Nivel: ' + level, canvas.width / 2, canvas.height / 2 + 60);
  ctx.restore();
}

// Dibuja bloques
function drawBlocks() {
	for (let c = 0; c < blockColumnCount; c++) {
		for (let r = 0; r < blockRowCount; r++) {
			if (blocks[c][r].status === 1) {
				let blockX = blockSideMargin + c * (blockWidth + blockPaddingX);
				let blockY = blockOffsetTop + r * (blockHeight + blockPaddingY);
				blocks[c][r].x = blockX;
				blocks[c][r].y = blockY;
				ctx.beginPath();
				ctx.rect(blockX, blockY, blockWidth, blockHeight);
				const colors = ['#ffeb3b', '#ff9800', '#f44336', '#4caf50', '#2196f3', '#e91e63', '#00bcd4', '#9c27b0'];
				ctx.fillStyle = colors[(c + r) % colors.length];
				ctx.fill();
				ctx.strokeStyle = '#333';
				ctx.stroke();
				ctx.closePath();
			}
		}
	}
}

// Dibuja barra
function drawPaddle() {
		ctx.beginPath();
		ctx.rect(paddle.x, paddle.y, paddle.width, paddle.height);
		ctx.fillStyle = '#00c853';
		ctx.shadowColor = '#00e676';
		ctx.shadowBlur = 10;
		ctx.fill();
		ctx.closePath();
		ctx.shadowBlur = 0;
}

// Dibuja bolita
function drawBall() {
		ctx.beginPath();
		ctx.arc(ball.x, ball.y, ball.size, 0, Math.PI * 2);
		ctx.fillStyle = '#ff5722';
		ctx.shadowColor = '#ff9800';
		ctx.shadowBlur = 10;
		ctx.fill();
		ctx.closePath();
		ctx.shadowBlur = 0;
}

function drawPowerups(){
	for(const p of powerups){
		ctx.save();
		ctx.beginPath();
		ctx.arc(p.x,p.y,p.size,0,Math.PI*2);
		ctx.fillStyle = p.type==='big'? '#00c853':'#03a9f4';
		ctx.shadowColor='#fff'; ctx.shadowBlur=8; ctx.fill();
		ctx.fillStyle='#fff'; ctx.font='12px Arial'; ctx.textAlign='center'; ctx.textBaseline='middle';
		ctx.fillText(p.type==='big'?'⇔':'🐢', p.x, p.y+1);
		ctx.restore();
	}
}

// Dibuja todo
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    drawBlocks();
    drawPaddle();
    drawBall();
    drawPowerups();
    // Dibuja puntuación
    ctx.save();
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#ff9800';
    ctx.textAlign = 'left';
    let recordName = localStorage.getItem('arkanoidHighScoreName')||'';
    ctx.fillText('Puntos: ' + score + '  Récord: ' + highScore + (recordName? (' ('+recordName+')') : ''), 20, 30);
    ctx.restore();

    // Panel de introducción usando la utilidad drawInstructionPanel
    if(showIntro){
        const lines = [
            'Mueve la barra con ← → y rebota la bola para romper los bloques.',
            'Power-ups: barra más grande (⇔) o bola más lenta (🐢).',
            'Consejo: juega sesiones de hasta 10 minutos y descansa.',
            'Pulsa cualquier tecla para comenzar.'
        ];
        window.GameUI.drawInstructionPanel(ctx, 'Arkanoid', lines);
    }
}

// Mueve barra
function movePaddle() {
	if (rightPressed && paddle.x < canvas.width - paddle.width) {
		paddle.x += paddle.speed;
	} else if (leftPressed && paddle.x > 0) {
		paddle.x -= paddle.speed;
	}
}

// Mueve bolita
function moveBall() {
	ball.x += ball.dx;
	ball.y += ball.dy;

	// Actualizar power-ups cayendo
	for(let i=powerups.length-1;i>=0;i--){
		const p=powerups[i]; p.y += p.dy;
		// recoger
		if(p.y + p.size >= paddle.y && p.y - p.size <= paddle.y + paddle.height && p.x >= paddle.x && p.x <= paddle.x + paddle.width){
			if(p.type==='big'){
				bigActive=true; bigUntil=now()+BIG_DURATION; paddle.width = basePaddleWidth + BIG_EXTRA;
			}else if(p.type==='slow'){
				if(!slowActive){ ball.dx *= SLOW_FACTOR; ball.dy *= SLOW_FACTOR; }
				slowActive=true; slowUntil=now()+SLOW_DURATION;
			}
			powerups.splice(i,1); continue;
		}
		if(p.y - p.size > canvas.height) powerups.splice(i,1);
	}

	// Expiración efectos
	const t=now();
	if(bigActive && t>bigUntil){ bigActive=false; paddle.width = basePaddleWidth; }
	if(slowActive && t>slowUntil){ slowActive=false; ball.dx /= SLOW_FACTOR; ball.dy /= SLOW_FACTOR; }

	// Rebote en los lados
	if (ball.x + ball.size > canvas.width || ball.x - ball.size < 0) {
		ball.dx = -ball.dx;
	}
	// Rebote arriba
	if (ball.y - ball.size < 0) {
		ball.dy = -ball.dy;
	}
	// Rebote en la barra
	if (
		ball.x > paddle.x &&
		ball.x < paddle.x + paddle.width &&
		ball.y + ball.size > paddle.y &&
		ball.y - ball.size < paddle.y + paddle.height
	) {
		ball.dy = -ball.dy;
		ball.y = paddle.y - ball.size;
	}
	// Pierde (bolita abajo)
	if (ball.y + ball.size > canvas.height) {
		// Reinicia nivel y puntuación si pierde
		if(score>highScore){ highScore=score; localStorage.setItem('arkanoidHighScore', String(highScore)); }
		level = 1;
		score = 0;
		basePaddleWidth = 100; paddle.width = basePaddleWidth; bigActive=false; slowActive=false; powerups=[];
		ball.x = canvas.width / 2;
		ball.y = canvas.height - 45;
		ball.dx = 4;
		ball.dy = -4;
		createBlocks();
	}

	// Colisión con bloques
	let bloquesRestantes = 0;
	for (let c = 0; c < blockColumnCount; c++) {
		for (let r = 0; r < blockRowCount; r++) {
			let b = blocks[c][r];
			if (b.status === 1) {
				bloquesRestantes++;
				if (
					ball.x > b.x &&
					ball.x < b.x + blockWidth &&
					ball.y > b.y &&
					ball.y < b.y + blockHeight
				) {
					ball.dy = -ball.dy;
					b.status = 0;
					score += 10;
					// Posible aparición de power-up (estrella que cae)
					if(Math.random()<0.28){
						const type = Math.random()<0.5? 'big':'slow';
						powerups.push({x:b.x+blockWidth/2,y:b.y+blockHeight/2,dy:3,type,size:12});
					}
				}
			}
		}
	}
	// Si no quedan bloques, pasa de nivel
	if (bloquesRestantes === 0) {
		if (level < maxLevel) {
			level++;
			// establecer base y reducir ligeramente dificultad
			basePaddleWidth = Math.max(60, basePaddleWidth - 10);
			paddle.width = bigActive ? basePaddleWidth + BIG_EXTRA : basePaddleWidth;
			ball.x = canvas.width / 2;
			ball.y = canvas.height - 45;
			ball.dx = 4 + level;
			ball.dy = -4 - level;
			createBlocks();
		} else {
			// Juego completado
			setTimeout(() => {
				if(score>highScore){ highScore=score; localStorage.setItem('arkanoidHighScore', String(highScore)); }
				alert('¡Felicidades! Has completado todos los niveles. Puntuación final: ' + score);
				level = 1;
				score = 0;
				basePaddleWidth = 100; paddle.width = basePaddleWidth; bigActive=false; slowActive=false; powerups=[];
				ball.x = canvas.width / 2;
				ball.y = canvas.height - 45;
				ball.dx = 4;
				ball.dy = -4;
				createBlocks();
			}, 100);
		}
	}
}

// Eventos de teclado
function keydown(e){
	if(showIntro){ showIntro=false; return; }
	if (e.key === 'ArrowRight') rightPressed = true;
	if (e.key === 'ArrowLeft') leftPressed = true;
}
		if(score>highScore){ highScore=score; localStorage.setItem('arkanoidHighScore', String(highScore)); localStorage.setItem('arkanoidHighScoreName', localStorage.getItem('playerName')||''); }
				if(score>highScore){ highScore=score; localStorage.setItem('arkanoidHighScore', String(highScore)); localStorage.setItem('arkanoidHighScoreName', localStorage.getItem('playerName')||''); }
function keyup(e){
	if (e.key === 'ArrowRight') rightPressed = false;
	if (e.key === 'ArrowLeft') leftPressed = false;
}
document.addEventListener('keydown',keydown);
document.addEventListener('keyup',keyup);

// Variable global para controlar la velocidad del juego
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

// Bucle principal
function gameLoop() {
    movePaddle();
    moveBall();
    draw();
    setTimeout(() => {
        af = requestAnimationFrame(gameLoop);
    }, 1000 / (60 * gameSpeed)); // Ajusta la velocidad del juego
}

gameLoop();

// cleanup
return function cleanup(){
	if (af) cancelAnimationFrame(af);
	document.removeEventListener('keydown',keydown);
	document.removeEventListener('keyup',keyup);
};
}
window.registerGame = registerGame;
