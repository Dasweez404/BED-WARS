'use strict';
/* =====================  MULTIJOUEUR EN LIGNE (pair-à-pair, hôte autoritaire)  =====================
   L'hôte exécute toute la simulation ; les invités envoient leurs commandes et reçoivent des instantanés (~15 Hz).
   Transport : WebRTC via PeerJS (courtier public gratuit), ou BroadcastChannel (code "L-XXXX") pour tester sur 2 onglets. */
let NETON=false, NETCLIENT=false;
const NET={role:'none',peer:null,conns:[],hostConn:null,code:'',slots:{},status:'',started:false,seq:0,fx:[],fxLog:[],fxBase:0,sendT:0,inT:0,myTeam:0,base:null,ids:0,inp:{ix:0,iy:0,wx:0,wy:0,down:false,sel:'sword',clk:0},hostX:0,hostY:0,lobby:[],lastHp:20,onLobby:null,onEnd:null};
const NET_MAX_GUESTS=3;
function netHello(){ if(NET.role==='guest'&&NET.hostConn&&NET.hostConn.open&&!NET.started) netSend({t:'hello',name:game.pname||'Pirate',cls:game.cls,look:game.look}); }
function netSend(m){ if(NET.hostConn&&NET.hostConn.open!==false) NET.hostConn.send(m); }

/* ---------- transport local (onglets du même navigateur) ---------- */
class Emitter{ constructor(){this.h={};} on(e,f){(this.h[e]=this.h[e]||[]).push(f);return this;} emit(e,...a){(this.h[e]||[]).forEach(f=>f(...a));} }
class LocalConn extends Emitter{
  constructor(peer,remote,cid){ super(); this.peer=peer; this.remote=remote; this.cid=cid; this.open=false; }
  send(d){ this.peer.bus.postMessage({k:'d',to:this.remote,from:this.peer.id,cid:this.cid,d}); }
  close(){ if(!this.open) return; this.open=false; this.peer.bus.postMessage({k:'x',to:this.remote,from:this.peer.id,cid:this.cid}); this.emit('close'); }
}
class LocalPeer extends Emitter{
  constructor(id){ super(); this.id=id; this.bus=new BroadcastChannel('pirates-local'); this.conns={};
    this.bus.onmessage=ev=>{ const m=ev.data; if(m.to!==this.id) return;
      if(m.k==='conn'){ const c=new LocalConn(this,m.from,m.cid); c.open=true; this.conns[m.cid]=c; this.bus.postMessage({k:'ack',to:m.from,from:this.id,cid:m.cid}); this.emit('connection',c); setTimeout(()=>c.emit('open'),0); }
      else if(m.k==='ack'){ const c=this.conns[m.cid]; if(c){ c.open=true; c.emit('open'); } }
      else if(m.k==='d'){ const c=this.conns[m.cid]; if(c) c.emit('data',m.d); }
      else if(m.k==='x'){ const c=this.conns[m.cid]; if(c&&c.open){ c.open=false; c.emit('close'); } } };
    setTimeout(()=>this.emit('open',id),0); }
  connect(id){ const cid=Math.random().toString(36).slice(2); const c=new LocalConn(this,id,cid); this.conns[cid]=c; this.bus.postMessage({k:'conn',to:id,from:this.id,cid}); setTimeout(()=>{ if(!c.open) this.emit('error',{type:'peer-unavailable'}); },1500); return c; }
  destroy(){ try{this.bus.close();}catch(e){} }
}
function netMakePeer(id,local){
  if(local) return new LocalPeer(id);
  const q=new URLSearchParams(location.search), o={debug:0};
  if(q.get('peerhost')){ o.host=q.get('peerhost'); o.port=+(q.get('peerport')||443); o.path=q.get('peerpath')||'/'; o.secure=q.get('peersecure')!=='0'; }
  return new Peer(id,o);
}
const netCode=()=>{ const a='ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let s=''; for(let i=0;i<5;i++) s+=a[Math.floor(Math.random()*a.length)]; return s; };
const netPeerId=code=>'pirates-bw-'+code.replace(/^L-/,'');
function netStatus(t){ NET.status=t; if(NET.onLobby) NET.onLobby(); }

/* ---------- hôte : salon ---------- */
function netHost(local){
  netLeave(true); NET.role='host'; NET.local=!!local; NET.code=(local?'L-':'')+netCode(); NET.slots={}; NET.started=false;
  if(typeof Peer==='undefined'&&!local){ netStatus('Bibliothèque PeerJS introuvable.'); return; }
  netStatus('Connexion au courtier…');
  const peer=NET.peer=netMakePeer(netPeerId(NET.code),local);
  peer.on('open',()=>netStatus('Salon ouvert. Donne le code à tes amis.'));
  peer.on('error',e=>{ netStatus('Erreur réseau : '+(e&&e.type||e)); });
  peer.on('connection',conn=>{
    conn.on('open',()=>{
      const used=Object.keys(NET.slots).map(Number), free=[1,2,3].filter(t=>!used.includes(t));
      if(NET.started||!free.length){ conn.send({t:'full'}); setTimeout(()=>conn.close&&conn.close(),300); return; }
      const team=free[0]; NET.slots[team]={conn,name:'Pirate',cls:'matelot',look:null,team}; conn.send({t:'welcome',team}); netLobbyBroadcast();
      conn.on('data',m=>netHostData(team,m));
      conn.on('close',()=>netHostDrop(team));
    });
  });
  NET.hostLobby=true; netLobbyBroadcast();
}
function netLobbyBroadcast(){
  NET.lobby=[{team:0,name:(game.pname||'Hôte')+' (hôte)'}].concat(Object.values(NET.slots).map(s=>({team:s.team,name:s.name})));
  for(const s of Object.values(NET.slots)) try{ s.conn.send({t:'lobby',players:NET.lobby}); }catch(e){}
  if(NET.onLobby) NET.onLobby();
}
function netHostData(team,m){
  const s=NET.slots[team]; if(!s||!m) return;
  if(m.t==='hello'){ s.name=String(m.name||'Pirate').slice(0,14); s.cls=m.cls; s.look=m.look; netLobbyBroadcast(); return; }
  const e=ents.find(o=>o.remote&&o.team===team); if(!e||!NET.started) return;
  if(m.t==='in'){ const q=e.inp; q.ix=+m.ix||0; q.iy=+m.iy||0; q.wx=+m.wx||0; q.wy=+m.wy||0; q.down=!!m.down; q.sel=String(m.sel||'sword'); if(m.clk>0) q.clicked=true; if(m.px!==undefined){ q.px=+m.px; q.py=+m.py; } }
  else if(m.t==='act'){
    if(!e.alive) return;
    if(m.a==='jump') jump(e);
    else if(m.a==='rl'){ if(GUNS[e.inp.sel]) startReload(e,e.inp.sel); }
    else if(m.a==='cb') cycleBlock(e);
    else if(m.a==='sw') swapPack(e,e.inp.sel);
  }
  else if(m.t==='buy'){ if(e.alive&&nearBase(e)&&buy(e,String(m.id))){ ring(e.x,e.y,T*1.2,'#fde68a',.35); floatTxt(e.x,e.y-40,'Acheté !','#fde68a',15); } }
}
function netHostDrop(team){
  const s=NET.slots[team]; delete NET.slots[team];
  if(!NET.started){ netLobbyBroadcast(); return; }
  const e=ents.find(o=>o.remote&&o.team===team); if(e){ e.remote=false; e.isBot=true; e.ai=makeBotAI(); msg(`${e.name} a quitté la partie (un bot prend la relève).`,'#fca5a5'); }
}
function netHostStart(){
  if(NET.role!=='host'||NET.started) return;
  NET.started=true; NETON=true; NETCLIENT=false;
  NETSLOTS={}; for(const s of Object.values(NET.slots)) NETSLOTS[s.team]={name:s.name,cls:s.cls,look:s.look};
  newGame(); NET.fxLog=[]; NET.fxBase=0; NET.seq=0; NET.sendT=0;
  for(const sl of Object.values(NET.slots)){ sl.base=netBaseline(); sl.sstr=[]; sl.ownLast={}; sl.ownT=0; sl.fxPos=0; }
  for(const s of Object.values(NET.slots)) s.conn.send({t:'start',team:s.team,opts:game.opts,diff:game.diff,slots:NETSLOTS,roster:ROSTER?[...ROSTER]:null});
  document.getElementById('start').classList.add('hidden');
}
function netBaseline(){ return {f:new Uint8Array(floorT.length),w:new Uint8Array(floorT.length),hf:new Float32Array(floorT.length),hw:new Float32Array(floorT.length),of:new Int8Array(floorT.length).fill(-1),ow:new Int8Array(floorT.length).fill(-1)}; }

/* ---------- invité ---------- */
function netJoin(code,local){
  netLeave(true); NET.role='guest'; NET.local=!!local||/^L-/i.test(code); code=code.trim().toUpperCase(); NET.code=code;
  if(typeof Peer==='undefined'&&!NET.local){ netStatus('Bibliothèque PeerJS introuvable.'); return; }
  netStatus('Connexion…');
  const peer=NET.peer=netMakePeer(null,NET.local);
  if(NET.local) peer.id='G'+netCode();
  const go=()=>{
    const conn=NET.hostConn=peer.connect(netPeerId(code),NET.local?undefined:{reliable:true,serialization:'json'});
    conn.on('open',()=>{ netStatus('Connecté. En attente de l\'hôte…'); conn.send({t:'hello',name:game.pname||'Pirate',cls:game.cls,look:game.look}); });
    conn.on('data',netGuestData);
    conn.on('close',()=>{ if(NET.role==='guest'){ netStatus('Connexion perdue.'); if(NET.started&&NET.onEnd) NET.onEnd('L\'hôte a quitté la partie.'); else netLeave(false); } });
  };
  if(NET.local) setTimeout(go,50); else peer.on('open',go);
  peer.on('error',e=>netStatus(e&&e.type==='peer-unavailable'?'Salon introuvable : vérifie le code.':'Erreur réseau : '+(e&&e.type||e)));
}
function netGuestData(m){
  if(!m) return;
  if(m.t==='lobby'){ NET.lobby=m.players; if(NET.onLobby) NET.onLobby(); }
  else if(m.t==='welcome'){ NET.myTeam=m.team; netStatus('Connecté (équipe '+(m.team+1)+'). En attente de l\'hôte…'); }
  else if(m.t==='full'){ netStatus('Salon complet ou partie déjà lancée.'); }
  else if(m.t==='start'){
    NET.started=true; NETON=true; NETCLIENT=true; NET.myTeam=m.team; game.opts=m.opts; game.diff=m.diff; NETSLOTS=m.slots;
    NET.snapped=false; newGame(); if(m.roster) ROSTER=new Set(m.roster); else ROSTER=null;
    player=ents.find(e=>e.team===m.team&&e.slot===0); NET.base=null; NET.inT=0; NET.hostX=player.x; NET.hostY=player.y; NET.lastHp=player.hp;
    game.state='play'; document.getElementById('start').classList.add('hidden');
  }
  else if(m.t==='s'&&NETCLIENT) netApplySnap(m);
}
function netLeave(keepLobbyUI){
  try{ for(const s of Object.values(NET.slots)) s.conn.close&&s.conn.close(); }catch(e){}
  try{ if(NET.hostConn&&NET.hostConn.close) NET.hostConn.close(); }catch(e){}
  try{ if(NET.peer&&NET.peer.destroy) NET.peer.destroy(); }catch(e){}
  NET.role='none'; NET.peer=null; NET.hostConn=null; NET.slots={}; NET.started=false; NET.lobby=[]; NETON=false; NETCLIENT=false; NETSLOTS=null; NET.code='';
  if(!keepLobbyUI) netStatus('');
}

/* ---------- sérialisation (compacte : on n'envoie que ce qui n'est pas nul / pas changé) ---------- */
const R2=v=>{ if(typeof v==='number') return Math.round(v*100)/100; if(Array.isArray(v)) return v.map(R2); if(v&&typeof v==='object'&&!(v instanceof Set)){ const o={}; for(const k in v){ const x=v[k]; if(typeof x==='function') continue; o[k]=R2(x); } return o; } return v; };
const ENT_SKIP=new Set(['ai','lastBy','burnBy','hook','inp','x','y','z','ang','held','ix','iy','_tx','_ty','_tz','_follow','_ff']);
const ENT_STATIC=['team','slot','name','cls','look','isBot','remote','up'];
const ENT_NUM=['resp','inv','flash','swing','swingMax','cloak','bubble','frozen','slow','root','curse','aegis','plate','rage','burn','slip','squash','muzzle','stepPh','springT','jetT','voidT','haste','kills','deaths','ix','iy','bsel','sword','jet','grap','shield','sdx','sdy'];
const r1=v=>Math.round(v*10)/10, r2=v=>Math.round(v*100)/100;
function packEntDyn(e){
  const o={x:r1(e.x),y:r1(e.y),z:r1(e.z),g:r2(e.ang),h:r1(e.hp),a:e.alive?1:0};
  if(e.elim) o.el=1; if(e.held&&e.held!=='sword') o.he=e.held;
  for(const k of ENT_NUM){ const v=e[k]; if(v) o[k]=typeof v==='number'?r2(v):v; }
  if(e.cd.gad>0) o.cg=r2(e.cd.gad); if(e.cd.place>0) o.cp=r2(e.cd.place); if(e.cd.mine>0) o.cm=r2(e.cd.mine); if(e.cd.atk>0) o.ca=r2(e.cd.atk);
  const w=GUNS[e.held]&&e.ws[e.held]; if(w) o.ws=[w.a,r2(w.r),r2(w.cd),r2(w.last)];
  if(e.hook) o.hk=1; if(e.pull) o.pl=[r1(e.pull.x),r1(e.pull.y),r2(e.pull.t||0)];
  return o;
}
function unpackEntDyn(e,p){
  e.alive=!!p.a; e.hp=p.h; e.elim=!!p.el; e.held=p.he||'sword';
  for(const k of ENT_NUM) e[k]=p[k]||0;
  e.cd.gad=p.cg||0; e.cd.place=p.cp||0; e.cd.mine=p.cm||0; e.cd.atk=p.ca||0;
  if(p.ws){ e.ws[e.held]=e.ws[e.held]||{a:0,r:0,cd:0,b:0,n:0,last:-9}; const w=e.ws[e.held]; w.a=p.ws[0]; w.r=p.ws[1]; w.cd=p.ws[2]; w.last=p.ws[3]; }
  e.hook=p.hk?(e.hook||{x:e.x,y:e.y}):null; e.pull=p.pl?{x:p.pl[0],y:p.pl[1],t:p.pl[2]}:null;
}
const DYN_SKIP=new Set(['owner','hit','target','wp']);
function packDyn(list){
  const out=[]; for(const o of list.slice(0,60)){ if(!o._id) o._id=++NET.ids; const p={_id:o._id}; for(const k in o){ if(k[0]==='_'||DYN_SKIP.has(k)||typeof o[k]==='function'||typeof o[k]==='object'&&o[k]!==null&&!Array.isArray(o[k])) continue; p[k]=o[k]; } if(o.owner){ const i=ents.indexOf(o.owner); if(i>=0) p.oi=i; } out.push(R2(p)); }
  return out;
}
function netCommon(){
  return {t:'s',n:++NET.seq,gt:Math.round(game.t*100)/100,st:game.state,wt:game.winTeam,e:ents.map(packEntDyn),
    td:TD.map(t=>t.coreAlive?1:0),sp:spawners.map(s=>Object.values(s.types).map(t=>t.stock)),
    pj:packDyn(projs),bm:packDyn(bombs),tr:packDyn(traps),gd:packDyn(guards),ch:packDyn(chickens),sh:packDyn(shields),hk:packDyn(hooks),pr:packDyn(pearls),sk:packDyn(sharks),dr:packDyn(drops),
    ev:{c:EV.cur?{id:EV.cur.id,t:Math.round(EV.cur.t*10)/10,dur:EV.cur.dur}:null,rush:EV.rush,fog:Math.round(EV.fog*100)/100,dark:Math.round(EV.dark*100)/100}};
}
function netTileDiff(B){
  const tl=[];
  for(let i=0;i<floorT.length;i++){
    const hf=Math.round(hpF[i]*2)/2, hw=Math.ceil(hpW[i]*2)/2;
    if(floorT[i]!==B.f[i]||wallT[i]!==B.w[i]||hf!==B.hf[i]||hw!==B.hw[i]||ownF[i]!==B.of[i]||ownW[i]!==B.ow[i]){
      tl.push(i,floorT[i],wallT[i],hf,hw,ownF[i],ownW[i]); B.f[i]=floorT[i]; B.w[i]=wallT[i]; B.hf[i]=hf; B.hw[i]=hw; B.of[i]=ownF[i]; B.ow[i]=ownW[i];
    }
  }
  return tl;
}
function netHostTick(dt){
  NET.sendT-=dt; if(NET.sendT>0||!NET.started) return; NET.sendT=1/15;
  if(NET.fxLog.length>600){ NET.fxLog.splice(0,300); NET.fxBase+=300; }
  const common=netCommon(); const now=performance.now();
  for(const s of Object.values(NET.slots)){
    const dc=s.conn.dataChannel; if(dc&&dc.bufferedAmount>40000) continue; // lien saturé : on saute cet instantané (pas de file d'attente)
    const i=ents.findIndex(o=>o.remote&&o.team===s.team); if(i<0) continue; const e=ents[i];
    const sn=Object.assign({},common);
    sn.tl=netTileDiff(s.base);
    // infos statiques : seulement si elles ont changé
    const sx={}; ents.forEach((q,k)=>{ const o={}; for(const f of ENT_STATIC) o[f]=q[f]; const str=JSON.stringify(o); if(s.sstr[k]!==str){ s.sstr[k]=str; sx[k]=o; } }); if(Object.keys(sx).length) sn.sx=sx;
    // ton pirate : seulement les champs qui ont changé
    if(now-s.ownT>3000){ s.ownLast={}; s.ownT=now; }
    const d={}; for(const k in e){ if(ENT_SKIP.has(k)||typeof e[k]==='function'||e[k] instanceof Set) continue; const v=R2(e[k]), str=JSON.stringify(v); if(s.ownLast[k]!==str){ s.ownLast[k]=str; d[k]=v; } }
    sn.own={i,d,ff:e._ff?1:0};
    const from=Math.max(0,s.fxPos-NET.fxBase); sn.fx=NET.fxLog.slice(Math.max(from,NET.fxLog.length-70)); s.fxPos=NET.fxBase+NET.fxLog.length;
    try{ s.conn.send(sn); }catch(err){}
  }
}
/* ---------- application côté invité ---------- */
function applyDyn(cur,inc){
  const map=new Map(cur.map(o=>[o._id,o])), out=[];
  for(const p of inc){ let o=map.get(p._id);
    if(!o){ o=p; o._tx=p.x; o._ty=p.y; } else { o._tx=p.x; o._ty=p.y; for(const k in p){ if(k!=='x'&&k!=='y') o[k]=p[k]; } }
    if(p.oi!==undefined) o.owner=ents[p.oi]||null; out.push(o); }
  return out;
}
function netApplySnap(m){
  if(m.n<=NET.inT) return; NET.inT=m.n;
  game.state=m.st; if(m.st==='over'){ game.winTeam=m.wt; game.win=m.wt===player.team; }
  for(let i=0;i<m.tl.length;i+=7){ const k=m.tl[i]; if(floorT[k]!==m.tl[i+1]||wallT[k]!==m.tl[i+2]) pop[k]=1; floorT[k]=m.tl[i+1]; wallT[k]=m.tl[i+2]; hpF[k]=m.tl[i+3]; hpW[k]=m.tl[i+4]; ownF[k]=m.tl[i+5]; ownW[k]=m.tl[i+6]; }
  m.td.forEach((v,i)=>{ TD[i].coreAlive=!!v; });
  m.sp.forEach((arr,i)=>{ const ty=Object.values(spawners[i].types); arr.forEach((v,j)=>{ if(ty[j]) ty[j].stock=v; }); });
  if(m.sx) for(const k in m.sx){ const e=ents[k]; if(e) for(const f in m.sx[k]) e[f]=m.sx[k][f]; }
  const firstSnap=!NET.snapped;
  m.e.forEach((p,i)=>{ const e=ents[i]; if(!e) return; const first=e._tx===undefined; e._tx=p.x; e._ty=p.y; e._tz=p.z;
    if(e===player){ NET.wasAlive=e.alive; } else { e.ang=p.g; }
    const keepIx=e===player; const ix=e.ix,iy=e.iy,held=e.held; unpackEntDyn(e,p); if(keepIx){ e.ix=ix; e.iy=iy; e.held=held; }
    if(first){ e.x=p.x; e.y=p.y; e.z=p.z; } });
  if(m.own){ const e=ents[m.own.i], d=m.own.d; for(const k in d) e[k]=d[k]; const p=m.e[m.own.i]; NET.hostX=p.x; NET.hostY=p.y; NET.ff=!!m.own.ff;
    if(!e.alive||(e.alive&&NET.wasAlive===false)) { e.x=p.x; e.y=p.y; }
    if(p.h<NET.lastHp-.05){ game.hurtFx=.4; shake=Math.max(shake,5+(NET.lastHp-p.h)); } NET.lastHp=p.h; }
  if(firstSnap){ NET.snapped=true; for(const [,mm] of entM) scene.remove(mm); entM.clear(); }
  projs=applyDyn(projs,m.pj); bombs=applyDyn(bombs,m.bm); traps=applyDyn(traps,m.tr); guards=applyDyn(guards,m.gd); chickens=applyDyn(chickens,m.ch);
  shields=applyDyn(shields,m.sh); hooks=applyDyn(hooks,m.hk); pearls=applyDyn(pearls,m.pr); sharks=applyDyn(sharks,m.sk); drops=applyDyn(drops,m.dr);
  EV.cur=m.ev.c; EV.rush=m.ev.rush; EV.fog=m.ev.fog; EV.dark=m.ev.dark;
  for(const f of m.fx) netPlayFx(f);
}
/* ---------- effets visuels répliqués ---------- */
const FX0={burst,ring,chunks,smoke,floatTxt,msg,announce,sfx};
const FXSKIP_TXT=/^(Retourne|Acheté|Rien en|Sélectionne|Vise la mer|Tu |Mort hors|Protège|Roster|Barre pleine)/;
function netRec(k,args){ if(NET.role==='host'&&NET.started&&NET.fxLog.length<900) NET.fxLog.push([k,...args]); }
burst=function(...a){ netRec('b',a); return FX0.burst(...a); };
ring=function(...a){ netRec('r',a); return FX0.ring(...a); };
chunks=function(...a){ netRec('c',a); return FX0.chunks(...a); };
smoke=function(...a){ netRec('m',a); return FX0.smoke(...a); };
floatTxt=function(...a){ if(!FXSKIP_TXT.test(String(a[2]))) netRec('f',a); return FX0.floatTxt(...a); };
msg=function(...a){ if(!FXSKIP_TXT.test(String(a[0]))) netRec('g',a); return FX0.msg(...a); };
announce=function(...a){ netRec('a',a); return FX0.announce(...a); };
sfx=function(...a){ netRec('s',a); return FX0.sfx(...a); };
function netPlayFx(f){
  const k=f[0], a=f.slice(1);
  switch(k){ case 'b':FX0.burst(...a);break; case 'r':FX0.ring(...a);break; case 'c':FX0.chunks(...a);break; case 'm':FX0.smoke(...a);break; case 'f':FX0.floatTxt(...a);break; case 'g':FX0.msg(...a);break; case 'a':FX0.announce(...a);break; case 's':FX0.sfx(...a);break; }
}
/* ---------- boucle de l'invité ---------- */
function netLocalInput(){
  const up=keys.KeyW||keys['k:z']||keys.ArrowUp, dn=keys.KeyS||keys['k:s']||keys.ArrowDown, lf=keys.KeyA||keys['k:q']||keys.ArrowLeft, rt=keys.KeyD||keys['k:d']||keys.ArrowRight;
  let ix=(rt?1:0)-(lf?1:0), iy=(dn?1:0)-(up?1:0); const m=Math.hypot(ix,iy)||1; return {ix:ix/m,iy:iy/m};
}
function netClientFrame(dt){
  game.t+=dt; updateFx(dt);
  const me=player; if(!me||game.state==='menu') return;
  const li=netLocalInput(); const inp=NET.inp; inp.ix=li.ix; inp.iy=li.iy; inp.wx=aim.x; inp.wy=aim.y; inp.down=!!mouse.down; inp.sel=selId; if(mouse.clicked) inp.clk=1;
  if(game.state==='play'){
    if(!me.bar.includes(selId)) selId='sword'; me.held=selId; if(me.alive&&me.slip<=0) me.ang=Math.atan2(aim.y-me.y,aim.x-me.x);
    if(me.alive&&me.frozen<=0&&me.bubble<=0&&me.root<=0&&!me.pull&&!NET.ff){ const sp=speedOf(me); moveEnt(me,li.ix*sp*dt,li.iy*sp*dt); }
    if(shopOpen&&(!me.alive||!nearBase(me))) toggleShop(false);
  }
  mouse.clicked=false;
  const k=Math.min(1,dt*16);
  for(const e of ents){ if(e._tx===undefined) continue;
    if(e===player){ const ex=NET.hostX-e.x, ey=NET.hostY-e.y, d=Math.hypot(ex,ey);
      // l'invité pilote sa position (réactif) ; on ne se recale sur l'hôte que s'il y a une vraie correction (recul, gel, mort…)
      if(NET.ff||!e.alive){ const kk=Math.min(1,dt*14); e.x+=ex*kk; e.y+=ey*kk; } else if(d>170){ const kk=Math.min(1,dt*8); e.x+=ex*kk; e.y+=ey*kk; } }
    else { e.x+=(e._tx-e.x)*k; e.y+=(e._ty-e.y)*k; }
    if(e._tz!==undefined) e.z+=(e._tz-e.z)*Math.min(1,dt*20); }
  for(const L of [projs,bombs,traps,guards,chickens,sharks,drops,pearls]) for(const o of L){ if(o._tx!==undefined){ o.x+=(o._tx-o.x)*k; o.y+=(o._ty-o.y)*k; } }
  NET.sendT-=dt; if(NET.sendT<=0){ NET.sendT=1/30; netSend({t:'in',ix:inp.ix,iy:inp.iy,wx:Math.round(inp.wx),wy:Math.round(inp.wy),down:inp.down,sel:inp.sel,clk:inp.clk,px:Math.round(me.x*10)/10,py:Math.round(me.y*10)/10}); inp.clk=0; }
}
/* hôte : la position d'un invité est pilotée par lui (validée), sauf en cas de force extérieure */
function netFollow(e,dt,q){
  e._follow=false; e._ff=0; if(q.px===undefined||!e.alive) return;
  if(Math.hypot(e.vx,e.vy)>40||e.pull||e.frozen>0||e.bubble>0||e.root>0||e.jetT>0||e.slip>0||e.inv>1.5){ e._ff=1; return; }
  const dx=q.px-e.x, dy=q.py-e.y, d=Math.hypot(dx,dy);
  if(d>150){ e._ff=1; return; }
  const kk=Math.min(1,dt*22); moveEnt(e,dx*kk,dy*kk); e._follow=true;
}
/* ---------- actions (locales ou envoyées à l'hôte) ---------- */
function actJump(){ if(NETCLIENT) netSend({t:'act',a:'jump'}); else jump(player); }
function actReload(){ if(NETCLIENT) netSend({t:'act',a:'rl'}); else if(GUNS[selId]&&startReload(player,selId)) floatTxt(player.x,player.y-40,'Recharge…','#ffd27d',13); }
function actCycle(){ if(NETCLIENT) netSend({t:'act',a:'cb'}); else cycleBlock(player); }
function actSwap(){ if(NETCLIENT) netSend({t:'act',a:'sw'}); else swapPack(player); }
