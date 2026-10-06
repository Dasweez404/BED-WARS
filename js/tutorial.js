'use strict';
/* =====================  TUTORIEL GUIDÉ  =====================
   Une partie spéciale : bots inoffensifs, événements coupés, étapes interactives (bouger, ramasser, acheter, construire, miner, combattre, pinger). */
const TUT={on:false,i:0,okT:0,t:0,c:{},backup:null,dummy:null};
const TUT_KEY='pirates_tut';
const tutTouch=()=>typeof TOUCH!=='undefined'&&TOUCH.on;
const TUT_STEPS=[
  {t:'Bouger',x:'Déplace-toi avec Z Q S D (ou les flèches). Ton pirate vise toujours vers la souris.',xt:'Fais glisser ton pouce sur la moitié gauche de l\'écran pour te déplacer.',ok:()=>TUT.c.dist>4*T},
  {t:'Sauter',x:'Saute avec la barre Espace. En l\'air, un clic pose même un bloc sous tes pieds !',xt:'Appuie sur le gros bouton ⤒ en bas à droite pour sauter.',ok:()=>TUT.c.jumped},
  {t:'Ramasser des ressources',x:'Des piles de ressources (bronze, argent…) apparaissent près de ton coffre. Marche dessus pour les ramasser : trouve 12 bronzes.',xt:'Marche sur les piles près du coffre pour les ramasser : trouve 12 bronzes.',tg:()=>{ const s=spawners.find(s=>s.kind==='base'&&s.team===0); return s?[(s.x+.5)*T,(s.y+.5)*T,'Bronze · argent']:null; },ok:()=>player.res.bronze>=12||TUT.c.bronzeMax>=12},
  {t:'La boutique',x:'Reste près de ton coffre au trésor et appuie sur E pour ouvrir la boutique.',xt:'Reste près de ton coffre et appuie sur le bouton 🛒.',tg:()=>[(TD[0].bx+.5)*T,(TD[0].by+.5)*T,'Ton coffre'],enter:()=>{ player.res.bronze+=40; player.res.silver+=12; },ok:()=>shopOpen},
  {t:'Acheter',x:'Clique sur un article pour l\'acheter : des blocs (Pierre, Bois), une arme, une amélioration… Ce que tu achètes dans la boutique reste utile toute la partie.',xt:'Touche un article pour l\'acheter : des blocs, une arme, une amélioration…',ok:()=>TUT.c.bought},
  {t:'Choisir un objet',x:'Ferme la boutique (E ou Échap), puis change d\'objet avec la molette ou les touches 1 à 0. Ta barre d\'objets est en bas de l\'écran.',xt:'Ferme la boutique, puis touche un objet dans la barre en bas.',hl:'hotbar',ok:()=>!shopOpen&&TUT.c.sels>=2},
  {t:'Construire',x:'Prends les blocs (1) et clique : sur la mer ça fait un pont, sur le sol une palissade. Pose 6 blocs !',xt:'Sélectionne les blocs, puis pousse le joystick droit vers la mer : maintiens pour poser des blocs. Pose 6 blocs !',hl:'hotbar',enter:()=>{ player.blocks[2]=Math.max(player.blocks[2],20); },ok:()=>TUT.c.placed>=6},
  {t:'Miner',x:'Équipe la pioche (2) et maintiens le clic sur un bloc pour le casser. Un bloc miné te revient dans l\'inventaire.',xt:'Équipe la pioche, puis maintiens le joystick droit en visant un bloc.',hl:'hotbar',ok:()=>TUT.c.mined>=3},
  {t:'Combattre',x:'Un mannequin s\'est invité ! Équipe l\'épée (3) et frappe-le avec le clic gauche, trois fois.',xt:'Équipe l\'épée, puis pousse le joystick droit vers le mannequin : frappe-le trois fois.',hl:'hotbar',tg:()=>TUT.dummy&&TUT.dummy.alive?[TUT.dummy.x,TUT.dummy.y,'Mannequin']:null,enter:()=>tutDummy(),ok:()=>TUT.c.hits>=3},
  {t:'Prévenir son équipe',x:'V envoie un ping à l\'endroit visé (maintiens-le pour choisir parmi plusieurs), X ouvre la roue d\'emojis. Essaie l\'un des deux !',xt:'Utilise 📍 (puis touche la carte) ou 😀 en bas à gauche.',ok:()=>PINGS.some(p=>p.team===0&&p.name===player.name)||EMOTES.some(m=>m.e===player)},
  {t:'L\'objectif',x:'Ton coffre est ta vie : tant qu\'il est intact, tu réapparais. Détruis les coffres ennemis et élimine leurs équipages pour gagner. Appuie sur Entrée pour continuer.',xt:'Ton coffre est ta vie : tant qu\'il est intact, tu réapparais. Détruis les coffres ennemis et élimine leurs équipages pour gagner. Touche « Suite ».',tg:()=>[(TD[2].bx+.5)*T,(TD[2].by+.5)*T,'Coffre ennemi'],ack:true,ok:()=>TUT.c.ack},
  {t:'Bravo, capitaine !',x:'Tu connais les bases. Il reste des tonnes d\'objets, d\'événements, de mutateurs et de cartes à découvrir. Ici les bots sont inoffensifs : retourne au menu et lance une vraie partie !',xt:'Tu connais les bases. Retourne au menu et lance une vraie partie !',fin:true,ok:()=>false}
];
function startTutorial(){
  audioInit(); screenTransition(()=>{
    document.getElementById('start').classList.add('hidden');
    TUT.backup=JSON.stringify(game.opts); for(const st of TUT_STEPS) st.started=false;
    Object.assign(game.opts,{mode:'solo',map:'classic',evf:0,dn:0,wth:0,mut:{},pers:0,roster:0,res:1.75,start:0,core:1,stack:3});
    newGame(); game.tut=true; TUT.on=true; TUT.i=0; TUT.okT=0; TUT.t=0; TUT.c={dist:0,sels:0,placed:0,mined:0,hits:0,bronzeMax:0,jumped:false,bought:false,ack:false,lx:player.x,ly:player.y}; TUT.dummy=null;
    for(const e of ents) if(e!==player&&e.ai){ e.ai.mode='home'; }
    msg('📘 Tutoriel : suis les étapes en haut de l\'écran.','#fde68a');
  });
}
function tutRestoreOpts(){ if(TUT.backup){ try{ const o=JSON.parse(TUT.backup); for(const k in o) game.opts[k]=o[k]; }catch(e){} TUT.backup=null; } }
function tutEnd(){ TUT.on=false; game.tut=false; try{ localStorage.setItem(TUT_KEY,'1'); }catch(e){} }
function tutDummy(){
  const d=ents.find(e=>e.team===1); if(!d) return; TUT.dummy=d; d.name='🎯 Mannequin'; d.alive=true; d.hp=maxhp(d); d.inv=0; d.resp=0; d.elim=false;
  const td=TD[0]; let x=player.x+Math.cos(player.ang||-1.57)*3.2*T, y=player.y+Math.sin(player.ang||-1.57)*3.2*T; if(!floorSupport(x,y)||wl(Math.floor(x/T),Math.floor(y/T))){ x=(td.bx+3.5)*T; y=(td.by-4.5)*T; }
  d.x=x; d.y=y; d.z=0; d.vx=d.vy=0; ring(x,y,T*1.6,'#fde68a',.6); burst(x,y,'#fde68a',14,150,.6,3); d.ang=Math.atan2(player.y-y,player.x-x);
}
/* ---------- bots inoffensifs ---------- */
{ const _bt=botThink; botThink=function(b,dt){ if(game.tut){ b.ix=b.iy=0; b.held='sword'; if(b===TUT.dummy){ b.ang=Math.atan2(player.y-b.y,player.x-b.x); } return; } _bt(b,dt); }; }
{ const _ng=newGame; newGame=function(){ TUT.on=false; game.tut=false; _ng(); }; }
function tutLeave(){ tutRestoreOpts(); TUT.on=false; game.tut=false; }
/* ---------- observation du joueur ---------- */
{ const _j=jump; jump=function(e,p){ const z0=e.vz; _j(e,p); if(game.tut&&e===player&&e.vz>z0+50) TUT.c.jumped=true; };
  const _b=buy; buy=function(e,id){ const r=_b(e,id); if(game.tut&&e===player&&r) TUT.c.bought=true; return r; };
  const _p=doPlace; doPlace=function(e,tx,ty,type){ const r=_p(e,tx,ty,type); if(game.tut&&e===player) TUT.c.placed++; return r; };
  const _m=doMine; doMine=function(e,hit){ const r=_m(e,hit); if(game.tut&&e===player&&hit) TUT.c.mined+=.34; return r; };
  const _h=hurt; hurt=function(e,a,by,kx,ky){ if(game.tut&&e===TUT.dummy){ if(by===player&&a>0&&e.alive){ TUT.c.hits++; } a=Math.min(a,1.2); e.hp=Math.max(e.hp,5); } _h(e,a,by,kx,ky); };
  const _s=setSel; setSel=function(id){ if(game.tut&&id!==selId) TUT.c.sels++; _s(id); };
  const _u=updateEvents;
  updateEvents=function(dt){ _u(dt); if(!TUT.on||game.state!=='play') return; const c=TUT.c; c.dist+=Math.hypot(player.x-c.lx,player.y-c.ly); c.lx=player.x; c.ly=player.y; c.bronzeMax=Math.max(c.bronzeMax,player.res.bronze); TUT.t+=dt;
    const st=TUT_STEPS[TUT.i]; if(!st) return; if(!st.started){ st.started=true; if(st.enter) st.enter(); TUT.t=0; }
    if(TUT.okT>0){ TUT.okT-=dt; if(TUT.okT<=0&&TUT.i<TUT_STEPS.length-1){ TUT.i++; } return; }
    if(!st.fin&&st.ok()){ TUT.okT=1.1; floatTxt(player.x,player.y-62,'✔ Bien joué !','#86efac',20); sfx('buy'); if(typeof MUS!=='undefined') MUS.sting('respawn'); flashScreen('#86efac',.12); burst(player.x,player.y-20,'#86efac',16,160,.6,3); }
  };
}
function tutSkip(){ if(!TUT.on) return; const st=TUT_STEPS[TUT.i]; if(!st||st.fin) return; TUT.c.ack=true; TUT.okT=.01; if(TUT.i<TUT_STEPS.length-1){ /* avance au prochain tick */ } }
function tutQuit(){ tutRestoreOpts(); tutEnd(); showMenu(); }
addEventListener('keydown',ev=>{
  if(!TUT.on||game.state!=='play'||game.paused||(ev.target&&/^(INPUT|TEXTAREA)$/.test(ev.target.tagName))) return;
  const st=TUT_STEPS[TUT.i]; if(ev.key==='Enter'){ if(st&&st.fin){ tutQuit(); } else if(st&&st.ack){ TUT.c.ack=true; } else if(ev.shiftKey) tutSkip(); ev.stopImmediatePropagation(); }
},true);
/* ---------- affichage ---------- */
function wrapLines(txt,w,font){ ctx.font=font; const out=[]; let line=''; for(const wd of txt.split(' ')){ const t=line?line+' '+wd:wd; if(ctx.measureText(t).width>w&&line){ out.push(line); line=wd; } else line=t; } if(line) out.push(line); return out; }
function tutBtn(x,y,w,h,txt,fn,col){ HUDB.push({x,y,w,h,fn}); panel(x,y,w,h,10,col||'#fde68a'); ctx.font='bold 13px '+FONT; ctx.textAlign='center'; ctx.fillStyle='#fff'; ctx.fillText(txt,x+w/2,y+h/2+5); }
{ const _dh=drawHud;
  drawHud=function(){ _dh(); if(!TUT.on||game.state!=='play'||!ctx) return; const st=TUT_STEPS[TUT.i]; if(!st) return;
    ctx.save(); ctx.setTransform(DPR,0,0,DPR,0,0);
    const w=Math.min(VW-24,520), x=VW/2-w/2, small=VH<460, y=small?44:60, lines=wrapLines(tutTouch()?st.xt:st.x,w-28,(small?'13':'14')+'px '+FONT), lh=small?16:19, h=54+lines.length*lh+(st.ack||st.fin?34:6);
    const pop=Math.min(1,TUT.t*5+.2);
    ctx.globalAlpha=pop; panel(x,y,w,h,14,TUT.okT>0?'#86efac':'#fde68a');
    ctx.font='bold 12px '+FONT; ctx.textAlign='left'; ctx.fillStyle='#fde68a'; ctx.fillText('📘 TUTORIEL  '+(TUT.i+1)+' / '+TUT_STEPS.length,x+14,y+18);
    ctx.textAlign='right'; ctx.fillStyle='#9fb6d8'; ctx.fillText(tutTouch()?'':'Maj+Entrée : passer',x+w-14,y+18);
    ctx.textAlign='left'; ctx.font='bold 18px '+PFONT; ctx.fillStyle=TUT.okT>0?'#86efac':'#fff'; ctx.fillText((TUT.okT>0?'✔ ':'')+st.t,x+14,y+40);
    ctx.font=(small?'13':'14')+'px '+FONT; ctx.fillStyle='#e8f0ff'; lines.forEach((l,i)=>ctx.fillText(l,x+14,y+62+i*lh));
    ctx.fillStyle='rgba(255,255,255,.2)'; ctx.fillRect(x+14,y+h-8,w-28,3); ctx.fillStyle='#fde68a'; ctx.fillRect(x+14,y+h-8,(w-28)*(TUT.i/(TUT_STEPS.length-1)),3);
    ctx.globalAlpha=1;
    if(st.ack) tutBtn(x+w-120,y+h-40,106,28,'Suite ▶',()=>{ TUT.c.ack=true; },'#86efac');
    if(st.fin) tutBtn(x+w-190,y+h-40,176,28,'À l\'abordage (menu)',tutQuit,'#86efac');
    else tutBtn(x+w-30,y-10,24,24,'✖',tutQuit,'#fca5a5');
    // repère sur la cible
    const tg=st.tg&&TUT.okT<=0?st.tg():null;
    if(tg){ const s=w2s(tg[0],tg[1],30+Math.sin(game.t*5)*6), m=36; let sx=s[0],sy=s[1]; const inside=s[2]&&sx>m&&sx<VW-m&&sy>m+70&&sy<VH-80;
      ctx.fillStyle='#fde68a'; ctx.strokeStyle='#3a2000'; ctx.lineWidth=3; ctx.textAlign='center';
      if(inside){ ctx.beginPath(); ctx.moveTo(sx,sy+16); ctx.lineTo(sx-12,sy-4); ctx.lineTo(sx+12,sy-4); ctx.closePath(); ctx.stroke(); ctx.fill(); ctx.font='bold 13px '+FONT; ctx.lineWidth=4; ctx.strokeStyle='rgba(10,20,50,.9)'; ctx.strokeText(tg[2]||'',sx,sy-12); ctx.fillText(tg[2]||'',sx,sy-12); gCircle(tg[0],tg[1],T*(.7+.15*Math.sin(game.t*5)),'#fde68a',2.5,false,2); }
      else { const cx=VW/2, cy=VH/2; let dx=sx-cx, dy=sy-cy; if(!s[2]){ dx=-dx; dy=-dy; } const k=Math.min((VW/2-m)/Math.abs(dx||1),(VH/2-m-60)/Math.abs(dy||1)), px=cx+dx*k, py=cy+dy*k, a=Math.atan2(dy,dx); ctx.translate(px,py); ctx.rotate(a); ctx.beginPath(); ctx.moveTo(16,0); ctx.lineTo(-10,-11); ctx.lineTo(-10,11); ctx.closePath(); ctx.stroke(); ctx.fill(); ctx.rotate(-a); ctx.translate(-px,-py); } }
    // mise en évidence de la barre d'objets
    if(st.hl==='hotbar'&&TUT.okT<=0){ const l=hotList(player), hb=hotbarRect(l.length), bw=l.length*(hb.s+hb.g)-hb.g, k=.5+.5*Math.sin(game.t*6); ctx.strokeStyle=`rgba(253,230,138,${.45+.5*k})`; ctx.lineWidth=3; rr(hb.x-6,hb.y-6,bw+12,hb.s+12,14); ctx.stroke(); }
    ctx.restore(); };
}
/* ---------- bouton du menu ---------- */
function tutMenuUi(){ const b=document.getElementById('tutBtn'); if(!b) return; let done=false; try{ done=!!localStorage.getItem(TUT_KEY); }catch(e){} b.classList.toggle('pulse',!done); const n=document.getElementById('tutNote'); if(n) n.style.display=done?'none':'block'; }
(function(){ const b=document.getElementById('tutBtn'); if(b) b.onclick=startTutorial; tutMenuUi(); })();
