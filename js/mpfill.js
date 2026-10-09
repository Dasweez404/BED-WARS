'use strict';
/* ===== Multijoueur : « remplir avec des bots » (difficiles) ou seulement les îles des joueurs présents ===== */
const MPF={prev:null};
game.opts.fillbots=true;
function mpAbsent(){ if(typeof NETON==='undefined'||!NETON||game.opts.fillbots!==false||!NETSLOTS) return []; return TD.filter(t=>t.id!==0&&!NETSLOTS[t.id]).map(t=>t.id); }
{ const _on=onNewGame;
  onNewGame=function(){
    const gone=mpAbsent();
    for(const id of gone){ const td=TD[id]; td.absent=true; td.coreAlive=false;
      for(let i=0;i<region.length;i++) if(region[i]===id){ floatT0(i); }
      for(let k=spawners.length-1;k>=0;k--) if(spawners[k].team===id) spawners.splice(k,1);
      for(const m of td.members){ m.alive=false; m.elim=true; m.isBot=false; m.ai=null; m.hp=0; m.hidden=true; } }
    _on();
  };
  function floatT0(i){ floorT[i]=0; wallT[i]=0; hpF[i]=0; hpW[i]=0; ownF[i]=-1; ownW[i]=-1; region[i]=-1; }
  const _ng=newGame;
  newGame=function(){ if(!(typeof NETON!=='undefined'&&NETON)&&MPF.prev){ game.diff=MPF.prev; MPF.prev=null; } _ng(); };
  const _hs=netHostStart;
  netHostStart=function(){ if(NET.role!=='host'||NET.started) return;
    if(!Object.keys(NET.slots).length) game.opts.fillbots=true;
    if(game.opts.fillbots!==false){ if(MPF.prev===null) MPF.prev=game.diff; game.diff='hard'; }
    _hs(); };
}
/* interrupteur dans le salon (hôte uniquement) */
(function(){
  const row=document.getElementById('mpStart'); if(!row) return; const btn=document.createElement('button'); btn.className='obtn'; btn.id='mpFill'; btn.style.display='none';
  row.parentNode.insertBefore(btn,row);
  const paint=()=>{ btn.classList.toggle('on',game.opts.fillbots!==false); btn.textContent=game.opts.fillbots!==false?'🤖 Remplir avec des bots (difficiles) : OUI':'🤖 Remplir avec des bots : NON (seulement les îles des joueurs)'; };
  btn.onclick=()=>{ game.opts.fillbots=game.opts.fillbots===false; paint(); };
  paint();
  setInterval(()=>{ btn.style.display=(NET.role==='host'&&!NET.started)?'':'none'; paint(); },400);
})();
