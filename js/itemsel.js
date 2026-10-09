'use strict';
/* =====================  ONGLET « OBJETS »  =====================
   Cartes avec icône, description complète et coût de chaque objet ; recherche, filtre par catégorie, activation d'un clic. */
const ITEMSEL_LOCK=['wool','core','wall','pick','sword'];
const ISEL={cat:'Tous',q:'',cache:null};
/* objets retirés par défaut (doublons) : triple arbalète, lance-écume, lance-filet, canon à pop-corn, canon à ressort, masse de forgeron (≈ hache de guerre) */
const DEF_OFF=[]; // (les doublons sont maintenant retirés pour de bon, voir GONE_IDS)
function ensureDefaultOff(){ if(!game.opts||(game.opts.offV|0)>=1) return; game.opts.off=game.opts.off||{}; for(const id of DEF_OFF) game.opts.off[id]=1; game.opts.offV=1; if(typeof saveOpts==='function') saveOpts(); }
{ const _n=newGame; newGame=function(){ ensureDefaultOff(); _n(); }; }
function itemselMeta(it){
  if(!ISEL.cache) ISEL.cache={}; if(ISEL.cache[it.id]) return ISEL.cache[it.id];
  const m=ITEMMAP[it.id]||(typeof RELICS!=='undefined'&&RELICS[it.id])||null; let inf=null; try{ inf=it.info(makeEnt(0,false,'x')); }catch(e){}
  const name=(m&&m.n)||(inf&&inf.name)||it.id, ico=(m&&m.ico)||'•';
  let desc=(inf&&inf.desc)||(typeof TIPS2!=='undefined'&&TIPS2[it.id])||''; if(inf&&inf.tag&&!/PERM|PASSIF/.test(desc)) desc=desc; 
  const perm=inf&&inf.tag==='PERMANENT'?'permanent':'';
  const cost=inf&&inf.cost?Object.entries(inf.cost).filter(([,v])=>v>0).map(([k,v])=>`<span class="ic-c"><i style="background:${RESCOL[k]||'#ccc'}"></i>${v}</span>`).join(''):'';
  return ISEL.cache[it.id]={name,ico,desc:String(desc).replace(/</g,'&lt;'),cost,perm};
}
function renderItemSel(){
  ensureDefaultOff(); const box=document.getElementById('itemsel'); if(!box||typeof SHOP==='undefined') return; game.opts.off=game.opts.off||{};
  const off=game.opts.off, all=SHOP.filter(s=>!ITEMSEL_LOCK.includes(s.id)), cats=['Tous',...new Set(all.map(s=>s.cat))], nOff=all.filter(s=>off[s.id]).length;
  const q=ISEL.q.trim().toLowerCase(), list=all.filter(s=>(ISEL.cat==='Tous'||s.cat===ISEL.cat)&&(!q||(itemselMeta(s).name+' '+itemselMeta(s).desc).toLowerCase().includes(q)));
  const cnt=c=>{ const l=c==='Tous'?all:all.filter(s=>s.cat===c); return l.filter(s=>!off[s.id]).length+'/'+l.length; };
  let h=`<style>
  .isel-top{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-bottom:8px}
  .isel-top input{flex:1;min-width:150px;padding:6px 10px;border-radius:9px;border:2px solid #7a5230;background:#2a1a0e;color:#f4e4c4;font:inherit;font-size:14px}
  .isel-cats{display:flex;flex-wrap:wrap;gap:5px;margin-bottom:10px}
  .isel-cats .obtn small{opacity:.75;margin-left:4px}
  .isel-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:8px;max-height:46vh;overflow:auto;padding:2px 4px 2px 2px}
  .isel-card{display:flex;gap:9px;align-items:flex-start;text-align:left;padding:8px 10px;border-radius:11px;border:2px solid #b98a52;background:#4a2f1b;color:#f4e4c4;cursor:pointer;font:inherit;position:relative;transition:transform .08s,opacity .15s}
  .isel-card:hover{transform:translateY(-1px);border-color:#fde68a}
  .isel-card.off{opacity:.42;border-color:#5a4030;background:#2f2016}
  .isel-card .ii{font-size:26px;line-height:1;flex:none;width:34px;text-align:center}
  .isel-card .nm{font-weight:700;font-size:14px;margin-bottom:2px;padding-right:44px}
  .isel-card .ds{font-size:12px;line-height:1.3;opacity:.9}
  .isel-card .cs{margin-top:4px;font-size:12px;display:flex;gap:8px;flex-wrap:wrap;opacity:.95}
  .ic-c{display:inline-flex;align-items:center;gap:3px;font-weight:700}.ic-c i{width:9px;height:9px;border-radius:50%;display:inline-block;border:1px solid #0008}
  .isel-sw{position:absolute;top:8px;right:8px;width:34px;height:18px;border-radius:9px;background:#3b2a1c;border:2px solid #7a5230}
  .isel-sw::after{content:"";position:absolute;top:1px;left:1px;width:12px;height:12px;border-radius:50%;background:#bbb;transition:transform .12s}
  .isel-card:not(.off) .isel-sw{background:#3f8f4a;border-color:#7be28a}.isel-card:not(.off) .isel-sw::after{transform:translateX(16px);background:#fff}
  .isel-tag{font-size:10px;font-weight:700;color:#7dd3fc;margin-left:5px}
  </style>
  <div class="isel-top"><input id="iselQ" type="search" placeholder="🔍 Rechercher un objet ou une capacité…" value="${ISEL.q.replace(/"/g,'&quot;')}"><b style="white-space:nowrap">${all.length-nOff}/${all.length} actifs</b><button class="obtn" data-all="1">Tout activer</button><button class="obtn" data-all="0">Tout désactiver</button></div>
  <div class="isel-cats">${cats.map(c=>`<button class="obtn ${ISEL.cat===c?'on':''}" data-c="${c}">${c}<small>${cnt(c)}</small></button>`).join('')}${ISEL.cat!=='Tous'?`<button class="obtn" data-cat="1" title="Tout activer dans cette catégorie">✔ catégorie</button><button class="obtn" data-cat="0" title="Tout désactiver dans cette catégorie">✖ catégorie</button>`:''}</div>
  <div class="isel-grid">${list.map(it=>{ const m=itemselMeta(it); return `<button class="isel-card ${off[it.id]?'off':''}" data-it="${it.id}" title="${m.name}"><span class="ii">${m.ico}</span><span style="flex:1"><div class="nm">${m.name}${m.perm?'<span class="isel-tag">PERMANENT</span>':''}</div><div class="ds">${m.desc||'—'}</div>${m.cost?`<div class="cs">${m.cost}</div>`:''}</span><span class="isel-sw"></span></button>`; }).join('')||'<div style="padding:14px;opacity:.7">Aucun objet ne correspond.</div>'}</div>
  <div style="font-size:12px;opacity:.75;margin-top:8px">Clique sur une carte pour activer ou désactiver l'objet : il disparaît de la boutique, pour toi comme pour les bots.</div>`;
  box.innerHTML=h;
  const qi=document.getElementById('iselQ'); qi.oninput=()=>{ ISEL.q=qi.value; const pos=qi.selectionStart; renderItemSel(); const n=document.getElementById('iselQ'); n.focus(); try{ n.setSelectionRange(pos,pos); }catch(e){} };
  const save=()=>{ saveOpts(); renderItemSel(); };
  box.querySelectorAll('[data-it]').forEach(b=>b.onclick=()=>{ const id=b.dataset.it; if(off[id]) delete off[id]; else off[id]=1; save(); });
  box.querySelectorAll('[data-c]').forEach(b=>b.onclick=()=>{ ISEL.cat=b.dataset.c; renderItemSel(); });
  box.querySelectorAll('[data-cat]').forEach(b=>b.onclick=()=>{ for(const it of all.filter(s=>s.cat===ISEL.cat)){ if(b.dataset.cat==='1') delete off[it.id]; else off[it.id]=1; } save(); });
  box.querySelectorAll('[data-all]').forEach(b=>b.onclick=()=>{ for(const it of all){ if(b.dataset.all==='1') delete off[it.id]; else off[it.id]=1; } save(); });
}
document.querySelectorAll('.mtab[data-tab="items"]').forEach(b=>b.addEventListener('click',()=>{ ISEL.cache=null; renderItemSel(); }));
