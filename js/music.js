'use strict';
/* =====================  MUSIQUE ADAPTATIVE (WebAudio procédural, aucun fichier)  =====================
   Un shanty pirate en ré dorien en 6/8, joué en couches : la musique réagit à la partie
   (menu, base, exploration, combat, coffre attaqué, mort, victoire, défaite, événements). */
const MUS=(()=>{
  const M2F=m=>440*Math.pow(2,(m-69)/12);
  const CH={Dm:{r:38,t:[62,65,69]},C:{r:36,t:[60,64,67]},F:{r:41,t:[60,65,69]},Bb:{r:34,t:[58,62,65]},Gm:{r:43,t:[58,62,67]},A:{r:33,t:[61,64,69]},Am:{r:33,t:[60,64,69]},G:{r:43,t:[59,62,67]},D:{r:38,t:[62,66,69]}};
  const PROG={
    menu:['Dm','C','Dm','C','Dm','F','C','Dm'],base:['Dm','Am','C','G','Dm','Am','C','Dm'],explore:['Dm','C','Dm','C','Dm','F','C','Dm'],
    combat:['Dm','Dm','Bb','C','Dm','Dm','Gm','A'],alarm:['Dm','Bb','Gm','A','Dm','Bb','Gm','A'],dead:['Dm','Dm','Gm','A'],win:['D','G','D','A','D','G','A','D'],lose:['Dm','Gm','Dm','A']
  };
  // mélodie principale (un motif de 6 croches par mesure, 0 = silence)
  const MEL=[[62,0,65,69,0,65],[64,0,67,0,64,67],[62,0,65,69,0,74],[72,0,69,0,67,64],[62,0,65,69,0,65],[65,0,69,0,72,69],[67,0,64,67,0,72],[74,0,72,69,65,62]];
  const MELW=[[66,0,69,74,0,69],[67,0,71,0,67,71],[66,0,69,74,0,78],[76,0,74,0,71,67],[66,0,69,74,0,69],[67,0,71,0,74,71],[69,0,66,69,0,74],[78,0,74,69,66,62]];
  // couches : gains cibles par état  [pad,basse,mélodie,batterie,charley,arpège,cloche]
  const LAY=['pad','bass','mel','drum','hat','arp','bell'];
  const MIX={
    menu:[.55,.5,.7,.0,.12,0,0],base:[.75,.42,.32,0,0,0,0],explore:[.5,.62,.62,.38,.22,0,0],combat:[.42,.85,.6,.95,.5,.5,0],
    alarm:[.5,.9,0,.8,.7,.9,.9],dead:[.55,.25,0,0,0,0,0],win:[.6,.55,.85,.5,.3,.25,.35],lose:[.55,.3,.35,0,0,0,0]
  };
  const BPM={menu:92,base:84,explore:98,combat:116,alarm:124,dead:70,win:104,lose:68};
  const S={ready:false,state:'menu',vol:.65,step:0,next:0,bus:null,lp:null,send:null,L:{},wasAlive:true,wasOver:false,evId:null,cores:null,combatT:0,alarmT:0,lastState:'',loop:0,amb:null,tmr:null,hold:{}};
  function init(){
    if(S.ready||!AC) return S.ready;
    S.bus=AC.createGain(); S.bus.gain.value=0; S.lp=AC.createBiquadFilter(); S.lp.type='lowpass'; S.lp.frequency.value=18000; S.lp.Q.value=.4;
    const comp=AC.createDynamicsCompressor(); comp.threshold.value=-18; comp.ratio.value=3;
    S.bus.connect(S.lp); S.lp.connect(comp); comp.connect(AC.destination);
    // écho (réverbération du pauvre)
    S.send=AC.createGain(); S.send.gain.value=1; const dl=AC.createDelay(1); dl.delayTime.value=.31; const fb=AC.createGain(); fb.gain.value=.3; const df=AC.createBiquadFilter(); df.type='lowpass'; df.frequency.value=2200;
    S.send.connect(dl); dl.connect(df); df.connect(fb); fb.connect(dl); df.connect(S.bus);
    for(const n of LAY){ const g=AC.createGain(); g.gain.value=0; g.connect(S.bus); S.L[n]=g; }
    // ambiance : vagues, pluie, vent
    const mk=(type,f,q)=>{ const src=AC.createBufferSource(); src.buffer=noiseBuf; src.loop=true; const fl=AC.createBiquadFilter(); fl.type=type; fl.frequency.value=f; if(q) fl.Q.value=q; const g=AC.createGain(); g.gain.value=0; src.connect(fl); fl.connect(g); g.connect(AC.destination); src.start(); return {g,fl}; };
    S.amb={sea:mk('lowpass',420),rain:mk('highpass',1800),wind:mk('bandpass',520,.7)};
    S.ready=true; S.next=AC.currentTime+.1; S.step=0; S.tmr=setInterval(sched,55); setInterval(decide,140); return true;
  }
  /* ---------- instruments ---------- */
  function vox(type,freq,t0,dur,vol,layer,o){
    o=o||{}; const os=AC.createOscillator(), g=AC.createGain(); os.type=type; os.frequency.setValueAtTime(freq,t0); if(o.slide) os.frequency.exponentialRampToValueAtTime(Math.max(25,freq*o.slide),t0+dur);
    if(o.det) os.detune.value=o.det; let out=g; if(o.lp){ const f=AC.createBiquadFilter(); f.type='lowpass'; f.frequency.value=o.lp; os.connect(f); f.connect(g); } else os.connect(g);
    const a=o.atk||.012; g.gain.setValueAtTime(.0001,t0); g.gain.linearRampToValueAtTime(vol,t0+a); if(o.sus){ g.gain.setValueAtTime(vol,t0+dur*.6); } g.gain.exponentialRampToValueAtTime(.0001,t0+dur);
    g.connect(layer===null?S.bus:S.L[layer]); if(o.echo){ const e=AC.createGain(); e.gain.value=o.echo; g.connect(e); e.connect(S.send); } os.start(t0); os.stop(t0+dur+.05);
  }
  function nz(t0,dur,vol,type,f,layer,q){
    const s=AC.createBufferSource(), fl=AC.createBiquadFilter(), g=AC.createGain(); s.buffer=noiseBuf; fl.type=type; fl.frequency.value=f; if(q) fl.Q.value=q;
    g.gain.setValueAtTime(vol,t0); g.gain.exponentialRampToValueAtTime(.0001,t0+dur); s.connect(fl); fl.connect(g); g.connect(layer===null?S.bus:S.L[layer]); s.start(t0,Math.random()*.5); s.stop(t0+dur+.03);
  }
  const kick=(t,v,l)=>{ vox('sine',130,t,.16,v,l,{slide:.3,atk:.002}); nz(t,.03,v*.25,'lowpass',900,l); };
  const snare=(t,v,l)=>{ nz(t,.13,v*.5,'bandpass',1900,l,.8); vox('triangle',210,t,.09,v*.45,l,{slide:.6,atk:.002}); };
  const hat=(t,v,l)=>nz(t,.035,v,'highpass',7500,l);
  const lev=n=>S.L[n]?S.L[n].gain.value:0;
  /* ---------- séquenceur ---------- */
  function sched(){
    if(!S.ready||AC.state!=='running') return;
    const now=AC.currentTime; if(S.next<now-.4) S.next=now+.05;
    while(S.next<now+.3){ const bpm=BPM[S.state]||96, ST=60/(bpm*3); play(S.step,S.next,ST); S.next+=ST; S.step++; }
  }
  function play(step,t,ST){
    const st=S.state, prog=PROG[st]||PROG.explore, bar=Math.floor(step/6), sb=step%6, ch=CH[prog[bar%prog.length]], cyc=Math.floor(bar/prog.length)%2, MX=S.target||MIX[st]||MIX.explore;
    const on=i=>MX[i]>.04;
    if(sb===0&&bar%prog.length===0&&step>0) S.loop++;
    // nappes
    if(sb===0&&on(0)){ const L=ST*6; for(const n of ch.t){ for(const dt of [-7,7]) vox('sawtooth',M2F(n-12),t,L*1.05,.07,'pad',{atk:L*.35,lp:520+MX[0]*500,det:dt,echo:.25}); } }
    // basse
    if(on(1)){
      const dense=st==='combat'||st==='alarm';
      if(dense){ const nn=[ch.r,ch.r,ch.r+12,ch.r,ch.r+7,ch.r][sb]; vox('triangle',M2F(nn),t,ST*.9,.34,'bass',{lp:700,atk:.006}); }
      else if(sb===0||sb===3){ vox('triangle',M2F(sb===0?ch.r:ch.r+7),t,ST*2.4,.36,'bass',{lp:620,atk:.01}); }
    }
    // mélodie
    if(on(2)){
      let n=0; if(st==='base'||st==='lose'||st==='dead'){ if(sb===0||sb===3){ const pool=ch.t.concat(ch.t.map(x=>x+12)); n=pool[(Math.random()*pool.length)|0]; } }
      else if(st==='win'){ n=(MELW[bar%8]||MELW[0])[sb]; }
      else { const m=(cyc&&bar%2?MELW:MEL)[bar%8]; n=m[sb]; if(cyc&&n&&Math.random()<.18) n+=12; }
      if(n){ const L=st==='base'||st==='lose'?ST*2.6:ST*1.7; vox('square',M2F(n),t,L,.1,'mel',{lp:2100+MX[2]*900,echo:.35,atk:.012}); vox('triangle',M2F(n+12),t,L*.8,.05,'mel',{echo:.2}); }
    }
    // batterie
    if(on(3)){
      if(sb===0){ kick(t,.5,'drum'); } if(sb===3){ if(st==='combat'||st==='alarm'||st==='win') snare(t,.5,'drum'); else kick(t,.32,'drum'); }
      if((st==='combat'||st==='alarm')&&(sb===1||sb===4)) vox('sine',90,t,.07,.18,'drum',{atk:.002});
    }
    if(on(4)&&(sb%1===0)){ if(st==='explore'||st==='menu'){ if(sb===1||sb===4) hat(t,.06,'hat'); } else hat(t,sb%3===0?.07:.045,'hat'); }
    // arpège
    if(on(5)){ const tn=ch.t[(step*2)%3]+12*(1+(step%2)); vox('square',M2F(tn),t,ST*.55,.07,'arp',{lp:2600,echo:.25,atk:.004}); }
    // cloche d'alerte
    if(on(6)&&(sb===0||sb===3)){ const f=M2F(st==='alarm'?(sb===0?81:78):86); vox('sine',f,t,.9,.14,'bell',{echo:.5,atk:.003}); vox('sine',f*2.76,t,.4,.05,'bell',{atk:.003}); }
  }
  /* ---------- jingles ---------- */
  function sting(kind){
    if(!S.ready||AC.state!=='running'||muted) return; const t=AC.currentTime+.02;
    switch(kind){
      case 'death': vox('sawtooth',330,t,.9,.13,null,{slide:.35,lp:900,echo:.4}); vox('sine',90,t,.5,.3,null,{slide:.4,atk:.003}); nz(t,.3,.18,'lowpass',700,null); break;
      case 'respawn': [62,69,74].forEach((n,i)=>vox('triangle',M2F(n),t+i*.09,.35,.13,null,{echo:.4})); break;
      case 'win': { const seq=[[62,0],[66,.13],[69,.26],[74,.39],[78,.62],[81,.78]]; for(const [n,d] of seq){ vox('square',M2F(n),t+d,.55,.12,null,{lp:3000,echo:.4}); vox('sawtooth',M2F(n-12),t+d,.55,.07,null,{lp:900}); } [50,57,62,66,74].forEach(n=>vox('triangle',M2F(n),t+.78,2.2,.12,null,{atk:.05,echo:.5})); kick(t,.5,null); kick(t+.39,.4,null); break; }
      case 'lose': { [[69,0],[65,.45],[62,.9],[57,1.35]].forEach(([n,d])=>vox('triangle',M2F(n),t+d,1.1,.17,null,{lp:1400,echo:.5,atk:.03})); vox('sawtooth',M2F(38),t+1.35,2.2,.1,null,{lp:400,atk:.08}); break; }
      case 'core': kick(t,.9,null); vox('sine',60,t,1.2,.35,null,{slide:.5,atk:.004}); nz(t,.9,.25,'lowpass',500,null); [74,70,67].forEach((n,i)=>vox('square',M2F(n),t+.12+i*.18,.3,.08,null,{lp:1500,echo:.4})); break;
      case 'ally': kick(t,.6,null); vox('sine',50,t,1.4,.4,null,{slide:.45,atk:.004}); nz(t,1.1,.3,'lowpass',420,null); vox('sawtooth',M2F(38),t,1.4,.14,null,{lp:380,atk:.04}); break;
      case 'kill': vox('square',M2F(76),t,.1,.08,null,{lp:3000}); vox('square',M2F(83),t+.08,.18,.08,null,{lp:3000,echo:.3}); break;
      case 'event': vox('sawtooth',M2F(38),t,1.6,.16,null,{lp:520,atk:.08,echo:.3}); vox('sawtooth',M2F(39),t+.5,1.2,.13,null,{lp:520,atk:.04}); nz(t,.5,.15,'lowpass',900,null); break;
      case 'coins': [84,88,91,96,91,96].forEach((n,i)=>vox('triangle',M2F(n),t+i*.07,.3,.09,null,{echo:.4})); break;
      case 'rush': [62,66,69,74].forEach((n,i)=>vox('square',M2F(n),t+i*.1,.3,.1,null,{lp:2600,echo:.3})); break;
      case 'shark': vox('sine',M2F(38),t,.5,.3,null,{atk:.01}); vox('sine',M2F(39),t+.55,.9,.3,null,{atk:.01}); break;
      case 'volcano': nz(t,2.4,.4,'lowpass',160,null); vox('sine',45,t,2.2,.32,null,{slide:.6,atk:.1}); break;
      case 'kraken': for(let i=0;i<7;i++) vox('sine',M2F(60-i*2),t+i*.11,.25,.1,null,{slide:.6,echo:.4}); break;
      case 'curse': vox('triangle',M2F(51),t,1.6,.14,null,{atk:.3,echo:.5}); vox('triangle',M2F(57),t+.2,1.4,.12,null,{atk:.3,echo:.5}); break;
      case 'fog': vox('sine',M2F(50),t,2.5,.12,null,{atk:.9,echo:.5}); break;
      case 'ping': vox('sine',M2F(88),t,.18,.1,null,{echo:.3,atk:.003}); vox('sine',M2F(95),t+.07,.22,.08,null,{atk:.003}); break;
      case 'emote': vox('triangle',M2F(81),t,.1,.08,null,{slide:1.5}); break;
    }
  }
  function thunder(){ if(!S.ready||AC.state!=='running'||muted) return; const t=AC.currentTime+.01; nz(t,2.6,.34,'lowpass',240,null); nz(t+.1,1.8,.16,'lowpass',900,null); vox('sine',50,t,1.8,.25,null,{slide:.6,atk:.05}); }
  /* ---------- état ---------- */
  function setState(s){
    if(s===S.state&&S.target) return; const prev=S.state; S.state=s; S.target=MIX[s];
    if(!S.ready) return; const now=AC.currentTime, up=MIX[s];
    LAY.forEach((n,i)=>{ const tc=(s==='alarm'||s==='combat')?.18:.6; S.L[n].gain.setTargetAtTime(up[i]*.9,now,tc); });
    if(prev!==s&&(s==='win'||s==='lose'||s==='dead')){ S.step=Math.ceil(S.step/6)*6; }
  }
  function coreAlert(){ try{ return hud.alertT>0||(TD[player.team]&&TD[player.team].alert>0); }catch(e){ return false; } }
  function decide(){
    if(!S.ready) return; const now=performance.now()/1000;
    // volume maître / filtre
    const vv=muted?0:S.vol; S.bus.gain.setTargetAtTime(vv*.9,AC.currentTime,.3);
    let cut=18000; if(game.paused) cut=650; else if(typeof shopOpen!=='undefined'&&shopOpen) cut=3200; else if(game.state==='play'&&player&&!player.alive) cut=900;
    S.lp.frequency.setTargetAtTime(cut,AC.currentTime,.12);
    let s;
    if(game.state==='menu'||!player) s='menu';
    else if(game.state==='over') s=game.win?'win':'lose';
    else if(player.elim||game.spec) s=S.combatT>now?'combat':'explore';
    else if(!player.alive) s='dead';
    else { let foe=false; for(const o of ents){ if(!o.alive||o.team===player.team||o.cloak>0) continue; if(Math.hypot(o.x-player.x,o.y-player.y)<8*T){ foe=true; break; } }
      if(foe||player.sinceHurt<3) S.combatT=now+3.5;
      if(coreAlert()) S.alarmT=now+5.5;
      s=S.alarmT>now?'alarm':S.combatT>now?'combat':nearBase(player)?'base':'explore'; }
    if(game.state==='over'&&S.wasOver===false){ sting(game.win?'win':'lose'); S.wasOver=true; } else if(game.state!=='over') S.wasOver=false;
    setState(s);
    // événements ponctuels
    if(game.state==='play'&&player){
      if(S.wasAlive&&!player.alive){ sting('death'); } else if(!S.wasAlive&&player.alive&&game.t>2){ sting('respawn'); } S.wasAlive=player.alive;
      const id=EV.cur?EV.cur.id:null; if(id&&id!==S.evId) sting(({coins:'coins',rush:'rush',shark:'shark',volcano:'volcano',kraken:'kraken',curse:'curse',fog:'fog'})[id]||'event'); S.evId=id;
      if(!S.cores||S.cores.length!==TD.length) S.cores=TD.map(t=>t.coreAlive); TD.forEach((t,i)=>{ if(S.cores[i]&&!t.coreAlive){ sting(i===player.team?'ally':'core'); } S.cores[i]=t.coreAlive; });
    } else { S.cores=null; S.evId=null; S.wasAlive=true; }
    if(player&&game.state==='play'){ if(player.kills>(S.kills||0)) sting('kill'); S.kills=player.kills; } else S.kills=0;
    // ambiance sonore
    const am=S.amb, ac=AC.currentTime, mv=muted?0:1, dkk=game.state==='menu'?.35:1;
    am.sea.g.gain.setTargetAtTime(.045*mv*dkk,ac,.5); am.rain.g.gain.setTargetAtTime((WX.rain*.06+WX.storm*.05)*mv*dkk,ac,.6); am.wind.g.gain.setTargetAtTime((WX.storm*.09+WX.snow*.04+WX.fog*.015)*mv*dkk,ac,.6);
    am.wind.fl.frequency.setTargetAtTime(420+Math.sin(now*.37)*160+Math.sin(now*.9)*90,ac,.3);
  }
  return {S,init,sting,thunder,setVol(v){ S.vol=v; },state:()=>S.state,tick(){ if(!S.ready&&AC) init(); }};
})();
/* le contexte audio naît au premier geste : on lance la musique à ce moment */
addEventListener('pointerdown',()=>setTimeout(()=>MUS.tick(),30));
addEventListener('keydown',()=>setTimeout(()=>MUS.tick(),30));
