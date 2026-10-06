'use strict';
/* =====================  STYLE 2D : personnages, objets en main, herbe et mouettes en sprites dessinés  =====================
   Tout est dessiné au démarrage dans des canvas (aucune image externe). Les animations 3D existantes pilotent les sprites. */
const SPW=.92, SPH=1.22, FR_W=96, FR_H=128, FR_N=8;
const OUT='#2a1a12';
const SPRC={atlas:new Map(),arms:new Map(),shadowTex:null,grassTex:null,gullTex:null};

function rrp(c,x,y,w,h,r){ c.beginPath(); c.moveTo(x+r,y); c.arcTo(x+w,y,x+w,y+h,r); c.arcTo(x+w,y+h,x,y+h,r); c.arcTo(x,y+h,x,y,r); c.arcTo(x,y,x+w,y,r); c.closePath(); }
function fillStroke(c,fill,w){ c.fillStyle=fill; c.fill(); c.lineWidth=w||3; c.strokeStyle=OUT; c.lineJoin='round'; c.stroke(); }

function drawPirateFrame(c,ox,pose,td,look,neutral){
  const l=lookOf(look), skin=td.col, hair=HAIRS[l.hair], shirt=neutral?'#f1ece0':td.col, trim=neutral?td.col:'#ffffff', hatc=td.col;
  c.save(); c.translate(ox,0);
  const st=pose.stride, air=pose.air, bob=pose.bob;
  // jambes
  for(const s of [-1,1]){ const sw=air?0:s*st*7, lift=air?-6:Math.max(0,-s*st)*5; c.beginPath(); rrp(c,(s<0?32:54)+sw*.2,92+bob*.3,12,24-lift,5); fillStroke(c,'#5b4630',2.5);
    c.beginPath(); rrp(c,(s<0?29:51)+sw,114-lift+bob*.2,19,10,5); fillStroke(c,'#1f1812',2.5); }
  // bras gauche (le bras droit est un sprite séparé)
  { const sw=air?-8:-st*6; c.beginPath(); rrp(c,16+sw*.3,66+bob,11,26,5); fillStroke(c,shirt,2.5); c.beginPath(); c.arc(21.5+sw*.3,94+bob+(air?-6:0),6,0,6.3); fillStroke(c,skin,2.5); }
  // torse
  c.beginPath(); rrp(c,26,62+bob,44,40,12); fillStroke(c,shirt,3);
  c.save(); rrp(c,26,62+bob,44,40,12); c.clip(); c.fillStyle=trim; for(let y=70;y<104;y+=12) c.fillRect(24,y+bob,48,5); c.restore();
  c.beginPath(); rrp(c,26,62+bob,44,40,12); c.lineWidth=3; c.strokeStyle=OUT; c.stroke();
  c.fillStyle='#3b2a1c'; c.fillRect(27,92+bob,42,6); c.fillStyle='#fbbf24'; c.fillRect(44,92+bob,9,6); c.strokeStyle=OUT; c.lineWidth=1.5; c.strokeRect(44,92+bob,9,6);
  // tête
  const hy=44+bob;
  if(l.shape===1){ c.beginPath(); rrp(c,17,hy-28,62,57,9); fillStroke(c,skin,3.5); } else { c.beginPath(); c.ellipse(48,hy,31,28,0,0,6.3); fillStroke(c,skin,3.5); }
  // cheveux latéraux
  c.fillStyle=hair; c.beginPath(); c.ellipse(20,hy+4,6,11,0,0,6.3); c.fill(); c.beginPath(); c.ellipse(76,hy+4,6,11,0,0,6.3); c.fill();
  // barbe / moustache
  if(l.face===1){ c.beginPath(); c.ellipse(48,hy+19,21,13,0,0,3.15); fillStroke(c,hair,2.5); }
  // joues
  c.fillStyle='#ff98ae'; c.beginPath(); c.ellipse(27,hy+9,6,4,0,0,6.3); c.fill(); c.beginPath(); c.ellipse(69,hy+9,6,4,0,0,6.3); c.fill();
  // yeux
  const eye=(x)=>{ c.fillStyle='#15121a'; c.beginPath(); c.arc(x,hy+3,4.2,0,6.3); c.fill(); };
  const brow=(x,dir)=>{ if(l.brow<=0) return; c.strokeStyle=hair==='#e5e7eb'?'#8b8f96':hair; c.lineWidth=2+l.brow*2.2; c.lineCap='round'; c.beginPath(); c.moveTo(x-9,hy-6+dir*2); c.lineTo(x+9,hy-6-dir*2); c.stroke(); c.strokeStyle=OUT; c.lineWidth=.9; c.stroke(); };
  if(l.patch){ c.beginPath(); c.ellipse(36,hy+2,9,10,0,0,6.3); fillStroke(c,'#15121a',2.5); c.strokeStyle='#15121a'; c.lineWidth=3; c.beginPath(); c.moveTo(18,hy-12); c.lineTo(76,hy-4); c.stroke(); eye(60); brow(60,-1); } else { eye(36); eye(60); brow(36,1); brow(60,-1); }
  // bouche
  c.strokeStyle='#7a2a1a'; c.lineWidth=2.5; c.lineCap='round'; c.beginPath(); c.arc(48,hy+13,7,.15,3); c.stroke();
  if(l.face===2){ c.fillStyle=hair; c.strokeStyle=OUT; c.lineWidth=2; c.beginPath(); c.ellipse(41,hy+9,8,3.5,.2,0,6.3); c.fill(); c.stroke(); c.beginPath(); c.ellipse(55,hy+9,8,3.5,-.2,0,6.3); c.fill(); c.stroke(); }
  // boucle d'oreille
  c.strokeStyle='#e8b04a'; c.lineWidth=3; c.beginPath(); c.arc(18,hy+16,4,0,6.3); c.stroke();
  // chapeau
  const top=hy-30;
  if(l.hat===0){ // tricorne
    c.beginPath(); c.ellipse(48,top+10,40,10,0,0,6.3); fillStroke(c,'#1c1722',3);
    c.beginPath(); rrp(c,26,top-18,44,30,9); fillStroke(c,hatc,3); c.fillStyle=trim; c.fillRect(27,top+2,42,7); c.strokeStyle=OUT; c.lineWidth=2; c.strokeRect(27,top+2,42,7);
    c.beginPath(); c.arc(48,top-4,5.5,0,6.3); fillStroke(c,'#fff',2);
  } else if(l.hat===1){ // bicorne
    c.beginPath(); c.moveTo(4,top+16); c.quadraticCurveTo(48,top-10,92,top+16); c.quadraticCurveTo(48,top+22,4,top+16); c.closePath(); fillStroke(c,hatc,3);
    c.strokeStyle='#fff'; c.lineWidth=4; c.beginPath(); c.moveTo(10,top+15); c.quadraticCurveTo(48,top+19,86,top+15); c.stroke();
    c.beginPath(); c.ellipse(70,top-2,6,13,.5,0,6.3); fillStroke(c,'#fff',2);
  } else if(l.hat===2){ // bandana
    c.beginPath(); c.ellipse(48,top+13,32,17,0,Math.PI,6.3); c.lineTo(80,top+14); c.lineTo(16,top+14); c.closePath(); fillStroke(c,hatc,3);
    c.fillStyle=trim; c.fillRect(17,top+8,62,5);
    c.beginPath(); c.moveTo(78,top+12); c.lineTo(94,top+4); c.lineTo(90,top+22); c.closePath(); fillStroke(c,hatc,2.5);
  } else { // tête nue : cheveux
    c.beginPath(); c.ellipse(48,top+16,31,19,0,Math.PI,6.3); c.lineTo(78,top+18); c.quadraticCurveTo(48,top+8,18,top+18); c.closePath(); fillStroke(c,hair,3);
    for(const x of [34,48,62]){ c.beginPath(); c.moveTo(x-6,top+2); c.lineTo(x,top-9); c.lineTo(x+6,top+2); c.closePath(); fillStroke(c,hair,2.5); }
  }
  c.restore();
}
function getAtlas(td,look,neutral){
  const l=lookOf(look), key=(neutral?'n':'t')+td.col+'|'+lookKey(l);
  let a=SPRC.atlas.get(key); if(a) return a;
  const cv=document.createElement('canvas'); cv.width=FR_W*FR_N; cv.height=FR_H; const c=cv.getContext('2d');
  const poses=[{stride:0,bob:0},{stride:0,bob:-2},{stride:1,bob:0},{stride:.0,bob:-3},{stride:-1,bob:0},{stride:0,bob:-3},{stride:0,bob:-3,air:true},{stride:0,bob:0}];
  poses.forEach((p,i)=>drawPirateFrame(c,i*FR_W,p,td,l,neutral));
  const tex=new THREE.CanvasTexture(cv); tex.magFilter=THREE.LinearFilter; tex.minFilter=THREE.LinearFilter; tex.generateMipmaps=false; if(THREE.SRGBColorSpace) tex.colorSpace=THREE.SRGBColorSpace;
  SPRC.atlas.set(key,tex); return tex;
}
/* ---------- objet en main (bras + icône) ---------- */
function drawItemIcon(c,id,e){
  c.save(); c.translate(50,32); c.lineJoin='round'; c.lineCap='round';
  const col=(ITEMMAP[id]&&ITEMMAP[id].col)||'#e5e7eb';
  if(id==='sword'){ const tier=SWORDS[e.sword|0]||SWORDS[0]; c.beginPath(); c.moveTo(0,-4); c.lineTo(44,-3); c.lineTo(52,0); c.lineTo(44,3); c.lineTo(0,4); c.closePath(); fillStroke(c,tier.c,2.5); c.fillStyle='#fbbf24'; c.fillRect(-2,-10,7,20); c.strokeStyle=OUT; c.lineWidth=2; c.strokeRect(-2,-10,7,20); }
  else if(id==='pick'){ c.fillStyle='#7c4a21'; c.fillRect(0,-3,40,6); c.strokeStyle=OUT; c.lineWidth=2; c.strokeRect(0,-3,40,6); c.beginPath(); c.moveTo(34,-16); c.quadraticCurveTo(52,-6,40,14); c.lineTo(38,8); c.quadraticCurveTo(44,-4,32,-10); c.closePath(); fillStroke(c,'#9ca3af',2.5); }
  else if(id==='block'){ const bc=blockColor(e.bsel||2,e.team); c.beginPath(); rrp(c,4,-14,28,28,5); fillStroke(c,bc[0],3); c.fillStyle=bc[1]; c.fillRect(6,6,24,6); }
  else if(id==='bow'||id==='flarebow'||id==='crossbow3'){ c.strokeStyle='#7c4a21'; c.lineWidth=5; c.beginPath(); c.arc(8,0,22,-1.25,1.25); c.stroke(); c.strokeStyle='#e5e7eb'; c.lineWidth=2; c.beginPath(); c.moveTo(16,-20); c.lineTo(16,20); c.stroke(); }
  else if(GUNS[id]){ c.beginPath(); rrp(c,0,-6,16,22,4); fillStroke(c,'#7c4a21',2.5); c.beginPath(); rrp(c,8,-9,40,10,3); fillStroke(c,col,2.5); c.fillStyle='#374151'; c.fillRect(44,-7,10,6); }
  else if(id==='trident'||id==='javelin'){ c.fillStyle='#7c4a21'; c.fillRect(0,-2.5,48,5); c.beginPath(); c.moveTo(46,-9); c.lineTo(62,0); c.lineTo(46,9); c.closePath(); fillStroke(c,'#cbd5e1',2.5); }
  else { const it=ITEMMAP[id]; c.font='34px "Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif'; c.textAlign='left'; c.textBaseline='middle'; c.fillText(it?it.ico:'❔',2,2); }
  c.restore();
}
function getArmTex(e,td,neutral,look){
  const id=e.held||'sword', l=lookOf(look), key=[id,id==='sword'?e.sword|0:0,id==='block'?e.bsel:0,neutral?'n':td.col,l.skin].join('|');
  let t=SPRC.arms.get(key); if(t) return t;
  const cv=document.createElement('canvas'); cv.width=128; cv.height=64; const c=cv.getContext('2d');
  c.beginPath(); rrp(c,8,26,40,13,6); fillStroke(c,neutral?'#f1ece0':td.col,2.5);
  c.beginPath(); c.arc(48,32,7,0,6.3); fillStroke(c,td.col,2.5);
  drawItemIcon(c,id,e);
  t=new THREE.CanvasTexture(cv); t.generateMipmaps=false; t.minFilter=THREE.LinearFilter; if(THREE.SRGBColorSpace) t.colorSpace=THREE.SRGBColorSpace;
  SPRC.arms.set(key,t); return t;
}
function getShadowTex(){
  if(SPRC.shadowTex) return SPRC.shadowTex; const cv=document.createElement('canvas'); cv.width=cv.height=64; const c=cv.getContext('2d'); const g=c.createRadialGradient(32,32,2,32,32,30); g.addColorStop(0,'rgba(0,0,0,.45)'); g.addColorStop(1,'rgba(0,0,0,0)'); c.fillStyle=g; c.fillRect(0,0,64,64);
  return SPRC.shadowTex=new THREE.CanvasTexture(cv);
}
/* ---------- rattachement aux pirates 3D existants ---------- */
const _createPirate0=createPirate;
createPirate=function(td,opts){
  const g=_createPirate0(td,opts);
  if(!SPR2D()) return g;
  opts=opts||{}; const u=g.userData, atlas=getAtlas(td,opts.look,opts.neutral);
  u.body.visible=false;
  const holder=new THREE.Group(); g.add(holder);
  const tex=atlas.clone(); tex.needsUpdate=true; tex.repeat.set(1/FR_N,1);
  const body=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,alphaTest:.45,transparent:false})); body.center.set(.5,0); holder.add(body);
  const arm=new THREE.Sprite(new THREE.SpriteMaterial({map:null,alphaTest:.45,transparent:false})); arm.visible=false; holder.add(arm);
  const sh=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:getShadowTex(),transparent:true,depthWrite:false})); sh.rotation.x=-Math.PI/2; holder.add(sh);
  u.spr={holder,body,arm,sh,td,look:opts.look,neutral:!!opts.neutral,armKey:'',tex};
  return g;
};
function updateSprite(e,m){
  const u=m.userData, S=u.spr; if(!S) return;
  const air=Math.max(0,e.z-groundH(e)), moving=(Math.abs(e.ix||0)+Math.abs(e.iy||0)>.05)&&air<2, sz=u.sz||1, sq=e.squash||0;
  S.holder.rotation.y=-m.rotation.y; const ms=m.scale; S.holder.scale.set(1/ms.x,1/ms.y,1/ms.z);
  const face=Math.cos(e.ang||0)>=0?1:-1;
  let col; if(air>2) col=6; else if(moving) col=[2,3,4,5][Math.floor(((e.stepPh||0)*1.15/6.2832)*4)&3]; else col=Math.floor(game.t*2+(e.team||0))&1;
  const tx=S.tex; tx.repeat.x=face/FR_N; tx.offset.x=(face>0?col:col+1)/FR_N;
  S.body.scale.set(SPW*sz*(1+sq*.28),SPH*sz*(1-sq*.32),1);
  { const swn=e.swingMax?Math.max(0,(e.swing||0)/e.swingMax):0, lunge=swn>0?Math.sin((1-swn)*Math.PI)*.08:0, shk=e.flash>0?(Math.random()-.5)*.07:0, lean=(moving?Math.sin((e.stepPh||0)*1.15)*.05:0)+(e.slip>0?Math.sin(game.t*20)*.3:0)-(e.ix||0)*.05*(face);
    S.bx=face*lunge+shk; S.body.position.x=S.bx; S.body.material.rotation=-lean*face; }
  const bm=S.body.material;
  if(e.flash>0) bm.color.setRGB(1.8,1.3,1.3); else if(e.frozen>0) bm.color.setRGB(.65,.9,1.5); else if(e.curse>0) bm.color.setRGB(1.25,.7,1.5); else if(e.stickT>0) bm.color.setRGB(1.5,.9,1.6); else bm.color.setRGB(1,1,1);
  const gh=groundH(e); S.sh.position.set(0,(gh-e.z)*U+.03,0); const ss=.62*sz*(1-Math.min(.5,air*U*.15)); S.sh.scale.set(ss,ss*.7,1);
  // objet en main
  const key=(e.held||'sword')+'|'+(e.sword|0)+'|'+(e.bsel|0);
  if(S.armKey!==key){ S.armKey=key; S.arm.material.map=getArmTex(e,S.td,S.neutral,S.look); S.arm.material.map=S.arm.material.map.clone(); S.arm.material.map.needsUpdate=true; S.arm.material.needsUpdate=true; }
  const theta=u.armR?u.armR.rotation.z:1;
  const am=S.arm.material.map; am.repeat.x=face; am.offset.x=face>0?0:1;
  S.arm.center.set(face>0?12/128:1-12/128,.5);
  S.arm.material.rotation=face>0?(theta-Math.PI/2):-(theta-Math.PI/2);
  const bobU=(col===0?0:col===1?-.015:(col>=2&&col<=5?(col===3||col===5?-.02:0):-.02));
  S.arm.position.set(face*.17*sz+(S.bx||0),(.55+bobU)*sz,.06); S.arm.scale.set(1.22*sz,.61*sz,1);
  S.arm.visible=!(e.cloak>0&&e!==player);
  const cl=e.cloak>0; if(S.body.material.transparent!==cl){ for(const mm of [S.body.material,S.arm.material]){ mm.transparent=cl; mm.needsUpdate=true; } }
  S.body.material.opacity=S.arm.material.opacity=cl?(e===player?.4:.12):1;
}
const _heldAnim0=heldAnim;
heldAnim=function(e,m){ _heldAnim0(e,m); if(m.userData.spr) updateSprite(e,m); };
const _updateGuardM0=updateGuardM;
updateGuardM=function(g,m){
  _updateGuardM0(g,m);
  if(m.userData.spr){ const mv=Math.hypot(g.vx||0,g.vy||0)>5, ps={x:g.x,y:g.y,z:0,ang:g.ang||0,ix:mv?1:0,iy:0,stepPh:g.ph*1.4/1.15,held:'sword',sword:1,bsel:2,team:g.team,flash:0,cloak:0,frozen:0,curse:0,squash:0,stickT:0};
    m.userData.sz=.78; updateSprite(ps,m); }
};
/* ---------- herbe et mouettes en 2D ---------- */
function getGrassTex(){
  if(SPRC.grassTex) return SPRC.grassTex; const cv=document.createElement('canvas'); cv.width=64; cv.height=64; const c=cv.getContext('2d'); c.lineJoin='round';
  const blade=(x,h,lean,w)=>{ c.beginPath(); c.moveTo(x-w,62); c.quadraticCurveTo(x-w*.4+lean*.3,62-h*.6,x+lean,62-h); c.quadraticCurveTo(x+w*.4+lean*.3,62-h*.6,x+w,62); c.closePath(); c.fillStyle='#ffffff'; c.fill(); c.lineWidth=3; c.strokeStyle='#32602a'; c.stroke(); };
  blade(22,40,-8,7); blade(46,36,9,7); blade(34,56,2,8);
  return SPRC.grassTex=new THREE.CanvasTexture(cv);
}
let _grassGeo=null; function grassGeo(){ if(!_grassGeo){ _grassGeo=new THREE.PlaneGeometry(1,1); _grassGeo.translate(0,.5,0); } return _grassGeo; }
function grassMat(){ return swayMat(new THREE.MeshLambertMaterial({map:getGrassTex(),alphaTest:.5,side:THREE.DoubleSide})); }
function getGullTex(){
  if(SPRC.gullTex) return SPRC.gullTex; const cv=document.createElement('canvas'); cv.width=128; cv.height=48; const c=cv.getContext('2d'); c.lineJoin='round';
  const gull=(ox,up)=>{ c.save(); c.translate(ox,0);
    c.beginPath(); c.ellipse(32,28,18,8,0,0,6.3); fillStroke(c,'#fafafa',2.5);
    c.beginPath(); c.arc(50,23,7,0,6.3); fillStroke(c,'#fafafa',2.5); c.beginPath(); c.moveTo(56,23); c.lineTo(66,25); c.lineTo(56,28); c.closePath(); fillStroke(c,'#f59e0b',2); c.fillStyle='#111'; c.beginPath(); c.arc(52,21,1.6,0,6.3); c.fill();
    c.beginPath(); c.moveTo(30,26); c.quadraticCurveTo(22,up?2:40,6,up?8:44); c.quadraticCurveTo(24,up?16:30,40,26); c.closePath(); fillStroke(c,'#e5eef7',2.5);
    c.beginPath(); c.moveTo(16,29); c.lineTo(2,33); c.lineTo(15,33); c.closePath(); fillStroke(c,'#cbd5e1',2); c.restore(); };
  gull(0,true); gull(64,false);
  const t=new THREE.CanvasTexture(cv); t.generateMipmaps=false; t.minFilter=THREE.LinearFilter; return SPRC.gullTex=t;
}
function addGullSprite(parent,b){
  const tex=getGullTex().clone(); tex.needsUpdate=true; tex.repeat.set(.5,1);
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,alphaTest:.4,fog:false})); sp.scale.set(1.5,.56,1); parent.add(sp); b.userData.spr=sp; return sp;
}
function setStyle(){ // bascule 2D / 3D en cours de partie
  for(const mp of [entM,guardM]){ for(const [,mm] of mp) scene.remove(mm); mp.clear(); }
  if(typeof buildWorldMeshes==='function'&&scene){ buildWorldMeshes(); worldSig=-1; }
}
