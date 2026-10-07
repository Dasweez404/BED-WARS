'use strict';
/* =====================  SOCIAL : pings d'équipe, emojis, kill-cam, ralentis, mode spectateur  ===================== */
const PK={go:{ico:'📍',n:'Ici !',col:'#fde68a'},atk:{ico:'⚔️',n:'Attaquer !',col:'#fca5a5'},def:{ico:'🛡️',n:'Défendre !',col:'#93c5fd'},danger:{ico:'⚠️',n:'Attention !',col:'#fdba74'},loot:{ico:'💰',n:'Butin !',col:'#fde047'},help:{ico:'🆘',n:'À l\'aide !',col:'#f87171'}};
const PK_ORDER=['go','atk','def','danger','loot','help'];
const EMOS=['👍','😂','😡','😎','😭','❤️','🆘','👋'];
let PINGS=[], EMOTES=[];
const SPEC={tgt:null,free:false,fx:0,fy:0}, KC={on:false,by:null,name:'',weapon:'',t:0,max:3.4,team:0,hp:0,mhp:1,cls:'', focus:null}, CAMF={on:false,x:0,y:0,t:0,dur:0,zoom:0};
const HUDB=[]; // boutons cliquables dessinés dans le HUD (souris et tactile)
const isSpec=()=>game.state==='play'&&!!player&&!player.alive&&!TD[player.team].coreAlive;
const entIdx=e=>ents.indexOf(e);
/* ---------- pings ---------- */
function pingKindAt(x,y){
  let best=null,bd=3.2*T; for(const o of ents){ if(!o.alive||o.team===player.team) continue; const d=Math.hypot(o.x-x,o.y-y); if(d<bd){ bd=d; best='danger'; } }
  if(best) return best;
  for(const t of TD){ const d=Math.hypot((t.bx+.5)*T-x,(t.by+.5)*T-y); if(d<4.5*T) return t.id===player.team?'def':(t.coreAlive?'atk':'go'); }
  for(const s of spawners){ if(s.kind==='base') continue; if(Math.hypot((s.x+.5)*T-x,(s.y+.5)*T-y)<3.2*T) return 'loot'; }
  for(const d of drops) if(Math.hypot(d.x-x,d.y-y)<2.5*T) return 'loot';
  return 'go';
}
function botReact(team,x,y,k,from){
  const tx=Math.floor(x/T), ty=Math.floor(y/T);
  for(const b of ents){ if(!b.isBot||!b.ai||!b.alive||b.team!==team||b===from) continue; const ai=b.ai;
    if(k==='atk'){ let tt=null,bd=9*T; for(const t of TD){ if(t.id===team||!t.coreAlive) continue; const d=Math.hypot((t.bx+.5)*T-x,(t.by+.5)*T-y); if(d<bd){ bd=d; tt=t; } } if(tt){ ai.mode='raid'; ai.target=tt.id; } else { ai.mode='hunt'; } }
    else if(k==='def'){ ai.mode='home'; ai.leaveAt=ai.t+22; }
    else if(k==='loot'||k==='go'||k==='help'){ ai.mode='res'; ai.goal=[tx,ty]; ai.wait=6; }
    else continue;
    floatTxt(b.x,b.y-44,'Reçu !','#a7f3d0',13);
  }
}
function addPing(team,x,y,k,name,from){
  if(!PK[k]) k='go'; PINGS.push({team,x,y,k,name:name||'',t:7,max:7}); if(PINGS.length>14) PINGS.shift();
  const c=PK[k].col; ring(x,y,T*1.9,c,.7); ring(x,y,T*.9,c,.5,true); burst(x,y,c,8,110,.5,3);
  if(player&&team===player.team){ MUS.sting('ping'); }
  botReact(team,x,y,k,from); netRec('P',[team,x,y,k,name||'']);
}
function doPing(k,wx,wy){
  if(!player||!player.alive||game.state!=='play') return; const x=wx===undefined?aim.x:wx, y=wy===undefined?aim.y:wy; k=k||pingKindAt(x,y);
  if(NETCLIENT){ netSend({t:'ping',k,x:Math.round(x),y:Math.round(y)}); return; }
  if(player.pingCd>game.t-.4) return; player.pingCd=game.t; addPing(player.team,x,y,k,player.name,player);
}
function addEmote(e,k,silent){
  if(!e) return; EMOTES=EMOTES.filter(m=>m.e!==e); EMOTES.push({e,k,t:2.6,max:2.6}); if(!silent&&e.alive){ burst(e.x,e.y-46,'#fde68a',5,70,.4,3); netRec('E',[entIdx(e),k]); if(e===player) MUS.sting('emote'); }
}
function doEmote(i){
  if(!player||!player.alive||game.state!=='play') return; i=((i%EMOS.length)+EMOS.length)%EMOS.length;
  if(NETCLIENT){ netSend({t:'emo',k:i}); return; } if(player.emoCd>game.t-.8) return; player.emoCd=game.t; addEmote(player,EMOS[i]);
}
/* hôte : messages des invités */
{ const _h=netHostData;
  netHostData=function(team,m){
    if(m&&(m.t==='ping'||m.t==='emo')){ const e=ents.find(o=>o.remote&&o.team===team); if(!e||!e.alive||!NET.started) return;
      if(m.t==='ping'){ if(e.pingCd>game.t-.4) return; e.pingCd=game.t; addPing(team,clamp(+m.x||0,0,W*T),clamp(+m.y||0,0,H*T),String(m.k),e.name,e); }
      else { if(e.emoCd>game.t-.8) return; e.emoCd=game.t; addEmote(e,EMOS[(+m.k|0)%EMOS.length]||EMOS[0]); }
      return; }
    _h(team,m);
  };
  const _p=netPlayFx;
  netPlayFx=function(f){
    const k=f[0];
    if(k==='P'){ const a=f.slice(1); addPingLocal(a[0],a[1],a[2],a[3],a[4]); return; }
    if(k==='E'){ const a=f.slice(1); addEmote(ents[a[0]],a[1],true); return; }
    if(k==='K'){ const a=f.slice(1); if(ents[a[0]]===player) killCamStart(ents[a[1]],a[2]); return; }
    _p(f);
  };
}
function addPingLocal(team,x,y,k,name){ if(!PK[k]) k='go'; PINGS.push({team,x,y,k,name,t:7,max:7}); if(PINGS.length>14) PINGS.shift(); ring(x,y,T*1.9,PK[k].col,.7); ring(x,y,T*.9,PK[k].col,.5,true); if(player&&team===player.team) MUS.sting('ping'); }
/* ---------- roue (ping / emoji) ---------- */
const WHEEL={on:false,kind:'',cx:0,cy:0,t0:0,sel:-1,n:0};
function wheelItems(){ return WHEEL.kind==='ping'?PK_ORDER.map(k=>({ico:PK[k].ico,n:PK[k].n,col:PK[k].col,k})):EMOS.map((e,i)=>({ico:e,n:'',col:'#fde68a',k:i})); }
function wheelOpen(kind){ if(WHEEL.on||!player||!player.alive||game.state!=='play'||game.paused||shopOpen) return; WHEEL.on=true; WHEEL.kind=kind; WHEEL.cx=clamp(mouse.x||VW/2,150,VW-150); WHEEL.cy=clamp(mouse.y||VH/2,150,VH-150); WHEEL.t0=performance.now(); WHEEL.sel=-1; WHEEL.n=wheelItems().length; }
function wheelUpdateSel(mx,my){ const dx=mx-WHEEL.cx, dy=my-WHEEL.cy, d=Math.hypot(dx,dy); if(d<34){ WHEEL.sel=-1; return; } const n=WHEEL.n; let a=Math.atan2(dy,dx)+Math.PI/2+Math.PI/n; while(a<0) a+=6.2832; while(a>=6.2832) a-=6.2832; WHEEL.sel=Math.floor(a/(6.2832/n))%n; }
function wheelClose(commit){
  if(!WHEEL.on) return; WHEEL.on=false; const quick=performance.now()-WHEEL.t0<260;
  if(!commit) return; const items=wheelItems();
  if(WHEEL.kind==='ping'){ if(WHEEL.sel>=0) doPing(items[WHEEL.sel].k); else if(quick) doPing(); }
  else if(WHEEL.sel>=0) doEmote(items[WHEEL.sel].k);
}
addEventListener('keydown',ev=>{
  if(ev.repeat||(ev.target&&/^(INPUT|TEXTAREA)$/.test(ev.target.tagName))) return; const k=ev.key.length===1?ev.key.toLowerCase():ev.key;
  if(game.state==='over'&&game.specOffer&&(ev.code==='Space'||k==='s')){ startSpectate(); ev.stopImmediatePropagation(); ev.preventDefault(); return; }
  if(game.state!=='play'||game.paused) return;
  if(k==='v'){ wheelOpen('ping'); }
  else if(k==='x'){ wheelOpen('emo'); }
  if(isSpec()){
    if(k==='ArrowRight'&&!SPEC.free){ specCycle(1); ev.stopImmediatePropagation(); }
    else if(k==='ArrowLeft'&&!SPEC.free){ specCycle(-1); ev.stopImmediatePropagation(); }
    else if(k==='f'){ SPEC.free=!SPEC.free; SPEC.fx=cam3.x; SPEC.fy=cam3.y; msg(SPEC.free?'Caméra libre (ZQSD / flèches)':'Suivi d\'un pirate (◀ ▶)','#cfe0ff'); }
  }
},true);
addEventListener('keyup',ev=>{ const k=ev.key.length===1?ev.key.toLowerCase():ev.key; if((k==='v'&&WHEEL.kind==='ping')||(k==='x'&&WHEEL.kind==='emo')) wheelClose(true); });
addEventListener('mousemove',ev=>{ if(WHEEL.on) wheelUpdateSel(ev.clientX,ev.clientY); });
addEventListener('blur',()=>wheelClose(false));
{ const ui=document.getElementById('ui');
  ui.addEventListener('mousedown',ev=>{
    if(ev.button===1){ ev.preventDefault(); ev.stopImmediatePropagation(); doPing(); return; }
    if(handleHudClick(ev.clientX,ev.clientY)){ ev.stopImmediatePropagation(); return; }
    if(WHEEL.on){ ev.stopImmediatePropagation(); return; }
    if(isSpec()&&!game.paused){ ev.stopImmediatePropagation(); if(!SPEC.free) specCycle(ev.button===2?-1:1); }
  },true);
  ui.addEventListener('auxclick',ev=>{ if(ev.button===1) ev.preventDefault(); });
}
function handleHudClick(x,y){ for(const b of HUDB){ if(x>=b.x&&x<=b.x+b.w&&y>=b.y&&y<=b.y+b.h){ b.fn(); return true; } } return false; }
/* ---------- spectateur ---------- */
function startSpectate(){ if(game.state!=='over'||!game.specOffer) return; game.spec=true; game.specOffer=false; game.state='play'; SPEC.tgt=null; SPEC.free=false; msg('Mode spectateur : ◀ ▶ pour changer de pirate, F pour la caméra libre.','#cfe0ff'); }
function specList(){ return ents.filter(o=>o.alive&&o!==player); }
function specCycle(d){ const l=specList(); if(!l.length) return; let i=l.indexOf(SPEC.tgt); i=(i+d+l.length)%l.length; SPEC.tgt=l[i]; sfx('tick'); }
function specTarget(){
  if(SPEC.tgt&&SPEC.tgt.alive) return SPEC.tgt; const l=specList(); if(!l.length) return null;
  l.sort((a,b)=>((a.sinceHurt??99)+(a.isBot?2:0))-((b.sinceHurt??99)+(b.isBot?2:0))); SPEC.tgt=l[0]; return SPEC.tgt;
}
{ const _co=checkOver;
  checkOver=function(){
    if(game.state!=='play') return; if(typeof NETON!=='undefined'&&NETON) return _co();
    const aliveT=TD.filter(t=>!teamElim(t.id));
    if(game.spec){ if(aliveT.length<=1){ game.state='over'; game.win=false; game.winTeam=aliveT.length?aliveT[0].id:-1; game.specOffer=false; } return; }
    if(teamElim(player.team)){ game.state='over'; game.win=false; game.winTeam=-1; game.specOffer=aliveT.length>1; return; }
    _co();
    if(game.state==='over'){ const a=TD.filter(t=>!teamElim(t.id)); game.winTeam=a.length===1?a[0].id:-1; }
  };
}
/* ---------- kill-cam et caméra cinématique ---------- */
function killCamStart(by,weapon){
  if(!by||by===player||KC.on) return; KC.on=true; KC.by=by; KC.t=0; KC.max=3.2; KC.team=by.team; KC.name=by.name; KC.cls=by.cls; KC.weapon=weapon||by.held||'sword';
  if(typeof JUICE!=='undefined'&&!NETON) JUICE.slow=Math.max(JUICE.slow,.8);
}
function camFocusOn(x,y,dur,zoom){ CAMF.on=true; CAMF.x=x; CAMF.y=y; CAMF.t=0; CAMF.dur=dur; CAMF.zoom=zoom||1; }
{ const _d=die;
  die=function(e,by,sea){ const was=e.alive; _d(e,by,sea);
    if(was&&!e.alive){
      if(by&&by!==e&&by.alive!==undefined){ const wp=by.held||'sword';
        if(e===player) killCamStart(by,wp);
        else if(e.remote&&NET.role==='host') netRec('K',[entIdx(e),entIdx(by),wp]);
        // bots : petites réactions
        if(by.isBot&&!by.remote&&Math.random()<.35&&!(by.emoCd>game.t-6)){ by.emoCd=game.t; addEmote(by,['😎','😂','👋','😡'][Math.floor(Math.random()*4)]); }
      }
      if(e.isBot&&!e.remote&&Math.random()<.3&&!(e.emoCd>game.t-6)){ e.emoCd=game.t; addEmote(e,['😭','😡','🆘'][Math.floor(Math.random()*3)]); }
    } };
}
function weaponName(id){ const it=ITEMMAP[id]; if(id==='sword'&&KC.by) return SWORDS[Math.min(SWORDS.length-1,KC.by.sword||0)].n; return it?it.n:'Coup fatal'; }
function camPlace(h,zo,lookZ){ const cx=cam3.x*U, cz=cam3.y*U; camera3.position.set(cx,h,cz+zo); camera3.lookAt(cx,lookZ===undefined?.2:lookZ,cz-.2); if(typeof ambCamera==='function') ambCamera(); }
{ const _c=updateCamera, _over={t:0,done:false};
  updateCamera=function(dt){
    _c(dt); if(game.state==='menu'||!player) { _over.t=0; _over.done=false; return; }
    const k=Math.min(1,dt*3.6);
    if(KC.on){ KC.t+=dt; if(player.alive||KC.t>KC.max||!KC.by||game.state!=='play'){ KC.on=false; }
      else { const b=KC.by; cam3.x+=(b.x-cam3.x)*k; cam3.y+=(b.y-cam3.y)*k; const z=Math.min(1,KC.t*1.6); camPlace(16.5-4.2*z,11-3.2*z,.3); camera3.rotation.z+=Math.sin(KC.t*1.3)*.012; return; } }
    if(CAMF.on){ CAMF.t+=dt; if(CAMF.t>CAMF.dur) CAMF.on=false; else { const p=CAMF.t/CAMF.dur, z=Math.sin(Math.min(1,p*1.2)*Math.PI*.5)*Math.min(1,(1-p)*4); cam3.x+=(CAMF.x-cam3.x)*k; cam3.y+=(CAMF.y-cam3.y)*k; camPlace(16.5-3.2*CAMF.zoom*z,11-2.4*CAMF.zoom*z,.3); return; } }
    if(game.state==='over'){ // fin de partie : on s'approche lentement de l'équipage vainqueur
      if(!_over.done){ _over.done=true; _over.t=0; if(!NETON&&typeof JUICE!=='undefined') JUICE.slow=Math.max(JUICE.slow,1.1); }
      _over.t+=dt; const w=game.win?player:(ents.find(o=>o.alive&&o.team===game.winTeam)||player); cam3.x+=(w.x-cam3.x)*k*.7; cam3.y+=(w.y-cam3.y)*k*.7; const z=Math.min(1,_over.t*.5); camPlace(16.5-3.6*z,11-2.7*z,.3); return; } else _over.done=false;
    if(isSpec()){
      let dx=0,dy=0;
      if(SPEC.free){ const up=keys.KeyW||keys['k:z']||keys.ArrowUp, dn=keys.KeyS||keys['k:s']||keys.ArrowDown, lf=keys.KeyA||keys['k:q']||keys.ArrowLeft, rt=keys.KeyD||keys['k:d']||keys.ArrowRight; dx=(rt?1:0)-(lf?1:0); dy=(dn?1:0)-(up?1:0); SPEC.fx=clamp(SPEC.fx+dx*620*dt,0,W*T); SPEC.fy=clamp(SPEC.fy+dy*620*dt,0,H*T); if(TOUCHSPEC){ SPEC.fx=clamp(SPEC.fx+TOUCHSPEC.ix*620*dt,0,W*T); SPEC.fy=clamp(SPEC.fy+TOUCHSPEC.iy*620*dt,0,H*T); } cam3.x+=(SPEC.fx-cam3.x)*k; cam3.y+=(SPEC.fy-cam3.y)*k; }
      else { const t=specTarget(); if(t){ cam3.x+=(t.x-cam3.x)*k; cam3.y+=(t.y-cam3.y)*k; } }
      camPlace(18.5,12.2,.2);
    }
  };
}
let TOUCHSPEC=null;
/* un coffre tombe : ralenti et zoom */
{ let coresOld=null;
  const _u=updateEvents;
  updateEvents=function(dt){ _u(dt); if(game.state==='menu') return; if(!coresOld||coresOld.length!==TD.length) coresOld=TD.map(t=>t.coreAlive);
    TD.forEach((t,i)=>{ if(coresOld[i]&&!t.coreAlive){ if(!NETON&&typeof JUICE!=='undefined'){ JUICE.slow=Math.max(JUICE.slow,.9); JUICE.kick(.8); }  } coresOld[i]=t.coreAlive; });
  };
}
/* nettoyage entre parties */
{ const _n=newGame; newGame=function(){ _n(); PINGS=[]; EMOTES=[]; KC.on=false; CAMF.on=false; SPEC.tgt=null; SPEC.free=false; game.spec=false; game.specOffer=false; WHEEL.on=false; }; }
/* ---------- affichage ---------- */
function drawPingsHud(){
  if(!PINGS.length) return; const dt=.016;
  for(const p of PINGS){ p.t-=dt; }
  PINGS=PINGS.filter(p=>p.t>0);
  for(const p of PINGS){ if(p.team!==player.team) continue; const K=PK[p.k], a=Math.min(1,p.t*1.5,(p.max-p.t)*5), age=p.max-p.t, col=K.col;
    ctx.save(); ctx.globalAlpha=a*.9; const r=T*(.45+.4*((age*1.4)%1)); gCircle(p.x,p.y,T*.5,col,2.5,false,2); gCircle(p.x,p.y,r*1.2,col,1.5,false,2);
    const s=w2s(p.x,p.y,58+Math.sin(age*5)*5), m=34; let sx=s[0],sy=s[1]; const inside=s[2]&&sx>m&&sx<VW-m&&sy>m+30&&sy<VH-90;
    const d=Math.round(Math.hypot(p.x-player.x,p.y-player.y)/T); ctx.globalAlpha=a;
    if(inside){ const pop=1+Math.max(0,.6-age*3)*.6; ctx.translate(sx,sy); ctx.scale(pop,pop); rr(-17,-17,34,34,17); ctx.fillStyle='rgba(12,30,48,.85)'; ctx.fill(); ctx.lineWidth=2.5; ctx.strokeStyle=col; ctx.stroke(); ctx.font='20px '+FONT; ctx.textAlign='center'; ctx.fillStyle='#fff'; ctx.fillText(K.ico,0,7);
      ctx.beginPath(); ctx.moveTo(-6,16); ctx.lineTo(6,16); ctx.lineTo(0,25); ctx.closePath(); ctx.fillStyle=col; ctx.fill();
      ctx.font='bold 12px '+FONT; ctx.lineWidth=4; ctx.strokeStyle='rgba(10,20,50,.9)'; const lab=(p.name?p.name+' · ':'')+K.n+' '+d+' m'; ctx.strokeText(lab,0,-24); ctx.fillStyle=col; ctx.fillText(lab,0,-24); }
    else { const cx=VW/2, cy=VH/2; let dx=sx-cx, dy=sy-cy; if(!s[2]){ dx=-dx; dy=-dy; } const kk=Math.min((VW/2-m)/Math.abs(dx||1),(VH/2-m-60)/Math.abs(dy||1)), px=cx+dx*kk, py=cy+dy*kk, an=Math.atan2(dy,dx);
      ctx.translate(px,py); rr(-16,-16,32,32,16); ctx.fillStyle='rgba(12,30,48,.85)'; ctx.fill(); ctx.lineWidth=2.5; ctx.strokeStyle=col; ctx.stroke(); ctx.font='18px '+FONT; ctx.textAlign='center'; ctx.fillStyle='#fff'; ctx.fillText(K.ico,0,6);
      ctx.rotate(an); ctx.beginPath(); ctx.moveTo(26,0); ctx.lineTo(18,-6); ctx.lineTo(18,6); ctx.closePath(); ctx.fillStyle=col; ctx.fill(); }
    ctx.restore(); }
}
function drawEmotes(){
  for(const m of EMOTES){ m.t-=.016; } EMOTES=EMOTES.filter(m=>m.t>0&&m.e.alive);
  for(const m of EMOTES){ const e=m.e, age=m.max-m.t, s=w2s(e.x,e.y,e.z+78+Math.min(14,age*12)); if(!s[2]) continue; const pop=age<.25?1.5-age/.25*.5+Math.sin(age*30)*.05:1, a=Math.min(1,m.t*2.5);
    ctx.save(); ctx.globalAlpha=a; ctx.translate(s[0],s[1]); ctx.scale(pop,pop); rr(-21,-21,42,38,16); ctx.fillStyle='#fff'; ctx.fill(); ctx.lineWidth=2.5; ctx.strokeStyle=TEAMS[e.team].col; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-6,16); ctx.lineTo(6,16); ctx.lineTo(0,26); ctx.closePath(); ctx.fillStyle='#fff'; ctx.fill(); ctx.font='26px '+FONT; ctx.textAlign='center'; ctx.fillStyle='#000'; ctx.fillText(m.k,0,9); ctx.restore(); }
}
function drawWheel(){
  if(!WHEEL.on) return; const items=wheelItems(), n=items.length, R=96, age=Math.min(1,(performance.now()-WHEEL.t0)/140), cx=WHEEL.cx, cy=WHEEL.cy;
  if(performance.now()-WHEEL.t0<200&&WHEEL.kind==='ping') return; // un appui bref = ping rapide, pas de roue
  wheelUpdateSel(mouse.x,mouse.y);
  ctx.save(); ctx.translate(cx,cy); ctx.scale(.6+.4*age,.6+.4*age); ctx.globalAlpha=age;
  ctx.beginPath(); ctx.arc(0,0,R+38,0,6.2832); ctx.fillStyle='rgba(8,20,36,.55)'; ctx.fill();
  items.forEach((it,i)=>{ const a=i/n*6.2832-Math.PI/2, x=Math.cos(a)*R, y=Math.sin(a)*R, on=i===WHEEL.sel;
    ctx.beginPath(); ctx.arc(x,y,on?31:26,0,6.2832); ctx.fillStyle=on?it.col:'rgba(12,30,48,.9)'; ctx.fill(); ctx.lineWidth=2.5; ctx.strokeStyle=on?'#fff':it.col; ctx.stroke();
    ctx.font=(on?30:24)+'px '+FONT; ctx.textAlign='center'; ctx.fillStyle='#fff'; ctx.fillText(it.ico,x,y+(on?10:8)); });
  ctx.beginPath(); ctx.arc(0,0,22,0,6.2832); ctx.fillStyle='rgba(12,30,48,.9)'; ctx.fill(); ctx.font='bold 11px '+FONT; ctx.fillStyle='#fde68a'; ctx.textAlign='center';
  const sel=WHEEL.sel>=0?items[WHEEL.sel]:null; ctx.fillText(WHEEL.kind==='ping'?'PING':'EMOJI',0,4);
  if(sel&&sel.n){ ctx.font='bold 15px '+FONT; ctx.lineWidth=4; ctx.strokeStyle='rgba(10,20,50,.9)'; ctx.strokeText(sel.n,0,R+62); ctx.fillStyle=sel.col; ctx.fillText(sel.n,0,R+62); }
  ctx.restore();
}
function drawKillCam(){
  if(!KC.on) return; const p=Math.min(1,KC.t*2.4), bar=Math.round(VH*.09*p), b=KC.by;
  ctx.fillStyle='#000'; ctx.fillRect(0,0,VW,bar); ctx.fillRect(0,VH-bar,VW,bar);
  const a=Math.min(1,KC.t*3), td=TEAMS[KC.team], mhp=b&&b.alive?maxhp(b):1, hpk=b&&b.alive?clamp(b.hp/mhp,0,1):0;
  ctx.save(); ctx.globalAlpha=a; ctx.textAlign='center'; ctx.translate(VW/2,bar+Math.max(70,VH*.14));
  ctx.font='bold 17px '+FONT; ctx.fillStyle='#fecaca'; ctx.lineWidth=4; ctx.strokeStyle='rgba(30,0,0,.9)'; ctx.strokeText('☠ ÉLIMINÉ PAR',0,-30); ctx.fillText('☠ ÉLIMINÉ PAR',0,-30);
  ctx.font='bold 38px '+PFONT; ctx.lineWidth=6; ctx.strokeText(KC.name,0,6); ctx.fillStyle=td.light; ctx.fillText(KC.name,0,6);
  const cl=CLASSES[KC.cls]; ctx.font='bold 15px '+FONT; ctx.lineWidth=4; const lab=(cl?cl.ico+' '+cl.n+' · ':'')+'avec '+weaponName(KC.weapon); ctx.strokeText(lab,0,30); ctx.fillStyle='#fff'; ctx.fillText(lab,0,30);
  ctx.fillStyle='rgba(10,20,50,.8)'; rr(-60,40,120,10,5); ctx.fill(); ctx.fillStyle=hpk>.35?'#6ee79a':'#ff7b7b'; rr(-58,42,Math.max(4,116*hpk),6,3); ctx.fill();
  if(TD[player.team].coreAlive){ ctx.font='bold 20px '+FONT; ctx.lineWidth=4; ctx.strokeStyle='rgba(10,20,50,.9)'; const rt='Réapparition dans '+Math.ceil(Math.max(0,player.resp))+' s'; ctx.strokeText(rt,0,84); ctx.fillStyle='#bfdbfe'; ctx.fillText(rt,0,84); ctx.fillStyle='rgba(255,255,255,.25)'; ctx.fillRect(-90,94,180,5); ctx.fillStyle='#7cc0ff'; ctx.fillRect(-90,94,180*clamp(1-player.resp/3,0,1),5); }
  ctx.restore();
}
function drawSpecHud(){
  if(!isSpec()) return; const t=SPEC.free?null:specTarget();
  ctx.save(); ctx.textAlign='center'; const w=Math.min(VW-24,560); panel(VW/2-w/2,86,w,56,16,'#7dd3fc');
  ctx.font='bold 16px '+FONT; ctx.fillStyle='#e0f2fe'; ctx.fillText(SPEC.free?'👁 SPECTATEUR · caméra libre':'👁 SPECTATEUR · '+(t?t.name:'—'),VW/2,108);
  ctx.font='12px '+FONT; ctx.fillStyle='#bae6fd'; ctx.fillText(SPEC.free?'ZQSD / flèches : déplacer · F : suivre un pirate · Échap : menu':'◀ ▶ ou clic : changer de pirate · F : caméra libre · Échap : menu',VW/2,128);
  ctx.restore();
}
function drawOverButtons(){
  HUDB.length=0; if(game.state!=='over'||!game.specOffer) return;
  const y=VH/2+112, w=262, h=44, gap=14, x1=VW/2-w-gap/2, x2=VW/2+gap/2;
  for(const [x,txt,fn,col] of [[x1,'👁 Regarder la fin (Espace)',startSpectate,'#7dd3fc'],[x2,'↩ Menu (Entrée)',()=>showMenu(),'#fde68a']]){
    HUDB.push({x,y,w,h,fn}); panel(x,y,w,h,14,col); ctx.font='bold 16px '+FONT; ctx.textAlign='center'; ctx.fillStyle='#fff'; ctx.fillText(txt,x+w/2,y+28); }
}
function drawMiniPings(){
  const S=miniSize(),mx=VW-S-10,my=10; ctx.save(); rr(mx,my,S,S,8); ctx.clip();
  for(const p of PINGS){ if(p.team!==player.team) continue; const x=mx+p.x/T/W*S, y=my+p.y/T/H*S, r=3+((p.max-p.t)*8)%10, c=PK[p.k].col; ctx.strokeStyle=c; ctx.globalAlpha=.9; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(x,y,r,0,6.3); ctx.stroke(); ctx.fillStyle=c; ctx.beginPath(); ctx.arc(x,y,2.5,0,6.3); ctx.fill(); }
  ctx.restore();
}
{ const _dh=drawHud;
  drawHud=function(){ _dh(); if(game.state==='menu'||!ctx||!player) return; ctx.save(); ctx.setTransform(DPR,0,0,DPR,0,0);
    drawPingsHud(); drawEmotes(); drawMiniPings(); drawSpecHud(); drawKillCam(); drawWheel(); drawOverButtons(); ctx.restore(); };
}

/* ---------- diagnostic réseau en jeu ---------- */
{ const _na=netApplySnap; netApplySnap=function(m){ NET.lastSnapT=performance.now(); NET.snapN=(NET.snapN||0)+1; _na(m); };
  let sT=0, sN=0, rate=0;
  const _dh=drawHud;
  drawHud=function(){ _dh(); if(!NETON||game.state==='menu'||!ctx) return; const now=performance.now();
    if(now-sT>1000){ rate=(NET.snapN||0)-sN; sN=NET.snapN||0; sT=now; }
    let txt='', col='#9af2b8';
    if(NETCLIENT){ const lag=now-(NET.lastSnapT||now); txt='📶 '+rate+' maj/s · '+Math.round(NET.fps||0)+' i/s'; if(rate<8||lag>1500){ col='#fca5a5'; txt+=' · hôte lent ou connexion faible'; } else if(rate<12) col='#fde68a'; }
    else { const f=Math.round(NET.fps||60); txt='📶 hôte · '+f+' i/s'; if(f<25){ col='#fca5a5'; txt+=' · PC trop lent : baisse les graphismes (G)'; } else if(f<40) col='#fde68a'; }
    ctx.save(); ctx.setTransform(DPR,0,0,DPR,0,0); ctx.font='bold 11px '+FONT; ctx.textAlign='right'; ctx.lineWidth=3; ctx.strokeStyle='rgba(10,30,50,.85)'; ctx.fillStyle=col; ctx.strokeText(txt,VW-14,224); ctx.fillText(txt,VW-14,224);
    if(NETCLIENT&&game.state==='play'&&NET.snapped&&now-(NET.lastSnapT||now)>3000){ ctx.textAlign='center'; ctx.font='bold 22px '+FONT; ctx.fillStyle='#fecaca'; ctx.strokeStyle='rgba(60,0,0,.9)'; ctx.lineWidth=5; const t='⚠ Plus de nouvelles de l\'hôte…'; ctx.strokeText(t,VW/2,VH*.32); ctx.fillText(t,VW/2,VH*.32); }
    ctx.restore(); };
}
