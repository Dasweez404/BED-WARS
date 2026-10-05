'use strict';
/* =====================  RENDU 3D : navire, îles, objets dynamiques, effets, caméra  ===================== */
const entM=new Map(), guardM=new Map(), chickM=new Map(), projM=new Map(), bombM=new Map(), trapM=new Map(), shieldM=new Map(), hookM=new Map(), pearlM=new Map(), pullM=new Map();
let coreM=[], padM=[], propM=[], ringPool=[], beamPool=[], playerRing=null, ghostMesh=null, shipGroup=null, jrTex=null;

function clearDynamic(){
  for(const mp of [entM,guardM,chickM,projM,bombM,trapM,shieldM,hookM,pearlM,pullM]){ for(const [,m] of mp) scene.remove(m); mp.clear(); }
  for(const m of coreM) scene.remove(m); coreM=[];
  for(const g of padM) scene.remove(g.g); padM=[];
  for(const g of propM) scene.remove(g.m); propM=[];
  if(shipGroup){ scene.remove(shipGroup); shipGroup=null; }
  if(ambient){ scene.remove(ambient); ambient=null; }
  for(const r of ringPool){ scene.remove(r); scene.remove(r.userData.f); } ringPool=[];
  for(const b of beamPool) scene.remove(b); beamPool=[];
}
/* ---------- ambiance : mouettes, épaves, îlots lointains, eaux peu profondes ---------- */
let ambient=null;
function buildAmbient(){
  const g=new THREE.Group(), u={gulls:[],debris:[]}; const rn=prng3(99);
  // eaux peu profondes sous chaque île
  for(const il of ISLANDS){ const d=new THREE.Mesh(GEO.disc,new THREE.MeshBasicMaterial({color:il.ship?0x4cc3d8:0x5fdad0,transparent:true,opacity:.34,depthWrite:false})); d.scale.set(il.ship?5.6:il.r*.82+1.4,1,il.ship?8.6:il.r*.82+1.4); d.position.set(il.x+.5,-1.12,il.y+.5); g.add(d); }
  // îlots lointains (instanciés)
  const N=10, rock=new THREE.InstancedMesh(GEO.sphere0,new THREE.MeshStandardMaterial({color:0x7a6a58,flatShading:true}),N), sand=new THREE.InstancedMesh(GEO.cyl,new THREE.MeshStandardMaterial({color:0xefdca4,flatShading:true}),N),
        trunk=new THREE.InstancedMesh(GEO.cyl,new THREE.MeshStandardMaterial({color:0xa8793d,flatShading:true}),N), fr=new THREE.InstancedMesh(GEO.cone,new THREE.MeshStandardMaterial({color:0x44a850,flatShading:true}),N*4);
  for(let i=0;i<N;i++){
    const a=i*6.2832/N+rn()*.4, rad=62+rn()*34, x=CX+.5+Math.cos(a)*rad, z=CY+.5+Math.sin(a)*rad, s=2.2+rn()*2;
    sc3.set(s,s*.55,s); v3.set(x,-.7,z); m4.compose(v3,qd.identity(),sc3); rock.setMatrixAt(i,m4);
    sc3.set(s*.9,.5,s*.9); v3.set(x,-.15,z); m4.compose(v3,qd.identity(),sc3); sand.setMatrixAt(i,m4);
    sc3.set(.12,2.2,.12); v3.set(x,1.0,z); m4.compose(v3,qd.identity(),sc3); trunk.setMatrixAt(i,m4);
    for(let k=0;k<4;k++){ const qa=new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.sin(k*1.57)*1.0,0,-Math.cos(k*1.57)*1.0)); sc3.set(.3,1.3,.1); v3.set(x+Math.cos(k*1.57)*.6,2.1,z+Math.sin(k*1.57)*.6); m4.compose(v3,qa,sc3); fr.setMatrixAt(i*4+k,m4); }
  }
  for(const m of [rock,sand,trunk,fr]){ m.frustumCulled=false; g.add(m); }
  // mouettes
  for(let i=0;i<6;i++){
    const b=new THREE.Group(), wm=M('#f4f4f4'); const body=new THREE.Mesh(GEO.sphere0,wm); body.scale.set(.32,.14,.14); b.add(body);
    const hd=new THREE.Mesh(GEO.sphere0,wm); hd.scale.set(.1,.1,.1); hd.position.x=.3; b.add(hd); const bk=new THREE.Mesh(GEO.cone,M('#f59e0b')); bk.scale.set(.04,.14,.04); bk.rotation.z=-Math.PI/2; bk.position.x=.42; b.add(bk);
    const wings=[]; for(const z of [-1,1]){ const w=new THREE.Group(); const wb=new THREE.Mesh(GEO.box,wm); wb.scale.set(.2,.025,.6); wb.position.z=z*.3; w.add(wb); b.add(w); wings.push(w); }
    b.userData={wings,cx:CX+(rn()-.5)*70,cz:CY+(rn()-.5)*70,r:7+rn()*16,sp:.25+rn()*.35,ph:rn()*6.28,h:7+rn()*6,fl:rn()*6}; g.add(b); u.gulls.push(b);
  }
  // épaves et bouées qui flottent
  const isl=ISLANDS.map(il=>[il.x,il.y,il.ship?10:il.r+3]);
  for(let i=0,n=0;i<200&&n<14;i++){
    const x=CX-45+rn()*90, z=CY-45+rn()*90; if(isl.some(([ix,iy,r])=>Math.hypot(ix-x,iy-z)<r)) continue; n++;
    const t=n%3, m=new THREE.Group();
    if(t===0){ const bm=new THREE.Mesh(GEO.cyl,M('#8a5326')); bm.scale.set(.22,.38,.22); bm.rotation.z=1.2; m.add(bm); }
    else if(t===1){ const pl=new THREE.Mesh(GEO.box,M('#9a6b3a')); pl.scale.set(1.0,.07,.3); m.add(pl); const p2=new THREE.Mesh(GEO.box,M('#7c4a21')); p2.scale.set(.7,.07,.28); p2.position.set(.2,.0,.35); p2.rotation.y=.4; m.add(p2); }
    else { const bu=new THREE.Mesh(GEO.torus,M('#e5483a')); bu.scale.set(.3,.3,.3); bu.rotation.x=Math.PI/2; m.add(bu); const bw=new THREE.Mesh(GEO.torus,M('#ffffff')); bw.scale.set(.3,.3,.3); bw.rotation.x=Math.PI/2; bw.rotation.z=.8; bw.position.y=.001; m.add(bw); }
    m.userData={x,z,ph:rn()*6.28,sp:.04+rn()*.06,rot:rn()*6.28,t}; g.add(m); u.debris.push(m);
  }
  g.userData=u; scene.add(g); ambient=g;
}
function updateAmbient(dt){
  if(!ambient) return; const t=game.t, u=ambient.userData;
  for(const b of u.gulls){ const d=b.userData, a=t*d.sp+d.ph; b.position.set(d.cx+Math.cos(a)*d.r,d.h+Math.sin(t*.8+d.fl)*.4,d.cz+Math.sin(a)*d.r); b.rotation.y=-(a+Math.PI/2); const f=Math.sin(t*7+d.fl)*.6; d.wings[0].rotation.x=f; d.wings[1].rotation.x=-f; }
  for(const m of u.debris){ const d=m.userData; d.x+=d.sp*dt; if(d.x>CX+50) d.x=CX-50; m.position.set(d.x,-1.12+Math.sin(t*1.4+d.ph)*.07,d.z); m.rotation.y=d.rot+Math.sin(t*.3+d.ph)*.3; m.rotation.x=Math.sin(t*1.1+d.ph)*.08; m.rotation.z=Math.cos(t*.9+d.ph)*.06; }
  if(game.state!=='menu'&&parts.length<350&&Math.random()<.5){ const a=Math.random()*6.28, r=Math.random()*20*T; parts.push({x:cam3.x+Math.cos(a)*r,y:cam3.y+Math.sin(a)*r,z:-34,vx:0,vy:0,vz:6,life:.9,max:.9,col:'#ffffff',size:2.5}); }
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
function jollyTex(team){
  const c=document.createElement('canvas'); c.width=64; c.height=44; const g=c.getContext('2d');
  g.fillStyle='#14121a'; g.fillRect(0,0,64,44); g.fillStyle=team||'#e8e8f0';
  g.beginPath(); g.arc(32,19,10,0,6.3); g.fill(); g.fillRect(26,26,12,7);
  g.fillStyle='#14121a'; g.beginPath(); g.arc(28,18,2.6,0,6.3); g.arc(36,18,2.6,0,6.3); g.fill(); g.fillRect(31,22,2,3);
  g.strokeStyle=team||'#e8e8f0'; g.lineWidth=3; g.beginPath(); g.moveTo(14,34); g.lineTo(50,42); g.moveTo(50,34); g.lineTo(14,42); g.stroke();
  const t=new THREE.CanvasTexture(c); return t;
}

/* ---------- navire central ---------- */
function buildShip(){
  const g=new THREE.Group(); g.position.set(CX+.5,0,CY+.5);
  const add=(geo,mat,x,y,z,sx,sy,sz,rx,ry,rz)=>{ const m=new THREE.Mesh(geo,mat); m.position.set(x,y,z); m.scale.set(sx,sy,sz); if(rx||ry||rz) m.rotation.set(rx||0,ry||0,rz||0); m.castShadow=true; m.receiveShadow=true; g.add(m); return m; };
  const hull=M('#5e3a1e'), hull2=M('#744a26'), dark=M('#2b2118'), steel=M('#3b3f4a',{metalness:.3});
  // coque (sous le pont)
  add(GEO.box,hull,0,-.78,.5,7.4,1.15,10.6); add(GEO.box,hull2,0,-.2,.5,7.55,.25,10.8);
  add(GEO.box,hull,0,-.78,-5.2,3.6,1.15,3.6,0,Math.PI/4,0); add(GEO.box,hull2,0,-.2,-5.2,3.75,.25,3.75,0,Math.PI/4,0);
  add(GEO.box,hull,0,-.8,6.1,6.3,1.1,1.6);
  // bastingages
  for(const x of [-3.62,3.62]){ add(GEO.box,hull2,x,.22,.8,.16,.44,10); add(GEO.box,dark,x,.46,.8,.2,.07,10.2); }
  for(const x of [-1,1]){ add(GEO.box,hull2,x*2.55,.22,-4.2,.16,.44,3.2,0,x*.5,0); add(GEO.box,hull2,x*1.2,.22,-5.8,.16,.44,2.2,0,x*1.0,0); }
  add(GEO.box,hull2,0,.3,6.55,7.3,.6,.25); add(GEO.box,dark,0,.62,6.55,7.4,.07,.3);
  // château arrière + gouvernail
  add(GEO.box,hull2,0,.15,6.0,.0,.0,.0);
  const wheel=add(GEO.torus,M('#8a5a2b'),0,.85,5.3,.5,.5,.5); wheel.rotation.set(0,0,0); add(GEO.cyl,hull2,0,.45,5.3,.1,.9,.1);
  g.userData.wheel=wheel;
  // mâts et voiles
  const mast=(z,h,sw,sh)=>{
    add(GEO.cyl,M('#7c4a21'),0,h/2,z,.14,h,.14); add(GEO.cyl,M('#7c4a21'),0,h*.82,z,.07,sw*1.15,.07,0,0,Math.PI/2);
    const sail=new THREE.Mesh(GEO.box,new THREE.MeshStandardMaterial({color:0xf3ead2,transparent:true,opacity:.62,roughness:1,flatShading:true,depthWrite:false})); sail.scale.set(sw,sh,.05); sail.position.set(0,h*.82-sh/2,z+.12); sail.castShadow=false; g.add(sail);
    add(GEO.cyl,M('#5b3a1c'),0,h*.97,z,.3,.12,.3);
    return sail;
  };
  g.userData.sails=[mast(-3.6,4.8,3.4,1.8),mast(2.8,3.9,2.9,1.5)];
  // drapeau noir
  jrTex=jrTex||jollyTex();
  const flag=new THREE.Mesh(new THREE.PlaneGeometry(1.1,.75,1,1),new THREE.MeshBasicMaterial({map:jrTex,side:THREE.DoubleSide})); flag.position.set(.62,4.8*.97+.35,-3.6); g.add(flag); g.userData.flag=flag;
  // canons
  for(const x of [-1,1]) for(const z of [-2.2,.2,2.6,4.6]){
    add(GEO.box,M('#6b4423'),x*3.05,.16,z,.5,.3,.55); add(GEO.cyl,steel,x*3.4,.38,z,.14,.8,.14,0,0,Math.PI/2); add(GEO.sphere0,steel,x*3.8,.38,z,.16,.16,.16);
    for(const o of [-.2,.2]) add(GEO.cyl,dark,x*3.05,.1,z+o,.17,.06,.17,Math.PI/2,0,0);
  }
  // lanterne de poupe et tonneaux
  add(GEO.box,new THREE.MeshBasicMaterial({color:0xffc861}),-3.2,1.0,6.55,.18,.22,.18); add(GEO.cyl,dark,-3.2,.55,6.55,.05,1.0,.05);
  add(GEO.box,new THREE.MeshBasicMaterial({color:0xffc861}),3.2,1.0,6.55,.18,.22,.18); add(GEO.cyl,dark,3.2,.55,6.55,.05,1.0,.05);
  g.traverse(o=>{ if(o.isMesh&&o.material&&!o.material.map&&o.material.transparent!==true) o.receiveShadow=true; });
  scene.add(g); shipGroup=g;
  // remous blanc autour de la coque
  const foam=new THREE.Mesh(GEO.box,new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.4,depthWrite:false})); foam.scale.set(8.9,.04,13.4); foam.position.set(0,-1.1,.5); g.add(foam);
  const foam2=new THREE.Mesh(GEO.box,new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.4,depthWrite:false})); foam2.scale.set(5.2,.04,5.2); foam2.rotation.y=Math.PI/4; foam2.position.set(0,-1.1,-5.2); g.add(foam2);
}
function updateShip(){
  if(!shipGroup) return; const t=game.t, u=shipGroup.userData;
  shipGroup.position.y=Math.sin(t*1.2)*.04; shipGroup.rotation.z=Math.sin(t*.9)*.004; shipGroup.rotation.x=Math.sin(t*.7)*.003;
  if(u.flag) u.flag.rotation.y=Math.sin(t*3)*.3; if(u.wheel) u.wheel.rotation.z=t*.3;
}

/* ---------- décors ---------- */
function genProps3d(){
  const list=[]; const used=new Set();
  const add=(x,y,type)=>{
    if(!inb(x,y)||floorT[idx(x,y)]!==1||spawnerAt(x,y)) return; const k=x+','+y; if(used.has(k)) return;
    for(const t of TD){ if(Math.abs(x-t.spawnTile[0])<=1&&Math.abs(y-t.spawnTile[1])<=1) return; if(Math.abs(x-t.padTile[0])<=1&&Math.abs(y-t.padTile[1])<=1) return; if(Math.abs(x-t.bx)<=1&&Math.abs(y-t.by)<=1) return; }
    used.add(k); list.push({x,y,type,seed:hash(x,y)%1000});
  };
  for(const t of TD){
    add(t.bx-4,t.by-4,'banner'); add(t.bx+4,t.by-4,'banner'); add(t.bx-2,t.by+2,'torch'); add(t.bx+2,t.by+2,'torch');
    for(let dy=-5;dy<=5;dy++)for(let dx=-5;dx<=5;dx++){
      const sm=Math.abs(dx)+Math.abs(dy); if(sm<7||sm>8) continue; const h=hash(t.bx+dx,t.by+dy);
      if(h%7===0) add(t.bx+dx,t.by+dy,'palm'); else if(h%13===1) add(t.bx+dx,t.by+dy,'rock'); else if(h%17===2) add(t.bx+dx,t.by+dy,'barrel');
    }
  }
  for(const [sx,sy] of [[-1,1],[1,1]]) add(CX+sx*3,CY+sy*3,'barrel');
  for(const sp of spawners) if(sp.kind==='dia'){ add(sp.x-1,sp.y-1,'crystal'); add(sp.x+1,sp.y+1,'palm'); add(sp.x+1,sp.y-1,'chest'); }
  for(const p of list){
    const g=new THREE.Group(), rg=region[idx(p.x,p.y)], td=rg>=0&&rg<4?TEAMS[rg]:null; g.position.set(p.x+.5,0,p.y+.5); g.rotation.y=p.seed;
    const add3=(geo,mat,x,y,z,sx,sy,sz)=>{ const m=new THREE.Mesh(geo,mat); m.position.set(x,y,z); m.scale.set(sx,sy,sz); m.castShadow=true; g.add(m); return m; };
    const u={};
    switch(p.type){
      case 'palm':{ u.fr=[]; add3(GEO.cyl,M('#a8793d'),0,.28,0,.07,.56,.07); const t2=add3(GEO.cyl,M('#a8793d'),.1,.7,0,.06,.4,.06); t2.rotation.z=-.25;
        const top=new THREE.Group(); top.position.set(.17,.9,0); g.add(top); u.top=top;
        for(let k=0;k<6;k++){ const f=new THREE.Mesh(GEO.cone,M(k%2?'#3f9c4b':'#4fb35a')); f.scale.set(.13,.62,.04); f.position.set(Math.cos(k*1.047)*.28,-.05,Math.sin(k*1.047)*.28); f.rotation.set(Math.sin(k*1.047)*1.2,0,-Math.cos(k*1.047)*1.2); f.castShadow=true; top.add(f); }
        add3(GEO.sphere0,M('#7a4a1a'),.2,.82,.07,.06,.06,.06); add3(GEO.sphere0,M('#7a4a1a'),.14,.82,-.07,.06,.06,.06); break; }
      case 'rock': add3(GEO.sphere0,M('#8b8f99'),0,.12,0,.28,.2,.24); add3(GEO.sphere0,M('#a9aeb8'),.2,.07,.1,.14,.1,.12); break;
      case 'barrel': add3(GEO.cyl,M('#8a5a2b'),0,.24,0,.2,.48,.2); add3(GEO.cyl,M('#3b3f4a'),0,.12,0,.215,.05,.215); add3(GEO.cyl,M('#3b3f4a'),0,.36,0,.215,.05,.215); break;
      case 'chest': add3(GEO.box,M('#7c4a21'),0,.12,0,.38,.24,.26); add3(GEO.cyl,M('#7c4a21'),0,.26,0,.13,.38,.13).rotation.z=Math.PI/2; add3(GEO.box,M('#fbbf24',{metalness:.4}),.2,.2,0,.03,.1,.08); add3(GEO.sphere0,new THREE.MeshBasicMaterial({color:0xffd45a}),0,.3,0,.1,.04,.1); break;
      case 'banner':{ add3(GEO.cyl,M('#cbd5e1',{metalness:.4}),0,.6,0,.025,1.2,.025); add3(GEO.sphere0,M('#fde68a',{metalness:.5}),0,1.22,0,.06,.06,.06);
        const fl=new THREE.Mesh(new THREE.PlaneGeometry(.56,.4),new THREE.MeshBasicMaterial({map:jollyTex(td?td.light:null),side:THREE.DoubleSide})); fl.position.set(.3,1.0,0); g.add(fl); u.flag=fl;
        add3(GEO.box,M(td?td.col:'#fff'),.3,.78,0,.56,.05,.02); break; }
      case 'torch': add3(GEO.cyl,M('#6b4423'),0,.3,0,.05,.6,.05); add3(GEO.box,M('#2b2f3a'),0,.66,0,.2,.04,.2); u.fl=add3(GEO.box,new THREE.MeshBasicMaterial({color:0xffb347}),0,.76,0,.13,.17,.13); u.glow=add3(GEO.sphere,new THREE.MeshBasicMaterial({color:0xffb347,transparent:true,opacity:.16,depthWrite:false,blending:THREE.AdditiveBlending}),0,.76,0,.45,.45,.45); u.glow.castShadow=false; add3(GEO.cone,M('#2b2f3a'),0,.9,0,.12,.1,.12); break;
      case 'crystal': for(const [x,h,r,z] of [[0,.8,.14,0],[.18,.5,.1,.08],[-.16,.4,.09,-.1]]) add3(GEO.octa,new THREE.MeshStandardMaterial({color:0x4fe3f5,emissive:0x16a6c0,emissiveIntensity:.6,flatShading:true,roughness:.2}),x,h/2,z,r,h/2,r); break;
    }
    g.userData=u; scene.add(g); propM.push({m:g,p,u});
  }
}
function syncProps(){
  for(const o of propM){ const p=o.p, hid=wallT[idx(p.x,p.y)]>0; o.m.visible=!hid; if(hid) continue; const t=game.t, u=o.u;
    if(p.type==='palm'&&u.top) u.top.rotation.y=Math.sin(t*1.1+p.seed)*.12;
    else if(p.type==='banner'){ u.flag.rotation.y=Math.sin(t*3+p.seed)*.25; }
    else if(p.type==='torch'){ const f=1+Math.sin(t*14+p.seed)*.2; u.fl.scale.set(.13*f,.17*(1+Math.sin(t*11+p.seed)*.25),.13*f); u.glow.scale.setScalar(.45*f); }
  }
}

/* ---------- coffres au trésor (cœur de chaque base) ---------- */
function buildCores(){
  coreM=[];
  TD.forEach((td,i)=>{
    const g=new THREE.Group(), add=(geo,mat,x,y,z,sx,sy,sz)=>{ const m=new THREE.Mesh(geo,mat); m.position.set(x,y,z); m.scale.set(sx,sy,sz); m.castShadow=true; g.add(m); return m; }, u={};
    const wood=M('#8a5326'), band=M('#3b3f4a',{metalness:.4}), gold=M('#fbbf24',{metalness:.35,roughness:.35,emissive:'#7a5000',emissiveIntensity:.5});
    add(GEO.box,wood,0,.28,0,.95,.56,.7); for(const x of [-.34,.34]) add(GEO.box,band,x,.28,0,.1,.6,.74);
    add(GEO.box,band,0,.05,0,.99,.08,.74);
    const lid=new THREE.Group(); lid.position.set(0,.56,-.35); g.add(lid); u.lid=lid;
    const l1=new THREE.Mesh(GEO.cyl,wood); l1.rotation.z=Math.PI/2; l1.scale.set(.35,.95,.35); l1.position.set(0,0,.35); l1.castShadow=true; lid.add(l1);
    for(const x of [-.34,.34]){ const b=new THREE.Mesh(GEO.cyl,band); b.rotation.z=Math.PI/2; b.scale.set(.37,.1,.37); b.position.set(x,0,.35); lid.add(b); }
    u.coins=[]; for(let k=0;k<7;k++){ const c=add(GEO.sphere0,gold,(Math.random()-.5)*.6,.58+Math.random()*.15,(Math.random()-.5)*.4,.12,.07,.12); u.coins.push(c); }
    u.glow=add(GEO.sphere,new THREE.MeshBasicMaterial({color:0xffd45a,transparent:true,opacity:.28,depthWrite:false,blending:THREE.AdditiveBlending}),0,.75,0,.55,.4,.45); u.glow.castShadow=false;
    add(GEO.box,gold,0,.45,.36,.12,.16,.04);
    const pole=add(GEO.cyl,M('#cbd5e1'),.4,1.0,.0,.025,1.0,.025); const fl=new THREE.Mesh(new THREE.PlaneGeometry(.55,.4),new THREE.MeshBasicMaterial({map:jollyTex(td.light),side:THREE.DoubleSide})); fl.position.set(.7,1.3,0); g.add(fl); u.flag=fl;
    add(GEO.box,M(td.col),.7,1.12,0,.55,.05,.02);
    g.userData=u; g.scale.setScalar(1.15); g.position.set(td.bx+.5,WHu*.6+.02,td.by+.5); scene.add(g); coreM.push(g);
  });
}
function syncCores(){
  TD.forEach((td,i)=>{
    const g=coreM[i]; if(!g) return; const ci=idx(td.bx,td.by); g.visible=td.coreAlive&&wallT[ci]===CORE;
    if(!g.visible) return; const t=game.t, u=g.userData, hp=hpW[ci]/BHP[CORE], hurt=(td.alert||0)>0;
    u.lid.rotation.x=-1.0+Math.sin(t*1.5+i)*.08; u.glow.material.opacity=.22+.1*Math.sin(t*3+i)+(hurt?.25:0);
    u.flag.rotation.y=Math.sin(t*3+i)*.3; u.coins.forEach((c,k)=>{ c.position.y=.58+Math.abs(Math.sin(t*2+k))*.03; c.rotation.y=t+k; });
    g.rotation.y=Math.PI*.5+Math.sin(t*.4+i)*.1; g.scale.setScalar(1.15*(.92+.08*hp));
    if(Math.random()<.04) parts.push({x:(td.bx+.5)*T+rnd(-12,12),y:(td.by+.5)*T+rnd(-8,8),z:34,vz:rnd(20,50),vx:0,vy:0,life:.9,max:.9,col:'#fde047',size:2});
  });
}

/* ---------- générateurs de ressources ---------- */
const INGOTM={bronze:M('#cd7f32',{metalness:.25,roughness:.4,emissive:'#3a2208',emissiveIntensity:.35}),silver:M('#d6dde6',{metalness:.2,roughness:.4,emissive:'#303846',emissiveIntensity:.3}),gold:M('#fbbf24',{metalness:.25,roughness:.35,emissive:'#6b4a00',emissiveIntensity:.4}),diamond:new THREE.MeshStandardMaterial({color:0x4fe3f5,emissive:0x16a6c0,emissiveIntensity:.5,flatShading:true,roughness:.15})};
function buildPads(){
  padM=[];
  for(const sp of spawners){
    const g=new THREE.Group(), col=sp.kind==='base'?TEAMS[sp.team].dark:sp.kind==='dia'?'#0e7490':'#7c4a21';
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
    else { const d=T0.diamond; s.gem.position.y=.6+Math.sin(t*2.5+sp.x)*.08; s.gem.rotation.y=t*1.6; s.gem.scale.set(.2,.3,.2).multiplyScalar(d.stock>0?1:.7); show(s.piles,Math.min(4,d.stock)); }
  }
}

/* ---------- projectiles, bombes, pièges, boucliers... ---------- */
function createProj(p){
  const g=new THREE.Group(), add=(geo,mat,x,y,z,sx,sy,sz)=>{ const m=new THREE.Mesh(geo,mat); m.position.set(x,y,z); m.scale.set(sx,sy,sz); g.add(m); return m; };
  const col=p.col||'#fff';
  switch(p.kind){
    case 'rocket': add(GEO.sphere,M('#1f2937',{metalness:.4}),0,0,0,.17,.17,.17); add(GEO.octa,new THREE.MeshBasicMaterial({color:0xffb347}),-.2,0,0,.1,.07,.07); break;
    case 'wool': add(GEO.sphere,M('#e5e7eb'),0,0,0,.15,.15,.15); for(const a of [0,2.1,4.2]) add(GEO.box,M('#a8aeb8'),0,0,0,.34,.015,.015).rotation.y=a; break;
    case 'ice': add(GEO.cone,new THREE.MeshStandardMaterial({color:0xbae6fd,emissive:0x5ab8e6,emissiveIntensity:.6,flatShading:true}),0,0,0,.07,.4,.07).rotation.z=-Math.PI/2; break;
    case 'bubble': add(GEO.sphere,new THREE.MeshStandardMaterial({color:0xbfe3ff,transparent:true,opacity:.5,roughness:.1}),0,0,0,.22,.22,.22); break;
    case 'boomerang': add(GEO.box,M('#7c4a21'),0,0,0,.05,.05,.4); add(GEO.box,M('#9ca3af',{metalness:.5}),0,0,.18,.14,.1,.2); break;
    case 'arrow': add(GEO.box,M('#e5e7eb'),0,0,0,.5,.025,.025); add(GEO.cone,M('#9ca3af'),.27,0,0,.04,.1,.04).rotation.z=-Math.PI/2; break;
    case 'flame': add(GEO.sphere,new THREE.MeshBasicMaterial({color:0xffa83c,transparent:true,opacity:.7,depthWrite:false,blending:THREE.AdditiveBlending}),0,0,0,.16,.16,.16); break;
    default: add(GEO.box,new THREE.MeshBasicMaterial({color:col}),0,0,0,.34,.06,.06);
  }
  return g;
}
function updateProjM(p,m){
  m.position.set(p.x*U,(p.z!==undefined?p.z:12)*U+.1,p.y*U); m.rotation.y=-Math.atan2(p.vy,p.vx);
  if(p.kind==='boomerang') m.rotation.x=game.t*18; if(p.kind==='wool') m.rotation.z=game.t*8;
  if(p.kind==='flame'){ const k=Math.max(.2,p.life/.32); m.scale.setScalar(1.6-k); if(Math.random()<.4) parts.push({x:p.x,y:p.y,z:12,vx:rnd(-20,20),vy:rnd(-20,20),vz:rnd(10,40),life:.25,max:.25,col:'#fb923c',size:4}); }
  if(p.kind==='rocket') { if(Math.random()<.6) parts.push({x:p.x,y:p.y,z:12,vx:rnd(-10,10),vy:rnd(-10,10),vz:rnd(5,20),life:.4,max:.4,col:'#9ca3af',size:5,smoke:true}); }
}
function createBomb(b){
  const g=new THREE.Group();
  if(b.bolt||b.shell){ const col=b.bolt?0xfde047:0xf87171; const d=new THREE.Mesh(GEO.disc,new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.3,depthWrite:false,side:THREE.DoubleSide})); d.scale.setScalar(b.bolt?1.7:1.5); d.position.y=.08; g.add(d); const r=new THREE.Mesh(GEO.ring,new THREE.MeshBasicMaterial({color:col,transparent:true,side:THREE.DoubleSide})); r.position.y=.09; g.add(r); g.userData={tele:true,d,r}; if(b.shell){ const ball=new THREE.Mesh(GEO.sphere,M('#1f2937',{metalness:.4})); ball.scale.setScalar(.22); g.add(ball); g.userData.ball=ball; } return g; }
  if(b.kind==='anchor'){ const m=M('#6b7280',{metalness:.5}); const a=new THREE.Mesh(GEO.box,m); a.scale.set(.08,.8,.08); a.position.y=.4; g.add(a); const b2=new THREE.Mesh(GEO.box,m); b2.scale.set(.6,.07,.07); b2.position.y=.7; g.add(b2); const b3=new THREE.Mesh(GEO.torus,m); b3.scale.set(.3,.3,.3); b3.position.y=.1; b3.rotation.x=Math.PI; g.add(b3); const r=new THREE.Mesh(GEO.ring,new THREE.MeshBasicMaterial({color:0x94a3b8,transparent:true,side:THREE.DoubleSide})); r.scale.setScalar(1.8); r.position.y=.08; g.add(r); g.userData={anchor:true,body:a,r}; g.children.forEach(c=>c.castShadow=true); return g; }
  const col=b.kind==='cluster'?'#166534':b.kind==='repel'?'#1d4ed8':'#8a5326';
  const body=new THREE.Mesh(GEO.cyl,new THREE.MeshStandardMaterial({color:col,flatShading:true,roughness:.7,emissive:0x000000})); body.scale.set(.2,.34,.2); body.castShadow=true; g.add(body);
  for(const y of [-.1,.1]){ const bd=new THREE.Mesh(GEO.cyl,M('#3b3f4a',{metalness:.3})); bd.scale.set(.215,.04,.215); bd.position.y=y; g.add(bd); }
  const fuse=new THREE.Mesh(GEO.cyl,M('#a16207')); fuse.scale.set(.02,.14,.02); fuse.position.y=.24; g.add(fuse);
  const sp=new THREE.Mesh(GEO.octa,new THREE.MeshBasicMaterial({color:0xfde047})); sp.scale.setScalar(.06); sp.position.y=.34; g.add(sp);
  g.userData={body,sp}; return g;
}
function updateBombM(b,m){
  const u=m.userData;
  if(u.tele){ m.position.set(b.x*U,0,b.y*U); const k=1-Math.min(1,b.fuse); u.r.scale.setScalar((b.bolt?1.7:1.5)*(1-k*.7)+.1); u.d.material.opacity=.15+.25*Math.abs(Math.sin(game.t*14)); if(u.ball){ u.ball.position.y=Math.max(0,b.fuse)*5.2+.2; } return; }
  if(u.anchor){ m.position.set(b.x*U,Math.max(0,b.fuse)*4.4,b.y*U); u.r.position.y=-Math.max(0,b.fuse)*4.4+.08; m.rotation.y=game.t*3; return; }
  m.position.set(b.x*U,(b.h||0)*U+.2,b.y*U);
  const blink=Math.floor(b.fuse*(b.fuse<.7?14:6))%2; u.body.material.emissive.setRGB(blink?.8:0,blink?.1:0,0); u.sp.position.y=.34+Math.random()*.03;
}
function createTrap(t){
  const g=new THREE.Group(), add=(geo,mat,x,y,z,sx,sy,sz)=>{ const m=new THREE.Mesh(geo,mat); m.position.set(x,y,z); m.scale.set(sx,sy,sz); m.castShadow=true; g.add(m); return m; }, u={};
  if(t.kind==='trampo'){ add(GEO.cyl,M('#6b4423'),0,.08,0,.44,.16,.44); u.top=add(GEO.cyl,M('#e8dcc0'),0,.17,0,.4,.04,.4); add(GEO.torus,M('#8a5a2b'),0,.19,0,.36,.36,.36).rotation.x=Math.PI/2; }
  else if(t.kind==='mine'){ add(GEO.sphere,M('#1f2937',{metalness:.4}),0,.2,0,.2,.2,.2); for(let k=0;k<6;k++){ const a=k*1.047; add(GEO.cone,M('#3b3f4a'),Math.cos(a)*.22,.2,Math.sin(a)*.22,.05,.12,.05).rotation.z=-Math.cos(a)*1.4; } u.led=add(GEO.sphere0,new THREE.MeshBasicMaterial({color:0xff2222}),0,.42,0,.05,.05,.05); }
  else if(t.kind==='banana'){ const b=add(GEO.torus,M('#fde047'),0,.12,0,.2,.2,.2); b.rotation.x=Math.PI/2; b.scale.set(.2,.2,.5); add(GEO.sphere0,M('#78350f'),.18,.12,0,.04,.04,.04); }
  else if(t.kind==='net'){ const nm=new THREE.MeshBasicMaterial({color:0xe5e7eb,transparent:true,opacity:.85}); for(let k=-2;k<=2;k++){ add(GEO.box,nm,k*.16,.04,0,.015,.015,.8); add(GEO.box,nm,0,.04,k*.16,.8,.015,.015); } add(GEO.torus,M('#a16207'),0,.04,0,.42,.42,.42).rotation.x=Math.PI/2; }
  else if(t.kind==='turret'){ const col=t.ice?'#7dd3fc':'#2b2f3a'; add(GEO.box,M('#6b4423'),0,.15,0,.6,.3,.55); add(GEO.box,M(TEAMS[t.team].col),0,.32,0,.62,.05,.12); u.head=new THREE.Group(); u.head.position.y=.38; g.add(u.head); const bar=new THREE.Mesh(GEO.cyl,M(col,{metalness:.4})); bar.rotation.z=Math.PI/2; bar.scale.set(.15,.7,.15); bar.position.x=.25; bar.castShadow=true; u.head.add(bar); const bl=new THREE.Mesh(GEO.sphere0,M(col,{metalness:.4})); bl.scale.set(.17,.17,.17); u.head.add(bl); u.flash=new THREE.Mesh(GEO.octa,new THREE.MeshBasicMaterial({color:t.ice?0x9be4ff:0xffd45a})); u.flash.scale.setScalar(.12); u.flash.position.x=.65; u.head.add(u.flash); for(const z of [-.3,.3]) add(GEO.cyl,M('#2b2118'),0,.12,z,.17,.06,.17).rotation.x=Math.PI/2; }
  else if(t.kind==='vortex'){ u.r=[]; for(let i=0;i<3;i++){ const r=new THREE.Mesh(GEO.torus,new THREE.MeshBasicMaterial({color:[0xbfe9ff,0x5fb6e6,0x1f6fa8][i],transparent:true,opacity:.85})); r.rotation.x=Math.PI/2; g.add(r); u.r.push(r); } u.d=new THREE.Mesh(GEO.disc,new THREE.MeshBasicMaterial({color:0x1f6fa8,transparent:true,opacity:.25,depthWrite:false,side:THREE.DoubleSide})); u.d.position.y=.05; g.add(u.d); u.core=add(GEO.sphere,new THREE.MeshBasicMaterial({color:0x06243a}),0,.4,0,.25,.25,.25); }
  else if(t.kind==='flag'){ add(GEO.cyl,M('#3b3f4a'),0,.9,0,.04,1.8,.04); jrTex=jrTex||jollyTex(); u.f=new THREE.Mesh(new THREE.PlaneGeometry(1,.7),new THREE.MeshBasicMaterial({map:jrTex,side:THREE.DoubleSide})); u.f.position.set(.5,1.5,0); g.add(u.f); u.ring=new THREE.Mesh(GEO.ring,new THREE.MeshBasicMaterial({color:0x111827,transparent:true,opacity:.55,side:THREE.DoubleSide})); u.ring.scale.setScalar(4); u.ring.position.y=.07; g.add(u.ring); }
  else if(t.kind==='kraken'){ u.tent=[]; for(let k=0;k<3;k++){ const tg=new THREE.Group(); tg.position.set(Math.cos(k*2.1)*.5,0,Math.sin(k*2.1)*.5); g.add(tg); const segs=[]; for(let s=0;s<4;s++){ const sg=new THREE.Mesh(GEO.cyl,M(k===0?'#2fb98a':'#27a37a')); sg.scale.set(.2-s*.035,.55,.2-s*.035); sg.position.y=.25+s*.5; sg.rotation.z=.15*s; sg.castShadow=true; tg.add(sg); segs.push(sg);} u.tent.push({g:tg,segs}); } u.ring=new THREE.Mesh(GEO.ring,new THREE.MeshBasicMaterial({color:0x34d399,transparent:true,opacity:.6,side:THREE.DoubleSide})); u.ring.scale.setScalar(1.9); u.ring.position.y=.07; g.add(u.ring); }
  g.userData=u; return g;
}
function updateTrapM(t,m){
  const u=m.userData, tm=game.t; m.position.set(t.x*U,0,t.y*U);
  if(t.kind==='trampo'){ u.top.position.y=.17-(t.anim||0)*.08; m.scale.y=1+(t.anim||0)*.2; }
  else if(t.kind==='mine'){ const armed=t.age>1.2; u.led.visible=armed&&Math.floor(tm*4)%2===0; }
  else if(t.kind==='turret'){ u.head.rotation.y=-t.ang; u.flash.visible=(t.muz||0)>0; }
  else if(t.kind==='vortex'){ const k=Math.min(1,t.age*3)*Math.min(1,t.t*2); u.r.forEach((r,i)=>{ const s=(.35+i*.45)*k; r.scale.set(s,s,s); r.rotation.z=tm*(4-i)+i; r.position.y=.4+i*.05; }); u.d.scale.setScalar(5*k); u.core.scale.setScalar(.25*k); }
  else if(t.kind==='flag'){ u.f.rotation.y=Math.sin(tm*4)*.3; u.ring.material.opacity=.3+.2*Math.sin(tm*3)*(t.t<2?Math.sin(tm*20):1); }
  else if(t.kind==='kraken'){
    const slam=t.slam||0, warn=t.cd<.4, rise=Math.min(1,t.age*2.5)*Math.min(1,t.t*2);
    u.tent.forEach((te,k)=>{ te.g.scale.setScalar(rise); te.g.rotation.y=k*1.3+Math.sin(tm*2+k)*.2; te.segs.forEach((sg,s)=>{ sg.rotation.z=.15*s+Math.sin(tm*3+k+s)*.18+(warn?-.5*s:0)+slam*2.2*(s+1)*.25; }); });
    u.ring.material.opacity=warn?.9:.5; u.ring.scale.setScalar(1.9*(slam>0?1.2:1));
  }
}
function createShield(s){
  const g=new THREE.Group(), col=TEAMS[s.team].col;
  const dome=new THREE.Mesh(new THREE.SphereGeometry(1,20,12,0,Math.PI*2,0,Math.PI/2),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.2,depthWrite:false,side:THREE.DoubleSide})); g.add(dome);
  const wire=new THREE.Mesh(new THREE.SphereGeometry(1,14,7,0,Math.PI*2,0,Math.PI/2),new THREE.MeshBasicMaterial({color:0xffffff,wireframe:true,transparent:true,opacity:.28})); g.add(wire);
  g.userData={dome,wire}; return g;
}
function updateShieldM(s,m){ const R=s.r*U*(.7+.3*s.a); m.position.set(s.x*U,0,s.y*U); m.scale.set(R,R*.62,R); m.userData.wire.rotation.y=game.t*.4; m.userData.dome.material.opacity=(.14+.05*Math.sin(game.t*6))*(s.t<2&&Math.floor(game.t*8)%2?.4:1); }
function createHook(h){ const g=new THREE.Group(); const l=new THREE.Mesh(GEO.cyl,M('#c9a24a')); g.add(l); const tip=new THREE.Mesh(GEO.cone,M('#9ca3af',{metalness:.5})); tip.scale.setScalar(.12); g.add(tip); g.userData={l,tip}; return g; }
function updateHookM(h,m){ const o=h.owner; const L=m.userData.l; beamBetween(L,o.x*U,.6,o.y*U,h.x*U,.6,h.y*U,.025); m.userData.tip.position.set(h.x*U,.6,h.y*U); }
function createPearl(){ const m=new THREE.Mesh(GEO.torus,new THREE.MeshStandardMaterial({color:0xfbbf24,emissive:0xb07a00,emissiveIntensity:.7,flatShading:true})); m.scale.setScalar(.2); return m; }
function createGuard(g){ return createPirate({light:TEAMS[g.team].light,col:TEAMS[g.team].col,dark:TEAMS[g.team].dark},{scale:.72,neutral:true}); }
function updateGuardM(g,m){
  const u=m.userData; m.position.set(g.x*U,0,g.y*U); m.rotation.y=-(g.ang||0);
  const mv=Math.hypot(g.vx||0,g.vy||0)>5; const sw=Math.sin(g.ph*1.4)*(mv?.75:0); u.legs[0].rotation.z=sw; u.legs[1].rotation.z=-sw; u.armL.rotation.z=-sw*.8;
  if(!u.sword){ const sd=makeHeld('sword',{sword:1,bsel:2,team:g.team}); u.anchor.add(sd); u.sword=sd; }
  const sg=(g.swing||0)>0?Math.sin((1-g.swing/.2)*Math.PI):0; u.armR.rotation.z=1.0-sg*1.5; u.armR.rotation.y=sg*.7;
  u.head.rotation.z=Math.sin(g.ph*.3)*.05; m.visible=g.t<5?Math.floor(game.t*8)%2===0:true;
}
function createCrab(c){
  const g=new THREE.Group(), add=(geo,mat,x,y,z,sx,sy,sz)=>{ const m=new THREE.Mesh(geo,mat); m.position.set(x,y,z); m.scale.set(sx,sy,sz); m.castShadow=true; g.add(m); return m; }, u={mat:M('#e5483a'),legs:[]};
  u.body=new THREE.Mesh(GEO.sphere,new THREE.MeshStandardMaterial({color:0xe5483a,flatShading:true,roughness:.7})); u.body.scale.set(.3,.17,.24); u.body.position.y=.2; u.body.castShadow=true; g.add(u.body);
  for(const z of [-1,1]){ add(GEO.sphere0,u.body.material,.28,.26,z*.2,.11,.09,.1); add(GEO.box,u.body.material,.2,.22,z*.15,.1,.03,.03); add(GEO.sphere0,M('#fff'),.18,.36,z*.07,.045,.045,.045); add(GEO.sphere0,M('#111'),.21,.36,z*.07,.02,.02,.02); for(const x of [-.12,0,.12]){ const l=add(GEO.box,u.body.material,x,.1,z*.28,.03,.12,.03); l.rotation.x=z*.5; u.legs.push(l); } }
  g.userData=u; return g;
}
function updateCrabM(c,m){ const u=m.userData; m.position.set(c.x*U,Math.abs(Math.sin(c.ph))*.06,c.y*U); m.rotation.y=-Math.atan2(c.vy,c.vx); u.legs.forEach((l,i)=>l.rotation.z=Math.sin(c.ph*2+i)*.5); const bl=c.t<2&&Math.floor(game.t*10)%2; u.body.material.emissive.setRGB(bl?.9:0,bl?.4:0,0); }

/* ---------- anneaux, faisceaux ---------- */
function syncRings(){
  let n=0;
  for(const r of rings){
    const k=r.t/r.max, rr=r.r*U*(.2+.8*Math.sqrt(k)); let m=ringPool[n];
    if(!m){ m=new THREE.Mesh(GEO.ring,new THREE.MeshBasicMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide})); const f=new THREE.Mesh(GEO.disc,new THREE.MeshBasicMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide})); m.userData.f=f; scene.add(m); scene.add(f); ringPool[n]=m; }
    const c=cparse(r.col); m.visible=true; m.position.set(r.x*U,.1,r.y*U); m.scale.setScalar(rr); m.material.color.setRGB(c[0],c[1],c[2]); m.material.opacity=1-k;
    const f=m.userData.f; f.visible=!!r.fill; if(r.fill){ f.position.copy(m.position); f.position.y=.09; f.scale.setScalar(rr); f.material.color.setRGB(c[0],c[1],c[2]); f.material.opacity=(1-k)*.5; }
    n++; if(n>=40) break;
  }
  for(let i=n;i<ringPool.length;i++){ ringPool[i].visible=false; ringPool[i].userData.f.visible=false; }
  let b=0;
  for(const bm of beams){
    const k=bm.t/.8; let m=beamPool[b]; if(!m){ m=new THREE.Mesh(GEO.cyl,new THREE.MeshBasicMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending})); scene.add(m); beamPool[b]=m; }
    const c=cparse(bm.col); m.visible=true; m.material.color.setRGB(c[0],c[1],c[2]); m.material.opacity=(1-k)*.6; const w=(.4*(1-k)+.12); m.scale.set(w,5,w); m.position.set(bm.x*U,2.5,bm.y*U); b++; if(b>=8) break;
  }
  for(let i=b;i<beamPool.length;i++) beamPool[i].visible=false;
}
function setGhost(tx,ty,kind,color){
  if(!ghostMesh){ ghostMesh=new THREE.Mesh(GEO.box,new THREE.MeshBasicMaterial({transparent:true,opacity:.5,depthWrite:false})); scene.add(ghostMesh); }
  if(tx===null){ ghostMesh.visible=false; return; }
  ghostMesh.visible=true; ghostMesh.material.color.set(color); const h=kind==='bridge'?.2:WHu; ghostMesh.scale.set(.98,h,.98); ghostMesh.position.set(tx+.5,kind==='bridge'?-.09:h/2,ty+.5);
  ghostMesh.material.opacity=.38+.14*Math.sin(game.t*8);
}

/* ---------- caméra & visée ---------- */
const rayc=new THREE.Raycaster(), planeY=new THREE.Plane(new THREE.Vector3(0,1,0),0), hitP=new THREE.Vector3(), ndc=new THREE.Vector2();
function updateCamera(dt){
  const tgt=player.alive?player:(ents.find(o=>o.alive&&!o.elim)||player);
  if(game.state==='menu'){ const a=game.t*.08; cam3.x=CX*T; cam3.y=CY*T; camera3.position.set(CX+.5+Math.cos(a)*34,20,CY+.5+Math.sin(a)*34); camera3.lookAt(CX+.5,0,CY+.5); sun.position.set(CX-14,30,CY+12); sun.target.position.set(CX,0,CY); return; }
  let lx=0,ly=0; if(player.alive&&game.state==='play'&&aim.ok){ lx=clamp((aim.x-tgt.x)*.14,-90,90); ly=clamp((aim.y-tgt.y)*.14,-90,90); }
  const k=Math.min(1,dt*6); cam3.x+=(tgt.x+lx-cam3.x)*k; cam3.y+=(tgt.y+ly-cam3.y)*k;
  const cx=cam3.x*U, cz=cam3.y*U, sh=shake*.03;
  camera3.position.set(cx+(Math.random()-.5)*sh,17.5+tgt.z*U*.25+(Math.random()-.5)*sh,cz+11.8);
  camera3.lookAt(cx,.2,cz-.2);
  sun.position.set(cx-14,30,cz+12); sun.target.position.set(cx,0,cz);
}
function updateAim(){
  if(game.state!=='play'){ aim.ok=false; return; }
  ndc.set(mouse.x/VW*2-1,-(mouse.y/VH*2-1)); rayc.setFromCamera(ndc,camera3);
  planeY.constant=-WHu; let pt=null;
  if(rayc.ray.intersectPlane(planeY,hitP)){ const tx=Math.floor(hitP.x),ty=Math.floor(hitP.z); if(wl(tx,ty)>0) pt=hitP.clone(); }
  if(!pt){ planeY.constant=0; if(rayc.ray.intersectPlane(planeY,hitP)) pt=hitP.clone(); }
  if(pt){ aim.x=pt.x*T; aim.y=pt.z*T; aim.ok=true; }
}
function w2s(x,y,z){ v3.set(x*U,(z||0)*U,y*U).project(camera3); return [(v3.x*.5+.5)*VW,(-v3.y*.5+.5)*VH,v3.z<1]; }

/* ---------- frame ---------- */
function onNewGame(){
  if(!renderer) return;
  clearDynamic(); buildWorldMeshes(); buildShip(); buildAmbient(); genProps3d(); buildCores(); buildPads(); worldSig=-1;
  if(!playerRing){ playerRing=new THREE.Mesh(GEO.ring,new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,depthWrite:false,side:THREE.DoubleSide})); scene.add(playerRing); }
  cam3.x=player.x; cam3.y=player.y;
}
const TINTK=['shirt','skin','dark','hat','band'];
function syncEnts(dt){
  for(const e of ents){
    let m=entM.get(e); if(!m){ m=createPirate(TEAMS[e.team]); scene.add(m); entM.set(e,m); }
    m.visible=e.alive&&!(e.inv>0&&Math.floor(game.t*10)%2); if(!e.alive) continue;
    const u=m.userData; let sc=1,dy=0; if(e.voidT>0){ sc=Math.max(.2,1-e.voidT/.4*.7); dy=-e.voidT*6; }
    m.position.set(e.x*U,e.z*U+dy,e.y*U); m.rotation.y=-e.ang;
    updateHeld(e,m); animatePirate(e,m,dt); setPirateTint(m,e); m.scale.multiplyScalar(sc);
    const ghost=e.cloak>0?(e===player?.4:.12):1; for(const k of TINTK){ const mt=u.mats[k]; const tr=ghost<1; if(mt.transparent!==tr){mt.transparent=tr;mt.needsUpdate=true;} mt.opacity=ghost; }
    if(e.pull){ let pm=pullM.get(e); if(!pm){ pm=new THREE.Mesh(GEO.cyl,M('#c9a24a')); scene.add(pm); pullM.set(e,pm); } beamBetween(pm,e.x*U,e.z*U+.5,e.y*U,e.pull.x*U,.5,e.pull.y*U,.02); }
  }
  for(const [e,pm] of pullM) if(!e.pull||!e.alive){ scene.remove(pm); pullM.delete(e); }
  if(player&&player.alive){ playerRing.visible=true; const gh=groundH(player)*U; playerRing.position.set(player.x*U,gh+.06,player.y*U); playerRing.scale.setScalar(.62+.05*Math.sin(game.t*5)); playerRing.material.opacity=.6+.3*Math.sin(game.t*5); playerRing.material.color.set(TEAMS[player.team].light); } else if(playerRing) playerRing.visible=false;
}
function render3d(dt){
  if(!renderer) return;
  qualityTick(dt);
  sigTick++; if(sigTick%3===0||popActive){ const sig=(popActive&&sigTick%2)?worldSig:worldSignature(); if(sig!==worldSig||(popActive&&sigTick%2===0)){ rebuildWorld(); worldSig=sig; } }
  updateSea(game.t); updateShip(); updateAmbient(dt); syncEnts(dt); syncCores(); syncPads(); syncProps();
  sync(guardM,guards,createGuard,updateGuardM); sync(chickM,chickens,createCrab,updateCrabM);
  sync(projM,projs,createProj,updateProjM); sync(bombM,bombs,createBomb,updateBombM); sync(trapM,traps,createTrap,updateTrapM);
  sync(shieldM,shields,createShield,updateShieldM); sync(hookM,hooks,createHook,updateHookM); sync(pearlM,pearls,createPearl,(p,m)=>{ m.position.set(p.x*U,.5,p.y*U); m.rotation.y=game.t*6; });
  syncRings(); fillParticles();
  updateCamera(dt); updateAim();
  renderer.render(scene,camera3);
}
