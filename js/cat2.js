'use strict';
/* Catapulte : vue du dessus déplaçable (ZQSD) pour viser très loin, comme l'artillerie */
const CATV={px:0,py:0};
{ const _ce=controlEnt;
  controlEnt=function(e,dt,inp){
    if(e===player&&CAT.on){ const k=720*dt; CATV.px=clamp(CATV.px+(inp.ix||0)*k,-2400,2400); CATV.py=clamp(CATV.py+(inp.iy||0)*k,-2400,2400); } else if(e===player){ CATV.px=CATV.py=0; }
    _ce(e,dt,inp); };
  const _cam=updateCamera;
  updateCamera=function(dt){ _cam(dt); if(!CAT.on||ART.on||game.state!=='play'||!player) return; cam3.x=player.x+CATV.px; cam3.y=player.y+CATV.py; const cx=cam3.x*U, cz=cam3.y*U; camera3.position.set(cx,42,cz+9); camera3.lookAt(cx,0,cz-.2); };
}
