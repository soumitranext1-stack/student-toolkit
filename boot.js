"use strict";
applyTheme();
applyLang();
applyDevUI();
if(typeof SFX!=='undefined')SFX.syncButtons();
checkBan();
checkDailyLoginBonus();
renderHome();
renderGameSlots();
renderNotice();
buildProfile();
updateHud();
renderAll();
pruneExpiredChats();
cleanupInactiveGuestUsers();
sweepDuels();
initFirebase();
try{
  const ret=sessionStorage.getItem('sg_return');
  const openGift=sessionStorage.getItem('sg_open_gift');
  if(ret){sessionStorage.removeItem('sg_return');showTab(ret)}
  if(openGift){
    sessionStorage.removeItem('sg_open_gift');
    setTimeout(()=>{if(typeof openGiftSendModal==='function')openGiftSendModal(null,{allowPickPlayer:true})},450);
  }
}catch{}
setInterval(sweepDuels,30000);
setInterval(pruneExpiredChats,300000);
