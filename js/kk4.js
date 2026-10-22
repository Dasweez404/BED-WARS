'use strict';
/* ===== Kenney Pirate Kit / Cube Pets : épave, canons, palmiers, rochers, crabe animé ===== */
KK.kn={}; KK.knh={}; KK.knq={};
KK.knd=function(dir,names,cb){
  let left=names.length; const L=KK.GL||(KK.GL=new THREE.GLTFLoader()); if(!left) return cb(); const one=()=>{ if(--left===0) cb(); };
  for(const n of names){ const key=dir+'/'+n; if(KK.kn[key]){ one(); continue; } if(KK.knq[key]){ KK.knq[key].push(one); continue; } KK.knq[key]=[one];
    L.load('assets/kk/'+dir+'/'+n+'.glb',g=>{ g.scene.traverse(o=>{ if(o.isMesh){ o.castShadow=true; o.receiveShadow=true; } }); KK.kn[key]=g; const bb=new THREE.Box3().setFromObject(g.scene); KK.knh[key]={bb,h:Math.max(.01,bb.max.y-bb.min.y),l:Math.max(.01,bb.max.x-bb.min.x,bb.max.z-bb.min.z)}; for(const f of KK.knq[key]) f(); },undefined,()=>{ for(const f of KK.knq[key]) f(); }); }
};
KK.knp=function(dir,n,size,byLen){ const g=KK.kn[dir+'/'+n]; if(!g) return null; const o=g.scene.clone(true), m=KK.knh[dir+'/'+n], k=size/(byLen?m.l:m.h); o.scale.setScalar(k); const w=new THREE.Group(); w.add(o); return w; };
function kkPirateDecor(){
  if(!scene||typeof TD==='undefined'||!TD.length||game.state==='menu') return; if(KK.dec3&&scene) scene.remove(KK.dec3); KK.dec3=null; const id=game.opts.map; let seed=prng3(77+id.length*13); const R=()=>seed();
  const need=['palm-detailed-bend','palm-bend','palm-detailed-straight','rocks-sand-a','rocks-sand-b','rocks-sand-c','cannon','barrel','crate','boat-row-small','ship-wreck','ship-pirate-large','chest','flag-pirate'];
  KK.knd('pirate',need,()=>{
    if(game.state==='menu'||KK.dec3) return; const G=KK.dec3=new THREE.Group(); scene.add(G); const K='pirate';
    const near=(x,y,d)=>{ for(const t of TD) if(Math.hypot(x-t.bx,y-t.by)<d) return true; return false; };
    const edge=(x,y)=>{ for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]) if(inb(x+dx,y+dy)&&floorT[idx(x+dx,y+dy)]!==1) return true; return false; };
    const put=(n,size,x,y,ry,byLen,yy)=>{ const o=KK.knp(K,n,size,byLen); if(!o) return; o.position.set(x+.5,yy||0,y+.5); o.rotation.y=ry||0; G.add(o); return o; };
    const tropical=['atoll','scatter','classic','close','tides','vast','corners','tempest','citadel','maelstrom'].includes(id)||!['glacier','floes','jungle'].includes(id);
    for(let y=0;y<H;y++)for(let x=0;x<W;x++){ if(floorT[idx(x,y)]!==1||wallT[idx(x,y)]||spawnerAt(x,y)) continue; const e=edge(x,y), r=R();
      if(id==='glacier'||id==='floes') continue;
      if(e&&!near(x,y,3)&&r<.07) put('rocks-sand-'+'abc'[(R()*3)|0],.7+R()*.4,x+(R()-.5)*.3,y+(R()-.5)*.3,R()*6.28);
      else if(tropical&&!near(x,y,5)&&!e&&r>.93&&r<.945&&id!=='tempest') put(R()<.5?'palm-detailed-bend':'palm-bend',2.6+R()*.8,x,y,R()*6.28);
      else if(e&&id==='atoll'&&r>.95&&r<.96) put('boat-row-small',1.8,x,y,R()*6.28,true,-.05);
      else if(id==='tempest'&&e&&!near(x,y,5)&&r>.9&&r<.915) put('barrel',.55,x,y,R()*6.28); }
    // canons sur chaque île de base, tournés vers le centre ; épave au centre du Cap des tempêtes
    for(const td of TD){ if(td.absent) continue; const d=td.dir; for(const s of [-1,1]){ const p=[-d[1],d[0]]; const x=td.bx+d[0]*3+p[0]*s*4, y=td.by+d[1]*3+p[1]*s*4; if(floorT[idx(x,y)]===1&&!wallT[idx(x,y)]) put('cannon',.7,x,y,Math.atan2(-d[0],-d[1])+Math.PI/2); } }
    if(id==='tempest'){ const w=put('ship-wreck',9,CX,CY,.4,true,-.15); }
  });
}
{ const _on=onNewGame; onNewGame=function(){ _on(); try{ kkPirateDecor(); }catch(e){ console.warn(e); } }; const _n=newGame; newGame=function(){ if(KK.dec3&&scene){ scene.remove(KK.dec3); KK.dec3=null; } _n(); }; }
