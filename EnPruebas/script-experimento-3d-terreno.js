function registerGame(){
// Experimento 3D Terreno procedural + esfera saltarina
const canvas=document.getElementById('gameCanvas');
let renderer, scene, camera, af=null; let sphere, clock=null; let raycaster=null; let jumpVel=0; let onGround=false; let accum=0; let bestHeight=Number(localStorage.getItem('exp3dTerrainBestHeight')||0); let bestName=localStorage.getItem('exp3dTerrainBestHeightName')||'-'; const playerName=localStorage.getItem('playerName')||'-';
function ensureThree(cb){ if(window.THREE){ cb(); return;} const s=document.createElement('script'); s.src='https://cdn.jsdelivr.net/npm/three@0.157.0/build/three.min.js'; s.onload=cb; document.head.appendChild(s); }
function generateHeight(w,h){ const data=[]; for(let y=0;y<h;y++){ for(let x=0;x<w;x++){ const nx=x/w-0.5, ny=y/h-0.5; const d=Math.sqrt(nx*nx+ny*ny); const val= (Math.sin((nx*5)) + Math.cos((ny*5)))*0.5 - d*1.2 + (Math.random()*0.15); data.push(val); } } return data; }
function init(){ renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true}); renderer.setPixelRatio(window.devicePixelRatio||1); renderer.setSize(canvas.clientWidth, canvas.clientHeight,false); scene=new THREE.Scene(); camera=new THREE.PerspectiveCamera(60, canvas.clientWidth/canvas.clientHeight, 0.1, 100); camera.position.set(0,4,8); camera.lookAt(0,0,0);
 const amb=new THREE.HemisphereLight(0x99cfff,0x223344,0.9); scene.add(amb); const dir=new THREE.DirectionalLight(0xffffff,0.8); dir.position.set(6,10,4); scene.add(dir);
 // Terreno
 const W=80,H=80; const geo=new THREE.PlaneGeometry(12,12,W-1,H-1); geo.rotateX(-Math.PI/2); const heights=generateHeight(W,H); const pos=geo.attributes.position; for(let i=0;i<pos.count;i++){ const y=heights[i]; pos.setY(i,y); } pos.needsUpdate=true; geo.computeVertexNormals(); const mat=new THREE.MeshStandardMaterial({color:0x3f7f4f, metalness:0.1, roughness:0.9}); const terrain=new THREE.Mesh(geo,mat); scene.add(terrain);
 // Esfera
 const sphGeo=new THREE.SphereGeometry(0.5,32,24); const sphMat=new THREE.MeshStandardMaterial({color:0xffc107,emissive:0x331a00,emissiveIntensity:0.2}); sphere=new THREE.Mesh(sphGeo,sphMat); sphere.position.set(0,2.5,0); scene.add(sphere);
 // Partículas aire
 const pGeo=new THREE.BufferGeometry(); const COUNT=300; const arr=new Float32Array(COUNT*3); for(let i=0;i<COUNT;i++){ arr[i*3]=(Math.random()-0.5)*16; arr[i*3+1]=Math.random()*6+1; arr[i*3+2]=(Math.random()-0.5)*16; } pGeo.setAttribute('position', new THREE.BufferAttribute(arr,3)); const pMat=new THREE.PointsMaterial({color:0xffffff,size:0.07,transparent:true,opacity:0.55}); const points=new THREE.Points(pGeo,pMat); scene.add(points);
 canvas.addEventListener('click',jump);
 window.addEventListener('keydown',e=>{ if(e.code==='Space') jump(); });
 animate(); }
function jump(){ if(onGround){ jumpVel=5.2; onGround=false; } }
function physics(dt){ jumpVel+= -9.8*dt; sphere.position.y+=jumpVel*dt; // detectar suelo mediante y=altura interpolada aproximada (simple)
 if(sphere.position.y<0.6){ sphere.position.y=0.6; jumpVel=0; onGround=true; }
 if(sphere.position.y>bestHeight){ bestHeight=sphere.position.y; localStorage.setItem('exp3dTerrainBestHeight', String(bestHeight)); localStorage.setItem('exp3dTerrainBestHeightName', playerName); }
}
function resize(){ const dpr=window.devicePixelRatio||1; const displayW=canvas.clientWidth; const displayH=Math.round(displayW*0.625); canvas.style.height=displayH+'px'; if(canvas.width!==displayW*dpr||canvas.height!==displayH*dpr){ canvas.width=displayW*dpr; canvas.height=displayH*dpr; camera.aspect=displayW/displayH; camera.updateProjectionMatrix(); renderer.setSize(displayW,displayH,false);} }
function drawHUD(){ const ctx=canvas.getContext('2d'); const w=canvas.width; if(window.GameUI) GameUI.gradientBar(ctx,w,60,'#004d40','#00695c'); else { ctx.fillStyle='#004d40'; ctx.fillRect(0,0,w,60);} ctx.fillStyle='#fff'; ctx.font='bold 22px Arial'; ctx.textAlign='left'; ctx.fillText('Terreno 3D',14,38); ctx.textAlign='center'; ctx.font='14px Arial'; ctx.fillText('Click / Space salta. Alcanza mayor altura.', w/2,40); ctx.textAlign='right'; ctx.font='14px Arial'; ctx.fillText('Altura max: '+bestHeight.toFixed(2)+' ('+bestName+')', w-14,40); }
function animate(){ af=requestAnimationFrame(animate); resize(); const dt=clock.getDelta(); physics(dt); sphere.rotation.y += dt*2; renderer.render(scene,camera); drawHUD(); }
ensureThree(()=>{ clock=new THREE.Clock(); raycaster=new THREE.Raycaster(); init(); });
return function cleanup(){ if(af) cancelAnimationFrame(af); try{ if(renderer){ renderer.dispose(); } }catch(_){} try{ if(sphere){ sphere.geometry.dispose(); sphere.material.dispose(); } }catch(_){} };
}
window.registerGame=registerGame;
