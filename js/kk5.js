'use strict';
/* ===== KayKit BlockBits : vrais blocs cubiques pour le sol des îles, les bases et les blocs posés par les joueurs ===== */
KK.bk={}; KK.bkM={}; KK.bkReady=false; KK.bkLoading=false; KK.iGK={};
KK.BLK=['wood','sand_A','sand_B','stone','stone_dark','bricks_A','bricks_B','glass','snow','dirt','dirt_with_grass','grass','sand_with_grass','gravel','decorative_block_red','decorative_block_blue','decorative_block_green','decorative_block_yellow'];
KK.TC=['blue','red','green','yellow'];
KK.loadBlocks=function(){
  if(KK.bkLoading||typeof THREE.GLTFLoader!=='function') return; KK.bkLoading=true; const L=new THREE.GLTFLoader();
  Promise.all(KK.BLK.map(n=>new Promise(res=>L.load('assets/kk/blocks/'+n+'.glb',g=>{
    try{ g.scene.updateMatrixWorld(true); const geos=[]; let mat=null; g.scene.traverse(o=>{ if(o.isMesh){ const q=o.geometry.clone(); q.applyMatrix4(o.matrixWorld); for(const k of Object.keys(q.attributes)) if(!['position','normal','uv'].includes(k)) q.deleteAttribute(k); geos.push(q); mat=mat||o.material; } });
      const geo=geos.length>1?THREE.BufferGeometryUtils.mergeBufferGeometries(geos):geos[0]; geo.computeBoundingBox(); const b=geo.boundingBox, c=b.getCenter(new THREE.Vector3()), sx=b.max.x-b.min.x, sy=b.max.y-b.min.y, sz=b.max.z-b.min.z;
      geo.translate(-c.x,-c.y,-c.z); geo.scale(1/sx,1/sy,1/sz); if(mat.map){ mat.map.magFilter=THREE.NearestFilter; mat.map.minFilter=THREE.NearestMipmapLinearFilter; }
      KK.bk[n]=geo; KK.bkM[n]=new THREE.MeshStandardMaterial({map:mat.map,roughness:.9,metalness:0,transparent:!!mat.transparent,opacity:mat.opacity===undefined?1:mat.opacity,alphaTest:mat.alphaTest||0}); }catch(e){ console.warn('bloc',n,e); } res(); },undefined,()=>res()))))
  .then(()=>{ KK.bkReady=!!(KK.bk.wood&&KK.bk.dirt_with_grass&&KK.bk.sand_A); if(KK.bkReady&&typeof scene!=='undefined'&&scene&&game.state!=='menu'){ try{ buildWorldMeshes(); worldSig=-1; }catch(e){ console.warn(e); } } });
};
KK.TYPE={2:'wood',3:'sand_B',4:'bricks_A',5:'stone_dark',7:'decorative_block_red',8:'glass'};
function kkApplyBlocks(){
  if(!KK.bkReady) return;
  for(const t of BTYPES){ const n=KK.TYPE[t]; if(!KK.bk[n]) continue; for(const m of [iWallT[t],iPlatT[t]]){ if(m){ m.geometry=KK.bk[n]; m.material=KK.bkM[n]; } } }
}
{ const _b=buildWorldMeshes; buildWorldMeshes=function(){ KK.gsig=null; _b(); KK.loadBlocks(); try{ kkApplyBlocks(); }catch(e){ console.warn(e); } }; }
/* sol des îles : découpé en tronçons de 10×10 cases ; seuls les tronçons visibles par la caméra sont dessinés */
KK.GCH=[]; KK.gsig=null; KK.gGroup=null;
KK.groundGeo={};
KK.lite=function(n){ if(KK.groundGeo[n]) return KK.groundGeo[n]; const g=KK.bk[n].toNonIndexed(), p=g.attributes.position, nr=g.attributes.normal, uv=g.attributes.uv, P=[],N=[],U=[];
  for(let i=0;i<p.count;i+=3){ const ny=(nr.getY(i)+nr.getY(i+1)+nr.getY(i+2))/3; if(ny<-.7) continue; for(let k=0;k<3;k++){ P.push(p.getX(i+k),p.getY(i+k),p.getZ(i+k)); N.push(nr.getX(i+k),nr.getY(i+k),nr.getZ(i+k)); U.push(uv.getX(i+k),uv.getY(i+k)); } }
  const o=new THREE.BufferGeometry(); o.setAttribute('position',new THREE.Float32BufferAttribute(P,3)); o.setAttribute('normal',new THREE.Float32BufferAttribute(N,3)); o.setAttribute('uv',new THREE.Float32BufferAttribute(U,2)); return KK.groundGeo[n]=o; };
{ const _rw=rebuildWorld;
  rebuildWorld=function(){ _rw(); if(!KK.bkReady||!scene) return; iGround.count=0;
    const ice=typeof iceOn==='function'&&iceOn(), jg=(MAPS[game.opts.map]||{}).jungle; let sig=0; for(let i=0;i<floorT.length;i++) if(floorT[i]===1) sig=(Math.imul(sig,31)+i+region[i])|0; sig=sig+'|'+ice+'|'+game.opts.map;
    if(sig===KK.gsig&&KK.GCH.length) return; KK.gsig=sig;
    if(KK.gGroup) scene.remove(KK.gGroup); const G=KK.gGroup=new THREE.Group(); scene.add(G); KK.GCH=[]; const bins={}, col=new THREE.Color();
    for(let ty=0;ty<H;ty++)for(let tx=0;tx<W;tx++){ const i=idx(tx,ty); if(floorT[i]!==1) continue; const reg=region[i], h=hash(tx,ty), chk=((tx+ty)&1)?.93:1; let c=chk, n;
      if(reg>=0&&reg<4){ const td=TD[reg], d=Math.max(Math.abs(tx-td.bx),Math.abs(ty-td.by)), beach=Math.hypot(tx-td.bx,ty-td.by)>4.2;
        if(d<=1){ n='decorative_block_'+KK.TC[reg]; c=1; } else if(d===2) n='bricks_A'; else if(ice) n='snow'; else if(!beach&&(h%3!==0||jg)) n='sand_with_grass'; else n='sand_B'; }
      else if(reg===4){ n=(Math.abs(tx-CX)<=3&&Math.abs(ty-CY)<=6)?'wood':'gravel'; if(ice) n='snow'; }
      else n=ice?'snow':'sand_B';
      if(!KK.bk[n]) continue; const key=n+'|'+(tx/10|0)+'|'+(ty/10|0); (bins[key]=bins[key]||{n,cx:tx/10|0,cy:ty/10|0,a:[]}).a.push([tx,ty,c]); }
    const q=new THREE.Quaternion(), s=new THREE.Vector3(1,1,1), p=new THREE.Vector3(), mx=new THREE.Matrix4();
    for(const key in bins){ const b=bins[key], m=new THREE.InstancedMesh(KK.lite(b.n),KK.bkM[b.n],b.a.length); b.a.forEach((t,k)=>{ p.set(t[0]+.5,-.5,t[1]+.5); mx.compose(p,q,s); m.setMatrixAt(k,mx); col.setRGB(t[2],t[2],t[2]); m.setColorAt(k,col); });
      m.castShadow=false; m.receiveShadow=true; m.frustumCulled=false; m.instanceMatrix.needsUpdate=true; if(m.instanceColor) m.instanceColor.needsUpdate=true; G.add(m); m.userData.box=new THREE.Box3(new THREE.Vector3(b.cx*10,-1.1,b.cy*10),new THREE.Vector3(b.cx*10+10,1.2,b.cy*10+10)); KK.GCH.push(m); } };
}
{ const _r=render3d, fr=new THREE.Frustum(), pm=new THREE.Matrix4();
  render3d=function(dt){ if(KK.GCH.length&&camera3){ camera3.updateMatrixWorld(); pm.multiplyMatrices(camera3.projectionMatrix,camera3.matrixWorldInverse); fr.setFromProjectionMatrix(pm); for(const m of KK.GCH) m.visible=fr.intersectsBox(m.userData.box); } _r(dt); }; }
KK.loadBlocks();
