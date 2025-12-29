# 🤖 Instrucciones para GitHub Copilot

## 📋 CHECKLIST OBLIGATORIO: Crear Nuevo Juego Educativo

Cuando crees un **nuevo juego educativo** en `js/games/script-*.js`, sigue SIEMPRE estos pasos:

### ✅ Pasos Obligatorios (No Omitir Ninguno)

1. **[ ] Planificación Inicial**
   - Leer TODO.md para ver especificaciones del juego
   - Crear plan mental o lista de tareas si el juego es complejo
   - Definir: niveles, mecánicas, educación, validación

2. **[ ] Crear Archivo del Juego**
   - Ruta: `js/games/script-NOMBRE-JUEGO.js`
   - Envolver en `window.registerGame(function() { ... })`
   - Usar canvas ID: `'gameCanvas'` (NO 'canvas')
   - Retornar función `cleanup()` al final

3. **[ ] Cleanup Obligatorio**
   ```javascript
   return function cleanup() {
       if (animationFrameId) {
           cancelAnimationFrame(animationFrameId);
       }
       canvas.removeEventListener('mousedown', handleMouseDown);
       canvas.removeEventListener('mousemove', handleMouseMove);
       canvas.removeEventListener('mouseup', handleMouseUp);
       canvas.removeEventListener('mouseleave', handleMouseLeave);
       // ... todos los listeners añadidos
   };
   ```

4. **[ ] Actualizar index.html (3 lugares)**
   
   **A. Añadir botón en sección apropiada:**
   ```html
   <button style="background:#COLOR;..." onclick="startGame('nombre-juego')">
       🎮 Nombre del Juego
   </button>
   ```
   
   **B. Registrar en gameMap (línea ~350-390):**
   ```javascript
   const map = {
       // ... otros juegos
       'nombre-juego': 'js/games/script-nombre-juego.js'
   };
   ```
   
   **C. Añadir a tabla de récords (función showGlobalScores, línea ~300):**
   ```javascript
   const map = [
       // ... otros juegos
       ['Nombre Juego', 'nombreJuegoBest', 'nombreJuegoBestName']
   ];
   ```

5. **[ ] Actualizar TODO.md**
   - Marcar tarea como completada con [x]
   - Añadir detalles de implementación bajo el título
   - Actualizar contador de progreso (ej: "4/10 completados (40%)")

6. **[ ] Validación Técnica**
   - Ejecutar `get_errors()` para verificar sintaxis
   - Sin errores = continuar
   - Con errores = corregir antes de seguir

7. **[ ] Limpieza**
   - Borrar archivos temporales de planificación (*.md auxiliares)
   - Mantener solo: script del juego, TODO.md, index.html

---

## 🎯 Arquitectura de Juegos

### Canvas
- **ID obligatorio:** `gameCanvas` (definido en index.html)
- **Dimensiones:** 900×600px (en código), responsive en CSS
- **Contexto:** `const ctx = canvas.getContext('2d')`

### Patrón registerGame
```javascript
window.registerGame = window.registerGame || function(initFn) { initFn(); };

window.registerGame(function() {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        console.error('Canvas gameCanvas no encontrado');
        return () => {};
    }
    
    const ctx = canvas.getContext('2d');
    let animationFrameId = null;
    
    // ... código del juego
    
    function gameLoop() {
        // ... render
        animationFrameId = requestAnimationFrame(gameLoop);
    }
    
    // ... event listeners
    canvas.addEventListener('mousedown', handleMouseDown);
    
    gameLoop();
    
    // OBLIGATORIO: cleanup
    return function cleanup() {
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        canvas.removeEventListener('mousedown', handleMouseDown);
        // ... todos los listeners
    };
});
```

### Estados del Juego
Típicos estados en `gameState`:
- `'menu'` - Selección de nivel
- `'instrucciones'` - Pantalla inicial con objetivo
- `'jugando'` - Gameplay activo
- `'completado'` - Nivel terminado
- `'education'` - Contenido educativo post-nivel

### Puntuación y Records
```javascript
// Guardar mejor puntuación
const bestKey = 'nombreJuegoBest';
const bestScore = parseInt(localStorage.getItem(bestKey)) || 0;
if (gameState.puntos > bestScore) {
    localStorage.setItem(bestKey, gameState.puntos);
}

// Guardar nombre del jugador (opcional)
const playerName = localStorage.getItem('playerName');
if (gameState.puntos > bestScore && playerName) {
    localStorage.setItem('nombreJuegoBestName', playerName);
}
```

---

## 🎓 Contenido Educativo

### Estructura de NIVELES
```javascript
const NIVELES = [
    {
        id: 1,
        nombre: '🎮 Nivel 1: Título',
        dificultad: '⭐☆☆☆☆',
        tiempo: 180, // segundos
        // ... datos específicos del nivel
        educacion: `📚 TÍTULO

🔹 CONCEPTO 1:
• Explicación detallada
• Puntos clave
• Ejemplos prácticos

⚠️ ERRORES COMUNES:
❌ Error típico 1
❌ Error típico 2
✅ Forma correcta

💰 DATO PRÁCTICO:
Información de costes, normativas, etc.

🎓 DATO PRO:
Información avanzada o curiosa

✅ Mensaje motivacional final`
    }
];
```

### Feedback al Jugador
```javascript
function mostrarFeedback(mensaje, tipo) {
    gameState.mensajeFeedback = mensaje;
    gameState.feedbackTimer = 2; // segundos
}

// Uso:
mostrarFeedback('✅ ¡Correcto! +50 puntos', 'success');
mostrarFeedback('❌ Incorrecto. Inténtalo de nuevo', 'error');
mostrarFeedback('💡 Pista: Revisa el paso 3', 'hint');
```

---

## 🐛 Bugs Comunes y Cómo Evitarlos

### ❌ Canvas ID Incorrecto
**Problema:** `document.getElementById('canvas')`
**Solución:** `document.getElementById('gameCanvas')`

### ❌ Falta registerGame Wrapper
**Problema:** Código suelto sin wrapper
**Solución:** Envolver todo en `window.registerGame(function() { ... })`

### ❌ No Retornar Cleanup
**Problema:** Memory leaks al cambiar de juego
**Solución:** Siempre retornar función cleanup con cancelaciones

### ❌ No Cancelar animationFrame
**Problema:** Múltiples loops ejecutándose
**Solución:** `cancelAnimationFrame(animationFrameId)` en cleanup

### ❌ No Remover Event Listeners
**Problema:** Listeners acumulándose
**Solución:** `removeEventListener` para cada `addEventListener`

### ❌ Olvidar Actualizar index.html
**Problema:** Juego creado pero no accesible
**Solución:** Seguir checklist completo (botón + gameMap + récords)

---

## 📝 Nombres de Archivos

### Convención de Nombres
- **Scripts de juegos:** `script-nombre-juego.js` (kebab-case)
- **Nombre del juego en botón:** Capitalizado con emoji
- **ID en gameMap:** igual que onclick (kebab-case)
- **localStorage keys:** camelCase + 'Best' (ej: `montaMuebleBest`)

### Ejemplos:
| Archivo | Botón | gameMap ID | localStorage |
|---------|-------|------------|--------------|
| script-electricidad.js | ⚡ Aprende Electricidad | 'electricidad' | electricidadBest |
| script-reciclaje.js | ♻️ Clasifica la Basura | 'reciclaje' | reciclajeBest |
| script-monta-mueble.js | 🪑 Monta un Mueble | 'monta-mueble' | montaMuebleBest |

---

## 🔄 Workflow de Desarrollo

### Para CADA Nuevo Juego:
1. ✅ Leer especificaciones en TODO.md
2. ✅ Si es complejo, crear lista mental de subtareas
3. ✅ Implementar juego con patrón correcto
4. ✅ Actualizar index.html (3 lugares)
5. ✅ Actualizar TODO.md (marcar completado + progreso)
6. ✅ Validar con `get_errors()`
7. ✅ Borrar archivos temporales
8. ✅ Confirmar al usuario que está listo

### Velocidad vs Calidad:
- ⚠️ **NO ir demasiado rápido** → genera bugs críticos
- ✅ **Tomarse el tiempo necesario** → código limpio y funcional
- ✅ **Seguir el checklist siempre** → evita omisiones

---

## 📂 Estructura del Proyecto

```
juegos-bingo-musical/
├── index.html              ← Menú principal (actualizar SIEMPRE)
├── TODO.md                 ← Lista de tareas (actualizar progreso)
├── js/
│   ├── script.js          ← Lógica global (NO tocar)
│   ├── game-utils.js      ← Utilidades (NO tocar)
│   └── games/
│       ├── script-electricidad.js
│       ├── script-reciclaje.js
│       ├── script-fontaneria.js
│       ├── script-monta-mueble.js
│       └── script-NUEVO-JUEGO.js  ← Aquí crear nuevos
├── css/
│   └── style.css          ← Estilos (raramente modificar)
└── tests/
    └── games.spec.js      ← Tests Playwright (opcional)
```

---

## 💡 Tips Adicionales

### Grid System
Si tu juego necesita alineación:
```javascript
const GRID_SIZE = 40;
pieza.x = Math.round(pieza.x / GRID_SIZE) * GRID_SIZE;
pieza.y = Math.round(pieza.y / GRID_SIZE) * GRID_SIZE;
```

### Drag & Drop Pattern
```javascript
let piezaArrastrada = null;
let offsetX = 0, offsetY = 0;

function handleMouseDown(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    piezas.forEach(pieza => {
        if (x >= pieza.x && x <= pieza.x + pieza.width &&
            y >= pieza.y && y <= pieza.y + pieza.height) {
            piezaArrastrada = pieza;
            offsetX = x - pieza.x;
            offsetY = y - pieza.y;
        }
    });
}

function handleMouseMove(e) {
    if (piezaArrastrada) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        piezaArrastrada.x = x - offsetX;
        piezaArrastrada.y = y - offsetY;
    }
}

function handleMouseUp(e) {
    piezaArrastrada = null;
}

function handleMouseLeave() {
    piezaArrastrada = null;
}
```

### Countdown Timer
```javascript
let lastTimestamp = null;

function gameLoop(timestamp) {
    if (!lastTimestamp) lastTimestamp = timestamp;
    const deltaTime = (timestamp - lastTimestamp) / 1000;
    lastTimestamp = timestamp;
    
    gameState.tiempo = Math.max(0, gameState.tiempo - deltaTime);
    
    if (gameState.tiempo <= 0) {
        // Tiempo agotado
        gameOver();
    }
    
    // ... render
    animationFrameId = requestAnimationFrame(gameLoop);
}
```

---

## 🎨 Secciones del Menú (index.html)

### Categorías Actuales:
1. **🎮 Multijugador** - Juegos para 2 personas
2. **💡 Juega y Aprende - Habilidades Prácticas** - Educativos (electricidad, reciclaje, fontanería, muebles)
3. **🌍 Acción por el Clima** - Juegos ambientales (ODS 13)
4. **🎯 Juegos Individuales** - Arcade, puzzles, etc.

### Dónde Añadir Nuevos Juegos:
- **Educativos prácticos** → Sección "Juega y Aprende"
- **Ambientales** → Sección "Acción por el Clima"
- **Recreativos** → Sección "Juegos Individuales"
- **2 jugadores** → Sección "Multijugador"

---

## ✅ Checklist Rápido (Copiar al Empezar)

```
[ ] Leer TODO.md
[ ] Crear js/games/script-NOMBRE.js
[ ] Usar canvas 'gameCanvas'
[ ] Envolver en registerGame()
[ ] Implementar cleanup completo
[ ] Actualizar index.html (botón)
[ ] Actualizar index.html (gameMap)
[ ] Actualizar index.html (récords)
[ ] Actualizar TODO.md
[ ] Ejecutar get_errors()
[ ] Borrar archivos temporales
[ ] Confirmar al usuario
```

---

**Última actualización:** 29 de diciembre de 2025
