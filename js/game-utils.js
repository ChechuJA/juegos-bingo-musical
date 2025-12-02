// Utilidades gráficas comunes para los juegos
// Disponibles en window.GameUI
(function(){
  function gradientBar(ctx, w, h, c1='#0d47a1', c2='#1976d2'){
    const g=ctx.createLinearGradient(0,0,0,h);
    g.addColorStop(0,c1); g.addColorStop(1,c2);
    ctx.fillStyle=g; ctx.fillRect(0,0,w,h);
    ctx.fillStyle='rgba(255,255,255,0.08)';
    ctx.fillRect(0,0,w,h*0.55);
  }
  function softBg(ctx,w,h,colors=['#eef3f7','#f5f9fc']){
    const g=ctx.createLinearGradient(0,0,w,h);
    g.addColorStop(0,colors[0]); g.addColorStop(1,colors[1]);
    ctx.fillStyle=g; ctx.fillRect(0,0,w,h);
  }
  function glassPanel(ctx,x,y,w,h,r=16){
    ctx.save();
    ctx.globalAlpha=0.85; ctx.fillStyle='rgba(255,255,255,0.55)';
    roundRect(ctx,x,y,w,h,r); ctx.fill();
    ctx.globalAlpha=1; ctx.strokeStyle='rgba(255,255,255,0.9)'; ctx.lineWidth=2; ctx.stroke();
    ctx.restore();
  }
  function shadowedText(ctx, text, x, y, color='#fff', shadow='rgba(0,0,0,0.5)'){ ctx.save(); ctx.fillStyle=shadow; ctx.fillText(text,x+2,y+2); ctx.fillStyle=color; ctx.fillText(text,x,y); ctx.restore(); }
  function outlineText(ctx, text, x,y, fill='#fff', stroke='#000', lw=3){ ctx.save(); ctx.lineWidth=lw; ctx.strokeStyle=stroke; ctx.strokeText(text,x,y); ctx.fillStyle=fill; ctx.fillText(text,x,y); ctx.restore(); }
  function roundRect(ctx,x,y,w,h,r){ ctx.beginPath(); ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.quadraticCurveTo(x+w,y,x+w,y+r); ctx.lineTo(x+w,y+h-r); ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h); ctx.lineTo(x+r,y+h); ctx.quadraticCurveTo(x,y+h,x,y+h-r); ctx.lineTo(x,y+r); ctx.quadraticCurveTo(x,y,x+r,y); ctx.closePath(); }
  
  /**
   * Dibuja un panel de instrucciones con fondo oscuro, título y líneas de texto
   * @param {CanvasRenderingContext2D} ctx - Contexto de canvas
   * @param {string} title - Título del panel (nombre del juego)
   * @param {string[]} lines - Array de líneas de instrucciones
   * @param {Object} options - Opciones adicionales
   * @param {number} [options.panelX=40] - Posición X del panel
   * @param {number} [options.panelY=50] - Posición Y del panel
   * @param {number} [options.panelW] - Ancho del panel (por defecto canvas.width - 80)
   * @param {number} [options.panelH] - Alto del panel (calculado automáticamente si no se proporciona)
   * @param {string} [options.titleColor='#4fc3f7'] - Color del título
   * @param {string} [options.textColor='#ffffff'] - Color del texto
   * @param {string} [options.bgColor='rgba(15,25,40,0.92)'] - Color de fondo del panel
   */
  function drawInstructionPanel(ctx, title, lines, options = {}) {
    const canvasW = ctx.canvas.width;
    const canvasH = ctx.canvas.height;
    
    const panelX = options.panelX || 40;
    const panelY = options.panelY || 50;
    const panelW = options.panelW || (canvasW - 80);
    const lineHeight = 23;
    const titleHeight = 42;
    const topMargin = 30;
    const bottomMargin = 20;
    const panelH = options.panelH || (topMargin + titleHeight + lines.length * lineHeight + bottomMargin);
    
    const titleColor = options.titleColor || '#4fc3f7';
    const textColor = options.textColor || '#ffffff';
    const bgColor = options.bgColor || 'rgba(15,25,40,0.92)';
    
    // Fondo oscuro semi-transparente con borde
    ctx.save();
    ctx.fillStyle = bgColor;
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 2;
    
    // Usar roundRect si está disponible, sino el polyfill
    if (ctx.roundRect) {
      ctx.beginPath();
      ctx.roundRect(panelX, panelY, panelW, panelH, 16);
      ctx.fill();
      ctx.stroke();
    } else {
      roundRect(ctx, panelX, panelY, panelW, panelH, 16);
      ctx.fill();
      ctx.stroke();
    }
    
    // Título
    ctx.font = 'bold 28px Arial';
    ctx.fillStyle = titleColor;
    ctx.textAlign = 'center';
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 8;
    ctx.fillText(title, canvasW/2, panelY + topMargin + 10);
    
    // Texto instrucciones
    ctx.shadowBlur = 0;
    ctx.font = '15px Arial';
    ctx.fillStyle = textColor;
    let y = panelY + topMargin + titleHeight;
    
    for (const line of lines) {
      ctx.fillText(line, canvasW/2, y);
      y += lineHeight;
    }
    
    ctx.restore();
  }
  
  window.GameUI = {
    gradientBar, 
    softBg, 
    glassPanel, 
    shadowedText, 
    outlineText, 
    roundRect,
    drawInstructionPanel
  };
})();

function handleClick(e) {
  const coords = window.GameUtils.getCanvasCoords(e, canvas);
  const x = coords.x; // coordenada X lógica (en espacio 800x500)
  const y = coords.y; // coordenada Y lógica (en espacio 800x500)
  // usar x,y para la lógica del juego
}