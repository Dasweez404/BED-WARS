'use strict';
/* =====================  RENDU 3D (Three.js) — thème pirates  =====================
   La simulation reste en "pixels" (1 case = 32 px). Conversion : X = x/32, Y = z/32 (hauteur), Z = y/32.     */
const U=1/T, WHu=WH/T;
let renderer, scene, camera3, sun, hemi, glCanvas;
let VW=window.innerWidth, VH=window.innerHeight;
const cam3={x:0,y:0};
const v3=new THREE.Vector3(), m4=new THREE.Matrix4(), qd=new THREE.Quaternion(), sc3=new THREE.Vector3(), colT=new THREE.Color();
const AXY=new THREE.Vector3(0,1,0);
const GEO={};
const MATC={};
function M(color,o){ const k=color+JSON.stringify(o||{}); return MATC[k]||(MATC[k]=new THREE.MeshStandardMaterial(Object.assign({color,flatShading:true,roughness:.85,metalness:0},o||{}))); }
const colc={};
function cparse(s){
  if(colc[s]) return colc[s];
  let r=1,g=1,b=1,a=1;
  if(s[0]==='#'){ const n=parseInt(s.length===4?'#'+s[1]+s[1]+s[2]+s[2]+s[3]+s[3]:s,16); r=(n>>16)/255; g=((n>>8)&255)/255; b=(n&255)/255; }
  else { const m=s.match(/[\d.]+/g)||[]; r=(+m[0]||255)/255; g=(+m[1]||255)/255; b=(+m[2]||255)/255; a=m[3]!==undefined?+m[3]:1; }
  return colc[s]=[r,g,b,a];
}
function mixHex(a,b,t){ const c1=new THREE.Color(a), c2=new THREE.Color(b); return c1.lerp(c2,t); }
function prng3(seed){let s=seed>>>0||1;return()=>((s=(Math.imul(s,1664525)+1013904223)>>>0)/4294967296);}

/* ---------- qualité (auto-réglée pour rester fluide) ---------- */
const Q={level:2,auto:true,acc:0,n:0,pr:[.7,.95,1.25],partCap:[200,420,700]};
function applyQuality(){
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,Q.pr[Q.level]));
  renderer.setSize(VW,VH,false);
  const sh=Q.level>=2; if(renderer.shadowMap.enabled!==sh){ renderer.shadowMap.enabled=sh; sun.castShadow=sh; scene.traverse(o=>{ if(o.material){ (Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.needsUpdate=true); } }); }
  if(PS.n){ PS.n.max=Q.partCap[Q.level]; PS.a.max=Q.partCap[Q.level]; }
}
function setQuality(l,manual){ Q.level=Math.max(0,Math.min(2,l)); if(manual) Q.auto=false; applyQuality(); msg('Graphismes : '+['bas','moyen','élevé'][Q.level]+(manual?'':' (auto)'),'#cfe0ff'); }
function qualityTick(dt){
  if(!Q.auto||game.state==='menu') return;
  Q.acc+=dt; Q.n++;
  if(Q.n>=50){ const avg=Q.acc/Q.n; Q.acc=0; Q.n=0; if(avg>.036&&Q.level>0) setQuality(Q.level-1,false); }
}

/* ---------- initialisation ---------- */
function initRender(){
  glCanvas=document.getElementById('gl');
  renderer=new THREE.WebGLRenderer({canvas:glCanvas,antialias:true,powerPreference:'high-performance'});
  renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFShadowMap; renderer.shadowMap.autoUpdate=false;
  scene=new THREE.Scene();
  const c=document.createElement('canvas'); c.width=4; c.height=256; const g=c.getContext('2d'); const gr=g.createLinearGradient(0,0,0,256);
  gr.addColorStop(0,'#3f8fe0'); gr.addColorStop(.5,'#8cc8f2'); gr.addColorStop(.78,'#d9eefb'); gr.addColorStop(1,'#f6efe0'); g.fillStyle=gr; g.fillRect(0,0,4,256);
  scene.background=new THREE.CanvasTexture(c);
  scene.fog=new THREE.Fog(0x8cc6e8,50,130);
  camera3=new THREE.PerspectiveCamera(46,VW/VH,.1,300);
  hemi=new THREE.HemisphereLight(0xeaf6ff,0x3f6f98,.62); scene.add(hemi);
  sun=new THREE.DirectionalLight(0xfff0d8,.95); sun.position.set(-14,30,12); sun.castShadow=true;
  sun.shadow.mapSize.set(1024,1024); const s=sun.shadow.camera; s.left=-22;s.right=22;s.top=22;s.bottom=-22;s.near=1;s.far=90; sun.shadow.bias=-.0006; sun.shadow.normalBias=.04;
  scene.add(sun); scene.add(sun.target);
  GEO.box=new THREE.BoxGeometry(1,1,1); GEO.sphere=new THREE.IcosahedronGeometry(1,1); GEO.sphere0=new THREE.IcosahedronGeometry(1,0);
  GEO.cyl=new THREE.CylinderGeometry(1,1,1,9); GEO.cyl3=new THREE.CylinderGeometry(1,1,1,3); GEO.cone=new THREE.ConeGeometry(1,1,7); GEO.octa=new THREE.OctahedronGeometry(1,0);
  GEO.ring=new THREE.RingGeometry(.93,1,40); GEO.disc=new THREE.CircleGeometry(1,32); GEO.torus=new THREE.TorusGeometry(1,.16,6,18);
  GEO.ring.rotateX(-Math.PI/2); GEO.disc.rotateX(-Math.PI/2);
  buildSea(); buildParticles(); buildModels();
  window.addEventListener('resize',resize3d); resize3d(); applyQuality();
}
function resize3d(){
  VW=window.innerWidth; VH=window.innerHeight;
  renderer.setSize(VW,VH,false); glCanvas.style.width=VW+'px'; glCanvas.style.height=VH+'px';
  camera3.aspect=VW/VH; camera3.updateProjectionMatrix();
  const k=VH*Math.min(window.devicePixelRatio||1,Q.pr[Q.level])/(2*Math.tan(camera3.fov*Math.PI/360));
  if(PS.n) PS.n.mat.uniforms.scale.value=k; if(PS.a) PS.a.mat.uniforms.scale.value=k;
  if(window.resizeUI) resizeUI();
}

/* ---------- la mer (plan low-poly animé, léger) ---------- */
let sea=null, seaBase=null;
function buildSea(){
  const geo=new THREE.PlaneGeometry(420,420); geo.rotateX(-Math.PI/2);
  sea=new THREE.Mesh(geo,new THREE.MeshLambertMaterial({color:0x3aa6cf}));
  sea.position.set(CX+.5,-1.15,CY+.5); sea.frustumCulled=false; scene.add(sea);
}
function updateSea(t){ if(iFoam) iFoam.material.opacity=.3+.13*Math.sin(t*1.5); }

/* ---------- particules (points avec taille variable) ---------- */
const PS={n:null,a:null};
function mkPS(max,additive){
  const geo=new THREE.BufferGeometry();
  const pos=new Float32Array(max*3), col=new Float32Array(max*3), size=new Float32Array(max), alpha=new Float32Array(max);
  geo.setAttribute('position',new THREE.BufferAttribute(pos,3).setUsage(THREE.DynamicDrawUsage));
  geo.setAttribute('aColor',new THREE.BufferAttribute(col,3).setUsage(THREE.DynamicDrawUsage));
  geo.setAttribute('size',new THREE.BufferAttribute(size,1).setUsage(THREE.DynamicDrawUsage));
  geo.setAttribute('alpha',new THREE.BufferAttribute(alpha,1).setUsage(THREE.DynamicDrawUsage));
  const mat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:additive?THREE.AdditiveBlending:THREE.NormalBlending,uniforms:{scale:{value:600}},
    vertexShader:'attribute vec3 aColor; attribute float size; attribute float alpha; varying vec3 vC; varying float vA; uniform float scale; void main(){ vC=aColor; vA=alpha; vec4 mv=modelViewMatrix*vec4(position,1.0); gl_PointSize=size*scale/max(0.1,-mv.z); gl_Position=projectionMatrix*mv; }',
    fragmentShader:'varying vec3 vC; varying float vA; void main(){ float d=length(gl_PointCoord-0.5); if(d>0.5) discard; gl_FragColor=vec4(vC,vA*smoothstep(0.5,0.18,d)); }'});
  const pts=new THREE.Points(geo,mat); pts.frustumCulled=false; scene.add(pts);
  return {pts,geo,mat,pos,col,size,alpha,max:800,cap:max,n:0};
}
function buildParticles(){ PS.n=mkPS(900,false); PS.a=mkPS(900,true); }
const GLOWC=new Set(['#ff9f43','#fde047','#fb923c','#fbbf24','#f97316','#c4b5fd','#e0f2fe','#7dd3fc','#bae6fd','#a78bfa','#fde68a','#86efac','#67e8f9','#38bdf8','#f472b6','#fbcfe8','#f9a8d4','#fff','#bfe9ff']);
function fillParticles(){
  PS.n.n=0; PS.a.n=0;
  for(const p of parts){
    const a=Math.max(0,p.life/p.max), ad=!p.smoke&&GLOWC.has(p.col), S=ad?PS.a:PS.n; if(S.n>=Math.min(S.max,S.cap)) continue;
    const i=S.n++, c=cparse(p.col);
    const hy=p.z!==undefined?p.z*U:.45+.7*(1-a);
    S.pos[i*3]=p.x*U; S.pos[i*3+1]=hy; S.pos[i*3+2]=p.y*U;
    S.col[i*3]=c[0]; S.col[i*3+1]=c[1]; S.col[i*3+2]=c[2];
    S.size[i]=(p.smoke?p.size*(1+(1-a)*1.6):p.size)*U*(p.smoke?2.2:1.7);
    S.alpha[i]=(p.smoke?.35:1)*a*c[3];
  }
  for(const S of [PS.n,PS.a]){ S.geo.setDrawRange(0,S.n); for(const k of ['position','aColor','size','alpha']) S.geo.attributes[k].needsUpdate=true; }
}

/* ---------- monde : îles, ponts, murs ---------- */
let iGround,iPlat,iWall,iBand,iPuff,iUnder,iFoam,iTuft,iShell, worldSig=-1, popActive=false, sigTick=0, rebuildTick=0;
const CAP=3000;
function instMesh(geo,mat,cap,shadow,receive){
  const m=new THREE.InstancedMesh(geo,mat,cap); m.count=0; m.frustumCulled=false; m.castShadow=!!shadow; m.receiveShadow=!!receive;
  m.instanceColor=new THREE.InstancedBufferAttribute(new Float32Array(cap*3),3); scene.add(m); return m;
}
function groundColor(reg,tx,ty,out){
  const b=(tx+ty)&1, h=hash(tx,ty);
  if(reg>=0&&reg<4){
    const td=TD[reg], d=Math.max(Math.abs(tx-td.bx),Math.abs(ty-td.by));
    if(d<=2){ out.set('#e9d9a8').lerp(new THREE.Color(td.col),.38); if(b) out.multiplyScalar(.93); return out; }
    const beach=Math.hypot(tx-td.bx,ty-td.by)>4.2;
    if(!beach&&(h%3!==0)) out.set(b?'#8fc46a':'#86bb62'); else out.set(b?'#f0dfa8':'#e7d49a');
    return out;
  }
  if(reg===4){ out.set(b?'#b88a55':'#a97b47'); return out; }
  out.set(b?'#e3d3a2':'#d8c793').lerp(new THREE.Color('#8fd0cf'),.15); return out;
}
function buildWorldMeshes(){
  for(const m of [iGround,iPlat,iWall,iBand,iPuff,iUnder,iFoam,iTuft,iShell]) if(m){ scene.remove(m); m.dispose&&m.dispose(); }
  iGround=instMesh(GEO.box,new THREE.MeshStandardMaterial({flatShading:true,roughness:1}),CAP,false,true);
  iPlat=instMesh(GEO.box,new THREE.MeshStandardMaterial({flatShading:true,roughness:.9}),CAP,true,true);
  iWall=instMesh(GEO.box,new THREE.MeshStandardMaterial({flatShading:true,roughness:.85}),CAP,true,true);
  iBand=instMesh(GEO.box,new THREE.MeshStandardMaterial({flatShading:true,roughness:.7}),CAP,false,false);
  iPuff=instMesh(GEO.sphere0,new THREE.MeshStandardMaterial({flatShading:true,roughness:1}),CAP,false,false);
  iUnder=instMesh(GEO.sphere0,new THREE.MeshStandardMaterial({flatShading:true,roughness:1}),CAP,false,false);
  iFoam=instMesh(GEO.box,new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.42,depthWrite:false}),CAP,false,false);
  iTuft=instMesh(GEO.cone,new THREE.MeshStandardMaterial({flatShading:true,roughness:1}),900,false,false);
  iShell=instMesh(GEO.sphere0,new THREE.MeshStandardMaterial({flatShading:true,roughness:.6}),600,false,false);
  let np=0,nu=0,nf=0,nt=0,ns=0; const rn=prng3(5);
  const setI=(mesh,i,x,y,z,sx,sy,sz,c)=>{ sc3.set(sx,sy,sz); v3.set(x,y,z); m4.compose(v3,qd.identity(),sc3); mesh.setMatrixAt(i,m4); mesh.setColorAt(i,c); };
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){
    if(floorT[idx(x,y)]!==1) continue;
    const reg=region[idx(x,y)]; let edge=false;
    for(const [dx,dy] of [[0,-1],[0,1],[-1,0],[1,0]]){
      if(fl(x+dx,y+dy)!==0) continue; edge=true;
      if(reg!==4&&np<CAP-3){ const px=x+.5+dx*.52, pz=y+.5+dy*.52, r=.24+rn()*.1; setI(iPuff,np++,px,-.05,pz,r,r*.6,r,colT.set('#f3e5b0').clone()); }
    }
    if(edge&&reg!==4&&nf<CAP-2){ let fx=x+.5,fz=y+.5; const e=[[0,-1],[0,1],[-1,0],[1,0]].filter(([dx,dy])=>fl(x+dx,y+dy)===0); for(const [dx,dy] of e){ fx+=dx*.35; fz+=dy*.35; } setI(iFoam,nf++,fx,-1.08,fz,1.5,.04,1.5,colT.set('#ffffff').clone()); }
    if(reg!==4&&hash(x,y)%2===0&&nu<CAP-3){ const r=.6+rn()*.55; setI(iUnder,nu++,x+.5+(rn()-.5)*.5,-.55-rn()*.5,y+.5+(rn()-.5)*.5,r,r*.75,r,colT.set(rn()<.5?'#7a6552':'#6b5847').clone()); }
    if(reg!==4&&!edge){ const tc=groundColor(reg,x,y,new THREE.Color());
      if(tc.g>tc.r+.03){ if(hash(x,y)%2===0&&nt<880){ for(let k=0;k<2;k++){ const a=rn()*6.28, hh=.16+rn()*.1; setI(iTuft,nt++,x+.5+Math.cos(a)*.3,hh/2,y+.5+Math.sin(a)*.3,.05,hh,.05,colT.set(rn()<.5?'#5fae3f':'#78c24d').clone()); } } }
      else if(hash(x,y)%6===0&&ns<580){ const a=rn()*6.28; setI(iShell,ns++,x+.5+Math.cos(a)*.3,.04,y+.5+Math.sin(a)*.3,.07,.045,.07,colT.set(rn()<.5?'#fbd5e0':'#fff4e0').clone()); } }
  }
  iTuft.count=nt; iTuft.instanceMatrix.needsUpdate=true; iTuft.instanceColor.needsUpdate=true; iShell.count=ns; iShell.instanceMatrix.needsUpdate=true; iShell.instanceColor.needsUpdate=true;
  for(const [m,n] of [[iPuff,np],[iUnder,nu],[iFoam,nf]]){ m.count=n; m.instanceMatrix.needsUpdate=true; m.instanceColor.needsUpdate=true; }
  worldSig=-1;
}
function worldSignature(){
  let h=0;
  for(let i=0;i<W*H;i++){ const f=floorT[i],w=wallT[i]; if(f||w){ h=(Math.imul(h,31)+f*7+w*13+(w?Math.ceil(hpW[i]*4/BHP[w]):0)*3+(f>1?Math.ceil(hpF[i]*4/BHP[f]):0)+(ownW[i]+2)*5+(ownF[i]+2))|0; } }
  return h;
}
function rebuildWorld(){
  let ng=0,np=0,nw=0,nb=0; const tmpC=new THREE.Color();
  const put=(mesh,i,x,y,z,sx,sy,sz,c)=>{ sc3.set(sx,sy,sz); v3.set(x,y,z); m4.compose(v3,qd.identity(),sc3); mesh.setMatrixAt(i,m4); mesh.setColorAt(i,c); };
  popActive=false;
  for(let ty=0;ty<H;ty++)for(let tx=0;tx<W;tx++){
    const i=idx(tx,ty), f=floorT[i], w=wallT[i]; if(!f&&!w) continue;
    const lift=pop[i]>0?pop[i]:0; if(lift>0) popActive=true;
    if(f===1){ groundColor(region[i],tx,ty,tmpC); put(iGround,ng++,tx+.5,-.25,ty+.5,1,.5,1,tmpC.clone()); }
    else if(f>1){
      const bc=blockColor(f,ownF[i]); tmpC.set(bc[0]); const dm=hpF[i]/BHP[f]; if(dm<1) tmpC.lerp(new THREE.Color('#333'),(1-dm)*.45);
      put(iPlat,np++,tx+.5,-.09+lift*.25,ty+.5,.98,.2,.98,tmpC.clone());
    }
    if(w){
      let c;
      if(w===CORE) c=new THREE.Color('#6b4423'); else { const bc=blockColor(w,ownW[i]); c=new THREE.Color(bc[0]); if(w===WOOL) c.lerp(new THREE.Color(TEAMS[ownW[i]].col),.2); }
      const dm=(hpW[i]-(wallLayers(i)-1)*BHP[w])/BHP[w]; if(dm<1) c.lerp(new THREE.Color('#222'),(1-dm)*.5);
      if(w===CORE) put(iWall,nw++,tx+.5,WHu*.3+lift*.3,ty+.5,1,WHu*.6,1,c);
      else { const L=wallLayers(i); for(let k=0;k<L&&nw<CAP-1;k++) put(iWall,nw++,tx+.5,(k+.5)*WHu+lift*.3,ty+.5,.97,WHu*.99,.97,k===L-1?c:c.clone().lerp(new THREE.Color('#ffffff'),.04*(L-1-k))); }
      if(w!==CORE) put(iBand,nb++,tx+.5,.07,ty+.5,1.02,.12,1.02,new THREE.Color(TEAMS[ownW[i]].col));
    }
  }
  for(const [m,n] of [[iGround,ng],[iPlat,np],[iWall,nw],[iBand,nb]]){ m.count=n; m.instanceMatrix.needsUpdate=true; if(m.instanceColor) m.instanceColor.needsUpdate=true; }
}

function makeHeld(id,e){
  const g=new THREE.Group(), add=(geo,mat,px,py,pz,sx,sy,sz)=>{ const m=new THREE.Mesh(geo,mat); m.position.set(px,py,pz); m.scale.set(sx,sy,sz); m.castShadow=true; g.add(m); return m; };
  const dk=M('#2b2f3a'), gr=M('#4b5563',{metalness:.4,roughness:.5}), wd=M('#7c4a21'), steel=M('#cfd6e0',{metalness:.35,roughness:.35});
  switch(id){
    case 'sword': add(GEO.box,wd,.08,0,0,.14,.07,.07); add(GEO.box,M('#fbbf24'),.16,0,0,.05,.07,.22); { const b1=add(GEO.box,M(SWORDS[e.sword].c,{metalness:.35,roughness:.35}),.45,0,0,.5,.045,.1); const b2=add(GEO.box,M(SWORDS[e.sword].c,{metalness:.35,roughness:.35}),.76,.05,0,.22,.04,.09); b2.rotation.z=.35; } break;
    case 'pick': add(GEO.box,wd,.3,0,0,.6,.06,.06); add(GEO.box,gr,.58,0,0,.08,.08,.5); break;
    case 'glove': { const h=add(GEO.torus,gr,.3,.02,0,.2,.2,.2); h.rotation.y=Math.PI/2; h.scale.set(.2,.2,.2); add(GEO.box,gr,.1,0,0,.2,.1,.1); add(GEO.cone,steel,.45,-.1,0,.05,.18,.05); } break;
    case 'hammer': add(GEO.box,wd,.3,0,0,.7,.07,.07); add(GEO.box,gr,.68,0,0,.22,.26,.34); break;
    case 'baa': add(GEO.cone,M('#c9a24a',{metalness:.5}),.34,0,0,.2,.5,.2).rotation.z=-Math.PI/2; add(GEO.box,wd,.08,0,0,.14,.1,.1); break;
    case 'block': { const bc=blockColor(e.bsel,e.team); add(GEO.box,M(bc[0]),.3,0,0,.3,.3,.3); break; }
    case 'bow': { const t=add(GEO.box,wd,.3,0,0,.08,.08,.7); add(GEO.box,wd,.3,0,0,.5,.06,.06); add(GEO.box,M('#e5e7eb'),.18,0,0,.01,.01,.68); break; }
    case 'gun': add(GEO.box,wd,.14,-.07,0,.18,.18,.1); add(GEO.box,gr,.4,.03,0,.5,.07,.07); add(GEO.box,M('#fbbf24',{metalness:.5}),.2,.06,0,.08,.05,.08); break;
    case 'smg': for(const z of [-.09,.09]){ add(GEO.box,wd,.14,-.06,z,.16,.16,.08); add(GEO.box,gr,.36,.03,z,.42,.06,.06); } break;
    case 'shotgun': add(GEO.box,wd,.1,-.04,0,.28,.15,.1); add(GEO.cone,gr,.52,.03,0,.18,.5,.18).rotation.z=-Math.PI/2; break;
    case 'sniper': add(GEO.box,wd,.1,-.04,0,.3,.15,.1); add(GEO.box,gr,.6,.03,0,.9,.05,.05); add(GEO.box,M('#c9a24a',{metalness:.5}),.3,.07,0,.2,.05,.05); break;
    case 'rocket': add(GEO.cyl,M('#374151',{metalness:.5}),.36,.04,0,.18,.7,.18).rotation.z=Math.PI/2; add(GEO.torus,M('#fbbf24'),.2,.04,0,.2,.2,.2).rotation.y=Math.PI/2; add(GEO.sphere0,dk,.08,.04,0,.14,.14,.14); break;
    case 'woolgun': add(GEO.cyl,M('#a16207'),.34,0,0,.14,.6,.14).rotation.z=Math.PI/2; add(GEO.sphere,M('#e5e7eb'),.7,0,0,.18,.18,.18); break;
    case 'boomerang': { add(GEO.box,wd,.3,0,0,.6,.06,.06); add(GEO.box,gr,.6,0,.0,.1,.06,.34); } break;
    case 'bubble': add(GEO.cyl,M('#38bdf8'),.3,0,0,.13,.5,.13).rotation.z=Math.PI/2; add(GEO.sphere,new THREE.MeshStandardMaterial({color:0xbfdbfe,transparent:true,opacity:.6}),.62,0,0,.17,.17,.17); break;
    case 'ice': add(GEO.box,wd,.3,0,0,.8,.05,.05); add(GEO.cone,M('#bae6fd',{emissive:'#3b9ad0',emissiveIntensity:.5}),.78,0,0,.07,.22,.07).rotation.z=-Math.PI/2; break;
    case 'flame': add(GEO.cyl,wd,.3,0,0,.06,.6,.06).rotation.z=Math.PI/2; add(GEO.octa,new THREE.MeshBasicMaterial({color:0xff9a2a}),.64,0,0,.12,.18,.12); break;
    case 'bomb': add(GEO.cyl,M('#92400e'),.3,0,0,.2,.3,.2); add(GEO.cyl,gr,.3,.1,0,.21,.04,.21); add(GEO.cyl,gr,.3,-.1,0,.21,.04,.21); break;
    case 'anchor': add(GEO.box,gr,.3,0,0,.5,.06,.06); add(GEO.box,gr,.5,0,0,.06,.06,.4); break;
    case 'trident': add(GEO.box,wd,.3,0,0,.75,.05,.05); for(const z of [-.1,0,.1]) add(GEO.cone,M('#38bdf8',{metalness:.4}),.74,0,z,.05,.2,.05).rotation.z=-Math.PI/2; add(GEO.box,M('#38bdf8'),.66,0,0,.04,.04,.24); break;
    case 'gatling': add(GEO.box,wd,.12,-.06,0,.2,.18,.12); for(const [y,z] of [[.04,0],[-.03,.06],[-.03,-.06]]) add(GEO.box,gr,.4,y,z,.5,.045,.045); add(GEO.box,M('#dc2626'),.22,.1,0,.1,.08,.1); break;
    case 'javelin': add(GEO.box,wd,.32,0,0,.8,.04,.04); add(GEO.cone,steel,.76,0,0,.05,.18,.05).rotation.z=-Math.PI/2; add(GEO.box,M('#f87171'),.0,0,0,.1,.06,.06); break;
    case 'flarebow': add(GEO.box,M('#7c2d12'),.3,0,0,.08,.08,.7); add(GEO.box,wd,.3,0,0,.5,.06,.06); add(GEO.box,M('#fb923c'),.18,0,0,.01,.01,.68); add(GEO.sphere,new THREE.MeshBasicMaterial({color:0xfb923c}),.5,0,0,.07,.07,.07); break;
    default: { const it=ITEMMAP[id]; if(GUNS[id]){ add(GEO.box,wd,.14,-.07,0,.18,.18,.1); add(GEO.box,M(it?it.col:'#9ca3af',{metalness:.4,roughness:.4}),.4,.03,0,.55,.07,.07); } else add(GEO.sphere,M(it?it.col:'#fff'),.3,0,0,.17,.17,.17); }
  }
  return g;
}
function updateHeld(e,m){
  const u=m.userData, key=(e.held||'sword')+'|'+e.sword+'|'+e.bsel;
  if(u.heldKey!==key){ if(u.heldMesh) u.anchor.remove(u.heldMesh); u.heldMesh=makeHeld(e.held||'sword',e); u.anchor.add(u.heldMesh); u.heldKey=key; }
  const sw=e.swingMax?Math.max(0,e.swing/e.swingMax):0;
  u.armR.rotation.set(0,0,1.0+(sw>0?-Math.sin((1-sw)*Math.PI)*1.5:0));
  u.armR.rotation.y=sw>0?Math.sin((1-sw)*Math.PI)*.7:0;
  u.heldMesh.visible=!(e.cloak>0&&e!==player);
}
