'use strict';
/* =====================  RETRAITS DÉFINITIFS · PARAPLUIE PASSIF · BRUME D'ÉQUIPE  ===================== */
{ const G=GONE_IDS, gone=id=>G.includes(id);
  for(let i=SHOP.length-1;i>=0;i--) if(gone(SHOP[i].id)) SHOP.splice(i,1);
  for(let i=ITEMS.length-1;i>=0;i--) if(gone(ITEMS[i].id)) ITEMS.splice(i,1);
  for(const id of G){ delete SHOPMAP[id]; delete GUNS[id]; delete PERM[id]; delete PERM_DEF[id]; if(typeof BOT_USES!=='undefined') BOT_USES.delete(id); }
  const clean=(arr,key)=>{ for(let i=arr.length-1;i>=0;i--){ const v=key?arr[i][0]:arr[i]; if(gone(v)) arr.splice(i,1); } };
  clean(BOT_RANGED,true); clean(BOT_BUY,true); clean(BOT_OPTIONAL,false); if(typeof SIGS!=='undefined') clean(SIGS,false);
  if(typeof POOL_EXTRA!=='undefined') clean(POOL_EXTRA,false);
  if(typeof BARG!=='undefined'){ BARG.melee=BARG.melee.filter(i=>!gone(i)); BARG.gun=BARG.gun.filter(i=>!gone(i)); }
  if(typeof PERS!=='undefined') for(const k in PERS){ const p=PERS[k]; if(Array.isArray(p.likes)) p.likes=p.likes.filter(i=>!gone(i)); }
}
/* ---- parapluie planeur : passif tant qu'on est en vie, sans recharge ---- */
{ const _o=owned; owned=function(e,id){ if(id==='glide') return false; return _o(e,id); }; // plus d'emplacement dans la barre
  PERM_DEF.glide=PERM.glide={cd:0,keep:true,cost:{bronze:30,silver:8}};
  const it=SHOPMAP.glide; if(it){ it.cat='Outils';
    it.info=e=>e.own.glide?{name:'Parapluie planeur',desc:'Équipé : actif tout seul dès que tu tombes.',cost:{},ok:false,tag:'PASSIF'}:{name:'Parapluie planeur (passif)',desc:'Toujours actif : dès que tu tombes, tu planes doucement et tu ne prends plus de dégâts de chute. Aucune recharge, rien à activer, gardé à ta mort.',cost:{bronze:30,silver:8}};
    it.buy=e=>{ e.own.glide=true; }; }
  TIPS2.glide='Passif : en chute, tu planes doucement (aucun dégât de chute)';
  const _u=update;
  update=function(dt){ for(const e of ents){ if(e.own&&e.own.glide&&e.alive&&!e.riding&&e.z>8&&e.vz<-30&&!(e.glide>.12)) e.glide=.2; } _u(dt); };
}
/* ---- brume magique : prix et description d'équipe ---- */
{ const it=SHOPMAP.cloak; if(it){ const old=it.info; it.info=function(e){ const r=old.call(this,e); if(!r||r.ok===false||!r.desc) return r; return Object.assign({},r,{desc:'Toi et ton équipe devenez invisibles 7 s (les ennemis ne vous voient plus de loin) et courez plus vite 2,5 s. '+(/recharge/.test(r.desc)?r.desc.replace(/^À volonté,?\s*/,'Utilisable à volonté, '):'')}); }; } }
