'use strict';
/* =====================  RAGDOLL  =====================
   À sa mort, le pirate est projeté par le coup, fait des galipettes, rebondit, et ses bras / sa tête ballottent comme des pendules.
   Purement visuel (aucun impact sur la simulation) : chaque client le déclenche en voyant une entité passer de vivante à morte. */
const RAG={list:[],prev:new WeakMap(),max:10,G:-26};
function ragGround(x,y){ const tx=Math.floor(x/T), ty=Math.floor(y/T); if(tx<0||ty<0||tx>=W||ty>=H||fl(tx,ty)<=0) return -Infinity; const t=wallTop(tx,ty); return (t>0?t:0)*U; }
function ragSpawn(e){
  if(RAG.list.length>=RAG.max){ const o=RAG.list.shift(); scene.remove(o.g); }
  const g=createPirate(TEAMS[e.team],{look:e.look,cls:e.cls}), u=g.userData; scene.add(g);
  const sp=Math.hypot(e.vx||0,e.vy||0)*U; // direction de projection : toujours vers l'ARRIÈRE du pirate
  const dirx=sp>.2?(e.vx*U)/sp:-Math.cos(e.ang||0), dirz=sp>.2?(e.vy*U)/sp:-Math.sin(e.ang||0), k=Math.min(1,10/Math.max(sp,.001));
  const vx=(e.vx||0)*U*k+dirx*2.5+(Math.random()-.5)*1.2, vz=(e.vy||0)*U*k+dirz*2.5+(Math.random()-.5)*1.2, vy=5.2+Math.min(4,sp*.25)+Math.random()*2.2;
  const faceA=Math.atan2(dirz,dirx)+Math.PI; // il regarde à l'opposé de son déplacement
  g.position.set(e.x*U,(e.z||0)*U+.35,e.y*U); g.rotation.set(0,-faceA,0); g.userData.sz=1;
  const ax=new THREE.Vector3(dirz,0,-dirx).normalize(), spin=4+Math.random()*2.5; // bascule vers l'arrière, jamais vers l'avant
  const o={g,u,vx,vy,vz,faceYaw:-faceA,av:ax.multiplyScalar(spin),q:new THREE.Quaternion().setFromEuler(g.rotation),t:0,still:0,bounces:0,
    limbs:[{p:u.armR,th:1.2,w:(Math.random()-.5)*14,k:26,c:2.2,lim:2.6,axis:'z'},{p:u.armL,th:-1.2,w:(Math.random()-.5)*14,k:26,c:2.2,lim:2.6,axis:'z'},{p:u.head,th:.3,w:(Math.random()-.5)*10,k:40,c:3.2,lim:.9,axis:'z'},{p:u.head,th:0,w:(Math.random()-.5)*8,k:40,c:3.2,lim:.7,axis:'x'}]};
  for(const q of u.eyes) q.scale.set(1.15,.2,1.15); // yeux écrasés : K.O.
  if(u.sh) u.sh.visible=false; if(u.bubble) u.bubble.visible=false; if(u.ice) u.ice.visible=false;
  RAG.list.push(o);
}
function ragStep(dt){
  const eu=new THREE.Euler(), dq=new THREE.Quaternion(), ax=new THREE.Vector3();
  for(let i=RAG.list.length-1;i>=0;i--){ const o=RAG.list[i], g=o.g; o.t+=dt;
    if(o.t>6.2){ scene.remove(g); RAG.list.splice(i,1); continue; }
    if(o.t>5.4){ const s=Math.max(.001,(6.2-o.t)/.8); g.scale.setScalar(o.u.base*s); }
    const gh=ragGround(g.position.x*T,g.position.z*T), R=.3, p=g.position;
    o.vy+=RAG.G*dt; p.x+=o.vx*dt; p.y+=o.vy*dt; p.z+=o.vz*dt;
    if(gh>-Infinity&&p.y<gh+R&&o.vy<0){ p.y=gh+R;
      if(Math.abs(o.vy)>1.6){ o.bounces++; o.vy=-o.vy*.42; o.vx*=.72; o.vz*=.72; o.av.multiplyScalar(.55); for(const l of o.limbs) l.w+=(Math.random()-.5)*18; if(o.bounces<=2&&typeof sfx==='function') sfx('hit',p.x*T,p.z*T); }
      else { o.vy=0; o.vx*=Math.max(0,1-dt*5); o.vz*=Math.max(0,1-dt*5); o.av.multiplyScalar(Math.max(0,1-dt*6)); o.still+=dt; } }
    if(gh===-Infinity&&p.y<-3){ scene.remove(g); RAG.list.splice(i,1); continue; }
    // rotation du corps
    const w=o.av.length(); if(w>.01){ ax.copy(o.av).divideScalar(w); dq.setFromAxisAngle(ax,w*dt); o.q.premultiply(dq).normalize(); }
    if(o.still>.25){ // posé : on s'allonge sur le dos / le ventre
      const lying=new THREE.Quaternion().setFromEuler(new THREE.Euler(0,o.faceYaw,Math.PI/2,'YXZ')); // toujours couché sur le dos
      o.q.slerp(lying,Math.min(1,dt*6)); p.y+=((gh>-Infinity?gh:0)+.16-p.y)*Math.min(1,dt*10); }
    g.quaternion.copy(o.q);
    // membres : pendules amortis
    const calm=o.still>.25?.4:1;
    for(const l of o.limbs){ if(!l.p) continue; const acc=-l.k*l.th-l.c*l.w+(o.vy>0?-3:3)*Math.sign(l.th||1)*calm; l.w+=acc*dt; l.th=Math.max(-l.lim,Math.min(l.lim,l.th+l.w*dt)); l.p.rotation[l.axis]=l.th; }
  }
}
{ const _r=render3d;
  render3d=function(dt){
    if(renderer&&game.state==='play'&&!game.paused&&typeof createPirate==='function'){
      for(const e of ents){ const was=RAG.prev.get(e); if(was===true&&!e.alive&&!(e.voidT>.05)&&ragGround(e.x,e.y)>-Infinity&&!game.replay) ragSpawn(e); RAG.prev.set(e,!!e.alive); } }
    if(RAG.list.length) ragStep(Math.min(.05,dt||.016));
    _r(dt); };
  const _n=newGame; newGame=function(){ _n(); for(const o of RAG.list) scene.remove(o.g); RAG.list=[]; RAG.prev=new WeakMap(); };
}
