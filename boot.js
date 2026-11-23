"use strict";
applyTheme();
applyLang();
applyDevUI();
if(typeof SFX!=='undefined')SFX.syncButtons();
checkBan();
checkDailyLoginBonus();
if(typeof evaluateAchievementTitles==='function')evaluateAchievementTitles();
function seedV13GuestShowcaseIfNeeded(){
  try{
    if(!me||me.accountType==='account')return;
    me.done=me.done&&typeof me.done==='object'?me.done:{};
    if(me.done.v13_showcase_seeded)return;
    const now=Date.now();
    const demoPlayers=[
      {uid:'demo_aria',name:'Aria Nova',avatar:'av_g2',frame:'fx_gold',banner:'bn-royal',gender:'female',country:'IN',bio:'Arena Queen & Trivia Ace',coins:18400,charm:14200,exp:860,vipTier:'gold',vipUntil:now+86400000*14,tags:['Aurora Prodigy','Diamond Ranker'],bonds:[],pendingProposals:[],lastSeen:now-120000},
      {uid:'demo_rohan',name:'Rohan Ace',avatar:'av_b3',frame:'fx_neon',banner:'bn-cyber',gender:'male',country:'IN',bio:'Jackaroo & 8-Ball Captain',coins:12900,charm:9800,exp:640,vipTier:'silver',vipUntil:now+86400000*10,tags:['Cyber Genius'],bonds:[{type:'bro',partnerUid:uid,partnerName:me.name||'Player',partnerAvatar:me.avatar||'av_b1',giftId:'g_bond_bro',level:2,since:now-4*86400000}],pendingProposals:[],lastSeen:now-90000}
    ];
    demoPlayers.forEach(p=>{if(typeof patchUser==='function')patchUser(p.uid,p)});

    /* Active 1-to-1 Bro Tag with Rohan Ace (Couple & Bestie open) */
    const curBonds=typeof normalizeExclusiveUserBonds==='function'?normalizeExclusiveUserBonds(me.bonds):(Array.isArray(me.bonds)?me.bonds:[]);
    if(!curBonds.some(b=>b&&b.type==='bro')){
      curBonds.push({type:'bro',partnerUid:'demo_rohan',partnerName:'Rohan Ace',partnerAvatar:'av_b3',giftId:'g_bond_bro',level:2,since:now-4*86400000});
    }
    me.bonds=curBonds;

    /* Pending Bestie Tag request from Aria Nova (never auto-attached; Accept/Decline in Profile & Messages) */
    me.pendingProposals=Array.isArray(me.pendingProposals)?me.pendingProposals:[];
    if(!me.pendingProposals.some(p=>p&&p.fromUid==='demo_aria'&&p.bondType==='bestie')){
      me.pendingProposals.push({
        id:'pr_v13_aria_bestie',
        fromUid:'demo_aria',
        fromName:'Aria Nova',
        fromAvatar:'av_g2',
        toUid:uid,
        toName:me.name||'Player',
        giftId:'g_bond_bestie',
        giftName:'Golden Bestie Locket',
        bondType:'bestie',
        weddingDays:3,
        status:'pending',
        isDemoSeed:true,
        ts:now-1800000
      });
    }

    /* Received 10,000+ Luxury Gifts & Starter Gifts on Gift Wall + Top Gifter Spotlight */
    me.giftWallet=me.giftWallet&&typeof me.giftWallet==='object'?me.giftWallet:{};
    const seedCounts={g75_ferrari:1,g72_singularity:1,g_ring_diamond:1,g01_rose:4};
    Object.keys(seedCounts).forEach(gid=>{
      me.giftWallet[gid]=Math.max(Number(me.giftWallet[gid]||0),seedCounts[gid]);
    });
    me.charm=Math.max(Number(me.charm||0),23004);
    me.coins=Math.max(Number(me.coins||0),2500);

    if(typeof giftEvents!=='undefined'&&Array.isArray(giftEvents)){
      const hasSeedEv=giftEvents.some(ev=>ev&&ev.id==='gf_v13_seed_ferrari');
      if(!hasSeedEv){
        const seedEvs=[
          {id:'gf_v13_seed_ferrari',isDemoSeed:true,fromUid:'demo_aria',fromName:'Aria Nova',fromAvatar:'av_g2',fromFrame:'fx_gold',toUid:uid,toName:me.name||'Player',giftId:'g75_ferrari',giftName:'Ferrari Hypercar',tier:7,qty:1,unitPrice:100000,totalCost:100000,charm:20000,senderCharm:20000,luckyCoins:1500,luckLabel:'Royal Jackpot',claimedByRecipient:true,ts:now-3600000*5},
          {id:'gf_v13_seed_singularity',isDemoSeed:true,fromUid:'demo_rohan',fromName:'Rohan Ace',fromAvatar:'av_b3',fromFrame:'fx_neon',toUid:uid,toName:me.name||'Player',giftId:'g72_singularity',giftName:'Celestial Core',tier:6,qty:1,unitPrice:10000,totalCost:10000,charm:2000,senderCharm:2000,luckyCoins:220,luckLabel:'Lucky Drop',claimedByRecipient:true,ts:now-3600000*12},
          {id:'gf_v13_seed_diamond',isDemoSeed:true,fromUid:'demo_aria',fromName:'Aria Nova',fromAvatar:'av_g2',fromFrame:'fx_gold',toUid:uid,toName:me.name||'Player',giftId:'g_ring_diamond',giftName:'Diamond Eternity Ring',tier:6,qty:1,unitPrice:5000,totalCost:5000,charm:1000,senderCharm:1000,luckyCoins:120,luckLabel:'Lucky Drop',claimedByRecipient:true,ts:now-3600000*20}
        ];
        seedEvs.forEach(ev=>{me.done['gift_rx_'+ev.id]=1});
        giftEvents=[...seedEvs,...giftEvents].slice(0,250);
        ls.set('sg_gift_events',giftEvents);
      }
    }

    me.done.v13_showcase_seeded=true;
    saveMe();
    if(typeof patchUser==='function')patchUser(uid,base());
  }catch{}
}
seedV13GuestShowcaseIfNeeded();
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
setTimeout(()=>{
  if(typeof checkPendingWarnings==='function')checkPendingWarnings();
  if(typeof checkPendingProposals==='function')checkPendingProposals();
},900);
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
