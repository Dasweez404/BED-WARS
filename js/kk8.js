'use strict';
/* ===== Animaux (Cube Pets) qui se promènent sur les îles, perroquets perchés, icônes d'objets rendues depuis les modèles 3D ===== */
/* ---- animaux d'ambiance : seuls ceux proches de la caméra sont animés / affichés ---- */
KK.pets=[]; KK.petG=null;
KK.PETS={ jungle:[['monkey',.62,5],['parrot',.45,3],['koala',.55,2],['deer',.9,2],['fox',.5,1]], glacier:[['penguin',.55,7],['polar',.85,2]], floes:[['penguin',.55,6],['polar',.85,1]],
  atoll:[['crab',.35,6],['parrot',.45,2],['fish',.3,0]], scatter:[['crab',.35,5],['parrot',.45,2],['hog',.55,1]], classic:[['crab',.35,5],['parrot',.45,2],['dog',.55,1]], close:[['crab',.35,4],['cat',.45,1]], vast:[['crab',.35,6],['parrot',.45,3],['dog',.55,1]],
  corners:[['crab',.35,4],['hog',.55,2]], tides:[['crab',.35,8],['fish',.3,0]], citadel:[['dog',.55,2],['cat',.45,2],['hog',.55,1]], maelstrom:[['crab',.35,4]], tempest:[['crab',.35,3]] };
function kkPets(){
  if(KK.petG&&scene) scene.remove(KK.petG); KK.petG=null; KK.pets=[]; if(!scene||typeof TD==='undefined'||!TD.length||game.state==='menu') return;
  const list=KK.PETS[game.opts.map]||KK.PETS.classic, names=list.filter(p=>p[2]>0).map(p=>'animal-'+p[0]); const seed=prng3(909+game.opts.map.length*7), R=()=>seed();
  KK.knd('pets',names,()=>{
    if(game.state==='menu'||KK.petG) return; const G=KK.petG=new THREE.Group(); scene.add(G); const tiles=KK.freeTiles(5); if(!tiles.length) return;
    for(const [n,h,cnt] of list){ const src=KK.kn['pets/animal-'+n]; if(!src) continue;
      for(let k=0;k<cnt;k++){ const t=tiles[(R()*tiles.length)|0], m=THREE.SkeletonUtils.clone(src.scene), bb=new THREE.Box3().setFromObject(src.scene), sc=h/Math.max(.01,bb.max.y-bb.min.y); m.scale.setScalar(sc);
        const w=new THREE.Group(); w.add(m); w.position.set(t[0]+.5,0,t[1]+.5); w.rotation.y=R()*6.28; m.traverse(o=>{ if(o.isMesh){ o.castShadow=true; o.frustumCulled=false; } }); G.add(w);
        const mx=new THREE.AnimationMixer(m), clip=nm=>src.animations.find(a=>a.name===nm), idle=clip('idle')||src.animations[0], walk=clip('walk')||clip('run')||idle;
        KK.pets.push({w,mx,idle:idle&&mx.clipAction(idle),walk:walk&&mx.clipAction(walk),home:[t[0]+.5,t[1]+.5],tx:t[0]+.5,tz:t[1]+.5,t:R()*3,moving:false,name:n,sp:n==='crab'?.9:n==='fish'?0:.55,r:n==='parrot'?2:5}); } } });
}
{ const _on=onNewGame; onNewGame=function(){ _on(); try{ kkPets(); }catch(e){ console.warn(e); } }; const _n=newGame; newGame=function(){ if(KK.petG&&scene){ scene.remove(KK.petG); KK.petG=null; KK.pets=[]; } _n(); }; }
{ const _r=render3d; render3d=function(dt){ _r(dt); if(!KK.pets.length||!camera3||game.paused) return; const cp=camera3.position, d=Math.min(.05,dt||.016);
    for(const p of KK.pets){ const dx=p.w.position.x-cp.x, dz=p.w.position.z-cp.z, far=dx*dx+dz*dz>1600; p.w.visible=!far; if(far) continue;
      p.t-=d; if(p.t<=0){ if(p.moving||Math.random()<.4){ p.moving=false; p.t=2+Math.random()*4; } else { const a=Math.random()*6.28, r=Math.random()*p.r; p.tx=p.home[0]+Math.cos(a)*r; p.tz=p.home[1]+Math.sin(a)*r; const ix=Math.floor(p.tx), iz=Math.floor(p.tz); if(inb(ix,iz)&&floorT[idx(ix,iz)]===1&&!wallT[idx(ix,iz)]){ p.moving=p.sp>0; p.t=4; } else p.t=.5; } }
      if(p.moving){ const vx=p.tx-p.w.position.x, vz=p.tz-p.w.position.z, L=Math.hypot(vx,vz); if(L<.08){ p.moving=false; p.t=1.5+Math.random()*3; } else { const ix=Math.floor(p.w.position.x+vx/L*.2), iz=Math.floor(p.w.position.z+vz/L*.2); if(inb(ix,iz)&&floorT[idx(ix,iz)]===1&&!wallT[idx(ix,iz)]){ p.w.position.x+=vx/L*p.sp*d; p.w.position.z+=vz/L*p.sp*d; p.w.rotation.y=Math.atan2(vx,vz); } else { p.moving=false; p.t=1; } } }
      if(p.idle&&p.walk){ const want=p.moving?p.walk:p.idle; if(p.cur!==want){ if(p.cur) p.cur.fadeOut(.2); want.reset().fadeIn(.2).play(); p.cur=want; } } p.mx.update(d); } }; }
/* ---- perroquets perchés : modèle Kenney animé ---- */
{ const _mp=mkParrot; mkParrot=function(){ const g=_mp(); const src=KK.kn['pets/animal-parrot']; if(!src) return g; g.children.forEach(c=>{ c.visible=false; });
    const m=THREE.SkeletonUtils.clone(src.scene), bb=new THREE.Box3().setFromObject(src.scene), k=.42/Math.max(.01,bb.max.y-bb.min.y); m.scale.setScalar(k); g.add(m); const mx=new THREE.AnimationMixer(m); const cl=src.animations.find(a=>a.name==='idle')||src.animations[0]; if(cl) mx.clipAction(cl).play(); g.userData.pk=mx; return g; }; }
KK.knd('pets',['animal-parrot'],()=>{});
/* ---- icônes d'objets : rendu des vrais modèles ---- */
KK.ico={}; KK.icoQ={};
KK.ICO={ pick:'props:pickaxe',warhammer:'props:hammer',repairhammer:'props:hammer',repair:'props:hammer',rapier:'props:dagger',bow:'props:bow_withString',flarebow:'props:bow_withString',crossbow3:'props:crossbow_2handed',boomerang:'props:axe_1handed',flame:'props:torch',
  shield:'props:shield_round',aegis:'props:shield_spikes',core:'dg:chest_gold',flag:'pirate:flag-pirate',hull:'pirate:ship-pirate-small',wall:'blk:bricks_A',bomb:'pirate:barrel',cluster:'pirate:barrel',barrel:'pirate:barrel',coco:'misc:food_coconut',banana:'misc:food_banana',heal:'misc:food_bread',grog:'props:mug_full',
  chicken:'pets:animal-crab',sharkbait:'pets:animal-fish',bombraft:'pirate:boat-row-small',boat:'pirate:boat-row-small',rocketpilot:'pirate:cannon',cannonman:'pirate:cannon',art:'pirate:cannon-mobile',catapult:'misc:siege-catapult',watch:'pirate:tower-watch',lighthouse:'pirate:tower-complete-small',shipyard:'pirate:ship-pirate-small',
  parrotmsg:'pets:animal-parrot',r_parrot:'pets:animal-parrot',r_coin:'props:Gold_Nugget_Large',r_skull:'props:skull',mine:'pirate:cannon-ball',fb:'props:Copper_Bar',fs:'props:Silver_Bar',gold:'props:Gold_Bar',loot:'props:Gold_Nugget_Medium',mason:'props:Stone_Bricks_Stack_Medium',
  bronze:'props:Copper_Bar',silver:'props:Silver_Bar',spear:'props:staff',javelin:'props:staff',trident:'props:staff',turret:'pirate:cannon',turret2:'pirate:cannon',mirror:'props:shield_round',wool:'blk:wood',wood:'blk:wood',stone:'blk:bricks_A',obs:'blk:stone_dark',coral:'blk:decorative_block_red',iceblk:'blk:glass' };
KK.icoKey=function(id,e){ if(id==='sword') return 'props:'+['dagger','sword_1handed','sword_1handed','sword_2handed_color'][Math.min(3,(e&&e.sword)|0)]; if(id==='block'){ const t=(e&&e.bsel)||2; return 'blk:'+KK.TYPE[t]; } if(typeof BLOCK_SHOP!=='undefined'&&BLOCK_SHOP[id]) return 'blk:'+KK.TYPE[BLOCK_SHOP[id]]; return KK.ICO[id]||null; };
KK.icoSrc=function(key){ const [k,n]=key.split(':'); if(k==='props'){ if(KK.props[n]) return KK.props[n]; KK.need([n],()=>KK.icoDirty()); return null; }
  if(k==='blk') return KK.bk[n]?{geo:KK.bk[n],mat:KK.bkM[n]}:null; if(k==='dg'){ if(KK.dg[n]) return KK.dg[n]; KK.dnd([n],()=>KK.icoDirty()); return null; }
  const o=KK.kn[k+'/'+n]; if(o) return o.scene; KK.knd(k,[n],()=>KK.icoDirty()); return null; };
KK.icoDirty=function(){ KK.ico={}; if(typeof ICONC!=='undefined') ICONC.clear(); if(typeof ICOURL!=='undefined') ICOURL.clear(); };
KK.icoRender=function(src){
  if(!KK.ir){ const c=KK.irc=document.createElement('canvas'); c.width=c.height=128; const r=KK.ir=new THREE.WebGLRenderer({canvas:c,alpha:true,antialias:true,preserveDrawingBuffer:true}); r.setSize(128,128,false); r.setClearColor(0,0); r.outputEncoding=THREE.sRGBEncoding;
    const s=KK.is=new THREE.Scene(); s.add(new THREE.HemisphereLight(0xffffff,0x8899aa,1.15)); const d=new THREE.DirectionalLight(0xffffff,1.1); d.position.set(2,3,2.5); s.add(d); KK.icam=new THREE.OrthographicCamera(-.62,.62,.62,-.62,.1,20); KK.icam.position.set(1.5,1.3,1.9); KK.icam.lookAt(0,0,0); }
  const s=KK.is; if(KK.iobj){ s.remove(KK.iobj); KK.iobj=null; }
  let o; if(src.geo){ o=new THREE.Mesh(src.geo,src.mat); } else o=THREE.SkeletonUtils?THREE.SkeletonUtils.clone(src):src.clone(true);
  const g=new THREE.Group(); g.add(o); g.updateMatrixWorld(true); const bb=new THREE.Box3().setFromObject(g), sz=bb.getSize(new THREE.Vector3()), c=bb.getCenter(new THREE.Vector3()), k=1/Math.max(.001,sz.x,sz.y,sz.z);
  o.position.set(-c.x*k,-c.y*k,-c.z*k); o.scale.multiplyScalar(k); o.rotation.y=-.5; s.add(g); KK.iobj=g; KK.ir.render(s,KK.icam); return KK.irc;
};
KK.icon=function(key,size){ const k=key+'|'+size; if(KK.ico[k]) return KK.ico[k]; const src=KK.icoSrc(key); if(!src) return null; try{ const r=KK.icoRender(src), c=document.createElement('canvas'); c.width=c.height=size; const x=c.getContext('2d'); x.drawImage(r,0,0,size,size); return KK.ico[k]=c; }catch(e){ return null; } };
addEventListener('load',()=>{ const _ii=itemIcon; itemIcon=function(id,e,size){ size=size||64; const key=KK.icoKey(id,e); if(key){ const c=KK.icon(key,size); if(c) return c; } return _ii(id,e,size); };
  if(typeof drawRes==='function'){ const _dr=drawRes; drawRes=function(c,k,x,y,s){ const key=KK.ICO[k]; const ic=key&&KK.icon(key,64); if(ic){ c.drawImage(ic,x-s*.62,y-s*.62,s*1.24,s*1.24); } else _dr(c,k,x,y,s); }; } });
{ const _gb=buildWorldMeshes; } 
