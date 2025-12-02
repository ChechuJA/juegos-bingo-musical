function registerGame(){
	// Empuja Cajas (mini Sokoban con récord de menos movimientos)
	const canvas=document.getElementById('gameCanvas'); const ctx=canvas.getContext('2d'); let af=null;
	const TILE=50; // Aumentado de 40 a 50 para hacer el juego más grande
	const mapaBase=[
		'#########',
		'#   .  #',
		'# # #  #',
		'# $@   #',
		'#   #  #',
		'#  .   #',
		'#########'
	];
	// Ajustar el tamaño exacto del canvas para evitar espacio en blanco - más grande que antes
	canvas.width=mapaBase[0].length*TILE; canvas.height=mapaBase.length*TILE+90; // Ajustado a 90 para encajar con el panel superior
	let level=0; let movimientos=0; let mejor=Number(localStorage.getItem('sokobanBest')||0); let mejorName=localStorage.getItem('sokobanBestName')||'-'; const playerName=localStorage.getItem('playerName')||'';
	const MAX_MOVIMIENTOS = 30; // Máximo de movimientos permitidos
	let gameOver = false; // Estado de game over
	let showIntro = true; // Mostrar pantalla de introducción
	
	// Nubes decorativas en posiciones fijas
	const clouds = [
		{ x: 40, y: 120, size: 0.9 },
		{ x: 200, y: 180, size: 1.2 },
		{ x: 120, y: 260, size: 0.7 }
	];
	
	// Función para dibujar nubes en el fondo
	function drawClouds() {
		ctx.save();
		ctx.globalAlpha = 0.4;
		ctx.fillStyle = '#ffffff';
		
		for (const cloud of clouds) {
			const baseSize = 30 * cloud.size;
			// Dibujar varias burbujas para formar la nube
			ctx.beginPath();
			ctx.arc(cloud.x, cloud.y, baseSize, 0, Math.PI * 2);
			ctx.arc(cloud.x + baseSize * 0.8, cloud.y - baseSize * 0.2, baseSize * 0.7, 0, Math.PI * 2);
			ctx.arc(cloud.x + baseSize * 0.5, cloud.y + baseSize * 0.4, baseSize * 0.6, 0, Math.PI * 2);
			ctx.arc(cloud.x - baseSize * 0.5, cloud.y + baseSize * 0.2, baseSize * 0.5, 0, Math.PI * 2);
			ctx.fill();
		}
		
		ctx.restore();
	}
	function parse(){ mapa=mapaBase.map(r=>r.split('')); cajas=[]; objetivos=[]; for(let y=0;y<mapa.length;y++) for(let x=0;x<mapa[0].length;x++){ const ch=mapa[y][x]; if(ch==='@'){ jugador={x,y}; mapa[y][x]=' '; } else if(ch==='$') { cajas.push({x,y}); mapa[y][x]=' '; } else if(ch==='.') { objetivos.push({x,y}); mapa[y][x]='.'; } } }
	let mapa=[], cajas=[], objetivos=[], jugador={x:0,y:0}; parse();
	function isObjetivo(x,y){ return objetivos.some(o=>o.x===x&&o.y===y); }
	function cajaEn(x,y){ return cajas.find(c=>c.x===x&&c.y===y); }
	function mover(dx,dy){ 
		if(gameOver) return; // No permitir movimientos si es game over
		const nx=jugador.x+dx, ny=jugador.y+dy; 
		if(mapa[ny][nx]==='#') return; 
		const c=cajaEn(nx,ny); 
		if(c){ 
			const nx2=nx+dx, ny2=ny+dy; 
			if(mapa[ny2][nx2]==='#'||cajaEn(nx2,ny2)) return; 
			c.x=nx2; c.y=ny2; 
		} 
		jugador.x=nx; jugador.y=ny; 
		movimientos++; 
		
		// Comprobar si hemos superado el límite de movimientos
		if(movimientos >= MAX_MOVIMIENTOS && !completado()) {
			gameOver = true;
			return;
		}
		
		if(completado()){ 
			if(mejor===0||movimientos<mejor){ 
				mejor=movimientos; 
				mejorName=playerName||'-'; 
				localStorage.setItem('sokobanBest', String(mejor)); 
				localStorage.setItem('sokobanBestName', mejorName); 
			} 
			// Mostrar animación de victoria en lugar de alert
			mostrarVictoria();
		} 
	}
	
	// Función para mostrar animación de victoria
	let celebrando = false;
	let celebracionTiempo = 0;
	const TIEMPO_CELEBRACION = 3000; // 3 segundos de celebración
	const particulas = [];
	
	function mostrarVictoria() {
		celebrando = true;
		celebracionTiempo = 0;
		
		// Crear partículas de confeti
		for (let i = 0; i < 100; i++) {
			particulas.push({
				x: Math.random() * canvas.width,
				y: -20 - Math.random() * 100,
				size: 5 + Math.random() * 10,
				color: ['#ffeb3b', '#4caf50', '#2196f3', '#e91e63', '#ff9800'][Math.floor(Math.random() * 5)],
				speedY: 2 + Math.random() * 6,
				speedX: -2 + Math.random() * 4,
				rotation: Math.random() * 360,
				rotSpeed: -5 + Math.random() * 10
			});
		}
	}
	// Función para dibujar una estrella
	function drawStar(cx, cy, spikes, outerRadius, innerRadius) {
		let rot = Math.PI / 2 * 3;
		let x = cx;
		let y = cy;
		let step = Math.PI / spikes;
		
		ctx.beginPath();
		ctx.moveTo(cx, cy - outerRadius);
		
		for (let i = 0; i < spikes; i++) {
			x = cx + Math.cos(rot) * outerRadius;
			y = cy + Math.sin(rot) * outerRadius;
			ctx.lineTo(x, y);
			rot += step;
			
			x = cx + Math.cos(rot) * innerRadius;
			y = cy + Math.sin(rot) * innerRadius;
			ctx.lineTo(x, y);
			rot += step;
		}
		
		ctx.lineTo(cx, cy - outerRadius);
		ctx.closePath();
		ctx.fill();
	}
	
	// Función para dibujar el personaje (niño con mochila)
	function drawPlayer(x, y, size) {
		ctx.save();
		
		// Cuerpo (base con ropa colorida)
		const bodyGradient = ctx.createRadialGradient(x, y, 0, x, y, size);
		bodyGradient.addColorStop(0, '#4caf50'); // Verde
		bodyGradient.addColorStop(1, '#2e7d32'); // Verde oscuro
		ctx.fillStyle = bodyGradient;
		
		ctx.beginPath();
		ctx.arc(x, y, size * 0.9, 0, Math.PI * 2);
		ctx.fill();
		
		// Cara
		ctx.fillStyle = '#ffccbc'; // Tono piel
		ctx.beginPath();
		ctx.arc(x, y - size * 0.3, size * 0.6, 0, Math.PI * 2);
		ctx.fill();
		
		// Ojos
		ctx.fillStyle = '#000';
		ctx.beginPath();
		ctx.arc(x - size * 0.2, y - size * 0.3, size * 0.1, 0, Math.PI * 2);
		ctx.arc(x + size * 0.2, y - size * 0.3, size * 0.1, 0, Math.PI * 2);
		ctx.fill();
		
		// Sonrisa
		ctx.strokeStyle = '#000';
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.arc(x, y - size * 0.15, size * 0.3, 0.1 * Math.PI, 0.9 * Math.PI);
		ctx.stroke();
		
		// Gorra o pelo
		ctx.fillStyle = '#ff5722'; // Naranja
		ctx.beginPath();
		ctx.arc(x, y - size * 0.4, size * 0.5, Math.PI, 0);
		ctx.fill();
		
		// Brazos
		ctx.strokeStyle = '#2e7d32'; // Verde oscuro
		ctx.lineWidth = size * 0.3;
		ctx.lineCap = 'round';
		
		// Brazo izquierdo
		ctx.beginPath();
		ctx.moveTo(x - size * 0.5, y);
		ctx.lineTo(x - size * 0.8, y + size * 0.3);
		ctx.stroke();
		
		// Brazo derecho
		ctx.beginPath();
		ctx.moveTo(x + size * 0.5, y);
		ctx.lineTo(x + size * 0.8, y + size * 0.3);
		ctx.stroke();
		
		// Detalles (botones o logo en la camiseta)
		ctx.fillStyle = '#ffeb3b'; // Amarillo
		ctx.beginPath();
		ctx.arc(x, y, size * 0.2, 0, Math.PI * 2);
		ctx.fill();
		
		ctx.restore();
	}
	
	function completado(){ return cajas.every(c=>isObjetivo(c.x,c.y)); }
	function reiniciar(){ parse(); movimientos=0; gameOver=false; }
	function draw(){ 
		ctx.clearRect(0,0,canvas.width,canvas.height); 
		// Fondo más divertido con degradado colorido
		let bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
		bgGradient.addColorStop(0, '#a1e8ff');  // Azul cielo claro
		bgGradient.addColorStop(1, '#c4f7c5');  // Verde claro
		ctx.fillStyle = bgGradient;
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		
		// Dibujar nubes decorativas
		drawClouds();
		
		// Barra superior más vistosa con degradado más colorido
		let barGradient = ctx.createLinearGradient(0, 0, 0, 90);
		barGradient.addColorStop(0, '#7c4dff');  // Púrpura intenso
		barGradient.addColorStop(1, '#448aff');  // Azul brillante
		ctx.fillStyle = barGradient;
		ctx.fillRect(0, 0, canvas.width, 90);
		
		// Decoración de la barra: pequeñas estrellas o burbujas
		ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
		for (let i = 0; i < 8; i++) {
			const x = Math.random() * canvas.width;
			const y = Math.random() * 75;
			const size = 2 + Math.random() * 4;
			ctx.beginPath();
			ctx.arc(x, y, size, 0, Math.PI * 2);
			ctx.fill();
		}
		
		// Texto más atractivo y moderno
		ctx.fillStyle = '#fff';
		ctx.shadowColor = 'rgba(0,0,0,0.3)';
		ctx.shadowBlur = 4;
		ctx.font = 'bold 28px Comic Sans MS, Arial';
		ctx.textBaseline = 'middle';
		ctx.textAlign = 'left';
		ctx.fillText('¡Empuja Cajas!', 16, 32);
		
		// Indicador de movimientos más visual
		ctx.font = 'bold 18px Comic Sans MS, Arial';
		ctx.fillText('Movimientos: ' + movimientos + '/' + MAX_MOVIMIENTOS, 16, 65);
		
		// Récord con icono de trofeo
		ctx.textAlign = 'right';
		ctx.fillText('🏆 Récord: ' + (mejor > 0 ? mejor : '-') + ' (' + mejorName + ')', canvas.width - 16, 32);
		ctx.fillText('🔄 (R) Reiniciar', canvas.width - 16, 65);
		ctx.shadowBlur = 0;
		ctx.textAlign = 'left'; 
		
		for(let y=0;y<mapa.length;y++) for(let x=0;x<mapa[0].length;x++){ 
			const ch=mapa[y][x]; 
			const baseY=y*TILE+90; 
			if(ch==='#'){ 
				// Muros más interesantes con textura tipo ladrillo
				const wallGradient = ctx.createLinearGradient(x*TILE, baseY, x*TILE+TILE, baseY+TILE);
				wallGradient.addColorStop(0, '#ff7043'); // Naranja ladrillo
				wallGradient.addColorStop(1, '#e64a19'); // Naranja más oscuro
				ctx.fillStyle = wallGradient;
				ctx.fillRect(x*TILE, baseY, TILE, TILE);
				
				// Detalles de ladrillo
				ctx.strokeStyle = 'rgba(0,0,0,0.15)';
				ctx.lineWidth = 1;
				
				// Líneas horizontales
				for (let i = 1; i < 4; i++) {
					ctx.beginPath();
					ctx.moveTo(x*TILE, baseY + i * TILE/3);
					ctx.lineTo(x*TILE + TILE, baseY + i * TILE/3);
					ctx.stroke();
				}
				
				// Líneas verticales alternadas
				for (let i = 0; i < 3; i++) {
					const offset = (y % 2 === 0) ? 0 : TILE/6;
					ctx.beginPath();
					ctx.moveTo(x*TILE + i * TILE/3 + offset, baseY);
					ctx.lineTo(x*TILE + i * TILE/3 + offset, baseY + TILE);
					ctx.stroke();
				}
			} else { 
				// Suelo más atractivo con sombras sutiles
				const floorGradient = ctx.createLinearGradient(x*TILE, baseY, x*TILE+TILE, baseY+TILE);
				floorGradient.addColorStop(0, '#f5f5f5'); // Blanco brillante
				floorGradient.addColorStop(1, '#e0e0e0'); // Gris muy claro
				ctx.fillStyle = floorGradient;
				ctx.fillRect(x*TILE, baseY, TILE, TILE);
				
				// Detalles sutiles en el suelo
				ctx.strokeStyle = 'rgba(0,0,0,0.05)';
				ctx.lineWidth = 1;
				ctx.strokeRect(x*TILE+1, baseY+1, TILE-2, TILE-2);
				
				// Objetivos más vistosos y animados
				if(isObjetivo(x,y)){ 
					// Circulo exterior brillante
					ctx.fillStyle = '#ffca28'; // Amarillo
					ctx.beginPath(); 
					ctx.arc(x*TILE+TILE/2, baseY+TILE/2, 10, 0, Math.PI*2); 
					ctx.fill(); 
					
					// Estrella en lugar de círculo
					ctx.fillStyle = '#ffd54f'; // Amarillo más claro
					drawStar(x*TILE+TILE/2, baseY+TILE/2, 5, 8, 4);
				} 
			} 
		} 
		
		for(let c of cajas){ 
			// Caja de madera con detalles
			const boxGradient = ctx.createLinearGradient(c.x*TILE, c.y*TILE+90, c.x*TILE+TILE, c.y*TILE+90+TILE);
			boxGradient.addColorStop(0, '#8d6e63'); // Marrón
			boxGradient.addColorStop(0.5, '#a1887f'); // Marrón más claro
			boxGradient.addColorStop(1, '#8d6e63'); // Marrón
			
			ctx.fillStyle = boxGradient;
			ctx.fillRect(c.x*TILE+5, c.y*TILE+95, TILE-10, TILE-10);
			
			// Bordes de la caja
			ctx.strokeStyle = '#5d4037'; // Marrón más oscuro
			ctx.lineWidth = 2;
			ctx.strokeRect(c.x*TILE+5, c.y*TILE+95, TILE-10, TILE-10);
			
			// Detalles de la caja (clavos o tornillos)
			ctx.fillStyle = '#3e2723'; // Marrón muy oscuro
			ctx.beginPath();
			ctx.arc(c.x*TILE+12, c.y*TILE+102, 2, 0, Math.PI*2);
			ctx.arc(c.x*TILE+TILE-12, c.y*TILE+102, 2, 0, Math.PI*2);
			ctx.arc(c.x*TILE+12, c.y*TILE+TILE-12, 2, 0, Math.PI*2);
			ctx.arc(c.x*TILE+TILE-12, c.y*TILE+TILE-12, 2, 0, Math.PI*2);
			ctx.fill();
			
			// Adornos de la caja (símbolo o logo)
			ctx.fillStyle = '#d7ccc8'; // Beige claro
			ctx.font = '18px Arial';
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			ctx.fillText('📦', c.x*TILE+TILE/2, c.y*TILE+TILE/2+90);
		} 
		
		// Jugador más divertido (personaje niño en lugar de círculo)
		drawPlayer(jugador.x*TILE+TILE/2, jugador.y*TILE+90+TILE/2, TILE/2-2); 
		
		// Mostrar pantalla de introducción
		if(showIntro && window.GameUI) {
			const lines = [
				'¡Usa las flechas ↑↓←→ para mover al personaje y empujar las cajas!',
				'🎯 Coloca todas las cajas sobre las estrellas amarillas.',
				'⏱️ ¡Tienes sólo ' + MAX_MOVIMIENTOS + ' movimientos para completar el nivel!',
				'🎮 Pulsa cualquier tecla para comenzar la aventura.'
			];
			
			// Opciones personalizadas para el panel de instrucciones
			const options = {
				bgColor: 'rgba(103, 58, 183, 0.92)', // Púrpura más divertido
				titleColor: '#ffeb3b', // Amarillo brillante
				textColor: '#ffffff' // Blanco
			};
			
			window.GameUI.drawInstructionPanel(ctx, '¡Empuja Cajas!', lines, options);
		}
		
		// Mostrar pantalla de game over si se han agotado los movimientos
		if(gameOver) {
			ctx.save();
			
			// Fondo semitransparente con degradado
			const gameOverGradient = ctx.createRadialGradient(
				canvas.width/2, canvas.height/2, 10,
				canvas.width/2, canvas.height/2, canvas.width/2
			);
			gameOverGradient.addColorStop(0, 'rgba(244, 67, 54, 0.9)'); // Rojo
			gameOverGradient.addColorStop(1, 'rgba(136, 14, 79, 0.9)'); // Púrpura oscuro
			
			ctx.fillStyle = gameOverGradient;
			ctx.fillRect(0, 0, canvas.width, canvas.height);
			
			// Texto de game over con efecto de sombra
			ctx.fillStyle = '#ffeb3b'; // Amarillo
			ctx.shadowColor = '#000';
			ctx.shadowBlur = 15;
			ctx.font = 'bold 36px Comic Sans MS, Arial';
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			ctx.fillText('¡GAME OVER!', canvas.width / 2, canvas.height / 2 - 60);
			
			// Emoji triste
			ctx.font = '40px Arial';
			ctx.fillText('😢', canvas.width / 2, canvas.height / 2 - 15);
			
			// Información
			ctx.shadowBlur = 5;
			ctx.fillStyle = '#fff';
			ctx.font = '22px Comic Sans MS, Arial';
			ctx.fillText('¡Has usado tus ' + MAX_MOVIMIENTOS + ' movimientos!', canvas.width / 2, canvas.height / 2 + 30);
			
			// Instrucciones para reiniciar
			ctx.font = '24px Comic Sans MS, Arial';
			ctx.fillText('Presiona R para intentarlo de nuevo', canvas.width / 2, canvas.height / 2 + 70);
			
			// Añadir estrellas decorativas al fondo
			ctx.shadowBlur = 0;
			for (let i = 0; i < 15; i++) {
				const starX = Math.random() * canvas.width;
				const starY = Math.random() * canvas.height;
				const starSize = 2 + Math.random() * 4;
				
				ctx.fillStyle = 'rgba(255, 255, 255, ' + (0.3 + Math.random() * 0.7) + ')';
				drawStar(starX, starY, 5, starSize, starSize/2);
			}
			
			ctx.restore();
		}
	}
	function loop(t){ 
		draw(); 
		
		// Actualizar animación de celebración si está activa
		if (celebrando) {
			celebracionTiempo += 16; // Aproximadamente 60 FPS
			actualizarCelebracion();
			dibujarCelebracion();
			
			// Finalizar celebración después del tiempo establecido
			if (celebracionTiempo >= TIEMPO_CELEBRACION) {
				celebrando = false;
				particulas.length = 0; // Limpiar partículas
				reiniciar();
			}
		}
		
		af=requestAnimationFrame(loop); 
	}
	
	// Función para actualizar la animación de celebración
	function actualizarCelebracion() {
		// Actualizar partículas
		for (let i = particulas.length - 1; i >= 0; i--) {
			const p = particulas[i];
			p.y += p.speedY;
			p.x += p.speedX;
			p.rotation += p.rotSpeed;
			
			// Eliminar partículas que salen de la pantalla
			if (p.y > canvas.height) {
				particulas.splice(i, 1);
			}
		}
		
		// Añadir nuevas partículas mientras dure la celebración
		if (Math.random() < 0.2 && celebracionTiempo < TIEMPO_CELEBRACION * 0.7) {
			for (let i = 0; i < 5; i++) {
				particulas.push({
					x: Math.random() * canvas.width,
					y: -20 - Math.random() * 50,
					size: 5 + Math.random() * 10,
					color: ['#ffeb3b', '#4caf50', '#2196f3', '#e91e63', '#ff9800'][Math.floor(Math.random() * 5)],
					speedY: 2 + Math.random() * 6,
					speedX: -2 + Math.random() * 4,
					rotation: Math.random() * 360,
					rotSpeed: -5 + Math.random() * 10
				});
			}
		}
	}
	
	// Función para dibujar la celebración
	function dibujarCelebracion() {
		ctx.save();
		
		// Fondo semitransparente
		ctx.fillStyle = 'rgba(0,0,0,0.6)';
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		
		// Dibujar partículas de confeti
		for (const p of particulas) {
			ctx.save();
			ctx.translate(p.x, p.y);
			ctx.rotate(p.rotation * Math.PI / 180);
			ctx.fillStyle = p.color;
			ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
			ctx.restore();
		}
		
		// Mensaje de victoria
		ctx.fillStyle = '#ffeb3b'; // Amarillo brillante
		ctx.shadowColor = 'rgba(0,0,0,0.5)';
		ctx.shadowBlur = 15;
		ctx.font = 'bold 40px Comic Sans MS, Arial';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillText('¡NIVEL COMPLETADO!', canvas.width / 2, canvas.height / 2 - 60);
		
		// Emoji de celebración
		ctx.font = '50px Arial';
		ctx.fillText('🎉🎮🏆', canvas.width / 2, canvas.height / 2);
		
		// Información sobre movimientos
		ctx.fillStyle = '#fff';
		ctx.font = '24px Comic Sans MS, Arial';
		ctx.fillText('¡Lo lograste en ' + movimientos + ' movimientos!', canvas.width / 2, canvas.height / 2 + 60);
		
		// Récord
		if (movimientos === mejor) {
			ctx.fillStyle = '#4caf50'; // Verde
			ctx.font = 'bold 28px Comic Sans MS, Arial';
			ctx.fillText('¡NUEVO RÉCORD!', canvas.width / 2, canvas.height / 2 + 100);
		}
		
		ctx.restore();
	}
	function key(e){ 
		// Si estamos en la pantalla de introducción, salir de ella
		if(showIntro) {
			showIntro = false;
			return;
		}
		
		if(e.key==='ArrowLeft') mover(-1,0); 
		else if(e.key==='ArrowRight') mover(1,0); 
		else if(e.key==='ArrowUp') mover(0,-1); 
		else if(e.key==='ArrowDown') mover(0,1); 
		else if(e.key.toLowerCase()==='r'){ 
			reiniciar(); 
		}
	}
	window.addEventListener('keydown',key); requestAnimationFrame(loop);
	return function cleanup(){ if(af) cancelAnimationFrame(af); window.removeEventListener('keydown',key); };
}
window.registerGame=registerGame;
