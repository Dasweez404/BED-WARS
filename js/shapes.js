'use strict';
/* =====================  SILHOUETTES PAR CLASSE  =====================
   Chaque classe a un corps cubique reconnaissable : le charpentier est trapu, la brute taillée en V, l'éclaireur fin et élancé,
   le mystique porte une robe, le canonnier a la panse ronde, le pillard un gros ventre et une bourse, le corsaire un baudrier doré. */
let __CLS='matelot';
const CLSCALE={matelot:1,corsaire:1.02,canonnier:1.06,eclaireur:.98,charpentier:1.06,brute:1.14,mystique:1,pillard:1.04};
{ const B=()=>GEO.box, P=(x,y,z,sx,sy,sz,color,rot)=>({geo:GEO.box,pos:[x,y,z],scale:[sx,sy,sz],color,rot});
  const bodies={
    corsaire:(td)=>[P(0,.28,0,.54,.5,.42,td.dark),P(0,.06,0,.56,.06,.44,td.col),P(0,.3,0,.12,.7,.45,'#fbbf24',[0,0,.55]),P(0,.52,-.3,.24,.1,.16,'#fbbf24'),P(0,.52,.3,.24,.1,.16,'#fbbf24'),P(0,.14,0,.57,.07,.45,'#3b2a1c'),P(-.28,.34,0,.05,.66,.56,'#b91c1c'),P(-.28,.66,0,.06,.08,.58,'#fbbf24')],
    canonnier:(td)=>[P(0,.3,0,.56,.46,.5,td.dark),P(0,.16,0,.68,.32,.62,td.dark),P(0,.06,0,.7,.06,.64,td.col),P(0,.2,0,.72,.08,.66,'#3b2a1c'),P(-.4,.32,0,.3,.34,.3,'#6b4a2a'),P(-.4,.32,0,.32,.05,.32,'#4b5563'),P(-.4,.46,0,.32,.05,.32,'#4b5563'),P(-.56,.4,0,.1,.04,.04,'#fb923c'),P(.34,.34,0,.03,.4,.4,'#3b2a1c')],
    eclaireur:(td)=>[P(0,.32,0,.36,.62,.28,td.dark),P(0,.04,0,.38,.06,.3,td.col),P(0,.6,0,.44,.12,.36,'#ef4444'),P(-.36,.52,0,.5,.1,.16,'#ef4444',[0,0,.4]),P(-.26,.32,0,.14,.34,.26,'#7c4a21'),P(0,.16,0,.38,.05,.3,'#3b2a1c')],
    charpentier:(td)=>[P(0,.27,0,.72,.52,.58,td.dark),P(0,.05,0,.74,.06,.6,td.col),P(.3,.24,0,.04,.4,.5,'#c8a165'),P(0,.12,0,.75,.08,.61,'#6b4a2a'),P(.1,.1,.38,.1,.22,.08,'#9ca3af'),P(-.32,.5,0,.07,.8,.07,'#7c4a21',[0,0,.35]),P(-.5,.88,0,.26,.18,.34,'#6b7280',[0,0,.35])],
    brute:(td)=>[P(0,.46,0,.82,.34,.66,td.dark),P(0,.15,0,.46,.28,.4,td.dark),P(0,.04,0,.48,.05,.42,td.col),P(0,.68,-.46,.28,.18,.24,'#6b7280'),P(0,.68,.46,.28,.18,.24,'#6b7280'),P(0,.8,-.46,.1,.16,.1,'#9ca3af'),P(0,.8,.46,.1,.16,.1,'#9ca3af'),P(0,.17,0,.5,.08,.43,'#3b2a1c'),P(.3,.17,0,.03,.12,.12,'#f5ecd2')],
    mystique:(td)=>[P(0,.4,0,.46,.42,.4,td.dark),P(0,.12,0,.72,.3,.6,td.dark),P(0,.0,0,.76,.06,.64,'#fbbf24'),P(-.26,.58,0,.2,.34,.46,td.col),P(.26,.4,0,.02,.12,.12,td.light),P(.26,.22,0,.02,.07,.07,td.light),P(0,.3,0,.48,.06,.42,'#fbbf24')],
    pillard:(td)=>[P(0,.3,0,.52,.46,.44,td.dark),P(0,.16,0,.66,.3,.58,td.dark),P(0,.06,0,.68,.06,.6,td.col),P(0,.28,0,.68,.07,.6,'#7c4a21'),P(.0,.12,.38,.24,.28,.16,'#fbbf24'),P(.0,.28,.38,.16,.06,.12,'#7c4a21'),P(.34,.2,0,.03,.14,.14,'#fbbf24')]
  };
  const arms={brute:(td)=>[P(0,-.24,0,.36,.36,.36,td.col)],charpentier:(td)=>[P(0,-.21,0,.25,.25,.25,td.col)],eclaireur:(td)=>[P(0,-.2,0,.16,.2,.16,td.col)],canonnier:(td)=>[P(0,-.2,0,.22,.22,.22,td.col)],mystique:(td)=>[P(0,-.2,0,.24,.2,.2,td.dark)]};
  const _pv=pirateVariant;
  pirateVariant=function(td,neutral,look){ const cls=__CLS; if(!bodies[cls]) return _pv(td,neutral,look);
    const key='c'+cls+'|'+(neutral?'n':'t')+td.col+'|'+lookKey(lookOf(look)); if(PG[key]) return PG[key];
    const base=_pv(td,neutral,look), v=Object.assign({},base); v.body=mergeParts(bodies[cls](td)); if(arms[cls]) v.arm=mergeParts(arms[cls](td)); return PG[key]=v; };
  const _cp=createPirate;
  createPirate=function(td,opts){ __CLS=(opts&&opts.cls)||'matelot'; let g; try{ g=_cp(td,opts); } finally { const c=__CLS; __CLS='matelot'; if(g&&g.userData&&isFinite(g.userData.base)&&!(opts&&opts.scale)&&CLSCALE[c]){ g.userData.base*=CLSCALE[c]; g.scale.setScalar(g.userData.base); } if(g) g.userData.cls=c; } return g; }; }
