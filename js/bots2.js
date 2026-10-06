'use strict';
/* =====================  PERSONNALITÉS DES BOTS (option du menu « Bots »)  =====================
   Chaque capitaine a un caractère : objets préférés, façon de choisir ses cibles, réactions. */
const PERS={
  ruse:{ico:'🦊',n:'Rusé',cls:'mystique',d:'Furtif : espionne, vole, vise le coffre le plus faible et fuit quand il va mal.',likes:['cloak','tp','stickybomb','pickpocket','decoy','swap','dash','haste','net','mine','springs']},
  batisseur:{ico:'🧱',n:'Bâtisseur',cls:'charpentier',d:'Fortifie sa base, achète des défenses et ne sort qu\'en force.',likes:['turret','turret2','guard','wallgad','repair','net','mine','flag','anchor','aegis','bridge']},
  kamikaze:{ico:'💥',n:'Kamikaze',cls:'brute',d:'Fonce tôt, adore les explosifs et devient fou furieux quand il est blessé.',likes:['rocket','cluster','stickybomb','flame','shotgun','haste','dash','gun','smg']},
  chasseur:{ico:'🎯',n:'Chasseur de primes',cls:'corsaire',d:'Traque le pirate qui a le plus d\'éliminations (souvent toi !).',likes:['sniper','flarebow','javelin','grap','jet','boomerang','haste','trident']},
  marchand:{ico:'🪙',n:'Marchand',cls:'pillard',d:'Collectionne le butin : forges, diamants et or avant tout.',likes:['buoy','heal','springs','r_coin','r_hp','r_speed','net']}
};
const PERS_IDS=Object.keys(PERS);
let persCount=0;
{ const _ac=applyClass;
  applyClass=function(e){
    if(e.isBot&&e.ai&&game.opts.pers&&!e.remote&&!NETCLIENT){
      const id=PERS_IDS[(persCount+(game.t<1?0:0))%PERS_IDS.length]; persCount++; const P=PERS[id];
      e.pers=id; e.ai.pers=id; if(CLASSES[P.cls]) e.cls=P.cls; for(const l of P.likes) if(BOT_OPTIONAL.includes(l)) e.ai.likes.add(l);
      if(!e.name.startsWith(P.ico)) e.name=P.ico+' '+e.name;
      if(id==='kamikaze') e.ai.leaveAt*=.45; else if(id==='batisseur') e.ai.leaveAt=e.ai.leaveAt*2.2+10; else if(id==='marchand') e.ai.leaveAt*=1.1;
    }
    _ac(e);
  };
  const _ng=newGame;
  newGame=function(){ persCount=Math.floor(Math.random()*PERS_IDS.length); _ng();
    if(game.opts.pers&&!NETCLIENT){ const l=ents.filter(e=>e.pers&&e!==player&&e.team!==player.team).map(e=>PERS[e.pers].ico+' '+PERS[e.pers].n+' ('+TEAMS[e.team].name+')'); if(l.length) msg('Capitaines : '+l.join(' · '),'#fde68a'); } };
}
const pers=b=>b.ai&&b.ai.pers;
/* ---------- choix d'objectif ---------- */
{ const _pg=pickGoal;
  pickGoal=function(b){
    const ai=b.ai, p=pers(b), me=b.x/T, my=b.y/T;
    if(p==='ruse'&&Math.random()<.65){ // vise le coffre le plus fragile
      let best=null,bh=1e9; for(const t of TD){ if(t.id===b.team||!t.coreAlive) continue; const ci=idx(t.bx,t.by), h=wallT[ci]===CORE?hpW[ci]:99; if(h<bh){ bh=h; best=t; } }
      if(best){ ai.mode='raid'; ai.target=best.id; if((b.am.cloak||0)>0&&b.cd.gad<=0&&Math.random()<.6) useGadget(b,'cloak',b.x,b.y); return; }
    }
    if(p==='chasseur'&&Math.random()<.6&&ents.some(o=>o.alive&&o.team!==b.team)){ ai.mode='hunt'; ai.bounty=true; return; }
    if(p==='marchand'&&Math.random()<.7){
      const l=spawners.filter(s=>s.kind==='dia'||(s.kind==='gold'&&game.t>50)).map(s=>({s,d:Math.hypot(s.x-me,s.y-my)+Math.random()*6})).sort((a,c)=>a.d-c.d);
      if(l.length){ const s=l[0].s; ai.mode='res'; ai.goal=[s.x,s.y]; ai.wait=s.kind==='dia'?14:11; ai.bounty=false; return; }
    }
    if(p==='kamikaze'&&Math.random()<.75){ const al=TD.filter(t=>t.id!==b.team&&t.coreAlive).sort((a,c)=>Math.hypot(a.bx-me,a.by-my)-Math.hypot(c.bx-me,c.by-my)); if(al.length){ ai.mode='raid'; ai.target=al[0].id; return; } }
    ai.bounty=false; _pg(b);
  };
  /* le chasseur de primes vise le leader en éliminations */
  const _nt=navTo;
  navTo=function(b,gx,gy){
    if(b.ai&&b.ai.bounty&&b.ai.mode==='hunt'){ let tg=null,bk=-1; for(const o of ents){ if(!o.alive||o.team===b.team) continue; const sc=o.kills*10+(o===player?5:0)+(o.res.diamond||0)+Math.random()*.01; if(sc>bk){ bk=sc; tg=o; } } if(tg){ gx=Math.floor(tg.x/T); gy=Math.floor(tg.y/T); } }
    return _nt(b,gx,gy);
  };
}
/* ---------- comportements par image ---------- */
{ const _bt=botThink;
  botThink=function(b,dt){
    const p=pers(b); if(p&&b.alive){ const ai=b.ai, mhp=maxhp(b);
      if(p==='ruse'&&b.hp<mhp*.4&&ai.mode!=='home'&&!(ai.fleeT>ai.t)){ ai.fleeT=ai.t+14; ai.mode='home'; ai.leaveAt=ai.t+16; if((b.am.cloak||0)>0&&b.cd.gad<=0) useGadget(b,'cloak',b.x,b.y); floatTxt(b.x,b.y-44,'Repli !','#fde68a',14); }
      if(p==='kamikaze'&&b.hp<mhp*.4&&!(b.rage>0)&&!(ai.rageT>ai.t)){ ai.rageT=ai.t+25; b.rage=6; floatTxt(b.x,b.y-44,'GRRR !','#fb923c',16); ring(b.x,b.y,T*1.5,'#fb923c',.5,true); }
      if(p==='batisseur'&&ai.mode==='home'&&TD[b.team].coreAlive&&totalBlocks(b)>22&&b.cd.place<=0&&Math.random()<dt*2) botRing(b);
    }
    _bt(b,dt);
  };
  const _bb=botBuy;
  botBuy=function(b){
    const p=pers(b);
    if(p&&nearBase(b)){
      const list=p==='marchand'?['fb','fs','gold','dia','loot','hp']:p==='batisseur'?['mason','wall','shield','stone','obs','core','ar']:p==='kamikaze'?['bomb','dmg','sword','hp']:p==='chasseur'?['sword','dmg','sp','pick']:['sp','vamp','reg'];
      for(const id of list){ const it=SHOPMAP[id]; if(!it||!inRoster(id)) continue; if(id==='bomb'&&b.bomb>=3) continue; const inf=it.info(b); if(inf.ok===false||!canAfford(b,inf.cost)) continue; if(Math.random()<.55){ buy(b,id); if(id==='wall') b.walled=true; return; } }
    }
    _bb(b);
  };
}
/* ---------- gadgets spécifiques ---------- */
{ const _bg=botGadgets2;
  botGadgets2=function(b,foe,fd,nearCore,r,dt){
    const p=pers(b);
    if(p==='kamikaze'&&b.bomb>0&&fd<3.4*T&&Math.random()<dt*2.5){ throwBomb(b,'bomb',foe.x,foe.y); return true; }
    if(p==='ruse'&&b.cd.gad<=0&&(b.am.cloak||0)>0&&fd<9*T&&!(b.cloak>0)&&Math.random()<dt*1.2) return useGadget(b,'cloak',b.x,b.y);
    return _bg(b,foe,fd,nearCore,r,dt);
  };
}
