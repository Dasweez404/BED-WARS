'use strict';
/* =====================  GRAPHISMES & JUICE 2  =====================
   Mer animée (vagues, caustiques, scintillements), étalonnage des couleurs, vignette, pulsations d'écran,
   traînées d'épée, pas et atterrissages sonores, battements de cœur, sons d'interface, gammes de pitch… */
const J2={stepT:0,chain:{place:0,coin:0},lastPlace:0,lastCoin:0,prevZ:0,hbT:0,fovAdd:0,punch:0,seaOk:false,fxQ:-1,uiT:0,lastGrounded:true,airT:0};
(function css(){
  const st=document.createElement('style'); st.textContent=`
  body.fx #gl{filter:contrast(1.05) saturate(1.13)}
  body.fx.dead #gl{filter:grayscale(.9) brightness(.62) contrast(1.15) sepia(.25)}
  body.fx.lost #gl{filter:grayscale(.75) brightness(.55)}
  body.fx.won #gl{filter:saturate(1.35) brightness(1.08)}
  #vigfx{position:fixed;inset:0;z-index:1;pointer-events:none;background:radial-gradient(ellipse at 50% 46%,rgba(0,0,0,0) 52%,rgba(6,16,34,.34) 100%)}
  #gl{transform-origin:50% 50%;will-change:transform}
  @keyframes titleglow{0%,100%{text-shadow:0 4px 0 #000a,0 0 0 #ffb84a00}50%{text-shadow:0 4px 0 #000a,0 0 22px #ffb84a88}}
  #start h1{animation:titleglow 4.5s ease-in-out infinite}
  .obtn,.cbtn,.mtab,.sw{transition:transform .08s,box-shadow .15s,border-color .15s}
  .obtn:hover,.cbtn:hover,.mtab:hover{transform:translateY(-1px);box-shadow:0 3px 10px #0006}
  .obtn:active,.cbtn:active,.mtab:active,.sw:active{transform:translateY(1px) scale(.97)}
  .obtn.on,.cbtn.on{box-shadow:0 0 12px #e2b14f88}
  #shop .item{transition:transform .08s,box-shadow .15s}
  #shop .item:hover{box-shadow:0 6px 16px #0007}
  `; document.head.appendChild(st);
  const v=document.createElement('div'); v.id='vigfx'; document.body.appendChild(v);
})();
/* ---------- mer : vagues, caustiques et scintillements (shader greffé sur le matériau existant) ---------- */
function patchSea(){
  if(J2.seaOk||typeof sea==='undefined'||!sea) return; J2.seaOk=true; const u={uT:{value:0},uDay:{value:1}}; J2.u=u;
  sea.material.onBeforeCompile=sh=>{ sh.uniforms.uT=u.uT; sh.uniforms.uDay=u.uDay;
    sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vW;').replace('#include <begin_vertex>','#include <begin_vertex>\nvW=(modelMatrix*vec4(position,1.)).xyz;');
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vW; uniform float uT; uniform float uDay;').replace('#include <color_fragment>','#include <color_fragment>\n{ float w=sin(vW.x*.8+uT*.7)*sin(vW.z*.95-uT*.55); diffuseColor.rgb*=1.+.055*w; float c=abs(sin(vW.x*.5+uT*.35)+sin(vW.z*.55-uT*.3)+sin((vW.x+vW.z)*.37+uT*.45)); diffuseColor.rgb+=pow(c/3.,5.)*.075*uDay; float sp=pow(max(0.,sin(vW.x*2.9+uT*1.6)*sin(vW.z*2.5-uT*1.2)),14.); diffuseColor.rgb+=sp*.24*uDay; }'); };
  sea.material.needsUpdate=true;
}
/* ---------- sons supplémentaires (locaux) ---------- */
const sfxOk=()=>typeof AC!=='undefined'&&AC&&!muted&&AC.state==='running';
function j2step(kind,v){ if(!sfxOk()) return; if(kind==='wood') { tone(150+Math.random()*40,.05,'triangle',.05*v,.7); noise(.03,.03*v,1200); } else if(kind==='stone'){ noise(.04,.05*v,2200); tone(300+Math.random()*60,.025,'square',.015*v); } else noise(.06,.04*v,800); }
function j2land(power){ if(!sfxOk()) return; tone(90,.16,'sine',.16*power,.5); noise(.09,.1*power,700); }
function j2heart(){ if(!sfxOk()) return; tone(68,.12,'sine',.2,.55); tone(58,.14,'sine',.15,.55,.15); }
function uiTick(up){ if(!sfxOk()) return; const n=performance.now(); if(n-J2.uiT<45) return; J2.uiT=n; if(up){ tone(620,.05,'triangle',.07,1.5); tone(930,.07,'triangle',.05,1,.04); } else tone(540+Math.random()*30,.025,'triangle',.03); }
document.addEventListener('pointerover',ev=>{ if(ev.pointerType==='touch') return; const t=ev.target&&ev.target.closest&&ev.target.closest('.obtn,.cbtn,.dbtn,.mtab,.sw,button.big,.pbtn,#shop .item,#shop .tab'); if(t&&t!==J2.lastHover){ J2.lastHover=t; uiTick(false); } });
document.addEventListener('pointerdown',ev=>{ const t=ev.target&&ev.target.closest&&ev.target.closest('.obtn,.cbtn,.dbtn,.mtab,.sw,button.big,.pbtn,#shop .tab'); if(t) uiTick(true); },true);
/* gammes de pitch : poser des blocs / ramasser des pièces d'affilée monte dans les aigus */
{ const _s=FX0.sfx;
  FX0.sfx=function(n,x,y){ _s(n,x,y);
    if(!sfxOk()||!player) return; const now=performance.now(); let v=1; if(x!==undefined) v=clamp(1-Math.hypot(x-player.x,y-player.y)/T/16,0,1); if(v<.05) return;
    if(n==='place'){ J2.chain.place=(now-J2.lastPlace<650)?Math.min(J2.chain.place+1,12):0; J2.lastPlace=now; tone(380*Math.pow(1.055,J2.chain.place),.07,'triangle',.05*v,1.3); }
    else if(n==='coin'){ J2.chain.coin=(now-J2.lastCoin<900)?Math.min(J2.chain.coin+1,14):0; J2.lastCoin=now; tone(1180*Math.pow(1.045,J2.chain.coin),.09,'sine',.04*v,1.1); } };
}
/* ---------- traînées d'épée ---------- */
function swordTrail(e,col){
  if(Q.level<1||!e.alive||parts.length>700) return; const a0=e.ang-1.0, n=Q.level>=2?9:6;
  for(let i=0;i<n;i++){ const a=a0+i*(2.0/(n-1)), r=T*(1.05+Math.sin(i/(n-1)*Math.PI)*.35); parts.push({x:e.x+Math.cos(a)*r,y:e.y+Math.sin(a)*r,z:18+Math.sin(i/(n-1)*Math.PI)*5,vx:Math.cos(a)*40,vy:Math.sin(a)*40,vz:0,life:.2+i*.012,max:.2+i*.012,col:col||'#e0f2fe',size:4.4-Math.abs(i-n/2)*.25}); }
}
{ const _d=doSword; doSword=function(e){ const was=e.cd.atk; _d(e); if(e.cd.atk>was+.05) swordTrail(e,(typeof SWORDS!=='undefined'&&SWORDS[e.sword]&&SWORDS[e.sword].c)||'#e0f2fe'); };
  if(typeof doSword2==='function'){ const _d2=doSword2; doSword2=function(e,id){ const was=e.cd.atk, r=_d2(e,id); if(e.cd.atk>was+.05&&SW2[id]) swordTrail(e,SW2[id].col); return r; }; } }
/* ---------- impacts : coffre touché, explosions ---------- */
{ const _dt=damageTile; damageTile=function(tx,ty,dmg,src,layer){ const r=_dt(tx,ty,dmg,src,layer);
    if(dmg>.5&&inb(tx,ty)&&wallT[idx(tx,ty)]===CORE&&src&&player){ const x=(tx+.5)*T, y=(ty+.5)*T; burst(x,y,'#fde047',5,170,.6,4); parts.push({x,y,z:30,vx:rnd(-40,40),vy:rnd(-40,40),vz:rnd(160,230),life:.8,max:.8,col:'#fbbf24',size:5}); if(Math.random()<.5) sfx('coin',x,y); if(ownW[idx(tx,ty)]===player.team){ JUICE.kick(.3); J2.punch=Math.max(J2.punch,.5); } else if(src===player){ J2.punch=Math.max(J2.punch,.25); } }
    return r; };
  const _ex=explode; explode=function(b){ _ex(b); if(player){ const d=Math.hypot(b.x-player.x,b.y-player.y)/T; J2.punch=Math.max(J2.punch,Math.max(0,1-d/13)*Math.min(1.3,(b.dm||8)/10)); } };
}
/* ---------- boucle : étalonnage, pulsation d'écran, pas, atterrissage, cœur ---------- */
{ const _r=render3d;
  render3d=function(dt){
    patchSea(); if(J2.u){ J2.u.uT.value=performance.now()/1000; J2.u.uDay.value=typeof WX!=='undefined'?WX.dayK:1; }
    // étalonnage uniquement quand la qualité le permet
    if(J2.fxQ!==Q.level){ J2.fxQ=Q.level; document.body.classList.toggle('fx',Q.level>=1); }
    J2.punch=Math.max(0,J2.punch-dt*3.2); const sc=1+J2.punch*.02+(typeof JUICE!=='undefined'?JUICE.k*.008:0);
    if(glCanvas){ const s=sc>1.0005?`scale(${sc.toFixed(4)})`:''; if(J2.tr!==s){ J2.tr=s; glCanvas.style.transform=s; } }
    if(game.state==='play'&&player&&player.alive&&!game.paused&&!game.replay){
      const e=player, moving=(e.ix||e.iy)&&!e.riding&&!e.pilot, gh=groundH(e), grounded=e.z<=gh+1.5;
      if(moving&&grounded){ J2.stepT-=dt; if(J2.stepT<=0){ J2.stepT=e.haste>0||e.springT>0?.2:.29; const tx=Math.floor(e.x/T), ty=Math.floor(e.y/T), f=fl(tx,ty); j2step(f>=2?'wood':wl(tx,ty)>0?'stone':'sand',1); } } else J2.stepT=Math.min(J2.stepT,.12);
      if(!grounded) J2.airT+=dt; else { if(J2.airT>.35&&!e.pilot){ j2land(Math.min(1,.4+J2.airT)); } J2.airT=0; }
      const hpk=e.hp/maxhp(e); if(hpk<.3){ J2.hbT-=dt; if(J2.hbT<=0){ J2.hbT=.55+hpk*1.4; j2heart(); } }
    }
    // FOV dynamique (fusée, grande vitesse)
    _r(dt);
  };
  const _cam=updateCamera;
  updateCamera=function(dt){ _cam(dt); if(game.state==='menu'||!player) return; const sp=Math.hypot(player.vx||0,player.vy||0), tgt=player.pilot?11:Math.min(5,Math.max(0,(sp-250)/90)); J2.fovAdd+=(tgt-J2.fovAdd)*Math.min(1,dt*4); if(J2.fovAdd>.05){ camera3.fov+=J2.fovAdd; camera3.updateProjectionMatrix(); } };
}
/* ---------- arrivée d'un boss : caméra braquée dessus ---------- */
if(typeof bossStart==='function'){ const _bs=bossStart; bossStart=function(){ const was=BOSS.on; _bs(); if(!was&&BOSS.on&&typeof camFocusOn==='function'){ camFocusOn(BOSS.x,BOSS.y,2.6,1.25); if(!NETON) JUICE.slow=Math.max(JUICE.slow,.8); J2.punch=1; } }; }
