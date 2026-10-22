'use strict';
/* ===== Remplacement des anciens modèles 3D procéduraux par ceux des packs (palmiers, rochers, tonneaux, coffres, buissons, torches, drapeaux, trésor, galion, gardes, crabe) ===== */
KK.t0=performance.now(); KK.swapReady=false; KK.sw={};
KK.normGeo=function(sc,height){
  sc.updateMatrixWorld(true); const geos=[]; let mat=null;
  sc.traverse(o=>{ if(o.isMesh){ const q=o.geometry.clone(); q.applyMatrix4(o.matrixWorld); for(const k of Object.keys(q.attributes)) if(!['position','normal','uv'].includes(k)) q.deleteAttribute(k); if(q.index) { const n=q.toNonIndexed(); geos.push(n);} else geos.push(q); mat=mat||o.material; } });
  const geo=geos.length>1?THREE.BufferGeometryUtils.mergeBufferGeometries(geos):geos[0]; geo.computeBoundingBox(); const b=geo.boundingBox, c=b.getCenter(new THREE.Vector3());
  geo.translate(-c.x,-b.min.y,-c.z); const k=height/Math.max(.001,b.max.y-b.min.y); geo.scale(k,k,k);
  const m=new THREE.MeshStandardMaterial({map:mat&&mat.map,color:mat&&mat.color?mat.color.clone():0xffffff,roughness:.85,metalness:0,side:THREE.DoubleSide,transparent:!!(mat&&mat.transparent),opacity:mat&&mat.opacity!==undefined?mat.opacity:1,alphaTest:mat&&mat.alphaTest||0}); if(m.map){ m.map.magFilter=THREE.LinearFilter; }
  geo.userData.kk=m; return geo;
};
/* clé de MODELS -> [dossier, fichier, hauteur (unités monde)] */
KK.SWAP={palm:['pirate','palm-detailed-bend',2.5],rock:['pirate','rocks-sand-a',.55],barrel:['pirate','barrel',.7],chest:['pirate','chest',.55],bush:['props','Bush_1_A_Color1',.75],crate:['pirate','crate',.62],rope:['props','rope_bundle_A',.3],balls:['pirate','cannon-ball',.3],log:['props','Wood_Log_Stack',.45]};
KK.doSwap=function(){
  const need={pirate:[],props:[]}; for(const k in KK.SWAP){ const [d,f]=KK.SWAP[k]; need[d].push(f); }
  KK.knd('pirate',need.pirate.concat(['ship-pirate-large','flag-pirate','chest','crab']),()=>{ KK.need(need.props.concat(['torch']),()=>{
    for(const k in KK.SWAP){ const [d,f,h]=KK.SWAP[k]; const src=d==='pirate'?(KK.kn['pirate/'+f]&&KK.kn['pirate/'+f].scene):KK.props[f]; if(!src||!MODELS) continue; try{ MODELS[k]=KK.normGeo(src,h); }catch(e){ console.warn('swap',k,e); } }
    KK.swapReady=true; }); });
};
KK.allReady=()=>KK.ok&&KK.bkReady&&KK.swapReady;
{ const _io=instOf; instOf=function(geo,mat,items,shadow){ if(geo&&geo.userData&&geo.userData.kk) mat=geo.userData.kk; return _io(geo,mat,items,shadow); }; }
/* torches et drapeaux de base : on garde l'animation mais on remplace les formes */
{ const _g=genProps3d;
  genProps3d=function(){ _g(); if(!KK.swapReady) return;
    for(const o of propM){ const p=o.p, g=o.m; if(p.type==='torch'&&KK.props.torch){ g.children.forEach(c=>{ c.visible=false; }); const t=KK.props.torch.clone(true), h=new THREE.Box3().setFromObject(KK.props.torch); const k=.95/Math.max(.01,h.max.y-h.min.y); t.scale.setScalar(k); g.add(t); }
      else if(p.type==='banner'&&KK.kn['pirate/flag-pirate']){ g.children.forEach(c=>{ c.visible=false; }); const f=KK.kn['pirate/flag-pirate'].scene.clone(true), h=new THREE.Box3().setFromObject(KK.kn['pirate/flag-pirate'].scene); const k=1.5/Math.max(.01,h.max.y-h.min.y); f.scale.setScalar(k); g.add(f); } } };
}
/* trésor central (événement) : vrai coffre, plus petit */
{ const _r=render3d; let done=false;
  render3d=function(dt){ _r(dt); if(done||!KK.swapReady||typeof treG==='undefined'||!treG||!KK.kn['pirate/chest']) return; done=true; treG.children.forEach(c=>{ if(c!==treG.userData.beam) c.visible=false; });
    const c=KK.kn['pirate/chest'].scene.clone(true), h=new THREE.Box3().setFromObject(KK.kn['pirate/chest'].scene); c.scale.setScalar(.62/Math.max(.01,h.max.y-h.min.y)); treG.add(c); treG.userData.kkc=c; treG.scale.setScalar(.7); };
}
/* galion central : navire pirate Kenney à la place de la coque cube */
{ const _bs=buildShip; buildShip=function(){ _bs(); const g=shipGroup; if(!g||!KK.kn['pirate/ship-pirate-large']) return; if(['citadel','tempest','jungle','atoll'].includes(game.opts.map)) return;
    g.children.forEach(c=>{ if(c.isMesh||c.isGroup) c.visible=false; }); const s=KK.kn['pirate/ship-pirate-large'].scene.clone(true), bb=new THREE.Box3().setFromObject(KK.kn['pirate/ship-pirate-large'].scene), L=Math.max(bb.max.x-bb.min.x,bb.max.z-bb.min.z);
    const k=14/L; s.scale.setScalar(k); const c=bb.getCenter(new THREE.Vector3()); s.position.set(-c.x*k,-bb.min.y*k-.3,-c.z*k); if((bb.max.x-bb.min.x)>(bb.max.z-bb.min.z)) s.rotation.y=Math.PI/2; const w=new THREE.Group(); w.add(s); g.add(w); g.userData.kkShip=w;
    // on cale le pont du navire sur le sol de jeu : la coque dépasse seulement en rebord, le mât et les voiles restent au-dessus
    w.updateMatrixWorld(true); const rc=new THREE.Raycaster(), hs=[], L2=14; for(const [x,z] of [[.9,-2],[-.9,-3],[.9,1.5],[-.9,3],[.8,-4.5],[-.8,5]]){ rc.set(new THREE.Vector3(x,20,z),new THREE.Vector3(0,-1,0)); const hit=rc.intersectObject(w,true); if(hit.length) hs.push(hit[0].point.y); }
    hs.sort((a,b)=>a-b); const deck=hs.length?hs[Math.floor(hs.length/2)]:2; s.position.y-=deck+.06; }; }
/* gardes : personnages KayKit animés */
{ const _ug=updateGuardM; updateGuardM=function(g,m){ _ug(g,m); const u=m.userData; if(!KK.ok) return; if(!u.kkArgs) u.kkArgs={td:TEAMS[g.team],opts:{neutral:true}}; if(!u.kk) kkAttach(m); const k=u.kk; if(!k) return;
    const mv=Math.hypot(g.vx||0,g.vy||0)>5; if(g.swing>0&&!k.curOnce) KK.play(k,'Melee_1H_Attack_Slice_Horizontal',{once:true,fade:.05,restart:true,ts:1.6}); else if(!k.curOnce) KK.play(k,mv?'Running_A':'Idle_A',{ts:mv?1.1:1}); if(k.curOnce){ k.onceT-=1/60; if(k.onceT<=0) k.curOnce=false; } k.mixer.update(1/60); if(u.heldMesh) u.heldMesh.visible=false; }; }
/* barrière de chargement : on attend que tous les modèles soient prêts avant de lancer une partie (9 s max) */
addEventListener('load',()=>{ const _st=screenTransition; screenTransition=function(fn){ if(KK.allReady()||performance.now()-KK.t0>9000||KK.failed) return _st(fn); const b=document.getElementById('playBtn'); const t=b?b.textContent:''; if(b) b.textContent='⏳ Chargement des modèles…'; const iv=setInterval(()=>{ if(KK.allReady()||performance.now()-KK.t0>9000){ clearInterval(iv); if(b) b.textContent=t; _st(fn); } },150); }; });
KK.doSwap();
/* crabe kamikaze : crabe animé du pack Cube Pets */
KK.knd('pets',['animal-crab'],()=>{
  const _cc=createCrab, _uc=updateCrabM;
  createCrab=function(c){ const g=_cc(c); const src=KK.kn['pets/animal-crab']; if(!src) return g; g.children.forEach(o=>{ o.visible=false; });
    const m=THREE.SkeletonUtils.clone(src.scene), bb=new THREE.Box3().setFromObject(src.scene), k=.55/Math.max(.01,bb.max.y-bb.min.y); m.scale.setScalar(k); m.rotation.y=Math.PI/2; g.add(m);
    const mx=new THREE.AnimationMixer(m), cl=src.animations.find(a=>a.name==='run')||src.animations[0]; if(cl) mx.clipAction(cl).play(); g.userData.pk=mx; return g; };
  updateCrabM=function(c,m){ _uc(c,m); const u=m.userData; if(u.pk) u.pk.update(1/60); };
});
