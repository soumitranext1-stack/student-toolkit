(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.PartyModeStagesRules = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const VALID_MODES = ['normal', 'acquaint', 'auction', 'video', 'games'];

  const ACQUAINT_ACTIONS = [
    { id: 'interact', label: 'Interact', icon: '💬', desc: 'Ice-breaker prompt for seated guests' },
    { id: 'select', label: 'Select', icon: '💘', desc: 'Pick your favorite guest seat' },
    { id: 'reveal', label: 'Reveal', icon: '✨', desc: 'Reveal mutual match hearts' },
    { id: 'confess', label: 'Confess', icon: '💌', desc: 'Send a stage confession' }
  ];

  const ACQUAINT_PROMPTS = [
    'Share your favorite late-night song with the room!',
    'What is the best compliment you received this week?',
    'Pick a seat partner for a 2-minute duet or Q&A!',
    'Describe your dream weekend getaway in 5 words.'
  ];

  const AUCTION_MODES = [
    { id: 'bidding', label: 'Bidding' },
    { id: 'relationship', label: 'Relationship Advancement' }
  ];

  const AUCTION_BID_TYPES = [
    { id: 'ordinary', label: 'Ordinary bidding', desc: 'Open coin bidding for the VIP throne' },
    { id: 'bff', label: 'BFF', desc: 'Exclusive Bestie / BFF bond auction' }
  ];

  const AUCTION_RELATION_TAGS = ['BFF', 'Bestie', 'Soulmate', 'CP / Couple', 'Guardian', 'Mentor'];

  const ROOM_GAMES_CATALOG = [
    { id: 'uno', name: 'Oh My Card', icon: '🃏', accent: '#f59e0b', players: '2-4P', desc: 'Fast color & +4 UNO clash' },
    { id: 'jackaroo', name: 'Jackaroo', icon: '♟️', accent: '#38bdf8', players: '2-4P', desc: 'Royal marble & card strategy' },
    { id: 'ludo', name: 'Ludo', icon: '🎲', accent: '#22c55e', players: '2-4P', desc: 'Classic 3D Ludo race' },
    { id: 'pool8', name: '8-Ball Pool', icon: '🎱', accent: '#a855f7', players: '1v1', desc: 'Precision billiards duel' },
    { id: 'budget', name: 'Budget Clash', icon: '💎', accent: '#ec4899', players: '1v1', desc: '₹10 vs ₹1 Cr TV showdown' },
    { id: 'couple', name: 'Couple Arena', icon: '💞', accent: '#f43f5e', players: '2P', desc: 'Sync & chemistry challenge' }
  ];

  const ROOM_GAME_TIERS = [
    { id: 'classic_free', label: 'Classic Free', fee: 0, badge: 'Free' },
    { id: 'junior', label: 'Junior', fee: 50, badge: '50 🪙' },
    { id: 'medium', label: 'Medium', fee: 200, badge: '200 🪙' }
  ];

  function sanitizeMode(mode) {
    const m = String(mode || 'normal').trim().toLowerCase();
    return VALID_MODES.includes(m) ? m : 'normal';
  }

  function buildModeSwitchCleanupPlan(prevMode, nextMode, actorName) {
    const from = sanitizeMode(prevMode);
    const to = sanitizeMode(nextMode);
    const who = String(actorName || 'Admin').trim() || 'Admin';
    const modeNames = {
      normal: 'Normal',
      acquaint: 'Acquaint',
      auction: 'Auction',
      video: 'Video',
      games: 'Games'
    };
    return {
      changed: from !== to,
      fromMode: from,
      toMode: to,
      destroyVideoPlayer: from === 'video' && to !== 'video',
      standUpGuestMics: from !== to,
      clearTransientTimers: from !== to,
      systemLog: `🔄 ${who} changed the mode from ${modeNames[from]} to ${modeNames[to]}`
    };
  }

  function applyGuestMicStandUp(seats, ownerUid) {
    if (!seats || typeof seats !== 'object') return {};
    const next = {};
    const keepOwner = String(ownerUid || '').trim();
    Object.keys(seats).forEach(k => {
      const occ = seats[k];
      if (!occ || !occ.uid) return;
      if (k === '0' || (keepOwner && occ.uid === keepOwner)) {
        next[k] = { ...occ };
      }
    });
    return next;
  }

  /* ===== Acquaint Mode State Machine ===== */
  function normalizeAcquaintState(raw) {
    const src = raw && typeof raw === 'object' ? raw : {};
    return {
      status: src.status === 'active' ? 'active' : 'waiting',
      phase: ['waiting', 'interact', 'select', 'reveal', 'confess'].includes(src.phase) ? src.phase : 'waiting',
      prompt: String(src.prompt || ''),
      selectedSeat: src.selectedSeat != null ? Number(src.selectedSeat) : null,
      selectedName: String(src.selectedName || ''),
      hearts: Math.max(0, Number(src.hearts || 0)),
      lastNotice: String(src.lastNotice || ''),
      updatedAt: Number(src.updatedAt || 0)
    };
  }

  function applyAcquaintAction(rawState, actionId, opts, nowTs) {
    const st = normalizeAcquaintState(rawState);
    const act = String(actionId || '').trim().toLowerCase();
    const o = opts && typeof opts === 'object' ? opts : {};
    const now = Number(nowTs || Date.now());
    const actor = String(o.actorName || 'Host').trim() || 'Host';

    if (act === 'start') {
      const nextPrompt = ACQUAINT_PROMPTS[st.hearts % ACQUAINT_PROMPTS.length];
      return {
        ok: true,
        state: {
          ...st,
          status: 'active',
          phase: 'interact',
          prompt: nextPrompt,
          lastNotice: `💘 ${actor} started Acquaint stage!`,
          updatedAt: now
        },
        chatText: `💘 ${actor} started the Acquaint Couple Stage — "${nextPrompt}"`
      };
    }

    if (act === 'reset') {
      return {
        ok: true,
        state: normalizeAcquaintState({ status: 'waiting', phase: 'waiting', hearts: st.hearts, updatedAt: now }),
        chatText: `💞 ${actor} reset Acquaint stage to Waiting for guests.`
      };
    }

    if (act === 'interact') {
      const idx = (st.hearts + 1) % ACQUAINT_PROMPTS.length;
      const prompt = ACQUAINT_PROMPTS[idx];
      return {
        ok: true,
        state: {
          ...st,
          status: 'active',
          phase: 'interact',
          prompt,
          hearts: st.hearts + 1,
          lastNotice: `💬 Interact: ${prompt}`,
          updatedAt: now
        },
        chatText: `💬 [Acquaint · Interact] ${prompt}`
      };
    }

    if (act === 'select') {
      const targetSeat = o.targetSeat != null ? Number(o.targetSeat) : (st.selectedSeat || 1);
      const targetName = String(o.targetName || `Seat ${targetSeat}`).trim();
      return {
        ok: true,
        state: {
          ...st,
          status: 'active',
          phase: 'select',
          selectedSeat: targetSeat,
          selectedName: targetName,
          hearts: st.hearts + 2,
          lastNotice: `💘 ${actor} selected ${targetName}`,
          updatedAt: now
        },
        chatText: `💘 [Acquaint · Select] ${actor} chose ${targetName}!`
      };
    }

    if (act === 'reveal') {
      const pairLabel = st.selectedName ? `${actor} & ${st.selectedName}` : `${actor}'s stage match`;
      return {
        ok: true,
        state: {
          ...st,
          status: 'active',
          phase: 'reveal',
          hearts: st.hearts + 5,
          lastNotice: `✨ Heart Reveal: ${pairLabel} (+5 ❤️)`,
          updatedAt: now
        },
        chatText: `✨ [Acquaint · Reveal] Mutual heart reveal for ${pairLabel}!`
      };
    }

    if (act === 'confess') {
      const target = String(o.targetName || st.selectedName || 'the room').trim();
      return {
        ok: true,
        state: {
          ...st,
          status: 'active',
          phase: 'confess',
          hearts: st.hearts + 10,
          lastNotice: `💌 ${actor} sent a stage confession to ${target}!`,
          updatedAt: now
        },
        chatText: `💌 [Acquaint · Confess] ${actor} confessed to ${target} on the Couple Stage! 💞`
      };
    }

    return { ok: false, reason: 'Unknown Acquaint action', state: st };
  }

  /* ===== Auction Mode State Machine ===== */
  function normalizeAuctionState(raw) {
    const src = raw && typeof raw === 'object' ? raw : {};
    const tab = src.tab === 'relationship' ? 'relationship' : 'bidding';
    const bidType = src.bidType === 'bff' ? 'bff' : 'ordinary';
    const startingPrice = Math.max(0, Math.round(Number(src.startingPrice || 0)));
    const currentBid = Math.max(0, Math.round(Number(src.currentBid || 0)));
    return {
      tab,
      bidType,
      relationship: String(src.relationship || '').trim(),
      startingPrice,
      currentBid,
      highestBidderUid: String(src.highestBidderUid || ''),
      highestBidderName: String(src.highestBidderName || ''),
      status: ['idle', 'live', 'sold'].includes(src.status) ? src.status : 'idle',
      vipUid: String(src.vipUid || ''),
      vipName: String(src.vipName || ''),
      updatedAt: Number(src.updatedAt || 0)
    };
  }

  function applyAuctionSettings(rawState, patch, nowTs) {
    const st = normalizeAuctionState(rawState);
    const p = patch && typeof patch === 'object' ? patch : {};
    const now = Number(nowTs || Date.now());
    const tab = p.tab === 'relationship' ? 'relationship' : (p.tab === 'bidding' ? 'bidding' : st.tab);
    const bidType = p.bidType === 'bff' ? 'bff' : (p.bidType === 'ordinary' ? 'ordinary' : st.bidType);
    const relationship = typeof p.relationship === 'string' ? p.relationship.trim().slice(0, 28) : st.relationship;
    const rawPrice = p.startingPrice !== undefined ? Number(p.startingPrice) : st.startingPrice;
    const startingPrice = Number.isFinite(rawPrice) ? Math.max(0, Math.min(1000000, Math.round(rawPrice))) : st.startingPrice;
    const nextStatus = startingPrice > 0 || relationship ? 'live' : st.status;
    return {
      ok: true,
      state: {
        ...st,
        tab,
        bidType,
        relationship,
        startingPrice,
        currentBid: st.currentBid >= startingPrice ? st.currentBid : 0,
        status: nextStatus,
        updatedAt: now
      }
    };
  }

  function placeAuctionBid(rawState, bidderUid, bidderName, increment, nowTs) {
    const st = normalizeAuctionState(rawState);
    const inc = Math.max(10, Math.round(Number(increment || 50)));
    const base = st.currentBid > 0 ? st.currentBid : Math.max(0, st.startingPrice);
    const nextBid = st.currentBid > 0 ? base + inc : (base > 0 ? base : inc);
    const now = Number(nowTs || Date.now());
    return {
      ok: true,
      bidAmount: nextBid,
      state: {
        ...st,
        status: 'live',
        currentBid: nextBid,
        highestBidderUid: String(bidderUid || ''),
        highestBidderName: String(bidderName || 'Guest').trim() || 'Guest',
        updatedAt: now
      },
      chatText: `🔨 ${String(bidderName || 'Guest').trim()} bid ${nextBid} 🪙${st.relationship ? ` for ${st.relationship}` : ''}!`
    };
  }

  function concludeAuction(rawState, nowTs) {
    const st = normalizeAuctionState(rawState);
    if (!st.highestBidderName || st.currentBid <= 0) {
      return { ok: false, reason: 'No bids placed yet', state: st };
    }
    const now = Number(nowTs || Date.now());
    return {
      ok: true,
      state: {
        ...st,
        status: 'sold',
        vipUid: st.highestBidderUid,
        vipName: st.highestBidderName,
        updatedAt: now
      },
      chatText: `👑 SOLD! ${st.highestBidderName} won the VIP seat${st.relationship ? ` (${st.relationship})` : ''} for ${st.currentBid} 🪙!`
    };
  }

  /* ===== Games Mode State Machine ===== */
  function normalizeGamesStageState(raw) {
    const src = raw && typeof raw === 'object' ? raw : {};
    const validGame = ROOM_GAMES_CATALOG.some(g => g.id === src.gameId) ? src.gameId : 'uno';
    const validTier = ROOM_GAME_TIERS.some(t => t.id === src.tierId) ? src.tierId : 'classic_free';
    const players = Array.isArray(src.players) ? src.players.filter(p => p && p.uid).slice(0, 4) : [];
    return {
      gameId: validGame,
      tierId: validTier,
      lobbyStatus: src.lobbyStatus === 'waiting' || src.lobbyStatus === 'ready' ? src.lobbyStatus : 'idle',
      players,
      updatedAt: Number(src.updatedAt || 0)
    };
  }

  function selectRoomGame(rawState, gameId, nowTs) {
    const st = normalizeGamesStageState(rawState);
    const found = ROOM_GAMES_CATALOG.find(g => g.id === gameId);
    if (!found) return { ok: false, reason: 'Unknown game', state: st };
    return {
      ok: true,
      game: found,
      state: { ...st, gameId: found.id, updatedAt: Number(nowTs || Date.now()) }
    };
  }

  function selectRoomGameTier(rawState, tierId, nowTs) {
    const st = normalizeGamesStageState(rawState);
    const found = ROOM_GAME_TIERS.find(t => t.id === tierId);
    if (!found) return { ok: false, reason: 'Unknown sub-mode', state: st };
    return {
      ok: true,
      tier: found,
      state: { ...st, tierId: found.id, updatedAt: Number(nowTs || Date.now()) }
    };
  }

  function openRoomGameLobby(rawState, hostPlayer, nowTs) {
    const st = normalizeGamesStageState(rawState);
    const host = hostPlayer && hostPlayer.uid
      ? { uid: String(hostPlayer.uid), name: String(hostPlayer.name || 'Host'), avatar: String(hostPlayer.avatar || 'av_b1') }
      : { uid: 'host', name: 'Host', avatar: 'av_b1' };
    const others = st.players.filter(p => p.uid !== host.uid);
    const players = [host, ...others].slice(0, 4);
    return {
      ok: true,
      state: {
        ...st,
        lobbyStatus: players.length >= 2 ? 'ready' : 'waiting',
        players,
        updatedAt: Number(nowTs || Date.now())
      }
    };
  }

  function cancelRoomGameLobby(rawState, nowTs) {
    const st = normalizeGamesStageState(rawState);
    return {
      ok: true,
      state: {
        ...st,
        lobbyStatus: 'idle',
        players: [],
        updatedAt: Number(nowTs || Date.now())
      }
    };
  }

  return {
    VALID_MODES,
    ACQUAINT_ACTIONS,
    ACQUAINT_PROMPTS,
    AUCTION_MODES,
    AUCTION_BID_TYPES,
    AUCTION_RELATION_TAGS,
    ROOM_GAMES_CATALOG,
    ROOM_GAME_TIERS,
    sanitizeMode,
    buildModeSwitchCleanupPlan,
    applyGuestMicStandUp,
    normalizeAcquaintState,
    applyAcquaintAction,
    normalizeAuctionState,
    applyAuctionSettings,
    placeAuctionBid,
    concludeAuction,
    normalizeGamesStageState,
    selectRoomGame,
    selectRoomGameTier,
    openRoomGameLobby,
    cancelRoomGameLobby
  };
});
