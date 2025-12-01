# Bingo Musical Gratis 🎮🎵

Una colección de juegos educativos e interactivos, desarrollada con HTML5, JavaScript y mucho amor.

## ✨ Características

### 🌍 **Proyecto "Semillas del Cambio" - No dejes que vuelva a ocurrir**
Nueva sección de juegos educativos sobre el **ODS 13: Acción por el Clima** de la Agenda 2030. Aprende sobre catástrofes ambientales del pasado, comprende el cambio climático y descubre qué podemos hacer para que no vuelvan a ocurrir:

- **🛢️ Salva la Costa**: Basado en el desastre del Prestige (España, 2002)
  - Protege los peces del petróleo con barreras ecológicas
  - Recoge peces limpios para salvarlos
  - Aprende sobre el impacto de los vertidos de petróleo
  - Controles: ← → para mover, ESPACIO para colocar barreras

- **🌲 Bosque Verde**: Prevención y control de incendios forestales
  - Apaga incendios con agua desde un helicóptero
  - Planta nuevos árboles para recuperar el bosque
  - Gestiona la humedad del suelo para prevenir fuegos
  - Controles: ← → para mover, ESPACIO para lanzar agua, P para plantar

- **🏙️ Aire Limpio**: Gestión de contaminación urbana
  - Reduce el tráfico de coches y aumenta bicicletas
  - Invierte en vehículos eléctricos y transporte público
  - Planta árboles para limpiar el aire
  - Controles: Clic en botones de acciones

- **⚡ Energía Sabia**: Fuentes de energía sostenibles
  - Construye centrales para satisfacer la demanda energética
  - Prioriza energías renovables (solar, eólica)
  - Evita energías con alto riesgo de accidentes
  - Controles: Clic para seleccionar y construir centrales

- **🌊 Planeta Azul**: Limpieza de océanos
  - Recoge plásticos y residuos del océano
  - Lleva la basura al centro de reciclaje
  - Protege la fauna marina de la contaminación
  - Controles: ⬅️➡️⬆️⬇️ mover, ESPACIO recoger, R reciclar

### 🎯 Juegos Individuales
- **Arkanoid**: Rompe bloques con tu pelota
- **El Paracaidista**: Aventura de salto libre  
- **La Bailarina**: Juego de ritmo y movimiento
- **Memoria animales**: Entrena tu memoria
- **Serpiente**: El clásico juego de la serpiente
- **Laberinto de colores**: Encuentra tu camino
- Y muchos más...

### 🎮 **NUEVO: Juegos Multijugador**
- **🏓 Ping Pong**: Juego de ping pong para dos jugadores
  - **Jugador 1**: Teclas A (subir) y Z (bajar)
  - **Jugador 2**: Flechas ↑ (subir) y ↓ (bajar)
  - Primer jugador en llegar a 5 puntos gana
  - Nombres personalizables para cada jugador

### 🚀 Automatización y Testing
- **GitHub Actions**: Testing automático de todos los juegos
- **Releases automáticos**: Versionado basado en fechas
- **Playwright**: Testing de interfaz automatizado
- **Validación continua**: Asegura que todos los juegos funcionen

## 🎯 Cómo Jugar

1. Abre `index.html` en tu navegador
2. Ingresa tu nombre de jugador
3. Elige entre juegos individuales o multijugador
4. ¡Disfruta jugando!

### Controles del Ping Pong 🏓
- **Jugador 1 (Izquierda)**: 
  - `A` - Mover raqueta hacia arriba
  - `Z` - Mover raqueta hacia abajo
- **Jugador 2 (Derecha)**:
  - `↑` - Mover raqueta hacia arriba  
  - `↓` - Mover raqueta hacia abajo
- **ESC** - Volver al menú principal

## 🛠️ Desarrollo

### Estructura del Proyecto
```
/
├── index.html              # Página principal
├── script-*.js             # Scripts de juegos individuales
├── script-ping-pong.js     # Juego multijugador ping pong
├── game-utils.js           # Utilidades compartidas
├── style.css               # Estilos principales
├── tests/                  # Tests automatizados
└── .github/workflows/      # Automatización CI/CD
```

### Añadir un Nuevo Juego

1. Crear `script-mi-juego.js` con función `registerGame()`
2. Agregar entrada en el mapa de juegos en `index.html`
3. Añadir botón en la interfaz
4. Agregar test en `tests/games.spec.js`

## 🧪 Testing

```bash
# Instalar dependencias
npm install

# Ejecutar tests
npx playwright test

# Servidor de desarrollo
python3 -m http.server 8000
```

## 🏆 Características Técnicas

- **HTML5 Canvas**: Gráficos fluidos y responsivos
- **JavaScript modular**: Cada juego es independiente
- **Sistema de puntajes**: Guardado en localStorage
- **Responsive design**: Funciona en desktop y móvil
- **Testing automatizado**: Playwright + GitHub Actions
- **Releases automáticos**: Versionado y distribución automática

## 👥 Contribución

Este proyecto fue desarrollado como una plataforma de juegos educativos accesibles y gratuitos para todos.

---

**Bingo Musical Gratis © 2025**
*Hecho con 💖 para toda la comunidad*
