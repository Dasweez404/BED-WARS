'use strict';
/* =====================  DÉTAILS 3D : décors, animaux, objets tenus  =====================
   Palmiers, rochers, tonneaux, coffres, cristaux plus riches ; nouveaux décors (buissons fleuris, caisses, ancres, cordages, boulets, bois flotté, étoiles de mer) ;
   requin, crabe, baleine, dauphin plus détaillés ; tortues de mer, perroquets perchés ; objets tenus (épée, pioche, pistolets, mousquet, bombe, arbalète…). */
const DP=(parts,scale)=>mergeParts(parts);
/* ---------- décors fusionnés ---------- */
{ const _bm=buildModels;
  buildModels=function(){ _bm(); const B=GEO.box, S=GEO.sphere, S0=GEO.sphere0, Cy=GEO.cyl, Co=GEO.cone, O=GEO.octa, To=GEO.torus;
    /* palmier : racines, tronc annelé, 11 palmes à nervure, noix de coco, régime de bananes */
    { const parts=[], pts=[], N=8;
      for(let k=0;k<=N;k++){ const t=k/N; pts.push([.62*t*t+.07*Math.sin(t*5)*t,1.8*t,.14*Math.sin(t*3)*t]); }
      for(let k=0;k<N;k++){ const a=pts[k],b=pts[k+1], dx=b[0]-a[0],dy=b[1]-a[1], r0=.15-.07*(k/N), r1=.15-.07*((k+1)/N);
        parts.push({geo:new THREE.CylinderGeometry(r1,r0,Math.hypot(dx,dy)*1.05,8),pos:[(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2],rot:[0,0,-Math.atan2(dx,dy)],color:k%2?'#9c6a35':'#b98445'});
        parts.push({geo:new THREE.CylinderGeometry(r1*1.12,r1*1.12,.035,8),pos:[a[0]*.4+b[0]*.6,a[1]*.4+b[1]*.6,a[2]*.4+b[2]*.6],rot:[0,0,-Math.atan2(dx,dy)],color:'#6e4a22'}); }
      for(let k=0;k<5;k++){ const a=k*1.26; parts.push({geo:Co,pos:[Math.cos(a)*.14,.07,Math.sin(a)*.14],scale:[.07,.2,.07],rot:[Math.sin(a)*.9,0,-Math.cos(a)*.9],color:'#7a5128'}); }
      parts.push({geo:S,pos:[pts[0][0],.08,0],scale:[.22,.13,.22],color:'#7a5128'});
      const top=pts[N];
      for(let k=0;k<11;k++){ const a=k*Math.PI*2/11+(k%3)*.1, L=1.0+((k*37)%5)*.07, drp=.55+((k*17)%4)*.14; const tone=['#ffffff','#d9ffb8','#b8f08a','#eaffd0'][k%4];
        parts.push({geo:leafGeo(L,.24,drp,7),pos:[top[0],top[1]+.03,top[2]],rot:[0,a,.38+(k%2)*.14],color:tone});
        parts.push({geo:B,pos:[top[0]+Math.cos(a)*L*.3,top[1]+.1-drp*.09,top[2]-Math.sin(a)*L*.3],scale:[L*.55,.018,.018],rot:[0,a,-.32-(k%2)*.1],color:'#7a6a2a'}); }
      for(let k=0;k<4;k++){ const a=k*1.6+.4; parts.push({geo:leafGeo(.65,.14,.14,5),pos:[top[0],top[1]+.06,top[2]],rot:[0,a,1.05],color:'#d4ffa8'}); }
      parts.push({geo:leafGeo(.8,.16,.9,5),pos:[top[0],top[1]-.02,top[2]],rot:[0,2.2,.7],color:'#9a8a4a'}); // palme sèche
      for(const [x,z,r,c] of [[.12,.07,.11,'#5e3d1a'],[-.09,.1,.1,'#6a4620'],[.0,-.13,.1,'#5e3d1a'],[.1,-.1,.09,'#7a8a2a'],[-.13,-.04,.09,'#6a4620']]) parts.push({geo:S,pos:[top[0]+x,top[1]-.14,top[2]+z],scale:[r,r,r],color:c});
      MODELS.palm=mergeParts(parts); }
    /* rocher : facettes, mousse, galets */
    MODELS.rock=mergeParts([{geo:O,pos:[0,.16,0],scale:[.33,.26,.29],rot:[.2,.4,.1],color:'#868b96'},{geo:O,pos:[.24,.1,.1],scale:[.17,.14,.15],rot:[.1,1.1,.3],color:'#a6abb5'},{geo:O,pos:[-.2,.09,-.14],scale:[.15,.12,.14],rot:[.3,.2,.1],color:'#6f747e'},
      {geo:S,pos:[-.03,.34,.02],scale:[.2,.07,.17],color:'#5f9a4a'},{geo:S,pos:[.2,.22,.1],scale:[.1,.04,.09],color:'#6fae56'},{geo:S0,pos:[.33,.03,-.18],scale:[.05,.035,.05],color:'#b4b8c1'},{geo:S0,pos:[-.34,.03,.16],scale:[.04,.03,.04],color:'#9a9fa9'},{geo:S0,pos:[.1,.025,.34],scale:[.045,.03,.045],color:'#c0c4cc'}]);
    /* tonneau : douelles, 3 cerclages, couvercle à planches et bonde */
    { const P=[{geo:Cy,pos:[0,.25,0],scale:[.2,.5,.2],color:'#7c4f26'},{geo:Cy,pos:[0,.25,0],scale:[.225,.34,.225],color:'#8a5a2b'}];
      for(let k=0;k<10;k++){ const a=k*Math.PI*2/10; P.push({geo:B,pos:[Math.cos(a)*.222,.25,Math.sin(a)*.222],scale:[.012,.46,.07],rot:[0,-a,0],color:k%2?'#a06a35':'#935f2e'}); }
      for(const y of [.1,.25,.4]) P.push({geo:Cy,pos:[0,y,0],scale:[y===.25?.236:.222,.035,y===.25?.236:.222],color:'#3b3f4a'});
      P.push({geo:Cy,pos:[0,.505,0],scale:[.185,.02,.185],color:'#a8743c'},{geo:B,pos:[0,.52,0],scale:[.3,.012,.02],color:'#7c4f26'},{geo:B,pos:[0,.52,.07],scale:[.3,.012,.02],color:'#7c4f26'},{geo:Cy,pos:[.06,.525,.05],scale:[.03,.02,.03],color:'#2b2f3a'}); MODELS.barrel=mergeParts(P); }
    /* coffre : planches, ferrures, clous, serrure dorée, pièces qui débordent */
    { const P=[{geo:B,pos:[0,.14,0],scale:[.44,.28,.3],color:'#7c4a21'},{geo:Cy,pos:[0,.29,0],scale:[.15,.44,.15],rot:[0,0,Math.PI/2],color:'#8a5326'}];
      for(const x of [-.14,.14]) P.push({geo:B,pos:[x,.2,0],scale:[.035,.3,.32],color:'#3b3f4a'}); for(const z of [-1,1]) P.push({geo:B,pos:[0,.07,z*.152],scale:[.46,.03,.01],color:'#5b3a1a'},{geo:B,pos:[0,.17,z*.152],scale:[.46,.03,.01],color:'#5b3a1a'});
      for(const [x,y] of [[-.14,.05],[.14,.05],[-.14,.28],[.14,.28],[-.2,.15],[.2,.15]]) P.push({geo:S0,pos:[x,y,.16],scale:[.02,.02,.02],color:'#d1d5db'});
      P.push({geo:B,pos:[.0,.24,.16],scale:[.07,.1,.02],color:'#fbbf24'},{geo:B,pos:[.0,.23,.172],scale:[.02,.04,.01],color:'#3a2500'});
      for(let k=0;k<4;k++) P.push({geo:Cy,pos:[-.1+k*.07,.3+(k%2)*.012,-.05+(k%3)*.05],scale:[.03,.008,.03],rot:[.2,0,.3*k],color:'#fbbf24'}); MODELS.chest=mergeParts(P); }
    /* cristaux : amas de 7 cristaux sur un socle rocheux */
    MODELS.crystal=mergeParts([{geo:O,pos:[0,.45,0],scale:[.15,.46,.15],rot:[0,.3,.05],color:'#6ff0ff'},{geo:O,pos:[.22,.28,.08],scale:[.1,.3,.1],rot:[.1,.8,-.25],color:'#39c9e0'},{geo:O,pos:[-.19,.24,-.1],scale:[.09,.24,.09],rot:[-.1,.2,.3],color:'#8ff6ff'},
      {geo:O,pos:[.06,.2,-.22],scale:[.08,.22,.08],rot:[-.4,.5,0],color:'#5ee0f2'},{geo:O,pos:[-.2,.15,.18],scale:[.07,.18,.07],rot:[.35,.1,.2],color:'#9ff9ff'},{geo:O,pos:[.3,.12,-.16],scale:[.06,.14,.06],rot:[0,.6,-.4],color:'#4fd0e4'},{geo:O,pos:[-.02,.62,.0],scale:[.06,.16,.06],rot:[0,.2,.12],color:'#d6fbff'},
      {geo:GEO.sphere0,pos:[0,.05,0],scale:[.34,.1,.3],color:'#6a6f7a'}]);
    /* nouveaux décors */
    MODELS.bush=mergeParts([{geo:S,pos:[0,.2,0],scale:[.3,.2,.28],color:'#3f8f3a'},{geo:S,pos:[.2,.16,.1],scale:[.2,.15,.2],color:'#4da545'},{geo:S,pos:[-.19,.15,-.08],scale:[.2,.14,.18],color:'#377f33'},{geo:S,pos:[.04,.3,-.1],scale:[.16,.12,.16],color:'#58b84d'},
      {geo:S0,pos:[.12,.34,.12],scale:[.045,.045,.045],color:'#fb7185'},{geo:S0,pos:[-.14,.3,.12],scale:[.04,.04,.04],color:'#fde047'},{geo:S0,pos:[.0,.4,.0],scale:[.045,.045,.045],color:'#f472b6'},{geo:S0,pos:[-.04,.22,.26],scale:[.04,.04,.04],color:'#fb7185'}]);
    MODELS.crate=mergeParts([{geo:B,pos:[0,.17,0],scale:[.34,.34,.34],color:'#a8743c'},...[-1,1].flatMap(s=>[{geo:B,pos:[s*.16,.17,0],scale:[.05,.36,.36],color:'#6b4423'},{geo:B,pos:[0,.17,s*.16],scale:[.36,.36,.05],color:'#6b4423'}]),{geo:B,pos:[0,.345,0],scale:[.36,.03,.36],color:'#8a5a2b'},{geo:B,pos:[.0,.17,.176],scale:[.36,.05,.01],color:'#7c4a21'},{geo:B,pos:[.2,.12,.0],scale:[.18,.18,.18],rot:[0,.5,0],color:'#c08a4c'},{geo:B,pos:[.2,.12,.0],scale:[.19,.04,.19],rot:[0,.5,0],color:'#6b4423'}]);
    MODELS.anchor=mergeParts([{geo:Cy,pos:[0,.3,0],scale:[.03,.6,.03],color:'#4b5563'},{geo:B,pos:[0,.5,0],scale:[.22,.035,.035],color:'#4b5563'},{geo:To,pos:[0,.63,0],scale:[.07,.07,.07],color:'#4b5563'},{geo:To,pos:[0,.06,0],scale:[.2,.2,.2],rot:[0,0,Math.PI],color:'#374151'},{geo:Co,pos:[.19,.1,0],scale:[.05,.1,.04],rot:[0,0,-.9],color:'#374151'},{geo:Co,pos:[-.19,.1,0],scale:[.05,.1,.04],rot:[0,0,.9],color:'#374151'}]);
    MODELS.rope=mergeParts([{geo:To,pos:[0,.03,0],scale:[.18,.18,.05],rot:[Math.PI/2,0,0],color:'#c9a96a'},{geo:To,pos:[0,.07,0],scale:[.16,.16,.05],rot:[Math.PI/2,0,0],color:'#bf9d5e'},{geo:To,pos:[0,.11,0],scale:[.14,.14,.05],rot:[Math.PI/2,0,0],color:'#c9a96a'},{geo:Cy,pos:[.2,.025,.08],scale:[.02,.18,.02],rot:[0,0,Math.PI/2],color:'#bf9d5e'}]);
    MODELS.balls=mergeParts([...[[-.1,.07,-.05],[.1,.07,-.05],[0,.07,.1],[0,.19,0]].map(p=>({geo:S,pos:p,scale:[.075,.075,.075],color:'#2b2f3a'})),{geo:B,pos:[0,.01,0],scale:[.36,.02,.34],color:'#6b4423'},{geo:S0,pos:[.0,.265,.0],scale:[.02,.02,.02],color:'#9ca3af'}]);
    MODELS.log=mergeParts([{geo:Cy,pos:[0,.08,0],scale:[.08,.7,.08],rot:[0,0,Math.PI/2],color:'#8f6a3e'},{geo:Cy,pos:[0,.08,0],scale:[.081,.1,.081],rot:[0,0,Math.PI/2],color:'#6e4f2b'},{geo:Cy,pos:[.22,.14,.0],scale:[.03,.2,.03],rot:[.5,0,.4],color:'#8f6a3e'},{geo:S0,pos:[-.35,.08,0],scale:[.07,.07,.07],color:'#d9bd8a'},{geo:S0,pos:[.1,.16,.05],scale:[.03,.03,.03],color:'#5c4022'}]);
    MODELS.star=mergeParts([...[0,1,2,3,4].map(k=>({geo:Co,pos:[Math.cos(k*1.2566)*.06,.015,Math.sin(k*1.2566)*.06],scale:[.03,.12,.03],rot:[Math.PI/2*Math.sin(k*1.2566),0,-Math.PI/2*Math.cos(k*1.2566)],color:'#f08a4b'})),{geo:S0,pos:[0,.02,0],scale:[.045,.025,.045],color:'#f6a46e'}]);
  };
}
/* ---------- placement des nouveaux décors et perroquets perchés ---------- */
{ const _g=genProps3d;
  genProps3d=function(){ _g();
    const rn=prng3(4242), groups={bush:[],crate:[],anchor:[],rope:[],balls:[],log:[],star:[]}, free=(x,y)=>{ if(!inb(x,y)||floorT[idx(x,y)]!==1||wallT[idx(x,y)]||spawnerAt(x,y)) return false; for(const t of TD){ if(Math.abs(x-t.spawnTile[0])<=1&&Math.abs(y-t.spawnTile[1])<=1) return false; if(Math.abs(x-t.padTile[0])<=1&&Math.abs(y-t.padTile[1])<=1) return false; if(Math.abs(x-t.bx)<=1&&Math.abs(y-t.by)<=1) return false; } return true; };
    const put=(k,x,y,s,ry)=>{ groups[k].push({x:x+.5,z:y+.5,ry:ry===undefined?rn()*6.28:ry,s:s||1,rz:0,rx:0}); };
    for(const t of TD){ const kinds=['bush','bush','crate','anchor','rope','balls','log','star','bush','star'];
      for(let k=0;k<10;k++){ for(let tries=0;tries<12;tries++){ const dx=Math.floor(rn()*11)-5, dy=Math.floor(rn()*11)-5, sm=Math.abs(dx)+Math.abs(dy); if(sm<4||sm>8) continue; const x=t.bx+dx, y=t.by+dy; if(!free(x,y)) continue; const kd=kinds[k]; put(kd,x,y,.9+rn()*.3); if(kd==='bush'&&rn()<.5&&free(x+1,y)) put('bush',x+1,y,.7); break; } } }
    for(const sp of spawners) if(sp.kind==='dia'){ if(free(sp.x+1,sp.y)) put('bush',sp.x+1,sp.y,1); if(free(sp.x-1,sp.y+1)) put('star',sp.x-1,sp.y+1,1.1); if(free(sp.x,sp.y-1)) put('log',sp.x,sp.y-1,.9); }
    const mats={bush:VCMAT(),crate:VCMAT(),anchor:VCMAT(),rope:VCMAT(),balls:VCMAT(),log:VCMAT(),star:VCMAT()};
    for(const k in groups) if(groups[k].length&&MODELS[k]) propInst.push(instOf(MODELS[k],mats[k],groups[k],true));
    for(const p of PARROTS) scene.remove(p.m); PARROTS.length=0; // perroquets perchés sur des caisses et des ancres
    for(const [k,h] of [['crate',.36],['anchor',.68],['crate',.36]]){ const l=groups[k]; const q=l&&l[Math.floor(rn()*l.length)]; if(!q) continue; const m=mkParrot(); m.position.set(q.x,h*q.s,q.z); m.scale.setScalar(1.3); m.rotation.y=rn()*6.28; scene.add(m); PARROTS.push({m,ph:rn()*6.28,y:h*q.s,ry:m.rotation.y}); }
  };
}
/* ---------- animaux ---------- */
createShark=function(){
  const g=new THREE.Group(), mat=new THREE.MeshStandardMaterial({vertexColors:true,flatShading:true,roughness:.55}), S=GEO.sphere, Co=GEO.cone, B=GEO.box, dk='#587691', md='#6b8aa6', lt='#eef3f8';
  const P=[{geo:S,pos:[0,0,0],scale:[1.0,.31,.35],color:md},{geo:S,pos:[.15,-.14,0],scale:[.82,.17,.3],color:lt},{geo:S,pos:[.62,.04,0],scale:[.4,.26,.3],color:md},{geo:Co,pos:[1.02,-.02,0],scale:[.18,.3,.2],rot:[0,0,-Math.PI/2],color:md},
    {geo:Co,pos:[0,.4,0],scale:[.13,.5,.3],rot:[0,0,-.25],color:dk},{geo:Co,pos:[-.55,.22,0],scale:[.05,.2,.12],rot:[0,0,-.3],color:dk},
    {geo:Co,pos:[.3,-.05,.4],scale:[.11,.36,.2],rot:[1.2,0,-.6],color:dk},{geo:Co,pos:[.3,-.05,-.4],scale:[.11,.36,.2],rot:[-1.2,0,-.6],color:dk}];
  for(const z of [-1,1]){ P.push({geo:S,pos:[.88,.09,z*.15],scale:[.06,.06,.05],color:'#f8fafc'},{geo:S,pos:[.915,.09,z*.17],scale:[.03,.03,.03],color:'#0b0f14'});
    for(let k=0;k<3;k++) P.push({geo:B,pos:[.45-k*.05,.0,z*.33],scale:[.012,.15,.02],rot:[0,0,.3],color:'#4a6680'});
    for(let k=0;k<5;k++) P.push({geo:Co,pos:[.96-k*.012,-.1,z*(.05+k*.04)],scale:[.015,.045,.012],rot:[Math.PI,0,0],color:'#ffffff'}); }
  P.push({geo:S,pos:[.55,.2,0],scale:[.45,.07,.2],color:'#7897b3'});
  const body=new THREE.Mesh(mergeParts(P),mat); body.castShadow=true; g.add(body);
  const tail=new THREE.Group(); tail.position.set(-.95,0,0); g.add(tail); tail.add(new THREE.Mesh(mergeParts([{geo:S,pos:[-.15,0,0],scale:[.3,.16,.2],color:md},{geo:Co,pos:[-.28,.26,0],scale:[.08,.46,.3],rot:[0,0,.5],color:dk},{geo:Co,pos:[-.25,-.16,0],scale:[.06,.3,.22],rot:[0,0,-.4],color:dk}]),mat));
  g.userData={tail}; g.scale.setScalar(1.15); return g;
};
createCrab=function(c){
  const g=new THREE.Group(), u={legs:[],claws:[]}, mat=new THREE.MeshStandardMaterial({vertexColors:true,flatShading:true,roughness:.65}); u.mat=mat; const S=GEO.sphere, S0=GEO.sphere0, B=GEO.box, Co=GEO.cone, red='#e5483a', dr='#b83428', lr='#f0705e';
  const P=[{geo:S,pos:[0,.2,0],scale:[.32,.16,.26],color:red},{geo:S,pos:[0,.27,0],scale:[.24,.09,.19],color:lr},{geo:B,pos:[0,.16,.0],scale:[.36,.03,.1],color:dr}];
  for(let k=0;k<5;k++) P.push({geo:Co,pos:[-.1+k*.05,.31,-.03+(k%2)*.06],scale:[.02,.05,.02],color:dr});
  for(const z of [-1,1]){ P.push({geo:B,pos:[.22,.26,z*.1],scale:[.015,.1,.015],color:red},{geo:S0,pos:[.23,.33,z*.1],scale:[.045,.045,.045],color:'#ffffff'},{geo:S0,pos:[.255,.335,z*.1],scale:[.022,.022,.022],color:'#111111'}); }
  const body=new THREE.Mesh(mergeParts(P),mat); body.castShadow=true; g.add(body);
  for(const z of [-1,1]){ const cl=new THREE.Group(); cl.position.set(.24,.22,z*.28); g.add(cl); u.claws.push(cl);
    cl.add(new THREE.Mesh(mergeParts([{geo:B,pos:[.05,0,-z*.04],scale:[.14,.05,.05],rot:[0,z*.4,0],color:red},{geo:S,pos:[.16,.0,-z*.08],scale:[.1,.07,.08],color:lr},{geo:Co,pos:[.26,.02,-z*.05],scale:[.035,.12,.03],rot:[0,0,-Math.PI/2+.3],color:dr},{geo:Co,pos:[.26,-.02,-z*.12],scale:[.03,.1,.03],rot:[0,0,-Math.PI/2-.3],color:dr}]),mat)); }
  for(const z of [-1,1]) for(const x of [-.14,-.03,.08,.17]){ const l=new THREE.Group(); l.position.set(x,.15,z*.24); g.add(l); const seg=new THREE.Mesh(mergeParts([{geo:B,pos:[0,0,z*.07],scale:[.025,.025,.15],rot:[z*.5,0,0],color:red},{geo:B,pos:[0,-.06,z*.17],scale:[.02,.13,.02],rot:[0,0,0],color:dr}]),mat); l.add(seg); u.legs.push(l); }
  g.userData=u; return g;
};
updateCrabM=function(c,m){ const u=m.userData; m.position.set(c.x*U,Math.abs(Math.sin(c.ph))*.06,c.y*U); m.rotation.y=-Math.atan2(c.vy,c.vx); u.legs.forEach((l,i)=>l.rotation.x=Math.sin(c.ph*2+i)*.35); u.claws.forEach((cl,i)=>cl.rotation.y=Math.sin(c.ph*1.5+i*3)*.35); const bl=c.t<2&&Math.floor(game.t*10)%2; u.mat.emissive.setRGB(bl?.9:0,bl?.3:0,0); };
{ const _w=mkWhale; mkWhale=function(){ const g=_w(); const sm=stdM, add=(geo,mat,x,y,z,sx,sy,sz,rx,ry,rz)=>{ const m=new THREE.Mesh(geo,mat); m.position.set(x,y,z); m.scale.set(sx,sy,sz); if(rx||ry||rz) m.rotation.set(rx||0,ry||0,rz||0); g.add(m); return m; };
    for(const s of [-1,1]){ add(GEO.sphere0,sm(0x47677f),1.0,-.45,s*.95,.55,.1,.22,0,s*.3,s*.5); for(let k=0;k<6;k++) add(GEO.box,sm(0xcfdde8),1.0+k*.16,-.52,s*.7,.02,.04,.2,0,0,0); }
    for(let k=0;k<5;k++) add(GEO.sphere0,sm(0xe7efe6),.2+k*.35,.8-k*.02,(k%2?.3:-.3),.06,.04,.06); add(GEO.sphere0,sm(0x36546b),1.55,.85,0,.1,.04,.16); return g; }; }
{ const _d=mkDolphin; mkDolphin=function(){ const g=_d(); const add=(geo,c,x,y,z,sx,sy,sz,rx,ry,rz)=>{ const m=new THREE.Mesh(geo,stdM(c)); m.position.set(x,y,z); m.scale.set(sx,sy,sz); m.rotation.set(rx||0,ry||0,rz||0); g.add(m); return m; };
    add(GEO.sphere,0x7aa2c0,.55,.05,0,.36,.26,.27); for(const s of [-1,1]){ add(GEO.cone,0x5f89a8,.25,-.12,s*.27,.05,.25,.1,s*1.1,0,-.4); const e=new THREE.Mesh(GEO.sphere0,new THREE.MeshBasicMaterial({color:0x0b0f14})); e.scale.setScalar(.035); e.position.set(.62,.08,s*.2); g.add(e); } add(GEO.box,0x3a5a73,.98,-.04,0,.1,.012,.03); return g; }; }
/* ---------- tortues de mer + perroquets ---------- */
function mkTurtle(){ const g=new THREE.Group(), sh=stdM(0x6a8f3a), sk=stdM(0x8ea85a), dk=stdM(0x4d6b2a);
  const shell=new THREE.Mesh(GEO.sphere,sh); shell.scale.set(.5,.2,.4); g.add(shell); for(let i=0;i<5;i++){ const p=new THREE.Mesh(GEO.sphere0,dk); p.scale.set(.1,.04,.1); p.position.set(-.18+i%3*.17,.17,(i<3?-.1:.12)); g.add(p); }
  const belly=new THREE.Mesh(GEO.sphere,stdM(0xe6dca8)); belly.scale.set(.46,.1,.36); belly.position.y=-.1; g.add(belly);
  const head=new THREE.Mesh(GEO.sphere,sk); head.scale.set(.14,.1,.11); head.position.set(.55,.03,0); g.add(head); for(const z of [-1,1]){ const e=new THREE.Mesh(GEO.sphere0,new THREE.MeshBasicMaterial({color:0x111111})); e.scale.setScalar(.025); e.position.set(.63,.07,z*.07); g.add(e); }
  const fl=[]; for(const [x,z] of [[.3,.38],[.3,-.38],[-.3,.3],[-.3,-.3]]){ const f=new THREE.Group(); f.position.set(x,-.02,z); const m=new THREE.Mesh(GEO.sphere0,sk); m.scale.set(.22,.03,.1); m.position.set(0,0,z>0?.16:-.16); f.add(m); g.add(f); fl.push(f); }
  g.userData={fl}; return g; }
{ const _sb=seaBuild, _sf=seaFrame;
  seaBuild=function(){ _sb(); if(!SEAL.g) return; SEAL.turtles=[]; for(let i=0;i<3;i++){ const p=waterSpot(), m=mkTurtle(); m.scale.setScalar(1.1); SEAL.g.add(m); SEAL.turtles.push({m,x:p[0],y:p[1],a:rnd(0,6.28),turn:Math.random()<.5?1:-1,seed:Math.random()*10}); } };
  seaFrame=function(dt){ _sf(dt); if(!SEAL.turtles||!SEAL.g) return; const t=SEAL.t, cx=cam3.x, cy=cam3.y; for(const q of SEAL.turtles){ swim(q,dt,16,3*T); const m=q.m; m.position.set(q.x*U,-1.0+Math.sin(t*1.2+q.seed)*.04,q.y*U); m.rotation.y=-q.a; m.userData.fl.forEach((f,i)=>f.rotation.x=Math.sin(t*2.2+i*1.6)*.55*(i%2?1:-1)); m.visible=Math.hypot(q.x-cx,q.y-cy)<34*T; } }; }
function mkParrot(){ const g=new THREE.Group(), S=GEO.sphere0, add=(geo,c,x,y,z,sx,sy,sz,rx,ry,rz)=>{ const m=new THREE.Mesh(geo,stdM(c)); m.position.set(x,y,z); m.scale.set(sx,sy,sz); if(rx||ry||rz) m.rotation.set(rx||0,ry||0,rz||0); m.castShadow=true; g.add(m); return m; };
  add(S,0xdc2626,0,.12,0,.08,.11,.07); add(S,0xdc2626,.05,.23,0,.06,.06,.06); add(GEO.cone,0xfbbf24,.11,.22,0,.025,.05,.025,0,0,-Math.PI/2); add(S,0xffffff,.075,.25,.04,.018,.018,.018); add(S,0x111111,.082,.25,.045,.01,.01,.01);
  add(GEO.box,0x2563eb,-.02,.14,.07,.09,.05,.02,0,0,.2); add(GEO.box,0x2563eb,-.02,.14,-.07,.09,.05,.02,0,0,.2); add(GEO.box,0x16a34a,-.14,.05,0,.22,.025,.04,0,0,.5); add(GEO.box,0xfbbf24,-.12,.04,0,.16,.02,.03,0,0,.45); return g; }
const PARROTS=[];
{ const _r=render3d; render3d=function(dt){ _r(dt); const t=game.t; for(const p of PARROTS){ p.m.rotation.z=Math.sin(t*1.6+p.ph)*.05; p.m.position.y=p.y+Math.max(0,Math.sin(t*4+p.ph*3))*.012; p.m.rotation.y=p.ry+Math.sin(t*.7+p.ph)*.35; } }; }
/* ---------- objets tenus plus détaillés ---------- */
{ const _mh=makeHeld;
  makeHeld=function(id,e){
    const mk=()=>{ const g=new THREE.Group(); g.add_=(geo,mat,px,py,pz,sx,sy,sz,rx,ry,rz)=>{ const m=new THREE.Mesh(geo,mat); m.position.set(px,py,pz); m.scale.set(sx,sy,sz); if(rx||ry||rz) m.rotation.set(rx||0,ry||0,rz||0); m.castShadow=true; g.add(m); return m; }; return g; };
    const wd=M('#7c4a21'), wd2=M('#5b3a1a'), gold=M('#fbbf24',{metalness:.6,roughness:.35}), steel=M('#cfd6e0',{metalness:.55,roughness:.3}), iron=M('#4b5563',{metalness:.6,roughness:.4}), dk=M('#1f2937'), brass=M('#c9a24a',{metalness:.7,roughness:.3});
    switch(id){
      case 'sword':{ const g=mk(), t=(typeof SWORDS!=='undefined'&&SWORDS[e.sword])?SWORDS[e.sword].c:'#cfd6e0', bl=M(t,{metalness:.55,roughness:.28});
        g.add_(GEO.cyl,wd,.1,0,0,.04,.16,.04,0,0,Math.PI/2); for(const x of [.05,.1,.15]) g.add_(GEO.torus,wd2,x,0,0,.045,.045,.02,0,Math.PI/2,0); g.add_(GEO.sphere0,gold,-.02,0,0,.05,.05,.05);
        g.add_(GEO.box,gold,.19,0,0,.04,.05,.26); g.add_(GEO.sphere0,gold,.19,0,.13,.04,.04,.04); g.add_(GEO.sphere0,gold,.19,0,-.13,.04,.04,.04);
        g.add_(GEO.box,bl,.5,0,0,.6,.035,.11); g.add_(GEO.box,M('#8b95a3',{metalness:.5,roughness:.4}),.5,.02,0,.58,.012,.03); g.add_(GEO.cone,bl,.84,0,0,.055,.14,.055,0,0,-Math.PI/2); if(e.sword>=2) g.add_(GEO.octa,new THREE.MeshBasicMaterial({color:0x7dd3fc}),.2,0,0,.03,.03,.03); return g; }
      case 'pick':{ const g=mk(), tc=['#9a7b5b','#9ca3af','#e5e7eb','#67e8f9'][e.pick|0]||'#9ca3af', hd=M(tc,{metalness:.5,roughness:.35});
        g.add_(GEO.cyl,wd,.32,0,0,.035,.66,.035,0,0,Math.PI/2); for(const x of [.1,.16,.22]) g.add_(GEO.torus,M('#7c5a30'),x,0,0,.04,.04,.018,0,Math.PI/2,0);
        g.add_(GEO.box,iron,.6,0,0,.07,.09,.1); g.add_(GEO.box,hd,.6,0,.14,.07,.07,.2); g.add_(GEO.box,hd,.6,0,-.14,.07,.07,.2); g.add_(GEO.cone,hd,.6,0,.3,.04,.12,.04,Math.PI/2,0,0); g.add_(GEO.cone,hd,.6,0,-.3,.04,.12,.04,-Math.PI/2,0,0); g.add_(GEO.box,hd,.66,0,0,.05,.05,.03); return g; }
      case 'gun':{ const g=mk(); g.add_(GEO.box,wd,.1,-.06,0,.2,.14,.07,0,0,-.25); g.add_(GEO.sphere0,brass,.0,-.13,0,.05,.05,.05); g.add_(GEO.box,iron,.4,.04,0,.5,.05,.05); g.add_(GEO.cyl,brass,.66,.04,0,.035,.04,.035,0,0,Math.PI/2); g.add_(GEO.cyl,brass,.3,.04,0,.04,.03,.04,0,0,Math.PI/2); g.add_(GEO.box,iron,.17,.1,0,.05,.07,.025,0,0,.4); g.add_(GEO.torus,brass,.12,-.04,0,.05,.05,.02,0,Math.PI/2,0); g.add_(GEO.box,brass,.16,0,0,.1,.04,.075); return g; }
      case 'smg':{ const g=mk(); for(const z of [-.09,.09]){ g.add_(GEO.box,wd,.1,-.06,z,.16,.13,.06,0,0,-.25); g.add_(GEO.box,iron,.34,.03,z,.42,.045,.045); g.add_(GEO.cyl,brass,.55,.03,z,.03,.035,.03,0,0,Math.PI/2); g.add_(GEO.box,iron,.14,.08,z,.04,.06,.02,0,0,.4); } return g; }
      case 'shotgun':{ const g=mk(); g.add_(GEO.box,wd,.08,-.05,0,.26,.14,.08,0,0,-.15); g.add_(GEO.cyl,iron,.42,.03,0,.055,.5,.055,0,0,Math.PI/2); g.add_(GEO.cone,iron,.78,.03,0,.13,.2,.13,0,0,-Math.PI/2); g.add_(GEO.cyl,brass,.25,.03,0,.065,.04,.065,0,0,Math.PI/2); g.add_(GEO.cyl,brass,.52,.03,0,.065,.03,.065,0,0,Math.PI/2); g.add_(GEO.box,iron,.14,.09,0,.05,.07,.025,0,0,.4); return g; }
      case 'sniper':{ const g=mk(); g.add_(GEO.box,wd,.06,-.05,0,.34,.14,.08,0,0,-.12); g.add_(GEO.cyl,iron,.58,.03,0,.04,.9,.04,0,0,Math.PI/2); g.add_(GEO.cyl,brass,.3,.03,0,.05,.03,.05,0,0,Math.PI/2); g.add_(GEO.cyl,brass,.9,.03,0,.05,.02,.05,0,0,Math.PI/2);
        g.add_(GEO.cyl,brass,.4,.1,0,.045,.24,.045,0,0,Math.PI/2); g.add_(GEO.cyl,M('#93c5fd',{metalness:.2,roughness:.1}),.53,.1,0,.04,.02,.04,0,0,Math.PI/2); g.add_(GEO.box,iron,.4,.075,0,.03,.04,.03); g.add_(GEO.box,iron,.12,.1,0,.05,.07,.025,0,0,.4); return g; }
      case 'bomb':{ const g=mk(); g.add_(GEO.sphere,M('#1f2937',{metalness:.4,roughness:.5}),.3,0,0,.17,.17,.17); g.add_(GEO.cyl,iron,.3,.17,0,.07,.05,.07); g.add_(GEO.torus,iron,.3,0,0,.18,.18,.025,0,0,0); g.add_(GEO.cyl,M('#c9a96a'),.3,.25,0,.012,.12,.012,0,0,.3); const sp=g.add_(GEO.octa,new THREE.MeshBasicMaterial({color:0xfbbf24}),.34,.33,0,.045,.045,.045); g.userData.spark=sp; return g; }
      case 'bow':{ const g=mk(); g.add_(GEO.box,wd,.18,-.02,0,.5,.07,.08); g.add_(GEO.box,wd2,.02,-.06,0,.14,.1,.06,0,0,-.2); g.add_(GEO.box,iron,.45,.02,0,.04,.04,.7); g.add_(GEO.box,wd,.45,.0,.34,.04,.05,.1,0,.2,0); g.add_(GEO.box,wd,.45,.0,-.34,.04,.05,.1,0,-.2,0); g.add_(GEO.box,M('#e5e7eb'),.28,.025,0,.34,.008,.01); g.add_(GEO.box,M('#d6dde6'),.62,.035,0,.012,.02,.62); g.add_(GEO.cone,steel,.62,.04,0,.02,.07,.02,0,0,-Math.PI/2); return g; }
      case 'hammer':{ const g=mk(); g.add_(GEO.cyl,wd,.3,0,0,.04,.7,.04,0,0,Math.PI/2); g.add_(GEO.box,iron,.7,0,0,.22,.26,.34); g.add_(GEO.box,M('#9ca3af',{metalness:.5}),.7,0,0,.23,.05,.35); g.add_(GEO.box,dk,.7,.13,0,.05,.02,.1); return g; }
    }
    return _mh(id,e); };
}
