function registerGame() {
// ============================================
// JUEGO EDUCATIVO: APRENDE FONTANERÍA 🚰
// ============================================
// Aprende a montar tuberías sin fugas
// Conecta tuberías, llaves de paso, grifos y desagües
// 3 niveles: Lavabo simple, Fregadero con sifón, Baño completo

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 900;
canvas.height = 600;

// ============================================
// DEFINICIONES DE COMPONENTES
// ============================================
const COMPONENTES = {
  // Fuentes de agua
  ENTRADA_FRIA: {
    name: 'Entrada agua fría',
    emoji: '🔵',
    color: '#1976d2',
    description: 'Tubería principal',
    width: 40,
    height: 40,
    conexiones: ['derecha']
  },
  ENTRADA_CALIENTE: {
    name: 'Entrada agua caliente',
    emoji: '🔴',
    color: '#d32f2f',
    description: 'Tubería caliente',
    width: 40,
    height: 40,
    conexiones: ['derecha']
  },
  
  // Tuberías
  TUBO_RECTO_H: {
    name: 'Tubo recto',
    emoji: '━',
    color: '#757575',
    description: 'Tubo horizontal',
    width: 80,
    height: 20,
    conexiones: ['izquierda', 'derecha'],
    rotable: true
  },
  TUBO_RECTO_V: {
    name: 'Tubo recto',
    emoji: '┃',
    color: '#757575',
    description: 'Tubo vertical',
    width: 20,
    height: 80,
    conexiones: ['arriba', 'abajo'],
    rotable: true
  },
  CODO_90: {
    name: 'Codo 90°',
    emoji: '└',
    color: '#757575',
    description: 'Cambio dirección',
    width: 40,
    height: 40,
    conexiones: ['arriba', 'derecha'],
    rotable: true
  },
  T_JUNTA: {
    name: 'T junta',
    emoji: '┬',
    color: '#757575',
    description: 'División',
    width: 40,
    height: 40,
    conexiones: ['izquierda', 'derecha', 'abajo'],
    rotable: true
  },
  
  // Válvulas
  LLAVE_PASO: {
    name: 'Llave de paso',
    emoji: '🔧',
    color: '#ff9800',
    description: 'Cierre general',
    width: 50,
    height: 30,
    conexiones: ['izquierda', 'derecha'],
    clickable: true
  },
  
  // Destinos
  GRIFO: {
    name: 'Grifo',
    emoji: '🚰',
    color: '#607d8b',
    description: 'Salida agua',
    width: 40,
    height: 50,
    conexiones: ['izquierda']
  },
  GRIFO_MEZCLADOR: {
    name: 'Grifo mezclador',
    emoji: '🚿',
    color: '#607d8b',
    description: 'Fría + Caliente',
    width: 60,
    height: 60,
    conexiones: ['izquierda-arriba', 'izquierda-abajo']
  },
  DUCHA: {
    name: 'Ducha',
    emoji: '🚿',
    color: '#00acc1',
    description: 'Alcachofa',
    width: 50,
    height: 60,
    conexiones: ['abajo']
  },
  
  // Desagües
  DESAGUE: {
    name: 'Desagüe',
    emoji: '⬇️',
    color: '#424242',
    description: 'Salida residuos',
    width: 40,
    height: 40,
    conexiones: ['arriba']
  },
  SIFON: {
    name: 'Sifón',
    emoji: '🔄',
    color: '#616161',
    description: 'Evita olores',
    width: 50,
    height: 60,
    conexiones: ['arriba', 'abajo']
  }
};

// ============================================
// NIVELES
// ============================================
const NIVELES = [
  {
    name: 'Lavabo Simple',
    description: 'Conecta agua fría desde la entrada hasta el grifo',
    tiempo: 90,
    elementos_fijos: [
      { tipo: 'ENTRADA_FRIA', x: 50, y: 200, fixed: true },
      { tipo: 'GRIFO', x: 750, y: 200, fixed: true },
      { tipo: 'DESAGUE', x: 750, y: 350, fixed: true }
    ],
    componentes_disponibles: [
      'TUBO_RECTO_H',
      'TUBO_RECTO_V',
      'CODO_90',
      'LLAVE_PASO'
    ],
    objetivos: [
      'Conecta la entrada de agua al grifo',
      'Coloca una llave de paso en el camino',
      'El agua debe poder fluir sin fugas',
      'Conecta el desagüe bajo el grifo'
    ],
    validacion: {
      debe_tener_llave: true,
      debe_llegar_agua: true,
      debe_tener_desague: true
    },
    education: `
🚰 LAVABO BÁSICO

💧 ENTRADA DE AGUA
- Viene de la red general (calle)
- Siempre llega por la pared
- Presión: 2-4 bares

🔧 LLAVE DE PASO
- Cierra el agua en caso de fuga
- ¡OBLIGATORIA por normativa!
- Accesible y fácil de usar

🚿 GRIFO
- Controla el caudal
- Abre/cierra el flujo
- Tiene aireador (ahorra agua)

⬇️ DESAGÜE
- Evacua agua usada
- Va conectado a la red de saneamiento
- Debe tener pendiente para que fluya

📌 TIP: La tubería debe ser continua sin huecos
    `
  },
  {
    name: 'Fregadero con Sifón',
    description: 'Instala agua fría + caliente con mezclador y sifón',
    tiempo: 120,
    elementos_fijos: [
      { tipo: 'ENTRADA_FRIA', x: 50, y: 150, fixed: true },
      { tipo: 'ENTRADA_CALIENTE', x: 50, y: 250, fixed: true },
      { tipo: 'GRIFO_MEZCLADOR', x: 750, y: 200, fixed: true },
      { tipo: 'DESAGUE', x: 750, y: 500, fixed: true }
    ],
    componentes_disponibles: [
      'TUBO_RECTO_H',
      'TUBO_RECTO_V',
      'CODO_90',
      'T_JUNTA',
      'LLAVE_PASO',
      'SIFON'
    ],
    objetivos: [
      'Conecta agua FRÍA y CALIENTE al mezclador',
      'Cada entrada debe tener su llave de paso',
      'Coloca el SIFÓN entre grifo y desagüe',
      'Sin fugas en las conexiones'
    ],
    validacion: {
      debe_tener_llaves: 2,
      debe_tener_sifon: true,
      ambas_entradas_conectadas: true
    },
    education: `
🚿 FREGADERO CON MEZCLADOR

❄️🔥 DOS ENTRADAS
- Azul = Fría (derecha)
- Roja = Caliente (izquierda)
- ¡No las confundas!

🔧 DOS LLAVES DE PASO
- Una por cada entrada
- Cierran independiente
- Normativa CTE obligatoria

🔄 SIFÓN: El Gran Olvidado
¿Por qué existe?
- Retiene agua en forma de U
- El agua atrapada bloquea gases
- Sin sifón → olores de alcantarilla 🤢

💡 TIPOS DE SIFÓN:
- Botella (más común)
- Curva (el de este juego)
- Individual (lavabos)

⚠️ ERRORES COMUNES:
❌ No poner sifón → Malos olores
❌ Instalar al revés → No retiene agua
❌ Sin registro → No se puede limpiar

📌 DATO: Un sifón bien instalado dura 20+ años
    `
  },
  {
    name: 'Baño Completo',
    description: 'Monta lavabo + ducha con todas las conexiones',
    tiempo: 180,
    elementos_fijos: [
      { tipo: 'ENTRADA_FRIA', x: 50, y: 120, fixed: true },
      { tipo: 'ENTRADA_CALIENTE', x: 50, y: 200, fixed: true },
      { tipo: 'GRIFO_MEZCLADOR', x: 350, y: 450, fixed: true, label: 'Lavabo' },
      { tipo: 'DUCHA', x: 750, y: 100, fixed: true },
      { tipo: 'DESAGUE', x: 350, y: 550, fixed: true, label: 'Desagüe lavabo' },
      { tipo: 'DESAGUE', x: 750, y: 500, fixed: true, label: 'Desagüe ducha' }
    ],
    componentes_disponibles: [
      'TUBO_RECTO_H',
      'TUBO_RECTO_V',
      'CODO_90',
      'T_JUNTA',
      'LLAVE_PASO',
      'SIFON'
    ],
    objetivos: [
      'Conecta agua fría y caliente a LAVABO y DUCHA',
      'Usa T juntas para dividir el agua',
      '4 llaves de paso (una por toma)',
      '2 sifones (lavabo y ducha)',
      'Todos los desagües conectados'
    ],
    validacion: {
      debe_tener_llaves: 4,
      debe_tener_sifones: 2,
      dos_destinos_agua: true
    },
    education: `
🛁 BAÑO COMPLETO - INSTALACIÓN REAL

🔀 DERIVACIONES (T Juntas)
- Dividen una tubería en dos
- Permite alimentar varios puntos
- Mantienen presión uniforme

📐 DISEÑO TÍPICO:
Entrada → T → Lavabo
         ↓
        Ducha

🔧 LLAVES DE PASO (x4)
1️⃣ Fría lavabo
2️⃣ Caliente lavabo
3️⃣ Fría ducha
4️⃣ Caliente ducha

¿Por qué tantas?
→ Mantenimiento sin cortar todo el baño

🔄 SIFONES (x2)
- Lavabo: Sifón botella con registro
- Ducha: Sifón bajo plato (invisible)

💰 COSTE REAL:
- Tubos de cobre: 8-12€/metro
- Tubos PVC: 2-4€/metro
- Sifón: 10-25€
- Grifería: 40-300€

⚠️ ERRORES DE NOVATO:
❌ Olvidar llave de paso
❌ Mezclar fría-caliente
❌ Presión insuficiente (tubo muy fino)
❌ Sin pendiente en desagüe

✅ NORMATIVA CTE:
- Llave de paso obligatoria
- Materiales homologados
- Protección antigolpe de ariete
- Aislamiento tuberías calientes

🎓 Después de esto, ¡estás listo para una instalación real!
(Pero contrata a un profesional para la primera 😉)
    `
  }
];

// ============================================
// ESTADO DEL JUEGO
// ============================================
let gameState = 'menu'; // 'menu', 'playing', 'testing', 'resultado', 'education'
let currentLevel = 0;
let score = 0;
let tiempoRestante = 0;
let elementosColocados = [];
let toolbarComponents = [];
let componenteDragging = null;
let offsetX = 0, offsetY = 0;
let lastTime = Date.now();
let showingEducation = true;
let showingSolution = true;
let waterFlow = [];
let showingWater = false;
let testResult = null;

let bestScore = Number(localStorage.getItem('fontaneriaBest')) || 0;
let bestName = localStorage.getItem('fontaneriaBestName') || 'Anónimo';

// ============================================
// ÁREAS
// ============================================
const AREAS = {
  toolbar: { x: 10, y: 100, w: 180, h: 480 },
  workspace: { x: 210, y: 100, w: 680, h: 480 },
  topBar: { x: 0, y: 0, w: 900, h: 90 }
};

// ============================================
// UTILIDADES
// ============================================
function getMousePos(e) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };
}

function isInsideRect(x, y, rx, ry, rw, rh) {
  return x >= rx && x <= rx + rw && y >= ry && y <= ry + rh;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  let yPos = y;
  
  for(const word of words) {
    const testLine = line + word + ' ';
    const metrics = ctx.measureText(testLine);
    
    if(metrics.width > maxWidth && line !== '') {
      ctx.fillText(line, x, yPos);
      line = word + ' ';
      yPos += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, yPos);
}

function snapToGrid(x, y) {
  const gridSize = 40;
  return {
    x: Math.round(x / gridSize) * gridSize,
    y: Math.round(y / gridSize) * gridSize
  };
}

// ============================================
// INICIALIZACIÓN
// ============================================
function initLevel(levelIndex) {
  currentLevel = levelIndex;
  const nivel = NIVELES[levelIndex];
  
  gameState = 'playing';
  score = 0;
  tiempoRestante = nivel.tiempo;
  showingEducation = true;
  showingSolution = true;
  showingWater = false;
  testResult = null;
  
  elementosColocados = [];
  waterFlow = [];
  
  // Elementos fijos
  if(nivel.elementos_fijos) {
    nivel.elementos_fijos.forEach(elem => {
      elementosColocados.push({
        tipo: elem.tipo,
        x: elem.x,
        y: elem.y,
        fixed: true,
        label: elem.label,
        id: Math.random(),
        abierto: true // Para llaves de paso
      });
    });
  }
  
  // Toolbar
  toolbarComponents = nivel.componentes_disponibles.map((tipo, i) => ({
    tipo,
    toolbarIndex: i
  }));
  
  lastTime = Date.now();
}

// ============================================
// DIBUJO: MENÚ
// ============================================
function drawMenu() {
  // Fondo
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, '#0277bd');
  gradient.addColorStop(1, '#01579b');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Título
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 48px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('🚰 Aprende Fontanería', canvas.width/2, 70);
  
  ctx.font = '18px Arial';
  ctx.fillText('Conecta tuberías sin fugas', canvas.width/2, 105);
  
  // Info
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  roundRect(ctx, 100, 140, canvas.width - 200, 110, 12);
  ctx.fill();
  
  ctx.fillStyle = '#fff';
  ctx.font = '15px Arial';
  ctx.textAlign = 'left';
  const info = [
    '🔧 Aprende a instalar tuberías como un profesional',
    '💧 Conecta entradas, grifos y desagües sin fugas',
    '🔄 Descubre qué es un sifón y por qué es importante',
    '⏱️ Contra reloj - Completa antes de quedarte sin tiempo',
    '🏆 Record: ' + bestScore + ' puntos'
  ];
  
  info.forEach((line, i) => {
    ctx.fillText(line, 120, 175 + i * 22);
  });
  
  // Botones niveles
  ctx.textAlign = 'center';
  const startY = 280;
  
  NIVELES.forEach((nivel, i) => {
    const y = startY + i * 85;
    const colors = ['#4caf50', '#ff9800', '#f44336'];
    
    ctx.fillStyle = colors[i];
    roundRect(ctx, canvas.width/2 - 220, y, 440, 70, 10);
    ctx.fill();
    
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 24px Arial';
    ctx.fillText(`Nivel ${i + 1}: ${nivel.name}`, canvas.width/2, y + 28);
    
    ctx.font = '14px Arial';
    ctx.fillText(nivel.description, canvas.width/2, y + 52);
  });
  
  // Volver
  ctx.fillStyle = '#fff';
  ctx.font = '16px Arial';
  ctx.fillText('← Volver al menú principal', canvas.width/2, 565);
}

// ============================================
// DIBUJO: JUEGO
// ============================================
function drawGame() {
  // Fondo workspace
  ctx.fillStyle = '#e3f2fd';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Grid
  ctx.strokeStyle = 'rgba(0,0,0,0.05)';
  ctx.lineWidth = 1;
  for(let x = AREAS.workspace.x; x < AREAS.workspace.x + AREAS.workspace.w; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, AREAS.workspace.y);
    ctx.lineTo(x, AREAS.workspace.y + AREAS.workspace.h);
    ctx.stroke();
  }
  for(let y = AREAS.workspace.y; y < AREAS.workspace.y + AREAS.workspace.h; y += 40) {
    ctx.beginPath();
    ctx.moveTo(AREAS.workspace.x, y);
    ctx.lineTo(AREAS.workspace.x + AREAS.workspace.w, y);
    ctx.stroke();
  }
  
  drawTopBar();
  drawToolbar();
  drawWorkspace();
  
  if(showingWater) {
    drawWaterFlow();
  }
  
  if(testResult) {
    drawTestResult();
  }
}

function drawTopBar() {
  ctx.fillStyle = 'rgba(1,87,155,0.95)';
  ctx.fillRect(0, 0, canvas.width, AREAS.topBar.h);
  
  // Nivel
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 20px Arial';
  ctx.textAlign = 'left';
  ctx.fillText(`Nivel ${currentLevel + 1}: ${NIVELES[currentLevel].name}`, 20, 30);
  
  // Tiempo
  const mins = Math.floor(tiempoRestante / 60);
  const secs = Math.floor(tiempoRestante % 60);
  ctx.font = 'bold 26px Arial';
  ctx.fillStyle = tiempoRestante < 20 ? '#ff5252' : '#fff';
  ctx.fillText(`⏱️ ${mins}:${secs.toString().padStart(2, '0')}`, 20, 65);
  
  // Score
  ctx.textAlign = 'center';
  ctx.fillStyle = '#FFD700';
  ctx.font = 'bold 28px Arial';
  ctx.fillText(`⭐ ${score}`, canvas.width/2, 50);
  
  // Botones
  ctx.textAlign = 'right';
  
  // Botón probar
  ctx.fillStyle = gameState === 'testing' ? '#66bb6a' : '#4caf50';
  roundRect(ctx, canvas.width - 350, 15, 160, 60, 8);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 18px Arial';
  ctx.fillText('🔧 Probar', canvas.width - 270, 35);
  ctx.fillText('Instalación', canvas.width - 270, 60);
  
  // Botón solución
  ctx.fillStyle = '#2196f3';
  roundRect(ctx, canvas.width - 180, 15, 160, 60, 8);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.fillText('💡 Ver', canvas.width - 100, 35);
  ctx.fillText('Solución', canvas.width - 100, 60);
}

function drawToolbar() {
  // Fondo
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  roundRect(ctx, AREAS.toolbar.x, AREAS.toolbar.y, AREAS.toolbar.w, AREAS.toolbar.h, 10);
  ctx.fill();
  
  ctx.strokeStyle = '#01579b';
  ctx.lineWidth = 2;
  ctx.stroke();
  
  // Título
  ctx.fillStyle = '#01579b';
  ctx.font = 'bold 16px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('📦 Componentes', AREAS.toolbar.x + AREAS.toolbar.w/2, AREAS.toolbar.y + 25);
  
  // Componentes
  const itemH = 70;
  const startY = AREAS.toolbar.y + 40;
  
  toolbarComponents.forEach((comp, i) => {
    const def = COMPONENTES[comp.tipo];
    const y = startY + i * itemH;
    const x = AREAS.toolbar.x + 10;
    const w = AREAS.toolbar.w - 20;
    
    // Fondo
    ctx.fillStyle = 'rgba(33,150,243,0.1)';
    roundRect(ctx, x, y, w, itemH - 5, 8);
    ctx.fill();
    
    ctx.strokeStyle = '#2196f3';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Emoji
    ctx.font = '32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(def.emoji, x + 35, y + 40);
    
    // Nombre
    ctx.font = 'bold 13px Arial';
    ctx.fillStyle = '#333';
    ctx.textAlign = 'left';
    ctx.fillText(def.name, x + 60, y + 25);
    
    ctx.font = '11px Arial';
    ctx.fillStyle = '#666';
    ctx.fillText(def.description, x + 60, y + 42);
    
    // Disponible ilimitado
    ctx.font = '10px Arial';
    ctx.fillStyle = '#4caf50';
    ctx.fillText('∞', x + w - 15, y + 35);
  });
}

function drawWorkspace() {
  // Borde workspace
  ctx.strokeStyle = '#01579b';
  ctx.lineWidth = 3;
  ctx.strokeRect(AREAS.workspace.x, AREAS.workspace.y, AREAS.workspace.w, AREAS.workspace.h);
  
  // Elementos colocados
  elementosColocados.forEach(elem => {
    drawComponente(elem);
  });
  
  // Componente siendo arrastrado
  if(componenteDragging && !componenteDragging.fixed) {
    drawComponente(componenteDragging, true);
  }
}

function drawComponente(elem, dragging = false) {
  const def = COMPONENTES[elem.tipo];
  const x = elem.x - def.width/2;
  const y = elem.y - def.height/2;
  
  ctx.save();
  
  // Sombra si arrastrando
  if(dragging) {
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;
  }
  
  // Fondo
  if(elem.fixed) {
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
  } else {
    ctx.fillStyle = dragging ? 'rgba(255,255,255,0.95)' : '#fff';
  }
  
  roundRect(ctx, x, y, def.width, def.height, 8);
  ctx.fill();
  
  // Borde
  if(elem.fixed) {
    ctx.strokeStyle = '#f44336';
    ctx.lineWidth = 3;
    ctx.setLineDash([5, 3]);
  } else {
    ctx.strokeStyle = dragging ? def.color : '#bdbdbd';
    ctx.lineWidth = 2;
    ctx.setLineDash([]);
  }
  ctx.stroke();
  ctx.setLineDash([]);
  
  // Emoji
  ctx.font = '28px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = def.color;
  ctx.fillText(def.emoji, elem.x, elem.y);
  
  // Label si fixed
  if(elem.fixed && elem.label) {
    ctx.font = 'bold 11px Arial';
    ctx.fillStyle = '#f44336';
    ctx.fillText(elem.label, elem.x, elem.y + def.height/2 + 15);
  }
  
  // Llave cerrada/abierta
  if(def.clickable && elem.tipo === 'LLAVE_PASO') {
    ctx.font = '14px Arial';
    ctx.fillStyle = elem.abierto ? '#4caf50' : '#f44336';
    ctx.fillText(elem.abierto ? '✓' : '✗', elem.x + def.width/2 - 8, elem.y - def.height/2 - 5);
  }
  
  ctx.restore();
}

function drawWaterFlow() {
  waterFlow.forEach((particle, i) => {
    ctx.save();
    ctx.globalAlpha = 0.7;
    
    const gradient = ctx.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, 8);
    gradient.addColorStop(0, particle.caliente ? '#ff6b6b' : '#4fc3f7');
    gradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, 8, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
    
    // Actualizar posición
    particle.life -= 0.02;
    particle.y += particle.vy;
    particle.x += particle.vx;
    
    if(particle.life <= 0) {
      waterFlow.splice(i, 1);
    }
  });
}

function drawTestResult() {
  ctx.save();
  
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  const panelW = 500;
  const panelH = 300;
  const panelX = (canvas.width - panelW) / 2;
  const panelY = (canvas.height - panelH) / 2;
  
  ctx.fillStyle = '#fff';
  roundRect(ctx, panelX, panelY, panelW, panelH, 15);
  ctx.fill();
  
  ctx.strokeStyle = testResult.exito ? '#4caf50' : '#f44336';
  ctx.lineWidth = 4;
  ctx.stroke();
  
  // Título
  ctx.fillStyle = testResult.exito ? '#4caf50' : '#f44336';
  ctx.font = 'bold 32px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(testResult.titulo, canvas.width/2, panelY + 50);
  
  // Mensajes
  ctx.fillStyle = '#333';
  ctx.font = '16px Arial';
  let y = panelY + 100;
  
  testResult.mensajes.forEach(msg => {
    const icon = msg.includes('✓') ? '✓' : msg.includes('✗') ? '✗' : '•';
    ctx.fillStyle = icon === '✓' ? '#4caf50' : icon === '✗' ? '#f44336' : '#666';
    ctx.fillText(msg, canvas.width/2, y);
    y += 30;
  });
  
  // Botones
  const btnY = panelY + panelH - 70;
  
  if(testResult.exito) {
    // Continuar
    ctx.fillStyle = '#4caf50';
    roundRect(ctx, canvas.width/2 - 100, btnY, 200, 50, 8);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 20px Arial';
    ctx.fillText('🎉 Continuar', canvas.width/2, btnY + 32);
  } else {
    // Reintentar
    ctx.fillStyle = '#ff9800';
    roundRect(ctx, canvas.width/2 - 100, btnY, 200, 50, 8);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 20px Arial';
    ctx.fillText('🔄 Reintentar', canvas.width/2, btnY + 32);
  }
  
  ctx.restore();
}

// ============================================
// DIBUJO: SOLUCIÓN
// ============================================
function drawSolutionDiagram() {
  const nivel = NIVELES[currentLevel];
  
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.9)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  const panelW = 750;
  const panelH = 530;
  const panelX = (canvas.width - panelW) / 2;
  const panelY = (canvas.height - panelH) / 2;
  
  ctx.fillStyle = '#fff';
  roundRect(ctx, panelX, panelY, panelW, panelH, 15);
  ctx.fill();
  
  ctx.strokeStyle = '#0277bd';
  ctx.lineWidth = 3;
  ctx.stroke();
  
  // Título
  ctx.fillStyle = '#0277bd';
  ctx.font = 'bold 28px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(`🚰 ${nivel.name}`, canvas.width/2, panelY + 40);
  
  ctx.font = '15px Arial';
  ctx.fillStyle = '#666';
  ctx.fillText(nivel.description, canvas.width/2, panelY + 65);
  
  // Objetivos
  ctx.fillStyle = '#333';
  ctx.font = 'bold 18px Arial';
  ctx.textAlign = 'left';
  ctx.fillText('🎯 Objetivos:', panelX + 40, panelY + 110);
  
  ctx.font = '14px Arial';
  let y = panelY + 140;
  nivel.objetivos.forEach(obj => {
    ctx.fillText('• ' + obj, panelX + 50, y);
    y += 25;
  });
  
  // Diagrama esquemático simple
  y += 20;
  ctx.fillStyle = '#0277bd';
  ctx.font = 'bold 16px Arial';
  ctx.fillText('📐 Esquema:', panelX + 40, y);
  
  y += 30;
  const diagramX = panelX + 60;
  
  if(currentLevel === 0) {
    // Lavabo simple
    ctx.font = '20px Arial';
    ctx.fillText('🔵 ━━━ 🔧 ━━━ 🚰', diagramX, y);
    ctx.fillStyle = '#666';
    ctx.font = '12px Arial';
    ctx.fillText('Entrada → Llave → Grifo', diagramX, y + 20);
    y += 50;
    ctx.fillText('⬇️ Desagüe debajo', diagramX, y);
  }
  else if(currentLevel === 1) {
    // Fregadero
    ctx.font = '18px Arial';
    ctx.fillText('❄️ 🔵 ━ 🔧 ━┐', diagramX, y);
    ctx.fillText('                  ├━ 🚿', diagramX, y + 30);
    ctx.fillText('🔥 🔴 ━ 🔧 ━┘', diagramX, y + 60);
    y += 90;
    ctx.fillStyle = '#666';
    ctx.font = '12px Arial';
    ctx.fillText('🔄 SIFÓN → ⬇️ Desagüe', diagramX, y);
  }
  else {
    // Baño completo
    ctx.font = '16px Arial';
    ctx.fillText('🔵 ━ 🔧 ━┬━ 🚰 (Lavabo)', diagramX, y);
    ctx.fillText('           ├━ 🚿 (Ducha)', diagramX, y + 25);
    ctx.fillText('🔴 ━ 🔧 ━┤', diagramX, y + 50);
    y += 70;
    ctx.fillStyle = '#666';
    ctx.font = '12px Arial';
    ctx.fillText('Cada salida con sifón y desagüe', diagramX, y);
  }
  
  // Botón
  const btnY = panelY + panelH - 60;
  ctx.fillStyle = '#0277bd';
  roundRect(ctx, canvas.width/2 - 120, btnY, 240, 45, 8);
  ctx.fill();
  
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 20px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('¡Entendido!', canvas.width/2, btnY + 30);
  
  ctx.restore();
}

// ============================================
// DIBUJO: EDUCACIÓN
// ============================================
function drawEducationScreen() {
  const nivel = NIVELES[currentLevel];
  
  ctx.save();
  ctx.fillStyle = 'rgba(1,87,155,0.95)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  const panelW = 700;
  const panelH = 520;
  const panelX = (canvas.width - panelW) / 2;
  const panelY = (canvas.height - panelH) / 2;
  
  ctx.fillStyle = '#fff';
  roundRect(ctx, panelX, panelY, panelW, panelH, 15);
  ctx.fill();
  
  ctx.fillStyle = '#0277bd';
  ctx.font = 'bold 26px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(`✅ ¡Nivel ${currentLevel + 1} Completado!`, canvas.width/2, panelY + 40);
  
  // Educación
  ctx.fillStyle = '#333';
  ctx.font = '15px Arial';
  ctx.textAlign = 'left';
  const lines = nivel.education.trim().split('\n');
  let y = panelY + 80;
  
  for(const line of lines) {
    const trimmed = line.trim();
    if(!trimmed) {
      y += 8;
      continue;
    }
    
    if(trimmed.includes('🚰') || trimmed.includes('🚿') || trimmed.includes('🛁')) {
      ctx.font = 'bold 18px Arial';
      ctx.fillStyle = '#0277bd';
    } else if(trimmed.includes('💧') || trimmed.includes('❄️🔥') || trimmed.includes('🔀')) {
      ctx.font = 'bold 16px Arial';
      ctx.fillStyle = '#01579b';
    } else if(trimmed.startsWith('-') || trimmed.startsWith('•')) {
      ctx.font = '13px Arial';
      ctx.fillStyle = '#555';
    } else if(trimmed.includes('⚠️') || trimmed.includes('❌')) {
      ctx.font = 'bold 14px Arial';
      ctx.fillStyle = '#f44336';
    } else if(trimmed.includes('✅')) {
      ctx.font = 'bold 14px Arial';
      ctx.fillStyle = '#4caf50';
    } else {
      ctx.font = '14px Arial';
      ctx.fillStyle = '#666';
    }
    
    wrapText(ctx, trimmed, panelX + 40, y, panelW - 80, 20);
    y += trimmed.startsWith('-') ? 18 : 22;
  }
  
  // Botón
  const btnY = panelY + panelH - 60;
  
  if(currentLevel < NIVELES.length - 1) {
    ctx.fillStyle = '#4caf50';
    roundRect(ctx, canvas.width/2 - 100, btnY, 200, 45, 8);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('➡️ Siguiente nivel', canvas.width/2, btnY + 28);
  } else {
    ctx.fillStyle = '#0277bd';
    roundRect(ctx, canvas.width/2 - 100, btnY, 200, 45, 8);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🏠 Volver al menú', canvas.width/2, btnY + 28);
  }
  
  ctx.restore();
}

// ============================================
// LÓGICA: VALIDACIÓN
// ============================================
function probarInstalacion() {
  const nivel = NIVELES[currentLevel];
  const validacion = nivel.validacion;
  let mensajes = [];
  let exito = true;
  
  // Contar llaves de paso
  const llaves = elementosColocados.filter(e => e.tipo === 'LLAVE_PASO');
  if(validacion.debe_tener_llave && llaves.length === 0) {
    mensajes.push('✗ Falta llave de paso');
    exito = false;
  } else if(validacion.debe_tener_llaves && llaves.length < validacion.debe_tener_llaves) {
    mensajes.push(`✗ Faltan llaves (${llaves.length}/${validacion.debe_tener_llaves})`);
    exito = false;
  } else if(llaves.length > 0) {
    mensajes.push(`✓ Llaves de paso: ${llaves.length}`);
  }
  
  // Contar sifones
  const sifones = elementosColocados.filter(e => e.tipo === 'SIFON');
  if(validacion.debe_tener_sifon && sifones.length === 0) {
    mensajes.push('✗ Falta sifón');
    exito = false;
  } else if(validacion.debe_tener_sifones && sifones.length < validacion.debe_tener_sifones) {
    mensajes.push(`✗ Faltan sifones (${sifones.length}/${validacion.debe_tener_sifones})`);
    exito = false;
  } else if(sifones.length > 0) {
    mensajes.push(`✓ Sifones instalados: ${sifones.length}`);
  }
  
  // Verificar componentes mínimos colocados
  const componentesUsuario = elementosColocados.filter(e => !e.fixed);
  if(componentesUsuario.length < 3) {
    mensajes.push('✗ Coloca más componentes');
    exito = false;
  } else {
    mensajes.push(`✓ ${componentesUsuario.length} componentes`);
  }
  
  // Simular flujo de agua
  if(exito) {
    showingWater = true;
    generarParticulasAgua();
    
    setTimeout(() => {
      showingWater = false;
      waterFlow = [];
    }, 3000);
  }
  
  testResult = {
    exito,
    titulo: exito ? '🎉 ¡Sin Fugas!' : '💧 Hay fugas...',
    mensajes
  };
  
  if(exito) {
    const bonus = Math.floor(tiempoRestante * 10);
    score += 100 + bonus;
    
    if(score > bestScore) {
      bestScore = score;
      localStorage.setItem('fontaneriaBest', score);
      const playerName = localStorage.getItem('playerName') || 'Anónimo';
      localStorage.setItem('fontaneriaBestName', playerName);
    }
  }
  
  gameState = 'testing';
}

function generarParticulasAgua() {
  const entradas = elementosColocados.filter(e => 
    e.tipo === 'ENTRADA_FRIA' || e.tipo === 'ENTRADA_CALIENTE'
  );
  
  setInterval(() => {
    if(!showingWater) return;
    
    entradas.forEach(entrada => {
      for(let i = 0; i < 3; i++) {
        waterFlow.push({
          x: entrada.x + 20,
          y: entrada.y,
          vx: Math.random() * 2 - 1,
          vy: Math.random() * 2 + 1,
          life: 1,
          caliente: entrada.tipo === 'ENTRADA_CALIENTE'
        });
      }
    });
  }, 100);
}

// ============================================
// ACTUALIZACIÓN
// ============================================
function update() {
  if(gameState === 'playing' && !showingEducation && !showingSolution) {
    const now = Date.now();
    const delta = (now - lastTime) / 1000;
    lastTime = now;
    
    tiempoRestante -= delta;
    
    if(tiempoRestante <= 0) {
      tiempoRestante = 0;
      testResult = {
        exito: false,
        titulo: '⏰ Tiempo agotado',
        mensajes: ['Se acabó el tiempo', 'Intenta ser más rápido']
      };
      gameState = 'testing';
    }
  }
}

// ============================================
// EVENTOS
// ============================================
function handleClick(e) {
  const pos = getMousePos(e);
  
  // Solución
  if(showingSolution) {
    const panelW = 750;
    const panelH = 530;
    const panelX = (canvas.width - panelW) / 2;
    const panelY = (canvas.height - panelH) / 2;
    const btnY = panelY + panelH - 60;
    
    if(isInsideRect(pos.x, pos.y, canvas.width/2 - 120, btnY, 240, 45)) {
      showingSolution = false;
      return;
    }
    return;
  }
  
  // Educación
  if(showingEducation) {
    const panelW = 700;
    const panelH = 520;
    const panelX = (canvas.width - panelW) / 2;
    const panelY = (canvas.height - panelH) / 2;
    const btnY = panelY + panelH - 60;
    
    if(isInsideRect(pos.x, pos.y, canvas.width/2 - 100, btnY, 200, 45)) {
      if(currentLevel < NIVELES.length - 1) {
        initLevel(currentLevel + 1);
      } else {
        gameState = 'menu';
      }
    }
    return;
  }
  
  if(gameState === 'menu') {
    const startY = 280;
    NIVELES.forEach((nivel, i) => {
      const y = startY + i * 85;
      if(isInsideRect(pos.x, pos.y, canvas.width/2 - 220, y, 440, 70)) {
        initLevel(i);
      }
    });
    
    if(isInsideRect(pos.x, pos.y, canvas.width/2 - 120, 565, 240, 20)) {
      if(window.GameUI && window.GameUI.returnToMenu) {
        window.GameUI.returnToMenu();
      }
    }
  }
  else if(gameState === 'playing') {
    // Botón probar
    if(isInsideRect(pos.x, pos.y, canvas.width - 350, 15, 160, 60)) {
      probarInstalacion();
      return;
    }
    
    // Botón solución
    if(isInsideRect(pos.x, pos.y, canvas.width - 180, 15, 160, 60)) {
      showingSolution = true;
      return;
    }
  }
  else if(gameState === 'testing') {
    const panelW = 500;
    const panelH = 300;
    const panelX = (canvas.width - panelW) / 2;
    const panelY = (canvas.height - panelH) / 2;
    const btnY = panelY + panelH - 70;
    
    if(isInsideRect(pos.x, pos.y, canvas.width/2 - 100, btnY, 200, 50)) {
      if(testResult.exito) {
        showingEducation = true;
        gameState = 'playing';
        testResult = null;
      } else {
        initLevel(currentLevel);
      }
    }
  }
}

function handleMouseDown(e) {
  if(gameState !== 'playing' || showingEducation || showingSolution) return;
  
  const pos = getMousePos(e);
  
  // Toolbar
  if(isInsideRect(pos.x, pos.y, AREAS.toolbar.x, AREAS.toolbar.y, AREAS.toolbar.w, AREAS.toolbar.h)) {
    const itemH = 70;
    const startY = AREAS.toolbar.y + 40;
    
    toolbarComponents.forEach((comp, i) => {
      const y = startY + i * itemH;
      if(pos.y >= y && pos.y <= y + itemH) {
        // Crear nuevo componente
        componenteDragging = {
          tipo: comp.tipo,
          x: pos.x,
          y: pos.y,
          id: Math.random(),
          abierto: true
        };
        offsetX = 0;
        offsetY = 0;
      }
    });
  }
  
  // Workspace - mover componente existente
  if(!componenteDragging && isInsideRect(pos.x, pos.y, AREAS.workspace.x, AREAS.workspace.y, AREAS.workspace.w, AREAS.workspace.h)) {
    for(let i = elementosColocados.length - 1; i >= 0; i--) {
      const elem = elementosColocados[i];
      if(elem.fixed) continue;
      
      const def = COMPONENTES[elem.tipo];
      const ex = elem.x - def.width/2;
      const ey = elem.y - def.height/2;
      
      if(isInsideRect(pos.x, pos.y, ex, ey, def.width, def.height)) {
        componenteDragging = elem;
        offsetX = pos.x - elem.x;
        offsetY = pos.y - elem.y;
        
        // Quitar de colocados temporalmente
        elementosColocados.splice(i, 1);
        break;
      }
    }
  }
}

function handleMouseMove(e) {
  if(!componenteDragging) return;
  
  const pos = getMousePos(e);
  componenteDragging.x = pos.x - offsetX;
  componenteDragging.y = pos.y - offsetY;
}

function handleMouseUp(e) {
  if(!componenteDragging) return;
  
  const pos = getMousePos(e);
  
  // Si está dentro del workspace, colocar
  if(isInsideRect(pos.x, pos.y, AREAS.workspace.x, AREAS.workspace.y, AREAS.workspace.w, AREAS.workspace.h)) {
    const snapped = snapToGrid(componenteDragging.x, componenteDragging.y);
    componenteDragging.x = Math.max(AREAS.workspace.x + 20, Math.min(snapped.x, AREAS.workspace.x + AREAS.workspace.w - 20));
    componenteDragging.y = Math.max(AREAS.workspace.y + 20, Math.min(snapped.y, AREAS.workspace.y + AREAS.workspace.h - 20));
    
    elementosColocados.push(componenteDragging);
  }
  
  componenteDragging = null;
}

// ============================================
// BUCLE PRINCIPAL
// ============================================
function gameLoop() {
  update();
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  if(gameState === 'menu') {
    drawMenu();
  } else {
    drawGame();
    
    if(showingSolution) {
      drawSolutionDiagram();
    }
    
    if(showingEducation) {
      drawEducationScreen();
    }
  }
  
  requestAnimationFrame(gameLoop);
}

// ============================================
// INICIALIZACIÓN
// ============================================
canvas.addEventListener('click', handleClick);
canvas.addEventListener('mousedown', handleMouseDown);
canvas.addEventListener('mousemove', handleMouseMove);
canvas.addEventListener('mouseup', handleMouseUp);

canvas.addEventListener('mouseleave', () => {
  componenteDragging = null;
});

let animationFrameId = null;

function gameLoopWrapper() {
  gameLoop();
  animationFrameId = requestAnimationFrame(gameLoopWrapper);
}

gameLoopWrapper();

// ============================================
// CLEANUP
// ============================================
return function cleanup() {
  if(animationFrameId) cancelAnimationFrame(animationFrameId);
  canvas.removeEventListener('click', handleClick);
  canvas.removeEventListener('mousedown', handleMouseDown);
  canvas.removeEventListener('mousemove', handleMouseMove);
  canvas.removeEventListener('mouseup', handleMouseUp);
};

}

window.registerGame = registerGame;
