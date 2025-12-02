// script-mario-flappy.js
// Juego: "Mario Adventures" - un juego de plataformas lateral estilo Mario
// Autor: ChechuJA + Copilot (versión mejorada)

(function(){
  // Configuración básica
  const TILE = 40;
  const GRAVITY = 0.9;
  const JUMP_POWER = -14;
  const MOVE_SPEED = 4;
  const CANVAS_W = 800;
  const CANVAS_H = 450;

  let canvas, ctx, width, height;
  let cameraX = 0;
  let keys = {};

  // Estado del juego
  let player, entities, levelIndex, levels, paused, gameOver, score, lives, highScoreKey;

  // Curiosidades que se muestran al coger estrellas
  const curiosidades = [
    '¿Sabías que "El viaje de Chihiro" ganó el Oscar a la Mejor Película de Animación en 2003?',
    '"Toy Story" (1995) fue la primera película totalmente animada por ordenador.',
    'La primera película de Mickey Mouse con sonido fue "Steamboat Willie" (1928).',
    'El muñeco de madera Pinocchio debutó en una película de Disney en 1940.',
    '"La Bella y la Bestia" (1991) fue la primera película animada nominada al Oscar a Mejor Película.'
  ];

  // Definición de tiles: 0 = vacío, 1 = suelo, 2 = bloque sólido, 3 = estrella, 4 = enemigo, 5 = pinchos, B = bloque rompible
  levels = [];

  // Nivel 1 (intro)
  levels.push({
    tiles: [
      '                          ',
      '                          ',
      '                          ',
      '     *      E             ',
      '     222      222    22222',
      '        222         22222 ',
      '  22222     22222         ',
      '11111111111111111111111111'
    ].map(r=>r.split('')),
    widthTiles: 24,
    heightTiles: 8,
    name: 'Mushroom Meadows'
  });

  // Nivel 2 (tuberías y plataformas móviles)
  levels.push({
    tiles: [
      '                          ',
      '    P     P     P         ',
      '      3        3     E    ',
      '   2222    2222    22222  ',
      '                          ',
      '       2222     2222     ',
      '  22222     22222       2',
      '11111111111111111111111111'
    ].map(r=>r.split('')),
    widthTiles: 24,
    heightTiles: 8,
    name: 'Pipe Valley'
  });

  // Convert map char to tile codes and create entity list
  function loadLevel(idx){
    const raw = levels[idx];
    entities = [];
    cameraX = 0;
    player = { x: TILE*2, y: 0, vx:0, vy:0, baseW:32, baseH:36, scale:1, w:32, h:36, onGround:false, facing:1 };
    score = 0;
    lives = 3;
    paused = false;
    gameOver = false;
    levelIndex = idx;

    // create tiles array
    const tiles = [];
    for(let y=0;y<raw.heightTiles;y++){
      tiles[y]=[];
      for(let x=0;x<raw.widthTiles;x++){
        const ch = (raw.tiles[y] && raw.tiles[y][x]) || ' ';
        let t = 0;
        if(ch==='1') t=1; // ground
        if(ch==='2') t=2; // block
        if(ch==='*' || ch==='3') {
          // place star entity
          entities.push({ type:'star', x:x*TILE+TILE/2, y:y*TILE+TILE/2, w:20, h:20, collected:false });
        }
        if(ch==='B' || ch==='b'){
          // breakable block tile
          tiles[y][x] = 'B';
          // hide a mushroom occasionally
          if(Math.random()<0.15){
            entities.push({ type:'mushroomHidden', x:x*TILE, y:y*TILE, w:TILE, h:TILE, revealed:false });
          }
          continue;
        }
        if(ch==='E' || ch==='e') {
          entities.push({ type:'enemy', x:x*TILE, y:y*TILE, w:32, h:32, dir:-1, speed:1.2 });
        }
        if(ch==='P' || ch==='p') {
          // pipe hazard (tall solid with gap)
          tiles[y][x]=2;
          // make a tall pipe by setting blocks below
          for(let yy=y+1; yy<raw.heightTiles-1; yy++) tiles[yy][x]=2;
          continue;
        }
        tiles[y][x]=t;
      }
    }
    levelTimer = 0; // seconds elapsed
    levelTimeLimit = 120; // seconds per level
    levelCompleted = false;

    // place flag at rightmost ground column if not present
    if (!entities.find(e => e.type === 'flag')) {
      for (let x = cols - 1; x >= 0; x--) {
        for (let y = 0; y < rows; y++) {
          const ch = map[y][x];
          if (ch === 'G' || ch === '#') {
            entities.push({type: 'flag', x: x * tileSize + 8, y: y * tileSize - tileSize, w: 10, h: 24});
            x = -1; // break outer
            break;
          }
        }
      }
    }
    levels[idx].tilesNumeric = tiles;
    // place player on top of the ground for this level
    const startTx = Math.floor(player.x / TILE);
    // find lowest solid tile in that column
    let groundTy = raw.heightTiles - 1;
    for(let ty=raw.heightTiles-1; ty>=0; ty--){
      if(tiles[ty] && (tiles[ty][startTx]===1 || tiles[ty][startTx]===2)) { groundTy = ty; break; }
    }
    player.y = groundTy * TILE - player.h - 1;
    player.vx = 0; player.vy = 0; player.onGround = true;
    // Add some enemies and moving platforms for level 2
    if(idx===1){
      // add moving platform entities
      entities.push({ type:'platform', x:10*TILE, y:4*TILE, w:80, h:16, vx:0, vy:0, rangeY:60, baseY:4*TILE, dir:1, speed:1 });
      entities.push({ type:'enemy', x:16*TILE, y:5*TILE-32, w:32, h:32, dir:1, speed:1.5 });
    }
  }

  // Utilities
  function rectsOverlap(a,b){
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  function tileAtPixel(x,y){
    const tx = Math.floor(x / TILE);
    const ty = Math.floor(y / TILE);
    const raw = levels[levelIndex];
    if(!raw.tilesNumeric || !raw.tilesNumeric[ty]) return 0;
    return raw.tilesNumeric[ty][tx] || 0;
  }

  function collideWorld(entity){
    // simple AABB tile collision resolution
    const left = Math.floor((entity.x)/TILE);
    const right = Math.floor((entity.x+entity.w-1)/TILE);
    const top = Math.floor((entity.y)/TILE);
    const bottom = Math.floor((entity.y+entity.h-1)/TILE);
    const raw = levels[levelIndex];
    for(let ty=top; ty<=bottom; ty++){
      for(let tx=left; tx<=right; tx++){
        const t = (raw.tilesNumeric[ty] && raw.tilesNumeric[ty][tx]) || 0;
        if(t===1 || t===2 || t==='B'){
          // solid tile
          const tileRect = { x: tx*TILE, y: ty*TILE, w:TILE, h:TILE };
          if(rectsOverlap(entity, tileRect)){
            // resolve simple
            const overlapX = (entity.x + entity.w/2) - (tileRect.x + tileRect.w/2);
            const overlapY = (entity.y + entity.h/2) - (tileRect.y + tileRect.h/2);
            const ox = (entity.w/2 + tileRect.w/2) - Math.abs(overlapX);
            const oy = (entity.h/2 + tileRect.h/2) - Math.abs(overlapY);
            if(ox<oy){
              // push in x
              if(overlapX>0) entity.x += ox; else entity.x -= ox;
              entity.vx = 0;
            } else {
              // If collision is from below (player hitting the bottom of tile)
              if(overlapY>0){
                // collision from below
                // if tile is breakable, break it and maybe reveal mushroom
                if(t==='B'){
                  levels[levelIndex].tilesNumeric[ty][tx]=0;
                  // reveal any hidden mushroom at that tile
                  for(const ent of entities){
                    if(ent.type==='mushroomHidden' && !ent.revealed && Math.abs(ent.x - tx*TILE)<2 && Math.abs(ent.y - ty*TILE)<2){
                      ent.revealed=true; ent.type='mushroom'; ent.y = ty*TILE; ent.x = tx*TILE+TILE/2; ent.w=20; ent.h=20; break;
                    }
                  }
                }
                if(overlapY>0) entity.y += oy; else entity.y -= oy;
                entity.vy = 0;
              } else {
                if(overlapY>0) entity.y += oy; else entity.y -= oy;
                entity.vy = 0;
              }
            }
          }
        }
        if(t===5){
          // spikes (instant death)
          const tileRect = { x: tx*TILE, y: ty*TILE, w:TILE, h:TILE };
          if(rectsOverlap(entity, tileRect)){
            hurtPlayer();
          }
        }
      }
    }
  }

  function hurtPlayer(){
    lives--;
    player.x = TILE*2; player.vx=0; player.vy=0;
    // place on top of ground similar to loadLevel
    const raw = levels[levelIndex];
    const startTx = Math.floor(player.x / TILE);
    let groundTy = raw.heightTiles - 1;
    for(let ty=raw.heightTiles-1; ty>=0; ty--){
      if(raw.tilesNumeric[ty] && (raw.tilesNumeric[ty][startTx]===1 || raw.tilesNumeric[ty][startTx]===2)) { groundTy = ty; break; }
    }
    player.y = groundTy * TILE - player.h - 1;
    if(lives<=0) endGame();
  }

  function endGame(){
    gameOver = true;
    // save highscore
    highScoreKey = 'marioHigh';
    const prev = +(localStorage.getItem(highScoreKey)||0);
    if(score>prev) localStorage.setItem(highScoreKey, score);
  }

  // Input
  window.addEventListener('keydown',(e)=>{ keys[e.key]=true; if(e.key==='p') paused=!paused; });
  window.addEventListener('keyup',(e)=>{ keys[e.key]=false; });

  // Game loop
  function update(dt){
    if(paused || gameOver) return;
    // Controls
    if(keys['ArrowLeft']||keys['a']){ player.vx = -MOVE_SPEED; player.facing=-1; }
    else if(keys['ArrowRight']||keys['d']){ player.vx = MOVE_SPEED; player.facing=1; }
    else player.vx = 0;
    if((keys[' ']||keys['ArrowUp']||keys['w']) && player.onGround){ player.vy = JUMP_POWER; player.onGround=false; }

    // Apply physics
    player.vy += GRAVITY;
    player.x += player.vx;
    player.y += player.vy;

    // world collisions
    collideWorld(player);
    // after collision, check ground: if touching tile below
    const below = tileAtPixel(player.x + player.w/2, player.y + player.h + 2);
    player.onGround = (below===1||below===2);

    // Entities update
    for(const ent of entities){
      if(ent.type==='enemy'){
        ent.x += ent.dir * ent.speed;
        // simple turn if hits tile
        const ahead = tileAtPixel(ent.x + (ent.dir>0? ent.w+2:-2), ent.y+ent.h-1);
        if(ahead===1||ahead===2) ent.dir*=-1;
        // collide with player?
        if(rectsOverlap({x:player.x,y:player.y,w:player.w,h:player.h}, {x:ent.x,y:ent.y,w:ent.w,h:ent.h} )){
          // if player is falling onto enemy, kill enemy else hurt player
          if(player.vy>0 && player.y+player.h - ent.y < 18){
            // kill enemy by stomping
            ent.dead = true; score += 5; // 5 points per stomp
            player.vy = JUMP_POWER/2; // small bounce
          } else {
            hurtPlayer();
          }
        }
      }
      if(ent.type==='star' && !ent.collected){
        if(rectsOverlap({x:player.x,y:player.y,w:player.w,h:player.h}, {x:ent.x-ent.w/2,y:ent.y-ent.h/2,w:ent.w,h:ent.h})){
          ent.collected=true; score += 500; showCuriosity();
        }
      }
      if(ent.type==='mushroom'){
        // simple pickup
        if(rectsOverlap({x:player.x,y:player.y,w:player.w,h:player.h}, {x:ent.x-ent.w/2,y:ent.y-ent.h/2,w:ent.w,h:ent.h})){
          // grow player
          ent.collected = true;
          // increase scale up to 4x
          player.scale = Math.min(4, (player.scale || 1) + 1);
          player.w = player.baseW * player.scale; player.h = player.baseH * player.scale;
          // if reached size 4, schedule a shrink later by spawning a 'shrink' star after some time
          if(player.scale>=4){
            // create a 'shrink' mushroom somewhere ahead
            entities.push({ type:'shrink', x: (player.x + 8*TILE), y: player.y - 100, w:20, h:20 });
          }
        }
      }
      if(ent.type==='shrink'){
        if(rectsOverlap({x:player.x,y:player.y,w:player.w,h:player.h}, {x:ent.x-ent.w/2,y:ent.y-ent.h/2,w:ent.w,h:ent.h})){
          ent.collected = true;
          player.scale = 1; player.w = player.baseW; player.h = player.baseH;
        }
      }
      if(ent.type==='platform'){
        ent.baseY = ent.baseY || ent.y; ent.dir = ent.dir || 1;
        ent.y += ent.dir * ent.speed;
        if(Math.abs(ent.y - ent.baseY) > ent.rangeY) ent.dir *= -1;
        // if player stands on platform, move with it
        if(player.y+player.h <= ent.y+4 && player.y+player.h >= ent.y-8 && player.x+player.w>ent.x && player.x<ent.x+ent.w){
          player.y += ent.dir * ent.speed; player.onGround=true; player.vy=0;
        }
      }
    }
    // cleanup dead enemies
    entities = entities.filter(e=>!e.dead);

    // camera follows player
    cameraX = Math.max(0, player.x - width/3);
  }

  // Curiosity modal
  let curiosityTimeout = 0;
  function showCuriosity(){
    curiosityTimeout = 180; // frames to show
    const text = curiosidades[Math.floor(Math.random()*curiosidades.length)];
    // store temporarily on player
    player.curiosityText = text;
  }

  // Drawing
  function draw(){
    ctx.fillStyle = '#7ec0ee'; ctx.fillRect(0,0,width,height);
    // sky clouds
    ctx.fillStyle='#fff'; ctx.globalAlpha=0.6;
    for(let i=0;i<5;i++) ctx.fillRect((i*158 - (cameraX*0.2 % 800)), 40 + (i%2)*20, 60,20);
    ctx.globalAlpha=1;

    // draw tiles
    const raw = levels[levelIndex];
    const tiles = raw.tilesNumeric;
    if(tiles){
    // HUD: timer (countdown)
    const timeLeft = Math.max(0, Math.ceil(levelTimeLimit - levelTimer));
    ctx.fillText('Time: ' + timeLeft + 's', 10, 40);
      for(let y=0;y<raw.heightTiles;y++){
        for(let x=0;x<raw.widthTiles;x++){
          const t = tiles[y][x];
          const px = x*TILE - cameraX;
          const py = y*TILE;
          if(t===1 || t===2){
            ctx.fillStyle = '#8d6e63'; ctx.fillRect(px,py,TILE,TILE);
            ctx.fillStyle='#5d4037'; ctx.fillRect(px+4,py+4,TILE-8,TILE-8);
          }
          if(t==='B'){
            ctx.fillStyle='#ffb74d'; ctx.fillRect(px,py,TILE,TILE);
            ctx.fillStyle='#ff8a65'; ctx.fillRect(px+6,py+6,TILE-12,TILE-12);
          }
          if(t===5){ ctx.fillStyle='#ff1744'; ctx.fillRect(px,py,TILE,TILE); }
        }
      }
    }

    // draw entities
    for(const ent of entities){
      const ex = ent.x - cameraX;
      if(ent.type==='enemy'){
        ctx.fillStyle='#b71c1c'; ctx.fillRect(ex, ent.y, ent.w, ent.h);
        ctx.fillStyle='#000'; ctx.fillRect(ex+6, ent.y+8, 4,4);
      }
      if(ent.type==='star' && !ent.collected){
        ctx.fillStyle='#ffea00'; ctx.beginPath(); ctx.moveTo(ex+10, ent.y-10); ctx.lineTo(ex+20, ent.y+6); ctx.lineTo(ex, ent.y-2); ctx.fill();
      }
      if(ent.type==='mushroom' && !ent.collected){
        const mx = ent.x - cameraX - ent.w/2; const my = ent.y - ent.h/2;
        ctx.fillStyle='#ff3d00'; ctx.fillRect(mx, my, ent.w, ent.h);
      }
      if(ent.type==='shrink' && !ent.collected){
        const sx = ent.x - cameraX - ent.w/2; const sy = ent.y - ent.h/2;
        ctx.fillStyle='#00e676'; ctx.fillRect(sx, sy, ent.w, ent.h);
      }
      if(ent.type==='platform'){
        ctx.fillStyle='#6d4c41'; ctx.fillRect(ex, ent.y, ent.w, ent.h);
      }
    }

  // player draw (apply scale)
  player.w = player.baseW * (player.scale || 1);
  player.h = player.baseH * (player.scale || 1);
  ctx.save();
  ctx.translate(player.x - cameraX + player.w/2, player.y + player.h/2);
  if(player.facing<0) ctx.scale(-1,1);
  // body
  ctx.fillStyle='#d32f2f'; ctx.fillRect(-player.w/2+4, -player.h/2+8, player.w-8, player.h-16);
  // head
  ctx.fillStyle='#ffd6a5'; ctx.fillRect(-player.w/2+6, -player.h/2+2, player.w-12, 12);
  // cap
  ctx.fillStyle='#b71c1c'; ctx.fillRect(-player.w/2+2, -player.h/2, player.w-4, 8);
  ctx.restore();

    // HUD
    ctx.fillStyle='#000'; ctx.font='18px Arial'; ctx.fillText(`Score: ${score}`, 12, 24);
    ctx.fillText(`Lives: ${lives}`, 12, 48);
    ctx.fillText(`Level: ${levels[levelIndex].name}`, 12, 72);

    // curiosity
    if(curiosityTimeout>0 && player.curiosityText){
      ctx.fillStyle='rgba(0,0,0,0.7)'; ctx.fillRect(width/2-260, height/2-60, 520, 120);
      ctx.fillStyle='#fff'; ctx.font='18px Arial'; wrapText(ctx, player.curiosityText, width/2, height/2, 480, 24);
      curiosityTimeout--; if(curiosityTimeout===0) player.curiosityText=null;
    }

    if(paused){ ctx.fillStyle='rgba(0,0,0,0.5)'; ctx.fillRect(0,0,width,height); ctx.fillStyle='#fff'; ctx.font='28px Arial'; ctx.fillText('PAUSA', width/2-40, height/2); }
    if(gameOver){ ctx.fillStyle='rgba(0,0,0,0.6)'; ctx.fillRect(0,0,width,height); ctx.fillStyle='#fff'; ctx.font='28px Arial'; ctx.fillText('GAME OVER - Pulsa ESPACIO para reiniciar', width/2-260, height/2); }
  }

  function wrapText(ctx, text, x, y, maxWidth, lineHeight){
    const words = text.split(' ');
    let line=''; let testY=y-24;
    for(let n=0;n<words.length;n++){
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if(testWidth > maxWidth && n>0){
        ctx.fillText(line, x - maxWidth/2 + 10, testY);
        line = words[n] + ' ';
        testY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x - maxWidth/2 + 10, testY);
  }

  // Main loop
  let lastTime = 0;
  function loop(ts){
    if(!lastTime) lastTime = ts; const dt = (ts - lastTime)/16.666; lastTime = ts;
    update(dt);
    draw();
    requestAnimationFrame(loop);
  }

  // Start/stop
  function start(canvasEl){
    canvas = canvasEl; ctx = canvas.getContext('2d'); width = canvas.width = CANVAS_W; height = canvas.height = CANVAS_H;
    loadLevel(0);
    requestAnimationFrame(loop);
    // controls: space to jump, +/- speed not necessary here but keep p to pause
    window.addEventListener('keydown', function onKey(e){
      if(e.key===' ' && gameOver){ loadLevel(0); }
    });
  }

  // register to global loader used by index.html
  window.registerGame = function registerGame(){
    const canvasEl = document.getElementById('gameCanvas');
    start(canvasEl);
    return function cleanup(){ /* remove listeners if needed */ };
  };

})();