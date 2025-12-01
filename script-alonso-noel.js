function registerGame(){
  // Alonso Noel: Papá Noel recoge regalos y esquiva bolas de nieve
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  let af = null;
  canvas.width = 800;
  canvas.height = 500;
  let player = { x: canvas.width/2, y: canvas.height-90, w: 60, h: 80, vx: 0, flipped: false };
  let score = 0;
  let high = Number(localStorage.getItem('alonsoNoelHigh')||0);
  let highName = localStorage.getItem('alonsoNoelHighName')||'';
  let playerName = localStorage.getItem('playerName')||'';
  let objects = [];
  let gameOver = false;
  let left = false, right = false;
  let spawnTimer = 0;
  let showIntro = true;
  function reset(){
    player.x = canvas.width/2;
    score = 0;
    objects = [];
    gameOver = false;
    spawnTimer = 0;
    showIntro = true;
  }
  function spawnObject(){
    // 5% reno especial, 65% regalo, 30% bola de nieve
    const roll = Math.random();
    if(roll < 0.05){
      // Rudolph
      const rw = 54, rh = 44;
      objects.push({
        type: 'rudolph',
        x: Math.random()*(canvas.width-rw),
        y: -rh,
        w: rw,
        h: rh
      });
    } else if(roll < 0.7){
      // Regalo: tamaño aleatorio
      const sizes = [32, 48, 64];
      const points = [100, 50, 20];
      const idx = Math.floor(Math.random()*sizes.length);
      objects.push({
        type: 'gift',
        x: Math.random()*(canvas.width-sizes[idx]),
        y: -sizes[idx],
        w: sizes[idx],
        h: sizes[idx],
        points: points[idx],
        color: idx===0?'#e91e63':(idx===1?'#4caf50':'#1976d2')
      });
    } else {
      // Bola de nieve
      const r = 28+Math.random()*18;
      objects.push({
        type: 'snow',
        x: Math.random()*(canvas.width-2*r),
        y: -2*r,
        w: 2*r,
        h: 2*r,
        r: r
      });
    }
  }
  function update(dt){
    if(showIntro||gameOver) return;
    // Movimiento jugador
    if(left) player.x -= 340*dt/1000;
    if(right) player.x += 340*dt/1000;
    player.x = Math.max(0, Math.min(canvas.width-player.w, player.x));
    // Spawneo
    spawnTimer += dt;
    if(spawnTimer>700){ spawnTimer=0; spawnObject(); }
    // Movimiento objetos
    for(const o of objects){ o.y += 220*dt/1000; }
    // Colisiones
    for(const o of objects){
      if(o.type==='gift'){
        if(
          player.x+player.w>o.x && player.x<o.x+o.w &&
          player.y+player.h>o.y && player.y<o.y+o.h
        ){
          score += o.points;
          o.caught = true;
        }
      } else if(o.type==='snow'){
        // Colisión circular
        const cx = o.x+o.r, cy = o.y+o.r;
        const px = player.x+player.w/2, py = player.y+player.h/2;
        const dist = Math.hypot(cx-px, cy-py);
        if(dist < o.r + Math.min(player.w,player.h)/2-8){
          gameOver = true;
          if(score>high){
            high = score;
            localStorage.setItem('alonsoNoelHigh', String(high));
            localStorage.setItem('alonsoNoelHighName', playerName);
          }
        }
      } else if(o.type==='rudolph'){
        if(
          player.x+player.w>o.x && player.x<o.x+o.w &&
          player.y+player.h>o.y && player.y<o.y+o.h
        ){
          score += 500;
          o.caught = true;
          showRudolphMsg = 60; // frames para mostrar mensaje
        }
      }
    }
    // Eliminar objetos atrapados o fuera de pantalla
    objects = objects.filter(o=>!o.caught && o.y<canvas.height+60);
  }
  const backgroundImage = new Image();
  backgroundImage.src = 'assets/alonso-noel-background.png';
  const characterImage = new Image();
  // Prefer PNG if present; fallback to bundled SVG
  characterImage.src = 'assets/alonso-noel-character.png';
  characterImage.onerror = () => { characterImage.src = 'assets/alonso-noel-character.svg'; };

  function characterImgReady(){
    return characterImage && characterImage.complete && characterImage.naturalWidth > 0;
  }

  function drawSanta(x,y,w,h){
    ctx.save();
    ctx.translate(x+w/2,y+h/2);
    ctx.scale(w/60,h/80);
    if(player.flipped){
      ctx.scale(-1,1); // Mirar a la izquierda
    }
    // Cuerpo y gorro
    ctx.beginPath(); ctx.arc(0,18,18,0,Math.PI*2); ctx.fillStyle='#fff'; ctx.fill(); // cara
    ctx.beginPath(); ctx.arc(0,32,22,Math.PI*0.9,Math.PI*2.1); ctx.fillStyle='#e53935'; ctx.fill(); // gorro
    ctx.beginPath(); ctx.arc(0,38,20,0,Math.PI,true); ctx.fillStyle='#fff'; ctx.fill(); // barba
    ctx.fillStyle='#e53935'; ctx.fillRect(-16,36,32,30); // cuerpo
    ctx.fillStyle='#fff'; ctx.fillRect(-16,66,32,8); // bajo
    ctx.fillStyle='#000'; ctx.fillRect(-12,74,8,8); ctx.fillRect(4,74,8,8); // pies
    // Si está girado, dibujar cara sonriente y barba
    if(player.flipped){
      // Ojos
      ctx.beginPath(); ctx.arc(-6,18,2,0,Math.PI*2); ctx.arc(6,18,2,0,Math.PI*2); ctx.fillStyle='#222'; ctx.fill();
      // Sonrisa
      ctx.beginPath(); ctx.arc(0,26,7,0,Math.PI,false); ctx.lineWidth=2; ctx.strokeStyle='#222'; ctx.stroke();
      // Barba más grande
      ctx.beginPath(); ctx.arc(0,38,22,0,Math.PI,true); ctx.fillStyle='#fff'; ctx.globalAlpha=0.7; ctx.fill(); ctx.globalAlpha=1;
    }
    ctx.restore();
  }
  function drawGift(o){
    ctx.save();
    ctx.fillStyle = o.color;
    ctx.fillRect(o.x,o.y,o.w,o.h);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(o.x+o.w/2,o.y);
    ctx.lineTo(o.x+o.w/2,o.y+o.h);
    ctx.moveTo(o.x,o.y+o.h/2);
    ctx.lineTo(o.x+o.w,o.y+o.h/2);
    ctx.stroke();
    ctx.restore();
  }
  function drawSnow(o){
    ctx.save();
    // Sombra
    ctx.globalAlpha=0.18;
    ctx.beginPath(); ctx.ellipse(o.x+o.r,o.y+o.r+o.r*0.5,o.r*0.8,o.r*0.25,0,0,Math.PI*2); ctx.fillStyle='#0288d1'; ctx.fill();
    ctx.globalAlpha=1;
    // Bola principal
    ctx.beginPath();
    ctx.arc(o.x+o.r,o.y+o.r,o.r,0,Math.PI*2);
    let grad=ctx.createRadialGradient(o.x+o.r-4,o.y+o.r-6,o.r*0.2,o.x+o.r,o.y+o.r,o.r);
    grad.addColorStop(0,'#fff'); grad.addColorStop(0.7,'#b3e5fc'); grad.addColorStop(1,'#0288d1');
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = '#0288d1';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    // Brillo
    ctx.beginPath(); ctx.arc(o.x+o.r-7,o.y+o.r-7,o.r*0.22,0,Math.PI*2); ctx.fillStyle='rgba(255,255,255,0.7)'; ctx.fill();
    // Copos
    for(let i=0;i<5;i++){
      const ang = Math.PI*2*i/5;
      ctx.save();
      ctx.translate(o.x+o.r+Math.cos(ang)*o.r*0.55, o.y+o.r+Math.sin(ang)*o.r*0.55);
      ctx.rotate(ang);
      ctx.strokeStyle='#fff'; ctx.lineWidth=1.1;
      ctx.beginPath(); ctx.moveTo(-3,0); ctx.lineTo(3,0); ctx.moveTo(0,-3); ctx.lineTo(0,3); ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
  }
  let showRudolphMsg = 0;
  function drawHUD(){
    ctx.save();
    ctx.fillStyle = '#1565c0';
    ctx.fillRect(0,0,canvas.width,50);
    ctx.fillStyle = '#fff';
    ctx.font = '18px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Puntuación: '+score, 16,32);
    ctx.textAlign = 'right';
    ctx.fillText('Récord: '+high+(highName?' ('+highName+')':''), canvas.width-16,32);
    ctx.restore();
    if(showRudolphMsg>0){
      ctx.save();
      ctx.globalAlpha = Math.min(1, showRudolphMsg/20);
      ctx.fillStyle = '#fffde7';
      ctx.fillRect(canvas.width/2-170, 60, 340, 60);
      ctx.strokeStyle = '#ff9800';
      ctx.lineWidth = 3;
      ctx.strokeRect(canvas.width/2-170, 60, 340, 60);
      ctx.font = 'bold 28px Arial';
      ctx.fillStyle = '#d84315';
      ctx.textAlign = 'center';
      ctx.fillText('¡Enhorabuena! Has atrapado a Rudolph 🦌', canvas.width/2, 100);
      ctx.restore();
      showRudolphMsg--;
    }
  }
  function drawIntro(){
    ctx.save();
    ctx.globalAlpha=0.92;
    ctx.fillStyle='#fff';
    ctx.fillRect(80,90,canvas.width-160,180);
    ctx.globalAlpha=1;
    ctx.fillStyle='#c62828';
    ctx.font='bold 32px Arial';
    ctx.textAlign='center';
    ctx.fillText('Alonso Noel', canvas.width/2, 140);
    ctx.font='18px Arial';
    ctx.fillStyle='#333';
    ctx.fillText('¡Ayuda a Papá Noel a recoger regalos!', canvas.width/2, 180);
    ctx.font='15px Arial';
    ctx.fillText('Mueve con ← →. Atrapa regalos pequeños para más puntos.', canvas.width/2, 210);
    ctx.fillText('Evita las bolas de nieve. Pulsa cualquier tecla para empezar.', canvas.width/2, 235);
    ctx.restore();
  }
  function drawGameOver(){
    ctx.save();
    ctx.globalAlpha=0.88;
    ctx.fillStyle='#fff';
    ctx.fillRect(120,160,canvas.width-240,120);
    ctx.globalAlpha=1;
    ctx.fillStyle='#d32f2f';
    ctx.font='bold 30px Arial';
    ctx.textAlign='center';
    ctx.fillText('¡Fin del juego!', canvas.width/2, 200);
    ctx.font='18px Arial';
    ctx.fillStyle='#333';
    ctx.fillText('Puntuación: '+score, canvas.width/2, 235);
    ctx.fillText('Pulsa R para reiniciar', canvas.width/2, 265);
    ctx.restore();
  }
  function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
    if (characterImgReady()){
      ctx.drawImage(characterImage, player.x, player.y, player.w, player.h);
    } else {
      drawSanta(player.x, player.y, player.w, player.h);
    }
    drawHUD();
    // No duplicar al personaje si ya hay sprite
    for(const o of objects){
      if(o.type==='gift') drawGift(o);
      else if(o.type==='snow') drawSnow(o);
      else if(o.type==='rudolph') drawRudolph(o);
    }
  function drawRudolph(o){
    ctx.save();
    ctx.translate(o.x+o.w/2, o.y+o.h/2);
    ctx.scale(o.w/54, o.h/44);
    // Cuerpo
    ctx.beginPath(); ctx.ellipse(0,10,18,14,0,0,Math.PI*2); ctx.fillStyle='#8d6e63'; ctx.fill();
    // Cabeza
    ctx.beginPath(); ctx.ellipse(0,-10,13,11,0,0,Math.PI*2); ctx.fillStyle='#a1887f'; ctx.fill();
    // Hocico rojo
    ctx.beginPath(); ctx.arc(0,-3,4,0,Math.PI*2); ctx.fillStyle='#e53935'; ctx.fill();
    // Ojos
    ctx.beginPath(); ctx.arc(-4,-12,2,0,Math.PI*2); ctx.arc(4,-12,2,0,Math.PI*2); ctx.fillStyle='#222'; ctx.fill();
    // Orejas
    ctx.beginPath(); ctx.ellipse(-9,-15,3,6,Math.PI/7,0,Math.PI*2); ctx.ellipse(9,-15,3,6,-Math.PI/7,0,Math.PI*2); ctx.fillStyle='#8d6e63'; ctx.fill();
    // Cuernos
    ctx.strokeStyle='#bcaaa4'; ctx.lineWidth=2.2;
    ctx.beginPath(); ctx.moveTo(-7,-20); ctx.lineTo(-15,-28); ctx.moveTo(-7,-22); ctx.lineTo(-13,-32);
    ctx.moveTo(7,-20); ctx.lineTo(15,-28); ctx.moveTo(7,-22); ctx.lineTo(13,-32);
    ctx.stroke();
    ctx.restore();
  }
    if(showIntro) drawIntro();
    if(gameOver) drawGameOver();
  }
  function loop(t){
    update(16);
    draw();
    af = requestAnimationFrame(loop);
  }
  function keydown(e){
    if(showIntro){ showIntro=false; return; }
    if(gameOver && e.key.toLowerCase()==='r'){ reset(); return; }
    if(e.key==='ArrowLeft') left=true;
    if(e.key==='ArrowRight') right=true;
    if(e.key==='a' || e.key==='A') player.flipped = true;
  }
  function keyup(e){
    if(e.key==='ArrowLeft') left=false;
    if(e.key==='ArrowRight') right=false;
    if(e.key==='a' || e.key==='A') player.flipped = false;
  }
  window.addEventListener('keydown', keydown);
  window.addEventListener('keyup', keyup);
  reset();
  loop();
  return function cleanup(){
    if(af) cancelAnimationFrame(af);
    window.removeEventListener('keydown', keydown);
    window.removeEventListener('keyup', keyup);
  };
}
window.registerGame = registerGame;
