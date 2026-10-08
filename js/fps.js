'use strict';
/* =====================  MODE FPS (touche P)  =====================
   Vue à la première personne : souris = regard (pointer lock), ZQSD relatif au regard, la visée part du viseur central. */
const FPS={on:false,yaw:0,pitch:0,fov:76,eye:1.55,sens:.0026};
function fpsToggle(on){
  FPS.on=on===undefined?!FPS.on:on; if(FPS.on&&player){ FPS.yaw=player.ang||0; FPS.pitch=-.12; }
  if(camera3){ camera3.fov=FPS.on?FPS.fov:46; camera3.updateProjectionMatrix(); }
  const c=document.getElementById('ui');
  if(FPS.on){ try{ c.requestPointerLock&&c.requestPointerLock(); }catch(e){} msg('🎯 Mode FPS : souris = regard · P pour quitter · clic pour recapturer la souris','#fde68a'); }
  else { CAMYAW=0; try{ document.exitPointerLock&&document.exitPointerLock(); }catch(e){} }
}
addEventListener('keydown',ev=>{ if(ev.repeat||ev.key.toLowerCase()!=='p'||game.state!=='play'||game.paused||ev.ctrlKey||ev.metaKey) return; if(typeof TOUCH!=='undefined'&&TOUCH.on) return; fpsToggle(); });
addEventListener('mousemove',ev=>{ if(!FPS.on||document.pointerLockElement==null||shopOpen||game.paused) return;
  FPS.yaw+=ev.movementX*FPS.sens; FPS.pitch=Math.max(-1.25,Math.min(1.1,FPS.pitch-ev.movementY*FPS.sens)); });
addEventListener('mousedown',ev=>{ if(FPS.on&&document.pointerLockElement==null&&!shopOpen&&!game.paused&&game.state==='play'&&ev.target&&ev.target.id==='ui'){ try{ ev.target.requestPointerLock(); }catch(e){} } });
addEventListener('pointerlockchange',()=>{ if(document.pointerLockElement==null&&FPS.on&&!shopOpen&&game.state==='play'&&!game.paused){ /* Échap : le navigateur libère la souris */ } });
const fpsActive=()=>FPS.on&&game.state==='play'&&player&&player.alive;
{ const _c=updateCamera;
  updateCamera=function(dt){ _c(dt); if(!fpsActive()){ if(camera3&&Math.abs(camera3.fov-(FPS.on?FPS.fov:46))>.1){ camera3.fov=FPS.on?FPS.fov:46; camera3.updateProjectionMatrix(); } if(!FPS.on||game.state!=='play') return; return; }
    if(Math.abs(camera3.fov-FPS.fov)>.1){ camera3.fov=FPS.fov; camera3.updateProjectionMatrix(); }
    const e=player, sh=shake*.02*SET.shake;
    CAMYAW=Math.atan2(-Math.cos(FPS.yaw),-Math.sin(FPS.yaw)); // ZQSD relatif au regard
    camera3.position.set(e.x*U+(Math.random()-.5)*sh,e.z*U+FPS.eye+(Math.random()-.5)*sh,e.y*U);
    const cp=Math.cos(FPS.pitch); camera3.lookAt(e.x*U+Math.cos(FPS.yaw)*cp,e.z*U+FPS.eye+Math.sin(FPS.pitch),e.y*U+Math.sin(FPS.yaw)*cp);
    cam3.x=e.x; cam3.y=e.y; sun.position.set(e.x*U-14,30,e.y*U+12); sun.target.position.set(e.x*U,0,e.y*U); };
  const _a=updateAim;
  updateAim=function(){ if(!fpsActive()){ _a(); return; }
    mouse.x=VW/2; mouse.y=VH/2; aim.ok=false; _a(); const e=player;
    if(!aim.ok||Math.hypot(aim.x-e.x,aim.y-e.y)>26*T){ aim.x=e.x+Math.cos(FPS.yaw)*14*T; aim.y=e.y+Math.sin(FPS.yaw)*14*T; aim.ok=true; } };
  const _p=animatePirate;
  animatePirate=function(e,m,dt){ _p(e,m,dt); if(e===player&&fpsActive()) m.visible=false; };
  const _dh=drawHud;
  drawHud=function(){ _dh(); if(!fpsActive()||!ctx||shopOpen) return; ctx.save(); ctx.setTransform(DPR,0,0,DPR,0,0); const x=VW/2,y=VH/2;
    ctx.lineWidth=2.5; ctx.strokeStyle='#ffffffd0'; ctx.shadowColor='#000'; ctx.shadowBlur=3; ctx.beginPath(); ctx.moveTo(x-12,y); ctx.lineTo(x-4,y); ctx.moveTo(x+4,y); ctx.lineTo(x+12,y); ctx.moveTo(x,y-12); ctx.lineTo(x,y-4); ctx.moveTo(x,y+4); ctx.lineTo(x,y+12); ctx.stroke();
    ctx.fillStyle='#ffffffd0'; ctx.fillRect(x-1,y-1,2,2); ctx.restore(); }; }
{ const _n=newGame; newGame=function(){ _n(); if(FPS.on) fpsToggle(false); }; }
