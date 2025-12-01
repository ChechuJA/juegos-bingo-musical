function registerGame(){
// Planeta Azul - Juego sobre basura en océanos y reciclaje
const canvas=document.getElementById('gameCanvas'); const ctx=canvas.getContext('2d'); let af=null;
canvas.width=800; canvas.height=520;

let submarino={x:400,y:250,w:60,h:40,vx:0,vy:0,capacidad:20,carga:0};
let basura=[]; // plásticos y residuos flotantes
let peces=[]; // fauna marina
let puntos=0, reciclados=0, tiempo=120;
let started=false, ended=false, showInstructions=true;
let mensajeRecord='';
let highScore = Number(localStorage.getItem('planetaAzulPuntos')||0);
let highName = localStorage.getItem('planetaAzulName')||'-';
const playerName = localStorage.getItem('playerName')||'';
const helpBtn = {x: canvas.width-42, y: 20, r: 14};
let lastTick=0;

// Tipos de basura
const tiposBasura=['🥤','🍾','🛍️','🥫','🪣','🧴'];

// Generar basura
for(let i=0;i<15;i++){
	basura.push({
		x:Math.random()*canvas.width,
		y:100+Math.random()*(canvas.height-150),
		tipo:tiposBasura[Math.floor(Math.random()*tiposBasura.length)],
		vx:(Math.random()-0.5)*0.5,
		vy:(Math.random()-0.5)*0.3,
		puntos:10
	});
}

// Generar peces
for(let i=0;i<8;i++){
	peces.push({
		x:Math.random()*canvas.width,
		y:100+Math.random()*(canvas.height-150),
		vx:(Math.random()-0.5)*2,
		vy:(Math.random()-0.5)*0.5,
		emoji:'🐠',
		salud:100
	});
}

// Centro de reciclaje (zona superior)
const centroReciclaje={x:canvas.width/2-60,y:50,w:120,h:40};

function generarBasura(){
	if(basura.length<25 && Math.random()<0.02){
		basura.push({
			x:Math.random()<0.5?0:canvas.width,
			y:100+Math.random()*(canvas.height-150),
			tipo:tiposBasura[Math.floor(Math.random()*tiposBasura.length)],
			vx:(Math.random()-0.5)*0.5,
			vy:(Math.random()-0.5)*0.3,
			puntos:10
		});
	}
}

function recolectarBasura(){
	if(submarino.carga>=submarino.capacidad) return;
	
	// Buscar basura cercana
	for(let i=basura.length-1;i>=0;i--){
		let b=basura[i];
		let dx=b.x-submarino.x;
		let dy=b.y-submarino.y;
		let dist=Math.sqrt(dx*dx+dy*dy);
		
		if(dist<50){
			basura.splice(i,1);
			submarino.carga++;
			puntos+=5;
			break;
		}
	}
}

function reciclar(){
	// Verificar si está en el centro de reciclaje
	if(submarino.x>centroReciclaje.x && submarino.x<centroReciclaje.x+centroReciclaje.w &&
	   submarino.y>centroReciclaje.y && submarino.y<centroReciclaje.y+centroReciclaje.h){
		if(submarino.carga>0){
			reciclados+=submarino.carga;
			puntos+=submarino.carga*15;
			submarino.carga=0;
		}
	}
}

function update(dt){
	if(!started) return;
	lastTick+=dt;
	
	if(lastTick>1000){
		lastTick=0;
		tiempo--;
		
		// Peces pierden salud si hay mucha basura cerca
		for(let p of peces){
			let basuraCerca=basura.filter(b=>Math.abs(b.x-p.x)<80 && Math.abs(b.y-p.y)<80).length;
			if(basuraCerca>2){
				p.salud=Math.max(0,p.salud-5);
			}
		}
		
		if(tiempo<=0){
			started=false; ended=true;
			// Bonus por peces salvados
			let pecesSanos=peces.filter(p=>p.salud>50).length;
			puntos+=pecesSanos*30;
			
			if(puntos>highScore){
				highScore=puntos; highName=playerName||'-';
				localStorage.setItem('planetaAzulPuntos', String(highScore));
				localStorage.setItem('planetaAzulName', highName);
				mensajeRecord='¡Nuevo récord!';
			} else mensajeRecord='';
		}
	}
	
	// Movimiento del submarino
	submarino.x+=submarino.vx;
	submarino.y+=submarino.vy;
	
	// Límites
	if(submarino.x<0) submarino.x=0;
	if(submarino.x>canvas.width-submarino.w) submarino.x=canvas.width-submarino.w;
	if(submarino.y<40) submarino.y=40;
	if(submarino.y>canvas.height-submarino.h) submarino.y=canvas.height-submarino.h;
	
	// Generar basura
	generarBasura();
	
	// Actualizar basura
	for(let b of basura){
		b.x+=b.vx;
		b.y+=b.vy;
		
		// Rebote en bordes
		if(b.x<0 || b.x>canvas.width) b.vx*=-1;
		if(b.y<80 || b.y>canvas.height-20) b.vy*=-1;
	}
	
	// Actualizar peces
	for(let p of peces){
		p.x+=p.vx;
		p.y+=p.vy;
		
		// Rebote en bordes
		if(p.x<0 || p.x>canvas.width) p.vx*=-1;
		if(p.y<80 || p.y>canvas.height-20) p.vy*=-1;
		
		// Evitar basura
		for(let b of basura){
			let dx=b.x-p.x;
			let dy=b.y-p.y;
			let dist=Math.sqrt(dx*dx+dy*dy);
			if(dist<40 && dist>0){
				p.vx-=dx/dist*0.1;
				p.vy-=dy/dist*0.1;
			}
		}
	}
}

function draw(){
	// Fondo - océano
	const gradOcean=ctx.createLinearGradient(0,0,0,canvas.height);
	gradOcean.addColorStop(0,'#4fc3f7');
	gradOcean.addColorStop(0.5,'#0288d1');
	gradOcean.addColorStop(1,'#01579b');
	ctx.fillStyle=gradOcean;
	ctx.fillRect(0,0,canvas.width,canvas.height);
	
	// Burbujas decorativas
	ctx.fillStyle='rgba(255,255,255,0.3)';
	for(let i=0;i<10;i++){
		let x=Math.random()*canvas.width;
		let y=(Date.now()/50+i*50)%canvas.height;
		ctx.beginPath();
		ctx.arc(x,y,3+Math.random()*3,0,Math.PI*2);
		ctx.fill();
	}
	
	if(showInstructions){
		ctx.fillStyle='rgba(0,0,0,0.7)';
		ctx.fillRect(50,80,canvas.width-100,320);
		ctx.fillStyle='#fff'; ctx.font='bold 22px Arial'; ctx.textAlign='center';
		ctx.fillText('🌊 PLANETA AZUL 🐋',canvas.width/2,120);
		ctx.font='16px Arial'; ctx.textAlign='left';
		ctx.fillText('Limpieza de océanos y reciclaje marino',80,160);
		ctx.fillText('',80,190);
		ctx.fillText('🎯 Objetivos:',80,220);
		ctx.fillText('  • Recoge plásticos y residuos del océano',80,245);
		ctx.fillText('  • Lleva la basura al centro de reciclaje (arriba)',80,270);
		ctx.fillText('  • Protege la fauna marina de la contaminación',80,295);
		ctx.fillText('',80,320);
		ctx.fillText('🎮 Controles: ⬅️➡️⬆️⬇️ mover | ESPACIO recoger | R reciclar',80,350);
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
		ctx.fillRect(100,130,canvas.width-200,260);
		ctx.fillStyle='#fff'; ctx.font='bold 26px Arial'; ctx.textAlign='center';
		ctx.fillText('¡Misión completada!',canvas.width/2,180);
		ctx.font='20px Arial';
		let pecesSanos=peces.filter(p=>p.salud>50).length;
		ctx.fillText('Residuos reciclados: '+reciclados,canvas.width/2,220);
		ctx.fillText('Peces protegidos: '+pecesSanos+'/'+peces.length,canvas.width/2,250);
		ctx.fillText('Puntuación: '+puntos,canvas.width/2,280);
		if(mensajeRecord){
			ctx.fillStyle='#ffeb3b';
			ctx.fillText(mensajeRecord,canvas.width/2,310);
		}
		ctx.fillStyle='#aaa'; ctx.font='16px Arial';
		ctx.fillText('Récord: '+highScore+' por '+highName,canvas.width/2,350);
		ctx.fillStyle='#4caf50'; ctx.font='bold 18px Arial';
		ctx.fillText('Presiona R para reintentar',canvas.width/2,385);
		ctx.textAlign='left';
		return;
	}
	
	// Centro de reciclaje
	ctx.fillStyle='#4caf50';
	ctx.fillRect(centroReciclaje.x,centroReciclaje.y,centroReciclaje.w,centroReciclaje.h);
	ctx.strokeStyle='#fff';
	ctx.lineWidth=3;
	ctx.strokeRect(centroReciclaje.x,centroReciclaje.y,centroReciclaje.w,centroReciclaje.h);
	ctx.fillStyle='#fff'; ctx.font='bold 16px Arial'; ctx.textAlign='center';
	ctx.fillText('♻️ RECICLAJE',centroReciclaje.x+centroReciclaje.w/2,centroReciclaje.y+25);
	ctx.textAlign='left';
	
	// HUD superior
	ctx.fillStyle='rgba(0,0,0,0.6)';
	ctx.fillRect(0,0,canvas.width,40);
	ctx.fillStyle='#fff'; ctx.font='bold 14px Arial';
	ctx.fillText('Puntos: '+puntos,15,25);
	ctx.fillText('🗑️ Carga: '+submarino.carga+'/'+submarino.capacidad,180,25);
	ctx.fillText('♻️ Reciclados: '+reciclados,380,25);
	ctx.fillText('🐠 Basura activa: '+basura.length,550,25);
	
	// Tiempo
	ctx.fillStyle=tiempo<30?'#ff5252':'#fff';
	ctx.fillText('⏱️ '+tiempo+'s',canvas.width-100,25);
	
	// Botón ayuda
	ctx.fillStyle='#1976d2'; ctx.beginPath(); ctx.arc(helpBtn.x,helpBtn.y,helpBtn.r,0,Math.PI*2); ctx.fill();
	ctx.fillStyle='#fff'; ctx.font='bold 18px Arial'; ctx.textAlign='center'; ctx.fillText('?',helpBtn.x,helpBtn.y+6);
	ctx.textAlign='left';
	
	// Basura
	ctx.font='25px Arial';
	for(let b of basura){
		ctx.fillText(b.tipo,b.x-12,b.y+12);
	}
	
	// Peces
	ctx.font='25px Arial';
	for(let p of peces){
		ctx.fillText(p.salud>50?'🐠':'🐟',p.x-12,p.y+12);
		
		// Barra de salud pequeña
		if(p.salud<100){
			ctx.fillStyle='#333';
			ctx.fillRect(p.x-10,p.y-20,20,3);
			ctx.fillStyle=p.salud>50?'#4caf50':'#f44336';
			ctx.fillRect(p.x-10,p.y-20,(p.salud/100)*20,3);
		}
	}
	
	// Submarino
	ctx.fillStyle='#ffd54f';
	ctx.fillRect(submarino.x,submarino.y,submarino.w,submarino.h);
	ctx.font='30px Arial';
	ctx.fillText('🤿',submarino.x+15,submarino.y+30);
	
	// Radio de recolección
	if(submarino.carga<submarino.capacidad){
		ctx.strokeStyle='rgba(76,175,80,0.5)';
		ctx.lineWidth=2;
		ctx.setLineDash([5,5]);
		ctx.beginPath();
		ctx.arc(submarino.x+submarino.w/2,submarino.y+submarino.h/2,50,0,Math.PI*2);
		ctx.stroke();
		ctx.setLineDash([]);
	}
	
	// Indicador de carga llena
	if(submarino.carga>=submarino.capacidad){
		ctx.fillStyle='rgba(255,0,0,0.7)';
		ctx.fillRect(submarino.x-10,submarino.y-25,submarino.w+20,20);
		ctx.fillStyle='#fff'; ctx.font='bold 12px Arial'; ctx.textAlign='center';
		ctx.fillText('¡LLENO! Ve a reciclar',submarino.x+submarino.w/2,submarino.y-11);
	}
	ctx.textAlign='left';
	
	// Mensaje educativo
	if(tiempo>100){
		ctx.fillStyle='rgba(0,0,0,0.7)';
		ctx.fillRect(100,480,canvas.width-200,30);
		ctx.fillStyle='#ffeb3b'; ctx.font='13px Arial'; ctx.textAlign='center';
		ctx.fillText('8 millones de toneladas de plástico llegan al océano cada año',canvas.width/2,500);
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
		if(e.key==='ArrowLeft'||e.key==='a'||e.key==='A') submarino.vx=-3;
		if(e.key==='ArrowRight'||e.key==='d'||e.key==='D') submarino.vx=3;
		if(e.key==='ArrowUp'||e.key==='w'||e.key==='W') submarino.vy=-3;
		if(e.key==='ArrowDown'||e.key==='s'||e.key==='S') submarino.vy=3;
		if(e.key===' '||e.key==='Spacebar') { e.preventDefault(); recolectarBasura(); }
		if(e.key==='r'||e.key==='R') { e.preventDefault(); reciclar(); }
	}
}

function keyup(e){
	if(e.key==='ArrowLeft'||e.key==='ArrowRight'||e.key==='a'||e.key==='A'||e.key==='d'||e.key==='D') submarino.vx=0;
	if(e.key==='ArrowUp'||e.key==='ArrowDown'||e.key==='w'||e.key==='W'||e.key==='s'||e.key==='S') submarino.vy=0;
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
