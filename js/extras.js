'use strict';
/* =====================  NOUVEAUX OBJETS · ROSTER ALÉATOIRE · ÉVÉNEMENTS  ===================== */

/* ---------- armes ---------- */
Object.assign(GUNS,{
  dueling:{n:'Pistolets de duel',mag:2,cd:.22,reload:1.2,sp:950,life:.7,dmg:6,kb:220,col:'#fde68a',pel:1,spread:.01,bloom:0,bmax:0,rec:140},
  musketeer:{n:'Fusil à répétition',mag:8,cd:.38,reload:2.2,sp:1050,life:.8,dmg:4,kb:260,col:'#fcd34d',pel:1,spread:.015,bloom:.006,bmax:.06,rec:100},
  harpoongun:{n:'Lance-harpon',mag:3,cd:.5,reload:2,sp:900,life:.6,dmg:4,kb:780,col:'#94a3b8',pel:1,spread:0,bloom:0,bmax:0,rec:160},
  crossbow3:{n:'Triple arbalète',mag:3,cd:.45,reload:1.8,sp:640,life:1.1,dmg:3.5,kb:180,col:'#f1f5f9',pel:3,spread:.13,bloom:0,bmax:0,kind:'arrow',rec:60},
  sling:{n:'Fronde',mag:15,cd:.22,reload:1.4,sp:620,life:.6,dmg:2,kb:130,col:'#d6b27a',pel:1,spread:.06,bloom:.01,bmax:.15,rec:20},
  blowpipe:{n:'Sarbacane givrante',mag:6,cd:.3,reload:1.6,sp:850,life:.7,dmg:1,kb:0,col:'#bae6fd',pel:1,spread:.02,bloom:0,bmax:0,kind:'ice',short:true,rec:10}
});
const NEW_ITEMS=[
  {id:'dueling',n:'Pistolets de duel',ico:'🎴',col:'#fde68a'},{id:'musketeer',n:'Fusil à répétition',ico:'🪖',col:'#fcd34d'},{id:'harpoongun',n:'Lance-harpon',ico:'🎣',col:'#94a3b8'},
  {id:'crossbow3',n:'Triple arbalète',ico:'📐',col:'#f1f5f9'},{id:'sling',n:'Fronde',ico:'🪨',col:'#d6b27a'},{id:'blowpipe',n:'Sarbacane givrante',ico:'🎋',col:'#bae6fd'},
  {id:'grog',n:'Tonneau de grog',ico:'🍺',col:'#f59e0b'},{id:'firecracker',n:'Pétards',ico:'🎉',col:'#f87171'},{id:'sharkbait',n:'Appât à requin',ico:'🦈',col:'#60a5fa'},
  {id:'smokebomb',n:'Fumigène',ico:'☁️',col:'#cbd5e1'},{id:'lasso',n:'Lasso',ico:'🪢',col:'#d6b27a'},{id:'meteor',n:'Pluie de météores',ico:'☄️',col:'#fb923c'},
  {id:'hurricane',n:'Ouragan',ico:'🌪️',col:'#93c5fd'},{id:'rod',n:'Paratonnerre',ico:'⛈️',col:'#fde047'},{id:'crabs',n:'Banc de crabes',ico:'🐚',col:'#f87171'},
  {id:'hull',n:'Coque blindée',ico:'🛠️',col:'#94a3b8'},{id:'rage',n:'Rhum de furie',ico:'😡',col:'#ef4444'},{id:'blessing',n:'Eau bénite',ico:'💧',col:'#7dd3fc'},
  {id:'stonewall',n:'Muraille de pierre',ico:'🏰',col:'#a7afb8'},{id:'bridge2',n:'Passerelle blindée',ico:'🌉',col:'#a7afb8'},{id:'battery',n:'Batterie de canons',ico:'🧰',col:'#94a3b8'},
  {id:'raid',n:'Raid du perroquet',ico:'🦅',col:'#4ade80'}
];
for(const it of NEW_ITEMS){ ITEMS.push(it); ITEMMAP[it.id]=it; }
const TIPS2={dueling:'Deux coups très puissants',musketeer:'Cadence correcte, 8 coups',harpoongun:'Projette l\'ennemi très loin',crossbow3:'Trois flèches en éventail',sling:'Rafale de cailloux, bon marché',blowpipe:'Gèle brièvement l\'ennemi touché',
  grog:'Soigne toi et tes alliés proches',firecracker:'Quatre pétards explosifs autour de la cible',sharkbait:'Lâche un requin sur la zone visée (en mer)',smokebomb:'Invisible 4 s et bond en arrière',lasso:'Tire l\'ennemi visé vers toi',
  meteor:'Dix météores sur la zone visée',hurricane:'Projette les ennemis proches en l\'air',rod:'Six éclairs frappent les ennemis proches',crabs:'Quatre crabes kamikazes',hull:'−60 % dégâts reçus pendant 8 s',rage:'+50 % dégâts et +20 % vitesse pendant 8 s',
  blessing:'Retire tous les maux et soigne un peu',stonewall:'Dresse 5 blocs de pierre devant toi',bridge2:'Pont de pierre de 8 cases',battery:'Pose deux canons de pont côte à côte',raid:'Le perroquet bombarde une ligne devant toi'};
SHOP.push(
  gunItem('dueling','Pistolets de duel','Deux coups, 6 dégâts chacun.',{silver:14}),
  gunItem('musketeer','Fusil à répétition','8 coups précis.',{silver:18}),
  gunItem('harpoongun','Lance-harpon','Recul énorme sur la cible : parfait au bord du vide.',{silver:16}),
  gunItem('crossbow3','Triple arbalète','Trois flèches en éventail.',{silver:20}),
  gunItem('sling','Fronde','Rafale de cailloux, pas chère.',{bronze:60}),
  gunItem('blowpipe','Sarbacane givrante','Gèle brièvement les ennemis touchés.',{silver:12}),
  gadItem('grog','Tonneau de grog','Soigne 10 PV à toi et à tes alliés proches.',{silver:10},1),
  gadItem('firecracker','Pétards','Quatre petites explosions autour de la cible.',{silver:8},2),
  gadItem('sharkbait','Appât à requin','Lâche un requin qui chasse tes ennemis pendant 16 s (en mer).',{gold:3},1),
  gadItem('smokebomb','Fumigène','Invisible 4 s et bond en arrière.',{silver:8},2),
  gadItem('lasso','Lasso','Tire l\'ennemi visé vers toi.',{silver:10},2),
  gadItem('meteor','Pluie de météores','Dix météores s\'abattent sur la zone visée.',{gold:4},1),
  gadItem('hurricane','Ouragan','Projette les ennemis proches en l\'air.',{gold:2},1),
  gadItem('rod','Paratonnerre','Six éclairs frappent les ennemis proches.',{silver:16},1),
  gadItem('crabs','Banc de crabes','Quatre crabes kamikazes.',{silver:14},1),
  gadItem('hull','Coque blindée','−60 % de dégâts reçus pendant 8 s.',{silver:14},1,'Défense'),
  gadItem('rage','Rhum de furie','+50 % de dégâts et +20 % de vitesse pendant 8 s.',{gold:2},1),
  gadItem('blessing','Eau bénite','Retire gel, filet, brûlure et malédiction, soigne 6 PV.',{silver:6},1),
  gadItem('stonewall','Muraille de pierre','Dresse 5 blocs de pierre devant toi.',{silver:12},1,'Défense'),
  gadItem('bridge2','Passerelle blindée','Pont de pierre de 8 cases.',{silver:16},1),
  gadItem('battery','Batterie de canons','Pose deux canons de pont côte à côte.',{silver:24},1,'Défense'),
  gadItem('raid','Raid du perroquet','Bombardement d\'une ligne devant toi.',{gold:3},1)
);
SHOP.forEach(s=>SHOPMAP[s.id]=s);

/* ---------- effets des gadgets (appelé par useGadget) ---------- */
let delayed=[];
function aimPoint(e,wx,wy,maxd){ const dx=wx-e.x,dy=wy-e.y,d=Math.hypot(dx,dy)||1,m=Math.min(d,maxd); return [e.x+dx/d*m,e.y+dy/d*m]; }
function nearestFoe(e,x,y,R){ let b=null,bd=R; for(const o of ents){ if(!o.alive||o.team===e.team) continue; const d=Math.hypot(o.x-x,o.y-y); if(d<bd){bd=d;b=o;} } return b; }
function useGadget2(e,id,wx,wy,ax,ay){
  switch(id){
    case 'grog':{ let n=0; for(const o of ents){ if(!o.alive||o.team!==e.team||Math.hypot(o.x-e.x,o.y-e.y)>4*T||o.hp>=maxhp(o)-.5) continue; o.hp=Math.min(maxhp(o),o.hp+10); floatTxt(o.x,o.y-34,'+10 ♥','#fbbf24',15); burst(o.x,o.y,'#fbbf24',8,110,.5,3); n++; } if(!n) return false; ring(e.x,e.y,T*4,'#f59e0b',.5,true); return true; }
    case 'firecracker':{ const [tx,ty]=aimPoint(e,wx,wy,8*T); for(let k=0;k<4;k++){ const x=tx+rnd(-1.6*T,1.6*T), y=ty+rnd(-1.6*T,1.6*T); bombs.push({x:e.x,y:e.y,tx:x,ty:y,fuse:.55+k*.2,team:e.team,owner:e,kind:'bomb',R:1*T,dm:3.5,bd:.5,h:14}); } return true; }
    case 'sharkbait':{ const [tx,ty]=aimPoint(e,wx,wy,9*T); if(fl(Math.floor(tx/T),Math.floor(ty/T))>0) { floatTxt(e.x,e.y-34,'Vise la mer !','#93c5fd',14); return false; } sharks.push({x:tx,y:ty,ang:rnd(0,6.28),team:e.team,owner:e,t:16,cd:.8,wp:null,bite:0,ph:0}); ring(tx,ty,T*1.5,'#60a5fa',.5,true); splash(tx,ty); return true; }
    case 'smokebomb': e.cloak=Math.max(e.cloak,4); e.vx-=ax*520; e.vy-=ay*520; smoke(e.x,e.y,14,12,1.4); burst(e.x,e.y,'#e5e7eb',16,160,.7,5); return true;
    case 'lasso':{ const o=nearestFoe(e,wx,wy,3.2*T); if(!o||Math.hypot(o.x-e.x,o.y-e.y)>9*T) return false; const d=Math.hypot(o.x-e.x,o.y-e.y)||1; o.vx+=(e.x-o.x)/d*900; o.vy+=(e.y-o.y)/d*900; o.root=.6; o.lastBy=e; o.lastByT=5; ring(o.x,o.y,T,'#d6b27a',.4,true); floatTxt(o.x,o.y-36,'LASSO !','#d6b27a',15); return true; }
    case 'meteor':{ const [tx,ty]=aimPoint(e,wx,wy,10*T); for(let k=0;k<10;k++){ const x=tx+rnd(-2.8*T,2.8*T), y=ty+rnd(-2.8*T,2.8*T); bombs.push({x,y,tx:x,ty:y,fuse:1+k*.25,team:e.team,owner:e,kind:'bomb',R:1.7*T,dm:8,bd:.8,shell:true,drop:true,h:0}); } return true; }
    case 'hurricane':{ ring(e.x,e.y,T*5,'#93c5fd',.6,true); ring(e.x,e.y,T*2.5,'#fff',.5); burst(e.x,e.y,'#dbeafe',30,260,.8,4); shake=Math.max(shake,8);
      for(const o of ents){ if(!o.alive||o.team===e.team) continue; const dx=o.x-e.x,dy=o.y-e.y,d=Math.hypot(dx,dy); if(d>5*T) continue; o.vz=520; o.vx+=dx/(d||1)*700; o.vy+=dy/(d||1)*700; o.lastBy=e; o.lastByT=5; floatTxt(o.x,o.y-36,'EMPORTÉ !','#bfdbfe',15); } return true; }
    case 'rod':{ for(let k=0;k<6;k++) delayed.push({t:.6+k*1.3,fn:()=>{ if(!e.alive) return; const o=nearestFoe(e,e.x,e.y,9*T); if(!o) return; bombs.push({x:o.x,y:o.y,tx:o.x,ty:o.y,fuse:.4,team:e.team,owner:e,kind:'bomb',R:1.6*T,dm:7,bd:.6,bolt:true,h:0}); ring(o.x,o.y,T*1.2,'#fde047',.4); }}); floatTxt(e.x,e.y-36,'PARATONNERRE','#fde047',15); ring(e.x,e.y,T*1.5,'#fde047',.5,true); return true; }
    case 'crabs':{ for(let k=0;k<4;k++){ const a=e.ang+(k-1.5)*.5; chickens.push({x:e.x+Math.cos(a)*14,y:e.y+Math.sin(a)*14,vx:Math.cos(a)*220,vy:Math.sin(a)*220,team:e.team,owner:e,t:7,ph:0,arm:.5}); } return true; }
    case 'hull': e.plate=8; floatTxt(e.x,e.y-36,'COQUE BLINDÉE','#94a3b8',15); ring(e.x,e.y,T*1.5,'#94a3b8',.5,true); burst(e.x,e.y,'#cbd5e1',14,150,.5,3); return true;
    case 'rage': e.rage=8; floatTxt(e.x,e.y-36,'FURIE !','#ef4444',16); ring(e.x,e.y,T*1.8,'#ef4444',.5,true); burst(e.x,e.y,'#fca5a5',16,180,.6,4); return true;
    case 'blessing':{ const had=(e.frozen>0)+(e.slow>0)+(e.root>0)+(e.burn>0)+(e.curse>0)+(e.bubble>0); if(!had&&e.hp>=maxhp(e)-.5) return false; e.frozen=e.slow=e.root=e.burn=e.curse=0; e.bubble=0; e.hp=Math.min(maxhp(e),e.hp+6); floatTxt(e.x,e.y-36,'BÉNI','#7dd3fc',15); ring(e.x,e.y,T*1.5,'#7dd3fc',.5,true); burst(e.x,e.y,'#e0f2fe',14,130,.6,3); return true; }
    case 'stonewall':{ const horiz=Math.abs(ax)>Math.abs(ay); const [px,py]=aimPoint(e,wx,wy,3.7*T), tx=Math.floor(px/T), ty=Math.floor(py/T); let n=0;
      for(let k=-2;k<=2;k++){ const x2=tx+(horiz?0:k),y2=ty+(horiz?k:0),i=inb(x2,y2)?idx(x2,y2):-1; if(i<0||floorT[i]===0||wallT[i]||spawnerAt(x2,y2)||protectedTile(x2,y2,e.team)||wallBlockedByEnt((x2+.5)*T,(y2+.5)*T)) continue; wallT[i]=STONE; hpW[i]=BHP[STONE]; ownW[i]=e.team; pop[i]=1; n++; chunks((x2+.5)*T,(y2+.5)*T,BCOL[4][0],4); }
      return n>0; }
    case 'bridge2':{ let n=0; const horiz=Math.abs(ax)>Math.abs(ay), sx=horiz?Math.sign(ax):0, sy=horiz?0:Math.sign(ay); let tx=Math.floor(e.x/T),ty=Math.floor(e.y/T);
      for(let k=0;k<8;k++){ tx+=sx;ty+=sy; if(!inb(tx,ty)||wl(tx,ty)>0) break; const i=idx(tx,ty); if(floorT[i]===0){ floorT[i]=4; hpF[i]=BHP[4]; ownF[i]=e.team; pop[i]=1+k*.08; n++; } }
      if(!n) return false; burst(e.x,e.y,'#a7afb8',10,140,.4,3); return true; }
    case 'battery':{ const [px,py]=aimPoint(e,wx,wy,3.7*T), tx=Math.floor(px/T), ty=Math.floor(py/T), horiz=Math.abs(ax)>Math.abs(ay); let n=0;
      for(const k of [-1,1]){ const x2=tx+(horiz?0:k),y2=ty+(horiz?k:0); if(fl(x2,y2)===0||wl(x2,y2)>0) continue; traps.push({kind:'turret',x:(x2+.5)*T,y:(y2+.5)*T,t:18,age:0,team:e.team,owner:e,cd:.6,ang:0}); ring((x2+.5)*T,(y2+.5)*T,T,'#94a3b8',.3); n++; }
      return n>0; }
    case 'raid':{ for(let k=0;k<7;k++){ const d=(2+k*1.3)*T, x=e.x+ax*d, y=e.y+ay*d; bombs.push({x,y,tx:x,ty:y,fuse:.6+k*.18,team:e.team,owner:e,kind:'bomb',R:1.4*T,dm:6,bd:.7,shell:true,drop:true,h:0}); } return true; }
  }
  return false;
}
/* usage des nouveaux gadgets par les bots */
function botGadgets2(b,foe,fd,nearCore,r,dt){
  if(b.cd.gad>0) return false; const am=b.am, has=id=>(am[id]||0)>0, fx=foe.x, fy=foe.y;
  if(has('grog')&&b.hp<maxhp(b)*.65&&r<dt*2) return useGadget(b,'grog',b.x,b.y);
  else if(has('firecracker')&&fd>2*T&&fd<7*T&&r<dt*.6) return useGadget(b,'firecracker',fx,fy);
  else if(has('sharkbait')&&fd>3*T&&fd<9*T&&fl(Math.floor(fx/T),Math.floor(fy/T))===0&&r<dt*.6) return useGadget(b,'sharkbait',fx,fy);
  else if(has('smokebomb')&&b.hp<maxhp(b)*.5&&fd<4*T&&r<dt*1.2) return useGadget(b,'smokebomb',b.x,b.y);
  else if(has('lasso')&&fd>4*T&&fd<9*T&&r<dt*.6) return useGadget(b,'lasso',fx,fy);
  else if(has('meteor')&&fd>4*T&&fd<10*T&&r<dt*.4) return useGadget(b,'meteor',fx,fy);
  else if(has('hurricane')&&fd<4*T&&r<dt*.5) return useGadget(b,'hurricane',b.x,b.y);
  else if(has('rod')&&fd<9*T&&r<dt*.4) return useGadget(b,'rod',b.x,b.y);
  else if(has('crabs')&&fd>3*T&&fd<9*T&&r<dt*.5) return useGadget(b,'crabs',fx,fy);
  else if(has('hull')&&b.plate<=0&&fd<5*T&&b.hp<maxhp(b)*.7&&r<dt) return useGadget(b,'hull',b.x,b.y);
  else if(has('rage')&&b.rage<=0&&fd<5*T&&r<dt*.8) return useGadget(b,'rage',b.x,b.y);
  else if(has('blessing')&&(b.frozen>0||b.curse>0||b.root>0)&&r<dt*3) return useGadget(b,'blessing',b.x,b.y);
  else if(has('stonewall')&&nearCore&&r<dt*.5) return useGadget(b,'stonewall',b.x+Math.cos(b.ang)*2.2*T,b.y+Math.sin(b.ang)*2.2*T);
  else if(has('battery')&&nearCore&&r<dt*.5) return useGadget(b,'battery',b.x+Math.cos(b.ang)*2.5*T,b.y+Math.sin(b.ang)*2.5*T);
  else if(has('raid')&&fd>3*T&&fd<10*T&&r<dt*.5) return useGadget(b,'raid',fx,fy);
}
Object.assign(TIPS2,{});BOT_RANGED.push(['dueling',2,9],['musketeer',2.5,9],['harpoongun',1.5,6],['crossbow3',1,6],['sling',1,7],['blowpipe',2,7]);
const NEW_IDS=NEW_ITEMS.map(i=>i.id);
BOT_OPTIONAL.push(...NEW_IDS);
for(const id of NEW_IDS){ const g=GUNS[id]; BOT_BUY.splice(BOT_BUY.length-2,0,[id,b=>b.ai.likes.has(id)&&(g?!b.own[id]:(b.am[id]||0)<1)]); }

/* ---------- roster aléatoire ---------- */
let ROSTER=null;
const POOL_CATS=['Armes','Gadgets','Défense'];
const POOL_EXTRA=['glove','hammer','baa','heal'];
const poolIds=()=>SHOP.filter(s=>(POOL_CATS.includes(s.cat)||POOL_EXTRA.includes(s.id))&&s.id!=='core'&&s.id!=='wall').map(s=>s.id);
const inRoster=id=>!ROSTER||!poolIds_set.has(id)||ROSTER.has(id);
let poolIds_set=new Set();
function makeRoster(){
  poolIds_set=new Set(poolIds()); const n=game.opts.roster|0;
  if(!n||n>=poolIds_set.size){ ROSTER=null; return; }
  const ids=[...poolIds_set], pick=[];
  const shuf=a=>{ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; };
  const bycat=c=>ids.filter(id=>SHOPMAP[id].cat===c);
  // garanties : au moins 3 armes à distance, 3 objets de défense, 3 gadgets offensifs
  const mn=Math.max(3,Math.round(n/7)); for(const c of ['Armes','Défense','Gadgets']) pick.push(...shuf(bycat(c)).slice(0,mn));
  for(const id of shuf(ids)){ if(pick.length>=n) break; if(!pick.includes(id)) pick.push(id); }
  ROSTER=new Set(pick.slice(0,Math.max(n,3*mn)));
}
const rosterCount=()=>ROSTER?ROSTER.size:poolIds_set.size;

/* ---------- événements ---------- */
const EVENTS={
  coins:{n:'Pluie de pièces',ico:'🪙',d:'Des pièces tombent du ciel sur les îles : ramasse-les !',dur:14},
  curse:{n:'Malédiction',ico:'☠️',d:'Deux pirates sont maudits : plus lents et plus fragiles.',dur:20},
  shark:{n:'Requin rôdeur',ico:'🦈',d:'Un requin patrouille et mord ceux qui longent le bord.',dur:45},
  storm:{n:'Tempête',ico:'⛈️',d:'Éclairs aléatoires et vent violent.',dur:22},
  volcano:{n:'Éruption',ico:'🌋',d:'Des rochers de lave s\'abattent sur les îles.',dur:14},
  fog:{n:'Brouillard',ico:'🌫️',d:'Le brouillard réduit la visibilité.',dur:25},
  kraken:{n:'Kraken',ico:'🐙',d:'Des tentacules surgissent près des pirates.',dur:16},
  rush:{n:'Ruée vers l\'or',ico:'💰',d:'L\'or et les diamants poussent 3× plus vite.',dur:30}
};
const EV_FREQ=[{n:'Désactivés',v:0},{n:'Rares',v:1.7},{n:'Normaux',v:1},{n:'Fréquents',v:.55}];
let EV={cur:null,next:60,last:'',rush:false,fog:0,dark:0,tick:0,wind:0}, sharks=[], drops=[];
function resetEvents(){ delayed=[]; sharks=[]; drops=[]; const f=EV_FREQ[game.opts.evf]||EV_FREQ[2]; EV={cur:null,next:(40+Math.random()*30)*(f.v||1),last:'',rush:false,fog:0,dark:0,tick:0,wind:0}; }
function islandTile(){ const il=ISLANDS[Math.floor(Math.random()*ISLANDS.length)]; for(let k=0;k<12;k++){ const x=il.x+Math.floor(rnd(-il.r,il.r+1)), y=il.y+Math.floor(rnd(-il.r,il.r+1)); if(fl(x,y)>0&&!wl(x,y)) return [x,y]; } return null; }
function entTile(){ const l=ents.filter(e=>e.alive); if(!l.length) return null; const o=l[Math.floor(Math.random()*l.length)]; return [o.x+rnd(-1.5*T,1.5*T),o.y+rnd(-1.5*T,1.5*T)]; }
function startEvent(id){
  const E=EVENTS[id]; EV.cur={id,t:E.dur,dur:E.dur,a:0,b:0}; EV.last=id;
  announce(`${E.ico} ${E.n.toUpperCase()}`,'#fde68a'); msg(`${E.ico} ${E.n} : ${E.d}`,'#fde68a'); flashScreen('#ffffff',.12);
  if(id==='curse'){ const l=ents.filter(e=>e.alive).sort(()=>Math.random()-.5).slice(0,2); for(const e of l){ e.curse=E.dur; floatTxt(e.x,e.y-40,'MAUDIT !','#c084fc',17); ring(e.x,e.y,T*2,'#a855f7',.6,true); if(e===player) msg('Tu es maudit ! Utilise une Eau bénite…','#e9d5ff'); } }
  if(id==='shark'){ const a=rnd(0,6.28); sharks.push({x:CX*T+Math.cos(a)*38*T,y:CY*T+Math.sin(a)*38*T,ang:a+3.14,team:-1,owner:null,t:E.dur,cd:.8,wp:null,bite:0,ph:0}); }
  if(id==='rush') EV.rush=true;
}
function endEvent(){ if(EV.cur&&EV.cur.id==='rush') EV.rush=false; EV.cur=null; const f=EV_FREQ[game.opts.evf]||EV_FREQ[2]; EV.next=(45+Math.random()*40)*(f.v||1); }
function strike(x,y,warn,dm){ ring(x,y,T*1.6,'#fde047',warn); bombs.push({x,y,tx:x,ty:y,fuse:warn,team:-1,owner:null,kind:'bomb',R:1.5*T,dm:dm||7,bd:.5,bolt:true,h:0}); }
function updateEvents(dt){
  // minuteurs des effets différés et statuts
  for(const d of delayed) d.t-=dt; for(const d of delayed) if(d.t<=0) d.fn(); delayed=delayed.filter(d=>d.t>0);
  for(const e of ents){ if(e.plate>0) e.plate-=dt; if(e.rage>0) e.rage-=dt; if(e.curse>0){ e.curse-=dt; if(Math.random()<dt*8) parts.push({x:e.x+rnd(-8,8),y:e.y,z:rnd(0,20),vz:rnd(20,60),vx:0,vy:0,life:.6,max:.6,col:'#a855f7',size:3}); } }
  updateSharks(dt); updateDrops(dt);
  // météo douce
  const tgDark=(EV.cur&&(EV.cur.id==='storm'))?1:(EV.cur&&EV.cur.id==='fog')?.4:0, tgFog=(EV.cur&&EV.cur.id==='fog')?1:(EV.cur&&EV.cur.id==='storm')?.5:0;
  EV.dark+=(tgDark-EV.dark)*Math.min(1,dt*1.5); EV.fog+=(tgFog-EV.fog)*Math.min(1,dt*1.5);
  if(game.state!=='play') return;
  const f=EV_FREQ[game.opts.evf]||EV_FREQ[2]; if(!f.v) { if(EV.cur) endEvent(); return; }
  if(!EV.cur){
    EV.next-=dt;
    if(EV.next<=0){ const on=Object.keys(EVENTS).filter(k=>game.opts.ev[k]); if(!on.length){ EV.next=30; return; } const pool=on.length>1?on.filter(k=>k!==EV.last):on; startEvent(pool[Math.floor(Math.random()*pool.length)]); }
    return;
  }
  const c=EV.cur; c.t-=dt; c.a-=dt; c.b-=dt;
  switch(c.id){
    case 'coins': if(c.a<=0){ c.a=.2; for(let k=0;k<2;k++){ const t=islandTile(); if(!t) continue; const r=Math.random(); drops.push({x:(t[0]+rnd(.15,.85))*T,y:(t[1]+rnd(.15,.85))*T,h:240,t:26,kind:r<.55?'bronze':r<.9?'silver':'gold',amt:r<.55?5:r<.9?2:1,ph:rnd(0,6)}); } } break;
    case 'storm':
      if(c.a<=0){ c.a=rnd(.9,1.6); const t=Math.random()<.7?entTile():(()=>{ const q=islandTile(); return q?[(q[0]+.5)*T,(q[1]+.5)*T]:null; })(); if(t) strike(t[0],t[1],.9,7); }
      for(const e of ents) if(e.alive&&!e.grace){ e.vx+=Math.cos(.6)*70*dt; e.vy+=Math.sin(.6)*70*dt; }
      if(Q&&Q.level>=1) for(let k=0;k<2;k++) parts.push({x:cam3.x+rnd(-18*T,18*T),y:cam3.y+rnd(-14*T,14*T),z:200,vz:-300,vx:40,vy:20,life:.45,max:.45,col:'#bcd4ee',size:2});
      break;
    case 'volcano':
      if(c.a<=0){ c.a=.32; const t=islandTile(); if(t){ const x=(t[0]+.5)*T+rnd(-10,10), y=(t[1]+.5)*T+rnd(-10,10); ring(x,y,T*1.4,'#f97316',1.1); bombs.push({x,y,tx:x,ty:y,fuse:1.1,team:-1,owner:null,kind:'bomb',R:1.5*T,dm:6,bd:.8,shell:true,drop:true,h:0}); } }
      if(Math.random()<dt*3) shake=Math.max(shake,3);
      break;
    case 'kraken':
      if(c.a<=0){ c.a=3.2; const t=entTile(); if(t&&fl(Math.floor(t[0]/T),Math.floor(t[1]/T))>0) traps.push({kind:'kraken',x:t[0],y:t[1],t:4.5,age:0,team:-1,owner:null,cd:.8,slam:0}); }
      break;
  }
  if(c.t<=0) endEvent();
}
/* ---------- requins ---------- */
function updateSharks(dt){
  for(const s of sharks){
    s.t-=dt; s.ph+=dt*6; s.cd-=dt; s.bite=Math.max(0,s.bite-dt);
    // cible : ennemi près du bord (ou n'importe lequel, mais on reste en mer)
    let tg=null,bd=16*T; for(const o of ents){ if(!o.alive||o.team===s.team) continue; const d=Math.hypot(o.x-s.x,o.y-s.y); if(d<bd){bd=d;tg=o;} }
    let gx,gy;
    if(tg){ gx=tg.x; gy=tg.y; s.wp=null; }
    else { if(!s.wp||Math.hypot(s.wp[0]-s.x,s.wp[1]-s.y)<2*T){ const a=rnd(0,6.28),r=rnd(18,34)*T; s.wp=[CX*T+Math.cos(a)*r,CY*T+Math.sin(a)*r]; } gx=s.wp[0]; gy=s.wp[1]; }
    const want=Math.atan2(gy-s.y,gx-s.x); let da=want-s.ang; while(da>Math.PI) da-=6.283; while(da<-Math.PI) da+=6.283; s.ang+=clamp(da,-3*dt,3*dt);
    const sp=(tg?150:105)*dt, nx=s.x+Math.cos(s.ang)*sp, ny=s.y+Math.sin(s.ang)*sp;
    if(fl(Math.floor(nx/T),Math.floor(ny/T))===0) { s.x=nx; s.y=ny; } else { s.ang+=2.2*dt*3; s.wp=null; }
    if(Math.random()<dt*14) parts.push({x:s.x,y:s.y,z:2,vz:rnd(5,25),vx:rnd(-10,10),vy:rnd(-10,10),life:.5,max:.5,col:'#ffffff',size:3});
    if(s.cd<=0){
      for(const o of ents){ if(!o.alive||o.team===s.team||o.z>26) continue; const d=Math.hypot(o.x-s.x,o.y-s.y); if(d<1.7*T){ s.cd=1.2; s.bite=.3; hurt(o,4,s.owner,(o.x-s.x)/d*380,(o.y-s.y)/d*380); o.vz=Math.max(o.vz,260); sfx('hit',s.x,s.y); splash(s.x,s.y); floatTxt(o.x,o.y-36,'CHOMP !','#93c5fd',16); break; } }
      if(s.cd<=0){ // ronge les ponts voisins
        for(let ty=Math.floor(s.y/T)-1;ty<=Math.floor(s.y/T)+1;ty++)for(let tx=Math.floor(s.x/T)-1;tx<=Math.floor(s.x/T)+1;tx++){ if(inb(tx,ty)&&floorT[idx(tx,ty)]>=2&&(!s.owner||ownF[idx(tx,ty)]!==s.team)){ damageTile(tx,ty,14,s.owner,1); s.cd=.9; s.bite=.25; } }
      }
    }
  }
  sharks=sharks.filter(s=>s.t>0);
}
/* ---------- butin au sol ---------- */
function updateDrops(dt){
  for(const d of drops){
    d.t-=dt; d.ph+=dt*4; d.h=Math.max(0,d.h-dt*520);
    if(d.h>0) continue;
    for(const o of ents){ if(!o.alive||o.z>30) continue; if(Math.hypot(o.x-d.x,o.y-d.y)<20){ d.t=-1; o.res[d.kind]+=d.amt; sfx('coin',d.x,d.y); burst(d.x,d.y,RESCOL[d.kind],6,100,.4,3); if(o===player) floatTxt(d.x,d.y-20,`+${d.amt} ${RESNAME[d.kind]}`,RESCOL[d.kind],14); break; } }
  }
  drops=drops.filter(d=>d.t>0);
}
