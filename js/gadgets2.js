'use strict';
/* =====================  NOUVEAUX GADGETS & AMÉLIORATIONS  =====================
   Piège à ancre, Perroquet messager, Aimant à butin, Canne de pêche, Cloche de brume, Radeau-bombe, Marteau de réparation,
   améliorations de base : Totem de vigie (révèle périodiquement les ennemis) et Cloche de vigie (prévient quand ton coffre est attaqué). */
const NEWG=[
  {id:'anchortrap',n:'Piège à ancre',ico:'🪤',col:'#94a3b8'},{id:'parrotmsg',n:'Perroquet messager',ico:'🦜',col:'#4ade80'},{id:'magnet',n:'Aimant à butin',ico:'🧲',col:'#f87171'},
  {id:'fishrod',n:'Canne de pêche',ico:'🎣',col:'#38bdf8'},{id:'mistbell',n:'Cloche de brume',ico:'🔔',col:'#e2e8f0'},{id:'bombraft',n:'Radeau-bombe',ico:'🛶',col:'#f59e0b'},{id:'repairhammer',n:'Marteau de réparation',ico:'🔨',col:'#fbbf24'}
];
for(const it of NEWG){ ITEMS.push(it); ITEMMAP[it.id]=it; }
Object.assign(TIPS2,{
  anchortrap:'Pose un piège : l\'ennemi qui marche dessus est immobilisé et le pont sous lui s\'effondre',
  parrotmsg:'Le perroquet marque l\'ennemi le plus proche de la cible : il reste visible 8 s pour ton équipe',
  magnet:'10 s : aspire les ressources des piles proches, même celles des bases ennemies',
  fishrod:'Lance la ligne : accroche un ennemi (tiré vers toi + butin volé) ou pêche dans l\'eau',
  mistbell:'Un nuage de brume 10 s : tes alliés dedans deviennent invisibles et les tirs ennemis sont bloqués',
  bombraft:'Un radeau piégé dérive vers l\'ennemi et explose au contact',
  repairhammer:'Rebâtit les blocs de ton équipe détruits récemment, autour de toi'
});
SHOP.push(
  gadItem('anchortrap','Piège à ancre','Posé au sol : l\'ennemi qui marche dessus est immobilisé 2,5 s et les ponts autour de lui s\'effondrent (le sol des îles résiste).',{silver:14},2,'Gadgets'),
  gadItem('parrotmsg','Perroquet messager','Vise un ennemi : il le marque, ainsi que celui qui est le plus proche de lui. Tes alliés les voient 8 s sur la carte et à l\'écran.',{silver:12},2,'Outils'),
  gadItem('magnet','Aimant à butin','Pendant 10 s, les ressources des piles dans 8 cases viennent à toi, même sur une base ennemie ou sur le galion !',{silver:14},1,'Outils'),
  gadItem('fishrod','Canne de pêche','Lance la ligne : sur un ennemi, tu le tires vers toi (comme un lasso) et tu lui voles des ressources ; dans l\'eau, une prise surprise (butin, vieille botte, crabe, requin allié, relique…).',{silver:16},3,'Gadgets'),
  gadItem('mistbell','Cloche de brume','Un nuage de brume de 10 s autour de toi : tes alliés dedans sont invisibles et les tirs ennemis y sont arrêtés.',{silver:18},1,'Défense'),
  gadItem('bombraft','Radeau-bombe','Pose un radeau piégé sur l\'eau : il dérive vers l\'ennemi le plus proche et explose au contact. Les tirs peuvent le détruire.',{gold:2},1,'Gadgets'),
  gadItem('repairhammer','Marteau de réparation','Rebâtit instantanément les ponts et murs de ton équipe détruits ces dernières 45 s dans 6 cases autour de toi.',{silver:14},2,'Défense'),
  upItem('radar','Totem de vigie',3,[4,6,9],['Un totem veille sur ton île : toutes les 30 s, les esprits révèlent les ennemis 3 s sur la mini-carte','Toutes les 22 s pendant 4 s','Toutes les 15 s pendant 6 s']),
  upItem('watch','Cloche de vigie',1,[3],['Tu es prévenu quand ton coffre est attaqué (alarme, bannière, jauge de vie du coffre). Sans elle, tu ne sais jamais quand on te pille !'])
);
SHOP.forEach(s=>SHOPMAP[s.id]=s);
H_THROW.push('parrotmsg','fishrod','bombraft'); H_PLACE.push('anchortrap','mistbell','repairhammer'); H_BUFF.push('magnet');
{ const _ng=newGame; newGame=function(){ _ng(); for(const t of TD){ t.ent.up.radar=0; t.ent.up.watch=0; t.radarT=25; } rafts2=[]; wreck=[]; }; }
let rafts2=[], wreck=[]; // radeaux-bombes, tuiles détruites récemment (pour le marteau)
/* ---------- mémoire des blocs détruits (marteau) ---------- */
{ const _dt=damageTile;
  damageTile=function(tx,ty,dmg,src,layer){
    if(!inb(tx,ty)) return _dt(tx,ty,dmg,src,layer); const i=idx(tx,ty), w0=wallT[i], o0=ownW[i], f0=floorT[i], of0=ownF[i];
    const r=_dt(tx,ty,dmg,src,layer);
    if(w0>0&&w0!==CORE&&wallT[i]===0&&o0>=0) wreck.push({i,wall:w0,own:o0,t:game.t});
    else if(f0>=2&&floorT[i]===0&&of0>=0) wreck.push({i,floor:f0,own:of0,t:game.t});
    if(wreck.length>200) wreck.splice(0,wreck.length-200); return r; };
}
/* ---------- utilisation ---------- */
{ const _u=useGadget2;
  useGadget2=function(e,id,wx,wy,ax,ay){
    switch(id){
      case 'anchortrap':{ const [tx,ty]=aimPoint(e,wx,wy,4*T), x=Math.floor(tx/T), y=Math.floor(ty/T); if(fl(x,y)<=0||wl(x,y)>0){ floatTxt(e.x,e.y-34,'Pose-le sur le sol ou un pont','#fde68a',14); return false; }
        traps.push({kind:'anchortrap',x:(x+.5)*T,y:(y+.5)*T,t:1e6,hp:6,age:0,team:e.team,owner:e,cd:0}); ring((x+.5)*T,(y+.5)*T,T*1.2,'#94a3b8',.4,true); chunks((x+.5)*T,(y+.5)*T,'#64748b',5); return true; }
      case 'parrotmsg':{ const o=nearestFoe(e,wx,wy,6*T); if(!o){ floatTxt(e.x,e.y-34,'Aucun ennemi près de la cible','#fde68a',14); return false; }
        const o2=ents.filter(q=>q.alive&&q.team!==e.team&&q!==o&&Math.hypot(q.x-o.x,q.y-o.y)<14*T).sort((a,b)=>Math.hypot(a.x-o.x,a.y-o.y)-Math.hypot(b.x-o.x,b.y-o.y))[0];
        for(const q of [o,o2]) if(q){ q.mark=8; q.markT=e.team+1; floatTxt(q.x,q.y-46,'🦜 MARQUÉ !','#4ade80',15); ring(q.x,q.y,T*1.3,'#4ade80',.5,true); }
        for(let k=0;k<12;k++) parts.push({x:e.x+(o.x-e.x)*k/12,y:e.y+(o.y-e.y)*k/12,z:30+Math.sin(k/12*Math.PI)*26,vx:0,vy:0,vz:0,life:.4+k*.04,max:.4+k*.04,col:'#86efac',size:4}); sfx('gadget',e.x,e.y); return true; }
      case 'magnet': e.magnet=10; floatTxt(e.x,e.y-42,'🧲 AIMANT !','#f87171',16); ring(e.x,e.y,T*8,'#f87171',.9); sfx('gadget',e.x,e.y); return true;
      case 'fishrod':{ const [tx,ty]=aimPoint(e,wx,wy,10*T), foe=nearestFoe(e,tx,ty,2.6*T);
        if(foe&&Math.hypot(foe.x-e.x,foe.y-e.y)<=11*T){ const order=['diamond','gold','silver','bronze'], k=order.find(q=>foe.res[q]>0), dd=Math.hypot(foe.x-e.x,foe.y-e.y)||1;
          foe.vx+=(e.x-foe.x)/dd*900; foe.vy+=(e.y-foe.y)/dd*900; foe.root=Math.max(foe.root,.6); foe.lastBy=e; foe.lastByT=5; // prise comme au lasso : l'ennemi est tiré vers toi
          if(k){ const cap={bronze:12,silver:5,gold:2,diamond:1}[k], n=Math.max(1,Math.min(cap,Math.ceil(foe.res[k]*.25))); foe.res[k]-=n; e.res[k]+=n; floatTxt(e.x,e.y-44,`🎣 +${n} ${RESNAME[k]}`,RESCOL[k],16); }
          floatTxt(foe.x,foe.y-40,'ACCROCHÉ !','#fca5a5',15); for(let q=0;q<10;q++) parts.push({x:e.x+(foe.x-e.x)*q/10,y:e.y+(foe.y-e.y)*q/10,z:20,vx:0,vy:0,vz:0,life:.3,max:.3,col:'#e0f2fe',size:2.5}); sfx('coin',e.x,e.y); return true; }
        const x=Math.floor(tx/T), y=Math.floor(ty/T); if(fl(x,y)>0){ floatTxt(e.x,e.y-34,'Rien à pêcher ici : vise un ennemi ou la mer','#fde68a',13); return false; }
        splash(tx,ty); ring(tx,ty,T*1.2,'#bae6fd',.8); floatTxt(tx,ty-30,'🎣 …','#bae6fd',16);
        delayed.push({t:1.4,fn:()=>{ if(!e.alive) return; fishCatch(e,tx,ty); }}); return true; }
      case 'mistbell': traps.push({kind:'mist',x:e.x,y:e.y,t:10,age:0,team:e.team,owner:e,cd:0}); ring(e.x,e.y,T*4.2,'#e2e8f0',.8,true); smoke(e.x,e.y,16,22,2); sfx('baa',e.x,e.y); return true;
      case 'bombraft':{ let best=null,bd=1e9; for(const o of ents){ if(!o.alive||o.team===e.team) continue; const d=Math.hypot(o.x-e.x,o.y-e.y); if(d<bd){ bd=d; best=o; } }
        let sx=e.x+Math.cos(e.ang)*2.5*T, sy=e.y+Math.sin(e.ang)*2.5*T; if(fl(Math.floor(sx/T),Math.floor(sy/T))>0){ let ok=false; for(let r=2;r<7&&!ok;r++)for(let a=0;a<6.28&&!ok;a+=.6){ const px=e.x+Math.cos(a)*r*T, py=e.y+Math.sin(a)*r*T; if(fl(Math.floor(px/T),Math.floor(py/T))===0){ sx=px; sy=py; ok=true; } } if(!ok){ floatTxt(e.x,e.y-34,'Il faut de l\'eau près de toi','#93c5fd',14); return false; } }
        rafts2.push({x:sx,y:sy,a:best?Math.atan2(best.y-sy,best.x-sx):e.ang,team:e.team,owner:e,t:16,hp:4,id:Math.random()}); splash(sx,sy); sfx('place',sx,sy); return true; }
      case 'repairhammer':{ const now=game.t; let n=0; const R=6*T;
        for(let k=wreck.length-1;k>=0&&n<40;k--){ const w=wreck[k]; if(now-w.t>45||w.own!==e.team&&!(TD[e.team]&&TD[w.own]===TD[e.team])) continue; const x=w.i%W, y=(w.i/W)|0; if(Math.hypot((x+.5)*T-e.x,(y+.5)*T-e.y)>R) continue;
          if(w.wall){ if(wallT[w.i]!==0||wallBlockedByEnt((x+.5)*T,(y+.5)*T)) continue; wallT[w.i]=w.wall; hpW[w.i]=BHP[w.wall]; ownW[w.i]=w.own; }
          else { if(floorT[w.i]!==0) continue; floorT[w.i]=w.floor; hpF[w.i]=BHP[w.floor]||10; ownF[w.i]=w.own; }
          pop[w.i]=1; burst((x+.5)*T,(y+.5)*T,'#fde68a',3,90,.4,3); wreck.splice(k,1); n++; }
        if(!n){ floatTxt(e.x,e.y-34,'Rien à réparer','#fde68a',14); return false; } ring(e.x,e.y,R,'#fbbf24',.6,true); floatTxt(e.x,e.y-42,`🔨 ${n} blocs rebâtis`,'#fde68a',16); sfx('buy'); return true; }
    }
    return _u(e,id,wx,wy,ax,ay);
  };
}
function fishCatch(e,x,y){ // prises plus modestes : la canne est réutilisable
  const r=Math.random()*100; let t=0; const roll=w=>(t+=w,r<t);
  if(roll(30)){ const n=Math.round(rnd(10,20)); e.res.bronze+=n; floatTxt(e.x,e.y-44,`🎣 +${n} Bronze`,RESCOL.bronze,16); }
  else if(roll(22)){ const n=Math.round(rnd(3,6)); e.res.silver+=n; floatTxt(e.x,e.y-44,`🎣 +${n} Argent`,RESCOL.silver,16); }
  else if(roll(6)){ const n=Math.round(rnd(1,2)); e.res.gold+=n; floatTxt(e.x,e.y-44,`🎣 +${n} Or`,RESCOL.gold,17); }
  else if(roll(2)){ e.res.diamond+=1; floatTxt(e.x,e.y-44,'🎣 +1 Diamant !','#22d3ee',18); announce('💎 UN DIAMANT AU BOUT DE LA LIGNE !','#67e8f9'); }
  else if(roll(17)){ floatTxt(e.x,e.y-44,'🎣 Une vieille botte…','#cbd5e1',15); }
  else if(roll(9)){ e.hp=Math.min(maxhp(e),e.hp+4); floatTxt(e.x,e.y-44,'🎣 Bouteille de rhum ! +4 ♥','#4ade80',16); }
  else if(roll(8)){ hurt(e,2,null,0,0); floatTxt(e.x,e.y-44,'🎣 UN CRABE ! Aïe !','#fca5a5',16); burst(e.x,e.y,'#f87171',8,120,.4,3); }
  else if(roll(3)){ sharks.push({x,y,ang:rnd(0,6.28),team:e.team,owner:e,t:10,cd:.8,wp:null,bite:0,ph:0}); floatTxt(x,y-34,'🦈 Un requin mord à l\'hameçon !','#93c5fd',16); announce('🦈 UN REQUIN ALLIÉ !','#93c5fd'); }
  else if(roll(2)){ const ids=[...BOT_USES].filter(k=>ITEMMAP[k]&&SHOPMAP[k]&&!PERM[k]&&!RELICS[k]); const g=ids[Math.floor(Math.random()*ids.length)]; e.am[g]=(e.am[g]||0)+1; floatTxt(e.x,e.y-44,`🎣 ${ITEMMAP[g].ico} ${ITEMMAP[g].n} !`,'#fde68a',16); msg(`🎣 ${e.name} pêche : ${ITEMMAP[g].n}`,'#fde68a'); }
  else { floatTxt(e.x,e.y-44,'🎣 Rien ne mord…','#cbd5e1',14); }
  splash(x,y); sfx('splash',x,y);
}
/* ---------- boucle : pièges, brume, aimant, radeaux, radar, marques ---------- */
function collectFrom(e,sp,anyBase){
  for(const r in sp.types){ const ty=sp.types[r]; if(ty.stock>0){ const n=Math.round(ty.stock*cv(e,'loot')*(1+.15*(e.up.loot||0))*(e.relics&&e.relics.r_coin?1.12:1)); e.res[r]+=n;
      if(e===player){ floatTxt(e.x,e.y-34,`+${ty.stock} ${RESNAME[r]}`,RESCOL[r],14); sfx('coin'); }
      const cx=(sp.x+.5)*T, cy=(sp.y+.5)*T; for(let k=0;k<3;k++) parts.push({x:cx,y:cy,z:12,vz:40,vx:(e.x-cx)*1.8,vy:(e.y-cy)*1.8,life:.55,max:.55,col:RESCOL[r],size:5}); ty.stock=0; } }
}
{ const _u=updateEvents;
  updateEvents=function(dt){
    _u(dt); if(game.state!=='play') return;
    for(const e of ents){ if(e.mark>0) e.mark-=dt; if(e.magnet>0&&e.alive){ e.magnet-=dt; if(Math.random()<dt*20) parts.push({x:e.x+rnd(-30,30),y:e.y+rnd(-30,30),z:14,vx:-0,vy:0,vz:0,life:.4,max:.4,col:'#fca5a5',size:3});
        for(const sp of spawners){ if(Math.hypot((sp.x+.5)*T-e.x,(sp.y+.5)*T-e.y)>8*T) continue; collectFrom(e,sp); }
        for(const d of drops){ if(d.h>0||d.t<=0) continue; if(Math.hypot(d.x-e.x,d.y-e.y)<8*T){ d.t=-1; e.res[d.kind]+=d.amt; sfx('coin',d.x,d.y); burst(d.x,d.y,RESCOL[d.kind],5,100,.4,3); } } } }
    // pièges à ancre
    for(const t of traps){ if(t.kind==='anchortrap'&&t.age>.8&&!t.sprung){ for(const o of ents){ if(!o.alive||o.team===t.team||o.z>12) continue; if(Math.hypot(o.x-t.x,o.y-t.y)<1.2*T){ t.sprung=true; t.t=.4; springAnchor(t,o); break; } } }
      if(t.kind==='mist'){ const R=4.2*T; for(const o of ents){ if(o.alive&&o.team===t.team&&Math.hypot(o.x-t.x,o.y-t.y)<R) o.cloak=Math.max(o.cloak,.5); }
        for(const p of projs){ if(p.life>0&&p.team!==t.team&&Math.hypot(p.x-t.x,p.y-t.y)<R){ p.life=0; burst(p.x,p.y,'#f1f5f9',4,70,.4,4); } }
        if(Math.random()<dt*14&&Q.level>=1) parts.push({x:t.x+rnd(-R,R)*.8,y:t.y+rnd(-R,R)*.8,z:rnd(10,40),vx:rnd(-8,8),vy:rnd(-8,8),vz:rnd(2,10),life:1.2,max:1.2,col:'#e2e8f0',size:9,smoke:true}); } }
    // radeaux-bombes
    for(const r of rafts2){ r.t-=dt; let tg=null,bd=1e9; for(const o of ents){ if(!o.alive||o.team===r.team) continue; const d=Math.hypot(o.x-r.x,o.y-r.y); if(d<bd){ bd=d; tg=o; } }
      if(tg){ let da=Math.atan2(tg.y-r.y,tg.x-r.x)-r.a; while(da>Math.PI) da-=6.283; while(da<-Math.PI) da+=6.283; r.a+=clamp(da,-1.2*dt,1.2*dt); }
      const nx=r.x+Math.cos(r.a)*78*dt, ny=r.y+Math.sin(r.a)*78*dt, land=fl(Math.floor(nx/T),Math.floor(ny/T))>0||wl(Math.floor(nx/T),Math.floor(ny/T))>0;
      if(!land){ r.x=nx; r.y=ny; if(Math.random()<dt*10) ripple(r.x,r.y,1,.7,.7,.5,0,2); }
      if(land||(tg&&bd<1.2*T)||r.t<=0){ r.dead=true; explode({x:r.x,y:r.y,team:r.team,owner:r.owner,kind:'bomb',R:2.5*T,dm:12,bd:1.5}); }
      for(const p of projs){ if(p.life>0&&p.team!==r.team&&p.dmg>0&&Math.hypot(p.x-r.x,p.y-r.y)<22){ r.hp-=p.dmg; p.life=p.pierce?p.life:0; burst(r.x,r.y,'#f59e0b',4,100,.3,3); if(r.hp<=0){ r.dead=true; splash(r.x,r.y); chunks(r.x,r.y,'#7c4a21',8); } } } }
    rafts2=rafts2.filter(r=>!r.dead);
    // radar de bord
    for(const t of TD){ const lv=t.ent.up.radar|0; if(!lv||!t.members.some(m=>m.alive)) continue; t.radarT-=dt; if(t.radarT<=0){ t.radarT=[30,22,15][lv-1]; const dur=[3,4,6][lv-1]; for(const m of t.members) if(m.alive) m.spy=Math.max(m.spy||0,dur); if(t.id===player.team) { floatTxt(player.x,player.y-58,'🗿 TOTEM','#7dd3fc',15); sfx('gadget'); } } }
    wreck=wreck.filter(w=>game.t-w.t<46);
  };
}
function springAnchor(t,o){
  const R=2.2*T; sfx('boom',t.x,t.y); ring(t.x,t.y,R,'#94a3b8',.6,true); chunks(t.x,t.y,'#64748b',10); splash(t.x,t.y); shake=Math.max(shake,4);
  for(const q of ents){ if(!q.alive||q.team===t.team||q.z>14) continue; if(Math.hypot(q.x-t.x,q.y-t.y)<R){ q.root=Math.max(q.root,2.5); q.slow=Math.max(q.slow,3); q.lastBy=t.owner; q.lastByT=5; floatTxt(q.x,q.y-40,'⚓ À L\'ANCRE !','#cbd5e1',16); } }
  for(let ty=Math.floor((t.y-R)/T);ty<=Math.floor((t.y+R)/T);ty++)for(let tx=Math.floor((t.x-R)/T);tx<=Math.floor((t.x+R)/T);tx++){ if(!inb(tx,ty)) continue; if(Math.hypot((tx+.5)*T-t.x,(ty+.5)*T-t.y)>R) continue; if(floorT[idx(tx,ty)]>=2) damageTile(tx,ty,70,t.owner,1); }
}
/* ---------- affichage : modèles et marques ---------- */
{ const _ct=createTrap, _ut=updateTrapM;
  createTrap=function(t){ if(t.kind==='anchortrap'){ const g=new THREE.Group(), gm=M('#94a3b8',{metalness:.5,roughness:.4}); const sh=new THREE.Mesh(GEO.box,gm); sh.scale.set(.07,.5,.07); sh.position.y=.28; g.add(sh); const rg=new THREE.Mesh(GEO.torus,gm); rg.scale.set(.1,.1,.1); rg.position.y=.58; g.add(rg); const st=new THREE.Mesh(GEO.box,gm); st.scale.set(.34,.06,.06); st.position.y=.45; g.add(st);
      for(const s of [-1,1]){ const a=new THREE.Mesh(GEO.box,gm); a.scale.set(.2,.06,.06); a.position.set(s*.12,.06,0); a.rotation.z=s*.7; g.add(a); } const ring=new THREE.Mesh(GEO.ring,new THREE.MeshBasicMaterial({color:TEAMS[Math.max(0,t.team)].col,transparent:true,opacity:.6,side:THREE.DoubleSide,depthWrite:false})); ring.scale.set(1.2,1,1.2); ring.position.y=.03; g.add(ring); g.userData={ring}; return g; }
    if(t.kind==='mist'){ const g=new THREE.Group(), mm=new THREE.MeshBasicMaterial({color:0xf1f5f9,transparent:true,opacity:.32,depthWrite:false}); const puffs=[]; for(let i=0;i<9;i++){ const p=new THREE.Mesh(GEO.sphere,mm); const a=i/9*6.283, r=i%3?1.6:0; p.position.set(Math.cos(a)*r,.9+(i%2)*.4,Math.sin(a)*r); p.scale.setScalar(1.3+(i%3)*.3); g.add(p); puffs.push(p); } g.userData={puffs}; return g; }
    return _ct(t); };
  updateTrapM=function(t,m){ if(t.kind==='anchortrap'){ m.position.set(t.x*U,0,t.y*U); m.userData.ring.material.opacity=.35+.25*Math.sin(game.t*4)*(t.age>.8?1:.3); return; }
    if(t.kind==='mist'){ m.position.set(t.x*U,0,t.y*U); const k=Math.min(1,t.age*2)*Math.min(1,t.t*2); m.userData.puffs.forEach((p,i)=>{ p.scale.setScalar((1.3+(i%3)*.3)*k); p.position.y=.9+(i%2)*.4+Math.sin(game.t*1.5+i)*.12; }); return; }
    _ut(t,m); };
}
const raftM=new Map();
{ const _r=render3d;
  render3d=function(dt){
    if(renderer&&scene){ const seen=new Set();
      for(const r of rafts2){ seen.add(r); let g=raftM.get(r); if(!g){ g=new THREE.Group(); const pl=new THREE.Mesh(GEO.box,M('#9a6b3a')); pl.scale.set(1.5,.1,1); pl.position.y=.05; g.add(pl); const ba=new THREE.Mesh(GEO.cyl,M('#7c2d12')); ba.scale.set(.32,.4,.32); ba.position.y=.35; g.add(ba); const fu=new THREE.Mesh(GEO.sphere0,new THREE.MeshBasicMaterial({color:0xfb923c})); fu.scale.setScalar(.1); fu.position.set(0,.8,0); g.add(fu); g.userData.fu=fu; scene.add(g); raftM.set(r,g); }
        g.position.set(r.x*U,-1.05+Math.sin(game.t*3+r.id*9)*.04,r.y*U); g.rotation.y=-r.a; g.rotation.z=Math.sin(game.t*2.4+r.id*7)*.08; g.userData.fu.visible=Math.floor(game.t*8)%2===0; }
      for(const [r,g] of raftM) if(!seen.has(r)){ scene.remove(g); raftM.delete(r); } }
    _r(dt); };
  // réseau : radeaux
  const _nc=netCommon; netCommon=function(){ const c=_nc(); if(rafts2.length) c.rb=rafts2.map(r=>[Math.round(r.x),Math.round(r.y),Math.round(r.a*100)/100,r.team,Math.round(r.id*1e4)]); return c; };
  const _na=netApplySnap; netApplySnap=function(m){ _na(m); const old=new Map(rafts2.map(r=>[r.id,r])); rafts2=(m.rb||[]).map(a=>{ const id=a[4]/1e4; const o=old.get(id)||{id}; o.x=a[0]; o.y=a[1]; o.a=a[2]; o.team=a[3]; return o; }); };
}
/* marques du perroquet : repère à l'écran et sur la mini-carte */
{ const _dh=drawHud;
  drawHud=function(){ _dh(); if(game.state==='menu'||!ctx||!player) return; ctx.save(); ctx.setTransform(DPR,0,0,DPR,0,0); ctx.textAlign='center';
    for(const o of ents){ if(!(o.mark>0)||!o.alive||o.markT!==player.team+1) continue; const s=w2s(o.x,o.y,o.z+70+Math.sin(game.t*6)*4); if(s[2]){ ctx.fillStyle='#4ade80'; ctx.strokeStyle='#064e3b'; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(s[0],s[1]+14); ctx.lineTo(s[0]-10,s[1]-4); ctx.lineTo(s[0]+10,s[1]-4); ctx.closePath(); ctx.stroke(); ctx.fill(); ctx.font='bold 12px '+FONT; ctx.lineWidth=4; ctx.strokeStyle='rgba(10,30,20,.9)'; ctx.strokeText('🦜 '+Math.ceil(o.mark)+' s',s[0],s[1]-10); ctx.fillStyle='#bbf7d0'; ctx.fillText('🦜 '+Math.ceil(o.mark)+' s',s[0],s[1]-10); } }
    const S=miniSize(), mx=VW-S-10, my=10; ctx.save(); rr(mx,my,S,S,8); ctx.clip(); for(const o of ents){ if(!(o.mark>0)||!o.alive||o.markT!==player.team+1) continue; const x=mx+o.x/T/W*S, y=my+o.y/T/H*S; ctx.strokeStyle='#4ade80'; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(x,y,4+(game.t*8%4),0,6.3); ctx.stroke(); ctx.fillStyle=TEAMS[o.team].col; ctx.beginPath(); ctx.arc(x,y,3,0,6.3); ctx.fill(); } ctx.restore();
    ctx.restore(); };
}
/* ---------- bots ---------- */
{ const _bg=botGadgets2;
  botGadgets2=function(b,foe,fd,nearCore,r,dt){ const has=id=>(b.am[id]||0)>0; if(b.cd.gad>0) return false;
    if(has('anchortrap')&&nearCore&&fd<6*T&&r<dt*.6) return useGadget(b,'anchortrap',foe.x,foe.y);
    if(has('fishrod')&&fd>2*T&&fd<9*T&&r<dt*.5) return useGadget(b,'fishrod',foe.x,foe.y);
    if(has('mistbell')&&b.hp<maxhp(b)*.55&&fd<8*T&&r<dt*.8) return useGadget(b,'mistbell',b.x,b.y);
    if(has('repairhammer')&&nearCore&&r<dt*.6&&wreck.length) return useGadget(b,'repairhammer',b.x,b.y);
    if(has('bombraft')&&fd>6*T&&r<dt*.3) return useGadget(b,'bombraft',foe.x,foe.y);
    return _bg(b,foe,fd,nearCore,r,dt); };
  if(typeof BOT_USES!=='undefined') for(const k of ['anchortrap','fishrod','mistbell','repairhammer','bombraft']) BOT_USES.add(k);
}

/* ---------- canne à pêche : objet permanent (recharge 12 s), butin plus modeste ---------- */
{ PERM.fishrod=PERM_DEF.fishrod={cd:12,keep:true,cost:{silver:16}};
  const it=SHOPMAP.fishrod; if(it){ it.cat='Outils';
    it.info=e=>e.own.fishrod?{name:'Canne à pêche',desc:'Déjà possédée (permanente)',cost:{},ok:false,tag:'PERMANENT'}:{name:'Canne à pêche (permanente)',desc:'Réutilisable (recharge 12 s). Sur un ennemi : il est tiré vers toi et tu lui voles un peu de ressources ; dans l\'eau : une petite prise (butin modeste, botte, crabe, requin allié…).',cost:{silver:16}};
    it.buy=e=>{ e.own.fishrod=true; if(e.isBot) e.am.fishrod=99; }; }
  TIPS2.fishrod='Lance la ligne (recharge 12 s) : accroche un ennemi (tiré vers toi + petit butin) ou pêche dans l\'eau'; }
