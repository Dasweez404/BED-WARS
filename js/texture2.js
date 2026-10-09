'use strict';
/* =====================  TEXTURES 2 : blocs plus détaillés, sol sableux / herbeux, icônes de blocs texturées  =====================
   Pixel art procédural 32×32 : biseaux lumineux, bruit, motifs sculptés. « Bloc de temple » (ex-grès taillé) et « Bloc de corail » (ex-grès rouge). */
BNAME[4]='Bloc de temple'; BNAME[7]='Bloc de corail';
BCOL[4]=['#a3a8b0','#6f747d']; BCOL[7]=['#f27f86','#b9485a'];
for(const k of ['stone','coral']){ const it=ITEMMAP[k]; if(it) it.n=k==='stone'?'Bloc de temple':'Bloc de corail'; }
for(const k in BTEX) delete BTEX[k];
function t2canvas(N){ const c=document.createElement('canvas'); c.width=c.height=N; return c; }
function t2tex(c){ const tx=new THREE.CanvasTexture(c); tx.magFilter=THREE.NearestFilter; tx.minFilter=THREE.NearestMipmapLinearFilter; tx.generateMipmaps=true; if('colorSpace' in tx) tx.colorSpace=THREE.SRGBColorSpace; return tx; }
function t2bevel(g,N,hi,lo,w){ w=w||1; g.fillStyle=hi; g.fillRect(0,0,N,w); g.fillRect(0,0,w,N); g.fillStyle=lo; g.fillRect(0,N-w,N,w); g.fillRect(N-w,0,w,N); }
blockTex=function(t){
  if(BTEX[t]) return BTEX[t]; const N=32, c=t2canvas(N), g=c.getContext('2d'); let sd=t*977+31; const R=()=>((sd=(Math.imul(sd,1664525)+1013904223)>>>0)/4294967296), RI=n=>Math.floor(R()*n);
  const px=(x,y,col,w,h)=>{ g.fillStyle=col; g.fillRect(((x%N)+N)%N,y,w||1,h||1); };
  if(t===2){ // bois : planches avec veines et clous
    for(let r=0;r<4;r++){ const y=r*8, base=['#d3a066','#c99558','#d8a96c','#c58f52'][r]; g.fillStyle=base; g.fillRect(0,y,N,8);
      for(let k=0;k<9;k++){ const x=RI(N), l=4+RI(9); px(x,y+1+RI(6),r%2?'#b5803f':'#e0b57a',l,1); }
      px(0,y,'#e8c28a',N,1); px(0,y+7,'#6e4520',N,1); const jx=(r%2?9:21); px(jx,y,'#6e4520',1,7); px(jx+1,y,'#e8c28a',1,7); px(jx-4,y+3,'#4d3016'); px(jx+4,y+3,'#4d3016'); }
    t2bevel(g,N,'rgba(255,240,200,.35)','rgba(60,30,10,.35)'); }
  else if(t===3){ // grès : strates ondulées et grains
    g.fillStyle='#ead9a4'; g.fillRect(0,0,N,N);
    for(let y=0;y<N;y++){ const w=Math.sin(y*.9)*1.2, b=Math.floor((y+w)/5)%3; if(b===0) px(0,y,'#e1cd92',N,1); else if(b===1&&y%5===2) px(0,y,'#f4e8bd',N,1); }
    for(let k=0;k<4;k++){ const y=3+k*8+RI(3); for(let x=0;x<N;x++) if(R()<.55) px(x,y+Math.round(Math.sin(x*.35+k)*1.4),'#cdb375'); }
    for(let k=0;k<46;k++) px(RI(N),RI(N),R()<.5?'#d3bd80':'#f7edc8'); for(let k=0;k<5;k++) px(RI(N),RI(N),'#b89b58',2,1);
    t2bevel(g,N,'rgba(255,250,220,.4)','rgba(110,80,30,.32)'); }
  else if(t===4){ // bloc de temple : pierre grise taillée, joints nets, 4 dalles
    g.fillStyle='#9ea3ab'; g.fillRect(0,0,N,N);
    const sl=[[0,0,16,16,'#a6abb3'],[16,0,16,16,'#9aa0a8'],[0,16,16,16,'#9aa0a8'],[16,16,16,16,'#a6abb3']];
    for(const [x,y,w,h,c] of sl){ g.fillStyle=c; g.fillRect(x+1,y+1,w-2,h-2); g.fillStyle='rgba(255,255,255,.28)'; g.fillRect(x+1,y+1,w-2,1); g.fillRect(x+1,y+1,1,h-2); g.fillStyle='rgba(40,45,55,.3)'; g.fillRect(x+1,y+h-2,w-2,1); g.fillRect(x+w-2,y+1,1,h-2); }
    g.fillStyle='#6b7079'; g.fillRect(0,15,N,2); g.fillRect(15,0,2,N); g.fillRect(0,0,N,1); g.fillRect(0,N-1,N,1); g.fillRect(0,0,1,N); g.fillRect(N-1,0,1,N); }
  else if(t===7){ // bloc de corail : polypes, branches et petits trous
    g.fillStyle='#ee707c'; g.fillRect(0,0,N,N); for(let k=0;k<70;k++) px(RI(N),RI(N),R()<.5?'#e25e6e':'#f58a92');
    for(let k=0;k<9;k++){ const x=RI(N), y=RI(N), r=2+RI(3); for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){ const d=dx*dx+dy*dy; if(d<=r*r) px(x+dx,(y+dy+N)%N,d>(r-1)*(r-1)?'#c64a5d':(dx+dy<0?'#ffb0b4':'#f8969c')); } }
    for(let k=0;k<7;k++){ px(RI(N),RI(N),'#8f2f45',2,2); } for(let k=0;k<14;k++) px(RI(N),RI(N),'#ffd0c8');
    for(let k=0;k<3;k++){ const x=RI(N); for(let y=0;y<N;y+=2) px(x+Math.round(Math.sin(y*.5+k)*2),y,'#ff9f6e'); }
    t2bevel(g,N,'rgba(255,220,220,.35)','rgba(110,20,40,.38)'); }
  else if(t===5){ // obsidienne : verre sombre, reflets et veines violettes
    g.fillStyle='#241338'; g.fillRect(0,0,N,N); for(let k=0;k<40;k++) px(RI(N),RI(N),R()<.5?'#2f1a4a':'#1a0c2b');
    for(let k=0;k<6;k++){ let x=RI(N), y=RI(N); for(let l=0;l<10+RI(10);l++){ px(x,y,k%2?'#7c45cf':'#5a2fa3'); x=(x+RI(3)+0)%N; y=(y+RI(3)-0+(R()<.4?1:0)+N)%N; } }
    for(let i=0;i<14;i++){ px(4+i,N-5-i,'rgba(255,255,255,.18)'); px(5+i,N-5-i,'rgba(255,255,255,.08)'); } for(let k=0;k<10;k++) px(RI(N),RI(N),'#c4a1ff');
    t2bevel(g,N,'rgba(190,150,255,.4)','rgba(0,0,0,.5)'); }
  else { // glace : cristaux, fissures, éclat
    g.fillStyle='#bfeafc'; g.fillRect(0,0,N,N); for(let k=0;k<60;k++) px(RI(N),RI(N),R()<.5?'#cfeffc':'#a9dff5');
    for(let k=0;k<5;k++){ let x=RI(N), y=RI(N); for(let l=0;l<9;l++){ px(x,y,k%2?'#f2fcff':'#86cbea'); x=(x+1)%N; y=(y+(R()<.5?1:0))%N; } }
    for(let i=0;i<12;i++){ px(3+i,N-4-i,'rgba(255,255,255,.55)'); } for(let k=0;k<12;k++) px(RI(N),RI(N),'#ffffff');
    t2bevel(g,N,'rgba(255,255,255,.65)','rgba(80,150,190,.4)'); }
  return BTEX[t]=t2tex(c);
};
/* ---- sol des îles : grain de sable / brins d'herbe (multiplié par la couleur de la case) ---- */
let T2GROUND=null;
function groundTex2(){ if(T2GROUND) return T2GROUND; const N=32, c=t2canvas(N), g=c.getContext('2d'); let sd=4242; const R=()=>((sd=(Math.imul(sd,1664525)+1013904223)>>>0)/4294967296), RI=n=>Math.floor(R()*n);
  g.fillStyle='#fbfbfb'; g.fillRect(0,0,N,N); for(let k=0;k<160;k++){ const v=230+RI(26); g.fillStyle=`rgb(${v},${v},${v})`; g.fillRect(RI(N),RI(N),1,1); }
  for(let k=0;k<22;k++){ g.fillStyle='rgba(120,120,120,.55)'; g.fillRect(RI(N),RI(N),1,1+RI(2)); } for(let k=0;k<10;k++){ g.fillStyle='rgba(255,255,255,1)'; g.fillRect(RI(N),RI(N),2,1); }
  g.fillStyle='rgba(0,0,0,.08)'; g.fillRect(0,N-1,N,1); g.fillRect(N-1,0,1,N); g.fillStyle='rgba(255,255,255,.35)'; g.fillRect(0,0,N,1); g.fillRect(0,0,1,N);
  return T2GROUND=t2tex(c); }

/* ---- icônes de blocs : vraie texture projetée sur un cube isométrique ---- */
{ const _ic=icoCube;
  window.icoCubeTex=function(c,bs){ const tex=blockTex(bs), img=tex&&tex.image; if(!img) return false; const N=img.width;
    const faces=[{pts:[[12,22],[32,33],[32,56],[12,45]],m:[20/N,11/N,0,23/N,12,22],shade:'rgba(0,0,0,.08)'},{pts:[[32,33],[52,22],[52,45],[32,56]],m:[20/N,-11/N,0,23/N,32,33],shade:'rgba(10,10,30,.34)'},{pts:[[32,12],[52,22],[32,33],[12,22]],m:[20/N,10/N,-20/N,10/N,32,12],shade:'rgba(255,255,255,.12)'}];
    c.save(); const sm=c.imageSmoothingEnabled; c.imageSmoothingEnabled=false;
    for(const f of faces){ c.save(); c.beginPath(); f.pts.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1])); c.closePath(); c.clip(); c.shadowColor='transparent'; c.transform(...f.m); c.drawImage(img,0,0); c.restore(); c.save(); c.beginPath(); f.pts.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1])); c.closePath(); c.fillStyle=f.shade; c.fill(); c.restore(); }
    for(const f of faces){ c.beginPath(); f.pts.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1])); c.closePath(); c.lineWidth=1; c.strokeStyle='rgba(255,255,255,.18)'; c.stroke(); }
    c.imageSmoothingEnabled=sm; c.restore(); return true; };
  const _ii=itemIcon;
  itemIcon=function(id,e,size){ size=size||64; const bs=id==='block'?((e&&e.bsel)||2):BLOCK_SHOP[id]; if(!bs) return _ii(id,e,size);
    const key=id+'|'+size+'|'+bs+'|t2'; let cv=ICONC.get(key); if(cv) return cv; cv=document.createElement('canvas'); cv.width=cv.height=size; const c=cv.getContext('2d'); c.scale(size/64,size/64); c.lineJoin='round';
    c.shadowColor='rgba(0,0,0,.45)'; c.shadowBlur=3; c.shadowOffsetY=2; if(!icoCubeTex(c,bs)){ return _ii(id,e,size); } ICONC.set(key,cv); return cv; };
  ICONC.clear(); ICOURL.clear(); }
