"use strict";
/* =====================================================================
   PARTY ROOM EXTRAS — PURE RULES ENGINE (v44)
   · 100% pure functions (zero DOM / Firestore side effects)
   · Shared by browser (window.PartyRoomExtrasRules) & Node unit tests
   · Covers:
     1. Full Room Settings, Chat/Photo/RedPacket Bans, Blocklist & Operation Log
     2. Seat Tap Action Sheet permissions (Sit, Close Seat, Mute, Invite, Cancel)
     3. Daily Task Treasure Boxes (Timers, VIP Box, Quick Tasks, Claims)
     4. Create PvP / PK Mode (1V1, Multiplayer, Fun Clash, Gifts/Votes,
        Mic Outfit Tiers, Freeze & 2x Bonus Time, Rules)
     5. "Who's the Winner?" Room Mini-Game (Entrance Gift, Pot, Elimination, Rules)
   ===================================================================== */
(function (global) {
  const ROOM_REGIONS = ['India', 'Global', 'South Asia', 'Middle East', 'Europe', 'Americas'];

  const PK_MODES = [
    { id: '1v1', name: '1V1 PK', icon: '⚔️', desc: 'Red vs Blue duel between two spotlight sides.' },
    { id: 'multiplayer', name: 'Multiplayer PK', icon: '🔥', desc: 'All active mic seats compete on a live leaderboard.' },
    { id: 'fun_clash', name: 'Fun Clash', icon: '🎭', desc: 'Fast party battle with fun dare rewards & Bonus Time.' }
  ];

  const PK_SCORING = [
    { id: 'gifts', name: 'Based on gifts', icon: '🎁', desc: 'Every coin spent on room gifts adds PK points.' },
    { id: 'votes', name: 'Based on votes', icon: '🗳️', desc: 'Room members cast free live votes every 15 seconds.' }
  ];

  const PK_DURATIONS = [3, 5, 10, 15, 30, 60];

  const PK_MIC_OUTFIT_TIERS = [
    { id: 'none', name: 'Standard Mic', minScore: 0, badge: '', color: '#94a3b8' },
    { id: 'bronze', name: 'Bronze Spark', minScore: 100, badge: '🥉 Spark', color: '#f59e0b' },
    { id: 'silver', name: 'Silver Halo', minScore: 500, badge: '🥈 Halo', color: '#cbd5e1' },
    { id: 'gold', name: 'Gold Crown', minScore: 1500, badge: '👑 Gold', color: '#fbbf24' },
    { id: 'mythic', name: 'Mythic Aura', minScore: 5000, badge: '💎 Mythic', color: '#a855f7' }
  ];

  const PK_RULES_SECTIONS = [
    {
      title: '1. PK Modes (1V1 · Multiplayer · Fun Clash)',
      body: '1V1 pits Red Team (Seats 0, 2, 4, 6) against Blue Team (Seats 1, 3, 5, 7). Multiplayer PK tracks individual scores for every active seat. Fun Clash runs fast party rounds with loser dare prompts.'
    },
    {
      title: '2. Gift-Based & Vote-Based Scoring',
      body: 'In Gift mode, 1 gift coin = 10 PK points toward the recipient side or seat. In Vote mode, every room member can cast a free +10 vote every 15 seconds.'
    },
    {
      title: '3. Mic Outfit Tiers',
      body: 'Hitting 100, 500, 1,500, and 5,000 PK points unlocks Bronze Spark, Silver Halo, Gold Crown, and Mythic Aura frames right on the active mic seats.'
    },
    {
      title: '4. Bonus Time (2×) & Freeze Card',
      body: 'The final 60 seconds of every PK automatically activate 2× Bonus Time where all gifts and votes count double. Each side can trigger one 15-second Freeze during a match to temporarily pause opponent scoring.'
    }
  ];

  const DAILY_BOX_DEFS = [
    { id: 'box_1', label: 'Starter Box', icon: '🎁', unlockSec: 0, coins: 30, xp: 15, vipOnly: false },
    { id: 'box_2', label: 'Stay 5 Min', icon: '🧰', unlockSec: 300, coins: 60, xp: 25, vipOnly: false },
    { id: 'box_3', label: 'Stay 15 Min', icon: '💎', unlockSec: 900, coins: 120, xp: 45, vipOnly: false },
    { id: 'box_vip', label: 'VIP Royal Box', icon: '👑', unlockSec: 0, coins: 250, xp: 80, vipOnly: true }
  ];

  const DAILY_QUICK_TASKS = [
    { id: 'task_follow', label: 'Follow this room', icon: '❤️', coins: 25, xp: 15, target: 1 },
    { id: 'task_msg', label: 'Send a chat message', icon: '💬', coins: 15, xp: 10, target: 1 },
    { id: 'task_gift', label: 'Send any room gift', icon: '🎁', coins: 40, xp: 25, target: 1 }
  ];

  const WTW_ENTRANCE_OPTIONS = [
    { id: 'wtw_rose', name: 'Rose Entry', icon: '🌹', cost: 20, accent: '#f43f5e' },
    { id: 'wtw_diamond', name: 'Diamond Entry', icon: '💎', cost: 50, accent: '#38bdf8' },
    { id: 'wtw_crown', name: 'Crown Entry', icon: '👑', cost: 100, accent: '#fbbf24' },
    { id: 'wtw_rocket', name: 'Rocket Entry', icon: '🚀', cost: 250, accent: '#a855f7' }
  ];

  const WTW_RULES_SECTIONS = [
    {
      title: '1. Choose Entrance Gift & Build the Pot',
      body: 'Pick an entrance tier (20, 50, 100, or 250 coins). Every participant contributes the entrance fee into one shared Winner Pot.'
    },
    {
      title: '2. Round-by-Round Elimination',
      body: 'Once START is tapped, the arena runs fast elimination rounds. Each round eliminates half of the remaining contenders until only one champion survives.'
    },
    {
      title: '3. Winner Takes the Pot',
      body: 'The last surviving player wins the entire Winner Pot in coins, receives a room-wide announcement, and boosts Room XP by +30.'
    }
  ];

  function getPRR() {
    if (global && global.PartyRoomRules) return global.PartyRoomRules;
    if (typeof require === 'function') {
      try { return require('./party-room-rules.js'); } catch {}
    }
    return null;
  }

  function cleanStr(v) {
    return String(v == null ? '' : v).trim();
  }

  function getDayKey(nowMs) {
    const d = new Date(Number(nowMs || Date.now()));
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  /* ===== 1. Room Settings, Bans, Blocklist & Operation Record ===== */
  function normalizeRoomSettings(rm) {
    const src = rm && typeof rm === 'object' ? rm : {};
    const volRaw = Number(src.volume);
    const volume = Number.isFinite(volRaw) ? Math.max(0, Math.min(100, Math.round(volRaw))) : 75;
    const blocklist = Array.isArray(src.blocklist)
      ? src.blocklist
          .filter((b) => b && b.uid)
          .map((b) => ({
            uid: cleanStr(b.uid),
            name: cleanStr(b.name) || 'Player',
            blockedBy: cleanStr(b.blockedBy) || '',
            ts: Number(b.ts || 0)
          }))
          .slice(-100)
      : [];
    const operationLog = Array.isArray(src.operationLog)
      ? src.operationLog
          .filter((op) => op && op.action)
          .slice(-40)
      : [];
    return {
      partnerSeat: Boolean(src.partnerSeat),
      banTextChat: Boolean(src.banTextChat),
      banPhotoChat: Boolean(src.banPhotoChat),
      banRedPacket: Boolean(src.banRedPacket),
      giftSoundsOn: src.giftSoundsOn !== false,
      rallyReceiveOn: src.rallyReceiveOn !== false,
      region: ROOM_REGIONS.includes(src.region) ? src.region : 'India',
      volume,
      blocklist,
      operationLog
    };
  }

  function appendOperationRecord(rm, actorUid, actorName, action, detail, nowMs) {
    const now = Number(nowMs || Date.now());
    const prev = Array.isArray(rm && rm.operationLog) ? rm.operationLog : [];
    const entry = {
      id: 'op_' + now.toString(36) + '_' + Math.random().toString(36).slice(2, 5),
      actorUid: cleanStr(actorUid),
      actorName: cleanStr(actorName) || 'Owner',
      action: cleanStr(action) || 'Update',
      detail: cleanStr(detail),
      ts: now
    };
    return [...prev, entry].slice(-40);
  }

  function canSendRoomMessage(rm, actorUid, msgKind) {
    if (!rm || !actorUid) return { allowed: false, reason: 'Room not ready' };
    const prr = getPRR();
    const isMod = prr
      ? (prr.isRoomOwner(rm, actorUid) || prr.isRoomAdminOnly(rm, actorUid))
      : String(rm.activeHostUid || rm.hostUid) === String(actorUid);

    if (!isMod && Array.isArray(rm.blocklist) && rm.blocklist.some((b) => b && b.uid === actorUid)) {
      return { allowed: false, reason: 'You are on this room\'s blocklist' };
    }
    if (isMod) return { allowed: true, reason: '' };

    const kind = cleanStr(msgKind || 'text').toLowerCase();
    if (kind === 'text' && rm.banTextChat) {
      return { allowed: false, reason: 'Text chatting is currently muted by Room Owner / Admin' };
    }
    if (kind === 'photo' && rm.banPhotoChat) {
      return { allowed: false, reason: 'Photo chatting is disabled in this room' };
    }
    if (kind === 'red_packet' && rm.banRedPacket) {
      return { allowed: false, reason: 'Red Packets are disabled in this room' };
    }
    return { allowed: true, reason: '' };
  }

  function toggleBlocklistUser(rm, actorUid, actorName, targetUser, shouldBlock, nowMs) {
    const prr = getPRR();
    const perm = prr
      ? prr.canPerformRoomAction(rm, actorUid, 'kick_member')
      : { allowed: String(rm && (rm.activeHostUid || rm.hostUid)) === String(actorUid), reason: 'Only Room Owner or Admins can manage the blocklist' };
    if (!perm.allowed) {
      return { ok: false, error: perm.reason };
    }
    const tUid = cleanStr(targetUser && targetUser.uid);
    const tName = cleanStr(targetUser && targetUser.name) || 'Player';
    if (!tUid) return { ok: false, error: 'Invalid player' };
    if (prr && prr.isRoomOwner(rm, tUid)) {
      return { ok: false, error: 'Cannot block the Room Owner' };
    }
    const now = Number(nowMs || Date.now());
    const curList = normalizeRoomSettings(rm).blocklist;
    const curKicked = Array.isArray(rm.kickedUids) ? [...rm.kickedUids] : [];
    let nextBlocklist;
    let nextKicked;
    let opAction;
    if (shouldBlock) {
      nextBlocklist = curList.some((b) => b.uid === tUid)
        ? curList
        : [...curList, { uid: tUid, name: tName, blockedBy: cleanStr(actorName) || 'Admin', ts: now }].slice(-100);
      nextKicked = [...new Set([...curKicked, tUid])];
      opAction = 'Blocked Member';
    } else {
      nextBlocklist = curList.filter((b) => b.uid !== tUid);
      nextKicked = curKicked.filter((u) => u !== tUid);
      opAction = 'Unblocked Member';
    }
    const operationLog = appendOperationRecord(rm, actorUid, actorName, opAction, tName, now);
    return { ok: true, blocked: Boolean(shouldBlock), blocklist: nextBlocklist, kickedUids: nextKicked, operationLog };
  }

  /* ===== 2. Seat Tap Action Sheet Permissions ===== */
  function getSeatTapActions(rm, actorUid, seatIdx) {
    const idx = Number(seatIdx);
    const s = rm && rm.seats ? rm.seats[String(idx)] : null;
    const prr = getPRR();
    const amOwner = prr ? prr.isRoomOwner(rm, actorUid) : String(rm && (rm.activeHostUid || rm.hostUid)) === String(actorUid);
    const amAdmin = amOwner || (prr ? prr.isRoomAdminOnly(rm, actorUid) : false);
    const isLocked = Array.isArray(rm && rm.lockedSeats) && rm.lockedSeats.includes(idx);
    const actions = [];

    if (!s) {
      // Empty seat -> Sit, Close/Open Seat, Invite, Cancel
      const canSitHere = (idx !== 0 || amOwner) && (!isLocked || amAdmin);
      actions.push({
        id: 'sit',
        label: isLocked ? (amAdmin ? 'Sit (Unlock & Sit)' : 'Seat Locked') : 'Sit',
        icon: '💺',
        allowed: canSitHere,
        reason: idx === 0 && !amOwner ? 'Seat 0 is reserved for the Room Owner' : (isLocked ? 'This seat is locked by Owner / Admin' : '')
      });
      if (idx > 0) {
        actions.push({
          id: 'toggle_lock',
          label: isLocked ? 'Open Seat' : 'Close Seat',
          icon: isLocked ? '🔓' : '🔒',
          allowed: amAdmin,
          reason: 'Only Room Owner or Admins can close or open seats'
        });
      }
      actions.push({
        id: 'invite',
        label: 'Invite',
        icon: '👥',
        allowed: true,
        reason: ''
      });
      actions.push({ id: 'cancel', label: 'Cancel', icon: '✕', allowed: true, reason: '' });
      return { seatIdx: idx, occupied: false, isLocked, occupant: null, actions };
    }

    const isMe = s.uid === actorUid;
    const targetIsOwner = prr ? prr.isRoomOwner(rm, s.uid) : false;
    const targetIsAdmin = !targetIsOwner && (prr ? prr.isRoomAdminOnly(rm, s.uid) : false);

    if (isMe) {
      actions.push({ id: 'leave_seat', label: 'Leave Seat', icon: '🚪', allowed: true, reason: '' });
      actions.push({
        id: 'toggle_mute',
        label: s.muted ? 'Unmute' : 'Mute',
        icon: s.muted ? '🎙️' : '🔇',
        allowed: idx >= 0 && idx < 4,
        reason: 'Listener seats cannot unmute mic'
      });
    } else {
      actions.push({
        id: 'toggle_mute',
        label: s.muted ? 'Unmute' : 'Mute',
        icon: s.muted ? '🎙️' : '🔇',
        allowed: amAdmin && !targetIsOwner,
        reason: targetIsOwner ? 'Cannot mute the Room Owner' : 'Only Room Owner or Admins can mute members'
      });
      actions.push({ id: 'gift', label: 'Send Gift', icon: '🎁', allowed: true, reason: '' });
      if (amOwner && !targetIsOwner) {
        actions.push({
          id: 'toggle_admin',
          label: targetIsAdmin ? 'Remove Admin' : 'Make Admin',
          icon: '🛡️',
          allowed: true,
          reason: ''
        });
      }
      if (amAdmin && !targetIsOwner) {
        actions.push({ id: 'kick', label: 'Kick & Block', icon: '🚫', allowed: true, reason: '' });
      }
    }

    if (idx > 0) {
      actions.push({
        id: 'toggle_lock',
        label: isLocked ? 'Open Seat' : 'Close Seat',
        icon: isLocked ? '🔓' : '🔒',
        allowed: amAdmin,
        reason: 'Only Room Owner or Admins can close or open seats'
      });
    }
    actions.push({ id: 'invite', label: 'Invite', icon: '👥', allowed: true, reason: '' });
    actions.push({ id: 'cancel', label: 'Cancel', icon: '✕', allowed: true, reason: '' });

    return { seatIdx: idx, occupied: true, isLocked, occupant: s, actions };
  }

  /* ===== 3. Daily Task Treasure Boxes ===== */
  function createEmptyDailyState(nowMs) {
    return {
      dayKey: getDayKey(nowMs),
      staySec: 0,
      claimedBoxes: [],
      completedTasks: [],
      claimedTasks: []
    };
  }

  function normalizeDailyState(stored, nowMs) {
    const today = getDayKey(nowMs);
    if (!stored || typeof stored !== 'object' || stored.dayKey !== today) {
      return createEmptyDailyState(nowMs);
    }
    return {
      dayKey: today,
      staySec: Math.max(0, Math.floor(Number(stored.staySec || 0))),
      claimedBoxes: Array.isArray(stored.claimedBoxes) ? [...new Set(stored.claimedBoxes.map(String))] : [],
      completedTasks: Array.isArray(stored.completedTasks) ? [...new Set(stored.completedTasks.map(String))] : [],
      claimedTasks: Array.isArray(stored.claimedTasks) ? [...new Set(stored.claimedTasks.map(String))] : []
    };
  }

  function evaluateDailyTasks(stored, opts) {
    const o = opts || {};
    const now = Number(o.nowMs || Date.now());
    const st = normalizeDailyState(stored, now);
    const staySec = Math.max(st.staySec, Math.floor(Number(o.roomStaySec || 0)));
    const isVip = Boolean(o.isVip || st.completedTasks.length >= 2);

    const boxes = DAILY_BOX_DEFS.map((b) => {
      const claimed = st.claimedBoxes.includes(b.id);
      if (claimed) {
        return { ...b, status: 'claimed', remainingSec: 0 };
      }
      if (b.vipOnly) {
        return { ...b, status: isVip ? 'claimable' : 'locked_vip', remainingSec: 0 };
      }
      const rem = Math.max(0, b.unlockSec - staySec);
      return { ...b, status: rem === 0 ? 'claimable' : 'countdown', remainingSec: rem };
    });

    const tasks = DAILY_QUICK_TASKS.map((t) => {
      const claimed = st.claimedTasks.includes(t.id);
      const done = claimed || st.completedTasks.includes(t.id);
      return { ...t, done, claimed, status: claimed ? 'claimed' : (done ? 'claimable' : 'pending') };
    });

    const claimableCount = boxes.filter((b) => b.status === 'claimable').length + tasks.filter((t) => t.status === 'claimable').length;
    return { state: { ...st, staySec }, boxes, tasks, isVip, claimableCount };
  }

  function markDailyQuickTaskDone(stored, taskId, nowMs) {
    const st = normalizeDailyState(stored, nowMs);
    if (!DAILY_QUICK_TASKS.some((t) => t.id === taskId)) return st;
    if (!st.completedTasks.includes(taskId)) {
      st.completedTasks = [...st.completedTasks, taskId];
    }
    return st;
  }

  function claimDailyTaskBox(stored, boxId, opts) {
    const evalRes = evaluateDailyTasks(stored, opts);
    const box = evalRes.boxes.find((b) => b.id === boxId);
    if (!box) return { ok: false, error: 'Treasure box not found', state: evalRes.state };
    if (box.status === 'claimed') return { ok: false, error: 'Already claimed today', state: evalRes.state };
    if (box.status === 'locked_vip') return { ok: false, error: 'Complete 2 quick tasks or own/guard a room to unlock VIP Box', state: evalRes.state };
    if (box.status === 'countdown') return { ok: false, error: `Available in ${Math.ceil(box.remainingSec / 60)}m`, state: evalRes.state };

    const nextState = {
      ...evalRes.state,
      claimedBoxes: [...evalRes.state.claimedBoxes, box.id]
    };
    return { ok: true, coins: box.coins, xp: box.xp, box, state: nextState };
  }

  function claimDailyQuickTask(stored, taskId, opts) {
    const evalRes = evaluateDailyTasks(stored, opts);
    const task = evalRes.tasks.find((t) => t.id === taskId);
    if (!task) return { ok: false, error: 'Task not found', state: evalRes.state };
    if (task.status === 'claimed') return { ok: false, error: 'Already claimed today', state: evalRes.state };
    if (task.status !== 'claimable') return { ok: false, error: 'Complete the task in this room first', state: evalRes.state };

    const nextState = {
      ...evalRes.state,
      completedTasks: [...new Set([...evalRes.state.completedTasks, task.id])],
      claimedTasks: [...evalRes.state.claimedTasks, task.id]
    };
    return { ok: true, coins: task.coins, xp: task.xp, task, state: nextState };
  }

  /* ===== 4. Create PvP / PK Mode ===== */
  function getMicOutfitTier(score) {
    const s = Math.max(0, Number(score || 0));
    let best = PK_MIC_OUTFIT_TIERS[0];
    for (let i = 0; i < PK_MIC_OUTFIT_TIERS.length; i++) {
      if (s >= PK_MIC_OUTFIT_TIERS[i].minScore) best = PK_MIC_OUTFIT_TIERS[i];
    }
    return best;
  }

  function createRoomPkSession(rm, actorUid, opts, nowMs) {
    const prr = getPRR();
    const perm = prr
      ? prr.canPerformRoomAction(rm, actorUid, 'change_mode')
      : { allowed: String(rm && (rm.activeHostUid || rm.hostUid)) === String(actorUid), reason: 'Only Room Owner or Admins can start PK' };
    if (!perm.allowed) {
      return { ok: false, error: perm.reason };
    }
    const o = opts || {};
    const now = Number(nowMs || Date.now());
    const mode = PK_MODES.some((m) => m.id === o.mode) ? o.mode : '1v1';
    const scoring = PK_SCORING.some((s) => s.id === o.scoring) ? o.scoring : 'gifts';
    const durationMin = PK_DURATIONS.includes(Number(o.durationMin)) ? Number(o.durationMin) : 5;
    const durationMs = durationMin * 60 * 1000;
    const endsAt = now + durationMs;
    const bonusStartAt = endsAt - Math.min(60000, Math.floor(durationMs * 0.25));

    const seatScores = {};
    const seats = (rm && rm.seats) || {};
    Object.keys(seats).forEach((k) => {
      const occ = seats[k];
      if (occ && occ.uid) {
        seatScores[occ.uid] = { uid: occ.uid, name: occ.name || 'Player', seatIdx: Number(k), score: 0 };
      }
    });

    const pk = {
      id: 'pk_' + now.toString(36),
      status: 'active',
      mode,
      scoring,
      durationMin,
      title: cleanStr(o.title) || (mode === '1v1' ? 'Red vs Blue 1V1 PK' : (mode === 'fun_clash' ? 'Fun Clash Party PK' : 'Multiplayer Seat PK')),
      startedBy: cleanStr(actorUid),
      startedAt: now,
      endsAt,
      bonusStartAt,
      redScore: 0,
      blueScore: 0,
      seatScores,
      freezeTarget: '',
      freezeUntil: 0,
      freezeUsedBy: {},
      lastVoteByUid: {},
      winner: ''
    };
    return { ok: true, pk };
  }

  function evaluatePkTimerState(pk, nowMs) {
    if (!pk || pk.status !== 'active') {
      return { active: false, ended: Boolean(pk && pk.status === 'finished'), inBonusTime: false, freezeActive: false, remainingSec: 0 };
    }
    const now = Number(nowMs || Date.now());
    const remMs = Math.max(0, Number(pk.endsAt || 0) - now);
    const ended = remMs <= 0;
    const inBonusTime = !ended && now >= Number(pk.bonusStartAt || pk.endsAt);
    const freezeActive = !ended && Boolean(pk.freezeTarget) && Number(pk.freezeUntil || 0) > now;
    return {
      active: !ended,
      ended,
      inBonusTime,
      freezeActive,
      freezeTarget: freezeActive ? pk.freezeTarget : '',
      remainingSec: Math.ceil(remMs / 1000)
    };
  }

  function triggerPkFreeze(pk, actorSide, nowMs) {
    if (!pk || pk.status !== 'active') return { ok: false, error: 'No active PK session' };
    const now = Number(nowMs || Date.now());
    const side = actorSide === 'blue' ? 'blue' : 'red';
    const used = pk.freezeUsedBy || {};
    if (used[side]) return { ok: false, error: `${side === 'red' ? 'Red' : 'Blue'} side already used Freeze!` };
    const targetSide = side === 'red' ? 'blue' : 'red';
    return {
      ok: true,
      pk: {
        ...pk,
        freezeTarget: targetSide,
        freezeUntil: now + 15000,
        freezeUsedBy: { ...used, [side]: true }
      }
    };
  }

  function recordPkContribution(pk, params) {
    if (!pk || pk.status !== 'active') return { ok: false, error: 'No active PK session' };
    const p = params || {};
    const now = Number(p.nowMs || Date.now());
    const timer = evaluatePkTimerState(pk, now);
    if (timer.ended) return { ok: false, error: 'PK timer has already finished' };

    const kind = p.kind === 'vote' ? 'vote' : 'gift';
    if (pk.scoring === 'votes' && kind === 'vote') {
      const voterUid = cleanStr(p.actorUid);
      const lastVote = Number((pk.lastVoteByUid && pk.lastVoteByUid[voterUid]) || 0);
      if (voterUid && now - lastVote < 15000) {
        const waitSec = Math.ceil((15000 - (now - lastVote)) / 1000);
        return { ok: false, error: `Next free vote ready in ${waitSec}s` };
      }
    }

    const side = p.side === 'blue' ? 'blue' : 'red';
    if (timer.freezeActive && timer.freezeTarget === side) {
      return { ok: false, error: `❄️ ${side === 'red' ? 'Red' : 'Blue'} side is FROZEN for ${Math.ceil((pk.freezeUntil - now) / 1000)}s!` };
    }

    const basePts = Math.max(1, Math.round(Number(p.points || (kind === 'vote' ? 10 : 50))));
    const multiplier = timer.inBonusTime ? 2 : 1;
    const added = basePts * multiplier;

    const next = {
      ...pk,
      redScore: Number(pk.redScore || 0) + (side === 'red' ? added : 0),
      blueScore: Number(pk.blueScore || 0) + (side === 'blue' ? added : 0),
      seatScores: { ...(pk.seatScores || {}) },
      lastVoteByUid: { ...(pk.lastVoteByUid || {}) }
    };

    if (kind === 'vote' && p.actorUid) {
      next.lastVoteByUid[cleanStr(p.actorUid)] = now;
    }

    const targetUid = cleanStr(p.targetUid);
    if (targetUid) {
      const prev = next.seatScores[targetUid] || { uid: targetUid, name: cleanStr(p.targetName) || 'Player', seatIdx: Number(p.seatIdx || 0), score: 0 };
      next.seatScores[targetUid] = { ...prev, score: Number(prev.score || 0) + added };
    }

    return { ok: true, added, multiplier, pk: next };
  }

  function finalizePkSession(pk) {
    if (!pk) return null;
    let winner = 'Draw';
    if (pk.mode === 'multiplayer') {
      const sorted = Object.values(pk.seatScores || {}).sort((a, b) => Number(b.score || 0) - Number(a.score || 0));
      winner = sorted.length && sorted[0].score > 0 ? sorted[0].name : 'Draw';
    } else {
      if (Number(pk.redScore || 0) > Number(pk.blueScore || 0)) winner = 'Red Team';
      else if (Number(pk.blueScore || 0) > Number(pk.redScore || 0)) winner = 'Blue Team';
    }
    return { ...pk, status: 'finished', winner };
  }

  /* ===== 5. "Who's the Winner?" Room Mini-Game ===== */
  function createWtwGame(entryId, participants, opts) {
    const entry = WTW_ENTRANCE_OPTIONS.find((e) => e.id === entryId) || WTW_ENTRANCE_OPTIONS[0];
    const cleanPlayers = (Array.isArray(participants) ? participants : [])
      .filter((p) => p && p.uid)
      .map((p) => ({ uid: cleanStr(p.uid), name: cleanStr(p.name) || 'Player', avatar: cleanStr(p.avatar) || 'av_b1', eliminated: false }));

    const unique = [];
    const seen = new Set();
    cleanPlayers.forEach((p) => {
      if (!seen.has(p.uid)) {
        seen.add(p.uid);
        unique.push(p);
      }
    });

    if (unique.length < 2) {
      return { ok: false, error: 'Need at least 2 players to start Who\'s the Winner?' };
    }

    const o = opts || {};
    const myBalance = o.myCoins != null ? Number(o.myCoins) : Infinity;
    if (Number.isFinite(myBalance) && myBalance < entry.cost) {
      return { ok: false, error: `Need ${entry.cost} coins for ${entry.name}` };
    }

    const pot = unique.length * entry.cost;
    return {
      ok: true,
      game: {
        id: 'wtw_' + Date.now().toString(36),
        status: 'running',
        entry,
        round: 0,
        pot,
        players: unique,
        roundsLog: [],
        winner: null
      }
    };
  }

  function advanceWtwRound(game, rngFn) {
    if (!game || game.status !== 'running') {
      return { ok: false, error: 'Game is not running', game };
    }
    const rng = typeof rngFn === 'function' ? rngFn : Math.random;
    const alive = game.players.filter((p) => !p.eliminated);
    if (alive.length <= 1) {
      const winner = alive[0] || game.players[0] || null;
      return {
        ok: true,
        finished: true,
        eliminated: [],
        winner,
        game: { ...game, status: 'finished', winner }
      };
    }

    // Shuffle alive contenders deterministically via rng
    const shuffled = alive.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      const tmp = shuffled[i];
      shuffled[i] = shuffled[j];
      shuffled[j] = tmp;
    }

    const elimCount = Math.max(1, Math.floor(alive.length / 2));
    const eliminated = shuffled.slice(0, elimCount);
    const elimSet = new Set(eliminated.map((p) => p.uid));
    const nextPlayers = game.players.map((p) => (elimSet.has(p.uid) ? { ...p, eliminated: true } : { ...p }));
    const survivors = nextPlayers.filter((p) => !p.eliminated);
    const nextRound = Number(game.round || 0) + 1;
    const finished = survivors.length <= 1;
    const winner = finished ? (survivors[0] || null) : null;

    const roundEntry = {
      round: nextRound,
      eliminatedNames: eliminated.map((e) => e.name),
      survivorCount: survivors.length,
      winnerName: winner ? winner.name : ''
    };

    return {
      ok: true,
      finished,
      eliminated,
      survivors,
      winner,
      game: {
        ...game,
        round: nextRound,
        status: finished ? 'finished' : 'running',
        players: nextPlayers,
        winner,
        roundsLog: [...(game.roundsLog || []), roundEntry]
      }
    };
  }

  const api = {
    ROOM_REGIONS,
    PK_MODES,
    PK_SCORING,
    PK_DURATIONS,
    PK_MIC_OUTFIT_TIERS,
    PK_RULES_SECTIONS,
    DAILY_BOX_DEFS,
    DAILY_QUICK_TASKS,
    WTW_ENTRANCE_OPTIONS,
    WTW_RULES_SECTIONS,
    getDayKey,
    normalizeRoomSettings,
    appendOperationRecord,
    canSendRoomMessage,
    toggleBlocklistUser,
    getSeatTapActions,
    createEmptyDailyState,
    normalizeDailyState,
    evaluateDailyTasks,
    markDailyQuickTaskDone,
    claimDailyTaskBox,
    claimDailyQuickTask,
    getMicOutfitTier,
    createRoomPkSession,
    evaluatePkTimerState,
    triggerPkFreeze,
    recordPkContribution,
    finalizePkSession,
    createWtwGame,
    advanceWtwRound
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  if (global) {
    global.PartyRoomExtrasRules = api;
  }
})(typeof window !== 'undefined' ? window : globalThis);
