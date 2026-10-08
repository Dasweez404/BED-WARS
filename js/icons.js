'use strict';
/* =====================  ICÔNES D'OBJETS  =====================
   Un style unique pour la barre d'objets, la carte d'objet et la boutique : pastille arrondie dégradée à la couleur de l'objet,
   reflet, contour sombre, et un dessin vectoriel propre pour les objets principaux (emoji ombré pour les autres). */
const ICONC=new Map(), ICOURL=new Map();
const ICO_OUT='#1b1512', ICO_SHOPTXT=shopIco;
function icoShade(hex,k){ const c=new THREE.Color(hex||'#94a3b8'); if(k<0) c.lerp(new THREE.Color('#0b1220'),-k); else c.lerp(new THREE.Color('#ffffff'),k); return '#'+c.getHexString(); }
function icoPath(c,pts){ c.beginPath(); pts.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1])); c.closePath(); }
function icoFS(c,fill,lw){ c.fillStyle=fill; c.fill(); c.lineWidth=lw||3; c.strokeStyle=ICO_OUT; c.stroke(); }
function icoCube(c,top,side,dark){ // cube isométrique (blocs)
  const T0=[[32,10],[52,21],[32,32],[12,21]], L=[[12,21],[32,32],[32,55],[12,44]], R=[[32,32],[52,21],[52,44],[32,55]];
  for(const [pts,col] of [[L,side],[R,dark],[T0,top]]){ icoPath(c,pts); c.fillStyle=col; c.fill(); }
  c.lineWidth=2.5; c.strokeStyle=ICO_OUT; for(const pts of [L,R,T0]){ icoPath(c,pts); c.stroke(); }
}
const ICO_DRAW={
  sword(c){ c.save(); c.translate(32,32); c.rotate(-Math.PI/4); icoPath(c,[[-3,-26],[3,-26],[4,10],[0,15],[-4,10]]); icoFS(c,'#e5e7eb'); c.fillStyle='#94a3b8'; c.fillRect(-1,-22,2,28);
    c.beginPath(); c.rect(-12,10,24,5); icoFS(c,'#fbbf24',2.5); c.beginPath(); c.rect(-3,15,6,12); icoFS(c,'#7c4a21',2.5); c.beginPath(); c.arc(0,29,4,0,6.283); icoFS(c,'#fbbf24',2.5); c.restore(); },
  pick(c){ c.save(); c.translate(32,34); c.rotate(-Math.PI/4); c.beginPath(); c.rect(-3,-14,6,38); icoFS(c,'#8a5a2b',2.5); c.beginPath(); c.moveTo(-24,-12); c.quadraticCurveTo(0,-26,24,-12); c.lineTo(18,-8); c.quadraticCurveTo(0,-18,-18,-8); c.closePath(); icoFS(c,'#cbd5e1'); c.restore(); },
  block(c,e){ const bc=blockColor((e&&e.bsel)||2); icoCube(c,icoShade(bc[0],.15),bc[0],bc[1]); c.strokeStyle='rgba(60,30,10,.45)'; c.lineWidth=1.5; for(const t of [.33,.66]){ c.beginPath(); c.moveTo(12,21+23*t); c.lineTo(32,32+23*t); c.stroke(); } },
  bow(c){ c.save(); c.translate(32,32); c.beginPath(); c.rect(-22,-3,40,7); icoFS(c,'#8a5a2b',2.5); c.beginPath(); c.moveTo(10,-22); c.quadraticCurveTo(22,0,10,22); c.lineWidth=5; c.strokeStyle=ICO_OUT; c.stroke(); c.lineWidth=3; c.strokeStyle='#a16207'; c.stroke();
    c.beginPath(); c.moveTo(10,-22); c.lineTo(-6,0); c.lineTo(10,22); c.lineWidth=1.5; c.strokeStyle='#f1f5f9'; c.stroke(); icoPath(c,[[18,-2],[26,0],[18,3]]); icoFS(c,'#e5e7eb',2); c.restore(); },
  gun(c){ c.save(); c.translate(30,34); icoPath(c,[[-20,-4],[-6,-8],[-2,10],[-14,16],[-22,8]]); icoFS(c,'#8a5a2b'); c.beginPath(); c.rect(-6,-12,30,8); icoFS(c,'#4b5563'); c.beginPath(); c.rect(20,-13,6,10); icoFS(c,'#c9a24a',2.5); c.beginPath(); c.arc(-4,4,5,0,3.2); c.lineWidth=2.5; c.strokeStyle='#c9a24a'; c.stroke(); c.beginPath(); c.rect(-8,-17,5,6); icoFS(c,'#374151',2); c.restore(); },
  smg(c){ for(const [dx,dy] of [[-5,-5],[5,6]]){ c.save(); c.translate(30+dx,32+dy); c.scale(.75,.75); icoPath(c,[[-20,-4],[-6,-8],[-2,10],[-14,16],[-22,8]]); icoFS(c,'#8a5a2b'); c.beginPath(); c.rect(-6,-12,30,8); icoFS(c,'#4b5563'); c.restore(); } },
  shotgun(c){ c.save(); c.translate(28,34); c.rotate(-.25); icoPath(c,[[-22,-2],[-6,-6],[-4,6],[-20,10]]); icoFS(c,'#8a5a2b'); c.beginPath(); c.rect(-6,-7,22,8); icoFS(c,'#4b5563'); icoPath(c,[[16,-7],[28,-13],[28,7],[16,1]]); icoFS(c,'#374151'); c.restore(); },
  sniper(c){ c.save(); c.translate(32,34); c.rotate(-.35); icoPath(c,[[-28,-1],[-12,-5],[-10,6],[-26,8]]); icoFS(c,'#8a5a2b'); c.beginPath(); c.rect(-12,-5,40,6); icoFS(c,'#4b5563'); c.beginPath(); c.rect(-6,-14,18,6); icoFS(c,'#c9a24a',2.5); c.beginPath(); c.arc(13,-11,3,0,6.283); icoFS(c,'#93c5fd',2); c.restore(); },
  rocket(c){ c.save(); c.translate(32,32); c.rotate(-Math.PI/4); c.beginPath(); c.rect(-6,-18,12,30); icoFS(c,'#e5e7eb'); icoPath(c,[[-6,-18],[0,-28],[6,-18]]); icoFS(c,'#ef4444'); icoPath(c,[[-6,6],[-12,16],[-6,12]]); icoFS(c,'#ef4444',2); icoPath(c,[[6,6],[12,16],[6,12]]); icoFS(c,'#ef4444',2);
    icoPath(c,[[-4,13],[0,24],[4,13]]); c.fillStyle='#fb923c'; c.fill(); c.beginPath(); c.arc(0,-6,3.5,0,6.283); icoFS(c,'#38bdf8',2); c.restore(); },
  bomb(c){ c.beginPath(); c.arc(30,36,17,0,6.283); icoFS(c,'#1f2937'); c.beginPath(); c.arc(24,30,5,0,6.283); c.fillStyle='rgba(255,255,255,.35)'; c.fill(); c.beginPath(); c.rect(37,15,8,8); icoFS(c,'#6b7280',2.5);
    c.beginPath(); c.moveTo(41,15); c.quadraticCurveTo(46,6,52,9); c.lineWidth=2.5; c.strokeStyle='#c9a96a'; c.stroke(); for(let k=0;k<6;k++){ const a=k*1.05; c.beginPath(); c.moveTo(52,9); c.lineTo(52+Math.cos(a)*6,9+Math.sin(a)*6); c.strokeStyle=k%2?'#fde047':'#fb923c'; c.lineWidth=2; c.stroke(); } },
  heal(c){ c.beginPath(); c.rect(27,10,10,9); icoFS(c,'#a16207',2.5); c.beginPath(); c.moveTo(27,19); c.lineTo(18,30); c.lineTo(18,52); c.lineTo(46,52); c.lineTo(46,30); c.lineTo(37,19); c.closePath(); icoFS(c,'#ef4444'); c.fillStyle='#fff'; c.fillRect(29,30,6,16); c.fillRect(24,35,16,6); },
  hammer(c){ c.save(); c.translate(32,32); c.rotate(-Math.PI/4); c.beginPath(); c.rect(-3,-8,6,34); icoFS(c,'#8a5a2b',2.5); c.beginPath(); c.rect(-14,-20,28,13); icoFS(c,'#6b7280'); c.restore(); },
  glove(c){ c.beginPath(); c.arc(32,24,13,Math.PI*.1,Math.PI*1.05,true); c.lineWidth=7; c.strokeStyle=ICO_OUT; c.stroke(); c.lineWidth=4; c.strokeStyle='#cbd5e1'; c.stroke(); c.beginPath(); c.rect(24,34,16,18); icoFS(c,'#6b4423'); },
  ice(c){ c.save(); c.translate(32,32); c.rotate(-Math.PI/4); c.beginPath(); c.rect(-2.5,-10,5,34); icoFS(c,'#8a5a2b',2); icoPath(c,[[-7,-10],[0,-26],[7,-10]]); icoFS(c,'#bae6fd'); c.restore(); c.strokeStyle='#e0f2fe'; c.lineWidth=2; for(let k=0;k<3;k++){ const a=k*1.047; c.beginPath(); c.moveTo(46-Math.cos(a)*7,46-Math.sin(a)*7); c.lineTo(46+Math.cos(a)*7,46+Math.sin(a)*7); c.stroke(); } },
  flame(c){ c.beginPath(); c.rect(28,30,8,24); icoFS(c,'#7c4a21',2.5); c.beginPath(); c.moveTo(32,8); c.quadraticCurveTo(46,22,40,32); c.lineTo(24,32); c.quadraticCurveTo(18,22,32,8); icoFS(c,'#fb923c'); c.beginPath(); c.moveTo(32,16); c.quadraticCurveTo(39,25,36,31); c.lineTo(28,31); c.quadraticCurveTo(25,25,32,16); c.fillStyle='#fde047'; c.fill(); },
  boomerang(c){ c.save(); c.translate(32,32); c.rotate(-Math.PI/4); c.beginPath(); c.rect(-3,-12,6,36); icoFS(c,'#8a5a2b',2.5); c.beginPath(); c.moveTo(3,-20); c.quadraticCurveTo(20,-14,16,0); c.lineTo(3,-4); c.closePath(); icoFS(c,'#cbd5e1'); c.restore(); },
  grap(c){ c.beginPath(); c.rect(29,8,6,26); icoFS(c,'#6b7280',2.5); for(const s of [-1,1]){ c.beginPath(); c.moveTo(32,34); c.quadraticCurveTo(32+s*18,36,32+s*14,22); c.lineWidth=6; c.strokeStyle=ICO_OUT; c.stroke(); c.lineWidth=3.5; c.strokeStyle='#cbd5e1'; c.stroke(); } c.beginPath(); c.arc(32,8,5,0,6.283); c.lineWidth=3; c.strokeStyle='#c9a96a'; c.stroke(); },
  turret(c){ c.beginPath(); c.rect(14,38,36,12); icoFS(c,'#7c4a21'); c.save(); c.translate(32,34); c.rotate(-.5); c.beginPath(); c.rect(-6,-8,28,14); icoFS(c,'#374151'); c.beginPath(); c.rect(20,-10,5,18); icoFS(c,'#1f2937',2.5); c.restore(); c.beginPath(); c.arc(22,48,6,0,6.283); icoFS(c,'#4b2e14',2.5); },
  mine(c){ for(let k=0;k<8;k++){ const a=k*.785; c.beginPath(); c.moveTo(32+Math.cos(a)*14,34+Math.sin(a)*14); c.lineTo(32+Math.cos(a)*22,34+Math.sin(a)*22); c.lineWidth=5; c.strokeStyle=ICO_OUT; c.stroke(); c.lineWidth=2.5; c.strokeStyle='#6b7280'; c.stroke(); } c.beginPath(); c.arc(32,34,15,0,6.283); icoFS(c,'#374151'); c.beginPath(); c.arc(32,34,3.5,0,6.283); c.fillStyle='#ef4444'; c.fill(); },
  net(c){ c.save(); c.beginPath(); c.arc(32,32,20,0,6.283); c.clip(); c.strokeStyle='#e5e7eb'; c.lineWidth=2; for(let k=-3;k<=3;k++){ c.beginPath(); c.moveTo(12+k*7,8); c.lineTo(42+k*7,58); c.stroke(); c.beginPath(); c.moveTo(52+k*7,8); c.lineTo(22+k*7,58); c.stroke(); } c.restore(); c.beginPath(); c.arc(32,32,20,0,6.283); c.lineWidth=5; c.strokeStyle=ICO_OUT; c.stroke(); c.lineWidth=3; c.strokeStyle='#a16207'; c.stroke(); },
  banana(c){ c.beginPath(); c.moveTo(14,22); c.quadraticCurveTo(22,52,52,44); c.quadraticCurveTo(30,42,22,20); c.closePath(); icoFS(c,'#fde047'); c.beginPath(); c.rect(12,17,6,6); icoFS(c,'#78350f',2); },
  trampo(c){ c.beginPath(); c.ellipse(32,36,22,8,0,0,6.283); icoFS(c,'#f472b6'); for(const x of [16,48]){ c.beginPath(); c.rect(x-2,38,4,14); icoFS(c,'#6b4423',2); } c.beginPath(); c.moveTo(32,28); c.lineTo(32,10); c.moveTo(26,16); c.lineTo(32,10); c.lineTo(38,16); c.lineWidth=3; c.strokeStyle='#fff'; c.stroke(); },
  tp(c){ c.beginPath(); c.arc(32,32,20,0,6.283); icoFS(c,'#c9a24a'); c.beginPath(); c.arc(32,32,15,0,6.283); c.fillStyle='#fef3c7'; c.fill(); icoPath(c,[[32,18],[36,32],[32,46],[28,32]]); c.fillStyle='#ef4444'; c.fill(); icoPath(c,[[32,32],[36,32],[32,46],[28,32]]); c.fillStyle='#1f2937'; c.fill(); },
  mirror(c){ c.beginPath(); c.rect(29,40,6,16); icoFS(c,'#a16207',2.5); c.beginPath(); c.ellipse(32,26,14,17,0,0,6.283); icoFS(c,'#c9a24a'); c.beginPath(); c.ellipse(32,26,10,13,0,0,6.283); c.fillStyle='#e0f2fe'; c.fill(); c.beginPath(); c.moveTo(26,20); c.lineTo(32,14); c.lineWidth=2; c.strokeStyle='#fff'; c.stroke(); },
  barrel(c){ c.beginPath(); c.ellipse(32,32,15,20,0,0,6.283); icoFS(c,'#8a5a2b'); for(const y of [20,44]){ c.beginPath(); c.moveTo(18,y); c.lineTo(46,y); c.lineWidth=3; c.strokeStyle='#374151'; c.stroke(); } c.fillStyle='#ef4444'; c.font='bold 14px sans-serif'; c.textAlign='center'; c.fillText('✕',32,37); c.beginPath(); c.moveTo(42,14); c.quadraticCurveTo(48,6,54,10); c.lineWidth=2; c.strokeStyle='#fde047'; c.stroke(); },
  shield(c){ c.beginPath(); c.rect(16,22,32,30); icoFS(c,'#a8a29e'); for(let k=0;k<4;k++){ c.beginPath(); c.rect(16+k*8,14,6,9); icoFS(c,'#a8a29e',2.5); } c.beginPath(); c.rect(28,38,8,14); icoFS(c,'#4b2e14',2); },
  rocketpilot(c){ ICO_DRAW.turret(c); c.beginPath(); c.arc(50,16,6,0,6.283); icoFS(c,'#1f2937',2); },
  dash(c){ for(let k=0;k<3;k++){ c.beginPath(); c.moveTo(10,20+k*12); c.lineTo(30-k*4,20+k*12); c.lineWidth=4; c.strokeStyle='#e0f2fe'; c.stroke(); } icoPath(c,[[32,14],[54,32],[32,50]]); icoFS(c,'#bae6fd'); },
  springs(c){ c.beginPath(); c.moveTo(18,14); c.lineTo(34,14); c.lineTo(34,34); c.lineTo(48,34); c.lineTo(48,42); c.lineTo(18,42); c.closePath(); icoFS(c,'#7c4a21'); c.beginPath(); for(let k=0;k<4;k++){ c.moveTo(20,46+k*3); c.lineTo(46,46+k*3); } c.lineWidth=2.5; c.strokeStyle='#4ade80'; c.stroke(); }
};
const BLOCK_SHOP={wool:2,wood:3,stone:4,obs:5,coral:7,iceblk:8};
function itemIcon(id,e,size){
  size=size||64; const bs=id==='block'?((e&&e.bsel)||2):BLOCK_SHOP[id], key=id+'|'+size+'|'+(bs||'');
  let cv=ICONC.get(key); if(cv) return cv;
  cv=document.createElement('canvas'); cv.width=cv.height=size; const c=cv.getContext('2d'); c.scale(size/64,size/64); c.lineJoin='round'; c.lineCap='round';
  const it=ITEMMAP[id], col=(it&&it.col&&it.col!=='#fff')?it.col:(bs?(BCOL[bs]||BCOL[2])[0]:'#94a3b8');
  // pastille
  const g=c.createLinearGradient(0,4,0,60); g.addColorStop(0,icoShade(col,.15)); g.addColorStop(1,icoShade(col,-.55));
  c.beginPath(); c.roundRect?c.roundRect(4,4,56,56,14):c.rect(4,4,56,56); c.fillStyle=g; c.fill(); c.lineWidth=3; c.strokeStyle='rgba(10,15,30,.85)'; c.stroke();
  c.save(); c.beginPath(); c.roundRect?c.roundRect(6,6,52,22,10):c.rect(6,6,52,22); c.fillStyle='rgba(255,255,255,.18)'; c.fill(); c.restore();
  // dessin
  c.save(); c.shadowColor='rgba(0,0,0,.45)'; c.shadowBlur=3; c.shadowOffsetY=2;
  if(bs){ const b=BCOL[bs]||BCOL[2]; icoCube(c,icoShade(b[0],.12),b[0],b[1]); }
  else if(ICO_DRAW[id]) ICO_DRAW[id](c,e);
  else { const ico=(it&&it.ico)||ICO_SHOPTXT(id); c.font='34px "Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif'; c.textAlign='center'; c.textBaseline='middle'; c.fillText(ico,32,35); }
  c.restore(); ICONC.set(key,cv); return cv;
}
function itemIconURL(id,e){ const k=id+'|'+((e&&e.bsel)||''); let u=ICOURL.get(k); if(!u){ u=itemIcon(id,e,64).toDataURL(); ICOURL.set(k,u); } return u; }
/* boutique : icônes dessinées */
{ const _si=shopIco; shopIco=function(id){ return `<img class="itico" src="${itemIconURL(id,player)}" alt="">`; };
  const st=document.createElement('style'); st.textContent='#shop .item .ic img.itico{width:40px;height:40px;display:block;image-rendering:auto}'; document.head.appendChild(st); }
