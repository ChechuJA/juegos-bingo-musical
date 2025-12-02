#!/bin/bash

# Simple game verification script
echo "🎮 Verificando juegos de Bingo Musical Gratis..."

# Check if server is running
if ! curl -s http://localhost:8000 > /dev/null 2>&1; then
    echo "⚠️  Iniciando servidor..."
    python3 -m http.server 8000 &
    sleep 3
fi

# Test main page
echo "📝 Verificando página principal..."
if curl -f -s http://localhost:8000 > /dev/null; then
    echo "✅ Página principal OK"
else
    echo "❌ Error en página principal"
    exit 1
fi

# Test ping pong script
echo "🏓 Verificando Ping Pong..."
if curl -f -s http://localhost:8000/js/games/script-ping-pong.js > /dev/null; then
    echo "✅ Ping Pong OK"
else
    echo "❌ Error en Ping Pong"
    exit 1
fi

# Test other critical games
games=("js/games/script-arkanoid.js" "js/games/script-4enraya.js" "js/games/script-memoria.js")
for game in "${games[@]}"; do
    if curl -f -s "http://localhost:8000/$game" > /dev/null; then
        echo "✅ $game OK"
    else
        echo "❌ Error en $game"
        exit 1
    fi
done

echo "🎉 ¡Todos los juegos verificados correctamente!"
echo "🌐 Servidor disponible en: http://localhost:8000"