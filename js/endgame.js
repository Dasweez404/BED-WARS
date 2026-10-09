'use strict';
/* =====================  FIN DE PARTIE  =====================
   Pour que les parties ne s'éternisent pas (option « Fin de partie », par défaut : normale) :
   ⛈ 5:00  Tempête finale : des éclairs de plus en plus fréquents, qui frappent aussi les coffres
   🌊 6:00  Marée montante : à intervalles réguliers, une vague emporte tous les ponts et planchers posés
   🔴 7:00  La zone rétrécit : la mer avale la carte, tout coffre hors de la zone est détruit
   ⚔ 10:00  Arène finale : les équipages encore en lice sont téléportés avec leur coffre sur une île-arène qui s'érode */
const EG={sc:1,zc:[50,50],arena:false,arT:0,stT:0,tideN:0,tideWarn:false,zT:0,arCurR:9,arStep:0,ac:[11,11],on:false};
const EG_T={storm:300,tide:360,tideInt:45,zone:420,zoneDur:240,arena:600};
const egScale=()=>[0,1.5,1,.6][game.opts.endg===undefined?2:game.opts.endg|0]||0;
function zoneR(t){ if(!EG.sc||EG.arena) return Infinity; const t0=EG_T.zone*EG.sc, d=EG_T.zoneDur*EG.sc; if(t<t0) return Infinity; return 50+(7-50)*clamp((t-t0)/d,0,1); }
function egKillCore(td){ if(!td.coreAlive) return; const i=idx(td.bx,td.by); if(wallT[i]===CORE) damageTile(td.bx,td.by,1e6,null,0); else td.coreAlive=false; }
function egWipeTile(i){ floorT[i]=0; wallT[i]=0; hpF[i]=0; hpW[i]=0; ownF[i]=-1; ownW[i]=-1; }
function egStrike(x,y,coreTeam){
  ring(x,y,T*1.5,'#fde047',.9); ring(x,y,T*.8,'#fff',.7,true);
  delayed.push({t:1.3,fn:()=>{ bombs.push({x,y,tx:x,ty:y,fuse:.05,team:-1,owner:null,kind:'bomb',R:1.4*T,dm:4,bd:.6,bolt:true,h:0});
    if(coreTeam>=0&&TD[coreTeam].coreAlive) damageTile(TD[coreTeam].bx,TD[coreTeam].by,3,null,0); }});
}
function egStorm(dt){
  const t0=EG_T.storm*EG.sc; if(game.t<t0) return;
  EG.stT-=dt; if(EG.stT>0) return; const k=clamp((game.t-t0)/(240*EG.sc),0,1);
  const zn=game.t>=EG_T.zone*EG.sc&&!EG.arena; EG.stT=(5.5-3*k)*(zn?2.2:1)*(EG.arena?.9:1)*rnd(.8,1.4); // moins de bombardements, encore plus rares pendant la zone
  const alive=TD.filter(t=>t.coreAlive), pc=.1+.12*k;
  if(alive.length&&Math.random()<pc){ const td=alive[Math.floor(Math.random()*alive.length)]; egStrike((td.bx+.5)*T,(td.by+.5)*T,td.id); return; }
  const live=ents.filter(e=>e.alive&&!e.elim);
  if(live.length&&Math.random()<.35){ const o=live[Math.floor(Math.random()*live.length)], a=rnd(0,6.28), d=rnd(2.2,4.5)*T; egStrike(o.x+Math.cos(a)*d,o.y+Math.sin(a)*d,-1); return; } // tombe à côté, jamais pile sur toi
  if(EG.arena){ const a=rnd(0,6.28), r=rnd(0,EG.arCurR*.8); egStrike((EG.ac[0]+Math.cos(a)*r+.5)*T,(EG.ac[1]+Math.sin(a)*r+.5)*T,-1); return; }
  const q=islandTile(); if(q) egStrike((q[0]+.5)*T,(q[1]+.5)*T,-1);
}
function egTide(){
  if(EG.arena) return; const t0=EG_T.tide*EG.sc, iv=EG_T.tideInt*EG.sc; if(game.t<t0) return;
  const nextAt=t0+EG.tideN*iv;
  if(!EG.tideWarn&&game.t>nextAt-6){ EG.tideWarn=true; announce('🌊 UNE VAGUE APPROCHE !','#7dd3fc'); msg('La marée va emporter tous les ponts et planchers : reviens sur une île !','#7dd3fc'); sfx('splash',player.x,player.y); }
  if(game.t>=nextAt){ EG.tideN++; EG.tideWarn=false; let n=0;
    for(let i=0;i<floorT.length;i++){ if(floorT[i]>=2){ const x=(i%W+.5)*T, y=(Math.floor(i/W)+.5)*T; if(n++<90&&Math.random()<.5) burst(x,y,'#bae6fd',3,110,.5,3); floorT[i]=0; hpF[i]=0; ownF[i]=-1; if(wallT[i]&&wallT[i]!==CORE){ wallT[i]=0; hpW[i]=0; ownW[i]=-1; } } }
    ring(CX*T,CY*T,T*30,'#7dd3fc',1.2,true); ring(CX*T,CY*T,T*50,'#bae6fd',1.8); shake=Math.max(shake,8); sfx('boom',player.x,player.y); announce('🌊 LA VAGUE A EMPORTÉ LES PONTS','#7dd3fc'); }
}
function zoneK(t){ const t0=EG_T.zone*EG.sc, d=EG_T.zoneDur*EG.sc; return clamp((t-t0)/d,0,1); }
const zoneOut=(x,y,r)=>Math.hypot(x/T-.5-EG.zc[0],y/T-.5-EG.zc[1])>r;
function egZone(dt){ // la zone est la même pour tous (centrée sur la carte) : dehors, la vie baisse peu à peu et rien ne soigne
  const r=zoneR(game.t); if(!isFinite(r)){ for(const e of ents) e._zhp=undefined; return; } const k=zoneK(game.t), dps=.6+1.6*k;
  for(const e of ents){ if(!e.alive||e.elim){ e._zhp=undefined; continue; }
    if(!zoneOut(e.x,e.y,r)){ e._zhp=undefined; e.inZone=false; continue; }
    e.inZone=true; if(e._zhp!==undefined&&e.hp>e._zhp) e.hp=e._zhp; // pas de soin dans la zone
    e.zoneT=(e.zoneT||0)-dt; e.hp-=dps*dt; e.zFlash=(e.zFlash||0)-dt; if(e.zFlash<=0){ e.zFlash=.6; e.flash=.12; burst(e.x,e.y-e.z,'#f87171',3,70,.4,3); if(e===player) { floatTxt(e.x,e.y-34,'-'+dps.toFixed(1)+'/s','#f87171',13); game.hurtFx=Math.max(game.hurtFx||0,.25); } }
    if(e.hp<=0){ e.hp=0; e.zoneKill=true; die(e,null); e._zhp=undefined; } else e._zhp=e.hp; }
  EG.zT-=dt; if(EG.zT>0) return; EG.zT=.5;
  for(const td of TD){ if(!td.coreAlive) continue; if(Math.hypot(td.bx-EG.zc[0],td.by-EG.zc[1])>r){ const i=idx(td.bx,td.by); if(wallT[i]===CORE){ if(!td.zWarn){ td.zWarn=true; announce(`LE COFFRE DES ${td.name.toUpperCase()} EST HORS DE LA ZONE !`,td.light); } damageTile(td.bx,td.by,(.45+1.1*k)*.5*Math.max(1,BHP[CORE]/30),null,0); } } else td.zWarn=false; }
}
function egArena(){
  const alive=TD.filter(t=>t.coreAlive); EG.arena=true; EG.arT=game.t;
  if(alive.length<2) return; // un seul équipage en lice : la partie se termine d'elle-même
  const ax=EG.ac[0], ay=EG.ac[1]; island(ax,ay,9,9,5);
  const dirs=[[0,-1],[1,0],[0,1],[-1,0]], dist=[3,4,5,6];
  alive.sort((a,b)=>hpW[idx(b.bx,b.by)]-hpW[idx(a.bx,a.by)]); // le coffre le plus abîmé est le plus près du bord : il tombe en premier
  alive.forEach((td,k)=>{ const d=dirs[k], nx=ax+d[0]*(dist[k]+1), ny=ay+d[1]*(dist[k]+1), o=idx(td.bx,td.by), hp=hpW[o];
    wallT[o]=0; hpW[o]=0; ownW[o]=-1;
    const ni=idx(nx,ny); wallT[ni]=CORE; hpW[ni]=hp; ownW[ni]=td.id; floorT[ni]=1;
    td.bx=nx; td.by=ny; td.dir=[-d[0],-d[1]]; const p=[-td.dir[1],td.dir[0]];
    td.spawnTile=[nx+td.dir[0]*2,ny+td.dir[1]*2]; td.padTile=[nx+p[0]*2,ny+p[1]*2];
    const sp=spawners.find(s=>s.kind==='base'&&s.team===td.id); if(sp){ sp.x=td.padTile[0]; sp.y=td.padTile[1]; }
    for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++) if(Math.abs(dx)+Math.abs(dy)<=2&&floorT[idx(nx+dx,ny+dy)]) region[idx(nx+dx,ny+dy)]=td.id;
  });
  for(const td of alive) for(const m of td.members){ if(m.alive&&!m.elim){ const h=m.hp; spawnEnt(m); m.hp=Math.max(h,Math.min(maxhp(m),h+6)); } }
  EG.arCurR=9; EG.arStep=20;
  announce('⚔ ARÈNE FINALE !','#fde047'); msg('Les équipages encore en lice sont téléportés sur une île-arène qui s\'érode : le dernier coffre debout gagne.','#fde047');
  flashScreen('#fde047',.4); shake=Math.max(shake,14);
}
function egArenaErode(dt){ // érosion continue du bord de l'île-arène
  EG.arStep-=dt; if(EG.arStep>0) return; EG.arCurR=Math.max(2,EG.arCurR-dt*.11); EG.arT2=(EG.arT2||0)-dt; if(EG.arT2>0) return; EG.arT2=.3;
  const R=EG.arCurR, ax=EG.ac[0], ay=EG.ac[1];
  for(const td of TD) if(td.coreAlive&&Math.abs(td.bx-ax)+Math.abs(td.by-ay)>R){ announce(`LE COFFRE DES ${td.name.toUpperCase()} S'ENGLOUTIT`,td.light); egKillCore(td); }
  for(let dy=-12;dy<=12;dy++)for(let dx=-12;dx<=12;dx++){ const x=ax+dx,y=ay+dy; if(!inb(x,y)) continue; const i=idx(x,y); if((floorT[i]||wallT[i])&&Math.abs(dx)+Math.abs(dy)>R){ if(Math.random()<.4) burst((x+.5)*T,(y+.5)*T,'#e0f2fe',2,70,.5,3); egWipeTile(i); } }
}
{ const _n=newGame;
  newGame=function(){ _n(); EG.sc=egScale(); EG.on=EG.sc>0; EG.arena=false; EG.arT=0; EG.stT=0; EG.tideN=0; EG.tideWarn=false; EG.zT=0; EG.arCurR=9; EG.arStep=0;
    EG.zc=[CX,CY]; EG.ac=[11,11]; };
  const _e=updateEvents;
  updateEvents=function(dt){ _e(dt);
    if(!EG.on||game.state!=='play'||game.paused) return;
    egStorm(dt); egTide(); egZone(dt);
    if(!EG.arena&&game.t>=EG_T.arena*EG.sc) egArena();
    if(EG.arena) egArenaErode(dt);
  };
  const _nc=netCommon; netCommon=function(){ const c=_nc(); if(EG.on) c.eg=[Math.round(EG.sc*100),EG.zc[0],EG.zc[1],EG.arena?Math.round(EG.arT*10)/10:-1,EG.arCurR]; return c; };
  const _na=netApplySnap; netApplySnap=function(m){ _na(m); const g=m.eg; if(g){ EG.on=true; EG.sc=g[0]/100; EG.zc=[g[1],g[2]]; EG.arena=g[3]>=0; EG.arT=g[3]; EG.arCurR=g[4]; } else EG.on=false; };
}
/* ---------- HUD : prochain événement, cercle de la zone sur la mini-carte, bord de la zone dans le monde ---------- */
{ const _h=drawHud;
  drawHud=function(){ _h(); if(!EG.on||game.state!=='play'||!ctx||!player) return;
    const t=game.t, sc=EG.sc; let txt='', col='#fde68a';
    if(EG.arena){ txt=`⚔ Arène : l'île s'érode (rayon ${EG.arCurR.toFixed(1)})`; col='#fca5a5'; }
    else if(t<EG_T.storm*sc){ txt=`⛈ Tempête dans ${fmtT(EG_T.storm*sc-t)}`; }
    else if(t<EG_T.zone*sc){ const nx=EG_T.tide*sc+EG.tideN*EG_T.tideInt*sc; txt=t<EG_T.tide*sc?`🌊 Marée dans ${fmtT(EG_T.tide*sc-t)}`:`🌊 Vague dans ${fmtT(Math.max(0,nx-t))} · 🔴 Zone dans ${fmtT(EG_T.zone*sc-t)}`; col='#7dd3fc'; }
    else { const r=zoneR(t); txt=r>7.01?`🔴 La zone rétrécit (rayon ${Math.round(r)}) : dehors, la vie baisse et rien ne soigne · ⚔ Arène dans ${fmtT(Math.max(0,EG_T.arena*sc-t))}`:`⚔ Arène dans ${fmtT(Math.max(0,EG_T.arena*sc-t))}`; col='#fca5a5'; }
    ctx.save(); ctx.setTransform(DPR,0,0,DPR,0,0); ctx.textAlign='center'; ctx.font='bold 12px '+FONT; ctx.lineWidth=3; ctx.strokeStyle='rgba(10,20,40,.85)'; const y=(typeof TOUCH!=='undefined'&&TOUCH.on)?96:66; ctx.strokeText(txt,VW/2,y); ctx.fillStyle=col; ctx.fillText(txt,VW/2,y);
    const r=zoneR(t); if(isFinite(r)&&typeof miniSize==='function'){ const S=miniSize(), mx=VW-S-10, my=10; ctx.save(); ctx.beginPath(); ctx.rect(mx,my,S,S); ctx.clip(); ctx.strokeStyle='#f87171'; ctx.lineWidth=1.5; ctx.beginPath(); ctx.arc(mx+EG.zc[0]/W*S,my+EG.zc[1]/H*S,r/W*S,0,6.283); ctx.stroke(); ctx.restore(); }
    ctx.restore(); };
  const fmtT=s=>{ s=Math.max(0,Math.ceil(s)); return Math.floor(s/60)+':'+String(s%60).padStart(2,'0'); };
  const _r=render3d;
  render3d=function(dt){ _r(dt); if(!EG.on||game.state!=='play'||!player) return; const r=zoneR(game.t); if(!isFinite(r)) return;
    const px=player.x/T, py=player.y/T, d=Math.hypot(px-EG.zc[0],py-EG.zc[1]); if(Math.abs(d-r)>14||Math.random()>dt*40) return;
    const a=Math.atan2(py-EG.zc[1],px-EG.zc[0])+rnd(-.35,.35); parts.push({x:(EG.zc[0]+Math.cos(a)*r+.5)*T,y:(EG.zc[1]+Math.sin(a)*r+.5)*T,z:rnd(5,30),vx:0,vy:0,vz:rnd(20,60),life:.8,max:.8,col:'#f87171',size:5}); };
}

/* ---------- zone : voile rouge sur la mer hors-zone, mur lumineux, vignette et bots qui fuient ---------- */
const ZV={mesh:null,wall:null,u:null};
function zvBuild(){
  const u={uC:{value:new THREE.Vector2(CX+.5,CY+.5)},uR:{value:50},uT:{value:0}};
  ZV.u=u; ZV.mesh=new THREE.Mesh(new THREE.PlaneGeometry(500,500),new THREE.ShaderMaterial({uniforms:u,transparent:true,depthWrite:false,side:THREE.DoubleSide,
    vertexShader:'varying vec3 vP; void main(){ vec4 w=modelMatrix*vec4(position,1.); vP=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }',
    fragmentShader:'varying vec3 vP; uniform vec2 uC; uniform float uR; uniform float uT; void main(){ float d=distance(vP.xz,uC); float a=smoothstep(uR,uR+1.2,d)*(.2+.05*sin(uT*3.+d*.6)); gl_FragColor=vec4(.95,.15,.15,a); }'}));
  ZV.mesh.rotation.x=-Math.PI/2; ZV.mesh.position.set(CX+.5,.32,CY+.5); ZV.mesh.renderOrder=4; ZV.mesh.visible=false; scene.add(ZV.mesh);
  ZV.wall=new THREE.Mesh(new THREE.CylinderGeometry(1,1,1,128,1,true),new THREE.MeshBasicMaterial({color:0xff4a4a,transparent:true,opacity:.16,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending}));
  ZV.wall.position.set(CX+.5,3,CY+.5); ZV.wall.visible=false; scene.add(ZV.wall);
}
{ const _r=render3d;
  render3d=function(dt){
    if(renderer&&scene&&!ZV.mesh) zvBuild();
    if(ZV.mesh){ const r=(EG.on&&game.state==='play')?zoneR(game.t):Infinity, on=isFinite(r);
      ZV.mesh.visible=on; ZV.wall.visible=on; if(on){ ZV.u.uR.value=r; ZV.u.uT.value=game.t; ZV.u.uC.value.set(EG.zc[0]+.5,EG.zc[1]+.5); ZV.mesh.position.set(EG.zc[0]+.5,.32,EG.zc[1]+.5); ZV.wall.position.set(EG.zc[0]+.5,3,EG.zc[1]+.5); ZV.wall.scale.set(r,6,r); ZV.wall.material.opacity=.13+.05*Math.sin(game.t*3); } }
    _r(dt); };
  const _h=drawHud;
  drawHud=function(){ _h(); if(!EG.on||game.state!=='play'||!ctx||!player||!player.alive||!player.inZone) return; const k=zoneK(game.t), p=.5+.5*Math.sin(game.t*6);
    ctx.save(); ctx.setTransform(DPR,0,0,DPR,0,0); const g=ctx.createRadialGradient(VW/2,VH/2,Math.min(VW,VH)*.3,VW/2,VH/2,Math.max(VW,VH)*.7); g.addColorStop(0,'rgba(220,30,30,0)'); g.addColorStop(1,`rgba(220,30,30,${.28+.2*p*(.5+k)})`); ctx.fillStyle=g; ctx.fillRect(0,0,VW,VH);
    ctx.textAlign='center'; ctx.font='bold 15px '+FONT; ctx.lineWidth=4; ctx.strokeStyle='rgba(40,0,0,.9)'; const txt=`☠ HORS DE LA ZONE · −${(.6+1.6*k).toFixed(1)} PV/s · aucun soin possible`; ctx.strokeText(txt,VW/2,VH*.3); ctx.fillStyle="#fecaca"; ctx.fillText(txt,VW/2,VH*.3); ctx.textAlign='left'; ctx.restore(); };
  /* les bots rejoignent la zone dès qu'ils en sortent */
  const _bt=botThink;
  botThink=function(b,dt){ _bt(b,dt); if(!EG.on||!b.alive||b.frozen>0||game.tut) return; const r=zoneR(game.t); if(!isFinite(r)||!zoneOut(b.x,b.y,r-2)) return;
    if(steerSafe(b,(EG.zc[0]+.5)*T-b.x,(EG.zc[1]+.5)*T-b.y)){ if(Math.random()<dt*.3) jump(b); } };
}
