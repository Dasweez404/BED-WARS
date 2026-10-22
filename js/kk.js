'use strict';
/* ===== Personnages KayKit (CC0) riggés et animés, à la place des pirates-cubes (3D uniquement) =====
   Chargés en arrière-plan : tant que ce n'est pas prêt (ou si un fichier manque), le rendu cube d'origine reste en place. */
const KK={ok:false,failed:false,chars:{},clips:{},H:1.02,corpses:[],cls:{matelot:'Rogue_Hooded',corsaire:'Knight',canonnier:'Ranger',eclaireur:'Rogue',charpentier:'Barbarian',brute:'Barbarian',mystique:'Mage',pillard:'Rogue_Hooded'},sz:{brute:1.03,charpentier:1,eclaireur:.98,mystique:1},rest:['Rogue_Hooded','Rogue','Mage','Ranger','Knight','Barbarian']};
KK.hs={};
KK.load=function(){
  if(typeof THREE.GLTFLoader!=='function'||KK.loading) return; KK.loading=true; const L=new THREE.GLTFLoader(), P=f=>new Promise((res,rej)=>L.load(f,res,undefined,rej));
  const chars=['Rogue_Hooded','Rogue','Mage','Ranger','Knight','Barbarian'], packs=['General','MovementBasic','CombatMelee','CombatRanged','Tools','MovementAdvanced','Simulation'];
  Promise.all(chars.map(n=>P('assets/kk/chars/'+n+'.glb').then(g=>{ KK.chars[n]=g; })).concat(packs.map(n=>P('assets/kk/anim/Rig_Medium_'+n+'.glb').then(g=>{ for(const c of g.animations) if(!KK.clips[c.name]) KK.clips[c.name]=c; }))))
    .then(()=>{ KK.hs={}; for(const n in KK.chars){ const bb=new THREE.Box3().setFromObject(KK.chars[n].scene); KK.hs[n]=(bb.max.y-bb.min.y)||2; } KK.h=KK.hs.Knight||2; KK.ok=true; })
    .catch(e=>{ KK.failed=true; console.warn('KayKit : chargement impossible, rendu cube conservé',e); });
};
KK.name=cls=>KK.cls[cls]||KK.rest[Math.abs(String(cls).length)%6];
KK.size=cls=>KK.sz[cls]||1;
KK.make=function(name,sz){
  const src=KK.chars[name]||KK.chars.Rogue_Hooded, model=THREE.SkeletonUtils.clone(src.scene), mat=new THREE.MeshStandardMaterial({roughness:.8,metalness:0}); let first=null;
  model.traverse(o=>{ if(o.isMesh||o.isSkinnedMesh){ if(!first) first=o.material; o.material=mat; o.castShadow=true; o.receiveShadow=false; o.frustumCulled=false; } });
  if(first&&first.map){ mat.map=first.map; }
  model.scale.setScalar(KK.H/(KK.hs[name]||KK.h)/.46*(sz||1)); model.rotation.y=Math.PI/2; /* les modèles regardent vers +Z, le jeu vers +X */ const hand=model.getObjectByName('handslot.r'), head=model.getObjectByName('head');
  return {model,mat,hand,head,mixer:new THREE.AnimationMixer(model),act:{},cur:null,name};
};
KK.play=function(k,clip,o){
  o=o||{}; const cl=KK.clips[clip]; if(!cl) return; let a=k.act[clip]; if(!a){ a=k.act[clip]=k.mixer.clipAction(cl); if(o.once){ a.setLoop(THREE.LoopOnce,1); a.clampWhenFinished=true; } }
  if(k.cur===a&&!o.restart) { if(o.ts!==undefined) a.timeScale=o.ts; return; }
  a.reset(); a.enabled=true; a.setEffectiveWeight(1); a.timeScale=o.ts===undefined?1:o.ts; if(k.cur) k.cur.crossFadeTo(a,o.fade===undefined?.14:o.fade,false); a.play(); k.cur=a; k.curClip=clip; k.curOnce=!!o.once; k.onceT=o.once?cl.duration/(a.timeScale||1):0;
};
const KK_ATK={sword:'Melee_1H_Attack_Slice_Horizontal',axe:'Melee_1H_Attack_Chop',glove:'Melee_Unarmed_Attack_Punch_A'};
function kkAttach(g){
  const u=g.userData; if(u.kk||!KK.ok||!u.kkArgs) return; const a=u.kkArgs, name=a.opts&&a.opts.neutral?'Rogue_Hooded':KK.name((a.opts&&a.opts.cls)||'matelot');
  const k=KK.make(name,a.opts&&a.opts.neutral?1:KK.size((a.opts&&a.opts.cls)||'matelot')); u.kk=k; u.base=(a.opts&&a.opts.scale)||.46; /* même taille de base pour toutes les classes */ u.body.visible=false; g.add(k.model); u.mat=k.mat; u.mats={shirt:k.mat,skin:k.mat,dark:k.mat,hat:k.mat,band:k.mat};
  const td=a.td||{}; const tc=new THREE.Color(td.col||'#ffffff'); k.team=new THREE.Color('#ffffff').lerp(tc,.4);
  k.hold=new THREE.Group(); k.hold.scale.setScalar(1.35); k.hold.rotation.set(-Math.PI/2,0,0); (k.hand||k.model).add(k.hold);
  KK.play(k,'Idle_A');
}
{ const _cp=createPirate; createPirate=function(td,opts){ const g=_cp(td,opts); g.userData.kkArgs={td,opts:opts||{}}; return g; }; }
{ const _ap=animatePirate, _tint=setPirateTint;
  animatePirate=function(e,m,dt){
    _ap(e,m,dt); const u=m.userData; if(!KK.ok||(typeof SPR2D==='function'&&SPR2D())||!u.kkArgs) return; if(!u.kk) kkAttach(m); const k=u.kk; if(!k) return;
    if(u.heldMesh&&k.hold&&u.heldMesh.parent!==k.hold) k.hold.add(u.heldMesh);
    const gh=groundH(e), air=Math.max(0,e.z-gh), spd=Math.hypot(e.vx||0,e.vy||0), moving=(Math.abs(e.ix)+Math.abs(e.iy)>.05)&&air<2, id=e.held||'sword', gd=(typeof H_GUN!=='undefined')&&H_GUN[id], isGun=!!(typeof GUNS!=='undefined'&&GUNS[id]), bow=id==='bow'||id==='crossbow3'||id==='flarebow';
    const prevFlash=k.pf||0; k.pf=e.flash||0;
    if(k.curOnce){ k.onceT-=dt; if(k.onceT<=0) k.curOnce=false; }
    if(e.frozen>0){ k.mixer.timeScale=0; return; } k.mixer.timeScale=1;
    const sw=e.swingMax?e.swing/e.swingMax:0;
    if(!k.curOnce){
      if(prevFlash<=.01&&k.pf>.01&&!e.parry){ KK.play(k,Math.random()<.5?'Hit_A':'Hit_B',{once:true,fade:.05,restart:true}); }
      else if(sw>0||(e.muzzle||0)>.02){
        if(isGun) KK.play(k,bow?'Ranged_Bow_Release':(gd&&gd.two)?'Ranged_2H_Shoot':'Ranged_1H_Shoot',{once:true,fade:.05,restart:true,ts:1.4});
        else if(typeof H_THROW!=='undefined'&&H_THROW.indexOf(id)>=0) KK.play(k,'Throw',{once:true,fade:.05,restart:true,ts:1.5});
        else KK.play(k,/axe|hatchet|hammer/.test(id)?'Melee_1H_Attack_Chop':id==='glove'?'Melee_Unarmed_Attack_Punch_A':'Melee_1H_Attack_Slice_Horizontal',{once:true,fade:.05,restart:true,ts:1.6});
      }
    }
    if(!k.curOnce){
      if(e.parry>0) KK.play(k,'Melee_Blocking');
      else if(air>2) KK.play(k,'Jump_Idle');
      else if(moving||spd>40) KK.play(k,bow?'Running_HoldingBow':(isGun&&gd&&gd.two)?'Running_HoldingRifle':'Running_A',{ts:Math.max(.7,Math.min(1.6,spd/150))});
      else KK.play(k,bow?'Ranged_Bow_Idle':isGun?(gd&&gd.two?'Ranged_2H_Aiming':'Ranged_1H_Aiming'):'Idle_A');
    }
    k.mixer.update(dt);
  };
  setPirateTint=function(g,e){ _tint(g,e); const k=g.userData.kk; if(k&&k.team) k.mat.color.multiply(k.team); };
}
/* mort : au lieu du ragdoll cubique, le personnage joue son animation de chute */
{ const _rs=ragSpawn;
  ragSpawn=function(e){
    if(!KK.ok||(typeof SPR2D==='function'&&SPR2D())) return _rs(e);
    const td=TEAMS[e.team], k=KK.make(KK.name(e.cls||'matelot'),KK.size(e.cls||'matelot')); k.mat.color.copy(new THREE.Color('#ffffff').lerp(new THREE.Color(td.col),.4)); const g=new THREE.Group(); g.add(k.model); g.scale.setScalar(.46); g.position.set(e.x*U,e.z*U,e.y*U); g.rotation.y=-e.ang; scene.add(g);
    KK.play(k,Math.random()<.5?'Death_A':'Death_B',{once:true,fade:0}); KK.corpses.push({g,k,t:0}); if(KK.corpses.length>10){ const o=KK.corpses.shift(); scene.remove(o.g); }
  };
  const _r=render3d; render3d=function(dt){ for(const c of KK.corpses){ c.t+=dt; c.k.mixer.update(Math.min(.05,dt)); if(c.t>2.4){ const s=Math.max(0,1-(c.t-2.4)/.6); c.g.scale.setScalar(.46*s); } } for(let i=KK.corpses.length-1;i>=0;i--) if(KK.corpses[i].t>3){ scene.remove(KK.corpses[i].g); KK.corpses.splice(i,1); } _r(dt); };
  const _n=newGame; newGame=function(){ _n(); for(const c of KK.corpses) scene.remove(c.g); KK.corpses=[]; };
}
KK.load();
