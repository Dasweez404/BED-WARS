'use strict';
/* =====================  MER VIVANTE : baleines, dauphins, bancs de poissons, bouées et phares  =====================
   Décor purement visuel (non synchronisé : chaque joueur voit sa propre faune). */
const SEAL={g:null,whales:[],dolphins:[],schools:[],buoys:[],lights:[],fishInst:null,fishN:0,t:0};
const swimBad=(x,y)=>fl(Math.floor(x/T),Math.floor(y/T))>0||x<5*T||y<5*T||x>(W-5)*T||y>(H-5)*T;
function waterSpot(){ for(let k=0;k<200;k++){ const x=rnd(8,W-8)*T, y=rnd(8,H-8)*T; let ok=true; for(let dy=-2;dy<=2&&ok;dy++)for(let dx=-2;dx<=2;dx++) if(fl(Math.floor(x/T)+dx,Math.floor(y/T)+dy)>0){ ok=false; break; } if(ok) return [x,y]; } return [CX*T+14*T,CY*T]; }
function swim(o,dt,sp,look){
  const nx=o.x+Math.cos(o.a)*sp*dt, ny=o.y+Math.sin(o.a)*sp*dt, lx=o.x+Math.cos(o.a)*look, ly=o.y+Math.sin(o.a)*look;
  if(swimBad(lx,ly)||swimBad(nx,ny)){ o.a+=o.turn*dt*2.6; o.stuck=(o.stuck||0)+dt; if(o.stuck>3){ const p=waterSpot(); o.x=p[0]; o.y=p[1]; o.stuck=0; } }
  else { o.stuck=0; o.x=nx; o.y=ny; o.a+=Math.sin(game.t*.35+o.seed)*dt*.22; }
}
const stdM=(c,o)=>new THREE.MeshStandardMaterial(Object.assign({color:c,flatShading:true,roughness:.8},o||{}));
function mkWhale(){
  const g=new THREE.Group(), body=new THREE.Mesh(GEO.sphere,stdM(0x5b7c99)); body.scale.set(2.6,.95,1.05); g.add(body);
  const belly=new THREE.Mesh(GEO.sphere,stdM(0xdbe7f0)); belly.scale.set(2.3,.55,.95); belly.position.y=-.35; g.add(belly);
  const head=new THREE.Mesh(GEO.sphere,stdM(0x51718d)); head.scale.set(1,.85,.95); head.position.set(1.9,.05,0); g.add(head);
  const eye=new THREE.Mesh(GEO.sphere0,new THREE.MeshBasicMaterial({color:0x111827})); eye.scale.setScalar(.09); eye.position.set(2.2,.2,.62); g.add(eye); const eye2=eye.clone(); eye2.position.z=-.62; g.add(eye2);
  const tail=new THREE.Group(); tail.position.set(-2.5,0,0); g.add(tail); const t1=new THREE.Mesh(GEO.sphere,stdM(0x4d6d89)); t1.scale.set(1.1,.45,.5); t1.position.x=-.9; tail.add(t1);
  const fluke=new THREE.Group(); fluke.position.x=-1.9; tail.add(fluke); for(const s of [-1,1]){ const f=new THREE.Mesh(GEO.sphere0,stdM(0x4d6d89)); f.scale.set(.5,.08,.85); f.position.z=s*.7; f.rotation.y=s*.4; fluke.add(f); }
  const fin=new THREE.Mesh(GEO.cone,stdM(0x4d6d89)); fin.scale.set(.3,.6,.12); fin.position.set(-.8,.95,0); fin.rotation.z=-.5; g.add(fin);
  g.scale.setScalar(1.15); g.userData={tail,fluke}; return g;
}
function mkDolphin(){
  const g=new THREE.Group(), body=new THREE.Mesh(GEO.sphere,stdM(0x7aa2c0)); body.scale.set(.85,.28,.28); g.add(body);
  const belly=new THREE.Mesh(GEO.sphere,stdM(0xe5eef5)); belly.scale.set(.75,.18,.26); belly.position.y=-.08; g.add(belly);
  const beak=new THREE.Mesh(GEO.cone,stdM(0x7aa2c0)); beak.scale.set(.08,.3,.08); beak.rotation.z=-Math.PI/2; beak.position.x=.95; g.add(beak);
  const fin=new THREE.Mesh(GEO.cone,stdM(0x5f89a8)); fin.scale.set(.12,.3,.05); fin.position.set(-.05,.32,0); fin.rotation.z=-.35; g.add(fin);
  const tail=new THREE.Group(); tail.position.x=-.8; g.add(tail); const fl2=new THREE.Mesh(GEO.sphere0,stdM(0x5f89a8)); fl2.scale.set(.1,.04,.3); fl2.position.x=-.18; tail.add(fl2);
  g.userData={tail}; return g;
}
function mkBuoy(){
  const g=new THREE.Group(); const b=new THREE.Mesh(GEO.cyl,stdM(0xdc2626)); b.scale.set(.32,.45,.32); b.position.y=.1; g.add(b); const w=new THREE.Mesh(GEO.cyl,stdM(0xf8fafc)); w.scale.set(.33,.16,.33); w.position.y=.25; g.add(w);
  const top=new THREE.Mesh(GEO.cyl,stdM(0x374151)); top.scale.set(.05,.4,.05); top.position.y=.75; g.add(top); const lamp=new THREE.Mesh(GEO.sphere0,new THREE.MeshBasicMaterial({color:0xfde68a})); lamp.scale.setScalar(.12); lamp.position.y=1.15; g.add(lamp); g.userData={lamp};
  return g;
}
function mkLighthouse(){
  const g=new THREE.Group(); const t=new THREE.Mesh(GEO.cyl,stdM(0xf8fafc)); t.scale.set(.5,1.6,.5); t.position.y=1.7; g.add(t);
  for(const y of [1.1,2.3]){ const r=new THREE.Mesh(GEO.cyl,stdM(0xdc2626)); r.scale.set(.52,.28,.52); r.position.y=y; g.add(r); }
  const top=new THREE.Mesh(GEO.cyl,stdM(0x374151)); top.scale.set(.58,.12,.58); top.position.y=3.35; g.add(top);
  const lamp=new THREE.Mesh(GEO.sphere0,new THREE.MeshBasicMaterial({color:0xfde68a})); lamp.scale.setScalar(.3); lamp.position.y=3.65; g.add(lamp);
  const roof=new THREE.Mesh(GEO.cone,stdM(0xdc2626)); roof.scale.set(.5,.5,.5); roof.position.y=4.2; g.add(roof);
  const beam=new THREE.Mesh(GEO.cone,new THREE.MeshBasicMaterial({color:0xfef3c7,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide})); beam.scale.set(1.2,7,1.2); beam.rotation.z=-Math.PI/2; beam.position.set(3.5,3.65,0); const pv=new THREE.Group(); pv.position.y=0; pv.add(beam); pv.position.set(0,0,0); g.add(pv);
  g.userData={lamp,pv,beam}; return g;
}
function seaBuild(){
  if(!scene) return; if(SEAL.g){ scene.remove(SEAL.g); SEAL.g=null; }
  SEAL.g=new THREE.Group(); scene.add(SEAL.g); SEAL.whales=[]; SEAL.dolphins=[]; SEAL.schools=[]; SEAL.buoys=[]; SEAL.lights=[]; SEAL.t=0;
  const rn=prng3(77+(game.opts.map||'').length*13);
  for(let i=0;i<2;i++){ const p=waterSpot(), m=mkWhale(); SEAL.g.add(m); SEAL.whales.push({m,x:p[0],y:p[1],a:rnd(0,6.28),turn:Math.random()<.5?1:-1,seed:rn()*10,spout:rnd(6,14),ph:0}); }
  for(let i=0;i<2;i++){ const p=waterSpot(), a0=rnd(0,6.28); for(let k=0;k<(i===0?2:1);k++){ const m=mkDolphin(); SEAL.g.add(m); SEAL.dolphins.push({m,x:p[0]+rnd(-30,30),y:p[1]+rnd(-30,30),a:a0+rnd(-.2,.2),turn:Math.random()<.5?1:-1,seed:rn()*10,jump:rnd(3,9),jt:-1,pod:i}); } }
  // bancs de poissons (instanciés)
  const fg=new THREE.ConeGeometry(.5,1.4,4); fg.rotateZ(-Math.PI/2); const NF=44; SEAL.fishInst=new THREE.InstancedMesh(fg,new THREE.MeshBasicMaterial({color:0x1b6f8a,transparent:true,opacity:.75,depthWrite:false}),NF,); SEAL.fishInst.frustumCulled=false; SEAL.fishInst.count=NF; SEAL.g.add(SEAL.fishInst);
  for(let i=0;i<4;i++){ const p=waterSpot(); SEAL.schools.push({x:p[0],y:p[1],a:rnd(0,6.28),turn:Math.random()<.5?1:-1,seed:rn()*10,n:11,fish:Array.from({length:11},()=>({ox:rnd(-1,1),oy:rnd(-1,1),ph:rnd(0,6.28)}))}); }
  // bouées près des îles de départ
  for(const td of TD){ for(const s of [-1,1]){ const d=td.dir, px=-d[1], py=d[0]; for(let r=10;r<=14;r++){ const x=td.bx+d[0]*r*.2+px*s*r, y=td.by+d[1]*r*.2+py*s*r; if(fl(Math.round(x),Math.round(y))===0&&fl(Math.round(x)+1,Math.round(y))===0&&fl(Math.round(x),Math.round(y)+1)===0&&inb(Math.round(x),Math.round(y))){ const m=mkBuoy(); m.position.set(x+.5,-1.1,y+.5); SEAL.g.add(m); SEAL.buoys.push({m,ph:rn()*6.28,x:(x+.5)*T,y:(y+.5)*T}); break; } } } }
  // phares sur les îlots de diamants
  const mp=MAPS[game.opts.map]||MAPS.classic; for(const [x,y] of mp.dia){ const m=mkLighthouse(); m.position.set(x-2+.5,.1,y-1+.5); SEAL.g.add(m); SEAL.lights.push({m,ph:rn()*6.28}); }
}
function seaFrame(dt){
  if(!SEAL.g||game.state==='menu'&&false) return; SEAL.t+=dt; const t=SEAL.t, night=1-WX.dayK, cx=cam3.x, cy=cam3.y, q=Q.level;
  for(const w of SEAL.whales){ swim(w,dt,26,5*T); w.ph+=dt; const m=w.m, dep=-1.05+Math.sin(w.ph*.8+w.seed)*.12; m.position.set(w.x*U,dep,w.y*U); m.rotation.y=-w.a; m.rotation.z=Math.sin(w.ph*.8+w.seed)*.04; m.userData.tail.rotation.z=Math.sin(w.ph*1.6)*.16; m.userData.fluke.rotation.z=Math.sin(w.ph*1.6-.8)*.2;
    m.visible=Math.hypot(w.x-cx,w.y-cy)<42*T; w.spout-=dt; if(w.spout<=0){ w.spout=rnd(11,20); if(m.visible){ const hx=w.x+Math.cos(w.a)*1.8*T, hy=w.y+Math.sin(w.a)*1.8*T; ring(hx,hy,T*1.5,'#ffffff',.9,false); ripple(hx,hy,0,1.6,1.3,.7,0,2.6); for(let k=0;k<(q>=1?18:8);k++) parts.push({x:hx+rnd(-6,6),y:hy+rnd(-6,6),z:-30,vx:rnd(-18,18),vy:rnd(-18,18),vz:rnd(140,230),life:1.1,max:1.1,col:Math.random()<.5?'#e0f2fe':'#ffffff',size:4}); } } }
  if(q>=1) for(const d of SEAL.dolphins){ const m=d.m, pod=SEAL.dolphins.find(o=>o.pod===d.pod); if(d.jt<0){ swim(d,dt,62,3*T); d.jump-=dt; if(d.jump<=0){ d.jt=0; d.jump=rnd(5,11); d.js=Math.hypot(d.x-cx,d.y-cy)<34*T; if(d.js){ ripple(d.x,d.y,0,.9,.9,.7,0,2.4); } } }
    else { d.jt+=dt; const P=d.jt/.95; if(P>=1){ d.jt=-1; if(d.js){ ripple(d.x,d.y,0,1.2,1,.8,0,2.6); ripple(d.x,d.y,1,.9,.7,.6,0,2); burst(d.x,d.y,'#e0f2fe',10,150,.6,3); } } else { d.x+=Math.cos(d.a)*78*dt; d.y+=Math.sin(d.a)*78*dt; if(swimBad(d.x,d.y)){ d.a+=Math.PI*.5; d.x-=Math.cos(d.a)*20*dt; } } }
    const P=d.jt<0?0:clamp(d.jt/.95,0,1), h=d.jt<0?-.95:-.95+Math.sin(P*Math.PI)*1.9; m.position.set(d.x*U,h+Math.sin(t*3+d.seed)*.03,d.y*U); m.rotation.y=-d.a; m.rotation.z=d.jt<0?0:Math.cos(P*Math.PI)*.9; m.userData.tail.rotation.z=Math.sin(t*9+d.seed)*.35; m.visible=Math.hypot(d.x-cx,d.y-cy)<36*T; }
  // poissons
  if(SEAL.fishInst&&q>=1){ let n=0; const mm=m4, ms=sc3; for(const s of SEAL.schools){ swim(s,dt,34,3*T); s.a+=Math.sin(t*.6+s.seed)*dt*.4; const near=Math.hypot(s.x-cx,s.y-cy)<40*T; if(!near) continue;
      s.fish.forEach((f,i)=>{ if(n>=44) return; const fx=s.x+Math.cos(t*1.3+f.ph)*f.ox*30+Math.cos(s.a)*i*3, fy=s.y+Math.sin(t*1.1+f.ph)*f.oy*30+Math.sin(s.a)*i*3; if(swimBad(fx,fy)) return; const ang=s.a+Math.sin(t*3+f.ph)*.35; qd.setFromAxisAngle(AXY,-ang); mm.compose(v3.set(fx*U,-1.09,fy*U),qd,ms.set(.14,.14,.14)); SEAL.fishInst.setMatrixAt(n++,mm); }); }
    SEAL.fishInst.count=n; SEAL.fishInst.instanceMatrix.needsUpdate=true; SEAL.fishInst.visible=n>0; }
  for(const b of SEAL.buoys){ const m=b.m; m.position.y=-1.1+Math.sin(t*1.6+b.ph)*.06; m.rotation.z=Math.sin(t*1.2+b.ph)*.12; m.rotation.x=Math.cos(t*1.0+b.ph)*.1; const on=night>.25&&Math.floor(t*1.1+b.ph)%2===0; m.userData.lamp.material.color.set(on?0xffe08a:0x6b6b4a); m.userData.lamp.scale.setScalar(on?.2:.12); m.visible=Math.hypot(b.x-cx,b.y-cy)<40*T; }
  for(const l of SEAL.lights){ const u=l.m.userData; u.pv.rotation.y=t*.9+l.ph; u.beam.material.opacity=Math.max(0,night-.2)*.15; u.lamp.material.color.set(night>.25?0xfff2b0:0xb8a86a); u.lamp.scale.setScalar(night>.25?.42:.3); }
}
{ const _on=onNewGame; onNewGame=function(){ _on(); try{ seaBuild(); }catch(e){ console.error(e); } }; }
{ const _r=render3d; render3d=function(dt){ if(renderer&&scene&&SEAL.g) seaFrame(Math.min(dt,.1)); _r(dt); }; }
