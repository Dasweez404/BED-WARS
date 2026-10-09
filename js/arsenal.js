'use strict';
/* =====================  NOUVEAUX TYPES D'ÉPÉES + FUSÉE TÉLÉGUIDÉE  ===================== */
Object.assign(game.opts,{rocket:0});
/* ---------- épées spéciales (armes de mêlée achetables, avec leur effet) ---------- */
const SW2={
  rapier:{n:'Rapière de duelliste',ico:'🤺',col:'#e2e8f0',cost:{silver:16},cd:.24,dmg:3.4,reach:2.7,cone:.82,lunge:300,d:'Très rapide : attaques en fente qui te propulsent vers l\'avant. Touche en ligne droite, pas de dégâts de zone.'},
  axe:{n:'Hache de guerre',ico:'🪓',col:'#94a3b8',cost:{silver:24},cd:.95,dmg:10,reach:2.15,cone:-1,wall:9,kb:520,d:'Lente mais dévastatrice : frappe tout autour de toi, repousse fort et brise les murs adverses.'},
  frost:{n:'Lame de givre',ico:'❄️',col:'#7dd3fc',cost:{gold:3},cd:.5,dmg:5,reach:2,cone:.3,slow:2.6,freeze:.22,d:'Ralentit les ennemis touchés et peut les geler un instant.'},
  flameblade:{n:'Lame ardente',ico:'🔥',col:'#fb923c',cost:{gold:3},cd:.5,dmg:4.8,reach:2,cone:.3,burn:3.6,d:'Enflamme les ennemis touchés : brûlure pendant plusieurs secondes.'},
  blood:{n:'Sabre sanglant',ico:'🧛',col:'#f87171',cost:{gold:4},cd:.5,dmg:5.2,reach:2,cone:.3,leech:.4,d:'Te rend 40 % des dégâts infligés en PV.'},
  spear:{n:'Lance d\'abordage',ico:'🦯',col:'#fde68a',cost:{silver:22},cd:.62,dmg:6.6,reach:3.6,line:true,kb:380,d:'Allonge énorme : transperce tous les ennemis alignés devant toi.'},
  storm:{n:'Katana-tempête',ico:'⚡',col:'#a78bfa',cost:{gold:5},cd:.44,dmg:5.4,reach:2,cone:.3,bolt:4,d:'Rapide : tous les 4 coups, la foudre s\'abat sur ta cible.'},
  hook:{n:'Sabre-grappin',ico:'🪝',col:'#d6b27a',cost:{silver:26},cd:.55,dmg:5.4,reach:3.1,cone:.55,pull:1,d:'Allonge moyenne : ramène les ennemis touchés vers toi et les immobilise un instant.'}
};
for(const id in SW2){ const s=SW2[id]; const it={id,n:s.n,ico:s.ico,col:s.col}; ITEMS.push(it); ITEMMAP[id]=it; TIPS2[id]=s.d.split('.')[0]+' · clic : frapper';
  SHOP.push(mk(id,'Armes',e=>e.own[id]?{name:s.n,desc:'Déjà possédée',cost:{},ok:false,tag:'POSSÉDÉE'}:{name:s.n,desc:s.d,cost:s.cost},e=>{ e.own[id]=true; })); }
SHOP.forEach(s=>SHOPMAP[s.id]=s);
{ const _o=owned; owned=function(e,id){ return SW2[id]?!!e.own[id]:_o(e,id); };
  const _c=cnt; cnt=function(e,id){ return SW2[id]?'':_c(e,id); }; }
function doSword2(e,id){
  const S=SW2[id]; if(!S||e.cd.atk>0) return false;
  e.cd.atk=(e.isBot?S.cd*1.3:S.cd)*(e.haste>0?.8:1); e.swing=Math.min(.3,S.cd*.75); e.swingMax=e.swing; sfx('swing',e.x,e.y);
  const ax=Math.cos(e.ang), ay=Math.sin(e.ang), R=S.reach*T, dmg=S.dmg*cv(e,'melee');
  if(S.lunge){ e.vx+=ax*S.lunge; e.vy+=ay*S.lunge; for(let i=0;i<6;i++) parts.push({x:e.x-ax*i*5,y:e.y-ay*i*5,vx:0,vy:0,life:.25,max:.25,col:'#e2e8f0',size:5-i*.5}); }
  hitGuards(e,e.x+ax*R*.55,e.y+ay*R*.55,R*.8,dmg);
  for(const bt of boats) if(bt.team!==e.team&&Math.hypot(bt.x-(e.x+ax*R*.6),bt.y-(e.y+ay*R*.6))<R*.7) hitBoat(bt,dmg,e);
  if(S.wall){ for(const k of [.8,1.5]){ const tx=Math.floor((e.x+ax*T*k)/T), ty=Math.floor((e.y+ay*T*k)/T); if(inb(tx,ty)&&wallT[idx(tx,ty)]>0&&wallT[idx(tx,ty)]!==CORE&&ownW[idx(tx,ty)]!==e.team&&!protectedTile(tx,ty,e.team)) damageTile(tx,ty,S.wall,e,0); } ring(e.x,e.y,R,'#cbd5e1',.25); }
  let hits=0;
  for(const o of ents){
    if(!o.alive||o.team===e.team) continue; const dx=o.x-e.x, dy=o.y-e.y, d=Math.hypot(dx,dy); if(d>R+8||d<=0) continue;
    if(S.line){ const al=dx*ax+dy*ay, pr=Math.abs(-dx*ay+dy*ax); if(al<0||al>R||pr>.75*T) continue; }
    else if(((dx*ax+dy*ay)/d)<S.cone) continue;
    const kb=S.kb||300; hurt(o,dmg,e,dx/d*kb*(S.pull?-.2:1),dy/d*kb*(S.pull?-.2:1)); hits++; burst(o.x,o.y-8,S.col,6,150,.3,3); if(e===player) shake=Math.max(shake,3);
    if(S.slow){ o.slow=Math.max(o.slow,S.slow); if(Math.random()<S.freeze){ o.frozen=Math.max(o.frozen,.9); floatTxt(o.x,o.y-40,'GELÉ !','#bae6fd',15); } }
    if(S.burn){ o.burn=Math.max(o.burn,S.burn); o.burnBy=e; }
    if(S.leech&&e.alive){ e.hp=Math.min(maxhp(e),e.hp+dmg*S.leech); }
    if(S.pull){ o.vx=(e.x-o.x)*6; o.vy=(e.y-o.y)*6; o.root=Math.max(o.root,.5); o.lastBy=e; o.lastByT=5; }
    if(S.bolt){ e.sN=(e.sN||0)+1; if(e.sN%S.bolt===0){ bombs.push({x:o.x,y:o.y,tx:o.x,ty:o.y,fuse:.3,team:e.team,owner:e,kind:'bomb',R:1.4*T,dm:5,bd:.4,bolt:true,h:0}); ring(o.x,o.y,T*1.4,'#fde047',.3); } }
  }
  if(hits&&S.leech) floatTxt(e.x,e.y-38,'+♥','#f87171',13);
  return true;
}
{ const _ce=controlEnt;
  controlEnt=function(e,dt,inp){
    if(e.pilot){ e.ix=e.iy=0; e.vx*=.5; e.vy*=.5; e.held='sword'; if(inp.clicked) e.pClick=1; return; } // le pirate est dans la fusée
    _ce(e,dt,inp);
    const id=inp.sel; if(SW2[id]&&e.own[id]&&(inp.down||inp.clicked)&&e.frozen<=0&&e.alive&&!e.riding) doSword2(e,id);
  };
  const _mh=makeHeld;
  makeHeld=function(id,e){ const S=SW2[id]; if(!S) return _mh(id,e);
    const g=new THREE.Group(), add=(geo,mat,px,py,pz,sx,sy,sz)=>{ const m=new THREE.Mesh(geo,mat); m.position.set(px,py,pz); m.scale.set(sx,sy,sz); m.castShadow=true; g.add(m); return m; };
    const wd=M('#7c4a21'), gold=M('#fbbf24',{metalness:.4}), bl=M(S.col,{metalness:.4,roughness:.35,emissive:S.col,emissiveIntensity:['frost','flameblade','storm','blood'].includes(id)?.35:0});
    switch(id){
      case 'rapier': add(GEO.box,wd,.08,0,0,.14,.06,.06); add(GEO.torus,gold,.17,0,0,.17,.17,.17).rotation.y=Math.PI/2; add(GEO.box,bl,.62,0,0,.9,.03,.03); break;
      case 'axe': add(GEO.box,wd,.3,0,0,.7,.06,.06); add(GEO.box,bl,.62,0,.08,.18,.04,.34); add(GEO.box,bl,.62,0,-.08,.18,.04,.34).rotation.y=0; add(GEO.cone,bl,.62,0,.3,.16,.24,.16).rotation.x=Math.PI/2; break;
      case 'spear': add(GEO.box,wd,.4,0,0,1.0,.04,.04); add(GEO.cone,bl,.98,0,0,.07,.28,.07).rotation.z=-Math.PI/2; add(GEO.box,M('#f87171'),.8,0,0,.04,.07,.07); break;
      case 'hook': add(GEO.box,wd,.08,0,0,.14,.06,.06); add(GEO.box,bl,.5,0,0,.7,.04,.06); add(GEO.torus,bl,.86,-.1,0,.18,.18,.18); break;
      default: add(GEO.box,wd,.08,0,0,.14,.07,.07); add(GEO.box,gold,.16,0,0,.05,.07,.2); add(GEO.box,bl,.5,0,0,.6,.045,.09); add(GEO.cone,bl,.86,0,0,.06,.16,.06).rotation.z=-Math.PI/2; if(id==='storm') add(GEO.octa,new THREE.MeshBasicMaterial({color:0xfde047}),.5,.08,0,.06,.06,.06);
    }
    return g; };
}
/* bots : ils utilisent leurs épées spéciales */
{ const _bm=botMelee; botMelee=function(b,foe,fd){ const id=Object.keys(SW2).find(k=>b.own[k]); if(id&&fd<SW2[id].reach*T*.95){ b.held=id; doSword2(b,id); return; } _bm(b,foe,fd); };
  const _bt=botThink; botThink=function(b,dt){ _bt(b,dt); if(b.alive&&b.ai&&b.ai.foe){ const id=Object.keys(SW2).find(k=>b.own[k]); if(id) b.held=id; } };
}
/* ---------- fusée téléguidée ---------- */
let MIS=[];
{ const it={id:'rocketpilot',n:'Rampe à fusées',ico:'🚀',col:'#f43f5e'}; ITEMS.push(it); ITEMMAP.rocketpilot=it;
  TIPS2.rocketpilot='Pose une rampe à fusées : E pour t\'y mettre · clic gauche : missile téléguidé · clic droit : missile téléguidé où tu montes dedans (tu atterris avec)';
  SHOP.push(gadItem('rocketpilot','Rampe à fusées','Pose une rampe sur ton île, comme un canon : E pour t\'y mettre. Clic gauche : missile téléguidé (souris = cap, Z/S = vitesse, clic = exploser), ton pirate reste à la rampe, exposé. Clic droit : même missile mais tu montes dedans et tu atterris avec lui à l\'impact. 3 fusées, rechargement 6 s.',{gold:4,diamond:1},1,'Gadgets'));
  SHOP.forEach(s=>SHOPMAP[s.id]=s); if(typeof H_THROW!=='undefined') H_THROW.push('rocketpilot'); }
const pilotMissile=e=>MIS.find(m=>m.owner===e);
function pilotInput(o){
  if(o===player){ const up=keys.KeyW||keys['k:z']||keys.ArrowUp, dn=keys.KeyS||keys['k:s']||keys.ArrowDown, lf=keys.KeyA||keys['k:q']||keys.ArrowLeft, rt=keys.KeyD||keys['k:d']||keys.ArrowRight; let ix=(rt?1:0)-(lf?1:0), iy=(dn?1:0)-(up?1:0); if(typeof TOUCH!=='undefined'&&TOUCH.on&&!ix&&!iy){ ix=TOUCH.ix; iy=TOUCH.iy; } return {ix,iy}; }
  return o.inp?{ix:o.inp.ix||0,iy:o.inp.iy||0}:{ix:0,iy:0};
}
function missileBoom(m){
  const o=m.owner; MIS=MIS.filter(q=>q!==m); const sp=clamp(((m.spd||300)-130)/430,0,1), lt=m.ride?.55:1, R=(2.2+1.1*sp)*T*(m.ride?.75:1), dm=(8+14*sp)*lt; // vite = dégâts ; embarqué = légère explosion
  explode({x:m.x,y:m.y,team:m.team,owner:o,kind:'bomb',R,dm,bd:1.4*(.6+.8*sp)}); ring(m.x,m.y,R*1.1,'#fb7185',.5,true); ring(m.x,m.y,R*.7,'#fff',.35); burst(m.x,m.y,'#fb923c',Math.round(14+22*sp*lt),300,.7,5); smoke(m.x,m.y,10,14,1.2); sfx('boom',m.x,m.y);
  if(o){ o.pilot=0; if(m.ride){ o.z=34; o.vz=0; o.glide=Math.max(o.glide||0,2.8); o.inv=Math.max(o.inv,.7); o.grace=Math.max(o.grace,.9); o.tkH=groundH(o); o.squash=.4; ring(o.x,o.y,T*1.6,'#fff',.5,true); burst(o.x,o.y,'#fecdd3',14,160,.6,3); floatTxt(o.x,o.y-48,'ATTERRISSAGE !','#fda4af',16); } if(o===player){ flashScreen('#fff',.35); JUICE.kick(.9); } }
}
function rocketRemote(e,wx,wy,from){
  const ox=from?from.x:e.x, oy=from?from.y:e.y, dx=wx-ox, dy=wy-oy, d=Math.min(Math.hypot(dx,dy),26*T), k=d/(Math.hypot(dx,dy)||1), tx=ox+dx*k, ty=oy+dy*k, f=Math.max(.4,d/520);
  bombs.push({x:ox,y:oy,tx,ty,fuse:f,team:e.team,owner:e,kind:'bomb',R:2.9*T,dm:16,bd:1.4,shell:true,h:14}); ring(tx,ty,T*2.9,'#fb7185',f); sfx('whoosh',ox,oy); burst(ox,oy,'#fb923c',12,170,.45,3); return true;
}
function rampLaunch(e,c,inp,ride){ // clic gauche : missile téléguidé (on reste à la rampe) · clic droit : missile téléguidé dans lequel on monte et on atterrit
  if(c.cd>0||c.ammo<=0||e.pilot) return false; const a=Math.atan2(inp.wy-c.y,inp.wx-c.x); c.ang=a; c.ammo--; c.cd=6; smoke(c.x,c.y,8,10,.8); ring(c.x,c.y,T*1.5,'#fb7185',.4,true);
  c.rider=null; e.riding=null; e.pilot=1; if(ride){ e.x=c.x; e.y=c.y; e.z=26; e.vz=0; }
  MIS.push({x:c.x+Math.cos(a)*30,y:c.y+Math.sin(a)*30,a,owner:e,team:e.team,t:0,spd:240,ramp:c,ride:!!ride}); sfx('whoosh',c.x,c.y); burst(c.x,c.y,'#fecdd3',16,200,.6,3);
  if(e===player) announce(ride?'🚀 TU ES DANS LA FUSÉE ! Tu atterriras avec elle':'🚀 MISSILE TÉLÉGUIDÉ ! Ton pirate reste exposé','#fda4af');
  if(c.ammo<=0){ floatTxt(c.x,c.y-48,'Plus de fusées !','#fecaca',14); c.dead=true; }
  return true;
}
function placeRamp(e,wx,wy){
  const tx=Math.floor(wx/T), ty=Math.floor(wy/T);
  if(fl(tx,ty)<=0||wl(tx,ty)>0||spawnerAt(tx,ty)||Math.hypot((tx+.5)*T-e.x,(ty+.5)*T-e.y)>3.7*T){ floatTxt(e.x,e.y-34,'Pose-la sur le sol près de toi','#fde68a',14); return false; }
  const mine=cannons.filter(c=>c.kind==='rocket'&&c.team===e.team); if(mine.length>=2){ const o=mine[0]; if(o.rider){ o.rider.riding=null; } cannons=cannons.filter(c=>c!==o); }
  cannons.push({x:(tx+.5)*T,y:(ty+.5)*T,ang:e.ang,team:e.team,owner:e,rider:null,cd:0,hp:14,kind:'rocket',ammo:3}); ring((tx+.5)*T,(ty+.5)*T,T*1.4,'#fb7185',.5,true); chunks((tx+.5)*T,(ty+.5)*T,'#7c4a21',6); floatTxt((tx+.5)*T,(ty+.5)*T-40,'E : monter dessus · 3 fusées','#fecdd3',14); return true;
}
{ const _u=useGadget2; useGadget2=function(e,id,wx,wy,ax,ay){ if(id==='rocketpilot'){ if(e.isBot) return rocketRemote(e,wx,wy); return placeRamp(e,wx,wy); } return _u(e,id,wx,wy,ax,ay); };
  const _cf=cannonFire; cannonFire=function(e,c,inp){ if(c.kind==='rocket') return rampLaunch(e,c,inp,false); return _cf(e,c,inp); };
  const _uc=updateCannons; updateCannons=function(dt){ _uc(dt); if(cannons.some(c=>c.dead&&!c.rider&&!(c.t0))){ for(const c of cannons) if(c.dead&&!c.t0) c.t0=1.2; } for(const c of cannons) if(c.t0){ c.t0-=dt; if(c.t0<=0){ chunks(c.x,c.y,'#7c4a21',8); burst(c.x,c.y,'#fb923c',10,150,.5,3); c.gone=true; } } cannons=cannons.filter(c=>!c.gone); };
  const _cc=createCannonM; createCannonM=function(c){ if(c.kind!=='rocket') return _cc(c);
    const g=new THREE.Group(), tc=TEAMS[Math.max(0,c.team)].col; const base=new THREE.Mesh(GEO.box,new THREE.MeshStandardMaterial({color:0x6b4423,flatShading:true})); base.scale.set(.95,.16,.85); base.position.y=.1; g.add(base);
    const strip=new THREE.Mesh(GEO.box,new THREE.MeshStandardMaterial({color:tc,flatShading:true})); strip.scale.set(.98,.04,.88); strip.position.y=.2; g.add(strip);
    const rack=new THREE.Group(); rack.position.y=.42; g.add(rack); for(const z of [-.24,0,.24]){ const r=new THREE.Mesh(GEO.cyl,new THREE.MeshStandardMaterial({color:0xf8fafc,flatShading:true,metalness:.3})); r.scale.set(.1,.7,.1); r.rotation.z=Math.PI/2; r.position.set(.3,0,z); rack.add(r); const n=new THREE.Mesh(GEO.cone,new THREE.MeshStandardMaterial({color:0xef4444,flatShading:true})); n.scale.set(.1,.24,.1); n.rotation.z=-Math.PI/2; n.position.set(.72,0,z); rack.add(n); }
    const rail=new THREE.Mesh(GEO.box,new THREE.MeshStandardMaterial({color:0x374151,flatShading:true})); rail.scale.set(.9,.05,.7); rail.position.set(.25,-.1,0); rack.add(rail); g.userData={bar:rack,rocket:true}; return g; };
  const _um=updateCannonM; updateCannonM=function(c,m){ _um(c,m); if(c.kind==='rocket'){ m.userData.bar.rotation.z=c.rider?.7:.5; m.userData.bar.children.forEach((q,i)=>{ if(i<6&&c.ammo!==undefined){ const k=Math.floor(i/2); q.visible=k<c.ammo; } }); } };

    const _ev=updateEvents;
  updateEvents=function(dt){
    _ev(dt);
    for(const m of MIS.slice()){
      const o=m.owner; if(!o||!o.alive||game.state!=='play'){ MIS=MIS.filter(q=>q!==m); if(o){ o.pilot=0; if(!o.alive){ smoke(m.x,m.y,8,10,.8); burst(m.x,m.y,'#9ca3af',12,160,.6,3); floatTxt(m.x,m.y-30,'Pilote touché : la fusée s\'écrase','#fecaca',14); } } continue; }
      m.t+=dt; let wx=aim.x, wy=aim.y, click=!!o.pClick; o.pClick=0; if(o===player){ click=click||mouse.clicked; } else if(o.inp){ wx=o.inp.wx; wy=o.inp.wy; }
      const pin=pilotInput(o); let da=Math.atan2(wy-m.y,wx-m.x)-m.a; while(da>Math.PI) da-=6.283; while(da<-Math.PI) da+=6.283;
      const spf=clamp((m.spd-130)/430,0,1), tr=4.8-3.4*spf; m.a+=clamp(da,-tr*dt,tr*dt)+pin.ix*(2.4-1.5*spf)*dt; // la souris donne le cap, Q/D l'affine ; plus on va vite, moins on tourne
      const want=pin.iy<-.3?560:pin.iy>.3?130:300; m.spd+=clamp(want-m.spd,-520*dt,420*dt); const nx=m.x+Math.cos(m.a)*m.spd*dt, ny=m.y+Math.sin(m.a)*m.spd*dt;
      o.ix=o.iy=0; if(m.ride){ o.x=m.x; o.y=m.y; o.z=26; o.vz=0; o.vx=o.vy=0; o.grace=Math.max(o.grace,.5); o.ang=m.a; }
      for(let k=0;k<2;k++) parts.push({x:m.x-Math.cos(m.a)*10,y:m.y-Math.sin(m.a)*10,z:22,vx:rnd(-20,20),vy:rnd(-20,20),vz:rnd(0,30),life:.5,max:.5,col:k?'#fb923c':'#e5e7eb',size:k?4:6,smoke:!k});
      m.x=nx; m.y=ny; let boom=m.t>7||(click&&m.t>.45)||m.x<0||m.y<0||m.x>W*T||m.y>H*T;
      if(!boom){ const tx=Math.floor(m.x/T), ty=Math.floor(m.y/T); if(inb(tx,ty)&&wallT[idx(tx,ty)]>0) boom=true; }
      if(!boom) for(const q of ents){ if(!q.alive||q.team===m.team||q.inv>1.2) continue; if(Math.hypot(q.x-m.x,q.y-m.y)<T*.9&&q.z<60){ boom=true; break; } }
      if(!boom&&BOSS&&BOSS.on&&Math.hypot(BOSS.x-m.x,BOSS.y-m.y)<BOSS.rad+T*.4) { bossHit(18,o); boom=true; }
      if(boom) missileBoom(m);
    }
  };
  const _cam=updateCamera;
  updateCamera=function(dt){ _cam(dt); if(game.state==='menu'||!player||!player.pilot) return; const m=pilotMissile(player); if(!m) return; cam3.x=m.x; cam3.y=m.y; camPlace(12.6+Math.min(2.6,(m.spd-130)/170),8.2+Math.min(1.8,(m.spd-130)/240),.3); camera3.rotation.z+=Math.sin(game.t*40)*.003; };
  const _ng=newGame; newGame=function(){ MIS=[]; _ng(); };
  // réseau
  const _nc=netCommon; netCommon=function(){ const c=_nc(); if(MIS.length) c.ms=MIS.map(m=>[Math.round(m.x),Math.round(m.y),Math.round(m.a*100)/100,ents.indexOf(m.owner)]); return c; };
  const _na=netApplySnap; netApplySnap=function(m){ _na(m); MIS=(m.ms||[]).map(a=>({x:a[0],y:a[1],a:a[2],owner:ents[a[3]],team:ents[a[3]]?ents[a[3]].team:0,t:0})); };
}
/* bots : tir à distance uniquement */
{ const _bg=botGadgets2; botGadgets2=function(b,foe,fd,nearCore,r,dt){ if((b.am.rocketpilot||0)>0&&fd>4*T&&fd<15*T&&b.cd.gad<=0&&r<dt*.45) return useGadget(b,'rocketpilot',foe.x,foe.y); return _bg(b,foe,fd,nearCore,r,dt); };
  if(typeof BOT_USES!=='undefined'){ BOT_USES.add('rocketpilot'); } }
/* ---------- affichage de la fusée ---------- */
const rocketM=new Map();
{ const _r=render3d;
  render3d=function(dt){
    if(renderer&&scene){ const seen=new Set();
      for(const m of MIS){ seen.add(m); let g=rocketM.get(m); if(!g){ g=new THREE.Group(); const body=new THREE.Mesh(GEO.cyl,M('#f8fafc',{metalness:.3})); body.scale.set(.2,.9,.2); body.rotation.z=Math.PI/2; g.add(body); const nose=new THREE.Mesh(GEO.cone,M('#ef4444')); nose.scale.set(.2,.45,.2); nose.rotation.z=-Math.PI/2; nose.position.x=.65; g.add(nose);
          for(let i=0;i<3;i++){ const f=new THREE.Mesh(GEO.box,M('#ef4444')); f.scale.set(.3,.04,.22); f.position.x=-.35; f.rotation.x=i*2.094; g.add(f); } const fl=new THREE.Mesh(GEO.cone,new THREE.MeshBasicMaterial({color:0xfb923c,transparent:true,opacity:.9})); fl.scale.set(.16,.6,.16); fl.rotation.z=Math.PI/2; fl.position.x=-.75; g.add(fl); g.userData.fl=fl; scene.add(g); rocketM.set(m,g); }
        g.position.set(m.x*U,.9,m.y*U); g.rotation.y=-m.a; g.userData.fl.scale.set(.16+Math.random()*.1,.5+Math.random()*.4,.16); }
      for(const [m,g] of rocketM) if(!seen.has(m)){ scene.remove(g); rocketM.delete(m); } }
    _r(dt); };
}
{ const _dh=drawHud;
  drawHud=function(){ _dh(); if(game.state==='menu'||!ctx||!player) return;
    if(player.pilot){ const m=pilotMissile(player); ctx.save(); ctx.setTransform(DPR,0,0,DPR,0,0); ctx.textAlign='center';
      const g=ctx.createRadialGradient(VW/2,VH/2,Math.min(VW,VH)*.3,VW/2,VH/2,Math.max(VW,VH)*.72); g.addColorStop(0,'rgba(0,0,0,0)'); g.addColorStop(1,'rgba(30,0,10,.55)'); ctx.fillStyle=g; ctx.fillRect(0,0,VW,VH);
      const t=m?Math.max(0,7-m.t):0; ctx.font='bold 16px '+FONT; ctx.fillStyle='#fecdd3'; ctx.lineWidth=4; ctx.strokeStyle='rgba(40,0,10,.9)'; const txt='🚀 '+(m&&m.ride?'À bord · ':'')+'Souris : cap · Z/S : vitesse ('+Math.round(m?m.spd:0)+') · Q/D : affiner · clic : exploser · '+t.toFixed(1)+' s'; ctx.strokeText(txt,VW/2,VH-70); ctx.fillText(txt,VW/2,VH-70);
      ctx.fillStyle='rgba(255,255,255,.2)'; ctx.fillRect(VW/2-110,VH-60,220,6); ctx.fillStyle='#fb7185'; ctx.fillRect(VW/2-110,VH-60,220*t/7,6); ctx.strokeStyle='rgba(251,113,133,.85)'; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(VW/2,VH/2,22,0,6.283); ctx.moveTo(VW/2-30,VH/2); ctx.lineTo(VW/2-12,VH/2); ctx.moveTo(VW/2+12,VH/2); ctx.lineTo(VW/2+30,VH/2); ctx.stroke(); ctx.restore(); }
  };
}

/* clic droit sur une rampe : on monte dans la fusée */
function rampOf(e){ return e&&e.riding&&e.riding.cannon&&e.riding.c&&e.riding.c.kind==='rocket'?e.riding.c:null; }
function rampRide(){ const e=player; if(!e||!e.alive||game.state!=='play'||game.paused) return false; const c=rampOf(e); if(!c) return false; if(NETCLIENT){ netSend({t:'act',a:'rr'}); return true; } if(c.cd>0){ floatTxt(c.x,c.y-40,'Rechargement…','#fde68a',14); return true; } rampLaunch(e,c,{wx:aim.x,wy:aim.y},true); return true; }
{ const ui=document.getElementById('ui'); ui.addEventListener('mousedown',ev=>{ if(ev.button===2&&rampOf(player)){ ev.preventDefault(); ev.stopImmediatePropagation(); rampRide(); } },true);
  const _nh=netHostData; netHostData=function(team,m){ if(m&&m.t==='act'&&m.a==='rr'){ const e=ents.find(o=>o.remote&&o.team===team); if(e&&e.alive&&NET.started){ const c=rampOf(e); if(c&&c.cd<=0&&e.inp) rampLaunch(e,c,{wx:e.inp.wx,wy:e.inp.wy},true); } return; } _nh(team,m); };
  const _ci=cannonInteract; cannonInteract=function(e){ const was=!!rampOf(e), r=_ci(e); const c=rampOf(e); if(r&&c&&!was) floatTxt(e.x,e.y-60,'Clic gauche : missile guidé · Clic droit : monter dedans','#fecdd3',13); return r; };
}
