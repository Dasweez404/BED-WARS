'use strict';
/* =====================  RÉCEPTACLES DE RESSOURCES  =====================
   Base : coffre magique ouvert qui crache des ressources dans un faisceau de lumière.
   Or : brasero doré avec flammes et pièce flottante. Diamant : autel à pylônes et cristaux.
   Un petit affichage au-dessus indique le stock prêt à être ramassé. */
const PD={list:[],G:null,mats:{}};
function pdG(){ return PD.G||(PD.G={box:new THREE.BoxGeometry(1,1,1),cyl:new THREE.CylinderGeometry(1,1,1,22),sph:new THREE.SphereGeometry(1,14,10),oct:new THREE.OctahedronGeometry(1,0),
  beam:new THREE.CylinderGeometry(.12,.3,1,18,1,true),torus:new THREE.TorusGeometry(1,.06,8,40),cone:new THREE.ConeGeometry(1,1,10,1,true)}); }
function pdStd(c,o){ const k='s'+c+JSON.stringify(o||{}); return PD.mats[k]||(PD.mats[k]=new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.5,flatShading:true},o||{}))); }
function pdGlow(c,op){ const k='g'+c+op; return PD.mats[k]||(PD.mats[k]=new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:op,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide})); }
function pdMesh(par,geo,mat,x,y,z,sx,sy,sz,rx,ry,rz){ const m=new THREE.Mesh(geo,mat); m.position.set(x,y,z); m.scale.set(sx,sy===undefined?sx:sy,sz===undefined?sx:sz); if(rx||ry||rz) m.rotation.set(rx||0,ry||0,rz||0); par.add(m); return m; }
function pdBuild(sp){
  const G=pdG(), g=new THREE.Group(); g.position.set(sp.x+.5,0,sp.y+.5); const o={sp,g};
  if(sp.kind==='base'){
    const tm=TEAMS[sp.team], dark=tm.dark, light=tm.light;
    pdMesh(g,G.cyl,pdStd(dark,{metalness:.1}),0,.045,0,.47,.09,.47); pdMesh(g,G.cyl,pdStd('#cbb98a'),0,.11,0,.4,.05,.4);
    o.ring=pdMesh(g,G.torus,pdStd(light,{emissive:light,emissiveIntensity:.8}),0,.14,0,.43,.43,.43,Math.PI/2,0,0);
    const wood=pdStd('#8a5a2b'), gold=pdStd('#fbbf24',{metalness:.7,roughness:.3,emissive:'#7a4f00',emissiveIntensity:.4});
    pdMesh(g,G.box,wood,0,.27,0,.5,.22,.34); pdMesh(g,G.box,pdStd('#6f4520'),0,.17,0,.52,.04,.36);
    for(const s of [-1,1]) pdMesh(g,G.box,gold,s*.17,.27,0,.06,.24,.37);
    pdMesh(g,G.box,gold,0,.3,.175,.09,.09,.03);
    const lid=new THREE.Group(); lid.position.set(0,.38,-.17); lid.rotation.x=-1.15; g.add(lid);
    pdMesh(lid,G.box,wood,0,0,.17,.5,.05,.36); for(const s of [-1,1]) pdMesh(lid,G.box,gold,s*.17,.005,.17,.06,.065,.37);
    o.glow=pdMesh(g,G.box,pdGlow(0xfff1a8,.9),0,.385,0,.42,.015,.26);
    o.beam=pdMesh(g,G.beam,pdGlow(0xffe9a0,.22),0,.38+.85,0,1,1.7,1);
    o.orbit=new THREE.Group(); o.orbit.position.y=.95; g.add(o.orbit); o.orbs=[];
    ['#cd7f32','#e5e7eb','#fbbf24','#22d3ee'].forEach((c,i)=>{ const a=i*Math.PI/2, m=pdMesh(o.orbit,G.sph,new THREE.MeshBasicMaterial({color:c}),Math.cos(a)*.34,0,Math.sin(a)*.34,.06); m.userData.base=.06; o.orbs.push(m); });
    o.halo=pdMesh(g,G.torus,pdStd(light,{emissive:light,emissiveIntensity:1,transparent:true,opacity:.8}),0,1.25,0,.3,.3,.3,Math.PI/2,0,0);
  } else if(sp.kind==='gold'){
    pdMesh(g,G.cyl,pdStd('#7a5a2e'),0,.05,0,.44,.1,.44); pdMesh(g,G.cyl,pdStd('#a9824a'),0,.2,0,.2,.2,.2);
    const gold=pdStd('#fbbf24',{metalness:.75,roughness:.28,emissive:'#8a5a00',emissiveIntensity:.5});
    pdMesh(g,G.cyl,gold,0,.34,0,.31,.07,.31); pdMesh(g,G.torus,gold,0,.38,0,.31,.31,.31,Math.PI/2,0,0).scale.z=.7;
    o.glow=pdMesh(g,G.cyl,pdGlow(0xffd35a,.85),0,.385,0,.27,.01,.27);
    o.flames=[0,1,2,3].map(i=>{ const a=i*1.57+.4; return pdMesh(g,G.cone,pdGlow(i%2?0xffe08a:0xff9a2e,.8),Math.cos(a)*.1,.55,Math.sin(a)*.1,.1,.4,.1); });
    o.beam=pdMesh(g,G.beam,pdGlow(0xffd35a,.16),0,1.15,0,1.1,1.5,1.1);
    o.coin=new THREE.Group(); o.coin.position.y=.95; g.add(o.coin); pdMesh(o.coin,G.cyl,gold,0,0,0,.15,.025,.15,Math.PI/2,0,0);
    o.coin2=pdMesh(o.coin,G.cyl,gold,.26,.12,0,.07,.015,.07,Math.PI/2,0,0);
    o.halo=pdMesh(g,G.torus,pdStd('#fde047',{emissive:'#fde047',emissiveIntensity:.9,transparent:true,opacity:.75}),0,.95,0,.3,.3,.3,Math.PI/2,0,0);
  } else {
    const teal=pdStd('#134e5e',{metalness:.2}), cy='#67e8f9';
    pdMesh(g,G.cyl,teal,0,.05,0,.5,.1,.5); pdMesh(g,G.cyl,pdStd('#1d6a7c'),0,.12,0,.4,.05,.4);
    o.ring=pdMesh(g,G.torus,pdStd(cy,{emissive:cy,emissiveIntensity:.9}),0,.16,0,.44,.44,.44,Math.PI/2,0,0);
    for(let i=0;i<4;i++){ const a=i*1.5708+.785, x=Math.cos(a)*.38, z=Math.sin(a)*.38;
      pdMesh(g,G.box,pdStd('#0f3b4a'),x,.34,z,.08,.46,.08); pdMesh(g,G.oct,pdStd(cy,{emissive:'#22d3ee',emissiveIntensity:1.1,roughness:.1}),x,.64,z,.07,.1,.07); }
    for(const [x,z,h] of [[-.1,-.2,.5],[.14,-.16,.38],[-.2,.08,.32]]) pdMesh(g,G.oct,pdStd('#7ff0ff',{emissive:'#13b6d0',emissiveIntensity:.7,roughness:.1,transparent:true,opacity:.88}),x,.18+h*.5,z,.09,h*.5,.09,0,x*5,0);
    o.beam=pdMesh(g,G.beam,pdGlow(0x7ff0ff,.18),0,1.05,0,.9,1.4,.9);
    o.halo=pdMesh(g,G.torus,pdStd(cy,{emissive:cy,emissiveIntensity:1,transparent:true,opacity:.8}),0,.62,0,.42,.42,.42,Math.PI/2,.3,0);
    o.halo2=pdMesh(g,G.torus,pdStd('#e0f9ff',{emissive:'#e0f9ff',emissiveIntensity:1,transparent:true,opacity:.6}),0,.62,0,.3,.3,.3,.4,0,0);
  }
  scene.add(g); return o;
}
{ const _b=buildPads;
  buildPads=function(){ _b(); for(const o of PD.list) scene.remove(o.g); PD.list=[]; for(const sp of spawners) PD.list.push(pdBuild(sp)); };
  const _s=syncPads;
  syncPads=function(){ _s();
    if(padInst){ for(const k of ['bronze','silver','gold']) padInst[k].count=0; padInst.gem.count=0; for(const k of ['bronze','silver','gold','gem']) padInst[k].instanceMatrix.needsUpdate=true; }
    const t=game.t;
    for(const o of PD.list){ const sp=o.sp, T0=sp.types;
      if(sp.kind==='base'){ const w=(T0.bronze.stock/12+T0.silver.stock/5+(T0.gold.stock/2)+(T0.diamond.stock)), f=Math.min(1,w/5);
        o.ring.rotation.z=t*.6; o.orbit.rotation.y=t*(1.2+f*1.5); o.halo.rotation.z=-t*.9; o.halo.position.y=1.25+Math.sin(t*2)*.04;
        o.orbs.forEach((m,i)=>{ const st=[T0.bronze.stock/10,T0.silver.stock/4,T0.gold.stock/2,T0.diamond.stock][i]; m.scale.setScalar(.05+Math.min(.09,st*.03)+Math.sin(t*4+i)*.006); m.position.y=Math.sin(t*3+i*1.7)*.07; });
        o.glow.material.opacity=.75+.2*Math.sin(t*5); o.beam.material.opacity=.14+.22*f+.04*Math.sin(t*4); }
      else if(sp.kind==='gold'){ const st=T0.gold.stock, f=Math.min(1,st/3);
        o.coin.rotation.y=t*2.4; o.coin.position.y=.95+Math.sin(t*2.5)*.06; o.coin.scale.setScalar(1+f*.4); o.halo.rotation.z=t*.8; o.halo.scale.setScalar(.3+f*.1);
        o.flames.forEach((m,i)=>{ m.scale.set(.09,.28+f*.2+.1*Math.abs(Math.sin(t*9+i*2)),.09); m.position.y=.5+m.scale.y*.5; });
        o.glow.material.opacity=.6+.3*Math.sin(t*6); o.beam.material.opacity=.08+.16*f; }
      else { const st=T0.diamond.stock, f=Math.min(1,st/2);
        o.ring.rotation.z=-t*.5; o.halo.rotation.z=t*1.3; o.halo2.rotation.y=t*1.6; o.halo.scale.setScalar(.42+f*.08); o.beam.material.opacity=.1+.22*f+.03*Math.sin(t*3); }
    } };
}
/* ---- petit affichage du stock prêt à être ramassé ---- */
function pdPill(x,y,items){
  ctx.font='bold 13px system-ui'; const w=items.reduce((s,it)=>s+ctx.measureText(String(it.n)).width+26,10); let px=x-w/2; const h=22, py=y-h/2;
  ctx.fillStyle='#0b1b2dd9'; ctx.beginPath(); if(ctx.roundRect) ctx.roundRect(px,py,w,h,11); else ctx.rect(px,py,w,h); ctx.fill(); ctx.lineWidth=1.5; ctx.strokeStyle='#ffffff55'; ctx.stroke(); px+=8;
  for(const it of items){ ctx.globalAlpha=it.z?.4:1; ctx.beginPath(); ctx.arc(px+6,y,6,0,6.283); ctx.fillStyle=it.c; ctx.fill(); ctx.strokeStyle='#0008'; ctx.lineWidth=1; ctx.stroke(); ctx.fillStyle='#fff'; ctx.textAlign='left'; ctx.fillText(String(it.n),px+15,y+4.5); px+=ctx.measureText(String(it.n)).width+26; ctx.globalAlpha=1; }
}
{ const _dh=drawHud;
  drawHud=function(){ _dh(); if(game.state!=='play'||!ctx||!player||typeof w2s!=='function'||(typeof BOSS!=='undefined'&&false)) return;
    ctx.save(); ctx.setTransform(DPR,0,0,DPR,0,0);
    for(const sp of spawners){ const mine=sp.kind==='base'&&(sp.team===player.team||teamElim(sp.team)); if(sp.kind==='base'&&!mine) continue;
      const cx=(sp.x+.5)*T, cy=(sp.y+.5)*T; if(sp.kind!=='base'&&Math.hypot(cx-player.x,cy-player.y)>24*T) continue;
      const items=[]; for(const r of ['bronze','silver','gold','diamond']){ const ty=sp.types[r]; if(ty&&ty.int()!==Infinity) items.push({n:ty.stock,c:RESCOL[r],z:ty.stock<=0}); }
      if(!items.length) continue; const s=w2s(cx,cy,(sp.kind==='base'?1.55:sp.kind==='dia'?1.45:1.35)*T); if(!s[2]||s[0]<-60||s[0]>VW+60||s[1]<-20||s[1]>VH+20) continue;
      pdPill(s[0],s[1],items); }
    ctx.textAlign='left'; ctx.restore(); }; }
