'use strict';
/* =====================  OBJECTIFS BONUS, BOSS ET DÉMÉNAGEUR  =====================
   Tout reste centré sur le Bed Wars : protéger son coffre, piller celui des autres.
   - Capture du galion : tenir le bateau central donne des avantages d'économie et de défense.
   - Chasse au trésor : un coffre-butin apparaît sur un îlot (butin + relique).
   - Kraken géant (option) : un boss qui menace tout le monde.
   - Déménageur : gadget pour déplacer son coffre… à ses risques et périls. */
Object.assign(game.opts,{obj:0,boss:0});
const OBJ=k=>{ const v=game.opts.obj|0; return k==='galion'?(v===1||v===3):(v===2||v===3); };
const GAL={holder:-1,capTeam:-1,capV:0,pres:[0,0,0,0],gold:12};
const TRE={on:false,x:0,y:0,t:0,prog:0,team:-1,next:55};
const BOSS={on:false,kind:'kraken',x:0,y:0,a:0,rad:1.9*T,hp:0,max:1,cd:3,slams:[],dmg:{},next:200,ph:0,flash:0,st:'cruise',stT:0,aux:[],hitSet:null,lastKind:''};
const BOSSES={kraken:{n:'KRAKEN GÉANT',ico:'🐙',col:'#a78bfa',txt:'Un kraken géant rôde près du galion'},mega:{n:'MÉGALODON',ico:'🦈',col:'#60a5fa',txt:'Un mégalodon charge dans les eaux : il brise les ponts !'},ghost:{n:'VAISSEAU FANTÔME',ico:'👻',col:'#5eead4',txt:'Un vaisseau fantôme bombarde les îles !'},crab:{n:'ROI CRABE',ico:'🦀',col:'#f87171',txt:'Le Roi Crabe a pris le galion !'}};
const BOSS_KINDS=['kraken','mega','ghost','crab'];
/* ---------- gadget déménageur ---------- */
{ const it={id:'mover',n:'Déménageur',ico:'📦',col:'#f59e0b'}; ITEMS.push(it); ITEMMAP.mover=it;
  TIPS2.mover='Près de ton coffre : le soulève (40 s). Re-clique sur ton île pour le reposer. Si tu meurs en le portant, le coffre est PERDU !';
  SHOP.push(gadItem('mover','Déménageur','Soulève ton coffre au trésor pour le déplacer (max. 5 cases de son emplacement d\'origine) : tu es ralenti, et si tu meurs en le portant, ton coffre est détruit !',{gold:3},1,'Base'));
  SHOP.forEach(s=>SHOPMAP[s.id]=s); if(typeof H_BUFF!=='undefined') H_BUFF.push('mover'); }
function moverPlace(e,tx,ty){
  const td=TD[e.team]; const i=idx(tx,ty);
  wallT[i]=CORE; hpW[i]=e.carryHp||BHP[CORE]; ownW[i]=e.team; td.bx=tx; td.by=ty; td.moved=true; e.carry=0; td.carrier=null; pop[i]=1;
  ring((tx+.5)*T,(ty+.5)*T,T*2,'#f59e0b',.6,true); burst((tx+.5)*T,(ty+.5)*T,'#fde68a',16,160,.6,3); sfx('buy'); msg(`📦 ${e.name} a déplacé le coffre des ${td.name}.`,td.light);
}
function moverOk(e,tx,ty){ const td=TD[e.team]; if(!inb(tx,ty)) return false; const i=idx(tx,ty); if(floorT[i]<=0||wallT[i]!==0) return false; if(region[i]!==e.team) return false; if(Math.hypot(tx-(td.ox??td.bx),ty-(td.oy??td.by))>5.2) return false; for(const s of spawners) if(s.x===tx&&s.y===ty) return false; return true; }
{ const _u=useGadget2;
  useGadget2=function(e,id,wx,wy,ax,ay){
    if(id!=='mover') return _u(e,id,wx,wy,ax,ay);
    const td=TD[e.team];
    if(!e.carry){
      const cx=(td.bx+.5)*T, cy=(td.by+.5)*T, ci=idx(td.bx,td.by);
      if(!td.coreAlive||wallT[ci]!==CORE){ floatTxt(e.x,e.y-36,'Pas de coffre à soulever','#fca5a5',13); return false; }
      if(Math.hypot(e.x-cx,e.y-cy)>2.8*T){ floatTxt(e.x,e.y-36,'Approche-toi de ton coffre !','#fde68a',14); return false; }
      if(td.ox===undefined){ td.ox=td.bx; td.oy=td.by; }
      e.carry=1; e.carryHp=hpW[ci]; e.carryT=40; td.carrier=e; wallT[ci]=0; hpW[ci]=0; ownW[ci]=-1; pop[ci]=1;
      e.am.mover=(e.am.mover||0)+1; // soulever ne consomme pas le gadget : seul le dépôt le consomme
      ring(cx,cy,T*2,'#f59e0b',.6,true); burst(cx,cy,'#fde68a',16,160,.6,3); sfx('gadget'); floatTxt(e.x,e.y-44,'📦 COFFRE SOULEVÉ ! (meurs = perdu)','#f59e0b',16);
      announce('📦 '+e.name+' DÉMÉNAGE LE COFFRE !','#fcd34d'); return true;
    }
    const tx=Math.floor(wx/T), ty=Math.floor(wy/T);
    if(Math.hypot(tx-Math.floor(e.x/T),ty-Math.floor(e.y/T))>4||!moverOk(e,tx,ty)){ floatTxt(e.x,e.y-36,'Impossible de le poser ici','#fca5a5',14); e.am.mover=(e.am.mover||0)+1; return true; }
    moverPlace(e,tx,ty); return true;
  };
  const _d=die;
  die=function(e,by,sea){ if(e.alive&&e.carry){ const td=TD[e.team]; td.coreAlive=false; td.carrier=null; e.carry=0; announce('📦 COFFRE PERDU !','#fca5a5'); msg(`${e.name} est mort en portant le coffre des ${td.name} : il est détruit !`,'#fca5a5'); ring(e.x,e.y,T*2.4,'#ef4444',.7,true); burst(e.x,e.y,'#fbbf24',24,240,.8,4); } _d(e,by,sea); };
}
/* ---------- boucle des objectifs (hôte / solo) ---------- */
function bossHit(dmg,src){
  if(!BOSS.on||dmg<=0) return; if(BOSS.kind==='mega'&&BOSS.st==='stun') dmg*=1.5; BOSS.hp-=dmg; BOSS.flash=.15; if(src&&src.team!==undefined){ BOSS.dmg[src.team]=(BOSS.dmg[src.team]||0)+dmg; }
  burst(BOSS.x+rnd(-20,20),BOSS.y+rnd(-20,20),'#c4b5fd',5,120,.35,3); sfx('hit',BOSS.x,BOSS.y);
  if(BOSS.hp<=0) bossDie();
}
function bossDie(){
  BOSS.on=false; const x=BOSS.x,y=BOSS.y; BOSS.next=game.t+210; for(let k=0;k<4;k++) ring(x,y,T*(2+k*1.3),'#a78bfa',.5+k*.2,k<1); burst(x,y,'#c4b5fd',50,320,1,5); chunks(x,y,'#6d28d9',14); sfx('boom',x,y); JUICE.kick(1); flashScreen('#ddd6fe',.4);
  const rank=Object.entries(BOSS.dmg).sort((a,b)=>b[1]-a[1]); announce(BOSSES[BOSS.kind].ico+' '+BOSSES[BOSS.kind].n+' VAINCU !','#c4b5fd');
  rank.forEach(([t,d],i)=>{ if(d<8) return; const team=+t; const mem=TD[team].members.filter(m=>m.alive||!m.elim);
    for(const m of mem){ if(i===0){ m.res.diamond+=4; m.res.gold+=3; } else { m.res.gold+=1; m.res.silver+=15; } if(m.alive) floatTxt(m.x,m.y-46,i===0?'+5 diamants +5 or':'+2 or','#fde68a',16); }
    if(i===0){ const pool=Object.keys(RELICS).filter(k=>!RELICS[k].lose); const lead=TD[team].ent; const free=pool.filter(k=>!(lead.relics&&lead.relics[k])); if(free.length){ const r=free[Math.floor(Math.random()*free.length)]; lead.relics[r]=true; msg(`${RELICS[r].ico} ${lead.name} reçoit ${RELICS[r].n} !`,'#fde68a'); } msg(`${BOSSES[BOSS.kind].ico} Les ${TD[team].name} ont terrassé le boss (${Math.round(d)} dégâts) !`,TD[team].light); }
  });
  BOSS.dmg={};
}
function bossPickKind(){ const v=game.opts.boss|0; if(v>=1&&v<=4) return BOSS_KINDS[v-1]; const l=BOSS_KINDS.filter(k=>k!==BOSS.lastKind); return l[Math.floor(Math.random()*l.length)]; }
function bossStart(){
  const kind=bossPickKind(), hum=ents.filter(e=>!e.isBot).length, h=Math.min(3,hum); let x=0,y=0,ok=false;
  if(kind==='crab'){ x=(CX+.5)*T; y=(CY+.5)*T; ok=true; }
  else if(kind==='ghost'){ const a=rnd(0,6.283); x=(CX+.5+Math.cos(a)*30)*T; y=(CY+.5+Math.sin(a)*30)*T; BOSS.a=a+Math.PI/2; ok=true; BOSS.orb=a; }
  else for(let k=0;k<80&&!ok;k++){ const a=rnd(0,6.283), r=rnd(kind==='mega'?11:8,kind==='mega'?19:15); const px=CX+.5+Math.cos(a)*r, py=CY+.5+Math.sin(a)*r; let free=true; for(let dy=-3;dy<=3&&free;dy++)for(let dx=-3;dx<=3;dx++) if(fl(Math.floor(px)+dx,Math.floor(py)+dy)>0){ free=false; break; } if(free){ x=px*T; y=py*T; ok=true; } }
  if(!ok){ BOSS.next=game.t+20; return; }
  const hp={kraken:150+30*h,mega:130+26*h,ghost:200+40*h,crab:170+35*h}[kind], rad={kraken:1.9,mega:1.7,ghost:3.1,crab:1.8}[kind]*T;
  BOSS.on=true; BOSS.kind=kind; BOSS.lastKind=kind; BOSS.x=x; BOSS.y=y; BOSS.max=BOSS.hp=hp; BOSS.rad=rad; BOSS.cd=2.6; BOSS.slams=[]; BOSS.dmg={}; BOSS.ph=0; BOSS.st='cruise'; BOSS.stT=rnd(3,5); BOSS.aux=[]; BOSS.hitSet=null; if(kind!=='ghost') BOSS.a=rnd(0,6.28);
  const B=BOSSES[kind]; announce(B.ico+' '+B.n+' ÉMERGE !',B.col); msg(B.ico+' '+B.txt+' : frappe-le pour gagner une récompense !',B.col); flashScreen(B.col,.25); JUICE.kick(.8); ring(BOSS.x,BOSS.y,T*4,B.col,1.2,true); sfx('boom',BOSS.x,BOSS.y);
}
const bossBlocked=(x,y)=>fl(Math.floor(x/T),Math.floor(y/T))===1||x<3*T||y<3*T||x>(W-3)*T||y>(H-3)*T;
function bossSlam(sx,sy,t,col){ BOSS.slams.push({x:sx,y:sy,t}); ring(sx,sy,T*1.9,col||'#ef4444',t); }
function bossSlamHit(s,R,dm,tileDm,col){ sfx('boom',s.x,s.y); ring(s.x,s.y,T*(R+.3),col||'#a78bfa',.5,true); chunks(s.x,s.y,'#6d28d9',8); shake=Math.max(shake,5); JUICE.kick(.35);
  for(const o of ents){ if(!o.alive) continue; const dx=o.x-s.x,dy=o.y-s.y,d=Math.hypot(dx,dy); if(d<R*T&&o.z<26){ o.bossKill=true; hurt(o,dm,null,dx/(d||1)*520,dy/(d||1)*520); o.bossKill=false; o.vz=Math.max(o.vz,300); } }
  blastTiles(s.x,s.y,(R+.2)*T,tileDm,null,-1); for(const bt of boats) if(Math.hypot(bt.x-s.x,bt.y-s.y)<R*T) hitBoat(bt,6,null); }
function bossNearest(maxd){ let tg=null,bd=maxd; for(const o of ents){ if(!o.alive) continue; const d=Math.hypot(o.x-BOSS.x,o.y-BOSS.y); if(d<bd){ bd=d; tg=o; } } return [tg,bd]; }
function bossUpdate(dt){
  BOSS.ph+=dt; BOSS.flash=Math.max(0,BOSS.flash-dt); const rage=BOSS.hp<BOSS.max*.5, K=BOSS.kind;
  if(K==='kraken'){
    const [tg,bd]=bossNearest(26*T);
    if(tg&&bd>5*T){ const a=Math.atan2(tg.y-BOSS.y,tg.x-BOSS.x), sp=34*dt, nx=BOSS.x+Math.cos(a)*sp, ny=BOSS.y+Math.sin(a)*sp; let ok=true; for(let dy=-1;dy<=1&&ok;dy++)for(let dx=-1;dx<=1;dx++) if(fl(Math.floor(nx/T)+dx,Math.floor(ny/T)+dy)>0){ ok=false; break; } if(ok){ BOSS.x=nx; BOSS.y=ny; } }
    BOSS.cd-=dt;
    if(BOSS.cd<=0){ BOSS.cd=(rage?1.9:3)+rnd(0,.8); const n=rage?2:1;
      for(let k=0;k<n;k++){ let sx,sy; const t2=k===0?tg:ents.filter(o=>o.alive).sort(()=>Math.random()-.5)[0];
        if(t2&&Math.hypot(t2.x-BOSS.x,t2.y-BOSS.y)<15*T){ sx=t2.x+rnd(-10,10); sy=t2.y+rnd(-10,10); } else { const a=rnd(0,6.28); sx=BOSS.x+Math.cos(a)*rnd(4,9)*T; sy=BOSS.y+Math.sin(a)*rnd(4,9)*T; }
        bossSlam(sx,sy,1.15); } }
    for(const s of BOSS.slams){ s.t-=dt; if(s.t<=0) bossSlamHit(s,1.9,7,34,'#a78bfa'); }
  }
  else if(K==='mega'){
    BOSS.stT-=dt; const [tg]=bossNearest(30*T);
    if(BOSS.st==='cruise'){ if(tg){ const a=Math.atan2(tg.y-BOSS.y,tg.x-BOSS.x); let da=a-BOSS.a; while(da>Math.PI) da-=6.283; while(da<-Math.PI) da+=6.283; BOSS.a+=clamp(da,-1.6*dt,1.6*dt); }
      const sp=(rage?85:65)*dt, nx=BOSS.x+Math.cos(BOSS.a)*sp, ny=BOSS.y+Math.sin(BOSS.a)*sp; if(!bossBlocked(nx,ny)){ BOSS.x=nx; BOSS.y=ny; } else BOSS.a+=2.2*dt;
      if(BOSS.stT<=0&&tg){ BOSS.st='aim'; BOSS.stT=1.15; BOSS.a=Math.atan2(tg.y-BOSS.y,tg.x-BOSS.x); BOSS.aux=[BOSS.x,BOSS.y,BOSS.x+Math.cos(BOSS.a)*13*T,BOSS.y+Math.sin(BOSS.a)*13*T]; ring(BOSS.x,BOSS.y,T*2,'#ef4444',1.1); sfx('whoosh',BOSS.x,BOSS.y); } }
    else if(BOSS.st==='aim'){ if(BOSS.stT<=0){ BOSS.st='dash'; BOSS.stT=.62; BOSS.hitSet=new Set(); BOSS.aux=[]; } }
    else if(BOSS.st==='dash'){ const sp=560*dt, nx=BOSS.x+Math.cos(BOSS.a)*sp, ny=BOSS.y+Math.sin(BOSS.a)*sp; if(!bossBlocked(nx,ny)){ BOSS.x=nx; BOSS.y=ny; } else BOSS.stT=Math.min(BOSS.stT,.05);
      if(Math.random()<dt*40) ripple(BOSS.x,BOSS.y,1,1.2,.8,.7,0,2.2);
      blastTiles(BOSS.x,BOSS.y,1.5*T,22,null,-1);
      for(const o of ents){ if(!o.alive||BOSS.hitSet.has(o)) continue; if(Math.hypot(o.x-BOSS.x,o.y-BOSS.y)<1.6*T&&o.z<26){ BOSS.hitSet.add(o); o.bossKill=true; hurt(o,6,null,Math.cos(BOSS.a)*520,Math.sin(BOSS.a)*520); o.bossKill=false; o.vz=Math.max(o.vz,320); sfx('hit',o.x,o.y); } }
      if(BOSS.stT<=0){ BOSS.st='stun'; BOSS.stT=1.7; sfx('boom',BOSS.x,BOSS.y); ring(BOSS.x,BOSS.y,T*2.4,'#93c5fd',.6,true); floatTxt(BOSS.x,BOSS.y-50,'ÉTOURDI ! (+50 % de dégâts)','#bfdbfe',16); } }
    else if(BOSS.st==='stun'){ if(BOSS.stT<=0){ BOSS.st='cruise'; BOSS.stT=rage?rnd(2.4,3.4):rnd(3.6,5); } }
  }
  else if(K==='ghost'){
    BOSS.orb=(BOSS.orb||0)+dt*(rage?.07:.05); const R0=30*T; BOSS.x=(CX+.5)*T+Math.cos(BOSS.orb)*R0; BOSS.y=(CY+.5)*T+Math.sin(BOSS.orb)*R0; BOSS.a=BOSS.orb+Math.PI/2;
    BOSS.cd-=dt; if(BOSS.cd<=0){ BOSS.cd=(rage?1.7:2.6)+rnd(0,.7); const pool=ents.filter(o=>o.alive&&Math.hypot(o.x-BOSS.x,o.y-BOSS.y)<26*T); const n=rage?5:3;
      const tg=pool.length?pool[Math.floor(Math.random()*pool.length)]:null; const bx=tg?tg.x:(CX+.5)*T+rnd(-12,12)*T, by=tg?tg.y:(CY+.5)*T+rnd(-12,12)*T;
      for(let k=0;k<n;k++){ const x=bx+rnd(-2.6,2.6)*T, y=by+rnd(-2.6,2.6)*T, f=1.1+k*.18; ring(x,y,T*1.6,'#2dd4bf',f); bombs.push({x,y,tx:x,ty:y,fuse:f,team:-1,owner:null,kind:'bomb',R:1.6*T,dm:7,bd:.8,shell:true,drop:true,h:0}); } sfx('whoosh',BOSS.x,BOSS.y); }
  }
  else if(K==='crab'){
    BOSS.cd-=dt; BOSS.stT-=dt; const [tg,bd]=bossNearest(9*T); if(tg) BOSS.a=Math.atan2(tg.y-BOSS.y,tg.x-BOSS.x);
    if(BOSS.cd<=0&&tg){ BOSS.cd=(rage?2:3)+rnd(0,.6); bossSlam(tg.x+rnd(-8,8),tg.y+rnd(-8,8),.95,'#f87171'); if(rage) bossSlam(tg.x+rnd(-70,70),tg.y+rnd(-70,70),1.2,'#f87171'); }
    for(const s of BOSS.slams){ s.t-=dt; if(s.t<=0) bossSlamHit(s,1.7,6,30,'#f87171'); }
    if(BOSS.aux.length){ BOSS.aux[0]+=dt*(5*T/1.3); const r=BOSS.aux[0]; for(const o of ents){ if(!o.alive||o.z>=20||BOSS.hitSet&&BOSS.hitSet.has(o)) continue; const d=Math.hypot(o.x-BOSS.x,o.y-BOSS.y); if(Math.abs(d-r)<.55*T){ (BOSS.hitSet=BOSS.hitSet||new Set()).add(o); o.bossKill=true; hurt(o,4,null,(o.x-BOSS.x)/(d||1)*480,(o.y-BOSS.y)/(d||1)*480); o.bossKill=false; o.vz=Math.max(o.vz,250); } }
      if(r>7.5*T){ BOSS.aux=[]; BOSS.hitSet=null; } }
    else if(BOSS.stT<=0){ BOSS.stT=rage?7:10; BOSS.aux=[1.2*T]; BOSS.hitSet=new Set(); sfx('boom',BOSS.x,BOSS.y); shake=Math.max(shake,6); ring(BOSS.x,BOSS.y,T*7.5,'#fca5a5',1.4); floatTxt(BOSS.x,BOSS.y-60,'SAUTE !','#fecaca',18); }
  }
  BOSS.slams=BOSS.slams.filter(s=>s.t>0);
}
/* le kraken encaisse : coups d'épée, explosions, projectiles */
{ const _hg=hitGuards; hitGuards=function(e,cx,cy,R,dmg){ _hg(e,cx,cy,R,dmg); if(BOSS.on&&Math.hypot(BOSS.x-cx,BOSS.y-cy)<R+BOSS.rad) bossHit(dmg,e); };
  const _up=updateProj; updateProj=function(dt){ if(BOSS.on) for(const p of projs){ if(p.life>0&&p.dmg>0&&p.team>=0&&Math.hypot(p.x-BOSS.x,p.y-BOSS.y)<BOSS.rad&&!(p.hitBoss)){ bossHit(p.dmg,p.owner); if(!p.pierce) p.life=0; else p.hitBoss=true; } } _up(dt); };
}
function treUpdate(dt){
  if(!TRE.on){ TRE.next-=dt; if(TRE.next>0) return;
    const ls=ISLANDS.filter(il=>!il.ship&&il.reg===5); if(!ls.length){ TRE.next=30; return; } const il=ls[Math.floor(Math.random()*ls.length)];
    for(let k=0;k<12;k++){ const x=il.x+Math.floor(rnd(-il.r+2,il.r-1)), y=il.y+Math.floor(rnd(-il.r+2,il.r-1)); if(fl(x,y)>0&&!wl(x,y)){ TRE.x=(x+.5)*T; TRE.y=(y+.5)*T; break; } }
    if(!TRE.x) { TRE.x=(il.x+.5)*T; TRE.y=(il.y+.5)*T; } TRE.on=true; TRE.t=85; TRE.prog=0; TRE.team=-1;
    announce('💎 UN COFFRE-BUTIN EST APPARU !','#fde68a'); msg('💎 Un coffre-butin est apparu sur un îlot : tiens-le quelques secondes pour l\'ouvrir !','#fde68a'); ring(TRE.x,TRE.y,T*3,'#fde047',1,true); sfx('fanfare'); return; }
  TRE.t-=dt; if(TRE.t<=0){ TRE.on=false; TRE.next=rnd(55,80); burst(TRE.x,TRE.y,'#fde047',20,200,.8,4); msg('💎 Le coffre-butin a coulé…','#9aa7cf'); TRE.x=0; return; }
  const near=ents.filter(o=>o.alive&&o.z<24&&Math.hypot(o.x-TRE.x,o.y-TRE.y)<1.9*T), teams=[...new Set(near.map(o=>o.team))];
  if(teams.length===1){ TRE.team=teams[0]; TRE.prog+=dt/3.2*(1+.35*(near.length-1)); if(Math.random()<dt*10) burst(TRE.x,TRE.y,TEAMS[TRE.team].light,2,90,.5,3);
    if(TRE.prog>=1){ treOpen(near,TRE.team); } }
  else { TRE.prog=Math.max(0,TRE.prog-dt*(teams.length>1?.2:.5)); if(!teams.length) TRE.team=-1; }
}
function treOpen(near,team){
  TRE.on=false; TRE.next=rnd(80,110); const x=TRE.x,y=TRE.y; TRE.x=0; ring(x,y,T*3,'#fde047',.8,true); burst(x,y,'#fde047',40,280,.9,5); sfx('fanfare'); JUICE.kick(.5);
  near.forEach((o,i)=>{ o.res.diamond+=i===0?4:2; o.res.gold+=i===0?2:1; o.res.silver+=i===0?30:12; floatTxt(o.x,o.y-48,i===0?'+4💎 +3 or':'+2💎','#fde047',16); });
  const lead=near[0], pool=Object.keys(RELICS).filter(k=>!RELICS[k].lose&&!(lead.relics&&lead.relics[k]));
  if(pool.length){ const r=pool[Math.floor(Math.random()*pool.length)]; lead.relics[r]=true; msg(`${RELICS[r].ico} ${lead.name} trouve ${RELICS[r].n} !`,'#fde68a'); }
  announce(`💎 Les ${TD[team].name} ouvrent le coffre-butin !`,TD[team].light);
}
function galUpdate(dt){
  const cx=(CX+.5)*T, cy=(CY+.5)*T, pr=[0,0,0,0];
  for(const o of ents) if(o.alive&&o.z<22&&Math.abs(o.x-cx)<3.6*T&&Math.abs(o.y-cy)<6.2*T) pr[o.team]++;
  GAL.pres=pr; let lead=-1,mx=0,tie=false; pr.forEach((n,t)=>{ if(n>mx){ mx=n; lead=t; tie=false; } else if(n===mx&&n>0) tie=true; }); if(tie) lead=-1;
  if(lead>=0){
    if(lead===GAL.holder){ GAL.capTeam=lead; GAL.capV=Math.min(100,GAL.capV+25*dt); }
    else if(GAL.capTeam!==lead){ GAL.capV-=22*dt; if(GAL.capV<=0){ GAL.capTeam=lead; GAL.capV=0; } }
    else { GAL.capV+=(8+5*(mx-1))*dt; if(GAL.capV>=100){ GAL.capV=100; if(GAL.holder!==lead){ GAL.holder=lead; announce(`⚓ LES ${TD[lead].name.toUpperCase()} PRENNENT LE GALION !`,TD[lead].light); msg(`⚓ Les ${TD[lead].name} contrôlent le galion : forges +35 %, or régulier, coffre −20 % de dégâts.`,TD[lead].light); flashScreen(TD[lead].col,.2); sfx('fanfare'); } } }
  } else if(GAL.holder<0) GAL.capV=Math.max(0,GAL.capV-4*dt);
  if(GAL.holder>=0){ GAL.gold-=dt; if(GAL.gold<=0){ GAL.gold=24; for(const m of TD[GAL.holder].members) if(m.alive){ m.res.gold+=1; floatTxt(m.x,m.y-44,'+1 or (galion)','#fbbf24',13); } } }
}
{ const _u=updateEvents;
  updateEvents=function(dt){
    _u(dt); if(game.state!=='play') return;
    if(OBJ('galion')) galUpdate(dt); if(OBJ('treasure')) treUpdate(dt);
    if(game.opts.boss){ if(BOSS.on) bossUpdate(dt); else if(game.t>=BOSS.next) bossStart(); }
    for(const e of ents){ if(!e.carry) continue; e.carryT-=dt; const td=TD[e.team];
      if(e.carryT<=0){ // le coffre est reposé automatiquement
        let done=false; const cand=[[Math.floor(e.x/T),Math.floor(e.y/T)],[td.ox,td.oy]]; for(const [x,y] of cand) if(!done&&x!==undefined&&moverOk(e,x,y)){ moverPlace(e,x,y); done=true; }
        if(!done) for(let r=1;r<5&&!done;r++)for(let dy=-r;dy<=r&&!done;dy++)for(let dx=-r;dx<=r&&!done;dx++){ const x=td.ox+dx,y=td.oy+dy; if(moverOk(e,x,y)){ moverPlace(e,x,y); done=true; } }
        e.am.mover=Math.max(0,(e.am.mover||1)-1); } }
  };
  const _ng=newGame;
  newGame=function(){ _ng(); GAL.holder=-1; GAL.capTeam=-1; GAL.capV=0; GAL.gold=12; TRE.on=false; TRE.next=55; TRE.x=0; BOSS.on=false; BOSS.next=200; BOSS.slams=[]; BOSS.dmg={};
    if(OBJ('galion')) for(const sp of spawners) if(sp.kind==='base') for(const k in sp.types){ const ty=sp.types[k], f=ty.int; ty.int=()=>f()/(GAL.holder===sp.team?1.35:1); }
    const on=[]; if(OBJ('galion')) on.push('⚓ Capture du galion'); if(OBJ('treasure')) on.push('💎 Chasse au trésor'); if(game.opts.boss) on.push('🐙 Kraken géant'); if(on.length) msg('Objectifs bonus : '+on.join(' · '),'#fcd34d'); };
  const _dt=damageTile;
  damageTile=function(tx,ty,dmg,src,layer){ if(GAL.holder>=0&&OBJ('galion')&&inb(tx,ty)){ const i=idx(tx,ty); if(wallT[i]===CORE&&ownW[i]===GAL.holder) dmg*=.8; } return _dt(tx,ty,dmg,src,layer); };
}
/* ---------- réseau : l'état des objectifs voyage avec les instantanés ---------- */
{ const _nc=netCommon; netCommon=function(){ const c=_nc();
    c.md={g:[GAL.holder,GAL.capTeam,Math.round(GAL.capV)],t:TRE.on?[Math.round(TRE.x),Math.round(TRE.y),Math.round(TRE.t),Math.round(TRE.prog*100),TRE.team]:0,
      b:BOSS.on?[Math.round(BOSS.x),Math.round(BOSS.y),Math.round(BOSS.hp),BOSS.max,BOSS.slams.map(s=>[Math.round(s.x),Math.round(s.y),Math.round(s.t*10)/10]),BOSS.flash>0?1:0,BOSS.kind,Math.round(BOSS.a*100)/100,BOSS.aux.map(v=>Math.round(v)),BOSS.st]:0};
    if(TD.some(t=>t.moved)) c.cb=TD.map(t=>[t.bx,t.by]); return c; };
  const _na=netApplySnap; netApplySnap=function(m){ _na(m); const d=m.md; if(d){ GAL.holder=d.g[0]; GAL.capTeam=d.g[1]; GAL.capV=d.g[2];
      if(d.t){ TRE.on=true; TRE.x=d.t[0]; TRE.y=d.t[1]; TRE.t=d.t[2]; TRE.prog=d.t[3]/100; TRE.team=d.t[4]; } else TRE.on=false;
      if(d.b){ BOSS.on=true; BOSS.x=d.b[0]; BOSS.y=d.b[1]; BOSS.hp=d.b[2]; BOSS.max=d.b[3]; BOSS.slams=d.b[4].map(s=>({x:s[0],y:s[1],t:s[2]})); BOSS.flash=d.b[5]?.15:0; BOSS.ph=game.t; BOSS.kind=d.b[6]||'kraken'; BOSS.a=d.b[7]||0; BOSS.aux=d.b[8]||[]; BOSS.st=d.b[9]||'cruise'; BOSS.rad={kraken:1.9,mega:1.7,ghost:3.1,crab:1.8}[BOSS.kind]*T; } else BOSS.on=false; }
    if(m.cb) m.cb.forEach((p,i)=>{ if(TD[i]){ TD[i].bx=p[0]; TD[i].by=p[1]; } }); };
}
/* ---------- bots : ils veulent le galion, le trésor et… ils évitent le kraken ---------- */
{ const _pg=pickGoal;
  pickGoal=function(b){
    const ai=b.ai, r=Math.random();
    if(OBJ('treasure')&&TRE.on&&r<.5&&TRE.team!==b.team){ ai.mode='res'; ai.goal=[Math.floor(TRE.x/T),Math.floor(TRE.y/T)]; ai.wait=7; ai.bounty=false; return; }
    if(OBJ('galion')&&GAL.holder!==b.team&&r<.35){ ai.mode='res'; ai.goal=[CX,CY+(Math.random()<.5?-2:2)]; ai.wait=16; ai.bounty=false; return; }
    _pg(b);
  };
}
/* ---------- affichage ---------- */
let bossG=null, treG=null, galG=null, carryM=new Map();
function modesBuild(){
  bossG=new THREE.Group(); const body=new THREE.Mesh(GEO.sphere,new THREE.MeshStandardMaterial({color:0x6d28d9,flatShading:true,roughness:.7})); body.scale.set(2.5,1.9,2.5); body.position.y=.5; bossG.add(body); bossG.userData.body=body;
  for(const sx of [-1,1]){ const eye=new THREE.Mesh(GEO.sphere0,new THREE.MeshBasicMaterial({color:0xfef3c7})); eye.scale.set(.5,.5,.4); eye.position.set(sx*.9,1.1,1.9); bossG.add(eye); const pu=new THREE.Mesh(GEO.sphere0,new THREE.MeshBasicMaterial({color:0x111827})); pu.scale.set(.22,.3,.2); pu.position.set(sx*.9,1.1,2.25); bossG.add(pu); }
  bossG.userData.tent=[]; for(let i=0;i<8;i++){ const a=i/8*6.283, g=new THREE.Group(), segs=[]; for(let s=0;s<4;s++){ const m=new THREE.Mesh(GEO.cyl,new THREE.MeshStandardMaterial({color:s%2?0x7c3aed:0x6d28d9,flatShading:true})); m.scale.set(.42-s*.07,.8,.42-s*.07); g.add(m); segs.push(m); } g.userData={a,segs}; bossG.add(g); bossG.userData.tent.push(g); }
  bossG.visible=false; scene.add(bossG);
  treG=new THREE.Group(); const cb=new THREE.Mesh(GEO.box,new THREE.MeshStandardMaterial({color:0x8a5326,flatShading:true})); cb.scale.set(1.1,.7,.75); cb.position.y=.4; treG.add(cb);
  const gl=new THREE.Mesh(GEO.box,new THREE.MeshStandardMaterial({color:0xfbbf24,emissive:0xb45309,emissiveIntensity:.8,flatShading:true})); gl.scale.set(1.18,.12,.8); gl.position.y=.76; treG.add(gl);
  const beam=new THREE.Mesh(GEO.cyl,new THREE.MeshBasicMaterial({color:0xfde047,transparent:true,opacity:.22,depthWrite:false,blending:THREE.AdditiveBlending})); beam.scale.set(.5,14,.5); beam.position.y=7; treG.add(beam); treG.userData.beam=beam;
  const ring=new THREE.Mesh(GEO.ring,new THREE.MeshBasicMaterial({color:0xfde047,transparent:true,opacity:.9,side:THREE.DoubleSide,depthWrite:false})); ring.scale.set(1.9,1,1.9); ring.position.y=.05; treG.add(ring); treG.userData.ring=ring; treG.visible=false; scene.add(treG);
  galG=new THREE.Group(); const gr=new THREE.Mesh(GEO.ring,new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.7,side:THREE.DoubleSide,depthWrite:false})); gr.scale.set(4.2,1,6.6); gr.position.set(CX+.5,.9,CY+.5); galG.add(gr); galG.userData.ring=gr;
  const pole=new THREE.Mesh(GEO.cyl,new THREE.MeshStandardMaterial({color:0xcbd5e1})); pole.scale.set(.05,2.2,.05); pole.position.set(CX+.5,2,CY-3.5); galG.add(pole); const fl=new THREE.Mesh(new THREE.PlaneGeometry(1.1,.7),new THREE.MeshBasicMaterial({color:0xffffff,side:THREE.DoubleSide})); fl.position.set(CX+1.05,2.8,CY-3.5); galG.add(fl); galG.userData.flag=fl; galG.visible=false; scene.add(galG);
}
function modesFrame(dt){
  if(!scene) return; if(!bossG) modesBuild(); const t=game.t;
  // kraken
  bossG.visible=BOSS.on&&BOSS.kind==='kraken'&&game.state!=='menu'; if(bossG.visible){ const u=bossG.userData, ph=BOSS.ph; bossG.position.set(BOSS.x*U,-.95+Math.sin(t*1.4)*.12,BOSS.y*U); bossG.rotation.y=Math.sin(t*.3)*.4;
    u.body.material.emissive.setHex(BOSS.flash>0?0xff4444:0x000000); u.body.material.emissiveIntensity=BOSS.flash>0?1:0; const rage=BOSS.hp<BOSS.max*.5; u.body.material.color.setHex(rage?0x9d174d:0x6d28d9);
    for(const g of u.tent){ const a=g.userData.a, R=2.4; let y=.2; g.position.set(Math.cos(a)*R,0,Math.sin(a)*R); let ang=0; g.userData.segs.forEach((m,s)=>{ const bend=Math.sin(t*2+a*2+s*.9)*.5; ang+=bend*.5; m.position.set(Math.cos(a)*(s*.55*Math.cos(ang)),y+s*.55*.9,Math.sin(a)*(s*.55*Math.cos(ang))); m.rotation.z=Math.cos(a)*ang; m.rotation.x=Math.sin(a)*ang; }); } }
  // coffre-butin
  treG.visible=TRE.on&&game.state!=='menu'; if(treG.visible){ treG.position.set(TRE.x*U,groundTop(TRE.x,TRE.y),TRE.y*U); treG.userData.beam.material.opacity=.16+.1*Math.sin(t*4); const s=1.9+.2*Math.sin(t*5)+TRE.prog*1.2; treG.userData.ring.scale.set(s,1,s); treG.userData.ring.material.color.set(TRE.team>=0?TEAMS[TRE.team].col:'#fde047'); treG.rotation.y=t*.5; }
  // galion
  galG.visible=OBJ('galion')&&game.state!=='menu'; if(galG.visible){ const col=GAL.holder>=0?TEAMS[GAL.holder].col:(GAL.capTeam>=0?TEAMS[GAL.capTeam].col:'#ffffff'); galG.userData.ring.material.color.set(col); galG.userData.ring.material.opacity=.4+.25*Math.sin(t*3); galG.userData.flag.material.color.set(GAL.holder>=0?TEAMS[GAL.holder].col:'#e5e7eb'); galG.userData.flag.rotation.y=Math.sin(t*3)*.3; }
  // coffre porté
  for(const e of ents){ let m=carryM.get(e); if(e.carry&&e.alive){ if(!m){ m=new THREE.Mesh(GEO.box,new THREE.MeshStandardMaterial({color:0x8a5326,emissive:0x7a5000,emissiveIntensity:.5,flatShading:true})); m.scale.set(.7,.5,.5); scene.add(m); carryM.set(e,m); } m.position.set(e.x*U,e.z*U+1.55+Math.sin(t*6)*.04,e.y*U); m.rotation.y=t*2; m.visible=true; } else if(m) m.visible=false; }
}
function groundTop(x,y){ const tx=Math.floor(x/T), ty=Math.floor(y/T); return (wl(tx,ty)?wallTop(tx,ty)*U:0)+.02; }
{ const _r=render3d; render3d=function(dt){ if(renderer&&scene&&game.state!=='menu') modesFrame(dt); _r(dt); }; }
/* coffre déplacé : le modèle suit */
{ const _s=syncCores; syncCores=function(){ TD.forEach((td,i)=>{ const g=coreM[i]; if(g){ g.position.x=td.bx+.5; g.position.z=td.by+.5; } }); _s(); }; }
{ const _dh=drawHud;
  drawHud=function(){ _dh(); if(game.state==='menu'||!ctx||!player) return; ctx.save(); ctx.setTransform(DPR,0,0,DPR,0,0); ctx.textAlign='center';
    let y=Math.max(88,VH<460?50:96);
    if(OBJ('galion')){ const w=230, x=VW/2-w/2, hc=GAL.holder>=0?TEAMS[GAL.holder].col:'#9ca3af'; panel(x,y,w,38,12,hc); ctx.font='bold 13px '+FONT; ctx.fillStyle='#fff'; ctx.fillText('⚓ Galion : '+(GAL.holder>=0?TD[GAL.holder].name+(GAL.holder===player.team?' (toi)':''):'libre'),VW/2,y+16);
      const cc=GAL.capTeam>=0?TEAMS[GAL.capTeam].col:'#6b7280'; ctx.fillStyle='rgba(255,255,255,.18)'; ctx.fillRect(x+12,y+23,w-24,6); ctx.fillStyle=cc; ctx.fillRect(x+12,y+23,(w-24)*GAL.capV/100,6); y+=44; }
    if(OBJ('treasure')&&TRE.on){ const w=230, x=VW/2-w/2; panel(x,y,w,38,12,'#fde047'); ctx.font='bold 13px '+FONT; ctx.fillStyle='#fde68a'; ctx.fillText('💎 Coffre-butin · '+Math.ceil(TRE.t)+' s',VW/2,y+16); ctx.fillStyle='rgba(255,255,255,.18)'; ctx.fillRect(x+12,y+23,w-24,6); ctx.fillStyle=TRE.team>=0?TEAMS[TRE.team].col:'#fde047'; ctx.fillRect(x+12,y+23,(w-24)*TRE.prog,6); y+=44;
      const s=w2s(TRE.x,TRE.y,50+Math.sin(game.t*5)*5), m=34; if(!(s[2]&&s[0]>m&&s[0]<VW-m&&s[1]>m&&s[1]<VH-90)){ const cx=VW/2, cy=VH/2; let dx=s[0]-cx, dy=s[1]-cy; if(!s[2]){ dx=-dx; dy=-dy; } const k=Math.min((VW/2-m)/Math.abs(dx||1),(VH/2-m-60)/Math.abs(dy||1)), px=cx+dx*k, py=cy+dy*k, a=Math.atan2(dy,dx); ctx.save(); ctx.translate(px,py); ctx.font='20px '+FONT; ctx.fillText('💎',0,7); ctx.rotate(a); ctx.beginPath(); ctx.moveTo(26,0); ctx.lineTo(18,-6); ctx.lineTo(18,6); ctx.closePath(); ctx.fillStyle='#fde047'; ctx.fill(); ctx.restore(); }
      else { ctx.font='24px '+FONT; ctx.fillText('💎',s[0],s[1]); } }
    if(BOSS.on){ const w=Math.min(360,VW-40), x=VW/2-w/2; panel(x,y,w,44,12,BOSSES[BOSS.kind].col); ctx.font='bold 14px '+FONT; ctx.fillStyle='#fff'; ctx.fillText(BOSSES[BOSS.kind].ico+' '+BOSSES[BOSS.kind].n,VW/2,y+17); ctx.fillStyle='rgba(255,255,255,.18)'; ctx.fillRect(x+12,y+26,w-24,10); ctx.fillStyle=BOSS.hp<BOSS.max*.5?'#f472b6':'#a78bfa'; ctx.fillRect(x+12,y+26,(w-24)*Math.max(0,BOSS.hp/BOSS.max),10); y+=50;
      for(const s of BOSS.slams){ gCircle(s.x,s.y,T*1.9,'rgba(239,68,68,.9)',3,true,2); } }
    if(player.carry){ const w=300, x=VW/2-w/2; panel(x,y,w,40,12,'#f59e0b'); ctx.font='bold 14px '+FONT; ctx.fillStyle='#fde68a'; ctx.fillText('📦 Coffre en transport · '+Math.ceil(player.carryT)+' s',VW/2,y+16); ctx.font='12px '+FONT; ctx.fillStyle='#fff'; ctx.fillText('Clique sur ton île pour le poser · si tu meurs, il est détruit !',VW/2,y+32); y+=46; }
    for(const e of ents){ if(!e.carry||!e.alive||e===player) continue; const s=w2s(e.x,e.y,e.z+84); if(s[2]){ ctx.font='bold 12px '+FONT; ctx.fillStyle='#fde68a'; ctx.strokeStyle='rgba(10,20,50,.9)'; ctx.lineWidth=3; ctx.strokeText('📦 coffre !',s[0],s[1]); ctx.fillText('📦 coffre !',s[0],s[1]); } }
    // mini-carte
    { const S=miniSize(), mx=VW-S-10, my=10; ctx.save(); rr(mx,my,S,S,8); ctx.clip();
      if(TRE.on){ const x=mx+TRE.x/T/W*S, yy=my+TRE.y/T/H*S, r=3+(game.t*6%4); ctx.strokeStyle='#fde047'; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(x,yy,r,0,6.3); ctx.stroke(); ctx.fillStyle='#fde047'; ctx.beginPath(); ctx.arc(x,yy,2.5,0,6.3); ctx.fill(); }
      if(BOSS.on){ const x=mx+BOSS.x/T/W*S, yy=my+BOSS.y/T/H*S; ctx.fillStyle='#a78bfa'; ctx.beginPath(); ctx.arc(x,yy,4,0,6.3); ctx.fill(); ctx.strokeStyle='#fff'; ctx.lineWidth=1.5; ctx.stroke(); }
      ctx.restore(); }
    ctx.restore(); };
}

/* ---------- modèles des autres boss ---------- */
const bossX={mega:null,ghost:null,crab:null};
const bm=(c,o)=>new THREE.MeshStandardMaterial(Object.assign({color:c,flatShading:true,roughness:.75},o||{}));
function bossBuildX(){
  // mégalodon
  { const g=new THREE.Group(), body=new THREE.Mesh(GEO.sphere,bm(0x58687a)); body.scale.set(3.4,.95,1.05); g.add(body); const belly=new THREE.Mesh(GEO.sphere,bm(0xe5e7eb)); belly.scale.set(3,.5,1); belly.position.y=-.38; g.add(belly);
    const head=new THREE.Mesh(GEO.sphere,bm(0x4b5b6b)); head.scale.set(1.2,.8,.95); head.position.x=2.5; g.add(head);
    for(const z of [-.55,.55]){ const eye=new THREE.Mesh(GEO.sphere0,new THREE.MeshBasicMaterial({color:0x111827})); eye.scale.setScalar(.13); eye.position.set(3.1,.25,z); g.add(eye); }
    for(let i=0;i<6;i++){ const t=new THREE.Mesh(GEO.cone,bm(0xffffff)); t.scale.set(.09,.28,.09); t.rotation.z=Math.PI; t.position.set(3.2+i*.02,-.22,-.45+i*.18); g.add(t); }
    const fin=new THREE.Mesh(GEO.cone,bm(0x47576a)); fin.scale.set(.6,1.3,.2); fin.position.set(-.2,1.05,0); fin.rotation.z=-.35; g.add(fin);
    const tail=new THREE.Group(); tail.position.x=-3.1; g.add(tail); const t1=new THREE.Mesh(GEO.sphere,bm(0x47576a)); t1.scale.set(1.3,.45,.45); t1.position.x=-1; tail.add(t1);
    const fl=new THREE.Mesh(GEO.sphere0,bm(0x47576a)); fl.scale.set(.6,1.1,.1); fl.position.x=-2.1; tail.add(fl); g.userData={tail,body,head}; g.visible=false; scene.add(g); bossX.mega=g; }
  // vaisseau fantôme
  { const g=new THREE.Group(), gm=(c,o)=>new THREE.MeshStandardMaterial(Object.assign({color:c,flatShading:true,transparent:true,opacity:.62,emissive:0x2dd4bf,emissiveIntensity:.45,roughness:.6,depthWrite:false},o||{}));
    const hull=new THREE.Mesh(GEO.box,gm(0x2f6f6a)); hull.scale.set(7.4,1.1,2.4); hull.position.y=.35; g.add(hull); const bow=new THREE.Mesh(GEO.cone,gm(0x2f6f6a)); bow.scale.set(1.3,2.2,1.3); bow.rotation.z=-Math.PI/2; bow.position.set(4.3,.6,0); g.add(bow);
    const deck=new THREE.Mesh(GEO.box,gm(0x4aa89f)); deck.scale.set(6.6,.2,2.1); deck.position.y=1; g.add(deck);
    for(const x of [-1.8,.4,2.4]){ const m=new THREE.Mesh(GEO.cyl,gm(0x7ddad0)); m.scale.set(.1,2.8,.1); m.position.set(x,2.4,0); g.add(m); const sl=new THREE.Mesh(GEO.box,gm(0xc9fff7,{opacity:.42})); sl.scale.set(.04,1.9,1.9); sl.position.set(x+.1,2.8,0); g.add(sl); }
    const lan=new THREE.Mesh(GEO.sphere0,new THREE.MeshBasicMaterial({color:0x99f6e4})); lan.scale.setScalar(.28); lan.position.set(-3.6,1.8,0); g.add(lan); g.userData={lan,hull}; g.visible=false; scene.add(g); bossX.ghost=g; }
  // roi crabe
  { const g=new THREE.Group(), body=new THREE.Mesh(GEO.sphere,bm(0xdc2626)); body.scale.set(2.2,.95,1.7); body.position.y=.9; g.add(body); const shell=new THREE.Mesh(GEO.sphere,bm(0xb91c1c)); shell.scale.set(2,.5,1.55); shell.position.y=1.5; g.add(shell);
    const claws=[]; for(const z of [-1,1]){ const arm=new THREE.Group(); arm.position.set(1.6,1,z*1.5); g.add(arm); const a1=new THREE.Mesh(GEO.cyl,bm(0xdc2626)); a1.scale.set(.2,.9,.2); a1.rotation.z=Math.PI/2; a1.position.x=.5; arm.add(a1);
      const p1=new THREE.Mesh(GEO.box,bm(0xef4444)); p1.scale.set(.9,.35,.5); p1.position.set(1.2,.12,0); arm.add(p1); const p2=new THREE.Mesh(GEO.box,bm(0xef4444)); p2.scale.set(.9,.18,.5); p2.position.set(1.2,-.12,0); arm.add(p2); claws.push({arm,p1,p2,z}); }
    for(let i=0;i<3;i++) for(const z of [-1,1]){ const l=new THREE.Mesh(GEO.cyl,bm(0xb91c1c)); l.scale.set(.1,.9,.1); l.position.set(-.5+i*.6,.45,z*1.6); l.rotation.x=z*.9; g.add(l); }
    for(const z of [-.5,.5]){ const st=new THREE.Mesh(GEO.cyl,bm(0xdc2626)); st.scale.set(.06,.4,.06); st.position.set(1.7,1.9,z); g.add(st); const e=new THREE.Mesh(GEO.sphere0,new THREE.MeshBasicMaterial({color:0xfef3c7})); e.scale.setScalar(.17); e.position.set(1.7,2.3,z); g.add(e); const p=new THREE.Mesh(GEO.sphere0,new THREE.MeshBasicMaterial({color:0x111827})); p.scale.setScalar(.08); p.position.set(1.83,2.3,z); g.add(p); }
    const crown=new THREE.Mesh(GEO.cone,bm(0xfbbf24,{metalness:.5})); crown.scale.set(.5,.5,.5); crown.position.set(.2,2.1,0); g.add(crown);
    const wave=new THREE.Mesh(GEO.ring,new THREE.MeshBasicMaterial({color:0xfca5a5,transparent:true,opacity:.8,side:THREE.DoubleSide,depthWrite:false})); wave.visible=false; scene.add(wave);
    g.userData={claws,body,wave}; g.visible=false; scene.add(g); bossX.crab=g; }
}
{ const _r=render3d;
  render3d=function(dt){ _r(dt); if(!scene||game.state==='menu') return; if(!bossX.mega) bossBuildX(); const t=game.t, on=BOSS.on;
    for(const k of ['mega','ghost','crab']) bossX[k].visible=on&&BOSS.kind===k;
    if(on&&BOSS.kind==='mega'){ const g=bossX.mega; g.position.set(BOSS.x*U,-.85+Math.sin(t*1.5)*.08,BOSS.y*U); g.rotation.y=-BOSS.a; g.userData.tail.rotation.y=Math.sin(t*(BOSS.st==='dash'?14:4))*.4; const st=BOSS.st==='stun'; g.userData.body.material.emissive.setHex(st?0x3b82f6:BOSS.flash>0?0xff4444:0); g.userData.body.material.emissiveIntensity=st||BOSS.flash>0?.9:0; g.rotation.z=st?Math.sin(t*20)*.08:0;
      if(BOSS.st==='aim'&&BOSS.aux.length===4){ const c=(BOSS.aux[0]+BOSS.aux[2])/2, d=(BOSS.aux[1]+BOSS.aux[3])/2; gLineWorld=[BOSS.aux]; } else gLineWorld=null; }
    if(on&&BOSS.kind==='ghost'){ const g=bossX.ghost; g.position.set(BOSS.x*U,.1+Math.sin(t*1.1)*.18,BOSS.y*U); g.rotation.y=-BOSS.a; g.rotation.z=Math.sin(t*.9)*.05; g.userData.hull.material.emissiveIntensity=.35+.2*Math.sin(t*3)+(BOSS.flash>0?.8:0); g.userData.lan.scale.setScalar(.25+.06*Math.sin(t*7)); }
    if(on&&BOSS.kind==='crab'){ const g=bossX.crab, u=g.userData; g.position.set(BOSS.x*U,wallTop(Math.floor(BOSS.x/T),Math.floor(BOSS.y/T))*U+.05,BOSS.y*U); g.rotation.y=-BOSS.a; const sl=BOSS.slams.length?1:0; u.claws.forEach((c,i)=>{ const o=Math.sin(t*3+i*2); c.arm.rotation.z=sl?.9+Math.sin(t*20)*.1:.15+o*.1; c.arm.rotation.y=c.z*(sl?.25:.5+o*.15); c.p1.rotation.z=sl?.6:.15+o*.15; c.p2.rotation.z=sl?-.6:-.15-o*.15; });
      u.body.material.emissive.setHex(BOSS.flash>0?0xff4444:0); u.body.material.emissiveIntensity=BOSS.flash>0?1:0; u.wave.visible=BOSS.aux.length>0; if(u.wave.visible){ const r=BOSS.aux[0]*U; u.wave.position.set(BOSS.x*U,.15,BOSS.y*U); u.wave.scale.set(r,1,r); u.wave.material.opacity=.8*Math.max(0,1-r/7.6); } }
    else bossX.crab.userData.wave.visible=false; };
}
let gLineWorld=null;
/* ligne rouge de charge du mégalodon + noms par boss dans le HUD */
{ const _dh=drawHud;
  drawHud=function(){ _dh(); if(!BOSS.on||game.state==='menu'||!ctx||!player) return; ctx.save(); ctx.setTransform(DPR,0,0,DPR,0,0);
    if(BOSS.kind==='mega'&&BOSS.st==='aim'&&BOSS.aux.length===4){ const a=BOSS.aux; ctx.globalAlpha=.55+.4*Math.sin(game.t*20); gLine(a[0],a[1],4,a[2],a[3],4,'#ef4444',7); gLine(a[0],a[1],4,a[2],a[3],4,'#fecaca',2); }
    if(BOSS.kind==='mega'&&BOSS.st==='stun'){ const s=w2s(BOSS.x,BOSS.y,70); ctx.font='bold 15px '+FONT; ctx.textAlign='center'; ctx.fillStyle='#bfdbfe'; ctx.lineWidth=4; ctx.strokeStyle='rgba(10,20,50,.9)'; ctx.strokeText('💫 ÉTOURDI',s[0],s[1]); ctx.fillText('💫 ÉTOURDI',s[0],s[1]); }
    ctx.restore(); };
}
