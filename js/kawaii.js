'use strict';
/* =====================  ANIMAUX « CHIBI / KAWAII »  =====================
   Corps tout ronds, grosses têtes, grands yeux brillants, joues roses, petits sourires. */
const KW={ smile:null };
function kwMat(c,o){ return new THREE.MeshStandardMaterial(Object.assign({color:c,flatShading:false,roughness:.55},o||{})); }
function kwAdd(par,geo,mat,x,y,z,sx,sy,sz,rx,ry,rz){ const m=new THREE.Mesh(geo,mat); m.position.set(x,y,z); m.scale.set(sx,sy,sz===undefined?sx:sz); if(rx||ry||rz) m.rotation.set(rx||0,ry||0,rz||0); m.castShadow=true; par.add(m); return m; }
const KWS=()=>KW.sph||(KW.sph=new THREE.SphereGeometry(1,16,12));
function kwEye(par,x,y,z,s,face){ // face : direction (+x), z : côté
  const W=new THREE.MeshBasicMaterial({color:0xffffff}), K=new THREE.MeshBasicMaterial({color:0x1a1420});
  kwAdd(par,KWS(),W,x,y,z,s*.9,s,s*.9); kwAdd(par,KWS(),K,x+s*.42,y-s*.05,z,s*.62,s*.75,s*.62);
  kwAdd(par,KWS(),W,x+s*.82,y+s*.28,z+(z>0?-s*.18:s*.18),s*.2,s*.2,s*.2); kwAdd(par,KWS(),W,x+s*.86,y-s*.25,z+(z>0?s*.12:-s*.12),s*.1,s*.1,s*.1);
}
function kwBlush(par,x,y,z,s){ kwAdd(par,KWS(),new THREE.MeshBasicMaterial({color:0xff9fc0,transparent:true,opacity:.75,depthWrite:false}),x,y,z,s*.3,s*.18,s*.42); }
function kwSmile(par,x,y,z,s,rotY){ if(!KW.smile) KW.smile=new THREE.TorusGeometry(1,.22,6,12,Math.PI); const m=new THREE.Mesh(KW.smile,new THREE.MeshBasicMaterial({color:0x3b1d1d})); m.scale.setScalar(s); m.position.set(x,y,z); m.rotation.set(Math.PI,rotY||Math.PI/2,0); par.add(m); return m; }
/* dauphin */
mkDolphin=function(){
  const g=new THREE.Group(), bl=kwMat(0x8ec5ef), be=kwMat(0xeef7ff), dk=kwMat(0x6fa8d8);
  kwAdd(g,KWS(),bl,0,0,0,.62,.46,.46); kwAdd(g,KWS(),be,.1,-.14,0,.5,.3,.38); kwAdd(g,KWS(),bl,.62,-.06,0,.2,.13,.16); kwAdd(g,KWS(),be,.66,-.11,0,.16,.07,.13);
  for(const s of [-1,1]){ kwEye(g,.42,.1,s*.3,.11); kwBlush(g,.5,-.06,s*.33,.3); kwAdd(g,KWS(),dk,.05,-.22,s*.4,.16,.05,.12,0,s*.4,-.3); }
  kwSmile(g,.7,-.06,0,.05);
  kwAdd(g,new THREE.ConeGeometry(1,1,10),dk,-.08,.5,0,.12,.22,.07,0,0,-.35);
  const tail=new THREE.Group(); tail.position.x=-.55; g.add(tail); kwAdd(tail,KWS(),bl,-.12,0,0,.22,.18,.18); for(const s of [-1,1]) kwAdd(tail,KWS(),dk,-.32,.02,s*.14,.1,.04,.18,0,s*.4,0);
  g.scale.setScalar(.95); g.userData={tail}; return g; };
/* tortue */
mkTurtle=function(){
  const g=new THREE.Group(), sh=kwMat(0x7ccf7a), sp=kwMat(0xb8e6a0), sk=kwMat(0xa6e3a1), be=kwMat(0xfff1c4);
  kwAdd(g,KWS(),sh,0,.06,0,.48,.32,.42); kwAdd(g,KWS(),be,0,-.08,0,.44,.12,.38);
  for(const [x,z,s] of [[0,0,.16],[.24,.16,.09],[.24,-.16,.09],[-.24,.16,.09],[-.24,-.16,.09],[.0,.27,.08],[0,-.27,.08]]) kwAdd(g,KWS(),sp,x,.3,z,s,.06,s);
  const head=new THREE.Group(); head.position.set(.52,.1,0); g.add(head); kwAdd(head,KWS(),sk,0,0,0,.24,.22,.24);
  for(const s of [-1,1]){ kwEye(head,.1,.06,s*.11,.075); kwBlush(head,.14,-.07,s*.15,.22); } kwSmile(head,.23,-.06,0,.035);
  const fl=[]; for(const [x,z] of [[.28,.4],[.28,-.4],[-.3,.34],[-.3,-.34]]){ const f=new THREE.Group(); f.position.set(x,-.03,z); kwAdd(f,KWS(),sk,0,0,z>0?.08:-.08,.13,.05,.1); g.add(f); fl.push(f); }
  kwAdd(g,KWS(),sk,-.5,-.02,0,.08,.05,.06);
  g.userData={fl,head}; return g; };
/* crabe */
createCrab=function(c){
  const g=new THREE.Group(), u={legs:[],claws:[]}, mat=kwMat(0xff7a63); u.mat=mat; const lt=kwMat(0xffa38f), dk=kwMat(0xe55a45);
  kwAdd(g,KWS(),mat,0,.24,0,.32,.24,.3); kwAdd(g,KWS(),lt,.05,.33,0,.2,.1,.2);
  for(const s of [-1,1]){ kwAdd(g,KWS(),mat,.16,.44,s*.12,.035,.1,.035); const eg=new THREE.Group(); eg.position.set(.18,.56,s*.12); g.add(eg); kwEye(eg,0,0,0,.075); kwBlush(g,.3,.22,s*.2,.22); }
  kwSmile(g,.32,.2,0,.04);
  for(const s of [-1,1]){ const cl=new THREE.Group(); cl.position.set(.26,.24,s*.3); g.add(cl); u.claws.push(cl); kwAdd(cl,KWS(),mat,.06,0,0,.07,.06,.06); kwAdd(cl,KWS(),lt,.18,.03,0,.12,.1,.1); kwAdd(cl,KWS(),dk,.28,.08,0,.06,.04,.05); kwAdd(cl,KWS(),dk,.28,-.02,0,.06,.04,.05); }
  for(const s of [-1,1]) for(const x of [-.14,0,.12]){ const l=new THREE.Group(); l.position.set(x,.12,s*.26); g.add(l); kwAdd(l,KWS(),dk,0,-.04,s*.06,.035,.09,.035,s*.5,0,0); u.legs.push(l); }
  g.userData=u; return g; };
/* requin (méchant mais mignon) */
createShark=function(){
  const g=new THREE.Group(), bd=kwMat(0x7b9bbb), be=kwMat(0xf3f7fb), dk=kwMat(0x5f80a2), tooth=new THREE.MeshBasicMaterial({color:0xffffff});
  kwAdd(g,KWS(),bd,0,0,0,.85,.42,.45); kwAdd(g,KWS(),be,.15,-.17,0,.7,.22,.38); kwAdd(g,KWS(),bd,.62,.04,0,.36,.32,.36);
  for(const s of [-1,1]){ kwEye(g,.72,.16,s*.24,.1); kwBlush(g,.8,-.04,s*.27,.28); kwAdd(g,KWS(),dk,.25,-.18,s*.42,.22,.05,.13,0,s*.5,-.4); }
  for(let k=0;k<5;k++) kwAdd(g,new THREE.ConeGeometry(1,1,4),tooth,.93,-.08,-.12+k*.06,.025,.05,.025,Math.PI,0,0);
  kwAdd(g,new THREE.ConeGeometry(1,1,10),dk,-.05,.52,0,.16,.32,.08,0,0,-.35);
  const tail=new THREE.Group(); tail.position.set(-.8,0,0); g.add(tail); kwAdd(tail,KWS(),bd,-.1,0,0,.25,.2,.2); kwAdd(tail,KWS(),dk,-.32,.16,0,.08,.22,.05,0,0,.5); kwAdd(tail,KWS(),dk,-.3,-.12,0,.07,.15,.05,0,0,-.4);
  g.userData={tail}; g.scale.setScalar(1.15); return g; };
/* perroquet */
mkParrot=function(){
  const g=new THREE.Group(), r=kwMat(0xff5a5a), y=kwMat(0xffd166), b=kwMat(0x4f8ff7), gr=kwMat(0x3ccf7a);
  kwAdd(g,KWS(),r,0,.12,0,.085,.1,.08); kwAdd(g,KWS(),r,.03,.26,0,.085,.08,.08); kwAdd(g,KWS(),y,.035,.1,0,.06,.07,.065);
  kwAdd(g,new THREE.ConeGeometry(1,1,8),y,.11,.25,0,.025,.05,.025,0,0,-Math.PI/2);
  for(const s of [-1,1]){ kwEye(g,.07,.29,s*.045,.024); kwAdd(g,KWS(),b,-.02,.13,s*.075,.06,.07,.02,0,0,.25); }
  kwAdd(g,KWS(),gr,-.12,.04,0,.1,.025,.035,0,0,.5); kwAdd(g,KWS(),b,-.13,.02,0,.08,.02,.03,0,0,.55);
  return g; };
