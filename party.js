"use strict";
/* =====================================================================
   FULL-SCREEN VOICE / PARTY ROOMS (v16)
   - Single Room Owner (hostUid) + Kick / Mute / Make-Remove Admin
   - 4 Special Mic Seats (0..3) + Listener-Only Members + WebRTC Audio Mesh
   - Synced YouTube Watch-Together State + Real HTML5 Audio Music Player
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

function isMicSeatIndex(idx) {
  return Number(idx) >= 0 && Number(idx) < MIC_SEAT_LIMIT;
}

function isSingleOwner(rm, targetUid = uid) {
  return Boolean(rm && rm.hostUid && rm.hostUid === targetUid);
}

function isRoomAdmin(rm, targetUid = uid) {
  if (!rm || !targetUid) return false;
  if (rm.hostUid === targetUid) return true;
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
  const mode = PARTY_MODES_META[rm.mode] ? rm.mode : (rm.youtubeId ? 'video' : 'normal');
  const background = PARTY_BG_META[rm.background] ? rm.background : 'club';
  const cover = PARTY_COVERS[rm.cover] ? rm.cover : 'cover_tensura';
  const seats = normalizePartySeats(rm.seats);
  const hostUid = rm.hostUid || (seats['0'] && seats['0'].uid) || uid;
  const admins = Array.isArray(rm.admins)
    ? [...new Set(rm.admins.filter(x => x && x !== hostUid))]
    : [];
  const videoSync = rm.videoSync && typeof rm.videoSync === 'object' ? {
    videoId: String(rm.videoSync.videoId || rm.youtubeId || ''),
    playing: Boolean(rm.videoSync.playing),
    seekSec: Math.max(0, Number(rm.videoSync.seekSec || 0)),
    updatedAt: Number(rm.videoSync.updatedAt || Date.now())
  } : {
    videoId: String(rm.youtubeId || ''),
    playing: false,
    seekSec: 0,
    updatedAt: Number(rm.updatedAt || Date.now())
  };

  return {
    ...rm,
    id: rm.id || ('pr_' + Date.now().toString(36)),
    shortId: rm.shortId || makeRoomShortId(rm.id),
    title: rm.title || 'Voice Lounge',
    tag: rm.tag || PARTY_MODES_META[mode].badge,
    cover,
    mode,
    background,
    hostUid,
    hostName: rm.hostName || (seats['0'] && seats['0'].name) || 'Owner',
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
    seats,
    chat: Array.isArray(rm.chat) ? rm.chat.slice(-45) : []
  };
}

function buildSeedPartyRooms() {
  const now = Date.now();
  return [
    normalizePartyRoom({
      id: 'pr_seed_tensura',
      shortId: '882410',
      title: 'Tensura Voice Lounge',
      tag: 'Friends',
      mode: 'normal',
      background: 'club',
      hostUid: 'bot_aria',
      hostName: 'Aria Nova',
      admins: [],
      seats: {
        '0': { uid: 'bot_aria', name: 'Aria Nova', avatar: 'av_g1', frame: 'fx_gold', muted: false, speaking: true, joinedAt: now - 40000 }
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
  partyRooms = partyRooms.map(normalizePartyRoom).filter(Boolean);
  if (!partyRooms.length && !partySeedsCleared()) {
    partyRooms = buildSeedPartyRooms();
    ls.set('sg_party_rooms', partyRooms);
  }
}

function isFakeOrStalePartyRoom(rm) {
  if (!rm || !rm.id) return true;
  const id = String(rm.id);
  const now = Date.now();
  if (id.startsWith('pr_seed_') || /^(seed_|fake_|test_)/i.test(id)) return true;
  if (rm.isSeed || rm.isFake || rm.isDemo) return true;
  if (rm.expiresAt && Number(rm.expiresAt) <= now) return true;
  const hostUid = String(rm.hostUid || '');
  const isBotHost = /^(bot_|demo_|fake_)/i.test(hostUid);
  const seats = Object.values(normalizePartySeats(rm.seats)).filter(Boolean);
  const realSeated = seats.filter(s => s && s.uid && !/^(bot_|demo_|fake_)/i.test(String(s.uid)));
  if (isBotHost && realSeated.length === 0) return true;
  if (seats.length === 0) return true;
  const ageMs = now - Number(rm.updatedAt || rm.createdAt || 0);
  if (ageMs > 2 * 60 * 60 * 1000 && realSeated.length === 0) return true;
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

  // Also scan Firestore party_rooms for any stale/seed/fake rooms
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
      if (typeof closePartyRoom === 'function') closePartyRoom();
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

/* ===== 4-User Peer-to-Peer WebRTC Audio Mesh (Mic Seats 0..3 -> Room Audio) ===== */
const PartyWebRtcMesh = (() => {
  let localStream = null;
  let roomKey = '';
  let signalUnsub = null;
  const seenSignalIds = new Set();
  const peers = new Map(); // remoteUid -> RTCPeerConnection
  const remoteAudios = new Map(); // remoteUid -> HTMLAudioElement
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
          // Clean up consumed signaling doc so subcollection stays tiny
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

    // Close connections for users no longer on active mic seats
    [...peers.keys()].forEach(pUid => {
      if (!micUids.includes(pUid)) {
        try { peers.get(pUid).close(); } catch {}
        peers.delete(pUid);
      }
    });

    if (!online || !db || !F || String(rm.id).startsWith('pr_seed_')) return;

    // Speakers initiate mesh with other speakers (lexicographic tie-break); Listeners initiate recv-only offer to active speakers
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

/* ===== Persistence & Hub Rendering ===== */
function savePartyRoomsLocal() {
  ls.set('sg_party_rooms', (partyRooms || []).slice(0, 24));
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
  PartyWebRtcMesh.syncMicPeers(room);
  renderPartyHub();
  if (activePartyRoomId === room.id) renderFullScreenPartyRoom();
}

function ingestPartyRooms(list) {
  const now = Date.now();
  const live = (Array.isArray(list) ? list : [])
    .filter(r => r && r.id && (!r.expiresAt || Number(r.expiresAt) > now))
    .map(normalizePartyRoom)
    .filter(Boolean)
    .filter(r => !(partySeedsCleared() && isFakeOrStalePartyRoom(r)));
  if (live.length) {
    const seeds = partySeedsCleared() ? [] : buildSeedPartyRooms().filter(s => !live.some(l => l.id === s.id));
    partyRooms = [...live, ...seeds].slice(0, 24);
  } else if (partySeedsCleared()) {
    partyRooms = (partyRooms || []).filter(r => !isFakeOrStalePartyRoom(r));
  }
  savePartyRoomsLocal();
  const curRoom = partyRooms.find(r => r.id === (activePartyRoomId || minimizedPartyRoomId));
  if (curRoom) {
    if (curRoom.kickedUids && curRoom.kickedUids.includes(uid) && !isSingleOwner(curRoom, uid)) {
      closePartyRoom();
      toast('You were removed from the room by Owner');
      return;
    }
    PartyWebRtcMesh.syncMicPeers(curRoom);
  }
  renderPartyHub();
  if (activePartyRoomId) renderFullScreenPartyRoom();
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

let partyMsgUnsub = null;
let partyMsgRoomId = '';
let partySubcolMsgs = [];
const partyDeletedMsgIds = new Set();

function unsubscribeRoomMessages() {
  if (partyMsgUnsub) {
    try { partyMsgUnsub(); } catch {}
    partyMsgUnsub = null;
  }
  partyMsgRoomId = '';
  partySubcolMsgs = [];
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
      ? F.query(col, F.orderBy('ts', 'asc'), F.limit(60))
      : col;
    partyMsgUnsub = F.onSnapshot(q, snap => {
      const next = [];
      snap.docs.forEach(d => {
        const data = d.data() || {};
        next.push({ ...data, id: data.id || d.id });
      });
      partySubcolMsgs = next;
      if (activePartyRoomId === roomId) renderFullScreenPartyRoom();
    }, () => {});
  } catch {}
}

function getMergedPartyMessages(rm) {
  const inlineMsgs = Array.isArray(rm?.chat) ? rm.chat : [];
  const subMsgs = (rm && rm.id === partyMsgRoomId) ? partySubcolMsgs : [];
  const deletedList = Array.from(partyDeletedMsgIds);
  if (window.ShowGamesRules && typeof window.ShowGamesRules.mergeRoomMessages === 'function') {
    return window.ShowGamesRules.mergeRoomMessages(inlineMsgs, subMsgs, deletedList).slice(-35);
  }
  const byId = new Map();
  [...inlineMsgs, ...subMsgs].forEach(m => {
    if (!m || !m.id || partyDeletedMsgIds.has(m.id)) return;
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
  const msg = {
    id: 'c_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6),
    type: 'text',
    uid,
    name: me.name || 'Player',
    text: String(txt).slice(0, 160),
    ts: Date.now()
  };
  rm.chat = [...(rm.chat || []), msg].slice(-45);
  if (rm.id === partyMsgRoomId) {
    partySubcolMsgs = [...partySubcolMsgs.filter(m => m.id !== msg.id), msg].slice(-60);
  }
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
  if (!String(rm.id).startsWith('pr_seed_') && online && db && F && typeof F.deleteDoc === 'function') {
    dbOp(() => F.deleteDoc(F.doc(db, 'party_rooms', rm.id, 'messages', msgId)));
  }
  persistPartyRoom(rm);
  toast('Message deleted');
}

function renderPartyHub() {
  const host = $('#homePartyRooms') || $('#partyRoomsHost');
  if (!host) return;
  const rooms = (partyRooms || []).slice(0, 8);
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
      const seated = Object.values(normalizePartySeats(rm.seats)).filter(Boolean);
      return `<button type="button" class="party-room-card glossy-card" data-openparty="${esc(rm.id)}" style="background:${bgMeta.css}">
        <div class="prc-top">
          <span class="prc-cat">${esc(rm.tag || modeMeta.badge)} · ${esc(modeMeta.name)}</span>
          <span class="prc-live">● ${seated.length} seated</span>
        </div>
        <div class="prc-title">${esc(rm.title)}</div>
        <div class="prc-foot">
          <span class="prc-host-lbl">Owner: ${esc(rm.hostName || 'Owner')} · ID ${esc(rm.shortId)}</span>
          <span class="prc-join">Enter →</span>
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
      title,
      tag: PARTY_MODES_META[mode].badge,
      mode,
      background,
      hostUid: uid,
      hostName: me.name || 'Player',
      admins: [],
      seats: {
        '0': { uid, name: me.name || 'Player', avatar: me.avatar || 'av_b1', frame: me.frame || 'fx_gold', muted: false, speaking: true, joinedAt: now }
      },
      chat: [{ id: 'sys_' + now, type: 'sys', text: `${me.name || 'Player'} opened room. Seats 0-3 = Mic (max 4), others = Listeners.`, ts: now }],
      createdAt: now,
      updatedAt: now
    });
    persistPartyRoom(room);
    m.close();
    openPartyRoom(id);
  };
}

function closePartyRoom() {
  activePartyRoomId = null;
  minimizedPartyRoomId = null;
  unsubscribeRoomMessages();
  PartyWebRtcMesh.cleanup();
  PartyAudioPlayer.stop();
  const root = document.getElementById('partyFsRoot');
  if (root) {
    root.classList.remove('open');
    root.hidden = true;
    root.innerHTML = '';
  }
  document.body.classList.remove('party-fs-lock');
  if (typeof setMyLiveActivity === 'function') {
    setMyLiveActivity({ type: 'online' });
  }
}

function openPartyRoom(roomId) {
  const room = partyRooms.find(r => r.id === roomId);
  if (!room) return toast('Room not found');
  if (room.kickedUids && room.kickedUids.includes(uid) && !isSingleOwner(room, uid)) {
    return toast('You cannot re-enter this room');
  }
  activePartyRoomId = roomId;
  minimizedPartyRoomId = null;
  const root = document.getElementById('partyFsRoot');
  if (!root) return;
  bindPartyRootDelegation(root);
  root.hidden = false;
  document.body.classList.add('party-fs-lock');
  requestAnimationFrame(() => root.classList.add('open'));
  subscribeRoomMessages(roomId);
  PartyWebRtcMesh.syncMicPeers(room);
  if (room.musicUrl) PartyAudioPlayer.playUrl(room.musicUrl, room.musicTitle);
  if (typeof setMyLiveActivity === 'function') {
    setMyLiveActivity({ type: 'party', roomId: room.id, roomCode: room.shortId || room.id, gameName: room.title || 'Voice Room' });
  }
  renderFullScreenPartyRoom();
}
window.openPartyRoomModal = openPartyRoom;

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

  return `<div class="pfs-seat-wrap compact">
    <button type="button" class="pfs-seat occupied compact ${speaking ? 'is-speaking' : ''} ${s.uid === uid ? 'is-me' : ''}" data-seat-idx="${idx}" data-seat-uid="${esc(s.uid)}">
      <div class="pfs-seat-ring">
        ${speaking ? '<span class="pfs-wave w1"></span>' : ''}
        ${av(s, 44)}
        <span class="pfs-mic-dot ${!micEligible ? 'muted' : (s.muted ? 'muted' : 'live')}">${!micEligible ? '👂' : (s.muted ? '🔇' : '🎙️')}</span>
      </div>
      <div class="pfs-seat-name">${esc(s.name || 'Player')}</div>
      <div class="pfs-seat-meta">
        ${isOwnerSeat ? '<span class="pfs-owner-tag">OWNER</span>' : (isAdm ? '<span class="pfs-role-chip">ADMIN</span>' : `<span class="pfs-seat-role">${roleTag}</span>`)}
      </div>
    </button>
    ${s.uid === uid ? `<button type="button" class="pfs-quick-leave" data-pfs-act="leave-seat">Leave</button>` : ''}
  </div>`;
}

function renderFullScreenPartyRoom() {
  const root = document.getElementById('partyFsRoot');
  if (!root || !activePartyRoomId) return;
  const rm = partyRooms.find(r => r.id === activePartyRoomId);
  if (!rm) { closePartyRoom(); return; }

  const bgMeta = PARTY_BG_META[rm.background] || PARTY_BG_META.club;
  const modeMeta = PARTY_MODES_META[rm.mode] || PARTY_MODES_META.normal;
  const mySeatKey = findUserSeatKeyInRoom(rm, uid);
  const mySeat = mySeatKey != null ? rm.seats[mySeatKey] : null;
  const canSpeak = mySeatKey != null && isMicSeatIndex(Number(mySeatKey));
  const vs = rm.videoSync || { videoId: rm.youtubeId || '', playing: false, seekSec: 0, updatedAt: Date.now() };
  const elapsedSec = vs.playing ? Math.floor((Date.now() - Number(vs.updatedAt || Date.now())) / 1000) : 0;
  const syncStart = Math.max(0, Number(vs.seekSec || 0) + elapsedSec);

  root.style.background = bgMeta.css;
  root.innerHTML = `
    <div class="pfs-shell pfs-v14">
      <header class="pfs-top-v14">
        <div class="pfs-hdr-left">
          <button type="button" class="pfs-hdr-btn" data-pfs-act="close" aria-label="Exit Room">←</button>
          <div class="pfs-hdr-meta">
            <div class="pfs-hdr-title-row">
              <b class="pfs-title">${esc(rm.title)}</b>
              <span class="pfs-tag-txt">· ${esc(modeMeta.name)}</span>
            </div>
            <div class="pfs-hdr-id-row">
              <span class="pfs-id-btn">Owner: ${esc(rm.hostName)} · ID ${esc(rm.shortId)}</span>
            </div>
          </div>
        </div>
        <div class="pfs-hdr-right">
          <button type="button" class="pfs-hdr-btn" data-pfs-act="open-invite" title="Invite Friends to Voice Room" aria-label="Invite to Room">👥</button>
          <button type="button" class="pfs-hdr-btn" data-pfs-act="minimize" title="Minimize">−</button>
          <button type="button" class="pfs-hdr-btn" data-pfs-act="open-music" title="Music">♪</button>
          <button type="button" class="pfs-hdr-btn" data-pfs-act="open-modes" title="Modes">⊞</button>
        </div>
      </header>

      <div class="pfs-subbar">
        <button type="button" class="pfs-music-pill ${rm.musicPlaying ? 'playing' : ''}" data-pfs-act="open-music">
          <span>♪</span>
          <span class="pfs-music-lbl">${esc(rm.musicTitle || (rm.musicUrl ? 'Audio Stream' : 'No Song'))}</span>
        </button>
        <div class="pfs-subbar-right">
          <button type="button" class="pfs-mode-chip" data-pfs-act="open-modes">${esc(modeMeta.name)} ▾</button>
          <span class="pfs-turn-chip">${canSpeak ? '🎙️ Mic Seat (0-3)' : '👂 Listener'}</span>
        </div>
      </div>

      <div class="pfs-main-scroll">
        ${rm.mode === 'video' ? `
          <div class="pfs-video-card">
            ${vs.videoId ? `
              <div class="pfs-yt-frame">
                <iframe src="https://www.youtube.com/embed/${esc(vs.videoId)}?autoplay=${vs.playing ? 1 : 0}&start=${syncStart}&rel=0" allow="autoplay; encrypted-media" allowfullscreen title="Synced Room Video"></iframe>
              </div>
              <div class="pfs-vid-bar">
                <span>${vs.playing ? '▶ Synced Play' : '⏸ Paused'} · ${syncStart}s</span>
                <div class="row" style="gap:5px">
                  <button type="button" class="btn sm ok" data-vid-sync="toggle">${vs.playing ? 'Pause All' : 'Play All'}</button>
                  <button type="button" class="btn sm ghost" data-pfs-act="open-add-video">Change</button>
                </div>
              </div>
            ` : `
              <div class="pfs-vid-empty">
                <b>Watch Together Stage</b>
                <small>Add a YouTube link to sync across room</small>
                <button type="button" class="btn gold sm" style="margin-top:6px" data-pfs-act="open-add-video">+ Add Video</button>
              </div>
            `}
          </div>
        ` : ''}

        <div class="pfs-stage">
          <div class="pfs-owner-solo">${renderSeatTile(rm, 0)}</div>
          <div class="pfs-seats-4col">
            ${[1, 2, 3, 4, 5, 6, 7, 8].map(i => renderSeatTile(rm, i)).join('')}
          </div>
        </div>

        <div class="pfs-react-dock">
          ${PARTY_REACTIONS.map(em => `<button type="button" class="pfs-react-btn" data-react="${em}">${em}</button>`).join('')}
        </div>

        <div class="pfs-chat-feed" id="pfsChatFeed">
          ${getMergedPartyMessages(rm).slice(-24).map(c => {
            if (c.type === 'sys') return `<div class="pfs-msg sys">${esc(c.text)}</div>`;
            const canDel = canDeletePartyMessage(c);
            return `<div class="pfs-msg pfs-msg-row" data-pmsg-id="${esc(c.id)}">
              <div class="pfs-msg-body"><b>${esc(c.name)}:</b> <span>${esc(c.text)}</span></div>
              ${canDel ? `<button type="button" class="pfs-msg-del" data-del-pmsg="${esc(c.id)}" title="Delete message" aria-label="Delete message">🗑️</button>` : ''}
            </div>`;
          }).join('')}
        </div>
      </div>

      <div class="pfs-dock pfs-dock-v14">
        <button type="button" class="pfs-dock-ico ${partySpeakerOn ? 'on' : 'off'}" data-pfs-act="toggle-speaker">${partySpeakerOn ? '🔊' : '🔈'}</button>
        <button type="button" class="pfs-dock-ico ${canSpeak ? (mySeat.muted ? 'muted' : 'live') : 'muted'}" data-pfs-act="toggle-mic">
          ${!canSpeak ? '👂' : (mySeat.muted ? '🔇' : '🎙️')}
        </button>
        <input id="pfsChatIn" maxlength="160" placeholder="Type message..." autocomplete="off">
        <button type="button" class="pfs-dock-send" data-pfs-act="send-chat">➤</button>
        <button type="button" class="pfs-dock-ico gift" data-pfs-act="open-gift">🎁</button>
        <button type="button" class="pfs-dock-ico apps" data-pfs-act="open-music">♪</button>
      </div>
    </div>
  `;
  const feed = $('#pfsChatFeed', root);
  if (feed) feed.scrollTop = feed.scrollHeight;
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
    joinedAt: Date.now()
  };
  rm.seats = nextSeats;
  if (canSpeak) PartyWebRtcMesh.enableMic(true);
  else PartyWebRtcMesh.setMicMuted(true);
  persistPartyRoom(rm);
}

function partyLeaveSeat(rm) {
  if (!rm) return;
  const nextSeats = {};
  Object.keys(rm.seats || {}).forEach(k => {
    if (rm.seats[k] && rm.seats[k].uid !== uid) nextSeats[k] = rm.seats[k];
  });
  rm.seats = nextSeats;
  PartyWebRtcMesh.setMicMuted(true);
  persistPartyRoom(rm);
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
    rm.kickedUids = [...new Set([...(rm.kickedUids || []), s.uid])];
    rm.chat = [...(rm.chat || []), { id: 'k_' + Date.now().toString(36), type: 'sys', text: `${s.name} was removed by ${me.name}`, ts: Date.now() }].slice(-45);
    persistPartyRoom(rm);
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
  const m = modal('Synced YouTube Video', `
    <label for="pvIn">YouTube Link or Video ID</label>
    <input id="pvIn" placeholder="https://youtu.be/..." value="${esc(rm.videoSync?.videoId || rm.youtubeId || '')}">
    <button type="button" class="btn gold full" id="pvGo" style="margin-top:10px">Sync Video For Room</button>
  `);
  $('#pvGo', m).onclick = () => {
    const vid = parseYouTubeVideoId($('#pvIn', m).value || '');
    if (!vid) return toast('Enter a valid YouTube link or ID');
    rm.mode = 'video';
    rm.youtubeId = vid;
    rm.videoSync = { videoId: vid, playing: true, seekSec: 0, updatedAt: Date.now() };
    rm.chat = [...(rm.chat || []), { id: 'vs_' + Date.now().toString(36), type: 'sys', text: `${me.name} synced a YouTube video for the room`, ts: Date.now() }].slice(-45);
    persistPartyRoom(rm);
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

    const sit = e.target.closest('[data-sit]');
    if (sit) { partyTakeSeat(rm, Number(sit.dataset.sit)); return; }

    const occ = e.target.closest('[data-seat-uid]');
    if (occ) { openSeatModModal(rm, Number(occ.dataset.seatIdx)); return; }

    const vidSyncBtn = e.target.closest('[data-vid-sync]');
    if (vidSyncBtn) {
      const vs = rm.videoSync || { videoId: rm.youtubeId || '', playing: false, seekSec: 0, updatedAt: Date.now() };
      const curSec = vs.playing ? Math.max(0, Number(vs.seekSec || 0) + Math.floor((Date.now() - Number(vs.updatedAt || Date.now())) / 1000)) : Number(vs.seekSec || 0);
      const nextPlaying = !vs.playing;
      rm.videoSync = { ...vs, playing: nextPlaying, seekSec: curSec, updatedAt: Date.now() };
      rm.chat = [...(rm.chat || []), { id: 'vs_' + Date.now().toString(36), type: 'sys', text: `${me.name} ${nextPlaying ? 'played' : 'paused'} video at ${curSec}s`, ts: Date.now() }].slice(-45);
      persistPartyRoom(rm);
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

    if (act === 'close') {
      closePartyRoom();
    } else if (act === 'minimize') {
      minimizedPartyRoomId = rm.id;
      activePartyRoomId = null;
      unsubscribeRoomMessages();
      root.classList.remove('open');
      root.hidden = true;
      document.body.classList.remove('party-fs-lock');
      toast('Room minimized');
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
