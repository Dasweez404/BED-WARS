'use strict';
/* =====================  CONSTRUCTION À L'HONNEUR : défenses moins chères, rempart d'île, maçons, nouveaux blocs  ===================== */
function setCost(id,cost){ const it=SHOPMAP[id]; if(!it) return; const old=it.info; it.info=e=>{ const r=old(e); return r.ok===false?r:Object.assign({},r,{cost}); }; }
const CHEAP={ wool:{bronze:4},wood:{silver:3},stone:{silver:5},obs:{gold:2},
  turret:{silver:9},turret2:{silver:10},guard:{silver:8},repair:{silver:5},wallgad:{silver:4},flag:{silver:8},buoy:{silver:6},net:{bronze:15},mine:{silver:4},banana:{bronze:12},
  decoy:{silver:8},aegis:{gold:2},hull:{silver:9},stonewall:{silver:8},battery:{silver:16},bananarow:{bronze:25},wall:{diamond:3} };
for(const id in CHEAP) setCost(id,CHEAP[id]);
{ const it=SHOPMAP.core; if(it){ const old=it.info; it.info=e=>{ const r=old(e); return r.ok===false?r:Object.assign({},r,{cost:{diamond:[3,5,7][e.up.core||0]}}); }; } }
/* Rempart d'île (remplace le dôme de brume) */
{ const it=SHOPMAP.shield; if(it){ it.info=e=>({name:'Rempart d\'île ×1',desc:'Érige un mur autour de TON île avec tes blocs (une porte face au centre). Les meilleurs blocs vont aux coins, le reste sur les côtés. Consomme 1 bloc par case.',cost:{silver:10}}); it.buy=e=>{ e.shield+=1; }; } }
ITEMMAP.shield.n='Rempart d\'île'; ITEMMAP.shield.ico='🏯'; ITEMMAP.shield.col='#a7afb8';
for(const it of ITEMS) if(it.id==='shield'){ it.n='Rempart d\'île'; it.ico='🏯'; it.col='#a7afb8'; }
function buildRampart(e){
  const td=TD[e.team], types=BORDER.filter(t=>e.blocks[t]>0).sort((a,b)=>BHP[b]-BHP[a]);
  if(!types.length){ floatTxt(e.x,e.y-34,'Pas de blocs !','#fca5a5',15); return false; }
  const gx=td.bx+td.dir[0]*8, gy=td.by+td.dir[1]*8, tiles=[];
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){ const i=idx(x,y); if(region[i]!==e.team||floorT[i]===0||wallT[i]) continue;
    const n=(fl(x+1,y)===0)+(fl(x-1,y)===0)+(fl(x,y+1)===0)+(fl(x,y-1)===0); if(!n) continue;
    if(spawnerAt(x,y)||protectedTile(x,y,e.team)||wallBlockedByEnt((x+.5)*T,(y+.5)*T)) continue;
    if(Math.hypot(x-gx,y-gy)<=2.7||Math.hypot(x-td.spawnTile[0],y-td.spawnTile[1])<1.5) continue;
    tiles.push({x,y,i,corner:n>=2}); }
  if(!tiles.length){ floatTxt(e.x,e.y-34,'Rien à bâtir ici','#fde68a',14); return false; }
  tiles.sort((a,b)=>(b.corner-a.corner)||(Math.atan2(a.y-td.by,a.x-td.bx)-Math.atan2(b.y-td.by,b.x-td.bx)));
  let n=0; const used={};
  tiles.forEach((tl,k)=>{ const avail=BORDER.filter(t=>e.blocks[t]>0).sort((a,b)=>BHP[b]-BHP[a]); if(!avail.length) return;
    const t=tl.corner?avail[0]:avail[Math.min(avail.length-1,(k%3===0&&avail.length>1)?1:0)];
    wallT[tl.i]=t; hpW[tl.i]=BHP[t]; ownW[tl.i]=e.team; pop[tl.i]=1+k*.03; e.blocks[t]--; used[t]=(used[t]||0)+1; n++; chunks((tl.x+.5)*T,(tl.y+.5)*T,blockColor(t,e.team)[0],3); });
  if(!n){ floatTxt(e.x,e.y-34,'Pas de blocs !','#fca5a5',15); return false; }
  ring((td.bx+.5)*T,(td.by+.5)*T,T*7,td.col,.8,true); shake=Math.max(shake,e===player?8:3); sfx('place',e.x,e.y);
  floatTxt(e.x,e.y-44,`RAMPART ! ${n} blocs`,'#fde68a',18); msg(`${e.name} érige un rempart autour de son île !`,td.light);
  return true;
}
/* maçons : l'amélioration « Maçonnerie » fournit des blocs gratuits */
SHOP.push(upItem('mason','Maçonnerie',3,[3,5,8],['Des maçons te fournissent 3 laines toutes les 16 s','…et 2 planches toutes les 11 s','…et 1 pierre toutes les 7 s']));
SHOP.forEach(s=>SHOPMAP[s.id]=s);
const _ue6=updateEvents;
updateEvents=function(dt){
  _ue6(dt);
  for(const e of ents){ const lv=e.up&&e.up.mason; if(!lv||!e.alive) continue; e.masT=(e.masT||[0,16,11,7][lv])-dt;
    if(e.masT<=0){ e.masT=[0,16,11,7][lv]; e.blocks[2]+=3; if(lv>=2) e.blocks[3]+=2; if(lv>=3) e.blocks[4]+=1; if(e===player) floatTxt(e.x,e.y-30,'+ blocs des maçons','#e5e7eb',12); } }
};
