// Registro de juego: Cálculo Relámpago
registerGame('math-fast', function initMathFast(canvas, cleanupBag){
  const ctx = canvas.getContext('2d');
  let running=false, frame=0, timeLeft=90, score=0, round=0;
  let current=null, choices=[];
  let playerName=localStorage.getItem('playerName')||'Jugador';
  let high=+(localStorage.getItem('mathFastHigh')||0);
  let highName=localStorage.getItem('mathFastHighName')||'';
  let intro=true;
  const ui = window.GameUI;

  function randInt(a,b){return Math.floor(Math.random()*(b-a+1))+a;}
  function genProblem(){
    round++;
    const ops = ['+','-','×','÷'];
    const op = ops[randInt(0,ops.length-1)];
    let a=randInt(2,40), b=randInt(2,40);
    if(op==='-'){ if(b>a){[a,b]=[b,a];}}
    if(op==='÷'){ b=randInt(2,12); a=b*randInt(2,12); }
    const expr = `${a} ${op} ${b}`;
    let val;
    switch(op){
      case '+': val=a+b; break;
      case '-': val=a-b; break;
      case '×': val=a*b; break;
      case '÷': val=a/b; break;
    }
    const correct=val;
    let set = new Set([correct]);
    while(set.size<4){
      let noise = correct + randInt(-10,10) + randInt(-3,3);
      if(noise!==correct && noise>=-200) set.add(noise);
    }
    choices = [...set].sort(()=>Math.random()-0.5).map(v=>({v, correct: v===correct}));
    current = {expr, correct};
  }

  function start(){
    intro=false;
    running=true;
    score=0; round=0; timeLeft=90;
    genProblem();
  }

  function update(){
    if(!running) return;
    frame++;
    if(frame%60===0){
      timeLeft--;
      if(timeLeft<=0){
        endGame();
      }
    }
  }

  function endGame(){
    running=false;
    // récord
    if(score>high){
      high=score;
      highName=playerName;
      localStorage.setItem('mathFastHigh', high);
      localStorage.setItem('mathFastHighName', highName);
    }
  }

  function draw(){
    ui.softBg(ctx,canvas,'#0d47a1');
    ui.gradientBar(ctx,canvas,{from:'#1565c0',to:'#0d47a1'});
    ui.shadowText(ctx,'Cálculo Relámpago',20,34,{size:24});
    ctx.fillStyle='#fff';
    ctx.font='14px Arial';
    ctx.fillText('Tiempo: '+timeLeft+'s', 20,60);
    ctx.fillText('Puntos: '+score, 20,80);
    ctx.fillText('Récord: '+high+(highName?' ('+highName+')':''), 20,100);
    if(intro){
      ui.glassPanel(ctx, canvas.width/2-220, 120, 440, 250);
      ctx.fillStyle='#fff';
      ctx.font='20px Arial';
      ctx.textAlign='center';
      ctx.fillText('Instrucciones', canvas.width/2,150);
      ctx.font='14px Arial';
      const lines=[
        'Resuelve el mayor número de operaciones en 90s.',
        'Pulsa 1-4 (o clic) para elegir respuesta.',
        'Operaciones: +  -  ×  ÷ (siempre exactas).',
        'Consejo: juega máximo 10 min y descansa.',
        'Pulsa ESPACIO para comenzar.'
      ];
      lines.forEach((l,i)=>ctx.fillText(l, canvas.width/2, 180+i*22));
      ctx.textAlign='left';
      return;
    }
    if(!running){
      ui.glassPanel(ctx, canvas.width/2-200, 170, 400, 180);
      ctx.fillStyle='#fff';
      ctx.font='22px Arial';
      ctx.textAlign='center';
      ctx.fillText('Fin del juego', canvas.width/2, 205);
      ctx.font='16px Arial';
      ctx.fillText('Puntuación: '+score, canvas.width/2, 235);
      if(score===high) ctx.fillText('¡Nuevo récord!', canvas.width/2, 260);
      ctx.fillText('Pulsa ESPACIO para reiniciar', canvas.width/2, 290);
      ctx.textAlign='left';
      return;
    }
    // problema
    ctx.fillStyle='#fff';
    ctx.font='48px Consolas,monospace';
    ctx.textAlign='center';
    ctx.fillText(current.expr, canvas.width/2, 210);
    ctx.font='18px Arial';
    choices.forEach((c,i)=>{
      const w=150,h=50;
      const cx = canvas.width/2 - 170 + i*115;
      const cy = 260;
      ctx.fillStyle='rgba(255,255,255,0.15)';
      ctx.beginPath(); ctx.roundRect(cx,cy,w,h,12); ctx.fill();
      ctx.strokeStyle='rgba(255,255,255,0.4)';
      ctx.stroke();
      ctx.fillStyle='#fff';
      ctx.font='16px Arial';
      ctx.fillText((i+1)+') '+c.v, cx+w/2, cy+30);
    });
    ctx.textAlign='left';
  }

  function handleKey(e){
    if(intro && e.key===' ') { start(); return; }
    if(!running){
      if(e.key===' '){ start(); return; }
      return;
    }
    if(['1','2','3','4'].includes(e.key)){
      pick(parseInt(e.key)-1);
    }
  }
  function pick(index){
    if(!running) return;
    const sel = choices[index];
    if(!sel) return;
    if(sel.correct) score+=10;
    else score=Math.max(0,score-5);
    genProblem();
  }
  function handleClick(ev){
    if(intro) return;
    if(!running) return;
    const rect=canvas.getBoundingClientRect();
    const x=ev.clientX-rect.left;
    const y=ev.clientY-rect.top;
    choices.forEach((c,i)=>{
      const cx = canvas.width/2 -170 + i*115;
      const cy = 260;
      if(x>=cx && x<=cx+150 && y>=cy && y<=cy+50){
        pick(i);
      }
    });
  }

  const keyListener = e=>handleKey(e);
  const clickListener = e=>handleClick(e);
  window.addEventListener('keydown', keyListener);
  canvas.addEventListener('click', clickListener);
  cleanupBag.push(()=>{window.removeEventListener('keydown',keyListener);canvas.removeEventListener('click',clickListener);});

  function loop(){
    update();
    draw();
    if(!intro) frame=requestAnimationFrame(loop);
    else frame=requestAnimationFrame(loop);
  }
  loop();
});