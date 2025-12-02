function registerGame(){
// Aire Limpio - Juego sobre contaminación urbana
const canvas=document.getElementById('gameCanvas'); const ctx=canvas.getContext('2d'); let af=null;
canvas.width=800; canvas.height=520;

let ciudad={
	coches:15,
	bicicletas:5,
	electricos:2,
	arboles:8,
	contaminacion:60
};

let vehiculos=[]; // coches circulando
let ciclistas=[]; // bicicletas
let dinero=100, satisfaccion=50;
let tiempo=120, lastTick=0;
let started=false, ended=false, showInstructions=true;
let mensajeRecord='';
let highScore = Number(localStorage.getItem('aireLimpioPuntos')||0);
let highName = localStorage.getItem('aireLimpioName')||'-';
const playerName = localStorage.getItem('playerName')||'';
const helpBtn = {x: canvas.width-42, y: 20, r: 14};

// Botones de la interfaz
let botones=[
	{x:50,y:420,w:150,h:40,texto:'-Coche +Bici',costo:30,accion:'menosCoche'},
	{x:220,y:420,w:150,h:40,texto:'+Electrico',costo:50,accion:'masElectrico'},
	{x:390,y:420,w:150,h:40,texto:'+Arbol',costo:20,accion:'masArbol'},
	{x:560,y:420,w:150,h:40,texto:'+Transporte',costo:40,accion:'masTransporte'}
];

// Inicializar vehículos
for(let i=0;i<ciudad.coches;i++){
	vehiculos.push({
		x:Math.random()*canvas.width,
		y:180+Math.floor(Math.random()*3)*40,
		vx:1+Math.random(),
		tipo:'coche',
		emoji:'🚗'
	});
}

for(let i=0;i<ciudad.bicicletas;i++){
	ciclistas.push({
		x:Math.random()*canvas.width,
		y:180+Math.floor(Math.random()*3)*40,
		vx:0.8+Math.random()*0.5,
		emoji:'🚴'
	});
}

for(let i=0;i<ciudad.electricos;i++){
	vehiculos.push({
		x:Math.random()*canvas.width,
		y:180+Math.floor(Math.random()*3)*40,
		vx:1.2+Math.random()*0.5,
		tipo:'electrico',
		emoji:'⚡'
	});
}

function ejecutarAccion(accion){
	if(accion==='menosCoche'){
		if(dinero>=30 && ciudad.coches>5){
			dinero-=30;
			ciudad.coches--;
			ciudad.bicicletas++;
			ciudad.contaminacion-=3;
			satisfaccion+=2;
			// Reemplazar un coche por bici
			let coche=vehiculos.find(v=>v.tipo==='coche');
			if(coche){
				vehiculos.splice(vehiculos.indexOf(coche),1);
				ciclistas.push({x:Math.random()*canvas.width,y:180+Math.floor(Math.random()*3)*40,vx:0.8,emoji:'🚴'});
			}
		}
	} else if(accion==='masElectrico'){
		if(dinero>=50){
			dinero-=50;
			ciudad.electricos++;
			ciudad.contaminacion-=2;
			satisfaccion+=3;
			vehiculos.push({x:0,y:180+Math.floor(Math.random()*3)*40,vx:1.3,tipo:'electrico',emoji:'⚡'});
		}
	} else if(accion==='masArbol'){
		if(dinero>=20){
			dinero-=20;
			ciudad.arboles++;
			ciudad.contaminacion-=1;
			satisfaccion+=1;
		}
	} else if(accion==='masTransporte'){
		if(dinero>=40 && ciudad.coches>3){
			dinero-=40;
			ciudad.coches-=2;
			ciudad.contaminacion-=4;
			satisfaccion+=4;
			// Quitar coches
			for(let i=0;i<2;i++){
				let coche=vehiculos.find(v=>v.tipo==='coche');
				if(coche) vehiculos.splice(vehiculos.indexOf(coche),1);
			}
		}
	}
}

function update(dt){
	if(!started) return;
	lastTick+=dt;
	
	if(lastTick>1000){
		lastTick=0;
		tiempo--;
		dinero+=5; // Ingresos pasivos
		
		// Actualizar contaminación
		let contBase=ciudad.coches*2 - ciudad.arboles*0.5 - ciudad.bicicletas*0.3 - ciudad.electricos*0.2;
		ciudad.contaminacion=Math.max(0,Math.min(100,ciudad.contaminacion+contBase*0.05-2));
		
		// Actualizar satisfacción
		if(ciudad.contaminacion<30) satisfaccion=Math.min(100,satisfaccion+1);
		else if(ciudad.contaminacion>70) satisfaccion=Math.max(0,satisfaccion-1);
		
		if(tiempo<=0){
			started=false; ended=true;
			let puntos=Math.floor(satisfaccion*2 + (100-ciudad.contaminacion)*1.5);
			
			if(puntos>highScore){
				highScore=puntos; highName=playerName||'-';
				localStorage.setItem('aireLimpioPuntos', String(highScore));
				localStorage.setItem('aireLimpioName', highName);
				mensajeRecord='¡Nuevo récord!';
			} else mensajeRecord='';
		}
	}
	
	// Mover vehículos
	for(let v of vehiculos){
		v.x+=v.vx;
		if(v.x>canvas.width) v.x=-30;
	}
	
	for(let c of ciclistas){
		c.x+=c.vx;
		if(c.x>canvas.width) c.x=-30;
	}
}

function draw(){
	// Fondo - cielo con smog
	const opacity=ciudad.contaminacion/100;
	const gradSky=ctx.createLinearGradient(0,0,0,150);
	gradSky.addColorStop(0,`rgba(135,135,135,${opacity})`);
	gradSky.addColorStop(1,`rgba(180,180,180,${opacity})`);
	ctx.fillStyle=gradSky;
	ctx.fillRect(0,0,canvas.width,150);
	
	// Cielo base
	ctx.fillStyle='#87ceeb';
	ctx.globalAlpha=1-opacity*0.7;
	ctx.fillRect(0,0,canvas.width,150);
	ctx.globalAlpha=1;
	
	// Ciudad (edificios simples)
	ctx.fillStyle='#546e7a';
	for(let i=0;i<10;i++){
		let h=80+Math.random()*70;
		ctx.fillRect(i*80,150-h+150,70,h);
	}
	
	if(showInstructions){
		ctx.fillStyle='rgba(0,0,0,0.7)';
		ctx.fillRect(50,80,canvas.width-100,300);
		ctx.fillStyle='#fff'; ctx.font='bold 22px Arial'; ctx.textAlign='center';
		ctx.fillText('🏙️ AIRE LIMPIO 💨',canvas.width/2,120);
		ctx.font='16px Arial'; ctx.textAlign='left';
		ctx.fillText('Gestión de contaminación urbana',80,160);
		ctx.fillText('',80,190);
		ctx.fillText('🎯 Objetivos:',80,220);
		ctx.fillText('  • Reduce el tráfico de coches y aumenta bicicletas',80,245);
		ctx.fillText('  • Invierte en vehículos eléctricos y transporte público',80,270);
		ctx.fillText('  • Planta árboles para limpiar el aire',80,295);
		ctx.fillText('  • Mantén alta la satisfacción ciudadana',80,320);
		ctx.fillText('',80,345);
		ctx.font='bold 18px Arial'; ctx.textAlign='center';
		ctx.fillStyle='#4caf50';
		ctx.fillText('Presiona ENTER para comenzar | Clic en botones',canvas.width/2,375);
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
		ctx.fillText('¡Gestión completada!',canvas.width/2,200);
		ctx.font='20px Arial';
		let puntos=Math.floor(satisfaccion*2 + (100-ciudad.contaminacion)*1.5);
		ctx.fillText('Contaminación final: '+Math.floor(ciudad.contaminacion)+'%',canvas.width/2,240);
		ctx.fillText('Satisfacción: '+Math.floor(satisfaccion)+'%',canvas.width/2,270);
		ctx.fillText('Puntuación: '+puntos,canvas.width/2,300);
		if(mensajeRecord){
			ctx.fillStyle='#ffeb3b';
			ctx.fillText(mensajeRecord,canvas.width/2,330);
		}
		ctx.fillStyle='#aaa'; ctx.font='16px Arial';
		ctx.fillText('Récord: '+highScore+' por '+highName,canvas.width/2,360);
		ctx.fillStyle='#4caf50'; ctx.font='bold 18px Arial';
		ctx.fillText('Presiona R para reintentar',canvas.width/2,390);
		ctx.textAlign='left';
		return;
	}
	
	// Carreteras
	ctx.fillStyle='#424242';
	ctx.fillRect(0,180,canvas.width,100);
	ctx.strokeStyle='#ffeb3b';
	ctx.lineWidth=2;
	ctx.setLineDash([10,10]);
	for(let i=0;i<3;i++){
		ctx.beginPath();
		ctx.moveTo(0,200+i*40);
		ctx.lineTo(canvas.width,200+i*40);
		ctx.stroke();
	}
	ctx.setLineDash([]);
	
	// Árboles
	ctx.font='25px Arial';
	for(let i=0;i<ciudad.arboles;i++){
		ctx.fillText('🌳',20+i*90,320);
	}
	
	// Vehículos
	ctx.font='25px Arial';
	for(let v of vehiculos){
		ctx.fillText(v.emoji==='⚡'?'🚗⚡':v.emoji,v.x,v.y);
	}
	
	for(let c of ciclistas){
		ctx.fillText(c.emoji,c.x,c.y);
	}
	
	// HUD superior
	ctx.fillStyle='rgba(0,0,0,0.6)';
	ctx.fillRect(0,0,canvas.width,60);
	ctx.fillStyle='#fff'; ctx.font='bold 14px Arial';
	ctx.fillText('💵 Dinero: $'+dinero,15,25);
	ctx.fillText('😊 Satisfacción: '+Math.floor(satisfaccion)+'%',200,25);
	
	// Barra de contaminación
	ctx.fillStyle='#fff';
	ctx.fillText('☁️ Contaminación:',450,25);
	ctx.fillStyle='#333';
	ctx.fillRect(600,12,180,18);
	const contColor=ciudad.contaminacion>70?'#f44336':ciudad.contaminacion>40?'#ff9800':'#4caf50';
	ctx.fillStyle=contColor;
	ctx.fillRect(600,12,ciudad.contaminacion*1.8,18);
	ctx.fillStyle='#fff'; ctx.font='bold 12px Arial';
	ctx.fillText(Math.floor(ciudad.contaminacion)+'%',660,25);
	
	// Tiempo
	ctx.fillStyle='#fff'; ctx.font='bold 14px Arial';
	ctx.fillText('⏱️ '+tiempo+'s',15,50);
	
	// Stats
	ctx.fillText('🚗:'+ciudad.coches+' 🚴:'+ciudad.bicicletas+' ⚡:'+ciudad.electricos+' 🌳:'+ciudad.arboles,200,50);
	
	// Botón ayuda
	ctx.fillStyle='#1976d2'; ctx.beginPath(); ctx.arc(helpBtn.x,helpBtn.y,helpBtn.r,0,Math.PI*2); ctx.fill();
	ctx.fillStyle='#fff'; ctx.font='bold 18px Arial'; ctx.textAlign='center'; ctx.fillText('?',helpBtn.x,helpBtn.y+6);
	ctx.textAlign='left';
	
	// Panel de acciones
	ctx.fillStyle='rgba(0,0,0,0.5)';
	ctx.fillRect(0,400,canvas.width,120);
	ctx.fillStyle='#fff'; ctx.font='bold 16px Arial';
	ctx.fillText('💡 Acciones disponibles:',15,390);
	
	// Botones
	for(let b of botones){
		ctx.fillStyle=dinero>=b.costo?'#2196f3':'#666';
		ctx.fillRect(b.x,b.y,b.w,b.h);
		ctx.strokeStyle='#fff';
		ctx.lineWidth=2;
		ctx.strokeRect(b.x,b.y,b.w,b.h);
		ctx.fillStyle='#fff'; ctx.font='bold 14px Arial'; ctx.textAlign='center';
		ctx.fillText(b.texto,b.x+b.w/2,b.y+20);
		ctx.font='12px Arial';
		ctx.fillText('$'+b.costo,b.x+b.w/2,b.y+35);
	}
	ctx.textAlign='left';
	
	// Mensaje educativo
	if(tiempo>100){
		ctx.fillStyle='rgba(0,0,0,0.7)';
		ctx.fillRect(100,340,canvas.width-200,40);
		ctx.fillStyle='#ffeb3b'; ctx.font='13px Arial'; ctx.textAlign='center';
		ctx.fillText('La contaminación urbana causa 7 millones de muertes al año según la OMS',canvas.width/2,365);
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
	
	// Botones de acción
	for(let b of botones){
		if(x>b.x && x<b.x+b.w && y>b.y && y<b.y+b.h){
			ejecutarAccion(b.accion);
			break;
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
