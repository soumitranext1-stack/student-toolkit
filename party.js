"use strict";
/* =====================================================================
   FULL-SCREEN VOICE / PARTY ROOMS (v14)
   - Detailed Graphics, Ornate Metallic Frames, 5 Room Backgrounds
   - 5 Interactive Modes: Normal, Acquaint, Auction, Video, Games
   - Room Settings, Moderation Toggles, Password Lock, Blocklist & Logs
   - Strict 1-User = 1-Seat Atomic Switching (Zero Clone Bug)
   - Delegated Event Binding (Zero Duplicate Listeners)
   - Preserves Turn-Based Mic Pass, Quick Voice Chat, 3D Gifts & Firebase Sync
   ===================================================================== */

const PARTY_MODES_META = {
  normal: {
    id: 'normal',
    name: 'Normal',
    badge: 'Voice',
    desc: 'Owner stage + balanced 2-column paired seats with live audio waves & chat.'
  },
  acquaint: {
    id: 'acquaint',
    name: 'Acquaint',
    badge: 'Acquaint',
    desc: 'Social matchmaking spotlight pair with quick wave, heart & bond prompts.'
  },
  auction: {
    id: 'auction',
    name: 'Auction',
    badge: 'Auction',
    desc: 'Spotlight stage, bidding tiers, TOP gifter crown & 3-seat VIP podium.'
  },
  video: {
    id: 'video',
    name: 'Video',
    badge: 'Watch',
    desc: 'Shared YouTube watch-together cinema card above live voice seats & chat.'
  },
  games: {
    id: 'games',
    name: 'Games',
    badge: 'Games',
    desc: 'In-room party mini-games (Dice, Truth/Dare, Arena launchers) + coin stakes.'
  }
};

const PARTY_BG_META = {
  club: {
    id: 'club',
    name: 'Club Stage',
    css: 'radial-gradient(circle at 50% 6%, rgba(56,189,248,.28), transparent 46%), radial-gradient(circle at 18% 72%, rgba(168,85,247,.26), transparent 52%), radial-gradient(circle at 86% 68%, rgba(236,72,153,.2), transparent 48%), linear-gradient(168deg,#071026 0%,#10193c 48%,#060a18 100%)',
    accent: '#38bdf8'
  },
  grid: {
    id: 'grid',
    name: 'Cyber Grid',
    css: 'radial-gradient(circle at 50% 10%, rgba(34,211,238,.26), transparent 48%), radial-gradient(circle at 80% 80%, rgba(99,102,241,.28), transparent 52%), linear-gradient(170deg,#050d20 0%,#0d1b3d 54%,#050914 100%)',
    accent: '#22d3ee'
  },
  stage: {
    id: 'stage',
    name: 'Royal Stage',
    css: 'radial-gradient(circle at 50% 4%, rgba(251,191,36,.3), transparent 46%), radial-gradient(circle at 18% 82%, rgba(244,63,94,.24), transparent 50%), linear-gradient(168deg,#1c0c24 0%,#241236 52%,#090a18 100%)',
    accent: '#fbbf24'
  },
  neon: {
    id: 'neon',
    name: 'Neon Chill',
    css: 'radial-gradient(circle at 22% 14%, rgba(56,189,248,.3), transparent 46%), radial-gradient(circle at 82% 80%, rgba(168,85,247,.3), transparent 50%), linear-gradient(160deg,#0c1633,#1b1140 52%,#090e20)',
    accent: '#a855f7'
  },
  royal: {
    id: 'royal',
    name: 'Velvet Palace',
    css: 'radial-gradient(circle at 50% 14%, rgba(255,211,107,.32), transparent 46%), radial-gradient(circle at 20% 82%, rgba(244,114,182,.28), transparent 50%), linear-gradient(165deg,#2e0826,#3e1244 50%,#140820)',
    accent: '#ffd36b'
  }
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

const PARTY_MUSIC_TRACKS = [
  { id: 'hi_kesariya', category: 'hindi', title: 'Kesariya Acoustic Vibe', artist: 'Hindi Chill · Unplugged', notes: [261.63, 329.63, 392.0, 329.63], bpm: 84 },
  { id: 'hi_raatan', category: 'hindi', title: 'Raatan Lambiyan Chill', artist: 'Hindi Romantic · Soft', notes: [293.66, 369.99, 440.0, 369.99], bpm: 88 },
  { id: 'hi_tumhiho', category: 'hindi', title: 'Tum Hi Ho Piano', artist: 'Hindi Slow · Acoustic', notes: [220.0, 261.63, 329.63, 293.66], bpm: 74 },
  { id: 'bn_tomake', category: 'bangla', title: 'Tomake Chai Unplugged', artist: 'Bangla Acoustic · Kolkata', notes: [246.94, 311.13, 369.99, 311.13], bpm: 80 },
  { id: 'bn_monmajhi', category: 'bangla', title: 'Mon Majhi Re Folk', artist: 'Bangla Melodic · Breeze', notes: [261.63, 293.66, 392.0, 329.63], bpm: 86 },
  { id: 'bn_boshonto', category: 'bangla', title: 'Boshonto Eshe Geche', artist: 'Bangla Classic · Indie', notes: [293.66, 329.66, 440.0, 392.0], bpm: 92 },
  { id: 'lofi_midnight', category: 'lofi', title: 'Midnight Lo-Fi Study', artist: 'Lo-Fi · Synth Ambient', notes: [196.0, 246.94, 293.66, 246.94], bpm: 76 },
  { id: 'lofi_club', category: 'lofi', title: 'Neon Club Groove', artist: 'Lo-Fi · Deep Chill', notes: [220.0, 277.18, 329.63, 277.18], bpm: 108 },
  { id: 'lofi_velvet', category: 'lofi', title: 'Velvet Rain Piano', artist: 'Lo-Fi · Focus Acoustic', notes: [174.61, 220.0, 261.63, 220.0], bpm: 68 }
];

const PARTY_PHOTO_STAMPS = [
  { id: 'st_hi', label: 'Say Hi 👋', bg: 'linear-gradient(135deg,#0284c7,#6366f1)', text: 'Hey everyone! Glad to be in the room!' },
  { id: 'st_vibe', label: 'Good Vibes ✨', bg: 'linear-gradient(135deg,#9333ea,#ec4899)', text: 'Loving the music & chill vibe tonight ✨' },
  { id: 'st_gg', label: 'GG Squad 🏆', bg: 'linear-gradient(135deg,#d97706,#b91c1c)', text: 'Ready for an Arena match? Who is in! 🏆' },
  { id: 'st_follow', label: 'Follow Room 💎', bg: 'linear-gradient(135deg,#059669,#0284c7)', text: 'Room ko follow and join kro! 💎' }
];

const PARTY_THEMES = {
  lounge: { name: 'Neon Chill', bg: PARTY_BG_META.club.css, badge: 'Friends' },
  spy: { name: 'Spy Mic Room', bg: PARTY_BG_META.stage.css, badge: 'Spy Turn' },
  cinema: { name: 'Watch Cinema', bg: PARTY_BG_META.grid.css, badge: 'Video' },
  study: { name: 'Focus Cafe', bg: PARTY_BG_META.neon.css, badge: 'Study' },
  wedding: { name: 'Royal Wedding', bg: PARTY_BG_META.royal.css, badge: 'Wedding' }
};

const PARTY_REACTIONS = ['🔥', '❤️', '😂', '👏', '🎉', '💎', '👑', '😮'];

const PARTY_TRUTH_DARES = [
  'Truth: What is the funniest study excuse you ever used?',
  'Dare: Drop a Quick Voice callout in the room right now!',
  'Truth: Which Arena game can you beat anyone at 1v1?',
  'Dare: Greet the host in room chat using only emojis!',
  'Truth: Late-night music or total silence while studying?',
  'Dare: Send a Lucky Dice roll and challenge Seat 2!'
];

/* ===== Strict 1-User = 1-Seat Normalization & Atomic Helpers (Clone Bug Fix) ===== */
function normalizePartySeats(seats) {
  if (!seats || typeof seats !== 'object') return {};
  const bestByUid = new Map();
  const keys = Object.keys(seats).sort((a, b) => Number(a) - Number(b));
  keys.forEach(k => {
    const occ = seats[k];
    if (!occ || !occ.uid) return;
    const joinedAt = Number(occ.joinedAt || 0);
    const prev = bestByUid.get(occ.uid);
    if (!prev || joinedAt > prev.joinedAt) {
      bestByUid.set(occ.uid, { key: k, joinedAt });
    }
  });
  const clean = {};
  bestByUid.forEach((info, uId) => {
    const occ = seats[info.key];
    if (occ && occ.uid === uId) {
      clean[info.key] = { ...occ };
    }
  });
  return clean;
}

function countUserSeatsInRoom(room, userUid) {
  if (!room || !room.seats || !userUid) return 0;
  return Object.values(room.seats).filter(s => s && s.uid === userUid).length;
}

function findUserSeatKeyInRoom(room, userUid) {
  if (!room || !room.seats || !userUid) return null;
  const keys = Object.keys(room.seats).sort((a, b) => Number(a) - Number(b));
  for (let i = 0; i < keys.length; i++) {
    if (room.seats[keys[i]] && room.seats[keys[i]].uid === userUid) return keys[i];
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
  const themeBgFallback = rm.theme === 'spy' ? 'stage' : (rm.theme === 'cinema' ? 'grid' : (rm.theme === 'wedding' ? 'royal' : 'club'));
  const modeFallback = rm.youtubeId ? 'video' : 'normal';
  const mode = PARTY_MODES_META[rm.mode] ? rm.mode : modeFallback;
  const background = PARTY_BG_META[rm.background] ? rm.background : themeBgFallback;
  const cover = PARTY_COVERS[rm.cover] ? rm.cover : (rm.theme === 'cinema' ? 'cover_cinema' : (rm.theme === 'wedding' ? 'cover_crown' : 'cover_tensura'));
  const seats = normalizePartySeats(rm.seats);
  const lockedSeats = Array.isArray(rm.lockedSeats)
    ? [...new Set(rm.lockedSeats.map(Number).filter(n => Number.isInteger(n) && n >= 0 && n < 10 && !seats[String(n)]))]
    : [];
  const hostSeat = seats['0'] || Object.values(seats)[0] || null;
  const auction = rm.auction && typeof rm.auction === 'object' ? {
    active: rm.auction.active !== false,
    subjectName: rm.auction.subjectName || rm.hostName || 'Host',
    currentBid: Math.max(100, Number(rm.auction.currentBid || 500)),
    topBidderUid: rm.auction.topBidderUid || 'bot_kai',
    topBidderName: rm.auction.topBidderName || 'Kai Volt',
    stageBadge: rm.auction.stageBadge || 'Rising Spotlight',
    bidsCount: Number(rm.auction.bidsCount || 1)
  } : {
    active: true,
    subjectName: rm.hostName || hostSeat?.name || 'Host',
    currentBid: 500,
    topBidderUid: 'bot_kai',
    topBidderName: 'Kai Volt',
    stageBadge: 'Rising Spotlight',
    bidsCount: 1
  };
  return {
    ...rm,
    id: rm.id || ('pr_' + Date.now().toString(36)),
    shortId: rm.shortId || makeRoomShortId(rm.id),
    title: rm.title || 'Tensura',
    tag: rm.tag || rm.category || 'Friends',
    category: rm.tag || rm.category || PARTY_MODES_META[mode].badge,
    cover,
    mode,
    background,
    announcement: typeof rm.announcement === 'string' && rm.announcement.trim()
      ? rm.announcement
      : 'Room ko follow and join kro · No abusive language or misbehavior. Keep voice chat fun & friendly!',
    partnerSeatEnabled: typeof rm.partnerSeatEnabled === 'boolean' ? rm.partnerSeatEnabled : false,
    highQualityAudio: typeof rm.highQualityAudio === 'boolean' ? rm.highQualityAudio : true,
    banTextChat: Boolean(rm.banTextChat),
    banPhotoChat: Boolean(rm.banPhotoChat),
    banRedPacket: Boolean(rm.banRedPacket),
    passwordLocked: Boolean(rm.passwordLocked && rm.passcode),
    passcode: String(rm.passcode || ''),
    blocklist: Array.isArray(rm.blocklist) ? [...new Set(rm.blocklist.filter(Boolean))] : [],
    lockedSeats,
    musicTrack: typeof rm.musicTrack === 'string' ? rm.musicTrack : '',
    musicCustomUrl: typeof rm.musicCustomUrl === 'string' ? rm.musicCustomUrl : '',
    musicCustomTitle: typeof rm.musicCustomTitle === 'string' ? rm.musicCustomTitle : '',
    musicYoutubeId: typeof rm.musicYoutubeId === 'string' ? rm.musicYoutubeId : '',
    youtubeId: String(rm.youtubeId || ''),
    gameCoinMode: rm.gameCoinMode === 'coin' ? 'coin' : 'free',
    seats,
    auction,
    topGifter: rm.topGifter || { name: 'Aria Nova', charm: 21000, avatar: 'av_g1' },
    supporters: Array.isArray(rm.supporters) && rm.supporters.length ? rm.supporters : [
      { name: 'Aria Nova', avatar: 'av_g1', coins: 21400 },
      { name: 'Kai Volt', avatar: 'av_b1', coins: 8400 },
      { name: 'Zara Star', avatar: 'av_g3', coins: 5100 }
    ],
    operationLog: Array.isArray(rm.operationLog) ? rm.operationLog.slice(0, 30) : [
      { id: 'op_init', actor: rm.hostName || 'Host', action: 'Opened voice room & applied rules board', ts: Number(rm.createdAt || Date.now()) }
    ],
    chat: Array.isArray(rm.chat) ? rm.chat.slice(-45) : []
  };
}

function buildSeedPartyRooms() {
  const now = Date.now();
  return [
    normalizePartyRoom({
      id: 'pr_seed_tensura',
      shortId: '882410',
      title: 'Tensura',
      tag: 'Friends',
      cover: 'cover_tensura',
      mode: 'normal',
      background: 'club',
      theme: 'lounge',
      hostUid: 'bot_aria',
      hostName: 'Aria Nova',
      announcement: 'Room ko follow and join kro · No abusive language or misbehavior. Respect all speakers & enjoy the vibe!',
      partnerSeatEnabled: false,
      highQualityAudio: true,
      musicTrack: '',
      lockedSeats: [8],
      micPass: { active: false, queue: ['bot_aria', 'bot_kai'], currentIdx: 0, round: 1, turnDurationSec: 25, turnEndsAt: 0 },
      seats: {
        '0': { uid: 'bot_aria', name: 'Aria Nova', avatar: 'av_g1', frame: 'fx_gold', muted: false, vipTier: 'royal', speaking: true, charm: 21400, joinedAt: now - 50000 },
        '1': { uid: 'bot_kai', name: 'Kai Volt', avatar: 'av_b1', frame: 'fx_sapphire', muted: false, vipTier: 'gold', speaking: false, charm: 8400, joinedAt: now - 42000 },
        '2': { uid: 'bot_zara', name: 'Zara Star', avatar: 'av_g3', frame: 'fx_aurora', muted: true, vipTier: 'silver', speaking: false, charm: 5100, joinedAt: now - 35000 }
      },
      youtubeId: '',
      chat: [
        { id: 'ps1', type: 'sys', text: 'Welcome to Tensura | Friends! Follow the room & grab an open seat.', ts: now - 45000 },
        { id: 'ps2', type: 'text', uid: 'bot_aria', name: 'Aria Nova', text: 'Room ko follow and join kro! Tap any + seat to hop on mic 🎙️', ts: now - 25000 },
        { id: 'ps2b', type: 'text', uid: 'bot_kai', name: 'Kai Volt', text: 'Try switching modes (Auction, Acquaint, Video, Games) from ⋯ or ⊞!', ts: now - 15000 }
      ],
      createdAt: now - 60000,
      updatedAt: now
    }),
    normalizePartyRoom({
      id: 'pr_seed_auction',
      shortId: '749205',
      title: 'Royal Auction & Spy Mic',
      tag: 'Auction',
      cover: 'cover_crown',
      mode: 'auction',
      background: 'stage',
      theme: 'spy',
      hostUid: 'bot_leo',
      hostName: 'Leo Blaze',
      announcement: 'VIP Auction & One-by-One Spy Mic! Top bidder wins the Royal Spotlight & relationship advancement badge.',
      lockedSeats: [],
      micPass: { active: true, queue: ['bot_leo', 'bot_mira', 'bot_rio'], currentIdx: 0, round: 1, turnDurationSec: 25, turnEndsAt: now + 25000 },
      seats: {
        '0': { uid: 'bot_leo', name: 'Leo Blaze', avatar: 'av_b3', frame: 'fx_crimson', muted: false, vipTier: 'royal', speaking: true, charm: 19200, joinedAt: now - 48000 },
        '1': { uid: 'bot_mira', name: 'Mira Rose', avatar: 'av_g4', frame: 'fx_sakura', muted: false, vipTier: 'gold', speaking: false, charm: 12100, joinedAt: now - 40000 },
        '2': { uid: 'bot_rio', name: 'Rio Cyber', avatar: 'av_b2', frame: 'fx_emerald', muted: false, vipTier: 'silver', speaking: false, charm: 9400, joinedAt: now - 32000 }
      },
      auction: {
        active: true,
        subjectName: 'Leo Blaze',
        currentBid: 1200,
        topBidderUid: 'bot_mira',
        topBidderName: 'Mira Rose',
        stageBadge: 'Rising Spotlight',
        bidsCount: 3
      },
      youtubeId: '',
      chat: [
        { id: 'ps3', type: 'sys', text: 'Auction Stage + Turn Mic Pass live! Place a bid or join VIP podium.', ts: now - 30000 },
        { id: 'ps4', type: 'text', uid: 'bot_leo', name: 'Leo Blaze', text: 'Current highest bid is 1,200 🪙 by Mira Rose!', ts: now - 12000 }
      ],
      createdAt: now - 55000,
      updatedAt: now - 5000
    }),
    normalizePartyRoom({
      id: 'pr_seed_cinema',
      shortId: '503819',
      title: 'Lo-Fi Study & Watch Party',
      tag: 'Study',
      cover: 'cover_cinema',
      mode: 'video',
      background: 'grid',
      theme: 'cinema',
      hostUid: 'bot_maya',
      hostName: 'Maya Sun',
      announcement: 'Watch Together Cinema · Paste any YouTube link to play for the room while chatting on mic!',
      lockedSeats: [7],
      micPass: { active: false, queue: ['bot_maya'], currentIdx: 0, round: 1, turnDurationSec: 25, turnEndsAt: 0 },
      seats: {
        '0': { uid: 'bot_maya', name: 'Maya Sun', avatar: 'av_g5', frame: 'fx_phoenix', muted: false, vipTier: 'gold', speaking: true, charm: 11200, joinedAt: now - 36000 },
        '1': { uid: 'bot_devon', name: 'Devon Ace', avatar: 'av_b4', frame: 'none', muted: true, vipTier: '', speaking: false, charm: 3400, joinedAt: now - 22000 }
      },
      youtubeId: '',
      chat: [
        { id: 'ps5', type: 'sys', text: 'Video Mode active — tap "Add video" to load a YouTube stream!', ts: now - 20000 }
      ],
      createdAt: now - 40000,
      updatedAt: now - 10000
    })
  ];
}

let partyRooms = ls.get('sg_party_rooms', null);
if (!Array.isArray(partyRooms) || !partyRooms.length) {
  partyRooms = buildSeedPartyRooms();
  ls.set('sg_party_rooms', partyRooms);
} else {
  partyRooms = partyRooms.map(normalizePartyRoom).filter(Boolean);
  // Ensure flagship Tensura room exists for first-class showcase
  if (!partyRooms.some(r => r.id === 'pr_seed_tensura')) {
    partyRooms = [buildSeedPartyRooms()[0], ...partyRooms.filter(r => r.id !== 'pr_seed_neon')].slice(0, 24);
  }
  ls.set('sg_party_rooms', partyRooms);
}

let activePartyRoomId = null;
let minimizedPartyRoomId = null;
let partyMicTimerId = null;
let partySpeakerOn = true;
let partyDismissedFloaters = { envelope: false, tower: false };
let partyUnlockedRooms = new Set();
let partyActiveMusicOsc = null;

function savePartyRoomsLocal() {
  ls.set('sg_party_rooms', (partyRooms || []).slice(0, 24));
}

function logPartyOperation(room, actionText) {
  if (!room) return;
  room.operationLog = [{
    id: 'op_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 4),
    actor: me.name || 'Player',
    action: actionText,
    ts: Date.now()
  }, ...(Array.isArray(room.operationLog) ? room.operationLog : [])].slice(0, 30);
}

function persistPartyRoom(room) {
  if (!room || !room.id) return;
  room.seats = normalizePartySeats(room.seats);
  room.updatedAt = Date.now();
  const idx = partyRooms.findIndex(r => r.id === room.id);
  if (idx >= 0) partyRooms[idx] = room;
  else partyRooms = [room, ...partyRooms].slice(0, 24);
  savePartyRoomsLocal();
  if (!String(room.id).startsWith('pr_seed_')) {
    dbOp(() => F.setDoc(F.doc(db, 'party_rooms', room.id), room, { merge: true }));
  }
  renderPartyHub();
  renderMinimizedPartyPill();
  if (activePartyRoomId === room.id) renderFullScreenPartyRoom();
}

function ingestPartyRooms(list) {
  const now = Date.now();
  const live = (Array.isArray(list) ? list : [])
    .filter(r => r && r.id && (!r.expiresAt || Number(r.expiresAt) > now))
    .map(normalizePartyRoom)
    .filter(Boolean)
    .sort((a, b) => Number(b.updatedAt || 0) - Number(a.updatedAt || 0));
  if (live.length) {
    const existingSeeds = partyRooms.filter(r => String(r.id).startsWith('pr_seed_'));
    const fallbackSeeds = existingSeeds.length ? existingSeeds : buildSeedPartyRooms();
    const seeds = fallbackSeeds.filter(s => !live.some(l => l.id === s.id));
    partyRooms = [...live, ...seeds].slice(0, 24);
  } else if (!partyRooms.length) {
    partyRooms = buildSeedPartyRooms();
  }
  savePartyRoomsLocal();
  renderPartyHub();
  renderMinimizedPartyPill();
  if (activePartyRoomId) renderFullScreenPartyRoom();
}

function parseYouTubeVideoId(input) {
  const s = String(input || '').trim();
  if (!s) return '';
  if (/^[a-zA-Z0-9_-]{11}$/.test(s)) return s;
  const m = s.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : '';
}

function getSeatedOrder(room) {
  const seats = normalizePartySeats(room && room.seats ? room.seats : {});
  return Object.keys(seats)
    .sort((a, b) => Number(a) - Number(b))
    .map(k => seats[k]?.uid)
    .filter(Boolean);
}

function syncMicPassQueue(room) {
  if (!room) return;
  room.seats = normalizePartySeats(room.seats);
  const seated = getSeatedOrder(room);
  if (!room.micPass || typeof room.micPass !== 'object') {
    room.micPass = { active: false, queue: seated, currentIdx: 0, round: 1, turnDurationSec: 25, turnEndsAt: 0 };
    return;
  }
  const activeUid = room.micPass.queue && room.micPass.queue[room.micPass.currentIdx];
  room.micPass.queue = seated;
  if (!seated.length) {
    room.micPass.active = false;
    room.micPass.currentIdx = 0;
    room.micPass.turnEndsAt = 0;
    return;
  }
  const foundIdx = seated.indexOf(activeUid);
  room.micPass.currentIdx = foundIdx >= 0 ? foundIdx : (room.micPass.currentIdx % seated.length);
}

function advancePartyMicTurn(room, autoTriggered) {
  if (!room) return;
  syncMicPassQueue(room);
  const mp = room.micPass;
  if (!mp.active || !mp.queue.length) return;
  const nextIdx = (mp.currentIdx + 1) % mp.queue.length;
  if (nextIdx === 0) mp.round = Number(mp.round || 1) + 1;
  mp.currentIdx = nextIdx;
  mp.turnEndsAt = Date.now() + Number(mp.turnDurationSec || 25) * 1000;
  const nextUid = mp.queue[mp.currentIdx];
  const nextSeat = Object.values(room.seats || {}).find(s => s && s.uid === nextUid);
  const spName = nextSeat ? nextSeat.name : 'Next Speaker';
  room.chat = [...(room.chat || []), {
    id: 'mp_' + Date.now().toString(36),
    type: 'sys',
    text: `🎙️ Mic passed to ${spName} (Round ${mp.round})`,
    ts: Date.now()
  }].slice(-45);
  if (typeof playSfx === 'function') playSfx('micPass');
  persistPartyRoom(room);
  if (!autoTriggered) toast(`🎙️ Mic passed to ${spName}`);
}

function isRoomHostOrManager(room) {
  if (!room) return false;
  return room.hostUid === uid || devMode || String(room.id || '').startsWith('pr_seed_');
}

/* ===== Persistent HTML5 Audio + WebAudio Room Music Engine (Hindi, Bangla, Lo-Fi & Stream URLs) ===== */
const RoomMusicEngine = (() => {
  let audioEl = null;
  let synthTimer = null;
  let synthCtx = null;
  let state = {
    trackId: '',
    customUrl: '',
    customTitle: '',
    youtubeId: '',
    playing: false,
    loop: true,
    volume: 0.45
  };

  function ensureAudioEl() {
    if (!audioEl) {
      audioEl = document.createElement('audio');
      audioEl.id = 'sgGlobalRoomAudio';
      audioEl.preload = 'none';
      audioEl.crossOrigin = 'anonymous';
      audioEl.loop = state.loop;
      audioEl.volume = state.volume;
      audioEl.addEventListener('ended', () => {
        if (!state.loop) nextTrack();
      });
      audioEl.addEventListener('error', () => {
        if (state.playing && state.customUrl) {
          toast('Audio stream unavailable — switched to room Lo-Fi');
          playPreset('lofi_midnight');
        }
      });
      document.body.appendChild(audioEl);
    }
    return audioEl;
  }

  function stopSynth() {
    if (synthTimer) { clearInterval(synthTimer); synthTimer = null; }
    if (synthCtx) { try { synthCtx.close(); } catch {} synthCtx = null; }
  }

  function startPresetSynth(track) {
    stopSynth();
    if (!partySpeakerOn) return;
    if (typeof SFX !== 'undefined' && SFX.isMuted && SFX.isMuted()) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      synthCtx = ctx;
      const notes = Array.isArray(track.notes) && track.notes.length ? track.notes : [220, 261.63, 329.63, 293.66];
      let step = 0;
      const beatMs = Math.max(420, Math.round((60000 / Number(track.bpm || 84)) * 1.1));
      const playTone = () => {
        if (!state.playing || !partySpeakerOn || !synthCtx) return;
        try {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = track.category === 'lofi' ? 'triangle' : 'sine';
          osc.frequency.value = notes[step % notes.length];
          const vol = Math.max(0.002, Math.min(0.04, state.volume * 0.04));
          gain.gain.setValueAtTime(0.0001, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(vol, ctx.currentTime + 0.08);
          gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + (beatMs / 1000) * 0.92);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + (beatMs / 1000));
          step++;
        } catch {}
      };
      playTone();
      synthTimer = setInterval(playTone, beatMs);
    } catch {}
  }

  function playPreset(trackId) {
    const tr = PARTY_MUSIC_TRACKS.find(t => t.id === trackId);
    if (!tr) return stop();
    if (audioEl) { try { audioEl.pause(); audioEl.removeAttribute('src'); } catch {} }
    state.trackId = tr.id;
    state.customUrl = '';
    state.customTitle = '';
    state.youtubeId = '';
    state.playing = true;
    startPresetSynth(tr);
    return tr;
  }

  function playDirectUrl(url, title) {
    stopSynth();
    const el = ensureAudioEl();
    el.src = url;
    el.loop = state.loop;
    el.volume = partySpeakerOn ? state.volume : 0;
    state.trackId = 'custom_url';
    state.customUrl = url;
    state.customTitle = title || 'Live Audio Stream';
    state.youtubeId = '';
    state.playing = true;
    el.play().catch(() => {});
  }

  function setYoutubeFallback(videoId, title) {
    stopSynth();
    if (audioEl) { try { audioEl.pause(); } catch {} }
    state.trackId = 'yt_music';
    state.customUrl = '';
    state.customTitle = title || ('YouTube Track · ' + videoId);
    state.youtubeId = videoId;
    state.playing = true;
  }

  function togglePlay() {
    if (!state.trackId) {
      playPreset('hi_kesariya');
      return state.playing;
    }
    state.playing = !state.playing;
    if (state.customUrl && audioEl) {
      if (state.playing) audioEl.play().catch(() => {});
      else audioEl.pause();
    } else if (state.trackId && !state.youtubeId) {
      if (state.playing) {
        const tr = PARTY_MUSIC_TRACKS.find(t => t.id === state.trackId);
        if (tr) startPresetSynth(tr);
      } else {
        stopSynth();
      }
    }
    return state.playing;
  }

  function nextTrack(categoryFilter) {
    const pool = categoryFilter && categoryFilter !== 'all'
      ? PARTY_MUSIC_TRACKS.filter(t => t.category === categoryFilter)
      : PARTY_MUSIC_TRACKS;
    if (!pool.length) return null;
    const idx = pool.findIndex(t => t.id === state.trackId);
    const next = pool[(idx + 1) % pool.length];
    playPreset(next.id);
    return next;
  }

  function setLoop(on) {
    state.loop = Boolean(on);
    if (audioEl) audioEl.loop = state.loop;
  }

  function setVolume(v) {
    state.volume = Math.max(0, Math.min(1, Number(v)));
    if (audioEl) audioEl.volume = partySpeakerOn ? state.volume : 0;
  }

  function syncSpeaker(speakerOn) {
    if (audioEl) audioEl.volume = speakerOn ? state.volume : 0;
    if (!speakerOn) stopSynth();
    else if (state.playing && state.trackId && !state.customUrl && !state.youtubeId) {
      const tr = PARTY_MUSIC_TRACKS.find(t => t.id === state.trackId);
      if (tr) startPresetSynth(tr);
    }
  }

  function stop() {
    state.playing = false;
    state.trackId = '';
    state.customUrl = '';
    state.customTitle = '';
    state.youtubeId = '';
    stopSynth();
    if (audioEl) { try { audioEl.pause(); } catch {} }
  }

  function getTitle() {
    if (!state.trackId) return 'No Songs';
    if (state.customTitle) return state.customTitle;
    const tr = PARTY_MUSIC_TRACKS.find(t => t.id === state.trackId);
    return tr ? tr.title : 'No Songs';
  }

  return { playPreset, playDirectUrl, setYoutubeFallback, togglePlay, nextTrack, setLoop, setVolume, syncSpeaker, stop, getTitle, getState: () => ({ ...state }) };
})();

function stopRoomAmbientMusic() {
  RoomMusicEngine.stop();
}

function syncRoomAmbientMusic(trackId) {
  if (!trackId || !partySpeakerOn) {
    RoomMusicEngine.syncSpeaker(partySpeakerOn);
    return;
  }
  if (PARTY_MUSIC_TRACKS.some(t => t.id === trackId)) {
    RoomMusicEngine.playPreset(trackId);
  }
}

/* ===== Home Hub Voice & Party Cards ===== */
function renderPartyHub() {
  const host = $('#homePartyRooms') || $('#partyRoomsHost');
  if (!host) return;
  const rooms = (partyRooms || []).slice(0, 6);
  host.innerHTML = `
    <div class="wp-sec-bar">
      <b>Voice &amp; Party</b>
      <button type="button" class="wp-pill-btn gold" id="partyHostBtn">+ Host Room</button>
    </div>
    <div class="party-grid">${rooms.map(rm => {
      const bgMeta = PARTY_BG_META[rm.background] || PARTY_BG_META.club;
      const modeMeta = PARTY_MODES_META[rm.mode] || PARTY_MODES_META.normal;
      const seatList = Object.values(normalizePartySeats(rm.seats)).filter(Boolean);
      const isWed = Boolean(rm.isWedding);
      const micOn = Boolean(rm.micPass && rm.micPass.active);
      const seatAvs = seatList.slice(0, 4).map(s => `<span class="prc-mini-av">${av(s, 24)}</span>`).join('');
      return `<button type="button" class="party-room-card glossy-card" data-testid="party-room-card" data-openparty="${esc(rm.id)}" style="background:${bgMeta.css}">
        <div class="prc-top">
          <span class="prc-cat">${esc(rm.tag || modeMeta.badge)} · ${esc(modeMeta.name)}</span>
          <div class="row" style="gap:5px">
            ${rm.passwordLocked ? '<span class="prc-lock-tag" title="Password Protected">🔒</span>' : ''}
            ${micOn ? '<span class="prc-mic-tag">🎙️ Turn</span>' : ''}
            ${isWed ? '<span class="prc-wed-tag">💍 Wedding</span>' : ''}
            <span class="prc-live">● ${seatList.length}/8</span>
          </div>
        </div>
        <div class="prc-title">${esc(rm.title || 'Voice Lounge')}</div>
        <div class="prc-foot">
          <div class="prc-av-stack">${seatAvs}<span class="prc-host-lbl">${esc(rm.hostName || 'Host')} · ID ${esc(rm.shortId || '')}</span></div>
          <span class="prc-join">Enter →</span>
        </div>
      </button>`;
    }).join('')}</div>`;

  if ($('#partyHostBtn', host)) {
    $('#partyHostBtn', host).onclick = () => {
      if (typeof playSfx === 'function') playSfx('tap');
      openCreatePartyRoomModal();
    };
  }

  host.onclick = e => {
    const btn = e.target.closest('[data-openparty]');
    if (btn && btn.dataset.openparty) {
      if (typeof playSfx === 'function') playSfx('tap');
      openPartyRoom(btn.dataset.openparty);
    }
  };
}

function openCreatePartyRoomModal() {
  const m = modal('Host Voice / Party Room', `
    <label for="prTitle">Room Title</label>
    <input id="prTitle" maxlength="36" placeholder="e.g. Tensura Chill Lounge">
    <div class="row" style="gap:8px;margin-top:8px">
      <div style="flex:1">
        <label for="prMode">Room Mode</label>
        <select id="prMode">
          <option value="normal">Normal Voice Room</option>
          <option value="acquaint">Acquaint Matchmaking</option>
          <option value="auction">Auction &amp; VIP Stage</option>
          <option value="video">Video Watch Together</option>
          <option value="games">In-Room Party Games</option>
        </select>
      </div>
      <div style="flex:1">
        <label for="prTag">Room Tag</label>
        <select id="prTag">
          ${PARTY_TAGS.map(t => `<option value="${t}">${t}</option>`).join('')}
        </select>
      </div>
    </div>
    <label for="prBg" style="margin-top:8px">Room Background</label>
    <select id="prBg">
      ${Object.values(PARTY_BG_META).map(b => `<option value="${b.id}">${b.name}</option>`).join('')}
    </select>
    <label for="prRules" style="margin-top:8px">Room Notice / Rules</label>
    <input id="prRules" maxlength="200" value="Room ko follow and join kro · No abusive language or misbehavior!">
    <label class="row" style="gap:8px;margin-top:10px;cursor:pointer">
      <input id="prMicTurn" type="checkbox" style="width:auto">
      <span>Enable Turn-Based One-by-One Mic Pass (25s)</span>
    </label>
    <button type="button" class="btn ok full" id="prCreateGo" style="margin-top:12px">Launch Full-Screen Room</button>
  `);
  $('#prCreateGo', m).onclick = () => {
    const title = ($('#prTitle', m).value || '').trim() || `${me.name || 'Player'}'s Room`;
    const mode = $('#prMode', m).value || 'normal';
    const tag = $('#prTag', m).value || 'Friends';
    const background = $('#prBg', m).value || 'club';
    const announcement = ($('#prRules', m).value || '').trim();
    const turnOn = Boolean($('#prMicTurn', m)?.checked);
    const now = Date.now();
    const id = 'pr_' + now.toString(36) + Math.random().toString(36).slice(2, 5);
    const room = normalizePartyRoom({
      id,
      shortId: makeRoomShortId(id),
      title,
      tag,
      mode,
      background,
      cover: 'cover_tensura',
      announcement,
      hostUid: uid,
      hostName: me.name || 'Player',
      micPass: { active: turnOn, queue: [uid], currentIdx: 0, round: 1, turnDurationSec: 25, turnEndsAt: turnOn ? now + 25000 : 0 },
      seats: {
        '0': { uid, name: me.name || 'Player', avatar: me.avatar || 'av_b1', frame: me.frame || 'fx_gold', muted: false, vipTier: getActiveVipTier(me) || 'gold', speaking: true, charm: Number(me.charm || 0), joinedAt: now }
      },
      youtubeId: '',
      chat: [{ id: 'sys_' + now, type: 'sys', text: `${me.name || 'Player'} opened "${title}" (${PARTY_MODES_META[mode].name} Mode)`, ts: now }],
      createdAt: now,
      updatedAt: now
    });
    persistPartyRoom(room);
    if (typeof playSfx === 'function') playSfx('turnStart');
    m.close();
    openPartyRoom(id);
  };
}

function createWeddingPartyRoom(partnerUid, partnerName, daysOrRingGift, ringNameOpt) {
  const now = Date.now();
  const days = typeof daysOrRingGift === 'number' ? daysOrRingGift : Number(daysOrRingGift?.weddingDays || 3);
  const ringLabel = ringNameOpt || daysOrRingGift?.name || 'Royal Ring';
  const id = 'wed_' + now.toString(36);
  const room = normalizePartyRoom({
    id,
    shortId: makeRoomShortId(id),
    title: `${me.name || 'Partner'} & ${partnerName || 'Partner'}`,
    tag: 'Wedding',
    mode: 'acquaint',
    background: 'royal',
    cover: 'cover_crown',
    theme: 'wedding',
    isWedding: true,
    partnerSeatEnabled: true,
    hostUid: uid,
    hostName: me.name || 'Host',
    announcement: `💍 Grand ${days}-Day Wedding Hall celebrating ${ringLabel}! Send wishes & 3D gifts!`,
    expiresAt: now + days * 86400000,
    micPass: { active: false, queue: [uid], currentIdx: 0, round: 1, turnDurationSec: 25, turnEndsAt: 0 },
    seats: {
      '0': { uid, name: me.name || 'Partner', avatar: me.avatar || 'av_b1', frame: me.frame || 'fx_gold', muted: false, vipTier: getActiveVipTier(me) || 'royal', speaking: true, charm: Number(me.charm || 0), joinedAt: now }
    },
    youtubeId: '',
    chat: [{ id: 'w_' + now, type: 'sys', text: `💍 Grand Wedding Hall opened for ${days} days!`, ts: now }],
    createdAt: now,
    updatedAt: now
  });
  persistPartyRoom(room);
  if (typeof playSfx === 'function') playSfx('weddingBells');
  openPartyRoom(id);
}

function appendPartyRoomGift(roomId, evObj) {
  const room = partyRooms.find(r => r.id === roomId);
  if (!room || !evObj) return;
  room.chat = [...(room.chat || []), {
    id: 'pg_' + evObj.id,
    type: 'gift',
    uid: evObj.fromUid,
    name: evObj.fromName || 'Player',
    toName: evObj.toName || 'Player',
    giftId: evObj.giftId,
    giftName: evObj.giftName || 'Gift',
    qty: clampSafeInt(evObj.qty || 1, 1, 100),
    charm: evObj.charm || 0,
    ts: Date.now()
  }].slice(-45);
  const curTopCharm = Number(room.topGifter?.charm || 0);
  if (Number(evObj.charm || 0) >= 200 || !room.topGifter) {
    room.topGifter = {
      name: evObj.fromName || 'Player',
      charm: Math.max(curTopCharm + Number(evObj.charm || 0), Number(evObj.charm || 0)),
      avatar: evObj.fromAvatar || 'av_g1'
    };
  }
  persistPartyRoom(room);
}

function spawnPartyFloatingReaction(emoji, seatIdx) {
  const root = document.getElementById('partyFsRoot');
  if (!root || root.hidden) return;
  const stage = root.querySelector('.pfs-stage');
  if (!stage) return;

  const floater = document.createElement('div');
  floater.className = 'pfs-react-float';
  floater.textContent = emoji;
  floater.style.left = `${18 + Math.random() * 64}%`;
  stage.appendChild(floater);
  setTimeout(() => floater.remove(), 1700);

  if (seatIdx != null) {
    const seatEl = root.querySelector(`[data-seat-idx="${seatIdx}"]`);
    if (seatEl) {
      const pop = document.createElement('span');
      pop.className = 'pfs-seat-react-pop';
      pop.textContent = emoji;
      seatEl.appendChild(pop);
      setTimeout(() => pop.remove(), 1450);
    }
  }
}

/* ===== Minimize / Restore Floating Mini-Room Pill ===== */
function renderMinimizedPartyPill() {
  let pill = document.getElementById('partyMiniPill');
  const rm = minimizedPartyRoomId && !activePartyRoomId
    ? partyRooms.find(r => r.id === minimizedPartyRoomId)
    : null;
  if (!rm) {
    if (pill) pill.remove();
    return;
  }
  if (!pill) {
    pill = document.createElement('div');
    pill.id = 'partyMiniPill';
    pill.className = 'party-mini-pill';
    document.body.appendChild(pill);
  }
  const cover = PARTY_COVERS[rm.cover] || PARTY_COVERS.cover_tensura;
  pill.innerHTML = `
    <button type="button" class="pmp-open" id="pmpRestore" aria-label="Return to ${esc(rm.title)}">
      <span class="pmp-ico" style="background:${cover.bg}">${cover.glyph}</span>
      <span class="pmp-meta">
        <b>${esc(rm.title)}</b>
        <small>Live · ${Object.keys(normalizePartySeats(rm.seats)).length} seated</small>
      </span>
      <span class="pmp-eq" aria-hidden="true"><i></i><i></i><i></i></span>
    </button>
    <button type="button" class="pmp-close" id="pmpLeave" aria-label="Leave minimized room">✕</button>
  `;
  $('#pmpRestore', pill).onclick = () => {
    if (typeof playSfx === 'function') playSfx('tap');
    openPartyRoom(rm.id);
  };
  $('#pmpLeave', pill).onclick = () => {
    minimizedPartyRoomId = null;
    stopRoomAmbientMusic();
    renderMinimizedPartyPill();
  };
}

function minimizePartyRoom() {
  if (!activePartyRoomId) return;
  minimizedPartyRoomId = activePartyRoomId;
  if (partyMicTimerId) {
    clearInterval(partyMicTimerId);
    partyMicTimerId = null;
  }
  activePartyRoomId = null;
  const root = document.getElementById('partyFsRoot');
  if (root) {
    root.classList.remove('open');
    root.hidden = true;
    root.innerHTML = '';
  }
  document.body.classList.remove('party-fs-lock');
  renderMinimizedPartyPill();
  toast('Room minimized — tap floating bar to return');
}

function closePartyRoom() {
  if (partyMicTimerId) {
    clearInterval(partyMicTimerId);
    partyMicTimerId = null;
  }
  stopRoomAmbientMusic();
  activePartyRoomId = null;
  minimizedPartyRoomId = null;
  const root = document.getElementById('partyFsRoot');
  if (root) {
    root.classList.remove('open');
    root.hidden = true;
    root.innerHTML = '';
  }
  document.body.classList.remove('party-fs-lock');
  renderMinimizedPartyPill();
}

function openPartyRoom(roomId) {
  const room = partyRooms.find(r => r.id === roomId);
  if (!room) return toast('Party Room closed');

  if (!isRoomHostOrManager(room) && Array.isArray(room.blocklist) && room.blocklist.includes(uid)) {
    return toast('You are restricted from entering this room');
  }

  if (room.passwordLocked && room.passcode && !isRoomHostOrManager(room) && !partyUnlockedRooms.has(room.id)) {
    const pm = modal('Room Passcode Required', `
      <p style="font-size:13px;color:var(--mu);margin:0 0 10px"><b>${esc(room.title)}</b> is protected by a passcode.</p>
      <label for="prPassIn">Enter Passcode</label>
      <input id="prPassIn" type="password" maxlength="8" placeholder="4–8 digit passcode" autocomplete="off">
      <button type="button" class="btn gold full" id="prPassGo" style="margin-top:12px">Unlock &amp; Enter</button>
    `);
    $('#prPassGo', pm).onclick = () => {
      const code = ($('#prPassIn', pm).value || '').trim();
      if (code !== String(room.passcode).trim()) return toast('Incorrect room passcode');
      partyUnlockedRooms.add(room.id);
      pm.close();
      openPartyRoom(roomId);
    };
    return;
  }

  activePartyRoomId = roomId;
  minimizedPartyRoomId = null;
  renderMinimizedPartyPill();
  if (typeof bumpStat === 'function') bumpStat('party_join');
  if (typeof showVipEntranceBanner === 'function') showVipEntranceBanner(me, room.title || 'Voice Room');

  const root = document.getElementById('partyFsRoot');
  if (!root) return;
  bindPartyRootDelegation(root);
  root.hidden = false;
  document.body.classList.add('party-fs-lock');
  requestAnimationFrame(() => root.classList.add('open'));

  renderFullScreenPartyRoom();

  if (partyMicTimerId) clearInterval(partyMicTimerId);
  partyMicTimerId = setInterval(() => {
    if (!activePartyRoomId) return;
    const live = partyRooms.find(r => r.id === activePartyRoomId);
    if (!live || !live.micPass || !live.micPass.active) return;
    const remMs = Number(live.micPass.turnEndsAt || 0) - Date.now();
    const remSec = Math.max(0, Math.ceil(remMs / 1000));
    const tEl = root.querySelector('#pfsMicSec');
    const barEl = root.querySelector('#pfsMicBar');
    if (tEl) tEl.textContent = remSec + 's';
    if (barEl) {
      const pct = Math.max(0, Math.min(100, (remMs / (Number(live.micPass.turnDurationSec || 25) * 1000)) * 100));
      barEl.style.width = pct + '%';
    }
    if (remMs <= 0) {
      advancePartyMicTurn(live, true);
    }
  }, 500);
}

/* ===== Ornate Gold / Gemstone Metallic Frame SVG & Stage Backdrop SVG ===== */
function renderOrnateSeatFrameSvg(tier) {
  const isOwner = tier === 'owner' || tier === 'royal';
  const isGold = tier === 'gold';
  const c1 = isOwner ? '#fffbeb' : (isGold ? '#fef08a' : '#e0f2fe');
  const c2 = isOwner ? '#f59e0b' : (isGold ? '#d97706' : '#38bdf8');
  const c3 = isOwner ? '#b45309' : (isGold ? '#92400e' : '#1d4ed8');
  const gem = isOwner ? '#f43f5e' : (isGold ? '#38bdf8' : '#a855f7');
  const uidS = Math.random().toString(36).slice(2, 6);
  return `<svg class="pfs-ornate-frame" viewBox="0 0 88 88" fill="none" aria-hidden="true">
    <defs>
      <linearGradient id="of_${uidS}" x1="8" y1="6" x2="80" y2="82" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="${c1}"/>
        <stop offset="48%" stop-color="${c2}"/>
        <stop offset="100%" stop-color="${c3}"/>
      </linearGradient>
    </defs>
    <circle cx="44" cy="46" r="35" stroke="url(#of_${uidS})" stroke-width="3.2"/>
    <circle cx="44" cy="46" r="31.5" stroke="#ffffff" stroke-opacity=".42" stroke-width="1" stroke-dasharray="10 6"/>
    ${isOwner ? `
      <path d="M29 14l5-8 10 5 10-5 5 8-5 4H34l-5-4z" fill="url(#of_${uidS})" stroke="#fff" stroke-width="1" stroke-linejoin="round"/>
      <polygon points="44,8 48,13 44,18 40,13" fill="${gem}" stroke="#fff" stroke-width=".9"/>
    ` : ''}
    <polygon points="44,77 49,82 44,87 39,82" fill="${gem}" stroke="#fff" stroke-width=".9"/>
    <circle cx="11" cy="46" r="2.6" fill="${c1}" stroke="${c3}" stroke-width=".9"/>
    <circle cx="77" cy="46" r="2.6" fill="${c1}" stroke="${c3}" stroke-width=".9"/>
  </svg>`;
}

function renderPartyBackdropDecorSvg(bgId) {
  if (bgId === 'grid') {
    return `<svg class="pfs-bg-art" viewBox="0 0 420 260" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="pgridFade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#38bdf8" stop-opacity="0"/>
          <stop offset="55%" stop-color="#38bdf8" stop-opacity=".22"/>
          <stop offset="100%" stop-color="#818cf8" stop-opacity=".06"/>
        </linearGradient>
      </defs>
      <path d="M0 140h420M0 165h420M0 195h420M0 232h420" stroke="url(#pgridFade)" stroke-width="1"/>
      <path d="M210 110L30 260M210 110L110 260M210 110L170 260M210 110L250 260M210 110L310 260M210 110L390 260" stroke="url(#pgridFade)" stroke-width="1"/>
      <ellipse cx="210" cy="112" rx="140" ry="18" fill="#22d3ee" fill-opacity=".1"/>
    </svg>`;
  }
  return `<svg class="pfs-bg-art" viewBox="0 0 420 260" preserveAspectRatio="none" aria-hidden="true">
    <defs>
      <linearGradient id="pbeamL" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#38bdf8" stop-opacity=".22"/>
        <stop offset="100%" stop-color="#38bdf8" stop-opacity="0"/>
      </linearGradient>
      <linearGradient id="pbeamR" x1="1" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#e879f9" stop-opacity=".22"/>
        <stop offset="100%" stop-color="#e879f9" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <polygon points="36,0 130,0 240,250 120,250" fill="url(#pbeamL)"/>
    <polygon points="384,0 290,0 180,250 300,250" fill="url(#pbeamR)"/>
    <g opacity=".34">
      <ellipse cx="44" cy="64" rx="14" ry="18" fill="#38bdf8"/>
      <path d="M44 82c2 10-4 18 1 28" stroke="#bae6fd" stroke-width="1" fill="none"/>
      <ellipse cx="66" cy="52" rx="11" ry="14" fill="#a855f7"/>
      <ellipse cx="372" cy="60" rx="15" ry="19" fill="#ec4899"/>
      <path d="M372 79c-3 10 4 19-1 28" stroke="#fbcfe8" stroke-width="1" fill="none"/>
      <ellipse cx="348" cy="48" rx="10" ry="13" fill="#fbbf24"/>
    </g>
    <path d="M0 218h420M0 240h420" stroke="rgba(148,163,184,.12)" stroke-width="1"/>
  </svg>`;
}

function renderWaveConnectorSvg(active) {
  return `<svg class="pfs-pair-wave ${active ? 'live' : ''}" viewBox="0 0 64 20" fill="none" aria-hidden="true">
    <path d="M2 10h12l4-6 5 12 5-10 4 8 4-4h26" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
}

/* ===== Reusable Single Seat Tile Renderer ===== */
function renderPartySeatTile(rm, idx, opts) {
  const o = opts || {};
  const seats = rm.seats || {};
  const locked = Array.isArray(rm.lockedSeats) && rm.lockedSeats.includes(idx);
  const s = seats[String(idx)];
  const mp = rm.micPass || { active: false, queue: [], currentIdx: 0 };
  const activeSpeakerUid = mp.active && mp.queue.length ? mp.queue[mp.currentIdx % mp.queue.length] : null;
  const labelPrefix = o.roleLabel || (idx === 0 ? 'Owner' : `Seat ${idx}`);
  const sizeClass = o.featured ? 'featured' : (o.compact ? 'compact' : '');
  const avSize = o.featured ? 58 : (o.compact ? 42 : 48);

  if (!s) {
    if (locked) {
      return `<button type="button" class="pfs-seat locked ${sizeClass}" data-seat-idx="${idx}" data-seat-action="locked" aria-label="Locked ${esc(labelPrefix)}">
        <div class="pfs-seat-ring locked-ring">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2.5"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>
        </div>
        <div class="pfs-seat-name">Locked</div>
        <small class="pfs-seat-role">${esc(labelPrefix)}</small>
      </button>`;
    }
    return `<button type="button" class="pfs-seat empty ${sizeClass}" data-seat-idx="${idx}" data-sit="${idx}" aria-label="Take ${esc(labelPrefix)}">
      <div class="pfs-seat-ring open-ring"><span>+</span></div>
      <div class="pfs-seat-name">${esc(o.emptyLabel || labelPrefix)}</div>
      ${o.roleBadge ? `<small class="pfs-seat-role">${esc(o.roleBadge)}</small>` : ''}
    </button>`;
  }

  const isMe = s.uid === uid;
  const isOwner = idx === 0 || s.uid === rm.hostUid;
  const qPos = mp.active ? mp.queue.indexOf(s.uid) : -1;
  const isSpeaking = mp.active ? (activeSpeakerUid === s.uid && !s.muted) : (!s.muted && Boolean(s.speaking || idx === 0));
  const frameTier = isOwner ? 'owner' : (s.vipTier === 'royal' ? 'owner' : (s.vipTier === 'gold' ? 'gold' : 'silver'));
  const showOrnate = isOwner || s.vipTier === 'royal' || s.vipTier === 'gold' || o.featured;

  return `<div class="pfs-seat-wrap ${sizeClass}">
    <button type="button" class="pfs-seat occupied ${sizeClass} ${isSpeaking ? 'is-speaking' : ''} ${isMe ? 'is-me' : ''} ${isOwner ? 'is-owner' : ''}" data-seat-idx="${idx}" data-seat-uid="${esc(s.uid)}" aria-label="${esc(s.name)} on ${esc(labelPrefix)}">
      <div class="pfs-seat-ring">
        ${isSpeaking ? '<span class="pfs-wave w1"></span><span class="pfs-wave w2"></span>' : ''}
        ${showOrnate ? renderOrnateSeatFrameSvg(frameTier) : ''}
        ${av(s, avSize)}
        <span class="pfs-mic-dot ${s.muted ? 'muted' : (isSpeaking ? 'live' : '')}" aria-hidden="true">${s.muted ? '🔇' : '🎙️'}</span>
        ${mp.active && qPos >= 0 ? `<span class="pfs-turn-num ${activeSpeakerUid === s.uid ? 'on' : ''}">${activeSpeakerUid === s.uid ? 'ON AIR' : '#' + (qPos + 1)}</span>` : ''}
        ${o.podiumBadge ? `<span class="pfs-podium-tag">${esc(o.podiumBadge)}</span>` : ''}
      </div>
      <div class="pfs-seat-name">${esc(s.name || 'Player')}</div>
      <div class="pfs-seat-meta">
        ${isOwner ? '<span class="pfs-owner-tag">OWNER</span>' : (o.roleBadge ? `<span class="pfs-role-chip">${esc(o.roleBadge)}</span>` : '')}
        ${s.charm ? `<span class="pfs-charm-mini">💎 ${fmtNum(s.charm)}</span>` : ''}
      </div>
    </button>
    ${isMe ? `<button type="button" class="pfs-quick-leave" data-pfs-act="leave-seat" aria-label="Leave my seat">Leave</button>` : ''}
  </div>`;
}

/* ===== Mode-Specific Stage Builders (Normal, Acquaint, Auction, Video, Games) ===== */
function renderPartyStageByMode(rm) {
  const mode = rm.mode || 'normal';
  const seats = rm.seats || {};

  if (mode === 'acquaint') {
    const pairLive = Boolean(seats['0'] && seats['1']);
    return `
      <div class="pfs-mode-banner acquaint">
        <b>💘 Acquaint Matchmaking</b>
        <span>Spotlight Pair · Tap prompts to break the ice</span>
      </div>
      <div class="pfs-acquaint-hero">
        ${renderPartySeatTile(rm, 0, { featured: true, roleLabel: 'Host Spotlight', roleBadge: 'Host' })}
        <div class="pfs-acquaint-mid">
          <div class="pfs-heart-bridge ${pairLive ? 'active' : ''}">💖</div>
          ${renderWaveConnectorSvg(pairLive)}
          <div class="pfs-acquaint-prompts">
            <button type="button" class="pfs-mini-act" data-acquaint-prompt="👋 Waved hello to the spotlight!">👋 Wave</button>
            <button type="button" class="pfs-mini-act" data-acquaint-prompt="💖 Sent a Match Heart!">❤️ Match</button>
            <button type="button" class="pfs-mini-act" data-pfs-act="open-bond-gift">💍 Bond</button>
          </div>
        </div>
        ${renderPartySeatTile(rm, 1, { featured: true, roleLabel: 'Match Seat', emptyLabel: 'Join Match', roleBadge: 'Match' })}
      </div>
      <div class="pfs-guest-grid-4">
        ${[2, 3, 4, 5, 6, 7].map(i => renderPartySeatTile(rm, i, { compact: true, roleLabel: `Seat ${i}` })).join('')}
      </div>
    `;
  }

  if (mode === 'auction') {
    const auc = rm.auction || { subjectName: rm.hostName, currentBid: 500, topBidderName: 'Kai Volt', stageBadge: 'Rising Spotlight', bidsCount: 1 };
    const topG = rm.topGifter || { name: auc.topBidderName || 'Aria Nova', charm: auc.currentBid || 500 };
    return `
      <div class="pfs-auction-stage">
        <div class="pfs-auc-top">
          <div class="pfs-auc-badge">🔨 LIVE AUCTION · ${esc(auc.stageBadge)}</div>
          <div class="pfs-top-gifter-chip">👑 TOP: <b>${esc(topG.name)}</b></div>
        </div>
        <div class="pfs-auc-spotlight">
          ${renderPartySeatTile(rm, 0, { featured: true, roleLabel: 'Auction Host', roleBadge: 'Spotlight' })}
          <div class="pfs-auc-panel">
            <small>HIGHEST BID · ${auc.bidsCount || 1} BIDS</small>
            <div class="pfs-auc-val">${fmtNum(auc.currentBid)} 🪙</div>
            <div class="pfs-auc-leader">Leader: <b>${esc(auc.topBidderName || 'Open')}</b></div>
            <div class="pfs-auc-btns">
              <button type="button" class="btn gold sm" data-auc-bid="100">+100 🪙</button>
              <button type="button" class="btn sm ok" data-auc-bid="500">+500 🪙</button>
              <button type="button" class="btn sm ghost" data-pfs-act="open-gift">🎁 Gift</button>
            </div>
          </div>
        </div>
        <div class="pfs-vip-podium">
          ${renderPartySeatTile(rm, 2, { compact: true, roleLabel: 'VIP #2', emptyLabel: 'VIP #2', podiumBadge: '🥈 #2' })}
          ${renderPartySeatTile(rm, 1, { compact: true, roleLabel: 'VIP #1', emptyLabel: 'VIP #1', podiumBadge: '🥇 #1' })}
          ${renderPartySeatTile(rm, 3, { compact: true, roleLabel: 'VIP #3', emptyLabel: 'VIP #3', podiumBadge: '🥉 #3' })}
        </div>
        <div class="pfs-guest-grid-4">
          ${[4, 5, 6, 7].map(i => renderPartySeatTile(rm, i, { compact: true, roleLabel: `Seat ${i}` })).join('')}
        </div>
      </div>
    `;
  }

  if (mode === 'video') {
    const hasYt = Boolean(rm.youtubeId);
    return `
      <div class="pfs-video-card">
        ${hasYt ? `
          <div class="pfs-yt-frame">
            <iframe src="https://www.youtube.com/embed/${esc(rm.youtubeId)}?autoplay=0&rel=0" allow="autoplay; encrypted-media" allowfullscreen title="Room Watch Together Video"></iframe>
          </div>
          <div class="pfs-vid-bar">
            <span>🎬 Watching together · ${esc(rm.youtubeId)}</span>
            <div class="row" style="gap:5px">
              <button type="button" class="btn sm ghost" data-pfs-act="open-add-video">Change</button>
              <button type="button" class="btn sm red" data-pfs-act="clear-video">Stop</button>
            </div>
          </div>
        ` : `
          <div class="pfs-vid-empty">
            <div class="pfs-vid-ico" aria-hidden="true">🎬</div>
            <b>Watch Together Stage</b>
            <small>Add a YouTube link to watch &amp; chat together</small>
            <div class="row" style="gap:6px;margin-top:8px;flex-wrap:wrap;justify-content:center">
              <button type="button" class="btn gold sm" data-pfs-act="open-add-video">+ Add video</button>
              <button type="button" class="btn ghost sm" data-yt-preset="jfKfPfyJRdk">Lo-Fi</button>
              <button type="button" class="btn ghost sm" data-yt-preset="4xDzrJKXOOY">Synthwave</button>
            </div>
          </div>
        `}
      </div>
      <div class="pfs-seats-6col" data-testid="video-seats-6col">
        ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(i => renderPartySeatTile(rm, i, { compact: true, roleLabel: i === 0 ? 'Owner' : `S${i}`, emptyLabel: `${i}` })).join('')}
      </div>
    `;
  }

  if (mode === 'games') {
    const isCoin = rm.gameCoinMode === 'coin';
    return `
      <div class="pfs-games-board">
        <div class="pfs-gb-head">
          <div>
            <b>🎮 In-Room Party Games</b>
            <small>${isCoin ? '1v1 Coin Stake (10% fee)' : 'Free Friendly Play'}</small>
          </div>
          <div class="pfs-seg-mini" role="group" aria-label="Game stake mode">
            <button type="button" class="${!isCoin ? 'on' : ''}" data-game-stake="free">Free</button>
            <button type="button" class="${isCoin ? 'on' : ''}" data-game-stake="coin">Coin 🪙</button>
          </div>
        </div>
        <div class="pfs-gb-quick">
          <button type="button" class="pfs-gb-chip" data-room-mini="dice">🎲 Lucky Dice</button>
          <button type="button" class="pfs-gb-chip" data-room-mini="td">🔥 Truth/Dare</button>
          <button type="button" class="pfs-gb-chip" data-launch-arena="jackaroo">♦ Jackaroo</button>
          <button type="button" class="pfs-gb-chip" data-launch-arena="uno">🃏 UNO</button>
          <button type="button" class="pfs-gb-chip" data-launch-arena="ludo">🎲 Ludo</button>
          <button type="button" class="pfs-gb-chip" data-launch-arena="pool">🎱 8-Ball</button>
          <button type="button" class="pfs-gb-chip" data-launch-arena="spy">🕵️ Spy</button>
          <button type="button" class="pfs-gb-chip" data-launch-arena="trivia">⚡ Trivia</button>
        </div>
      </div>
      <div class="pfs-seats-4col">
        ${[0, 1, 2, 3, 4, 5, 6, 7].map(i => renderPartySeatTile(rm, i, { compact: true, roleLabel: i === 0 ? 'Owner' : `Seat ${i}` })).join('')}
      </div>
    `;
  }

  /* Default: NORMAL / AUDIO MODE — Spotlight Owner (optional Partner) at Top Center + Clean 4-Column Seat Grid Below */
  const topRowHtml = rm.partnerSeatEnabled
    ? `<div class="pfs-owner-duo">
        ${renderPartySeatTile(rm, 0, { featured: true, roleLabel: 'Owner', roleBadge: 'Owner' })}
        <div class="pfs-duo-link">
          ${renderWaveConnectorSvg(Boolean(seats['0'] && seats['1']))}
          <span>PARTNER</span>
        </div>
        ${renderPartySeatTile(rm, 1, { featured: true, roleLabel: 'Partner', emptyLabel: 'Partner', roleBadge: 'Partner' })}
      </div>`
    : `<div class="pfs-owner-solo">
        ${renderPartySeatTile(rm, 0, { featured: true, roleLabel: 'Owner', roleBadge: 'Owner' })}
      </div>`;

  const gridIndices = rm.partnerSeatEnabled
    ? [2, 3, 4, 5, 6, 7, 8, 9]
    : [1, 2, 3, 4, 5, 6, 7, 8];

  const gridHtml = `<div class="pfs-seats-4col" data-testid="normal-seats-4col">
    ${gridIndices.map(i => renderPartySeatTile(rm, i, { compact: true, roleLabel: `Seat ${i}`, emptyLabel: `Seat ${i}` })).join('')}
  </div>`;

  return `${topRowHtml}${gridHtml}`;
}

/* ===== Main Full-Screen Room Renderer (Zero-Duplicate-Listener Architecture) ===== */
function renderFullScreenPartyRoom() {
  const root = document.getElementById('partyFsRoot');
  if (!root || !activePartyRoomId) return;
  const rm = partyRooms.find(r => r.id === activePartyRoomId);
  if (!rm) { closePartyRoom(); return; }

  syncMicPassQueue(rm);
  const bgMeta = PARTY_BG_META[rm.background] || PARTY_BG_META.club;
  const coverMeta = PARTY_COVERS[rm.cover] || PARTY_COVERS.cover_tensura;
  const modeMeta = PARTY_MODES_META[rm.mode] || PARTY_MODES_META.normal;
  const seats = rm.seats || {};
  const mySeatKey = findUserSeatKeyInRoom(rm, uid);
  const mySeat = mySeatKey != null ? seats[mySeatKey] : null;
  const isHost = isRoomHostOrManager(rm);
  const mp = rm.micPass || { active: false, queue: [], currentIdx: 0, round: 1, turnDurationSec: 25, turnEndsAt: 0 };
  const activeSpeakerUid = mp.active && mp.queue.length ? mp.queue[mp.currentIdx % mp.queue.length] : null;
  const activeSpeakerSeat = activeSpeakerUid ? Object.values(seats).find(s => s && s.uid === activeSpeakerUid) : null;
  const canPassMic = mp.active && (activeSpeakerUid === uid || isHost || String(activeSpeakerUid || '').startsWith('bot_'));
  const remSec = mp.active ? Math.max(0, Math.ceil((Number(mp.turnEndsAt || 0) - Date.now()) / 1000)) : Number(mp.turnDurationSec || 25);
  const pct = mp.active ? Math.max(0, Math.min(100, ((Number(mp.turnEndsAt || 0) - Date.now()) / (Number(mp.turnDurationSec || 25) * 1000)) * 100)) : 100;
  const seatedCount = Object.values(seats).filter(Boolean).length;
  const musicSt = RoomMusicEngine.getState();
  const musicTitle = rm.musicCustomTitle || (rm.musicTrack ? (PARTY_MUSIC_TRACKS.find(t => t.id === rm.musicTrack)?.title || RoomMusicEngine.getTitle()) : RoomMusicEngine.getTitle());
  const musicPlaying = Boolean(musicSt.playing && (musicSt.trackId || rm.musicTrack));
  const onlineCount = Math.max(seatedCount + 4, seatedCount);
  const supporters = Array.isArray(rm.supporters) && rm.supporters.length ? rm.supporters.slice(0, 3) : [{ name: rm.topGifter?.name || 'Aria Nova', avatar: rm.topGifter?.avatar || 'av_g1', coins: rm.topGifter?.charm || 21400 }];
  const roomCoinsTotal = supporters.reduce((sum, sp) => sum + Number(sp.coins || 0), 0);

  const prevChatVal = ($('#pfsChatIn', root)?.value) || '';
  const chatDisabled = Boolean(rm.banTextChat && !isHost);

  const chatHtml = (rm.chat || []).slice(-22).map(c => {
    if (c.type === 'gift') {
      const g = typeof GIFT_BY_ID !== 'undefined' ? GIFT_BY_ID[c.giftId] : null;
      return `<div class="pfs-msg pfs-chat-pill gift">${g && typeof giftSvg === 'function' ? giftSvg(g, 20) : '🎁'} <b>${esc(c.name)}</b> → <b>${esc(c.toName)}</b> · <span>${esc(c.giftName)} ×${clampSafeInt(c.qty || 1, 1, 100)}</span></div>`;
    }
    if (c.type === 'photo') {
      return `<div class="pfs-msg photo" style="background:${esc(c.bg || 'linear-gradient(135deg,#0284c7,#6366f1)')}">
        <small>📷 ${esc(c.name)}</small>
        <b>${esc(c.text)}</b>
      </div>`;
    }
    if (c.type === 'red_packet') {
      const claimed = Array.isArray(c.claimedBy) && c.claimedBy.includes(uid);
      return `<div class="pfs-msg pfs-chat-pill rp">
        <span>🧧 <b>${esc(c.name)}</b> · <b>${fmtNum(c.coins || 100)} 🪙</b> Lifafa</span>
        <button type="button" class="btn gold sm" data-claim-rp="${esc(c.id)}" ${claimed ? 'disabled' : ''}>${claimed ? 'Claimed' : 'Grab'}</button>
      </div>`;
    }
    if (c.type === 'sys') return `<div class="pfs-msg pfs-chat-pill sys">${esc(c.text)}</div>`;
    const isOwnerMsg = c.uid && c.uid === rm.hostUid;
    const seatMatch = Object.values(seats).find(s => s && s.uid === c.uid);
    const badgeHtml = isOwnerMsg
      ? '<span class="pfs-chat-badge owner">👑 HOST</span>'
      : (seatMatch && seatMatch.charm ? `<span class="pfs-chat-badge charm">💎 ${fmtNum(seatMatch.charm)}</span>` : `<span class="pfs-chat-badge lv">Lv.${c.uid === uid ? calcLevel(me.exp) : 8}</span>`);
    return `<div class="pfs-msg pfs-chat-pill user">${badgeHtml}<b class="pfs-sender" data-chat-uid="${esc(c.uid || '')}">${esc(c.name)}:</b> <span>${esc(c.text)}</span></div>`;
  }).join('');

  const floatersHtml = (!partyDismissedFloaters.envelope || !partyDismissedFloaters.tower) ? `
    <div class="pfs-corner-floaters" aria-label="Room quick promos">
      ${!partyDismissedFloaters.envelope ? `
        <div class="pfs-float-chip env">
          <button type="button" class="pfs-fc-main" data-pfs-act="drop-rp" aria-label="Room Coin Envelope">
            <span class="pfs-fc-ico">🧧</span>
            <small>Lifafa</small>
          </button>
          <button type="button" class="pfs-fc-x" data-dismiss-floater="envelope" aria-label="Dismiss Coin Envelope badge">×</button>
        </div>
      ` : ''}
      ${!partyDismissedFloaters.tower ? `
        <div class="pfs-float-chip tower">
          <button type="button" class="pfs-fc-main" data-pfs-act="open-gift" aria-label="3D Gift Tower">
            <span class="pfs-fc-ico">🏆</span>
            <small>Tower</small>
          </button>
          <button type="button" class="pfs-fc-x" data-dismiss-floater="tower" aria-label="Dismiss Gift Tower badge">×</button>
        </div>
      ` : ''}
    </div>
  ` : '';

  root.style.background = bgMeta.css;
  root.dataset.roomMode = rm.mode;
  root.dataset.roomBg = rm.background;
  root.innerHTML = `
    <div class="pfs-shell pfs-v14 ${floatersHtml ? 'has-floaters' : ''}" data-testid="party-fullscreen">
      ${renderPartyBackdropDecorSvg(rm.background)}

      <!-- 1. Top Header Bar -->
      <header class="pfs-top-v14">
        <div class="pfs-hdr-left">
          <button type="button" class="pfs-hdr-btn" data-pfs-act="close" title="Leave Room" aria-label="Back to Arena">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <button type="button" class="pfs-room-avatar" style="background:${coverMeta.bg}" data-pfs-act="open-settings" aria-label="Room Cover &amp; Settings">
            <span>${coverMeta.glyph}</span>
          </button>
          <div class="pfs-hdr-meta">
            <div class="pfs-hdr-title-row">
              <b class="pfs-title">${esc(rm.title)}</b>
              <span class="pfs-tag-sep" aria-hidden="true">|</span>
              <span class="pfs-tag-txt">${esc(rm.tag || modeMeta.badge)}</span>
            </div>
            <div class="pfs-hdr-id-row">
              <button type="button" class="pfs-id-btn" data-pfs-act="copy-id" title="Copy Room ID">ID: ${esc(rm.shortId)}</button>
              <span class="pfs-shield-ic" title="${rm.passwordLocked ? 'Passcode Protected' : 'Safe Room'}">${rm.passwordLocked ? '🔒' : '🛡️'}</span>
              ${rm.highQualityAudio ? '<span class="pfs-hq-txt">HQ</span>' : ''}
            </div>
          </div>
        </div>
        <div class="pfs-hdr-right">
          <button type="button" class="pfs-hdr-btn" data-pfs-act="minimize" title="Minimize Room" aria-label="Minimize Room">−</button>
          <button type="button" class="pfs-count-btn" data-pfs-act="open-members" title="Active Room Members" aria-label="${onlineCount} active in room">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 19c1-3.2 3.5-5 6.5-5s5.5 1.8 6.5 5"/><circle cx="17.5" cy="9" r="2.5"/><path d="M16.5 14.5c2 .4 3.8 1.8 4.5 4.5"/></svg>
            <span>${onlineCount}</span>
          </button>
          <button type="button" class="pfs-hdr-btn" data-pfs-act="open-more" title="Room Options &amp; Settings" aria-label="More Room Options">⋯</button>
        </div>
      </header>

      <!-- 2. Top Supporters / Coins + Hindi/Bangla Music Pill & Mode/Mic-Pass Utility Row -->
      <div class="pfs-subbar">
        <button type="button" class="pfs-music-pill ${musicPlaying ? 'playing' : ''}" data-pfs-act="open-music" aria-label="Room Music: ${esc(musicTitle)}">
          <span class="pfs-music-ico" aria-hidden="true">♪</span>
          <span class="pfs-music-lbl">${esc(musicTitle)}</span>
          ${musicPlaying ? '<span class="pfs-mini-eq" aria-hidden="true"><i></i><i></i><i></i></span>' : ''}
        </button>
        <div class="pfs-subbar-right">
          <button type="button" class="pfs-sup-pill" data-pfs-act="open-gift" title="Top Supporters &amp; Room Coins">
            <span class="pfs-sup-avs">${supporters.map(sp => `<span class="pfs-sup-av">${av(sp, 18)}</span>`).join('')}</span>
            <b>🪙 ${fmtNum(roomCoinsTotal)}</b>
          </button>
          <button type="button" class="pfs-mode-chip" data-pfs-act="open-modes" aria-label="Switch Room Mode">${esc(modeMeta.name)} ▾</button>
          <button type="button" class="pfs-turn-chip ${mp.active ? 'on' : ''}" data-pfs-act="toggle-turn" aria-label="Toggle Turn Mic Pass">
            ${mp.active ? `🎙️ R${mp.round} <span id="pfsMicSec">${remSec}s</span>` : '🎙️ Turn'}
          </button>
          ${canPassMic ? `<button type="button" class="pfs-pass-chip" data-pfs-act="pass-mic">Next →</button>` : ''}
        </div>
        ${mp.active ? `<div class="pfs-mp-prog"><i id="pfsMicBar" style="width:${pct}%"></i></div>` : ''}
      </div>

      <!-- 3. Scrollable Stage + Rules Board + Chat Feed (Never Clips on 390px or 1440px) -->
      <div class="pfs-main-scroll">
        <div class="pfs-stage mode-${esc(rm.mode)}">
          ${renderPartyStageByMode(rm)}
        </div>

        <!-- Editable Room Notice / Rules Board -->
        <div class="pfs-rules-board" data-testid="party-rules-board">
          <div class="pfs-rules-head">
            <span>📌 Room Notice &amp; Rules</span>
            ${isHost ? `<button type="button" class="pfs-rules-edit" data-pfs-act="open-settings">Edit</button>` : ''}
          </div>
          <p class="pfs-rules-body">${esc(rm.announcement)}</p>
          <div class="pfs-rules-policy">🛡️ System Notice: Keep chat respectful. Zero tolerance for abuse, spam, or harassment.</div>
        </div>

        <!-- Compact Live Emoji Reactions -->
        <div class="pfs-react-dock" aria-label="Live Reactions">
          ${PARTY_REACTIONS.map(em => `<button type="button" class="pfs-react-btn" data-react="${em}" aria-label="React ${em}">${em}</button>`).join('')}
        </div>

        <!-- Live Chat Feed -->
        <div class="pfs-chat-feed" id="pfsChatFeed">
          ${mp.active && activeSpeakerSeat ? `<div class="pfs-msg sys">🎙️ On Air: ${esc(activeSpeakerSeat.name)} (${remSec}s left)</div>` : ''}
          ${chatHtml}
        </div>
      </div>

      ${floatersHtml}

      <!-- 4. Bottom Action Bar (Speaker, Mic, Chat Input, Gift, Studio/Camera, Grid/Apps) -->
      <div class="pfs-dock pfs-dock-v14">
        <button type="button" class="pfs-dock-ico ${partySpeakerOn ? 'on' : 'off'}" data-pfs-act="toggle-speaker" title="${partySpeakerOn ? 'Mute Room Audio' : 'Unmute Room Audio'}" aria-label="${partySpeakerOn ? 'Mute speaker' : 'Unmute speaker'}">
          ${partySpeakerOn ? '🔊' : '🔈'}
        </button>
        <button type="button" class="pfs-dock-ico ${mySeat ? (mySeat.muted ? 'muted' : 'live') : ''}" data-pfs-act="toggle-mic" title="${mySeat ? (mySeat.muted ? 'Unmute Mic' : 'Mute Mic') : 'Take Open Seat'}" aria-label="${mySeat ? (mySeat.muted ? 'Unmute Mic' : 'Mute Mic') : 'Sit on Mic'}">
          ${mySeat ? (mySeat.muted ? '🔇' : '🎙️') : '🪑'}
        </button>
        <input id="pfsChatIn" maxlength="160" placeholder="${chatDisabled ? 'Text chat paused by host' : 'Type...'}" value="${esc(prevChatVal)}" ${chatDisabled ? 'disabled' : ''} autocomplete="off">
        <button type="button" class="pfs-dock-send" data-pfs-act="send-chat" ${chatDisabled ? 'disabled' : ''} aria-label="Send message">➤</button>
        <button type="button" class="pfs-dock-ico gift" data-pfs-act="open-gift" title="Send 3D Gift" aria-label="Send 3D Gift">🎁</button>
        <button type="button" class="pfs-dock-ico" data-pfs-act="open-studio" title="Studio Photo Card &amp; Quick Voice" aria-label="Studio Camera and Quick Voice">📷</button>
        <button type="button" class="pfs-dock-ico apps" data-pfs-act="open-apps" title="Room Modes, Music &amp; Settings" aria-label="Room Apps Menu">⊞</button>
      </div>
    </div>
  `;

  const feed = $('#pfsChatFeed', root);
  if (feed) feed.scrollTop = feed.scrollHeight;
}

/* ===== Atomic Seat Operations (Enforces Strict 1-User = 1-Seat) ===== */
function partyTakeOrSwitchSeat(rm, targetIdx) {
  if (!rm) return;
  const isHost = isRoomHostOrManager(rm);
  if (!isHost && Array.isArray(rm.blocklist) && rm.blocklist.includes(uid)) {
    return toast('You are on this room blocklist');
  }
  const locked = Array.isArray(rm.lockedSeats) && rm.lockedSeats.includes(targetIdx);
  if (locked && !isHost) {
    return toast('This seat is locked by the host');
  }
  rm.seats = normalizePartySeats(rm.seats);
  const targetKey = String(targetIdx);
  // Protect Owner slot (0) from accidental overwrite or non-owner takeover
  if (targetIdx === 0 && rm.seats['0'] && rm.seats['0'].uid !== uid) {
    return toast('Owner slot is reserved for room host');
  }
  if (rm.seats[targetKey] && rm.seats[targetKey].uid !== uid) {
    return toast('Seat is already occupied');
  }

  // Atomically strip EVERY existing seat for uid before seating at targetKey (preserves Owner slot 0!)
  const prevKey = findUserSeatKeyInRoom(rm, uid);
  const nextSeats = {};
  Object.keys(rm.seats).forEach(k => {
    if (rm.seats[k] && rm.seats[k].uid !== uid) {
      nextSeats[k] = rm.seats[k];
    }
  });
  const mp = rm.micPass || { active: false, queue: [], currentIdx: 0 };
  const activeSpeakerUid = mp.active && mp.queue.length ? mp.queue[mp.currentIdx % mp.queue.length] : null;
  const forcedMuted = mp.active && activeSpeakerUid !== uid;
  const mutedState = forcedMuted ? true : (prevKey && rm.seats[prevKey] ? Boolean(rm.seats[prevKey].muted) : false);
  nextSeats[targetKey] = {
    uid,
    name: me.name || 'Player',
    avatar: me.avatar || 'av_b1',
    frame: me.frame || 'none',
    muted: mutedState,
    vipTier: getActiveVipTier(me) || '',
    speaking: !mutedState,
    charm: Number(me.charm || 0),
    joinedAt: Date.now()
  };
  rm.seats = normalizePartySeats(nextSeats);
  if (locked && isHost) {
    rm.lockedSeats = (rm.lockedSeats || []).filter(n => n !== targetIdx);
  }
  syncMicPassQueue(rm);
  if (typeof playSfx === 'function') playSfx('turnStart');
  persistPartyRoom(rm);
}

function partyLeaveMySeat(rm) {
  if (!rm) return;
  rm.seats = normalizePartySeats(rm.seats);
  const nextSeats = {};
  Object.keys(rm.seats).forEach(k => {
    if (rm.seats[k] && rm.seats[k].uid !== uid) nextSeats[k] = rm.seats[k];
  });
  rm.seats = nextSeats;
  syncMicPassQueue(rm);
  if (typeof playSfx === 'function') playSfx('tap');
  persistPartyRoom(rm);
}

/* ===== Room Interactive Modals (Modes, Settings, Music, Studio, Apps, Seat Sheet, More) ===== */
function openPartyModeSelectorModal(rm) {
  if (!rm) return;
  let pickedMode = rm.mode || 'normal';
  const m = modal('Room Mode Selector', `
    <p style="font-size:12px;color:var(--mu);margin:0 0 10px">Switch layout smoothly — all occupied seats stay intact.</p>
    <div class="pfs-mode-cards" id="pmModeCards">
      ${Object.values(PARTY_MODES_META).map(md => `
        <button type="button" class="pfs-mode-card ${md.id === pickedMode ? 'on' : ''}" data-pick-mode="${md.id}">
          <div class="pfs-mc-prev prev-${md.id}" aria-hidden="true">
            ${md.id === 'normal' ? '<span>👑</span><i>● ●</i><i>● ●</i>'
              : md.id === 'acquaint' ? '<span>💖</span><i>● ♥ ●</i><i>● ● ●</i>'
              : md.id === 'auction' ? '<span>🔨</span><i>🥈🥇🥉</i><i>🪙 Bid</i>'
              : md.id === 'video' ? '<span>🎬</span><i>▶ 16:9</i><i>● ● ●</i>'
              : '<span>🎮</span><i>🎲 🃏</i><i>● ● ●</i>'}
          </div>
          <div class="pfs-mc-info">
            <b>${esc(md.name)} Mode</b>
            <small>${esc(md.desc)}</small>
          </div>
        </button>
      `).join('')}
    </div>
    <button type="button" class="btn gold full" id="pmApplyMode" style="margin-top:12px">Save &amp; Apply Mode</button>
  `);

  $$('[data-pick-mode]', m).forEach(btn => {
    btn.onclick = () => {
      pickedMode = btn.dataset.pickMode;
      $$('[data-pick-mode]', m).forEach(b => b.classList.toggle('on', b.dataset.pickMode === pickedMode));
      if (typeof playSfx === 'function') playSfx('tap');
    };
  });

  $('#pmApplyMode', m).onclick = () => {
    rm.mode = pickedMode;
    rm.seats = normalizePartySeats(rm.seats);
    logPartyOperation(rm, `Switched mode to ${PARTY_MODES_META[pickedMode].name}`);
    rm.chat = [...(rm.chat || []), {
      id: 'md_' + Date.now().toString(36),
      type: 'sys',
      text: `✨ Room switched to ${PARTY_MODES_META[pickedMode].name} Mode`,
      ts: Date.now()
    }].slice(-45);
    if (typeof playSfx === 'function') playSfx('turnStart');
    persistPartyRoom(rm);
    m.close();
    toast(`${PARTY_MODES_META[pickedMode].name} Mode applied!`);
  };
}

function openPartySettingsModal(rm) {
  if (!rm) return;
  let pickedCover = rm.cover || 'cover_tensura';
  let pickedBg = rm.background || 'club';
  let localBlocklist = [...(rm.blocklist || [])];

  const m = modal('Room Settings & Moderation', `
    <div class="pfs-set-form">
      <div class="pfs-set-idrow">
        <span>Room ID: <b>${esc(rm.shortId)}</b></span>
        <button type="button" class="btn ghost sm" id="psCopyId">Copy ID</button>
      </div>

      <label for="psTitle">Room Title</label>
      <input id="psTitle" maxlength="36" value="${esc(rm.title)}">

      <div class="row" style="gap:8px;margin-top:8px">
        <div style="flex:1">
          <label for="psMode">Room Mode</label>
          <select id="psMode">
            ${Object.values(PARTY_MODES_META).map(md => `<option value="${md.id}" ${md.id === rm.mode ? 'selected' : ''}>${esc(md.name)}</option>`).join('')}
          </select>
        </div>
        <div style="flex:1">
          <label for="psTag">Room Tag</label>
          <select id="psTag">
            ${PARTY_TAGS.map(t => `<option value="${t}" ${t === rm.tag ? 'selected' : ''}>${esc(t)}</option>`).join('')}
          </select>
        </div>
      </div>

      <label style="margin-top:8px">Cover Image</label>
      <div class="pfs-swatch-row" id="psCovers">
        ${Object.entries(PARTY_COVERS).map(([cid, c]) => `
          <button type="button" class="pfs-cover-pick ${cid === pickedCover ? 'on' : ''}" data-pick-cover="${cid}" style="background:${c.bg}" title="${esc(c.name)}">${c.glyph}</button>
        `).join('')}
      </div>

      <label style="margin-top:8px">Room Background</label>
      <div class="pfs-bg-row" id="psBgs">
        ${Object.values(PARTY_BG_META).map(b => `
          <button type="button" class="pfs-bg-pick ${b.id === pickedBg ? 'on' : ''}" data-pick-bg="${b.id}" style="background:${b.css}">
            <span>${esc(b.name)}</span>
          </button>
        `).join('')}
      </div>

      <label for="psRules" style="margin-top:8px">Announcement / Rules Board</label>
      <textarea id="psRules" rows="2" maxlength="240">${esc(rm.announcement)}</textarea>

      <div class="pfs-set-section">Audio, Partner Seat &amp; Chat Controls</div>
      <label class="pfs-toggle-row"><span>Partner Seat (Co-Host Stage)</span><input type="checkbox" id="psPartner" ${rm.partnerSeatEnabled ? 'checked' : ''}></label>
      <label class="pfs-toggle-row"><span>High Quality Audio Mode (HQ)</span><input type="checkbox" id="psHQ" ${rm.highQualityAudio ? 'checked' : ''}></label>
      <label class="pfs-toggle-row"><span>Ban Text Chatting</span><input type="checkbox" id="psBanText" ${rm.banTextChat ? 'checked' : ''}></label>
      <label class="pfs-toggle-row"><span>Ban Photo Chatting</span><input type="checkbox" id="psBanPhoto" ${rm.banPhotoChat ? 'checked' : ''}></label>
      <label class="pfs-toggle-row"><span>Ban Red Packet</span><input type="checkbox" id="psBanRp" ${rm.banRedPacket ? 'checked' : ''}></label>

      <div class="pfs-set-section">Security &amp; Passcode Lock</div>
      <label class="pfs-toggle-row"><span>Password Lock</span><input type="checkbox" id="psPassLock" ${rm.passwordLocked ? 'checked' : ''}></label>
      <input id="psPassCode" maxlength="8" placeholder="4–8 digit passcode (e.g. 2026)" value="${esc(rm.passcode || '')}" style="margin-top:6px">

      <div class="pfs-set-section">Blocklist Management (${localBlocklist.length})</div>
      <div class="row" style="gap:6px">
        <input id="psBlockUid" placeholder="Enter Player UID to block" style="flex:1">
        <button type="button" class="btn red sm" id="psBlockAdd">Block</button>
      </div>
      <div id="psBlockList" class="pfs-block-chips"></div>

      <div class="pfs-set-section">Operation Record</div>
      <div class="pfs-oplog-box">
        ${(rm.operationLog || []).slice(0, 8).map(op => `
          <div class="pfs-op-row"><b>${esc(op.actor)}</b> · ${esc(op.action)}</div>
        `).join('') || '<small style="color:var(--mu)">No operations recorded yet.</small>'}
      </div>

      <button type="button" class="btn gold full" id="psSaveAll" style="margin-top:12px">Save Room Settings</button>
    </div>
  `, 'pfs-settings-sheet');

  const renderBlockChips = () => {
    const box = $('#psBlockList', m);
    if (!box) return;
    if (!localBlocklist.length) {
      box.innerHTML = '<small style="color:var(--mu)">No blocked users in this room.</small>';
      return;
    }
    box.innerHTML = localBlocklist.map(bUid => `
      <span class="pfs-bchip">${esc(bUid)} <button type="button" data-unblock="${esc(bUid)}" aria-label="Unblock ${esc(bUid)}">×</button></span>
    `).join('');
  };
  renderBlockChips();

  $('#psCopyId', m).onclick = () => {
    if (typeof copyTextClean === 'function') copyTextClean(rm.shortId, 'Room ID');
    else toast('Room ID: ' + rm.shortId);
  };

  $$('[data-pick-cover]', m).forEach(btn => {
    btn.onclick = () => {
      pickedCover = btn.dataset.pickCover;
      $$('[data-pick-cover]', m).forEach(b => b.classList.toggle('on', b.dataset.pickCover === pickedCover));
    };
  });

  $$('[data-pick-bg]', m).forEach(btn => {
    btn.onclick = () => {
      pickedBg = btn.dataset.pickBg;
      $$('[data-pick-bg]', m).forEach(b => b.classList.toggle('on', b.dataset.pickBg === pickedBg));
    };
  });

  $('#psBlockAdd', m).onclick = () => {
    const val = ($('#psBlockUid', m).value || '').trim();
    if (!val || val === uid) return toast('Enter another player UID');
    if (!localBlocklist.includes(val)) localBlocklist.push(val);
    $('#psBlockUid', m).value = '';
    renderBlockChips();
  };

  $('#psBlockList', m).onclick = e => {
    const btn = e.target.closest('[data-unblock]');
    if (!btn) return;
    localBlocklist = localBlocklist.filter(x => x !== btn.dataset.unblock);
    renderBlockChips();
  };

  $('#psSaveAll', m).onclick = () => {
    const nextTitle = ($('#psTitle', m).value || '').trim() || rm.title;
    const nextMode = $('#psMode', m).value || rm.mode;
    const nextTag = $('#psTag', m).value || rm.tag;
    const nextRules = ($('#psRules', m).value || '').trim() || rm.announcement;
    const passOn = Boolean($('#psPassLock', m).checked);
    const passVal = ($('#psPassCode', m).value || '').replace(/[^0-9a-zA-Z]/g, '').slice(0, 8);
    if (passOn && !passVal) return toast('Enter a passcode before enabling Password Lock');

    rm.title = nextTitle;
    rm.mode = nextMode;
    rm.tag = nextTag;
    rm.category = nextTag;
    rm.cover = pickedCover;
    rm.background = pickedBg;
    rm.announcement = nextRules;
    rm.partnerSeatEnabled = Boolean($('#psPartner', m).checked);
    rm.highQualityAudio = Boolean($('#psHQ', m).checked);
    rm.banTextChat = Boolean($('#psBanText', m).checked);
    rm.banPhotoChat = Boolean($('#psBanPhoto', m).checked);
    rm.banRedPacket = Boolean($('#psBanRp', m).checked);
    rm.passwordLocked = passOn;
    rm.passcode = passVal;
    rm.blocklist = localBlocklist;

    // Remove any blocked users from seats
    rm.seats = normalizePartySeats(rm.seats);
    Object.keys(rm.seats).forEach(k => {
      if (rm.seats[k] && localBlocklist.includes(rm.seats[k].uid)) delete rm.seats[k];
    });

    logPartyOperation(rm, `Updated settings (${nextMode.toUpperCase()}, ${PARTY_BG_META[pickedBg].name})`);
    rm.chat = [...(rm.chat || []), {
      id: 'st_' + Date.now().toString(36),
      type: 'sys',
      text: `⚙️ ${me.name || 'Host'} updated Room Settings`,
      ts: Date.now()
    }].slice(-45);

    if (typeof playSfx === 'function') playSfx('tap');
    persistPartyRoom(rm);
    m.close();
    toast('Room Settings saved!');
  };
}

function openPartyMusicModal(rm) {
  if (!rm) return;
  let activeCat = 'all';
  let searchQ = '';
  const st = RoomMusicEngine.getState();

  const m = modal('Hindi & Bangla Room Music', `
    <div class="pfs-music-player-box">
      <div class="pfs-mp-now">
        <div class="pfs-mp-disc ${st.playing ? 'spin' : ''}" aria-hidden="true">🎵</div>
        <div class="mid">
          <b id="pmNowTitle">${esc(RoomMusicEngine.getTitle())}</b>
          <small id="pmNowSub">${st.playing ? 'Playing in Room · Continues in Background' : 'Select Hindi, Bangla, Lo-Fi or paste URL'}</small>
        </div>
      </div>
      <div class="pfs-mp-transport">
        <button type="button" class="btn gold sm" id="pmTogglePlay">${st.playing ? '⏸ Pause' : '▶ Play'}</button>
        <button type="button" class="btn ghost sm" id="pmNext">⏭ Next</button>
        <button type="button" class="btn sm ${st.loop ? 'ok' : 'ghost'}" id="pmLoop">🔁 Loop</button>
        <button type="button" class="btn red sm" id="pmStop">⏹</button>
      </div>
      <label class="pfs-mp-vol">
        <span>🔊 Volume</span>
        <input type="range" id="pmVolRange" min="0" max="1" step="0.05" value="${st.volume}">
      </label>
      <div id="pmYtEmbedHost">
        ${st.youtubeId ? `<div class="pfs-yt-frame" style="margin-top:8px"><iframe src="https://www.youtube.com/embed/${esc(st.youtubeId)}?autoplay=0&rel=0" allow="autoplay; encrypted-media" allowfullscreen title="Room Music YouTube Player"></iframe></div>` : ''}
      </div>
    </div>

    <div class="pfs-music-cats" id="pmCatPills" role="tablist" aria-label="Music categories">
      <button type="button" class="pfs-mcat on" data-mcat="all">All</button>
      <button type="button" class="pfs-mcat" data-mcat="hindi">Hindi</button>
      <button type="button" class="pfs-mcat" data-mcat="bangla">Bangla</button>
      <button type="button" class="pfs-mcat" data-mcat="lofi">Lo-Fi</button>
    </div>

    <input id="pmSearchIn" placeholder="Search Hindi, Bangla or Lo-Fi songs..." autocomplete="off" style="margin-top:8px">

    <div class="list pfs-music-list" id="pmTrackList" style="gap:6px;margin-top:8px"></div>

    <div class="pfs-mp-url-box">
      <label for="pmUrlIn">Paste .mp3 / Audio Stream URL or YouTube Link</label>
      <div class="row" style="gap:6px;margin-top:4px">
        <input id="pmUrlIn" placeholder="https://...mp3 or youtu.be/..." value="${esc(rm.musicCustomUrl || '')}" style="flex:1">
        <button type="button" class="btn ok sm" id="pmUrlGo">Play</button>
      </div>
    </div>
  `, 'pfs-music-sheet');

  const syncHeader = () => {
    const cur = RoomMusicEngine.getState();
    if ($('#pmNowTitle', m)) $('#pmNowTitle', m).textContent = RoomMusicEngine.getTitle();
    if ($('#pmNowSub', m)) $('#pmNowSub', m).textContent = cur.playing ? 'Playing in Room · Continues in Background' : 'Paused';
    if ($('#pmTogglePlay', m)) $('#pmTogglePlay', m).textContent = cur.playing ? '⏸ Pause' : '▶ Play';
    const disc = $('.pfs-mp-disc', m);
    if (disc) disc.classList.toggle('spin', cur.playing);
    const loopBtn = $('#pmLoop', m);
    if (loopBtn) {
      loopBtn.classList.toggle('ok', cur.loop);
      loopBtn.classList.toggle('ghost', !cur.loop);
    }
    const ytHost = $('#pmYtEmbedHost', m);
    if (ytHost) {
      ytHost.innerHTML = cur.youtubeId
        ? `<div class="pfs-yt-frame" style="margin-top:8px"><iframe src="https://www.youtube.com/embed/${esc(cur.youtubeId)}?autoplay=0&rel=0" allow="autoplay; encrypted-media" allowfullscreen title="Room Music YouTube"></iframe></div>`
        : '';
    }
  };

  const renderTracks = () => {
    const q = searchQ.trim().toLowerCase();
    const curId = RoomMusicEngine.getState().trackId;
    const list = PARTY_MUSIC_TRACKS.filter(t => {
      if (activeCat !== 'all' && t.category !== activeCat) return false;
      if (!q) return true;
      return t.title.toLowerCase().includes(q) || t.artist.toLowerCase().includes(q) || t.category.includes(q);
    });
    const host = $('#pmTrackList', m);
    if (!host) return;
    host.innerHTML = list.length ? list.map(tr => `
      <button type="button" class="pfs-music-row ${curId === tr.id ? 'on' : ''}" data-pick-track="${esc(tr.id)}">
        <span class="pfs-mtag ${tr.category}">${esc(tr.category.toUpperCase())}</span>
        <div class="mid"><b>${esc(tr.title)}</b><small>${esc(tr.artist)}</small></div>
        <em>${curId === tr.id ? 'Playing' : 'Play'}</em>
      </button>
    `).join('') : '<small style="color:var(--mu);text-align:center;padding:8px">No matching tracks found.</small>';
  };
  renderTracks();

  $('#pmCatPills', m).onclick = e => {
    const btn = e.target.closest('[data-mcat]');
    if (!btn) return;
    activeCat = btn.dataset.mcat;
    $$('[data-mcat]', m).forEach(b => b.classList.toggle('on', b.dataset.mcat === activeCat));
    renderTracks();
  };

  $('#pmSearchIn', m).oninput = e => {
    searchQ = e.target.value || '';
    renderTracks();
  };

  $('#pmTrackList', m).onclick = e => {
    const btn = e.target.closest('[data-pick-track]');
    if (!btn) return;
    const tr = RoomMusicEngine.playPreset(btn.dataset.pickTrack);
    if (!tr) return;
    rm.musicTrack = tr.id;
    rm.musicCustomUrl = '';
    rm.musicCustomTitle = tr.title;
    rm.musicYoutubeId = '';
    logPartyOperation(rm, `Played music: ${tr.title}`);
    persistPartyRoom(rm);
    syncHeader();
    renderTracks();
  };

  $('#pmTogglePlay', m).onclick = () => {
    RoomMusicEngine.togglePlay();
    const cur = RoomMusicEngine.getState();
    rm.musicTrack = cur.trackId;
    rm.musicCustomTitle = RoomMusicEngine.getTitle();
    persistPartyRoom(rm);
    syncHeader();
    renderTracks();
  };

  $('#pmNext', m).onclick = () => {
    const tr = RoomMusicEngine.nextTrack(activeCat);
    if (tr) {
      rm.musicTrack = tr.id;
      rm.musicCustomTitle = tr.title;
      rm.musicCustomUrl = '';
      rm.musicYoutubeId = '';
      persistPartyRoom(rm);
      syncHeader();
      renderTracks();
    }
  };

  $('#pmLoop', m).onclick = () => {
    RoomMusicEngine.setLoop(!RoomMusicEngine.getState().loop);
    syncHeader();
  };

  $('#pmStop', m).onclick = () => {
    RoomMusicEngine.stop();
    rm.musicTrack = '';
    rm.musicCustomTitle = '';
    rm.musicCustomUrl = '';
    rm.musicYoutubeId = '';
    persistPartyRoom(rm);
    syncHeader();
    renderTracks();
  };

  $('#pmVolRange', m).oninput = e => {
    RoomMusicEngine.setVolume(e.target.value);
  };

  $('#pmUrlGo', m).onclick = () => {
    const raw = ($('#pmUrlIn', m).value || '').trim();
    if (!raw) return toast('Paste an .mp3 audio URL or YouTube link');
    const ytId = parseYouTubeVideoId(raw);
    if (ytId) {
      RoomMusicEngine.setYoutubeFallback(ytId, 'YouTube Track · ' + ytId);
      rm.musicTrack = 'yt_music';
      rm.musicCustomTitle = 'YouTube · ' + ytId;
      rm.musicYoutubeId = ytId;
      rm.musicCustomUrl = '';
      persistPartyRoom(rm);
      syncHeader();
      toast('YouTube player ready in room!');
      return;
    }
    if (/^https?:\/\/.+/i.test(raw)) {
      const label = raw.split('/').pop()?.split('?')[0]?.slice(0, 26) || 'Audio Stream';
      RoomMusicEngine.playDirectUrl(raw, label);
      rm.musicTrack = 'custom_url';
      rm.musicCustomUrl = raw;
      rm.musicCustomTitle = label;
      rm.musicYoutubeId = '';
      persistPartyRoom(rm);
      syncHeader();
      toast('Playing HTML5 audio stream!');
      return;
    }
    toast('Enter a valid https:// .mp3 URL or YouTube link');
  };
}

function openPartyAddVideoModal(rm) {
  if (!rm) return;
  const m = modal('Watch Together · Add Video', `
    <label for="pvYtIn">YouTube URL or Video ID</label>
    <input id="pvYtIn" placeholder="https://youtu.be/... or 11-char ID" value="${esc(rm.youtubeId || '')}">
    <div class="row wrap" style="gap:6px;margin-top:8px">
      <button type="button" class="btn ghost sm" data-pv-pre="jfKfPfyJRdk">Lo-Fi Study Girl</button>
      <button type="button" class="btn ghost sm" data-pv-pre="4xDzrJKXOOY">Synthwave Beats</button>
      <button type="button" class="btn ghost sm" data-pv-pre="5qap5aO4i9A">Chill Radio</button>
    </div>
    <button type="button" class="btn gold full" id="pvYtGo" style="margin-top:12px">Play in Room</button>
  `);
  $$('[data-pv-pre]', m).forEach(b => {
    b.onclick = () => { $('#pvYtIn', m).value = b.dataset.pvPre; };
  });
  $('#pvYtGo', m).onclick = () => {
    const vid = parseYouTubeVideoId($('#pvYtIn', m).value || '');
    if (!vid) return toast('Enter a valid YouTube link or 11-character ID');
    rm.youtubeId = vid;
    rm.mode = 'video';
    logPartyOperation(rm, `Loaded YouTube video ${vid}`);
    rm.chat = [...(rm.chat || []), {
      id: 'yt_' + Date.now().toString(36),
      type: 'sys',
      text: `🎬 ${me.name || 'Player'} loaded a Watch Together video`,
      ts: Date.now()
    }].slice(-45);
    if (typeof bumpStat === 'function') bumpStat('watch_together');
    persistPartyRoom(rm);
    m.close();
  };
}

function openPartyStudioModal(rm) {
  if (!rm) return;
  const isHost = isRoomHostOrManager(rm);
  const photoBanned = Boolean(rm.banPhotoChat && !isHost);
  const m = modal('Studio Cards & Quick Voice', `
    <div style="margin-bottom:10px">
      <button type="button" class="btn gold full" id="pstQuickVoice">🗣️ Open Quick Voice Callouts</button>
    </div>
    <b style="font-size:12.5px;display:block;margin-bottom:6px">Share Studio Photo Card in Chat</b>
    ${photoBanned ? `<p style="font-size:12px;color:#fca5a5;margin:4px 0">📷 Photo chatting is currently disabled by room host.</p>` : `
      <div class="pfs-stamp-grid">
        ${PARTY_PHOTO_STAMPS.map(st => `
          <button type="button" class="pfs-stamp-btn" style="background:${st.bg}" data-send-stamp="${st.id}">
            <b>${esc(st.label)}</b>
            <small>${esc(st.text)}</small>
          </button>
        `).join('')}
      </div>
    `}
  `);
  $('#pstQuickVoice', m).onclick = () => {
    m.close();
    const root = document.getElementById('partyFsRoot');
    const anchor = root ? root.querySelector('[data-pfs-act="open-studio"]') : document.body;
    if (typeof QuickVoice !== 'undefined') {
      QuickVoice.openPanel(anchor, 'voice_room', (text, ico) => {
        const myKey = findUserSeatKeyInRoom(rm, uid);
        const hostEl = (myKey != null && root ? root.querySelector(`[data-seat-idx="${myKey}"]`) : null) || root?.querySelector('.pfs-stage') || root;
        QuickVoice.showBubble(hostEl, `${ico} ${text}`, me.name || 'You', true);
        rm.chat = [...(rm.chat || []), {
          id: 'qv_' + Date.now().toString(36),
          type: 'text',
          uid,
          name: me.name || 'Player',
          text: `🗣️ ${ico} ${text}`,
          ts: Date.now()
        }].slice(-45);
        persistPartyRoom(rm);
      });
    }
  };
  $$('[data-send-stamp]', m).forEach(btn => {
    btn.onclick = () => {
      const st = PARTY_PHOTO_STAMPS.find(x => x.id === btn.dataset.sendStamp);
      if (!st) return;
      rm.chat = [...(rm.chat || []), {
        id: 'ph_' + Date.now().toString(36),
        type: 'photo',
        uid,
        name: me.name || 'Player',
        bg: st.bg,
        text: st.text,
        ts: Date.now()
      }].slice(-45);
      if (typeof playSfx === 'function') playSfx('chatSend');
      persistPartyRoom(rm);
      m.close();
    };
  });
}

function openPartyAppsMenuModal(rm, focusMore) {
  if (!rm) return;
  const m = modal(focusMore ? 'Room Options' : 'Room Apps & Modes', `
    <div class="pfs-apps-grid">
      <button type="button" class="pfs-app-tile" data-app-go="modes"><span>🎛️</span><b>Room Modes</b><small>${esc((PARTY_MODES_META[rm.mode] || PARTY_MODES_META.normal).name)}</small></button>
      <button type="button" class="pfs-app-tile" data-app-go="settings"><span>⚙️</span><b>Room Settings</b><small>Rules, Lock, BG</small></button>
      <button type="button" class="pfs-app-tile" data-app-go="music"><span>🎵</span><b>Room Music</b><small>${rm.musicTrack ? 'Playing' : 'No Songs'}</small></button>
      <button type="button" class="pfs-app-tile" data-app-go="video"><span>🎬</span><b>Watch Video</b><small>YouTube Sync</small></button>
      <button type="button" class="pfs-app-tile" data-app-go="rp"><span>🧧</span><b>Red Packet</b><small>Drop Lifafa</small></button>
      <button type="button" class="pfs-app-tile" data-app-go="share"><span>📣</span><b>Share Invite</b><small>World Chat</small></button>
      <button type="button" class="pfs-app-tile" data-app-go="voice"><span>🗣️</span><b>Quick Voice</b><small>AI Callouts</small></button>
      <button type="button" class="pfs-app-tile" data-app-go="leave"><span>🚪</span><b>Leave Room</b><small>Exit Audio</small></button>
    </div>
  `);
  $$('[data-app-go]', m).forEach(btn => {
    btn.onclick = () => {
      const act = btn.dataset.appGo;
      m.close();
      if (act === 'modes') openPartyModeSelectorModal(rm);
      else if (act === 'settings') openPartySettingsModal(rm);
      else if (act === 'music') openPartyMusicModal(rm);
      else if (act === 'video') openPartyAddVideoModal(rm);
      else if (act === 'rp') triggerPartyRedPacketDrop(rm);
      else if (act === 'share') sharePartyRoomToWorld(rm);
      else if (act === 'voice') openPartyStudioModal(rm);
      else if (act === 'leave') closePartyRoom();
    };
  });
}

function openPartySeatActionSheet(rm, seatIdx) {
  const s = rm.seats && rm.seats[String(seatIdx)];
  const isHost = isRoomHostOrManager(rm);
  if (!s) {
    if (!isHost) return toast('Seat is locked by host');
    const isLocked = (rm.lockedSeats || []).includes(seatIdx);
    const m = modal(`Seat ${seatIdx} Controls`, `
      <p style="font-size:12.5px;color:var(--mu);margin:0 0 12px">Manage locked seat ${seatIdx}.</p>
      <div class="row" style="gap:8px">
        <button type="button" class="btn ok" style="flex:1" id="psUnlockSeat">${isLocked ? 'Unlock Seat' : 'Lock Seat'}</button>
        <button type="button" class="btn gold" style="flex:1" id="psSitHere">Sit Here</button>
      </div>
    `);
    $('#psUnlockSeat', m).onclick = () => {
      rm.lockedSeats = isLocked
        ? (rm.lockedSeats || []).filter(x => x !== seatIdx)
        : [...new Set([...(rm.lockedSeats || []), seatIdx])];
      logPartyOperation(rm, `${isLocked ? 'Unlocked' : 'Locked'} Seat ${seatIdx}`);
      persistPartyRoom(rm);
      m.close();
    };
    $('#psSitHere', m).onclick = () => {
      m.close();
      partyTakeOrSwitchSeat(rm, seatIdx);
    };
    return;
  }

  const isMe = s.uid === uid;
  const m = modal(`${esc(s.name)} · Seat ${seatIdx === 0 ? 'Owner' : seatIdx}`, `
    <div class="row" style="gap:10px;margin-bottom:12px">
      ${av(s, 54)}
      <div class="mid">
        <b>${esc(s.name)}</b>
        <small style="display:block;color:var(--mu)">${s.muted ? '🔇 Mic Muted' : '🎙️ Mic Live'}${s.charm ? ` · 💎 ${fmtNum(s.charm)} Charm` : ''}</small>
      </div>
    </div>
    <div class="list" style="gap:7px">
      ${isMe ? `
        <button type="button" class="btn ${s.muted ? 'ok' : 'ghost'} full" id="saMute">${s.muted ? '🎙️ Unmute Mic' : '🔇 Mute Mic'}</button>
        <button type="button" class="btn red full" id="saLeave">Leave Seat</button>
      ` : `
        <button type="button" class="btn gold full" id="saGift">🎁 Send 3D Gift to ${esc(s.name)}</button>
        <button type="button" class="btn ghost full" id="saProfile">👤 View Profile</button>
        ${isHost ? `<button type="button" class="btn red full" id="saKick">Remove from Seat</button>` : ''}
      `}
    </div>
  `);
  if ($('#saMute', m)) $('#saMute', m).onclick = () => { rm.seats[String(seatIdx)].muted = !rm.seats[String(seatIdx)].muted; persistPartyRoom(rm); m.close(); };
  if ($('#saLeave', m)) $('#saLeave', m).onclick = () => { partyLeaveMySeat(rm); m.close(); };
  if ($('#saGift', m)) $('#saGift', m).onclick = () => { m.close(); if (typeof openGiftSendModal === 'function') openGiftSendModal(s.uid, { targetName: s.name, inPartyRoom: rm.id }); };
  if ($('#saProfile', m)) $('#saProfile', m).onclick = () => { m.close(); if (typeof openPublicProfile === 'function') openPublicProfile(s.uid); };
  if ($('#saKick', m)) $('#saKick', m).onclick = () => {
    delete rm.seats[String(seatIdx)];
    syncMicPassQueue(rm);
    logPartyOperation(rm, `Removed ${s.name} from seat ${seatIdx}`);
    persistPartyRoom(rm);
    m.close();
  };
}

function triggerPartyRedPacketDrop(rm) {
  if (!rm) return;
  const isHost = isRoomHostOrManager(rm);
  if (rm.banRedPacket && !isHost) return toast('Red Packets are disabled by room host');
  if ((me.coins || 0) < 100) return toast('Need at least 100 🪙 to drop a Room Lifafa');
  me.coins = clampCoins(me.coins - 100);
  saveMe();
  updateHud();
  rm.chat = [...(rm.chat || []), {
    id: 'rp_' + Date.now().toString(36),
    type: 'red_packet',
    uid,
    name: me.name || 'Player',
    coins: 100,
    claimedBy: [],
    ts: Date.now()
  }].slice(-45);
  if (typeof playSfx === 'function') playSfx('redPacketDrop');
  persistPartyRoom(rm);
  toast('🧧 Dropped a 100 🪙 Room Lifafa!');
}

function sharePartyRoomToWorld(rm) {
  const id = 'pw_' + Date.now().toString(36);
  const item = {
    id, type: 'text', uid, name: me.name || 'Player', avatar: me.avatar || 'av_b1', frame: me.frame || 'none',
    banner: me.banner || 'bn-aurora', tags: me.tags || [], exp: me.exp || 0, isDev: devMode,
    text: `🎙️ Join my Voice Party Room: "${rm.title}" (ID: ${rm.shortId})!`, ts: Date.now()
  };
  worldMsgs = [...(worldMsgs || []), item].slice(-150);
  ls.set('sg_world_msgs', worldMsgs);
  dbOp(() => F.setDoc(F.doc(db, 'world_chat', id), item));
  if (typeof playSfx === 'function') playSfx('chatSend');
  toast('Room invite posted to World Chat!');
}

function sendPartyRoomChatMessage(rm, root) {
  if (!rm || !root) return;
  const isHost = isRoomHostOrManager(rm);
  if (rm.banTextChat && !isHost) return toast('Text chatting is disabled by room host');
  if (!isHost && Array.isArray(rm.blocklist) && rm.blocklist.includes(uid)) return toast('You are blocked in this room');
  if (typeof isMutedNow === 'function' && isMutedNow()) return toast('You are muted (' + muteRemainingText() + ')');
  const inp = $('#pfsChatIn', root);
  const txt = (inp?.value || '').trim();
  if (!txt) return;
  if (typeof hasBadWord === 'function' && hasBadWord(txt)) return toast('Keep room chat respectful');
  inp.value = '';
  rm.chat = [...(rm.chat || []), {
    id: 'pc_' + Date.now().toString(36),
    type: 'text',
    uid,
    name: me.name || 'Player',
    text: txt,
    ts: Date.now()
  }].slice(-45);
  if (typeof playSfx === 'function') playSfx('chatSend');
  persistPartyRoom(rm);
}

/* ===== Single Delegated Event Listener on #partyFsRoot (Zero Duplicate Listeners!) ===== */
function bindPartyRootDelegation(root) {
  if (!root || root.dataset.pfsBound === '1') return;
  root.dataset.pfsBound = '1';

  root.addEventListener('keydown', e => {
    if (e.target && e.target.id === 'pfsChatIn' && e.key === 'Enter') {
      const rm = partyRooms.find(r => r.id === activePartyRoomId);
      sendPartyRoomChatMessage(rm, root);
    }
  });

  root.addEventListener('click', e => {
    const rm = partyRooms.find(r => r.id === activePartyRoomId);
    if (!rm) return;

    const dismissBtn = e.target.closest('[data-dismiss-floater]');
    if (dismissBtn) {
      e.stopPropagation();
      partyDismissedFloaters[dismissBtn.dataset.dismissFloater] = true;
      renderFullScreenPartyRoom();
      return;
    }

    const claimRp = e.target.closest('[data-claim-rp]');
    if (claimRp) {
      const msg = (rm.chat || []).find(c => c.id === claimRp.dataset.claimRp);
      if (!msg) return;
      msg.claimedBy = Array.isArray(msg.claimedBy) ? msg.claimedBy : [];
      if (msg.claimedBy.includes(uid)) return;
      msg.claimedBy.push(uid);
      const reward = Math.max(15, Math.floor(Math.random() * 45) + 20);
      me.coins = clampCoins((me.coins || 0) + reward);
      saveMe();
      updateHud();
      if (typeof playSfx === 'function') playSfx('luckyDrop');
      persistPartyRoom(rm);
      toast(`🧧 Grabbed +${reward} 🪙 from Room Lifafa!`);
      return;
    }

    const sitBtn = e.target.closest('[data-sit]');
    if (sitBtn) {
      partyTakeOrSwitchSeat(rm, Number(sitBtn.dataset.sit));
      return;
    }

    const lockedSeatBtn = e.target.closest('[data-seat-action="locked"]');
    if (lockedSeatBtn) {
      openPartySeatActionSheet(rm, Number(lockedSeatBtn.dataset.seatIdx));
      return;
    }

    const occSeatBtn = e.target.closest('[data-seat-uid]');
    if (occSeatBtn) {
      openPartySeatActionSheet(rm, Number(occSeatBtn.dataset.seatIdx));
      return;
    }

    const reactBtn = e.target.closest('[data-react]');
    if (reactBtn) {
      const em = reactBtn.dataset.react;
      if (typeof playSfx === 'function') playSfx('reactionPop');
      if (typeof bumpStat === 'function') bumpStat('party_react');
      const myKey = findUserSeatKeyInRoom(rm, uid);
      spawnPartyFloatingReaction(em, myKey != null ? Number(myKey) : 0);
      return;
    }

    const acqBtn = e.target.closest('[data-acquaint-prompt]');
    if (acqBtn) {
      const promptTxt = acqBtn.dataset.acquaintPrompt;
      rm.chat = [...(rm.chat || []), {
        id: 'aq_' + Date.now().toString(36),
        type: 'text',
        uid,
        name: me.name || 'Player',
        text: promptTxt,
        ts: Date.now()
      }].slice(-45);
      if (typeof playSfx === 'function') playSfx('reactionPop');
      spawnPartyFloatingReaction('💖', 0);
      persistPartyRoom(rm);
      return;
    }

    const bidBtn = e.target.closest('[data-auc-bid]');
    if (bidBtn) {
      const inc = Number(bidBtn.dataset.aucBid || 100);
      const nextAmt = Number(rm.auction?.currentBid || 500) + inc;
      if ((me.coins || 0) < inc) return toast(`Need ${inc} 🪙 to raise bid`);
      me.coins = clampCoins(me.coins - inc);
      saveMe();
      updateHud();
      rm.auction = rm.auction || { active: true, subjectName: rm.hostName, currentBid: 500, bidsCount: 0 };
      rm.auction.currentBid = nextAmt;
      rm.auction.topBidderUid = uid;
      rm.auction.topBidderName = me.name || 'Player';
      rm.auction.bidsCount = Number(rm.auction.bidsCount || 0) + 1;
      rm.auction.stageBadge = nextAmt >= 5000 ? 'Royal Crown Tier' : (nextAmt >= 2000 ? 'Diamond Bond Tier' : 'Rising Spotlight');
      rm.topGifter = { name: me.name || 'Player', charm: nextAmt, avatar: me.avatar || 'av_b1' };
      rm.chat = [...(rm.chat || []), {
        id: 'bd_' + Date.now().toString(36),
        type: 'sys',
        text: `🔨 ${me.name || 'Player'} bid ${fmtNum(nextAmt)} 🪙 (${rm.auction.stageBadge})!`,
        ts: Date.now()
      }].slice(-45);
      if (typeof playSfx === 'function') playSfx('coin');
      persistPartyRoom(rm);
      return;
    }

    const ytPre = e.target.closest('[data-yt-preset]');
    if (ytPre) {
      rm.youtubeId = ytPre.dataset.ytPreset;
      rm.chat = [...(rm.chat || []), { id: 'yt_' + Date.now().toString(36), type: 'sys', text: `🎬 ${me.name || 'Player'} started Watch Together stream`, ts: Date.now() }].slice(-45);
      persistPartyRoom(rm);
      return;
    }

    const stakeBtn = e.target.closest('[data-game-stake]');
    if (stakeBtn) {
      rm.gameCoinMode = stakeBtn.dataset.gameStake === 'coin' ? 'coin' : 'free';
      if (typeof playSfx === 'function') playSfx('tap');
      persistPartyRoom(rm);
      return;
    }

    const miniGameBtn = e.target.closest('[data-room-mini]');
    if (miniGameBtn) {
      const kind = miniGameBtn.dataset.roomMini;
      if (kind === 'dice') {
        const roll = Math.floor(Math.random() * 6) + 1;
        rm.chat = [...(rm.chat || []), { id: 'dg_' + Date.now().toString(36), type: 'sys', text: `🎲 ${me.name || 'Player'} rolled a ${roll}!`, ts: Date.now() }].slice(-45);
        spawnPartyFloatingReaction('🎲', 0);
      } else {
        const card = PARTY_TRUTH_DARES[Math.floor(Math.random() * PARTY_TRUTH_DARES.length)];
        rm.chat = [...(rm.chat || []), { id: 'td_' + Date.now().toString(36), type: 'sys', text: `🔥 ${card}`, ts: Date.now() }].slice(-45);
      }
      if (typeof playSfx === 'function') playSfx('turnStart');
      persistPartyRoom(rm);
      return;
    }

    const arenaBtn = e.target.closest('[data-launch-arena]');
    if (arenaBtn) {
      const gKey = arenaBtn.dataset.launchArena;
      minimizePartyRoom();
      if (typeof launchArenaGame === 'function') launchArenaGame(gKey);
      else showTab('games');
      return;
    }

    const actBtn = e.target.closest('[data-pfs-act]');
    if (!actBtn) return;
    const act = actBtn.dataset.pfsAct;

    if (act === 'close') {
      if (typeof playSfx === 'function') playSfx('tap');
      if (typeof QuickVoice !== 'undefined') QuickVoice.closePanel();
      closePartyRoom();
    } else if (act === 'minimize') {
      if (typeof playSfx === 'function') playSfx('tap');
      minimizePartyRoom();
    } else if (act === 'copy-id') {
      if (typeof copyTextClean === 'function') copyTextClean(rm.shortId, 'Room ID');
      else toast('Room ID: ' + rm.shortId);
    } else if (act === 'open-more') {
      openPartyAppsMenuModal(rm, true);
    } else if (act === 'open-apps') {
      openPartyAppsMenuModal(rm, false);
    } else if (act === 'open-modes') {
      openPartyModeSelectorModal(rm);
    } else if (act === 'open-settings') {
      openPartySettingsModal(rm);
    } else if (act === 'open-music') {
      openPartyMusicModal(rm);
    } else if (act === 'open-studio') {
      openPartyStudioModal(rm);
    } else if (act === 'open-add-video') {
      openPartyAddVideoModal(rm);
    } else if (act === 'clear-video') {
      rm.youtubeId = '';
      persistPartyRoom(rm);
    } else if (act === 'drop-rp') {
      triggerPartyRedPacketDrop(rm);
    } else if (act === 'leave-seat') {
      partyLeaveMySeat(rm);
    } else if (act === 'toggle-speaker') {
      partySpeakerOn = !partySpeakerOn;
      RoomMusicEngine.syncSpeaker(partySpeakerOn);
      if (typeof playSfx === 'function') playSfx('tap');
      renderFullScreenPartyRoom();
    } else if (act === 'toggle-mic') {
      const myKey = findUserSeatKeyInRoom(rm, uid);
      if (myKey == null) {
        const maxSlots = rm.mode === 'video' ? 12 : (rm.mode === 'normal' ? 9 : 8);
        const locked = Array.isArray(rm.lockedSeats) ? rm.lockedSeats : [];
        const freeIdx = Array.from({ length: maxSlots }, (_, i) => i).find(i => i > 0 && !rm.seats[String(i)] && !locked.includes(i));
        if (freeIdx === undefined) return toast('All open guest seats are full');
        partyTakeOrSwitchSeat(rm, freeIdx);
      } else {
        const mp = rm.micPass || { active: false, queue: [], currentIdx: 0 };
        const activeUid = mp.active && mp.queue.length ? mp.queue[mp.currentIdx % mp.queue.length] : null;
        const tryingToUnmute = Boolean(rm.seats[myKey].muted);
        if (mp.active && tryingToUnmute && activeUid !== uid && !isRoomHostOrManager(rm)) {
          const spSeat = Object.values(rm.seats || {}).find(s => s && s.uid === activeUid);
          return toast(`🎙️ Wait for your turn — ${spSeat ? spSeat.name : 'another speaker'} holds the mic!`);
        }
        rm.seats[myKey].muted = !rm.seats[myKey].muted;
        rm.seats[myKey].speaking = !rm.seats[myKey].muted;
        if (typeof playSfx === 'function') playSfx('tap');
        persistPartyRoom(rm);
      }
    } else if (act === 'toggle-turn') {
      syncMicPassQueue(rm);
      if (!rm.micPass.active) {
        if (!rm.micPass.queue.length) return toast('Sit on a seat first to start Turn Mode');
        rm.micPass.active = true;
        rm.micPass.currentIdx = 0;
        rm.micPass.round = 1;
        rm.micPass.turnEndsAt = Date.now() + Number(rm.micPass.turnDurationSec || 25) * 1000;
        rm.chat = [...(rm.chat || []), { id: 'tm_' + Date.now().toString(36), type: 'sys', text: '🎙️ One-by-One Mic Pass started (25s/turn)', ts: Date.now() }].slice(-45);
        if (typeof playSfx === 'function') playSfx('turnStart');
      } else {
        rm.micPass.active = false;
        rm.micPass.turnEndsAt = 0;
        rm.chat = [...(rm.chat || []), { id: 'tm_' + Date.now().toString(36), type: 'sys', text: '🎙️ Switched to Free Open Mic', ts: Date.now() }].slice(-45);
        if (typeof playSfx === 'function') playSfx('tap');
      }
      persistPartyRoom(rm);
    } else if (act === 'pass-mic') {
      advancePartyMicTurn(rm, false);
    } else if (act === 'open-gift' || act === 'open-bond-gift') {
      if (typeof openGiftSendModal !== 'function') return;
      const otherSeat = Object.values(rm.seats || {}).find(s => s && s.uid !== uid);
      openGiftSendModal(otherSeat ? otherSeat.uid : null, {
        allowPickPlayer: true,
        targetName: otherSeat ? otherSeat.name : 'Player',
        preselectFilter: act === 'open-bond-gift' ? 'rings' : undefined,
        inPartyRoom: rm.id
      });
    } else if (act === 'send-chat') {
      sendPartyRoomChatMessage(rm, root);
    } else if (act === 'open-members') {
      const seatedList = Object.entries(normalizePartySeats(rm.seats)).sort((a, b) => Number(a[0]) - Number(b[0]));
      modal(`Active in ${esc(rm.title)} (${seatedList.length} Seated)`, `
        <div class="list" style="gap:8px">
          ${seatedList.map(([k, s]) => `
            <div class="row" style="gap:10px;padding:8px;border-radius:12px;background:rgba(255,255,255,.05)">
              ${av(s, 36)}
              <div class="mid"><b>${esc(s.name)}</b><small style="display:block;color:var(--mu)">${Number(k) === 0 ? 'Owner Seat' : `Seat ${k}`} · ${s.muted ? 'Muted' : 'Mic Live'}</small></div>
              <span class="chip">${s.uid === uid ? 'You' : 'Live'}</span>
            </div>
          `).join('')}
        </div>
      `);
    }
  });
}
