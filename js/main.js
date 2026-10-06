'use strict';
/* =====================  ENTRÉES & BOUCLE  ===================== */
const DIGIT={'&':1,'é':2,'"':3,"'":4,'(':5,'-':6,'è':7,'_':8,'ç':9};
addEventListener('keydown',ev=>{
  const k=ev.key.length===1?ev.key.toLowerCase():ev.key;
  keys[ev.code]=true; keys['k:'+k]=true;
  if(ev.key==='Tab') ev.preventDefault();
  if(ev.code==='Space'||['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(ev.key)) ev.preventDefault();
  if(game.state==='menu') return;
  if(ev.repeat) return;
  if(game.state==='over'&&(k==='Enter'||k==='r')){showMenu();return;}
  if(game.state==='over'&&k==='Escape'){showMenu();return;}
  if(ev.code==='Space'){ if(player.alive&&game.state==='play') actJump(); return; }
  let d=0;
  if(/^Digit[0-9]$/.test(ev.code)) d=+ev.code.slice(5)||10; else if(/^Numpad[0-9]$/.test(ev.code)) d=+ev.code.slice(6)||10; else if(DIGIT[k]) d=DIGIT[k]; else if(k==='à') d=10;
  if(d){ const l=hotList(player); if(l[d-1]){ if(selId==='block'&&l[d-1].id==='block') actCycle(); setSel(l[d-1].id); } }
  else if(k==='Tab'){ ev.preventDefault(); if(player.alive) actSwap(); }
  else if(k==='e'){ if(!actBoat()) toggleShop(); }
  else if(k==='r'){ if(player.alive) actReload(); }
  else if(k==='c') actCycle();
  else if(k==='g') setQuality((Q.level+2)%3,true);
  else if(k==='m'){muted=!muted;msg(muted?'Son coupé (M)':'Son activé (M)','#cfe0ff');}
  else if(k==='Escape') toggleShop(false);
});
addEventListener('keyup',ev=>{const k=ev.key.length===1?ev.key.toLowerCase():ev.key;keys[ev.code]=false;keys['k:'+k]=false;});
addEventListener('blur',()=>{for(const k in keys)keys[k]=false;mouse.down=false;});
function bindMouse(c){
  c.addEventListener('mousemove',ev=>{mouse.x=ev.clientX;mouse.y=ev.clientY;});
  c.addEventListener('contextmenu',ev=>ev.preventDefault());
  c.addEventListener('mousedown',ev=>{
    mouse.x=ev.clientX;mouse.y=ev.clientY;
    if(game.state==='over'){showMenu();return;}
    if(game.state!=='play') return;
    if(ev.button===2){actCycle();return;}
    const l=hotList(player), hb=hotbarRect(l.length);
    if(mouse.y>=hb.y-6&&mouse.y<=hb.y+hb.s&&mouse.x>=hb.x&&mouse.x<hb.x+l.length*(hb.s+hb.g)){
      const i=Math.floor((mouse.x-hb.x)/(hb.s+hb.g)); if(l[i]){ if(selId==='block'&&l[i].id==='block') actCycle(); setSel(l[i].id);} return;
    }
    mouse.down=true;mouse.clicked=true;
  });
  c.addEventListener('wheel',ev=>{
    ev.preventDefault(); if(game.state!=='play') return;
    const l=hotList(player); if(!l.length) return;
    let i=Math.max(0,l.findIndex(it=>it.id===selId)); i=(i+(ev.deltaY>0?1:-1)+l.length)%l.length; setSel(l[i].id);
  },{passive:false});
}
addEventListener('mouseup',()=>{mouse.down=false;});
addEventListener('pointerdown',audioInit);addEventListener('keydown',audioInit);

function showMenu(){ netLeave(false); toggleShop(false); newGame(); game.state='menu'; document.getElementById('start').classList.remove('hidden'); }
function selectDiff(d){ game.diff=d; try{localStorage.setItem('pirates_diff',d);}catch(e){} document.querySelectorAll('#diff .dbtn').forEach(b=>b.classList.toggle('on',b.dataset.d===d)); document.getElementById('diffDesc').textContent=DIFFS[d].desc; }
const OPTDEF=[
  {k:'mode',t:'Mode',list:()=>Object.entries(MODES).map(([v,m])=>({v,n:m.n,d:m.d})),prev:true},
  {k:'map',t:'Carte',list:()=>Object.entries(MAPS).map(([v,m])=>({v,n:m.n,d:m.d})),prev:true},
  {k:'res',t:'Ressources',list:()=>OPT_RES.map(o=>({v:o.v,n:o.n,d:'Vitesse de production des ressources.'}))},
  {k:'start',t:'Départ',list:()=>OPT_START.map((o,i)=>({v:i,n:o.n,d:'Ressources de départ de chaque pirate.'}))},
  {k:'roster',t:'Roster',list:()=>[10,15,20,30,40,50,60,0].map(v=>({v,n:v?v+' objets':'Tous',d:'Objets disponibles en boutique : tirés au hasard à chaque partie ('+(v?v:'tous')+').'}))},
  {k:'evf',t:'Événements',list:()=>EV_FREQ.map((o,i)=>({v:i,n:o.n,d:'Fréquence des événements aléatoires (pluie de pièces, requin, tempête…).'}))},
  {k:'stack',t:'Hauteur max',list:()=>[1,2,3,4].map(v=>({v,n:v+(v>1?' blocs':' bloc'),d:'Nombre de blocs empilables : empile des blocs identiques sur tes murs (un mur de 2+ ne se saute plus !).'}))},
  {k:'core',t:'Coffres',list:()=>OPT_CORE.map((o,i)=>({v:i,n:o.n,d:'Résistance des coffres au trésor.'}))}
];
function saveChar(){ if(typeof netHello==='function') netHello(); try{localStorage.setItem('pirates_char',JSON.stringify({cls:game.cls,look:game.look,pname:game.pname}));}catch(e){} }
function renderChar(){
  const L=game.look, el=document.getElementById('charui'), ci=CLASSES[game.cls], sw=(arr,k)=>arr.map((c,i)=>`<button class="sw ${L[k]===i?'on':''}" data-lk="${k}" data-v="${i}" style="background:${c}"></button>`).join(''), bt=(arr,k)=>arr.map((n,i)=>`<button class="obtn ${L[k]===i?'on':''}" data-lk="${k}" data-v="${i}">${n}</button>`).join('');
  el.innerHTML=`<div class="orow"><span class="olab">Nom</span><input id="pname" maxlength="14" value="${(game.pname||'').replace(/"/g,'')}"></div>
  <div class="cls">${CLS_IDS.map(id=>`<button class="cbtn ${game.cls===id?'on':''}" data-cls="${id}">${CLASSES[id].ico} ${CLASSES[id].n}</button>`).join('')}</div>
  <div id="clsInfo"><b>${ci.n}</b> — ${ci.d}<br>${ci.pros.map(x=>`<span class="p">＋ ${x}</span>`).join(' · ')}${ci.cons.length?'<br>':''}${ci.cons.map(x=>`<span class="c">－ ${x}</span>`).join(' · ')}</div>
  <div class="orow"><span class="olab">Peau</span>${sw(SKINS,'skin')}<span class="olab" style="width:auto;margin-left:10px">Cheveux</span>${sw(HAIRS,'hair')}</div>
  <div class="orow"><span class="olab">Chapeau</span>${bt(HATS,'hat')}</div>
  <div class="orow"><span class="olab">Visage</span>${bt(FACES,'face')}<button class="obtn ${L.patch?'on':''}" data-lk="patch" data-v="${L.patch?0:1}">Cache-œil</button></div>`;
  el.querySelector('#pname').oninput=ev=>{ game.pname=ev.target.value; saveChar(); };
  el.querySelectorAll('[data-cls]').forEach(b=>b.onclick=()=>{ game.cls=b.dataset.cls; saveChar(); renderChar(); });
  el.querySelectorAll('[data-lk]').forEach(b=>b.onclick=()=>{ game.look[b.dataset.lk]=+b.dataset.v; saveChar(); renderChar(); });
}
function renderMp(){
  const el=id=>document.getElementById(id), role=NET.role;
  let info=''; if(role==='host') info=`Code du salon : <b>${NET.code}</b><br>${NET.status}`; else if(role==='guest') info=NET.status+(NET.code?` (salon ${NET.code})`:''); else info=NET.status||'';
  el('mpInfo').innerHTML=info;
  el('mpPlayers').textContent=NET.lobby&&NET.lobby.length&&role!=='none'?'Joueurs : '+NET.lobby.map(p=>p.name).join(' · '):'';
  el('mpStart').style.display=role==='host'&&!NET.started?'':'none'; el('mpLeave').style.display=role!=='none'&&!NET.started?'':'none';
  el('playBtn').style.display=role==='none'?'':'none'; el('mpHost').disabled=el('mpJoin').disabled=role!=='none';
}
function bindMp(){
  const el=id=>document.getElementById(id);
  NET.onLobby=renderMp; NET.onEnd=txt=>{ showMenu(); NET.status=txt; renderMp(); };
  el('mpHost').onclick=()=>{ netHost(el('mpLocal').checked); renderMp(); };
  el('mpJoin').onclick=()=>{ const c=el('mpCode').value.trim(); if(!c){ NET.status='Entre le code du salon.'; renderMp(); return; } netJoin(c,el('mpLocal').checked); renderMp(); };
  el('mpStart').onclick=()=>netHostStart();
  el('mpLeave').onclick=()=>{ netLeave(false); renderMp(); };
  renderMp();
}
function saveOpts(){ try{localStorage.setItem('pirates_opts',JSON.stringify(game.opts));}catch(e){} }
function renderOpts(){
  const box=document.getElementById('opts'); let desc='';
  box.innerHTML=OPTDEF.map(o=>`<div class="orow"><span class="olab">${o.t}</span>${o.list().map(it=>`<button class="obtn ${game.opts[o.k]===it.v?'on':''}" data-k="${o.k}" data-v="${it.v}" title="${it.d}">${it.n}</button>`).join('')}</div>`).join('');
  box.insertAdjacentHTML('beforeend',`<div class="orow"><span class="olab">Activés</span>${Object.keys(EVENTS).map(k=>`<button class="obtn ${game.opts.ev[k]?'on':''}" data-ev="${k}" title="${EVENTS[k].d}">${EVENTS[k].ico} ${EVENTS[k].n}</button>`).join('')}</div>`);
  box.querySelectorAll('[data-ev]').forEach(b=>b.onclick=()=>{ const k=b.dataset.ev; game.opts.ev[k]=game.opts.ev[k]?0:1; saveOpts(); renderOpts(); document.getElementById('optDesc').textContent=EVENTS[k].ico+' '+EVENTS[k].n+' : '+EVENTS[k].d+(game.opts.ev[k]?'':' (désactivé)'); });
  box.querySelectorAll('.obtn[data-k]').forEach(b=>b.onclick=()=>{
    const k=b.dataset.k, def=OPTDEF.find(o=>o.k===k), it=def.list().find(x=>String(x.v)===b.dataset.v);
    game.opts[k]=it.v; saveOpts(); renderOpts(); document.getElementById('optDesc').textContent=it.d;
    if(def.prev){ const st=game.state; newGame(); game.state='menu'; }
  });
}
let hudN=0, last=performance.now(), shopT=0;
function frame(now){
  const dt=Math.min(.05,(now-last)/1000); last=now;
  if(game.state!=='menu'){
    if(NETCLIENT) netClientFrame(dt); else { update(dt); mouse.clicked=false; if(NETON) netHostTick(dt); }
    shopT+=dt; if(shopOpen&&shopT>.4){shopT=0;renderShop();}
  } else { game.t+=dt; updateFx(dt); }
  if(game.state==='menu') renderPreview(game.t);
  render3d(dt); hudN=(hudN+1)|0; if(Q.level>=2||(hudN&1)) drawHud();
  requestAnimationFrame(frame);
}
function boot(){
  initRender(); initUI(); bindMouse(document.getElementById('ui'));
  document.querySelectorAll('#diff .dbtn').forEach(b=>b.onclick=()=>selectDiff(b.dataset.d));
  try{ const o=JSON.parse(localStorage.getItem('pirates_opts')||'null'); if(o) for(const k in game.opts) if(o[k]!==undefined) game.opts[k]=o[k]; }catch(e){}
  for(const k of Object.keys(EVENTS)) if(game.opts.ev[k]===undefined) game.opts.ev[k]=1;
  if(!MAPS[game.opts.map]) game.opts.map='classic'; if(!MODES[game.opts.mode]) game.opts.mode='solo'; renderOpts();
  try{ const c=JSON.parse(localStorage.getItem('pirates_char')||'null'); if(c){ if(CLASSES[c.cls]) game.cls=c.cls; if(c.look) game.look=lookOf(c.look); if(typeof c.pname==='string') game.pname=c.pname; } }catch(e){}
  renderChar(); initPreview(); bindMp();
  let d0='normal'; try{ d0=localStorage.getItem('pirates_diff')||'normal'; }catch(e){} selectDiff(DIFFS[d0]?d0:'normal');
  document.getElementById('playBtn').onclick=()=>{audioInit();document.getElementById('start').classList.add('hidden');newGame();};
  newGame(); game.state='menu';
  requestAnimationFrame(frame);
}
boot();
