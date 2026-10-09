'use strict';
/* ===== Audio « naturel » : bruitages à base de bruit filtré, de corps résonants et de réverbération (fini le 8-bit) ===== */
const A2={bus:null,send:null,rev:null,W:null};
function a2impulse(sec,decay){
  const n=Math.floor(AC.sampleRate*sec), b=AC.createBuffer(2,n,AC.sampleRate);
  for(let c=0;c<2;c++){ const d=b.getChannelData(c); let lp=0; for(let i=0;i<n;i++){ const t=i/n; lp+=((Math.random()*2-1)-lp)*(.55-.4*t); d[i]=lp*Math.pow(1-t,decay)*(i<200?i/200:1); } }
  return b;
}
function a2waves(){
  if(A2.W) return A2.W; const N=40, re=new Float32Array(N), reed=new Float32Array(N), str=new Float32Array(N), bright=new Float32Array(N);
  for(let n=1;n<N;n++){ reed[n]=(n%2?1:.18)/Math.pow(n,1.9); str[n]=1/Math.pow(n,1.35); bright[n]=1/Math.pow(n,1.1); }
  return A2.W={reed:AC.createPeriodicWave(re,reed),str:AC.createPeriodicWave(re,str),horn:AC.createPeriodicWave(re,bright)};
}
function a2type(os,type){ if(type==='square') os.setPeriodicWave(a2waves().reed); else if(type==='sawtooth') os.setPeriodicWave(a2waves().str); else os.type=type; }
function a2init(){
  if(A2.bus||!AC) return; A2.bus=AC.createGain(); A2.bus.gain.value=.95;
  const comp=AC.createDynamicsCompressor(); comp.threshold.value=-16; comp.knee.value=24; comp.ratio.value=3.5; comp.attack.value=.004; comp.release.value=.2;
  A2.rev=AC.createConvolver(); A2.rev.buffer=a2impulse(1.7,2.6); A2.send=AC.createGain(); A2.send.gain.value=.2;
  A2.bus.connect(comp); comp.connect(AC.destination); A2.bus.connect(A2.send); A2.send.connect(A2.rev); A2.rev.connect(comp);
}
/* tone / noise de sim.js : on les remplace par des versions douces et réverbérées */
function tone(f,d,type,vol,slide,delay){
  a2init(); const t0=AC.currentTime+(delay||0), o=AC.createOscillator(), g=AC.createGain(), lp=AC.createBiquadFilter();
  a2type(o,type||'triangle'); o.frequency.setValueAtTime(f,t0); if(slide) o.frequency.exponentialRampToValueAtTime(Math.max(30,f*slide),t0+d);
  lp.type='lowpass'; lp.frequency.value=Math.min(5000,f*5+400); g.gain.setValueAtTime(.0001,t0); g.gain.linearRampToValueAtTime(vol,t0+.006); g.gain.exponentialRampToValueAtTime(.0001,t0+d);
  o.connect(lp); lp.connect(g); g.connect(A2.bus); o.start(t0); o.stop(t0+d+.03);
}
function noise(d,vol,freq,delay){ nb(d,vol,'lowpass',freq||1500,.7,delay||0); }
function nb(d,vol,type,f,q,delay,f2){
  a2init(); const t0=AC.currentTime+(delay||0), s=AC.createBufferSource(), fl=AC.createBiquadFilter(), g=AC.createGain();
  s.buffer=noiseBuf; fl.type=type; fl.Q.value=q||.7; fl.frequency.setValueAtTime(f,t0); if(f2) fl.frequency.exponentialRampToValueAtTime(f2,t0+d);
  g.gain.setValueAtTime(.0001,t0); g.gain.linearRampToValueAtTime(vol,t0+Math.min(.01,d*.2)); g.gain.exponentialRampToValueAtTime(.0001,t0+d);
  s.connect(fl); fl.connect(g); g.connect(A2.bus); s.start(t0,Math.random()*.4); s.stop(t0+d+.03);
}
function th(f,d,vol,slide,delay,type){ // corps qui résonne : sinus qui chute
  a2init(); const t0=AC.currentTime+(delay||0), o=AC.createOscillator(), g=AC.createGain(); o.type=type||'sine'; o.frequency.setValueAtTime(f,t0); o.frequency.exponentialRampToValueAtTime(Math.max(25,f*(slide||.5)),t0+d);
  g.gain.setValueAtTime(vol,t0); g.gain.exponentialRampToValueAtTime(.0001,t0+d); o.connect(g); g.connect(A2.bus); o.start(t0); o.stop(t0+d+.03);
}
function ping(f,d,vol,delay,ratios){ // cloche / métal : partiels inharmoniques
  a2init(); const t0=AC.currentTime+(delay||0); (ratios||[1,2.76,5.4]).forEach((r,i)=>{ const o=AC.createOscillator(), g=AC.createGain(); o.type='sine'; o.frequency.value=f*r;
    g.gain.setValueAtTime(.0001,t0); g.gain.linearRampToValueAtTime(vol/(1+i*1.6),t0+.003); g.gain.exponentialRampToValueAtTime(.0001,t0+d/(1+i*.6)); o.connect(g); g.connect(A2.bus); o.start(t0); o.stop(t0+d+.03); });
}
function sfxPlay2(n,v){
  a2init(); const r=Math.random();
  switch(n){
    case 'place': th(170+r*30,.09,.4*v,.55); nb(.05,.25*v,'bandpass',900,1.4); return true;
    case 'tick': nb(.03,.12*v,'bandpass',2400,2); th(900,.04,.05*v,.7); return true;
    case 'break': nb(.3,.32*v,'lowpass',2600,.7,0,500); for(let k=0;k<3;k++) nb(.05,.2*v,'bandpass',1500+r*1500,1.5,.03+k*.06+r*.03); th(95,.2,.3*v,.5); return true;
    case 'hit': th(150+r*25,.12,.45*v,.45); nb(.07,.32*v,'bandpass',1700,.9); return true;
    case 'swing': nb(.18,.16*v,'bandpass',500,1.1,0,2600); return true;
    case 'shot': nb(.05,.42*v,'highpass',2600); th(190,.17,.4*v,.35); nb(.3,.12*v,'lowpass',1800,.7,.02,400); return true;
    case 'shotgun': nb(.07,.55*v,'highpass',1800); th(120,.3,.6*v,.35); nb(.5,.2*v,'lowpass',1400,.7,.03,300); return true;
    case 'sniper': nb(.04,.55*v,'highpass',3200); th(110,.45,.55*v,.4); nb(.9,.16*v,'lowpass',1100,.7,.04,250); return true;
    case 'bow': th(260,.16,.2*v,.7); nb(.12,.1*v,'bandpass',3000,1,.0,1200); return true;
    case 'flame': nb(.16,.14*v,'bandpass',700,.6,0,1500); nb(.12,.08*v,'highpass',3500); return true;
    case 'ice': ping(1800,.5,.12*v,0,[1,2.4,3.9]); ping(2600,.35,.07*v,.05,[1,2.2]); return true;
    case 'boom': th(80,.8,.7*v,.35); nb(1,.5*v,'lowpass',700,.7,0,120); nb(.25,.4*v,'bandpass',2200,.8); return true;
    case 'whoosh': nb(.45,.2*v,'bandpass',350,1,0,1900); return true;
    case 'coin': ping(2093,.35,.13*v,0,[1,2.01,3.02]); ping(3136,.5,.12*v,.07,[1,2.01,3.02]); return true;
    case 'buy': [1047,1319,1568].forEach((f,i)=>ping(f,.6,.13,i*.07,[1,2,3.01])); return true;
    case 'fail': th(140,.22,.22,.7); nb(.1,.1,'lowpass',500); return true;
    case 'jump': nb(.1,.07*v,'bandpass',900,.8,0,1600); th(240,.14,.1*v,1.6); return true;
    case 'boing': th(180,.4,.2*v,3,0,'triangle'); return true;
    case 'gadget': ping(880,.4,.1*v,0,[1,2.01,3]); nb(.25,.08*v,'bandpass',2500,1.5,0,5000); return true;
    case 'die': th(330,.55,.22*v,.3,0,'triangle'); nb(.35,.2*v,'lowpass',2000,.7,0,300); return true;
    case 'fanfare': { const L=(f,d,dl)=>{ const t0=AC.currentTime+dl, o=AC.createOscillator(), lp=AC.createBiquadFilter(), g=AC.createGain(); o.setPeriodicWave(a2waves().horn); o.frequency.value=f; lp.type='lowpass'; lp.frequency.setValueAtTime(500,t0); lp.frequency.linearRampToValueAtTime(2200,t0+.08);
        g.gain.setValueAtTime(.0001,t0); g.gain.linearRampToValueAtTime(.13,t0+.04); g.gain.exponentialRampToValueAtTime(.0001,t0+d); o.connect(lp); lp.connect(g); g.connect(A2.bus); o.start(t0); o.stop(t0+d+.03); };
      L(523,.18,0); L(659,.18,.14); L(784,.45,.28); return true; }
    case 'alarm': ping(660,.9,.18,0,[1,2.76,5.4]); ping(660,.9,.18,.28,[1,2.76,5.4]); return true;
    case 'ui': ping(1500,.12,.06,0,[1,2.3]); return true;
    case 'splash': nb(.6,.3*v,'lowpass',3200,.7,0,500); for(let k=0;k<3;k++) th(500+r*400,.08,.06*v,2,.05+k*.07); return true;
    case 'reload': nb(.025,.3*v,'highpass',3200); th(330,.05,.15*v,.7); nb(.03,.35*v,'highpass',2800,.7,.13); th(500,.06,.15*v,.7,.13); return true;
  }
  return false;
}

/* ===== ambiance vivante (vagues, mouettes, grincements, oiseaux) + retours sonores ===== */
function a2pan(v){ const p=AC.createStereoPanner?AC.createStereoPanner():null; if(p){ p.pan.value=v; p.connect(A2.bus); } return p||A2.bus; }
function a2wave(vol,dur){ // houle qui monte puis se retire
  a2init(); const t0=AC.currentTime, s=AC.createBufferSource(), f=AC.createBiquadFilter(), g=AC.createGain(), out=a2pan(Math.random()*1.6-.8);
  s.buffer=noiseBuf; s.loop=true; f.type='lowpass'; f.Q.value=.6; f.frequency.setValueAtTime(260,t0); f.frequency.linearRampToValueAtTime(1500,t0+dur*.42); f.frequency.linearRampToValueAtTime(220,t0+dur);
  g.gain.setValueAtTime(.0001,t0); g.gain.linearRampToValueAtTime(vol,t0+dur*.42); g.gain.linearRampToValueAtTime(vol*.5,t0+dur*.6); g.gain.exponentialRampToValueAtTime(.0001,t0+dur);
  s.connect(f); f.connect(g); g.connect(out); s.start(t0,Math.random()*.5); s.stop(t0+dur+.05);
  nb(dur*.5,vol*.5,'highpass',3500,.5,dur*.35); // écume qui crépite en se retirant
}
function a2gull(vol,delay){
  a2init(); const t0=AC.currentTime+(delay||0), o=AC.createOscillator(), lfo=AC.createOscillator(), lg=AC.createGain(), bp=AC.createBiquadFilter(), g=AC.createGain(), out=a2pan(Math.random()*1.8-.9);
  const base=1500+Math.random()*500, d=.32+Math.random()*.2; a2type(o,'sawtooth');
  o.frequency.setValueAtTime(base*.85,t0); o.frequency.linearRampToValueAtTime(base*1.55,t0+d*.35); o.frequency.linearRampToValueAtTime(base*.9,t0+d);
  lfo.frequency.value=38; lg.gain.value=base*.05; lfo.connect(lg); lg.connect(o.frequency);
  bp.type='bandpass'; bp.frequency.value=2300; bp.Q.value=1.6; g.gain.setValueAtTime(.0001,t0); g.gain.linearRampToValueAtTime(vol,t0+.04); g.gain.exponentialRampToValueAtTime(.0001,t0+d);
  o.connect(bp); bp.connect(g); g.connect(out); o.start(t0); lfo.start(t0); o.stop(t0+d+.03); lfo.stop(t0+d+.03);
}
function a2creak(vol){ a2init(); const t0=AC.currentTime, o=AC.createOscillator(), bp=AC.createBiquadFilter(), g=AC.createGain(); a2type(o,'sawtooth'); const f=90+Math.random()*60;
  o.frequency.setValueAtTime(f,t0); o.frequency.linearRampToValueAtTime(f*(.7+Math.random()*.7),t0+.7); bp.type='bandpass'; bp.frequency.value=380; bp.Q.value=7;
  g.gain.setValueAtTime(.0001,t0); g.gain.linearRampToValueAtTime(vol,t0+.2); g.gain.exponentialRampToValueAtTime(.0001,t0+.8); o.connect(bp); bp.connect(g); g.connect(A2.bus); o.start(t0); o.stop(t0+.85); }
function a2bird(vol){ a2init(); const n=2+((Math.random()*3)|0); for(let k=0;k<n;k++){ const t0=AC.currentTime+k*.11, o=AC.createOscillator(), g=AC.createGain(), f=2600+Math.random()*1600; o.type='sine';
  o.frequency.setValueAtTime(f,t0); o.frequency.exponentialRampToValueAtTime(f*(Math.random()<.5?1.5:.7),t0+.07); g.gain.setValueAtTime(.0001,t0); g.gain.linearRampToValueAtTime(vol,t0+.01); g.gain.exponentialRampToValueAtTime(.0001,t0+.09); o.connect(g); g.connect(a2pan(Math.random()*1.6-.8)); o.start(t0); o.stop(t0+.1); } }
function a2step(kind,vol){ if(kind==='sand'){ nb(.1,.16*vol,'lowpass',1100,.6,0,500); nb(.05,.06*vol,'highpass',4000); } else if(kind==='grass'){ nb(.09,.13*vol,'bandpass',1800,.8,0,900); } else { th(130,.07,.18*vol,.6); nb(.04,.12*vol,'bandpass',1100,1.2); } }
const A2S={wave:0,gull:0,creak:0,bird:0,step:0,heart:0,last:performance.now()};
setInterval(()=>{
  if(!AC||muted||AC.state!=='running'||typeof game==='undefined'||game.state!=='play'||game.paused||!player) return; a2init();
  const now=performance.now(), dt=(now-A2S.last)/1000; A2S.last=now; const map=game.opts&&game.opts.map, wet=typeof WX!=='undefined'&&WX.rain>.3, storm=typeof WX!=='undefined'&&WX.storm>.4;
  const calm=!(typeof MUS!=='undefined'&&MUS.state&&/combat|alarm/.test(MUS.state()||''));
  if(now>A2S.wave){ A2S.wave=now+(4200+Math.random()*4500)*(storm?.6:1); a2wave((storm?.1:.065)*(.8+Math.random()*.5),3+Math.random()*2); }
  if(now>A2S.gull){ A2S.gull=now+11000+Math.random()*16000; if(calm&&!storm&&!wet&&!(typeof WX!=='undefined'&&WX.dark>.6)&&map!=='glacier'){ const n=2+((Math.random()*3)|0); for(let k=0;k<n;k++) a2gull(.07,k*.42); } }
  if(now>A2S.creak){ A2S.creak=now+(storm||map==='tempest'?5000:12000)+Math.random()*9000; a2creak(storm||map==='tempest'?.09:.05); }
  if(now>A2S.bird){ A2S.bird=now+3500+Math.random()*7000; if((map==='jungle'||map==='atoll'||map==='scatter')&&!storm&&calm) a2bird(.045); }
  // pas du joueur
  if(player.alive&&player.z<2&&Math.hypot(player.vx,player.vy)>38&&!player.riding){ A2S.step-=dt; if(A2S.step<=0){ A2S.step=.3; const tx=Math.floor(player.x/T), ty=Math.floor(player.y/T), i=idx(tx,ty), reg=region[i];
      a2step(wallT[i]>0||reg===4||(floorT[i]&&ownF[i]>=0)?'wood':reg>=0&&reg<4&&Math.hypot(tx-TD[reg].bx,ty-TD[reg].by)<=4.2?'grass':'sand',.9); } } else A2S.step=0;
  // cœur qui bat à faible vie
  if(player.alive&&player.hp<=maxhp(player)*.35){ A2S.heart-=dt; if(A2S.heart<=0){ A2S.heart=.85; th(62,.16,.5,.6); th(55,.14,.38,.6,.17); } }
},100);
{ const _h=hurt;
  hurt=function(e,amount,by,kx,ky){ const hp0=e.hp; _h(e,amount,by,kx,ky); if(e===player&&hp0-e.hp>.4&&AC&&AC.state==='running'&&!muted&&(A2S.ouch||0)<performance.now()){ A2S.ouch=performance.now()+260; nb(.12,.22,'lowpass',900,.8); th(200,.16,.3,.5); }
    else if(by===player&&e!==player&&hp0-e.hp>.4&&AC&&AC.state==='running'&&!muted&&(A2S.dmk||0)<performance.now()){ A2S.dmk=performance.now()+90; ping(1900,.12,.07,0,[1,2.5]); } };
}
