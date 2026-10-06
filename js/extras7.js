'use strict';
/* =====================  NOUVELLES CARTES, MUTATEURS, GLACE  =====================
   4 cartes, 7 mutateurs (règles folles activables), banquise glissante. */
Object.assign(game.opts,{mut:{},dn:1,wth:1,pers:1,loss:0,rkeep:0,bheal:0,share:0});
/* ---------- cartes ---------- */
(function(){
  const bases4=[[50,82,[0,-1]],[18,50,[1,0]],[50,18,[0,1]],[82,50,[-1,0]]];
  // atoll : un anneau de huit îlots entre les bases et le galion
  const ring=[]; for(let k=0;k<8;k++){ const a=k*Math.PI/4; ring.push([Math.round(50+Math.cos(a)*20),Math.round(50+Math.sin(a)*20)]); }
  // îlots dispersés : disposition fixe, pseudo-aléatoire (identique chez tous les joueurs)
  const sc=[]; let s=12345; const R=()=>((s=(Math.imul(s,1664525)+1013904223)>>>0)/4294967296);
  const fixed=[[50,76],[24,50],[50,24],[76,50],[50,50],[30,30],[70,30],[30,70],[70,70]];
  for(let i=0;i<400&&sc.length<11;i++){ const x=14+Math.floor(R()*72), y=14+Math.floor(R()*72); if(fixed.some(([a,b])=>Math.hypot(a-x,b-y)<(a===50&&b===50?14:13))||sc.some(([a,b])=>Math.hypot(a-x,b-y)<10)) continue; sc.push([x,y]); }
  Object.assign(MAPS,{
    atoll:{n:'Atoll',d:'Les bases aux quatre coins du monde et un anneau d\'îlots autour du galion : on se bat au centre !',bases:bases4,dia:[[24,24],[76,24],[24,76],[76,76]],relay:ring},
    scatter:{n:'Îlots dispersés',d:'Des îlots un peu partout : des ponts courts, des embuscades, beaucoup de possibilités.',bases:[[50,76,[0,-1]],[24,50,[1,0]],[50,24,[0,1]],[76,50,[-1,0]]],dia:[[30,30],[70,30],[30,70],[70,70]],relay:sc},
    glacier:{n:'Banquise',d:'Îles gelées : on glisse partout ! Neige, mer glacée et blocs de glace (attention au bord).',bases:[[50,76,[0,-1]],[24,50,[1,0]],[50,24,[0,1]],[76,50,[-1,0]]],dia:[[30,30],[70,30],[30,70],[70,70]],relay:[],ice:true,wx:'snow'},
    jungle:{n:'Jungle du volcan',d:'Une jungle luxuriante, des îlots-volcans qui crachent de la lave : éruptions fréquentes et pluies tropicales !',bases:[[50,76,[0,-1]],[24,50,[1,0]],[50,24,[0,1]],[76,50,[-1,0]]],dia:[[30,30],[70,30],[30,70],[70,70]],relay:[[38,38],[62,38],[38,62],[62,62]],volcano:true,jungle:true,wx:'jungle'},
    tempest:{n:'Cap des tempêtes',d:'Îles rapprochées sous un orage perpétuel, de nuit. Éclairs, pluie et vent !',bases:[[50,70,[0,-1]],[30,50,[1,0]],[50,30,[0,1]],[70,50,[-1,0]]],dia:[[36,36],[64,36],[36,64],[64,64]],relay:[],wx:'storm',night:true}
  });
})();
const iceOn=()=>!!(MAPS[game.opts.map]||{}).ice;
/* ---------- mutateurs ---------- */
const MUTS={
  lowg:{n:'Gravité lunaire',ico:'🌙',d:'Sauts très hauts et très longs, aucun dégât de chute.'},
  pricey:{n:'Marché noir',ico:'💸',d:'Tout coûte 50 % plus cher en boutique.'},
  sudden:{n:'Mort subite',ico:'⚡',d:'Les coffres n\'ont que 40 % de leur résistance : tout se joue vite !'},
  fast:{n:'Course folle',ico:'🏃',d:'Tout le monde court 30 % plus vite.'},
  bombrain:{n:'Pluie de bombes',ico:'💣',d:'Des bombes s\'abattent régulièrement sur les îles. Ne reste pas planté là !'},
  vamp:{n:'Vampires',ico:'🧛',d:'Chaque coup porté te rend 30 % des dégâts infligés en PV.'},
  mini:{n:'Mini-pirates',ico:'🐭',d:'Tout le monde est minuscule : plus rapide, mais plus fragile.'}
};
const MUT=k=>!!(game.opts&&game.opts.mut&&game.opts.mut[k]);
{ const _ng=newGame;
  newGame=function(){
    _ng();
    game.mspd=MUT('fast')?1.3:1; game.mutBomb=rnd(4,7);
    if(MUT('sudden')){ BHP[CORE]=Math.max(6,Math.round(BHP[CORE]*.4)); for(const t of TD){ const ci=idx(t.bx,t.by); if(wallT[ci]===CORE) hpW[ci]=BHP[CORE]; } }
    const act=Object.keys(MUTS).filter(MUT); if(act.length){ msg('Mutateurs : '+act.map(k=>MUTS[k].ico+' '+MUTS[k].n).join(' · '),'#f0abfc'); }
  };
}
/* coût ×1,5 */
for(const it of SHOP){ if(it._pm) continue; it._pm=1; const i0=it.info; it.info=function(e){ const r=i0.call(this,e); if(MUT('pricey')&&r&&r.cost){ const c={}; for(const k in r.cost) c[k]=Math.ceil(r.cost[k]*1.5); return Object.assign({},r,{cost:c}); } return r; }; }
/* vampires, gravité lunaire (pas de chute) */
{ const _h=hurt;
  hurt=function(e,amount,by,kx,ky){
    if(MUT('lowg')&&e.fallDeath) return;
    const hp0=e.hp, was=e.alive; _h(e,amount,by,kx,ky);
    if(MUT('vamp')&&was&&by&&by!==e&&by.alive&&by.hp!==undefined){ const dealt=hp0-e.hp; if(dealt>0) by.hp=Math.min(maxhp(by),by.hp+dealt*.3); }
  };
  const _j=jump;
  jump=function(e,power){ const had=e.vz; _j(e,power); if(MUT('lowg')&&e.vz>had&&e.vz>0) e.vz*=1.3; };
}
/* glace + gravité lunaire + mini-pirates : par pirate et par image */
{ const _u=updateEnt;
  updateEnt=function(e,dt){
    let ice=false, six=0, siy=0;
    if(MUT('mini')&&e.alive) e.tiny=Math.max(e.tiny||0,5);
    if(iceOn()&&e.alive&&!e.riding&&!e.pull&&e.frozen<=0&&e.slip<=0&&e.z<=groundH(e)+1){ ice=true; six=e.ix; siy=e.iy; const sp=speedOf(e); e.vx+=six*sp*3*dt; e.vy+=siy*sp*3*dt; e.ix=e.iy=0; }
    _u(e,dt);
    if(ice){ e.ix=six; e.iy=siy; const k=Math.exp(4.4*dt); e.vx*=k; e.vy*=k; }
    if(e.alive&&MUT('lowg')&&!e.riding&&!e.bubble&&(e.z>1||e.vz>0)) e.vz+=560*dt;
  };
}
/* pluie de bombes + météo qui éteint les flammes (voir ambiance.js) */
{ const _e=updateEvents;
  updateEvents=function(dt){
    _e(dt);
    if(game.state!=='play'||!MUT('bombrain')) return;
    game.mutBomb-=dt; if(game.mutBomb>0) return; game.mutBomb=rnd(3.2,6.4)*Math.max(.55,1-game.t/900);
    const t=Math.random()<.45?entTile():(()=>{ const q=islandTile(); return q?[(q[0]+.5)*T,(q[1]+.5)*T]:null; })(); if(!t) return;
    const x=t[0],y=t[1]; ring(x,y,T*1.4,'#f97316',1.1); bombs.push({x,y,tx:x,ty:y,fuse:1.1,team:-1,owner:null,kind:'bomb',R:1.6*T,dm:6,bd:.7,shell:true,drop:true,h:0});
  };
}
/* jungle : éruptions régulières */
{ const _e=updateEvents; let nextV=30;
  updateEvents=function(dt){ _e(dt); if(game.state!=='play'||!(MAPS[game.opts.map]||{}).volcano||(game.opts.evf|0)===0&&false) return;
    nextV-=dt; if(nextV<=0&&!EV.cur){ nextV=rnd(32,48); startEvent('volcano'); } };
  const _n=newGame; newGame=function(){ _n(); nextV=rnd(25,35); };
}
/* sol de la banquise : teinte glacée */
{ const _g=groundColor, ic=new THREE.Color('#d9f1ff'), jg=new THREE.Color('#3f9a45');
  groundColor=function(reg,tx,ty,out){ _g(reg,tx,ty,out); if(iceOn()) out.lerp(ic,reg===4?.35:.7); else if((MAPS[game.opts.map]||{}).jungle&&reg!==4) out.lerp(jg,.45); return out; };
}

/* soin à la base (option) */
{ const _e=updateEvents;
  updateEvents=function(dt){ _e(dt); const r=[0,1.2,3.5][game.opts.bheal|0]; if(!r||game.state!=='play') return;
    for(const e of ents){ if(!e.alive||e.hp>=maxhp(e)||!nearBase(e)) continue; e.hp=Math.min(maxhp(e),e.hp+r*dt); if(Math.random()<dt*2) burst(e.x,e.y-e.z-10,'#86efac',1,40,.5,3); } };
}

/* ressources d'équipe partagées (option) : tous les coéquipiers piochent dans la même réserve */
{ const _ng=newGame;
  newGame=function(){ _ng(); if(game.opts.share) for(const td of TD) for(const m of td.members) if(m!==td.ent) m.res=td.ent.res; };
  const _d=die;
  die=function(e,by,sea){ if(game.opts.share&&e.alive&&TD[e.team]&&TD[e.team].members.length>1){ const pool=e.res; e.res={bronze:0,silver:0,gold:0,diamond:0}; try{ _d(e,by,sea); } finally{ e.res=pool; } } else _d(e,by,sea); };
}
