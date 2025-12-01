function registerGame(){
// Nave exploradora - Juego educativo de planetas
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let af = null;

// Estado principal
let nave = { x: canvas.width / 2, y: canvas.height - 60, w: 30, h: 40, speed: 5 };
let teclas = {};
let planetas = [];
let orbes = [];
let mensajes = [];  // Array para efectos de partículas
let score = 0;
let highScore = Number(localStorage.getItem('naveHighScore')||0);
let highName = localStorage.getItem('naveHighScoreName')||'-';
const playerName = localStorage.getItem('playerName')||'';
let infoActual = null;
let mostrarInstrucciones = true;
let nivel = 1;
let maxNivel = 5;
let metaOrbes = 5; // orbes necesarios por nivel
let orbesNivel = 0; // contador independiente de orbes en el nivel actual

const datosPlanetas = [
  { 
    nombre: 'Mercurio', 
    color: '#BFB9AB', 
    datos: [
      'El más cercano al Sol y el más rápido.',
      'Su superficie está llena de cráteres como una luna.',
      'Un día en Mercurio dura 59 días terrestres.',
      'Es el planeta más pequeño del sistema solar.',
      'Tiene una temperatura extrema: muy caliente y muy frío.',
      'No tiene atmósfera significativa para protegerlo.',
      'Rota muy lentamente pero orbita muy rápido.',
      'Desde Mercurio, el Sol parece tres veces más grande.',
      'Fue explorado por la sonda MESSENGER de la NASA.',
      'Su núcleo metálico ocupa casi toda su estructura.'
    ]
  },
  { 
    nombre: 'Venus', 
    color: '#E8CA9A', 
    datos: [
      'Tiene una atmósfera muy densa y caliente.',
      'Es el planeta más caliente aunque no el más cercano al Sol.',
      'Gira en sentido contrario a la mayoría de planetas.',
      'Un día en Venus es más largo que su año.',
      'Está cubierto permanentemente por nubes de ácido sulfúrico.',
      'Es conocido como el gemelo de la Tierra por su tamaño similar.',
      'Su presión atmosférica es 90 veces mayor que la terrestre.',
      'No tiene satélites naturales.',
      'Brilla intensamente en nuestro cielo al amanecer o anochecer.',
      'Su superficie está llena de volcanes y llanuras de lava.'
    ]
  },
  { 
    nombre: 'Tierra', 
    color: '#3282B8', 
    datos: [
      'Nuestro hogar, único con vida conocida.',
      'El 71% de su superficie está cubierta por agua líquida.',
      'Su atmósfera contiene oxígeno que permite la vida.',
      'Es el único planeta con placas tectónicas activas.',
      'Tiene un potente campo magnético que nos protege.',
      'Es el planeta más denso del sistema solar.',
      'Su única luna estabiliza su eje de rotación.',
      'Tiene cuatro capas principales: corteza, manto, núcleo externo y núcleo interno.',
      'Es el único planeta cuyo nombre no proviene de la mitología.',
      'Desde el espacio se ve azul debido a sus océanos.'
    ]
  },
  { 
    nombre: 'Marte', 
    color: '#CD6133', 
    datos: [
      'Conocido como el planeta rojo por su óxido de hierro.',
      'Tiene el monte más alto del sistema solar: Olympus Mons.',
      'Posee dos pequeñas lunas: Fobos y Deimos.',
      'Sus días duran aproximadamente lo mismo que en la Tierra.',
      'Tiene estaciones debido a la inclinación de su eje.',
      'Muestra evidencias de que tuvo agua líquida en el pasado.',
      'Sus polos están cubiertos de hielo de agua y dióxido de carbono.',
      'Tiene la mayor tormenta de polvo conocida del sistema solar.',
      'Es el planeta más explorado por misiones robóticas.',
      'Su gravedad es aproximadamente un tercio de la terrestre.'
    ]
  },
  { 
    nombre: 'Júpiter', 
    color: '#E6C98C', 
    datos: [
      'El más grande, con una gran tormenta llamada Gran Mancha Roja.',
      'Tiene al menos 79 lunas conocidas.',
      'Es un gigante gaseoso sin superficie sólida.',
      'Su día es el más corto: solo 10 horas terrestres.',
      'Tiene un débil sistema de anillos casi invisible.',
      'Su atmósfera está compuesta principalmente de hidrógeno y helio.',
      'Su masa es 318 veces la de la Tierra.',
      'Su campo magnético es el más potente de todos los planetas.',
      'Protege al sistema solar interior atrayendo asteroides.',
      'Emite más energía de la que recibe del Sol.'
    ]
  },
  { 
    nombre: 'Saturno', 
    color: '#F7EABC', 
    datos: [
      'Famoso por sus espectaculares anillos de hielo y roca.',
      'Es el segundo planeta más grande del sistema solar.',
      'Es tan poco denso que flotaría en agua si existiera un océano lo suficientemente grande.',
      'Sus anillos se extienden hasta 282.000 km desde el planeta.',
      'Tiene al menos 82 lunas, incluyendo Titán, con atmósfera densa.',
      'Sus vientos pueden alcanzar los 1.800 km/h.',
      'Un año en Saturno equivale a 29 años terrestres.',
      'Sus anillos son extremadamente finos: apenas 10 metros de grosor.',
      'Tiene hexágonos atmosféricos misteriosos en sus polos.',
      'Fue visitado de cerca por las sondas Voyager y Cassini.'
    ]
  },
  { 
    nombre: 'Urano', 
    color: '#9AD4D6', 
    datos: [
      'Gira casi tumbado de lado debido a una antigua colisión.',
      'Es el primer planeta descubierto con telescopio.',
      'Tiene anillos oscuros casi invisibles desde la Tierra.',
      'Su atmósfera contiene metano que le da su color azul verdoso.',
      'Sus estaciones duran 21 años terrestres cada una.',
      'Tiene 27 lunas conocidas, nombradas por personajes literarios.',
      'Es un gigante helado compuesto principalmente de agua, metano y amoníaco.',
      'Su temperatura mínima es la más baja entre los planetas: -224°C.',
      'Fue visitado una sola vez por la sonda Voyager 2 en 1986.',
      'Un día en Urano dura aproximadamente 17 horas terrestres.'
    ]
  },
  { 
    nombre: 'Neptuno', 
    color: '#5151D3', 
    datos: [
      'El más distante, muy ventoso con ráfagas de 2.100 km/h.',
      'Fue descubierto mediante cálculos matemáticos antes de ser visto.',
      'Tiene 14 lunas conocidas, siendo Tritón la más grande.',
      'Tritón orbita en dirección opuesta a la rotación de Neptuno.',
      'Presenta manchas oscuras similares a huracanes que aparecen y desaparecen.',
      'Un año neptuniano equivale a 165 años terrestres.',
      'Es ligeramente más pequeño pero más masivo que Urano.',
      'Su color azul intenso se debe al metano en su atmósfera.',
      'Tiene anillos tenues y fragmentados.',
      'Fue visitado por la sonda Voyager 2 en 1989.'
    ]
  }
];

function crearPlanetas() {
  planetas = [];
  const usados = new Set();
  for (let i = 0; i < 3; i++) {
    let idx;
    do { idx = Math.floor(Math.random() * datosPlanetas.length); } while (usados.has(idx));
    usados.add(idx);
    const datoAleatorio = datosPlanetas[idx].datos[Math.floor(Math.random() * datosPlanetas[idx].datos.length)];
    planetas.push({
      x: 60 + Math.random() * (canvas.width - 120),
      y: 60 + Math.random() * (canvas.height / 2),
      r: 25 + Math.random() * 15,
      nombre: datosPlanetas[idx].nombre,
      dato: datoAleatorio,
      color: datosPlanetas[idx].color,
      descubierto: false
    });
  }
}

function crearOrbe() {
  orbes.push({ x: 30 + Math.random() * (canvas.width - 60), y: -20, r: 8, dy: 2 + Math.random() * 2 });
}

function drawNave() {
  ctx.save();
  ctx.translate(nave.x, nave.y);
  
  // Sombra de la nave
  ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 5;
  
  // Cuerpo principal del cohete
  const gradient = ctx.createLinearGradient(-nave.w/2, -nave.h/2, nave.w/2, nave.h/2);
  gradient.addColorStop(0, '#f5f5f5');
  gradient.addColorStop(0.5, '#90caf9');
  gradient.addColorStop(1, '#5d99c6');
  
  // Forma mejorada del cohete
  ctx.beginPath();
  // Punta del cohete
  ctx.moveTo(0, -nave.h/2);
  // Cuerpo principal (más estilizado)
  ctx.bezierCurveTo(
    nave.w/2.5, -nave.h/3,
    nave.w/2, -nave.h/8,
    nave.w/2, nave.h/6
  );
  ctx.lineTo(nave.w/2, nave.h/3);
  // Base del cohete
  ctx.lineTo(nave.w/2.2, nave.h/2);
  ctx.lineTo(-nave.w/2.2, nave.h/2);
  ctx.lineTo(-nave.w/2, nave.h/3);
  ctx.lineTo(-nave.w/2, nave.h/6);
  ctx.bezierCurveTo(
    -nave.w/2, -nave.h/8,
    -nave.w/2.5, -nave.h/3,
    0, -nave.h/2
  );
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.fill();
  
  // Ventana de la nave
  ctx.beginPath();
  ctx.arc(0, -nave.h/8, nave.w/5, 0, Math.PI * 2);
  ctx.fillStyle = '#c2e8ff';
  ctx.fill();
  ctx.strokeStyle = '#1565c0';
  ctx.lineWidth = 2;
  ctx.stroke();
  
  // Brillo en la ventana
  ctx.beginPath();
  ctx.arc(-nave.w/15, -nave.h/8 - nave.w/15, nave.w/12, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.fill();
  
  // Detalles de la nave (aletas laterales)
  ctx.beginPath();
  ctx.moveTo(nave.w/2.2, nave.h/3);
  ctx.lineTo(nave.w/1.5, nave.h/2.5);
  ctx.lineTo(nave.w/1.8, nave.h/1.5);
  ctx.lineTo(nave.w/2.2, nave.h/2);
  ctx.closePath();
  ctx.fillStyle = '#1565c0';
  ctx.fill();
  
  ctx.beginPath();
  ctx.moveTo(-nave.w/2.2, nave.h/3);
  ctx.lineTo(-nave.w/1.5, nave.h/2.5);
  ctx.lineTo(-nave.w/1.8, nave.h/1.5);
  ctx.lineTo(-nave.w/2.2, nave.h/2);
  ctx.closePath();
  ctx.fillStyle = '#1565c0';
  ctx.fill();
  
  // Franja decorativa
  ctx.beginPath();
  ctx.moveTo(-nave.w/3, -nave.h/4);
  ctx.lineTo(nave.w/3, -nave.h/4);
  ctx.lineTo(nave.w/3, -nave.h/4 + 5);
  ctx.lineTo(-nave.w/3, -nave.h/4 + 5);
  ctx.closePath();
  ctx.fillStyle = '#f50057';
  ctx.fill();
  
  // Fuego del motor cuando se pulsa teclas de movimiento
  if (teclas['ArrowUp'] || teclas['ArrowLeft'] || teclas['ArrowRight']) {
    // Fuego principal
    const fireGradient = ctx.createLinearGradient(0, nave.h/2, 0, nave.h/2 + 25);
    fireGradient.addColorStop(0, '#ff9800');
    fireGradient.addColorStop(0.5, '#ff5722');
    fireGradient.addColorStop(1, 'rgba(255, 87, 34, 0)');
    
    ctx.beginPath();
    // Fuego ondulante (más dinámico)
    const time = Date.now() / 100;
    ctx.moveTo(-nave.w/4, nave.h/2);
    
    // Fuego ondulado con matemática sinusoidal
    for (let i = -nave.w/4; i <= nave.w/4; i += nave.w/12) {
      const height = nave.h/2 + 15 + Math.sin((i + time) / 5) * 5;
      ctx.lineTo(i, height);
    }
    
    ctx.lineTo(nave.w/4, nave.h/2);
    ctx.closePath();
    ctx.fillStyle = fireGradient;
    ctx.fill();
    
    // Brillo interior del fuego
    const innerFireGradient = ctx.createLinearGradient(0, nave.h/2, 0, nave.h/2 + 15);
    innerFireGradient.addColorStop(0, '#ffeb3b');
    innerFireGradient.addColorStop(1, 'rgba(255, 235, 59, 0)');
    
    ctx.beginPath();
    ctx.moveTo(-nave.w/8, nave.h/2);
    
    // Fuego interior más pequeño
    for (let i = -nave.w/8; i <= nave.w/8; i += nave.w/16) {
      const height = nave.h/2 + 10 + Math.sin((i + time + 2) / 4) * 3;
      ctx.lineTo(i, height);
    }
    
    ctx.lineTo(nave.w/8, nave.h/2);
    ctx.closePath();
    ctx.fillStyle = innerFireGradient;
    ctx.fill();
    
    // Pequeñas partículas de fuego
    for (let i = 0; i < 3; i++) {
      const offsetX = (Math.random() - 0.5) * nave.w/2;
      const offsetY = nave.h/2 + 5 + Math.random() * 15;
      const size = 1 + Math.random() * 2;
      
      ctx.beginPath();
      ctx.arc(offsetX, offsetY, size, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, ' + (0.7 - offsetY / 30) + ')';
      ctx.fill();
    }
  }
  
  // Quitar la sombra para el resto de elementos
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  
  ctx.restore();
}

function drawPlanetas() {
  for (let p of planetas) {
    // Crear un gradiente radial para dar profundidad al planeta
    const gradient = ctx.createRadialGradient(
      p.x - p.r/3, p.y - p.r/3, 0,
      p.x, p.y, p.r
    );
    
    if (p.descubierto) {
      // Planeta descubierto: usar su color real con un brillo
      gradient.addColorStop(0, lightenColor(p.color, 40));
      gradient.addColorStop(0.7, p.color);
      gradient.addColorStop(1, darkenColor(p.color, 30));
      
      // Dibujar aura alrededor del planeta descubierto
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r + 5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.fill();
    } else {
      // Planeta no descubierto: marrón/gris misterioso
      gradient.addColorStop(0, '#8d6e63');
      gradient.addColorStop(0.7, '#6d4c41');
      gradient.addColorStop(1, '#4e342e');
    }
    
    // Dibujar el planeta con el gradiente
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Para planetas descubiertos, agregar características según el planeta
    if (p.descubierto) {
      // Características especiales según el planeta
      if (p.nombre === 'Saturno') {
        // Anillos para Saturno
        ctx.beginPath();
        ctx.ellipse(p.x, p.y, p.r * 1.8, p.r * 0.5, 0, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 231, 186, 0.8)';
        ctx.lineWidth = 3;
        ctx.stroke();
      } else if (p.nombre === 'Júpiter') {
        // Bandas para Júpiter
        for (let i = -3; i <= 3; i+=2) {
          ctx.beginPath();
          ctx.ellipse(p.x, p.y + i * p.r/10, p.r * 0.85, p.r/10, 0, 0, Math.PI * 2);
          ctx.fillStyle = i % 4 === 0 ? '#D1A566' : '#E6C98C';
          ctx.fill();
        }
      } else if (p.nombre === 'Marte') {
        // Casquetes polares para Marte
        ctx.beginPath();
        ctx.ellipse(p.x, p.y - p.r * 0.7, p.r * 0.3, p.r * 0.2, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fill();
      }
      
      // Nombre del planeta
      ctx.font = 'bold 13px Arial';
      ctx.fillStyle = '#fff';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 3;
      ctx.textAlign = 'center';
      ctx.strokeText(p.nombre, p.x, p.y - p.r - 10);
      ctx.fillText(p.nombre, p.x, p.y - p.r - 10);
    }
  }
}

// Funciones de ayuda para aclarar y oscurecer colores
function lightenColor(color, percent) {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return '#' + (
    0x1000000 + 
    (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 + 
    (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 + 
    (B < 255 ? (B < 1 ? 0 : B) : 255)
  ).toString(16).slice(1);
}

function darkenColor(color, percent) {
  return lightenColor(color, -percent);
}

function drawOrbes() {
  ctx.fillStyle = '#7e57c2';
  for (let o of orbes) {
    ctx.beginPath();
    ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
  }
}

function drawHUD() {
  ctx.save();
  if(window.GameUI){ GameUI.gradientBar(ctx,canvas.width,60,'#0d47a1','#1565c0'); } else { ctx.fillStyle='#0d47a1'; ctx.fillRect(0,0,canvas.width,60);} 
  ctx.font = '16px Arial';
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'left';
  ctx.fillText('Puntos: ' + score, 12, 24);
  ctx.fillText('Nivel: ' + nivel + ' / ' + maxNivel, 12, 44);
  ctx.textAlign = 'right';
  ctx.fillText('Orbes: ' + orbesNivel + ' / ' + metaOrbes, canvas.width - 12, 24);
  ctx.fillText('Récord: ' + highScore + ' ('+highName+')', canvas.width - 12, 44);
  ctx.restore();
}

function drawInfo() {
  if (!infoActual) return;
  
  ctx.save();
  
  const boxWidth = canvas.width - 100;
  const boxHeight = 100;
  const boxX = 50;
  const boxY = canvas.height - 120;
  const cornerRadius = 15;
  
  // Color de fondo basado en el planeta
  let bgColor = '#37474f'; // Color por defecto
  let borderColor = '#78909c';
  let iconEmoji = '🪐'; // Emoji por defecto
  
  // Buscar el planeta en la lista para obtener su color
  for (const planeta of planetas) {
    if (planeta.nombre === infoActual.nombre) {
      // Usar el color del planeta para el fondo
      bgColor = planeta.color;
      // Determinar un color de borde más oscuro
      borderColor = darkenColor(planeta.color, 20);
      break;
    }
  }
  
  // Emoji específico según el planeta
  switch(infoActual.nombre) {
    case 'Mercurio': iconEmoji = '☿️'; break;
    case 'Venus': iconEmoji = '♀️'; break;
    case 'Tierra': iconEmoji = '🌎'; break;
    case 'Marte': iconEmoji = '♂️'; break;
    case 'Júpiter': iconEmoji = '♃'; break;
    case 'Saturno': iconEmoji = '♄'; break;
    case 'Urano': iconEmoji = '♅'; break;
    case 'Neptuno': iconEmoji = '♆'; break;
    case '¡Completado!': iconEmoji = '🏆'; break;
  }
  
  // Dibujar el panel con esquinas redondeadas y sombra
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.shadowBlur = 15;
  ctx.shadowOffsetY = 5;
  
  // Fondo del panel con gradiente
  const gradient = ctx.createLinearGradient(boxX, boxY, boxX, boxY + boxHeight);
  gradient.addColorStop(0, lightenColor(bgColor, 10));
  gradient.addColorStop(1, darkenColor(bgColor, 10));
  
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.roundRect(boxX, boxY, boxWidth, boxHeight, cornerRadius);
  ctx.fill();
  
  // Borde del panel
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 3;
  ctx.stroke();
  
  // Quitar sombra para el texto
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  
  // Título con icono
  ctx.font = 'bold 20px Arial';
  ctx.textAlign = 'left';
  
  // Determinar el color del texto (claro u oscuro) según el color de fondo
  const isLightBg = isLightColor(bgColor);
  const textColor = isLightBg ? '#000000' : '#ffffff';
  
  ctx.fillStyle = textColor;
  ctx.fillText(`${iconEmoji} ${infoActual.nombre}`, boxX + 20, boxY + 35);
  
  // Línea divisoria
  ctx.strokeStyle = isLightBg ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(boxX + 20, boxY + 45);
  ctx.lineTo(boxX + boxWidth - 20, boxY + 45);
  ctx.stroke();
  
  // Dato del planeta
  ctx.font = '16px Arial';
  ctx.fillStyle = textColor;
  
  // Dibujar el texto con ajuste de línea
  wrapText(ctx, infoActual.dato, boxX + 20, boxY + 70, boxWidth - 40, 20);
  
  ctx.restore();
}

// Función para determinar si un color es claro (para elegir color de texto)
function isLightColor(color) {
  // Convertir el color a RGB
  const r = parseInt(color.substr(1, 2), 16);
  const g = parseInt(color.substr(3, 2), 16);
  const b = parseInt(color.substr(5, 2), 16);
  
  // Calcular la luminosidad percibida
  // Fórmula de W3C para calcular la luminosidad relativa
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Si la luminosidad es mayor a 0.5, el color es claro
  return luminance > 0.5;
}

// Función para ajustar texto a múltiples líneas
function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  let testLine = '';
  let lineCount = 0;
  
  for (let n = 0; n < words.length; n++) {
    testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    
    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line, x, y);
      line = words[n] + ' ';
      y += lineHeight;
      lineCount++;
      
      if (lineCount >= 2) {
        // Si hay más de dos líneas, agregar puntos suspensivos
        if (n < words.length - 1) {
          const lastSpace = line.lastIndexOf(' ');
          if (lastSpace !== -1) {
            line = line.substring(0, lastSpace) + '...';
          } else {
            line += '...';
          }
        }
        ctx.fillText(line, x, y);
        break;
      }
    } else {
      line = testLine;
    }
  }
  
  if (lineCount < 2) {
    ctx.fillText(line, x, y);
  }
}

function drawInstrucciones() {
  if (!mostrarInstrucciones) return;
  const x=40,y=80,w=canvas.width-80,h=160; if(window.GameUI){ GameUI.glassPanel(ctx,x,y,w,h,20);} else { ctx.save(); ctx.globalAlpha=0.92; ctx.fillStyle='#000'; ctx.fillRect(x,y,w,h); ctx.restore(); }
  ctx.save(); ctx.fillStyle='#fff'; ctx.font='bold 22px Arial'; ctx.textAlign='center'; ctx.fillText('Nave exploradora', canvas.width/2, y+36); ctx.font='14px Arial'; ctx.fillText('Flechas: mover | Arriba: acelerar | Reúne orbes', canvas.width/2, y+70); ctx.fillText('Acércate a un planeta para descubrir un dato.', canvas.width/2, y+92); ctx.fillText('Completa niveles reuniendo orbes. Pulsa tecla para empezar.', canvas.width/2, y+114); ctx.restore();
}

function update() {
  // Movimiento nave
  if (teclas['ArrowLeft'] && nave.x - nave.w/2 > 0) nave.x -= nave.speed;
  if (teclas['ArrowRight'] && nave.x + nave.w/2 < canvas.width) nave.x += nave.speed;
  if (teclas['ArrowUp'] && nave.y - nave.h/2 > 0) nave.y -= nave.speed;
  if (teclas['ArrowDown'] && nave.y + nave.h/2 < canvas.height) nave.y += nave.speed;

  // Orbes
  if (Math.random() < 0.02) crearOrbe();
  for (let o of orbes) {
    o.y += o.dy;
  }
  orbes = orbes.filter(o => o.y < canvas.height + 20);

  // Colisión orbes
  for (let i = orbes.length - 1; i >= 0; i--) {
    let o = orbes[i];
    if (Math.abs(o.x - nave.x) < 20 && Math.abs(o.y - nave.y) < 30) {
      score += 20;
      orbesNivel++;
      orbes.splice(i, 1);
    }
  }

  // Descubrir planetas
  for (let p of planetas) {
    let dx = p.x - nave.x;
    let dy = p.y - nave.y;
    let dist = Math.sqrt(dx*dx + dy*dy);
    if (dist < p.r + 30 && !p.descubierto) {
      p.descubierto = true;
      score += 30; // Puntos extra por descubrir un planeta
      
      // Efecto visual al descubrir un planeta
      for (let i = 0; i < 20; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = p.r + Math.random() * 20;
        const speed = 0.5 + Math.random() * 1.5;
        
        mensajes.push({
          x: p.x + Math.cos(angle) * distance,
          y: p.y + Math.sin(angle) * distance,
          size: 2 + Math.random() * 3,
          color: p.color,
          speedX: Math.cos(angle) * speed,
          speedY: Math.sin(angle) * speed,
          life: 40 + Math.random() * 20
        });
      }
      
      // Mostrar información sobre el planeta
      infoActual = { nombre: p.nombre, dato: p.dato };
      
      // Quitar mensaje después de un tiempo
      setTimeout(() => { 
        if (infoActual && infoActual.nombre === p.nombre) {
          infoActual = null;
        }
      }, 5000);
    }
  }
  
  // Actualizar partículas de efectos
  for (let i = mensajes.length - 1; i >= 0; i--) {
    mensajes[i].x += mensajes[i].speedX;
    mensajes[i].y += mensajes[i].speedY;
    mensajes[i].life--;
    
    if (mensajes[i].life <= 0) {
      mensajes.splice(i, 1);
    }
  }

  // Subir nivel
  if (orbesNivel >= metaOrbes) {
    nivel++;
    score += 50; // bonus
  if(score>highScore){ highScore=score; highName=playerName||'-'; localStorage.setItem('naveHighScore', String(highScore)); localStorage.setItem('naveHighScoreName', highName); }
    orbesNivel = 0;
    metaOrbes = Math.min(metaOrbes + 1, 10);
    crearPlanetas();
    if (nivel > maxNivel) {
      infoActual = { nombre: '¡Completado!', dato: 'Has explorado el mini-sistema. ¡Gran trabajo!' };
    }
  }
}

// Pre-generar estrellas con formas reales (puntas)
const estrellas = Array.from({length:60},()=>({
  x: Math.random()*canvas.width,
  y: Math.random()*canvas.height,
  r: 1+Math.random()*1.5,
  p: 5 + Math.floor(Math.random()*2),
  o: 0.5 + Math.random()*0.5
}));

function drawStar(s){
  const rot = Math.PI/2 * 3;
  let x = s.x;
  let y = s.y;
  let spikes = s.p;
  let outerRadius = s.r*2.2;
  let innerRadius = s.r;
  let angle = 0;
  ctx.beginPath();
  ctx.moveTo(x, y - outerRadius);
  for (let i=0;i<spikes;i++){
    let rx = x + Math.cos(angle) * outerRadius;
    let ry = y + Math.sin(angle) * outerRadius;
    ctx.lineTo(rx, ry);
    angle += Math.PI / spikes;
    rx = x + Math.cos(angle) * innerRadius;
    ry = y + Math.sin(angle) * innerRadius;
    ctx.lineTo(rx, ry);
    angle += Math.PI / spikes;
  }
  ctx.closePath();
  ctx.fillStyle = 'rgba(255,255,255,'+s.o+')';
  ctx.fill();
}

function drawMensajes() {
  // Dibujar partículas de efectos
  for (let m of mensajes) {
    ctx.beginPath();
    ctx.arc(m.x, m.y, m.size, 0, Math.PI * 2);
    ctx.fillStyle = m.color + Math.floor(m.life * 255 / 60).toString(16).padStart(2, '0');
    ctx.fill();
  }
}

function drawFondo() {
  ctx.save();
  ctx.fillStyle = '#000014';
  ctx.fillRect(0,0,canvas.width,canvas.height);
  estrellas.forEach(drawStar);
  ctx.restore();
}

function loop() {
  drawFondo();
  drawPlanetas();
  drawOrbes();
  drawMensajes();  // Dibujar efectos de partículas
  drawNave();
  drawHUD();
  drawInfo();
  drawInstrucciones();
  if (!mostrarInstrucciones) update();
  af = requestAnimationFrame(loop);
}

// Eventos
function keydown(e){
  if (mostrarInstrucciones) { mostrarInstrucciones = false; return; }
  teclas[e.key] = true;
}
function keyup(e){ teclas[e.key] = false; }
window.addEventListener('keydown',keydown);
window.addEventListener('keyup',keyup);

crearPlanetas();
loop();
return function cleanup(){
  if (af) cancelAnimationFrame(af);
  window.removeEventListener('keydown',keydown);
  window.removeEventListener('keyup',keyup);
};
}
window.registerGame = registerGame;
