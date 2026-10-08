'use strict';
/* =====================  APERÇU DU BOSS (cercle à part)  =====================
   Plus de zoom de caméra : une petite vue ronde suit le boss, à gauche de l'écran. */
const BPIP={cv:null,cx:null,cam:null,n:0,S:150};
function bpipInit(){
  const c=document.createElement('canvas'); c.width=c.height=BPIP.S*2; c.id='bosspip';
  c.style.cssText='position:fixed;left:10px;top:300px;right:auto;bottom:auto;width:'+BPIP.S+'px;height:'+BPIP.S+'px;border-radius:50%;border:3px solid #a78bfa;box-shadow:0 0 14px #7c3aed99,inset 0 0 10px #0008;z-index:3;pointer-events:none;display:none;background:#0b2a3c';
  document.body.appendChild(c); BPIP.cv=c; BPIP.cx=c.getContext('2d'); BPIP.cam=new THREE.PerspectiveCamera(48,1,.1,300);
}
function bpipPass(){ // dessine la vue du boss dans le coin du canvas 3D puis la recopie dans le cercle
  const S=BPIP.S, r=renderer, pr=r.getPixelRatio();
  r.setScissorTest(true); r.setViewport(0,0,S,S); r.setScissor(0,0,S,S);
  const bx=BOSS.x*U, bz=BOSS.y*U, k=Math.max(1,BOSS.rad*U);
  BPIP.cam.position.set(bx,3.2+k*1.6,bz+4.2+k*2.4); BPIP.cam.lookAt(bx,.5+k*.3,bz);
  BPIP._rr.call(r,scene,BPIP.cam);
  BPIP.cx.drawImage(glCanvas,0,glCanvas.height-S*pr,S*pr,S*pr,0,0,BPIP.cv.width,BPIP.cv.height);
  r.setScissorTest(false); r.setViewport(0,0,VW,VH);
}
{ const _r=render3d;
  render3d=function(dt){
    if(renderer&&!BPIP._rr){ BPIP._rr=renderer.render; const rr=BPIP._rr;
      renderer.render=function(sc,cam){ if(BPIP.go&&sc===scene&&cam===camera3){ BPIP.go=false; bpipPass(); } return rr.call(renderer,sc,cam); }; }
    if(!BPIP.cv&&document.body) bpipInit();
    const on=!!(BPIP.cv&&game.state==='play'&&BOSS.on&&BOSS.hp>0);
    if(BPIP.cv){ const d=on?'block':'none'; if(BPIP.cv.style.display!==d) BPIP.cv.style.display=d;
      if(on) BPIP.go=((++BPIP.n)%2===0); else BPIP.go=false; }
    _r(dt); };
}
