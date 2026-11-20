"use strict";
let chats=ls.get('sg_chats_'+uid,{}),cur=null;
const saveChats=()=>ls.set('sg_chats_'+uid,chats);
function ensureDevChat(){if(!chats.developer){chats.developer={id:'developer',name:'Developer',uid:DEV_UID,dev:true,messages:[{id:'w1',from:'them',type:'text',text:'Welcome to Study Game!',ts:Date.now()}]};saveChats()}}
ensureDevChat();

function ingestRemoteDmDocs(dmDocs){
  const now=Date.now();let gotNewUnread=false;
  [...dmDocs].sort((a,b)=>(a.ts||0)-(b.ts||0)).forEach(docItem=>{
    const ts=Number(docItem.ts||now);
    if((now-ts)>=TWENTY_FOUR_HOURS_MS){dbOp(()=>F.deleteDoc(F.doc(db,'dm_messages',docItem.id)));return}   // cloud keeps 24h only; local history stays
    if(docItem.to!==uid&&docItem.from!==uid)return;
    const isMe=docItem.from===uid,peerId=isMe?docItem.to:docItem.from;
    if(!peerId||peerId===uid)return;
    if(!chats[peerId]){const po=users.find(u=>u.uid===peerId);chats[peerId]={id:peerId,name:po?.name||peerId,uid:peerId,messages:[]}}
    const th=chats[peerId];th.messages=th.messages||[];const type=docItem.type||'text';
    if(type==='duel_accept'||type==='duel_result'){
      const d=th.messages.find(x=>x.id===docItem.ref);if(!d)return;
      if(type==='duel_accept')d.accepted=true;
      else if(isMe){if(d.myScore==null)d.myScore=Number(docItem.score)}
      else if(d.oppScore==null)d.oppScore=Number(docItem.score);
      return;
    }
    if(!th.messages.some(m=>m.id===docItem.id)){
      const m={id:docItem.id,from:isMe?'me':'them',type:type==='duel'?'duel':'text',text:docItem.text||'',msgStyle:docItem.msgStyle||'',ts};
      if(m.type==='duel'){m.gi=Number(docItem.gi)||0;m.accepted=false}
      th.messages.push(m);th.messages.sort((a,b)=>(a.ts||0)-(b.ts||0));
      if(!isMe&&cur!==peerId){me.unreadFrom[peerId]=true;gotNewUnread=true}
    }
  });
  if(gotNewUnread)saveMe();
  sweepDuels();saveChats();updateUnreadDots();
  if(!cur)renderChats();else renderThread();
}
function updateUnreadDots(){
  const hasUnread=Object.values(me.unreadFrom||{}).some(Boolean);
  $('#chatNavDot').hidden=!hasUnread;
}
const mid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const hasBadWord=(txt)=>BAD_WORDS.some(w=>new RegExp(`\\b${w}\\b`,'i').test(txt));
function consecutiveOutgoingCount(msgs){let c=0;for(let i=msgs.length-1;i>=0;i--){if(msgs[i].from==='me')c++;else break}return c}

function renderChats(){
  updateUnreadDots();
  const worldHtml=`<div class="world-card" data-th="world"><div class="av-wrap" style="--s:46px"><div class="av"><span>🌍</span></div></div><div class="mid"><b>World Chat</b><small>${worldMsgs.length}/100 msgs · No duels</small></div></div>`;
  const devHtml=`<div class="dev" data-th="developer">${av({uid:DEV_UID,avatar:DEV_AVATAR,frame:'dev'},46)}<div class="mid"><b>Developer</b><div class="tags"><span class="tg d">DEV</span><span class="tg l">LVL 99</span></div></div></div>`;

  if(devMode){
    $('#chatList').innerHTML=worldHtml+devHtml+Object.values(devInbox).filter(x=>x&&x.uid).map(th=>{
      const dot=(me.unreadFrom&&me.unreadFrom[th.uid])?'<span class="red-dot"></span>':'';
      return `<div class="th" data-th="inbox:${esc(th.uid)}">${av(th,40)}<div class="mid"><b>${esc(th.name||th.uid)}</b><small>${esc(th.uid)}</small></div>${dot}</div>`;
    }).join('');
    return;
  }

  const fList=Object.values(chats).filter(t=>!t.dev&&isFriend(t.uid||t.id));
  $('#chatList').innerHTML=worldHtml+devHtml+(fList.map(t=>{
    const peerUid=t.uid||t.id;
    const dot=(me.unreadFrom&&me.unreadFrom[peerUid])?'<span class="red-dot"></span>':'';
    return `<div class="th" data-th="${esc(t.id)}">${av(users.find(u=>u.uid===peerUid)||{avatar:'🙂',frame:'none'},40)}<div class="mid"><b>${esc(t.name)}</b><small>${esc(peerUid)}</small></div>${dot}</div>`;
  }).join('')||'<div class="empty">No friend chats yet.</div>');
}
$('#clearDevInboxBtn').onclick=()=>{if(!devMode)return;Object.keys(devInbox).forEach(k=>dbOp(()=>F.deleteDoc(F.doc(db,'dev_inbox',k))));devInbox={};ls.set('sg_dev_inbox',devInbox);renderChats();toast('Inbox cleared')};
$('#chatList').onclick=e=>{const c=e.target.closest('[data-th]');if(c)openThread(c.dataset.th)};

function openThread(id){
  cur=id;
  const peerKey=id.startsWith('inbox:')?id.slice(6):id;
  if(me.unreadFrom&&me.unreadFrom[peerKey]){delete me.unreadFrom[peerKey];saveMe();updateUnreadDots()}
  $('#thread').hidden=false;renderThread();
}

function renderThread(){
  if(!cur)return;
  if(cur==='world'){
    $('#thHead').className='thh';$('#thHead').innerHTML=`<button class="x" id="thBack">←</button><div class="mid"><b>🌍 World Chat</b><small>${worldMsgs.length}/100 messages</small></div>`;
    $('#thBack').onclick=()=>{$('#thread').hidden=true;cur=null;renderChats()};$('#chBtn').hidden=true;
    $('#msgs').innerHTML=worldMsgs.map(m=>`<div class="m ${m.uid===uid?'out':'in'}"><small style="color:var(--mu);font-size:10px">${esc(m.name||'Player')}</small><div class="bub ${esc(m.msgStyle||'')}">${esc(m.text)}</div><time>${new Date(m.ts||Date.now()).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})}</time></div>`).join('');
    $('#msgs').scrollTop=$('#msgs').scrollHeight;return;
  }
  const isInbox=cur.startsWith('inbox:'), t=isInbox?devInbox[cur.slice(6)]:chats[cur];if(!t)return;
  $('#thHead').className='thh'+(t.dev?' dv':'');
  $('#thHead').innerHTML=`<button class="x" id="thBack">←</button><div class="mid"><b>${t.dev?'<span class="anim-firetxt">Developer</span>':esc(t.name)}</b><small>${esc(t.uid||'')}</small></div>${devMode&&isInbox?`<button class="btn red sm" id="clrSingle">Clear</button>`:''}`;
  $('#thBack').onclick=()=>{$('#thread').hidden=true;cur=null;renderChats()};
  if($('#clrSingle'))$('#clrSingle').onclick=()=>{const tid=cur.slice(6);delete devInbox[tid];ls.set('sg_dev_inbox',devInbox);dbOp(()=>F.deleteDoc(F.doc(db,'dev_inbox',tid)));$('#thread').hidden=true;cur=null;renderChats()};
  $('#chBtn').hidden=!!t.dev||isInbox;
  $('#msgs').innerHTML=(t.messages||[]).map(m=>{
    const out=isInbox?(m.from==='dev'):(m.from==='me');
    if(m.type==='duel'){
      const g=DUEL_GAMES[m.gi]||DUEL_GAMES[0],mine=m.from==='me',sm='style="color:var(--mu);font-size:12px"';
      let act;
      if(m.state==='won')act=`<b style="color:var(--ok)">✅ Won 36 🪙</b> <small>(${m.myScore}–${m.oppScore})</small>`;
      else if(m.state==='tie')act='<b>🤝 Tie · 20 🪙 refunded</b>';
      else if(m.state==='lost')act=`<b style="color:var(--red)">❌ Lost (${m.myScore}–${m.oppScore})</b>`;
      else if(m.state==='refund')act='<b>↩️ Friend timed out · 20 🪙 refunded</b>';
      else if(m.myScore!=null)act=`<span ${sm}>⏳ You scored ${m.myScore} · waiting for friend</span>`;
      else if(!m.accepted)act=mine?`<span ${sm}>Waiting for friend to accept…</span>`:`<button class="btn ok sm" data-acceptduel="${m.id}">Accept Challenge</button>`;
      else act=`<button class="btn sm" data-startduel="${m.id}">Start 60s Match (20 🪙)</button>`;
      return `<div class="m ${out?'out':'in'}"><div class="chal"><b>${g.icon} ${esc(g.name)}</b><p>Bet 20+20 = 40 🪙 · Winner <span class="rw">36 🪙</span> (4 🪙 fee) · +4 right / −2 wrong</p>${act}</div><time>${new Date(m.ts).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})}</time></div>`;
    }
    const cls=(t.dev&&(out||devMode)||isInbox)?' fire-border':(out&&me.msgStyle?' '+me.msgStyle:'');
    return `<div class="m ${out?'out':'in'}"><div class="bub${cls}">${esc(m.text)}</div><time>${new Date(m.ts).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})}</time></div>`;
  }).join('');
  $('#msgs').scrollTop=$('#msgs').scrollHeight;
}

$('#msgs').onclick=e=>{
  const t=chats[cur];if(!t)return;
  const acc=e.target.dataset.acceptduel;
  if(acc){
    const m=t.messages.find(x=>x.id===acc);if(!m||m.from==='me'||m.accepted)return;
    if(!online)return toast('Need a live connection to accept');
    m.accepted=true;saveChats();
    dbOp(()=>F.setDoc(F.doc(db,'dm_messages','a_'+m.id),{id:'a_'+m.id,type:'duel_accept',ref:m.id,from:uid,to:t.uid,ts:Date.now()}));
    renderThread();return toast('Accepted! Both players can start now');
  }
  const st=e.target.dataset.startduel;
  if(st){const m=t.messages.find(x=>x.id===st);if(m&&m.accepted)startTimedDuel(m,t.uid)}
};

function sendMsgText(){
  const inp=$('#msgIn'), text=inp.value.trim();if(!text)return;
  if(hasBadWord(text))return toast('Error: Bad language is not allowed');
  inp.value='';

  if(cur==='world'){
    const id=mid(), item={id,uid,name:me.name,text,msgStyle:me.msgStyle||'',ts:Date.now()};
    worldMsgs=[...worldMsgs,item].slice(-100);ls.set('sg_world_msgs',worldMsgs);dbOp(()=>F.setDoc(F.doc(db,'world_chat',id),item));renderThread();return;
  }

  if(cur&&cur.startsWith('inbox:')){
    const tid=cur.slice(6), entry=devInbox[tid];if(!entry)return;
    entry.messages=entry.messages||[];entry.messages.push({id:mid(),from:'dev',type:'text',text,ts:Date.now()});syncDevInboxToCloud(tid,entry);renderThread();return;
  }

  const t=chats[cur];if(!t)return;t.messages=t.messages||[];
  if(!t.dev&&consecutiveOutgoingCount(t.messages)>=3)return toast('3 messages sent without reply');

  const msgId=mid(), nowTs=Date.now();
  const mObj={id:msgId,from:'me',type:'text',text,ts:nowTs};
  t.messages.push(mObj);saveChats();renderThread();

  if(t.dev){
    const entry=devInbox[uid]||{uid,name:me.name,avatar:me.avatar,frame:me.frame,messages:[]};
    entry.name=me.name;entry.avatar=me.avatar;entry.frame=me.frame;
    entry.messages.push({...mObj,from:'user'});
    devInbox[uid]=entry;syncDevInboxToCloud(uid,entry);
  }else if(t.uid){
    dbOp(()=>F.setDoc(F.doc(db,'dm_messages',msgId),{id:msgId,from:uid,to:t.uid,text,msgStyle:me.msgStyle||'',ts:nowTs}));
  }
}
$('#sendBtn').onclick=sendMsgText;$('#msgIn').onkeydown=e=>{if(e.key==='Enter')sendMsgText()};
$('#chBtn').onclick=()=>{
  if(cur==='world'||!cur||cur.startsWith('inbox:'))return toast('Duel only in friend chat');
  if(!online)return toast('Duels need a live connection');
  const t=chats[cur];if(!t||t.dev)return;
  const m=modal('Send 60s MCQ Duel',DUEL_GAMES.map((g,i)=>`<button class="btn ghost full" data-d="${i}">${g.icon} ${esc(g.name)} (20 🪙)</button>`).join(''));
  m.onclick=e=>{const d=e.target.dataset.d;if(d===undefined)return;t.messages=t.messages||[];if(consecutiveOutgoingCount(t.messages)>=3)return toast('3 messages sent without reply');const id=mid(),ts=Date.now();t.messages.push({id,from:'me',type:'duel',gi:+d,accepted:false,ts});saveChats();dbOp(()=>F.setDoc(F.doc(db,'dm_messages',id),{id,type:'duel',gi:+d,from:uid,to:t.uid,ts}));m.close();renderThread()};
};

$('#findBtn').onclick=()=>{
  const others=allUsers().filter(u=>u.uid!==uid&&!isDevAccount(u));
  const m=modal('Add Friend',`
    <label>Friend UID</label><input id="fUid" placeholder="Enter UID" autocomplete="off"><button class="btn full" id="fAdd">Add &amp; Chat</button>
    <div class="list" style="margin-top:12px">${others.map(u=>`<div class="th" data-prof="${esc(u.uid)}">${av(u,38)}<div class="mid"><b>${styledName(u)}</b><small>${esc(u.uid)}</small></div><button class="btn sm" data-add="${esc(u.uid)}" data-nm="${esc(u.name)}">${isFriend(u.uid)?'Chat':'Add'}</button></div>`).join('')||'<div class="empty">No other players yet.</div>'}
  `);
  const openF=(id,nm)=>{id=id.trim().toUpperCase();if(!id||id===uid)return;if(!isFriend(id)){me.friends.push(id);saveMe()}if(!chats[id])chats[id]={id,name:nm||id,uid:id,messages:[]};saveChats();m.close();renderChats();openThread(id)};
  $('#fAdd',m).onclick=()=>openF($('#fUid',m).value,'');
  m.onclick=e=>{
    const ad=e.target.closest('[data-add]');if(ad){openF(ad.dataset.add,ad.dataset.nm);return}
    const pr=e.target.closest('[data-prof]');if(pr){m.close();openPublicProfile(pr.dataset.prof)}
  };
};
