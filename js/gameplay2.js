'use strict';
/* =====================  GAMEPLAY 2  =====================
   • moins de doublons : les armes gelantes sont regroupées (Harpon givré), moins de bombes, moins de tourelles, moins d'objets de saut
   • sorts de départ (option) : chaque pirate choisit 2 sorts qui se rechargent tout seuls
   • combos élémentaires avec beaucoup de retours visuels : feu × bois/laine, glace × eau, feu × bombes/mines */
ITEMMAP.block.ico='🪵';
/* ---------- 1. fusions ---------- */
const GONE=['blowpipe','firecracker','stickybomb','turret2','cannonman','launcher']; // sarbacane → Harpon givré · pétard/bombe collante → Bombe · Canon givrant → Canon de pont · Homme-canon → Canon d'embarquement
for(const id of GONE){ const i=SHOP.findIndex(s=>s.id===id); if(i>=0) SHOP.splice(i,1); const it=SHOPMAP[id]; if(it) it.info=()=>({name:ITEMMAP[id]?ITEMMAP[id].n:id,desc:'Retiré',cost:{},ok:false}); }
{ // descriptions claires et distinctes
  const setD=(id,txt)=>{ const it=SHOPMAP[id]; if(!it) return; const o=it.info; it.info=function(e){ const r=o.call(this,e); return r.ok===false?r:Object.assign({},r,{desc:txt}); }; };
  setD('ice','Gèle la cible un instant. Tiré au-dessus de l\'eau, il fige la mer en un pont de glace qui fond au bout de 9 s (combo).');
  setD('turret','Canon de pont : tire seul sur les ennemis proches jusqu\'à ce qu\'on le détruise.');
  setD('bomb','Bombe : explosion de zone qui casse les blocs. La flamme la fait exploser en chaîne.');
  setD('cluster','Bombe à fragmentation : se divise en petites bombes sur une large zone.');
  setD('springs','Bottes de mousse (25 s) : sauts 2× plus hauts et aucun dégât de chute.');
  setD('plume','Plume de perroquet (25 s) : jusqu\'à 3 sauts supplémentaires en l\'air.');
  setD('glide','Parapluie planeur (9 s) : tu planes lentement vers le sol, utile pour traverser un vide.');
  setD('dash','Élan du flibustier : une propulsion horizontale instantanée (esquive, fuite ou attaque).');
  setD('trampo','Trampoline posé au sol : projette en l\'air quiconque marche dessus (tes alliés aussi).');
  setD('launcher','Canon d\'embarquement : tu es propulsé très loin puis tu planes, sans dégât à l\'atterrissage.');
}
/* ---------- 2. sorts de départ ---------- */
Object.assign(game.opts,{sig:1});
const SIGS=['heal','cloak','springs','vortex','net','decoy','tp','haste'], SIG_CD=30;
const sigsOn=()=>game.opts.sig===undefined?true:!!(game.opts.sig|0);
let SIGUI=null;
function sigGrant(e,ids){ e.sig=ids.slice(0,2); e.sigT={}; for(const id of e.sig){ e.am[id]=Math.max(1,e.am[id]||0); e.sigT[id]=0; } if(e===player&&typeof syncBar==='function') syncBar(e); }
function sigRandom(e){ const pool=SIGS.filter(id=>ITEMMAP[id]), a=[]; while(a.length<2&&pool.length) a.push(pool.splice(Math.floor(Math.random()*pool.length),1)[0]); sigGrant(e,a); }
(function css(){ const st=document.createElement('style'); st.textContent=`
  #sigs{position:fixed;right:12px;top:206px;z-index:6;width:208px;display:none;background:rgba(15,23,42,.88);border:2px solid #fde68a;border-radius:14px;padding:8px 10px;color:#fff6e0;font:600 12px sans-serif;text-align:center;max-width:96vw;box-sizing:border-box}
  body.tc #sigs{top:150px}
  #sigs .row{display:flex;gap:4px;justify-content:center;flex-wrap:wrap;margin-top:6px}
  #sigs button{width:44px;height:48px;flex:none;border-radius:12px;border:2px solid #7a5230;background:#4a2f1b;color:#fff6e0;font-size:21px;padding:0;cursor:pointer;position:relative}
  #sigs button.on{border-color:#fde68a;background:#8a5a1f;box-shadow:0 0 10px #fde68a88}
  #sigs button small{position:absolute;bottom:1px;left:0;right:0;font-size:8px;line-height:1;color:#fde68a}
  #sigs .tip{font-weight:400;font-size:11px;color:#cbd5e1;margin-top:5px;min-height:14px}`; document.head.appendChild(st); })();
function sigShow(){
  if(!SIGUI){ SIGUI=document.createElement('div'); SIGUI.id='sigs'; document.body.appendChild(SIGUI); }
  const sel=[]; SIGUI.dataset.t=performance.now();
  const draw=()=>{ SIGUI.innerHTML=`<div>✨ Choisis <b>2 sorts de départ</b> (ils se rechargent seuls toutes les ${SIG_CD} s) · ${sel.length}/2</div><div class="row">`+SIGS.filter(id=>ITEMMAP[id]).map(id=>`<button data-id="${id}" class="${sel.includes(id)?'on':''}" title="${ITEMMAP[id].n}">${ITEMMAP[id].ico}<small>${ITEMMAP[id].n.split(' ')[0]}</small></button>`).join('')+`</div><div class="tip" id="sigtip">Touche un sort pour le choisir.</div>`;
    SIGUI.querySelectorAll('button').forEach(b=>{ const id=b.dataset.id; b.onpointerenter=()=>{ const t=document.getElementById('sigtip'); if(t&&SHOPMAP[id]) t.textContent=ITEMMAP[id].n+' — '+SHOPMAP[id].info(player).desc; };
      b.onclick=()=>{ const k=sel.indexOf(id); if(k>=0) sel.splice(k,1); else if(sel.length<2) sel.push(id); if(sel.length===2){ sigGrant(player,sel); SIGUI.style.display='none'; msg('Sorts de départ : '+sel.map(s=>ITEMMAP[s].n).join(' + '),'#fde68a'); } else draw(); }; }); };
  draw(); SIGUI.style.display='block';
}
{ const _n=newGame;
  newGame=function(){ _n(); if(SIGUI) SIGUI.style.display='none'; if(!sigsOn()) return;
    for(const e of ents){ if(e!==player) sigRandom(e); }
    if(typeof NETON!=='undefined'&&NETON&&NET.role!=='host'){ sigRandom(player); return; }
    sigShow(); };
  const _e=updateEvents;
  updateEvents=function(dt){ _e(dt); if(game.state!=='play'||game.paused||!sigsOn()) return;
    if(SIGUI&&SIGUI.style.display==='block'&&performance.now()-(+SIGUI.dataset.t)>25000){ sigRandom(player); SIGUI.style.display='none'; msg('Sorts de départ tirés au hasard : '+player.sig.map(s=>ITEMMAP[s].n).join(' + '),'#fde68a'); }
    for(const e of ents){ if(!e.sig||!e.alive) continue; for(const id of e.sig){ if((e.am[id]||0)>=1){ e.sigT[id]=0; continue; } e.sigT[id]=(e.sigT[id]||0)+dt; if(e.sigT[id]>=SIG_CD){ e.am[id]=1; e.sigT[id]=0; if(e===player){ floatTxt(e.x,e.y-44,ITEMMAP[id].ico+' sort rechargé','#fde68a',14); if(typeof syncBar==='function') syncBar(e); } } } }
  };
}
/* ---------- 3. combos (retours visuels forts, particules 2D uniquement) ---------- */
const FIRE=new Map(), ICEB=new Map(); let comboHint={fire:false,ice:false,chain:false};
const flamm=i=>wallT[i]===WOOL||(!wallT[i]&&floorT[i]===WOOL); // seul le bois (type 2) brûle
function igniteTile(tx,ty,owner){ if(!inb(tx,ty)) return; const i=idx(tx,ty); if(FIRE.has(i)||!flamm(i)) return;
  FIRE.set(i,{t:7,own:owner,a:0,tx,ty}); const x=(tx+.5)*T,y=(ty+.5)*T; ring(x,y,T*1.1,'#fb923c',.5,true); burst(x,y,'#fbbf24',8,120,.5,3); floatTxt(x,y-26,'🔥 EN FEU !','#fb923c',14);
  if(!comboHint.fire&&owner===player){ comboHint.fire=true; msg('Combo : la flamme met le feu aux blocs de bois, et il se propage !','#fb923c'); } }
{ const _e=updateEvents; let fxT=0, spT=0;
  updateEvents=function(dt){ _e(dt); if(game.state!=='play'||game.paused) return;
    // projectiles élémentaires
    for(const p of projs){
      if(p.kind==='flame'){ const sp=Math.hypot(p.vx,p.vy)||1, tx=Math.floor(p.x/T), ty=Math.floor(p.y/T), lx=Math.floor((p.x+p.vx/sp*T*.7)/T), ly=Math.floor((p.y+p.vy/sp*T*.7)/T);
        if(inb(tx,ty)&&flamm(idx(tx,ty))) igniteTile(tx,ty,p.owner); else if(inb(lx,ly)&&flamm(idx(lx,ly))) igniteTile(lx,ly,p.owner);
        for(const b of bombs){ if(b.team!==p.team&&!b.shell&&b.fuse>.12&&Math.hypot(b.x-p.x,b.y-p.y)<T*1.3){ b.fuse=.12; ring(b.x,b.y,T*1.2,'#fb923c',.4); floatTxt(b.x,b.y-30,'💥 CHAÎNE !','#fbbf24',14); if(!comboHint.chain&&p.owner===player){ comboHint.chain=true; msg('Combo : la flamme fait exploser les bombes !','#fbbf24'); } } }
        for(const t of traps){ if(t.kind==='mine'&&t.t>0&&Math.hypot(t.x-p.x,t.y-p.y)<T*1.2){ t.t=-1; explode({x:t.x,y:t.y,team:t.team,owner:t.owner,kind:'bomb',R:1.9*T,dm:12,bd:.9}); floatTxt(t.x,t.y-30,'💥 CHAÎNE !','#fbbf24',14); } }
      } else if(p.kind==='ice'){ p._ib=(p._ib||0)-dt; const tx=Math.floor(p.x/T), ty=Math.floor(p.y/T);
        if(p._ib<=0&&inb(tx,ty)&&floorT[idx(tx,ty)]===0&&!wallT[idx(tx,ty)]){ p._ib=.07; const i=idx(tx,ty); floorT[i]=8; hpF[i]=BHP[8]; ownF[i]=p.team; pop[i]=1; ICEB.set(i,9); const x=(tx+.5)*T,y=(ty+.5)*T; burst(x,y,'#bae6fd',6,90,.5,3); ring(x,y,T*.9,'#7dd3fc',.4,true); sfx('tick',x,y);
          if(!comboHint.ice&&p.owner===player){ comboHint.ice=true; msg('Combo : la glace fige la mer en pont (9 s) !','#7dd3fc'); } } }
    }
    // feu qui ronge et se propage
    fxT-=dt; const tick=fxT<=0; if(tick) fxT=.3; let nfx=0;
    for(const [i,f] of FIRE){ f.t-=dt; f.a+=dt;
      if(!flamm(i)||f.t<=0){ FIRE.delete(i); if(Math.random()<.5) smoke((f.tx+.5)*T,(f.ty+.5)*T,3,6,.8); continue; }
      if(f.a>=.5){ f.a=0; damageTile(f.tx,f.ty,wallT[i]?1.3:1.6,f.own,wallT[i]?0:1); if(!flamm(i)){ FIRE.delete(i); continue; }
        if(Math.random()<.35){ const d=[[1,0],[-1,0],[0,1],[0,-1]][Math.floor(Math.random()*4)]; igniteTile(f.tx+d[0],f.ty+d[1],f.own); }
        for(const o of ents){ if(o.alive&&Math.floor(o.x/T)===f.tx&&Math.floor(o.y/T)===f.ty&&o.team!==(f.own?f.own.team:-9)){ o.burn=Math.max(o.burn,2.5); o.burnBy=f.own; } } }
      if(tick&&nfx++<14){ const x=(f.tx+.5)*T+rnd(-10,10), y=(f.ty+.5)*T+rnd(-10,10); burst(x,y-(wallT[i]?28:4),Math.random()<.5?'#fb923c':'#fde047',2,50,.5,3); if(Math.random()<.4) smoke(x,y-30,1,5,.8); } }
    // glace qui fond
    for(const [i,t] of ICEB){ const n=t-dt; if(floorT[i]!==8){ ICEB.delete(i); continue; } if(n<=0){ ICEB.delete(i); const x=(i%W+.5)*T, y=(Math.floor(i/W)+.5)*T; chunks(x,y,'#bae6fd',5); burst(x,y,'#e0f2fe',5,80,.5,3); floorT[i]=0; hpF[i]=0; ownF[i]=-1; if(wallT[i]&&wallT[i]!==CORE){ wallT[i]=0; hpW[i]=0; ownW[i]=-1; } } else { ICEB.set(i,n); if(n<2&&Math.random()<dt*6) burst((i%W+.5)*T,(Math.floor(i/W)+.5)*T,'#e0f2fe',1,40,.4,2); } }
  };
  const _n=newGame; newGame=function(){ FIRE.clear(); ICEB.clear(); comboHint={fire:false,ice:false,chain:false}; _n(); };
}
