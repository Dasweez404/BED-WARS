'use strict';
/* ===== Équilibrage tardif : armes à distance un peu moins puissantes (appliqué une seule fois, après tous les modules) ===== */
(function(){ if(window.__GUNNERF) return; window.__GUNNERF=1; for(const id in GUNS){ const g=GUNS[id]; if(g&&g.dmg>0) g.dmg=Math.round(g.dmg*.85*100)/100; } })();
