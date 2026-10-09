'use strict';
/* =====================  4 NOUVELLES CARTES  =====================
   🌊 Marées (ponts de sable qui apparaissent/disparaissent) · 🏰 Citadelle (forteresse centrale) ·
   🌀 Maelström (tourbillon qui aspire) · 🧊 Archipel de glace (banquise parsemée d'îlots) */
(function(){
  const B4=[[50,76,[0,-1]],[24,50,[1,0]],[50,24,[0,1]],[76,50,[-1,0]]];
  const ring8=[]; for(let i=0;i<8;i++){ const a=i*Math.PI/4+Math.PI/8; ring8.push([Math.round(50+Math.cos(a)*30),Math.round(50+Math.sin(a)*30)]); }
  Object.assign(MAPS,{
    tides:{n:'Marées',d:'Des bancs de sable relient les îles à marée basse… puis la mer monte et les engloutit ! Surveille la marée.',bases:B4,dia:[[30,30],[70,30],[30,70],[70,70]],relay:[],tide:true},
    citadel:{n:'Citadelle',d:'Une forteresse de pierre au centre, quatre portes, un trésor de diamants à l\'intérieur : qui tiendra la citadelle ?',bases:B4,dia:[[30,30],[70,30],[30,70],[70,70]],relay:[],citadel:true},
    maelstrom:{n:'Maelström',d:'Un tourbillon géant autour du galion aspire tout ce qui traverse les ponts. Ne te laisse pas emporter !',bases:B4,dia:[[28,28],[72,28],[28,72],[72,72]],relay:[[50,36],[64,50],[50,64],[36,50]],whirl:true},
    floes:{n:'Archipel de glace',d:'Une banquise parsemée de petits îlots gelés : on glisse, on saute d\'îlot en îlot !',bases:[[50,74,[0,-1]],[26,50,[1,0]],[50,26,[0,1]],[74,50,[-1,0]]],dia:[[34,34],[66,34],[34,66],[66,66]],relay:ring8.concat([[50,60],[40,50],[50,40],[60,50]]),ice:true,wx:'snow'}
  });
})();
const TIDE={tiles:[],low:true,t:0,warned:false};
const TIDE_LOW=55, TIDE_HIGH=32;
function tideApply(low){
  TIDE.low=low;
  for(const i of TIDE.tiles){ if(low){ if(floorT[i]===0){ floorT[i]=1; region[i]=5; hpF[i]=0; } } else { floorT[i]=0; wallT[i]=0; hpF[i]=0; hpW[i]=0; ownF[i]=-1; ownW[i]=-1; } }
}
function whirlOn(){ return !!(MAPS[game.opts.map]||{}).whirl; }
{ const _n=newGame;
  newGame=function(){
    _n(); const M=MAPS[game.opts.map]||{};
    if(M.tide){
      TIDE.tiles=[]; TIDE.t=0; TIDE.warned=false;
      for(const td of TD){ const d=td.dir, p=[-d[1],d[0]];
        for(let k=8;k<=19;k++) for(let s=-1;s<=1;s++){ const x=td.bx+d[0]*k+p[0]*s, y=td.by+d[1]*k+p[1]*s; if(inb(x,y)&&floorT[idx(x,y)]===0) TIDE.tiles.push(idx(x,y)); } }
      tideApply(true);
    }
    if(M.citadel){
      island(CX,CY,11,13,4);
      for(let dy=-11;dy<=11;dy++)for(let dx=-11;dx<=11;dx++){ const r=Math.max(Math.abs(dx),Math.abs(dy)); if(r!==10) continue;
        if(dx===0||dy===0) { if(Math.abs(dx)<=1&&Math.abs(dy)<=1) continue; if(Math.abs(dx)<=1||Math.abs(dy)<=1) continue; }
        const i=idx(CX+dx,CY+dy); if(floorT[i]){ wallT[i]=4; hpW[i]=BHP[4]*2; ownW[i]=-1; } }
      spawners.push({x:CX,y:CY-5,kind:'dia',team:-1,types:{diamond:{t:0,stock:0,cap:Infinity,int:()=>48}}});
      spawners.push({x:CX,y:CY+5,kind:'dia',team:-1,types:{diamond:{t:0,stock:0,cap:Infinity,int:()=>48}}});
    }
  };
  const _e=updateEvents;
  updateEvents=function(dt){
    _e(dt); if(game.state!=='play') return; const M=MAPS[game.opts.map]||{};
    if(M.tide&&!game.paused){
      TIDE.t+=dt; const len=TIDE.low?TIDE_LOW:TIDE_HIGH;
      if(TIDE.low&&!TIDE.warned&&TIDE.t>len-6){ TIDE.warned=true; announce('🌊 LA MARÉE MONTE !','#7dd3fc'); msg('Les bancs de sable vont disparaître : rentre sur une île !','#7dd3fc'); sfx('splash',player.x,player.y); }
      if(TIDE.t>=len){ TIDE.t=0; TIDE.warned=false; tideApply(!TIDE.low); if(TIDE.low){ announce('🏖️ MARÉE BASSE','#fde68a'); msg('Les bancs de sable émergent : les ponts sont ouverts !','#fde68a'); } else { for(const i of TIDE.tiles){ if(Math.random()<.4) burst((i%W+.5)*T,(Math.floor(i/W)+.5)*T,'#bae6fd',3,80,.6,3); } } }
    }
    if(M.whirl&&!game.paused){
      for(const e of ents){ if(!e.alive||e.riding||e.pilot||e.z>6) continue; const dx=e.x-CX*T-T/2, dy=e.y-CY*T-T/2, r=Math.hypot(dx,dy)/T; if(r<8.5||r>19) continue;
        const k=(1-(r-8.5)/10.5)*dt; const ux=dx/(r*T), uy=dy/(r*T);
        e.vx+=(-uy*430-ux*260)*k; e.vy+=(ux*430-uy*260)*k; }
    }
  };
}
/* netcode : l'état de marée se déduit du tick pour les invités (les tuiles arrivent via le diff) ; HUD marée + tourbillon visuel */
{ const _h=drawHud;
  drawHud=function(){ _h(); const M=MAPS[game.opts.map]||{}; if(!M.tide||game.state!=='play'||!ctx) return;
    if(NETON&&NET.role!=='host') return;
    const len=TIDE.low?TIDE_LOW:TIDE_HIGH, k=clamp(TIDE.t/len,0,1), w=150, x=VW/2-w/2, y=62;
    ctx.save(); ctx.setTransform(DPR,0,0,DPR,0,0); ctx.fillStyle='#0008'; ctx.fillRect(x,y,w,12); ctx.fillStyle=TIDE.low?'#fde68a':'#38bdf8'; ctx.fillRect(x+1,y+1,(w-2)*(1-k),10); ctx.fillStyle='#fff'; ctx.font='10px sans-serif'; ctx.textAlign='center'; ctx.fillText((TIDE.low?'🏖️ Marée basse':'🌊 Marée haute')+' · '+Math.ceil(len-TIDE.t)+'s',x+w/2,y-2); ctx.restore(); };
}
{ const _r=render3d; let rt=0;
  render3d=function(dt){ _r(dt); if(!whirlOn()||game.state==='menu'||typeof ripple!=='function') return; rt-=dt; if(rt>0) return; rt=.12;
    const a=performance.now()/1000*.9+Math.random()*6.28, r=T*(9+Math.random()*9); ripple(CX*T+T/2+Math.cos(a)*r,CY*T+T/2+Math.sin(a)*r,0,T*1.2,1.4,.5,a); };
}
