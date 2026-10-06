'use strict';
/* =====================  CANON D'EMBARQUEMENT : on s'y met (E), clic = tir, puis on plane quelques secondes  ===================== */
let cannons=[];
const NEW4=[{id:'launcher',n:'Canon d\'embarquement',ico:'🚀',col:'#fb923c'}];
for(const it of NEW4){ ITEMS.push(it); ITEMMAP[it.id]=it; }
Object.assign(TIPS2,{launcher:'Pose un canon : E pour t\'y glisser, clic pour être propulsé, puis plane plusieurs secondes !'});
SHOP.push(gadItem('launcher','Canon d\'embarquement','Pose un canon sur ton île. E : t\'y glisser · clic : être propulsé vers la cible puis planer ~3 s · E : ressortir. Aucun dégât à l\'atterrissage !',{silver:18},1,'Outils'));
SHOP.forEach(s=>SHOPMAP[s.id]=s);
const _ug4=useGadget2;
useGadget2=function(e,id,wx,wy,ax,ay){
  if(id==='launcher'){
    const tx=Math.floor(wx/T), ty=Math.floor(wy/T);
    if(fl(tx,ty)<=0||wl(tx,ty)>0||spawnerAt(tx,ty)||Math.hypot((tx+.5)*T-e.x,(ty+.5)*T-e.y)>3.7*T){ floatTxt(e.x,e.y-34,'Pose-le sur le sol près de toi','#fde68a',14); return false; }
    const mine=cannons.filter(c=>c.team===e.team); if(mine.length>=2){ const o=mine[0]; if(o.rider){ o.rider.riding=null; } cannons=cannons.filter(c=>c!==o); }
    cannons.push({x:(tx+.5)*T,y:(ty+.5)*T,ang:e.ang,team:e.team,owner:e,rider:null,cd:0,hp:12}); ring((tx+.5)*T,(ty+.5)*T,T*1.3,'#fb923c',.5,true); chunks((tx+.5)*T,(ty+.5)*T,'#7c4a21',6); floatTxt((tx+.5)*T,(ty+.5)*T-40,'E : monter','#fde68a',14); return true;
  }
  return _ug4(e,id,wx,wy,ax,ay);
};
function updateCannons(dt){
  for(const c of cannons){ c.cd=Math.max(0,c.cd-dt); if(c.rider&&(!c.rider.alive||!c.rider.riding||c.rider.riding.c!==c)){ c.rider=null; } if(c.rider) c.ang=c.rider.ang; }
}
function cannonInteract(e){
  if(e.riding&&e.riding.cannon){ const c=e.riding.c; c.rider=null; e.riding=null; e.vz=160; e.grace=.3; sfx('jump',e.x,e.y); return true; }
  let bc=null,bd=1.9*T; for(const c of cannons){ if(c.rider||c.team!==e.team) continue; const d=Math.hypot(c.x-e.x,c.y-e.y); if(d<bd){ bd=d; bc=c; } }
  if(!bc) return false;
  if(bc.cd>0){ floatTxt(bc.x,bc.y-40,'Rechargement…','#fde68a',14); return true; }
  bc.rider=e; e.riding={cannon:true,c:bc,x:bc.x,y:bc.y}; e.x=bc.x; e.y=bc.y; e.z=0; e.vx=e.vy=0; floatTxt(e.x,e.y-44,'CLIC : TIRER · E : SORTIR','#fde68a',14); sfx('place',e.x,e.y); return true;
}
function cannonFire(e,c,inp){
  if(c.cd>0) return; const dx=inp.wx-e.x, dy=inp.wy-e.y, d=Math.hypot(dx,dy)||1, a=Math.atan2(dy,dx), speed=Math.max(95,Math.min(210,d/2.6));
  c.cd=4; c.rider=null; e.riding=null; e.ang=a; c.ang=a;
  e.vz=520; e.glide=7; e.flight=3.3; e.fl0=.35; e.fvx=Math.cos(a)*speed; e.fvy=Math.sin(a)*speed; e.grace=.3; e.squash=.5;
  smoke(c.x,c.y,10,10,.9); burst(c.x,c.y,'#fb923c',24,280,.6,4); ring(c.x,c.y,T*1.8,'#f97316',.4,true); shake=Math.max(shake,e===player?10:4); sfx('boom',c.x,c.y); floatTxt(e.x,e.y-44,'PLANE !','#93c5fd',18);
}
const _updateEnt4=updateEnt;
updateEnt=function(e,dt){
  if(e.flight>0&&e.alive){ e.grace=Math.max(e.grace,.12); e.fl0-=dt; }
  _updateEnt4(e,dt);
  if(e.flight>0&&e.alive){ e.flight-=dt; moveEnt(e,(e.fvx+(e.ix||0)*60)*dt,(e.fvy+(e.iy||0)*60)*dt);
    if(Math.random()<dt*14) parts.push({x:e.x,y:e.y,z:e.z,vz:-20,vx:rnd(-12,12),vy:rnd(-12,12),life:.5,max:.5,col:'#e0f2fe',size:3});
    if((e.fl0<=0&&e.z<=groundH(e)+1&&e.vz<=0)||e.flight<=0){ e.flight=0; e.fvx=e.fvy=0; } }
};
const _boatInteract4=boatInteract;
boatInteract=function(e){ if(e.alive&&(e.riding&&e.riding.cannon)) return cannonInteract(e); if(!e.riding&&cannonNear(e)) return cannonInteract(e); return _boatInteract4(e); };
const cannonNear=e=>cannons.some(c=>!c.rider&&c.team===e.team&&Math.hypot(c.x-e.x,c.y-e.y)<1.9*T);
const _actBoat4=actBoat;
actBoat=function(){ const me=player; if(NETCLIENT&&me&&me.alive&&game.state==='play'&&(cannonNear(me)||(me.riding&&me.riding.cannon))){ netSend({t:'act',a:'boat'}); return true; } return _actBoat4(); };
const _updateBoats4=updateBoats;
updateBoats=function(dt){ _updateBoats4(dt); updateCannons(dt); };
const _res4=resetEvents; resetEvents=function(){ _res4(); cannons=[]; };
/* --- modèle 3D --- */
function createCannonM(c){
  const g=new THREE.Group(), B=GEO.box, tc=TEAMS[Math.max(0,c.team)].col;
  const base=new THREE.Mesh(mergeParts([{geo:B,pos:[0,.12,0],scale:[.9,.14,.8],color:'#6b4423'},{geo:B,pos:[0,.2,0],scale:[.94,.04,.84],color:tc},{geo:GEO.cyl,pos:[0,.16,.42],scale:[.28,.08,.28],rot:[Math.PI/2,0,0],color:'#2b2118'},{geo:GEO.cyl,pos:[0,.16,-.42],scale:[.28,.08,.28],rot:[Math.PI/2,0,0],color:'#2b2118'}]),new THREE.MeshStandardMaterial({vertexColors:true,flatShading:true,roughness:.8}));
  base.castShadow=true; g.add(base);
  const bar=new THREE.Group(); bar.position.y=.36; g.add(bar);
  const tube=new THREE.Mesh(mergeParts([{geo:GEO.cyl,pos:[.28,0,0],scale:[.28,.9,.28],rot:[0,0,Math.PI/2],color:'#3b3f4a'},{geo:GEO.cyl,pos:[.74,0,0],scale:[.34,.12,.34],rot:[0,0,Math.PI/2],color:'#1f2937'},{geo:GEO.sphere,pos:[-.2,0,0],scale:[.2,.2,.2],color:'#3b3f4a'}]),new THREE.MeshStandardMaterial({vertexColors:true,flatShading:true,roughness:.5,metalness:.3}));
  tube.castShadow=true; bar.add(tube); bar.rotation.z=.5; g.userData={bar}; return g;
}
function updateCannonM(c,m){ m.position.set(c.x*U,0,c.y*U); m.rotation.y=-c.ang; m.userData.bar.rotation.z=c.rider?.55:.45; }
H_BUFF.push('launcher');
