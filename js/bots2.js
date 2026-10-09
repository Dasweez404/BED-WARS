'use strict';
/* =====================  PERSONNALITÉS DES BOTS (option du menu « Bots »)  =====================
   Chaque capitaine a un caractère : objets préférés, façon de choisir ses cibles, réactions. */
const PERS={
  ruse:{ico:'🦊',n:'Rusé',cls:'matelot',d:'Furtif : espionne, vole, vise le coffre le plus faible et fuit quand il va mal.',likes:['cloak','tp','stickybomb','pickpocket','decoy','swap','dash','haste','net','mine','springs']},
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
      if(id==='kamikaze') e.ai.leaveAt*=.45; else if(id==='batisseur') e.ai.leaveAt=e.ai.leaveAt*1.5+4; else if(id==='marchand') e.ai.leaveAt*=1.1;
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
    if(p==='chasseur'&&Math.random()<.4&&ents.some(o=>o.alive&&o.team!==b.team)){ ai.mode='hunt'; ai.bounty=true; return; }
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
    if(b.ai&&b.ai.bounty&&b.ai.mode==='hunt'){ let tg=null,bk=-1; const rv=b.ai.revenge; if(rv&&rv.until>game.t&&rv.tg&&rv.tg.alive&&rv.tg.team!==b.team) tg=rv.tg; else for(const o of ents){ if(!o.alive||o.team===b.team) continue; const sc=o.kills*10+(o===player?5:0)+(o.res.diamond||0)+Math.random()*.01; if(sc>bk){ bk=sc; tg=o; } } if(tg){ gx=Math.floor(tg.x/T); gy=Math.floor(tg.y/T); } }
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

/* =====================  REPLI ET DÉFENSE  =====================
   Un bot qui attaque sans succès (trop de dégâts reçus, aucun coup porté, morts répétées) rentre se refaire une santé,
   achète de l'équipement, puis repart. Si son coffre est attaqué (ou des ennemis rôdent chez lui), les bots proches rentrent et fortifient. */
let UPD=0;
{ const _h=hurt;
  hurt=function(e,a,by,kx,ky){
    const hp0=e.hp; _h(e,a,by,kx,ky); const d=hp0-e.hp;
    if(d>0){
      if(e.ai&&!e.remote){ (e.ai.taken=e.ai.taken||[]).push([game.t,d]); if(e.ai.taken.length>40) e.ai.taken.shift(); }
      if(by&&by!==e&&by.ai&&!by.remote){ by.ai.dealtT=game.t; }
    }
  };
  const _d=die;
  die=function(e,by,sea){
    const ai=e.ai, mode=ai&&ai.mode, was=e.alive; _d(e,by,sea);
    if(was&&!e.alive&&ai&&!e.remote){ if(mode==='raid'||mode==='hunt') ai.fails=(ai.fails||0)+1; ai.taken=[]; }
    if(was&&by&&by.ai&&!by.remote&&by!==e){ by.ai.fails=0; by.ai.dealtT=game.t; }
  };
  const _dt=damageTile;
  damageTile=function(tx,ty,dmg,src,layer){
    if(src&&src.ai&&!src.remote&&inb(tx,ty)&&wallT[idx(tx,ty)]===CORE&&ownW[idx(tx,ty)]!==src.team){ src.ai.dealtT=game.t; src.ai.fails=0; }
    return _dt(tx,ty,dmg,src,layer);
  };
  const _u=updateEvents;
  updateEvents=function(dt){
    _u(dt); UPD++; if(game.state!=='play'||game.tut) return;
    for(const td of TD){ const ci=idx(td.bx,td.by), hp=wallT[ci]===CORE?hpW[ci]:0; if(td.hpSeen!==undefined&&hp<td.hpSeen-.05) td.underAtkT=game.t; td.hpSeen=hp;
      let n=0; const cx=(td.bx+.5)*T, cy=(td.by+.5)*T; for(const o of ents) if(o.alive&&o.team!==td.id&&Math.hypot(o.x-cx,o.y-cy)<11*T) n++; td.threat=n; if(n) td.threatT=game.t; }
  };
}
function botRetreat(b,why){
  const ai=b.ai, t=game.t; ai.mode='home'; ai.bounty=false; ai.foe=null; ai.leaveAt=ai.t+rnd(24,38)*(1+(ai.fails||0)*.35); ai.stuffT=t+34; ai.retreatCd=t+40; ai.buyT=0; ai.taken=[];
  floatTxt(b.x,b.y-46,why==='def'?'Défense !':'Repli !',why==='def'?'#93c5fd':'#fde68a',15);
}
{ const _bt=botThink;
  botThink=function(b,dt){
    const ai=b.ai;
    if(ai&&b.alive&&!game.tut&&!b.remote&&b.hp!==undefined){
      const t=game.t, td=TD[b.team], mhp=maxhp(b), away=ai.mode==='raid'||ai.mode==='hunt'||ai.mode==='res';
      // 1) attaque sans succès -> repli
      if((ai.mode==='raid'||ai.mode==='hunt')&&!(ai.retreatCd>t)&&TD[b.team].coreAlive){
        let taken=0; if(ai.taken) for(const [tt,d] of ai.taken) if(t-tt<12) taken+=d;
        const stale=t-(ai.dealtT||-99)>9, kam=ai.pers==='kamikaze', bat=ai.pers==='batisseur';
        if(((taken>mhp*(bat?.5:.7)&&stale&&!kam)||(ai.fails||0)>=(kam?3:2)||(b.hp<mhp*.35&&stale&&!kam))) botRetreat(b,'atk');
      }
      // 2) coffre attaqué ou ennemis chez nous -> les bots proches rentrent défendre
      const pressed=t-(td.underAtkT||-99)<10||(td.threat>=2&&t-(td.threatT||-99)<4);
      if(pressed&&!(ai.defendT>ai.t)){
        const dd=Math.hypot(b.x-(td.bx+.5)*T,b.y-(td.by+.5)*T)/T;
        if(ai.mode==='home'){ ai.defendT=ai.t+30; ai.buyT=0; }
        else if(dd<28&&!(ai.pers==='kamikaze'&&dd>12)){ botRetreat(b,'def'); ai.defendT=ai.t+30; ai.leaveAt=ai.t+34; }
      }
    }
    _bt(b,dt);
  };
  const _bb=botBuy;
  botBuy=function(b){
    const ai=b.ai;
    if(ai&&nearBase(b)&&(ai.stuffT>game.t||ai.defendT>ai.t)){
      const def=ai.defendT>ai.t, list=def?['wall','shield','turret2','turret','guard','net','mine','stone','obs','ar','core']:['sword','pick','hp','ar','dmg','heal','bomb','sp'];
      const cap={bomb:3,heal:3,turret:1,turret2:1,guard:2,net:2,mine:3};
      for(const id of list){ const it=SHOPMAP[id]; if(!it||!inRoster(id)) continue;
        if(id==='wall'&&b.walled) continue; if(cap[id]&&((b.am[id]||0)>=cap[id]||(id==='bomb'&&b.bomb>=cap[id]))) continue; if(id==='stone'&&b.blocks[4]>=20) continue; if(id==='obs'&&b.blocks[5]>=8) continue;
        const inf=it.info(b); if(inf.ok===false||!canAfford(b,inf.cost)) continue; buy(b,id); if(id==='wall') b.walled=true; return; }
    }
    _bb(b);
  };
}


/* =====================  BOTS PLUS FINS  =====================
   pings d'équipe, feintes, adaptation à ton style de jeu, rivaux qui reviennent se venger. */
const PMEM={melee:0,gun:0,build:0,gad:0,style:'',t:0,said:false};
const botPing=(b,k,x,y)=>{ if(!player||b.team!==player.team||game.tut) return; const td=TD[b.team]; if((td.botPingT||0)>game.t) return; td.botPingT=game.t+14; addPing(b.team,x,y,k,b.name,b); };
{ const _u=updateEvents;
  updateEvents=function(dt){
    _u(dt); if(game.state!=='play'||game.tut) return;
    // mémoire du style de jeu des humains
    for(const e of ents){ if(e.isBot||!e.alive) continue; const down=e===player?(mouse.down||mouse.clicked):(e.inp&&e.inp.down); if(!down) continue; const sel=e===player?selId:(e.inp&&e.inp.sel); if(!sel) continue;
      const k=(sel==='sword'||sel==='glove'||sel==='hammer')?'melee':(GUNS[sel]||sel==='bomb'||sel==='bow')?'gun':(sel==='block'||sel==='pick')?'build':'gad'; PMEM[k]+=dt; }
    PMEM.t+=dt; if(PMEM.t>12){ PMEM.t=0; const tot=PMEM.melee+PMEM.gun+PMEM.build+PMEM.gad; if(tot>25){ const top=['melee','gun','build','gad'].sort((a,b)=>PMEM[b]-PMEM[a])[0]; if(PMEM[top]/tot>.42){ if(PMEM.style!==top&&!PMEM.said){ PMEM.said=true; msg('🤖 Les capitaines étudient ton style de jeu…','#c4b5fd'); } PMEM.style=top; } } }
    // danger près d'un coffre allié : un bot de l'équipe du joueur prévient
    for(const td of TD){ if(td.id!==player.team||td.threat<1||(td.dangerT||0)>game.t) continue; const cx=(td.bx+.5)*T, cy=(td.by+.5)*T; let f=null,bd=1e9; for(const o of ents){ if(!o.alive||o.team===td.id) continue; const d=Math.hypot(o.x-cx,o.y-cy); if(d<11*T&&d<bd){ bd=d; f=o; } } const b=td.members.find(m=>m.isBot&&m.alive); if(f&&b){ td.dangerT=game.t+20; botPing(b,'danger',f.x,f.y); } }
  };
  const _d=die;
  die=function(e,by,sea){ const was=e.alive; _d(e,by,sea);
    if(was&&!e.alive&&e.isBot&&e.ai&&!e.remote&&by&&by!==e&&!by.isBot&&by.team!==e.team){ e.ai.revenge={tg:by,until:game.t+75}; if(typeof addEmote==='function') addEmote(e,'😡'); } };
  const _pg=pickGoal;
  pickGoal=function(b){ const rv=b.ai.revenge;
    if(rv&&rv.until>game.t&&rv.tg&&rv.tg.alive&&rv.tg.team!==b.team&&Math.random()<.85){ b.ai.mode='hunt'; b.ai.bounty=true; floatTxt(b.x,b.y-44,'Revanche !','#fca5a5',15); return; }
    _pg(b); };
  const _bt=botThink;
  botThink=function(b,dt){
    const ai=b.ai; if(!ai||!b.alive||game.tut||b.remote) return _bt(b,dt);
    const t=game.t, mhp=maxhp(b);
    // feinte : fausse retraite puis retour en force
    if(ai.feint>0){ ai.feint-=dt; const td=TD[b.team]; b.held='sword'; steerSafe(b,(td.bx+.5)*T-b.x,(td.by+.5)*T-b.y); if(ai.feint<=0){ b.rage=Math.max(b.rage||0,3.5); floatTxt(b.x,b.y-46,'Surprise !','#fb923c',16); ring(b.x,b.y,T*1.4,'#fb923c',.5,true); } return; }
    if(ai.foe&&ai.foe.alive&&b.hp<mhp*.65&&!(ai.feintCd>t)&&(ai.pers==='ruse'||ai.sly)&&Math.random()<dt*.3){ const d=Math.hypot(ai.foe.x-b.x,ai.foe.y-b.y); if(d>2.5*T&&d<8*T){ ai.feint=1.7; ai.feintCd=t+26; floatTxt(b.x,b.y-44,'Aïe… je recule !','#fde68a',13); } }
    if(ai.sly===undefined) ai.sly=Math.random()<.35;
    const m0=ai.mode; _bt(b,dt);
    if(ai.mode!==m0&&b.team===player.team){
      if(ai.mode==='raid'&&TD[ai.target]) botPing(b,'atk',(TD[ai.target].bx+.5)*T,(TD[ai.target].by+.5)*T);
      else if(ai.mode==='res'&&ai.goal) botPing(b,'loot',(ai.goal[0]+.5)*T,(ai.goal[1]+.5)*T);
    }
  };
  // les bots s'adaptent au style du joueur
  const _bb=botBuy;
  botBuy=function(b){
    if(b.ai&&PMEM.style&&nearBase(b)&&!game.tut&&Math.random()<.5){
      const L={gun:['ar','aegis','shield','hp'],melee:['sniper','rocket','gun','bow','boomerang','bomb'],build:['bomb','rocket','quake','cluster','pick'],gad:['dmg','ar','hp']}[PMEM.style]||[];
      for(const id of L){ const it=SHOPMAP[id]; if(!it||!inRoster(id)) continue; if(id==='bomb'&&b.bomb>=3) continue; const inf=it.info(b); if(inf.ok===false||!canAfford(b,inf.cost)) continue; buy(b,id); return; }
    }
    _bb(b);
  };
  const _nr=botRetreat;
  botRetreat=function(b,why){ _nr(b,why); if(why==='def'){ const td=TD[b.team]; botPing(b,'def',(td.bx+.5)*T,(td.by+.5)*T); } };
  const _ng=newGame; newGame=function(){ _ng(); PMEM.melee=PMEM.gun=PMEM.build=PMEM.gad=0; PMEM.style=''; PMEM.said=false; PMEM.t=0; };
}

/* =====================  BOTS : PLUS D'ARMES, DE GADGETS ET DE RELIQUES  =====================
   Ils achètent davantage (armes à feu d'abord, puis reliques et gadgets utilisables), engagent de plus loin
   quand ils ont une arme à distance, et tirent / lancent leurs gadgets bien plus souvent. */
for(const id in GUNS){ if(BOT_RANGED.some(r=>r[0]===id)||id==='bow'||id==='woolgun') continue; const g=GUNS[id]; BOT_RANGED.push([id,g.pel>1?0:1.2,Math.max(3,Math.min(10,g.sp*g.life/T*.75))]); }
const BOT_USES=new Set(['heal','anchor','kraken','barrage','flag','storm','cluster','chicken','vortex','haste','cloak','springs','dash','mine','banana','turret','guard','turret2','wallgad','frostnova','quake','aegis','siren','coco','decoy','swap','grog','firecracker','sharkbait','smokebomb','lasso','meteor','hurricane','rod','crabs','hull','rage','blessing','stonewall','battery','raid','laughgas','sneeze','giant','shrink','bananarow','stickybomb','pickpocket','bottlestorm','net','buoy','tp','repair']);
function botWish(b){
  if(!nearBase(b)||b.sword<1||totalBlocks(b)<14) return false;
  const guns=Object.keys(b.own).filter(k=>GUNS[k]&&b.own[k]).length, cands=[];
  for(const it of SHOP){ const id=it.id; if(!inRoster(id)||!ITEMMAP[id]&&!RELICS[id]) continue; let w=0;
    if(typeof SW2!=='undefined'&&SW2[id]){ if(Object.keys(SW2).some(k=>b.own[k])) continue; w=3.2; }
    else if(GUNS[id]){ if(b.own[id]||guns>=4) continue; w=guns<1?6:guns<2?4:1.5; }
    else if(RELICS[id]){ if(b.relics&&b.relics[id]) continue; if(RELICS[id].lose&&b.res.gold<8) continue; w=2.6; }
    else if(BOT_USES.has(id)){ if((b.am[id]||0)>=2) continue; w=({heal:2.4,aegis:2,cloak:1.6,rage:1.6,cluster:1.6,kraken:1.5,storm:1.5})[id]||1.2; }
    else continue;
    const inf=it.info(b); if(inf.ok===false||!inf.cost||!canAfford(b,inf.cost)) continue;
    // on ne vide pas toute la bourse d'un coup
    const tot=Object.entries(inf.cost).reduce((a,[k,v])=>a+v*({bronze:1,silver:3,gold:9,diamond:18})[k],0), wealth=b.res.bronze+b.res.silver*3+b.res.gold*9+b.res.diamond*18; if(tot>wealth*.85) continue;
    cands.push([it,w]); }
  if(!cands.length) return false; let sum=cands.reduce((a,c)=>a+c[1],0), r=Math.random()*sum; for(const [it,w] of cands){ r-=w; if(r<=0){ return buy(b,it.id); } } return false;
}
{ const _bb=botBuy;
  botBuy=function(b){ if(b.ai&&!game.tut&&!b.remote){ b.ai.buyT=Math.min(b.ai.buyT||99,getD().buyT*.7); if(Math.random()<.65&&botWish(b)) return; } _bb(b); };
  const _bt=botThink;
  botThink=function(b,dt){
    const ai=b.ai; if(!ai||!b.alive||b.remote||game.tut) return _bt(b,dt);
    const D=getD(), e0=D.engage, a0=D.aggr, u0=D.use; let rng=0; for(const [id,a,z] of BOT_RANGED) if(b.own[id]) rng=Math.max(rng,z); if(b.own.bow) rng=Math.max(rng,9);
    const guns=Object.keys(b.own).filter(k=>GUNS[k]&&b.own[k]).length; if(rng>0){ D.engage=Math.max(e0,Math.min(10,rng*.8)); D.aggr=a0*(1+Math.min(.75,guns*.25)); } D.use=u0*1.35;
    try{ _bt(b,dt); } finally{ D.engage=e0; D.aggr=a0; D.use=u0; }
    const f=ai.foe; if(f&&f.alive&&!(ai.react>0)&&!(b.frozen>0)&&!(b.bubble>0)&&!(ai.feint>0)){ const fd=dist(b,f);
      if(guns+(b.own.bow?1:0)+(b.own.woolgun?1:0)>0&&Math.random()<dt*3.2*u0) botRanged(b,fd);
      if(b.cd.gad<=0&&Math.random()<dt*1.5*u0) botGadgets(b,f,fd,dt,Math.hypot(f.x-(TD[b.team].bx+.5)*T,f.y-(TD[b.team].by+.5)*T)<8*T); }
  };
}
/* ils dépensent leur butin avant de repartir, et rentrent faire du shopping quand ils sont riches */
const botWealth=b=>b.res.bronze+b.res.silver*3+b.res.gold*9+b.res.diamond*18;
{ const _pg=pickGoal;
  pickGoal=function(b){
    const ai=b.ai;
    if(!game.tut&&nearBase(b)&&botWealth(b)>=30&&(ai.shopTries||0)<4){ ai.shopTries=(ai.shopTries||0)+1; if(botWish(b)){ ai.mode='home'; ai.leaveAt=ai.t+3.5; floatTxt(b.x,b.y-44,'🛒','#fde68a',16); return; } }
    ai.shopTries=0; _pg(b);
  };
  const _bt=botThink;
  botThink=function(b,dt){
    const ai=b.ai;
    if(ai&&b.alive&&!b.remote&&!game.tut&&TD[b.team].coreAlive&&(ai.mode==='raid'||ai.mode==='hunt'||ai.mode==='res')&&!ai.foe&&!(ai.shopTrip>game.t)&&botWealth(b)>=85&&Math.random()<dt*.25){
      ai.shopTrip=game.t+60; ai.mode='home'; ai.leaveAt=ai.t+9; ai.buyT=0; ai.bounty=false; floatTxt(b.x,b.y-44,'Je vais faire les boutiques !','#fde68a',13); }
    _bt(b,dt);
  };
}
