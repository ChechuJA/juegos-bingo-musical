// Quiz de Conocimiento - Categorías y niveles
function registerGame(){
  const canvas = document.getElementById('gameCanvas');
  if (!canvas) {
    console.error("Canvas no encontrado para Quiz");
    return function cleanup() {};
  }
  
  // Asegurar que el canvas tiene el tamaño correcto
  canvas.width = 800;
  canvas.height = 500;
  
  const cleanup = [];
  return initQuiz(canvas, cleanup);
}

function initQuiz(canvas, cleanupBag) {
  const ctx = canvas.getContext('2d');
  const ui = window.GameUI || null;
  let state = 'categories'; // categories, playing, complete, gameover
  let category = null;
  let level = 1;
  let maxLevel = 10;
  let score = 0;
  let currentQuestion = null;
  let timeLeft = 20; // segundos para responder
  let timer = null;
  let options = [];
  let letterHighlight = null;
  let playerName = localStorage.getItem('playerName') || 'Jugador';
  let high = +(localStorage.getItem('quizHigh') || 0);
  let highName = localStorage.getItem('quizHighName') || '';
  let animationFrame = null;
  
  // Base de datos de preguntas por categoría
  const questions = {
    animales: [
      { letter: 'A', question: '¿Qué animal terrestre es el más grande?', options: ['Elefante africano', 'Jirafa', 'Rinoceronte'], answer: 0, 
        fact: 'El elefante africano puede pesar hasta 6 toneladas y medir 4 metros de altura.' },
      { letter: 'B', question: '¿Qué animal puede volar y es el único mamífero que lo hace?', options: ['Ballena', 'Búho', 'Murciélago'], answer: 2,
        fact: 'Los murciélagos representan el 20% de todas las especies de mamíferos.' },
      { letter: 'C', question: '¿Qué animal tiene la mordida más fuerte?', options: ['Cocodrilo', 'León', 'Tiburón blanco'], answer: 0,
        fact: 'La mordida del cocodrilo puede alcanzar una fuerza de 1.6 toneladas.' },
      { letter: 'D', question: '¿Qué animal puede correr más rápido?', options: ['Delfín', 'Dromedario', 'Guepardo'], answer: 2,
        fact: 'El guepardo puede alcanzar 110 km/h en carreras cortas.' },
      { letter: 'E', question: '¿Qué animal puede vivir sin agua por más tiempo?', options: ['Escorpión', 'Rata canguro', 'Camello'], answer: 1,
        fact: 'La rata canguro nunca bebe agua, obtiene toda su hidratación de las semillas que come.' },
      { letter: 'F', question: '¿Qué animal es conocido por su gran memoria?', options: ['Foca', 'Elefante', 'Delfín'], answer: 1,
        fact: 'Los elefantes pueden recordar rutas migratorias de cientos de kilómetros durante décadas.' },
      { letter: 'G', question: '¿Qué animal tiene el cuello más largo?', options: ['Girafa', 'Avestruz', 'Cisne'], answer: 0,
        fact: 'El cuello de una jirafa puede medir hasta 2.4 metros.' },
      { letter: 'H', question: '¿Qué animal puede ver en casi 360 grados?', options: ['Halcón', 'Conejo', 'Libélula'], answer: 1,
        fact: 'Los conejos tienen un campo de visión de casi 360° para detectar depredadores.' },
      { letter: 'I', question: '¿Qué animal puede cambiar de color para camuflarse?', options: ['Iguana', 'Camaleón', 'Pulpo'], answer: 2,
        fact: 'Los pulpos tienen células especializadas llamadas cromatóforos que les permiten cambiar de color en segundos.' },
      { letter: 'J', question: '¿Qué animal es el más grande del mundo?', options: ['Jirafa', 'Elefante', 'Ballena azul'], answer: 2,
        fact: 'La ballena azul puede pesar hasta 180 toneladas, equivalente a 33 elefantes.' },
      { letter: 'K', question: '¿Qué animal es conocido por su capacidad de imitar sonidos humanos?', options: ['Loro', 'Perro', 'Gato'], answer: 0,
        fact: 'Los loros tienen una lengua musculosa que les permite imitar sonidos con precisión.' },
      { letter: 'L', question: '¿Qué animal tiene el corazón más grande?', options: ['Ballena azul', 'Elefante', 'Rinoceronte'], answer: 0,
        fact: 'El corazón de una ballena azul puede pesar hasta 180 kg.' }
    ],
    insectos: [
      { letter: 'A', question: '¿Qué insecto puede cargar 50 veces su peso?', options: ['Abeja', 'Hormiga', 'Escarabajo'], answer: 1,
        fact: 'Algunas especies de hormigas pueden levantar hasta 50 veces su peso corporal.' },
      { letter: 'B', question: '¿Qué insecto produce luz naturalmente?', options: ['Bicho bola', 'Luciérnaga', 'Abeja'], answer: 1,
        fact: 'Las luciérnagas usan bioluminiscencia para atraer parejas.' },
      { letter: 'C', question: '¿Qué insecto puede saltar 200 veces su longitud?', options: ['Cigarra', 'Pulga', 'Cucaracha'], answer: 1,
        fact: 'Si los humanos saltaran como las pulgas, podrían saltar sobre un edificio de 30 pisos.' },
      { letter: 'D', question: '¿Qué insecto tiene el vuelo más rápido?', options: ['Libélula', 'Mosca', 'Abeja'], answer: 0,
        fact: 'Las libélulas pueden volar hasta 55 km/h y son uno de los cazadores más efectivos, con un 95% de éxito.' },
      { letter: 'E', question: '¿Qué insecto vive en colonias con una reina?', options: ['Escarabajo', 'Hormiga', 'Mariposa'], answer: 1,
        fact: 'Una colonia de hormigas puede tener millones de individuos, todos descendientes de una sola reina.' },
      { letter: 'F', question: '¿Qué insecto puede estar congelado y revivir?', options: ['Mosca de la fruta', 'Avispa', 'Hormiga'], answer: 0,
        fact: 'Algunas moscas de la fruta producen un anticongelante natural que les permite sobrevivir temperaturas bajo cero.' },
      { letter: 'G', question: '¿Qué insecto forma grandes enjambres migratorios?', options: ['Langosta', 'Grillo', 'Avispa'], answer: 0,
        fact: 'Un enjambre de langostas puede contener hasta 80 millones de individuos y consumir 200 toneladas de vegetación al día.' },
      { letter: 'H', question: '¿Qué insecto tiene el ciclo vital más corto?', options: ['Hormiga', 'Mosca', 'Efímera'], answer: 2,
        fact: 'Las efímeras adultas viven solo 24 horas y ni siquiera tienen boca para alimentarse.' },
      { letter: 'I', question: '¿Qué insecto puede sobrevivir sin cabeza?', options: ['Cucaracha', 'Mosca', 'Araña'], answer: 0,
        fact: 'Las cucarachas pueden vivir hasta una semana sin cabeza, hasta que mueren de deshidratación.' },
      { letter: 'J', question: '¿Qué insecto es responsable de la polinización de muchas plantas?', options: ['Mosquito', 'Abeja', 'Hormiga'], answer: 1,
        fact: 'Las abejas polinizan aproximadamente un tercio de todos los cultivos que consumimos.' },
      { letter: 'K', question: '¿Qué insecto puede vivir hasta 50 años?', options: ['Termita reina', 'Abeja reina', 'Hormiga reina'], answer: 0,
        fact: 'La termita reina puede vivir hasta 50 años, produciendo millones de huevos.' },
      { letter: 'L', question: '¿Qué insecto tiene alas transparentes?', options: ['Mariposa de cristal', 'Libélula', 'Avispa'], answer: 0,
        fact: 'La mariposa de cristal tiene alas casi invisibles, lo que la hace difícil de detectar.' }
    ],
    dinosaurios: [
      { letter: 'A', question: '¿Qué dinosaurio tenía placas óseas en la espalda?', options: ['Apatosaurus', 'Stegosaurus', 'Ankylosaurus'], answer: 1,
        fact: 'El Stegosaurus tenía un cerebro del tamaño de una nuez, a pesar de pesar varias toneladas.' },
      { letter: 'B', question: '¿Qué dinosaurio tenía cuernos y collar óseo?', options: ['Brachiosaurus', 'Triceratops', 'Brontosaurus'], answer: 1,
        fact: 'El Triceratops usaba sus tres cuernos para defenderse de depredadores como el T-Rex.' },
      { letter: 'C', question: '¿Qué dinosaurio carnívoro tenía brazos muy cortos?', options: ['Carnotaurus', 'Compsognathus', 'Tyrannosaurus Rex'], answer: 2,
        fact: 'Los brazos del T-Rex solo medían 1 metro, muy pequeños en proporción a su cuerpo de 12 metros.' },
      { letter: 'D', question: '¿Qué dinosaurio tenía una cresta en la cabeza?', options: ['Diplodocus', 'Parasaurolophus', 'Dilophosaurus'], answer: 1,
        fact: 'La cresta hueca del Parasaurolophus podía usarse para hacer sonidos, como un instrumento musical.' },
      { letter: 'E', question: '¿Qué dinosaurio podía volar?', options: ['Pterodáctilo', 'Estegosaurio', 'Elasmosaurio'], answer: 0,
        fact: 'Técnicamente, los pterodáctilos no eran dinosaurios sino reptiles voladores llamados pterosaurios.' },
      { letter: 'F', question: '¿Qué dinosaurio tenía un cuello extremadamente largo?', options: ['Triceratops', 'Braquiosaurio', 'Velociraptor'], answer: 1,
        fact: 'El Braquiosaurio podía alcanzar las hojas a 13 metros de altura, como un edificio de 4 pisos.' },
      { letter: 'G', question: '¿Qué dinosaurio tenía una armadura corporal?', options: ['Gallimimus', 'Ankylosaurus', 'Giganotosaurus'], answer: 1,
        fact: 'El Ankylosaurus tenía incluso los párpados blindados y una maza ósea en la cola para defenderse.' },
      { letter: 'H', question: '¿Qué dinosaurio era uno de los más pequeños?', options: ['Herrerasaurus', 'Hypsilophodon', 'Compsognathus'], answer: 2,
        fact: 'El Compsognathus era del tamaño de un pollo, apenas 1 metro de largo y pesaba 3 kg.' },
      { letter: 'I', question: '¿Qué dinosaurio es conocido por sus enormes garras?', options: ['Iguanodon', 'Deinonico', 'Velociraptor'], answer: 2,
        fact: 'El Velociraptor era mucho más pequeño que en las películas, del tamaño de un pavo grande.' },
      { letter: 'J', question: '¿Qué dinosaurio era el más grande?', options: ['Argentinosaurus', 'Diplodocus', 'Brachiosaurus'], answer: 0,
        fact: 'El Argentinosaurus podía medir hasta 35 metros y pesar 90 toneladas, como 14 elefantes juntos.' },
      { letter: 'K', question: '¿Qué dinosaurio tenía una cola en forma de maza?', options: ['Ankylosaurus', 'Triceratops', 'Stegosaurus'], answer: 0,
        fact: 'El Ankylosaurus usaba su cola en forma de maza para defenderse de depredadores.' },
      { letter: 'L', question: '¿Qué dinosaurio tenía dientes afilados como cuchillas?', options: ['Velociraptor', 'Tyrannosaurus Rex', 'Allosaurus'], answer: 2,
        fact: 'El Allosaurus tenía dientes afilados que podían cortar carne con facilidad.' }
    ],
    marinos: [
      { letter: 'A', question: '¿Qué animal marino puede regenerar sus tentáculos?', options: ['Anémona', 'Pulpo', 'Sepia'], answer: 1,
        fact: 'Los pulpos no solo regeneran tentáculos, también tienen tres corazones y sangre azul.' },
      { letter: 'B', question: '¿Qué animal marino es el más grande del mundo?', options: ['Tiburón ballena', 'Ballena azul', 'Calamar gigante'], answer: 1,
        fact: 'El corazón de una ballena azul es tan grande como un coche pequeño.' },
      { letter: 'C', question: '¿Qué criatura marina puede cambiar de sexo?', options: ['Caballito de mar', 'Pez payaso', 'Cangrejo'], answer: 1,
        fact: 'Los peces payaso nacen todos machos y el dominante se convierte en hembra si es necesario.' },
      { letter: 'D', question: '¿Qué animal marino es conocido por su inteligencia?', options: ['Delfín', 'Medusa', 'Tiburón'], answer: 0,
        fact: 'Los delfines reconocen su reflejo, tienen nombres individuales y trabajan en equipo para cazar.' },
      { letter: 'E', question: '¿Qué animal marino emite descargas eléctricas?', options: ['Erizo de mar', 'Anguila eléctrica', 'Estrella de mar'], answer: 1,
        fact: 'La anguila eléctrica puede generar descargas de hasta 600 voltios, suficiente para aturdir a un caballo.' },
      { letter: 'F', question: '¿Qué pez puede inflar su cuerpo?', options: ['Pez espada', 'Pez león', 'Pez globo'], answer: 2,
        fact: 'El pez globo contiene tetrodotoxina, un veneno 1200 veces más potente que el cianuro.' },
      { letter: 'G', question: '¿Qué animal marino vive en colonias gigantes?', options: ['Cangrejo', 'Coral', 'Gamba'], answer: 1,
        fact: 'La Gran Barrera de Coral es el organismo vivo más grande del planeta, visible desde el espacio.' },
      { letter: 'H', question: '¿Qué animal marino puede vivir "eternamente"?', options: ['Medusa inmortal', 'Hipocampo', 'Erizo de mar'], answer: 0,
        fact: 'La medusa Turritopsis dohrnii puede revertir su ciclo vital y rejuvenecer indefinidamente.' },
      { letter: 'I', question: '¿Qué animal marino migra más distancia?', options: ['Tortuga marina', 'Ballena jorobada', 'Tiburón blanco'], answer: 1,
        fact: 'Las ballenas jorobadas migran hasta 25,000 km cada año, el viaje migratorio más largo de cualquier mamífero.' },
      { letter: 'J', question: '¿Qué animal marino puede sobrevivir congelado?', options: ['Pez ártico', 'Kril', 'Foca'], answer: 0,
        fact: 'Algunos peces árticos producen anticongelante natural en su sangre y pueden sobrevivir en agua bajo cero.' }
    ]
  };
  
  // Seleccionar categoría y empezar juego
  function selectCategory(cat) {
    if (!questions[cat] || questions[cat].length === 0) return;
    
    category = cat;
    level = 1;
    score = 0;
    state = 'playing';
    
    // Mezclar preguntas (solo usaremos maxLevel)
    const shuffled = [...questions[cat]].sort(() => 0.5 - Math.random());
    questions[cat] = shuffled.slice(0, maxLevel);
    
    loadQuestion();
  }
  
  // Cargar pregunta actual según nivel
  function loadQuestion() {
    if (level > maxLevel) {
      completeGame();
      return;
    }
    
    currentQuestion = questions[category][level-1];
    options = [...currentQuestion.options];
    timeLeft = 20;
    startTimer();
  }
  
  // Controlar temporizador
  function startTimer() {
    clearInterval(timer);
    timer = setInterval(() => {
      timeLeft--;
      if (timeLeft <= 0) {
        clearInterval(timer);
        gameOver();
      }
    }, 1000);
  }
  
  // Finalizar juego con éxito
  function completeGame() {
    state = 'complete';
    clearInterval(timer);
    
    // Verificar récord
    if (score > high) {
      high = score;
      highName = playerName;
      localStorage.setItem('quizHigh', high);
      localStorage.setItem('quizHighName', highName);
    }
  }
  
  // Finalizar juego por fallo
  function gameOver() {
    state = 'gameover';
    clearInterval(timer);
    
    // Verificar récord
    if (score > high) {
      high = score;
      highName = playerName;
      localStorage.setItem('quizHigh', high);
      localStorage.setItem('quizHighName', highName);
    }
  }
  
  // Elegir respuesta
  function selectAnswer(index) {
    if (state !== 'playing') return;
    
    if (index === currentQuestion.answer) {
      // Correcta
      score += level * 10;
      level++;
      loadQuestion();
    } else {
      // Incorrecta
      gameOver();
    }
  }
  
  // Reiniciar juego
  function restart() {
    state = 'categories';
    clearInterval(timer);
  }
  
  // Dibujar interfaz
  function draw() {
    // Fondo y barra superior
    if (ui && typeof ui.softBg === 'function') {
      ui.softBg(ctx, canvas.width, canvas.height, ['#00695c', '#004d40']);
      ui.gradientBar(ctx, canvas.width, 70, '#00897b', '#00695c');
    } else {
      // Fallback si GameUI no está disponible
      const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      bgGradient.addColorStop(0, '#00695c');
      bgGradient.addColorStop(1, '#004d40');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Barra superior
      const headerGrad = ctx.createLinearGradient(0, 0, 0, 70);
      headerGrad.addColorStop(0, '#00897b');
      headerGrad.addColorStop(1, '#00695c');
      ctx.fillStyle = headerGrad;
      ctx.fillRect(0, 0, canvas.width, 70);
    }
    
    // Título
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Quiz de Conocimiento', canvas.width/2, 34);
    ctx.textAlign = 'left';
    
    // Info general
    ctx.fillStyle = '#fff';
    ctx.font = '14px Arial';
    ctx.fillText('Nivel: ' + level + '/' + maxLevel, 20, 60);
    ctx.fillText('Puntos: ' + score, 20, 80);
    ctx.fillText('Récord: ' + high + (highName ? ' (' + highName + ')' : ''), 20, 100);
    
    // Estados específicos
    if (state === 'categories') {
      drawCategories();
    } else if (state === 'playing') {
      drawGame();
    } else if (state === 'complete') {
      drawComplete();
    } else if (state === 'gameover') {
      drawGameOver();
    }
  }
  
  // Dibujar selección de categorías
  function drawCategories() {
    if (ui && typeof ui.glassPanel === 'function') {
      ui.glassPanel(ctx, canvas.width/2 - 300, 120, 600, 300);
    } else {
      // Fallback más oscuro para el panel de vidrio
      ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
      ctx.fillRect(canvas.width/2 - 300, 120, 600, 300);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 2;
      ctx.strokeRect(canvas.width/2 - 300, 120, 600, 300);
    }
    
    ctx.fillStyle = '#fff';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Selecciona una categoría', canvas.width/2, 160);
    
    const categories = [
      {id: 'animales', name: 'Animales', color: '#4caf50'},
      {id: 'insectos', name: 'Insectos', color: '#ff9800'},
      {id: 'dinosaurios', name: 'Dinosaurios', color: '#e91e63'},
      {id: 'marinos', name: 'Animales marinos', color: '#2196f3'}
    ];
    
    const buttonWidth = 200;
    const buttonHeight = 50;
    const gap = 20;
    const totalWidth = categories.length * buttonWidth + (categories.length - 1) * gap;
    let startX = (canvas.width - totalWidth) / 2;
    
    categories.forEach((cat, index) => {
      const x = startX + index * (buttonWidth + gap);
      const y = 200;
      
      // Dibujar botón
      ctx.fillStyle = cat.color;
      if (ctx.roundRect) {
        ctx.beginPath();
        ctx.roundRect(x, y, buttonWidth, buttonHeight, 10);
        ctx.fill();
      } else {
        ctx.fillRect(x, y, buttonWidth, buttonHeight);
      }
      
      // Texto
      ctx.fillStyle = '#fff';
      ctx.font = '18px Arial';
      ctx.fillText(cat.name, x + buttonWidth/2, y + buttonHeight/2 + 6);
      
      // Almacenar para interacción
      cat.bounds = {x, y, width: buttonWidth, height: buttonHeight};
    });
    
    // Instrucciones
    ctx.font = '14px Arial';
    ctx.fillText('Responde correctamente preguntas para avanzar niveles', canvas.width/2, 290);
    ctx.fillText('Cada nivel es más valioso. ¡Intenta llegar al final!', canvas.width/2, 320);
    ctx.fillText('Límite: 20 segundos por pregunta', canvas.width/2, 350);
    
    // Almacenar para interacción
    categoriesButtons = categories;
    
    ctx.textAlign = 'left';
  }
  
  // Dibujar interfaz del juego
  function drawGame() {
    if (!currentQuestion) return;
    
    // Temporizador
    ctx.fillStyle = timeLeft <= 5 ? '#f44336' : '#fff';
    ctx.font = '16px Arial';
    ctx.textAlign = 'right';
    ctx.fillText('Tiempo: ' + timeLeft + 's', canvas.width - 20, 60);
    ctx.textAlign = 'left';
    
    // Círculo de letras tipo pasapalabra
    const centerX = canvas.width / 2;
    const centerY = 170;
    const radius = 80;
    const letters = 'ABCDEFGHIJ';
    
    ctx.lineWidth = 2;
    for (let i = 0; i < letters.length; i++) {
      const angle = (i / letters.length) * Math.PI * 2 - Math.PI / 2;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      
      // Resaltar letra actual
      if (letters[i] === currentQuestion.letter) {
        ctx.fillStyle = '#4caf50';
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, Math.PI * 2);
        ctx.fill();
        letterHighlight = {x, y};
      } else if (i < level - 1) {
        // Resaltar letras ya respondidas
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.beginPath();
        ctx.arc(x, y, 18, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Letras pendientes
        ctx.strokeStyle = 'rgba(255,255,255,0.4)';
        ctx.beginPath();
        ctx.arc(x, y, 18, 0, Math.PI * 2);
        ctx.stroke();
      }
      
      // Texto de la letra
      ctx.fillStyle = letters[i] === currentQuestion.letter ? '#fff' : 'rgba(255,255,255,0.8)';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(letters[i], x, y + 5);
    }
    ctx.textAlign = 'left';
    
    // Pregunta
    if (ui && typeof ui.glassPanel === 'function') {
      ui.glassPanel(ctx, 100, 240, canvas.width - 200, 70);
    } else {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
      ctx.fillRect(100, 240, canvas.width - 200, 70);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.strokeRect(100, 240, canvas.width - 200, 70);
    }
    
    ctx.fillStyle = '#fff';
    ctx.font = '18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(currentQuestion.question, canvas.width / 2, 280);
    ctx.textAlign = 'left';
    
    // Opciones
    const optionWidth = (canvas.width - 200) / 3;
    const optionHeight = 60;
    const optionY = 350;
    
    currentQuestion.options.forEach((option, index) => {
      const x = 100 + index * optionWidth;
      
      // Dibujar botón
      ctx.fillStyle = 'rgba(255,255,255,0.1)';
      if (ctx.roundRect) {
        ctx.beginPath();
        ctx.roundRect(x, optionY, optionWidth - 10, optionHeight, 10);
        ctx.fill();
      } else {
        ctx.fillRect(x, optionY, optionWidth - 10, optionHeight);
      }
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.strokeRect(x, optionY, optionWidth - 10, optionHeight);
      
      // Número de opción
      ctx.fillStyle = '#4caf50';
      ctx.font = 'bold 16px Arial';
      ctx.fillText((index + 1) + '.', x + 10, optionY + 25);
      
      // Texto de opción
      ctx.fillStyle = '#fff';
      ctx.font = '15px Arial';
      // Ajustar texto largo
      let optText = option;
      if (option.length > 20) {
        const mid = Math.floor(option.length / 2);
        const breakPos = option.indexOf(' ', mid);
        if (breakPos > 0) {
          const firstLine = option.substring(0, breakPos);
          const secondLine = option.substring(breakPos + 1);
          ctx.fillText(firstLine, x + 30, optionY + 25);
          ctx.fillText(secondLine, x + 30, optionY + 45);
        } else {
          ctx.fillText(option, x + 30, optionY + 35);
        }
      } else {
        ctx.fillText(option, x + 30, optionY + 35);
      }
      
      // Almacenar para interacción
      options[index] = {
        ...options[index],
        bounds: {x, y: optionY, width: optionWidth - 10, height: optionHeight}
      };
    });
  }
  
  // Dibujar pantalla de juego completado
  function drawComplete() {
    if (ui && typeof ui.glassPanel === 'function') {
      ui.glassPanel(ctx, canvas.width/2 - 200, 170, 400, 200);
    } else {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
      ctx.fillRect(canvas.width/2 - 200, 170, 400, 200);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.strokeRect(canvas.width/2 - 200, 170, 400, 200);
    }
    
    ctx.fillStyle = '#fff';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('¡Felicidades!', canvas.width/2, 210);
    
    ctx.font = '18px Arial';
    ctx.fillText('Has completado todos los niveles', canvas.width/2, 240);
    ctx.fillText('Puntuación final: ' + score, canvas.width/2, 270);
    
    if (score === high) {
      ctx.fillStyle = '#ffeb3b';
      ctx.fillText('¡Nuevo récord!', canvas.width/2, 300);
    }
    
    ctx.fillStyle = '#fff';
    ctx.font = '16px Arial';
    ctx.fillText('Pulsa ESPACIO para volver al menú', canvas.width/2, 330);
    
    ctx.textAlign = 'left';
  }
  
  // Dibujar pantalla de juego perdido
  function drawGameOver() {
    if (ui && typeof ui.glassPanel === 'function') {
      ui.glassPanel(ctx, canvas.width/2 - 200, 170, 400, 220);
    } else {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
      ctx.fillRect(canvas.width/2 - 200, 170, 400, 220);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.strokeRect(canvas.width/2 - 200, 170, 400, 220);
    }
    
    ctx.fillStyle = '#fff';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Juego terminado', canvas.width/2, 210);
    
    ctx.font = '18px Arial';
    ctx.fillText('Llegaste al nivel ' + level + ' de ' + maxLevel, canvas.width/2, 240);
    ctx.fillText('Puntuación: ' + score, canvas.width/2, 270);
    
    // Mostrar dato curioso sobre la pregunta fallada
    if (currentQuestion && currentQuestion.fact) {
      ctx.font = '14px Arial';
      ctx.fillStyle = '#4caf50';
      ctx.fillText('¿Sabías que? ' + currentQuestion.fact, canvas.width/2, 300);
    }
    
    ctx.fillStyle = '#fff';
    ctx.font = '16px Arial';
    ctx.fillText('Pulsa ESPACIO para volver al menú', canvas.width/2, 340);
    
    ctx.textAlign = 'left';
  }
  
  // Controladores de eventos
  let categoriesButtons = [];
  
  function handleKey(e) {
    if (state === 'playing') {
      if (['1', '2', '3'].includes(e.key)) {
        selectAnswer(parseInt(e.key) - 1);
      }
    } else if ((state === 'complete' || state === 'gameover') && e.key === ' ') {
      restart();
    }
  }
  
  function handleClick(e) {
    const coords = window.GameUtils ? 
      window.GameUtils.getCanvasCoords(e, canvas) : 
      { x: e.clientX - canvas.getBoundingClientRect().left, y: e.clientY - canvas.getBoundingClientRect().top };
    
    if (state === 'categories') {
      // Verificar clic en botones de categoría
      for (const btn of categoriesButtons) {
        const b = btn.bounds;
        if (coords.x >= b.x && coords.x <= b.x + b.width && 
            coords.y >= b.y && coords.y <= b.y + b.height) {
          selectCategory(btn.id);
          return;
        }
      }
    } else if (state === 'playing') {
      // Verificar clic en opciones
      for (let i = 0; i < options.length; i++) {
        const opt = options[i];
        if (opt.bounds && 
            coords.x >= opt.bounds.x && coords.x <= opt.bounds.x + opt.bounds.width && 
            coords.y >= opt.bounds.y && coords.y <= opt.bounds.y + opt.bounds.height) {
          selectAnswer(i);
          return;
        }
      }
    } else if (state === 'complete' || state === 'gameover') {
      restart();
    }
  }
  
  // Registro de eventos
  const keyListener = e => handleKey(e);
  const clickListener = e => handleClick(e);
  window.addEventListener('keydown', keyListener);
  canvas.addEventListener('click', clickListener);
  cleanupBag.push(() => {
    window.removeEventListener('keydown', keyListener);
    canvas.removeEventListener('click', clickListener);
    clearInterval(timer);
    if (animationFrame) cancelAnimationFrame(animationFrame);
  });
  
  // Loop principal
  function loop() {
    draw();
    animationFrame = requestAnimationFrame(loop);
  }
  animationFrame = requestAnimationFrame(loop);
  
  // Función de limpieza
  return function cleanup() {
    window.removeEventListener('keydown', keyListener);
    canvas.removeEventListener('click', clickListener);
    clearInterval(timer);
    if (animationFrame) cancelAnimationFrame(animationFrame);
  };
}

window.registerGame = registerGame;