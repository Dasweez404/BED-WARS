'use strict';
/* ===== KayKit : armes en main (modèles 3D), bouclier de parade, accessoires ===== */
KK.props={}; KK.pload=false;
KK.loadProps=function(){
  if(KK.pload||typeof THREE.GLTFLoader!=='function') return; KK.pload=true; const L=new THREE.GLTFLoader();
  const names=['dagger','sword_1handed','sword_2handed_color','axe_1handed','axe_2handed','bow_withString','crossbow_2handed','shield_round','shield_spikes','staff','wand','pickaxe','hammer','torch','lantern','shovel','mug_full'];
  for(const n of names) L.load('assets/kk/props/'+n+'.glb',g=>{ g.scene.traverse(o=>{ if(o.isMesh) o.castShadow=true; }); KK.props[n]=g.scene; },undefined,()=>{});
};
KK.prop=function(n){ const s=KK.props[n]; if(!s) return null; const c=s.clone(true); return c; };
KK.wepFor=function(id,e){
  if(id==='sword'){ return ['dagger','sword_1handed','sword_1handed','sword_2handed_color'][Math.min(3,e.sword|0)]; }
  if(id==='pick') return 'pickaxe'; if(id==='hammer') return 'hammer';
  if(id==='bow'||id==='flarebow') return 'bow_withString'; if(id==='crossbow3') return 'crossbow_2handed';
  if(id==='boomerang'||id==='axe') return 'axe_1handed'; if(id==='flame') return 'torch';
  if(id==='glove'||id==='baa') return '-';
  return null;
};
{ const _ap=animatePirate;
  animatePirate=function(e,m,dt){
    _ap(e,m,dt); const u=m.userData, k=u.kk; if(!k||!k.hand) return; KK.loadProps();
    const id=e.held||'sword', w=KK.wepFor(id,e), key=w?w+'|'+(e.team):'';
    if(k.wKey!==key){ if(k.wObj){ k.wObj.parent&&k.wObj.parent.remove(k.wObj); k.wObj=null; }
      if(w&&w!=='-'){ const o=KK.prop(w); if(o){ k.wObj=o; k.hand.add(o); k.wKey=key; } else k.wKey=null; } else k.wKey=key; }
    const kw=!!(w&&(w==='-'||k.wObj)); if(u.heldMesh&&kw) u.heldMesh.visible=false; else if(u.heldMesh&&!(e.cloak>0&&e!==player)) u.heldMesh.visible=true;
    if(k.wObj) k.wObj.visible=!(e.cloak>0&&e!==player);
    // bouclier à gauche pendant la parade
    if(e.parry>0&&!k.shield&&KK.props.shield_round){ const s=KK.prop('shield_round'), hl=k.model.getObjectByName('handslot.l'); if(s&&hl){ hl.add(s); k.shield=s; } }
    if(k.shield) k.shield.visible=e.parry>0;
  };
}

/* ---- décors KayKit (Forest, Halloween) par carte : placés après le décor de base ---- */
KK.ph={}; KK.pq={};
KK.need=function(names,cb){
  let left=names.length; const L=KK.GL||(KK.GL=new THREE.GLTFLoader()); if(!left) return cb();
  const one=()=>{ if(--left===0) cb(); };
  for(const n of names){ if(KK.props[n]){ one(); continue; } if(KK.pq[n]){ KK.pq[n].push(one); continue; } KK.pq[n]=[one];
    L.load('assets/kk/props/'+n+'.glb',g=>{ g.scene.traverse(o=>{ if(o.isMesh) o.castShadow=true; }); KK.props[n]=g.scene; const bb=new THREE.Box3().setFromObject(g.scene); KK.ph[n]=Math.max(.01,bb.max.y-bb.min.y); for(const f of KK.pq[n]) f(); },undefined,()=>{ for(const f of KK.pq[n]) f(); }); }
};
KK.decG=null;
function kkDecor(){
  if(KK.decG&&scene) scene.remove(KK.decG); KK.decG=null; if(!scene||typeof TD==='undefined'||!TD.length) return; const id=game.opts.map; let seed=prng3(31+id.length*17); const R=()=>seed();
  const plan={ // [nom, hauteur monde, proba/tuile, rayon mini autour des bases, sur bord seulement]
    tempest:[['skull',.35,.012,6],['ribcage',.55,.01,6],['bone_A',.3,.015,6],['coffin',.9,.004,7],['tree_dead_medium',2.6,.012,6],['lantern_standing',1.1,.006,5],['Rock_1_A_Color1',.8,.02,5]],
    citadel:[['gravestone',.9,.012,6],['grave_A',.9,.006,6],['lantern_standing',1.1,.008,5],['pillar',2.2,.006,6],['skull',.35,.006,6],['Rock_2_A_Color1',.8,.012,5]],
    jungle:[['Tree_1_A_Color1',3.2,.03,5],['Tree_2_A_Color1',3.6,.025,5],['Tree_3_A_Color1',3,.02,5],['Bush_1_A_Color1',.9,.05,4],['Bush_4_A_Color1',.8,.04,4],['Rock_1_F_Color1',.8,.012,5],['Grass_1_A_Color1',.7,.06,3]],
    atoll:[['Bush_2_A_Color1',.8,.03,4],['Rock_3_A_Color1',.7,.015,5]],
    scatter:[['Bush_2_A_Color1',.8,.03,4],['Rock_3_A_Color1',.7,.015,5]],
    glacier:[['tree_dead_medium',2.4,.008,6],['Rock_2_A_Color1',.8,.02,5]],floes:[['Rock_2_A_Color1',.8,.02,5]],
    _:[['Bush_1_A_Color1',.8,.02,4],['Rock_1_A_Color1',.7,.012,5]]
  }, P=plan[id]||plan._;
  KK.need(P.map(p=>p[0]),()=>{
    if(game.state==='menu'||!KK.props||(KK.decG)) return; const g=new THREE.Group(); KK.decG=g; const near=(x,y,d)=>{ for(const t of TD) if(Math.hypot(x-t.bx,y-t.by)<d) return true; return false; };
    for(let y=0;y<H;y++)for(let x=0;x<W;x++){ if(floorT[idx(x,y)]!==1||wallT[idx(x,y)]||spawnerAt(x,y)) continue; const r=R();
      let acc=0; for(const [n,hh,pr,rad] of P){ acc+=pr; if(r<acc){ if(near(x,y,rad)||!KK.props[n]) break; const o=KK.props[n].clone(true), s=hh/(KK.ph[n]||1); o.scale.setScalar(s*(.9+R()*.3)); o.rotation.y=R()*6.28; o.position.set(x+.5+(R()-.5)*.4,0,y+.5+(R()-.5)*.4); g.add(o); break; } } }
    scene.add(g); });
}
{ const _on=onNewGame; onNewGame=function(){ _on(); try{ kkDecor(); }catch(e){ console.warn(e); } }; }
