'use strict';
/* =====================  COSMÉTIQUES : 18 nouvelles coiffes et masques  =====================
   Mêmes proportions chibi cubiques, deux petits points pour les yeux. Rendus en 3D (cubes fusionnés) et en 2D (sprites). */
const NEW_HATS=['Masque totem','Cagoule perroquet','Tête de crocodile','Casque viking','Couronne','Toque de chef','Cornes de diable','Bonnet de Noël','Scaphandre','Oreilles d\'ours','Tête de requin','Citrouille','Sombrero','Tête de poulpe','Oreilles de chat','Oreilles de lapin','Heaume de chevalier','Casque de mineur'];
const HAT0=HATS.length; HATS.push(...NEW_HATS);
/* ---------- 3D : parties de cubes, repère = sommet de la tête (le visage est à x=+.41, y≈-.37) ---------- */
const HAT3D={};
{ const B=()=>GEO.box, h=(x,y,z,sx,sy,sz,color,rot)=>({geo:GEO.box,pos:[x,y,z],scale:[sx,sy,sz],color,rot});
  HAT3D[0]=()=>[ // masque totem
    h(.47,-.36,0,.07,.86,.92,'#8a5a2b'),h(.51,-.2,0,.02,.1,.9,'#dc2626'),h(.51,-.52,0,.02,.1,.9,'#fbbf24'),h(.515,-.3,-.2,.02,.1,.1,'#15121a'),h(.515,-.3,.2,.02,.1,.1,'#15121a'),
    h(.515,-.66,-.18,.02,.1,.12,'#f8fafc'),h(.515,-.66,.18,.02,.1,.12,'#f8fafc'),h(.515,-.66,0,.02,.1,.12,'#f8fafc'),
    h(0,.16,-.24,.1,.5,.1,'#dc2626',[.15,0,0]),h(0,.2,0,.1,.58,.1,'#fbbf24'),h(0,.16,.24,.1,.5,.1,'#14b8a6',[-.15,0,0]),h(-.1,.04,0,.82,.1,.9,'#6b4423')];
  HAT3D[1]=()=>[ // cagoule perroquet
    h(-.02,.02,0,.9,.1,.9,'#dc2626'),h(0,-.22,-.45,.88,.5,.06,'#dc2626'),h(0,-.22,.45,.88,.5,.06,'#dc2626'),h(-.45,-.2,0,.06,.52,.9,'#dc2626'),
    h(-.05,.2,0,.12,.4,.12,'#2563eb'),h(.08,.16,.0,.12,.3,.12,'#22c55e'),h(-.18,.14,0,.12,.26,.12,'#fbbf24'),
    h(.54,-.36,0,.28,.12,.2,'#fbbf24'),h(.62,-.44,0,.14,.1,.14,'#f97316'),h(0,-.22,-.52,.5,.4,.05,'#ef4444'),h(0,-.22,.52,.5,.4,.05,'#ef4444')];
  HAT3D[2]=()=>[ // tête de crocodile
    h(0,.0,0,.86,.1,.86,'#4d9a3b'),h(.58,-.4,0,.62,.2,.56,'#4d9a3b'),h(.55,-.57,0,.52,.1,.5,'#3f7f31'),h(.6,-.49,0,.62,.03,.5,'#15121a'),
    ...[0,1,2,3].flatMap(i=>[h(.4+i*.14,-.46,-.2,.06,.07,.06,'#f8fafc'),h(.4+i*.14,-.46,.2,.06,.07,.06,'#f8fafc')]),
    h(.9,-.33,-.12,.04,.04,.06,'#15121a'),h(.9,-.33,.12,.04,.04,.06,'#15121a'),h(.2,.04,-.26,.2,.14,.2,'#4d9a3b'),h(.2,.04,.26,.2,.14,.2,'#4d9a3b'),
    ...[0,1,2].map(i=>h(-.1-i*.14,.05,0,.1,.1,.1,'#2f6a24'))];
  HAT3D[3]=()=>[ // casque viking
    h(0,.02,0,.9,.18,.9,'#9ca3af'),h(0,-.1,0,.92,.07,.92,'#6b7280'),h(.46,-.2,0,.05,.28,.1,'#9ca3af'),
    h(0,.14,-.52,.12,.2,.12,'#f5ecd2'),h(0,.3,-.6,.1,.2,.1,'#f5ecd2'),h(0,.14,.52,.12,.2,.12,'#f5ecd2'),h(0,.3,.6,.1,.2,.1,'#f5ecd2')];
  HAT3D[4]=()=>[ // couronne
    h(0,.0,0,.88,.12,.88,'#fbbf24'),h(.38,.14,0,.14,.22,.14,'#fbbf24'),h(-.38,.14,0,.14,.22,.14,'#fbbf24'),h(0,.14,.38,.14,.22,.14,'#fbbf24'),h(0,.14,-.38,.14,.22,.14,'#fbbf24'),h(.2,.16,.2,.1,.18,.1,'#fbbf24'),h(.2,.16,-.2,.1,.18,.1,'#fbbf24'),
    h(.445,.0,0,.03,.07,.07,'#ef4444'),h(0,.0,.445,.07,.07,.03,'#22d3ee'),h(0,.0,-.445,.07,.07,.03,'#22d3ee')];
  HAT3D[5]=()=>[ // toque de chef
    h(0,.0,0,.9,.12,.9,'#f8fafc'),h(0,.3,0,.84,.5,.84,'#ffffff'),h(0,.62,0,.7,.2,.7,'#f1f5f9'),h(.1,.4,.3,.3,.3,.3,'#f8fafc'),h(-.1,.4,-.3,.3,.3,.3,'#f8fafc')];
  HAT3D[6]=()=>[ // cornes de diable
    h(0,.0,0,.86,.1,.86,'#7f1d1d'),h(0,.16,-.28,.12,.26,.12,'#dc2626',[.3,0,0]),h(0,.34,-.34,.09,.2,.09,'#ef4444',[.5,0,0]),h(0,.16,.28,.12,.26,.12,'#dc2626',[-.3,0,0]),h(0,.34,.34,.09,.2,.09,'#ef4444',[-.5,0,0])];
  HAT3D[7]=()=>[ // bonnet de Noël
    h(0,.02,0,.92,.14,.92,'#ffffff'),h(-.06,.2,0,.7,.3,.7,'#dc2626'),h(-.14,.42,0,.46,.26,.46,'#dc2626'),h(-.26,.62,.0,.3,.2,.3,'#dc2626',[0,0,.5]),h(-.42,.62,0,.2,.2,.2,'#ffffff')];
  HAT3D[8]=()=>[ // scaphandre
    h(0,.1,0,1.0,.3,1.0,'#b45309'),h(0,-.25,-.5,1.0,.7,.08,'#b45309'),h(0,-.25,.5,1.0,.7,.08,'#b45309'),h(-.5,-.25,0,.08,.7,1.0,'#b45309'),
    h(.52,-.28,-.46,.08,.62,.08,'#d97706'),h(.52,-.28,.46,.08,.62,.08,'#d97706'),h(.52,-.62,0,.08,.08,1.0,'#d97706'),h(.52,.0,0,.08,.1,1.0,'#d97706'),
    h(0,.28,0,.2,.14,.2,'#fbbf24'),h(-.58,.0,0,.12,.12,.12,'#78350f'),h(.3,.26,.4,.08,.08,.08,'#fbbf24'),h(.3,.26,-.4,.08,.08,.08,'#fbbf24')];
  HAT3D[9]=()=>[ // oreilles d'ours
    h(0,.0,0,.84,.08,.84,'#7c4a21'),h(-.05,.14,-.32,.26,.26,.26,'#7c4a21'),h(-.05,.14,.32,.26,.26,.26,'#7c4a21'),h(.0,.14,-.32,.14,.14,.14,'#e8c39e'),h(.0,.14,.32,.14,.14,.14,'#e8c39e')];
  HAT3D[10]=()=>[ // tête de requin
    h(0,.02,0,.88,.14,.88,'#7b8da3'),h(-.05,.28,0,.4,.42,.08,'#64748b',[0,0,-.2]),h(-.2,.12,0,.14,.2,.1,'#64748b'),
    ...[-.3,-.15,0,.15,.3].map((z,i)=>h(.46,-.02-(i%2)*.06,z,.04,.1,.1,'#ffffff')),h(0,-.12,-.45,.88,.12,.06,'#7b8da3'),h(0,-.12,.45,.88,.12,.06,'#7b8da3')];
  HAT3D[11]=()=>[ // citrouille
    h(0,.12,0,.98,.5,.98,'#f97316'),h(0,.12,0,.9,.52,.9,'#fb923c'),h(0,.46,0,.12,.2,.12,'#3f7f31'),
    h(.5,.2,-.2,.02,.14,.12,'#15121a'),h(.5,.2,.2,.02,.14,.12,'#15121a'),h(.5,.0,0,.02,.08,.4,'#15121a')];
  HAT3D[12]=()=>[ // sombrero
    h(0,-.02,0,1.6,.05,1.6,'#e6c27a'),h(0,.22,0,.56,.4,.56,'#e6c27a'),h(0,.05,0,.6,.07,.6,'#dc2626'),h(0,.46,0,.3,.1,.3,'#d4a94f')];
  HAT3D[13]=()=>[ // tête de poulpe
    h(0,.1,0,.92,.34,.92,'#a855f7'),h(.1,.3,.2,.2,.1,.2,'#c084fc'),h(-.1,.3,-.2,.2,.1,.2,'#c084fc'),
    ...[[-.2,-.5],[.2,-.5],[-.2,.5],[.2,.5],[-.45,0]].map(([x,z],i)=>h(x,-.3,z,.12,.58,.12,i%2?'#a855f7':'#c084fc'))];
  HAT3D[14]=()=>[ // oreilles de chat
    h(0,.0,0,.84,.08,.84,'#4b5563'),h(-.05,.16,-.3,.2,.3,.14,'#4b5563',[.15,0,0]),h(-.05,.16,.3,.2,.3,.14,'#4b5563',[-.15,0,0]),h(.0,.14,-.3,.1,.2,.06,'#f9a8d4'),h(.0,.14,.3,.1,.2,.06,'#f9a8d4'),
    h(.43,-.5,-.34,.02,.02,.4,'#e5e7eb'),h(.43,-.56,-.34,.02,.02,.4,'#e5e7eb'),h(.43,-.5,.34,.02,.02,.4,'#e5e7eb'),h(.43,-.56,.34,.02,.02,.4,'#e5e7eb')];
  HAT3D[15]=()=>[ // oreilles de lapin
    h(0,.0,0,.84,.08,.84,'#f1f5f9'),h(-.05,.46,-.22,.14,.8,.1,'#f8fafc',[.12,0,0]),h(-.05,.46,.22,.14,.8,.1,'#f8fafc',[-.12,0,0]),h(.0,.44,-.22,.06,.6,.06,'#f9a8d4',[.12,0,0]),h(.0,.44,.22,.06,.6,.06,'#f9a8d4',[-.12,0,0])];
  HAT3D[16]=()=>[ // heaume de chevalier
    h(0,.0,0,.94,.32,.94,'#cbd5e1'),h(0,-.22,-.47,.94,.6,.07,'#94a3b8'),h(0,-.22,.47,.94,.6,.07,'#94a3b8'),h(-.47,-.22,0,.07,.6,.94,'#94a3b8'),h(.48,-.55,0,.06,.1,.94,'#94a3b8'),
    h(0,.2,0,.1,.16,.94,'#e2e8f0'),h(-.1,.36,0,.1,.3,.5,'#dc2626',[0,0,.3])];
  HAT3D[17]=()=>[ // casque de mineur
    h(0,.04,0,.92,.24,.92,'#facc15'),h(.28,-.02,0,.56,.06,.92,'#eab308'),h(0,.2,0,.1,.12,.5,'#eab308'),h(.5,.1,0,.14,.14,.14,'#fff7b0'),h(.58,.1,0,.03,.1,.1,'#fde68a')];
}
{ const _hp=hatParts;
  hatParts=function(kind,hatc,trim,light,hair){ const f=HAT3D[kind-HAT0]; return f?f(hatc,light):_hp(kind,hatc,trim,light,hair); }; }

/* ---------- 2D : sprites (repère 96×128 ; tête centrée en (48,hy), hy = 44 + bob) ---------- */
const HAT2D={};
{ const ell=(c,x,y,rx,ry,fill,w,rot)=>{ c.beginPath(); c.ellipse(x,y,rx,ry,rot||0,0,6.3); fillStroke(c,fill,w||2.5); };
  const poly=(c,pts,fill,w)=>{ c.beginPath(); c.moveTo(pts[0][0],pts[0][1]); for(let i=1;i<pts.length;i++) c.lineTo(pts[i][0],pts[i][1]); c.closePath(); fillStroke(c,fill,w||2.5); };
  const rect=(c,x,y,w,h,fill,r,lw)=>{ c.beginPath(); rrp(c,x,y,w,h,r===undefined?4:r); fillStroke(c,fill,lw||2.5); };
  HAT2D[0]=(c,hy,top)=>{ // totem
    poly(c,[[22,top+6],[74,top+6],[78,hy+34],[48,hy+42],[18,hy+34]],'#8a5a2b',3); c.fillStyle='#dc2626'; c.fillRect(21,hy-14,54,9); c.fillStyle='#fbbf24'; c.fillRect(20,hy+10,56,8);
    for(const x of [34,48,62]){ c.fillStyle='#f8fafc'; c.fillRect(x-5,hy+22,10,9); c.strokeStyle=OUT; c.lineWidth=1.5; c.strokeRect(x-5,hy+22,10,9); }
    poly(c,[[30,top+6],[24,top-8],[40,top+2]],'#dc2626',2.5); poly(c,[[42,top+4],[48,top-12],[56,top+4]],'#fbbf24',2.5); poly(c,[[56,top+2],[72,top-8],[66,top+6]],'#14b8a6',2.5); };
  HAT2D[1]=(c,hy,top)=>{ // cagoule perroquet
    c.beginPath(); c.ellipse(48,top+16,33,20,0,Math.PI,6.3); c.lineTo(80,hy-4); c.lineTo(16,hy-4); c.closePath(); fillStroke(c,'#dc2626',3);
    poly(c,[[36,top+2],[40,top-10],[48,top]],'#2563eb',2.5); poly(c,[[46,top],[54,top-14],[60,top+2]],'#22c55e',2.5); poly(c,[[58,top+4],[68,top-10],[68,top+10]],'#fbbf24',2.5);
    poly(c,[[42,hy+5],[56,hy+5],[48,hy+16]],'#fbbf24',2.5); poly(c,[[44,hy+13],[54,hy+13],[48,hy+22]],'#f97316',2.5); };
  HAT2D[2]=(c,hy,top)=>{ // crocodile
    c.beginPath(); c.ellipse(48,top+16,33,18,0,Math.PI,6.3); c.lineTo(80,hy-6); c.lineTo(16,hy-6); c.closePath(); fillStroke(c,'#4d9a3b',3);
    ell(c,30,top+2,9,9,'#4d9a3b',2.5); ell(c,66,top+2,9,9,'#4d9a3b',2.5); rect(c,30,hy+4,38,20,'#4d9a3b',8,3); rect(c,32,hy+19,34,9,'#3f7f31',4,2.5);
    c.fillStyle='#15121a'; c.fillRect(34,hy+19,30,2.5); for(let i=0;i<4;i++){ poly(c,[[36+i*8,hy+21],[40+i*8,hy+21],[38+i*8,hy+27]],'#ffffff',1.2); }
    c.fillStyle='#15121a'; c.fillRect(40,hy+8,3,3); c.fillRect(54,hy+8,3,3); };
  HAT2D[3]=(c,hy,top)=>{ // viking
    c.beginPath(); c.ellipse(48,top+14,32,20,0,Math.PI,6.3); c.lineTo(80,top+16); c.lineTo(16,top+16); c.closePath(); fillStroke(c,'#9ca3af',3); rect(c,15,top+13,66,8,'#6b7280',3,2.5); rect(c,45,top+16,6,16,'#9ca3af',2,2);
    poly(c,[[16,top+10],[4,top-2],[6,top-12],[12,top-4],[22,top+2]],'#f5ecd2',2.5); poly(c,[[80,top+10],[92,top-2],[90,top-12],[84,top-4],[74,top+2]],'#f5ecd2',2.5); };
  HAT2D[4]=(c,hy,top)=>{ // couronne
    poly(c,[[22,top+16],[22,top-6],[34,top+4],[48,top-14],[62,top+4],[74,top-6],[74,top+16]],'#fbbf24',3); rect(c,22,top+11,52,8,'#f59e0b',3,2.5);
    for(const [x,col] of [[34,'#ef4444'],[48,'#22d3ee'],[62,'#ef4444']]){ c.beginPath(); c.arc(x,top+15,3.6,0,6.3); fillStroke(c,col,1.6); } };
  HAT2D[5]=(c,hy,top)=>{ // toque
    rect(c,24,top+6,48,14,'#f8fafc',4,3); ell(c,34,top-2,16,13,'#ffffff',2.5); ell(c,62,top-2,16,13,'#ffffff',2.5); ell(c,48,top-7,18,13,'#ffffff',2.5); rect(c,24,top+6,48,14,'#f8fafc',4,3); };
  HAT2D[6]=(c,hy,top)=>{ // cornes de diable
    c.beginPath(); c.ellipse(48,top+18,31,12,0,Math.PI,6.3); c.lineTo(78,top+20); c.lineTo(18,top+20); c.closePath(); fillStroke(c,'#7f1d1d',3);
    poly(c,[[24,top+10],[16,top-14],[38,top+4]],'#dc2626',2.5); poly(c,[[72,top+10],[80,top-14],[58,top+4]],'#dc2626',2.5); };
  HAT2D[7]=(c,hy,top)=>{ // bonnet de Noël
    poly(c,[[20,top+16],[28,top-8],[56,top-22],[84,top-4],[76,top+16]],'#dc2626',3); rect(c,16,top+11,64,12,'#ffffff',6,3); c.beginPath(); c.arc(84,top-6,8,0,6.3); fillStroke(c,'#ffffff',2.5); };
  HAT2D[8]=(c,hy,top)=>{ // scaphandre
    c.beginPath(); c.ellipse(48,hy+2,40,38,0,0,6.3); c.lineWidth=0; c.save(); c.clip(); c.restore();
    c.beginPath(); c.ellipse(48,top+22,38,22,0,Math.PI,6.3); c.lineTo(86,hy+26); c.lineTo(10,hy+26); c.closePath(); c.strokeStyle='#b45309'; c.lineWidth=0; fillStroke(c,'#b45309',3);
    c.save(); c.globalCompositeOperation='destination-out'; rrp(c,24,hy-16,48,44,10); c.fill(); c.restore(); rrp(c,24,hy-16,48,44,10); c.lineWidth=5; c.strokeStyle='#d97706'; c.stroke(); c.lineWidth=2; c.strokeStyle=OUT; c.stroke();
    for(const [x,y] of [[16,hy-10],[80,hy-10],[16,hy+16],[80,hy+16]]){ c.beginPath(); c.arc(x,y,3,0,6.3); fillStroke(c,'#fbbf24',1.5); } rect(c,42,top-4,12,10,'#fbbf24',3,2); };
  HAT2D[9]=(c,hy,top)=>{ ell(c,24,top+8,14,14,'#7c4a21',3); ell(c,72,top+8,14,14,'#7c4a21',3); ell(c,24,top+8,7,7,'#e8c39e',1.5); ell(c,72,top+8,7,7,'#e8c39e',1.5); };
  HAT2D[10]=(c,hy,top)=>{ c.beginPath(); c.ellipse(48,top+18,31,12,0,Math.PI,6.3); c.lineTo(78,top+20); c.lineTo(18,top+20); c.closePath(); fillStroke(c,'#7b8da3',3);
    poly(c,[[40,top+6],[50,top-14],[66,top+8]],'#64748b',3); for(let i=0;i<5;i++) poly(c,[[24+i*12,top+18],[30+i*12,top+18],[27+i*12,top+27]],'#ffffff',1.2); };
  HAT2D[11]=(c,hy,top)=>{ ell(c,48,top+6,36,22,'#f97316',3); c.strokeStyle='#c2410c'; c.lineWidth=2.5; for(const x of [30,48,66]){ c.beginPath(); c.moveTo(x,top-14); c.quadraticCurveTo(x+(x<48?-6:6),top+6,x,top+26); c.stroke(); } rect(c,44,top-30,9,14,'#3f7f31',3,2.5);
    poly(c,[[26,top+4],[36,top-4],[40,top+10]],'#15121a',1.5); poly(c,[[56,top+10],[60,top-4],[70,top+4]],'#15121a',1.5); };
  HAT2D[12]=(c,hy,top)=>{ ell(c,48,top+14,52,10,'#e6c27a',3); poly(c,[[30,top+12],[36,top-18],[60,top-18],[66,top+12]],'#e6c27a',3); rect(c,30,top+3,36,7,'#dc2626',2,2.5); };
  HAT2D[13]=(c,hy,top)=>{ c.beginPath(); c.ellipse(48,top+18,34,26,0,Math.PI,6.3); c.lineTo(82,top+20); c.lineTo(14,top+20); c.closePath(); fillStroke(c,'#a855f7',3);
    for(const x of [12,24,72,84]){ c.beginPath(); rrp(c,x-5,top+14,10,48,5); fillStroke(c,x%24?'#c084fc':'#a855f7',2.5); } ell(c,38,top-2,4,3,'#c084fc',1); ell(c,60,top-4,4,3,'#c084fc',1); };
  HAT2D[14]=(c,hy,top)=>{ poly(c,[[18,top+16],[22,top-14],[42,top+8]],'#4b5563',3); poly(c,[[78,top+16],[74,top-14],[54,top+8]],'#4b5563',3); poly(c,[[24,top+8],[26,top-4],[34,top+8]],'#f9a8d4',1.5); poly(c,[[72,top+8],[70,top-4],[62,top+8]],'#f9a8d4',1.5);
    c.strokeStyle='#e5e7eb'; c.lineWidth=2; for(const y of [hy+10,hy+15]){ c.beginPath(); c.moveTo(14,y); c.lineTo(2,y-3); c.moveTo(82,y); c.lineTo(94,y-3); c.stroke(); } };
  HAT2D[15]=(c,hy,top)=>{ rect(c,26,top-20,16,40,'#f8fafc',8,3); rect(c,54,top-20,16,40,'#f8fafc',8,3); rect(c,30,top-14,8,28,'#f9a8d4',4,1.5); rect(c,58,top-14,8,28,'#f9a8d4',4,1.5); };
  HAT2D[16]=(c,hy,top)=>{ c.beginPath(); c.ellipse(48,top+20,36,26,0,Math.PI,6.3); c.lineTo(84,hy+24); c.lineTo(12,hy+24); c.closePath(); fillStroke(c,'#cbd5e1',3);
    c.save(); c.globalCompositeOperation='destination-out'; rrp(c,26,hy-12,44,36,8); c.fill(); c.restore(); rrp(c,26,hy-12,44,36,8); c.lineWidth=4; c.strokeStyle='#94a3b8'; c.stroke(); c.lineWidth=2; c.strokeStyle=OUT; c.stroke();
    poly(c,[[40,top+2],[28,top-26],[56,top-14],[60,top+2]],'#dc2626',2.5); rect(c,44,top+4,8,22,'#e2e8f0',2,2); };
  HAT2D[17]=(c,hy,top)=>{ c.beginPath(); c.ellipse(48,top+16,32,19,0,Math.PI,6.3); c.lineTo(80,top+18); c.lineTo(16,top+18); c.closePath(); fillStroke(c,'#facc15',3); rect(c,12,top+13,72,7,'#eab308',3,2.5); rect(c,42,top-10,12,24,'#eab308',3,2);
    c.beginPath(); c.arc(48,top-2,8,0,6.3); fillStroke(c,'#fff7b0',2.5); };
}
{ const _d=drawPirateFrame;
  drawPirateFrame=function(c,ox,pose,td,look,neutral){
    const l=lookOf(look), k=l.hat-HAT0, nw=k>=0&&HAT2D[k];
    _d(c,ox,pose,td,nw?Object.assign({},l,{hat:3}):look,neutral);
    const hy=44+pose.bob, top=hy-30;
    if(nw){ c.save(); c.translate(ox,0); HAT2D[k](c,hy,top);
      if([0,1,2,8,16].includes(k)){ c.fillStyle='#15121a'; for(const x of (l.patch?[60]:[36,60])){ c.beginPath(); c.arc(x,hy+3,4.2,0,6.3); c.fill(); } } // les deux petits points restent visibles
      c.restore(); }
    // finition 2D : lumière douce en haut à gauche, ombre en bas (uniquement sur ce qui est dessiné)
    c.save(); c.beginPath(); c.rect(ox,0,FR_W,FR_H); c.clip(); c.globalCompositeOperation='source-atop';
    const g1=c.createRadialGradient(ox+34,hy-8,2,ox+34,hy-8,52); g1.addColorStop(0,'rgba(255,255,255,.26)'); g1.addColorStop(1,'rgba(255,255,255,0)'); c.fillStyle=g1; c.fillRect(ox,0,FR_W,FR_H);
    const g2=c.createLinearGradient(0,62,0,128); g2.addColorStop(0,'rgba(20,10,30,0)'); g2.addColorStop(1,'rgba(20,10,30,.22)'); c.fillStyle=g2; c.fillRect(ox,0,FR_W,FR_H); c.restore();
  };
}
