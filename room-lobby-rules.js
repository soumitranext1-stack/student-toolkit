"use strict";
/* =====================================================================
   ROOM LOBBY RULES — PURE MULTIPLAYER SEAT, READY & START STATE MACHINE
   · Pure functions (zero DOM / Firestore side effects)
   · Shared by browser (window.RoomLobbyRules) & Node unit tests
   · Handles 2-seat (1v1/2P) & 4-seat (4P/2v2) waiting rooms
   · Zero auto-bots on create/join; explicit host-only +Add Bot support
   · Guest Ready toggle & Host Start Game gating
   ===================================================================== */
(function (global) {
  const ROOM_CODE_PREFIXES = {
    couple_chronicles: 'CC',
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
    number_match: 'NM',
    blitz_dots: 'BD',
    squad_arena: 'SQ',
    undercover: 'UC',
    math: 'SG',
    science: 'SG',
    vocab: 'SG',
    gk: 'SG'
  };

  const GAME_META_MAP = {
    ludo: { name: 'Ludo Royal 3D', icon: '🎲', defaultSubMode: '4p', formats: [{ id: '4p', label: '4 Players', maxPlayers: 4 }, { id: '1v1', label: '1v1 Duel', maxPlayers: 2 }] },
    jackaroo: { name: 'Jackaroo Royal', icon: '🃏', defaultSubMode: '2v2', formats: [{ id: '2v2', label: '2v2 Squad', maxPlayers: 4 }, { id: '1v1', label: '1v1 Duel', maxPlayers: 2 }] },
    uno: { name: 'UNO Clash', icon: '🌈', defaultSubMode: 'classic', formats: [{ id: 'classic', label: '4P Classic', maxPlayers: 4 }, { id: 'fun', label: '4P Fun +Stack', maxPlayers: 4 }, { id: '1v1', label: '1v1 Duel', maxPlayers: 2 }] },
    budget_clash: { name: 'Budget Clash', icon: '💰', defaultSubMode: 'ten_vs_cr', formats: [{ id: 'ten_vs_cr', label: '₹10 vs ₹1 Cr', maxPlayers: 2 }, { id: 'asli_nakli', label: 'Asli vs Nakli', maxPlayers: 2 }, { id: 'sasta_mehnga', label: 'Sasta ya Mehnga', maxPlayers: 2 }, { id: 'closest_guess', label: 'Closest Guess', maxPlayers: 2 }] },
    couple_chronicles: { name: 'Couple Chronicles', icon: '📖', defaultSubMode: 'midnight_express_velvet_shadow', formats: [{ id: 'midnight_express_velvet_shadow', label: '2-Partner Story', maxPlayers: 2 }] },
    couple_arena: { name: 'Couple & Bestie Arena', icon: '💗', defaultSubMode: 'mind_sync', formats: [{ id: 'mind_sync', label: 'Mind Sync', maxPlayers: 2 }, { id: 'truth_dare', label: 'Truth / Dare', maxPlayers: 2 }, { id: 'most_likely', label: 'Most Likely To', maxPlayers: 2 }, { id: 'love_meter', label: 'Love Meter', maxPlayers: 2 }] },
    number_match: { name: 'Number Match', icon: '🔢', defaultSubMode: 'duel', formats: [{ id: 'duel', label: '1v1 Duel', maxPlayers: 2 }, { id: 'classic', label: 'Classic Co-Op', maxPlayers: 2 }] },
    pool_8ball: { name: '8-Ball Pool', icon: '🎱', defaultSubMode: '1v1', formats: [{ id: '1v1', label: '1v1 Match', maxPlayers: 2 }] },
    chess_blitz: { name: 'Chess Blitz', icon: '♟️', defaultSubMode: '1v1', formats: [{ id: '1v1', label: '1v1 Blitz', maxPlayers: 2 }] },
    tile_race: { name: '60-Second Tile Race', icon: '⚡', defaultSubMode: '1v1', formats: [{ id: '1v1', label: '1v1 Race', maxPlayers: 2 }] },
    trap_door: { name: 'Trap Door Duel', icon: '🚪', defaultSubMode: '1v1', formats: [{ id: '1v1', label: '1v1 Duel', maxPlayers: 2 }] },
    mind_clash: { name: 'Mind Clash 1v1', icon: '🧠', defaultSubMode: '1v1', formats: [{ id: '1v1', label: '1v1 Clash', maxPlayers: 2 }] },
    pocket_territory: { name: 'Pocket Territory', icon: '🗺️', defaultSubMode: '1v1', formats: [{ id: '1v1', label: '1v1 Territory', maxPlayers: 2 }] }
  };

  const OPTIONAL_BOT_POOL = [
    { name: 'Aria Bot', avatar: 'av_g2', frame: 'none' },
    { name: 'Rohan Bot', avatar: 'av_b3', frame: 'none' },
    { name: 'Zara Bot', avatar: 'av_g3', frame: 'none' },
    { name: 'Leo Bot', avatar: 'av_b4', frame: 'none' }
  ];

  function cloneRoom(room) {
    return JSON.parse(JSON.stringify(room));
  }

  function normalizeGameId(rawGameId) {
    const g = String(rawGameId || '').trim().toLowerCase();
    if (g === 'couple_mind_sync' || g === 'couple_truth_dare' || g === 'couple_most_likely' || g === 'couple_love_meter') {
      return 'couple_arena';
    }
    return g || 'ludo';
  }

  function getGameMeta(rawGameId) {
    const gid = normalizeGameId(rawGameId);
    return GAME_META_MAP[gid] || {
      name: gid.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'Arena Match',
      icon: '🎮',
      defaultSubMode: '1v1',
      formats: [{ id: '1v1', label: '1v1 Match', maxPlayers: 2 }]
    };
  }

  function getDefaultMaxPlayers(rawGameId, subMode, explicitMax) {
    const exp = Number(explicitMax || 0);
    if (exp === 2 || exp === 4) return exp;
    const gid = normalizeGameId(rawGameId);
    const sm = String(subMode || '').trim().toLowerCase();

    if (sm === '1v1' || sm === 'duel' || sm === '2p') return 2;
    if (sm === '4p' || sm === '2v2' || sm === '4players') return 4;

    if (gid === 'ludo') return sm === '1v1' ? 2 : 4;
    if (gid === 'jackaroo') return sm === '1v1' ? 2 : 4;
    if (gid === 'uno') return sm === '1v1' ? 2 : 4;

    return 2;
  }

  function generateRoomCode(rawGameId, randFn) {
    const gid = normalizeGameId(rawGameId);
    const pre = ROOM_CODE_PREFIXES[gid] || 'SG';
    const r = typeof randFn === 'function' ? randFn() : Math.random();
    const num = Math.floor(1000 + (Math.abs(Number(r) || 0) % 1) * 9000);
    return pre + String(num).slice(0, 4);
  }

  function makeEmptySeat(index) {
    return {
      seatIndex: index,
      kind: 'empty', // 'host' | 'guest' | 'bot' | 'empty'
      uid: '',
      name: '',
      avatar: '',
      frame: 'none',
      ready: false,
      isBot: false,
      joinedAt: 0
    };
  }

  function buildPlayersMapFromSeats(seats, prevPlayers) {
    const prev = prevPlayers && typeof prevPlayers === 'object' ? prevPlayers : {};
    const out = {};
    (Array.isArray(seats) ? seats : []).forEach((s, idx) => {
      if (!s || s.kind === 'empty' || !s.uid) return;
      const old = prev[s.uid] || {};
      out[s.uid] = {
        uid: String(s.uid),
        name: String(s.name || 'Player'),
        avatar: String(s.avatar || 'av_b1'),
        frame: String(s.frame || 'none'),
        seatIndex: idx,
        kind: s.kind,
        isHost: s.kind === 'host',
        isBot: Boolean(s.isBot || s.kind === 'bot'),
        ready: s.kind === 'host' ? true : Boolean(s.ready),
        score: Number(old.score || 0),
        qIdx: Number(old.qIdx || 0),
        finished: Boolean(old.finished),
        paidStake: Boolean(old.paidStake),
        joinedAt: Number(s.joinedAt || old.joinedAt || Date.now())
      };
    });
    return out;
  }

  function normalizeRoomDoc(rawRoom) {
    if (!rawRoom || typeof rawRoom !== 'object') return null;
    const room = cloneRoom(rawRoom);
    const maxPlayers = getDefaultMaxPlayers(room.mode, room.subMode, room.maxPlayers);
    room.maxPlayers = maxPlayers;
    room.code = String(room.code || '').trim().toUpperCase();
    room.status = String(room.status || 'waiting');
    room.entryCoins = Math.max(0, Math.min(500, Math.floor(Number(room.entryCoins || 0))));

    // Rebuild seats array if missing or malformed (backwards-compatible with older room docs)
    let seats = Array.isArray(room.seats) && room.seats.length ? room.seats.slice(0, maxPlayers) : [];
    if (!seats.length) {
      const playersList = Object.values(room.players || {}).sort((a, b) => {
        if (a.uid === room.hostUid) return -1;
        if (b.uid === room.hostUid) return 1;
        return Number(a.joinedAt || 0) - Number(b.joinedAt || 0);
      });
      seats = [];
      for (let i = 0; i < maxPlayers; i++) {
        const p = playersList[i];
        if (p && p.uid) {
          const isHost = p.uid === room.hostUid;
          const isBot = Boolean(p.isBot || p.kind === 'bot' || String(p.uid).startsWith('bot_'));
          seats.push({
            seatIndex: i,
            kind: isHost ? 'host' : (isBot ? 'bot' : 'guest'),
            uid: String(p.uid),
            name: String(p.name || (isHost ? room.hostName || 'Host' : 'Player')),
            avatar: String(p.avatar || 'av_b1'),
            frame: String(p.frame || 'none'),
            ready: isHost || isBot ? true : Boolean(p.ready),
            isBot,
            joinedAt: Number(p.joinedAt || room.createdAt || Date.now())
          });
        } else {
          seats.push(makeEmptySeat(i));
        }
      }
    } else {
      while (seats.length < maxPlayers) seats.push(makeEmptySeat(seats.length));
      seats = seats.map((s, i) => {
        if (!s || s.kind === 'empty' || !s.uid) return makeEmptySeat(i);
        const isHost = s.kind === 'host' || s.uid === room.hostUid;
        const isBot = !isHost && (s.kind === 'bot' || Boolean(s.isBot));
        return {
          seatIndex: i,
          kind: isHost ? 'host' : (isBot ? 'bot' : 'guest'),
          uid: String(s.uid),
          name: String(s.name || 'Player'),
          avatar: String(s.avatar || 'av_b1'),
          frame: String(s.frame || 'none'),
          ready: isHost || isBot ? true : Boolean(s.ready),
          isBot,
          joinedAt: Number(s.joinedAt || room.createdAt || Date.now())
        };
      });
    }

    room.seats = seats;
    room.players = buildPlayersMapFromSeats(seats, room.players);
    room.chat = Array.isArray(room.chat) ? room.chat.slice(-40) : [];
    return room;
  }

  function createWaitingRoomDoc(opts) {
    const o = opts || {};
    const now = Number(o.now || Date.now());
    const gameId = normalizeGameId(o.gameId);
    const meta = getGameMeta(gameId);
    const subMode = String(o.subMode || meta.defaultSubMode || '1v1');
    const maxPlayers = getDefaultMaxPlayers(gameId, subMode, o.maxPlayers);
    const code = String(o.roomCode || generateRoomCode(gameId)).trim().toUpperCase();
    const stake = Math.max(0, Math.min(500, Math.floor(Number(o.stake || 0))));
    const host = o.host || {};
    const hostUid = String(host.uid || 'host_local');
    const hostName = String(host.name || 'Player').trim() || 'Player';
    const hostAvatar = String(host.avatar || 'av_b1');
    const hostFrame = String(host.frame || 'none');

    // Seat 0 = Host; remaining seats strictly EMPTY (no auto-bots!)
    const seats = [
      {
        seatIndex: 0,
        kind: 'host',
        uid: hostUid,
        name: hostName,
        avatar: hostAvatar,
        frame: hostFrame,
        ready: true,
        isBot: false,
        joinedAt: now
      }
    ];
    for (let i = 1; i < maxPlayers; i++) {
      seats.push(makeEmptySeat(i));
    }

    const id = String(o.roomId || ('room_' + code.toLowerCase().replace(/[^a-z0-9]/g, '') + '_' + now.toString(36)));
    return {
      id,
      code,
      mode: gameId,
      subMode,
      tierLabel: String(o.gameName || meta.name),
      entryCoins: stake,
      maxPlayers,
      hostUid,
      hostName,
      status: 'waiting',
      seed: code + '_' + now,
      roundNo: 1,
      createdAt: now,
      updatedAt: now,
      startedAt: 0,
      seats,
      players: buildPlayersMapFromSeats(seats, {}),
      chat: [
        {
          id: 'sys_' + now,
          type: 'sys',
          text: `${hostName} opened ${o.gameName || meta.name} lobby (${code})`,
          ts: now
        }
      ]
    };
  }

  function joinRoomSeat(rawRoom, player, nowTs) {
    const room = normalizeRoomDoc(rawRoom);
    if (!room) return { ok: false, reason: 'not_found', message: 'Room not found or expired.', room: null, seatIndex: -1 };
    const p = player || {};
    const pUid = String(p.uid || '').trim();
    if (!pUid) return { ok: false, reason: 'invalid_player', message: 'Player identity missing.', room, seatIndex: -1 };

    const existingIdx = room.seats.findIndex(s => s && s.uid === pUid);
    if (existingIdx >= 0) {
      if (room.status === 'closed' || room.status === 'finished') {
        return { ok: false, reason: room.status, message: 'This match room has already ended.', room, seatIndex: existingIdx };
      }
      // Refresh profile info on rejoin
      room.seats[existingIdx].name = String(p.name || room.seats[existingIdx].name || 'Player');
      room.seats[existingIdx].avatar = String(p.avatar || room.seats[existingIdx].avatar || 'av_b1');
      room.seats[existingIdx].frame = String(p.frame || room.seats[existingIdx].frame || 'none');
      room.players = buildPlayersMapFromSeats(room.seats, room.players);
      room.updatedAt = Number(nowTs || Date.now());
      return { ok: true, reason: 'already_seated', message: 'Rejoined your seat.', room, seatIndex: existingIdx };
    }

    if (room.status === 'closed' || room.status === 'finished') {
      return { ok: false, reason: room.status, message: 'This room has already ended.', room, seatIndex: -1 };
    }
    if (room.status === 'playing') {
      return { ok: false, reason: 'already_started', message: 'Match has already started.', room, seatIndex: -1 };
    }

    const emptyIdx = room.seats.findIndex(s => !s || s.kind === 'empty' || !s.uid);
    if (emptyIdx < 0) {
      return { ok: false, reason: 'full', message: 'Room is full — all seats are occupied.', room, seatIndex: -1 };
    }

    const now = Number(nowTs || Date.now());
    const pName = String(p.name || 'Player').trim() || 'Player';
    room.seats[emptyIdx] = {
      seatIndex: emptyIdx,
      kind: 'guest',
      uid: pUid,
      name: pName,
      avatar: String(p.avatar || 'av_b1'),
      frame: String(p.frame || 'none'),
      ready: false, // Guests MUST explicitly press Ready
      isBot: false,
      joinedAt: now
    };
    room.players = buildPlayersMapFromSeats(room.seats, room.players);
    room.chat = [
      ...(room.chat || []),
      { id: 'join_' + now + '_' + emptyIdx, type: 'sys', text: `${pName} joined Seat ${emptyIdx + 1}`, ts: now }
    ].slice(-40);
    room.updatedAt = now;

    return { ok: true, reason: 'joined', message: `Seated in Seat ${emptyIdx + 1}`, room, seatIndex: emptyIdx };
  }

  function togglePlayerReady(rawRoom, playerUid, explicitReady, nowTs) {
    const room = normalizeRoomDoc(rawRoom);
    if (!room) return { ok: false, reason: 'not_found', room: null, ready: false };
    if (room.status !== 'waiting') return { ok: false, reason: 'not_waiting', room, ready: false };

    const idx = room.seats.findIndex(s => s && s.uid === String(playerUid || ''));
    if (idx < 0) return { ok: false, reason: 'not_seated', room, ready: false };
    const seat = room.seats[idx];
    if (seat.kind === 'host') {
      seat.ready = true;
      room.players = buildPlayersMapFromSeats(room.seats, room.players);
      return { ok: true, reason: 'host_always_ready', room, ready: true };
    }
    if (seat.kind !== 'guest') return { ok: false, reason: 'not_guest', room, ready: Boolean(seat.ready) };

    const nextReady = typeof explicitReady === 'boolean' ? explicitReady : !seat.ready;
    seat.ready = nextReady;
    room.players = buildPlayersMapFromSeats(room.seats, room.players);
    room.updatedAt = Number(nowTs || Date.now());
    return { ok: true, reason: nextReady ? 'ready' : 'not_ready', room, ready: nextReady };
  }

  function addBotToRoom(rawRoom, requesterUid, nowTs) {
    const room = normalizeRoomDoc(rawRoom);
    if (!room) return { ok: false, reason: 'not_found', message: 'Room unavailable.', room: null, seatIndex: -1 };
    if (room.status !== 'waiting') return { ok: false, reason: 'not_waiting', message: 'Room is not waiting.', room, seatIndex: -1 };
    if (String(requesterUid || '') !== room.hostUid) {
      return { ok: false, reason: 'host_only', message: 'Only the Host can add a bot.', room, seatIndex: -1 };
    }

    const emptyIdx = room.seats.findIndex(s => !s || s.kind === 'empty' || !s.uid);
    if (emptyIdx < 0) return { ok: false, reason: 'full', message: 'All seats are already filled.', room, seatIndex: -1 };

    const usedNames = new Set(room.seats.filter(s => s && s.name).map(s => s.name.toLowerCase()));
    const botPick = OPTIONAL_BOT_POOL.find(b => !usedNames.has(b.name.toLowerCase())) || OPTIONAL_BOT_POOL[emptyIdx % OPTIONAL_BOT_POOL.length];
    const now = Number(nowTs || Date.now());

    room.seats[emptyIdx] = {
      seatIndex: emptyIdx,
      kind: 'bot',
      uid: `bot_seat_${emptyIdx}_${now.toString(36).slice(-4)}`,
      name: botPick.name,
      avatar: botPick.avatar,
      frame: botPick.frame || 'none',
      ready: true,
      isBot: true,
      joinedAt: now
    };
    room.players = buildPlayersMapFromSeats(room.seats, room.players);
    room.chat = [
      ...(room.chat || []),
      { id: 'bot_' + now + '_' + emptyIdx, type: 'sys', text: `Host added ${botPick.name} to Seat ${emptyIdx + 1}`, ts: now }
    ].slice(-40);
    room.updatedAt = now;
    return { ok: true, reason: 'bot_added', message: `${botPick.name} added`, room, seatIndex: emptyIdx };
  }

  function removeSeatFromRoom(rawRoom, seatIndex, requesterUid, nowTs) {
    const room = normalizeRoomDoc(rawRoom);
    if (!room) return { ok: false, reason: 'not_found', room: null };
    const idx = Number(seatIndex);
    if (!Number.isInteger(idx) || idx < 0 || idx >= room.seats.length) {
      return { ok: false, reason: 'invalid_seat', room };
    }
    const target = room.seats[idx];
    if (!target || target.kind === 'empty') return { ok: false, reason: 'already_empty', room };
    if (target.kind === 'host') return { ok: false, reason: 'cannot_remove_host', room };

    const req = String(requesterUid || '');
    const isHost = req === room.hostUid;
    const isSelf = req === target.uid;
    if (!isHost && !isSelf) return { ok: false, reason: 'forbidden', room };

    const removedName = target.name || 'Player';
    const now = Number(nowTs || Date.now());
    room.seats[idx] = makeEmptySeat(idx);
    room.players = buildPlayersMapFromSeats(room.seats, room.players);
    room.chat = [
      ...(room.chat || []),
      {
        id: 'rem_' + now + '_' + idx,
        type: 'sys',
        text: isSelf ? `${removedName} left the lobby` : `Host removed ${removedName}`,
        ts: now
      }
    ].slice(-40);
    room.updatedAt = now;
    return { ok: true, reason: isSelf ? 'left' : 'removed', room, removedName };
  }

  function resizeRoomSeats(rawRoom, newMaxPlayers, newSubMode, requesterUid, nowTs) {
    const room = normalizeRoomDoc(rawRoom);
    if (!room) return { ok: false, reason: 'not_found', room: null };
    if (room.status !== 'waiting') return { ok: false, reason: 'not_waiting', room };
    if (String(requesterUid || '') !== room.hostUid) return { ok: false, reason: 'host_only', room };

    const targetMax = getDefaultMaxPlayers(room.mode, newSubMode || room.subMode, newMaxPlayers);
    const occupied = room.seats.filter(s => s && s.kind !== 'empty' && s.uid);
    if (occupied.length > targetMax) {
      return { ok: false, reason: 'too_many_players', message: `Remove extra players before switching to ${targetMax}P.`, room };
    }

    const nextSeats = [];
    for (let i = 0; i < targetMax; i++) {
      if (occupied[i]) {
        nextSeats.push({ ...occupied[i], seatIndex: i });
      } else {
        nextSeats.push(makeEmptySeat(i));
      }
    }
    room.maxPlayers = targetMax;
    if (newSubMode) room.subMode = String(newSubMode);
    room.seats = nextSeats;
    room.players = buildPlayersMapFromSeats(nextSeats, room.players);
    room.updatedAt = Number(nowTs || Date.now());
    return { ok: true, reason: 'resized', room };
  }

  function canStartRoom(rawRoom) {
    const room = normalizeRoomDoc(rawRoom);
    if (!room) {
      return { ok: false, reason: 'not_found', message: 'Room unavailable.', seatedOthersCount: 0, realGuestCount: 0, readyGuestCount: 0, unreadyNames: [] };
    }
    if (room.status !== 'waiting') {
      return { ok: false, reason: 'not_waiting', message: 'Match already started or closed.', seatedOthersCount: 0, realGuestCount: 0, readyGuestCount: 0, unreadyNames: [] };
    }

    const others = room.seats.filter(s => s && s.kind !== 'empty' && s.kind !== 'host' && s.uid);
    const realGuests = others.filter(s => s.kind === 'guest' && !s.isBot);
    const readyGuests = realGuests.filter(s => Boolean(s.ready));
    const unreadyGuests = realGuests.filter(s => !s.ready);
    const unreadyNames = unreadyGuests.map(s => s.name || 'Guest');

    if (others.length < 1) {
      return {
        ok: false,
        reason: 'need_player',
        message: 'Waiting for a friend to join…',
        seatedOthersCount: 0,
        realGuestCount: 0,
        readyGuestCount: 0,
        unreadyNames: []
      };
    }

    if (unreadyGuests.length > 0) {
      return {
        ok: false,
        reason: 'guests_not_ready',
        message: `Waiting for ${unreadyNames.join(', ')} to tap Ready`,
        seatedOthersCount: others.length,
        realGuestCount: realGuests.length,
        readyGuestCount: readyGuests.length,
        unreadyNames
      };
    }

    return {
      ok: true,
      reason: 'ready_to_start',
      message: 'All players ready — Start Game!',
      seatedOthersCount: others.length,
      realGuestCount: realGuests.length,
      readyGuestCount: readyGuests.length,
      unreadyNames: []
    };
  }

  function startRoomMatch(rawRoom, requesterUid, nowTs) {
    const room = normalizeRoomDoc(rawRoom);
    if (!room) return { ok: false, reason: 'not_found', message: 'Room unavailable.', room: null };
    if (String(requesterUid || '') !== room.hostUid) {
      return { ok: false, reason: 'host_only', message: 'Only the Host can start the game.', room };
    }
    const check = canStartRoom(room);
    if (!check.ok) return { ok: false, reason: check.reason, message: check.message, room };

    const now = Number(nowTs || Date.now());
    room.status = 'playing';
    room.startedAt = now;
    room.updatedAt = now;
    room.chat = [
      ...(room.chat || []),
      { id: 'start_' + now, type: 'sys', text: `${room.hostName || 'Host'} started the match!`, ts: now }
    ].slice(-40);
    return { ok: true, reason: 'started', message: 'Starting match!', room };
  }

  function extractMatchParticipants(rawRoom, myUid) {
    const room = normalizeRoomDoc(rawRoom);
    if (!room) return { isHost: false, rival: null, invitedFriends: [], seatRoster: [], occupiedCount: 0 };
    const selfUid = String(myUid || '');
    const occupied = room.seats.filter(s => s && s.kind !== 'empty' && s.uid);
    const others = occupied.filter(s => s.uid !== selfUid);
    const invitedFriends = others.map(s => ({
      uid: s.uid,
      name: s.name,
      avatar: s.avatar || 'av_b1',
      frame: s.frame || 'none',
      isBot: Boolean(s.isBot || s.kind === 'bot'),
      seatIndex: s.seatIndex
    }));

    // Map seats for games like Jackaroo (1v1 uses seats 0 & 2; 2v2 uses seats 0,1,2,3)
    const isJackaroo1v1 = room.mode === 'jackaroo' && room.subMode === '1v1';
    const seatRoster = occupied.map((s, idx) => ({
      seat: isJackaroo1v1 ? (idx === 0 ? 0 : 2) : idx,
      uid: s.uid,
      name: s.name,
      avatar: s.avatar || 'av_b1',
      kind: s.kind === 'host' ? 'host' : (s.kind === 'bot' ? 'bot' : 'joined'),
      isBot: Boolean(s.isBot || s.kind === 'bot')
    }));

    return {
      isHost: selfUid === room.hostUid,
      rival: invitedFriends[0] || null,
      invitedFriends,
      seatRoster,
      occupiedCount: occupied.length
    };
  }

  const api = {
    ROOM_CODE_PREFIXES,
    GAME_META_MAP,
    normalizeGameId,
    getGameMeta,
    getDefaultMaxPlayers,
    generateRoomCode,
    makeEmptySeat,
    normalizeRoomDoc,
    createWaitingRoomDoc,
    joinRoomSeat,
    togglePlayerReady,
    addBotToRoom,
    removeSeatFromRoom,
    resizeRoomSeats,
    canStartRoom,
    startRoomMatch,
    extractMatchParticipants
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  if (global) {
    global.RoomLobbyRules = api;
  }
})(typeof window !== 'undefined' ? window : globalThis);
