"use strict";
/* =====================================================================
   COMPETITIVE ARENA GAMES (v16) · FULL-SCREEN VIEW + FREE & STAKE MODES
   · JACKAROO ROYAL & UNO CLASH + 5 CLASSICS · SMART BOT AI
   · 1v1 COIN STAKE MATCHES (10% FEE) · ANTI-FARMING CAP · QUICK VOICE
   ===================================================================== */

const ARENA_GAMES = [
  {
    id: 'jackaroo',
    name: 'Jackaroo Royal',
    tag: '2v2 / 1v1',
    live: 92,
    accent: '#d97706',
    accent2: '#7c2d12',
    badge: 'Marbles & Cards',
    desc: '3D Marbles · A/K/Q/J/7/4/10',
    modes: [
      { id: '1v1', label: '2 Players (1v1)' },
      { id: '2v2', label: '4 Players (2v2)' }
    ]
  },
  {
    id: 'uno',
    name: 'UNO Garden',
    tag: 'Classic / Fun',
    live: 108,
    accent: '#78b824',
    accent2: '#1575e8',
    badge: 'Stack & ONE!',
    desc: 'Classic · Fun +Stack · Voice',
    modes: [
      { id: 'classic', label: 'Classic (4P)' },
      { id: 'fun', label: 'Fun Play (+Stack)' },
      { id: '1v1', label: '1v1 Duel' }
    ]
  },
  {
    id: 'pool_8ball',
    name: '8-Ball Pool 1v1',
    tag: 'HD Physics',
    live: 74,
    accent: '#10b981',
    accent2: '#064e3b',
    badge: 'Pro Billiards',
    desc: 'Mahogany Felt · Laser Cue'
  },
  {
    id: 'blitz_dots',
    name: 'Blitz Dots 1v1',
    tag: 'Tactical AI',
    live: 51,
    accent: '#22d3ee',
    accent2: '#3730a3',
    badge: '1v1 Stake',
    desc: 'Brass Grid · Chain Boxes'
  },
  {
    id: 'ludo_snakes',
    name: 'Ludo Express',
    tag: '3D Board',
    live: 63,
    accent: '#a855f7',
    accent2: '#1d4ed8',
    badge: '3D Dice & Pawns',
    desc: '24-Tile Board · Boost Stars'
  },
  {
    id: 'squad_arena',
    name: 'Squad Trivia 1v1',
    tag: 'Glass Stage',
    live: 84,
    accent: '#f59e0b',
    accent2: '#be185d',
    badge: '1v1 Stake',
    desc: '5-Round Blitz · Smart Rival'
  },
  {
    id: 'undercover',
    name: 'Undercover Spy',
    tag: 'Mic Pass',
    live: 69,
    accent: '#f43f5e',
    accent2: '#5b21b6',
    badge: 'Turn Mic',
    desc: 'Detective Table · Find Spy'
  }
];

const ARENA_STAKES = [0, 25, 50, 100, 250];
const ARENA_FEE_RATE = 0.10;
const BOT_DAILY_WIN_CAP = 6;
const BOT_DAILY_COIN_CAP = 240;
const BOT_COOLDOWN_MS = 30000;

function calcArenaStakePayout(stakeRaw) {
  const stake = Math.max(0, Math.floor(Number(stakeRaw) || 0));
  if (stake <= 0) return { stake: 0, grossPot: 0, platformFee: 0, winnerPayout: 0, feePercent: 0 };
  const grossPot = stake * 2;
  const platformFee = Math.max(1, Math.round(grossPot * ARENA_FEE_RATE));
  const winnerPayout = Math.max(stake, grossPot - platformFee);
  return { stake, grossPot, platformFee, winnerPayout, feePercent: Math.round(ARENA_FEE_RATE * 100) };
}

function getBotFarmState() {
  const d = today();
  const cur = me.botFarmCap && typeof me.botFarmCap === 'object' ? me.botFarmCap : {};
  if (cur.dayKey !== d) {
    return { dayKey: d, winsToday: 0, coinsToday: 0, lastRewardAt: 0 };
  }
  return {
    dayKey: d,
    winsToday: Math.max(0, Number(cur.winsToday || 0)),
    coinsToday: Math.max(0, Number(cur.coinsToday || 0)),
    lastRewardAt: Math.max(0, Number(cur.lastRewardAt || 0))
  };
}

function previewBotCapStatus() {
  const st = getBotFarmState();
  const now = Date.now();
  const cdMs = st.lastRewardAt > 0 && (now - st.lastRewardAt) < BOT_COOLDOWN_MS
    ? BOT_COOLDOWN_MS - (now - st.lastRewardAt)
    : 0;
  const remWins = Math.max(0, BOT_DAILY_WIN_CAP - st.winsToday);
  const remCoins = Math.max(0, BOT_DAILY_COIN_CAP - st.coinsToday);
  return { ...st, cdMs, remWins, remCoins };
}

function awardFreeBotCoins(baseCoins, expReward) {
  const st = getBotFarmState();
  const now = Date.now();
  const cdMs = st.lastRewardAt > 0 && (now - st.lastRewardAt) < BOT_COOLDOWN_MS
    ? BOT_COOLDOWN_MS - (now - st.lastRewardAt)
    : 0;
  const remWins = Math.max(0, BOT_DAILY_WIN_CAP - st.winsToday);
  const remCoins = Math.max(0, BOT_DAILY_COIN_CAP - st.coinsToday);

  let grantedCoins = 0;
  let capNote = '';
  if (cdMs > 0) {
    capNote = `Anti-farm cooldown (${Math.ceil(cdMs / 1000)}s) · +${expReward} EXP`;
  } else if (remWins <= 0 || remCoins <= 0) {
    capNote = `Daily bot cap (${BOT_DAILY_COIN_CAP} 🪙) reached · +${expReward} EXP`;
  } else {
    const mult = st.winsToday < 3 ? 1 : 0.6;
    grantedCoins = Math.min(remCoins, Math.max(1, Math.round(baseCoins * mult)));
    me.botFarmCap = {
      dayKey: st.dayKey,
      winsToday: st.winsToday + 1,
      coinsToday: st.coinsToday + grantedCoins,
      lastRewardAt: now
    };
    saveMe();
    capNote = mult < 1 ? `+${grantedCoins} 🪙 (60% cap rate)` : `+${grantedCoins} 🪙`;
  }
  addReward(grantedCoins, expReward, null, false, { silentSfx: true });
  return { grantedCoins, capNote };
}

function settleArenaMatchOutcome(outcome, stake, baseFreeCoins, expWin, expLose) {
  if (typeof bumpStat === 'function') bumpStat('games_played');
  const pay = calcArenaStakePayout(stake);
  if (stake > 0) {
    if (outcome === 'win') {
      if (typeof bumpStat === 'function') bumpStat('duel_win');
      addReward(pay.winnerPayout, expWin, null, false, { silentSfx: true });
      if (typeof addClanGlory === 'function') addClanGlory(Math.max(20, Math.round(stake * 0.4)));
      if (typeof playSfx === 'function') playSfx('duelWin');
      return { headline: `🏆 Victory! +${fmtNum(pay.winnerPayout)} 🪙`, detail: `Pot ${fmtNum(pay.grossPot)} − ${pay.feePercent}% fee (${fmtNum(pay.platformFee)} 🪙)` };
    }
    if (outcome === 'tie') {
      addReward(stake, Math.round(expWin * 0.6), null, true, { silentSfx: true });
      if (typeof playSfx === 'function') playSfx('coin');
      return { headline: `🤝 Draw · ${fmtNum(stake)} 🪙 Refunded`, detail: 'Full stake returned' };
    }
    addReward(0, expLose, null, false, { silentSfx: true });
    if (typeof playSfx === 'function') playSfx('matchLose');
    return { headline: `Defeat · −${fmtNum(stake)} 🪙`, detail: `Bot claimed pot · +${expLose} EXP` };
  }

  if (outcome === 'win') {
    if (typeof bumpStat === 'function') bumpStat('duel_win');
    const res = awardFreeBotCoins(baseFreeCoins, expWin);
    if (typeof addClanGlory === 'function') addClanGlory(15);
    if (typeof playSfx === 'function') playSfx('duelWin');
    return { headline: `🏆 Victory! ${res.capNote}`, detail: `+${expWin} EXP` };
  }
  if (outcome === 'tie') {
    const res = awardFreeBotCoins(Math.round(baseFreeCoins * 0.5), Math.round(expWin * 0.6));
    if (typeof playSfx === 'function') playSfx('coin');
    return { headline: `🤝 Draw! ${res.capNote}`, detail: 'Close match' };
  }
  addReward(0, expLose, null, false, { silentSfx: true });
  if (typeof playSfx === 'function') playSfx('matchLose');
  return { headline: `Bot Wins`, detail: `+${expLose} EXP · Rematch anytime` };
}

function spawnArenaSparks(hostEl, color = '#ffd36b', count = 10) {
  if (!hostEl) return;
  const wrap = document.createElement('div');
  wrap.className = 'arena-sparks-burst';
  wrap.setAttribute('aria-hidden', 'true');
  let html = '';
  for (let i = 0; i < count; i++) {
    const ang = Math.round((360 / count) * i);
    const dist = 30 + (i % 3) * 14;
    html += `<i style="--ang:${ang}deg;--dist:${dist}px;--sp-c:${color}"></i>`;
  }
  wrap.innerHTML = html;
  hostEl.appendChild(wrap);
  setTimeout(() => { if (wrap.parentNode) wrap.remove(); }, 760);
}

function renderArenaBannerArt(g) {
  const id = esc(g.id);
  const icons = {
    jackaroo: `<g transform="translate(172,14)">
      <rect x="6" y="6" width="126" height="104" rx="22" fill="#3e1c0a" stroke="#fbbf24" stroke-width="3.5"/>
      <circle cx="69" cy="58" r="38" fill="#0f5132" stroke="#f59e0b" stroke-width="2.5"/>
      <circle cx="48" cy="46" r="10.5" fill="#38bdf8" stroke="#fff" stroke-width="1.5"/>
      <circle cx="90" cy="46" r="10.5" fill="#f43f5e" stroke="#fff" stroke-width="1.5"/>
      <circle cx="69" cy="74" r="10.5" fill="#10b981" stroke="#fff" stroke-width="1.5"/>
      <rect x="95" y="64" width="32" height="44" rx="6" transform="rotate(14 111 86)" fill="#fff" stroke="#fbbf24" stroke-width="1.8"/>
      <text x="111" y="92" text-anchor="middle" font-size="14" font-weight="900" fill="#dc2626" transform="rotate(14 111 86)">A♥</text>
    </g>`,
    uno: `<g transform="translate(174,14)">
      <rect x="12" y="18" width="54" height="78" rx="11" transform="rotate(-14 39 57)" fill="#ef4444" stroke="#fff" stroke-width="3"/>
      <text x="39" y="64" text-anchor="middle" font-size="22" font-weight="900" fill="#fff" transform="rotate(-14 39 57)">+2</text>
      <rect x="64" y="14" width="56" height="82" rx="11" transform="rotate(12 92 55)" fill="#111827" stroke="#fef08a" stroke-width="3"/>
      <text x="92" y="84" text-anchor="middle" font-size="13" font-weight="900" fill="#fef08a" transform="rotate(12 92 55)">+4</text>
    </g>`,
    blitz_dots: `<g transform="translate(185,22)">
      <rect x="6" y="6" width="94" height="94" rx="18" fill="#1e120b" stroke="#fbbf24" stroke-width="3"/>
      <line x1="28" y1="28" x2="78" y2="28" stroke="#22d3ee" stroke-width="5.5" stroke-linecap="round"/>
      <line x1="28" y1="28" x2="28" y2="78" stroke="#22d3ee" stroke-width="5.5" stroke-linecap="round"/>
      <line x1="78" y1="28" x2="78" y2="78" stroke="#f43f5e" stroke-width="5.5" stroke-linecap="round"/>
      <line x1="28" y1="78" x2="78" y2="78" stroke="#ffd36b" stroke-width="5.5" stroke-linecap="round"/>
    </g>`,
    pool_8ball: `<g transform="translate(174,18)">
      <rect x="0" y="12" width="128" height="82" rx="16" fill="#065f46" stroke="#92400e" stroke-width="6"/>
      <circle cx="44" cy="54" r="17" fill="#111827" stroke="#ffffff" stroke-width="2"/>
      <text x="44" y="57.5" text-anchor="middle" font-size="10" font-weight="900" fill="#fff">8</text>
    </g>`,
    undercover: `<g transform="translate(178,18)">
      <circle cx="62" cy="54" r="46" fill="rgba(244,63,94,.26)" stroke="#fda4af" stroke-width="2.2"/>
      <path d="M30 48c8-18 56-18 64 0-12 6-52 6-64 0z" fill="#111827" stroke="#ffd36b" stroke-width="2"/>
    </g>`,
    squad_arena: `<g transform="translate(176,18)">
      <polygon points="62,6 76,38 110,42 84,65 92,99 62,82 32,99 40,65 14,42 48,38" fill="url(#gpStar_${id})" stroke="#fff" stroke-width="2.2" stroke-linejoin="round"/>
    </g>`,
    ludo_snakes: `<g transform="translate(182,18)">
      <rect x="8" y="8" width="90" height="90" rx="22" fill="#fffbeb" stroke="#fbbf24" stroke-width="4.5"/>
      <circle cx="32" cy="32" r="8.5" fill="#dc2626"/><circle cx="74" cy="32" r="8.5" fill="#7c3aed"/>
      <circle cx="53" cy="53" r="8.5" fill="#f59e0b"/>
      <circle cx="32" cy="74" r="8.5" fill="#2563eb"/><circle cx="74" cy="74" r="8.5" fill="#16a34a"/>
    </g>`
  };
  return `<svg class="gp-svg" viewBox="0 0 320 142" preserveAspectRatio="xMidYMid slice" fill="none" aria-hidden="true">
    <defs>
      <linearGradient id="gpBg_${id}" x1="0" y1="0" x2="320" y2="142" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="${g.accent}"/>
        <stop offset="55%" stop-color="${g.accent2}"/>
        <stop offset="100%" stop-color="#0b1024"/>
      </linearGradient>
      <linearGradient id="gpStar_${id}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#fef08a"/><stop offset="100%" stop-color="#f97316"/>
      </linearGradient>
    </defs>
    <rect width="320" height="142" fill="url(#gpBg_${id})"/>
    ${icons[g.id] || ''}
  </svg>`;
}

function renderArenaPostersGrid(container) {
  if (!container) return;
  if (container.dataset.arenaMounted === '1' && container.children.length === ARENA_GAMES.length) return;
  container.dataset.arenaMounted = '1';
  container.innerHTML = ARENA_GAMES.map(g => `
    <button type="button" class="arena-poster-card glossy-card" data-arenagame="${esc(g.id)}">
      <div class="arena-poster-art">
        ${renderArenaBannerArt(g)}
        <span class="ap-tag">${esc(g.tag)}</span>
        <span class="ap-live">● ${g.live}</span>
        <div class="ap-overlay-copy">
          <b>${esc(g.name)}</b>
          <small>${esc(g.desc)}</small>
        </div>
      </div>
      <div class="arena-poster-foot">
        <span class="ap-badge">${esc(g.badge)}</span>
        <span class="ap-play-cta">Play →</span>
      </div>
    </button>
  `).join('');

  container.onclick = e => {
    const card = e.target.closest('[data-arenagame]');
    if (card && card.dataset.arenagame) {
      if (typeof playSfx === 'function') playSfx('tap');
      openArenaGame(card.dataset.arenagame);
    }
  };
}

function openRivalChallenge(targetUid) {
  const rival = allUsers().find(u => u.uid === targetUid);
  const m = modal(`⚔️ Challenge ${esc(rival?.name || 'Rival')}`, `
    <div class="list" style="gap:8px">
      ${ARENA_GAMES.map(g => `<button type="button" class="btn ghost full" data-rvg="${esc(g.id)}" style="justify-content:space-between"><span>${esc(g.name)}</span><span class="dur-pill">${esc(g.badge)}</span></button>`).join('')}
    </div>
  `);
  $$('[data-rvg]', m).forEach(b => {
    b.onclick = () => {
      const gid = b.dataset.rvg;
      m.close();
      openArenaGame(gid, targetUid);
    };
  });
}

/* =====================================================================
   DEDICATED FULL-SCREEN GAME VIEW ENGINE
   ===================================================================== */
let activeFullScreenGame = null;

function closeFullScreenGameView(opts) {
  const o = opts || {};
  const prev = activeFullScreenGame;
  activeFullScreenGame = null;
  if (prev && typeof prev.onclose === 'function' && !o.skipCallback) {
    try { prev.onclose(); } catch {}
  }
  const root = document.getElementById('gameFsRoot');
  if (root) {
    root.classList.remove('open');
    root.hidden = true;
    root.innerHTML = '';
    root.removeAttribute('data-game-id');
  }
  document.body.classList.remove('game-fs-lock');
  if (typeof QuickVoice !== 'undefined' && typeof QuickVoice.closePanel === 'function') {
    QuickVoice.closePanel();
  }
}
window.closeFullScreenGameView = closeFullScreenGameView;

function openFullScreenGameView(opts) {
  const o = opts || {};
  if (activeFullScreenGame) {
    closeFullScreenGameView();
  }
  const root = document.getElementById('gameFsRoot');
  if (!root) {
    return modal(o.title || 'Game', o.html || '', o.className || '');
  }

  const sfxMuted = typeof SFX !== 'undefined' && typeof SFX.isMuted === 'function' ? SFX.isMuted() : false;
  const sfxIcon = typeof SFX !== 'undefined' && typeof SFX.iconSvg === 'function'
    ? SFX.iconSvg(sfxMuted)
    : (sfxMuted ? '🔇' : '🔊');

  root.dataset.gameId = o.gameId || 'game';
  root.innerHTML = `
    <div class="gfs-shell ${esc(o.themeClass || '')} ${esc(o.className || '')}" data-testid="game-fullscreen" data-game-id="${esc(o.gameId || 'game')}">
      <header class="gfs-header">
        <div class="gfs-h-left">
          <button type="button" class="gfs-icon-btn" id="gfsBackBtn" aria-label="Exit game">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <div class="gfs-h-titles">
            <b class="gfs-title">${esc(o.title || 'Game')}</b>
            <small class="gfs-sub" id="gfsSubMeta">${esc(o.subMeta || '')}</small>
          </div>
        </div>
        <div class="gfs-h-right">
          <span class="gfs-status-pill ${esc(o.statusTone || 'turn')}" id="gfsStatusPill">${esc(o.statusText || 'Ready')}</span>
          <button type="button" class="gfs-icon-btn ${sfxMuted ? 'is-muted' : ''}" id="gfsSfxBtn" data-sfx-toggle="1" aria-pressed="${sfxMuted ? 'true' : 'false'}" aria-label="${sfxMuted ? 'Unmute Sound FX' : 'Mute Sound FX'}" title="Toggle Sound FX">
            <span class="sfx-ico" data-sfx-ico="1">${sfxIcon}</span>
          </button>
          <button type="button" class="gfs-icon-btn gfs-exit-x" id="gfsExitBtn" aria-label="Close game">✕</button>
        </div>
      </header>
      <div class="gfs-stage-scroll">
        <div class="gfs-stage-inner" id="gfsStageInner">${o.html || ''}</div>
      </div>
    </div>
  `;

  root.hidden = false;
  document.body.classList.add('game-fs-lock');
  requestAnimationFrame(() => root.classList.add('open'));
  if (typeof pushBackGuardState === 'function') pushBackGuardState('game:' + (o.gameId || 'play'));

  const shell = root.firstElementChild;
  const ctrl = shell;
  ctrl.root = root;
  ctrl.body = root.querySelector('#gfsStageInner');
  ctrl.onclose = null;
  ctrl.close = () => {
    if (activeFullScreenGame === ctrl) closeFullScreenGameView();
  };
  ctrl.setStatus = (text, tone) => {
    const pill = root.querySelector('#gfsStatusPill');
    if (!pill) return;
    pill.textContent = text;
    pill.className = `gfs-status-pill ${tone || 'turn'}`;
  };
  ctrl.setSubMeta = (text) => {
    const sub = root.querySelector('#gfsSubMeta');
    if (sub) sub.textContent = text || '';
  };

  const exitAction = () => {
    if (typeof playSfx === 'function') playSfx('tap');
    ctrl.close();
  };
  root.querySelector('#gfsBackBtn').onclick = exitAction;
  root.querySelector('#gfsExitBtn').onclick = exitAction;
  root.querySelector('#gfsSfxBtn').onclick = () => {
    if (typeof SFX !== 'undefined' && typeof SFX.toggle === 'function') {
      const off = SFX.toggle();
      const btn = root.querySelector('#gfsSfxBtn');
      if (btn) {
        btn.classList.toggle('is-muted', off);
        btn.setAttribute('aria-pressed', off ? 'true' : 'false');
        const ico = btn.querySelector('.sfx-ico');
        if (ico && typeof SFX.iconSvg === 'function') ico.innerHTML = SFX.iconSvg(off);
      }
      toast(off ? 'Sound muted' : 'Sound on');
    }
  };

  activeFullScreenGame = ctrl;
  return ctrl;
}
window.openFullScreenGameView = openFullScreenGameView;

/* Pre-Match Full-Screen Launch View: Free Bot (Default) + Smart Bot Paid Stake */
function openArenaGame(gameId, rivalUid) {
  const g = ARENA_GAMES.find(x => x.id === gameId) || ARENA_GAMES[0];
  const rival = rivalUid ? allUsers().find(u => u.uid === rivalUid) : null;
  if (g.id === 'jackaroo' && typeof openJackarooLobby === 'function') {
    if (rival && typeof openJackarooTableLobby === 'function') {
      openJackarooTableLobby({ mode: '1v1', tier: '1v1 | Junior', stake: 0, rival });
    } else {
      openJackarooLobby({ rival });
    }
    return;
  }
  const cap = previewBotCapStatus();
  let playType = 'free';
  let selectedStake = 0;
  let lastPaidStake = 50;
  let selectedMode = g.modes ? g.modes[0].id : '1v1';

  const modeHtml = g.modes
    ? `<div class="gfs-setup-block">
        <div class="gfs-setup-lbl">Format</div>
        <div class="arena-mode-pills">
          ${g.modes.map((md, i) => `<button type="button" class="mode-pill ${i === 0 ? 'on' : ''}" data-armode="${esc(md.id)}">${esc(md.label)}</button>`).join('')}
        </div>
      </div>`
    : '';

  const view = openFullScreenGameView({
    gameId: g.id + '_lobby',
    title: g.name,
    subMeta: rival ? `vs ${rival.name}` : g.badge,
    statusText: 'Setup',
    statusTone: 'neutral',
    themeClass: 'gfs-theme-lobby',
    html: `
      <div class="gfs-lobby-card">
        <div class="gfs-lobby-banner">
          ${renderArenaBannerArt(g)}
          <div class="gfs-lobby-title">
            <h2>${esc(g.name)}</h2>
            <span>${esc(g.desc)}</span>
          </div>
        </div>

        ${modeHtml}

        <div class="gfs-setup-block">
          <div class="gfs-setup-head">
            <span class="gfs-setup-lbl">Match Type</span>
            <span class="gfs-wallet-txt">Wallet: <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9.5" fill="#ffd36b" stroke="#b45309" stroke-width="1.8"/><circle cx="12" cy="12" r="6" stroke="#92400e" stroke-width="1.3"/></svg><b>${fmtNum(me.coins)}</b></span>
          </div>
          <div class="gfs-tier-switch" role="tablist" aria-label="Match Type">
            <button type="button" class="gfs-tier-btn on" data-tier="free">
              <b>Free Bot</b>
              <small>Standard AI · Cap ${cap.winsToday}/${BOT_DAILY_WIN_CAP}</small>
            </button>
            <button type="button" class="gfs-tier-btn" data-tier="paid">
              <b>Smart Bot Stake</b>
              <small>Pro AI · Win 90% Pot</small>
            </button>
          </div>
        </div>

        <div class="gfs-setup-block" id="arStakeWrap" hidden>
          <div class="gfs-setup-head">
            <span class="gfs-setup-lbl">Select Coin Stake</span>
            <span class="gfs-fee-tag">10% Cut</span>
          </div>
          <div class="arena-stake-pills gfs-paid-pills" id="arStakePills">
            ${ARENA_STAKES.filter(s => s > 0).map(s => `<button type="button" class="stake-pill ${s === lastPaidStake ? 'on' : ''}" data-stake="${s}">${s} 🪙</button>`).join('')}
          </div>
        </div>

        <div class="gfs-payout-strip" id="arFeeMeta"></div>

        <button type="button" class="btn gold full gfs-start-cta" id="arStartMatchBtn">Play Free Match</button>
        ${(g.id === 'jackaroo' || g.id === 'uno') ? `
          <div class="gfs-jk-lobby-extras">
            <button type="button" class="btn ghost sm" id="arExtraInviteBtn">👥 Invite Friend</button>
            <button type="button" class="btn ghost sm" id="arExtraRulesBtn">📖 Rules &amp; Cards</button>
          </div>
        ` : ''}
      </div>
    `
  });

  const syncStakeUi = () => {
    const activeStake = playType === 'paid' ? lastPaidStake : 0;
    selectedStake = activeStake;
    const pay = calcArenaStakePayout(activeStake);
    $$('[data-tier]', view).forEach(b => b.classList.toggle('on', b.dataset.tier === playType));
    $$('[data-stake]', view).forEach(b => b.classList.toggle('on', Number(b.dataset.stake) === lastPaidStake));
    $$('[data-armode]', view).forEach(b => b.classList.toggle('on', b.dataset.armode === selectedMode));
    const stakeWrap = $('#arStakeWrap', view);
    if (stakeWrap) stakeWrap.hidden = playType !== 'paid';

    const meta = $('#arFeeMeta', view);
    const btn = $('#arStartMatchBtn', view);
    if (playType === 'free') {
      const cdTxt = cap.cdMs > 0 ? ` · Cooldown ${Math.ceil(cap.cdMs / 1000)}s` : '';
      meta.innerHTML = `<span>Free Bot Play</span> · <b>${cap.remWins}</b> daily wins left (${cap.coinsToday}/${BOT_DAILY_COIN_CAP} 🪙)${cdTxt}`;
      btn.textContent = `Play Free · ${g.name}`;
      view.setStatus('Free Bot', 'ok');
    } else {
      const enough = me.coins >= activeStake;
      meta.innerHTML = `Pot <b>${fmtNum(pay.grossPot)} 🪙</b> · Fee <b>−${fmtNum(pay.platformFee)}</b> · Win <b style="color:var(--ok)">+${fmtNum(pay.winnerPayout)} 🪙</b>${enough ? '' : ' · <b style="color:var(--red)">Low coins</b>'}`;
      btn.textContent = `Stake ${activeStake} 🪙 vs Smart Bot`;
      view.setStatus(`${activeStake} 🪙 Stake`, 'gold');
    }
  };
  syncStakeUi();

  $$('[data-tier]', view).forEach(b => {
    b.onclick = () => {
      playType = b.dataset.tier === 'paid' ? 'paid' : 'free';
      if (typeof playSfx === 'function') playSfx('tap');
      syncStakeUi();
    };
  });

  $$('[data-stake]', view).forEach(b => {
    b.onclick = () => {
      lastPaidStake = Number(b.dataset.stake) || 50;
      playType = 'paid';
      if (typeof playSfx === 'function') playSfx('tap');
      syncStakeUi();
    };
  });

  $$('[data-armode]', view).forEach(b => {
    b.onclick = () => {
      selectedMode = b.dataset.armode;
      if (typeof playSfx === 'function') playSfx('tap');
      syncStakeUi();
    };
  });

  $('#arStartMatchBtn', view).onclick = () => {
    const botTier = selectedStake > 0 ? 'pro' : 'standard';
    if (selectedStake > 0) {
      if (me.coins < selectedStake) return toast(`Need ${selectedStake} coins for this stake`);
      addReward(-selectedStake, 0, null, true, { silentSfx: true, skipLevelUp: true });
      if (typeof playSfx === 'function') playSfx('stakeLock');
    } else if (typeof playSfx === 'function') {
      playSfx('turnStart');
    }
    const activeCode = (typeof activeRoomId !== 'undefined' && activeRoomId && typeof mpRooms !== 'undefined')
      ? (mpRooms.find(r => r.id === activeRoomId)?.code || '')
      : '';
    if (gameId === 'jackaroo' && typeof launchJackaroo === 'function') launchJackaroo(selectedStake, rival, selectedMode, botTier, activeCode);
    else if (gameId === 'uno' && typeof launchUnoGame === 'function') launchUnoGame(selectedStake, rival, selectedMode, botTier, activeCode);
    else if (gameId === 'blitz_dots') launchBlitzDots(selectedStake, rival, botTier);
    else if (gameId === 'pool_8ball') launchPool8Ball(selectedStake, rival, botTier);
    else if (gameId === 'undercover') launchUndercoverSpy(selectedStake, botTier);
    else if (gameId === 'squad_arena') launchSquadTrivia(selectedStake, rival, botTier);
    else launchLudoExpress(selectedStake, rival, botTier);
  };

  const extraRulesBtn = $('#arExtraRulesBtn', view);
  if (extraRulesBtn) {
    extraRulesBtn.onclick = () => {
      if (typeof playSfx === 'function') playSfx('tap');
      if (gameId === 'jackaroo' && typeof openJackarooRulesModal === 'function') openJackarooRulesModal(0);
      else if (gameId === 'uno' && typeof openUnoRulesModal === 'function') openUnoRulesModal(0);
    };
  }
  const extraInvBtn = $('#arExtraInviteBtn', view);
  if (extraInvBtn) {
    extraInvBtn.onclick = () => {
      if (typeof playSfx === 'function') playSfx('tap');
      if (gameId === 'jackaroo' && typeof openJackarooInviteModal === 'function') {
        openJackarooInviteModal({
          mode: selectedMode,
          stake: selectedStake,
          onSwitchMode: (nm) => { selectedMode = nm; syncStakeUi(); },
          onInviteFriend: (friend) => {
            if (typeof launchJackaroo === 'function') {
              launchJackaroo(selectedStake, friend, selectedMode, selectedStake > 0 ? 'pro' : 'standard');
            }
          }
        });
      } else if (gameId === 'uno' && typeof openUnoInviteModal === 'function') {
        openUnoInviteModal({
          mode: selectedMode,
          stake: selectedStake,
          onSwitchMode: (nm) => { selectedMode = nm; syncStakeUi(); },
          onInviteFriend: (friend) => {
            if (typeof launchUnoGame === 'function') {
              launchUnoGame(selectedStake, friend, selectedMode, selectedStake > 0 ? 'pro' : 'standard');
            }
          }
        });
      }
    };
  }
}

/* 1. BLITZ DOTS & BOXES */
function chooseSmartDotsAiMove(n, h, v) {
  const countSides = (r, c) =>
    (r >= 0 && c >= 0 && r < n && c < n)
      ? (h[r][c] ? 1 : 0) + (h[r + 1][c] ? 1 : 0) + (v[r][c] ? 1 : 0) + (v[r][c + 1] ? 1 : 0)
      : 0;

  const moves = [];
  for (let r = 0; r <= n; r++) for (let c = 0; c < n; c++) if (!h[r][c]) moves.push({ type: 'h', r, c });
  for (let r = 0; r < n; r++) for (let c = 0; c <= n; c++) if (!v[r][c]) moves.push({ type: 'v', r, c });
  if (!moves.length) return null;

  let bestScore = null;
  const safe = [];
  let minRisk = null;

  for (const mv of moves) {
    const adj = mv.type === 'h'
      ? [...(mv.r > 0 ? [[mv.r - 1, mv.c]] : []), ...(mv.r < n ? [[mv.r, mv.c]] : [])]
      : [...(mv.c > 0 ? [[mv.r, mv.c - 1]] : []), ...(mv.c < n ? [[mv.r, mv.c]] : [])];
    let completes = 0, risks = 0;
    for (const [br, bc] of adj) {
      const s = countSides(br, bc);
      if (s === 3) completes++;
      else if (s === 2) risks++;
    }
    if (completes > 0) {
      if (!bestScore || completes > bestScore.completes) bestScore = { mv, completes };
    } else if (risks === 0) {
      safe.push(mv);
    } else if (!minRisk || risks < minRisk.risks) {
      minRisk = { mv, risks };
    }
  }
  if (bestScore) return bestScore.mv;
  if (safe.length) return safe[Math.floor(Math.random() * safe.length)];
  return minRisk ? minRisk.mv : moves[0];
}

function launchBlitzDots(stake, rival, botTierRaw) {
  const botTier = botTierRaw || (stake > 0 ? 'pro' : 'standard');
  const n = 3;
  const h = Array.from({ length: n + 1 }, () => Array(n).fill(false));
  const v = Array.from({ length: n }, () => Array(n + 1).fill(false));
  const hOwner = Array.from({ length: n + 1 }, () => Array(n).fill(''));
  const vOwner = Array.from({ length: n }, () => Array(n + 1).fill(''));
  const boxes = Array.from({ length: n }, () => Array(n).fill(''));
  let myScore = 0, botScore = 0, turn = 'me', over = false;
  const oppName = rival?.name || (botTier === 'pro' ? 'Smart Pro Bot' : 'Bot');
  const pay = calcArenaStakePayout(stake);

  const m = openFullScreenGameView({
    gameId: 'blitz_dots',
    title: 'Blitz Dots 1v1',
    subMeta: stake > 0 ? `${stake} 🪙 · Smart Bot` : 'Free Bot',
    statusText: 'Your Turn',
    statusTone: 'turn',
    themeClass: 'gfs-theme-wood',
    html: `
      <div class="arena-hud-bar" id="bdHud">
        <span class="hud-pill me active-turn" id="bdMe">You: 0</span>
        ${stake > 0 ? `<span class="hud-pill gold">Pot ${fmtNum(pay.grossPot)} 🪙</span>` : `<span class="hud-pill neutral">9 Boxes</span>`}
        <span class="hud-pill bot" id="bdBot">${esc(oppName)}: 0</span>
      </div>
      <div class="dots-wood-frame" id="bdFrame">
        <div class="dots-board" id="bdBoard"></div>
      </div>
      ${typeof QuickVoice !== 'undefined' ? QuickVoice.renderGameVoiceBar('bd') : ''}
      <div id="bdFoot" style="margin-top:8px"></div>
    `
  });

  if (typeof QuickVoice !== 'undefined') QuickVoice.bindGameVoiceBar(m, 'bd', 'blitz_dots', '#bdFrame');

  const checkBoxes = (who) => {
    let scored = 0;
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        if (!boxes[r][c] && h[r][c] && h[r + 1][c] && v[r][c] && v[r][c + 1]) {
          boxes[r][c] = who;
          scored++;
        }
      }
    }
    if (who === 'me') myScore += scored;
    else botScore += scored;
    if (scored > 0) spawnArenaSparks($('#bdFrame', m), who === 'me' ? '#38bdf8' : '#f43f5e', 12);
    return scored;
  };

  const renderBoard = () => {
    $('#bdMe', m).textContent = `You: ${myScore}`;
    $('#bdBot', m).textContent = `${oppName}: ${botScore}`;
    $('#bdMe', m).classList.toggle('active-turn', !over && turn === 'me');
    $('#bdBot', m).classList.toggle('active-turn', !over && turn === 'bot');
    m.setStatus(over ? 'Finished' : (turn === 'me' ? 'Your Turn' : `${oppName}…`), over ? 'neutral' : (turn === 'me' ? 'turn' : 'bot'));

    let html = '<div class="dots-grid">';
    for (let r = 0; r <= n; r++) {
      html += '<div class="dots-row">';
      for (let c = 0; c < n; c++) {
        const cls = h[r][c] ? `on ${hOwner[r][c]}` : '';
        html += `<span class="dot-pt brass-peg"></span><button type="button" class="dot-h ${cls}" data-dh="${r},${c}" ${h[r][c] || over || turn !== 'me' ? 'disabled' : ''} aria-label="Horizontal edge ${r}-${c}"></button>`;
      }
      html += '<span class="dot-pt brass-peg"></span></div>';
      if (r < n) {
        html += '<div class="dots-mid-row">';
        for (let c = 0; c < n; c++) {
          const vCls = v[r][c] ? `on ${vOwner[r][c]}` : '';
          html += `<button type="button" class="dot-v ${vCls}" data-dv="${r},${c}" ${v[r][c] || over || turn !== 'me' ? 'disabled' : ''} aria-label="Vertical edge ${r}-${c}"></button><div class="dot-box ${boxes[r][c]}">${boxes[r][c] === 'me' ? '★' : (boxes[r][c] === 'bot' ? '⚡' : '')}</div>`;
        }
        const vEndCls = v[r][n] ? `on ${vOwner[r][n]}` : '';
        html += `<button type="button" class="dot-v ${vEndCls}" data-dv="${r},${n}" ${v[r][n] || over || turn !== 'me' ? 'disabled' : ''} aria-label="Vertical edge ${r}-${n}"></button></div>`;
      }
    }
    html += '</div>';
    $('#bdBoard', m).innerHTML = html;

    if (myScore + botScore >= n * n && !over) {
      over = true;
      const res = settleArenaMatchOutcome(myScore > botScore ? 'win' : (myScore === botScore ? 'tie' : 'lose'), stake, 45, 30, 12);
      m.setStatus('Finished', myScore > botScore ? 'ok' : 'bot');
      $('#bdFoot', m).innerHTML = `<div class="arena-result-card"><b>${esc(res.headline)}</b><small>${esc(res.detail)}</small><button type="button" class="btn gold sm" id="bdAgain" style="margin-top:8px">Play Again</button></div>`;
      $('#bdAgain', m).onclick = () => openArenaGame('blitz_dots', rival?.uid);
    }
  };

  const botTurn = () => {
    if (over || turn !== 'bot') return;
    setTimeout(() => {
      if (over || turn !== 'bot') return;
      const mv = chooseSmartDotsAiMove(n, h, v);
      if (!mv) return;
      if (mv.type === 'h') { h[mv.r][mv.c] = true; hOwner[mv.r][mv.c] = 'bot'; }
      else { v[mv.r][mv.c] = true; vOwner[mv.r][mv.c] = 'bot'; }
      const got = checkBoxes('bot');
      if (typeof playSfx === 'function') playSfx(got > 0 ? 'duelWrong' : 'tap');
      if (myScore + botScore >= n * n) { renderBoard(); return; }
      if (got > 0) { renderBoard(); botTurn(); }
      else { turn = 'me'; renderBoard(); }
    }, botTier === 'pro' ? 360 : 450);
  };

  $('#bdBoard', m).onclick = e => {
    if (over || turn !== 'me') return;
    const hb = e.target.closest('[data-dh]');
    const vb = e.target.closest('[data-dv]');
    if (!hb && !vb) return;
    if (hb) {
      const [r, c] = hb.dataset.dh.split(',').map(Number);
      if (h[r][c]) return;
      h[r][c] = true; hOwner[r][c] = 'me';
    } else {
      const [r, c] = vb.dataset.dv.split(',').map(Number);
      if (v[r][c]) return;
      v[r][c] = true; vOwner[r][c] = 'me';
    }
    const got = checkBoxes('me');
    if (typeof playSfx === 'function') playSfx(got > 0 ? 'duelCorrect' : 'tap');
    if (got === 0 && myScore + botScore < n * n) turn = 'bot';
    renderBoard();
    if (turn === 'bot') botTurn();
  };

  m.onclose = () => { over = true; if (typeof QuickVoice !== 'undefined') QuickVoice.closePanel(); };
  renderBoard();
}

/* 2. 8-BALL POOL 1v1 */
function launchPool8Ball(stake, rival, botTierRaw) {
  const botTier = botTierRaw || (stake > 0 ? 'pro' : 'standard');
  const oppName = rival?.name || (botTier === 'pro' ? 'Pool Pro Bot' : 'Pool Bot');
  const pay = calcArenaStakePayout(stake);
  const m = openFullScreenGameView({
    gameId: 'pool_8ball',
    title: '8-Ball Pool 1v1',
    subMeta: stake > 0 ? `${stake} 🪙 · Pro Bot` : 'Free Bot',
    statusText: 'Your Shot',
    statusTone: 'turn',
    themeClass: 'gfs-theme-felt',
    html: `
      <div class="arena-hud-bar">
        <span class="hud-pill me active-turn" id="pMy">You: 0/4</span>
        ${stake > 0 ? `<span class="hud-pill gold">Pot ${fmtNum(pay.grossPot)} 🪙</span>` : `<span class="hud-pill neutral">First to 4</span>`}
        <span class="hud-pill bot" id="pBot">${esc(oppName)}: 0/4</span>
      </div>
      <div class="pool-stage pool-hd-stage" id="poolStage">
        <canvas id="poolCanvas" width="360" height="210" data-testid="pool-canvas" style="width:100%;border-radius:14px;display:block;touch-action:none"></canvas>
        <div class="row" style="margin-top:8px;justify-content:space-between;gap:8px">
          <small style="color:var(--mu);font-weight:700">Tap felt to aim &amp; shoot</small>
          <button type="button" class="btn ok sm" id="poolAutoShoot">🎯 Quick Shot</button>
        </div>
      </div>
      ${typeof QuickVoice !== 'undefined' ? QuickVoice.renderGameVoiceBar('pool') : ''}
      <div id="pFoot" style="margin-top:8px"></div>
    `
  });

  if (typeof QuickVoice !== 'undefined') QuickVoice.bindGameVoiceBar(m, 'pool', 'pool_8ball', '#poolStage');

  const canvas = $('#poolCanvas', m);
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const RAIL = 18;
  const pockets = [
    [RAIL + 2, RAIL + 2], [W / 2, RAIL - 2], [W - RAIL - 2, RAIL + 2],
    [RAIL + 2, H - RAIL - 2], [W / 2, H - RAIL + 2], [W - RAIL - 2, H - RAIL - 2]
  ];
  const cue = { x: 94, y: H / 2, vx: 0, vy: 0, r: 8, color: '#f8fafc', num: '', stripe: false, alive: true };
  const balls = [
    { x: 236, y: H / 2, vx: 0, vy: 0, r: 8, color: '#ef4444', num: '3', stripe: false, alive: true },
    { x: 252, y: H / 2 - 11, vx: 0, vy: 0, r: 8, color: '#eab308', num: '1', stripe: false, alive: true },
    { x: 252, y: H / 2 + 11, vx: 0, vy: 0, r: 8, color: '#2563eb', num: '2', stripe: false, alive: true },
    { x: 268, y: H / 2 - 21, vx: 0, vy: 0, r: 8, color: '#9333ea', num: '4', stripe: true, alive: true },
    { x: 268, y: H / 2, vx: 0, vy: 0, r: 8, color: '#111827', num: '8', stripe: false, alive: true },
    { x: 268, y: H / 2 + 21, vx: 0, vy: 0, r: 8, color: '#ea580c', num: '5', stripe: true, alive: true },
    { x: 284, y: H / 2 - 11, vx: 0, vy: 0, r: 8, color: '#16a34a', num: '6', stripe: false, alive: true }
  ];
  const particles = [];
  let aimPt = { x: 236, y: H / 2 };
  let myScore = 0, botScore = 0, turn = 'me', moving = false, shotPotted = 0, over = false, rafId = 0;

  const isMoving = () => [cue, ...balls].some(b => b.alive && (Math.abs(b.vx) > 0.08 || Math.abs(b.vy) > 0.08));

  const addPocketParticles = (x, y, col) => {
    for (let i = 0; i < 14; i++) {
      const ang = (Math.PI * 2 * i) / 14;
      const spd = 1.1 + Math.random() * 2.4;
      particles.push({ x, y, vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd, life: 1, col });
    }
  };

  const syncHud = () => {
    if ($('#pMy', m)) {
      $('#pMy', m).textContent = `You: ${myScore}/4`;
      $('#pMy', m).classList.toggle('active-turn', !over && turn === 'me');
    }
    if ($('#pBot', m)) {
      $('#pBot', m).textContent = `${oppName}: ${botScore}/4`;
      $('#pBot', m).classList.toggle('active-turn', !over && turn === 'bot');
    }
    m.setStatus(over ? 'Finished' : (turn === 'me' ? 'Your Shot' : `${oppName}…`), over ? (myScore > botScore ? 'ok' : 'bot') : (turn === 'me' ? 'turn' : 'bot'));
  };

  const finishMatch = () => {
    if (over) return;
    over = true;
    const outcome = myScore > botScore ? 'win' : (myScore === botScore ? 'tie' : 'lose');
    const res = settleArenaMatchOutcome(outcome, stake, 50, 35, 14);
    syncHud();
    if ($('#pFoot', m)) {
      $('#pFoot', m).innerHTML = `<div class="arena-result-card"><b>${esc(res.headline)}</b><small>${esc(res.detail)}</small><button type="button" class="btn gold sm" id="pAgain" style="margin-top:8px">Rematch</button></div>`;
      $('#pAgain', m).onclick = () => openArenaGame('pool_8ball', rival?.uid);
    }
  };

  const shootToward = (tx, ty, power = 8.4) => {
    if (moving || over) return;
    const dx = tx - cue.x, dy = ty - cue.y;
    const d = Math.hypot(dx, dy) || 1;
    cue.vx = (dx / d) * power;
    cue.vy = (dy / d) * power;
    moving = true;
    shotPotted = 0;
    if (typeof playSfx === 'function') playSfx('poolHit');
  };

  const runSmartBotShot = () => {
    if (over || turn !== 'bot' || moving) return;
    setTimeout(() => {
      if (over || turn !== 'bot' || moving) return;
      const aliveBalls = balls.filter(b => b.alive);
      if (!aliveBalls.length) { finishMatch(); return; }
      let bestBall = aliveBalls[0], bestDist = Infinity, bestPocket = pockets[0];
      aliveBalls.forEach(b => {
        pockets.forEach(([px, py]) => {
          const d = Math.hypot(b.x - px, b.y - py);
          if (d < bestDist) { bestDist = d; bestBall = b; bestPocket = [px, py]; }
        });
      });
      if (botTier === 'pro') {
        const pdx = bestPocket[0] - bestBall.x, pdy = bestPocket[1] - bestBall.y;
        const pd = Math.hypot(pdx, pdy) || 1;
        const gx = bestBall.x - (pdx / pd) * (bestBall.r * 1.45);
        const gy = bestBall.y - (pdy / pd) * (bestBall.r * 1.45);
        const jitter = (Math.random() - 0.5) * 4;
        shootToward(gx + jitter, gy + jitter, 9.0);
      } else {
        const jitter = (Math.random() - 0.5) * 14;
        shootToward(bestBall.x + jitter, bestBall.y + jitter, 8.2);
      }
    }, botTier === 'pro' ? 520 : 680);
  };

  const drawTable = () => {
    const wood = ctx.createLinearGradient(0, 0, W, H);
    wood.addColorStop(0, '#78350f');
    wood.addColorStop(0.5, '#451a03');
    wood.addColorStop(1, '#5c260a');
    ctx.fillStyle = wood;
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = '#fbbf24';
    [[0, 0], [W - 14, 0], [0, H - 14], [W - 14, H - 14]].forEach(([x, y]) => {
      ctx.fillRect(x, y, 14, 14);
    });

    const felt = ctx.createRadialGradient(W * 0.5, H * 0.45, 24, W * 0.5, H * 0.5, W * 0.6);
    felt.addColorStop(0, '#0f766e');
    felt.addColorStop(0.45, '#065f46');
    felt.addColorStop(1, '#022c22');
    ctx.fillStyle = felt;
    ctx.fillRect(RAIL, RAIL, W - RAIL * 2, H - RAIL * 2);

    ctx.strokeStyle = 'rgba(0,0,0,0.45)';
    ctx.lineWidth = 3;
    ctx.strokeRect(RAIL + 1, RAIL + 1, W - RAIL * 2 - 2, H - RAIL * 2 - 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.14)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(94, RAIL + 4);
    ctx.lineTo(94, H - RAIL - 4);
    ctx.stroke();

    pockets.forEach(([px, py]) => {
      ctx.beginPath(); ctx.arc(px, py, 13, 0, Math.PI * 2);
      ctx.fillStyle = '#78350f'; ctx.fill();
      ctx.beginPath(); ctx.arc(px, py, 11, 0, Math.PI * 2);
      ctx.fillStyle = '#030712'; ctx.fill();
    });

    if (!moving && !over && turn === 'me') {
      const dx = aimPt.x - cue.x, dy = aimPt.y - cue.y;
      const d = Math.hypot(dx, dy) || 1;
      const ux = dx / d, uy = dy / d;
      ctx.save();
      ctx.setLineDash([4, 5]);
      ctx.strokeStyle = 'rgba(254, 240, 138, 0.72)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(cue.x + ux * 10, cue.y + uy * 10);
      ctx.lineTo(cue.x + ux * 115, cue.y + uy * 115);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.strokeStyle = '#fde68a';
      ctx.lineWidth = 4.2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cue.x - ux * 14, cue.y - uy * 14);
      ctx.lineTo(cue.x - ux * 74, cue.y - uy * 74);
      ctx.stroke();
      ctx.restore();
    }

    for (const b of [cue, ...balls]) {
      if (!b.alive) continue;
      ctx.beginPath(); ctx.arc(b.x + 2, b.y + 3, b.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,0,0,0.42)'; ctx.fill();

      const bg = ctx.createRadialGradient(b.x - 2.6, b.y - 2.6, 1.2, b.x, b.y, b.r);
      bg.addColorStop(0, '#ffffff');
      bg.addColorStop(0.28, b.color);
      bg.addColorStop(1, '#090d16');
      ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fillStyle = bg; ctx.fill();

      if (b.num) {
        ctx.beginPath(); ctx.arc(b.x, b.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.92)'; ctx.fill();
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 6.5px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(b.num, b.x, b.y + 0.5);
      }
    }

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx; p.y += p.vy; p.life -= 0.04;
      if (p.life <= 0) { particles.splice(i, 1); continue; }
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.col;
      ctx.beginPath(); ctx.arc(p.x, p.y, 2.4, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
    }
  };

  const step = () => {
    const all = [cue, ...balls];
    for (const b of all) {
      if (!b.alive) continue;
      b.x += b.vx; b.y += b.vy;
      b.vx *= 0.982; b.vy *= 0.982;
      if (Math.abs(b.vx) < 0.06) b.vx = 0;
      if (Math.abs(b.vy) < 0.06) b.vy = 0;
      if (b.x < RAIL + b.r) { b.x = RAIL + b.r; b.vx = Math.abs(b.vx) * 0.88; }
      if (b.x > W - RAIL - b.r) { b.x = W - RAIL - b.r; b.vx = -Math.abs(b.vx) * 0.88; }
      if (b.y < RAIL + b.r) { b.y = RAIL + b.r; b.vy = Math.abs(b.vy) * 0.88; }
      if (b.y > H - RAIL - b.r) { b.y = H - RAIL - b.r; b.vy = -Math.abs(b.vy) * 0.88; }
    }
    for (let i = 0; i < all.length; i++) {
      for (let j = i + 1; j < all.length; j++) {
        const a = all[i], b = all[j];
        if (!a.alive || !b.alive) continue;
        const dx = b.x - a.x, dy = b.y - a.y, dist = Math.hypot(dx, dy);
        if (dist > 0 && dist < a.r + b.r) {
          const nx = dx / dist, ny = dy / dist;
          const overlap = (a.r + b.r - dist) / 2;
          a.x -= nx * overlap; a.y -= ny * overlap;
          b.x += nx * overlap; b.y += ny * overlap;
          const dvx = a.vx - b.vx, dvy = a.vy - b.vy;
          const dot = dvx * nx + dvy * ny;
          if (dot > 0) {
            a.vx -= dot * nx * 0.95; a.vy -= dot * ny * 0.95;
            b.vx += dot * nx * 0.95; b.vy += dot * ny * 0.95;
          }
        }
      }
    }
    for (const b of balls) {
      if (!b.alive) continue;
      if (pockets.some(([px, py]) => Math.hypot(b.x - px, b.y - py) < 17)) {
        b.alive = false;
        shotPotted++;
        addPocketParticles(b.x, b.y, '#fde047');
        if (turn === 'me') myScore++;
        else botScore++;
        if (typeof playSfx === 'function') playSfx(turn === 'me' ? 'duelCorrect' : 'coin');
        syncHud();
      }
    }
    if (pockets.some(([px, py]) => Math.hypot(cue.x - px, cue.y - py) < 15)) {
      cue.x = 94; cue.y = H / 2; cue.vx = 0; cue.vy = 0;
    }

    if (moving && !isMoving()) {
      moving = false;
      const aliveCnt = balls.filter(b => b.alive).length;
      if (myScore >= 4 || botScore >= 4 || aliveCnt === 0) {
        finishMatch();
      } else {
        if (shotPotted === 0) turn = turn === 'me' ? 'bot' : 'me';
        syncHud();
        if (turn === 'bot') runSmartBotShot();
      }
    }

    drawTable();
    if (!over) rafId = requestAnimationFrame(step);
  };

  const toCanvasXY = (e) => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (W / rect.width),
      y: (e.clientY - rect.top) * (H / rect.height)
    };
  };

  canvas.onpointermove = e => {
    if (over || moving || turn !== 'me') return;
    aimPt = toCanvasXY(e);
  };
  canvas.onclick = e => {
    if (over || moving || turn !== 'me') return;
    const pt = toCanvasXY(e);
    aimPt = pt;
    shootToward(pt.x, pt.y, 8.6);
  };
  $('#poolAutoShoot', m).onclick = () => {
    if (over || moving || turn !== 'me') return;
    const t = balls.find(b => b.alive);
    if (t) {
      aimPt = { x: t.x, y: t.y };
      shootToward(t.x, t.y, 8.8);
    }
  };
  m.onclose = () => {
    over = true;
    cancelAnimationFrame(rafId);
    if (typeof QuickVoice !== 'undefined') QuickVoice.closePanel();
  };
  syncHud();
  rafId = requestAnimationFrame(step);
}

/* 3. UNDERCOVER SPY */
function launchUndercoverSpy(stake, botTierRaw) {
  const botTier = botTierRaw || (stake > 0 ? 'pro' : 'standard');
  const pairs = [
    { civ: 'Coffee', spy: 'Tea', civClues: ['Morning roast', 'Cafe cup', 'Espresso boost'], spyClues: ['Steeped leaf', 'Herbal mug', 'Warm brew'] },
    { civ: 'Guitar', spy: 'Violin', civClues: ['Six strings', 'Rock stage', 'Strum chords'], spyClues: ['Bow string', 'Orchestra wood', 'Classic solo'] },
    { civ: 'Beach', spy: 'Desert', civClues: ['Ocean waves', 'Sun umbrella', 'Salty breeze'], spyClues: ['Golden dunes', 'Dry oasis', 'Hot sand'] }
  ];
  const pair = pairs[Math.floor(Math.random() * pairs.length)];
  const players = [
    { id: 'you', name: me.name || 'You', avatar: me.avatar || 'av_b1', isMe: true, alive: true, isSpy: false, clue: '' },
    { id: 'b1', name: 'Aria Nova', avatar: 'av_g1', isMe: false, alive: true, isSpy: false, clue: '' },
    { id: 'b2', name: 'Leo Blaze', avatar: 'av_b3', isMe: false, alive: true, isSpy: false, clue: '' },
    { id: 'b3', name: 'Zara Star', avatar: 'av_g3', isMe: false, alive: true, isSpy: false, clue: '' }
  ];
  const spyIdx = 1 + Math.floor(Math.random() * 3);
  players[spyIdx].isSpy = true;

  let phase = 'mic';
  let turnIdx = 0;
  let roundNo = 1;
  let turnLeft = 20;
  let timerId = 0;
  let over = false;
  const pay = calcArenaStakePayout(stake);

  const m = openFullScreenGameView({
    gameId: 'undercover',
    title: 'Undercover Spy',
    subMeta: stake > 0 ? `${stake} 🪙 · Pro Spy` : 'Free Bot',
    statusText: 'Mic Pass',
    statusTone: 'turn',
    themeClass: 'gfs-theme-spy',
    html: `
      <div id="ucStage" class="uc-velvet-stage">
        <div id="ucBody"></div>
      </div>
      ${typeof QuickVoice !== 'undefined' ? QuickVoice.renderGameVoiceBar('uc') : ''}
    `
  });

  if (typeof QuickVoice !== 'undefined') QuickVoice.bindGameVoiceBar(m, 'uc', 'undercover', '#ucStage');

  const aliveList = () => players.filter(p => p.alive);

  const advanceMic = () => {
    const alive = aliveList();
    turnIdx++;
    if (turnIdx >= alive.length) {
      phase = 'vote';
      clearInterval(timerId);
      if (typeof playSfx === 'function') playSfx('turnStart');
      render();
      return;
    }
    turnLeft = 20;
    if (typeof playSfx === 'function') playSfx('micPass');
    render();
    scheduleBotSpeak();
  };

  const scheduleBotSpeak = () => {
    const alive = aliveList();
    const curP = alive[turnIdx];
    if (!curP || curP.isMe || phase !== 'mic' || over) return;
    setTimeout(() => {
      if (phase !== 'mic' || over) return;
      const pool = curP.isSpy
        ? (botTier === 'pro' ? [pair.spyClues[0], 'Daily favorite', pair.spyClues[2]] : pair.spyClues)
        : pair.civClues;
      curP.clue = pool[(roundNo + turnIdx) % pool.length];
      advanceMic();
    }, 900);
  };

  const render = () => {
    const alive = aliveList();
    const activeP = phase === 'mic' ? alive[turnIdx] : null;
    const body = $('#ucBody', m);
    if (!body) return;

    m.setStatus(
      phase === 'mic' ? `R${roundNo} Mic Pass` : (phase === 'vote' ? 'Vote Spy' : 'Case Closed'),
      phase === 'vote' ? 'gold' : (phase === 'done' ? 'neutral' : 'turn')
    );

    const pct = Math.max(0, Math.min(100, Math.round((turnLeft / 20) * 100)));
    body.innerHTML = `
      <div class="arena-hud-bar">
        <span class="hud-pill me">🔑 Word: <b>${esc(pair.civ)}</b></span>
        ${stake > 0 ? `<span class="hud-pill gold">Pot ${fmtNum(pay.grossPot)} 🪙</span>` : `<span class="hud-pill neutral">4 Agents</span>`}
        ${phase === 'mic' ? `<span class="hud-pill bot" id="ucTimer">${turnLeft}s</span>` : `<span class="hud-pill ok">Vote</span>`}
      </div>
      ${phase === 'mic' ? `<div class="uc-timer-bar"><i id="ucTimerBar" style="width:${pct}%"></i></div>` : ''}
      <div class="uc-seats-grid">
        ${players.map(p => {
          const speaking = activeP && activeP.id === p.id;
          return `<div class="uc-seat uc-glass-seat ${!p.alive ? 'out' : ''} ${speaking ? 'speaking' : ''}">
            <div class="uc-av-ring">${av(p, 44)}</div>
            <b>${esc(p.name)}</b>
            <span class="uc-clue">${p.clue ? `"${esc(p.clue)}"` : (speaking ? '🎙️ ON AIR' : (p.alive ? 'Listening…' : 'Eliminated'))}</span>
          </div>`;
        }).join('')}
      </div>
      <div id="ucAct" style="margin-top:10px"></div>
    `;

    const act = $('#ucAct', m);
    if (phase === 'mic' && activeP) {
      if (activeP.isMe) {
        act.innerHTML = `
          <div class="row" style="gap:6px">
            <input id="ucClueIn" maxlength="40" placeholder="Clue for ${esc(pair.civ)}..." style="flex:1">
            <button type="button" class="btn gold sm" id="ucPassBtn">Pass Mic →</button>
          </div>
        `;
        const submitClue = () => {
          activeP.clue = ($('#ucClueIn', m).value || '').trim() || 'Classic pick';
          advanceMic();
        };
        $('#ucPassBtn', m).onclick = submitClue;
        $('#ucClueIn', m).onkeydown = e => { if (e.key === 'Enter') submitClue(); };
      } else {
        act.innerHTML = `<div class="mp-sys-line">🎙️ ${esc(activeP.name)} speaking…</div>`;
      }
    } else if (phase === 'vote') {
      act.innerHTML = `
        <div style="font-size:12px;font-weight:800;margin-bottom:6px;color:var(--gold)">Vote the Undercover Spy:</div>
        <div class="row wrap" style="gap:6px">
          ${alive.filter(p => !p.isMe).map(p => `<button type="button" class="btn sm ghost" data-ucvote="${esc(p.id)}" style="flex:1">${esc(p.name)}</button>`).join('')}
        </div>
      `;
      $$('[data-ucvote]', act).forEach(b => {
        b.onclick = () => {
          const picked = players.find(x => x.id === b.dataset.ucvote);
          if (!picked) return;
          picked.alive = false;
          over = true;
          phase = 'done';
          const won = picked.isSpy;
          const res = settleArenaMatchOutcome(won ? 'win' : 'lose', stake, 48, 32, 12);
          if (won) spawnArenaSparks($('#ucStage', m), '#ffd36b', 14);
          render();
          $('#ucAct', m).innerHTML = `<div class="arena-result-card"><b>${esc(res.headline)}</b><small>${won ? `${esc(picked.name)} was Spy (${esc(pair.spy)})` : `Spy was ${esc(players[spyIdx].name)} (${esc(pair.spy)})`}</small><button type="button" class="btn gold sm" id="ucAgain" style="margin-top:8px">Play Again</button></div>`;
          $('#ucAgain', m).onclick = () => openArenaGame('undercover');
        };
      });
    }
  };

  timerId = setInterval(() => {
    if (over || phase !== 'mic') return;
    turnLeft--;
    const tEl = $('#ucTimer', m);
    if (tEl) tEl.textContent = Math.max(0, turnLeft) + 's';
    const bEl = $('#ucTimerBar', m);
    if (bEl) bEl.style.width = Math.max(0, Math.round((turnLeft / 20) * 100)) + '%';
    if (turnLeft <= 0) {
      const alive = aliveList();
      if (alive[turnIdx] && !alive[turnIdx].clue) alive[turnIdx].clue = 'Passed turn';
      advanceMic();
    }
  }, 1000);
  m.onclose = () => { over = true; clearInterval(timerId); if (typeof QuickVoice !== 'undefined') QuickVoice.closePanel(); };
  render();
}

/* 4. SQUAD TRIVIA 1v1 */
function launchSquadTrivia(stake, rival, botTierRaw) {
  const botTier = botTierRaw || (stake > 0 ? 'pro' : 'standard');
  const qs = [
    { q: 'Which planet has the most moons?', o: ['Mars', 'Saturn', 'Venus', 'Mercury'], a: 1 },
    { q: '18 × 7 = ?', o: ['116', '126', '132', '124'], a: 1 },
    { q: 'SI unit of electrical resistance?', o: ['Watt', 'Volt', 'Ohm', 'Tesla'], a: 2 },
    { q: 'Capital of South Korea?', o: ['Busan', 'Osaka', 'Seoul', 'Taipei'], a: 2 },
    { q: 'Chemical symbol for Potassium?', o: ['Po', 'K', 'Pt', 'P'], a: 1 }
  ];
  let idx = 0, myScore = 0, botScore = 0, streak = 0, locked = false, over = false;
  const oppName = rival?.name || (botTier === 'pro' ? 'Apex Pro Bot' : 'Rival Bot');
  const pay = calcArenaStakePayout(stake);

  const m = openFullScreenGameView({
    gameId: 'squad_arena',
    title: 'Squad Trivia 1v1',
    subMeta: stake > 0 ? `${stake} 🪙 · Pro Bot` : 'Free Bot',
    statusText: 'Q 1/5',
    statusTone: 'turn',
    themeClass: 'gfs-theme-trivia',
    html: `
      <div id="sqStage" class="sq-glass-stage">
        <div id="sqBody"></div>
      </div>
      ${typeof QuickVoice !== 'undefined' ? QuickVoice.renderGameVoiceBar('sq') : ''}
    `
  });

  if (typeof QuickVoice !== 'undefined') QuickVoice.bindGameVoiceBar(m, 'sq', 'squad_arena', '#sqStage');

  const render = () => {
    const body = $('#sqBody', m);
    if (!body) return;
    if (idx >= qs.length) {
      over = true;
      const outcome = myScore > botScore ? 'win' : (myScore === botScore ? 'tie' : 'lose');
      const res = settleArenaMatchOutcome(outcome, stake, 42, 28, 10);
      m.setStatus('Finished', outcome === 'win' ? 'ok' : 'bot');
      body.innerHTML = `<div class="arena-result-card"><b>${esc(res.headline)}</b><small>Score ${myScore} – ${botScore} · ${esc(res.detail)}</small><button type="button" class="btn gold sm" id="sqAgain" style="margin-top:8px">Rematch</button></div>`;
      $('#sqAgain', m).onclick = () => openArenaGame('squad_arena', rival?.uid);
      return;
    }
    const q = qs[idx];
    const progress = Math.round(((idx + 1) / qs.length) * 100);
    m.setStatus(`Q ${idx + 1}/${qs.length}`, 'turn');
    body.innerHTML = `
      <div class="arena-hud-bar">
        <span class="hud-pill me active-turn">You: ${myScore}${streak >= 2 ? ` 🔥${streak}` : ''}</span>
        ${stake > 0 ? `<span class="hud-pill gold">Pot ${fmtNum(pay.grossPot)} 🪙</span>` : `<span class="hud-pill neutral">5 Rounds</span>`}
        <span class="hud-pill bot">${esc(oppName)}: ${botScore}</span>
      </div>
      <div class="sq-prog-bar"><i style="width:${progress}%"></i></div>
      <div class="sq-question-glass"><b>${esc(q.q)}</b></div>
      <div class="sq-opts-grid">${q.o.map((opt, i) => `<button type="button" class="sq-opt-btn" data-sqa="${i}"><span class="sq-opt-ltr">${String.fromCharCode(65 + i)}</span><span>${esc(opt)}</span></button>`).join('')}</div>
    `;
    $$('[data-sqa]', body).forEach(b => {
      b.onclick = () => {
        if (over || locked) return;
        locked = true;
        const pick = Number(b.dataset.sqa);
        const ok = pick === q.a;
        b.classList.add(ok ? 'correct' : 'wrong');
        const rightBtn = body.querySelector(`[data-sqa="${q.a}"]`);
        if (rightBtn) rightBtn.classList.add('correct');
        if (ok) {
          streak++;
          myScore += 20;
          spawnArenaSparks($('#sqStage', m), '#34d399', 10);
        } else {
          streak = 0;
        }
        const botAcc = botTier === 'pro' ? (botScore <= myScore ? 0.86 : 0.78) : (botScore < myScore ? 0.72 : 0.60);
        if (Math.random() < botAcc) botScore += 20;
        if (typeof playSfx === 'function') playSfx(ok ? 'duelCorrect' : 'duelWrong');
        setTimeout(() => {
          idx++;
          locked = false;
          render();
        }, 420);
      };
    });
  };
  m.onclose = () => { over = true; if (typeof QuickVoice !== 'undefined') QuickVoice.closePanel(); };
  render();
}

/* 5. LUDO EXPRESS */
function launchLudoExpress(stake, rival, botTierRaw) {
  const botTier = botTierRaw || (stake > 0 ? 'pro' : 'standard');
  const goal = 24;
  const BOOST_TILES = { 5: 9, 14: 18 };
  const SAFE_STARS = new Set([6, 12, 19]);
  let myPos = 0, botPos = 0, turn = 'me', over = false, rolling = false;
  let lastDie = 6;
  let logTxt = 'Tap Dice to race across the 24-tile board';
  const oppName = rival?.name || (botTier === 'pro' ? 'Turbo Pro Bot' : 'Turbo Bot');
  const pay = calcArenaStakePayout(stake);

  const m = openFullScreenGameView({
    gameId: 'ludo_snakes',
    title: 'Ludo Express',
    subMeta: stake > 0 ? `${stake} 🪙 · Pro Bot` : 'Free Bot',
    statusText: 'Your Roll',
    statusTone: 'turn',
    themeClass: 'gfs-theme-wood',
    html: `
      <div id="ldStage" class="ludo-wood-stage">
        <div id="ldBody"></div>
      </div>
      ${typeof QuickVoice !== 'undefined' ? QuickVoice.renderGameVoiceBar('ld') : ''}
    `
  });

  if (typeof QuickVoice !== 'undefined') QuickVoice.bindGameVoiceBar(m, 'ld', 'ludo_snakes', '#ldStage');

  const diePipsSvg = (val) => {
    const map = {
      1: [[24, 24]],
      2: [[14, 14], [34, 34]],
      3: [[14, 14], [24, 24], [34, 34]],
      4: [[14, 14], [34, 14], [14, 34], [34, 34]],
      5: [[14, 14], [34, 14], [24, 24], [14, 34], [34, 34]],
      6: [[14, 13], [34, 13], [14, 24], [34, 24], [14, 35], [34, 35]]
    };
    const pts = map[val] || map[6];
    return `<svg viewBox="0 0 48 48" width="44" height="44" class="ludo-die-svg ${rolling ? 'rolling' : ''}" aria-hidden="true">
      <defs>
        <linearGradient id="dieIvory" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#ffffff"/><stop offset="100%" stop-color="#e2e8f0"/>
        </linearGradient>
      </defs>
      <rect x="3" y="3" width="42" height="42" rx="11" fill="url(#dieIvory)" stroke="#fbbf24" stroke-width="2.4"/>
      ${pts.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4.2" fill="${val === 6 ? '#dc2626' : '#1e293b'}"/>`).join('')}
    </svg>`;
  };

  const renderBoardGrid = () => {
    let tiles = '';
    for (let i = 1; i <= goal; i++) {
      const isBoost = BOOST_TILES[i] !== undefined;
      const isStar = SAFE_STARS.has(i);
      const isCrown = i === goal;
      const hasMe = myPos === i;
      const hasBot = botPos === i;
      tiles += `<div class="ludo-tile ${isCrown ? 'crown' : isBoost ? 'boost' : isStar ? 'star' : ''}">
        <span class="lt-num">${isCrown ? '👑' : isBoost ? '⚡' : isStar ? '★' : i}</span>
        <div class="lt-pawns">
          ${hasMe ? '<i class="ludo-pawn me" title="You"></i>' : ''}
          ${hasBot ? '<i class="ludo-pawn bot" title="Bot"></i>' : ''}
        </div>
      </div>`;
    }
    return `<div class="ludo-board-grid">${tiles}</div>`;
  };

  const render = () => {
    const body = $('#ldBody', m);
    if (!body) return;
    m.setStatus(over ? 'Finished' : (turn === 'me' ? 'Your Roll' : `${oppName}…`), over ? (myPos >= goal ? 'ok' : 'bot') : (turn === 'me' ? 'turn' : 'bot'));
    body.innerHTML = `
      <div class="arena-hud-bar">
        <span class="hud-pill me ${!over && turn === 'me' ? 'active-turn' : ''}">🔵 You: ${myPos}/${goal}</span>
        ${stake > 0 ? `<span class="hud-pill gold">Pot ${fmtNum(pay.grossPot)} 🪙</span>` : `<span class="hud-pill neutral">Race to 24</span>`}
        <span class="hud-pill bot ${!over && turn === 'bot' ? 'active-turn' : ''}">🔴 ${esc(oppName)}: ${botPos}/${goal}</span>
      </div>
      ${renderBoardGrid()}
      <div class="mp-sys-line" style="margin:8px 0">${esc(logTxt)}</div>
      <div id="ldAct" class="ludo-dice-dock">
        ${!over ? `
          <div class="ludo-die-box">${diePipsSvg(lastDie)}</div>
          <button type="button" class="btn gold" id="ldRoll" style="flex:1" ${turn !== 'me' || rolling ? 'disabled' : ''}>🎲 Roll Dice</button>
        ` : ''}
      </div>
    `;
    if ($('#ldRoll', body)) {
      $('#ldRoll', body).onclick = () => {
        if (over || turn !== 'me' || rolling) return;
        rolling = true;
        if (typeof playSfx === 'function') playSfx('diceRoll');
        render();
        setTimeout(() => {
          if (over) return;
          rolling = false;
          const roll = 1 + Math.floor(Math.random() * 6);
          lastDie = roll;
          myPos = Math.min(goal, myPos + roll);
          let extra = '';
          if (BOOST_TILES[myPos]) {
            myPos = BOOST_TILES[myPos];
            extra = ' · ⚡ Boost!';
            spawnArenaSparks($('#ldStage', m), '#fde047', 10);
          }
          logTxt = `You rolled 🎲 ${roll}${roll === 6 ? ' (Bonus!)' : ''}${extra}`;
          if (myPos >= goal) {
            over = true;
            const res = settleArenaMatchOutcome('win', stake, 40, 26, 10);
            spawnArenaSparks($('#ldStage', m), '#38bdf8', 14);
            render();
            $('#ldAct', m).innerHTML = `<div class="arena-result-card" style="width:100%"><b>${esc(res.headline)}</b><small>${esc(res.detail)}</small><button type="button" class="btn gold sm" id="ldAgain" style="margin-top:8px">Rematch</button></div>`;
            $('#ldAgain', m).onclick = () => openArenaGame('ludo_snakes', rival?.uid);
            return;
          }
          if (roll !== 6) turn = 'bot';
          render();
          if (turn === 'bot') {
            setTimeout(() => {
              if (over) return;
              const br = botTier === 'pro'
                ? (botPos < myPos ? (2 + Math.floor(Math.random() * 5)) : (1 + Math.floor(Math.random() * 6)))
                : (1 + Math.floor(Math.random() * 6));
              lastDie = br;
              botPos = Math.min(goal, botPos + br);
              let bExtra = '';
              if (BOOST_TILES[botPos]) { botPos = BOOST_TILES[botPos]; bExtra = ' · ⚡ Boost!'; }
              logTxt = `${oppName} rolled 🎲 ${br}${bExtra}`;
              if (botPos >= goal) {
                over = true;
                const res = settleArenaMatchOutcome('lose', stake, 40, 26, 10);
                render();
                $('#ldAct', m).innerHTML = `<div class="arena-result-card" style="width:100%"><b>${esc(res.headline)}</b><small>${esc(res.detail)}</small><button type="button" class="btn gold sm" id="ldAgain" style="margin-top:8px">Rematch</button></div>`;
                $('#ldAgain', m).onclick = () => openArenaGame('ludo_snakes', rival?.uid);
                return;
              }
              turn = 'me';
              render();
            }, 520);
          }
        }, 240);
      };
    }
  };
  m.onclose = () => { over = true; if (typeof QuickVoice !== 'undefined') QuickVoice.closePanel(); };
  render();
}
