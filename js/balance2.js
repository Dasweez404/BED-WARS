'use strict';
/* ===== Équilibrage tardif : armes à distance un peu moins puissantes (appliqué une seule fois, après tous les modules) ===== */
(function(){ if(window.__GUNNERF) return; window.__GUNNERF=1; for(const id in GUNS){ const g=GUNS[id]; if(g&&g.dmg>0) g.dmg=Math.round(g.dmg*.85*100)/100; } })();

/* ===== Gadgets : nerf général (~15 %) — dégâts et durées des effets créés, recharges plus longues ===== */
(function(){
  if(window.__GADNERF) return; window.__GADNERF=1;
  for(const id in PERM){ const P=PERM[id]; if(P&&P.cd>0) P.cd=Math.round(P.cd*1.2); }
  const _u=useGadget;
  useGadget=function(e,id,wx,wy){
    const nb=bombs.length, nt=traps.length, ns=typeof sharks!=='undefined'?sharks.length:0, ng=guards.length, nc=chickens.length, nr=typeof barrels2!=='undefined'?barrels2.length:0;
    const ok=_u(e,id,wx,wy); if(!ok) return ok;
    for(let i=nb;i<bombs.length;i++){ const b=bombs[i]; if(b.dm) b.dm*=.85; if(b.R) b.R*=.96; }
    for(let i=nt;i<traps.length;i++){ const t=traps[i]; if(t.t<1e5) t.t*=.85; }
    if(typeof sharks!=='undefined') for(let i=ns;i<sharks.length;i++) sharks[i].t*=.85;
    for(let i=ng;i<guards.length;i++){ const g=guards[i]; if(g.hp) g.hp=Math.max(1,Math.round(g.hp*.85)); if(g.t<1e5) g.t*=.85; }
    for(let i=nc;i<chickens.length;i++) chickens[i].t*=.85;
    if(typeof barrels2!=='undefined') for(let i=nr;i<barrels2.length;i++) barrels2[i].hp=Math.max(1,barrels2[i].hp-1);
    if(e.cd&&e.cd.gad>0) e.cd.gad*=1.4;
    return ok;
  };
})();
if(typeof throwBomb==='function'){ const _tb=throwBomb; throwBomb=function(e,kind,wx,wy){ const n=bombs.length; const r=_tb(e,kind,wx,wy); for(let i=n;i<bombs.length;i++){ const b=bombs[i]; if(b.dm) b.dm*=.85; if(b.R) b.R*=.96; } return r; }; }

/* ===== Gardiens : retours visuels/sonores quand on les touche ===== */
if(typeof updateGuards==='function'){ const _ug=updateGuards;
  updateGuards=function(dt){
    for(const g of guards){ if(g._hp===undefined) g._hp=g.hp; }
    _ug(dt);
    for(const g of guards) g.flash=Math.max(0,(g.flash||0)-dt);
    for(const g of guards){ if(g._hp===undefined){ g._hp=g.hp; continue; } const d=g._hp-g.hp; g._hp=g.hp;
      if(d>.05){ g.flash=.18; floatTxt(g.x+rnd(-6,6),g.y-34,'-'+(Math.round(d*10)/10),'#fde68a',15); burst(g.x,g.y-8,'#ffffff',8,150,.3,3); burst(g.x,g.y-8,'#fca5a5',5,110,.3,3); ring(g.x,g.y,T*.7,'#fecaca',.25,true); sfx('hit',g.x,g.y); g.hitT=.25;
        if(g.hp<=0){ floatTxt(g.x,g.y-46,'💥','#fff',18); burst(g.x,g.y,'#bef264',16,200,.5,4); } } } };
}

if(typeof updateGuardM==='function'){ const _um=updateGuardM; updateGuardM=function(g,m){ _um(g,m); const k=g.flash>0?1+g.flash*1.6:1; m.scale.setScalar(k); m.position.y=g.flash>0?g.flash*.8:0; m.rotation.z=g.flash>0?Math.sin(g.flash*40)*.25:0; }; }
