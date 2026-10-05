'use strict';
/* =====================  MODÈLES : géométries fusionnées (peu d'appels de rendu), palmiers, pirates "chibi"  ===================== */
const _v=new THREE.Vector3(), _n=new THREE.Vector3(), _m=new THREE.Matrix4(), _nm=new THREE.Matrix3(), _q=new THREE.Quaternion(), _e=new THREE.Euler(), _c=new THREE.Color(), _s=new THREE.Vector3();
function mergeParts(parts){
  const P=[],N=[],C=[];
  for(const p of parts){
    const g=p.geo.index?p.geo.toNonIndexed():p.geo; const pa=g.attributes.position, na=g.attributes.normal, ca=g.attributes.color;
    _e.set(p.rot?p.rot[0]:0,p.rot?p.rot[1]:0,p.rot?p.rot[2]:0); _q.setFromEuler(_e);
    const sc=p.scale||[1,1,1]; _s.set(sc[0],sc[1],sc[2]); _v.set(p.pos[0],p.pos[1],p.pos[2]); _m.compose(_v,_q,_s); _nm.getNormalMatrix(_m);
    _c.set(p.color||'#ffffff');
    for(let i=0;i<pa.count;i++){
      _v.fromBufferAttribute(pa,i).applyMatrix4(_m); P.push(_v.x,_v.y,_v.z);
      _n.fromBufferAttribute(na,i).applyMatrix3(_nm).normalize(); N.push(_n.x,_n.y,_n.z);
      if(ca) C.push(_c.r*ca.getX(i),_c.g*ca.getY(i),_c.b*ca.getZ(i)); else C.push(_c.r,_c.g,_c.b);
    }
  }
  const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.Float32BufferAttribute(P,3)); geo.setAttribute('normal',new THREE.Float32BufferAttribute(N,3)); geo.setAttribute('color',new THREE.Float32BufferAttribute(C,3));
  return geo;
}
// feuille de palmier : bande courbée qui retombe, dégradé sombre -> clair
function leafGeo(L,W,droop,segs){
  segs=segs||6; const P=[],N=[],C=[]; const dark=new THREE.Color('#2a7a3e'), light=new THREE.Color('#7fd66a'), col=new THREE.Color();
  const pt=(t,k)=>{ const w=Math.sin(Math.PI*(.1+.9*t))*W*(1-t*.3); return [t*L, -droop*t*t+(k===0?.05*(1-t):0), k*w]; };
  const tri=(a,b,c,ta,tb,tc)=>{ for(const [p,t] of [[a,ta],[b,tb],[c,tc]]){ P.push(p[0],p[1],p[2]); col.copy(dark).lerp(light,t); C.push(col.r,col.g,col.b); }
    const u=new THREE.Vector3(b[0]-a[0],b[1]-a[1],b[2]-a[2]), v=new THREE.Vector3(c[0]-a[0],c[1]-a[1],c[2]-a[2]), n=u.cross(v).normalize(); for(let i=0;i<3;i++) N.push(n.x,n.y,n.z); };
  for(let i=0;i<segs;i++){ const t0=i/segs,t1=(i+1)/segs, l0=pt(t0,-1),c0=pt(t0,0),r0=pt(t0,1),l1=pt(t1,-1),c1=pt(t1,0),r1=pt(t1,1);
    tri(l0,c0,c1,t0,t0,t1); tri(l0,c1,l1,t0,t1,t1); tri(c0,r0,r1,t0,t0,t1); tri(c0,r1,c1,t0,t1,t1); }
  const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(P,3)); g.setAttribute('normal',new THREE.Float32BufferAttribute(N,3)); g.setAttribute('color',new THREE.Float32BufferAttribute(C,3)); return g;
}
const MODELS={};
const SWAYT={value:0};
function swayMat(mat){
  mat.onBeforeCompile=sh=>{ sh.uniforms.uTime=SWAYT;
    sh.vertexShader='uniform float uTime;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n#ifdef USE_INSTANCING\n float ph=instanceMatrix[3].x*1.7+instanceMatrix[3].z*1.3;\n#else\n float ph=0.0;\n#endif\n float hh=max(transformed.y-0.5,0.0);\n transformed.x+=sin(uTime*1.6+ph)*0.05*hh*hh; transformed.z+=cos(uTime*1.25+ph)*0.035*hh*hh;'); };
  return mat;
}
function buildModels(){
  const B=GEO.box, S=GEO.sphere, Cy=GEO.cyl;
  // ---- palmier stylé : tronc courbe annelé, couronne de 9 palmes + jeunes pousses, noix de coco
  { const parts=[], pts=[]; const N=7;
    for(let k=0;k<=N;k++){ const t=k/N; pts.push([.55*t*t+.06*Math.sin(t*5)*t,1.7*t,.12*Math.sin(t*3)*t]); }
    for(let k=0;k<N;k++){ const a=pts[k],b=pts[k+1], dx=b[0]-a[0],dy=b[1]-a[1], r0=.13-.06*(k/N), r1=.13-.06*((k+1)/N);
      const cg=new THREE.CylinderGeometry(r1,r0,Math.hypot(dx,dy)*1.04,7); parts.push({geo:cg,pos:[(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2],rot:[0,0,-Math.atan2(dx,dy)],color:k%2?'#a8733a':'#c08a4c'}); }
    parts.push({geo:S,pos:[pts[0][0],.06,0],scale:[.19,.12,.19],color:'#8f6030'});
    const top=pts[N];
    for(let k=0;k<9;k++){ const a=k*Math.PI*2/9+(k%3)*.12, L=.95+((k*37)%5)*.07, drp=.55+((k*17)%4)*.12; parts.push({geo:leafGeo(L,.2,drp,6),pos:[top[0],top[1]+.03,top[2]],rot:[0,a,.38+(k%2)*.12],color:k%3===0?'#a0ffa0':'#ffffff'}); }
    for(let k=0;k<3;k++){ const a=k*2.1+.5; parts.push({geo:leafGeo(.7,.14,.15,5),pos:[top[0],top[1]+.05,top[2]],rot:[0,a,1.05],color:'#c8ff9a'}); }
    for(const [x,z] of [[.11,.06],[-.08,.1],[.0,-.12]]) parts.push({geo:S,pos:[top[0]+x,top[1]-.12,top[2]+z],scale:[.1,.1,.1],color:'#5e3d1a'});
    MODELS.palm=mergeParts(parts); }
  // ---- rocher (3 blocs), tonneau, coffre fermé, cristaux
  MODELS.rock=mergeParts([{geo:GEO.sphere0,pos:[0,.14,0],scale:[.3,.22,.26],color:'#8b8f99'},{geo:GEO.sphere0,pos:[.22,.08,.1],scale:[.15,.11,.13],color:'#a9aeb8'},{geo:GEO.sphere0,pos:[-.18,.07,-.14],scale:[.12,.09,.12],color:'#777c86'}]);
  MODELS.barrel=mergeParts([{geo:Cy,pos:[0,.25,0],scale:[.21,.5,.21],color:'#8a5a2b'},{geo:Cy,pos:[0,.13,0],scale:[.225,.05,.225],color:'#3b3f4a'},{geo:Cy,pos:[0,.37,0],scale:[.225,.05,.225],color:'#3b3f4a'},{geo:Cy,pos:[0,.505,0],scale:[.19,.02,.19],color:'#a8743c'}]);
  MODELS.chest=mergeParts([{geo:B,pos:[0,.13,0],scale:[.4,.26,.28],color:'#7c4a21'},{geo:Cy,pos:[0,.27,0],scale:[.14,.4,.14],rot:[0,0,Math.PI/2],color:'#8a5326'},{geo:B,pos:[.2,.2,0],scale:[.03,.1,.08],color:'#fbbf24'},{geo:B,pos:[-.12,.2,0],scale:[.03,.28,.3],color:'#3b3f4a'},{geo:B,pos:[.12,.2,0],scale:[.03,.28,.3],color:'#3b3f4a'}]);
  MODELS.crystal=mergeParts([{geo:GEO.octa,pos:[0,.4,0],scale:[.15,.4,.15],color:'#6ff0ff'},{geo:GEO.octa,pos:[.2,.25,.08],scale:[.1,.25,.1],color:'#39c9e0'},{geo:GEO.octa,pos:[-.17,.2,-.1],scale:[.09,.2,.09],color:'#8ff6ff'}]);
  buildPirateGeos();
}
/* ---------- pirate chibi ---------- */
const PG={}; // cache par variante
function pirateVariant(td,neutral){
  const key=(neutral?'n':'t')+td.col; if(PG[key]) return PG[key];
  const B=GEO.box, S=GEO.sphere, Cy=GEO.cyl, shirt=neutral?'#f1ece0':td.col, trim=neutral?td.col:'#ffffff', hatc=td.col, light=td.light;
  const v={};
  v.body=mergeParts([{geo:B,pos:[0,.5,0],scale:[.46,.38,.5],color:shirt},{geo:B,pos:[0,.42,0],scale:[.475,.06,.525],color:trim},{geo:B,pos:[0,.56,0],scale:[.475,.06,.525],color:trim},
    {geo:B,pos:[0,.33,0],scale:[.5,.06,.54],color:'#3b2a1c'},{geo:B,pos:[.26,.33,0],scale:[.03,.07,.1],color:'#fbbf24'},{geo:S,pos:[-.27,.5,0],scale:[.16,.16,.2],color:shirt}]);
  v.hat=mergeParts([{geo:GEO.cyl3,pos:[0,0,0],scale:[.64,.06,.64],rot:[0,Math.PI/2,0],color:'#1c1722'},{geo:GEO.cyl3,pos:[0,.035,0],scale:[.6,.04,.6],rot:[0,Math.PI/2,0],color:hatc},
    {geo:Cy,pos:[0,.17,0],scale:[.3,.26,.3],color:hatc},{geo:Cy,pos:[0,.1,0],scale:[.315,.06,.315],color:trim},{geo:S,pos:[.3,.14,0],scale:[.055,.055,.03],color:'#ffffff'},{geo:GEO.cone,pos:[0,.34,0],scale:[.06,.08,.06],color:light}]);
  const arm=[{geo:Cy,pos:[0,-.09,0],scale:[.075,.2,.075],color:shirt},{geo:Cy,pos:[0,-.2,0],scale:[.08,.03,.08],color:trim},{geo:S,pos:[0,-.26,0],scale:[.075,.075,.075],color:'#ffd9b5'}];
  v.arm=mergeParts(arm);
  return PG[key]=v;
}
function buildPirateGeos(){
  const S=GEO.sphere, Cy=GEO.cyl, B=GEO.box;
  const smile=new THREE.TorusGeometry(.085,.017,5,10,Math.PI);
  PG.head=mergeParts([{geo:S,pos:[0,0,0],scale:[.42,.38,.42],color:'#ffd9b5'},
    {geo:S,pos:[.37,-.12,.25],scale:[.05,.045,.09],color:'#ff98ae'},{geo:S,pos:[.37,-.12,-.25],scale:[.05,.045,.09],color:'#ff98ae'},
    {geo:S,pos:[.43,-.03,0],scale:[.05,.05,.05],color:'#ffab94'},
    {geo:smile,pos:[.41,-.12,0],rot:[0,Math.PI/2,Math.PI],color:'#7a2a1a'},
    {geo:S,pos:[.37,.06,-.17],scale:[.045,.12,.12],color:'#15121a'},
    {geo:Cy,pos:[0,.1,0],scale:[.41,.014,.41],rot:[0,0,.35],color:'#15121a'},
    {geo:S,pos:[.18,.36,.1],scale:[.1,.07,.1],color:'#e8b04a'},{geo:S,pos:[-.3,-.1,0],scale:[.08,.12,.08],color:'#6b4a2a'}]);
  PG.eye=mergeParts([{geo:S,pos:[0,0,0],scale:[.1,.125,.115],color:'#ffffff'},{geo:S,pos:[.06,-.01,0],scale:[.065,.08,.075],color:'#1a1620'},{geo:S,pos:[.105,.04,.03],scale:[.028,.028,.028],color:'#ffffff'}]);
  PG.leg=mergeParts([{geo:Cy,pos:[0,-.07,0],scale:[.085,.16,.085],color:'#5b4630'},{geo:B,pos:[.03,-.17,0],scale:[.2,.09,.15],color:'#1f1812'},{geo:B,pos:[.03,-.12,0],scale:[.19,.025,.155],color:'#4a3320'}]);
}
function createPirate(td,opts){
  opts=opts||{}; const v=pirateVariant(td,opts.neutral), g=new THREE.Group();
  const mat=new THREE.MeshStandardMaterial({vertexColors:true,flatShading:true,roughness:.75}); const u={mats:{shirt:mat,skin:mat,dark:mat,hat:mat,band:mat},mat,legs:[],eyes:[]};
  const mesh=(geo,par,x,y,z)=>{ const m=new THREE.Mesh(geo,mat); m.position.set(x,y,z); m.castShadow=true; par.add(m); return m; };
  const body=new THREE.Group(); body.position.y=.07; g.add(body); u.body=body; mesh(v.body,body,0,0,0);
  const head=new THREE.Group(); head.position.set(.03,.84,0); body.add(head); u.head=head; mesh(PG.head,head,0,0,0);
  u.eyes=[mesh(PG.eye,head,.37,.06,.17)]; u.eyes[0].castShadow=false;
  const hat=mesh(v.hat,head,0,.36,0); hat.rotation.z=-.1; hat.position.x=-.02; u.hat=hat;
  for(const z of [-1,1]){ const piv=new THREE.Group(); piv.position.set(0,.6,z*.31); body.add(piv); mesh(v.arm,piv,0,0,0); if(z>0){ u.armR=piv; const an=new THREE.Group(); an.position.set(.0,-.26,0); an.scale.setScalar(1.6); piv.add(an); u.anchor=an; } else u.armL=piv; }
  for(const z of [-.13,.13]){ const piv=new THREE.Group(); piv.position.set(0,.3,z); body.add(piv); mesh(PG.leg,piv,0,0,0); u.legs.push(piv); }
  const bub=new THREE.Mesh(GEO.sphere,new THREE.MeshStandardMaterial({color:0xbfe3ff,transparent:true,opacity:.35,roughness:.1})); bub.scale.setScalar(1.15); bub.position.y=.75; bub.visible=false; g.add(bub); u.bubble=bub;
  const ice=new THREE.Mesh(GEO.box,new THREE.MeshStandardMaterial({color:0xbfeaff,transparent:true,opacity:.45,roughness:.2})); ice.scale.set(1,1.8,1); ice.position.y=.8; ice.visible=false; g.add(ice); u.ice=ice;
  u.base=opts.scale||.46; u.blink=Math.random()*3; g.userData=u; g.scale.setScalar(u.base);
  return g;
}
const TINT={frozen:new THREE.Color('#9ad8f5'),root:new THREE.Color('#d6dde6'),slow:new THREE.Color('#d8dee9'),none:new THREE.Color('#ffffff')};
function setPirateTint(g,e){
  const mat=g.userData.mat;
  mat.color.copy(e.frozen>0?TINT.frozen:e.root>0?TINT.root:e.slow>0?TINT.slow:TINT.none);
  const f=e.flash>0?.9:0; mat.emissive.setRGB(f,f*.8,f*.8);
}
function animatePirate(e,m,dt){
  const u=m.userData, gh=groundH(e), air=Math.max(0,e.z-gh), moving=(Math.abs(e.ix)+Math.abs(e.iy)>.05)&&air<2, t=game.t+e.team*.7;
  const sw=Math.sin(e.stepPh*1.15)*(moving?.9:0);
  u.legs[0].rotation.z=sw; u.legs[1].rotation.z=-sw; u.armL.rotation.z=-sw*.9;
  if(air>2){ u.legs[0].rotation.z=.6; u.legs[1].rotation.z=-.5; u.armL.rotation.z=-1.1; }
  const bob=moving?Math.abs(Math.sin(e.stepPh*1.15))*.07:Math.sin(t*3)*.012; u.body.position.y=.07+bob; const sq=e.squash;
  const bs=u.base; m.scale.set(bs*(1+sq*.28),bs*(1-sq*.32),bs*(1+sq*.28));
  u.head.rotation.z=Math.sin(t*2.2)*.05+(moving?Math.sin(e.stepPh*1.15)*.06:0)+(e.slip>0?Math.sin(game.t*20)*.35:0); u.head.rotation.x=e.slip>0?Math.sin(game.t*17)*.2:0;
  u.hat.rotation.z=-.1+Math.sin(t*3)*.03;
  const blink=((game.t+u.blink)%3.6)<.13, big=e.flash>0||e.hp<maxhp(e)*.3;
  const es=blink?[1,.12,1]:big?[1.3,1.3,1.3]:[1,1,1]; u.eyes[0].scale.set(es[0],es[1],es[2]);
  u.bubble.visible=e.bubble>0; u.ice.visible=e.frozen>0;
  if(e.bubble>0) u.bubble.scale.setScalar(1.15+Math.sin(game.t*8)*.04);
}
