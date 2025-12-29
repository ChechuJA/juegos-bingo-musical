function registerGame() {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        console.error('Canvas gameCanvas no encontrado');
        return () => {};
    }

    const ctx = canvas.getContext('2d');
    let animationFrameId = null;

    // ==================== CONFIGURACIÓN ====================
    const GRID_SIZE = 40;
    const AREA_PIEZAS = { x: 10, y: 60, width: 180, height: 520 };
    const AREA_MONTAJE = { x: 200, y: 60, width: 500, height: 520 };
    const AREA_INSTRUCCIONES = { x: 710, y: 60, width: 180, height: 380 };

    // ==================== TIPOS DE PIEZAS ====================
    const TIPO_PIEZA = {
        TABLA: 'tabla',
        PATA: 'pata',
        TABLERO: 'tablero',
        LATERAL: 'lateral',
        TAPA: 'tapa',
        BASE: 'base',
        PUERTA: 'puerta',
        BALDA: 'balda',
        ESCUADRA: 'escuadra',
        PLATINA: 'platina',
        TRAVESANO: 'travesaño',
        BISAGRA: 'bisagra',
        POMO: 'pomo',
        PANEL_TRASERO: 'panel_trasero'
    };

    // ==================== TORNILLOS ====================
    const TORNILLOS = [
        { id: '4x20', nombre: '4×20mm Phillips', emoji: '🔩', tipo: 'phillips', diametro: 4, longitud: 20 },
        { id: '5x40', nombre: '5×40mm Phillips', emoji: '🔩', tipo: 'phillips', diametro: 5, longitud: 40 },
        { id: '6x30', nombre: '6×30mm Phillips', emoji: '🔩', tipo: 'phillips', diametro: 6, longitud: 30 },
        { id: 'allenM6', nombre: 'Allen M6×25mm', emoji: '⚙️', tipo: 'allen', diametro: 6, longitud: 25 },
        { id: 'clavo', nombre: 'Clavo pequeño', emoji: '📌', tipo: 'clavo', diametro: 2, longitud: 15 }
    ];

    // ==================== HERRAMIENTAS ====================
    const HERRAMIENTAS = [
        { id: 'phillips', nombre: 'Destornillador Phillips', emoji: '🪛', tipos: ['phillips'] },
        { id: 'allen', nombre: 'Llave Allen 4mm', emoji: '🔧', tipos: ['allen'] },
        { id: 'martillo', nombre: 'Martillo', emoji: '🔨', tipos: ['clavo'] },
        { id: 'nivel', nombre: 'Nivel', emoji: '📏', tipos: [] } // herramienta auxiliar
    ];

    // ==================== NIVELES ====================
    const NIVELES = [
        {
            id: 1,
            nombre: '🪑 Nivel 1: Estantería Simple',
            dificultad: '⭐☆☆☆☆',
            tiempo: 240, // segundos
            piezas: [
                { id: 'tabla1', tipo: TIPO_PIEZA.TABLA, nombre: 'Tabla 1', emoji: '🪵', width: 120, height: 20, color: '#D2691E', x: 30, y: 80, rotation: 0 },
                { id: 'tabla2', tipo: TIPO_PIEZA.TABLA, nombre: 'Tabla 2', emoji: '🪵', width: 120, height: 20, color: '#D2691E', x: 30, y: 120, rotation: 0 },
                { id: 'tabla3', tipo: TIPO_PIEZA.TABLA, nombre: 'Tabla 3', emoji: '🪵', width: 120, height: 20, color: '#D2691E', x: 30, y: 160, rotation: 0 },
                { id: 'tabla4', tipo: TIPO_PIEZA.TABLA, nombre: 'Tabla 4', emoji: '🪵', width: 120, height: 20, color: '#D2691E', x: 30, y: 200, rotation: 0 },
                { id: 'soporteL', tipo: TIPO_PIEZA.LATERAL, nombre: 'Soporte Izq', emoji: '▌', width: 20, height: 160, color: '#8B4513', x: 30, y: 250, rotation: 0 },
                { id: 'soporteR', tipo: TIPO_PIEZA.LATERAL, nombre: 'Soporte Der', emoji: '▐', width: 20, height: 160, color: '#8B4513', x: 30, y: 320, rotation: 0 },
                { id: 'esc1', tipo: TIPO_PIEZA.ESCUADRA, nombre: 'Escuadra', emoji: '⌐', width: 15, height: 15, color: '#C0C0C0', x: 30, y: 390, rotation: 0 },
                { id: 'esc2', tipo: TIPO_PIEZA.ESCUADRA, nombre: 'Escuadra', emoji: '⌐', width: 15, height: 15, color: '#C0C0C0', x: 60, y: 390, rotation: 0 },
                { id: 'esc3', tipo: TIPO_PIEZA.ESCUADRA, nombre: 'Escuadra', emoji: '⌐', width: 15, height: 15, color: '#C0C0C0', x: 90, y: 390, rotation: 0 },
                { id: 'esc4', tipo: TIPO_PIEZA.ESCUADRA, nombre: 'Escuadra', emoji: '⌐', width: 15, height: 15, color: '#C0C0C0', x: 120, y: 390, rotation: 0 },
                { id: 'esc5', tipo: TIPO_PIEZA.ESCUADRA, nombre: 'Escuadra', emoji: '⌐', width: 15, height: 15, color: '#C0C0C0', x: 30, y: 420, rotation: 0 },
                { id: 'esc6', tipo: TIPO_PIEZA.ESCUADRA, nombre: 'Escuadra', emoji: '⌐', width: 15, height: 15, color: '#C0C0C0', x: 60, y: 420, rotation: 0 },
                { id: 'esc7', tipo: TIPO_PIEZA.ESCUADRA, nombre: 'Escuadra', emoji: '⌐', width: 15, height: 15, color: '#C0C0C0', x: 90, y: 420, rotation: 0 },
                { id: 'esc8', tipo: TIPO_PIEZA.ESCUADRA, nombre: 'Escuadra', emoji: '⌐', width: 15, height: 15, color: '#C0C0C0', x: 120, y: 420, rotation: 0 }
            ],
            pasos: [
                { desc: '1. Coloca soporte izquierdo', piezas: ['soporteL'], tornillos: [], herramienta: null, posicion: { x: 250, y: 150 } },
                { desc: '2. Atornilla tabla inferior + 2 escuadras', piezas: ['tabla1', 'esc1', 'esc2'], tornillos: ['4x20', '4x20', '4x20', '4x20'], herramienta: 'phillips', posicion: { x: 270, y: 290 } },
                { desc: '3. Atornilla segunda tabla + escuadras', piezas: ['tabla2', 'esc3', 'esc4'], tornillos: ['4x20', '4x20', '4x20', '4x20'], herramienta: 'phillips', posicion: { x: 270, y: 240 } },
                { desc: '4. Atornilla tercera tabla + escuadras', piezas: ['tabla3', 'esc5', 'esc6'], tornillos: ['4x20', '4x20', '4x20', '4x20'], herramienta: 'phillips', posicion: { x: 270, y: 190 } },
                { desc: '5. Atornilla tabla superior + escuadras', piezas: ['tabla4', 'esc7', 'esc8'], tornillos: ['4x20', '4x20', '4x20', '4x20'], herramienta: 'phillips', posicion: { x: 270, y: 140 } },
                { desc: '6. Coloca soporte derecho', piezas: ['soporteR'], tornillos: [], herramienta: null, posicion: { x: 390, y: 150 } },
                { desc: '7. Verifica estabilidad con nivel', piezas: [], tornillos: [], herramienta: 'nivel', posicion: null }
            ],
            educacion: `📐 ESTANTERÍA BÁSICA

🔩 TORNILLOS PARA MADERA:
• 4mm diámetro × 20mm largo
• Rosca completa para mejor agarre
• Cabeza Phillips (cruz)

🔧 DESTORNILLADOR:
• Phillips (cruz) vs Plano (ranura)
• Gira en sentido horario para apretar
• No aprietes demasiado o pasarás rosca

📏 NIVEL:
• Asegura que las tablas estén horizontales
• Burbuja centrada = nivelado perfecto

⚠️ ERRORES COMUNES:
❌ Apretar tornillos antes de colocar todo
❌ No nivelar → mueble torcido
❌ Destornillador incorrecto → cabeza dañada

✅ Has aprendido los fundamentos del montaje
de muebles. ¡Sigamos con algo más complejo!`
        },
        {
            id: 2,
            nombre: '🪑 Nivel 2: Mesa con Patas',
            dificultad: '⭐⭐⭐☆☆',
            tiempo: 360,
            piezas: [
                { id: 'tablero', tipo: TIPO_PIEZA.TABLERO, nombre: 'Tablero', emoji: '⬜', width: 200, height: 120, color: '#8B4513', x: 30, y: 80, rotation: 0 },
                { id: 'pata1', tipo: TIPO_PIEZA.PATA, nombre: 'Pata 1', emoji: '┃', width: 15, height: 80, color: '#654321', x: 30, y: 220, rotation: 0 },
                { id: 'pata2', tipo: TIPO_PIEZA.PATA, nombre: 'Pata 2', emoji: '┃', width: 15, height: 80, color: '#654321', x: 60, y: 220, rotation: 0 },
                { id: 'pata3', tipo: TIPO_PIEZA.PATA, nombre: 'Pata 3', emoji: '┃', width: 15, height: 80, color: '#654321', x: 90, y: 220, rotation: 0 },
                { id: 'pata4', tipo: TIPO_PIEZA.PATA, nombre: 'Pata 4', emoji: '┃', width: 15, height: 80, color: '#654321', x: 120, y: 220, rotation: 0 },
                { id: 'plat1', tipo: TIPO_PIEZA.PLATINA, nombre: 'Platina', emoji: '▪', width: 25, height: 25, color: '#A9A9A9', x: 30, y: 320, rotation: 0 },
                { id: 'plat2', tipo: TIPO_PIEZA.PLATINA, nombre: 'Platina', emoji: '▪', width: 25, height: 25, color: '#A9A9A9', x: 70, y: 320, rotation: 0 },
                { id: 'plat3', tipo: TIPO_PIEZA.PLATINA, nombre: 'Platina', emoji: '▪', width: 25, height: 25, color: '#A9A9A9', x: 110, y: 320, rotation: 0 },
                { id: 'plat4', tipo: TIPO_PIEZA.PLATINA, nombre: 'Platina', emoji: '▪', width: 25, height: 25, color: '#A9A9A9', x: 30, y: 360, rotation: 0 },
                { id: 'travesano', tipo: TIPO_PIEZA.TRAVESANO, nombre: 'Travesaño', emoji: '═', width: 180, height: 15, color: '#654321', x: 30, y: 400, rotation: 0 }
            ],
            pasos: [
                { desc: '1. Voltea tablero (boca abajo)', piezas: ['tablero'], tornillos: [], herramienta: null, posicion: { x: 300, y: 250, instruccion: 'boca_abajo' } },
                { desc: '2. Coloca 4 platinas en esquinas', piezas: ['plat1', 'plat2', 'plat3', 'plat4'], tornillos: [], herramienta: null, posicion: { x: 300, y: 250 } },
                { desc: '3. Atornilla platinas al tablero', piezas: [], tornillos: ['6x30', '6x30', '6x30', '6x30'], herramienta: 'phillips', posicion: null },
                { desc: '4. Rosca las 4 patas en platinas', piezas: ['pata1', 'pata2', 'pata3', 'pata4'], tornillos: [], herramienta: null, posicion: { x: 300, y: 250 } },
                { desc: '5. Coloca travesaño entre patas', piezas: ['travesano'], tornillos: [], herramienta: null, posicion: { x: 300, y: 350 } },
                { desc: '6. Atornilla travesaño con Allen', piezas: [], tornillos: ['allenM6', 'allenM6'], herramienta: 'allen', posicion: null },
                { desc: '7. Voltea mesa y verifica nivel', piezas: [], tornillos: [], herramienta: 'nivel', posicion: null }
            ],
            educacion: `🪑 MESA CON PATAS

🔩 TORNILLOS ALLEN (HEXAGONALES):
• M6 = 6mm diámetro (métrica)
• Necesitan llave Allen
• Más fuerza de apriete que Phillips
• Ideales para muebles pesados

🔧 LLAVE ALLEN:
• Forma de L para alcance y palanca
• Lado corto para espacios reducidos
• Lado largo para más fuerza

🏗️ TRAVESAÑO:
• Refuerzo entre patas
• Evita que las patas se abran
• Aumenta capacidad de carga

📐 PLATINA:
• Pieza metálica une tablero y pata
• Distribuye peso uniformemente
• Permite desmontar mesa fácilmente

⚠️ ERRORES COMUNES:
❌ No apretar suficiente → mesa coja
❌ Olvidar travesaño → inestabilidad
❌ Allen incorrecto → rosca redondeada

✅ ¡Excelente! Ya sabes montar muebles
funcionales. Vamos con un reto mayor.`
        },
        {
            id: 3,
            nombre: '🚪 Nivel 3: Armario con Puertas',
            dificultad: '⭐⭐⭐⭐☆',
            tiempo: 600,
            piezas: [
                { id: 'lateralL', tipo: TIPO_PIEZA.LATERAL, nombre: 'Lateral Izq', emoji: '▌', width: 30, height: 180, color: '#8B4513', x: 30, y: 80, rotation: 0 },
                { id: 'lateralR', tipo: TIPO_PIEZA.LATERAL, nombre: 'Lateral Der', emoji: '▐', width: 30, height: 180, color: '#8B4513', x: 30, y: 270, rotation: 0 },
                { id: 'tapa', tipo: TIPO_PIEZA.TAPA, nombre: 'Tapa Superior', emoji: '▬', width: 120, height: 30, color: '#8B4513', x: 30, y: 460, rotation: 0 },
                { id: 'base', tipo: TIPO_PIEZA.BASE, nombre: 'Base Inferior', emoji: '▬', width: 120, height: 30, color: '#8B4513', x: 70, y: 80, rotation: 0 },
                { id: 'panel', tipo: TIPO_PIEZA.PANEL_TRASERO, nombre: 'Panel Trasero', emoji: '▦', width: 120, height: 180, color: '#D2B48C', x: 70, y: 120, rotation: 0 },
                { id: 'balda1', tipo: TIPO_PIEZA.BALDA, nombre: 'Balda 1', emoji: '─', width: 110, height: 15, color: '#A0826D', x: 70, y: 210, rotation: 0 },
                { id: 'balda2', tipo: TIPO_PIEZA.BALDA, nombre: 'Balda 2', emoji: '─', width: 110, height: 15, color: '#A0826D', x: 70, y: 240, rotation: 0 },
                { id: 'balda3', tipo: TIPO_PIEZA.BALDA, nombre: 'Balda 3', emoji: '─', width: 110, height: 15, color: '#A0826D', x: 70, y: 270, rotation: 0 },
                { id: 'puertaL', tipo: TIPO_PIEZA.PUERTA, nombre: 'Puerta Izq', emoji: '🚪', width: 55, height: 170, color: '#654321', x: 70, y: 310, rotation: 0 },
                { id: 'puertaR', tipo: TIPO_PIEZA.PUERTA, nombre: 'Puerta Der', emoji: '🚪', width: 55, height: 170, color: '#654321', x: 135, y: 310, rotation: 0 },
                { id: 'bis1', tipo: TIPO_PIEZA.BISAGRA, nombre: 'Bisagra', emoji: '⚙', width: 10, height: 10, color: '#C0C0C0', x: 70, y: 490, rotation: 0 },
                { id: 'bis2', tipo: TIPO_PIEZA.BISAGRA, nombre: 'Bisagra', emoji: '⚙', width: 10, height: 10, color: '#C0C0C0', x: 90, y: 490, rotation: 0 },
                { id: 'bis3', tipo: TIPO_PIEZA.BISAGRA, nombre: 'Bisagra', emoji: '⚙', width: 10, height: 10, color: '#C0C0C0', x: 110, y: 490, rotation: 0 },
                { id: 'bis4', tipo: TIPO_PIEZA.BISAGRA, nombre: 'Bisagra', emoji: '⚙', width: 10, height: 10, color: '#C0C0C0', x: 130, y: 490, rotation: 0 },
                { id: 'pomo1', tipo: TIPO_PIEZA.POMO, nombre: 'Pomo', emoji: '●', width: 8, height: 8, color: '#FFD700', x: 70, y: 520, rotation: 0 },
                { id: 'pomo2', tipo: TIPO_PIEZA.POMO, nombre: 'Pomo', emoji: '●', width: 8, height: 8, color: '#FFD700', x: 90, y: 520, rotation: 0 }
            ],
            pasos: [
                { desc: '1. Une laterales con base y tapa', piezas: ['lateralL', 'lateralR', 'base', 'tapa'], tornillos: ['5x40', '5x40', '5x40', '5x40', '5x40', '5x40', '5x40', '5x40'], herramienta: 'phillips', posicion: { x: 320, y: 200 } },
                { desc: '2. Clava panel trasero', piezas: ['panel'], tornillos: ['clavo', 'clavo', 'clavo', 'clavo', 'clavo', 'clavo', 'clavo', 'clavo'], herramienta: 'martillo', posicion: { x: 320, y: 200 } },
                { desc: '3. Coloca baldas en soportes', piezas: ['balda1', 'balda2', 'balda3'], tornillos: [], herramienta: null, posicion: { x: 330, y: 250 } },
                { desc: '4. Atornilla bisagras en puertas', piezas: ['bis1', 'bis2', 'bis3', 'bis4'], tornillos: ['4x20', '4x20', '4x20', '4x20', '4x20', '4x20', '4x20', '4x20'], herramienta: 'phillips', posicion: { x: 250, y: 350 } },
                { desc: '5. Monta puertas en estructura', piezas: ['puertaL', 'puertaR'], tornillos: [], herramienta: null, posicion: { x: 285, y: 215 } },
                { desc: '6. Ajusta bisagras con nivel', piezas: [], tornillos: [], herramienta: 'nivel', posicion: null },
                { desc: '7. Coloca pomos en puertas', piezas: ['pomo1', 'pomo2'], tornillos: [], herramienta: null, posicion: { x: 340, y: 300 } }
            ],
            educacion: `🚪 ARMARIO CON PUERTAS

🔩 BISAGRAS:
• Permiten que la puerta gire
• Tipos: cazoleta, piano, pernio
• Ajuste en 3 ejes: arriba/abajo, izq/der, dentro/fuera

🔧 AJUSTE DE BISAGRAS:
• Tornillo lateral: mueve puerta izq/der
• Tornillo frontal: acerca/aleja del marco
• Tornillo superior: sube/baja puerta
• Usa destornillador plano para microajustes

📐 PANEL TRASERO:
• Estabiliza toda la estructura (triangulación)
• Sin él, el mueble se deforma con el tiempo
• Material: DM, contrachapado o cartón reforzado

📏 NIVELACIÓN:
• Puertas mal niveladas no cierran bien
• Dejar 2-3mm de holgura para dilatación

⚠️ ERRORES COMUNES:
❌ Olvidar panel trasero → armario se tuerce
❌ Apretar bisagras antes de nivelar → descuadre
❌ No dejar holgura → puertas rozan
❌ Baldas mal colocadas → caen

💰 COSTE REAL:
• Armario básico IKEA: 80-150€
• Armario calidad media: 200-400€
• Armario a medida: 500-1500€

🎓 DATO PRO:
Los muebles IKEA usan "tornillo excéntrico"
(cam lock): más rápido pero menos resistente
a desmontajes repetidos.

✅ ¡ENHORABUENA! Has dominado el montaje
de muebles complejos. Ya puedes montar
casi cualquier mueble siguiendo instrucciones.`
        }
    ];

    // ==================== ESTADO DEL JUEGO ====================
    let gameState = {
        nivel: 0,
        estado: 'menu', // menu, instrucciones, jugando, completado, education
        pasoActual: 0,
        piezas: [],
        piezasColocadas: [],
        tornilloSeleccionado: null,
        herramientaSeleccionada: null,
        piezaArrastrada: null,
        offsetX: 0,
        offsetY: 0,
        puntos: 0,
        tiempo: 0,
        errores: 0,
        mensajeFeedback: '',
        feedbackTimer: 0
    };

    // ==================== EVENTOS ====================
    function handleMouseDown(e) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (gameState.estado === 'menu') {
            handleMenuClick(x, y);
        } else if (gameState.estado === 'instrucciones') {
            handleInstruccionesClick(x, y);
        } else if (gameState.estado === 'jugando') {
            handleJugandoMouseDown(x, y);
        } else if (gameState.estado === 'completado') {
            handleCompletadoClick(x, y);
        } else if (gameState.estado === 'education') {
            handleEducationClick(x, y);
        }
    }

    function handleMouseMove(e) {
        if (gameState.estado === 'jugando' && gameState.piezaArrastrada) {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            gameState.piezaArrastrada.x = x - gameState.offsetX;
            gameState.piezaArrastrada.y = y - gameState.offsetY;
        }
    }

    function handleMouseUp(e) {
        if (gameState.estado === 'jugando' && gameState.piezaArrastrada) {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Verificar si se soltó en área de montaje
            if (x >= AREA_MONTAJE.x && x <= AREA_MONTAJE.x + AREA_MONTAJE.width &&
                y >= AREA_MONTAJE.y && y <= AREA_MONTAJE.y + AREA_MONTAJE.height) {
                
                // Snap to grid
                gameState.piezaArrastrada.x = Math.round(gameState.piezaArrastrada.x / GRID_SIZE) * GRID_SIZE;
                gameState.piezaArrastrada.y = Math.round(gameState.piezaArrastrada.y / GRID_SIZE) * GRID_SIZE;

                validarPaso();
            } else {
                // Devolver a posición original
                const piezaOriginal = NIVELES[gameState.nivel].piezas.find(p => p.id === gameState.piezaArrastrada.id);
                if (piezaOriginal) {
                    gameState.piezaArrastrada.x = piezaOriginal.x;
                    gameState.piezaArrastrada.y = piezaOriginal.y;
                }
            }

            gameState.piezaArrastrada = null;
        }
    }

    function handleMouseLeave() {
        if (gameState.piezaArrastrada) {
            const piezaOriginal = NIVELES[gameState.nivel].piezas.find(p => p.id === gameState.piezaArrastrada.id);
            if (piezaOriginal) {
                gameState.piezaArrastrada.x = piezaOriginal.x;
                gameState.piezaArrastrada.y = piezaOriginal.y;
            }
            gameState.piezaArrastrada = null;
        }
    }

    // ==================== HANDLERS ====================
    function handleMenuClick(x, y) {
        // Botones de niveles
        for (let i = 0; i < NIVELES.length; i++) {
            const btnY = 150 + i * 100;
            if (x >= 250 && x <= 650 && y >= btnY && y <= btnY + 70) {
                iniciarNivel(i);
                return;
            }
        }
    }

    function handleInstruccionesClick(x, y) {
        // Botón "Comenzar"
        if (x >= 350 && x <= 550 && y >= 520 && y <= 570) {
            gameState.estado = 'jugando';
            gameState.tiempo = NIVELES[gameState.nivel].tiempo;
        }
    }

    function handleJugandoMouseDown(x, y) {
        // Click en tornillos
        const tornilloY = 20;
        for (let i = 0; i < TORNILLOS.length; i++) {
            const tornilloX = 210 + i * 100;
            if (x >= tornilloX && x <= tornilloX + 90 && y >= tornilloY && y <= tornilloY + 30) {
                gameState.tornilloSeleccionado = TORNILLOS[i].id;
                validarPaso();
                return;
            }
        }

        // Click en herramientas
        const herramientaY = 55;
        for (let i = 0; i < HERRAMIENTAS.length; i++) {
            const herramientaX = 210 + i * 110;
            if (x >= herramientaX && x <= herramientaX + 100 && y >= herramientaY && y <= herramientaY + 30) {
                gameState.herramientaSeleccionada = HERRAMIENTAS[i].id;
                validarPaso();
                return;
            }
        }

        // Arrastre de piezas
        if (x >= AREA_PIEZAS.x && x <= AREA_PIEZAS.x + AREA_PIEZAS.width) {
            for (let i = gameState.piezas.length - 1; i >= 0; i--) {
                const pieza = gameState.piezas[i];
                if (x >= pieza.x && x <= pieza.x + pieza.width &&
                    y >= pieza.y && y <= pieza.y + pieza.height) {
                    gameState.piezaArrastrada = pieza;
                    gameState.offsetX = x - pieza.x;
                    gameState.offsetY = y - pieza.y;
                    return;
                }
            }
        }
    }

    function handleCompletadoClick(x, y) {
        // Botón "Continuar"
        if (x >= 350 && x <= 550 && y >= 480 && y <= 530) {
            gameState.estado = 'education';
        }
    }

    function handleEducationClick(x, y) {
        // Botón "Siguiente Nivel" o "Menú"
        if (x >= 350 && x <= 550 && y >= 520 && y <= 570) {
            if (gameState.nivel < NIVELES.length - 1) {
                iniciarNivel(gameState.nivel + 1);
            } else {
                gameState.estado = 'menu';
            }
        }
    }

    // ==================== LÓGICA DEL JUEGO ====================
    function iniciarNivel(nivel) {
        gameState.nivel = nivel;
        gameState.estado = 'instrucciones';
        gameState.pasoActual = 0;
        gameState.piezas = JSON.parse(JSON.stringify(NIVELES[nivel].piezas));
        gameState.piezasColocadas = [];
        gameState.tornilloSeleccionado = null;
        gameState.herramientaSeleccionada = null;
        gameState.piezaArrastrada = null;
        gameState.puntos = 0;
        gameState.tiempo = NIVELES[nivel].tiempo;
        gameState.errores = 0;
        gameState.mensajeFeedback = '';
        gameState.feedbackTimer = 0;
    }

    function validarPaso() {
        const nivel = NIVELES[gameState.nivel];
        const paso = nivel.pasos[gameState.pasoActual];

        // Verificar si se necesitan piezas
        if (paso.piezas && paso.piezas.length > 0) {
            const piezasEnMontaje = gameState.piezas.filter(p => 
                p.x >= AREA_MONTAJE.x && p.x <= AREA_MONTAJE.x + AREA_MONTAJE.width &&
                p.y >= AREA_MONTAJE.y && p.y <= AREA_MONTAJE.y + AREA_MONTAJE.height
            );

            const piezasCorrectas = piezasEnMontaje.filter(p => paso.piezas.includes(p.id));
            
            if (piezasCorrectas.length === paso.piezas.length) {
                // Verificar posición aproximada
                if (paso.posicion) {
                    const todasEnPosicion = piezasCorrectas.every(p => {
                        const dx = Math.abs(p.x - paso.posicion.x);
                        const dy = Math.abs(p.y - paso.posicion.y);
                        return dx < 100 && dy < 100; // Tolerancia amplia
                    });

                    if (!todasEnPosicion) {
                        return; // Aún no en posición correcta
                    }
                }

                // Marcar piezas como colocadas
                piezasCorrectas.forEach(p => {
                    if (!gameState.piezasColocadas.includes(p.id)) {
                        gameState.piezasColocadas.push(p.id);
                    }
                });
            } else {
                return; // Faltan piezas
            }
        }

        // Verificar tornillos
        if (paso.tornillos && paso.tornillos.length > 0 && !gameState.tornilloSeleccionado) {
            return; // Necesita seleccionar tornillo
        }

        // Verificar herramienta
        if (paso.herramienta && gameState.herramientaSeleccionada !== paso.herramienta) {
            if (gameState.herramientaSeleccionada && gameState.tornilloSeleccionado) {
                mostrarFeedback('❌ Herramienta incorrecta', 'error');
                gameState.errores++;
                gameState.herramientaSeleccionada = null;
                gameState.tornilloSeleccionado = null;
            }
            return;
        }

        // Paso completado
        if (paso.piezas.length === 0 || gameState.piezasColocadas.filter(id => paso.piezas.includes(id)).length === paso.piezas.length) {
            if (!paso.tornillos || paso.tornillos.length === 0 || gameState.tornilloSeleccionado) {
                if (!paso.herramienta || gameState.herramientaSeleccionada === paso.herramienta) {
                    completarPaso();
                }
            }
        }
    }

    function completarPaso() {
        mostrarFeedback('✅ ¡Correcto! +50 puntos', 'success');
        gameState.puntos += 50;
        gameState.pasoActual++;
        gameState.tornilloSeleccionado = null;
        gameState.herramientaSeleccionada = null;

        if (gameState.pasoActual >= NIVELES[gameState.nivel].pasos.length) {
            completarNivel();
        }
    }

    function completarNivel() {
        const bonusTiempo = Math.max(0, gameState.tiempo * 2);
        const bonusErrores = Math.max(0, (10 - gameState.errores) * 20);
        gameState.puntos += bonusTiempo + bonusErrores;

        // Guardar mejor puntuación
        const bestKey = 'montaMuebleBest';
        const bestScore = parseInt(localStorage.getItem(bestKey)) || 0;
        if (gameState.puntos > bestScore) {
            localStorage.setItem(bestKey, gameState.puntos);
        }

        gameState.estado = 'completado';
    }

    function mostrarFeedback(mensaje, tipo) {
        gameState.mensajeFeedback = mensaje;
        gameState.feedbackTimer = 2; // segundos
    }

    // ==================== RENDERIZADO ====================
    function drawMenu() {
        ctx.fillStyle = '#2C5F2D';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🪑 MONTA UN MUEBLE 🔧', 450, 80);

        ctx.font = '18px Arial';
        ctx.fillText('Aprende a montar muebles siguiendo instrucciones', 450, 110);

        // Botones de niveles
        for (let i = 0; i < NIVELES.length; i++) {
            const nivel = NIVELES[i];
            const y = 150 + i * 100;

            ctx.fillStyle = '#4CAF50';
            ctx.fillRect(250, y, 400, 70);

            ctx.fillStyle = '#fff';
            ctx.font = 'bold 20px Arial';
            ctx.fillText(nivel.nombre, 450, y + 25);

            ctx.font = '16px Arial';
            ctx.fillText(`Dificultad: ${nivel.dificultad}`, 450, y + 50);
        }

        // Mejor puntuación
        const bestScore = parseInt(localStorage.getItem('montaMuebleBest')) || 0;
        ctx.fillStyle = '#fff';
        ctx.font = '18px Arial';
        ctx.fillText(`🏆 Mejor Puntuación: ${bestScore}`, 450, 550);
    }

    function drawInstrucciones() {
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const nivel = NIVELES[gameState.nivel];

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(nivel.nombre, 450, 40);

        ctx.font = '18px Arial';
        ctx.fillText(`Dificultad: ${nivel.dificultad} | Tiempo: ${Math.floor(nivel.tiempo / 60)}:${(nivel.tiempo % 60).toString().padStart(2, '0')} min`, 450, 70);

        // Diagrama del mueble
        ctx.fillStyle = '#333';
        ctx.fillRect(150, 100, 600, 350);

        ctx.fillStyle = '#fff';
        ctx.font = '20px Arial';
        ctx.fillText('📋 DIAGRAMA DEL MUEBLE', 450, 140);

        // Dibujar piezas del mueble montado (simplificado)
        ctx.fillStyle = '#666';
        ctx.font = '16px Arial';
        let yPos = 180;
        nivel.pasos.forEach((paso, i) => {
            ctx.fillText(`${i + 1}. ${paso.desc}`, 450, yPos);
            yPos += 30;
        });

        // Botón comenzar
        ctx.fillStyle = '#4CAF50';
        ctx.fillRect(350, 520, 200, 50);

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 20px Arial';
        ctx.fillText('▶ COMENZAR', 450, 552);
    }

    function drawJugando() {
        // Fondo
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // TopBar con info
        ctx.fillStyle = '#2C5F2D';
        ctx.fillRect(0, 0, canvas.width, 50);

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`📊 ${NIVELES[gameState.nivel].nombre}`, 10, 30);

        ctx.textAlign = 'center';
        const minutos = Math.floor(gameState.tiempo / 60);
        const segundos = gameState.tiempo % 60;
        ctx.fillText(`⏱️ ${minutos}:${segundos.toString().padStart(2, '0')}`, 450, 30);

        ctx.textAlign = 'right';
        ctx.fillText(`⭐ ${gameState.puntos}`, 890, 30);

        // Toolbar de tornillos
        ctx.fillStyle = '#ddd';
        ctx.fillRect(200, 10, 510, 30);

        ctx.fillStyle = '#000';
        ctx.font = '14px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('🔩 Tornillos:', 205, 30);

        for (let i = 0; i < TORNILLOS.length; i++) {
            const tornillo = TORNILLOS[i];
            const x = 280 + i * 100;
            
            if (gameState.tornilloSeleccionado === tornillo.id) {
                ctx.fillStyle = '#4CAF50';
                ctx.fillRect(x - 5, 15, 90, 25);
            }

            ctx.fillStyle = '#000';
            ctx.font = '12px Arial';
            ctx.fillText(`${tornillo.emoji} ${tornillo.nombre}`, x, 30);
        }

        // Toolbar de herramientas
        ctx.fillStyle = '#ddd';
        ctx.fillRect(200, 45, 600, 30);

        ctx.fillStyle = '#000';
        ctx.font = '14px Arial';
        ctx.fillText('🔧 Herramientas:', 205, 65);

        for (let i = 0; i < HERRAMIENTAS.length; i++) {
            const herramienta = HERRAMIENTAS[i];
            const x = 320 + i * 110;

            if (gameState.herramientaSeleccionada === herramienta.id) {
                ctx.fillStyle = '#4CAF50';
                ctx.fillRect(x - 5, 50, 100, 25);
            }

            ctx.fillStyle = '#000';
            ctx.font = '12px Arial';
            ctx.fillText(`${herramienta.emoji} ${herramienta.nombre.split(' ')[1] || herramienta.nombre}`, x, 65);
        }

        // Área de piezas
        ctx.fillStyle = '#e0e0e0';
        ctx.fillRect(AREA_PIEZAS.x, AREA_PIEZAS.y, AREA_PIEZAS.width, AREA_PIEZAS.height);
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.strokeRect(AREA_PIEZAS.x, AREA_PIEZAS.y, AREA_PIEZAS.width, AREA_PIEZAS.height);

        ctx.fillStyle = '#000';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('📦 PIEZAS', AREA_PIEZAS.x + AREA_PIEZAS.width / 2, AREA_PIEZAS.y - 10);

        // Dibujar piezas disponibles
        gameState.piezas.forEach(pieza => {
            if (!gameState.piezasColocadas.includes(pieza.id)) {
                ctx.fillStyle = pieza.color;
                ctx.fillRect(pieza.x, pieza.y, pieza.width, pieza.height);
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 1;
                ctx.strokeRect(pieza.x, pieza.y, pieza.width, pieza.height);

                ctx.fillStyle = '#fff';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(pieza.emoji, pieza.x + pieza.width / 2, pieza.y + pieza.height / 2 + 5);
            }
        });

        // Área de montaje
        ctx.fillStyle = '#fff';
        ctx.fillRect(AREA_MONTAJE.x, AREA_MONTAJE.y, AREA_MONTAJE.width, AREA_MONTAJE.height);
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.strokeRect(AREA_MONTAJE.x, AREA_MONTAJE.y, AREA_MONTAJE.width, AREA_MONTAJE.height);

        ctx.fillStyle = '#000';
        ctx.font = 'bold 16px Arial';
        ctx.fillText('🛠️ ÁREA DE MONTAJE', AREA_MONTAJE.x + AREA_MONTAJE.width / 2, AREA_MONTAJE.y - 10);

        // Dibujar piezas en área de montaje
        gameState.piezas.forEach(pieza => {
            if (pieza.x >= AREA_MONTAJE.x && pieza.x <= AREA_MONTAJE.x + AREA_MONTAJE.width) {
                ctx.fillStyle = pieza.color;
                ctx.fillRect(pieza.x, pieza.y, pieza.width, pieza.height);
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 2;
                ctx.strokeRect(pieza.x, pieza.y, pieza.width, pieza.height);

                if (gameState.piezasColocadas.includes(pieza.id)) {
                    ctx.fillStyle = 'rgba(76, 175, 80, 0.3)';
                    ctx.fillRect(pieza.x, pieza.y, pieza.width, pieza.height);
                    ctx.fillStyle = '#4CAF50';
                    ctx.font = 'bold 20px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText('✓', pieza.x + pieza.width / 2, pieza.y + pieza.height / 2 + 8);
                }
            }
        });

        // Área de instrucciones
        ctx.fillStyle = '#e0e0e0';
        ctx.fillRect(AREA_INSTRUCCIONES.x, AREA_INSTRUCCIONES.y, AREA_INSTRUCCIONES.width, AREA_INSTRUCCIONES.height);
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.strokeRect(AREA_INSTRUCCIONES.x, AREA_INSTRUCCIONES.y, AREA_INSTRUCCIONES.width, AREA_INSTRUCCIONES.height);

        ctx.fillStyle = '#000';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('📋 PASOS', AREA_INSTRUCCIONES.x + AREA_INSTRUCCIONES.width / 2, AREA_INSTRUCCIONES.y - 10);

        // Mostrar pasos
        const nivel = NIVELES[gameState.nivel];
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        let yPos = AREA_INSTRUCCIONES.y + 20;

        nivel.pasos.forEach((paso, i) => {
            if (i === gameState.pasoActual) {
                ctx.fillStyle = '#4CAF50';
                ctx.fillRect(AREA_INSTRUCCIONES.x + 5, yPos - 12, 170, 50);
                ctx.fillStyle = '#fff';
            } else if (i < gameState.pasoActual) {
                ctx.fillStyle = '#888';
            } else {
                ctx.fillStyle = '#000';
            }

            const lines = wrapText(paso.desc, 160);
            lines.forEach(line => {
                ctx.fillText(line, AREA_INSTRUCCIONES.x + 10, yPos);
                yPos += 15;
            });
            yPos += 10;
        });

        // Feedback
        if (gameState.feedbackTimer > 0) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(250, 250, 400, 100);

            ctx.fillStyle = '#fff';
            ctx.font = 'bold 24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(gameState.mensajeFeedback, 450, 310);
        }
    }

    function drawCompletado() {
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 36px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🎉 ¡NIVEL COMPLETADO! 🎉', 450, 100);

        ctx.fillStyle = '#fff';
        ctx.font = '24px Arial';
        ctx.fillText(`Puntuación: ${gameState.puntos}`, 450, 200);

        const minutos = Math.floor((NIVELES[gameState.nivel].tiempo - gameState.tiempo) / 60);
        const segundos = (NIVELES[gameState.nivel].tiempo - gameState.tiempo) % 60;
        ctx.fillText(`⏱️ Tiempo: ${minutos}:${segundos.toString().padStart(2, '0')}`, 450, 250);

        ctx.fillText(`❌ Errores: ${gameState.errores}`, 450, 300);

        // Desglose puntuación
        ctx.font = '18px Arial';
        ctx.fillText(`Pasos completados: ${gameState.pasoActual * 50} pts`, 450, 360);
        const bonusTiempo = Math.max(0, gameState.tiempo * 2);
        ctx.fillText(`Bonus tiempo: ${bonusTiempo} pts`, 450, 390);
        const bonusErrores = Math.max(0, (10 - gameState.errores) * 20);
        ctx.fillText(`Bonus precisión: ${bonusErrores} pts`, 450, 420);

        // Botón continuar
        ctx.fillStyle = '#4CAF50';
        ctx.fillRect(350, 480, 200, 50);

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 20px Arial';
        ctx.fillText('▶ CONTINUAR', 450, 512);
    }

    function drawEducation() {
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const nivel = NIVELES[gameState.nivel];

        ctx.fillStyle = '#4CAF50';
        ctx.font = 'bold 28px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('📚 CONTENIDO EDUCATIVO', 450, 50);

        // Mostrar contenido educativo
        ctx.fillStyle = '#fff';
        ctx.font = '14px Courier New';
        ctx.textAlign = 'left';

        const lines = nivel.educacion.split('\n');
        let yPos = 100;
        lines.forEach(line => {
            if (line.trim().startsWith('🔩') || line.trim().startsWith('🔧') || 
                line.trim().startsWith('📐') || line.trim().startsWith('📏') ||
                line.trim().startsWith('⚠️') || line.trim().startsWith('💰') ||
                line.trim().startsWith('🎓') || line.trim().startsWith('✅') ||
                line.trim().startsWith('🏗️') || line.trim().startsWith('🚪')) {
                ctx.fillStyle = '#FFD700';
                ctx.font = 'bold 16px Courier New';
            } else if (line.trim().startsWith('•') || line.trim().startsWith('❌')) {
                ctx.fillStyle = '#ccc';
                ctx.font = '14px Courier New';
            } else {
                ctx.fillStyle = '#fff';
                ctx.font = '14px Courier New';
            }

            ctx.fillText(line, 50, yPos);
            yPos += 18;

            if (yPos > 480) return; // Limitar altura
        });

        // Botón siguiente
        ctx.fillStyle = '#4CAF50';
        ctx.fillRect(350, 520, 200, 50);

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';

        if (gameState.nivel < NIVELES.length - 1) {
            ctx.fillText('▶ SIGUIENTE NIVEL', 450, 552);
        } else {
            ctx.fillText('🏠 MENÚ PRINCIPAL', 450, 552);
        }
    }

    function wrapText(text, maxWidth) {
        const words = text.split(' ');
        const lines = [];
        let currentLine = '';

        words.forEach(word => {
            const testLine = currentLine + (currentLine ? ' ' : '') + word;
            const metrics = ctx.measureText(testLine);
            if (metrics.width > maxWidth && currentLine) {
                lines.push(currentLine);
                currentLine = word;
            } else {
                currentLine = testLine;
            }
        });

        if (currentLine) {
            lines.push(currentLine);
        }

        return lines;
    }

    // ==================== GAME LOOP ====================
    function gameLoop(timestamp) {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Render según estado
        if (gameState.estado === 'menu') {
            drawMenu();
        } else if (gameState.estado === 'instrucciones') {
            drawInstrucciones();
        } else if (gameState.estado === 'jugando') {
            drawJugando();

            // Timer countdown
            if (!gameState.lastTimestamp) {
                gameState.lastTimestamp = timestamp;
            }

            const deltaTime = (timestamp - gameState.lastTimestamp) / 1000;
            gameState.lastTimestamp = timestamp;

            gameState.tiempo = Math.max(0, gameState.tiempo - deltaTime);
            
            if (gameState.tiempo <= 0) {
                mostrarFeedback('⏰ ¡Tiempo agotado!', 'error');
                setTimeout(() => {
                    gameState.estado = 'menu';
                }, 2000);
            }

            // Feedback timer
            if (gameState.feedbackTimer > 0) {
                gameState.feedbackTimer -= deltaTime;
            }

        } else if (gameState.estado === 'completado') {
            drawCompletado();
        } else if (gameState.estado === 'education') {
            drawEducation();
        }

        animationFrameId = requestAnimationFrame(gameLoop);
    }

    // ==================== INICIALIZACIÓN ====================
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    gameState.estado = 'menu';
    gameLoop(0);

    // ==================== CLEANUP ====================
    return function cleanup() {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
        canvas.removeEventListener('mousedown', handleMouseDown);
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mouseup', handleMouseUp);
        canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
}

window.registerGame = registerGame;
