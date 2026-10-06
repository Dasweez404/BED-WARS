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
const SKINS=['#ffd9b5','#f5c08f','#d9a066','#a8693a','#6b4226'], HAIRS=['#6b4a2a','#1b1512','#d9a441','#c2410c','#e5e7eb'];
const HATS=['Tricorne','Bicorne','Bandana','Tête nue'], FACES=['Rasé','Barbe','Moustache'];
const BROWS=['Aucun','Fins','Épais','Très épais'], SHAPES=['Ronde','Carrée'];
const DEF_LOOK={skin:0,hat:0,hair:0,face:0,patch:1,shape:1,brow:1};
const lookOf=l=>Object.assign({},DEF_LOOK,l||{});
const lookKey=l=>l.skin+'.'+l.hat+'.'+l.hair+'.'+l.face+'.'+l.patch+'.'+l.shape+'.'+l.brow;
function randomLook(){ const r=n=>Math.floor(Math.random()*n); return {skin:r(SKINS.length),hat:r(HATS.length),hair:r(HAIRS.length),face:r(3),patch:Math.random()<.5?1:0,shape:Math.random()<.7?1:0,brow:r(4)}; }
function headGeo(l,td){
  const key='h'+lookKey(l)+td.col; if(PG[key]) return PG[key];
  const B=GEO.box, hair=HAIRS[l.hair], dk='#15121a';
  const P=[{geo:B,pos:[0,0,0],scale:[.82,.78,.82],color:td.col}];
  if(l.brow>0){ const th=.03+.03*l.brow; for(const z of [-1,1]) if(!(l.patch&&z<0)) P.push({geo:B,pos:[.415,.2,z*.2],scale:[.03,th,.24],color:'#1b1512'}); }
  if(l.patch) P.push({geo:B,pos:[.415,.07,-.2],scale:[.03,.2,.21],color:dk});
  if(l.face===1) P.push({geo:B,pos:[.36,-.3,0],scale:[.14,.2,.7],color:hair});
  if(l.face===2) P.push({geo:B,pos:[.425,-.13,0],scale:[.04,.06,.36],color:hair});
  return PG[key]=mergeParts(P);
}
function hatParts(kind,hatc,trim,light,hair){
  const B=GEO.box;
  if(kind===1) return [{geo:B,pos:[0,.1,0],scale:[.38,.2,.92],color:hatc},{geo:B,pos:[0,.2,0],scale:[.4,.04,.94],color:trim}];
  if(kind===2) return [{geo:B,pos:[0,-.02,0],scale:[.86,.14,.86],color:hatc},{geo:B,pos:[-.46,-.04,0],scale:[.1,.14,.14],color:hatc}];
  if(kind===3) return [{geo:B,pos:[0,-.04,0],scale:[.86,.14,.86],color:hair},{geo:B,pos:[.2,-.12,0],scale:[.46,.12,.86],color:hair}];
  return [{geo:B,pos:[0,.02,0],scale:[.72,.06,.72],color:'#1c1722'},{geo:B,pos:[0,.15,0],scale:[.5,.22,.5],color:hatc},{geo:B,pos:[0,.1,0],scale:[.52,.05,.52],color:trim}];
}
function pirateVariant(td,neutral,look){
  const l=lookOf(look), key=(neutral?'n':'t')+td.col+'|'+lookKey(l); if(PG[key]) return PG[key];
  const B=GEO.box, S=GEO.sphere, Cy=GEO.cyl, shirt=neutral?'#f1ece0':td.col, trim=neutral?td.col:'#ffffff', hatc=td.col, light=td.light;
  const v={};
  v.body=mergeParts([{geo:B,pos:[0,.28,0],scale:[.46,.5,.38],color:td.dark},{geo:B,pos:[0,.06,0],scale:[.475,.06,.395],color:td.col}]);
  v.hat=mergeParts(hatParts(l.hat,td.dark,'#ffffff',light,HAIRS[l.hair]));
  v.arm=mergeParts([{geo:B,pos:[0,-.2,0],scale:[.2,.2,.2],color:td.col}]);
  return PG[key]=v;
}
function buildPirateGeos(){
  const S=GEO.sphere, Cy=GEO.cyl, B=GEO.box;
  const smile=new THREE.TorusGeometry(.085,.017,5,10,Math.PI);
  PG.eye=mergeParts([{geo:GEO.box,pos:[0,0,0],scale:[.04,.09,.09],color:'#15121a'}]); const _eyeOld=mergeParts([{geo:S,pos:[0,0,0],scale:[.1,.125,.115],color:'#ffffff'},{geo:S,pos:[.06,-.01,0],scale:[.065,.08,.075],color:'#1a1620'},{geo:S,pos:[.105,.04,.03],scale:[.028,.028,.028],color:'#ffffff'}]);
  PG.leg=mergeParts([{geo:Cy,pos:[0,-.07,0],scale:[.085,.16,.085],color:'#5b4630'},{geo:B,pos:[.03,-.17,0],scale:[.2,.09,.15],color:'#1f1812'},{geo:B,pos:[.03,-.12,0],scale:[.19,.025,.155],color:'#4a3320'}]);
}
function createPirate(td,opts){
  opts=opts||{}; const lk=lookOf(opts.look), v=pirateVariant(td,opts.neutral,lk), g=new THREE.Group();
  const mat=new THREE.MeshStandardMaterial({vertexColors:true,flatShading:true,roughness:.75}); const u={mats:{shirt:mat,skin:mat,dark:mat,hat:mat,band:mat},mat,legs:[],eyes:[]};
  const mesh=(geo,par,x,y,z)=>{ const m=new THREE.Mesh(geo,mat); m.position.set(x,y,z); m.castShadow=true; par.add(m); return m; };
  const body=new THREE.Group(); body.position.y=.07; g.add(body); u.body=body; mesh(v.body,body,0,0,0);
  const head=new THREE.Group(); head.position.set(0,.9,0); body.add(head); u.head=head; mesh(headGeo(lk,td),head,0,0,0);
  const ex=.405; u.eyes=[mesh(PG.eye,head,ex,.07,.2)]; if(!lk.patch) u.eyes.push(mesh(PG.eye,head,ex,.07,-.2)); u.eyes.forEach(q=>q.castShadow=false);
  const hat=mesh(v.hat,head,0,.37,0); hat.rotation.z=-.08; u.hat=hat;
  for(const z of [-1,1]){ const piv=new THREE.Group(); piv.position.set(0,.46,z*.35); body.add(piv); mesh(v.arm,piv,0,0,0); if(z>0){ u.armR=piv; const an=new THREE.Group(); an.position.set(.0,-.2,0); an.scale.setScalar(1.6); piv.add(an); u.anchor=an; } else u.armL=piv; }
  for(let k=0;k<2;k++){ const piv=new THREE.Group(); body.add(piv); u.legs.push(piv); }
  { const sh=new THREE.Mesh(GEO.disc,new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:.28,depthWrite:false})); sh.position.y=.01; sh.scale.setScalar(.42); g.add(sh); u.sh=sh; }
  const bub=new THREE.Mesh(GEO.sphere,new THREE.MeshStandardMaterial({color:0xbfe3ff,transparent:true,opacity:.35,roughness:.1})); bub.scale.setScalar(1.15); bub.position.y=.85; bub.visible=false; g.add(bub); u.bubble=bub;
  const ice=new THREE.Mesh(GEO.box,new THREE.MeshStandardMaterial({color:0xbfeaff,transparent:true,opacity:.45,roughness:.2})); ice.scale.set(1,1.8,1); ice.position.y=.85; ice.visible=false; g.add(ice); u.ice=ice;
  u.base=opts.scale||.46; u.blink=Math.random()*3; g.userData=u; g.scale.setScalar(u.base);
  return g;
}
const TINT={frozen:new THREE.Color('#9ad8f5'),root:new THREE.Color('#d6dde6'),slow:new THREE.Color('#d8dee9'),none:new THREE.Color('#ffffff')};
function setPirateTint(g,e){
  const mat=g.userData.mat;
  mat.color.copy(e.frozen>0?TINT.frozen:e.root>0?TINT.root:e.slow>0?TINT.slow:TINT.none);
  const f=e.flash>0?.9:0; if(e.curse>0) mat.emissive.setRGB(Math.max(f,.32+.12*Math.sin(game.t*8)),f*.8,Math.max(f,.5)); else mat.emissive.setRGB(f,f*.8,f*.8);
}
function animatePirate(e,m,dt){
  const u=m.userData, gh=groundH(e), air=Math.max(0,e.z-gh), moving=(Math.abs(e.ix)+Math.abs(e.iy)>.05)&&air<2, t=game.t+e.team*.7;
  const sw=Math.sin(e.stepPh*1.15)*(moving?.9:0);
  u.legs[0].rotation.z=sw; u.legs[1].rotation.z=-sw; u.armL.rotation.z=-sw*.9;
  if(air>2){ u.legs[0].rotation.z=.6; u.legs[1].rotation.z=-.5; u.armL.rotation.z=-1.1; }
  const bob=moving?Math.abs(Math.sin(e.stepPh*1.15))*.07:Math.sin(t*3)*.012; u.body.position.y=.07+bob; const sq=e.squash;
  u.sz=(u.sz||1)+((e.tiny>0?.6:e.giant>0?1.45:1)-(u.sz||1))*.15; const bs=u.base*u.sz; m.scale.set(bs*(1+sq*.28),bs*(1-sq*.32),bs*(1+sq*.28));
  u.head.rotation.z=Math.sin(t*2.2)*.05+(moving?Math.sin(e.stepPh*1.15)*.06:0)+(e.slip>0?Math.sin(game.t*20)*.35:0); u.head.rotation.x=e.slip>0?Math.sin(game.t*17)*.2:0;
  u.hat.rotation.z=-.1+Math.sin(t*3)*.03;
  const blink=((game.t+u.blink)%3.6)<.13, big=e.flash>0||e.hp<maxhp(e)*.3;
  const es=blink?[1,.12,1]:big?[1.3,1.3,1.3]:[1,1,1]; for(const q of u.eyes) q.scale.set(es[0],es[1],es[2]);
  u.bubble.visible=e.bubble>0; u.ice.visible=e.frozen>0;
  if(e.bubble>0) u.bubble.scale.setScalar(1.15+Math.sin(game.t*8)*.04);
}

/* ---------- animations propres à chaque objet tenu (bras, corps, objet) ---------- */
const H_THROW=['bomb','repel','coco','anchor','cluster','barrage','storm','chicken','kraken','tp','vortex','firecracker','meteor','raid','lasso','sharkbait','crabs'];
const H_PLACE=['stonewall','battery','bridge2','mine','banana','net','turret','turret2','trampo','wallgad','guard','decoy','flag','repair','buoy','bridge'];
const H_BUFF=['hurricane','rage','hull','smokebomb','rod','springs','cloak','haste','aegis','frostnova','siren','quake','swap','dash','shield','jet'];
const H_GUN={ // z = élévation du bras, two = 2e main en appui, spin = rotation de l'objet en tirant, pump = va-et-vient, shake = tremblement, lean = penché en avant
  gun:{z:1.5},smg:{z:1.45,shake:.07,two:true},shotgun:{z:1.5,pump:true,two:true},sniper:{z:1.55,two:true},rocket:{z:2.25,two:true},woolgun:{z:1.45,pump:true},
  boomerang:{z:2.5,spinIdle:5},bubble:{z:1.4,pump:true},ice:{z:1.5},flame:{z:1.45,shake:.05,lean:.14,two:true},bow:{z:1.5,two:true,draw:true},flarebow:{z:1.5,two:true,draw:true},
  trident:{z:1.5,stab:true},gatling:{z:1.4,spin:34,two:true,shake:.03},javelin:{z:2.6,throw:true}
};
const _sm=x=>x*x*(3-2*x);
function heldAnim(e,m){
  const u=m.userData, id=e.held||'sword', t=game.t+e.team, R=u.armR, L=u.armL, B=u.body, A=u.anchor;
  B.rotation.set(0,0,0); A.rotation.set(0,0,0); A.position.set(0,-.26,0); A.scale.setScalar(1.6); R.rotation.x=0; L.rotation.x=0;
  const sw=e.swingMax?Math.max(0,e.swing/e.swingMax):0, p=1-sw, sp=Math.sin(p*Math.PI);
  const gmax=.5*cv(e,'gcd'), gp=e.cd.gad>0?Math.max(0,1-e.cd.gad/gmax):1, used=e.cd.gad>0;
  const gd=H_GUN[id]||(GUNS[id]?{z:1.5}:null);
  if(gd){
    const s=e.ws[id]||{a:1,r:0,last:-9}, kick=Math.min(1,(e.muzzle||0)/.08), firing=game.t-s.last<.16, rl=s.r>0;
    R.rotation.z=gd.z-kick*.45; R.rotation.y=0; A.position.y=-.26+kick*.14+(gd.stab?-kick*.3:0);
    B.rotation.z=-kick*.16+(gd.lean||0); if(gd.two){ L.rotation.z=1.35; }
    if(gd.shake&&firing) R.rotation.x=Math.sin(game.t*70)*gd.shake;
    if(gd.spin&&firing) A.rotation.y=game.t*gd.spin; else if(gd.spinIdle) A.rotation.y=game.t*gd.spinIdle;
    if(gd.pump&&s.cd>0) A.position.y+=Math.sin(Math.min(1,s.cd*3)*Math.PI*2)*.07;
    if(gd.draw&&s.cd>0) { R.rotation.z-=.15; L.rotation.z=1.5+Math.sin(game.t*20)*.05; }
    if(gd.throw&&kick>0) R.rotation.z=2.6-kick*1.4;
    if(rl){ R.rotation.z=.5; A.rotation.z=Math.sin(game.t*17)*.45; B.rotation.z=.13; L.rotation.z=1.0+Math.sin(game.t*13)*.45; }
    else if(!firing) A.rotation.z=Math.sin(t*2.4)*.05;
    return;
  }
  switch(id){
    case 'glove': if(sw>0){ R.rotation.z=1.5; A.position.y=-.26-.38*sp; B.rotation.y=-.35*sp; L.rotation.z=-.4; } else { R.rotation.z=.95+Math.sin(t*6)*.07; L.rotation.z=.9-Math.sin(t*6)*.07; B.position.y+=Math.abs(Math.sin(t*6))*.015; } break;
    case 'hammer': if(sw>0){ const q=_sm(p); R.rotation.z=3.0-3.1*q; B.rotation.z=-.1+.4*(q<.6?q:1.2-q); B.position.y-=.1*sp; } else { R.rotation.z=2.35+Math.sin(t*2)*.05; A.rotation.z=.4; } break;
    case 'baa': R.rotation.z=2.75; A.rotation.z=-.5; if(sw>0){ A.scale.setScalar(1.6*(1+.28*sp)); B.rotation.z=-.22*sp; B.position.y+=.05*sp; } else A.scale.setScalar(1.6*(1+.03*Math.sin(t*3))); break;
    case 'block': if(e.cd.place>0){ R.rotation.z=1.0+.75*Math.sin(Math.min(1,e.cd.place*7)*Math.PI); B.rotation.z=.08; } else R.rotation.z=1.0+Math.sin(t*2)*.04; break;
    case 'pick': if(e.cd.mine>0||sw>0){ const c=Math.sin(game.t*17); R.rotation.z=1.75+c*1.05; B.rotation.y=c*.12; B.rotation.z=.07; } else { R.rotation.z=2.2; A.rotation.z=.3; } break;
    case 'grap': R.rotation.z=1.5; A.rotation.y=Math.sin(t*2)*.5; if(e.hook||e.pull) { R.rotation.z=1.8; B.rotation.z=-.15; } break;
    case 'grog': case 'blessing': case 'heal': if(used){ const q=Math.sin(Math.min(1,gp*1.4)*Math.PI); R.rotation.z=1.0+2.1*q; u.head.rotation.z=-.4*q; B.rotation.z=-.1*q; } else { R.rotation.z=1.1; A.rotation.z=Math.sin(t*3)*.12; } break;
    default:
      if(H_THROW.includes(id)){
        if(used){ if(gp<.35){ const q=_sm(gp/.35); R.rotation.z=1.0+1.9*q; B.rotation.y=-.3*q; B.rotation.z=-.1*q; } else { const q=_sm((gp-.35)/.65); R.rotation.z=2.9-2.2*q; B.rotation.y=-.3+.6*q; B.rotation.z=.15*(1-q); } }
        else { R.rotation.z=1.1+Math.sin(t*2.2)*.06; A.rotation.z=Math.sin(t*4)*.15; }
      } else if(H_PLACE.includes(id)){
        if(used){ const q=Math.sin(gp*Math.PI); B.rotation.z=.4*q; B.position.y-=.08*q; R.rotation.z=.6; L.rotation.z=.5*q; } else { R.rotation.z=1.0; A.rotation.z=Math.sin(t*2.6)*.1; }
      } else if(H_BUFF.includes(id)){
        if(id==='jet'&&e.jetT>0){ const f=Math.sin(game.t*22)*.45; R.rotation.z=2.7+f; L.rotation.z=2.7-f; B.position.y+=.05; }
        else if(used){ const q=Math.sin(Math.min(1,gp*1.3)*Math.PI);
          if(id==='quake'){ R.rotation.z=2.8*q; L.rotation.z=2.8*q; B.position.y-=.12*q; B.rotation.z=.2*q; }
          else if(id==='siren'){ R.rotation.z=2.2*q; L.rotation.z=2.2*q; B.rotation.y=Math.sin(game.t*14)*.4*q; }
          else if(id==='dash'){ B.rotation.z=.45; R.rotation.z=-.4; L.rotation.z=-.4; }
          else { R.rotation.z=1.0+2.0*q; L.rotation.z=2.8*q; } }
        else { R.rotation.z=1.0; A.rotation.z=Math.sin(t*2.6)*.1; if(id==='dash'&&e.grace>.1){ B.rotation.z=.4; R.rotation.z=-.4; L.rotation.z=-.4; } }
      } else if(sw<=0){ R.rotation.z=1.0+Math.sin(t*2)*.05; A.rotation.z=Math.sin(t*2.3)*.1; if(id==='sword') A.rotation.x=Math.sin(t*1.7)*.15; }
  }
}

/* ---------- aperçu 3D du pirate dans le menu (rendu hors écran -> canvas 2D) ---------- */
let PV=null;
const _LUT=(()=>{ const a=new Uint8Array(256); for(let i=0;i<256;i++) a[i]=Math.round(255*Math.pow(i/255,1/2.2)); return a; })();
function initPreview(){
  const cv=document.getElementById('pvc'); if(!cv||!renderer) return;
  const W=cv.width, H=cv.height, sc=new THREE.Scene(); sc.background=new THREE.Color(0x2f6f95);
  sc.add(new THREE.HemisphereLight(0xffffff,0x6a8fa8,1.0)); const dl=new THREE.DirectionalLight(0xffffff,1.1); dl.position.set(2,4,3); sc.add(dl);
  const cam=new THREE.PerspectiveCamera(30,W/H,.1,20); cam.position.set(1.15,.62,1.75); cam.lookAt(0,.36,0); PV0=cam;
  PV={W,H,cv,ctx:cv.getContext('2d'),sc,cam,rt:new THREE.WebGLRenderTarget(W,H),buf:new Uint8Array(W*H*4),img:null,g:null,key:'',n:0};
  PV.img=PV.ctx.createImageData(W,H);
}
let PV0=null;
function renderPreview(t){
  if(!PV) return; PV.n++; if(PV.n%3) return;
  const look=lookOf(game.look), key=lookKey(look)+'|'+game.cls;
  if(key!==PV.key){ if(PV.g) PV.sc.remove(PV.g); PV.g=createPirate(TEAMS[0],{look}); PV.g.userData.heldMesh=null; PV.sc.add(PV.g); PV.key=key; if(SPR2D()){ PV.cam.position.set(1.7,1.0,2.6); PV.cam.lookAt(0,.6,0); } else { PV.cam.position.set(1.15,.62,1.75); PV.cam.lookAt(0,.36,0); } }
  const g=PV.g, u=g.userData; g.rotation.y=-.5+Math.sin(t*.8)*.7; u.body.position.y=.07+Math.abs(Math.sin(t*2.4))*.03; u.head.rotation.z=Math.sin(t*2.2)*.06; u.armR.rotation.z=1.0+Math.sin(t*2)*.05;
  if(u.spr) updateSprite({ang:0,z:0,x:0,y:0,ix:0,iy:0,stepPh:0,held:'sword',sword:1,bsel:2,team:0,flash:0,cloak:0,frozen:0,curse:0,squash:0,stickT:0},g);
  const ca=renderer.getClearAlpha(); renderer.setRenderTarget(PV.rt); renderer.render(PV.sc,PV.cam); renderer.setRenderTarget(null);
  renderer.readRenderTargetPixels(PV.rt,0,0,PV.W,PV.H,PV.buf);
  const W=PV.W,H=PV.H,src=PV.buf,dst=PV.img.data;
  for(let y=0;y<H;y++){ let si=(H-1-y)*W*4, di=y*W*4; for(let x=0;x<W;x++,si+=4,di+=4){ dst[di]=_LUT[src[si]]; dst[di+1]=_LUT[src[si+1]]; dst[di+2]=_LUT[src[si+2]]; dst[di+3]=255; } }
  PV.ctx.putImageData(PV.img,0,0);
}

const _heldAnimCube=heldAnim;
heldAnim=function(e,m){ _heldAnimCube(e,m); const u=m.userData; if(u.sh){ const air=Math.max(0,e.z-groundH(e)); u.sh.position.y=.01-(air*U)/(m.scale.y||1); u.sh.scale.setScalar(.42*(1-Math.min(.45,air*U*.25))); } };
