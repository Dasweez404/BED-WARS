'use strict';
/* =====================  APERÇUS RONDS (boss, rejeu des éliminations)  =====================
   Chaque aperçu est une petite vue ronde rendue avec sa propre caméra ; la scène est dessinée dans un coin du canvas 3D
   (avant le rendu principal qui l'écrase) puis recopiée dans un canvas rond. */
const BPIP={views:[],n:0,S:150,go:false,_rr:null};
BPIP.addView=function(o){ // o : {id, css, border, active(), place(cam), pre(), post(cx,cv)}
  const c=document.createElement('canvas'); c.width=c.height=BPIP.S*2; c.id='pip_'+o.id;
  c.style.cssText='position:fixed;width:'+BPIP.S+'px;height:'+BPIP.S+'px;border-radius:50%;border:3px solid '+(o.border||'#a78bfa')+';box-shadow:0 0 14px '+(o.border||'#a78bfa')+'99,inset 0 0 10px #0008;z-index:3;pointer-events:none;display:none;background:#0b2a3c;'+o.css;
  document.body.appendChild(c); const v=Object.assign({cv:c,cx:c.getContext('2d'),cam:new THREE.PerspectiveCamera(48,1,.1,300),on:false},o); BPIP.views.push(v); return v; };
function bpipPass(){
  const S=BPIP.S, r=renderer, pr=r.getPixelRatio();
  r.setScissorTest(true); r.setViewport(0,0,S,S); r.setScissor(0,0,S,S);
  for(const v of BPIP.views){ if(!v.on) continue;
    if(v.pre) v.pre(); v.place(v.cam);
    BPIP._rr.call(r,scene,v.cam);
    v.cx.drawImage(glCanvas,0,glCanvas.height-S*pr,S*pr,S*pr,0,0,v.cv.width,v.cv.height);
    if(v.post) v.post(v.cx,v.cv); }
  r.setScissorTest(false); r.setViewport(0,0,VW,VH);
}
{ const _r=render3d;
  render3d=function(dt){
    if(renderer&&!BPIP._rr){ BPIP._rr=renderer.render; const rr=BPIP._rr;
      renderer.render=function(sc,cam){ if(BPIP.go&&sc===scene&&cam===camera3){ BPIP.go=false; bpipPass(); } return rr.call(renderer,sc,cam); }; }
    let any=false;
    for(const v of BPIP.views){ const on=!!(game.state==='play'&&v.active()); v.on=on; if(on) any=true; const d=on?'block':'none'; if(v.cv.style.display!==d) v.cv.style.display=d; }
    BPIP.go=any&&((++BPIP.n)%2===0);
    _r(dt); };
}
/* aperçu du boss : à gauche de l'écran */
BPIP.addView({id:'boss',css:'left:auto;right:12px;top:50%;margin-top:-75px;',border:'#a78bfa',
  active:()=>BOSS.on&&BOSS.hp>0,
  place:cam=>{ const bx=BOSS.x*U, bz=BOSS.y*U, k=Math.max(1,BOSS.rad*U); cam.position.set(bx,3.2+k*1.6,bz+4.2+k*2.4); cam.lookAt(bx,.5+k*.3,bz); } });
