'use strict';
/* =====================  RETRAITS DÉFINITIFS · PARAPLUIE PASSIF · BRUME D'ÉQUIPE  ===================== */
{ const G=GONE_IDS, gone=id=>G.includes(id);
  for(let i=SHOP.length-1;i>=0;i--) if(gone(SHOP[i].id)) SHOP.splice(i,1);
  for(let i=ITEMS.length-1;i>=0;i--) if(gone(ITEMS[i].id)) ITEMS.splice(i,1);
  for(const id of G){ delete SHOPMAP[id]; delete GUNS[id]; delete PERM[id]; delete PERM_DEF[id]; if(typeof BOT_USES!=='undefined') BOT_USES.delete(id); }
  { const gi=SHOP.findIndex(x=>x.id==='storm'&&x.cat==='Gadgets'); if(gi>=0) SHOP.splice(gi,1); const w=SHOP.find(x=>x.id==='storm'); if(w) SHOPMAP.storm=w; } // « Katana-tempête » en gadget = doublon de l'arme
  const clean=(arr,key)=>{ for(let i=arr.length-1;i>=0;i--){ const v=key?arr[i][0]:arr[i]; if(gone(v)) arr.splice(i,1); } };
  clean(BOT_RANGED,true); clean(BOT_BUY,true); clean(BOT_OPTIONAL,false); if(typeof SIGS!=='undefined') clean(SIGS,false);
  if(typeof POOL_EXTRA!=='undefined') clean(POOL_EXTRA,false);
  if(typeof BARG!=='undefined'){ BARG.melee=BARG.melee.filter(i=>!gone(i)); BARG.gun=BARG.gun.filter(i=>!gone(i)); }
  if(typeof PERS!=='undefined') for(const k in PERS){ const p=PERS[k]; if(Array.isArray(p.likes)) p.likes=p.likes.filter(i=>!gone(i)); }
}
/* ---- parapluie planeur : passif tant qu'on est en vie, sans recharge ---- */
{ const _o=owned; owned=function(e,id){ if(id==='glide') return false; if(id==='heal'&&(e.healLeft||0)>.02) return true; return _o(e,id); }; // plus d'emplacement dans la barre
  PERM_DEF.glide=PERM.glide={cd:0,keep:true,cost:{bronze:30,silver:8}};
  const it=SHOPMAP.glide; if(it){ it.cat='Outils';
    it.info=e=>e.own.glide?{name:'Parapluie planeur',desc:'Équipé : actif tout seul dès que tu tombes.',cost:{},ok:false,tag:'PASSIF'}:{name:'Parapluie planeur (passif)',desc:'Toujours actif : dès que tu tombes, tu planes doucement et tu ne prends plus de dégâts de chute. Aucune recharge, rien à activer, gardé à ta mort.',cost:{bronze:30,silver:8}};
    it.buy=e=>{ e.own.glide=true; }; }
  TIPS2.glide='Passif : en chute, tu planes doucement (aucun dégât de chute)';
  const _u=update;
  update=function(dt){ for(const e of ents){ if(e.own&&e.own.glide&&e.alive&&!e.riding&&e.z>8&&e.vz<-30&&!(e.glide>.12)) e.glide=.2; } _u(dt); };
}
/* ---- brume magique : prix et description d'équipe ---- */
{ const it=SHOPMAP.cloak; if(it){ const old=it.info; it.info=function(e){ const r=old.call(this,e); if(!r||r.ok===false||!r.desc) return r; return Object.assign({},r,{desc:'Toi et ton équipe devenez invisibles 7 s (les ennemis ne vous voient plus de loin) et courez plus vite 2,5 s. '+(/recharge/.test(r.desc)?r.desc.replace(/^À volonté,?\s*/,'Utilisable à volonté, '):'')}); }; } }

/* ---- Eau bénite : immunité aux altérations quelques secondes (à utiliser AVANT d'être gelé) ---- */
ENT_NUM.push('bless');
{ const _m=makeEnt; makeEnt=function(a,b,c){ const e=_m(a,b,c); e.bless=0; return e; }; }
const BLESS_T=6, LAUGH_R=2*T, GAS=[];
{ const it=SHOPMAP.blessing; if(it){ const old=it.info; it.info=function(e){ const r=old.call(this,e); return Object.assign({},r,{desc:`Pendant ${BLESS_T} s, tu es insensible au gel, aux filets, à la brûlure, aux malédictions et aux bulles. À utiliser AVANT : une fois gelé, il est trop tard.`}); }; }
  const it2=SHOPMAP.laughgas; if(it2){ const old2=it2.info; it2.info=function(e){ const r=old2.call(this,e); return Object.assign({},r,{desc:'Se lance en cloche : crée un nuage de gaz sur une petite zone (2 cases) pendant 5 s. Les ennemis dedans glissent de rire et perdent le contrôle.'}); }; }
  TIPS2.blessing='Insensible au gel, filets, brûlure, malédiction pendant 6 s (inutilisable une fois gelé)'; TIPS2.laughgas='Lancé en cloche : un nuage qui fait glisser de rire les ennemis dans une petite zone'; }
{ const _u=useGadget2;
  useGadget2=function(e,id,wx,wy,ax,ay){
    if(id==='blessing'){ if(e.frozen>0||e.bubble>0||e.root>0){ floatTxt(e.x,e.y-36,'Trop tard : tu es bloqué !','#fca5a5',14); return false; }
      e.bless=BLESS_T; floatTxt(e.x,e.y-36,'INSENSIBLE','#7dd3fc',15); ring(e.x,e.y,T*1.5,'#7dd3fc',.5,true); burst(e.x,e.y,'#bae6fd',14,150,.6,3); return true; }
    if(id==='laughgas'){ let tx=wx,ty=wy;
      if(e.isBot||Math.hypot(tx-e.x,ty-e.y)<1.2*T){ const f=ents.filter(o=>o.alive&&o.team!==e.team).sort((a,b)=>Math.hypot(a.x-e.x,a.y-e.y)-Math.hypot(b.x-e.x,b.y-e.y))[0]; if(f&&e.isBot){ tx=f.x; ty=f.y; } else if(e.isBot) return false; }
      const dx=tx-e.x,dy=ty-e.y,d=Math.hypot(dx,dy)||1,m=Math.min(d,9*T);
      bombs.push({x:e.x,y:e.y,tx:e.x+dx/d*m,ty:e.y+dy/d*m,fuse:1.2,team:e.team,owner:e,kind:'gas',h:20}); e.swing=.15; e.swingMax=.15; sfx('whoosh',e.x,e.y); return true; }
    return _u(e,id,wx,wy,ax,ay); };
  const _ex=explode;
  explode=function(b){ if(b.kind!=='gas') return _ex(b);
    GAS.push({x:b.x,y:b.y,t:5,team:b.team,owner:b.owner,tk:0,laugh:new Set()}); ring(b.x,b.y,LAUGH_R,'#a3e635',.6,true); burst(b.x,b.y,'#d9f99d',24,200,.8,4); sfx('splash',b.x,b.y); };
  const _cb=createBomb; createBomb=function(b){ const g=_cb(b); if(b.kind==='gas'&&g.userData&&g.userData.body) g.userData.body.material.color.set('#84cc16'); return g; };
  const _up=update;
  update=function(dt){
    for(const e of ents){ if(e.bless>0){ e.bless-=dt; e.frozen=0; e.slow=0; e.root=0; e.burn=0; e.curse=0; e.bubble=0; e.slip=0; if(Math.random()<dt*3) burst(e.x,e.y-e.z-10,'#bae6fd',2,50,.5,2); } else e.bless=0; }
    _up(dt);
    for(const e of ents) if(e.bless>0){ e.frozen=0; e.slow=0; e.root=0; e.burn=0; e.curse=0; e.bubble=0; e.slip=0; }
    for(let i=GAS.length-1;i>=0;i--){ const g=GAS[i]; g.t-=dt; g.tk-=dt; if(g.t<=0){ GAS.splice(i,1); continue; }
      if(g.tk<=0){ g.tk=.35; burst(g.x+rnd(-1,1)*LAUGH_R*.7,g.y+rnd(-1,1)*LAUGH_R*.7,'#bef264',3,50,.7,3); if(Math.random()<.4) ring(g.x,g.y,LAUGH_R*(.5+Math.random()*.5),'#a3e635',.5,true); }
      for(const o of ents){ if(!o.alive||o.team===g.team||o.bless>0||Math.hypot(o.x-g.x,o.y-g.y)>LAUGH_R) continue;
        o.gasT=(o.gasT||0)-dt; if(!g.laugh.has(o)){ g.laugh.add(o); floatTxt(o.x,o.y-36,'MDR !','#d9f99d',16); }
        if(o.gasT<=0){ o.gasT=.5; const a=rnd(0,6.28); o.sdx=Math.cos(a); o.sdy=Math.sin(a); } o.slip=Math.max(o.slip,.6); } }
  };
  { const _n=newGame; newGame=function(){ _n(); GAS.length=0; }; }
  const _bg=botGadgets2;
  botGadgets2=function(b,foe,fd,nearCore,r,dt){ if(b.cd.gad<=0){ if((b.am.blessing||0)>0&&!(b.bless>0)&&!(b.frozen>0)&&fd<8*T&&r<dt*.35) return useGadget(b,'blessing',b.x,b.y);
      if((b.am.laughgas||0)>0&&fd>2*T&&fd<8*T&&r<dt*.5) return useGadget(b,'laughgas',foe.x,foe.y); }
    return _bg(b,foe,fd,nearCore,r,dt); };
}

/* =====================  HERSE (ex-palissade)  =====================
   Trois cases de pointes posées au sol : les ennemis qui marchent dessus sont ralentis et prennent des dégâts. Durée 45 s. */
const HERSES=[], HERSE_T=45;
function placeHerse(e,wx,wy,ax,ay){
  const tx=Math.floor(wx/T), ty=Math.floor(wy/T); if(Math.hypot((tx+.5)*T-e.x,(ty+.5)*T-e.y)>3.7*T){ floatTxt(e.x,e.y-34,'Trop loin : vise à moins de 3 cases','#fde68a',14); return false; }
  const horiz=Math.abs(ax)>Math.abs(ay); let n=0;
  for(let k=-1;k<=1;k++){ const x2=tx+(horiz?0:k), y2=ty+(horiz?k:0); if(!inb(x2,y2)) continue; const i=idx(x2,y2);
    if(floorT[i]===0||wallT[i]||spawnerAt(x2,y2)||protectedTile(x2,y2,e.team)) continue;
    const old=HERSES.find(h=>h.tx===x2&&h.ty===y2); if(old){ old.t=HERSE_T; old.hp=12; old.team=e.team; old.owner=e; n++; continue; }
    HERSES.push({tx:x2,ty:y2,x:(x2+.5)*T,y:(y2+.5)*T,team:e.team,owner:e,t:HERSE_T,hp:12}); chunks((x2+.5)*T,(y2+.5)*T,'#9ca3af',4); pop[i]=1; n++; }
  if(!n){ floatTxt(e.x,e.y-34,'Pose-la sur le sol de l\'île','#fde68a',14); return false; } sfx('buy'); return true;
}
{ const it=SHOPMAP.wallgad; if(it){ if(ITEMMAP.wallgad){ ITEMMAP.wallgad.n='Herse'; ITEMMAP.wallgad.ico='⛓️'; }
    const old=it.info; it.info=function(e){ const r=old.call(this,e); return Object.assign({},r,{name:String(r.name||'').replace(/^Palissade/,'Herse'),desc:'Pose 3 cases de pointes au sol pendant 45 s : les ennemis qui marchent dessus sont ralentis et prennent des dégâts.'}); }; }
  TIPS2.wallgad='Trois cases de pointes : les ennemis dessus sont ralentis et blessés';
  const _nw=newGame; newGame=function(){ _nw(); HERSES.length=0; }; }
{ const _u=update;
  update=function(dt){
    for(let i=HERSES.length-1;i>=0;i--){ const h=HERSES[i]; h.t-=dt; if(h.t<=0||h.hp<=0||floorT[idx(h.tx,h.ty)]===0){ burst(h.x,h.y,'#9ca3af',6,100,.4,3); HERSES.splice(i,1); continue; }
      for(const o of ents){ if(!o.alive||o.team===h.team||o.z>16||Math.abs(o.x-h.x)>T*.55||Math.abs(o.y-h.y)>T*.55) continue;
        o.slow=Math.max(o.slow,.6); o.hsT=(o.hsT||0)-dt; if(o.hsT<=0){ o.hsT=.4; hurt(o,1.3,h.owner,0,0); burst(o.x,o.y-4,'#f87171',3,70,.3,2); } } }
    _u(dt); };
  const _ex=explode;
  explode=function(b){ _ex(b); const R=(b.R||2.7*T)+T*.4; for(let i=HERSES.length-1;i>=0;i--){ const h=HERSES[i]; if(b.team!==undefined&&h.team===b.team) continue; if(Math.hypot(h.x-b.x,h.y-b.y)<R){ burst(h.x,h.y,'#9ca3af',8,120,.5,3); HERSES.splice(i,1); } } };
  const _nc=netCommon; netCommon=function(){ const c=_nc(); if(HERSES.length) c.hs=HERSES.map(h=>[h.tx,h.ty,h.team,Math.round(h.t)]); return c; };
  const _na=netApplySnap; netApplySnap=function(m){ _na(m); const old=new Map(HERSES.map(h=>[h.tx+','+h.ty,h])); HERSES.length=0; for(const a of (m.hs||[])){ const h=old.get(a[0]+','+a[1])||{tx:a[0],ty:a[1],x:(a[0]+.5)*T,y:(a[1]+.5)*T,hp:12}; h.team=a[2]; h.t=a[3]; HERSES.push(h); } };
}
const HM={map:new Map(),mat:null};
{ const _r=render3d;
  render3d=function(dt){
    if(renderer&&scene&&game.state!=='menu'){ const live=new Set();
      for(const h of HERSES){ const k=h.tx+','+h.ty; live.add(k); let g=HM.map.get(k);
        if(!g){ const mt=new THREE.MeshStandardMaterial({color:0xc4ccd6,metalness:.7,roughness:.35,flatShading:true}), wd=new THREE.MeshStandardMaterial({color:0x5b4326,flatShading:true});
          g=new THREE.Group(); for(const z of [-.32,.32]){ const bm=new THREE.Mesh(GEO.box,wd); bm.scale.set(.92,.07,.08); bm.position.set(0,.05,z); g.add(bm); }
          for(let a=0;a<3;a++)for(let b=0;b<3;b++){ const sp=new THREE.Mesh(GEO.cone,mt); sp.scale.set(.07,.4,.07); sp.position.set(-.3+a*.3,.25,-.3+b*.3); g.add(sp); }
          g.position.set((h.tx+.5),0.02,(h.ty+.5)); scene.add(g); HM.map.set(k,g); }
        g.scale.y=Math.min(1,h.t/1.5); }
      for(const [k,g] of HM.map) if(!live.has(k)){ scene.remove(g); HM.map.delete(k); } }
    _r(dt); };
}

/* =====================  MARTEAU DE RÉPARATION : OBJET PERMANENT, CLIC MAINTENU  =====================
   Reconstruit un par un les blocs détruits de ton équipe (45 s), deux fois plus vite qu'on ne les détruit. */
{ PERM_DEF.repairhammer=PERM.repairhammer={cd:0,keep:true,cost:{bronze:35,silver:8}};
  const it=SHOPMAP.repairhammer; if(it){ it.cat='Défense';
    it.info=e=>e.own.repairhammer?{name:'Marteau de réparation',desc:'Équipé : maintiens le clic pour reconstruire.',cost:{},ok:false,tag:'PERMANENT'}:{name:'Marteau de réparation (permanent)',desc:'Maintiens le clic : tu rebâtis un à un les blocs détruits de ton équipe (45 s) dans 6 cases, deux fois plus vite qu\'on les détruit. Rien n\'est consommé.',cost:{bronze:35,silver:8}};
    it.buy=e=>{ e.own.repairhammer=true; if(e.isBot) e.am.repairhammer=99; }; }
  TIPS2.repairhammer='Maintiens le clic : reconstruit les blocs détruits de ton équipe (permanent)';
}
const RH_R=6*T;
function rhPick(e){ const now=game.t; let best=null,bd=1e9; for(let k=0;k<wreck.length;k++){ const w=wreck[k]; if(now-w.t>45||w.own!==e.team) continue; const x=w.i%W, y=(w.i/W)|0; const d=Math.hypot((x+.5)*T-e.x,(y+.5)*T-e.y); if(d>RH_R||d>=bd) continue;
    if(w.wall?(wallT[w.i]!==0||wallBlockedByEnt((x+.5)*T,(y+.5)*T)):(floorT[w.i]!==0)) continue; bd=d; best=k; } return best; }
function rhBuild(w){ const x=w.i%W, y=(w.i/W)|0;
  if(w.wall){ wallT[w.i]=w.wall; hpW[w.i]=BHP[w.wall]; ownW[w.i]=w.own; } else { floorT[w.i]=w.floor; hpF[w.i]=BHP[w.floor]||10; ownF[w.i]=w.own; }
  pop[w.i]=1; burst((x+.5)*T,(y+.5)*T,'#fde68a',4,90,.4,3); sfx('tick',(x+.5)*T,(y+.5)*T); }
const rhNeed=w=>Math.max(.12,(BHP[w.wall||w.floor]||10)*.03); // ≈ moitié du temps qu'il faut pour détruire le bloc
{ const _u=update;
  update=function(dt){
    for(const e of ents){ if(!e.alive||!e.own||!e.own.repairhammer||e.isBot) continue; const sel=e===player?selId:(e.inp&&e.inp.sel), down=e===player?mouse.down:(e.inp&&e.inp.down);
      if(sel!=='repairhammer'||!down||e.frozen>0||game.paused){ e.rhP=0; e.rhK=-1; continue; }
      const k=rhPick(e); if(k===null){ e.rhP=0; e.rhMsg=(e.rhMsg||0)-dt; if(e.rhMsg<=0){ e.rhMsg=1.2; floatTxt(e.x,e.y-34,'Rien à réparer','#fde68a',13); } continue; }
      const w=wreck[k]; if(e.rhKey!==w.i){ e.rhKey=w.i; e.rhP=0; } e.rhP+=dt; e.swing=Math.max(e.swing,.1); e.swingMax=.25; e.rhNeed=rhNeed(w);
      if(e.rhP>=e.rhNeed){ rhBuild(w); wreck.splice(k,1); e.rhP=0; e.rhKey=-1; } }
    _u(dt); };
  const _ug=useGadget2; useGadget2=function(e,id,wx,wy,ax,ay){ if(id==='repairhammer') return false; return _ug(e,id,wx,wy,ax,ay); };
  const _bg=botGadgets2; botGadgets2=function(b,foe,fd,nearCore,r,dt){ if(b.own&&b.own.repairhammer&&nearCore&&wreck.length&&r<dt*1.5){ const k=rhPick(b); if(k!==null){ rhBuild(wreck[k]); wreck.splice(k,1); return true; } } return _bg(b,foe,fd,nearCore,r,dt); };
  const _dh=drawHud; drawHud=function(){ _dh(); if(game.state!=='play'||!ctx||!player||!player.alive||selId!=='repairhammer'||!player.own.repairhammer) return;
    ctx.save(); ctx.setTransform(DPR,0,0,DPR,0,0); const s=w2s(player.x,player.y,66); if(s[2]){ const w=54, p=player.rhNeed?Math.min(1,(player.rhP||0)/player.rhNeed):0; ctx.fillStyle='#0009'; ctx.fillRect(s[0]-w/2,s[1]-4,w,7); ctx.fillStyle='#fbbf24'; ctx.fillRect(s[0]-w/2,s[1]-4,w*p,7); ctx.font='bold 11px system-ui'; ctx.textAlign='center'; ctx.fillStyle='#fde68a'; ctx.fillText('🔨 maintiens le clic',s[0],s[1]-9); ctx.textAlign='left'; }
    ctx.restore(); };
}

/* =====================  BOUTIQUE : NOUVELLES CATÉGORIES  =====================
   Construction · Mêlée · Distance · Offensif · Pièges · Mobilité · Soutien · Défense · Base · Reliques
   Dans chaque catégorie, les objets sont classés du moins cher au plus cher. */
{ const CAT={
  Construction:['wool','wood','stone','obs','coral','iceblk','pick','bridge','bridge2','trampo','boat'],
  'Mêlée':['sword','glove','baa','rapier','axe','frost','flameblade','blood','spear','storm','hook'],
  Distance:['bow','gun','smg','shotgun','sniper','rocket','boomerang','ice','flame','trident','gatling','javelin','flarebow','dueling','musketeer','harpoongun','sling','rubberchicken'],
  Offensif:['bomb','repel','vortex','cluster','anchor','chicken','coco','sharkbait','laughgas','bottlestorm','rocketpilot','bombraft'],
  'Pièges':['anchortrap','net','mine','banana','barrel','wallgad'],
  'Mobilité':['grap','jet','dash','tp','glide','haste','recall','plume'],
  Soutien:['heal','grog','blessing','rage','cloak','shrink','giant','spy','parrotmsg','magnet','fishrod','swap','pickpocket'],
  'Défense':['turret','guard','repair','flag','buoy','aegis','shield','core','wall','hull','repairhammer','mirror','arm_leather','arm_iron','arm_gold','arm_diamond']
};
  const where={}; for(const c in CAT) for(const id of CAT[c]) where[id]=c;
  const OLD={Blocs:'Construction',Combat:'Mêlée',Armes:'Distance',Outils:'Soutien',Gadgets:'Offensif'};
  for(const s of SHOP){ s.cat=where[s.id]||OLD[s.cat]||s.cat; }
  const order=['Construction','Mêlée','Distance','Offensif','Pièges','Mobilité','Soutien','Défense','Base','Reliques'];
  TABS.length=0; TABS.push(...order); shopTab='Construction';
  Object.assign(CAT_BADGE,{Construction:'🧱','Mêlée':'⚔️',Distance:'💥',Offensif:'✨','Pièges':'🪤','Mobilité':'👟',Soutien:'🧪'});
  const val={bronze:1,silver:5,gold:25,diamond:70}, dm=makeEnt(0,false,'x');
  const worth=s=>{ try{ const c=s.info(dm).cost||{}; let v=0; for(const k in c) v+=(val[k]||0)*c[k]; return v; }catch(e){ return 0; } };
  const idx0=new Map(SHOP.map((s,i)=>[s,i])), rank=c=>order.indexOf(c);
  const sorted=[...SHOP].sort((a,b)=>{ const ra=rank(a.cat),rb=rank(b.cat); if(ra!==rb) return ra-rb; if(a.cat==='Base') return idx0.get(a)-idx0.get(b); return worth(a)-worth(b)||idx0.get(a)-idx0.get(b); });
  SHOP.length=0; SHOP.push(...sorted);
}

/* =====================  RATION DE BORD : RÉGÉNÉRATION PROGRESSIVE, CLIC MAINTENU  =====================
   Une ration = 100 % de ta vie en 5 s (20 % par seconde). Relâcher n'en gaspille rien : le reste de la ration est gardé. */
{ const _u=update, RATE=.2;
  update=function(dt){
    for(const e of ents){ if(!e.alive||e.isBot||e.frozen>0||game.paused||game.state!=='play') continue; const sel=e===player?selId:(e.inp&&e.inp.sel), down=e===player?mouse.down:(e.inp&&e.inp.down);
      if(sel!=='heal'||!down){ e.hlT=0; continue; } const mx=maxhp(e); if(e.hp>=mx-.01) continue;
      if((e.healLeft||0)<=.001){ if((e.am.heal||0)>0){ e.am.heal--; e.healLeft=1; } else continue; }
      const amt=Math.min(e.healLeft,RATE*dt,(mx-e.hp)/mx); e.healLeft-=amt; e.hp+=amt*mx; e.swing=Math.max(e.swing,.1); e.swingMax=.25; e.hlT=(e.hlT||0)-dt; e.hlA=(e.hlA||0)+amt*mx;
      if(e.hlT<=0){ e.hlT=.35; burst(e.x,e.y-e.z-10,'#86efac',3,60,.6,3); if(e.hlA>=1){ floatTxt(e.x,e.y-36-e.z,'+'+Math.round(e.hlA)+' ♥','#4ade80',14); e.hlA=0; } } }
    _u(dt); };
  const it=SHOPMAP.heal; if(it){ const old=it.info; it.info=function(e){ const r=old.call(this,e); return Object.assign({},r,{desc:'Maintiens le clic : tu régénères 20 % de ta vie par seconde (une ration = tout en 5 s). Relâcher ne gaspille rien : le reste de la ration est gardé.'}); }; }
  TIPS2.heal='Maintiens le clic : +20 % de vie par seconde (une ration = 5 s)'; if(typeof TIPS!=='undefined') TIPS.heal='Maintiens le clic : +20 % de vie par seconde';
  const _dh=drawHud; drawHud=function(){ _dh(); if(game.state!=='play'||!ctx||!player||!player.alive||selId!=='heal') return; ctx.save(); ctx.setTransform(DPR,0,0,DPR,0,0); const s=w2s(player.x,player.y,66);
    if(s[2]){ const w=54, p=Math.max(0,Math.min(1,player.healLeft||0)); ctx.fillStyle='#0009'; ctx.fillRect(s[0]-w/2,s[1]-4,w,7); ctx.fillStyle='#4ade80'; ctx.fillRect(s[0]-w/2,s[1]-4,w*p,7); ctx.font='bold 11px system-ui'; ctx.textAlign='center'; ctx.fillStyle='#bbf7d0'; ctx.fillText('🍖 maintiens le clic · '+(player.am.heal||0)+' ration'+((player.am.heal||0)>1?'s':''),s[0],s[1]-9); ctx.textAlign='left'; }
    ctx.restore(); };
}
