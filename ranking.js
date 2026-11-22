"use strict";

function buildDefaultRankRewards(){
  const a=typeof LB_EXCLUSIVE_ASSETS!=='undefined'?LB_EXCLUSIVE_ASSETS:null;
  return [
    {
      id:'r1',rank:1,
      title:a?a[1].title:'Top #1 Sovereign Champion',
      rewardCoins:100,
      frameVal:a?a[1].frame:'fx_top1',
      bannerVal:a?a[1].banner:'bn-lb-top1',
      avatarVal:a?a[1].avatar:'lb_av_top1',
      badgeKey:'lb_top1',
      badgeLabel:a?a[1].badge:'TOP #1 CHAMPION',
      days:1,
      itemLabel:'1D Sovereign Frame + Banner + Crest + Badge'
    },
    {
      id:'r2',rank:2,
      title:a?a[2].title:'Top #2 Celestial Elite',
      rewardCoins:60,
      frameVal:a?a[2].frame:'fx_top2',
      bannerVal:a?a[2].banner:'bn-lb-top2',
      avatarVal:a?a[2].avatar:'lb_av_top2',
      badgeKey:'lb_top2',
      badgeLabel:a?a[2].badge:'TOP #2 ELITE',
      days:1,
      itemLabel:'1D Celestial Frame + Banner + Crest + Badge'
    },
    {
      id:'r3',rank:3,
      title:a?a[3].title:'Top #3 Ember Master',
      rewardCoins:30,
      frameVal:a?a[3].frame:'fx_top3',
      bannerVal:a?a[3].banner:'bn-lb-top3',
      avatarVal:a?a[3].avatar:'lb_av_top3',
      badgeKey:'lb_top3',
      badgeLabel:a?a[3].badge:'TOP #3 MASTER',
      days:1,
      itemLabel:'1D Ember Frame + Banner + Crest + Badge'
    }
  ];
}

let rankRewards=ls.get('sg_rank_rewards',null);
if(!Array.isArray(rankRewards)||rankRewards.length<3){
  rankRewards=buildDefaultRankRewards();
}

const RW_DUR={1:'1D',2:'2D',7:'1W'};

function defaultRankAsset(rk){
  if(typeof LB_EXCLUSIVE_ASSETS!=='undefined'&&LB_EXCLUSIVE_ASSETS[rk]){
    return LB_EXCLUSIVE_ASSETS[rk];
  }
  return {
    frame:rk===1?'fx_top1':(rk===2?'fx_top2':'fx_top3'),
    banner:rk===1?'bn-lb-top1':(rk===2?'bn-lb-top2':'bn-lb-top3'),
    avatar:rk===1?'lb_av_top1':(rk===2?'lb_av_top2':'lb_av_top3'),
    badge:rk===1?'TOP #1 CHAMPION':(rk===2?'TOP #2 ELITE':'TOP #3 MASTER'),
    badgeClass:'lb-badge-'+rk
  };
}

function rewardCardsHtml(){
  return `<div class="rw-row">${[...rankRewards].sort((a,b)=>a.rank-b.rank).map(r=>{
    const def=defaultRankAsset(r.rank);
    const fr=r.frameVal||def.frame;
    const bn=r.bannerVal||def.banner;
    const avId=r.avatarVal||def.avatar;
    const bdText=r.badgeLabel||def.badge;
    return `<div class="rw-card r${r.rank}">
      <div class="rw-mini-bn bn-box ${esc(bn)}" style="padding:0"></div>
      ${av({avatar:avId,frame:fr},50)}
      <span class="lb-badge ${esc(def.badgeClass)}">${esc(bdText)}</span>
      <b>${esc(r.title||'TOP '+r.rank)}</b>
      <small>#${r.rank} · +${fmtNum(r.rewardCoins)} coins · ${esc(RW_DUR[r.days||1]||'1D')} Exclusive Set</small>
    </div>`;
  }).join('')}</div>`;
}

function claimRankReward(){
  if(!online||me.banned||devMode)return;
  const y=new Date(Date.now()-864e5).toISOString().slice(0,10);
  if(me.rankClaimDay===y||inFlightOps.has('rank_'+y))return;
  inFlightOps.add('rank_'+y);
  me.rankClaimDay=y;
  try{
    const pool=allUsers().filter(u=>!isDevAccount(u)).map(u=>({uid:u.uid,p:clampSafeInt(((u.uid===uid?me:u).dailyCoinsByDay||{})[y]||0,0,MAX_DAILY_PTS)})).filter(x=>x.p>0).sort((a,b)=>b.p-a.p);
    const pos=pool.findIndex(x=>x.uid===uid);
    const rk=pos+1;
    const r=pos>=0&&pos<3?(rankRewards.find(x=>x.rank===rk)||buildDefaultRankRewards()[pos]):null;
    if(r){
      const def=defaultRankAsset(rk);
      const durMs=Math.max(1,Number(r.days||1))*864e5;
      const until=Date.now()+durMs;
      const fv=r.frameVal||def.frame;
      const bv=r.bannerVal||def.banner;
      const avv=r.avatarVal||def.avatar;
      const bdg='lb_top'+rk;

      me.tempUnlocks['frame:'+fv]=Math.max(Number(me.tempUnlocks['frame:'+fv]||0),until);
      me.tempUnlocks['banner:'+bv]=Math.max(Number(me.tempUnlocks['banner:'+bv]||0),until);
      me.tempUnlocks['avatar:'+avv]=Math.max(Number(me.tempUnlocks['avatar:'+avv]||0),until);
      me.tempUnlocks['badge:'+bdg]=Math.max(Number(me.tempUnlocks['badge:'+bdg]||0),until);

      if(!me.frame||me.frame==='none')me.frame=fv;
      addReward(clampCoins(r.rewardCoins||0),0,null,true,{skipLevelUp:false});
      toast(`Yesterday's #${rk}! +${fmtNum(r.rewardCoins)} coins & Exclusive Top #${rk} Set!`);
    }
    saveMe();
  }finally{
    inFlightOps.delete('rank_'+y);
  }
}

function renderRanking(){
  const top3=rankableUsers().slice(0,3), podOrder=[top3[1],top3[0],top3[2]], podRanks=[2,1,3];
  $('#podiumSection').innerHTML=`<div class="podium-wrap"><div class="podium">${podOrder.map((u,i)=>{
    const rk=podRanks[i];
    const def=defaultRankAsset(rk);
    const disp=u||{uid:'',name:'—',avatar:def.avatar,frame:def.frame,todayPts:0};
    return `<div class="pod ${rk===1?'p1':''}" ${u?`data-prof="${esc(u.uid)}"`:''}>
      <span class="lb-badge ${esc(def.badgeClass)}">TOP ${rk}</span>
      <div>${av(disp,rk===1?62:48)}</div>
      <b>${styledName(disp)}</b>
      <div class="pts">${UI_SVG.coin} ${fmtNum(disp.todayPts||0)}</div>
    </div>`;
  }).join('')}</div><div style="text-align:center;font-size:11px;color:var(--mu);margin-top:8px">Daily 00:00 UTC reset · Top 1–3 earn exclusive Leaderboard Banners, Frames, Crests &amp; Badges</div></div>`;
  $('#podiumSection').insertAdjacentHTML('beforeend',rewardCardsHtml());
  $('#rankList').innerHTML=rankableUsers().slice(3,50).map((u,i)=>{
    const rb=getActiveRankBadge(u);
    return `<div class="row rk ${u.uid===uid?'me':''}" data-prof="${esc(u.uid)}"><div class="badge">#${i+4}</div>${av(u,44)}<div class="mid"><b>${styledName(u)} ${rb?`<span class="lb-badge ${esc(rb.badgeClass)}" style="font-size:9px;padding:1px 6px">${esc(rb.badge)}</span>`:''}</b><small>LVL ${fmtNum(calcLevel(u.exp),MAX_LEVEL)} · ${esc(u.uid)}</small></div><div class="cn">${UI_SVG.coin} ${fmtNum(u.todayPts||0)}</div></div>`;
  }).join('')||'<div class="empty">Earn coins in Study Tasks &amp; Games to climb the Daily Leaderboard!</div>';
}

$('#podiumSection').onclick=e=>{const p=e.target.closest('[data-prof]');if(p&&p.dataset.prof)openPublicProfile(p.dataset.prof)};
$('#rankList').onclick=e=>{const c=e.target.closest('[data-prof]');if(c)openPublicProfile(c.dataset.prof)};

/* Developer-only: Add/Edit Rank Reward */
$('#addRewardBtn').onclick=()=>{
  if(!devMode)return toast('Developer only');
  const frameChoices=[
    ['fx_top1','Top #1 Sovereign Ring (Exclusive)'],
    ['fx_top2','Top #2 Celestial Ring (Exclusive)'],
    ['fx_top3','Top #3 Ember Ring (Exclusive)'],
    ...USER_FRAMES.filter(f=>f[0]!=='none'&&!['fx_top1','fx_top2','fx_top3'].includes(f[0]))
  ];
  const bannerChoices=[
    ['bn-lb-top1','Top #1 Sovereign Throne (Exclusive)'],
    ['bn-lb-top2','Top #2 Celestial Silver (Exclusive)'],
    ['bn-lb-top3','Top #3 Ember Bronze (Exclusive)'],
    ...BANNERS.filter(b=>!['bn-lb-top1','bn-lb-top2','bn-lb-top3'].includes(b[0]))
  ];
  const m=modal('Set Rank Reward (Developer)',`
    <label>Rank (1–3)</label><input id="rrP" type="number" min="1" max="3" value="1">
    <label>Reward Title</label><input id="rrT" maxlength="44" placeholder="Top #1 Sovereign Champion">
    <label>Coins</label><input id="rrC" type="number" min="0" max="100000" value="100">
    <label>Frame Reward</label><select id="rrF">${frameChoices.map(f=>`<option value="${esc(f[0])}">${esc(f[1])}</option>`).join('')}</select>
    <label>Banner Reward</label><select id="rrB">${bannerChoices.map(b=>`<option value="${esc(b[0])}">${esc(b[1])}</option>`).join('')}</select>
    <label>Duration</label><select id="rrD"><option value="1">1 Day</option><option value="2">2 Days</option><option value="7">1 Week</option></select>
    <button class="btn full" id="rrS">Save Reward</button>
  `);
  $('#rrS',m).onclick=()=>{
    if(!devMode)return;
    const rk=Math.min(3,Math.max(1,+$('#rrP',m).value||1));
    const days=+$('#rrD',m).value||1;
    const fv=$('#rrF',m).value;
    const bv=$('#rrB',m).value;
    const def=defaultRankAsset(rk);
    const r={
      id:'r'+rk,rank:rk,
      title:$('#rrT',m).value.trim()||def.title||'TOP '+rk,
      rewardCoins:clampSafeInt($('#rrC',m).value,0,100000),
      frameVal:fv,bannerVal:bv,avatarVal:def.avatar,
      badgeKey:'lb_top'+rk,badgeLabel:def.badge,days,
      itemLabel:(RW_DUR[days]||'1D')+' Exclusive Set'
    };
    rankRewards=rankRewards.filter(x=>x.rank!==rk);
    rankRewards.push(r);
    ls.set('sg_rank_rewards',rankRewards);
    dbOp(()=>F.setDoc(F.doc(db,'rank_rewards',r.id),r),()=>toast('Could not sync reward'));
    m.close();renderRanking();toast('Rank #'+rk+' reward updated');
  };
};

/* Developer-only: Reset to Default Rewards */
$('#resetRewardsBtn').onclick=()=>{
  if(!devMode)return toast('Developer only');
  const m=modal('Reset Leaderboard Rewards',`
    <p style="font-size:13px;color:var(--mu);line-height:1.45">Restore the default Top 1, Top 2, and Top 3 rewards (100 / 60 / 30 coins + Exclusive Top 1–3 Banners, Frames, Crests &amp; Badges)?</p>
    <button class="btn gold full" id="rrConfirmReset">${UI_SVG.reset} Restore Default Top 1–3 Rewards</button>
    <button class="btn ghost full" id="rrCancelReset">Cancel</button>
  `);
  $('#rrCancelReset',m).onclick=()=>m.close();
  $('#rrConfirmReset',m).onclick=()=>{
    if(!devMode)return;
    const defaults=buildDefaultRankRewards();
    rankRewards=defaults;
    ls.set('sg_rank_rewards',rankRewards);
    defaults.forEach(r=>dbOp(()=>F.setDoc(F.doc(db,'rank_rewards',r.id),r)));
    m.close();renderRanking();toast('Default Top 1–3 rewards restored!');
  };
};
