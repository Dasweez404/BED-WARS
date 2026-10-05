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
  if(ev.code==='Space'){ if(player.alive&&game.state==='play') jump(player); return; }
  let d=0;
  if(/^Digit[0-9]$/.test(ev.code)) d=+ev.code.slice(5)||10; else if(/^Numpad[0-9]$/.test(ev.code)) d=+ev.code.slice(6)||10; else if(DIGIT[k]) d=DIGIT[k]; else if(k==='à') d=10;
  if(d){ const l=hotList(player); if(l[d-1]){ if(selId==='block'&&l[d-1].id==='block') cycleBlock(player); setSel(l[d-1].id); } }
  else if(k==='Tab'){ ev.preventDefault(); if(player.alive) swapPack(player); }
  else if(k==='e') toggleShop();
  else if(k==='r'){ if(GUNS[selId]&&player.alive){ if(startReload(player,selId)) floatTxt(player.x,player.y-40,'Recharge…','#ffd27d',13); } }
  else if(k==='c') cycleBlock(player);
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
    if(ev.button===2){cycleBlock(player);return;}
    const l=hotList(player), hb=hotbarRect(l.length);
    if(mouse.y>=hb.y-6&&mouse.y<=hb.y+hb.s&&mouse.x>=hb.x&&mouse.x<hb.x+l.length*(hb.s+hb.g)){
      const i=Math.floor((mouse.x-hb.x)/(hb.s+hb.g)); if(l[i]){ if(selId==='block'&&l[i].id==='block') cycleBlock(player); setSel(l[i].id);} return;
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

function showMenu(){ toggleShop(false); newGame(); game.state='menu'; document.getElementById('start').classList.remove('hidden'); }
function selectDiff(d){ game.diff=d; try{localStorage.setItem('pirates_diff',d);}catch(e){} document.querySelectorAll('#diff .dbtn').forEach(b=>b.classList.toggle('on',b.dataset.d===d)); document.getElementById('diffDesc').textContent=DIFFS[d].desc; }
const OPTDEF=[
  {k:'mode',t:'Mode',list:()=>Object.entries(MODES).map(([v,m])=>({v,n:m.n,d:m.d})),prev:true},
  {k:'map',t:'Carte',list:()=>Object.entries(MAPS).map(([v,m])=>({v,n:m.n,d:m.d})),prev:true},
  {k:'res',t:'Ressources',list:()=>OPT_RES.map(o=>({v:o.v,n:o.n,d:'Vitesse de production des ressources.'}))},
  {k:'start',t:'Départ',list:()=>OPT_START.map((o,i)=>({v:i,n:o.n,d:'Ressources de départ de chaque pirate.'}))},
  {k:'core',t:'Coffres',list:()=>OPT_CORE.map((o,i)=>({v:i,n:o.n,d:'Résistance des coffres au trésor.'}))}
];
function saveOpts(){ try{localStorage.setItem('pirates_opts',JSON.stringify(game.opts));}catch(e){} }
function renderOpts(){
  const box=document.getElementById('opts'); let desc='';
  box.innerHTML=OPTDEF.map(o=>`<div class="orow"><span class="olab">${o.t}</span>${o.list().map(it=>`<button class="obtn ${game.opts[o.k]===it.v?'on':''}" data-k="${o.k}" data-v="${it.v}" title="${it.d}">${it.n}</button>`).join('')}</div>`).join('');
  box.querySelectorAll('.obtn').forEach(b=>b.onclick=()=>{
    const k=b.dataset.k, def=OPTDEF.find(o=>o.k===k), it=def.list().find(x=>String(x.v)===b.dataset.v);
    game.opts[k]=it.v; saveOpts(); renderOpts(); document.getElementById('optDesc').textContent=it.d;
    if(def.prev){ const st=game.state; newGame(); game.state='menu'; }
  });
}
let hudN=0, last=performance.now(), shopT=0;
function frame(now){
  const dt=Math.min(.05,(now-last)/1000); last=now;
  if(game.state!=='menu'){
    update(dt); mouse.clicked=false;
    shopT+=dt; if(shopOpen&&shopT>.4){shopT=0;renderShop();}
  } else { game.t+=dt; updateFx(dt); }
  render3d(dt); hudN=(hudN+1)|0; if(Q.level>=2||(hudN&1)) drawHud();
  requestAnimationFrame(frame);
}
function boot(){
  initRender(); initUI(); bindMouse(document.getElementById('ui'));
  document.querySelectorAll('#diff .dbtn').forEach(b=>b.onclick=()=>selectDiff(b.dataset.d));
  try{ const o=JSON.parse(localStorage.getItem('pirates_opts')||'null'); if(o) for(const k in game.opts) if(o[k]!==undefined) game.opts[k]=o[k]; }catch(e){}
  if(!MAPS[game.opts.map]) game.opts.map='classic'; if(!MODES[game.opts.mode]) game.opts.mode='solo'; renderOpts();
  let d0='normal'; try{ d0=localStorage.getItem('pirates_diff')||'normal'; }catch(e){} selectDiff(DIFFS[d0]?d0:'normal');
  document.getElementById('playBtn').onclick=()=>{audioInit();document.getElementById('start').classList.add('hidden');newGame();};
  newGame(); game.state='menu';
  requestAnimationFrame(frame);
}
boot();
