'use strict';
/* =====================  RENDU 3D : objets dynamiques, effets, caméra  ===================== */
const entM=new Map(), guardM=new Map(), chickM=new Map(), projM=new Map(), bombM=new Map(), trapM=new Map(), shieldM=new Map(), hookM=new Map(), pearlM=new Map(), pullM=new Map();
let coreM=[], padM=[], propM=[], ringPool=[], beamPool=[], playerRing=null, ghostMesh=null, ghostInfo=null;
let propList=[], propRows3=[];

function clearDynamic(){
  for(const mp of [entM,guardM,chickM,projM,bombM,trapM,shieldM,hookM,pearlM,pullM]){ for(const [,m] of mp) scene.remove(m); mp.clear(); }
  for(const m of coreM) scene.remove(m); coreM=[];
  for(const g of padM) scene.remove(g.g); padM=[];
  for(const g of propM) scene.remove(g.m); propM=[];
  for(const r of ringPool){ scene.remove(r); scene.remove(r.userData.f); } ringPool=[];
  for(const b of beamPool) scene.remove(b); beamPool=[];
}
function sync(map,list,create,update){
  const seen=new Set();
  for(const o of list){ let m=map.get(o); if(!m){ m=create(o); scene.add(m); map.set(o,m); } update(o,m); seen.add(o); }
  for(const [o,m] of map){ if(!seen.has(o)){ scene.remove(m); map.delete(o); } }
}
function beamBetween(m,ax,ay,az,bx,by,bz,r){
  const a=new THREE.Vector3(ax,ay,az), b=new THREE.Vector3(bx,by,bz), d=b.clone().sub(a), L=d.length()||.001;
  m.position.copy(a).addScaledVector(d,.5); m.scale.set(r,L,r); m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());
}

/* ---------- décors ---------- */
function genProps3d(){
  propList=[]; const used=new Set();
  const add=(x,y,type)=>{
    if(!inb(x,y)||floorT[idx(x,y)]!==1||spawnerAt(x,y)) return; const k=x+','+y; if(used.has(k)) return;
    for(const t of TD){ if(Math.abs(x-t.spawnTile[0])<=1&&Math.abs(y-t.spawnTile[1])<=1) return; if(Math.abs(x-t.padTile[0])<=1&&Math.abs(y-t.padTile[1])<=1) return; if(Math.abs(x-t.bx)<=1&&Math.abs(y-t.by)<=1) return; }
    used.add(k); propList.push({x,y,type,seed:hash(x,y)%1000});
  };
  for(const t of TD){
    add(t.bx-4,t.by-4,'banner'); add(t.bx+4,t.by-4,'banner'); add(t.bx-2,t.by+2,'torch'); add(t.bx+2,t.by+2,'torch');
    for(let dy=-5;dy<=5;dy++)for(let dx=-5;dx<=5;dx++){
      const sm=Math.abs(dx)+Math.abs(dy); if(sm<7||sm>8) continue; const h=hash(t.bx+dx,t.by+dy);
      if(h%8===0) add(t.bx+dx,t.by+dy,'tree'); else if(h%15===1) add(t.bx+dx,t.by+dy,'rock');
    }
  }
  for(const [sx,sy] of [[-1,-1],[1,-1],[-1,1],[1,1]]) add(CX+sx*3,CY+sy*3,'pillar');
  for(const sp of spawners) if(sp.kind==='dia') for(const [sx,sy] of [[-1,-1],[1,1]]) add(sp.x+sx,sp.y+sy,'crystal');
  for(const p of propList){
    const g=new THREE.Group(), rg=region[idx(p.x,p.y)], td=rg>=0&&rg<4?TEAMS[rg]:null; g.position.set(p.x+.5,0,p.y+.5); g.rotation.y=p.seed;
    const add3=(geo,mat,x,y,z,sx,sy,sz)=>{ const m=new THREE.Mesh(geo,mat); m.position.set(x,y,z); m.scale.set(sx,sy,sz); m.castShadow=true; g.add(m); return m; };
    const u={};
    switch(p.type){
      case 'tree': add3(GEO.cyl,M('#9b6a3a'),0,.3,0,.07,.6,.07); u.c=[add3(GEO.sphere,M(td?mixHex('#ffffff',td.light,.45).getStyle():'#f4f4ff'),0,.75,0,.34,.3,.34),add3(GEO.sphere,M(td?mixHex('#ffffff',td.light,.6).getStyle():'#eef'),.15,.98,.05,.24,.22,.24),add3(GEO.sphere,M('#ffffff'),-.12,.92,-.08,.2,.2,.2)]; break;
      case 'rock': add3(GEO.sphere0,M('#9aa3b2'),0,.12,0,.28,.2,.24); add3(GEO.sphere0,M('#b6bdc9'),.2,.07,.1,.14,.1,.12); break;
      case 'banner': add3(GEO.cyl,M('#cbd5e1',{metalness:.5}),0,.55,0,.025,1.1,.025); add3(GEO.sphere0,M('#fde68a',{metalness:.6}),0,1.12,0,.06,.06,.06); u.flag=add3(GEO.box,M(td?td.col:'#fff'),.27,.9,0,.5,.3,.02); u.flag.geometry=u.flag.geometry.clone(); u.flag.geometry.translate(0,0,0); break;
      case 'torch': add3(GEO.cyl,M('#6b4423'),0,.28,0,.05,.56,.05); add3(GEO.cyl,M('#374151'),0,.58,0,.1,.1,.1); u.fl=add3(GEO.octa,new THREE.MeshBasicMaterial({color:0xffa83c}),0,.74,0,.1,.16,.1); u.glow=add3(GEO.sphere,new THREE.MeshBasicMaterial({color:0xffb347,transparent:true,opacity:.18,depthWrite:false,blending:THREE.AdditiveBlending}),0,.74,0,.5,.5,.5); g.children.forEach(c=>{ if(c===u.glow) c.castShadow=false; }); break;
      case 'pillar': add3(GEO.cyl,M('#e8b84a',{metalness:.5,roughness:.4}),0,.42,0,.17,.84,.17); add3(GEO.cyl,M('#fbbf24',{metalness:.5}),0,.86,0,.24,.1,.24); add3(GEO.cyl,M('#fbbf24',{metalness:.5}),0,.05,0,.24,.1,.24); u.orb=add3(GEO.octa,new THREE.MeshStandardMaterial({color:0xfff1a8,emissive:0xffd45a,emissiveIntensity:.8,flatShading:true}),0,1.3,0,.17,.24,.17); break;
      case 'crystal': for(const [x,h,r,z] of [[0,.8,.14,0],[.18,.5,.1,.08],[-.16,.4,.09,-.1]]){ const c=add3(GEO.octa,new THREE.MeshStandardMaterial({color:0x4fe3f5,emissive:0x16a6c0,emissiveIntensity:.7,flatShading:true,roughness:.2}),x,h/2,z,r,h/2,r); } break;
    }
    g.userData=u; scene.add(g); propM.push({m:g,p,u});
  }
}
function syncProps(){
  for(const o of propM){ const p=o.p, hid=wallT[idx(p.x,p.y)]>0; o.m.visible=!hid; if(hid) continue; const t=game.t, u=o.u;
    if(p.type==='tree') u.c.forEach((c,i)=>{ c.position.x=[0,.15,-.12][i]+Math.sin(t*1.3+p.seed+i)*.02; });
    else if(p.type==='banner'){ u.flag.rotation.y=Math.sin(t*3+p.seed)*.25; u.flag.scale.y=.3+Math.sin(t*4+p.seed)*.02; }
    else if(p.type==='torch'){ const f=1+Math.sin(t*14+p.seed)*.2; u.fl.scale.set(.1*f,.16*(1+Math.sin(t*11+p.seed)*.25),.1*f); u.glow.scale.setScalar(.5*f); }
    else if(p.type==='pillar'){ u.orb.position.y=1.3+Math.sin(t*2+p.seed)*.06; u.orb.rotation.y=t*1.5; }
  }
}

/* ---------- moutons ultimes ---------- */
function buildCores(){
  coreM=[];
  TD.forEach((td,i)=>{
    const g=new THREE.Group(), sh=createSheep(td,{scale:1.55});
    sh.userData.body.position.y=.52; sh.userData.legs.forEach(l=>l.rotation.z=.0);
    const crown=new THREE.Mesh(GEO.cone,M('#fbbf24',{metalness:.6,roughness:.3})); crown.scale.set(.13,.2,.13); crown.position.set(0,.2,0); sh.userData.head.add(crown);
    for(let k=0;k<5;k++){ const a=k*Math.PI*2/5, sp=new THREE.Mesh(GEO.cone,M('#fde047',{metalness:.6})); sp.scale.set(.03,.12,.03); sp.position.set(Math.cos(a)*.1,.19,Math.sin(a)*.1); sh.userData.head.add(sp); }
    const aura=new THREE.Mesh(GEO.sphere,new THREE.MeshBasicMaterial({color:td.col,transparent:true,opacity:.2,depthWrite:false,blending:THREE.AdditiveBlending})); aura.scale.setScalar(1.25); aura.position.y=.9; sh.add(aura); sh.userData.aura=aura;
    sh.position.set(0,0,0); g.add(sh); g.userData={sh,td}; g.position.set(td.bx+.5,WHu*.6+.02,td.by+.5); scene.add(g); coreM.push(g);
  });
}
function syncCores(){
  TD.forEach((td,i)=>{
    const g=coreM[i]; if(!g) return; const ci=idx(td.bx,td.by); g.visible=td.coreAlive&&wallT[ci]===CORE;
    if(!g.visible) return; const t=game.t, sh=g.userData.sh, hp=hpW[ci]/BHP[CORE];
    sh.position.y=Math.sin(t*2.4+i)*.07+.02; sh.rotation.y=Math.PI/2*(1+.35*Math.sin(t*.7+i))*(i%2?1:-1)-Math.PI/2*0+Math.PI*.5;
    const hurt=(td.alert||0)>0?1:0; sh.userData.aura.material.opacity=.18+.12*Math.sin(t*3)+hurt*.25;
    sh.userData.mats.wool.emissive.setRGB(hurt*.5*(Math.floor(t*10)%2),0,0);
    sh.userData.head.rotation.z=Math.sin(t*1.2+i)*.05; sh.userData.bubble.visible=false; sh.userData.ice.visible=false;
    sh.scale.setScalar(1.55*(.9+.1*hp));
  });
}

/* ---------- générateurs de ressources ---------- */
const INGOTM={bronze:M('#cd7f32',{metalness:.25,roughness:.4,emissive:'#3a2208',emissiveIntensity:.35}),silver:M('#d6dde6',{metalness:.2,roughness:.4,emissive:'#303846',emissiveIntensity:.3}),gold:M('#fbbf24',{metalness:.25,roughness:.35,emissive:'#6b4a00',emissiveIntensity:.4}),diamond:new THREE.MeshStandardMaterial({color:0x4fe3f5,emissive:0x16a6c0,emissiveIntensity:.5,flatShading:true,roughness:.15})};
function buildPads(){
  padM=[];
  for(const sp of spawners){
    const g=new THREE.Group(), col=sp.kind==='base'?TEAMS[sp.team].dark:sp.kind==='dia'?'#0e7490':'#a16207';
    g.position.set(sp.x+.5,0,sp.y+.5);
    const plate=new THREE.Mesh(GEO.box,M(col,{roughness:.6})); plate.scale.set(.86,.07,.86); plate.position.y=.035; plate.receiveShadow=true; g.add(plate);
    const rim=new THREE.Mesh(GEO.box,M(sp.kind==='base'?TEAMS[sp.team].light:sp.kind==='dia'?'#67e8f9':'#fde047')); rim.scale.set(.9,.05,.9); rim.position.y=.02; g.add(rim);
    const slots={};
    const mkStack=(res,layout,cx)=>{ const arr=[]; let row=0; for(const k of layout){ for(let j=0;j<k;j++){ const m=new THREE.Mesh(GEO.box,INGOTM[res]); m.scale.set(.24,.085,.14); m.position.set(cx+(j-(k-1)/2)*.26,.1+row*.09,0); m.castShadow=true; m.visible=false; g.add(m); arr.push(m); } row++; } return arr; };
    if(sp.kind==='base'){ slots.bronze=mkStack('bronze',[2,2,1],-.2); slots.silver=mkStack('silver',[2,1],.22); slots.gold=mkStack('gold',[2,1],0); slots.gold.forEach(m=>m.position.z=-.28); }
    else if(sp.kind==='gold'){ slots.gold=mkStack('gold',[3,2],0); }
    else { const gem=new THREE.Mesh(GEO.octa,INGOTM.diamond); gem.scale.set(.2,.3,.2); gem.castShadow=true; g.add(gem); slots.gem=gem; slots.piles=[]; for(let k=0;k<4;k++){ const m=new THREE.Mesh(GEO.octa,INGOTM.diamond); m.scale.set(.09,.13,.09); m.position.set(-.3+k*.2,.14,.3); m.visible=false; g.add(m); slots.piles.push(m); } }
    scene.add(g); padM.push({g,sp,slots});
  }
}
function syncPads(){
  const t=game.t;
  for(const o of padM){ const sp=o.sp, T0=sp.types, s=o.slots;
    const show=(arr,n)=>{ for(let i=0;i<arr.length;i++) arr[i].visible=i<n; };
    if(sp.kind==='base'){ show(s.bronze,Math.min(5,Math.ceil(T0.bronze.stock/8))); show(s.silver,Math.min(3,Math.ceil(T0.silver.stock/4))); show(s.gold,T0.gold.int()===Infinity?0:Math.min(3,Math.ceil(T0.gold.stock/2))); }
    else if(sp.kind==='gold'){ show(s.gold,Math.min(5,T0.gold.stock)); }
    else { const d=T0.diamond; s.gem.position.y=.6+Math.sin(t*2.5+sp.x)*.08; s.gem.rotation.y=t*1.6; s.gem.material=INGOTM.diamond; s.gem.visible=true; s.gem.scale.set(.2,.3,.2).multiplyScalar(d.stock>0?1:.7); show(s.piles,Math.min(4,d.stock)); }
  }
}

/* ---------- projectiles, bombes, pièges, boucliers... ---------- */
function createProj(p){
  const g=new THREE.Group(), add=(geo,mat,x,y,z,sx,sy,sz)=>{ const m=new THREE.Mesh(geo,mat); m.position.set(x,y,z); m.scale.set(sx,sy,sz); g.add(m); return m; };
  const col=p.col||'#fff';
  switch(p.kind){
    case 'rocket': add(GEO.cyl,M('#e5e7eb',{metalness:.4}),0,0,0,.07,.4,.07).rotation.z=Math.PI/2; add(GEO.cone,M('#ef4444'),.26,0,0,.07,.16,.07).rotation.z=-Math.PI/2; add(GEO.octa,new THREE.MeshBasicMaterial({color:0xffb347}),-.28,0,0,.12,.07,.07); break;
    case 'wool': add(GEO.sphere,M('#fbcfe8'),0,0,0,.16,.16,.16); add(GEO.sphere,M('#fff'),.06,.05,0,.1,.1,.1); break;
    case 'ice': add(GEO.octa,new THREE.MeshStandardMaterial({color:0xbae6fd,emissive:0x5ab8e6,emissiveIntensity:.6,flatShading:true}),0,0,0,.15,.15,.15); break;
    case 'bubble': add(GEO.sphere,new THREE.MeshStandardMaterial({color:0xbfe3ff,transparent:true,opacity:.5,roughness:.1}),0,0,0,.22,.22,.22); break;
    case 'boomerang': { const a=add(GEO.box,M('#fbbf24'),0,0,.12,.4,.05,.1); a.rotation.y=.6; const b=add(GEO.box,M('#fbbf24'),0,0,-.12,.4,.05,.1); b.rotation.y=-.6; break; }
    case 'arrow': add(GEO.box,M('#e5e7eb'),0,0,0,.5,.025,.025); add(GEO.cone,M('#9ca3af'),.27,0,0,.04,.1,.04).rotation.z=-Math.PI/2; break;
    case 'flame': add(GEO.sphere,new THREE.MeshBasicMaterial({color:0xffa83c,transparent:true,opacity:.7,depthWrite:false,blending:THREE.AdditiveBlending}),0,0,0,.16,.16,.16); break;
    default: add(GEO.box,new THREE.MeshBasicMaterial({color:col}),0,0,0,.34,.06,.06);
  }
  return g;
}
function updateProjM(p,m){
  m.position.set(p.x*U,(p.z!==undefined?p.z:12)*U+.1,p.y*U); m.rotation.y=-Math.atan2(p.vy,p.vx);
  if(p.kind==='boomerang') m.rotation.x=game.t*18;
  if(p.kind==='flame'){ const k=Math.max(.2,p.life/.32); m.scale.setScalar(1.6-k); if(Math.random()<.4) parts.push({x:p.x,y:p.y,z:12,vx:rnd(-20,20),vy:rnd(-20,20),vz:rnd(10,40),life:.25,max:.25,col:'#fb923c',size:4}); }
}
function createBomb(b){
  const g=new THREE.Group();
  if(b.bolt){ const d=new THREE.Mesh(GEO.disc,new THREE.MeshBasicMaterial({color:0xfde047,transparent:true,opacity:.3,depthWrite:false,side:THREE.DoubleSide})); d.scale.setScalar(1.7); d.position.y=.08; g.add(d); const r=new THREE.Mesh(GEO.ring,new THREE.MeshBasicMaterial({color:0xfde047,transparent:true,side:THREE.DoubleSide})); r.position.y=.09; g.add(r); g.userData={bolt:true,d,r}; return g; }
  const body=new THREE.Mesh(GEO.sphere,new THREE.MeshStandardMaterial({color:b.kind==='cluster'?0x15803d:b.kind==='repel'?0x6d28d9:0x1f2937,flatShading:true,roughness:.5,emissive:0x000000})); body.scale.setScalar(.26); body.castShadow=true; g.add(body);
  const fuse=new THREE.Mesh(GEO.cyl,M('#a16207')); fuse.scale.set(.025,.14,.025); fuse.position.y=.3; g.add(fuse);
  const sp=new THREE.Mesh(GEO.octa,new THREE.MeshBasicMaterial({color:0xfde047})); sp.scale.setScalar(.06); sp.position.y=.4; g.add(sp);
  g.userData={body,sp}; return g;
}
function updateBombM(b,m){
  m.position.set(b.x*U,(b.h||0)*U+(b.bolt?0:.25),b.y*U);
  if(b.bolt){ const k=1-b.fuse; m.userData.r.scale.setScalar(1.7*(1-k*.8)+.1); m.userData.d.material.opacity=.15+.25*Math.abs(Math.sin(game.t*14)); return; }
  const blink=Math.floor(b.fuse*(b.fuse<.7?14:6))%2; m.userData.body.material.emissive.setRGB(blink?.8:0,blink?.1:0,0); m.userData.sp.position.y=.4+Math.random()*.03;
}
function createTrap(t){
  const g=new THREE.Group(), add=(geo,mat,x,y,z,sx,sy,sz)=>{ const m=new THREE.Mesh(geo,mat); m.position.set(x,y,z); m.scale.set(sx,sy,sz); m.castShadow=true; g.add(m); return m; }, u={};
  if(t.kind==='trampo'){ add(GEO.cyl,M('#be185d'),0,.08,0,.44,.16,.44); u.top=add(GEO.cyl,M('#f472b6'),0,.17,0,.4,.04,.4); add(GEO.torus,M('#fbcfe8'),0,.19,0,.36,.36,.36).rotation.x=Math.PI/2; }
  else if(t.kind==='mine'){ add(GEO.cyl,M('#4b5563',{metalness:.5}),0,.07,0,.26,.14,.26); u.led=add(GEO.sphere0,new THREE.MeshBasicMaterial({color:0xff2222}),0,.17,0,.06,.06,.06); }
  else if(t.kind==='banana'){ const b=add(GEO.torus,M('#fde047'),0,.12,0,.2,.2,.2); b.rotation.x=Math.PI/2; b.scale.set(.2,.2,.5); add(GEO.sphere0,M('#78350f'),.18,.12,0,.04,.04,.04); }
  else if(t.kind==='turret'){ const col=t.ice?'#7dd3fc':'#94a3b8'; add(GEO.cyl,M('#475569',{metalness:.4}),0,.12,0,.26,.24,.26); add(GEO.box,M(TEAMS[t.team].col),0,.04,0,.55,.08,.55); u.head=new THREE.Group(); u.head.position.y=.34; g.add(u.head); const hm=new THREE.Mesh(GEO.sphere,M(col,{metalness:.4})); hm.scale.setScalar(.2); hm.castShadow=true; u.head.add(hm); const bar=new THREE.Mesh(GEO.box,M('#cbd5e1',{metalness:.6})); bar.scale.set(.42,.07,.07); bar.position.x=.24; u.head.add(bar); u.flash=new THREE.Mesh(GEO.octa,new THREE.MeshBasicMaterial({color:0xfde047})); u.flash.scale.setScalar(.1); u.flash.position.x=.5; u.head.add(u.flash); }
  else if(t.kind==='vortex'){ u.r=[]; for(let i=0;i<3;i++){ const r=new THREE.Mesh(GEO.torus,new THREE.MeshBasicMaterial({color:[0xc4b5fd,0x8b5cf6,0x6d28d9][i],transparent:true,opacity:.85})); r.rotation.x=Math.PI/2; g.add(r); u.r.push(r); } u.d=new THREE.Mesh(GEO.disc,new THREE.MeshBasicMaterial({color:0x7c3aed,transparent:true,opacity:.25,depthWrite:false,side:THREE.DoubleSide})); u.d.position.y=.05; g.add(u.d); u.core=add(GEO.sphere,new THREE.MeshBasicMaterial({color:0x000000}),0,.5,0,.25,.25,.25); }
  g.userData=u; return g;
}
function updateTrapM(t,m){
  const u=m.userData, tm=game.t; m.position.set(t.x*U,0,t.y*U);
  if(t.kind==='trampo'){ u.top.position.y=.17-(t.anim||0)*.08; m.scale.y=1+(t.anim||0)*.2; }
  else if(t.kind==='mine'){ const armed=t.age>1.2; u.led.visible=armed&&Math.floor(tm*4)%2===0; m.visible=!(t.team!==0&&armed&&false); }
  else if(t.kind==='turret'){ u.head.rotation.y=-t.ang; u.flash.visible=(t.muz||0)>0; if(t.t<4) m.visible=Math.floor(tm*8)%2===0||true; }
  else if(t.kind==='vortex'){ const k=Math.min(1,t.age*3)*Math.min(1,t.t*2); u.r.forEach((r,i)=>{ const s=(.35+i*.45)*k; r.scale.set(s,s,s); r.rotation.z=tm*(4-i)+i; r.position.y=.4+i*.05; }); u.d.scale.setScalar(5*k); u.core.scale.setScalar(.25*k); }
}
function createShield(s){
  const g=new THREE.Group(), col=TEAMS[s.team].col;
  const dome=new THREE.Mesh(new THREE.SphereGeometry(1,24,14,0,Math.PI*2,0,Math.PI/2),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.2,depthWrite:false,side:THREE.DoubleSide})); g.add(dome);
  const wire=new THREE.Mesh(new THREE.SphereGeometry(1,16,8,0,Math.PI*2,0,Math.PI/2),new THREE.MeshBasicMaterial({color:col,wireframe:true,transparent:true,opacity:.35})); g.add(wire);
  g.userData={dome,wire}; return g;
}
function updateShieldM(s,m){ const R=s.r*U*(.7+.3*s.a); m.position.set(s.x*U,0,s.y*U); m.scale.set(R,R*.62,R); m.userData.wire.rotation.y=game.t*.4; m.userData.dome.material.opacity=(.14+.05*Math.sin(game.t*6))*(s.t<2&&Math.floor(game.t*8)%2?.4:1); }
function createHook(h){ const g=new THREE.Group(); const l=new THREE.Mesh(GEO.cyl,M('#fde68a')); g.add(l); const tip=new THREE.Mesh(GEO.sphere0,M('#fbbf24')); tip.scale.setScalar(.1); g.add(tip); g.userData={l,tip}; return g; }
function updateHookM(h,m){ const o=h.owner; m.position.set(0,0,0); m.scale.set(1,1,1); const L=m.userData.l; beamBetween(L,o.x*U,.5,o.y*U,h.x*U,.5,h.y*U,.025); m.userData.tip.position.set(h.x*U,.5,h.y*U); }
function createPearl(){ const m=new THREE.Mesh(GEO.sphere,new THREE.MeshStandardMaterial({color:0xc084fc,emissive:0x9333ea,emissiveIntensity:.8,flatShading:true})); m.scale.setScalar(.14); return m; }
function createGuard(g){ const gm=createSheep({light:'#ffffff',col:TEAMS[g.team].col,dark:TEAMS[g.team].dark},{scale:.6,neutral:true}); return gm; }
function updateGuardM(g,m){
  const u=m.userData; m.position.set(g.x*U,0,g.y*U); m.rotation.y=-(g.ang||0);
  const mv=Math.hypot(g.vx||0,g.vy||0)>5; const sw=Math.sin(g.ph*1.4)*(mv?.7:0); u.legs[0].rotation.z=sw; u.legs[1].rotation.z=-sw; u.legs[2].rotation.z=-sw; u.legs[3].rotation.z=sw;
  if(!u.sword){ const sd=makeHeld('sword',{sword:1,bsel:2,team:g.team}); u.anchor.add(sd); u.sword=sd; }
  u.anchor.rotation.y=(g.swing||0)>0?Math.sin((1-g.swing/.2)*Math.PI)*1.2:0;
  u.head.rotation.z=Math.sin(g.ph*.3)*.05; if(g.t<5) m.visible=Math.floor(game.t*8)%2===0; else m.visible=true;
}
function createChick(c){ const gm=createSheep({light:'#fbcfe8',col:'#ef4444',dark:'#7f1d1d'},{scale:.5,neutral:true}); return gm; }
function updateChickM(c,m){ const u=m.userData; m.position.set(c.x*U,Math.abs(Math.sin(c.ph))*.12,c.y*U); m.rotation.y=-Math.atan2(c.vy,c.vx); const sw=Math.sin(c.ph*1.5)*.8; u.legs.forEach((l,i)=>l.rotation.z=(i%2?-sw:sw)); const bl=c.t<2&&Math.floor(game.t*10)%2; u.mats.wool.emissive.setRGB(bl?.9:0,bl?.1:0,0); }

/* ---------- anneaux, faisceaux ---------- */
function syncRings(){
  let n=0;
  for(const r of rings){
    const k=r.t/r.max, rr=r.r*U*(.2+.8*Math.sqrt(k)); let m=ringPool[n];
    if(!m){ m=new THREE.Mesh(GEO.ring,new THREE.MeshBasicMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide})); const f=new THREE.Mesh(GEO.disc,new THREE.MeshBasicMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide})); m.userData.f=f; scene.add(m); scene.add(f); ringPool[n]=m; }
    const c=cparse(r.col); m.visible=true; m.position.set(r.x*U,.1,r.y*U); m.scale.setScalar(rr); m.material.color.setRGB(c[0],c[1],c[2]); m.material.opacity=1-k;
    const f=m.userData.f; f.visible=!!r.fill; if(r.fill){ f.position.copy(m.position); f.position.y=.09; f.scale.setScalar(rr); f.material.color.setRGB(c[0],c[1],c[2]); f.material.opacity=(1-k)*.5; }
    n++;
  }
  for(let i=n;i<ringPool.length;i++){ ringPool[i].visible=false; ringPool[i].userData.f.visible=false; }
  let b=0;
  for(const bm of beams){
    const k=bm.t/.8; let m=beamPool[b]; if(!m){ m=new THREE.Mesh(GEO.cyl,new THREE.MeshBasicMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending})); scene.add(m); beamPool[b]=m; }
    const c=cparse(bm.col); m.visible=true; m.material.color.setRGB(c[0],c[1],c[2]); m.material.opacity=(1-k)*.6; const w=(.4*(1-k)+.12); m.scale.set(w,5,w); m.position.set(bm.x*U,2.5,bm.y*U); b++;
  }
  for(let i=b;i<beamPool.length;i++) beamPool[i].visible=false;
}

/* ---------- ghost de placement ---------- */
function setGhost(tx,ty,kind,color){
  if(!ghostMesh){ ghostMesh=new THREE.Mesh(GEO.box,new THREE.MeshBasicMaterial({transparent:true,opacity:.5,depthWrite:false})); scene.add(ghostMesh); }
  if(tx===null){ ghostMesh.visible=false; return; }
  ghostMesh.visible=true; ghostMesh.material.color.set(color); const h=kind==='bridge'?.2:WHu; ghostMesh.scale.set(.98,h,.98); ghostMesh.position.set(tx+.5,kind==='bridge'?-.09:h/2,ty+.5);
  ghostMesh.material.opacity=.38+.14*Math.sin(game.t*8);
}

/* ---------- caméra & visée ---------- */
const rayc=new THREE.Raycaster(), planeY=new THREE.Plane(new THREE.Vector3(0,1,0),0), hitP=new THREE.Vector3();
function updateCamera(dt){
  const tgt=player.alive?player:(ents.find(o=>o.alive&&!o.elim)||player);
  if(game.state==='menu'){ const a=game.t*.08; cam3.x=CX*T; cam3.y=CY*T; camera3.position.set(CX+.5+Math.cos(a)*36,24,CY+.5+Math.sin(a)*36); camera3.lookAt(CX+.5,0,CY+.5); sun.position.set(CX-16,32,CY+14); sun.target.position.set(CX,0,CY); return; }
  let lx=0,ly=0; if(player.alive&&game.state==='play'&&aim.ok){ lx=clamp((aim.x-tgt.x)*.14,-90,90); ly=clamp((aim.y-tgt.y)*.14,-90,90); }
  const k=Math.min(1,dt*6); cam3.x+=(tgt.x+lx-cam3.x)*k; cam3.y+=(tgt.y+ly-cam3.y)*k;
  const cx=cam3.x*U, cz=cam3.y*U, sh=shake*.03;
  camera3.position.set(cx+(Math.random()-.5)*sh,17.5+tgt.z*U*.25+(Math.random()-.5)*sh,cz+11.8);
  camera3.lookAt(cx,.2,cz-.2);
  sun.position.set(cx-16,32,cz+14); sun.target.position.set(cx,0,cz);
}
function updateAim(){
  if(game.state!=='play'){ aim.ok=false; return; }
  rayc.setFromCamera(new THREE.Vector2(mouse.x/VW*2-1,-(mouse.y/VH*2-1)),camera3);
  planeY.constant=-WHu; let pt=null;
  if(rayc.ray.intersectPlane(planeY,hitP)){ const tx=Math.floor(hitP.x),ty=Math.floor(hitP.z); if(wl(tx,ty)>0) pt=hitP.clone(); }
  if(!pt){ planeY.constant=0; if(rayc.ray.intersectPlane(planeY,hitP)) pt=hitP.clone(); }
  if(pt){ aim.x=pt.x*T; aim.y=pt.z*T; aim.ok=true; }
}
function w2s(x,y,z){ v3.set(x*U,(z||0)*U,y*U).project(camera3); return [(v3.x*.5+.5)*VW,(-v3.y*.5+.5)*VH,v3.z<1]; }

/* ---------- frame ---------- */
function onNewGame(){
  if(!renderer) return;
  clearDynamic(); buildWorldMeshes(); genProps3d(); buildCores(); buildPads(); worldSig=-1;
  if(!playerRing){ playerRing=new THREE.Mesh(GEO.ring,new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,depthWrite:false,side:THREE.DoubleSide})); scene.add(playerRing); }
  cam3.x=player.x; cam3.y=player.y;
}
function syncEnts(dt){
  for(const e of ents){
    let m=entM.get(e); if(!m){ m=createSheep(TEAMS[e.team]); scene.add(m); entM.set(e,m); }
    m.visible=e.alive&&!(e.inv>0&&Math.floor(game.t*10)%2); if(!e.alive) continue;
    const u=m.userData; let sc=1,dy=0; if(e.voidT>0){ sc=Math.max(.2,1-e.voidT/.28*.7); dy=-e.voidT*5; }
    m.position.set(e.x*U,e.z*U+dy,e.y*U); m.rotation.y=-e.ang;
    updateHeld(e,m); animateSheep(e,m,dt); setSheepTint(m,e); m.scale.multiplyScalar(sc);
    const ghost=e.cloak>0?(e===player?.4:.12):1; for(const k of ['wool','dark','scarf','face']){ const mt=u.mats[k]; const tr=ghost<1; if(mt.transparent!==tr){mt.transparent=tr;mt.needsUpdate=true;} mt.opacity=ghost; }
    if(e.pull){ let pm=pullM.get(e); if(!pm){ pm=new THREE.Mesh(GEO.cyl,M('#fde68a')); scene.add(pm); pullM.set(e,pm); } beamBetween(pm,e.x*U,e.z*U+.5,e.y*U,e.pull.x*U,.5,e.pull.y*U,.02); }
  }
  for(const [e,pm] of pullM) if(!e.pull||!e.alive){ scene.remove(pm); pullM.delete(e); }
  if(player&&player.alive){ playerRing.visible=true; const gh=groundH(player)*U; playerRing.position.set(player.x*U,gh+.06,player.y*U); playerRing.scale.setScalar(.62+.05*Math.sin(game.t*5)); playerRing.material.opacity=.6+.3*Math.sin(game.t*5); playerRing.material.color.set(TEAMS[player.team].light); } else if(playerRing) playerRing.visible=false;
}
function render3d(dt){
  if(!renderer) return;
  const sig=worldSignature(); if(sig!==worldSig||popActive){ rebuildWorld(); worldSig=sig; }
  updateSky(game.t); syncEnts(dt); syncCores(); syncPads(); syncProps();
  sync(guardM,guards,createGuard,updateGuardM); sync(chickM,chickens,createChick,updateChickM);
  sync(projM,projs,createProj,updateProjM); sync(bombM,bombs,createBomb,updateBombM); sync(trapM,traps,createTrap,updateTrapM);
  sync(shieldM,shields,createShield,updateShieldM); sync(hookM,hooks,createHook,updateHookM); sync(pearlM,pearls,createPearl,(p,m)=>m.position.set(p.x*U,.5,p.y*U));
  syncRings(); fillParticles();
  updateCamera(dt); updateAim();
  renderer.render(scene,camera3);
}
