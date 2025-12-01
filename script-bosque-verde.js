function registerGame(){
// Bosque Verde - Juego sobre incendios forestales
const canvas=document.getElementById('gameCanvas'); const ctx=canvas.getContext('2d'); let af=null;
canvas.width=800; canvas.height=520;

let helicoptero={x:400,y:80,w:60,h:40,vx:0,agua:100};
let arboles=[]; // árboles del bosque
let fuegos=[]; // focos de incendio
let gotas=[]; // agua lanzada
let puntos=0, arbolesPlantados=0, tiempo=90;
let started=false, ended=false, showInstructions=true;
let mensajeRecord='';
let highScore = Number(localStorage.getItem('bosqueVerdePuntos')||0);
let highName = localStorage.getItem('bosqueVerdeName')||'-';
const playerName = localStorage.getItem('playerName')||'';
const helpBtn = {x: canvas.width-42, y: 20, r: 14};
let humedad=50; // humedad del suelo
let lastTick=0;

// Inicializar bosque
for(let i=0;i<30;i++){
	arboles.push({
		x:Math.random()*(canvas.width-40)+20,
		y:280+Math.random()*180,
		estado:'sano', // sano, ardiendo, quemado
		tiempo:0
	});
}

function generarFuego(){
	if(fuegos.length<8 && Math.random()<0.008){
		let arbol=arboles.find(a=>a.estado==='sano');
		if(arbol){
			arbol.estado='ardiendo';
			fuegos.push({
				x:arbol.x,
				y:arbol.y,
				intensidad:30
			});
		}
	}
}

function lanzarAgua(){
	if(helicoptero.agua>=10){
		helicoptero.agua-=10;
		gotas.push({
			x:helicoptero.x+helicoptero.w/2,
			y:helicoptero.y+helicoptero.h,
			vy:4,
			r:8
		});
	}
}

function plantarArbol(){
	if(arbolesPlantados<5){
		let x=Math.random()*(canvas.width-40)+20;
		let y=280+Math.random()*180;
		// Verificar que no esté muy cerca de otros
		let cerca=arboles.some(a=>Math.abs(a.x-x)<40 && Math.abs(a.y-y)<40);
		if(!cerca){
			arboles.push({x,y,estado:'sano',tiempo:0});
			arbolesPlantados++;
			puntos+=30;
		}
	}
}

function update(dt){
	if(!started) return;
	lastTick+=dt;
	
	if(lastTick>1000){
		lastTick=0;
		tiempo--;
		
		// Recargar agua lentamente
		if(helicoptero.agua<100) helicoptero.agua+=2;
		
		// Actualizar humedad
		humedad=Math.max(10, Math.min(90, humedad + (Math.random()-0.5)*5));
		
		if(tiempo<=0){
			started=false; ended=true;
			// Bonus por árboles salvados
			let sanos=arboles.filter(a=>a.estado==='sano').length;
			puntos+=sanos*10;
			
			if(puntos>highScore){
				highScore=puntos; highName=playerName||'-';
				localStorage.setItem('bosqueVerdePuntos', String(highScore));
				localStorage.setItem('bosqueVerdeName', highName);
				mensajeRecord='¡Nuevo récord!';
			} else mensajeRecord='';
		}
	}
	
	// Movimiento del helicóptero
	helicoptero.x+=helicoptero.vx;
	if(helicoptero.x<0) helicoptero.x=0;
	if(helicoptero.x>canvas.width-helicoptero.w) helicoptero.x=canvas.width-helicoptero.w;
	
	// Generar fuegos (menos si hay humedad)
	if(Math.random()>humedad/100){
		generarFuego();
	}
	
	// Propagar fuego
	for(let f of fuegos){
		f.intensidad+=0.2;
		
		// Buscar árbol cercano para propagar
		if(Math.random()<0.01){
			let cercano=arboles.find(a=>a.estado==='sano' && Math.abs(a.x-f.x)<60 && Math.abs(a.y-f.y)<60);
			if(cercano){
				cercano.estado='ardiendo';
				fuegos.push({x:cercano.x, y:cercano.y, intensidad:20});
			}
		}
	}
	
	// Actualizar gotas
	for(let i=gotas.length-1;i>=0;i--){
		let g=gotas[i];
		g.y+=g.vy;
		
		// Colisión con fuego
		for(let j=fuegos.length-1;j>=0;j--){
			let f=fuegos[j];
			if(Math.abs(g.x-f.x)<25 && Math.abs(g.y-f.y)<25){
				f.intensidad-=15;
				gotas.splice(i,1);
				puntos+=5;
				humedad+=2;
				
				if(f.intensidad<=0){
					fuegos.splice(j,1);
					// Recuperar árbol
					let arbol=arboles.find(a=>a.x===f.x && a.y===f.y);
					if(arbol) arbol.estado='sano';
					puntos+=20;
				}
				break;
			}
		}
		
		// Sale de pantalla
		if(g.y>canvas.height){
			gotas.splice(i,1);
		}
	}
	
	// Actualizar estado de árboles
	for(let a of arboles){
		if(a.estado==='ardiendo'){
			a.tiempo++;
			if(a.tiempo>150){
				a.estado='quemado';
				puntos-=10;
			}
		}
	}
}

function draw(){
	// Fondo - cielo y suelo
	const gradSky=ctx.createLinearGradient(0,0,0,280);
	gradSky.addColorStop(0,'#87ceeb');
	gradSky.addColorStop(1,'#e0f2ff');
	ctx.fillStyle=gradSky;
	ctx.fillRect(0,0,canvas.width,280);
	
	// Suelo
	ctx.fillStyle='#8b7355';
	ctx.fillRect(0,280,canvas.width,canvas.height-280);
	
	if(showInstructions){
		ctx.fillStyle='rgba(0,0,0,0.7)';
		ctx.fillRect(50,80,canvas.width-100,320);
		ctx.fillStyle='#fff'; ctx.font='bold 22px Arial'; ctx.textAlign='center';
		ctx.fillText('🌲 BOSQUE VERDE 🔥',canvas.width/2,120);
		ctx.font='16px Arial'; ctx.textAlign='left';
		ctx.fillText('Prevención y control de incendios forestales',80,160);
		ctx.fillText('',80,190);
		ctx.fillText('🎯 Objetivos:',80,220);
		ctx.fillText('  • Apaga los incendios con agua antes de que se propaguen',80,245);
		ctx.fillText('  • Planta nuevos árboles para recuperar el bosque',80,270);
		ctx.fillText('  • La humedad del suelo ayuda a prevenir fuegos',80,295);
		ctx.fillText('',80,320);
		ctx.fillText('🎮 Controles: ← → para mover | ESPACIO agua | P plantar árbol',80,350);
		ctx.font='bold 18px Arial'; ctx.textAlign='center';
		ctx.fillStyle='#4caf50';
		ctx.fillText('Presiona ENTER para comenzar',canvas.width/2,390);
		ctx.textAlign='left';
		
		// Botón ayuda
		ctx.fillStyle='#1976d2'; ctx.beginPath(); ctx.arc(helpBtn.x,helpBtn.y,helpBtn.r,0,Math.PI*2); ctx.fill();
		ctx.fillStyle='#fff'; ctx.font='bold 18px Arial'; ctx.textAlign='center'; ctx.fillText('?',helpBtn.x,helpBtn.y+6);
		return;
	}
	
	if(ended){
		ctx.fillStyle='rgba(0,0,0,0.8)';
		ctx.fillRect(100,150,canvas.width-200,220);
		ctx.fillStyle='#fff'; ctx.font='bold 26px Arial'; ctx.textAlign='center';
		ctx.fillText('¡Misión completada!',canvas.width/2,200);
		ctx.font='20px Arial';
		let sanos=arboles.filter(a=>a.estado==='sano').length;
		ctx.fillText('Árboles salvados: '+sanos,canvas.width/2,240);
		ctx.fillText('Puntuación: '+puntos,canvas.width/2,270);
		if(mensajeRecord){
			ctx.fillStyle='#ffeb3b';
			ctx.fillText(mensajeRecord,canvas.width/2,300);
		}
		ctx.fillStyle='#aaa'; ctx.font='16px Arial';
		ctx.fillText('Récord: '+highScore+' por '+highName,canvas.width/2,330);
		ctx.fillStyle='#4caf50'; ctx.font='bold 18px Arial';
		ctx.fillText('Presiona R para reintentar',canvas.width/2,360);
		ctx.textAlign='left';
		return;
	}
	
	// HUD
	ctx.fillStyle='rgba(0,0,0,0.5)';
	ctx.fillRect(0,0,canvas.width,40);
	ctx.fillStyle='#fff'; ctx.font='bold 16px Arial';
	ctx.fillText('Puntos: '+puntos,15,25);
	ctx.fillText('💧 Agua: '+Math.floor(helicoptero.agua)+'%',180,25);
	ctx.fillText('🌡️ Humedad: '+Math.floor(humedad)+'%',380,25);
	ctx.fillText('🌱 Plantados: '+arbolesPlantados+'/5',580,25);
	
	// Tiempo restante
	ctx.fillStyle=tiempo<20?'#ff5252':'#fff';
	ctx.fillText('⏱️ '+tiempo+'s',canvas.width-100,25);
	
	// Botón ayuda
	ctx.fillStyle='#1976d2'; ctx.beginPath(); ctx.arc(helpBtn.x,helpBtn.y,helpBtn.r,0,Math.PI*2); ctx.fill();
	ctx.fillStyle='#fff'; ctx.font='bold 18px Arial'; ctx.textAlign='center'; ctx.fillText('?',helpBtn.x,helpBtn.y+6);
	ctx.textAlign='left';
	
	// Árboles
	for(let a of arboles){
		if(a.estado==='sano'){
			ctx.font='30px Arial';
			ctx.fillText('🌲',a.x-15,a.y);
		} else if(a.estado==='ardiendo'){
			ctx.font='30px Arial';
			ctx.fillText('🔥',a.x-15,a.y);
		} else if(a.estado==='quemado'){
			ctx.font='30px Arial';
			ctx.fillText('🪵',a.x-15,a.y);
		}
	}
	
	// Fuegos (partículas extra)
	for(let f of fuegos){
		ctx.fillStyle='rgba(255,100,0,0.5)';
		ctx.beginPath();
		ctx.arc(f.x, f.y-10, f.intensidad/2, 0, Math.PI*2);
		ctx.fill();
	}
	
	// Gotas de agua
	ctx.fillStyle='#2196f3';
	for(let g of gotas){
		ctx.beginPath();
		ctx.arc(g.x,g.y,g.r,0,Math.PI*2);
		ctx.fill();
	}
	
	// Helicóptero
	ctx.fillStyle='#f44336';
	ctx.fillRect(helicoptero.x,helicoptero.y,helicoptero.w,helicoptero.h);
	ctx.font='35px Arial';
	ctx.fillText('🚁',helicoptero.x+5,helicoptero.y+35);
	
	// Mensaje educativo
	if(tiempo>70){
		ctx.fillStyle='rgba(0,0,0,0.7)';
		ctx.fillRect(100,450,canvas.width-200,50);
		ctx.fillStyle='#ffeb3b'; ctx.font='14px Arial'; ctx.textAlign='center';
		ctx.fillText('Cada año se queman miles de hectáreas. La prevención y acción rápida son clave',canvas.width/2,475);
		ctx.textAlign='left';
	}
}

function loop(ts){
	const dt=Math.min(ts-(lastTime||ts),100);
	lastTime=ts;
	update(dt);
	draw();
	af=requestAnimationFrame(loop);
}

let lastTime=0;
af=requestAnimationFrame(loop);

function keydown(e){
	if(showInstructions){
		if(e.key==='Enter'){ showInstructions=false; started=true; }
		if(e.key==='?'||e.key==='h'){ showInstructions=!showInstructions; }
	} else if(ended){
		if(e.key==='r'||e.key==='R'){ location.reload(); }
	} else {
		if(e.key==='ArrowLeft'||e.key==='a'||e.key==='A') helicoptero.vx=-5;
		if(e.key==='ArrowRight'||e.key==='d'||e.key==='D') helicoptero.vx=5;
		if(e.key===' '||e.key==='Spacebar') { e.preventDefault(); lanzarAgua(); }
		if(e.key==='p'||e.key==='P') { e.preventDefault(); plantarArbol(); }
	}
}

function keyup(e){
	if(e.key==='ArrowLeft'||e.key==='ArrowRight'||e.key==='a'||e.key==='A'||e.key==='d'||e.key==='D') helicoptero.vx=0;
}

function click(e){
	if(!showInstructions && !ended) return;
	const rect=canvas.getBoundingClientRect();
	const x=e.clientX-rect.left, y=e.clientY-rect.top;
	const dx=x-helpBtn.x, dy=y-helpBtn.y;
	if(dx*dx+dy*dy<helpBtn.r*helpBtn.r){ showInstructions=!showInstructions; }
}

canvas.addEventListener('keydown',keydown);
canvas.addEventListener('keyup',keyup);
canvas.addEventListener('click',click);
canvas.focus();

return ()=>{
	if(af) cancelAnimationFrame(af);
	canvas.removeEventListener('keydown',keydown);
	canvas.removeEventListener('keyup',keyup);
	canvas.removeEventListener('click',click);
};
}
