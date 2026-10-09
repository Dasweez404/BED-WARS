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
{ const _o=owned; owned=function(e,id){ if(id==='glide') return false; return _o(e,id); }; // plus d'emplacement dans la barre
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
