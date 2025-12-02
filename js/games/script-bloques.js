function registerGame(){
// Bloques mágicos (mini Tetris simplificado con récord)
const canvas=document.getElementById('gameCanvas'); const ctx=canvas.getContext('2d'); let af=null;
const COLS=12, ROWS=22, SIZE=28; // ampliar tablero
const PANEL_W = 170;
canvas.width=COLS*SIZE + PANEL_W;
canvas.height=ROWS*SIZE + 70;
const playerName=localStorage.getItem('playerName')||'';
let highName=localStorage.getItem('bloquesHighName')||'-';
const shapes={
 I:[[1,1,1,1]],
 O:[[1,1],[1,1]],
 T:[[1,1,1],[0,1,0]],
 L:[[1,1,1],[1,0,0]],
 J:[[1,1,1],[0,0,1]],
 S:[[0,1,1],[1,1,0]],
 Z:[[1,1,0],[0,1,1]]
};
const colors=['#e91e63','#ff9800','#4caf50','#2196f3','#9c27b0','#00bcd4','#ffc107'];
let grid = Array.from({length:ROWS},()=>Array(COLS).fill(0));
let current=null; let x=3,y=0; let score=0; let level=1; let dropInterval=700; let lastDrop=0; let gameOver=false; let high=Number(localStorage.getItem('bloquesHigh')||0);
function newPiece(){ const keys=Object.keys(shapes); const k=keys[Math.floor(Math.random()*keys.length)]; current=shapes[k].map(r=>r.slice()); x= Math.floor((COLS-current[0].length)/2); y=0; if(collide(0,0,current)){ gameOver=true; if(score>high){ high=score; highName=playerName||'-'; localStorage.setItem('bloquesHigh', String(high)); localStorage.setItem('bloquesHighName', highName); }}}
function rotate(mat){ const h=mat.length,w=mat[0].length; const res=Array.from({length:w},()=>Array(h).fill(0)); for(let r=0;r<h;r++) for(let c=0;c<w;c++) res[c][h-1-r]=mat[r][c]; return res; }
function collide(dx,dy,shape){ for(let r=0;r<shape.length;r++) for(let c=0;c<shape[0].length;c++){ if(shape[r][c]){ const nx=x+c+dx, ny=y+r+dy; if(nx<0||nx>=COLS||ny>=ROWS|| (ny>=0 && grid[ny][nx])) return true; }} return false; }
function merge(){ for(let r=0;r<current.length;r++) for(let c=0;c<current[0].length;c++) if(current[r][c]) grid[y+r][x+c]=colors.indexOf(color)+1; }
function clearLines(){ let cleared=0; for(let r=ROWS-1;r>=0;r--){ if(grid[r].every(v=>v)){ grid.splice(r,1); grid.unshift(Array(COLS).fill(0)); cleared++; r++; }} if(cleared){ score += [0,40,100,300,800][cleared]; level = 1+ Math.floor(score/400); dropInterval=Math.max(120,700 - (level-1)*60); }
}
let color = colors[Math.floor(Math.random()*colors.length)];
function spawn(){ color = colors[Math.floor(Math.random()*colors.length)]; newPiece(); }
function update(t){ if(gameOver) return; if(!lastDrop) lastDrop=t; const delta=t-lastDrop; if(delta>dropInterval){ if(!collide(0,1,current)) y++; else { merge(); clearLines(); spawn(); } lastDrop=t; }
}
function draw(){
 ctx.clearRect(0,0,canvas.width,canvas.height);
 if(window.GameUI) GameUI.softBg(ctx,canvas.width,canvas.height,['#0d0d12','#1e1e29']); else { ctx.fillStyle='#111'; ctx.fillRect(0,0,canvas.width,canvas.height);} 
 if(window.GameUI){ GameUI.gradientBar(ctx, canvas.width, 60, '#0d47a1','#1976d2'); } else { ctx.fillStyle='#0d47a1'; ctx.fillRect(0,0,canvas.width,60);} 
 ctx.fillStyle='#fff'; ctx.font='20px Arial'; ctx.textAlign='left'; ctx.fillText('Bloques mágicos', 12,38);
 ctx.font='14px Arial'; ctx.textAlign='right'; ctx.fillText('Puntos: '+score+'  Nivel: '+level, canvas.width- (PANEL_W+12), 22); ctx.fillText('Récord: '+high+' ('+highName+')', canvas.width- (PANEL_W+12), 44);
 const panelX=COLS*SIZE, panelY=60;
 if(window.GameUI){ GameUI.glassPanel(ctx, panelX+8, panelY+12, PANEL_W-16, canvas.height-panelY-24,16); }
 ctx.save(); ctx.translate(panelX+16, panelY+32); ctx.fillStyle='#fff'; ctx.font='15px Arial'; ctx.textAlign='left'; ctx.fillText('Controles',0,0); ctx.font='13px Arial'; ['← → mover','↑ rotar','↓ bajar','Espacio: drop'].forEach((l,i)=>ctx.fillText(l,0,20+18*i)); ctx.restore();
 ctx.save(); ctx.translate(0,60);
 ctx.fillStyle='rgba(255,255,255,0.04)'; ctx.fillRect(0,0,COLS*SIZE,ROWS*SIZE);
 for(let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++){ if(grid[r][c]){ const col=colors[(grid[r][c]-1)%colors.length]; const g=ctx.createLinearGradient(c*SIZE,r*SIZE,(c+1)*SIZE,(r+1)*SIZE); g.addColorStop(0,col); g.addColorStop(1,'#000'); ctx.fillStyle=g; ctx.fillRect(c*SIZE,r*SIZE,SIZE,SIZE); ctx.strokeStyle='rgba(255,255,255,0.15)'; ctx.strokeRect(c*SIZE,r*SIZE,SIZE,SIZE); }}
 if(current){ for(let r=0;r<current.length;r++) for(let c=0;c<current[0].length;c++) if(current[r][c]){ const g=ctx.createLinearGradient((x+c)*SIZE,(y+r)*SIZE,(x+c+1)*SIZE,(y+r+1)*SIZE); g.addColorStop(0,color); g.addColorStop(1,'#000'); ctx.fillStyle=g; ctx.fillRect((x+c)*SIZE,(y+r)*SIZE,SIZE,SIZE); ctx.strokeStyle='rgba(255,255,255,0.2)'; ctx.strokeRect((x+c)*SIZE,(y+r)*SIZE,SIZE,SIZE); }}
 if(gameOver){ ctx.fillStyle='rgba(0,0,0,0.65)'; ctx.fillRect(0,0,COLS*SIZE,ROWS*SIZE); ctx.fillStyle='#ffeb3b'; ctx.font='24px Arial'; ctx.textAlign='center'; ctx.fillText('GAME OVER', (COLS*SIZE)/2, 120); ctx.font='16px Arial'; ctx.fillStyle='#fff'; ctx.fillText('Pulsa R para reiniciar', (COLS*SIZE)/2, 150);} 
 ctx.restore();
}
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

function loop(t) {
    update(t);
    draw();
    setTimeout(() => {
        af = requestAnimationFrame(loop);
    }, 1000 / (60 * gameSpeed)); // Ajusta la velocidad del juego
}
function key(e){ if(gameOver && e.key.toLowerCase()==='r'){ grid=Array.from({length:ROWS},()=>Array(COLS).fill(0)); score=0; level=1; dropInterval=700; gameOver=false; newPiece(); return; }
 if(e.key==='ArrowLeft'&&!collide(-1,0,current)) x--; else if(e.key==='ArrowRight'&&!collide(1,0,current)) x++; else if(e.key==='ArrowDown'){ if(!collide(0,1,current)) y++; } else if(e.key==='ArrowUp'){ const rot=rotate(current); if(!collide(0,0,rot)) current=rot; } else if(e.key===' '){ while(!collide(0,1,current)) y++; merge(); clearLines(); spawn(); }
}
window.addEventListener('keydown',key); spawn(); requestAnimationFrame(loop);
return function cleanup(){ if(af) cancelAnimationFrame(af); window.removeEventListener('keydown',key); };
}
window.registerGame=registerGame;
