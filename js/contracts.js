'use strict';
/* =====================  CONTRATS  =====================
   Chaque pirate humain reçoit un contrat (petit objectif) avec une récompense ; une fois rempli, un autre arrive. */
const CTRS=new Map(); let CTRL=null; // CTRL : contrat affiché (local)
const CT_TYPES=[
  {id:'kills',ico:'⚔️',mk:()=>{ const g=2+Math.floor(Math.random()*2); return {goal:g,txt:'Élimine '+g+' pirates ennemis'}; }},
  {id:'core',ico:'💰',mk:()=>({goal:8,txt:'Frappe 8 fois un coffre ennemi'})},
  {id:'gather',ico:'🪙',mk:()=>{ const g=50+Math.floor(Math.random()*4)*10; return {goal:g,txt:'Ramasse '+g+' ressources'}; }},
  {id:'build',ico:'🧱',mk:()=>{ const g=14+Math.floor(Math.random()*3)*4; return {goal:g,txt:'Pose '+g+' blocs'}; }},
  {id:'survive',ico:'🛡️',mk:()=>({goal:80,txt:'Reste en vie 80 secondes'})}
];
const CT_REW=[{n:'+1 or',f:e=>e.res.gold+=1},{n:'+10 argent',f:e=>e.res.silver+=10},{n:'+50 bronze',f:e=>e.res.bronze+=50},{n:'+12 blocs',f:e=>e.blocks[2]=(e.blocks[2]||0)+12},{n:'+1 diamant',f:e=>e.res.diamond+=1,hard:1}];
const ctrOn=()=>game.opts.ctr===undefined?true:!!(game.opts.ctr|0);
const sumRes=e=>e.res.bronze+e.res.silver+e.res.gold+e.res.diamond, sumBl=e=>{ let s=0; for(const k in e.blocks) s+=e.blocks[k]; return s; };
function ctrNew(e){
  const t=CT_TYPES[Math.floor(Math.random()*CT_TYPES.length)], m=t.mk(), hard=t.id==='kills'&&m.goal>=3||t.id==='survive';
  const pool=CT_REW.filter(r=>hard||!r.hard), rw=pool[Math.floor(Math.random()*pool.length)];
  const c={id:t.id,ico:t.ico,goal:m.goal,txt:m.txt,rw,prog:0,k0:e.kills,r0:sumRes(e),b0:sumBl(e),surv:0,coreHits:0,wait:0,sent:-1};
  CTRS.set(e,c); ctrSync(e,c); return c;
}
function ctrSync(e,c){
  const p=Math.min(c.goal,Math.floor(c.prog)); if(c.sent===p&&!c.done) return; c.sent=p;
  if(e===player) CTRL={ico:c.ico,txt:c.txt,prog:p,goal:c.goal,rw:c.rw.n,done:!!c.done};
  else if(e.remote&&NET.role==='host') netRec('Q',[ents.indexOf(e),c.ico,c.txt,p,c.goal,c.rw.n,c.done?1:0]);
}
{ const _dt=damageTile;
  damageTile=function(tx,ty,dmg,src,layer){ const r=_dt(tx,ty,dmg,src,layer);
    if(ctrOn()&&dmg>0&&src&&src.res&&inb(tx,ty)&&wallT[idx(tx,ty)]===CORE&&ownW[idx(tx,ty)]!==src.team){ const c=CTRS.get(src); if(c&&c.id==='core'&&!c.done) c.coreHits++; }
    return r; };
  const _nw=newGame; newGame=function(){ CTRS.clear(); CTRL=null; _nw(); };
  const _e=updateEvents;
  updateEvents=function(dt){
    _e(dt); if(game.state!=='play'||game.paused||!ctrOn()) return;
    for(const e of ents){ if(e.isBot||e.elim) continue; let c=CTRS.get(e); if(!c){ if(game.t<12) continue; c=ctrNew(e); }
      if(c.done){ c.wait-=dt; if(c.wait<=0) ctrNew(e); continue; }
      if(!e.alive){ c.surv=0; ctrSync(e,c); continue; }
      const r=sumRes(e), b=sumBl(e);
      if(c.id==='kills'){ c.prog=Math.max(0,e.kills-c.k0); }
      else if(c.id==='core'){ c.prog=c.coreHits; }
      else if(c.id==='gather'){ if(r>c.r0) c.prog+=r-c.r0; c.r0=r; }
      else if(c.id==='build'){ if(b<c.b0) c.prog+=c.b0-b; c.b0=b; }
      else if(c.id==='survive'){ c.surv+=dt; c.prog=c.surv; }
      if(c.id!=='gather') c.r0=r; if(c.id!=='build') c.b0=b;
      if(c.prog>=c.goal){ c.done=true; c.wait=14; c.rw.f(e); ctrSync(e,c);
        burst(e.x,e.y-30,'#fde047',14,160,.8,4); sfx('coin',e.x,e.y); floatTxt(e.x,e.y-50,'Contrat ✔ '+c.rw.n,'#fde047');
        if(e===player){ announce('📜 CONTRAT REMPLI '+c.rw.n,'#fde047'); if(typeof syncBar==='function') syncBar(e); } }
      else ctrSync(e,c);
    }
  };
  const _p=netPlayFx;
  netPlayFx=function(f){ if(f[0]==='Q'){ const a=f.slice(1); if(ents[a[0]]===player) CTRL={ico:a[1],txt:a[2],prog:a[3],goal:a[4],rw:a[5],done:!!a[6]}; return; } _p(f); };
  const _h=drawHud;
  drawHud=function(){ _h(); if(game.state!=='play'||!ctx||!CTRL||!ctrOn()||!player||!player.alive) return;
    ctx.save(); ctx.setTransform(DPR,0,0,DPR,0,0); const w=190, x=12, y=VH-150, c=CTRL;
    ctx.fillStyle='rgba(15,23,42,.62)'; ctx.fillRect(x,y,w,44); ctx.strokeStyle=c.done?'#fde047':'rgba(255,255,255,.25)'; ctx.lineWidth=1.5; ctx.strokeRect(x,y,w,44);
    ctx.textAlign='left'; ctx.font='bold 11px '+FONT; ctx.fillStyle=c.done?'#fde047':'#fff'; ctx.fillText('📜 '+c.ico+' '+(c.done?'Contrat rempli ! '+c.rw:c.txt),x+7,y+15);
    if(!c.done){ ctx.fillStyle='rgba(255,255,255,.18)'; ctx.fillRect(x+7,y+24,w-14,7); ctx.fillStyle='#fbbf24'; ctx.fillRect(x+7,y+24,(w-14)*clamp(c.prog/c.goal,0,1),7); ctx.font='10px '+FONT; ctx.fillStyle='#cbd5e1'; ctx.fillText(c.prog+'/'+c.goal+' · récompense : '+c.rw,x+7,y+40); }
    ctx.restore(); };
}
