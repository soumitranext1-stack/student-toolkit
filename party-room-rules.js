"use strict";
/* =====================================================================
   PARTY / VR ROOM LIFECYCLE, HOST TRANSFER, YOUTUBE AD-SYNC & CHAT RULES
   · 100% pure functions (zero DOM / Firestore side effects)
   · Shared by browser (window.PartyRoomRules) & Node unit tests
   · Seat-ordered automatic host handoff when current owner leaves/drops
   · Auto-leave + ghost-seat eviction + empty room auto-close
   · YouTube Watch-Together ad / buffering detection & live clock snap
   · Race-free VR chat & emoji reaction merge + deduplication
   ===================================================================== */
(function (global) {
  const DEFAULT_STALE_MS = 28000;
  const BOT_UID_RE = /^(bot_|demo_|fake_)/i;

  function isBotOrSeedUid(uid) {
    return BOT_UID_RE.test(String(uid || '').trim());
  }

  function normalizeMemberEntry(raw, fallbackSeatIdx) {
    if (!raw || typeof raw !== 'object') return null;
    const uid = String(raw.uid || '').trim();
    if (!uid) return null;
    const seatNum = raw.seatIdx != null && Number.isFinite(Number(raw.seatIdx))
      ? Number(raw.seatIdx)
      : (fallbackSeatIdx != null && Number.isFinite(Number(fallbackSeatIdx)) ? Number(fallbackSeatIdx) : null);
    return {
      uid,
      name: String(raw.name || 'Player').trim() || 'Player',
      avatar: String(raw.avatar || 'av_b1'),
      frame: String(raw.frame || 'none'),
      seatIdx: seatNum,
      joinedAt: Number(raw.joinedAt || raw.lastSeen || 0),
      lastSeen: Number(raw.lastSeen || raw.joinedAt || 0),
      connected: raw.connected !== false
    };
  }

  function normalizeMembersMap(room, nowMs) {
    const now = Number(nowMs || Date.now());
    const map = {};
    const rawMembers = room && room.members && typeof room.members === 'object' ? room.members : {};
    Object.keys(rawMembers).forEach((k) => {
      const entry = normalizeMemberEntry(rawMembers[k], null);
      if (entry) {
        if (!entry.lastSeen) entry.lastSeen = now;
        if (!entry.joinedAt) entry.joinedAt = entry.lastSeen;
        map[entry.uid] = entry;
      }
    });

    const rawSeats = room && room.seats && typeof room.seats === 'object' ? room.seats : {};
    Object.keys(rawSeats)
      .sort((a, b) => Number(a) - Number(b))
      .forEach((seatKey) => {
        const occ = rawSeats[seatKey];
        if (!occ || !occ.uid) return;
        const u = String(occ.uid).trim();
        const seatIdx = Number(seatKey);
        const existing = map[u];
        const joinedAt = Number(occ.joinedAt || (existing && existing.joinedAt) || now);
        const seatSeen = Number(occ.lastSeen || 0);
        const memberSeen = Number((existing && existing.lastSeen) || 0);
        const lastSeen = (seatSeen > 0 || memberSeen > 0)
          ? Math.max(seatSeen, memberSeen)
          : (joinedAt || now);
        map[u] = {
          uid: u,
          name: String(occ.name || (existing && existing.name) || 'Player').trim() || 'Player',
          avatar: String(occ.avatar || (existing && existing.avatar) || 'av_b1'),
          frame: String(occ.frame || (existing && existing.frame) || 'none'),
          seatIdx: Number.isFinite(seatIdx) ? seatIdx : null,
          joinedAt,
          lastSeen,
          connected: existing ? existing.connected !== false : occ.connected !== false
        };
      });

    return map;
  }

  function isMemberActive(member, nowMs, staleMs, roomIsSeed) {
    if (!member || !member.uid) return false;
    if (member.connected === false) return false;
    if (roomIsSeed && isBotOrSeedUid(member.uid)) return true;
    const limit = Number(staleMs || DEFAULT_STALE_MS);
    const seen = Number(member.lastSeen || member.joinedAt || 0);
    if (seen > 0 && Number(nowMs || Date.now()) - seen > limit) return false;
    return true;
  }

  /**
   * Returns active room members strictly sorted by:
   * 1) Lowest occupied seatIndex (0, 1, 2, 3, ..., 8)
   * 2) Unseated listeners ordered by earliest joinedAt
   * 3) Deterministic uid tie-breaker
   */
  function getOrderedActiveMembers(room, nowMs, staleMs) {
    const now = Number(nowMs || Date.now());
    const limit = Number(staleMs || DEFAULT_STALE_MS);
    const roomIsSeed = Boolean(room && (room.isSeed || String(room.id || '').startsWith('pr_seed_')));
    const map = normalizeMembersMap(room, now);
    return Object.values(map)
      .filter((m) => isMemberActive(m, now, limit, roomIsSeed))
      .sort((a, b) => {
        const aSeated = a.seatIdx != null && Number.isFinite(a.seatIdx);
        const bSeated = b.seatIdx != null && Number.isFinite(b.seatIdx);
        if (aSeated && bSeated && a.seatIdx !== b.seatIdx) return a.seatIdx - b.seatIdx;
        if (aSeated !== bSeated) return aSeated ? -1 : 1;
        if (a.joinedAt !== b.joinedAt) return a.joinedAt - b.joinedAt;
        return String(a.uid).localeCompare(String(b.uid));
      });
  }

  /**
   * Pure room lifecycle reconciler:
   * - Evicts leavingUid and any timed-out / disconnected ghost seats
   * - Transfers hostUid/hostName to the next lowest-seat active player if current owner left/offline
   * - Promotes the new owner to Seat 0 (Owner Stage) if Seat 0 is vacant
   * - Auto-closes the room (`status = 'closed'`) when zero active players remain
   */
  function reconcileRoomLifecycle(room, opts) {
    if (!room || typeof room !== 'object') {
      return { changed: false, closed: true, hostTransferred: false, newHost: null, removedUids: [], room: null };
    }
    const o = opts || {};
    const now = Number(o.nowMs || Date.now());
    const staleMs = Number(o.staleMs || DEFAULT_STALE_MS);
    const leavingUid = o.leavingUid ? String(o.leavingUid).trim() : '';
    const isSeedRoom = Boolean(room.isSeed || String(room.id || '').startsWith('pr_seed_'));

    const membersMap = normalizeMembersMap(room, now);
    const removedUids = [];
    const nextSeats = {};
    const nextMembers = {};

    Object.values(membersMap).forEach((m) => {
      if (leavingUid && m.uid === leavingUid) {
        removedUids.push(m.uid);
        return;
      }
      if (!isMemberActive(m, now, staleMs, isSeedRoom)) {
        removedUids.push(m.uid);
        return;
      }
      nextMembers[m.uid] = { ...m };
    });

    const rawSeats = room.seats && typeof room.seats === 'object' ? room.seats : {};
    Object.keys(rawSeats)
      .sort((a, b) => Number(a) - Number(b))
      .forEach((seatKey) => {
        const occ = rawSeats[seatKey];
        if (!occ || !occ.uid) return;
        const u = String(occ.uid).trim();
        if (!nextMembers[u]) return;
        nextSeats[seatKey] = {
          ...occ,
          uid: u,
          lastSeen: nextMembers[u].lastSeen,
          connected: true
        };
        nextMembers[u].seatIdx = Number(seatKey);
      });

    const activeOrdered = Object.values(nextMembers).sort((a, b) => {
      const aSeated = a.seatIdx != null && Number.isFinite(a.seatIdx);
      const bSeated = b.seatIdx != null && Number.isFinite(b.seatIdx);
      if (aSeated && bSeated && a.seatIdx !== b.seatIdx) return a.seatIdx - b.seatIdx;
      if (aSeated !== bSeated) return aSeated ? -1 : 1;
      if (a.joinedAt !== b.joinedAt) return a.joinedAt - b.joinedAt;
      return String(a.uid).localeCompare(String(b.uid));
    });

    const nextRoom = {
      ...room,
      creatorUid: String(room.creatorUid || room.hostUid || '').trim(),
      seats: nextSeats,
      members: nextMembers,
      admins: Array.isArray(room.admins) ? room.admins.filter((a) => Boolean(nextMembers[a])) : [],
      chat: Array.isArray(room.chat) ? [...room.chat] : []
    };

    // Empty room -> automatically mark closed so dead rooms never linger
    if (activeOrdered.length === 0 && !isSeedRoom) {
      nextRoom.status = 'closed';
      nextRoom.closedAt = now;
      nextRoom.expiresAt = now;
      nextRoom.updatedAt = now;
      return {
        changed: true,
        closed: true,
        hostTransferred: false,
        newHost: null,
        removedUids,
        room: nextRoom
      };
    }

    let hostTransferred = false;
    let newHost = null;
    const prevHostUid = String(room.activeHostUid || room.hostUid || '').trim();
    const prevHostName = String(room.activeHostName || room.hostName || '').trim();
    const hostStillActive = Boolean(prevHostUid && nextMembers[prevHostUid]);

    if (!hostStillActive && activeOrdered.length > 0) {
      const candidate = activeOrdered[0];
      hostTransferred = true;
      newHost = candidate;
      nextRoom.hostUid = candidate.uid;
      nextRoom.hostName = candidate.name;
      nextRoom.activeHostUid = candidate.uid;
      nextRoom.activeHostName = candidate.name;
      nextRoom.admins = nextRoom.admins.filter((a) => a !== candidate.uid);

      // Promote new owner into Seat 0 (Owner Stage & Mic #1) if Seat 0 is empty
      if (!nextRoom.seats['0']) {
        const oldSeatKey = Object.keys(nextRoom.seats).find((k) => nextRoom.seats[k] && nextRoom.seats[k].uid === candidate.uid);
        const existingOcc = oldSeatKey != null ? nextRoom.seats[oldSeatKey] : null;
        if (oldSeatKey != null) delete nextRoom.seats[oldSeatKey];
        nextRoom.seats['0'] = {
          uid: candidate.uid,
          name: candidate.name,
          avatar: candidate.avatar || (existingOcc && existingOcc.avatar) || 'av_b1',
          frame: candidate.frame || (existingOcc && existingOcc.frame) || 'none',
          muted: existingOcc ? Boolean(existingOcc.muted) : false,
          speaking: existingOcc ? !existingOcc.muted : true,
          joinedAt: candidate.joinedAt || now,
          lastSeen: now,
          connected: true
        };
        nextRoom.members[candidate.uid].seatIdx = 0;
      }

      const prevLabel = prevHostName ? `${prevHostName} left — ` : '';
      nextRoom.chat = [
        ...nextRoom.chat,
        {
          id: 'host_' + now.toString(36) + '_' + candidate.uid.slice(0, 6),
          type: 'sys',
          text: `👑 ${prevLabel}${candidate.name} is now the Room Owner!`,
          ts: now
        }
      ].slice(-45);
    }

    const changed = removedUids.length > 0 || hostTransferred || nextRoom.status === 'closed';
    if (changed) nextRoom.updatedAt = now;

    return {
      changed,
      closed: nextRoom.status === 'closed',
      hostTransferred,
      newHost,
      removedUids,
      room: nextRoom
    };
  }

  /**
   * Pure YouTube Ad / Buffering / Drift detector for Watch-Together VR rooms.
   * Prevents viewers stuck in YouTube ads from corrupting room playback,
   * and triggers automatic snap-to-live-clock once the ad ends.
   */
  function detectYouTubeAdOrBuffer(params) {
    const p = params || {};
    const playerState = Number(p.playerState);
    const curVid = String(p.currentVideoId || '').trim();
    const expVid = String(p.expectedVideoId || '').trim();
    const localSec = Number(p.localSec || 0);
    const localDur = Number(p.localDur || 0);
    const expectedDur = Number(p.expectedDur || 0);
    const targetSec = Number(p.targetSec || 0);
    const seekFailedRecently = Boolean(p.seekFailedRecently);
    const driftSec = Math.round((targetSec - localSec) * 10) / 10;

    // 1) Explicit videoId mismatch inside YouTube iframe (classic YouTube ad signal)
    const videoIdMismatch = Boolean(curVid && expVid && curVid !== expVid);
    // 2) Short ad duration (<= 35s) while main video is known to be longer (> 45s)
    const shortAdDuration = Boolean(expectedDur > 45 && localDur > 0 && localDur <= 35 && Math.abs(localDur - expectedDur) > 20);
    // 3) Viewer tried to seek to targetSec (> 15s) during active play, but player stayed pinned near start with short duration
    const pinnedByAd = Boolean(seekFailedRecently && playerState === 1 && targetSec > 15 && localDur > 0 && localDur <= 65 && Math.abs(driftSec) > 6);

    if (videoIdMismatch || shortAdDuration || pinnedByAd) {
      return {
        status: 'ad',
        inAd: true,
        isBuffering: false,
        needsSnapAfterAd: true,
        driftSec
      };
    }

    if (playerState === 3) {
      return {
        status: 'buffering',
        inAd: false,
        isBuffering: true,
        needsSnapAfterAd: false,
        driftSec
      };
    }

    if (Math.abs(driftSec) > 2.2) {
      return {
        status: 'behind',
        inAd: false,
        isBuffering: false,
        needsSnapAfterAd: false,
        driftSec
      };
    }

    return {
      status: 'synced',
      inAd: false,
      isBuffering: false,
      needsSnapAfterAd: false,
      driftSec
    };
  }

  function summarizeViewerSyncIssues(viewerStates, myUid, nowMs, staleMs) {
    const now = Number(nowMs || Date.now());
    const limit = Number(staleMs || 18000);
    const map = viewerStates && typeof viewerStates === 'object' ? viewerStates : {};
    const inAd = [];
    const buffering = [];
    Object.values(map).forEach((entry) => {
      if (!entry || !entry.uid) return;
      if (now - Number(entry.ts || 0) > limit) return;
      const label = entry.uid === myUid ? 'You' : (entry.name || 'Viewer');
      if (entry.status === 'ad') inAd.push({ uid: entry.uid, name: label });
      else if (entry.status === 'buffering') buffering.push({ uid: entry.uid, name: label });
    });
    return { inAd, buffering, hasIssues: inAd.length > 0 || buffering.length > 0 };
  }

  /**
   * Race-free merger for VR room chat messages and emoji reactions.
   * Prevents concurrent Firestore updates or BroadcastChannel replays from dropping or duplicating events.
   */
  function mergeRoomChatMessages(sources, deletedIds, maxCount) {
    const delSet = new Set(Array.isArray(deletedIds) ? deletedIds : []);
    const byId = new Map();
    (Array.isArray(sources) ? sources : []).forEach((list) => {
      if (!Array.isArray(list)) return;
      list.forEach((m) => {
        if (!m || !m.id || delSet.has(m.id)) return;
        if (m.type === 'reaction') return; // Reactions are rendered in the reaction layer + optionally chat
        const prev = byId.get(m.id);
        if (!prev || Number(m.ts || 0) >= Number(prev.ts || 0)) {
          byId.set(m.id, m);
        }
      });
    });
    const sorted = Array.from(byId.values()).sort((a, b) => Number(a.ts || 0) - Number(b.ts || 0));
    const cap = Number(maxCount || 45);
    return sorted.slice(-cap);
  }

  function mergeRoomReactions(sources, maxCount) {
    const byId = new Map();
    (Array.isArray(sources) ? sources : []).forEach((list) => {
      if (!Array.isArray(list)) return;
      list.forEach((r) => {
        if (!r || !r.id || !r.emoji) return;
        if (!byId.has(r.id)) byId.set(r.id, r);
      });
    });
    const sorted = Array.from(byId.values()).sort((a, b) => Number(a.ts || 0) - Number(b.ts || 0));
    const cap = Number(maxCount || 24);
    return sorted.slice(-cap);
  }

  function shouldBlockGameLaunchForVr(params) {
    const p = params || {};
    if (p.bypassVrGuard) return false;
    return Boolean(p.activePartyRoomId || p.minimizedPartyRoomId);
  }

  const api = {
    DEFAULT_STALE_MS,
    isBotOrSeedUid,
    normalizeMembersMap,
    getOrderedActiveMembers,
    reconcileRoomLifecycle,
    detectYouTubeAdOrBuffer,
    summarizeViewerSyncIssues,
    mergeRoomChatMessages,
    mergeRoomReactions,
    shouldBlockGameLaunchForVr
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  if (global) {
    global.PartyRoomRules = api;
  }
})(typeof window !== 'undefined' ? window : globalThis);
