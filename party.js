"use strict";
/* =====================================================================
   FULL-SCREEN VOICE / PARTY ROOMS (v36)
   - Seat-Order Auto Host Transfer when current Owner disconnects/leaves
   - Auto Room Leave on exit/tab-close/timeout + Empty Room Auto-Close
   - Floating VR Icon Mode on Back + Clear Game Launch Guard Modal
   - YouTube Watch-Together Play/Pause/Seek + Ad Delay Auto-Snap & Status
   - Race-Free VR Chat & Floating Emoji Reactions Live Sync
   ===================================================================== */

const PARTY_MODES_META = {
  normal: { id: 'normal', name: 'Normal', badge: 'Voice', desc: 'Owner stage + mic seats & listener slots.' },
  acquaint: { id: 'acquaint', name: 'Acquaint', badge: 'Acquaint', desc: 'Spotlight pair + quick icebreaker prompts.' },
  auction: { id: 'auction', name: 'Auction', badge: 'Auction', desc: 'Spotlight stage, bidding tiers & TOP gifter.' },
  video: { id: 'video', name: 'Video', badge: 'Watch', desc: 'Synced YouTube watch-together stage + seats.' },
  games: { id: 'games', name: 'Games', badge: 'Games', desc: 'In-room party mini-games & Arena launches.' }
};

const PARTY_BG_META = {
  club: { id: 'club', name: 'Club Stage', css: 'radial-gradient(circle at 50% 6%, rgba(56,189,248,.28), transparent 46%), linear-gradient(168deg,#071026 0%,#10193c 48%,#060a18 100%)', accent: '#38bdf8' },
  grid: { id: 'grid', name: 'Cyber Grid', css: 'radial-gradient(circle at 50% 10%, rgba(34,211,238,.26), transparent 48%), linear-gradient(170deg,#050d20 0%,#0d1b3d 54%,#050914 100%)', accent: '#22d3ee' },
  stage: { id: 'stage', name: 'Royal Stage', css: 'radial-gradient(circle at 50% 4%, rgba(251,191,36,.3), transparent 46%), linear-gradient(168deg,#1c0c24 0%,#241236 52%,#090a18 100%)', accent: '#fbbf24' },
  neon: { id: 'neon', name: 'Neon Chill', css: 'radial-gradient(circle at 22% 14%, rgba(56,189,248,.3), transparent 46%), linear-gradient(160deg,#0c1633,#1b1140 52%,#090e20)', accent: '#a855f7' },
  royal: { id: 'royal', name: 'Velvet Palace', css: 'radial-gradient(circle at 50% 14%, rgba(255,211,107,.32), transparent 46%), linear-gradient(165deg,#2e0826,#3e1244 50%,#140820)', accent: '#ffd36b' }
};

const PARTY_COVERS = {
  cover_tensura: { name: 'Tensura Crest', bg: 'linear-gradient(135deg,#0ea5e9,#6366f1 55%,#a855f7)', glyph: '✦' },
  cover_crown: { name: 'Royal Crown', bg: 'linear-gradient(135deg,#f59e0b,#dc2626 60%,#7c2d12)', glyph: '👑' },
  cover_cyber: { name: 'Cyber Pulse', bg: 'linear-gradient(135deg,#06b6d4,#2563eb 55%,#1e1b4b)', glyph: '⚡' },
  cover_sakura: { name: 'Sakura Night', bg: 'linear-gradient(135deg,#f472b6,#db2777 55%,#581c87)', glyph: '🌸' },
  cover_emerald: { name: 'Emerald Club', bg: 'linear-gradient(135deg,#10b981,#0d9488 55%,#0f172a)', glyph: '💎' },
  cover_cinema: { name: 'Cinema Gold', bg: 'linear-gradient(135deg,#fbbf24,#7c3aed 60%,#0f172a)', glyph: '🎬' }
};

const PARTY_TAGS = ['Friends', 'Chill', 'Music', 'Gaming', 'Study', 'Acquaint', 'Auction', 'Spy'];
const MIC_SEAT_LIMIT = 4; // Seats 0..3 can speak live via WebRTC; others are listeners

const PARTY_MUSIC_TRACKS = [
  { id: 'hi_1', category: 'hindi', title: 'Hindi Chill Beats', artist: 'Room Audio Track', url: '' },
  { id: 'hi_2', category: 'hindi', title: 'Hindi Acoustic Vibe', artist: 'Room Audio Track', url: '' },
  { id: 'bn_1', category: 'bangla', title: 'Bangla Acoustic Breeze', artist: 'Room Audio Track', url: '' },
  { id: 'bn_2', category: 'bangla', title: 'Bangla Folk Lounge', artist: 'Room Audio Track', url: '' },
  { id: 'lofi_1', category: 'lofi', title: 'Late Night Lo-Fi', artist: 'Room Audio Track', url: '' }
];

const PARTY_REACTIONS = ['🔥', '❤️', '😂', '👏', '🎉', '💎', '👑', '😮'];

function PRR() {
  return window.PartyRoomRules || null;
}

function isMicSeatIndex(idx) {
  return Number(idx) >= 0 && Number(idx) < MIC_SEAT_LIMIT;
}

function getEffectiveOwnerUid(rm) {
  return String((rm && (rm.activeHostUid || rm.hostUid)) || '').trim();
}

function getEffectiveOwnerName(rm) {
  return String((rm && (rm.activeHostName || rm.hostName)) || 'Owner').trim() || 'Owner';
}

function isSingleOwner(rm, targetUid = uid) {
  const ownerUid = getEffectiveOwnerUid(rm);
  return Boolean(ownerUid && targetUid && ownerUid === targetUid);
}

function isRoomAdmin(rm, targetUid = uid) {
  if (!rm || !targetUid) return false;
  if (getEffectiveOwnerUid(rm) === targetUid) return true;
  return Array.isArray(rm.admins) && rm.admins.includes(targetUid);
}

function canModerateRoom(rm) {
  return isRoomAdmin(rm, uid);
}

function normalizePartySeats(seats) {
  if (!seats || typeof seats !== 'object') return {};
  const bestByUid = new Map();
  Object.keys(seats).sort((a, b) => Number(a) - Number(b)).forEach(k => {
    const occ = seats[k];
    if (!occ || !occ.uid) return;
    const joinedAt = Number(occ.joinedAt || 0);
    const prev = bestByUid.get(occ.uid);
    if (!prev || joinedAt > prev.joinedAt) bestByUid.set(occ.uid, { key: k, joinedAt });
  });
  const clean = {};
  bestByUid.forEach((info, uId) => {
    const occ = seats[info.key];
    if (occ && occ.uid === uId) clean[info.key] = { ...occ };
  });
  return clean;
}

function findUserSeatKeyInRoom(room, userUid) {
  if (!room || !room.seats || !userUid) return null;
  const keys = Object.keys(room.seats).sort((a, b) => Number(a) - Number(b));
  for (const k of keys) {
    if (room.seats[k] && room.seats[k].uid === userUid) return k;
  }
  return null;
}

function makeRoomShortId(idStr) {
  let h = 2166136261;
  const s = String(idStr || 'room');
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return String(100000 + (Math.abs(h) % 899999));
}

function normalizePartyRoom(rm) {
  if (!rm || typeof rm !== 'object') return null;
  const now = Date.now();
  const mode = PARTY_MODES_META[rm.mode] ? rm.mode : (rm.youtubeId ? 'video' : 'normal');
  const background = PARTY_BG_META[rm.background] ? rm.background : 'club';
  const cover = PARTY_COVERS[rm.cover] ? rm.cover : 'cover_tensura';
  const seats = normalizePartySeats(rm.seats);
  const rules = PRR();
  const members = rules && typeof rules.normalizeMembersMap === 'function'
    ? rules.normalizeMembersMap({ ...rm, seats }, now)
    : (rm.members && typeof rm.members === 'object' ? { ...rm.members } : {});
  const creatorUid = String(rm.creatorUid || rm.hostUid || (seats['0'] && seats['0'].uid) || uid);
  const effectiveHostUid = String(rm.activeHostUid || rm.hostUid || (seats['0'] && seats['0'].uid) || uid);
  const effectiveHostName = rm.activeHostName || rm.hostName || (seats['0'] && seats['0'].name) || (members[effectiveHostUid] && members[effectiveHostUid].name) || 'Owner';
  const admins = Array.isArray(rm.admins)
    ? [...new Set(rm.admins.filter(x => x && x !== effectiveHostUid))]
    : [];
  const videoSync = (window.ShowGamesRules && typeof window.ShowGamesRules.normalizeVideoSyncState === 'function')
    ? window.ShowGamesRules.normalizeVideoSyncState(rm.videoSync, rm.youtubeId || '')
    : (rm.videoSync && typeof rm.videoSync === 'object' ? {
        kind: rm.videoSync.kind === 'direct' || (!rm.videoSync.videoId && rm.videoSync.videoUrl) ? 'direct' : 'youtube',
        videoId: String(rm.videoSync.videoId || rm.youtubeId || ''),
        videoUrl: String(rm.videoSync.videoUrl || ''),
        playing: Boolean(rm.videoSync.playing),
        seekSec: Math.max(0, Number(rm.videoSync.seekSec || 0)),
        durationSec: Math.max(0, Number(rm.videoSync.durationSec || 0)),
        playbackRate: Math.min(2, Math.max(0.5, Number(rm.videoSync.playbackRate || 1))),
        updatedAt: Number(rm.videoSync.updatedAt || now),
        updatedBy: String(rm.videoSync.updatedBy || ''),
        seq: Math.max(0, Math.floor(Number(rm.videoSync.seq || 0)))
      } : {
        kind: 'youtube',
        videoId: String(rm.youtubeId || ''),
        videoUrl: '',
        playing: false,
        seekSec: 0,
        durationSec: 0,
        playbackRate: 1,
        updatedAt: Number(rm.updatedAt || now),
        updatedBy: '',
        seq: 0
      });

  const videoViewerStates = rm.videoViewerStates && typeof rm.videoViewerStates === 'object'
    ? { ...rm.videoViewerStates }
    : {};

  return {
    ...rm,
    id: rm.id || ('pr_' + now.toString(36)),
    shortId: rm.shortId || makeRoomShortId(rm.id),
    status: rm.status === 'closed' ? 'closed' : 'active',
    title: rm.title || 'Voice Lounge',
    tag: rm.tag || PARTY_MODES_META[mode].badge,
    cover,
    mode,
    background,
    creatorUid,
    hostUid: effectiveHostUid,
    hostName: effectiveHostName,
    activeHostUid: effectiveHostUid,
    activeHostName: effectiveHostName,
    admins,
    kickedUids: Array.isArray(rm.kickedUids) ? [...new Set(rm.kickedUids)] : [],
    announcement: typeof rm.announcement === 'string' && rm.announcement.trim()
      ? rm.announcement
      : 'Seats 0-3 = Mic Speakers (max 4) · Other seats = Listeners.',
    lockedSeats: Array.isArray(rm.lockedSeats) ? rm.lockedSeats.map(Number).filter(n => n >= 0 && n < 12) : [],
    musicUrl: String(rm.musicUrl || ''),
    musicTitle: String(rm.musicTitle || ''),
    musicPlaying: Boolean(rm.musicPlaying),
    youtubeId: videoSync.videoId,
    videoSync,
    videoViewerStates,
    seats,
    members,
    reactions: Array.isArray(rm.reactions) ? rm.reactions.slice(-24) : [],
    chat: Array.isArray(rm.chat) ? rm.chat.slice(-45) : []
  };
}

function buildSeedPartyRooms() {
  const now = Date.now();
  return [
    normalizePartyRoom({
      id: 'pr_seed_tensura',
      shortId: '882410',
      isSeed: true,
      title: 'Tensura Voice Lounge',
      tag: 'Friends',
      mode: 'normal',
      background: 'club',
      hostUid: 'bot_aria',
      hostName: 'Aria Nova',
      admins: [],
      seats: {
        '0': { uid: 'bot_aria', name: 'Aria Nova', avatar: 'av_g1', frame: 'fx_gold', muted: false, speaking: true, joinedAt: now - 40000, lastSeen: now }
      },
      members: {
        bot_aria: { uid: 'bot_aria', name: 'Aria Nova', avatar: 'av_g1', frame: 'fx_gold', seatIdx: 0, joinedAt: now - 40000, lastSeen: now, connected: true }
      },
      chat: [{ id: 's1', type: 'sys', text: 'Seats 0-3 are Mic Seats (max 4). Other seats are Listeners.', ts: now - 30000 }],
      createdAt: now - 50000,
      updatedAt: now
    })
  ];
}

let partyRooms = ls.get('sg_party_rooms', null);
const partySeedsCleared = () => ls.get('sg_party_seeds_cleared', '') === '1';
if (!Array.isArray(partyRooms)) {
  partyRooms = partySeedsCleared() ? [] : buildSeedPartyRooms();
  ls.set('sg_party_rooms', partyRooms);
} else {
  partyRooms = partyRooms
    .map(normalizePartyRoom)
    .filter(r => r && r.status !== 'closed');
  if (!partyRooms.length && !partySeedsCleared()) {
    partyRooms = buildSeedPartyRooms();
    ls.set('sg_party_rooms', partyRooms);
  }
}

function isFakeOrStalePartyRoom(rm) {
  if (!rm || !rm.id) return true;
  if (rm.status === 'closed') return true;
  const id = String(rm.id);
  const now = Date.now();
  if (id.startsWith('pr_seed_') || /^(seed_|fake_|test_)/i.test(id)) return true;
  if (rm.isSeed || rm.isFake || rm.isDemo) return true;
  if (rm.expiresAt && Number(rm.expiresAt) <= now) return true;
  const hostUid = String(rm.hostUid || '');
  const isBotHost = /^(bot_|demo_|fake_)/i.test(hostUid);
  const seats = Object.values(normalizePartySeats(rm.seats)).filter(Boolean);
  const rules = PRR();
  const activeMembers = rules ? rules.getOrderedActiveMembers(rm, now, rules.DEFAULT_STALE_MS) : seats;
  const realActive = activeMembers.filter(m => m && m.uid && !/^(bot_|demo_|fake_)/i.test(String(m.uid)));
  if (isBotHost && realActive.length === 0) return true;
  if (activeMembers.length === 0) return true;
  const ageMs = now - Number(rm.updatedAt || rm.createdAt || 0);
  if (ageMs > 2 * 60 * 60 * 1000 && realActive.length === 0) return true;
  return false;
}
window.isFakeOrStalePartyRoom = isFakeOrStalePartyRoom;

async function clearFakeVoiceRooms() {
  const isDev = typeof isDevSession === 'function' ? isDevSession() : (typeof devMode !== 'undefined' && devMode);
  if (!isDev) {
    if (typeof toast === 'function') toast('Developer only tool');
    return 0;
  }
  ls.set('sg_party_seeds_cleared', '1');
  const toDeleteIds = new Set();
  const kept = [];

  (partyRooms || []).forEach(rm => {
    if (isFakeOrStalePartyRoom(rm)) {
      if (rm && rm.id) toDeleteIds.add(String(rm.id));
    } else {
      kept.push(rm);
    }
  });

  if (typeof online !== 'undefined' && online && typeof db !== 'undefined' && db && typeof F !== 'undefined' && F && typeof F.getDocs === 'function') {
    try {
      const snap = await F.getDocs(F.collection(db, 'party_rooms'));
      snap.forEach(docSnap => {
        const data = { id: docSnap.id, ...(docSnap.data() || {}) };
        if (isFakeOrStalePartyRoom(data)) {
          toDeleteIds.add(String(docSnap.id));
        }
      });
    } catch (err) {
      console.warn('clearFakeVoiceRooms scan skipped:', err?.message || err);
    }
  }

  for (const rid of toDeleteIds) {
    if (activePartyRoomId === rid || minimizedPartyRoomId === rid) {
      if (typeof closePartyRoom === 'function') closePartyRoom({ skipLeavePersist: true });
    }
    if (typeof dbOp === 'function' && typeof db !== 'undefined' && db && typeof F !== 'undefined' && F) {
      dbOp(() => F.deleteDoc(F.doc(db, 'party_rooms', rid)));
    }
  }

  partyRooms = kept;
  savePartyRoomsLocal();
  renderPartyHub();
  if (typeof toast === 'function') {
    toast(toDeleteIds.size
      ? `🧹 Cleared ${toDeleteIds.size} fake/stale voice room${toDeleteIds.size > 1 ? 's' : ''}!`
      : '✓ No fake or stale voice rooms found');
  }
  return toDeleteIds.size;
}
window.clearFakeVoiceRooms = clearFakeVoiceRooms;

let activePartyRoomId = null;
let minimizedPartyRoomId = null;
let partySpeakerOn = true;

function getCurrentVrRoomId() {
  return activePartyRoomId || minimizedPartyRoomId || null;
}

function isVrSessionActive() {
  const rules = PRR();
  if (rules && typeof rules.shouldBlockGameLaunchForVr === 'function') {
    return rules.shouldBlockGameLaunchForVr({ activePartyRoomId, minimizedPartyRoomId, bypassVrGuard: false });
  }
  return Boolean(activePartyRoomId || minimizedPartyRoomId);
}
window.isVrSessionActive = isVrSessionActive;

/* ===== Cross-Tab & Multi-Window Live Room Sync Channel (Chat + Reactions + Lifecycle) ===== */
let partyRoomBc = null;
const partyBcMsgsByRoom = new Map();
const partyBcReactionsByRoom = new Map();
const seenPartyReactionIds = new Set();
const activeSeatReactions = new Map(); // uid -> { emoji, expiresAt }

function postPartyRoomBroadcast(payload) {
  if (!payload || !payload.roomId) return;
  const wrapped = { ...payload, fromUid: uid, ts: Date.now() };
  try {
    if (partyRoomBc) partyRoomBc.postMessage(wrapped);
    localStorage.setItem('sg_party_room_ping', JSON.stringify(wrapped));
  } catch {}
}

function initPartyRoomBroadcastChannel() {
  if (!partyRoomBc && typeof BroadcastChannel !== 'undefined') {
    try {
      partyRoomBc = new BroadcastChannel('sg_party_room_sync');
      partyRoomBc.onmessage = ev => handleIncomingPartyRoomBroadcast(ev?.data);
    } catch {}
  }
  if (!window.__sgPartyRoomStorageBound) {
    window.__sgPartyRoomStorageBound = true;
    window.addEventListener('storage', ev => {
      if (ev.key !== 'sg_party_room_ping' || !ev.newValue) return;
      try { handleIncomingPartyRoomBroadcast(JSON.parse(ev.newValue)); } catch {}
    });
  }
}

function handleIncomingPartyRoomBroadcast(payload) {
  if (!payload || !payload.roomId) return;
  const rid = String(payload.roomId);
  const kind = payload.kind || '';

  if (kind === 'room_closed') {
    partyRooms = partyRooms.filter(r => r && r.id !== rid);
    savePartyRoomsLocal();
    if (activePartyRoomId === rid || minimizedPartyRoomId === rid) {
      closePartyRoom({ skipLeavePersist: true });
      if (typeof toast === 'function') toast('Voice room closed (no active members)');
    }
    renderPartyHub();
    return;
  }

  let rm = partyRooms.find(r => r && r.id === rid);

  if (kind === 'chat' && payload.message && payload.message.id) {
    const list = partyBcMsgsByRoom.get(rid) || [];
    if (!list.some(m => m && m.id === payload.message.id)) {
      partyBcMsgsByRoom.set(rid, [...list, payload.message].slice(-60));
    }
    if (rm) {
      const rules = PRR();
      rm.chat = rules
        ? rules.mergeRoomChatMessages([rm.chat, [payload.message]], Array.from(partyDeletedMsgIds), 45)
        : [...(rm.chat || []).filter(m => m && m.id !== payload.message.id), payload.message].slice(-45);
      savePartyRoomsLocal();
      if (activePartyRoomId === rid) renderFullScreenPartyRoom();
    }
    return;
  }

  if (kind === 'reaction' && payload.reaction && payload.reaction.id) {
    const rx = payload.reaction;
    const list = partyBcReactionsByRoom.get(rid) || [];
    if (!list.some(r => r && r.id === rx.id)) {
      partyBcReactionsByRoom.set(rid, [...list, rx].slice(-30));
    }
    if (rm) {
      const rules = PRR();
      rm.reactions = rules
        ? rules.mergeRoomReactions([rm.reactions, [rx]], 24)
        : [...(rm.reactions || []).filter(r => r && r.id !== rx.id), rx].slice(-24);
      savePartyRoomsLocal();
      if (activePartyRoomId === rid) {
        triggerPartyReactionFx(rm, rx);
      }
    }
    return;
  }

  if (kind === 'room_update' && payload.room) {
    const incoming = normalizePartyRoom(payload.room);
    if (!incoming) return;
    if (incoming.status === 'closed') {
      handleIncomingPartyRoomBroadcast({ kind: 'room_closed', roomId: rid });
      return;
    }
    const rules = PRR();
    if (rm && rules) {
      incoming.chat = rules.mergeRoomChatMessages([rm.chat, incoming.chat], Array.from(partyDeletedMsgIds), 45);
      incoming.reactions = rules.mergeRoomReactions([rm.reactions, incoming.reactions], 24);
    }
    const idx = partyRooms.findIndex(r => r && r.id === rid);
    if (idx >= 0) partyRooms[idx] = incoming;
    else partyRooms = [incoming, ...partyRooms].slice(0, 24);
    savePartyRoomsLocal();
    if (activePartyRoomId === rid) {
      syncReactionsFromList(incoming, incoming.reactions);
      renderFullScreenPartyRoom();
    } else if (minimizedPartyRoomId === rid) {
      renderFloatingVrPill();
    }
    renderPartyHub();
  }
}

/* ===== Real HTML5 Audio Player (Persists Across Views/Tabs) ===== */
const PartyAudioPlayer = (() => {
  let el = null;
  function ensure() {
    if (!el) {
      el = document.createElement('audio');
      el.id = 'sgPartyAudioEl';
      el.preload = 'none';
      el.loop = true;
      el.volume = 0.65;
      document.body.appendChild(el);
    }
    return el;
  }
  function playUrl(url, title) {
    const clean = String(url || '').trim();
    if (!clean) return false;
    const audio = ensure();
    audio.src = clean;
    audio.muted = !partySpeakerOn;
    audio.play().catch(() => {});
    return Boolean(title);
  }
  function setPlaying(play) {
    const audio = ensure();
    if (!audio.src) return;
    if (play && partySpeakerOn) audio.play().catch(() => {});
    else audio.pause();
  }
  function syncSpeaker(on) {
    if (!el) return;
    el.muted = !on;
    if (on && !el.paused) el.play().catch(() => {});
  }
  function stop() {
    if (!el) return;
    try { el.pause(); el.removeAttribute('src'); } catch {}
  }
  return { playUrl, setPlaying, syncSpeaker, stop };
})();

/* ===== Live Watch-Together Video Sync Controller (YouTube IFrame API + Ad Delay Sync + HTML5 <video>) ===== */
const PartyVideoSync = (() => {
  let ytApiPromise = null;
  let activeRoomId = '';
  let mountedSourceKey = '';
  let mountedKind = '';
  let ytPlayer = null;
  let ytReady = false;
  let htmlVideoEl = null;
  let syncTickIv = 0;
  let theaterMode = false;
  let isScrubbing = false;
  let suppressUntil = 0;
  let lastAppliedSig = '';
  let lastExpectedYtSec = -1;
  let lastExpectedYtTs = 0;
  let currentSyncState = null;
  let slotElRef = null;
  let bc = null;

  // YouTube Ad & Buffering Recovery State
  let localViewerStatus = 'synced'; // 'synced' | 'ad' | 'buffering' | 'behind'
  let wasInAd = false;
  let lastSeekIssuedAt = 0;
  let lastSeekTargetSec = 0;
  let lastStatusReportAt = 0;
  let lastReportedStatus = 'synced';
  let forcedLocalAdSim = false;

  const SGR = () => window.ShowGamesRules || null;

  function normSync(raw, fallbackYt) {
    const s = SGR();
    if (s && typeof s.normalizeVideoSyncState === 'function') {
      return s.normalizeVideoSyncState(raw, fallbackYt || '');
    }
    const r = raw && typeof raw === 'object' ? raw : {};
    return {
      kind: r.kind === 'direct' || (!r.videoId && r.videoUrl) ? 'direct' : 'youtube',
      videoId: String(r.videoId || fallbackYt || ''),
      videoUrl: String(r.videoUrl || ''),
      playing: Boolean(r.playing),
      seekSec: Math.max(0, Number(r.seekSec || 0)),
      durationSec: Math.max(0, Number(r.durationSec || 0)),
      playbackRate: Math.min(2, Math.max(0.5, Number(r.playbackRate || 1))),
      updatedAt: Number(r.updatedAt || Date.now()),
      updatedBy: String(r.updatedBy || ''),
      seq: Math.max(0, Math.floor(Number(r.seq || 0)))
    };
  }

  function computeTarget(sync, nowMs = Date.now()) {
    const s = SGR();
    if (s && typeof s.computeTargetVideoTime === 'function') {
      return s.computeTargetVideoTime(sync, nowMs);
    }
    const vs = normSync(sync);
    let t = vs.seekSec;
    if (vs.playing) t += Math.max(0, (nowMs - vs.updatedAt) / 1000) * vs.playbackRate;
    if (vs.durationSec > 0) t = Math.min(vs.durationSec, t);
    return Math.max(0, Math.round(t * 100) / 100);
  }

  function needsResync(localSec, targetSec, threshold = 1.5) {
    const s = SGR();
    if (s && typeof s.shouldResyncVideoTime === 'function') {
      return s.shouldResyncVideoTime(localSec, targetSec, threshold);
    }
    return Math.abs(Number(localSec || 0) - Number(targetSec || 0)) > threshold;
  }

  function fmtClock(sec) {
    const s = SGR();
    if (s && typeof s.formatVideoClock === 'function') return s.formatVideoClock(sec);
    const total = Math.max(0, Math.floor(Number(sec) || 0));
    const m = Math.floor(total / 60);
    const r = total % 60;
    return `${m}:${String(r).padStart(2, '0')}`;
  }

  function loadYouTubeApi() {
    if (window.YT && typeof window.YT.Player === 'function') return Promise.resolve(window.YT);
    if (ytApiPromise) return ytApiPromise;
    ytApiPromise = new Promise(resolve => {
      let done = false;
      const finish = (val) => {
        if (done) return;
        done = true;
        resolve(val || null);
      };
      const prevReady = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        try { if (typeof prevReady === 'function') prevReady(); } catch {}
        finish(window.YT || null);
      };
      if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        tag.async = true;
        tag.onerror = () => finish(null);
        document.head.appendChild(tag);
      }
      setTimeout(() => finish(window.YT && typeof window.YT.Player === 'function' ? window.YT : null), 4500);
    });
    return ytApiPromise;
  }

  function getLocalTime() {
    try {
      if (mountedKind === 'direct' && htmlVideoEl) {
        return Number.isFinite(htmlVideoEl.currentTime) ? htmlVideoEl.currentTime : 0;
      }
      if (mountedKind === 'youtube' && ytPlayer && ytReady && typeof ytPlayer.getCurrentTime === 'function') {
        const t = Number(ytPlayer.getCurrentTime());
        if (Number.isFinite(t)) return t;
      }
    } catch {}
    return currentSyncState ? computeTarget(currentSyncState, Date.now()) : 0;
  }

  function getDuration() {
    try {
      if (mountedKind === 'direct' && htmlVideoEl && Number.isFinite(htmlVideoEl.duration) && htmlVideoEl.duration > 0) {
        return htmlVideoEl.duration;
      }
      if (mountedKind === 'youtube' && ytPlayer && ytReady && typeof ytPlayer.getDuration === 'function') {
        const d = Number(ytPlayer.getDuration());
        if (Number.isFinite(d) && d > 0) return d;
      }
    } catch {}
    return currentSyncState && currentSyncState.durationSec > 0 ? currentSyncState.durationSec : 0;
  }

  function reportLocalViewerState(rm, status, driftSec = 0, force = false) {
    if (!rm || !rm.id || !uid) return;
    const now = Date.now();
    if (!force && status === lastReportedStatus && now - lastStatusReportAt < 5000) return;
    lastReportedStatus = status;
    lastStatusReportAt = now;
    const entry = {
      uid,
      name: (typeof me !== 'undefined' && me?.name) || 'Viewer',
      status,
      driftSec: Math.round(Number(driftSec || 0) * 10) / 10,
      ts: now
    };
    rm.videoViewerStates = { ...(rm.videoViewerStates || {}), [uid]: entry };
    try {
      if (bc) bc.postMessage({ roomId: rm.id, viewerState: entry, fromUid: uid });
      localStorage.setItem('sg_party_video_sync_ping', JSON.stringify({ roomId: rm.id, viewerState: entry, ts: now }));
    } catch {}
    if (!String(rm.id).startsWith('pr_seed_') && online && db && F && typeof F.updateDoc === 'function') {
      Promise.resolve(F.updateDoc(F.doc(db, 'party_rooms', rm.id), { [`videoViewerStates.${uid}`]: entry })).catch(() => {});
    }
    updateControlsUI();
  }

  function evaluateYouTubeAdState(rm) {
    const vs = currentSyncState;
    if (!vs) return { status: 'synced', inAd: false, isBuffering: false, needsSnapAfterAd: false, driftSec: 0 };
    const now = Date.now();
    const targetSec = computeTarget(vs, now);
    if (forcedLocalAdSim) {
      return { status: 'ad', inAd: true, isBuffering: false, needsSnapAfterAd: true, driftSec: targetSec };
    }
    if (mountedKind !== 'youtube' || !ytPlayer || !ytReady) {
      return { status: 'synced', inAd: false, isBuffering: false, needsSnapAfterAd: false, driftSec: 0 };
    }
    let playerState = -1;
    let currentVideoId = '';
    let localSec = targetSec;
    let localDur = 0;
    try {
      playerState = typeof ytPlayer.getPlayerState === 'function' ? ytPlayer.getPlayerState() : -1;
      currentVideoId = typeof ytPlayer.getVideoData === 'function' ? String(ytPlayer.getVideoData()?.video_id || '') : '';
      localSec = Number(ytPlayer.getCurrentTime?.() || 0);
      localDur = Number(ytPlayer.getDuration?.() || 0);
    } catch {}
    const seekFailedRecently = (now - lastSeekIssuedAt) < 4500 && lastSeekTargetSec > 15 && Math.abs(localSec - lastSeekTargetSec) > 6;
    const rules = PRR();
    if (rules && typeof rules.detectYouTubeAdOrBuffer === 'function') {
      return rules.detectYouTubeAdOrBuffer({
        playerState,
        currentVideoId,
        expectedVideoId: vs.videoId,
        localSec,
        localDur,
        expectedDur: vs.durationSec || 0,
        targetSec,
        seekFailedRecently
      });
    }
    const videoIdMismatch = Boolean(currentVideoId && vs.videoId && currentVideoId !== vs.videoId);
    if (videoIdMismatch) return { status: 'ad', inAd: true, isBuffering: false, needsSnapAfterAd: true, driftSec: targetSec - localSec };
    if (playerState === 3) return { status: 'buffering', inAd: false, isBuffering: true, needsSnapAfterAd: false, driftSec: targetSec - localSec };
    return { status: 'synced', inAd: false, isBuffering: false, needsSnapAfterAd: false, driftSec: targetSec - localSec };
  }

  function applyRemoteState(sync, forceSeek = false) {
    const vs = normSync(sync);
    currentSyncState = vs;
    const now = Date.now();
    const targetSec = computeTarget(vs, now);
    const sig = `${vs.kind}:${vs.videoId || vs.videoUrl}:${vs.seq}:${vs.playing ? 1 : 0}:${Math.round(vs.seekSec * 10)}:${vs.updatedAt}`;
    const isNewUpdate = forceSeek || sig !== lastAppliedSig;
    lastAppliedSig = sig;

    if (mountedKind === 'direct' && htmlVideoEl) {
      suppressUntil = now + 900;
      const cur = Number.isFinite(htmlVideoEl.currentTime) ? htmlVideoEl.currentTime : 0;
      if (isNewUpdate || needsResync(cur, targetSec, 1.5)) {
        try { htmlVideoEl.currentTime = targetSec; } catch {}
      }
      try {
        htmlVideoEl.muted = !partySpeakerOn;
        if (vs.playing) {
          if (htmlVideoEl.paused) htmlVideoEl.play().catch(() => {});
        } else if (!htmlVideoEl.paused) {
          htmlVideoEl.pause();
        }
      } catch {}
    } else if (mountedKind === 'youtube' && ytPlayer && ytReady) {
      suppressUntil = now + 1300;
      let cur = targetSec;
      try { cur = Number(ytPlayer.getCurrentTime()) || 0; } catch {}
      if (isNewUpdate || needsResync(cur, targetSec, 1.5)) {
        lastSeekIssuedAt = now;
        lastSeekTargetSec = targetSec;
        try { ytPlayer.seekTo(targetSec, true); } catch {}
        lastExpectedYtSec = targetSec;
        lastExpectedYtTs = now;
      }
      try {
        if (!partySpeakerOn && typeof ytPlayer.mute === 'function') ytPlayer.mute();
        else if (partySpeakerOn && typeof ytPlayer.unMute === 'function') ytPlayer.unMute();
        const st = typeof ytPlayer.getPlayerState === 'function' ? ytPlayer.getPlayerState() : -1;
        if (vs.playing) {
          if (st !== 1 && st !== 3 && typeof ytPlayer.playVideo === 'function') ytPlayer.playVideo();
        } else if (st === 1 || st === 3) {
          if (typeof ytPlayer.pauseVideo === 'function') ytPlayer.pauseVideo();
        }
      } catch {}
    }
    updateControlsUI();
  }

  function updateControlsUI() {
    const slot = slotElRef;
    if (!slot || !currentSyncState) return;
    const rm = partyRooms.find(r => r.id === activeRoomId);
    const vs = currentSyncState;
    const cur = getLocalTime();
    const dur = Math.max(getDuration(), vs.durationSec || 0, cur > 0 ? Math.ceil(cur + 30) : 600);
    const scrub = slot.querySelector('[data-vid-scrub]');
    if (scrub && !isScrubbing) {
      scrub.max = String(Math.max(10, Math.round(dur)));
      scrub.value = String(Math.min(Number(scrub.max), Math.max(0, Math.round(cur))));
    }
    const timeEl = slot.querySelector('[data-vid-time]');
    if (timeEl) {
      const realDur = getDuration() || vs.durationSec || 0;
      timeEl.textContent = realDur > 0 ? `${fmtClock(cur)} / ${fmtClock(realDur)}` : fmtClock(cur);
    }
    const stText = slot.querySelector('[data-vid-status-txt]');
    const stDot = slot.querySelector('[data-vid-status-dot]');
    if (stText) {
      if (localViewerStatus === 'ad') {
        stText.textContent = 'YouTube Ad · Auto-syncing after ad';
      } else if (localViewerStatus === 'buffering') {
        stText.textContent = 'Buffering · Holding live sync';
      } else {
        stText.textContent = vs.playing ? 'Live Sync · Playing' : 'Live Sync · Paused';
      }
    }
    if (stDot) {
      stDot.classList.toggle('live', Boolean(vs.playing) && localViewerStatus !== 'ad');
      stDot.classList.toggle('ad', localViewerStatus === 'ad' || localViewerStatus === 'buffering');
    }
    const toggleBtn = slot.querySelector('[data-vid-act="toggle"]');
    if (toggleBtn) {
      toggleBtn.textContent = vs.playing ? '⏸ Pause All' : '▶ Play All';
    }
    const card = slot.querySelector('.pfs-video-card');
    if (card) card.classList.toggle('theater', theaterMode);
    const thBtn = slot.querySelector('[data-vid-act="theater"]');
    if (thBtn) thBtn.textContent = theaterMode ? '🗗 Fit' : '⛶ Theater';

    // Live Ad / Buffering viewer status strip visible to Host & viewers
    const adStrip = slot.querySelector('[data-vid-ad-strip]');
    if (adStrip) {
      const rules = PRR();
      const summary = rm && rules && typeof rules.summarizeViewerSyncIssues === 'function'
        ? rules.summarizeViewerSyncIssues(rm.videoViewerStates, uid, Date.now(), 20000)
        : { inAd: [], buffering: [], hasIssues: false };
      if (summary.hasIssues) {
        const parts = [];
        if (summary.inAd.length) {
          parts.push(`📺 Ad playing: ${summary.inAd.map(x => esc(x.name)).join(', ')} (auto-syncs when ad ends)`);
        }
        if (summary.buffering.length) {
          parts.push(`⏳ Buffering: ${summary.buffering.map(x => esc(x.name)).join(', ')}`);
        }
        adStrip.innerHTML = `<span class="pfs-vid-ad-txt">${parts.join(' · ')}</span>`;
        adStrip.hidden = false;
      } else {
        adStrip.innerHTML = '';
        adStrip.hidden = true;
      }
    }
  }

  function broadcastSyncUpdate(rm, patch, chatNote) {
    if (!rm) return;
    const prev = normSync(rm.videoSync, rm.youtubeId || '');
    const dur = Math.max(0, Math.round(getDuration() || prev.durationSec || 0));
    const next = normSync({
      ...prev,
      ...patch,
      durationSec: patch.durationSec != null ? patch.durationSec : dur,
      updatedAt: Date.now(),
      updatedBy: uid,
      seq: (prev.seq || 0) + 1
    });
    rm.videoSync = next;
    rm.youtubeId = next.kind === 'youtube' ? next.videoId : '';
    if (chatNote) {
      rm.chat = [...(rm.chat || []), { id: 'vs_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 4), type: 'sys', text: chatNote, ts: Date.now() }].slice(-45);
    }
    applyRemoteState(next, true);
    try {
      if (bc) bc.postMessage({ roomId: rm.id, videoSync: next, fromUid: uid });
      localStorage.setItem('sg_party_video_sync_ping', JSON.stringify({ roomId: rm.id, videoSync: next, ts: Date.now() }));
    } catch {}
    persistPartyRoom(rm);
  }

  function handleIncomingCrossTabSync(payload) {
    if (!payload || !payload.roomId) return;
    const rm = partyRooms.find(r => r.id === payload.roomId);
    if (!rm) return;

    if (payload.viewerState && payload.viewerState.uid) {
      rm.videoViewerStates = { ...(rm.videoViewerStates || {}), [payload.viewerState.uid]: payload.viewerState };
      if (activePartyRoomId === rm.id) updateControlsUI();
      return;
    }

    if (!payload.videoSync) return;
    const incoming = normSync(payload.videoSync, rm.youtubeId || '');
    const cur = normSync(rm.videoSync, rm.youtubeId || '');
    if (incoming.seq < cur.seq && incoming.updatedAt <= cur.updatedAt) return;
    rm.videoSync = incoming;
    rm.youtubeId = incoming.kind === 'youtube' ? incoming.videoId : '';
    if (activePartyRoomId === rm.id) {
      const root = document.getElementById('partyFsRoot');
      const slot = root ? root.querySelector('#pfsVideoSlot') : null;
      if (slot) syncRoom(rm, slot);
    }
  }

  function initCrossTabChannel() {
    if (!bc && typeof BroadcastChannel !== 'undefined') {
      try {
        bc = new BroadcastChannel('sg_party_video_sync');
        bc.onmessage = ev => handleIncomingCrossTabSync(ev?.data);
      } catch {}
    }
    if (!window.__sgPartyVideoStorageBound) {
      window.__sgPartyVideoStorageBound = true;
      window.addEventListener('storage', ev => {
        if (ev.key !== 'sg_party_video_sync_ping' || !ev.newValue) return;
        try { handleIncomingCrossTabSync(JSON.parse(ev.newValue)); } catch {}
      });
    }
  }

  function startSyncLoop() {
    clearInterval(syncTickIv);
    syncTickIv = setInterval(() => {
      if (document.hidden || !activeRoomId || !currentSyncState) return;
      const rm = partyRooms.find(r => r.id === activeRoomId);
      if (!rm || rm.mode !== 'video') {
        destroy();
        return;
      }
      const vs = currentSyncState;
      const now = Date.now();

      // 1) Detect YouTube Ad / Buffering before touching room broadcast
      const adCheck = evaluateYouTubeAdState(rm);
      localViewerStatus = adCheck.status;

      if (adCheck.inAd) {
        wasInAd = true;
        reportLocalViewerState(rm, 'ad', adCheck.driftSec);
        updateControlsUI();
        return; // Never broadcast ad timestamps or hijack host playback during an ad!
      }

      if (wasInAd && !adCheck.inAd) {
        wasInAd = false;
        reportLocalViewerState(rm, 'synced', 0, true);
        const liveSec = computeTarget(vs, now);
        applyRemoteState(vs, true);
        if (typeof toast === 'function') toast(`⏩ Ad finished — snapped to live ${fmtClock(liveSec)}`);
        return;
      }

      if (adCheck.isBuffering) {
        reportLocalViewerState(rm, 'buffering', adCheck.driftSec);
        updateControlsUI();
        return;
      }

      if (lastReportedStatus !== 'synced') {
        reportLocalViewerState(rm, 'synced', 0, true);
      }

      // 2) Detect direct native YouTube scrubber jumps by the local user (only when not in ad/buffering)
      if (mountedKind === 'youtube' && ytPlayer && ytReady && now > suppressUntil && typeof ytPlayer.getCurrentTime === 'function') {
        try {
          const cur = Number(ytPlayer.getCurrentTime());
          const st = typeof ytPlayer.getPlayerState === 'function' ? ytPlayer.getPlayerState() : -1;
          if (Number.isFinite(cur)) {
            if (lastExpectedYtSec >= 0 && lastExpectedYtTs > 0) {
              const dt = (now - lastExpectedYtTs) / 1000;
              const expected = vs.playing ? (lastExpectedYtSec + dt * vs.playbackRate) : lastExpectedYtSec;
              if (Math.abs(cur - expected) > 2.4 && (st === 1 || st === 2)) {
                lastExpectedYtSec = cur;
                lastExpectedYtTs = now;
                broadcastSyncUpdate(rm, { seekSec: Math.max(0, Math.round(cur * 10) / 10), playing: st === 1 });
                return;
              }
            }
            lastExpectedYtSec = cur;
            lastExpectedYtTs = now;
          }
        } catch {}
      }

      // 3) Periodic drift correction toward authoritative room clock
      if (now > suppressUntil && vs.playing) {
        const localSec = getLocalTime();
        const targetSec = computeTarget(vs, now);
        if (needsResync(localSec, targetSec, 1.8)) {
          applyRemoteState(vs, true);
          return;
        }
      }
      updateControlsUI();
    }, 1000);
  }

  function destroyPlayerOnly() {
    clearInterval(syncTickIv);
    syncTickIv = 0;
    ytReady = false;
    lastExpectedYtSec = -1;
    lastExpectedYtTs = 0;
    localViewerStatus = 'synced';
    wasInAd = false;
    forcedLocalAdSim = false;
    if (ytPlayer) {
      try { if (typeof ytPlayer.destroy === 'function') ytPlayer.destroy(); } catch {}
      ytPlayer = null;
    }
    if (htmlVideoEl) {
      try { htmlVideoEl.pause(); htmlVideoEl.removeAttribute('src'); htmlVideoEl.load(); } catch {}
      htmlVideoEl = null;
    }
    mountedSourceKey = '';
    mountedKind = '';
    lastAppliedSig = '';
  }

  function destroy() {
    destroyPlayerOnly();
    activeRoomId = '';
    currentSyncState = null;
    if (slotElRef) slotElRef.innerHTML = '';
    slotElRef = null;
    isScrubbing = false;
  }

  function mountVideoCard(rm, slot, vs) {
    destroyPlayerOnly();
    activeRoomId = rm.id;
    slotElRef = slot;
    currentSyncState = vs;
    const hasSrc = Boolean(vs.videoId || vs.videoUrl);
    if (!hasSrc) {
      slot.innerHTML = `
        <div class="pfs-video-card" data-testid="pfs-video-card">
          <div class="pfs-vid-empty">
            <div class="pfs-vid-ico">🎬</div>
            <b>Watch Together Stage</b>
            <small>Add a YouTube link or direct .mp4 video — everyone watches at the exact same timestamp!</small>
            <button type="button" class="btn gold sm" style="margin-top:6px" data-pfs-act="open-add-video">+ Add Video</button>
          </div>
        </div>
      `;
      return;
    }

    const mountId = 'pfsYtMount_' + rm.id.replace(/[^a-z0-9_]/gi, '');
    const targetSec = computeTarget(vs, Date.now());
    const initDur = Math.max(60, Math.round(vs.durationSec || 600));
    mountedKind = vs.kind;
    mountedSourceKey = `${vs.kind}:${vs.videoId || vs.videoUrl}`;

    slot.innerHTML = `
      <div class="pfs-video-card ${theaterMode ? 'theater' : ''}" data-testid="pfs-video-card">
        <div class="pfs-video-stage-wrap">
          <div class="pfs-yt-frame" data-testid="pfs-video-viewport">
            ${vs.kind === 'direct'
              ? `<video id="${mountId}" class="pfs-html-video" src="${esc(vs.videoUrl)}" controls playsinline preload="metadata"></video>`
              : `<div id="${mountId}" class="pfs-yt-mount"></div>`
            }
          </div>
        </div>
        <div class="pfs-vid-ad-strip" data-vid-ad-strip data-testid="vr-video-ad-strip" hidden></div>
        <div class="pfs-vid-controls">
          <div class="pfs-vid-scrub-row">
            <input type="range" class="pfs-vid-scrubber" data-vid-scrub min="0" max="${initDur}" value="${Math.min(initDur, Math.round(targetSec))}" step="1" aria-label="Video timestamp scrubber">
            <span class="pfs-vid-time" data-vid-time>${fmtClock(targetSec)}</span>
          </div>
          <div class="pfs-vid-bar">
            <div class="pfs-vid-meta-row">
              <span class="pfs-vid-status">
                <i class="pfs-vid-status-dot ${vs.playing ? 'live' : ''}" data-vid-status-dot></i>
                <span data-vid-status-txt>${vs.playing ? 'Live Sync · Playing' : 'Live Sync · Paused'}</span>
              </span>
              <button type="button" class="btn sm gold pfs-vid-change-btn" data-pfs-act="open-add-video">Change</button>
            </div>
            <div class="pfs-vid-btns">
              <button type="button" class="btn sm ghost" data-vid-act="back10" title="Back 10 seconds">⏪ -10s</button>
              <button type="button" class="btn sm ok" data-vid-act="toggle" data-vid-sync="toggle">${vs.playing ? '⏸ Pause All' : '▶ Play All'}</button>
              <button type="button" class="btn sm ghost" data-vid-act="fwd10" title="Forward 10 seconds">+10s ⏩</button>
              <button type="button" class="btn sm ghost" data-vid-act="resync" data-testid="vr-video-sync-now" title="Snap to live room timestamp">⟳ Sync Now</button>
              <button type="button" class="btn sm ghost" data-vid-act="theater">${theaterMode ? '🗗 Fit' : '⛶ Theater'}</button>
            </div>
          </div>
        </div>
      </div>
    `;

    const scrub = slot.querySelector('[data-vid-scrub]');
    if (scrub) {
      scrub.oninput = () => {
        isScrubbing = true;
        const tEl = slot.querySelector('[data-vid-time]');
        const realDur = getDuration() || vs.durationSec || 0;
        if (tEl) tEl.textContent = realDur > 0 ? `${fmtClock(scrub.value)} / ${fmtClock(realDur)}` : fmtClock(scrub.value);
      };
      scrub.onchange = () => {
        isScrubbing = false;
        const sec = Math.max(0, Number(scrub.value) || 0);
        const curRm = partyRooms.find(r => r.id === activeRoomId);
        if (curRm) {
          broadcastSyncUpdate(curRm, { seekSec: sec }, `${me.name} skipped video to ${fmtClock(sec)}`);
        }
      };
    }

    if (vs.kind === 'direct') {
      htmlVideoEl = document.getElementById(mountId);
      if (htmlVideoEl) {
        htmlVideoEl.muted = !partySpeakerOn;
        htmlVideoEl.addEventListener('loadedmetadata', () => {
          applyRemoteState(currentSyncState || vs, true);
        });
        htmlVideoEl.addEventListener('play', () => {
          if (Date.now() < suppressUntil) return;
          const curRm = partyRooms.find(r => r.id === activeRoomId);
          if (curRm && !curRm.videoSync?.playing) {
            broadcastSyncUpdate(curRm, { playing: true, seekSec: Math.round((htmlVideoEl.currentTime || 0) * 10) / 10 });
          }
        });
        htmlVideoEl.addEventListener('pause', () => {
          if (Date.now() < suppressUntil || htmlVideoEl.seeking) return;
          const curRm = partyRooms.find(r => r.id === activeRoomId);
          if (curRm && curRm.videoSync?.playing) {
            broadcastSyncUpdate(curRm, { playing: false, seekSec: Math.round((htmlVideoEl.currentTime || 0) * 10) / 10 });
          }
        });
        htmlVideoEl.addEventListener('seeked', () => {
          if (Date.now() < suppressUntil) return;
          const curRm = partyRooms.find(r => r.id === activeRoomId);
          if (curRm) {
            broadcastSyncUpdate(curRm, { seekSec: Math.round((htmlVideoEl.currentTime || 0) * 10) / 10, playing: !htmlVideoEl.paused });
          }
        });
        applyRemoteState(vs, true);
      }
    } else {
      const mountNode = document.getElementById(mountId);
      const vidId = vs.videoId;
      loadYouTubeApi().then(YT => {
        if (!activeRoomId || activeRoomId !== rm.id || mountedSourceKey !== `youtube:${vidId}`) return;
        const targetNode = document.getElementById(mountId);
        if (!targetNode) return;
        if (YT && typeof YT.Player === 'function') {
          try {
            ytPlayer = new YT.Player(mountId, {
              videoId: vidId,
              playerVars: {
                autoplay: vs.playing ? 1 : 0,
                start: Math.floor(computeTarget(currentSyncState || vs, Date.now())),
                rel: 0,
                modestbranding: 1,
                playsinline: 1,
                enablejsapi: 1
              },
              events: {
                onReady: () => {
                  ytReady = true;
                  applyRemoteState(currentSyncState || vs, true);
                },
                onStateChange: ev => {
                  if (Date.now() < suppressUntil) return;
                  const curRm = partyRooms.find(r => r.id === activeRoomId);
                  if (!curRm) return;
                  const adCheck = evaluateYouTubeAdState(curRm);
                  localViewerStatus = adCheck.status;
                  if (adCheck.inAd) {
                    wasInAd = true;
                    reportLocalViewerState(curRm, 'ad', adCheck.driftSec, true);
                    return;
                  }
                  if (ev.data === YT.PlayerState.BUFFERING) {
                    reportLocalViewerState(curRm, 'buffering', adCheck.driftSec);
                    return;
                  }
                  if (wasInAd && ev.data === YT.PlayerState.PLAYING) {
                    wasInAd = false;
                    reportLocalViewerState(curRm, 'synced', 0, true);
                    applyRemoteState(currentSyncState || vs, true);
                    if (typeof toast === 'function') toast(`⏩ Ad finished — snapped to live ${fmtClock(computeTarget(currentSyncState || vs, Date.now()))}`);
                    return;
                  }
                  const curT = Math.max(0, Math.round((Number(ytPlayer?.getCurrentTime?.() || 0)) * 10) / 10);
                  if (ev.data === YT.PlayerState.PLAYING && !curRm.videoSync?.playing) {
                    lastExpectedYtSec = curT;
                    lastExpectedYtTs = Date.now();
                    broadcastSyncUpdate(curRm, { playing: true, seekSec: curT });
                  } else if (ev.data === YT.PlayerState.PAUSED && curRm.videoSync?.playing) {
                    lastExpectedYtSec = curT;
                    lastExpectedYtTs = Date.now();
                    broadcastSyncUpdate(curRm, { playing: false, seekSec: curT });
                  }
                }
              }
            });
            return;
          } catch {}
        }
        const startSec = Math.floor(computeTarget(currentSyncState || vs, Date.now()));
        targetNode.innerHTML = `<iframe src="https://www.youtube.com/embed/${esc(vidId)}?autoplay=${vs.playing ? 1 : 0}&start=${startSec}&rel=0&playsinline=1&enablejsapi=1" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen title="Synced Room Video"></iframe>`;
      });
      if (mountNode && !window.YT) {
        mountNode.style.background = '#000';
      }
    }

    startSyncLoop();
    updateControlsUI();
  }

  function syncRoom(rm, slotEl) {
    initCrossTabChannel();
    if (!rm || !slotEl) return;
    if (rm.mode !== 'video') {
      if (mountedSourceKey || slotEl.innerHTML) destroy();
      return;
    }
    slotElRef = slotEl;
    const vs = normSync(rm.videoSync, rm.youtubeId || '');
    const srcKey = (vs.videoId || vs.videoUrl) ? `${vs.kind}:${vs.videoId || vs.videoUrl}` : '';
    const needsMount = activeRoomId !== rm.id || mountedSourceKey !== srcKey || !slotEl.querySelector('[data-testid="pfs-video-card"]');
    if (needsMount) {
      mountVideoCard(rm, slotEl, vs);
    } else {
      applyRemoteState(vs, false);
    }
  }

  function handleAction(rm, act) {
    if (!rm) return;
    const vs = normSync(rm.videoSync, rm.youtubeId || '');
    if (act === 'theater') {
      theaterMode = !theaterMode;
      updateControlsUI();
      return;
    }
    if (!vs.videoId && !vs.videoUrl) return;
    const curSec = Math.max(0, Math.round(getLocalTime() * 10) / 10);
    if (act === 'toggle') {
      const nextPlaying = !vs.playing;
      broadcastSyncUpdate(rm, { playing: nextPlaying, seekSec: curSec }, `${me.name} ${nextPlaying ? 'played' : 'paused'} video at ${fmtClock(curSec)}`);
    } else if (act === 'back10') {
      const target = Math.max(0, Math.round((curSec - 10) * 10) / 10);
      broadcastSyncUpdate(rm, { seekSec: target }, `${me.name} jumped -10s (${fmtClock(target)})`);
    } else if (act === 'fwd10') {
      const dur = getDuration() || vs.durationSec || 0;
      const raw = curSec + 10;
      const target = dur > 0 ? Math.min(dur, raw) : raw;
      broadcastSyncUpdate(rm, { seekSec: Math.round(target * 10) / 10 }, `${me.name} skipped +10s (${fmtClock(target)})`);
    } else if (act === 'resync') {
      forcedLocalAdSim = false;
      wasInAd = false;
      localViewerStatus = 'synced';
      reportLocalViewerState(rm, 'synced', 0, true);
      applyRemoteState(vs, true);
      const liveSec = computeTarget(vs, Date.now());
      if (typeof toast === 'function') toast(`Synced to live ${fmtClock(liveSec)}`);
    }
  }

  function syncSpeaker(on) {
    try {
      if (htmlVideoEl) htmlVideoEl.muted = !on;
      if (ytPlayer && ytReady) {
        if (on && typeof ytPlayer.unMute === 'function') ytPlayer.unMute();
        else if (!on && typeof ytPlayer.mute === 'function') ytPlayer.mute();
      }
    } catch {}
  }

  function setLocalAdStateForTest(inAd) {
    forcedLocalAdSim = Boolean(inAd);
    const rm = partyRooms.find(r => r.id === activeRoomId);
    if (!rm) return;
    if (forcedLocalAdSim) {
      wasInAd = true;
      localViewerStatus = 'ad';
      reportLocalViewerState(rm, 'ad', 15, true);
    } else {
      wasInAd = false;
      localViewerStatus = 'synced';
      reportLocalViewerState(rm, 'synced', 0, true);
      if (currentSyncState) applyRemoteState(currentSyncState, true);
    }
    updateControlsUI();
  }

  return {
    syncRoom,
    handleAction,
    broadcastSyncUpdate,
    syncSpeaker,
    destroy,
    updateControlsUI,
    setLocalAdStateForTest,
    getCurrentState: () => currentSyncState,
    getLocalViewerStatus: () => localViewerStatus
  };
})();
window.PartyVideoSync = PartyVideoSync;

/* ===== 4-User Peer-to-Peer WebRTC Audio Mesh (Mic Seats 0..3 -> Room Audio) ===== */
const PartyWebRtcMesh = (() => {
  let localStream = null;
  let roomKey = '';
  let signalUnsub = null;
  const seenSignalIds = new Set();
  const peers = new Map();
  const remoteAudios = new Map();
  const iceConfig = {
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
  };

  function unsubscribeSignals() {
    if (typeof signalUnsub === 'function') {
      try { signalUnsub(); } catch {}
    }
    signalUnsub = null;
    seenSignalIds.clear();
  }

  function subscribeSignals(currentRoomId) {
    if (!currentRoomId || String(currentRoomId).startsWith('pr_seed_')) return;
    if (roomKey === currentRoomId && signalUnsub) return;
    unsubscribeSignals();
    roomKey = currentRoomId;
    if (!online || !db || !F || typeof F.onSnapshot !== 'function') return;
    try {
      const q = F.query(
        F.collection(db, 'party_rooms', currentRoomId, 'webrtc_signals'),
        F.where('to', '==', uid)
      );
      signalUnsub = F.onSnapshot(q, snap => {
        snap.docs.forEach(d => {
          if (seenSignalIds.has(d.id)) return;
          seenSignalIds.add(d.id);
          const sig = d.data();
          handleSignalDoc(currentRoomId, sig);
          dbOp(() => F.deleteDoc(F.doc(db, 'party_rooms', currentRoomId, 'webrtc_signals', d.id)));
        });
      }, () => {});
    } catch {}
  }

  function getRemoteAudioEl(remoteUid) {
    let a = remoteAudios.get(remoteUid);
    if (!a) {
      a = document.createElement('audio');
      a.autoplay = true;
      a.playsInline = true;
      a.muted = !partySpeakerOn;
      document.body.appendChild(a);
      remoteAudios.set(remoteUid, a);
    }
    return a;
  }

  async function enableMic(shouldUnmute = true) {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast('Microphone not supported in this browser');
      return false;
    }
    if (!localStream) {
      try {
        localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      } catch {
        toast('Mic permission denied');
        return false;
      }
    }
    localStream.getAudioTracks().forEach(t => { t.enabled = Boolean(shouldUnmute); });
    return true;
  }

  function setMicMuted(muted) {
    if (!localStream) return;
    localStream.getAudioTracks().forEach(t => { t.enabled = !muted; });
  }

  function syncSpeaker(on) {
    remoteAudios.forEach(a => { a.muted = !on; });
  }

  function createPeer(remoteUid, currentRoomId) {
    if (peers.has(remoteUid)) return peers.get(remoteUid);
    const pc = new RTCPeerConnection(iceConfig);
    if (localStream) {
      localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
    }
    pc.ontrack = ev => {
      const audioEl = getRemoteAudioEl(remoteUid);
      if (ev.streams && ev.streams[0]) audioEl.srcObject = ev.streams[0];
    };
    pc.onicecandidate = ev => {
      if (!ev.candidate || !online || !db || !F || !currentRoomId) return;
      const sigId = `${currentRoomId}_${uid}_${remoteUid}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 5)}`;
      dbOp(() => F.setDoc(F.doc(db, 'party_rooms', currentRoomId, 'webrtc_signals', sigId), {
        from: uid,
        to: remoteUid,
        kind: 'ice',
        payload: JSON.stringify(ev.candidate),
        ts: Date.now()
      }));
    };
    peers.set(remoteUid, pc);
    return pc;
  }

  async function syncMicPeers(rm) {
    if (!rm || !rm.id) return;
    subscribeSignals(rm.id);
    const micUids = Object.entries(rm.seats || {})
      .filter(([k, s]) => s && s.uid && isMicSeatIndex(k) && !s.muted)
      .map(([, s]) => s.uid)
      .slice(0, MIC_SEAT_LIMIT);

    const iAmActiveMic = micUids.includes(uid);
    if (!iAmActiveMic) {
      setMicMuted(true);
    }

    [...peers.keys()].forEach(pUid => {
      if (!micUids.includes(pUid)) {
        try { peers.get(pUid).close(); } catch {}
        peers.delete(pUid);
      }
    });

    if (!online || !db || !F || String(rm.id).startsWith('pr_seed_')) return;

    for (const targetUid of micUids) {
      if (targetUid === uid || peers.has(targetUid)) continue;
      const shouldOffer = iAmActiveMic ? (String(uid) < String(targetUid)) : true;
      if (shouldOffer) {
        const pc = createPeer(targetUid, rm.id);
        try {
          const offer = await pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: false });
          await pc.setLocalDescription(offer);
          const sigId = `${rm.id}_${uid}_${targetUid}_offer_${Date.now().toString(36)}`;
          await dbOp(() => F.setDoc(F.doc(db, 'party_rooms', rm.id, 'webrtc_signals', sigId), {
            from: uid,
            to: targetUid,
            kind: 'offer',
            payload: JSON.stringify(offer),
            ts: Date.now()
          }));
        } catch {}
      }
    }
  }

  async function handleSignalDoc(currentRoomId, sig) {
    if (!sig || sig.to !== uid || !sig.from || sig.from === uid) return;
    try {
      const data = JSON.parse(sig.payload || '{}');
      const pc = createPeer(sig.from, currentRoomId);
      if (sig.kind === 'offer') {
        await pc.setRemoteDescription(new RTCSessionDescription(data));
        const ans = await pc.createAnswer();
        await pc.setLocalDescription(ans);
        const sigId = `${currentRoomId}_${uid}_${sig.from}_ans_${Date.now().toString(36)}`;
        await dbOp(() => F.setDoc(F.doc(db, 'party_rooms', currentRoomId, 'webrtc_signals', sigId), {
          from: uid,
          to: sig.from,
          kind: 'answer',
          payload: JSON.stringify(ans),
          ts: Date.now()
        }));
      } else if (sig.kind === 'answer' && pc.signalingState === 'have-local-offer') {
        await pc.setRemoteDescription(new RTCSessionDescription(data));
      } else if (sig.kind === 'ice') {
        await pc.addIceCandidate(new RTCIceCandidate(data)).catch(() => {});
      }
    } catch {}
  }

  function cleanup() {
    unsubscribeSignals();
    peers.forEach(pc => { try { pc.close(); } catch {} });
    peers.clear();
    remoteAudios.forEach(a => { try { a.srcObject = null; a.remove(); } catch {} });
    remoteAudios.clear();
    if (localStream) {
      localStream.getTracks().forEach(t => { try { t.stop(); } catch {} });
      localStream = null;
    }
    roomKey = '';
  }

  return { enableMic, setMicMuted, syncSpeaker, syncMicPeers, subscribeSignals, unsubscribeSignals, handleSignalDoc, cleanup };
})();

/* ===== Presence Heartbeat, Seat-Order Host Handoff & Auto-Close Engine ===== */
let partyPresenceIv = 0;
let partySweepIv = 0;
let partyDocUnsub = null;
let partyDocRoomId = '';

function touchMyMemberInRoom(rm, nowMs = Date.now()) {
  if (!rm || !uid) return;
  const seatKey = findUserSeatKeyInRoom(rm, uid);
  const seatIdx = seatKey != null ? Number(seatKey) : null;
  const existing = rm.members && rm.members[uid] ? rm.members[uid] : null;
  rm.members = {
    ...(rm.members || {}),
    [uid]: {
      uid,
      name: (typeof me !== 'undefined' && me?.name) || existing?.name || 'Player',
      avatar: (typeof me !== 'undefined' && me?.avatar) || existing?.avatar || 'av_b1',
      frame: (typeof me !== 'undefined' && me?.frame) || existing?.frame || 'none',
      seatIdx,
      joinedAt: Number(existing?.joinedAt || nowMs),
      lastSeen: nowMs,
      connected: true
    }
  };
  if (seatKey != null && rm.seats && rm.seats[seatKey]) {
    rm.seats[seatKey] = {
      ...rm.seats[seatKey],
      lastSeen: nowMs,
      connected: true
    };
  }
}

function stopPartyPresenceLoop() {
  if (partyPresenceIv) { clearInterval(partyPresenceIv); partyPresenceIv = 0; }
  if (partySweepIv) { clearInterval(partySweepIv); partySweepIv = 0; }
}

function runRoomLifecycleSweep(roomOrId, opts) {
  const rid = typeof roomOrId === 'string' ? roomOrId : (roomOrId && roomOrId.id);
  const rm = typeof roomOrId === 'object' && roomOrId ? roomOrId : partyRooms.find(r => r && r.id === rid);
  if (!rm) return null;
  const rules = PRR();
  if (!rules || typeof rules.reconcileRoomLifecycle !== 'function') return null;

  const now = Number((opts && opts.nowMs) || Date.now());
  const res = rules.reconcileRoomLifecycle(rm, {
    nowMs: now,
    staleMs: (opts && opts.staleMs) || rules.DEFAULT_STALE_MS,
    leavingUid: opts && opts.leavingUid ? opts.leavingUid : ''
  });
  if (!res || !res.changed) return res;

  if (res.closed) {
    partyRooms = partyRooms.filter(r => r && r.id !== rm.id);
    savePartyRoomsLocal();
    postPartyRoomBroadcast({ kind: 'room_closed', roomId: rm.id });
    if (!String(rm.id).startsWith('pr_seed_') && online && db && F) {
      F.deleteDoc(F.doc(db, 'party_rooms', rm.id)).catch(() => {
        const closedPayload = {
          ...res.room,
          hostUid: rm.creatorUid || rm.hostUid,
          status: 'closed',
          seats: {},
          members: {},
          expiresAt: now,
          updatedAt: now
        };
        if (typeof F.setDoc === 'function') {
          F.setDoc(F.doc(db, 'party_rooms', rm.id), closedPayload, { merge: true }).catch(() => {});
        }
      });
    }
    if ((activePartyRoomId === rm.id || minimizedPartyRoomId === rm.id) && !(opts && opts.skipCloseUi)) {
      closePartyRoom({ skipLeavePersist: true });
      if (!(opts && opts.silent) && typeof toast === 'function') {
        toast('Voice room closed (empty)');
      }
    }
    renderPartyHub();
    return res;
  }

  const nextRoom = normalizePartyRoom(res.room);
  const idx = partyRooms.findIndex(r => r && r.id === nextRoom.id);
  if (idx >= 0) partyRooms[idx] = nextRoom;
  else partyRooms = [nextRoom, ...partyRooms].slice(0, 24);
  savePartyRoomsLocal();

  if (res.hostTransferred && res.newHost && !(opts && opts.silent) && typeof toast === 'function') {
    toast(`👑 ${res.newHost.name} is now the Room Owner!`);
  }

  if (!(opts && opts.skipPersist)) {
    persistPartyRoom(nextRoom, { fullReplace: true, silentRender: Boolean(opts && opts.silent) });
  }
  return res;
}
window.runPartyRoomLifecycleSweep = runRoomLifecycleSweep;

function startPartyPresenceLoop(roomId) {
  stopPartyPresenceLoop();
  if (!roomId) return;

  partyPresenceIv = setInterval(() => {
    const curId = getCurrentVrRoomId();
    if (!curId || curId !== roomId) {
      stopPartyPresenceLoop();
      return;
    }
    const rm = partyRooms.find(r => r && r.id === curId);
    if (!rm) return;
    const now = Date.now();
    touchMyMemberInRoom(rm, now);
    rm.updatedAt = now;
    savePartyRoomsLocal();
    if (!String(rm.id).startsWith('pr_seed_') && online && db && F && typeof F.updateDoc === 'function') {
      const seatKey = findUserSeatKeyInRoom(rm, uid);
      const patch = { updatedAt: now, [`members.${uid}`]: rm.members[uid] };
      if (seatKey != null && rm.seats[seatKey]) {
        patch[`seats.${seatKey}`] = rm.seats[seatKey];
      }
      Promise.resolve(F.updateDoc(F.doc(db, 'party_rooms', rm.id), patch)).catch(() => {});
    }
    if (minimizedPartyRoomId === curId) renderFloatingVrPill();
  }, 6000);

  partySweepIv = setInterval(() => {
    const curId = getCurrentVrRoomId();
    if (!curId || curId !== roomId) return;
    const rm = partyRooms.find(r => r && r.id === curId);
    if (!rm) return;
    runRoomLifecycleSweep(rm);
  }, 8000);
}

function unsubscribeActiveRoomDoc() {
  if (partyDocUnsub) {
    try { partyDocUnsub(); } catch {}
    partyDocUnsub = null;
  }
  partyDocRoomId = '';
}

function subscribeActiveRoomDoc(roomId) {
  if (!roomId || String(roomId).startsWith('pr_seed_')) {
    unsubscribeActiveRoomDoc();
    return;
  }
  if (partyDocRoomId === roomId && partyDocUnsub) return;
  unsubscribeActiveRoomDoc();
  partyDocRoomId = roomId;
  if (!online || !db || !F || typeof F.onSnapshot !== 'function') return;
  try {
    partyDocUnsub = F.onSnapshot(F.doc(db, 'party_rooms', roomId), snap => {
      if (!snap.exists()) {
        if (getCurrentVrRoomId() === roomId) {
          partyRooms = partyRooms.filter(r => r && r.id !== roomId);
          savePartyRoomsLocal();
          closePartyRoom({ skipLeavePersist: true });
          renderPartyHub();
          if (typeof toast === 'function') toast('Voice room has ended');
        }
        return;
      }
      const data = normalizePartyRoom({ id: snap.id, ...(snap.data() || {}) });
      if (!data) return;
      if (data.status === 'closed') {
        handleIncomingPartyRoomBroadcast({ kind: 'room_closed', roomId });
        return;
      }
      const prev = partyRooms.find(r => r && r.id === roomId);
      const rules = PRR();
      const snapNow = Date.now();
      if (prev) {
        if (rules) {
          data.chat = rules.mergeRoomChatMessages([prev.chat, data.chat], Array.from(partyDeletedMsgIds), 45);
          data.reactions = rules.mergeRoomReactions([prev.reactions, data.reactions], 24);
        }
        // Preserve recent local viewer ad/buffering states across concurrent snapshots
        const mergedViewerStates = { ...(data.videoViewerStates || {}) };
        Object.entries(prev.videoViewerStates || {}).forEach(([k, v]) => {
          if (!v || !v.ts) return;
          if (snapNow - Number(v.ts) < 18000 && (!mergedViewerStates[k] || Number(v.ts) > Number(mergedViewerStates[k].ts || 0))) {
            mergedViewerStates[k] = v;
          }
        });
        data.videoViewerStates = mergedViewerStates;
      }
      const idx = partyRooms.findIndex(r => r && r.id === roomId);
      if (idx >= 0) partyRooms[idx] = data;
      else partyRooms = [data, ...partyRooms].slice(0, 24);
      savePartyRoomsLocal();

      if (data.kickedUids && data.kickedUids.includes(uid) && !isSingleOwner(data, uid)) {
        closePartyRoom({ skipLeavePersist: true });
        if (typeof toast === 'function') toast('You were removed from the room by Owner');
        return;
      }

      PartyWebRtcMesh.syncMicPeers(data);
      if (activePartyRoomId === roomId) {
        syncReactionsFromList(data, data.reactions);
        renderFullScreenPartyRoom();
      } else if (minimizedPartyRoomId === roomId) {
        renderFloatingVrPill();
      }
      renderPartyHub();
    }, () => {});
  } catch {}
}

/* ===== Persistence & Hub Rendering ===== */
function savePartyRoomsLocal() {
  ls.set('sg_party_rooms', (partyRooms || []).filter(r => r && r.status !== 'closed').slice(0, 24));
}

function writePartyRoomToFirestore(room, fullReplace) {
  if (!room || !room.id || String(room.id).startsWith('pr_seed_')) return;
  if (!online || !db || !F || typeof F.setDoc !== 'function') return;
  const ref = F.doc(db, 'party_rooms', room.id);
  const op = fullReplace ? F.setDoc(ref, room) : F.setDoc(ref, room, { merge: true });
  Promise.resolve(op).catch(() => {
    // Graceful compatibility fallback if remote Firebase rules haven't redeployed hostUid transfer yet:
    // Keep original creatorUid in hostUid while persisting activeHostUid/activeHostName + seats + members!
    if (room.creatorUid && room.hostUid !== room.creatorUid) {
      const compatDoc = {
        ...room,
        hostUid: room.creatorUid,
        activeHostUid: room.activeHostUid || room.hostUid,
        activeHostName: room.activeHostName || room.hostName
      };
      const retry = fullReplace ? F.setDoc(ref, compatDoc) : F.setDoc(ref, compatDoc, { merge: true });
      Promise.resolve(retry).catch(() => {});
    }
  });
}

function persistPartyRoom(room, opts) {
  if (!room || !room.id) return;
  const o = opts || {};
  room.seats = normalizePartySeats(room.seats);
  const rules = PRR();
  if (rules && typeof rules.normalizeMembersMap === 'function') {
    room.members = rules.normalizeMembersMap(room, Date.now());
  }
  room.activeHostUid = room.activeHostUid || room.hostUid;
  room.activeHostName = room.activeHostName || room.hostName;
  room.updatedAt = Date.now();
  const idx = partyRooms.findIndex(r => r.id === room.id);
  if (idx >= 0) partyRooms[idx] = room;
  else partyRooms = [room, ...partyRooms].slice(0, 24);
  savePartyRoomsLocal();

  writePartyRoomToFirestore(room, Boolean(o.fullReplace));

  postPartyRoomBroadcast({ kind: 'room_update', roomId: room.id, room });

  if (!o.silentRender) {
    PartyWebRtcMesh.syncMicPeers(room);
    renderPartyHub();
    if (activePartyRoomId === room.id) renderFullScreenPartyRoom();
    else if (minimizedPartyRoomId === room.id) renderFloatingVrPill();
  }
}

function ingestPartyRooms(list) {
  const now = Date.now();
  const rules = PRR();
  const prevById = new Map((partyRooms || []).filter(r => r && r.id).map(r => [r.id, r]));
  const live = (Array.isArray(list) ? list : [])
    .filter(r => r && r.id && r.status !== 'closed' && (!r.expiresAt || Number(r.expiresAt) > now))
    .map(normalizePartyRoom)
    .filter(Boolean)
    .filter(r => r.status !== 'closed')
    .filter(r => !(partySeedsCleared() && isFakeOrStalePartyRoom(r)))
    .map(rm => {
      const prev = prevById.get(rm.id);
      if (prev) {
        if (prev.videoSync && rm.videoSync) {
          const pSeq = Number(prev.videoSync.seq || 0);
          const rSeq = Number(rm.videoSync.seq || 0);
          const pTs = Number(prev.videoSync.updatedAt || 0);
          const rTs = Number(rm.videoSync.updatedAt || 0);
          if ((pSeq > rSeq && now - pTs < 15000) || (pSeq === rSeq && pTs > rTs && now - pTs < 6000)) {
            rm.videoSync = prev.videoSync;
            rm.youtubeId = prev.youtubeId;
          }
        }
        if (rules) {
          rm.chat = rules.mergeRoomChatMessages([prev.chat, rm.chat], Array.from(partyDeletedMsgIds), 45);
          rm.reactions = rules.mergeRoomReactions([prev.reactions, rm.reactions], 24);
        }
        const mergedViewerStates = { ...(rm.videoViewerStates || {}) };
        Object.entries(prev.videoViewerStates || {}).forEach(([k, v]) => {
          if (!v || !v.ts) return;
          if (now - Number(v.ts) < 18000 && (!mergedViewerStates[k] || Number(v.ts) > Number(mergedViewerStates[k].ts || 0))) {
            mergedViewerStates[k] = v;
          }
        });
        rm.videoViewerStates = mergedViewerStates;
      }
      return rm;
    });

  const curVrId = getCurrentVrRoomId();
  if (live.length) {
    const liveIds = new Set(live.map(l => l.id));
    const activeLocal = curVrId ? prevById.get(curVrId) : null;
    const keptActive = (activeLocal && activeLocal.status !== 'closed' && !liveIds.has(activeLocal.id) && now - Number(activeLocal.updatedAt || 0) < 12000) ? [activeLocal] : [];
    const seeds = partySeedsCleared() ? [] : buildSeedPartyRooms().filter(s => !liveIds.has(s.id));
    partyRooms = [...keptActive, ...live, ...seeds].slice(0, 24);
  } else if (partySeedsCleared()) {
    partyRooms = (partyRooms || []).filter(r => !isFakeOrStalePartyRoom(r));
  }
  savePartyRoomsLocal();
  const curRoom = partyRooms.find(r => r.id === curVrId);
  if (curRoom) {
    if (curRoom.kickedUids && curRoom.kickedUids.includes(uid) && !isSingleOwner(curRoom, uid)) {
      closePartyRoom({ skipLeavePersist: true });
      toast('You were removed from the room by Owner');
      return;
    }
    PartyWebRtcMesh.syncMicPeers(curRoom);
    if (activePartyRoomId === curRoom.id) {
      syncReactionsFromList(curRoom, curRoom.reactions);
    }
  }
  renderPartyHub();
  if (activePartyRoomId) renderFullScreenPartyRoom();
  else if (minimizedPartyRoomId) renderFloatingVrPill();
}

function parseYouTubeVideoId(input) {
  if (window.ShowGamesRules && typeof window.ShowGamesRules.parseYouTubeId === 'function') {
    return window.ShowGamesRules.parseYouTubeId(input);
  }
  const s = String(input || '').trim();
  if (!s) return '';
  if (/^[a-zA-Z0-9_-]{11}$/.test(s)) return s;
  const m = s.match(/(?:v=|youtu\.be\/|embed\/|shorts\/|live\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : '';
}

/* ===== VR Chat & Emoji Reactions Live Sync (Firestore Subcollection + Doc + BroadcastChannel) ===== */
let partyMsgUnsub = null;
let partyMsgRoomId = '';
let partySubcolMsgs = [];
let partySubcolReactions = [];
const partyDeletedMsgIds = new Set();

function unsubscribeRoomMessages() {
  if (partyMsgUnsub) {
    try { partyMsgUnsub(); } catch {}
    partyMsgUnsub = null;
  }
  partyMsgRoomId = '';
  partySubcolMsgs = [];
  partySubcolReactions = [];
}

function subscribeRoomMessages(roomId) {
  if (!roomId || String(roomId).startsWith('pr_seed_')) {
    unsubscribeRoomMessages();
    return;
  }
  if (partyMsgRoomId === roomId && partyMsgUnsub) return;
  unsubscribeRoomMessages();
  partyMsgRoomId = roomId;
  if (!online || !db || !F || typeof F.onSnapshot !== 'function') return;
  try {
    const col = F.collection(db, 'party_rooms', roomId, 'messages');
    const q = (typeof F.query === 'function' && typeof F.orderBy === 'function' && typeof F.limit === 'function')
      ? F.query(col, F.orderBy('ts', 'asc'), F.limit(80))
      : col;
    partyMsgUnsub = F.onSnapshot(q, snap => {
      const nextMsgs = [];
      const nextRx = [];
      snap.docs.forEach(d => {
        const data = d.data() || {};
        const item = { ...data, id: data.id || d.id };
        if (item.type === 'reaction' && (item.emoji || item.text)) {
          nextRx.push({ ...item, emoji: item.emoji || item.text });
        } else {
          nextMsgs.push(item);
        }
      });
      partySubcolMsgs = nextMsgs;
      partySubcolReactions = nextRx;
      const rm = partyRooms.find(r => r && r.id === roomId);
      if (rm && activePartyRoomId === roomId) {
        syncReactionsFromList(rm, nextRx);
        renderFullScreenPartyRoom();
      }
    }, () => {});
  } catch {}
}

function getMergedPartyMessages(rm) {
  const inlineMsgs = Array.isArray(rm?.chat) ? rm.chat : [];
  const subMsgs = (rm && rm.id === partyMsgRoomId) ? partySubcolMsgs : [];
  const bcMsgs = (rm && partyBcMsgsByRoom.get(rm.id)) || [];
  const deletedList = Array.from(partyDeletedMsgIds);
  const rules = PRR();
  if (rules && typeof rules.mergeRoomChatMessages === 'function') {
    return rules.mergeRoomChatMessages([inlineMsgs, subMsgs, bcMsgs], deletedList, 40);
  }
  if (window.ShowGamesRules && typeof window.ShowGamesRules.mergeRoomMessages === 'function') {
    return window.ShowGamesRules.mergeRoomMessages(inlineMsgs, [...subMsgs, ...bcMsgs], deletedList).slice(-35);
  }
  const byId = new Map();
  [...inlineMsgs, ...subMsgs, ...bcMsgs].forEach(m => {
    if (!m || !m.id || m.type === 'reaction' || partyDeletedMsgIds.has(m.id)) return;
    byId.set(m.id, m);
  });
  return Array.from(byId.values()).sort((a, b) => Number(a.ts || 0) - Number(b.ts || 0)).slice(-35);
}

function canDeletePartyMessage(msg) {
  if (!msg || msg.type === 'sys' || !msg.id) return false;
  const isDev = typeof isDevSession === 'function' ? isDevSession() : (typeof devMode !== 'undefined' && devMode);
  if (window.ShowGamesRules && typeof window.ShowGamesRules.canDeleteChatMessage === 'function') {
    return window.ShowGamesRules.canDeleteChatMessage({ msgUid: msg.uid, currentUid: uid, isDev });
  }
  return Boolean(isDev || (msg.uid && uid && msg.uid === uid));
}

function sendPartyChatMessage(rm, txt) {
  if (!rm || !txt) return;
  const cleanText = String(txt).trim().slice(0, 160);
  if (!cleanText) return;
  const now = Date.now();
  const msg = {
    id: 'c_' + now.toString(36) + '_' + Math.random().toString(36).slice(2, 6),
    type: 'text',
    uid,
    name: me.name || 'Player',
    text: cleanText,
    ts: now
  };
  const rules = PRR();
  rm.chat = rules
    ? rules.mergeRoomChatMessages([rm.chat, [msg]], Array.from(partyDeletedMsgIds), 45)
    : [...(rm.chat || []), msg].slice(-45);
  if (rm.id === partyMsgRoomId) {
    partySubcolMsgs = [...partySubcolMsgs.filter(m => m.id !== msg.id), msg].slice(-60);
  }
  const bcList = partyBcMsgsByRoom.get(rm.id) || [];
  partyBcMsgsByRoom.set(rm.id, [...bcList.filter(m => m.id !== msg.id), msg].slice(-60));

  postPartyRoomBroadcast({ kind: 'chat', roomId: rm.id, message: msg });
  if (!String(rm.id).startsWith('pr_seed_') && online && db && F && typeof F.setDoc === 'function') {
    dbOp(() => F.setDoc(F.doc(db, 'party_rooms', rm.id, 'messages', msg.id), msg));
  }
  persistPartyRoom(rm);
}

function deletePartyChatMessage(rm, msgId) {
  if (!rm || !msgId) return;
  const allMsgs = getMergedPartyMessages(rm);
  const target = allMsgs.find(m => m && m.id === msgId);
  if (!target || !canDeletePartyMessage(target)) {
    return toast('You can only delete your own messages');
  }
  partyDeletedMsgIds.add(msgId);
  rm.chat = (rm.chat || []).filter(m => m && m.id !== msgId);
  if (rm.id === partyMsgRoomId) {
    partySubcolMsgs = partySubcolMsgs.filter(m => m && m.id !== msgId);
  }
  const bcList = partyBcMsgsByRoom.get(rm.id) || [];
  partyBcMsgsByRoom.set(rm.id, bcList.filter(m => m && m.id !== msgId));
  if (!String(rm.id).startsWith('pr_seed_') && online && db && F && typeof F.deleteDoc === 'function') {
    dbOp(() => F.deleteDoc(F.doc(db, 'party_rooms', rm.id, 'messages', msgId)));
  }
  persistPartyRoom(rm, { fullReplace: true });
  toast('Message deleted');
}

function triggerPartyReactionFx(rm, rx) {
  if (!rm || !rx || !rx.id || !rx.emoji) return;
  if (seenPartyReactionIds.has(rx.id)) return;
  seenPartyReactionIds.add(rx.id);
  if (seenPartyReactionIds.size > 160) {
    const first = seenPartyReactionIds.values().next().value;
    if (first) seenPartyReactionIds.delete(first);
  }

  // Only animate fresh reactions (< 12s old) so old history doesn't burst on room enter
  const now = Date.now();
  if (now - Number(rx.ts || now) > 12000) return;

  if (rx.uid) {
    activeSeatReactions.set(rx.uid, { emoji: rx.emoji, expiresAt: now + 3200 });
    setTimeout(() => {
      const cur = activeSeatReactions.get(rx.uid);
      if (cur && cur.expiresAt <= Date.now()) {
        activeSeatReactions.delete(rx.uid);
        if (activePartyRoomId === rm.id) renderFullScreenPartyRoom();
      }
    }, 3300);
  }

  const root = document.getElementById('partyFsRoot');
  if (!root || activePartyRoomId !== rm.id) return;

  const fxLayer = root.querySelector('#pfsFxLayer');
  if (fxLayer) {
    const el = document.createElement('div');
    el.className = 'pfs-rx-float';
    el.dataset.testid = 'vr-floating-emoji';
    const leftPct = 14 + Math.floor(Math.random() * 72);
    el.style.left = `${leftPct}%`;
    el.innerHTML = `<span class="pfs-rx-em">${esc(rx.emoji)}</span><span class="pfs-rx-who">${esc(rx.name || 'Player')}</span>`;
    fxLayer.appendChild(el);
    setTimeout(() => { try { el.remove(); } catch {} }, 2300);
  }

  const ticker = root.querySelector('#pfsRxTicker');
  if (ticker) {
    ticker.innerHTML = `<span class="pfs-rx-chip">${esc(rx.emoji)} <b>${esc(rx.name || 'Player')}</b> reacted</span>`;
    ticker.hidden = false;
    clearTimeout(ticker._hideTimer);
    ticker._hideTimer = setTimeout(() => {
      if (ticker) ticker.hidden = true;
    }, 3400);
  }

  // Refresh seat stage so sender's seat avatar shows live reaction bubble
  const stage = root.querySelector('#pfsStageSlot');
  if (stage) {
    stage.innerHTML = `
      <div class="pfs-owner-solo">${renderSeatTile(rm, 0)}</div>
      <div class="pfs-seats-4col">
        ${[1, 2, 3, 4, 5, 6, 7, 8].map(i => renderSeatTile(rm, i)).join('')}
      </div>
    `;
  }
}

function syncReactionsFromList(rm, list) {
  if (!rm || !Array.isArray(list) || !list.length) return;
  list.slice(-8).forEach(rx => {
    if (rx && rx.id && rx.emoji) triggerPartyReactionFx(rm, rx);
  });
}

function sendPartyReaction(rm, emoji) {
  if (!rm || !emoji) return;
  const now = Date.now();
  const seatKey = findUserSeatKeyInRoom(rm, uid);
  const rx = {
    id: 'rx_' + now.toString(36) + '_' + Math.random().toString(36).slice(2, 6),
    type: 'reaction',
    uid,
    name: me.name || 'Player',
    emoji: String(emoji).slice(0, 8),
    text: String(emoji).slice(0, 8),
    seatIdx: seatKey != null ? Number(seatKey) : null,
    ts: now
  };
  const rules = PRR();
  rm.reactions = rules
    ? rules.mergeRoomReactions([rm.reactions, [rx]], 24)
    : [...(rm.reactions || []), rx].slice(-24);
  const bcRx = partyBcReactionsByRoom.get(rm.id) || [];
  partyBcReactionsByRoom.set(rm.id, [...bcRx.filter(r => r.id !== rx.id), rx].slice(-30));

  if (typeof playSfx === 'function') playSfx('tap');
  triggerPartyReactionFx(rm, rx);
  postPartyRoomBroadcast({ kind: 'reaction', roomId: rm.id, reaction: rx });

  if (!String(rm.id).startsWith('pr_seed_') && online && db && F && typeof F.setDoc === 'function') {
    dbOp(() => F.setDoc(F.doc(db, 'party_rooms', rm.id, 'messages', rx.id), rx));
  }
  persistPartyRoom(rm);
}

/* ===== Floating VR Icon Mode + Game Launch Guard ===== */
function removeFloatingVrPill() {
  const existing = document.getElementById('vrFloatingPill');
  if (existing) existing.remove();
}

function renderFloatingVrPill() {
  if (!minimizedPartyRoomId || activePartyRoomId) {
    removeFloatingVrPill();
    return;
  }
  const rm = partyRooms.find(r => r && r.id === minimizedPartyRoomId && r.status !== 'closed');
  if (!rm) {
    minimizedPartyRoomId = null;
    removeFloatingVrPill();
    return;
  }
  const rules = PRR();
  const activeCount = rules
    ? rules.getOrderedActiveMembers(rm, Date.now(), rules.DEFAULT_STALE_MS).length
    : Object.keys(rm.seats || {}).length;
  const mySeatKey = findUserSeatKeyInRoom(rm, uid);
  const mySeat = mySeatKey != null ? rm.seats[mySeatKey] : null;
  const micLive = mySeatKey != null && isMicSeatIndex(Number(mySeatKey)) && mySeat && !mySeat.muted;

  let pill = document.getElementById('vrFloatingPill');
  if (!pill) {
    pill = document.createElement('div');
    pill.id = 'vrFloatingPill';
    pill.className = 'vr-floating-pill';
    pill.dataset.testid = 'vr-floating-pill';
    pill.setAttribute('role', 'region');
    pill.setAttribute('aria-label', 'Active Voice Room');
    document.body.appendChild(pill);
  }

  pill.innerHTML = `
    <button type="button" class="vr-fp-main" data-testid="vr-floating-open" title="Return to VR Room">
      <span class="vr-fp-orb" aria-hidden="true">
        <span class="vr-fp-pulse"></span>
        <span class="vr-fp-ico">${micLive ? '🎙️' : '🎧'}</span>
      </span>
      <span class="vr-fp-info">
        <b class="vr-fp-title">${esc(rm.title)}</b>
        <small class="vr-fp-sub">VR Live · ${Math.max(1, activeCount)} active</small>
      </span>
    </button>
    <button type="button" class="vr-fp-exit" data-testid="vr-floating-exit" title="Leave VR Room" aria-label="Leave VR Room">✕</button>
  `;

  const openBtn = pill.querySelector('.vr-fp-main');
  if (openBtn) {
    openBtn.onclick = () => {
      if (minimizedPartyRoomId) openPartyRoom(minimizedPartyRoomId);
    };
  }
  const exitBtn = pill.querySelector('.vr-fp-exit');
  if (exitBtn) {
    exitBtn.onclick = (e) => {
      e.stopPropagation();
      closePartyRoom();
    };
  }
}

function minimizePartyRoom(opts) {
  const rid = activePartyRoomId || minimizedPartyRoomId;
  if (!rid) return false;
  const rm = partyRooms.find(r => r && r.id === rid);
  if (!rm) {
    closePartyRoom({ skipLeavePersist: true });
    return false;
  }
  minimizedPartyRoomId = rid;
  activePartyRoomId = null;
  // Keep presence heartbeat, WebRTC audio, and room/chat subscriptions alive while floating!
  PartyVideoSync.destroy();
  const root = document.getElementById('partyFsRoot');
  if (root) {
    root.dataset.mountedRoomId = '';
    root.classList.remove('open');
    root.hidden = true;
    root.innerHTML = '';
  }
  document.body.classList.remove('party-fs-lock');
  renderFloatingVrPill();
  if (!(opts && opts.silent) && typeof toast === 'function') {
    toast('VR room minimized to floating mode');
  }
  return true;
}
window.minimizePartyRoom = minimizePartyRoom;

function guardVrBeforeGameLaunch(gameLabel, proceedFn, opts) {
  const o = opts || {};
  const rules = PRR();
  const blocked = rules && typeof rules.shouldBlockGameLaunchForVr === 'function'
    ? rules.shouldBlockGameLaunchForVr({ activePartyRoomId, minimizedPartyRoomId, bypassVrGuard: Boolean(o.bypassVrGuard) })
    : (!o.bypassVrGuard && Boolean(activePartyRoomId || minimizedPartyRoomId));

  if (!blocked) return false;

  const vrRoomId = getCurrentVrRoomId();
  const rm = partyRooms.find(r => r && r.id === vrRoomId);
  const roomTitle = (rm && rm.title) || 'Voice Room';
  const targetLabel = String(gameLabel || 'Game');
  const amHost = Boolean(rm && rm.hostUid === uid);

  const m = modal('VR Session Active', `
    <div class="vr-guard-card" data-testid="vr-game-guard-modal">
      <div class="vr-guard-badge">🎧 VR ROOM RUNNING${amHost ? ' · OWNER' : ''}</div>
      <p class="vr-guard-msg">
        Your VR session <b>"${esc(roomTitle)}"</b> is currently active in floating mode.
        Exit VR first to open <b>${esc(targetLabel)}</b>, or return to your VR room.
      </p>
      <div class="vr-guard-actions">
        <button type="button" class="btn ok full" id="vrGuardReturnBtn" data-testid="vr-guard-return">Return to VR</button>
        <button type="button" class="btn red full" id="vrGuardExitOpenBtn" data-testid="vr-guard-exit-open">Exit VR &amp; Open ${esc(targetLabel)}</button>
      </div>
    </div>
  `);

  const retBtn = $('#vrGuardReturnBtn', m);
  if (retBtn) {
    retBtn.onclick = () => {
      m.close();
      if (vrRoomId) openPartyRoom(vrRoomId);
    };
  }
  const exitBtn = $('#vrGuardExitOpenBtn', m);
  if (exitBtn) {
    exitBtn.onclick = () => {
      m.close();
      closePartyRoom();
      if (typeof proceedFn === 'function') {
        setTimeout(() => proceedFn(), 40);
      }
    };
  }
  return true;
}
window.guardVrBeforeGameLaunch = guardVrBeforeGameLaunch;

function renderPartyHub() {
  if (typeof activeAppTab !== 'undefined' && activeAppTab !== 'tools') {
    if (typeof markTabsDirty === 'function') markTabsDirty('tools');
    return;
  }
  const host = $('#homePartyRooms') || $('#partyRoomsHost');
  if (!host) return;
  const now = Date.now();
  const rules = PRR();
  const rooms = (partyRooms || [])
    .filter(r => r && r.status !== 'closed' && (!r.expiresAt || Number(r.expiresAt) > now))
    .slice(0, 8);
  const isDev = typeof isDevSession === 'function' ? isDevSession() : (typeof devMode !== 'undefined' && devMode);
  host.innerHTML = `
    <div class="wp-sec-bar">
      <b>Voice &amp; Party</b>
      <div class="row" style="gap:6px">
        ${isDev ? '<button type="button" class="wp-pill-btn red" id="partyClearFakeBtn" title="Clear fake, seed, empty or stale voice rooms">🧹 Clear Fake</button>' : ''}
        <button type="button" class="wp-pill-btn gold" id="partyHostBtn">+ Host Room</button>
      </div>
    </div>
    ${rooms.length ? `<div class="party-grid">${rooms.map(rm => {
      const bgMeta = PARTY_BG_META[rm.background] || PARTY_BG_META.club;
      const modeMeta = PARTY_MODES_META[rm.mode] || PARTY_MODES_META.normal;
      const activeCount = rules
        ? rules.getOrderedActiveMembers(rm, now, rules.DEFAULT_STALE_MS).length
        : Object.values(normalizePartySeats(rm.seats)).filter(Boolean).length;
      const isMinimizedHere = minimizedPartyRoomId === rm.id;
      return `<button type="button" class="party-room-card glossy-card ${isMinimizedHere ? 'is-vr-floating' : ''}" data-openparty="${esc(rm.id)}" style="background:${bgMeta.css}">
        <div class="prc-top">
          <span class="prc-cat">${esc(rm.tag || modeMeta.badge)} · ${esc(modeMeta.name)}</span>
          <span class="prc-live">● ${activeCount} live</span>
        </div>
        <div class="prc-title">${esc(rm.title)}</div>
        <div class="prc-foot">
          <span class="prc-host-lbl">Owner: ${esc(rm.hostName || 'Owner')} · ID ${esc(rm.shortId)}</span>
          <span class="prc-join">${isMinimizedHere ? 'Resume →' : 'Enter →'}</span>
        </div>
      </button>`;
    }).join('')}</div>` : `<div class="mp-empty" style="margin-top:6px">No live voice rooms right now. Tap <b>+ Host Room</b> to start a real room!</div>`}`;

  if ($('#partyHostBtn', host)) {
    $('#partyHostBtn', host).onclick = () => openCreatePartyRoomModal();
  }
  if ($('#partyClearFakeBtn', host)) {
    $('#partyClearFakeBtn', host).onclick = () => clearFakeVoiceRooms();
  }
  host.onclick = e => {
    if (e.target.closest('#partyHostBtn') || e.target.closest('#partyClearFakeBtn')) return;
    const btn = e.target.closest('[data-openparty]');
    if (btn && btn.dataset.openparty) openPartyRoom(btn.dataset.openparty);
  };
}

function openCreatePartyRoomModal() {
  const m = modal('Host Voice Room', `
    <label for="prTitle">Room Title</label>
    <input id="prTitle" maxlength="36" placeholder="My Voice Lounge">
    <label for="prMode" style="margin-top:8px">Room Mode</label>
    <select id="prMode">
      <option value="normal">Normal Voice Room</option>
      <option value="video">Video Watch Together</option>
      <option value="acquaint">Acquaint Matchmaking</option>
      <option value="auction">Auction Stage</option>
      <option value="games">In-Room Games</option>
    </select>
    <label for="prBg" style="margin-top:8px">Background</label>
    <select id="prBg">
      ${Object.values(PARTY_BG_META).map(b => `<option value="${b.id}">${b.name}</option>`).join('')}
    </select>
    <button type="button" class="btn ok full" id="prCreateGo" style="margin-top:12px">Create Room</button>
  `);
  $('#prCreateGo', m).onclick = () => {
    const title = ($('#prTitle', m).value || '').trim() || `${me.name || 'Player'}'s Room`;
    const mode = $('#prMode', m).value || 'normal';
    const background = $('#prBg', m).value || 'club';
    const now = Date.now();
    const id = 'pr_' + now.toString(36) + Math.random().toString(36).slice(2, 5);
    const room = normalizePartyRoom({
      id,
      shortId: makeRoomShortId(id),
      status: 'active',
      title,
      tag: PARTY_MODES_META[mode].badge,
      mode,
      background,
      hostUid: uid,
      hostName: me.name || 'Player',
      admins: [],
      seats: {
        '0': { uid, name: me.name || 'Player', avatar: me.avatar || 'av_b1', frame: me.frame || 'fx_gold', muted: false, speaking: true, joinedAt: now, lastSeen: now, connected: true }
      },
      members: {
        [uid]: { uid, name: me.name || 'Player', avatar: me.avatar || 'av_b1', frame: me.frame || 'fx_gold', seatIdx: 0, joinedAt: now, lastSeen: now, connected: true }
      },
      reactions: [],
      videoViewerStates: {},
      chat: [{ id: 'sys_' + now, type: 'sys', text: `${me.name || 'Player'} opened room. Seats 0-3 = Mic (max 4), others = Listeners.`, ts: now }],
      createdAt: now,
      updatedAt: now
    });
    if (getCurrentVrRoomId() && getCurrentVrRoomId() !== id) {
      closePartyRoom({ silent: true });
    }
    persistPartyRoom(room, { fullReplace: true });
    m.close();
    openPartyRoom(id);
  };
}

function leavePartyRoomFully(roomId, opts) {
  if (!roomId) return;
  const rm = partyRooms.find(r => r && r.id === roomId);
  if (!rm) return;
  runRoomLifecycleSweep(rm, {
    leavingUid: uid,
    nowMs: Date.now(),
    skipCloseUi: true,
    silent: Boolean(opts && opts.silent)
  });
}

function closePartyRoom(opts) {
  const o = opts || {};
  const prevRoomId = getCurrentVrRoomId();
  activePartyRoomId = null;
  minimizedPartyRoomId = null;
  stopPartyPresenceLoop();
  unsubscribeActiveRoomDoc();
  unsubscribeRoomMessages();
  PartyVideoSync.destroy();
  PartyWebRtcMesh.cleanup();
  PartyAudioPlayer.stop();
  removeFloatingVrPill();

  if (prevRoomId && !o.skipLeavePersist) {
    leavePartyRoomFully(prevRoomId, { silent: Boolean(o.silent) });
  }

  const root = document.getElementById('partyFsRoot');
  if (root) {
    root.dataset.mountedRoomId = '';
    root.classList.remove('open');
    root.hidden = true;
    root.innerHTML = '';
  }
  document.body.classList.remove('party-fs-lock');
  if (typeof setMyLiveActivity === 'function') {
    setMyLiveActivity({ type: 'online' });
  }
  renderPartyHub();
}
window.closePartyRoom = closePartyRoom;

function openPartyRoom(roomId) {
  initPartyRoomBroadcastChannel();
  const room = partyRooms.find(r => r && r.id === roomId && r.status !== 'closed');
  if (!room) return toast('Room not found or already closed');
  if (room.kickedUids && room.kickedUids.includes(uid) && !isSingleOwner(room, uid)) {
    return toast('You cannot re-enter this room');
  }
  // If switching from another active/floating VR room, cleanly leave the previous room first
  const prevId = getCurrentVrRoomId();
  if (prevId && prevId !== roomId) {
    closePartyRoom({ silent: true });
  }

  activePartyRoomId = roomId;
  minimizedPartyRoomId = null;
  removeFloatingVrPill();

  const now = Date.now();
  touchMyMemberInRoom(room, now);
  // Seed reaction ids from history so entering a room doesn't replay old bursts
  (room.reactions || []).forEach(r => { if (r && r.id) seenPartyReactionIds.add(r.id); });

  const root = document.getElementById('partyFsRoot');
  if (!root) return;
  bindPartyRootDelegation(root);
  root.hidden = false;
  document.body.classList.add('party-fs-lock');
  requestAnimationFrame(() => root.classList.add('open'));

  if (typeof pushBackGuardState === 'function') {
    pushBackGuardState('party:' + roomId);
  }

  subscribeActiveRoomDoc(roomId);
  subscribeRoomMessages(roomId);
  startPartyPresenceLoop(roomId);
  PartyWebRtcMesh.syncMicPeers(room);
  if (room.musicUrl) PartyAudioPlayer.playUrl(room.musicUrl, room.musicTitle);
  if (typeof setMyLiveActivity === 'function') {
    setMyLiveActivity({ type: 'party', roomId: room.id, roomCode: room.shortId || room.id, gameName: room.title || 'Voice Room' });
  }
  persistPartyRoom(room);
  renderFullScreenPartyRoom();
}
window.openPartyRoomModal = openPartyRoom;
window.openPartyRoom = openPartyRoom;

// Auto-leave VR room cleanly when user closes tab, refreshes, or backgrounds PWA exit
if (!window.__sgPartyUnloadBound) {
  window.__sgPartyUnloadBound = true;
  const handlePageLeave = () => {
    const curId = getCurrentVrRoomId();
    if (!curId) return;
    leavePartyRoomFully(curId, { silent: true });
  };
  window.addEventListener('pagehide', handlePageLeave);
  window.addEventListener('beforeunload', handlePageLeave);
}

function renderSeatTile(rm, idx) {
  const seats = rm.seats || {};
  const s = seats[String(idx)];
  const micEligible = isMicSeatIndex(idx);
  const roleTag = micEligible ? `Mic #${idx + 1}` : 'Listener';

  if (!s) {
    return `<button type="button" class="pfs-seat empty compact" data-sit="${idx}" aria-label="Seat ${idx} (${roleTag})">
      <div class="pfs-seat-ring open-ring"><span>+</span></div>
      <div class="pfs-seat-name">${idx === 0 ? 'Owner' : `Seat ${idx}`}</div>
      <small class="pfs-seat-role">${roleTag}</small>
    </button>`;
  }

  const isOwnerSeat = s.uid === rm.hostUid;
  const isAdm = isRoomAdmin(rm, s.uid);
  const speaking = micEligible && !s.muted;
  const seatRx = activeSeatReactions.get(s.uid);
  const rxHtml = seatRx && seatRx.expiresAt > Date.now()
    ? `<span class="pfs-seat-rx" data-testid="vr-seat-reaction">${esc(seatRx.emoji)}</span>`
    : '';

  return `<div class="pfs-seat-wrap compact">
    <button type="button" class="pfs-seat occupied compact ${speaking ? 'is-speaking' : ''} ${s.uid === uid ? 'is-me' : ''}" data-seat-idx="${idx}" data-seat-uid="${esc(s.uid)}">
      <div class="pfs-seat-ring">
        ${speaking ? '<span class="pfs-wave w1"></span>' : ''}
        ${av(s, 44)}
        ${rxHtml}
        <span class="pfs-mic-dot ${!micEligible ? 'muted' : (s.muted ? 'muted' : 'live')}">${!micEligible ? '👂' : (s.muted ? '🔇' : '🎙️')}</span>
      </div>
      <div class="pfs-seat-name">${esc(s.name || 'Player')}</div>
      <div class="pfs-seat-meta">
        ${isOwnerSeat ? '<span class="pfs-owner-tag" data-testid="vr-owner-badge">OWNER</span>' : (isAdm ? '<span class="pfs-role-chip">ADMIN</span>' : `<span class="pfs-seat-role">${roleTag}</span>`)}
      </div>
    </button>
    ${s.uid === uid ? `<button type="button" class="pfs-quick-leave" data-pfs-act="leave-seat">Leave</button>` : ''}
  </div>`;
}

function renderFullScreenPartyRoom() {
  const root = document.getElementById('partyFsRoot');
  if (!root || !activePartyRoomId) return;
  const rm = partyRooms.find(r => r && r.id === activePartyRoomId && r.status !== 'closed');
  if (!rm) { closePartyRoom({ skipLeavePersist: true }); return; }

  const bgMeta = PARTY_BG_META[rm.background] || PARTY_BG_META.club;
  const modeMeta = PARTY_MODES_META[rm.mode] || PARTY_MODES_META.normal;
  const mySeatKey = findUserSeatKeyInRoom(rm, uid);
  const mySeat = mySeatKey != null ? rm.seats[mySeatKey] : null;
  const canSpeak = mySeatKey != null && isMicSeatIndex(Number(mySeatKey));
  const rules = PRR();
  const activeCount = rules
    ? rules.getOrderedActiveMembers(rm, Date.now(), rules.DEFAULT_STALE_MS).length
    : Object.keys(rm.seats || {}).length;

  root.style.background = bgMeta.css;

  // Mount shell once per room so chat/seat/mic updates NEVER destroy or reload the live video player!
  if (root.dataset.mountedRoomId !== rm.id || !root.querySelector('#pfsVideoSlot')) {
    root.dataset.mountedRoomId = rm.id;
    root.innerHTML = `
      <div class="pfs-shell pfs-v14">
        <div class="pfs-fx-layer" id="pfsFxLayer" data-testid="vr-fx-layer" aria-live="polite"></div>
        <header class="pfs-top-v14" id="pfsHdrSlot"></header>
        <div class="pfs-subbar" id="pfsSubbarSlot"></div>
        <div class="pfs-main-scroll">
          <div class="pfs-video-slot" id="pfsVideoSlot"></div>
          <div class="pfs-stage" id="pfsStageSlot"></div>
          <div class="pfs-rx-ticker" id="pfsRxTicker" data-testid="vr-reaction-ticker" hidden></div>
          <div class="pfs-react-dock" data-testid="vr-react-dock">
            ${PARTY_REACTIONS.map(em => `<button type="button" class="pfs-react-btn" data-react="${em}" aria-label="React ${em}">${em}</button>`).join('')}
          </div>
          <div class="pfs-chat-feed" id="pfsChatFeed" data-testid="vr-chat-feed"></div>
        </div>
        <div class="pfs-dock pfs-dock-v14" id="pfsDockSlot">
          <button type="button" class="pfs-dock-ico ${partySpeakerOn ? 'on' : 'off'}" id="pfsSpkBtn" data-pfs-act="toggle-speaker">${partySpeakerOn ? '🔊' : '🔈'}</button>
          <button type="button" class="pfs-dock-ico ${canSpeak ? (mySeat.muted ? 'muted' : 'live') : 'muted'}" id="pfsMicBtn" data-pfs-act="toggle-mic">${!canSpeak ? '👂' : (mySeat.muted ? '🔇' : '🎙️')}</button>
          <input id="pfsChatIn" maxlength="160" placeholder="Type message..." autocomplete="off">
          <button type="button" class="pfs-dock-send" data-pfs-act="send-chat" data-testid="vr-chat-send">➤</button>
          <button type="button" class="pfs-dock-ico gift" data-pfs-act="open-gift">🎁</button>
          <button type="button" class="pfs-dock-ico apps" data-pfs-act="open-music">♪</button>
        </div>
      </div>
    `;
  }

  const hdr = $('#pfsHdrSlot', root);
  if (hdr) {
    hdr.innerHTML = `
      <div class="pfs-hdr-left">
        <button type="button" class="pfs-hdr-btn" data-pfs-act="minimize" data-testid="vr-back-btn" title="Minimize to Floating VR" aria-label="Back to Floating VR">←</button>
        <div class="pfs-hdr-meta">
          <div class="pfs-hdr-title-row">
            <b class="pfs-title">${esc(rm.title)}</b>
            <span class="pfs-tag-txt">· ${esc(modeMeta.name)}</span>
          </div>
          <div class="pfs-hdr-id-row">
            <span class="pfs-id-btn" data-testid="vr-owner-header">Owner: ${esc(rm.hostName)} · ${Math.max(1, activeCount)} live · ID ${esc(rm.shortId)}</span>
          </div>
        </div>
      </div>
      <div class="pfs-hdr-right">
        <button type="button" class="pfs-hdr-btn" data-pfs-act="open-invite" title="Invite Friends to Voice Room" aria-label="Invite to Room">👥</button>
        <button type="button" class="pfs-hdr-btn" data-pfs-act="open-music" title="Music">♪</button>
        <button type="button" class="pfs-hdr-btn" data-pfs-act="open-modes" title="Modes">⊞</button>
        <button type="button" class="pfs-hdr-btn exit" data-pfs-act="exit-room" data-testid="vr-exit-btn" title="Leave VR Room" aria-label="Leave VR Room">✕</button>
      </div>
    `;
  }

  const subbar = $('#pfsSubbarSlot', root);
  if (subbar) {
    subbar.innerHTML = `
      <button type="button" class="pfs-music-pill ${rm.musicPlaying ? 'playing' : ''}" data-pfs-act="open-music">
        <span>♪</span>
        <span class="pfs-music-lbl">${esc(rm.musicTitle || (rm.musicUrl ? 'Audio Stream' : 'No Song'))}</span>
      </button>
      <div class="pfs-subbar-right">
        <button type="button" class="pfs-mode-chip" data-pfs-act="open-modes">${esc(modeMeta.name)} ▾</button>
        <span class="pfs-turn-chip">${canSpeak ? '🎙️ Mic Seat (0-3)' : '👂 Listener'}</span>
      </div>
    `;
  }

  const videoSlot = $('#pfsVideoSlot', root);
  if (videoSlot) {
    PartyVideoSync.syncRoom(rm, videoSlot);
  }

  const stage = $('#pfsStageSlot', root);
  if (stage) {
    stage.innerHTML = `
      <div class="pfs-owner-solo">${renderSeatTile(rm, 0)}</div>
      <div class="pfs-seats-4col">
        ${[1, 2, 3, 4, 5, 6, 7, 8].map(i => renderSeatTile(rm, i)).join('')}
      </div>
    `;
  }

  const feed = $('#pfsChatFeed', root);
  if (feed) {
    const msgsHtml = getMergedPartyMessages(rm).slice(-28).map(c => {
      if (c.type === 'sys') return `<div class="pfs-msg sys">${esc(c.text)}</div>`;
      const canDel = canDeletePartyMessage(c);
      return `<div class="pfs-msg pfs-msg-row" data-pmsg-id="${esc(c.id)}">
        <div class="pfs-msg-body"><b>${esc(c.name)}:</b> <span>${esc(c.text)}</span></div>
        ${canDel ? `<button type="button" class="pfs-msg-del" data-del-pmsg="${esc(c.id)}" title="Delete message" aria-label="Delete message">🗑️</button>` : ''}
      </div>`;
    }).join('');
    if (feed.dataset.lastHtml !== msgsHtml) {
      feed.dataset.lastHtml = msgsHtml;
      feed.innerHTML = msgsHtml;
      feed.scrollTop = feed.scrollHeight;
    }
  }

  const spkBtn = $('#pfsSpkBtn', root);
  if (spkBtn) {
    spkBtn.className = `pfs-dock-ico ${partySpeakerOn ? 'on' : 'off'}`;
    spkBtn.textContent = partySpeakerOn ? '🔊' : '🔈';
  }
  const micBtn = $('#pfsMicBtn', root);
  if (micBtn) {
    micBtn.className = `pfs-dock-ico ${canSpeak ? (mySeat.muted ? 'muted' : 'live') : 'muted'}`;
    micBtn.textContent = !canSpeak ? '👂' : (mySeat.muted ? '🔇' : '🎙️');
  }
}

function partyTakeSeat(rm, idx) {
  if (!rm) return;
  if (rm.kickedUids && rm.kickedUids.includes(uid) && !isSingleOwner(rm, uid)) {
    return toast('You cannot take a seat in this room');
  }
  const key = String(idx);
  if (idx === 0 && rm.hostUid !== uid) {
    return toast('Seat 0 is only for the Room Owner');
  }
  if (rm.seats[key] && rm.seats[key].uid !== uid) {
    return toast('Seat already taken');
  }
  const now = Date.now();
  const nextSeats = {};
  Object.keys(rm.seats || {}).forEach(k => {
    if (rm.seats[k] && rm.seats[k].uid !== uid) nextSeats[k] = rm.seats[k];
  });
  const canSpeak = isMicSeatIndex(idx);
  nextSeats[key] = {
    uid,
    name: me.name || 'Player',
    avatar: me.avatar || 'av_b1',
    frame: me.frame || 'none',
    muted: !canSpeak,
    speaking: canSpeak,
    joinedAt: now,
    lastSeen: now,
    connected: true
  };
  rm.seats = nextSeats;
  touchMyMemberInRoom(rm, now);
  if (canSpeak) PartyWebRtcMesh.enableMic(true);
  else PartyWebRtcMesh.setMicMuted(true);
  persistPartyRoom(rm, { fullReplace: true });
}

function partyLeaveSeat(rm) {
  if (!rm) return;
  const nextSeats = {};
  Object.keys(rm.seats || {}).forEach(k => {
    if (rm.seats[k] && rm.seats[k].uid !== uid) nextSeats[k] = rm.seats[k];
  });
  rm.seats = nextSeats;
  touchMyMemberInRoom(rm, Date.now());
  PartyWebRtcMesh.setMicMuted(true);
  persistPartyRoom(rm, { fullReplace: true });
}

function openSeatModModal(rm, seatIdx) {
  const s = rm.seats && rm.seats[String(seatIdx)];
  if (!s) return;
  const isMe = s.uid === uid;
  const amOwner = isSingleOwner(rm, uid);
  const amAdmin = canModerateRoom(rm);
  const targetIsOwner = isSingleOwner(rm, s.uid);
  const targetIsAdmin = isRoomAdmin(rm, s.uid);

  const m = modal(`${esc(s.name)}`, `
    <div class="row" style="gap:10px;margin-bottom:12px">
      ${av(s, 48)}
      <div class="mid">
        <b>${esc(s.name)}</b>
        <small style="color:var(--mu)">${targetIsOwner ? 'Room Owner' : (targetIsAdmin ? 'Room Admin' : (isMicSeatIndex(seatIdx) ? 'Mic Seat' : 'Listener'))}</small>
      </div>
    </div>
    <div class="list" style="gap:7px">
      ${isMe ? `<button type="button" class="btn red full" id="smLeave">Leave Seat</button>` : ''}
      ${!isMe && amAdmin && !targetIsOwner ? `
        <button type="button" class="btn ghost full" id="smMute">${s.muted ? 'Unmute Mic' : 'Mute Mic'}</button>
        <button type="button" class="btn red full" id="smKick">Kick From Room</button>
      ` : ''}
      ${!isMe && amOwner && !targetIsOwner ? `
        <button type="button" class="btn gold full" id="smAdmin">${targetIsAdmin ? 'Remove Admin' : 'Make Admin'}</button>
      ` : ''}
      ${!isMe ? `<button type="button" class="btn ok full" id="smGift">Send Gift</button>` : ''}
    </div>
  `);

  if ($('#smLeave', m)) $('#smLeave', m).onclick = () => { partyLeaveSeat(rm); m.close(); };
  if ($('#smMute', m)) $('#smMute', m).onclick = () => {
    rm.seats[String(seatIdx)].muted = !rm.seats[String(seatIdx)].muted;
    persistPartyRoom(rm);
    m.close();
  };
  if ($('#smKick', m)) $('#smKick', m).onclick = () => {
    delete rm.seats[String(seatIdx)];
    if (rm.members && rm.members[s.uid]) delete rm.members[s.uid];
    rm.kickedUids = [...new Set([...(rm.kickedUids || []), s.uid])];
    rm.chat = [...(rm.chat || []), { id: 'k_' + Date.now().toString(36), type: 'sys', text: `${s.name} was removed by ${me.name}`, ts: Date.now() }].slice(-45);
    persistPartyRoom(rm, { fullReplace: true });
    m.close();
  };
  if ($('#smAdmin', m)) $('#smAdmin', m).onclick = () => {
    rm.admins = Array.isArray(rm.admins) ? [...rm.admins] : [];
    if (targetIsAdmin) {
      rm.admins = rm.admins.filter(x => x !== s.uid);
      toast(`${s.name} admin removed`);
    } else {
      rm.admins.push(s.uid);
      toast(`${s.name} is now Admin`);
    }
    persistPartyRoom(rm);
    m.close();
  };
  if ($('#smGift', m)) $('#smGift', m).onclick = () => {
    m.close();
    if (typeof openGiftSendModal === 'function') openGiftSendModal(s.uid, { targetName: s.name, inPartyRoom: rm.id });
  };
}

function openPartyMusicModal(rm) {
  const m = modal('Room Music Player', `
    <label for="pmAudioUrl">Direct .mp3 / Audio Stream URL (Plays across views)</label>
    <div class="row" style="gap:6px">
      <input id="pmAudioUrl" placeholder="https://example.com/song.mp3" value="${esc(rm.musicUrl || '')}" style="flex:1">
      <button type="button" class="btn ok sm" id="pmPlayUrl">Play</button>
    </div>
    <div class="row" style="gap:6px;margin-top:8px">
      <button type="button" class="btn gold sm" id="pmToggle" style="flex:1">${rm.musicPlaying ? 'Pause' : 'Resume'}</button>
      <button type="button" class="btn red sm" id="pmStop">Stop</button>
    </div>
    <div class="list" style="gap:6px;margin-top:10px">
      ${PARTY_MUSIC_TRACKS.map(t => `<button type="button" class="pfs-music-row" data-ptrack="${esc(t.id)}"><b>${esc(t.title)}</b><small>${esc(t.category.toUpperCase())}</small></button>`).join('')}
    </div>
  `);

  $('#pmPlayUrl', m).onclick = () => {
    const url = ($('#pmAudioUrl', m).value || '').trim();
    if (!/^https?:\/\/.+/i.test(url)) return toast('Enter a valid https:// audio URL');
    const title = url.split('/').pop()?.split('?')[0] || 'Audio Track';
    rm.musicUrl = url;
    rm.musicTitle = title;
    rm.musicPlaying = true;
    PartyAudioPlayer.playUrl(url, title);
    persistPartyRoom(rm);
    m.close();
  };

  $('#pmToggle', m).onclick = () => {
    rm.musicPlaying = !rm.musicPlaying;
    PartyAudioPlayer.setPlaying(rm.musicPlaying);
    persistPartyRoom(rm);
    m.close();
  };

  $('#pmStop', m).onclick = () => {
    rm.musicPlaying = false;
    rm.musicUrl = '';
    rm.musicTitle = '';
    PartyAudioPlayer.stop();
    persistPartyRoom(rm);
    m.close();
  };

  $$('[data-ptrack]', m).forEach(btn => {
    btn.onclick = () => {
      const tr = PARTY_MUSIC_TRACKS.find(x => x.id === btn.dataset.ptrack);
      if (!tr) return;
      rm.musicTitle = tr.title;
      rm.musicPlaying = true;
      persistPartyRoom(rm);
      m.close();
      toast(`Selected ${tr.title} (add a direct .mp3 URL above for live audio stream)`);
    };
  });
}

function openPartyVideoModal(rm) {
  const curVal = rm.videoSync?.videoUrl || rm.videoSync?.videoId || rm.youtubeId || '';
  const m = modal('Synced Room Video (Same Time)', `
    <label for="pvIn">YouTube Link / Video ID or Direct .mp4 / .webm URL</label>
    <input id="pvIn" placeholder="https://youtu.be/... or https://.../video.mp4" value="${esc(curVal)}">
    <small style="display:block;color:var(--mu);margin-top:5px">Play, pause, and skip/seek stay synced live for everyone in the room (with YouTube ad auto-recovery).</small>
    <button type="button" class="btn gold full" id="pvGo" style="margin-top:10px">Sync Video For Room</button>
  `);
  $('#pvGo', m).onclick = () => {
    const raw = ($('#pvIn', m).value || '').trim();
    const parsed = (window.ShowGamesRules && typeof window.ShowGamesRules.parseVideoSource === 'function')
      ? window.ShowGamesRules.parseVideoSource(raw)
      : (() => {
          const yt = parseYouTubeVideoId(raw);
          if (yt) return { kind: 'youtube', videoId: yt, videoUrl: '' };
          if (/^(https?:\/\/.+\.(mp4|webm|ogg|m4v)(\?.*)?$|blob:|data:video\/)/i.test(raw)) return { kind: 'direct', videoId: '', videoUrl: raw };
          return null;
        })();
    if (!parsed) return toast('Enter a valid YouTube link/ID or direct .mp4/.webm video URL');
    rm.mode = 'video';
    PartyVideoSync.broadcastSyncUpdate(rm, {
      kind: parsed.kind,
      videoId: parsed.videoId,
      videoUrl: parsed.videoUrl,
      playing: true,
      seekSec: 0,
      durationSec: 0
    }, `${me.name} synced a ${parsed.kind === 'direct' ? 'video stream' : 'YouTube video'} for the room`);
    m.close();
  };
}

function openPartyModesModal(rm) {
  const m = modal('Room Mode', `
    <div class="list" style="gap:7px">
      ${Object.values(PARTY_MODES_META).map(md => `
        <button type="button" class="btn ${rm.mode === md.id ? 'gold' : 'ghost'} full" data-setmode="${md.id}">${esc(md.name)} — ${esc(md.desc)}</button>
      `).join('')}
    </div>
  `);
  $$('[data-setmode]', m).forEach(btn => {
    btn.onclick = () => {
      rm.mode = btn.dataset.setmode;
      persistPartyRoom(rm);
      m.close();
    };
  });
}

function bindPartyRootDelegation(root) {
  if (!root || root.dataset.pfsBound === '1') return;
  root.dataset.pfsBound = '1';

  root.addEventListener('click', async e => {
    const rm = partyRooms.find(r => r.id === activePartyRoomId);
    if (!rm) return;

    const reactBtn = e.target.closest('[data-react]');
    if (reactBtn && reactBtn.dataset.react) {
      sendPartyReaction(rm, reactBtn.dataset.react);
      return;
    }

    const sit = e.target.closest('[data-sit]');
    if (sit) { partyTakeSeat(rm, Number(sit.dataset.sit)); return; }

    const occ = e.target.closest('[data-seat-uid]');
    if (occ) { openSeatModModal(rm, Number(occ.dataset.seatIdx)); return; }

    const vidActBtn = e.target.closest('[data-vid-act]');
    if (vidActBtn && vidActBtn.dataset.vidAct) {
      PartyVideoSync.handleAction(rm, vidActBtn.dataset.vidAct);
      return;
    }

    const vidSyncBtn = e.target.closest('[data-vid-sync]');
    if (vidSyncBtn) {
      PartyVideoSync.handleAction(rm, 'toggle');
      return;
    }

    const delMsgBtn = e.target.closest('[data-del-pmsg]');
    if (delMsgBtn && delMsgBtn.dataset.delPmsg) {
      deletePartyChatMessage(rm, delMsgBtn.dataset.delPmsg);
      return;
    }

    const actBtn = e.target.closest('[data-pfs-act]');
    if (!actBtn) return;
    const act = actBtn.dataset.pfsAct;

    if (act === 'exit-room' || act === 'close') {
      closePartyRoom();
    } else if (act === 'minimize') {
      minimizePartyRoom();
    } else if (act === 'open-invite') {
      openPartyInviteModal(rm);
    } else if (act === 'open-music') {
      openPartyMusicModal(rm);
    } else if (act === 'open-modes') {
      openPartyModesModal(rm);
    } else if (act === 'open-add-video') {
      openPartyVideoModal(rm);
    } else if (act === 'leave-seat') {
      partyLeaveSeat(rm);
    } else if (act === 'toggle-speaker') {
      partySpeakerOn = !partySpeakerOn;
      PartyWebRtcMesh.syncSpeaker(partySpeakerOn);
      PartyAudioPlayer.syncSpeaker(partySpeakerOn);
      PartyVideoSync.syncSpeaker(partySpeakerOn);
      renderFullScreenPartyRoom();
    } else if (act === 'toggle-mic') {
      const key = findUserSeatKeyInRoom(rm, uid);
      if (key == null || !isMicSeatIndex(Number(key))) {
        return toast('Sit on a Mic Seat (0-3) to speak; other seats are Listeners');
      }
      const nextMuted = !rm.seats[key].muted;
      if (!nextMuted) {
        const ok = await PartyWebRtcMesh.enableMic(true);
        if (!ok) return;
      } else {
        PartyWebRtcMesh.setMicMuted(true);
      }
      rm.seats[key].muted = nextMuted;
      rm.seats[key].speaking = !nextMuted;
      persistPartyRoom(rm);
    } else if (act === 'send-chat') {
      const inp = $('#pfsChatIn', root);
      const txt = (inp?.value || '').trim();
      if (!txt) return;
      inp.value = '';
      sendPartyChatMessage(rm, txt);
    } else if (act === 'open-gift') {
      if (typeof openGiftSendModal === 'function') {
        const other = Object.values(rm.seats || {}).find(x => x && x.uid !== uid);
        openGiftSendModal(other ? other.uid : null, { allowPickPlayer: true, inPartyRoom: rm.id });
      }
    }
  });

  root.addEventListener('keydown', e => {
    if (e.key !== 'Enter') return;
    const inp = e.target.closest('#pfsChatIn');
    if (!inp) return;
    e.preventDefault();
    const rm = partyRooms.find(r => r.id === activePartyRoomId);
    if (!rm) return;
    const txt = (inp.value || '').trim();
    if (!txt) return;
    inp.value = '';
    sendPartyChatMessage(rm, txt);
  });
}

function openPartyInviteModal(rm) {
  if (!rm) return;
  const code = String(rm.shortId || rm.id).toUpperCase();
  const url = typeof buildRoomInviteUrl === 'function'
    ? buildRoomInviteUrl({ type: 'party', roomId: rm.id, roomCode: code })
    : `?party=${encodeURIComponent(rm.id)}&room=${encodeURIComponent(code)}`;
  const shareTxt = `🎙️ Join my Voice Room "${rm.title || 'Voice Lounge'}"! Room Code: ${code} ${url}`;
  const onlineFriends = typeof getRealOnlineUsers === 'function' ? getRealOnlineUsers() : [];

  const m = modal('👥 Invite to Voice Room', `
    <div class="jki-shell">
      <div class="jki-code-card">
        <div class="jki-code-meta">
          <small class="jki-lbl">VOICE ROOM CODE</small>
          <b class="jki-code">${esc(code)}</b>
        </div>
        <div class="jki-code-actions">
          <button type="button" class="btn sm gold" id="prInvCopy">Copy</button>
          <button type="button" class="btn sm ok" id="prInvWorld">World Chat</button>
        </div>
      </div>
      <div class="jki-sec-row">
        <span class="jki-sec-title">Online Friends</span>
        <small class="jki-sec-cnt">${onlineFriends.length} online</small>
      </div>
      <div class="jki-friend-list" id="prInvList">
        ${onlineFriends.length ? onlineFriends.slice(0, 14).map(u => {
          const act = typeof getUserLiveActivity === 'function' ? getUserLiveActivity(u) : { label: 'Online' };
          return `<div class="jki-friend-row">
            <div class="jki-f-left">
              <span class="sg-av-presence-wrap">${av(u, 36)}<span class="sg-online-dot sm"></span></span>
              <div class="jki-f-info"><b>${esc(u.name)}</b><small>${esc(act.label)}</small></div>
            </div>
            <button type="button" class="btn sm ok" data-pr-inv="${esc(u.uid)}">Invite</button>
          </div>`;
        }).join('') : '<div class="jki-empty">No online friends available. Share to World Chat!</div>'}
      </div>
    </div>
  `, 'jki-modal');

  if ($('#prInvCopy', m)) {
    $('#prInvCopy', m).onclick = () => {
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(shareTxt).catch(() => {});
      toast(`Voice Room invite (${code}) copied!`);
    };
  }
  if ($('#prInvWorld', m)) {
    $('#prInvWorld', m).onclick = () => {
      if (typeof sendWorldMsg === 'function') {
        sendWorldMsg(shareTxt, { type: 'party_invite', gameId: 'party', gameName: rm.title || 'Voice Room', roomId: rm.id, roomCode: code, url });
      }
      toast('Posted clickable Voice Room invite to World Chat!');
    };
  }
  const list = $('#prInvList', m);
  if (list) {
    list.onclick = (e) => {
      const b = e.target.closest('[data-pr-inv]');
      if (!b || b.disabled) return;
      const fr = onlineFriends.find(x => x.uid === b.dataset.prInv);
      if (!fr) return;
      b.disabled = true;
      b.textContent = 'Invited ✓';
      if (typeof sendUniversalRoomInviteToDm === 'function') {
        sendUniversalRoomInviteToDm(fr, { type: 'party', gameId: 'party', gameName: rm.title || 'Voice Room', roomId: rm.id, roomCode: code, text: shareTxt });
      }
      toast(`Invited ${fr.name} to "${rm.title}"!`);
    };
  }
}
window.openPartyInviteModal = openPartyInviteModal;

window.PartyRoomController = {
  getRooms: () => partyRooms,
  getActiveRoomId: () => activePartyRoomId,
  getMinimizedRoomId: () => minimizedPartyRoomId,
  runLifecycleSweep: runRoomLifecycleSweep,
  sendReaction: sendPartyReaction,
  sendChat: sendPartyChatMessage,
  minimize: minimizePartyRoom,
  close: closePartyRoom
};
