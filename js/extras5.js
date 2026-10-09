'use strict';
/* =====================  OBJETS PERMANENTS & RELIQUES (passifs)  =====================
   Plus un objet est « pété », plus il est cher et plus on risque de le perdre à la mort (hors base). */
const RELICS={
  r_speed:{n:'Anneau de vitesse',ico:'💍',col:'#38bdf8',d:'+10 % de vitesse, en permanence.',cost:{silver:32},lose:false},
  r_feather:{n:'Bottes de plume',ico:'🪽',col:'#bbf7d0',d:'Plus aucun dégât de chute et sauts +10 %.',cost:{silver:34},lose:false},
  r_hp:{n:'Amulette de vie',ico:'📿',col:'#f87171',d:'+4 PV maximum, en permanence.',cost:{silver:38},lose:false},
  r_coin:{n:'Pièce porte-bonheur',ico:'🍀',col:'#86efac',d:'+12 % de ressources ramassées.',cost:{silver:40},lose:false},
  r_glass:{n:'Longue-vue',ico:'🔭',col:'#bae6fd',d:'Vue bien plus large, +20 % de portée pour tes armes et objets, mini-carte étendue (ennemis visibles jusqu\'à 60 cases).',cost:{silver:30},lose:false},
  r_anchor:{n:'Ancre de poche',ico:'⚓',col:'#cbd5e1',d:'Tu es repoussé 35 % de moins.',cost:{silver:32},lose:false},
  r_fang:{n:'Croc de requin',ico:'🦷',col:'#e5e7eb',d:'Tu récupères 10 % des dégâts que tu infliges',cost:{gold:6},lose:false},
  r_skull:{n:'Crâne d\'or',ico:'💀',col:'#fbbf24',d:'+20 % de dégâts infligés, mais +12 % de dégâts reçus',cost:{gold:5},lose:false},
  r_parrot:{n:'Perroquet de compagnie',ico:'🦜',col:'#4ade80',d:'Picore l\'ennemi le plus proche (6 cases) : 1,2 dégât toutes les 1,4 s',cost:{gold:7},lose:false}
};
/* objets utilisables à volonté (recharge) : prix élevé, gardés ou non à la mort */
const PERM_DEF={
  spy:{cd:50,keep:false,cost:{gold:4}},recall:{cd:35,keep:true,cost:{silver:26}},plume:{cd:25,keep:true,cost:{silver:22}},glide:{cd:22,keep:true,cost:{silver:18}},
  haste:{cd:30,keep:true,cost:{silver:16}},cloak:{cd:40,keep:false,cost:{silver:22}},springs:{cd:45,keep:true,cost:{silver:16}},cannonman:{cd:30,keep:false,cost:{silver:26}}
};
for(const id in PERM_DEF) PERM[id]=PERM_DEF[id];
for(const id in RELICS){ const r=RELICS[id]; ITEMS.push({id,n:r.n,ico:r.ico,col:r.col}); ITEMMAP[id]={id,n:r.n,ico:r.ico,col:r.col}; }
Object.assign(TIPS2,{});
/* boutique : onglet « Reliques » + versions permanentes */
TABS.splice(4,0,'Reliques');
for(const id in RELICS){ const r=RELICS[id];
  SHOP.push(mk(id,'Reliques',e=>e.relics[id]?{name:r.n,desc:'Déjà possédée',cost:{},ok:false,tag:'PASSIF'}:{name:r.n+(r.lose?' ⚠':''),desc:r.d,cost:r.cost},e=>{ e.relics[id]=true; })); }
for(const id in PERM_DEF){ const it=SHOPMAP[id], P=PERM_DEF[id], base=ITEMMAP[id]; if(!it) continue;
  it.info=e=>e.own[id]?{name:base.n,desc:'Déjà possédé (permanent)',cost:{},ok:false,tag:'PERMANENT'}:{name:base.n+' (permanent)',desc:`À volonté, recharge ${P.cd} s. ${P.keep?'Gardé après la mort.':'PERDU à ta mort hors base.'}`,cost:P.cost};
  it.buy=e=>{ e.own[id]=true; if(e.isBot) e.am[id]=99; };
}
SHOP.forEach(s=>SHOPMAP[s.id]=s);
const rel=(e,k)=>!!(e.relics&&e.relics[k]);
function keepOwn(e){ const o={}; for(const id in e.own) if(PERM_DEF[id]&&PERM_DEF[id].keep) o[id]=true; for(const id in e.relics) if(RELICS[id]&&RELICS[id].lose) delete e.relics[id]; return o; }
function keepAm(e){ const a={}; for(const id in PERM_DEF) if(PERM_DEF[id].keep&&e.own[id]&&e.isBot) a[id]=99; return a; }
/* pcd + perroquet de compagnie */
const _ue5=updateEvents;
updateEvents=function(dt){
  _ue5(dt);
  for(const e of ents){ for(const k in e.pcd) if(e.pcd[k]>0) e.pcd[k]=Math.max(0,e.pcd[k]-dt);
    if(e.alive&&e.relics&&e.relics.r_parrot){ e.parT=(e.parT||0)-dt; if(e.parT<=0){ e.parT=1.4; let t=null,bd=6*T; for(const o of ents){ if(!o.alive||o.team===e.team) continue; const d=Math.hypot(o.x-e.x,o.y-e.y); if(d<bd){bd=d;t=o;} } if(t){ hurt(t,1.2,e,(t.x-e.x)/(bd||1)*60,(t.y-e.y)/(bd||1)*60); burst(t.x,t.y-10,'#4ade80',5,110,.3,3); ring(t.x,t.y-8,T*.5,'#4ade80',.25); } } } }
};
/* bots : les reliques les plus utiles */
BOT_BUY.splice(BOT_BUY.length-2,0,...['r_speed','r_hp','r_coin','r_skull','r_fang','r_feather','r_anchor'].map(id=>[id,b=>b.ai.likes.has(id)&&!(b.relics&&b.relics[id])]));
BOT_OPTIONAL.push('r_speed','r_hp','r_coin','r_skull','r_fang','r_feather','r_anchor');
