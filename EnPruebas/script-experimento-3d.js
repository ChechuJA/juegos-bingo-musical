function registerGame(){
// Experimento 3D básico con Three.js: escena con cubos interactivos y órbita cámara
const canvas=document.getElementById('gameCanvas');
// Creamos un renderer WebGL sobre el mismo canvas
let renderer, scene, camera, af=null; let orbiting=true; let lastTime=performance.now(); let spinSpeed=0.6; let objs=[]; let raycaster=null; let pointer=null; let INTERSECTED=null; let highRot=Number(localStorage.getItem('exp3dHighRot')||0); let highName=localStorage.getItem('exp3dHighRotName')||'-'; const playerName=localStorage.getItem('playerName')||'';
function initThree(){
  renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});
  renderer.setPixelRatio(window.devicePixelRatio||1);
  renderer.setSize(canvas.clientWidth, canvas.clientHeight,false);
  scene=new THREE.Scene();
  scene.background=null;
  camera=new THREE.PerspectiveCamera(60, canvas.clientWidth/canvas.clientHeight, 0.1, 100);
  camera.position.set(4,3,6);
  // Luz
  const amb=new THREE.AmbientLight(0xffffff,0.6); scene.add(amb);
  const dir=new THREE.DirectionalLight(0xffffff,0.8); dir.position.set(5,8,4); scene.add(dir);
  // Plano suelo
  const planeGeo=new THREE.PlaneGeometry(40,40); const planeMat=new THREE.MeshStandardMaterial({color:0x223344, metalness:0.1, roughness:0.9}); const plane=new THREE.Mesh(planeGeo,planeMat); plane.rotation.x=-Math.PI/2; plane.position.y=-1.5; plane.receiveShadow=false; scene.add(plane);
  // Cubos coloridos
  const palette=[0xff5252,0xff9800,0xffeb3b,0x4caf50,0x2196f3,0x9c27b0];
  for(let i=0;i<14;i++){ const size=0.6+Math.random()*0.6; const g=new THREE.BoxGeometry(size,size,size); const m=new THREE.MeshStandardMaterial({color:palette[Math.floor(Math.random()*palette.length)], metalness:0.4, roughness:0.4}); const mesh=new THREE.Mesh(g,m); mesh.position.set((Math.random()-0.5)*6, (Math.random()-0.2)*3, (Math.random()-0.5)*6); mesh.rotationSpeed=(Math.random()*0.7+0.3); scene.add(mesh); objs.push(mesh);}  
  // Partículas simples (stars)
  const starsGeo=new THREE.BufferGeometry(); const starCount=400; const positions=new Float32Array(starCount*3); for(let i=0;i<starCount;i++){ positions[i*3]=(Math.random()-0.5)*40; positions[i*3+1]=(Math.random()-0.5)*40; positions[i*3+2]=(Math.random()-0.5)*40; } starsGeo.setAttribute('position', new THREE.BufferAttribute(positions,3)); const starsMat=new THREE.PointsMaterial({color:0xffffff,size:0.12,transparent:true,opacity:0.55}); const stars=new THREE.Points(starsGeo,starsMat); scene.add(stars);
}
function drawHUD(){ const ctx=canvas.getContext('2d'); const w=canvas.width; if(window.GameUI) GameUI.gradientBar(ctx,w,60,'#1a237e','#283593'); else { ctx.fillStyle='#1a237e'; ctx.fillRect(0,0,w,60);} ctx.fillStyle='#fff'; ctx.font='bold 22px Arial'; ctx.textAlign='left'; ctx.fillText('Experimento 3D',14,38); ctx.textAlign='center'; ctx.font='14px Arial'; ctx.fillText('Toca / clic en cubos para impulsar giro. Arrastra para rotar la cámara. D para pausar órbita.', w/2,40); ctx.textAlign='right'; ctx.font='14px Arial'; ctx.fillText('Max giro: '+highRot.toFixed(1)+' ('+highName+')', w-14,40); }
let pointerDown=false; let lastPointer={x:0,y:0};
function onPointerDown(e){ pointerDown=true; lastPointer.x=e.clientX; lastPointer.y=e.clientY; setPointer(e); pick(); }
function onPointerUp(){ pointerDown=false; }
function onPointerMove(e){ if(pointerDown){ const dx=(e.clientX-lastPointer.x)/200; const dy=(e.clientY-lastPointer.y)/200; camera.position.applyAxisAngle(new THREE.Vector3(0,1,0), -dx); camera.position.y -= dy*3; camera.position.y=Math.max(-0.5,Math.min(6,camera.position.y)); camera.lookAt(0,0,0); lastPointer.x=e.clientX; lastPointer.y=e.clientY; } setPointer(e); }
function setPointer(e){ const rect=canvas.getBoundingClientRect(); if(!pointer) return; pointer.x=((e.clientX-rect.left)/rect.width)*2-1; pointer.y=-((e.clientY-rect.top)/rect.height)*2+1; }
function pick(){ if(!raycaster||!pointer) return; raycaster.setFromCamera(pointer,camera); const intersects=raycaster.intersectObjects(objs); if(intersects.length){ const m=intersects[0].object; m.rotationSpeed*=1.35; if(m.rotationSpeed>spinSpeed) spinSpeed=m.rotationSpeed; if(spinSpeed>highRot){ highRot=spinSpeed; localStorage.setItem('exp3dHighRot', String(highRot)); localStorage.setItem('exp3dHighRotName', playerName||'-'); } }
}
function onKey(e){ if(e.key==='d' || e.key==='D'){ orbiting=!orbiting; } }
function resize(){ const dpr=window.devicePixelRatio||1; const displayW=canvas.clientWidth; const displayH= Math.round(displayW*0.625); // mantener proporción 800x500
 canvas.style.height=displayH+'px'; const needResize = canvas.width!==displayW*dpr || canvas.height!==displayH*dpr; if(needResize){ canvas.width=displayW*dpr; canvas.height=displayH*dpr; if(camera){ camera.aspect=displayW/displayH; camera.updateProjectionMatrix(); renderer.setSize(displayW,displayH,false);} }
}
function animate(){ af=requestAnimationFrame(animate); resize(); const now=performance.now(); const dt=(now-lastTime)/1000; lastTime=now; // anim
 if(orbiting){ const ang=dt*0.3; camera.position.applyAxisAngle(new THREE.Vector3(0,1,0), ang); camera.lookAt(0,0,0); }
 objs.forEach(o=>{ o.rotation.x+=dt*o.rotationSpeed; o.rotation.y+=dt*o.rotationSpeed*0.8; }); renderer.render(scene,camera); drawHUD(); }
// Cargar three.js si no existe
function ensureThree(cb){ if(window.THREE){ cb(); return;} const s=document.createElement('script'); s.src='https://cdn.jsdelivr.net/npm/three@0.157.0/build/three.min.js'; s.onload=cb; document.head.appendChild(s); }
ensureThree(()=>{ raycaster=new THREE.Raycaster(); pointer=new THREE.Vector2(); initThree(); animate(); });
canvas.addEventListener('mousedown',onPointerDown); canvas.addEventListener('mouseup',onPointerUp); canvas.addEventListener('mousemove',onPointerMove); canvas.addEventListener('mouseleave',onPointerUp); canvas.addEventListener('touchstart',e=>{ const t=e.changedTouches[0]; if(!t)return; onPointerDown({clientX:t.clientX,clientY:t.clientY}); e.preventDefault(); },{passive:false}); canvas.addEventListener('touchmove',e=>{ const t=e.changedTouches[0]; if(!t)return; onPointerMove({clientX:t.clientX,clientY:t.clientY}); e.preventDefault(); },{passive:false}); canvas.addEventListener('touchend',e=>{ onPointerUp(); e.preventDefault(); },{passive:false}); window.addEventListener('keydown',onKey);
return function cleanup(){ if(af) cancelAnimationFrame(af); window.removeEventListener('keydown',onKey); canvas.removeEventListener('mousedown',onPointerDown); canvas.removeEventListener('mouseup',onPointerUp); canvas.removeEventListener('mousemove',onPointerMove); canvas.removeEventListener('mouseleave',onPointerUp); canvas.removeEventListener('touchstart',onPointerDown); canvas.removeEventListener('touchmove',onPointerMove); canvas.removeEventListener('touchend',onPointerUp); if(renderer){ try{ renderer.dispose(); }catch(_){} }
  objs.forEach(o=>{ try{ if(o.geometry) o.geometry.dispose(); if(o.material) o.material.dispose(); }catch(_){} }); };
}
window.registerGame=registerGame;

