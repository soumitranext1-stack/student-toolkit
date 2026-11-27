"use strict";
/* =====================================================================
   PVP SYNC RULES — STRICT HUMAN vs BOT AUTHORITY & CONNECTION STATE
   · 100% pure functions (zero DOM / Firestore side effects)
   · Shared by browser (window.PvpSyncRules) & Node unit tests
   · Hard-blocks bot AI on EVERY real human seat or live invite/PvP match
   · Bots are allowed ONLY in explicit Practice/Bot mode OR on explicit
     +Add Bot seats in a 4P lobby (never hijacking human or empty seats)
   ===================================================================== */
(function (global) {
  const BOT_UID_RE = /^(bot_|ludo_bot_|uno_bot_|jk_bot_|ai_partner|cpu_)/i;

  function isBotIdentity(entity) {
    if (!entity || typeof entity !== 'object') return false;
    if (entity.isBot === true) return true;
    if (String(entity.kind || '').toLowerCase() === 'bot') return true;
    const u = String(entity.uid || entity.id || '').trim();
    if (u && BOT_UID_RE.test(u)) return true;
    return false;
  }

  function isRealHumanSeat(entity) {
    if (!entity || typeof entity !== 'object') return false;
    const kind = String(entity.kind || '').toLowerCase();
    if (kind === 'empty' || kind === 'bot') return false;
    if (isBotIdentity(entity)) return false;
    const u = String(entity.uid || entity.id || '').trim();
    if (kind === 'host' || kind === 'guest' || kind === 'joined' || kind === 'invited') {
      return Boolean(u || entity.name);
    }
    return Boolean(u);
  }

  function normalizeModeType(raw) {
    const m = String(raw || '').trim().toLowerCase();
    if (m === 'invite' || m === 'friend' || m === 'friends' || m === 'coop' || m === 'room') return 'invite';
    if (m === 'pvp' || m === 'versus' || m === 'online') return 'pvp';
    if (m === 'solo_duo' || m === 'pass' || m === 'local_pvp') return 'local_pvp';
    return 'bot';
  }

  function resolveMatchAuthority(opts, myUidRaw) {
    const o = opts || {};
    const myUid = String(myUidRaw || o.myUid || '').trim();
    const modeType = normalizeModeType(o.modeType);
    const roomId = String(o.roomId || '').trim();
    const roomCode = String(o.roomCode || '').trim().toUpperCase();
    const isSpectating = Boolean(o.spectate || o.isSpectating);
    const seatRoster = Array.isArray(o.seatRoster) ? o.seatRoster.filter(Boolean) : [];
    const invitedFriends = Array.isArray(o.invitedFriends) ? o.invitedFriends.filter(Boolean) : [];
    const rival = o.rival && typeof o.rival === 'object' ? o.rival : null;

    const remoteHumans = [];
    const seenUids = new Set(myUid ? [myUid] : []);

    const pushIfRealRemote = (p) => {
      if (!p || !isRealHumanSeat(p)) return;
      const u = String(p.uid || p.id || '').trim();
      if (u && seenUids.has(u)) return;
      if (u) seenUids.add(u);
      remoteHumans.push(p);
    };

    seatRoster.forEach(pushIfRealRemote);
    invitedFriends.forEach(pushIfRealRemote);
    if (rival && !o.rivalBot) pushIfRealRemote(rival);

    const hasRealHumanOpponent = remoteHumans.length > 0;
    const hasExplicitInviteOrRoom = Boolean(roomId) && (modeType === 'invite' || modeType === 'pvp' || hasRealHumanOpponent);
    const isLiveOnline = !isSpectating && (hasExplicitInviteOrRoom || (modeType === 'invite' && hasRealHumanOpponent));
    const isLocalPassAndPlay = !isSpectating && !isLiveOnline && (modeType === 'local_pvp' || (modeType === 'pvp' && !hasRealHumanOpponent && !o.rivalBot));
    const isExplicitBotMode = !isSpectating && !isLiveOnline && !isLocalPassAndPlay && (modeType === 'bot' || Boolean(o.rivalBot));

    // Host determination: explicit isHost flag OR seatRoster[0] matches myUid OR non-online local player
    let isHost = true;
    if (typeof o.isHost === 'boolean') {
      isHost = o.isHost;
    } else if (seatRoster.length > 0 && myUid) {
      const hostSeat = seatRoster.find(s => String(s.kind || '').toLowerCase() === 'host') || seatRoster[0];
      isHost = Boolean(hostSeat && String(hostSeat.uid || '') === myUid);
    }

    return {
      modeType,
      roomId,
      roomCode,
      myUid,
      isHost,
      isSpectating,
      isLiveOnline,
      isLocalPassAndPlay,
      isExplicitBotMode,
      hasRealHumanOpponent,
      remoteHumans,
      // Strict hard-block: 1v1 bot AI is NEVER allowed when a real human opponent or live room is active
      botAllowed: isExplicitBotMode && !hasRealHumanOpponent && !isLiveOnline
    };
  }

  function resolve2PControl(opts, myUidRaw, myProfile) {
    const o = opts || {};
    const meObj = myProfile && typeof myProfile === 'object' ? myProfile : {};
    const myUid = String(myUidRaw || meObj.uid || o.myUid || 'local_me').trim();
    const myName = String(meObj.name || 'You').trim() || 'You';
    const myAvatar = String(meObj.avatar || 'av_b1');
    const auth = resolveMatchAuthority(o, myUid);
    const roster = Array.isArray(o.seatRoster) ? o.seatRoster.filter(s => s && s.kind !== 'empty') : [];

    let p1 = { uid: myUid, name: myName, avatar: myAvatar, isBot: false };
    let p2 = {
      uid: 'bot_p2',
      name: auth.isLocalPassAndPlay ? 'Player 2' : (o.botTier === 'pro' ? 'Pro Bot' : 'Bot'),
      avatar: 'av_g2',
      isBot: auth.botAllowed
    };
    let mySide = 'p1';

    if (auth.isLiveOnline) {
      if (roster.length >= 2) {
        const s0 = roster[0];
        const s1 = roster[1];
        p1 = {
          uid: String(s0.uid || 'host'),
          name: String(s0.name || 'Player 1'),
          avatar: String(s0.avatar || 'av_b1'),
          isBot: isBotIdentity(s0) && String(s0.kind || '').toLowerCase() === 'bot'
        };
        p2 = {
          uid: String(s1.uid || 'guest'),
          name: String(s1.name || 'Player 2'),
          avatar: String(s1.avatar || 'av_g2'),
          isBot: isBotIdentity(s1) && String(s1.kind || '').toLowerCase() === 'bot'
        };
        mySide = (p2.uid === myUid && p1.uid !== myUid) ? 'p2' : 'p1';
      } else {
        const remote = auth.remoteHumans[0] || o.rival || null;
        if (auth.isHost) {
          mySide = 'p1';
          p1 = { uid: myUid, name: myName, avatar: myAvatar, isBot: false };
          p2 = {
            uid: String((remote && remote.uid) || 'remote_p2'),
            name: String((remote && remote.name) || 'Friend'),
            avatar: String((remote && remote.avatar) || 'av_g2'),
            isBot: false
          };
        } else {
          mySide = 'p2';
          p1 = {
            uid: String((remote && remote.uid) || 'remote_p1'),
            name: String((remote && remote.name) || 'Host'),
            avatar: String((remote && remote.avatar) || 'av_b1'),
            isBot: false
          };
          p2 = { uid: myUid, name: myName, avatar: myAvatar, isBot: false };
        }
      }
    } else if (auth.isLocalPassAndPlay) {
      const opp = o.rival && !isBotIdentity(o.rival) ? o.rival : null;
      p2 = {
        uid: String((opp && opp.uid) || 'local_p2'),
        name: String((opp && opp.name) || 'Player 2'),
        avatar: String((opp && opp.avatar) || 'av_g2'),
        isBot: false
      };
    } else if (o.rival && isBotIdentity(o.rival)) {
      p2 = {
        uid: String(o.rival.uid || 'bot_p2'),
        name: String(o.rival.name || p2.name),
        avatar: String(o.rival.avatar || 'av_g2'),
        isBot: true
      };
    }

    // Double-lock: botAllowed is strictly false if either side is a live remote human
    const botAllowed = auth.isLiveOnline
      ? false
      : (auth.isExplicitBotMode && Boolean(p2.isBot));

    return {
      ...auth,
      botAllowed,
      mySide,
      oppSide: mySide === 'p1' ? 'p2' : 'p1',
      p1,
      p2,
      p1Uid: p1.uid,
      p2Uid: p2.uid,
      p1Name: p1.name,
      p2Name: p2.name,
      p1Avatar: p1.avatar,
      p2Avatar: p2.avatar,
      oppUid: mySide === 'p1' ? p2.uid : p1.uid,
      oppName: mySide === 'p1' ? p2.name : p1.name
    };
  }

  function canActOn2PTurn(turnSide, control) {
    if (!control) return false;
    if (control.isSpectating) return false;
    if (control.isLiveOnline) return turnSide === control.mySide;
    if (control.isLocalPassAndPlay) return turnSide === 'p1' || turnSide === 'p2';
    return turnSide === 'p1';
  }

  function shouldRun2PBot(turnSide, control) {
    if (!control) return false;
    if (control.isLiveOnline) return false;
    if (control.isLocalPassAndPlay) return false;
    if (!control.botAllowed) return false;
    return turnSide === 'p2';
  }

  function resolveMultiSeatRoster(opts, activeSeatIds, myUidRaw, myProfile, defaultBotPool) {
    const o = opts || {};
    const seatsIds = Array.isArray(activeSeatIds) && activeSeatIds.length ? activeSeatIds : [0, 1];
    const meObj = myProfile && typeof myProfile === 'object' ? myProfile : {};
    const myUid = String(myUidRaw || meObj.uid || o.myUid || 'local_me').trim();
    const myName = String(meObj.name || 'You').trim() || 'You';
    const myAvatar = String(meObj.avatar || 'av_b1');
    const pool = Array.isArray(defaultBotPool) && defaultBotPool.length
      ? defaultBotPool
      : [
          { uid: 'bot_1', name: 'Aria Bot', avatar: 'av_g2', gender: '♀' },
          { uid: 'bot_2', name: 'Rohan Bot', avatar: 'av_b3', gender: '♂' },
          { uid: 'bot_3', name: 'Zara Bot', avatar: 'av_g3', gender: '♀' }
        ];

    const auth = resolveMatchAuthority(o, myUid);
    const rawRoster = Array.isArray(o.seatRoster) ? o.seatRoster.filter(Boolean) : [];
    const seats = [];

    if (auth.isLiveOnline || rawRoster.length > 0) {
      // Build directly from authoritative lobby roster (zero silent bot hijacks!)
      const occupied = rawRoster.filter(s => s && s.kind !== 'empty' && (s.uid || s.name));
      const seatByNumber = new Map();
      occupied.forEach((s, idx) => {
        const mappedSeat = Number.isFinite(Number(s.seat)) && seatsIds.includes(Number(s.seat))
          ? Number(s.seat)
          : seatsIds[idx];
        if (mappedSeat !== undefined && !seatByNumber.has(mappedSeat)) {
          seatByNumber.set(mappedSeat, s);
        }
      });

      // If no seatRoster passed (e.g. direct 1v1 invite with rival), construct deterministic 2-seat table
      if (seatByNumber.size === 0) {
        const remote = auth.remoteHumans[0] || o.rival;
        const firstSeat = seatsIds[0];
        const secondSeat = seatsIds[1] !== undefined ? seatsIds[1] : 1;
        if (auth.isHost) {
          seatByNumber.set(firstSeat, { seat: firstSeat, uid: myUid, name: myName, avatar: myAvatar, kind: 'host', isBot: false });
          if (remote) {
            seatByNumber.set(secondSeat, { seat: secondSeat, uid: remote.uid, name: remote.name, avatar: remote.avatar || 'av_g2', kind: 'joined', isBot: false });
          }
        } else {
          if (remote) {
            seatByNumber.set(firstSeat, { seat: firstSeat, uid: remote.uid, name: remote.name, avatar: remote.avatar || 'av_b1', kind: 'host', isBot: false });
          }
          seatByNumber.set(secondSeat, { seat: secondSeat, uid: myUid, name: myName, avatar: myAvatar, kind: 'joined', isBot: false });
        }
      }

      seatsIds.forEach((seatNum) => {
        const entry = seatByNumber.get(seatNum);
        if (!entry) return; // Empty seats stay excluded—NEVER auto-filled with bots in live rooms!
        const explicitBot = String(entry.kind || '').toLowerCase() === 'bot' && isBotIdentity(entry);
        seats.push({
          seat: seatNum,
          uid: String(entry.uid || (explicitBot ? `bot_${seatNum}` : `player_${seatNum}`)),
          name: String(entry.name || `Player ${seatNum + 1}`),
          avatar: String(entry.avatar || 'av_b1'),
          gender: entry.gender || '♂',
          kind: explicitBot ? 'bot' : (String(entry.kind || '').toLowerCase() === 'host' ? 'host' : 'joined'),
          isBot: explicitBot,
          isRealHuman: !explicitBot
        });
      });
    } else {
      // Explicit Practice / Bot Mode (zero remote real players)
      seatsIds.forEach((seatNum, idx) => {
        if (idx === 0) {
          seats.push({
            seat: seatNum,
            uid: myUid,
            name: myName,
            avatar: myAvatar,
            gender: '♂',
            kind: 'host',
            isBot: Boolean(auth.isSpectating),
            isRealHuman: !auth.isSpectating
          });
        } else {
          const b = pool[(idx - 1) % pool.length];
          seats.push({
            seat: seatNum,
            uid: b.uid || `bot_${seatNum}`,
            name: b.name || `Bot ${idx}`,
            avatar: b.avatar || 'av_g2',
            gender: b.gender || '♀',
            kind: 'bot',
            isBot: true,
            isRealHuman: false
          });
        }
      });
    }

    const mySeatIdx = Math.max(0, seats.findIndex(s => s.uid === myUid));
    const mySeatObj = seats[mySeatIdx] || seats[0] || null;
    const isHost = seats[0] ? seats[0].uid === myUid : auth.isHost;

    return {
      ...auth,
      isHost,
      seats,
      mySeatIdx,
      mySeatId: mySeatObj ? mySeatObj.seat : seatsIds[0],
      hasHumanOpponents: seats.some(s => s.isRealHuman && s.uid !== myUid),
      canLocalActForSeat: (seatObj) => {
        if (!seatObj || auth.isSpectating) return false;
        if (seatObj.isBot) return false;
        if (auth.isLiveOnline) return String(seatObj.uid) === myUid;
        return String(seatObj.uid) === myUid;
      },
      shouldRunBotForSeat: (seatObj) => {
        if (!seatObj) return false;
        if (!seatObj.isBot) return false; // HARD BLOCK: Never run bot AI on any human seat!
        if (seatObj.isRealHuman) return false;
        if (auth.isLiveOnline) {
          // Only room Host drives explicit +Add Bot seats in mixed 4P lobbies
          return isHost && seatObj.kind === 'bot' && isBotIdentity(seatObj);
        }
        return !auth.isLocalPassAndPlay;
      }
    };
  }

  function evaluateConnectionState(params) {
    const p = params || {};
    const now = Number(p.nowMs || Date.now());
    const staleMs = Number(p.staleMs || 24000);
    const roomStatus = String(p.roomStatus || 'playing').toLowerCase();

    if (p.online === false) {
      return {
        status: 'offline',
        healthy: false,
        title: 'Connection Lost',
        detail: 'You are offline. Waiting to reconnect to live match…',
        showRejoin: true
      };
    }

    if (p.snapshotError) {
      return {
        status: 'reconnecting',
        healthy: false,
        title: 'Sync Interrupted',
        detail: 'Reconnecting to live match room — bot takeover is disabled.',
        showRejoin: true
      };
    }

    if (roomStatus === 'closed' || roomStatus === 'abandoned') {
      return {
        status: 'room_closed',
        healthy: false,
        title: 'Match Room Closed',
        detail: 'The host or opponent closed this room. No bot will replace them.',
        showRejoin: false
      };
    }

    const oppUids = Array.isArray(p.oppUids) ? p.oppUids.filter(Boolean) : [];
    const presence = p.presence && typeof p.presence === 'object' ? p.presence : {};
    if (oppUids.length > 0 && Object.keys(presence).length > 0) {
      for (let i = 0; i < oppUids.length; i++) {
        const ou = oppUids[i];
        const info = presence[ou];
        if (!info) continue;
        if (info.connected === false) {
          const nm = info.name || 'Opponent';
          return {
            status: 'opponent_left',
            healthy: false,
            title: `${nm} Disconnected`,
            detail: `Waiting for ${nm} to rejoin the room (bot takeover disabled).`,
            showRejoin: true
          };
        }
        const ts = Number(info.ts || 0);
        if (ts > 0 && now - ts > staleMs) {
          const nm = info.name || 'Opponent';
          return {
            status: 'opponent_reconnecting',
            healthy: false,
            title: `${nm} Reconnecting…`,
            detail: `Network lag detected for ${nm}. Holding turn until they reconnect.`,
            showRejoin: true
          };
        }
      }
    }

    return {
      status: 'connected',
      healthy: true,
      title: 'Live PvP Connected',
      detail: '',
      showRejoin: false
    };
  }

  const api = {
    isBotIdentity,
    isRealHumanSeat,
    normalizeModeType,
    resolveMatchAuthority,
    resolve2PControl,
    canActOn2PTurn,
    shouldRun2PBot,
    resolveMultiSeatRoster,
    evaluateConnectionState
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  if (global) {
    global.PvpSyncRules = api;
  }
})(typeof window !== 'undefined' ? window : globalThis);
