function registerGame() {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        console.error('Canvas gameCanvas no encontrado');
        return () => {};
    }

    const ctx = canvas.getContext('2d');
    let animationFrameId = null;

    // ==================== CONFIGURACIÓN ====================
    const TIEMPO_POR_NIVEL = 120; // segundos

    // ==================== TIPOS DE RIESGOS ====================
    const TIPO_RIESGO = {
        ELECTRICO: 'electrico',
        FUEGO: 'fuego',
        QUIMICA: 'quimica',
        CAIDA: 'caida',
        CORTE: 'corte',
        AGUA: 'agua',
        AHOGO: 'ahogo'
    };

    // ==================== NIVELES ====================
    const NIVELES = [
        {
            id: 1,
            nombre: '🍳 Nivel 1: Seguridad en la Cocina',
            dificultad: '⭐☆☆☆☆',
            tiempo: 120,
            escena: 'cocina',
            riesgos: [
                { id: 1, tipo: TIPO_RIESGO.FUEGO, x: 200, y: 300, width: 60, height: 60, emoji: '🔥', encontrado: false,
                  descripcion: 'Fuego sin vigilar',
                  explicacion: '⚠️ RIESGO: Fuego sin supervisión\n\n❌ PELIGRO:\n• Incendio si se derrama\n• Quemaduras graves\n• Humos tóxicos\n\n✅ PREVENCIÓN:\n• NUNCA dejes fuego solo\n• Manija hacia dentro\n• Extintores accesibles\n\n📞 EN EMERGENCIA:\n• Llamar al 112\n• Apagar gas/vitro\n• Tapar con tapa (NO agua)' },
                
                { id: 2, tipo: TIPO_RIESGO.ELECTRICO, x: 500, y: 350, width: 50, height: 40, emoji: '⚡', encontrado: false,
                  descripcion: 'Enchufe sobrecargado',
                  explicacion: '⚠️ RIESGO: Regleta sobrecargada\n\n❌ PELIGRO:\n• Sobrecalentamiento\n• Cortocircuito\n• Incendio eléctrico\n\n✅ PREVENCIÓN:\n• Máximo 3 aparatos por regleta\n• No conectar calefactores\n• Revisar cables dañados\n\n💡 REGLA:\nW totales < 3000W por enchufe\n(suma W de cada aparato)' },
                
                { id: 3, tipo: TIPO_RIESGO.CORTE, x: 350, y: 250, width: 40, height: 50, emoji: '🔪', encontrado: false,
                  descripcion: 'Cuchillo al borde',
                  explicacion: '⚠️ RIESGO: Cuchillo mal colocado\n\n❌ PELIGRO:\n• Caída al menor roce\n• Cortes graves (niños)\n• Accidentes evitables\n\n✅ PREVENCIÓN:\n• Guardar en taco/cajón\n• Nunca al borde\n• Filo hacia dentro en fregadero\n• Enseñar a niños: NO tocar\n\n🏥 SI CORTE PROFUNDO:\n1. Presión directa con gasa\n2. Elevar zona\n3. Llamar 112 si no para' },
                
                { id: 4, tipo: TIPO_RIESGO.FUEGO, x: 650, y: 280, width: 50, height: 50, emoji: '🧯', encontrado: false,
                  descripcion: 'Falta extintor',
                  explicacion: '✅ SOLUCIÓN: Extintor en cocina\n\n📌 UBICACIÓN:\n• Visible y accesible\n• Cerca de salida\n• Altura 1.5m del suelo\n\n🔥 TIPOS DE FUEGO:\n• Clase A: Sólidos (madera)\n• Clase B: Líquidos (aceite)\n• Clase C: Gases\n• Clase F: Cocina (aceite/grasa)\n\n🧯 USO:\n1. Quitar seguro\n2. Apuntar a la BASE\n3. Apretar gatillo\n4. Movimiento abanico\n\n⚠️ Si no sabes, EVACUA' },
                
                { id: 5, tipo: TIPO_RIESGO.QUIMICA, x: 450, y: 450, width: 40, height: 50, emoji: '🧴', encontrado: false,
                  descripcion: 'Productos peligrosos accesibles',
                  explicacion: '⚠️ RIESGO: Productos tóxicos al alcance\n\n❌ PELIGRO:\n• Intoxicación (niños)\n• Quemaduras químicas\n• Inhalación tóxica\n\n✅ PREVENCIÓN:\n• Armario alto con llave\n• Etiquetas visibles\n• Nunca en botellas de refresco\n\n☠️ PELIGRO EXTREMO:\nLEJÍA + AMONÍACO = GAS LETAL\nNUNCA mezclar productos\n\n☎️ INTOXICACIÓN:\nLlamar 915 620 420\n(Centro de Toxicología)' }
            ],
            educacion: `🍳 SEGURIDAD EN LA COCINA

🔥 PREVENCIÓN DE INCENDIOS:
• NUNCA dejar fuego sin vigilar
• Manijas de sartenes hacia dentro
• Campana extractora limpia (grasa + fuego = incendio)
• Extintor ABC accesible

⚡ SEGURIDAD ELÉCTRICA:
• Manos secas antes de enchufes
• No sobrecargar regletas
• Electrodomésticos con toma tierra
• Revisar cables dañados

🔪 PREVENCIÓN DE CORTES:
• Cuchillos guardados en bloque/cajón
• Cortar sobre tabla estable
• Nunca atrapar cuchillo que cae
• Enseñar seguridad a niños

🧴 PRODUCTOS QUÍMICOS:
• Armario alto cerrado
• No mezclar productos
• Ventilación al usar
• Guantes de protección

📞 EMERGENCIAS:
• 112: Emergencias generales
• 915 620 420: Toxicología
• Tener botiquín básico

✅ Has aprendido a identificar los
principales riesgos de la cocina.
¡Comparte estos consejos en casa!`
        },
        {
            id: 2,
            nombre: '🛁 Nivel 2: Seguridad en el Baño',
            dificultad: '⭐⭐⭐☆☆',
            tiempo: 120,
            escena: 'baño',
            riesgos: [
                { id: 1, tipo: TIPO_RIESGO.ELECTRICO, x: 250, y: 280, width: 50, height: 40, emoji: '🔌', encontrado: false,
                  descripcion: 'Enchufe cerca del agua',
                  explicacion: '⚠️ RIESGO: Electricidad + Agua\n\n❌ PELIGRO MORTAL:\n• Electrocución instantánea\n• Paro cardíaco\n• Muerte\n\n✅ PREVENCIÓN:\n• Enchufes a +60cm de grifos\n• Secador lejos de bañera\n• Manos SECAS siempre\n• Corte diferencial obligatorio\n\n⚡ ELECTROCUCIÓN:\n1. NO tocar a la víctima\n2. Cortar electricidad\n3. Llamar 112\n4. RCP si sabes' },
                
                { id: 2, tipo: TIPO_RIESGO.CAIDA, x: 450, y: 400, width: 60, height: 50, emoji: '💦', encontrado: false,
                  descripcion: 'Suelo mojado resbaladizo',
                  explicacion: '⚠️ RIESGO: Caída por resbalón\n\n❌ PELIGRO:\n• Traumatismo craneal\n• Fracturas (caderas, muñecas)\n• Especial riesgo: mayores\n\n✅ PREVENCIÓN:\n• Alfombrilla antideslizante\n• Secar inmediatamente\n• Barras de apoyo\n• Zapatos con suela agarre\n\n🏥 CAÍDA GRAVE:\n• NO mover si dolor cuello\n• Llamar 112\n• Abrigar (shock)\n\n👴 MAYORES:\nCaídas = principal causa hospitalización' },
                
                { id: 3, tipo: TIPO_RIESGO.QUIMICA, x: 600, y: 300, width: 40, height: 50, emoji: '🧪', encontrado: false,
                  descripcion: 'Lejía y amoníaco juntos',
                  explicacion: '☠️ RIESGO MORTAL: Mezcla letal\n\n❌ LEJÍA + AMONÍACO:\n• Gas cloramina (TÓXICO)\n• Daño pulmonar irreversible\n• Muerte por asfixia\n\n⚠️ OTROS PELIGROS:\n• Lejía + ácidos = cloro gás\n• Amoníaco + ácidos = vapores\n\n✅ REGLA DE ORO:\nNUNCA mezclar productos limpieza\n\n🚑 INHALACIÓN:\n1. Aire fresco YA\n2. Llamar 112\n3. Posición semisentada\n4. NO provocar vómito\n\n📌 ETIQUETA:\nLeer SIEMPRE advertencias' },
                
                { id: 4, tipo: TIPO_RIESGO.AHOGO, x: 350, y: 200, width: 50, height: 50, emoji: '🛁', encontrado: false,
                  descripcion: 'Niño solo en bañera',
                  explicacion: '⚠️ RIESGO: Ahogamiento infantil\n\n❌ DATO TERRIBLE:\nBastan 5cm de agua y 2 minutos\npara que un bebé se ahogue\n\n✅ REGLA ABSOLUTA:\nNUNCA dejar bebés/niños solos\nen bañera, NI UN SEGUNDO\n\n🚨 PREVENCIÓN:\n• Supervisión constante\n• Vaciar bañera inmediatamente\n• Cerrar puerta baño\n• Asiento antideslizante\n\n🆘 AHOGAMIENTO:\n1. Sacar de agua\n2. Llamar 112\n3. RCP si no respira\n4. Posición lateral si respira\n\n⏱️ Cada segundo cuenta' },
                
                { id: 5, tipo: TIPO_RIESGO.QUIMICA, x: 520, y: 450, width: 40, height: 40, emoji: '🔒', encontrado: false,
                  descripcion: 'Medicamentos sin cerrar',
                  explicacion: '⚠️ RIESGO: Intoxicación medicamentos\n\n❌ PELIGRO:\n• Intoxicación infantil\n• Sobredosis accidental\n• Muerte (dosis incorrecta)\n\n✅ PREVENCIÓN:\n• Botiquín alto con llave\n• Verificar caducidad\n• Leer prospectos\n• Nunca llamarlos "caramelos"\n\n💊 ALMACENAMIENTO:\n• Lugar fresco y seco\n• Envase original\n• Fuera alcance niños\n\n☎️ INTOXICACIÓN:\n1. Llamar 915 620 420 (24h)\n2. Llevar envase al hospital\n3. NO provocar vómito salvo indicación\n4. NO dar leche/agua sin consultar\n\n📋 Lista medicamentos hogar' }
            ],
            educacion: `🛁 SEGURIDAD EN EL BAÑO

⚡💧 ELECTRICIDAD + AGUA = MUERTE:
• Enchufes lejos de puntos de agua
• Diferencial obligatorio (salta en 0.03s)
• Manos secas SIEMPRE
• No móviles en bañera

💦 PREVENCIÓN DE CAÍDAS:
• Alfombrilla antideslizante
• Barras de apoyo (mayores)
• Secar suelos inmediatamente
• Iluminación adecuada

☠️ PRODUCTOS QUÍMICOS:
• NUNCA mezclar lejía y amoníaco
• Ventilación al limpiar
• Guantes protectores
• Armario cerrado con llave

👶 SEGURIDAD INFANTIL:
• NUNCA dejar niños solos en bañera
• Bastan 5cm agua para ahogarse
• Vaciar inmediatamente
• Supervisión 100% del tiempo

💊 MEDICAMENTOS:
• Botiquín alto cerrado
• Verificar caducidades
• Nunca llamarlos "caramelos"
• Centro Toxicología: 915 620 420

✅ El baño es uno de los lugares
más peligrosos del hogar si no
tomamos precauciones básicas.`
        },
        {
            id: 3,
            nombre: '🏠 Nivel 3: Seguridad en Toda la Casa',
            dificultad: '⭐⭐⭐⭐☆',
            tiempo: 180,
            escena: 'casa',
            riesgos: [
                { id: 1, tipo: TIPO_RIESGO.CAIDA, x: 300, y: 350, width: 60, height: 80, emoji: '🪜', encontrado: false,
                  descripcion: 'Escalera inestable',
                  explicacion: '⚠️ RIESGO: Caída desde altura\n\n❌ PELIGRO:\n• Fracturas graves\n• Traumatismo craneal\n• Muerte (caída >2 metros)\n\n✅ USO CORRECTO ESCALERA:\n• Base firme y nivelada\n• Ángulo 75° (1:4)\n• 3 puntos apoyo siempre\n• Nunca en último escalón\n• Otra persona sujetando\n\n🚫 ERRORES MORTALES:\n• Poner sobre objetos\n• Alcanzar demasiado lejos\n• Usar con viento\n• Escalera dañada\n\n🏥 CAÍDA:\n• NO mover si dolor cuello/espalda\n• 112 inmediatamente' },
                
                { id: 2, tipo: TIPO_RIESGO.ELECTRICO, x: 550, y: 280, width: 50, height: 40, emoji: '🔥', encontrado: false,
                  descripcion: 'Cable pelado',
                  explicacion: '⚠️ RIESGO: Cable deteriorado\n\n❌ PELIGRO:\n• Descarga eléctrica\n• Cortocircuito\n• Incendio\n\n✅ PREVENCIÓN:\n• Revisar cables regularmente\n• Cambiar si pelados/rotos\n• No pasar bajo alfombras\n• No tensar cables\n\n🔧 REEMPLAZO:\n1. Cortar electricidad\n2. Verificar con tester\n3. Cable sección adecuada\n4. Nunca empalmes con cinta\n\n⚡ INSTALADOR:\nTrabajos eléctricos = profesional\nNo improvisaciones' },
                
                { id: 3, tipo: TIPO_RIESGO.CAIDA, x: 200, y: 480, width: 50, height: 40, emoji: '🧸', encontrado: false,
                  descripcion: 'Juguetes en escalera',
                  explicacion: '⚠️ RIESGO: Tropiezo en escalera\n\n❌ PELIGRO:\n• Caída rodando escaleras\n• Fractura múltiple\n• Especial riesgo: mayores\n\n✅ PREVENCIÓN:\n• Escaleras SIEMPRE despejadas\n• Barandilla obligatoria\n• Iluminación adecuada\n• Pasamanos ambos lados\n\n👴 MAYORES:\nBarandilla en toda la casa\n(80% caídas son escaleras)\n\n🏠 ORDEN:\nCada cosa en su sitio\nNo dejar objetos en paso' },
                
                { id: 4, tipo: TIPO_RIESGO.CAIDA, x: 650, y: 200, width: 50, height: 60, emoji: '🪟', encontrado: false,
                  descripcion: 'Ventana sin protección',
                  explicacion: '⚠️ RIESGO: Caída por ventana\n\n❌ DATO TERRIBLE:\nCaídas ventana = principal causa\nmuerte infantil doméstica\n\n✅ PROTECCIÓN OBLIGATORIA:\n• Rejas/barrotes (máx 10cm separación)\n• Bloqueo ventana (abrir solo 10cm)\n• Pestillo de seguridad alto\n• Muebles lejos de ventanas\n\n🚨 NIÑOS:\n• Nunca dejar solos\n• Mosquiteras NO protegen\n• Cristal NO frena caída\n\n📏 NORMATIVA:\nVentanas >1m altura = protección\n\n👶 BEBÉS:\nCuriosos = peligro constante' },
                
                { id: 5, tipo: TIPO_RIESGO.FUEGO, x: 450, y: 380, width: 50, height: 50, emoji: '💨', encontrado: false,
                  descripcion: 'Detector humo sin pilas',
                  explicacion: '✅ SOLUCIÓN: Detector funcionando\n\n📊 ESTADÍSTICA:\nDetectores humo reducen muertes\nen incendios un 50%\n\n🔋 MANTENIMIENTO:\n• Revisar mensualmente (botón test)\n• Cambiar pilas anualmente\n• Reemplazar cada 10 años\n• Limpiar polvo regularmente\n\n📍 UBICACIÓN:\n• Cada planta de la casa\n• Pasillo cerca dormitorios\n• Techo (humo sube)\n• Lejos cocina (falsas alarmas)\n\n🚨 AL SONAR:\n1. Despertar a todos\n2. Salir agachado (humo arriba)\n3. Cerrar puertas\n4. Llamar 112 desde fuera\n5. NUNCA volver' },
                
                { id: 6, tipo: TIPO_RIESGO.QUIMICA, x: 380, y: 500, width: 40, height: 40, emoji: '🧴', encontrado: false,
                  descripcion: 'Productos limpieza desordenados',
                  explicacion: '⚠️ RIESGO: Intoxicación química\n\n❌ PELIGRO:\n• Inhalación vapores\n• Contacto piel/ojos\n• Ingesta accidental\n• Mezclas peligrosas\n\n✅ ALMACENAMIENTO:\n• Armario bajo llave\n• Ventilado\n• Etiquetas visibles\n• Envase original\n\n☠️ MEZCLAS LETALES:\n• Lejía + amoníaco\n• Lejía + vinagre\n• Lejía + alcohol\n\n🧤 USO:\n• Guantes\n• Ventilación\n• Leer etiqueta\n• Guardar inmediatamente' }
            ],
            educacion: `🏠 SEGURIDAD INTEGRAL DEL HOGAR

🪜 PREVENCIÓN DE CAÍDAS:
• Escaleras despejadas
• Barandillas seguras
• Iluminación adecuada
• Alfombras fijadas

⚡ SEGURIDAD ELÉCTRICA:
• Revisar cables deteriorados
• No sobrecargar enchufes
• Protección diferencial
• Mantenimiento profesional

👶 PROTECCIÓN INFANTIL:
• Ventanas con rejas/bloqueos
• Productos peligrosos bajo llave
• Esquinas protegidas
• Supervisión constante

🔥 PREVENCIÓN INCENDIOS:
• Detectores humo funcionando
• Extintores accesibles
• Plan evacuación familiar
• Punto encuentro exterior

💊 BOTIQUÍN BÁSICO:
• Gasas, vendas, esparadrapo
• Antiséptico, agua oxigenada
• Analgésicos, antihistamínico
• Termómetro, tijeras, pinzas

📞 NÚMEROS EMERGENCIA:
• 112: Emergencias generales
• 080: Bomberos
• 091: Policía Nacional
• 061: Urgencias médicas
• 915 620 420: Toxicología

🗺️ PLAN EVACUACIÓN:
1. Dos rutas escape por planta
2. Punto encuentro exterior
3. Ensayar con familia
4. Llaves accesibles
5. NUNCA volver a casa ardiendo

✅ ENHORABUENA
Has completado el curso de
Seguridad en el Hogar.

Comparte estos conocimientos
con tu familia. ¡Pueden salvar vidas!`
        }
    ];

    // ==================== ESTADO DEL JUEGO ====================
    let gameState = {
        nivel: 0,
        estado: 'menu', // menu, instrucciones, jugando, completado, education
        tiempo: 0,
        riesgos: [],
        riesgosEncontrados: 0,
        puntos: 0,
        hoverRiesgo: null,
        mensajeFeedback: '',
        feedbackTimer: 0,
        lastTimestamp: null
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
            handleJugandoClick(x, y);
        } else if (gameState.estado === 'completado') {
            handleCompletadoClick(x, y);
        } else if (gameState.estado === 'education') {
            handleEducationClick(x, y);
        }
    }

    function handleMouseMove(e) {
        if (gameState.estado === 'jugando') {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            let foundHover = null;
            gameState.riesgos.forEach(riesgo => {
                if (!riesgo.encontrado &&
                    x >= riesgo.x && x <= riesgo.x + riesgo.width &&
                    y >= riesgo.y && y <= riesgo.y + riesgo.height) {
                    foundHover = riesgo;
                }
            });

            gameState.hoverRiesgo = foundHover;
        }
    }

    function handleMouseLeave() {
        gameState.hoverRiesgo = null;
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
            gameState.lastTimestamp = null;
        }
    }

    function handleJugandoClick(x, y) {
        // Verificar si se hizo click en un riesgo
        gameState.riesgos.forEach(riesgo => {
            if (!riesgo.encontrado &&
                x >= riesgo.x && x <= riesgo.x + riesgo.width &&
                y >= riesgo.y && y <= riesgo.y + riesgo.height) {
                
                riesgo.encontrado = true;
                gameState.riesgosEncontrados++;
                gameState.puntos += 100;
                mostrarFeedback(`✅ ¡Correcto! ${riesgo.descripcion}`, 'success');

                // Verificar si completó todos
                if (gameState.riesgosEncontrados >= gameState.riesgos.length) {
                    completarNivel();
                }
            }
        });
    }

    function handleCompletadoClick(x, y) {
        // Botón "Ver Explicaciones"
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
        gameState.tiempo = NIVELES[nivel].tiempo;
        gameState.riesgos = JSON.parse(JSON.stringify(NIVELES[nivel].riesgos));
        gameState.riesgosEncontrados = 0;
        gameState.puntos = 0;
        gameState.mensajeFeedback = '';
        gameState.feedbackTimer = 0;
        gameState.hoverRiesgo = null;
        gameState.lastTimestamp = null;
    }

    function completarNivel() {
        const bonusTiempo = Math.max(0, gameState.tiempo * 5);
        gameState.puntos += bonusTiempo;

        // Guardar mejor puntuación
        const bestKey = 'seguridadHogarBest';
        const bestScore = parseInt(localStorage.getItem(bestKey)) || 0;
        if (gameState.puntos > bestScore) {
            localStorage.setItem(bestKey, gameState.puntos);
            const playerName = localStorage.getItem('playerName');
            if (playerName) {
                localStorage.setItem('seguridadHogarBestName', playerName);
            }
        }

        gameState.estado = 'completado';
    }

    function mostrarFeedback(mensaje, tipo) {
        gameState.mensajeFeedback = mensaje;
        gameState.feedbackTimer = 3;
    }

    // ==================== RENDERIZADO ====================
    function drawMenu() {
        ctx.fillStyle = '#c62828';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🚨 SEGURIDAD EN EL HOGAR 🏠', 450, 80);

        ctx.font = '18px Arial';
        ctx.fillText('Aprende a detectar riesgos y prevenir accidentes', 450, 110);

        // Botones de niveles
        for (let i = 0; i < NIVELES.length; i++) {
            const nivel = NIVELES[i];
            const y = 150 + i * 100;

            ctx.fillStyle = '#d32f2f';
            ctx.fillRect(250, y, 400, 70);

            ctx.fillStyle = '#fff';
            ctx.font = 'bold 20px Arial';
            ctx.fillText(nivel.nombre, 450, y + 25);

            ctx.font = '16px Arial';
            ctx.fillText(`Dificultad: ${nivel.dificultad} | Busca los riesgos`, 450, y + 50);
        }

        // Mejor puntuación
        const bestScore = parseInt(localStorage.getItem('seguridadHogarBest')) || 0;
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

        // Instrucciones
        ctx.fillStyle = '#333';
        ctx.fillRect(100, 100, 700, 380);

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 24px Arial';
        ctx.fillText('🎯 OBJETIVO', 450, 140);

        ctx.font = '18px Arial';
        ctx.textAlign = 'left';
        const instrucciones = [
            `🔍 Encuentra todos los riesgos en la escena`,
            `⏱️ Tienes ${Math.floor(nivel.tiempo / 60)} minutos`,
            `👆 Haz click en cada riesgo que detectes`,
            `⚠️ Cada riesgo vale 100 puntos`,
            `🎓 Al final verás explicaciones detalladas`,
            ``,
            `💡 PISTA: Busca ${nivel.riesgos.length} riesgos`
        ];

        let yPos = 180;
        instrucciones.forEach(linea => {
            ctx.fillText(linea, 120, yPos);
            yPos += 35;
        });

        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('⚠️ ESTOS CONOCIMIENTOS PUEDEN SALVAR VIDAS', 450, 450);

        // Botón comenzar
        ctx.fillStyle = '#d32f2f';
        ctx.fillRect(350, 520, 200, 50);

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 20px Arial';
        ctx.fillText('▶ COMENZAR', 450, 552);
    }

    function drawJugando() {
        // Fondo según escena
        if (NIVELES[gameState.nivel].escena === 'cocina') {
            ctx.fillStyle = '#fff8e1';
        } else if (NIVELES[gameState.nivel].escena === 'baño') {
            ctx.fillStyle = '#e3f2fd';
        } else {
            ctx.fillStyle = '#f5f5f5';
        }
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // TopBar
        ctx.fillStyle = '#c62828';
        ctx.fillRect(0, 0, canvas.width, 50);

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`🚨 ${NIVELES[gameState.nivel].nombre}`, 10, 30);

        ctx.textAlign = 'center';
        const minutos = Math.floor(gameState.tiempo / 60);
        const segundos = Math.floor(gameState.tiempo % 60);
        ctx.fillText(`⏱️ ${minutos}:${segundos.toString().padStart(2, '0')}`, 450, 30);

        ctx.textAlign = 'right';
        ctx.fillText(`🎯 ${gameState.riesgosEncontrados}/${gameState.riesgos.length} | ⭐ ${gameState.puntos}`, 890, 30);

        // Dibujar escena según nivel
        drawEscena();

        // Dibujar riesgos
        gameState.riesgos.forEach(riesgo => {
            if (riesgo.encontrado) {
                // Riesgo encontrado - mostrar con tick verde
                ctx.fillStyle = 'rgba(76, 175, 80, 0.3)';
                ctx.fillRect(riesgo.x, riesgo.y, riesgo.width, riesgo.height);
                
                ctx.font = '40px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('✅', riesgo.x + riesgo.width / 2, riesgo.y + riesgo.height / 2 + 15);
            } else {
                // Riesgo aún no encontrado
                if (gameState.hoverRiesgo === riesgo) {
                    ctx.fillStyle = 'rgba(255, 193, 7, 0.4)';
                    ctx.fillRect(riesgo.x, riesgo.y, riesgo.width, riesgo.height);
                    ctx.strokeStyle = '#fbc02d';
                    ctx.lineWidth = 3;
                    ctx.strokeRect(riesgo.x, riesgo.y, riesgo.width, riesgo.height);
                }

                // Dibujar emoji del riesgo
                ctx.font = '36px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(riesgo.emoji, riesgo.x + riesgo.width / 2, riesgo.y + riesgo.height / 2 + 12);
            }
        });

        // Tooltip si hover
        if (gameState.hoverRiesgo) {
            const riesgo = gameState.hoverRiesgo;
            ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
            ctx.fillRect(riesgo.x - 10, riesgo.y - 40, 200, 30);
            
            ctx.fillStyle = '#FFD700';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'left';
            ctx.fillText('👆 Click para identificar', riesgo.x, riesgo.y - 18);
        }

        // Feedback
        if (gameState.feedbackTimer > 0) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.fillRect(200, 250, 500, 100);

            ctx.fillStyle = '#fff';
            ctx.font = 'bold 22px Arial';
            ctx.textAlign = 'center';
            const lines = wrapText(gameState.mensajeFeedback, 480);
            let yPos = 290;
            lines.forEach(line => {
                ctx.fillText(line, 450, yPos);
                yPos += 30;
            });
        }
    }

    function drawEscena() {
        const escena = NIVELES[gameState.nivel].escena;

        if (escena === 'cocina') {
            // Suelo
            ctx.fillStyle = '#d7ccc8';
            ctx.fillRect(0, 450, canvas.width, 150);

            // Encimera
            ctx.fillStyle = '#8d6e63';
            ctx.fillRect(100, 250, 700, 200);

            // Pared
            ctx.fillStyle = '#ffecb3';
            ctx.fillRect(0, 50, canvas.width, 200);

            // Elementos decorativos
            ctx.font = '40px Arial';
            ctx.fillText('🪟', 150, 120);
            ctx.fillText('🚪', 750, 400);

        } else if (escena === 'baño') {
            // Suelo
            ctx.fillStyle = '#cfd8dc';
            ctx.fillRect(0, 400, canvas.width, 200);

            // Bañera
            ctx.fillStyle = '#fff';
            ctx.fillRect(300, 350, 200, 100);
            ctx.fillStyle = '#90caf9';
            ctx.fillRect(310, 360, 180, 60);

            // Mueble lavabo
            ctx.fillStyle = '#8d6e63';
            ctx.fillRect(550, 300, 150, 200);

            // Pared
            ctx.fillStyle = '#b3e5fc';
            ctx.fillRect(0, 50, canvas.width, 350);

        } else { // casa completa
            // Suelo planta baja
            ctx.fillStyle = '#d7ccc8';
            ctx.fillRect(0, 400, canvas.width, 200);

            // Escalera
            ctx.fillStyle = '#a1887f';
            for (let i = 0; i < 5; i++) {
                ctx.fillRect(250, 350 - i * 30, 150, 30);
            }

            // Pared
            ctx.fillStyle = '#fff9c4';
            ctx.fillRect(0, 50, canvas.width, 350);

            // Ventanas
            ctx.fillStyle = '#64b5f6';
            ctx.fillRect(600, 150, 80, 100);
            ctx.fillRect(150, 450, 60, 80);
        }
    }

    function drawCompletado() {
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 36px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('✅ ¡TODOS LOS RIESGOS ENCONTRADOS!', 450, 100);

        ctx.fillStyle = '#fff';
        ctx.font = '24px Arial';
        ctx.fillText(`Puntuación: ${gameState.puntos}`, 450, 180);

        const tiempoUsado = NIVELES[gameState.nivel].tiempo - gameState.tiempo;
        const minutos = Math.floor(tiempoUsado / 60);
        const segundos = Math.floor(tiempoUsado % 60);
        ctx.fillText(`⏱️ Tiempo: ${minutos}:${segundos.toString().padStart(2, '0')}`, 450, 230);

        ctx.font = '20px Arial';
        ctx.fillText(`Riesgos identificados: ${gameState.riesgosEncontrados}/${gameState.riesgos.length}`, 450, 280);

        const bonusTiempo = Math.max(0, Math.floor(gameState.tiempo * 5));
        ctx.font = '18px Arial';
        ctx.fillText(`Bonus tiempo restante: +${bonusTiempo} pts`, 450, 330);

        // Estadística importante
        ctx.fillStyle = '#ff5252';
        ctx.font = 'bold 22px Arial';
        ctx.fillText('⚠️ DATO IMPORTANTE', 450, 390);

        ctx.fillStyle = '#fff';
        ctx.font = '16px Arial';
        const stats = [
            'En España ocurren más de 2 millones',
            'de accidentes domésticos al año.',
            'La mayoría son PREVENIBLES.'
        ];
        let yPos = 420;
        stats.forEach(line => {
            ctx.fillText(line, 450, yPos);
            yPos += 25;
        });

        // Botón ver explicaciones
        ctx.fillStyle = '#d32f2f';
        ctx.fillRect(350, 480, 200, 50);

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 20px Arial';
        ctx.fillText('📚 VER EXPLICACIONES', 450, 512);
    }

    function drawEducation() {
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const nivel = NIVELES[gameState.nivel];

        ctx.fillStyle = '#d32f2f';
        ctx.font = 'bold 28px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('📚 EXPLICACIONES DETALLADAS', 450, 50);

        // Mostrar explicación de cada riesgo encontrado
        ctx.fillStyle = '#fff';
        ctx.font = '13px Courier New';
        ctx.textAlign = 'left';

        const lines = nivel.educacion.split('\n');
        let yPos = 90;
        lines.forEach(line => {
            if (line.trim().startsWith('🔥') || line.trim().startsWith('⚡') || 
                line.trim().startsWith('🔪') || line.trim().startsWith('🧴') ||
                line.trim().startsWith('💦') || line.trim().startsWith('☠️') ||
                line.trim().startsWith('👶') || line.trim().startsWith('💊') ||
                line.trim().startsWith('🪜') || line.trim().startsWith('📞') ||
                line.trim().startsWith('✅') || line.trim().startsWith('🗺️')) {
                ctx.fillStyle = '#FFD700';
                ctx.font = 'bold 15px Courier New';
            } else if (line.trim().startsWith('•') || line.trim().startsWith('❌')) {
                ctx.fillStyle = '#ccc';
                ctx.font = '13px Courier New';
            } else {
                ctx.fillStyle = '#fff';
                ctx.font = '13px Courier New';
            }

            ctx.fillText(line, 50, yPos);
            yPos += 16;

            if (yPos > 490) return;
        });

        // Botón siguiente
        ctx.fillStyle = '#d32f2f';
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
        ctx.clearRect(0, 0, canvas.width, canvas.height);

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
            
            if (gameState.tiempo <= 0 && gameState.riesgosEncontrados < gameState.riesgos.length) {
                mostrarFeedback('⏰ ¡Tiempo agotado! Algunos riesgos no fueron encontrados', 'error');
                setTimeout(() => {
                    gameState.estado = 'completado';
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
        canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
}

window.registerGame = registerGame;
