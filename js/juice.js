'use strict';
/* =====================  JUICE : hit-stop, ralentis, secousses de caméra, pièces volantes, séries d'éliminations…  ===================== */
const JUICE={k:0,stop:0,slow:0,fov0:0,fly:[],pulse:{},lastCnt:{},lowT:0,vig:0,comboFlash:0,
  kick(v){ this.k=Math.min(1,Math.max(this.k,v*SET.shake)); },
  ts(){ if((typeof NETON!=='undefined'&&NETON)||!SET.slow) return 1; return this.stop>0?.06:this.slow>0?.38:1; },
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
/* --- ressources : elles jaillissent, volent vers nous (aimant), puis filent vers le compteur --- */
const FLY={list:[],grp:null,tex:{},pend:{}};
function flyTex(k){
  if(FLY.tex[k]) return FLY.tex[k]; const cv=document.createElement('canvas'); cv.width=cv.height=96; const c=cv.getContext('2d');
  const g=c.createRadialGradient(48,48,4,48,48,46); const col={bronze:'255,160,70',silver:'220,230,245',gold:'255,214,60',diamond:'80,230,255'}[k]; g.addColorStop(0,`rgba(${col},.55)`); g.addColorStop(1,`rgba(${col},0)`); c.fillStyle=g; c.fillRect(0,0,96,96);
  drawRes(c,k,48,48,56); const t=new THREE.CanvasTexture(cv); return FLY.tex[k]=t;
}
function flyBurst(wx,wy,k,n){
  if(!scene) return; if(!FLY.grp){ FLY.grp=new THREE.Group(); scene.add(FLY.grp); }
  for(let i=0;i<n;i++){
    const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:flyTex(k),transparent:true,depthTest:false,depthWrite:false})); sp.renderOrder=40; sp.scale.setScalar(.01); FLY.grp.add(sp);
    const a=Math.random()*6.283, r=rnd(10,34);
    FLY.list.push({sp,k,x:wx+Math.cos(a)*r*.4,y:wy+Math.sin(a)*r*.4,z:8,vx:Math.cos(a)*r*5,vy:Math.sin(a)*r*5,vz:rnd(170,300),t:-i*.055,age:0,spin:rnd(-9,9)});
  }
}
function updateFlyers(dt){
  if(!FLY.list.length) return; const px=player.x, py=player.y, pz=player.z+22;
  for(const f of FLY.list){
    f.t+=dt; if(f.t<0){ f.sp.visible=false; continue; } f.sp.visible=true; f.age+=dt;
    if(f.age<.28){ // jaillissement : petit arc balistique
      f.vz-=900*dt; f.x+=f.vx*dt; f.y+=f.vy*dt; f.z=Math.max(4,f.z+f.vz*dt); f.sp.scale.setScalar(Math.min(.62,.1+f.age*3)); f.sp.material.rotation=Math.sin(f.age*20)*.4;
    } else { // aimant : accélère vers le joueur en spirale
      const dx=px-f.x, dy=py-f.y, dz=pz-f.z, d=Math.hypot(dx,dy)||1, k=Math.min(1,(f.age-.28)*3.2), sp=(260+k*900)*dt;
      const ox=-dy/d*Math.sin(f.age*14)*d*.25*(1-k), oy=dx/d*Math.sin(f.age*14)*d*.25*(1-k);
      f.x+=dx/d*Math.min(d,sp)+ox*dt*5; f.y+=dy/d*Math.min(d,sp)+oy*dt*5; f.z+=dz*Math.min(1,dt*(4+k*10));
      f.sp.scale.setScalar(.62*(1-.35*k)); f.sp.material.rotation+=f.spin*dt;
      if(Math.random()<dt*34) parts.push({x:f.x,y:f.y,z:f.z,vx:0,vy:0,vz:rnd(-10,20),life:.28,max:.28,col:{bronze:'#fbbf77',silver:'#e5eefc',gold:'#fde047',diamond:'#67e8f9'}[f.k],size:2.5});
      if(d<14||f.age>1.4){ f.done=true; FLY.pend[f.k]=(FLY.pend[f.k]||0)+1; burst(px,py,{bronze:'#fbbf77',silver:'#e5eefc',gold:'#fde047',diamond:'#67e8f9'}[f.k],5,120,.35,3); sfx('coin',px,py); }
    }
    f.sp.position.set(f.x*U,f.z*U,f.y*U);
  }
  for(const f of FLY.list) if(f.done){ FLY.grp.remove(f.sp); f.sp.material.dispose(); }
  FLY.list=FLY.list.filter(f=>!f.done);
  for(const k in FLY.pend){ if(FLY.pend[k]>0){ JUICE.fly.push({wx:px,wy:py,k,n:Math.min(6,FLY.pend[k]),t:0}); FLY.pend[k]=0; } }
}
const _render3d0=render3d;
render3d=function(dt){ if(game.state!=='menu'&&player) updateFlyers(dt); _render3d0(dt); };
const _floatTxt0=floatTxt;
floatTxt=function(x,y,txt,col,s){
  _floatTxt0(x,y,txt,col,s);
  const m=/^\+(\d+) (Bronze|Argent|Or|Diamant)$/.exec(txt); if(m&&player&&Math.hypot(x-player.x,y-player.y)<190){ const k={Bronze:'bronze',Argent:'silver',Or:'gold',Diamant:'diamond'}[m[2]]; flyBurst(x,y,k,Math.min(10,Math.max(2,Math.ceil(+m[1]/(k==='bronze'?3:1))))); }
};
/* --- réapparition : flash + onde --- */
const _spawnEnt0=spawnEnt;
spawnEnt=function(e){ _spawnEnt0(e); if(e===player&&game.t>1){ flashScreen('#ffffff',.55); JUICE.kick(.6); ring(e.x,e.y,T*3,'#ffffff',.6,true); } };
/* --- affichage --- */
const _updateCamera0=updateCamera;
updateCamera=function(dt){
  _updateCamera0(dt); if(game.state==='menu') return;
  if(!JUICE.fov0) JUICE.fov0=camera3.fov; const f=JUICE.fov0*(1-JUICE.k*.07); if(Math.abs(camera3.fov-f)>.01){ camera3.fov=f; camera3.updateProjectionMatrix(); }
  if(player&&player.relics&&player.relics.r_glass){ const tg=new THREE.Vector3(cam3.x*U,.2,cam3.y*U-.2); camera3.position.sub(tg).multiplyScalar(1.16).add(tg); camera3.lookAt(tg); }
  camera3.rotation.z+= (Math.random()-.5)*JUICE.k*.012;
};
const _drawHud0=drawHud;
drawHud=function(){
  _drawHud0();
  { const b=document.body, dead=game.state==='play'&&!player.alive, over=game.state==='over'; b.classList.toggle('dead',dead); b.classList.toggle('lost',over&&!game.win); b.classList.toggle('won',over&&!!game.win);
    JUICE.deadT=dead?(JUICE.deadT||0)+.016:0; }
  if(game.state==='menu') return; const e=player, dt=.016;
  if(JUICE.deadT>0){ const k=Math.min(1,JUICE.deadT*1.3), g=ctx.createRadialGradient(VW/2,VH/2,Math.max(0,Math.min(VW,VH)*(.9-.6*k)),VW/2,VH/2,Math.max(VW,VH)*.8); g.addColorStop(0,'rgba(20,0,0,0)'); g.addColorStop(1,`rgba(20,0,0,${.75*k})`); ctx.fillStyle=g; ctx.fillRect(0,0,VW,VH);
    const w=Math.min(1,JUICE.deadT*3); ctx.save(); ctx.globalAlpha=w; ctx.translate(VW/2,VH*.34); ctx.scale(.7+.3*w,.7+.3*w); ctx.font='bold 54px '+PFONT; ctx.textAlign='center'; ctx.lineWidth=7; ctx.strokeStyle='rgba(40,0,0,.9)'; ctx.fillStyle='#fecaca'; ctx.strokeText('☠ TOMBÉ !',0,0); ctx.fillText('☠ TOMBÉ !',0,0); ctx.restore(); }
  // vignette de danger / de coup
  const hpk=e.alive?e.hp/maxhp(e):1, low=hpk<.35?(1-hpk/.35):0, pulse=low*(.5+.5*Math.sin(game.t*7));
  const va=Math.max(JUICE.vig*.55,pulse*.55);
  if(va>.01){ const g=ctx.createRadialGradient(VW/2,VH/2,Math.min(VW,VH)*.35,VW/2,VH/2,Math.max(VW,VH)*.75); g.addColorStop(0,'rgba(220,30,30,0)'); g.addColorStop(1,`rgba(220,30,30,${va})`); ctx.fillStyle=g; ctx.fillRect(0,0,VW,VH); }
  { const rs=Object.keys(e.relics||{}); if(rs.length){ const lb=hotbarRect(hotList(e).length); let x=(VW-(hotList(e).length*(lb.s+lb.g)-lb.g))/2-8, y=lb.y+lb.s/2; ctx.textAlign='right'; ctx.font='22px '+FONT;
      for(const k of rs){ const r=RELICS[k]; if(!r) continue; ctx.fillStyle=r.lose?'rgba(80,20,20,.55)':'rgba(12,30,48,.7)'; rr(x-30,y-16,30,30,9); ctx.fill(); ctx.fillStyle='#fff'; ctx.textAlign='center'; ctx.fillText(r.ico,x-15,y+7); x-=34; } } }
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
