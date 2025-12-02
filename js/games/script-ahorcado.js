function registerGame() {
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');

  canvas.width = 800;
  canvas.height = 600;

  const palabras = ['GALAXIA','NEBULOSA','ASTEROIDE','COMETA','PLANETA','LUNA','SOL','VENUS','MARTE','URANO','ORION','METEORO','SATELITE','CUASAR','ECLIPSE','ROVER','PROTON','ATOMO'];
  let secreta = '', mostrada = [], usadas = new Set();
  let vidas = 7, score = 0, high = +(localStorage.getItem('ahorcadoHigh')||0);
  let intro = true, ended = false;
  let particles = [];

  // Variable global para controlar la velocidad del juego
  let gameSpeed = 1;

  function createParticles(x,y,count,colorRange=0){
    for(let i=0;i<count;i++){
      particles.push({
        x,y,
        vx:(Math.random()-0.5)*2,
        vy:(Math.random()-0.5)*2,
        size:Math.random()*4+1,
        color:`hsla(${260+Math.random()*30+colorRange},80%,70%,${Math.random()*0.5+0.3})`,
        life:Math.random()*30+20
      });
    }
  }

  function updateParticles(){
    particles = particles.filter(p=>p.life>0);
    particles.forEach(p=>{
      p.x+=p.vx; p.y+=p.vy; p.life--; p.size*=0.97;
    });
  }

  function drawParticles(){
    particles.forEach(p=>{
      ctx.fillStyle=p.color;
      ctx.beginPath();
      ctx.arc(p.x,p.y,p.size,0,Math.PI*2);
      ctx.fill();
    });
  }

  function nuevaPalabra(){
    secreta = palabras[Math.floor(Math.random()*palabras.length)];
    mostrada = Array(secreta.length).fill('_');
    usadas.clear();
    vidas=7; ended=false;
  }

  function startGame(){
    intro=false; score=0;
    nuevaPalabra();
    createParticles(canvas.width/2,canvas.height/2,30);
  }

  function drawBackground(){
    const grad = ctx.createLinearGradient(0,0,0,canvas.height);
    grad.addColorStop(0,'#0b0033');
    grad.addColorStop(1,'#200050');
    ctx.fillStyle=grad;
    ctx.fillRect(0,0,canvas.width,canvas.height);

    for(let i=0;i<100;i++){
      const x=Math.random()*canvas.width;
      const y=Math.random()*canvas.height;
      const r=Math.random()*1.5;
      ctx.fillStyle=`rgba(255,255,255,${Math.random()*0.8+0.2})`;
      ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill();
    }

    const nebulaGrad = ctx.createRadialGradient(canvas.width*0.75, canvas.height*0.2, 10,
                                               canvas.width*0.75, canvas.height*0.2, 250);
    nebulaGrad.addColorStop(0,'rgba(150,100,255,0.15)');
    nebulaGrad.addColorStop(0.5,'rgba(100,50,200,0.05)');
    nebulaGrad.addColorStop(1,'rgba(50,0,100,0)');
    ctx.fillStyle = nebulaGrad;
    ctx.beginPath();
    ctx.arc(canvas.width*0.75, canvas.height*0.2, 250,0,Math.PI*2);
    ctx.fill();
  }

  function drawAstronaut(){
    const fails = 7-vidas;
    ctx.save();
    ctx.translate(canvas.width/2, 150); // astronauta más arriba
    ctx.strokeStyle='#fff';
    ctx.lineWidth=3;

    // Base y cuerda
    ctx.beginPath(); ctx.moveTo(-60,80); ctx.lineTo(60,80); ctx.stroke();
    if(fails>0){ ctx.beginPath(); ctx.moveTo(0,80); ctx.lineTo(0,-20); ctx.stroke();}
    if(fails>1){ ctx.beginPath(); ctx.moveTo(0,-20); ctx.lineTo(40,-20); ctx.stroke();}
    if(fails>2){ ctx.beginPath(); ctx.moveTo(40,-20); ctx.lineTo(40,0); ctx.stroke();}

    // Cabeza con visor
    if(fails>3){
      ctx.beginPath(); ctx.arc(40,20,20,0,Math.PI*2); ctx.stroke();
      ctx.fillStyle='rgba(130,200,255,0.3)';
      ctx.beginPath(); ctx.arc(40,20,12,0,Math.PI,true); ctx.fill();
      if(Math.random()>0.7) createParticles(40+Math.random()*10-5,20+Math.random()*10-5,2,10);
    }

    // Cuerpo
    if(fails>4){ ctx.beginPath(); ctx.moveTo(40,40); ctx.lineTo(40,80); ctx.stroke();}

    // Brazos
    if(fails>5){
      ctx.beginPath(); ctx.moveTo(40,50); ctx.lineTo(20,70);
      ctx.moveTo(40,50); ctx.lineTo(60,70); ctx.stroke();
    }

    // Piernas
    if(fails>6){
      ctx.beginPath(); ctx.moveTo(40,80); ctx.lineTo(25,100);
      ctx.moveTo(40,80); ctx.lineTo(55,100); ctx.stroke();
    }

    ctx.restore();
  }

  function guess(letter){
    if(intro || ended) return;
    letter=letter.toUpperCase();
    if(!/^[A-ZÑ]$/.test(letter) || usadas.has(letter)) return;
    usadas.add(letter);

    if(secreta.includes(letter)){
      createParticles(canvas.width/2,200,10);
      for(let i=0;i<secreta.length;i++){
        if(secreta[i]===letter) mostrada[i]=letter;
      }
      if(!mostrada.includes('_')){
        score+=50; nuevaPalabra(); createParticles(canvas.width/2,canvas.height/2,50);
      }
    } else {
      vidas--; createParticles(canvas.width/2,150,5);
      if(vidas<=0){ ended=true; createParticles(canvas.width/2,200,30);}
    }
  }

  function drawKeyboard(){
    const rows=['ABCDEFGHIJKLM','NOPQRSTUVWXYZ'];
    rows.forEach((row,ri)=>{
      [...row].forEach((ch,ci)=>{
        const w=30,h=34;
        const totalRowWidth=row.length*(w+6);
        const startX=canvas.width/2 - totalRowWidth/2;
        const x=startX + ci*(w+6);
        const y=450 + ri*(h+8); // teclado más abajo
        const pulse=(Math.sin(Date.now()/200 + ci*0.3 + ri*0.6)+1)*0.2+0.25;
        ctx.fillStyle=usadas.has(ch)?(secreta.includes(ch)?'rgba(100,255,120,0.25)':'rgba(255,80,80,0.25)'):`rgba(255,255,255,${pulse})`;
        ctx.fillRect(x,y,w,h);
        ctx.strokeStyle='rgba(255,255,255,0.5)'; ctx.strokeRect(x,y,w,h);
        ctx.fillStyle=usadas.has(ch)?(secreta.includes(ch)?'#8cff9b':'#ff9e9e'):'#fff';
        ctx.font='16px Arial'; ctx.textAlign='center'; ctx.fillText(ch,x+w/2,y+22);
      });
    });
  }

  function draw(){
    updateParticles();
    drawBackground();

    // Score y récord
    ctx.fillStyle='#fff';
    ctx.font='20px Arial';
    ctx.fillText('Score: '+score,20,30);
    ctx.fillText('Récord: '+high,20,55);

    if(intro){
      ctx.textAlign='center';
      ctx.font='24px Arial';
      ctx.fillText('Pulsa ESPACIO para comenzar',canvas.width/2,canvas.height/2);
      drawParticles(); return;
    }

    drawAstronaut();

    // Palabra a adivinar
    ctx.textAlign='center';
    ctx.font='36px monospace';
    ctx.shadowColor='rgba(100,120,255,0.7)';
    ctx.shadowBlur=8;
    ctx.fillText(mostrada.join(' '),canvas.width/2,300); // palabra en media pantalla
    ctx.shadowColor='transparent';

    ctx.font='16px Arial'; ctx.fillText('Letras usadas: '+[...usadas].join(' '),canvas.width/2,340);

    drawKeyboard();
    drawParticles();

    if(ended){
      ctx.fillStyle='rgba(0,0,0,0.6)'; ctx.fillRect(canvas.width/2-150,380,300,80);
      ctx.fillStyle='#fff'; ctx.font='20px Arial';
      ctx.fillText('FIN - Palabra: '+secreta,canvas.width/2,410);
      ctx.fillText('Pulsa ESPACIO para reiniciar',canvas.width/2,440);
      if(score>high){ high=score; localStorage.setItem('ahorcadoHigh',high);}
    }
  }

  function keyHandler(e){
    if(intro && e.key===' '){ startGame(); return; }
    if(ended && e.key===' '){ startGame(); return; }
    if(/^[a-zA-ZñÑ]$/.test(e.key)) guess(e.key);
  }

  function clickHandler(e){
    if(intro || ended){ startGame(); return; }
    const rect=canvas.getBoundingClientRect();
    const x=e.clientX-rect.left, y=e.clientY-rect.top;
    const rows=['ABCDEFGHIJKLM','NOPQRSTUVWXYZ'];
    rows.forEach((row,ri)=>{
      [...row].forEach((ch,ci)=>{
        const w=30,h=34;
        const totalRowWidth=row.length*(w+6);
        const startX=canvas.width/2 - totalRowWidth/2;
        const bx=startX+ci*(w+6);
        const by=450+ri*(h+8);
        if(x>=bx && x<=bx+w && y>=by && y<=by+h) guess(ch);
      });
    });
  }

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

  // Modificar el bucle principal para incluir la velocidad
  function gameLoop() {
    updateParticles();
    drawParticles();
    setTimeout(() => {
        requestAnimationFrame(gameLoop);
    }, 1000 / (60 * gameSpeed)); // Ajusta la velocidad del juego
  }

  window.addEventListener('keydown', keyHandler);
  canvas.addEventListener('click', clickHandler);

  function loop(){ draw(); requestAnimationFrame(loop);}
  loop();

  return function cleanup(){
    window.removeEventListener('keydown',keyHandler);
    canvas.removeEventListener('click',clickHandler);
  };
}

window.registerGame = registerGame;
