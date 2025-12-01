function registerGame(){
// Constelaciones (unir estrellas por orden para descubrir figura / dato)
const canvas=document.getElementById('gameCanvas'); const ctx=canvas.getContext('2d'); let af=null;
canvas.width=800; canvas.height=520;
const figuras=[
 {nombre:'Orión',
  dato:'El cazador mítico tiene tres estrellas brillantes que forman su cinturón. ¡Su estrella Betelgeuse es una supergigante roja 700 veces más grande que el Sol!', 
  puntos:[[80,90],[140,160],[200,100],[260,180],[320,120],[380,200]], 
  icon:'🗡️',
  planeta: {
    nombre: 'Marte',
    color: '#ff5252',
    tamaño: 0.8,
    datos: 'El planeta rojo tiene dos lunas, Fobos y Deimos. Sus días duran 24.6 horas, ¡muy parecidos a los terrestres!'
  }
 },
 {nombre:'Osa Mayor',
  dato:'Esta constelación con forma de cazo ayuda a encontrar la estrella polar. ¡Las estrellas que la componen están a distancias entre 58 y 124 años luz de la Tierra!', 
  puntos:[[70,260],[130,240],[190,250],[250,270],[310,300],[370,320],[430,300]], 
  icon:'🐻',
  planeta: {
    nombre: 'Júpiter',
    color: '#ffb74d',
    tamaño: 1.4,
    datos: '¡El planeta más grande del sistema solar! Tiene 79 lunas conocidas y su Gran Mancha Roja es una tormenta que dura ya más de 300 años.'
  }
 },
 {nombre:'Leo',
  dato:'Esta constelación tiene forma de león y contiene la estrella Regulus, una de las más brillantes del cielo nocturno, ¡40 veces más grande que nuestro Sol!', 
  puntos:[[100,110],[160,140],[220,150],[280,130],[340,150],[400,170]], 
  icon:'🦁',
  planeta: {
    nombre: 'Venus',
    color: '#fff59d',
    tamaño: 1.0,
    datos: 'Venus gira al revés que la mayoría de planetas. Un día venusiano dura más que un año: 243 días terrestres. ¡Su atmósfera está hecha principalmente de ácido sulfúrico!'
  }
 }
];
let idx=0; let current=figuras[idx]; let progreso=0; let completadas=0; let mostrarInicio=true; let infoTimer=0; 
let transicionTimer=0; // Temporizador para cambio de nivel
let mejorCompletadas=Number(localStorage.getItem('constelMejor')||0); let mejorName=localStorage.getItem('constelMejorName')||'-'; const playerName=localStorage.getItem('playerName')||'';
// Nebulosa precomputada para fondo (no se recalculará en cada frame)
const nebulosas = [];
function generarNebulosa() {
  for (let i = 0; i < 3; i++) {
    nebulosas.push({
      x: Math.random() * canvas.width,
      y: 100 + Math.random() * (canvas.height - 200),
      radio: 50 + Math.random() * 100,
      color: ['rgba(76, 175, 80, 0.15)', 'rgba(156, 39, 176, 0.1)', 'rgba(33, 150, 243, 0.13)'][i]
    });
  }
}

// Estrellas precomputadas
const estrellasFondo = [];
function generarEstrellasFondo() {
  for (let i = 0; i < 150; i++) {
    const tamaño = Math.random() < 0.1 ? 3 : Math.random() < 0.3 ? 2 : 1;
    const brillo = Math.random() * 0.7 + 0.3;
    estrellasFondo.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      tamaño: tamaño,
      brillo: brillo,
      parpadeo: Math.random() * 0.03
    });
  }
}

// Generar elementos del fondo una sola vez
generarNebulosa();
generarEstrellasFondo();

function drawFondo(){ 
  // Fondo base con degradado más profundo
  const g = ctx.createLinearGradient(0, 0, 0, canvas.height);
  g.addColorStop(0, '#0d1a33'); // Azul espacio más profundo arriba
  g.addColorStop(0.5, '#0d004d'); // Morado oscuro en medio
  g.addColorStop(1, '#000010'); // Negro espacial abajo
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Dibujar nebulosas
  for (const nebulosa of nebulosas) {
    const grd = ctx.createRadialGradient(
      nebulosa.x, nebulosa.y, 0,
      nebulosa.x, nebulosa.y, nebulosa.radio
    );
    grd.addColorStop(0, nebulosa.color);
    grd.addColorStop(1, 'transparent');
    ctx.fillStyle = grd;
    ctx.fillRect(
      nebulosa.x - nebulosa.radio, 
      nebulosa.y - nebulosa.radio, 
      nebulosa.radio * 2, 
      nebulosa.radio * 2
    );
  }
  
  // Dibujar estrellas con efecto de parpadeo sutil
  for (const estrella of estrellasFondo) {
    // Efecto de parpadeo
    const brilloActual = estrella.brillo + Math.sin(Date.now() * 0.001 + estrella.x) * estrella.parpadeo;
    
    // Dibujar estrella según su tamaño
    if (estrella.tamaño === 1) {
      // Estrellas pequeñas: simples puntos
      ctx.fillStyle = `rgba(255, 255, 255, ${brilloActual})`;
      ctx.fillRect(estrella.x, estrella.y, 1, 1);
    } 
    else if (estrella.tamaño === 2) {
      // Estrellas medianas: círculos pequeños
      ctx.fillStyle = `rgba(255, 255, 255, ${brilloActual})`;
      ctx.beginPath();
      ctx.arc(estrella.x, estrella.y, 1, 0, Math.PI * 2);
      ctx.fill();
    }
    else {
      // Estrellas grandes: con brillo
      const grd = ctx.createRadialGradient(
        estrella.x, estrella.y, 0,
        estrella.x, estrella.y, 3
      );
      grd.addColorStop(0, `rgba(255, 255, 255, ${brilloActual})`);
      grd.addColorStop(0.5, `rgba(200, 200, 255, ${brilloActual * 0.5})`);
      grd.addColorStop(1, 'transparent');
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(estrella.x, estrella.y, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  // Algunos rayos de luz ocasionales
  if (Math.random() < 0.05) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const angle = Math.random() * Math.PI * 2;
    const length = 10 + Math.random() * 25;
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
    ctx.stroke();
  }
}
// Función para dibujar una estrella brillante
function drawStar(x, y, size, color) {
  const outerRadius = size;
  const innerRadius = size / 2;
  const spikes = 5;
  let rot = Math.PI / 2 * 3;
  let step = Math.PI / spikes;
  
  ctx.beginPath();
  ctx.moveTo(x, y - outerRadius);
  
  for (let i = 0; i < spikes; i++) {
    ctx.lineTo(x + Math.cos(rot) * outerRadius, y + Math.sin(rot) * outerRadius);
    rot += step;
    ctx.lineTo(x + Math.cos(rot) * innerRadius, y + Math.sin(rot) * innerRadius);
    rot += step;
  }
  
  ctx.closePath();
  
  // Gradiente para estrella brillante
  const grad = ctx.createRadialGradient(x, y, 0, x, y, outerRadius);
  grad.addColorStop(0, 'white');
  grad.addColorStop(0.5, color);
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = grad;
  ctx.fill();
}

// Función para dibujar un planeta con detalles
function drawPlaneta(planeta, x, y) {
  const base_size = 80;
  const size = base_size * planeta.tamaño;
  
  ctx.save();
  
  // Crear aura/atmósfera del planeta
  const atmosGrad = ctx.createRadialGradient(x, y, size * 0.8, x, y, size * 1.3);
  atmosGrad.addColorStop(0, 'rgba(255,255,255,0)');
  atmosGrad.addColorStop(0.8, 'rgba(255,255,255,0.1)');
  atmosGrad.addColorStop(1, 'rgba(255,255,255,0)');
  
  ctx.fillStyle = atmosGrad;
  ctx.beginPath();
  ctx.arc(x, y, size * 1.3, 0, Math.PI * 2);
  ctx.fill();
  
  // Dibujar planeta base
  const planetGrad = ctx.createRadialGradient(x - size * 0.3, y - size * 0.3, 0, x, y, size);
  
  if (planeta.nombre === 'Marte') {
    planetGrad.addColorStop(0, '#ff8a80');
    planetGrad.addColorStop(0.6, '#c62828');
    planetGrad.addColorStop(1, '#7f0000');
  } else if (planeta.nombre === 'Júpiter') {
    planetGrad.addColorStop(0, '#ffe082');
    planetGrad.addColorStop(0.5, '#ff8f00');
    planetGrad.addColorStop(0.7, '#e65100');
    planetGrad.addColorStop(1, '#3e2723');
  } else if (planeta.nombre === 'Venus') {
    planetGrad.addColorStop(0, '#fff9c4');
    planetGrad.addColorStop(0.4, '#fff59d');
    planetGrad.addColorStop(0.7, '#fdd835');
    planetGrad.addColorStop(1, '#f57f17');
  } else {
    planetGrad.addColorStop(0, '#e3f2fd');
    planetGrad.addColorStop(0.6, planeta.color || '#64b5f6');
    planetGrad.addColorStop(1, '#0d47a1');
  }
  
  ctx.fillStyle = planetGrad;
  ctx.beginPath();
  ctx.arc(x, y, size, 0, Math.PI * 2);
  ctx.fill();
  
  // Añadir detalles específicos según el planeta
  if (planeta.nombre === 'Marte') {
    // Casquetes polares
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.beginPath();
    ctx.arc(x, y - size * 0.8, size * 0.3, 0, Math.PI);
    ctx.fill();
    
    // Cráteres
    ctx.fillStyle = 'rgba(120, 40, 20, 0.5)';
    for (let i = 0; i < 5; i++) {
      const craterX = x - size * 0.5 + Math.random() * size;
      const craterY = y - size * 0.5 + Math.random() * size;
      const distancia = Math.sqrt(Math.pow(craterX - x, 2) + Math.pow(craterY - y, 2));
      if (distancia < size * 0.7) {
        ctx.beginPath();
        ctx.arc(craterX, craterY, 2 + Math.random() * 8, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else if (planeta.nombre === 'Júpiter') {
    // Bandas de Júpiter
    for (let i = -4; i <= 4; i++) {
      const y1 = y + i * (size / 5);
      ctx.fillStyle = i % 2 ? 'rgba(244, 143, 44, 0.6)' : 'rgba(255, 213, 79, 0.6)';
      ctx.beginPath();
      ctx.ellipse(x, y1, size * 0.95, size / 12, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Gran mancha roja
    ctx.fillStyle = 'rgba(198, 40, 40, 0.8)';
    ctx.beginPath();
    ctx.ellipse(x + size * 0.4, y - size * 0.1, size * 0.25, size * 0.15, Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();
  } else if (planeta.nombre === 'Venus') {
    // Patrón de nubes
    ctx.strokeStyle = 'rgba(255, 248, 225, 0.3)';
    ctx.lineWidth = 3;
    for (let i = 0; i < 6; i++) {
      const angle = Math.random() * Math.PI * 2;
      const len = Math.random() * size * 0.8;
      ctx.beginPath();
      ctx.arc(x + Math.cos(angle) * len * 0.3, 
              y + Math.sin(angle) * len * 0.3, 
              len * 0.4, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  
  // Añadir brillo/reflejo
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.beginPath();
  ctx.arc(x - size * 0.4, y - size * 0.4, size * 0.3, 0, Math.PI * 2);
  ctx.fill();
  
  // Nombre del planeta
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 20px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(planeta.nombre, x, y + size * 1.4);
  
  ctx.restore();
}

function drawConstelacion(){ 
  ctx.save(); 
  
  // Dibujar líneas entre estrellas con efecto brillante
  ctx.strokeStyle = '#90caf9';
  ctx.lineWidth = 2;
  ctx.shadowColor = '#4fc3f7';
  ctx.shadowBlur = 15;
  ctx.beginPath();
  for(let i=0;i<progreso;i++){ 
    const [x,y]=current.puntos[i]; 
    if(i===0) ctx.moveTo(x,y); 
    else ctx.lineTo(x,y);
  } 
  ctx.stroke();
  
  // Restablecer sombra
  ctx.shadowBlur = 0;
  
  // Dibujar estrellas con efecto brillante
  for(let i=0;i<current.puntos.length;i++){ 
    const [x,y]=current.puntos[i]; 
    
    // Aura exterior para las estrellas completadas
    if (i < progreso) {
      ctx.fillStyle = 'rgba(255, 235, 59, 0.3)';
      ctx.beginPath();
      ctx.arc(x, y, 12, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Dibujar la estrella (común o activa)
    const color = i < progreso ? '#ffd54f' : '#e3f2fd';
    const size = i === progreso ? 8 : 5;
    
    // Usar estrella brillante para las activas y completadas
    if (i <= progreso) {
      drawStar(x, y, size, color);
    } else {
      // Estrellas simples para las que faltan
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  // Si se completó la constelación, mostrar planeta y datos
  if(progreso === current.puntos.length) {
    // Mostrar icono de constelación
    ctx.font = '60px serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffca28';
    ctx.fillText(current.icon, canvas.width/2, canvas.height/2 - 100);
    
    // Mostrar planeta asociado
    if (current.planeta) {
      drawPlaneta(current.planeta, canvas.width/2, canvas.height/2 + 50);
      
      // Mostrar indicador de tiempo si estamos esperando para pasar al siguiente nivel
      if (transicionTimer > 0) {
        // Dibujar barra de progreso para indicar cuánto falta para el cambio
        ctx.save();
        
        // Texto explicativo
        ctx.font = '13px Arial';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.fillText('Pasando a la siguiente constelación...', canvas.width/2, canvas.height/2 + 140);
        
        // Botón para saltar inmediatamente
        ctx.fillStyle = 'rgba(0, 150, 136, 0.7)';
        const buttonWidth = 120;
        const buttonHeight = 30;
        const buttonX = canvas.width/2 - buttonWidth/2;
        const buttonY = canvas.height/2 + 170;
        ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 1;
        ctx.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);
        
        ctx.fillStyle = 'white';
        ctx.font = 'bold 14px Arial';
        ctx.fillText('Siguiente →', canvas.width/2, buttonY + buttonHeight/2 + 5);
        
        // Barra de progreso
        const barWidth = 200;
        const barHeight = 6;
        const barX = canvas.width/2 - barWidth/2;
        const barY = canvas.height/2 + 155;
        
        // Fondo de la barra
        ctx.fillStyle = 'rgba(50, 50, 50, 0.5)';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // Progreso (invertido: comienza lleno y se vacía)
        const progress = barWidth * (1 - transicionTimer / 15);
        ctx.fillStyle = 'rgba(100, 181, 246, 0.9)';
        ctx.fillRect(barX, barY, progress, barHeight);
        
        ctx.restore();
      }
    }
  }
  
  ctx.restore(); 
}
function drawHUD(){ 
  ctx.save(); 
  
  // Barra superior más atractiva con degradado mejorado
  if(window.GameUI){ 
    GameUI.gradientBar(ctx,canvas.width,60,'#1a237e','#283593'); 
  } else { 
    ctx.fillStyle='#1a237e'; 
    ctx.fillRect(0,0,canvas.width,60);
  }
  
  // Añadir estrellas decorativas a la barra
  for (let i = 0; i < 15; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * 50;
    const size = Math.random() * 2;
    ctx.fillStyle = 'rgba(255,255,255,'+(0.3+Math.random()*0.7)+')';
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Título con efecto de sombra
  ctx.font='bold 28px Arial'; 
  ctx.fillStyle='#fff'; 
  ctx.textAlign='center';
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 5;
  ctx.fillText('🌌 Constelaciones', canvas.width/2, 35); 
  
  // Información de la constelación
  ctx.shadowBlur = 0;
  ctx.font='bold 14px Arial'; 
  ctx.fillStyle = '#bbdefb';
  ctx.fillText('Constelación: '+current.nombre+'  ('+(idx+1)+'/'+figuras.length+')', canvas.width/2, 56); 
  
  // Información de puntuación con iconos
  ctx.textAlign='right'; 
  ctx.fillStyle = '#fff';
  ctx.fillText('✨ Completadas: '+completadas+'  🏆 Récord: '+mejorCompletadas+' ('+mejorName+')', canvas.width-12, 30); 
  
  // Instrucciones iniciales mejoradas
  ctx.textAlign='left';
  if(mostrarInicio){ 
    ctx.fillStyle = 'rgba(187, 222, 251, 0.8)';
    ctx.fillRect(10, 70, 380, 30);
    ctx.fillStyle='#1a237e';
    ctx.fillText('🔍 Haz clic en las estrellas en orden para formar la constelación', 20, 90);
  } else if (progreso === current.puntos.length && current.planeta && infoTimer > 19.5) {
    // Mostrar un mensaje flotante al completar la constelación
    ctx.fillStyle = 'rgba(255, 193, 7, 0.9)';
    ctx.fillRect(10, 70, 380, 30);
    ctx.fillStyle='#1a237e';
    ctx.fillText('🪐 Haz clic en el planeta para mantener la información visible', 20, 90);
  }
  
  // Panel de información del dato astronómico
  if(infoTimer>0){ 
    ctx.textAlign='center'; 
    
    // Fondo semitransparente para el dato
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    const textWidth = Math.min(700, canvas.width - 40);
    const textHeight = 70;
    ctx.fillRect((canvas.width - textWidth)/2, 75, textWidth, textHeight);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect((canvas.width - textWidth)/2, 75, textWidth, textHeight);
    
    // Dibujar el dato con animación de desvanecimiento
    ctx.fillStyle = 'rgba(255, 236, 179, ' + Math.min(1, infoTimer) + ')';
    ctx.font = '15px Arial';
    
    // Wrap text for long description
    const words = current.dato.split(' ');
    let line = '';
    let y = 100;
    const maxWidth = textWidth - 40;
    
    for(let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && n > 0) {
        ctx.fillText(line, canvas.width/2, y);
        line = words[n] + ' ';
        y += 20;
      }
      else {
        line = testLine;
      }
    }
    ctx.fillText(line, canvas.width/2, y);
    
    // Mostrar datos del planeta si la constelación está completada
    if (progreso === current.puntos.length && current.planeta && current.planeta.datos) {
      // Panel de datos del planeta
      ctx.fillStyle = 'rgba(13, 71, 161, 0.8)';
      const planetInfoHeight = 70;
      ctx.fillRect((canvas.width - textWidth)/2, canvas.height - planetInfoHeight - 20, textWidth, planetInfoHeight);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 1;
      ctx.strokeRect((canvas.width - textWidth)/2, canvas.height - planetInfoHeight - 20, textWidth, planetInfoHeight);
      
      // Título del planeta
      ctx.font = 'bold 16px Arial';
      ctx.fillStyle = '#ffff00';
      ctx.fillText('🪐 ' + current.planeta.nombre, canvas.width/2, canvas.height - planetInfoHeight - 0);
      
      // Añadir instrucción para indicar que se puede hacer clic para más información
      ctx.font = 'italic 13px Arial';
      ctx.fillStyle = '#81d4fa';
      ctx.fillText('(Haz clic en el planeta para mantener esta información)', canvas.width/2, canvas.height - planetInfoHeight + 60);
      
      // Datos del planeta
      ctx.font = '14px Arial';
      ctx.fillStyle = '#ffffff';
      
      // Wrap planet data text
      const planetWords = current.planeta.datos.split(' ');
      line = '';
      y = canvas.height - planetInfoHeight + 20;
      
      for(let n = 0; n < planetWords.length; n++) {
        const testLine = line + planetWords[n] + ' ';
        const metrics = ctx.measureText(testLine);
        
        if (metrics.width > maxWidth && n > 0) {
          ctx.fillText(line, canvas.width/2, y);
          line = planetWords[n] + ' ';
          y += 18;
        }
        else {
          line = testLine;
        }
      }
      ctx.fillText(line, canvas.width/2, y);
    }
  }
  
  ctx.restore(); 
}
function loop(){ 
  drawFondo(); 
  drawConstelacion(); 
  drawHUD(); 
  // Reducir el timer más lentamente para que la información permanezca más tiempo
  if(infoTimer>0) infoTimer-=0.008; // Reducido a la mitad para duplicar el tiempo de visualización 
  
  // Gestionar el temporizador de transición entre constelaciones
  if(transicionTimer>0) {
    transicionTimer-=0.01; // Decrementar lentamente
    if(transicionTimer <= 0) {
      // Cuando llega a cero, pasar a la siguiente constelación
      transicionTimer = 0;
      idx = (idx + 1) % figuras.length; 
      current = figuras[idx]; 
      progreso = 0;
    }
  }
  
  af=requestAnimationFrame(loop); 
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

// Modificar el bucle principal para incluir la velocidad
function loop() {
    drawFondo(); 
    drawConstelacion(); 
    drawHUD(); 
    // Reducir el timer más lentamente para que la información permanezca más tiempo
    if(infoTimer>0) infoTimer-=0.008; // Reducido a la mitad para duplicar el tiempo de visualización 
    
    // Gestionar el temporizador de transición entre constelaciones
    if(transicionTimer>0) {
      transicionTimer-=0.01; // Decrementar lentamente
      if(transicionTimer <= 0) {
        // Cuando llega a cero, pasar a la siguiente constelación
        transicionTimer = 0;
        idx = (idx + 1) % figuras.length; 
        current = figuras[idx]; 
        progreso = 0;
      }
    }
    
    setTimeout(() => {
        af = requestAnimationFrame(loop);
    }, 1000 / (60 * gameSpeed)); // Ajusta la velocidad del juego
}

function click(e){ 
  const rect=canvas.getBoundingClientRect(); 
  const mx=e.clientX-rect.left, my=e.clientY-rect.top; 
  mostrarInicio=false; 
  
  // Si ya completamos la constelación y hay un planeta, permitir hacer clic en él
  if (progreso === current.puntos.length && current.planeta) {
    const planetaX = canvas.width/2;
    const planetaY = canvas.height/2 + 50;
    const distancia = Math.sqrt(Math.pow(mx - planetaX, 2) + Math.pow(my - planetaY, 2));
    
    // Verificar si hicimos clic en el botón "Siguiente"
    if (transicionTimer > 0) {
      const buttonWidth = 120;
      const buttonHeight = 30;
      const buttonX = canvas.width/2 - buttonWidth/2;
      const buttonY = canvas.height/2 + 170;
      
      if (mx >= buttonX && mx <= buttonX + buttonWidth && 
          my >= buttonY && my <= buttonY + buttonHeight) {
        // Saltar inmediatamente a la siguiente constelación
        transicionTimer = 0;
        idx = (idx + 1) % figuras.length; 
        current = figuras[idx]; 
        progreso = 0;
        return;
      }
    }
    
    // Si hicimos clic en el planeta, reiniciar el timer de información y pausar la transición
    if (distancia < 80 * current.planeta.tamaño) {
      infoTimer = 20; // Mostrar info por más tiempo
      // Si ya estamos en transición, extender el tiempo
      if (transicionTimer > 0) {
        transicionTimer = 1; // Reiniciar el temporizador de transición
      }
      return;
    }
  }
  
  // Procesamiento normal de clics en estrellas
  if (progreso < current.puntos.length) {
    const [x,y]=current.puntos[progreso];
    const dx=mx-x, dy=my-y;
    
    if(dx*dx+dy*dy<14*14){
      progreso++;
      
      // Si completamos la constelación
      if(progreso === current.puntos.length){ 
        completadas++; 
        if(completadas > mejorCompletadas){ 
          mejorCompletadas = completadas; 
          mejorName = playerName || '-'; 
          localStorage.setItem('constelMejor', String(mejorCompletadas)); 
          localStorage.setItem('constelMejorName', mejorName); 
        }
        
        // Mostrar información por más tiempo cuando se completa
        infoTimer = 20; // Mayor tiempo para leer la información
        
        // Efecto de estrellas brillantes al completar
        for (let i = 0; i < current.puntos.length; i++) {
          const [starX, starY] = current.puntos[i];
          // Aquí podrías añadir un efecto visual al completar
        }
        
        // Solo iniciar el temporizador si no estaba ya activo
        if (transicionTimer <= 0) {
          // Iniciar el temporizador de transición para pasar al siguiente nivel
          transicionTimer = 1; // Valor inicial (se decrementará en loop)
        }
      }
    }
  }
}
canvas.addEventListener('click',click); loop();
return function cleanup(){ if(af) cancelAnimationFrame(af); canvas.removeEventListener('click',click); };
}
window.registerGame=registerGame;
