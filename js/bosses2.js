'use strict';
/* =====================  5 NOUVEAUX BOSS  =====================
   🐍 Serpent de mer · 🌋 Titan de lave · 🦅 Roc géant · ⚓ Gardien des abysses · 🧟 Capitaine maudit */
Object.assign(BOSSES,{
  serpent:{n:'SERPENT DE MER',ico:'🐍',col:'#34d399',txt:'Un serpent de mer serpente entre les îles : seule sa TÊTE est vulnérable'},
  titan:{n:'TITAN DE LAVE',ico:'🌋',col:'#fb923c',txt:'Un titan de lave se dresse sur un îlot et bombarde la carte'},
  roc:{n:'ROC GÉANT',ico:'🦅',col:'#fbbf24',txt:'Un roc géant fond sur les pirates pour les emporter : fais-lui lâcher prise !'},
  guardian:{n:'GARDIEN DES ABYSSES',ico:'⚓',col:'#38bdf8',txt:'Le gardien des abysses pilonne les ponts : frappe-le quand son cœur s\'ouvre !'},
  captain:{n:'CAPITAINE MAUDIT',ico:'🧟',col:'#a3e635',txt:'Le capitaine maudit marche sur les ponts avec ses squelettes'}
});
const ALLK=['kraken','mega','ghost','crab','serpent','titan','roc','guardian','captain'], NEWK=new Set(['serpent','titan','roc','guardian','captain']);
const BRAD={kraken:1.9,mega:1.7,ghost:3.1,crab:1.8,serpent:1.5,titan:2.2,roc:2.4,guardian:2.0,captain:1.5};
function bossPickKind(){ if(BOSS.fixK){ const k=BOSS.fixK; BOSS.fixK=null; return k; } const v=game.opts.boss|0; if(v>=1&&v<=9) return ALLK[v-1]; const l=ALLK.filter(k=>k!==BOSS.lastKind); return l[Math.floor(Math.random()*l.length)]; }
function waterFree(x,y,r){ for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++) if(fl(Math.floor(x)+dx,Math.floor(y)+dy)>0) return false; return true; }
function bossStartNew(k){
  const hum=Math.min(3,ents.filter(e=>!e.isBot).length); let x=0,y=0,ok=false;
  if(k==='captain'){ x=(CX+.5)*T; y=(CY-2.5)*T; ok=true; }
  else if(k==='roc'){ const a=rnd(0,6.283); BOSS.orb=a; x=(CX+.5+Math.cos(a)*18)*T; y=(CY+.5+Math.sin(a)*18)*T; ok=true; }
  else if(k==='titan'){ const ls=ISLANDS.filter(il=>!il.ship&&il.reg===5); if(ls.length){ const il=ls[Math.floor(Math.random()*ls.length)]; x=(il.x+.5)*T; y=(il.y+.5)*T; ok=true; } }
  else for(let q=0;q<90&&!ok;q++){ const a=rnd(0,6.283), r=rnd(k==='serpent'?12:8,k==='serpent'?20:15), px=CX+.5+Math.cos(a)*r, py=CY+.5+Math.sin(a)*r; if(waterFree(px,py,3)){ x=px*T; y=py*T; ok=true; } }
  if(!ok){ BOSS.next=game.t+20; return; }
  const hp={serpent:140+28*hum,titan:210+42*hum,roc:190+38*hum,guardian:200+40*hum,captain:190+38*hum}[k];
  BOSS.on=true; BOSS.kind=k; BOSS.lastKind=k; BOSS.x=x; BOSS.y=y; BOSS.max=BOSS.hp=hp; BOSS.rad=BRAD[k]*T; BOSS.cd=2.4; BOSS.slams=[]; BOSS.dmg={}; BOSS.ph=0; BOSS.st='cruise'; BOSS.stT=rnd(3,5); BOSS.aux=[]; BOSS.hitSet=null; BOSS.a=rnd(0,6.28); BOSS.minions=[]; BOSS.trail=[]; BOSS.carry=null; BOSS.carryDmg=0; BOSS.open=false;
  if(k==='serpent'){ for(let i=0;i<150;i++) BOSS.trail.push([x-Math.cos(BOSS.a)*i*4,y-Math.sin(BOSS.a)*i*4]); }
  if(k==='guardian'){ BOSS.st='closed'; BOSS.stT=6; }
  if(k==='roc'){ BOSS.st='fly'; BOSS.stT=7; }
  const B=BOSSES[k]; announce(B.ico+' '+B.n+' ÉMERGE !',B.col); msg(B.ico+' '+B.txt+' : frappe-le pour gagner une récompense !',B.col); flashScreen(B.col,.25); JUICE.kick(.8); ring(BOSS.x,BOSS.y,T*4,B.col,1.2,true); sfx('boom',BOSS.x,BOSS.y);
}
{ const _bs=bossStart; bossStart=function(){ BOSS.fixK=bossPickKind(); if(NEWK.has(BOSS.fixK)){ const k=BOSS.fixK; BOSS.fixK=null; bossStartNew(k); return; } _bs(); BOSS.fixK=null; }; }
/* ---------- comportements ---------- */
function bossSlamAcid(sx,sy,t){ BOSS.slams.push({x:sx,y:sy,t,acid:true}); ring(sx,sy,T*1.7,'#34d399',t); }
function lavaHit(x,y,R,dm,burn){ sfx('boom',x,y); ring(x,y,T*R,'#fb923c',.5,true); burst(x,y,'#fb923c',16,220,.7,4); shake=Math.max(shake,4);
  for(const o of ents){ if(!o.alive) continue; const d=Math.hypot(o.x-x,o.y-y); if(d<R*T&&o.z<26){ o.bossKill=true; hurt(o,dm,null,(o.x-x)/(d||1)*420,(o.y-y)/(d||1)*420); o.bossKill=false; o.burn=Math.max(o.burn,burn); o.burnBy=null; } } blastTiles(x,y,(R+.1)*T,24,null,-1); }
function bossUpdateNew(dt){
  const K=BOSS.kind; BOSS.ph+=dt; BOSS.flash=Math.max(0,BOSS.flash-dt); const rage=BOSS.hp<BOSS.max*.5;
  if(K==='serpent'){
    const [tg]=bossNearest(36*T); const want=tg?Math.atan2(tg.y-BOSS.y,tg.x-BOSS.x)+Math.sin(BOSS.ph*1.8)*.5:BOSS.a+Math.sin(BOSS.ph)*.4; let da=want-BOSS.a; while(da>Math.PI) da-=6.283; while(da<-Math.PI) da+=6.283; BOSS.a+=clamp(da,-1.5*dt,1.5*dt);
    const sp=(rage?108:86)*dt, nx=BOSS.x+Math.cos(BOSS.a)*sp, ny=BOSS.y+Math.sin(BOSS.a)*sp; if(!bossBlocked(nx,ny)&&waterFree(nx/T,ny/T,1)){ BOSS.x=nx; BOSS.y=ny; } else BOSS.a+=2.4*dt;
    const tr=BOSS.trail, l=tr[0]; if(Math.hypot(BOSS.x-l[0],BOSS.y-l[1])>=4){ tr.unshift([BOSS.x,BOSS.y]); if(tr.length>150) tr.pop(); }
    const segs=[]; for(let i=1;i<=10;i++){ const p=tr[Math.min(tr.length-1,i*8)]; segs.push(p[0],p[1]); } BOSS.aux=segs.map(v=>Math.round(v));
    for(const o of ents){ if(!o.alive||o.z>=26||(o.sTime||0)>game.t) continue; let hit=Math.hypot(o.x-BOSS.x,o.y-BOSS.y)<1.3*T; for(let i=0;i<segs.length&&!hit;i+=2) if(Math.hypot(o.x-segs[i],o.y-segs[i+1])<.85*T) hit=true; if(hit){ o.sTime=game.t+.9; o.bossKill=true; hurt(o,3,null,(o.x-BOSS.x)*3,(o.y-BOSS.y)*3); o.bossKill=false; o.vz=Math.max(o.vz,240); } }
    BOSS.cd-=dt; if(BOSS.cd<=0&&tg&&Math.hypot(tg.x-BOSS.x,tg.y-BOSS.y)<20*T){ BOSS.cd=rage?2.2:3.4; bossSlamAcid(tg.x+rnd(-10,10),tg.y+rnd(-10,10),1.2); if(rage) bossSlamAcid(tg.x+rnd(-80,80),tg.y+rnd(-80,80),1.5); }
    for(const s of BOSS.slams){ s.t-=dt; if(s.t<=0){ lavaHit(s.x,s.y,1.6,4,3); ring(s.x,s.y,T*1.6,'#34d399',.6,true); } }
  }
  else if(K==='titan'){
    BOSS.cd-=dt; BOSS.stT-=dt; if(BOSS.cd<=0){ BOSS.cd=rage?1.6:2.5; const pool=ents.filter(o=>o.alive&&Math.hypot(o.x-BOSS.x,o.y-BOSS.y)<24*T); const n=rage?4:3;
      for(let i=0;i<n;i++){ const t2=pool.length?pool[Math.floor(Math.random()*pool.length)]:null, x=(t2?t2.x:BOSS.x+rnd(-12,12)*T)+rnd(-1.8,1.8)*T, y=(t2?t2.y:BOSS.y+rnd(-12,12)*T)+rnd(-1.8,1.8)*T; BOSS.slams.push({x,y,t:1.1+i*.2,lava:true}); ring(x,y,T*1.7,'#f97316',1.1+i*.2); } sfx('whoosh',BOSS.x,BOSS.y); }
    for(const s of BOSS.slams){ s.t-=dt; if(s.t<=0) lavaHit(s.x,s.y,1.7,6,2.5); }
    if(BOSS.aux.length){ BOSS.aux[0]+=dt*(7*T/2); const r=BOSS.aux[0]; for(const o of ents){ if(!o.alive||o.z>=20||(BOSS.hitSet&&BOSS.hitSet.has(o))) continue; const d=Math.hypot(o.x-BOSS.x,o.y-BOSS.y); if(Math.abs(d-r)<.6*T){ (BOSS.hitSet=BOSS.hitSet||new Set()).add(o); o.bossKill=true; hurt(o,5,null,(o.x-BOSS.x)/(d||1)*480,(o.y-BOSS.y)/(d||1)*480); o.bossKill=false; o.burn=Math.max(o.burn,2.5); o.vz=Math.max(o.vz,260); } } if(r>10*T){ BOSS.aux=[]; BOSS.hitSet=null; } }
    else if(BOSS.stT<=0){ BOSS.stT=rage?9:13; BOSS.aux=[2*T]; BOSS.hitSet=new Set(); sfx('boom',BOSS.x,BOSS.y); shake=Math.max(shake,7); ring(BOSS.x,BOSS.y,T*10,'#fb923c',2); floatTxt(BOSS.x,BOSS.y-70,'ÉRUPTION ! SAUTE !','#fed7aa',18); }
  }
  else if(K==='roc'){
    BOSS.stT-=dt; const cx=(CX+.5)*T, cy=(CY+.5)*T;
    if(BOSS.st==='fly'){ BOSS.orb+=dt*(rage?.26:.19); const tx=cx+Math.cos(BOSS.orb)*18*T, ty=cy+Math.sin(BOSS.orb)*18*T; BOSS.a=BOSS.orb+Math.PI/2; BOSS.x+=(tx-BOSS.x)*Math.min(1,dt*2.2); BOSS.y+=(ty-BOSS.y)*Math.min(1,dt*2.2); BOSS.aux=[0,0];
      if(BOSS.stT<=0){ const [tg]=bossNearest(40*T); if(tg){ BOSS.st='tele'; BOSS.stT=1.4; BOSS.tx=tg.x; BOSS.ty=tg.y; BOSS.aux=[0,0,Math.round(tg.x),Math.round(tg.y)]; ring(tg.x,tg.y,T*1.8,'#fbbf24',1.4); floatTxt(tg.x,tg.y-50,'🦅 ATTENTION !','#fde68a',17); sfx('whoosh',tg.x,tg.y); } else BOSS.stT=2; } }
    else if(BOSS.st==='tele'){ BOSS.a=Math.atan2(BOSS.ty-BOSS.y,BOSS.tx-BOSS.x); BOSS.x+=(BOSS.tx-BOSS.x)*Math.min(1,dt*.9); BOSS.y+=(BOSS.ty-BOSS.y)*Math.min(1,dt*.9); BOSS.aux=[0,0,Math.round(BOSS.tx),Math.round(BOSS.ty)]; if(BOSS.stT<=0){ BOSS.st='dive'; BOSS.stT=.5; } }
    else if(BOSS.st==='dive'){ BOSS.x+=(BOSS.tx-BOSS.x)*Math.min(1,dt*7); BOSS.y+=(BOSS.ty-BOSS.y)*Math.min(1,dt*7); BOSS.aux=[0,1];
      if(BOSS.stT<=0){ let v=null,bd=1.7*T; for(const o of ents){ if(!o.alive||o.z>30) continue; const d=Math.hypot(o.x-BOSS.x,o.y-BOSS.y); if(d<bd){ bd=d; v=o; } }
        if(v){ BOSS.carry=v; BOSS.carryDmg=0; v.grabbed=true; BOSS.st='carry'; BOSS.stT=3; v.bossKill=true; hurt(v,3,null,0,0); v.bossKill=false; floatTxt(v.x,v.y-50,'🦅 EMPORTÉ !','#fde68a',17); announce(v.name+' EST EMPORTÉ !','#fbbf24'); sfx('hit',v.x,v.y); }
        else { BOSS.st='recover'; BOSS.stT=1.5; floatTxt(BOSS.x,BOSS.y-60,'🦅 raté !','#fde68a',15); } } }
    else if(BOSS.st==='carry'){ const v=BOSS.carry; const dx=BOSS.x-cx, dy=BOSS.y-cy, d=Math.hypot(dx,dy)||1; BOSS.x+=dx/d*150*dt; BOSS.y+=dy/d*150*dt; BOSS.a=Math.atan2(dy,dx); BOSS.aux=[ents.indexOf(v),0];
      if(v&&v.alive){ v.x=BOSS.x; v.y=BOSS.y; v.z=72; v.vz=0; v.vx=v.vy=0; v.grace=1; v.root=.3; v.tkH=-999; }
      if(BOSS.stT<=0||BOSS.carryDmg>=28||!v||!v.alive){ bossRelease(BOSS.carryDmg>=28); BOSS.st='fly'; BOSS.stT=rage?5:8; } }
    else if(BOSS.st==='recover'){ BOSS.aux=[0,1]; BOSS.x+=(cx+Math.cos(BOSS.orb)*18*T-BOSS.x)*Math.min(1,dt*.8); BOSS.y+=(cy+Math.sin(BOSS.orb)*18*T-BOSS.y)*Math.min(1,dt*.8); if(BOSS.stT<=0){ BOSS.st='fly'; BOSS.stT=rage?5:8; } }
  }
  else if(K==='guardian'){
    BOSS.stT-=dt; BOSS.open=BOSS.st==='open'; BOSS.aux=[BOSS.st==='open'?1:BOSS.st==='warn'?2:0];
    if(BOSS.st==='closed'&&BOSS.stT<=0){ BOSS.st='warn'; BOSS.stT=1.4; floatTxt(BOSS.x,BOSS.y-70,'⚓ le cœur s\'ouvre…','#7dd3fc',16); sfx('whoosh',BOSS.x,BOSS.y); }
    else if(BOSS.st==='warn'&&BOSS.stT<=0){ BOSS.st='open'; BOSS.stT=rage?4:5.2; ring(BOSS.x,BOSS.y,T*3,'#67e8f9',.8,true); floatTxt(BOSS.x,BOSS.y-70,'CŒUR OUVERT ! FRAPPE !','#a5f3fc',18); sfx('boom',BOSS.x,BOSS.y); }
    else if(BOSS.st==='open'&&BOSS.stT<=0){ BOSS.st='closed'; BOSS.stT=rage?5:7; }
    BOSS.cd-=dt; if(BOSS.cd<=0){ BOSS.cd=rage?1.1:1.8; const cand=[]; for(const o of ents){ if(!o.alive||Math.hypot(o.x-BOSS.x,o.y-BOSS.y)>20*T) continue; let best=null,bd=3*T; for(let ty=Math.floor(o.y/T)-3;ty<=Math.floor(o.y/T)+3;ty++)for(let tx=Math.floor(o.x/T)-3;tx<=Math.floor(o.x/T)+3;tx++){ if(!inb(tx,ty)||floorT[idx(tx,ty)]<2) continue; const d=Math.hypot((tx+.5)*T-o.x,(ty+.5)*T-o.y); if(d<bd){ bd=d; best=[(tx+.5)*T,(ty+.5)*T]; } } cand.push(best||[o.x,o.y]); }
      for(const c of cand.sort(()=>Math.random()-.5).slice(0,rage?2:1)){ ring(c[0],c[1],T*1.5,'#38bdf8',1); bombs.push({x:c[0],y:c[1],tx:c[0],ty:c[1],fuse:1,team:-1,owner:null,kind:'bomb',R:1.5*T,dm:6,bd:1.4,shell:true,drop:true,h:0}); } if(cand.length) sfx('whoosh',BOSS.x,BOSS.y); }
  }
  else if(K==='captain'){
    const [tg,bd]=bossNearest(32*T); BOSS.cd-=dt; BOSS.stT-=dt;
    if(BOSS.st==='cruise'||BOSS.st==='tele'){ if(tg){ BOSS.a=Math.atan2(tg.y-BOSS.y,tg.x-BOSS.x); if(BOSS.st==='cruise'&&bd>2.4*T){ const sp=(rage?84:66)*dt, nx=BOSS.x+Math.cos(BOSS.a)*sp, ny=BOSS.y+Math.sin(BOSS.a)*sp; if(fl(Math.floor(nx/T),Math.floor(ny/T))>0&&wl(Math.floor(nx/T),Math.floor(ny/T))===0){ BOSS.x=nx; BOSS.y=ny; } } } }
    if(BOSS.st==='cruise'&&tg&&bd<3.2*T&&BOSS.cd<=0){ BOSS.st='tele'; BOSS.stT=.85; BOSS.cd=rage?1.8:2.8; BOSS.slams.push({x:BOSS.x+Math.cos(BOSS.a)*1.8*T,y:BOSS.y+Math.sin(BOSS.a)*1.8*T,t:.85,cap:true}); ring(BOSS.x+Math.cos(BOSS.a)*1.8*T,BOSS.y+Math.sin(BOSS.a)*1.8*T,T*2.3,'#a3e635',.85); }
    if(BOSS.st==='tele'&&BOSS.stT<=0) BOSS.st='cruise';
    for(const s of BOSS.slams){ s.t-=dt; if(s.t<=0){ sfx('boom',s.x,s.y); ring(s.x,s.y,T*2.4,'#bef264',.5,true); chunks(s.x,s.y,'#4d7c0f',8); shake=Math.max(shake,5); for(const o of ents){ if(!o.alive||o.z>=26) continue; const dx=o.x-s.x,dy=o.y-s.y,d=Math.hypot(dx,dy); if(d<2.3*T){ o.bossKill=true; hurt(o,6,null,dx/(d||1)*520,dy/(d||1)*520); o.bossKill=false; o.vz=Math.max(o.vz,280); } } blastTiles(s.x,s.y,2.2*T,30,null,-1); } }
    // squelettes
    if(BOSS.minions.length<(rage?9:7)&&(BOSS.skT=(BOSS.skT===undefined?4:BOSS.skT)-dt)<=0){ BOSS.skT=rage?6:9; for(let i=0;i<3;i++){ let x=BOSS.x+rnd(-2.5,2.5)*T, y=BOSS.y+rnd(-2.5,2.5)*T; if(fl(Math.floor(x/T),Math.floor(y/T))<=0){ x=BOSS.x; y=BOSS.y; } BOSS.minions.push({x,y,hp:3,cd:rnd(.2,.8)}); burst(x,y,'#d9f99d',8,120,.5,3); } floatTxt(BOSS.x,BOSS.y-70,'💀 À MOI, MES SQUELETTES !','#d9f99d',16); sfx('baa',BOSS.x,BOSS.y); }
    for(const m of BOSS.minions){ let t2=null,md=40*T; for(const o of ents){ if(!o.alive) continue; const d=Math.hypot(o.x-m.x,o.y-m.y); if(d<md){ md=d; t2=o; } } if(t2){ const a=Math.atan2(t2.y-m.y,t2.x-m.x), nx=m.x+Math.cos(a)*76*dt, ny=m.y+Math.sin(a)*76*dt; if(md>.9*T&&fl(Math.floor(nx/T),Math.floor(ny/T))>0&&wl(Math.floor(nx/T),Math.floor(ny/T))===0){ m.x=nx; m.y=ny; } m.cd-=dt; if(md<1.05*T&&m.cd<=0&&t2.z<26){ m.cd=1; t2.bossKill=true; hurt(t2,2,null,Math.cos(a)*200,Math.sin(a)*200); t2.bossKill=false; } } }
    BOSS.minions=BOSS.minions.filter(m=>m.hp>0); BOSS.aux=[]; for(const m of BOSS.minions){ BOSS.aux.push(Math.round(m.x),Math.round(m.y)); }
  }
  BOSS.slams=BOSS.slams.filter(s=>s.t>0);
}
function bossRelease(forced){ const v=BOSS.carry; BOSS.carry=null; if(!v) return; v.grabbed=false; v.root=0; if(v.alive){ v.z=Math.max(v.z,50); v.vz=0; v.tkH=groundH(v); v.grace=.2; if(forced){ floatTxt(v.x,v.y-50,'💥 IL LÂCHE PRISE !','#fde68a',18); } else floatTxt(v.x,v.y-50,'LÂCHÉ !','#fca5a5',15); } }
{ const _bu=bossUpdate; bossUpdate=function(dt){ if(NEWK.has(BOSS.kind)) bossUpdateNew(dt); else _bu(dt); };
  const _bh=bossHit; bossHit=function(dmg,src){ if(BOSS.on&&BOSS.kind==='guardian'&&BOSS.st!=='open'){ dmg*=.12; if(Math.random()<.4) sfx('hit',BOSS.x,BOSS.y); } else if(BOSS.on&&BOSS.kind==='guardian') dmg*=1.5; else if(BOSS.on&&BOSS.kind==='roc'&&BOSS.st==='carry') BOSS.carryDmg+=dmg; else if(BOSS.on&&BOSS.kind==='roc'&&(BOSS.st==='recover'||BOSS.st==='dive')) dmg*=1.3; _bh(dmg,src); };
  const _bd=bossDie; bossDie=function(){ if(BOSS.kind==='roc') bossRelease(false); BOSS.minions=[]; _bd(); };
  // les squelettes encaissent mêlée, explosions et projectiles
  const _hg=hitGuards; hitGuards=function(e,cx,cy,R,dmg){ _hg(e,cx,cy,R,dmg); if(BOSS.on&&BOSS.kind==='captain') for(const m of BOSS.minions) if(Math.hypot(m.x-cx,m.y-cy)<R+10){ m.hp-=dmg>=3?2:1; burst(m.x,m.y,'#e5e7eb',5,100,.3,3); } };
  const _up=updateProj; updateProj=function(dt){ if(BOSS.on&&BOSS.kind==='captain') for(const p of projs){ if(p.life<=0||p.team<0||!(p.dmg>0)) continue; for(const m of BOSS.minions) if(Math.hypot(p.x-m.x,p.y-m.y)<14){ m.hp-=p.dmg>=3?2:1; burst(m.x,m.y,'#e5e7eb',4,90,.3,3); if(!p.pierce) p.life=0; } } _up(dt); };
  const _na=netApplySnap; netApplySnap=function(m){ _na(m); if(BOSS.on) BOSS.rad=(BRAD[BOSS.kind]||1.9)*T; };
  const _ng=newGame; newGame=function(){ _ng(); BOSS.minions=[]; BOSS.trail=[]; BOSS.carry=null; BOSS.fixK=null; };
  // le pirate emporté ne peut pas agir
  const _ce=controlEnt; controlEnt=function(e,dt,inp){ if(e.grabbed){ e.ix=e.iy=0; if(inp.clicked) e.clk2=1; return; } _ce(e,dt,inp); };
}
/* ---------- modèles ---------- */
const bossY={};
function bosses2Build(){
  const bm2=(c,o)=>new THREE.MeshStandardMaterial(Object.assign({color:c,flatShading:true,roughness:.75},o||{}));
  // serpent : tête + 10 segments suivis depuis l'aux
  { const g=new THREE.Group(), head=new THREE.Group(); const hd=new THREE.Mesh(GEO.sphere,bm2(0x10b981)); hd.scale.set(1.1,.7,.8); head.add(hd); for(const z of [-.4,.4]){ const e=new THREE.Mesh(GEO.sphere0,new THREE.MeshBasicMaterial({color:0xfde047})); e.scale.setScalar(.14); e.position.set(.7,.3,z); head.add(e); const p=new THREE.Mesh(GEO.sphere0,new THREE.MeshBasicMaterial({color:0x111827})); p.scale.set(.06,.12,.06); p.position.set(.8,.3,z); head.add(p); }
    for(const z of [-.2,.2]){ const f=new THREE.Mesh(GEO.cone,bm2(0xffffff)); f.scale.set(.05,.3,.05); f.rotation.z=Math.PI; f.position.set(.95,-.15,z); head.add(f); } const crest=new THREE.Mesh(GEO.cone,bm2(0xef4444)); crest.scale.set(.15,.5,.5); crest.position.set(-.1,.6,0); head.add(crest); g.add(head);
    const segs=[]; for(let i=0;i<10;i++){ const s=new THREE.Mesh(GEO.sphere,bm2(i%2?0x059669:0x34d399)); const k=1-i*.06; s.scale.set(.9*k,.6*k,.7*k); g.add(s); segs.push(s); const fin=new THREE.Mesh(GEO.cone,bm2(0xef4444)); fin.scale.set(.1,.35*k,.3); fin.position.y=.5; s.add(fin); }
    g.userData={head,segs,hd}; g.visible=false; scene.add(g); bossY.serpent=g; }
  // titan de lave
  { const g=new THREE.Group(), body=new THREE.Mesh(GEO.cone,bm2(0x3f2a24)); body.scale.set(2.3,4.2,2.3); body.position.y=2.1; g.add(body); const lava=new THREE.Mesh(GEO.sphere,new THREE.MeshStandardMaterial({color:0xff5a1f,emissive:0xff3a00,emissiveIntensity:1.3,flatShading:true})); lava.scale.set(1,.55,1); lava.position.y=4.1; g.add(lava);
    for(let i=0;i<5;i++){ const a=i/5*6.283, c=new THREE.Mesh(GEO.box,new THREE.MeshStandardMaterial({color:0xff6a2a,emissive:0xff3a00,emissiveIntensity:1,flatShading:true})); c.scale.set(.1,1.4,.1); c.position.set(Math.cos(a)*1.2,1.6,Math.sin(a)*1.2); c.rotation.z=Math.cos(a)*.5; c.rotation.x=-Math.sin(a)*.5; g.add(c); }
    const arms=[]; for(const s of [-1,1]){ const a=new THREE.Mesh(GEO.cyl,bm2(0x4a3128)); a.scale.set(.35,1.8,.35); a.position.set(s*1.7,2.3,0); a.rotation.z=s*.5; g.add(a); arms.push(a); }
    for(const s of [-.4,.4]){ const e=new THREE.Mesh(GEO.sphere0,new THREE.MeshBasicMaterial({color:0xfde047})); e.scale.setScalar(.2); e.position.set(s,3.6,.8); g.add(e); }
    const wave=new THREE.Mesh(GEO.ring,new THREE.MeshBasicMaterial({color:0xfb923c,transparent:true,opacity:.8,side:THREE.DoubleSide,depthWrite:false})); wave.visible=false; scene.add(wave); g.userData={body,lava,arms,wave}; g.visible=false; scene.add(g); bossY.titan=g; }
  // roc géant
  { const g=new THREE.Group(), body=new THREE.Mesh(GEO.sphere,bm2(0x92400e)); body.scale.set(1.8,.8,.9); g.add(body); const head=new THREE.Mesh(GEO.sphere,bm2(0xfef3c7)); head.scale.set(.6,.55,.55); head.position.set(1.8,.35,0); g.add(head); const beak=new THREE.Mesh(GEO.cone,bm2(0xf59e0b)); beak.scale.set(.2,.7,.2); beak.rotation.z=-Math.PI/2; beak.position.set(2.5,.3,0); g.add(beak);
    const wings=[]; for(const s of [-1,1]){ const w=new THREE.Group(); w.position.set(0,.2,s*.7); const wb=new THREE.Mesh(GEO.box,bm2(0x78350f)); wb.scale.set(1.4,.08,3); wb.position.z=s*1.5; w.add(wb); const tip=new THREE.Mesh(GEO.box,bm2(0xfbbf24)); tip.scale.set(1,.06,1.2); tip.position.set(-.2,0,s*3.2); w.add(tip); g.add(w); wings.push({w,s}); }
    const tail=new THREE.Mesh(GEO.box,bm2(0x78350f)); tail.scale.set(1,.06,.9); tail.position.x=-2; g.add(tail); for(const s of [-.4,.4]){ const t=new THREE.Mesh(GEO.cone,bm2(0xf59e0b)); t.scale.set(.1,.5,.1); t.rotation.z=Math.PI; t.position.set(.6,-.7,s); g.add(t); }
    const shadow=new THREE.Mesh(GEO.disc,new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:.28,depthWrite:false})); shadow.scale.set(2.6,1,1.8); shadow.visible=false; scene.add(shadow); const warn=new THREE.Mesh(GEO.ring,new THREE.MeshBasicMaterial({color:0xfbbf24,transparent:true,opacity:.9,side:THREE.DoubleSide,depthWrite:false})); warn.visible=false; scene.add(warn);
    g.userData={wings,shadow,warn,body}; g.visible=false; scene.add(g); bossY.roc=g; }
  // gardien des abysses
  { const g=new THREE.Group(), core=new THREE.Mesh(GEO.sphere,bm2(0x1f2937,{metalness:.5,roughness:.45})); core.scale.setScalar(2.2); core.position.y=.6; g.add(core); for(let i=0;i<12;i++){ const a=Math.acos(1-2*(i+.5)/12), b=2.4*Math.PI*i; const sp=new THREE.Mesh(GEO.cone,bm2(0x4b5563,{metalness:.5})); sp.scale.set(.2,.9,.2); const nx=Math.sin(a)*Math.cos(b), ny=Math.cos(a), nz=Math.sin(a)*Math.sin(b); sp.position.set(nx*2.4,.6+ny*2.4,nz*2.4); sp.lookAt(nx*5,.6+ny*5,nz*5); sp.rotateX(Math.PI/2); g.add(sp); }
    const lamp=new THREE.Mesh(GEO.sphere,new THREE.MeshStandardMaterial({color:0xef4444,emissive:0xef4444,emissiveIntensity:1.2})); lamp.scale.setScalar(.8); lamp.position.set(0,2.5,0); g.add(lamp); const bu=new THREE.Mesh(GEO.sphere0,new THREE.MeshBasicMaterial({color:0xfde68a})); bu.scale.setScalar(.35); bu.position.y=4.2; g.add(bu); g.userData={lamp,bu,core}; g.visible=false; scene.add(g); bossY.guardian=g; }
  // capitaine maudit (+ squelettes)
  { const pal={light:'#d9f99d',col:'#65a30d',dark:'#365314'}; const g=createPirate(pal,{scale:2.6,neutral:true}); g.visible=false; scene.add(g); bossY.captain=g; bossY.skel=[]; bossY.pal=pal;
    const glow=new THREE.Mesh(GEO.sphere,new THREE.MeshBasicMaterial({color:0xa3e635,transparent:true,opacity:.18,depthWrite:false,blending:THREE.AdditiveBlending})); glow.scale.set(2,2.6,2); glow.position.y=1.2; g.add(glow); g.userData.glow=glow; }
}
{ const _r=render3d;
  render3d=function(dt){ _r(dt); if(!scene||game.state==='menu') return; if(!bossY.serpent) bosses2Build(); const t=game.t, on=BOSS.on, K=BOSS.kind;
    for(const k of ['serpent','titan','roc','guardian','captain']) bossY[k].visible=on&&K===k; if(!(on&&K==='roc')){ bossY.roc.userData.shadow.visible=false; bossY.roc.userData.warn.visible=false; } if(!(on&&K==='titan')) bossY.titan.userData.wave.visible=false; if(!(on&&K==='captain')) for(const s of bossY.skel) s.visible=false;
    if(!on) return;
    if(K==='serpent'){ const g=bossY.serpent, u=g.userData; g.position.set(0,0,0); u.head.position.set(BOSS.x*U,-.7+Math.sin(t*3)*.08,BOSS.y*U); u.head.rotation.y=-BOSS.a; u.hd.material.emissive.setHex(BOSS.flash>0?0xff4444:0); u.hd.material.emissiveIntensity=BOSS.flash>0?1:0;
      const ax=BOSS.aux; u.segs.forEach((s,i)=>{ if(ax.length>=i*2+2){ s.position.set(ax[i*2]*U,-.9+Math.sin(t*3+i*.8)*.15+(i%2?.05:0),ax[i*2+1]*U); } }); }
    if(K==='titan'){ const g=bossY.titan, u=g.userData; g.position.set(BOSS.x*U,0,BOSS.y*U); u.lava.material.emissiveIntensity=1.1+.5*Math.sin(t*3)+(BOSS.flash>0?1:0); u.arms.forEach((a,i)=>{ a.rotation.z=(i?1:-1)*(.5+(BOSS.slams.length?.6:0)+Math.sin(t*2+i)*.1); }); if(Math.random()<dt*10&&parts.length<500) parts.push({x:BOSS.x+rnd(-20,20),y:BOSS.y+rnd(-20,20),z:140,vx:rnd(-20,20),vy:rnd(-20,20),vz:rnd(60,140),life:1.2,max:1.2,col:Math.random()<.5?'#fb923c':'#6b7280',size:5,smoke:Math.random()<.5});
      u.wave.visible=BOSS.aux.length>0; if(u.wave.visible){ const r=BOSS.aux[0]*U; u.wave.position.set(BOSS.x*U,.15,BOSS.y*U); u.wave.scale.set(r,1,r); u.wave.material.opacity=.8*Math.max(0,1-r/10.5); } }
    if(K==='roc'){ const g=bossY.roc, u=g.userData, low=BOSS.st==='dive'||BOSS.st==='recover'||BOSS.st==='carry', h=BOSS.st==='dive'?1.1:BOSS.st==='recover'?1.5:BOSS.st==='carry'?3.4:6.5; g.position.set(BOSS.x*U,h+Math.sin(t*2)*.15,BOSS.y*U); g.rotation.y=-BOSS.a; g.rotation.z=Math.sin(t*1.5)*.08; u.wings.forEach(w=>{ w.w.rotation.x=w.s*(Math.sin(t*(low?10:6))*.55); }); u.body.material.emissive.setHex(BOSS.flash>0?0xff4444:0); u.body.material.emissiveIntensity=BOSS.flash>0?1:0;
      u.shadow.visible=true; u.shadow.position.set(BOSS.x*U,.07,BOSS.y*U); u.shadow.rotation.y=-BOSS.a; const sk=Math.max(.5,1.6-h*.14); u.shadow.scale.set(2.6*sk,1,1.8*sk); u.warn.visible=BOSS.st==='tele'&&BOSS.aux.length>=4; if(u.warn.visible){ u.warn.position.set(BOSS.aux[2]*U,.1,BOSS.aux[3]*U); const s2=1.8+.2*Math.sin(t*12); u.warn.scale.set(s2,1,s2); } }
    if(K==='guardian'){ const g=bossY.guardian, u=g.userData, st=BOSS.st; g.position.set(BOSS.x*U,-.8+Math.sin(t*1.2)*.12,BOSS.y*U); g.rotation.y=t*.2; const open=st==='open', warn=st==='warn'; u.lamp.material.color.setHex(open?0x22d3ee:0xef4444); u.lamp.material.emissive.setHex(open?0x22d3ee:0xef4444); u.lamp.material.emissiveIntensity=open?2:(warn?(Math.floor(t*10)%2?2:.3):.8); u.lamp.scale.setScalar(open?1.1:.8); u.bu.visible=warn||open; u.bu.material.color.setHex(open?0x67e8f9:0xfde68a); g.scale.setScalar(open?1.05:1); u.core.material.emissive.setHex(BOSS.flash>0?0xff4444:0); u.core.material.emissiveIntensity=BOSS.flash>0?.9:0; }
    if(K==='captain'){ const g=bossY.captain; g.position.set(BOSS.x*U,wallTop(Math.floor(BOSS.x/T),Math.floor(BOSS.y/T))*U+.05,BOSS.y*U); g.rotation.y=-BOSS.a; g.userData.glow.material.opacity=.14+.08*Math.sin(t*3)+(BOSS.flash>0?.3:0); g.position.y+=Math.abs(Math.sin(t*5))*.04;
      const ax=BOSS.aux, n=Math.floor(ax.length/2); while(bossY.skel.length<n){ const s=createPirate(bossY.pal,{scale:.5,neutral:true}); scene.add(s); bossY.skel.push(s); } bossY.skel.forEach((s,i)=>{ s.visible=i<n; if(i<n){ s.position.set(ax[i*2]*U,0,ax[i*2+1]*U); s.rotation.y=t*2+i; s.position.y+=Math.abs(Math.sin(t*8+i))*.05; } }); }
  };
}
/* ---------- affichage : cercle d'impact des attaques spéciales ---------- */
{ const _dh=drawHud; drawHud=function(){ _dh(); if(!BOSS.on||game.state==='menu'||!ctx) return; ctx.save(); ctx.setTransform(DPR,0,0,DPR,0,0);
    if(BOSS.kind==='roc'&&BOSS.st==='tele'&&BOSS.aux.length>=4){ const s=w2s(BOSS.aux[2],BOSS.aux[3],80); ctx.font='bold 22px '+FONT; ctx.textAlign='center'; ctx.fillText('🦅',s[0],s[1]); }
    if(BOSS.kind==='guardian'&&BOSS.st==='open'){ const s=w2s(BOSS.x,BOSS.y,150); ctx.font='bold 15px '+FONT; ctx.textAlign='center'; ctx.lineWidth=4; ctx.strokeStyle='rgba(10,30,50,.9)'; ctx.fillStyle='#a5f3fc'; ctx.strokeText('⚓ CŒUR OUVERT ! (×1,5)',s[0],s[1]); ctx.fillText('⚓ CŒUR OUVERT ! (×1,5)',s[0],s[1]); }
    if(BOSS.kind==='serpent'){ const s=w2s(BOSS.x,BOSS.y,60); ctx.font='bold 13px '+FONT; ctx.textAlign='center'; ctx.lineWidth=4; ctx.strokeStyle='rgba(10,30,50,.9)'; ctx.fillStyle='#fde047'; ctx.strokeText('🎯 TÊTE',s[0],s[1]-12); ctx.fillText('🎯 TÊTE',s[0],s[1]-12); }
    ctx.restore(); }; }
