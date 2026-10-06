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
  if(k==='Escape'&&game.state==='play'){ if(shopOpen) toggleShop(false); else togglePause(); return; }
  if(game.paused) return;
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
    if(game.state!=='play'||game.paused) return;
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

let _trBusy=false;
function screenTransition(fn){ // volet en iris : on couvre l'écran, on change, on découvre
  const f=document.getElementById('fade'); if(!f||_trBusy){ fn(); return; } _trBusy=true; f.classList.add('on');
  setTimeout(()=>{ try{ fn(); }finally{ requestAnimationFrame(()=>{ f.classList.remove('on'); setTimeout(()=>{ _trBusy=false; },480); }); } },480);
}
function showMenu(){ if(game.state==='menu') return _showMenu(); screenTransition(_showMenu); }
function _showMenu(){ setPause(false); netLeave(false); toggleShop(false); newGame(); game.state='menu'; document.getElementById('start').classList.remove('hidden'); }
function selectDiff(d){ game.diff=d; try{localStorage.setItem('pirates_diff',d);}catch(e){} document.querySelectorAll('#diff .dbtn').forEach(b=>b.classList.toggle('on',b.dataset.d===d)); document.getElementById('diffDesc').textContent=DIFFS[d].desc; }
const OPTDEF=[
  {k:'mode',t:'Mode',list:()=>Object.entries(MODES).map(([v,m])=>({v,n:m.n,d:m.d})),prev:true},
  {k:'map',t:'Carte',list:()=>Object.entries(MAPS).map(([v,m])=>({v,n:m.n,d:m.d})),prev:true},
  {k:'res',t:'Ressources',list:()=>OPT_RES.map(o=>({v:o.v,n:o.n,d:'Vitesse de production des ressources.'}))},
  {k:'start',t:'Départ',list:()=>OPT_START.map((o,i)=>({v:i,n:o.n,d:'Ressources de départ de chaque pirate.'}))},
  {k:'roster',t:'Roster',list:()=>[10,15,20,30,40,50,60,0].map(v=>({v,n:v?v+' objets':'Tous',d:'Objets disponibles en boutique : tirés au hasard à chaque partie ('+(v?v:'tous')+').'}))},
  {k:'evf',t:'Événements',list:()=>EV_FREQ.map((o,i)=>({v:i,n:o.n,d:'Fréquence des événements aléatoires (pluie de pièces, requin, tempête…).'}))},
  {k:'style',t:'Style',list:()=>[{v:'2d',n:'Sprites 2D',d:'Personnages, objets, herbe et mouettes dessinés en 2D (style cartoon).'},{v:'3d',n:'Cubes 3D',d:'Pirates cubiques chibi en 3D, aux couleurs de leur équipe.'}],apply:true},
  {k:'stack',t:'Hauteur max',list:()=>[1,2,3,4].map(v=>({v,n:v+(v>1?' blocs':' bloc'),d:'Nombre de blocs empilables : empile des blocs identiques sur tes murs (un mur de 2+ ne se saute plus !).'}))},
  {k:'dn',t:'Cycle',list:()=>[{v:0,n:'Jour fixe',d:'Il fait toujours jour.'},{v:1,n:'Jour & nuit',d:'Le soleil se couche : nuits sombres éclairées par les halos des coffres et des pirates.'},{v:2,n:'Nuit',d:'Il fait nuit en permanence.'}]},
  {k:'wth',t:'Météo',list:()=>[{v:0,n:'Aucune',d:'Ciel dégagé en permanence.'},{v:1,n:'Variable',d:'Pluie, brouillard et orages passent de temps en temps.'},{v:2,n:'Orageuse',d:'Souvent de la pluie, du brouillard et des orages.'}]},
  {k:'pers',t:'Bots',list:()=>[{v:0,n:'Classiques',d:'Tous les bots se comportent de la même façon.'},{v:1,n:'Personnalités',d:'Les capitaines ont chacun un caractère : Rusé, Bâtisseur, Kamikaze, Chasseur de primes ou Pillard.'}]},
  {k:'core',t:'Coffres',list:()=>OPT_CORE.map((o,i)=>({v:i,n:o.n,d:'Résistance des coffres au trésor.'}))}
];
function saveChar(){ if(typeof netHello==='function') netHello(); try{localStorage.setItem('pirates_char',JSON.stringify({cls:game.cls,look:game.look,pname:game.pname}));}catch(e){} }
function renderChar(){
  const L=game.look, el=document.getElementById('charui'), ci=CLASSES[game.cls], sw=(arr,k)=>arr.map((c,i)=>`<button class="sw ${L[k]===i?'on':''}" data-lk="${k}" data-v="${i}" style="background:${c}"></button>`).join(''), bt=(arr,k)=>arr.map((n,i)=>`<button class="obtn ${L[k]===i?'on':''}" data-lk="${k}" data-v="${i}">${n}</button>`).join('');
  el.innerHTML=`<div class="orow"><span class="olab">Nom</span><input id="pname" maxlength="14" value="${(game.pname||'').replace(/"/g,'')}"></div>
  <div class="cls">${CLS_IDS.map(id=>`<button class="cbtn ${game.cls===id?'on':''}" data-cls="${id}">${CLASSES[id].ico} ${CLASSES[id].n}</button>`).join('')}</div>
  <div id="clsInfo"><b>${ci.n}</b> — ${ci.d}<br>${ci.pros.map(x=>`<span class="p">＋ ${x}</span>`).join(' · ')}${ci.cons.length?'<br>':''}${ci.cons.map(x=>`<span class="c">－ ${x}</span>`).join(' · ')}</div>
  <div class="orow"><span class="olab">Cheveux</span>${sw(HAIRS,'hair')}<span style="color:#d9c49a;font-size:12px;margin-left:8px">(barbe, moustache) · la peau a la couleur de ton équipe</span></div>
  <div class="orow"><span class="olab">Chapeau</span>${bt(HATS,'hat')}</div>
  <div class="orow"><span class="olab">Sourcils</span>${bt(BROWS,'brow')}</div>
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
  el('mpCopy').onclick=()=>{ const t=(NET.log||[]).join('\n'); try{ navigator.clipboard.writeText(t); NET.status='Journal copié !'; }catch(e){ const r=document.createRange(); r.selectNodeContents(el('mpLog')); const s=getSelection(); s.removeAllRanges(); s.addRange(r); } renderMp(); };
  el('mpLeave').onclick=()=>{ netLeave(false); renderMp(); };
  renderMp();
}
/* ---------- pause & paramètres ---------- */
const SETTINGS={mute:false,q:'auto',shake:1,slow:true};
function loadSettings(){ try{ Object.assign(SETTINGS,JSON.parse(localStorage.getItem('pirates_settings')||'{}')); }catch(e){} applySettings(); }
function saveSettings(){ try{localStorage.setItem('pirates_settings',JSON.stringify(SETTINGS));}catch(e){} }
function applySettings(){
  muted=!!SETTINGS.mute; SET.shake=SETTINGS.shake; SET.slow=!!SETTINGS.slow;
  if(typeof Q!=='undefined'&&renderer){ if(SETTINGS.q==='auto'){ Q.auto=true; } else { Q.auto=false; Q.level=+SETTINGS.q; applyQuality(); } }
}
function setPause(on){ game.paused=!!on; const el=document.getElementById('pause'); el.classList.toggle('hidden',!on); if(on){ for(const k in keys) keys[k]=false; mouse.down=false; mouse.clicked=false; document.getElementById('pset').classList.add('hidden'); document.getElementById('pnote').textContent=NETON?'La partie continue en ligne pendant la pause.':''; } }
function togglePause(){ if(game.state==='play') setPause(!game.paused); }
function renderSettings(){
  const el=document.getElementById('pset'), row=(t,key,opts)=>`<div class="orow"><span class="olab">${t}</span>${opts.map(([v,n])=>`<button class="obtn ${String(SETTINGS[key])===String(v)?'on':''}" data-sk="${key}" data-sv="${v}">${n}</button>`).join('')}</div>`;
  el.innerHTML=row('Son','mute',[[false,'Activé'],[true,'Coupé']])+row('Graphismes','q',[['auto','Auto'],[0,'Bas'],[1,'Moyen'],[2,'Élevé']])+row('Style','style3',[['3d','Cubes 3D'],['2d','Sprites 2D']])+row('Secousses','shake',[[1,'Normales'],[.4,'Réduites'],[0,'Aucune']])+row('Ralentis','slow',[[true,'Oui'],[false,'Non']]);
  el.querySelectorAll('[data-sk]').forEach(b=>b.onclick=()=>{ const k=b.dataset.sk; let v=b.dataset.sv; if(v==='true') v=true; else if(v==='false') v=false; else if(v!=='auto'&&v!=='3d'&&v!=='2d') v=+v;
    if(k==='style3'){ game.opts.style=v; saveOpts(); setStyle(); renderOpts(); } else { SETTINGS[k]=v; saveSettings(); applySettings(); }
    renderSettings(); });
}
function bindPause(){
  const el=id=>document.getElementById(id);
  el('pResume').onclick=()=>setPause(false);
  el('pSet').onclick=()=>{ const s=el('pset'); s.classList.toggle('hidden'); if(!s.classList.contains('hidden')) renderSettings(); };
  el('pQuit').onclick=()=>{ setPause(false); showMenu(); };
  addEventListener('blur',()=>{ if(game.state==='play'&&!game.paused&&!NETON) setPause(true); });
}
function saveOpts(){ try{localStorage.setItem('pirates_opts',JSON.stringify(game.opts));}catch(e){} }
function renderOpts(){
  const box=document.getElementById('opts'); let desc='';
  box.innerHTML=OPTDEF.map(o=>`<div class="orow"><span class="olab">${o.t}</span>${o.list().map(it=>`<button class="obtn ${game.opts[o.k]===it.v?'on':''}" data-k="${o.k}" data-v="${it.v}" title="${it.d}">${it.n}</button>`).join('')}</div>`).join('');
  box.insertAdjacentHTML('beforeend',`<div class="orow"><span class="olab">Activés</span>${Object.keys(EVENTS).map(k=>`<button class="obtn ${game.opts.ev[k]?'on':''}" data-ev="${k}" title="${EVENTS[k].d}">${EVENTS[k].ico} ${EVENTS[k].n}</button>`).join('')}</div>`);
  box.insertAdjacentHTML('beforeend',`<div class="orow"><span class="olab">Mutateurs</span>${Object.keys(MUTS).map(k=>`<button class="obtn ${game.opts.mut&&game.opts.mut[k]?'on':''}" data-mut="${k}" title="${MUTS[k].d}">${MUTS[k].ico} ${MUTS[k].n}</button>`).join('')}</div>`);
  box.querySelectorAll('[data-mut]').forEach(b=>b.onclick=()=>{ const k=b.dataset.mut; game.opts.mut=game.opts.mut||{}; game.opts.mut[k]=game.opts.mut[k]?0:1; saveOpts(); renderOpts(); document.getElementById('optDesc').textContent=MUTS[k].ico+' '+MUTS[k].n+' : '+MUTS[k].d+(game.opts.mut[k]?'':' (désactivé)'); });
  box.querySelectorAll('[data-ev]').forEach(b=>b.onclick=()=>{ const k=b.dataset.ev; game.opts.ev[k]=game.opts.ev[k]?0:1; saveOpts(); renderOpts(); document.getElementById('optDesc').textContent=EVENTS[k].ico+' '+EVENTS[k].n+' : '+EVENTS[k].d+(game.opts.ev[k]?'':' (désactivé)'); });
  box.querySelectorAll('.obtn[data-k]').forEach(b=>b.onclick=()=>{
    const k=b.dataset.k, def=OPTDEF.find(o=>o.k===k), it=def.list().find(x=>String(x.v)===b.dataset.v);
    game.opts[k]=it.v; saveOpts(); renderOpts(); document.getElementById('optDesc').textContent=it.d;
    if(def.apply&&typeof setStyle==='function') setStyle();
    if(def.prev){ const st=game.state; newGame(); game.state='menu'; }
  });
}
let hudN=0, last=performance.now(), shopT=0;
function frame(now){
  const dtr=Math.min(.05,(now-last)/1000); last=now; JUICE.tick(dtr); const dt=dtr*JUICE.ts();
  if(game.state!=='menu'){
    if(game.paused&&!NETON){} else if(NETCLIENT) netClientFrame(dt); else { update(dt); mouse.clicked=false; if(NETON) netHostTick(dt); }
    shopT+=dt; if(shopOpen&&shopT>.4){shopT=0;renderShop();}
  } else { game.t+=dt; updateFx(dt); }
  if(game.state==='menu') renderPreview(game.t);
  render3d(dt); hudN=(hudN+1)|0; if(Q.level>=2||(hudN&1)) drawHud();
  requestAnimationFrame(frame);
}
function boot(){
  initRender(); initUI(); bindMouse(document.getElementById('ui'));
  document.querySelectorAll('#diff .dbtn').forEach(b=>b.onclick=()=>selectDiff(b.dataset.d));
  try{ const o=JSON.parse(localStorage.getItem('pirates_opts')||'null'); if(o){ for(const k in game.opts) if(o[k]!==undefined) game.opts[k]=o[k]; if(!(o.rv>=2)){ game.opts.roster=40; } if(!(o.rv>=3)){ game.opts.style='3d'; } if(!(o.rv>=4)){ game.opts.res=1.25; } game.opts.rv=4; } }catch(e){}
  for(const k of Object.keys(EVENTS)) if(game.opts.ev[k]===undefined) game.opts.ev[k]=1;
  if(!MAPS[game.opts.map]) game.opts.map='classic'; if(!MODES[game.opts.mode]) game.opts.mode='solo'; renderOpts();
  try{ const c=JSON.parse(localStorage.getItem('pirates_char')||'null'); if(c){ if(CLASSES[c.cls]) game.cls=c.cls; if(c.look) game.look=lookOf(c.look); if(typeof c.pname==='string') game.pname=c.pname; } }catch(e){}
  renderChar(); initPreview(); bindMp(); loadSettings(); bindPause();
  let d0='normal'; try{ d0=localStorage.getItem('pirates_diff')||'normal'; }catch(e){} selectDiff(DIFFS[d0]?d0:'normal');
  document.getElementById('playBtn').onclick=()=>{ audioInit(); screenTransition(()=>{ document.getElementById('start').classList.add('hidden'); newGame(); }); };
  newGame(); game.state='menu';
  requestAnimationFrame(frame);
}
boot();
