'use strict';
/* =====================  PRIMES · PARADE · ARMURES · INFO DES BLOCS  ===================== */
/* ---- champs synchronisés ---- */
ENT_NUM.push('arD','arM','arR','arT','bounty','streak','parry','parryCd');
{ const _me=makeEnt; makeEnt=function(a,b,c){ const e=_me(a,b,c); e.arD=0; e.arM=0; e.arR=0; e.arT=0; e.bounty=0; e.streak=0; e.parry=0; e.parryCd=0; return e; }; }

/* ---- armures : usure + résistance selon le prix ---- */
const ARMORS=[
  null,
  {id:'arm_leather',n:'Gilet de cuir',ico:'🦺',col:'#b9855a',res:.15,dur:26,cost:{bronze:40},hex:0x9a6b3a},
  {id:'arm_iron',n:'Cuirasse de fer',ico:'🛡️',col:'#cbd5e1',res:.28,dur:55,cost:{bronze:30,silver:10},hex:0xb8c2cc},
  {id:'arm_gold',n:'Armure dorée',ico:'👑',col:'#fbbf24',res:.38,dur:90,cost:{gold:3},hex:0xfbbf24},
  {id:'arm_diamond',n:'Armure de diamant',ico:'💎',col:'#67e8f9',res:.5,dur:150,cost:{diamond:2},hex:0x67e8f9}
];
for(let i=1;i<ARMORS.length;i++){ const A=ARMORS[i];
  const it={id:A.id,n:A.n,ico:A.ico,col:A.col}; ITEMS.push(it); ITEMMAP[A.id]=it;
  TIPS2[A.id]=`Réduit les dégâts de ${Math.round(A.res*100)} % · s'use (${A.dur} dégâts absorbés)`;
  const item=mk(A.id,'Défense',e=>{
    const eq=e.arD>0&&e.arT>=i&&e.arD>=e.arM*.5;
    if(eq) return {name:A.n,desc:'Tu portes déjà une armure équivalente en bon état.',cost:{},ok:false,tag:'ÉQUIPÉ'};
    return {name:A.n,desc:`Réduit les dégâts de ${Math.round(A.res*100)} % (moins quand elle est abîmée). S'use : absorbe ${A.dur} dégâts avant de se briser. Perdue à ta mort.`,cost:A.cost}; },
    e=>{ e.arD=A.dur; e.arM=A.dur; e.arR=A.res; e.arT=i; });
  SHOP.push(item); SHOPMAP[A.id]=item;
}
/* bots : ils s'équipent quand ils ont de quoi */
BOT_BUY.splice(8,0,
  ['arm_diamond',b=>b.arT<4&&b.res.diamond>=4],
  ['arm_gold',b=>b.arT<3&&b.res.gold>=5],
  ['arm_iron',b=>!(b.arD>0)&&b.res.silver>=18&&b.res.bronze>=50],
  ['arm_leather',b=>!(b.arD>0)&&b.res.bronze>=110]);
/* usure et protection */
{ const _h=hurt;
  hurt=function(e,amount,by,kx,ky){
    if(e.alive&&!(e.inv>0)&&!(e.aegis>0)&&amount>0){
      if(e.parry>0&&by&&by!==e&&by.team!==undefined){ // PARADE : le coup est annulé et l'attaquant est déséquilibré
        e.parry=0; e.parryCd=Math.max(e.parryCd,.9); ring(e.x,e.y,T*1.7,'#fde68a',.45,true); burst(e.x,e.y-e.z,'#fef3c7',16,260,.4,3); sfx('hit',e.x,e.y); floatTxt(e.x,e.y-48-e.z,'PARADE !','#fde68a',18);
        if(by.alive&&Math.hypot(by.x-e.x,by.y-e.y)<3.6*T){ by.root=Math.max(by.root||0,.9); by.cd&&(by.cd.atk=Math.max(by.cd.atk||0,.9)); const d=Math.hypot(by.x-e.x,by.y-e.y)||1; by.vx+=(by.x-e.x)/d*260; by.vy+=(by.y-e.y)/d*260; floatTxt(by.x,by.y-44-by.z,'DÉSÉQUILIBRÉ','#fca5a5',14); }
        if(e===player) game.hitmark=.2; return; }
      if(e.arD>0){ const eff=e.arR*(.55+.45*e.arD/e.arM); e.arD-=amount; amount*=1-eff; floatTxt(e.x+rnd(-6,6),e.y-34-e.z,'🛡','#cbd5e1',12);
        if(e.arD<=0){ e.arD=0; e.arT=0; floatTxt(e.x,e.y-52-e.z,'ARMURE BRISÉE !','#fca5a5',16); chunks(e.x,e.y,'#94a3b8',8); ring(e.x,e.y,T*1.3,'#94a3b8',.4,true); sfx('hit',e.x,e.y); } }
    }
    return _h(e,amount,by,kx,ky); };
}

/* ---- parade (F) ---- */
function doParry(e){ if(!e.alive||e.parryCd>0||e.frozen>0||e.bubble>0||e.riding||game.state!=='play') return false;
  e.parry=.34; e.parryCd=1.8; ring(e.x,e.y,T*1.05,'#fde68a',.3,true); sfx('swing',e.x,e.y); return true; }
addEventListener('keydown',ev=>{ if(ev.repeat||game.state!=='play'||game.paused||shopOpen||!player||!player.alive||ev.key.toLowerCase()!=='f') return;
  if(game.spec) return; if(NETCLIENT){ netSend({t:'act',a:'parry'}); return; } doParry(player); });
addEventListener('pointerdown',ev=>{ if(ev.pointerType!=='touch'||game.state!=='play'||!player||!player.alive||!ctx) return; const x=ev.clientX-(VW/2-190), y=ev.clientY-(VH-90); if(x*x+y*y<28*28){ if(NETCLIENT) netSend({t:'act',a:'parry'}); else doParry(player); } });
{ const _nh=netHostData; netHostData=function(team,m){ if(m&&m.t==='act'&&m.a==='parry'){ const e=ents.find(o=>o.remote&&o.team===team); if(e&&e.alive&&NET.started) doParry(e); return; } _nh(team,m); }; }
/* bots : ils parent quand un adversaire est au contact */
{ const _bt=botThink; botThink=function(b,dt){ _bt(b,dt);
    if(!b.alive||!b.ai||b.parryCd>0||game.tut) return; const D=getD(); let near=false; for(const o of ents){ if(o.alive&&o.team!==b.team&&Math.hypot(o.x-b.x,o.y-b.y)<2.5*T){ near=true; break; } }
    if(near&&Math.random()<dt*.55*D.use*(D.react<.4?1.4:1)) doParry(b); }; }

/* ---- primes : 3 éliminations d'affilée = une tête mise à prix ---- */
{ const _d=die;
  die=function(e,by,sea){ const was=e.alive, bounty=e.bounty|0; _d(e,by,sea);
    if(!was||e.alive) return; const k=by&&by!==e&&by.team!==undefined?by:null;
    if(k&&bounty>0){ k.res.gold+=bounty; announce(`💰 PRIME ENCAISSÉE : +${bounty} or pour ${k.name} !`,'#fde68a'); if(k===player) flashScreen('#fde68a',.18); floatTxt(k.x,k.y-56-k.z,`+${bounty} or (prime)`,'#fde68a',17); }
    if(k){ k.streak=(k.streak|0)+1; const nb=k.streak>=3?Math.min(5,k.streak-1):0; if(nb>(k.bounty|0)){ k.bounty=nb; announce(`💰 PRIME SUR ${k.name.toUpperCase()} : ${nb} or !`,TEAMS[k.team].light); msg(`💰 ${k.name} (${k.streak} éliminations) a une prime de ${nb} or`,'#fde68a'); } }
    e.streak=0; e.bounty=0; e.arD=0; e.arT=0; e.parry=0; }; }
{ const _u=update;
  update=function(dt){ for(const e of ents){ if(e.parry>0) e.parry-=dt; if(e.parryCd>0) e.parryCd-=dt;
      if(e.alive&&e.bounty>0&&!NETCLIENT){ e._bt=(e._bt||0)-dt; if(e._bt<=0){ e._bt=.7; burst(e.x,e.y-e.z-34,'#fbbf24',3,60,.6,2); if(Math.random()<.4) floatTxt(e.x,e.y-60-e.z,'💰'+e.bounty,'#fde68a',13); } } }
    _u(dt); }; }
/* ---- rendu 3D : armure + pièce de prime ---- */
{ const _a=animatePirate;
  animatePirate=function(e,m,dt){ _a(e,m,dt); const u=m.userData;
    if(e.arD>0&&!u.arm){ const g=new THREE.Group(), mat=new THREE.MeshStandardMaterial({color:0xcccccc,metalness:.6,roughness:.35});
      const ch=new THREE.Mesh(GEO.box,mat); ch.scale.set(.66,.5,.66); ch.position.y=.72; g.add(ch);
      for(const s of [-1,1]){ const sh=new THREE.Mesh(GEO.sphere,mat); sh.scale.set(.2,.15,.2); sh.position.set(0,.98,s*.38); g.add(sh); }
      g.userData.mat=mat; m.add(g); u.arm=g; }
    if(u.arm){ const on=e.arD>0; u.arm.visible=on; if(on){ const A=ARMORS[e.arT]||ARMORS[1]; u.arm.userData.mat.color.setHex(A.hex); u.arm.userData.mat.opacity=1; const w=e.arD/e.arM; u.arm.userData.mat.emissive.setHex(w<.3?0x551111:0x000000); } }
    if(e.bounty>0&&!u.bnt){ const c=new THREE.Mesh(GEO.cyl,new THREE.MeshStandardMaterial({color:0xfbbf24,emissive:0x8a5a00,metalness:.7,roughness:.3})); c.scale.set(.28,.04,.28); c.rotation.x=Math.PI/2; c.position.y=2.75; const hold=new THREE.Group(); hold.add(c); hold.position.y=0; m.add(hold); u.bnt=hold; }
    if(u.bnt){ u.bnt.visible=e.bounty>0; if(u.bnt.visible){ u.bnt.rotation.y=game.t*3; u.bnt.position.y=Math.sin(game.t*4)*.08; } } }; }
/* ---- HUD : barre d'armure + parade ---- */
{ const _dh=drawHud; drawHud=function(){ _dh(); if(game.state!=='play'||!ctx||!player||!player.alive||shopOpen) return; const e=player; ctx.save(); ctx.setTransform(DPR,0,0,DPR,0,0);
    const tc=typeof TOUCH!=='undefined'&&TOUCH.on, by=VH-(tc?96:102);
    if(e.arD>0){ const w=300, x=VW/2-w/2, p=e.arD/e.arM, A=ARMORS[e.arT]||ARMORS[1]; ctx.fillStyle='#0008'; ctx.fillRect(x,by-9,w,6); ctx.fillStyle=p<.3?'#f87171':A.col; ctx.fillRect(x,by-9,w*p,6); ctx.font='13px system-ui'; ctx.textAlign='right'; ctx.fillText(A.ico,x-5,by-3); }
    const cx0=VW/2-190, cy0=by+12, rdy=e.parryCd<=0; ctx.beginPath(); ctx.arc(cx0,cy0,16,0,6.283); ctx.fillStyle=e.parry>0?'#fde68a':'#0b1b2dcc'; ctx.fill(); ctx.lineWidth=2.5; ctx.strokeStyle=rdy?'#fde68a':'#64748b'; ctx.stroke();
    if(!rdy){ ctx.beginPath(); ctx.moveTo(cx0,cy0); ctx.arc(cx0,cy0,16,-Math.PI/2,-Math.PI/2+6.283*Math.min(1,e.parryCd/1.8)); ctx.closePath(); ctx.fillStyle='#0009'; ctx.fill(); }
    ctx.font='bold 14px system-ui'; ctx.textAlign='center'; ctx.fillStyle=rdy?'#fde68a':'#94a3b8'; ctx.fillText(tc?'🛡':'F',cx0,cy0+5);
    ctx.textAlign='left'; ctx.restore(); }; }
/* ---- info de résistance des blocs (boutique uniquement) ---- */
for(const id of ['wool','wood','stone','obs','coral','iceblk']){ const it=SHOPMAP[id]; if(!it) continue;
  const d=makeEnt(0,false,'x'); d.blocks=d.blocks||{}; const before=Object.assign({},d.blocks); try{ it.buy(d); }catch(er){}
  let t=0; for(const k in d.blocks) if((d.blocks[k]|0)>(before[k]|0)){ t=+k; break; }
  if(!t||!BHP[t]) continue; const old=it.info;
  it.info=function(e){ const r=old.call(this,e); if(!r||!r.desc) return r; return Object.assign({},r,{desc:r.desc+` · Résistance : ${BHP[t]} PV (une bombe en inflige ~10, un coup d'épée ~${(SWORDS[1]&&SWORDS[1].d)||3}).`}); };
}
