function registerGame(){
// Juego de Memoria de Animales
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let af=null;
const cols = 4, rows = 3; // 12 cartas -> 6 parejas
const total = cols*rows;
const animales = ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼'];
let pool = [];
for (let i=0;i<total/2;i++){ let a = animales[i%animales.length]; pool.push(a,a); }
// barajar
pool.sort(()=>Math.random()-0.5);
let cards = pool.map((icon,i)=>({icon,x:(i%cols),y:Math.floor(i/cols),open:false,found:false}));
let first=null, second=null;
let lock=false; let aciertos=0; let intentos=0; let mostrarInicio=true;
let bestIntentos = Number(localStorage.getItem('memoriaBest')||0);
const cardW = 100, cardH=120, margin=20;
canvas.width = cols*cardW + (cols+1)*margin; canvas.height = rows*cardH + (rows+1)*margin + 80;
function drawCard(c){
 const px = margin + c.x*(cardW+margin);
 const py = margin + c.y*(cardH+margin) + 60;
 ctx.save();
 ctx.roundRect(px,py,cardW,cardH,14);
 ctx.fillStyle = c.found? '#a5d6a7' : (c.open? '#fff' : '#90caf9');
 ctx.fill();
 ctx.strokeStyle = '#1565c0'; ctx.lineWidth=3; ctx.stroke();
 if (c.open||c.found){ ctx.font='48px serif'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillStyle='#333'; ctx.fillText(c.icon, px+cardW/2, py+cardH/2); }
 ctx.restore();
}
CanvasRenderingContext2D.prototype.roundRect=function(x,y,w,h,r){ this.beginPath(); this.moveTo(x+r,y); this.lineTo(x+w-r,y); this.quadraticCurveTo(x+w,y,x+w,y+r); this.lineTo(x+w,y+h-r); this.quadraticCurveTo(x+w,y+h,x+w-r,y+h); this.lineTo(x+r,y+h); this.quadraticCurveTo(x,y+h,x,y+h-r); this.lineTo(x,y+r); this.quadraticCurveTo(x,y,x+r,y); this.closePath(); }
function drawHUD(){
 ctx.save();
 ctx.clearRect(0,0,canvas.width,canvas.height);
 if(window.GameUI){ GameUI.gradientBar(ctx, canvas.width, 64); }
 ctx.font='bold 28px Arial'; ctx.textAlign='center';
 if(window.GameUI){ GameUI.shadowedText(ctx,'Memoria de Animales', canvas.width/2,42,'#fff'); }
 else { ctx.fillStyle='#e91e63'; ctx.fillText('Memoria de Animales', canvas.width/2,42); }
 ctx.font='16px Arial'; ctx.fillStyle=window.GameUI? '#fce4ec':'#333';
 ctx.fillText('Aciertos: '+aciertos+' / '+(total/2)+'  Intentos: '+intentos + '  Mejor: ' + (bestIntentos>0?bestIntentos:'-'), canvas.width/2, 62);
 ctx.restore();
}
function draw(){
 drawHUD();
 for (let c of cards) drawCard(c);
 
 // Mostrar instrucciones DESPUÉS de las cartas para que aparezcan encima
 if (mostrarInicio){
   ctx.save();
   // Panel de instrucciones con fondo semi-transparente
   if(window.GameUI){ 
     GameUI.glassPanel(ctx,40,canvas.height-90,canvas.width-80,60,18);
     ctx.fillStyle='#0d47a1';
   } else {
     ctx.fillStyle='rgba(0,0,0,0.7)';
     ctx.fillRect(40,canvas.height-90,canvas.width-80,60);
     ctx.fillStyle='#fff';
   }
   ctx.font='18px Arial';
   ctx.textAlign='center';
   ctx.fillText('Haz clic para voltear cartas y encontrar parejas.', canvas.width/2, canvas.height-50);
   ctx.restore();
 }
 
 if (aciertos===total/2){
  if(bestIntentos===0 || intentos<bestIntentos){ bestIntentos=intentos; localStorage.setItem('memoriaBest', String(bestIntentos)); }
  ctx.save();
  if(window.GameUI){ GameUI.glassPanel(ctx,30,canvas.height/2-90,canvas.width-60,170,26); }
  else { ctx.globalAlpha=0.9; ctx.fillStyle='#fff'; ctx.fillRect(30,canvas.height/2-60,canvas.width-60,120); ctx.globalAlpha=1; }
  ctx.font='bold 28px Arial'; ctx.fillStyle='#2e7d32'; ctx.textAlign='center';
  ctx.fillText('¡Completado! Intentos: '+intentos, canvas.width/2, canvas.height/2-10);
  if(intentos===bestIntentos){ ctx.fillStyle='#d32f2f'; ctx.font='20px Arial'; ctx.fillText('Nuevo récord', canvas.width/2, canvas.height/2+30); }
  ctx.restore();
 }
}
function loop(){ draw(); af=requestAnimationFrame(loop); }
function pick(mx,my){ if(lock) return; const c = cards.find(card=>{ const px=margin+card.x*(cardW+margin); const py=margin+card.y*(cardH+margin)+60; return mx>px&&mx<px+cardW&&my>py&&my<py+cardH; }); if(!c||c.open||c.found) return; c.open=true; if(!first){ first=c; } else if(!second){ second=c; lock=true; intentos++; if(first.icon===second.icon){ first.found=second.found=true; lock=false; first=second=null; aciertos++; } else { setTimeout(()=>{ first.open=false; second.open=false; first=second=null; lock=false; },800); } }
}
function click(e){
    const rect = canvas.getBoundingClientRect();
    // Ajustar por escalado real del canvas
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;
    pick(mx, my);
    mostrarInicio = false;
}
canvas.addEventListener('click',click);
loop();
return function cleanup(){ if(af) cancelAnimationFrame(af); canvas.removeEventListener('click',click); };
}
window.registerGame=registerGame;
