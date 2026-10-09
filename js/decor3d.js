'use strict';
/* ===== Décors thématiques par carte (3D, purement visuels) : polynésien, jungle, épaves, cité corsaire, glace ===== */
const DEC3={meshes:[],models:null};
function decModels(){
  if(DEC3.models) return DEC3.models; const B=GEO.box,Cy=GEO.cyl,Co=GEO.cone,S=GEO.sphere,S0=GEO.sphere0,O=GEO.octa,To=GEO.torus, Mo={};
  const mk=f=>{ const P=[]; const a=(g,c,p,s,r)=>P.push({geo:g,color:c,pos:p,scale:s,rot:r}); f(a); return mergeParts(P); };
  Mo.tiki=mk(a=>{ a(B,'#6b4423',[0,.28,0],[.62,.56,.62]); a(B,'#8a5a2b',[0,.82,0],[.56,.56,.56]); a(B,'#b87333',[0,1.36,0],[.6,.56,.6]);
    for(const x of [-.14,.14]){ a(B,'#fff7d6',[x,1.42,.31],[.13,.1,.04]); a(B,'#111',[x,1.42,.33],[.05,.05,.03]); a(B,'#fff7d6',[x,.9,.29],[.12,.09,.04]); a(B,'#111',[x,.9,.31],[.05,.05,.03]); }
    a(B,'#2b1708',[0,1.26,.31],[.3,.1,.04]); a(B,'#2b1708',[0,.74,.29],[.28,.09,.04]); a(B,'#cbd5e1',[-.06,1.26,.33],[.04,.06,.03]); a(B,'#cbd5e1',[.06,1.26,.33],[.04,.06,.03]);
    a(B,'#6b4423',[0,1.46,.4],[.12,.1,.3]); a(Co,'#dc2626',[0,1.86,0],[.3,.5,.3]); a(Co,'#facc15',[-.2,1.74,0],[.12,.4,.12],[0,0,.5]); a(Co,'#22c55e',[.2,1.74,0],[.12,.4,.12],[0,0,-.5]);
    a(B,'#5b3a1c',[-.42,.9,0],[.18,.12,.5]); a(B,'#5b3a1c',[.42,.9,0],[.18,.12,.5]); });
  Mo.hut=mk(a=>{ a(B,'#d6b27a',[0,.34,0],[1.3,.68,1.3]); a(B,'#6b4423',[0,.06,0],[1.4,.12,1.4]); a(Co,'#d9b44a',[0,1.0,0],[1.15,.8,1.15],[0,Math.PI/4,0]); a(Co,'#b8902f',[0,1.0,0],[1.18,.7,1.18],[0,Math.PI/4+.4,0]);
    a(B,'#3b2412',[0,.28,.66],[.36,.54,.04]); for(const x of [-.4,.4]) a(B,'#f59e0b',[x,.4,.66],[.18,.18,.04]); a(Cy,'#7c4a21',[.7,.4,.7],[.05,.8,.05]); a(Cy,'#7c4a21',[-.7,.4,.7],[.05,.8,.05]); a(B,'#dc2626',[0,.72,.7],[1.4,.06,.08]); });
  Mo.canoe=mk(a=>{ a(B,'#8a5a2b',[0,.12,0],[1.9,.2,.42]); a(B,'#6b4423',[0,.2,0],[1.7,.06,.3]); a(Cy,'#8a5a2b',[.98,.2,0],[.12,.2,.2],[0,0,.9]); a(Cy,'#8a5a2b',[-.98,.2,0],[.12,.2,.2],[0,0,-.9]);
    a(Cy,'#7c4a21',[0,.22,.62],[.04,1.4,.04],[0,0,Math.PI/2]); a(Cy,'#7c4a21',[.4,.17,.4],[.03,.5,.03],[Math.PI/2,0,0]); a(Cy,'#7c4a21',[-.4,.17,.4],[.03,.5,.03],[Math.PI/2,0,0]); a(S,'#a16207',[0,.12,.8],[.95,.1,.1]); a(B,'#dc2626',[0,.3,0],[.5,.04,.2]); });
  Mo.tiare=mk(a=>{ a(Cy,'#2f7a3a',[0,.1,0],[.02,.2,.02]); for(let k=0;k<6;k++){ const t=k*1.047; a(S0,k%2?'#ffffff':'#fff1f2',[Math.cos(t)*.07,.24,Math.sin(t)*.07],[.07,.035,.07],[0,t,.6]); } a(S0,'#facc15',[0,.26,0],[.04,.04,.04]); a(O,'#2f7a3a',[.1,.07,0],[.1,.02,.06],[0,0,.3]); });
  Mo.fern=mk(a=>{ for(let k=0;k<7;k++){ const t=k*.9; a(leafGeo(.8,.16,.55,5),['#1f6b34','#2f8a43','#49a34f','#2a7a3e'][k%4],[0,.05,0],[1,1,1],[0,t,.5+(k%2)*.2]); } });
  Mo.jtree=mk(a=>{ a(Cy,'#5b3a1c',[0,.9,0],[.22,1.8,.22]); a(Cy,'#6b4423',[0,.1,0],[.34,.2,.34]); for(const [x,y,z,r,c] of [[0,2.15,0,.95,'#1f6b34'],[.5,1.85,.3,.7,'#2a7a3e'],[-.45,1.9,-.3,.75,'#2f8a43'],[.1,2.5,-.1,.6,'#3a9a4a']]) a(S,c,[x,y,z],[r,r*.7,r]);
    for(const [x,z,h] of [[.5,.2,1],[-.4,.35,1.3],[.1,-.5,.9]]) a(Cy,'#3a9a4a',[x,2.1-h/2,z],[.025,h,.025]); a(S0,'#f472b6',[.2,2.6,.5],[.12,.1,.12]); a(S0,'#fb923c',[-.5,2.1,.55],[.1,.1,.1]); });
  Mo.shroom=mk(a=>{ a(Cy,'#f5e6c8',[0,.25,0],[.12,.5,.12]); a(S,'#dc2626',[0,.52,0],[.4,.22,.4]); for(const [x,z] of [[.15,.12],[-.14,.16],[.02,-.2]]) a(S0,'#fff',[x,.7,z],[.06,.03,.06]); });
  Mo.vine=mk(a=>{ a(Cy,'#7c4a21',[0,1.1,0],[.07,2.2,.07]); for(let k=0;k<5;k++) a(S0,'#3a9a4a',[Math.sin(k*2)*.12,.3+k*.4,Math.cos(k*2)*.12],[.18,.1,.18],[0,k,0]); });
  Mo.wreck=mk(a=>{ const WC='#5a3a1e', WD='#3f2813';
    a(B,WD,[0,.12,0],[.5,.18,3.2]); for(let k=-4;k<=4;k++){ const sz=Math.abs(k)<3?1:.6; a(B,WC,[-.5,.35,k*.34],[.07,.7*sz,.1],[0,0,.35]); a(B,WC,[.5,.35,k*.34],[.07,.7*sz,.1],[0,0,-.35]); }
    for(let k=-3;k<=2;k++){ a(B,k%2?'#7a4c24':'#8a5a2b',[-.58,.2,k*.4],[.08,.2,.36],[0,0,.3]); } for(let k=0;k<3;k++) a(B,'#7a4c24',[.62,.22,k*.4-.8],[.08,.2,.36],[0,0,-.3]);
    a(Cy,'#4a3018',[0,1.5,.2],[.1,2.4,.1],[.35,0,.18]); a(Cy,'#4a3018',[.15,2.2,.6],[.06,1.4,.06],[0,0,Math.PI/2+.3]); a(B,'#d8cfae',[.4,1.7,.58],[.7,.9,.03],[.1,0,.3]);
    a(B,'#2b2118',[0,.5,-1.2],[.4,.3,.4]); a(Cy,'#3b3f4a',[0,.6,-1.2],[.1,.7,.1],[Math.PI/2,0,0]); a(S0,'#3b3f4a',[-.9,.12,1.1],[.14,.14,.14]); });
  Mo.bow=mk(a=>{ const WC='#5a3a1e'; a(B,'#3f2813',[0,.14,0],[.3,.2,1.6]); for(let k=0;k<4;k++){ a(B,WC,[-.34+k*.04,.4+k*.06,-.5+k*.35],[.07,.8,.1],[0,0,.3]); a(B,WC,[.34-k*.04,.4+k*.06,-.5+k*.35],[.07,.8,.1],[0,0,-.3]); }
    a(Cy,WC,[0,.9,.8],[.06,1.5,.06],[-.9,0,0]); a(S,'#cbd5e1',[0,.1,-.6],[.2,.12,.2]); });
  Mo.ribs=mk(a=>{ for(let k=-3;k<=3;k++){ const s=1-Math.abs(k)*.1; a(To,'#5a3a1e',[0,.3,k*.36],[.5*s,.5*s,.5*s],[Math.PI/2*0,Math.PI/2,0]); } a(B,'#3f2813',[0,.02,0],[.12,.08,2.8]); });
  Mo.anchor=mk(a=>{ a(Cy,'#475569',[0,.55,0],[.06,1.1,.06]); a(B,'#475569',[0,.95,0],[.4,.06,.06]); a(To,'#64748b',[0,1.2,0],[.12,.12,.12]); a(To,'#475569',[0,.18,0],[.34,.34,.34],[0,0,Math.PI]); a(B,'#334155',[0,.05,0],[.7,.06,.06]); });
  Mo.pyramid=mk(a=>{ const st=['#8b8070','#9a8f7e','#a89d8b','#b6ab98']; for(let k=0;k<4;k++){ const w=3.2-k*.7; a(B,st[k],[0,.25+k*.5,0],[w,.5,w]); a(B,'#6b6256',[0,.5+k*.5-.04,0],[w+.04,.05,w+.04]); }
    a(B,'#7c7366',[0,.9,1.8],[.8,1.8,.5],[.75,0,0]); for(let k=0;k<6;k++) a(B,k%2?'#a89d8b':'#8b8070',[0,.15+k*.3,2.1-k*.28],[.8,.3,.28]);
    a(B,'#4a4238',[0,2.35,0],[.7,.5,.7]); a(B,'#2b2118',[0,2.35,.36],[.3,.35,.04]); a(S0,'#fbbf24',[0,2.9,0],[.22,.22,.22]); for(const [x,z] of [[-.3,-.3],[.3,-.3],[-.3,.3],[.3,.3]]){ a(Cy,'#6b6256',[x,2.8,z],[.04,.5,.04]); } a(Co,'#fb923c',[0,3.2,0],[.14,.4,.14]);
    for(const x of [-1.2,1.2]){ a(B,'#4a4238',[x,.5,2.2],[.3,1,.3]); a(S0,'#16a34a',[x,1.1,2.2],[.2,.2,.2]); } a(B,'#16a34a',[0,1.15,1.6],[.05,.05,.05]); });
  Mo.house=mk(a=>{ a(B,'#e8dcc0',[0,.5,0],[1.4,1,1.2]); a(B,'#6b4423',[0,1.05,0],[1.5,.08,1.3]); a(B,'#7c2d12',[0,1.45,0],[1.5,.5,.9],[0,0,0]); a(Co,'#7c2d12',[0,1.45,0],[.95,.8,.95],[0,Math.PI/4,0]);
    a(B,'#3b2412',[-.3,.35,.61],[.3,.7,.04]); a(B,'#fde68a',[.35,.6,.61],[.28,.28,.04]); a(B,'#6b4423',[.35,.6,.63],[.34,.04,.03]); a(B,'#fde68a',[1.0*0,.6,-.61],[.28,.28,.04]); a(B,'#4a4238',[.5,1.65,-.2],[.2,.5,.2]); a(B,'#dc2626',[0,.9,.64],[1.5,.06,.04]); });
  Mo.lamp=mk(a=>{ a(Cy,'#2b2f3a',[0,.55,0],[.04,1.1,.04]); a(B,'#2b2f3a',[0,1.12,0],[.2,.04,.2]); a(B,'#ffc861',[0,1.24,0],[.14,.18,.14]); a(Co,'#2b2f3a',[0,1.42,0],[.14,.1,.14]); });
  Mo.cannon=mk(a=>{ a(B,'#6b4423',[0,.14,0],[.5,.2,.7]); a(Cy,'#2b2f3a',[0,.34,.05],[.13,.8,.13],[Math.PI/2-.2,0,0]); a(S0,'#2b2f3a',[0,.3,-.35],[.13,.13,.13]); for(const x of [-.26,.26]) a(Cy,'#2b2118',[x,.12,.1],[.15,.06,.15],[0,0,Math.PI/2]); });
  Mo.pine=mk(a=>{ a(Cy,'#5b3a1c',[0,.2,0],[.07,.4,.07]); for(let k=0;k<4;k++){ const r=.55-k*.11; a(Co,'#1f5a3a',[0,.55+k*.4,0],[r,.5,r]); a(Co,'#f1f5f9',[0,.7+k*.4,0],[r*.82,.3,r*.82]); } });
  Mo.igloo=mk(a=>{ a(S,'#f1f5f9',[0,0,0],[.9,.7,.9]); a(B,'#cfe8fb',[0,.2,.82],[.4,.4,.3]); a(B,'#1e3a5f',[0,.16,.97],[.26,.3,.04]); });
  Mo.ice=mk(a=>{ for(const [x,z,h,r] of [[0,0,1.1,.2],[.25,.1,.7,.15],[-.22,.14,.8,.16],[.05,-.25,.55,.13]]) a(Co,'#bfe6ff',[x,h/2,z],[r,h,r],[.1*x,0,.15*z]); });
  Mo.shell=mk(a=>{ a(S0,'#f9a8d4',[0,.05,0],[.12,.06,.1]); a(S0,'#fde68a',[.15,.03,.1],[.07,.04,.07]); a(O,'#fb7185',[-.14,.03,.12],[.1,.02,.1]); });
  Mo.buoy=mk(a=>{ a(Cy,'#dc2626',[0,.2,0],[.2,.4,.2]); a(Cy,'#f8fafc',[0,.45,0],[.2,.12,.2]); a(Cy,'#475569',[0,.8,0],[.03,.6,.03]); a(S0,'#fbbf24',[0,1.12,0],[.08,.08,.08]); });
  return DEC3.models=Mo;
}
function decBuild(){
  for(const m of DEC3.meshes) scene&&scene.remove(m); DEC3.meshes=[]; if(!scene||typeof decModels!=='function') return;
  const id=game.opts.map, M0=MAPS[id]||{}, Mo=decModels(), L={}, seed=prng3(7+id.length*31);
  const R=()=>seed();
  const free=(x,y)=>{ if(!inb(x,y)||floorT[idx(x,y)]!==1||wallT[idx(x,y)]||spawnerAt(x,y)) return false;
    for(const t of TD){ if(Math.abs(x-t.spawnTile[0])<=2&&Math.abs(y-t.spawnTile[1])<=2) return false; if(Math.abs(x-t.padTile[0])<=1&&Math.abs(y-t.padTile[1])<=1) return false; if(Math.abs(x-t.bx)<=2&&Math.abs(y-t.by)<=2) return false; } return true; };
  const edge=(x,y)=>{ for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]) if(inb(x+dx,y+dy)&&floorT[idx(x+dx,y+dy)]!==1) return true; return false; };
  const put=(k,x,y,o)=>{ (L[k]=L[k]||[]).push(Object.assign({x:x+.5,z:y+.5,ry:R()*6.28,s:1},o||{})); };
  const water=(x,y)=>inb(x,y)&&floorT[idx(x,y)]===0&&floorT[idx(x+1,y)]===0&&floorT[idx(x-1,y)]===0&&floorT[idx(x,y+1)]===0&&floorT[idx(x,y-1)]===0;
  const tiles=[]; for(let y=0;y<H;y++)for(let x=0;x<W;x++) if(floorT[idx(x,y)]===1) tiles.push([x,y]);
  const near=(x,y,d)=>{ for(const t of TD) if(Math.hypot(x-t.bx,y-t.by)<d) return true; return false; };
  const rock=(x,y)=>{ if(free(x,y)) put('shell',x,y); };
  if(id==='atoll'||id==='scatter'){
    for(const [x,y] of tiles){ if(!free(x,y)) continue; const e=edge(x,y), r=R();
      if(near(x,y,9)&&!near(x,y,4)&&r<.03) put('tiki',x,y,{s:1.1}); else if(near(x,y,10)&&!near(x,y,5)&&r<.07) put('hut',x,y,{s:1.05});
      else if(e&&r<.05) put('canoe',x,y); else if(r<(id==='atoll'?.08:.04)) put('tiare',x,y,{s:1.2}); else if(r<.1&&e) put('shell',x,y); }
  } else if(id==='jungle'){
    for(const [x,y] of tiles){ if(!free(x,y)) continue; const r=R(), nb=near(x,y,5);
      if(nb&&r>.04) continue; if(r<.07) put('jtree',x,y,{s:.9+R()*.7}); else if(r<.2) put('fern',x,y,{s:.9+R()*.8}); else if(r<.23) put('shroom',x,y,{s:1+R()}); else if(r<.25) put('vine',x,y); else if(r<.28) put('tiare',x,y,{s:1.3}); }
  } else if(id==='tempest'){
    for(const [x,y] of tiles){ if(!free(x,y)) continue; const e=edge(x,y), r=R(); if(near(x,y,6)) continue;
      if(r<.012) put('wreck',x,y,{s:1.1,rz:(R()-.5)*.25}); else if(r<.02) put('bow',x,y,{rz:(R()-.5)*.4}); else if(r<.03) put('ribs',x,y); else if(e&&r<.06) put('anchor',x,y,{s:.9}); else if(r<.09) put('shell',x,y); }
    for(let y=14;y<86;y+=3)for(let x=14;x<86;x+=3){ const p=[x+Math.floor(R()*3),y+Math.floor(R()*3)]; if(!water(p[0],p[1])) continue; if(R()<.06){ put(R()<.5?'wreck':'bow',p[0],p[1],{y:-.7,rz:.5*(R()-.5),rx:.2*(R()-.5),s:1.15}); } else if(R()<.04) put('buoy',p[0],p[1],{y:-.15}); }
  } else if(id==='citadel'){
    for(const sx of [-1,1]) for(const sy of [-1,1]){ const x=CX+sx*7, y=CY+sy*7; put('pyramid',x,y,{ry:Math.atan2(sx,sy)*0+(sx>0?(sy>0?Math.PI*1.0:Math.PI*1.5):(sy>0?Math.PI*.5:0)),s:1}); }
    for(const [x,y] of tiles){ if(!free(x,y)) continue; const r=R(); if(near(x,y,11)&&!near(x,y,5)){ if(r<.02) put('house',x,y,{s:1.1}); else if(r<.045) put('lamp',x,y); else if(r<.06) put('cannon',x,y); } else if(Math.abs(x-CX)<14&&Math.abs(y-CY)<14&&r<.025) put('lamp',x,y); }
  } else if(id==='glacier'||id==='floes'){
    for(const [x,y] of tiles){ if(!free(x,y)) continue; const r=R(); if(near(x,y,5)) continue; if(r<.035) put('pine',x,y,{s:.9+R()*.6}); else if(r<.05) put('ice',x,y,{s:1+R()}); else if(r<.056) put('igloo',x,y); }
  } else if(id==='tides'){
    for(const [x,y] of tiles){ if(!free(x,y)) continue; const r=R(); if(r<.05) put('shell',x,y,{s:1.4}); else if(r<.06&&edge(x,y)) put('canoe',x,y); }
  } else if(id==='maelstrom'){
    for(let k=0;k<36;k++){ const a=R()*6.283, rr=10+R()*10, x=Math.round(CX+Math.cos(a)*rr), y=Math.round(CY+Math.sin(a)*rr); if(water(x,y)) put(R()<.5?'ribs':R()<.5?'buoy':'anchor',x,y,{y:-.7,s:.9,rz:R()*.4}); }
  } else {
    for(const [x,y] of tiles){ if(!free(x,y)) continue; const e=edge(x,y), r=R(); if(near(x,y,6)) continue; if(e&&r<.04) put('shell',x,y); else if(r<.006) put('anchor',x,y); else if(r<.012) put('cannon',x,y); }
  }
  for(const k of Object.keys(L)){ const m=instOf(Mo[k],VCMAT(),L[k],true); DEC3.meshes.push(m); }
}
{ const _on=onNewGame; onNewGame=function(){ _on(); try{ decBuild(); }catch(e){ console.error(e); } }; }
