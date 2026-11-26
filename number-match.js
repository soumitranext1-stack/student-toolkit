"use strict";
/* =====================================================================
   NUMBER MATCH — FULL-GRAPHICS 3D GLOSSY PUZZLE ARENA (v26)
   · Jewel-beveled 3D number tiles (1–9) on a royal indigo & brass board
   · Match EQUAL pairs (7 + 7) or SUM-10 pairs (3 + 7) across cleared cells
     horizontally, vertically, diagonally, or line-wrap adjacent
   · Animated SVG laser connector beam, floating combo/row-clear popups,
     spark particle bursts, Hint, Undo, & + Add Rows
   · Classic Stage Clear & 1v1 Timed Score Duel (Free Bot + Coin Stakes)
   · Complete Sound FX (tap, pairMatch, rowClear, addRows, duelWrong, duelWin)
   · Clickable Invites (?room= & Room Code), Guest-Filtered Online List,
     Live Activity, Spectate Mode, QuickVoice & In-Game Chat
   ===================================================================== */

const NM_TILE_PALETTE = {
  1: { top: '#60a5fa', bot: '#1d4ed8', glow: 'rgba(59,130,246,.45)' },
  2: { top: '#34d399', bot: '#047857', glow: 'rgba(16,185,129,.45)' },
  3: { top: '#fbbf24', bot: '#b45309', glow: 'rgba(245,158,11,.45)' },
  4: { top: '#f87171', bot: '#b91c1c', glow: 'rgba(239,68,68,.45)' },
  5: { top: '#c084fc', bot: '#6d28d9', glow: 'rgba(168,85,247,.45)' },
  6: { top: '#22d3ee', bot: '#0e7490', glow: 'rgba(6,182,212,.45)' },
  7: { top: '#fb923c', bot: '#c2410c', glow: 'rgba(249,115,22,.45)' },
  8: { top: '#f472b6', bot: '#be185d', glow: 'rgba(236,72,153,.45)' },
  9: { top: '#a3e635', bot: '#4d7c0f', glow: 'rgba(132,204,22,.45)' }
};

function nmAvatarHtml(av) {
  if (typeof renderAvatarGlyph === 'function') return renderAvatarGlyph(av || 'av_b1');
  return `<span>${esc(av || '🔢')}</span>`;
}

function openNumberMatchRulesModal() {
  return modal('📖 Number Match Rules', `
    <div class="jkr-shell">
      <div class="jkr-list">
        <div class="jkr-row"><span class="jkr-mini red"><b>7=7</b><i>PAIR</i></span><p>Tap any two <b>identical numbers</b> (e.g. 4 &amp; 4) or any two numbers that <b>add up to 10</b> (e.g. 3 &amp; 7, 2 &amp; 8) to clear them!</p></div>
        <div class="jkr-row"><span class="jkr-mini blk"><b>↔↕↗</b><i>PATH</i></span><p>Pairs must be adjacent <b>horizontally, vertically, diagonally</b>, or at the <b>end of one row &amp; start of the next</b> — with only empty tiles between them.</p></div>
        <div class="jkr-row"><span class="jkr-mini red"><b>★</b><i>ROW</i></span><p>Clearing every number in a row collapses the row and awards a <b>+50 Row Clear Bonus</b> + combo multiplier!</p></div>
        <div class="jkr-row"><span class="jkr-mini blk"><b>+</b><i>ROWS</i></span><p>Stuck with no pairs? Tap <b>+ Add Rows</b> to duplicate remaining digits to the bottom and unlock fresh combos, or tap <b>💡 Hint</b> anytime.</p></div>
        <div class="jkr-row"><span class="jkr-mini blk"><b>🏆</b><i>WIN</i></span><p>In <b>Classic Stage</b>, clear the entire board to win. In <b>1v1 Duel</b>, outscore your rival before the 60s timer ends!</p></div>
      </div>
    </div>
  `, 'jkr-modal');
}
window.openNumberMatchRulesModal = openNumberMatchRulesModal;

function openNumberMatchInviteModal(opts) {
  const o = opts || {};
  const mode = o.mode === 'duel' ? 'duel' : 'classic';
  const stake = Math.max(0, Number(o.stake || 0));
  const roomCode = String(o.roomCode || ('NM' + Math.floor(1000 + Math.random() * 9000))).toUpperCase();
  const modeLabel = mode === 'duel' ? '1v1 Score Duel' : 'Classic Puzzle';
  const friendIds = new Set((typeof me !== 'undefined' && Array.isArray(me?.friends)) ? me.friends : []);

  const baseContacts = typeof getRealOnlineUsers === 'function'
    ? getRealOnlineUsers()
    : (typeof allUsers === 'function' ? allUsers() : []).filter(u => u && u.uid && u.uid !== (typeof uid !== 'undefined' ? uid : '') && u.accountType !== 'guest');

  const contacts = baseContacts.map(u => {
    const act = typeof getUserLiveActivity === 'function' ? getUserLiveActivity(u) : { isOnline: true, label: 'Online' };
    return {
      uid: String(u.uid),
      name: String(u.name || 'Player'),
      avatar: u.avatar || 'av_b1',
      level: Number(u.level || (typeof calcLevel === 'function' ? calcLevel(u.exp || 0) : 1)),
      isFriend: friendIds.has(u.uid),
      actLabel: act.label || 'Online'
    };
  });

  const invitedSet = new Set();
  const shareUrl = typeof buildRoomInviteUrl === 'function'
    ? buildRoomInviteUrl({ gameId: 'number_match', roomCode, mode })
    : `?room=${encodeURIComponent(roomCode)}&game=number_match&mode=${encodeURIComponent(mode)}`;
  const shareText = `🔢 Join my Number Match (${modeLabel}${stake > 0 ? ' · ' + stake + ' 🪙' : ' · Free'}) room! Room Code: ${roomCode} ${shareUrl}`;

  const m = modal('🔢 Invite Friends · Number Match', `
    <div class="jki-shell" data-testid="nm-invite-sheet">
      <div class="jki-code-card">
        <div class="jki-code-meta">
          <small class="jki-lbl">NUMBER MATCH CODE · ${esc(modeLabel)}</small>
          <b class="jki-code">${esc(roomCode)}</b>
        </div>
        <div class="jki-code-actions">
          <button type="button" class="btn sm gold" id="nmInvCopy">Copy</button>
          <button type="button" class="btn sm ok" id="nmInvWorld">World Chat</button>
        </div>
      </div>

      <div class="jki-search-wrap">
        <span class="jki-search-ico" aria-hidden="true">🔍</span>
        <input type="search" id="nmInvSearch" placeholder="Search online friends..." maxlength="40" autocomplete="off">
      </div>

      <div class="jki-sec-row">
        <span class="jki-sec-title">Online Friends &amp; Players</span>
        <small class="jki-sec-cnt" id="nmInvCnt">${contacts.length} online</small>
      </div>
      <div class="jki-friend-list" id="nmInvList"></div>
    </div>
  `, 'jki-modal');

  const renderList = (qRaw) => {
    const listEl = $('#nmInvList', m);
    const cntEl = $('#nmInvCnt', m);
    if (!listEl) return;
    const q = String(qRaw || '').trim().toLowerCase();
    const filtered = q ? contacts.filter(c => c.name.toLowerCase().includes(q) || c.uid.toLowerCase().includes(q)) : contacts;
    if (cntEl) cntEl.textContent = `${filtered.length} online`;
    if (!filtered.length) {
      listEl.innerHTML = `<div class="jki-empty">No online players found. Share Room Code <b>${esc(roomCode)}</b> to World Chat!</div>`;
      return;
    }
    listEl.innerHTML = filtered.slice(0, 16).map(u => {
      const done = invitedSet.has(u.uid);
      return `
        <div class="jki-friend-row">
          <div class="jki-f-left">
            <span class="jki-f-av sg-av-presence-wrap">${nmAvatarHtml(u.avatar)}<span class="sg-online-dot sm"></span></span>
            <div class="jki-f-info">
              <b>${esc(u.name)}${u.isFriend ? ' <span class="jki-fr-tag">Friend</span>' : ''}</b>
              <small>Lv.${u.level} · ${esc(u.actLabel)}</small>
            </div>
          </div>
          <button type="button" class="btn sm ${done ? 'ghost' : 'ok'}" data-nm-inv-uid="${esc(u.uid)}" ${done ? 'disabled' : ''}>${done ? 'Invited ✓' : 'Invite'}</button>
        </div>
      `;
    }).join('');
  };
  renderList('');

  const listWrap = $('#nmInvList', m);
  if (listWrap) {
    listWrap.onclick = (e) => {
      const btn = e.target.closest('[data-nm-inv-uid]');
      if (!btn || btn.disabled) return;
      const friend = contacts.find(c => c.uid === btn.dataset.nmInvUid);
      if (!friend) return;
      invitedSet.add(friend.uid);
      btn.textContent = 'Invited ✓';
      btn.disabled = true;
      btn.classList.remove('ok');
      btn.classList.add('ghost');
      if (typeof sendUniversalRoomInviteToDm === 'function') {
        sendUniversalRoomInviteToDm(friend, {
          gameId: 'number_match',
          gameName: 'Number Match',
          roomCode,
          mode,
          stake,
          text: shareText
        });
      }
      if (typeof playSfx === 'function') playSfx('turnStart');
      if (typeof toast === 'function') toast(`Clickable Number Match invite sent to ${friend.name}!`);
      if (typeof o.onInviteFriend === 'function') o.onInviteFriend(friend);
    };
  }

  const searchIn = $('#nmInvSearch', m);
  if (searchIn) searchIn.oninput = () => renderList(searchIn.value);

  const copyBtn = $('#nmInvCopy', m);
  if (copyBtn) {
    copyBtn.onclick = () => {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(shareText).catch(() => {});
      }
      if (typeof playSfx === 'function') playSfx('tap');
      if (typeof toast === 'function') toast(`Copied Number Match Invite (${roomCode})!`);
    };
  }

  const worldBtn = $('#nmInvWorld', m);
  if (worldBtn) {
    worldBtn.onclick = () => {
      if (typeof sendWorldMsg === 'function') {
        sendWorldMsg(shareText, { type: 'game_invite', gameId: 'number_match', gameName: 'Number Match', roomCode, mode, stake, url: shareUrl });
      }
      if (typeof playSfx === 'function') playSfx('chatSend');
      if (typeof toast === 'function') toast(`Shared Number Match Room ${roomCode} to World Chat!`);
    };
  }

  return m;
}
window.openNumberMatchInviteModal = openNumberMatchInviteModal;

function openNumberMatchLobby(opts) {
  const o = opts || {};
  let mode = o.mode === 'duel' ? 'duel' : 'classic';
  let stake = Math.max(0, Number(o.stake || 0));
  let roomCode = String(o.roomCode || ('NM' + Math.floor(1000 + Math.random() * 9000))).toUpperCase();
  let selectedRival = o.rival || null;
  const stakes = [0, 25, 50, 100, 250];

  const m = modal('🔢 Number Match · Puzzle Arena', `<div id="nmLobbyBody" data-testid="nm-lobby"></div>`, 'ludo-lobby-modal');

  const renderLobby = () => {
    const body = $('#nmLobbyBody', m);
    if (!body) return;
    const pay = typeof calcArenaStakePayout === 'function' ? calcArenaStakePayout(stake) : { winnerPayout: stake * 2, feePercent: 10 };
    const winCoins = pay.winnerPayout || (stake * 2);
    const myCoins = typeof me !== 'undefined' ? clampCoins(me.coins) : 0;
    const cantAfford = stake > 0 && myCoins < stake;

    body.innerHTML = `
      <div class="ld-lob-hero nm-lob-hero">
        <div class="ld-lob-crest nm-lob-crest" aria-hidden="true">🔢</div>
        <div class="ld-lob-title">
          <b>Number Match 3D</b>
          <small>Match Same or Sum-10 · Clear Rows · Combos</small>
        </div>
        <span class="ld-lob-code-pill">Room ${esc(roomCode)}</span>
      </div>

      <div class="ld-lob-sec">
        <label>Game Mode</label>
        <div class="ld-seg-row">
          <button type="button" class="ld-seg-btn ${mode === 'classic' ? 'on' : ''}" data-nm-mode="classic">✨ Classic Stage Clear</button>
          <button type="button" class="ld-seg-btn ${mode === 'duel' ? 'on' : ''}" data-nm-mode="duel">⚔️ 1v1 60s Score Duel</button>
        </div>
      </div>

      <div class="ld-lob-sec">
        <label>Entry Stake ${stake > 0 ? `(Win +${fmtNum(winCoins)} 🪙 · ${pay.feePercent || 10}% fee)` : '(Free Play · Earn Coins & EXP)'}</label>
        <div class="ld-stake-row">
          ${stakes.map(s => `
            <button type="button" class="ld-stake-btn ${stake === s ? 'on' : ''}" data-nm-stake="${s}">
              ${s === 0 ? 'FREE' : `🪙 ${s}`}
            </button>
          `).join('')}
        </div>
      </div>

      <div class="ld-lob-join-row">
        <input type="text" id="nmJoinCodeIn" placeholder="Enter Room Code (e.g. NM4821)…" maxlength="10" value="${o.joinedFromInvite ? esc(roomCode) : ''}">
        <button type="button" class="btn sm ghost" id="nmApplyCodeBtn">Set Room</button>
      </div>

      <div class="ld-lob-actions">
        <button type="button" class="btn ok full" id="nmStartBtn" ${cantAfford ? 'disabled' : ''}>
          ${cantAfford ? `Need ${stake} 🪙 to Play` : `🔢 Play Number Match (${mode === 'duel' ? '1v1 Duel' : 'Classic'} · ${stake > 0 ? stake + ' 🪙' : 'Free'})`}
        </button>
        <div class="row" style="gap:8px;margin-top:8px">
          <button type="button" class="btn gold sm" id="nmLobInviteBtn" style="flex:1">👥 Invite Friends</button>
          <button type="button" class="btn ghost sm" id="nmLobWorldBtn" style="flex:1">🌍 Share to World Chat</button>
          <button type="button" class="btn ghost sm" id="nmLobRulesBtn">📖</button>
        </div>
      </div>
    `;

    body.onclick = (e) => {
      const mBtn = e.target.closest('[data-nm-mode]');
      if (mBtn) {
        mode = mBtn.dataset.nmMode;
        if (typeof playSfx === 'function') playSfx('tap');
        renderLobby();
        return;
      }
      const sBtn = e.target.closest('[data-nm-stake]');
      if (sBtn) {
        stake = Number(sBtn.dataset.nmStake) || 0;
        if (typeof playSfx === 'function') playSfx('tap');
        renderLobby();
        return;
      }
      if (e.target.closest('#nmApplyCodeBtn')) {
        const val = String($('#nmJoinCodeIn', body)?.value || '').trim().toUpperCase();
        if (val.length >= 4) {
          roomCode = val;
          if (typeof playSfx === 'function') playSfx('tap');
          toast(`Joined Room Code ${roomCode}`);
          renderLobby();
        } else {
          if (typeof playSfx === 'function') playSfx('duelWrong');
          toast('Enter a valid Room Code');
        }
        return;
      }
      if (e.target.closest('#nmLobRulesBtn')) {
        if (typeof playSfx === 'function') playSfx('tap');
        openNumberMatchRulesModal();
        return;
      }
      if (e.target.closest('#nmLobInviteBtn')) {
        if (typeof playSfx === 'function') playSfx('tap');
        openNumberMatchInviteModal({
          mode, stake, roomCode,
          onInviteFriend: (fr) => { if (fr) selectedRival = fr; }
        });
        return;
      }
      if (e.target.closest('#nmLobWorldBtn')) {
        const url = typeof buildRoomInviteUrl === 'function'
          ? buildRoomInviteUrl({ gameId: 'number_match', roomCode, mode })
          : `?room=${roomCode}&game=number_match&mode=${mode}`;
        const txt = `🔢 Join my Number Match (${mode === 'duel' ? '1v1 Score Duel' : 'Classic Puzzle'}${stake > 0 ? ' · ' + stake + ' 🪙' : ' · Free'})! Room Code: ${roomCode} ${url}`;
        if (typeof sendWorldMsg === 'function') {
          sendWorldMsg(txt, { type: 'game_invite', gameId: 'number_match', gameName: 'Number Match', roomCode, mode, stake, url });
        }
        if (typeof playSfx === 'function') playSfx('chatSend');
        toast(`Posted Number Match Room ${roomCode} to World Chat!`);
        return;
      }
      if (e.target.closest('#nmStartBtn')) {
        if (stake > 0) {
          if (me.coins < stake) return toast(`Need ${stake} coins for this stake`);
          addReward(-stake, 0, null, true, { silentSfx: true, skipLevelUp: true });
          if (typeof playSfx === 'function') playSfx('stakeLock');
        } else if (typeof playSfx === 'function') {
          playSfx('turnStart');
        }
        m.close();
        launchNumberMatch({
          mode,
          stake,
          stage: 1,
          roomCode,
          rival: selectedRival
        });
      }
    };
  };

  renderLobby();
  return m;
}
window.openNumberMatchLobby = openNumberMatchLobby;

function launchNumberMatch(opts) {
  const Rules = window.NumberMatchRules;
  if (!Rules) {
    if (typeof toast === 'function') toast('Number Match rules failed to load');
    return;
  }
  const o = opts || {};
  const mode = o.mode === 'duel' ? 'duel' : 'classic';
  const stake = Math.max(0, Math.floor(Number(o.stake || 0)));
  const stage = Math.max(1, Math.floor(Number(o.stage || 1)));
  const roomCode = String(o.roomCode || ('NM' + Math.floor(1000 + Math.random() * 9000))).toUpperCase();
  const isSpectating = Boolean(o.spectate);
  const spectateHost = o.spectateHost || o.rival || null;
  const oppName = o.rival?.name || (stake > 0 ? 'Pro Solver Bot' : 'Nova Bot');
  const pay = typeof calcArenaStakePayout === 'function' ? calcArenaStakePayout(stake) : { grossPot: stake * 2, winnerPayout: stake * 2 };

  if (!isSpectating && typeof setMyLiveActivity === 'function') {
    setMyLiveActivity({ type: 'playing', gameId: 'number_match', gameName: 'Number Match', roomCode, mode });
  }

  let grid = Rules.createBoard(stage);
  let selected = null; // { r, c }
  let hintPair = null; // [r1, c1, r2, c2]
  let score = 0;
  let rivalScore = 0;
  let combo = 0;
  let maxCombo = 0;
  let pairsCleared = 0;
  let rowsCleared = 0;
  let addUsesLeft = Rules.MAX_ADD_USES;
  let undoStack = [];
  let over = false;
  let timeLeft = mode === 'duel' ? 60 : 0;
  let duelTimer = 0;
  let rivalTimer = 0;
  let specTimer = 0;
  let beamTimeout = 0;
  let chatWidget = null;
  let bestScore = 0;
  try { bestScore = Number(localStorage.getItem('sg_nm_best') || 0); } catch {}

  const view = typeof openFullScreenGameView === 'function'
    ? openFullScreenGameView({
        gameId: 'number_match',
        title: 'Number Match',
        subMeta: mode === 'duel' ? `1v1 Duel · Room ${roomCode}` : `Stage ${stage} · Room ${roomCode}`,
        statusText: isSpectating ? 'Spectating' : (mode === 'duel' ? '60s Duel' : `Stage ${stage}`),
        statusTone: 'turn',
        themeClass: 'gfs-theme-number-match',
        html: `
          <div class="nm-stage" id="nmStage" data-testid="number-match-stage">
            ${isSpectating ? `
              <div class="sg-spectate-banner" data-testid="nm-spectate-banner">
                <span>👁️ Spectating <b>${esc(spectateHost?.name || 'Player')}</b> · Room ${esc(roomCode)}</span>
                <button type="button" class="btn sm ghost" id="nmSpecExit">Exit View</button>
              </div>
            ` : ''}

            <div class="ld-top-bar nm-top-bar">
              <div class="ld-tl">
                <div class="ld-id-block">
                  <small>${stake > 0 ? `🪙 ${fmtNum(pay.winnerPayout || pay.grossPot)} Pot · Room ${esc(roomCode)}` : `Room ${esc(roomCode)} · Same or Sum 10`}</small>
                </div>
              </div>
              <div class="ld-tr">
                <button type="button" class="jk-mini-pill" id="nmRulesBtn" title="Rules" aria-label="Number Match Rules">📖</button>
                <button type="button" class="jk-invite-pill" id="nmInviteBtn" aria-label="Invite Friends">+ Invite</button>
                <button type="button" class="jk-mini-pill" id="nmQvBtn" title="Quick Voice" aria-label="Quick Voice">🗣️</button>
              </div>
            </div>

            <div class="nm-hud-bar">
              <div class="nm-stat-pill score">
                <small>SCORE</small>
                <b id="nmScoreVal" data-testid="nm-score">0</b>
              </div>
              ${mode === 'duel' ? `
                <div class="nm-stat-pill timer">
                  <small>TIME</small>
                  <b id="nmTimeVal">60s</b>
                </div>
                <div class="nm-stat-pill rival">
                  <small>${esc(oppName.slice(0, 10).toUpperCase())}</small>
                  <b id="nmRivalVal">0</b>
                </div>
              ` : `
                <div class="nm-stat-pill combo">
                  <small>COMBO</small>
                  <b id="nmComboVal">×1</b>
                </div>
                <div class="nm-stat-pill rem">
                  <small>LEFT</small>
                  <b id="nmRemVal">${Rules.countRemaining(grid)}</b>
                </div>
              `}
            </div>

            <div class="nm-board-frame" id="nmBoardFrame">
              <div class="nm-board-head">
                <span class="nm-rule-chip">Match <b>Same (7=7)</b> or <b>Sum 10 (3+7)</b></span>
                <span class="nm-best-chip" id="nmPairsChip">Pairs: 0</span>
              </div>
              <div class="nm-grid-viewport" id="nmGridViewport">
                <div class="nm-grid" id="nmGrid" data-testid="nm-grid" role="grid" aria-label="Number Match Puzzle Board"></div>
                <svg class="nm-beam-svg" id="nmBeamSvg" aria-hidden="true"></svg>
                <div class="nm-float-layer" id="nmFloatLayer" aria-hidden="true"></div>
              </div>
            </div>

            <div class="nm-dock" id="nmDock">
              <button type="button" class="nm-act-btn" id="nmUndoBtn" data-testid="nm-undo-btn" ${isSpectating ? 'disabled' : ''}>
                <span class="nm-act-ico">↩️</span>
                <b>Undo</b>
              </button>
              <button type="button" class="nm-act-btn primary" id="nmAddRowsBtn" data-testid="nm-add-rows-btn" ${isSpectating ? 'disabled' : ''}>
                <span class="nm-act-ico">➕</span>
                <b>Add Rows <i id="nmAddBadge">${addUsesLeft}</i></b>
              </button>
              <button type="button" class="nm-act-btn gold" id="nmHintBtn" data-testid="nm-hint-btn" ${isSpectating ? 'disabled' : ''}>
                <span class="nm-act-ico">💡</span>
                <b>Hint</b>
              </button>
            </div>

            <div class="ld-chat-host" id="nmChatHost"></div>
          </div>
        `
      })
    : modal('🔢 Number Match', '<div id="nmStage"></div>');

  const rootEl = view.root || view;

  const stopTimers = () => {
    clearInterval(duelTimer);
    clearInterval(rivalTimer);
    clearInterval(specTimer);
    clearTimeout(beamTimeout);
  };

  const spawnFloatText = (text, tone = 'gold') => {
    const layer = $('#nmFloatLayer', rootEl);
    if (!layer) return;
    const el = document.createElement('div');
    el.className = `nm-floater ${tone}`;
    el.textContent = text;
    layer.appendChild(el);
    setTimeout(() => { if (el.parentNode) el.remove(); }, 1050);
  };

  const flashConnectorBeam = (r1, c1, r2, c2, color = '#fde047') => {
    const svg = $('#nmBeamSvg', rootEl);
    const vp = $('#nmGridViewport', rootEl);
    if (!svg || !vp) return;
    const cellA = vp.querySelector(`[data-nm-cell="${r1},${c1}"]`);
    const cellB = vp.querySelector(`[data-nm-cell="${r2},${c2}"]`);
    if (!cellA || !cellB) return;
    const vpRect = vp.getBoundingClientRect();
    const aRect = cellA.getBoundingClientRect();
    const bRect = cellB.getBoundingClientRect();
    const x1 = aRect.left - vpRect.left + aRect.width / 2 + vp.scrollLeft;
    const y1 = aRect.top - vpRect.top + aRect.height / 2 + vp.scrollTop;
    const x2 = bRect.left - vpRect.left + bRect.width / 2 + vp.scrollLeft;
    const y2 = bRect.top - vpRect.top + bRect.height / 2 + vp.scrollTop;
    svg.setAttribute('width', String(vp.scrollWidth));
    svg.setAttribute('height', String(vp.scrollHeight));
    svg.innerHTML = `
      <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="5" stroke-linecap="round" opacity="0.92"/>
      <circle cx="${x1}" cy="${y1}" r="8" fill="#ffffff" stroke="${color}" stroke-width="3"/>
      <circle cx="${x2}" cy="${y2}" r="8" fill="#ffffff" stroke="${color}" stroke-width="3"/>
    `;
    clearTimeout(beamTimeout);
    beamTimeout = setTimeout(() => { if (svg) svg.innerHTML = ''; }, 340);
  };

  const syncHud = () => {
    const scoreEl = $('#nmScoreVal', rootEl);
    if (scoreEl) scoreEl.textContent = String(score);
    const comboEl = $('#nmComboVal', rootEl);
    if (comboEl) comboEl.textContent = `×${Math.max(1, combo)}`;
    const remEl = $('#nmRemVal', rootEl);
    if (remEl) remEl.textContent = String(Rules.countRemaining(grid));
    const rivalEl = $('#nmRivalVal', rootEl);
    if (rivalEl) rivalEl.textContent = String(rivalScore);
    const timeEl = $('#nmTimeVal', rootEl);
    if (timeEl) timeEl.textContent = `${Math.max(0, timeLeft)}s`;
    const pairsEl = $('#nmPairsChip', rootEl);
    if (pairsEl) pairsEl.textContent = `Pairs: ${pairsCleared}${rowsCleared > 0 ? ` · Rows: ${rowsCleared}` : ''}`;
    const addBadge = $('#nmAddBadge', rootEl);
    if (addBadge) addBadge.textContent = String(addUsesLeft);
    const addBtn = $('#nmAddRowsBtn', rootEl);
    if (addBtn) addBtn.disabled = isSpectating || over || addUsesLeft <= 0 || Rules.countRemaining(grid) === 0;
    const undoBtn = $('#nmUndoBtn', rootEl);
    if (undoBtn) undoBtn.disabled = isSpectating || over || undoStack.length === 0;
    const hintBtn = $('#nmHintBtn', rootEl);
    if (hintBtn) hintBtn.disabled = isSpectating || over;
  };

  const renderGrid = () => {
    const gridEl = $('#nmGrid', rootEl);
    if (!gridEl) return;
    const hSet = new Set();
    if (hintPair) {
      hSet.add(`${hintPair[0]},${hintPair[1]}`);
      hSet.add(`${hintPair[2]},${hintPair[3]}`);
    }
    let html = '';
    for (let r = 0; r < grid.length; r++) {
      for (let c = 0; c < Rules.COLS; c++) {
        const val = Number(grid[r]?.[c]) || 0;
        const key = `${r},${c}`;
        if (val <= 0) {
          html += `<div class="nm-cell empty" data-nm-cell="${key}" aria-hidden="true"></div>`;
          continue;
        }
        const pal = NM_TILE_PALETTE[val] || NM_TILE_PALETTE[1];
        const isSel = selected && selected.r === r && selected.c === c;
        const isHint = hSet.has(key);
        html += `<button type="button" class="nm-cell filled ${isSel ? 'is-selected' : ''} ${isHint ? 'is-hint' : ''}" data-nm-cell="${key}" data-val="${val}" style="--nm-top:${pal.top};--nm-bot:${pal.bot};--nm-glow:${pal.glow}" aria-label="Row ${r + 1} Column ${c + 1} number ${val}" aria-pressed="${isSel ? 'true' : 'false'}"><span>${val}</span></button>`;
      }
    }
    gridEl.innerHTML = html;
    syncHud();
  };

  const finishGame = (outcome, reasonText) => {
    if (over) return;
    over = true;
    stopTimers();
    if (score > bestScore) {
      bestScore = score;
      try { localStorage.setItem('sg_nm_best', String(bestScore)); } catch {}
    }

    let res = {
      headline: outcome === 'win' ? '🏆 STAGE CLEARED!' : (outcome === 'tie' ? '🤝 CLOSE DRAW!' : '⏱️ MATCH COMPLETE'),
      detail: reasonText || `Score ${score}`
    };

    if (!isSpectating) {
      if (typeof settleArenaMatchOutcome === 'function') {
        res = settleArenaMatchOutcome(outcome, stake, mode === 'duel' ? 46 : 38, 36, 12);
      } else if (typeof playSfx === 'function') {
        playSfx(outcome === 'win' ? 'duelWin' : 'matchLose');
      }
    } else if (outcome === 'win' && typeof playSfx === 'function') {
      playSfx('duelWin');
    }

    if (outcome === 'win' && typeof spawnArenaSparks === 'function') {
      spawnArenaSparks($('#nmStage', rootEl), '#fde047', 18);
      setTimeout(() => {
        if (rootEl && rootEl.isConnected) spawnArenaSparks($('#nmStage', rootEl), '#38bdf8', 14);
      }, 220);
    }

    if (typeof view.setStatus === 'function') {
      view.setStatus(outcome === 'win' ? 'Victory!' : 'Finished', outcome === 'win' ? 'ok' : 'bot');
    }

    const host = document.createElement('div');
    host.className = 'uno-go-overlay';
    host.setAttribute('data-testid', 'nm-gameover-overlay');
    host.innerHTML = `
      <div class="uno-go-card nm-go-card">
        <div class="nm-go-trophy" aria-hidden="true">${outcome === 'win' ? '🏆' : (outcome === 'tie' ? '🤝' : '🔢')}</div>
        <h3 class="uno-go-h">${esc(res.headline)}</h3>
        <p class="uno-go-sub">${esc(reasonText || res.detail)}</p>
        <div class="nm-go-stats">
          <div><small>Score</small><b>${score}</b></div>
          <div><small>Pairs</small><b>${pairsCleared}</b></div>
          <div><small>Best Combo</small><b>×${Math.max(1, maxCombo)}</b></div>
        </div>
        <div class="uno-go-actions" style="margin-top:14px">
          <button type="button" class="uno-go-exit" id="nmGoExit">Exit</button>
          <button type="button" class="uno-go-again" id="nmGoAgain">${outcome === 'win' && mode === 'classic' ? `Stage ${stage + 1} →` : 'Play Again'}</button>
        </div>
      </div>
    `;
    rootEl.appendChild(host);
    $('#nmGoExit', host).onclick = () => view.close();
    $('#nmGoAgain', host).onclick = () => {
      view.close();
      launchNumberMatch({
        mode,
        stake: 0,
        stage: outcome === 'win' && mode === 'classic' ? stage + 1 : stage,
        roomCode,
        rival: o.rival
      });
    };
  };

  const checkStalemate = () => {
    if (over) return;
    const rem = Rules.countRemaining(grid);
    if (rem === 0) {
      if (mode === 'classic') {
        finishGame('win', `Cleared Stage ${stage} with ${score} pts!`);
      } else {
        // In 1v1 Duel, clearing a board gives a huge +120 bonus and deals a fresh board!
        score += 120;
        spawnFloatText('BOARD CLEAR! +120 ✨', 'ok');
        if (typeof playSfx === 'function') playSfx('rowClear');
        if (typeof spawnArenaSparks === 'function') spawnArenaSparks($('#nmStage', rootEl), '#34d399', 14);
        grid = Rules.createBoard(stage + 1);
        addUsesLeft = Rules.MAX_ADD_USES;
        selected = null;
        hintPair = null;
        renderGrid();
      }
      return;
    }
    const anyPair = Rules.findHintPair(grid);
    if (!anyPair) {
      if (addUsesLeft > 0) {
        spawnFloatText('No pairs left — tap + Add Rows!', 'info');
      } else if (mode === 'classic') {
        // Player cleared substantial progress -> treat >= 60% cleared as victory? No, real puzzle end:
        finishGame(pairsCleared >= 12 ? 'win' : 'lose', pairsCleared >= 12 ? `Great run! Cleared ${pairsCleared} pairs (${score} pts)` : `No moves left · Score ${score}`);
      }
    }
  };

  const executePairMatch = (r1, c1, r2, c2) => {
    const valA = grid[r1]?.[c1];
    const valB = grid[r2]?.[c2];
    const prevSnapshot = { grid: Rules.cloneGrid(grid), score, combo, pairsCleared, rowsCleared };

    const res = Rules.applyMatch(grid, r1, c1, r2, c2, combo + 1);
    if (!res.ok) return false;

    const beamColor = res.matchType === 'sum10' ? '#34d399' : '#fde047';
    flashConnectorBeam(r1, c1, r2, c2, beamColor);

    undoStack.push(prevSnapshot);
    if (undoStack.length > 15) undoStack.shift();

    grid = res.grid;
    combo++;
    if (combo > maxCombo) maxCombo = combo;
    pairsCleared++;
    rowsCleared += res.clearedRows;
    score += res.points;
    selected = null;
    hintPair = null;

    if (res.clearedRows > 0) {
      if (typeof playSfx === 'function') playSfx('rowClear');
      spawnFloatText(`ROW CLEAR! +${res.points} ✨`, 'ok');
      if (typeof spawnArenaSparks === 'function') spawnArenaSparks($('#nmBoardFrame', rootEl), '#34d399', 14);
    } else {
      if (typeof playSfx === 'function') playSfx('pairMatch', { combo });
      const tag = res.matchType === 'sum10' ? `${valA}+${valB}=10!` : `${valA}=${valB}!`;
      spawnFloatText(`${tag} +${res.points}${combo >= 3 ? ` · ×${combo}🔥` : ''}`, res.matchType === 'sum10' ? 'ok' : 'gold');
    }

    renderGrid();
    setTimeout(checkStalemate, 160);
    return true;
  };

  const handleCellTap = (r, c) => {
    if (over || isSpectating) return;
    const val = Number(grid[r]?.[c]) || 0;
    if (val <= 0) return;

    if (!selected) {
      selected = { r, c };
      if (typeof playSfx === 'function') playSfx('tap');
      renderGrid();
      return;
    }

    if (selected.r === r && selected.c === c) {
      selected = null;
      if (typeof playSfx === 'function') playSfx('tap');
      renderGrid();
      return;
    }

    if (Rules.canMatchPair(grid, selected.r, selected.c, r, c)) {
      executePairMatch(selected.r, selected.c, r, c);
      return;
    }

    // Wrong match feedback: shake both cells + error sound + reset combo
    const prevR = selected.r, prevC = selected.c;
    combo = 0;
    selected = null;
    if (typeof playSfx === 'function') playSfx('duelWrong');
    renderGrid();
    const cellA = rootEl.querySelector(`[data-nm-cell="${prevR},${prevC}"]`);
    const cellB = rootEl.querySelector(`[data-nm-cell="${r},${c}"]`);
    [cellA, cellB].forEach(el => {
      if (!el) return;
      el.classList.add('is-wrong');
      setTimeout(() => el.classList.remove('is-wrong'), 340);
    });
  };

  // Delegated click handler on puzzle grid
  const gridEl = $('#nmGrid', rootEl);
  if (gridEl) {
    gridEl.onclick = (e) => {
      const btn = e.target.closest('[data-nm-cell]');
      if (!btn || btn.classList.contains('empty')) return;
      const [r, c] = btn.dataset.nmCell.split(',').map(Number);
      handleCellTap(r, c);
    };
  }

  // Dock actions
  const hintBtn = $('#nmHintBtn', rootEl);
  if (hintBtn) {
    hintBtn.onclick = () => {
      if (over || isSpectating) return;
      const p = Rules.findHintPair(grid);
      if (p) {
        hintPair = p;
        selected = null;
        if (typeof playSfx === 'function') playSfx('turnStart');
        renderGrid();
        const firstEl = rootEl.querySelector(`[data-nm-cell="${p[0]},${p[1]}"]`);
        if (firstEl && typeof firstEl.scrollIntoView === 'function') {
          firstEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
      } else {
        if (typeof playSfx === 'function') playSfx('duelWrong');
        spawnFloatText(addUsesLeft > 0 ? 'Tap + Add Rows!' : 'No valid pairs left', 'warn');
      }
    };
  }

  const addRowsBtn = $('#nmAddRowsBtn', rootEl);
  if (addRowsBtn) {
    addRowsBtn.onclick = () => {
      if (over || isSpectating || addUsesLeft <= 0) return;
      const res = Rules.appendRemainingRows(grid);
      if (!res.ok) return;
      undoStack.push({ grid: Rules.cloneGrid(grid), score, combo, pairsCleared, rowsCleared, addUsesLeft });
      grid = res.grid;
      addUsesLeft--;
      selected = null;
      hintPair = null;
      if (typeof playSfx === 'function') playSfx('addRows');
      spawnFloatText(`+${res.addedCount} Tiles Added!`, 'info');
      renderGrid();
      const vp = $('#nmGridViewport', rootEl);
      if (vp) vp.scrollTop = vp.scrollHeight;
    };
  }

  const undoBtn = $('#nmUndoBtn', rootEl);
  if (undoBtn) {
    undoBtn.onclick = () => {
      if (over || isSpectating || !undoStack.length) return;
      const snap = undoStack.pop();
      grid = snap.grid;
      score = snap.score;
      combo = snap.combo;
      pairsCleared = snap.pairsCleared;
      rowsCleared = snap.rowsCleared;
      if (typeof snap.addUsesLeft === 'number') addUsesLeft = snap.addUsesLeft;
      selected = null;
      hintPair = null;
      if (typeof playSfx === 'function') playSfx('tap');
      renderGrid();
    };
  }

  // Top bar buttons
  if ($('#nmExitBtn', rootEl)) $('#nmExitBtn', rootEl).onclick = () => view.close();
  if ($('#nmSpecExit', rootEl)) $('#nmSpecExit', rootEl).onclick = () => view.close();
  if ($('#nmRulesBtn', rootEl)) $('#nmRulesBtn', rootEl).onclick = () => { if (typeof playSfx === 'function') playSfx('tap'); openNumberMatchRulesModal(); };
  if ($('#nmInviteBtn', rootEl)) $('#nmInviteBtn', rootEl).onclick = () => { if (typeof playSfx === 'function') playSfx('tap'); openNumberMatchInviteModal({ mode, stake, roomCode }); };
  if ($('#nmQvBtn', rootEl)) {
    $('#nmQvBtn', rootEl).onclick = (e) => {
      e.stopPropagation();
      if (typeof QuickVoice !== 'undefined') {
        QuickVoice.openPanel($('#nmQvBtn', rootEl), 'squad_arena', (text, ico) => {
          spawnFloatText(`${ico} ${text}`, 'info');
          if (chatWidget) chatWidget.pushMessage(me?.name || 'You', `${ico} ${text}`, { spectate: isSpectating });
        });
      }
    };
  }

  // 1v1 Duel timers (60s countdown + smart rival score ticks)
  if (mode === 'duel' && !isSpectating) {
    duelTimer = setInterval(() => {
      if (over) return;
      timeLeft--;
      syncHud();
      if (timeLeft <= 0) {
        const outcome = score > rivalScore ? 'win' : (score === rivalScore ? 'tie' : 'lose');
        finishGame(outcome, `Final Score: You ${score} vs ${oppName} ${rivalScore}`);
      }
    }, 1000);

    rivalTimer = setInterval(() => {
      if (over) return;
      const stepPts = stake > 0 ? (15 + Math.floor(Math.random() * 18)) : (10 + Math.floor(Math.random() * 14));
      rivalScore += stepPts;
      syncHud();
    }, stake > 0 ? 3200 : 4100);
  }

  // Spectate auto-play loop so spectators watch live matches clear pairs
  if (isSpectating) {
    specTimer = setInterval(() => {
      if (over) return;
      const p = Rules.findHintPair(grid);
      if (p) {
        executePairMatch(p[0], p[1], p[2], p[3]);
      } else if (addUsesLeft > 0) {
        const res = Rules.appendRemainingRows(grid);
        if (res.ok) {
          grid = res.grid;
          addUsesLeft--;
          if (typeof playSfx === 'function') playSfx('addRows');
          renderGrid();
        }
      } else {
        finishGame('win', `${spectateHost?.name || 'Host'} finished with ${score} pts!`);
      }
    }, 1400);
  }

  // In-game chat widget
  const chatHost = $('#nmChatHost', rootEl);
  if (chatHost && typeof createInGameChatWidget === 'function') {
    chatWidget = createInGameChatWidget({
      roomCode,
      gameId: 'number_match',
      spectate: isSpectating,
      quickLines: ['Sum 10! 🔥', 'Row cleared! ✨', 'Nice combo! ⚡', 'Good game! 👏', 'So close! 😎']
    });
    chatWidget.mount(chatHost);
  }

  // Expose controlled test helper on active stage for clean automated win-flow inspection
  const stageEl = $('#nmStage', rootEl);
  if (stageEl) {
    stageEl.__nmTestClearBoard = () => {
      if (over) return;
      grid = [[5, 5, 0, 0, 0, 0, 0, 0, 0]];
      selected = null;
      hintPair = null;
      renderGrid();
    };
  }

  view.onclose = () => {
    over = true;
    stopTimers();
    if (chatWidget) chatWidget.destroy();
    if (!isSpectating && typeof setMyLiveActivity === 'function') setMyLiveActivity({ type: 'online' });
    if (typeof QuickVoice !== 'undefined') QuickVoice.closePanel();
  };

  renderGrid();
}
window.launchNumberMatch = launchNumberMatch;
