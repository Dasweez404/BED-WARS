'use strict';
/* Grande carte de l'objet en main (bas à droite) : grosse icône, nom, rappel de l'effet et chiffres clés. */
{ const _h=drawHud;
  function wrapTxt(t,w){ const out=[]; let l=''; for(const word of String(t).split(' ')){ const n=l?l+' '+word:word; if(ctx.measureText(n).width>w&&l){ out.push(l); l=word; } else l=n; } if(l) out.push(l); return out; }
  function stats(e,id){
    const G=GUNS[id]; if(G){ const d=G.dmg*(G.pel||1); return (G.dmg>0?`${(+d.toFixed(1))} dég./tir · `:'')+(G.mag>1?`${G.mag} coups · `:'')+`${(1/Math.max(.05,G.cd)).toFixed(1)}/s`; }
    if(id==='sword'){ const d=SWORDS[e.sword].d*cv(e,'melee'); return `${+d.toFixed(1)} dégâts · ${Math.ceil(20/d)} coups pour 20 PV`; }
    if(typeof SW2!=='undefined'&&SW2[id]){ const d=SW2[id].dmg*cv(e,'melee'); return `${+d.toFixed(1)} dégâts · ${(1/SW2[id].cd).toFixed(1)} coups/s`; }
    return '';
  }
  drawHud=function(){ _h();
    if(game.state!=='play'||!ctx||!player||!player.alive||(typeof TOUCH!=='undefined'&&TOUCH.on)||typeof shopOpen!=='undefined'&&shopOpen) return;
    const e=player, id=selId, it=ITEMMAP[id]; if(!it) return;
    let name=it.n; if(id==='block') name=`${BNAME[e.bsel]} ×${e.blocks[e.bsel]}`; else if(id==='pick') name=PICKS[e.pick].n; else if(id==='sword') name=SWORDS[e.sword].n;
    const tip=(TIPS[id]||(typeof TIPS2!=='undefined'&&TIPS2[id])||'');
    ctx.save(); ctx.setTransform(DPR,0,0,DPR,0,0);
    const w=250, x=VW-w-14; ctx.font='12px '+FONT; const lines=wrapTxt(tip,w-92).slice(0,6), st=stats(e,id), h=Math.max(92,50+lines.length*15+(st?18:0)), y=VH-h-14;
    ctx.fillStyle='rgba(15,23,42,.72)'; ctx.beginPath(); ctx.roundRect?ctx.roundRect(x,y,w,h,14):ctx.rect(x,y,w,h); ctx.fill(); ctx.strokeStyle='rgba(255,255,255,.28)'; ctx.lineWidth=1.5; ctx.stroke();
    
    if(typeof itemIcon==='function') ctx.drawImage(itemIcon(id,e,128),x+10,y+10,66,66); else { ctx.textAlign='center'; ctx.font='46px '+FONT; ctx.fillStyle='#fff'; ctx.fillText(it.ico||'',x+43,y+57); }
    ctx.textAlign='left'; ctx.font='bold 15px '+FONT; ctx.fillStyle='#fde68a'; ctx.fillText(name,x+86,y+25,w-96);
    ctx.font='12px '+FONT; ctx.fillStyle='#dbe7ff'; lines.forEach((l,i)=>ctx.fillText(l,x+86,y+44+i*15));
    if(st){ ctx.font='bold 11px '+FONT; ctx.fillStyle='#86efac'; ctx.fillText(st,x+86,y+48+lines.length*15,w-96); }
    ctx.restore(); };
}
