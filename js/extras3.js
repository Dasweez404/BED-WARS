'use strict';
/* =====================  OBJETS À FORT IMPACT TACTIQUE  =====================
   Espion (vision), radeau, ancre de rappel, plume (sauts en l'air), main leste (vol), tempête en bouteille, seiche collante */
const NEW3=[
  {id:'spy',n:'Perroquet espion',ico:'🔭',col:'#38bdf8'},{id:'raft',n:'Radeau gonflable',ico:'🏝️',col:'#fde047'},{id:'recall',n:'Ancre de rappel',ico:'📍',col:'#f87171'},
  {id:'plume',n:'Plume de perroquet',ico:'🪶',col:'#4ade80'},{id:'pickpocket',n:'Main leste',ico:'🖐️',col:'#fbbf24'},{id:'bottlestorm',n:'Tempête en bouteille',ico:'⚗️',col:'#a78bfa'},
  {id:'stickybomb',n:'Seiche collante',ico:'🦑',col:'#c084fc'}
];
for(const it of NEW3){ ITEMS.push(it); ITEMMAP[it.id]=it; }
Object.assign(TIPS2,{spy:'Révèle tous les ennemis sur la carte et l\'écran pendant 12 s (même invisibles)',raft:'Gonfle un radeau 3×3 sur l\'eau pendant 40 s',recall:'1er clic : pose une balise · 2e clic : retour instantané à la balise',
  plume:'3 sauts supplémentaires en l\'air pendant 25 s',pickpocket:'Vole des ressources à l\'ennemi tout proche',bottlestorm:'Une mini-tempête de foudre sur la zone visée pendant 5 s',stickybomb:'Colle une bombe sur un ennemi : explosion au bout de 3 s !'});
SHOP.push(
  gadItem('spy','Perroquet espion','Pendant 12 s, tous les ennemis sont révélés sur la mini-carte et par des flèches à l\'écran, même invisibles. Sans lui, la mini-carte ne montre que les ennemis proches.',{silver:16},1,'Outils'),
  gadItem('raft','Radeau gonflable','Gonfle un radeau 3×3 sur l\'eau devant toi pendant 40 s : pont express, îlot de combat…',{silver:12},1,'Outils'),
  gadItem('recall','Ancre de rappel','Un clic pose une balise, le suivant te ramène instantanément dessus (45 s). Parfait pour piller puis rentrer ! (2 utilisations)',{silver:10},2,'Outils'),
  gadItem('plume','Plume de perroquet','25 s : jusqu\'à 3 sauts supplémentaires en l\'air (monte vite, rattrape un saut manqué).',{silver:12},1,'Outils'),
  gadItem('pickpocket','Main leste','Vole une partie des ressources de l\'ennemi tout proche (devant toi, 2,4 cases).',{silver:12},1),
  gadItem('bottlestorm','Tempête en bouteille','Libère une mini-tempête : 6 éclairs s\'abattent autour de la zone visée pendant 5 s.',{gold:2},1),
  gadItem('stickybomb','Seiche collante','Colle une bombe sur l\'ennemi visé : elle explose 3 s plus tard. Il peut s\'en débarrasser en sautant à l\'eau… ou la refiler à un allié !',{silver:10},2)
);
SHOP.forEach(s=>SHOPMAP[s.id]=s);
let rafts=[];
const _ug3=useGadget2;
useGadget2=function(e,id,wx,wy,ax,ay){
  switch(id){
    case 'spy': e.spy=12; floatTxt(e.x,e.y-40,'PERROQUET ESPION !','#38bdf8',16); ring(e.x,e.y,T*8,'#38bdf8',.9); burst(e.x,e.y,'#bae6fd',16,200,.7,3); return true;
    case 'raft':{ const [cx,cy]=aimPoint(e,wx,wy,5.5*T), tx=Math.floor(cx/T), ty=Math.floor(cy/T); let n=0;
      for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){ const x=tx+dx,y=ty+dy; if(!inb(x,y)||floorT[idx(x,y)]!==0||wallT[idx(x,y)]) continue; const i=idx(x,y); floorT[i]=WOOD; hpF[i]=BHP[WOOD]; ownF[i]=e.team; pop[i]=1+n*.05; rafts.push({i,t:40}); n++; }
      if(!n){ floatTxt(e.x,e.y-34,'Vise la mer !','#93c5fd',14); return false; } splash((tx+.5)*T,(ty+.5)*T); ring((tx+.5)*T,(ty+.5)*T,T*2,'#fde047',.5,true); return true; }
    case 'recall':
      if(!e.recall||e.recall.t<=0){ e.recall={x:e.x,y:e.y,t:45}; floatTxt(e.x,e.y-40,'BALISE POSÉE','#f87171',15); ring(e.x,e.y,T*1.6,'#f87171',.6,true); burst(e.x,e.y,'#fecaca',14,150,.6,3); return true; }
      { const r=e.recall; ring(e.x,e.y,T*1.8,'#f87171',.5,true); burst(e.x,e.y,'#fecaca',18,200,.5,4); e.x=r.x; e.y=r.y; e.z=Math.max(e.z,0); e.vx=e.vy=0; e.grace=.5; e.lastSafe={x:r.x,y:r.y}; e.recall=null; floatTxt(e.x,e.y-40,'RAPPEL !','#f87171',17); ring(e.x,e.y,T*1.8,'#f87171',.5,true); burst(e.x,e.y,'#fecaca',18,200,.5,4); return true; }
    case 'plume': e.plume=3; e.plumeT=25; floatTxt(e.x,e.y-40,'PLUME ×3','#4ade80',16); burst(e.x,e.y,'#bbf7d0',14,140,.6,3); return true;
    case 'pickpocket':{ let tg=null,bd=2.4*T; for(const o of ents){ if(!o.alive||o.team===e.team) continue; const dx=o.x-e.x,dy=o.y-e.y,d=Math.hypot(dx,dy); if(d<bd&&(dx*ax+dy*ay)/(d||1)>.1){ bd=d; tg=o; } }
      if(!tg) { floatTxt(e.x,e.y-34,'Personne à portée','#fde68a',13); return false; }
      let got=[]; for(const k of ['bronze','silver','gold','diamond']){ const have=tg.res[k]; if(have<=0) continue; const take=Math.min(have,Math.max(1,Math.ceil(have*(k==='bronze'||k==='silver'?.35:.5)))); const t2=k==='diamond'||k==='gold'?Math.min(take,3):take; tg.res[k]-=t2; e.res[k]+=t2; got.push(`+${t2} ${RESNAME[k]}`); }
      if(!got.length){ floatTxt(tg.x,tg.y-34,'Poches vides !','#fde68a',14); return false; }
      floatTxt(e.x,e.y-44,got.join(' '),'#fbbf24',15); floatTxt(tg.x,tg.y-38,'DÉTROUSSÉ !','#fca5a5',15); burst(tg.x,tg.y-8,'#fbbf24',12,140,.5,3); sfx('coin',e.x,e.y); tg.lastBy=e; tg.lastByT=5; return true; }
    case 'bottlestorm':{ const [tx,ty]=aimPoint(e,wx,wy,9*T); ring(tx,ty,T*2.6,'#a78bfa',.9,true); floatTxt(tx,ty-40,'TEMPÊTE !','#c4b5fd',16);
      for(let k=0;k<6;k++) delayed.push({t:.5+k*.85,fn:()=>{ const x=tx+rnd(-2.4*T,2.4*T), y=ty+rnd(-2.4*T,2.4*T); ring(x,y,T*1.3,'#fde047',.35); bombs.push({x,y,tx:x,ty:y,fuse:.4,team:e.team,owner:e,kind:'bomb',R:1.5*T,dm:7,bd:.6,bolt:true,h:0}); }});
      return true; }
    case 'stickybomb':{ let tg=null,bd=3.2*T; for(const o of ents){ if(!o.alive||o.team===e.team) continue; const d=Math.hypot(o.x-wx,o.y-wy); if(d<bd&&Math.hypot(o.x-e.x,o.y-e.y)<10*T){ bd=d; tg=o; } }
      if(!tg) return false; tg.stickT=3; tg.stickBy=e; floatTxt(tg.x,tg.y-40,'BOMBE COLLÉE !','#c084fc',16); burst(tg.x,tg.y-8,'#e9d5ff',12,150,.5,3); sfx('gadget',tg.x,tg.y); return true; }
  }
  return _ug3(e,id,wx,wy,ax,ay);
};
/* minuteurs */
const _ue3=updateEvents;
updateEvents=function(dt){
  _ue3(dt);
  for(const r of rafts) r.t-=dt;
  for(const r of rafts) if(r.t<=0){ if(floorT[r.i]===WOOD&&hpF[r.i]>0){ const tx=r.i%W, ty=(r.i/W)|0; chunks((tx+.5)*T,(ty+.5)*T,BCOL[3][0],8); splash((tx+.5)*T,(ty+.5)*T); floorT[r.i]=0; ownF[r.i]=-1; } }
  rafts=rafts.filter(r=>r.t>0&&floorT[r.i]===WOOD);
  for(const e of ents){
    if(e.spy>0) e.spy-=dt;
    if(e.plumeT>0){ e.plumeT-=dt; if(e.plumeT<=0) e.plume=0; }
    if(e.recall){ e.recall.t-=dt; if(e.recall.t<=0) e.recall=null; else if(Math.random()<dt*1.2) ring(e.recall.x,e.recall.y,T*1.2,'#f87171',.5); }
    if(e.stickT>0){ if(!e.alive){ e.stickT=0; continue; } e.stickT-=dt; if(Math.random()<dt*7) { e.flash=.12; burst(e.x,e.y-14,'#e9d5ff',2,60,.3,3); }
      if(e.stickT<=0){ const by=e.stickBy; e.stickT=0; explode({x:e.x,y:e.y,team:by?by.team:-1,owner:by||null,kind:'bomb',R:2.1*T,dm:9,bd:.8}); } }
  }
};
/* bots */
const _bg3=botGadgets2;
botGadgets2=function(b,foe,fd,nearCore,r,dt){
  if(b.cd.gad>0) return false; const am=b.am, has=id=>(am[id]||0)>0;
  if(has('stickybomb')&&fd>2*T&&fd<9*T&&r<dt*.6) return useGadget(b,'stickybomb',foe.x,foe.y);
  if(has('pickpocket')&&fd<2.2*T&&r<dt*1.2) return useGadget(b,'pickpocket',foe.x,foe.y);
  if(has('bottlestorm')&&fd>3*T&&fd<9*T&&r<dt*.4) return useGadget(b,'bottlestorm',foe.x,foe.y);
  return _bg3(b,foe,fd,nearCore,r,dt);
};
const NEW3_BOT=['stickybomb','pickpocket','bottlestorm'];
BOT_OPTIONAL.push(...NEW3_BOT);
for(const id of NEW3_BOT) BOT_BUY.splice(BOT_BUY.length-2,0,[id,b=>b.ai.likes.has(id)&&(b.am[id]||0)<1]);
/* catégories pour l'animation en main */
H_THROW.push('stickybomb','bottlestorm','pickpocket'); H_BUFF.push('spy','plume','recall'); H_PLACE.push('raft');
