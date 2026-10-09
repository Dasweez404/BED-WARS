'use strict';
/* ===== Échelle des cartes : la disposition « Grand large » devient la norme ===== */
(function(){
  const sc=(p,f)=>{ const o=[Math.max(10,Math.min(90,Math.round(50+(p[0]-50)*f))),Math.max(10,Math.min(90,Math.round(50+(p[1]-50)*f)))]; if(p[2]) o.push(p[2]); return o; };
  const WIDE=MAPS.wide;
  const BASES=WIDE.bases, DIA=WIDE.dia, RELAY=WIDE.relay;
  for(const id of Object.keys(MAPS)){
    const M=MAPS[id]; if(id==='wide') continue;
    if(id==='corners'){ M.bases=M.bases.map(p=>sc(p,1.18)); M.dia=M.dia.map(p=>sc(p,1.05)); continue; }
    const d0=Math.hypot(M.bases[0][0]-50,M.bases[0][1]-50), f=34/d0;
    M.bases=M.bases.map((b,i)=>[BASES[i][0],BASES[i][1],b[2]||BASES[i][2]]);
    M.dia=DIA.map(p=>[p[0],p[1]]);
    if(id==='classic'||id==='close'||id==='tides'||id==='citadel'||id==='jungle'||id==='tempest') M.relay=RELAY.map(p=>[p[0],p[1]]);
    else if(id==='scatter'){ M.relay=M.relay.map(p=>sc(p,1.25)); }
    else M.relay=(M.relay||[]).map(p=>sc(p,Math.min(f,1.3)));
  }
  // les îlots relais du centre restent loin du centre pour le tourbillon / la citadelle
  if(MAPS.citadel) MAPS.citadel.relay=[];
  if(MAPS.glacier) MAPS.glacier.relay=RELAY.map(p=>[p[0],p[1]]);
  MAPS.classic.n='Archipel'; MAPS.classic.d='La carte classique : 4 îles aux points cardinaux, de petits îlots relais et le galion au centre.';
  delete MAPS.wide;
})();
