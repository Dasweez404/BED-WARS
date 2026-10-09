'use strict';
/* =====================  CARAPACE ROUGE  =====================
   Gadget à tête chercheuse : une carapace file au ras du sol, vire pour suivre l'ennemi le plus proche et explose à son contact.
   Elle casse sur les murs (et les abîme un peu) et peut être arrêtée par un bouclier. */
{ const it={id:'redshell',n:'Carapace rouge',ico:'🐢',col:'#ef4444'}; ITEMS.push(it); ITEMMAP.redshell=it; }
TIPS2.redshell='Une carapace à tête chercheuse : elle suit l\'ennemi le plus proche et explose au contact';
{ const item=gadItem('redshell','Carapace rouge','Lance une carapace qui suit l\'ennemi le plus proche (portée 16 cases) et explose à son contact : 8 dégâts et projection. Elle se brise sur les murs et les boucliers : contourne les obstacles !',{silver:13},2,'Gadgets'); SHOP.push(item); SHOPMAP.redshell=item; }
H_THROW.push('redshell');
const RS_SPEED=330, RS_TURN=4.2, RS_RANGE=16*T;
{ const _u=useGadget2;
  useGadget2=function(e,id,wx,wy,ax,ay){
    if(id!=='redshell') return _u(e,id,wx,wy,ax,ay);
    const a=Math.atan2((wy===undefined?aim.y:wy)-e.y,(wx===undefined?aim.x:wx)-e.x);
    projs.push({x:e.x+Math.cos(a)*16,y:e.y+Math.sin(a)*16,z:10,vx:Math.cos(a)*RS_SPEED,vy:Math.sin(a)*RS_SPEED,team:e.team,owner:e,life:6,dmg:8,kb:340,kind:'redshell',col:'#ef4444',hit:null,age:0});
    sfx('whoosh',e.x,e.y); burst(e.x+Math.cos(a)*16,e.y+Math.sin(a)*16,'#fecaca',6,120,.3,3); return true; };
  /* guidage + traînée + explosion au contact (avant le déplacement normal des projectiles) */
  const _up=updateProj;
  updateProj=function(dt){
    for(const p of projs){ if(p.kind!=='redshell'||p.life<=0) continue; p.age+=dt;
      let tg=null,bd=RS_RANGE; for(const o of ents){ if(!o.alive||o.team===p.team||o.cloak>0) continue; const d=Math.hypot(o.x-p.x,o.y-p.y); if(d<bd){ bd=d; tg=o; } }
      if(tg&&p.age>.18){ const cur=Math.atan2(p.vy,p.vx); let want=Math.atan2(tg.y-p.y,tg.x-p.x), df=want-cur; while(df>Math.PI) df-=2*Math.PI; while(df<-Math.PI) df+=2*Math.PI; const na=cur+Math.max(-RS_TURN*dt,Math.min(RS_TURN*dt,df)); p.vx=Math.cos(na)*RS_SPEED; p.vy=Math.sin(na)*RS_SPEED; }
      if(Math.random()<dt*30) parts.push({x:p.x,y:p.y,z:8,vx:rnd(-15,15),vy:rnd(-15,15),vz:rnd(10,30),life:.35,max:.35,col:'#fb7185',size:3});
      if(tg&&bd<14){ explode({x:p.x,y:p.y,team:p.team,owner:p.owner,kind:'bomb',R:1.5*T,dm:6,bd:.7}); p.life=0; } }
    _up(dt); };
  /* bots */
  const _bg=botGadgets2;
  botGadgets2=function(b,foe,fd,nearCore,r,dt){ if((b.am.redshell||0)>0&&b.cd.gad<=0&&fd>3*T&&fd<14*T&&r<dt*.6) return useGadget(b,'redshell',foe.x,foe.y); return _bg(b,foe,fd,nearCore,r,dt); };
  if(typeof BOT_USES!=='undefined') BOT_USES.add('redshell');
}
/* rendu 3D : une vraie carapace rouge à bande blanche qui tourne */
{ const _cp=createProj, _up2=updateProjM;
  createProj=function(p){ if(p.kind!=='redshell') return _cp(p);
    const g=new THREE.Group(), red=new THREE.MeshStandardMaterial({color:0xe11d2a,roughness:.35,metalness:.1}), wh=new THREE.MeshStandardMaterial({color:0xfff4e0,roughness:.5});
    const dome=new THREE.Mesh(GEO.sphere,red); dome.scale.set(.2,.14,.2); dome.position.y=.04; g.add(dome);
    const rim=new THREE.Mesh(GEO.cyl,wh); rim.scale.set(.2,.03,.2); rim.position.y=-.01; g.add(rim);
    for(let i=0;i<3;i++){ const st=new THREE.Mesh(GEO.box,wh); st.scale.set(.05,.02,.2); st.position.y=.17; st.rotation.y=i*1.047; g.add(st); }
    const glow=new THREE.Mesh(GEO.sphere,new THREE.MeshBasicMaterial({color:0xff4d5a,transparent:true,opacity:.25,depthWrite:false})); glow.scale.setScalar(.3); g.add(glow);
    g.userData.spin=g; return g; };
  updateProjM=function(p,m){ if(p.kind!=='redshell'){ _up2(p,m); return; } m.position.set(p.x*U,.14+Math.abs(Math.sin(game.t*14))*.04,p.y*U); m.rotation.y=game.t*14; };
}
