'use strict';
/* =====================  RETOURS VISUELS : STRUCTURES DE BASE + AURAS D'ÉTAT  =====================
   • chaque amélioration de base se voit en 3D sur l'île de l'équipe (phare, batterie d'artillerie, catapulte, chantier naval, radar, cloche de vigie, coffre renforcé)
   • chaque effet d'état a son habillage sur le pirate : glace (déjà là), filet, flaque collante, flammes, miroir, armure, rage, égide, bottes/rhum, parapluie, aimant */
/* ---------- structures de base ---------- */
const STRUCT=new Map(); // clé "équipe:nom" -> {g,lvl}
const SLOTS={lighthouse:[-4,-4],art:[-4,4],catapult:[-5,0],shipyard:[0,-5],radar:[4,-4],watch:[4,4],scope:[0,5]}; // sur le pourtour de l'île, pas dans la base
const STRFOOT=new Set(); // cases occupées par une structure : plus de blocs possibles
function stBox(g,col,sx,sy,sz,x,y,z,opts){ const m=new THREE.Mesh(GEO.box,M(col,opts)); m.scale.set(sx,sy,sz); m.position.set(x,y,z); m.castShadow=true; g.add(m); return m; }
function stCyl(g,col,sx,sy,sz,x,y,z,opts){ const m=new THREE.Mesh(GEO.cyl,M(col,opts)); m.scale.set(sx,sy,sz); m.position.set(x,y,z); m.castShadow=true; g.add(m); return m; }
function stFlag(g,td,x,y,z){ const p=stCyl(g,'#5b4326',.04,.7,.04,x,y+.35,z); const f=stBox(g,td.col,.34,.2,.03,x+.19,y+.62,z); g.userData.flags=(g.userData.flags||[]); g.userData.flags.push(f); return f; }
function buildStruct(key,lvl,td){
  const g=new THREE.Group(); g.userData={};
  if(key==='watch'){ const lh=mkLighthouse(); lh.scale.setScalar(.9); g.add(lh); g.userData.lamp=lh; // phare avec cloche d'alerte
    const pv=new THREE.Group(); pv.position.set(.62,2.55,0); g.add(pv); g.userData.bell=pv; stBox(g,'#5b3a1a',.5,.07,.12,.4,2.78,0); const bell=new THREE.Mesh(GEO.cone,M('#fbbf24',{metalness:.7,roughness:.3})); bell.scale.set(.34,.4,.34); bell.position.y=-.22; bell.rotation.x=Math.PI; pv.add(bell); stFlag(g,td,0,3.25,0); }
  else if(key==='art'){ stBox(g,'#6b4423',1.7,.22,1.5,0,.11,0); stBox(g,td.col,1.74,.05,1.54,0,.24,0);
    const gun=new THREE.Group(); gun.position.set(0,.5,0); g.add(gun); g.userData.gun=gun;
    for(let k=0;k<lvl;k++){ const z=(k-(lvl-1)/2)*.5; const b=stCyl(gun,'#374151',.2,1.5,.2,.5,0,z,{metalness:.6,roughness:.4}); b.rotation.z=-1.05; const mo=stCyl(gun,'#111827',.14,.1,.14,1.0,.62,z); mo.rotation.z=-1.05; }
    for(const z of [-.7,.7]){ const w=new THREE.Mesh(GEO.torus,M('#6b4423')); w.scale.setScalar(.34); w.position.set(-.1,.3,z); g.add(w); }
    for(let k=0;k<lvl+1;k++){ const s=new THREE.Mesh(GEO.sphere,M('#111827')); s.scale.setScalar(.2); s.position.set(-.7,.3+(k>2?.2:0),-.5+k*.3); g.add(s); } stFlag(g,td,.7,.2,.65); }
  else if(key==='catapult'){ stBox(g,'#7c4a21',1.5,.18,1.1,0,.09,0); for(const z of [-.55,.55]){ stBox(g,'#5b3a1a',.12,.9,.12,-.1,.55,z); stBox(g,'#5b3a1a',.9,.1,.1,.0,.22,z); const w=new THREE.Mesh(GEO.torus,M('#374151')); w.scale.setScalar(.3); w.position.set(.4,.22,z*1.1); g.add(w); }
    const arm=new THREE.Group(); arm.position.set(-.1,.95,0); g.add(arm); g.userData.arm=arm; stBox(arm,'#8a5a2b',1.8,.1,.12,.6,0,0); const bk=stBox(arm,'#5b3a1a',.34,.14,.34,1.45,.04,0); const st=new THREE.Mesh(GEO.sphere,M('#a8a29e')); st.scale.setScalar(.2); st.position.set(1.45,.2,0); arm.add(st); g.userData.stone=st; stFlag(g,td,-.6,.2,.7); }
  else if(key==='shipyard'){ stBox(g,'#9a6b3a',2.6,.1,1.1,0,.06,0); for(let k=0;k<5;k++) stBox(g,'#7c4a21',.08,.14,1.1,-1.1+k*.55,.1,0);
    for(let k=0;k<lvl;k++){ const z=(k-(lvl-1)/2)*.9; const hull=stBox(g,'#7c4a21',1.5,.28,.55,0,.35,z); hull.rotation.z=.04; stBox(g,'#5b3a1a',1.3,.05,.5,0,.52,z); stCyl(g,'#5b4326',.05,1.0,.05,0,.95,z); stBox(g,td.col,.5,.34,.03,.28,1.1,z); }
    stBox(g,'#5b4326',.1,1.1,.1,-1.2,.6,-.5); stBox(g,'#5b4326',.7,.08,.08,-.9,1.15,-.5); const hook=stCyl(g,'#9ca3af',.03,.4,.03,-.6,.9,-.5); g.userData.hook=hook; }
  else if(key==='radar'){ // totem de vigie : pierre, 3 visages sculptés aux yeux lumineux, ailes de plumes, oiseau sacré au sommet
    stCyl(g,'#7b7f88',.46,.14,.46,0,.07,0); stBox(g,'#6b4423',.52,.52,.52,0,.4,0); stBox(g,'#8a5a2b',.46,.46,.46,0,.9,0); stBox(g,'#a8743c',.4,.4,.4,0,1.33,0);
    for(const [y,w] of [[.4,.52],[.9,.46],[1.33,.4]]){ stBox(g,'#3b2a1a',w*.7,.07,.03,0,y-.1,w/2+.005); stBox(g,'#e8d6a0',.12,.05,.03,0,y-.18,w/2+.01); }
    for(const s2 of [-1,1]){ for(const [y,c] of [[.95,'#ef4444'],[.88,'#fbbf24'],[.81,'#38bdf8']]) stBox(g,c,.34,.07,.04,s2*.38,y,0,0,0,s2*.35); }
    const head=new THREE.Group(); head.position.set(0,1.62,0); g.add(head); g.userData.dish=head;
    stBox(head,'#ef4444',.3,.18,.3,0,.09,0); stBox(head,'#fbbf24',.1,.1,.2,.18,.08,0); stBox(head,'#38bdf8',.34,.05,.1,0,.2,0); stBox(head,'#ef4444',.08,.16,.05,-.17,.22,0,0,0,.4);
    const eyes=[]; for(const z of [-1,1]) for(const [y,w] of [[.4,.52],[.9,.46],[1.33,.4]]){ const e=new THREE.Mesh(GEO.box,new THREE.MeshBasicMaterial({color:0x4ade80})); e.scale.set(.07,.07,.03); e.position.set(z*.1,y-.01,w/2+.015); g.add(e); eyes.push(e); } g.userData.eyes=eyes; g.userData.tip=eyes[0]; }
  else if(key==='scope'){ // observatoire : plateforme, trépied et grande longue-vue de cuivre
    stBox(g,'#8a5a2b',1.6,.14,1.6,0,.07,0); stBox(g,'#a8743c',1.5,.04,1.5,0,.16,0); for(const [x,z] of [[-.7,-.7],[.7,-.7],[-.7,.7],[.7,.7]]) stBox(g,'#5b3a1a',.1,.32,.1,x,.3,z);
    for(const s2 of [[.35,0],[-.2,.3],[-.2,-.3]]) stCyl(g,'#4b2e14',.035,1.0,.035,s2[0],.7,s2[1],{},0,0,0).rotation.set(s2[1]*.9,0,-s2[0]*.9);
    const tel=new THREE.Group(); tel.position.set(0,1.18,0); g.add(tel); g.userData.tel=tel; const br={metalness:.7,roughness:.3};
    const tb=stCyl(tel,'#b87333',.12,1.5,.12,.2,0,0,br); tb.rotation.z=Math.PI/2+.25; stCyl(tel,'#7c4a21',.14,.5,.14,-.25,-.04,0,{}).rotation.z=Math.PI/2+.25; const lens=stCyl(tel,'#bfe9ff',.1,.04,.1,.97,.24,0,{emissive:0x3a7fa8,emissiveIntensity:.5}); lens.rotation.z=Math.PI/2+.25;
    stCyl(tel,'#d6a43c',.16,.06,.16,.88,.22,0,br).rotation.z=Math.PI/2+.25; stBox(g,'#e8d6a0',.5,.02,.34,.5,.19,.4,{}); stFlag(g,td,-.65,.2,.6); }
  else if(key==='lighthouse'){ // tour de guet en bois : plateforme à 5,5 blocs, accessible par E
    for(const [x,z] of [[-.62,-.62],[.62,-.62],[-.62,.62],[.62,.62]]) stBox(g,'#7c4a21',.14,5.6,.14,x,2.8,z);
    for(const y of [1.6,3.4]) for(const [sx,sz,w,d] of [[0,-.62,1.3,.07],[0,.62,1.3,.07],[-.62,0,.07,1.3],[.62,0,.07,1.3]]) stBox(g,'#6b4423',w,.08,d,sx,y,sz);
    for(const s of [-1,1]){ const br=stBox(g,'#6b4423',.07,2.0,.07,s*.3,2.5,-.62); br.rotation.z=s*.55; }
    stBox(g,'#5b3a1a',1.7,.14,1.7,0,5.55,0); stBox(g,'#8a5a2b',1.5,.05,1.5,0,5.64,0);
    for(const [sx,sz,w,d] of [[0,-.78,1.7,.07],[0,.78,1.7,.07],[-.78,0,.07,1.7],[.78,0,.07,1.7]]) stBox(g,'#7c4a21',w,.1,d,sx,6.05,sz);
    for(const [x,z] of [[-.78,-.78],[.78,-.78],[-.78,.78],[.78,.78]]) stBox(g,'#7c4a21',.1,.55,.1,x,5.9,z);
    const lad=stBox(g,'#8a5a2b',.12,5.6,.06,.2,2.8,.7); for(let i=0;i<9;i++) stBox(g,'#8a5a2b',.34,.05,.06,.2,.5+i*.6,.72);
    stFlag(g,td,0,5.65,0); }
  return g;
}
function updStruct(key,g,td,t,lvl){
  const u=g.userData;
  if(u.lamp&&u.lamp.userData&&u.lamp.userData.pv){ const L=u.lamp.userData, night=typeof WX!=='undefined'?1-WX.dayK:0; L.pv.rotation.y=t*1.1; L.beam.material.opacity=Math.max(0,night-.1)*.18; L.lamp.material.color.set(night>.2?0xfff2b0:0xcdbb7a); if(L.vane) L.vane.rotation.y=t*.6; }
  if(u.gun){ const o=OB(td), a=Math.atan2(CY*T-o.by*T,CX*T-o.bx*T); u.gun.rotation.y=-a+Math.sin(t*.4)*.05; }
  if(u.arm){ const cd=(td.ent.pcd&&td.ent.pcd.catapult)||0; u.arm.rotation.z=cd>.2?-.35+Math.min(1,cd/6)*.0:.55; u.arm.rotation.z=cd>0?-.3:.55+Math.sin(t*1.2)*.03; if(u.stone) u.stone.visible=cd<=0; }
  if(u.dish) u.dish.rotation.y=Math.sin(t*.8)*.6; if(u.eyes){ const k=.6+.4*Math.sin(t*3); for(const e of u.eyes) e.scale.set(.07*k+.03,.07*k+.03,.03); }
  if(u.tel){ const a=Math.atan2(CY*T-OB(td).by*T,CX*T-OB(td).bx*T); u.tel.rotation.y=-a+Math.sin(t*.5)*.2; }
  if(u.bell){ const al=(td.alert>0||td.intr>0); u.bell.rotation.z=Math.sin(t*(al?9:1.6))*(al?.5:.12); }
  if(u.hook) u.hook.position.y=.9+Math.sin(t*1.5)*.15;
  if(u.flags) for(const f of u.flags) f.rotation.y=Math.sin(t*3+f.position.x)*.35;
}
const OB=td=>td.ob||(td.ob={bx:td.bx,by:td.by,dir:td.dir.slice()}); // emplacement d'origine du coffre : les structures n'en bougent pas
function structTile(td,key){ const o=OB(td), d=o.dir, p=[-d[1],d[0]], s=SLOTS[key]; return [o.bx+d[0]*s[0]+p[0]*s[1], o.by+d[1]*s[0]+p[1]*s[1]]; }
function structClear(td,key){ const [cx,cy]=structTile(td,key); let n=0;
  for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){ const x=cx+dx,y=cy+dy; if(!inb(x,y)) continue; const i=idx(x,y);
    if(wallT[i]&&wallT[i]!==CORE){ chunks((x+.5)*T,(y+.5)*T,blockColor(wallT[i],Math.max(0,ownW[i]))[0],6); wallT[i]=0; hpW[i]=0; ownW[i]=-1; n++; }
    if(floorT[i]>=2){ floorT[i]=1; hpF[i]=0; ownF[i]=-1; region[i]=td.id; n++; } else if(floorT[i]===0){ floorT[i]=1; region[i]=td.id; hpF[i]=0; ownF[i]=-1; } }
  ring((cx+.5)*T,(cy+.5)*T,T*2,'#fde68a',.7,true); burst((cx+.5)*T,(cy+.5)*T,'#fde68a',16,180,.6,4); sfx('place',(cx+.5)*T,(cy+.5)*T); shake=Math.max(shake,5); if(n&&td.id===player.team) msg(`Les travaux détruisent ${n} bloc(s) à l'emplacement de la structure.`,'#fde68a'); }
function structSync(){
  if(!renderer||!scene||!TD.length) return; const t=game.t; STRFOOT.clear();
  for(const td of TD){ const u=td.ent&&td.ent.up; if(!u) continue; const o0=OB(td), d=o0.dir, p=[-d[1],d[0]];
    const lv={lighthouse:u.lighthouse|0,art:u.art|0,catapult:u.catapult|0,shipyard:u.shipyard|0,radar:u.radar|0,watch:u.watch|0,scope:u.scope|0};
    for(const key in SLOTS){ const k=td.id+':'+key, L=lv[key], cur=STRUCT.get(k), show=L>0&&td.coreAlive&&game.state!=='menu';
      if(cur&&(!show||cur.lvl!==L)){ scene.remove(cur.g); STRUCT.delete(k); }
      if(show&&!STRUCT.get(k)){ const g=buildStruct(key,L,td); scene.add(g); STRUCT.set(k,{g,lvl:L}); g.scale.setScalar(.01); g.userData.born=t; if(!NETCLIENT) structClear(td,key); }
      const e=STRUCT.get(k); if(!e) continue; { const [fx,fy]=structTile(td,key); for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++) if(inb(fx+dx,fy+dy)) STRFOOT.add(idx(fx+dx,fy+dy)); } const s=SLOTS[key], tx=o0.bx+d[0]*s[0]+p[0]*s[1]+.5, ty=o0.by+d[1]*s[0]+p[1]*s[1]+.5;
      e.g.position.set(tx,.07,ty); e.g.rotation.y=-Math.atan2(d[1],d[0])+Math.PI/2*(key==='lighthouse'?0:1); const age=t-(e.g.userData.born||0); e.g.scale.setScalar(Math.min(1,.01+age*3)*(key==='lighthouse'?1:1)); updStruct(key,e.g,td,t,L); } }
  for(const [k,e] of STRUCT){ const id=+k.split(':')[0]; if(!TD[id]){ scene.remove(e.g); STRUCT.delete(k); } }
}
/* coffre renforcé : coins de métal qui se multiplient avec le niveau */
const COREARM=new Map();
function coreArmorSync(){ if(!renderer||!scene) return;
  for(const td of TD){ const lv=td.ent.up.core|0; const cur=COREARM.get(td.id); if(cur&&(cur.lvl!==lv||!td.coreAlive)){ scene.remove(cur.g); COREARM.delete(td.id); }
    if(lv>0&&td.coreAlive&&!COREARM.get(td.id)){ const g=new THREE.Group(); const col=['#9ca3af','#fbbf24','#e5e7eb'][lv-1]||'#9ca3af'; for(const [x,z] of [[-.42,-.34],[.42,-.34],[-.42,.34],[.42,.34]]){ const b=new THREE.Mesh(GEO.box,M(col,{metalness:.8,roughness:.25})); b.scale.set(.16,.5,.16); b.position.set(x,.3,z); g.add(b); }
      if(lv>=2){ const br=new THREE.Mesh(GEO.box,M(col,{metalness:.8,roughness:.25})); br.scale.set(1.0,.1,.84); br.position.y=.28; g.add(br); } if(lv>=3){ const cr=new THREE.Mesh(GEO.octa,new THREE.MeshBasicMaterial({color:0x67e8f9})); cr.scale.setScalar(.18); cr.position.y=.72; g.add(cr); g.userData.cr=cr; }
      g.position.set(td.bx+.5,.07,td.by+.5); scene.add(g); COREARM.set(td.id,{g,lvl:lv}); }
    const c=COREARM.get(td.id); if(c&&c.g.userData.cr) c.g.userData.cr.rotation.y=game.t*2; } }
const _ngS=newGame; newGame=function(){ _ngS(); for(const td of TD) td.ob={bx:td.bx,by:td.by,dir:td.dir.slice()}; };
{ const _oc=onNewGame; onNewGame=function(){ for(const [,e] of STRUCT) scene&&scene.remove(e.g); STRUCT.clear(); for(const [,e] of COREARM) scene&&scene.remove(e.g); COREARM.clear(); _oc(); };
  const _r=render3d; render3d=function(dt){ _r(dt); if(game.state==='menu'){ if(STRUCT.size||COREARM.size){ for(const [,e] of STRUCT) scene.remove(e.g); STRUCT.clear(); for(const [,e] of COREARM) scene.remove(e.g); COREARM.clear(); } return; } structSync(); coreArmorSync(); };
  // réseau : niveaux d'amélioration des autres équipes
  const _nc=netCommon; netCommon=function(){ const c=_nc(); c.tu=TD.map(t=>{ const u=t.ent.up; return [u.lighthouse|0,u.art|0,u.catapult|0,u.shipyard|0,u.radar|0,u.watch|0,u.core|0,u.scope|0]; }); return c; };
  const _na=netApplySnap; netApplySnap=function(m){ _na(m); if(m.tu) m.tu.forEach((a,i)=>{ const td=TD[i]; if(!td) return; const u=td.ent.up; u.lighthouse=a[0]; u.art=a[1]; u.catapult=a[2]; u.shipyard=a[3]; u.radar=a[4]; u.watch=a[5]; u.scope=a[7]|0; if(td.ent!==player) u.core=a[6]; }); }; }
/* ---------- auras d'état sur les pirates ---------- */
function auraBuild(m){
  const g=new THREE.Group(); m.add(g); const A={g}; const bm=(c,o)=>new THREE.MeshBasicMaterial(Object.assign({color:c,transparent:true,opacity:.5,depthWrite:false},o||{}));
  A.root=new THREE.Mesh(GEO.box,bm(0xe5e7eb,{wireframe:true,opacity:.95})); A.root.scale.set(1.3,2.05,1.3); A.root.position.y=.92; g.add(A.root);
  A.slow=new THREE.Mesh(GEO.disc,bm(0x38bdf8,{opacity:.55,side:THREE.DoubleSide})); A.slow.scale.setScalar(1.15); A.slow.position.y=.03; g.add(A.slow);
  A.burn=[]; for(let i=0;i<4;i++){ const c=new THREE.Mesh(GEO.cone,bm(i%2?0xfde047:0xfb923c,{opacity:.85})); c.scale.set(.3,.8,.3); c.position.set(Math.cos(i*1.57)*.5,.55,Math.sin(i*1.57)*.5); g.add(c); A.burn.push(c); }
  A.mirror=new THREE.Mesh(GEO.sphere,new THREE.MeshStandardMaterial({color:0xe2e8f0,metalness:.95,roughness:.08,transparent:true,opacity:.42})); A.mirror.scale.set(1.35,1.55,1.35); A.mirror.position.y=.9; g.add(A.mirror);
  A.plate=new THREE.Mesh(GEO.box,new THREE.MeshStandardMaterial({color:0x94a3b8,metalness:.85,roughness:.3,transparent:true,opacity:.5})); A.plate.scale.set(1.2,1.75,1.05); A.plate.position.y=.9; g.add(A.plate);
  A.aegis=new THREE.Mesh(GEO.sphere,bm(0xfde047,{opacity:.3})); A.aegis.scale.set(1.5,1.7,1.5); A.aegis.position.y=.9; g.add(A.aegis);
  A.rage=new THREE.Mesh(GEO.sphere,bm(0xef4444,{opacity:.22})); A.rage.scale.set(1.45,1.7,1.45); A.rage.position.y=.9; g.add(A.rage);
  A.haste=new THREE.Mesh(GEO.ring,bm(0x38bdf8,{opacity:.8,side:THREE.DoubleSide})); A.haste.scale.setScalar(1.1); A.haste.position.y=.06; g.add(A.haste);
  A.spring=new THREE.Mesh(GEO.ring,bm(0x4ade80,{opacity:.8,side:THREE.DoubleSide})); A.spring.scale.setScalar(.8); A.spring.position.y=.1; g.add(A.spring);
  A.magnet=new THREE.Mesh(GEO.torus,bm(0xf87171,{opacity:.7})); A.magnet.scale.setScalar(.9); A.magnet.rotation.x=Math.PI/2; A.magnet.position.y=.9; g.add(A.magnet);
  A.glide=new THREE.Group(); { const cn=new THREE.Mesh(GEO.cone,new THREE.MeshStandardMaterial({color:0x60a5fa,flatShading:true,side:THREE.DoubleSide})); cn.scale.set(1.9,.7,1.9); cn.position.y=2.9; A.glide.add(cn); const st=new THREE.Mesh(GEO.cyl,M('#5b4326')); st.scale.set(.05,1.4,.05); st.position.y=2.2; A.glide.add(st); g.add(A.glide); }
  for(const k in A) if(k!=='g'){ const o=A[k]; if(Array.isArray(o)) o.forEach(q=>q.visible=false); else o.visible=false; }
  return A;
}
{ const _a=animatePirate;
  animatePirate=function(e,m,dt){ _a(e,m,dt); const u=m.userData; if(!u.aur){ if(!(e.root>0||e.slow>0||e.burn>0||e.mirror>0||e.plate>0||e.aegis>0||e.rage>0||e.haste>0||e.springT>0||e.magnet>0||(e.glide>0&&e.z>2))) return; u.aur=auraBuild(m); } const A=u.aur, t=game.t;
    A.root.visible=e.root>0&&!(e.frozen>0); A.slow.visible=e.slow>0&&!(e.frozen>0); if(A.slow.visible) A.slow.material.opacity=.4+.2*Math.sin(t*5);
    const b=e.burn>0; A.burn.forEach((c,i)=>{ c.visible=b; if(b){ c.scale.set(.3,.6+.4*Math.abs(Math.sin(t*9+i*2)),.3); c.position.y=.5+.12*Math.sin(t*11+i); } });
    A.mirror.visible=e.mirror>0; if(A.mirror.visible) A.mirror.material.opacity=.3+.18*Math.sin(t*6);
    A.plate.visible=e.plate>0; A.aegis.visible=e.aegis>0; if(A.aegis.visible) A.aegis.scale.setScalar(1.5+.06*Math.sin(t*5));
    A.rage.visible=e.rage>0; if(A.rage.visible) A.rage.material.opacity=.15+.12*Math.sin(t*10);
    A.haste.visible=e.haste>0; if(A.haste.visible) A.haste.rotation.z=t*4; A.spring.visible=e.springT>0; if(A.spring.visible){ A.spring.rotation.z=-t*3; A.spring.position.y=.1+.15*Math.abs(Math.sin(t*5)); }
    A.magnet.visible=e.magnet>0; if(A.magnet.visible){ A.magnet.scale.setScalar(.9+.25*Math.abs(Math.sin(t*4))); A.magnet.rotation.z=t*3; }
    A.glide.visible=e.glide>0&&e.z>2; if(A.glide.visible) A.glide.rotation.y=t*.8;
  };
}
/* ---------- utilisation : debout sur la structure, touche E (la boutique n'est pas disponible en même temps) ---------- */
const CAT={on:false};
function structNear(e){ if(!e||!e.alive||e.riding||!TD[e.team]) return null; const td=TD[e.team]; if(typeof EG!=='undefined'&&EG.arena) return null;
  for(const key of ['art','catapult','scope']){ if(!((e.up[key]|0)>0)) continue; const [x,y]=structTile(td,key); if(Math.hypot((x+.5)*T-e.x,(y+.5)*T-e.y)<2.2*T) return key; } return null; }
function useStruct(e,key){
  if(key==='art'){ if(e===player&&!NETCLIENT){ if(ART.on){ ART.on=false; return true; } return abilityArt(e); } return abilityArt(e,e.inp?e.inp.wx:e.x,e.inp?e.inp.wy:e.y); }
  if(key==='catapult'){ if(e===player&&!NETCLIENT){ CAT.on=!CAT.on; if(CAT.on) msg('🪨 Catapulte : vise et clique pour lancer · E : descendre','#d6d3d1'); return true; } return abilityCat(e,e.inp?e.inp.wx:e.x,e.inp?e.inp.wy:e.y); }
  return false; }
{ const _bi=boatInteract;
  boatInteract=function(e){ if(e===player&&(ART.on||CAT.on)){ ART.on=false; CAT.on=false; return true; } const k=structNear(e); if(k) return useStruct(e,k); return _bi(e); };
  const _ab=actBoat; actBoat=function(){ if(NETCLIENT&&player&&player.alive&&structNear(player)){ netSend({t:'act',a:'struct',k:structNear(player),x:Math.round(aim.x),y:Math.round(aim.y)}); return true; } return _ab(); };
  const _nh=netHostData; netHostData=function(team,m){ if(m&&m.t==='act'&&m.a==='struct'){ const e=ents.find(o=>o.remote&&o.team===team); if(e&&e.alive&&NET.started&&structNear(e)===m.k) useStruct(e,m.k); return; } _nh(team,m); };
  const _ce=controlEnt; controlEnt=function(e,dt,inp){ if(e===player&&CAT.on){ const k=structNear(e); if(!k||k!=='catapult'||!e.alive||e.frozen>0) CAT.on=false; else { e.ix=e.iy=0; e.held='sword'; if(inp.clicked) abilityCat(e,inp.wx,inp.wy); return; } } _ce(e,dt,inp); };
  addEventListener('keydown',ev=>{ if(ev.key==='Escape') CAT.on=false; });
  const _dh=drawHud;
  drawHud=function(){ _dh(); if(game.state!=='play'||!ctx||!player||!player.alive||shopOpen||(typeof SCOPE!=='undefined'&&SCOPE.on)) return; const k=structNear(player); if(!k&&!ART.on&&!CAT.on) return;
    const touch=typeof TOUCH!=='undefined'&&TOUCH.on, cd=k==='art'?(player.pcd.artillery||0):(player.pcd.catapult||0);
    const txt=ART.on?'':CAT.on?`🪨 Catapulte : clic pour lancer ${cd>0?'(recharge '+Math.ceil(cd)+' s)':''} · E : descendre`:`${touch?'🛒':'[E]'}  Utiliser ${k==='art'?'l\'artillerie 🎯':k==='scope'?'l\'observatoire 🔭':k==='lighthouse'?(player.tower?'la tour : redescendre 🗼':'la tour de guet : monter 🗼'):'la catapulte 🪨'}${cd>0?' ('+Math.ceil(cd)+' s)':''}`;
    if(!txt) return; ctx.save(); ctx.setTransform(DPR,0,0,DPR,0,0); const pp=1+.03*Math.sin(game.t*5), w=Math.max(260,ctx.measureText(txt).width+40); ctx.translate(VW/2,VH-(touch?96:150)); ctx.scale(pp,pp); panel(-w/2,-15,w,30,15,'#fdba74'); ctx.fillStyle='#fdba74'; ctx.font='bold 15px '+FONT; ctx.textAlign='center'; ctx.fillText(txt,0,5); ctx.restore(); };
  // pas de blocs sur l'emplacement d'une structure
  const _pt=placeTarget; placeTarget=function(e,wx,wy){ const r=_pt(e,wx,wy); if(r&&STRFOOT.has(idx(r[0],r[1]))) return null; return r; };
}

/* ---------- observatoire : vue libre sur toute la carte + zoom (E sur la structure) ---------- */
const SCOPE={on:false,cx:0,cy:0,h:18};
function scopeToggle(e){ if(SCOPE.on){ SCOPE.on=false; return true; } SCOPE.on=true; SCOPE.cx=e.x; SCOPE.cy=e.y; SCOPE.h=18; msg('🔭 Observatoire : ZQSD déplace la vue · molette : zoom · E ou Échap : revenir','#bae6fd'); return true; }
{ const _us=useStruct; useStruct=function(e,key){ if(key==='scope'&&e===player) return scopeToggle(e); if(key==='scope') return false; return _us(e,key); };
  const _ab=actBoat; actBoat=function(){ if(player&&player.alive&&NETCLIENT&&structNear(player)==='scope'){ scopeToggle(player); return true; } return _ab(); };
  const _bi=boatInteract; boatInteract=function(e){ if(e===player&&SCOPE.on){ SCOPE.on=false; return true; } return _bi(e); };
  addEventListener('keydown',ev=>{ if(ev.key==='Escape') SCOPE.on=false; });
  { const ui=document.getElementById('ui'); ui.addEventListener('wheel',ev=>{ if(!SCOPE.on) return; ev.preventDefault(); ev.stopImmediatePropagation(); SCOPE.h=clamp(SCOPE.h*(ev.deltaY>0?1.12:.89),3.5,95); },{capture:true,passive:false}); }
  const _ce=controlEnt; controlEnt=function(e,dt,inp){ if(e===player&&SCOPE.on){ if(!e.alive||e.frozen>0||structNear(e)!=='scope'){ SCOPE.on=false; } else { e.ix=e.iy=0; e.held='sword'; return; } } _ce(e,dt,inp); };
  const _nl=netLocalInput; netLocalInput=function(){ if(SCOPE.on) return {ix:0,iy:0}; return _nl(); };
  const _cam=updateCamera;
  updateCamera=function(dt){ _cam(dt); if(!SCOPE.on||game.state!=='play'||!player) return;
    if(!player.alive||structNear(player)!=='scope'&&!NETCLIENT){ SCOPE.on=false; return; }
    const up=keys.KeyW||keys['k:z']||keys.ArrowUp, dn=keys.KeyS||keys['k:s']||keys.ArrowDown, lf=keys.KeyA||keys['k:q']||keys.ArrowLeft, rt=keys.KeyD||keys['k:d']||keys.ArrowRight;
    let ix=(rt?1:0)-(lf?1:0), iy=(dn?1:0)-(up?1:0); if(typeof TOUCH!=='undefined'&&TOUCH.on&&!ix&&!iy){ ix=TOUCH.ix; iy=TOUCH.iy; } [ix,iy]=camRelInput(ix,iy);
    const sp=SCOPE.h*34*dt; SCOPE.cx=clamp(SCOPE.cx+ix*sp,0,W*T); SCOPE.cy=clamp(SCOPE.cy+iy*sp,0,H*T); cam3.x=SCOPE.cx; cam3.y=SCOPE.cy;
    const cx=cam3.x*U, cz=cam3.y*U, back=SCOPE.h*.4; camera3.position.set(cx+Math.sin(CAMYAW)*back,SCOPE.h,cz+Math.cos(CAMYAW)*back); camera3.lookAt(cx,0,cz); };
  const _dh=drawHud;
  drawHud=function(){ _dh(); if(!SCOPE.on||!ctx) return; ctx.save(); ctx.setTransform(DPR,0,0,DPR,0,0);
    const g=ctx.createRadialGradient(VW/2,VH/2,Math.min(VW,VH)*.38,VW/2,VH/2,Math.max(VW,VH)*.75); g.addColorStop(0,'rgba(0,0,0,0)'); g.addColorStop(1,'rgba(0,10,30,.55)'); ctx.fillStyle=g; ctx.fillRect(0,0,VW,VH);
    ctx.strokeStyle='rgba(186,230,253,.6)'; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(VW/2,VH/2,16,0,6.283); ctx.moveTo(VW/2-30,VH/2); ctx.lineTo(VW/2-8,VH/2); ctx.moveTo(VW/2+8,VH/2); ctx.lineTo(VW/2+30,VH/2); ctx.moveTo(VW/2,VH/2-30); ctx.lineTo(VW/2,VH/2-8); ctx.moveTo(VW/2,VH/2+8); ctx.lineTo(VW/2,VH/2+30); ctx.stroke();
    ctx.textAlign='center'; ctx.font='bold 14px '+FONT; ctx.lineWidth=4; ctx.strokeStyle='rgba(0,20,40,.9)'; const t=`🔭 Observatoire · zoom ×${(18/SCOPE.h).toFixed(1)} · ZQSD : déplacer · molette : zoom · E : revenir`; ctx.strokeText(t,VW/2,VH-130); ctx.fillStyle='#bae6fd'; ctx.fillText(t,VW/2,VH-130); ctx.restore(); };
}
