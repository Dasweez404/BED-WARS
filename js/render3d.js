'use strict';
/* =====================  RENDU 3D (Three.js)  =====================
   La simulation reste en "pixels" (1 case = 32 px). Conversion : X = x/32, Y = z/32 (hauteur), Z = y/32.     */
const U=1/T, WHu=WH/T;
let renderer, scene, camera3, sun, hemi, glCanvas;
let VW=window.innerWidth, VH=window.innerHeight;
const cam3={x:0,y:0,zoom:1}; // point suivi (px de simulation)
const v3=new THREE.Vector3(), m4=new THREE.Matrix4(), qd=new THREE.Quaternion(), sc3=new THREE.Vector3(), colT=new THREE.Color(), eul=new THREE.Euler();
const GEO={};
const MATC={};
function M(color,o){ const k=color+JSON.stringify(o||{}); return MATC[k]||(MATC[k]=new THREE.MeshStandardMaterial(Object.assign({color,flatShading:true,roughness:.85,metalness:0},o||{}))); }
function MB(color,o){ const k='b'+color+JSON.stringify(o||{}); return MATC[k]||(MATC[k]=new THREE.MeshBasicMaterial(Object.assign({color,transparent:true,depthWrite:false},o||{}))); }
const colc={};
function cparse(s){
  if(colc[s]) return colc[s];
  let r=1,g=1,b=1,a=1;
  if(s[0]==='#'){ const n=parseInt(s.length===4?'#'+s[1]+s[1]+s[2]+s[2]+s[3]+s[3]:s,16); r=(n>>16)/255; g=((n>>8)&255)/255; b=(n&255)/255; if(s.length===4){} }
  else { const m=s.match(/[\d.]+/g)||[]; r=(+m[0]||255)/255; g=(+m[1]||255)/255; b=(+m[2]||255)/255; a=m[3]!==undefined?+m[3]:1; }
  return colc[s]=[r,g,b,a];
}
function mixHex(a,b,t){ colT.set(a); const c1=colT.clone(); colT.set(b); return c1.lerp(colT,t); }

/* ---------- initialisation ---------- */
function initRender(){
  glCanvas=document.getElementById('gl');
  renderer=new THREE.WebGLRenderer({canvas:glCanvas,antialias:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(2,window.devicePixelRatio||1));
  renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  scene=new THREE.Scene();
  const c=document.createElement('canvas'); c.width=4; c.height=256; const g=c.getContext('2d'); const gr=g.createLinearGradient(0,0,0,256);
  gr.addColorStop(0,'#4d9bff'); gr.addColorStop(.45,'#9ccfff'); gr.addColorStop(.8,'#ffe6f3'); gr.addColorStop(1,'#fff3e6'); g.fillStyle=gr; g.fillRect(0,0,4,256);
  scene.background=new THREE.CanvasTexture(c);
  scene.fog=new THREE.Fog(0xbcd6ff,50,150);
  camera3=new THREE.PerspectiveCamera(46,VW/VH,.1,400);
  hemi=new THREE.HemisphereLight(0xeaf4ff,0xb9c7e8,.95); scene.add(hemi);
  sun=new THREE.DirectionalLight(0xfff1dc,1.1); sun.position.set(-16,32,14); sun.castShadow=true;
  sun.shadow.mapSize.set(2048,2048); const s=sun.shadow.camera; s.left=-26;s.right=26;s.top=26;s.bottom=-26;s.near=1;s.far=110; sun.shadow.bias=-.0005; sun.shadow.normalBias=.04;
  scene.add(sun); scene.add(sun.target);
  GEO.box=new THREE.BoxGeometry(1,1,1); GEO.sphere=new THREE.IcosahedronGeometry(1,1); GEO.sphere0=new THREE.IcosahedronGeometry(1,0);
  GEO.cyl=new THREE.CylinderGeometry(1,1,1,10); GEO.cone=new THREE.ConeGeometry(1,1,8); GEO.octa=new THREE.OctahedronGeometry(1,0);
  GEO.ring=new THREE.RingGeometry(.93,1,48); GEO.disc=new THREE.CircleGeometry(1,40); GEO.torus=new THREE.TorusGeometry(1,.16,6,24);
  GEO.ring.rotateX(-Math.PI/2); GEO.disc.rotateX(-Math.PI/2);
  GEO.cylX=new THREE.CylinderGeometry(1,1,1,8); GEO.cylX.rotateZ(Math.PI/2); // axe X
  GEO.boxX=new THREE.BoxGeometry(1,1,1);
  buildSky();
  buildParticles();
  window.addEventListener('resize',resize3d); resize3d();
}
function resize3d(){
  VW=window.innerWidth; VH=window.innerHeight;
  renderer.setSize(VW,VH,false); glCanvas.style.width=VW+'px'; glCanvas.style.height=VH+'px';
  camera3.aspect=VW/VH; camera3.updateProjectionMatrix();
  if(PS.n) PS.n.mat.uniforms.scale.value=VH/(2*Math.tan(camera3.fov*Math.PI/360));
  if(PS.a) PS.a.mat.uniforms.scale.value=VH/(2*Math.tan(camera3.fov*Math.PI/360));
  const uic=document.getElementById('ui'); if(uic&&window.resizeUI) resizeUI();
}

/* ---------- ciel : mer de nuages en dessous ---------- */
let skyClouds=null;
function buildSky(){
  const N=70; skyClouds=new THREE.InstancedMesh(GEO.sphere,new THREE.MeshStandardMaterial({color:0xd4e4ff,flatShading:true,roughness:1,emissive:0x7c98d0,emissiveIntensity:.3}),N);
  skyClouds.userData.d=[]; const rn=prng3(77);
  for(let i=0;i<N;i++){ skyClouds.userData.d.push({x:-40+rn()*180,y:-44-rn()*30,z:-40+rn()*180,s:4+rn()*6,sp:.3+rn()*.9,sy:.35+rn()*.2}); }
  skyClouds.frustumCulled=false; scene.add(skyClouds);
  // grande plaque de brume très bas
  const fl=new THREE.Mesh(new THREE.PlaneGeometry(900,900),new THREE.MeshBasicMaterial({color:0xe9f2ff,fog:true})); fl.rotation.x=-Math.PI/2; fl.position.set(50,-48,50); scene.add(fl);
}
function prng3(seed){let s=seed>>>0||1;return()=>((s=(Math.imul(s,1664525)+1013904223)>>>0)/4294967296);}
function updateSky(t){
  const d=skyClouds.userData.d;
  for(let i=0;i<d.length;i++){ const c=d[i]; let x=c.x+t*c.sp; x=((x+40)%180+180)%180-40; sc3.set(c.s,c.s*c.sy,c.s*.9); v3.set(x,c.y,c.z); m4.compose(v3,qd.identity(),sc3); skyClouds.setMatrixAt(i,m4); }
  skyClouds.instanceMatrix.needsUpdate=true;
}

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
  return {pts,geo,mat,pos,col,size,alpha,max,n:0};
}
function buildParticles(){ PS.n=mkPS(1200,false); PS.a=mkPS(1200,true); }
const GLOWC=new Set(['#ff9f43','#fde047','#fb923c','#fbbf24','#f97316','#c4b5fd','#e0f2fe','#7dd3fc','#bae6fd','#a78bfa','#fde68a','#86efac','#67e8f9','#38bdf8','#f472b6','#fbcfe8','#f9a8d4','#fff']);
function fillParticles(){
  PS.n.n=0; PS.a.n=0;
  for(const p of parts){
    const a=Math.max(0,p.life/p.max), ad=!p.smoke&&GLOWC.has(p.col), S=ad?PS.a:PS.n; if(S.n>=S.max) continue;
    const i=S.n++, c=cparse(p.col);
    const hy=p.z!==undefined?p.z*U:.45+.7*(1-a);
    S.pos[i*3]=p.x*U; S.pos[i*3+1]=hy; S.pos[i*3+2]=p.y*U;
    S.col[i*3]=c[0]; S.col[i*3+1]=c[1]; S.col[i*3+2]=c[2];
    S.size[i]=(p.smoke?p.size*(1+(1-a)*1.6):p.size)*U*(p.smoke?2.2:1.7);
    S.alpha[i]=(p.smoke?.35:1)*a*c[3];
  }
  for(const S of [PS.n,PS.a]){ S.geo.setDrawRange(0,S.n); for(const k of ['position','aColor','size','alpha']) S.geo.attributes[k].needsUpdate=true; }
}

/* ---------- monde : îles-nuages, ponts, murs ---------- */
let iGround,iPlat,iWall,iBand,iPuff,iUnder, ghost, worldSig=-1, popActive=false;
const CAP=4000;
function instMesh(geo,mat,cap,shadow,receive){
  const m=new THREE.InstancedMesh(geo,mat,cap); m.count=0; m.frustumCulled=false; m.castShadow=!!shadow; m.receiveShadow=!!receive;
  m.instanceColor=new THREE.InstancedBufferAttribute(new Float32Array(cap*3),3); scene.add(m); return m;
}
function buildWorldMeshes(){
  for(const m of [iGround,iPlat,iWall,iBand,iPuff,iUnder]) if(m){ scene.remove(m); m.dispose&&m.dispose(); }
  iGround=instMesh(GEO.box,new THREE.MeshStandardMaterial({flatShading:true,roughness:1}),CAP,false,true);
  iPlat=instMesh(GEO.box,new THREE.MeshStandardMaterial({flatShading:true,roughness:.9}),CAP,true,true);
  iWall=instMesh(GEO.box,new THREE.MeshStandardMaterial({flatShading:true,roughness:.85}),CAP,true,true);
  iBand=instMesh(GEO.box,new THREE.MeshStandardMaterial({flatShading:true,roughness:.7}),CAP,false,false);
  iPuff=instMesh(GEO.sphere,new THREE.MeshStandardMaterial({flatShading:true,roughness:1,color:0xffffff}),CAP*2,true,true);
  iUnder=instMesh(GEO.sphere,new THREE.MeshStandardMaterial({flatShading:true,roughness:1,color:0xffffff,emissive:0x7f9cd0,emissiveIntensity:.18}),CAP*2,false,false);
  // moelleux des îles : rebord de nuage + ventre
  let np=0,nu=0; const rn=prng3(5);
  const setI=(mesh,i,x,y,z,sx,sy,sz,c)=>{ sc3.set(sx,sy,sz); v3.set(x,y,z); m4.compose(v3,qd.identity(),sc3); mesh.setMatrixAt(i,m4); mesh.setColorAt(i,c); };
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){
    if(floorT[idx(x,y)]!==1) continue;
    const reg=region[idx(x,y)], tint=regionTint(reg);
    for(const [dx,dy] of [[0,-1],[0,1],[-1,0],[1,0]]){
      if(fl(x+dx,y+dy)!==0) continue;
      for(let k=0;k<2;k++){ const t=(k+.5)/2-.5+(rn()-.5)*.2, px=x+.5+dx*.5+(dx?0:t), pz=y+.5+dy*.5+(dy?0:t), r=.3+rn()*.14;
        setI(iPuff,np++,px,-.02+rn()*.06,pz,r,r*.85,r,colT.set('#ffffff').lerp(tint,.35).clone()); }
    }
    if(hash(x,y)%2===0){ const r=.65+rn()*.6; setI(iUnder,nu++,x+.5+(rn()-.5)*.6,-.75-rn()*.9,y+.5+(rn()-.5)*.6,r,r*.7,r,colT.set('#eef4ff').lerp(tint,.12).clone()); }
    if(hash(x,y)%5===0){ const r=.3+rn()*.15; setI(iUnder,nu++,x+.5+(rn()-.5)*.5,-1.6-rn()*.9,y+.5+(rn()-.5)*.5,r*2,r*1.3,r*2,colT.set('#e4edff').clone()); }
  }
  iPuff.count=np; iPuff.instanceMatrix.needsUpdate=true; iPuff.instanceColor.needsUpdate=true;
  iUnder.count=nu; iUnder.instanceMatrix.needsUpdate=true; iUnder.instanceColor.needsUpdate=true;
  worldSig=-1;
}
function regionTint(reg){
  if(reg>=0&&reg<4) return new THREE.Color(TEAMS[reg].light);
  if(reg===4) return new THREE.Color('#ffe6a8');
  return new THREE.Color('#aaeaf5');
}
function worldSignature(){
  let h=0;
  for(let i=0;i<W*H;i++){ const f=floorT[i],w=wallT[i]; if(f||w){ h=(Math.imul(h,31)+f*7+w*13+(w?Math.ceil(hpW[i]*4/BHP[w]):0)*3+(f>1?Math.ceil(hpF[i]*4/BHP[f]):0)+(ownW[i]+2)*5+(ownF[i]+2))|0; } }
  return h;
}
function rebuildWorld(){
  let ng=0,np=0,nw=0,nb=0;
  const tmpC=new THREE.Color();
  const put=(mesh,i,x,y,z,sx,sy,sz,c)=>{ sc3.set(sx,sy,sz); v3.set(x,y,z); m4.compose(v3,qd.identity(),sc3); mesh.setMatrixAt(i,m4); mesh.setColorAt(i,c); };
  popActive=false;
  for(let ty=0;ty<H;ty++)for(let tx=0;tx<W;tx++){
    const i=idx(tx,ty), f=floorT[i], w=wallT[i]; if(!f&&!w) continue;
    const lift=pop[i]>0?pop[i]:0; if(lift>0) popActive=true;
    if(f===1){
      const reg=region[i], tint=regionTint(reg), b=(tx+ty)&1;
      tmpC.set('#d3e2fa').lerp(tint,reg>=0&&reg<4?.42:.4); if(b) tmpC.multiplyScalar(.9);
      if(reg>=0&&reg<4&&Math.max(Math.abs(tx-TD[reg].bx),Math.abs(ty-TD[reg].by))<=2) tmpC.lerp(new THREE.Color(TEAMS[reg].col),.4);
      put(iGround,ng++,tx+.5,-.25,ty+.5,1,.5,1,tmpC.clone());
    } else if(f>1){
      const bc=blockColor(f,ownF[i]); tmpC.set(bc[0]);
      const dmg=hpF[i]/BHP[f]; if(dmg<1) tmpC.lerp(new THREE.Color('#333'),(1-dmg)*.45);
      put(iPlat,np++,tx+.5,-.09+lift*.25,ty+.5,.98,.2,.98,tmpC.clone());
    }
    if(w){
      let c;
      if(w===CORE) c=new THREE.Color(TEAMS[ownW[i]].dark); else { const bc=blockColor(w,ownW[i]); c=new THREE.Color(bc[0]); if(w===WOOL) c.lerp(new THREE.Color(TEAMS[ownW[i]].col),.25); }
      const dm=hpW[i]/BHP[w]; if(dm<1) c.lerp(new THREE.Color('#222'),(1-dm)*.5);
      put(iWall,nw++,tx+.5,(w===CORE?WHu*.3:WHu/2)+lift*.3,ty+.5,w===CORE?1:.97,WHu*(w===CORE?.6:1),w===CORE?1:.97,c);
      if(w!==CORE){ put(iBand,nb++,tx+.5,.07,ty+.5,1.02,.12,1.02,new THREE.Color(TEAMS[ownW[i]].col)); }
    }
  }
  for(const [m,n] of [[iGround,ng],[iPlat,np],[iWall,nw],[iBand,nb]]){ m.count=n; m.instanceMatrix.needsUpdate=true; if(m.instanceColor) m.instanceColor.needsUpdate=true; }
}

/* ---------- mouton (personnage) ---------- */
function sheepMats(td,neutral){
  const wool=mixHex('#ffffff',td.light,neutral?.1:.28), dark='#34333d';
  return {wool:new THREE.MeshStandardMaterial({color:wool,flatShading:true,roughness:1}),dark:new THREE.MeshStandardMaterial({color:dark,flatShading:true,roughness:.8}),
    scarf:new THREE.MeshStandardMaterial({color:td.col,flatShading:true,roughness:.7}),face:new THREE.MeshStandardMaterial({color:'#4a4854',flatShading:true,roughness:.8})};
}
const PUFFS=[[.12,.1,.3,.19],[.12,.1,-.3,.19],[-.2,.12,.28,.2],[-.2,.12,-.28,.2],[.3,.02,.0,.17],[.05,-.04,.32,.15],[.05,-.04,-.32,.15],[-.42,.04,0,.19],[.3,.14,.18,.14],[.3,.14,-.18,.14],[-.05,.08,.34,.16],[-.05,.08,-.34,.16]];
function createSheep(td,opts){
  opts=opts||{}; const g=new THREE.Group(), ms=sheepMats(td,opts.neutral), u={mats:ms,legs:[],tilt:new THREE.Group()};
  const body=new THREE.Group(); body.position.y=.52; g.add(body); u.body=body;
  const core=new THREE.Mesh(GEO.sphere,ms.wool); core.scale.set(.5,.4,.4); body.add(core); core.castShadow=true;
  for(const [x,y,z,r] of PUFFS){ const p=new THREE.Mesh(GEO.sphere,ms.wool); p.position.set(x,y,z); p.scale.setScalar(r*1.15); p.castShadow=true; body.add(p); }
  const head=new THREE.Group(); head.position.set(.54,.1,0); body.add(head); u.head=head;
  const hb=new THREE.Mesh(GEO.box,ms.face); hb.scale.set(.34,.31,.3); hb.castShadow=true; head.add(hb);
  const snout=new THREE.Mesh(GEO.box,ms.dark); snout.scale.set(.12,.14,.2); snout.position.set(.17,-.04,0); head.add(snout);
  for(const z of [-.1,.1]){ const e=new THREE.Mesh(GEO.sphere0,M('#ffffff')); e.scale.setScalar(.055); e.position.set(.12,.06,z*1.05); head.add(e); const pu=new THREE.Mesh(GEO.sphere0,M('#111')); pu.scale.setScalar(.03); pu.position.set(.165,.06,z*1.05); head.add(pu); }
  for(const z of [-1,1]){ const ear=new THREE.Mesh(GEO.box,ms.dark); ear.scale.set(.1,.07,.2); ear.position.set(-.02,.04,z*.2); ear.rotation.x=z*.5; head.add(ear); }
  const saddle=new THREE.Mesh(GEO.box,ms.scarf); saddle.scale.set(.46,.07,.4); saddle.position.set(-.02,.4,0); saddle.castShadow=true; body.add(saddle);
  for(const z of [-1,1]){ const sd=new THREE.Mesh(GEO.box,ms.scarf); sd.scale.set(.46,.2,.05); sd.position.set(-.02,.3,z*.2); sd.rotation.x=z*.5; body.add(sd); }
  const tuft=new THREE.Mesh(GEO.sphere,ms.wool); tuft.scale.setScalar(.14); tuft.position.set(-.02,.17,0); head.add(tuft);
  const scarf=new THREE.Mesh(GEO.torus,ms.scarf); scarf.scale.set(.27,.27,.27); scarf.rotation.y=Math.PI/2; scarf.position.set(.34,.05,0); body.add(scarf);
  for(const [x,z] of [[.2,.16],[.2,-.16],[-.2,.16],[-.2,-.16]]){ const piv=new THREE.Group(); piv.position.set(x,-.12,z); body.add(piv); const l=new THREE.Mesh(GEO.box,ms.dark); l.scale.set(.1,.34,.1); l.position.y=-.17; l.castShadow=true; piv.add(l); u.legs.push(piv); }
  const tail=new THREE.Mesh(GEO.sphere,ms.wool); tail.scale.setScalar(.13); tail.position.set(-.5,.08,0); body.add(tail);
  const anchor=new THREE.Group(); anchor.position.set(.26,.02,.38); body.add(anchor); u.anchor=anchor;
  // bulle / glace / aura
  const bub=new THREE.Mesh(GEO.sphere,new THREE.MeshStandardMaterial({color:0xbfe3ff,transparent:true,opacity:.35,roughness:.1,flatShading:false})); bub.scale.setScalar(.85); bub.position.y=.5; bub.visible=false; g.add(bub); u.bubble=bub;
  const ice=new THREE.Mesh(GEO.box,new THREE.MeshStandardMaterial({color:0xbfeaff,transparent:true,opacity:.45,roughness:.2})); ice.scale.set(.95,1,.95); ice.position.y=.5; ice.visible=false; g.add(ice); u.ice=ice;
  g.userData=u; g.scale.setScalar(opts.scale||1);
  return g;
}
function setSheepTint(g,e){
  const ms=g.userData.mats, td=TEAMS[e.team];
  const base=mixHex('#ffffff',td.light,.28);
  let c=base.clone();
  if(e.frozen>0) c.lerp(new THREE.Color('#9ad8f5'),.7); else if(e.slow>0) c.lerp(new THREE.Color('#f9a8d4'),.5);
  ms.wool.color.copy(c); const fl_=e.flash>0?1:0; ms.wool.emissive.setRGB(fl_,fl_*.9,fl_*.9); ms.dark.emissive.setRGB(fl_*.6,fl_*.2,fl_*.2);
}
function makeHeld(id,e){
  const g=new THREE.Group(), add=(geo,mat,px,py,pz,sx,sy,sz)=>{ const m=new THREE.Mesh(geo,mat); m.position.set(px,py,pz); m.scale.set(sx,sy,sz); m.castShadow=true; g.add(m); return m; };
  const dk=M('#2b2f3a'), gr=M('#4b5563',{metalness:.5,roughness:.4});
  const G=GUNS[id];
  switch(id){
    case 'sword': add(GEO.box,M('#6b4423'),.1,0,0,.14,.08,.08); add(GEO.box,M('#9ca3af'),.14,0,0,.04,.07,.26); add(GEO.box,M(SWORDS[e.sword].c,{metalness:.6,roughness:.3}),.52,0,0,.7,.05,.1); break;
    case 'pick': add(GEO.box,M('#8b5a2b'),.3,0,0,.6,.06,.06); add(GEO.box,M('#9ca3af',{metalness:.6}),.58,0,0,.08,.08,.5); break;
    case 'glove': add(GEO.sphere,M('#ef4444'),.3,0,0,.2,.2,.2); add(GEO.box,M('#fff'),.12,0,0,.1,.12,.12); break;
    case 'hammer': add(GEO.box,M('#8b5a2b'),.3,0,0,.7,.07,.07); add(GEO.box,gr,.68,0,0,.22,.26,.34); break;
    case 'baa': add(GEO.cone,M('#f9a8d4'),.36,0,0,.2,.5,.2).rotation.z=-Math.PI/2; add(GEO.box,dk,.1,0,0,.1,.1,.1); break;
    case 'block': { const bc=blockColor(e.bsel,e.team); add(GEO.box,M(bc[0]),.3,0,0,.3,.3,.3); break; }
    case 'bow': { const t=add(GEO.torus,M('#d6b27a'),.3,0,0,.3,.3,.3); t.rotation.set(0,Math.PI/2,0); t.scale.set(.3,.3,.3); add(GEO.box,M('#e5e7eb'),.3,0,0,.01,.01,.5); break; }
    case 'gun': add(GEO.box,gr,.3,0,0,.4,.12,.1); add(GEO.box,dk,.14,-.1,0,.1,.18,.09); add(GEO.box,M('#fde047'),.3,.07,0,.3,.02,.03); break;
    case 'smg': add(GEO.box,gr,.3,0,0,.5,.13,.11); add(GEO.box,dk,.22,-.18,0,.09,.3,.08); add(GEO.box,dk,.1,-.07,0,.2,.1,.1); break;
    case 'shotgun': add(GEO.box,M('#7c4a21'),.12,-.02,0,.3,.13,.1); add(GEO.box,gr,.48,.03,.04,.6,.06,.06); add(GEO.box,gr,.48,.03,-.04,.6,.06,.06); break;
    case 'sniper': add(GEO.box,dk,.4,0,0,.9,.1,.09); add(GEO.box,M('#38bdf8'),.34,.1,0,.24,.07,.07); add(GEO.box,dk,.0,-.04,0,.24,.14,.1); break;
    case 'rocket': add(GEO.cyl,gr,.36,.04,0,.17,.7,.17).rotation.z=Math.PI/2; add(GEO.cone,M('#ef4444'),.76,.04,0,.17,.2,.17).rotation.z=-Math.PI/2; break;
    case 'woolgun': add(GEO.cyl,M('#f9a8d4'),.34,0,0,.14,.6,.14).rotation.z=Math.PI/2; add(GEO.sphere,M('#fff'),.7,0,0,.15,.15,.15); break;
    case 'boomerang': { const a=add(GEO.box,M('#fbbf24'),.3,0,.1,.5,.05,.1); a.rotation.y=.5; const b=add(GEO.box,M('#fbbf24'),.3,0,-.1,.5,.05,.1); b.rotation.y=-.5; break; }
    case 'bubble': add(GEO.cyl,M('#38bdf8'),.3,0,0,.13,.5,.13).rotation.z=Math.PI/2; add(GEO.sphere,M('#bfdbfe',{transparent:true,opacity:.6}),.62,0,0,.16,.16,.16); break;
    case 'ice': add(GEO.box,M('#0ea5e9'),.3,0,0,.45,.14,.12); add(GEO.box,M('#e0f2fe'),.55,0,0,.1,.1,.1); break;
    case 'flame': add(GEO.box,M('#7f1d1d'),.28,0,0,.5,.16,.14); add(GEO.box,M('#fb923c'),.58,0,0,.1,.08,.08); add(GEO.cyl,M('#dc2626'),.1,.16,0,.08,.3,.08); break;
    default: { const it=ITEMMAP[id]; add(GEO.sphere,M(it?it.col:'#fff'),.3,0,0,.17,.17,.17); }
  }
  return g;
}
function updateHeld(e,m){
  const u=m.userData, key=(e.held||'sword')+'|'+e.sword+'|'+e.bsel;
  if(u.heldKey!==key){ if(u.heldMesh) u.anchor.remove(u.heldMesh); u.heldMesh=makeHeld(e.held||'sword',e); u.anchor.add(u.heldMesh); u.heldKey=key; }
  const sw=e.swingMax?Math.max(0,e.swing/e.swingMax):0;
  u.anchor.rotation.set(0,0,0);
  if(sw>0){ u.anchor.rotation.y=Math.sin((1-sw)*Math.PI)*1.2-.5*sw; u.anchor.rotation.z=-sw*.6; }
  u.heldMesh.visible=!(e.cloak>0&&e!==player);
}
function animateSheep(e,m,dt){
  const u=m.userData, gh=groundH(e), air=Math.max(0,e.z-gh), moving=(Math.abs(e.ix)+Math.abs(e.iy)>.05)&&air<2;
  const sw=Math.sin(e.stepPh*1.15)*(moving?.7:0);
  u.legs[0].rotation.z=sw; u.legs[1].rotation.z=-sw; u.legs[2].rotation.z=-sw; u.legs[3].rotation.z=sw;
  if(air>2){ for(const l of u.legs) l.rotation.z=.6; }
  const bob=moving?Math.abs(Math.sin(e.stepPh*1.15))*.05:0;
  u.body.position.y=.52+bob; const sq=e.squash;
  m.scale.set(1*(1+sq*.25),1*(1-sq*.3),1*(1+sq*.25));
  u.head.rotation.z=Math.sin(game.t*2+e.team)*.04+(e.slip>0?Math.sin(game.t*20)*.3:0);
  u.bubble.visible=e.bubble>0; u.ice.visible=e.frozen>0;
  if(e.bubble>0) u.bubble.scale.setScalar(.85+Math.sin(game.t*8)*.03);
}
