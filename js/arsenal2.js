'use strict';
/* =====================  NOUVEAUX OBJETS & AMÉLIORATIONS DE BASE  =====================
   Gadgets : 🪞 Miroir de brume (renvoie les tirs), 🛢️ Tonneau piégé
   Base    : 🎯 Artillerie (vue du dessus : tu désignes une zone, les boulets tombent du ciel), 🪨 Catapulte à blocs,
             🗼 Phare de garde (révèle les ennemis qui approchent de ton île), ⚓ Chantier naval (les gardiens se reconstruisent) */
const NEWA2=[{id:'mirror',n:'Miroir de brume',ico:'🪞',col:'#e2e8f0'},{id:'barrel',n:'Tonneau piégé',ico:'🛢️',col:'#a16207'}];
for(const it of NEWA2){ ITEMS.push(it); ITEMMAP[it.id]=it; }
Object.assign(TIPS2,{
  mirror:'6 s : les projectiles ennemis qui te touchent sont renvoyés contre leur tireur',
  barrel:'Lance un tonneau qui roule vers l\'ennemi le plus proche et explose au contact'
});
SHOP.push(
  gadItem('mirror','Miroir de brume','Pendant 6 s, un miroir t\'entoure : les balles, flèches et boulets ennemis qui te touchent sont renvoyés contre leur tireur !',{silver:16},1,'Défense'),
  gadItem('barrel','Tonneau piégé','Lance un tonneau de poudre : il roule en direction de l\'ennemi le plus proche (il te contourne mal !) et explose au contact, à un mur ou au bord de l\'île. Les tirs peuvent le faire exploser avant.',{silver:14},2,'Gadgets'),
  upItem('art','Artillerie (vue du dessus)',3,[4,6,9],[
    'Construit une batterie autour de ta base (elle détruit les blocs sur son emplacement) : monte dessus (touche E) pour passer en vue du dessus, désigne une zone et clique : 5 boulets tombent du ciel. Recharge 40 s.',
    'Salve de 7 boulets, recharge 32 s.','Salve de 9 boulets, recharge 25 s.']),
  upItem('catapult','Catapulte à blocs',1,[3],['Construit une catapulte autour de ta base (elle détruit les blocs sur son emplacement). Monte dessus (touche E), vise et clique : un bloc de pierre (consommé) part jusqu\'à 18 cases, dégâts énormes sur les murs. Recharge 6 s.']),
  upItem('scope','Observatoire',1,[3],['Construit un observatoire autour de ta base : monte dessus (touche E) pour regarder partout sur la carte, déplacer la vue (ZQSD) et zoomer (molette).']),
  upItem('lighthouse','Tour de guet',1,[3],['Une tour en bois de 5,5 blocs sur ton île : debout dessus, E te téléporte tout en haut (E de nouveau pour redescendre). De là-haut tu vois bien plus loin, tes armes portent bien plus loin et tes tirs passent par-dessus les murs.']),
  upItem('shipyard','Chantier naval',2,[4,6],['Toutes les 40 s, un matelot gardien réapparaît à ta base (2 gardiens maximum).','Toutes les 28 s, jusqu\'à 3 gardiens.'])
);
SHOP.forEach(s=>SHOPMAP[s.id]=s);
H_THROW.push('barrel'); H_BUFF.push('mirror');
const ART={on:false,t:0,px:0,py:0}; let barrels2=[]; const LHM={}; const LHSEEN=new Map(), SY={};
{ const _ng=newGame; newGame=function(){ _ng(); for(const t of TD){ const u=t.ent.up; u.art=0; u.catapult=0; u.scope=0; u.radar=0; u.lighthouse=0; u.shipyard=0; SY[t.id]=20; } ART.on=false; barrels2=[]; LHSEEN.clear(); for(const k in LHM) delete LHM[k]; }; }
/* ---------- salves d'artillerie ---------- */
function artFire(e,tx,ty){
  const lv=Math.max(1,e.up.art|0), n=3+2*lv, R=2.4*T; ring(tx,ty,R*1.2,'#fb923c',1.3,true); ring(tx,ty,R*.5,'#fff',.8); sfx('gadget',e.x,e.y); floatTxt(e.x,e.y-46,`🎯 SALVE ×${n}`,'#fdba74',16);
  for(let k=0;k<n;k++) delayed.push({t:.5+k*.22,fn:()=>{ const a=rnd(0,6.28), r=Math.sqrt(Math.random())*R, x=tx+Math.cos(a)*r, y=ty+Math.sin(a)*r; ring(x,y,T*1.5,'#fb923c',.8);
    bombs.push({x,y,tx:x,ty:y,fuse:1.1,team:e.team,owner:e,kind:'bomb',R:1.9*T,dm:10,bd:1.2,shell:true,drop:true,h:0}); }});
  const cd=[40,32,25][lv-1]; delayed.push({t:.02,fn:()=>{ e.pcd.artillery=cd; }});
}
/* ---------- capacités des améliorations de base (touches T et B, pas d'inventaire) ---------- */
function abilityArt(e,wx,wy){
  if((e.up.art|0)<1) return false;
  if(e===player&&NETCLIENT){ netSend({t:'act',a:'art',x:Math.round(aim.x),y:Math.round(aim.y)}); return true; }
  if((e.pcd.artillery||0)>0){ if(e===player) floatTxt(e.x,e.y-36,'🎯 Recharge : '+Math.ceil(e.pcd.artillery)+' s','#cbd5e1',13); return false; }
  if(e===player&&!e.remote){ if(ART.on){ ART.on=false; return true; } ART.on=true; ART.t=0; ART.px=ART.py=0; msg('🎯 Vue du dessus : ZQSD déplace la vue · clic : tirer · E ou Échap : annuler','#fdba74'); return true; }
  artFire(e,wx,wy); return true; }
function abilityCat(e,wx,wy){
  if((e.up.catapult|0)<1||e.frozen>0) return false;
  if(e===player&&NETCLIENT){ netSend({t:'act',a:'cat',x:Math.round(aim.x),y:Math.round(aim.y)}); return true; }
  if((e.pcd.catapult||0)>0){ if(e===player) floatTxt(e.x,e.y-36,'🪨 Recharge : '+Math.ceil(e.pcd.catapult)+' s','#cbd5e1',13); return false; }
  if((e.blocks[4]||0)<1){ floatTxt(e.x,e.y-34,'Il faut de la pierre','#fca5a5',14); return false; }
  const x=wx===undefined?aim.x:wx, y=wy===undefined?aim.y:wy, [tx,ty]=aimPoint(e,x,y,18*T); e.blocks[4]--; e.pcd.catapult=6; bombs.push({x:e.x,y:e.y,tx,ty,fuse:1.15,team:e.team,owner:e,kind:'bomb',R:1.6*T,dm:12,bd:3,h:20}); e.swing=.2; e.swingMax=.2; sfx('shot',e.x,e.y); floatTxt(e.x,e.y-38,'🪨 CATAPULTE !','#d6d3d1',14); return true; }
{ const _nh=netHostData; netHostData=function(team,m){ if(m&&m.t==='act'&&(m.a==='art'||m.a==='cat')){ const e=ents.find(o=>o.remote&&o.team===team); if(e&&e.alive&&NET.started){ if(m.a==='art') abilityArt(e,+m.x||e.x,+m.y||e.y); else abilityCat(e,+m.x||e.x,+m.y||e.y); } return; } _nh(team,m); }; }
{ const _u=useGadget2;
  useGadget2=function(e,id,wx,wy,ax,ay){
    switch(id){
      case 'mirror': e.mirror=6; ring(e.x,e.y,T*1.3,'#e2e8f0',.6,true); floatTxt(e.x,e.y-40,'🪞 MIROIR !','#e2e8f0',16); burst(e.x,e.y-10,'#f8fafc',12,130,.5,3); sfx('gadget',e.x,e.y); return true;
      case 'barrel':{ barrels2.push({x:e.x+Math.cos(e.ang)*22,y:e.y+Math.sin(e.ang)*22,a:e.ang,team:e.team,owner:e,t:9,hp:3,id:Math.random()}); sfx('place',e.x,e.y); floatTxt(e.x,e.y-38,'🛢️ ROULE !','#fbbf24',14); return true; }
    }
    return _u(e,id,wx,wy,ax,ay);
  };
  const _ce=controlEnt;
  controlEnt=function(e,dt,inp){
    if(e===player&&ART.on){
      if(!e.alive||e.frozen>0||(ART.t+=dt)>12){ ART.on=false; } else {
        e.ix=e.iy=0; const k=720*dt; ART.px=clamp(ART.px+(inp.ix||0)*k,-1700,1700); ART.py=clamp(ART.py+(inp.iy||0)*k,-1700,1700);
        if(inp.clicked){ const tc=typeof TOUCH!=='undefined'&&TOUCH.on, tx=tc?e.x+ART.px:inp.wx, ty=tc?e.y+ART.py:inp.wy; if(!((e.pcd.artillery||0)>0)){ artFire(e,tx,ty); e.cd.gad=.5; ART.on=false; } }
        return; } }
    _ce(e,dt,inp); };
  addEventListener('keydown',ev=>{ if(ev.key==='Escape'&&ART.on){ ART.on=false; } });
  const _cam=updateCamera;
  updateCamera=function(dt){ _cam(dt); if(!ART.on||game.state!=='play'||!player) return; cam3.x=player.x+ART.px; cam3.y=player.y+ART.py; const cx=cam3.x*U, cz=cam3.y*U; camera3.position.set(cx,42,cz+9); camera3.lookAt(cx,0,cz-.2); };
}
/* ---------- boucle : propriétés, miroir, tonneaux, phare, chantier naval ---------- */
{ const _e=updateEvents;
  updateEvents=function(dt){ _e(dt); if(game.state!=='play'||game.paused) return;
    for(const e of ents){
      if(e.mirror>0&&e.alive){ e.mirror-=dt; if(Math.random()<dt*14) parts.push({x:e.x+rnd(-14,14),y:e.y+rnd(-14,14),z:rnd(8,34),vx:0,vy:0,vz:rnd(10,30),life:.4,max:.4,col:'#f8fafc',size:3});
        for(const p of projs){ if(p.life>0&&p.team!==e.team&&p.dmg>0&&Math.hypot(p.x-e.x,p.y-e.y)<22){ p.vx=-p.vx; p.vy=-p.vy; p.team=e.team; p.owner=e; p.hit=p.pierce?[]:null; p.life=Math.max(p.life,.55); ring(e.x,e.y,T*1.1,'#e2e8f0',.4,true); burst(p.x,p.y,'#f8fafc',6,110,.3,3); floatTxt(e.x,e.y-42,'🪞 RENVOYÉ !','#e2e8f0',14); sfx('tick',e.x,e.y); } } } }
    // tonneaux
    for(const r of barrels2){ r.t-=dt; let tg=null,bd=1e9; for(const o of ents){ if(!o.alive||o.team===r.team) continue; const d=Math.hypot(o.x-r.x,o.y-r.y); if(d<bd){ bd=d; tg=o; } }
      if(tg&&bd<8*T){ let da=Math.atan2(tg.y-r.y,tg.x-r.x)-r.a; while(da>Math.PI) da-=6.283; while(da<-Math.PI) da+=6.283; r.a+=clamp(da,-1.6*dt,1.6*dt); }
      const nx=r.x+Math.cos(r.a)*150*dt, ny=r.y+Math.sin(r.a)*150*dt, tx=Math.floor(nx/T), ty=Math.floor(ny/T), blocked=wl(tx,ty)>0||fl(tx,ty)===0;
      if(!blocked){ r.x=nx; r.y=ny; if(Math.random()<dt*14) parts.push({x:r.x,y:r.y,z:10,vx:0,vy:0,vz:20,life:.35,max:.35,col:'#9ca3af',size:3,smoke:true}); }
      for(const p of projs){ if(p.life>0&&p.team!==r.team&&p.dmg>0&&Math.hypot(p.x-r.x,p.y-r.y)<18){ r.hp-=p.dmg; p.life=p.pierce?p.life:0; burst(r.x,r.y,'#a16207',4,100,.3,3); } }
      if(blocked||(tg&&bd<1.1*T)||r.hp<=0||r.t<=0){ r.dead=true; explode({x:r.x,y:r.y,team:r.team,owner:r.owner,kind:'bomb',R:2.1*T,dm:9,bd:1.3}); ring(r.x,r.y,T*2.2,'#f59e0b',.5,true); } }
    barrels2=barrels2.filter(r=>!r.dead);
    // phare de garde
    for(const t of TD){ const set=[]; if(t.ent.up.watch>0&&t.coreAlive){ const cx=(t.bx+.5)*T, cy=(t.by+.5)*T;
        for(const o of ents){ if(!o.alive||o.team===t.id||o.cloak>0||Math.hypot(o.x-cx,o.y-cy)>10*T) continue; set.push(o); const l=LHSEEN.get(o); if(!l||game.t-l>14){ LHSEEN.set(o,game.t); t.intr=3; if(t.id===player.team){ floatTxt(o.x,o.y-50,'🔔 INTRUS !','#fca5a5',14); announce('🔔 UN ENNEMI ENTRE DANS TA BASE !','#fca5a5'); sfx('alarm'); } } } if(t.intr>0) t.intr-=dt; }
      LHM[t.id]=set; }
    // chantier naval
    for(const t of TD){ const lv=t.ent.up.shipyard|0; if(!lv||!t.members.some(m=>m.alive)||!t.coreAlive) continue; SY[t.id]-=dt; if(SY[t.id]<=0){ SY[t.id]=[40,28][lv-1]; const max=[2,3][lv-1];
        if(guards.filter(g=>g.team===t.id).length<max){ const px=(t.padTile[0]+.5)*T, py=(t.padTile[1]+.5)*T; guards.push({x:px,y:py,team:t.id,owner:t.ent,hp:10,t:1e6,cd:.5,vx:0,vy:0,ph:rnd(0,6),ang:0}); ring(px,py,T*1.3,'#a3e635',.5,true); burst(px,py,'#bef264',10,120,.5,3); if(t.id===player.team) floatTxt(px,py-40,'⚓ Chantier naval : un gardien !','#bef264',14); } } }
  };
}
/* ---------- affichage : tonneaux (3D), réticule d'artillerie, repères du phare ---------- */
const barrelM=new Map();
{ const _r=render3d;
  render3d=function(dt){
    if(renderer&&scene){ const seen=new Set();
      for(const r of barrels2){ seen.add(r); let g=barrelM.get(r); if(!g){ g=new THREE.Group(); const bd=new THREE.Mesh(GEO.cyl,M('#8a5a2b')); bd.scale.set(.36,.48,.36); bd.rotation.x=Math.PI/2; bd.position.y=.3; g.add(bd); for(const z of [-.14,.14]){ const bn=new THREE.Mesh(GEO.cyl,M('#374151')); bn.scale.set(.385,.05,.385); bn.rotation.x=Math.PI/2; bn.position.set(0,.3,z); g.add(bn); } const cap=new THREE.Mesh(GEO.sphere0,new THREE.MeshBasicMaterial({color:0xef4444})); cap.scale.setScalar(.09); cap.position.set(0,.62,0); g.add(cap); g.userData.cap=cap; g.userData.body=bd; scene.add(g); barrelM.set(r,g); }
        g.position.set(r.x*U,0,r.y*U); g.rotation.y=-r.a; g.userData.body.rotation.z=(game.t*7)%6.283; g.userData.cap.visible=Math.floor(game.t*8)%2===0; }
      for(const [r,g] of barrelM) if(!seen.has(r)){ scene.remove(g); barrelM.delete(r); } }
    _r(dt); };
  const _nc=netCommon; netCommon=function(){ const c=_nc(); if(barrels2.length) c.tb=barrels2.map(r=>[Math.round(r.x),Math.round(r.y),Math.round(r.a*100)/100,r.team,Math.round(r.id*1e4)]); const lh={}; for(const k in LHM) if(LHM[k].length) lh[k]=LHM[k].map(o=>ents.indexOf(o)); if(Object.keys(lh).length) c.lh=lh; return c; };
  const _na=netApplySnap; netApplySnap=function(m){ _na(m); const old=new Map(barrels2.map(r=>[r.id,r])); barrels2=(m.tb||[]).map(a=>{ const id=a[4]/1e4; const o=old.get(id)||{id}; o.x=a[0]; o.y=a[1]; o.a=a[2]; o.team=a[3]; return o; });
    for(const k in LHM) delete LHM[k]; if(m.lh) for(const k in m.lh) LHM[k]=m.lh[k].map(i=>ents[i]).filter(Boolean); };
  const _dh=drawHud;
  drawHud=function(){ _dh(); if(game.state==='menu'||!ctx||!player) return; ctx.save(); ctx.setTransform(DPR,0,0,DPR,0,0); ctx.textAlign='center';
    const lh=LHM[player.team]||[]; for(const o of lh){ if(!o.alive) continue; const s=w2s(o.x,o.y,o.z+68+Math.sin(game.t*7)*3); if(s[2]){ ctx.fillStyle='#f87171'; ctx.strokeStyle='#450a0a'; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(s[0],s[1]+12); ctx.lineTo(s[0]-9,s[1]-4); ctx.lineTo(s[0]+9,s[1]-4); ctx.closePath(); ctx.stroke(); ctx.fill(); ctx.font='bold 11px '+FONT; ctx.lineWidth=3; ctx.strokeStyle='rgba(40,0,0,.9)'; ctx.strokeText('🗼',s[0],s[1]-8); ctx.fillText('🗼',s[0],s[1]-8); } }
    if(lh.length&&typeof miniSize==='function'){ const S=miniSize(), mx=VW-S-10, my=10; ctx.save(); rr(mx,my,S,S,8); ctx.clip(); for(const o of lh){ if(!o.alive) continue; const x=mx+o.x/T/W*S, y=my+o.y/T/H*S; ctx.strokeStyle='#f87171'; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(x,y,4+(game.t*8%4),0,6.3); ctx.stroke(); } ctx.restore(); }
    if(ART.on){ const c=w2s(aim.x,aim.y,0), e2=w2s(aim.x+2.4*T,aim.y,0), R=Math.max(24,Math.abs(e2[0]-c[0]));
      const tc=(typeof TOUCH!=='undefined'&&TOUCH.on)?w2s(player.x+ART.px,player.y+ART.py,0):c; ctx.strokeStyle='#fb923c'; ctx.lineWidth=3; ctx.setLineDash([10,8]); ctx.beginPath(); ctx.arc(tc[0],tc[1],R,0,6.283); ctx.stroke(); ctx.setLineDash([]); ctx.beginPath(); ctx.moveTo(tc[0]-R*.4,tc[1]); ctx.lineTo(tc[0]+R*.4,tc[1]); ctx.moveTo(tc[0],tc[1]-R*.4); ctx.lineTo(tc[0],tc[1]+R*.4); ctx.stroke();
      const cd=player.pcd.artillery||0; ctx.font='bold 15px '+FONT; ctx.lineWidth=4; ctx.strokeStyle='rgba(60,20,0,.9)'; const t=cd>0?`🎯 Recharge ${Math.ceil(cd)} s`:'🎯 Clic : tirer la salve · ZQSD : déplacer la vue · Échap : annuler'; ctx.strokeText(t,VW/2,VH-124); ctx.fillStyle=cd>0?'#fca5a5':'#fed7aa'; ctx.fillText(t,VW/2,VH-124); }
    ctx.restore(); };
}
/* ---------- bots ---------- */
{ const _bg=botGadgets2;
  botGadgets2=function(b,foe,fd,nearCore,r,dt){ const has=id=>(b.am[id]||0)>0; if(b.cd.gad>0) return false;
    if(has('mirror')&&!(b.mirror>0)&&fd<9*T&&fd>2*T&&r<dt*.7) return useGadget(b,'mirror',b.x,b.y);
    if(has('barrel')&&fd>3*T&&fd<10*T&&r<dt*.6) return useGadget(b,'barrel',foe.x,foe.y);
    return _bg(b,foe,fd,nearCore,r,dt); };
}

/* ---------- Canon d'embarquement = la rampe à fusées (boulet téléguidé, ou on monte dedans) ---------- */
{ const it=ITEMMAP.rocketpilot; it.n='Canon d\'embarquement'; it.ico='🚀';
  TIPS2.rocketpilot='E : monter dans le canon · clic gauche : boulet téléguidé (souris = cap, Z/S = vitesse : plus vite = plus de dégâts mais moins maniable) · clic droit : tu montes dedans et tu atterris avec une légère explosion';
  const s=SHOPMAP.rocketpilot; if(s){ const o=s.info; s.info=function(e){ const r=o.call(this,e); return Object.assign({},r,{name:'Canon d\'embarquement ×1',desc:'Pose un canon sur ton île : E pour t\'y mettre. Clic gauche : boulet de canon téléguidé (souris = cap, Z/S = vitesse, clic = exploser) : plus il va vite, plus il fait mal mais moins il tourne. Clic droit : tu montes dedans et tu atterris avec une légère explosion. 3 boulets, recharge 6 s.'}); }; } }
