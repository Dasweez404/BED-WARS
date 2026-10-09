'use strict';
/* =====================  REJEU DES ÉLIMINATIONS (cercle à gauche)  =====================
   On garde les 3 dernières secondes de positions ; à chaque élimination, le bourreau et la victime (vrais modèles de pirates)
   rejouent la scène sous un angle cinématique : caméra orbitale, ralenti final, chute, étincelles, bandeau et compteur. */
const RPL={hist:[],acc:0,cur:null,dur:4,gp:{},fx:null};
function rplPirate(team,look){ const k=team+'|'+JSON.stringify(look||0); if(RPL.gp[k]) return RPL.gp[k];
  const g=createPirate(TEAMS[team],{look}); g.visible=false; scene.add(g);
  const tr=[]; for(let i=0;i<8;i++){ const t=new THREE.Mesh(GEO.sphere,new THREE.MeshBasicMaterial({color:TEAMS[team].col,transparent:true,opacity:.5})); t.scale.setScalar(.08); t.visible=false; scene.add(t); tr.push(t); }
  return RPL.gp[k]={g,tr}; }
function rplFx(){ if(RPL.fx) return RPL.fx; const sp=[]; for(let i=0;i<10;i++){ const m=new THREE.Mesh(GEO.sphere,new THREE.MeshBasicMaterial({color:0xffe08a,transparent:true,opacity:.9})); m.visible=false; scene.add(m); sp.push(m); }
  const ring=new THREE.Mesh(new THREE.RingGeometry(.8,1,40),new THREE.MeshBasicMaterial({color:0xff5a5a,transparent:true,opacity:.9,side:THREE.DoubleSide,depthWrite:false})); ring.rotation.x=-Math.PI/2; ring.visible=false; scene.add(ring);
  const line=new THREE.Mesh(GEO.box,new THREE.MeshBasicMaterial({color:0xfff1a8,transparent:true,opacity:.8})); line.visible=false; scene.add(line);
  return RPL.fx={sp,ring,line}; }
function rplSample(tr,t){ const f=Math.max(0,Math.min(tr.length-1,t/.1)), i=Math.floor(f), j=Math.min(tr.length-1,i+1), k=f-i, a=tr[i],b=tr[j]; return [a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k,a[2]+(b[2]-a[2])*k]; }
{ const _u=update;
  update=function(dt){
    if(game.state==='play'&&!game.paused&&!NETCLIENT){
      RPL.acc+=dt; if(RPL.acc>=.1){ RPL.acc=0; RPL.hist.push(ents.map(e=>[e.x,e.y,e.z||0,e.alive])); if(RPL.hist.length>34) RPL.hist.shift(); }
      if(RPL.cur){ RPL.cur.t+=dt; if(RPL.cur.t>RPL.dur) RPL.cur=null; }
    }
    _u(dt); };
  const _d=die;
  die=function(e,by,sea){ const was=e.alive; const h=RPL.hist.slice(-30), vi=ents.indexOf(e), killer=by&&by!==e?by:null, ki=killer?ents.indexOf(killer):-1, held=killer&&killer.held;
    _d(e,by,sea);
    if(!was||e.alive||NETCLIENT||game.tut||sea||!killer||vi<0||ki<0||h.length<6) return;
    const mine=e===player||killer===player; if(RPL.cur&&(!mine||RPL.cur.mine)) return;
    const tr=i=>h.map(s=>s[i]?[s[i][0],s[i][1],s[i][2]]:[e.x,e.y,0]); const v=tr(vi), k=tr(ki); v.push([e.x,e.y,e.z||0]); k.push([killer.x,killer.y,killer.z||0]);
    const path=(v.length-1)*.1, dur=Math.max(1.8,path+.2);
    RPL.cur={t:0,v,k,vt:e.team,kt:killer.team,vl:e.look,kl:killer.look,vn:e.name,kn:killer.name,mine,path,dur,ico:(held&&ITEMMAP[held]&&ITEMMAP[held].ico)||'⚔️',ang0:Math.random()*6.283}; RPL.dur=dur+1; };
}
const RPV=BPIP.addView({id:'rpl',css:'left:10px;top:300px;',border:'#fb7185',
  active:()=>!!RPL.cur,
  pre:()=>{ const c=RPL.cur; if(!c) return; const p=Math.min(1,c.t/c.dur), tt=c.path*(1-Math.pow(1-p,1.5)), end=c.t>=c.dur-.02, ee=Math.max(0,c.t-c.dur);
    const pk=rplSample(c.k,tt), pv=rplSample(c.v,tt), hold=ee>0&&!!c._pv; c._pk=pk; c._pv=pv; c._p=p; c._end=end; c._ee=ee;
    const dx=pv[0]-pk[0], dy=pv[1]-pk[1], face=Math.atan2(dy,dx);
    const GK=rplPirate(c.kt,c.kl), GV=rplPirate(c.vt,c.vl), F=rplFx(); c._GK=GK; c._GV=GV;
    const bob=a=>Math.abs(Math.sin(c.t*11+a))*.05*(end?0:1);
    GK.g.visible=true; GK.g.position.set(pk[0]*U,(pk[2]||0)*U+bob(0),pk[1]*U); GK.g.rotation.set(0,-face,0); const lunge=end?Math.min(1,ee*6):0; GK.g.position.x+=Math.cos(face)*.18*lunge; GK.g.position.z+=Math.sin(face)*.18*lunge; GK.g.rotation.z=-.25*lunge;
    const fall=end?Math.min(1,ee/.45):0; GV.g.visible=true; GV.g.position.set(pv[0]*U,(pv[2]||0)*U+bob(2)-fall*.05,pv[1]*U); GV.g.rotation.set(0,-(face+Math.PI),0); GV.g.rotation.z=-fall*1.45; GV.g.position.x-=Math.cos(face)*.5*fall*.5; GV.g.position.z-=Math.sin(face)*.5*fall*.5;
    for(const [G,tr,col] of [[GK,c.k,c.kt],[GV,c.v,c.vt]]) for(let i=0;i<G.tr.length;i++){ const q=rplSample(tr,Math.max(0,tt-(i+1)*.11)); G.tr[i].visible=!end&&tt>.2; G.tr[i].position.set(q[0]*U,(q[2]||0)*U+.45,q[1]*U); G.tr[i].material.opacity=.55-i*.06; G.tr[i].scale.setScalar(.085-i*.007); }
    F.ring.visible=end; F.line.visible=end&&ee<.35; F.sp.forEach(m=>m.visible=end);
    if(end){ const q=Math.min(1,ee/.9); F.ring.position.set(pv[0]*U,.06,pv[1]*U); F.ring.scale.setScalar(.3+q*1.8); F.ring.material.opacity=.9*(1-q);
      F.sp.forEach((m,i)=>{ const a=i*.628+c.ang0, r=.2+q*1.1; m.position.set(pv[0]*U+Math.cos(a)*r,.45+q*.9-q*q*1.1,pv[1]*U+Math.sin(a)*r); m.scale.setScalar(Math.max(.001,.07*(1-q))); m.material.opacity=1-q; });
      const L=Math.hypot(dx,dy)*U||.01; F.line.position.set((pk[0]+pv[0])/2*U,.75,(pk[1]+pv[1])/2*U); F.line.rotation.set(0,-face,0); F.line.scale.set(L,.05,.05); } },
  place:cam=>{ const c=RPL.cur; if(!c||!c._pv) return; const pv=c._pv, pk=c._pk, p=c._p, mx=(pv[0]+pk[0])/2*U, mz=(pv[1]+pk[1])/2*U, vx=pv[0]*U, vz=pv[1]*U;
    const L=Math.hypot(pv[0]-pk[0],pv[1]-pk[1])*U, R=Math.min(8,Math.max(2.5,L*.7+1.9))*(1-.25*p), a=c.ang0+c.t*.55+(c._end?0:0), lk=Math.min(1,p*1.2);
    const tx=mx+(vx-mx)*lk, tz=mz+(vz-mz)*lk; cam.position.set(tx+Math.cos(a)*R,1.6+R*.34,tz+Math.sin(a)*R); cam.lookAt(tx,.65,tz); },
  post:(cx,cv)=>{ const G=RPL.cur&&RPL.cur._GK; for(const g of Object.values(RPL.gp)){ g.g.visible=false; g.tr.forEach(t=>t.visible=false); } if(RPL.fx){ RPL.fx.ring.visible=false; RPL.fx.line.visible=false; RPL.fx.sp.forEach(m=>m.visible=false); }
    const c=RPL.cur; if(!c) return; const W=cv.width, h=W/2, kc=TEAMS[c.kt].light, vc=TEAMS[c.vt].light; cv.style.borderColor=TEAMS[c.kt].col;
    cx.save(); cx.textAlign='center';
    const vg=cx.createRadialGradient(h,h,W*.3,h,h,W*.72); vg.addColorStop(0,'rgba(0,0,0,0)'); vg.addColorStop(1,'rgba(0,0,0,.62)'); cx.fillStyle=vg; cx.fillRect(0,0,W,W);
    cx.fillStyle='rgba(0,0,0,.55)'; cx.fillRect(0,0,W,42); cx.fillRect(0,W-48,W,48);
    const pulse=.55+.45*Math.sin(c.t*7); cx.fillStyle='rgba(255,70,70,'+pulse+')'; cx.beginPath(); cx.arc(h-52,26,7,0,6.283); cx.fill();
    cx.font='bold 21px system-ui,sans-serif'; cx.fillStyle='#fff'; cx.fillText('REJEU',h+4,33);
    cx.font='bold 16px system-ui,sans-serif'; const kn=c.kn.slice(0,9), vn=c.vn.slice(0,9), w1=cx.measureText(kn).width, w2=cx.measureText(vn).width, ic=28, tot=w1+w2+ic+16, x0=h-tot/2, y=W-20;
    cx.textAlign='left'; cx.fillStyle=kc; cx.fillText(kn,x0,y); cx.font='20px system-ui,sans-serif'; cx.fillText(c.ico,x0+w1+6,y+2); cx.font='bold 16px system-ui,sans-serif'; cx.fillStyle=c.mine&&c.vn===player.name?'#fca5a5':vc; cx.fillText(vn,x0+w1+ic+12,y);
    cx.textAlign='center'; cx.lineWidth=7; cx.lineCap='round'; cx.strokeStyle='rgba(0,0,0,.45)'; cx.beginPath(); cx.arc(h,h,h-6,0,6.283); cx.stroke(); cx.strokeStyle=kc; cx.beginPath(); cx.arc(h,h,h-6,-Math.PI/2,-Math.PI/2+6.283*Math.min(1,c.t/RPL.dur)); cx.stroke();
    if(c._end){ const q=Math.min(1,c._ee/.25), s=1+(1-q)*.8+Math.sin(c._ee*14)*.03; cx.save(); cx.translate(h,h-20); cx.scale(s,s); cx.rotate(-.1); cx.font='900 54px system-ui,sans-serif'; cx.lineWidth=7; cx.strokeStyle='#4a0d0d'; cx.strokeText('K.O.',0,0); cx.fillStyle='#ff5a5a'; cx.globalAlpha=Math.min(1,q*1.5); cx.fillText('K.O.',0,0); cx.restore(); }
    cx.restore(); }
});
RPV.cam.fov=36; RPV.cam.updateProjectionMatrix();
{ const _n=newGame; newGame=function(){ _n(); RPL.hist=[]; RPL.cur=null; for(const g of Object.values(RPL.gp)){ scene.remove(g.g); g.tr.forEach(t=>scene.remove(t)); } RPL.gp={}; }; }
