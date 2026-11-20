"use strict";
/* Clean Game Names & Icons */
const HUB_GAMES=[   // 4th value = game file (e.g. 'chess-blitz.html'); empty = "Coming soon"
  ['Chess Blitz','♟️','Smart board strategy',''],
  ['Speed Math','⚡','Fast mental calculation',''],
  ['Brain Puzzle','🧩','Logic & pattern solving',''],
  ['Word Duel','🔤','Vocabulary showdown',''],
  ['Trivia Rush','🎓','Rapid study quiz','']
];
function renderGameSlots(){
  $('#gameSlotsGrid').innerHTML=HUB_GAMES.map((g,i)=>`<div class="card tool" data-hubgame="${i}"><div class="art">${g[1]}</div><b>${esc(g[0])}</b><small>${esc(g[2])}</small>${g[3]?'':'<span class="dur-pill" style="align-self:flex-start">Coming soon</span>'}</div>`).join('')
   +`<div class="card tool" data-hubduel="1" style="border-color:var(--ac)"><div class="art">🎯</div><b>60s MCQ Duel</b><small>Challenge a friend in chat</small></div><div class="card tool hub-slot"><div class="art">＋</div><b>New game slot</b><small>Add a file to HUB_GAMES</small></div>`;
}
$('#gameSlotsGrid').onclick=e=>{
  if(e.target.closest('[data-hubduel]')){showTab('chat');return toast('Open a friend chat & tap 🎯')}
  const c=e.target.closest('[data-hubgame]');if(!c)return;const g=HUB_GAMES[+c.dataset.hubgame];
  if(g[3])openPage(g[3],'games');else toast(g[0]+' — coming soon');
};

const DUEL_GAMES=[
  {name:'Math Speed Duel',icon:'🧮',questions:[{q:'(24 ÷ 3) + (6 × 5) = ?',o:['34','38','42','30'],a:1},{q:'15% of 200 = ?',o:['25','30','35','40'],a:1},{q:'14 × 6 = ?',o:['74','84','94','64'],a:1},{q:'√144 = ?',o:['10','11','12','14'],a:2},{q:'7² + 3² = ?',o:['52','58','56','62'],a:1},{q:'1/2 + 1/4 = ?',o:['3/4','2/6','1/6','2/4'],a:0},{q:'9 × 8 = ?',o:['64','72','81','78'],a:1},{q:'250 ÷ 5 = ?',o:['40','45','50','55'],a:2}]},
  {name:'Science Quiz Duel',icon:'🔬',questions:[{q:'Powerhouse of the cell?',o:['Ribosome','Mitochondria','Nucleus','Golgi'],a:1},{q:'Symbol of Sodium?',o:['So','Na','Sd','K'],a:1},{q:'SI unit of force?',o:['Joule','Watt','Newton','Pascal'],a:2},{q:'Formula of water?',o:['H2O','CO2','O2','HO'],a:0},{q:'The Red Planet?',o:['Venus','Mars','Jupiter','Mercury'],a:1},{q:'Gas absorbed by plants?',o:['Oxygen','Nitrogen','Carbon dioxide','Helium'],a:2},{q:'Hardest natural substance?',o:['Gold','Iron','Diamond','Quartz'],a:2},{q:'Bones in an adult body?',o:['206','201','212','196'],a:0}]}
];
function seededShuffle(a,seed){let h=0;for(const c of String(seed))h=(h*31+c.charCodeAt(0))>>>0;const r=()=>{h=(h*1664525+1013904223)>>>0;return h/4294967296};const b=[...a];for(let i=b.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[b[i],b[j]]=[b[j],b[i]]}return b}
/* Settles once: win=36 (pot 40 - 4 fee), tie=refund 20, loss=0. Guarded by me.done so it can never pay twice. */
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
  if(!online)return toast('Duels need a live connection');
  if(!msg.accepted)return toast('Friend must Accept Challenge first');
  if(msg.paid||msg.myScore!=null||me.done['bet_'+msg.id])return toast('You already played this duel');
  if(me.coins<20)return toast('Need 20 coins');
  msg.paid=true;me.done['bet_'+msg.id]=1;addReward(-20,0,null,true);saveChats();     // bet taken exactly once
  const g=DUEL_GAMES[msg.gi]||DUEL_GAMES[0],Q=seededShuffle(g.questions,msg.id);
  let qIdx=0,score=0,left=60,over=false,iv=0;
  const m=modal(`${g.icon} ${esc(g.name)} (60s)`,`<div class="row" style="justify-content:space-between;margin-bottom:8px"><span class="dur-pill">⏱ <b id="dTimer">60s</b></span><span class="chip" id="dScore">Score: 0</span></div><div id="dBody"></div>`);
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

