'use strict';
/* ===== KayKit / Kenney : décors regroupés en instances (une seule passe de rendu par type), animaux, icônes 3D, optimisations ===== */
KK.bcache={};
KK.batch=function(grp,src,height,items,shadow){
  if(!src||!items.length) return null; const key=src.uuid+'|'+height; let geo=KK.bcache[key]; if(!geo) geo=KK.bcache[key]=KK.normGeo(src,height);
  const m=new THREE.InstancedMesh(geo,geo.userData.kk,items.length), q=new THREE.Quaternion(), e=new THREE.Euler(), s=new THREE.Vector3(), p=new THREE.Vector3(), mx=new THREE.Matrix4();
  items.forEach((it,i)=>{ e.set(it.rx||0,it.ry||0,it.rz||0); q.setFromEuler(e); s.setScalar(it.s||1); p.set(it.x,it.y||0,it.z); mx.compose(p,q,s); m.setMatrixAt(i,mx); });
  m.castShadow=shadow!==false; m.receiveShadow=true; m.frustumCulled=false; m.instanceMatrix.needsUpdate=true; grp.add(m); return m;
};
KK.freeTiles=function(minBase){ const out=[]; for(let y=0;y<H;y++)for(let x=0;x<W;x++){ if(floorT[idx(x,y)]!==1||wallT[idx(x,y)]||spawnerAt(x,y)) continue; let ok=true; for(const t of TD) if(Math.hypot(x-t.bx,y-t.by)<minBase){ ok=false; break; } if(ok) out.push([x,y]); } return out; };
const kkEdge=(x,y)=>{ for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]) if(inb(x+dx,y+dy)&&floorT[idx(x+dx,y+dy)]!==1) return true; return false; };
const kkNearBase=(x,y,d)=>{ for(const t of TD) if(Math.hypot(x-t.bx,y-t.by)<d) return true; return false; };
/* --- décors forêt / halloween par carte --- */
function kkDecor(){
  if(KK.decG&&scene) scene.remove(KK.decG); KK.decG=null; if(!scene||typeof TD==='undefined'||!TD.length||game.state==='menu') return; const id=game.opts.map; const seed=prng3(31+id.length*17), R=()=>seed();
  const plan={
    tempest:[['skull',.35,.012,6],['ribcage',.55,.01,6],['bone_A',.3,.015,6],['coffin',.9,.004,7],['tree_dead_medium',2.6,.012,6],['lantern_standing',1.1,.006,5],['Rock_1_A_Color1',.8,.02,5]],
    citadel:[['gravestone',.9,.012,6],['grave_A',.9,.006,6],['lantern_standing',1.1,.008,5],['pillar',2.2,.006,6],['skull',.35,.006,6],['Rock_2_A_Color1',.8,.012,5]],
    jungle:[['Tree_1_A_Color1',3.2,.03,7],['Tree_2_A_Color1',3.6,.025,7],['Tree_3_A_Color1',3,.02,7],['Tree_4_A_Color1',3.2,.015,7],['Bush_1_A_Color1',.9,.05,4],['Bush_4_A_Color1',.8,.04,4],['Rock_1_F_Color1',.8,.012,5],['Grass_1_A_Color1',.7,.06,3]],
    atoll:[['Bush_2_A_Color1',.8,.03,4],['Rock_3_A_Color1',.7,.015,5]],scatter:[['Bush_2_A_Color1',.8,.03,4],['Rock_3_A_Color1',.7,.015,5]],
    glacier:[['tree_dead_medium',2.4,.008,6],['Rock_2_A_Color1',.8,.02,5]],floes:[['Rock_2_A_Color1',.8,.02,5]], _:[['Bush_1_A_Color1',.8,.02,4],['Rock_1_A_Color1',.7,.012,5]] }, P=plan[id]||plan._;
  KK.need(P.map(p=>p[0]),()=>{
    if(game.state==='menu'||KK.decG) return; const g=new THREE.Group(); KK.decG=g; const L={}; 
    for(const [x,y] of KK.freeTiles(3)){ const r=R(); let acc=0; for(const [n,hh,pr,rad] of P){ acc+=pr; if(r<acc){ if(kkNearBase(x,y,rad)||!KK.props[n]) break; (L[n]=L[n]||{h:hh,a:[]}).a.push({x:x+.5+(R()-.5)*.4,z:y+.5+(R()-.5)*.4,ry:R()*6.28,s:.9+R()*.3}); break; } } }
    for(const n in L) KK.batch(g,KK.props[n],L[n].h,L[n].a); scene.add(g); });
}
/* --- bases : coffre KayKit animé + accessoires regroupés --- */
function kkDungeon(){
  if(!scene||typeof TD==='undefined'||!TD.length||game.state==='menu') return;
  KK.dnd(['chest_gold','chest_gold_lid','barrel_small','crates_stacked','torch_lit','coin_stack_medium','coin_stack_small'],()=>{
    if(!KK.dg.chest_gold) return;
    TD.forEach((td,i)=>{ const g=coreM[i]; if(!g||g.userData.kkChest||td.absent) return; const u=g.userData;
      g.traverse(o=>{ if(o.isMesh&&o!==u.glow&&o!==u.flag) o.visible=false; });
      const sb=KK.dg.chest_gold, sl=KK.dg.chest_gold_lid; if(!sb||!sl) return; const k=.5/KK.dgh.chest_gold.h, grp=new THREE.Group(); grp.scale.setScalar(k); g.add(grp);
      grp.add(sb.clone(true)); const pv=new THREE.Group(); pv.position.set(0,.5,-.62); grp.add(pv); const lo=sl.clone(true); lo.position.set(0,-.5,.62); pv.add(lo); u.lid=pv; u.kkChest=true; });
    if(KK.dec2) scene.remove(KK.dec2); const G=KK.dec2=new THREE.Group(); scene.add(G); const L={}, y0=WHu*.6+.02;
    const put=(n,h,x,y,ry)=>{ (L[n]=L[n]||{h,a:[]}).a.push({x:x+.5,y:y0,z:y+.5,ry:ry||0}); };
    TD.forEach((td,i)=>{ if(td.absent) return; const d=td.dir, p=[-d[1],d[0]], bx=td.bx, by=td.by;
      put('torch_lit',.9,bx+p[0]*2+d[0]*2,by+p[1]*2+d[1]*2,0); put('torch_lit',.9,bx-p[0]*2+d[0]*2,by-p[1]*2+d[1]*2,0);
      put('barrel_small',.7,bx-d[0]*3+p[0]*1,by-d[1]*3+p[1]*1,i); put('crates_stacked',1.0,bx-d[0]*3-p[0]*1.5,by-d[1]*3-p[1]*1.5,i*.7);
      put('coin_stack_medium',.4,bx+d[0]*1.2+p[0]*1.1,by+d[1]*1.2+p[1]*1.1,0); put('coin_stack_small',.28,bx+d[0]*1.0-p[0]*1.2,by+d[1]*1.0-p[1]*1.2,0); });
    for(const n in L) KK.batch(G,KK.dg[n],L[n].h,L[n].a); });
}
/* --- décors pirates Kenney (palmiers, rochers, barques, tonneaux, canons, docks, épave) --- */
function kkPirateDecor(){
  if(!scene||typeof TD==='undefined'||!TD.length||game.state==='menu') return; if(KK.dec3&&scene) scene.remove(KK.dec3); KK.dec3=null; const id=game.opts.map, seed=prng3(77+id.length*13), R=()=>seed();
  const names=['palm-detailed-bend','palm-bend','palm-detailed-straight','palm-straight','rocks-sand-a','rocks-sand-b','rocks-sand-c','cannon','barrel','crate','crate-bottles','boat-row-small','boat-row-large','ship-wreck','structure-platform-dock-small','tower-watch','bottle','patch-sand-foliage'];
  KK.knd('pirate',names,()=>{
    if(game.state==='menu'||KK.dec3) return; const G=KK.dec3=new THREE.Group(); scene.add(G); const L={}, S=n=>{ const o=KK.kn['pirate/'+n]; return o&&o.scene; };
    const add=(n,h,x,y,ry,yy,byLen)=>{ (L[n]=L[n]||{h,a:[],len:byLen}).a.push({x:x+.5,y:yy||0,z:y+.5,ry:ry||0}); };
    const ice=id==='glacier'||id==='floes', tropical=!ice&&id!=='jungle'&&id!=='tempest';
    if(!ice) for(const [x,y] of KK.freeTiles(2.5)){ const e=kkEdge(x,y), r=R();
      if(e&&r<.07) add('rocks-sand-'+'abc'[(R()*3)|0],.6+R()*.3,x+(R()-.5)*.3,y+(R()-.5)*.3,R()*6.28);
      else if(tropical&&!e&&!kkNearBase(x,y,5)&&r>.93&&r<.96) add(['palm-detailed-bend','palm-bend','palm-detailed-straight','palm-straight'][(R()*4)|0],2.2+R()*.9,x,y,R()*6.28);
      else if(e&&id==='atoll'&&r>.95&&r<.96) add('boat-row-small',.5,x,y,R()*6.28,-.05);
      else if(e&&id==='atoll'&&r>.96&&r<.965&&!kkNearBase(x,y,6)) add('structure-platform-dock-small',.3,x,y,0,-.05);
      else if(id==='tempest'&&e&&!kkNearBase(x,y,5)&&r>.9&&r<.92) add(R()<.5?'barrel':'crate-bottles',.55,x,y,R()*6.28);
      else if(!e&&!kkNearBase(x,y,6)&&r>.985&&(id==='classic'||id==='close'||id==='vast'||id==='scatter')) add('crate',.5,x,y,R()*6.28); }
    for(const td of TD){ if(td.absent) continue; const d=td.dir; for(const s of [-1,1]){ const p=[-d[1],d[0]]; const x=td.bx+d[0]*3+p[0]*s*4, y=td.by+d[1]*3+p[1]*s*4; if(floorT[idx(x,y)]===1&&!wallT[idx(x,y)]) add('cannon',.7,x,y,Math.atan2(-d[0],-d[1])+Math.PI/2); } }
    if(id==='tempest'){ const o=S('ship-wreck'); if(o){ const g=new THREE.Group(); const w=KK.knp('pirate','ship-wreck',9,true); if(w){ w.position.set(CX+.5,-.15,CY+.5); w.rotation.y=.4; G.add(w); } } }
    for(const n in L){ const src=S(n); if(!src) continue; KK.batch(G,src,L[n].h,L[n].a); } });
}
/* --- aucune coquille vide : la coque du galion devient plus lisible (voiles transparentes) --- */
{ const _bs=buildShip; buildShip=function(){ _bs(); const g=shipGroup; if(!g||!g.userData.kkShip) return; g.userData.kkShip.traverse(o=>{ if(/^sail/.test(o.name)){ o.traverse(m=>{ if(m.isMesh){ m.material=m.material.clone(); m.material.transparent=true; m.material.opacity=.22; m.material.depthWrite=false; m.castShadow=false; } }); } }); }; }
