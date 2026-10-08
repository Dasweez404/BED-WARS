'use strict';
/* =====================  DÉTAILS 3D (2) : galion, coffres, barques, canons, pièges, mouettes  ===================== */
/* (pirates : on garde leur style simple, deux petits yeux) */
/* ---------- galion : gréement, nid-de-pie, figure de proue, cargaison, lanternes, rayons de barre ---------- */
{ const _bs=buildShip;
  buildShip=function(){ _bs(); const g=shipGroup; if(!g) return; const P=[], B=GEO.box, Cy=GEO.cyl, S=GEO.sphere0;
    const add=(geo,color,x,y,z,sx,sy,sz,rx,ry,rz)=>P.push({geo,color,pos:[x,y,z],scale:[sx,sy,sz],rot:[rx||0,ry||0,rz||0]});
    const rope=(x0,y0,z0,x1,y1,z1)=>{ const dx=x1-x0,dy=y1-y0,dz=z1-z0,L=Math.hypot(dx,dy,dz); const q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),new THREE.Vector3(dx/L,dy/L,dz/L)), e=new THREE.Euler().setFromQuaternion(q); add(Cy,'#c9a96a',(x0+x1)/2,(y0+y1)/2,(z0+z1)/2,.018,L,.018,e.x,e.y,e.z); };
    for(const [z,h] of [[-3.6,4.8],[2.8,3.9]]){ for(const s of [-1,1]){ for(const dz of [-.5,0,.5]) rope(0,h*.97,z,s*3.05,.75,z+dz); } add(Cy,'#6b4423',0,h*.97+.25,z,.38,.35,.38); add(Cy,'#5b3a1c',0,h*.97+.44,z,.42,.05,.42); }
    rope(0,4.8*.97,-3.6,0,1.6,-8.0); rope(0,3.9*.97,2.8,0,4.8*.82,-3.6);
    add(B,'#d6b27a',0,.55,-7.55,.18,.5,.24,-.3,0,0); add(S,'#f5c08f',0,.95,-7.7,.13,.13,.13); add(B,'#0ea5a4',0,.42,-7.45,.2,.25,.3,-.3,0,0);
    for(const [x,z] of [[-1.6,-1],[-1.9,-.4],[1.7,1.5],[1.5,-5.2]]){ add(B,'#a8743c',x,.25,z,.42,.42,.42); add(B,'#6b4423',x,.25,z,.44,.06,.44); }
    for(const [x,z] of [[1.9,-1.2],[2.1,-.7],[-2,3.6]]){ add(Cy,'#8a5a2b',x,.28,z,.18,.5,.18); add(Cy,'#3b3f4a',x,.15,z,.19,.04,.19); add(Cy,'#3b3f4a',x,.4,z,.19,.04,.19); }
    for(let k=0;k<8;k++){ const a=k*Math.PI/4; add(B,'#6b4423',Math.cos(a)*.32,.85+Math.sin(a)*.32,5.3,.04,.18,.04,0,0,a+Math.PI/2); }
    for(const [x,z] of [[-1.5,-5.2],[1.5,-5.2],[0,6.9]]){ add(Cy,'#2b2f3a',x,1.45,z,.02,.4,.02); add(B,'#1f2937',x,1.18,z,.16,.2,.16); }
    const m=new THREE.Mesh(mergeParts(P),VCMAT()); m.castShadow=true; g.add(m);
    const lamps=[]; for(const [x,z] of [[-1.5,-5.2],[1.5,-5.2],[0,6.9]]){ const l=new THREE.Mesh(GEO.box,new THREE.MeshBasicMaterial({color:0xffc861})); l.scale.set(.1,.13,.1); l.position.set(x,1.18,z); g.add(l); lamps.push(l); } g.userData.lamps2=lamps; };
}
/* ---------- coffres de base : trésor éparpillé ---------- */
{ const _bc=buildCores;
  buildCores=function(){ _bc(); for(const g of coreM){ if(!g) continue; const P=[], rn=prng3(g.position.x*7+g.position.z);
      for(let k=0;k<12;k++){ const a=rn()*6.28, r=.5+rn()*.25; P.push({geo:GEO.cyl,pos:[Math.cos(a)*r,-.32+rn()*.03,Math.sin(a)*r],scale:[.06,.012,.06],rot:[rn()*.4,0,rn()*.4],color:k%3?'#fbbf24':'#f59e0b'}); }
      for(const [x,z,c] of [[.55,.3,'#22d3ee'],[-.5,-.35,'#f43f5e'],[.45,-.45,'#a78bfa']]) P.push({geo:GEO.octa,pos:[x,-.27,z],scale:[.05,.07,.05],color:c});
      P.push({geo:GEO.cyl,pos:[-.6,-.22,.3],scale:[.05,.14,.05],color:'#fbbf24'},{geo:GEO.cyl,pos:[-.6,-.14,.3],scale:[.08,.03,.08],color:'#fbbf24'},{geo:GEO.cyl,pos:[-.6,-.3,.3],scale:[.07,.02,.07],color:'#fbbf24'});
      const m=new THREE.Mesh(mergeParts(P),new THREE.MeshStandardMaterial({vertexColors:true,flatShading:true,metalness:.45,roughness:.35,emissive:0x3a2500,emissiveIntensity:.35})); g.add(m); } };
}
/* ---------- barques : rames, banc, lanterne, voile triangulaire ---------- */
{ const _cb=createBoat;
  createBoat=function(b){ const g=_cb(b), tc=TEAMS[Math.max(0,b.team)].col, B=GEO.box;
    const m=new THREE.Mesh(mergeParts([{geo:B,pos:[-.2,-.02,0],scale:[.12,.05,.5],color:'#8a5a2b'},{geo:B,pos:[.45,-.02,0],scale:[.12,.05,.5],color:'#8a5a2b'},
      ...[-1,1].flatMap(s=>[{geo:GEO.cyl,pos:[0,-.05,s*.6],scale:[.025,.9,.025],rot:[0,0,1.2],color:'#a8743c'},{geo:B,pos:[-.4,-.22,s*.6],scale:[.2,.03,.09],rot:[0,0,1.2],color:'#a8743c'}]),
      {geo:GEO.cyl,pos:[-.75,.05,0],scale:[.02,.3,.02],color:'#2b2f3a'},{geo:B,pos:[-.75,.24,0],scale:[.08,.1,.08],color:'#fde68a'},
      {geo:GEO.torus,pos:[.6,-.03,.2],scale:[.1,.1,.1],rot:[Math.PI/2,0,0],color:'#c9a96a'}]),g.userData.mat||VCMAT()); m.castShadow=true; g.add(m);
    const sail=new THREE.Mesh(new THREE.ConeGeometry(.42,.75,3,1),new THREE.MeshStandardMaterial({color:0xf3ead2,flatShading:true,side:THREE.DoubleSide})); sail.scale.set(.06,1,1); sail.rotation.y=Math.PI/2; sail.position.set(.17,.55,.0); g.add(sail);
    const st=new THREE.Mesh(GEO.box,M(tc)); st.scale.set(.03,.08,.5); st.position.set(.17,.35,0); g.add(st); return g; };
}
/* ---------- canons à roues : roues à rayons, boulets, écouvillon ---------- */
{ const _cc=createCannonM;
  createCannonM=function(c){ const g=_cc(c); if(c.kind==='rocket') return g; const P=[];
    for(const z of [-.42,.42]) for(let k=0;k<6;k++){ const a=k*Math.PI/3; P.push({geo:GEO.box,pos:[Math.cos(a)*.14,.16+Math.sin(a)*.14,z*1.06],scale:[.03,.26,.03],rot:[0,0,a],color:'#7c4a21'}); }
    for(const [x,z] of [[-.4,.15],[-.48,.0],[-.4,-.15],[-.45,.07]]) P.push({geo:GEO.sphere,pos:[x,.28,z],scale:[.08,.08,.08],color:'#1f2937'});
    P.push({geo:GEO.cyl,pos:[0,.24,-.3],scale:[.02,.8,.02],rot:[0,0,Math.PI/2],color:'#a8743c'},{geo:GEO.cyl,pos:[.4,.24,-.3],scale:[.05,.1,.05],rot:[0,0,Math.PI/2],color:'#3b2a1a'});
    const m=new THREE.Mesh(mergeParts(P),VCMAT()); m.castShadow=true; g.add(m); return g; };
}
/* ---------- pièges : tourelle avec sacs de sable et caisse de munitions, mine à chaîne, peau de banane ouverte ---------- */
{ const _ct=createTrap;
  createTrap=function(t){ const g=_ct(t); const P=[];
    if(t.kind==='turret'){ for(let k=0;k<8;k++){ const a=k*Math.PI/4; P.push({geo:GEO.sphere,pos:[Math.cos(a)*.42,.08,Math.sin(a)*.42],scale:[.16,.08,.11],rot:[0,-a,0],color:k%2?'#d6c08a':'#c9b07a'}); }
      P.push({geo:GEO.box,pos:[-.35,.1,.35],scale:[.22,.18,.16],color:'#6b4423'},{geo:GEO.box,pos:[-.35,.2,.35],scale:[.23,.03,.17],color:'#3b3f4a'},{geo:GEO.sphere,pos:[-.3,.24,.32],scale:[.05,.05,.05],color:'#1f2937'}); }
    else if(t.kind==='mine'){ P.push({geo:GEO.cyl,pos:[0,.05,0],scale:[.03,.12,.03],color:'#4b5563'},{geo:GEO.cyl,pos:[0,.01,0],scale:[.12,.02,.12],color:'#374151'},{geo:GEO.torus,pos:[0,.38,0],scale:[.06,.06,.06],color:'#9ca3af'}); }
    else if(t.kind==='banana'){ for(let k=0;k<3;k++){ const a=k*2.1; P.push({geo:GEO.box,pos:[Math.cos(a)*.14,.03,Math.sin(a)*.14],scale:[.2,.025,.07],rot:[0,-a,.15],color:'#facc15'}); P.push({geo:GEO.box,pos:[Math.cos(a)*.22,.035,Math.sin(a)*.22],scale:[.04,.026,.05],rot:[0,-a,0],color:'#78350f'}); } }
    if(P.length){ const m=new THREE.Mesh(mergeParts(P),VCMAT()); m.castShadow=true; g.add(m); } return g; };
}
/* ---------- mouettes : bouts d'ailes noirs, queue, pattes, œil ---------- */
{ const _ba=buildAmbient;
  buildAmbient=function(){ _ba(); if(!ambient||!ambient.userData) return; const dk=M('#334155'), gr=M('#cbd5e1'), yl=M('#f59e0b');
    for(const b of ambient.userData.gulls||[]){ for(const w of b.userData.wings||[]){ const wb=w.children[0]; if(!wb) continue; const s=Math.sign(wb.position.z)||1; const tip=new THREE.Mesh(GEO.box,dk); tip.scale.set(.16,.028,.2); tip.position.set(-.03,0,s*.68); w.add(tip); const mid=new THREE.Mesh(GEO.box,gr); mid.scale.set(.19,.03,.2); mid.position.set(-.01,.003,s*.42); w.add(mid); }
      const tail=new THREE.Mesh(GEO.box,gr); tail.scale.set(.16,.02,.14); tail.position.set(-.36,0,0); b.add(tail);
      for(const z of [-.05,.05]){ const l=new THREE.Mesh(GEO.box,yl); l.scale.set(.02,.08,.02); l.position.set(-.05,-.12,z); b.add(l); }
      for(const z of [-.06,.06]){ const e=new THREE.Mesh(GEO.sphere0,new THREE.MeshBasicMaterial({color:0x111111})); e.scale.setScalar(.022); e.position.set(.36,.04,z); b.add(e); } } };
}
