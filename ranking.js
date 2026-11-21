"use strict";
let rankRewards=ls.get('sg_rank_rewards',null)||[
  {id:'r1',rank:1,title:'No.1 Champion',rewardCoins:100,frameVal:'fx_top1',days:1,itemLabel:'1D No.1 Champion'},
  {id:'r2',rank:2,title:'No.2 Silver',rewardCoins:60,frameVal:'fx_top2',days:1,itemLabel:'1D No.2 Silver'},
  {id:'r3',rank:3,title:'No.3 Bronze',rewardCoins:30,frameVal:'fx_top3',days:1,itemLabel:'1D No.3 Bronze'}
];

const RW_DUR={1:'1D',2:'2D',7:'1W'};
function defaultRankFrame(rk){
  if(typeof FX_FRAMES!=='undefined'){
    const f=FX_FRAMES.find(x=>x.rank===rk);
    if(f)return f.id;
  }
  return rk===1?'top1_glow':(rk===2?'wings':'flame');
}
function rewardCardsHtml(){return `<div class="rw-row">${[...rankRewards].sort((a,b)=>a.rank-b.rank).map(r=>`<div class="rw-card r${r.rank}">${av({avatar:'🦊',frame:r.frameVal||defaultRankFrame(r.rank)},46)}<b>${esc(r.title||'TOP '+r.rank)}</b><small>#${r.rank} · +${fmtNum(r.rewardCoins)} 🪙 · ${esc(r.itemLabel||'1D')}</small></div>`).join('')}</div>`}
function claimRankReward(){
  if(!online||me.banned||devMode)return;
  const y=new Date(Date.now()-864e5).toISOString().slice(0,10);if(me.rankClaimDay===y)return;
  me.rankClaimDay=y;
  const pool=allUsers().filter(u=>!isDevAccount(u)).map(u=>({uid:u.uid,p:Number(((u.uid===uid?me:u).dailyCoinsByDay||{})[y]||0)})).filter(x=>x.p>0).sort((a,b)=>b.p-a.p);
  const pos=pool.findIndex(x=>x.uid===uid),r=pos>=0&&pos<3?rankRewards.find(x=>x.rank===pos+1):null;
  if(r){addReward(r.rewardCoins||0,0,null,true);const fv=r.frameVal||defaultRankFrame(pos+1);const k='frame:'+fv;me.tempUnlocks[k]=Math.max(Date.now(),Number(me.tempUnlocks[k]||0))+(r.days||1)*864e5;if(!me.frame||me.frame==='none')me.frame=fv;toast(`Yesterday's #${pos+1}! +${r.rewardCoins} 🪙 & ${r.itemLabel||'frame'}`)}
  saveMe();
}
function renderRanking(){
  const top3=rankableUsers().slice(0,3), podOrder=[top3[1],top3[0],top3[2]], podRanks=[2,1,3];
  $('#podiumSection').innerHTML=`<div class="podium-wrap"><div class="podium">${podOrder.map((u,i)=>{const rk=podRanks[i],disp=u||{uid:'',name:'—',avatar:'🦊',frame:defaultRankFrame(rk),todayPts:0};return `<div class="pod ${rk===1?'p1':''}" ${u?`data-prof="${esc(u.uid)}"`:''}><span class="rk-pill">TOP ${rk}</span><div>${av(disp,rk===1?60:46)}</div><b>${styledName(disp)}</b><div class="pts">🪙 ${fmtNum(disp.todayPts||0)}</div></div>`}).join('')}</div><div style="text-align:center;font-size:11px;color:var(--mu);margin-top:8px">Daily 0 reset · #1 gets No.1 Champion Frame (1D)</div></div>`;
  $('#podiumSection').insertAdjacentHTML('beforeend',rewardCardsHtml());
  $('#rankList').innerHTML=rankableUsers().slice(3,50).map((u,i)=>`<div class="row rk ${u.uid===uid?'me':''}" data-prof="${esc(u.uid)}"><div class="badge">#${i+4}</div>${av(u,44)}<div class="mid"><b>${styledName(u)}</b><small>LVL ${calcLevel(u.exp)} · ${esc(u.uid)}</small></div><div class="cn">🪙 ${fmtNum(u.todayPts||0)}</div></div>`).join('');
}
$('#podiumSection').onclick=e=>{const p=e.target.closest('[data-prof]');if(p&&p.dataset.prof)openPublicProfile(p.dataset.prof)};
$('#rankList').onclick=e=>{const c=e.target.closest('[data-prof]');if(c)openPublicProfile(c.dataset.prof)};

$('#addRewardBtn').onclick=()=>{
  const m=modal('Set Rank Reward',`<label>Rank (1-3)</label><input id="rrP" type="number" min="1" max="3" value="1"><label>Title</label><input id="rrT" maxlength="40" placeholder="No.1 Champion"><label>Coins</label><input id="rrC" type="number" value="100"><label>Frame reward</label><select id="rrF">${USER_FRAMES.filter(f=>f[0]!=='none').map(f=>`<option value="${esc(f[0])}">${esc(f[1])}</option>`).join('')}</select><label>Duration</label><select id="rrD"><option value="1">1 Day</option><option value="2">2 Days</option><option value="7">1 Week</option></select><button class="btn full" id="rrS">Save</button>`);
  $('#rrS',m).onclick=()=>{
    const rk=Math.min(3,Math.max(1,+$('#rrP',m).value||1)),days=+$('#rrD',m).value||1,fv=$('#rrF',m).value;
    const r={id:'r'+rk,rank:rk,title:$('#rrT',m).value.trim()||'TOP '+rk,rewardCoins:Math.max(0,+$('#rrC',m).value||0),frameVal:fv,days,itemLabel:RW_DUR[days]+' '+(USER_FRAMES.find(f=>f[0]===fv)||[0,fv])[1]};
    rankRewards=rankRewards.filter(x=>x.rank!==rk);rankRewards.push(r);ls.set('sg_rank_rewards',rankRewards);dbOp(()=>F.setDoc(F.doc(db,'rank_rewards',r.id),r));m.close();renderRanking();
  };
};
