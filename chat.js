"use strict";
const linkify=h=>h.replace(/(https?:\/\/[^\s<]+)/g,'<a href="$1" target="_blank" rel="noopener noreferrer" style="color:inherit;text-decoration:underline;word-break:break-all">$1</a>');
let chats=ls.get('sg_chats_'+uid,{}),cur=null,dmHydrated=false;
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
      type:type==='duel'?'duel':(type==='red_packet'?'red_packet':(type==='gift'?'gift':'text')),
      text:docItem.text||'',
      msgStyle:docItem.msgStyle||'',
      ts
    };
    if(m.type==='duel'){m.gi=Number(docItem.gi)||0;m.accepted=false}
    if(m.type==='gift'){
      m.fromUid=docItem.from||'';
      m.toUid=docItem.to||'';
      m.giftId=docItem.giftId||'g01_rose';
      m.qty=clampSafeInt(docItem.qty||1,1,99);
      m.fromName=docItem.fromName||'Player';
      m.toName=docItem.toName||'Player';
      m.charm=clampSafeInt(docItem.charm||0,0,MAX_COINS);
      m.luckyCoins=clampSafeInt(docItem.luckyCoins||0,0,250000);
      m.luckLabel=docItem.luckLabel||'Lucky Drop';
    }
    if(m.type==='red_packet'){
      m.amount=clampSafeInt(docItem.amount,1,10000);
      m.maxClaims=clampSafeInt(docItem.maxClaims||1,1,50);
      m.claimedBy=Array.isArray(docItem.claimedBy)?docItem.claimedBy:[];
      m.claimedCount=Number(docItem.claimedCount||m.claimedBy.length);
      m.note=docItem.note||'Lucky Red Packet!';
      m.fromUid=docItem.from;
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
  const hasUnread=Object.values(me.unreadFrom||{}).some(Boolean);
  const dot=$('#chatNavDot');if(dot)dot.hidden=!hasUnread;
}
const mid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const hasBadWord=(txt)=>BAD_WORDS.some(w=>new RegExp(`\\b${w}\\b`,'i').test(txt));

function resolveWorldSender(m){
  const live=allUsers().find(u=>u.uid===m.uid);
  if(live){
    return {
      uid:live.uid,name:live.name||m.name||m.fromName||'Player',
      avatar:live.avatar||m.avatar||'🦊',frame:live.frame||m.frame||'none',
      banner:live.banner||m.banner||'bn-aurora',textStyle:live.textStyle||m.textStyle||'',
      msgStyle:m.msgStyle||live.msgStyle||'',
      tags:Array.isArray(live.tags)&&live.tags.length?live.tags:(m.tags||['Newbie']),
      exp:live.exp??m.exp??0,tempUnlocks:live.tempUnlocks||{},
      isDev:isDevAccount(live)||Boolean(m.isDev)
    };
  }
  return {
    uid:m.uid||m.fromUid||'',name:m.name||m.fromName||'Player',
    avatar:m.avatar||'🦊',frame:m.frame||'none',
    banner:m.banner||'bn-aurora',textStyle:m.textStyle||'',
    msgStyle:m.msgStyle||'',
    tags:Array.isArray(m.tags)&&m.tags.length?m.tags:(m.isDev?['Developer','LVL 99']:['Newbie']),
    exp:m.exp||0,tempUnlocks:{},isDev:Boolean(m.isDev)
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

  let btnText=`Claim +${fmtNum(m.amount)} 🪙`, disabled=false;
  if(alreadyMine){btnText='Claimed ✓';disabled=true}
  else if(exhausted){btnText='All Claimed';disabled=true}
  else if(wrongTarget){btnText='Recipient Only';disabled=true}
  else if(isSender && scope==='dm'){btnText='Sent Gift';disabled=true}

  return `<div class="rp-card ${alreadyMine||exhausted?'rp-done':''}">
    <div class="rp-top">
      <div class="rp-seal">🧧</div>
      <div class="rp-info">
        <b>Developer Red Packet · +${fmtNum(m.amount)} 🪙</b>
        <p>${esc(m.note||'Tap to claim your lucky coins!')}</p>
      </div>
    </div>
    <div class="rp-foot">
      <span>${claimedCount}/${maxClaims} claimed</span>
      <button type="button" class="rp-claim-btn" data-claimrp="${esc(m.id)}" data-rpscope="${esc(scope)}" ${disabled?'disabled':''}>${btnText}</button>
    </div>
  </div>`;
}

function renderChats(){
  updateUnreadDots();
  const realDev=allUsers().find(u=>isDevAccount(u))||{uid:DEV_UID,avatar:'🦊',frame:'none'};
  const worldHtml=`<div class="world-card" data-th="world"><div class="av-wrap" style="--s:46px"><div class="av">${UI_SVG.globe}</div></div><div class="mid"><b>World Chat</b><small>${worldMsgs.length} msgs · 7-day history · Show off your profile</small></div></div>`;
  const devHtml=`<div class="dev" data-th="developer"><button type="button" class="th-av-btn" data-chatprof="${esc(realDev.uid)}" title="View Developer Profile" aria-label="View Developer Profile">${av(realDev,46)}</button><div class="mid"><b>Developer</b><div class="tags"><span class="p-tag p-tag-dev-sig">Developer</span><span class="p-tag p-tag-lvl99-sig">LVL 99</span></div></div></div>`;

  const dmThreads=Object.values(chats).filter(t=>t&&!t.dev&&(t.uid||t.id)&&t.id!==uid).sort((a,b)=>{
    const at=(a.messages&&a.messages.length)?a.messages[a.messages.length-1].ts:0;
    const bt=(b.messages&&b.messages.length)?b.messages[b.messages.length-1].ts:0;
    return bt-at;
  });

  const dmHtml=dmThreads.map(t=>{
    const peerUid=t.uid||t.id;
    const peerUser=allUsers().find(u=>u.uid===peerUid)||{uid:peerUid,name:t.name||peerUid,avatar:'🦊',frame:'none'};
    const dot=(me.unreadFrom&&me.unreadFrom[peerUid])?'<span class="red-dot"></span>':'';
    const last=t.messages&&t.messages.length?t.messages[t.messages.length-1]:null;
    const preview=last?(last.type==='red_packet'?'🧧 Red Packet Coin Gift':(last.type==='gift'?'🎁 Sent a Gift':(last.type==='duel'?'🎯 60s MCQ Duel':last.text))):peerUid;
    return `<div class="th" data-th="${esc(t.id)}"><button type="button" class="th-av-btn" data-chatprof="${esc(peerUid)}" title="View Player Profile" aria-label="View ${esc(peerUser.name||'Player')} Profile">${av(peerUser,44)}</button><div class="mid"><b>${styledName(peerUser)}</b><small>${esc(preview)}</small></div>${dot}</div>`;
  }).join('');

  if(devMode){
    const inboxHtml=Object.values(devInbox).filter(x=>x&&x.uid&&x.uid!==uid).map(th=>{
      const dot=(me.unreadFrom&&me.unreadFrom[th.uid])?'<span class="red-dot"></span>':'';
      return `<div class="th" data-th="inbox:${esc(th.uid)}"><button type="button" class="th-av-btn" data-chatprof="${esc(th.uid)}" title="View Player Profile" aria-label="View ${esc(th.name||th.uid)} Profile">${av(th,42)}</button><div class="mid"><b>[Inbox] ${esc(th.name||th.uid)}</b><small>${esc(th.uid)}</small></div>${dot}</div>`;
    }).join('');
    $('#chatList').innerHTML=worldHtml+devHtml+dmHtml+inboxHtml;
    return;
  }

  $('#chatList').innerHTML=worldHtml+devHtml+(dmHtml||'<div class="empty">No player chats yet. Tap "Add friend" or tap any player in World Chat or Leaderboard to message!</div>');
}

$('#clearDevInboxBtn').onclick=()=>{
  if(!devMode)return toast('Developer only');
  Object.keys(devInbox).forEach(k=>dbOp(()=>F.deleteDoc(F.doc(db,'dev_inbox',k))));
  devInbox={};ls.set('sg_dev_inbox',devInbox);renderChats();toast('Inbox cleared');
};
$('#chatList').onclick=e=>{
  const cp=e.target.closest('[data-chatprof]');
  if(cp&&cp.dataset.chatprof){
    e.stopPropagation();
    openPublicProfile(cp.dataset.chatprof);
    return;
  }
  const c=e.target.closest('[data-th]');
  if(c)openThread(c.dataset.th);
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
  if(rpBtn)rpBtn.hidden=!devMode;

  if(cur==='world'){
    $('#thHead').className='thh';
    $('#thHead').innerHTML=`<button class="x" id="thBack" aria-label="Back">←</button><div class="mid"><b>World Chat</b><small>${worldMsgs.length} messages · Auto-cleans after 7 days</small></div>`;
    $('#thBack').onclick=()=>{$('#thread').hidden=true;cur=null;renderChats()};
    $('#chBtn').hidden=true;

    $('#msgs').innerHTML=(worldMsgs||[]).map(m=>{
      const s=resolveWorldSender(m);
      const isOut=m.uid===uid;
      const rb=getActiveRankBadge(s);
      const tagsHtml=`<div class="wc-tags">${rb?`<span class="lb-badge ${esc(rb.badgeClass)}">${esc(rb.badge)}</span>`:''}${(s.tags||[]).slice(0,3).map(tg=>`<span class="p-tag ${tagClassFor(tg)}">${esc(tg)}</span>`).join('')}</div>`;
      const roomMatch=typeof m.text==='string'?m.text.match(/Room Code:\s*(SG-[A-Z0-9]{4})/i):null;
      const bodyHtml=m.type==='red_packet'
        ? renderRedPacketCard(m,'world')
        : (m.type==='gift'&&typeof renderWorldGiftCard==='function'
            ? renderWorldGiftCard(m)
            : `<div class="bub ${esc(s.msgStyle||'')}">${linkify(esc(m.text))}${roomMatch?`<div style="margin-top:8px"><button type="button" class="btn sm ok" data-joinroomcode="${esc(roomMatch[1].toUpperCase())}">Join Live Room (${esc(roomMatch[1].toUpperCase())})</button></div>`:''}</div>`);

      return `<div class="m wc-m ${isOut?'out':'in'}">
        <div class="wc-card">
          <div class="wc-banner-bar ${esc(s.banner||'bn-aurora')}" data-wprof="${esc(s.uid)}">
            ${av(s,40)}
            <div class="wc-head-meta">
              <div class="wc-name-row"><b>${styledName(s)}</b><span class="wc-lvl">LVL ${fmtNum(calcLevel(s.exp),MAX_LEVEL)}</span></div>
              ${tagsHtml}
            </div>
          </div>
          <div class="wc-body">${bodyHtml}</div>
        </div>
        <time>${new Date(m.ts||Date.now()).toLocaleString([],{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})}</time>
      </div>`;
    }).join('')||'<div class="empty">Say hello in World Chat! Messages stay for 7 days.</div>';
    $('#msgs').scrollTop=$('#msgs').scrollHeight;
    return;
  }

  const isInbox=cur.startsWith('inbox:');
  const t=isInbox?devInbox[cur.slice(6)]:chats[cur];
  if(!t)return;
  const realDevUser=allUsers().find(u=>isDevAccount(u))||{uid:DEV_UID,name:'Developer',avatar:'🦊',frame:'none'};
  const peerUid=t.dev?realDevUser.uid:(t.uid||(isInbox?cur.slice(6):cur));
  const peerUser=t.dev?realDevUser:(allUsers().find(u=>u.uid===peerUid)||{uid:peerUid,name:t.name||peerUid,avatar:'🦊',frame:'none'});
  $('#thHead').className='thh'+(t.dev?' dv':'');
  $('#thHead').innerHTML=`<button class="x" id="thBack" aria-label="Back">←</button><button type="button" class="th-prof-trigger" data-headprof="${esc(peerUid)}" title="Tap to view player profile">${av(peerUser,36)}<div class="mid"><b>${t.dev?'<span class="anim-firetxt">Developer</span>':styledName(peerUser)}</b><small>Tap for profile · ${esc(t.uid||'7-day chat history')}</small></div></button>${devMode&&isInbox?`<button class="btn red sm" id="clrSingle">Clear</button>`:''}`;
  $('#thBack').onclick=()=>{$('#thread').hidden=true;cur=null;renderChats()};
  const headProfBtn=$('#thHead').querySelector('[data-headprof]');
  if(headProfBtn)headProfBtn.onclick=()=>openPublicProfile(headProfBtn.dataset.headprof);
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
    const styleCls=m.msgStyle||(out&&me.msgStyle?me.msgStyle:'');
    const cls=(t.dev&&(out||devMode)||isInbox)?' fire-border':(styleCls?' '+esc(styleCls):'');
    return `<div class="m ${out?'out':'in'}"><div class="bub${cls}">${linkify(esc(m.text))}</div><time>${new Date(m.ts).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})}</time></div>`;
  }).join('')||'<div class="empty">Start the conversation! Messages stay for 7 days.</div>';
  $('#msgs').scrollTop=$('#msgs').scrollHeight;
}

async function claimRedPacket(packetId, scope){
  if(!packetId)return;
  const lockKey='rp_claim_'+packetId;
  if(inFlightOps.has(lockKey))return;
  if(me.done['rp_'+packetId])return toast('You already claimed this Red Packet');

  let msg=null;
  if(scope==='world')msg=worldMsgs.find(x=>x.id===packetId);
  else if(scope==='inbox'&&cur&&cur.startsWith('inbox:'))msg=(devInbox[cur.slice(6)]?.messages||[]).find(x=>x.id===packetId);
  else if(chats[cur])msg=(chats[cur].messages||[]).find(x=>x.id===packetId);
  if(!msg||msg.type!=='red_packet')return toast('Red Packet unavailable');

  const claimedBy=Array.isArray(msg.claimedBy)?[...msg.claimedBy]:[];
  const maxClaims=Math.max(1,Number(msg.maxClaims||1));
  if(claimedBy.includes(uid))return toast('Already claimed');
  if(claimedBy.length>=maxClaims)return toast('Red Packet fully claimed');
  if(scope==='dm'&&msg.targetUid&&msg.targetUid!==uid)return toast('Reserved for chat recipient');

  inFlightOps.add(lockKey);
  try{
    if(online&&db&&F){
      const claimRef=F.doc(db,'red_packets',packetId,'claims',uid);
      const existingClaim=await F.getDoc(claimRef).catch(()=>null);
      if(existingClaim&&existingClaim.exists()){
        me.done['rp_'+packetId]=1;saveMe();renderThread();
        return toast('You already claimed this Red Packet');
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

    addReward(clampSafeInt(msg.amount,1,10000),0,null,true,{skipLevelUp:true,silentSfx:true});
    if(typeof playSfx==='function')playSfx('redPacketClaim');
    renderThread();
    toast(`🧧 Claimed +${fmtNum(msg.amount)} coins from Red Packet!`);
  }finally{
    setTimeout(()=>inFlightOps.delete(lockKey),600);
  }
}

/* Developer-only Red Packet Composer */
$('#rpBtn').onclick=()=>{
  if(!devMode)return toast('Developer only');
  if(!cur)return;
  const isWorld=cur==='world';
  const m=modal('Send Developer Red Packet 🧧',`
    <p style="font-size:12px;color:var(--mu)">Drop a coin gift into ${isWorld?'World Chat':'this private chat'}. Each player can claim once.</p>
    <label>Coins Per Claim (1–10,000)</label><input id="rpAmt" type="number" min="1" max="10000" value="50">
    ${isWorld?`<label>Max Players Who Can Claim (1–50)</label><input id="rpMax" type="number" min="1" max="50" value="10">`:''}
    <label>Gift Message</label><input id="rpNote" maxlength="90" value="Lucky coin drop from Developer! Study hard!">
    <button class="btn crimson full" id="rpSend">Send Red Packet 🧧</button>
  `);
  $('#rpSend',m).onclick=()=>{
    if(!devMode)return;
    const amount=clampSafeInt($('#rpAmt',m).value,1,10000);
    const maxClaims=isWorld?clampSafeInt($('#rpMax',m).value,1,50):1;
    const note=$('#rpNote',m).value.trim()||'Lucky Red Packet from Developer!';
    const id='rp_'+mid(), nowTs=Date.now();

    const rpRecord={id,fromUid:uid,amount,maxClaims,claimedBy:[],claimedCount:0,note,scope:isWorld?'world':'dm',ts:nowTs};
    dbOp(()=>F.setDoc(F.doc(db,'red_packets',id),rpRecord));

    if(isWorld){
      const item={
        id,type:'red_packet',uid,name:me.name,avatar:me.avatar,frame:me.frame,banner:me.banner,
        textStyle:me.textStyle,msgStyle:me.msgStyle,tags:me.tags,exp:me.exp,isDev:true,
        text:`🧧 Red Packet: +${amount} coins`,amount,maxClaims,claimedBy:[],claimedCount:0,note,ts:nowTs
      };
      worldMsgs=[...worldMsgs,item].slice(-150);
      ls.set('sg_world_msgs',worldMsgs);
      dbOp(()=>F.setDoc(F.doc(db,'world_chat',id),item));
    }else if(cur.startsWith('inbox:')){
      const tid=cur.slice(6), entry=devInbox[tid];
      if(!entry)return m.close();
      entry.messages=entry.messages||[];
      entry.messages.push({id,from:'dev',fromUid:uid,targetUid:tid,type:'red_packet',amount,maxClaims:1,claimedBy:[],claimedCount:0,note,ts:nowTs});
      syncDevInboxToCloud(tid,entry);
    }else{
      const t=chats[cur];if(!t)return m.close();
      t.messages=t.messages||[];
      const msgObj={id,from:'me',fromUid:uid,targetUid:t.uid||cur,type:'red_packet',amount,maxClaims:1,claimedBy:[],claimedCount:0,note,ts:nowTs};
      t.messages.push(msgObj);saveChats();
      if(t.uid&&!t.dev){
        dbOp(()=>F.setDoc(F.doc(db,'dm_messages',id),{id,from:uid,fromName:me.name,to:t.uid,type:'red_packet',amount,maxClaims:1,claimedBy:[],claimedCount:0,note,ts:nowTs}));
      }
    }
    m.close();renderThread();
    if(typeof playSfx==='function')playSfx('redPacketDrop');
    toast('Red Packet sent!');
  };
};

$('#msgs').onclick=e=>{
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
  const inp=$('#msgIn'), text=inp.value.trim();if(!text)return;
  if(hasBadWord(text))return toast('Error: Bad language is not allowed');
  const now=Date.now();
  while(sendTimestamps.length&&now-sendTimestamps[0]>6000)sendTimestamps.shift();
  if(sendTimestamps.length>=5)return toast('Slow down a bit before sending more messages');
  sendTimestamps.push(now);
  inp.value='';

  if(cur==='world'){
    const id=mid();
    const item={
      id,type:'text',uid,name:me.name,avatar:me.avatar,frame:me.frame,banner:me.banner,
      textStyle:me.textStyle||'',msgStyle:me.msgStyle||'',tags:me.tags||[],exp:me.exp||0,
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

$('#findBtn').onclick=()=>{
  const others=allUsers().filter(u=>u.uid!==uid);
  const m=modal('Message or Add Player',`
    <label>Search by Name or Player UID</label>
    <div class="row"><input id="fUid" placeholder="Enter Name or UID" autocomplete="off" style="flex:1"><button class="btn sm" id="fAdd">Chat</button></div>
    <div class="list" id="fResList" style="margin-top:12px"></div>
  `);
  const renderList=(q='')=>{
    const term=q.trim().toLowerCase();
    const filtered=others.filter(u=>!term||String(u.name||'').toLowerCase().includes(term)||String(u.uid||'').toLowerCase().includes(term)).slice(0,30);
    $('#fResList',m).innerHTML=filtered.map(u=>`<div class="th" data-prof="${esc(u.uid)}">${av(u,38)}<div class="mid"><b>${styledName(u)}</b><small>${esc(u.uid)}</small></div><button class="btn sm" data-add="${esc(u.uid)}" data-nm="${esc(u.name)}">Chat</button></div>`).join('')||'<div class="empty">No players matched.</div>';
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
    const ad=e.target.closest('[data-add]');if(ad){openF(ad.dataset.add,ad.dataset.nm);return}
    const pr=e.target.closest('[data-prof]');if(pr){m.close();openPublicProfile(pr.dataset.prof)}
  };
};
