'use strict';
/* =====================  JUICE : hit-stop, ralentis, secousses de caméra, pièces volantes, séries d'éliminations…  ===================== */
const JUICE={k:0,stop:0,slow:0,fov0:0,fly:[],pulse:{},lastCnt:{},lowT:0,vig:0,comboFlash:0,
  kick(v){ this.k=Math.min(1,Math.max(this.k,v)); },
  ts(){ if(typeof NETON!=='undefined'&&NETON) return 1; return this.stop>0?.06:this.slow>0?.38:1; },
  tick(dtr){ this.stop=Math.max(0,this.stop-dtr); this.slow=Math.max(0,this.slow-dtr); this.k=Math.max(0,this.k-dtr*3.2); this.vig=Math.max(0,this.vig-dtr*2.2); this.comboFlash=Math.max(0,this.comboFlash-dtr*2); }
};
/* --- coups reçus / donnés --- */
const _hurt0=hurt;
hurt=function(e,amount,by,kx,ky){
  const hp0=e.hp, was=e.alive; _hurt0(e,amount,by,kx,ky); const dealt=hp0-e.hp; if(!was||dealt<=0.05) return;
  if(by===player&&e!==player){ JUICE.kick(Math.min(.7,.12+dealt/10)); if(dealt>=2.5) JUICE.stop=Math.max(JUICE.stop,.05); }
  if(e===player){ JUICE.kick(Math.min(1,.2+dealt/8)); JUICE.vig=1; if(dealt>=4) JUICE.stop=Math.max(JUICE.stop,.06); }
};
/* --- éliminations : ralenti + séries --- */
const _die0=die;
die=function(e,by,sea){
  const was=e.alive; _die0(e,by,sea);
  if(was&&!e.alive&&by&&by!==e&&by.alive!==undefined){
    by.streakN=(by.streakT>0?by.streakN:0)+1; by.streakT=8;
    if(by===player){ JUICE.slow=.5; JUICE.kick(.9); JUICE.comboFlash=1;
      const t=['','','DOUBLE ÉLIMINATION !','TRIPLE ÉLIMINATION !','QUADRUPLE !','MASSACRE !'][Math.min(5,by.streakN)];
      if(t&&by.streakN>=2) announce(t,'#fb923c'); }
  } else if(was&&!e.alive&&e===player) { JUICE.kick(1); JUICE.vig=1; }
};
/* --- explosions : secousse de caméra selon la distance --- */
const _explode0=explode;
explode=function(b){ _explode0(b); const d=Math.hypot(b.x-player.x,b.y-player.y)/T; JUICE.kick(Math.max(0,.75*(1-d/12))); };
/* --- tirs : douille éjectée + éclair de bouche --- */
const _fireGun0=fireGun;
fireGun=function(e,id){
  const ok=_fireGun0(e,id); if(ok&&id!=='flame'&&id!=='bow'&&id!=='boomerang'&&id!=='bubble'&&id!=='woolgun'&&id!=='ice'){
    const a=e.ang+Math.PI/2+rnd(-.5,.5); parts.push({x:e.x+Math.cos(e.ang)*8,y:e.y+Math.sin(e.ang)*8,z:16,vx:Math.cos(a)*rnd(40,90),vy:Math.sin(a)*rnd(40,90),vz:rnd(80,150),life:.7,max:.7,col:'#fbbf24',size:2.6});
    burst(e.x+Math.cos(e.ang)*20,e.y+Math.sin(e.ang)*20,'#fff3c4',3,150,.1,5);
    if(e===player) JUICE.kick(id==='sniper'||id==='rocket'||id==='shotgun'?.45:.12); }
  return ok;
};
/* --- pièces qui volent vers le compteur --- */
const _floatTxt0=floatTxt;
floatTxt=function(x,y,txt,col,s){
  _floatTxt0(x,y,txt,col,s);
  const m=/^\+(\d+) (Bronze|Argent|Or|Diamant)$/.exec(txt); if(m&&player&&Math.hypot(x-player.x,y-player.y)<70){ const k={Bronze:'bronze',Argent:'silver',Or:'gold',Diamant:'diamond'}[m[2]]; JUICE.fly.push({wx:x,wy:y,k,n:Math.min(8,+m[1]),t:0}); }
};
/* --- affichage --- */
const _updateCamera0=updateCamera;
updateCamera=function(dt){
  _updateCamera0(dt); if(game.state==='menu') return;
  if(!JUICE.fov0) JUICE.fov0=camera3.fov; const f=JUICE.fov0*(1-JUICE.k*.07); if(Math.abs(camera3.fov-f)>.01){ camera3.fov=f; camera3.updateProjectionMatrix(); }
  camera3.rotation.z+= (Math.random()-.5)*JUICE.k*.012;
};
const _drawHud0=drawHud;
drawHud=function(){
  _drawHud0(); if(game.state==='menu') return; const e=player, dt=.016;
  // vignette de danger / de coup
  const hpk=e.alive?e.hp/maxhp(e):1, low=hpk<.35?(1-hpk/.35):0, pulse=low*(.5+.5*Math.sin(game.t*7));
  const va=Math.max(JUICE.vig*.55,pulse*.55);
  if(va>.01){ const g=ctx.createRadialGradient(VW/2,VH/2,Math.min(VW,VH)*.35,VW/2,VH/2,Math.max(VW,VH)*.75); g.addColorStop(0,'rgba(220,30,30,0)'); g.addColorStop(1,`rgba(220,30,30,${va})`); ctx.fillStyle=g; ctx.fillRect(0,0,VW,VH); }
  // éclat de série
  if(JUICE.comboFlash>0){ ctx.fillStyle=`rgba(251,146,60,${JUICE.comboFlash*.18})`; ctx.fillRect(0,0,VW,VH); }
  // pulsation des emplacements quand on gagne un objet
  const list=hotList(e), hb=hotbarRect(list.length), hx0=(VW-(list.length*(hb.s+hb.g)-hb.g))/2;
  list.forEach((it,i)=>{ const c=cnt(e,it.id), prev=JUICE.lastCnt[it.id]; if(typeof c==='number'&&typeof prev==='number'&&c>prev) JUICE.pulse[it.id]=1; JUICE.lastCnt[it.id]=c;
    const p=JUICE.pulse[it.id]; if(p>0){ const x=hx0+i*(hb.s+hb.g), y=hb.y; ctx.save(); ctx.globalAlpha=p; ctx.strokeStyle='#fde68a'; ctx.lineWidth=3; rr(x-3-(1-p)*8,y-3-(1-p)*8,hb.s+6+(1-p)*16,hb.s+6+(1-p)*16,12); ctx.stroke(); ctx.restore(); JUICE.pulse[it.id]=Math.max(0,p-.035); } });
  // pièces volantes
  const dt2=.02; const pos=hud.slotPos||{};
  for(const f of JUICE.fly){ f.t+=dt2*1.3; const tg=pos[f.k]; if(!tg){ f.t=2; continue; } if(!f.s0) f.s0=w2s(f.wx,f.wy,40);
    for(let i=0;i<f.n;i++){ const tt=Math.min(1,Math.max(0,f.t*1.15-i*.07)); if(tt<=0||tt>=1) continue; const sx=f.s0[0],sy=f.s0[1], ex=tg.x, ey=tg.y; const e1=tt*tt*(3-2*tt);
      const px=sx+(ex-sx)*e1+Math.sin(i*2.1)*40*(1-e1)*Math.sin(tt*3.14), py=sy+(ey-sy)*e1-70*Math.sin(tt*3.14)*(1-i*.05);
      ctx.save(); ctx.globalAlpha=Math.min(1,tt*5,(1-tt)*6+.3); drawRes(ctx,f.k,px,py,18); ctx.restore(); } }
  JUICE.fly=JUICE.fly.filter(f=>f.t<1.6);
  // minuteur de série
  for(const o of ents) if(o.streakT>0) o.streakT-=.016;
};
