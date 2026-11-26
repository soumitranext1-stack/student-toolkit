"use strict";
/* =====================================================================
   VISUAL MODE SELECTION SCREEN (UNIFIED FOR ALL ARENA GAMES)
   · Bot VS (Normal Free / Hard 50 Coins with Balance Check)
   · Player VS (Coin Bet Selector with Payout Rules & Firestore Sync)
   · Invite Friend (Room Code, Invite Link, Copy, World Chat, Friend Invite, Join Code)
   ===================================================================== */

const MODE_CODE_PREFIX = {
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

function launchStandardizedGame(gameId, cfg) {
  const c = cfg || {};
  const stake = Math.max(0, Math.floor(Number(c.stake || 0)));
  const botTier = c.botTier || (stake > 0 ? 'pro' : 'standard');
  const subMode = c.subMode || '';
  const roomCode = c.roomCode || genGameRoomCode(gameId);
  const rival = c.rival || null;
  const modeType = c.modeType || 'bot';

  if (gameId === 'pool_8ball' && typeof launchPool8BallPro === 'function') {
    return launchPool8BallPro({ modeType, botTier, stake, roomCode, rival });
  }
  if (gameId === 'jackaroo' && typeof launchJackaroo === 'function') {
    return launchJackaroo(stake, rival, subMode === '2v2' ? '2v2' : '1v1', botTier, roomCode);
  }
  if (gameId === 'uno' && typeof launchUnoGame === 'function') {
    return launchUnoGame(stake, rival, subMode || (modeType === 'pvp' ? '1v1' : 'classic'), botTier, roomCode);
  }
  if (gameId === 'chess_blitz' && typeof launchChessBlitzArena === 'function') {
    return launchChessBlitzArena({ modeType, botTier, stake, roomCode, rival });
  }
  if (gameId === 'tile_race' && typeof launchTileRace === 'function') {
    return launchTileRace({ modeType, botTier, stake, roomCode, rival });
  }
  if (gameId === 'trap_door' && typeof launchTrapDoorDuel === 'function') {
    return launchTrapDoorDuel({ modeType, botTier, stake, roomCode, rival });
  }
  if (gameId === 'mind_clash' && typeof launchMindClash === 'function') {
    return launchMindClash({ modeType, botTier, stake, roomCode, rival });
  }
  if (gameId === 'pocket_territory' && typeof launchPocketTerritory === 'function') {
    return launchPocketTerritory({ modeType, botTier, stake, roomCode, rival });
  }
  if (gameId === 'ludo' && typeof launchLudoGame === 'function') {
    return launchLudoGame({ mode: subMode === '1v1' ? '1v1' : '4p', stake, botTier, roomCode, rival });
  }
  if (gameId === 'number_match' && typeof launchNumberMatch === 'function') {
    return launchNumberMatch({ mode: subMode === 'duel' ? 'duel' : 'classic', stake, roomCode, rival });
  }
  if (gameId === 'blitz_dots' && typeof launchBlitzDots === 'function') {
    return launchBlitzDots(stake, rival, botTier);
  }
  if (gameId === 'squad_arena' && typeof launchSquadTrivia === 'function') {
    return launchSquadTrivia(stake, rival, botTier);
  }
  if (gameId === 'undercover' && typeof launchUndercoverSpy === 'function') {
    return launchUndercoverSpy(stake, botTier);
  }
  if (typeof launchLudoExpress === 'function') {
    return launchLudoExpress(stake, rival, botTier);
  }
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

        <div class="ms-mode-grid" role="tablist" aria-label="Game Mode">
          <button type="button" class="ms-mode-card ${modeType === 'bot' ? 'on' : ''}" data-mstype="bot" data-testid="mode-btn-bot">
            <span class="ms-mode-ico">${iconBot}</span>
            <b>Bot VS</b>
          </button>
          <button type="button" class="ms-mode-card ${modeType === 'pvp' ? 'on' : ''}" data-mstype="pvp" data-testid="mode-btn-pvp">
            <span class="ms-mode-ico">${iconPvp}</span>
            <b>Player VS</b>
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
            <b>Normal</b>
            <small class="ms-free-txt">FREE</small>
          </button>
          <button type="button" class="ms-opt-card ${botDiff === 'hard' ? 'on' : ''} ${!canHard ? 'locked' : ''}" data-msdiff="hard" data-testid="bot-hard-btn">
            <span class="ms-opt-ico">🔥</span>
            <b>Hard</b>
            <small class="ms-coin-txt">🪙 ${hardCost} · Win ${pay.winnerPayout}</small>
          </button>
        </div>
        ${!check.ok ? `<div class="ms-warn-line" data-testid="ms-coin-warn">Not enough coins for Hard Mode (Need ${hardCost} 🪙)</div>` : ''}
        <button type="button" class="btn gold full ms-play-cta" id="msLaunchBtn" data-testid="ms-play-btn" ${!check.ok ? 'disabled' : ''}>
          ${botDiff === 'hard' ? `Play Hard · ${hardCost} 🪙` : `Play Free`}
        </button>
      `;

      $$('[data-msdiff]', panel).forEach(b => {
        b.onclick = () => {
          botDiff = b.dataset.msdiff === 'hard' ? 'hard' : 'normal';
          if (typeof playSfx === 'function') playSfx('tap');
          renderPanel();
        };
      });

      $('#msLaunchBtn', panel).onclick = () => {
        const res = AR
          ? AR.validateModeEntry({ modeType: 'bot', difficulty: botDiff, userCoins: me.coins })
          : { ok: true, cost: botDiff === 'hard' ? hardCost : 0, botTier: botDiff === 'hard' ? 'pro' : 'standard' };
        if (!res.ok) return toast(res.reason);
        if (res.cost > 0) {
          addReward(-res.cost, 0, null, true, { silentSfx: true, skipLevelUp: true });
          if (typeof playSfx === 'function') playSfx('stakeLock');
        } else if (typeof playSfx === 'function') {
          playSfx('turnStart');
        }
        launchStandardizedGame(g.id, { modeType: 'bot', botTier: res.botTier, stake: res.cost, subMode, roomCode });
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

      $('#msLaunchBtn', panel).onclick = () => {
        const res = AR
          ? AR.validateModeEntry({ modeType: 'pvp', betAmount: pvpBet, userCoins: me.coins })
          : { ok: me.coins >= pvpBet, cost: pvpBet };
        if (!res.ok) return toast(res.reason);
        addReward(-res.cost, 0, null, true, { silentSfx: true, skipLevelUp: true });
        if (typeof playSfx === 'function') playSfx('stakeLock');
        launchStandardizedGame(g.id, { modeType: 'pvp', botTier: 'pro', stake: res.cost, subMode, roomCode, rival });
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

    $('#msStartRoomBtn', panel).onclick = () => {
      const res = AR
        ? AR.validateModeEntry({ modeType: 'invite', betAmount: inviteBet, userCoins: me.coins })
        : { ok: me.coins >= inviteBet, cost: inviteBet };
      if (!res.ok) return toast(res.reason);
      ensureInviteRoomPersisted();
      if (res.cost > 0) {
        addReward(-res.cost, 0, null, true, { silentSfx: true, skipLevelUp: true });
        if (typeof playSfx === 'function') playSfx('stakeLock');
      } else if (typeof playSfx === 'function') {
        playSfx('turnStart');
      }
      launchStandardizedGame(g.id, { modeType: 'invite', botTier: res.cost > 0 ? 'pro' : 'standard', stake: res.cost, subMode, roomCode, rival });
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
