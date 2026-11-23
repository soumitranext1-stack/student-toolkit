"use strict";
/* ===== Study Game Party Rooms, VR 3D Hangout Lounges, Synchronized YouTube Watch-Together, Live Reactions & Wedding Rooms ===== */

const PARTY_THEMES = {
  neon_cinema: { name: 'Neon Rooftop Cinema', bg: 'linear-gradient(155deg,#070d1f,#17133a 52%,#0c2745)', accent: '#38bdf8', floor: 'rgba(56,189,248,.22)', emoji: '🎬' },
  luxury_yacht: { name: 'Luxury Yacht Deck', bg: 'linear-gradient(155deg,#061826,#0c3547 52%,#164e63)', accent: '#2dd4bf', floor: 'rgba(45,212,191,.22)', emoji: '🛥️' },
  cyber_arena: { name: 'Cyber Arena Stage', bg: 'linear-gradient(155deg,#120726,#2d0f54 52%,#4c1d95)', accent: '#c084fc', floor: 'rgba(192,132,252,.22)', emoji: '🎮' },
  wedding_stage: { name: 'Golden Floral Wedding Stage', bg: 'linear-gradient(155deg,#2a0b1d,#5b1634 48%,#78350f)', accent: '#ffd36b', floor: 'rgba(255,211,107,.28)', emoji: '💍' }
};

const PARTY_CATEGORIES = [
  'Chill Lounge',
  'Movie & YouTube Cinema',
  'VR Penthouse Lounge',
  'Squad Hangout',
  '1v1 Arena',
  'Wedding Room'
];

const SEAT_REACTIONS = ['😂', '😭', '❤️', '🔥', '😱', '🥳', '👏'];
const SEAT_STATUSES = ['Vibing', 'Watching', 'Laughing', 'Gaming', 'AFK'];

let partyRooms = ls.get('sg_party_rooms_cache', []);
if (!Array.isArray(partyRooms)) partyRooms = [];
let activePartyRoomId = null;
let activePartyModal = null;

function parseYouTubeId(input) {
  const s = String(input || '').trim();
  if (!s) return '';
  if (/^[a-zA-Z0-9_-]{11}$/.test(s)) return s;
  const m = s.match(/(?:youtube\.com\/(?:watch\?.*v=|embed\/|shorts\/|live\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : '';
}

function getDefaultPartyRooms() {
  return [
    {
      id: 'pr_lobby_cinema',
      title: 'Midnight Rooftop YouTube Cinema',
      category: 'Movie & YouTube Cinema',
      theme: 'neon_cinema',
      hostUid: 'SYSTEM_HOST',
      hostName: 'Arena Host',
      password: '',
      featured: true,
      ytVideoId: 'jfKfPfyJRdk',
      ytPlaying: true,
      ytTime: 0,
      seats: {},
      messages: [{ id: 'pm0', uid: 'SYSTEM', name: 'Arena Host', text: 'Welcome to the Synchronized YouTube Watch Lounge! Take a seat & tap reactions.', ts: Date.now() }],
      createdAt: Date.now(),
      updatedAt: Date.now()
    },
    {
      id: 'pr_lobby_yacht',
      title: 'VIP Yacht Chill & Music Deck',
      category: 'VR Penthouse Lounge',
      theme: 'luxury_yacht',
      hostUid: 'SYSTEM_HOST',
      hostName: 'VIP Lounge',
      password: '',
      featured: false,
      ytVideoId: '',
      ytPlaying: false,
      ytTime: 0,
      seats: {},
      messages: [{ id: 'pm1', uid: 'SYSTEM', name: 'VIP Lounge', text: 'Grab a glowing pedestal seat, send luxury gifts & vibe with your squad!', ts: Date.now() }],
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
  ];
}

function getAllPartyRooms() {
  const map = new Map();
  getDefaultPartyRooms().forEach(r => map.set(r.id, r));
  (partyRooms || []).forEach(r => { if (r && r.id) map.set(r.id, r); });
  return [...map.values()].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || (b.isWedding ? 1 : 0) - (a.isWedding ? 1 : 0) || Number(b.updatedAt || 0) - Number(a.updatedAt || 0));
}

function ingestPartyRooms(list) {
  if (!Array.isArray(list)) return;
  partyRooms = list;
  ls.set('sg_party_rooms_cache', partyRooms);
  renderPartyHub();
  if (activePartyRoomId && activePartyModal) {
    renderPartyRoomStage(activePartyRoomId, activePartyModal);
  }
}

function savePartyRoom(rm) {
  rm.updatedAt = Date.now();
  const idx = partyRooms.findIndex(x => x.id === rm.id);
  if (idx >= 0) partyRooms[idx] = rm;
  else partyRooms.unshift(rm);
  ls.set('sg_party_rooms_cache', partyRooms);
  dbOp(() => F.setDoc(F.doc(db, 'party_rooms', rm.id), rm, { merge: true }));
  renderPartyHub();
}

function createWeddingPartyRoom(partnerUid, partnerName, days, ringName) {
  const durDays = Math.max(3, Number(days || 3));
  const id = 'pr_wed_' + Date.now().toString(36);
  const rm = {
    id,
    title: `💍 ${me.name || 'Player'} & ${partnerName || 'Partner'}'s Grand Wedding`,
    category: 'Wedding Room',
    theme: 'wedding_stage',
    hostUid: uid,
    hostName: me.name || 'Player',
    partnerUid,
    partnerName: partnerName || 'Partner',
    ringName: ringName || 'Couple Ring',
    isWedding: true,
    featured: true,
    password: '',
    expiresAt: Date.now() + durDays * 86400000,
    ytVideoId: '',
    ytPlaying: false,
    ytTime: 0,
    seats: {
      '0': { uid, name: me.name || 'Player', avatar: me.avatar || 'av_g1', frame: me.frame || 'none', vipTier: getActiveVipTier(me), status: 'Celebrating 💍', role: 'Couple' },
      '1': { uid: partnerUid, name: partnerName || 'Partner', avatar: 'av_b1', frame: 'none', status: 'Celebrating 💍', role: 'Couple' }
    },
    messages: [{ id: 'wm0', uid: 'SYSTEM', name: 'Wedding Host', text: `💍 Grand ${durDays}-Day Wedding Room unlocked with ${ringName}! Send blessings & gifts!`, ts: Date.now() }],
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  savePartyRoom(rm);
  return rm;
}

function appendPartyRoomGift(roomId, evObj) {
  const rm = getAllPartyRooms().find(r => r.id === roomId);
  if (!rm) return;
  rm.messages = [...(rm.messages || []), {
    id: 'pg_' + evObj.id,
    type: 'gift',
    uid: evObj.fromUid,
    name: evObj.fromName,
    text: `🎁 Sent ${evObj.giftName} x${evObj.qty} to ${evObj.toName} (+${fmtNum(evObj.charm)} Charm)!`,
    ts: Date.now()
  }].slice(-40);
  savePartyRoom(rm);
  if (activePartyRoomId === roomId && activePartyModal) renderPartyRoomStage(roomId, activePartyModal);
}

let partyFilterTab = 'all';

function partyRoomCoverSvg(themeKey, isWedding) {
  if (isWedding || themeKey === 'wedding_stage') {
    return `<svg viewBox="0 0 64 64" fill="none" aria-hidden="true"><defs><linearGradient id="rcW" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#f472b6"/><stop offset="100%" stop-color="#9d174d"/></linearGradient></defs><rect width="64" height="64" rx="14" fill="url(#rcW)"/><circle cx="26" cy="36" r="11" stroke="#fef08a" stroke-width="3.6"/><circle cx="38" cy="36" r="11" stroke="#fff" stroke-width="3.6"/><polygon points="32,12 38,20 32,27 26,20" fill="#fff"/></svg>`;
  }
  if (themeKey === 'luxury_yacht') {
    return `<svg viewBox="0 0 64 64" fill="none" aria-hidden="true"><defs><linearGradient id="rcY" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#06b6d4"/><stop offset="100%" stop-color="#1e3a8a"/></linearGradient></defs><rect width="64" height="64" rx="14" fill="url(#rcY)"/><path d="M12 41h40l-6 10H18l-6-10z" fill="#fff"/><polygon points="30,14 30,38 15,38" fill="#fef08a"/><polygon points="34,19 34,38 49,38" fill="#67e8f9"/></svg>`;
  }
  if (themeKey === 'cyber_arena') {
    return `<svg viewBox="0 0 64 64" fill="none" aria-hidden="true"><defs><linearGradient id="rcA" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#8b5cf6"/><stop offset="100%" stop-color="#4c1d95"/></linearGradient></defs><rect width="64" height="64" rx="14" fill="url(#rcA)"/><rect x="13" y="21" width="38" height="22" rx="9" fill="#fff" fill-opacity=".92"/><path d="M21 32h8M25 28v8" stroke="#6d28d9" stroke-width="3" stroke-linecap="round"/><circle cx="39" cy="30" r="2.6" fill="#ec4899"/><circle cx="43" cy="34" r="2.6" fill="#06b6d4"/></svg>`;
  }
  return `<svg viewBox="0 0 64 64" fill="none" aria-hidden="true"><defs><linearGradient id="rcC" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#3b82f6"/><stop offset="100%" stop-color="#1e1b4b"/></linearGradient></defs><rect width="64" height="64" rx="14" fill="url(#rcC)"/><rect x="12" y="17" width="40" height="26" rx="7" fill="#0f172a" stroke="#7dd3fc" stroke-width="2"/><polygon points="28,24 40,30 28,36" fill="#fef08a"/><rect x="20" y="47" width="24" height="3.5" rx="1.7" fill="#7dd3fc"/></svg>`;
}

function matchPartyFilter(rm, tab) {
  if (tab === 'all') return true;
  const cat = String(rm.category || '').toLowerCase();
  const title = String(rm.title || '').toLowerCase();
  if (tab === 'friends') return rm.hostUid === uid || (Array.isArray(me.friends) && me.friends.includes(rm.hostUid)) || Boolean(rm.isWedding);
  if (tab === 'games') return cat.includes('arena') || cat.includes('squad') || rm.theme === 'cyber_arena';
  if (tab === 'music') return cat.includes('movie') || cat.includes('youtube') || title.includes('music') || Boolean(rm.ytVideoId);
  if (tab === 'chat') return cat.includes('chill') || cat.includes('lounge') || cat.includes('wedding');
  return true;
}

function shortRoomTag(rm) {
  if (rm.isWedding) return { lbl: 'Wedding', cls: 'pink' };
  const c = String(rm.category || '').toLowerCase();
  if (c.includes('movie') || c.includes('youtube')) return { lbl: 'Music', cls: 'cyan' };
  if (c.includes('arena') || c.includes('squad')) return { lbl: 'Games', cls: 'violet' };
  if (c.includes('penthouse')) return { lbl: 'VIP', cls: 'amber' };
  return { lbl: 'Chat', cls: 'emerald' };
}

function renderPartyHub() {
  const wrap = $('#homePartyRooms');
  if (!wrap) return;
  const allList = getAllPartyRooms();
  const filtered = allList.filter(r => matchPartyFilter(r, partyFilterTab)).slice(0, 8);
  const gSvg = typeof GLOSSY_SVG !== 'undefined' ? GLOSSY_SVG : null;

  const tabs = [
    ['all', 'All'],
    ['friends', 'Friends'],
    ['games', 'Games'],
    ['music', 'Music'],
    ['chat', 'Chat']
  ];

  const rows = filtered.map(rm => {
    const seatCount = Math.max(1, Object.keys(rm.seats || {}).length);
    const tag = shortRoomTag(rm);
    const wedRem = rm.isWedding && rm.expiresAt ? formatCountdownMs(rm.expiresAt - Date.now()) : '';
    const badges = gSvg
      ? `${gSvg.badge(rm.isWedding ? 'heart_guard' : (rm.ytVideoId ? 'mic_pro' : 'gold_star'))}${gSvg.badge('crown_vip')}`
      : '';
    return `<button type="button" class="wp-room-row" data-open-party="${esc(rm.id)}">
      <div class="wp-rr-cover">${partyRoomCoverSvg(rm.theme, rm.isWedding)}${rm.password ? '<span class="wp-rr-lock">🔒</span>' : ''}</div>
      <div class="wp-rr-mid">
        <b class="wp-rr-title">${esc(rm.title)}</b>
        <div class="wp-rr-meta">
          <span class="wp-tag-pill ${tag.cls}">${esc(tag.lbl)}</span>
          <span class="wp-rr-cnt">👤 ${seatCount}</span>
          ${rm.ytVideoId ? '<span class="wp-rr-yt">▶ YT</span>' : ''}
        </div>
      </div>
      <div class="wp-rr-right">
        <div class="wp-rr-badges">${badges}</div>
        <span class="wp-rr-live">${wedRem || 'Live'}</span>
      </div>
    </button>`;
  }).join('') || `<div class="empty" style="padding:16px">No rooms in this tab</div>`;

  wrap.innerHTML = `
    <div class="wp-sec-bar">
      <b>Party Rooms</b>
      <button type="button" class="wp-pill-btn gold" id="openCreatePartyBtn">+ Room</button>
    </div>
    <div class="wp-filter-tabs" id="partyFilterTabs" role="tablist">
      ${tabs.map(([k, lbl]) => `<button type="button" class="wp-ftab ${partyFilterTab === k ? 'on' : ''}" data-pf="${k}">${lbl}</button>`).join('')}
    </div>
    <div class="wp-room-list">${rows}</div>
  `;
  const createBtn = $('#openCreatePartyBtn', wrap);
  if (createBtn) createBtn.onclick = openCreatePartyRoomModal;
  const fbar = $('#partyFilterTabs', wrap);
  if (fbar) {
    fbar.onclick = e => {
      const b = e.target.closest('[data-pf]');
      if (!b) return;
      partyFilterTab = b.dataset.pf;
      renderPartyHub();
    };
  }
}

function openCreatePartyRoomModal() {
  if (typeof isMutedNow === 'function' && isMutedNow()) return toast('You are muted for ' + muteRemainingText());
  const m = modal('Create Party Room / Watch Lounge', `
    <label>Room Name</label>
    <input id="cprTitle" maxlength="44" placeholder="e.g. Late Night YouTube Cinema">
    <label style="margin-top:8px">Category</label>
    <select id="cprCat">${PARTY_CATEGORIES.filter(c => c !== 'Wedding Room').map(c => `<option value="${esc(c)}">${esc(c)}</option>`).join('')}</select>
    <label style="margin-top:8px">VR 3D Room Theme</label>
    <select id="cprTheme">${Object.entries(PARTY_THEMES).map(([k, v]) => `<option value="${k}">${v.emoji} ${esc(v.name)}</option>`).join('')}</select>
    <label style="margin-top:8px">YouTube Video URL (Optional — Watch Together)</label>
    <input id="cprYt" placeholder="Paste YouTube link or video ID...">
    <label style="margin-top:8px">Room Password (Optional — Leave blank for Public)</label>
    <input id="cprPass" maxlength="16" placeholder="Public room if empty">
    <button type="button" class="btn gold full" id="cprGo" style="margin-top:12px">Launch Party Room</button>
  `);
  $('#cprGo', m).onclick = () => {
    const title = $('#cprTitle', m).value.trim() || `${me.name || 'Player'}'s Party Lounge`;
    const ytId = parseYouTubeId($('#cprYt', m).value);
    const id = 'pr_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
    const rm = {
      id,
      title,
      category: $('#cprCat', m).value,
      theme: $('#cprTheme', m).value,
      hostUid: uid,
      hostName: me.name || 'Player',
      password: $('#cprPass', m).value.trim(),
      featured: false,
      ytVideoId: ytId,
      ytPlaying: Boolean(ytId),
      ytTime: 0,
      seats: {
        '0': { uid, name: me.name || 'Player', avatar: me.avatar || 'av_b1', frame: me.frame || 'none', vipTier: getActiveVipTier(me), status: ytId ? 'Watching' : 'Vibing', role: 'Host' }
      },
      messages: [{ id: 'm0', uid: 'SYSTEM', name: 'Room Host', text: `${me.name || 'Player'} launched the room! Take a seat & enjoy.`, ts: Date.now() }],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    bumpStat('rooms_hosted');
    bumpStat('party_join');
    savePartyRoom(rm);
    m.close();
    openPartyRoom(id);
  };
}

function triggerFloatingReaction(modalEl, seatIndex, emoji) {
  const seatEl = modalEl && modalEl.querySelector(`[data-seat-idx="${seatIndex}"]`);
  if (!seatEl) return;
  const f = document.createElement('span');
  f.className = 'vr-float-emoji';
  f.textContent = emoji;
  seatEl.appendChild(f);
  setTimeout(() => f.remove(), 1450);
}

function openPartyRoom(roomId) {
  const rm = getAllPartyRooms().find(r => r.id === roomId);
  if (!rm) return toast('Party Room not found');
  if (rm.password && rm.hostUid !== uid && !devMode) {
    const entered = prompt('Enter Party Room password:');
    if (entered !== rm.password) return toast('Incorrect password');
  }
  bumpStat('party_join');
  if (rm.ytVideoId) bumpStat('watch_together');
  if (typeof showVipEntranceBanner === 'function') showVipEntranceBanner(me, rm.title);

  activePartyRoomId = roomId;
  const m = modal(rm.title, `<div id="partyStageRoot"></div>`, 'party-stage-sheet');
  activePartyModal = m;
  m.onclose = () => {
    if (activePartyRoomId === roomId) {
      activePartyRoomId = null;
      activePartyModal = null;
    }
  };
  renderPartyRoomStage(roomId, m);
}

function renderPartyRoomStage(roomId, m) {
  const rm = getAllPartyRooms().find(r => r.id === roomId);
  const root = $('#partyStageRoot', m);
  if (!rm || !root) return;
  const th = PARTY_THEMES[rm.theme] || PARTY_THEMES.neon_cinema;
  const isHost = rm.hostUid === uid || devMode || rm.hostUid === 'SYSTEM_HOST';
  const seats = rm.seats && typeof rm.seats === 'object' ? rm.seats : {};
  const mySeatIdx = Object.keys(seats).find(k => seats[k] && seats[k].uid === uid);
  const wedCountdown = rm.isWedding && rm.expiresAt ? `<div class="wed-countdown-bar">💍 Grand Wedding Room · Expires in <b>${formatCountdownMs(rm.expiresAt - Date.now())}</b></div>` : '';

  const ytMarkup = rm.ytVideoId
    ? `<div class="yt-cinema-frame">
        <iframe src="https://www.youtube-nocookie.com/embed/${esc(rm.ytVideoId)}?autoplay=${rm.ytPlaying ? 1 : 0}&rel=0&modestbranding=1" title="YouTube Watch Together" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
      </div>`
    : `<div class="yt-cinema-empty">
        <div>🎬 <b>Watch YouTube Together</b></div>
        <small>Paste any YouTube link below to stream synchronized with everyone in the room.</small>
      </div>`;

  const seatCards = Array.from({ length: 8 }, (_, idx) => {
    const occ = seats[String(idx)];
    if (!occ) {
      return `<button type="button" class="vr-seat empty" data-seat-idx="${idx}">
        <span class="vr-pedestal-ring">+</span>
        <small>Seat ${idx + 1}</small>
      </button>`;
    }
    const isVip = Boolean(occ.vipTier);
    const hasReact = occ.lastReaction && (Date.now() - Number(occ.reactionTs || 0)) < 6000;
    return `<div class="vr-seat occupied ${isVip ? 'vip-seat' : ''} ${occ.uid === uid ? 'mine' : ''}" data-seat-idx="${idx}" data-seat-uid="${esc(occ.uid)}">
      ${hasReact ? `<span class="vr-seat-react-badge">${esc(occ.lastReaction)}</span>` : ''}
      <div class="vr-seat-av">${av({ avatar: occ.avatar || 'av_b1', frame: occ.frame || 'none' }, 44)}</div>
      <b class="vr-seat-name">${esc(occ.name || 'Player')}</b>
      <span class="vr-seat-tag">${esc(occ.status || 'Vibing')}</span>
    </div>`;
  }).join('');

  const msgsHtml = (rm.messages || []).slice(-18).map(msg => `
    <div class="pr-msg ${msg.type === 'gift' ? 'gift' : ''}">
      <b data-pr-prof="${esc(msg.uid || '')}">${esc(msg.name || 'Player')}:</b> <span>${esc(msg.text || '')}</span>
    </div>
  `).join('');

  root.innerHTML = `
    <div class="vr-stage-shell" style="background:${th.bg};border-color:${th.accent}55">
      <div class="vr-stage-head">
        <div>
          <span class="prc-cat" style="color:${th.accent}">${th.emoji} ${esc(th.name)}</span>
          ${rm.featured ? `<span class="vip-pill vip-gold" style="margin-left:6px">FEATURED</span>` : ''}
        </div>
        <div class="row" style="gap:6px">
          <button type="button" class="btn ghost sm" id="prReportBtn">🚩</button>
          ${devMode ? `<button type="button" class="btn red sm" id="prDevClose">Close Room</button>` : ''}
        </div>
      </div>
      ${wedCountdown}
      <div class="vr-cinema-wrap">
        ${ytMarkup}
        ${isHost ? `<div class="row" style="gap:6px;margin-top:8px">
          <input id="prYtInput" placeholder="Paste YouTube URL to sync..." value="${esc(rm.ytVideoId || '')}" style="flex:1;padding:7px 10px;font-size:12px">
          <button type="button" class="btn sm gold" id="prYtLoad">Sync Video</button>
          ${rm.ytVideoId ? `<button type="button" class="btn sm ghost" id="prYtToggle">${rm.ytPlaying ? '⏸ Pause' : '▶ Play'}</button>` : ''}
        </div>` : ''}
      </div>

      <div class="vr-floor-stage" style="--vr-floor:${th.floor}">
        <div class="vr-seats-grid">${seatCards}</div>
      </div>

      <div class="vr-react-bar">
        ${SEAT_REACTIONS.map(em => `<button type="button" class="vr-react-btn" data-vr-react="${em}">${em}</button>`).join('')}
        <select id="prStatusSel" class="vr-status-sel" aria-label="Seat status">
          ${SEAT_STATUSES.map(st => `<option value="${st}" ${mySeatIdx && seats[mySeatIdx]?.status === st ? 'selected' : ''}>${st}</option>`).join('')}
        </select>
      </div>

      <div class="pr-chat-box" id="prChatBox">${msgsHtml}</div>

      <div class="row" style="gap:6px;margin-top:8px">
        <input id="prChatIn" maxlength="160" placeholder="Say something in room..." style="flex:1">
        <button type="button" class="btn sm" id="prChatSend">Send</button>
        <button type="button" class="btn gold sm" id="prGiftBtn">🎁 Gift</button>
        ${mySeatIdx !== undefined ? `<button type="button" class="btn ghost sm" id="prLeaveSeat">Stand Up</button>` : ''}
      </div>
    </div>
  `;

  const chatBox = $('#prChatBox', root);
  if (chatBox) chatBox.scrollTop = chatBox.scrollHeight;

  /* Bind Seat Click (Take Seat or Inspect Seated Player) */
  $$('.vr-seat', root).forEach(seatEl => {
    seatEl.onclick = () => {
      const idx = seatEl.dataset.seatIdx;
      const occ = seats[idx];
      if (occ) {
        if (occ.uid && occ.uid !== uid) openPublicProfile(occ.uid);
        return;
      }
      const nextSeats = { ...seats };
      Object.keys(nextSeats).forEach(k => { if (nextSeats[k] && nextSeats[k].uid === uid) delete nextSeats[k]; });
      nextSeats[idx] = {
        uid,
        name: me.name || 'Player',
        avatar: me.avatar || 'av_b1',
        frame: me.frame || 'none',
        vipTier: getActiveVipTier(me),
        status: rm.ytVideoId ? 'Watching' : 'Vibing',
        ts: Date.now()
      };
      rm.seats = nextSeats;
      savePartyRoom(rm);
      if (typeof playSfx === 'function') playSfx('reactionPop');
      renderPartyRoomStage(roomId, m);
    };
  });

  /* Live Seat Reactions */
  $$('[data-vr-react]', root).forEach(btn => {
    btn.onclick = () => {
      const em = btn.dataset.vrReact;
      const sIdx = Object.keys(seats).find(k => seats[k] && seats[k].uid === uid) || '0';
      if (seats[sIdx] && seats[sIdx].uid === uid) {
        seats[sIdx].lastReaction = em;
        seats[sIdx].reactionTs = Date.now();
        rm.seats = seats;
      }
      rm.messages = [...(rm.messages || []), { id: 'rx_' + Date.now(), uid, name: me.name || 'Player', text: `reacted ${em}`, ts: Date.now() }].slice(-40);
      bumpStat('party_react');
      savePartyRoom(rm);
      if (typeof playSfx === 'function') playSfx('reactionPop');
      triggerFloatingReaction(m, sIdx, em);
      renderPartyRoomStage(roomId, m);
    };
  });

  if ($('#prStatusSel', root)) {
    $('#prStatusSel', root).onchange = e => {
      if (mySeatIdx === undefined) return toast('Take a seat first to set your status!');
      seats[mySeatIdx].status = e.target.value;
      rm.seats = seats;
      savePartyRoom(rm);
      renderPartyRoomStage(roomId, m);
    };
  }

  if ($('#prLeaveSeat', root)) {
    $('#prLeaveSeat', root).onclick = () => {
      const nextSeats = { ...seats };
      Object.keys(nextSeats).forEach(k => { if (nextSeats[k] && nextSeats[k].uid === uid) delete nextSeats[k]; });
      rm.seats = nextSeats;
      savePartyRoom(rm);
      renderPartyRoomStage(roomId, m);
    };
  }

  if ($('#prYtLoad', root)) {
    $('#prYtLoad', root).onclick = () => {
      const vid = parseYouTubeId($('#prYtInput', root).value);
      if (!vid) return toast('Paste a valid YouTube URL or 11-char video ID');
      rm.ytVideoId = vid;
      rm.ytPlaying = true;
      bumpStat('watch_together');
      rm.messages = [...(rm.messages || []), { id: 'yt_' + Date.now(), uid: 'SYSTEM', name: 'Cinema', text: `${me.name || 'Host'} loaded a YouTube video for Watch Together!`, ts: Date.now() }].slice(-40);
      savePartyRoom(rm);
      renderPartyRoomStage(roomId, m);
    };
  }
  if ($('#prYtToggle', root)) {
    $('#prYtToggle', root).onclick = () => {
      rm.ytPlaying = !rm.ytPlaying;
      savePartyRoom(rm);
      renderPartyRoomStage(roomId, m);
    };
  }

  const sendRoomChat = () => {
    if (typeof isMutedNow === 'function' && isMutedNow()) return toast('You are muted for ' + muteRemainingText());
    const inp = $('#prChatIn', root);
    const txt = (inp.value || '').trim();
    if (!txt) return;
    inp.value = '';
    rm.messages = [...(rm.messages || []), { id: 'm_' + Date.now(), uid, name: me.name || 'Player', text: txt.slice(0, 160), ts: Date.now() }].slice(-40);
    savePartyRoom(rm);
    if (typeof playSfx === 'function') playSfx('chatSend');
    renderPartyRoomStage(roomId, m);
  };
  $('#prChatSend', root).onclick = sendRoomChat;
  $('#prChatIn', root).onkeydown = e => { if (e.key === 'Enter') sendRoomChat(); };

  $('#prGiftBtn', root).onclick = () => {
    const seatedOther = Object.values(seats).find(s => s && s.uid && s.uid !== uid);
    if (typeof openGiftSendModal === 'function') {
      openGiftSendModal(seatedOther ? seatedOther.uid : '', { allowPickPlayer: true, inPartyRoom: roomId });
    }
  };

  $('#prReportBtn', root).onclick = () => {
    if (typeof openReportModal === 'function') {
      openReportModal({ targetUid: rm.hostUid, targetName: rm.title, context: 'party_room' });
    }
  };

  if ($('#prDevClose', root)) {
    $('#prDevClose', root).onclick = () => {
      partyRooms = partyRooms.filter(x => x.id !== roomId);
      ls.set('sg_party_rooms_cache', partyRooms);
      dbOp(() => F.deleteDoc(F.doc(db, 'party_rooms', roomId)));
      m.close();
      renderPartyHub();
      toast('Party room closed by Developer');
    };
  }

  $$('[data-pr-prof]', root).forEach(el => {
    el.onclick = () => {
      const tid = el.dataset.prProf;
      if (tid && tid !== 'SYSTEM' && tid !== 'SYSTEM_HOST') openPublicProfile(tid);
    };
  });
}
