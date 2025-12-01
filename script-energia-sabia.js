function registerGame(){
// Energía Sabia - Juego sobre energías renovables vs no renovables
const canvas=document.getElementById('gameCanvas'); const ctx=canvas.getContext('2d'); let af=null;
canvas.width=800; canvas.height=520;

let centrales=[]; // centrales energéticas
let demanda=50, energia=0, dinero=200;
let contaminacion=0, satisfaccion=70;
let tiempo=150, lastTick=0;
let started=false, ended=false, showInstructions=true;
let mensajeRecord='';
let highScore = Number(localStorage.getItem('energiaSabiaPuntos')||0);
let highName = localStorage.getItem('energiaSabiaName')||'-';
const playerName = localStorage.getItem('playerName')||'';
const helpBtn = {x: canvas.width-42, y: 20, r: 14};

// Tipos de energía
const tiposEnergia=[
	{nombre:'☀️ Solar',costo:80,produccion:15,contaminacion:0,riesgo:0},
	{nombre:'💨 Eólica',costo:90,produccion:18,contaminacion:0,riesgo:0},
	{nombre:'🌊 Hidráulica',costo:120,produccion:25,contaminacion:2,riesgo:1},
	{nombre:'⚛️ Nuclear',costo:200,produccion:50,contaminacion:5,riesgo:15},
	{nombre:'🏭 Carbón',costo:50,produccion:30,contaminacion:25,riesgo:5},
	{nombre:'⛽ Gas',costo:60,produccion:22,contaminacion:15,riesgo:3}
];

// Posiciones predefinidas para centrales (grid)
const posiciones=[
	{x:100,y:180},{x:250,y:180},{x:400,y:180},{x:550,y:180},{x:700,y:180},
	{x:100,y:300},{x:250,y:300},{x:400,y:300},{x:550,y:300},{x:700,y:300}
];

let seleccion=null; // tipo seleccionado para construir

function construirCentral(tipo){
	if(dinero<tipo.costo) return;
	if(centrales.length>=10) return;
	
	dinero-=tipo.costo;
	let pos=posiciones[centrales.length];
	centrales.push({
		x:pos.x,
		y:pos.y,
		tipo:tipo,
		vida:100,
		incidente:false
	});
	seleccion=null;
}

function update(dt){
	if(!started) return;
	lastTick+=dt;
	
	if(lastTick>1000){
		lastTick=0;
		tiempo--;
		
		// Calcular producción total
		energia=0;
		contaminacion=0;
		for(let c of centrales){
			energia+=c.tipo.produccion;
			contaminacion+=c.tipo.contaminacion;
			
			// Posibilidad de incidente
			if(c.tipo.riesgo>0 && Math.random()<c.tipo.riesgo/1000){
				c.incidente=true;
				satisfaccion-=10;
				contaminacion+=20;
			}
		}
		
		// Actualizar demanda
		demanda=50+Math.floor(tiempo/10)*5+Math.random()*10;
		
		// Calcular satisfacción
		if(energia>=demanda){
			satisfaccion=Math.min(100,satisfaccion+2);
			dinero+=20; // Ingresos
		} else {
			satisfaccion=Math.max(0,satisfaccion-3);
		}
		
		// Penalización por contaminación
		if(contaminacion>50){
			satisfaccion=Math.max(0,satisfaccion-2);
		}
		
		if(tiempo<=0){
			started=false; ended=true;
			// Calcular puntuación
			let renovables=centrales.filter(c=>c.tipo.contaminacion===0).length;
			let puntos=Math.floor(satisfaccion*3 + renovables*50 - contaminacion*2);
			
			if(puntos>highScore){
				highScore=puntos; highName=playerName||'-';
				localStorage.setItem('energiaSabiaPuntos', String(highScore));
				localStorage.setItem('energiaSabiaName', highName);
				mensajeRecord='¡Nuevo récord!';
			} else mensajeRecord='';
		}
	}
}

function draw(){
	// Fondo - cielo
	const gradSky=ctx.createLinearGradient(0,0,0,canvas.height);
	gradSky.addColorStop(0,'#87ceeb');
	gradSky.addColorStop(1,'#e0f2ff');
	ctx.fillStyle=gradSky;
	ctx.fillRect(0,0,canvas.width,canvas.height);
	
	// Suelo
	ctx.fillStyle='#8bc34a';
	ctx.fillRect(0,400,canvas.width,canvas.height-400);
	
	if(showInstructions){
		ctx.fillStyle='rgba(0,0,0,0.7)';
		ctx.fillRect(50,60,canvas.width-100,360);
		ctx.fillStyle='#fff'; ctx.font='bold 22px Arial'; ctx.textAlign='center';
		ctx.fillText('⚡ ENERGÍA SABIA 🌍',canvas.width/2,100);
		ctx.font='16px Arial'; ctx.textAlign='left';
		ctx.fillText('Gestión de fuentes de energía sostenible',80,140);
		ctx.fillText('',80,170);
		ctx.fillText('🎯 Objetivos:',80,200);
		ctx.fillText('  • Construye centrales para satisfacer la demanda energética',80,225);
		ctx.fillText('  • Prioriza energías renovables (solar, eólica)',80,250);
		ctx.fillText('  • Evita energías con alto riesgo de accidentes',80,275);
		ctx.fillText('  • Minimiza la contaminación',80,300);
		ctx.fillText('',80,325);
		ctx.fillText('🎮 Controles: Clic en tipos de energía y luego en posiciones',80,355);
		ctx.font='bold 18px Arial'; ctx.textAlign='center';
		ctx.fillStyle='#4caf50';
		ctx.fillText('Presiona ENTER para comenzar',canvas.width/2,395);
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
		ctx.fillText('¡Gestión finalizada!',canvas.width/2,180);
		ctx.font='20px Arial';
		let renovables=centrales.filter(c=>c.tipo.contaminacion===0).length;
		let puntos=Math.floor(satisfaccion*3 + renovables*50 - contaminacion*2);
		ctx.fillText('Centrales renovables: '+renovables+'/'+centrales.length,canvas.width/2,220);
		ctx.fillText('Satisfacción final: '+Math.floor(satisfaccion)+'%',canvas.width/2,250);
		ctx.fillText('Contaminación: '+Math.floor(contaminacion),canvas.width/2,280);
		ctx.fillText('Puntuación: '+puntos,canvas.width/2,310);
		if(mensajeRecord){
			ctx.fillStyle='#ffeb3b';
			ctx.fillText(mensajeRecord,canvas.width/2,340);
		}
		ctx.fillStyle='#aaa'; ctx.font='16px Arial';
		ctx.fillText('Récord: '+highScore+' por '+highName,canvas.width/2,370);
		ctx.fillStyle='#4caf50'; ctx.font='bold 18px Arial';
		ctx.fillText('Presiona R para reintentar',canvas.width/2,400);
		ctx.textAlign='left';
		return;
	}
	
	// HUD superior
	ctx.fillStyle='rgba(0,0,0,0.6)';
	ctx.fillRect(0,0,canvas.width,80);
	ctx.fillStyle='#fff'; ctx.font='bold 14px Arial';
	ctx.fillText('💵 Dinero: $'+dinero,15,20);
	ctx.fillText('⚡ Producción: '+Math.floor(energia),15,40);
	ctx.fillText('📊 Demanda: '+Math.floor(demanda),15,60);
	
	ctx.fillText('😊 Satisfacción: '+Math.floor(satisfaccion)+'%',250,20);
	ctx.fillText('☁️ Contaminación: '+Math.floor(contaminacion),250,40);
	ctx.fillText('⏱️ Tiempo: '+tiempo+'s',250,60);
	
	// Indicador de energía suficiente
	if(energia>=demanda){
		ctx.fillStyle='#4caf50';
		ctx.fillText('✓ Energía suficiente',500,40);
	} else {
		ctx.fillStyle='#f44336';
		ctx.fillText('✗ Falta energía',500,40);
	}
	
	// Botón ayuda
	ctx.fillStyle='#1976d2'; ctx.beginPath(); ctx.arc(helpBtn.x,helpBtn.y,helpBtn.r,0,Math.PI*2); ctx.fill();
	ctx.fillStyle='#fff'; ctx.font='bold 18px Arial'; ctx.textAlign='center'; ctx.fillText('?',helpBtn.x,helpBtn.y+6);
	ctx.textAlign='left';
	
	// Panel de construcción
	ctx.fillStyle='rgba(0,0,0,0.5)';
	ctx.fillRect(0,90,canvas.width,60);
	ctx.fillStyle='#fff'; ctx.font='bold 14px Arial';
	ctx.fillText('🔧 Selecciona tipo de central:',15,110);
	
	// Botones de tipos de energía
	for(let i=0;i<tiposEnergia.length;i++){
		let t=tiposEnergia[i];
		let x=15+i*130;
		let y=120;
		
		ctx.fillStyle=seleccion===t?'#4caf50':(dinero>=t.costo?'#2196f3':'#666');
		ctx.fillRect(x,y,120,25);
		ctx.strokeStyle='#fff';
		ctx.lineWidth=1;
		ctx.strokeRect(x,y,120,25);
		
		ctx.fillStyle='#fff'; ctx.font='11px Arial'; ctx.textAlign='center';
		ctx.fillText(t.nombre+' $'+t.costo,x+60,y+17);
	}
	ctx.textAlign='left';
	
	// Centrales construidas
	for(let c of centrales){
		if(c.incidente){
			ctx.fillStyle='#ff0000';
			ctx.font='40px Arial';
			ctx.fillText('💥',c.x-15,c.y+20);
		} else {
			ctx.fillStyle=c.tipo.contaminacion===0?'#4caf50':'#f57c00';
			ctx.fillRect(c.x-20,c.y-20,40,50);
			ctx.fillStyle='#fff'; ctx.font='25px Arial'; ctx.textAlign='center';
			ctx.fillText(c.tipo.nombre.split(' ')[0],c.x,c.y+10);
		}
	}
	ctx.textAlign='left';
	
	// Posiciones disponibles
	if(seleccion && centrales.length<10){
		let pos=posiciones[centrales.length];
		ctx.strokeStyle='#4caf50';
		ctx.lineWidth=3;
		ctx.setLineDash([5,5]);
		ctx.strokeRect(pos.x-20,pos.y-20,40,50);
		ctx.setLineDash([]);
		ctx.fillStyle='#4caf50'; ctx.font='12px Arial'; ctx.textAlign='center';
		ctx.fillText('Clic aquí',pos.x,pos.y-30);
	}
	ctx.textAlign='left';
	
	// Mensaje educativo
	if(tiempo>130){
		ctx.fillStyle='rgba(0,0,0,0.7)';
		ctx.fillRect(50,430,canvas.width-100,50);
		ctx.fillStyle='#ffeb3b'; ctx.font='13px Arial'; ctx.textAlign='center';
		ctx.fillText('Las energías renovables son el futuro: limpias, seguras y sostenibles',canvas.width/2,455);
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
	}
}

function click(e){
	const rect=canvas.getBoundingClientRect();
	const x=e.clientX-rect.left, y=e.clientY-rect.top;
	
	// Botón ayuda
	const dx=x-helpBtn.x, dy=y-helpBtn.y;
	if(dx*dx+dy*dy<helpBtn.r*helpBtn.r){ 
		showInstructions=!showInstructions;
		return;
	}
	
	if(!started || ended) return;
	
	// Seleccionar tipo de energía
	for(let i=0;i<tiposEnergia.length;i++){
		let bx=15+i*130, by=120;
		if(x>bx && x<bx+120 && y>by && y<by+25){
			if(dinero>=tiposEnergia[i].costo){
				seleccion=tiposEnergia[i];
			}
			return;
		}
	}
	
	// Construir central en posición
	if(seleccion && centrales.length<10){
		let pos=posiciones[centrales.length];
		if(Math.abs(x-pos.x)<30 && Math.abs(y-pos.y)<40){
			construirCentral(seleccion);
		}
	}
}

canvas.addEventListener('keydown',keydown);
canvas.addEventListener('click',click);
canvas.focus();

return ()=>{
	if(af) cancelAnimationFrame(af);
	canvas.removeEventListener('keydown',keydown);
	canvas.removeEventListener('click',click);
};
}
