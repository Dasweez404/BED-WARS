'use strict';
/* =====================  SUPPORT TACTILE  =====================
   Joystick gauche = se déplacer ; joystick droit = viser + utiliser (maintenir pour les armes, relâcher pour les gadgets) ;
   boutons : saut, boutique, recharge, réserve, bloc, ping, emojis, pause ; la barre d'objets se touche directement. */
const TOUCH={on:false,mode:'auto',ix:0,iy:0,mag:0,aimOn:false,ax:0,ay:1,am:.6,lastDir:null,t0:0,relT:-9,pingKind:null,pingMode:false,panel:null};
const CONT_ITEMS=['block','pick','sword','glove','hammer','baa'];
const isCont=id=>CONT_ITEMS.includes(id)||!!GUNS[id];
(function css(){
  const st=document.createElement('style'); st.textContent=`
  #touch{position:fixed;inset:0;z-index:4;pointer-events:none;display:none;touch-action:none;-webkit-touch-callout:none;-webkit-tap-highlight-color:transparent}
  body.tc #touch{display:block}
  body.tc.tmenu #touch,body.tc.tpause #touch{display:none}
  body.tc{overscroll-behavior:none}
  .tz{position:absolute;top:0;bottom:0;pointer-events:auto;touch-action:none}
  .tz.l{left:0;width:44%}.tz.r{right:0;width:44%}
  body.tshop .tz,body.tover .tz{display:none}
  .tbase{position:fixed;width:112px;height:112px;margin:-56px 0 0 -56px;border-radius:50%;border:3px solid rgba(255,255,255,.55);background:rgba(10,30,50,.28);display:none;pointer-events:none}
  .tknob{position:absolute;left:50%;top:50%;width:52px;height:52px;margin:-26px 0 0 -26px;border-radius:50%;background:rgba(255,236,190,.8);box-shadow:0 2px 8px #0008}
  .tb{position:absolute;pointer-events:auto;touch-action:none;width:46px;height:46px;border-radius:50%;border:3px solid #e2b14f;background:rgba(40,24,12,.72);color:#fff6e0;font-size:22px;display:flex;align-items:center;justify-content:center;padding:0;font-family:inherit;box-shadow:0 3px 8px #0008}
  .tb:active,.tb.on{background:#e2b14f;color:#3a2000}
  .tb.big{width:68px;height:68px;font-size:30px}
  .tb.hide{display:none}
  .tb small{position:absolute;bottom:-14px;font-size:10px;color:#fde68a;text-shadow:0 1px 2px #000;font-weight:700;pointer-events:none}
  #tpanel{position:absolute;pointer-events:auto;left:50%;top:50%;transform:translate(-50%,-50%);background:linear-gradient(160deg,#5b3a22f2,#2e1c10f2);border:3px solid #e2b14f;border-radius:16px;padding:10px;display:none;max-width:92vw}
  #tpanel .row{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin:4px 0}
  #tpanel button{font-family:inherit;font-size:26px;min-width:54px;height:54px;border-radius:14px;border:2px solid #7a5230;background:#4a2f1b;color:#fff6e0;padding:0 8px}
  #tpanel button small{display:block;font-size:10px;color:#fde68a;margin-top:-4px}
  #tpanel .ttl{text-align:center;color:#ffe9b0;font-weight:700;font-size:14px}
  #thot{position:absolute;pointer-events:auto;touch-action:none;display:none;border-radius:12px}
  body.tc #thot{display:block}
  body.tc.tshop #thot,body.tc.tover #thot{display:none}
  #trot{position:fixed;inset:0;z-index:50;display:none;flex-direction:column;align-items:center;justify-content:center;background:#0b2238f2;color:#fff6e0;text-align:center;font-size:20px;gap:14px;padding:24px}
  #trot span{font-size:64px;display:inline-block;animation:rotp 2s ease-in-out infinite}
  @keyframes rotp{0%,30%{transform:rotate(0)}60%,100%{transform:rotate(-90deg)}}
  body.tc.tportrait:not(.tmenu) #trot{display:flex}
  #tping{position:absolute;left:50%;top:12px;transform:translateX(-50%);padding:6px 14px;border-radius:14px;background:rgba(12,30,48,.85);border:2px solid #fde68a;color:#fde68a;font-weight:700;font-size:14px;display:none;pointer-events:none}
  `; document.head.appendChild(st);
})();
const TEL={}; // éléments DOM
function tmk(tag,cls,parent,html){ const e=document.createElement(tag); if(cls) e.className=cls; if(html!==undefined) e.innerHTML=html; if(parent) parent.appendChild(e); return e; }
function touchBuild(){
  if(TEL.root) return;
  const root=TEL.root=tmk('div',null,document.body); root.id='touch';
  TEL.zl=tmk('div','tz l',root); TEL.zr=tmk('div','tz r',root);
  TEL.bl=tmk('div','tbase',root); tmk('div','tknob',TEL.bl); TEL.br=tmk('div','tbase',root); tmk('div','tknob',TEL.br);
  const B=(id,ico,cls,css,fn,lab)=>{ const b=tmk('button','tb '+(cls||''),root,ico+(lab?`<small>${lab}</small>`:'')); b.id=id; Object.assign(b.style,css); b.addEventListener('pointerdown',ev=>{ ev.preventDefault(); ev.stopPropagation(); fn(ev); }); TEL[id]=b; return b; };
  B('tbJump','⤒','big',{right:'14px',bottom:'14px'},()=>{ if(player.alive&&game.state==='play') actJump(); });
  B('tbShop','🛒','',{right:'92px',bottom:'18px'},()=>{ if(game.state==='play'&&!actBoat()) toggleShop(); },'');
  B('tbRel','↻','',{right:'92px',bottom:'74px'},()=>{ if(player.alive) actReload(); });
  B('tbSwap','⇄','',{right:'38px',bottom:'92px'},()=>{ if(player.alive) actSwap(); });
  B('tbBlk','🧱','',{right:'148px',bottom:'18px'},()=>actCycle());
  B('tbPing','📍','',{left:'12px',bottom:'12px'},()=>touchPanel('ping'));
  B('tbEmo','😀','',{left:'66px',bottom:'12px'},()=>touchPanel('emo'));
  B('tbPause','⏸','',{left:'120px',bottom:'12px'},()=>togglePause());
  B('tbSpL','◀','',{left:'12px',bottom:'80px'},()=>specCycle(-1));
  B('tbSpR','▶','',{left:'66px',bottom:'80px'},()=>specCycle(1));
  B('tbSpF','🎥','',{left:'120px',bottom:'80px'},()=>{ SPEC.free=!SPEC.free; SPEC.fx=cam3.x; SPEC.fy=cam3.y; });
  TEL.hot=tmk('div',null,root); TEL.hot.id='thot'; let hid=null;
  const pick=ev=>{ const l=hotList(player), hb=hotbarRect(l.length), i=Math.floor((ev.clientX-hb.x)/(hb.s+hb.g)); if(i>=0&&i<l.length&&l[i].id!==selId){ setSel(l[i].id); sfx('tick'); } };
  TEL.hot.addEventListener('pointerdown',ev=>{ ev.preventDefault(); ev.stopPropagation(); hid=ev.pointerId; try{ TEL.hot.setPointerCapture(hid); }catch(e){} const l=hotList(player), hb=hotbarRect(l.length), i=Math.floor((ev.clientX-hb.x)/(hb.s+hb.g)); if(l[i]&&selId==='block'&&l[i].id==='block') actCycle(); pick(ev); });
  TEL.hot.addEventListener('pointermove',ev=>{ if(ev.pointerId===hid) pick(ev); });
  const hup=ev=>{ if(ev.pointerId===hid) hid=null; }; TEL.hot.addEventListener('pointerup',hup); TEL.hot.addEventListener('pointercancel',hup);
  TEL.rot=tmk('div',null,document.body,'<span>📱</span><div>Tourne ton téléphone en <b>mode paysage</b> pour jouer</div>'); TEL.rot.id='trot';
  TEL.panel=tmk('div',null,root); TEL.panel.id='tpanel'; TEL.pingTip=tmk('div',null,root); TEL.pingTip.id='tping';
  stickZone(TEL.zl,TEL.bl,{move(vx,vy,m){ TOUCH.ix=vx; TOUCH.iy=vy; TOUCH.mag=m; },end(){ TOUCH.ix=TOUCH.iy=TOUCH.mag=0; }});
  stickZone(TEL.zr,TEL.br,{start(){ TOUCH.aimOn=true; TOUCH.t0=performance.now(); TOUCH.am=.6; },
    move(vx,vy,m){ if(m>.08){ TOUCH.ax=vx/m; TOUCH.ay=vy/m; TOUCH.am=m; } if(isCont(selId)&&player.alive) mouse.down=m>.22; },
    end(){ const was=TOUCH.aimOn; TOUCH.aimOn=false; mouse.down=false; TOUCH.relT=performance.now()/1000; if(was&&player.alive&&game.state==='play'&&!isCont(selId)) mouse.clicked=true; }});
  const ui=document.getElementById('ui');
  ui.addEventListener('pointerdown',ev=>{ if(ev.pointerType!=='touch') return; ev.preventDefault(); if(!TOUCH.on) return; if(touchTapHud(ev.clientX,ev.clientY)) return; if(game.state==='over') showMenu(); });
}
/* stick flottant */
function stickZone(z,base,h){
  let id=null,ox=0,oy=0; const R=54, knob=base.firstChild;
  z.addEventListener('pointerdown',ev=>{ if(id!==null) return; ev.preventDefault(); if(touchTapHud(ev.clientX,ev.clientY)) return;
    id=ev.pointerId; try{ z.setPointerCapture(id); }catch(e){} ox=ev.clientX; oy=ev.clientY; base.style.left=ox+'px'; base.style.top=oy+'px'; base.style.display='block'; knob.style.transform='none'; if(h.start) h.start(); });
  z.addEventListener('pointermove',ev=>{ if(ev.pointerId!==id) return; ev.preventDefault(); let dx=ev.clientX-ox, dy=ev.clientY-oy, d=Math.hypot(dx,dy);
    if(d>R*1.5){ const k=(d-R*1.5)/d; ox+=dx*k; oy+=dy*k; base.style.left=ox+'px'; base.style.top=oy+'px'; dx=ev.clientX-ox; dy=ev.clientY-oy; d=Math.hypot(dx,dy); }
    const m=Math.min(1,d/R), k=d>0?m/d:0; knob.style.transform=`translate(${dx/(d||1)*Math.min(d,R)}px,${dy/(d||1)*Math.min(d,R)}px)`; h.move(dx*k,dy*k,m>.12?m:0); });
  const up=ev=>{ if(ev.pointerId!==id) return; id=null; base.style.display='none'; h.end(); };
  z.addEventListener('pointerup',up); z.addEventListener('pointercancel',up);
}
/* touches sur le HUD : barre d'objets, boutons de fin de partie, mode ping */
function touchTapHud(x,y){
  if(game.state==='play'&&player.alive){
    const l=hotList(player), hb=hotbarRect(l.length);
    if(y>=hb.y-8&&y<=hb.y+hb.s+6&&x>=hb.x&&x<hb.x+l.length*(hb.s+hb.g)){ const i=Math.floor((x-hb.x)/(hb.s+hb.g)); if(l[i]){ if(selId==='block'&&l[i].id==='block') actCycle(); setSel(l[i].id); sfx('tick'); } return true; }
  }
  if(handleHudClick(x,y)) return true;
  if(TOUCH.pingMode){ const w=screenToWorld(x,y); TOUCH.pingMode=false; touchPingTip(false); doPing(TOUCH.pingKind||undefined,w[0],w[1]); TOUCH.pingKind=null; return true; }
  return false;
}
function screenToWorld(x,y){ ndc.set(x/VW*2-1,-(y/VH*2-1)); rayc.setFromCamera(ndc,camera3); planeY.constant=0; if(rayc.ray.intersectPlane(planeY,hitP)) return [hitP.x*T,hitP.z*T]; return [aim.x,aim.y]; }
function touchPingTip(on){ TEL.pingTip.style.display=on?'block':'none'; if(on) TEL.pingTip.textContent='📍 Touche la carte pour placer le ping'; }
/* panneaux ping / emojis */
function touchPanel(kind){
  const p=TEL.panel; if(p.style.display==='block'&&TOUCH.panel===kind){ p.style.display='none'; TOUCH.panel=null; return; }
  TOUCH.panel=kind; p.style.display='block';
  if(kind==='emo'){ p.innerHTML='<div class="ttl">Emoji</div><div class="row">'+EMOS.map((e,i)=>`<button data-e="${i}">${e}</button>`).join('')+'</div>';
    p.querySelectorAll('[data-e]').forEach(b=>b.addEventListener('pointerdown',ev=>{ ev.preventDefault(); ev.stopPropagation(); doEmote(+b.dataset.e); p.style.display='none'; TOUCH.panel=null; })); }
  else { p.innerHTML='<div class="ttl">Ping d\'équipe</div><div class="row"><button data-k="">🎯<small>Auto</small></button>'+PK_ORDER.map(k=>`<button data-k="${k}">${PK[k].ico}<small>${PK[k].n.replace(' !','')}</small></button>`).join('')+'</div><div class="ttl" style="font-weight:400;font-size:12px">puis touche la carte</div>';
    p.querySelectorAll('[data-k]').forEach(b=>b.addEventListener('pointerdown',ev=>{ ev.preventDefault(); ev.stopPropagation(); TOUCH.pingKind=b.dataset.k||null; TOUCH.pingMode=true; touchPingTip(true); p.style.display='none'; TOUCH.panel=null; })); }
}
/* ---------- activation ---------- */
function touchLock(){ try{ if(TOUCH.on&&screen.orientation&&screen.orientation.lock) screen.orientation.lock('landscape').catch(()=>{}); }catch(e){} }
addEventListener('pointerdown',ev=>{ if(ev.pointerType==='touch') touchLock(); },true);
function touchSet(on){ TOUCH.on=!!on; touchBuild(); document.body.classList.toggle('tc',TOUCH.on); if(!TOUCH.on){ TOUCH.ix=TOUCH.iy=TOUCH.mag=0; TOUCH.aimOn=false; } }
function touchApplyMode(){ const m=TOUCH.mode; touchSet(m==='on'||(m==='auto'&&TOUCH.seen)); document.querySelectorAll('[data-tc]').forEach(b=>b.classList.toggle('on',b.dataset.tc===m)); }
function touchLoad(){ try{ TOUCH.mode=localStorage.getItem('pirates_touch')||'auto'; }catch(e){} TOUCH.seen=(window.matchMedia&&matchMedia('(pointer:coarse)').matches)||/Android|iPhone|iPad|iPod/i.test(navigator.userAgent); touchApplyMode(); }
addEventListener('pointerdown',ev=>{ if(ev.pointerType==='touch'&&!TOUCH.seen){ TOUCH.seen=true; if(TOUCH.mode==='auto') touchApplyMode(); } },true);
function touchBindMenu(){
  document.querySelectorAll('[data-tc]').forEach(b=>b.onclick=()=>{ TOUCH.mode=b.dataset.tc; try{ localStorage.setItem('pirates_touch',TOUCH.mode); }catch(e){} touchApplyMode(); });
  const fs=document.getElementById('tcFull'); if(fs) fs.onclick=()=>{ const d=document.documentElement; try{ if(document.fullscreenElement) document.exitFullscreen(); else { (d.requestFullscreen||d.webkitRequestFullscreen).call(d); if(screen.orientation&&screen.orientation.lock) screen.orientation.lock('landscape').catch(()=>{}); } }catch(e){} };
}
/* ---------- branchements ---------- */
{ const _pc=playerControl;
  playerControl=function(e,dt){
    if(!TOUCH.on||(!TOUCH.ix&&!TOUCH.iy&&!TOUCH.aimOn)) return _pc(e,dt);
    const kx=((keys.KeyD||keys['k:d']||keys.ArrowRight)?1:0)-((keys.KeyA||keys['k:q']||keys.ArrowLeft)?1:0), ky=((keys.KeyS||keys['k:s']||keys.ArrowDown)?1:0)-((keys.KeyW||keys['k:z']||keys.ArrowUp)?1:0);
    const [wx,wy]=curWorld(); controlEnt(e,dt,{ix:kx||TOUCH.ix,iy:ky||TOUCH.iy,wx,wy,down:mouse.down,clicked:mouse.clicked,sel:selId});
  };
  const _nl=netLocalInput;
  netLocalInput=function(){ const r=_nl(); if(TOUCH.on&&!r.ix&&!r.iy&&(TOUCH.ix||TOUCH.iy)){ const m=Math.hypot(TOUCH.ix,TOUCH.iy)||1; return {ix:TOUCH.ix/m,iy:TOUCH.iy/m}; } return r; };
  const _ua=updateAim;
  updateAim=function(){
    if(!TOUCH.on) return _ua();
    if(game.state!=='play'){ aim.ok=false; return; }
    const e=player; if(!e) return; let ax=TOUCH.ax, ay=TOUCH.ay, am=TOUCH.am;
    if(TOUCH.aimOn){ TOUCH.lastDir=[ax,ay,am]; }
    else if(TOUCH.mag>.25&&performance.now()/1000-TOUCH.relT>1.2){ const m=Math.hypot(TOUCH.ix,TOUCH.iy)||1; ax=TOUCH.ix/m; ay=TOUCH.iy/m; am=.45; TOUCH.ax=ax; TOUCH.ay=ay; TOUCH.am=am; TOUCH.lastDir=[ax,ay,am]; }
    else if(TOUCH.lastDir){ [ax,ay,am]=TOUCH.lastDir; }
    const d=T*(1.5+Math.min(1,am)*6); aim.x=e.x+ax*d; aim.y=e.y+ay*d; aim.ok=true;
  };
  const _r=render3d;
  render3d=function(dt){ _r(dt);
    if(!TOUCH.on||!TEL.root) return; const b=document.body, st=game.state;
    b.classList.toggle('tportrait',innerHeight>innerWidth); if(st==='play'&&player){ const l=hotList(player), hb=hotbarRect(l.length), w=l.length*(hb.s+hb.g)-hb.g, h=TEL.hot.style; h.left=(hb.x-8)+'px'; h.width=(w+16)+'px'; h.top=(hb.y-12)+'px'; h.height=(hb.s+22)+'px'; }
    b.classList.toggle('tmenu',st==='menu'); b.classList.toggle('tpause',!!game.paused); b.classList.toggle('tshop',!!shopOpen); b.classList.toggle('tover',st==='over');
    if(st==='play'&&player){ const s=w2s(aim.x,aim.y,0); mouse.x=s[0]; mouse.y=s[1];
      const spec=isSpec(); for(const id of ['tbSpL','tbSpR','tbSpF']) TEL[id].classList.toggle('hide',!spec); for(const id of ['tbJump','tbShop','tbRel','tbSwap','tbBlk','tbPing','tbEmo']) TEL[id].classList.toggle('hide',spec||!player.alive);
      TEL.tbShop.classList.toggle('hide',spec||!player.alive||!nearBase(player)&&!(boats&&boats.some(bt=>Math.hypot(bt.x-player.x,bt.y-player.y)<2.5*T)&&true));
      if(typeof TOUCHSPEC!=='undefined') TOUCHSPEC=spec&&SPEC.free&&(TOUCH.ix||TOUCH.iy)?{ix:TOUCH.ix,iy:TOUCH.iy}:null; }
  };
  /* barre d'objets plus compacte pour laisser la place aux boutons */
  const _hb=hotbarRect;
  hotbarRect=function(n){ if(!TOUCH.on) return _hb(n); const s=Math.min(46,Math.max(26,(VW*.5)/Math.max(1,n)-5)), g=5; return {s,g,x:(VW-n*(s+g)+g)/2,y:VH-s-8}; };
}
touchLoad(); touchBindMenu();
