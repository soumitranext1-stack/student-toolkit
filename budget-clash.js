"use strict";
/* =====================================================================
   BUDGET CLASH — TV GAME-SHOW PRICE GUESSING ARENA
   · Animated Velvet Curtain Reveal + Glowing Product Showcase Cards
   · Digital Rolling Price Counter (₹10 -> ₹1 Cr) + Fireworks/Confetti
   · 4 Modes: ₹10 vs ₹1 Cr · Asli vs Nakli · Sasta ya Mehnga · Closest Guess Wins
   · Round Coin Betting (Wallet-Safe) · 2 Lifelines (50-50 & Price Hint)
   · Floating EN / HI / BN Natural Voice Bar · Exclusive Rewards Unlock
   ===================================================================== */

function grantGameExclusiveReward(reward) {
  if (!reward || typeof me === 'undefined') return false;
  const key = `${reward.kind}:${reward.value}`;
  const farFuture = Date.now() + 365 * 24 * 60 * 60 * 1000;
  me.tempUnlocks = me.tempUnlocks && typeof me.tempUnlocks === 'object' ? me.tempUnlocks : {};
  const isNew = Number(me.tempUnlocks[key] || 0) <= Date.now();
  me.tempUnlocks[key] = Math.max(Number(me.tempUnlocks[key] || 0), farFuture);
  if (typeof saveMe === 'function') saveMe();
  if (typeof patchUser === 'function' && typeof base === 'function') patchUser(uid, base());
  if (typeof dbOp === 'function' && typeof F !== 'undefined' && F && typeof userRef === 'function') {
    dbOp(() => F.setDoc(userRef(uid), { tempUnlocks: me.tempUnlocks }, { merge: true }));
  }
  return isNew;
}
window.grantGameExclusiveReward = grantGameExclusiveReward;

function equipGameExclusiveReward(reward) {
  if (!reward || typeof me === 'undefined') return;
  grantGameExclusiveReward(reward);
  if (reward.kind === 'frame') {
    me.frame = reward.value;
  } else if (reward.kind === 'tag') {
    const prev = Array.isArray(me.tags) ? me.tags.filter(t => t !== reward.value && t !== 'Guest Pass' && t !== 'Newbie') : [];
    me.tags = [...prev, reward.value].slice(-3);
  }
  const rwName = reward.label || reward.name || reward.value;
  if (typeof persistProfileChanges === 'function') {
    persistProfileChanges(`Equipped ${rwName}!`);
  } else {
    if (typeof saveMe === 'function') saveMe();
    if (typeof toast === 'function') toast(`Equipped ${rwName}!`);
  }
}
window.equipGameExclusiveReward = equipGameExclusiveReward;

function budgetItemArtSvg(iconType) {
  const art = {
    chai: `<svg viewBox="0 0 96 96" fill="none" aria-hidden="true">
      <defs><linearGradient id="bcChai" x1="20" y1="24" x2="76" y2="82" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#fde68a"/><stop offset="55%" stop-color="#d97706"/><stop offset="100%" stop-color="#78350f"/></linearGradient></defs>
      <path d="M36 18c0-6 6-6 6-11M49 20c0-6 6-6 6-11M61 18c0-5 5-5 5-9" stroke="#fef3c7" stroke-width="2.6" stroke-linecap="round" opacity=".75"/>
      <path d="M26 28h44l-6 52a8 8 0 0 1-8 7H40a8 8 0 0 1-8-7l-6-52z" fill="url(#bcChai)" stroke="#fff7ed" stroke-width="2.5"/>
      <ellipse cx="48" cy="30" rx="20" ry="5" fill="#fef3c7" opacity=".85"/>
      <path d="M34 42l3 34M48 42v35M62 42l-3 34" stroke="#fff" stroke-opacity=".28" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
    samosa: `<svg viewBox="0 0 96 96" fill="none" aria-hidden="true">
      <defs><linearGradient id="bcSam" x1="18" y1="22" x2="78" y2="78" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#fde047"/><stop offset="60%" stop-color="#ea580c"/><stop offset="100%" stop-color="#9a3412"/></linearGradient></defs>
      <ellipse cx="48" cy="78" rx="30" ry="7" fill="#000" opacity=".32"/>
      <path d="M48 18L80 70c2 4-1 9-6 9H22c-5 0-8-5-6-9L48 18z" fill="url(#bcSam)" stroke="#fef08a" stroke-width="2.5" stroke-linejoin="round"/>
      <circle cx="42" cy="52" r="3" fill="#fff7ed" opacity=".45"/><circle cx="56" cy="60" r="3.5" fill="#fff7ed" opacity=".35"/>
      <circle cx="72" cy="72" r="10" fill="#22c55e" stroke="#dcfce7" stroke-width="2"/>
    </svg>`,
    notebook: `<svg viewBox="0 0 96 96" fill="none" aria-hidden="true">
      <rect x="22" y="14" width="54" height="68" rx="9" fill="#3b82f6" stroke="#dbeafe" stroke-width="2.5"/>
      <rect x="28" y="20" width="42" height="18" rx="5" fill="#fef08a"/>
      <path d="M18 26h8M18 38h8M18 50h8M18 62h8M18 72h8" stroke="#e2e8f0" stroke-width="3.2" stroke-linecap="round"/>
      <path d="M34 48h30M34 58h24M34 68h18" stroke="#eff6ff" stroke-width="2.6" stroke-linecap="round"/>
    </svg>`,
    pizza: `<svg viewBox="0 0 96 96" fill="none" aria-hidden="true">
      <path d="M48 16L82 76c-22 10-46 10-68 0L48 16z" fill="#fbbf24" stroke="#fef3c7" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M16 72c21 10 43 10 64 0" stroke="#b45309" stroke-width="7" stroke-linecap="round"/>
      <circle cx="48" cy="40" r="6" fill="#dc2626"/><circle cx="37" cy="57" r="5.5" fill="#dc2626"/><circle cx="59" cy="58" r="6" fill="#dc2626"/>
      <circle cx="48" cy="64" r="3" fill="#22c55e"/>
    </svg>`,
    earbuds: `<svg viewBox="0 0 96 96" fill="none" aria-hidden="true">
      <rect x="18" y="24" width="60" height="52" rx="18" fill="#1e293b" stroke="#38bdf8" stroke-width="2.6"/>
      <path d="M18 46h60" stroke="#38bdf8" stroke-width="2"/>
      <circle cx="36" cy="36" r="8" fill="#f8fafc"/><circle cx="60" cy="36" r="8" fill="#f8fafc"/>
      <circle cx="48" cy="58" r="3.5" fill="#22c55e"/>
    </svg>`,
    sneakers: `<svg viewBox="0 0 96 96" fill="none" aria-hidden="true">
      <path d="M16 58l14-26 16 10 14-8 18 16c4 4 4 14-2 16H18c-5 0-6-4-2-8z" fill="#f43f5e" stroke="#ffe4e6" stroke-width="2.4" stroke-linejoin="round"/>
      <path d="M14 66h68v8a4 4 0 0 1-4 4H18a4 4 0 0 1-4-4v-8z" fill="#f8fafc"/>
      <path d="M40 46l8 6M48 42l8 6" stroke="#fde047" stroke-width="3" stroke-linecap="round"/>
    </svg>`,
    console: `<svg viewBox="0 0 96 96" fill="none" aria-hidden="true">
      <rect x="14" y="28" width="68" height="40" rx="16" fill="#0f172a" stroke="#a855f7" stroke-width="2.6"/>
      <path d="M29 48h12M35 42v12" stroke="#38bdf8" stroke-width="3.4" stroke-linecap="round"/>
      <circle cx="63" cy="43" r="3.6" fill="#f43f5e"/><circle cx="71" cy="51" r="3.6" fill="#22c55e"/><circle cx="55" cy="51" r="3.6" fill="#fde047"/>
    </svg>`,
    phone: `<svg viewBox="0 0 96 96" fill="none" aria-hidden="true">
      <rect x="26" y="10" width="44" height="76" rx="11" fill="#1e293b" stroke="#fbbf24" stroke-width="2.6"/>
      <rect x="31" y="16" width="34" height="62" rx="7" fill="url(#bcPhGrad)"/>
      <defs><linearGradient id="bcPhGrad" x1="31" y1="16" x2="65" y2="78" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#38bdf8"/><stop offset="100%" stop-color="#6366f1"/></linearGradient></defs>
      <circle cx="40" cy="26" r="4" fill="#0f172a"/><circle cx="50" cy="26" r="4" fill="#0f172a"/><circle cx="45" cy="35" r="4" fill="#0f172a"/>
    </svg>`,
    bike: `<svg viewBox="0 0 96 96" fill="none" aria-hidden="true">
      <circle cx="24" cy="64" r="14" fill="#0f172a" stroke="#f59e0b" stroke-width="4"/>
      <circle cx="72" cy="64" r="14" fill="#0f172a" stroke="#f59e0b" stroke-width="4"/>
      <path d="M24 64l18-24h22l12 12-4 12H36" fill="#ef4444" stroke="#fef08a" stroke-width="2.4" stroke-linejoin="round"/>
      <path d="M56 32h14l6 10" stroke="#38bdf8" stroke-width="3.2" stroke-linecap="round"/>
    </svg>`,
    goldbar: `<svg viewBox="0 0 96 96" fill="none" aria-hidden="true">
      <defs><linearGradient id="bcGold" x1="14" y1="24" x2="82" y2="74" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#fef9c3"/><stop offset="45%" stop-color="#fbbf24"/><stop offset="100%" stop-color="#b45309"/></linearGradient></defs>
      <polygon points="22,36 74,36 86,68 10,68" fill="url(#bcGold)" stroke="#fffbeb" stroke-width="2.5" stroke-linejoin="round"/>
      <polygon points="28,40 68,40 76,62 20,62" fill="#fde047" opacity=".4"/>
      <text x="48" y="56" text-anchor="middle" font-size="13" font-weight="900" fill="#78350f">999.9</text>
      <path d="M48 14v8M26 20l5 5M70 20l-5 5" stroke="#fef08a" stroke-width="3" stroke-linecap="round"/>
    </svg>`,
    watch: `<svg viewBox="0 0 96 96" fill="none" aria-hidden="true">
      <rect x="36" y="8" width="24" height="80" rx="8" fill="#1e293b" stroke="#fbbf24" stroke-width="2.2"/>
      <circle cx="48" cy="48" r="24" fill="#0f172a" stroke="#fde047" stroke-width="4"/>
      <circle cx="48" cy="48" r="17" fill="#1e1b4b" stroke="#38bdf8" stroke-width="1.6" stroke-dasharray="3 3"/>
      <path d="M48 48V35M48 48l10 5" stroke="#fef08a" stroke-width="3" stroke-linecap="round"/>
      <circle cx="48" cy="48" r="3" fill="#fff"/>
    </svg>`,
    supercar: `<svg viewBox="0 0 96 96" fill="none" aria-hidden="true">
      <defs><linearGradient id="bcCar" x1="12" y1="30" x2="84" y2="70" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#ff4d6a"/><stop offset="60%" stop-color="#dc2626"/><stop offset="100%" stop-color="#7f1d1d"/></linearGradient></defs>
      <path d="M12 58l14-14 18-12h22l18 14 4 12H12z" fill="url(#bcCar)" stroke="#fef08a" stroke-width="2.4" stroke-linejoin="round"/>
      <polygon points="36,36 60,36 70,46 28,46" fill="#38bdf8" opacity=".85"/>
      <circle cx="28" cy="62" r="9.5" fill="#0f172a" stroke="#fde047" stroke-width="3"/>
      <circle cx="70" cy="62" r="9.5" fill="#0f172a" stroke="#fde047" stroke-width="3"/>
    </svg>`,
    necklace: `<svg viewBox="0 0 96 96" fill="none" aria-hidden="true">
      <path d="M20 24c4 30 52 30 56 0" stroke="#fde047" stroke-width="4" stroke-linecap="round"/>
      <polygon points="48,46 60,62 48,80 36,62" fill="#10b981" stroke="#fef08a" stroke-width="2.6" stroke-linejoin="round"/>
      <polygon points="48,51 54,62 48,74 42,62" fill="#6ee7b7" opacity=".7"/>
      <circle cx="32" cy="44" r="4" fill="#fff"/><circle cx="64" cy="44" r="4" fill="#fff"/>
    </svg>`,
    rarecoin: `<svg viewBox="0 0 96 96" fill="none" aria-hidden="true">
      <circle cx="48" cy="48" r="32" fill="#f59e0b" stroke="#fef08a" stroke-width="4"/>
      <circle cx="48" cy="48" r="24" fill="#b45309" stroke="#fde68a" stroke-width="2" stroke-dasharray="4 3"/>
      <path d="M48 30l4.5 10 10.5 1.2-8 7.2 2.2 10.6L48 53.8 38.8 59l2.2-10.6-8-7.2 10.5-1.2L48 30z" fill="#fef08a"/>
    </svg>`,
    pen: `<svg viewBox="0 0 96 96" fill="none" aria-hidden="true">
      <path d="M22 74l8-20 38-38 12 12-38 38-20 8z" fill="#38bdf8" stroke="#e0f2fe" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M62 22l12 12" stroke="#fde047" stroke-width="3"/>
      <circle cx="23" cy="73" r="3" fill="#0f172a"/>
    </svg>`,
    kulfi: `<svg viewBox="0 0 96 96" fill="none" aria-hidden="true">
      <path d="M48 72v14" stroke="#d97706" stroke-width="6" stroke-linecap="round"/>
      <path d="M34 72L42 20c1-6 11-6 12 0l8 52H34z" fill="#fef3c7" stroke="#fbbf24" stroke-width="2.5" stroke-linejoin="round"/>
      <circle cx="45" cy="36" r="2.8" fill="#16a34a"/><circle cx="52" cy="48" r="2.8" fill="#16a34a"/><circle cx="44" cy="56" r="2.5" fill="#ea580c"/>
    </svg>`,
    laptop: `<svg viewBox="0 0 96 96" fill="none" aria-hidden="true">
      <rect x="18" y="20" width="60" height="40" rx="6" fill="#0f172a" stroke="#38bdf8" stroke-width="2.6"/>
      <rect x="23" y="25" width="50" height="30" rx="3" fill="#1e1b4b"/>
      <path d="M30 46l10-10 8 7 16-14" stroke="#fde047" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M10 64h76l-6 10H16l-6-10z" fill="#334155" stroke="#94a3b8" stroke-width="2" stroke-linejoin="round"/>
    </svg>`
  };
  return art[iconType] || art.goldbar;
}
window.budgetItemArtSvg = budgetItemArtSvg;

function launchBudgetClash(opts) {
  const SR = window.ShowGamesRules;
  if (!SR) return;
  const o = opts || {};
  const initialMode = o.subMode || 'ten_vs_cr';
  const matchStake = Math.max(0, Math.floor(Number(o.stake || 0)));
  const matchStakePaid = Boolean(o.stakeDeducted && matchStake > 0);
  const roomCode = String(o.roomCode || ('BC' + Math.floor(1000 + Math.random() * 9000))).toUpperCase();
  const modeType = o.modeType || 'bot';

  if (typeof setMyLiveActivity === 'function') {
    setMyLiveActivity({ type: 'playing', gameId: 'budget_clash', gameName: 'Budget Clash', roomCode, mode: initialMode });
  }

  let activeMode = initialMode;
  let roundNo = 1;
  const maxRounds = 4;
  let score = 0;
  let wins = 0;
  let streak = 0;
  let bestStreak = 0;
  let jackpots = 0;
  let roundBet = 0;
  let life5050 = true;
  let lifeHint = true;
  let over = false;
  let locked = false;
  let rollRaf = 0;
  let roundTimerIv = 0;
  let curtainTimer = 0;
  let confettiTimer = 0;
  let sastaAnchor = null;
  const loadModeSeen = (modeKey) => new Set(
    typeof SR.loadSeenQuestionIds === 'function' ? SR.loadSeenQuestionIds('bc_' + modeKey) : []
  );
  const recordModeSeen = (modeKey, id, maxKeep) => {
    if (!id) return;
    usedIds.add(id);
    const list = Array.from(usedIds);
    const trimmed = list.length >= maxKeep ? [id] : list;
    usedIds = new Set(trimmed);
    if (typeof SR.saveSeenQuestionIds === 'function') SR.saveSeenQuestionIds('bc_' + modeKey, trimmed);
  };
  let usedIds = loadModeSeen(activeMode);
  let curRoundData = null;
  let matchSettled = false;

  const myUid = (typeof uid !== 'undefined' && uid) ? String(uid) : 'local_me';
  const myName = (typeof me !== 'undefined' && me?.name) ? me.name : 'You';
  const auth = window.PvpSyncRules ? window.PvpSyncRules.resolveMatchAuthority(o, myUid) : null;
  const isLiveOnline = Boolean(auth && auth.isLiveOnline);
  const bcRoomId = String(o.roomId || (auth && auth.roomId) || '').trim();
  const bcRoomCode = String(o.roomCode || (auth && auth.roomCode) || '').toUpperCase();
  const realRemotePlayers = (auth && Array.isArray(auth.remoteHumans)) ? auth.remoteHumans : [];
  let liveSync = null;
  let liveClosestGuesses = {}; // { [roundNo]: { [uid]: { id, name, guess } } }
  let liveClosestRevealFn = null;

  const view = openFullScreenGameView({
    gameId: 'budget_clash',
    title: 'Budget Clash',
    subMeta: matchStakePaid ? `Stake 🪙 ${fmtNum(matchStake)} · Wallet 🪙 ${fmtNum(me.coins)}` : `Free Practice · 🪙 ${fmtNum(me.coins)}`,
    statusText: matchStakePaid ? 'STAKE SHOW' : 'LIVE SHOW',
    statusTone: 'gold',
    themeClass: 'gfs-theme-budget',
    html: `
      <div class="bc-arena" id="bcArena" data-testid="budget-clash-arena">
        <div class="bc-stage-lights" aria-hidden="true"><i></i><i></i><i></i></div>

        <div class="bc-top-bar">
          <div class="bc-mode-pills" role="tablist" aria-label="Budget Clash Modes">
            ${SR.BUDGET_MODES.map(m => `<button type="button" class="bc-mode-pill ${m.id === activeMode ? 'on' : ''}" data-bcmode="${esc(m.id)}">${esc(m.name)}</button>`).join('')}
          </div>
          ${typeof VoiceNarrator !== 'undefined' ? VoiceNarrator.renderBar('bc') : ''}
        </div>

        <div class="bc-hud-strip">
          <div class="bc-stat"><small>SCORE</small><b id="bcScore" data-testid="bc-score">0</b></div>
          <div class="bc-stat"><small>STREAK</small><b id="bcStreak">0 🔥</b></div>
          <div class="bc-stat"><small>ROUND</small><b id="bcRound">1/${maxRounds}</b></div>
          <div class="bc-stat gold"><small>WALLET</small><b id="bcWallet">🪙 ${fmtNum(me.coins)}</b></div>
        </div>

        <div class="bc-bet-lifeline-bar">
          <div class="bc-bet-row" aria-label="Round Coin Bet">
            ${matchStakePaid
              ? `<span class="bc-stake-pill">🪙 Match Stake: ${fmtNum(matchStake)} 🪙</span>`
              : `<span class="bc-mini-lbl">BET</span>
                 ${[0, 25, 50, 100].map(b => `<button type="button" class="bc-bet-chip ${roundBet === b ? 'on' : ''}" data-bcbet="${b}">${b === 0 ? 'Free (0 🪙)' : `🪙 ${b}`}</button>`).join('')}`}
          </div>
          <div class="bc-life-row">
            <button type="button" class="bc-life-btn" id="bcLife5050" data-testid="bc-life-5050">✂️ 50-50</button>
            <button type="button" class="bc-life-btn" id="bcLifeHint" data-testid="bc-life-hint">💡 Hint</button>
          </div>
        </div>

        <div class="bc-timer-wrap" id="bcTimerWrap" data-testid="bc-round-timer">
          <span class="bc-timer-lbl">⏱️ ROUND CLOCK</span>
          <div class="bc-timer-track"><div class="bc-timer-fill" id="bcTimerFill" style="width:100%"></div></div>
          <b class="bc-timer-sec" id="bcTimerSec">${SR.BUDGET_ROUND_TIMER_SEC || 7}s</b>
        </div>

        <div class="bc-counter-banner" id="bcCounterBox" data-testid="bc-price-counter">
          <small id="bcCounterLbl">PRIZE VAULT</small>
          <div class="bc-digital-num" id="bcCounterVal">₹10 → ₹1 Cr</div>
        </div>

        <div class="bc-hint-toast" id="bcHintBox" hidden></div>

        <div class="bc-stage-host" id="bcStageHost"></div>
        <div class="bc-confetti-layer" id="bcConfetti" aria-hidden="true"></div>
      </div>
    `
  });

  if (typeof VoiceNarrator !== 'undefined') VoiceNarrator.bindBar(view);

  const stopRoundTimer = () => {
    clearInterval(roundTimerIv);
    roundTimerIv = 0;
  };

  const startRoundTimer = (secLimit, onExpire) => {
    stopRoundTimer();
    const total = Math.max(4, Number(secLimit) || SR.BUDGET_ROUND_TIMER_SEC || 7);
    let leftMs = total * 1000;
    const fill = $('#bcTimerFill', view);
    const txt = $('#bcTimerSec', view);
    const wrap = $('#bcTimerWrap', view);
    let lastWhole = total;
    const paint = () => {
      const pct = Math.max(0, Math.min(100, (leftMs / (total * 1000)) * 100));
      const sec = Math.max(0, Math.ceil(leftMs / 1000));
      if (fill) fill.style.width = pct.toFixed(1) + '%';
      if (txt) txt.textContent = sec + 's';
      if (wrap) wrap.classList.toggle('urgent', sec <= 3);
      if (sec < lastWhole && sec > 0 && sec <= 3) {
        if (typeof playSfx === 'function') playSfx('timerTick');
      }
      lastWhole = sec;
    };
    paint();
    roundTimerIv = setInterval(() => {
      if (locked || over) { stopRoundTimer(); return; }
      leftMs -= 100;
      paint();
      if (leftMs <= 0) {
        stopRoundTimer();
        if (typeof onExpire === 'function') onExpire();
      }
    }, 100);
  };

  const syncHud = () => {
    if ($('#bcScore', view)) $('#bcScore', view).textContent = String(score);
    if ($('#bcStreak', view)) $('#bcStreak', view).textContent = `${streak} 🔥`;
    if ($('#bcRound', view)) $('#bcRound', view).textContent = activeMode === 'sasta_mehnga' ? `Streak ${streak}` : `${Math.min(roundNo, maxRounds)}/${maxRounds}`;
    if ($('#bcWallet', view)) $('#bcWallet', view).textContent = `🪙 ${fmtNum(me.coins)}`;
    view.setSubMeta(`🪙 ${fmtNum(me.coins)} · ${SR.BUDGET_MODES.find(x => x.id === activeMode)?.name || ''}`);
    $$('[data-bcmode]', view).forEach(b => b.classList.toggle('on', b.dataset.bcmode === activeMode));
    $$('[data-bcbet]', view).forEach(b => {
      const val = Number(b.dataset.bcbet);
      b.classList.toggle('on', val === roundBet);
      b.disabled = val > Number(me.coins || 0);
    });
    if ($('#bcLife5050', view)) $('#bcLife5050', view).disabled = !life5050 || locked || over;
    if ($('#bcLifeHint', view)) $('#bcLifeHint', view).disabled = !lifeHint || locked || over;
  };

  const triggerFireworks = (big) => {
    const layer = $('#bcConfetti', view);
    if (!layer) return;
    const count = big ? 36 : 16;
    const colors = ['#fde047', '#f59e0b', '#ec4899', '#38bdf8', '#22c55e', '#ffffff'];
    let html = '';
    for (let i = 0; i < count; i++) {
      const left = 10 + Math.random() * 80;
      const delay = (Math.random() * 0.25).toFixed(2);
      const dur = (0.9 + Math.random() * 0.7).toFixed(2);
      const c = colors[i % colors.length];
      html += `<span class="bc-conf-bit" style="left:${left}%;background:${c};animation-delay:${delay}s;animation-duration:${dur}s"></span>`;
    }
    clearTimeout(confettiTimer);
    layer.innerHTML = html;
    confettiTimer = setTimeout(() => { if (layer) layer.innerHTML = ''; }, 1800);
  };

  const animateRollingCounter = (startVal, endVal, labelText, isJackpot) => {
    cancelAnimationFrame(rollRaf);
    const valEl = $('#bcCounterVal', view);
    const lblEl = $('#bcCounterLbl', view);
    const boxEl = $('#bcCounterBox', view);
    if (!valEl) return;
    if (lblEl) lblEl.textContent = labelText || 'REVEALED VALUE';
    if (boxEl) boxEl.classList.toggle('jackpot', Boolean(isJackpot));
    const t0 = performance.now();
    const dur = isJackpot ? 950 : 650;
    const step = (now) => {
      const p = Math.min(1, (now - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      const cur = Math.round(startVal + (endVal - startVal) * eased);
      valEl.textContent = SR.formatINR(cur);
      if (p < 1) {
        rollRaf = requestAnimationFrame(step);
      } else {
        valEl.textContent = SR.formatINR(endVal);
        if (isJackpot) {
          if (typeof playSfx === 'function') playSfx('fanfare');
          triggerFireworks(true);
        }
      }
    };
    if (typeof playSfx === 'function') playSfx('jackpotRoll');
    rollRaf = requestAnimationFrame(step);
  };

  const speakRound = (scriptObj) => {
    if (typeof VoiceNarrator !== 'undefined' && scriptObj) {
      VoiceNarrator.speak(scriptObj);
    }
  };

  const settleRoundBet = (won, isJackpot) => {
    // Strict Coin Economy: Free Practice awards 0 Coins (EXP & Streak only);
    // Paid Match Stake settles once at match end; optional per-round bet settles only when > 0.
    if (matchStakePaid || roundBet <= 0) {
      const xp = won ? (isJackpot ? 18 : 14) : 5;
      if (typeof addReward === 'function') addReward(0, xp, null, false, { silentSfx: true });
      return matchStakePaid ? (won ? `+${xp} EXP · Round Won` : `+${xp} EXP`) : `+${xp} EXP (Free · 0 🪙)`;
    }
    const v = SR.validateShowBet(roundBet, me.coins);
    if (!v.ok) {
      roundBet = 0;
      syncHud();
      return 'Free Round (0 🪙)';
    }
    if (won) {
      const netGain = Math.max(1, v.winPayout - roundBet);
      if (typeof addReward === 'function') addReward(netGain, 20, null, false, { silentSfx: true });
      if (typeof playSfx === 'function') playSfx('coin', { amount: netGain });
      return `+${netGain} 🪙 Won!`;
    } else {
      if (typeof addReward === 'function') addReward(-roundBet, 6, null, true, { silentSfx: true });
      return `−${roundBet} 🪙`;
    }
  };

  const showFinalSummary = () => {
    stopRoundTimer();
    over = true;
    locked = true;
    if (typeof bumpStat === 'function') bumpStat('games_played');

    let matchOutcomeBanner = '';
    if (matchStakePaid && !matchSettled) {
      matchSettled = true;
      const didWin = activeMode === 'sasta_mehnga' ? bestStreak >= 3 : wins >= 3;
      const didTie = activeMode !== 'sasta_mehnga' && wins === 2;
      const res = SR.settleStrictGameReward({ stake: matchStake, won: didWin, tie: didTie, expWin: 35, expLose: 12 });
      if (typeof addReward === 'function') addReward(res.coinsDelta, res.expDelta, null, false, { silentSfx: true });
      if (res.coinsDelta > 0 && typeof playSfx === 'function') playSfx('coin', { amount: res.coinsDelta });
      matchOutcomeBanner = `<div class="bc-fb-pill ${didWin ? 'ok' : (didTie ? '' : 'bad')}" style="margin:6px auto 10px">${esc(res.label)}</div>`;
    }

    syncHud();
    const unlocked = SR.checkBudgetExclusiveUnlocks({ streak: bestStreak, jackpots, score });
    unlocked.forEach(r => grantGameExclusiveReward(r));
    if (score >= 120) {
      if (typeof playSfx === 'function') playSfx('fanfare');
      triggerFireworks(true);
    }

    const host = $('#bcStageHost', view);
    if (!host) return;
    host.innerHTML = `
      <div class="bc-summary-card" data-testid="bc-summary-card">
        <div class="bc-sum-badge">${jackpots > 0 ? '🏆 JACKPOT TYCOON' : '🎬 SHOW COMPLETE'}</div>
        <h3>${score >= 160 ? 'Crowd Goes Wild!' : 'Great Price Instinct!'}</h3>
        ${matchOutcomeBanner}
        <div class="bc-sum-stats">
          <div><small>Score</small><b>${score}</b></div>
          <div><small>Best Streak</small><b>${bestStreak} 🔥</b></div>
          <div><small>₹1 Cr Hits</small><b>${jackpots} 💎</b></div>
        </div>
        ${unlocked.length ? `
          <div class="bc-unlock-strip">
            <div class="bc-unlock-hdr">✨ Exclusive Budget Clash Rewards Unlocked!</div>
            ${unlocked.map((rw, idx) => `
              <div class="bc-unlock-row">
                <span>${rw.icon} <b>${esc(rw.label || rw.name || rw.value)}</b></span>
                <button type="button" class="btn gold sm" data-bcequip="${idx}">Equip Now</button>
              </div>
            `).join('')}
          </div>
        ` : `<div class="bc-unlock-hint">Hit a ₹1 Cr Jackpot or 3+ Streak to unlock <b>👑 Tycoon Crown</b> &amp; <b>🏆 Golden Vault Frame</b>!</div>`}
        <div class="row" style="gap:8px;justify-content:center;margin-top:12px">
          <button type="button" class="btn ghost sm" id="bcExitFinal">Exit Arena</button>
          <button type="button" class="btn gold sm" id="bcRematchBtn">Play Again</button>
        </div>
      </div>
    `;
    $$('[data-bcequip]', host).forEach(b => {
      b.onclick = () => {
        const rw = unlocked[Number(b.dataset.bcequip)];
        if (rw) {
          equipGameExclusiveReward(rw);
          b.textContent = 'Equipped ✓';
          b.disabled = true;
        }
      };
    });
    $('#bcExitFinal', host).onclick = () => view.close();
    $('#bcRematchBtn', host).onclick = () => resetGame(activeMode);
  };

  const renderRound = () => {
    locked = false;
    const hintBox = $('#bcHintBox', view);
    if (hintBox) { hintBox.hidden = true; hintBox.textContent = ''; }
    const boxEl = $('#bcCounterBox', view);
    if (boxEl) boxEl.classList.remove('jackpot');
    syncHud();

    const host = $('#bcStageHost', view);
    if (!host) return;

    if (activeMode !== 'sasta_mehnga' && roundNo > maxRounds) {
      showFinalSummary();
      return;
    }

    if (activeMode === 'ten_vs_cr') {
      const data = SR.createTenVsCrRound(usedIds);
      if (data.pairId) recordModeSeen('ten_vs_cr', data.pairId, (SR.TRICKY_TEN_VS_CR_PAIRS || []).length);
      const jackpotItem = data.jackpot || data.pair[data.jackpotIndex];
      curRoundData = { ...data, targetItem: jackpotItem, correctIdx: data.jackpotIndex };
      if ($('#bcCounterLbl', view)) $('#bcCounterLbl', view).textContent = 'TAP THE REAL FORTUNE BEHIND THE CURTAIN';
      if ($('#bcCounterVal', view)) $('#bcCounterVal', view).textContent = '₹10 vs ₹1 Cr';
      if (typeof playSfx === 'function') playSfx('curtainWhoosh');
      speakRound(data.prompt || {
        enText: `Round ${roundNo}. ${data.pair[0].name} versus ${data.pair[1].name}. Which one is the real fortune?`,
        hiSpoken: `राउंड ${roundNo}! ${data.pair[0].name} या ${data.pair[1].name} — असली करोड़ों का खज़ाना कौन सा है?`,
        bnSpoken: `রাউন্ড ${roundNo}! ${data.pair[0].name} নাকি ${data.pair[1].name} — আসল কোটি টাকার জিনিস কোনটা?`
      });

      host.innerHTML = `
        <div class="bc-curtain-stage" id="bcCurtainStage">
          <div class="bc-curtain-left"></div>
          <div class="bc-curtain-right"></div>
          <div class="bc-showcase-grid">
            ${data.pair.map((it, i) => `
              <button type="button" class="bc-product-card" data-bcpick="${i}" data-testid="bc-card-${i}">
                <span class="bc-cat-lbl">${esc(it.category)}</span>
                <div class="bc-art-box">${budgetItemArtSvg(it.icon)}</div>
                <b class="bc-item-name">${esc(it.name)}</b>
                <span class="bc-price-reveal" id="bcPrice_${i}">???</span>
              </button>
            `).join('')}
          </div>
        </div>
        <div class="bc-feedback-bar" id="bcFeedback"></div>
      `;
      clearTimeout(curtainTimer);
      curtainTimer = setTimeout(() => {
        const st = $('#bcCurtainStage', host);
        if (st) {
          void st.offsetWidth;
          st.classList.add('open');
        }
      }, 28);

      const resolveTenVsCr = (pick, timedOut) => {
        if (locked || over) return;
        locked = true;
        stopRoundTimer();
        const won = !timedOut && pick === data.jackpotIndex;
        data.pair.forEach((it, idx) => {
          const pEl = $(`#bcPrice_${idx}`, host);
          if (pEl) pEl.textContent = SR.formatINR(it.price);
          const cEl = host.querySelector(`[data-bcpick="${idx}"]`);
          if (cEl) cEl.classList.add(idx === data.jackpotIndex ? 'is-jackpot' : 'is-cheap');
        });
        if (won) {
          wins++; streak++; bestStreak = Math.max(bestStreak, streak); jackpots++;
          score += 100 + streak * 15;
          animateRollingCounter(10, jackpotItem.price, 'JACKPOT REVEAL!', true);
        } else {
          streak = 0;
          if (typeof playSfx === 'function') playSfx('funnyBuzzer');
          const shownPrice = timedOut ? jackpotItem.price : data.pair[pick].price;
          animateRollingCounter(10, shownPrice, timedOut ? 'TIME UP!' : 'OOPS! DECOY PICK', false);
        }
        const coinMsg = settleRoundBet(won, won);
        syncHud();
        $('#bcFeedback', host).innerHTML = `
          <div class="bc-fb-pill ${won ? 'ok' : 'bad'}">${timedOut ? `⏱️ Time Up! Fortune was ${SR.formatINR(jackpotItem.price)} · ${coinMsg}` : (won ? `🎉 JACKPOT! ${coinMsg}` : `😅 Decoy was ${SR.formatINR(data.pair[pick].price)} · ${coinMsg}`)}</div>
          <button type="button" class="btn gold sm" id="bcNextBtn">${roundNo >= maxRounds ? 'See Results ›' : 'Next Curtain ›'}</button>
        `;
        $('#bcNextBtn', host).onclick = () => { roundNo++; renderRound(); };
      };

      startRoundTimer(data.timerSec || SR.BUDGET_ROUND_TIMER_SEC, () => resolveTenVsCr(-1, true));
      $$('[data-bcpick]', host).forEach(btn => {
        btn.onclick = () => resolveTenVsCr(Number(btn.dataset.bcpick), false);
      });
      return;
    }

    if (activeMode === 'asli_nakli') {
      const data = SR.createAsliNakliRound(usedIds);
      recordModeSeen('asli_nakli', data.item.id, (SR.BUDGET_ITEMS || []).length);
      curRoundData = { ...data, targetItem: data.item };
      if ($('#bcCounterLbl', view)) $('#bcCounterLbl', view).textContent = 'ASLI VS NAKLI · PICK REAL PRICE';
      if ($('#bcCounterVal', view)) $('#bcCounterVal', view).textContent = '???';
      if (typeof playSfx === 'function') playSfx('curtainWhoosh');
      speakRound({
        enText: `${data.item.enText} Is the real price ${SR.formatINR(data.options[0].price)} or ${SR.formatINR(data.options[1].price)}?`,
        hiSpoken: `${data.item.hiSpoken} इसकी असली कीमत क्या है? पहला ऑप्शन या दूसरा ऑप्शन चुनिए!`,
        bnSpoken: `${data.item.bnSpoken} এটার আসল বাজারদর কোনটা? প্রথম না দ্বিতীয় অপশন?`
      });

      host.innerHTML = `
        <div class="bc-single-showcase">
          <div class="bc-art-box lg">${budgetItemArtSvg(data.item.icon)}</div>
          <span class="bc-cat-lbl">${esc(data.item.category)}</span>
          <b class="bc-item-name lg">${esc(data.item.name)}</b>
        </div>
        <div class="bc-price-opts">
          ${data.options.map((op, i) => `
            <button type="button" class="bc-price-btn" data-bcopt="${i}" data-testid="bc-opt-${i}">
              <small>OPTION ${i === 0 ? 'A' : 'B'}</small>
              <b>${SR.formatINR(op.price)}</b>
            </button>
          `).join('')}
        </div>
        <div class="bc-feedback-bar" id="bcFeedback"></div>
      `;

      const resolveAsli = (pick, timedOut) => {
        if (locked || over) return;
        locked = true;
        stopRoundTimer();
        const won = !timedOut && pick === data.correctIdx;
        $$('[data-bcopt]', host).forEach((b, i) => {
          b.classList.add(i === data.correctIdx ? 'correct' : (i === pick ? 'wrong' : 'dim'));
        });
        if (won) {
          wins++; streak++; bestStreak = Math.max(bestStreak, streak);
          score += 80 + streak * 10;
          if (data.item.price >= 7500000) jackpots++;
          animateRollingCounter(10, data.item.price, 'ASLI PRICE CONFIRMED!', data.item.price >= 7500000);
          if (typeof playSfx === 'function') playSfx('duelCorrect');
        } else {
          streak = 0;
          if (typeof playSfx === 'function') playSfx('funnyBuzzer');
          animateRollingCounter(10, data.item.price, timedOut ? 'TIME UP!' : 'REAL MARKET PRICE', false);
        }
        const coinMsg = settleRoundBet(won, false);
        syncHud();
        $('#bcFeedback', host).innerHTML = `
          <div class="bc-fb-pill ${won ? 'ok' : 'bad'}">${timedOut ? `⏱️ Time Up! Real: ${SR.formatINR(data.item.price)} · ${coinMsg}` : (won ? `✅ Asli! ${coinMsg}` : `❌ Real price: ${SR.formatINR(data.item.price)} · ${coinMsg}`)}</div>
          <button type="button" class="btn gold sm" id="bcNextBtn">${roundNo >= maxRounds ? 'See Results ›' : 'Next Item ›'}</button>
        `;
        $('#bcNextBtn', host).onclick = () => { roundNo++; renderRound(); };
      };

      startRoundTimer(data.timerSec || SR.BUDGET_ROUND_TIMER_SEC, () => resolveAsli(-1, true));
      $$('[data-bcopt]', host).forEach(btn => {
        btn.onclick = () => resolveAsli(Number(btn.dataset.bcopt), false);
      });
      return;
    }

    if (activeMode === 'sasta_mehnga') {
      const data = SR.createSastaMehngaPair(sastaAnchor, usedIds);
      recordModeSeen('sasta_mehnga', data.challenger.id, Math.max(8, (SR.BUDGET_ITEMS || []).length - 1));
      sastaAnchor = data.challenger;
      curRoundData = { ...data, targetItem: data.challenger, correctIdx: data.answer === 'higher' ? 1 : 0 };
      if ($('#bcCounterLbl', view)) $('#bcCounterLbl', view).textContent = 'SASTA YA MEHNGA · STREAK RUN';
      if ($('#bcCounterVal', view)) $('#bcCounterVal', view).textContent = SR.formatINR(data.anchor.price);
      speakRound({
        enText: `${data.anchor.name} costs ${SR.formatINR(data.anchor.price)}. Is ${data.challenger.name} cheaper or more expensive?`,
        hiSpoken: `${data.anchor.hiSpoken} अब बताइए, ${data.challenger.hiSpoken} इससे सस्ता है या महंगा?`,
        bnSpoken: `${data.anchor.bnSpoken} এবার বলুন, ${data.challenger.bnSpoken} আগেরটার চেয়ে সস্তা না দামি?`
      });

      host.innerHTML = `
        <div class="bc-vs-pair">
          <div class="bc-product-card static">
            <span class="bc-cat-lbl">KNOWN PRICE</span>
            <div class="bc-art-box">${budgetItemArtSvg(data.anchor.icon)}</div>
            <b class="bc-item-name">${esc(data.anchor.name)}</b>
            <span class="bc-price-reveal known">${SR.formatINR(data.anchor.price)}</span>
          </div>
          <div class="bc-vs-orb" aria-hidden="true">VS</div>
          <div class="bc-product-card static mystery">
            <span class="bc-cat-lbl">CHALLENGER</span>
            <div class="bc-art-box">${budgetItemArtSvg(data.challenger.icon)}</div>
            <b class="bc-item-name">${esc(data.challenger.name)}</b>
            <span class="bc-price-reveal" id="bcSmPrice">???</span>
          </div>
        </div>
        <div class="bc-sm-actions">
          <button type="button" class="bc-sm-btn lower" data-bcsm="lower">⬇️ Sasta (Lower)</button>
          <button type="button" class="bc-sm-btn higher" data-bcsm="higher">⬆️ Mehnga (Higher)</button>
        </div>
        <div class="bc-feedback-bar" id="bcFeedback"></div>
      `;

      const resolveSasta = (pick, timedOut) => {
        if (locked || over) return;
        locked = true;
        stopRoundTimer();
        const won = !timedOut && pick === data.answer;
        if ($('#bcSmPrice', host)) $('#bcSmPrice', host).textContent = SR.formatINR(data.challenger.price);
        animateRollingCounter(data.anchor.price, data.challenger.price, data.challenger.name.toUpperCase(), won && data.challenger.price >= 7500000);
        if (won) {
          wins++; streak++; bestStreak = Math.max(bestStreak, streak);
          score += 70 + streak * 15;
          if (typeof playSfx === 'function') playSfx('duelCorrect');
        } else {
          if (typeof playSfx === 'function') playSfx('funnyBuzzer');
        }
        const coinMsg = settleRoundBet(won, false);
        syncHud();
        $('#bcFeedback', host).innerHTML = `
          <div class="bc-fb-pill ${won ? 'ok' : 'bad'}">${timedOut ? `⏱️ Time Up! Streak ended at ${streak}` : (won ? `🔥 Streak ${streak}! ${coinMsg}` : `💥 Streak Ended at ${streak}! ${coinMsg}`)}</div>
          <button type="button" class="btn gold sm" id="bcNextBtn">${won ? 'Keep Streak ›' : 'Finish Run ›'}</button>
        `;
        $('#bcNextBtn', host).onclick = () => {
          if (won) { roundNo++; renderRound(); }
          else showFinalSummary();
        };
      };

      startRoundTimer(data.timerSec || SR.BUDGET_ROUND_TIMER_SEC, () => resolveSasta('', true));
      $$('[data-bcsm]', host).forEach(btn => {
        btn.onclick = () => resolveSasta(btn.dataset.bcsm, false);
      });
      return;
    }

    // Mode 4: Closest Guess Wins (Simultaneous Reveal + Reaction Stickers)
    const pool = SR.BUDGET_ITEMS.filter(i => i.price >= 80 && i.price <= 2250000);
    const drawn = typeof SR.drawPersistentQuestions === 'function'
      ? SR.drawPersistentQuestions('bc_closest_guess', pool, 1, i => i.id)
      : [pool[Math.floor(Math.random() * pool.length)]];
    const item = drawn[0] || pool[0];
    curRoundData = { item, targetItem: item };
    if ($('#bcCounterLbl', view)) $('#bcCounterLbl', view).textContent = 'CLOSEST GUESS WINS · LOCK YOUR PRICE';
    if ($('#bcCounterVal', view)) $('#bcCounterVal', view).textContent = '₹ ???';
    speakRound({
      enText: `Closest Guess! How much does ${item.name} cost in Rupees? Lock your guess!`,
      hiSpoken: `क्लोज़ेस्ट गेस राउंड! ${item.hiSpoken} इसकी कीमत रुपये में कितनी है? अपना अंदाज़ा लॉक कीजिए!`,
      bnSpoken: `ক্লোজেস্ট গেস! ${item.bnSpoken} এটার দাম কত টাকা? আপনার অনুমান লক করুন!`
    });

    const quickChoices = [
      Math.max(10, Math.round(item.price * 0.5)),
      Math.max(10, Math.round(item.price * 0.9)),
      Math.max(10, Math.round(item.price * 1.15)),
      Math.max(10, Math.round(item.price * 1.8))
    ].sort((a, b) => a - b);

    host.innerHTML = `
      <div class="bc-single-showcase">
        <div class="bc-art-box lg">${budgetItemArtSvg(item.icon)}</div>
        <span class="bc-cat-lbl">${esc(item.category)}</span>
        <b class="bc-item-name lg">${esc(item.name)}</b>
      </div>
      <div class="bc-guess-form" id="bcGuessForm">
        <div class="bc-guess-in-row">
          <span class="bc-rs-pre">₹</span>
          <input type="number" id="bcGuessInput" min="1" max="50000000" placeholder="Enter exact price in ₹" value="${quickChoices[1]}" aria-label="Your price guess in Rupees">
          <button type="button" class="btn gold" id="bcLockGuessBtn" data-testid="bc-lock-guess">Lock Guess</button>
        </div>
        <div class="bc-quick-chips">
          ${quickChoices.map(v => `<button type="button" class="bc-qchip" data-bcqval="${v}">${SR.formatINR(v)}</button>`).join('')}
        </div>
      </div>
      <div id="bcRevealBoard"></div>
    `;

    $$('[data-bcqval]', host).forEach(b => {
      b.onclick = () => {
        const inp = $('#bcGuessInput', host);
        if (inp) inp.value = b.dataset.bcqval;
        if (typeof playSfx === 'function') playSfx('tap');
      };
    });

    const renderClosestOutcome = (entries) => {
      const res = SR.evaluateClosestGuesses(item.price, entries);
      const won = res.winnerId === myUid || res.winnerId === 'me';
      animateRollingCounter(10, item.price, 'ACTUAL MARKET PRICE', won);
      if (won) {
        wins++; streak++; bestStreak = Math.max(bestStreak, streak);
        score += 110 + streak * 10;
        if (typeof playSfx === 'function') playSfx('fanfare');
        triggerFireworks(false);
      } else {
        streak = 0;
        if (typeof playSfx === 'function') playSfx('funnyBuzzer');
      }
      const coinMsg = settleRoundBet(won, false);
      syncHud();
      if ($('#bcGuessForm', host)) $('#bcGuessForm', host).hidden = true;
      const rev = $('#bcRevealBoard', host);
      if (!rev) return;
      rev.innerHTML = `
        <div class="bc-reveal-list" data-testid="bc-simultaneous-reveal">
          ${res.ranked.map((r, idx) => `
            <div class="bc-rev-row ${idx === 0 ? 'winner' : ''} ${(r.id === myUid || r.id === 'me') ? 'me' : ''}">
              <span>${idx === 0 ? '👑' : `#${idx + 1}`} <b>${esc(r.name)}</b></span>
              <span class="bc-rev-num">${SR.formatINR(r.guess)} <small>(±${SR.formatINR(r.diff)})</small></span>
            </div>
          `).join('')}
        </div>
        <div class="bc-reaction-bar" aria-label="Multiplayer Banter Stickers">
          <small>React:</small>
          ${['😂', '😱', '🔥', '💀'].map(em => `<button type="button" class="bc-react-btn" data-bcreact="${em}" aria-label="Send reaction ${em}">${em}</button>`).join('')}
        </div>
        <div class="bc-feedback-bar">
          <div class="bc-fb-pill ${won ? 'ok' : 'bad'}">${won ? `🏆 Closest Guess! ${coinMsg}` : `😅 ${esc(res.ranked[0].name)} was closer · ${coinMsg}`}</div>
          <button type="button" class="btn gold sm" id="bcNextBtn">${roundNo >= maxRounds ? 'See Results ›' : 'Next Round ›'}</button>
        </div>
      `;
      $$('[data-bcreact]', rev).forEach(rb => {
        rb.onclick = () => {
          if (typeof playSfx === 'function') playSfx('reactionPop');
          const floater = document.createElement('span');
          floater.className = 'bc-float-sticker';
          floater.textContent = rb.dataset.bcreact;
          floater.style.left = (25 + Math.random() * 50) + '%';
          $('#bcArena', view).appendChild(floater);
          setTimeout(() => floater.remove(), 1100);
        };
      });
      $('#bcNextBtn', rev).onclick = () => { liveClosestRevealFn = null; roundNo++; renderRound(); };
    };

    const submitClosest = () => {
      if (locked || over) return;
      const myGuess = Math.max(1, Math.round(Number($('#bcGuessInput', host)?.value || 0)));
      locked = true;
      stopRoundTimer();

      if (isLiveOnline) {
        // HARD BLOCK: NEVER inject fake Aria Nova / Leo Blaze bots in a live friend room!
        liveClosestGuesses[roundNo] = liveClosestGuesses[roundNo] || {};
        liveClosestGuesses[roundNo][myUid] = { id: myUid, name: myName, guess: myGuess };
        if (liveSync) {
          liveSync.pushState({
            type: 'closest_guess',
            roundNo,
            itemId: item.id,
            entry: { id: myUid, name: myName, guess: myGuess }
          });
        }
        const expectedCount = Math.max(2, 1 + realRemotePlayers.length);
        const tryRevealLive = () => {
          const map = liveClosestGuesses[roundNo] || {};
          const entries = Object.values(map);
          if (entries.length >= expectedCount) {
            liveClosestRevealFn = null;
            renderClosestOutcome(entries);
          } else {
            if ($('#bcGuessForm', host)) $('#bcGuessForm', host).hidden = true;
            const waitingNames = realRemotePlayers
              .filter(p => !map[p.uid])
              .map(p => p.name)
              .join(', ') || 'Friend';
            const rev = $('#bcRevealBoard', host);
            if (rev) {
              rev.innerHTML = `
                <div class="bc-feedback-bar" data-testid="bc-waiting-friend">
                  <div class="bc-fb-pill ok">🔒 Your guess (${SR.formatINR(myGuess)}) locked! Waiting for ${esc(waitingNames)}…</div>
                </div>
              `;
            }
          }
        };
        liveClosestRevealFn = tryRevealLive;
        tryRevealLive();
        return;
      }

      const bot1Guess = Math.max(10, Math.round(item.price * (0.78 + Math.random() * 0.44)));
      const bot2Guess = Math.max(10, Math.round(item.price * (0.68 + Math.random() * 0.64)));
      renderClosestOutcome([
        { id: myUid, name: myName, guess: myGuess },
        { id: 'aria', name: 'Aria Nova', guess: bot1Guess },
        { id: 'leo', name: 'Leo Blaze', guess: bot2Guess }
      ]);
    };
    $('#bcLockGuessBtn', host).onclick = submitClosest;
    startRoundTimer(12, submitClosest);
  };

  const resetGame = (modeId) => {
    stopRoundTimer();
    cancelAnimationFrame(rollRaf);
    rollRaf = 0;
    clearTimeout(curtainTimer);
    clearTimeout(confettiTimer);
    const confLayer = $('#bcConfetti', view);
    if (confLayer) confLayer.innerHTML = '';
    const boxEl = $('#bcCounterBox', view);
    if (boxEl) boxEl.classList.remove('jackpot');
    activeMode = modeId || activeMode;
    roundNo = 1;
    score = 0;
    wins = 0;
    streak = 0;
    bestStreak = 0;
    jackpots = 0;
    life5050 = true;
    lifeHint = true;
    over = false;
    locked = false;
    sastaAnchor = null;
    usedIds = loadModeSeen(activeMode);
    renderRound();
  };

  $$('[data-bcmode]', view).forEach(b => {
    b.onclick = () => {
      if (typeof playSfx === 'function') playSfx('tap');
      resetGame(b.dataset.bcmode);
    };
  });

  $$('[data-bcbet]', view).forEach(b => {
    b.onclick = () => {
      const amt = Number(b.dataset.bcbet) || 0;
      const v = SR.validateShowBet(amt, me.coins);
      if (!v.ok) return toast(v.reason);
      roundBet = amt;
      if (typeof playSfx === 'function') playSfx('tap');
      syncHud();
    };
  });

  $('#bcLife5050', view).onclick = () => {
    if (!life5050 || locked || over || !curRoundData) return;
    life5050 = false;
    if (typeof playSfx === 'function') playSfx('chestOpen');
    const res = SR.applyBudgetLifeline('fifty_fifty', curRoundData);
    const hintBox = $('#bcHintBox', view);
    if (hintBox) {
      hintBox.hidden = false;
      hintBox.textContent = `✂️ 50-50 Lifeline: ${res.message}`;
    }
    if (activeMode === 'ten_vs_cr' && typeof curRoundData.jackpotIndex === 'number') {
      const target = view.querySelector(`[data-bcpick="${curRoundData.jackpotIndex}"]`);
      if (target) target.classList.add('lifeline-glow');
    } else if (activeMode === 'asli_nakli' && typeof curRoundData.correctIdx === 'number') {
      const target = view.querySelector(`[data-bcopt="${curRoundData.correctIdx}"]`);
      if (target) target.classList.add('lifeline-glow');
    } else if (activeMode === 'sasta_mehnga' && curRoundData.answer) {
      const target = view.querySelector(`[data-bcsm="${curRoundData.answer}"]`);
      if (target) target.classList.add('lifeline-glow');
    }
    syncHud();
  };

  $('#bcLifeHint', view).onclick = () => {
    if (!lifeHint || locked || over || !curRoundData) return;
    lifeHint = false;
    if (typeof playSfx === 'function') playSfx('chestOpen');
    const res = SR.applyBudgetLifeline('hint', curRoundData);
    const hintBox = $('#bcHintBox', view);
    if (hintBox) {
      hintBox.hidden = false;
      hintBox.textContent = res.message;
    }
    syncHud();
  };

  if (isLiveOnline && bcRoomId && typeof window.createLiveMatchSync === 'function') {
    liveSync = window.createLiveMatchSync({
      roomId: bcRoomId,
      roomCode: bcRoomCode,
      gameId: 'budget_clash',
      myUid,
      myName,
      oppUids: realRemotePlayers.map(p => p.uid),
      onLeaveRequest: () => view.close(),
      onState: (payload) => {
        if (over || !payload) return;
        if (payload.type === 'closest_guess' && payload.entry && payload.entry.id) {
          const rNo = Number(payload.roundNo || roundNo);
          liveClosestGuesses[rNo] = liveClosestGuesses[rNo] || {};
          liveClosestGuesses[rNo][payload.entry.id] = payload.entry;
          if (rNo === roundNo && typeof liveClosestRevealFn === 'function') {
            liveClosestRevealFn();
          }
        }
      }
    });
    liveSync.mountConnectionBanner($('#bcArena', view));
  }

  view.onclose = () => {
    over = true;
    stopRoundTimer();
    cancelAnimationFrame(rollRaf);
    clearTimeout(curtainTimer);
    clearTimeout(confettiTimer);
    if (liveSync) liveSync.destroy();
    if (typeof VoiceNarrator !== 'undefined') VoiceNarrator.stop();
    if (typeof clearMyLiveActivity === 'function') clearMyLiveActivity();
  };

  renderRound();
  return view;
}
window.launchBudgetClash = launchBudgetClash;
