"use strict";
/* =====================================================================
   VISUAL MODE SELECTION SCREEN (UNIFIED FOR ALL ARENA GAMES)
   · Bot VS (Normal Free / Hard 50 Coins with Balance Check)
   · Player VS (Coin Bet Selector with Payout Rules & Firestore Sync)
   · Invite Friend (Room Code, Invite Link, Copy, World Chat, Friend Invite, Join Code)
   ===================================================================== */

const MODE_CODE_PREFIX = {
  budget_clash: 'BC',
  couple_arena: 'CP',
  pool_8ball: 'PL',
  jackaroo: 'JK',
  uno: 'UN',
  chess_blitz: 'CH',
  tile_race: 'TR',
  trap_door: 'TD',
  mind_clash: 'MC',
  pocket_territory: 'PT',
  ludo: 'LU',
  number_match: 'NM'
};

function genGameRoomCode(gameId) {
  const pre = MODE_CODE_PREFIX[gameId] || 'SG';
  return pre + Math.floor(1000 + Math.random() * 9000);
}

function recordMatchHistory(gameId, outcome, stake, modeType) {
  try {
    if (typeof online !== 'undefined' && online && typeof db !== 'undefined' && db && typeof F !== 'undefined' && F && typeof uid !== 'undefined') {
      const id = 'm_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
      dbOp(() => F.setDoc(F.doc(db, 'match_history', id), {
        id,
        uid,
        name: (typeof me !== 'undefined' && me.name) || 'Player',
        gameId,
        outcome,
        stake: Number(stake || 0),
        modeType: modeType || 'bot',
        ts: Date.now()
      }));
    }
  } catch {}
}
window.recordMatchHistory = recordMatchHistory;

const _MS_FALLBACK_BUNDLES = {
  ludo: ['ludo-rules.js?v=30', 'ludo.js?v=30'],
  number_match: ['number-match-rules.js?v=30', 'number-match.js?v=30'],
  jackaroo: ['jackaroo-rules.js?v=30', 'jackaroo.js?v=30'],
  uno: ['uno-rules.js?v=30', 'uno.js?v=30'],
  pool_8ball: ['pool-8ball.js?v=30'],
  chess_blitz: ['chess-arena.js?v=30'],
  tile_race: ['voice-narrator.js?v=30', 'arcade-games.js?v=30'],
  trap_door: ['voice-narrator.js?v=30', 'arcade-games.js?v=30'],
  mind_clash: ['voice-narrator.js?v=30', 'arcade-games.js?v=30'],
  pocket_territory: ['voice-narrator.js?v=30', 'arcade-games.js?v=30'],
  budget_clash: ['voice-narrator.js?v=30', 'budget-clash.js?v=30'],
  couple_arena: ['voice-narrator.js?v=30', 'budget-clash.js?v=30', 'couple-arena.js?v=30']
};

function _msLoadScriptDirect(src) {
  return new Promise((resolve, reject) => {
    const base = src.split('?')[0];
    if ([...document.scripts].some(s => (s.getAttribute('src') || '').split('?')[0] === base)) {
      return resolve(true);
    }
    const el = document.createElement('script');
    el.src = src;
    el.async = false;
    el.onload = () => resolve(true);
    el.onerror = () => reject(new Error('Failed to load ' + base));
    document.head.appendChild(el);
  });
}

async function _msEnsureGameReady(gameId) {
  if (typeof ensureGameModule === 'function') {
    const ok = await ensureGameModule(gameId);
    if (ok) return true;
  }
  const files = _MS_FALLBACK_BUNDLES[gameId];
  if (!files || !files.length) return true;
  try {
    for (const f of files) await _msLoadScriptDirect(f);
    return true;
  } catch (err) {
    console.warn('Fallback game loader error:', err);
    return false;
  }
}

async function launchStandardizedGame(rawGameId, cfg) {
  const c = cfg || {};
  let gameId = String(rawGameId || '').trim().toLowerCase();
  let subMode = c.subMode || '';
  if (gameId === 'couple_mind_sync') { gameId = 'couple_arena'; subMode = subMode || 'mind_sync'; }
  else if (gameId === 'couple_truth_dare') { gameId = 'couple_arena'; subMode = subMode || 'truth_dare'; }
  else if (gameId === 'couple_most_likely') { gameId = 'couple_arena'; subMode = subMode || 'most_likely'; }
  else if (gameId === 'couple_love_meter') { gameId = 'couple_arena'; subMode = subMode || 'love_meter'; }

  const stake = Math.max(0, Math.floor(Number(c.stake || 0)));
  const botTier = c.botTier || (stake > 0 ? 'pro' : 'standard');
  const roomCode = c.roomCode || genGameRoomCode(gameId);
  const rival = c.rival || null;
  const modeType = c.modeType || 'bot';
  const stakeDeducted = Boolean(c.stakeDeducted);

  const ready = await _msEnsureGameReady(gameId);
  if (!ready) {
    if (typeof toast === 'function') toast('Could not load game. Please refresh & try again.');
    return false;
  }

  let launched = null;
  let matched = false;
  if (gameId === 'budget_clash' && typeof launchBudgetClash === 'function') {
    matched = true; launched = launchBudgetClash({ modeType, botTier, stake, stakeDeducted, subMode: subMode || 'ten_vs_cr', roomCode, rival });
  } else if (gameId === 'couple_arena' && typeof launchCoupleArena === 'function') {
    matched = true; launched = launchCoupleArena({ modeType, botTier, stake, stakeDeducted, subMode: subMode || 'mind_sync', roomCode, rival });
  } else if (gameId === 'pool_8ball' && typeof launchPool8BallPro === 'function') {
    matched = true; launched = launchPool8BallPro({ modeType, botTier, stake, roomCode, rival });
  } else if (gameId === 'jackaroo' && typeof launchJackaroo === 'function') {
    matched = true; launched = launchJackaroo(stake, rival, subMode === '2v2' ? '2v2' : '1v1', botTier, roomCode);
  } else if (gameId === 'uno' && typeof launchUnoGame === 'function') {
    matched = true; launched = launchUnoGame(stake, rival, subMode || (modeType === 'pvp' ? '1v1' : 'classic'), botTier, roomCode);
  } else if (gameId === 'chess_blitz' && typeof launchChessBlitzArena === 'function') {
    matched = true; launched = launchChessBlitzArena({ modeType, botTier, stake, roomCode, rival });
  } else if (gameId === 'tile_race' && typeof launchTileRace === 'function') {
    matched = true; launched = launchTileRace({ modeType, botTier, stake, roomCode, rival });
  } else if (gameId === 'trap_door' && typeof launchTrapDoorDuel === 'function') {
    matched = true; launched = launchTrapDoorDuel({ modeType, botTier, stake, roomCode, rival });
  } else if (gameId === 'mind_clash' && typeof launchMindClash === 'function') {
    matched = true; launched = launchMindClash({ modeType, botTier, stake, roomCode, rival });
  } else if (gameId === 'pocket_territory' && typeof launchPocketTerritory === 'function') {
    matched = true; launched = launchPocketTerritory({ modeType, botTier, stake, roomCode, rival });
  } else if (gameId === 'ludo' && typeof launchLudoGame === 'function') {
    matched = true; launched = launchLudoGame({ mode: subMode === '1v1' ? '1v1' : '4p', stake, botTier, roomCode, rival });
  } else if (gameId === 'number_match' && typeof launchNumberMatch === 'function') {
    matched = true; launched = launchNumberMatch({ mode: subMode === 'duel' ? 'duel' : 'classic', stake, roomCode, rival });
  } else if (gameId === 'blitz_dots' && typeof launchBlitzDots === 'function') {
    matched = true; launched = launchBlitzDots(stake, rival, botTier);
  } else if (gameId === 'squad_arena' && typeof launchSquadTrivia === 'function') {
    matched = true; launched = launchSquadTrivia(stake, rival, botTier);
  } else if (gameId === 'undercover' && typeof launchUndercoverSpy === 'function') {
    matched = true; launched = launchUndercoverSpy(stake, botTier);
  } else if ((gameId === 'ludo_snakes' || gameId === 'ludo_express') && typeof launchLudoExpress === 'function') {
    matched = true; launched = launchLudoExpress(stake, rival, botTier);
  }
  if (matched) return launched || true;
  if (typeof toast === 'function') toast('Could not start ' + (gameId || 'game') + '. Please refresh once.');
  return false;
}
window.launchStandardizedGame = launchStandardizedGame;

function openVisualModeSelect(gameId, rivalUid, extraOpts) {
  const AR = window.ArcadeRules;
  const g = (typeof ARENA_GAMES !== 'undefined' ? ARENA_GAMES.find(x => x.id === gameId) : null) || ARENA_GAMES[0];
  const o = extraOpts || {};
  const rival = o.rival || (rivalUid && typeof allUsers === 'function' ? allUsers().find(u => u.uid === rivalUid) : null);

  let modeType = o.initialTab || (rival ? 'pvp' : 'bot'); // 'bot' | 'pvp' | 'invite'
  let botDiff = 'normal'; // 'normal' | 'hard'
  const bets = AR ? AR.PLAYER_VS_BETS : [25, 50, 100, 250];
  const hardCost = AR ? AR.MODE_HARD_BOT_COST : 50;
  let pvpBet = o.stake > 0 ? Number(o.stake) : bets[0];
  let inviteBet = o.stake > 0 ? Number(o.stake) : 0;
  let subMode = o.mode || (g.modes && g.modes[0] ? g.modes[0].id : '');
  let roomCode = String(o.roomCode || genGameRoomCode(g.id)).toUpperCase();

  const iconBot = `<svg viewBox="0 0 36 36" width="32" height="32" fill="none" aria-hidden="true"><rect x="6" y="10" width="24" height="19" rx="6" fill="#1e293b" stroke="#38bdf8" stroke-width="2.2"/><circle cx="14" cy="19" r="2.6" fill="#38bdf8"/><circle cx="22" cy="19" r="2.6" fill="#38bdf8"/><path d="M14 24.5h8" stroke="#94a3b8" stroke-width="2" stroke-linecap="round"/><path d="M18 10V6" stroke="#38bdf8" stroke-width="2.2" stroke-linecap="round"/><circle cx="18" cy="5" r="2.2" fill="#fde047"/></svg>`;
  const iconPvp = `<svg viewBox="0 0 36 36" width="32" height="32" fill="none" aria-hidden="true"><path d="M8 28l18-18M22 8h6v6" stroke="#fbbf24" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M28 28L10 10M14 8H8v6" stroke="#f43f5e" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/><circle cx="18" cy="18" r="4.2" fill="#fde047" stroke="#78350f" stroke-width="1.5"/></svg>`;
  const iconInv = `<svg viewBox="0 0 36 36" width="32" height="32" fill="none" aria-hidden="true"><circle cx="14" cy="13" r="4.8" fill="#34d399" stroke="#ecfdf5" stroke-width="1.6"/><path d="M6.5 27c1-4.8 4.4-7.2 7.5-7.2s6.5 2.4 7.5 7.2" fill="#059669" stroke="#a7f3d0" stroke-width="1.6" stroke-linecap="round"/><path d="M27 12v8M23 16h8" stroke="#fde047" stroke-width="2.6" stroke-linecap="round"/></svg>`;

  const exclMap = window.ShowGamesRules && (window.ShowGamesRules.EXCLUSIVE_REWARDS || window.ShowGamesRules.GAME_EXCLUSIVE_REWARDS);
  const exclRewards = (exclMap && exclMap[g.id]) || [];
  const exclHtml = exclRewards.length ? `
    <div class="ms-excl-strip" data-testid="ms-exclusive-rewards">
      <div class="ms-excl-head">
        <span>✨ EXCLUSIVE GAME REWARDS</span>
        <small>Only obtainable here</small>
      </div>
      <div class="ms-excl-list">
        ${exclRewards.map(r => {
          const unlocked = typeof isUnlocked === 'function' && isUnlocked(`${r.kind}:${r.value}`);
          return `<div class="ms-excl-item ${unlocked ? 'is-owned' : ''}">
            <span class="ms-excl-ico">${r.icon}</span>
            <div class="ms-excl-meta">
              <b>${esc(r.label || r.name || '')}</b>
              <small>${esc(r.unlockRule || r.desc || '')}</small>
            </div>
            <span class="ms-excl-pill">${unlocked ? 'Owned ✓' : 'Exclusive'}</span>
          </div>`;
        }).join('')}
      </div>
    </div>
  ` : '';

  const isShowGame = g.id === 'budget_clash' || g.id === 'couple_arena';

  const view = openFullScreenGameView({
    gameId: g.id + '_mode_select',
    title: g.name,
    subMeta: `🪙 ${fmtNum(me.coins)}`,
    statusText: 'Select Mode',
    statusTone: 'neutral',
    themeClass: 'gfs-theme-lobby',
    html: `
      <div class="ms-shell" id="msShell" data-testid="mode-select-screen">
        <div class="ms-hero-banner">
          ${typeof renderArenaBannerArt === 'function' ? renderArenaBannerArt(g) : ''}
          <div class="ms-hero-scrim" style="justify-content:flex-end">
            <span class="ms-wallet-badge" id="msWalletBadge">🪙 ${fmtNum(me.coins)}</span>
          </div>
        </div>

        ${exclHtml}

        <div class="ms-mode-grid" role="tablist" aria-label="Game Mode">
          <button type="button" class="ms-mode-card ${modeType === 'bot' ? 'on' : ''}" data-mstype="bot" data-testid="mode-btn-bot">
            <span class="ms-mode-ico">${iconBot}</span>
            <b>Practice vs Bot</b>
          </button>
          <button type="button" class="ms-mode-card ${modeType === 'pvp' ? 'on' : ''}" data-mstype="pvp" data-testid="mode-btn-pvp">
            <span class="ms-mode-ico">${iconPvp}</span>
            <b>Coin Match</b>
          </button>
          <button type="button" class="ms-mode-card ${modeType === 'invite' ? 'on' : ''}" data-mstype="invite" data-testid="mode-btn-invite">
            <span class="ms-mode-ico">${iconInv}</span>
            <b>Invite Friend</b>
          </button>
        </div>

        ${g.modes && g.modes.length ? `
          <div class="ms-format-row" id="msFormatRow">
            ${g.modes.map(md => `<button type="button" class="ms-fmt-btn ${md.id === subMode ? 'on' : ''}" data-msfmt="${esc(md.id)}">${esc(md.label)}</button>`).join('')}
          </div>
        ` : ''}

        <div class="ms-panel" id="msPanel"></div>
      </div>
    `
  });

  const getInviteUrl = () => {
    if (typeof buildRoomInviteUrl === 'function') {
      return buildRoomInviteUrl({ gameId: g.id, roomCode, mode: subMode });
    }
    return `?room=${encodeURIComponent(roomCode)}&game=${encodeURIComponent(g.id)}`;
  };

  const ensureInviteRoomPersisted = () => {
    if (typeof persistMpRoom !== 'function') return;
    const existing = (typeof mpRooms !== 'undefined' && Array.isArray(mpRooms))
      ? mpRooms.find(r => String(r.code || '').toUpperCase() === roomCode)
      : null;
    if (existing) return existing;
    const now = Date.now();
    const room = {
      id: 'room_' + roomCode.toLowerCase() + '_' + now.toString(36),
      code: roomCode,
      mode: g.id,
      subMode,
      tierLabel: g.name,
      entryCoins: inviteBet,
      maxPlayers: subMode === '2v2' || subMode === '4p' ? 4 : 2,
      hostUid: uid,
      hostName: me.name || 'Player',
      status: 'waiting',
      seed: roomCode + '_' + now,
      roundNo: 1,
      createdAt: now,
      updatedAt: now,
      players: {
        [uid]: { uid, name: me.name || 'Player', avatar: me.avatar || '🦊', frame: me.frame || 'none', score: 0, finished: false, joinedAt: now }
      },
      chat: [{ id: 'sys_' + now, type: 'sys', text: `${me.name || 'Player'} created ${g.name} room ${roomCode}`, ts: now }]
    };
    persistMpRoom(room);
    return room;
  };

  const renderPanel = () => {
    const panel = $('#msPanel', view);
    if (!panel) return;
    const myCoins = Math.max(0, Math.floor(Number(me.coins || 0)));
    if ($('#msWalletBadge', view)) $('#msWalletBadge', view).textContent = `🪙 ${fmtNum(myCoins)}`;
    view.setSubMeta(`🪙 ${fmtNum(myCoins)}`);
    $$('[data-mstype]', view).forEach(b => b.classList.toggle('on', b.dataset.mstype === modeType));
    $$('[data-msfmt]', view).forEach(b => b.classList.toggle('on', b.dataset.msfmt === subMode));

    if (modeType === 'bot') {
      const canHard = myCoins >= hardCost;
      const check = AR
        ? AR.validateModeEntry({ modeType: 'bot', difficulty: botDiff, userCoins: myCoins })
        : { ok: botDiff === 'normal' || canHard, cost: botDiff === 'hard' ? hardCost : 0 };
      const pay = AR ? AR.calcMatchPayout(hardCost) : { winnerPayout: 90 };

      panel.innerHTML = `
        <div class="ms-diff-grid">
          <button type="button" class="ms-opt-card ${botDiff === 'normal' ? 'on' : ''}" data-msdiff="normal" data-testid="bot-normal-btn">
            <span class="ms-opt-ico">🟢</span>
            <b>Free Practice</b>
            <small class="ms-free-txt">XP ONLY · 0 🪙</small>
          </button>
          <button type="button" class="ms-opt-card ${botDiff === 'hard' ? 'on' : ''} ${!canHard ? 'locked' : ''}" data-msdiff="hard" data-testid="bot-hard-btn">
            <span class="ms-opt-ico">🔥</span>
            <b>Hard Stake</b>
            <small class="ms-coin-txt">🪙 ${hardCost} · Win ${pay.winnerPayout}</small>
          </button>
        </div>
        ${!check.ok ? `<div class="ms-warn-line" data-testid="ms-coin-warn">Not enough coins for Hard Mode (Need ${hardCost} 🪙)</div>` : ''}
        <button type="button" class="btn gold full ms-play-cta" id="msLaunchBtn" data-testid="ms-play-btn" ${!check.ok ? 'disabled' : ''}>
          ${botDiff === 'hard' ? `Play Hard · ${hardCost} 🪙` : `Play Free (XP Only)`}
        </button>
      `;

      $$('[data-msdiff]', panel).forEach(b => {
        b.onclick = () => {
          botDiff = b.dataset.msdiff === 'hard' ? 'hard' : 'normal';
          if (typeof playSfx === 'function') playSfx('tap');
          renderPanel();
        };
      });

      const launchBtn = $('#msLaunchBtn', panel);
      launchBtn.onclick = async () => {
        if (launchBtn.disabled) return;
        const res = AR
          ? AR.validateModeEntry({ modeType: 'bot', difficulty: botDiff, userCoins: me.coins })
          : { ok: true, cost: botDiff === 'hard' ? hardCost : 0, botTier: botDiff === 'hard' ? 'pro' : 'standard' };
        if (!res.ok) return toast(res.reason);
        const origTxt = launchBtn.textContent;
        launchBtn.disabled = true;
        launchBtn.textContent = 'Loading…';
        if (res.cost > 0) {
          addReward(-res.cost, 0, null, true, { silentSfx: true, skipLevelUp: true });
          if (typeof playSfx === 'function') playSfx('stakeLock');
        } else if (typeof playSfx === 'function') {
          playSfx('turnStart');
        }
        const started = await launchStandardizedGame(g.id, { modeType: 'bot', botTier: res.botTier, stake: res.cost, stakeDeducted: res.cost > 0, subMode, roomCode });
        if (!started) {
          if (res.cost > 0) addReward(res.cost, 0, null, true, { silentSfx: true, skipLevelUp: true });
          launchBtn.disabled = false;
          launchBtn.textContent = origTxt;
        }
      };
      return;
    }

    if (modeType === 'pvp') {
      const check = AR
        ? AR.validateModeEntry({ modeType: 'pvp', betAmount: pvpBet, userCoins: myCoins })
        : { ok: myCoins >= pvpBet, cost: pvpBet };
      const pay = AR ? AR.calcMatchPayout(pvpBet) : { grossPot: pvpBet * 2, winnerPayout: Math.round(pvpBet * 1.8), platformFee: Math.round(pvpBet * 0.2) };
      const tierLabels = ['Low', 'Mid', 'High', 'Pro'];

      panel.innerHTML = `
        <div class="ms-bet-grid">
          ${bets.map((b, i) => {
            const afford = myCoins >= b;
            return `<button type="button" class="ms-bet-card ${pvpBet === b ? 'on' : ''} ${!afford ? 'locked' : ''}" data-msbet="${b}" data-testid="pvp-bet-${b}">
              <small>${tierLabels[i] || 'Bet'}</small>
              <b>🪙 ${b}</b>
            </button>`;
          }).join('')}
        </div>
        <div class="ms-payout-bar">
          <span>Win Prize: <b style="color:var(--ok)">+${fmtNum(pay.winnerPayout)} 🪙</b></span>
          <span>Pot ${fmtNum(pay.grossPot)} · 10% Fee</span>
        </div>
        ${!check.ok ? `<div class="ms-warn-line" data-testid="ms-coin-warn">Insufficient coins (Need ${pvpBet} 🪙)</div>` : ''}
        <button type="button" class="btn gold full ms-play-cta" id="msLaunchBtn" data-testid="ms-play-btn" ${!check.ok ? 'disabled' : ''}>
          Play ${pvpBet} 🪙 Match
        </button>
      `;

      $$('[data-msbet]', panel).forEach(b => {
        b.onclick = () => {
          pvpBet = Number(b.dataset.msbet) || bets[0];
          if (typeof playSfx === 'function') playSfx('tap');
          renderPanel();
        };
      });

      const launchBtn = $('#msLaunchBtn', panel);
      launchBtn.onclick = async () => {
        if (launchBtn.disabled) return;
        const res = AR
          ? AR.validateModeEntry({ modeType: 'pvp', betAmount: pvpBet, userCoins: me.coins })
          : { ok: me.coins >= pvpBet, cost: pvpBet };
        if (!res.ok) return toast(res.reason);
        const origTxt = launchBtn.textContent;
        launchBtn.disabled = true;
        launchBtn.textContent = 'Loading…';
        addReward(-res.cost, 0, null, true, { silentSfx: true, skipLevelUp: true });
        if (typeof playSfx === 'function') playSfx('stakeLock');
        const started = await launchStandardizedGame(g.id, { modeType: 'pvp', botTier: 'pro', stake: res.cost, stakeDeducted: true, subMode, roomCode, rival });
        if (!started) {
          addReward(res.cost, 0, null, true, { silentSfx: true, skipLevelUp: true });
          launchBtn.disabled = false;
          launchBtn.textContent = origTxt;
        }
      };
      return;
    }

    // INVITE FRIEND MODE
    const inviteUrl = getInviteUrl();
    const onlineRoster = typeof getRealOnlinePlayers === 'function' ? getRealOnlinePlayers({ excludeSelf: true }).slice(0, 6) : [];
    const betOpts = [0, 25, 50, 100];

    panel.innerHTML = `
      <div class="ms-inv-code-box">
        <div>
          <small>ROOM CODE</small>
          <b id="msRoomCodeTxt" data-testid="ms-room-code">${esc(roomCode)}</b>
        </div>
        <div class="row" style="gap:6px">
          <button type="button" class="btn ghost sm" id="msCopyCodeBtn">Copy Code</button>
          <button type="button" class="btn ok sm" id="msCopyLinkBtn">Copy Link</button>
        </div>
      </div>

      <div class="ms-inv-bet-row">
        ${betOpts.map(b => `<button type="button" class="ms-fmt-btn ${inviteBet === b ? 'on' : ''}" data-msibet="${b}" ${b > myCoins ? 'disabled' : ''}>${b === 0 ? 'Free' : `🪙 ${b}`}</button>`).join('')}
      </div>

      <div class="ms-inv-actions">
        <button type="button" class="btn ghost sm" id="msPostWorldBtn">🌍 World Chat</button>
        <button type="button" class="btn gold sm" id="msStartRoomBtn" data-testid="ms-start-room-btn">Start Room ›</button>
      </div>

      <div class="ms-join-row">
        <input id="msJoinCodeIn" maxlength="12" placeholder="Enter Friend Room Code" aria-label="Friend room code">
        <button type="button" class="btn sm ok" id="msJoinCodeBtn">Join</button>
      </div>

      ${onlineRoster.length ? `
        <div class="ms-friends-list">
          ${onlineRoster.map(u => `
            <div class="ms-fr-row">
              <div class="row" style="gap:8px;min-width:0">
                ${av(u, 32)}
                <b class="ms-fr-name">${esc(u.name || 'Player')}</b>
              </div>
              <button type="button" class="btn sm ok" data-msinvuid="${esc(u.uid)}">Invite</button>
            </div>
          `).join('')}
        </div>
      ` : ''}
    `;

    $$('[data-msibet]', panel).forEach(b => {
      b.onclick = () => {
        inviteBet = Number(b.dataset.msibet) || 0;
        if (typeof playSfx === 'function') playSfx('tap');
        renderPanel();
      };
    });

    $('#msCopyCodeBtn', panel).onclick = () => {
      ensureInviteRoomPersisted();
      if (typeof copyTextClean === 'function') copyTextClean(roomCode, 'Room Code');
      else { try { navigator.clipboard?.writeText(roomCode); } catch {} toast(`Copied ${roomCode}`); }
      if (typeof playSfx === 'function') playSfx('tap');
    };

    $('#msCopyLinkBtn', panel).onclick = () => {
      ensureInviteRoomPersisted();
      if (typeof copyTextClean === 'function') copyTextClean(inviteUrl, 'Invite Link');
      else { try { navigator.clipboard?.writeText(inviteUrl); } catch {} toast('Invite link copied!'); }
      if (typeof playSfx === 'function') playSfx('tap');
    };

    $('#msPostWorldBtn', panel).onclick = () => {
      ensureInviteRoomPersisted();
      const txt = `🎮 Join ${g.name}${inviteBet > 0 ? ` (${inviteBet} 🪙)` : ' (Free)'}! Room Code: ${roomCode} ${inviteUrl}`;
      if (typeof sendWorldMsg === 'function') {
        sendWorldMsg(txt, { type: 'game_invite', gameId: g.id, gameName: g.name, roomCode, mode: subMode, stake: inviteBet, url: inviteUrl });
      }
      if (typeof playSfx === 'function') playSfx('chatSend');
      toast(`Posted ${roomCode} to World Chat!`);
    };

    $('#msJoinCodeBtn', panel).onclick = () => {
      const code = ($('#msJoinCodeIn', panel)?.value || '').trim().toUpperCase();
      if (!code) return toast('Enter a room code');
      if (typeof joinFromInvitePayload === 'function') {
        joinFromInvitePayload({ kind: 'game', gameId: g.id, gameName: g.name, roomCode: code, mode: subMode, stake: inviteBet });
      } else {
        launchStandardizedGame(g.id, { modeType: 'invite', botTier: 'standard', stake: inviteBet, subMode, roomCode: code });
      }
    };

    $$('[data-msinvuid]', panel).forEach(b => {
      b.onclick = () => {
        ensureInviteRoomPersisted();
        const friend = onlineRoster.find(x => x.uid === b.dataset.msinvuid);
        if (!friend) return;
        if (typeof sendUniversalRoomInviteToDm === 'function') {
          sendUniversalRoomInviteToDm(friend, { gameId: g.id, gameName: g.name, roomCode, mode: subMode, stake: inviteBet });
        }
        b.textContent = 'Sent ✓';
        b.disabled = true;
        if (typeof playSfx === 'function') playSfx('chatSend');
        toast(`Invite sent to ${friend.name}`);
      };
    });

    const startRoomBtn = $('#msStartRoomBtn', panel);
    startRoomBtn.onclick = async () => {
      if (startRoomBtn.disabled) return;
      const res = AR
        ? AR.validateModeEntry({ modeType: 'invite', betAmount: inviteBet, userCoins: me.coins })
        : { ok: me.coins >= inviteBet, cost: inviteBet };
      if (!res.ok) return toast(res.reason);
      const origTxt = startRoomBtn.textContent;
      startRoomBtn.disabled = true;
      startRoomBtn.textContent = 'Loading…';
      ensureInviteRoomPersisted();
      if (res.cost > 0 && !isShowGame) {
        addReward(-res.cost, 0, null, true, { silentSfx: true, skipLevelUp: true });
        if (typeof playSfx === 'function') playSfx('stakeLock');
      } else if (typeof playSfx === 'function') {
        playSfx('turnStart');
      }
      const started = await launchStandardizedGame(g.id, { modeType: 'invite', botTier: res.cost > 0 ? 'pro' : 'standard', stake: res.cost, stakeDeducted: res.cost > 0 && !isShowGame, subMode, roomCode, rival });
      if (!started) {
        if (res.cost > 0 && !isShowGame) addReward(res.cost, 0, null, true, { silentSfx: true, skipLevelUp: true });
        startRoomBtn.disabled = false;
        startRoomBtn.textContent = origTxt;
      }
    };
  };

  $$('[data-mstype]', view).forEach(b => {
    b.onclick = () => {
      modeType = b.dataset.mstype;
      if (typeof playSfx === 'function') playSfx('tap');
      renderPanel();
    };
  });

  $$('[data-msfmt]', view).forEach(b => {
    b.onclick = () => {
      subMode = b.dataset.msfmt;
      if (typeof playSfx === 'function') playSfx('tap');
      renderPanel();
    };
  });

  renderPanel();
  return view;
}
window.openVisualModeSelect = openVisualModeSelect;
