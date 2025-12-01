function registerGame(){
// Huerto mágico (gestión ligera + tiempo)
const canvas=document.getElementById('gameCanvas'); const ctx=canvas.getContext('2d'); let af=null;
canvas.width=800; canvas.height=520;
const parcelasCols=6, parcelasRows=3; const size=80; const margin=16; const startY=90;
let semillas=['🍓','🥕','🌽','🥦','🍆'];
let campos=[]; for(let r=0;r<parcelasRows;r++){ for(let c=0;c<parcelasCols;c++){ campos.push({c,r,estado:'vacio',semilla:null,progreso:0,agua:0,plagas:0}); }}
let dinero=0, tiempo=180, started=false; let lastTick=0; let showInstructions=true; let ended=false; let mensajeRecord='';
// Zona del botón de ayuda en la cabecera (se dibuja como un círculo con '?')
const helpBtn = {x: canvas.width-42, y: 20, r: 14};
let highScore = Number(localStorage.getItem('huertoHighScore')||0);
let highName = localStorage.getItem('huertoHighName')||'-';
const playerName = localStorage.getItem('playerName')||'';
function plantar(campo){ if(campo.estado!=='vacio') return; campo.semilla=semillas[Math.floor(Math.random()*semillas.length)]; campo.estado='creciendo'; campo.progreso=0; campo.agua=5; campo.plagas=0; }
function regar(campo){ if(campo.estado==='creciendo') campo.agua=Math.min(10,campo.agua+3); }
function cosechar(c){ if(c.estado==='listo'){ dinero+=50; c.estado='vacio'; c.semilla=null; }}
function update(dt){
 if(!started) return;
 lastTick+=dt;
 if(lastTick>1000){
	lastTick=0; tiempo--;
	for (let c of campos){
		if(c.estado==='creciendo'){
			c.agua-=1;
			if(c.agua<=0){ c.estado='marchito'; }
			else {
				c.progreso += (c.agua>3? 8:4);
				if(Math.random()<0.08) c.plagas++;
				if(c.plagas>3) c.estado='plagas';
				if(c.progreso>=100){ c.estado='listo'; }
			}
		}
	}
	if(tiempo<=0){
		started=false; ended=true;
		if(dinero>highScore){
			highScore=dinero; highName=playerName||'-';
			localStorage.setItem('huertoHighScore', String(highScore));
			localStorage.setItem('huertoHighName', highName);
			mensajeRecord='¡Nuevo récord!';
		} else mensajeRecord='';
	}
 }
}
function drawParcel(c){
	const x=margin + c.c*(size+margin); const y=startY + c.r*(size+margin);
	ctx.save();
	// suelo y marco
	ctx.fillStyle='#6d4c41'; ctx.fillRect(x,y,size,size);
	// interior según estado
	if(c.estado==='vacio'){
		ctx.fillStyle='rgba(255,255,255,0.2)'; ctx.fillRect(x+4,y+4,size-8,size-8);
	} else if(c.estado==='creciendo'){
		ctx.fillStyle='#2e7d32'; ctx.fillRect(x+4,y+4,(size-8)*c.progreso/100,size-8);
		ctx.font='32px serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
		ctx.fillText(c.semilla,x+size/2,y+size/2);
	} else if(c.estado==='listo'){
		ctx.fillStyle='#ffeb3b'; ctx.fillRect(x+4,y+4,size-8,size-8);
		ctx.font='36px serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
		ctx.fillText(c.semilla,x+size/2,y+size/2);
	} else if(c.estado==='marchito'){
		ctx.fillStyle='#9e9e9e'; ctx.fillRect(x+4,y+4,size-8,size-8);
	} else if(c.estado==='plagas'){
		ctx.fillStyle='#a1887f'; ctx.fillRect(x+4,y+4,size-8,size-8);
		ctx.font='20px Arial'; ctx.fillStyle='#311b92'; ctx.textAlign='center'; ctx.textBaseline='middle';
		ctx.fillText('🐛',x+size/2,y+size/2);
	}
	// indicadores: agua (barra azul) y plagas (contador) cuando está creciendo
	if(c.estado==='creciendo'){
		const waterPct = Math.max(0, Math.min(1, c.agua/10));
		ctx.fillStyle='#1565c0';
		ctx.fillRect(x+6, y+size-10, (size-12)*waterPct, 6);
		ctx.strokeStyle='rgba(255,255,255,0.6)'; ctx.strokeRect(x+6, y+size-10, size-12, 6);
		if(c.plagas>0){ ctx.font='12px Arial'; ctx.fillStyle='#311b92'; ctx.textAlign='right'; ctx.textBaseline='top'; ctx.fillText('🐛x'+c.plagas, x+size-6, y+6); }
	}
	// borde
	ctx.strokeStyle='#3e2723'; ctx.lineWidth=3; ctx.strokeRect(x,y,size,size);
	ctx.restore();
}
function draw(){
 ctx.clearRect(0,0,canvas.width,canvas.height);
 if(window.GameUI) GameUI.softBg(ctx,canvas.width,canvas.height,['#e8f5e9','#f1f8e9']);
 // Cabecera degradada
 if(window.GameUI) GameUI.gradientBar(ctx,canvas.width,70,'#2e7d32','#43a047'); else { ctx.fillStyle='#2e7d32'; ctx.fillRect(0,0,canvas.width,70);} 
 ctx.save();
 ctx.font='bold 28px Arial'; ctx.fillStyle='#fff'; ctx.textAlign='center';
 ctx.fillText('Huerto mágico', canvas.width/2,44);
 ctx.font='14px Arial'; ctx.fillStyle='#e8f5e9';
 ctx.fillText('Dinero: '+dinero+'  Tiempo: '+tiempo+'s   Récord: '+highScore+' ('+highName+')', canvas.width/2,64);
  // botón ayuda
  ctx.textAlign='right';
  ctx.beginPath(); ctx.fillStyle='rgba(255,255,255,0.2)'; ctx.arc(helpBtn.x, helpBtn.y, helpBtn.r, 0, Math.PI*2); ctx.fill();
  ctx.strokeStyle='rgba(255,255,255,0.6)'; ctx.stroke();
  ctx.fillStyle='#fff'; ctx.font='16px Arial'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('?', helpBtn.x, helpBtn.y+1);
 ctx.restore();
 // Parcelas
 for(let c of campos) drawParcel(c);
 // Instrucciones ampliadas
 if(showInstructions){
   // Panel principal más grande y con mejor estructura
   const w=canvas.width-100, h=320, x=50, y=90;
   
   // Fondo verde para mejor legibilidad con texto negro
   if(window.GameUI){ 
     GameUI.glassPanel(ctx,x,y,w,h,18,'rgba(76,175,80,0.95)'); // Panel verde semi-transparente
   } else { 
     ctx.fillStyle='rgba(76,175,80,0.95)'; // Verde #4caf50 con alta opacidad
     ctx.fillRect(x,y,w,h);
     ctx.strokeStyle = 'rgba(255,255,255,0.5)';
     ctx.lineWidth = 2;
     ctx.strokeRect(x,y,w,h);
   } 
   
   ctx.save();
   // Título más destacado
   ctx.fillStyle='#003300'; 
   ctx.font='bold 24px Arial'; 
   ctx.textAlign='center';
   ctx.fillText('Cómo se juega', canvas.width/2, y+36);
   
   // Separar instrucciones y leyenda en dos columnas
   const leftX = x+50; 
   const baseY = y+90; 
   const lh=35; // Mayor espacio entre líneas
   
   // Texto de instrucciones en color negro para mejor contraste con fondo verde
   ctx.fillStyle='#000000'; 
   ctx.font='15px Arial'; 
   ctx.textAlign='left';
   
   const lines=[
     '1) Objetivo: consigue el máximo dinero en 180 segundos.',
     '2) Haz click en una parcela vacía para PLANTAR.',
     '3) Cuando está CRECIENDO, haz click para REGAR.',
     '   - La barra azul muestra el nivel de agua.',
     '   - Sin agua (0) la planta se MARCHITA.',
     '4) A veces salen PLAGAS (🐛) que arruinan la planta.',
     '5) Cuando está LISTA (amarilla), haz click para COSECHAR.',
     '6) Parcelas MARCHITAS o con PLAGAS: click para LIMPIAR.',
     '',
     'Consejo: alterna varias parcelas para maximizar producción.'
   ];
   
   lines.forEach((ln,i)=> ctx.fillText(ln, leftX, baseY + i*lh));
   
   // Leyenda visual más grande y separada
   const lx = x + w - 240, ly = y + 70;
   ctx.font='bold 16px Arial'; 
   ctx.fillStyle='#003300'; 
   ctx.fillText('Leyenda', lx, ly-14);
   
   // Mayor espacio entre elementos
   const itemHeight = 32;
   const spacing = 40;
   
   // Vacío
   ctx.fillStyle='#6d4c41'; ctx.fillRect(lx, ly, 26, 26); 
   ctx.fillStyle='rgba(255,255,255,0.25)'; ctx.fillRect(lx+3, ly+3, 20, 20); 
   ctx.strokeStyle='#3e2723'; ctx.strokeRect(lx, ly, 26, 26); 
   ctx.fillStyle='#000000'; ctx.fillText('Vacío', lx+36, ly+18);
   
   // Creciendo
   const ly2=ly+spacing; 
   ctx.fillStyle='#6d4c41'; ctx.fillRect(lx, ly2, 26, 26); 
   ctx.fillStyle='#2e7d32'; ctx.fillRect(lx+3, ly2+3, 14, 20); 
   ctx.fillStyle='#1565c0'; ctx.fillRect(lx+3, ly2+22, 16, 4); 
   ctx.strokeStyle='#3e2723'; ctx.strokeRect(lx, ly2, 26, 26); 
   ctx.fillStyle='#000000'; ctx.fillText('Creciendo', lx+36, ly2+18);
   
   // Lista
   const ly3=ly2+spacing; 
   ctx.fillStyle='#6d4c41'; ctx.fillRect(lx, ly3, 26, 26); 
   ctx.fillStyle='#ffeb3b'; ctx.fillRect(lx+3, ly3+3, 20, 20); 
   ctx.strokeStyle='#3e2723'; ctx.strokeRect(lx, ly3, 26, 26); 
   ctx.fillStyle='#000000'; ctx.fillText('Lista (+50)', lx+36, ly3+18);
   
   // Marchita
   const ly4=ly3+spacing; 
   ctx.fillStyle='#6d4c41'; ctx.fillRect(lx, ly4, 26, 26); 
   ctx.fillStyle='#9e9e9e'; ctx.fillRect(lx+3, ly4+3, 20, 20); 
   ctx.strokeStyle='#3e2723'; ctx.strokeRect(lx, ly4, 26, 26); 
   ctx.fillStyle='#000000'; ctx.fillText('Marchita', lx+36, ly4+18);
   
   // Plagas
   const ly5=ly4+spacing; 
   ctx.fillStyle='#6d4c41'; ctx.fillRect(lx, ly5, 26, 26); 
   ctx.fillStyle='#a1887f'; ctx.fillRect(lx+3, ly5+3, 20, 20); 
   ctx.fillStyle='#311b92'; ctx.font='16px Arial'; ctx.fillText('🐛', lx+13, ly5+20); 
   ctx.strokeStyle='#3e2723'; ctx.strokeRect(lx, ly5, 26, 26); 
   ctx.fillStyle='#000000'; ctx.font='15px Arial'; ctx.fillText('Plagas', lx+36, ly5+18);
   
   // Instrucción para cerrar
   ctx.fillStyle='#003300';
   ctx.font='16px Arial'; 
   ctx.textAlign='center';
   ctx.fillText('Pulsa "?" o la tecla I para ver esta ayuda. Click para jugar.', canvas.width/2, y+h-24);
   
   ctx.restore();
 }
 if(ended){ const w=canvas.width-140, h=150, x=70, y=140; if(window.GameUI){ GameUI.glassPanel(ctx,x,y,w,h,20);} else { ctx.fillStyle='rgba(0,0,0,0.75)'; ctx.fillRect(x,y,w,h);} ctx.save(); ctx.font='bold 22px Arial'; ctx.textAlign='center'; ctx.fillStyle='#2e7d32'; ctx.fillText('Tiempo agotado', canvas.width/2,y+34); ctx.fillStyle='#333'; ctx.font='18px Arial'; ctx.fillText('Dinero: '+dinero, canvas.width/2,y+64); if(mensajeRecord){ ctx.fillStyle='#ff8f00'; ctx.fillText(mensajeRecord, canvas.width/2,y+92);} ctx.fillStyle='#555'; ctx.font='14px Arial'; ctx.fillText('Click para reiniciar', canvas.width/2,y+118); ctx.restore(); }
}
function loop(t){ if(!loop.prev) loop.prev=t; const dt=t-loop.prev; loop.prev=t; update(dt); draw(); af=requestAnimationFrame(loop); }
function click(e){
 const rect=canvas.getBoundingClientRect(); const mx=e.clientX-rect.left, my=e.clientY-rect.top;
	// Click en botón ayuda
	const dx=mx-helpBtn.x, dy=my-helpBtn.y; if(Math.sqrt(dx*dx+dy*dy) <= helpBtn.r+2){ showInstructions=true; started=false; return; }
 if(showInstructions){ showInstructions=false; }
 if(!started){
	if(ended){ // reinicio completo
		ended=false; tiempo=180; dinero=0; campos.forEach(c=>{ c.estado='vacio'; c.semilla=null; c.progreso=0; c.agua=0; c.plagas=0; });
	}
	started=true; return;
 }
 const campo = campos.find(c=>{ const x=margin + c.c*(size+margin); const y=startY + c.r*(size+margin); return mx>x&&mx<x+size&&my>y&&my<y+size; });
 if(!campo) return;
 if(campo.estado==='vacio') plantar(campo);
 else if(campo.estado==='creciendo') regar(campo);
 else if(campo.estado==='listo') cosechar(campo);
 else if(campo.estado==='marchito'||campo.estado==='plagas'){ campo.estado='vacio'; campo.semilla=null; }
}
function key(e){ if(e.key.toLowerCase()==='i'){ showInstructions=true; started=false; } }
canvas.addEventListener('click',click); requestAnimationFrame(loop);
window.addEventListener('keydown',key);
return function cleanup(){ if(af) cancelAnimationFrame(af); canvas.removeEventListener('click',click); window.removeEventListener('keydown',key); };
}
window.registerGame=registerGame;