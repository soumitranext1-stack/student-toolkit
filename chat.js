"use strict";
const linkify=h=>h.replace(/(https?:\/\/[^\s<]+)/g,'<a href="$1" target="_blank" rel="noopener noreferrer" style="color:inherit;text-decoration:underline;word-break:break-all">$1</a>');
let chats=ls.get('sg_chats_'+uid,{}),cur=null,dmHydrated=false,vipChatAnnounced=false;
const saveChats=()=>ls.set('sg_chats_'+uid,chats);
const sendTimestamps=[];

function ensureDevChat(){
  if(!chats.developer){
    chats.developer={id:'developer',name:'Developer',uid:DEV_UID,dev:true,messages:[{id:'w1',from:'them',type:'text',text:'Welcome to Study Game!',ts:Date.now()}]};
    saveChats();
  }
}
ensureDevChat();

/* Automatic 7-Day Chat Cleanup (World Chat + Player-to-Player DMs + Dev Inbox) */
function pruneExpiredChats(){
  const now=Date.now();
  let changed=false;

  const beforeW=worldMsgs.length;
  worldMsgs=(worldMsgs||[]).filter(m=>{
    const expired=(now-Number(m.ts||0))>=SEVEN_DAYS_MS;
    if(expired&&m.id)dbOp(()=>F.deleteDoc(F.doc(db,'world_chat',m.id)));
    return !expired;
  });
  if(worldMsgs.length!==beforeW){
    ls.set('sg_world_msgs',worldMsgs);
    changed=true;
  }

  Object.values(chats||{}).forEach(th=>{
    if(!th||!Array.isArray(th.messages))return;
    const prev=th.messages.length;
    th.messages=th.messages.filter(m=>{
      if(th.dev&&m.id==='w1')return true;
      return (now-Number(m.ts||now))<SEVEN_DAYS_MS;
    });
    if(th.messages.length!==prev)changed=true;
  });

  if(changed){
    saveChats();
    if(cur)renderThread();
    else renderChats();
  }
}

function ingestRemoteDmDocs(dmDocs){
  const now=Date.now();let gotNewUnread=false;
  [...dmDocs].sort((a,b)=>(a.ts||0)-(b.ts||0)).forEach(docItem=>{
    const ts=Number(docItem.ts||now);
    if((now-ts)>=SEVEN_DAYS_MS){
      dbOp(()=>F.deleteDoc(F.doc(db,'dm_messages',docItem.id)));
      return;
    }
    if(docItem.to!==uid&&docItem.from!==uid)return;
    const isMe=docItem.from===uid, peerId=isMe?docItem.to:docItem.from;
    if(!peerId||peerId===uid)return;
    if(!chats[peerId]){
      const po=allUsers().find(u=>u.uid===peerId);
      chats[peerId]={id:peerId,name:po?.name||docItem.fromName||peerId,uid:peerId,messages:[]};
    }
    const th=chats[peerId];th.messages=th.messages||[];
    const type=docItem.type||'text';

    if(type==='duel_accept'||type==='duel_result'){
      const d=th.messages.find(x=>x.id===docItem.ref);if(!d)return;
      if(type==='duel_accept')d.accepted=true;
      else if(isMe){if(d.myScore==null)d.myScore=Number(docItem.score)}
      else if(d.oppScore==null)d.oppScore=Number(docItem.score);
      return;
    }

    const existing=th.messages.find(m=>m.id===docItem.id);
    if(existing){
      if(type==='red_packet'){
        existing.claimedBy=Array.isArray(docItem.claimedBy)?docItem.claimedBy:(existing.claimedBy||[]);
        existing.claimedCount=Number(docItem.claimedCount||existing.claimedBy.length);
      }
      return;
    }

    const m={
      id:docItem.id,
      from:isMe?'me':'them',
      type:['duel','red_packet','gift','party_invite','game_invite'].includes(type)?type:'text',
      text:docItem.text||'',
      msgStyle:docItem.msgStyle||'',
      ts
    };
    if(m.type==='duel'){m.gi=Number(docItem.gi)||0;m.accepted=false}
    if(m.type==='party_invite'||m.type==='game_invite'){
      m.roomId=docItem.roomId||'';
      m.roomCode=docItem.roomCode||'';
      m.roomTitle=docItem.roomTitle||docItem.gameName||'Room';
      m.gameId=docItem.gameId||(m.type==='party_invite'?'party':'');
      m.gameName=docItem.gameName||docItem.roomTitle||'Game Room';
      m.mode=docItem.mode||'';
      m.stake=Number(docItem.stake)||0;
      m.url=docItem.url||'';
    }
    if(m.type==='gift'){
      m.fromUid=docItem.from||'';
      m.toUid=docItem.to||'';
      m.giftId=docItem.giftId||'g01_rose';
      m.qty=clampSafeInt(docItem.qty||1,1,100);
      m.fromName=docItem.fromName||'Player';
      m.toName=docItem.toName||'Player';
      m.charm=clampSafeInt(docItem.charm||0,0,MAX_COINS);
      m.luckyCoins=clampSafeInt(docItem.luckyCoins||0,0,MAX_COINS);
      m.luckLabel=docItem.luckLabel||'Lucky Drop';
    }
    if(m.type==='red_packet'){
      m.amount=clampSafeInt(docItem.amount,1,20000);
      m.maxClaims=clampSafeInt(docItem.maxClaims||1,1,50);
      m.claimedBy=Array.isArray(docItem.claimedBy)?docItem.claimedBy:[];
      m.claimedCount=Number(docItem.claimedCount||m.claimedBy.length);
      m.note=docItem.note||'Lucky Coin Lifafa!';
      m.fromUid=docItem.from;
      m.fromName=docItem.fromName||'Player';
      m.isDevDrop=Boolean(docItem.isDevDrop);
      m.targetUid=docItem.to;
    }
    th.messages.push(m);
    th.messages.sort((a,b)=>(a.ts||0)-(b.ts||0));
    if(!isMe&&cur!==peerId){me.unreadFrom[peerId]=true;gotNewUnread=true}
    if(!isMe && dmHydrated && typeof playSfx==='function'){
      playSfx(m.type==='red_packet'?'redPacketDrop':(m.type==='gift'?'giftReceive':'chatRecv'));
    }
  });
  dmHydrated=true;
  if(gotNewUnread)saveMe();
  pruneExpiredChats();
  sweepDuels();saveChats();updateUnreadDots();
  if(!cur)renderChats();else renderThread();
}

function updateUnreadDots(){
  const hasPendingBond=typeof getPendingBondRequestsForMe==='function'&&getPendingBondRequestsForMe().length>0;
  const hasUnread=Object.values(me.unreadFrom||{}).some(Boolean)||hasPendingBond;
  const dot=$('#chatNavDot');if(dot)dot.hidden=!hasUnread;
}
const mid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const hasBadWord=(txt)=>BAD_WORDS.some(w=>new RegExp(`\\b${w}\\b`,'i').test(txt));

function resolveWorldSender(m){
  const live=allUsers().find(u=>u.uid===m.uid);
  if(live){
    return {
      uid:live.uid,name:live.name||m.name||m.fromName||'Player',
      avatar:live.avatar||m.avatar||'av_b1',frame:live.frame||m.frame||'none',
      banner:live.banner||m.banner||'bn-aurora',textStyle:live.textStyle||m.textStyle||'',
      msgStyle:m.msgStyle||live.msgStyle||'',
      tags:Array.isArray(live.tags)&&live.tags.length?live.tags:(m.tags||['Newbie']),
      exp:live.exp??m.exp??0,tempUnlocks:live.tempUnlocks||{},
      vipTier:live.vipTier||m.vipTier||'',vipUntil:live.vipUntil||m.vipUntil||0,
      clanTag:live.clanTag||m.clanTag||'',title:live.title||m.title||'',
      isDev:isDevAccount(live)||Boolean(m.isDev)
    };
  }
  return {
    uid:m.uid||m.fromUid||'',name:m.name||m.fromName||'Player',
    avatar:m.avatar||'av_b1',frame:m.frame||'none',
    banner:m.banner||'bn-aurora',textStyle:m.textStyle||'',
    msgStyle:m.msgStyle||'',
    tags:Array.isArray(m.tags)&&m.tags.length?m.tags:(m.isDev?['Developer','LVL 99']:['Newbie']),
    exp:m.exp||0,tempUnlocks:{},vipTier:m.vipTier||'',vipUntil:m.vipUntil||0,
    clanTag:m.clanTag||'',title:m.title||'',isDev:Boolean(m.isDev)
  };
}

function renderRedPacketCard(m, scope){
  const claimedBy=Array.isArray(m.claimedBy)?m.claimedBy:[];
  const maxClaims=Math.max(1,Number(m.maxClaims||1));
  const claimedCount=Math.max(claimedBy.length,Number(m.claimedCount||0));
  const alreadyMine=claimedBy.includes(uid)||Boolean(me.done['rp_'+m.id]);
  const exhausted=claimedCount>=maxClaims;
  const wrongTarget=Boolean(m.targetUid && m.targetUid!==uid && scope==='dm');
  const isSender=m.fromUid===uid || m.uid===uid || (m.from==='me' && scope!=='world');
  const titleLabel=m.isDevDrop?'Developer Coin Lifafa':`${esc(m.fromName||m.name||'Player')}'s Coin Lifafa`;

  let btnText=`Claim +${fmtNum(m.amount)} 🪙`, disabled=false;
  if(alreadyMine){btnText='Claimed ✓';disabled=true}
  else if(exhausted){btnText='All Claimed';disabled=true}
  else if(wrongTarget){btnText='Recipient Only';disabled=true}
  else if(isSender && scope==='dm'){btnText='Sent Lifafa';disabled=true}

  return `<div class="rp-card ${alreadyMine||exhausted?'rp-done':''}">
    <div class="rp-top">
      <div class="rp-seal">🧧</div>
      <div class="rp-info">
        <b>${titleLabel} · +${fmtNum(m.amount)} 🪙</b>
        <p>${esc(m.note||'Tap fast to claim your lucky coins!')}</p>
      </div>
    </div>
    <div class="rp-foot">
      <span>${claimedCount}/${maxClaims} claimed</span>
      <button type="button" class="rp-claim-btn" data-claimrp="${esc(m.id)}" data-rpscope="${esc(scope)}" ${disabled?'disabled':''}>${btnText}</button>
    </div>
  </div>`;
}

function renderFlashDropCard(m){
  const now=Date.now();
  const expiresAt=Number(m.expiresAt||(Number(m.ts||now)+10000));
  const remSec=Math.max(0,Math.ceil((expiresAt-now)/1000));
  const claimedBy=Array.isArray(m.claimedBy)?m.claimedBy:[];
  const alreadyMine=claimedBy.includes(uid)||Boolean(me.done['fd_'+m.id]);
  const exhausted=claimedBy.length>=Number(m.maxClaims||3);
  const expired=remSec<=0;

  let btnHtml='';
  if(alreadyMine)btnHtml=`<button type="button" class="rp-claim-btn" disabled>Claimed ✓</button>`;
  else if(exhausted)btnHtml=`<button type="button" class="rp-claim-btn" disabled>Snatched!</button>`;
  else if(expired)btnHtml=`<button type="button" class="rp-claim-btn" disabled>Expired (10s)</button>`;
  else if(m.flashMode==='tap'){
    btnHtml=`<button type="button" class="btn gold sm" data-claimflash="${esc(m.id)}">⚡ Grab +${fmtNum(m.rewardCoins||80)} 🪙</button>`;
  }else{
    btnHtml=`<button type="button" class="btn gold sm" data-answerflash="${esc(m.id)}">⚡ Answer Now</button>`;
  }

  return `<div class="flash-drop-card ${expired||exhausted?'fd-ended':''}">
    <div class="row" style="justify-content:space-between;gap:8px">
      <b style="color:var(--gold)">⚡ 10-Second Chat Flash Drop</b>
      <span class="dur-pill" data-fd-timer="${esc(m.id)}">${expired?'0s':remSec+'s'}</span>
    </div>
    <p style="font-size:13px;margin:6px 0;font-weight:700">${esc(m.prompt||'Tap fastest to claim bonus coins!')}</p>
    <div class="row" style="justify-content:space-between;align-items:center">
      <small style="color:var(--mu)">+${fmtNum(m.rewardCoins||80)} 🪙 · ${claimedBy.length}/${Number(m.maxClaims||3)} winners</small>
      ${btnHtml}
    </div>
  </div>`;
}

let chatFilterTab='all';

function fmtChatShortTime(ts){
  if(!ts)return '';
  const d=new Date(ts);
  const now=new Date();
  if(d.toDateString()===now.toDateString())return d.toLocaleTimeString([],{hour:'numeric',minute:'2-digit'});
  return d.toLocaleDateString([],{month:'short',day:'numeric'});
}

function renderChats(){
  updateUnreadDots();
  const realDev=allUsers().find(u=>isDevAccount(u))||{uid:DEV_UID,avatar:'av_b1',frame:'none'};
  const lastWorld=worldMsgs.length?worldMsgs[worldMsgs.length-1]:null;
  const worldPrev=lastWorld?(lastWorld.type==='gift'?'🎁 Gift Drop':(lastWorld.type==='red_packet'?'🧧 Coin Lifafa':(lastWorld.type==='flash_drop'?'⚡ Flash Drop':(lastWorld.text||'World Chat')))):'Live World Chat';
  const worldTime=lastWorld?fmtChatShortTime(lastWorld.ts):'';

  const worldHtml=`<div class="wp-chat-row world" data-th="world">
    <div class="wp-cr-av"><div class="av-wrap" style="--s:46px"><div class="av">${UI_SVG.globe}</div></div><span class="wp-unread-badge blue">${Math.min(99,worldMsgs.length)}</span></div>
    <div class="wp-cr-mid">
      <div class="wp-cr-top"><b>World Chat</b><span class="wp-tag-pill cyan">Room</span></div>
      <small>${esc(worldPrev)}</small>
    </div>
    <span class="wp-cr-time">${esc(worldTime)}</span>
  </div>`;

  const devLast=chats.developer&&chats.developer.messages&&chats.developer.messages.length?chats.developer.messages[chats.developer.messages.length-1]:null;
  const devHtml=`<div class="wp-chat-row" data-th="developer">
    <button type="button" class="th-av-btn wp-cr-av" data-chatprof="${esc(realDev.uid)}" title="Developer Profile" aria-label="Developer Profile">${av(realDev,46)}</button>
    <div class="wp-cr-mid">
      <div class="wp-cr-top"><b>Developer</b><span class="wp-tag-pill pink">Official</span><span class="wp-tag-pill amber">DEV</span></div>
      <small>${esc(devLast?.text||'Official Support')}</small>
    </div>
    <span class="wp-cr-time">${esc(fmtChatShortTime(devLast?.ts))}</span>
  </div>`;

  const dmThreads=Object.values(chats).filter(t=>t&&!t.dev&&(t.uid||t.id)&&t.id!==uid).sort((a,b)=>{
    const at=(a.messages&&a.messages.length)?a.messages[a.messages.length-1].ts:0;
    const bt=(b.messages&&b.messages.length)?b.messages[b.messages.length-1].ts:0;
    return bt-at;
  });

  // Also surface real online friends from me.friends who do not have a DM thread yet
  const existingPeerUids=new Set(dmThreads.map(t=>t.uid||t.id));
  const extraFriends=(Array.isArray(me.friends)?me.friends:[])
    .filter(fUid=>fUid&&fUid!==uid&&!existingPeerUids.has(fUid))
    .map(fUid=>allUsers().find(u=>u.uid===fUid))
    .filter(u=>u&&!(typeof isGuestUser==='function'&&isGuestUser(u)))
    .map(u=>({id:u.uid,uid:u.uid,name:u.name||u.uid,messages:[]}));

  const combinedDmList=[...dmThreads,...extraFriends];

  const dmHtml=combinedDmList.map(t=>{
    const peerUid=t.uid||t.id;
    const peerUser=allUsers().find(u=>u.uid===peerUid)||{uid:peerUid,name:t.name||peerUid,avatar:'av_b1',frame:'none'};
    const hasUnread=Boolean(me.unreadFrom&&me.unreadFrom[peerUid]);
    const last=t.messages&&t.messages.length?t.messages[t.messages.length-1]:null;
    const preview=last?(last.type==='red_packet'?'🧧 Lifafa':(last.type==='gift'?'🎁 Gift':(last.type==='party_invite'?'🎙️ Voice Invite':(last.type==='game_invite'?'🎮 Game Invite':(last.type==='duel'?'⚔️ Duel':last.text))))):'Tap to message';
    const peerOn=typeof isUserOnline==='function'&&isUserOnline(peerUser);
    const peerAct=typeof getUserLiveActivity==='function'?getUserLiveActivity(peerUser):{online:peerOn,canSpectate:false,label:peerOn?'Online':'Offline'};
    const actBadge=typeof renderOnlineActivityBadge==='function'?renderOnlineActivityBadge(peerUser,{compact:true}):'';
    return `<div class="wp-chat-row" data-th="${esc(t.id)}">
      <button type="button" class="th-av-btn wp-cr-av" data-chatprof="${esc(peerUid)}" title="Player Profile" aria-label="Player Profile">
        <span class="sg-av-presence-wrap">${av(peerUser,46)}${peerOn?'<span class="sg-online-dot" title="Online"></span>':''}</span>
        ${hasUnread?'<span class="wp-unread-badge">1</span>':''}
      </button>
      <div class="wp-cr-mid">
        <div class="wp-cr-top"><b>${styledName(peerUser)}</b>${peerUser.clanTag?`<span class="wp-tag-pill violet">[${esc(peerUser.clanTag)}]</span>`:''}${actBadge}</div>
        <small>${esc(preview)}</small>
      </div>
      <div class="wp-cr-right">
        ${peerAct.canSpectate?`<button type="button" class="btn sm gold sg-row-spec-btn" data-spectate-uid="${esc(peerUid)}" title="Watch live match">👁️ View</button>`:''}
        <span class="wp-cr-time">${esc(fmtChatShortTime(last?.ts))}</span>
      </div>
    </div>`;
  }).join('');

  const inboxHtml=devMode?Object.values(devInbox).filter(x=>x&&x.uid&&x.uid!==uid).map(th=>{
    const hasUnread=Boolean(me.unreadFrom&&me.unreadFrom[th.uid]);
    return `<div class="wp-chat-row" data-th="inbox:${esc(th.uid)}">
      <button type="button" class="th-av-btn wp-cr-av" data-chatprof="${esc(th.uid)}" aria-label="Player Profile">${av(th,44)}${hasUnread?'<span class="wp-unread-badge">!</span>':''}</button>
      <div class="wp-cr-mid">
        <div class="wp-cr-top"><b>${esc(th.name||th.uid)}</b><span class="wp-tag-pill amber">Inbox</span></div>
        <small>ID ${esc(String(th.uid||'').slice(-8))}</small>
      </div>
    </div>`;
  }).join(''):'';

  const tabsHtml=`<div class="wp-filter-tabs" id="chatFilterTabs">
    <button type="button" class="wp-ftab ${chatFilterTab==='all'?'on':''}" data-cf="all">All</button>
    <button type="button" class="wp-ftab ${chatFilterTab==='friends'?'on':''}" data-cf="friends">Friends</button>
    <button type="button" class="wp-ftab ${chatFilterTab==='official'?'on':''}" data-cf="official">Rooms</button>
  </div>`;

  const bondReqBanner=typeof renderPendingBondRequestsBannerHtml==='function'?renderPendingBondRequestsBannerHtml(true):'';

  let body='';
  if(chatFilterTab==='friends')body=bondReqBanner+(dmHtml||'<div class="empty" style="padding:18px">No friend chats yet</div>');
  else if(chatFilterTab==='official')body=worldHtml+devHtml+inboxHtml;
  else body=bondReqBanner+worldHtml+devHtml+dmHtml+inboxHtml;

  $('#chatList').innerHTML=tabsHtml+body;
  const cft=$('#chatFilterTabs');
  if(cft)cft.onclick=e=>{
    const b=e.target.closest('[data-cf]');
    if(!b)return;
    e.stopPropagation();
    chatFilterTab=b.dataset.cf;
    renderChats();
  };
}

$('#clearDevInboxBtn').onclick=()=>{
  if(!devMode)return toast('Developer only');
  Object.keys(devInbox).forEach(k=>dbOp(()=>F.deleteDoc(F.doc(db,'dev_inbox',k))));
  devInbox={};ls.set('sg_dev_inbox',devInbox);renderChats();toast('Inbox cleared');
};
$('#chatList').onclick=e=>{
  const specBtn=e.target.closest('[data-spectate-uid]');
  if(specBtn&&specBtn.dataset.spectateUid){
    e.stopPropagation();
    if(typeof spectateUserMatch==='function')spectateUserMatch(specBtn.dataset.spectateUid);
    return;
  }
  const accBtn=e.target.closest('[data-accept-bond]');
  if(accBtn){
    e.stopPropagation();
    if(typeof acceptPendingBondProposal==='function')acceptPendingBondProposal(accBtn.dataset.acceptBond);
    return;
  }
  const decBtn=e.target.closest('[data-decline-bond]');
  if(decBtn){
    e.stopPropagation();
    if(typeof declinePendingBondProposal==='function')declinePendingBondProposal(decBtn.dataset.declineBond);
    return;
  }
  const cp=e.target.closest('[data-chatprof]');
  if(cp&&cp.dataset.chatprof){
    e.stopPropagation();
    openPublicProfile(cp.dataset.chatprof);
    return;
  }
  const c=e.target.closest('[data-th]');
  if(c){
    const tid=c.dataset.th;
    if(tid!=='world'&&tid!=='developer'&&!tid.startsWith('inbox:')&&!chats[tid]){
      const u=allUsers().find(x=>x.uid===tid);
      chats[tid]={id:tid,uid:tid,name:u?.name||tid,messages:[]};
      saveChats();
    }
    openThread(tid);
  }
};

function openThread(id){
  cur=id;
  const peerKey=id.startsWith('inbox:')?id.slice(6):id;
  if(me.unreadFrom&&me.unreadFrom[peerKey]){delete me.unreadFrom[peerKey];saveMe();updateUnreadDots()}
  $('#thread').hidden=false;renderThread();
}

function renderThread(){
  if(!cur)return;
  const rpBtn=$('#rpBtn');
  if(rpBtn)rpBtn.hidden=false;
  const fdBtn=$('#flashDropBtn');
  if(fdBtn)fdBtn.hidden=(cur!=='world');

  if(cur==='world'){
    $('#thHead').className='thh';
    $('#thHead').innerHTML=`<button class="x" id="thBack" aria-label="Back">←</button><div class="mid"><b>World Chat</b><small>${worldMsgs.length} messages · Coin Lifafa &amp; 10s Flash Drops</small></div>`;
    $('#thBack').onclick=()=>{$('#thread').hidden=true;cur=null;renderChats()};
    $('#chBtn').hidden=true;

    $('#msgs').innerHTML=(worldMsgs||[]).map(m=>{
      const s=resolveWorldSender(m);
      const isOut=m.uid===uid;
      const rb=getActiveRankBadge(s);
      const dec=typeof renderNameDecorations==='function'?renderNameDecorations(s,{compact:true}):'';
      const tagsHtml=`<div class="wc-tags">${rb?`<span class="lb-badge ${esc(rb.badgeClass)}">${esc(rb.badge)}</span>`:''}${(s.tags||[]).slice(0,3).map(tg=>`<span class="p-tag ${tagClassFor(tg)}">${esc(tg)}</span>`).join('')}</div>`;
      const parsedInv=typeof parseRoomInviteFromText==='function'?parseRoomInviteFromText(m.text,m):null;
      let bodyHtml='';
      if(m.type==='red_packet')bodyHtml=renderRedPacketCard(m,'world');
      else if(m.type==='flash_drop')bodyHtml=renderFlashDropCard(m);
      else if(m.type==='gift'&&typeof renderWorldGiftCard==='function')bodyHtml=renderWorldGiftCard(m);
      else if(parsedInv&&typeof renderClickableInviteCard==='function'){
        bodyHtml=`<div class="bub ${esc(s.msgStyle||'')}">${renderClickableInviteCard(parsedInv,{senderName:s.name})}</div>`;
      }else bodyHtml=`<div class="bub ${esc(s.msgStyle||'')}">${linkify(esc(m.text))}</div>`;

      return `<div class="m wc-m ${isOut?'out':'in'}">
        <div class="wc-card">
          <div class="wc-banner-bar ${esc(s.banner||'bn-aurora')}" data-wprof="${esc(s.uid)}">
            ${av(s,40)}
            <div class="wc-head-meta">
              <div class="wc-name-row"><b>${styledName(s)}</b> ${dec} <span class="wc-lvl">LVL ${fmtNum(calcLevel(s.exp),MAX_LEVEL)}</span></div>
              ${tagsHtml}
            </div>
            ${!isOut&&s.uid?`<button type="button" class="wc-rep-btn" data-repuser="${esc(s.uid)}" data-repname="${esc(s.name)}" title="Report message" aria-label="Report player">🚩</button>`:''}
          </div>
          <div class="wc-body">${bodyHtml}</div>
        </div>
        <time>${new Date(m.ts||Date.now()).toLocaleString([],{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})}</time>
      </div>`;
    }).join('')||'<div class="empty">Say hello in World Chat! Drop a Coin Lifafa or Flash Drop anytime.</div>';
    $('#msgs').scrollTop=$('#msgs').scrollHeight;
    return;
  }

  const isInbox=cur.startsWith('inbox:');
  const t=isInbox?devInbox[cur.slice(6)]:chats[cur];
  if(!t)return;
  const realDevUser=allUsers().find(u=>isDevAccount(u))||{uid:DEV_UID,name:'Developer',avatar:'av_b1',frame:'none'};
  const peerUid=t.dev?realDevUser.uid:(t.uid||(isInbox?cur.slice(6):cur));
  const peerUser=t.dev?realDevUser:(allUsers().find(u=>u.uid===peerUid)||{uid:peerUid,name:t.name||peerUid,avatar:'av_b1',frame:'none'});
  const peerOn=typeof isUserOnline==='function'&&isUserOnline(peerUser);
  const peerAct=typeof getUserLiveActivity==='function'?getUserLiveActivity(peerUser):{online:peerOn,canSpectate:false,label:peerOn?'Online':'Offline'};
  const spectateHeadBtn=!t.dev&&!isInbox&&peerAct.canSpectate?`<button type="button" class="btn gold sm" id="dmSpectateBtn" title="Watch friend's live match">👁️ View</button>`:'';
  const invitePartyBtn=!t.dev&&!isInbox?`<button type="button" class="btn ghost sm" id="dmPartyInviteBtn" title="Invite to Voice Room">🎙️ Invite</button>`:'';
  $('#thHead').className='thh'+(t.dev?' dv':'');
  $('#thHead').innerHTML=`<button class="x" id="thBack" aria-label="Back">←</button><button type="button" class="th-prof-trigger" data-headprof="${esc(peerUid)}" title="Tap to view player profile"><span class="sg-av-presence-wrap">${av(peerUser,36)}${peerOn?'<span class="sg-online-dot sm"></span>':''}</span><div class="mid"><b>${t.dev?'<span class="anim-firetxt">Developer</span>':styledName(peerUser)}</b><small>${esc(peerAct.label)} · Tap for profile</small></div></button>${spectateHeadBtn}${invitePartyBtn}${devMode&&isInbox?`<button class="btn red sm" id="clrSingle">Clear</button>`:''}`;
  $('#thBack').onclick=()=>{$('#thread').hidden=true;cur=null;renderChats()};
  const headProfBtn=$('#thHead').querySelector('[data-headprof]');
  if(headProfBtn)headProfBtn.onclick=()=>openPublicProfile(headProfBtn.dataset.headprof);
  if($('#dmSpectateBtn'))$('#dmSpectateBtn').onclick=()=>{
    $('#thread').hidden=true;cur=null;
    if(typeof spectateUserMatch==='function')spectateUserMatch(peerUid);
  };
  if($('#dmPartyInviteBtn'))$('#dmPartyInviteBtn').onclick=()=>sendDmPartyInvite(peerUid,t);
  if($('#clrSingle'))$('#clrSingle').onclick=()=>{
    if(!devMode)return;
    const tid=cur.slice(6);delete devInbox[tid];ls.set('sg_dev_inbox',devInbox);
    dbOp(()=>F.deleteDoc(F.doc(db,'dev_inbox',tid)));
    $('#thread').hidden=true;cur=null;renderChats();
  };
  $('#chBtn').hidden=!!t.dev||isInbox;

  $('#msgs').innerHTML=(t.messages||[]).map(m=>{
    const out=isInbox?(m.from==='dev'):(m.from==='me');
    if(m.type==='red_packet'){
      return `<div class="m ${out?'out':'in'}">${renderRedPacketCard(m,isInbox?'inbox':'dm')}<time>${new Date(m.ts).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})}</time></div>`;
    }
    if(m.type==='party_invite'||m.type==='game_invite'){
      const inv=typeof parseRoomInviteFromText==='function'
        ?(parseRoomInviteFromText(m.text,m)||{type:m.type==='party_invite'?'party':'game',gameId:m.gameId||(m.type==='party_invite'?'party':'ludo'),gameName:m.gameName||m.roomTitle||'Game Room',roomCode:m.roomCode||m.roomId||'',roomId:m.roomId||'',mode:m.mode||'',stake:Number(m.stake)||0,url:m.url||''})
        :null;
      if(inv&&typeof renderClickableInviteCard==='function'){
        return `<div class="m ${out?'out':'in'}"><div class="bub">${renderClickableInviteCard(inv)}</div><time>${new Date(m.ts).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})}</time></div>`;
      }
      return `<div class="m ${out?'out':'in'}"><div class="chal"><b>🎭 Room Invite</b><p>${esc(m.text||('Join '+(m.roomTitle||'Room')))}</p><button type="button" class="btn ok sm" data-joinparty="${esc(m.roomId)}">Join Room</button></div><time>${new Date(m.ts).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})}</time></div>`;
    }
    if(m.type==='gift'&&typeof renderWorldGiftCard==='function'){
      return `<div class="m ${out?'out':'in'}">${renderWorldGiftCard(m)}<time>${new Date(m.ts).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})}</time></div>`;
    }
    if(m.type==='duel'){
      const g=DUEL_GAMES[m.gi]||DUEL_GAMES[0],mine=m.from==='me',sm='style="color:var(--mu);font-size:12px"';
      let act;
      if(m.state==='won')act=`<b style="color:var(--ok)">Won 36 🪙</b> <small>(${m.myScore}–${m.oppScore})</small>`;
      else if(m.state==='tie')act='<b>Tie · 20 🪙 refunded</b>';
      else if(m.state==='lost')act=`<b style="color:var(--red)">Lost (${m.myScore}–${m.oppScore})</b>`;
      else if(m.state==='refund')act='<b>Friend timed out · 20 🪙 refunded</b>';
      else if(m.myScore!=null)act=`<span ${sm}>You scored ${m.myScore} · waiting for friend</span>`;
      else if(!m.accepted)act=mine?`<span ${sm}>Waiting for friend to accept…</span>`:`<button class="btn ok sm" data-acceptduel="${m.id}">Accept Challenge</button>`;
      else act=`<button class="btn sm" data-startduel="${m.id}">Start 60s Match (20 🪙)</button>`;
      return `<div class="m ${out?'out':'in'}"><div class="chal"><b>${esc(g.name)}</b><p>Bet 20+20 = 40 🪙 · Winner <span class="rw">36 🪙</span> (4 🪙 fee) · +4 right / −2 wrong</p>${act}</div><time>${new Date(m.ts).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})}</time></div>`;
    }
    const textInv=typeof parseRoomInviteFromText==='function'?parseRoomInviteFromText(m.text,m):null;
    const styleCls=m.msgStyle||(out&&me.msgStyle?me.msgStyle:'');
    const cls=(t.dev&&(out||devMode)||isInbox)?' fire-border':(styleCls?' '+esc(styleCls):'');
    if(textInv&&typeof renderClickableInviteCard==='function'){
      return `<div class="m ${out?'out':'in'}"><div class="bub${cls}">${renderClickableInviteCard(textInv)}</div><time>${new Date(m.ts).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})}</time></div>`;
    }
    return `<div class="m ${out?'out':'in'}"><div class="bub${cls}">${linkify(esc(m.text))}</div><time>${new Date(m.ts).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})}</time></div>`;
  }).join('')||'<div class="empty">Start the conversation! Messages stay for 7 days.</div>';
  $('#msgs').scrollTop=$('#msgs').scrollHeight;
}

function sendDmPartyInvite(peerUid, threadObj){
  if(!peerUid||!threadObj)return;
  const activeList=typeof partyRooms!=='undefined'&&Array.isArray(partyRooms)?partyRooms:[];
  const targetRoom=activeList.find(r=>r.hostUid===uid)||activeList[0];
  if(!targetRoom){
    toast('Create a Party Room on Home first, then invite!');
    if(typeof openCreatePartyRoomModal==='function')openCreatePartyRoomModal();
    return;
  }
  const code=String(targetRoom.shortId||targetRoom.id).toUpperCase();
  const url=typeof buildRoomInviteUrl==='function'
    ?buildRoomInviteUrl({type:'party',roomId:targetRoom.id,roomCode:code})
    :`?party=${encodeURIComponent(targetRoom.id)}&room=${encodeURIComponent(code)}`;
  const id='pi_'+mid(), nowTs=Date.now();
  const text=`🎙️ Join my Voice Room "${targetRoom.title||'Party Room'}"! Room Code: ${code} ${url}`;
  const msgObj={id,from:'me',type:'party_invite',gameId:'party',gameName:targetRoom.title||'Voice Room',roomId:targetRoom.id,roomCode:code,roomTitle:targetRoom.title||'Party Room',url,text,ts:nowTs};
  threadObj.messages=threadObj.messages||[];
  threadObj.messages.push(msgObj);
  saveChats();
  dbOp(()=>F.setDoc(F.doc(db,'dm_messages',id),{id,from:uid,fromName:me.name,to:peerUid,type:'party_invite',gameId:'party',gameName:targetRoom.title||'Voice Room',roomId:targetRoom.id,roomCode:code,roomTitle:targetRoom.title||'Party Room',url,text,ts:nowTs}));
  if(typeof playSfx==='function')playSfx('chatSend');
  renderThread();
  toast('Clickable Voice Room invite sent!');
}

async function claimRedPacket(packetId, scope){
  if(!packetId)return;
  const lockKey='rp_claim_'+packetId;
  if(inFlightOps.has(lockKey))return;
  if(me.done['rp_'+packetId])return toast('You already claimed this Coin Lifafa');

  let msg=null;
  if(scope==='world')msg=worldMsgs.find(x=>x.id===packetId);
  else if(scope==='inbox'&&cur&&cur.startsWith('inbox:'))msg=(devInbox[cur.slice(6)]?.messages||[]).find(x=>x.id===packetId);
  else if(chats[cur])msg=(chats[cur].messages||[]).find(x=>x.id===packetId);
  if(!msg||msg.type!=='red_packet')return toast('Coin Lifafa unavailable');

  const claimedBy=Array.isArray(msg.claimedBy)?[...msg.claimedBy]:[];
  const maxClaims=Math.max(1,Number(msg.maxClaims||1));
  if(claimedBy.includes(uid))return toast('Already claimed');
  if(claimedBy.length>=maxClaims)return toast('Coin Lifafa fully claimed');
  if(scope==='dm'&&msg.targetUid&&msg.targetUid!==uid)return toast('Reserved for chat recipient');

  inFlightOps.add(lockKey);
  try{
    if(online&&db&&F){
      const claimRef=F.doc(db,'red_packets',packetId,'claims',uid);
      const existingClaim=await F.getDoc(claimRef).catch(()=>null);
      if(existingClaim&&existingClaim.exists()){
        me.done['rp_'+packetId]=1;saveMe();renderThread();
        return toast('You already claimed this Coin Lifafa');
      }
      await F.setDoc(claimRef,{uid,claimedAt:Date.now(),amount:msg.amount}).catch(()=>{});
    }

    claimedBy.push(uid);
    msg.claimedBy=claimedBy;
    msg.claimedCount=claimedBy.length;
    me.done['rp_'+packetId]=1;

    if(scope==='world'){
      ls.set('sg_world_msgs',worldMsgs);
      dbOp(()=>F.setDoc(F.doc(db,'world_chat',packetId),{claimedBy,claimedCount:claimedBy.length},{merge:true}));
    }else if(scope==='dm'){
      saveChats();
      dbOp(()=>F.setDoc(F.doc(db,'dm_messages',packetId),{claimedBy,claimedCount:claimedBy.length},{merge:true}));
    }else if(scope==='inbox'&&cur&&cur.startsWith('inbox:')){
      const tid=cur.slice(6);
      syncDevInboxToCloud(tid,devInbox[tid]);
    }
    dbOp(()=>F.setDoc(F.doc(db,'red_packets',packetId),{claimedBy,claimedCount:claimedBy.length},{merge:true}));

    addReward(clampSafeInt(msg.amount,1,20000),0,null,true,{skipLevelUp:true,silentSfx:true});
    if(typeof playSfx==='function')playSfx('redPacketClaim');
    renderThread();
    toast(`🧧 Claimed +${fmtNum(msg.amount)} coins from Coin Lifafa!`);
  }finally{
    setTimeout(()=>inFlightOps.delete(lockKey),600);
  }
}

/* Player + Developer Coin Lifafa (Red Envelope) Drop */
function openRedPacketDropModal(){
  if(!cur)return;
  if(typeof isMutedNow==='function'&&isMutedNow())return toast(`You are muted (${muteRemainingText()})`);
  const isWorld=cur==='world';
  const m=modal(devMode?'Drop Coin Lifafa (Developer) 🧧':'Drop Coin Lifafa (Red Envelope) 🧧',`
    <p style="font-size:12px;color:var(--mu)">${devMode?'Developer drops are free or custom-sized.':'Fund a live Coin Lifafa from your wallet for players to race & claim!'}</p>
    <label>Coins Per Claim (10–${devMode?'20,000':'5,000'})</label>
    <input id="rpAmt" type="number" min="10" max="${devMode?20000:5000}" value="50">
    ${isWorld?`<label>Max Winners (1–${devMode?50:20})</label><input id="rpMax" type="number" min="1" max="${devMode?50:20}" value="${devMode?10:5}">`:''}
    <label>Envelope Message</label>
    <input id="rpNote" maxlength="90" value="${devMode?'Lucky coin drop from Developer!':'Grab this lucky Coin Lifafa!'}">
    <div id="rpTotalNote" style="font-size:12px;color:var(--gold);font-weight:700;margin-top:6px"></div>
    <button class="btn crimson full" id="rpSend">Drop Coin Lifafa 🧧</button>
  `);
  const syncTotal=()=>{
    const amt=clampSafeInt($('#rpAmt',m).value,10,devMode?20000:5000);
    const maxC=isWorld?clampSafeInt($('#rpMax',m)?.value,1,devMode?50:20):1;
    const total=amt*maxC;
    $('#rpTotalNote',m).textContent=devMode?`Developer Drop: ${fmtNum(total)} 🪙 total (no wallet deduction)`:`Total Cost: ${fmtNum(total)} 🪙 (Your Wallet: ${fmtNum(me.coins)} 🪙)`;
  };
  $('#rpAmt',m).oninput=syncTotal;
  if($('#rpMax',m))$('#rpMax',m).oninput=syncTotal;
  syncTotal();

  $('#rpSend',m).onclick=()=>{
    const amount=clampSafeInt($('#rpAmt',m).value,10,devMode?20000:5000);
    const maxClaims=isWorld?clampSafeInt($('#rpMax',m)?.value,1,devMode?50:20):1;
    const totalCost=amount*maxClaims;
    if(!devMode && me.coins<totalCost)return toast(`Need ${fmtNum(totalCost)} coins in wallet`);
    const note=$('#rpNote',m).value.trim()||'Lucky Coin Lifafa!';
    const id='rp_'+mid(), nowTs=Date.now();
    if(!devMode){
      addReward(-totalCost,0,null,true,{silentSfx:true,skipLevelUp:true});
    }

    const rpRecord={id,fromUid:uid,fromName:me.name,isDevDrop:devMode,amount,maxClaims,claimedBy:[],claimedCount:0,note,scope:isWorld?'world':'dm',ts:nowTs};
    dbOp(()=>F.setDoc(F.doc(db,'red_packets',id),rpRecord));

    if(isWorld){
      const item={
        id,type:'red_packet',uid,fromUid:uid,name:me.name,fromName:me.name,avatar:me.avatar,frame:me.frame,banner:me.banner,
        textStyle:me.textStyle,msgStyle:me.msgStyle,tags:me.tags,exp:me.exp,isDev:devMode,isDevDrop:devMode,
        vipTier:me.vipTier||'',vipUntil:me.vipUntil||0,clanTag:me.clanTag||'',
        text:`🧧 Coin Lifafa: +${amount} coins`,amount,maxClaims,claimedBy:[],claimedCount:0,note,ts:nowTs
      };
      worldMsgs=[...worldMsgs,item].slice(-150);
      ls.set('sg_world_msgs',worldMsgs);
      dbOp(()=>F.setDoc(F.doc(db,'world_chat',id),item));
    }else if(cur.startsWith('inbox:')){
      const tid=cur.slice(6), entry=devInbox[tid];
      if(!entry)return m.close();
      entry.messages=entry.messages||[];
      entry.messages.push({id,from:'dev',fromUid:uid,fromName:me.name,isDevDrop:devMode,targetUid:tid,type:'red_packet',amount,maxClaims:1,claimedBy:[],claimedCount:0,note,ts:nowTs});
      syncDevInboxToCloud(tid,entry);
    }else{
      const t=chats[cur];if(!t)return m.close();
      t.messages=t.messages||[];
      const msgObj={id,from:'me',fromUid:uid,fromName:me.name,isDevDrop:devMode,targetUid:t.uid||cur,type:'red_packet',amount,maxClaims:1,claimedBy:[],claimedCount:0,note,ts:nowTs};
      t.messages.push(msgObj);saveChats();
      if(t.uid&&!t.dev){
        dbOp(()=>F.setDoc(F.doc(db,'dm_messages',id),{id,from:uid,fromName:me.name,isDevDrop:devMode,to:t.uid,type:'red_packet',amount,maxClaims:1,claimedBy:[],claimedCount:0,note,ts:nowTs}));
      }
    }
    m.close();renderThread();
    if(typeof playSfx==='function')playSfx('redPacketDrop');
    toast('🧧 Coin Lifafa dropped!');
  };
}

/* ===== 10-Second Chat Flash Drops (Tap / Quick Math / Fast Word) ===== */
function launchChatFlashDrop(){
  if(cur!=='world')return toast('Flash Drops work in World Chat');
  if(!devMode && me.coins<100)return toast('Players need 100 coins to host a Flash Drop');
  const a=12+Math.floor(Math.random()*38), b=7+Math.floor(Math.random()*28);
  const modes=[
    {flashMode:'tap',prompt:'⚡ LIGHTNING TAP! First 3 players to tap win +80 🪙!',answer:'',rewardCoins:80},
    {flashMode:'math',prompt:`⚡ QUICK MATH (10s): What is ${a} + ${b}?`,answer:String(a+b),rewardCoins:120},
    {flashMode:'word',prompt:'⚡ FASTEST TYPER (10s): Type the secret word "LUXURY"',answer:'LUXURY',rewardCoins:100}
  ];
  const pick=modes[Math.floor(Math.random()*modes.length)];
  if(!devMode)addReward(-100,0,null,true,{silentSfx:true,skipLevelUp:true});

  const nowTs=Date.now(), id='fd_'+mid();
  const item={
    id,type:'flash_drop',uid,name:me.name,avatar:me.avatar,frame:me.frame,banner:me.banner,
    textStyle:me.textStyle,msgStyle:me.msgStyle,tags:me.tags,exp:me.exp,isDev:devMode,
    vipTier:me.vipTier||'',vipUntil:me.vipUntil||0,clanTag:me.clanTag||'',
    flashMode:pick.flashMode,prompt:pick.prompt,answer:pick.answer,rewardCoins:pick.rewardCoins,
    maxClaims:3,claimedBy:[],expiresAt:nowTs+10000,ts:nowTs,text:pick.prompt
  };
  worldMsgs=[...worldMsgs,item].slice(-150);
  ls.set('sg_world_msgs',worldMsgs);
  dbOp(()=>F.setDoc(F.doc(db,'world_chat',id),item));
  if(typeof playSfx==='function')playSfx('flashDrop');
  renderThread();
  toast('⚡ 10-Second Flash Drop LIVE!');
}

function claimFlashDrop(dropId, suppliedAns){
  const item=(worldMsgs||[]).find(x=>x.id===dropId&&x.type==='flash_drop');
  if(!item)return toast('Flash Drop unavailable');
  if(Date.now()>Number(item.expiresAt||0))return toast('Flash Drop expired (10s over)');
  const claimedBy=Array.isArray(item.claimedBy)?[...item.claimedBy]:[];
  if(claimedBy.includes(uid)||me.done['fd_'+dropId])return toast('Already claimed!');
  if(claimedBy.length>=Number(item.maxClaims||3))return toast('All winners claimed!');

  if(item.flashMode!=='tap'){
    if(String(suppliedAns||'').trim().toUpperCase()!==String(item.answer||'').trim().toUpperCase()){
      if(typeof playSfx==='function')playSfx('duelWrong');
      return toast('Wrong answer — try fast!');
    }
  }
  claimedBy.push(uid);
  item.claimedBy=claimedBy;
  me.done['fd_'+dropId]=1;
  ls.set('sg_world_msgs',worldMsgs);
  dbOp(()=>F.setDoc(F.doc(db,'world_chat',dropId),{claimedBy},{merge:true}));
  const reward=clampSafeInt(item.rewardCoins||80,10,500);
  addReward(reward,12,null,true,{silentSfx:true});
  if(typeof playSfx==='function')playSfx('coin');
  renderThread();
  toast(`⚡ Flash Drop Winner! +${fmtNum(reward)} 🪙`);
}

setInterval(()=>{
  if(cur!=='world')return;
  $$('[data-fd-timer]').forEach(el=>{
    const id=el.dataset.fdTimer;
    const item=(worldMsgs||[]).find(x=>x.id===id);
    if(!item)return;
    const rem=Math.max(0,Math.ceil((Number(item.expiresAt||0)-Date.now())/1000));
    el.textContent=rem>0?(rem+'s'):'0s';
    if(rem===0&&!el.closest('.flash-drop-card')?.classList.contains('fd-ended')){
      renderThread();
    }
  });
},1000);

if($('#rpBtn'))$('#rpBtn').onclick=openRedPacketDropModal;
if($('#flashDropBtn'))$('#flashDropBtn').onclick=launchChatFlashDrop;

$('#msgs').onclick=e=>{
  const joinInvBtn=e.target.closest('[data-sg-join-invite]');
  if(joinInvBtn&&joinInvBtn.dataset.sgJoinInvite){
    e.stopPropagation();
    $('#thread').hidden=true;cur=null;
    if(typeof joinFromInvitePayload==='function')joinFromInvitePayload(joinInvBtn.dataset.sgJoinInvite);
    return;
  }
  const repBtn=e.target.closest('[data-repuser]');
  if(repBtn){
    e.stopPropagation();
    if(typeof openReportModal==='function')openReportModal(repBtn.dataset.repuser,repBtn.dataset.repname,'World Chat');
    return;
  }
  const jp=e.target.closest('[data-joinparty]');
  if(jp&&jp.dataset.joinparty&&typeof openPartyRoom==='function'){
    $('#thread').hidden=true;cur=null;
    openPartyRoom(jp.dataset.joinparty);
    return;
  }
  const cf=e.target.closest('[data-claimflash]');
  if(cf){claimFlashDrop(cf.dataset.claimflash,'');return}
  const af=e.target.closest('[data-answerflash]');
  if(af){
    const fdId=af.dataset.answerflash;
    const item=(worldMsgs||[]).find(x=>x.id===fdId);
    if(!item)return;
    const m=modal('⚡ Answer Flash Drop Fast!',`
      <p style="font-size:13px;font-weight:700">${esc(item.prompt)}</p>
      <input id="fdAnsIn" placeholder="Type answer..." autocomplete="off">
      <button type="button" class="btn gold full" id="fdAnsSub">Submit Answer</button>
    `);
    const sub=()=>{const v=$('#fdAnsIn',m).value;m.close();claimFlashDrop(fdId,v)};
    $('#fdAnsSub',m).onclick=sub;
    $('#fdAnsIn',m).onkeydown=ev=>{if(ev.key==='Enter')sub()};
    setTimeout(()=>$('#fdAnsIn',m)?.focus(),40);
    return;
  }
  const jRoom=e.target.closest('[data-joinroomcode]');
  if(jRoom&&jRoom.dataset.joinroomcode){
    $('#thread').hidden=true;cur=null;showTab('games');
    if(typeof joinMultiplayerRoomByCode==='function')joinMultiplayerRoomByCode(jRoom.dataset.joinroomcode);
    return;
  }
  const replayBtn=e.target.closest('[data-replaygift]');
  if(replayBtn&&replayBtn.dataset.replaygift&&typeof showLuxuryGiftShowcase==='function'){
    const gObj=typeof GIFT_BY_ID!=='undefined'?GIFT_BY_ID[replayBtn.dataset.replaygift]:null;
    if(gObj){
      showLuxuryGiftShowcase({
        giftId:gObj.id,
        fromName:replayBtn.dataset.replayfrom||'Player',
        toName:replayBtn.dataset.replayto||'Player',
        qty:Number(replayBtn.dataset.replayqty||1),
        charm:Number(replayBtn.dataset.replaycharm||gObj.charm),
        luckyCoins:Number(replayBtn.dataset.replaylucky||0)
      },gObj);
    }
    return;
  }
  const wprof=e.target.closest('[data-wprof]');
  if(wprof&&wprof.dataset.wprof){
    openPublicProfile(wprof.dataset.wprof);
    return;
  }
  const rpClaim=e.target.closest('[data-claimrp]');
  if(rpClaim){
    claimRedPacket(rpClaim.dataset.claimrp,rpClaim.dataset.rpscope||'world');
    return;
  }
  const t=chats[cur];if(!t)return;
  const acc=e.target.dataset.acceptduel;
  if(acc){
    if(needLogin('coin duels'))return;
    const m=t.messages.find(x=>x.id===acc);if(!m||m.from==='me'||m.accepted)return;
    if(!online)return toast('Need a live connection to accept');
    m.accepted=true;saveChats();
    dbOp(()=>F.setDoc(F.doc(db,'dm_messages','a_'+m.id),{id:'a_'+m.id,type:'duel_accept',ref:m.id,from:uid,to:t.uid,ts:Date.now()}));
    if(typeof playSfx==='function')playSfx('click');
    renderThread();return toast('Accepted! Both players can start now');
  }
  const st=e.target.dataset.startduel;
  if(st){const m=t.messages.find(x=>x.id===st);if(m&&m.accepted)startTimedDuel(m,t.uid)}
};

function sendMsgText(){
  if(typeof isMutedNow==='function'&&isMutedNow()){
    return toast(`You are muted for ${muteRemainingText()}`);
  }
  const inp=$('#msgIn'), text=inp.value.trim();if(!text)return;
  if(hasBadWord(text))return toast('Error: Bad language is not allowed');
  const now=Date.now();
  while(sendTimestamps.length&&now-sendTimestamps[0]>6000)sendTimestamps.shift();
  if(sendTimestamps.length>=5)return toast('Slow down a bit before sending more messages');
  sendTimestamps.push(now);
  inp.value='';

  if(cur==='world'){
    if(!vipChatAnnounced&&typeof showVipEntranceBanner==='function'){
      vipChatAnnounced=true;
      showVipEntranceBanner(me,'World Chat');
    }
    const id=mid();
    const item={
      id,type:'text',uid,name:me.name,avatar:me.avatar,frame:me.frame,banner:me.banner,
      textStyle:me.textStyle||'',msgStyle:me.msgStyle||'',tags:me.tags||[],exp:me.exp||0,
      vipTier:me.vipTier||'',vipUntil:me.vipUntil||0,clanTag:me.clanTag||'',title:me.title||'',
      isDev:devMode,text,ts:now
    };
    worldMsgs=[...worldMsgs,item].slice(-150);
    ls.set('sg_world_msgs',worldMsgs);
    dbOp(()=>F.setDoc(F.doc(db,'world_chat',id),item));
    if(typeof playSfx==='function')playSfx('chatSend');
    renderThread();return;
  }

  if(cur&&cur.startsWith('inbox:')){
    const tid=cur.slice(6), entry=devInbox[tid];if(!entry)return;
    entry.messages=entry.messages||[];
    entry.messages.push({id:mid(),from:'dev',type:'text',text,ts:now});
    syncDevInboxToCloud(tid,entry);
    if(typeof playSfx==='function')playSfx('chatSend');
    renderThread();return;
  }

  const t=chats[cur];if(!t)return;t.messages=t.messages||[];
  const msgId=mid(), curMsgStyle=me.msgStyle||'';
  const mObj={id:msgId,from:'me',type:'text',text,msgStyle:curMsgStyle,ts:now};
  t.messages.push(mObj);saveChats();
  if(typeof playSfx==='function')playSfx('chatSend');
  renderThread();

  if(t.dev){
    const entry=devInbox[uid]||{uid,name:me.name,avatar:me.avatar,frame:me.frame,messages:[]};
    entry.name=me.name;entry.avatar=me.avatar;entry.frame=me.frame;
    entry.messages.push({...mObj,from:'user'});
    devInbox[uid]=entry;syncDevInboxToCloud(uid,entry);
  }else if(t.uid){
    dbOp(()=>F.setDoc(F.doc(db,'dm_messages',msgId),{id:msgId,from:uid,fromName:me.name,to:t.uid,type:'text',text,msgStyle:curMsgStyle,ts:now}));
  }
}

$('#sendBtn').onclick=sendMsgText;
$('#msgIn').onkeydown=e=>{if(e.key==='Enter')sendMsgText()};

$('#chBtn').onclick=()=>{
  if(needLogin('coin duels'))return;
  if(cur==='world'||!cur||cur.startsWith('inbox:'))return toast('Duel only in player chat');
  if(!online)return toast('Duels need a live connection');
  const t=chats[cur];if(!t||t.dev)return;
  const m=modal('Send 60s MCQ Duel',DUEL_GAMES.map((g,i)=>`<button class="btn ghost full" data-d="${i}">${esc(g.name)} (20 🪙)</button>`).join(''));
  m.onclick=e=>{
    const d=e.target.dataset.d;if(d===undefined)return;
    t.messages=t.messages||[];
    const id=mid(),ts=Date.now();
    t.messages.push({id,from:'me',type:'duel',gi:+d,accepted:false,ts});
    saveChats();
    dbOp(()=>F.setDoc(F.doc(db,'dm_messages',id),{id,type:'duel',gi:+d,from:uid,fromName:me.name,to:t.uid,ts}));
    m.close();renderThread();
  };
};

if($('#giftBtn'))$('#giftBtn').onclick=()=>{
  if(typeof openGiftSendModal!=='function')return;
  if(!cur||cur==='world'){
    openGiftSendModal(null,{allowPickPlayer:true});
    return;
  }
  if(cur==='developer'){
    const realDev=allUsers().find(u=>isDevAccount(u))||{uid:DEV_UID,name:'Developer'};
    if(realDev.uid===uid)return openGiftSendModal(null,{allowPickPlayer:true});
    openGiftSendModal(realDev.uid,{targetName:realDev.name||'Developer'});
    return;
  }
  const targetUid=cur.startsWith('inbox:')?cur.slice(6):(chats[cur]?.uid||cur);
  const peerUser=allUsers().find(u=>u.uid===targetUid);
  openGiftSendModal(targetUid,{inDm:!cur.startsWith('inbox:'),targetName:peerUser?.name||chats[cur]?.name||'Player'});
};

function sendWorldMsg(text, meta){
  const clean=String(text||'').trim();
  if(!clean)return null;
  if(typeof isMutedNow==='function'&&isMutedNow()){
    toast(`You are muted for ${muteRemainingText()}`);
    return null;
  }
  if(hasBadWord(clean)){
    toast('Error: Bad language is not allowed');
    return null;
  }
  const now=Date.now();
  const id='wm_'+mid();
  const extra=meta&&typeof meta==='object'?meta:{};
  const item={
    id,type:extra.type||'text',uid,name:me.name,avatar:me.avatar,frame:me.frame,banner:me.banner,
    textStyle:me.textStyle||'',msgStyle:me.msgStyle||'',tags:me.tags||[],exp:me.exp||0,
    vipTier:me.vipTier||'',vipUntil:me.vipUntil||0,clanTag:me.clanTag||'',title:me.title||'',
    isDev:devMode,text:clean,ts:now,
    gameId:extra.gameId||'',gameName:extra.gameName||'',
    roomCode:extra.roomCode||'',roomId:extra.roomId||'',
    mode:extra.mode||'',stake:Number(extra.stake)||0,url:extra.url||''
  };
  worldMsgs=[...(worldMsgs||[]),item].slice(-150);
  ls.set('sg_world_msgs',worldMsgs);
  dbOp(()=>F.setDoc(F.doc(db,'world_chat',id),item));
  if(typeof playSfx==='function')playSfx('chatSend');
  if(cur==='world')renderThread();
  else renderChats();
  return item;
}
window.sendWorldMsg=sendWorldMsg;

$('#findBtn').onclick=()=>{
  const others=allUsers().filter(u=>u&&u.uid!==uid&&!(typeof isGuestUser==='function'&&isGuestUser(u)));
  const m=modal('Message or Add Player',`
    <label>Search Online Players by Name or UID (Guests filtered out)</label>
    <div class="row"><input id="fUid" placeholder="Enter Name or UID" autocomplete="off" style="flex:1"><button class="btn sm" id="fAdd">Chat</button></div>
    <div class="list" id="fResList" style="margin-top:12px"></div>
  `);
  const renderList=(q='')=>{
    const term=q.trim().toLowerCase();
    const filtered=others
      .filter(u=>!term||String(u.name||'').toLowerCase().includes(term)||String(u.uid||'').toLowerCase().includes(term))
      .sort((a,b)=>((typeof isUserOnline==='function'&&isUserOnline(b))?1:0)-((typeof isUserOnline==='function'&&isUserOnline(a))?1:0))
      .slice(0,30);
    $('#fResList',m).innerHTML=filtered.map(u=>{
      const on=typeof isUserOnline==='function'&&isUserOnline(u);
      const act=typeof getUserLiveActivity==='function'?getUserLiveActivity(u):{canSpectate:false,label:on?'Online':'Offline'};
      const actBadge=typeof renderOnlineActivityBadge==='function'?renderOnlineActivityBadge(u,{compact:true}):'';
      return `<div class="th" data-prof="${esc(u.uid)}">
        <span class="sg-av-presence-wrap">${av(u,38)}${on?'<span class="sg-online-dot sm"></span>':''}</span>
        <div class="mid"><b>${styledName(u)}</b><small>${actBadge||esc(u.uid)}</small></div>
        <div class="row" style="gap:5px">
          ${act.canSpectate?`<button type="button" class="btn sm gold" data-fspec="${esc(u.uid)}">👁️ View</button>`:''}
          <button type="button" class="btn sm" data-add="${esc(u.uid)}" data-nm="${esc(u.name)}">Chat</button>
        </div>
      </div>`;
    }).join('')||'<div class="empty">No active non-guest players matched.</div>';
  };
  renderList();
  $('#fUid',m).oninput=e=>renderList(e.target.value);

  const openF=(rawId,nm)=>{
    let id=String(rawId||'').trim();if(!id)return;
    const match=allUsers().find(u=>u.uid===id||u.uid.toLowerCase()===id.toLowerCase()||String(u.name||'').toLowerCase()===id.toLowerCase());
    if(match){id=match.uid;nm=nm||match.name}
    if(id===uid)return toast('Cannot chat with yourself');
    if(!isFriend(id)){me.friends.push(id);saveMe();patchUser(uid,{friends:me.friends});dbOp(()=>F.setDoc(userRef(uid),{friends:me.friends},{merge:true}))}
    if(!chats[id])chats[id]={id,name:nm||id,uid:id,messages:[]};
    saveChats();m.close();renderChats();openThread(id);
  };
  $('#fAdd',m).onclick=()=>openF($('#fUid',m).value,'');
  m.onclick=e=>{
    const sp=e.target.closest('[data-fspec]');if(sp){m.close();if(typeof spectateUserMatch==='function')spectateUserMatch(sp.dataset.fspec);return}
    const ad=e.target.closest('[data-add]');if(ad){openF(ad.dataset.add,ad.dataset.nm);return}
    const pr=e.target.closest('[data-prof]');if(pr){m.close();openPublicProfile(pr.dataset.prof)}
  };
};
