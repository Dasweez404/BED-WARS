'use strict';
/* ===== KayKit Dungeon : vrai coffre au trésor, bannières d'équipe, tonneaux, caisses, torches et pièces autour des bases ===== */
KK.dg={}; KK.dgh={}; KK.dgq={};
KK.dnd=function(names,cb){
  let left=names.length; const L=KK.GL||(KK.GL=new THREE.GLTFLoader()); if(!left) return cb();
  const one=()=>{ if(--left===0) cb(); };
  for(const n of names){ if(KK.dg[n]){ one(); continue; } if(KK.dgq[n]){ KK.dgq[n].push(one); continue; } KK.dgq[n]=[one];
    L.load('assets/kk/dungeon/'+n+'.glb',g=>{ g.scene.traverse(o=>{ if(o.isMesh){ o.castShadow=true; o.receiveShadow=true; } }); KK.dg[n]=g.scene; const bb=new THREE.Box3().setFromObject(g.scene); KK.dgh[n]={h:Math.max(.01,bb.max.y-bb.min.y),bb}; for(const f of KK.dgq[n]) f(); },undefined,()=>{ for(const f of KK.dgq[n]) f(); }); }
};
KK.dgp=function(n,h){ const s=KK.dg[n]; if(!s) return null; const o=s.clone(true), k=h/KK.dgh[n].h; const w=new THREE.Group(); o.scale.setScalar(k); w.add(o); return w; };
function kkDungeon(){
  if(!scene||typeof TD==='undefined'||!TD.length||game.state==='menu') return;
  const tcol={0:'blue',1:'red',2:'green',3:'yellow'};
  KK.dnd(['chest_gold','chest_gold_lid','banner_shield_blue','banner_shield_red','banner_shield_green','banner_shield_yellow','barrel_small','barrel_large','crates_stacked','box_small','torch_lit','coin_stack_medium','coin_stack_small','candle_triple'],()=>{
    if(!KK.dg.chest_gold) return;
    // coffre : le modèle KayKit remplace le coffre cube (on garde l'aura, le drapeau et l'animation du couvercle)
    TD.forEach((td,i)=>{ const g=coreM[i]; if(!g||g.userData.kkChest) return; const u=g.userData;
      g.traverse(o=>{ if(o.isMesh&&o!==u.glow&&o!==u.flag) o.visible=false; });
      const sb=KK.dg.chest_gold, sl=KK.dg.chest_gold_lid; if(!sb||!sl) return; const k=.8/KK.dgh.chest_gold.h, grp=new THREE.Group(); grp.scale.setScalar(k); g.add(grp);
      grp.add(sb.clone(true)); const pv=new THREE.Group(); pv.position.set(0,.5,-.62); grp.add(pv); const lo=sl.clone(true); lo.position.set(0,-.5,.62); pv.add(lo); u.lid=pv;
      u.kkChest=true; });
    // décor de base : bannière de l'équipe, torches, tonneaux, caisses, piles de pièces
    if(KK.dec2) scene.remove(KK.dec2); const G=KK.dec2=new THREE.Group(); scene.add(G);
    const put=(n,h,x,y,ry,ox,oz)=>{ const o=KK.dgp(n,h); if(!o) return; o.position.set(x+.5+(ox||0),WHu*.6+.02,y+.5+(oz||0)); o.rotation.y=ry||0; G.add(o); return o; };
    TD.forEach((td,i)=>{ const d=td.dir, p=[-d[1],d[0]], bx=td.bx, by=td.by;
      put('torch_lit',.9,bx+p[0]*2+d[0]*2,by+p[1]*2+d[1]*2,0); put('torch_lit',.9,bx-p[0]*2+d[0]*2,by-p[1]*2+d[1]*2,0);
      put('barrel_small',.7,bx-d[0]*3+p[0]*1,by-d[1]*3+p[1]*1,i); put('crates_stacked',1.0,bx-d[0]*3-p[0]*1.5,by-d[1]*3-p[1]*1.5,i*.7);
      put('coin_stack_medium',.4,bx+d[0]*1.2+p[0]*1.1,by+d[1]*1.2+p[1]*1.1,0); put('coin_stack_small',.28,bx+d[0]*1.0-p[0]*1.2,by+d[1]*1.0-p[1]*1.2,0); });
  });
}
{ const _on=onNewGame; onNewGame=function(){ _on(); try{ kkDungeon(); }catch(e){ console.warn(e); } }; const _n=newGame; newGame=function(){ if(KK.dec2&&scene){ scene.remove(KK.dec2); KK.dec2=null; } _n(); }; }
