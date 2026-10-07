'use strict';
/* =====================  BARQUE + OBJETS RIGOLOS  ===================== */

/* ---------- la barque ---------- */
let boats=[];
const BOAT_HP=8;
function boatFree(x,y){
  for(const [dx,dy] of [[0,0],[15,0],[-15,0],[0,15],[0,-15]]){ const tx=Math.floor((x+dx)/T), ty=Math.floor((y+dy)/T); if(!inb(tx,ty)||fl(tx,ty)>0||wl(tx,ty)>0) return false; }
  return true;
}
function hitBoat(b,dmg,src){
  if(b.hp<=0) return; b.hp-=dmg; b.flash=.2; burst(b.x,b.y-6,'#b98a52',5,110,.4,3); sfx('hit',b.x,b.y);
  if(b.hp<=0) boatBreak(b,src);
}
function hitBoats(cx,cy,R,dm,team){ for(const b of boats){ if(b.team===team||b.hp<=0) continue; const d=Math.hypot(b.x-cx,b.y-cy); if(d<R*1.1) hitBoat(b,dm*(1-d/(R*1.3)),null); } }
function boatBreak(b,src){
  splash(b.x,b.y); chunks(b.x,b.y,'#b98a52',14); smoke(b.x,b.y,6,6,.8); sfx('break',b.x,b.y);
  if(b.rider){ const r=b.rider; r.riding=null; r.vz=260; r.grace=.9; floatTxt(r.x,r.y-40,'BARQUE COULÉE !','#fca5a5',16); b.rider=null; }
  b.hp=-1;
}
function updateBoats(dt){
  for(const b of boats){
    b.flash=Math.max(0,(b.flash||0)-dt);
    if(b.rider&&(!b.rider.alive||b.rider.riding!==b)){ if(b.rider.riding===b) b.rider.riding=null; b.rider=null; }
    let tx=0,ty=0;
    if(b.rider){ const m=Math.hypot(b.rider.ix,b.rider.iy); if(m>.05){ tx=b.rider.ix/m*190; ty=b.rider.iy/m*190; } }
    const k=Math.min(1,dt*(b.rider?3.5:1.5)); b.vx+=(tx-b.vx)*k; b.vy+=(ty-b.vy)*k;
    let nx=b.x+b.vx*dt, ny=b.y+b.vy*dt;
    if(boatFree(nx,b.y)) b.x=nx; else b.vx*=-.25;
    if(boatFree(b.x,ny)) b.y=ny; else b.vy*=-.25;
    const sp=Math.hypot(b.vx,b.vy);
    if(sp>12){ let da=Math.atan2(b.vy,b.vx)-b.ang; while(da>Math.PI) da-=6.283; while(da<-Math.PI) da+=6.283; b.ang+=da*Math.min(1,dt*6); if(Math.random()<dt*14) parts.push({x:b.x-Math.cos(b.ang)*18,y:b.y-Math.sin(b.ang)*18,z:2,vz:rnd(5,20),vx:rnd(-12,12),vy:rnd(-12,12),life:.5,max:.5,col:'#ffffff',size:3}); }
    if(b.rider){ const r=b.rider; r.x=b.x; r.y=b.y; r.z=0; r.vx=r.vy=0; }
  }
  boats=boats.filter(b=>b.hp>0);
}
function boatInteract(e){
  if(!e.alive||e.frozen>0||e.bubble>0) return false;
  if(e.riding){
    const b=e.riding; let best=null,bd=1e9;
    for(let dy=-3;dy<=3;dy++)for(let dx=-3;dx<=3;dx++){ const tx=Math.floor(b.x/T)+dx, ty=Math.floor(b.y/T)+dy; if(fl(tx,ty)>0&&wl(tx,ty)===0){ const d=Math.hypot((tx+.5)*T-b.x,(ty+.5)*T-b.y); if(d<bd){bd=d;best=[tx,ty];} } }
    if(!best||bd>2.7*T){ floatTxt(e.x,e.y-44,'Pas de terre à portée !','#fde68a',14); return true; }
    b.rider=null; e.riding=null; e.x=(best[0]+.5)*T; e.y=(best[1]+.5)*T; e.vx=e.vy=0; e.vz=200; e.grace=.3; sfx('jump',e.x,e.y); return true;
  }
  let bb=null,bd=3*T; for(const b of boats){ if(b.rider||b.hp<=0) continue; const d=Math.hypot(b.x-e.x,b.y-e.y); if(d<bd){bd=d;bb=b;} }
  if(!bb) return false;
  if(bb.team!==e.team){ floatTxt(bb.x,bb.y-44,'BARQUE VOLÉE !','#fca5a5',16); msg(`${e.name} a volé une barque !`,TEAMS[e.team].light); }
  else floatTxt(bb.x,bb.y-44,'E : descendre','#fde68a',14);
  bb.team=e.team; bb.owner=e; bb.rider=e; e.riding=bb; e.x=bb.x; e.y=bb.y; e.z=0; e.vz=0; e.vx=e.vy=0; sfx('place',e.x,e.y); ring(bb.x,bb.y,T*1.2,TEAMS[e.team].col,.3,true);
  return true;
}
function actBoat(){ // touche E : monter / descendre (sinon : boutique)
  const me=player; if(!me||!me.alive||game.state!=='play') return false;
  if(NETCLIENT){ const near=me.riding||boats.some(b=>!b.rider&&Math.hypot(b.x-me.x,b.y-me.y)<3*T); if(near){ netSend({t:'act',a:'boat'}); return true; } return false; }
  return boatInteract(me);
}

/* ---------- objets rigolos ---------- */
Object.assign(GUNS,{
  pogo:{n:'Canon à ressort',mag:4,cd:.5,reload:1.8,sp:700,life:.7,dmg:1,kb:320,lift:520,col:'#f472b6',pel:1,spread:.02,bloom:0,bmax:0,rec:60},
  popcorn:{n:'Canon à pop-corn',mag:20,cd:.18,reload:1.8,sp:520,life:.45,dmg:.7,kb:90,col:'#fff3c4',pel:5,spread:.4,bloom:0,bmax:0,rec:30},
  rubberchicken:{n:'Poulet en caoutchouc',mag:1,cd:.1,reload:1.4,sp:520,life:1.4,dmg:2.5,kb:520,col:'#fde047',pel:1,spread:0,bloom:0,bmax:0,kind:'boomerang',pierce:true,rec:0}
});
const NEW2=[
  {id:'boat',n:'Barque',ico:'⛵',col:'#b98a52'},{id:'bananarow',n:'Tapis de bananes',ico:'🍌',col:'#fde047'},{id:'pogo',n:'Canon à ressort',ico:'🪀',col:'#f472b6'},
  {id:'laughgas',n:'Gaz hilarant',ico:'🤣',col:'#a3e635'},{id:'popcorn',n:'Canon à pop-corn',ico:'🍿',col:'#fff3c4'},{id:'glide',n:'Parapluie planeur',ico:'☂️',col:'#60a5fa'},
  {id:'cannonman',n:'Homme-canon',ico:'🤡',col:'#f97316'},{id:'sneeze',n:'Poivre à éternuer',ico:'🤧',col:'#d6b27a'},{id:'shrink',n:'Potion rétrécissante',ico:'🔬',col:'#c084fc'},
  {id:'giant',n:'Potion géante',ico:'🧌',col:'#4ade80'},{id:'rubberchicken',n:'Poulet en caoutchouc',ico:'🐔',col:'#fde047'}
];
for(const it of NEW2){ ITEMS.push(it); ITEMMAP[it.id]=it; }
Object.assign(TIPS2,{boat:'Pose une barque sur l\'eau · E : monter / descendre · fragile, volable !',bananarow:'Trois peaux de banane à la suite',pogo:'Catapulte l\'ennemi touché en l\'air',laughgas:'Les ennemis proches glissent de rire',popcorn:'Une rafale de pop-corn qui repousse',
  glide:'Plane doucement pendant 9 s (plus de dégâts de chute)',cannonman:'Tu t\'envoies toi-même très loin !',sneeze:'Les ennemis devant toi éternuent et sont immobilisés',shrink:'Petit, rapide… mais fragile (10 s)',giant:'Grand et costaud : +30 % de dégâts, plus lent (10 s)',rubberchicken:'Un poulet-boomerang qui repousse très fort'});
SHOP.push(
  gadItem('boat','Barque','Pose une barque sur l\'eau (E pour monter/descendre). Peu de vie : volable et facile à couler.',{silver:14},1),
  gadItem('bananarow','Tapis de bananes','Trois peaux de banane alignées devant toi.',{bronze:40},1,'Défense'),
  gunItem('pogo','Canon à ressort','Catapulte l\'ennemi touché en l\'air. Hilarant au bord du vide !',{silver:14}),
  gadItem('laughgas','Gaz hilarant','Les ennemis proches glissent en riant pendant 2 s.',{silver:12},1),
  gunItem('popcorn','Canon à pop-corn','Une rafale de pop-corn : peu de dégâts, beaucoup de recul.',{silver:12}),
  gadItem('glide','Parapluie planeur','Plane doucement 9 s ; annule les dégâts de chute.',{silver:10},1),
  gadItem('cannonman','Homme-canon','Tu te propulses très loin (ponts, îlots…). Atterrissage non garanti !',{silver:14},1),
  gadItem('sneeze','Poivre à éternuer','Les ennemis devant toi éternuent et restent bloqués 1 s.',{silver:10},1),
  gadItem('shrink','Potion rétrécissante','10 s : tu es minuscule et rapide, mais plus fragile.',{silver:10},1),
  gadItem('giant','Potion géante','10 s : tu es géant, +30 % de dégâts et −15 % de dégâts reçus, mais plus lent.',{silver:12},1),
  gunItem('rubberchicken','Poulet en caoutchouc','Un poulet-boomerang qui repousse très fort.',{silver:12})
);
SHOP.forEach(s=>SHOPMAP[s.id]=s);
const _ug2=useGadget2;
useGadget2=function(e,id,wx,wy,ax,ay){
  switch(id){
    case 'boat':{ let tx=0,ty=0,ok=false; for(let r=2.2*T;r>=.9*T;r-=.25*T){ const [qx,qy]=aimPoint(e,wx,wy,r); if(boatFree(qx,qy)){ tx=qx; ty=qy; ok=true; break; } } if(!ok){ floatTxt(e.x,e.y-34,'Va au bord de l\'eau !','#93c5fd',14); return false; }
      boats.push({x:tx,y:ty,ang:e.ang,vx:0,vy:0,hp:BOAT_HP,max:BOAT_HP,team:e.team,owner:e,rider:null,flash:0}); splash(tx,ty); ring(tx,ty,T*1.3,'#b98a52',.5,true); floatTxt(tx,ty-40,'E : monter','#fde68a',14); return true; }
    case 'bananarow':{ let n=0; for(let k=2;k<=4;k++){ const x=e.x+ax*k*T*.8, y=e.y+ay*k*T*.8, tx=Math.floor(x/T), ty=Math.floor(y/T); if(fl(tx,ty)===0||wl(tx,ty)>0) continue; traps.push({kind:'banana',x:(tx+.5)*T,y:(ty+.5)*T,t:1e6,hp:3,age:0,team:e.team,owner:e}); n++; } return n>0; }
    case 'laughgas':{ ring(e.x,e.y,T*4,'#a3e635',.6,true); burst(e.x,e.y,'#d9f99d',26,220,.8,4); for(const o of ents){ if(!o.alive||o.team===e.team||Math.hypot(o.x-e.x,o.y-e.y)>4*T) continue; const a=rnd(0,6.28); o.slip=2.2; o.sdx=Math.cos(a); o.sdy=Math.sin(a); floatTxt(o.x,o.y-36,'MDR !','#d9f99d',16); } return true; }
    case 'glide': e.glide=9; floatTxt(e.x,e.y-36,'PLANEUR !','#93c5fd',15); burst(e.x,e.y,'#bfdbfe',12,120,.6,3); return true;
    case 'cannonman': e.vx+=ax*2000; e.vy+=ay*2000; e.vz=480; e.grace=1.4; e.squash=.5; smoke(e.x,e.y,10,10,.9); burst(e.x,e.y,'#fb923c',22,260,.5,4); ring(e.x,e.y,T*1.6,'#f97316',.4,true); floatTxt(e.x,e.y-40,'BOUM !','#fb923c',18); shake=Math.max(shake,e===player?9:3); return true;
    case 'sneeze':{ ring(e.x+ax*T*2,e.y+ay*T*2,T*2.2,'#d6b27a',.5,true); burst(e.x+ax*T,e.y+ay*T,'#e7d3a8',18,200,.6,3); let n=0; for(const o of ents){ if(!o.alive||o.team===e.team) continue; const dx=o.x-e.x,dy=o.y-e.y,d=Math.hypot(dx,dy); if(d>4.2*T||(dx*ax+dy*ay)/(d||1)<.2) continue; o.root=1.1; o.frozen=Math.max(o.frozen,.0); floatTxt(o.x,o.y-36,'ATCHOUM !','#e7d3a8',16); n++; } return true; }
    case 'shrink': e.tiny=10; e.giant=0; floatTxt(e.x,e.y-36,'MINUSCULE !','#c084fc',15); burst(e.x,e.y,'#e9d5ff',12,120,.5,3); return true;
    case 'giant': e.giant=10; e.tiny=0; floatTxt(e.x,e.y-40,'GÉANT !','#4ade80',17); ring(e.x,e.y,T*2,'#4ade80',.5,true); burst(e.x,e.y,'#bbf7d0',16,160,.6,4); return true;
  }
  return _ug2(e,id,wx,wy,ax,ay);
};
/* catégorie « Outils » : déplacements et utilitaires */
for(const id of ['grap','jet','dash','trampo','tp','bridge','bridge2','boat','glide','cannonman','springs','haste','cloak','smokebomb','shrink','giant','swap','lasso']) if(SHOPMAP[id]) SHOPMAP[id].cat='Outils';
/* bots */
BOT_RANGED.push(['pogo',2,7],['popcorn',1,5],['rubberchicken',2,7]);
const NEW2_IDS=NEW2.map(i=>i.id).filter(id=>id!=='boat');
BOT_OPTIONAL.push(...NEW2_IDS);
for(const id of NEW2_IDS){ const g=GUNS[id]; BOT_BUY.splice(BOT_BUY.length-2,0,[id,b=>b.ai.likes.has(id)&&(g?!b.own[id]:(b.am[id]||0)<1)]); }
const _bg2=botGadgets2;
botGadgets2=function(b,foe,fd,nearCore,r,dt){
  if(b.cd.gad>0) return false; const am=b.am, has=id=>(am[id]||0)>0;
  if(has('laughgas')&&fd<3.6*T&&r<dt*.6) return useGadget(b,'laughgas',b.x,b.y);
  if(has('sneeze')&&fd<3.6*T&&r<dt*.6) return useGadget(b,'sneeze',foe.x,foe.y);
  if(has('giant')&&b.giant<=0&&fd<6*T&&r<dt*.5) return useGadget(b,'giant',b.x,b.y);
  if(has('shrink')&&b.tiny<=0&&b.giant<=0&&fd<5*T&&b.hp>maxhp(b)*.7&&r<dt*.3) return useGadget(b,'shrink',b.x,b.y);
  if(has('bananarow')&&fd>2*T&&fd<6*T&&r<dt*.4) return useGadget(b,'bananarow',foe.x,foe.y);
  return _bg2(b,foe,fd,nearCore,r,dt);
};
