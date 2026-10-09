'use strict';
/* =====================  TOUR DE GUET  =====================
   Debout sur la tour, E te téléporte sur la plateforme (5,5 blocs). De là-haut : vue plus large (la caméra suit la hauteur),
   portée des armes ×1,5 (rangeK) et tirs qui passent par-dessus les murs. E de nouveau pour redescendre. */
const TOWER_Z=5.5*T;
ENT_NUM.push('tower');
{ const _m=makeEnt; makeEnt=function(a,b,c){ const e=_m(a,b,c); e.tower=0; return e; }; }
{ const _sn=structNear;
  structNear=function(e){ const r=_sn(e); if(r) return r;
    if(!e||!e.alive||e.riding||!TD[e.team]||!((e.up.lighthouse|0)>0)) return null; if(typeof EG!=='undefined'&&EG.arena) return null;
    const [x,y]=structTile(TD[e.team],'lighthouse'); return Math.hypot((x+.5)*T-e.x,(y+.5)*T-e.y)<2.2*T?'lighthouse':null; };
  const _us=useStruct;
  useStruct=function(e,key){ if(key!=='lighthouse') return _us(e,key);
    if(e.tower){ towerLeave(e); return true; }
    const [x,y]=structTile(TD[e.team],'lighthouse'); e.x=(x+.5)*T; e.y=(y+.5)*T; e.vx=e.vy=0; e.vz=0; e.z=TOWER_Z; e.tower=1; e.tkH=TOWER_Z;
    ring(e.x,e.y,T*1.6,'#fde68a',.5,true); burst(e.x,e.y-TOWER_Z,'#fde68a',14,150,.6,3); sfx('place',e.x,e.y);
    if(e===player) msg('🗼 Tour de guet : tu vois et tires de plus haut · E pour redescendre','#fde68a'); return true; };
  window.towerLeave=function(e){ e.tower=0; e.z=0; e.vz=0; e.tkH=0; e.grace=Math.max(e.grace||0,.3); ring(e.x,e.y,T*1.2,'#fde68a',.4,true); sfx('place',e.x,e.y); };
  const _u=update;
  update=function(dt){
    for(const e of ents){ if(!e.tower) continue; if(!e.alive||e.frozen>0||!TD[e.team]||!TD[e.team].coreAlive||!((e.up.lighthouse|0)>0)||(typeof EG!=='undefined'&&EG.arena)){ e.tower=0; if(e.alive){ e.z=0; e.vz=0; e.tkH=0; } continue; } e.z=TOWER_Z; e.vz=0; e.vx=e.vy=0; }
    _u(dt);
    for(const e of ents) if(e.tower&&e.alive){ e.z=TOWER_Z; e.vz=0; e.tkH=TOWER_Z; } };
  const _ce=controlEnt; controlEnt=function(e,dt,inp){ if(e.tower) inp=Object.assign({},inp,{ix:0,iy:0}); _ce(e,dt,inp); };
  const _j=jump; jump=function(e,p){ if(e.tower) return; return _j(e,p); };
}

/* ---- Rempart d'île : description ---- */
{ const it=SHOPMAP.shield; if(it){ const old=it.info; it.info=function(e){ const r=old.call(this,e); return Object.assign({},r,{desc:'Érige un mur fermé autour de ton île, sans porte. Plus tu as de blocs dans l\'inventaire, plus il a d\'étages (jusqu\'à '+MAXH()+'). Un escalier intérieur, du côté de la sortie, te permet de sauter dessus.'}); }; } }
