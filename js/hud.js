'use strict';
/* =====================  INTERFACE (canvas 2D par-dessus la 3D)  ===================== */
const FONT='"Fredoka","Lilita One",system-ui,sans-serif';
const PFONT='"Pirata One","Lilita One","Fredoka",serif';
let uic=null, ctx=null, DPR=1;
const miniCv=document.createElement('canvas'); miniCv.width=W; miniCv.height=H;
const miniCtx=miniCv.getContext('2d'); const miniImg=miniCtx.createImageData(W,H);
const ICON={};
const hud={res:{bronze:{v:0,f:0},silver:{v:0,f:0},gold:{v:0,f:0},diamond:{v:0,f:0}},pops:[],hpTrail:20,l:performance.now(),alertT:0};

function initUI(){ uic=document.getElementById('ui'); ctx=uic.getContext('2d'); resizeUI(); buildIcons(); }
function resizeUI(){ if(!uic) return; DPR=Math.min(2,window.devicePixelRatio||1); uic.width=VW*DPR; uic.height=VH*DPR; uic.style.width=VW+'px'; uic.style.height=VH+'px'; }

/* ---------- primitives ---------- */
function rr(x,y,w,h,r){ r=Math.min(r,w/2,h/2); ctx.beginPath(); ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath(); }
function panel(x,y,w,h,r,accent){
  rr(x,y,w,h,r||12); ctx.fillStyle='rgba(12,30,48,.74)'; ctx.fill();
  if(accent){ ctx.lineWidth=2; ctx.strokeStyle=accent; ctx.stroke(); }
}
function drawRes(c,k,x,y,s){
  c.save(); c.translate(x,y);
  if(k==='diamond'){
    const g=c.createLinearGradient(-s*.4,-s*.5,s*.4,s*.5); g.addColorStop(0,'#b6f6ff'); g.addColorStop(.5,'#22d3ee'); g.addColorStop(1,'#0e90b0');
    c.fillStyle=g; c.beginPath(); c.moveTo(-s*.3,-s*.5); c.lineTo(s*.3,-s*.5); c.lineTo(s*.5,-s*.12); c.lineTo(0,s*.55); c.lineTo(-s*.5,-s*.12); c.closePath(); c.fill();
    c.strokeStyle='rgba(255,255,255,.75)'; c.lineWidth=1.2; c.stroke();
    c.beginPath(); c.moveTo(-s*.5,-s*.12); c.lineTo(s*.5,-s*.12); c.moveTo(-s*.12,-s*.5); c.lineTo(-s*.2,-s*.12); c.lineTo(0,s*.55); c.moveTo(s*.12,-s*.5); c.lineTo(s*.2,-s*.12); c.lineTo(0,s*.55); c.stroke();
  } else {
    const P={bronze:['#f2b27a','#cd7f32','#8a5222'],silver:['#ffffff','#cbd5e1','#8493a8'],gold:['#fff4b0','#fbbf24','#c98a0c']}[k];
    c.fillStyle=P[2]; rr(-s*.5,-s*.12,s,s*.42,s*.1); c.fill();
    const g=c.createLinearGradient(0,-s*.12,0,s*.3); g.addColorStop(0,P[1]); g.addColorStop(1,P[2]); c.fillStyle=g; rr(-s*.5,-s*.12,s,s*.36,s*.1); c.fill();
    c.fillStyle=P[0]; c.beginPath(); c.moveTo(-s*.42,-s*.12); c.lineTo(-s*.28,-s*.4); c.lineTo(s*.28,-s*.4); c.lineTo(s*.42,-s*.12); c.closePath(); c.fill();
    c.fillStyle='rgba(255,255,255,.55)'; c.fillRect(-s*.22,-s*.33,s*.3,s*.05);
    c.strokeStyle='rgba(0,0,0,.3)'; c.lineWidth=1; c.stroke();
  }
  c.restore();
}
function buildIcons(){ for(const k of ['bronze','silver','gold','diamond']){ const c=document.createElement('canvas'); c.width=44; c.height=40; drawRes(c.getContext('2d'),k,22,21,32); ICON[k]=c.toDataURL(); } }

/* ---------- projections (monde -> écran) ---------- */
function gPath(pts,close){ ctx.beginPath(); pts.forEach((p,i)=>{ const s=w2s(p[0],p[1],p[2]||0); i?ctx.lineTo(s[0],s[1]):ctx.moveTo(s[0],s[1]); }); if(close) ctx.closePath(); }
function gCircle(x,y,r,col,w,dash,z){ const pts=[]; for(let k=0;k<=48;k++){ const a=k/48*6.2832; pts.push([x+Math.cos(a)*r,y+Math.sin(a)*r,z===undefined?3:z]); } gPath(pts); ctx.strokeStyle=col; ctx.lineWidth=w||1.5; if(dash){ctx.setLineDash([7,6]);ctx.lineDashOffset=-game.t*16;} ctx.stroke(); ctx.setLineDash([]); }
function gDisc(x,y,r,col,z){ const pts=[]; for(let k=0;k<=40;k++){ const a=k/40*6.2832; pts.push([x+Math.cos(a)*r,y+Math.sin(a)*r,z===undefined?3:z]); } gPath(pts,true); ctx.fillStyle=col; ctx.fill(); }
function gLine(x1,y1,z1,x2,y2,z2,col,w,dash){ gPath([[x1,y1,z1],[x2,y2,z2]]); ctx.strokeStyle=col; ctx.lineWidth=w||1.5; if(dash){ctx.setLineDash([7,6]);ctx.lineDashOffset=-game.t*30;} ctx.stroke(); ctx.setLineDash([]); }
function gSector(x,y,R,a0,a1,fill,stroke){ const pts=[[x,y,3]]; for(let k=0;k<=24;k++){ const a=a0+(a1-a0)*k/24; pts.push([x+Math.cos(a)*R,y+Math.sin(a)*R,3]); } gPath(pts,true); ctx.fillStyle=fill; ctx.fill(); if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1.5;ctx.stroke();} }
function gQuad(tx,ty,col,fillA,z){ const q=[[tx*T,ty*T],[tx*T+T,ty*T],[tx*T+T,ty*T+T],[tx*T,ty*T+T]].map(p=>[p[0],p[1],z||2]); gPath(q,true); if(fillA){ctx.fillStyle=col;ctx.globalAlpha=fillA;ctx.fill();ctx.globalAlpha=1;} ctx.strokeStyle=col; ctx.lineWidth=2.5; ctx.stroke(); }
function gBrackets(tx,ty,col,z){
  const o=Math.sin(game.t*8)*.04, c=[[tx*T-o*T,ty*T-o*T],[tx*T+T+o*T,ty*T-o*T],[tx*T+T+o*T,ty*T+T+o*T],[tx*T-o*T,ty*T+T+o*T]].map(p=>w2s(p[0],p[1],z||2));
  ctx.strokeStyle=col; ctx.lineWidth=3.5; ctx.lineCap='round'; ctx.beginPath();
  for(let i=0;i<4;i++){ const a=c[i],b=c[(i+1)%4],d=c[(i+3)%4]; ctx.moveTo(a[0]+(d[0]-a[0])*.3,a[1]+(d[1]-a[1])*.3); ctx.lineTo(a[0],a[1]); ctx.lineTo(a[0]+(b[0]-a[0])*.3,a[1]+(b[1]-a[1])*.3); }
  ctx.stroke(); ctx.lineCap='butt';
}
function gLabel(x,y,z,txt,col){ const s=w2s(x,y,z); ctx.font='bold 13px '+FONT; ctx.textAlign='center'; ctx.lineWidth=4; ctx.strokeStyle='rgba(10,20,50,.85)'; ctx.strokeText(txt,s[0],s[1]); ctx.fillStyle=col; ctx.fillText(txt,s[0],s[1]); }

/* ---------- aide ---------- */
function cdFrac(e,id){
  const g=GUNS[id];
  if(g){ const s=wst(e,id); if(s.r>0) return clamp(s.r/g.reload,0,1); return clamp(s.cd/Math.max(.12,g.cd),0,1); }
  let c=0,m=1;
  if(id==='sword'){c=e.cd.atk;m=.42;} else if(id==='glove'){c=e.cd.atk;m=.9;} else if(id==='hammer'){c=e.cd.atk;m=1.1;} else if(id==='baa'){c=e.cd.atk;m=1.2;}
  else if(id==='pick'){c=e.cd.mine;m=.28;} else if(id==='block'){c=e.cd.place;m=.14;} else if(id==='grap'){c=e.cd.gad;m=.9;} else {c=e.cd.gad;m=.5;}
  return clamp(c/m,0,1);
}
const TIPS={block:'Clic : poser (pont sur le vide, mur sur le sol) · C / clic droit : changer de bloc · en saut : bloc sous les pieds',pick:'Maintiens le clic pour casser blocs, ponts et le mouton ultime ennemi',
  sword:'Clic : coup d\'épée',glove:'Clic : coup de poing qui projette très loin',hammer:'Clic : onde de choc qui projette et casse les blocs',baa:'Clic : cri qui repousse les ennemis et dévie les tirs',
  bow:'Clic : tirer une flèche (recharge entre chaque tir)',gun:'Maintiens le clic : la dispersion augmente en rafale · R : recharger',smg:'Rafale très rapide : le spray s\'élargit vite · R : recharger',
  shotgun:'Clic : 8 plombs en éventail · R : recharger',sniper:'Clic : tir perçant, précis à l\'arrêt · R : recharger',rocket:'Clic : roquette explosive',woolgun:'Clic : pelotes qui emmêlent et ralentissent',
  boomerang:'Clic : touche à l\'aller et au retour',bubble:'Clic : enferme l\'ennemi dans une bulle',ice:'Clic : gèle la cible',flame:'Maintiens le clic : flammes · R : recharger',
  grap:'Clic : accroche un bloc ou un ennemi',jet:'Clic : vol 4 s',dash:'Clic : dash',trampo:'Clic : pose un trampoline',tp:'Clic : lance la perle',bridge:'Clic : 8 blocs de pont',
  bomb:'Clic : lance une bombe',repel:'Clic : onde de choc',mine:'Clic : pose une mine',banana:'Clic : pose une banane',chicken:'Clic : lance un mouton kamikaze',heal:'Clic : +12 PV',shield:'Clic : dôme de protection',
  turret:'Clic : pose une tourelle automatique',turret2:'Clic : pose une tourelle givrante',guard:'Clic : appelle deux moutons gardiens',repair:'Clic : répare ton mouton ultime',
  hammer2:'',springs:'Clic : super sauts 25 s',cloak:'Clic : invisible 7 s',haste:'Clic : vitesse +50 % 8 s',wallgad:'Clic : mur de 3 blocs',storm:'Clic : foudre sur la zone visée',cluster:'Clic : bombe à fragmentation',vortex:'Clic : trou noir qui aspire'};
Object.assign(TIPS,TIPS2);
Object.assign(TIPS,{pick:'Maintiens le clic pour casser blocs, ponts et le coffre ennemi',baa:'Clic : souffle de brume qui repousse les ennemis et dévie les tirs',
  glove:'Clic : coup de crochet qui projette très loin',hammer:'Clic : onde de choc qui projette et casse les blocs',bow:'Clic : tirer un carreau (recharge entre chaque tir)',
  gun:'Maintiens le clic : la dispersion augmente en rafale · R : recharger',smg:'Deux pistolets : rafale rapide, le spray s\'élargit vite · R : recharger',shotgun:'Clic : 8 plombs en éventail · R : recharger',
  sniper:'Clic : tir perçant, précis à l\'arrêt · R : recharger',rocket:'Clic : boulet de canon explosif',woolgun:'Clic : filet qui emmêle et ralentit',boomerang:'Clic : la hache revient vers toi et touche deux fois',
  bubble:'Clic : enferme l\'ennemi dans une bulle d\'écume',ice:'Clic : harpon qui gèle la cible',flame:'Maintiens le clic : jet de flammes · R : recharger',grap:'Clic : accroche un bloc ou un ennemi et t\'attire',
  jet:'Clic : le perroquet te porte 4 s',dash:'Clic : élan',trampo:'Clic : pose un hamac rebondissant',tp:'Clic : lance la boussole, tu t\'y téléportes',bridge:'Clic : 8 planches de passerelle',
  bomb:'Clic : lance un baril de poudre',repel:'Clic : vague qui repousse tout le monde',mine:'Clic : pose une mine marine',banana:'Clic : pose une peau de banane',chicken:'Clic : lance un crabe kamikaze',
  heal:'Clic : +12 PV',shield:'Clic : dôme de brume protectrice',turret:'Clic : pose un canon de pont automatique',turret2:'Clic : pose un canon givrant',guard:'Clic : appelle deux matelots gardiens',
  repair:'Clic : répare ton coffre au trésor',springs:'Clic : super sauts 25 s',cloak:'Clic : invisible 7 s',haste:'Clic : vitesse +50 % 8 s',wallgad:'Clic : palissade de 3 planches',
  storm:'Clic : l\'orage frappe la zone visée',cluster:'Clic : baril qui explose en 6 mini-barils',vortex:'Clic : maelström qui aspire',flag:'Clic : pavillon noir : soigne tes alliés, ralentit les ennemis',
  anchor:'Clic : jette une ancre qui assomme',buoy:'Passif : te repêche si tu tombes à la mer',kraken:'Clic : un tentacule frappe la zone',barrage:'Clic : 6 boulets sur la zone visée',net:'Clic : pose un filet piégé'});
function hotbarRect(n){ const s=Math.min(52,Math.max(24,(VW-30)/Math.max(1,n)-6)),g=6; return {s,g,x:(VW-n*(s+g)+g)/2,y:VH-s-14}; }
function hoverEnemy(){
  let best=null,bd=34;
  for(const o of ents){ if(!o.alive||o.team===player.team) continue; const s=w2s(o.x,o.y,o.z+14); const d=Math.hypot(s[0]-mouse.x,s[1]-mouse.y); if(d<bd){bd=d;best=o;} }
  return best;
}
function rayFirst(x,y,ang,maxd,team){
  const ux=Math.cos(ang),uy=Math.sin(ang);
  for(let s=10;s<=maxd;s+=5){
    const px=x+ux*s,py=y+uy*s;
    if(wl(Math.floor(px/T),Math.floor(py/T))>0) return {d:s,x:px,y:py,kind:'wall'};
    for(const o of ents) if(o.alive&&o.team!==team&&Math.hypot(o.x-px,o.y-py)<13) return {d:s,x:px,y:py,kind:'ent',ent:o};
  }
  return {d:maxd,x:x+ux*maxd,y:y+uy*maxd,kind:'none'};
}
const OK='#7cffb0', BAD='#ff6b6b';

/* ---------- visée en 3D ---------- */
function drawAim(){
  const e=player; if(!e.alive||game.state!=='play'||shopOpen||!aim.ok){ setGhost(null); return; }
  const wx=aim.x, wy=aim.y, id=selId, ang=e.ang, pulse=.5+.5*Math.sin(game.t*7), ez=14;
  const hov=hoverEnemy();
  if(hov){ gCircle(hov.x,hov.y,20,BAD,3,false,2); gLabel(hov.x,hov.y,hov.z+48,`${hov.name} · ${Math.ceil(hov.hp)} PV`,'#ffd3d3'); }
  let ghost=false;
  switch(id){
    case 'block':{
      gCircle(e.x,e.y,3.7*T,'rgba(255,255,255,.35)',1.5,true);
      const tg=placeTarget(e,wx,wy);
      if(tg){
        const [tx,ty]=tg, bridge=fl(tx,ty)===0, bc=blockColor(e.bsel,e.team);
        setGhost(tx,ty,bridge?'bridge':'wall',bc[0]); ghost=true; gBrackets(tx,ty,OK,bridge?0:WH);
        gLine(e.x,e.y,ez,(tx+.5)*T,(ty+.5)*T,bridge?4:WH,'rgba(255,255,255,.4)',1.5,true);
        gLabel((tx+.5)*T,(ty+.5)*T,(bridge?0:WH)+26,bridge?'PONT':'MUR',OK);
      } else {
        const tx=Math.floor(wx/T),ty=Math.floor(wy/T), far=Math.hypot((tx+.5)*T-e.x,(ty+.5)*T-e.y)>3.7*T;
        const why=totalBlocks(e)===0?'Plus de blocs !':far?'Trop loin':wl(tx,ty)>0?'Occupé':fl(tx,ty)===0?'Pas de support':'Impossible';
        ctx.globalAlpha=.5+.4*pulse; gQuad(tx,ty,BAD,.18,2); ctx.globalAlpha=1; gLabel((tx+.5)*T,(ty+.5)*T,28,why,BAD);
      }
      break;}
    case 'pick':{
      gCircle(e.x,e.y,3.1*T,'rgba(255,255,255,.3)',1.5,true);
      const h=findMine(e,ang,3.1*T,wx,wy);
      if(h){
        const [tx,ty,layer]=h,i=idx(tx,ty),hp=layer?hpF[i]:hpW[i],mx=layer?BHP[floorT[i]]:BHP[wallT[i]],z=layer?0:WH,nh=Math.ceil(hp/PICKS[e.pick].d), prot=protectedTile(tx,ty,e.team), col=prot?BAD:'#fde047';
        gBrackets(tx,ty,col,z); gLine(e.x,e.y,ez,(tx+.5)*T,(ty+.5)*T,z,'rgba(253,224,71,.4)',1.5,true);
        const s=w2s((tx+.5)*T,(ty+.5)*T,z+22), k=hp/mx;
        ctx.fillStyle='rgba(10,20,50,.85)'; rr(s[0]-22,s[1]-7,44,9,4); ctx.fill(); ctx.fillStyle=k>.5?'#86efac':k>.25?'#fbbf24':'#f87171'; rr(s[0]-20,s[1]-5,Math.max(4,40*k),5,2); ctx.fill();
        gLabel((tx+.5)*T,(ty+.5)*T,z+40,prot?'Protégé !':`${nh} coup${nh>1?'s':''}`,col);
      } else { const tx=Math.floor(wx/T),ty=Math.floor(wy/T); if(wl(tx,ty)>0){ gQuad(tx,ty,BAD,.12,WH); gLabel((tx+.5)*T,(ty+.5)*T,WH+22,wl(tx,ty)===CORE&&ownW[idx(tx,ty)]===e.team?'Ton coffre !':'Trop loin',BAD); } }
      break;}
    case 'sword':case 'glove':case 'baa':{
      const R=id==='sword'?1.9*T:id==='glove'?2.3*T:5*T, half=id==='sword'?1.2:id==='glove'?1.37:.64; let hit=false;
      for(const o of ents) if(o.alive&&o.team!==e.team){ const dx=o.x-e.x,dy=o.y-e.y,d=Math.hypot(dx,dy); if(d<R&&d>0&&(dx*Math.cos(ang)+dy*Math.sin(ang))/d>Math.cos(half)){ hit=true; gCircle(o.x,o.y,20,BAD,3,false,2); } }
      gSector(e.x,e.y,R,ang-half,ang+half,hit?'rgba(255,90,90,.2)':'rgba(255,255,255,.12)',hit?BAD:'rgba(255,255,255,.5)');
      break;}
    case 'hammer':{
      const cx=e.x+Math.cos(ang)*T*1.2,cy=e.y+Math.sin(ang)*T*1.2,R=T*2.2; let hit=false;
      for(const o of ents) if(o.alive&&o.team!==e.team&&Math.hypot(o.x-cx,o.y-cy)<R){hit=true;gCircle(o.x,o.y,20,BAD,3,false,2);}
      gDisc(cx,cy,R,hit?'rgba(255,90,90,.2)':'rgba(255,255,255,.12)'); gCircle(cx,cy,R,hit?BAD:'rgba(255,255,255,.55)',2,true);
      break;}
    default:
      if(GUNS[id]){
        const g=GUNS[id], s=wst(e,id), range=g.sp*(g.kind==='boomerang'?.55:g.life);
        const moving=(Math.abs(e.ix)+Math.abs(e.iy))>.1&&g.moveSpread, spr=g.spread+s.b+(moving?g.moveSpread:0), mx=e.x+Math.cos(ang)*14,my=e.y+Math.sin(ang)*14;
        const col=s.r>0?'#ffd27d':'#ffffff';
        if(g.pel>1||spr>.06||g.kind==='flame'){ gSector(mx,my,Math.min(range,id==='flame'?3.2*T:range),ang-spr,ang+spr,s.r>0?'rgba(255,200,90,.12)':'rgba(255,255,255,.14)','rgba(255,255,255,.55)'); }
        const r=rayFirst(e.x,e.y,ang,range,e.team), c2=r.kind==='ent'?BAD:col;
        if(id==='sniper'&&s.r<=0){ gLine(mx,my,ez,r.x,r.y,ez,'rgba(255,70,70,.7)',1.5); } else gLine(mx,my,ez,r.x,r.y,ez,c2,1.5,true);
        if(r.kind!=='none') gCircle(r.x,r.y,r.kind==='ent'?20:7+pulse*3,c2,2.5,false,2);
        if(id==='rocket') { gDisc(r.x,r.y,2.2*T,'rgba(251,146,60,.15)'); gCircle(r.x,r.y,2.2*T,'rgba(251,146,60,.9)',2,true); }
        if(s.r>0) gLabel(e.x,e.y,e.z+54,'RECHARGE…',BAD);
      }
      break;
    case 'bomb':case 'repel':case 'storm':case 'vortex':case 'cluster':{
      const maxR=id==='storm'?10:9, dx=wx-e.x,dy=wy-e.y,d=Math.hypot(dx,dy)||1,m=Math.min(d,maxR*T),tx=e.x+dx/d*m,ty=e.y+dy/d*m;
      const R=id==='bomb'?2.7*T:id==='repel'?5.5*T:id==='storm'?1.7*T:id==='vortex'?5*T:2.2*T, col=id==='bomb'||id==='cluster'?'#fb923c':id==='storm'?'#fde047':'#a78bfa';
      if(id==='bomb'||id==='repel'||id==='cluster'){ const pts=[]; for(let k=0;k<=1;k+=.08){ pts.push([e.x+(tx-e.x)*k,e.y+(ty-e.y)*k,14+Math.sin(k*Math.PI)*34]); } for(const p of pts){ const s=w2s(p[0],p[1],p[2]); ctx.fillStyle='rgba(255,255,255,.8)'; ctx.beginPath(); ctx.arc(s[0],s[1],2.4,0,6.3); ctx.fill(); } }
      else gLine(e.x,e.y,ez,tx,ty,2,col,1.5,true);
      ctx.globalAlpha=.2; gDisc(tx,ty,R,col,2); ctx.globalAlpha=1; gCircle(tx,ty,R,col,2.5,true,2);
      if(d>maxR*T) gLabel(tx,ty,30,'portée max',col);
      break;}
    case 'grap':{
      const r=rayFirst(e.x,e.y,ang,11*T,-1), good=r.kind==='wall'||(r.kind==='ent'&&r.ent.team!==e.team);
      gCircle(e.x,e.y,11*T,'rgba(255,255,255,.2)',1,true);
      gLine(e.x,e.y,ez,r.x,r.y,ez,good?OK:BAD,2.5,true); gCircle(r.x,r.y,9+pulse*3,good?OK:BAD,3,false,ez);
      gLabel(r.x,r.y,ez+26,good?'ACCROCHE':'rien à accrocher',good?OK:BAD);
      break;}
    case 'tp':{
      const dx=wx-e.x,dy=wy-e.y,d=Math.hypot(dx,dy)||1,m=Math.min(d,10*T),tx=e.x+dx/d*m,ty=e.y+dy/d*m, wall=hitWall(tx,ty,0), vd=fl(Math.floor(tx/T),Math.floor(ty/T))===0, col=wall?BAD:vd?'#fbbf24':'#c084fc';
      gLine(e.x,e.y,ez,tx,ty,ez,col,1.8,true); gCircle(tx,ty,12+pulse*3,col,3,false,2); gLabel(tx,ty,30,wall?'Bloqué':vd?'ATTENTION : vide !':'Arrivée',col);
      break;}
    case 'dash':{
      for(let k=1;k<=4;k++){ const px=e.x+Math.cos(ang)*k*T,py=e.y+Math.sin(ang)*k*T, s=w2s(px,py,8), s2=w2s(px+Math.cos(ang)*10,py+Math.sin(ang)*10,8); ctx.globalAlpha=.9-k*.17; ctx.strokeStyle='#e0f2fe'; ctx.lineWidth=3.5; const dxs=s2[0]-s[0],dys=s2[1]-s[1],n=Math.hypot(dxs,dys)||1,nx=-dys/n*8,ny=dxs/n*8; ctx.beginPath(); ctx.moveTo(s[0]-dxs/n*6+nx,s[1]-dys/n*6+ny); ctx.lineTo(s[0]+dxs/n*6,s[1]+dys/n*6); ctx.lineTo(s[0]-dxs/n*6-nx,s[1]-dys/n*6-ny); ctx.stroke(); }
      ctx.globalAlpha=1; break;}
    case 'bridge':{
      const horiz=Math.abs(Math.cos(ang))>Math.abs(Math.sin(ang)), sx=horiz?Math.sign(Math.cos(ang)):0, sy=horiz?0:Math.sign(Math.sin(ang));
      let tx=Math.floor(e.x/T),ty=Math.floor(e.y/T);
      for(let k=0;k<8;k++){ tx+=sx;ty+=sy; if(!inb(tx,ty)||wl(tx,ty)>0) break; if(fl(tx,ty)===0) gQuad(tx,ty,'#fde047',.28,0); }
      break;}
    case 'trampo':case 'banana':case 'turret':case 'turret2':{
      const tx=Math.floor(wx/T),ty=Math.floor(wy/T), ok=fl(tx,ty)>0&&wl(tx,ty)===0&&Math.hypot((tx+.5)*T-e.x,(ty+.5)*T-e.y)<=3.7*T;
      gCircle(e.x,e.y,3.7*T,'rgba(255,255,255,.3)',1.5,true); gQuad(tx,ty,ok?OK:BAD,.22,2); gBrackets(tx,ty,ok?OK:BAD,2);
      gLabel((tx+.5)*T,(ty+.5)*T,34,ok?(id==='trampo'?'TREMPLIN':id==='banana'?'PIÈGE':'TOURELLE'):'Impossible',ok?OK:BAD);
      break;}
    case 'wallgad':{
      const tx=Math.floor(wx/T),ty=Math.floor(wy/T),far=Math.hypot((tx+.5)*T-e.x,(ty+.5)*T-e.y)>3.7*T, horiz=Math.abs(Math.cos(ang))>Math.abs(Math.sin(ang));
      gCircle(e.x,e.y,3.7*T,'rgba(255,255,255,.3)',1.5,true);
      for(let k=-1;k<=1;k++){ const x2=tx+(horiz?0:k),y2=ty+(horiz?k:0); const ok=!far&&fl(x2,y2)>0&&wl(x2,y2)===0; gQuad(x2,y2,ok?OK:BAD,.25,WH*.5); }
      break;}
    case 'mine':gCircle(e.x,e.y,1.1*T,'rgba(255,255,255,.7)',2,true);break;
    case 'shield':gDisc(e.x,e.y,3.8*T,'rgba(96,165,250,.14)'); gCircle(e.x,e.y,3.8*T,TEAMS[e.team].col,2.5,true); break;
    case 'guard':case 'chicken':gLine(e.x,e.y,ez,e.x+Math.cos(ang)*4*T,e.y+Math.sin(ang)*4*T,ez,'rgba(255,255,255,.5)',1.5,true);break;
  }
  if(!ghost) setGhost(null);
}
function drawCrosshair(){
  const e=player, x=mouse.x, y=mouse.y;
  ctx.save(); ctx.translate(x,y);
  if(game.state!=='play'||!e.alive||shopOpen){ ctx.fillStyle='#fff'; ctx.strokeStyle='rgba(0,0,0,.6)'; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(0,0,4,0,6.3); ctx.stroke(); ctx.fill(); ctx.restore(); return; }
  const hov=hoverEnemy(), id=selId, g=GUNS[id], s=g?wst(e,id):null;
  const col=hov?'#ff5a5a':'#ffffff', cd=cdFrac(e,id);
  let gap=8;
  if(g){ const moving=(Math.abs(e.ix)+Math.abs(e.iy))>.1&&g.moveSpread; gap=6+(g.spread+s.b+(moving?g.moveSpread:0))*150; }
  else if(id==='bomb'||id==='repel') gap=14;
  gap+=(e.muzzle>0?5:0)+Math.sin(game.t*6)*.4;
  const rot=hov?game.t*1.5:0; ctx.rotate(rot);
  for(const [lw,c] of [[5,'rgba(0,0,0,.5)'],[2.5,col]]){ ctx.strokeStyle=c; ctx.lineWidth=lw; ctx.lineCap='round'; ctx.beginPath(); for(let k=0;k<4;k++){ const a=k*Math.PI/2; ctx.moveTo(Math.cos(a)*gap,Math.sin(a)*gap); ctx.lineTo(Math.cos(a)*(gap+8),Math.sin(a)*(gap+8)); } ctx.stroke(); }
  ctx.fillStyle=col; ctx.beginPath(); ctx.arc(0,0,1.8,0,6.3); ctx.fill(); ctx.rotate(-rot);
  if(cd>0){ ctx.strokeStyle=g&&s.r>0?'#ffd27d':'rgba(255,255,255,.85)'; ctx.lineWidth=3.5; ctx.beginPath(); ctx.arc(0,0,gap+15,-Math.PI/2,-Math.PI/2+(1-cd)*Math.PI*2); ctx.stroke(); }
  const c=cnt(e,id);
  if(c!==''&&id!=='pick'&&id!=='sword'){ ctx.font='bold 14px '+FONT; ctx.textAlign='left'; ctx.lineWidth=3; ctx.strokeStyle='rgba(10,20,50,.85)'; const t=g?`${c}/${g.mag}`:c; ctx.strokeText(t,gap+18,gap+20); ctx.fillStyle=(c===0)?BAD:'#fde68a'; ctx.fillText(t,gap+18,gap+20); }
  ctx.restore();
}

/* ---------- HUD ---------- */
function overlayWorld(){
  // barres de vie et noms au-dessus des personnages
  for(const e of ents){
    if(!e.alive) continue; const td=TEAMS[e.team], s=w2s(e.x,e.y,e.z+38); if(!s[2]) continue;
    const w=44, hpk=Math.max(0,e.hp/maxhp(e));
    ctx.fillStyle='rgba(10,20,50,.8)'; rr(s[0]-w/2-2,s[1]-2,w+4,9,4); ctx.fill();
    ctx.fillStyle=hpk>.35?'#6ee79a':'#ff7b7b'; rr(s[0]-w/2,s[1],Math.max(4,w*hpk),5,2); ctx.fill();
    if(e!==player){ ctx.font='bold 12px '+FONT; ctx.textAlign='center'; ctx.lineWidth=4; ctx.strokeStyle='rgba(10,20,50,.9)'; ctx.strokeText(e.name,s[0],s[1]-7); ctx.fillStyle=td.light; ctx.fillText(e.name,s[0],s[1]-7); }
    else { const bb=Math.sin(game.t*5)*2; ctx.fillStyle='#fff'; ctx.beginPath(); ctx.moveTo(s[0]-6,s[1]-16+bb); ctx.lineTo(s[0]+6,s[1]-16+bb); ctx.lineTo(s[0],s[1]-7+bb); ctx.closePath(); ctx.fill(); ctx.strokeStyle='rgba(10,20,50,.8)'; ctx.lineWidth=2; ctx.stroke(); }
  }
  // PV des moutons ultimes
  for(const td of TD){ const ci=idx(td.bx,td.by); if(!td.coreAlive||wallT[ci]!==CORE) continue; const k=hpW[ci]/BHP[CORE]; if(k>=1) continue; const s=w2s((td.bx+.5)*T,(td.by+.5)*T,110); ctx.fillStyle='rgba(10,20,50,.8)'; rr(s[0]-24,s[1]-2,48,9,4); ctx.fill(); ctx.fillStyle=k>.5?td.col:k>.25?'#f59e0b':'#ef4444'; rr(s[0]-22,s[1],Math.max(4,44*k),5,2); ctx.fill(); }
  // textes flottants
  for(const f of floats){ if(f.y0===undefined) f.y0=f.y; const s=w2s(f.x,f.y0,40); if(!s[2]) continue; ctx.globalAlpha=Math.min(1,f.t*2); ctx.font=`bold ${Math.round(f.s*1.15)}px ${FONT}`; ctx.textAlign='center'; ctx.lineWidth=4; ctx.strokeStyle='rgba(10,20,50,.9)'; const yy=s[1]-(f.y0-f.y)*1.3; ctx.strokeText(f.txt,s[0],yy); ctx.fillStyle=f.col; ctx.fillText(f.txt,s[0],yy); }
  ctx.globalAlpha=1;
}
let miniT=0;
function drawMini(){
  const S=150,mx=VW-S-10,my=10, d=miniImg.data;
  if(--miniT<=0){ miniT=8;
    for(let i=0;i<W*H;i++){
      let c; const f=floorT[i],w=wallT[i]; let r,g,b;
      if(w===CORE) c=TEAMS[ownW[i]].col; else if(w) c=(w===WOOL?TEAMS[ownW[i]].dark:BCOL[w][1]);
      else if(f===1){ const reg=region[i]; c=reg>=0&&reg<4?'#e9d9a8':reg===4?'#a97b47':'#d8c793'; if(reg>=0&&reg<4&&Math.abs(i%W-TD[reg].bx)<=2&&Math.abs(((i/W)|0)-TD[reg].by)<=2) c=TEAMS[reg].light; }
      else if(f>1) c=blockColor(f,ownF[i])[0]; else c=null;
      if(!c){ r=30;g=100;b=150; } else { const n=parseInt(c.slice(1),16); r=n>>16; g=(n>>8)&255; b=n&255; }
      d[i*4]=r;d[i*4+1]=g;d[i*4+2]=b;d[i*4+3]=255;
    }
    miniCtx.putImageData(miniImg,0,0);
  }
  panel(mx-5,my-5,S+10,S+10,12);
  ctx.save(); rr(mx,my,S,S,8); ctx.clip(); ctx.imageSmoothingEnabled=false; ctx.drawImage(miniCv,mx,my,S,S); ctx.restore(); ctx.imageSmoothingEnabled=true;
  const cx=cam3.x/T/W*S+mx, cy=cam3.y/T/H*S+my; ctx.strokeStyle='rgba(255,255,255,.6)'; ctx.lineWidth=1; ctx.strokeRect(cx-9,cy-7,18,14);
  for(const e of ents){ if(!e.alive) continue; ctx.fillStyle=TEAMS[e.team].col; ctx.strokeStyle='#fff'; const px=mx+e.x/T/W*S,py=my+e.y/T/H*S; ctx.beginPath();ctx.arc(px,py,e===player?3.5:2.5,0,6.3);ctx.fill();if(e===player)ctx.stroke(); }
}
function drawHud(){
  ctx.setTransform(DPR,0,0,DPR,0,0); ctx.clearRect(0,0,VW,VH); ctx.textAlign='left'; ctx.textBaseline='alphabetic';
  if(game.state==='menu') return;
  const e=player, now=performance.now(), dt=Math.min(.05,(now-hud.l)/1000); hud.l=now;
  overlayWorld(); drawAim();
  if(game.flash>0){ctx.globalAlpha=Math.min(.6,game.flash);ctx.fillStyle=game.flashCol;ctx.fillRect(0,0,VW,VH);ctx.globalAlpha=1;}
  const low=e.alive&&e.hp/maxhp(e)<.3?(.25+.15*Math.sin(game.t*8)):0, vig=Math.max(game.hurtFx*1.1,low);
  if(vig>0){const g=ctx.createRadialGradient(VW/2,VH/2,Math.min(VW,VH)*.35,VW/2,VH/2,Math.max(VW,VH)*.75);g.addColorStop(0,'rgba(220,38,38,0)');g.addColorStop(1,`rgba(220,38,38,${Math.min(.75,vig)})`);ctx.fillStyle=g;ctx.fillRect(0,0,VW,VH);}
  // ressources
  const RK=['bronze','silver','gold','diamond'], cw=104, cx0=VW/2-(cw*4+18)/2;
  RK.forEach((k,i)=>{
    const x=cx0+i*(cw+6), y=10, v=e.res[k], hv=hud.res[k];
    if(v>hv.v){hud.pops.push({x:x+cw/2,y:y+46,txt:'+'+(v-hv.v),col:RESCOL[k],t:1});hv.f=1;}
    else if(v<hv.v){hud.pops.push({x:x+cw/2,y:y+46,txt:'-'+(hv.v-v),col:'#fca5a5',t:1});hv.f=.7;}
    hv.v=v; hv.f=Math.max(0,hv.f-dt*3);
    ctx.save(); ctx.translate(x+cw/2,y+18); ctx.scale(1+hv.f*.14,1+hv.f*.14); ctx.translate(-cw/2,-18);
    panel(0,0,cw,36,18,hv.f>0?RESCOL[k]:null); drawRes(ctx,k,22,18,26);
    ctx.fillStyle='#fff'; ctx.font='bold 20px '+FONT; ctx.fillText(v,42,26);
    ctx.restore();
  });
  for(const p of hud.pops){p.t-=dt;p.y-=26*dt;ctx.globalAlpha=Math.max(0,Math.min(1,p.t*1.6));ctx.font='bold 16px '+FONT;ctx.textAlign='center';ctx.lineWidth=4;ctx.strokeStyle='rgba(10,20,50,.9)';ctx.strokeText(p.txt,p.x,p.y);ctx.fillStyle=p.col;ctx.fillText(p.txt,p.x,p.y);}
  ctx.globalAlpha=1; hud.pops=hud.pops.filter(p=>p.t>0); ctx.textAlign='left';
  // équipes
  TD.forEach((t,i)=>{
    const y=10+i*38, ci=idx(t.bx,t.by), chp=wallT[ci]===CORE?hpW[ci]:0;
    if(t.hpPrev===undefined) t.hpPrev=chp;
    if(chp<t.hpPrev-.1){ t.alert=1.4; if(i===player.team&&hud.alertT<=0){ announce('TON COFFRE EST ATTAQUÉ !','#fca5a5'); sfx('alarm'); hud.alertT=7; } }
    t.hpPrev=chp; t.alert=Math.max(0,(t.alert||0)-dt);
    panel(10,y,214,33,12,t.alert>0&&Math.floor(game.t*8)%2?'#ef4444':null);
    ctx.fillStyle=t.col; rr(10,y,8,33,4); ctx.fill();
    ctx.fillStyle='#fff'; ctx.font='bold 14px '+FONT; ctx.fillText(t.name+(i===player.team?' (toi)':''),26,y+15);
    ctx.fillStyle='rgba(10,20,50,.7)'; rr(26,y+21,104,7,3); ctx.fill();
    if(t.coreAlive){ const k=chp/BHP[CORE]; ctx.fillStyle=k>.5?t.col:k>.25?'#f59e0b':'#ef4444'; rr(26,y+21,Math.max(4,104*k),7,3); ctx.fill(); }
    ctx.font='bold 12px '+FONT; ctx.fillStyle=t.coreAlive?'#9af2b8':'#fca5a5'; ctx.fillText(t.coreAlive?'💰 intact':'✖ pillé',138,y+15);
    const mem=t.members; ctx.font='13px '+FONT;
    if(mem.every(m=>m.elim)){ctx.fillStyle='#fca5a5';ctx.fillText('☠ éliminé',138,y+28);}
    else if(!mem.some(m=>m.alive)){ctx.fillStyle='#fde68a';ctx.fillText('↻ '+Math.ceil(Math.min(...mem.filter(m=>!m.elim).map(m=>m.resp)))+'s',138,y+28);}
    else {ctx.fillStyle='#9af2b8';ctx.fillText(mem.filter(m=>m.alive).map(m=>'♥'+Math.ceil(m.hp)).join(' '),138,y+28);}
  });
  hud.alertT=Math.max(0,hud.alertT-dt);
  ctx.font='bold 12px '+FONT; ctx.textAlign='right'; ctx.fillStyle='rgba(255,236,190,.95)'; ctx.lineWidth=3; ctx.strokeStyle='rgba(10,30,50,.8)'; { const dt_='Difficulté : '+getD().n; ctx.strokeText(dt_,VW-14,190); ctx.fillText(dt_,VW-14,190); } ctx.textAlign='left';
  ctx.font='14px '+FONT; let fy=10+4*38+24;
  for(const f of feed){ctx.globalAlpha=Math.min(1,f.t);const w=ctx.measureText(f.txt).width;panel(10,fy-15,w+24,23,9);ctx.fillStyle=f.col;ctx.fillRect(10,fy-12,3,17);ctx.fillText(f.txt,20,fy+2);fy+=27;}
  ctx.globalAlpha=1;
  // barre de vie
  const list=hotList(e), n=list.length, hb=hotbarRect(n), bw=Math.max(300,n*(hb.s+hb.g)-hb.g), bx=(VW-bw)/2, hpk=Math.max(0,e.hp)/maxhp(e);
  if(hud.hpTrail>e.hp) hud.hpTrail=Math.max(e.hp,hud.hpTrail-14*dt); else hud.hpTrail=e.hp;
  const hy=hb.y-36; panel(bx-3,hy,bw+6,24,10);
  ctx.save(); rr(bx+3,hy+5,bw-6,14,6); ctx.clip();
  ctx.fillStyle='rgba(255,255,255,.75)'; ctx.fillRect(bx+3,hy+5,(bw-6)*Math.max(0,hud.hpTrail)/maxhp(e),14);
  ctx.fillStyle=hpk>.35?'#3ccf7a':'#e8504a'; ctx.fillRect(bx+3,hy+5,(bw-6)*hpk,14); ctx.restore();
  ctx.fillStyle='#fff'; ctx.font='bold 12px '+FONT; ctx.textAlign='center'; ctx.lineWidth=3; ctx.strokeStyle='rgba(10,30,20,.7)'; const ht=`♥ ${Math.ceil(Math.max(0,e.hp))} / ${maxhp(e)}`; ctx.strokeText(ht,bx+bw/2,hy+17); ctx.fillText(ht,bx+bw/2,hy+17);
  if(e.jetT>0){ctx.fillStyle='#fb923c';rr(bx,hy-8,bw*e.jetT/4,5,2);ctx.fill();}
  ctx.textAlign='left'; ctx.font='bold 12px '+FONT; ctx.fillStyle='rgba(255,255,255,.8)'; ctx.fillText(C(e).ico+' '+C(e).n,bx+bw+10,hy+17);
  { let sx=bx; ctx.textAlign='left'; ctx.font='bold 13px '+FONT;
    for(const [v,ico,col] of [[e.haste,'🧪','#38bdf8'],[e.cloak,'👻','#e5e7eb'],[e.springT,'👟','#4ade80'],[e.bubble,'🧼','#bfdbfe'],[e.frozen,'❄️','#7dd3fc'],[e.slow,'🕸️','#cbd5e1'],[e.root,'⚓','#e5e7eb'],[e.burn,'🔥','#fb923c']]) if(v>0){ const t=`${ico} ${v.toFixed(1)}s`, w=ctx.measureText(t).width+16; panel(sx,hy-32,w,22,9,col); ctx.fillStyle='#fff'; ctx.fillText(t,sx+8,hy-16); sx+=w+6; } }
  // barre d'objets
  const hx0=(VW-(n*(hb.s+hb.g)-hb.g))/2;
  list.forEach((s,i)=>{
    const isel=s.id===selId, k=isel?selAnim:0, sc=1+(isel?.07:0)+k*.12;
    const x=hx0+i*(hb.s+hb.g),y=hb.y-(isel?5:0)-k*6;
    ctx.save(); ctx.translate(x+hb.s/2,y+hb.s/2); ctx.scale(sc,sc); ctx.translate(-hb.s/2,-hb.s/2);
    
    rr(0,0,hb.s,hb.s,10); ctx.fillStyle=isel?'#e0a93a':'rgba(12,30,48,.8)'; ctx.fill(); ctx.shadowBlur=0;
    if(isel){ ctx.strokeStyle='#fff'; ctx.lineWidth=2; ctx.stroke(); }
    ctx.save(); rr(0,0,hb.s,hb.s,10); ctx.clip();
    ctx.fillStyle=s.col; ctx.globalAlpha=.9; ctx.fillRect(0,hb.s-4,hb.s,4); ctx.globalAlpha=1;
    const cdv=cdFrac(e,s.id); const reloading=GUNS[s.id]&&wst(e,s.id).r>0;
    if(cdv>0){ ctx.fillStyle=reloading?'rgba(255,170,60,.5)':'rgba(0,0,0,.55)'; ctx.beginPath(); ctx.moveTo(hb.s/2,hb.s/2); ctx.arc(hb.s/2,hb.s/2,hb.s,-Math.PI/2,-Math.PI/2+cdv*Math.PI*2); ctx.closePath(); ctx.fill(); }
    ctx.restore();
    const c=cnt(e,s.id);
    ctx.textAlign='center';
    if(s.id==='block'){ const bc=blockColor(e.bsel,e.team), sz=Math.round(hb.s*.46), layers=c>40?3:c>16?2:1; for(let L=layers-1;L>=0;L--){ const bx2=hb.s/2-sz/2, by2=hb.s/2-sz/2-L*3+2; ctx.fillStyle=bc[1]; rr(bx2,by2+3,sz,sz,4); ctx.fill(); ctx.fillStyle=bc[0]; rr(bx2,by2,sz,sz-1,4); ctx.fill(); ctx.strokeStyle='rgba(0,0,0,.35)'; ctx.lineWidth=1; ctx.stroke(); } }
    else { ctx.font=`${Math.round(hb.s*.44)}px ${FONT}`; ctx.fillStyle='#fff'; ctx.fillText(s.ico,hb.s/2,hb.s/2+6); }
    ctx.font='bold 10px '+FONT; ctx.textAlign='left'; ctx.fillStyle='#d6e4ff'; ctx.fillText(i<9?i+1:0,5,12);
    if(c!==''){ ctx.textAlign='right'; ctx.font='bold 11px '+FONT; ctx.lineWidth=3; ctx.strokeStyle='rgba(10,20,50,.85)'; ctx.strokeText(c,hb.s-4,hb.s-7); ctx.fillStyle=c===0?'#fca5a5':'#fde68a'; ctx.fillText(c,hb.s-4,hb.s-7); }
    ctx.restore();
  });
  if(e.pack&&e.pack.length){ const nx=hx0+n*(hb.s+hb.g)+4, ny=hb.y+hb.s/2-14; panel(nx,ny,76,28,10); ctx.textAlign='left'; ctx.font='13px '+FONT; ctx.fillStyle='#fde68a'; ctx.fillText('Tab ⇄',nx+7,ny+18); ctx.font='bold 11px '+FONT; ctx.fillStyle='#fff'; ctx.fillText('+'+e.pack.length,nx+50,ny+18); }
  const it=ITEMMAP[selId]; let label=it.n; if(selId==='block') label=`${BNAME[e.bsel]} ×${e.blocks[e.bsel]}`;
  if(selId==='pick') label=PICKS[e.pick].n; if(selId==='sword') label=SWORDS[e.sword].n;
  ctx.textAlign='center'; const tip=TIPS[selId]||''; ctx.font='12px '+FONT; const tw=Math.max(ctx.measureText(tip).width,130)+30; panel(VW/2-tw/2,hb.y-88,tw,42,12);
  ctx.fillStyle='#fff'; ctx.font='bold 15px '+FONT; ctx.fillText(label,VW/2,hb.y-70); ctx.fillStyle='#a9c2f0'; ctx.font='12px '+FONT; ctx.fillText(tip,VW/2,hb.y-54);
  if(nearBase(e)&&!shopOpen&&e.alive){ const w=300,pp=1+.03*Math.sin(game.t*5); ctx.save(); ctx.translate(VW/2,hb.y-114); ctx.scale(pp,pp); panel(-w/2,-15,w,30,15,'#fde68a'); ctx.fillStyle='#fde68a'; ctx.font='bold 15px '+FONT; ctx.fillText('[E]  Ouvrir la boutique',0,5); ctx.restore(); }
  ctx.textAlign='left'; ctx.fillStyle='rgba(20,40,90,.8)'; ctx.font='13px '+FONT; ctx.lineWidth=3; ctx.strokeStyle='rgba(255,255,255,.7)'; const hint='Espace saut · R recharger · Tab réserve · E boutique'; ctx.globalAlpha=.7; ctx.strokeText(hint,12,VH-12); ctx.fillText(hint,12,VH-12); ctx.globalAlpha=1;
  if(EV.cur){ const E=EVENTS[EV.cur.id], w=210; panel(VW/2-w/2,52,w,30,12,'rgba(253,230,138,.6)'); ctx.textAlign='left'; ctx.font='bold 14px '+FONT; ctx.fillStyle='#fde68a'; ctx.fillText(E.ico+' '+E.n,VW/2-w/2+12,72); ctx.textAlign='right'; ctx.fillStyle='#fff'; ctx.fillText(Math.ceil(EV.cur.t)+' s',VW/2+w/2-12,72); ctx.fillStyle='rgba(253,230,138,.8)'; ctx.fillRect(VW/2-w/2+10,79,(w-20)*Math.max(0,EV.cur.t/EV.cur.dur),2); ctx.textAlign='center'; }
  drawMini();
  if(banner.t>0){
    const p=1-banner.t/banner.max, s=p<.12?1.6-p/.12*.6:1, a=Math.min(1,banner.t*1.5,p*8);
    ctx.save(); ctx.translate(VW/2,VH*.2); ctx.scale(s,s); ctx.globalAlpha=a; ctx.textAlign='center';
    ctx.font='bold 46px '+PFONT; const bwid=ctx.measureText(banner.txt).width+70;
    
    ctx.lineWidth=7; ctx.strokeStyle='rgba(10,20,60,.9)'; ctx.strokeText(banner.txt,0,0); ctx.fillStyle=banner.col; ctx.fillText(banner.txt,0,0); ctx.restore();
  }
  ctx.textAlign='center';
  if(!e.alive&&game.state==='play'){
    ctx.fillStyle='rgba(10,20,60,.6)';ctx.fillRect(0,VH/2-50,VW,100);ctx.fillStyle='#fff';ctx.font='bold 30px '+FONT;
    if(TD[0].coreAlive){ ctx.fillText(`Tu es tombé ! Réapparition dans ${Math.ceil(e.resp)} s`,VW/2,VH/2+10); ctx.fillStyle='rgba(255,255,255,.25)'; ctx.fillRect(VW/2-120,VH/2+24,240,6); ctx.fillStyle='#7cc0ff'; ctx.fillRect(VW/2-120,VH/2+24,240*(1-e.resp/3),6); }
    else ctx.fillText('Éliminé…',VW/2,VH/2+10);
  }
  if(game.state==='over'){
    ctx.fillStyle='rgba(10,20,60,.75)';ctx.fillRect(0,0,VW,VH);
    ctx.fillStyle=game.win?'#fde68a':'#ff8a8a';ctx.font='bold 72px '+PFONT;ctx.fillText(game.win?'VICTOIRE !':'DÉFAITE',VW/2,VH/2-10);
    ctx.fillStyle='#fff';ctx.font='20px '+FONT;
    ctx.fillText(game.win?'Tous les équipages ennemis sont coulés.':'Ton équipe est éliminée.',VW/2,VH/2+26);
    ctx.fillText(`Éliminations : ${player.kills} · Durée : ${Math.floor(game.t/60)} min ${Math.floor(game.t%60)} s`,VW/2,VH/2+56);
    ctx.fillText('Clic ou Entrée : retour au menu',VW/2,VH/2+90);
  }
  if(game.hitmark>0&&game.state==='play'){ const k=game.hitmark/.18; ctx.strokeStyle=`rgba(255,255,255,${k})`; ctx.lineWidth=3; const m=11+(1-k)*8; ctx.beginPath(); ctx.moveTo(mouse.x-m,mouse.y-m);ctx.lineTo(mouse.x-4,mouse.y-4);ctx.moveTo(mouse.x+m,mouse.y-m);ctx.lineTo(mouse.x+4,mouse.y-4);ctx.moveTo(mouse.x-m,mouse.y+m);ctx.lineTo(mouse.x-4,mouse.y+4);ctx.moveTo(mouse.x+m,mouse.y+m);ctx.lineTo(mouse.x+4,mouse.y+4);ctx.stroke(); }
  drawCrosshair();
}
