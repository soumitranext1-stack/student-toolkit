"use strict";
/* Crisp SVG Icons for Games Hub */
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

function renderGameSlots(){
  const baseCards=HUB_GAMES.map((g,i)=>`<button type="button" class="card tool" data-hubgame="${i}"><div class="art">${GAME_SVG[g[1]]||GAME_SVG.custom}</div><b>${esc(g[0])}</b><small>${esc(g[2])}</small>${g[3]?'':'<span class="dur-pill" style="align-self:flex-start">Coming soon</span>'}</button>`).join('');

  const extraCards=(Array.isArray(customGameSlots)?customGameSlots:[]).map((sg,idx)=>`<div class="card tool" data-customgame="${idx}" style="position:relative"><div class="art">${GAME_SVG.custom}</div><b>${esc(sg.name||'Custom Game')}</b><small>${esc(sg.desc||'Play study mini-game')}</small>${devMode?`<button type="button" class="btn red sm" data-delgameslot="${idx}" style="margin-top:auto">Remove</button>`:''}</div>`).join('');

  const duelCard=`<button type="button" class="card tool" data-hubduel="1" style="border-color:var(--ac)"><div class="art">${GAME_SVG.duel}</div><b>60s MCQ Duel</b><small>Challenge a friend in chat</small></button>`;

  /* Strictly Developer Only: normal/guest users never see + New Game Slot */
  const devSlotCard=devMode?`<button type="button" class="card tool hub-slot" data-addgameslot="1"><div class="art">${GAME_SVG.plus}</div><b>+ New Game Slot</b><small>Developer: add a game link</small></button>`:'';

  $('#gameSlotsGrid').innerHTML=baseCards+extraCards+duelCard+devSlotCard;
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

const DUEL_GAMES=[
  {name:'Math Speed Duel',icon:'🧮',questions:[{q:'(24 ÷ 3) + (6 × 5) = ?',o:['34','38','42','30'],a:1},{q:'15% of 200 = ?',o:['25','30','35','40'],a:1},{q:'14 × 6 = ?',o:['74','84','94','64'],a:1},{q:'√144 = ?',o:['10','11','12','14'],a:2},{q:'7² + 3² = ?',o:['52','58','56','62'],a:1},{q:'1/2 + 1/4 = ?',o:['3/4','2/6','1/6','2/4'],a:0},{q:'9 × 8 = ?',o:['64','72','81','78'],a:1},{q:'250 ÷ 5 = ?',o:['40','45','50','55'],a:2}]},
  {name:'Science Quiz Duel',icon:'🔬',questions:[{q:'Powerhouse of the cell?',o:['Ribosome','Mitochondria','Nucleus','Golgi'],a:1},{q:'Symbol of Sodium?',o:['So','Na','Sd','K'],a:1},{q:'SI unit of force?',o:['Joule','Watt','Newton','Pascal'],a:2},{q:'Formula of water?',o:['H2O','CO2','O2','HO'],a:0},{q:'The Red Planet?',o:['Venus','Mars','Jupiter','Mercury'],a:1},{q:'Gas absorbed by plants?',o:['Oxygen','Nitrogen','Carbon dioxide','Helium'],a:2},{q:'Hardest natural substance?',o:['Gold','Iron','Diamond','Quartz'],a:2},{q:'Bones in an adult body?',o:['206','201','212','196'],a:0}]}
];
function seededShuffle(a,seed){let h=0;for(const c of String(seed))h=(h*31+c.charCodeAt(0))>>>0;const r=()=>{h=(h*1664525+1013904223)>>>0;return h/4294967296};const b=[...a];for(let i=b.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[b[i],b[j]]=[b[j],b[i]]}return b}

function settleDuel(m){
  if(m.type!=='duel'||m.settled||m.myScore==null||!me.done['bet_'+m.id])return;
  if(m.oppScore==null){
    if(Date.now()-(m.finishedAt||Date.now())>15*60000){m.settled=true;m.state='refund';if(!me.done['pay_'+m.id]){me.done['pay_'+m.id]=1;addReward(20,0,null,true)}}
    return;
  }
  m.settled=true;if(me.done['pay_'+m.id])return;me.done['pay_'+m.id]=1;
  if(m.myScore>m.oppScore){m.state='won';addReward(36,20)}
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
  msg.paid=true;me.done['bet_'+msg.id]=1;addReward(-20,0,null,true);saveChats();
  const g=DUEL_GAMES[msg.gi]||DUEL_GAMES[0],Q=seededShuffle(g.questions,msg.id);
  let qIdx=0,score=0,left=60,over=false,iv=0;
  const m=modal(`${esc(g.name)} (60s)`,`<div class="row" style="justify-content:space-between;margin-bottom:8px"><span class="dur-pill">⏱ <b id="dTimer">60s</b></span><span class="chip" id="dScore">Score: 0</span></div><div id="dBody"></div>`);
  const end=txt=>{
    if(over)return;over=true;clearInterval(iv);bumpStat('games_played');
    msg.myScore=score;msg.finishedAt=Date.now();
    const rid='r_'+msg.id+'_'+uid;
    dbOp(()=>F.setDoc(F.doc(db,'dm_messages',rid),{id:rid,type:'duel_result',ref:msg.id,from:uid,to:peer,score,ts:Date.now()}));
    settleDuel(msg);saveChats();if(cur)renderThread();
    const body=$('#dBody',m);if(body)body.innerHTML=`<div class="card"><b>${esc(txt)}</b><p style="color:var(--mu);margin-top:6px">Your score: ${score}. ${msg.oppScore==null?'Result shows in chat once your friend finishes.':'Final: '+score+' vs '+msg.oppScore}</p></div>`;
  };
  const step=()=>{
    if(over)return;if(qIdx>=Q.length)return end('All questions done');
    const item=Q[qIdx];
    $('#dBody',m).innerHTML=`<p style="margin-bottom:8px"><b>${esc(item.q)}</b></p>`+item.o.map((o,i)=>`<button class="opt" data-ans="${i}">${esc(o)}</button>`).join('');
    $$('[data-ans]',m).forEach(b=>b.onclick=()=>{if(over)return;score+=(+b.dataset.ans===item.a?4:-2);$('#dScore',m).textContent='Score: '+score;qIdx++;step()});
  };
  iv=setInterval(()=>{if(over)return clearInterval(iv);left--;if($('#dTimer',m))$('#dTimer',m).textContent=left+'s';if(left<=0)end('Time up')},1000);
  m.onclose=()=>{clearInterval(iv);end('Match ended')};
  step();
}
