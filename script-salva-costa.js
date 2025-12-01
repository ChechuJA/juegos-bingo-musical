function registerGame(){
// Salva la Costa - Juego sobre el vertido de petróleo del Prestige
const canvas=document.getElementById('gameCanvas'); const ctx=canvas.getContext('2d'); let af=null;
canvas.width=800; canvas.height=520;

let barco={x:400,y:60,w:80,h:40,vx:0};
let petroleo=[]; // manchas de petróleo que caen
let peces=[]; // peces nadando que hay que proteger
let barreras=[]; // barreras ecológicas del jugador
let puntos=0, vidas=3, nivel=1, tiempo=0;
let started=false, ended=false, showInstructions=true;
let mensajeRecord='';
let highScore = Number(localStorage.getItem('salvaCostaDinero')||0);
let highName = localStorage.getItem('salvaCostaName')||'-';
const playerName = localStorage.getItem('playerName')||'';
const helpBtn = {x: canvas.width-42, y: 20, r: 14};

// Generación de elementos
function generarPetroleo(){
	if(Math.random()<0.015 + nivel*0.005){
		petroleo.push({
			x:Math.random()*(canvas.width-40)+20,
			y:0,
			w:30+Math.random()*20,
			h:15+Math.random()*10,
			vy:1+Math.random()*0.5+nivel*0.1
		});
	}
}

function generarPeces(){
	if(peces.length<5 && Math.random()<0.01){
		peces.push({
			x:Math.random()*(canvas.width-40)+20,
			y:350+Math.random()*120,
			w:25,
			h:15,
			vx:(Math.random()-0.5)*2,
			contaminado:false,
			emoji:'🐟'
		});
	}
}

function colocarBarrera(){
	if(barreras.length<8){
		barreras.push({
			x:barco.x+barco.w/2-20,
			y:barco.y+barco.h,
			w:40,
			h:60,
			duracion:300
		});
	}
}

function update(dt){
	if(!started) return;
	tiempo+=dt;
	
	// Movimiento del barco
	barco.x+=barco.vx;
	if(barco.x<0) barco.x=0;
	if(barco.x>canvas.width-barco.w) barco.x=canvas.width-barco.w;
	
	// Generar elementos
	generarPetroleo();
	generarPeces();
	
	// Actualizar petróleo
	for(let i=petroleo.length-1;i>=0;i--){
		let p=petroleo[i];
		p.y+=p.vy;
		
		// Colisión con barreras
		let bloqueado=false;
		for(let b of barreras){
			if(p.x<b.x+b.w && p.x+p.w>b.x && p.y<b.y+b.h && p.y+p.h>b.y){
				bloqueado=true;
				puntos+=5;
				break;
			}
		}
		
		if(bloqueado){
			petroleo.splice(i,1);
			continue;
		}
		
		// Colisión con peces
		for(let f of peces){
			if(!f.contaminado && p.x<f.x+f.w && p.x+p.w>f.x && p.y<f.y+f.h && p.y+p.h>f.y){
				f.contaminado=true;
				vidas--;
			}
		}
		
		// Sale de pantalla
		if(p.y>canvas.height){
			petroleo.splice(i,1);
		}
	}
	
	// Actualizar peces
	for(let i=peces.length-1;i>=0;i--){
		let f=peces[i];
		f.x+=f.vx;
		if(f.x<0 || f.x>canvas.width) f.vx*=-1;
		
		// Recoger peces limpios
		if(!f.contaminado && barco.x<f.x+f.w && barco.x+barco.w>f.x && barco.y+barco.h>f.y && barco.y<f.y+f.h){
			puntos+=20;
			peces.splice(i,1);
		}
	}
	
	// Actualizar barreras
	for(let i=barreras.length-1;i>=0;i--){
		barreras[i].duracion--;
		if(barreras[i].duracion<=0){
			barreras.splice(i,1);
		}
	}
	
	// Subir nivel
	if(tiempo>15000 && nivel<5){
		nivel++;
		tiempo=0;
	}
	
	// Fin del juego
	if(vidas<=0){
		started=false; ended=true;
		if(puntos>highScore){
			highScore=puntos; highName=playerName||'-';
			localStorage.setItem('salvaCostaDinero', String(highScore));
			localStorage.setItem('salvaCostaName', highName);
			mensajeRecord='¡Nuevo récord!';
		} else mensajeRecord='';
	}
}

function draw(){
	// Fondo - mar
	const grad=ctx.createLinearGradient(0,0,0,canvas.height);
	grad.addColorStop(0,'#87ceeb');
	grad.addColorStop(0.6,'#4682b4');
	grad.addColorStop(1,'#1e3a5f');
	ctx.fillStyle=grad;
	ctx.fillRect(0,0,canvas.width,canvas.height);
	
	// Cielo
	ctx.fillStyle='rgba(135,206,235,0.5)';
	ctx.fillRect(0,0,canvas.width,100);
	
	if(showInstructions){
		ctx.fillStyle='rgba(0,0,0,0.7)';
		ctx.fillRect(50,100,canvas.width-100,280);
		ctx.fillStyle='#fff'; ctx.font='bold 22px Arial'; ctx.textAlign='center';
		ctx.fillText('🛢️ SALVA LA COSTA 🌊',canvas.width/2,140);
		ctx.font='16px Arial'; ctx.textAlign='left';
		ctx.fillText('Basado en el desastre del Prestige (España, 2002)',80,180);
		ctx.fillText('',80,210);
		ctx.fillText('🎯 Objetivos:',80,240);
		ctx.fillText('  • Protege los peces del petróleo con barreras ecológicas',80,265);
		ctx.fillText('  • Recoge peces limpios para salvarlos',80,290);
		ctx.fillText('  • Evita que el petróleo contamine la fauna marina',80,315);
		ctx.fillText('',80,340);
		ctx.fillText('🎮 Controles: ← → para mover | ESPACIO para colocar barrera',80,360);
		ctx.font='bold 18px Arial'; ctx.textAlign='center';
		ctx.fillStyle='#4caf50';
		ctx.fillText('Presiona ENTER para comenzar',canvas.width/2,400);
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
		ctx.fillText('¡Misión terminada!',canvas.width/2,200);
		ctx.font='20px Arial';
		ctx.fillText('Puntuación: '+puntos,canvas.width/2,240);
		if(mensajeRecord){
			ctx.fillStyle='#ffeb3b';
			ctx.fillText(mensajeRecord,canvas.width/2,280);
		}
		ctx.fillStyle='#aaa'; ctx.font='16px Arial';
		ctx.fillText('Récord: '+highScore+' por '+highName,canvas.width/2,320);
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
	ctx.fillText('❤️'.repeat(vidas),200,25);
	ctx.fillText('Nivel: '+nivel,350,25);
	ctx.fillText('Barreras: '+(8-barreras.length),500,25);
	
	// Botón ayuda
	ctx.fillStyle='#1976d2'; ctx.beginPath(); ctx.arc(helpBtn.x,helpBtn.y,helpBtn.r,0,Math.PI*2); ctx.fill();
	ctx.fillStyle='#fff'; ctx.font='bold 18px Arial'; ctx.textAlign='center'; ctx.fillText('?',helpBtn.x,helpBtn.y+6);
	ctx.textAlign='left';
	
	// Barco del jugador
	ctx.fillStyle='#8b4513';
	ctx.fillRect(barco.x,barco.y,barco.w,barco.h);
	ctx.fillStyle='#fff';
	ctx.fillRect(barco.x+30,barco.y-10,20,10);
	ctx.font='24px Arial';
	ctx.fillText('⛵',barco.x+20,barco.y+30);
	
	// Petróleo
	ctx.fillStyle='#000';
	for(let p of petroleo){
		ctx.globalAlpha=0.7;
		ctx.fillRect(p.x,p.y,p.w,p.h);
		ctx.globalAlpha=1;
	}
	
	// Peces
	for(let f of peces){
		ctx.font='20px Arial';
		ctx.fillText(f.contaminado?'🐟💀':'🐟',f.x,f.y+15);
	}
	
	// Barreras
	ctx.fillStyle='#ff9800';
	ctx.strokeStyle='#f57c00';
	ctx.lineWidth=2;
	for(let b of barreras){
		ctx.globalAlpha=b.duracion/300;
		ctx.fillRect(b.x,b.y,b.w,b.h);
		ctx.strokeRect(b.x,b.y,b.w,b.h);
		ctx.globalAlpha=1;
	}
	
	// Mensaje educativo
	if(tiempo<5000){
		ctx.fillStyle='rgba(0,0,0,0.7)';
		ctx.fillRect(100,450,canvas.width-200,50);
		ctx.fillStyle='#ffeb3b'; ctx.font='14px Arial'; ctx.textAlign='center';
		ctx.fillText('El Prestige derramó 63.000 toneladas de petróleo, afectando 1.900 km de costa',canvas.width/2,475);
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
		if(e.key==='ArrowLeft'||e.key==='a'||e.key==='A') barco.vx=-4;
		if(e.key==='ArrowRight'||e.key==='d'||e.key==='D') barco.vx=4;
		if(e.key===' '||e.key==='Spacebar') { e.preventDefault(); colocarBarrera(); }
	}
}

function keyup(e){
	if(e.key==='ArrowLeft'||e.key==='ArrowRight'||e.key==='a'||e.key==='A'||e.key==='d'||e.key==='D') barco.vx=0;
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
