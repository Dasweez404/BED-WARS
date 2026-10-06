'use strict';
/* =====================  AMBIANCE : cycle jour/nuit, météo, sillages dans l'eau  ===================== */
const WX={seed:1,rain:0,storm:0,fog:0,snow:0,dayK:1,dusk:0,sunH:1,p:.22,bolt:0,boltT:6,thT:-1,cur:'clear',dark:0};
const DAY_LEN=360; // secondes pour un tour complet
const smooth=(a,b,x)=>{ const t=clamp((x-a)/(b-a),0,1); return t*t*(3-2*t); };
const wxHash=(a,b)=>{ let h=(Math.imul(a|0,374761393)+Math.imul(b|0,668265263))|0; h=Math.imul(h^(h>>>13),1274126177); return ((h^(h>>>16))>>>0)/4294967296; };
function mapDef(){ return MAPS[game.opts.map]||{}; }
function dayPhase(t){ const o=game.opts, m=mapDef(); const dn=o.dn===undefined?1:o.dn|0; if(dn===2) return .76; if(m.night&&dn!==0) return .7; if(dn===0) return .2; return (.06+t/DAY_LEN)%1; }
function wxTarget(t){
  const o=game.opts, m=mapDef(), mode=o.wth===undefined?1:o.wth|0; if(mode===0) return 'clear';
  if(m.wx==='storm') return 'storm';
  if(m.wx==='jungle'){ const sg=Math.floor(t/60); return wxHash(WX.seed,sg)<.5?'rain':'clear'; }
  const seg=Math.floor(t/70), r=wxHash(WX.seed,seg);
  if(m.wx==='snow') return seg<1||r<.3?'clear':'snow';
  if(seg<1) return 'clear';
  if(mode===2) return r<.12?'clear':r<.4?'rain':r<.55?'fog':'storm';
  return r<.5?'clear':r<.72?'rain':r<.85?'fog':'storm';
}
const WX_NAME={clear:'',rain:'Pluie',storm:'Orage',fog:'Brouillard',snow:'Neige'};
/* ---------- état météo / lumière (appelé chaque image) ---------- */
function wxUpdate(dt){
  const t=game.state==='menu'?game.t+40:game.t, p=dayPhase(t); WX.p=p; WX.sunH=Math.sin(p*6.2832);
  WX.dayK=smooth(-.14,.32,WX.sunH); WX.dusk=clamp(1-Math.abs(WX.sunH)/.34,0,1);
  const cur=wxTarget(t); WX.cur=cur; const k=Math.min(1,dt*.45);
  WX.rain+=((cur==='rain'||cur==='storm'?1:0)-WX.rain)*k; WX.storm+=((cur==='storm'?1:0)-WX.storm)*k; WX.fog+=((cur==='fog'?1:0)-WX.fog)*k; WX.snow+=((cur==='snow'?1:0)-WX.snow)*k;
  WX.dark=Math.max(WX.rain*.28,WX.storm*.55,WX.fog*.2,WX.snow*.18);
  WX.bolt=Math.max(0,WX.bolt-dt*3.2);
  if(WX.storm>.55&&game.state!=='menu'){ WX.boltT-=dt; if(WX.boltT<=0){ WX.boltT=rnd(4,10); WX.bolt=1; flashScreen('#dbeafe',.3); WX.thT=rnd(.25,1.5); if(typeof JUICE!=='undefined') JUICE.kick(.12); } }
  if(WX.thT>=0){ WX.thT-=dt; if(WX.thT<0){ WX.thT=-1; if(typeof MUS!=='undefined') MUS.thunder(); } }
}
/* ---------- ciel dégradé ---------- */
const SKY={day:['#3f8fe0','#8cc8f2','#d9eefb','#f6efe0'],dusk:['#3a3f8f','#c0607a','#ff9a5c','#ffd9a0'],night:['#04061a','#0a1432','#122448','#1d3358'],gray:['#59636d','#7b8790','#98a3ab','#b3bcc2'],snow:['#8a9bb0','#aebccb','#cdd8e2','#e6edf3']};
let skyCv=null,skyCtx=null,skyTex=null; const _c1=new THREE.Color(),_c2=new THREE.Color(),_mid=new THREE.Color(),_sea=new THREE.Color();
function skyColors(){
  const out=[], gk=Math.max(WX.rain*.55,WX.storm*.8,WX.fog*.7), sk=WX.snow*.8;
  for(let i=0;i<4;i++){
    _c1.set(SKY.night[i]).lerp(_c2.set(SKY.day[i]),WX.dayK); _c1.lerp(_c2.set(SKY.dusk[i]),WX.dusk*.8);
    if(gk>0){ _c2.set(SKY.gray[i]).multiplyScalar(.22+.78*WX.dayK); _c1.lerp(_c2,gk*(1)); }
    if(sk>0){ _c2.set(SKY.snow[i]).multiplyScalar(.3+.7*WX.dayK); _c1.lerp(_c2,sk); }
    out.push(_c1.clone());
  }
  return out;
}
function skyApply(frame){
  if(!scene) return;
  if(!skyTex){ skyCv=document.createElement('canvas'); skyCv.width=4; skyCv.height=256; skyCtx=skyCv.getContext('2d'); skyTex=new THREE.CanvasTexture(skyCv); skyTex.needsUpdate=true; scene.background=skyTex; }
  const cols=skyColors(); _mid.copy(cols[2]);
  if(frame%5===0){ const g=skyCtx.createLinearGradient(0,0,0,256); [0,.5,.78,1].forEach((s,i)=>g.addColorStop(s,'#'+cols[i].getHexString())); skyCtx.fillStyle=g; skyCtx.fillRect(0,0,4,256); skyTex.needsUpdate=true; }
}
/* ---------- halos nocturnes (coffres, pirates) ---------- */
let haloTex=null, haloCores=[], haloEnt=new Map(), haloGrp=null;
function haloMake(col,size){
  if(!haloTex){ const c=document.createElement('canvas'); c.width=c.height=128; const g=c.getContext('2d'), gr=g.createRadialGradient(64,64,2,64,64,62); gr.addColorStop(0,'rgba(255,255,255,.95)'); gr.addColorStop(.35,'rgba(255,255,255,.35)'); gr.addColorStop(1,'rgba(255,255,255,0)'); g.fillStyle=gr; g.fillRect(0,0,128,128); haloTex=new THREE.CanvasTexture(c); }
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:haloTex,color:col,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false})); sp.scale.setScalar(size); sp.renderOrder=8; haloGrp.add(sp); return sp;
}
function haloUpdate(night){
  if(!scene) return; if(!haloGrp){ haloGrp=new THREE.Group(); scene.add(haloGrp); }
  const on=night>.08&&game.state!=='menu'; haloGrp.visible=on; if(!on) return;
  if(haloCores.length!==TD.length||haloCores._g!==TD){ for(const s of haloCores) haloGrp.remove(s); haloCores=TD.map(t=>{ const s=haloMake(TEAMS[t.id].light,6.5); s.position.set(t.bx+.5,1.1,t.by+.5); return s; }); haloCores._g=TD; }
  const fl=.85+.15*Math.sin(game.t*7+1.3);
  TD.forEach((t,i)=>{ const s=haloCores[i]; s.material.opacity=night*.8*fl*(t.coreAlive?1:.25); });
  for(const e of ents){ let s=haloEnt.get(e); if(!s){ s=haloMake(TEAMS[e.team].light,2.8); haloEnt.set(e,s); }
    s.visible=e.alive; if(e.alive){ s.position.set(e.x*U,.6+e.z*U,e.y*U); s.material.opacity=night*.55; } }
  if(haloEnt.size>ents.length+6){ for(const [e,s] of haloEnt) if(!ents.includes(e)){ haloGrp.remove(s); haloEnt.delete(e); } }
}
/* ---------- pluie / neige ---------- */
let rainLines=null, snowPts=null, wxGrp=null; const NR=900, NS=600;
let rainPos=null, rainV=null, snowPos=null, snowPh=null;
function wxBuild(){
  wxGrp=new THREE.Group(); scene.add(wxGrp);
  rainPos=new Float32Array(NR*6); rainV=new Float32Array(NR*4);
  for(let i=0;i<NR;i++){ rainV[i*4]=rnd(-24,24); rainV[i*4+1]=rnd(0,24); rainV[i*4+2]=rnd(-20,20); rainV[i*4+3]=rnd(22,34); }
  const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(rainPos,3)); g.setDrawRange(0,0);
  rainLines=new THREE.LineSegments(g,new THREE.LineBasicMaterial({color:0xcfe3ff,transparent:true,opacity:.42,depthWrite:false,fog:false})); rainLines.frustumCulled=false; rainLines.renderOrder=9; wxGrp.add(rainLines);
  snowPos=new Float32Array(NS*3); snowPh=new Float32Array(NS*3);
  for(let i=0;i<NS;i++){ snowPh[i*3]=rnd(-24,24); snowPh[i*3+1]=rnd(0,22); snowPh[i*3+2]=rnd(-20,20); }
  const c=document.createElement('canvas'); c.width=c.height=32; const x=c.getContext('2d'), gr=x.createRadialGradient(16,16,1,16,16,15); gr.addColorStop(0,'rgba(255,255,255,1)'); gr.addColorStop(1,'rgba(255,255,255,0)'); x.fillStyle=gr; x.fillRect(0,0,32,32);
  const g2=new THREE.BufferGeometry(); g2.setAttribute('position',new THREE.BufferAttribute(snowPos,3)); g2.setDrawRange(0,0);
  snowPts=new THREE.Points(g2,new THREE.PointsMaterial({size:.34,map:new THREE.CanvasTexture(c),transparent:true,depthWrite:false,opacity:.95,fog:false})); snowPts.frustumCulled=false; snowPts.renderOrder=9; wxGrp.add(snowPts);
}
function wxParticles(dt){
  if(!scene) return; if(!wxGrp) wxBuild();
  const qs=[.4,.7,1][Q.level]||1, cx=cam3.x*U, cz=cam3.y*U; wxGrp.position.set(cx,0,cz);
  const rn=Math.floor(NR*clamp(WX.rain*.55+WX.storm*.45,0,1)*qs), wind=2+WX.storm*7;
  rainLines.visible=rn>0; if(rn>0){ rainLines.geometry.setDrawRange(0,rn*2);
    for(let i=0;i<rn;i++){ const o=i*4; rainV[o+1]-=rainV[o+3]*dt; rainV[o]-=wind*dt; if(rainV[o+1]<0){ rainV[o]=rnd(-24,24); rainV[o+1]=rnd(18,24); rainV[o+2]=rnd(-20,20); }
      const x=rainV[o],y=rainV[o+1],z=rainV[o+2], b=i*6; rainPos[b]=x; rainPos[b+1]=y; rainPos[b+2]=z; rainPos[b+3]=x+wind*.035; rainPos[b+4]=y+.8; rainPos[b+5]=z; }
    rainLines.geometry.attributes.position.needsUpdate=true; rainLines.material.opacity=.3+.2*WX.storm; }
  const sn=Math.floor(NS*clamp(WX.snow,0,1)*qs); snowPts.visible=sn>0; if(sn>0){ snowPts.geometry.setDrawRange(0,sn);
    for(let i=0;i<sn;i++){ const o=i*3; snowPh[o+1]-=(2.1+(i%5)*.35)*dt; if(snowPh[o+1]<0){ snowPh[o]=rnd(-24,24); snowPh[o+1]=rnd(18,23); snowPh[o+2]=rnd(-20,20); }
      snowPos[o]=snowPh[o]+Math.sin(game.t*.9+i)*.5; snowPos[o+1]=snowPh[o+1]; snowPos[o+2]=snowPh[o+2]+Math.cos(game.t*.7+i*1.3)*.4; }
    snowPts.geometry.attributes.position.needsUpdate=true; }
}
/* ---------- sillages et rides (shader instancié) ---------- */
const RP={max:200,list:[],mesh:null,pos:null,dat:null};
function rippleBuild(){
  const base=new THREE.PlaneGeometry(1,1); base.rotateX(-Math.PI/2);
  const g=new THREE.InstancedBufferGeometry(); g.index=base.index; g.setAttribute('position',base.attributes.position); g.setAttribute('uv',base.attributes.uv);
  RP.pos=new Float32Array(RP.max*3); RP.dat=new Float32Array(RP.max*4);
  g.setAttribute('aPos',new THREE.InstancedBufferAttribute(RP.pos,3).setUsage(THREE.DynamicDrawUsage)); g.setAttribute('aD',new THREE.InstancedBufferAttribute(RP.dat,4).setUsage(THREE.DynamicDrawUsage)); g.instanceCount=0;
  const m=new THREE.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{uCol:{value:new THREE.Color('#eaf9ff')}},
    vertexShader:'attribute vec3 aPos; attribute vec4 aD; varying vec2 vUv; varying vec4 vD; void main(){ vUv=uv; vD=aD; float c=cos(aD.z), s=sin(aD.z); vec3 p=position*aD.x; p=vec3(p.x*c-p.z*s,0.,p.x*s+p.z*c); gl_Position=projectionMatrix*modelViewMatrix*vec4(p+aPos,1.); }',
    fragmentShader:'uniform vec3 uCol; varying vec2 vUv; varying vec4 vD; void main(){ vec2 q=(vUv-.5)*2.; float d=length(q); float a=0.; if(vD.w<.5){ a=smoothstep(.62,.8,d)*(1.-smoothstep(.86,1.,d)); } else if(vD.w<1.5){ a=(1.-smoothstep(.1,1.,d)); a*=a; } else { float k=abs(q.x); a=(1.-smoothstep(.15,1.,k))*(1.-smoothstep(.0,.9,abs(q.y)*1.6)); } gl_FragColor=vec4(uCol,a*vD.y); }'});
  RP.mesh=new THREE.Mesh(g,m); RP.mesh.frustumCulled=false; RP.mesh.position.y=-1.1; RP.mesh.renderOrder=2; scene.add(RP.mesh);
}
/** ride sur l'eau. kind : 0 anneau, 1 écume, 2 trait de sillage. */
function ripple(x,y,kind,size,life,alpha,rot,grow){
  if(RP.list.length>=RP.max) RP.list.shift();
  RP.list.push({x:x*U,y:y*U,k:kind,s0:size,s1:size*(grow||1.9),life:life,a:alpha===undefined?.6:alpha,rot:rot||0,t:0});
}
function rippleUpdate(dt){
  if(!scene) return; if(!RP.mesh) rippleBuild(); let n=0;
  for(const r of RP.list){ r.t+=dt; }
  RP.list=RP.list.filter(r=>r.t<r.life);
  for(const r of RP.list){ if(n>=RP.max) break; const k=r.t/r.life, e=1-(1-k)*(1-k), s=r.s0+(r.s1-r.s0)*e, a=r.a*Math.pow(1-k,1.2)*Math.min(1,k*8+.2);
    RP.pos[n*3]=r.x; RP.pos[n*3+1]=0; RP.pos[n*3+2]=r.y; RP.dat[n*4]=s; RP.dat[n*4+1]=a; RP.dat[n*4+2]=r.rot; RP.dat[n*4+3]=r.k; n++; }
  const g=RP.mesh.geometry; g.instanceCount=n; g.attributes.aPos.needsUpdate=true; g.attributes.aD.needsUpdate=true;
}
let wakeAcc=0;
function wakeEmit(dt){
  wakeAcc+=dt; const tick=wakeAcc>.07; if(tick) wakeAcc=0;
  const cx=cam3.x, cy=cam3.y, R=34*T;
  if(tick){
    for(const b of boats){ if(Math.hypot(b.x-cx,b.y-cy)>R) continue; const lx=b._lx===undefined?b.x:b._lx, ly=b._ly===undefined?b.y:b._ly, sp=Math.hypot(b.x-lx,b.y-ly)/.07; b._lx=b.x; b._ly=b.y;
      if(sp>14){ const a=b.ang===undefined?Math.atan2(b.y-ly,b.x-lx):b.ang, bx=b.x-Math.cos(a)*T*.55, by=b.y-Math.sin(a)*T*.55;
        ripple(bx,by,1,.9+Math.min(.5,sp/160),.9,.5,0,2.0);
        if(Math.random()<.5){ for(const sd of [-1,1]) ripple(b.x-Math.cos(a)*T*.2+Math.cos(a+1.57)*sd*T*.45,b.y-Math.sin(a)*T*.2+Math.sin(a+1.57)*sd*T*.45,2,1.5,.7,.35,-a+sd*.5,1.5); } }
      else if(Math.random()<.12) ripple(b.x+rnd(-8,8),b.y+rnd(-8,8),0,1.0,1.4,.3,0,2.2); }
    for(const s of sharks){ if(Math.hypot(s.x-cx,s.y-cy)>R) continue; ripple(s.x-Math.cos(s.ang)*T*.4,s.y-Math.sin(s.ang)*T*.4,1,.8,.8,.45,0,2); if(Math.random()<.4) ripple(s.x,s.y,2,1.6,.6,.4,-s.ang,1.4); if(s.bite>0) ripple(s.x,s.y,0,1.4,.8,.8,0,2.6); }
    for(const t of traps) if(t.kind==='kraken'&&Math.random()<.4) ripple(t.x,t.y,0,1.2,.9,.5,0,2.4);
    for(const e of ents){ if(!e.alive||e.z>8||e.riding) continue; if(Math.hypot(e.x-cx,e.y-cy)>R) continue; const mv=Math.hypot(e.ix||0,e.iy||0); if(mv<.2) continue;
      const tx=Math.floor(e.x/T), ty=Math.floor(e.y/T); if(fl(tx,ty)>1||(fl(tx,ty)===1&&wl(tx,ty)===0&&region[idx(tx,ty)]===-1)){ if(Math.random()<.2) ripple(e.x+rnd(-4,4),e.y+rnd(4,12),0,.55,.8,.28,0,2.2); } }
  }
  const rr=WX.rain*34+WX.storm*22; if(rr>1&&Math.random()<rr*dt*.9){ const x=cx+rnd(-14*T,14*T), y=cy+rnd(-11*T,11*T); if(fl(Math.floor(x/T),Math.floor(y/T))===0) ripple(x,y,0,.32,.55,.5,0,2.4); }
}
{ // splash : grosses rides (hôte et invités)
  const _r=FX0.ring; FX0.ring=function(x,y,r,col,t,fill){ if(col==='#bfe9ff'&&fill&&r<T*2) { ripple(x,y,0,1.5,1.1,.85,0,2.8); ripple(x,y,1,1.1,.7,.6,0,1.8); } return _r(x,y,r,col,t,fill); }; }
/* ---------- application de la lumière ---------- */
const COL={sunDay:new THREE.Color('#fff0d8'),sunDusk:new THREE.Color('#ff9a5c'),sunNight:new THREE.Color('#8fa8ff'),hDay:new THREE.Color('#eaf6ff'),hNight:new THREE.Color('#3a4a8a'),gDay:new THREE.Color('#3f6f98'),gNight:new THREE.Color('#0e1a36'),
  seaDay:new THREE.Color('#3aa6cf'),seaNight:new THREE.Color('#0c2a50'),seaDusk:new THREE.Color('#3b7fa6'),seaIce:new THREE.Color('#9ed8ec'),seaGray:new THREE.Color('#4d7a92')};
let ambFrame=0;
function ambApply(){
  const dk=WX.dayK, ni=1-dk, dusk=WX.dusk; ambFrame++;
  skyApply(ambFrame);
  const hk=(.4+.6*dk)*(1-WX.dark*.42), sk=(.2+.8*dk)*(1-WX.dark*.6);
  hemi.intensity*=hk; hemi.intensity+=WX.bolt*1.1; sun.intensity*=sk;
  hemi.color.copy(COL.hNight).lerp(COL.hDay,dk); hemi.groundColor.copy(COL.gNight).lerp(COL.gDay,dk);
  sun.color.copy(COL.sunNight).lerp(COL.sunDay,dk).lerp(COL.sunDusk,dusk*.75);
  // brouillard : couleur du ciel, distance réduite
  scene.fog.color.copy(_mid).multiplyScalar(1-.4*EV.dark);
  scene.fog.far=Math.max(34,scene.fog.far-WX.fog*62-WX.storm*28-WX.rain*14-WX.snow*18-ni*18); scene.fog.near=Math.max(8,Math.min(scene.fog.near,scene.fog.far-20)-WX.fog*30-WX.storm*10);
  if(sea){ _sea.copy(COL.seaNight).lerp(COL.seaDay,dk).lerp(COL.seaDusk,dusk*.45).lerp(COL.seaGray,Math.max(WX.storm,WX.rain*.6)*.55*(.3+.7*dk)); if(iceOn()) _sea.lerp(COL.seaIce,.6*(.45+.55*dk)); sea.material.color.copy(_sea); }
  haloUpdate(clamp((ni-.15)/.85,0,1));
}
function ambCamera(){
  // la lumière tourne avec le soleil (ou la lune)
  if(game.state==='menu'&&false) return; const cx=cam3.x*U, cz=cam3.y*U, th=WX.p*6.2832;
  let lx=Math.cos(th), ly=Math.sin(th); if(ly<-.04){ lx=-lx; ly=-ly; } // la nuit, la lune prend le relais
  const el=Math.max(.24,ly); sun.position.set(cx-lx*32,8+el*26,cz+12); sun.target.position.set(cx,0,cz);
}
function nightSparkles(dt){
  const ni=1-WX.dayK; if(ni<.25||parts.length>260||Q.level<1) return;
  if(Math.random()<dt*10*ni){ const x=cam3.x+rnd(-16*T,16*T), y=cam3.y+rnd(-12*T,12*T); if(fl(Math.floor(x/T),Math.floor(y/T))===0) parts.push({x,y,z:-34,vx:0,vy:0,vz:0,life:.9,max:.9,col:'#cfe3ff',size:2.2}); }
  if(Math.random()<dt*2.2*ni){ const il=ISLANDS[Math.floor(Math.random()*ISLANDS.length)]; if(il&&!il.ship){ const x=(il.x+rnd(-il.r,il.r))*T, y=(il.y+rnd(-il.r,il.r))*T; if(fl(Math.floor(x/T),Math.floor(y/T))>0) parts.push({x,y,z:rnd(10,40),vx:rnd(-8,8),vy:rnd(-8,8),vz:rnd(-5,8),life:2.4,max:2.4,col:'#fde68a',size:2.4,smoke:true}); } }
}
/* ---------- branchements ---------- */
{ const _env=envTick; envTick=function(){ _env(); if(game.state!=='menu'||true) ambApply(); }; }
{ const _cam=updateCamera; updateCamera=function(dt){ _cam(dt); ambCamera(); }; }
{ const _r3=render3d;
  render3d=function(dt){ if(renderer&&scene){ wxUpdate(dt); if(game.state!=='menu'||true){ wxParticles(dt); rippleUpdate(dt); if(game.state!=='menu') { wakeEmit(dt); nightSparkles(dt); } } } _r3(dt); };
}
{ const _ng=newGame; newGame=function(){ _ng(); if(!NETCLIENT) WX.seed=(Math.random()*1e9)|0; WX.rain=WX.storm=WX.fog=WX.snow=0; RP.list.length=0; }; }
{ const _e=updateEvents; updateEvents=function(dt){ _e(dt); if(WX.rain>.5&&game.state==='play') for(const e of ents) if(e.alive&&e.burn>0) e.burn=Math.max(0,e.burn-dt*3); }; }
/* réseau : la graine météo voyage avec les instantanés */
{ const _nc=netCommon; netCommon=function(){ const c=_nc(); c.wxs=WX.seed; return c; }; const _na=netApplySnap; netApplySnap=function(m){ if(m.wxs!==undefined&&m.wxs!==WX.seed) WX.seed=m.wxs; _na(m); }; }
/* ---------- indicateur jour/nuit + météo ---------- */
{ const _dh=drawHud;
  drawHud=function(){ _dh(); if(game.state==='menu'||!ctx) return;
    const ico=WX.sunH>.12?(WX.dusk>.6?'🌅':'☀️'):WX.sunH>-.12?'🌇':'🌙', w=WX_NAME[WX.cur]; const txt=ico+(w?' · '+({rain:'🌧️',storm:'⛈️',fog:'🌫️',snow:'❄️'})[WX.cur]+' '+w:'');
    ctx.save(); ctx.font='bold 12px '+FONT; ctx.textAlign='right'; ctx.lineWidth=3; ctx.strokeStyle='rgba(10,30,50,.8)'; ctx.fillStyle='rgba(255,236,190,.95)'; ctx.strokeText(txt,VW-14,206); ctx.fillText(txt,VW-14,206); ctx.restore();
  };
}

/* ---------- volcans décoratifs (carte Jungle) ---------- */
let volG=null;
function volBuild(){
  if(volG){ scene.remove(volG); volG=null; } const m=mapDef(); if(!m.volcano||!scene) return;
  volG=new THREE.Group(); volG.userData.v=[];
  for(const [x,y] of m.relay){ const g=new THREE.Group(); const cone=new THREE.Mesh(GEO.cone,new THREE.MeshStandardMaterial({color:0x4a3a32,flatShading:true})); cone.scale.set(1.7,2.4,1.7); cone.position.y=1.2; g.add(cone);
    const lava=new THREE.Mesh(GEO.sphere0,new THREE.MeshStandardMaterial({color:0xff5a1f,emissive:0xff4a10,emissiveIntensity:1.2,flatShading:true})); lava.scale.set(.62,.28,.62); lava.position.y=2.35; g.add(lava);
    g.position.set(x+.5,0,y+.5); volG.add(g); volG.userData.v.push({x:(x+.5)*T,y:(y+.5)*T,lava}); }
  scene.add(volG);
}
{ const _on=onNewGame; onNewGame=function(){ _on(); try{ volBuild(); }catch(e){} }; }
{ const _r=render3d; render3d=function(dt){ _r(dt); if(!volG||game.state==='menu') return; const er=EV.cur&&EV.cur.id==='volcano';
    for(const v of volG.userData.v){ v.lava.material.emissiveIntensity=1+.6*Math.sin(game.t*3+v.x)+(er?1.2:0);
      if(parts.length<320&&Math.random()<dt*(er?14:2.2)){ parts.push({x:v.x,y:v.y,z:84,vx:rnd(-30,30),vy:rnd(-30,30),vz:er?rnd(120,260):rnd(40,90),life:er?1:1.6,max:er?1:1.6,col:Math.random()<.6?'#fb923c':'#6b7280',size:er?4:5,smoke:!er}); } } }; }
