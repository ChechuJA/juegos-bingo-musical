function registerGame(){
  // 4 en Raya contra la máquina
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 700;
  canvas.height = 600;
  const COLS = 7, ROWS = 6;
  const cell = 80, margin = 20;
  let board = Array.from({length:ROWS},()=>Array(COLS).fill(0)); // 0=vacío, 1=jugador, 2=IA
  let turn = 1; // 1=jugador, 2=IA
  let winner = 0;
  let showIntro = true;
  // Variable global para controlar la velocidad del juego
  let gameSpeed = 1;
  function reset(){
    board = Array.from({length:ROWS},()=>Array(COLS).fill(0));
    turn = 1;
    winner = 0;
    showIntro = true;
  }
  function drop(col, who){
    for(let row=ROWS-1; row>=0; row--){
      if(board[row][col]===0){
        board[row][col]=who;
        return row;
      }
    }
    return -1;
  }
  function checkWin(who){
    // Horizontal, vertical, diagonal
    for(let r=0;r<ROWS;r++) for(let c=0;c<COLS-3;c++) if(board[r][c]===who&&board[r][c+1]===who&&board[r][c+2]===who&&board[r][c+3]===who) return true;
    for(let c=0;c<COLS;c++) for(let r=0;r<ROWS-3;r++) if(board[r][c]===who&&board[r+1][c]===who&&board[r+2][c]===who&&board[r+3][c]===who) return true;
    for(let r=0;r<ROWS-3;r++) for(let c=0;c<COLS-3;c++) if(board[r][c]===who&&board[r+1][c+1]===who&&board[r+2][c+2]===who&&board[r+3][c+3]===who) return true;
    for(let r=3;r<ROWS;r++) for(let c=0;c<COLS-3;c++) if(board[r][c]===who&&board[r-1][c+1]===who&&board[r-2][c+2]===who&&board[r-3][c+3]===who) return true;
    return false;
  }
  function aiMove(){
    // IA simple: elige columna aleatoria válida
    let valid=[];
    for(let c=0;c<COLS;c++) if(board[0][c]===0) valid.push(c);
    if(valid.length===0) return;
    // Bloquear victoria inmediata del jugador
    for(let c of valid){
      let r = drop(c,2); if(r>=0){ if(checkWin(2)){ board[r][c]=0; return c; } board[r][c]=0; }
    }
    for(let c of valid){
      let r = drop(c,1); if(r>=0){ if(checkWin(1)){ board[r][c]=0; return c; } board[r][c]=0; }
    }
    // Si no, aleatorio
    return valid[Math.floor(Math.random()*valid.length)];
  }
  function handleClick(e){
    if(winner||showIntro) return;
    const rect=canvas.getBoundingClientRect();
    const mx=(e.clientX-rect.left)*canvas.width/rect.width;
    const col = Math.floor((mx-margin)/(cell+margin));
    if(col<0||col>=COLS) return;
    if(board[0][col]!==0) return;
    let row = drop(col,1);
    if(row<0) return;
    if(checkWin(1)){ winner=1; return; }
    turn=2;
    setTimeout(()=>{
      let aiCol = aiMove();
      if(aiCol!==undefined){
        let aiRow = drop(aiCol,2);
        if(checkWin(2)){ winner=2; return; }
      }
      turn=1;
    }, 400);
  }
  function drawBoard(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle='#1976d2';
    ctx.fillRect(0,0,canvas.width,canvas.height);
    for(let r=0;r<ROWS;r++){
      for(let c=0;c<COLS;c++){
        let x=margin+c*(cell+margin), y=margin+r*(cell+margin);
        ctx.beginPath();
        ctx.arc(x+cell/2,y+cell/2,cell/2-6,0,Math.PI*2);
        ctx.fillStyle=board[r][c]===0?'#fff':(board[r][c]===1?'#fbc02d':'#d32f2f');
        ctx.fill();
        ctx.strokeStyle='#333'; ctx.lineWidth=2; ctx.stroke();
      }
    }
  }
  function drawHUD(){
    ctx.save();
    ctx.fillStyle='#0d47a1';
    ctx.fillRect(0,0,canvas.width,50);
    ctx.fillStyle='#fff';
    ctx.font='20px Arial';
    ctx.textAlign='center';
    ctx.fillText('4 en Raya: ¡Conecta 4 para ganar!', canvas.width/2,34);
    ctx.restore();
    if(showIntro){
      ctx.save();
      ctx.globalAlpha=0.92;
      ctx.fillStyle='#fff';
      ctx.fillRect(80,120,canvas.width-160,180);
      ctx.globalAlpha=1;
      ctx.fillStyle='#1976d2';
      ctx.font='bold 32px Arial';
      ctx.textAlign='center';
      ctx.fillText('4 en Raya', canvas.width/2, 170);
      ctx.font='18px Arial';
      ctx.fillStyle='#333';
      ctx.fillText('Haz clic en una columna para colocar tu ficha.', canvas.width/2, 210);
      ctx.fillText('Gana conectando 4 en línea. ¡Suerte!', canvas.width/2, 240);
      ctx.fillText('Pulsa cualquier tecla para empezar.', canvas.width/2, 270);
      ctx.restore();
    }
    if(winner){
      ctx.save();
      ctx.globalAlpha=0.92;
      ctx.fillStyle='#fff';
      ctx.fillRect(120,220,canvas.width-240,100);
      ctx.globalAlpha=1;
      ctx.fillStyle=winner===1?'#fbc02d':'#d32f2f';
      ctx.font='bold 28px Arial';
      ctx.textAlign='center';
      ctx.fillText(winner===1?'¡Has ganado!':'Gana la máquina', canvas.width/2, 270);
      ctx.font='18px Arial';
      ctx.fillStyle='#333';
      ctx.fillText('Pulsa R para reiniciar', canvas.width/2, 305);
      ctx.restore();
    }
  }
  function draw(){
    drawBoard();
    drawHUD();
  }
  function keydown(e){
    if(showIntro){ showIntro=false; return; }
    if(winner && e.key.toLowerCase()==='r'){ reset(); return; }
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

  canvas.addEventListener('click',handleClick);
  window.addEventListener('keydown',keydown);
  reset();
  function loop(){ draw(); requestAnimationFrame(loop); }
  function gameLoop() {
    setTimeout(() => {
        // ...existing game logic...
        gameLoop();
    }, 1000 / gameSpeed);
}

  gameLoop();
  return function cleanup(){
    canvas.removeEventListener('click',handleClick);
    window.removeEventListener('keydown',keydown);
  };
}
window.registerGame = registerGame;
