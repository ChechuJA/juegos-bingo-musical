window.registerGame(function() {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) return () => {};
    const ctx = canvas.getContext('2d');
    
    // Config
    const CANVAS_W = 800;
    const CANVAS_H = 500; // Matches index.html default approx
    let gameState = 'menu'; // menu, level-intro, playing, result, gameover
    let level = 1;
    let score = 0;
    let message = '';
    let messageTimer = 0;
    let animationFrameId = null;
    let mouse = { x: 0, y: 0, down: false, draggedItem: null };

    // Game Objects
    let items = [];
    let zones = [];
    let instructions = [];
    let levelTime = 0;
    let stepIndex = 0; // To track progress within level

    // Audio Context
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const actx = new AudioContext();

    function playTone(freq, type, dur) {
        if(actx.state === 'suspended') actx.resume();
        const osc = actx.createOscillator();
        const g = actx.createGain();
        osc.frequency.value = freq;
        osc.type = type;
        osc.connect(g);
        g.connect(actx.destination);
        osc.start();
        g.gain.exponentialRampToValueAtTime(0.00001, actx.currentTime + dur);
        osc.stop(actx.currentTime + dur);
    }

    // --- Input Handling ---
    function getPos(e) {
        const r = canvas.getBoundingClientRect();
        let cx = e.clientX, cy = e.clientY;
        if(e.changedTouches && e.changedTouches.length) {
            cx = e.changedTouches[0].clientX;
            cy = e.changedTouches[0].clientY;
        }
        return {
            x: (cx - r.left) * (canvas.width / r.width),
            y: (cy - r.top) * (canvas.height / r.height)
        };
    }

    function handleStart(e) {
        mouse.down = true;
        const p = getPos(e);
        mouse.x = p.x;
        mouse.y = p.y;
        
        if (gameState === 'playing') {
            // Check for drag
            // Reverse iteration to pick top items
            for(let i=items.length-1; i>=0; i--) {
                const item = items[i];
                if(item.draggable && isInside(p, item)) {
                    mouse.draggedItem = item;
                    item.isDragging = true;
                    // Move to top
                    items.splice(i, 1);
                    items.push(item);
                    playTone(300, 'sine', 0.05);
                    return; // Pick only one
                }
            }
            
            // Check for clicks on static items (buttons, tools)
             for(let i=items.length-1; i>=0; i--) {
                const item = items[i];
                if(!item.draggable && isInside(p, item) && item.onClick) {
                    item.onClick();
                    return;
                }
            }
        } else if (gameState === 'menu') {
            startGame();
        } else if (gameState === 'gameover' || gameState === 'result') {
            if(p.y > 350) startGame(); // Simple restart area
        } else if (gameState === 'level-intro') {
             startLevel();
        }
    }

    function handleMove(e) {
        const p = getPos(e);
        mouse.x = p.x;
        mouse.y = p.y;
        
        if (mouse.draggedItem) {
            mouse.draggedItem.x = p.x - mouse.draggedItem.w/2;
            mouse.draggedItem.y = p.y - mouse.draggedItem.h/2;
        }
    }

    function handleEnd(e) {
        mouse.down = false;
        if (mouse.draggedItem) {
            const item = mouse.draggedItem;
            item.isDragging = false;
            
            // Check drop zones
            let dropped = false;
            for(let z of zones) {
                if(isColliding(item, z)) {
                    if(z.onDrop && z.onDrop(item)) {
                        dropped = true;
                        playTone(600, 'sine', 0.1);
                    }
                }
            }
            
            // If not dropped in valid zone returning true, reset pos?
            // Or just leave it there. For this game, let's snap back if not processed
            if (!dropped && item.startPos) {
                 item.x = item.startPos.x;
                 item.y = item.startPos.y;
                 playTone(150, 'sawtooth', 0.1);
            }
            
            mouse.draggedItem = null;
        }
    }

    function isInside(p, rect) {
        return p.x >= rect.x && p.x <= rect.x + rect.w &&
               p.y >= rect.y && p.y <= rect.y + rect.h;
    }
    
    function isColliding(r1, r2) {
        // Center point collision for better feel
        const c1x = r1.x + r1.w/2;
        const c1y = r1.y + r1.h/2;
        return c1x >= r2.x && c1x <= r2.x + r2.w &&
               c1y >= r2.y && c1y <= r2.y + r2.h;
    }

    // --- Game Logic ---

    function startGame() {
        level = 1;
        score = 0;
        showLevelIntro();
    }
    
    function showLevelIntro() {
        gameState = 'level-intro';
    }
    
    function startLevel() {
        gameState = 'playing';
        items = [];
        zones = [];
        stepIndex = 0;
        message = '';
        
        // Define levels
        if (level === 1) setupLevel1(); // Desayuno
        else if (level === 2) setupLevel2(); // Tortilla
        else if (level === 3) setupLevel3(); // Seguridad/Limpieza
        else endGame();
    }
    
    function showMsg(txt, good=true) {
        message = txt;
        messageTimer = 2; // seconds
        if(good) score += 10;
    }

    // --- LEVEL 1: Desayuno ---
    function setupLevel1() {
        instructions = ["1. Pon pan en tostadora", "2. Espera y sácalo", "3. Pon café y leche en la taza"];
        
        // Zones
        // Toaster
        zones.push({
            x: 250, y: 150, w: 100, h: 80, label: 'Tostadora', type: 'toaster',
            onDrop: (item) => {
                if(item.name === 'pan') {
                    item.x = 260; item.y = 160; item.draggable = false;
                    item.hidden = true; // Hide inside
                    showMsg("¡Tostando!");
                    setTimeout(()=>{
                        item.hidden = false;
                        item.name = 'tostada';
                        item.emoji = '🍞';
                        item.color = '#d35400';
                        item.y = 130; // Pop up
                        item.draggable = true;
                        playTone(800, 'square', 0.2);
                        items.push({x:0,y:0,w:0,h:0, type:'dummy'}); // Force render update
                        checkLevel1Complete();
                    }, 2000);
                    return true;
                }
                return false;
            }
        });
        
        // Plate
        zones.push({
            x: 400, y: 300, w: 120, h: 120, label: 'Plato', type: 'plate',
            onDrop: (item) => {
                if(item.name === 'tostada') {
                    item.draggable = false;
                    checkLevel1Complete();
                    return true;
                }
                return false;
            }
        });
        
        // Cup
        const cup = {
            x: 550, y: 300, w: 60, h: 70, label: 'Taza', type: 'cup', hasCoffee:false, hasMilk:false,
            onDrop: (item) => {
                 if(item.name === 'cafe' && !this.hasCoffee) {
                     this.hasCoffee = true;
                     item.x = item.startPos.x; item.y = item.startPos.y; // Return pot
                     checkLevel1Complete();
                     return true;
                 }
                 if(item.name === 'leche' && !this.hasMilk) {
                     this.hasMilk = true;
                     item.x = item.startPos.x; item.y = item.startPos.y; // Return carton
                     checkLevel1Complete();
                     return true;
                 }
                 return false;
            }
        };
        // Hack to make cup behave as zone and item? 
        // Better: Cup is a static zone that changes appearance
        zones.push(cup);
        // Also add cup visual as static item
        items.push({
            x: 550, y: 300, w: 60, h: 70, emoji: '☕', name: 'cup_visual', draggable: false,
            render: (ctx, item) => {
                if(cup.hasCoffee && cup.hasMilk) { item.emoji = '☕'; item.color='#d7ccc8'; }
                else if(cup.hasCoffee) { item.emoji = '☕'; item.color='#3e2723'; }
                else { item.emoji = '☕'; item.color='#fff'; } // Empty
                
                ctx.fillStyle = item.color || '#eee';
                ctx.fillRect(item.x, item.y, item.w, item.h);
                ctx.strokeRect(item.x, item.y, item.w, item.h);
            }
        });

        // Items
        items.push({ x: 50, y: 300, w: 60, h: 60, emoji: '🥪', name: 'pan', draggable: true, startPos:{x:50,y:300} });
        items.push({ x: 50, y: 150, w: 60, h: 80, emoji: '🫖', name: 'cafe', draggable: true, startPos:{x:50,y:150}, label:'Cafetera' });
        items.push({ x: 120, y: 150, w: 50, h: 80, emoji: '🥛', name: 'leche', draggable: true, startPos:{x:120,y:150}, label:'Leche' });
    }
    
    function checkLevel1Complete() {
        const plate = zones.find(z => z.type === 'plate');
        const cupZone = zones.find(z => z.type === 'cup');
        // Check if toast is on plate (by checking item pos effectively)
        const toast = items.find(i => i.name === 'tostada');
        
        const toastDone = toast && !toast.draggable && isColliding(toast, plate);
        const coffeeDone = cupZone.hasCoffee && cupZone.hasMilk;
        
        if(toastDone && coffeeDone) {
            showMsg("¡Desayuno listo!", true);
            setTimeout(() => {
                level++;
                score += 50;
                showLevelIntro();
            }, 2000);
        }
    }

    // --- LEVEL 2: Tortilla ---
    function setupLevel2() {
        instructions = ["1. Rompe huevo en bol", "2. Bate", "3. Sartén al fuego", "4. Echa huevo, espera y voltea"];
        
        // State for this level
        let eggBroken = false;
        let eggBeaten = false;
        let frying = false;
        let cookedSide1 = false;
        let cookedSide2 = false;
        let burned = false;
        let cookingTime = 0;
        
        // Zones
        // Bowl
        const bowl = {
             x: 200, y: 300, w: 100, h: 80, label: 'Bol', type: 'bowl',
             onDrop: (item) => {
                 if(item.name === 'huevo') {
                     eggBroken = true;
                     items = items.filter(i => i !== item); // Remove egg shell
                     playTone(400, 'triangle', 0.1);
                     return true;
                 }
                 if(item.name === 'varilla') {
                     if(eggBroken && !eggBeaten) {
                         eggBeaten = true;
                         showMsg("¡Batido!", true);
                         item.x = item.startPos.x; item.y = item.startPos.y;
                         // Add liquid egg item
                         items.push({x: 220, y: 320, w: 60, h: 40, emoji: '🟡', name: 'mezcla', draggable: true, startPos:{x:220,y:320}});
                         return true;
                     }
                 }
                 return false;
             }
        };
        zones.push(bowl);
        
        // Stove
        const stove = {
            x: 450, y: 250, w: 120, h: 120, label: 'Fuego 🔥', type: 'stove',
            onDrop: (item) => {
                if(item.name === 'sarten') {
                    item.x = 460; item.y = 260; item.draggable = false;
                    item.isOnStove = true;
                    return true;
                }
                return false;
            }
        };
        zones.push(stove);
        
        // Pan Logic wrapper
        zones.push({
            x: 460, y: 260, w: 100, h: 100, label: 'SartenZone',
            onDrop: (item) => {
                const pan = items.find(i => i.name === 'sarten');
                if(!pan || !pan.isOnStove) return false;
                
                if(item.name === 'mezcla') {
                    items = items.filter(i => i !== item);
                    pan.hasEgg = true;
                    pan.cooking = true;
                    showMsg("Cocinando... Espera al verde");
                    return true;
                }
                return false;
            }
        });

        // Items
        items.push({ x: 50, y: 150, w: 50, h: 60, emoji: '🥚', name: 'huevo', draggable: true, startPos:{x:50,y:150} });
        items.push({ x: 120, y: 150, w: 40, h: 80, emoji: '🥢', name: 'varilla', draggable: true, startPos:{x:120,y:150}, label:'Batidor' });
        
        const pan = { 
            x: 50, y: 300, w: 100, h: 100, emoji: '🍳', name: 'sarten', draggable: true, startPos:{x:50,y:300},
            hasEgg: false, cooking: false, side: 1, doneness: 0,
            onClick: () => {
                if(pan.cooking) {
                    // Try to flip
                    if(pan.doneness > 50 && pan.doneness < 90) {
                        if(pan.side === 1) {
                            pan.side = 2;
                            pan.doneness = 0; // Reset for side 2
                            showMsg("¡Buen giro!", true);
                            playTone(500, 'sine', 0.2);
                        } else {
                            // Done
                            pan.date = true; // reusing prop
                            pan.cooking = false;
                            showMsg("¡Tortilla Lista!", true);
                            setTimeout(() => { level++; score+=100; showLevelIntro(); }, 2000);
                        }
                    } else if (pan.doneness >= 90) {
                        showMsg("¡Quemada! Reiniciando...", false);
                        setTimeout(setupLevel2, 1000);
                    } else {
                        showMsg("¡Muy cruda todavía!", false);
                    }
                }
            },
            update: (dt) => {
                if(pan.cooking) {
                    pan.doneness += dt * 20; // fill to 100 in 5 sec
                    // Visual feedback in draw
                }
            }
        };
        items.push(pan);
    }

    // --- LEVEL 3: Ensalada ---
    function setupLevel3() {
        instructions = ["1. Corta tomate (click 5 veces)", "2. Corta lechuga", "3. Añade aceite y sal al bol"];
        
        // Items
        items.push({ x: 50, y: 150, w: 80, h: 80, emoji: '🍅', name: 'tomate', draggable: true, startPos:{x:50,y:150}, cuts:0, sliced: false });
        items.push({ x: 150, y: 150, w: 80, h: 80, emoji: '🥬', name: 'lechuga', draggable: true, startPos:{x:150,y:150}, cuts:0, sliced: false });
        items.push({ x: 50, y: 250, w: 50, h: 80, emoji: '🫒', name: 'aceite', draggable: true, startPos:{x:50,y:250} });
        items.push({ x: 120, y: 250, w: 40, h: 60, emoji: '🧂', name: 'sal', draggable: true, startPos:{x:120,y:250} });
        
        // Knife (Tool)
        items.push({ x: 300, y: 50, w: 100, h: 40, emoji: '🔪', name: 'cuchillo', draggable: true, startPos:{x:300,y:50} });
        
        // Board logic
        zones.push({
            x: 250, y: 200, w: 200, h: 150, label: 'Tabla cortar', type: 'board',
            onDrop: (item) => {
                if (item.name === 'tomate' || item.name === 'lechuga') {
                    item.x = 300; item.y = 230; item.draggable = false; item.onBoard = true;
                    return true;
                }
                if (item.name === 'cuchillo') {
                    // Check if something is on board
                    const food = items.find(i => i.onBoard && !i.sliced);
                    if(food) {
                        food.cuts++;
                        playTone(200 + food.cuts*50, 'square', 0.05);
                        item.x = item.startPos.x; item.y = item.startPos.y; // Return knife
                        if(food.cuts >= 5) {
                            food.sliced = true;
                            food.emoji = food.name==='tomate' ? '🥗' : '🥗';
                            food.draggable = true;
                            food.onBoard = false; // Release
                            showMsg("¡Cortado!", true);
                        }
                        return true;
                    }
                }
                return false;
            }
        });
        
        // Bowl
        const saladState = { tomato:false, lettuce:false, oil:false, salt:false };
        
        zones.push({
            x: 550, y: 200, w: 150, h: 120, label: 'Ensaladera', type: 'bowl_big',
            onDrop: (item) => {
                 if(item.sliced) {
                     if(item.name==='tomate') saladState.tomato = true;
                     if(item.name==='lechuga') saladState.lettuce = true;
                     items = items.filter(i => i !== item);
                     checkSalad();
                     return true;
                 }
                 if(item.name === 'aceite') { saladState.oil = true; item.x = item.startPos.x; item.y = item.startPos.y; checkSalad(); return true; }
                 if(item.name === 'sal') { saladState.salt = true; item.x = item.startPos.x; item.y = item.startPos.y; checkSalad(); return true; }
                 return false;
            }
        });
        
        function checkSalad() {
            if(saladState.tomato && saladState.lettuce && saladState.oil && saladState.salt) {
                showMsg("¡Ensalada Perfecta!", true);
                setTimeout(endGame, 2000);
            }
        }
    }


    // --- Engine ---

    function update(dt) {
        if(messageTimer > 0) messageTimer -= dt;
        
        items.forEach(i => {
            if(i.update) i.update(dt);
        });
    }

    function draw() {
        // Clear
        ctx.fillStyle = '#f8f9fa';
        ctx.fillRect(0,0, canvas.width, canvas.height);
        
        // Header
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(0,0, canvas.width, 50);
        ctx.fillStyle = '#fff';
        ctx.font = '20px Arial';
        ctx.fillText(`Nivel: ${level}`, 20, 32);
        ctx.fillText(`Puntos: ${score}`, 680, 32);
        
        if(gameState === 'menu') {
            ctx.fillStyle = '#2c3e50';
            ctx.textAlign = 'center';
            ctx.font = '40px Arial';
            ctx.fillText('🍳 Cocina Básica', 400, 150);
            
            ctx.font = '20px Arial';
            ctx.fillText('Aprende a preparar platos sencillos', 400, 200);
            ctx.fillText('con seguridad y orden.', 400, 230);
            
            ctx.fillStyle = '#27ae60';
            ctx.fillRect(300, 300, 200, 50);
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 24px Arial';
            ctx.fillText('¡A COCINAR!', 400, 335);
            return;
        }
        
        if(gameState === 'level-intro') {
            ctx.fillStyle = '#2c3e50';
            ctx.textAlign = 'center';
            ctx.font = '30px Arial';
            let title = level===1 ? 'El Desayuno' : (level===2 ? 'Hacer Tortilla' : 'Ensalada Fresca');
            ctx.fillText(`Nivel ${level}: ${title}`, 400, 150);
            
            ctx.font = '18px Arial';
            ctx.fillStyle = '#555';
            instructions.forEach((line, i) => {
                ctx.fillText(line, 400, 220 + i*30);
            });
            
            ctx.fillStyle = '#e67e22';
            ctx.fillRect(300, 380, 200, 40);
            ctx.fillStyle = '#fff';
            ctx.fillText('COMENZAR', 400, 405);
            return;
        }
        
        if(gameState === 'playing') {
            // Draw Zones
            zones.forEach(z => {
                ctx.fillStyle = z.color || '#dfe6e9';
                ctx.strokeStyle = '#b2bec3';
                ctx.lineWidth = 2;
                if(z.type==='plate') {
                    ctx.beginPath(); ctx.arc(z.x+z.w/2, z.y+z.h/2, z.w/2, 0, Math.PI*2); ctx.fill(); ctx.stroke();
                } else {
                    ctx.fillRect(z.x, z.y, z.w, z.h);
                    ctx.strokeRect(z.x, z.y, z.w, z.h);
                }
                
                ctx.fillStyle = '#636e72';
                ctx.font = '14px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(z.label || '', z.x + z.w/2, z.y + z.h + 20);
            });
            
            // Draw Instructions small
            ctx.fillStyle = '#333';
            ctx.textAlign = 'left';
            ctx.font = '14px Arial';
            instructions.forEach((line, i) => {
                ctx.fillText(line, 20, 80 + i*20);
            });

            // Draw Items
            items.forEach(item => {
                if(item.hidden) return;
                
                if(item.render) {
                    item.render(ctx, item);
                } else {
                    // Simple Emoji render
                    ctx.font = '40px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText(item.emoji, item.x + item.w/2, item.y + item.h/1.5);
                    
                    if(item.label) {
                       ctx.font='12px Arial';
                       ctx.fillStyle='#333';
                       ctx.fillText(item.label, item.x+item.w/2, item.y-5);
                    }
                    
                    // Cooking bar for pan
                    if(item.name==='sarten' && item.cooking) {
                        ctx.fillStyle = '#eee';
                        ctx.fillRect(item.x, item.y - 10, item.w, 6);
                        
                        // Color based on doneness
                        let c = '#f1c40f';
                        if(item.doneness > 50) c = '#2ecc71'; // Good zone
                        if(item.doneness > 90) c = '#e74c3c'; // Burned
                        
                        ctx.fillStyle = c;
                        ctx.fillRect(item.x, item.y - 10, item.w * (item.doneness/100), 6);
                        
                        ctx.fillStyle = 'rgba(255,255,255,0.7)';
                        ctx.font = '12px Arial';
                        ctx.fillStyle = '#000';
                        if(item.doneness > 50 && item.doneness < 90) ctx.fillText("¡Dale vuelta!", item.x+item.w/2, item.y-20);
                    }
                    
                    // Slice logic
                    if(item.cuts > 0 && !item.sliced) {
                         ctx.fillStyle = 'red';
                         ctx.fillText(`${item.cuts}/5`, item.x+item.w/2, item.y);
                    }
                }
            });
            
            // Message
            if(messageTimer > 0) {
                ctx.fillStyle = 'rgba(0,0,0,0.7)';
                ctx.fillRect(200, 200, 400, 60);
                ctx.fillStyle = '#fff';
                ctx.textAlign = 'center';
                ctx.font = '24px Arial';
                ctx.fillText(message, 400, 240);
            }
        }
        
        if (gameState === 'result') {
            ctx.fillStyle = '#2c3e50';
            ctx.textAlign = 'center';
            ctx.font = '40px Arial';
            ctx.fillText('¡Clase de Cocina Completada!', 400, 150);
            
            ctx.font = '80px Arial';
            ctx.fillStyle = '#27ae60';
            ctx.fillText(score, 400, 250);
             
            ctx.font = '20px Arial';
            ctx.fillStyle = '#7f8c8d';
            ctx.fillText('Recuerda: Seguridad e Higiene son lo primero.', 400, 300);
            
            ctx.fillStyle = '#3498db';
            ctx.fillRect(300, 350, 200, 50);
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 24px Arial';
            ctx.fillText('VOLVER A JUGAR', 400, 383);
        }
    }

    function loop(timer) {
        const dt = (timer - lastTime) / 1000;
        lastTime = timer;
        
        if(gameState === 'playing') update(dt);
        draw();
        
        animationFrameId = requestAnimationFrame(loop);
    }
    
    function endGame() {
        gameState = 'result';
        const best = parseInt(localStorage.getItem('cocinaBasicaBest') || '0');
        if(score > best) {
            localStorage.setItem('cocinaBasicaBest', score);
            const n = localStorage.getItem('playerName');
            if(n) localStorage.setItem('cocinaBasicaBestName', n);
        }
    }
    
    let lastTime = 0;
    
    // Listeners
    canvas.addEventListener('mousedown', handleStart);
    canvas.addEventListener('mousemove', handleMove);
    canvas.addEventListener('mouseup', handleEnd);
    canvas.addEventListener('touchstart', (e)=>{e.preventDefault(); handleStart(e);}, {passive:false});
    canvas.addEventListener('touchmove', (e)=>{e.preventDefault(); handleMove(e);}, {passive:false});
    canvas.addEventListener('touchend', (e)=>{e.preventDefault(); handleEnd(e);}, {passive:false});
    
    loop(0);
    
    return function cleanup() {
        if(animationFrameId) cancelAnimationFrame(animationFrameId);
        canvas.removeEventListener('mousedown', handleStart);
        canvas.removeEventListener('mousemove', handleMove);
        canvas.removeEventListener('mouseup', handleEnd);
        canvas.removeEventListener('touchstart', handleStart);
        canvas.removeEventListener('touchmove', handleMove);
        canvas.removeEventListener('touchend', handleEnd);
        if(actx) actx.close();
    };
});
