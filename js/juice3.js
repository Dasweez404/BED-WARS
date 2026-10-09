'use strict';
/* =====================  JUICE 3  =====================
   Indicateurs de direction des coups reçus, traceurs de balles, onde de choc à l'atterrissage, lignes de vitesse en chute,
   crânes et confettis sur les éliminations, gerbes de pièces sur le coffre, pièces qui volent de la boutique vers le compteur. */
const J3={dirs:[],fall:{},lastItem:null,crit:0};
(function css(){ const st=document.createElement('style'); st.textContent=`
  .flycoin{position:fixed;z-index:80;font-size:20px;pointer-events:none;transition:transform .65s cubic-bezier(.3,.7,.4,1),opacity .65s;will-change:transform}
  @keyframes bought{0%{box-shadow:0 0 0 0 #fde68a;transform:scale(1)}30%{box-shadow:0 0 22px 6px #fde68acc;transform:scale(1.06)}100%{box-shadow:0 0 0 0 #fde68a00;transform:scale(1)}}
  #shop .item.bought{animation:bought .5s ease-out}`; document.head.appendChild(st); })();
/* ---- coups reçus : direction de l'attaquant ---- */
{ const _h=hurt;
  hurt=function(e,amount,by,kx,ky){ const hp0=e.hp, was=e.alive; _h(e,amount,by,kx,ky); const dealt=hp0-e.hp; if(!was||dealt<=.05) return;
    if(e===player&&by&&by!==e&&by.x!==undefined) J3.dirs.push({x:by.x,y:by.y,t:1.2,k:Math.min(1,.4+dealt/8)});
    if(by===player&&e!==player&&dealt>=5){ ring(e.x,e.y,T*1.1,'#fde68a',.3,true); burst(e.x,e.y-e.z-8,'#fff7b0',10,220,.35,3); JUICE.kick(.35); floatTxt(e.x,e.y-52-e.z,'CRITIQUE !','#fbbf24',17); } }; }
/* ---- éliminations : crâne + confettis aux couleurs de l'équipe ---- */
{ const _d=die;
  die=function(e,by,sea){ const was=e.alive; _d(e,by,sea); if(!was||e.alive||sea) return; if(by===player&&e!==player){ floatTxt(e.x,e.y-58-e.z,'💀','#ffffff',30); burst(e.x,e.y-e.z,TEAMS[e.team].light,22,300,.9,4); ring(e.x,e.y,T*1.8,TEAMS[e.team].col,.5,true); JUICE.kick(.55); } }; }
/* ---- coffre touché : gerbe de pièces ---- */
{ const _dt=damageTile;
  damageTile=function(tx,ty,dmg,src,layer){ const i=inb(tx,ty)?idx(tx,ty):-1, core=i>=0&&wallT[i]===CORE; const r=_dt(tx,ty,dmg,src,layer);
    if(core&&dmg>0&&Math.random()<.8){ const x=(tx+.5)*T, y=(ty+.5)*T, n=Math.min(10,2+Math.ceil(dmg/2)); for(let k=0;k<n;k++){ const a=Math.random()*6.28, s=60+Math.random()*120; parts.push({x,y,z:18,vx:Math.cos(a)*s,vy:Math.sin(a)*s,vz:120+Math.random()*140,life:.8,max:.8,col:'#fbbf24',size:3}); } ring(x,y,T*.9,'#fde68a',.25,true); }
    return r; }; }
/* ---- mise à jour : traceurs, atterrissages ---- */
{ const _u=update;
  update=function(dt){
    for(const p of projs){ if((p.kind==='bullet'||p.kind==='arrow')&&p.life>0&&player&&Math.hypot(p.x-player.x,p.y-player.y)<14*T&&Math.random()<dt*45) parts.push({x:p.x,y:p.y,z:p.z||12,vx:0,vy:0,vz:0,life:.16,max:.16,col:p.col||'#fde047',size:2}); }
    for(const e of ents){ if(!e.alive) continue; const f=J3.fall[e.team+'_'+(e.slot||0)]||(J3.fall[e.team+'_'+(e.slot||0)]={m:0});
      if(e.z>6) f.m=Math.min(f.m,e.vz); else { if(f.m<-380&&e.vz>=-1){ const k=Math.min(1,-f.m/900); ring(e.x,e.y,T*(.8+k*.8),'#e5e7eb',.3,true); burst(e.x,e.y,'#d6d3d1',6+Math.round(k*8),90+k*80,.45,3); if(e===player) JUICE.kick(.12+k*.25); } f.m=0; } }
    J3.dirs=J3.dirs.filter(d=>(d.t-=dt)>0);
    _u(dt); };
}
/* ---- HUD : arcs de direction + lignes de vitesse en chute libre ---- */
{ const _dh=drawHud;
  drawHud=function(){ _dh(); if(game.state!=='play'||!ctx||!player||!player.alive||typeof w2s!=='function') return; ctx.save(); ctx.setTransform(DPR,0,0,DPR,0,0);
    const cx=VW/2, cy=VH/2, R=Math.min(VW,VH)*.33, c0=w2s(player.x,player.y,0);
    for(const d of J3.dirs){ const s=w2s(d.x,d.y,0), a=Math.atan2(s[1]-c0[1],s[0]-c0[0]), al=Math.min(1,d.t*1.2)*(.55+.4*d.k); ctx.globalAlpha=al; ctx.lineCap='round'; ctx.strokeStyle='#ef4444'; ctx.lineWidth=7+d.k*5; ctx.shadowColor='#7f1d1d'; ctx.shadowBlur=10; ctx.beginPath(); ctx.arc(cx,cy,R,a-.26,a+.26); ctx.stroke();
      ctx.fillStyle='#fca5a5'; ctx.beginPath(); ctx.moveTo(cx+Math.cos(a)*(R+16),cy+Math.sin(a)*(R+16)); ctx.lineTo(cx+Math.cos(a+.07)*(R+2),cy+Math.sin(a+.07)*(R+2)); ctx.lineTo(cx+Math.cos(a-.07)*(R+2),cy+Math.sin(a-.07)*(R+2)); ctx.fill(); }
    ctx.shadowBlur=0; ctx.globalAlpha=1;
    if(player.vz<-460&&player.z>40){ const k=Math.min(1,(-player.vz-460)/500), t=game.t; ctx.strokeStyle=`rgba(255,255,255,${.12+.2*k})`; ctx.lineWidth=2; for(let i=0;i<26;i++){ const a=(i/26)*6.283+Math.sin(t*3+i)*.05, r0=Math.max(VW,VH)*(.34+.1*((i*7)%5)/5), r1=r0+60+k*90; ctx.beginPath(); ctx.moveTo(cx+Math.cos(a)*r0,cy+Math.sin(a)*r0); ctx.lineTo(cx+Math.cos(a)*r1,cy+Math.sin(a)*r1); ctx.stroke(); } }
    ctx.restore(); }; }
/* ---- boutique : l'article clignote et des pièces volent vers le compteur ---- */
shopEl.addEventListener('mousedown',ev=>{ const it=ev.target&&ev.target.closest&&ev.target.closest('.item'); J3.lastItem=it?{id:it.dataset.buy,r:it.getBoundingClientRect()}:null; },true);
{ const _b=buy;
  buy=function(e,id){ const r=_b(e,id); if(r&&e===player&&shopOpen&&J3.lastItem&&J3.lastItem.id===id){ const from=J3.lastItem.r, res=shopEl.querySelector('.res'), to=res?res.getBoundingClientRect():{left:from.left,top:0,width:60,height:30};
      const el=shopEl.querySelector(`[data-buy="${id}"]`); if(el){ el.classList.remove('bought'); void el.offsetWidth; el.classList.add('bought'); }
      for(let i=0;i<7;i++){ const c=document.createElement('div'); c.className='flycoin'; c.textContent=i%3===0?'🪙':'💰'; c.style.left=(from.left+from.width/2+(Math.random()-.5)*40)+'px'; c.style.top=(from.top+from.height/2)+'px'; c.style.opacity=1; document.body.appendChild(c);
        setTimeout(()=>{ c.style.transform=`translate(${to.left+to.width/2-parseFloat(c.style.left)+(Math.random()-.5)*30}px,${to.top+to.height/2-parseFloat(c.style.top)}px) scale(.6)`; c.style.opacity=.1; },30+i*45); setTimeout(()=>c.remove(),900+i*45); } }
    return r; }; }
