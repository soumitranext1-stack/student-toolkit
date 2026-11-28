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

const PARTY_TAGS = ['Friends', 'Music', 'Game', 'Chats'];
const PARTY_LOBBY_CATEGORIES = ['All', 'Friends', 'Music', 'Video', 'Game', 'Chats'];
const MIC_SEAT_LIMIT = 4; // Seats 0..3 can speak live via WebRTC; others are listeners
let partyLobbyCategory = 'All';
const unlockedRoomPasswords = new Set();

const PARTY_MUSIC_TRACKS = (window.PartyMediaCatalog && Array.isArray(window.PartyMediaCatalog.SONGS_CATALOG))
  ? window.PartyMediaCatalog.SONGS_CATALOG
  : [
      { id: 'hi_1', tag: 'Hindi', title: 'Hindi Chill Beats', singer: 'Room Audio Track', duration: '3:40', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
      { id: 'bn_1', tag: 'Bangla', title: 'Bangla Acoustic Breeze', singer: 'Room Audio Track', duration: '3:55', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' },
      { id: 'lofi_1', tag: 'Lo-Fi', title: 'Late Night Lo-Fi', singer: 'Room Audio Track', duration: '3:28', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3' }
    ];

const PARTY_REACTIONS = ['🔥', '❤️', '😂', '👏', '🎉', '💎', '👑', '😮'];

function PRR() {
  return window.PartyRoomRules || null;
}

function PMC() {
  return window.PartyMediaCatalog || null;
}

function getMusicFavoriteIds() {
  const raw = ls.get('sg_party_music_favs', []);
  return Array.isArray(raw) ? raw.map(String) : [];
}

function saveMusicFavoriteIds(ids) {
  ls.set('sg_party_music_favs', Array.isArray(ids) ? ids.map(String).slice(0, 50) : []);
}

function getMusicRecentItems() {
  const raw = ls.get('sg_party_music_recent', []);
  return Array.isArray(raw) ? raw : [];
}

function saveMusicRecentItems(items) {
  ls.set('sg_party_music_recent', Array.isArray(items) ? items.slice(0, 20) : []);
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
  const rules = PRR();
  if (rules && typeof rules.isRoomOwner === 'function') return rules.isRoomOwner(rm, targetUid);
  const ownerUid = getEffectiveOwnerUid(rm);
  return Boolean(ownerUid && targetUid && ownerUid === targetUid);
}

function isRoomAdmin(rm, targetUid = uid) {
  if (!rm || !targetUid) return false;
  if (isSingleOwner(rm, targetUid)) return true;
  const rules = PRR();
  if (rules && typeof rules.isRoomAdminOnly === 'function') return rules.isRoomAdminOnly(rm, targetUid);
  return Array.isArray(rm.admins) && rm.admins.slice(0, 3).includes(targetUid);
}

function canModerateRoom(rm) {
  return isRoomAdmin(rm, uid);
}

function assertRoomPerm(rm, action, opts) {
  const rules = PRR();
  const res = rules && typeof rules.canPerformRoomAction === 'function'
    ? rules.canPerformRoomAction(rm, uid, action)
    : { allowed: canModerateRoom(rm), reason: 'Only Room Owner or Admins can perform this action' };
  if (!res.allowed) {
    if (!(opts && opts.silent) && typeof toast === 'function') {
      toast(`🔒 ${res.reason || 'Only Room Owner or Admins can perform this action'}`);
    }
    return false;
  }
  return true;
}

function normalizePartySeats(seats) {
  const rules = PRR();
  if (rules && typeof rules.deduplicateSeats === 'function') {
    return rules.deduplicateSeats(seats);
  }
  if (!seats || typeof seats !== 'object') return {};
  const bestByUid = new Map();
  Object.keys(seats).sort((a, b) => Number(a) - Number(b)).forEach(k => {
    const occ = seats[k];
    if (!occ || !occ.uid) return;
    const joinedAt = Number(occ.joinedAt || 0);
    const prev = bestByUid.get(occ.uid);
    if (!prev || joinedAt >= prev.joinedAt) bestByUid.set(occ.uid, { key: k, joinedAt });
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
  const rawVs = rm.videoSync && typeof rm.videoSync === 'object' ? rm.videoSync : null;
  const baseVideoSync = (window.ShowGamesRules && typeof window.ShowGamesRules.normalizeVideoSyncState === 'function')
    ? window.ShowGamesRules.normalizeVideoSyncState(rm.videoSync, rm.youtubeId || '')
    : (rawVs ? {
        kind: rawVs.kind === 'direct' || (!rawVs.videoId && rawVs.videoUrl) ? 'direct' : 'youtube',
        videoId: String(rawVs.videoId || rm.youtubeId || ''),
        videoUrl: String(rawVs.videoUrl || ''),
        playing: Boolean(rawVs.playing),
        seekSec: Math.max(0, Number(rawVs.seekSec || 0)),
        durationSec: Math.max(0, Number(rawVs.durationSec || 0)),
        playbackRate: Math.min(2, Math.max(0.5, Number(rawVs.playbackRate || 1))),
        updatedAt: Number(rawVs.updatedAt || now),
        updatedBy: String(rawVs.updatedBy || ''),
        seq: Math.max(0, Math.floor(Number(rawVs.seq || 0)))
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
  const videoSync = {
    ...baseVideoSync,
    kind: rawVs && rawVs.kind === 'yt_search' ? 'yt_search' : baseVideoSync.kind,
    searchQuery: String((rawVs && rawVs.searchQuery) || '')
  };

  const videoViewerStates = rm.videoViewerStates && typeof rm.videoViewerStates === 'object'
    ? { ...rm.videoViewerStates }
    : {};

  const rawQueueSource = Array.isArray(rm.queue) && rm.queue.length
    ? rm.queue
    : (Array.isArray(rm.musicQueue) ? rm.musicQueue : []);
  const normQueue = (PMC() && typeof PMC().normalizeMusicQueue === 'function')
    ? PMC().normalizeMusicQueue(rawQueueSource)
    : rawQueueSource;
  const rawQIdx = rm.queueIndex != null ? rm.queueIndex : rm.musicQueueIndex;
  const normQueueIndex = Number.isFinite(Number(rawQIdx))
    ? Number(rawQIdx)
    : (normQueue.length ? 0 : -1);
  const mediaPlayMode = rm.mediaPlayMode === 'video'
    ? 'video'
    : (rm.mediaPlayMode === 'audio' ? 'audio' : (mode === 'video' ? 'video' : 'audio'));

  const isOwnedRoom = Boolean(rm.isOwnedRoom || rm.isAdvanced);
  const ownerUid = isOwnedRoom ? String(rm.ownerUid || rm.creatorUid || rm.hostUid || uid) : String(rm.ownerUid || '');
  const ownerName = isOwnedRoom ? String(rm.ownerName || effectiveHostName || 'Owner') : String(rm.ownerName || '');
  const fixedId = isOwnedRoom ? String(rm.fixedId || rm.shortId || makeRoomShortId(rm.id)) : String(rm.fixedId || '');
  const safeAdmins = Array.isArray(rm.admins)
    ? [...new Set(rm.admins.filter(x => x && x !== effectiveHostUid && x !== ownerUid))].slice(0, 3)
    : [];
  const safeStatus = rm.status === 'closed' ? 'closed' : (rm.status === 'idle' && isOwnedRoom ? 'idle' : 'active');

  const extrasCfg = (window.PartyRoomExtrasRules && typeof window.PartyRoomExtrasRules.normalizeRoomSettings === 'function')
    ? window.PartyRoomExtrasRules.normalizeRoomSettings(rm)
    : {
        partnerSeat: Boolean(rm.partnerSeat),
        banTextChat: Boolean(rm.banTextChat),
        banPhotoChat: Boolean(rm.banPhotoChat),
        banRedPacket: Boolean(rm.banRedPacket),
        giftSoundsOn: rm.giftSoundsOn !== false,
        rallyReceiveOn: rm.rallyReceiveOn !== false,
        region: rm.region || 'India',
        volume: Number.isFinite(Number(rm.volume)) ? Number(rm.volume) : 75,
        blocklist: Array.isArray(rm.blocklist) ? rm.blocklist : [],
        operationLog: Array.isArray(rm.operationLog) ? rm.operationLog : []
      };

  return {
    ...rm,
    id: rm.id || ('pr_' + now.toString(36)),
    shortId: fixedId || rm.shortId || makeRoomShortId(rm.id),
    fixedId,
    isOwnedRoom,
    isAdvanced: isOwnedRoom,
    ownerUid,
    ownerName,
    status: safeStatus,
    title: rm.title || 'Voice Lounge',
    tag: rm.tag || (mode === 'video' ? 'Video' : (mode === 'games' ? 'Game' : 'Friends')),
    cover,
    mode,
    background,
    password: String(rm.password || '').trim().slice(0, 20),
    creatorUid,
    hostUid: effectiveHostUid,
    hostName: effectiveHostName,
    activeHostUid: effectiveHostUid,
    activeHostName: effectiveHostName,
    admins: safeAdmins,
    followers: Array.isArray(rm.followers) ? rm.followers.filter(f => f && f.uid).slice(-200) : [],
    guards: Array.isArray(rm.guards) ? rm.guards.filter(g => g && g.uid).slice(-50) : [],
    micOrder: Array.isArray(rm.micOrder) ? rm.micOrder.filter(x => x && x.uid).slice(-20) : [],
    roomXp: Math.max(0, Math.floor(Number(rm.roomXp || 0))),
    boostedUntil: Number(rm.boostedUntil || 0),
    hqAudio: Boolean(rm.hqAudio),
    lastRallyAt: Number(rm.lastRallyAt || 0),
    partnerSeat: extrasCfg.partnerSeat,
    banTextChat: extrasCfg.banTextChat,
    banPhotoChat: extrasCfg.banPhotoChat,
    banRedPacket: extrasCfg.banRedPacket,
    giftSoundsOn: extrasCfg.giftSoundsOn,
    rallyReceiveOn: extrasCfg.rallyReceiveOn,
    region: extrasCfg.region,
    volume: extrasCfg.volume,
    blocklist: extrasCfg.blocklist,
    operationLog: extrasCfg.operationLog,
    pkSession: rm.pkSession && typeof rm.pkSession === 'object' ? rm.pkSession : null,
    kickedUids: Array.isArray(rm.kickedUids) ? [...new Set(rm.kickedUids)] : [],
    announcement: typeof rm.announcement === 'string' && rm.announcement.trim()
      ? rm.announcement
      : 'Seats 0-3 = Mic Speakers (max 4) · Other seats = Listeners.',
    lockedSeats: Array.isArray(rm.lockedSeats) ? [...new Set(rm.lockedSeats.map(Number).filter(n => n >= 1 && n < 12))] : [],
    queue: normQueue,
    queueIndex: normQueueIndex,
    musicQueue: normQueue,
    musicQueueIndex: normQueueIndex,
    mediaPlayMode,
    musicTrackId: String(rm.musicTrackId || ''),
    musicUrl: String(rm.musicUrl || ''),
    musicTitle: String(rm.musicTitle || ''),
    musicArtist: String(rm.musicArtist || ''),
    musicLanguage: String(rm.musicLanguage || ''),
    musicIsFallback: Boolean(rm.musicIsFallback),
    musicPlaying: Boolean(rm.musicPlaying),
    videoTitle: String(rm.videoTitle || ''),
    youtubeId: videoSync.videoId,
    videoSync,
    videoViewerStates,
    acquaintState: (window.PartyModeStagesRules && typeof window.PartyModeStagesRules.normalizeAcquaintState === 'function')
      ? window.PartyModeStagesRules.normalizeAcquaintState(rm.acquaintState)
      : (rm.acquaintState || null),
    auctionState: (window.PartyModeStagesRules && typeof window.PartyModeStagesRules.normalizeAuctionState === 'function')
      ? window.PartyModeStagesRules.normalizeAuctionState(rm.auctionState)
      : (rm.auctionState || null),
    gamesStageState: (window.PartyModeStagesRules && typeof window.PartyModeStagesRules.normalizeGamesStageState === 'function')
      ? window.PartyModeStagesRules.normalizeGamesStageState(rm.gamesStageState)
      : (rm.gamesStageState || null),
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
      PartyAudioPlayer.syncFromRoom(incoming);
      syncReactionsFromList(incoming, incoming.reactions);
      renderFullScreenPartyRoom();
    } else if (minimizedPartyRoomId === rid) {
      PartyAudioPlayer.syncFromRoom(incoming);
      renderFloatingVrPill();
    }
    renderPartyHub();
  }
}

/* ===== Real HTML5 Audio Player + Queue Auto-Advance (Persists Across Views/Tabs) ===== */
const PartyAudioPlayer = (() => {
  let el = null;
  let currentUrl = '';
  let currentTrackId = '';
  let wantPlaying = false;
  let onEndedCb = null;
  let synthCtx = null;
  let synthTimer = 0;
  let synthStep = 0;

  function stopFallbackSynth() {
    if (synthTimer) {
      clearInterval(synthTimer);
      synthTimer = 0;
    }
  }

  function startFallbackSynth(trackId) {
    stopFallbackSynth();
    if (!wantPlaying || !partySpeakerOn) return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    try {
      if (!synthCtx) synthCtx = new AudioCtx();
      if (synthCtx.state === 'suspended' && typeof synthCtx.resume === 'function') {
        synthCtx.resume().catch(() => {});
      }
      const cat = typeof PMC === 'function' ? PMC() : null;
      const found = cat && trackId ? cat.findSongById(trackId) : null;
      const notes = (found && Array.isArray(found.synthNotes) && found.synthNotes.length)
        ? found.synthNotes
        : [261.63, 329.63, 392.0, 329.63];
      synthStep = 0;
      const playTone = () => {
        if (!wantPlaying || !partySpeakerOn || !synthCtx) {
          stopFallbackSynth();
          return;
        }
        try {
          const osc = synthCtx.createOscillator();
          const gain = synthCtx.createGain();
          const now = synthCtx.currentTime;
          osc.type = 'sine';
          osc.frequency.setValueAtTime(notes[synthStep % notes.length], now);
          gain.gain.setValueAtTime(0.0001, now);
          gain.gain.exponentialRampToValueAtTime(0.035, now + 0.08);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.72);
          osc.connect(gain);
          gain.connect(synthCtx.destination);
          osc.start(now);
          osc.stop(now + 0.75);
          synthStep++;
        } catch {}
      };
      playTone();
      synthTimer = setInterval(playTone, 820);
    } catch {}
  }

  function ensure() {
    if (!el) {
      el = document.createElement('audio');
      el.id = 'sgPartyAudioEl';
      el.preload = 'none';
      el.loop = true;
      el.volume = 0.65;
      el.addEventListener('playing', () => {
        stopFallbackSynth();
      });
      el.addEventListener('error', () => {
        if (wantPlaying && partySpeakerOn && currentUrl) {
          startFallbackSynth(currentTrackId);
        }
      });
      el.addEventListener('ended', () => {
        if (typeof onEndedCb === 'function') onEndedCb();
      });
      document.body.appendChild(el);
    }
    return el;
  }

  function setOnEnded(fn) {
    onEndedCb = typeof fn === 'function' ? fn : null;
  }

  function playUrl(url, title, opts) {
    const clean = String(url || '').trim();
    const o = opts || {};
    currentTrackId = String(o.trackId || currentTrackId || '');
    if (!clean || clean.startsWith('synth://')) {
      currentUrl = clean || ('synth://' + (currentTrackId || 'preview'));
      wantPlaying = true;
      if (partySpeakerOn) startFallbackSynth(currentTrackId);
      return Boolean(title || currentUrl);
    }
    stopFallbackSynth();
    const audio = ensure();
    const sameSrc = currentUrl === clean && audio.getAttribute('src') === clean;
    currentUrl = clean;
    wantPlaying = true;
    audio.loop = o.loop != null ? Boolean(o.loop) : true;
    audio.muted = !partySpeakerOn;
    if (!sameSrc || o.forceReload) {
      audio.src = clean;
      try { audio.currentTime = 0; } catch {}
    }
    if (partySpeakerOn) {
      const p = audio.play();
      if (p && typeof p.catch === 'function') p.catch(() => {});
    }
    return Boolean(title || clean);
  }

  function setPlaying(play) {
    wantPlaying = Boolean(play);
    if (!wantPlaying) stopFallbackSynth();
    const audio = ensure();
    if (currentUrl.startsWith('synth://')) {
      if (wantPlaying && partySpeakerOn) startFallbackSynth(currentTrackId);
      return;
    }
    if (!audio.getAttribute('src')) return;
    audio.muted = !partySpeakerOn;
    if (wantPlaying && partySpeakerOn) {
      const p = audio.play();
      if (p && typeof p.catch === 'function') p.catch(() => {});
    } else {
      audio.pause();
    }
  }

  function syncFromRoom(rm) {
    if (!rm || !rm.musicUrl || (rm.mode === 'video' && rm.mediaPlayMode === 'video')) {
      stop();
      return;
    }
    const qList = Array.isArray(rm.queue) && rm.queue.length ? rm.queue : (Array.isArray(rm.musicQueue) ? rm.musicQueue : []);
    const qLen = qList.length;
    const shouldLoop = qLen <= 1;
    const audio = ensure();
    audio.loop = shouldLoop;
    if (rm.musicPlaying) {
      const changed = currentUrl !== rm.musicUrl || currentTrackId !== String(rm.musicTrackId || '');
      playUrl(rm.musicUrl, rm.musicTitle, {
        trackId: rm.musicTrackId || '',
        loop: shouldLoop,
        forceReload: changed
      });
    } else {
      stopFallbackSynth();
      if (currentUrl !== rm.musicUrl) {
        currentUrl = rm.musicUrl;
        currentTrackId = String(rm.musicTrackId || '');
        if (!rm.musicUrl.startsWith('synth://')) audio.src = rm.musicUrl;
      }
      setPlaying(false);
    }
  }

  function syncSpeaker(on) {
    if (!on) stopFallbackSynth();
    if (currentUrl.startsWith('synth://')) {
      if (on && wantPlaying) startFallbackSynth(currentTrackId);
      return;
    }
    if (!el) return;
    el.muted = !on;
    if (on && wantPlaying && el.getAttribute('src')) {
      const p = el.play();
      if (p && typeof p.catch === 'function') p.catch(() => {});
    }
  }

  function stop() {
    wantPlaying = false;
    currentUrl = '';
    currentTrackId = '';
    stopFallbackSynth();
    if (!el) return;
    try { el.pause(); el.removeAttribute('src'); el.load(); } catch {}
  }

  function setVolume(vol01) {
    const v = Math.max(0, Math.min(1, Number(vol01)));
    const audio = ensure();
    audio.volume = v;
  }

  function getState() {
    return {
      url: currentUrl,
      trackId: currentTrackId,
      playing: wantPlaying,
      volume: el ? el.volume : 0.65,
      synthActive: Boolean(synthTimer),
      srcAttr: el ? (el.getAttribute('src') || '') : ''
    };
  }

  return { playUrl, setPlaying, setVolume, syncFromRoom, syncSpeaker, setOnEnded, stop, getState };
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

  const failedVideoIds = new Set();
  let lastEmbedNotice = '';

  const SGR = () => window.ShowGamesRules || null;

  function normSync(raw, fallbackYt) {
    const r = raw && typeof raw === 'object' ? raw : {};
    const s = SGR();
    const base = (s && typeof s.normalizeVideoSyncState === 'function')
      ? s.normalizeVideoSyncState(raw, fallbackYt || '')
      : {
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
    return {
      ...base,
      kind: r.kind === 'yt_search' ? 'yt_search' : base.kind,
      searchQuery: String(r.searchQuery || '')
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

    // Keep stage header title and Playlist count synced live without remounting iframe
    if (rm) {
      const qList = Array.isArray(rm.queue) && rm.queue.length ? rm.queue : (Array.isArray(rm.musicQueue) ? rm.musicQueue : []);
      const titleEl = slot.querySelector('[data-vid-title]');
      if (titleEl && rm.videoTitle && titleEl.textContent !== rm.videoTitle) {
        titleEl.textContent = rm.videoTitle;
      }
      const plCountEl = slot.querySelector('[data-vid-pl-count]');
      if (plCountEl) {
        plCountEl.textContent = qList.length ? `Playlist (${qList.length})` : 'Playlist';
      }
    }

    // Live Ad / Buffering / Embed-Blocked notice strip visible to Host & viewers
    const adStrip = slot.querySelector('[data-vid-ad-strip]');
    if (adStrip) {
      const rules = PRR();
      const summary = rm && rules && typeof rules.summarizeViewerSyncIssues === 'function'
        ? rules.summarizeViewerSyncIssues(rm.videoViewerStates, uid, Date.now(), 20000)
        : { inAd: [], buffering: [], hasIssues: false };
      if (lastEmbedNotice) {
        adStrip.innerHTML = `<span class="pfs-vid-ad-txt">⚠️ ${esc(lastEmbedNotice)}</span>`;
        adStrip.hidden = false;
      } else if (summary.hasIssues) {
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

  function handleVideoEmbedFailure(rm, code, failedVid) {
    if (!rm) return;
    const cat = PMC();
    const reason = cat && typeof cat.getYouTubeErrorMessage === 'function'
      ? cat.getYouTubeErrorMessage(code)
      : 'Video unavailable or embed-blocked';
    if (failedVid) failedVideoIds.add(failedVid);
    const q = cat ? cat.getRoomQueue(rm) : [];
    if (cat && q.length > 1 && typeof cat.advanceAfterUnplayableTrack === 'function') {
      const skipRes = cat.advanceAfterUnplayableTrack(rm, failedVid, failedVideoIds);
      if (skipRes && skipRes.ok && skipRes.track) {
        lastEmbedNotice = `${reason} — skipped to "${skipRes.track.title}"`;
        if (typeof toast === 'function') toast(`⚠️ ${reason} — auto-skipping to "${skipRes.track.title}"`);
        if (typeof applyQueueTrackSelection === 'function') {
          applyQueueTrackSelection(rm, skipRes.patch, `⚠️ Skipped unavailable video → "${skipRes.track.title}"`);
        }
        return;
      }
    }
    lastEmbedNotice = `${reason}. Tap + Add video to search or pick another track.`;
    if (typeof toast === 'function') toast(`⚠️ ${reason} — pick or search another video`);
    updateControlsUI();
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
    const hasSrc = Boolean(vs.videoId || vs.videoUrl || (vs.kind === 'yt_search' && vs.searchQuery));
    if (!hasSrc) {
      const qList = Array.isArray(rm.queue) && rm.queue.length ? rm.queue : (Array.isArray(rm.musicQueue) ? rm.musicQueue : []);
      slot.innerHTML = `
        <div class="pfs-video-card pfs-video-empty-card" data-testid="pfs-video-card">
          <div class="pfs-vid-empty">
            <div class="pfs-vid-empty-screen" aria-hidden="true">
              <span class="pfs-vid-yt-badge">▶</span>
            </div>
            <b class="pfs-vid-empty-title">Watch YouTube Together</b>
            <small class="pfs-vid-empty-sub">Browse or search any video on YouTube and add it to the room playlist — everyone watches in sync.</small>
            <div class="pfs-vid-empty-acts">
              <button type="button" class="btn gold pfs-add-vid-cta" data-pfs-act="open-add-video" data-testid="vr-add-video-btn">+ Add video</button>
              <button type="button" class="btn ok sm" data-pfs-act="open-music" data-testid="vr-empty-add-song-btn">♪ Add Song</button>
              <button type="button" class="btn ghost sm" data-pfs-act="open-add-video-paste" data-testid="vr-empty-paste-btn">Paste link</button>
              ${qList.length ? `<button type="button" class="btn ghost sm" data-pfs-act="open-playlist" data-testid="vr-empty-playlist-btn">Playlist (${qList.length})</button>` : ''}
            </div>
          </div>
        </div>
      `;
      return;
    }

    const mountId = 'pfsYtMount_' + rm.id.replace(/[^a-z0-9_]/gi, '');
    const targetSec = computeTarget(vs, Date.now());
    const initDur = Math.max(60, Math.round(vs.durationSec || 600));
    const qList = Array.isArray(rm.queue) && rm.queue.length ? rm.queue : (Array.isArray(rm.musicQueue) ? rm.musicQueue : []);
    const activeVidTitle = rm.videoTitle || rm.musicTitle || 'Room Video';
    mountedKind = vs.kind;
    mountedSourceKey = `${vs.kind}:${vs.videoId || vs.videoUrl || vs.searchQuery}`;

    slot.innerHTML = `
      <div class="pfs-video-card ${theaterMode ? 'theater' : ''}" data-testid="pfs-video-card">
        <div class="pfs-vid-top-bar" data-testid="vr-stage-top-bar">
          <div class="pfs-vid-top-left">
            <span class="pfs-vid-live-pill" aria-hidden="true">▶</span>
            <b class="pfs-vid-top-title" data-vid-title data-testid="vr-stage-video-title">${esc(activeVidTitle)}</b>
          </div>
          <div class="pfs-vid-top-acts">
            <button type="button" class="pfs-vid-top-btn playlist" data-pfs-act="open-playlist" data-testid="vr-stage-playlist-btn" aria-label="Open Room Playlist">
              <span aria-hidden="true">☰</span>
              <span data-vid-pl-count>${qList.length ? `Playlist (${qList.length})` : 'Playlist'}</span>
            </button>
            <button type="button" class="pfs-vid-top-btn add" data-pfs-act="open-add-video" data-testid="vr-stage-add-video-btn" aria-label="Add video from YouTube">+ Add video</button>
          </div>
        </div>
        <div class="pfs-video-stage-wrap">
          <div class="pfs-yt-frame" data-testid="pfs-video-viewport">
            ${vs.kind === 'direct'
              ? `<video id="${mountId}" class="pfs-html-video" src="${esc(vs.videoUrl)}" controls playsinline preload="metadata"></video>`
              : (vs.kind === 'yt_search'
                  ? `<iframe id="${mountId}" src="https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(vs.searchQuery || rm.videoTitle || '')}&autoplay=${vs.playing ? 1 : 0}&rel=0&playsinline=1&enablejsapi=1" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen title="YouTube Live Search Fallback"></iframe>`
                  : `<div id="${mountId}" class="pfs-yt-mount"></div>`)
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
              <div class="pfs-vid-meta-acts">
                <button type="button" class="btn sm ok pfs-vid-mode-btn" data-pfs-act="open-music" data-testid="vr-stage-add-song-btn" title="Search & add Hindi/Bangla/Trending songs">♪ Add Song</button>
                <button type="button" class="btn sm ghost pfs-vid-mode-btn" data-vid-act="to-audio" data-testid="vr-switch-audio-mode" title="Switch playlist to Audio Mini-Player">🎧 Audio</button>
                <button type="button" class="btn sm ghost pfs-vid-mode-btn" data-pfs-act="open-add-video-paste" data-testid="vr-stage-paste-btn" title="Paste direct YouTube or video URL">🔗 Paste</button>
              </div>
            </div>
            <div class="pfs-vid-btns">
              <button type="button" class="btn sm ghost" data-vid-act="back10" title="Back 10 seconds">⏪ -10s</button>
              <button type="button" class="btn sm ok" data-vid-act="toggle" data-vid-sync="toggle">${vs.playing ? '⏸ Pause All' : '▶ Play All'}</button>
              <button type="button" class="btn sm ghost" data-vid-act="fwd10" title="Forward 10 seconds">+10s ⏩</button>
              ${qList.length > 1 ? `<button type="button" class="btn sm ghost" data-vid-act="next-queue" data-testid="vr-video-next-btn" title="Play next track in room playlist">⏭ Next</button>` : ''}
              <button type="button" class="btn sm ghost" data-vid-act="resync" data-testid="vr-video-sync-now" title="Snap to live room timestamp">⟳ Sync</button>
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
        htmlVideoEl.addEventListener('ended', () => {
          const curRm = partyRooms.find(r => r.id === activeRoomId);
          if (curRm && typeof handleRoomTrackEnded === 'function') handleRoomTrackEnded(curRm, 'video');
        });
        htmlVideoEl.addEventListener('error', () => {
          const curRm = partyRooms.find(r => r.id === activeRoomId);
          if (curRm) handleVideoEmbedFailure(curRm, 5, vs.videoUrl);
        });
        applyRemoteState(vs, true);
      }
    } else if (vs.kind === 'youtube') {
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
                  lastEmbedNotice = '';
                  applyRemoteState(currentSyncState || vs, true);
                },
                onError: ev => {
                  const curRm = partyRooms.find(r => r.id === activeRoomId);
                  if (curRm) handleVideoEmbedFailure(curRm, ev?.data, vidId);
                },
                onStateChange: ev => {
                  const curRm = partyRooms.find(r => r.id === activeRoomId);
                  if (!curRm) return;
                  if (ev.data === YT.PlayerState.ENDED) {
                    if (typeof handleRoomTrackEnded === 'function') handleRoomTrackEnded(curRm, 'video');
                    return;
                  }
                  if (Date.now() < suppressUntil) return;
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
                  if (ev.data === YT.PlayerState.PLAYING && lastEmbedNotice) {
                    lastEmbedNotice = '';
                    updateControlsUI();
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
    const srcKey = (vs.videoId || vs.videoUrl || (vs.kind === 'yt_search' && vs.searchQuery))
      ? `${vs.kind}:${vs.videoId || vs.videoUrl || vs.searchQuery}`
      : '';
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
    if (act === 'resync') {
      forcedLocalAdSim = false;
      wasInAd = false;
      lastEmbedNotice = '';
      localViewerStatus = 'synced';
      reportLocalViewerState(rm, 'synced', 0, true);
      applyRemoteState(vs, true);
      const liveSec = computeTarget(vs, Date.now());
      if (typeof toast === 'function') toast(`Synced to live ${fmtClock(liveSec)}`);
      return;
    }
    if (!assertRoomPerm(rm, 'control_video')) return;
    if (act === 'to-audio') {
      if (typeof setRoomMediaPlayMode === 'function') setRoomMediaPlayMode(rm, 'audio');
      return;
    }
    if (act === 'next-queue') {
      if (typeof advanceRoomQueue === 'function') advanceRoomQueue(rm);
      return;
    }
    if (!vs.videoId && !vs.videoUrl && !vs.searchQuery) return;
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

  function handlePlayerErrorForTest(code) {
    const rm = partyRooms.find(r => r.id === activeRoomId);
    if (!rm) return false;
    const vid = (currentSyncState && (currentSyncState.videoId || currentSyncState.videoUrl)) || rm.youtubeId || '';
    handleVideoEmbedFailure(rm, Number(code || 150), vid);
    return true;
  }

  function setVolume(volPct) {
    const pct = Math.max(0, Math.min(100, Math.round(Number(volPct))));
    try {
      if (htmlVideoEl) htmlVideoEl.volume = pct / 100;
      if (ytPlayer && ytReady && typeof ytPlayer.setVolume === 'function') ytPlayer.setVolume(pct);
    } catch {}
  }

  return {
    syncRoom,
    handleAction,
    broadcastSyncUpdate,
    syncSpeaker,
    setVolume,
    destroy,
    updateControlsUI,
    setLocalAdStateForTest,
    handlePlayerErrorForTest,
    getCurrentState: () => currentSyncState,
    getLocalViewerStatus: () => localViewerStatus,
    getLastEmbedNotice: () => lastEmbedNotice
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
          queue: [],
          queueIndex: -1,
          musicQueue: [],
          musicQueueIndex: -1,
          musicUrl: '',
          musicTitle: '',
          musicPlaying: false,
          youtubeId: '',
          videoTitle: '',
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

  if (res.idle) {
    const idleRoom = normalizePartyRoom(res.room);
    const idx = partyRooms.findIndex(r => r && r.id === idleRoom.id);
    if (idx >= 0) partyRooms[idx] = idleRoom;
    else partyRooms = [idleRoom, ...partyRooms].slice(0, 24);
    savePartyRoomsLocal();
    if (typeof syncOwnedRoomProfileSnapshot === 'function') {
      syncOwnedRoomProfileSnapshot(idleRoom);
    }
    if (!(opts && opts.skipPersist)) {
      persistPartyRoom(idleRoom, { fullReplace: true, silentRender: Boolean(opts && opts.silent) });
    }
    if ((activePartyRoomId === rm.id || minimizedPartyRoomId === rm.id) && !(opts && opts.skipCloseUi)) {
      closePartyRoom({ skipLeavePersist: true });
    }
    renderPartyHub();
    if (typeof buildProfile === 'function') buildProfile();
    return res;
  }

  const nextRoom = normalizePartyRoom(res.room);
  const idx = partyRooms.findIndex(r => r && r.id === nextRoom.id);
  if (idx >= 0) partyRooms[idx] = nextRoom;
  else partyRooms = [nextRoom, ...partyRooms].slice(0, 24);
  savePartyRoomsLocal();
  if (nextRoom.isOwnedRoom && typeof syncOwnedRoomProfileSnapshot === 'function') {
    syncOwnedRoomProfileSnapshot(nextRoom);
  }

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
      PartyAudioPlayer.syncFromRoom(data);
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
  if (window.PartyRoomExtrasRules && typeof window.PartyRoomExtrasRules.canSendRoomMessage === 'function') {
    const chk = window.PartyRoomExtrasRules.canSendRoomMessage(rm, uid, 'text');
    if (!chk.allowed) {
      if (typeof toast === 'function') toast(`🔒 ${chk.reason}`);
      return;
    }
  }
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

  if (window.PartyRoomExtras && typeof window.PartyRoomExtras.trackRoomDailyEvent === 'function') {
    window.PartyRoomExtras.trackRoomDailyEvent('task_msg');
  }

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

/* ===== Owned / Advanced Room (2,000 Coins One-Time) + Profile Sync ===== */
function syncOwnedRoomProfileSnapshot(rm) {
  if (!rm || !rm.isOwnedRoom || typeof me === 'undefined' || !me) return;
  const ownerId = String(rm.ownerUid || rm.creatorUid || '');
  if (!ownerId || ownerId !== uid) return;
  if (!me.ownedRoom || !me.ownedRoom.unlocked) return;
  me.ownedRoom = {
    ...me.ownedRoom,
    unlocked: true,
    isOwnedRoom: true,
    isAdvanced: true,
    roomId: rm.id,
    fixedId: rm.fixedId || rm.shortId || me.ownedRoom.fixedId,
    ownerUid: uid,
    ownerName: me.name || rm.ownerName || 'Owner',
    title: rm.title || me.ownedRoom.title,
    tag: rm.tag || me.ownedRoom.tag || 'Friends',
    mode: rm.mode || me.ownedRoom.mode || 'normal',
    cover: rm.cover || me.ownedRoom.cover || 'cover_crown',
    background: rm.background || me.ownedRoom.background || 'stage',
    password: String(rm.password || ''),
    admins: Array.isArray(rm.admins) ? rm.admins.slice(0, 3) : [],
    followers: Array.isArray(rm.followers) ? rm.followers.slice(-200) : [],
    guards: Array.isArray(rm.guards) ? rm.guards.slice(-50) : [],
    lockedSeats: Array.isArray(rm.lockedSeats) ? rm.lockedSeats : [],
    roomXp: Math.max(0, Math.floor(Number(rm.roomXp || 0))),
    boostedUntil: Number(rm.boostedUntil || 0),
    hqAudio: Boolean(rm.hqAudio),
    lastRallyAt: Number(rm.lastRallyAt || 0),
    updatedAt: Date.now()
  };
  if (typeof saveMe === 'function') saveMe();
  if (typeof patchUser === 'function' && typeof base === 'function') {
    patchUser(uid, base());
  }
  if (typeof dbOp === 'function' && typeof F !== 'undefined' && F && typeof userRef === 'function') {
    dbOp(() => F.setDoc(userRef(uid), { ownedRoom: me.ownedRoom }, { merge: true }));
  }
}

function getOrHydrateOwnedRoomRecord(ownedCfg) {
  const cfg = ownedCfg || (typeof me !== 'undefined' && me && me.ownedRoom && me.ownedRoom.unlocked ? me.ownedRoom : null);
  if (!cfg || !cfg.unlocked) return null;
  let existing = partyRooms.find(r => r && (r.id === cfg.roomId || (r.isOwnedRoom && r.ownerUid === cfg.ownerUid)));
  if (existing) {
    existing.isOwnedRoom = true;
    existing.isAdvanced = true;
    existing.fixedId = cfg.fixedId || existing.fixedId || existing.shortId;
    existing.shortId = existing.fixedId;
    return existing;
  }
  const now = Date.now();
  const room = normalizePartyRoom({
    id: cfg.roomId || ('pr_owned_' + uid),
    shortId: cfg.fixedId,
    fixedId: cfg.fixedId,
    isOwnedRoom: true,
    isAdvanced: true,
    ownerUid: cfg.ownerUid || uid,
    ownerName: cfg.ownerName || (me && me.name) || 'Owner',
    hostUid: cfg.ownerUid || uid,
    hostName: cfg.ownerName || (me && me.name) || 'Owner',
    status: 'idle',
    title: cfg.title || `${(me && me.name) || 'Player'}'s Room`,
    tag: cfg.tag || 'Friends',
    mode: cfg.mode || 'normal',
    cover: cfg.cover || 'cover_crown',
    background: cfg.background || 'stage',
    password: cfg.password || '',
    admins: Array.isArray(cfg.admins) ? cfg.admins.slice(0, 3) : [],
    followers: Array.isArray(cfg.followers) ? cfg.followers : [],
    guards: Array.isArray(cfg.guards) ? cfg.guards : [],
    micOrder: [],
    lockedSeats: Array.isArray(cfg.lockedSeats) ? cfg.lockedSeats : [],
    roomXp: Number(cfg.roomXp || 0),
    boostedUntil: Number(cfg.boostedUntil || 0),
    hqAudio: cfg.hqAudio !== false,
    lastRallyAt: Number(cfg.lastRallyAt || 0),
    seats: {},
    members: {},
    reactions: [],
    chat: [{ id: 'own_' + now.toString(36), type: 'sys', text: `👑 Welcome to ${cfg.title || 'Owned Room'} · Fixed ID ${cfg.fixedId}`, ts: now }],
    createdAt: Number(cfg.purchasedAt || now),
    updatedAt: now
  });
  partyRooms = [room, ...partyRooms.filter(r => r && r.id !== room.id)].slice(0, 28);
  savePartyRoomsLocal();
  return room;
}

function openMyOwnedPartyRoom() {
  if (typeof me === 'undefined' || !me || !me.ownedRoom || !me.ownedRoom.unlocked) {
    openAdvancedRoomUnlockModal();
    return;
  }
  const rm = getOrHydrateOwnedRoomRecord(me.ownedRoom);
  if (!rm) return toast('Unable to open Owned Room');
  const now = Date.now();
  rm.status = 'active';
  rm.ownerUid = uid;
  rm.ownerName = me.name || rm.ownerName || 'Owner';
  rm.hostUid = uid;
  rm.hostName = me.name || 'Owner';
  rm.activeHostUid = uid;
  rm.activeHostName = me.name || 'Owner';
  rm.seats = normalizePartySeats({
    ...(rm.seats || {}),
    '0': {
      uid,
      name: me.name || 'Owner',
      avatar: me.avatar || 'av_b1',
      frame: me.frame || 'fx_gold',
      muted: false,
      speaking: true,
      joinedAt: now,
      lastSeen: now,
      connected: true
    }
  });
  touchMyMemberInRoom(rm, now);
  rm.updatedAt = now;
  syncOwnedRoomProfileSnapshot(rm);
  persistPartyRoom(rm, { fullReplace: true });
  openPartyRoom(rm.id);
}
window.openMyOwnedPartyRoom = openMyOwnedPartyRoom;

function openMyOwnedRoomSettings() {
  if (typeof me === 'undefined' || !me || !me.ownedRoom || !me.ownedRoom.unlocked) {
    openAdvancedRoomUnlockModal();
    return;
  }
  const rm = getOrHydrateOwnedRoomRecord(me.ownedRoom);
  if (!rm) return;
  openPartyAdvancedPanel(rm, 'edit');
}
window.openMyOwnedRoomSettings = openMyOwnedRoomSettings;

function renderProfileOwnedRoomSection(userObj) {
  const u = userObj || (typeof me !== 'undefined' ? me : null);
  if (!u) return '';
  const rules = PRR();
  const owned = u.ownedRoom && u.ownedRoom.unlocked ? u.ownedRoom : null;
  if (!owned) {
    return `
      <section class="pf-owned-card locked" data-testid="profile-owned-room-locked" aria-label="Advanced Owned Room">
        <div class="pf-owned-head">
          <div class="pf-owned-ico locked-ico">👑</div>
          <div class="pf-owned-meta">
            <div class="pf-owned-title-row">
              <b>Owned / Advanced Room</b>
              <span class="pf-owned-badge cost">2,000 🪙 One-Time</span>
            </div>
            <small>Permanent 6-digit Fixed ID · Room Level · 3 Admins · Boost · HD Audio</small>
          </div>
        </div>
        <div class="pf-owned-foot">
          <span class="pf-owned-note">Free Normal Rooms remain free forever in Lobby</span>
          <button type="button" class="btn sm gold" id="pfOwnedUnlockBtn" data-testid="profile-owned-unlock-btn">Unlock ›</button>
        </div>
      </section>
    `;
  }
  const liveRm = partyRooms.find(r => r && (r.id === owned.roomId || (r.isOwnedRoom && r.ownerUid === u.uid))) || null;
  const now = Date.now();
  const activeCnt = liveRm && liveRm.status === 'active'
    ? (rules ? rules.getOrderedActiveMembers(liveRm, now, rules.DEFAULT_STALE_MS).length : Object.keys(liveRm.seats || {}).length)
    : 0;
  const isLive = activeCnt > 0;
  const lvInfo = rules && typeof rules.computeRoomLevel === 'function'
    ? rules.computeRoomLevel(liveRm ? liveRm.roomXp : owned.roomXp)
    : { level: 1, tierName: 'Starter Stage' };
  const coverMeta = PARTY_COVERS[liveRm?.cover || owned.cover] || PARTY_COVERS.cover_crown;
  const modeMeta = PARTY_MODES_META[liveRm?.mode || owned.mode] || PARTY_MODES_META.normal;
  const followersCnt = Array.isArray(liveRm?.followers || owned.followers) ? (liveRm?.followers || owned.followers).length : 0;
  const isBoosted = Number(liveRm?.boostedUntil || owned.boostedUntil || 0) > now;
  const hasPass = Boolean(String(liveRm?.password ?? owned.password ?? '').trim());

  return `
    <section class="pf-owned-card unlocked" data-testid="profile-owned-room-card" aria-label="My Owned Room">
      <div class="pf-owned-head">
        <div class="pf-owned-ico" style="background:${coverMeta.bg}">${coverMeta.glyph}</div>
        <div class="pf-owned-meta">
          <div class="pf-owned-title-row">
            <b data-testid="profile-owned-room-title">${esc(liveRm?.title || owned.title)}</b>
            <span class="pf-owned-badge ${isLive ? 'live' : 'idle'}" data-testid="profile-owned-room-status">${isLive ? `● ${activeCnt} Live` : '○ Ready'}</span>
          </div>
          <div class="pf-owned-chips">
            <span class="pf-own-chip id">ID ${esc(owned.fixedId)}</span>
            <span class="pf-own-chip lv">Lv.${lvInfo.level}</span>
            <span class="pf-own-chip">${esc(liveRm?.tag || owned.tag || 'Friends')} · ${esc(modeMeta.name)}</span>
            ${hasPass ? '<span class="pf-own-chip lock">🔒 Locked</span>' : ''}
            ${isBoosted ? '<span class="pf-own-chip boost">🚀 Boosted</span>' : ''}
          </div>
          <small class="pf-owned-sub">${followersCnt} Followers · ${Array.isArray(liveRm?.admins || owned.admins) ? (liveRm?.admins || owned.admins).length : 0}/3 Admins · ${(liveRm?.hqAudio ?? owned.hqAudio) ? '🎧 HD Mode' : 'Standard Audio'}</small>
        </div>
      </div>
      <div class="pf-owned-actions">
        <button type="button" class="btn sm ghost" id="pfOwnedManageBtn" data-testid="profile-owned-manage-btn">⚙️ Settings</button>
        <button type="button" class="btn sm gold" id="pfOwnedEnterBtn" data-testid="profile-owned-enter-btn">Enter Room →</button>
      </div>
    </section>
  `;
}
window.renderProfileOwnedRoomSection = renderProfileOwnedRoomSection;

function openAdvancedRoomUnlockModal(prefill) {
  const rules = PRR();
  const pre = prefill || {};
  if (typeof me !== 'undefined' && me && me.ownedRoom && me.ownedRoom.unlocked) {
    openMyOwnedPartyRoom();
    return;
  }
  const cost = (rules && rules.ADVANCED_ROOM_COST) || 2000;
  const perks = (rules && Array.isArray(rules.ADVANCED_ROOM_PERKS)) ? rules.ADVANCED_ROOM_PERKS : [];
  const bal = Number((typeof me !== 'undefined' && me && me.coins) || 0);
  const canAfford = bal >= cost;
  const defTitle = String(pre.title || `${(me && me.name) || 'Player'}'s Club`).trim().slice(0, 36);
  const defTag = PARTY_TAGS.includes(pre.tag) ? pre.tag : 'Friends';
  const defMode = PARTY_MODES_META[pre.mode] ? pre.mode : 'normal';

  const m = modal('👑 Create Advanced Room', `
    <div class="adv-unlock-shell" data-testid="adv-unlock-modal">
      <div class="adv-hero-card">
        <div class="adv-hero-top">
          <div>
            <span class="adv-one-time-pill">ONE-TIME PERMANENT UNLOCK</span>
            <h4 class="adv-hero-h">Own Your Permanent Voice Room</h4>
          </div>
          <div class="adv-price-box">
            <b>2,000 🪙</b>
            <small>Pay once · Keep forever</small>
          </div>
        </div>
        <div class="adv-bal-row">
          <span>Your Balance: <b class="${canAfford ? 'ok' : 'bad'}" data-testid="adv-balance-val">${bal.toLocaleString()} 🪙</b></span>
          <span>${canAfford ? '✓ Ready to unlock' : `Need ${(cost - bal).toLocaleString()} more coins`}</span>
        </div>
      </div>

      <div class="adv-perks-grid" data-testid="adv-perks-grid">
        ${perks.map(p => `
          <div class="adv-perk-item">
            <span class="adv-perk-ico">${p.icon}</span>
            <div class="adv-perk-txt">
              <b>${esc(p.name)}</b>
              <small>${esc(p.shortDesc)}</small>
            </div>
          </div>
        `).join('')}
      </div>

      <div class="adv-init-fields">
        <label for="advInitTitle">Your Permanent Room Name</label>
        <input id="advInitTitle" maxlength="36" value="${esc(defTitle)}" placeholder="e.g. Midnight Music Club" data-testid="adv-init-title">
        <div class="adv-init-row">
          <div>
            <label for="advInitTag">Category Tag</label>
            <select id="advInitTag">
              ${PARTY_TAGS.map(t => `<option value="${esc(t)}" ${t === defTag ? 'selected' : ''}>${esc(t)}</option>`).join('')}
            </select>
          </div>
          <div>
            <label for="advInitMode">Default Mode</label>
            <select id="advInitMode">
              ${Object.values(PARTY_MODES_META).map(md => `<option value="${esc(md.id)}" ${md.id === defMode ? 'selected' : ''}>${esc(md.name)}</option>`).join('')}
            </select>
          </div>
        </div>
      </div>

      <button type="button" class="btn gold full adv-buy-cta" id="advBuyConfirmBtn" data-testid="adv-buy-confirm-btn">
        ${canAfford ? '👑 Unlock Advanced Room · 2,000 🪙' : 'Need 2,000 🪙 to Unlock'}
      </button>
      <p class="adv-free-hint">Want a free temporary room? Close this and use <b>Normal Room (Free)</b> anytime.</p>
    </div>
  `, 'adv-unlock-modal-box');

  const buyBtn = $('#advBuyConfirmBtn', m);
  if (buyBtn) {
    buyBtn.onclick = () => {
      const title = ($('#advInitTitle', m)?.value || '').trim() || `${(me && me.name) || 'Player'}'s Room`;
      const tag = $('#advInitTag', m)?.value || 'Friends';
      const mode = $('#advInitMode', m)?.value || 'normal';
      const res = rules && typeof rules.unlockAdvancedRoomPurchase === 'function'
        ? rules.unlockAdvancedRoomPurchase(me, { title, tag, mode, nowMs: Date.now() })
        : null;
      if (!res || !res.ok) {
        return toast(res?.error || 'Need 2,000 coins to unlock Advanced Room');
      }
      if (!res.alreadyUnlocked && res.cost > 0) {
        if (typeof addReward === 'function') {
          addReward(-res.cost, 0, null, true, { silentSfx: true });
        } else {
          me.coins = res.remainingCoins;
        }
      }
      me.ownedRoom = res.ownedRoom;
      if (typeof saveMe === 'function') saveMe();
      if (typeof patchUser === 'function' && typeof base === 'function') patchUser(uid, base());
      if (typeof dbOp === 'function' && typeof F !== 'undefined' && F && typeof userRef === 'function') {
        dbOp(() => F.setDoc(userRef(uid), { ownedRoom: me.ownedRoom, coins: me.coins }, { merge: true }));
      }
      if (typeof updateHud === 'function') updateHud();
      if (typeof buildProfile === 'function') buildProfile();
      if (typeof playSfx === 'function') playSfx('levelUp');
      toast(`👑 Owned Room Unlocked! Fixed ID: ${me.ownedRoom.fixedId}`);
      m.close();
      openMyOwnedPartyRoom();
    };
  }
}
window.openAdvancedRoomUnlockModal = openAdvancedRoomUnlockModal;

function renderPartyHub() {
  if (typeof activeAppTab !== 'undefined' && activeAppTab !== 'tools') {
    if (typeof markTabsDirty === 'function') markTabsDirty('tools');
    return;
  }
  const host = $('#homePartyRooms') || $('#partyRoomsHost');
  if (!host) return;
  const now = Date.now();
  const rules = PRR();
  const filteredRooms = rules && typeof rules.filterLobbyRooms === 'function'
    ? rules.filterLobbyRooms(partyRooms || [], partyLobbyCategory, now).slice(0, 14)
    : (partyRooms || []).filter(r => r && r.status === 'active' && (!r.expiresAt || Number(r.expiresAt) > now)).slice(0, 14);
  const isDev = typeof isDevSession === 'function' ? isDevSession() : (typeof devMode !== 'undefined' && devMode);
  const hasOwned = Boolean(typeof me !== 'undefined' && me && me.ownedRoom && me.ownedRoom.unlocked);

  host.innerHTML = `
    <div class="wp-sec-bar">
      <b>Voice &amp; Party</b>
      <div class="row" style="gap:6px">
        ${isDev ? '<button type="button" class="wp-pill-btn red" id="partyClearFakeBtn" title="Clear fake, seed, empty or stale voice rooms">🧹 Clear Fake</button>' : ''}
        ${hasOwned ? '<button type="button" class="wp-pill-btn owned-shortcut" id="partyMyOwnedBtn" data-testid="lobby-my-owned-btn" title="Enter My Owned Room">👑 My Room</button>' : ''}
        <button type="button" class="wp-pill-btn gold" id="partyHostBtn" data-testid="lobby-create-room-btn">+ Create Room</button>
      </div>
    </div>

    <div class="plb-cat-tabs" role="tablist" aria-label="Room Lobby Categories" data-testid="lobby-cat-tabs">
      ${PARTY_LOBBY_CATEGORIES.map(cat => `
        <button type="button" role="tab" aria-selected="${partyLobbyCategory === cat ? 'true' : 'false'}" class="plb-cat-tab ${partyLobbyCategory === cat ? 'active' : ''}" data-lobby-cat="${esc(cat)}" data-testid="lobby-cat-${esc(cat.toLowerCase())}">${esc(cat)}</button>
      `).join('')}
    </div>

    ${filteredRooms.length ? `<div class="party-grid plb-room-grid" data-testid="lobby-room-grid">${filteredRooms.map(rm => {
      const bgMeta = PARTY_BG_META[rm.background] || PARTY_BG_META.club;
      const modeMeta = PARTY_MODES_META[rm.mode] || PARTY_MODES_META.normal;
      const coverMeta = PARTY_COVERS[rm.cover] || PARTY_COVERS.cover_tensura;
      const activeCount = rules
        ? rules.getOrderedActiveMembers(rm, now, rules.DEFAULT_STALE_MS).length
        : Object.values(normalizePartySeats(rm.seats)).filter(Boolean).length;
      const isMinimizedHere = minimizedPartyRoomId === rm.id;
      const isBoosted = Number(rm.boostedUntil || 0) > now;
      const hasPass = Boolean(String(rm.password || '').trim());
      const lvInfo = rules && typeof rules.computeRoomLevel === 'function' ? rules.computeRoomLevel(rm.roomXp) : { level: 1 };
      return `<button type="button" class="party-room-card plb-card glossy-card ${isMinimizedHere ? 'is-vr-floating' : ''} ${isBoosted ? 'is-boosted' : ''} ${rm.isOwnedRoom ? 'is-owned' : ''}" data-openparty="${esc(rm.id)}" data-testid="lobby-room-card" style="background:${bgMeta.css}">
        <div class="plb-card-main">
          <div class="plb-cover" style="background:${coverMeta.bg}">
            <span class="plb-cover-glyph">${coverMeta.glyph}</span>
            ${rm.isOwnedRoom ? `<span class="plb-cover-lv">Lv.${lvInfo.level}</span>` : ''}
          </div>
          <div class="plb-body">
            <div class="prc-top">
              <div class="plb-badges">
                <span class="prc-cat">${esc(rm.tag || modeMeta.badge)}</span>
                <span class="plb-mode-pill">${esc(modeMeta.name)}</span>
                ${rm.isOwnedRoom ? '<span class="plb-badge owned">👑 Owned</span>' : ''}
                ${isBoosted ? '<span class="plb-badge boost">🚀 Boost</span>' : ''}
                ${hasPass ? '<span class="plb-badge lock" title="Password Protected">🔒</span>' : ''}
                ${rm.hqAudio ? '<span class="plb-badge hq">HD</span>' : ''}
              </div>
              <span class="prc-live">● ${activeCount}</span>
            </div>
            <div class="prc-title">${esc(rm.title)}</div>
            <div class="prc-foot">
              <span class="prc-host-lbl">${esc(rm.hostName || 'Owner')} · ID ${esc(rm.fixedId || rm.shortId)}</span>
              <span class="prc-join">${isMinimizedHere ? 'Resume →' : 'Enter →'}</span>
            </div>
          </div>
        </div>
      </button>`;
    }).join('')}</div>` : `<div class="mp-empty" data-testid="lobby-empty" style="margin-top:6px">No live rooms in <b>${esc(partyLobbyCategory)}</b> right now. Tap <b>+ Create Room</b> to start a free room!</div>`}`;

  if ($('#partyHostBtn', host)) {
    $('#partyHostBtn', host).onclick = () => openCreatePartyRoomModal();
  }
  if ($('#partyMyOwnedBtn', host)) {
    $('#partyMyOwnedBtn', host).onclick = () => openMyOwnedPartyRoom();
  }
  if ($('#partyClearFakeBtn', host)) {
    $('#partyClearFakeBtn', host).onclick = () => clearFakeVoiceRooms();
  }
  host.onclick = e => {
    if (e.target.closest('#partyHostBtn') || e.target.closest('#partyMyOwnedBtn') || e.target.closest('#partyClearFakeBtn')) return;
    const catBtn = e.target.closest('[data-lobby-cat]');
    if (catBtn && catBtn.dataset.lobbyCat) {
      partyLobbyCategory = catBtn.dataset.lobbyCat;
      renderPartyHub();
      return;
    }
    const btn = e.target.closest('[data-openparty]');
    if (btn && btn.dataset.openparty) openPartyRoom(btn.dataset.openparty);
  };
}

function openCreatePartyRoomModal() {
  const hasOwned = Boolean(typeof me !== 'undefined' && me && me.ownedRoom && me.ownedRoom.unlocked);
  let selectedMode = 'normal';
  let selectedTag = 'Friends';
  let selectedCover = 'cover_tensura';

  const m = modal('Create Room', `
    <div class="crm-shell" data-testid="create-room-modal">
      <div class="crm-free-badge-row">
        <span class="crm-free-pill">FREE NORMAL / TEMPORARY ROOM</span>
        <small>0 Coins · Instant Room</small>
      </div>

      <label for="prTitle">Room Title</label>
      <input id="prTitle" maxlength="36" placeholder="${esc((me && me.name) || 'My')} Voice Lounge" data-testid="create-room-title">

      <label style="margin-top:9px">Room Mode</label>
      <div class="crm-mode-grid" data-testid="create-room-modes">
        ${Object.values(PARTY_MODES_META).map(md => `
          <button type="button" class="crm-pill-opt ${md.id === selectedMode ? 'active' : ''}" data-crm-mode="${esc(md.id)}">${esc(md.name)}</button>
        `).join('')}
      </div>

      <label style="margin-top:9px">Room Tag</label>
      <div class="crm-tag-row" data-testid="create-room-tags">
        ${PARTY_TAGS.map(tg => `
          <button type="button" class="crm-pill-opt ${tg === selectedTag ? 'active' : ''}" data-crm-tag="${esc(tg)}">${esc(tg)}</button>
        `).join('')}
      </div>

      <div class="crm-two-col" style="margin-top:9px">
        <div>
          <label for="prBg">Stage Theme</label>
          <select id="prBg">
            ${Object.values(PARTY_BG_META).map(b => `<option value="${b.id}">${b.name}</option>`).join('')}
          </select>
        </div>
        <div>
          <label for="prCover">Room Cover</label>
          <select id="prCover">
            ${Object.entries(PARTY_COVERS).map(([cid, cv]) => `<option value="${cid}">${cv.glyph} ${cv.name}</option>`).join('')}
          </select>
        </div>
      </div>

      <button type="button" class="btn ok full" id="prCreateGo" data-testid="create-free-room-submit" style="margin-top:12px">Create Free Normal Room</button>

      <div class="crm-divider"><span>OR PERMANENT ROOM</span></div>

      <button type="button" class="crm-adv-banner ${hasOwned ? 'unlocked' : ''}" id="prOpenAdvancedBtn" data-testid="create-advanced-room-btn">
        <div class="crm-adv-left">
          <span class="crm-adv-ico">👑</span>
          <div class="crm-adv-txt">
            <b>${hasOwned ? `Enter My Owned Room (${esc(me.ownedRoom.title)})` : 'Create Advanced Room >'}</b>
            <small>${hasOwned
              ? `Fixed ID ${esc(me.ownedRoom.fixedId)} · Unlocked permanently · Tap to enter`
              : '2,000 Coins One-Time · Permanent Fixed ID · 8 Perks · 3 Admins · Boost'
            }</small>
          </div>
        </div>
        <span class="crm-adv-chev">${hasOwned ? 'Enter ›' : '2,000 🪙 ›'}</span>
      </button>
    </div>
  `, 'crm-modal');

  m.addEventListener('click', (e) => {
    const mBtn = e.target.closest('[data-crm-mode]');
    if (mBtn && mBtn.dataset.crmMode) {
      selectedMode = mBtn.dataset.crmMode;
      $$('[data-crm-mode]', m).forEach(b => b.classList.toggle('active', b === mBtn));
      return;
    }
    const tBtn = e.target.closest('[data-crm-tag]');
    if (tBtn && tBtn.dataset.crmTag) {
      selectedTag = tBtn.dataset.crmTag;
      $$('[data-crm-tag]', m).forEach(b => b.classList.toggle('active', b === tBtn));
      return;
    }
  });

  $('#prOpenAdvancedBtn', m).onclick = () => {
    const draftTitle = ($('#prTitle', m)?.value || '').trim();
    m.close();
    if (hasOwned) openMyOwnedPartyRoom();
    else openAdvancedRoomUnlockModal({ title: draftTitle, tag: selectedTag, mode: selectedMode });
  };

  $('#prCreateGo', m).onclick = () => {
    const title = ($('#prTitle', m).value || '').trim() || `${me.name || 'Player'}'s Room`;
    const mode = selectedMode || 'normal';
    const tag = selectedTag || 'Friends';
    const background = $('#prBg', m).value || 'club';
    selectedCover = ($('#prCover', m) && $('#prCover', m).value) || 'cover_tensura';
    const now = Date.now();
    const id = 'pr_' + now.toString(36) + Math.random().toString(36).slice(2, 5);
    const room = normalizePartyRoom({
      id,
      shortId: makeRoomShortId(id),
      isOwnedRoom: false,
      isAdvanced: false,
      status: 'active',
      title,
      tag,
      cover: selectedCover,
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
      chat: [{ id: 'sys_' + now, type: 'sys', text: `${me.name || 'Player'} opened Free Normal Room (${tag}). Seats 0-3 = Mic (max 4).`, ts: now }],
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

function openPartyRoom(roomId, opts) {
  initPartyRoomBroadcastChannel();
  const o = opts || {};
  const room = partyRooms.find(r => r && r.id === roomId && r.status !== 'closed');
  if (!room) return toast('Room not found or already closed');
  if (room.kickedUids && room.kickedUids.includes(uid) && !isSingleOwner(room, uid)) {
    return toast('You cannot re-enter this room');
  }

  // Password gate for non-owner / non-admin members on password-protected rooms
  const roomPass = String(room.password || '').trim();
  if (roomPass && !canModerateRoom(room) && !o.passwordVerified && !unlockedRoomPasswords.has(room.id)) {
    const pm = modal(`🔒 Enter Room Password`, `
      <p style="font-size:13px;color:var(--mu);margin:0 0 10px"><b>${esc(room.title)}</b> is protected by a room password.</p>
      <input id="prPassIn" type="password" maxlength="20" placeholder="Enter room password..." data-testid="room-password-input" autocomplete="off">
      <button type="button" class="btn gold full" id="prPassGo" data-testid="room-password-submit" style="margin-top:10px">Unlock &amp; Enter</button>
    `);
    const submitPass = () => {
      const val = ($('#prPassIn', pm)?.value || '').trim();
      if (val !== roomPass) return toast('Incorrect room password');
      unlockedRoomPasswords.add(room.id);
      pm.close();
      openPartyRoom(room.id, { passwordVerified: true });
    };
    $('#prPassGo', pm).onclick = submitPass;
    $('#prPassIn', pm).onkeydown = (ev) => { if (ev.key === 'Enter') { ev.preventDefault(); submitPass(); } };
    return;
  }

  // Reactivate idle owned room when entered
  if (room.status === 'idle') {
    room.status = 'active';
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
  if (room.isOwnedRoom) {
    room.roomXp = Math.max(0, Number(room.roomXp || 0)) + 5;
    syncOwnedRoomProfileSnapshot(room);
  }
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
  PartyAudioPlayer.setOnEnded(() => {
    const curId = getCurrentVrRoomId();
    if (!curId) return;
    const curRm = partyRooms.find(r => r && r.id === curId);
    if (curRm && typeof handleRoomTrackEnded === 'function') {
      handleRoomTrackEnded(curRm, 'audio');
    }
  });
  PartyAudioPlayer.syncFromRoom(room);
  if (typeof setMyLiveActivity === 'function') {
    setMyLiveActivity({ type: 'party', roomId: room.id, roomCode: room.fixedId || room.shortId || room.id, gameName: room.title || 'Voice Room' });
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
  const isPartnerSlot = Number(idx) === 1 && Boolean(rm.partnerSeat);
  const roleTag = isPartnerSlot ? '💞 Partner' : (micEligible ? `Mic #${idx + 1}` : 'Listener');
  const isLocked = Array.isArray(rm.lockedSeats) && rm.lockedSeats.includes(Number(idx));

  if (!s) {
    return `<button type="button" class="pfs-seat empty compact ${isLocked ? 'is-locked' : ''} ${isPartnerSlot ? 'is-partner' : ''}" data-sit="${idx}" data-testid="vr-seat-${idx}" aria-label="Seat ${idx} (${isLocked ? 'Locked' : roleTag})">
      <div class="pfs-seat-ring open-ring"><span>${isLocked ? '🔒' : (isPartnerSlot ? '💞' : '+')}</span></div>
      <div class="pfs-seat-name">${idx === 0 ? 'Owner' : (isLocked ? 'Closed' : (isPartnerSlot ? 'Partner' : `Seat ${idx}`))}</div>
      <small class="pfs-seat-role">${isLocked ? 'Locked' : roleTag}</small>
    </button>`;
  }

  const isOwnerSeat = isSingleOwner(rm, s.uid);
  const isAdm = !isOwnerSeat && isRoomAdmin(rm, s.uid);
  const isGuard = Array.isArray(rm.guards) && rm.guards.some(g => g && g.uid === s.uid);
  const speaking = micEligible && !s.muted;
  const seatRx = activeSeatReactions.get(s.uid);
  const rxHtml = seatRx && seatRx.expiresAt > Date.now()
    ? `<span class="pfs-seat-rx" data-testid="vr-seat-reaction">${esc(seatRx.emoji)}</span>`
    : '';
  const pkScore = rm.pkSession && rm.pkSession.status === 'active' && rm.pkSession.seatScores && rm.pkSession.seatScores[s.uid]
    ? Number(rm.pkSession.seatScores[s.uid].score || 0)
    : 0;
  const pkTier = pkScore > 0 && window.PartyRoomExtrasRules
    ? window.PartyRoomExtrasRules.getMicOutfitTier(pkScore)
    : null;

  return `<div class="pfs-seat-wrap compact">
    <button type="button" class="pfs-seat occupied compact ${speaking ? 'is-speaking' : ''} ${s.uid === uid ? 'is-me' : ''} ${isPartnerSlot ? 'is-partner' : ''}" data-seat-idx="${idx}" data-seat-uid="${esc(s.uid)}" data-testid="vr-seat-${idx}">
      <div class="pfs-seat-ring" ${pkTier && pkTier.minScore > 0 ? `style="box-shadow:0 0 0 2px ${pkTier.color}"` : ''}>
        ${speaking ? '<span class="pfs-wave w1"></span>' : ''}
        ${av(s, 44)}
        ${rxHtml}
        <span class="pfs-mic-dot ${!micEligible ? 'muted' : (s.muted ? 'muted' : 'live')}">${!micEligible ? '👂' : (s.muted ? '🔇' : '🎙️')}</span>
      </div>
      <div class="pfs-seat-name">${esc(s.name || 'Player')}</div>
      <div class="pfs-seat-meta">
        ${isOwnerSeat ? '<span class="pfs-owner-tag" data-testid="vr-owner-badge">OWNER</span>' : (isAdm ? '<span class="pfs-role-chip admin" data-testid="vr-admin-badge">ADMIN</span>' : (pkTier && pkTier.badge ? `<span class="pfs-role-chip pk">${esc(pkTier.badge)}</span>` : (isGuard ? '<span class="pfs-role-chip guard">⚔️ GUARD</span>' : `<span class="pfs-seat-role">${roleTag}</span>`)))}
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
  const extras = window.PartyRoomExtras || null;
  const activeCount = rules
    ? rules.getOrderedActiveMembers(rm, Date.now(), rules.DEFAULT_STALE_MS).length
    : Object.keys(rm.seats || {}).length;

  const modeStages = window.PartyModeStages || null;
  root.style.background = modeStages && typeof modeStages.getModeBackdropOverride === 'function'
    ? modeStages.getModeBackdropOverride(rm, bgMeta.css)
    : bgMeta.css;

  // Mount shell once per room so chat/seat/mic updates NEVER destroy or reload the live video player!
  if (root.dataset.mountedRoomId !== rm.id || !root.querySelector('#pfsVideoSlot')) {
    root.dataset.mountedRoomId = rm.id;
    root.innerHTML = `
      <div class="pfs-shell pfs-v14" id="pfsShellRoot">
        <div class="pfs-fx-layer" id="pfsFxLayer" data-testid="vr-fx-layer" aria-live="polite"></div>
        <header class="pfs-top-v14" id="pfsHdrSlot"></header>
        <div class="pfs-subbar" id="pfsSubbarSlot"></div>
        <div class="pfs-main-scroll">
          <div class="pfs-video-slot" id="pfsVideoSlot"></div>
          <div class="pfs-audio-slot" id="pfsAudioSlot"></div>
          <div class="pfs-pk-slot" id="pfsPkSlot"></div>
          <div class="pfs-stage" id="pfsStageSlot"></div>
          <div class="pfs-rx-ticker" id="pfsRxTicker" data-testid="vr-reaction-ticker" hidden></div>
          <div class="pfs-react-dock" id="pfsReactDock" data-testid="vr-react-dock">
            ${PARTY_REACTIONS.map(em => `<button type="button" class="pfs-react-btn" data-react="${em}" aria-label="React ${em}">${em}</button>`).join('')}
          </div>
          <div class="pfs-chat-feed" id="pfsChatFeed" data-testid="vr-chat-feed"></div>
        </div>
        <div class="pfs-dock pfs-dock-v14" id="pfsDockSlot" data-testid="vr-bottom-dock">
          <button type="button" class="pfs-dock-ico ${partySpeakerOn ? 'on' : 'off'}" id="pfsSpkBtn" data-pfs-act="toggle-speaker" aria-label="Toggle Speaker">${partySpeakerOn ? '🔊' : '🔈'}</button>
          <button type="button" class="pfs-dock-ico ${canSpeak ? (mySeat.muted ? 'muted' : 'live') : 'muted'}" id="pfsMicBtn" data-pfs-act="toggle-mic" aria-label="Toggle Microphone">${!canSpeak ? '👂' : (mySeat.muted ? '🔇' : '🎙️')}</button>
          <input id="pfsChatIn" maxlength="160" placeholder="Type message..." aria-label="Room chat message" autocomplete="off">
          <button type="button" class="pfs-dock-send" data-pfs-act="send-chat" data-testid="vr-chat-send" aria-label="Send message">➤</button>
          <button type="button" class="pfs-dock-ico emoji" data-pfs-act="toggle-emoji-dock" data-testid="vr-dock-emoji-btn" title="Emoji Reactions" aria-label="Toggle Emoji Reactions">😊</button>
          <button type="button" class="pfs-dock-ico gift" data-pfs-act="open-gift" data-testid="vr-dock-gift-btn" title="Send Gift" aria-label="Send Gift">🎁</button>
          <button type="button" class="pfs-dock-ico box" data-pfs-act="open-daily-tasks" data-testid="vr-dock-daily-btn" title="Daily Task Treasure Boxes" aria-label="Daily Task Treasure Boxes">🧰<span class="pfs-dock-badge" data-daily-badge hidden></span></button>
          <button type="button" class="pfs-dock-ico more" data-pfs-act="open-room-menu" data-testid="vr-dock-more-btn" title="Room Mode &amp; Function Menu" aria-label="More Room Controls">⋯</button>
        </div>
      </div>
    `;
  }

  const hdr = $('#pfsHdrSlot', root);
  if (hdr) {
    const lvInfo = rules && typeof rules.computeRoomLevel === 'function' ? rules.computeRoomLevel(rm.roomXp) : { level: 1 };
    const isBoosted = Number(rm.boostedUntil || 0) > Date.now();
    const cov = PARTY_COVERS[rm.cover] || PARTY_COVERS.cover_tensura;
    hdr.innerHTML = `
      <div class="pfs-hdr-left">
        <button type="button" class="pfs-hdr-btn" data-pfs-act="minimize" data-testid="vr-back-btn" title="Minimize to Floating VR" aria-label="Back to Floating VR">←</button>
        <button type="button" class="pfs-hdr-info-trigger" data-pfs-act="open-room-info" data-testid="vr-hdr-info-btn" aria-label="Open Room Info and Members">
          <span class="pfs-hdr-cov" style="background:${cov.bg}" aria-hidden="true">${cov.glyph}</span>
          <span class="pfs-hdr-meta">
            <span class="pfs-hdr-title-row">
              <b class="pfs-title">${rm.isOwnedRoom ? '👑 ' : ''}${esc(rm.title)}</b>
              ${rm.isOwnedRoom ? `<span class="pfs-lv-pill">Lv.${lvInfo.level}</span>` : ''}
              ${rm.hqAudio ? '<span class="pfs-hd-pill">HD</span>' : ''}
              ${isBoosted ? '<span class="pfs-boost-pill">🚀</span>' : ''}
            </span>
            <span class="pfs-hdr-id-row">
              <span class="pfs-id-btn" data-testid="vr-owner-header">ID ${esc(rm.fixedId || rm.shortId)} · ${Math.max(1, activeCount)} live · ${esc(rm.hostName)}</span>
            </span>
          </span>
        </button>
      </div>
      <div class="pfs-hdr-right">
        <button type="button" class="pfs-hdr-btn" data-pfs-act="open-create-pk" data-testid="vr-hdr-pk-btn" title="Create PvP / PK" aria-label="Create PvP or PK">⚔️</button>
        <button type="button" class="pfs-hdr-btn" data-pfs-act="open-invite" data-testid="vr-hdr-invite-btn" title="Invite Friends" aria-label="Invite to Room">👥</button>
        <button type="button" class="pfs-hdr-btn ${rm.isOwnedRoom ? 'gold-ring' : ''}" data-pfs-act="open-room-menu" data-testid="vr-hdr-menu-btn" title="Room Mode &amp; Functions" aria-label="Room Menu">⋯</button>
        <button type="button" class="pfs-hdr-btn exit" data-pfs-act="exit-room" data-testid="vr-exit-btn" title="Leave VR Room" aria-label="Leave VR Room">✕</button>
      </div>
    `;
  }

  const subbar = $('#pfsSubbarSlot', root);
  if (subbar) {
    const qList = Array.isArray(rm.queue) && rm.queue.length ? rm.queue : (Array.isArray(rm.musicQueue) ? rm.musicQueue : []);
    const qCount = qList.length;
    const isVidMode = rm.mode === 'video' && rm.mediaPlayMode === 'video';
    const hasActiveVideo = isVidMode && Boolean(rm.youtubeId || rm.videoSync?.videoId || rm.videoSync?.videoUrl || rm.videoSync?.searchQuery);
    subbar.innerHTML = `
      <div class="pfs-subbar-left">
        <button type="button" class="pfs-mode-chip" data-pfs-act="open-room-menu" data-testid="vr-subbar-mode-btn">${esc(modeMeta.name)} · ${esc(rm.tag || 'Friends')} ▾</button>
        ${hasActiveVideo
          ? `<button type="button" class="pfs-vid-sub-btn playlist" data-pfs-act="open-playlist" data-testid="vr-subbar-playlist-btn" aria-label="Open Room Playlist">☰ Playlist${qCount ? ` (${qCount})` : ''}</button>`
          : `<button type="button" class="pfs-vid-sub-btn add" data-pfs-act="open-add-video" data-testid="vr-subbar-add-video" aria-label="Add YouTube video">🎬 Add video</button>`
        }
      </div>
      <div class="pfs-subbar-right">
        <button type="button" class="pfs-vid-sub-btn wtw" data-pfs-act="open-whos-winner" data-testid="vr-subbar-wtw-btn" aria-label="Play Who's the Winner">🏆 Winner</button>
        <button type="button" class="pfs-vid-sub-btn perks" data-pfs-act="open-full-settings" data-testid="vr-hdr-perks-btn" aria-label="Room Settings">⚙️</button>
      </div>
    `;
  }

  const shellEl = $('#pfsShellRoot', root);
  if (shellEl && modeStages && typeof modeStages.getModeThemeClass === 'function') {
    const targetCls = modeStages.getModeThemeClass(rm.mode);
    if (shellEl.dataset.modeCls !== targetCls) {
      shellEl.classList.remove('pfs-mode-normal', 'pfs-mode-acquaint', 'pfs-mode-auction', 'pfs-mode-video', 'pfs-mode-games');
      shellEl.classList.add(targetCls);
      shellEl.dataset.modeCls = targetCls;
    }
  }

  const videoSlot = $('#pfsVideoSlot', root);
  if (videoSlot) {
    if (rm.mode === 'video') {
      PartyVideoSync.syncRoom(rm, videoSlot);
    } else if (videoSlot.innerHTML) {
      PartyVideoSync.destroy();
      videoSlot.innerHTML = '';
    }
  }

  const audioSlot = $('#pfsAudioSlot', root);
  if (audioSlot && extras && typeof extras.renderRoomAudioStageBar === 'function') {
    const nextAudioHtml = extras.renderRoomAudioStageBar(rm);
    if (audioSlot.dataset.lastHtml !== nextAudioHtml) {
      audioSlot.dataset.lastHtml = nextAudioHtml;
      audioSlot.innerHTML = nextAudioHtml;
    }
  }

  const pkSlot = $('#pfsPkSlot', root);
  if (pkSlot && extras && typeof extras.renderRoomPkStageBanner === 'function') {
    pkSlot.innerHTML = extras.renderRoomPkStageBanner(rm);
  }

  const stage = $('#pfsStageSlot', root);
  if (stage) {
    if (modeStages && typeof modeStages.renderActiveModeStage === 'function') {
      modeStages.renderActiveModeStage(rm, stage, renderSeatTile);
    } else {
      stage.innerHTML = `
        <div class="pfs-owner-solo">${renderSeatTile(rm, 0)}</div>
        <div class="pfs-seats-4col">
          ${[1, 2, 3, 4, 5, 6, 7, 8].map(i => renderSeatTile(rm, i)).join('')}
        </div>
      `;
    }
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
  if (extras && typeof extras.updateDailyBadgeDom === 'function') {
    extras.updateDailyBadgeDom();
  }
}

function partyTakeSeat(rm, idx) {
  if (!rm) return;
  if (rm.kickedUids && rm.kickedUids.includes(uid) && !isSingleOwner(rm, uid)) {
    return toast('You cannot take a seat in this room');
  }
  const key = String(idx);
  const seatNum = Number(idx);
  const isLocked = Array.isArray(rm.lockedSeats) && rm.lockedSeats.includes(seatNum);
  if (isLocked && !canModerateRoom(rm)) {
    return toast('🔒 This seat is locked by Room Owner / Admin');
  }
  if (seatNum === 0 && !isSingleOwner(rm, uid)) {
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
  const canSpeak = isMicSeatIndex(seatNum);
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
  rm.seats = normalizePartySeats(nextSeats);
  if (Array.isArray(rm.micOrder) && rm.micOrder.some(x => x && x.uid === uid)) {
    rm.micOrder = rm.micOrder.filter(x => x && x.uid !== uid);
  }
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
  rm.seats = normalizePartySeats(nextSeats);
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
  const targetIsAdmin = !targetIsOwner && isRoomAdmin(rm, s.uid);
  const rules = PRR();
  const maxAdmins = (rules && rules.MAX_ROOM_ADMINS) || 3;
  const curAdminCnt = Array.isArray(rm.admins) ? rm.admins.length : 0;

  const m = modal(`${esc(s.name)}`, `
    <div class="row" style="gap:10px;margin-bottom:12px">
      ${av(s, 48)}
      <div class="mid">
        <b>${esc(s.name)}</b>
        <small style="color:var(--mu)">${targetIsOwner ? '👑 Room Owner' : (targetIsAdmin ? '🛡️ Room Admin' : (isMicSeatIndex(seatIdx) ? '🎙️ Mic Seat' : '👂 Listener'))}</small>
      </div>
    </div>
    <div class="list" style="gap:7px">
      ${isMe ? `<button type="button" class="btn red full" id="smLeave">Leave Seat</button>` : ''}
      ${!isMe && amAdmin && !targetIsOwner ? `
        <button type="button" class="btn ghost full" id="smMute">${s.muted ? 'Unmute Mic' : 'Mute Mic'}</button>
        <button type="button" class="btn red full" id="smKick">Kick From Room</button>
      ` : ''}
      ${!isMe && amOwner && !targetIsOwner ? `
        <button type="button" class="btn gold full" id="smAdmin">${targetIsAdmin ? 'Remove Admin' : `Make Admin (${curAdminCnt}/${maxAdmins})`}</button>
      ` : ''}
      ${!isMe ? `<button type="button" class="btn ok full" id="smGift">Send Gift</button>` : ''}
    </div>
  `);

  if ($('#smLeave', m)) $('#smLeave', m).onclick = () => { partyLeaveSeat(rm); m.close(); };
  if ($('#smMute', m)) $('#smMute', m).onclick = () => {
    if (!assertRoomPerm(rm, 'mute_member')) return;
    rm.seats[String(seatIdx)].muted = !rm.seats[String(seatIdx)].muted;
    persistPartyRoom(rm);
    m.close();
  };
  if ($('#smKick', m)) $('#smKick', m).onclick = () => {
    if (!assertRoomPerm(rm, 'kick_member')) return;
    delete rm.seats[String(seatIdx)];
    if (rm.members && rm.members[s.uid]) delete rm.members[s.uid];
    rm.kickedUids = [...new Set([...(rm.kickedUids || []), s.uid])];
    rm.chat = [...(rm.chat || []), { id: 'k_' + Date.now().toString(36), type: 'sys', text: `${s.name} was removed by ${me.name}`, ts: Date.now() }].slice(-45);
    persistPartyRoom(rm, { fullReplace: true });
    m.close();
  };
  if ($('#smAdmin', m)) $('#smAdmin', m).onclick = () => {
    if (!assertRoomPerm(rm, 'manage_admins')) return;
    const res = rules && typeof rules.setRoomAdmin === 'function'
      ? rules.setRoomAdmin(rm, uid, s.uid, !targetIsAdmin)
      : { ok: false, error: 'Unable to update admin' };
    if (!res.ok) return toast(res.error || 'Unable to update admin');
    rm.admins = res.admins;
    if (rm.isOwnedRoom) syncOwnedRoomProfileSnapshot(rm);
    toast(targetIsAdmin ? `${s.name} admin removed` : `🛡️ ${s.name} is now Room Admin (${rm.admins.length}/${maxAdmins})`);
    persistPartyRoom(rm);
    m.close();
  };
  if ($('#smGift', m)) $('#smGift', m).onclick = () => {
    m.close();
    if (typeof openGiftSendModal === 'function') openGiftSendModal(s.uid, { targetName: s.name, inPartyRoom: rm.id });
  };
}

function getRoomPlaylist(rm) {
  const cat = PMC();
  if (cat && typeof cat.getRoomQueue === 'function') return cat.getRoomQueue(rm);
  const raw = Array.isArray(rm && rm.queue) && rm.queue.length ? rm.queue : (Array.isArray(rm && rm.musicQueue) ? rm.musicQueue : []);
  return raw;
}

function getRoomActiveTrack(rm) {
  const q = getRoomPlaylist(rm);
  if (!q.length) return null;
  const cat = PMC();
  const idx = cat && typeof cat.getRoomQueueIndex === 'function'
    ? cat.getRoomQueueIndex(rm, q.length)
    : Math.max(0, Math.min(q.length - 1, Number(rm.queueIndex ?? rm.musicQueueIndex ?? 0) || 0));
  return q[idx] || q[0] || null;
}

function syncActiveTrackToVideoStage(rm, track, chatNote) {
  if (!rm || !track) return;
  const isDirectVideo = track.kind === 'direct_video' && track.videoUrl;
  const hasYtId = Boolean(track.videoId || track.youtubeId);
  const searchFallbackQ = String(track.searchQuery || `${track.title || ''} ${track.artist || ''}`).trim();

  rm.mode = 'video';
  rm.mediaPlayMode = 'video';
  rm.videoTitle = track.title || 'Room Video';
  PartyAudioPlayer.stop();

  if (isDirectVideo) {
    PartyVideoSync.broadcastSyncUpdate(rm, {
      kind: 'direct',
      videoId: '',
      videoUrl: track.videoUrl,
      searchQuery: '',
      playing: true,
      seekSec: 0,
      durationSec: Number(track.durationSec || 0)
    }, chatNote || '');
  } else if (hasYtId) {
    PartyVideoSync.broadcastSyncUpdate(rm, {
      kind: 'youtube',
      videoId: track.videoId || track.youtubeId,
      videoUrl: '',
      searchQuery: '',
      playing: true,
      seekSec: 0,
      durationSec: Number(track.durationSec || 0)
    }, chatNote || '');
  } else {
    PartyVideoSync.broadcastSyncUpdate(rm, {
      kind: 'yt_search',
      videoId: '',
      videoUrl: '',
      searchQuery: searchFallbackQ || track.title || 'Trending Song',
      playing: true,
      seekSec: 0,
      durationSec: 0
    }, chatNote || '');
  }
}

function applyPartyMusicPatch(rm, patch, chatNote) {
  if (!rm || !patch) return;
  const cleanPatch = { ...patch };
  delete cleanPatch.activeTrack;
  Object.assign(rm, cleanPatch);
  if (Array.isArray(rm.queue)) rm.musicQueue = rm.queue;
  else if (Array.isArray(rm.musicQueue)) rm.queue = rm.musicQueue;
  if (rm.queueIndex != null) rm.musicQueueIndex = rm.queueIndex;
  else if (rm.musicQueueIndex != null) rm.queueIndex = rm.musicQueueIndex;

  if (chatNote) {
    rm.chat = [...(rm.chat || []), {
      id: 'ms_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 5),
      type: 'sys',
      text: chatNote,
      ts: Date.now()
    }].slice(-45);
  }
  PartyAudioPlayer.syncFromRoom(rm);
  persistPartyRoom(rm);
}

function applyQueueTrackSelection(rm, patch, chatNote) {
  if (!rm || !patch) return;
  const activeTrack = patch.activeTrack || null;
  const mode = patch.mediaPlayMode || rm.mediaPlayMode || (rm.mode === 'video' ? 'video' : 'audio');
  const cleanPatch = { ...patch, mediaPlayMode: mode };
  delete cleanPatch.activeTrack;
  Object.assign(rm, cleanPatch);
  if (Array.isArray(rm.queue)) rm.musicQueue = rm.queue;
  if (rm.queueIndex != null) rm.musicQueueIndex = rm.queueIndex;

  if (mode === 'video' && activeTrack) {
    syncActiveTrackToVideoStage(rm, activeTrack, chatNote);
  } else {
    if (rm.mode === 'video') rm.mode = 'normal';
    applyPartyMusicPatch(rm, {}, chatNote);
  }
}

function addOrPlayRoomTrack(rm, trackInput, opts) {
  const cat = PMC();
  if (!rm || !cat || !trackInput) return null;
  if (!assertRoomPerm(rm, 'control_playlist')) return null;
  const o = opts || {};
  const playNow = Boolean(o.playNow);
  const playMode = o.playMode || rm.mediaPlayMode || (rm.mode === 'video' ? 'video' : 'audio');
  const who = (typeof me !== 'undefined' && me?.name) || 'Player';
  const res = cat.enqueueTrack(rm, trackInput, {
    playNow,
    playMode,
    addedBy: who
  });
  if (!res || !res.ok) {
    if (typeof toast === 'function') toast(res?.error || 'Unable to add track');
    return null;
  }

  if (res.startedNow) {
    saveMusicRecentItems(cat.recordRecentSong(getMusicRecentItems(), res.activeTrack || res.track));
    applyQueueTrackSelection(
      rm,
      { ...res.patch, mediaPlayMode: playMode },
      `${playMode === 'video' ? '🎬' : '♪'} ${who} started "${res.track.title}"`
    );
    if (typeof playSfx === 'function') playSfx('tap');
    if (typeof toast === 'function') {
      toast(`${playMode === 'video' ? '🎬 Synced' : '♪ Playing'}: ${res.track.title}`);
    }
  } else {
    applyPartyMusicPatch(
      rm,
      res.patch,
      `➕ ${who} added "${res.track.title}" to room playlist`
    );
    if (typeof playSfx === 'function') playSfx('tap');
    if (typeof toast === 'function') toast(`➕ Added to playlist: ${res.track.title}`);
  }
  return res;
}

function setRoomMediaPlayMode(rm, targetMode) {
  if (!rm) return;
  if (!assertRoomPerm(rm, 'control_playlist')) return;
  const nextMode = targetMode === 'video' ? 'video' : 'audio';
  rm.mediaPlayMode = nextMode;
  const activeTrack = getRoomActiveTrack(rm);

  if (nextMode === 'video') {
    rm.mode = 'video';
    PartyAudioPlayer.stop();
    if (activeTrack) {
      syncActiveTrackToVideoStage(rm, activeTrack, `🎬 ${(typeof me !== 'undefined' && me?.name) || 'Player'} switched playlist to Video Mode`);
    } else {
      persistPartyRoom(rm);
    }
    if (typeof toast === 'function') toast('🎬 Switched to VR Video Mode');
  } else {
    if (rm.mode === 'video') rm.mode = 'normal';
    PartyVideoSync.destroy();
    if (activeTrack) {
      rm.musicUrl = activeTrack.url || rm.musicUrl;
      rm.musicTitle = activeTrack.title || rm.musicTitle;
      rm.musicArtist = activeTrack.artist || rm.musicArtist;
      rm.musicTrackId = activeTrack.songId || activeTrack.id || rm.musicTrackId;
      rm.musicPlaying = true;
    }
    PartyAudioPlayer.syncFromRoom(rm);
    persistPartyRoom(rm);
    if (typeof toast === 'function') toast('♪ Switched to Audio Mini-Player Mode');
  }
}

function advanceRoomQueue(rm, opts) {
  const cat = PMC();
  if (!rm || !cat) return null;
  if (!(opts && opts.autoAdvance) && !assertRoomPerm(rm, 'control_playlist')) return null;
  const res = cat.skipNextInQueue(rm);
  if (!res || !res.ok) {
    if (!(opts && opts.silentToast) && typeof toast === 'function') toast('Add at least one track to playlist first');
    return null;
  }
  saveMusicRecentItems(cat.recordRecentSong(getMusicRecentItems(), res.track));
  applyQueueTrackSelection(rm, res.patch);
  if (!(opts && opts.silentToast) && typeof toast === 'function') toast(`⏭ Next: ${res.track.title}`);
  return res;
}

function handleRoomTrackEnded(rm, fromMode) {
  if (!rm) return;
  const q = getRoomPlaylist(rm);
  if (q.length <= 1) return;
  const activeMode = rm.mode === 'video' && rm.mediaPlayMode === 'video' ? 'video' : 'audio';
  if (fromMode && fromMode !== activeMode) return;
  if (!canModerateRoom(rm)) return;
  advanceRoomQueue(rm, { silentToast: true, autoAdvance: true });
}

function orderPartySongById(rm, songId, opts) {
  const cat = PMC();
  if (!rm || !cat) return null;
  if (!assertRoomPerm(rm, 'control_playlist')) return null;
  const o = opts || {};
  const song = cat.findSongById(songId);
  if (!song) {
    if (typeof toast === 'function') toast('Song not found');
    return null;
  }
  const playNow = o.playNow !== false;
  const playMode = o.playMode || rm.mediaPlayMode || 'audio';
  const res = cat.orderSongIntoQueue(rm, songId, {
    playNow,
    playMode,
    addedBy: (typeof me !== 'undefined' && me?.name) || 'Player'
  });
  if (!res || !res.ok) {
    if (typeof toast === 'function') toast(res?.error || 'Unable to load song');
    return null;
  }
  if (res.startedNow) {
    saveMusicRecentItems(cat.recordRecentSong(getMusicRecentItems(), res.track));
    applyQueueTrackSelection(
      rm,
      { ...res.patch, mediaPlayMode: playMode },
      `♪ ${(typeof me !== 'undefined' && me?.name) || 'Player'} ordered "${res.track.title}"`
    );
    if (typeof playSfx === 'function') playSfx('tap');
    if (typeof toast === 'function') {
      toast(res.usedFallback
        ? `♪ Playing preview: ${res.track.title} (or paste custom .mp3 below)`
        : `♪ Playing: ${res.track.title}`);
    }
  } else {
    applyPartyMusicPatch(
      rm,
      res.patch,
      `➕ ${(typeof me !== 'undefined' && me?.name) || 'Player'} added "${res.track.title}" to playlist`
    );
    if (typeof playSfx === 'function') playSfx('tap');
    if (typeof toast === 'function') toast(`➕ Added to playlist: ${res.track.title}`);
  }
  return res;
}

function orderPartyCustomUrl(rm, rawUrl, customTitle) {
  const cat = PMC();
  if (!rm || !cat) return null;
  if (!assertRoomPerm(rm, 'control_playlist')) return null;
  const res = cat.orderCustomUrlIntoQueue(rm, rawUrl, customTitle, {
    playMode: rm.mediaPlayMode || 'audio',
    addedBy: (typeof me !== 'undefined' && me?.name) || 'Player'
  });
  if (!res || !res.ok) {
    if (typeof toast === 'function') toast(res?.error || 'Enter a valid https:// audio or YouTube URL');
    return null;
  }
  saveMusicRecentItems(cat.recordRecentSong(getMusicRecentItems(), res.track));
  const targetMode = res.track.kind === 'youtube' ? (rm.mediaPlayMode || 'video') : 'audio';
  applyQueueTrackSelection(
    rm,
    { ...res.patch, mediaPlayMode: targetMode },
    `♪ ${(typeof me !== 'undefined' && me?.name) || 'Player'} added "${res.track.title}"`
  );
  if (typeof toast === 'function') toast(`♪ Playing: ${res.track.title}`);
  return res;
}

function skipPartyMusicNext(rm, opts) {
  return advanceRoomQueue(rm, opts);
}

function clearPartyMusicQueue(rm) {
  const cat = PMC();
  if (!rm || !cat) return null;
  if (!assertRoomPerm(rm, 'control_playlist')) return null;
  const res = cat.clearMusicQueue();
  rm.videoSync = {
    kind: 'youtube',
    videoId: '',
    videoUrl: '',
    searchQuery: '',
    playing: false,
    seekSec: 0,
    durationSec: 0,
    playbackRate: 1,
    updatedAt: Date.now(),
    updatedBy: uid || '',
    seq: Number(rm.videoSync?.seq || 0) + 1
  };
  PartyVideoSync.destroy();
  applyPartyMusicPatch(rm, res.patch, `♪ ${(typeof me !== 'undefined' && me?.name) || 'Player'} cleared the room playlist`);
  if (typeof toast === 'function') toast('Room playlist cleared');
  return res;
}

function renderLiveSearchItemsHtml(items, liveRm, queue, attrPrefix) {
  return items.map((item, idx) => {
    const inQ = queue.some(q => (item.videoId && q.videoId === item.videoId) || (item.id && q.songId === item.id));
    const isNow = Boolean(
      (item.videoId && (liveRm.youtubeId === item.videoId || liveRm.videoSync?.videoId === item.videoId)) ||
      (liveRm.musicTrackId && liveRm.musicTrackId === item.id && liveRm.musicPlaying)
    );
    const thumbHtml = item.thumbnail
      ? `<img class="pm-res-img" src="${esc(item.thumbnail)}" alt="" loading="lazy" decoding="async">`
      : `<span class="pm-res-ico" aria-hidden="true">${item.kind === 'yt_search' ? '🔎' : '▶'}</span>`;
    return `
      <div class="pm-res-row ${isNow ? 'active' : ''}" data-testid="${attrPrefix}-search-row">
        <div class="pm-res-thumb">
          ${thumbHtml}
          ${item.duration ? `<span class="pm-res-dur">${esc(item.duration)}</span>` : ''}
        </div>
        <div class="pm-song-info">
          <b class="pm-song-title">${esc(item.title)}</b>
          <small class="pm-song-sub">${esc(item.channel || item.artist || 'YouTube')}${item.kind === 'yt_search' ? ' · Instant Fallback' : ''}</small>
        </div>
        <div class="pm-row-acts">
          <button type="button" class="btn sm ghost pm-add-btn" data-${attrPrefix}-add="${idx}" data-testid="${attrPrefix}-result-add" aria-label="Add ${esc(item.title)} to room playlist">${inQ ? 'Added ✓' : '+ Add'}</button>
          <button type="button" class="btn sm ${isNow ? 'gold' : 'ok'} pm-playnow-btn" data-${attrPrefix}-playnow="${idx}" data-testid="${attrPrefix}-result-play" aria-label="Play ${esc(item.title)} now">${isNow ? 'Live' : 'Play Now'}</button>
        </div>
      </div>
    `;
  }).join('');
}

function renderPlaylistRowsHtml(queue, liveRm, _searchQuery, attrPrefix) {
  if (!queue.length) {
    return `<div class="pm-empty">Temporary room playlist is empty. Search any song or video above and tap <b>+ Add</b> or <b>Play Now</b>!</div>`;
  }
  const activeIdx = Number.isFinite(Number(liveRm.queueIndex)) ? Number(liveRm.queueIndex) : Number(liveRm.musicQueueIndex ?? -1);
  const isPlaying = Boolean(liveRm.musicPlaying || (liveRm.mode === 'video' && liveRm.videoSync?.playing));
  return queue.map((item, realIdx) => {
    const isCurrent = realIdx === activeIdx && (Boolean(liveRm.musicUrl) || Boolean(liveRm.youtubeId) || Boolean(liveRm.videoSync?.searchQuery));
    return `
      <div class="pm-song-row ${isCurrent ? 'active' : ''}" data-testid="${attrPrefix}-ordered-row">
        <span class="pm-q-num">${realIdx + 1}</span>
        ${item.thumbnail ? `<img class="pm-q-thumb" src="${esc(item.thumbnail)}" alt="" loading="lazy">` : ''}
        <div class="pm-song-info">
          <b class="pm-song-title">${esc(item.title)}</b>
          <small class="pm-song-sub">${esc(item.artist || item.channel || 'Room Media')}${item.addedBy ? ` · Added by ${esc(item.addedBy)}` : ''}${item.duration ? ` · ${esc(item.duration)}` : ''}</small>
        </div>
        <div class="pm-row-acts">
          <button type="button" class="btn sm ${isCurrent && isPlaying ? 'gold' : 'ok'} pm-order-btn" data-${attrPrefix}-qplay="${realIdx}" aria-label="Play ${esc(item.title)}">${isCurrent && isPlaying ? 'Playing' : 'Play'}</button>
          <button type="button" class="pm-icon-btn" data-${attrPrefix}-qdel="${realIdx}" aria-label="Remove ${esc(item.title)} from playlist" title="Remove">✕</button>
        </div>
      </div>
    `;
  }).join('');
}

function openPartyMusicModal(rm) {
  const cat = PMC();
  let activeTab = 'trending'; // 'trending' | 'favorites' | 'recent' | 'ordered'
  let selectedLang = 'All';   // 'All' | 'Hindi' | 'Bangla'
  let searchQuery = '';
  let liveState = { active: false, loading: false, query: '', source: '', usedFallback: false, items: [], error: '' };
  let searchSeq = 0;

  const m = modal('Room Music & Live Search', `
    <div class="pm-shell" data-testid="vr-music-picker">
      <div class="pm-now-bar" id="pmNowBar" data-testid="pm-now-bar"></div>

      <div class="pm-search-bar">
        <div class="pm-search-wrap">
          <svg class="pm-search-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
          <input id="pmSearchIn" type="search" placeholder="Search any Hindi, Bangla, English song or YouTube video..." aria-label="Search any Hindi, Bangla, English song or YouTube video" data-testid="pm-search-input" autocomplete="off">
          <button type="button" class="pm-search-clr" id="pmSearchClr" aria-label="Clear search" hidden>✕</button>
        </div>
        <button type="button" class="btn ok sm pm-search-go" id="pmLiveSearchBtn" data-testid="pm-live-search-btn">Search</button>
      </div>

      <div class="pm-tabs" role="tablist" aria-label="Music lists" id="pmTabs"></div>
      <div class="pm-lang-row" id="pmLangRow" role="group" aria-label="Language filter" data-testid="pm-lang-row"></div>

      <div class="pm-song-list" id="pmSongList" data-testid="pm-song-list"></div>

      <div class="pm-paste-box" data-testid="pm-paste-box">
        <label class="pm-paste-lbl" for="pmAudioUrl">Paste Direct URL / MP3 or YouTube Link</label>
        <div class="pm-paste-row">
          <input id="pmAudioUrl" type="url" placeholder="https://example.com/song.mp3 or youtu.be/..." value="" data-testid="pm-custom-url" autocomplete="off">
          <button type="button" class="btn ok sm pm-paste-go" id="pmPlayUrl" data-testid="pm-custom-play">Paste &amp; Play</button>
        </div>
      </div>
    </div>
  `, 'pm-sheet-modal');

  function getLiveRoom() {
    return partyRooms.find(r => r && r.id === rm.id) || rm;
  }

  async function runLiveSearch(rawQ) {
    const q = String(rawQ || '').trim();
    if (!q || !cat || typeof cat.searchYouTubeLive !== 'function') return;
    const seq = ++searchSeq;
    liveState = { active: true, loading: true, query: q, source: '', usedFallback: false, items: [], error: '' };
    renderModalContent();
    try {
      const res = await cat.searchYouTubeLive(q, { maxResults: 10, timeoutMs: 4000 });
      if (seq !== searchSeq) return;
      liveState = {
        active: true,
        loading: false,
        query: q,
        source: res.source || '',
        usedFallback: Boolean(res.usedFallback),
        items: Array.isArray(res.items) ? res.items : [],
        error: res.ok ? '' : (res.error || 'No results found')
      };
    } catch {
      if (seq !== searchSeq) return;
      const fb = cat.buildYouTubeSearchFallbackItem(q);
      liveState = {
        active: true,
        loading: false,
        query: q,
        source: 'yt_search_fallback',
        usedFallback: true,
        items: fb ? [fb] : [],
        error: ''
      };
    }
    renderModalContent();
  }

  function renderModalContent() {
    const liveRm = getLiveRoom();
    const queue = getRoomPlaylist(liveRm);
    const favIds = getMusicFavoriteIds();
    const recentItems = getMusicRecentItems();
    const curPlayMode = liveRm.mediaPlayMode === 'video' ? 'video' : 'audio';
    const isPlaying = curPlayMode === 'video'
      ? Boolean(liveRm.mode === 'video' && liveRm.videoSync?.playing)
      : Boolean(liveRm.musicPlaying && liveRm.musicUrl);
    const hasActiveMedia = Boolean(liveRm.musicUrl || liveRm.youtubeId || liveRm.videoSync?.searchQuery || queue.length);

    const nowBar = $('#pmNowBar', m);
    if (nowBar) {
      const nowTitle = (curPlayMode === 'video' ? liveRm.videoTitle : liveRm.musicTitle) || liveRm.musicTitle || liveRm.videoTitle || (hasActiveMedia ? 'Room Media' : 'No track playing');
      const langPart = liveRm.musicLanguage ? ` · ${liveRm.musicLanguage}` : '';
      const nowSub = hasActiveMedia
        ? `${liveRm.musicArtist || 'Room Playlist'}${langPart} · ${curPlayMode === 'video' ? 'VR Video' : 'Audio Mini'} · ${isPlaying ? 'Playing' : 'Paused'}${queue.length ? ` · ${queue.length} queued` : ''}`
        : 'Search any song/video above or pick Hindi/Bangla tracks below';
      nowBar.innerHTML = `
        <div class="pm-now-top">
          <div class="pm-now-left">
            <div class="pm-disc ${isPlaying ? 'spin' : ''}" aria-hidden="true">${curPlayMode === 'video' ? '🎬' : '♪'}</div>
            <div class="pm-now-meta">
              <b class="pm-now-title" data-testid="pm-now-title">${esc(nowTitle)}</b>
              <small class="pm-now-sub">${esc(nowSub)}</small>
            </div>
          </div>
          <div class="pm-mode-toggle" role="group" aria-label="Playback mode" data-testid="pm-mode-toggle">
            <button type="button" class="pm-mode-btn ${curPlayMode === 'video' ? 'on' : ''}" data-pm-mode="video" data-testid="pm-mode-video" aria-pressed="${curPlayMode === 'video' ? 'true' : 'false'}">🎬 Video</button>
            <button type="button" class="pm-mode-btn ${curPlayMode === 'audio' ? 'on' : ''}" data-pm-mode="audio" data-testid="pm-mode-audio" aria-pressed="${curPlayMode === 'audio' ? 'true' : 'false'}">♪ Audio</button>
          </div>
        </div>
        <div class="pm-now-acts">
          <button type="button" class="btn sm ${isPlaying ? 'gold' : 'ok'}" id="pmToggle" data-testid="pm-play-pause" ${!hasActiveMedia ? 'disabled' : ''}>${isPlaying ? 'Pause' : 'Play'}</button>
          <button type="button" class="btn sm ghost" id="pmSkipBtn" data-testid="pm-skip-next" ${queue.length < 1 ? 'disabled' : ''}>Next ⏭</button>
          <button type="button" class="btn sm red" id="pmClearTopBtn" data-testid="pm-clear-list" ${queue.length < 1 && !hasActiveMedia ? 'disabled' : ''}>Clear List</button>
        </div>
      `;
    }

    const tabsEl = $('#pmTabs', m);
    if (tabsEl) {
      const tabDefs = [
        { id: 'trending', label: 'Trending' },
        { id: 'favorites', label: favIds.length ? `Favorites (${favIds.length})` : 'Favorites' },
        { id: 'recent', label: recentItems.length ? `Recent (${recentItems.length})` : 'Recent' },
        { id: 'ordered', label: `Playlist (${queue.length})` }
      ];
      tabsEl.innerHTML = tabDefs.map(t => `
        <button type="button" role="tab" aria-selected="${!liveState.active && activeTab === t.id ? 'true' : 'false'}" class="pm-tab ${!liveState.active && activeTab === t.id ? 'on' : ''}" data-pm-tab="${t.id}" data-testid="pm-tab-${t.id}">${esc(t.label)}</button>
      `).join('');
    }

    const langRow = $('#pmLangRow', m);
    if (langRow) {
      langRow.hidden = liveState.active || activeTab === 'ordered';
      if (!langRow.hidden) {
        const counts = (cat && typeof cat.getLanguageCounts === 'function')
          ? cat.getLanguageCounts()
          : { all: PARTY_MUSIC_TRACKS.length, hindi: 0, bangla: 0 };
        const langDefs = [
          { id: 'All', label: `All (${counts.all})`, testId: 'pm-lang-all' },
          { id: 'Hindi', label: `Hindi (${counts.hindi})`, testId: 'pm-lang-hindi' },
          { id: 'Bangla', label: `Bangla (${counts.bangla})`, testId: 'pm-lang-bangla' }
        ];
        langRow.innerHTML = langDefs.map(l => `
          <button type="button" aria-pressed="${selectedLang === l.id ? 'true' : 'false'}" class="pm-lang-btn ${selectedLang === l.id ? 'on' : ''}" data-pm-lang="${l.id}" data-testid="${l.testId}">${esc(l.label)}</button>
        `).join('');
      }
    }

    const listEl = $('#pmSongList', m);
    if (!listEl) return;

    // Live Search Results View
    if (liveState.active) {
      const srcLabel = liveState.loading
        ? `Searching YouTube for "${liveState.query}"...`
        : (liveState.usedFallback
            ? `Instant YouTube Search for "${liveState.query}"`
            : `Live Results for "${liveState.query}" (${liveState.items.length})`);
      const headerHtml = `
        <div class="pm-live-head" data-testid="pm-live-head">
          <small>${esc(srcLabel)}</small>
          <button type="button" class="pm-live-back" id="pmCloseLive" data-testid="pm-close-live">Back to Catalog</button>
        </div>
      `;
      if (liveState.loading) {
        listEl.innerHTML = `${headerHtml}<div class="pm-empty">Fetching live YouTube results...</div>`;
        return;
      }
      if (!liveState.items.length) {
        listEl.innerHTML = `${headerHtml}<div class="pm-empty">No live results found for "${esc(liveState.query)}". Try another keyword or paste a link below.</div>`;
        return;
      }
      listEl.innerHTML = headerHtml + renderLiveSearchItemsHtml(liveState.items, liveRm, queue, 'pm');
      return;
    }

    if (activeTab === 'ordered') {
      listEl.innerHTML = renderPlaylistRowsHtml(queue, liveRm, searchQuery, 'pm');
      return;
    }

    const songs = cat
      ? cat.filterSongs({ tab: activeTab, language: selectedLang, query: searchQuery, favoriteIds: favIds, recentItems })
      : PARTY_MUSIC_TRACKS;

    if (!songs.length) {
      let msg = searchQuery
        ? `No local starter songs match "${esc(searchQuery)}". Tap <b>Search</b> above to search all of YouTube live!`
        : 'No matching songs found.';
      if (!searchQuery && activeTab === 'favorites') {
        msg = selectedLang === 'All'
          ? 'No favorite songs yet. Tap ♡ on any song in Trending to save it here.'
          : `No ${esc(selectedLang)} favorites yet.`;
      } else if (!searchQuery && activeTab === 'recent') {
        msg = selectedLang === 'All'
          ? 'No recent songs yet. Tracks you play will appear here.'
          : `No recent ${esc(selectedLang)} songs yet.`;
      }
      listEl.innerHTML = `<div class="pm-empty">${msg}</div>`;
      return;
    }

    listEl.innerHTML = songs.map((s) => {
      const isFav = favIds.includes(s.id);
      const isCurrent = Boolean(liveRm.musicUrl || liveRm.youtubeId) && (liveRm.musicTrackId ? liveRm.musicTrackId === s.id : Boolean(s.url && liveRm.musicUrl === s.url));
      const inQueue = queue.some(q => q.songId ? q.songId === s.id : Boolean(s.url && q.url === s.url));
      const btnText = isCurrent && isPlaying ? 'Playing' : 'Play';
      const langLabel = s.language || s.tag || '';
      return `
        <div class="pm-song-row ${isCurrent ? 'active' : ''}" data-testid="pm-song-row" data-song-lang="${esc(langLabel)}">
          <div class="pm-song-art" style="--pm-accent:${esc(s.accent || '#38bdf8')}" aria-hidden="true">${isCurrent && isPlaying ? '❚❚' : '♪'}</div>
          <div class="pm-song-info">
            <b class="pm-song-title">${esc(s.title)}</b>
            <small class="pm-song-sub">${esc(s.artist || s.singer || 'Room Track')}${langLabel ? ` · ${esc(langLabel)}` : ''}${s.duration ? ` · ${esc(s.duration)}` : ''}</small>
          </div>
          <div class="pm-row-acts">
            <button type="button" class="pm-fav-btn ${isFav ? 'on' : ''}" data-pm-fav="${esc(s.id)}" aria-label="${isFav ? 'Remove' : 'Add'} ${esc(s.title)} favorite" aria-pressed="${isFav ? 'true' : 'false'}" title="${isFav ? 'Remove from Favorites' : 'Save to Favorites'}">${isFav ? '♥' : '♡'}</button>
            <button type="button" class="btn sm ghost pm-add-sm" data-pm-add-song="${esc(s.id)}" aria-label="Add ${esc(s.title)} to playlist" title="Add to playlist">${inQueue ? '✓' : '+'}</button>
            <button type="button" class="btn sm ${isCurrent && isPlaying ? 'gold' : 'ok'} pm-order-btn" data-pm-order="${esc(s.id)}" data-pm-url="${esc(s.url || '')}" aria-label="Play ${esc(s.title)}">${btnText}</button>
          </div>
        </div>
      `;
    }).join('');
  }

  const searchIn = $('#pmSearchIn', m);
  const searchClr = $('#pmSearchClr', m);
  const liveBtn = $('#pmLiveSearchBtn', m);
  if (searchIn) {
    searchIn.oninput = () => {
      searchQuery = (searchIn.value || '').trim();
      if (searchClr) searchClr.hidden = !searchQuery;
      if (!searchQuery && liveState.active) {
        liveState = { active: false, loading: false, query: '', source: '', usedFallback: false, items: [], error: '' };
      }
      renderModalContent();
    };
    searchIn.onkeydown = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        runLiveSearch(searchIn.value);
      }
    };
  }
  if (liveBtn) {
    liveBtn.onclick = () => runLiveSearch(searchIn ? searchIn.value : searchQuery);
  }
  if (searchClr) {
    searchClr.onclick = () => {
      searchQuery = '';
      liveState = { active: false, loading: false, query: '', source: '', usedFallback: false, items: [], error: '' };
      if (searchIn) searchIn.value = '';
      searchClr.hidden = true;
      renderModalContent();
    };
  }

  m.addEventListener('click', (e) => {
    const liveRm = getLiveRoom();

    if (e.target.closest('#pmCloseLive')) {
      liveState = { active: false, loading: false, query: '', source: '', usedFallback: false, items: [], error: '' };
      renderModalContent();
      return;
    }

    const modeBtn = e.target.closest('[data-pm-mode]');
    if (modeBtn && modeBtn.dataset.pmMode) {
      setRoomMediaPlayMode(liveRm, modeBtn.dataset.pmMode);
      renderModalContent();
      return;
    }

    const tabBtn = e.target.closest('[data-pm-tab]');
    if (tabBtn && tabBtn.dataset.pmTab) {
      liveState.active = false;
      activeTab = tabBtn.dataset.pmTab;
      renderModalContent();
      return;
    }

    const langBtn = e.target.closest('[data-pm-lang]');
    if (langBtn && langBtn.dataset.pmLang) {
      selectedLang = langBtn.dataset.pmLang;
      renderModalContent();
      return;
    }

    const favBtn = e.target.closest('[data-pm-fav]');
    if (favBtn && favBtn.dataset.pmFav && cat) {
      const toggled = cat.toggleFavoriteId(getMusicFavoriteIds(), favBtn.dataset.pmFav);
      saveMusicFavoriteIds(toggled.favoriteIds);
      renderModalContent();
      return;
    }

    const liveAddBtn = e.target.closest('[data-pm-add]');
    if (liveAddBtn) {
      const item = liveState.items[Number(liveAddBtn.dataset.pmAdd)];
      if (item) {
        addOrPlayRoomTrack(liveRm, item, { playNow: false, playMode: liveRm.mediaPlayMode || 'audio' });
        renderModalContent();
      }
      return;
    }

    const livePlayBtn = e.target.closest('[data-pm-playnow]');
    if (livePlayBtn) {
      const item = liveState.items[Number(livePlayBtn.dataset.pmPlaynow)];
      if (item) {
        const targetMode = liveRm.mediaPlayMode === 'video' ? 'video' : (item.kind === 'yt_search' ? 'video' : 'audio');
        addOrPlayRoomTrack(liveRm, item, { playNow: true, playMode: targetMode });
        renderModalContent();
      }
      return;
    }

    const addSongBtn = e.target.closest('[data-pm-add-song]');
    if (addSongBtn && addSongBtn.dataset.pmAddSong) {
      orderPartySongById(liveRm, addSongBtn.dataset.pmAddSong, { playNow: false });
      renderModalContent();
      return;
    }

    const orderBtn = e.target.closest('[data-pm-order]');
    if (orderBtn && orderBtn.dataset.pmOrder) {
      const songId = orderBtn.dataset.pmOrder;
      const found = cat && cat.findSongById(songId);
      if (found) {
        orderPartySongById(liveRm, songId, { playNow: true });
      } else if (orderBtn.dataset.pmUrl) {
        const recentMatch = getMusicRecentItems().find(x => x && (x.id === songId || x.songId === songId || x.url === orderBtn.dataset.pmUrl));
        orderPartyCustomUrl(liveRm, orderBtn.dataset.pmUrl, recentMatch?.title || '');
      }
      renderModalContent();
      return;
    }

    const qPlayBtn = e.target.closest('[data-pm-qplay]');
    if (qPlayBtn && cat) {
      if (!assertRoomPerm(liveRm, 'control_playlist')) return;
      const idx = Number(qPlayBtn.dataset.pmQplay);
      const res = cat.selectQueueIndex(liveRm, idx);
      if (res && res.ok) {
        saveMusicRecentItems(cat.recordRecentSong(getMusicRecentItems(), res.track));
        applyQueueTrackSelection(liveRm, res.patch);
        if (typeof toast === 'function') toast(`♪ Playing: ${res.track.title}`);
        renderModalContent();
      }
      return;
    }

    const qDelBtn = e.target.closest('[data-pm-qdel]');
    if (qDelBtn && cat) {
      if (!assertRoomPerm(liveRm, 'control_playlist')) return;
      const idx = Number(qDelBtn.dataset.pmQdel);
      const res = cat.removeFromQueue(liveRm, idx);
      if (res && res.ok) {
        if (res.empty) clearPartyMusicQueue(liveRm);
        else applyQueueTrackSelection(liveRm, res.patch);
        renderModalContent();
      }
      return;
    }

    if (e.target.closest('#pmToggle')) {
      if (!assertRoomPerm(liveRm, 'control_playlist')) return;
      if (liveRm.mediaPlayMode === 'video' && liveRm.mode === 'video') {
        PartyVideoSync.handleAction(liveRm, 'toggle');
      } else {
        if (!liveRm.musicUrl) return;
        liveRm.musicPlaying = !liveRm.musicPlaying;
        PartyAudioPlayer.syncFromRoom(liveRm);
        persistPartyRoom(liveRm);
      }
      renderModalContent();
      return;
    }

    if (e.target.closest('#pmSkipBtn')) {
      advanceRoomQueue(liveRm);
      renderModalContent();
      return;
    }

    if (e.target.closest('#pmClearTopBtn')) {
      clearPartyMusicQueue(liveRm);
      renderModalContent();
      return;
    }

    if (e.target.closest('#pmPlayUrl')) {
      const urlIn = $('#pmAudioUrl', m);
      const rawUrl = (urlIn?.value || '').trim();
      const res = orderPartyCustomUrl(liveRm, rawUrl, '');
      if (res && res.ok) {
        if (urlIn) urlIn.value = '';
        renderModalContent();
      }
    }
  });

  renderModalContent();
}

function selectPartyYouTubePreset(rm, presetId, opts) {
  const cat = PMC();
  if (!rm || !cat) return false;
  const resolved = cat.resolveYouTubePreset(presetId);
  if (!resolved) return false;
  const playNow = !(opts && opts.playNow === false);
  const res = addOrPlayRoomTrack(rm, resolved, { playNow, playMode: 'video' });
  return Boolean(res && res.ok);
}

function addVideoTrackToRoomPlaylist(rm, track, opts) {
  if (!rm || !track) return null;
  const o = opts || {};
  const isAlreadyPlayingVideo = Boolean(
    rm.mode === 'video' &&
    rm.mediaPlayMode === 'video' &&
    (rm.youtubeId || rm.videoSync?.videoId || rm.videoSync?.videoUrl || rm.videoSync?.searchQuery)
  );
  // Start playing immediately in the main VR video player when no video is playing yet (or playNow forced)
  const shouldPlayNow = o.playNow === true || !isAlreadyPlayingVideo;
  const res = addOrPlayRoomTrack(rm, track, { playNow: shouldPlayNow, playMode: 'video' });
  if (res && res.ok) {
    if (typeof toast === 'function') {
      toast('Added Successfully');
    }
  }
  return res;
}

function openPartyPlaylistDrawer(rm) {
  const cat = PMC();
  let pasteOpen = false;
  let bannerMsg = '';

  const m = modal('Room Playlist', `
    <div class="pld-shell" data-testid="vr-playlist-drawer">
      <div class="pld-top-bar">
        <div class="pld-top-acts">
          <button type="button" class="btn gold sm" id="pldAddVideoBtn" data-testid="pld-add-video-btn">+ Add video</button>
          <button type="button" class="btn ghost sm" id="pldPasteToggle" data-testid="pld-paste-toggle">🔗 Paste link</button>
        </div>
        <div class="pm-mode-toggle" role="group" aria-label="Playback mode" id="pldModeToggle" data-testid="pld-mode-toggle"></div>
      </div>

      <div class="ytb-paste-bar" id="pldPasteBar" data-testid="pld-paste-bar" hidden>
        <input id="pldPasteIn" type="url" placeholder="Paste YouTube link (youtu.be / youtube.com) or .mp4 URL..." data-testid="pld-paste-input" autocomplete="off">
        <button type="button" class="btn gold sm" id="pldPasteSubmit" data-testid="pld-paste-submit">Add &amp; Play</button>
      </div>

      <div class="ytb-added-banner" id="pldBanner" data-testid="pld-added-banner" hidden></div>

      <div class="pld-queue-tools" id="pldQueueTools"></div>

      <div class="pld-list" id="pldList" data-testid="pld-list"></div>
    </div>
  `, 'pld-sheet-modal');

  function getLiveRoom() {
    return partyRooms.find(r => r && r.id === rm.id) || rm;
  }

  function showDrawerBanner(msg) {
    bannerMsg = msg;
    const el = $('#pldBanner', m);
    if (el) {
      el.textContent = `✓ ${msg}`;
      el.hidden = false;
    }
    setTimeout(() => {
      if (bannerMsg === msg) {
        bannerMsg = '';
        const bEl = $('#pldBanner', m);
        if (bEl) bEl.hidden = true;
      }
    }, 2800);
  }

  function renderDrawer() {
    const liveRm = getLiveRoom();
    const queue = getRoomPlaylist(liveRm);
    const curPlayMode = liveRm.mediaPlayMode === 'video' ? 'video' : 'audio';

    const modeEl = $('#pldModeToggle', m);
    if (modeEl) {
      modeEl.innerHTML = `
        <button type="button" class="pm-mode-btn ${curPlayMode === 'video' ? 'on' : ''}" data-pld-mode="video" aria-pressed="${curPlayMode === 'video' ? 'true' : 'false'}">🎬 Video</button>
        <button type="button" class="pm-mode-btn ${curPlayMode === 'audio' ? 'on' : ''}" data-pld-mode="audio" aria-pressed="${curPlayMode === 'audio' ? 'true' : 'false'}">♪ Audio</button>
      `;
    }

    const pasteBar = $('#pldPasteBar', m);
    if (pasteBar) pasteBar.hidden = !pasteOpen;

    const toolsEl = $('#pldQueueTools', m);
    if (toolsEl) {
      toolsEl.innerHTML = queue.length
        ? `
          <span class="pld-count-lbl">${queue.length} ${queue.length === 1 ? 'video' : 'videos'} in playlist</span>
          <div class="pld-tools-right">
            <button type="button" class="btn sm ghost" id="pldNextBtn" data-testid="pld-skip-next">Next ⏭</button>
            <button type="button" class="btn sm red" id="pldClearBtn" data-testid="pld-clear-list">Clear List</button>
          </div>
        `
        : `<span class="pld-count-lbl">Playlist is empty</span>`;
    }

    const listEl = $('#pldList', m);
    if (listEl) {
      listEl.innerHTML = queue.length
        ? renderPlaylistRowsHtml(queue, liveRm, '', 'pld')
        : `<div class="pm-empty">No videos in room playlist yet. Tap <b>+ Add video</b> to browse YouTube or <b>Paste link</b> above!</div>`;
    }
  }

  function handlePasteAdd() {
    const liveRm = getLiveRoom();
    const inp = $('#pldPasteIn', m);
    const raw = (inp?.value || '').trim();
    if (!raw) return toast('Paste a YouTube link or direct video URL');
    const parsed = cat && typeof cat.parseDirectVideoOrYouTubeLink === 'function'
      ? cat.parseDirectVideoOrYouTubeLink(raw)
      : null;
    if (!parsed || !parsed.ok || !parsed.track) {
      return toast(parsed?.error || 'Enter a valid YouTube link or direct video URL');
    }
    const matchedPreset = parsed.track.videoId && cat ? cat.findYouTubePresetById(parsed.track.videoId) : null;
    const track = matchedPreset
      ? { ...parsed.track, title: matchedPreset.title, channel: matchedPreset.channel, artist: matchedPreset.channel, duration: matchedPreset.duration }
      : parsed.track;
    const res = addVideoTrackToRoomPlaylist(liveRm, track, { playNow: true });
    if (res && res.ok) {
      if (inp) inp.value = '';
      pasteOpen = false;
      showDrawerBanner('Added Successfully — Syncing in room');
      renderDrawer();
    }
  }

  m.addEventListener('click', (e) => {
    const liveRm = getLiveRoom();

    if (e.target.closest('#pldAddVideoBtn')) {
      if (!assertRoomPerm(liveRm, 'control_playlist')) return;
      m.close();
      openPartyVideoModal(liveRm);
      return;
    }
    if (e.target.closest('#pldPasteToggle')) {
      if (!assertRoomPerm(liveRm, 'control_playlist')) return;
      pasteOpen = !pasteOpen;
      renderDrawer();
      if (pasteOpen) {
        const inp = $('#pldPasteIn', m);
        if (inp) inp.focus();
      }
      return;
    }
    if (e.target.closest('#pldPasteSubmit')) {
      handlePasteAdd();
      return;
    }

    const modeBtn = e.target.closest('[data-pld-mode]');
    if (modeBtn && modeBtn.dataset.pldMode) {
      setRoomMediaPlayMode(liveRm, modeBtn.dataset.pldMode);
      renderDrawer();
      return;
    }

    const qPlayBtn = e.target.closest('[data-pld-qplay]');
    if (qPlayBtn && cat) {
      if (!assertRoomPerm(liveRm, 'control_playlist')) return;
      const res = cat.selectQueueIndex(liveRm, Number(qPlayBtn.dataset.pldQplay));
      if (res && res.ok) {
        applyQueueTrackSelection(liveRm, { ...res.patch, mediaPlayMode: liveRm.mediaPlayMode || 'video' });
        renderDrawer();
      }
      return;
    }

    const qDelBtn = e.target.closest('[data-pld-qdel]');
    if (qDelBtn && cat) {
      if (!assertRoomPerm(liveRm, 'control_playlist')) return;
      const res = cat.removeFromQueue(liveRm, Number(qDelBtn.dataset.pldQdel));
      if (res && res.ok) {
        if (res.empty) clearPartyMusicQueue(liveRm);
        else applyQueueTrackSelection(liveRm, res.patch);
        renderDrawer();
      }
      return;
    }

    if (e.target.closest('#pldNextBtn')) {
      advanceRoomQueue(liveRm);
      renderDrawer();
      return;
    }
    if (e.target.closest('#pldClearBtn')) {
      clearPartyMusicQueue(liveRm);
      renderDrawer();
    }
  });

  const pasteIn = $('#pldPasteIn', m);
  if (pasteIn) {
    pasteIn.onkeydown = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handlePasteAdd();
      }
    };
  }

  renderDrawer();
}

function openPartyVideoModal(rm, opts) {
  const cat = PMC();
  const o = opts || {};
  const topics = (cat && Array.isArray(cat.YOUTUBE_BROWSE_TOPICS))
    ? cat.YOUTUBE_BROWSE_TOPICS
    : [
        { id: 'trending', label: 'Trending' },
        { id: 'music', label: 'Music' },
        { id: 'hindi', label: 'Hindi' },
        { id: 'bangla', label: 'Bangla' },
        { id: 'gaming', label: 'Gaming' },
        { id: 'lofi', label: 'Study & Lo-Fi' }
      ];

  let activeTopic = 'trending';
  let searchQuery = '';
  let isSearchMode = false;
  let pasteBarOpen = Boolean(o.openPaste);
  let loading = true;
  let feedItems = [];
  let feedMeta = { source: '', usedFallback: false, label: 'Trending on YouTube' };
  let selectedItem = null;
  let previewOpen = false;
  let addedSuccessTimer = 0;
  let addedSuccessText = '';
  let loadSeq = 0;

  const m = modal('YouTube — Add Video', `
    <div class="ytb-shell" data-testid="vr-video-picker">
      <div class="ytb-top-strip">
        <div class="ytb-brand-row">
          <span class="ytb-logo-pill" aria-hidden="true">▶</span>
          <b class="ytb-brand-name">YouTube</b>
          <span class="ytb-brand-sub" id="ytbSourceTag">Live Browse</span>
        </div>
        <div class="ytb-top-btns">
          <button type="button" class="ytb-chip-btn ${pasteBarOpen ? 'on' : ''}" id="ytbPasteToggle" data-testid="ytb-paste-toggle" aria-expanded="${pasteBarOpen ? 'true' : 'false'}">🔗 Paste link</button>
          <button type="button" class="ytb-chip-btn" id="ytbOpenPlaylistBtn" data-testid="ytb-open-playlist">☰ Playlist</button>
        </div>
      </div>

      <div class="ytb-paste-bar" id="ytbPasteBar" data-testid="ytb-paste-bar" ${pasteBarOpen ? '' : 'hidden'}>
        <input id="ytbPasteIn" type="url" placeholder="Paste YouTube link (youtu.be / youtube.com) or direct video URL..." data-testid="ytb-paste-input" autocomplete="off">
        <button type="button" class="btn gold sm ytb-paste-go" id="ytbPasteSubmit" data-testid="ytb-paste-submit">Add &amp; Play</button>
      </div>

      <div class="pm-search-bar ytb-search-bar">
        <div class="pm-search-wrap">
          <svg class="pm-search-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
          <input id="ytbSearchIn" type="search" placeholder="Search YouTube videos, songs, channels..." aria-label="Search YouTube videos, songs, channels" data-testid="ytb-search-input" autocomplete="off">
          <button type="button" class="pm-search-clr" id="ytbSearchClr" aria-label="Clear search" hidden>✕</button>
        </div>
        <button type="button" class="btn gold sm pm-search-go" id="ytbSearchBtn" data-testid="ytb-search-btn">Search</button>
      </div>

      <div class="ytb-topics" id="ytbTopics" role="tablist" aria-label="YouTube browse categories" data-testid="ytb-topics"></div>

      <div class="ytb-scroll-body" id="ytbBody" data-testid="ytb-body"></div>

      <div class="ytb-bottom-bar" id="ytbBottomBar" data-testid="ytb-bottom-bar">
        <div class="ytb-added-banner" id="ytbAddedBanner" data-testid="ytb-added-banner" role="status" aria-live="polite" hidden></div>
        <div class="ytb-sel-summary" id="ytbSelSummary" data-testid="ytb-sel-summary">Tap any video above to preview, then tap Add to playlist</div>
        <button type="button" class="btn gold full ytb-add-cta" id="ytbAddToPlaylistBtn" data-testid="ytb-add-to-playlist-btn" disabled>Add to playlist</button>
      </div>
    </div>
  `, 'ytb-sheet-modal');

  function getLiveRoom() {
    return partyRooms.find(r => r && r.id === rm.id) || rm;
  }

  function showAddedBanner(msg) {
    addedSuccessText = msg || 'Added Successfully';
    if (addedSuccessTimer) clearTimeout(addedSuccessTimer);
    const el = $('#ytbAddedBanner', m);
    if (el) {
      el.textContent = `✓ ${addedSuccessText}`;
      el.hidden = false;
    }
    addedSuccessTimer = setTimeout(() => {
      addedSuccessText = '';
      const bEl = $('#ytbAddedBanner', m);
      if (bEl) bEl.hidden = true;
    }, 3200);
  }

  function updateBottomBar() {
    const liveRm = getLiveRoom();
    const queue = getRoomPlaylist(liveRm);

    const plBtn = $('#ytbOpenPlaylistBtn', m);
    if (plBtn) {
      plBtn.textContent = queue.length ? `☰ Playlist (${queue.length})` : '☰ Playlist';
    }

    const pasteBtn = $('#ytbPasteToggle', m);
    if (pasteBtn) {
      pasteBtn.classList.toggle('on', pasteBarOpen);
      pasteBtn.setAttribute('aria-expanded', pasteBarOpen ? 'true' : 'false');
    }
    const pasteBar = $('#ytbPasteBar', m);
    if (pasteBar) pasteBar.hidden = !pasteBarOpen;

    const sumEl = $('#ytbSelSummary', m);
    const ctaBtn = $('#ytbAddToPlaylistBtn', m);
    const inQ = Boolean(
      selectedItem &&
      queue.some(q => (selectedItem.videoId && q.videoId === selectedItem.videoId) || (selectedItem.id && q.songId === selectedItem.id))
    );

    if (selectedItem) {
      if (sumEl) {
        sumEl.innerHTML = `<span class="ytb-sel-dot" aria-hidden="true">▶</span><span class="ytb-sel-txt">${esc(selectedItem.title)}</span>${inQ ? '<span class="ytb-sel-badge">In Playlist</span>' : ''}`;
      }
      if (ctaBtn) {
        ctaBtn.disabled = false;
        ctaBtn.textContent = inQ ? 'Play / Sync in Room' : 'Add to playlist';
      }
    } else {
      if (sumEl) {
        sumEl.textContent = 'Select any YouTube video above or paste a link to add';
      }
      if (ctaBtn) {
        ctaBtn.disabled = true;
        ctaBtn.textContent = 'Add to playlist';
      }
    }
  }

  function renderTopics() {
    const el = $('#ytbTopics', m);
    if (!el) return;
    el.hidden = previewOpen;
    if (el.hidden) return;
    el.innerHTML = topics.map(t => {
      const on = !isSearchMode && activeTopic === t.id;
      return `<button type="button" role="tab" aria-selected="${on ? 'true' : 'false'}" class="ytb-topic-chip ${on ? 'on' : ''}" data-ytb-topic="${esc(t.id)}" data-testid="ytb-topic-${esc(t.id)}">${esc(t.label)}</button>`;
    }).join('');
  }

  function renderVideoCardHtml(item, idx, queue, isCompact) {
    const isSel = Boolean(
      selectedItem && (
        (item.videoId && selectedItem.videoId === item.videoId) ||
        (item.id && selectedItem.id === item.id)
      )
    );
    const inQ = queue.some(q => (item.videoId && q.videoId === item.videoId) || (item.id && q.songId === item.id));
    const metaParts = [item.channel || item.artist || 'YouTube'];
    if (item.viewsText) metaParts.push(item.viewsText);
    if (item.uploadedDate) metaParts.push(item.uploadedDate);
    if (item.kind === 'yt_search') metaParts.push('Instant Embed Search');

    return `
      <button type="button" class="ytb-feed-card ${isCompact ? 'compact' : ''} ${isSel ? 'selected' : ''}" data-ytb-select="${idx}" data-testid="ytb-video-card" aria-pressed="${isSel ? 'true' : 'false'}">
        <div class="ytb-card-thumb">
          ${item.thumbnail
            ? `<img class="ytb-card-img" src="${esc(item.thumbnail)}" alt="" loading="lazy" decoding="async" onerror="this.onerror=null;${item.videoId ? `this.src='https://i.ytimg.com/vi/${esc(item.videoId)}/hqdefault.jpg'` : `this.style.display='none'`}">`
            : `<span class="ytb-card-fallback-ico" aria-hidden="true">${item.kind === 'yt_search' ? '🔎' : '▶'}</span>`
          }
          ${item.duration ? `<span class="ytb-card-dur">${esc(item.duration)}</span>` : ''}
          ${inQ ? `<span class="ytb-card-inq">In Playlist</span>` : ''}
        </div>
        <div class="ytb-card-info">
          <b class="ytb-card-title">${esc(item.title)}</b>
          <small class="ytb-card-meta">${esc(metaParts.join(' · '))}</small>
        </div>
      </button>
    `;
  }

  function renderBody() {
    const liveRm = getLiveRoom();
    const queue = getRoomPlaylist(liveRm);
    const bodyEl = $('#ytbBody', m);
    const srcTag = $('#ytbSourceTag', m);
    if (srcTag) {
      srcTag.textContent = isSearchMode
        ? (feedMeta.usedFallback ? 'Instant Search' : 'Live Search')
        : (feedMeta.usedFallback ? 'Verified Feed' : 'Live YouTube');
    }
    renderTopics();
    updateBottomBar();
    if (!bodyEl) return;

    if (loading) {
      bodyEl.innerHTML = `
        <div class="ytb-loading" data-testid="ytb-loading">
          <div class="ytb-spinner" aria-hidden="true"></div>
          <small>${isSearchMode ? `Searching YouTube for "${esc(searchQuery)}"...` : 'Loading live YouTube videos...'}</small>
        </div>
      `;
      return;
    }

    // Watch Preview View when user taps a YouTube video card
    if (previewOpen && selectedItem) {
      const embedSrc = selectedItem.kind === 'yt_search'
        ? `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(selectedItem.searchQuery || selectedItem.title)}&rel=0&modestbranding=1&playsinline=1`
        : (selectedItem.videoId
            ? `https://www.youtube.com/embed/${encodeURIComponent(selectedItem.videoId)}?rel=0&modestbranding=1&playsinline=1`
            : '');
      const relatedItems = feedItems.filter(it => it && it.id !== selectedItem.id).slice(0, 8);
      const metaBits = [selectedItem.channel || selectedItem.artist || 'YouTube'];
      if (selectedItem.viewsText) metaBits.push(selectedItem.viewsText);
      if (selectedItem.uploadedDate) metaBits.push(selectedItem.uploadedDate);
      if (selectedItem.duration) metaBits.push(selectedItem.duration);

      bodyEl.innerHTML = `
        <div class="ytb-preview-wrap" data-testid="ytb-preview-view">
          <div class="ytb-preview-nav">
            <button type="button" class="ytb-back-btn" id="ytbPreviewBack" data-testid="ytb-preview-back">← Back to YouTube</button>
            <span class="ytb-preview-hint">Ready to add to room</span>
          </div>
          <div class="ytb-preview-frame">
            ${embedSrc
              ? `<iframe src="${embedSrc}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen title="${esc(selectedItem.title)}"></iframe>`
              : `<div class="ytb-preview-empty">Preview unavailable — tap Add to playlist to play in room</div>`
            }
          </div>
          <div class="ytb-preview-meta">
            <b class="ytb-preview-title" data-testid="ytb-preview-title">${esc(selectedItem.title)}</b>
            <small class="ytb-preview-sub">${esc(metaBits.join(' · '))}</small>
          </div>
          ${relatedItems.length ? `
            <div class="ytb-related-head">Up Next on YouTube</div>
            <div class="ytb-related-list">
              ${relatedItems.map((it) => {
                const realIdx = feedItems.findIndex(x => x && x.id === it.id);
                return renderVideoCardHtml(it, realIdx, queue, true);
              }).join('')}
            </div>
          ` : ''}
        </div>
      `;
      return;
    }

    if (!feedItems.length) {
      bodyEl.innerHTML = `
        <div class="pm-empty">
          No videos found${searchQuery ? ` for "${esc(searchQuery)}"` : ''}. Try another YouTube search or tap <b>🔗 Paste link</b> above!
        </div>
      `;
      return;
    }

    const headLabel = isSearchMode
      ? `Results for "${searchQuery}" (${feedItems.length})`
      : feedMeta.label;
    bodyEl.innerHTML = `
      <div class="ytb-feed-head">
        <span>${esc(headLabel)}</span>
        ${isSearchMode ? `<button type="button" class="pm-live-back" id="ytbResetFeed">Back to Trending</button>` : ''}
      </div>
      <div class="ytb-feed-list" data-testid="ytb-feed-list">
        ${feedItems.map((item, idx) => renderVideoCardHtml(item, idx, queue, false)).join('')}
      </div>
    `;
  }

  async function loadTopicFeed(topicId) {
    const seq = ++loadSeq;
    activeTopic = topicId || 'trending';
    isSearchMode = false;
    previewOpen = false;
    loading = true;
    const topicObj = topics.find(t => t.id === activeTopic);
    feedMeta = { source: '', usedFallback: false, label: topicObj ? `${topicObj.label} on YouTube` : 'Trending on YouTube' };
    renderBody();
    try {
      const res = cat && typeof cat.fetchYouTubeBrowseFeed === 'function'
        ? await cat.fetchYouTubeBrowseFeed(activeTopic, { maxResults: 14, timeoutMs: 4000 })
        : { ok: true, items: [], source: 'none', usedFallback: true };
      if (seq !== loadSeq) return;
      feedItems = Array.isArray(res.items) ? res.items : [];
      feedMeta = {
        source: res.source || '',
        usedFallback: Boolean(res.usedFallback),
        label: topicObj ? `${topicObj.label} on YouTube` : 'Trending on YouTube'
      };
    } catch {
      if (seq !== loadSeq) return;
      feedItems = [];
      feedMeta = { source: 'error', usedFallback: true, label: 'YouTube Browse' };
    }
    loading = false;
    renderBody();
  }

  async function runYouTubeSearch(rawQ) {
    const q = String(rawQ || '').trim();
    if (!q) {
      loadTopicFeed(activeTopic);
      return;
    }
    // If user typed/pasted a direct YouTube link inside the search box, handle it seamlessly!
    if (cat && typeof cat.parseDirectVideoOrYouTubeLink === 'function' && (/^(https?:\/\/|youtu\.be\/|youtube\.com\/)/i.test(q))) {
      const parsed = cat.parseDirectVideoOrYouTubeLink(q);
      if (parsed && parsed.ok && parsed.track) {
        selectedItem = parsed.track;
        feedItems = [parsed.track, ...feedItems.filter(x => x && x.id !== parsed.track.id)];
        previewOpen = true;
        loading = false;
        isSearchMode = true;
        searchQuery = q;
        renderBody();
        return;
      }
    }
    const seq = ++loadSeq;
    searchQuery = q;
    isSearchMode = true;
    previewOpen = false;
    loading = true;
    renderBody();
    try {
      const res = cat && typeof cat.searchYouTubeLive === 'function'
        ? await cat.searchYouTubeLive(q, { maxResults: 14, timeoutMs: 4200 })
        : { ok: true, items: [], source: 'none', usedFallback: true };
      if (seq !== loadSeq) return;
      feedItems = Array.isArray(res.items) ? res.items : [];
      feedMeta = {
        source: res.source || '',
        usedFallback: Boolean(res.usedFallback),
        label: `Results for "${q}"`
      };
    } catch {
      if (seq !== loadSeq) return;
      const fb = cat && typeof cat.buildYouTubeSearchFallbackItem === 'function' ? cat.buildYouTubeSearchFallbackItem(q) : null;
      feedItems = fb ? [fb] : [];
      feedMeta = { source: 'yt_search_fallback', usedFallback: true, label: `Instant Search for "${q}"` };
    }
    loading = false;
    renderBody();
  }

  function handlePasteLinkSubmit() {
    const liveRm = getLiveRoom();
    const inp = $('#ytbPasteIn', m);
    const raw = (inp?.value || '').trim();
    if (!raw) return toast('Paste a YouTube link or direct video URL');
    const parsed = cat && typeof cat.parseDirectVideoOrYouTubeLink === 'function'
      ? cat.parseDirectVideoOrYouTubeLink(raw)
      : null;
    if (!parsed || !parsed.ok || !parsed.track) {
      return toast(parsed?.error || 'Enter a valid YouTube link/ID or direct .mp4/.webm URL');
    }
    const matchedPreset = parsed.track.videoId && cat ? cat.findYouTubePresetById(parsed.track.videoId) : null;
    const track = matchedPreset
      ? { ...parsed.track, title: matchedPreset.title, channel: matchedPreset.channel, artist: matchedPreset.channel, duration: matchedPreset.duration }
      : parsed.track;
    const res = addVideoTrackToRoomPlaylist(liveRm, track, { playNow: true });
    if (res && res.ok) {
      selectedItem = track;
      if (inp) inp.value = '';
      pasteBarOpen = false;
      showAddedBanner('Added Successfully');
      renderBody();
    }
  }

  const searchIn = $('#ytbSearchIn', m);
  const searchClr = $('#ytbSearchClr', m);
  const searchBtn = $('#ytbSearchBtn', m);
  if (searchIn) {
    searchIn.oninput = () => {
      const val = (searchIn.value || '').trim();
      if (searchClr) searchClr.hidden = !val;
    };
    searchIn.onkeydown = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        runYouTubeSearch(searchIn.value);
      }
    };
  }
  if (searchBtn) {
    searchBtn.onclick = () => runYouTubeSearch(searchIn ? searchIn.value : '');
  }
  if (searchClr) {
    searchClr.onclick = () => {
      searchQuery = '';
      if (searchIn) searchIn.value = '';
      searchClr.hidden = true;
      loadTopicFeed(activeTopic);
    };
  }

  const pasteIn = $('#ytbPasteIn', m);
  if (pasteIn) {
    pasteIn.onkeydown = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handlePasteLinkSubmit();
      }
    };
  }

  m.addEventListener('click', (e) => {
    const liveRm = getLiveRoom();

    if (e.target.closest('#ytbPasteToggle')) {
      pasteBarOpen = !pasteBarOpen;
      updateBottomBar();
      if (pasteBarOpen) {
        const inp = $('#ytbPasteIn', m);
        if (inp) inp.focus();
      }
      return;
    }

    if (e.target.closest('#ytbPasteSubmit')) {
      handlePasteLinkSubmit();
      return;
    }

    if (e.target.closest('#ytbOpenPlaylistBtn')) {
      m.close();
      openPartyPlaylistDrawer(liveRm);
      return;
    }

    if (e.target.closest('#ytbPreviewBack')) {
      previewOpen = false;
      renderBody();
      return;
    }

    if (e.target.closest('#ytbResetFeed')) {
      searchQuery = '';
      if (searchIn) searchIn.value = '';
      if (searchClr) searchClr.hidden = true;
      loadTopicFeed('trending');
      return;
    }

    const topicBtn = e.target.closest('[data-ytb-topic]');
    if (topicBtn && topicBtn.dataset.ytbTopic) {
      loadTopicFeed(topicBtn.dataset.ytbTopic);
      return;
    }

    const cardBtn = e.target.closest('[data-ytb-select]');
    if (cardBtn) {
      const item = feedItems[Number(cardBtn.dataset.ytbSelect)];
      if (item) {
        selectedItem = item;
        previewOpen = true;
        renderBody();
        const bodyEl = $('#ytbBody', m);
        if (bodyEl) bodyEl.scrollTop = 0;
      }
      return;
    }

    if (e.target.closest('#ytbAddToPlaylistBtn')) {
      if (!selectedItem) return;
      const queue = getRoomPlaylist(liveRm);
      const alreadyInQ = queue.some(q => (selectedItem.videoId && q.videoId === selectedItem.videoId) || (selectedItem.id && q.songId === selectedItem.id));
      const res = addVideoTrackToRoomPlaylist(liveRm, selectedItem, { playNow: alreadyInQ ? true : undefined });
      if (res && res.ok) {
        showAddedBanner('Added Successfully');
        renderBody();
      }
    }
  });

  if (pasteBarOpen && pasteIn) {
    setTimeout(() => { try { pasteIn.focus(); } catch {} }, 80);
  }
  loadTopicFeed('trending');
}

function openPartyModesModal(rm) {
  if (!assertRoomPerm(rm, 'change_mode')) return;
  if (window.PartyRoomExtras && typeof window.PartyRoomExtras.openPartyRoomMenuDrawer === 'function') {
    window.PartyRoomExtras.openPartyRoomMenuDrawer(rm);
    return;
  }
  const m = modal('Room Mode', `
    <div class="list" style="gap:7px" data-testid="vr-modes-modal">
      ${Object.values(PARTY_MODES_META).map(md => `
        <button type="button" class="btn ${rm.mode === md.id ? 'gold' : 'ghost'} full" data-setmode="${md.id}">${esc(md.name)} — ${esc(md.desc)}</button>
      `).join('')}
    </div>
  `);
  $$('[data-setmode]', m).forEach(btn => {
    btn.onclick = () => {
      if (!assertRoomPerm(rm, 'change_mode')) return;
      rm.mode = btn.dataset.setmode;
      if (rm.isOwnedRoom) syncOwnedRoomProfileSnapshot(rm);
      persistPartyRoom(rm);
      toast(`Room mode switched to ${PARTY_MODES_META[rm.mode]?.name || rm.mode}`);
      m.close();
    };
  });
}

function openPartyAdvancedPanel(rm, initialTab) {
  if (!rm) return;
  const rules = PRR();
  let activeTab = initialTab || 'perks'; // 'perks' | 'admins' | 'mic' | 'edit'
  const m = modal(rm.isOwnedRoom ? '👑 Advanced Room & Perks' : '⚙️ Room Settings & Perks', `
    <div class="advp-shell" data-testid="vr-advanced-panel">
      <div class="advp-tabs" role="tablist">
        <button type="button" class="advp-tab" data-advp-tab="perks" data-testid="advp-tab-perks">👑 Perks (8)</button>
        <button type="button" class="advp-tab" data-advp-tab="admins" data-testid="advp-tab-admins">🛡️ Admins</button>
        <button type="button" class="advp-tab" data-advp-tab="mic" data-testid="advp-tab-mic">🎙️ Mic Order</button>
        <button type="button" class="advp-tab" data-advp-tab="edit" data-testid="advp-tab-edit">✏️ Edit Room</button>
      </div>
      <div class="advp-body" id="advpBody"></div>
    </div>
  `, 'advp-modal');

  function getLive() {
    return partyRooms.find(r => r && r.id === rm.id) || rm;
  }

  function renderPanel() {
    const live = getLive();
    const body = $('#advpBody', m);
    if (!body) return;
    $$('[data-advp-tab]', m).forEach(b => b.classList.toggle('active', b.dataset.advpTab === activeTab));

    const amOwner = isSingleOwner(live, uid);
    const amAdmin = canModerateRoom(live);
    const now = Date.now();
    const lv = rules && typeof rules.computeRoomLevel === 'function'
      ? rules.computeRoomLevel(live.roomXp)
      : { level: 1, xp: 0, levelXp: 0, nextLevelXp: 100, progressPct: 0, tierName: 'Starter Stage' };
    const isFollowing = Array.isArray(live.followers) && live.followers.some(f => f && f.uid === uid);
    const isGuard = Array.isArray(live.guards) && live.guards.some(g => g && g.uid === uid);
    const isBoosted = Number(live.boostedUntil || 0) > now;
    const boostMinsLeft = isBoosted ? Math.max(1, Math.ceil((Number(live.boostedUntil) - now) / 60000)) : 0;
    const admins = rules && typeof rules.getRoomAdmins === 'function' ? rules.getRoomAdmins(live) : (live.admins || []).slice(0, 3);
    const activeMembers = rules ? rules.getOrderedActiveMembers(live, now, rules.DEFAULT_STALE_MS) : Object.values(live.members || {});

    if (activeTab === 'perks') {
      body.innerHTML = `
        <div class="advp-grid" data-testid="advp-perks-view">
          <div class="advp-card">
            <div class="advp-card-top"><b>📈 1. Room Level</b><span class="advp-badge gold">Lv.${lv.level} · ${esc(lv.tierName)}</span></div>
            <div class="advp-xp-bar"><i style="width:${Math.max(6, lv.progressPct)}%"></i></div>
            <small>${lv.levelXp}/${lv.nextLevelXp} XP · Earned via stays, followers, guards &amp; gifts</small>
          </div>

          <div class="advp-card">
            <div class="advp-card-top"><b>📣 2. Follow &amp; Rally</b><span class="advp-badge">${(live.followers || []).length} Followers</span></div>
            <div class="advp-row-btns">
              <button type="button" class="btn sm ${isFollowing ? 'gold' : 'ok'}" id="advpFollowBtn" data-testid="advp-follow-btn">${isFollowing ? '✓ Following' : '+ Follow Room'}</button>
              <button type="button" class="btn sm ghost" id="advpRallyBtn" data-testid="advp-rally-btn">📣 Send Rally</button>
            </div>
          </div>

          <div class="advp-card">
            <div class="advp-card-top"><b>🚀 3. Rec Card / Boost</b><span class="advp-badge ${isBoosted ? 'live' : ''}">${isBoosted ? `Active · ${boostMinsLeft}m` : 'Off'}</span></div>
            <small>Pins &amp; highlights room higher in the Room Lobby.</small>
            <button type="button" class="btn sm ${isBoosted ? 'ghost' : 'gold'}" id="advpBoostBtn" data-testid="advp-boost-btn">${isBoosted ? 'Refresh 30m Boost' : '🚀 Activate Rec Card Boost'}</button>
          </div>

          <div class="advp-card">
            <div class="advp-card-top"><b>🛡️ 4. Admin Slots</b><span class="advp-badge">${admins.length}/3 Used</span></div>
            <small>Owner appoints up to 3 Admins for mode, mic &amp; playlist control.</small>
            <button type="button" class="btn sm ghost" data-advp-jump="admins">Manage Admins ›</button>
          </div>

          <div class="advp-card">
            <div class="advp-card-top"><b>⚔️ 5. Room Guard</b><span class="advp-badge">${(live.guards || []).length} Guards</span></div>
            <small>${(live.guards || []).length ? (live.guards || []).slice(0, 4).map(g => esc(g.name)).join(', ') : 'Become a loyal Guardian supporter with shield badge.'}</small>
            <button type="button" class="btn sm ${isGuard ? 'gold' : 'ok'}" id="advpGuardBtn" data-testid="advp-guard-btn">${isGuard ? '⚔️ Guard Active' : '⚔️ Join Room Guard'}</button>
          </div>

          <div class="advp-card">
            <div class="advp-card-top"><b>🎙️ 6. Mic Order</b><span class="advp-badge">${(live.micOrder || []).length} Waiting</span></div>
            <small>Queue speakers &amp; lock/unlock stage seats smoothly.</small>
            <button type="button" class="btn sm ghost" data-advp-jump="mic">Open Mic Queue ›</button>
          </div>

          <div class="advp-card">
            <div class="advp-card-top"><b>🆔 7. Fixed ID</b><span class="advp-badge gold" data-testid="advp-fixed-id">${esc(live.fixedId || live.shortId)}</span></div>
            <small>${live.isOwnedRoom ? 'Permanent 6-digit Fixed ID tied to Owner Profile.' : 'Upgrade to Advanced Room (2,000 🪙) for a permanent Fixed ID.'}</small>
            <button type="button" class="btn sm ghost" id="advpCopyIdBtn">Copy ID ⧉</button>
          </div>

          <div class="advp-card">
            <div class="advp-card-top"><b>🎧 8. High Quality Mode</b><span class="advp-badge ${live.hqAudio ? 'live' : ''}">${live.hqAudio ? 'HD ON' : 'Standard'}</span></div>
            <small>Crisp studio voice clarity &amp; music fidelity mode.</small>
            <button type="button" class="btn sm ${live.hqAudio ? 'gold' : 'ok'}" id="advpHqBtn" data-testid="advp-hq-btn">${live.hqAudio ? 'HD Active · Tap to Toggle' : 'Enable HD Mode'}</button>
          </div>
        </div>
      `;
    } else if (activeTab === 'admins') {
      body.innerHTML = `
        <div class="advp-sec" data-testid="advp-admins-view">
          <div class="advp-sec-hdr">
            <b>Room Admins (${admins.length}/3)</b>
            <small>${amOwner ? 'You are the Room Owner · Tap to appoint/remove' : 'Only Room Owner can appoint/remove Admins'}</small>
          </div>
          <div class="advp-member-list">
            ${activeMembers.map(mb => {
              const isOwn = isSingleOwner(live, mb.uid);
              const isAdm = admins.includes(mb.uid);
              return `<div class="advp-member-row">
                <div class="advp-m-left">
                  <b>${esc(mb.name)}</b>
                  <small>${isOwn ? '👑 OWNER' : (isAdm ? '🛡️ ADMIN' : 'Member')}</small>
                </div>
                ${isOwn
                  ? '<span class="pfs-owner-tag">OWNER</span>'
                  : (amOwner
                    ? `<button type="button" class="btn sm ${isAdm ? 'red' : 'gold'}" data-advp-adm="${esc(mb.uid)}" data-advp-adm-make="${isAdm ? '0' : '1'}">${isAdm ? 'Remove' : 'Make Admin'}</button>`
                    : `<span class="advp-badge">${isAdm ? 'ADMIN' : 'Member'}</span>`)
                }
              </div>`;
            }).join('') || '<div class="mp-empty">No active members in room yet.</div>'}
          </div>
          ${amOwner ? `
            <div class="advp-add-uid-row">
              <input id="advpAddAdminUid" placeholder="Or enter Player UID to appoint Admin..." maxlength="40">
              <button type="button" class="btn sm gold" id="advpAddAdminBtn">Add</button>
            </div>
          ` : ''}
        </div>
      `;
    } else if (activeTab === 'mic') {
      const queue = Array.isArray(live.micOrder) ? live.micOrder : [];
      const inQueue = queue.some(x => x && x.uid === uid);
      const locked = Array.isArray(live.lockedSeats) ? live.lockedSeats : [];
      body.innerHTML = `
        <div class="advp-sec" data-testid="advp-mic-view">
          <div class="advp-sec-hdr">
            <b>Mic Turn Queue (${queue.length})</b>
            <div class="row" style="gap:6px">
              <button type="button" class="btn sm ${inQueue ? 'red' : 'ok'}" id="advpReqMicBtn" data-testid="advp-req-mic-btn">${inQueue ? 'Cancel Request' : '✋ Request Mic'}</button>
              ${amAdmin && queue.length ? '<button type="button" class="btn sm ghost" id="advpClearMicBtn">Clear</button>' : ''}
            </div>
          </div>
          <div class="advp-member-list">
            ${queue.length ? queue.map((q, i) => `
              <div class="advp-member-row">
                <div class="advp-m-left"><b>#${i + 1} ${esc(q.name)}</b><small>Waiting for mic seat</small></div>
                ${amAdmin ? `
                  <div class="row" style="gap:5px">
                    <button type="button" class="btn sm ok" data-advp-grant-mic="${esc(q.uid)}">Grant Mic</button>
                    <button type="button" class="btn sm ghost" data-advp-rm-mic="${esc(q.uid)}">✕</button>
                  </div>
                ` : '<span class="advp-badge">Queued</span>'}
              </div>
            `).join('') : '<div class="mp-empty">Mic order queue is empty. Tap <b>Request Mic</b> to queue up!</div>'}
          </div>
          <div class="advp-sec-hdr" style="margin-top:12px">
            <b>Seat Lock Controls (Seats 1–8)</b>
            <small>${amAdmin ? 'Tap any seat to Lock / Unlock' : 'Owner & Admins only'}</small>
          </div>
          <div class="advp-seat-lock-grid">
            ${[1, 2, 3, 4, 5, 6, 7, 8].map(num => {
              const isL = locked.includes(num);
              return `<button type="button" class="advp-seat-lock-btn ${isL ? 'locked' : ''}" data-advp-lock-seat="${num}">
                <span>${isL ? '🔒' : '🔓'}</span>
                <b>Seat ${num}</b>
              </button>`;
            }).join('')}
          </div>
        </div>
      `;
    } else if (activeTab === 'edit') {
      body.innerHTML = `
        <div class="advp-sec" data-testid="advp-edit-view">
          ${!amAdmin ? '<div class="advp-lock-note">🔒 Only Room Owner or Admins can edit room settings.</div>' : ''}
          <label for="advpEditTitle">Room Name</label>
          <input id="advpEditTitle" maxlength="36" value="${esc(live.title)}" ${amAdmin ? '' : 'disabled'} data-testid="advp-edit-title">
          <div class="crm-two-col" style="margin-top:8px">
            <div>
              <label for="advpEditTag">Category Tag</label>
              <select id="advpEditTag" ${amAdmin ? '' : 'disabled'}>
                ${PARTY_TAGS.map(t => `<option value="${esc(t)}" ${live.tag === t ? 'selected' : ''}>${esc(t)}</option>`).join('')}
              </select>
            </div>
            <div>
              <label for="advpEditMode">Room Mode</label>
              <select id="advpEditMode" ${amAdmin ? '' : 'disabled'}>
                ${Object.values(PARTY_MODES_META).map(md => `<option value="${esc(md.id)}" ${live.mode === md.id ? 'selected' : ''}>${esc(md.name)}</option>`).join('')}
              </select>
            </div>
          </div>
          <div class="crm-two-col" style="margin-top:8px">
            <div>
              <label for="advpEditCover">Room Cover</label>
              <select id="advpEditCover" ${amAdmin ? '' : 'disabled'}>
                ${Object.entries(PARTY_COVERS).map(([cid, cv]) => `<option value="${cid}" ${live.cover === cid ? 'selected' : ''}>${cv.glyph} ${cv.name}</option>`).join('')}
              </select>
            </div>
            <div>
              <label for="advpEditBg">Background Theme</label>
              <select id="advpEditBg" ${amAdmin ? '' : 'disabled'}>
                ${Object.values(PARTY_BG_META).map(b => `<option value="${b.id}" ${live.background === b.id ? 'selected' : ''}>${b.name}</option>`).join('')}
              </select>
            </div>
          </div>
          <label for="advpEditPass" style="margin-top:8px">Room Password (Optional · Leave empty for Open Room)</label>
          <input id="advpEditPass" type="text" maxlength="20" value="${esc(live.password || '')}" placeholder="No password (open to everyone)" ${amOwner ? '' : 'disabled'} data-testid="advp-edit-pass">
          <button type="button" class="btn gold full" id="advpSaveEditBtn" data-testid="advp-save-edit-btn" style="margin-top:12px">Save Room Settings</button>
        </div>
      `;
    }
  }

  m.addEventListener('click', (e) => {
    const live = getLive();
    const tBtn = e.target.closest('[data-advp-tab]');
    if (tBtn && tBtn.dataset.advpTab) {
      activeTab = tBtn.dataset.advpTab;
      renderPanel();
      return;
    }
    const jumpBtn = e.target.closest('[data-advp-jump]');
    if (jumpBtn && jumpBtn.dataset.advpJump) {
      activeTab = jumpBtn.dataset.advpJump;
      renderPanel();
      return;
    }

    if (e.target.closest('#advpFollowBtn')) {
      const res = rules && typeof rules.toggleRoomFollower === 'function'
        ? rules.toggleRoomFollower(live, uid, me.name || 'Player')
        : null;
      if (res && res.ok) {
        live.followers = res.followers;
        if (res.xpDelta) live.roomXp = Number(live.roomXp || 0) + res.xpDelta;
        if (live.isOwnedRoom) syncOwnedRoomProfileSnapshot(live);
        persistPartyRoom(live);
        toast(res.following ? '✓ Following this room!' : 'Unfollowed room');
        renderPanel();
      }
      return;
    }

    if (e.target.closest('#advpRallyBtn')) {
      if (!assertRoomPerm(live, 'rally_followers')) return;
      live.lastRallyAt = Date.now();
      live.roomXp = Number(live.roomXp || 0) + 10;
      const fCnt = (live.followers || []).length;
      live.chat = [...(live.chat || []), {
        id: 'rally_' + Date.now().toString(36),
        type: 'sys',
        text: `📣 ${me.name || 'Owner'} sent a Room Rally invite to ${fCnt || 'all'} followers!`,
        ts: Date.now()
      }].slice(-45);
      if (live.isOwnedRoom) syncOwnedRoomProfileSnapshot(live);
      persistPartyRoom(live);
      toast(`📣 Rally invite sent to ${fCnt || 'room'} followers!`);
      renderPanel();
      return;
    }

    if (e.target.closest('#advpBoostBtn')) {
      if (!assertRoomPerm(live, 'toggle_boost')) return;
      live.boostedUntil = Date.now() + 30 * 60 * 1000;
      live.roomXp = Number(live.roomXp || 0) + 20;
      if (live.isOwnedRoom) syncOwnedRoomProfileSnapshot(live);
      persistPartyRoom(live);
      renderPartyHub();
      toast('🚀 Rec Card Boost activated for 30 minutes!');
      renderPanel();
      return;
    }

    if (e.target.closest('#advpGuardBtn')) {
      const res = rules && typeof rules.toggleRoomGuard === 'function'
        ? rules.toggleRoomGuard(live, uid, me.name || 'Player')
        : null;
      if (res && res.ok) {
        live.guards = res.guards;
        if (res.xpDelta) live.roomXp = Number(live.roomXp || 0) + res.xpDelta;
        if (live.isOwnedRoom) syncOwnedRoomProfileSnapshot(live);
        persistPartyRoom(live);
        toast(res.isGuard ? '⚔️ You are now a Room Guard!' : 'Left Room Guard');
        renderPanel();
      }
      return;
    }

    if (e.target.closest('#advpCopyIdBtn')) {
      const idVal = String(live.fixedId || live.shortId);
      if (typeof copyTextClean === 'function') copyTextClean(idVal, 'Room ID');
      else toast('Room ID: ' + idVal);
      return;
    }

    if (e.target.closest('#advpHqBtn')) {
      if (!assertRoomPerm(live, 'toggle_hq')) return;
      live.hqAudio = !live.hqAudio;
      if (live.isOwnedRoom) syncOwnedRoomProfileSnapshot(live);
      persistPartyRoom(live);
      toast(live.hqAudio ? '🎧 High Quality HD Mode enabled' : 'Standard Audio Mode');
      renderPanel();
      return;
    }

    const admBtn = e.target.closest('[data-advp-adm]');
    if (admBtn && admBtn.dataset.advpAdm) {
      const makeAdm = admBtn.dataset.advpAdmMake === '1';
      const res = rules && typeof rules.setRoomAdmin === 'function'
        ? rules.setRoomAdmin(live, uid, admBtn.dataset.advpAdm, makeAdm)
        : null;
      if (!res || !res.ok) return toast(res?.error || 'Only Room Owner can manage Admins');
      live.admins = res.admins;
      if (live.isOwnedRoom) syncOwnedRoomProfileSnapshot(live);
      persistPartyRoom(live);
      toast(makeAdm ? `🛡️ Admin added (${live.admins.length}/3)` : 'Admin removed');
      renderPanel();
      return;
    }

    if (e.target.closest('#advpAddAdminBtn')) {
      const inp = $('#advpAddAdminUid', m);
      const tUid = (inp?.value || '').trim();
      const res = rules && typeof rules.setRoomAdmin === 'function'
        ? rules.setRoomAdmin(live, uid, tUid, true)
        : null;
      if (!res || !res.ok) return toast(res?.error || 'Unable to add Admin');
      live.admins = res.admins;
      if (inp) inp.value = '';
      if (live.isOwnedRoom) syncOwnedRoomProfileSnapshot(live);
      persistPartyRoom(live);
      toast(`🛡️ Admin appointed (${live.admins.length}/3)`);
      renderPanel();
      return;
    }

    if (e.target.closest('#advpReqMicBtn')) {
      const curQ = Array.isArray(live.micOrder) ? live.micOrder : [];
      const inQ = curQ.some(x => x && x.uid === uid);
      const res = rules && typeof rules.updateMicOrderQueue === 'function'
        ? rules.updateMicOrderQueue(live, inQ ? 'cancel' : 'request', uid, uid, me.name || 'Player')
        : null;
      if (res && res.ok) {
        live.micOrder = res.micOrder;
        persistPartyRoom(live);
        toast(inQ ? 'Mic request cancelled' : '✋ Added to Mic Order queue');
        renderPanel();
      }
      return;
    }

    if (e.target.closest('#advpClearMicBtn')) {
      const res = rules && typeof rules.updateMicOrderQueue === 'function'
        ? rules.updateMicOrderQueue(live, 'clear', '', uid)
        : null;
      if (!res || !res.ok) return toast(res?.error || 'Owner or Admins only');
      live.micOrder = [];
      persistPartyRoom(live);
      toast('Mic queue cleared');
      renderPanel();
      return;
    }

    const grantBtn = e.target.closest('[data-advp-grant-mic]');
    if (grantBtn && grantBtn.dataset.advpGrantMic) {
      const targetUid = grantBtn.dataset.advpGrantMic;
      const res = rules && typeof rules.updateMicOrderQueue === 'function'
        ? rules.updateMicOrderQueue(live, 'grant', targetUid, uid)
        : null;
      if (!res || !res.ok) return toast(res?.error || 'Owner or Admins only');
      live.micOrder = res.micOrder;
      // Seat the granted member into the first open Mic seat (1..3) if available
      const openMic = [1, 2, 3].find(k => !live.seats[String(k)] && !(live.lockedSeats || []).includes(k));
      const mInfo = live.members && live.members[targetUid];
      if (openMic != null && mInfo) {
        const nextSeats = { ...(live.seats || {}) };
        Object.keys(nextSeats).forEach(k => { if (nextSeats[k] && nextSeats[k].uid === targetUid) delete nextSeats[k]; });
        nextSeats[String(openMic)] = {
          uid: targetUid,
          name: mInfo.name || 'Player',
          avatar: mInfo.avatar || 'av_b1',
          frame: mInfo.frame || 'none',
          muted: false,
          speaking: true,
          joinedAt: Date.now(),
          lastSeen: Date.now(),
          connected: true
        };
        live.seats = normalizePartySeats(nextSeats);
      }
      persistPartyRoom(live, { fullReplace: true });
      toast('🎙️ Granted mic turn!');
      renderPanel();
      return;
    }

    const rmMicBtn = e.target.closest('[data-advp-rm-mic]');
    if (rmMicBtn && rmMicBtn.dataset.advpRmMic) {
      const res = rules && typeof rules.updateMicOrderQueue === 'function'
        ? rules.updateMicOrderQueue(live, 'remove', rmMicBtn.dataset.advpRmMic, uid)
        : null;
      if (!res || !res.ok) return toast(res?.error || 'Owner or Admins only');
      live.micOrder = res.micOrder;
      persistPartyRoom(live);
      renderPanel();
      return;
    }

    const lockSeatBtn = e.target.closest('[data-advp-lock-seat]');
    if (lockSeatBtn && lockSeatBtn.dataset.advpLockSeat) {
      if (!assertRoomPerm(live, 'lock_seat')) return;
      const num = Number(lockSeatBtn.dataset.advpLockSeat);
      const cur = new Set(Array.isArray(live.lockedSeats) ? live.lockedSeats : []);
      if (cur.has(num)) cur.delete(num);
      else cur.add(num);
      live.lockedSeats = [...cur].sort((a, b) => a - b);
      if (live.isOwnedRoom) syncOwnedRoomProfileSnapshot(live);
      persistPartyRoom(live);
      toast(cur.has(num) ? `🔒 Seat ${num} locked` : `🔓 Seat ${num} unlocked`);
      renderPanel();
      return;
    }

    if (e.target.closest('#advpSaveEditBtn')) {
      if (!assertRoomPerm(live, 'edit_settings')) return;
      const nextTitle = ($('#advpEditTitle', m)?.value || '').trim().slice(0, 36);
      const nextTag = $('#advpEditTag', m)?.value || live.tag;
      const nextMode = $('#advpEditMode', m)?.value || live.mode;
      const nextCover = $('#advpEditCover', m)?.value || live.cover;
      const nextBg = $('#advpEditBg', m)?.value || live.background;
      if (nextTitle) live.title = nextTitle;
      live.tag = nextTag;
      live.mode = nextMode;
      live.cover = nextCover;
      live.background = nextBg;
      if (isSingleOwner(live, uid) && $('#advpEditPass', m)) {
        live.password = ($('#advpEditPass', m).value || '').trim().slice(0, 20);
      }
      if (live.isOwnedRoom) syncOwnedRoomProfileSnapshot(live);
      persistPartyRoom(live);
      if (typeof buildProfile === 'function') buildProfile();
      toast('✓ Room settings saved');
      m.close();
    }
  });

  renderPanel();
}
window.openPartyAdvancedPanel = openPartyAdvancedPanel;

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
    if (sit) {
      const sIdx = Number(sit.dataset.sit);
      if (window.PartyRoomExtras && typeof window.PartyRoomExtras.openSeatTapActionSheet === 'function') {
        window.PartyRoomExtras.openSeatTapActionSheet(rm, sIdx);
      } else {
        partyTakeSeat(rm, sIdx);
      }
      return;
    }

    const occ = e.target.closest('[data-seat-uid]');
    if (occ) {
      const sIdx = Number(occ.dataset.seatIdx);
      if (window.PartyRoomExtras && typeof window.PartyRoomExtras.openSeatTapActionSheet === 'function') {
        window.PartyRoomExtras.openSeatTapActionSheet(rm, sIdx);
      } else {
        openSeatModModal(rm, sIdx);
      }
      return;
    }

    const quickYtBtn = e.target.closest('[data-pfs-quick-yt]');
    if (quickYtBtn && quickYtBtn.dataset.pfsQuickYt) {
      selectPartyYouTubePreset(rm, quickYtBtn.dataset.pfsQuickYt);
      return;
    }

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
    const extras = window.PartyRoomExtras || null;

    if (act === 'exit-room' || act === 'close') {
      closePartyRoom();
    } else if (act === 'minimize') {
      minimizePartyRoom();
    } else if (act === 'open-room-info') {
      if (extras) extras.openPartyRoomInfoModal(rm);
    } else if (act === 'open-room-menu') {
      if (extras) extras.openPartyRoomMenuDrawer(rm);
    } else if (act === 'open-full-settings') {
      if (extras) extras.openPartyFullSettingsModal(rm);
      else openPartyAdvancedPanel(rm, 'edit');
    } else if (act === 'open-daily-tasks') {
      if (extras) extras.openPartyDailyTasksModal(rm);
    } else if (act === 'open-create-pk') {
      if (extras) extras.openPartyCreatePkModal(rm);
    } else if (act === 'open-whos-winner') {
      if (extras) extras.openPartyWhosWinnerModal(rm);
    } else if (act === 'open-volume') {
      if (extras) extras.openRoomVolumeModal(rm);
    } else if (act === 'toggle-emoji-dock') {
      const dock = $('#pfsReactDock', root);
      if (dock) dock.hidden = !dock.hidden;
    } else if (act === 'audio-toggle') {
      if (!assertRoomPerm(rm, 'control_playlist')) return;
      rm.musicPlaying = !rm.musicPlaying;
      PartyAudioPlayer.setPlaying(rm.musicPlaying);
      persistPartyRoom(rm);
    } else if (act === 'audio-next') {
      if (!assertRoomPerm(rm, 'control_playlist')) return;
      advanceRoomQueue(rm);
    } else if (act.startsWith('pk-')) {
      if (extras) extras.handleRoomPkAction(rm, act);
    } else if (act.startsWith('mode-')) {
      if (window.PartyModeStages && typeof window.PartyModeStages.handleAction === 'function') {
        window.PartyModeStages.handleAction(rm, act, actBtn);
      }
    } else if (act === 'open-advanced') {
      openPartyAdvancedPanel(rm, 'perks');
    } else if (act === 'open-invite') {
      openPartyInviteModal(rm);
    } else if (act === 'open-music') {
      openPartyMusicModal(rm);
    } else if (act === 'open-modes') {
      openPartyModesModal(rm);
    } else if (act === 'open-add-video') {
      if (!assertRoomPerm(rm, 'control_playlist')) return;
      openPartyVideoModal(rm);
    } else if (act === 'open-add-video-paste') {
      if (!assertRoomPerm(rm, 'control_playlist')) return;
      openPartyVideoModal(rm, { openPaste: true });
    } else if (act === 'open-playlist') {
      openPartyPlaylistDrawer(rm);
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

function migratePartyRoomsIdentity(prevUid, nextUid) {
  const fromId = String(prevUid || '').trim();
  const toId = String(nextUid || '').trim();
  if (!fromId || !toId || fromId === toId) return;

  let anyChanged = false;
  if (me && me.ownedRoom && me.ownedRoom.ownerUid === fromId) {
    me.ownedRoom.ownerUid = toId;
    if (typeof saveMe === 'function') saveMe();
  }

  partyRooms.forEach(rm => {
    if (!rm || rm.status === 'closed') return;
    let touched = false;
    if (rm.hostUid === fromId) { rm.hostUid = toId; touched = true; }
    if (rm.activeHostUid === fromId) { rm.activeHostUid = toId; touched = true; }
    if (rm.ownerUid === fromId) { rm.ownerUid = toId; touched = true; }

    if (rm.seats && typeof rm.seats === 'object') {
      Object.keys(rm.seats).forEach(k => {
        if (rm.seats[k] && rm.seats[k].uid === fromId) {
          rm.seats[k] = { ...rm.seats[k], uid: toId };
          touched = true;
        }
      });
    }

    if (rm.members && typeof rm.members === 'object' && rm.members[fromId]) {
      const prevMem = rm.members[fromId];
      const existingNext = rm.members[toId] || {};
      rm.members[toId] = {
        ...existingNext,
        ...prevMem,
        uid: toId,
        seatIdx: prevMem.seatIdx != null ? prevMem.seatIdx : (existingNext.seatIdx != null ? existingNext.seatIdx : null),
        lastSeen: Math.max(Number(prevMem.lastSeen || 0), Number(existingNext.lastSeen || 0), Date.now()),
        connected: true
      };
      delete rm.members[fromId];
      touched = true;
    }

    if (Array.isArray(rm.admins) && rm.admins.includes(fromId)) {
      rm.admins = [...new Set(rm.admins.map(a => (a === fromId ? toId : a)))];
      touched = true;
    }
    if (Array.isArray(rm.followers)) {
      rm.followers.forEach(f => {
        if (f && f.uid === fromId) { f.uid = toId; touched = true; }
      });
    }
    if (Array.isArray(rm.blocklist)) {
      rm.blocklist.forEach(b => {
        if (b && b.uid === fromId) { b.uid = toId; touched = true; }
      });
    }
    if (Array.isArray(rm.kickedUids) && rm.kickedUids.includes(fromId)) {
      rm.kickedUids = [...new Set(rm.kickedUids.map(x => (x === fromId ? toId : x)))];
      touched = true;
    }

    if (touched) {
      anyChanged = true;
      rm.seats = normalizePartySeats(rm.seats);
      rm.updatedAt = Date.now();
      persistPartyRoom(rm, { fullReplace: true });
    }
  });

  if (anyChanged && activePartyRoomId) {
    renderFullScreenPartyRoom();
  }
}
window.migratePartyRoomsIdentity = migratePartyRoomsIdentity;

function appendPartyRoomGift(roomId, evObj) {
  if (!roomId || !evObj) return;
  const rm = partyRooms.find(r => r && r.id === roomId && r.status !== 'closed');
  if (!rm) return;
  const now = Date.now();
  const giftName = evObj.giftName || evObj.giftId || 'Gift';
  const qty = Math.max(1, Number(evObj.qty || 1));
  const fromName = evObj.fromName || (me && me.name) || 'Player';
  const toName = evObj.toName || 'Room';
  const totalCoins = Math.max(10, Number(evObj.totalCoins || evObj.coins || evObj.charm || 20));

  rm.chat = [...(rm.chat || []), {
    id: 'gft_' + now.toString(36),
    type: 'sys',
    text: `🎁 ${fromName} sent ${qty}× ${giftName} to ${toName}!`,
    ts: now
  }].slice(-45);

  if (rm.pk && rm.pk.status === 'active' && rm.pk.scoring === 'gifts' && window.PartyRoomExtrasRules && typeof window.PartyRoomExtrasRules.applyPkPoints === 'function') {
    const targetSide = (evObj.toUid && rm.seats && rm.seats['1'] && rm.seats['1'].uid === evObj.toUid) ? 'blue' : 'red';
    const res = window.PartyRoomExtrasRules.applyPkPoints(rm.pk, targetSide, totalCoins, evObj.fromUid || uid, now);
    if (res && res.ok) rm.pk = res.pk;
  }

  if (window.PartyRoomExtras && typeof window.PartyRoomExtras.trackRoomDailyEvent === 'function') {
    window.PartyRoomExtras.trackRoomDailyEvent('task_gift');
  }
  persistPartyRoom(rm);
}
window.appendPartyRoomGift = appendPartyRoomGift;

window.PartyRoomController = {
  getRooms: () => partyRooms,
  getActiveRoomId: () => activePartyRoomId,
  getMinimizedRoomId: () => minimizedPartyRoomId,
  runLifecycleSweep: runRoomLifecycleSweep,
  sendReaction: sendPartyReaction,
  sendChat: sendPartyChatMessage,
  openMusicModal: (rm) => openPartyMusicModal(rm || partyRooms.find(r => r && r.id === activePartyRoomId)),
  openVideoModal: (rm, opts) => openPartyVideoModal(rm || partyRooms.find(r => r && r.id === activePartyRoomId), opts),
  openPlaylistDrawer: (rm) => openPartyPlaylistDrawer(rm || partyRooms.find(r => r && r.id === activePartyRoomId)),
  openAdvancedPanel: (rm, tab) => openPartyAdvancedPanel(rm || partyRooms.find(r => r && r.id === activePartyRoomId), tab),
  openAdvancedUnlock: (pre) => openAdvancedRoomUnlockModal(pre),
  openMyOwnedRoom: () => openMyOwnedPartyRoom(),
  migrateUserUid: migratePartyRoomsIdentity,
  getAudioState: () => PartyAudioPlayer.getState(),
  minimize: minimizePartyRoom,
  close: closePartyRoom
};
