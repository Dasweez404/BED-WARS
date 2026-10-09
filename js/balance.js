'use strict';
/* =====================  ÉQUILIBRAGE DES PRIX  =====================
   Constats (parties 100 % bots) : le bronze s'accumule sans être dépensé (100-190 par pirate en fin de partie) alors que l'argent est
   toujours à sec, et les objets en or/diamant ne sont presque jamais achetés.
   → les objets « en argent » se paient maintenant moitié bronze / moitié argent ;
   → les pièges et défenses posés ne disparaissent plus avec le temps : ils coûtent plus cher ;
   → quelques objets en or perdent 1 or ; l'épée (affaiblie) coûte moins cher ; la guérison coûte plus cher (les bots en abusaient). */
{
  const dummy=makeEnt(0,false,'x');
  const mix=s=>({bronze:Math.round(s*2.5/5)*5,silver:Math.ceil(s/2)}); // s = équivalent argent
  const PRICE={ // nombre = équivalent argent (mélangé bronze/argent) ; objet = prix exact
    turret:14,turret2:16,guard:12,decoy:12,mine:4,flag:12,anchortrap:10,mistbell:9,battery:20,stonewall:10,hull:11,
    net:{bronze:12},banana:{bronze:10},bananarow:{bronze:20},barrel:9,heal:{bronze:30},sling:{bronze:50},coco:{bronze:36},
    sniper:{gold:2},rocket:{gold:3},gatling:{gold:3},meteor:{gold:3},spy:{gold:3},r_parrot:{gold:4},storm:{gold:4},
    blood:{gold:3},frost:{gold:2},flame:{gold:2},raid:{gold:2},r_fang:{gold:3},
    shield:14,wallgad:6,
    gun:8,bow:7,pogo:8,rubberchicken:9,boomerang:10,ice:10,flarebow:12
  };
  let n=0;
  for(const it of SHOP){
    let base; try{ base=it.info(dummy); }catch(e){ continue; }
    if(!base||base.ok===false||!base.cost) continue;
    const ks=Object.keys(base.cost);
    let cost=PRICE[it.id];
    if(typeof cost==='number') cost=mix(cost);
    else if(!cost&&ks.length===1&&ks[0]==='silver'&&base.cost.silver>=4&&!['Base','Reliques'].includes(it.cat)) cost=mix(base.cost.silver);
    if(!cost) continue;
    const old=it.info; n++;
    it.info=function(e){ const r=old.call(this,e); if(r.ok===false) return r;
      let c=cost; if(typeof MUT==='function'&&MUT('pricey')){ c={}; for(const k in cost) c[k]=Math.ceil(cost[k]*1.5); }
      return Object.assign({},r,{cost:c,_pc:1}); };
  }
  // les objets ajoutés après le « marché noir » n'avaient pas la hausse de prix : on la leur donne
  for(const it of SHOP){ if(it._pm) continue; it._pm=1; const i0=it.info; it.info=function(e){ const r=i0.call(this,e); if(typeof MUT==='function'&&MUT('pricey')&&r&&r.cost&&!r._pc){ const c={}; for(const k in r.cost) c[k]=Math.ceil(r.cost[k]*1.5); return Object.assign({},r,{cost:c,_pc:1}); } return r; }; }
  // paliers d'épée (moins puissante qu'avant) : un peu moins chers
  SWORD_COST[1]={bronze:30}; SWORD_COST[2]={bronze:25,silver:5}; SWORD_COST[3]={gold:2};
}
