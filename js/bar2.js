'use strict';
/* =====================  BARRE D'OBJETS COMPACTE  =====================
   Toutes les armes de mêlée (sabres, hache, gant…) partagent l'emplacement de l'épée,
   toutes les armes à feu celui du pistolet. Clic droit sur l'emplacement : passe à l'arme suivante. (Solo / hôte uniquement.) */
const BARG={melee:['sword','glove','hammer','baa',...Object.keys(SW2)],gun:Object.keys(GUNS)};
const bargOf=id=>BARG.melee.includes(id)?'melee':BARG.gun.includes(id)?'gun':null;
const bargOn=e=>!NETON&&e&&!e.isBot&&e.alt!==null;
{ const _o=owned;
  const raw=(e,id)=>_o(e,id);
  const list=(e,g)=>BARG[g].filter(id=>raw(e,id));
  const cur=(e,g)=>{ e.alt=e.alt||{}; const l=list(e,g); if(!l.length) return null; if(!e.alt[g]||!l.includes(e.alt[g])) e.alt[g]=l[0]; return e.alt[g]; };
  owned=function(e,id){ const r=_o(e,id); if(!r||!bargOn(e)) return r; const g=bargOf(id); if(!g) return r; return cur(e,g)===id; };
  const _sb=syncBar;
  syncBar=function(e){
    if(bargOn(e)){ e.seen=e.seen||{}; for(const g of ['melee','gun']) for(const id of BARG[g]){ if(raw(e,id)&&!e.seen[id]){ e.seen[id]=1; if(id!=='sword'&&id!=='gun'||g==='gun'){ e.alt=e.alt||{}; const old=e.alt[g]; e.alt[g]=id;
          if(old&&old!==id&&e===player&&game.state==='play'){ const i=e.bar.indexOf(old); if(i>=0) e.bar[i]=id; if(selId===old) setSel(id); msg(`${ITEMMAP[id].ico} ${ITEMMAP[id].n} équipé · clic droit sur l'emplacement pour alterner`,'#fde68a'); } } } } }
    _sb(e); };
  window.cycleGroup=function(e,id){ const g=bargOf(id); if(!g||!bargOn(e)) return false; const l=list(e,g); if(l.length<2){ floatTxt(e.x,e.y-40,'Une seule arme de ce type','#cbd5e1',13); return true; }
    const i=l.indexOf(cur(e,g)), nx=l[(i+1)%l.length], bi=e.bar.indexOf(cur(e,g)); e.alt[g]=nx; if(bi>=0) e.bar[bi]=nx; if(selId===id) setSel(nx); sfx('tick'); floatTxt(e.x,e.y-40,`${ITEMMAP[nx].ico} ${ITEMMAP[nx].n}`,'#fde68a',14); return true; };
  window.bargCount=(e,id)=>{ const g=bargOf(id); return g&&bargOn(e)?list(e,g).length:0; };
}
/* petit badge « ⟳ n » sur les emplacements qui contiennent plusieurs armes */
{ const _dh=drawHud;
  drawHud=function(){ _dh(); if(game.state!=='play'||!ctx||!player||NETON||shopOpen) return; const l=hotList(player), hb=hotbarRect(l.length); ctx.save(); ctx.setTransform(DPR,0,0,DPR,0,0); ctx.font='bold 11px system-ui'; ctx.textAlign='center';
    l.forEach((it,i)=>{ const n=bargCount(player,it.id); if(n<2) return; const x=hb.x+i*(hb.s+hb.g)+hb.s-12, y=hb.y+12; ctx.fillStyle='#0b1b2dee'; ctx.beginPath(); ctx.arc(x,y,10,0,6.283); ctx.fill(); ctx.strokeStyle='#fde68a'; ctx.lineWidth=1.5; ctx.stroke(); ctx.fillStyle='#fde68a'; ctx.fillText('⟳'+n,x,y+4); });
    ctx.textAlign='left'; ctx.restore(); }; }
