'use strict';
/* =====================  ENTRÉES & BOUCLE  ===================== */
const DIGIT={'&':1,'é':2,'"':3,"'":4,'(':5,'-':6,'è':7,'_':8,'ç':9};
addEventListener('keydown',ev=>{
  const k=ev.key.length===1?ev.key.toLowerCase():ev.key;
  keys[ev.code]=true; keys['k:'+k]=true;
  if(ev.code==='Space'||['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(ev.key)) ev.preventDefault();
  if(game.state==='menu') return;
  if(ev.repeat) return;
  if(game.state==='over'&&(k==='Enter'||k==='r')){newGame();return;}
  if(ev.code==='Space'){ if(player.alive&&game.state==='play') jump(player); return; }
  let d=0;
  if(/^Digit[1-9]$/.test(ev.code)) d=+ev.code.slice(5); else if(/^Numpad[1-9]$/.test(ev.code)) d=+ev.code.slice(6); else if(DIGIT[k]) d=DIGIT[k];
  if(d){ const l=hotList(player); if(l[d-1]){ if(selId==='block'&&l[d-1].id==='block') cycleBlock(player); setSel(l[d-1].id); } }
  else if(k==='e') toggleShop();
  else if(k==='r'){ if(GUNS[selId]&&player.alive){ if(startReload(player,selId)) floatTxt(player.x,player.y-40,'Recharge…','#ffd27d',13); } }
  else if(k==='c') cycleBlock(player);
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
    if(game.state==='over'){newGame();return;}
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

let last=performance.now(), shopT=0;
function frame(now){
  const dt=Math.min(.05,(now-last)/1000); last=now;
  if(game.state!=='menu'){
    update(dt); mouse.clicked=false;
    shopT+=dt; if(shopOpen&&shopT>.4){shopT=0;renderShop();}
  } else { game.t+=dt; updateFx(dt); }
  render3d(dt); drawHud();
  requestAnimationFrame(frame);
}
function boot(){
  initRender(); initUI(); bindMouse(document.getElementById('ui'));
  document.getElementById('playBtn').onclick=()=>{audioInit();document.getElementById('start').classList.add('hidden');newGame();};
  newGame(); game.state='menu';
  requestAnimationFrame(frame);
}
boot();
