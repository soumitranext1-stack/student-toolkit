"use strict";
/* =====================================================================
   LUDO ROYAL — FULL-GRAPHICS 3D GLOSSY ROYAL BOARD (v25)
   · Jackaroo-grade carved walnut/mahogany & brushed brass board craft
   · 4 Glossy Jewel Quadrants (Ruby Red, Emerald, Royal Gold, Sapphire)
   · 52-tile perimeter loop, golden safe stars, colored home lanes, center crown
   · Animated 3D dome pawns with hop-by-hop arc motion & capture bursts
   · 3D tumbling dice pad, 15s turn timer, AFK auto-play, Free Bot & Paid Stakes
   · Full-screen view, Sound FX, Mic/QuickVoice, Live In-Game Chat,
     Clickable Invites (?room= & Room Code), Guest-Filtered Online Roster, & Spectate
   ===================================================================== */

const LUDO_BOT_NAMES = {
  1: { name: 'Aria Nova', avatar: 'av_g1' },
  2: { name: 'Leo Blaze', avatar: 'av_b3' },
  3: { name: 'Zara Star', avatar: 'av_g3' }
};

function ludoAvatarHtml(av) {
  if (typeof renderAvatarGlyph === 'function') return renderAvatarGlyph(av || 'av_b1');
  return `<span>${esc(av || '🎲')}</span>`;
}

function ludoDiceFaceSvg(val) {
  const v = Math.max(1, Math.min(6, Number(val) || 1));
  const pips = {
    1: [[24, 24]],
    2: [[14, 14], [34, 34]],
    3: [[14, 14], [24, 24], [34, 34]],
    4: [[14, 14], [34, 14], [14, 34], [34, 34]],
    5: [[14, 14], [34, 14], [24, 24], [14, 34], [34, 34]],
    6: [[14, 12], [34, 12], [14, 24], [34, 24], [14, 36], [34, 36]]
  }[v];
  const dotColor = v === 1 || v === 6 ? '#dc2626' : '#0f172a';
  return `<svg viewBox="0 0 48 48" width="46" height="46" aria-hidden="true">
    <defs>
      <linearGradient id="ldDieBg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="70%" stop-color="#f1f5f9"/>
        <stop offset="100%" stop-color="#cbd5e1"/>
      </linearGradient>
    </defs>
    <rect x="2" y="2" width="44" height="44" rx="11" fill="url(#ldDieBg)" stroke="#f59e0b" stroke-width="2.2"/>
    <rect x="5" y="5" width="38" height="38" rx="8.5" fill="none" stroke="rgba(255,255,255,.85)" stroke-width="1.2"/>
    ${pips.map(([cx, cy]) => `<circle cx="${cx}" cy="${cy}" r="${v === 1 ? 5.6 : 4.2}" fill="${dotColor}"/>`).join('')}
  </svg>`;
}

function openLudoRulesModal() {
  const m = modal('📖 Ludo Royal Rules', `
    <div class="jkr-shell">
      <div class="jkr-list">
        <div class="jkr-row"><span class="jkr-mini red"><b>6</b><i>🎲</i></span><p>Roll a <b>6</b> to unlock a pawn from your Royal Yard onto your colored Start Star, and earn a <b>Bonus Roll</b>!</p></div>
        <div class="jkr-row"><span class="jkr-mini blk"><b>★</b><i>SAFE</i></span><p>The <b>8 Golden Star &amp; Start squares</b> are Safe Zones — no pawn can be captured while standing on them.</p></div>
        <div class="jkr-row"><span class="jkr-mini red"><b>💥</b><i>HIT</i></span><p>Land on a rival pawn on a normal tile to send it back to its yard and claim an immediate <b>Bonus Roll</b>!</p></div>
        <div class="jkr-row"><span class="jkr-mini blk"><b>👑</b><i>WIN</i></span><p>Race clockwise into your colored Home Lane and roll the <b>exact number</b> to enter the Center Crown. First player with all 4 pawns Home wins!</p></div>
        <div class="jkr-row"><span class="jkr-mini blk"><b>6×3</b><i>!</i></span><p>Rolling <b>three 6s in a row</b> forfeits the 3rd roll and passes the turn to the next player.</p></div>
      </div>
    </div>
  `, 'jkr-modal');
  return m;
}
window.openLudoRulesModal = openLudoRulesModal;

function openLudoInviteModal(opts) {
  const o = opts || {};
  const mode = o.mode === '1v1' ? '1v1' : '4p';
  const stake = Math.max(0, Number(o.stake || 0));
  const roomCode = String(o.roomCode || ('LU' + Math.floor(1000 + Math.random() * 9000))).toUpperCase();
  const modeLabel = mode === '1v1' ? '1v1 Duel' : '4P Royal';
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
    ? buildRoomInviteUrl({ gameId: 'ludo', roomCode, mode })
    : `?room=${encodeURIComponent(roomCode)}&game=ludo&mode=${encodeURIComponent(mode)}`;
  const shareText = `🎲 Join my Ludo Royal (${modeLabel}${stake > 0 ? ' · ' + stake + ' 🪙' : ' · Free'}) table! Room Code: ${roomCode} ${shareUrl}`;

  const m = modal(`🎲 Invite Friends · Ludo Royal`, `
    <div class="jki-shell" data-testid="ludo-invite-sheet">
      <div class="jki-code-card">
        <div class="jki-code-meta">
          <small class="jki-lbl">LUDO ROOM CODE · ${esc(modeLabel)}</small>
          <b class="jki-code">${esc(roomCode)}</b>
        </div>
        <div class="jki-code-actions">
          <button type="button" class="btn sm gold" id="ldInvCopy">Copy</button>
          <button type="button" class="btn sm ok" id="ldInvWorld">World Chat</button>
        </div>
      </div>

      <div class="jki-search-wrap">
        <span class="jki-search-ico" aria-hidden="true">🔍</span>
        <input type="search" id="ldInvSearch" placeholder="Search online friends..." maxlength="40" autocomplete="off">
      </div>

      <div class="jki-sec-row">
        <span class="jki-sec-title">Online Friends &amp; Players</span>
        <small class="jki-sec-cnt" id="ldInvCnt">${contacts.length} online</small>
      </div>
      <div class="jki-friend-list" id="ldInvList"></div>
    </div>
  `, 'jki-modal');

  const renderList = (qRaw) => {
    const listEl = $('#ldInvList', m);
    const cntEl = $('#ldInvCnt', m);
    if (!listEl) return;
    const q = String(qRaw || '').trim().toLowerCase();
    const filtered = q ? contacts.filter(c => c.name.toLowerCase().includes(q) || c.uid.toLowerCase().includes(q)) : contacts;
    if (cntEl) cntEl.textContent = `${filtered.length} online`;
    if (!filtered.length) {
      listEl.innerHTML = `<div class="jki-empty">No online players found. Post Room Code <b>${esc(roomCode)}</b> to World Chat!</div>`;
      return;
    }
    listEl.innerHTML = filtered.slice(0, 16).map(u => {
      const done = invitedSet.has(u.uid);
      return `
        <div class="jki-friend-row">
          <div class="jki-f-left">
            <span class="jki-f-av sg-av-presence-wrap">${ludoAvatarHtml(u.avatar)}<span class="sg-online-dot sm"></span></span>
            <div class="jki-f-info">
              <b>${esc(u.name)}${u.isFriend ? ' <span class="jki-fr-tag">Friend</span>' : ''}</b>
              <small>Lv.${u.level} · ${esc(u.actLabel)}</small>
            </div>
          </div>
          <button type="button" class="btn sm ${done ? 'ghost' : 'ok'}" data-ld-inv-uid="${esc(u.uid)}" ${done ? 'disabled' : ''}>${done ? 'Invited ✓' : 'Invite'}</button>
        </div>
      `;
    }).join('');
  };
  renderList('');

  const listWrap = $('#ldInvList', m);
  if (listWrap) {
    listWrap.onclick = (e) => {
      const btn = e.target.closest('[data-ld-inv-uid]');
      if (!btn || btn.disabled) return;
      const friend = contacts.find(c => c.uid === btn.dataset.ldInvUid);
      if (!friend) return;
      invitedSet.add(friend.uid);
      btn.textContent = 'Invited ✓';
      btn.disabled = true;
      btn.classList.remove('ok');
      btn.classList.add('ghost');
      if (typeof sendUniversalRoomInviteToDm === 'function') {
        sendUniversalRoomInviteToDm(friend, {
          gameId: 'ludo',
          gameName: 'Ludo Royal',
          roomCode,
          mode,
          stake,
          text: shareText
        });
      }
      if (typeof playSfx === 'function') playSfx('turnStart');
      if (typeof toast === 'function') toast(`Clickable Ludo invite sent to ${friend.name}!`);
      if (typeof o.onInviteFriend === 'function') o.onInviteFriend(friend);
    };
  }

  const searchIn = $('#ldInvSearch', m);
  if (searchIn) searchIn.oninput = () => renderList(searchIn.value);

  const copyBtn = $('#ldInvCopy', m);
  if (copyBtn) {
    copyBtn.onclick = () => {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(shareText).catch(() => {});
      }
      if (typeof toast === 'function') toast(`Copied Ludo Invite (${roomCode})!`);
    };
  }

  const worldBtn = $('#ldInvWorld', m);
  if (worldBtn) {
    worldBtn.onclick = () => {
      if (typeof sendWorldMsg === 'function') {
        sendWorldMsg(shareText, { type: 'game_invite', gameId: 'ludo', gameName: 'Ludo Royal', roomCode, mode, stake, url: shareUrl });
      }
      if (typeof playSfx === 'function') playSfx('chatSend');
      if (typeof toast === 'function') toast(`Shared Ludo Room ${roomCode} to World Chat!`);
    };
  }

  return m;
}
window.openLudoInviteModal = openLudoInviteModal;

function openLudoLobby(opts) {
  const o = opts || {};
  let mode = o.mode === '1v1' ? '1v1' : '4p';
  let stake = Math.max(0, Number(o.stake || 0));
  let botTier = stake > 0 ? 'pro' : 'standard';
  let roomCode = String(o.roomCode || ('LU' + Math.floor(1000 + Math.random() * 9000))).toUpperCase();
  const invitedFriends = [];

  const stakes = [0, 50, 100, 250, 500];
  const m = modal('🎲 Ludo Royal · Table Lobby', `<div id="ldLobbyBody" data-testid="ludo-lobby"></div>`, 'ludo-lobby-modal');

  const renderLobby = () => {
    const body = $('#ldLobbyBody', m);
    if (!body) return;
    const pay = typeof calcArenaStakePayout === 'function' ? calcArenaStakePayout(stake) : { winnerPayout: stake * 2 };
    const winPrize = pay.winnerPayout || (stake * 2);
    const seatsCount = mode === '1v1' ? 2 : 4;
    const myCoins = typeof me !== 'undefined' ? clampCoins(me.coins) : 0;
    const cantAfford = stake > 0 && myCoins < stake;

    body.innerHTML = `
      <div class="ld-lob-hero">
        <div class="ld-lob-crest" aria-hidden="true">👑</div>
        <div class="ld-lob-title">
          <b>Ludo Royal 3D</b>
          <small>Mahogany Board · Safe Stars · Voice &amp; Live Chat</small>
        </div>
        <span class="ld-lob-code-pill">Room ${esc(roomCode)}</span>
      </div>

      <div class="ld-lob-sec">
        <label>Match Mode</label>
        <div class="ld-seg-row">
          <button type="button" class="ld-seg-btn ${mode === '4p' ? 'on' : ''}" data-ld-mode="4p">👑 4 Players Royal</button>
          <button type="button" class="ld-seg-btn ${mode === '1v1' ? 'on' : ''}" data-ld-mode="1v1">⚔️ 1v1 Quick Duel</button>
        </div>
      </div>

      <div class="ld-lob-sec">
        <label>Table Entry Stake ${stake > 0 ? `(Win +${fmtNum(winPrize)} 🪙)` : '(Free Practice vs Bots / Friends)'}</label>
        <div class="ld-stake-row">
          ${stakes.map(s => `
            <button type="button" class="ld-stake-btn ${stake === s ? 'on' : ''}" data-ld-stake="${s}">
              ${s === 0 ? 'FREE' : `🪙 ${s}`}
            </button>
          `).join('')}
        </div>
      </div>

      <div class="ld-lob-sec">
        <label>Bot Difficulty</label>
        <div class="ld-seg-row">
          <button type="button" class="ld-seg-btn ${botTier === 'standard' ? 'on' : ''}" data-ld-tier="standard">🎯 Standard</button>
          <button type="button" class="ld-seg-btn ${botTier === 'pro' ? 'on' : ''}" data-ld-tier="pro">🔥 Pro Tactical</button>
        </div>
      </div>

      <div class="ld-lob-join-row">
        <input type="text" id="ldJoinCodeIn" placeholder="Enter Room Code (e.g. LU4821)…" maxlength="10" value="${o.joinedFromInvite ? esc(roomCode) : ''}">
        <button type="button" class="btn sm ghost" id="ldApplyCodeBtn">Set Room</button>
      </div>

      <div class="ld-lob-actions">
        <button type="button" class="btn ok full" id="ldStartBtn" ${cantAfford ? 'disabled' : ''}>
          ${cantAfford ? `Need ${stake} 🪙 to Play` : `🎲 Play Ludo Royal (${seatsCount}P · ${stake > 0 ? stake + ' 🪙' : 'Free'})`}
        </button>
        <div class="row" style="gap:8px;margin-top:8px">
          <button type="button" class="btn gold sm" id="ldLobInviteBtn" style="flex:1">👥 Invite Friends</button>
          <button type="button" class="btn ghost sm" id="ldLobWorldBtn" style="flex:1">🌍 Share to World Chat</button>
          <button type="button" class="btn ghost sm" id="ldLobRulesBtn">📖</button>
        </div>
      </div>
    `;

    body.onclick = (e) => {
      const mBtn = e.target.closest('[data-ld-mode]');
      if (mBtn) { mode = mBtn.dataset.ldMode; if (typeof playSfx === 'function') playSfx('tap'); renderLobby(); return; }
      const sBtn = e.target.closest('[data-ld-stake]');
      if (sBtn) { stake = Number(sBtn.dataset.ldStake) || 0; if (stake > 0) botTier = 'pro'; if (typeof playSfx === 'function') playSfx('tap'); renderLobby(); return; }
      const tBtn = e.target.closest('[data-ld-tier]');
      if (tBtn) { botTier = tBtn.dataset.ldTier; if (typeof playSfx === 'function') playSfx('tap'); renderLobby(); return; }

      if (e.target.closest('#ldApplyCodeBtn')) {
        const val = String($('#ldJoinCodeIn', body)?.value || '').trim().toUpperCase();
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
      if (e.target.closest('#ldLobRulesBtn')) { if (typeof playSfx === 'function') playSfx('tap'); openLudoRulesModal(); return; }
      if (e.target.closest('#ldLobInviteBtn')) {
        if (typeof playSfx === 'function') playSfx('tap');
        openLudoInviteModal({
          mode, stake, roomCode,
          onInviteFriend: (fr) => {
            if (fr && !invitedFriends.some(x => x.uid === fr.uid)) invitedFriends.push(fr);
          }
        });
        return;
      }
      if (e.target.closest('#ldLobWorldBtn')) {
        const url = typeof buildRoomInviteUrl === 'function'
          ? buildRoomInviteUrl({ gameId: 'ludo', roomCode, mode })
          : `?room=${roomCode}&game=ludo&mode=${mode}`;
        const txt = `🎲 Join my Ludo Royal (${mode === '1v1' ? '1v1 Duel' : '4P Royal'}${stake > 0 ? ' · ' + stake + ' 🪙' : ' · Free'})! Room Code: ${roomCode} ${url}`;
        if (typeof sendWorldMsg === 'function') {
          sendWorldMsg(txt, { type: 'game_invite', gameId: 'ludo', gameName: 'Ludo Royal', roomCode, mode, stake, url });
        }
        if (typeof playSfx === 'function') playSfx('chatSend');
        toast(`Posted Ludo Room ${roomCode} to World Chat!`);
        return;
      }
      if (e.target.closest('#ldStartBtn')) {
        if (stake > 0) {
          if (me.coins < stake) return toast(`Need ${stake} coins for this stake`);
          addReward(-stake, 0, null, true, { silentSfx: true, skipLevelUp: true });
          if (typeof playSfx === 'function') playSfx('stakeLock');
        } else if (typeof playSfx === 'function') {
          playSfx('turnStart');
        }
        m.close();
        launchLudoGame({
          mode,
          stake,
          botTier,
          roomCode,
          rival: invitedFriends[0] || o.rival || null,
          invitedFriends
        });
      }
    };
  };

  renderLobby();
  return m;
}
window.openLudoLobby = openLudoLobby;

function launchLudoGame(opts) {
  const Rules = window.LudoRules;
  if (!Rules) {
    if (typeof toast === 'function') toast('Ludo rules failed to load');
    return;
  }
  const o = opts || {};
  const myUid = (typeof uid !== 'undefined' && uid) ? String(uid) : 'local_me';
  const myProfile = {
    uid: myUid,
    name: (typeof me !== 'undefined' && me?.name) || 'You',
    avatar: (typeof me !== 'undefined' && me?.avatar) || 'av_b1'
  };
  const requestedMode = o.mode === '1v1' ? '1v1' : '4p';
  const initialActiveSeats = Rules.getActiveSeats(requestedMode);
  const defaultBotPool = [1, 2, 3].map(s => ({
    uid: `ludo_bot_${s}`,
    name: (LUDO_BOT_NAMES[s] && LUDO_BOT_NAMES[s].name) || `Bot ${s}`,
    avatar: (LUDO_BOT_NAMES[s] && LUDO_BOT_NAMES[s].avatar) || 'av_g2'
  }));
  const roster = window.PvpSyncRules
    ? window.PvpSyncRules.resolveMultiSeatRoster(o, initialActiveSeats, myUid, myProfile, defaultBotPool)
    : null;

  // If live online room has <= 2 occupied seats, automatically place players across each other (seats 0 & 2)
  const effectiveMode = (roster && roster.isLiveOnline && roster.seats.length <= 2) ? '1v1' : requestedMode;
  const activeSeats = Rules.getActiveSeats(effectiveMode);
  const finalRoster = (window.PvpSyncRules && effectiveMode !== requestedMode)
    ? window.PvpSyncRules.resolveMultiSeatRoster(o, activeSeats, myUid, myProfile, defaultBotPool)
    : roster;

  const isLiveOnline = Boolean(finalRoster && finalRoster.isLiveOnline);
  const isSpectating = Boolean(o.spectate);
  const spectateHost = o.spectateHost || o.rival || null;
  const stake = Math.max(0, Math.floor(Number(o.stake || 0)));
  const botTier = o.botTier === 'pro' ? 'pro' : 'standard';
  const roomId = String(o.roomId || (finalRoster && finalRoster.roomId) || '').trim();
  const roomCode = String(o.roomCode || (finalRoster && finalRoster.roomCode) || ('LU' + Math.floor(1000 + Math.random() * 9000))).toUpperCase();
  const pay = typeof calcArenaStakePayout === 'function' ? calcArenaStakePayout(stake) : { winnerPayout: stake * 2 };
  const winPrize = pay.winnerPayout || (stake * 2);

  const playersMeta = {};
  const occupiedSeatSet = new Set();
  if (finalRoster && finalRoster.seats.length) {
    finalRoster.seats.forEach((s) => {
      occupiedSeatSet.add(s.seat);
      playersMeta[s.seat] = {
        uid: s.uid,
        name: s.name,
        avatar: s.avatar,
        isBot: isSpectating ? true : Boolean(s.isBot),
        kind: s.kind,
        isRealHuman: isSpectating ? false : Boolean(s.isRealHuman)
      };
    });
  } else {
    activeSeats.forEach((seat) => {
      occupiedSeatSet.add(seat);
      if (seat === 0) {
        playersMeta[0] = isSpectating && spectateHost
          ? { uid: spectateHost.uid || 'host_0', name: spectateHost.name || 'Host', avatar: spectateHost.avatar || 'av_g1', isBot: true, isRealHuman: false }
          : { uid: myUid, name: myProfile.name, avatar: myProfile.avatar, isBot: false, isRealHuman: true };
      } else {
        const def = LUDO_BOT_NAMES[seat] || { name: `Player ${seat + 1}`, avatar: 'av_b2' };
        playersMeta[seat] = { uid: `ludo_bot_${seat}`, name: def.name, avatar: def.avatar, isBot: true, kind: 'bot', isRealHuman: false };
      }
    });
  }

  const state = Rules.createInitialState({ mode: effectiveMode, playersMeta });
  // In live online rooms, exclude any unoccupied seats so empty seats NEVER become bots
  if (isLiveOnline && occupiedSeatSet.size > 0) {
    state.players = state.players.filter(p => occupiedSeatSet.has(p.seat));
    state.tokens = state.tokens.filter(t => occupiedSeatSet.has(t.owner));
  }
  state.players.forEach(p => {
    const meta = playersMeta[p.seat];
    if (meta) {
      p.kind = meta.kind || (meta.isBot ? 'bot' : 'joined');
      p.isRealHuman = Boolean(meta.isRealHuman);
      p.isBot = Boolean(meta.isBot);
    }
  });

  const myPlayerObj = state.players.find(p => p.uid === myUid) || state.players[0];
  const mySeatId = myPlayerObj ? myPlayerObj.seat : 0;
  const isLocalTurn = (p) => {
    if (!p || isSpectating || over) return false;
    if (finalRoster) return finalRoster.canLocalActForSeat(p);
    return !p.isBot && p.seat === mySeatId;
  };
  const shouldRunBot = (p) => {
    if (!p || over) return false;
    if (isSpectating) return true;
    if (finalRoster) return finalRoster.shouldRunBotForSeat(p);
    return Boolean(p.isBot);
  };

  if (!isSpectating && typeof setMyLiveActivity === 'function') {
    setMyLiveActivity({ type: 'playing', gameId: 'ludo', gameName: 'Ludo Royal', roomCode, mode: effectiveMode });
  }

  // Match runtime state
  let over = false;
  let phase = 'roll'; // 'roll' | 'rolling' | 'pick' | 'animating' | 'over'
  let currentDice = 6;
  let lastRollInfo = null; // { seat, name, colorHex, value, rolling, ts }
  let legalMoves = [];
  let statusText = isSpectating
    ? `Watching ${state.players[0]?.name || 'Host'}'s live match…`
    : (isLocalTurn(state.players[state.turnIdx]) ? 'Tap Dice to Roll!' : `Waiting for ${state.players[state.turnIdx]?.name || 'Opponent'}…`);
  let turnDeadline = 0;
  let turnTick = 0;
  let autoTimer = 0;
  let botTimer = 0;
  let rollTimer = 0;
  let calloutTimer = 0;
  let activeRaf = 0;
  let animOverride = null; // { tokenId, x, y, lift }
  let burstFx = null;      // { x, y, color }
  let chatWidget = null;
  let liveSync = null;
  const TURN_MS = 15000;

  const snapshotLudoState = () => ({
    turnIdx: state.turnIdx,
    consecutiveSixes: state.consecutiveSixes,
    winnerSeat: state.winnerSeat,
    tokens: state.tokens.map(t => ({
      id: t.id, owner: t.owner, idx: t.idx,
      zone: t.zone, pos: t.pos, homeIdx: t.homeIdx, stepsFromStart: t.stepsFromStart
    }))
  });

  const applyLudoSnapshot = (snap) => {
    if (!snap || !Array.isArray(snap.tokens)) return;
    state.turnIdx = Math.max(0, Math.min(state.players.length - 1, Number(snap.turnIdx || 0)));
    state.consecutiveSixes = Number(snap.consecutiveSixes || 0);
    state.winnerSeat = snap.winnerSeat !== undefined ? snap.winnerSeat : null;
    snap.tokens.forEach(rt => {
      const loc = state.tokens.find(t => t.id === rt.id);
      if (loc) {
        loc.zone = rt.zone;
        loc.pos = rt.pos;
        loc.homeIdx = rt.homeIdx;
        loc.stepsFromStart = rt.stepsFromStart;
      }
    });
  };

  // Map 15x15 grid coordinates to SVG 450x450 viewBox (30px per cell)
  const CELL = 30;
  const gridToPx = ([c, r]) => ({ x: c * CELL + CELL / 2, y: r * CELL + CELL / 2 });

  const renderStaticBoardSvg = () => {
    const safeSet = new Set(Rules.SAFE_POSITIONS);
    const startByPos = { 0: 0, 13: 1, 26: 2, 39: 3 };
    const seatColors = Rules.SEAT_PALETTE;

    // 52 outer track tiles
    const trackTiles = Rules.OUTER_TRACK_COORDS.map(([c, r], idx) => {
      const startSeat = startByPos[idx];
      const isStart = startSeat !== undefined;
      const isSafe = safeSet.has(idx);
      const fill = isStart ? seatColors[startSeat].hex : '#fbf6e9';
      const stroke = isStart ? 'rgba(255,255,255,.5)' : '#c7b28a';
      const x = c * CELL, y = r * CELL;
      const starMarkup = isSafe
        ? `<text x="${x + 15}" y="${y + 20}" text-anchor="middle" font-size="14" fill="${isStart ? '#ffffff' : '#d97706'}" font-weight="900">★</text>`
        : '';
      return `<rect x="${x + 1}" y="${y + 1}" width="${CELL - 2}" height="${CELL - 2}" rx="4" fill="${fill}" stroke="${stroke}" stroke-width="1.2"/>${starMarkup}`;
    }).join('');

    // Colored home lanes (5 tiles each)
    let homeLanes = '';
    [0, 1, 2, 3].forEach(seat => {
      const col = seatColors[seat];
      Rules.HOME_LANE_COORDS[seat].forEach(([c, r]) => {
        const x = c * CELL, y = r * CELL;
        homeLanes += `<rect x="${x + 1}" y="${y + 1}" width="${CELL - 2}" height="${CELL - 2}" rx="4" fill="${col.hex}" fill-opacity="0.88" stroke="rgba(255,255,255,.45)" stroke-width="1.2"/>`;
      });
    });

    // 4 Richly Detailed Royal Quadrants (Yards)
    const yardsDef = [
      { seat: 0, x: 0, y: 9 * CELL },
      { seat: 1, x: 0, y: 0 },
      { seat: 2, x: 9 * CELL, y: 0 },
      { seat: 3, x: 9 * CELL, y: 9 * CELL }
    ];
    const yardsMarkup = yardsDef.map(({ seat, x, y }) => {
      const col = seatColors[seat];
      const slots = Rules.YARD_SLOTS[seat].map(([sc, sr]) => {
        const pt = gridToPx([sc, sr]);
        return `<circle cx="${pt.x}" cy="${pt.y}" r="18" fill="${col.dark}" fill-opacity=".22" stroke="${col.hex}" stroke-width="2.2"/>
                <circle cx="${pt.x}" cy="${pt.y}" r="13.5" fill="#ffffff" stroke="rgba(0,0,0,.08)" stroke-width="1"/>`;
      }).join('');
      const inactive = !activeSeats.includes(seat);
      return `
        <g opacity="${inactive ? '0.45' : '1'}">
          <rect x="${x + 2}" y="${y + 2}" width="${6 * CELL - 4}" height="${6 * CELL - 4}" rx="16" fill="url(#ldGrad_${seat})" stroke="#f5d07a" stroke-width="2.4"/>
          <rect x="${x + 20}" y="${y + 20}" width="${6 * CELL - 40}" height="${6 * CELL - 40}" rx="14" fill="#fffdf7" stroke="rgba(255,255,255,.7)" stroke-width="2"/>
          ${slots}
        </g>
      `;
    }).join('');

    // Center Royal Crown Home (3x3 = cols 6..8, rows 6..8 => 180..270)
    const centerMarkup = `
      <g>
        <polygon points="180,270 270,270 225,225" fill="${seatColors[0].hex}" stroke="#fef08a" stroke-width="1.8"/>
        <polygon points="180,180 180,270 225,225" fill="${seatColors[1].hex}" stroke="#fef08a" stroke-width="1.8"/>
        <polygon points="180,180 270,180 225,225" fill="${seatColors[2].hex}" stroke="#fef08a" stroke-width="1.8"/>
        <polygon points="270,180 270,270 225,225" fill="${seatColors[3].hex}" stroke="#fef08a" stroke-width="1.8"/>
        <circle cx="225" cy="225" r="19" fill="url(#ldCrownGold)" stroke="#ffffff" stroke-width="2.2"/>
        <text x="225" y="231" text-anchor="middle" font-size="18" fill="#78350f">👑</text>
      </g>
    `;

    return `
      <defs>
        <linearGradient id="ldGrad_0" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#f87171"/><stop offset="100%" stop-color="#b91c1c"/></linearGradient>
        <linearGradient id="ldGrad_1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#34d399"/><stop offset="100%" stop-color="#047857"/></linearGradient>
        <linearGradient id="ldGrad_2" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#fbbf24"/><stop offset="100%" stop-color="#b45309"/></linearGradient>
        <linearGradient id="ldGrad_3" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#60a5fa"/><stop offset="100%" stop-color="#1d4ed8"/></linearGradient>
        <radialGradient id="ldCrownGold" cx="35%" cy="30%" r="70%"><stop offset="0%" stop-color="#fef9c3"/><stop offset="65%" stop-color="#f59e0b"/><stop offset="100%" stop-color="#b45309"/></radialGradient>
        <filter id="ldPawnShadow" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="3.5" stdDeviation="2.4" flood-color="rgba(0,0,0,0.52)"/>
        </filter>
      </defs>
      <rect x="0" y="0" width="450" height="450" rx="18" fill="#efe3c8"/>
      ${trackTiles}
      ${homeLanes}
      ${yardsMarkup}
      ${centerMarkup}
    `;
  };

  const view = typeof openFullScreenGameView === 'function'
    ? openFullScreenGameView({
        gameId: 'ludo',
        title: 'Ludo Royal',
        subMeta: `Room ${roomCode}`,
        statusText: isSpectating ? 'Spectating' : 'Your Turn',
        statusTone: 'turn',
        themeClass: 'gfs-theme-ludo',
        html: `
          <div class="ld-stage" id="ldStage" data-testid="ludo-stage">
            ${isSpectating ? `
              <div class="sg-spectate-banner" data-testid="ludo-spectate-banner">
                <span>👁️ Spectating <b>${esc(playersMeta[0].name)}</b> · Room ${esc(roomCode)}</span>
                <button type="button" class="btn sm ghost" id="ldSpecExit">Exit View</button>
              </div>
            ` : ''}

            <div class="ld-top-bar">
              <div class="ld-tl">
                <button type="button" class="jk-ghost-icon" id="ldExitBtn" aria-label="Leave Ludo Royal">‹</button>
                <div class="ld-id-block">
                  <b>Ludo Royal ${effectiveMode === '1v1' ? '1v1' : '4P'}</b>
                  <small>Room ${esc(roomCode)} ${stake > 0 ? `· 🪙 ${fmtNum(winPrize)} Pot` : '· Free Table'}</small>
                </div>
              </div>
              <div class="ld-tr">
                <button type="button" class="jk-mini-pill" id="ldRulesBtn" title="Ludo Rules" aria-label="Ludo Rules">📖</button>
                <button type="button" class="jk-invite-pill" id="ldInviteBtn" aria-label="Invite Friends">+ Invite</button>
                <button type="button" class="jk-mini-pill" id="ldQvBtn" title="Quick Voice" aria-label="Quick Voice">🗣️</button>
              </div>
            </div>

            <div class="ld-status-strip" id="ldStatusStrip">
              <span class="ld-turn-dot" id="ldTurnDot"></span>
              <span class="ld-status-txt" id="ldStatusTxt">${esc(statusText)}</span>
              <span class="ld-timer-pill" id="ldTimerPill">15s</span>
            </div>

            <div class="ld-arena-wrap">
              <div class="ld-players-top" id="ldPlayersTop"></div>

              <div class="ld-wood-frame">
                <span class="ld-rivet tl"></span><span class="ld-rivet tr"></span>
                <span class="ld-rivet bl"></span><span class="ld-rivet br"></span>
                <div class="ld-roll-callout" id="ldRollCallout" data-testid="ludo-roll-callout" hidden aria-live="polite"></div>
                <svg class="ld-board-svg" id="ldBoardSvg" viewBox="0 0 450 450" role="img" aria-label="Ludo Royal 3D Board">
                  <g id="ldStaticLayer">${renderStaticBoardSvg()}</g>
                  <g id="ldTokensLayer"></g>
                  <g id="ldFxLayer"></g>
                </svg>
              </div>

              <div class="ld-players-bot" id="ldPlayersBot"></div>
            </div>

            <div class="ld-control-dock">
              <button type="button" class="ld-dice-pad" id="ldDiceBtn" data-testid="ludo-dice-btn" aria-label="Roll Dice">
                <div class="ld-dice-cube" id="ldDiceCube">${ludoDiceFaceSvg(6)}</div>
                <div class="ld-dice-meta">
                  <b id="ldDiceLbl">${isSpectating ? 'LIVE VIEW' : 'ROLL DICE'}</b>
                  <small id="ldDiceSub">${isSpectating ? 'Watching live turns' : 'Tap to roll'}</small>
                </div>
              </button>
              <button type="button" class="ld-mic-btn" id="ldMicBtn" aria-pressed="false" aria-label="Toggle Microphone">
                <span>🔇</span><small>Mic</small>
              </button>
            </div>

            <div class="ld-chat-host" id="ldChatHost"></div>
          </div>
        `
      })
    : modal('🎲 Ludo Royal', '<div id="ldStage"></div>');

  const rootEl = view.root || view;

  const stopTimers = () => {
    clearInterval(turnTick);
    clearTimeout(autoTimer);
    clearTimeout(botTimer);
    clearTimeout(rollTimer);
    clearTimeout(calloutTimer);
    if (activeRaf) { cancelAnimationFrame(activeRaf); activeRaf = 0; }
  };

  const renderRollCallout = () => {
    const el = $('#ldRollCallout', rootEl);
    if (!el) return;
    if (!lastRollInfo || over) {
      el.hidden = true;
      return;
    }
    el.hidden = false;
    el.style.setProperty('--rc', lastRollInfo.colorHex || '#fbbf24');
    el.classList.toggle('is-rolling', Boolean(lastRollInfo.rolling));
    el.innerHTML = `
      <span class="ld-rc-die ${lastRollInfo.rolling ? 'spin' : ''}">${ludoDiceFaceSvg(lastRollInfo.value)}</span>
      <span class="ld-rc-txt">
        <b>${esc(lastRollInfo.name)}</b>
        <em>${lastRollInfo.rolling ? 'Rolling dice…' : `Rolled ${lastRollInfo.value}!`}</em>
      </span>
      <span class="ld-rc-num" data-testid="ludo-roll-value">${lastRollInfo.rolling ? '…' : lastRollInfo.value}</span>
    `;
  };

  const showSeatBubble = (seat, text) => {
    const card = rootEl.querySelector(`[data-ld-seat-card="${seat}"]`);
    if (!card) return;
    const prev = card.querySelector('.ld-seat-bubble');
    if (prev) prev.remove();
    const b = document.createElement('div');
    b.className = 'ld-seat-bubble';
    b.textContent = text;
    card.appendChild(b);
    setTimeout(() => { if (b.parentNode) b.remove(); }, 2500);
  };

  const renderPlayerCards = () => {
    const curP = state.players[state.turnIdx];
    const renderCard = (seat) => {
      const p = state.players.find(x => x.seat === seat);
      if (!p) return `<div class="ld-seat-spacer"></div>`;
      const isActive = curP && curP.seat === p.seat && !over;
      const homeCnt = state.tokens.filter(t => t.owner === p.seat && t.zone === 'home').length;
      const showSeatDie = lastRollInfo && lastRollInfo.seat === p.seat && !over;
      return `
        <div class="ld-seat-card ${isActive ? 'active' : ''}" data-ld-seat-card="${p.seat}" style="--sc:${p.color.hex}">
          <div class="ld-sc-av">${ludoAvatarHtml(p.avatar)}</div>
          <div class="ld-sc-info">
            <b>${esc(p.name)}</b>
            <small>👑 ${homeCnt}/4</small>
          </div>
          ${showSeatDie
            ? `<span class="ld-seat-dice-badge ${lastRollInfo.rolling ? 'is-rolling' : ''}" data-testid="ludo-seat-dice-${p.seat}" aria-label="${esc(p.name)} rolled ${lastRollInfo.value}">🎲 ${lastRollInfo.rolling ? '…' : lastRollInfo.value}</span>`
            : (isActive ? '<span class="ld-sc-turn">TURN</span>' : '')}
        </div>
      `;
    };
    const topEl = $('#ldPlayersTop', rootEl);
    const botEl = $('#ldPlayersBot', rootEl);
    if (topEl) topEl.innerHTML = renderCard(1) + renderCard(2);
    if (botEl) botEl.innerHTML = renderCard(0) + renderCard(3);
  };

  const renderTokensSvg = () => {
    const layer = $('#ldTokensLayer', rootEl);
    const fxLayer = $('#ldFxLayer', rootEl);
    if (!layer) return;

    const movableIds = new Set(phase === 'pick' ? legalMoves.map(m => m.tokenId) : []);

    // Group tokens sharing the exact same cell so stacked pawns offset cleanly
    const cellBuckets = new Map();
    state.tokens.forEach(t => {
      if (animOverride && animOverride.tokenId === t.id) return;
      const coord = Rules.getTokenCoord(t);
      const key = `${coord[0].toFixed(1)},${coord[1].toFixed(1)}`;
      if (!cellBuckets.has(key)) cellBuckets.set(key, []);
      cellBuckets.get(key).push(t);
    });

    const offsets = [[0, 0], [-6, -5], [6, -5], [-6, 5], [6, 5]];
    const drawOrder = state.tokens.slice().sort((a, b) => {
      const aMob = movableIds.has(a.id) ? 2 : (animOverride?.tokenId === a.id ? 3 : 0);
      const bMob = movableIds.has(b.id) ? 2 : (animOverride?.tokenId === b.id ? 3 : 0);
      return aMob - bMob;
    });

    layer.innerHTML = drawOrder.map(t => {
      const col = Rules.SEAT_PALETTE[t.owner];
      let cx, cy, lift = 0;
      if (animOverride && animOverride.tokenId === t.id) {
        cx = animOverride.x;
        cy = animOverride.y;
        lift = animOverride.lift || 0;
      } else {
        const coord = Rules.getTokenCoord(t);
        const pt = gridToPx(coord);
        const key = `${coord[0].toFixed(1)},${coord[1].toFixed(1)}`;
        const bucket = cellBuckets.get(key) || [t];
        const bIdx = bucket.indexOf(t);
        const [ox, oy] = bucket.length > 1 ? (offsets[bIdx % offsets.length] || [0, 0]) : [0, 0];
        cx = pt.x + ox;
        cy = pt.y + oy;
      }
      const isMovable = movableIds.has(t.id) && !isSpectating;
      const scale = t.zone === 'home' ? 0.78 : (isMovable ? 1.12 : 0.96);
      return `
        <g class="ld-pawn ${isMovable ? 'is-movable' : ''}" data-ld-token="${t.id}" transform="translate(${cx.toFixed(1)},${(cy - lift).toFixed(1)}) scale(${scale})" filter="url(#ldPawnShadow)" style="cursor:${isMovable ? 'pointer' : 'default'}">
          ${isMovable ? `<circle cx="0" cy="1" r="16" fill="none" stroke="#fef08a" stroke-width="2.6" class="ld-pawn-halo"/>` : ''}
          <ellipse cx="0" cy="9" rx="10.5" ry="4.5" fill="${col.dark}"/>
          <path d="M-9.5 7 C-9 -3, -5 -9, 0 -13 C5 -9, 9 -3, 9.5 7 Z" fill="${col.hex}" stroke="#ffffff" stroke-width="1.6"/>
          <circle cx="0" cy="-9.5" r="5.6" fill="${col.hex}" stroke="#ffffff" stroke-width="1.6"/>
          <ellipse cx="-2.2" cy="-11" rx="2.1" ry="1.3" fill="rgba(255,255,255,.78)"/>
        </g>
      `;
    }).join('');

    if (fxLayer) {
      fxLayer.innerHTML = burstFx
        ? `<g transform="translate(${burstFx.x.toFixed(1)},${burstFx.y.toFixed(1)})">
            <circle r="22" fill="none" stroke="${burstFx.color}" stroke-width="3.5" opacity=".9"/>
            <text y="6" text-anchor="middle" font-size="18">💥</text>
          </g>`
        : '';
    }
  };

  const renderHud = () => {
    const curP = state.players[state.turnIdx];
    const dot = $('#ldTurnDot', rootEl);
    const txt = $('#ldStatusTxt', rootEl);
    const diceBtn = $('#ldDiceBtn', rootEl);
    const diceCube = $('#ldDiceCube', rootEl);
    const diceLbl = $('#ldDiceLbl', rootEl);
    const diceSub = $('#ldDiceSub', rootEl);

    if (dot && curP) dot.style.background = curP.color.hex;
    if (txt) txt.textContent = statusText;
    if (diceCube) {
      diceCube.innerHTML = ludoDiceFaceSvg(currentDice);
      diceCube.classList.toggle('is-rolling', phase === 'rolling');
    }

    const canHumanRoll = !isSpectating && !over && curP && isLocalTurn(curP) && phase === 'roll';
    const isRemoteOrBotTurn = Boolean(curP && !isLocalTurn(curP));
    const isOppRollVisible = Boolean(lastRollInfo && curP && lastRollInfo.seat === curP.seat && (isRemoteOrBotTurn || isSpectating));
    if (diceBtn) {
      diceBtn.disabled = !canHumanRoll;
      diceBtn.classList.toggle('ready', canHumanRoll);
      diceBtn.classList.toggle('opp-rolling', phase === 'rolling' && isRemoteOrBotTurn);
    }
    if (diceLbl) {
      if (phase === 'rolling' && curP) {
        diceLbl.textContent = `${curP.name} ROLLING…`;
      } else if (isOppRollVisible && !lastRollInfo.rolling) {
        diceLbl.textContent = `${lastRollInfo.name} ROLLED ${lastRollInfo.value}!`;
      } else if (isSpectating) {
        diceLbl.textContent = `LIVE · ${currentDice}`;
      } else if (canHumanRoll) {
        diceLbl.textContent = 'TAP TO ROLL';
      } else if (phase === 'pick' && isLocalTurn(curP)) {
        diceLbl.textContent = `YOU ROLLED ${currentDice}!`;
      } else {
        diceLbl.textContent = curP ? `${curP.name} · 🎲 ${currentDice}` : 'LUDO';
      }
    }
    if (diceSub) {
      if (phase === 'rolling' && curP) {
        diceSub.textContent = isRemoteOrBotTurn ? 'Opponent rolling dice…' : 'Rolling dice…';
      } else if (isOppRollVisible && !lastRollInfo.rolling) {
        diceSub.textContent = `Landed on ${lastRollInfo.value} · Moving pawn…`;
      } else if (isSpectating) {
        diceSub.textContent = 'Spectator View Active';
      } else if (canHumanRoll) {
        diceSub.textContent = 'Your Turn · Tap Dice';
      } else if (phase === 'pick' && isLocalTurn(curP)) {
        diceSub.textContent = 'Tap a glowing pawn to move';
      } else if (isLiveOnline && curP && !curP.isBot) {
        diceSub.textContent = `Live PvP · Waiting for ${curP.name}…`;
      } else {
        diceSub.textContent = 'Wait for turn…';
      }
    }
    renderRollCallout();
  };

  const render = () => {
    renderPlayerCards();
    renderTokensSvg();
    renderHud();
  };

  const animateTokenPath = (token, path, onDone) => {
    if (!path || !path.length) { onDone(); return; }
    const startPt = gridToPx(Rules.getTokenCoord(token));
    const pts = [startPt, ...path.map(step => {
      if (step.zone === 'track') return gridToPx(Rules.OUTER_TRACK_COORDS[step.pos]);
      if (step.zone === 'homeLane') return gridToPx(Rules.HOME_LANE_COORDS[token.owner][step.homeIdx]);
      return gridToPx(Rules.HOME_FINISH_COORDS[token.owner]);
    })];

    let seg = 0;
    let segStart = performance.now();
    const SEG_MS = 125;

    const frame = (now) => {
      if (over) { activeRaf = 0; return; }
      const t = Math.min(1, (now - segStart) / SEG_MS);
      const a = pts[seg], b = pts[seg + 1];
      const x = a.x + (b.x - a.x) * t;
      const y = a.y + (b.y - a.y) * t;
      const lift = Math.sin(t * Math.PI) * 14;
      animOverride = { tokenId: token.id, x, y, lift };
      renderTokensSvg();

      if (t < 1) {
        activeRaf = requestAnimationFrame(frame);
      } else {
        if (typeof playSfx === 'function') playSfx('pawnStep');
        seg++;
        if (seg < pts.length - 1) {
          segStart = now;
          activeRaf = requestAnimationFrame(frame);
        } else {
          animOverride = null;
          activeRaf = 0;
          onDone();
        }
      }
    };
    activeRaf = requestAnimationFrame(frame);
  };

  const showGameOverOverlay = (winnerSeat) => {
    over = true;
    phase = 'over';
    stopTimers();
    const winner = state.players.find(p => p.seat === winnerSeat) || state.players[0];
    const iWon = !isSpectating && winner.seat === mySeatId;

    let outcomeInfo = {
      headline: iWon ? '👑 ROYAL VICTORY!' : `🏆 ${winner.name} WINS!`,
      detail: isSpectating ? 'Spectated match complete!' : (iWon ? (stake > 0 ? `Won +${fmtNum(winPrize)} 🪙!` : 'All 4 pawns reached the Royal Crown!') : 'Better luck next match!')
    };
    if (!isSpectating) {
      if (typeof settleArenaMatchOutcome === 'function') {
        outcomeInfo = settleArenaMatchOutcome(iWon ? 'win' : 'lose', stake, 48, 40, 14);
      } else {
        if (iWon && stake > 0 && typeof addCoins === 'function') addCoins(winPrize, 'Ludo Royal Win', true);
        else if (iWon && typeof addExp === 'function') addExp(40);
        if (typeof playSfx === 'function') playSfx(iWon ? 'duelWin' : 'matchLose');
      }
    } else if (typeof playSfx === 'function') {
      playSfx('duelWin');
    }

    if (iWon && typeof spawnArenaSparks === 'function') {
      spawnArenaSparks($('#ldStage', rootEl), '#fde047', 18);
    }

    const host = document.createElement('div');
    host.className = 'uno-go-overlay';
    host.innerHTML = `
      <div class="uno-go-card">
        <h3 class="uno-go-h">${iWon ? '👑 ROYAL VICTORY!' : `🏆 ${esc(winner.name)} WINS!`}</h3>
        <p class="uno-go-sub">${esc(outcomeInfo.headline)} · ${esc(outcomeInfo.detail)}</p>
        <div class="uno-go-actions" style="margin-top:14px">
          <button type="button" class="uno-go-exit" id="ldGoExit">Exit</button>
          <button type="button" class="uno-go-again" id="ldGoAgain">${isSpectating ? 'Watch Another' : 'Play Again'}</button>
        </div>
      </div>
    `;
    rootEl.appendChild(host);
    $('#ldGoExit', host).onclick = () => view.close();
    $('#ldGoAgain', host).onclick = () => {
      view.close();
      launchLudoGame({ ...o, mode: effectiveMode, stake: isSpectating ? 0 : stake, botTier, roomCode, spectate: isSpectating, spectateHost });
    };
  };

  const executeTokenMove = (tokenId, isRemoteSync) => {
    if (over || (phase !== 'pick' && !isRemoteSync)) return;
    const curP = state.players[state.turnIdx];
    const mv = legalMoves.find(m => m.tokenId === tokenId)
      || (isRemoteSync ? Rules.getLegalMoves(state, curP.seat, currentDice).find(m => m.tokenId === tokenId) : null);
    if (!curP || !mv) return;
    const token = state.tokens.find(t => t.id === tokenId);
    if (!token) return;

    phase = 'animating';
    clearTimeout(autoTimer);
    legalMoves = [];
    render();

    animateTokenPath(token, mv.path, () => {
      if (over) return;
      const res = Rules.applyMove(state, curP.seat, tokenId, currentDice);
      if (!res.ok) {
        Rules.advanceTurn(state, false);
        if (isLiveOnline && liveSync && !isRemoteSync) {
          liveSync.pushState({ event: 'turn', state: snapshotLudoState(), statusText });
        }
        beginTurn();
        return;
      }

      if (res.capturedTokens.length) {
        const pt = gridToPx(Rules.getTokenCoord(token));
        burstFx = { x: pt.x, y: pt.y, color: curP.color.hex };
        if (typeof playSfx === 'function') playSfx('capture');
        showSeatBubble(curP.seat, '💥 Captured! Bonus Roll!');
        if (chatWidget) chatWidget.pushMessage('Table', `💥 ${curP.name} captured a rival pawn!`, { system: true });
        setTimeout(() => { burstFx = null; renderTokensSvg(); }, 520);
      } else if (res.enteredHome) {
        if (typeof playSfx === 'function') playSfx('rowClear');
        showSeatBubble(curP.seat, '👑 Home Crown! +1 Roll!');
      }

      if (res.winnerSeat !== null) {
        if (isLiveOnline && liveSync && !isRemoteSync) {
          liveSync.pushState({
            event: 'move',
            actorSeat: curP.seat,
            tokenId,
            dice: currentDice,
            captured: res.capturedTokens.length > 0,
            enteredHome: res.enteredHome,
            winnerSeat: res.winnerSeat,
            state: snapshotLudoState(),
            statusText: `🏆 ${curP.name} won!`
          });
        }
        render();
        showGameOverOverlay(res.winnerSeat);
        return;
      }

      statusText = res.bonusTurn
        ? `${curP.color.emoji} ${curP.name} earned a Bonus Roll!`
        : `${state.players[state.turnIdx].color.emoji} ${state.players[state.turnIdx].name}'s turn`;

      if (isLiveOnline && liveSync && !isRemoteSync) {
        liveSync.pushState({
          event: 'move',
          actorSeat: curP.seat,
          tokenId,
          dice: currentDice,
          captured: res.capturedTokens.length > 0,
          enteredHome: res.enteredHome,
          bonusTurn: res.bonusTurn,
          winnerSeat: null,
          state: snapshotLudoState(),
          statusText
        });
      }
      beginTurn();
    });
  };

  const performDiceRoll = () => {
    if (over || phase !== 'roll') return;
    const curP = state.players[state.turnIdx];
    if (!curP) return;
    // Hard-block remote human seats from rolling locally
    if (!isLocalTurn(curP) && !shouldRunBot(curP)) return;

    phase = 'rolling';
    clearTimeout(autoTimer);
    clearTimeout(calloutTimer);
    if (typeof playSfx === 'function') playSfx('diceRoll');
    lastRollInfo = {
      seat: curP.seat,
      name: curP.name,
      colorHex: curP.color.hex,
      value: currentDice,
      rolling: true,
      ts: Date.now()
    };
    statusText = `${curP.color.emoji} ${curP.name} rolling dice…`;
    render();

    let ticks = 0;
    const spin = () => {
      if (over) return;
      ticks++;
      currentDice = 1 + Math.floor(Math.random() * 6);
      lastRollInfo = {
        seat: curP.seat,
        name: curP.name,
        colorHex: curP.color.hex,
        value: currentDice,
        rolling: ticks < 6,
        ts: Date.now()
      };
      renderPlayerCards();
      renderHud();
      if (ticks < 6) {
        rollTimer = setTimeout(spin, 75);
      } else {
        // Slightly fairer start nudge if all 4 pawns in base on early turns
        const myBase = state.tokens.filter(t => t.owner === curP.seat && t.zone === 'base').length;
        if (myBase === 4 && Math.random() < 0.28) currentDice = 6;

        lastRollInfo = {
          seat: curP.seat,
          name: curP.name,
          colorHex: curP.color.hex,
          value: currentDice,
          rolling: false,
          ts: Date.now()
        };
        calloutTimer = setTimeout(() => {
          if (lastRollInfo && Date.now() - lastRollInfo.ts >= 2100) {
            lastRollInfo = null;
            renderPlayerCards();
            renderRollCallout();
          }
        }, 2200);

        if (Rules.checkThreeSixesForfeit(state, currentDice)) {
          statusText = `⚠️ ${curP.name} rolled three 6s! Turn passed.`;
          showSeatBubble(curP.seat, 'Three 6s! 😅');
          if (typeof playSfx === 'function') playSfx('duelWrong');
          if (isLiveOnline && liveSync) {
            liveSync.pushState({
              event: 'roll',
              actorSeat: curP.seat,
              dice: currentDice,
              lastRollInfo,
              noMove: true,
              state: snapshotLudoState(),
              statusText
            });
          }
          render();
          botTimer = setTimeout(() => { if (!over) beginTurn(); }, 950);
          return;
        }

        legalMoves = Rules.getLegalMoves(state, curP.seat, currentDice);
        if (!legalMoves.length) {
          statusText = `${curP.color.emoji} ${curP.name} rolled 🎲 ${currentDice} — no legal move`;
          Rules.advanceTurn(state, false);
          if (isLiveOnline && liveSync) {
            liveSync.pushState({
              event: 'roll',
              actorSeat: curP.seat,
              dice: currentDice,
              lastRollInfo,
              noMove: true,
              state: snapshotLudoState(),
              statusText
            });
          }
          render();
          botTimer = setTimeout(() => { if (!over) beginTurn(); }, 950);
          return;
        }

        phase = 'pick';
        if (isLiveOnline && liveSync) {
          liveSync.pushState({
            event: 'roll',
            actorSeat: curP.seat,
            dice: currentDice,
            lastRollInfo,
            noMove: false,
            state: snapshotLudoState(),
            statusText: `${curP.color.emoji} ${curP.name} rolled 🎲 ${currentDice}!`
          });
        }

        if (shouldRunBot(curP)) {
          statusText = `${curP.color.emoji} ${curP.name} rolled 🎲 ${currentDice}!`;
          render();
          const chosen = Rules.chooseBotMove(state, curP.seat, currentDice, botTier);
          botTimer = setTimeout(() => {
            if (!over && chosen) executeTokenMove(chosen.tokenId);
          }, 680);
        } else if (isLocalTurn(curP)) {
          if (legalMoves.length === 1) {
            statusText = `You rolled 🎲 ${currentDice} · Moving pawn…`;
            render();
            botTimer = setTimeout(() => {
              if (!over) executeTokenMove(legalMoves[0].tokenId);
            }, 300);
          } else {
            statusText = `You rolled 🎲 ${currentDice}! Tap a glowing pawn`;
            render();
            autoTimer = setTimeout(() => {
              if (!over && phase === 'pick' && legalMoves.length && isLocalTurn(curP)) {
                const pick = Rules.chooseBotMove(state, curP.seat, currentDice, 'standard');
                if (pick) executeTokenMove(pick.tokenId);
              }
            }, TURN_MS);
          }
        }
      }
    };
    spin();
  };

  const beginTurn = () => {
    if (over) return;
    stopTimers();
    phase = 'roll';
    legalMoves = [];
    const curP = state.players[state.turnIdx];
    turnDeadline = Date.now() + TURN_MS;

    const timerEl = $('#ldTimerPill', rootEl);
    turnTick = setInterval(() => {
      if (over) { clearInterval(turnTick); return; }
      const rem = Math.max(0, Math.ceil((turnDeadline - Date.now()) / 1000));
      if (timerEl) timerEl.textContent = `${rem}s`;
    }, 250);

    if (shouldRunBot(curP)) {
      statusText = `${curP.color.emoji} ${curP.name}'s turn…`;
      render();
      botTimer = setTimeout(() => { if (!over) performDiceRoll(); }, 620);
    } else if (isLocalTurn(curP)) {
      if (typeof playSfx === 'function') playSfx('turnStart');
      statusText = 'Your Turn — Tap Dice to Roll!';
      render();
      if (!isLiveOnline) {
        autoTimer = setTimeout(() => {
          if (!over && phase === 'roll' && isLocalTurn(curP)) performDiceRoll();
        }, TURN_MS);
      }
    } else {
      // Live online remote human turn — STRICTLY wait for remote sync, NEVER run bot!
      statusText = `${curP.color.emoji} Waiting for ${curP.name} to roll…`;
      render();
    }
  };

  // Live online multiplayer sync (Firestore + BroadcastChannel)
  if (isLiveOnline && roomId && typeof window.createLiveMatchSync === 'function') {
    const oppUids = state.players.filter(p => !p.isBot && p.uid !== myUid).map(p => p.uid);
    liveSync = window.createLiveMatchSync({
      roomId,
      roomCode,
      gameId: 'ludo',
      myUid,
      myName: myProfile.name,
      oppUids,
      onLeaveRequest: () => view.close(),
      onState: (payload) => {
        if (over || !payload) return;
        if (payload.event === 'roll') {
          currentDice = Number(payload.dice || currentDice);
          if (payload.lastRollInfo) {
            lastRollInfo = { ...payload.lastRollInfo, ts: Date.now() };
            clearTimeout(calloutTimer);
            calloutTimer = setTimeout(() => {
              if (lastRollInfo && Date.now() - lastRollInfo.ts >= 2100) {
                lastRollInfo = null;
                renderPlayerCards();
                renderRollCallout();
              }
            }, 2200);
          }
          if (typeof playSfx === 'function') playSfx('diceRoll');
          if (payload.statusText) statusText = payload.statusText;
          if (payload.noMove && payload.state) {
            applyLudoSnapshot(payload.state);
            render();
            botTimer = setTimeout(() => { if (!over) beginTurn(); }, 750);
          } else {
            render();
          }
        } else if (payload.event === 'move') {
          currentDice = Number(payload.dice || currentDice);
          if (payload.statusText) statusText = payload.statusText;
          if (payload.state) applyLudoSnapshot(payload.state);
          if (payload.captured && typeof playSfx === 'function') playSfx('capture');
          else if (payload.enteredHome && typeof playSfx === 'function') playSfx('rowClear');
          else if (typeof playSfx === 'function') playSfx('pawnStep');
          if (payload.winnerSeat !== null && payload.winnerSeat !== undefined) {
            render();
            showGameOverOverlay(payload.winnerSeat);
          } else {
            beginTurn();
          }
        } else if (payload.state) {
          applyLudoSnapshot(payload.state);
          if (payload.statusText) statusText = payload.statusText;
          beginTurn();
        }
      }
    });
    liveSync.mountConnectionBanner($('#ldStage', rootEl) || rootEl);
  }

  // Event bindings (clean single delegation per container)
  const boardSvg = $('#ldBoardSvg', rootEl);
  if (boardSvg) {
    boardSvg.onclick = (e) => {
      const curP = state.players[state.turnIdx];
      if (isSpectating || phase !== 'pick' || !isLocalTurn(curP)) return;
      const g = e.target.closest('[data-ld-token]');
      if (!g) return;
      const tokId = g.dataset.ldToken;
      if (!legalMoves.some(m => m.tokenId === tokId)) {
        if (typeof playSfx === 'function') playSfx('duelWrong');
        return;
      }
      executeTokenMove(tokId);
    };
  }

  const diceBtn = $('#ldDiceBtn', rootEl);
  if (diceBtn) {
    diceBtn.onclick = () => {
      const curP = state.players[state.turnIdx];
      if (!isSpectating && phase === 'roll' && isLocalTurn(curP)) {
        performDiceRoll();
      }
    };
  }

  if ($('#ldExitBtn', rootEl)) $('#ldExitBtn', rootEl).onclick = () => view.close();
  if ($('#ldSpecExit', rootEl)) $('#ldSpecExit', rootEl).onclick = () => view.close();
  if ($('#ldRulesBtn', rootEl)) $('#ldRulesBtn', rootEl).onclick = () => openLudoRulesModal();
  if ($('#ldInviteBtn', rootEl)) {
    $('#ldInviteBtn', rootEl).onclick = () => openLudoInviteModal({ mode: effectiveMode, stake, roomCode });
  }
  if ($('#ldQvBtn', rootEl)) {
    $('#ldQvBtn', rootEl).onclick = (e) => {
      e.stopPropagation();
      if (typeof QuickVoice !== 'undefined') {
        QuickVoice.openPanel($('#ldQvBtn', rootEl), 'ludo_snakes', (text, ico) => {
          showSeatBubble(mySeatId, `${ico} ${text}`);
          if (chatWidget) chatWidget.pushMessage(me?.name || 'You', `${ico} ${text}`, { spectate: isSpectating });
        });
      }
    };
  }

  let micLive = false;
  const micBtn = $('#ldMicBtn', rootEl);
  if (micBtn) {
    micBtn.onclick = () => {
      micLive = !micLive;
      micBtn.classList.toggle('on', micLive);
      micBtn.setAttribute('aria-pressed', micLive ? 'true' : 'false');
      micBtn.innerHTML = micLive ? '<span>🎙️</span><small>Live</small>' : '<span>🔇</span><small>Mic</small>';
      if (typeof playSfx === 'function') playSfx('tap');
    };
  }

  const chatHost = $('#ldChatHost', rootEl);
  if (chatHost && typeof createInGameChatWidget === 'function') {
    chatWidget = createInGameChatWidget({
      roomCode,
      gameId: 'ludo',
      spectate: isSpectating,
      quickLines: ['Roll a 6! 🎲', 'Nice capture! 💥', 'Safe star! ★', 'Good game! 👏', 'Watch out! 😎'],
      onMessage: (item) => {
        if (!item.system) showSeatBubble(mySeatId, item.text);
      }
    });
    chatWidget.mount(chatHost);
  }

  view.onclose = () => {
    over = true;
    stopTimers();
    if (liveSync) liveSync.destroy();
    if (chatWidget) chatWidget.destroy();
    if (!isSpectating && typeof setMyLiveActivity === 'function') setMyLiveActivity({ type: 'online' });
    if (typeof QuickVoice !== 'undefined') QuickVoice.closePanel();
  };

  beginTurn();
  return view;
}
window.launchLudoGame = launchLudoGame;
