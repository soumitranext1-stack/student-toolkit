"use strict";
/* ===== Upgraded Daily & Weekly Mission Center + 7-Day Streak Calendar + 100% Completion Chest ===== */

const STREAK_REWARDS = [
  { day: 1, coins: 30, exp: 15, label: '30 🪙' },
  { day: 2, coins: 50, exp: 20, label: '50 🪙' },
  { day: 3, coins: 80, exp: 30, label: '80 🪙' },
  { day: 4, coins: 120, exp: 40, label: '120 🪙' },
  { day: 5, coins: 180, exp: 50, label: '180 🪙' },
  { day: 6, coins: 250, exp: 60, label: '250 🪙' },
  { day: 7, coins: 500, exp: 120, ticket: 1, label: '500 🪙 + 🎡' }
];

const DAILY_MISSIONS = [
  { id: 'dm_play2', title: 'Arena Challenger', description: 'Play 2 Multiplayer or Arena matches today.', reward: 50, exp: 35, ruleCode: 'games_played:2', go: 'games' },
  { id: 'dm_party', title: 'Party Room Regular', description: 'Join a Party Room or hangout lounge.', reward: 40, exp: 25, ruleCode: 'party_join:1', go: 'party' },
  { id: 'dm_gift', title: 'Generous Vibe', description: 'Send a gift or live seat reaction.', reward: 45, exp: 30, ruleCode: 'gifts_or_react:1', go: 'gift' },
  { id: 'dm_duel', title: 'Rival Victory', description: 'Win 1 Rival Duel or Arena match.', reward: 60, exp: 40, ruleCode: 'duel_win:1', go: 'games' },
  { id: 'dm_watch', title: 'Cinema Night', description: 'Watch YouTube Together or react in a Party Room.', reward: 40, exp: 25, ruleCode: 'watch_together:1', go: 'party' },
  { id: 'dm_ad', title: 'Bonus Reward Ad', description: 'Watch a quick sponsor ad for extra coins & EXP.', reward: 35, exp: 20, ruleCode: 'ad_watch:1', go: 'ad' }
];

const WEEKLY_MISSIONS = [
  { id: 'wk_wins5', title: 'Weekly Arena MVP', description: 'Play 5 Arena / Multiplayer games this week.', reward: 220, exp: 120, ruleCode: 'games_played:5', go: 'games' },
  { id: 'wk_gifts5', title: 'Social Patron', description: 'Send 5 gifts or reactions this week.', reward: 200, exp: 100, ruleCode: 'gifts_or_react:5', go: 'gift' },
  { id: 'wk_spin3', title: 'Lucky Spinner', description: 'Spin the Lucky Wheel 3 times.', reward: 180, exp: 90, ruleCode: 'wheel_spin:3', go: 'wheel' },
  { id: 'wk_profile', title: 'Luxury Identity', description: 'Customize your Profile or equip a style.', reward: 120, exp: 60, ruleCode: 'profile_save:1', go: 'profile' }
];

let devTasks = ls.get('sg_dev_tasks', []);
let tasks = [...DAILY_MISSIONS, ...devTasks];
let activeTaskTab = 'daily';

function getWeekKey() {
  const now = new Date();
  const jan1 = new Date(Date.UTC(now.getUTCFullYear(), 0, 1));
  const wk = Math.ceil((((now - jan1) / 86400000) + jan1.getUTCDay() + 1) / 7);
  return `${now.getUTCFullYear()}-W${wk}`;
}

function getStatProgress(rc) {
  if (!rc) return { cur: 1, req: 1, met: true };
  const [k, v] = String(rc).split(':');
  const req = Math.max(1, Number(v || 1));
  let cur = Number(stats[k] || 0);
  if (k === 'gifts_or_react') cur = Number(stats.gifts_sent || 0) + Number(stats.party_react || 0);
  return { cur: Math.min(cur, req), req, met: cur >= req };
}

function checkRule(rc) {
  return getStatProgress(rc).met;
}

function claimDailyStreak() {
  const d = today();
  if (me.streakClaimDay === d) return toast('Today’s streak reward is already claimed!');
  const idx = clampSafeInt(Number(me.streakDayIndex || 0), 0, 6);
  const rw = STREAK_REWARDS[idx] || STREAK_REWARDS[0];
  const vipBoost = getActiveVipTier(me) ? 1.1 : 1;
  const coins = Math.round(rw.coins * vipBoost);
  me.streakClaimDay = d;
  me.streakDayIndex = (idx + 1) % 7;
  if (rw.ticket) me.spinTickets = clampSafeInt((me.spinTickets || 0) + rw.ticket, 0, 9999);
  saveMe();
  const capRes = typeof grantCappedFreeCoins === 'function'
    ? grantCappedFreeCoins(coins, rw.exp, null, false, { silentSfx: true })
    : (addReward(coins, rw.exp, null, false, { silentSfx: true }), { granted: coins, capped: false });
  if (typeof playSfx === 'function') playSfx('chestOpen');
  renderTasks();
  toast(capRes.granted > 0
    ? `Day ${rw.day} Streak Claimed! +${fmtNum(capRes.granted)} 🪙 & +${rw.exp} EXP${capRes.capped ? ' (Daily cap reached)' : ''}${rw.ticket ? ' + 1 Spin Ticket!' : ''}`
    : `Day ${rw.day} Streak! +${rw.exp} EXP (Daily free coin cap ${DAILY_FREE_COIN_CAP} 🪙 reached)`);
}

function handleMissionGo(goKey) {
  if (typeof playSfx === 'function') playSfx('click');
  if (goKey === 'games') { showTab('games'); return; }
  if (goKey === 'party') { showTab('tools'); if (typeof scrollToPartyHub === 'function') scrollToPartyHub(); return; }
  if (goKey === 'gift') { if (typeof openGiftSendModal === 'function') openGiftSendModal('', { allowPickPlayer: true }); return; }
  if (goKey === 'wheel') { if (typeof openLuckySpinModal === 'function') openLuckySpinModal(); return; }
  if (goKey === 'profile') { showTab('profile'); return; }
  if (goKey === 'ad') { openRewardAd(() => { renderTasks(); toast('Ad completed! Tap Claim.'); }); return; }
}

function renderTasks() {
  const el = $('#taskList');
  if (!el) return;
  tasks = [...DAILY_MISSIONS, ...devTasks];
  const d = today();
  const wk = getWeekKey();
  const claimedToday = getClaimedToday();
  const claimedWeek = (me.claimedByDay && me.claimedByDay[wk]) || [];

  const streakClaimed = me.streakClaimDay === d;
  const currentIdx = clampSafeInt(Number(me.streakDayIndex || 0), 0, 6);
  const completedDailyCount = DAILY_MISSIONS.filter(t => claimedToday.includes(t.id)).length;
  const allDailyDone = completedDailyCount >= DAILY_MISSIONS.length;
  const chestClaimed = me.dailyChestClaimedDay === d;

  const streakHtml = `
    <div class="card streak-calendar-card">
      <div class="row" style="justify-content:space-between;margin-bottom:8px">
        <div>
          <b style="font-size:15px">🔥 7-Day Login Streak</b>
          <small style="display:block;color:var(--mu)">Log in daily for escalating coins &amp; Day 7 Royal Chest</small>
        </div>
        <button type="button" class="btn ${streakClaimed ? 'ghost' : 'gold'} sm" id="claimStreakBtn" ${streakClaimed ? 'disabled' : ''}>${streakClaimed ? 'Claimed ✓' : `Claim Day ${currentIdx + 1}`}</button>
      </div>
      <div class="streak-grid">
        ${STREAK_REWARDS.map((sr, i) => {
          const past = i < currentIdx;
          const isCur = i === currentIdx && !streakClaimed;
          return `<div class="streak-day ${past ? 'done' : ''} ${isCur ? 'cur' : ''} ${i === 6 ? 'day7' : ''}">
            <small>D${sr.day}</small>
            <b>${sr.label}</b>
          </div>`;
        }).join('')}
      </div>
    </div>
  `;

  const chestHtml = `
    <div class="card daily-chest-card">
      <div class="row" style="justify-content:space-between;gap:10px">
        <div class="mid">
          <b>🏆 100% Daily Completion Chest (${completedDailyCount}/${DAILY_MISSIONS.length})</b>
          <div class="gw-prog" style="margin-top:6px"><i style="width:${Math.round((completedDailyCount / DAILY_MISSIONS.length) * 100)}%;background:linear-gradient(90deg,#ffd36b,#f59e0b)"></i></div>
          <small style="color:var(--mu)">Complete all Daily Missions for +250 Coins, +100 EXP &amp; 1 Spin Ticket!</small>
        </div>
        <button type="button" class="btn ${allDailyDone && !chestClaimed ? 'gold' : 'ghost'} sm" id="claimDailyChestBtn" ${(!allDailyDone || chestClaimed) ? 'disabled' : ''}>${chestClaimed ? 'Opened ✓' : 'Open Chest'}</button>
      </div>
    </div>
  `;

  const tabBar = `
    <div class="row" style="gap:8px;margin-bottom:8px">
      <button type="button" class="chipbtn ${activeTaskTab === 'daily' ? 'on' : ''}" data-ttab="daily">Daily Missions (${completedDailyCount}/${DAILY_MISSIONS.length})</button>
      <button type="button" class="chipbtn ${activeTaskTab === 'weekly' ? 'on' : ''}" data-ttab="weekly">Weekly Missions</button>
    </div>
  `;

  const list = activeTaskTab === 'daily' ? tasks : WEEKLY_MISSIONS;
  const claimedSet = activeTaskTab === 'daily' ? claimedToday : claimedWeek;

  const missionsHtml = list.map(t => {
    const cl = claimedSet.includes(t.id);
    const prog = getStatProgress(t.ruleCode);
    const pct = Math.round((prog.cur / prog.req) * 100);
    let actionBtn = '';
    if (cl) {
      actionBtn = `<button type="button" class="btn sm ghost" disabled>Claimed ✓</button>`;
    } else if (prog.met) {
      actionBtn = `<button type="button" class="btn sm gold" data-claim="${esc(t.id)}" data-scope="${activeTaskTab}">Claim</button>`;
    } else {
      actionBtn = `<button type="button" class="btn sm ghost" data-go="${esc(t.go || 'games')}">${t.ruleCode === 'ad_watch:1' ? 'Watch Ad' : 'Go →'}</button>`;
    }
    return `<div class="card task mission-card">
      <div class="mid">
        <b>${esc(t.title)}</b>
        <p>${esc(t.description)}</p>
        <div class="mission-prog-row">
          <div class="gw-prog" style="flex:1"><i style="width:${pct}%;background:var(--ac)"></i></div>
          <small>${prog.cur}/${prog.req}</small>
        </div>
        <div class="row wrap" style="margin-top:6px">
          <span class="chip">+${fmtNum(t.reward)} 🪙</span>
          <span class="exp-chip">+${fmtNum(t.exp || 15)} EXP</span>
        </div>
      </div>
      <div class="row" style="gap:6px">
        ${actionBtn}
        ${devMode && String(t.id).startsWith('dt_') ? `<button type="button" class="btn red sm" data-deltask="${esc(t.id)}" aria-label="Delete task">✕</button>` : ''}
      </div>
    </div>`;
  }).join('');

  el.innerHTML = streakHtml + chestHtml + tabBar + missionsHtml;
}

$('#taskList').onclick = e => {
  if (e.target.closest('#claimStreakBtn')) { claimDailyStreak(); return; }
  if (e.target.closest('#claimDailyChestBtn')) {
    const d = today();
    if (me.dailyChestClaimedDay === d) return;
    const completed = DAILY_MISSIONS.filter(t => getClaimedToday().includes(t.id)).length;
    if (completed < DAILY_MISSIONS.length) return toast('Complete all Daily Missions first!');
    me.dailyChestClaimedDay = d;
    me.spinTickets = clampSafeInt((me.spinTickets || 0) + 1, 0, 9999);
    saveMe();
    const capRes = typeof grantCappedFreeCoins === 'function'
      ? grantCappedFreeCoins(120, 100, null, false, { silentSfx: true })
      : (addReward(120, 100, null, false, { silentSfx: true }), { granted: 120, capped: false });
    if (typeof playSfx === 'function') playSfx('chestOpen');
    renderTasks();
    toast(capRes.granted > 0
      ? `🏆 Daily Chest Opened! +${capRes.granted} 🪙, +100 EXP & +1 Spin Ticket!`
      : `🏆 Daily Chest Opened! +100 EXP & +1 Spin Ticket! (Daily free coin cap reached)`);
    return;
  }
  const tabBtn = e.target.closest('[data-ttab]');
  if (tabBtn) { activeTaskTab = tabBtn.dataset.ttab; renderTasks(); return; }

  const goBtn = e.target.closest('[data-go]');
  if (goBtn) { handleMissionGo(goBtn.dataset.go); return; }

  const dt = e.target.dataset.deltask;
  if (dt) {
    if (!devMode) return toast('Developer only');
    devTasks = devTasks.filter(x => x.id !== dt); ls.set('sg_dev_tasks', devTasks);
    dbOp(() => F.deleteDoc(F.doc(db, 'dev_tasks', dt)));
    renderTasks(); toast('Task deleted'); return;
  }

  const claimBtn = e.target.closest('[data-claim]');
  if (!claimBtn) return;
  const id = claimBtn.dataset.claim;
  const scope = claimBtn.dataset.scope || 'daily';
  if (inFlightOps.has('task_' + id)) return;
  const pool = scope === 'weekly' ? WEEKLY_MISSIONS : tasks;
  const t = pool.find(x => x.id === id);
  if (!t) return;
  const bucketKey = scope === 'weekly' ? getWeekKey() : today();
  const bucket = (me.claimedByDay && me.claimedByDay[bucketKey]) || [];
  if (bucket.includes(id)) return;
  if (!checkRule(t.ruleCode)) return toast('Complete the mission goal first!');

  inFlightOps.add('task_' + id);
  try {
    const reqC = clampSafeInt(t.reward, 0, 5000);
    const reqE = clampSafeInt(t.exp || (scope === 'weekly' ? 50 : 15), 0, 500);
    let capRes = { granted: reqC, capped: false };
    if (scope === 'weekly') {
      me.claimedByDay[bucketKey] = [...bucket, id];
      saveMe();
      capRes = typeof grantCappedFreeCoins === 'function'
        ? grantCappedFreeCoins(reqC, reqE, null, false, { silentSfx: true })
        : (addReward(reqC, reqE, null, false, { silentSfx: true }), { granted: reqC, capped: false });
    } else {
      capRes = typeof grantCappedFreeCoins === 'function'
        ? grantCappedFreeCoins(reqC, reqE, id, false, { silentSfx: true })
        : (addReward(reqC, reqE, id, false, { silentSfx: true }), { granted: reqC, capped: false });
    }
    if (typeof playSfx === 'function') playSfx('taskClaim', { amount: capRes.granted });
    renderTasks();
    toast(capRes.granted > 0
      ? `+${fmtNum(capRes.granted)} 🪙 & +${fmtNum(reqE)} EXP${capRes.capped ? ' (Daily free cap reached)' : ''}`
      : `+${fmtNum(reqE)} EXP (Daily free coin cap ${DAILY_FREE_COIN_CAP} 🪙 reached)`);
  } finally {
    setTimeout(() => inFlightOps.delete('task_' + id), 500);
  }
};

$('#addTaskBtn').onclick = () => {
  if (!devMode) return toast('Developer only');
  const m = modal('Add Daily Task (Developer)', `<label>Title</label><input id="tkT" maxlength="60"><label>Description</label><textarea id="tkD" maxlength="140" style="min-height:52px"></textarea><div class="row"><div style="flex:1"><label>Coins</label><input id="tkR" type="number" min="0" max="5000" value="25"></div><div style="flex:1"><label>EXP</label><input id="tkE" type="number" min="0" max="500" value="20"></div></div><label>Rule</label><select id="tkC"><option value="ad_watch:1">Ad task (watch ad)</option><option value="">No requirement</option><option value="games_played:1">games_played:1</option><option value="party_join:1">party_join:1</option><option value="gifts_or_react:1">gifts_or_react:1</option><option value="duel_win:1">duel_win:1</option><option value="profile_save:1">profile_save:1</option></select><button class="btn full" id="tkS">Add Task</button>`);
  $('#tkS', m).onclick = () => {
    if (!devMode) return;
    const title = $('#tkT', m).value.trim(); if (!title) return toast('Add a title');
    const t = { id: 'dt_' + Date.now().toString(36), title, description: $('#tkD', m).value.trim(), reward: clampSafeInt($('#tkR', m).value, 0, 5000), exp: clampSafeInt($('#tkE', m).value || 15, 0, 500), ruleCode: $('#tkC', m).value, go: 'games' };
    devTasks.push(t); ls.set('sg_dev_tasks', devTasks);
    dbOp(() => F.setDoc(F.doc(db, 'dev_tasks', t.id), t), () => toast('Could not sync task'));
    m.close(); renderTasks(); toast('Task added');
  };
};
