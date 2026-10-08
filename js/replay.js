'use strict';
/* =====================  REJEU DES ÉLIMINATIONS (cercle à droite)  =====================
   On garde les 3 dernières secondes de positions ; à chaque élimination, deux fantômes (bourreau et victime)
   rejouent la scène sous un autre angle dans un aperçu rond. Les éliminations qui te concernent sont prioritaires. */
const RPL={hist:[],acc:0,cur:null,dur:3.2,ghosts:null};
function rplGhosts(){
  if(RPL.ghosts) return RPL.ghosts;
  const mk=()=>{ const g=new THREE.Group(), m=new THREE.MeshStandardMaterial({color:0xffffff,emissive:0x222222,roughness:.5,transparent:true,opacity:.92});
    const b=new THREE.Mesh(GEO.cyl,m); b.scale.set(.32,.8,.32); b.position.y=.5; g.add(b); const h=new THREE.Mesh(GEO.sphere,m); h.scale.setScalar(.3); h.position.y=1.1; g.add(h);
    const tr=[]; for(let i=0;i<8;i++){ const t=new THREE.Mesh(GEO.sphere,new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.5})); t.scale.setScalar(.09); scene.add(t); tr.push(t); }
    g.visible=false; scene.add(g); return {g,m,tr}; };
  RPL.ghosts={k:mk(),v:mk(),flash:new THREE.Mesh(GEO.ring,new THREE.MeshBasicMaterial({color:0xff4444,transparent:true,opacity:.9,side:THREE.DoubleSide}))};
  RPL.ghosts.flash.visible=false; scene.add(RPL.ghosts.flash); return RPL.ghosts;
}
function rplSample(tr,t){ // position interpolée sur une trace [[x,y,z],…] (échantillons toutes les .1 s, t en s depuis le début)
  const f=Math.max(0,Math.min(tr.length-1,t/.1)), i=Math.floor(f), j=Math.min(tr.length-1,i+1), k=f-i, a=tr[i],b=tr[j];
  return [a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k,a[2]+(b[2]-a[2])*k]; }
{ const _u=update;
  update=function(dt){
    if(game.state==='play'&&!game.paused&&!NETCLIENT){
      RPL.acc+=dt; if(RPL.acc>=.1){ RPL.acc=0; RPL.hist.push(ents.map(e=>[e.x,e.y,e.z||0,e.alive])); if(RPL.hist.length>34) RPL.hist.shift(); }
      if(RPL.cur){ RPL.cur.t+=dt; if(RPL.cur.t>RPL.dur) RPL.cur=null; }
    }
    _u(dt); };
  const _d=die;
  die=function(e,by,sea){ const was=e.alive; const h=RPL.hist.slice(-30), vi=ents.indexOf(e), killer=by&&by!==e?by:null, ki=killer?ents.indexOf(killer):-1;
    _d(e,by,sea);
    if(!was||e.alive||NETCLIENT||game.tut||sea||!killer||vi<0||ki<0||h.length<6) return;
    const mine=e===player||killer===player; if(RPL.cur&&!mine&&!RPL.cur.mine) return; if(RPL.cur&&RPL.cur.mine&&!mine) return;
    const tr=i=>{ const l=h.map(s=>s[i]&&s[i][3]!==undefined?[s[i][0],s[i][1],s[i][2]]:[e.x,e.y,0]); return l; };
    const v=tr(vi), k=tr(ki); v.push([e.x,e.y,e.z||0]); k.push([killer.x,killer.y,killer.z||0]);
    RPL.cur={t:0,v,k,vt:e.team,kt:killer.team,vn:e.name,kn:killer.name,mine,dur:Math.max(1.6,(v.length-1)*.1)}; RPL.dur=RPL.cur.dur+.6; };
}
BPIP.addView({id:'rpl',css:'left:10px;top:300px;',border:'#fb7185',
  active:()=>!!RPL.cur,
  pre:()=>{ const G=rplGhosts(), c=RPL.cur; if(!c) return; const t=Math.min(c.t,c.dur);
    const set=(o,tr,team)=>{ const p=rplSample(tr,t); o.g.visible=true; o.g.position.set(p[0]*U,(p[2]||0)*U+.02,p[1]*U); const col=new THREE.Color(TEAMS[team].col); o.m.color.copy(col); o.m.emissive.copy(col).multiplyScalar(.35);
      for(let i=0;i<o.tr.length;i++){ const q=rplSample(tr,Math.max(0,t-(i+1)*.12)); o.tr[i].visible=true; o.tr[i].position.set(q[0]*U,(q[2]||0)*U+.5,q[1]*U); o.tr[i].material.color.copy(col); o.tr[i].material.opacity=.5-i*.055; } return p; };
    const pk=set(G.k,c.k,c.kt), pv=set(G.v,c.v,c.vt); c._pk=pk; c._pv=pv;
    G.k.g.scale.setScalar(1.1); const end=c.t>=c.dur-.05; G.v.g.visible=!end||Math.floor(c.t*10)%2===0;
    G.flash.visible=end; if(end){ G.flash.position.set(pv[0]*U,.08,pv[1]*U); G.flash.rotation.x=-Math.PI/2; G.flash.scale.setScalar(.6+(c.t-c.dur)*2+1); } },
  place:cam=>{ const c=RPL.cur; if(!c||!c._pv){ return; } const pv=c._pv, pk=c._pk, mx=(pv[0]+pk[0])/2*U, mz=(pv[1]+pk[1])/2*U;
    const dx=pv[0]-pk[0], dz=pv[1]-pk[1], L=Math.hypot(dx,dz)||1, px=-dz/L, pz=dx/L, sd=(c.vt+c.kt)%2?1:-1, sep=Math.min(10,Math.max(3.6,L*U*.9+2.6));
    cam.position.set(mx+px*sd*sep,2.4+sep*.3,mz+pz*sd*sep); cam.lookAt(mx,.6,mz); },
  post:(cx,cv)=>{ const G=RPL.ghosts; if(G){ for(const o of [G.k,G.v]){ o.g.visible=false; o.tr.forEach(t=>t.visible=false); } G.flash.visible=false; } const c=RPL.cur; if(!c) return; const W=cv.width; cx.save(); cx.textAlign='center'; cx.font='bold 22px system-ui,sans-serif'; cx.fillStyle='#fff'; cx.strokeStyle='#000'; cx.lineWidth=4;
    cx.strokeText('⏪ REJEU',W/2,34); cx.fillText('⏪ REJEU',W/2,34); cx.font='bold 19px system-ui,sans-serif'; const s=(c.kn+' ➜ '+c.vn).slice(0,24); cx.strokeText(s,W/2,W-22); cx.fillStyle=c.mine?'#fde68a':'#fff'; cx.fillText(s,W/2,W-22); cx.restore(); }
});
{ const _n=newGame; newGame=function(){ _n(); RPL.hist=[]; RPL.cur=null; }; }
