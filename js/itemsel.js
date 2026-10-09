'use strict';
/* =====================  ONGLET « OBJETS »  =====================
   Choisis quels objets, armes, gadgets, reliques et améliorations sont disponibles en boutique pour la partie (bots compris). */
const ITEMSEL_LOCK=['wool','core','wall','pick','sword'];
function itemselMeta(it){ const m=ITEMMAP[it.id]||(typeof RELICS!=='undefined'&&RELICS[it.id])||null; let name=m&&(m.n),ico=m&&m.ico; if(!name){ try{ name=it.info(makeEnt(0,false,'x')).name; }catch(e){ name=it.id; } } return {name:name||it.id,ico:ico||'•'}; }
function renderItemSel(){
  const box=document.getElementById('itemsel'); if(!box||typeof SHOP==='undefined') return; game.opts.off=game.opts.off||{};
  const cats=[...new Set(SHOP.map(s=>s.cat))], off=game.opts.off, total=SHOP.filter(s=>!ITEMSEL_LOCK.includes(s.id)).length, nOff=Object.keys(off).filter(k=>off[k]).length;
  let h=`<div class="orow" style="flex-wrap:wrap"><span class="olab">${total-nOff}/${total} actifs</span><button class="obtn" data-all="1">Tout activer</button><button class="obtn" data-all="0">Tout désactiver</button></div><div style="font-size:12px;opacity:.8;margin:4px 2px 8px">Clique sur un objet pour l'activer ou le désactiver. Un objet désactivé disparaît de la boutique, pour toi comme pour les bots.</div>`;
  for(const c of cats){ const list=SHOP.filter(s=>s.cat===c&&!ITEMSEL_LOCK.includes(s.id)); if(!list.length) continue;
    h+=`<div class="orow" style="flex-wrap:wrap;align-items:center"><span class="olab">${c}</span><button class="obtn" data-cat="${c}" data-v="1" title="Tout activer">✔</button><button class="obtn" data-cat="${c}" data-v="0" title="Tout désactiver">✖</button>`;
    for(const it of list){ const m=itemselMeta(it), o=!!off[it.id]; h+=`<button class="obtn ${o?'':'on'}" data-it="${it.id}" style="${o?'opacity:.45;text-decoration:line-through':''}" title="${m.name}">${m.ico} ${m.name}</button>`; }
    h+='</div>'; }
  box.innerHTML=h;
  box.querySelectorAll('[data-it]').forEach(b=>b.onclick=()=>{ const id=b.dataset.it; off[id]=off[id]?0:1; if(!off[id]) delete off[id]; saveOpts(); renderItemSel(); });
  box.querySelectorAll('[data-cat]').forEach(b=>b.onclick=()=>{ for(const it of SHOP.filter(s=>s.cat===b.dataset.cat&&!ITEMSEL_LOCK.includes(s.id))){ if(b.dataset.v==='1') delete off[it.id]; else off[it.id]=1; } saveOpts(); renderItemSel(); });
  box.querySelectorAll('[data-all]').forEach(b=>b.onclick=()=>{ for(const it of SHOP.filter(s=>!ITEMSEL_LOCK.includes(s.id))){ if(b.dataset.all==='1') delete off[it.id]; else off[it.id]=1; } saveOpts(); renderItemSel(); });
}
document.querySelectorAll('.mtab[data-tab="items"]').forEach(b=>b.addEventListener('click',()=>renderItemSel()));
