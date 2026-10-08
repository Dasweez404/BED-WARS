'use strict';
/* =====================  COMBAT 2  =====================
   • Recharge active : appuie sur R au bon moment pendant la recharge (zone verte) → recharge instantanée + prochaines balles +25 %. Raté : +0,5 s.
   • Revanche : 30 s de +25 % de dégâts contre celui qui t'a tué (il est marqué).
   • Réparation du coffre : un travail de 4,5 s, interrompu si tu t'éloignes ou te fais toucher. */
{ const _sr=startReload;
  startReload=function(e,id){
    const s=wst(e,id), g=GUNS[id];
    if(s.r>0&&!e.isBot&&g){ // recharge en cours : tentative de recharge active
      if(s.rtried) return false; const tot=s._m||s.r, p=1-s.r/tot; s.rtried=true;
      if(p>=.5&&p<=.72){ s.r=0; s.a=g.mag; e.rlBonus=game.t+4; floatTxt(e.x,e.y-48,'⚡ RECHARGE PARFAITE !','#fde047',16); ring(e.x,e.y,T*1.4,'#fde047',.5,true); burst(e.x,e.y-10,'#fde047',12,150,.5,3); sfx('coin',e.x,e.y); }
      else { s.r+=.5; floatTxt(e.x,e.y-48,'💢 Raté !','#fca5a5',14); sfx('tick',e.x,e.y); }
      return true; }
    const r=_sr(e,id); if(r){ s._m=s.r; s.rtried=false; } return r; };
  const _h=hurt;
  hurt=function(e,amount,by,kx,ky){ if(by&&by.revenge&&by.revenge.who===e&&by.revenge.t>0&&amount>0&&!by.isBot){ amount*=1.25; if(Math.random()<.35) floatTxt(e.x,e.y-52,'💢 REVANCHE','#fca5a5',13); } return _h(e,amount,by,kx,ky); };
  const _d=die;
  die=function(e,by,sea){ const prior=e.alive; if(prior&&by&&by!==e&&by.team!==undefined&&by.team!==e.team&&by.res&&!e.isBot){ e.revenge={who:by,t:30}; if(e===player) msg(`💢 Revanche ! +25 % de dégâts contre ${by.name} pendant 30 s`,'#fca5a5'); }
    if(prior&&by&&by.revenge&&by.revenge.who===e){ by.revenge=null; if(by.res){ by.res.gold+=1; floatTxt(by.x,by.y-52,'💢 REVANCHE ! +1 or','#fde047',15); } }
    e.repairCh=null; return _d(e,by,sea); };
  const _e=updateEvents;
  updateEvents=function(dt){ _e(dt); if(game.state!=='play'||game.paused) return;
    for(const p of projs){ if(!p._b){ p._b=1; if(p.owner&&p.owner.rlBonus>game.t&&p.dmg>0) p.dmg*=1.25; } }
    for(const e of ents){ if(e.revenge){ e.revenge.t-=dt; if(e.revenge.t<=0||!e.revenge.who) e.revenge=null; }
      const s=e.ws&&e.held&&e.ws[e.held]; if(s&&s.r<=0){ s._m=0; s.rtried=false; }
      const R=e.repairCh; if(R){ const td=TD[e.team], cx=(td.bx+.5)*T, cy=(td.by+.5)*T, ci=idx(td.bx,td.by);
        if(!e.alive||e.frozen>0||!td.coreAlive||Math.hypot(cx-e.x,cy-e.y)>3.6*T||e.hp<R.hp0-.05){ if(e.alive){ floatTxt(e.x,e.y-44,'🔧 Réparation interrompue','#fca5a5',13); e.am.repair=(e.am.repair||0)+(R.t<R.dur*.5?1:0); } e.repairCh=null; }
        else { R.hp0=Math.max(R.hp0,e.hp); R.t+=dt; const add=R.tot/R.dur*dt; hpW[ci]=Math.min(BHP[CORE],hpW[ci]+add);
          if(Math.random()<dt*10) burst(cx+rnd(-18,18),cy+rnd(-18,18),'#86efac',2,60,.5,3); if(Math.random()<dt*2.2) ring(cx,cy,T*1.8,'#86efac',.45,true);
          if(R.t>=R.dur){ e.repairCh=null; floatTxt(cx,cy-50,'🔧 Coffre réparé !','#86efac',16); sfx('buy',cx,cy); } } } } };
}
/* ---------- affichage : barre de recharge active, marque de revanche, progression de la réparation ---------- */
{ const _dh=drawHud;
  drawHud=function(){ _dh(); if(game.state!=='play'||!ctx||!player||!player.alive) return; const e=player; ctx.save(); ctx.setTransform(DPR,0,0,DPR,0,0); ctx.textAlign='center';
    const g=GUNS[e.held], s=g&&e.ws&&e.ws[e.held];
    if(s&&s.r>0){ const tot=s._m=Math.max(s._m||0,s.r), p=clamp(1-s.r/tot,0,1), w=170, x=VW/2-w/2, y=VH-(typeof TOUCH!=='undefined'&&TOUCH.on?112:122);
      ctx.fillStyle='rgba(15,23,42,.8)'; ctx.fillRect(x-3,y-3,w+6,16); ctx.fillStyle='rgba(74,222,128,.55)'; ctx.fillRect(x+w*.5,y,w*.22,10); ctx.fillStyle=s.rtried?'#94a3b8':'#fde68a'; ctx.fillRect(x,y,w*p,10); ctx.strokeStyle='#fff'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(x+w*p,y-4); ctx.lineTo(x+w*p,y+14); ctx.stroke();
      ctx.font='bold 11px '+FONT; ctx.fillStyle='#d9f99d'; ctx.fillText(s.rtried?'Recharge…':'R dans la zone verte : recharge parfaite',VW/2,y-8); }
    const rv=e.revenge; if(rv&&rv.who&&rv.who.alive){ const q=w2s(rv.who.x,rv.who.y,rv.who.z+72+Math.sin(game.t*6)*3); if(q[2]){ ctx.fillStyle='#ef4444'; ctx.strokeStyle='#450a0a'; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(q[0],q[1]+13); ctx.lineTo(q[0]-9,q[1]-4); ctx.lineTo(q[0]+9,q[1]-4); ctx.closePath(); ctx.stroke(); ctx.fill(); ctx.font='bold 12px '+FONT; ctx.lineWidth=4; ctx.strokeStyle='rgba(40,0,0,.9)'; const t='💢 REVANCHE '+Math.ceil(rv.t)+'s'; ctx.strokeText(t,q[0],q[1]-9); ctx.fillStyle='#fecaca'; ctx.fillText(t,q[0],q[1]-9); } }
    const R=e.repairCh; if(R){ const td=TD[e.team], q=w2s((td.bx+.5)*T,(td.by+.5)*T,70); if(q[2]){ const w=90; ctx.fillStyle='rgba(15,23,42,.8)'; ctx.fillRect(q[0]-w/2-2,q[1]-2,w+4,12); ctx.fillStyle='#86efac'; ctx.fillRect(q[0]-w/2,q[1],w*clamp(R.t/R.dur,0,1),8); ctx.font='bold 11px '+FONT; ctx.fillStyle='#bbf7d0'; ctx.fillText('🔧 Réparation',q[0],q[1]-6); } }
    ctx.restore(); };
}
