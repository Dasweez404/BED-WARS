'use strict';
/* =====================  CONSTANTES  ===================== */
const T=32, W=100, H=100, CX=50, CY=50, WH=28; // hauteur des murs (px) ; 1 case = 32 px = 1 unité 3D
const WOOL=2, WOOD=3, STONE=4, OBS=5, CORE=6;
const BNAME={2:'Bois',3:'Grès',4:'Grès taillé',5:'Obsidienne',7:'Grès rouge',8:'Glace'};
const BORDER=[2,8,3,7,4,5]; // du plus fragile au plus solide
const BHP={2:4,3:10,4:24,5:60,6:30,7:16,8:7};
const BCOL={2:['#d2a064','#9a6a38'],3:['#e8d6a0','#c2a86b'],4:['#d6b47c','#a98650'],5:['#4a2d73','#2a1745'],7:['#dc8e62','#b0603a'],8:['#c9f0ff','#7ec8e8']};
const RESCOL={bronze:'#cd7f32',silver:'#d6dde6',gold:'#fbbf24',diamond:'#22d3ee'};
const RESNAME={bronze:'Bronze',silver:'Argent',gold:'Or',diamond:'Diamant'};
const TEAMS=[
  {name:'Bleus',col:'#3b82f6',dark:'#1d4ed8',light:'#93c5fd',bx:50,by:76,dir:[0,-1],g:['#8fb4e6','#84a9dc'],cl:'#4f6f9f'},
  {name:'Rouges',col:'#ef4444',dark:'#b91c1c',light:'#fca5a5',bx:24,by:50,dir:[1,0],g:['#e69a9a','#dc8f8f'],cl:'#9f4f4f'},
  {name:'Verts',col:'#22c55e',dark:'#15803d',light:'#86efac',bx:50,by:24,dir:[0,1],g:['#9fd9a3','#94cf99'],cl:'#4f8f55'},
  {name:'Jaunes',col:'#eab308',dark:'#a16207',light:'#fde047',bx:76,by:50,dir:[-1,0],g:['#ecd98a','#e2cf80'],cl:'#9a8a3f'}
];
const REGCOL={4:{g:['#d9c58c','#cfba80'],cl:'#8a7a48'},5:{g:['#8de0e6','#7fd6dd'],cl:'#3f8f96'}};
const SWORDS=[{n:'Coutelas rouillé',d:3,c:'#b98a52'},{n:'Sabre d\'abordage',d:4.2,c:'#a7afb8'},{n:'Cimeterre',d:5.4,c:'#e5e7eb'},{n:'Sabre du capitaine',d:6.8,c:'#67e8f9'}];
const PICKS=[{n:'Pioche rouillée',d:2},{n:'Pioche de forban',d:4},{n:'Pioche en fer noir',d:7},{n:'Pioche du capitaine',d:12}];
const SWORD_COST=[null,{bronze:40},{silver:10},{gold:3}];
const PICK_COST=[null,{bronze:30},{silver:12},{gold:4}];
const FB_INT=[1.3,.95,.7,.52], FS_INT=[6.5,5,3.8,2.9], GOLD_INT=[Infinity,32,20];
// catalogue de la barre d'objets : seuls les objets possédés apparaissent
const ITEMS=[
  {id:'block',n:'Blocs',ico:'🧱',col:'#fff'},{id:'pick',n:'Pioche',ico:'⛏️',col:'#fde047'},{id:'sword',n:'Sabre',ico:'🗡️',col:'#e5e7eb'},
  {id:'glove',n:'Crochet de fer',ico:'🦾',col:'#9ca3af'},{id:'hammer',n:'Masse de forgeron',ico:'🔨',col:'#9ca3af'},{id:'baa',n:'Corne de brume',ico:'📯',col:'#fde68a'},
  {id:'bow',n:'Arbalète',ico:'🏹',col:'#d6b27a'},{id:'gun',n:'Pistolet à silex',ico:'🔫',col:'#fde047'},{id:'smg',n:'Pistolets jumeaux',ico:'⚡',col:'#fde047'},{id:'shotgun',n:'Tromblon',ico:'💥',col:'#fb923c'},
  {id:'sniper',n:'Mousquet long',ico:'🎯',col:'#a5f3fc'},{id:'rocket',n:'Canon de poche',ico:'🧨',col:'#f87171'},{id:'woolgun',n:'Lance-filet',ico:'🕸️',col:'#d6dde6'},
  {id:'boomerang',n:'Hache de lancer',ico:'🪓',col:'#fbbf24'},{id:'bubble',n:'Lance-écume',ico:'🧼',col:'#bfdbfe'},{id:'ice',n:'Harpon givré',ico:'❄️',col:'#7dd3fc'},{id:'flame',n:'Torche cracheuse',ico:'🔥',col:'#fb923c'},
  {id:'grap',n:'Grappin d\'abordage',ico:'🪝',col:'#fde68a'},{id:'jet',n:'Perroquet porteur',ico:'🦜',col:'#4ade80'},{id:'dash',n:'Élan du flibustier',ico:'💨',col:'#e0f2fe'},
  {id:'trampo',n:'Trampoline (hamac)',ico:'🛏️',col:'#f472b6'},{id:'tp',n:'Boussole ensorcelée',ico:'🧭',col:'#c084fc'},{id:'bridge',n:'Planche d\'abordage',ico:'🪵',col:'#b98a52'},
  {id:'springs',n:'Bottes de mousse',ico:'👢',col:'#4ade80'},{id:'cloak',n:'Brume magique',ico:'🌫️',col:'#e5e7eb'},{id:'haste',n:'Rhum de contrebande',ico:'🍾',col:'#38bdf8'},
  {id:'storm',n:'Orage',ico:'🌩️',col:'#fde047'},{id:'barrage',n:'Salve de canons',ico:'🎇',col:'#f87171'},{id:'cluster',n:'Baril à grappes',ico:'🎆',col:'#16a34a'},{id:'bomb',n:'Baril de poudre',ico:'🛢️',col:'#92400e'},{id:'repel',n:'Vague scélérate',ico:'🌊',col:'#38bdf8'},
  {id:'vortex',n:'Maelström',ico:'🌀',col:'#7c3aed'},{id:'kraken',n:'Tentacule du kraken',ico:'🐙',col:'#34d399'},{id:'anchor',n:'Ancre',ico:'⚓',col:'#9ca3af'},{id:'chicken',n:'Crabe kamikaze',ico:'🦀',col:'#ef4444'},{id:'heal',n:'Ration de bord',ico:'🍖',col:'#ef4444'},
  {id:'turret',n:'Canon de pont',ico:'🗼',col:'#94a3b8'},{id:'turret2',n:'Canon givrant',ico:'🧊',col:'#7dd3fc'},{id:'wallgad',n:'Palissade',ico:'🚧',col:'#b98a52'},
  {id:'mine',n:'Mine marine',ico:'🧿',col:'#9ca3af'},{id:'banana',n:'Peau de banane',ico:'🍌',col:'#fde047'},{id:'net',n:'Filet piégé',ico:'🥅',col:'#d6dde6'},{id:'guard',n:'Matelots mercenaires',ico:'🧟',col:'#a3e635'},
  {id:'repair',n:'Réparation du coffre',ico:'🔧',col:'#86efac'},{id:'flag',n:'Pavillon noir',ico:'🏴',col:'#111827'},{id:'buoy',n:'Bouée de sauvetage',ico:'🛟',col:'#fb923c'},{id:'shield',n:'Bouclier de brume',ico:'🛡️',col:'#60a5fa'},
  {id:'trident',n:'Trident de Poséidon',ico:'🔱',col:'#38bdf8'},{id:'gatling',n:'Poivrière rotative',ico:'🌶️',col:'#f87171'},{id:'javelin',n:'Javelot de chasse',ico:'🗡',col:'#e5e7eb'},{id:'flarebow',n:'Arc incendiaire',ico:'🏹',col:'#fb923c'},
  {id:'swap',n:'Singe farceur',ico:'🐒',col:'#f472b6'},{id:'frostnova',n:'Souffle du spectre',ico:'👻',col:'#7dd3fc'},{id:'decoy',n:'Matelot mercenaire',ico:'🧟',col:'#a3e635'},
  {id:'siren',n:'Chant des sirènes',ico:'🧜',col:'#c084fc'},{id:'quake',n:'Séisme',ico:'🌋',col:'#f97316'},{id:'aegis',n:'Médaillon doré',ico:'🏅',col:'#fde047'},{id:'coco',n:'Noix de coco explosive',ico:'🥥',col:'#a16207'}
];
const ITEMMAP={}; ITEMS.forEach(i=>ITEMMAP[i.id]=i);
const PERM={}; // objets permanents (utilisables à volonté, avec recharge)
const GUNS={
  // mag = chargeur, cd = cadence (s entre deux tirs), reload = rechargement (s), spread = dispersion de base, bloom = dispersion ajoutée à chaque tir, bmax = dispersion max
  bow:{n:'Arbalète',mag:1,cd:.1,reload:.85,sp:620,life:1.4,dmg:6.5,kb:217,col:'#f1f5f9',pel:1,spread:0,bloom:0,bmax:0,kind:'arrow',rec:0},
  gun:{n:'Pistolet à silex',mag:12,cd:.27,reload:1.1,sp:820,life:.7,dmg:4.2,kb:140,col:'#fde047',pel:1,spread:.02,bloom:.014,bmax:.1,rec:48},
  smg:{n:'Pistolets jumeaux',mag:30,cd:.1,reload:1.7,sp:800,life:.6,dmg:2.1,kb:60,col:'#fde047',pel:1,spread:.045,bloom:.02,bmax:.24,rec:14},
  shotgun:{n:'Tromblon',mag:6,cd:1.15,reload:2.3,sp:720,life:.36,dmg:3,kb:230,col:'#fb923c',pel:8,spread:.27,bloom:0,bmax:0,rec:300},
  sniper:{n:'Mousquet long',mag:4,cd:1.75,reload:2.5,sp:1700,life:.9,dmg:17,kb:520,col:'#a5f3fc',pel:1,spread:0,bloom:0,bmax:0,pierce:true,rec:240,moveSpread:.1},
  rocket:{n:'Canon de poche',mag:1,cd:.1,reload:2.2,sp:430,life:2.2,dmg:0,kb:0,col:'#f87171',pel:1,spread:0,bloom:0,bmax:0,kind:'rocket',rec:300},
  woolgun:{n:'Lance-filet',mag:8,cd:.34,reload:1.8,sp:560,life:.9,dmg:2.5,kb:150,col:'#f9a8d4',pel:1,spread:.06,bloom:.02,bmax:.16,kind:'wool',rec:30},
  boomerang:{n:'Hache de lancer',mag:1,cd:.1,reload:1.1,sp:560,life:1.3,dmg:7,kb:200,col:'#fbbf24',pel:1,spread:0,bloom:0,bmax:0,kind:'boomerang',pierce:true,rec:0},
  bubble:{n:'Lance-écume',mag:3,cd:.45,reload:2.4,sp:360,life:1.2,dmg:0,kb:0,col:'#bfdbfe',pel:1,spread:0,bloom:0,bmax:0,kind:'bubble',rec:24},
  ice:{n:'Harpon givré',mag:5,cd:.4,reload:2,sp:600,life:.9,dmg:2,kb:0,col:'#7dd3fc',pel:1,spread:.02,bloom:0,bmax:0,kind:'ice',rec:32},
  trident:{n:'Trident de Poséidon',mag:6,cd:.5,reload:1.8,sp:760,life:.55,dmg:2.2,kb:150,col:'#38bdf8',pel:3,spread:.11,bloom:0,bmax:0,pierce:true,rec:110},
  gatling:{n:'Poivrière rotative',mag:90,cd:.068,reload:3.2,sp:820,life:.55,dmg:1.4,kb:30,col:'#fca5a5',pel:1,spread:.05,bloom:.012,bmax:.32,rec:10},
  javelin:{n:'Javelot de chasse',mag:2,cd:.3,reload:1.5,sp:1150,life:.7,dmg:6.2,kb:380,col:'#f1f5f9',pel:1,spread:0,bloom:0,bmax:0,pierce:true,rec:140},
  flarebow:{n:'Arc incendiaire',mag:3,cd:.35,reload:1.9,sp:640,life:1,dmg:3.2,kb:60,col:'#fb923c',pel:1,spread:.02,bloom:0,bmax:0,kind:'flame',rec:24},
  flame:{n:'Torche cracheuse',mag:70,cd:.07,reload:2.6,sp:390,life:.32,dmg:1.1,kb:25,col:'#fb923c',pel:1,spread:.17,bloom:0,bmax:0,kind:'flame',rec:4}
};
const isGun=id=>!!GUNS[id];
const DIFFS={
  easy:{n:'Facile',react:.9,noise:.38,dmg:.55,speed:.8,hp:14,engage:4.5,meleeCd:.95,gunCd:2,likeP:.4,use:.5,aggr:.7,buyT:1.4,leave:[60,90],income:1,strafe:false,dodge:0,desc:'Bots lents et imprécis, peu d\'objets.'},
  normal:{n:'Normal',react:.6,noise:.28,dmg:.75,speed:.88,hp:17,engage:5.5,meleeCd:.75,gunCd:1.5,likeP:.7,use:1,aggr:1,buyT:.9,leave:[40,65],income:1,strafe:false,dodge:0,desc:'Bots équilibrés qui utilisent une bonne partie des objets.'},
  hard:{n:'Difficile',react:.2,noise:.1,dmg:1.1,speed:1.02,hp:24,engage:8,meleeCd:.5,gunCd:1,likeP:1,use:2.2,aggr:1.7,buyT:.4,leave:[18,30],income:.75,strafe:true,dodge:.5,desc:'Bots rapides et précis qui achètent et utilisent toutes les armes et tous les gadgets.'}
};
const getD=()=>DIFFS[game.diff||'normal'];
const ER=5;
const SPR2D=()=>!(game.opts&&game.opts.style==='3d'); // rayon du corps d'un personnage (px)
const hash=(x,y)=>(((x*73856093)^(y*19349663))>>>0);
function shade(hex,k){
  const n=parseInt(hex.slice(1),16); let r=n>>16,g=(n>>8)&255,b=n&255;
  r=Math.max(0,Math.min(255,r+k));g=Math.max(0,Math.min(255,g+k));b=Math.max(0,Math.min(255,b+k)); return `rgb(${r},${g},${b})`;
}
function blockColor(t,team){return BCOL[t]||BCOL[2];}

/* =====================  ÉTAT  ===================== */
let floorT,wallT,hpF,hpW,ownF,ownW,region,pop;
let TD=[],ents=[],spawners=[],projs=[],bombs=[],shields=[],hooks=[],parts=[],rings=[],floats=[],feed=[],traps=[],chickens=[],pearls=[],beams=[],guards=[];
const MAPS={
  classic:{n:'Archipel',d:'La carte originale : 4 îles en croix, galion au centre.',bases:[[50,76,[0,-1]],[24,50,[1,0]],[50,24,[0,1]],[76,50,[-1,0]]],dia:[[30,30],[70,30],[30,70],[70,70]],relay:[]},
  close:{n:'Récif serré',d:'Îles rapprochées : les combats éclatent tout de suite.',bases:[[50,70,[0,-1]],[30,50,[1,0]],[50,30,[0,1]],[70,50,[-1,0]]],dia:[[36,36],[64,36],[36,64],[64,64]],relay:[]},
  wide:{n:'Grand large',d:'Îles très éloignées avec de petits îlots relais. Ponts longs !',bases:[[50,84,[0,-1]],[16,50,[1,0]],[50,16,[0,1]],[84,50,[-1,0]]],dia:[[26,26],[74,26],[26,74],[74,74]],relay:[[50,66],[34,50],[50,34],[66,50]]},
  corners:{n:'Les quatre coins',d:'Bases dans les angles, diamants au milieu des côtés.',bases:[[28,72,[1,0]],[28,28,[0,1]],[72,28,[-1,0]],[72,72,[0,-1]]],dia:[[50,14],[14,50],[86,50],[50,86]],relay:[]}
};
const CBASE={hp:0,spd:1,melee:1,gun:1,rel:1,def:1,kb:1,jump:1,mine:1,free:0,gcd:1,loot:1};
const CLASSES={
  matelot:{n:'Matelot',ico:'⚓',d:'Polyvalent : aucun point fort, aucune faiblesse.',pros:[],cons:[]},
  corsaire:{n:'Corsaire',ico:'🗡️',d:'Maître du sabre, un peu lourd à manœuvrer.',melee:1.2,spd:.92,hp:2,start:{sword:1},pros:['+20 % dégâts de mêlée','Sabre d\'abordage au départ','+2 PV'],cons:['−8 % vitesse']},
  canonnier:{n:'Canonnier',ico:'💣',d:'Spécialiste des armes à feu, fragile.',gun:1.25,rel:.8,hp:-4,start:{own:['gun']},pros:['+25 % dégâts à distance','Rechargement −20 %','Pistolet au départ'],cons:['−4 PV']},
  eclaireur:{n:'Éclaireur',ico:'🧭',d:'Rapide et agile, mais peu résistant.',spd:1.15,jump:1.2,hp:-4,melee:.8,start:{am:{}},pros:['+15 % vitesse','Sauts +20 %'],cons:['−4 PV','−20 % dégâts de mêlée']},
  charpentier:{n:'Charpentier',ico:'🔨',d:'Bâtisseur économe, peu combatif à distance.',free:.3,mine:1.5,gun:.85,start:{blocks:16},pros:['30 % de blocs gratuits','Minage +50 %','+16 blocs au départ'],cons:['−15 % dégâts à distance']},
  brute:{n:'Brute',ico:'🛢️',d:'Une montagne de muscles, lente et peu inventive.',hp:10,def:.9,kb:.6,spd:.92,gcd:1.4,pros:['+10 PV','−10 % dégâts reçus','Repoussé 40 % de moins'],cons:['−8 % vitesse','Gadgets : recharge +40 %']},
  mystique:{n:'Mystique',ico:'🔮',d:'Un as des gadgets, fragile au corps à corps.',gcd:.5,hp:-6,melee:.85,start:{am:{haste:1,cloak:1}},pros:['Gadgets 2× plus rapides','Rhum et brume au départ'],cons:['−6 PV','−15 % dégâts de mêlée']},
  pillard:{n:'Pillard',ico:'💰',d:'Il ramasse plus de butin, mais encaisse mal.',loot:1.35,def:1.1,hp:-2,start:{am:{net:1}},pros:['+35 % de ressources ramassées','Filet piégé au départ'],cons:['+10 % dégâts reçus','−2 PV']}
};
const CLS_IDS=Object.keys(CLASSES);
const C=e=>CLASSES[e.cls]||CLASSES.matelot, cv=(e,k)=>C(e)[k]===undefined?CBASE[k]:C(e)[k];
function applyClass(e){
  const st=C(e).start; if(!st) return;
  if(st.sword) e.sword=Math.max(e.sword,st.sword); if(st.blocks) e.blocks[2]+=st.blocks;
  if(st.own) for(const k of st.own) e.own[k]=true; if(st.am) for(const k in st.am) e.am[k]=(e.am[k]||0)+st.am[k];
}
const MODES={solo:{n:'Chacun pour soi',d:'4 équipages, 1 pirate chacun.'},trio:{n:'Équipes de 3',d:'Toi + 2 coéquipiers bots. 3 pirates par équipage (12 au total), un coffre partagé.'},duo:{n:'Équipes de 2',d:'Tu es accompagné d\'un coéquipier bot. 2 pirates par équipage, un coffre partagé.'}};
const OPT_RES=[{n:'Lentes',v:.6},{n:'Normales',v:.9},{n:'Rapides',v:1.3}];
const DIA_INT=[Infinity,48,30,19];
const OPT_START=[{n:'Aucun',r:{}},{n:'Laboratoire (illimité)',r:{bronze:9999,silver:9999,gold:9999,diamond:9999}},{n:'Petit pécule',r:{bronze:40,silver:10}},{n:'Butin de départ',r:{bronze:120,silver:40,gold:6,diamond:3}}];
const OPT_CORE=[{n:'Fragiles',v:1.3},{n:'Normaux',v:2.5},{n:'Solides',v:4},{n:'Blindés',v:6.5}];
let game={state:'menu',diff:'normal',cls:'matelot',look:{skin:0,hat:0,hair:0,face:0,patch:1},pname:'Toi',opts:{bossf:1,endg:2,ctr:1,style:'3d',mode:'solo',map:'classic',res:.9,start:0,core:1,stack:3,roster:40,evf:2,ev:{coins:1,curse:1,shark:1,storm:1,volcano:1,fog:1,kraken:1,rush:1}},t:0,win:false,hurtFx:0,hitmark:0,flash:0,flashCol:'#fff'};
let player=null;
let shake=0, banner={txt:'',col:'#fff',t:0,max:3};
let selId='block', selAnim=0;
let ISLANDS=[];
let aim={x:0,y:0,ok:false}; // point visé (px de simulation), mis à jour par le rendu 3D

/* =====================  AUDIO (WebAudio, aucun fichier)  ===================== */
const SET={shake:1,slow:true};
let AC=null,muted=false,noiseBuf=null; const sfxT={};
function audioInit(){
  if(!AC){ try{AC=new (window.AudioContext||window.webkitAudioContext)();
    noiseBuf=AC.createBuffer(1,AC.sampleRate,AC.sampleRate); const d=noiseBuf.getChannelData(0); for(let i=0;i<d.length;i++) d[i]=Math.random()*2-1; }catch(_){AC=null;} }
  if(AC&&AC.state==='suspended') AC.resume();
}
function tone(f,d,type,vol,slide,delay){
  const t0=AC.currentTime+(delay||0), o=AC.createOscillator(), g=AC.createGain();
  o.type=type||'square'; o.frequency.setValueAtTime(f,t0); if(slide) o.frequency.exponentialRampToValueAtTime(Math.max(30,f*slide),t0+d);
  g.gain.setValueAtTime(vol,t0); g.gain.exponentialRampToValueAtTime(.0001,t0+d); o.connect(g); g.connect(AC.destination); o.start(t0); o.stop(t0+d+.02);
}
function noise(d,vol,freq,delay){
  const t0=AC.currentTime+(delay||0), s=AC.createBufferSource(), f=AC.createBiquadFilter(), g=AC.createGain();
  s.buffer=noiseBuf; f.type='lowpass'; f.frequency.value=freq||1500; g.gain.setValueAtTime(vol,t0); g.gain.exponentialRampToValueAtTime(.0001,t0+d);
  s.connect(f); f.connect(g); g.connect(AC.destination); s.start(t0); s.stop(t0+d+.02);
}
function sfx(n,x,y){
  if(!AC||muted||AC.state!=='running') return;
  const now=performance.now(); if(sfxT[n]&&now-sfxT[n]<40) return; sfxT[n]=now;
  let v=1; if(x!==undefined&&player){ v=clamp(1-Math.hypot(x-player.x,y-player.y)/T/20,0,1); if(v<.03) return; }
  const r=Math.random();
  switch(n){
    case 'place':tone(300+r*60,.07,'square',.07*v,1.6);break;
    case 'tick':tone(180+r*40,.05,'triangle',.06*v,.6);break;
    case 'break':noise(.18,.14*v,1800);tone(120,.15,'sawtooth',.06*v,.5);break;
    case 'hit':noise(.09,.16*v,2600);tone(220,.09,'square',.08*v,.5);break;
    case 'swing':noise(.1,.07*v,3500);break;
    case 'shot':noise(.08,.16*v,4000);tone(520,.1,'sawtooth',.07*v,.3);break;
    case 'shotgun':noise(.2,.26*v,2500);tone(160,.18,'sawtooth',.1*v,.4);break;
    case 'sniper':noise(.3,.22*v,5000);tone(900,.3,'sawtooth',.09*v,.15);break;
    case 'bow':tone(700,.12,'triangle',.07*v,.4);noise(.05,.05*v,6000);break;
    case 'flame':noise(.07,.06*v,1200);break;
    case 'ice':tone(1200,.18,'sine',.08*v,.5);tone(1800,.12,'sine',.05*v,.5,.03);break;
    case 'boom':noise(.5,.34*v,900);tone(90,.45,'sawtooth',.16*v,.3);break;
    case 'whoosh':noise(.35,.2*v,1200);tone(300,.3,'sine',.1*v,.3);break;
    case 'coin':tone(880,.07,'square',.06*v);tone(1320,.12,'square',.06*v,1,.06);break;
    case 'buy':tone(660,.07,'triangle',.1);tone(990,.1,'triangle',.1,1,.06);tone(1320,.14,'triangle',.08,1,.12);break;
    case 'fail':tone(160,.15,'square',.09,.7);break;
    case 'jump':tone(260,.14,'sine',.09*v,2.2);break;
    case 'boing':tone(200,.35,'sine',.14*v,3.5);break;
    case 'gadget':tone(500,.1,'triangle',.09*v,1.8);tone(750,.1,'triangle',.07*v,1.5,.07);break;
    case 'die':tone(400,.4,'sawtooth',.1*v,.2);noise(.25,.1*v,1500);break;
    case 'fanfare':tone(523,.12,'square',.07);tone(659,.12,'square',.07,1,.1);tone(784,.2,'square',.07,1,.2);break;
    case 'alarm':tone(880,.12,'square',.09);tone(660,.12,'square',.09,1,.14);break;
    case 'ui':tone(700,.04,'triangle',.05);break;
    case 'splash':noise(.35,.2*v,2200);tone(220,.3,'sine',.07*v,.4);break;
    case 'reload':tone(300,.05,'square',.05*v);tone(500,.07,'square',.05*v,1,.12);break;
    case 'baa':tone(380,.5,'sawtooth',.12*v,.7);tone(390,.5,'square',.05*v,.7);break;
    case 'woof':noise(.07,.1*v,1800);tone(260,.1,'triangle',.06*v,.5);break;
  }
}
const idx=(x,y)=>y*W+x;
const inb=(x,y)=>x>=0&&y>=0&&x<W&&y<H;
const fl=(x,y)=>inb(x,y)?floorT[y*W+x]:0;
const wl=(x,y)=>inb(x,y)?wallT[y*W+x]:0;
const rnd=(a,b)=>a+Math.random()*(b-a);
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const WALL_K=1; // dégâts des projectiles sur les murs = dégâts de l'arme × WALL_K
const MAXH=()=>Math.max(1,Math.min(4,(game.opts&&game.opts.stack)|0||3));
const wallLayers=i=>{ const w=wallT[i]; return w===0?0:w===CORE?1:Math.max(1,Math.ceil(hpW[i]/BHP[w]-1e-6)); };
const wallTop=(tx,ty)=>{ if(!inb(tx,ty)||wallT[idx(tx,ty)]===0) return 0; return WH*wallLayers(idx(tx,ty)); };
let CAMYAW=0; // rotation de la caméra (clic molette + glisser)
const camRelInput=(ix,iy)=>{ if(!CAMYAW||(!ix&&!iy)) return [ix,iy]; const c=Math.cos(CAMYAW), s=Math.sin(CAMYAW); return [ix*c+iy*s,-ix*s+iy*c]; };
const rangeK=e=>(1+Math.min(.5,Math.max(0,e.z||0)/220))*(e.relics&&e.relics.r_glass?1.2:1); // plus on est haut, plus la portée des objets et des armes grandit
const groundH=e=>{ // hauteur du sol sous le corps : on reste sur un mur tant qu'une partie du corps le surplombe
  let best=0; const x0=Math.floor((e.x-ER)/T),x1=Math.floor((e.x+ER)/T),y0=Math.floor((e.y-ER)/T),y1=Math.floor((e.y+ER)/T);
  for(let ty=y0;ty<=y1;ty++)for(let tx=x0;tx<=x1;tx++){ const t=wallTop(tx,ty); if(t>best&&e.z>=t-1) best=t; }
  return best;
};

/* =====================  GÉNÉRATION  ===================== */
function island(cx,cy,r,cut,reg){
  ISLANDS.push({x:cx,y:cy,r:cut+2,reg});
  for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){
    if(Math.abs(dx)+Math.abs(dy)<=cut){ const i=idx(cx+dx,cy+dy); floorT[i]=1; region[i]=reg; }
  }
}
function ship(cx,cy){
  ISLANDS.push({x:cx,y:cy,r:7,reg:4,ship:true});
  for(let dy=-6;dy<=6;dy++){ const a=Math.abs(dy), hw=dy<0?(a<=3?3:a===4?2:a===5?1:0):(dy<=5?3:2);
    for(let dx=-hw;dx<=hw;dx++){ const i=idx(cx+dx,cy+dy); floorT[i]=1; region[i]=4; } }
}
function makeEnt(team,isBot,name){
  return {team,isBot,name,x:0,y:0,z:0,vx:0,vy:0,vz:0,ix:0,iy:0,ang:0,hp:20,alive:false,elim:false,resp:0,inv:0,flash:0,
    res:{bronze:0,silver:0,gold:0,diamond:0},blocks:{2:8,3:0,4:0,5:0,7:0,8:0},bsel:2,pick:0,sword:0,ws:{},slow:0,
    grap:0,jet:0,bomb:0,repel:0,shield:0,own:{},am:{},held:'sword',
    up:{mason:0,fb:0,fs:0,hp:0,sp:0,ar:0,gold:0,core:0,jmp:0,reg:0,vamp:0,rel:0,dmg:0,loot:0,dia:0},
    cd:{atk:0,mine:0,place:0,bow:0,gad:0},jetT:0,voidT:0,pull:null,grace:0,swing:0,swingMax:.2,kills:0,deaths:0,
    root:0,flagBuff:0,lastSafe:null,lastSafeT:0,bubble:0,cloak:0,haste:0,springT:0,frozen:0,slip:0,sdx:0,sdy:0,squash:0,muzzle:0,stepPh:0,stepT:0,burn:0,
    lastBy:null,lastByT:0,sinceHurt:99,ai:null,hook:null,aegis:0,slot:0,bar:[],pack:[],cls:'matelot',look:null,relics:{},pcd:{}};
}
function makeBotAI(){ return {mode:'home',t:0,leaveAt:rnd(getD().leave[0],getD().leave[1]),buyT:rnd(0,1),goal:null,wait:0,target:-1,lastX:0,lastY:0,stuckT:0,jig:0,jx:0,jy:0,react:0,foe:null,likes:new Set(BOT_OPTIONAL.filter(()=>Math.random()<getD().likeP))}; }
let NETSLOTS=null;
function newGame(){
  floorT=new Uint8Array(W*H); wallT=new Uint8Array(W*H); hpF=new Float32Array(W*H); hpW=new Float32Array(W*H);
  ownF=new Int8Array(W*H).fill(-1); ownW=new Int8Array(W*H).fill(-1); region=new Int8Array(W*H).fill(-1); pop=new Float32Array(W*H);
  TD=[];ents=[];spawners=[];projs=[];bombs=[];shields=[];hooks=[];parts=[];rings=[];floats=[];feed=[];traps=[];chickens=[];pearls=[];beams=[];guards=[];
  selId='block'; banner.t=0; ISLANDS=[];
  const O=game.opts, MAP=MAPS[O.map]||MAPS.classic, TS=({solo:1,duo:2,trio:3})[O.mode]||1;
  BHP[CORE]=Math.round(30*(OPT_CORE[O.core]||OPT_CORE[1]).v);
  MAP.bases.forEach(([bx,by,dir],i)=>{ const t=TEAMS[i]; t.bx=bx; t.by=by; t.dir=dir; });
  ship(CX,CY);
  for(const [rx,ry] of MAP.relay) island(rx,ry,2,3,5);
  for(const [dx,dy] of MAP.dia){
    island(dx,dy,2,3,5);
    spawners.push({x:dx,y:dy,kind:'dia',team:-1,types:{diamond:{t:0,stock:0,cap:Infinity,int:()=>34}}});
  }
  for(const [ox,oy] of [[-2,0],[2,0],[0,-2],[0,2]])
    spawners.push({x:CX+ox,y:CY+oy,kind:'gold',team:-1,types:{gold:{t:0,stock:0,cap:Infinity,int:()=>48}}});
  TEAMS.forEach((t,i)=>{
    island(t.bx,t.by,5,8,i);
    const d=t.dir, p=[-d[1],d[0]];
    const td={id:i,...t,coreAlive:true,spawnTile:[t.bx+d[0]*3,t.by+d[1]*3],padTile:[t.bx+p[0]*3,t.by+p[1]*3],ent:null};
    TD.push(td);
    const ci=idx(t.bx,t.by); wallT[ci]=CORE; hpW[ci]=BHP[CORE]; ownW[ci]=i;
    const col=['','Rouge','Vert','Jaune'][i];
    const ent=makeEnt(i,i!==0,i===0?'Toi':'Cap. '+col); td.ent=ent; td.members=[ent]; ents.push(ent);
    for(let k=1;k<TS;k++){ const m=makeEnt(i,true,(i===0?['','Matelot','Mousse']:['','Second '+col,'Mousse '+col])[k]); m.slot=k; m.up=ent.up; td.members.push(m); ents.push(m); }
    for(const m of td.members){ if(m.isBot) m.ai=makeBotAI(); }
    const U=()=>td.ent.up;
    spawners.push({x:td.padTile[0],y:td.padTile[1],kind:'base',team:i,types:{
      bronze:{t:0,stock:0,cap:Infinity,int:()=>FB_INT[U().fb]*(td.ent.isBot?getD().income:1)},
      silver:{t:0,stock:0,cap:Infinity,int:()=>FS_INT[U().fs]*(td.ent.isBot?getD().income:1)},
      gold:{t:0,stock:0,cap:Infinity,int:()=>GOLD_INT[U().gold]},
      diamond:{t:0,stock:0,cap:Infinity,int:()=>DIA_INT[U().dia]}}});
  });
  player=ents[0]; resetEvents(); makeRoster();
  for(const e of ents){ if(e===player){ e.cls=CLASSES[game.cls]?game.cls:'matelot'; e.look=Object.assign({},game.look); e.name=(game.pname||'Toi').slice(0,14); } else { e.cls=CLS_IDS[Math.floor(Math.random()*CLS_IDS.length)]; e.look=randomLook(); }
    const rs=NETSLOTS&&e.slot===0&&e!==player?NETSLOTS[e.team]:null;
    if(rs){ e.remote=true; e.isBot=false; e.ai=null; e.name=String(rs.name||'Pirate').slice(0,14); e.cls=CLASSES[rs.cls]?rs.cls:'matelot'; e.look=lookOf(rs.look); e.inp={ix:0,iy:0,wx:e.x,wy:e.y,down:false,clicked:false,sel:'sword'}; } }
  const SR=(OPT_START[O.start]||OPT_START[0]).r; for(const e of ents) for(const k in SR) e.res[k]+=SR[k];
  ents.forEach(e=>{ applyClass(e); spawnEnt(e); }); syncBar(player);
  game.t=0; game.win=false; game.state='play'; game.hurtFx=0;
  announce('C\'EST PARTI !','#fde68a');
  msg('Protège ton coffre au trésor. Espace pour sauter, E pour la boutique.', '#fff');
  if(ROSTER) msg(`Roster aléatoire : ${ROSTER.size} objets en boutique cette partie.`,'#fde68a');
  if(typeof onNewGame==='function') onNewGame();
}
function spawnEnt(e){
  const td=TD[e.team]; let ox=0,oy=0; { const n=({solo:1,duo:2,trio:3})[game.opts.mode]||1; if(n>1){ const k=((e.slot||0)-(n-1)/2)*17; ox=-td.dir[1]*k; oy=td.dir[0]*k; } } e.x=(td.spawnTile[0]+.5)*T+ox; e.y=(td.spawnTile[1]+.5)*T+oy;
  const i=idx(td.spawnTile[0],td.spawnTile[1]); if(wallT[i]){wallT[i]=0;}
  if(floorT[i]===0){floorT[i]=1;}
  e.hp=maxhp(e); e.alive=true; e.inv=2; e.vx=e.vy=0; e.z=60; e.vz=0; e.voidT=0; e.jetT=0; e.pull=null; e.grace=0; e.hook=null; e.riding=null; e.tkH=0; e.glide=0; e.tiny=0; e.giant=0;
  e.frozen=0; e.slip=0; e.burn=0; e.bubble=0; e.cloak=0; e.squash=-.7;
  beams.push({x:e.x,y:e.y,t:0,col:TEAMS[e.team].light}); ring(e.x,e.y,T*2,TEAMS[e.team].col,.6);
  burst(e.x,e.y,TEAMS[e.team].light,14,160,.6,3);
  if(e.ai){e.ai.mode='home'; e.ai.leaveAt=e.ai.t+rnd(12,22)*(getD().leave[0]/40);}
}
const maxhp=e=>(e.pers==='batisseur'?4:e.pers==='kamikaze'?-3:0)+(e.isBot?getD().hp:20)+6*e.up.hp+cv(e,'hp')+(e.relics&&e.relics.r_hp?4:0);
const speedOf=e=>(game.mspd||1)*(e.carry?.78:1)*(e.pers==='kamikaze'?1.08:1)*(e.relics&&e.relics.r_speed?1.1:1)*(e.tiny>0?1.25:1)*(e.giant>0?.9:1)*(e.rage>0?1.2:1)*(e.curse>0?.75:1)*cv(e,'spd')*138*(1+.08*e.up.sp)*(e.jetT>0?1.3:1)*(e.isBot?getD().speed:1)*(e.slip>0?1.35:1)*(e.haste>0?1.5:1)*(e.slow>0?.55:1)*(e.flagBuff>0?1.2:1);
function msg(txt,col){feed.push({txt,col:col||'#dbe4ff',t:7}); if(feed.length>4)feed.shift();}
function announce(txt,col){banner.txt=txt;banner.col=col||'#fff';banner.t=banner.max;sfx('fanfare');}

/* =====================  EFFETS  ===================== */
function burst(x,y,col,n,sp,life,size){
  for(let i=0;i<n;i++){const a=Math.random()*6.283,s=rnd(.3,1)*sp;parts.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:rnd(.5,1)*life,max:life,col,size:size||3});}
}
function chunks(x,y,col,n){ // débris 3D qui retombent
  for(let i=0;i<n;i++){const a=Math.random()*6.283,s=rnd(30,150);
    parts.push({x,y,z:rnd(6,16),vz:rnd(120,300),vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:rnd(.5,.9),max:.9,col,size:rnd(3,6)});}
}
function smoke(x,y,n,size,life){
  for(let i=0;i<n;i++) parts.push({x:x+rnd(-6,6),y:y+rnd(-6,6),vx:rnd(-25,25),vy:rnd(-45,-10),life:rnd(.5,1)*life,max:life,col:'#9ca3af',size:size,smoke:true});
}
function ring(x,y,r,col,t,fill){rings.push({x,y,r,t:0,max:t||.4,col,fill});}
function floatTxt(x,y,txt,col,s){floats.push({x,y,txt,col,t:1,s:s||13});}
function flashScreen(col,a){game.flash=a;game.flashCol=col;}

/* =====================  PHYSIQUE  ===================== */
function hitWall(x,y,z){
  const r=ER, x0=Math.floor((x-r)/T),x1=Math.floor((x+r)/T),y0=Math.floor((y-r)/T),y1=Math.floor((y+r)/T);
  for(let ty=y0;ty<=y1;ty++)for(let tx=x0;tx<=x1;tx++) if(wl(tx,ty)>0&&z<wallTop(tx,ty)-1) return true;
  return false;
}
function unstick(e){ // si le corps est coincé dans un bloc : on le repousse vers l'espace libre le plus proche (ou on le pose dessus)
  if(!hitWall(e.x,e.y,e.z)) return;
  for(let r=3;r<=T*2;r+=3) for(let k=0;k<16;k++){ const a=k*Math.PI/8, nx=e.x+Math.cos(a)*r, ny=e.y+Math.sin(a)*r;
    if(!hitWall(nx,ny,e.z)&&nx>0&&ny>0&&nx<W*T&&ny<H*T){ e.x=nx; e.y=ny; e.vx=e.vy=0; return; } }
  e.z=Math.max(e.z,wallTop(Math.floor(e.x/T),Math.floor(e.y/T)));
}
function moveEnt(e,dx,dy){
  const n=Math.ceil(Math.max(Math.abs(dx),Math.abs(dy))/6)||1, sx=dx/n, sy=dy/n;
  for(let i=0;i<n;i++){
    e.x+=sx; if(hitWall(e.x,e.y,e.z)){e.x-=sx;e.vx=0;}
    e.y+=sy; if(hitWall(e.x,e.y,e.z)){e.y-=sy;e.vy=0;}
  }
  e.x=clamp(e.x,0,W*T); e.y=clamp(e.y,0,H*T);
}
function protectedTile(tx,ty,team){
  const cx=(tx+.5)*T, cy=(ty+.5)*T;
  for(const s of shields) if(s.team!==team&&Math.hypot(cx-s.x,cy-s.y)<s.r) return true;
  return false;
}
function inShield(x,y,team){
  for(const s of shields) if(s.team===team&&Math.hypot(x-s.x,y-s.y)<s.r) return true;
  return false;
}
function hurt(e,amount,by,kx,ky){
  if(!e.alive||e.inv>0||e.aegis>0) return;
  if(by&&by.isBot&&!e.isBot) amount*=getD().dmg;
  if(by&&by.up&&by.up.dmg) amount*=1+.08*by.up.dmg;
  if(by&&by.relics&&by.relics.r_skull) amount*=1.2; if(e.relics&&e.relics.r_skull) amount*=1.12; if(e.relics&&e.relics.r_anchor){ kx*=.65; ky*=.65; }
  amount*=(1-.12*e.up.ar)*cv(e,'def')*(e.plate>0?.4:1)*(e.curse>0?1.3:1)*(by&&by.rage>0?1.5:1)*(e.tiny>0?1.3:1)*(e.giant>0?.85:1)*(by&&by.giant>0?1.3:1); kx*=cv(e,'kb'); ky*=cv(e,'kb');
  e.hp-=amount; if(by&&by!==e&&by.up&&(by.up.vamp||(by.relics&&by.relics.r_fang))) by.hp=Math.min(maxhp(by),by.hp+amount*(.08*(by.up.vamp||0)+(by.relics&&by.relics.r_fang?.1:0))); e.vx+=kx; e.vy+=ky; e.lastBy=by; e.lastByT=5; e.sinceHurt=0;
  if(amount>0){
    e.flash=.15; burst(e.x,e.y-e.z,'#ff6b6b',5,120,.4,3);
    if(amount>=.9) floatTxt(e.x+rnd(-8,8),e.y-26-e.z,'-'+Math.round(amount),e===player?'#ff6b6b':'#fff',amount>6?18:14);
    if(e===player){ shake=Math.max(shake,5+amount); game.hurtFx=.4; }
    if(by===player) game.hitmark=.18;
    sfx('hit',e.x,e.y);
  }
  if(e.hp<=0) die(e,by);
}
function splash(x,y){ burst(x,y,'#bfe9ff',22,230,.8,4); burst(x,y,'#ffffff',10,160,.6,3); ring(x,y,T*1.6,'#bfe9ff',.6,true); ring(x,y,T*2.6,'#ffffff',.8); sfx('splash',x,y); }
function die(e,by,sea){
  if(!e.alive) return;
  if(sea) splash(e.x,e.y);
  e.alive=false; e.deaths++; e.pull=null; e.hook=null;
  sfx('die',e.x,e.y); burst(e.x,e.y,TEAMS[e.team].col,22,230,.8,4); chunks(e.x,e.y,TEAMS[e.team].light,10); ring(e.x,e.y,T*1.6,'#fff',.4);
  const killer=by&&by!==e?by:null;
  if(killer){
    killer.kills++;
    if(!(game.opts&&game.opts.rkeep)) for(const k in e.res){killer.res[k]+=e.res[k]; if(killer===player&&e.res[k]>0) floatTxt(e.x,e.y-40-k.length*0,'+'+e.res[k]+' '+RESNAME[k],RESCOL[k],15);}
    msg(`${killer.name} a éliminé ${e.name}`,TEAMS[killer.team].light);
    if(killer===player){ announce('ÉLIMINATION !','#fde68a'); flashScreen('#fff',.15); }
  } else msg(e.zoneKill?`${e.name} a été consumé par la zone`:e.bossKill?`${e.name} a été écrasé par le kraken`:e.fallDeath?`${e.name} s'est écrasé au sol`:`${e.name} est tombé à la mer`,'#9aa7cf');
  if(e.riding){ e.riding.rider=null; e.riding=null; }
  // mort hors de sa base : on perd tout son équipement (les améliorations de base sont conservées)
  if((game.opts.loss|0)===1||((game.opts.loss|0)===0&&!nearBase(e))){
    const had=Object.keys(e.own).length+Object.values(e.am).filter(v=>v>0).length+e.grap+e.jet+e.bomb+e.repel+e.shield+(e.pick>0?1:0)+(e.sword>0?1:0)+totalBlocks(e);
    e.blocks={2:8,3:0,4:0,5:0,7:0,8:0}; e.bsel=2; e.pick=Math.max(0,e.pick-1); e.sword=Math.max(0,e.sword-1); e.grap=e.jet=e.bomb=e.repel=e.shield=0; e.own=keepOwn(e); e.am=keepAm(e); e.ws={};
    if(e===player&&had>8){ msg('Mort hors de ta base : tu perds ton équipement !','#fca5a5'); floatTxt(e.x,e.y-50,'ÉQUIPEMENT PERDU','#fca5a5',16); }
  }
  const lost=game.opts.rkeep?0:Object.values(e.res).reduce((a,b)=>a+b,0);
  if(!game.opts.rkeep) for(const k in e.res) e.res[k]=0; // la mort fait perdre toutes les ressources (option)
  if(e===player){ shake=14; if(lost>0) msg(`Tu as perdu ${lost} ressources !`,'#fca5a5'); }
  const td=TD[e.team];
  if(td.coreAlive) e.resp=3;
  else{ e.elim=true; msg(`${e.name} est éliminé définitivement !`,'#ff9b9b'); announce(`${e.name} ÉLIMINÉ`,'#fca5a5'); checkOver(); }
}
const teamElim=t=>TD[t].members.every(m=>m.elim);
function checkOver(){
  if(game.state!=='play') return;
  if(typeof NETON!=='undefined'&&NETON){ // en ligne : la partie s'arrête quand il ne reste qu'un équipage, ou plus aucun humain
    const alive=TD.filter(t=>!teamElim(t.id)), humans=ents.filter(e=>(e===player||e.remote)&&!e.elim);
    if(alive.length<=1||!humans.length){ game.state='over'; game.winTeam=alive.length===1?alive[0].id:-1; game.win=game.winTeam===player.team; }
    return;
  }
  if(teamElim(player.team)){game.state='over';game.win=false;return;}
  if(TD.every(t=>t.id===player.team||teamElim(t.id))){game.state='over';game.win=true;}
}
function wallBlockedByEnt(cx,cy){
  for(const o of ents) if(o.alive&&Math.abs(o.x-cx)<T/2+ER&&Math.abs(o.y-cy)<T/2+ER) return true;
  return false;
}
function spawnerAt(tx,ty){for(const s of spawners) if(s.x===tx&&s.y===ty) return s; return null;}

/* =====================  ACTIONS  ===================== */
function totalBlocks(e){ let n=0; for(const t of BORDER) n+=e.blocks[t]||0; return n; }
function canPlace(e,tx,ty,type){
  if(!inb(tx,ty)) return false;
  const f=fl(tx,ty), w=wl(tx,ty);
  if(w>0){ // empiler un bloc identique de son équipe sur un mur existant
    const i=idx(tx,ty); if(!type||w!==type||w===CORE||ownW[i]!==e.team||wallLayers(i)>=MAXH()) return false;
    if(Math.hypot((tx+.5)*T-e.x,(ty+.5)*T-e.y)>3.7*T||protectedTile(tx,ty,e.team)) return false;
    return !wallBlockedByEnt((tx+.5)*T,(ty+.5)*T);
  }
  if(Math.hypot((tx+.5)*T-e.x,(ty+.5)*T-e.y)>3.7*T) return false;
  if(protectedTile(tx,ty,e.team)) return false;
  if(f===0){ return fl(tx+1,ty)>0||fl(tx-1,ty)>0||fl(tx,ty+1)>0||fl(tx,ty-1)>0; }
  if(spawnerAt(tx,ty)) return false;
  return !wallBlockedByEnt((tx+.5)*T,(ty+.5)*T);
}
function doPlace(e,tx,ty,type){
  if(e.cd.place>0) return false;
  type=type||e.bsel;
  if(!e.blocks[type]){ type=BORDER.find(t=>e.blocks[t]>0); if(!type) return false; if(e===player) e.bsel=type; }
  if(!canPlace(e,tx,ty,type)) return false;
  const i=idx(tx,ty), col=blockColor(type,e.team)[0];
  if(floorT[i]===0){ floorT[i]=type; hpF[i]=BHP[type]; ownF[i]=e.team; }
  else if(wallT[i]===type){ hpW[i]+=BHP[type]; }
  else { wallT[i]=type; hpW[i]=BHP[type]; ownW[i]=e.team; }
  pop[i]=1;
  if(Math.random()>=cv(e,'free')) e.blocks[type]--; e.cd.place=e.isBot?.5:.3; e.swing=.12; e.swingMax=.12;
  chunks((tx+.5)*T,(ty+.5)*T,col,4); ring((tx+.5)*T,(ty+.5)*T,T*.7,'#ffffff',.22); sfx('place',e.x,e.y);
  return true;
}
function placeUnder(e){ // en saut : clic = bloc sous les pieds (pont au-dessus de l'eau, sinon mur / couche supplémentaire pour monter)
  if(e.cd.place>0) return false;
  const tx=Math.floor(e.x/T), ty=Math.floor(e.y/T); if(!inb(tx,ty)) return false;
  const type=e.blocks[e.bsel]?e.bsel:BORDER.find(t=>e.blocks[t]>0); if(!type) return false;
  if(protectedTile(tx,ty,e.team)||spawnerAt(tx,ty)) return false;
  const i=idx(tx,ty), w=wallT[i];
  if(w===CORE) return false;
  if(w>0){ if(w!==type||ownW[i]!==e.team||wallLayers(i)>=MAXH()||e.z<wallTop(tx,ty)+WH-1) return false; hpW[i]+=BHP[type]; }
  else if(floorT[i]===0){ floorT[i]=type; hpF[i]=BHP[type]; ownF[i]=e.team; }
  else { if(e.z<WH-1) return false; wallT[i]=type; hpW[i]=BHP[type]; ownW[i]=e.team; }
  pop[i]=1; if(e===player&&!e.blocks[e.bsel]) e.bsel=type;
  if(Math.random()>=cv(e,'free')) e.blocks[type]--; e.cd.place=e.isBot?.5:.3; e.swing=.12; e.swingMax=.12; e.squash=-.2;
  chunks((tx+.5)*T,(ty+.5)*T,blockColor(type,e.team)[0],4); ring((tx+.5)*T,(ty+.5)*T,T*.7,'#ffffff',.22); sfx('place',e.x,e.y);
  return true;
}
function placeTarget(e,wx,wy){
  const dx=wx-e.x,dy=wy-e.y,d=Math.hypot(dx,dy)||1,ux=dx/d,uy=dy/d;
  const ctx_=Math.floor(wx/T),cty=Math.floor(wy/T);
  const bt=e.blocks[e.bsel]?e.bsel:BORDER.find(t=>e.blocks[t]>0);
  if(canPlace(e,ctx_,cty,bt)) return [ctx_,cty];
  for(let s=Math.min(d,3.6*T);s>=T*.5;s-=T*.2){
    const tx=Math.floor((e.x+ux*s)/T),ty=Math.floor((e.y+uy*s)/T);
    if(fl(tx,ty)===0&&canPlace(e,tx,ty)) return [tx,ty];
  }
  return null;
}
function findMine(e,ang,maxd,curx,cury){
  const ux=Math.cos(ang),uy=Math.sin(ang);
  for(let s=8;s<=maxd;s+=6){
    const tx=Math.floor((e.x+ux*s)/T),ty=Math.floor((e.y+uy*s)/T);
    const w=wl(tx,ty);
    if(w>0){ if(w===CORE&&ownW[idx(tx,ty)]===e.team) return null; return [tx,ty,0]; }
  }
  if(curx!==undefined){
    const tx=Math.floor(curx/T),ty=Math.floor(cury/T);
    if(Math.hypot((tx+.5)*T-e.x,(ty+.5)*T-e.y)<=maxd+T*.4&&fl(tx,ty)>=2&&wl(tx,ty)===0) return [tx,ty,1];
  }
  return null;
}
function doMine(e,hit){
  if(!hit||e.cd.mine>0) return;
  const [tx,ty,layer]=hit;
  if(protectedTile(tx,ty,e.team)){ if(e===player) floatTxt(e.x,e.y-30,'Champ de force !','#7dd3fc'); e.cd.mine=.4; return; }
  e.cd.mine=e.isBot?.55-getD().use*.05:.28; e.swing=.18; e.swingMax=.18;
  damageTile(tx,ty,PICKS[e.pick].d*cv(e,'mine'),e,layer);
}
function damageTile(tx,ty,dmg,src,layer){
  const i=idx(tx,ty), cx=(tx+.5)*T, cy=(ty+.5)*T;
  if(layer===1){
    hpF[i]-=dmg; burst(cx,cy,'#e5e7eb',3,90,.3,2); pop[i]=Math.max(pop[i],.35);
    sfx(hpF[i]<=0?'break':'tick',cx,cy);
    if(hpF[i]<=0){chunks(cx,cy,blockColor(floorT[i],Math.max(0,ownF[i]))[0],8);floorT[i]=0;ownF[i]=-1;}
    return;
  }
  if(wallT[i]===CORE) dmg*=[1,.8,.65,.5][TD[ownW[i]].ent.up.core||0];
  hpW[i]-=dmg; burst(cx,cy-WH,'#f1f5f9',3,90,.3,2); pop[i]=Math.max(pop[i],.35); sfx(hpW[i]<=0?'break':'tick',cx,cy);
  if(hpW[i]<=0){
    const t=wallT[i];
    if(t===CORE){
      const td=TD[ownW[i]]; td.coreAlive=false;
      burst(cx,cy,td.col,50,340,1.1,5); chunks(cx,cy,td.col,24); ring(cx,cy,T*4,td.col,.8); ring(cx,cy,T*6,'#fff',.6); shake=Math.max(shake,16);
      msg(`Le coffre des ${td.name} est détruit !`,td.light);
      announce(`COFFRE DES ${td.name.toUpperCase()} DÉTRUIT !`,td.light); flashScreen(td.col,.3);
      if(td.ent===player) msg('Tu ne pourras plus réapparaître !','#ff7b7b');
      else if(src===player) msg('Bien joué, tu as détruit un coffre au trésor !','#fde68a');
    } else { chunks(cx,cy,blockColor(t,Math.max(0,ownW[i]))[0],10); smoke(cx,cy,2,5,.6); if(src&&src.blocks&&src.team===ownW[i]&&src.blocks[t]!==undefined&&src.hp!==undefined){ src.blocks[t]++; if(src===player) floatTxt(cx,cy-30,'+1 '+BNAME[t],'#e5e7eb',12); } }
    wallT[i]=0; ownW[i]=-1;
  }
}
function doSword(e){
  if(e.cd.atk>0) return; e.cd.atk=e.isBot?getD().meleeCd:.42; e.swing=.2; e.swingMax=.2; sfx('swing',e.x,e.y);
  const ax=Math.cos(e.ang),ay=Math.sin(e.ang), dmg=SWORDS[e.sword].d*cv(e,'melee');
  hitGuards(e,e.x+ax*T,e.y+ay*T,T*1.3,dmg); for(const bt of boats) if(bt.team!==e.team&&Math.hypot(bt.x-(e.x+ax*T),bt.y-(e.y+ay*T))<T*1.5) hitBoat(bt,dmg,e);
  for(const o of ents){
    if(!o.alive||o.team===e.team) continue;
    const dx=o.x-e.x,dy=o.y-e.y,d=Math.hypot(dx,dy);
    if(d<T*1.9&&d>0&&(dx*ax+dy*ay)/d>.35){ hurt(o,dmg,e,ax*300,ay*300); burst(o.x,o.y-8,'#fff',5,140,.25,2); if(e===player) shake=Math.max(shake,3); }
  }
}
/* objets posés (tourelles, pièges…) : ils ne disparaissent que détruits (ou déclenchés) */
function hitTraps(team,cx,cy,R,dmg){ for(const t of traps){ if(t.hp===undefined||t.team===team||t.t<=0) continue; if(Math.hypot(t.x-cx,t.y-cy)<R+10){ t.hp-=dmg; burst(t.x,t.y,'#fff',4,100,.25,3); if(t.hp<=0){ t.t=-1; chunks(t.x,t.y,'#94a3b8',8); burst(t.x,t.y,'#fbbf24',8,150,.4,3); } } } }
function hitGuards(e,cx,cy,R,dmg){ const tm=e?e.team:-1; hitTraps(tm,cx,cy,R,dmg); for(const g of guards){ if(g.team===tm) continue; if(Math.hypot(g.x-cx,g.y-cy)<R){ g.hp-=dmg; burst(g.x,g.y,'#fff',5,120,.3,3); } } }
function doGlove(e){
  if(e.cd.atk>0) return; e.cd.atk=.9; e.swing=.35; e.swingMax=.35; sfx('swing',e.x,e.y);
  const ax=Math.cos(e.ang),ay=Math.sin(e.ang);
  for(const o of ents){
    if(!o.alive||o.team===e.team) continue;
    const dx=o.x-e.x,dy=o.y-e.y,d=Math.hypot(dx,dy);
    if(d<T*2.3&&d>0&&(dx*ax+dy*ay)/d>.2){
      hurt(o,1.5,e,ax*1050,ay*1050); o.vz=Math.max(o.vz,240); ring(o.x,o.y,T,'#fecaca',.3); burst(o.x,o.y,'#fff',10,200,.3,3);
      floatTxt(o.x,o.y-40,'BOUM !','#fde047',18); if(e===player) shake=Math.max(shake,8);
    }
  }
}
function doHammer(e){
  if(e.cd.atk>0) return; e.cd.atk=1.1; e.swing=.35; e.swingMax=.35; sfx('break',e.x,e.y);
  const cx=e.x+Math.cos(e.ang)*T*1.2, cy=e.y+Math.sin(e.ang)*T*1.2, R=T*2.2;
  hitGuards(e,cx,cy,R,8); ring(cx,cy,R,'#fde68a',.45,true); ring(cx,cy,R*.6,'#fff',.3); burst(cx,cy,'#fde68a',18,260,.5,4); chunks(cx,cy,'#9ca3af',8); shake=Math.max(shake,e===player?10:4);
  for(const o of ents){ if(!o.alive||o.team===e.team) continue; const dx=o.x-cx,dy=o.y-cy,d=Math.hypot(dx,dy); if(d<R){ const u=d||1; hurt(o,6,e,dx/u*420,dy/u*420); o.vz=Math.max(o.vz,300); } }
  for(let ty=Math.floor((cy-R)/T);ty<=Math.floor((cy+R)/T);ty++)for(let tx=Math.floor((cx-R)/T);tx<=Math.floor((cx+R)/T);tx++){
    if(!inb(tx,ty)||Math.hypot((tx+.5)*T-cx,(ty+.5)*T-cy)>R*.75) continue;
    const i=idx(tx,ty); if(!wallT[i]||protectedTile(tx,ty,e.team)||(wallT[i]===CORE&&ownW[i]===e.team)) continue;
    damageTile(tx,ty,8,e,0);
  }
}
function wst(e,id){ return e.ws[id]||(e.ws[id]={a:GUNS[id].mag,r:0,cd:0,b:0,n:0,last:-9}); }
function startReload(e,id){ const g=GUNS[id],s=wst(e,id); if(s.r>0||s.a>=g.mag) return false; s.r=g.reload*(e.haste>0?.8:1)*cv(e,'rel')*(1-.12*(e.up.rel||0)); sfx('reload',e.x,e.y); return true; }
function fireGun(e,id){
  const g=GUNS[id]; if(!g||!e.own[id]) return false;
  const s=wst(e,id);
  if(s.r>0||s.cd>0) return false;
  if(s.a<=0){ startReload(e,id); return false; }
  s.a--; s.cd=g.cd*(e.isBot?getD().gunCd:1); e.muzzle=.08; s.n++; s.last=game.t;
  const moving=(Math.abs(e.ix)+Math.abs(e.iy))>.1&&g.moveSpread, spr=g.spread+s.b+(moving?g.moveSpread:0);
  s.b=Math.min(g.bmax,s.b+g.bloom);
  sfx(id==='gun'?'shot':id==='rocket'?'whoosh':id==='bow'?'bow':id==='woolgun'?'woof':id,e.x,e.y);
  for(let i=0;i<g.pel;i++){
    const a=e.ang+(g.pel>1?rnd(-spr,spr):(Math.random()*2-1)*spr*.7+Math.sin(s.n*1.7)*s.b*.45);
    projs.push({x:e.x+Math.cos(e.ang)*14,y:e.y+Math.sin(e.ang)*14,z:12,vx:Math.cos(a)*g.sp,vy:Math.sin(a)*g.sp,team:e.team,owner:e,life:g.life*(g.kind==='flame'?1:rangeK(e)),dmg:g.dmg*cv(e,'gun'),kb:g.kb,kind:g.kind||'bullet',col:g.col,pierce:g.pierce,hit:g.pierce?[]:null,short:g.short,lift:g.lift});
  }
  e.vx-=Math.cos(e.ang)*g.rec; e.vy-=Math.sin(e.ang)*g.rec;
  if(id!=='flame'&&id!=='bow'){ burst(e.x+Math.cos(e.ang)*16,e.y+Math.sin(e.ang)*16,g.col,4,120,.15,3); if(e===player) shake=Math.max(shake,id==='shotgun'||id==='sniper'||id==='rocket'?6:2); }
  if(s.a<=0) startReload(e,id);
  return true;
}
function updateWeapons(e,dt){
  for(const id in e.ws){ const s=e.ws[id],g=GUNS[id];
    s.cd=Math.max(0,s.cd-dt);
    if(s.r>0){ s.r-=dt; if(s.r<=0){ s.r=0; s.a=g.mag; } }
    if(game.t-s.last>.18) s.b=Math.max(0,s.b-dt*.45);
  }
}
function doBaa(e){
  if(e.cd.atk>0) return; e.cd.atk=1.2; e.swing=.35; e.swingMax=.35; sfx('baa',e.x,e.y);
  const ax=Math.cos(e.ang),ay=Math.sin(e.ang);
  ring(e.x+ax*T*2,e.y+ay*T*2,T*2.6,'#f9a8d4',.5); ring(e.x+ax*T*3.2,e.y+ay*T*3.2,T*3.2,'#fbcfe8',.6); floatTxt(e.x,e.y-46,'BÊÊÊÊH !','#f9a8d4',18);
  for(const o of ents){
    if(!o.alive||o.team===e.team) continue;
    const dx=o.x-e.x,dy=o.y-e.y,d=Math.hypot(dx,dy);
    if(d<T*5&&d>0&&(dx*ax+dy*ay)/d>.8){ hurt(o,2,e,ax*(900-d*.8),ay*(900-d*.8)); o.vz=Math.max(o.vz,160); }
  }
  for(const p of projs) if(p.team!==e.team){ const dx=p.x-e.x,dy=p.y-e.y,d=Math.hypot(dx,dy); if(d<T*4&&(dx*ax+dy*ay)/(d||1)>.7) p.life=0; }
}
function throwBomb(e,kind,wx,wy){
  if(e[kind]<=0||e.cd.gad>0) return;
  const dx=wx-e.x,dy=wy-e.y,d=Math.hypot(dx,dy)||1,m=Math.min(d,9*T*rangeK(e));
  e[kind]--; e.cd.gad=.5; e.swing=.15; e.swingMax=.15;
  bombs.push({x:e.x,y:e.y,tx:e.x+dx/d*m,ty:e.y+dy/d*m,fuse:1.7,team:e.team,owner:e,kind,h:20});
}
function useShield(e){ // « Rempart d'île » : érige un mur autour de l'île avec les meilleurs blocs disponibles
  if(e.shield<=0||e.cd.gad>0) return;
  if(e.isBot&&totalBlocks(e)<36) return;
  if(!buildRampart(e)) return;
  e.shield--; e.cd.gad=.8;
}
function useJet(e){
  if(e.jet<=0||e.jetT>0||e.cd.gad>0) return;
  e.jet--; e.jetT=4; e.cd.gad=.5; ring(e.x,e.y,T,'#fb923c',.3);
}
function useGrapple(e){
  if(e.grap<=0||e.cd.gad>0||e.hook) return;
  e.grap--; e.cd.gad=.9;
  e.hook={x:e.x,y:e.y,ang:e.ang,len:0,max:11*T,sawVoid:false,owner:e};
  hooks.push(e.hook);
}
function jump(e,power){
  if(e.plume>0&&e.z>groundH(e)+3&&e.vz<=140&&!e.pull&&e.bubble<=0&&e.frozen<=0&&!e.riding&&e.alive){ e.plume--; e.vz=320; e.squash=-.3; sfx('jump',e.x,e.y); burst(e.x,e.y+6-e.z,'#bbf7d0',8,90,.5,3); ring(e.x,e.y+8-e.z,T*.7,'#4ade80',.25); floatTxt(e.x,e.y-40,'×'+e.plume,'#4ade80',13); return; }
  if(e.bubble>0||e.root>0||e.z>groundH(e)+1||e.vz>0||e.pull||e.frozen>0||e.riding) return;
  if(fl(Math.floor(e.x/T),Math.floor(e.y/T))===0&&e.jetT<=0){ if(e.waterJumps>=1) return; e.waterJumps=(e.waterJumps||0)+1; } // un seul saut de rattrapage au-dessus de l'eau
  sfx('jump',e.x,e.y); e.vz=Math.sqrt(Math.pow((power||(e.springT>0?540:320))*cv(e,'jump')*(e.relics&&e.relics.r_feather?1.1:1),2)+56000*(e.up.jmp||0)); // chaque niveau : +1 bloc de hauteur de saut e.squash=-.5; burst(e.x,e.y+6-e.z,'#e5e7eb',6,70,.3,3);
}
function useGadget(e,id,wx,wy){
  if(e.cd.gad>0) return false;
  const P=PERM[id];
  if(P){ if(!e.own[id]&&(e.am[id]||0)<=0) return false; if((e.pcd[id]||0)>0){ if(e===player) floatTxt(e.x,e.y-34,'Recharge : '+Math.ceil(e.pcd[id])+' s','#cbd5e1',13); return false; } }
  else if((e.am[id]||0)<=0) return false;
  const ax=Math.cos(e.ang),ay=Math.sin(e.ang);
  switch(id){
    case 'dash':
      e.vx+=ax*950; e.vy+=ay*950; e.grace=Math.max(e.grace,.4); e.swing=.2;
      for(let i=0;i<10;i++) parts.push({x:e.x-ax*i*4,y:e.y-ay*i*4,vx:0,vy:0,life:.3,max:.3,col:'#e0f2fe',size:6-i*.4});
      break;
    case 'trampo':{
      const tx=Math.floor(wx/T),ty=Math.floor(wy/T);
      if(fl(tx,ty)===0||wl(tx,ty)>0||Math.hypot((tx+.5)*T-e.x,(ty+.5)*T-e.y)>3.7*T) return false;
      traps.push({kind:'trampo',x:(tx+.5)*T,y:(ty+.5)*T,t:1e6,hp:8,age:0,team:e.team,anim:0});
      ring((tx+.5)*T,(ty+.5)*T,T,'#f472b6',.3); break;}
    case 'mine':
      traps.push({kind:'mine',x:e.x,y:e.y,t:1e6,hp:4,age:0,team:e.team,owner:e}); break;
    case 'banana':{
      const tx=Math.floor(wx/T),ty=Math.floor(wy/T);
      if(fl(tx,ty)===0||wl(tx,ty)>0||Math.hypot((tx+.5)*T-e.x,(ty+.5)*T-e.y)>3.7*T) return false;
      traps.push({kind:'banana',x:(tx+.5)*T,y:(ty+.5)*T,t:1e6,hp:3,age:0,team:e.team,owner:e}); break;}
    case 'chicken':{
      chickens.push({x:e.x,y:e.y,vx:ax*220,vy:ay*220,team:e.team,owner:e,t:7,ph:0,arm:.5}); break;}
    case 'guard':{
      for(let k=0;k<2;k++) guards.push({x:e.x+rnd(-18,18),y:e.y+rnd(-18,18),team:e.team,owner:e,hp:18,t:1e6,cd:.5,vx:0,vy:0,ph:rnd(0,6),ang:e.ang});
      ring(e.x,e.y,T*1.6,'#fff',.4,true); burst(e.x,e.y,'#fff',14,160,.5,4); break;}
    case 'repair':{
      const td=TD[e.team],ci=idx(td.bx,td.by); if(!td.coreAlive||hpW[ci]>=BHP[CORE]-.5) return false;
      if(Math.hypot((td.bx+.5)*T-e.x,(td.by+.5)*T-e.y)>3.4*T){ floatTxt(e.x,e.y-34,'Va près de ton coffre pour le réparer','#fde68a',14); return false; }
      if(e.repairCh) return false; e.repairCh={t:0,dur:4.5,hp0:e.hp,tot:Math.max(16,BHP[CORE]*.35)}; ring((td.bx+.5)*T,(td.by+.5)*T,T*2.2,'#86efac',.5,true); floatTxt(e.x,e.y-44,'🔧 Réparation… reste près du coffre','#86efac',14); break;}
    case 'turret2':{
      const tx=Math.floor(wx/T),ty=Math.floor(wy/T);
      if(fl(tx,ty)===0||wl(tx,ty)>0||Math.hypot((tx+.5)*T-e.x,(ty+.5)*T-e.y)>3.7*T) return false;
      traps.push({kind:'turret',ice:true,x:(tx+.5)*T,y:(ty+.5)*T,t:1e6,hp:14,age:0,team:e.team,owner:e,cd:.8,ang:0});
      ring((tx+.5)*T,(ty+.5)*T,T,'#7dd3fc',.3); break;}
    case 'tp':{
      const d=Math.min(Math.hypot(wx-e.x,wy-e.y),10*T);
      pearls.push({x:e.x,y:e.y,tx:e.x+ax*d,ty:e.y+ay*d,owner:e,t:0}); break;}
    case 'bridge':{
      let n=0; const L=bridgeLine(e,ax,ay,8);
      for(let k=0;k<L.length;k++){ const [tx,ty]=L[k], i=idx(tx,ty);
        if(floorT[i]===0){ floorT[i]=2; hpF[i]=BHP[2]; ownF[i]=e.team; pop[i]=1+k*.08; n++; }
      }
      if(!n) return false; burst(e.x,e.y,'#fde047',10,140,.4,3); break;}
    case 'turret':{
      const tx=Math.floor(wx/T),ty=Math.floor(wy/T);
      if(fl(tx,ty)===0||wl(tx,ty)>0||Math.hypot((tx+.5)*T-e.x,(ty+.5)*T-e.y)>3.7*T) return false;
      traps.push({kind:'turret',x:(tx+.5)*T,y:(ty+.5)*T,t:1e6,hp:14,age:0,team:e.team,owner:e,cd:.6,ang:0});
      ring((tx+.5)*T,(ty+.5)*T,T,'#94a3b8',.3); break;}
    case 'vortex':{
      const dx=wx-e.x,dy=wy-e.y,d=Math.hypot(dx,dy)||1,m=Math.min(d,9*T);
      traps.push({kind:'vortex',x:e.x+dx/d*m,y:e.y+dy/d*m,t:3.5,age:0,team:e.team,owner:e}); break;}
    case 'springs': e.springT=25; floatTxt(e.x,e.y-34,'SUPER SAUT !','#4ade80',15); burst(e.x,e.y,'#4ade80',12,140,.5,3); break;
    case 'cloak': for(const m of ents){ if(!m.alive||m.team!==e.team) continue; m.cloak=Math.max(m.cloak,7); m.haste=Math.max(m.haste,2.5); floatTxt(m.x,m.y-34,'INVISIBLE','#e5e7eb',15); burst(m.x,m.y,'#e5e7eb',14,140,.5,3); smoke(m.x,m.y,8,10,1.2); } break;
    case 'haste': e.haste=8; floatTxt(e.x,e.y-34,'VITESSE !','#38bdf8',15); burst(e.x,e.y,'#38bdf8',14,160,.5,3); break;
    case 'wallgad':{ if(!placeHerse(e,wx,wy,ax,ay)) return false; break;}
    case 'storm':{
      const dx=wx-e.x,dy=wy-e.y,d=Math.hypot(dx,dy)||1,m=Math.min(d,10*T),tx=e.x+dx/d*m,ty=e.y+dy/d*m;
      bombs.push({x:tx,y:ty,tx,ty,fuse:1,team:e.team,owner:e,kind:'bomb',R:1.7*T,dm:9,bd:.8,bolt:true,h:0}); break;}
    case 'cluster':{
      const dx=wx-e.x,dy=wy-e.y,d=Math.hypot(dx,dy)||1,m=Math.min(d,9*T);
      bombs.push({x:e.x,y:e.y,tx:e.x+dx/d*m,ty:e.y+dy/d*m,fuse:1.1,team:e.team,owner:e,kind:'cluster',h:20}); break;}
    case 'flag': traps.push({kind:'flag',x:e.x,y:e.y,t:1e6,hp:10,age:0,team:e.team,owner:e}); ring(e.x,e.y,T*4,'#111827',.5,true); ring(e.x,e.y,T*4,'#fde68a',.7); break;
    case 'anchor':{
      const dx=wx-e.x,dy=wy-e.y,d=Math.hypot(dx,dy)||1,m=Math.min(d,8*T);
      bombs.push({x:e.x+dx/d*m,y:e.y+dy/d*m,tx:e.x+dx/d*m,ty:e.y+dy/d*m,fuse:.8,team:e.team,owner:e,kind:'anchor',drop:true,h:0}); break;}
    case 'kraken':{
      const dx=wx-e.x,dy=wy-e.y,d=Math.hypot(dx,dy)||1,m=Math.min(d,9*T), tx=e.x+dx/d*m, ty=e.y+dy/d*m;
      if(fl(Math.floor(tx/T),Math.floor(ty/T))===0) return false;
      traps.push({kind:'kraken',x:tx,y:ty,t:6.5,age:0,team:e.team,owner:e,cd:.9,slam:0}); ring(tx,ty,T*2,'#34d399',.5,true); break;}
    case 'barrage':{
      const dx=wx-e.x,dy=wy-e.y,d=Math.hypot(dx,dy)||1,m=Math.min(d,10*T), tx=e.x+dx/d*m, ty=e.y+dy/d*m;
      for(let k=0;k<6;k++){ const x=tx+rnd(-2.4*T,2.4*T), y=ty+rnd(-2.4*T,2.4*T); bombs.push({x,y,tx:x,ty:y,fuse:.9+k*.3,team:e.team,owner:e,kind:'bomb',R:1.5*T,dm:7,bd:.75,shell:true,drop:true,h:0}); }
      break;}
    case 'net':{
      const tx=Math.floor(wx/T),ty=Math.floor(wy/T);
      if(fl(tx,ty)===0||wl(tx,ty)>0||Math.hypot((tx+.5)*T-e.x,(ty+.5)*T-e.y)>3.7*T) return false;
      traps.push({kind:'net',x:(tx+.5)*T,y:(ty+.5)*T,t:1e6,hp:4,age:0,team:e.team,owner:e}); break;}
    case 'swap':{
      let best=null,bd=3.2*T; for(const o of ents){ if(!o.alive||o.team===e.team) continue; const d=Math.hypot(o.x-wx,o.y-wy); if(d<bd&&Math.hypot(o.x-e.x,o.y-e.y)<11*T){bd=d;best=o;} }
      if(!best) return false;
      const ox=best.x,oy=best.y,oz=best.z; ring(ox,oy,T*1.4,'#f472b6',.5,true); ring(e.x,e.y,T*1.4,'#f472b6',.5,true); burst(ox,oy,'#f9a8d4',14,160,.5,3); burst(e.x,e.y,'#f9a8d4',14,160,.5,3);
      best.x=e.x;best.y=e.y;best.z=e.z; e.x=ox;e.y=oy;e.z=oz; e.vx=e.vy=best.vx=best.vy=0; floatTxt(best.x,best.y-40,'ÉCHANGÉ !','#f9a8d4',16); best.lastSafe=null; e.lastSafe=null; break;}
    case 'frostnova':{
      ring(e.x,e.y,T*3.6,'#7dd3fc',.6,true); ring(e.x,e.y,T*2,'#fff',.4); burst(e.x,e.y,'#e0f2fe',26,230,.7,4);
      for(const o of ents){ if(!o.alive||o.team===e.team||Math.hypot(o.x-e.x,o.y-e.y)>3.6*T) continue; o.frozen=1.8; floatTxt(o.x,o.y-36,'GELÉ !','#7dd3fc',16); }
      break;}
    case 'decoy':
      guards.push({x:e.x+ax*20,y:e.y+ay*20,team:e.team,owner:e,hp:32,t:1e6,cd:.5,vx:0,vy:0,ph:rnd(0,6),ang:e.ang}); ring(e.x,e.y,T*1.4,'#a3e635',.4,true); burst(e.x,e.y,'#bef264',14,160,.5,4); break;
    case 'siren':{
      ring(e.x,e.y,T*6,'#c084fc',.8,true); ring(e.x,e.y,T*3,'#fff',.6); burst(e.x,e.y,'#e9d5ff',24,200,.8,4);
      for(const o of ents){ if(!o.alive||o.team===e.team) continue; const d=Math.hypot(o.x-e.x,o.y-e.y); if(d>6*T) continue; o.slow=3.5; o.vx+=(e.x-o.x)/(d||1)*380; o.vy+=(e.y-o.y)/(d||1)*380; floatTxt(o.x,o.y-36,'ENVOÛTÉ','#e9d5ff',15); }
      break;}
    case 'quake':{
      ring(e.x,e.y,T*3.4,'#f97316',.5,true); ring(e.x,e.y,T*2,'#fde68a',.4); chunks(e.x,e.y,'#a16207',14); smoke(e.x,e.y,8,8,.9); shake=Math.max(shake,12);
      blastTiles(e.x,e.y,3.2*T,8,e,e.team);
      for(const o of ents){ if(!o.alive||o.team===e.team||Math.hypot(o.x-e.x,o.y-e.y)>3.4*T) continue; hurt(o,3,e,(o.x-e.x)*2.2,(o.y-e.y)*2.2); o.vz=380; }
      break;}
    case 'aegis': if(!nearBase(e)){ floatTxt(e.x,e.y-36,'Utilisable seulement dans ta base','#fde68a',14); return false; } e.aegis=5; floatTxt(e.x,e.y-36,'INVULNÉRABLE','#fde047',15); ring(e.x,e.y,T*1.6,'#fde047',.5,true); burst(e.x,e.y,'#fde047',16,170,.6,3); break;
    case 'coco':{
      const dx=wx-e.x,dy=wy-e.y,d=Math.hypot(dx,dy)||1,m=Math.min(d,8*T);
      bombs.push({x:e.x,y:e.y,tx:e.x+dx/d*m,ty:e.y+dy/d*m,fuse:.95,team:e.team,owner:e,kind:'bomb',R:1.35*T,dm:6,bd:.7,shell:true,h:12}); break;}
    case 'buoy': floatTxt(e.x,e.y-40,'Passif : te repêche en mer','#fb923c',14); return false;
    case 'heal':
      if(!e.isBot) return false; // joueurs : maintiens le clic (régénération progressive, voir rework10.js)
      if(e.hp>=maxhp(e)-.5) return false;
      e.hp=Math.min(maxhp(e),e.hp+12); floatTxt(e.x,e.y-34,'+12 ♥','#4ade80',16);
      for(let i=0;i<8;i++) parts.push({x:e.x+rnd(-10,10),y:e.y,z:rnd(0,10),vz:rnd(60,120),vx:0,vy:0,life:.8,max:.8,col:'#4ade80',size:4});
      break;
    default: if(!useGadget2(e,id,wx,wy,ax,ay)) return false; break;
  }
  if(P){ if(!(id==='recall'&&e.recall)) e.pcd[id]=P.cd; } else e.am[id]--; e.cd.gad=.5*cv(e,'gcd'); sfx('gadget',e.x,e.y); return true;
}
function blastTiles(cx,cy,R,dmg,src,team){
  for(let ty=Math.floor((cy-R)/T);ty<=Math.floor((cy+R)/T);ty++)for(let tx=Math.floor((cx-R)/T);tx<=Math.floor((cx+R)/T);tx++){
    if(!inb(tx,ty)) continue; const d=Math.hypot((tx+.5)*T-cx,(ty+.5)*T-cy); if(d>R||protectedTile(tx,ty,team)) continue;
    const i=idx(tx,ty), k=dmg*(1-d/(R*1.1));
    if(wallT[i]>0){ if(wallT[i]===CORE&&(ownW[i]===team||team<0)) continue; damageTile(tx,ty,k,src,0); } else if(floorT[i]>=2) damageTile(tx,ty,k,src,1);
  }
}
function explode(b){
  const cx=b.x,cy=b.y; if(b.team!==undefined) hitTraps(b.team,cx,cy,(b.R||T),(b.dm||6));
  if(b.kind==='anchor'){
    const R=1.8*T; sfx('boom',cx,cy); ring(cx,cy,R,'#94a3b8',.45,true); ring(cx,cy,R*1.4,'#e2e8f0',.5); burst(cx,cy,'#cbd5e1',22,260,.6,4); chunks(cx,cy,'#6b7280',10); shake=Math.max(shake,10);
    blastTiles(cx,cy,R*.9,26,b.owner,b.team);
    for(const o of ents){ if(!o.alive||(o.team===b.team&&o!==b.owner)) continue; const dx=o.x-cx,dy=o.y-cy,d=Math.hypot(dx,dy); if(d>R||inShield(o.x,o.y,o.team)) continue; if(o===b.owner) continue; hurt(o,6,b.owner,dx/(d||1)*300,dy/(d||1)*300); o.root=1.6; floatTxt(o.x,o.y-40,'ASSOMMÉ !','#e2e8f0',15); }
    return;
  }
  if(b.kind==='cluster'){
    sfx('boom',cx,cy); ring(cx,cy,T*1.5,'#86efac',.35,true); burst(cx,cy,'#86efac',16,260,.5,3);
    for(let k=0;k<6;k++){ const a=k*Math.PI/3+rnd(-.3,.3), d=rnd(1.6,2.8)*T;
      bombs.push({x:cx,y:cy,tx:cx+Math.cos(a)*d,ty:cy+Math.sin(a)*d,fuse:.45+rnd(0,.35),team:b.team,owner:b.owner,kind:'bomb',R:1.4*T,dm:6,bd:.6,h:20}); }
    return;
  }
  if(b.bolt){ beams.push({x:cx,y:cy,t:0,col:'#e0f2fe'}); flashScreen('#e0f2fe',.35); ring(cx,cy,T*2.4,'#fde047',.4,true); }
  const R=b.R||(b.kind==='repel'?5.5*T:2.7*T); sfx(b.kind==='repel'?'whoosh':'boom',cx,cy);
  if(b.kind!=='repel'){
    ring(cx,cy,R,'#ffb347',.45); ring(cx,cy,R*.7,'#fff3c4',.3,true); ring(cx,cy,R*.5,'#f97316',.4,true);
    burst(cx,cy,'#ff9f43',28,300,.7,4); burst(cx,cy,'#fde047',14,380,.4,3); smoke(cx,cy,10,9,1.2);
    shake=Math.max(shake,Math.min(12,R/8)); flashScreen('#ffedd5',Math.min(.3,.9*(1-Math.min(1,dist({x:cx,y:cy},player)/(8*T)))));
    const t0x=Math.floor((cx-R)/T),t1x=Math.floor((cx+R)/T),t0y=Math.floor((cy-R)/T),t1y=Math.floor((cy+R)/T);
    for(let ty=t0y;ty<=t1y;ty++)for(let tx=t0x;tx<=t1x;tx++){
      if(!inb(tx,ty)) continue;
      const d=Math.hypot((tx+.5)*T-cx,(ty+.5)*T-cy); if(d>R) continue;
      if(protectedTile(tx,ty,b.team)) continue;
      const dmg=50*(b.bd||1)*(1-d/(R*1.05)), i=idx(tx,ty); // explosions : un peu plus destructrices pour les blocs
      if(wallT[i]>0){
        if(wallT[i]===CORE&&(ownW[i]===b.team||b.team<0)) continue;
        damageTile(tx,ty,dmg,b.owner,0);
      } else if(floorT[i]>=2) damageTile(tx,ty,dmg,b.owner,1);
    }
    hitGuards(b.owner,cx,cy,R,1.5*(b.dm||10)); hitBoats(cx,cy,R,1.5*(b.dm||10),b.team);
    for(const o of ents){
      if(!o.alive||(o.team===b.team&&o!==b.owner)) continue;
      const dx=o.x-cx,dy=o.y-cy,d=Math.hypot(dx,dy); if(d>R*1.25) continue;
      if(inShield(o.x,o.y,o.team)) continue;
      const k=1-d/(R*1.7), u=d||1; // chute de dégâts plus douce avec la distance
      hurt(o,(o===b.owner?.5:1)*(b.dm||10)*1.3*k,b.owner,dx/u*520*k,dy/u*520*k); // explosifs : un peu moins dangereux pour les pirates
      o.vz=Math.max(o.vz,180*k);
    }
  } else {
    ring(cx,cy,R,'#a78bfa',.5); ring(cx,cy,R*.5,'#c4b5fd',.35); ring(cx,cy,R*.3,'#ede9fe',.3,true); burst(cx,cy,'#c4b5fd',24,320,.6,3);
    shake=Math.max(shake,6);
    for(const o of ents){
      if(!o.alive) continue;
      const dx=o.x-cx,dy=o.y-cy,d=Math.hypot(dx,dy); if(d>R) continue;
      const k=1-d/R, u=d||1, a=d<1?rnd(0,6.28):0;
      const nx=d<1?Math.cos(a):dx/u, ny=d<1?Math.sin(a):dy/u;
      if(o.inv>0) continue;
      o.vx+=nx*(950*k+200); o.vy+=ny*(950*k+200); o.vz=Math.max(o.vz,200); o.lastBy=b.owner; o.lastByT=5;
    }
    for(const p of projs){ if(Math.hypot(p.x-cx,p.y-cy)<R) p.life=0; }
  }
}
function nearestShieldBlocking(x,y,team){
  for(const s of shields) if(s.team!==team&&Math.hypot(x-s.x,y-s.y)<s.r) return s; return null;
}

/* =====================  BOUTIQUE  ===================== */
function mk(id,cat,info,buy){return {id,cat,info,buy};}
function upItem(id,name,max,costs,txt,extra){
  return mk(id,'Base',e=>{
    const l=e.up[id];
    if(l>=max) return {name:`${name} (niv. ${l}/${max})`,desc:'Niveau maximum atteint',cost:{},ok:false,tag:'MAX'};
    return {name:`${name} → niv. ${l+1}`,desc:txt[l],cost:{diamond:costs[l]}};
  },e=>{e.up[id]++; if(extra) extra(e);});
}
function gunItem(id,name,desc,cost){
  const g=GUNS[id], stat=`Chargeur ${g.mag} · recharge ${g.reload.toFixed(1)} s`;
  return mk(id,'Armes',e=>e.own[id]?{name,desc:'Déjà possédé',cost:{},ok:false,tag:'OK'}:{name,desc:desc+' '+stat,cost},e=>{e.own[id]=true;});
}
function gadItem(id,name,desc,cost,n,cat){
  return mk(id,cat||'Gadgets',e=>({name:`${name} ×${n}`,desc,cost}),e=>{e.am[id]=(e.am[id]||0)+n;});
}
function bridgeLine(e,ax,ay,n){ // cases visées dans n'importe quelle direction (pas seulement les 4 axes) : on suit la ligne vers le curseur
  const a=Math.atan2(ay,ax), out=[], seen=new Set(); for(let k=1;k<=n*1.6&&out.length<n;k++){ const tx=Math.floor((e.x+Math.cos(a)*k*T*.62)/T), ty=Math.floor((e.y+Math.sin(a)*k*T*.62)/T); if(!inb(tx,ty)) break; const i=idx(tx,ty); if(seen.has(i)) continue; seen.add(i);
    if(tx===Math.floor(e.x/T)&&ty===Math.floor(e.y/T)) continue; if(wl(tx,ty)>0) break; out.push([tx,ty]); } return out; }
function wallRing(e){
  const td=TD[e.team];
  for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
    if(!dx&&!dy) continue;
    const tx=td.bx+dx,ty=td.by+dy,i=idx(tx,ty);
    if(floorT[i]===0||wallT[i]>0||wallBlockedByEnt((tx+.5)*T,(ty+.5)*T)) continue;
    wallT[i]=OBS; hpW[i]=BHP[OBS]; ownW[i]=e.team; pop[i]=1;
    burst((tx+.5)*T,(ty+.5)*T,'#8b5cf6',5,90,.4,3);
  }
}
const SHOP=[
  mk('wool','Blocs',e=>({name:'Bois ×5',desc:'Planches : le bloc de base, peu résistant mais pas cher. Il brûle !',cost:{bronze:6}}),e=>e.blocks[2]+=5),
  mk('wood','Blocs',e=>({name:'Grès ×3',desc:'Résistance moyenne, ne brûle pas.',cost:{silver:4}}),e=>e.blocks[3]+=3),
  mk('stone','Blocs',e=>({name:'Grès taillé ×3',desc:'Solide. Résiste à une bombe.',cost:{silver:8}}),e=>e.blocks[4]+=3),
  mk('obs','Blocs',e=>({name:'Obsidienne ×1',desc:'Très solide : 2 bombes pour la casser.',cost:{gold:3}}),e=>e.blocks[5]+=1),
  mk('coral','Blocs',e=>({name:'Grès rouge ×3',desc:'Assez solide (16 PV) et pas cher.',cost:{silver:5}}),e=>e.blocks[7]+=3),
  mk('iceblk','Blocs',e=>({name:'Glace ×5',desc:'Bloc translucide, très bon marché : parfait pour bâtir vite (7 PV).',cost:{bronze:6}}),e=>e.blocks[8]+=5),
  mk('sword','Combat',e=>{
    const t=e.sword; if(t>=3) return {name:SWORDS[3].n,desc:'Niveau maximum',cost:{},ok:false,tag:'MAX'};
    return {name:SWORDS[t+1].n,desc:`Dégâts ${SWORDS[t+1].d} (actuel ${SWORDS[t].d})`,cost:SWORD_COST[t+1]};
  },e=>e.sword++),
  mk('glove','Combat',e=>e.own.glove?{name:'Crochet de fer',desc:'Déjà possédé',cost:{},ok:false,tag:'OK'}:{name:'Crochet de fer',desc:'Dégâts faibles mais propulse l\'ennemi très loin (dans le vide !).',cost:{silver:8}},e=>{e.own.glove=true;}),
  mk('hammer','Combat',e=>e.own.hammer?{name:'Masse de forgeron',desc:'Déjà possédé',cost:{},ok:false,tag:'OK'}:{name:'Masse de forgeron',desc:'Onde de choc : projette en l\'air, casse les blocs proches.',cost:{silver:14}},e=>{e.own.hammer=true;}),
  mk('baa','Combat',e=>e.own.baa?{name:'Corne de brume',desc:'Déjà possédé',cost:{},ok:false,tag:'OK'}:{name:'Corne de brume',desc:'Souffle en cône : repousse les ennemis et dévie les tirs. Illimité.',cost:{silver:12}},e=>{e.own.baa=true;}),
  mk('heal','Combat',e=>({name:'Ration de bord ×1',desc:'Soigne 12 PV instantanément.',cost:{bronze:25}}),e=>{e.am.heal=(e.am.heal||0)+1;}),
  gunItem('bow','Arbalète','Flèche puissante, dégâts 5.',{silver:8}),
  gunItem('gun','Pistolet à silex','Tir rapide, précis au début mais la dispersion augmente en rafale.',{silver:10}),
  gunItem('smg','Pistolets jumeaux','Rafale très rapide, le spray s\'élargit vite.',{silver:16}),
  gunItem('shotgun','Tromblon','8 plombs en éventail, recul énorme.',{silver:14}),
  gunItem('sniper','Mousquet long','Tir perçant ultra précis, imprécis en courant. 11 dégâts.',{gold:3}),
  gunItem('rocket','Canon de poche','Roquette explosive qui détruit les blocs.',{gold:4}),
  gunItem('woolgun','Lance-filet','Filet qui emmêle et ralentit l\'ennemi.',{silver:12}),
  gunItem('boomerang','Hache de lancer','Part, touche, revient et retouche.',{silver:12}),
  gunItem('bubble','Lance-écume','Enferme l\'ennemi dans une bulle qui flotte 2 s.',{silver:14}),
  gunItem('ice','Harpon givré','Harpon glacé : gèle l\'ennemi sur place 1,6 s.',{silver:12}),
  gunItem('flame','Torche cracheuse','Jet de flammes continu, courte portée.',{gold:3}),
  mk('pick','Outils',e=>{
    const t=e.pick; if(t>=3) return {name:PICKS[3].n,desc:'Niveau maximum',cost:{},ok:false,tag:'MAX'};
    return {name:PICKS[t+1].n,desc:`Casse plus vite : dégâts ${PICKS[t+1].d} (actuel ${PICKS[t].d})`,cost:PICK_COST[t+1]};
  },e=>e.pick++),
  mk('grap','Gadgets',e=>({name:'Grappin d\'abordage ×3',desc:'Accroche un bloc ou un ennemi et te tire (portée 11 cases).',cost:{silver:8}}),e=>e.grap+=3),
  mk('jet','Gadgets',e=>({name:'Perroquet porteur ×1',desc:'Vol stationnaire 4 s : traverse la mer.',cost:{gold:2}}),e=>e.jet+=1),
  gadItem('dash','Élan du flibustier','Fonce en avant, sans tomber pendant l\'élan.',{bronze:25},3),
  gadItem('trampo','Trampoline (hamac)','Pose un trampoline qui te propulse très haut.',{silver:6},2),
  gadItem('tp','Boussole ensorcelée','Lance-la : tu te téléportes là où elle tombe.',{gold:1},1),
  gadItem('bridge','Planche d\'abordage','Construit instantanément 8 blocs de pont devant toi.',{silver:10},1),
  mk('bomb','Gadgets',e=>({name:'Baril de poudre ×1',desc:'Explose après 1,7 s. Détruit blocs et ponts.',cost:{silver:6}}),e=>e.bomb+=1),
  mk('repel','Gadgets',e=>({name:'Vague scélérate ×1',desc:'Projette tout le monde loin (dans le vide !).',cost:{silver:5}}),e=>e.repel+=1),
  gadItem('turret','Canon de pont','Tire seul sur les ennemis proches jusqu\'à ce qu\'il soit détruit.',{silver:14},1,'Défense'),
  gadItem('turret2','Canon givrant','Gèle brièvement les ennemis proches jusqu\'à ce qu\'il soit détruit.',{silver:16},1,'Défense'),
  gadItem('guard','Matelots mercenaires','Deux matelots mercenaires (18 PV chacun) se battent pour toi pendant 45 s.',{silver:14},1,'Défense'),
  gadItem('repair','Réparation du coffre','Répare ton coffre en 4,5 s (reste près de lui, sans te faire toucher) : jusqu\'à +35 % de sa vie.',{silver:8},1,'Défense'),
  gadItem('vortex','Maelström','Aspire les ennemis vers son centre pendant 3,5 s.',{gold:2},1),
  gadItem('springs','Bottes de mousse','Sauts très hauts 25 s, et l\'atterrissage fait mal.',{silver:8},1),
  gadItem('cloak','Brume magique','Toi et ton équipe devenez invisibles 7 s et courez plus vite 2,5 s : les ennemis ne vous voient plus de loin.',{silver:10},1),
  gadItem('haste','Rhum de contrebande','+50 % de vitesse pendant 8 s.',{bronze:30},1),
  gadItem('wallgad','Palissade','Dresse une palissade de 3 planches en un clic.',{silver:7},2,'Défense'),
  gadItem('storm','Orage','La foudre frappe la zone visée après 1 s.',{gold:2},2),
  gadItem('cluster','Baril à grappes','Explose en 6 mini-bombes.',{silver:10},1),
  gadItem('flag','Pavillon noir','Zone 12 s : tes alliés se soignent et vont plus vite, les ennemis sont ralentis.',{silver:12},1,'Défense'),
  gadItem('anchor','Ancre','Jette une ancre : dégâts, assomme 1,6 s et brise les blocs.',{silver:12},2),
  gadItem('buoy','Bouée de sauvetage','Passif : te repêche une fois si tu tombes à la mer.',{silver:10},1,'Défense'),
  gadItem('kraken','Tentacule du kraken','Un tentacule frappe la zone visée pendant 6 s.',{gold:2},1),
  gadItem('barrage','Salve de canons','6 boulets pleuvent sur la zone visée.',{gold:3},1),
  gadItem('net','Filet piégé','Piège : immobilise 2 s l\'ennemi qui marche dessus.',{bronze:25},2,'Défense'),
  gadItem('mine','Mine marine','Se pose à tes pieds, explose au passage d\'un ennemi.',{silver:6},2,'Défense'),
  gadItem('banana','Peau de banane','Fait déraper et tourner l\'ennemi qui marche dessus.',{bronze:20},2,'Défense'),
  gadItem('chicken','Crabe kamikaze','Un crabe court vers l\'ennemi le plus proche et explose.',{silver:9},1),
  gunItem('trident','Trident de Poséidon','Trois dents perçantes en éventail, redoutable de près.',{silver:18}),
  gunItem('gatling','Poivrière rotative','Chargeur de 90, rafale folle, le spray s\'ouvre vite.',{gold:4}),
  gunItem('javelin','Javelot de chasse','Deux lancers perçants très puissants.',{silver:16}),
  gunItem('flarebow','Arc incendiaire','Flèches de feu : l\'ennemi brûle plusieurs secondes.',{gold:3}),
  gadItem('swap','Singe farceur','Échange ta place avec l\'ennemi visé (11 cases). Idéal au bord du vide !',{gold:2},1),
  gadItem('frostnova','Souffle du spectre','Gèle tous les ennemis autour de toi pendant 1,8 s.',{gold:2},1),
  gadItem('decoy','Matelot mercenaire','Un costaud (32 PV) se bat pour toi pendant 30 s.',{silver:12},1,'Défense'),
  gadItem('siren','Chant des sirènes','Attire et ralentit les ennemis dans un grand rayon.',{silver:14},1),
  gadItem('quake','Séisme','Secoue le sol : blocs brisés, ennemis projetés en l\'air.',{gold:2},1),
  gadItem('aegis','Médaillon doré','Invulnérable pendant 5 s, mais uniquement dans ta base : parfait pour défendre ton coffre.',{gold:3},1,'Défense'),
  gadItem('coco','Noix de coco explosive','Lancer en cloche, petite explosion.',{bronze:30},3),
  mk('shield','Défense',e=>({name:'Bouclier de brume ×1',desc:'Dôme 12 s : bloque ennemis, flèches et bombes.',cost:{gold:2}}),e=>e.shield+=1),
  upItem('fb','Forge de bronze',3,[3,5,8],['Bronze toutes les 0,7 s','Bronze toutes les 0,5 s','Bronze toutes les 0,35 s']),
  upItem('fs','Forge d\'argent',3,[3,5,8],['Argent toutes les 3,8 s','Argent toutes les 2,8 s','Argent toutes les 2 s']),
  upItem('hp','Vitalité',3,[3,5,8],['+6 PV max','+6 PV max','+6 PV max'],e=>{e.hp+=6;}),
  upItem('sp','Agilité',3,[3,5,8],['+8% vitesse','+8% vitesse','+8% vitesse']),
  upItem('ar','Armure',3,[3,5,8],['-12% dégâts','-12% dégâts','-12% dégâts']),
  upItem('core','Blindage du coffre',3,[4,6,9],['Le coffre au trésor subit -20% de dégâts','-35% de dégâts','-50% de dégâts'],null),
  upItem('jmp','Ressorts aux bottes',3,[3,5,8],['Tu sautes 1 bloc de plus','Tu sautes 2 blocs de plus · plus aucun dégât de chute','Tu sautes 3 blocs de plus · plus aucun dégât de chute']),
  upItem('reg','Régénération',3,[3,5,8],['Soin plus rapide : +0,5 PV/s, délai −1,1 s','+1 PV/s, délai −2,2 s','+1,5 PV/s, délai −3,3 s']),
  upItem('vamp','Vampirisme',3,[4,6,9],['Tu récupères 8 % des dégâts infligés','16 % des dégâts infligés','24 % des dégâts infligés']),
  upItem('rel','Rechargement express',3,[3,5,8],['Recharge des armes −12 %','−24 %','−36 %']),
  upItem('dmg','Force du capitaine',3,[4,6,9],['+8 % de dégâts infligés','+16 % de dégâts infligés','+24 % de dégâts infligés']),
  upItem('loot','Poches profondes',3,[3,5,8],['+15 % de ressources ramassées','+30 %','+45 %']),
  upItem('dia','Forge de diamants',3,[5,8,12],['Ta base produit un diamant toutes les 45 s','…toutes les 26 s','…toutes les 15 s']),
  upItem('gold','Forge d\'or',2,[6,12],['Ta base produit de l\'or (1 / 14 s)','L\'or arrive plus vite (1 / 8 s)']),
  mk('wall','Défense',e=>({name:'Mur d\'obsidienne',desc:'Entoure ton coffre au trésor d\'obsidienne.',cost:{diamond:5}}),e=>wallRing(e))
];
SHOP.find(i=>i.id==='core').cat='Défense';
const SHOPMAP={}; SHOP.forEach(s=>SHOPMAP[s.id]=s);
function canAfford(e,c){for(const k in c) if(e.res[k]<c[k]) return false; return true;}
function buy(e,id){
  const it=SHOPMAP[id]; if(!it||!inRoster(id)) return false;
  const inf=it.info(e); if(inf.ok===false) return false;
  if(!canAfford(e,inf.cost)) return false;
  for(const k in inf.cost) e.res[k]-=inf.cost[k];
  it.buy(e); return true;
}
const nearBase=e=>{const td=TD[e.team];return Math.hypot(e.x-(td.bx+.5)*T,e.y-(td.by+.5)*T)<9*T;};
const nearShop=e=>nearBase(e)||TD.some(td=>td.id!==e.team&&teamElim(td.id)&&Math.hypot(e.x-(td.bx+.5)*T,e.y-(td.by+.5)*T)<9*T); // la boutique d'une équipe éliminée est ouverte à tous

/* UI boutique */
const shopEl=document.getElementById('shop'); let shopOpen=false, shopTab='Blocs';
const TABS=['Blocs','Combat','Armes','Outils','Gadgets','Défense','Base'];
function costHtml(c){return Object.keys(c).map(k=>`<span style="color:${RESCOL[k]}"><img class="ri" src="${ICON[k]}"> ${c[k]}</span>`).join('&nbsp;&nbsp;')||'—';}
function shopIco(id){
  if(ITEMMAP[id]) return ITEMMAP[id].ico;
  return {wool:'🧶',wood:'🪵',stone:'🪨',obs:'🟣',fb:'⚒️',fs:'⚒️',hp:'❤️',sp:'👟',ar:'🛡️',gold:'🪙',wall:'🏯',core:'🐑'}[id]||'🎁';
}
function renderShop(){
  if(!shopOpen) return;
  const e=player, sc=shopEl.scrollTop;
  let h=`<div class="top"><h2>Boutique${typeof ROSTER!=='undefined'&&ROSTER?` <small style="font-size:13px;color:#d9c49a;font-family:Fredoka,sans-serif">roster aléatoire : ${ROSTER.size} objets</small>`:''}</h2><div class="res">${Object.keys(RESCOL).map(k=>`<span style="color:${RESCOL[k]}"><img class="ri" src="${ICON[k]}"> ${e.res[k]}</span>`).join('')}</div><span class="x" data-close="1">✕</span></div>`;
  h+='<div class="tabs">'+TABS.map(t=>`<div class="tab ${t===shopTab?'on':''}" data-tab="${t}">${t==='Base'?'Améliorations (diamants)':t}</div>`).join('')+'</div><div class="grid">';
  for(const it of SHOP.filter(s=>s.cat===shopTab&&inRoster(s.id))){
    const inf=it.info(e), can=inf.ok!==false&&canAfford(e,inf.cost);
    const c0=Object.keys(inf.cost)[0], bcol=c0?RESCOL[c0]:'#33407a';
    h+=`<div class="item ${can?'':'no'}" data-buy="${it.id}" style="border-left-color:${bcol}"><div class="ic">${shopIco(it.id)}</div><div class="n">${inf.name}${inf.tag?` <small style="color:#9fb0e0">[${inf.tag}]</small>`:''}</div><div class="d">${inf.desc}</div><div class="c">${costHtml(inf.cost)}</div></div>`;
  }
  shopEl.innerHTML=h+'</div>'; shopEl.scrollTop=sc;
}
function toggleShop(force){
  if(game.state!=='play') return;
  const want=force!==undefined?force:!shopOpen;
  if(want&&!nearShop(player)){floatTxt(player.x,player.y-34,'Retourne à ta base !','#fbbf24',15);return;}
  if(want&&!player.alive) return;
  shopOpen=want; shopEl.classList.toggle('hidden',!shopOpen); document.body.classList.toggle('shop',shopOpen); sfx('ui'); renderShop();
}
shopEl.addEventListener('mousedown',ev=>{
  ev.stopPropagation();
  const t=ev.target.closest('[data-tab],[data-buy],[data-close]'); if(!t) return;
  if(t.dataset.close) toggleShop(false);
  else if(t.dataset.tab){shopTab=t.dataset.tab;renderShop();}
  else if(t.dataset.buy){
    if(typeof NETCLIENT!=='undefined'&&NETCLIENT){ netSend({t:'buy',id:t.dataset.buy}); sfx('buy'); renderShop(); return; }
    if(!buy(player,t.dataset.buy)) sfx('fail'); else { sfx('buy'); ring(player.x,player.y,T*1.2,'#fde68a',.35); burst(player.x,player.y-10,'#fde68a',10,120,.5,3); floatTxt(player.x,player.y-40,'Acheté !','#fde68a',15); }
    renderShop();
  }
});

/* =====================  MISE À JOUR  ===================== */
function floorSupport(x,y){ // le corps déborde : on ne tombe que si plus aucun sol n'est sous les pieds (marge de 9 px)
  for(const [dx,dy] of [[0,0],[9,0],[-9,0],[0,9],[0,-9],[6,6],[-6,6],[6,-6],[-6,-6]]) if(fl(Math.floor((x+dx)/T),Math.floor((y+dy)/T))>0) return true;
  return false;
}
function updateEnt(e,dt){
  if(e.alive) updateWeapons(e,dt);
  if(!e.alive){
    if(!e.elim&&e.resp>0){ e.resp-=dt; if(e.resp<=0){ if(TD[e.team].coreAlive){spawnEnt(e);} else {e.elim=true;msg(`${e.name} est éliminé définitivement !`,'#ff9b9b');checkOver();} } }
    return;
  }
  for(const k in e.cd) e.cd[k]=Math.max(0,e.cd[k]-dt);
  e.inv=Math.max(0,e.inv-dt); if(e.aegis>0){ e.aegis-=dt; if(Math.random()<dt*10) burst(e.x,e.y-e.z,'#fde047',2,70,.4,3); } e.flash=Math.max(0,e.flash-dt); e.jetT=Math.max(0,e.jetT-dt);
  e.grace=Math.max(0,e.grace-dt); e.swing=Math.max(0,e.swing-dt); e.lastByT-=dt; e.sinceHurt+=dt;
  if(e.bubble>0){ e.bubble-=dt; e.vx+=rnd(-1,1)*260*dt; e.vy+=rnd(-1,1)*260*dt-30*dt; if(e.bubble<=0){ ring(e.x,e.y-e.z,T*1.3,'#bfdbfe',.35,true); burst(e.x,e.y-e.z,'#e0f2fe',16,180,.5,3); } }
  e.slow=Math.max(0,e.slow-dt); e.root=Math.max(0,e.root-dt); e.flagBuff=Math.max(0,e.flagBuff-dt); e.cloak=Math.max(0,e.cloak-dt); e.haste=Math.max(0,e.haste-dt); e.springT=Math.max(0,e.springT-dt);
  e.frozen=Math.max(0,e.frozen-dt); e.muzzle=Math.max(0,e.muzzle-dt); e.squash*=Math.exp(-9*dt);
  if(e.burn>0){ e.burn-=dt; if(Math.random()<dt*10) parts.push({x:e.x+rnd(-6,6),y:e.y,z:rnd(0,10),vz:rnd(50,120),vx:0,vy:0,life:.4,max:.4,col:'#fb923c',size:4}); if(Math.random()<dt*4) hurt(e,.5,e.burnBy,0,0); }
  if(e.sinceHurt>5-1.1*(e.up.reg||0)&&e.hp<maxhp(e)) e.hp=Math.min(maxhp(e),e.hp+(.5+.5*(e.up.reg||0))*dt);
  unstick(e);
  // hauteur (saut)
  const gh=groundH(e);
  if(e.bubble>0){ e.vz=0; e.z+=(55-e.z)*Math.min(1,dt*4); }
  else if(e.z>gh||e.vz>0){
    e.vz-=1000*dt; { const gcl=e.flight>0?-42:-80; if(e.glide>0&&e.vz<gcl) e.vz=gcl; } e.z+=e.vz*dt;
    if(e.z<=gh&&e.vz<=0){ const imp=-e.vz; e.z=gh; e.vz=0;
      { const drop=(e.tkH||0)-gh; e.tkH=gh; if(drop>56&&!(e.glide>0)&&!(e.springT>0)&&!((e.up.jmp|0)>=2)&&!e.riding&&!(e.relics&&e.relics.r_feather)){ const fd=(drop-56)*.12; floatTxt(e.x,e.y-34,'AÏE !','#fca5a5',15); sfx('hit',e.x,e.y); e.fallDeath=true; hurt(e,fd,null,0,0); e.fallDeath=false; } } if(e.springT>0&&imp>380){ ring(e.x,e.y,T*2,'#4ade80',.4,true); shake=Math.max(shake,e===player?7:3); for(const o of ents) if(o.alive&&o.team!==e.team&&Math.hypot(o.x-e.x,o.y-e.y)<T*2) hurt(o,3,e,(o.x-e.x)*6,(o.y-e.y)*6); }
      if(imp>180){e.squash=Math.min(1,imp/550); burst(e.x,e.y+6-gh,'#e5e7eb',8,110,.35,3); ring(e.x,e.y+8-gh,T*.6,'#ffffff',.25);} }
  } else { e.z=gh; e.tkH=gh; }
  // mouvement
  if(e.riding){ e.vx=e.vy=0; e.z=0; }
  else if(e.pull){
    const p=e.pull; p.t+=dt; const dx=p.x-e.x,dy=p.y-e.y,d=Math.hypot(dx,dy);
    if(d<10||p.t>1.3){e.pull=null;e.grace=.9;}
    else{
      const s=Math.min(d,720*dt),ox=e.x,oy=e.y; moveEnt(e,dx/d*s,dy/d*s);
      if(Math.hypot(e.x-ox,e.y-oy)<s*.3){e.pull=null;e.grace=.9;}
    }
  } else {
    let ix=e.ix,iy=e.iy;
    if(e.frozen>0||e.bubble>0||e.root>0){ix=iy=0;}
    if(e.slip>0){ e.slip-=dt; ix=e.sdx; iy=e.sdy; e.ang+=dt*16; if(Math.random()<dt*12) parts.push({x:e.x,y:e.y-e.z-12,vx:rnd(-30,30),vy:-20,life:.5,max:.5,col:'#fde047',size:3}); }
    const sp=speedOf(e); const fo=e._follow; moveEnt(e,((fo?0:ix*sp)+e.vx)*dt,((fo?0:iy*sp)+e.vy)*dt);
    const f=Math.exp(-7*dt); e.vx*=f; e.vy*=f;
    if((ix||iy)&&e.z<=gh+1){
      e.stepPh+=dt*sp*.09; e.stepT-=dt;
      if(e.stepT<=0){e.stepT=.17; parts.push({x:e.x,y:e.y+8-gh,vx:rnd(-12,12),vy:rnd(-12,0),life:.35,max:.35,col:'rgba(255,255,255,.55)',size:3,smoke:true});}
    }
  }
  if(e.jetT>0&&Math.random()<.7) parts.push({x:e.x-Math.cos(e.ang)*6+rnd(-3,3),y:e.y+8,z:Math.max(0,e.z-4),vz:-60,vx:rnd(-30,30),vy:rnd(40,100),life:.35,max:.35,col:Math.random()<.5?'#fb923c':'#fde047',size:4});
  const fx=Math.floor(e.x/T),fy=Math.floor(e.y/T);
  if(fl(fx,fy)>0&&wl(fx,fy)===0&&e.z<=gh+1&&!e.pull) e.lastSafe={x:(fx+.5)*T,y:(fy+.5)*T};
  { // plafond de sécurité : impossible de rester plus de ~1,7 s sans sol (peu importe les sauts)
    const sup=floorSupport(e.x,e.y)||e.jetT>0||e.pull||e.grace>0||e.bubble>0||e.riding;
    if(sup){ e.supT=(e.supT||0)+dt; if(e.supT>.3) e.unsT=0; } else { e.supT=0; e.unsT=(e.unsT||0)+dt; if(e.unsT>2&&e.alive){ die(e,e.lastByT>0?e.lastBy:null,true); return; } }
  }
  if(!floorSupport(e.x,e.y)&&e.jetT<=0&&!e.pull&&e.grace<=0&&e.z<1&&!e.riding){
    e.voidT+=dt;
    if(e.voidT>.4){
      if((e.am.buoy||0)>0&&e.lastSafe){ e.am.buoy--; splash(e.x,e.y); e.x=e.lastSafe.x; e.y=e.lastSafe.y; e.z=50; e.vz=0; e.vx=e.vy=0; e.voidT=0; e.inv=1.2; e.grace=.4; floatTxt(e.x,e.y-44,'REPÊCHÉ !','#fb923c',17); ring(e.x,e.y,T*1.5,'#fb923c',.5,true); sfx('buy'); }
      else die(e,e.lastByT>0?e.lastBy:null,true);
    }
  } else e.voidT=Math.max(0,e.voidT-dt*2);
  if(fl(fx,fy)>0&&e.z<=gh+1) e.waterJumps=0;
}
function updateSpawners(dt){
  for(const sp of spawners){
    for(const r in sp.types){
      const ty=sp.types[r], iv=ty.int();
      if(iv===Infinity) continue;
      ty.t+=dt*(game.opts.res||1)*((game.opts.rate&&game.opts.rate[r])||1)*(sp.kind!=='base'&&EV.rush?3:1);
      while(ty.t>=iv){ty.t-=iv; ty.stock++;}
    }
    const R=(sp.kind==='base'?6:2.3)*T, cx=(sp.x+.5)*T, cy=(sp.y+.5)*T;
    for(const e of ents){
      if(!e.alive) continue;
      if(sp.kind==='base'&&e.team!==sp.team&&!teamElim(sp.team)) continue; // base éliminée : ouverte à tous
      if(Math.hypot(e.x-cx,e.y-cy)>R) continue;
      // il faut être posé sur l'île du générateur (pas sur un pont, pas dans le vide)
      const et=idx(clamp(Math.floor(e.x/T),0,W-1),clamp(Math.floor(e.y/T),0,H-1));
      if(region[et]!==region[idx(sp.x,sp.y)]||floorT[et]!==1) continue;
      for(const r in sp.types){
        const ty=sp.types[r];
        if(ty.stock>0){
          e.res[r]+=Math.round(ty.stock*cv(e,'loot')*(1+.15*(e.up.loot||0))*(e.relics&&e.relics.r_coin?1.12:1));
          if(e===player){
            if(sp.kind!=='base'||r!=='bronze') sfx('coin'); if(sp.kind!=='base'||r==='diamond') { floatTxt(e.x,e.y-34,`+${ty.stock} ${RESNAME[r]}`,RESCOL[r],15); burst(e.x,e.y-8,RESCOL[r],8,110,.5,3); ring(e.x,e.y,T*.9,RESCOL[r],.3); }
            else if(r!=='bronze'||Math.random()<.15) parts.push({x:cx,y:cy,z:12,vz:60,vx:(e.x-cx)*1.6,vy:(e.y-cy)*1.6,life:.6,max:.6,col:RESCOL[r],size:5});
          }
          ty.stock=0;
        }
      }
    }
    // petites étincelles sur les pads de ressources neutres
    if(sp.kind!=='base'&&Math.random()<dt*2) parts.push({x:cx+rnd(-8,8),y:cy+rnd(-4,4),z:8,vz:rnd(20,60),vx:0,vy:0,life:.7,max:.7,col:sp.kind==='dia'?'#67e8f9':'#fde047',size:2});
  }
}
function updateProj(dt){
  for(const p of projs){
    if(p.kind==='boomerang'){
      p.age=(p.age||0)+dt;
      if(p.age>.55){ if(!p.back){p.back=true;p.hit=[];} const o=p.owner,dx=o.x-p.x,dy=o.y-p.y,d=Math.hypot(dx,dy)||1; p.vx=dx/d*620; p.vy=dy/d*620; if(d<16||!o.alive) p.life=0; }
    }
    p.life-=dt; if(p.life<=0){ if(p.kind==='rocket') explode({x:p.x,y:p.y,team:p.team,owner:p.owner,kind:'bomb',R:2.2*T,dm:9,bd:.8}); continue; }
    const n=Math.ceil(Math.hypot(p.vx,p.vy)*dt/8);
    for(let i=0;i<n&&p.life>0;i++){
      p.x+=p.vx*dt/n; p.y+=p.vy*dt/n;
      if(wl(Math.floor(p.x/T),Math.floor(p.y/T))>0){
        burst(p.x,p.y,'#ddd',3,60,.2,2);
        { // les armes à feu et flèches abîment les blocs murs (pas le coffre, pas les ponts) selon leurs dégâts
          const wx=Math.floor(p.x/T), wy=Math.floor(p.y/T), wi=idx(wx,wy);
          if((p.kind==='bullet'||p.kind==='arrow')&&p.dmg>0&&wallT[wi]!==CORE&&ownW[wi]!==p.team&&!protectedTile(wx,wy,p.team)){ chunks(p.x,p.y,blockColor(wallT[wi],Math.max(0,ownW[wi]))[0],2); damageTile(wx,wy,p.dmg*WALL_K,p.owner,0); }
        }
        if(p.kind==='rocket') explode({x:p.x,y:p.y,team:p.team,owner:p.owner,kind:'bomb',R:2.2*T,dm:9,bd:.8});
        p.life=0;break;
      }
      if(nearestShieldBlocking(p.x,p.y,p.team)){p.life=0;burst(p.x,p.y,'#7dd3fc',5,80,.3,2);break;}
      for(const bt of boats){ if(bt.team!==p.team&&Math.hypot(bt.x-p.x,bt.y-p.y)<20&&p.dmg>0){ hitBoat(bt,p.dmg,p.owner); if(!p.pierce){ p.life=0; } } }
      if(p.dmg>0) hitTraps(p.team,p.x,p.y,6,p.dmg);
      for(const g of guards){ if(g.team!==p.team&&Math.hypot(g.x-p.x,g.y-p.y)<12){ g.hp-=p.dmg||2; burst(p.x,p.y,'#fff',4,90,.2,3); if(p.kind==='rocket'){explode({x:p.x,y:p.y,team:p.team,owner:p.owner,kind:'bomb',R:2.2*T,dm:9,bd:.8});} if(!p.pierce){p.life=0;} } }
      if(p.life<=0) break;
      for(const o of ents){
        if(!o.alive||o.team===p.team) continue;
        if(p.hit&&p.hit.includes(o)) continue;
        if(Math.hypot(o.x-p.x,o.y-p.y)<12){
          if(p.kind==='rocket'){ explode({x:p.x,y:p.y,team:p.team,owner:p.owner,kind:'bomb',R:2.2*T,dm:9,bd:.8}); p.life=0; break; }
          const sp_=Math.hypot(p.vx,p.vy)||1;
          hurt(o,p.dmg,p.owner,p.vx/sp_*p.kb,p.vy/sp_*p.kb); if(p.lift) o.vz=Math.max(o.vz,p.lift);
          if(p.kind==='wool'){ o.slow=2.2; burst(o.x,o.y-8,'#fbcfe8',10,140,.5,4); floatTxt(o.x,o.y-40,'EMMÊLÉ !','#f9a8d4',15); }
          if(p.kind==='bubble'){ o.bubble=2.2; ring(o.x,o.y-10,T*1.3,'#bfdbfe',.4,true); burst(o.x,o.y-10,'#e0f2fe',12,130,.5,3); floatTxt(o.x,o.y-44,'BULLE !','#bfdbfe',16); }
          if(p.kind==='ice'){ o.frozen=p.short?.9:1.6; ring(o.x,o.y,T,'#7dd3fc',.4,true); burst(o.x,o.y,'#e0f2fe',12,120,.5,3); floatTxt(o.x,o.y-36,'GELÉ !','#7dd3fc',16); }
          if(p.kind==='flame'){ o.burn=2.2; o.burnBy=p.owner; }
          burst(p.x,p.y,p.col,4,90,.2,2);
          if(p.hit) p.hit.push(o); else { p.life=0; break; }
        }
      }
    }
    if(p.kind==='rocket'){ smoke(p.x,p.y,1,6,.6); parts.push({x:p.x,y:p.y,vx:rnd(-20,20),vy:rnd(-20,20),life:.25,max:.25,col:'#fbbf24',size:4}); }
    else if(p.kind==='bullet'||p.pierce) parts.push({x:p.x,y:p.y,vx:0,vy:0,life:.12,max:.12,col:p.col,size:2});
    else if(p.kind==='ice') parts.push({x:p.x,y:p.y,vx:rnd(-10,10),vy:rnd(-10,10),life:.25,max:.25,col:'#bae6fd',size:3});
  }
  projs=projs.filter(p=>p.life>0);
}
function updateBombs(dt){
  for(const b of bombs){
    const dx=b.tx-b.x,dy=b.ty-b.y,d=Math.hypot(dx,dy);
    if(b.drop){ b.h=Math.max(0,b.fuse)*(b.shell?170:140); }
    else if(d>2){const s=Math.min(d,430*dt);b.x+=dx/d*s;b.y+=dy/d*s; b.h=8+Math.sin(Math.min(1,1-d/(9*T))*Math.PI)*26; } else b.h=8;
    b.fuse-=dt;
    if(nearestShieldBlocking(b.x,b.y,b.team)){b.fuse=-1;burst(b.x,b.y,'#7dd3fc',10,120,.4,3);}
    else if(b.fuse<=0) explode(b);
  }
  bombs=bombs.filter(b=>b.fuse>0);
}
function updateShields(dt){
  for(const s of shields){
    s.t-=dt; s.a=Math.min(1,s.a+dt*3);
    for(const o of ents){
      if(!o.alive||o.team===s.team) continue;
      const dx=o.x-s.x,dy=o.y-s.y,d=Math.hypot(dx,dy);
      if(d<s.r&&d>0){ o.vx+=dx/d*2400*dt; o.vy+=dy/d*2400*dt; if(d<s.r-T){ const k=s.r-d; moveEnt(o,dx/d*k*.1,dy/d*k*.1);} }
    }
  }
  shields=shields.filter(s=>s.t>0);
}
function updateHooks(dt){
  for(const h of hooks){
    const o=h.owner; if(!o.alive||h.dead){h.dead=true;continue;}
    let steps=Math.ceil(1000*dt/8);
    for(let i=0;i<steps&&!h.dead;i++){
      const st=1000*dt/steps; h.x+=Math.cos(h.ang)*st; h.y+=Math.sin(h.ang)*st; h.len+=st;
      const tx=Math.floor(h.x/T),ty=Math.floor(h.y/T);
      if(fl(tx,ty)===0) h.sawVoid=true;
      for(const v of ents){
        if(!v.alive||v.team===o.team) continue;
        if(Math.hypot(v.x-h.x,v.y-h.y)<14){
          hurt(v,2,o,0,0);
          v.pull={x:o.x+Math.cos(h.ang)*T*1.3,y:o.y+Math.sin(h.ang)*T*1.3,t:0};
          h.dead=true; break;
        }
      }
      if(h.dead) break;
      if(wl(tx,ty)>0){
        let best=null,bd=1e9;
        for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
          const nx=tx+dx,ny=ty+dy; if(fl(nx,ny)>0&&wl(nx,ny)===0){
            const d=Math.hypot((nx+.5)*T-o.x,(ny+.5)*T-o.y); if(d<bd){bd=d;best=[nx,ny];}
          }
        }
        if(!best){ const px=Math.floor((h.x-Math.cos(h.ang)*T*.8)/T),py=Math.floor((h.y-Math.sin(h.ang)*T*.8)/T); best=[px,py]; }
        o.pull={x:(best[0]+.5)*T,y:(best[1]+.5)*T,t:0}; h.dead=true; burst(h.x,h.y,'#fff',6,90,.3,2);
      } else if(fl(tx,ty)===1&&h.sawVoid){
        o.pull={x:(tx+.5)*T,y:(ty+.5)*T,t:0}; h.dead=true;
      }
      if(h.len>=h.max){h.dead=true;}
    }
    if(h.dead) o.hook=null;
  }
  hooks=hooks.filter(h=>!h.dead);
}
function updateTraps(dt){
  for(const t of traps){
    t.t-=dt; t.age+=dt; t.anim=Math.max(0,(t.anim||0)-dt*3);
    if(t.kind==='turret'){
      t.cd-=dt; let best=null,bd=7*T;
      for(const o of ents){ if(!o.alive||o.team===t.team||o.cloak>0) continue; const d=Math.hypot(o.x-t.x,o.y-t.y); if(d<bd){ const r=rayFirst(t.x,t.y,Math.atan2(o.y-t.y,o.x-t.x),d+4,t.team); if(r.kind!=='wall'){bd=d;best=o;} } }
      if(best){ t.ang=Math.atan2(best.y-t.y,best.x-t.x); if(t.cd<=0&&t.ice){ t.cd=1.1; t.muz=.08; sfx('ice',t.x,t.y); projs.push({x:t.x+Math.cos(t.ang)*12,y:t.y+Math.sin(t.ang)*12,z:14,vx:Math.cos(t.ang)*560,vy:Math.sin(t.ang)*560,team:t.team,owner:t.owner,life:.9,dmg:1,kb:0,kind:'ice',col:'#7dd3fc',hit:null,short:true}); }
        else if(t.cd<=0){ t.cd=.5; t.muz=.08; sfx('shot',t.x,t.y);
        projs.push({x:t.x+Math.cos(t.ang)*12,y:t.y+Math.sin(t.ang)*12,vx:Math.cos(t.ang)*760,vy:Math.sin(t.ang)*760,team:t.team,owner:t.owner,life:.8,dmg:2.2,kb:150,kind:'bullet',col:'#93c5fd',hit:null}); } }
      t.muz=Math.max(0,(t.muz||0)-dt); continue;
    }
    if(t.kind==='flag'){
      for(const o of ents){ if(!o.alive) continue; const d=Math.hypot(o.x-t.x,o.y-t.y); if(d<4*T){ if(o.team===t.team){ o.hp=Math.min(maxhp(o),o.hp+2*dt); o.flagBuff=.3; } else o.slow=Math.max(o.slow,.3); } }
      continue;
    }
    if(t.kind==='kraken'){
      t.cd-=dt; t.slam=Math.max(0,(t.slam||0)-dt);
      if(t.cd<=0){ t.cd=1.1; t.slam=.35; sfx('boom',t.x,t.y); ring(t.x,t.y,T*1.9,'#34d399',.4,true); shake=Math.max(shake,5); chunks(t.x,t.y,'#34d399',6);
        for(const o of ents){ if(!o.alive||o.team===t.team) continue; const dx=o.x-t.x,dy=o.y-t.y,d=Math.hypot(dx,dy); if(d<1.9*T){ hurt(o,4,t.owner,dx/(d||1)*520,dy/(d||1)*520); o.vz=Math.max(o.vz,320); } }
        blastTiles(t.x,t.y,1.4*T,12,t.owner,t.team); }
      continue;
    }
    if(t.kind==='vortex'){
      for(const o of ents){ if(!o.alive||o.team===t.team) continue; const dx=t.x-o.x,dy=t.y-o.y,d=Math.hypot(dx,dy); if(d<5*T&&d>4){ const k=1-d/(5*T); o.vx+=dx/d*(1500*k+300)*dt; o.vy+=dy/d*(1500*k+300)*dt; o.lastBy=t.owner; o.lastByT=5; } }
      if(Math.random()<dt*30){ const a=rnd(0,6.28); parts.push({x:t.x+Math.cos(a)*5*T*.9,y:t.y+Math.sin(a)*5*T*.9,vx:-Math.cos(a)*180,vy:-Math.sin(a)*180,life:.6,max:.6,col:'#a78bfa',size:3}); }
      continue;
    }
    for(const o of ents){
      if(!o.alive) continue;
      const d=Math.hypot(o.x-t.x,o.y-t.y);
      if(t.kind==='trampo'&&d<T*.6&&o.z<6&&o.vz<=0&&!o.pull){
        o.vz=650; o.squash=-.8; t.anim=1; sfx('boing',t.x,t.y); ring(t.x,t.y,T*1.2,'#f472b6',.35); burst(t.x,t.y,'#f9a8d4',10,130,.4,3);
      } else if(t.kind==='mine'&&t.age>1.2&&o.team!==t.team&&d<T*1.1){
        t.t=-1; explode({x:t.x,y:t.y,team:t.team,owner:t.owner,kind:'bomb',R:1.9*T,dm:12,bd:.9}); break;
      } else if(t.kind==='net'&&o.team!==t.team&&d<T*.6&&o.z<6){
        t.t=-1; o.root=2.2; o.lastBy=t.owner; o.lastByT=5; floatTxt(o.x,o.y-36,'PRIS AU FILET !','#e5e7eb',15); burst(o.x,o.y,'#e5e7eb',10,120,.4,3); break;
      } else if(t.kind==='banana'&&o.team!==t.team&&d<T*.55&&o.z<6){
        t.t=-1; o.slip=1.4; const m=Math.hypot(o.ix,o.iy); o.sdx=m>.1?o.ix/m:Math.cos(o.ang); o.sdy=m>.1?o.iy/m:Math.sin(o.ang);
        o.lastBy=t.owner; o.lastByT=5; floatTxt(o.x,o.y-36,'WOUAAH !','#fde047',17); burst(o.x,o.y,'#fde047',10,140,.4,3); break;
      }
    }
  }
  traps=traps.filter(t=>t.t>0);
}
function updateChickens(dt){
  for(const c of chickens){
    c.t-=dt; c.ph+=dt*14; c.arm-=dt;
    let foe=null,fd=1e9;
    for(const o of ents){ if(!o.alive||o.team===c.team) continue; const d=Math.hypot(o.x-c.x,o.y-c.y); if(d<fd){fd=d;foe=o;} }
    if(foe){ const a=Math.atan2(foe.y-c.y,foe.x-c.x); c.vx+=(Math.cos(a)*190-c.vx)*Math.min(1,dt*4); c.vy+=(Math.sin(a)*190-c.vy)*Math.min(1,dt*4); }
    c.x+=c.vx*dt; c.y+=c.vy*dt;
    if(wl(Math.floor(c.x/T),Math.floor(c.y/T))>0){ c.x-=c.vx*dt; c.y-=c.vy*dt; c.vx*=-.3; c.vy*=-.3; }
    if(Math.random()<dt*8) parts.push({x:c.x,y:c.y,z:8,vz:20,vx:rnd(-15,15),vy:rnd(-15,15),life:.4,max:.4,col:'#fff',size:3}); // plumes
    if((foe&&fd<T*1.1&&c.arm<=0)||c.t<=0){ c.t=-1; explode({x:c.x,y:c.y,team:c.team,owner:c.owner,kind:'bomb',R:2.2*T,dm:12,bd:.6}); floatTxt(c.x,c.y-20,'COT COT !','#fff',15); }
  }
  chickens=chickens.filter(c=>c.t>0);
}
function updateGuards(dt){
  for(const g of guards){
    g.t-=dt; g.cd-=dt; g.ph+=dt*8;
    const td=TD[g.team], cx=(td.bx+.5)*T, cy=(td.by+.5)*T;
    let foe=null,fd=1e9;
    for(const o of ents){ if(!o.alive||o.team===g.team||o.cloak>0) continue; const d=Math.hypot(o.x-g.x,o.y-g.y), dc=Math.hypot(o.x-cx,o.y-cy); if((d<7*T||dc<9*T)&&d<fd){fd=d;foe=o;} }
    let tx=cx+Math.cos(g.ph*.1)*T*2.5, ty=cy+Math.sin(g.ph*.1)*T*2.5;
    if(foe){ tx=foe.x; ty=foe.y; g.ang=Math.atan2(foe.y-g.y,foe.x-g.x); }
    const dx=tx-g.x,dy=ty-g.y,d=Math.hypot(dx,dy);
    if(d>T*.9){ g.vx=dx/d*130; g.vy=dy/d*130; const nx=g.x+g.vx*dt,ny=g.y+g.vy*dt; if(fl(Math.floor(nx/T),Math.floor(ny/T))>0&&!wl(Math.floor(nx/T),Math.floor(ny/T))){g.x=nx;g.y=ny;} else g.vx=g.vy=0; } else g.vx=g.vy=0;
    if(foe&&fd<T*1.4&&g.cd<=0){ g.cd=.8; g.swing=.2; hurt(foe,3,g.owner,Math.cos(g.ang)*260,Math.sin(g.ang)*260); sfx('swing',g.x,g.y); }
    g.swing=Math.max(0,(g.swing||0)-dt);
  }
  guards=guards.filter(g=>{ if(g.t<=0||g.hp<=0){ burst(g.x,g.y,'#fff',12,160,.5,4); return false; } return true; });
}
function updatePearls(dt){
  for(const p of pearls){
    p.t+=dt; const dx=p.tx-p.x,dy=p.ty-p.y,d=Math.hypot(dx,dy);
    if(d>6){const s=Math.min(d,560*dt);p.x+=dx/d*s;p.y+=dy/d*s;}
    parts.push({x:p.x,y:p.y,vx:rnd(-20,20),vy:rnd(-20,20),life:.3,max:.3,col:'#c084fc',size:4});
    if(d<=6||p.t>1.5){
      p.done=true; const o=p.owner;
      if(o.alive&&!hitWall(p.x,p.y,0)){
        burst(o.x,o.y,'#c084fc',16,200,.5,4); ring(o.x,o.y,T,'#c084fc',.4);
        o.x=p.x;o.y=p.y;o.vx=o.vy=0;o.grace=.1; burst(o.x,o.y,'#e9d5ff',16,200,.5,4); ring(o.x,o.y,T*1.4,'#e9d5ff',.4);
      } else o.am.tp=(o.am.tp||0)+1;
    }
  }
  pearls=pearls.filter(p=>!p.done);
}
function updateFx(dt){
  for(const p of parts){
    p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=.96;p.vy*=.96;
    if(p.vz!==undefined){ p.vz-=(p.smoke?0:700)*dt; p.z+=p.vz*dt; if(p.z<0){p.z=0;p.vz*=-.3;p.vx*=.6;p.vy*=.6;} }
  }
  parts=parts.filter(p=>p.life>0);
  if(parts.length>900) parts.splice(0,parts.length-900);
  for(const r of rings) r.t+=dt; rings=rings.filter(r=>r.t<r.max);
  for(const b of beams) b.t+=dt; beams=beams.filter(b=>b.t<.8);
  for(const f of floats){f.t-=dt;f.y-=24*dt;} floats=floats.filter(f=>f.t>0);
  for(const f of feed) f.t-=dt; feed=feed.filter(f=>f.t>0);
  for(let i=0;i<pop.length;i++) if(pop[i]>0) pop[i]=Math.max(0,pop[i]-dt*4);
  shake=Math.max(0,shake-dt*20);
  game.hurtFx=Math.max(0,game.hurtFx-dt); game.hitmark=Math.max(0,game.hitmark-dt); game.flash=Math.max(0,game.flash-dt*1.2);
  banner.t=Math.max(0,banner.t-dt); selAnim=Math.max(0,selAnim-dt*5);
}
function update(dt){
  game.t+=dt;
  if(game.state==='play'||game.state==='over'){
    for(const e of ents){
      if(e.alive){
        if(e===player){ if(game.state==='play'&&!game.paused) playerControl(e,dt); else {e.ix=e.iy=0;} }
        else if(e.remote){ if(game.state==='play'){ syncBar(e); const q=e.inp; if(!e.bar.includes(q.sel)) q.sel='sword'; netFollow(e,dt,q); controlEnt(e,dt,q); q.clicked=false; } else {e.ix=e.iy=0;} }
        else if(e.isBot) botThink(e,dt);
      }
      updateEnt(e,dt);
    }
    updateEvents(dt); updateBoats(dt); updateSpawners(dt); updateProj(dt); updateBombs(dt); updateShields(dt); updateHooks(dt); updateTraps(dt); updateChickens(dt); updatePearls(dt); updateGuards(dt);
  }
  updateFx(dt);
  syncBar(player); if(!player.bar.includes(selId)) selId='sword';
  if(shopOpen&&(!player.alive||!nearShop(player))) toggleShop(false);
}

/* =====================  JOUEUR  ===================== */
const keys={}; const mouse={x:0,y:0,down:false,clicked:false};
function cnt(e,id){
  switch(id){
    case 'block':return e.blocks[e.bsel];
    case 'pick':return 'T'+(e.pick+1);
    case 'sword':return 'T'+(e.sword+1);
    case 'glove':case 'hammer':case 'baa':return '';
    case 'grap':case 'jet':case 'bomb':case 'repel':case 'shield':return e[id];
    default: if(GUNS[id]){ const s=wst(e,id); return s.r>0?'…':s.a; } if(PERM[id]){ const c=e.pcd[id]||0; return c>0?Math.ceil(c)+'s':''; } return e.am[id]||0;
  }
}
function owned(e,id){
  switch(id){
    case 'block':case 'pick':case 'sword':return true;
    case 'glove':case 'hammer':case 'baa':return !!e.own[id];
    default: if(GUNS[id]||PERM[id]) return !!e.own[id]; return cnt(e,id)>0;
  }
}
const BAR_MAX=10, PROTECT=['block','pick','sword'];
function syncBar(e){
  const has=id=>owned(e,id);
  e.bar=e.bar.filter(has); e.pack=e.pack.filter(has);
  for(const it of ITEMS){ if(!has(it.id)||e.bar.includes(it.id)||e.pack.includes(it.id)) continue;
    if(e.bar.length<BAR_MAX) e.bar.push(it.id); else { e.pack.push(it.id); if(e===player) msg(`Barre pleine ! ${it.n} est en réserve (Tab : échanger)`,'#fde68a'); } }
  while(e.bar.length<BAR_MAX&&e.pack.length) e.bar.push(e.pack.shift());
}
function swapPack(e,sel){
  sel=sel||selId; const remote=e!==player;
  if(!e.pack.length){ floatTxt(e.x,e.y-40,'Rien en réserve','#cbd5e1',13); return; }
  const i=e.bar.indexOf(sel); if(i<0||PROTECT.includes(sel)){ floatTxt(e.x,e.y-40,'Sélectionne l\'objet à remplacer','#fde68a',13); return; }
  const nid=e.pack.shift(); e.pack.push(sel); e.bar[i]=nid; if(remote) e.inp.sel=nid; else setSel(nid); sfx('tick');
}
const hotList=e=>e.bar.map(id=>ITEMMAP[id]);
function curWorld(){return [aim.x,aim.y];}
function setSel(id){ if(id!==selId){selId=id;selAnim=1;} }
function playerControl(e,dt){
  const up=keys.KeyW||keys['k:z']||keys.ArrowUp, dn=keys.KeyS||keys['k:s']||keys.ArrowDown,
        lf=keys.KeyA||keys['k:q']||keys.ArrowLeft, rt=keys.KeyD||keys['k:d']||keys.ArrowRight;
  const [wx,wy]=curWorld();
  const [mx,my]=camRelInput((rt?1:0)-(lf?1:0),(dn?1:0)-(up?1:0));
  controlEnt(e,dt,{ix:mx,iy:my,wx,wy,down:mouse.down,clicked:mouse.clicked,sel:selId});
}
function controlEnt(e,dt,inp){ // commandes d'un pirate humain (local ou distant)
  let ix=inp.ix, iy=inp.iy; const m=Math.hypot(ix,iy)||1; e.ix=ix/m; e.iy=iy/m;
  const wx=inp.wx, wy=inp.wy; if(e.slip<=0) e.ang=Math.atan2(wy-e.y,wx-e.x);
  if(e.riding&&e.riding.cannon){ e.ix=e.iy=0; e.held='sword'; if(inp.clicked) cannonFire(e,e.riding.c,inp); return; }
  e.held=inp.sel;
  if(!(inp.down||inp.clicked)||e.frozen>0) return;
  const id=inp.sel, click=inp.clicked;
  switch(id){
    case 'block':{ if(e.z>groundH(e)+3&&placeUnder(e)) break; const t=placeTarget(e,wx,wy); if(t) doPlace(e,t[0],t[1]); break;}
    case 'pick':{const h=findMine(e,e.ang,3.1*T,wx,wy); doMine(e,h); break;}
    case 'sword':doSword(e);break;
    case 'glove':doGlove(e);break;
    case 'hammer':doHammer(e);break;
    case 'baa':doBaa(e);break;
    default: if(GUNS[id]){ fireGun(e,id); break; } if(click) useGadget(e,id,wx,wy); break;
    case 'bomb':throwBomb(e,'bomb',wx,wy);break;
    case 'repel':throwBomb(e,'repel',wx,wy);break;
    case 'grap':if(click)useGrapple(e);break;
    case 'jet':if(click)useJet(e);break;
    case 'shield':if(click)useShield(e);break;
  }
}
function cycleBlock(e){
  const l=BORDER.filter(t=>e.blocks[t]>0); if(l.length<2) return;
  e.bsel=l[(Math.max(0,l.indexOf(e.bsel))+1)%l.length];
}

/* =====================  BOTS (niveau facile)  ===================== */
const BOT_BUY=[
  ['wool',b=>b.blocks[2]<24],['sword',b=>b.sword<1],['pick',b=>b.pick<1],['wood',b=>b.blocks[3]<8],
  ['bow',b=>!b.own.bow],['fb',b=>b.up.fb<1],['sword',b=>b.sword<2],['pick',b=>b.pick<2],
['hp',b=>b.up.hp<1],['stone',b=>b.blocks[4]<8],['bomb',b=>b.bomb<2],
  ['repel',b=>b.repel<1],['ar',b=>b.up.ar<1],['fs',b=>b.up.fs<1],['gold',b=>b.up.gold<1],['shield',b=>b.shield<1],
  ['obs',b=>b.blocks[5]<4],['sp',b=>b.up.sp<1],['wall',b=>b.up.fb>=1&&!b.walled],['fb',b=>b.up.fb<3],
  ['sword',b=>b.sword<3],['pick',b=>b.pick<3],['hp',b=>b.up.hp<3],['ar',b=>b.up.ar<3],['gold',b=>b.up.gold<2],
  ...[
    ['heal',b=>(b.am.heal||0)<2],['jet',b=>b.jet<1],['grap',b=>b.grap<2],['tp',b=>(b.am.tp||0)<1],['repair',b=>(b.am.repair||0)<1],['buoy',b=>(b.am.buoy||0)<1],['net',b=>(b.am.net||0)<2],['flag',b=>(b.am.flag||0)<1],['anchor',b=>(b.am.anchor||0)<1],['kraken',b=>(b.am.kraken||0)<1],['barrage',b=>(b.am.barrage||0)<1],['guard',b=>(b.am.guard||0)<1],['turret2',b=>(b.am.turret2||0)<1],['woolgun',b=>!b.own.woolgun],['baa',b=>!b.own.baa],['gun',b=>!b.own.gun],
    ['glove',b=>!b.own.glove],['hammer',b=>!b.own.hammer],['bubble',b=>!b.own.bubble],
    ['shotgun',b=>!b.own.shotgun],['smg',b=>!b.own.smg],
    ['boomerang',b=>!b.own.boomerang],['ice',b=>!b.own.ice],
    ['turret',b=>(b.am.turret||0)<1],['wallgad',b=>(b.am.wallgad||0)<2],['mine',b=>(b.am.mine||0)<2],['banana',b=>(b.am.banana||0)<2],
    ['chicken',b=>(b.am.chicken||0)<1],['cluster',b=>(b.am.cluster||0)<1],['haste',b=>(b.am.haste||0)<1],['springs',b=>(b.am.springs||0)<1],
    ['cloak',b=>(b.am.cloak||0)<1],['dash',b=>(b.am.dash||0)<2],['bridge',b=>(b.am.bridge||0)<1],
    ['sniper',b=>!b.own.sniper],['rocket',b=>!b.own.rocket],
    ['trident',b=>!b.own.trident],['gatling',b=>!b.own.gatling],['javelin',b=>!b.own.javelin],['flarebow',b=>!b.own.flarebow],['frostnova',b=>(b.am.frostnova||0)<1],['quake',b=>(b.am.quake||0)<1],['aegis',b=>(b.am.aegis||0)<1],['siren',b=>(b.am.siren||0)<1],['coco',b=>(b.am.coco||0)<2],['decoy',b=>(b.am.decoy||0)<1],['swap',b=>(b.am.swap||0)<1],
    ['storm',b=>(b.am.storm||0)<1],['vortex',b=>(b.am.vortex||0)<1],['flame',b=>!b.own.flame],['ammo_flame',b=>b.own.flame&&(b.am.flame||0)<80]
  ].map(([id,c])=>[id,b=>b.ai.likes.has(id)&&c(b)]),
  ['wool',b=>b.blocks[2]<60],['wood',b=>b.blocks[3]<20]
];
const BOT_RANGED=[['sniper',5,10],['rocket',3.5,9],['shotgun',0,3.8],['smg',1.5,7],['gun',1.5,8],['boomerang',2.5,7],['bubble',2,7],['ice',2,6],['flame',0,3.2],['woolgun',2,7],['trident',.8,4.5],['gatling',1.5,8],['javelin',3,9],['flarebow',2,8]];
const BOT_OPTIONAL=['jet','grap','tp','flag','anchor','kraken','barrage','net','buoy','woolgun','baa','turret2','guard','repair','gun','glove','hammer','bubble','shotgun','smg','boomerang','ice','turret','wallgad','mine','banana','chicken','cluster','haste','springs','cloak','dash','bridge','sniper','rocket','storm','vortex','flame','heal','trident','gatling','javelin','flarebow','frostnova','quake','aegis','siren','coco','decoy','swap'];
function voidNear(o,ang){ return fl(Math.floor((o.x+Math.cos(ang)*T*1.7)/T),Math.floor((o.y+Math.sin(ang)*T*1.7)/T))===0; }
function botMelee(b,foe,fd){
  const edge=voidNear(foe,b.ang);
  if(b.own.baa&&fd<4*T&&fd>2*T&&Math.random()<.3) doBaa(b);
  else if(edge&&b.own.glove&&fd<2.2*T) doGlove(b);
  else if(b.own.hammer&&fd<2.3*T&&(edge||Math.random()<.4)) doHammer(b);
  else if(fd<1.7*T) doSword(b);
}
function botRanged(b,fd){
  const c=BOT_RANGED.filter(([id,a,z])=>b.own[id]&&fd>=a*T&&fd<=z*T&&!(wst(b,id).r>0)).map(r=>r[0]);
  if(b.own.bow&&fd>3*T&&fd<9*T&&!(wst(b,'bow').r>0)) c.push('bow');
  if(b.own.woolgun&&fd>2*T&&fd<7*T&&!(wst(b,'woolgun').r>0)) c.push('woolgun');
  if(!c.length) return;
  fireGun(b,c[Math.floor(Math.random()*c.length)]);
}
function botGadgets(b,foe,fd,dt,nearCore){
  dt*=getD().use; const am=b.am, r=Math.random();
  if(b.cd.gad>0) return;
  if(b.hp<maxhp(b)*.5&&(am.heal||0)>0&&r<dt*3){ useGadget(b,'heal',b.x,b.y); return; }
  const fx=foe.x,fy=foe.y, fok=fl(Math.floor(fx/T),Math.floor(fy/T))>0;
  if((am.anchor||0)>0&&fd>2*T&&fd<7*T&&r<dt*.6) useGadget(b,'anchor',fx,fy);
  else if((am.kraken||0)>0&&fd<8*T&&r<dt*.4) useGadget(b,'kraken',fx,fy);
  else if((am.barrage||0)>0&&fd>4*T&&fd<10*T&&r<dt*.4) useGadget(b,'barrage',fx,fy);
  else if((am.flag||0)>0&&nearCore&&r<dt*.5) useGadget(b,'flag',b.x,b.y);
  else if((am.storm||0)>0&&fd>3*T&&fd<10*T&&r<dt*.5) useGadget(b,'storm',fx,fy);
  else if((am.cluster||0)>0&&fd>3*T&&fd<8*T&&r<dt*.5) useGadget(b,'cluster',fx,fy);
  else if((am.chicken||0)>0&&fd>3*T&&fd<9*T&&r<dt*.5) useGadget(b,'chicken',fx,fy);
  else if((am.vortex||0)>0&&fd<6*T&&r<dt*.4) useGadget(b,'vortex',fx,fy);
  else if((am.haste||0)>0&&b.haste<=0&&fd>4*T&&r<dt*.6) useGadget(b,'haste',b.x,b.y);
  else if((am.cloak||0)>0&&b.cloak<=0&&b.hp<maxhp(b)*.6&&r<dt*.8) useGadget(b,'cloak',b.x,b.y);
  else if((am.springs||0)>0&&b.springT<=0&&r<dt*.3) useGadget(b,'springs',b.x,b.y);
  else if((am.dash||0)>0&&fok&&fd>4.5*T&&fd<6.5*T&&r<dt*.8) useGadget(b,'dash',fx,fy);
  else if((am.mine||0)>0&&fd<5*T&&r<dt*.3) useGadget(b,'mine',b.x,b.y);
  else if((am.banana||0)>0&&fd>2*T&&fd<5*T&&r<dt*.4) useGadget(b,'banana',b.x+Math.cos(b.ang)*2*T,b.y+Math.sin(b.ang)*2*T);
  else if((am.turret||0)>0&&nearCore&&r<dt*.6) useGadget(b,'turret',b.x+Math.cos(b.ang+1.57)*1.5*T,b.y+Math.sin(b.ang+1.57)*1.5*T);
  else if((am.guard||0)>0&&nearCore&&guards.filter(g=>g.team===b.team).length<2&&r<dt*.8) useGadget(b,'guard',b.x,b.y);
  else if((am.turret2||0)>0&&nearCore&&r<dt*.6) useGadget(b,'turret2',b.x+Math.cos(b.ang-1.57)*1.5*T,b.y+Math.sin(b.ang-1.57)*1.5*T);
  else if((am.wallgad||0)>0&&nearCore&&r<dt*.5) useGadget(b,'wallgad',b.x+Math.cos(b.ang)*2.2*T,b.y+Math.sin(b.ang)*2.2*T);
  else if(botGadgets2(b,foe,fd,nearCore,r,dt)) return;
  else if((am.frostnova||0)>0&&fd<3.2*T&&r<dt*.6) useGadget(b,'frostnova',b.x,b.y);
  else if((am.quake||0)>0&&fd<3*T&&r<dt*.5) useGadget(b,'quake',b.x,b.y);
  else if((am.aegis||0)>0&&b.hp<maxhp(b)*.45&&r<dt*1.2) useGadget(b,'aegis',b.x,b.y);
  else if((am.siren||0)>0&&fd<5.5*T&&r<dt*.5) useGadget(b,'siren',b.x,b.y);
  else if((am.coco||0)>0&&fd>2*T&&fd<8*T&&r<dt*.6) useGadget(b,'coco',fx,fy);
  else if((am.decoy||0)>0&&fd<9*T&&guards.filter(g=>g.team===b.team).length<2&&r<dt*.5) useGadget(b,'decoy',b.x,b.y);
  else if((am.swap||0)>0&&fd>3*T&&fd<9*T&&b.hp<maxhp(b)*.5&&r<dt*.8) useGadget(b,'swap',fx,fy);
}
function botDefend(b,dt){
  const ai=b.ai; ai.defT=(ai.defT||0)-dt; if(ai.defT>0||b.cd.gad>0) return; ai.defT=rnd(2,4);
  const td=TD[b.team], d=td.dir, tx=(td.bx+d[0]*2+.5)*T, ty=(td.by+d[1]*2+.5)*T, am=b.am;
  b.ang=Math.atan2(d[1],d[0]);
  const mine=(k)=>traps.filter(t=>t.kind===k&&t.team===b.team).length;
  if((am.turret||0)>0&&!mine('turret')) useGadget(b,'turret',tx-d[1]*T*1.5,ty+d[0]*T*1.5);
  else if((am.wallgad||0)>0&&wl(Math.floor(tx/T),Math.floor(ty/T))===0) useGadget(b,'wallgad',tx,ty);
  else if((am.mine||0)>0&&mine('mine')<3) useGadget(b,'mine',b.x,b.y);
  else if((am.net||0)>0&&mine('net')<2) useGadget(b,'net',tx+d[1]*T*2.5,ty-d[0]*T*2.5);
  else if((am.banana||0)>0&&mine('banana')<2) useGadget(b,'banana',tx+d[1]*T*2,ty-d[0]*T*2);
  else if((am.turret2||0)>0&&!mine('turret')) useGadget(b,'turret2',tx+d[1]*T*1.5,ty-d[0]*T*1.5);
  else if((am.guard||0)>0&&guards.filter(g=>g.team===b.team).length<2&&b.cd.gad<=0) useGadget(b,'guard',b.x,b.y);
  else if((am.repair||0)>0&&hpW[idx(td.bx,td.by)]<BHP[CORE]*.6) useGadget(b,'repair',b.x,b.y);
}
function botBuy(b){
  if(!nearShop(b)) return;
  for(const [id,cond] of BOT_BUY){
    if(!inRoster(id)||!cond(b)) continue;
    const inf=SHOPMAP[id].info(b); if(inf.ok===false||!canAfford(b,inf.cost)) continue;
    buy(b,id); if(id==='wall') b.walled=true; return;
  }
}
function pickBlock(b,mode){
  const order=mode==='wall'?[5,4,7,3,8,2]:BORDER;
  for(const t of order){ if(b.blocks[t]>(mode==='wall'&&t===2?20:0)) return t; }
  return 0;
}
function steerSafe(b,dx,dy){
  const m=Math.hypot(dx,dy)||1; dx/=m; dy/=m;
  const ok=(ax,ay)=>b.jetT>0||fl(Math.floor((b.x+ax*14)/T),Math.floor((b.y+ay*14)/T))>0;
  if(ok(dx,dy)){b.ix=dx;b.iy=dy;return true;}
  if(Math.abs(dx)>.2&&ok(Math.sign(dx),0)){b.ix=Math.sign(dx);b.iy=0;return true;}
  if(Math.abs(dy)>.2&&ok(0,Math.sign(dy))){b.ix=0;b.iy=Math.sign(dy);return true;}
  return false;
}
function navTo(b,gx,gy){
  const cx=Math.floor(b.x/T),cy=Math.floor(b.y/T);
  if(cx===gx&&cy===gy) return 'arrived';
  const dx=gx-cx,dy=gy-cy,opts=[]; let best=null,bc=1e9;
  if(dx) opts.push([Math.sign(dx),0,Math.abs(dx)]); if(dy) opts.push([0,Math.sign(dy),Math.abs(dy)]);
  for(const o of opts){
    const nx=cx+o[0],ny=cy+o[1]; let c;
    if(wl(nx,ny)>0) c=(wl(nx,ny)===CORE&&ownW[idx(nx,ny)]===b.team)?99:2+hpW[idx(nx,ny)]/12;
    else if(fl(nx,ny)>0) c=0; else c=1.5;
    c-=o[2]*.03; if(c<bc){bc=c;best=o;}
  }
  if(bc>=90) return 'blocked';
  const nx=cx+best[0],ny=cy+best[1],ncx=(nx+.5)*T,ncy=(ny+.5)*T,ccx=(cx+.5)*T,ccy=(cy+.5)*T;
  if(wl(nx,ny)>0){
    b.ang=Math.atan2(ncy-b.y,ncx-b.x);
    if(Math.hypot(ncx-b.x,ncy-b.y)>T*1.7){ steerSafe(b,ccx-b.x,ccy-b.y); return 'moving'; }
    doMine(b,findMine(b,b.ang,3.1*T)); return 'mining';
  }
  if(fl(nx,ny)>0){ steerSafe(b,ncx-b.x,ncy-b.y); return 'moving'; }
  if(Math.hypot(ccx-b.x,ccy-b.y)>5){ steerSafe(b,ccx-b.x,ccy-b.y); return 'moving'; }
  b.ang=Math.atan2(ncy-b.y,ncx-b.x);
  if((b.am.bridge||0)>0&&b.cd.gad<=0&&useGadget(b,'bridge',ncx,ncy)) return 'building';
  const type=pickBlock(b,'bridge'); if(!type) return 'noblocks';
  doPlace(b,nx,ny,type); return 'building';
}
function botRing(b){
  const td=TD[b.team]; if(totalBlocks(b)<=14||b.cd.place>0) return;
  const type=pickBlock(b,'wall'); if(!type) return;
  for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
    if(!dx&&!dy) continue;
    const tx=td.bx+dx,ty=td.by+dy;
    if(fl(tx,ty)>0&&wl(tx,ty)===0&&canPlace(b,tx,ty)){ b.ang=Math.atan2((ty+.5)*T-b.y,(tx+.5)*T-b.x); doPlace(b,tx,ty,type); return; }
  }
}
function pickGoal(b){
  const ai=b.ai, r=Math.random(), me=(b.x/T),my=(b.y/T);
  const near=(list)=>list.map(s=>({s,d:Math.hypot(s.x-me,s.y-my)})).sort((p,q)=>p.d-q.d);
  if(r<.34&&b.res.diamond<8){
    const l=near(spawners.filter(s=>s.kind==='dia')); const s=l[Math.random()<.7?0:1].s;
    ai.mode='res'; ai.goal=[s.x,s.y]; ai.wait=9; return;
  }
  if(r<.46&&game.t>80&&b.res.gold<4){
    const s=spawners.filter(s=>s.kind==='gold')[Math.floor(Math.random()*4)];
    ai.mode='res'; ai.goal=[s.x,s.y]; ai.wait=10; return;
  }
  const alive=TD.filter(t=>t.id!==b.team&&t.coreAlive);
  if(alive.length){
    alive.sort((p,q)=>Math.hypot(p.bx-me,p.by-my)-Math.hypot(q.bx-me,q.by-my));
    const bots=player&&!game.tut?alive.filter(t=>t.id!==player.team):alive; // moins de focus sur le joueur : les bots se battent entre eux
    const pool=(bots.length&&Math.random()<.7)?bots:alive;
    const t=Math.random()<.45?pool[0]:pool[Math.floor(Math.random()*pool.length)];
    ai.mode='raid'; ai.target=t.id;
    if((b.am.haste||0)>0) useGadget(b,'haste',b.x,b.y);
    return;
  }
  ai.mode='hunt';
}
function botJumpEnv(b,dt){ // les bots sautent : rattrapage au-dessus de l'eau, murs d'une couche, coincés
  if(b.riding||b.flight>0) return;
  const gh=groundH(b), onGround=b.z<=gh+1&&b.vz<=0, sup=floorSupport(b.x,b.y);
  if(!sup&&b.jetT<=0&&!b.pull&&b.grace<=0){ if(onGround) jump(b); else if(b.z>gh+3&&totalBlocks(b)>0) placeUnder(b); return; }
  if(!onGround) return;
  if(b.ix||b.iy){ const tx=Math.floor((b.x+b.ix*T*.85)/T), ty=Math.floor((b.y+b.iy*T*.85)/T);
    if(inb(tx,ty)&&wallT[idx(tx,ty)]>0&&wallT[idx(tx,ty)]!==CORE&&wallLayers(idx(tx,ty))===1&&(ownW[idx(tx,ty)]===b.team||b.ai.stuckT>.7)) { jump(b); return; } }
  if(b.ai.stuckT>1.2&&Math.random()<dt*3) jump(b);
}
function botThink(b,dt){
  const ai=b.ai,tm=TD[b.team]; ai.t+=dt; ai.buyT-=dt; ai.react-=dt; b.ix=0;b.iy=0; b.held='sword';
  const D=getD();
  if(!tm.coreAlive){ ai.supplyT=(ai.supplyT||0)-dt; if(ai.supplyT<=0){ ai.supplyT=3; if(totalBlocks(b)<16) b.blocks[2]+=6; if(b.sword<1) b.sword=1; } }
  if(ai.buyT<=0){ai.buyT=D.buyT;botBuy(b);}
  if(b.voidT>.1&&b.jet>0&&b.jetT<=0) useJet(b);
  if(b.hp<maxhp(b)*.5&&(b.am.heal||0)>0&&b.cd.gad<=0&&Math.random()<dt*2) useGadget(b,'heal',b.x,b.y);
  if(b.frozen>0||b.bubble>0) return;
  botJumpEnv(b,dt);
  const coreX=(tm.bx+.5)*T,coreY=(tm.by+.5)*T;
  let foe=null,fd=1e9,fdk=1e9;
  for(const o of ents){ if(!o.alive||o.team===b.team) continue; let d=dist(b,o); if(o.cloak>0&&d>3*T) continue; const dk=((player&&o.team===player.team&&!game.tut)?1.35:1)*(o.bounty>0?.7:1); /* les bots s'attaquent aussi entre eux */ if(d*dk<fdk){fdk=d*dk;fd=d;foe=o;} }
  const nearCore=foe&&Math.hypot(foe.x-coreX,foe.y-coreY)<8*T;
  if(foe&&fd<(nearCore?D.engage*1.8:D.engage)*T){
    if(ai.foe!==foe){ai.foe=foe;ai.react=D.react;}
    b.ang=Math.atan2(foe.y-b.y,foe.x-b.x)+rnd(-D.noise,D.noise);
    if(ai.react>0) return; // temps de réaction
    if(fd>T*1.5){
      if(!steerSafe(b,foe.x-b.x,foe.y-b.y)&&totalBlocks(b)>0&&fd<8*T){
        const t=placeTarget(b,b.x+Math.cos(b.ang)*T*3,b.y+Math.sin(b.ang)*T*3); const ty=pickBlock(b,'bridge');
        if(t&&ty) doPlace(b,t[0],t[1],ty);
      }
    }
    if(D.strafe&&fd<6*T&&fd>T*1.2){ const k=Math.sin(game.t*2.6+b.team*2)*.7, nx=b.ix-Math.sin(b.ang)*k, ny=b.iy+Math.cos(b.ang)*k, m=Math.hypot(nx,ny)||1; if(fl(Math.floor((b.x+nx/m*14)/T),Math.floor((b.y+ny/m*14)/T))>0){ b.ix=nx/m; b.iy=ny/m; } }
    if(D.dodge&&fd<4*T&&Math.random()<dt*D.dodge) jump(b);
    if(fd>T*1.5&&fd<7*T&&Math.random()<dt*.35*D.aggr) jump(b); // petits bonds en combat
    if(foe.z>20&&fd<4*T&&Math.random()<dt*2) jump(b);
    if(fd<T*2.4&&Math.random()<dt*2.2*D.aggr) botMelee(b,foe,fd);
    else if(fd>T*1.2&&Math.random()<dt*2.8*D.aggr) botRanged(b,fd);
    botGadgets(b,foe,fd,dt,nearCore);
    if(b.grap>0&&D.use>1.5&&fd>4*T&&fd<10*T&&Math.random()<dt*.6) useGrapple(b);
    if((b.am.tp||0)>0&&D.use>1.5&&b.hp<maxhp(b)*.3&&b.cd.gad<=0&&Math.random()<dt*2) useGadget(b,'tp',coreX,coreY);
    if(b.bomb>0&&fd>T*2&&fd<T*7&&Math.random()<dt*.15*D.use) throwBomb(b,'bomb',foe.x,foe.y);
    if(b.repel>0&&fd<T*2.4&&Math.random()<dt*.2*D.use) throwBomb(b,'repel',foe.x+Math.cos(b.ang)*T,foe.y+Math.sin(b.ang)*T);
    if(b.shield>0&&nearCore&&fd<T*5&&Math.random()<dt*.2*D.use) useShield(b);
    return;
  } else ai.foe=null;
  if(ai.jig>0){ai.jig-=dt;b.ix=ai.jx;b.iy=ai.jy;return;}
  if(Math.hypot(b.x-ai.lastX,b.y-ai.lastY)<3){ai.stuckT+=dt;} else {ai.stuckT=0;ai.lastX=b.x;ai.lastY=b.y;}
  if(ai.stuckT>2.5&&!ai.working){
    ai.stuckT=0; ai.jig=.5; const a=rnd(0,6.28); ai.jx=Math.cos(a); ai.jy=Math.sin(a);
    if(!steerSafe(b,ai.jx,ai.jy)){ai.jx=ai.jy=0;} else {ai.jx=b.ix;ai.jy=b.iy;} return;
  }
  let r='';
  if(ai.mode==='home'){
    r=navTo(b,tm.spawnTile[0],tm.spawnTile[1]);
    if(r==='arrived'||r==='blocked'){
      if(tm.coreAlive){ botRing(b); botDefend(b,dt); }
      if(!tm.coreAlive||(ai.t>=ai.leaveAt&&totalBlocks(b)>=18)) pickGoal(b);
    }
  } else if(ai.mode==='res'){
    r=navTo(b,ai.goal[0],ai.goal[1]);
    if(r==='arrived'){ ai.wait-=dt; if(ai.wait<=0){ai.mode='home';ai.leaveAt=ai.t+rnd(12,25)*(getD().leave[0]/40);} }
    else if(r==='noblocks'||r==='blocked'){ai.mode='home';ai.leaveAt=ai.t+rnd(12,25)*(getD().leave[0]/40);}
  } else if(ai.mode==='raid'){
    const t=TD[ai.target];
    if(!t||!t.coreAlive){ pickGoal(b); }
    else{
      r=navTo(b,t.bx,t.by);
      if(r==='noblocks'||r==='blocked'){ai.mode='home';ai.leaveAt=ai.t+rnd(12,25)*(getD().leave[0]/40);}
    }
  } else {
    let tg=null,td_=1e9; for(const o of ents){ if(!o.alive||o.team===b.team) continue; const d=dist(b,o); if(d<td_){td_=d;tg=o;} }
    if(tg){ r=navTo(b,Math.floor(tg.x/T),Math.floor(tg.y/T)); if(r==='noblocks'){ai.mode='home';ai.leaveAt=ai.t+10;} }
  }
  ai.working=(r==='building'||r==='mining');
}


