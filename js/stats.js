'use strict';
/* =====================  BILAN DE PARTIE + REPLAY DES 10 DERNIÈRES SECONDES  ===================== */
const stOf=e=>e.st||(e.st={dmg:0,taken:0,blocks:0,gath:0,core:0,lastRes:0});
{ const _h=hurt;
  hurt=function(e,a,by,kx,ky){ const hp0=e.hp; _h(e,a,by,kx,ky); const d=hp0-e.hp; if(d>0){ stOf(e).taken+=d; if(by&&by!==e&&by.team!==undefined&&by.hp!==undefined) stOf(by).dmg+=d; } };
  const _p=doPlace; doPlace=function(e,tx,ty,type){ const r=_p(e,tx,ty,type); if(e&&e.hp!==undefined) stOf(e).blocks++; return r; };
  const _d=damageTile; damageTile=function(tx,ty,dmg,src,layer){ if(src&&src.hp!==undefined&&inb(tx,ty)){ const i=idx(tx,ty); if(wallT[i]===CORE&&ownW[i]!==src.team) stOf(src).core+=Math.min(dmg,hpW[i]); } return _d(tx,ty,dmg,src,layer); };
  const _u=updateEvents; updateEvents=function(dt){ _u(dt); if(game.state!=='play') return; for(const e of ents){ const s=stOf(e), tot=e.res.bronze+e.res.silver*2+e.res.gold*6+e.res.diamond*12; if(tot>s.lastRes) s.gath+=tot-s.lastRes; s.lastRes=tot; } };
}
/* ---------- réseau : les stats finales voyagent avec le dernier instantané ---------- */
{ const _nc=netCommon; netCommon=function(){ const c=_nc(); if(game.state==='over') c.stt=ents.map(e=>{ const s=stOf(e); return [e.kills,e.deaths,Math.round(s.dmg),Math.round(s.taken),s.blocks,Math.round(s.gath),Math.round(s.core)]; }); return c; };
  const _na=netApplySnap; netApplySnap=function(m){ _na(m); if(m.stt) m.stt.forEach((a,i)=>{ const e=ents[i]; if(!e) return; const s=stOf(e); e.kills=a[0]; e.deaths=a[1]; s.dmg=a[2]; s.taken=a[3]; s.blocks=a[4]; s.gath=a[5]; s.core=a[6]; }); };
}
/* ---------- bilan ---------- */
const BIL={btns:[]};
function bilScore(e){ const s=stOf(e); return e.kills*4+s.dmg*.3+s.core*.5+s.blocks*.05+s.gath*.015-e.deaths; }
function drawBilan(){
  if(game.replay){ drawReplayHud(); return; }
  const small=VH<460, w=Math.min(VW-24,660), x=VW/2-w/2; ctx.save(); ctx.fillStyle='rgba(8,18,50,.82)'; ctx.fillRect(0,0,VW,VH); ctx.textAlign='center';
  let y=small?34:62; ctx.fillStyle=game.win?'#fde68a':'#ff8a8a'; ctx.font=(small?'bold 40px ':'bold 62px ')+PFONT; ctx.lineWidth=6; ctx.strokeStyle='rgba(10,20,60,.9)'; const title=game.win?'VICTOIRE !':'DÉFAITE'; ctx.strokeText(title,VW/2,y); ctx.fillText(title,VW/2,y);
  y+=small?18:26; ctx.fillStyle='#e5edff'; ctx.font=(small?'13':'16')+'px '+FONT; const wt=game.winTeam>=0&&TD[game.winTeam]?`Les ${TD[game.winTeam].name} l'emportent`:(game.win?'Tous les équipages ennemis sont coulés.':'Ton équipe est éliminée.');
  ctx.fillText(`${wt} · Durée ${Math.floor(game.t/60)} min ${Math.floor(game.t%60)} s`,VW/2,y);
  // récompenses
  const awards=[], best=(f)=>{ let b=null,v=0; for(const e of ents){ const k=f(e); if(k>v){ v=k; b=e; } } return b?{e:b,v}:null; };
  const A=[['🏆','MVP',best(e=>Math.max(0,bilScore(e))),v=>Math.round(v)+' pts'],['⚔️','Boucher',best(e=>stOf(e).dmg),v=>Math.round(v)+' dégâts'],['🧱','Maçon',best(e=>stOf(e).blocks),v=>v+' blocs'],['💰','Pilleur',best(e=>stOf(e).gath),v=>Math.round(v)+' butin'],['🏴‍☠️','Casse-coffre',best(e=>stOf(e).core),v=>Math.round(v)+' dégâts coffre']];
  for(const [ico,t,b,f] of A) if(b&&b.v>0) awards.push({ico,t,b,f});
  y+=small?10:16; const n=Math.min(5,awards.length), cw=(w-(n-1)*8)/Math.max(1,n), ch=small?44:56;
  awards.slice(0,5).forEach((a,i)=>{ const ax=x+i*(cw+8); panel(ax,y,cw,ch,10,TEAMS[a.b.e.team].col); ctx.font=(small?'bold 11px ':'bold 12px ')+FONT; ctx.fillStyle='#fde68a'; ctx.fillText(a.ico+' '+a.t,ax+cw/2,y+15); ctx.font=(small?'bold 12px ':'bold 14px ')+FONT; ctx.fillStyle=TEAMS[a.b.e.team].light; ctx.fillText(a.b.e.name.slice(0,16),ax+cw/2,y+30); if(!small){ ctx.font='11px '+FONT; ctx.fillStyle='#c7d2fe'; ctx.fillText(a.f(a.b.v),ax+cw/2,y+46); } });
  y+=ch+(n?10:0)+(small?4:8);
  // tableau par équipage
  const cols=['Équipage','Éliminations','Morts','Dégâts','Blocs','Butin','Coffre'], cx=[x+10,x+w*.34,x+w*.46,x+w*.57,x+w*.69,x+w*.8,x+w*.92], rh=small?17:21;
  ctx.font='bold 11px '+FONT; ctx.fillStyle='#9fb6d8'; cols.forEach((c,i)=>{ ctx.textAlign=i?'center':'left'; ctx.fillText(c,cx[i],y); }); y+=5;
  const rows=TD.map(t=>{ const m=t.members, sum=f=>m.reduce((a,e)=>a+f(e),0); return {t,k:sum(e=>e.kills),d:sum(e=>e.deaths),dm:sum(e=>stOf(e).dmg),b:sum(e=>stOf(e).blocks),g:sum(e=>stOf(e).gath),c:sum(e=>stOf(e).core)}; }).sort((a,b)=>(b.t.id===game.winTeam)-(a.t.id===game.winTeam)||b.k-a.k);
  for(const r of rows){ const me=r.t.id===player.team; panel(x,y,w,rh-2,6,me?'#fde68a':null); ctx.fillStyle=r.t.col; ctx.fillRect(x+3,y+3,4,rh-8); ctx.font=(me?'bold ':'')+'13px '+FONT; ctx.textAlign='left'; ctx.fillStyle='#fff'; ctx.fillText((r.t.id===game.winTeam?'👑 ':'')+r.t.name+(me?' (toi)':''),cx[0]+4,y+rh-7);
    ctx.textAlign='center'; [r.k,r.d,Math.round(r.dm),r.b,Math.round(r.g),Math.round(r.c)].forEach((v,i)=>{ ctx.fillStyle='#e5edff'; ctx.fillText(v,cx[i+1],y+rh-7); }); y+=rh; }
  // ta ligne personnelle
  const s=stOf(player); y+=3; ctx.font='bold 12px '+FONT; ctx.textAlign='center'; ctx.fillStyle='#fde68a'; ctx.fillText(`Toi : ${player.kills} éliminations · ${player.deaths} morts · ${Math.round(s.dmg)} dégâts infligés · ${Math.round(s.taken)} reçus · ${s.blocks} blocs · ${Math.round(s.gath)} de butin`,VW/2,y+10); y+=small?16:22;
  BIL.y=y; ctx.restore();
}
/* boutons de fin (écrase ceux de social.js) */
drawOverButtons=function(){
  if(game.replay) return; HUDB.length=0; if(game.state!=='over') return;
  const small=VH<460, h=small?34:42, y=Math.min(VH-h-8,(BIL.y||VH*.7)+4), list=[['↩ Menu (Entrée)',()=>showMenu(),'#fde68a'],['▶ Revoir les 10 dernières s',startReplay,'#c4b5fd']];
  if(game.specOffer) list.unshift(['👁 Regarder la fin (Espace)',startSpectate,'#7dd3fc']);
  const w=Math.min(250,(VW-40)/list.length-8), tot=list.length*w+(list.length-1)*8; let x=VW/2-tot/2;
  for(const [txt,fn,col] of list){ HUDB.push({x,y,w,h,fn}); panel(x,y,w,h,12,col); ctx.font='bold '+(small?'12':'14')+'px '+FONT; ctx.textAlign='center'; ctx.fillStyle='#fff'; ctx.fillText(txt,x+w/2,y+h/2+5); x+=w+8; }
};
/* ---------- enregistrement et lecture du replay ---------- */
const REP={frames:[],acc:0,on:false,t:0,saved:null,speed:.7};
function repRecord(dt){
  if(game.state!=='play'||game.replay) return; REP.acc+=dt; if(REP.acc<.1) return; REP.acc=0;
  REP.frames.push({e:ents.map(e=>[e.x,e.y,e.z,e.ang,e.alive?1:0,e.hp,e.held||'sword']),p:projs.slice(0,40).map(p=>[p.x,p.y]),t:game.t}); if(REP.frames.length>110) REP.frames.shift();
}
function startReplay(){
  if(game.state!=='over'||REP.frames.length<5||game.replay) return;
  REP.saved=ents.map(e=>[e.x,e.y,e.z,e.ang,e.alive,e.hp]); REP.t=0; REP.on=true; game.replay=true; KC.on=false; CAMF.on=false; closeShopSafe(); msg('⏪ Replay des dernières secondes','#c4b5fd');
}
function closeShopSafe(){ try{ toggleShop(false); }catch(e){} }
function stopReplay(){
  if(!REP.on) return; REP.on=false; game.replay=false; if(REP.saved) ents.forEach((e,i)=>{ const s=REP.saved[i]; if(s){ e.x=s[0]; e.y=s[1]; e.z=s[2]; e.ang=s[3]; e.alive=s[4]; e.hp=s[5]; } }); REP.saved=null;
}
function repApply(dt){
  const F=REP.frames, last=F.length-1; REP.t+=dt*REP.speed; const fi=REP.t/.1; if(fi>=last){ stopReplay(); return; }
  const a=F[Math.floor(fi)], b=F[Math.min(last,Math.floor(fi)+1)], k=fi-Math.floor(fi);
  ents.forEach((e,i)=>{ const A=a.e[i], B=b.e[i]; if(!A||!B) return; e.x=A[0]+(B[0]-A[0])*k; e.y=A[1]+(B[1]-A[1])*k; e.z=A[2]+(B[2]-A[2])*k; let da=B[3]-A[3]; while(da>Math.PI) da-=6.283; while(da<-Math.PI) da+=6.283; e.ang=A[3]+da*k; e.alive=!!A[4]; e.hp=A[5]; e.held=A[6]; e.inv=0; e.vx=e.vy=0; e.ix=e.iy=0; });
  for(const p of a.p) parts.push({x:p[0],y:p[1],z:14,vx:0,vy:0,life:.09,max:.09,col:'#fde68a',size:4.5});
  const pa=a.e[ents.indexOf(player)]; if(pa){ cam3.x+=(pa[0]-cam3.x)*Math.min(1,dt*5); cam3.y+=(pa[1]-cam3.y)*Math.min(1,dt*5); }
}
function drawReplayHud(){
  const F=REP.frames, p=clamp(REP.t/.1/Math.max(1,F.length-1),0,1); ctx.save(); ctx.textAlign='center'; const bar=Math.round(VH*.07); ctx.fillStyle='#000'; ctx.fillRect(0,0,VW,bar); ctx.fillRect(0,VH-bar,VW,bar);
  ctx.font='bold 22px '+PFONT; ctx.fillStyle='#ddd6fe'; ctx.lineWidth=5; ctx.strokeStyle='rgba(20,10,50,.9)'; ctx.strokeText('⏪ REPLAY',VW/2,bar+30); ctx.fillText('⏪ REPLAY',VW/2,bar+30);
  ctx.fillStyle='rgba(255,255,255,.25)'; ctx.fillRect(VW/2-140,bar+40,280,5); ctx.fillStyle='#c4b5fd'; ctx.fillRect(VW/2-140,bar+40,280*p,5);
  HUDB.length=0; const w=170,h=32,x=VW/2-w/2,y=VH-bar-h-10; HUDB.push({x,y,w,h,fn:stopReplay}); panel(x,y,w,h,12,'#c4b5fd'); ctx.font='bold 13px '+FONT; ctx.fillStyle='#fff'; ctx.fillText('⏹ Terminer (Entrée)',VW/2,y+21); ctx.restore();
}
{ const _r=render3d; render3d=function(dt){ if(renderer&&game.state!=='menu'&&player){ if(REP.on) repApply(dt); else repRecord(dt); } _r(dt); }; }
{ const _cam=updateCamera; updateCamera=function(dt){ if(REP.on){ camPlace(14.2,9.6,.3); return; } _cam(dt); }; }
{ const _ng=newGame; newGame=function(){ REP.on=false; game.replay=false; REP.frames=[]; REP.acc=0; _ng(); }; }
addEventListener('keydown',ev=>{ if(!REP.on) return; if(ev.key==='Enter'||ev.key==='Escape'||ev.code==='Space'){ stopReplay(); ev.stopImmediatePropagation(); ev.preventDefault(); } },true);
{ const ui=document.getElementById('ui'); ui.addEventListener('mousedown',ev=>{ if(REP.on){ ev.stopImmediatePropagation(); stopReplay(); } },true); }
