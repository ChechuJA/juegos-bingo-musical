function registerGame(){
// Serpiente clásica con récord de longitud
const canvas=document.getElementById('gameCanvas'); const ctx=canvas.getContext('2d'); let af=null;
const SIZE=20, COLS=30, ROWS=20; canvas.width=COLS*SIZE; canvas.height=ROWS*SIZE+70;
let dir={x:1,y:0}; let snake=[{x:5,y:10},{x:4,y:10},{x:3,y:10}]; let food=spawn(); let score=0; let speed=160; let last=0; let gameOver=false; let high=Number(localStorage.getItem('snakeHigh')||0); let highName=localStorage.getItem('snakeHighName')||'-'; const playerName=localStorage.getItem('playerName')||'';

// Background image loading
const backgroundImage = new Image();
backgroundImage.src = 'assets/serpiente-background.png';
backgroundImage.onerror = () => { backgroundImage.src = 'assets/serpiente-background.svg'; };

function backgroundReady() {
  return backgroundImage && backgroundImage.complete && backgroundImage.naturalWidth > 0;
}

function spawn(){ return {x:Math.floor(Math.random()*COLS),y:Math.floor(Math.random()*ROWS)}; }
function update(t){ if(gameOver) return; if(!last) last=t; const d=t-last; if(d>speed){ last=t; const head={x:snake[0].x+dir.x,y:snake[0].y+dir.y}; if(head.x<0||head.x>=COLS||head.y<0||head.y>=ROWS|| snake.some(s=>s.x===head.x&&s.y===head.y)){ gameOver=true; if(score>high){ high=score; localStorage.setItem('snakeHigh', String(high)); } return;} snake.unshift(head); if(head.x===food.x&&head.y===food.y){ score+=10; speed=Math.max(60, speed-4); food=spawn(); } else snake.pop(); }
}
function draw(){ 
  ctx.clearRect(0,0,canvas.width,canvas.height); 
  
  // Draw background image if available
  if (backgroundReady()) {
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
    // Add slight overlay to make game elements more visible
    ctx.save();
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = '#e8f5e9';
    ctx.fillRect(0, 60, canvas.width, canvas.height - 60);
    ctx.restore();
  } else if(window.GameUI) {
    GameUI.softBg(ctx,canvas.width,canvas.height,['#e8f5e9','#c8e6c9']);
  } else {
    ctx.fillStyle = '#e8f5e9';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  
  // Top bar
  if(window.GameUI){ 
    GameUI.gradientBar(ctx,canvas.width,60,'#1b5e20','#2e7d32'); 
  } else { 
    ctx.fillStyle='#1b5e20'; 
    ctx.fillRect(0,0,canvas.width,60);
  } 
  
  ctx.fillStyle='#fff'; 
  ctx.font='20px Arial'; 
  ctx.fillText('Serpiente', 10,38); 
  ctx.font='14px Arial'; 
  ctx.fillText('Puntos: '+score, 160,24); 
  ctx.fillText('Récord: '+high+' ('+highName+')', 160,44); 

    // Dibujar un camino ligeramente visible detrás de la serpiente
    ctx.fillStyle = 'rgba(76, 175, 80, 0.15)';
    for (let i = snake.length-1; i > 0; i--) {
        const seg = snake[i];
        ctx.fillRect(seg.x*SIZE, seg.y*SIZE+60, SIZE, SIZE);
    }

    // Dibujar la serpiente con un aspecto más de gusano
    for(let i=0;i<snake.length;i++){ 
        const seg=snake[i];
        const gx=seg.x*SIZE, gy=seg.y*SIZE+60;
        
        // Determinar dirección para saber cómo dibujar cada segmento
        let prevSeg = snake[i+1] || null;
        let nextSeg = snake[i-1] || null;
        
        // Cabeza de la serpiente
        if(i===0){ 
            // Crear un gradiente radial para un efecto más redondo
            const gradient = ctx.createRadialGradient(
                gx + SIZE/2, gy + SIZE/2, 2,
                gx + SIZE/2, gy + SIZE/2, SIZE/1.2
            );
            gradient.addColorStop(0, '#ffff00');
            gradient.addColorStop(1, '#ff9800');
            ctx.fillStyle = gradient;
            
            // Dibujar cabeza redonda
            ctx.beginPath();
            ctx.arc(gx + SIZE/2, gy + SIZE/2, SIZE/1.8, 0, Math.PI*2);
            ctx.fill();
            
            // Ojos
            ctx.fillStyle = '#000';
            
            // Determinar posición de los ojos según dirección
            let eyeX1 = gx + SIZE/2, eyeY1 = gy + SIZE/2;
            let eyeX2 = gx + SIZE/2, eyeY2 = gy + SIZE/2;
            
            // Ajustar posición de ojos según dirección
            if (nextSeg) {
                if (nextSeg.x > seg.x) { // Moviéndose a la derecha
                    eyeX1 = gx + SIZE*0.7; eyeY1 = gy + SIZE*0.35;
                    eyeX2 = gx + SIZE*0.7; eyeY2 = gy + SIZE*0.65;
                } else if (nextSeg.x < seg.x) { // Moviéndose a la izquierda
                    eyeX1 = gx + SIZE*0.3; eyeY1 = gy + SIZE*0.35;
                    eyeX2 = gx + SIZE*0.3; eyeY2 = gy + SIZE*0.65;
                } else if (nextSeg.y > seg.y) { // Moviéndose hacia abajo
                    eyeX1 = gx + SIZE*0.35; eyeY1 = gy + SIZE*0.7;
                    eyeX2 = gx + SIZE*0.65; eyeY2 = gy + SIZE*0.7;
                } else { // Moviéndose hacia arriba
                    eyeX1 = gx + SIZE*0.35; eyeY1 = gy + SIZE*0.3;
                    eyeX2 = gx + SIZE*0.65; eyeY2 = gy + SIZE*0.3;
                }
            }
            
            ctx.beginPath();
            ctx.arc(eyeX1, eyeY1, SIZE/8, 0, Math.PI*2);
            ctx.arc(eyeX2, eyeY2, SIZE/8, 0, Math.PI*2);
            ctx.fill();
        } 
        // Cuerpo de la serpiente
        else { 
            // Crear un gradiente para el cuerpo con tonos verdes
            const gradient = ctx.createRadialGradient(
                gx + SIZE/2, gy + SIZE/2, 2,
                gx + SIZE/2, gy + SIZE/2, SIZE
            );
            gradient.addColorStop(0, '#8bc34a');
            gradient.addColorStop(1, '#33691e');
            ctx.fillStyle = gradient;
            
            // Dibujar segmento del cuerpo con forma redondeada
            ctx.beginPath();
            ctx.arc(gx + SIZE/2, gy + SIZE/2, SIZE/2.2, 0, Math.PI*2);
            ctx.fill();
            
            // Añadir detalles al cuerpo
            if (i % 2 === 0) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.beginPath();
                ctx.arc(gx + SIZE/2, gy + SIZE/2, SIZE/4, 0, Math.PI*2);
                ctx.fill();
            }
        }
    } // Dibujar comida más atractiva (manzana)
    const foodX = food.x*SIZE + SIZE/2;
    const foodY = food.y*SIZE + 60 + SIZE/2;
    
    // Cuerpo de la manzana
    const appleGrad = ctx.createRadialGradient(
        foodX, foodY, 2,
        foodX, foodY, SIZE/2
    );
    appleGrad.addColorStop(0, '#ff5252');
    appleGrad.addColorStop(1, '#b71c1c');
    ctx.fillStyle = appleGrad;
    
    ctx.beginPath();
    ctx.arc(foodX, foodY, SIZE/2.2, 0, Math.PI*2);
    ctx.fill();
    
    // Tallo de la manzana
    ctx.fillStyle = '#33691e';
    ctx.fillRect(foodX - SIZE/20, foodY - SIZE/2.2, SIZE/10, SIZE/8);
    
    // Brillo
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.beginPath();
    ctx.arc(foodX - SIZE/5, foodY - SIZE/5, SIZE/8, 0, Math.PI*2);
    ctx.fill();
    
    // Game over
    if(gameOver){ 
        ctx.fillStyle='rgba(0,0,0,0.7)';
        ctx.fillRect(0,60,canvas.width,canvas.height-60); 
        
        // Texto principal
        ctx.fillStyle='#ffeb3b'; 
        ctx.font='bold 28px Arial'; 
        ctx.textAlign='center'; 
        ctx.fillText('¡GAME OVER!', canvas.width/2, canvas.height/2 - 30);
        
        // Texto secundario
        ctx.fillStyle='#fff'; 
        ctx.font='20px Arial';
        ctx.fillText('Puntuación: ' + score, canvas.width/2, canvas.height/2 + 10);
        ctx.fillText('Pulsa R para reiniciar', canvas.width/2, canvas.height/2 + 50);
    } 
}
function loop(t){ update(t); draw(); af=requestAnimationFrame(loop); }
function key(e){ if(e.key==='ArrowLeft' && dir.x!==1) dir={x:-1,y:0}; else if(e.key==='ArrowRight'&&dir.x!==-1) dir={x:1,y:0}; else if(e.key==='ArrowUp'&&dir.y!==1) dir={x:0,y:-1}; else if(e.key==='ArrowDown'&&dir.y!==-1) dir={x:0,y:1}; else if(gameOver && e.key.toLowerCase()==='r'){ snake=[{x:5,y:10},{x:4,y:10},{x:3,y:10}]; dir={x:1,y:0}; score=0; speed=160; food=spawn(); gameOver=false; } }
window.addEventListener('keydown',key); requestAnimationFrame(loop);
return function cleanup(){ if(af) cancelAnimationFrame(af); window.removeEventListener('keydown',key); };
}
window.registerGame=registerGame;
