function registerGame(){
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 800;
  canvas.height = 600;
  
  // Chess game state
  const BOARD_SIZE = 8;
  const CELL_SIZE = 60;
  const BOARD_OFFSET_X = 120;
  const BOARD_OFFSET_Y = 80;
  
  // Game modes
  const GAME_MODES = {
    MENU: 'menu',
    ONE_PLAYER: 'one_player',
    TWO_PLAYER: 'two_player',
    TUTORIAL: 'tutorial'
  };
  
  let gameMode = GAME_MODES.MENU;
  let currentPlayer = 'white'; // 'white' or 'black'
  let selectedSquare = null;
  let possibleMoves = [];
  let gameOver = false;
  let winner = null;
  let moveHistory = [];
  let showingExplanation = false;
  let explanationText = '';
  let aiDifficulty = 'easy'; // 'easy', 'medium', 'hard'
  
  // Chess piece symbols (Unicode)
  const PIECES = {
    white: {
      king: '♔',
      queen: '♕',
      rook: '♖',
      bishop: '♗',
      knight: '♘',
      pawn: '♙'
    },
    black: {
      king: '♚',
      queen: '♛',
      rook: '♜',
      bishop: '♝',
      knight: '♞',
      pawn: '♟'
    }
  };
  
  // Initialize chess board
  let board = [
    ['♜','♞','♝','♛','♚','♝','♞','♜'],
    ['♟','♟','♟','♟','♟','♟','♟','♟'],
    [null,null,null,null,null,null,null,null],
    [null,null,null,null,null,null,null,null],
    [null,null,null,null,null,null,null,null],
    [null,null,null,null,null,null,null,null],
    ['♙','♙','♙','♙','♙','♙','♙','♙'],
    ['♖','♘','♗','♕','♔','♗','♘','♖']
  ];
  
  // Get piece color
  function getPieceColor(piece) {
    if (!piece) return null;
    return Object.values(PIECES.white).includes(piece) ? 'white' : 'black';
  }
  
  // Get piece type
  function getPieceType(piece) {
    if (!piece) return null;
    for (const color of ['white', 'black']) {
      for (const [type, symbol] of Object.entries(PIECES[color])) {
        if (symbol === piece) return type;
      }
    }
    return null;
  }
  
  // Check if move is valid
  function isValidMove(fromRow, fromCol, toRow, toCol) {
    if (toRow < 0 || toRow >= 8 || toCol < 0 || toCol >= 8) return false;
    
    const piece = board[fromRow][fromCol];
    const targetPiece = board[toRow][toCol];
    const pieceColor = getPieceColor(piece);
    const targetColor = getPieceColor(targetPiece);
    
    // Can't capture own pieces
    if (targetColor === pieceColor) return false;
    
    const pieceType = getPieceType(piece);
    const rowDiff = toRow - fromRow;
    const colDiff = toCol - fromCol;
    
    switch (pieceType) {
      case 'pawn':
        const direction = pieceColor === 'white' ? -1 : 1;
        const startRow = pieceColor === 'white' ? 6 : 1;
        
        // Forward move
        if (colDiff === 0) {
          if (rowDiff === direction && !targetPiece) return true;
          if (fromRow === startRow && rowDiff === 2 * direction && !targetPiece && !board[fromRow + direction][fromCol]) return true;
        }
        // Diagonal capture
        if (Math.abs(colDiff) === 1 && rowDiff === direction && targetPiece) return true;
        return false;
        
      case 'rook':
        if (rowDiff === 0 || colDiff === 0) {
          return isPathClear(fromRow, fromCol, toRow, toCol);
        }
        return false;
        
      case 'bishop':
        if (Math.abs(rowDiff) === Math.abs(colDiff)) {
          return isPathClear(fromRow, fromCol, toRow, toCol);
        }
        return false;
        
      case 'queen':
        if (rowDiff === 0 || colDiff === 0 || Math.abs(rowDiff) === Math.abs(colDiff)) {
          return isPathClear(fromRow, fromCol, toRow, toCol);
        }
        return false;
        
      case 'knight':
        return (Math.abs(rowDiff) === 2 && Math.abs(colDiff) === 1) || 
               (Math.abs(rowDiff) === 1 && Math.abs(colDiff) === 2);
        
      case 'king':
        return Math.abs(rowDiff) <= 1 && Math.abs(colDiff) <= 1;
        
      default:
        return false;
    }
  }
  
  // Check if path is clear (for rook, bishop, queen)
  function isPathClear(fromRow, fromCol, toRow, toCol) {
    const rowStep = toRow > fromRow ? 1 : toRow < fromRow ? -1 : 0;
    const colStep = toCol > fromCol ? 1 : toCol < fromCol ? -1 : 0;
    
    let currentRow = fromRow + rowStep;
    let currentCol = fromCol + colStep;
    
    while (currentRow !== toRow || currentCol !== toCol) {
      if (board[currentRow][currentCol] !== null) return false;
      currentRow += rowStep;
      currentCol += colStep;
    }
    
    return true;
  }
  
  // Get all possible moves for a piece
  function getPossibleMoves(row, col) {
    const moves = [];
    for (let toRow = 0; toRow < 8; toRow++) {
      for (let toCol = 0; toCol < 8; toCol++) {
        if (isValidMove(row, col, toRow, toCol)) {
          moves.push({row: toRow, col: toCol});
        }
      }
    }
    return moves;
  }
  
  // Make a move
  function makeMove(fromRow, fromCol, toRow, toCol) {
    const piece = board[fromRow][fromCol];
    const capturedPiece = board[toRow][toCol];
    
    // Record move in history
    moveHistory.push({
      from: {row: fromRow, col: fromCol},
      to: {row: toRow, col: toCol},
      piece: piece,
      captured: capturedPiece
    });
    
    // Make the move
    board[toRow][toCol] = piece;
    board[fromRow][fromCol] = null;
    
    // Generate explanation
    generateMoveExplanation(piece, fromRow, fromCol, toRow, toCol, capturedPiece);
    
    // Switch players
    currentPlayer = currentPlayer === 'white' ? 'black' : 'white';
    
    // Check for game over
    checkGameOver();
  }
  
  // Generate move explanation for educational purposes
  function generateMoveExplanation(piece, fromRow, fromCol, toRow, toCol, captured) {
    const pieceType = getPieceType(piece);
    const pieceColor = getPieceColor(piece);
    const fromSquare = String.fromCharCode(97 + fromCol) + (8 - fromRow);
    const toSquare = String.fromCharCode(97 + toCol) + (8 - toRow);
    
    let explanation = `${pieceColor.charAt(0).toUpperCase() + pieceColor.slice(1)} ${pieceType} moves from ${fromSquare} to ${toSquare}.`;
    
    if (captured) {
      const capturedType = getPieceType(captured);
      explanation += ` Captures ${capturedType}!`;
    }
    
    // Add movement pattern explanation
    switch (pieceType) {
      case 'pawn':
        explanation += ' Pawns move forward one square, or two on their first move. They capture diagonally.';
        break;
      case 'rook':
        explanation += ' Rooks move horizontally or vertically any number of squares.';
        break;
      case 'bishop':
        explanation += ' Bishops move diagonally any number of squares.';
        break;
      case 'queen':
        explanation += ' The Queen moves like a rook and bishop combined - any direction, any distance.';
        break;
      case 'knight':
        explanation += ' Knights move in an L-shape: 2 squares in one direction, then 1 square perpendicular.';
        break;
      case 'king':
        explanation += ' The King moves one square in any direction.';
        break;
    }
    
    explanationText = explanation;
    showingExplanation = true;
    
    // Hide explanation after a few seconds
    setTimeout(() => {
      showingExplanation = false;
    }, 4000);
  }
  
  // Simple AI for single player mode
  function makeAIMove() {
    const allMoves = [];
    
    // Get all possible moves for AI (black pieces)
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece && getPieceColor(piece) === 'black') {
          const moves = getPossibleMoves(row, col);
          for (const move of moves) {
            allMoves.push({
              from: {row, col},
              to: move,
              piece: piece,
              captures: board[move.row][move.col] !== null
            });
          }
        }
      }
    }
    
    if (allMoves.length === 0) return false;
    
    // Simple AI strategy: prioritize captures, then random moves
    const captureMoves = allMoves.filter(move => move.captures);
    const selectedMove = captureMoves.length > 0 ? 
      captureMoves[Math.floor(Math.random() * captureMoves.length)] :
      allMoves[Math.floor(Math.random() * allMoves.length)];
    
    makeMove(selectedMove.from.row, selectedMove.from.col, selectedMove.to.row, selectedMove.to.col);
    return true;
  }
  
  // Check for game over conditions
  function checkGameOver() {
    // Simple game over check - could be enhanced with proper checkmate detection
    let whiteKing = false, blackKing = false;
    
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece === '♔') whiteKing = true;
        if (piece === '♚') blackKing = true;
      }
    }
    
    if (!whiteKing) {
      gameOver = true;
      winner = 'black';
    } else if (!blackKing) {
      gameOver = true;
      winner = 'white';
    }
  }
  
  // Draw the chess board
  function drawBoard() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Background
    if (window.GameUI) {
      GameUI.softBg(ctx, canvas.width, canvas.height, ['#f5f5dc', '#deb887']);
    } else {
      ctx.fillStyle = '#f5f5dc';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    // Draw board squares
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const x = BOARD_OFFSET_X + col * CELL_SIZE;
        const y = BOARD_OFFSET_Y + row * CELL_SIZE;
        
        // Alternate colors
        const isLight = (row + col) % 2 === 0;
        ctx.fillStyle = isLight ? '#f0d9b5' : '#b58863';
        ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
        
        // Highlight selected square
        if (selectedSquare && selectedSquare.row === row && selectedSquare.col === col) {
          ctx.fillStyle = 'rgba(255, 255, 0, 0.5)';
          ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
        }
        
        // Highlight possible moves
        if (possibleMoves.some(move => move.row === row && move.col === col)) {
          ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
          ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
        }
        
        // Draw pieces
        const piece = board[row][col];
        if (piece) {
          ctx.fillStyle = '#000';
          ctx.font = '36px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(piece, x + CELL_SIZE/2, y + CELL_SIZE/2);
        }
      }
    }
    
    // Draw board coordinates
    ctx.fillStyle = '#333';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    
    // Column labels (a-h)
    for (let col = 0; col < 8; col++) {
      const x = BOARD_OFFSET_X + col * CELL_SIZE + CELL_SIZE/2;
      const label = String.fromCharCode(97 + col);
      ctx.fillText(label, x, BOARD_OFFSET_Y - 10);
      ctx.fillText(label, x, BOARD_OFFSET_Y + 8 * CELL_SIZE + 20);
    }
    
    // Row labels (1-8)
    ctx.textAlign = 'center';
    for (let row = 0; row < 8; row++) {
      const y = BOARD_OFFSET_Y + row * CELL_SIZE + CELL_SIZE/2;
      const label = (8 - row).toString();
      ctx.fillText(label, BOARD_OFFSET_X - 15, y);
      ctx.fillText(label, BOARD_OFFSET_X + 8 * CELL_SIZE + 15, y);
    }
  }
  
  // Draw UI elements
  function drawUI() {
    // Header
    if (window.GameUI) {
      GameUI.gradientBar(ctx, canvas.width, 60, '#8b4513', '#a0522d');
    } else {
      ctx.fillStyle = '#8b4513';
      ctx.fillRect(0, 0, canvas.width, 60);
    }
    
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('♔ Ajedrez ♚', canvas.width/2, 38);
    
    // Game mode and current player info
    ctx.fillStyle = '#333';
    ctx.font = '16px Arial';
    ctx.textAlign = 'left';
    
    const modeText = gameMode === GAME_MODES.ONE_PLAYER ? '1 Jugador vs IA' : 
                     gameMode === GAME_MODES.TWO_PLAYER ? '2 Jugadores' : 'Tutorial';
    ctx.fillText(`Modo: ${modeText}`, 20, 100);
    
    if (gameMode !== GAME_MODES.MENU) {
      ctx.fillText(`Turno: ${currentPlayer === 'white' ? 'Blancas' : 'Negras'}`, 20, 125);
    }
    
    // Move history (right side)
    ctx.font = '14px Arial';
    ctx.fillText('Historial:', 600, 100);
    
    const recentMoves = moveHistory.slice(-8);
    for (let i = 0; i < recentMoves.length; i++) {
      const move = recentMoves[i];
      const fromSquare = String.fromCharCode(97 + move.from.col) + (8 - move.from.row);
      const toSquare = String.fromCharCode(97 + move.to.col) + (8 - move.to.row);
      const moveText = `${getPieceType(move.piece)} ${fromSquare}-${toSquare}`;
      ctx.fillText(moveText, 600, 120 + i * 18);
    }
    
    // Move explanation
    if (showingExplanation) {
      const explanationY = 350;
      const maxWidth = 160;
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.fillRect(600, explanationY, maxWidth, 100);
      
      ctx.strokeStyle = '#8b4513';
      ctx.lineWidth = 2;
      ctx.strokeRect(600, explanationY, maxWidth, 100);
      
      ctx.fillStyle = '#333';
      ctx.font = '12px Arial';
      
      // Word wrap the explanation
      const words = explanationText.split(' ');
      let line = '';
      let y = explanationY + 20;
      
      for (const word of words) {
        const testLine = line + word + ' ';
        const metrics = ctx.measureText(testLine);
        
        if (metrics.width > maxWidth - 20 && line !== '') {
          ctx.fillText(line, 610, y);
          line = word + ' ';
          y += 16;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, 610, y);
    }
    
    // Game over screen
    if (gameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 32px Arial';
      ctx.textAlign = 'center';
      const winnerText = winner === 'white' ? '¡Ganan las blancas!' : '¡Ganan las negras!';
      ctx.fillText(winnerText, canvas.width/2, canvas.height/2);
      
      ctx.font = '18px Arial';
      ctx.fillText('Presiona R para reiniciar', canvas.width/2, canvas.height/2 + 40);
    }
  }
  
  // Draw game menu
  function drawMenu() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Background
    if (window.GameUI) {
      GameUI.softBg(ctx, canvas.width, canvas.height, ['#f5f5dc', '#deb887']);
    } else {
      ctx.fillStyle = '#f5f5dc';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    // Title
    ctx.fillStyle = '#8b4513';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('♔ AJEDREZ ♚', canvas.width/2, 100);
    
    // Subtitle
    ctx.font = '18px Arial';
    ctx.fillStyle = '#333';
    ctx.fillText('Aprende y juega al ajedrez', canvas.width/2, 140);
    
    // Menu options
    const options = [
      {text: '1 Jugador vs IA', mode: GAME_MODES.ONE_PLAYER, y: 220},
      {text: '2 Jugadores', mode: GAME_MODES.TWO_PLAYER, y: 280},
      {text: 'Tutorial', mode: GAME_MODES.TUTORIAL, y: 340}
    ];
    
    ctx.font = 'bold 20px Arial';
    for (const option of options) {
      // Button background
      ctx.fillStyle = '#8b4513';
      ctx.fillRect(canvas.width/2 - 120, option.y - 25, 240, 50);
      
      // Button text
      ctx.fillStyle = '#fff';
      ctx.fillText(option.text, canvas.width/2, option.y + 5);
    }
    
    // Instructions
    ctx.font = '14px Arial';
    ctx.fillStyle = '#666';
    ctx.fillText('Haz clic en una opción para empezar', canvas.width/2, 420);
    ctx.fillText('El ajedrez te enseña a pensar estratégicamente', canvas.width/2, 440);
  }
  
  // Handle mouse clicks
  function handleClick(e) {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * canvas.width / rect.width;
    const y = (e.clientY - rect.top) * canvas.height / rect.height;
    
    if (gameMode === GAME_MODES.MENU) {
      // Check menu clicks
      if (x >= canvas.width/2 - 120 && x <= canvas.width/2 + 120) {
        if (y >= 195 && y <= 245) {
          gameMode = GAME_MODES.ONE_PLAYER;
          resetGame();
        } else if (y >= 255 && y <= 305) {
          gameMode = GAME_MODES.TWO_PLAYER;
          resetGame();
        } else if (y >= 315 && y <= 365) {
          gameMode = GAME_MODES.TUTORIAL;
          resetGame();
        }
      }
      return;
    }
    
    if (gameOver) return;
    
    // Check if click is on the board
    if (x < BOARD_OFFSET_X || x > BOARD_OFFSET_X + 8 * CELL_SIZE ||
        y < BOARD_OFFSET_Y || y > BOARD_OFFSET_Y + 8 * CELL_SIZE) {
      return;
    }
    
    const col = Math.floor((x - BOARD_OFFSET_X) / CELL_SIZE);
    const row = Math.floor((y - BOARD_OFFSET_Y) / CELL_SIZE);
    
    if (selectedSquare) {
      // Try to make a move
      if (isValidMove(selectedSquare.row, selectedSquare.col, row, col)) {
        makeMove(selectedSquare.row, selectedSquare.col, row, col);
        
        // AI move in single player mode
        if (gameMode === GAME_MODES.ONE_PLAYER && currentPlayer === 'black' && !gameOver) {
          setTimeout(() => {
            makeAIMove();
          }, 500);
        }
      }
      
      selectedSquare = null;
      possibleMoves = [];
    } else {
      // Select a piece
      const piece = board[row][col];
      if (piece && getPieceColor(piece) === currentPlayer) {
        // In single player mode, only allow white pieces for human
        if (gameMode === GAME_MODES.ONE_PLAYER && currentPlayer === 'black') return;
        
        selectedSquare = {row, col};
        possibleMoves = getPossibleMoves(row, col);
      }
    }
  }
  
  // Handle keyboard input
  function handleKeyDown(e) {
    if (e.key.toLowerCase() === 'r' && gameOver) {
      resetGame();
    } else if (e.key.toLowerCase() === 'm') {
      gameMode = GAME_MODES.MENU;
      selectedSquare = null;
      possibleMoves = [];
    } else if (e.key === 'Escape') {
      selectedSquare = null;
      possibleMoves = [];
    }
  }
  
  // Reset game
  function resetGame() {
    board = [
      ['♜','♞','♝','♛','♚','♝','♞','♜'],
      ['♟','♟','♟','♟','♟','♟','♟','♟'],
      [null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null],
      ['♙','♙','♙','♙','♙','♙','♙','♙'],
      ['♖','♘','♗','♕','♔','♗','♘','♖']
    ];
    
    currentPlayer = 'white';
    selectedSquare = null;
    possibleMoves = [];
    gameOver = false;
    winner = null;
    moveHistory = [];
    showingExplanation = false;
    explanationText = '';
  }
  
  // Main game loop
  function draw() {
    if (gameMode === GAME_MODES.MENU) {
      drawMenu();
    } else {
      drawBoard();
      drawUI();
    }
  }
  
  // Event listeners
  canvas.addEventListener('click', handleClick);
  window.addEventListener('keydown', handleKeyDown);
  
  // Start the game loop
  function loop() {
    draw();
    requestAnimationFrame(loop);
  }
  loop();
  
  // Cleanup function
  return function cleanup() {
    canvas.removeEventListener('click', handleClick);
    window.removeEventListener('keydown', handleKeyDown);
  };
}

window.registerGame = registerGame;