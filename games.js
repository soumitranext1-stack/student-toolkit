"use strict";
/* Crisp SVG Icons for Games Hub & Live Multiplayer Arena */
const GAME_SVG={
  chess:`<svg viewBox="0 0 24 24" fill="none" stroke="#ffd36b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 21h8M9 17h6l-1-6 2-3-2-3-2 2-2-2-2 3 2 3-1 6z"/></svg>`,
  math:`<svg viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L4 14h7l-1 8 10-12h-7l0-8z"/></svg>`,
  puzzle:`<svg viewBox="0 0 24 24" fill="none" stroke="#a855f7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4a2 2 0 1 1 4 0v2h2v5h-2a2 2 0 1 0 0 4h2v5H4v-5h2a2 2 0 1 0 0-4H4V6h6V4a2 2 0 1 1 4 0z"/></svg>`,
  word:`<svg viewBox="0 0 24 24" fill="none" stroke="#2dd4bf" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="3"/><path d="M7 15l2.5-6L12 15M8 13h3M15 9v6M15 12h2.5"/></svg>`,
  trivia:`<svg viewBox="0 0 24 24" fill="none" stroke="#fb923c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10L12 5 2 10l10 5 10-5z"/><path d="M6 12v5c3 2 9 2 12 0v-5"/></svg>`,
  duel:`<svg viewBox="0 0 24 24" fill="none" stroke="#ff4d6a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="#ff4d6a"/></svg>`,
  plus:`<svg viewBox="0 0 24 24" fill="none" stroke="#ffd36b" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>`,
  custom:`<svg viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="18" height="12" rx="3"/><path d="M7 12h4M9 10v4M15.5 11h.01M17.5 13h.01"/></svg>`
};

const HUB_GAMES=[
  ['Chess Blitz','chess','Vs Robot (free) or Friend (coins)','chess-blitz.html'],
  ['Speed Math','math','Fast mental calculation','speedmath.html'],
  ['Brain Puzzle','puzzle','Logic & pattern solving','brain-puzzle.html'],
  ['Word Duel','word','Vocabulary showdown','word-duel.html'],
  ['Trivia Rush','trivia','Rapid study quiz','trivia-rush.html']
];

const DUEL_GAMES=[
  {
    id:'math',name:'Math Speed Sprint',icon:'math',
    questions:[
      {q:'(24 ÷ 3) + (6 × 5) = ?',o:['34','38','42','30'],a:1},
      {q:'15% of 200 = ?',o:['25','30','35','40'],a:1},
      {q:'14 × 6 = ?',o:['74','84','94','64'],a:1},
      {q:'√144 = ?',o:['10','11','12','14'],a:2},
      {q:'7² + 3² = ?',o:['52','58','56','62'],a:1},
      {q:'1/2 + 1/4 = ?',o:['3/4','2/6','1/6','2/4'],a:0},
      {q:'9 × 8 = ?',o:['64','72','81','78'],a:1},
      {q:'250 ÷ 5 = ?',o:['40','45','50','55'],a:2},
      {q:'18 × 5 = ?',o:['80','85','90','95'],a:2},
      {q:'3³ + 13 = ?',o:['36','40','42','39'],a:1}
    ]
  },
  {
    id:'science',name:'Science Quiz Arena',icon:'trivia',
    questions:[
      {q:'Powerhouse of the cell?',o:['Ribosome','Mitochondria','Nucleus','Golgi'],a:1},
      {q:'Chemical symbol of Sodium?',o:['So','Na','Sd','K'],a:1},
      {q:'SI unit of force?',o:['Joule','Watt','Newton','Pascal'],a:2},
      {q:'Formula of water?',o:['H2O','CO2','O2','HO'],a:0},
      {q:'Which planet is known as the Red Planet?',o:['Venus','Mars','Jupiter','Mercury'],a:1},
      {q:'Gas absorbed by plants during photosynthesis?',o:['Oxygen','Nitrogen','Carbon dioxide','Helium'],a:2},
      {q:'Hardest natural substance on Earth?',o:['Gold','Iron','Diamond','Quartz'],a:2},
      {q:'Total bones in an adult human body?',o:['206','201','212','196'],a:0},
      {q:'SI unit of electric current?',o:['Volt','Ohm','Ampere','Watt'],a:2},
      {q:'Chemical symbol of Gold?',o:['Ag','Au','Gd','Go'],a:1}
    ]
  },
  {
    id:'trivia',name:'Trivia Rush Live',icon:'trivia',
    questions:[
      {q:'Capital of Japan?',o:['Kyoto','Tokyo','Osaka','Seoul'],a:1},
      {q:'Largest ocean on Earth?',o:['Atlantic','Indian','Pacific','Arctic'],a:2},
      {q:'How many continents are there?',o:['5','6','7','8'],a:2},
      {q:'Longest river in India?',o:['Yamuna','Ganga','Godavari','Kaveri'],a:1},
      {q:'National flower of India?',o:['Rose','Marigold','Lotus','Jasmine'],a:2},
      {q:'Number of days in a leap year?',o:['364','365','366','367'],a:2},
      {q:'Olympics are held every how many years?',o:['2','3','4','5'],a:2},
      {q:'HTML stands for?',o:['HyperText Markup Language','HighText Machine Language','HyperTool Markup Language','Home Text Markup Language'],a:0}
    ]
  },
  {
    id:'word',name:'Word Power Clash',icon:'word',
    questions:[
      {q:'Synonym of "Swift"?',o:['Slow','Rapid','Heavy','Calm'],a:1},
      {q:'Antonym of "Abundant"?',o:['Plentiful','Rich','Scarce','Large'],a:2},
      {q:'Meaning of "Benevolent"?',o:['Kind & generous','Angry','Silent','Careless'],a:0},
      {q:'Synonym of "Diligent"?',o:['Lazy','Hardworking','Fragile','Noisy'],a:1},
      {q:'Antonym of "Opaque"?',o:['Dark','Transparent','Solid','Thick'],a:1},
      {q:'Meaning of "Concise"?',o:['Brief and clear','Very long','Confusing','Delayed'],a:0},
      {q:'Synonym of "Resilient"?',o:['Weak','Adaptable & strong','Timid','Rigid'],a:1},
      {q:'Antonym of "Expand"?',o:['Grow','Stretch','Contract','Build'],a:2}
    ]
  }
];

function seededShuffle(a,seed){
  let h=0;
  for(const c of String(seed))h=(h*31+c.charCodeAt(0))>>>0;
  const r=()=>{h=(h*1664525+1013904223)>>>0;return h/4294967296};
  const b=[...a];
  for(let i=b.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[b[i],b[j]]=[b[j],b[i]]}
  return b;
}

/* ===== Live Multiplayer Rooms State & Firestore Sync ===== */
let mpRooms=ls.get('sg_mp_rooms',[]);
if(!Array.isArray(mpRooms))mpRooms=[];
let activeRoomId=null;
let activeRoomModal=null;
let activeRoomPlayState=null;

function mpModeById(id){return DUEL_GAMES.find(g=>g.id===id)||DUEL_GAMES[0]}
function genRoomCode(){
  const chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out='SG-';
  for(let i=0;i<4;i++)out+=chars[Math.floor(Math.random()*chars.length)];
  return out;
}
function saveMpRoomsLocal(){ls.set('sg_mp_rooms',mpRooms.slice(0,30))}
function persistMpRoom(room){
  if(!room||!room.id)return;
  room.updatedAt=Date.now();
  const idx=mpRooms.findIndex(r=>r.id===room.id);
  if(idx>=0)mpRooms[idx]=room;
  else mpRooms=[room,...mpRooms].slice(0,30);
  saveMpRoomsLocal();
  dbOp(()=>F.setDoc(F.doc(db,'game_rooms',room.id),room,{merge:true}));
  renderMultiplayerRooms();
  refreshActiveRoomModal();
}

function ingestMultiplayerRooms(list){
  const now=Date.now();
  mpRooms=(Array.isArray(list)?list:[])
    .filter(r=>r&&r.id&&(now-Number(r.updatedAt||r.createdAt||now))<7200000)
    .sort((a,b)=>Number(b.updatedAt||0)-Number(a.updatedAt||0))
    .slice(0,30);
  saveMpRoomsLocal();
  renderMultiplayerRooms();
  refreshActiveRoomModal();
}

function appendMultiplayerRoomGift(roomId, evObj){
  const room=mpRooms.find(r=>r.id===roomId);
  if(!room||!evObj)return;
  room.chat=Array.isArray(room.chat)?room.chat:[];
  room.chat.push({
    id:'rg_'+evObj.id,
    type:'gift',
    uid:evObj.fromUid,
    name:evObj.fromName||'Player',
    toName:evObj.toName||'Player',
    giftId:evObj.giftId,
    giftName:evObj.giftName||'Gift',
    qty:evObj.qty||1,
    charm:evObj.charm||0,
    luckyCoins:evObj.luckyCoins||0,
    ts:Date.now()
  });
  room.chat=room.chat.slice(-30);
  persistMpRoom(room);
}

function settleRoomRewardForMe(room){
  if(!room||room.status!=='finished')return;
  const players=Object.values(room.players||{});
  if(!players.some(p=>p.uid===uid))return;
  const payKey='room_pay_'+room.id+'_'+Number(room.roundNo||1);
  if(me.done[payKey])return;
  me.done[payKey]=1;

  const topScore=Math.max(...players.map(p=>Number(p.score||0)));
  const winners=players.filter(p=>Number(p.score||0)===topScore).map(p=>p.uid);
  const iWon=winners.includes(uid);
  const isTie=winners.length>1;
  const stake=clampSafeInt(room.entryCoins||0,0,500);

  let rewardCoins=0, rewardExp=10;
  if(stake<=0){
    rewardCoins=iWon?(isTie?8:15):4;
    rewardExp=iWon?(isTie?15:25):10;
  }else{
    const pot=stake*players.length;
    const netPot=players.length>1?Math.max(stake,Math.floor(pot*0.9)):stake;
    rewardCoins=iWon?(isTie?stake:Math.floor(netPot/Math.max(1,winners.length))):0;
    rewardExp=iWon?(isTie?15:30):12;
  }
  bumpStat('games_played');
  addReward(rewardCoins,rewardExp,null,false,{silentSfx:true});
  if(typeof playSfx==='function')playSfx(iWon?'duelWin':'coin',{amount:rewardCoins});
  saveMe();
}

function renderMultiplayerRooms(){
  const host=$('#mpRoomsHost');
  if(!host)return;
  const openRooms=(mpRooms||[]).filter(r=>r&&r.id&&r.status!=='closed').slice(0,6);
  host.innerHTML=`
    <div class="card mp-hub-card">
      <div class="row" style="justify-content:space-between;gap:8px;flex-wrap:wrap">
        <div>
          <div class="mp-kicker">LIVE MULTIPLAYER ARENA</div>
          <b style="font-size:15px">Play With Friends · Live Chat &amp; Gifts</b>
        </div>
        <div class="row" style="gap:6px">
          <input id="mpCodeIn" maxlength="10" placeholder="SG-XXXX" aria-label="Room Code" style="width:106px;padding:7px 9px;font-size:12.5px;text-transform:uppercase;letter-spacing:.06em">
          <button type="button" class="btn sm ok" id="mpJoinCodeBtn">Join</button>
        </div>
      </div>
      <div class="mp-room-list">
        ${openRooms.length?openRooms.map(r=>{
          const pList=Object.values(r.players||{});
          const mode=mpModeById(r.mode);
          const inRoom=pList.some(p=>p.uid===uid);
          const statusLabel=r.status==='playing'?'In Match':(r.status==='finished'?'Finished':'Lobby');
          return `<div class="mp-room-row">
            <div class="mp-room-ico">${GAME_SVG[mode.icon]||GAME_SVG.duel}</div>
            <div class="mid">
              <b>${esc(mode.name)} <span class="mp-code-pill">${esc(r.code)}</span></b>
              <small>${esc(r.hostName||'Host')} · ${pList.length}/${clampSafeInt(r.maxPlayers||4,2,6)} players · ${r.entryCoins>0?`${fmtNum(r.entryCoins)} 🪙 Match`:'Free Friendly'} · ${statusLabel}</small>
            </div>
            <button type="button" class="btn sm ${inRoom?'gold':''}" data-joinroom="${esc(r.id)}">${inRoom?'Open':'Join'}</button>
          </div>`;
        }).join(''):`<div class="mp-empty">No active rooms right now. Tap <b>+ Live Room</b> to start a match and invite World Chat!</div>`}
      </div>
    </div>
  `;

  if($('#mpJoinCodeBtn'))$('#mpJoinCodeBtn').onclick=()=>{
    const code=($('#mpCodeIn')?.value||'').trim().toUpperCase();
    if(!code)return toast('Enter a room code (e.g. SG-4K9P)');
    joinMultiplayerRoomByCode(code);
  };
  host.onclick=e=>{
    const jb=e.target.closest('[data-joinroom]');
    if(jb&&jb.dataset.joinroom)joinMultiplayerRoom(jb.dataset.joinroom);
  };
}

function shareRoomToWorldChat(room){
  if(!room)return;
  const mode=mpModeById(room.mode);
  const id='rmw_'+Date.now().toString(36)+Math.random().toString(36).slice(2,5);
  const item={
    id,type:'text',uid,name:me.name,avatar:me.avatar,frame:me.frame,banner:me.banner,
    textStyle:me.textStyle||'',msgStyle:me.msgStyle||'',tags:me.tags||[],exp:me.exp||0,
    isDev:devMode,
    text:`🎮 Live ${mode.name} room open! (${room.entryCoins>0?room.entryCoins+' coins match':'Free Friendly'}) — Room Code: ${room.code}`,
    ts:Date.now()
  };
  worldMsgs=[...(worldMsgs||[]),item].slice(-150);
  ls.set('sg_world_msgs',worldMsgs);
  dbOp(()=>F.setDoc(F.doc(db,'world_chat',id),item));
  if(typeof playSfx==='function')playSfx('chatSend');
  toast('Room invite posted to World Chat!');
}

function openCreateRoomModal(){
  const m=modal('Create Live Multiplayer Room',`
    <label for="mpModeSel">Game Mode</label>
    <select id="mpModeSel">${DUEL_GAMES.map(g=>`<option value="${esc(g.id)}">${esc(g.name)}</option>`).join('')}</select>
    <label for="mpStakeSel">Entry Mode</label>
    <select id="mpStakeSel">
      <option value="0">Free Friendly (Winner +15 🪙 &amp; +25 EXP)</option>
      <option value="20">Coin Match — 20 🪙 stake (Winner takes 90% pot)</option>
      <option value="50">High Stakes — 50 🪙 stake (Winner takes 90% pot)</option>
    </select>
    <label for="mpMaxSel">Max Players</label>
    <select id="mpMaxSel"><option value="2">2 Players</option><option value="4" selected>4 Players</option><option value="6">6 Players</option></select>
    <label class="row" style="gap:8px;margin-top:10px;cursor:pointer"><input id="mpPostWorld" type="checkbox" checked style="width:auto"><span>Post join card to World Chat</span></label>
    <button type="button" class="btn full" id="mpCreateGo">Create &amp; Enter Room</button>
  `);
  $('#mpCreateGo',m).onclick=()=>{
    const mode=$('#mpModeSel',m).value||'math';
    const entryCoins=clampSafeInt($('#mpStakeSel',m).value,0,500);
    const maxPlayers=clampSafeInt($('#mpMaxSel',m).value,2,6);
    if(entryCoins>0&&me.coins<entryCoins)return toast(`Need ${entryCoins} coins to host this stake`);
    const postWorld=Boolean($('#mpPostWorld',m)?.checked);
    const now=Date.now();
    const code=genRoomCode();
    const roomId='room_'+now.toString(36)+Math.random().toString(36).slice(2,5);
    const room={
      id:roomId,
      code,
      mode,
      entryCoins,
      maxPlayers,
      hostUid:uid,
      hostName:me.name||'Player',
      status:'waiting',
      seed:code+'_'+now,
      roundNo:1,
      createdAt:now,
      updatedAt:now,
      players:{
        [uid]:{uid,name:me.name||'Player',avatar:me.avatar||'🦊',frame:me.frame||'none',score:0,qIdx:0,finished:false,paidStake:false,joinedAt:now}
      },
      chat:[{id:'sys_'+now,type:'sys',text:`${me.name||'Player'} created room ${code}`,ts:now}]
    };
    persistMpRoom(room);
    if(typeof playSfx==='function')playSfx('click');
    if(postWorld)shareRoomToWorldChat(room);
    m.close();
    openMultiplayerRoom(roomId);
  };
}

function joinMultiplayerRoomByCode(codeRaw){
  const clean=String(codeRaw||'').trim().toUpperCase();
  const room=mpRooms.find(r=>String(r.code||'').toUpperCase()===clean);
  if(!room)return toast('Room not found or expired: '+clean);
  joinMultiplayerRoom(room.id);
}

function joinMultiplayerRoom(roomId){
  const room=mpRooms.find(r=>r.id===roomId);
  if(!room)return toast('Room is no longer active');
  room.players=room.players||{};
  const count=Object.keys(room.players).length;
  if(!room.players[uid]){
    if(count>=clampSafeInt(room.maxPlayers||4,2,6))return toast('Room is full');
    if(room.entryCoins>0&&me.coins<room.entryCoins)return toast(`Need ${room.entryCoins} coins to join`);
    const now=Date.now();
    room.players[uid]={uid,name:me.name||'Player',avatar:me.avatar||'🦊',frame:me.frame||'none',score:0,qIdx:0,finished:false,paidStake:false,joinedAt:now};
    room.chat=[...(room.chat||[]),{id:'join_'+now,type:'sys',text:`${me.name||'Player'} joined the room`,ts:now}].slice(-30);
    persistMpRoom(room);
  }
  if(typeof playSfx==='function')playSfx('click');
  openMultiplayerRoom(room.id);
}

function openMultiplayerRoom(roomId){
  if(activeRoomModal){try{activeRoomModal.close()}catch{}}
  activeRoomId=roomId;
  activeRoomPlayState=null;

  const room=mpRooms.find(r=>r.id===roomId);
  if(!room)return toast('Room unavailable');
  const mode=mpModeById(room.mode);

  const m=modal(`${esc(mode.name)} · ${esc(room.code)}`,`<div id="mpRoomBody"></div>`,'mp-sheet');
  activeRoomModal=m;
  m.onclose=()=>{
    if(activeRoomPlayState&&activeRoomPlayState.timerId)clearInterval(activeRoomPlayState.timerId);
    activeRoomPlayState=null;
    activeRoomId=null;
    activeRoomModal=null;
  };
  refreshActiveRoomModal();
}

function startLocalRoomMatchRunner(room){
  if(!activeRoomModal||activeRoomId!==room.id)return;
  if(activeRoomPlayState&&activeRoomPlayState.roundNo===Number(room.roundNo||1))return;

  const meP=room.players&&room.players[uid];
  if(!meP||meP.finished)return;

  /* Deduct coin match stake once per round safely */
  const stake=clampSafeInt(room.entryCoins||0,0,500);
  const stakeKey='room_stake_'+room.id+'_'+Number(room.roundNo||1);
  if(stake>0&&!me.done[stakeKey]){
    if(me.coins<stake){
      toast(`Need ${stake} coins for this match`);
      return;
    }
    me.done[stakeKey]=1;
    addReward(-stake,0,null,true,{silentSfx:true});
    meP.paidStake=true;
    persistMpRoom(room);
  }

  const mode=mpModeById(room.mode);
  const questions=seededShuffle(mode.questions,room.seed||room.id).slice(0,6);
  activeRoomPlayState={
    roundNo:Number(room.roundNo||1),
    questions,
    qIdx:clampSafeInt(meP.qIdx||0,0,questions.length),
    score:Number(meP.score||0),
    left:45,
    over:false,
    timerId:0
  };

  const finishMyRun=()=>{
    if(!activeRoomPlayState||activeRoomPlayState.over)return;
    activeRoomPlayState.over=true;
    clearInterval(activeRoomPlayState.timerId);
    const liveRoom=mpRooms.find(r=>r.id===room.id)||room;
    if(liveRoom.players&&liveRoom.players[uid]){
      liveRoom.players[uid].score=activeRoomPlayState.score;
      liveRoom.players[uid].qIdx=questions.length;
      liveRoom.players[uid].finished=true;
    }
    const allDone=Object.values(liveRoom.players||{}).every(p=>p.finished);
    if(allDone)liveRoom.status='finished';
    persistMpRoom(liveRoom);
    if(liveRoom.status==='finished')settleRoomRewardForMe(liveRoom);
  };

  activeRoomPlayState.finishMyRun=finishMyRun;
  activeRoomPlayState.timerId=setInterval(()=>{
    if(!activeRoomPlayState||activeRoomPlayState.over)return;
    activeRoomPlayState.left--;
    const tEl=activeRoomModal?$('#mpTimerVal',activeRoomModal):null;
    if(tEl)tEl.textContent=activeRoomPlayState.left+'s';
    if(activeRoomPlayState.left<=0)finishMyRun();
  },1000);
}

function refreshActiveRoomModal(){
  if(!activeRoomModal||!activeRoomId)return;
  const room=mpRooms.find(r=>r.id===activeRoomId);
  const body=$('#mpRoomBody',activeRoomModal);
  if(!body)return;
  if(!room){
    body.innerHTML=`<div class="empty">This room was closed by the host.</div>`;
    return;
  }

  if(room.status==='playing')startLocalRoomMatchRunner(room);
  if(room.status==='finished'){
    if(activeRoomPlayState&&activeRoomPlayState.timerId)clearInterval(activeRoomPlayState.timerId);
    settleRoomRewardForMe(room);
  }

  const players=Object.values(room.players||{}).sort((a,b)=>Number(b.score||0)-Number(a.score||0));
  const isHost=room.hostUid===uid;
  const meP=room.players&&room.players[uid];

  const rosterHtml=`<div class="mp-roster">${players.map((p,idx)=>{
    const liveUser=allUsers().find(u=>u.uid===p.uid)||p;
    const isMe=p.uid===uid;
    const badge=room.status==='finished'&&idx===0?'🏆':(p.finished?'✓':(room.status==='playing'?'⚡':'Ready'));
    return `<div class="mp-player-row ${isMe?'me':''}">
      ${av(liveUser,34)}
      <div class="mid">
        <b>${esc(liveUser.name||p.name||'Player')}${p.uid===room.hostUid?' <span class="mp-host-tag">HOST</span>':''}</b>
        <small>Score: <b>${Number(p.score||0)}</b> · ${badge}</small>
      </div>
      ${!isMe?`<button type="button" class="btn gold sm rk-gift-btn" data-mpgift="${esc(p.uid)}" data-mpname="${esc(liveUser.name||p.name||'Player')}">Gift</button>`:''}
    </div>`;
  }).join('')}</div>`;

  let stageHtml='';
  if(room.status==='waiting'){
    stageHtml=`
      <div class="mp-stage">
        <div class="row" style="justify-content:space-between;flex-wrap:wrap;gap:6px">
          <span class="mp-code-pill">Code: ${esc(room.code)}</span>
          <span style="font-size:12px;color:var(--mu)">${room.entryCoins>0?`Stake: ${fmtNum(room.entryCoins)} 🪙`:'Free Friendly · +15 🪙 Winner'}</span>
        </div>
        <div class="row" style="margin-top:10px;flex-wrap:wrap">
          ${isHost?`<button type="button" class="btn ok" style="flex:1" id="mpStartBtn">Start Match (${players.length} ${players.length===1?'Solo/Open':'Players'})</button>`:`<span class="dur-pill" style="flex:1;text-align:center">Waiting for host to start…</span>`}
          <button type="button" class="btn ghost sm" id="mpShareWorldBtn">Share to World Chat</button>
          <button type="button" class="btn red sm" id="mpLeaveBtn">${isHost?'Close':'Leave'}</button>
        </div>
      </div>
    `;
  }else if(room.status==='playing'){
    const st=activeRoomPlayState;
    if(meP&&meP.finished){
      stageHtml=`<div class="mp-stage" style="text-align:center">
        <b>You finished with ${Number(meP.score||0)} pts!</b>
        <p style="font-size:12px;color:var(--mu);margin-top:4px">Waiting for other players to finish…</p>
        ${isHost?`<button type="button" class="btn sm ghost" id="mpForceEndBtn" style="margin-top:8px">Finish &amp; Settle Now</button>`:''}
      </div>`;
    }else if(st&&st.questions[st.qIdx]){
      const q=st.questions[st.qIdx];
      stageHtml=`<div class="mp-stage">
        <div class="row" style="justify-content:space-between;margin-bottom:8px">
          <span class="dur-pill">Q ${st.qIdx+1}/${st.questions.length}</span>
          <span class="dur-pill">⏱ <b id="mpTimerVal">${st.left}s</b></span>
          <span class="chip">Score: ${st.score}</span>
        </div>
        <p style="font-size:15px;font-weight:800;margin-bottom:10px">${esc(q.q)}</p>
        <div>${q.o.map((opt,i)=>`<button type="button" class="opt" data-mpans="${i}">${esc(opt)}</button>`).join('')}</div>
      </div>`;
    }
  }else if(room.status==='finished'){
    const top=players[0];
    stageHtml=`<div class="mp-stage mp-podium">
      <div style="font-size:12px;font-weight:800;color:var(--gold);text-transform:uppercase">Match Complete</div>
      <b style="font-size:17px">${top?`🏆 ${esc(top.name||'Winner')} leads with ${Number(top.score||0)} pts!`:'Match Finished'}</b>
      <div class="row" style="margin-top:10px;justify-content:center;flex-wrap:wrap">
        ${isHost?`<button type="button" class="btn ok sm" id="mpRematchBtn">Play Rematch</button>`:''}
        ${top&&top.uid!==uid?`<button type="button" class="btn gold sm" data-mpgift="${esc(top.uid)}" data-mpname="${esc(top.name||'Winner')}">Gift Winner</button>`:''}
        <button type="button" class="btn ghost sm" id="mpLeaveBtn">${isHost?'Close Room':'Leave'}</button>
      </div>
    </div>`;
  }

  /* Live Room Chat & Gift Feed (visible in Lobby & Finished states to prevent gameplay overlap) */
  const chatFeedHtml=room.status!=='playing'?`
    <div class="mp-chat-box">
      <div class="mp-chat-head">Room Chat &amp; Live Gifts</div>
      <div class="mp-chat-scroll" id="mpChatScroll">
        ${(room.chat||[]).map(c=>{
          if(c.type==='gift'){
            const g=typeof GIFT_BY_ID!=='undefined'?GIFT_BY_ID[c.giftId]:null;
            return `<div class="mp-gift-line">${g&&typeof giftSvg==='function'?giftSvg(g,26):'🎁'} <span><b>${esc(c.name)}</b> sent <b>${esc(c.giftName)} ×${clampSafeInt(c.qty||1,1,99)}</b> to <b>${esc(c.toName)}</b> (+${fmtNum(c.charm||0)} Charm · +${fmtNum(c.luckyCoins||0)} 🪙)</span></div>`;
          }
          if(c.type==='sys')return `<div class="mp-sys-line">${esc(c.text)}</div>`;
          return `<div class="mp-chat-line"><b>${esc(c.name||'Player')}:</b> <span>${esc(c.text)}</span></div>`;
        }).join('')||'<div class="mp-sys-line">Say hi or send a gift before starting!</div>'}
      </div>
      <div class="row" style="margin-top:8px">
        <input id="mpChatIn" maxlength="160" placeholder="Message room..." autocomplete="off" style="flex:1;padding:8px 10px;font-size:13px">
        <button type="button" class="btn sm" id="mpChatSend">Send</button>
      </div>
    </div>
  `:'';

  body.innerHTML=rosterHtml+stageHtml+chatFeedHtml;

  const sc=$('#mpChatScroll',body);
  if(sc)sc.scrollTop=sc.scrollHeight;

  /* Bind controls */
  body.onclick=e=>{
    const gb=e.target.closest('[data-mpgift]');
    if(gb&&typeof openGiftSendModal==='function'){
      openGiftSendModal(gb.dataset.mpgift,{inRoom:room.id,targetName:gb.dataset.mpname||'Player'});
      return;
    }
    const ans=e.target.closest('[data-mpans]');
    if(ans&&activeRoomPlayState&&!activeRoomPlayState.over){
      const q=activeRoomPlayState.questions[activeRoomPlayState.qIdx];
      const ok=Number(ans.dataset.mpans)===q.a;
      activeRoomPlayState.score+=ok?10:-2;
      activeRoomPlayState.qIdx++;
      if(typeof playSfx==='function')playSfx(ok?'duelCorrect':'duelWrong');
      const liveRoom=mpRooms.find(r=>r.id===room.id)||room;
      if(liveRoom.players&&liveRoom.players[uid]){
        liveRoom.players[uid].score=activeRoomPlayState.score;
        liveRoom.players[uid].qIdx=activeRoomPlayState.qIdx;
      }
      if(activeRoomPlayState.qIdx>=activeRoomPlayState.questions.length){
        activeRoomPlayState.finishMyRun();
      }else{
        persistMpRoom(liveRoom);
      }
    }
  };

  if($('#mpShareWorldBtn',body))$('#mpShareWorldBtn',body).onclick=()=>shareRoomToWorldChat(room);
  if($('#mpStartBtn',body))$('#mpStartBtn',body).onclick=()=>{
    const liveRoom=mpRooms.find(r=>r.id===room.id)||room;
    liveRoom.status='playing';
    liveRoom.startedAt=Date.now();
    Object.values(liveRoom.players||{}).forEach(p=>{p.score=0;p.qIdx=0;p.finished=false});
    if(typeof playSfx==='function')playSfx('click');
    persistMpRoom(liveRoom);
  };
  if($('#mpForceEndBtn',body))$('#mpForceEndBtn',body).onclick=()=>{
    const liveRoom=mpRooms.find(r=>r.id===room.id)||room;
    liveRoom.status='finished';
    persistMpRoom(liveRoom);
  };
  if($('#mpRematchBtn',body))$('#mpRematchBtn',body).onclick=()=>{
    const liveRoom=mpRooms.find(r=>r.id===room.id)||room;
    liveRoom.status='waiting';
    liveRoom.roundNo=Number(liveRoom.roundNo||1)+1;
    liveRoom.seed=liveRoom.code+'_'+Date.now();
    Object.values(liveRoom.players||{}).forEach(p=>{p.score=0;p.qIdx=0;p.finished=false});
    activeRoomPlayState=null;
    if(typeof playSfx==='function')playSfx('click');
    persistMpRoom(liveRoom);
  };
  if($('#mpLeaveBtn',body))$('#mpLeaveBtn',body).onclick=()=>{
    const liveRoom=mpRooms.find(r=>r.id===room.id);
    if(liveRoom){
      if(isHost){
        mpRooms=mpRooms.filter(r=>r.id!==room.id);
        saveMpRoomsLocal();
        dbOp(()=>F.deleteDoc(F.doc(db,'game_rooms',room.id)));
      }else if(liveRoom.players){
        delete liveRoom.players[uid];
        persistMpRoom(liveRoom);
      }
    }
    if(activeRoomModal)activeRoomModal.close();
    renderMultiplayerRooms();
  };

  const sendRoomChat=()=>{
    const inp=$('#mpChatIn',body);
    const txt=(inp?.value||'').trim();
    if(!txt)return;
    if(typeof hasBadWord==='function'&&hasBadWord(txt))return toast('Bad language is not allowed');
    inp.value='';
    const liveRoom=mpRooms.find(r=>r.id===room.id)||room;
    liveRoom.chat=[...(liveRoom.chat||[]),{id:'rc_'+Date.now().toString(36),type:'text',uid,name:me.name||'Player',text:txt,ts:Date.now()}].slice(-30);
    if(typeof playSfx==='function')playSfx('chatSend');
    persistMpRoom(liveRoom);
  };
  if($('#mpChatSend',body))$('#mpChatSend',body).onclick=sendRoomChat;
  if($('#mpChatIn',body))$('#mpChatIn',body).onkeydown=e=>{if(e.key==='Enter')sendRoomChat()};
}

function renderGameSlots(){
  if(typeof renderArenaPostersGrid==='function'){
    const ag=$('#arenaGamesGrid');
    if(ag)renderArenaPostersGrid(ag);
  }
  const baseCards=HUB_GAMES.map((g,i)=>`<button type="button" class="card tool" data-hubgame="${i}"><div class="art">${GAME_SVG[g[1]]||GAME_SVG.custom}</div><b>${esc(g[0])}</b><small>${esc(g[2])}</small>${g[3]?'':'<span class="dur-pill" style="align-self:flex-start">Coming soon</span>'}</button>`).join('');

  const extraCards=(Array.isArray(customGameSlots)?customGameSlots:[]).map((sg,idx)=>`<div class="card tool" data-customgame="${idx}" style="position:relative"><div class="art">${GAME_SVG.custom}</div><b>${esc(sg.name||'Custom Game')}</b><small>${esc(sg.desc||'Play study mini-game')}</small>${devMode?`<button type="button" class="btn red sm" data-delgameslot="${idx}" style="margin-top:auto">Remove</button>`:''}</div>`).join('');

  const duelCard=`<button type="button" class="card tool" data-hubduel="1" style="border-color:var(--ac)"><div class="art">${GAME_SVG.duel}</div><b>60s MCQ Duel</b><small>Challenge a friend in chat</small></button>`;

  /* Strictly Developer Only: normal/guest users never see + New Game Slot */
  const devSlotCard=devMode?`<button type="button" class="card tool hub-slot" data-addgameslot="1"><div class="art">${GAME_SVG.plus}</div><b>+ New Game Slot</b><small>Developer: add a game link</small></button>`:'';

  $('#gameSlotsGrid').innerHTML=baseCards+extraCards+duelCard+devSlotCard;
  renderMultiplayerRooms();
}

$('#gameSlotsGrid').onclick=e=>{
  const delSlot=e.target.closest('[data-delgameslot]');
  if(delSlot){
    e.stopPropagation();
    if(!devMode)return toast('Developer only');
    const idx=+delSlot.dataset.delgameslot;
    customGameSlots=customGameSlots.filter((_,i)=>i!==idx);
    ls.set('sg_game_slots',customGameSlots);
    dbOp(()=>F.setDoc(F.doc(db,'config','game_slots'),{slots:customGameSlots,ts:Date.now()}));
    renderGameSlots();toast('Game slot removed');return;
  }
  if(e.target.closest('[data-addgameslot]')){
    if(!devMode)return toast('Developer only');
    const m=modal('Add Game Slot',`
      <label>Game Title</label><input id="gsN" maxlength="40" placeholder="e.g. Science Sprint">
      <label>Short Description</label><input id="gsD" maxlength="80" placeholder="Quick practice challenge">
      <label>HTML File or URL</label><input id="gsH" maxlength="140" placeholder="science-sprint.html">
      <button class="btn full" id="gsSave">Add Slot</button>
    `);
    $('#gsSave',m).onclick=()=>{
      const name=$('#gsN',m).value.trim(), desc=$('#gsD',m).value.trim(), href=$('#gsH',m).value.trim();
      if(!name||!href)return toast('Enter game title and file/URL');
      customGameSlots=[...(customGameSlots||[]),{name,desc:desc||'Study mini-game',href}];
      ls.set('sg_game_slots',customGameSlots);
      dbOp(()=>F.setDoc(F.doc(db,'config','game_slots'),{slots:customGameSlots,ts:Date.now()}));
      m.close();renderGameSlots();toast('Game slot added');
    };
    return;
  }
  const cg=e.target.closest('[data-customgame]');
  if(cg){
    const item=customGameSlots[+cg.dataset.customgame];
    if(item&&item.href)openPage(item.href,'games');
    return;
  }
  if(e.target.closest('[data-hubduel]')){showTab('chat');return toast('Open a friend chat & tap Duel')}
  const c=e.target.closest('[data-hubgame]');if(!c)return;
  const g=HUB_GAMES[+c.dataset.hubgame];
  if(g&&g[3])openPage(g[3],'games');else if(g)toast(g[0]+' — coming soon');
};

if($('#mpCreateBtn'))$('#mpCreateBtn').onclick=openCreateRoomModal;
if($('#gamesGiftBtn'))$('#gamesGiftBtn').onclick=()=>{
  if(typeof openGiftSendModal==='function')openGiftSendModal(null,{allowPickPlayer:true});
};

/* ===== 60s Chat MCQ Duel (Fixed Settlement + Sound FX + In-Match Gifting) ===== */
function settleDuel(m){
  if(m.type!=='duel'||m.settled||m.myScore==null||!me.done['bet_'+m.id])return;
  if(m.oppScore==null){
    if(Date.now()-(m.finishedAt||Date.now())>15*60000){
      m.settled=true;m.state='refund';
      if(!me.done['pay_'+m.id]){me.done['pay_'+m.id]=1;addReward(20,0,null,true)}
    }
    return;
  }
  m.settled=true;if(me.done['pay_'+m.id])return;me.done['pay_'+m.id]=1;
  if(m.myScore>m.oppScore){
    m.state='won';
    addReward(36,20,null,false,{silentSfx:true});
    if(typeof playSfx==='function')playSfx('duelWin');
  }
  else if(m.myScore===m.oppScore){m.state='tie';addReward(20,8,null,true)}
  else m.state='lost';
}
function sweepDuels(){let ch=false;Object.values(chats).forEach(t=>(t.messages||[]).forEach(m=>{if(m.type==='duel'&&!m.settled&&m.myScore!=null){settleDuel(m);ch=true}}));if(ch){saveChats();if(cur)renderThread()}}
function startTimedDuel(msg,peer){
  if(needLogin('coin duels'))return;
  if(!online)return toast('Duels need a live connection');
  if(!msg.accepted)return toast('Friend must Accept Challenge first');
  if(msg.paid||msg.myScore!=null||me.done['bet_'+msg.id])return toast('You already played this duel');
  if(me.coins<20)return toast('Need 20 coins');
  msg.paid=true;me.done['bet_'+msg.id]=1;addReward(-20,0,null,true,{silentSfx:true});saveChats();
  const g=DUEL_GAMES[msg.gi]||DUEL_GAMES[0],Q=seededShuffle(g.questions,msg.id).slice(0,8);
  let qIdx=0,score=0,left=60,over=false,iv=0;
  const m=modal(`${esc(g.name)} (60s)`,`<div class="row" style="justify-content:space-between;margin-bottom:8px;flex-wrap:wrap"><span class="dur-pill">⏱ <b id="dTimer">60s</b></span><span class="chip" id="dScore">Score: 0</span><button type="button" class="btn gold sm" id="dGiftBtn">Gift Opponent</button></div><div id="dBody"></div>`);
  if($('#dGiftBtn',m))$('#dGiftBtn',m).onclick=()=>{if(typeof openGiftSendModal==='function')openGiftSendModal(peer,{inDm:true})};
  const end=txt=>{
    if(over)return;over=true;clearInterval(iv);bumpStat('games_played');
    msg.myScore=score;msg.finishedAt=Date.now();
    const rid='r_'+msg.id+'_'+uid;
    dbOp(()=>F.setDoc(F.doc(db,'dm_messages',rid),{id:rid,type:'duel_result',ref:msg.id,from:uid,to:peer,score,ts:Date.now()}));
    settleDuel(msg);saveChats();if(cur)renderThread();
    const body=$('#dBody',m);
    if(body)body.innerHTML=`<div class="card"><b>${esc(txt)}</b><p style="color:var(--mu);margin-top:6px">Your score: ${score}. ${msg.oppScore==null?'Result updates automatically in chat once your friend finishes.':'Final: '+score+' vs '+msg.oppScore}</p><button type="button" class="btn gold sm" style="margin-top:10px" id="dEndGift">Send Gift to Opponent</button></div>`;
    if($('#dEndGift',m))$('#dEndGift',m).onclick=()=>{if(typeof openGiftSendModal==='function')openGiftSendModal(peer,{inDm:true})};
  };
  const step=()=>{
    if(over)return;if(qIdx>=Q.length)return end('All questions done');
    const item=Q[qIdx];
    $('#dBody',m).innerHTML=`<p style="margin-bottom:8px"><b>${esc(item.q)}</b></p>`+item.o.map((o,i)=>`<button class="opt" data-ans="${i}">${esc(o)}</button>`).join('');
    $$('[data-ans]',m).forEach(b=>b.onclick=()=>{
      if(over)return;
      const ok=+b.dataset.ans===item.a;
      score+=(ok?4:-2);
      if(typeof playSfx==='function')playSfx(ok?'duelCorrect':'duelWrong');
      $('#dScore',m).textContent='Score: '+score;
      qIdx++;step();
    });
  };
  iv=setInterval(()=>{if(over)return clearInterval(iv);left--;if($('#dTimer',m))$('#dTimer',m).textContent=left+'s';if(left<=0)end('Time up')},1000);
  m.onclose=()=>{clearInterval(iv);if(!over)end('Match ended')};
  step();
}
