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
  KK.iGK={}; const mk=n=>{ if(!KK.iGK[n]&&KK.bk[n]){ const m=instMesh(KK.bk[n],KK.bkM[n],CAP,false,true); KK.iGK[n]=m; } return KK.iGK[n]; };
  for(const n of ['sand_with_grass','sand_B','wood','bricks_A','snow','gravel','decorative_block_red','decorative_block_blue','decorative_block_green','decorative_block_yellow']) mk(n);
}
{ const _b=buildWorldMeshes; buildWorldMeshes=function(){ for(const m of Object.values(KK.iGK)) if(m){ scene.remove(m); m.dispose&&m.dispose(); } KK.iGK={}; _b(); KK.loadBlocks(); try{ kkApplyBlocks(); }catch(e){ console.warn(e); } }; }
{ const _rw=rebuildWorld;
  rebuildWorld=function(){ _rw(); if(!KK.bkReady||!Object.keys(KK.iGK).length) return; iGround.count=0;
    const cnt={}; for(const n in KK.iGK) cnt[n]=0; const ice=typeof iceOn==='function'&&iceOn(), jg=(MAPS[game.opts.map]||{}).jungle, col=new THREE.Color();
    const put=(n,x,y,z,sc,c)=>{ const m=KK.iGK[n]; if(!m||cnt[n]>=CAP-1) return; sc3.set(1,sc,1); v3.set(x,y,z); m4.compose(v3,qd.identity(),sc3); m.setMatrixAt(cnt[n],m4); m.setColorAt(cnt[n]++,c); };
    for(let ty=0;ty<H;ty++)for(let tx=0;tx<W;tx++){ const i=idx(tx,ty); if(floorT[i]!==1) continue; const reg=region[i], h=hash(tx,ty), chk=((tx+ty)&1)?.93:1; col.setRGB(chk,chk,chk); let n;
      if(reg>=0&&reg<4){ const td=TD[reg], d=Math.max(Math.abs(tx-td.bx),Math.abs(ty-td.by)), beach=Math.hypot(tx-td.bx,ty-td.by)>4.2;
        if(d<=1){ n='decorative_block_'+KK.TC[reg]; col.setRGB(1,1,1); } else if(d===2) n='bricks_A'; else if(ice) n='snow'; else if(!beach&&(h%3!==0||jg)) n='sand_with_grass'; else n='sand_B'; }
      else if(reg===4){ n=(Math.abs(tx-CX)<=3&&Math.abs(ty-CY)<=6)?'wood':'gravel'; if(ice) n='snow'; }
      else n=ice?'snow':'sand_B';
      put(n,tx+.5,-.5,ty+.5,1,col); }
    for(const n in KK.iGK){ const m=KK.iGK[n]; m.count=cnt[n]; m.instanceMatrix.needsUpdate=true; if(m.instanceColor) m.instanceColor.needsUpdate=true; } };
}
KK.loadBlocks();
