"use strict";
/* =====================================================================
   JACKAROO ROYAL — UPGRADED 2-PLAYER (1v1) & 4-PLAYER (2v2) EDITION (v17)
   - Emerald Arabian Tapestry + Scalloped Carved-Oak 2P & 4P Boards
   - Full Official Card Roles (A–K incl. 5 Any-Stone, K Sweep-Capture,
     Suit-Specific J/Q, 7 Split, 4 Back, 10 Burn, Teleport & +1 Combo)
   - Ornate Parchment Rules Book Modal (4 Pages)
   - VS Clash Intro + Golden Winged GAME OVER Screen with Play Again (14s)
   - Invite Friend Modal (Room Code, World Share, Roster Invite & Seat Fill)
   - Full Mic Options (Open Mic / Push-to-Talk / Team vs All / Noise Gate /
     Male-Female Quick Voice) + Live Table Chat & Emoji Reactions
   ===================================================================== */

const JK_SEAT_PALETTES = {
  // 1v1 matches reference: Seat 0 = Amber Gold (Bottom-Left B), Seat 2 = Emerald Green (Top-Right A)
  '1v1': {
    0: { name: 'Amber', hex: '#f59e0b', hi: '#fef08a', dark: '#b45309', ring: '#fbbf24', badge: 'B', emoji: '🟡' },
    2: { name: 'Emerald', hex: '#22c55e', hi: '#bbf7d0', dark: '#15803d', ring: '#4ade80', badge: 'A', emoji: '🟢' }
  },
  // 2v2 matches 4-player reference: Red (Bottom-Left A), Blue (Bottom-Right B), Green (Top-Left B), Amber (Top-Right A)
  '2v2': {
    0: { name: 'Crimson', hex: '#ef4444', hi: '#fecaca', dark: '#991b1b', ring: '#f87171', badge: 'A', emoji: '🔴' },
    1: { name: 'Emerald', hex: '#22c55e', hi: '#bbf7d0', dark: '#15803d', ring: '#4ade80', badge: 'B', emoji: '🟢' },
    2: { name: 'Amber', hex: '#f59e0b', hi: '#fef08a', dark: '#b45309', ring: '#fbbf24', badge: 'A', emoji: '🟡' },
    3: { name: 'Sapphire', hex: '#38bdf8', hi: '#bae6fd', dark: '#0369a1', ring: '#38bdf8', badge: 'B', emoji: '🔵' }
  }
};

function jkAvatarHtml(av) {
  if (typeof renderAvatarGlyph === 'function') return renderAvatarGlyph(av);
  return `<span>${esc(av || '🎮')}</span>`;
}

function openJackarooRulesModal(initialPage) {
  let page = Number(initialPage || 0);
  const pages = [
    {
      title: '1. Card Roles (A–7)',
      html: `
        <div class="jkr-list">
          <div class="jkr-row"><span class="jkr-mini blk"><b>A</b><i>♣</i></span><p>Move your stone <b>1 step</b> forward (or 11) or <b>place a new stone</b></p></div>
          <div class="jkr-row"><span class="jkr-mini blk"><b>2</b><i>♣</i></span><p>Move a stone <b>2 steps</b> forward or <b>place a new stone</b></p></div>
          <div class="jkr-row"><span class="jkr-mini blk"><b>3</b><i>♣</i></span><p>Move your stone forward by <b>3 steps</b></p></div>
          <div class="jkr-row"><span class="jkr-mini blk"><b>4</b><i>♣</i></span><p>Move your stone <b>back 4 steps</b> (−4)</p></div>
          <div class="jkr-row"><span class="jkr-mini blk"><b>5</b><i>♣</i></span><p>Move <b>any stone</b> (yours or rival's) forward <b>5 steps</b></p></div>
          <div class="jkr-row"><span class="jkr-mini blk"><b>6</b><i>♣</i></span><p>Move your stone forward by <b>6 steps</b></p></div>
          <div class="jkr-row"><span class="jkr-mini blk"><b>7</b><i>♣</i></span><p>Move <b>1 or 2 stones</b> a total of <b>7 steps</b> forward (Split)</p></div>
        </div>
      `
    },
    {
      title: '1. Card Roles (8–K)',
      html: `
        <div class="jkr-list">
          <div class="jkr-row"><span class="jkr-mini blk"><b>8</b><i>♣</i></span><p>Move your stone forward by <b>8 steps</b></p></div>
          <div class="jkr-row"><span class="jkr-mini blk"><b>9</b><i>♣</i></span><p>Move your stone forward by <b>9 steps</b></p></div>
          <div class="jkr-row"><span class="jkr-mini blk"><b>10</b><i>♣</i></span><p>Move forward <b>10 steps</b> OR force rival to <b>discard a card</b> (<b>+ Bonus Turn!</b>)</p></div>
          <div class="jkr-row"><span class="jkr-mini blk"><b>J</b><i>♣</i></span><p><b>Black J (♣/♠):</b> Swap your stone with another player's stone</p></div>
          <div class="jkr-row"><span class="jkr-mini red"><b>J</b><i>♦</i></span><p><b>Red J (♦/♥):</b> Move your stone forward by <b>11 steps</b></p></div>
          <div class="jkr-row"><span class="jkr-mini blk"><b>Q</b><i>♣</i></span><p><b>Black Q (♣/♠):</b> Move your stone forward by <b>12 steps</b></p></div>
          <div class="jkr-row"><span class="jkr-mini red"><b>Q</b><i>♦</i></span><p><b>Red Q (1v1 Only):</b> Pick 1 of rival's <b>hidden cards</b> to reveal &amp; destroy (<b>+ Bonus Turn!</b>)</p></div>
          <div class="jkr-row"><span class="jkr-mini blk"><b>K</b><i>♣</i></span><p><b>King (1v1 Only):</b> Open a stone OR move <b>13 steps, capturing all passed stones</b></p></div>
        </div>
      `
    },
    {
      title: 'Bonus Turns & Teleport Rule',
      html: `
        <div class="jkr-sec">
          <h4>Combo &amp; Bonus Turn Rules</h4>
          <div class="jkr-combo-box">
            <div class="jkr-plus1-badge"><span>+1</span><small>TURN</small></div>
            <p><b>Hit (capture) a rival stone</b> or enter your <b>Win Box (Home)</b> to draw <b>+1 card</b> AND get an immediate <b>Bonus Turn</b>! Forcing a rival to <b>discard</b> (10 / Red Q) also gives you a <b>Bonus Turn</b>!</p>
          </div>
        </div>
        <div class="jkr-sec" style="margin-top:14px">
          <h4>1v1 vs 2v2 Board Rules</h4>
          <div class="jkr-tp-diagram" aria-hidden="true">
            <span class="jkr-swirl">🌀</span>
            <span class="jkr-dash"></span>
            <span class="jkr-tp-dot"></span>
          </div>
          <p class="jkr-desc"><b>1v1 (2P):</b> 52-spot oval with forward neck teleports, King 13⊗ &amp; Red Q Hidden-Card Burn.<br><b>2v2 (4P):</b> 72-spot cross board — no teleports, no Card 13 (K), no Only-Discard (Red Q). Once your 4 stones reach Home, you play for your partner!</p>
        </div>
      `
    },
    {
      title: 'Moving Stones & Tickets',
      html: `
        <div class="jkr-sec">
          <h4>2. Rules for Moving Stones</h4>
          <ul class="jkr-bullets">
            <li>Stones resting at their own <b>opening/start spot</b> are safe — nobody can cross, swap, capture, or push them with 5.</li>
            <li>You <b>cannot pass</b> if a stone blocks the <b>step right before the end</b> (Home entry).</li>
            <li>If stones of the <b>same color</b> lie within your forward range, you <b>cannot cross them</b>.</li>
          </ul>
        </div>
        <div class="jkr-sec" style="margin-top:14px">
          <h4>3. Ticket &amp; Stake Rules</h4>
          <p class="jkr-desc">Play <b>Free Bot</b> matches anytime with daily win rewards, or enter <b>Smart Bot / Friend Stake</b> rooms (25, 50, 100, or 250 coins — winner takes 90% of the pot).</p>
        </div>
      `
    }
  ];

  const m = modal('', `<div class="jkr-scroll-wrap" id="jkrWrap"></div>`, 'jkr-rules-modal');
  // Hide default generic modal header to render authentic parchment scroll header
  const defHead = m.querySelector('.sh');
  if (defHead) defHead.style.display = 'none';

  const renderPage = () => {
    const wrap = $('#jkrWrap', m);
    if (!wrap) return;
    const p = pages[page] || pages[0];
    wrap.innerHTML = `
      <div class="jkr-parchment">
        <button type="button" class="jkr-close-btn" id="jkrCloseBtn" aria-label="Close rules">✕</button>
        <div class="jkr-banner">
          <span class="jkr-orn">✦</span>
          <h3>Rules</h3>
          <span class="jkr-orn">✦</span>
        </div>
        <div class="jkr-subhead">${esc(p.title)}</div>
        <div class="jkr-body">${p.html}</div>
        <div class="jkr-footer">
          <button type="button" class="jkr-nav-btn" id="jkrPrev" ${page === 0 ? 'disabled' : ''}>‹ Prev</button>
          <div class="jkr-dots" role="tablist" aria-label="Rules pages">
            ${pages.map((_, idx) => `<button type="button" class="jkr-dot ${idx === page ? 'on' : ''}" data-jkrp="${idx}" aria-label="Rules page ${idx + 1}"></button>`).join('')}
          </div>
          <button type="button" class="jkr-nav-btn" id="jkrNext" ${page === pages.length - 1 ? 'disabled' : ''}>Next ›</button>
        </div>
      </div>
    `;
    $('#jkrCloseBtn', wrap).onclick = () => m.close();
    $('#jkrPrev', wrap).onclick = () => { if (page > 0) { page--; renderPage(); } };
    $('#jkrNext', wrap).onclick = () => { if (page < pages.length - 1) { page++; renderPage(); } };
    wrap.querySelectorAll('[data-jkrp]').forEach(btn => {
      btn.onclick = () => { page = Number(btn.dataset.jkrp); renderPage(); };
    });
  };
  renderPage();
  return m;
}
window.openJackarooRulesModal = openJackarooRulesModal;

function jkSendDmRoomInvite(friend, roomCode, mode, stake, tierLabel) {
  if (!friend || !friend.uid) return;
  try {
    const myUid = typeof uid !== 'undefined' ? uid : 'local';
    const myName = (typeof me !== 'undefined' && me?.name) || 'Player';
    const msgId = 'dm_jki_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
    const txt = `🎲 Join my Jackaroo ${tierLabel || (mode === '1v1' ? '1v1' : '2v2')} table (${Number(stake || 0) > 0 ? stake + ' 🪙' : 'Free'})! Room Code: ${roomCode}`;
    const docData = {
      id: msgId,
      from: myUid,
      to: String(friend.uid),
      fromName: myName,
      type: 'text',
      text: txt,
      roomCode,
      gameId: 'jackaroo',
      ts: Date.now()
    };
    if (typeof dbOp === 'function' && typeof F !== 'undefined' && F && typeof db !== 'undefined' && db) {
      dbOp(() => F.setDoc(F.doc(db, 'dm_messages', msgId), docData));
    }
  } catch {}
}

function openJackarooInviteModal(opts) {
  const o = opts || {};
  const mode = o.mode === '1v1' ? '1v1' : '2v2';
  const stake = Math.max(0, Number(o.stake || 0));
  const tierLabel = o.tierLabel || (mode === '1v1' ? '1v1 Junior' : 'Basic | Junior');
  const roomCode = String(o.roomCode || ('JK' + Math.random().toString(36).slice(2, 6))).toUpperCase();
  const myUid = typeof uid !== 'undefined' ? uid : '';
  const friendIds = new Set((typeof me !== 'undefined' && Array.isArray(me?.friends)) ? me.friends : []);

  const allRoster = (typeof allUsers === 'function' ? allUsers() : [])
    .filter(u => u && u.uid && u.uid !== myUid);

  // Fallback friendly contacts only when local cache has zero other users
  const baseContacts = allRoster.length ? allRoster : [
    { uid: 'f_aria', name: 'Aria Nova', avatar: '🦊', level: 12, online: true },
    { uid: 'f_rivara', name: 'Rivara', avatar: '🌟', level: 9, online: true },
    { uid: 'f_jason', name: 'Jason K.', avatar: '🦁', level: 14, online: true },
    { uid: 'f_mery', name: 'Mery Star', avatar: '👑', level: 11, online: true },
    { uid: 'f_kabir', name: 'Kabir Raj', avatar: '⚡', level: 8, online: true }
  ];

  // Prioritize real friends first, then recent/online players
  const contacts = baseContacts
    .map(u => ({
      uid: String(u.uid),
      name: String(u.name || 'Player'),
      avatar: u.avatar || 'av_b1',
      level: Number(u.level || (typeof calcLevel === 'function' ? calcLevel(u.exp || 0) : 1)),
      isFriend: friendIds.has(u.uid)
    }))
    .sort((a, b) => (b.isFriend ? 1 : 0) - (a.isFriend ? 1 : 0));

  const invitedSet = new Set(Array.isArray(o.alreadyInRoomUids) ? o.alreadyInRoomUids.map(String) : []);
  const shareUrl = (() => {
    try {
      const u = new URL(window.location.href);
      u.searchParams.set('jkRoom', roomCode);
      return u.toString();
    } catch {
      return `https://study-game.app/?jkRoom=${roomCode}`;
    }
  })();
  const shareText = `Join my Jackaroo Royal (${tierLabel}${stake > 0 ? ' · ' + stake + ' Coins' : ' · Free'}) table! Room Code: ${roomCode} ${shareUrl}`;

  const m = modal(`Share & Invite · ${tierLabel}`, `
    <div class="jki-shell" data-testid="jackaroo-invite-sheet">
      <div class="jki-code-card">
        <div class="jki-code-meta">
          <small class="jki-lbl">Room Code</small>
          <b class="jki-code" id="jkiCodeVal">${esc(roomCode)}</b>
        </div>
        <div class="jki-code-actions">
          <button type="button" class="btn sm gold" id="jkiCopyBtn">Copy Code</button>
          <button type="button" class="btn sm ok" id="jkiShareWorldBtn">World Chat</button>
        </div>
      </div>

      ${typeof o.onSwitchMode === 'function' ? `
        <div class="jki-mode-row">
          <button type="button" class="mode-pill ${mode === '1v1' ? 'on' : ''}" data-jkimode="1v1">2 Players (1v1)</button>
          <button type="button" class="mode-pill ${mode === '2v2' ? 'on' : ''}" data-jkimode="2v2">4 Players (2v2)</button>
        </div>
      ` : ''}

      <div class="jki-search-wrap">
        <span class="jki-search-ico" aria-hidden="true">🔍</span>
        <input type="search" id="jkiSearchIn" placeholder="Search recent contacts or friends..." maxlength="40" autocomplete="off" aria-label="Search recent contacts and friends">
      </div>

      <div class="jki-sec-row">
        <span class="jki-sec-title">Recent Contacts &amp; Friends</span>
        <small class="jki-sec-cnt" id="jkiContactCnt">${contacts.length} available</small>
      </div>
      <div class="jki-friend-list" id="jkiFriendList"></div>

      <div class="jki-share-sec">
        <div class="jki-sec-title">Share Table Link</div>
        <div class="jki-share-grid" role="group" aria-label="Share shortcuts">
          <button type="button" class="jki-share-btn wa" data-jkshare="whatsapp" aria-label="Share on WhatsApp">
            <span class="jki-s-ico"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.04 2a9.9 9.9 0 0 0-8.52 14.95L2 22l5.2-1.36A9.9 9.9 0 1 0 12.04 2Zm5.78 14.08c-.24.68-1.42 1.3-1.97 1.38-.52.08-1.18.11-1.9-.12-.44-.14-1-.33-1.72-.64-3.03-1.31-5-4.38-5.15-4.58-.15-.2-1.23-1.64-1.23-3.13 0-1.49.78-2.22 1.06-2.52.28-.3.6-.38.8-.38h.58c.19 0 .44-.07.69.52.25.6.85 2.08.92 2.23.08.15.13.33.03.53-.1.2-.15.33-.3.5-.15.18-.32.4-.45.54-.15.15-.3.32-.13.62.18.3.78 1.29 1.68 2.09 1.15 1.03 2.13 1.35 2.43 1.5.3.15.48.13.66-.08.18-.2.75-.88.95-1.18.2-.3.4-.25.67-.15.28.1 1.75.83 2.05.98.3.15.5.23.58.35.08.13.08.73-.17 1.4Z"/></svg></span>
            <span>WhatsApp</span>
          </button>
          <button type="button" class="jki-share-btn ig" data-jkshare="instagram" aria-label="Share on Instagram">
            <span class="jki-s-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg></span>
            <span>Instagram</span>
          </button>
          <button type="button" class="jki-share-btn fb" data-jkshare="facebook" aria-label="Share on Facebook">
            <span class="jki-s-ico"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13.5 21v-8.2h2.75l.42-3.2H13.5V7.55c0-.93.26-1.56 1.59-1.56h1.7V3.13A22.7 22.7 0 0 0 14.32 3c-2.45 0-4.12 1.5-4.12 4.24v2.36H7.45v3.2h2.75V21h3.3Z"/></svg></span>
            <span>Facebook</span>
          </button>
          <button type="button" class="jki-share-btn xapp" data-jkshare="x" aria-label="Share on X">
            <span class="jki-s-ico"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.66l-5.21-6.82-5.97 6.82H1.67l7.73-8.84L1.25 2.25h6.83l4.71 6.23 5.45-6.23Zm-1.16 17.52h1.83L7.08 4.13H5.12l11.96 15.64Z"/></svg></span>
            <span>X</span>
          </button>
          <button type="button" class="jki-share-btn more" data-jkshare="more" aria-label="More share options">
            <span class="jki-s-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/></svg></span>
            <span>More</span>
          </button>
        </div>
      </div>
    </div>
  `, 'jki-modal');

  const copySharePayload = (label) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shareText).catch(() => {});
    }
    if (typeof playSfx === 'function') playSfx('tap');
    if (typeof toast === 'function') toast(label);
  };

  const renderContacts = (queryStr) => {
    const listEl = $('#jkiFriendList', m);
    const cntEl = $('#jkiContactCnt', m);
    if (!listEl) return;
    const q = String(queryStr || '').trim().toLowerCase();
    const filtered = q
      ? contacts.filter(u => u.name.toLowerCase().includes(q) || u.uid.toLowerCase().includes(q))
      : contacts;

    if (cntEl) cntEl.textContent = `${filtered.length} found`;
    if (!filtered.length) {
      listEl.innerHTML = `<div class="jki-empty">No matching contacts. Share Room Code <b>${esc(roomCode)}</b> directly!</div>`;
      return;
    }

    listEl.innerHTML = filtered.slice(0, 16).map(u => {
      const isInv = invitedSet.has(u.uid);
      return `
        <div class="jki-friend-row">
          <div class="jki-f-left">
            <span class="jki-f-av">${jkAvatarHtml(u.avatar)}</span>
            <div class="jki-f-info">
              <b>${esc(u.name)}${u.isFriend ? ' <span class="jki-fr-tag">Friend</span>' : ''}</b>
              <small>Lv.${u.level} · Recent Contact</small>
            </div>
          </div>
          <button type="button" class="btn sm ${isInv ? 'ghost' : 'ok'}" data-jki-uid="${esc(u.uid)}" data-jki-name="${esc(u.name)}" data-jki-av="${esc(u.avatar)}" ${isInv ? 'disabled' : ''}>${isInv ? 'Invited ✓' : 'Invite'}</button>
        </div>
      `;
    }).join('');

    listEl.querySelectorAll('[data-jki-uid]').forEach(btn => {
      btn.onclick = () => {
        const friend = {
          uid: btn.dataset.jkiUid,
          name: btn.dataset.jkiName,
          avatar: btn.dataset.jkiAv
        };
        invitedSet.add(friend.uid);
        btn.textContent = 'Invited ✓';
        btn.disabled = true;
        btn.classList.remove('ok');
        btn.classList.add('ghost');
        jkSendDmRoomInvite(friend, roomCode, mode, stake, tierLabel);
        if (typeof playSfx === 'function') playSfx('turnStart');
        if (typeof toast === 'function') toast(`Invite sent to ${friend.name} · Seat reserved (no bot fill)`);
        if (typeof o.onInviteFriend === 'function') o.onInviteFriend(friend);
      };
    });
  };
  renderContacts('');

  const searchIn = $('#jkiSearchIn', m);
  if (searchIn) {
    searchIn.oninput = () => renderContacts(searchIn.value);
  }

  const copyBtn = $('#jkiCopyBtn', m);
  if (copyBtn) {
    copyBtn.onclick = () => copySharePayload(`Copied Room Code ${roomCode}!`);
  }

  const worldBtn = $('#jkiShareWorldBtn', m);
  if (worldBtn) {
    worldBtn.onclick = () => {
      if (typeof o.onShareWorld === 'function') {
        o.onShareWorld(roomCode);
      } else if (typeof persistMpRoom === 'function' && typeof shareRoomToWorldChat === 'function') {
        const now = Date.now();
        const myU = typeof uid !== 'undefined' ? uid : 'local';
        const room = {
          id: o.roomId || ('room_jk_' + now.toString(36)),
          code: roomCode,
          mode: 'jackaroo',
          subMode: mode,
          tierLabel,
          entryCoins: stake,
          maxPlayers: mode === '1v1' ? 2 : 4,
          hostUid: myU,
          hostName: (typeof me !== 'undefined' && me?.name) || 'Player',
          status: 'waiting',
          createdAt: now,
          updatedAt: now,
          players: {
            [myU]: {
              uid: myU,
              name: (typeof me !== 'undefined' && me?.name) || 'Player',
              avatar: (typeof me !== 'undefined' && me?.avatar) || '🦊',
              score: 0,
              ready: true
            }
          },
          chat: [{ id: 'sys_' + now, type: 'sys', text: `Jackaroo ${tierLabel} invite posted (${roomCode})`, ts: now }]
        };
        persistMpRoom(room);
        shareRoomToWorldChat(room);
      } else if (typeof toast === 'function') {
        toast(`Invite for Room ${roomCode} posted to World Chat!`);
      }
      if (typeof playSfx === 'function') playSfx('chatSend');
    };
  }

  m.querySelectorAll('[data-jkimode]').forEach(btn => {
    btn.onclick = () => {
      const nextMode = btn.dataset.jkimode;
      m.close();
      if (typeof o.onSwitchMode === 'function') o.onSwitchMode(nextMode);
    };
  });

  m.querySelectorAll('[data-jkshare]').forEach(btn => {
    btn.onclick = async () => {
      const ch = btn.dataset.jkshare;
      if (ch === 'more' && navigator.share) {
        try {
          await navigator.share({ title: `Jackaroo Royal · ${tierLabel}`, text: shareText, url: shareUrl });
          if (typeof playSfx === 'function') playSfx('tap');
          return;
        } catch {}
      }
      const names = {
        whatsapp: 'WhatsApp',
        instagram: 'Instagram',
        facebook: 'Facebook',
        x: 'X',
        more: 'Share'
      };
      copySharePayload(`${names[ch] || 'Share'} invite link copied! Code: ${roomCode}`);
    };
  });

  return m;
}
window.openJackarooInviteModal = openJackarooInviteModal;

/* =========================================================================
   JACKAROO LOBBY SCREEN & PRE-MATCH TABLE LOBBY (Basic | Junior Flow)
   ========================================================================= */
const JK_LOBBY_MODES = [
  {
    id: 'junior_2v2',
    title: 'Junior',
    tableTitle: 'Basic | Junior',
    mode: '2v2',
    badge: '2v2 · 4P',
    freeStake: 0,
    paidStake: 10,
    defaultStake: 0,
    tone: 'emerald',
    desc: 'Classic 4-player cross board · Free or 10 🪙'
  },
  {
    id: 'medium_2v2',
    title: 'Medium',
    tableTitle: 'Basic | Medium',
    mode: '2v2',
    badge: '2v2 · Pro',
    freeStake: 0,
    paidStake: 50,
    defaultStake: 50,
    tone: 'royal',
    desc: 'Smart 2v2 stake table · Win 90% pot'
  },
  {
    id: 'junior_1v1',
    title: '1v1 Junior',
    tableTitle: '1v1 | Junior',
    mode: '1v1',
    badge: '1v1 · 2P',
    freeStake: 0,
    paidStake: 25,
    defaultStake: 0,
    tone: 'amber',
    desc: 'Fast 52-spot duel + Teleports & K13'
  },
  {
    id: 'senior_1v1',
    title: '1v1 Senior',
    tableTitle: '1v1 | Senior',
    mode: '1v1',
    badge: '1v1 · High',
    freeStake: 0,
    paidStake: 100,
    defaultStake: 100,
    tone: 'crimson',
    desc: 'High-stakes 1v1 showdown · Win 180 🪙'
  }
];

function computeJackarooStats() {
  const st = (typeof me !== 'undefined' && me && me.stats) ? me.stats : {};
  const totalMatches = Math.max(0, Number(st.jk_matches || st.games_played || 0));
  const wins = Math.max(0, Math.min(totalMatches, Number(st.jk_wins || Math.round(totalMatches * 0.56))));
  const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;
  const all = typeof allUsers === 'function' ? allUsers().slice().sort((a, b) => Number(b.exp || 0) - Number(a.exp || 0)) : [];
  const myU = typeof uid !== 'undefined' ? uid : '';
  const rankIdx = all.findIndex(u => u && u.uid === myU);
  const rankPos = rankIdx >= 0 ? rankIdx + 1 : 1;
  const lv = typeof calcLevel === 'function' && typeof me !== 'undefined' ? calcLevel(me.exp || 0) : 1;
  const tier = lv >= 20 ? 'Royal Grandmaster' : lv >= 12 ? 'Gold Knight' : lv >= 6 ? 'Silver Ace' : 'Bronze Rookie';
  return { totalMatches, wins, winRate, rankPos, tier, level: lv };
}

function openJackarooCoinTopup() {
  const coinsNow = typeof me !== 'undefined' ? Number(me.coins || 0) : 0;
  const m = modal('Coins Wallet', `
    <div class="jkl-wallet-modal">
      <div class="jkl-wm-bal">
        <small>Current Balance</small>
        <b>🪙 ${typeof fmtNum === 'function' ? fmtNum(coinsNow) : coinsNow}</b>
      </div>
      <p class="jkl-wm-desc">Earn free coins in Daily Tasks, Free Bot Jackaroo matches, or browse the Store for upgrades.</p>
      <div class="row" style="gap:8px;margin-top:10px">
        <button type="button" class="btn gold" style="flex:1" id="jklGoStore">Open Store</button>
        <button type="button" class="btn ok" style="flex:1" id="jklGoTasks">Daily Tasks</button>
      </div>
    </div>
  `);
  $('#jklGoStore', m).onclick = () => {
    m.close();
    if (typeof closeFullScreenGameView === 'function') closeFullScreenGameView();
    if (typeof go === 'function') go('store');
  };
  $('#jklGoTasks', m).onclick = () => {
    m.close();
    if (typeof closeFullScreenGameView === 'function') closeFullScreenGameView();
    if (typeof go === 'function') go('tasks');
  };
}

let activeJackarooTableSync = null;
window.syncActiveJackarooLobbyFromRooms = function (roomsList) {
  if (typeof activeJackarooTableSync === 'function') {
    activeJackarooTableSync(roomsList);
  }
};

function openJackarooLobby(opts) {
  const o = opts || {};
  const rival = o.rival || null;
  const stats = computeJackarooStats();
  const myCoins = typeof me !== 'undefined' ? Number(me.coins || 0) : 0;
  let entryFilter = 'all'; // 'all' | 'free' | 'paid'

  const view = openFullScreenGameView({
    gameId: 'jackaroo_lobby',
    title: 'Jackaroo',
    subMeta: 'Royal Board Arena',
    statusText: 'Lobby',
    statusTone: 'ok',
    themeClass: 'gfs-theme-jackaroo',
    html: `
      <div class="jkl-shell" data-testid="jackaroo-lobby">
        <header class="jkl-topbar">
          <div class="jkl-tb-left">
            <button type="button" class="jkl-icon-btn" id="jklBackBtn" aria-label="Back to Arena">‹</button>
            <div class="jkl-brand">
              <h1>Jackaroo</h1>
              <span>Royal 1v1 &amp; 2v2 Board</span>
            </div>
          </div>
          <div class="jkl-tb-right">
            <button type="button" class="jkl-icon-btn" id="jklRulesBtn" aria-label="Jackaroo Rules" title="Rules">📖</button>
            <div class="jkl-coin-pill" id="jklCoinPill" aria-label="Coins Balance">
              <span class="jkl-coin-ico" aria-hidden="true">🪙</span>
              <b id="jklCoinVal">${typeof fmtNum === 'function' ? fmtNum(myCoins) : myCoins}</b>
              <button type="button" class="jkl-coin-plus" id="jklCoinPlusBtn" aria-label="Add Coins" title="Add Coins">+</button>
            </div>
          </div>
        </header>

        <div class="jkl-scroll">
          <section class="jkl-stats-card" aria-label="Player Jackaroo Statistics">
            <div class="jkl-st-top">
              <div class="jkl-st-user">
                <div class="jkl-st-av">${jkAvatarHtml((typeof me !== 'undefined' && me?.avatar) || '🦊')}</div>
                <div class="jkl-st-meta">
                  <b>${esc((typeof me !== 'undefined' && me?.name) || 'Player')}</b>
                  <span class="jkl-tier-badge">👑 ${esc(stats.tier)}</span>
                </div>
              </div>
              <div class="jkl-rank-medal" aria-label="Leaderboard Rank">
                <small>RANK</small>
                <b>#${stats.rankPos}</b>
              </div>
            </div>
            <div class="jkl-st-grid">
              <div class="jkl-st-box">
                <small>Total Matches</small>
                <b>${stats.totalMatches}</b>
              </div>
              <div class="jkl-st-box">
                <small>Win Rate</small>
                <b class="ok">${stats.winRate}%</b>
              </div>
              <div class="jkl-st-box">
                <small>Level</small>
                <b class="gold">Lv.${stats.level}</b>
              </div>
            </div>
          </section>

          <div class="jkl-sec-head">
            <span>Select Table Mode</span>
            <div class="jkl-filter-seg" role="tablist" aria-label="Entry Filter">
              <button type="button" class="jkl-f-btn on" data-jklf="all">All</button>
              <button type="button" class="jkl-f-btn" data-jklf="free">Free</button>
              <button type="button" class="jkl-f-btn" data-jklf="paid">Coins</button>
            </div>
          </div>

          <div class="jkl-mode-grid" id="jklModeGrid"></div>

          <div class="jkl-join-bar">
            <input type="text" id="jklCodeInput" maxlength="10" placeholder="Room Code (e.g. JK482A)" autocomplete="off" aria-label="Room code">
            <button type="button" class="btn gold sm" id="jklJoinCodeBtn">Join Room</button>
          </div>
        </div>
      </div>
    `
  });

  const renderModeCards = () => {
    const grid = $('#jklModeGrid', view);
    if (!grid) return;
    grid.innerHTML = JK_LOBBY_MODES.map(m => {
      const stakeVal = entryFilter === 'free' ? m.freeStake : (entryFilter === 'paid' ? m.paidStake : m.defaultStake);
      const isPaid = stakeVal > 0;
      const prizeTxt = isPaid ? `Win ${Math.floor(stakeVal * 2 * 0.9)} 🪙` : 'Free Rewards';
      return `
        <button type="button" class="jkl-mode-card tone-${m.tone}" data-jklmode="${m.id}" data-jklstake="${stakeVal}">
          <div class="jkl-mc-top">
            <span class="jkl-mc-badge">${esc(m.badge)}</span>
            <span class="jkl-mc-entry ${isPaid ? 'paid' : 'free'}">${isPaid ? `${stakeVal} 🪙` : 'FREE'}</span>
          </div>
          <div class="jkl-mc-title">${esc(m.title)}</div>
          <div class="jkl-mc-desc">${esc(m.desc)}</div>
          <div class="jkl-mc-foot">
            <span class="jkl-mc-prize">${prizeTxt}</span>
            <span class="jkl-mc-go">Enter Table ›</span>
          </div>
        </button>
      `;
    }).join('');

    grid.querySelectorAll('[data-jklmode]').forEach(btn => {
      btn.onclick = () => {
        const meta = JK_LOBBY_MODES.find(x => x.id === btn.dataset.jklmode) || JK_LOBBY_MODES[0];
        const stakeVal = Number(btn.dataset.jklstake || 0);
        if (stakeVal > 0 && typeof me !== 'undefined' && me.coins < stakeVal) {
          if (typeof toast === 'function') toast(`Need ${stakeVal} coins for ${meta.title}`);
          return;
        }
        if (typeof playSfx === 'function') playSfx('tap');
        openJackarooTableLobby({
          mode: meta.mode,
          tier: meta.tableTitle,
          stake: stakeVal,
          rival
        });
      };
    });
  };
  renderModeCards();

  $('#jklBackBtn', view).onclick = () => {
    if (typeof playSfx === 'function') playSfx('tap');
    view.close();
  };
  $('#jklRulesBtn', view).onclick = () => {
    if (typeof playSfx === 'function') playSfx('tap');
    openJackarooRulesModal(0);
  };
  $('#jklCoinPlusBtn', view).onclick = () => {
    if (typeof playSfx === 'function') playSfx('tap');
    openJackarooCoinTopup();
  };
  view.querySelectorAll('[data-jklf]').forEach(btn => {
    btn.onclick = () => {
      entryFilter = btn.dataset.jklf || 'all';
      view.querySelectorAll('[data-jklf]').forEach(b => b.classList.toggle('on', b.dataset.jklf === entryFilter));
      if (typeof playSfx === 'function') playSfx('tap');
      renderModeCards();
    };
  });

  $('#jklJoinCodeBtn', view).onclick = () => {
    const code = String($('#jklCodeInput', view)?.value || '').trim().toUpperCase();
    if (!code || code.length < 3) {
      if (typeof toast === 'function') toast('Enter a valid Room Code');
      return;
    }
    const existing = (typeof mpRooms !== 'undefined' && Array.isArray(mpRooms))
      ? mpRooms.find(r => r && String(r.code || '').toUpperCase() === code && r.status === 'waiting')
      : null;
    if (typeof playSfx === 'function') playSfx('turnStart');
    if (existing) {
      openJackarooTableLobby({
        mode: existing.subMode === '1v1' ? '1v1' : '2v2',
        tier: existing.tierLabel || (existing.subMode === '1v1' ? '1v1 | Junior' : 'Basic | Junior'),
        stake: Number(existing.entryCoins || 0),
        roomCode: existing.code,
        roomId: existing.id,
        joinExistingRoom: existing
      });
    } else {
      openJackarooTableLobby({
        mode: '2v2',
        tier: 'Basic | Junior',
        stake: 0,
        roomCode: code
      });
    }
  };

  return view;
}
window.openJackarooLobby = openJackarooLobby;

function openJackarooTableLobby(opts) {
  const Rules = window.JackarooRules;
  if (!Rules) return;
  const o = opts || {};
  const mode = o.mode === '1v1' ? '1v1' : '2v2';
  const stake = Math.max(0, Number(o.stake || 0));
  const tier = String(o.tier || (mode === '1v1' ? '1v1 | Junior' : 'Basic | Junior'));
  const roomCode = String(o.roomCode || ('JK' + Math.random().toString(36).slice(2, 6))).toUpperCase();
  const myUid = typeof uid !== 'undefined' ? uid : 'local';
  const myName = (typeof me !== 'undefined' && me?.name) || 'You';
  const myAv = (typeof me !== 'undefined' && me?.avatar) || '🦊';
  const now = Date.now();
  const roomId = o.roomId || ('room_jk_' + now.toString(36) + Math.random().toString(36).slice(2, 4));

  const lobby = Rules.createTableLobbyState({
    mode,
    tier,
    stake,
    roomCode,
    roomId,
    host: { uid: myUid, name: myName, avatar: myAv }
  });

  let isHost = true;
  if (o.joinExistingRoom && o.joinExistingRoom.hostUid && o.joinExistingRoom.hostUid !== myUid) {
    isHost = false;
    // Adopt host + existing seats, and seat myself as joined (not ready until I tap Ready!)
    const ex = o.joinExistingRoom;
    lobby.seats[0] = {
      ...lobby.seats[0],
      kind: 'host',
      uid: ex.hostUid,
      name: ex.hostName || 'Host',
      avatar: (ex.players && ex.players[ex.hostUid]?.avatar) || '👑',
      ready: Boolean(ex.players && ex.players[ex.hostUid]?.ready !== false)
    };
    if (Array.isArray(ex.jkSeats)) {
      ex.jkSeats.forEach((s, idx) => {
        if (lobby.seats[idx] && s && s.kind && s.kind !== 'empty') {
          lobby.seats[idx] = { ...lobby.seats[idx], ...s };
        }
      });
    }
    Rules.seatFriendJoined(lobby, { uid: myUid, name: myName, avatar: myAv, ready: false });
  } else if (o.rival && o.rival.uid) {
    // Direct friend challenge: invite friend into seat WITHOUT putting any bot there!
    Rules.inviteFriendToSeat(lobby, o.rival);
  }

  let tableSpeakerMuted = typeof SFX !== 'undefined' && typeof SFX.isMuted === 'function' ? SFX.isMuted() : false;
  let tableMicLive = false;
  const palette = JK_SEAT_PALETTES[mode];

  const syncRoomToCloud = (statusOverride) => {
    if (typeof persistMpRoom !== 'function') return;
    const playersMap = {};
    lobby.seats.forEach(s => {
      if ((s.kind === 'host' || s.kind === 'joined') && s.uid) {
        playersMap[s.uid] = {
          uid: s.uid,
          name: s.name,
          avatar: s.avatar,
          seat: s.seat,
          ready: Boolean(s.ready),
          score: 0
        };
      }
    });
    const hostSeat = lobby.seats[0];
    const roomDoc = {
      id: roomId,
      code: roomCode,
      mode: 'jackaroo',
      subMode: mode,
      tierLabel: tier,
      entryCoins: stake,
      maxPlayers: mode === '1v1' ? 2 : 4,
      hostUid: hostSeat.uid || myUid,
      hostName: hostSeat.name || myName,
      status: statusOverride || 'waiting',
      jkSeats: lobby.seats.map(s => ({ ...s })),
      players: playersMap,
      createdAt: now,
      updatedAt: Date.now()
    };
    persistMpRoom(roomDoc);
  };
  syncRoomToCloud('waiting');

  const view = openFullScreenGameView({
    gameId: 'jackaroo_table_lobby',
    title: tier,
    subMeta: `ID ${roomCode}`,
    statusText: 'Waiting',
    statusTone: 'gold',
    themeClass: 'gfs-theme-jackaroo',
    html: `
      <div class="jkt-shell" data-testid="jackaroo-table-lobby" data-mode="${mode}">
        <header class="jkt-topbar">
          <div class="jkt-tb-left">
            <button type="button" class="jkl-icon-btn" id="jktBackBtn" aria-label="Back to Jackaroo Lobby">‹</button>
            <div class="jkt-title-wrap">
              <b>${esc(tier)}</b>
              <div class="jkt-sub-row">
                <button type="button" class="jkt-code-chip" id="jktCopyCodeBtn" title="Copy Room Code">ID ${esc(roomCode)} ⧉</button>
                <span class="jkt-stake-chip ${stake > 0 ? 'paid' : 'free'}">${stake > 0 ? `${stake} 🪙 Entry` : 'Free Table'}</span>
              </div>
            </div>
          </div>
          <div class="jkt-tb-right">
            <button type="button" class="jkl-icon-btn" id="jktRulesBtn" aria-label="Jackaroo Rules" title="Rules">📖</button>
          </div>
        </header>

        <div class="jkt-status-banner" id="jktStatusBanner" role="status"></div>

        <div class="jkt-arena-stage">
          <div class="jkt-table-felt ${mode === '1v1' ? 'is-1v1' : 'is-2v2'}">
            <div class="jkt-center-emblem">
              <div class="jkt-emblem-ring">
                <span>${mode === '1v1' ? '1v1' : '2v2'}</span>
                <small>${esc(tier)}</small>
              </div>
              <button type="button" class="jkt-fill-bots-btn" id="jktFillBotsBtn">+ Fill Empty with Bots</button>
            </div>
            <div class="jkt-seats-grid ${mode === '1v1' ? 'cols-2' : 'cols-4'}" id="jktSeatsGrid"></div>
          </div>
        </div>

        <div class="jkt-bottom-dock">
          <button type="button" class="jkt-audio-btn ${tableSpeakerMuted ? 'off' : ''}" id="jktSpkBtn" aria-label="Toggle Speaker">${tableSpeakerMuted ? '🔇' : '🔊'}</button>
          <button type="button" class="jkt-audio-btn ${tableMicLive ? 'live' : 'off'}" id="jktMicBtn" aria-label="Toggle Microphone">${tableMicLive ? '🎙️' : '🔇'}</button>
          <button type="button" class="btn ok jkt-invite-btn" id="jktInviteBtn">👥 Invite</button>
          <button type="button" class="btn ghost jkt-ready-btn" id="jktReadyBtn">Ready</button>
          ${isHost ? `<button type="button" class="btn gold jkt-start-btn" id="jktStartBtn">Start</button>` : ''}
        </div>
      </div>
    `
  });

  const openInviteForSeat = (preferredSeatId) => {
    const takenUids = lobby.seats.map(s => s.uid).filter(Boolean);
    openJackarooInviteModal({
      mode,
      stake,
      tierLabel: tier,
      roomCode,
      roomId,
      alreadyInRoomUids: takenUids,
      onShareWorld: () => {
        syncRoomToCloud('waiting');
        if (typeof shareRoomToWorldChat === 'function') {
          shareRoomToWorldChat({
            id: roomId,
            code: roomCode,
            mode: 'jackaroo',
            entryCoins: stake
          });
        }
      },
      onInviteFriend: (friend) => {
        const res = Rules.inviteFriendToSeat(lobby, friend, preferredSeatId);
        if (!res.ok) {
          if (typeof toast === 'function') {
            toast(res.reason === 'room_full' ? 'All table seats are currently filled!' : `${friend.name} is already at this table.`);
          }
          return;
        }
        syncRoomToCloud('waiting');
        renderTable();
      }
    });
  };

  const renderTable = () => {
    const seatsEl = $('#jktSeatsGrid', view);
    const statusEl = $('#jktStatusBanner', view);
    const readyBtn = $('#jktReadyBtn', view);
    const startBtn = $('#jktStartBtn', view);
    const fillBtn = $('#jktFillBotsBtn', view);
    if (!seatsEl) return;

    const mySeatObj = lobby.seats.find(s => s.uid === myUid) || lobby.seats[0];
    const strictGate = Rules.canStartLobbyMatch(lobby, { allowBotFillForEmpty: false });
    const soloFillGate = Rules.canStartLobbyMatch(lobby, { allowBotFillForEmpty: true });

    seatsEl.innerHTML = lobby.seats.map(s => {
      const col = palette[s.seat] || { hex: '#f59e0b', badge: 'A', name: 'Seat' };
      const teamLabel = mode === '1v1' ? (s.team === 0 ? 'Side A' : 'Side B') : (s.team === 0 ? 'Team A' : 'Team B');

      if (s.kind === 'empty') {
        return `
          <div class="jkt-seat-card is-empty" style="--sc:${col.hex}" data-seat-id="${s.seat}">
            <span class="jkt-team-tag">${teamLabel}</span>
            <button type="button" class="jkt-empty-slot" data-jkt-invite-seat="${s.seat}" aria-label="Invite friend to seat ${s.seat}">
              <span class="jkt-plus">+</span>
              <b>Empty</b>
              <small>Tap to Invite</small>
            </button>
          </div>
        `;
      }

      const isMe = s.uid === myUid;
      const roleChip = s.kind === 'host'
        ? '<span class="jkt-role host">HOST</span>'
        : s.kind === 'bot'
          ? '<span class="jkt-role bot">BOT</span>'
          : s.kind === 'invited'
            ? '<span class="jkt-role inv">INVITED</span>'
            : '<span class="jkt-role fr">FRIEND</span>';

      const statusBadge = s.kind === 'invited'
        ? '<span class="jkt-ready-pill waiting">Waiting…</span>'
        : s.ready
          ? '<span class="jkt-ready-pill ok">Ready ✓</span>'
          : '<span class="jkt-ready-pill pending">Not Ready</span>';

      return `
        <div class="jkt-seat-card is-${s.kind} ${s.ready ? 'is-ready' : ''}" style="--sc:${col.hex}" data-seat-id="${s.seat}">
          <span class="jkt-team-tag">${teamLabel}</span>
          ${isHost && s.kind !== 'host' ? `<button type="button" class="jkt-kick-x" data-jkt-clear="${s.seat}" aria-label="Remove from seat" title="Clear Seat">✕</button>` : ''}
          <div class="jkt-av-ring">${jkAvatarHtml(s.avatar || '🎮')}</div>
          <div class="jkt-seat-name">${esc(isMe ? 'You' : s.name)}</div>
          <div class="jkt-seat-chips">
            ${roleChip}
            ${statusBadge}
          </div>
        </div>
      `;
    }).join('');

    if (statusEl) {
      if (strictGate.reason === 'pending_invites') {
        statusEl.className = 'jkt-status-banner warn';
        statusEl.innerHTML = `⏳ Waiting for <b>${esc(strictGate.pendingInvites.join(', '))}</b> to join &amp; tap Ready (invited slots will never be replaced by bots).`;
      } else if (strictGate.reason === 'not_ready') {
        statusEl.className = 'jkt-status-banner warn';
        statusEl.innerHTML = `✋ Waiting for <b>${esc(strictGate.unreadyNames.join(', '))}</b> to tap <b>Ready</b> before starting.`;
      } else if (strictGate.reason === 'empty_seats') {
        statusEl.className = 'jkt-status-banner info';
        statusEl.innerHTML = `👥 <b>${strictGate.emptyCount}</b> empty ${strictGate.emptyCount === 1 ? 'seat' : 'seats'} open — Invite friends or tap <b>+ Fill Empty with Bots</b>.`;
      } else {
        statusEl.className = 'jkt-status-banner ok';
        statusEl.innerHTML = `✅ All seated players are <b>Ready</b> — Host can tap <b>Start</b>!`;
      }
    }

    if (readyBtn && mySeatObj) {
      readyBtn.textContent = mySeatObj.ready ? 'Ready ✓' : 'Ready';
      readyBtn.classList.toggle('ok', Boolean(mySeatObj.ready));
      readyBtn.classList.toggle('ghost', !mySeatObj.ready);
    }

    if (fillBtn) {
      const hasEmpty = lobby.seats.some(s => s.kind === 'empty');
      fillBtn.hidden = !isHost || !hasEmpty;
    }

    if (startBtn) {
      const blockedByHuman = !soloFillGate.ok;
      startBtn.disabled = false; // Keep clickable to show exact actionable toast if blocked
      startBtn.classList.toggle('is-locked', blockedByHuman);
      startBtn.textContent = strictGate.ok
        ? 'Start Match'
        : (soloFillGate.ok ? 'Start' : 'Waiting…');
    }

    // Bind seat buttons
    seatsEl.querySelectorAll('[data-jkt-invite-seat]').forEach(btn => {
      btn.onclick = () => {
        if (typeof playSfx === 'function') playSfx('tap');
        openInviteForSeat(Number(btn.dataset.jktInviteSeat));
      };
    });
    seatsEl.querySelectorAll('[data-jkt-clear]').forEach(btn => {
      btn.onclick = (ev) => {
        ev.stopPropagation();
        const sid = Number(btn.dataset.jktClear);
        Rules.removeSeatOccupant(lobby, sid);
        if (typeof playSfx === 'function') playSfx('tap');
        syncRoomToCloud('waiting');
        renderTable();
      };
    });
  };
  renderTable();

  // Live Firestore room updates (when a real friend joins or taps Ready on another device!)
  activeJackarooTableSync = (roomsList) => {
    const live = (Array.isArray(roomsList) ? roomsList : []).find(r => r && r.id === roomId);
    if (!live) return;
    if (Array.isArray(live.jkSeats) && live.jkSeats.length === lobby.seats.length) {
      live.jkSeats.forEach((remoteSeat, idx) => {
        if (!remoteSeat) return;
        // Preserve my own local Ready state if I am that seat
        if (remoteSeat.uid === myUid) return;
        lobby.seats[idx] = { ...lobby.seats[idx], ...remoteSeat };
      });
    }
    if (live.players && typeof live.players === 'object') {
      Object.values(live.players).forEach(p => {
        if (!p || !p.uid || p.uid === myUid) return;
        const seated = lobby.seats.find(s => s.uid === p.uid);
        if (!seated) {
          Rules.seatFriendJoined(lobby, { uid: p.uid, name: p.name, avatar: p.avatar, ready: Boolean(p.ready) });
        } else if (seated.kind === 'invited') {
          Rules.seatFriendJoined(lobby, { uid: p.uid, name: p.name, avatar: p.avatar, ready: Boolean(p.ready) });
        } else if (seated.kind === 'joined') {
          seated.ready = Boolean(p.ready);
        }
      });
    }
    if (live.status === 'playing' && !isHost) {
      const roster = Rules.resolveMatchRoster(lobby);
      activeJackarooTableSync = null;
      launchJackaroo(stake, null, mode, stake > 0 ? 'pro' : 'standard', roomCode, {
        seatRoster: roster,
        tierLabel: tier,
        roomId
      });
      return;
    }
    renderTable();
  };

  const prevClose = view.close;
  view.close = () => {
    activeJackarooTableSync = null;
    prevClose();
  };

  $('#jktBackBtn', view).onclick = () => {
    activeJackarooTableSync = null;
    if (typeof playSfx === 'function') playSfx('tap');
    openJackarooLobby({ rival: o.rival });
  };
  $('#jktRulesBtn', view).onclick = () => {
    if (typeof playSfx === 'function') playSfx('tap');
    openJackarooRulesModal(0);
  };
  $('#jktCopyCodeBtn', view).onclick = () => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(roomCode).catch(() => {});
    }
    if (typeof playSfx === 'function') playSfx('tap');
    if (typeof toast === 'function') toast(`Copied Room Code ${roomCode}`);
  };
  $('#jktSpkBtn', view).onclick = () => {
    tableSpeakerMuted = !tableSpeakerMuted;
    if (typeof SFX !== 'undefined' && typeof SFX.setMuted === 'function') SFX.setMuted(tableSpeakerMuted);
    const b = $('#jktSpkBtn', view);
    if (b) { b.classList.toggle('off', tableSpeakerMuted); b.textContent = tableSpeakerMuted ? '🔇' : '🔊'; }
  };
  $('#jktMicBtn', view).onclick = () => {
    tableMicLive = !tableMicLive;
    const b = $('#jktMicBtn', view);
    if (b) { b.classList.toggle('live', tableMicLive); b.classList.toggle('off', !tableMicLive); b.textContent = tableMicLive ? '🎙️' : '🔇'; }
    if (typeof toast === 'function') toast(tableMicLive ? 'Lobby Mic Live' : 'Lobby Mic Muted');
  };
  $('#jktInviteBtn', view).onclick = () => {
    if (typeof playSfx === 'function') playSfx('tap');
    openInviteForSeat(null);
  };
  $('#jktFillBotsBtn', view).onclick = () => {
    const filled = Rules.fillEmptySeatsWithBots(lobby);
    if (typeof playSfx === 'function') playSfx('tap');
    if (filled > 0) {
      syncRoomToCloud('waiting');
      renderTable();
      if (typeof toast === 'function') toast(`Filled ${filled} empty ${filled === 1 ? 'seat' : 'seats'} with Bots (invited friends untouched)`);
    }
  };
  $('#jktReadyBtn', view).onclick = () => {
    const mySeatObj = lobby.seats.find(s => s.uid === myUid);
    if (!mySeatObj) return;
    Rules.toggleSeatReady(lobby, mySeatObj.seat);
    if (typeof playSfx === 'function') playSfx('tap');
    syncRoomToCloud('waiting');
    renderTable();
  };

  const startBtn = $('#jktStartBtn', view);
  if (startBtn) {
    startBtn.onclick = () => {
      const gate = Rules.canStartLobbyMatch(lobby, { allowBotFillForEmpty: true });
      if (!gate.ok) {
        if (gate.reason === 'pending_invites') {
          if (typeof toast === 'function') toast(`Waiting for ${gate.pendingInvites.join(', ')} to join! Cancel invite (✕) if you want an empty seat.`);
        } else if (gate.reason === 'not_ready') {
          if (typeof toast === 'function') toast(`All joined players must tap Ready first (${gate.unreadyNames.join(', ')})`);
        }
        if (typeof playSfx === 'function') playSfx('duelWrong');
        return;
      }
      if (stake > 0) {
        if (typeof me !== 'undefined' && me.coins < stake) {
          if (typeof toast === 'function') toast(`Need ${stake} coins to start this table`);
          return;
        }
        if (typeof addReward === 'function') {
          addReward(-stake, 0, null, true, { silentSfx: true, skipLevelUp: true });
        }
        if (typeof playSfx === 'function') playSfx('stakeLock');
      } else if (typeof playSfx === 'function') {
        playSfx('turnStart');
      }
      // Strictly preserves all joined real friends & fills ONLY un-invited empty seats
      const finalRoster = Rules.resolveMatchRoster(lobby);
      syncRoomToCloud('playing');
      activeJackarooTableSync = null;
      launchJackaroo(stake, o.rival || null, mode, stake > 0 ? 'pro' : 'standard', roomCode, {
        seatRoster: finalRoster,
        tierLabel: tier,
        roomId
      });
    };
  }

  return view;
}
window.openJackarooTableLobby = openJackarooTableLobby;

function launchJackaroo(stake, rival, modeRaw, botTierRaw, roomCodeRaw, launchOpts) {
  const Rules = window.JackarooRules;
  if (!Rules) {
    if (typeof toast === 'function') toast('Jackaroo rules module failed to load.');
    return;
  }

  const lOpts = launchOpts || {};
  const mode = modeRaw === '1v1' ? '1v1' : '2v2';
  const botTier = botTierRaw || (Number(stake || 0) > 0 ? 'pro' : 'standard');
  const roomCode = String(roomCodeRaw || ('JK' + Math.random().toString(36).slice(2, 6))).trim().toUpperCase();
  const cfg = Rules.getBoardConfig(mode);
  const TRACK_LEN = cfg.trackLen;
  const HOME_LEN = cfg.homeLen;
  const palette = JK_SEAT_PALETTES[mode];
  const pay = calcArenaStakePayout(stake);

  const shuffle = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  let deckSeq = 0;
  const makeDeck = () => {
    const raw = typeof Rules.buildDeckForMode === 'function'
      ? Rules.buildDeckForMode(mode)
      : [];
    const d = raw.map(c => ({ ...c, id: `jk_${c.rank}_${c.suit}_${deckSeq++}` }));
    return shuffle(d);
  };

  let deck = makeDeck();
  let discard = [];

  const drawCards = (count) => {
    const out = [];
    for (let i = 0; i < count; i++) {
      if (!deck.length) {
        deck = discard.length ? shuffle(discard) : makeDeck();
        discard = [];
      }
      if (deck.length) out.push(deck.pop());
    }
    return out;
  };

  const oppName = rival?.name || (mode === '1v1' ? (botTier === 'pro' ? 'Rivara Pro' : 'Rivara') : 'Linda');
  const seatMeta = mode === '1v1'
    ? {
        0: { name: me?.name || 'You', avatar: me?.avatar || '🦊', gender: '♂', isFriend: false },
        2: { name: oppName, avatar: rival?.avatar || '🌟', gender: '♀', isFriend: Boolean(rival) }
      }
    : {
        0: { name: me?.name || 'You', avatar: me?.avatar || '🦊', gender: '♂', isFriend: false },
        1: { name: oppName, avatar: rival?.avatar || '👩', gender: '♀', isFriend: Boolean(rival) },
        2: { name: 'Alison', avatar: '🧑‍🎓', gender: '♀', isFriend: false },
        3: { name: 'Mery', avatar: '👑', gender: '♀', isFriend: false }
      };

  const rosterBySeat = new Map();
  if (Array.isArray(lOpts.seatRoster)) {
    lOpts.seatRoster.forEach(s => { if (s) rosterBySeat.set(Number(s.seat), s); });
  }

  const players = cfg.activeSeats.map(seat => {
    const rs = rosterBySeat.get(seat);
    const meta = seatMeta[seat];
    const isRealJoined = Boolean(rs && (rs.kind === 'joined' || rs.kind === 'invited'));
    return {
      seat,
      team: mode === '1v1' ? (seat === 0 ? 0 : 1) : (seat % 2),
      uid: rs?.uid || (seat === 0 ? (typeof uid !== 'undefined' ? uid : 'local') : `bot_${seat}`),
      name: (rs && rs.name) ? rs.name : meta.name,
      avatar: (rs && rs.avatar) ? rs.avatar : meta.avatar,
      gender: meta.gender,
      isBot: seat !== 0,
      isInvitedFriend: isRealJoined || meta.isFriend,
      startPos: cfg.startPositions[seat],
      hand: drawCards(4),
      color: palette[seat],
      micOn: isRealJoined || (seat !== 0 && Math.random() < 0.35)
    };
  });

  // Guarantee opening hand has a valid exit-base card (A, 2, or K in 1v1; A or 2 in 2v2)
  if (!players[0].hand.some(c => Rules.getCardRole(c, mode).canExitBase)) {
    const exitIdx = deck.findIndex(c => Rules.getCardRole(c, mode).canExitBase);
    if (exitIdx >= 0) {
      const swapped = deck.splice(exitIdx, 1)[0];
      deck.push(players[0].hand[0]);
      players[0].hand[0] = swapped;
    }
  }

  const marbles = [];
  players.forEach(p => {
    for (let i = 0; i < 4; i++) {
      marbles.push({
        id: `jm_${p.seat}_${i}`,
        owner: p.seat,
        idx: i,
        zone: 'base',
        pos: -1,
        homeIdx: -1,
        stepsFromStart: 0
      });
    }
  });

  // Match state
  let turnIdx = 0;
  let over = false;
  let isAnimating = false;
  let activeRaf = 0;
  let selectedCardId = null;
  let actionSubMode = null;
  let chosenSteps = null;
  let chosenSweep = false;
  let chosenAnyMarble = false;
  let jackMyMarbleId = null;
  let splitStepA = 3;
  let splitMarbleA = null;
  let lastActionText = 'Tap a glowing card to play';
  let burstCoord = null;
  let comboBanner = null;
  let comboTimer = 0;
  let botTimer = 0;
  let turnTickTimer = 0;
  let turnAutoTimer = 0;
  let turnDeadline = 0;
  let playerAfk = false;
  const TURN_SEC = (Rules.TURN_CONFIG && Rules.TURN_CONFIG.TURN_SECONDS) || 15;
  const TURN_MS = TURN_SEC * 1000;
  const RING_CIRC = 176; // 2 * PI * 28
  let rematchTimer = 0;
  let showVsIntro = true;
  let vsTimer = 0;
  let invitedGuests = [];
  let justDroppedCard = false;
  let pendingHiddenDiscard = null;
  let hiddenPickTimer = 0;

  // Mic & Voice Options state
  const micState = {
    live: false,
    mode: 'open', // 'open' | 'ptt'
    channel: 'all', // 'all' | 'team'
    noiseGate: true,
    speakerMuted: typeof SFX !== 'undefined' && typeof SFX.isMuted === 'function' ? SFX.isMuted() : false,
    stream: null,
    pttHolding: false
  };
  let chatChannel = 'all'; // 'all' | 'team'
  let openPopover = null; // null | 'mic' | 'emoji'

  const getStateObj = () => ({ mode, cfg, players, marbles });
  const findPlayer = seat => players.find(p => p.seat === seat);

  // =========================================================================
  // BOARD GEOMETRY — Authentic 52-Spot WePlay 1v1 Oval & 52-Spot 2v2 Cross
  // =========================================================================
  function build1v1TrackCoords() {
    // 52 spots clockwise matching WePlay 2-Player Reference (viewBox 380x460, center 190,230):
    // 0: Orange Start (bottom-left of 5-dot bottom bar)
    // 1..4: Left lower vertical leg going UP
    // 5: Bottom-left neck white-ring target (from swirl 43)
    // 6..16: 11-dot smooth left curved belly around center cards
    // 17: Top-left neck golden swirl (teleports RIGHT -> 31)
    // 18..21: Left upper vertical leg going UP
    // 22..26: Top 5-dot horizontal bar (24 = Green Home Entry, 26 = Green Start)
    // 27..30: Right upper vertical leg going DOWN
    // 31: Top-right neck white-ring target (from swirl 17)
    // 32..42: 11-dot smooth right curved belly around center cards
    // 43: Bottom-right neck golden swirl (teleports LEFT -> 5)
    // 44..47: Right lower vertical leg going DOWN
    // 48..51: Bottom horizontal bar going LEFT (50 = Orange Home Entry)
    const pts = [];
    // 0: Orange Start
    pts.push({ x: 148, y: 418 });
    // 1..4: Left lower leg going UP
    pts.push({ x: 148, y: 398 });
    pts.push({ x: 148, y: 378 });
    pts.push({ x: 148, y: 358 });
    pts.push({ x: 148, y: 338 });
    // 5: Bottom-left neck teleport landing ring
    pts.push({ x: 152, y: 318 });
    // 6..16: 11-dot left curved belly (120° -> 240° step 12°)
    for (let i = 0; i < 11; i++) {
      const deg = 120 + i * 12;
      const rad = (deg * Math.PI) / 180;
      pts.push({
        x: Number((190 + 110 * Math.cos(rad)).toFixed(1)),
        y: Number((230 + 88 * Math.sin(rad)).toFixed(1))
      });
    }
    // 17: Top-left neck golden swirl (teleports -> 31)
    pts.push({ x: 152, y: 142 });
    // 18..21: Left upper leg going UP
    pts.push({ x: 148, y: 122 });
    pts.push({ x: 148, y: 102 });
    pts.push({ x: 148, y: 82 });
    pts.push({ x: 148, y: 62 });
    // 22..26: Top 5-dot horizontal bar (24 = Green Home Entry, 26 = Green Start)
    pts.push({ x: 148, y: 42 }); // 22
    pts.push({ x: 169, y: 42 }); // 23
    pts.push({ x: 190, y: 42 }); // 24 (Green Home Entry)
    pts.push({ x: 211, y: 42 }); // 25
    pts.push({ x: 232, y: 42 }); // 26 (Green Start)
    // 27..30: Right upper leg going DOWN
    pts.push({ x: 232, y: 62 });
    pts.push({ x: 232, y: 82 });
    pts.push({ x: 232, y: 102 });
    pts.push({ x: 232, y: 122 });
    // 31: Top-right neck teleport landing ring (from 17)
    pts.push({ x: 228, y: 142 });
    // 32..42: 11-dot right curved belly (-60° -> +60° step 12°)
    for (let i = 0; i < 11; i++) {
      const deg = -60 + i * 12;
      const rad = (deg * Math.PI) / 180;
      pts.push({
        x: Number((190 + 110 * Math.cos(rad)).toFixed(1)),
        y: Number((230 + 88 * Math.sin(rad)).toFixed(1))
      });
    }
    // 43: Bottom-right neck golden swirl (teleports -> 5)
    pts.push({ x: 228, y: 318 });
    // 44..47: Right lower leg going DOWN
    pts.push({ x: 232, y: 338 });
    pts.push({ x: 232, y: 358 });
    pts.push({ x: 232, y: 378 });
    pts.push({ x: 232, y: 398 });
    // 48..51: Bottom bar going LEFT (50 = Orange Home Entry)
    pts.push({ x: 232, y: 418 }); // 48
    pts.push({ x: 211, y: 418 }); // 49
    pts.push({ x: 190, y: 418 }); // 50 (Orange Home Entry)
    pts.push({ x: 169, y: 418 }); // 51
    return pts;
  }

  function buildSymmetric2v2Coords() {
    // Authentic WePlay 4-Player (2v2) 72-spot cruciform cross (18 spots/quadrant, NO teleports!)
    // Starts: 0 (Red Bottom-Left), 18 (Green Left-Top), 36 (Amber Top-Right), 54 (Blue Right-Bottom)
    // Home entries (70 steps): 70 (Bottom-Mid), 16 (Left-Mid), 34 (Top-Mid), 52 (Right-Mid)
    const q18 = [
      { x: 172, y: 362 },   // 0: Seat 0 Start (Red bottom-left of 5-dot bar)
      { x: 172, y: 346.5 }, // 1: Left side of Red Home
      { x: 172, y: 331 },   // 2
      { x: 172, y: 315.5 }, // 3
      { x: 172, y: 300 },   // 4: Inner arm bend
      { x: 160, y: 288 },   // 5: 45-deg diagonal along central floral diamond
      { x: 148, y: 276 },   // 6
      { x: 136, y: 264 },   // 7
      { x: 124, y: 252 },   // 8
      { x: 112, y: 240 },   // 9
      { x: 100, y: 228 },   // 10: Inner arm bend (Left arm bottom side)
      { x: 84.5, y: 228 },  // 11
      { x: 69, y: 228 },    // 12
      { x: 53.5, y: 228 },  // 13
      { x: 38, y: 228 },    // 14: Left arm outer bottom-left corner
      { x: 38, y: 214 },    // 15
      { x: 38, y: 200 },    // 16: Left-Arm Center (Seat 1 Green Home Entry)
      { x: 38, y: 186 }     // 17 (Next point 18 = (38, 172) = Seat 1 Green Start!)
    ];
    const all = [];
    for (let q = 0; q < 4; q++) {
      for (const p of q18) {
        let dx = p.x - 200;
        let dy = p.y - 200;
        for (let r = 0; r < q; r++) {
          const ndx = -dy;
          const ndy = dx;
          dx = ndx;
          dy = ndy;
        }
        all.push({ x: Number((200 + dx).toFixed(1)), y: Number((200 + dy).toFixed(1)) });
      }
    }
    return all;
  }

  const trackPts = mode === '1v1' ? build1v1TrackCoords() : buildSymmetric2v2Coords();

  const trackXY = (pos) => trackPts[((pos % TRACK_LEN) + TRACK_LEN) % TRACK_LEN];

  const homeXY = (seat, hIdx) => {
    if (mode === '1v1') {
      // Centered vertical home columns aligned directly with home-entry spots 50 & 24 (x=190)
      if (seat === 0) return { x: 190, y: 396 - hIdx * 20 };
      return { x: 190, y: 64 + hIdx * 20 };
    }
    // 2v2: 4 home lanes aligned row-for-row with arm-side holes (15.5px spacing)
    if (seat === 0) return { x: 200, y: 346.5 - hIdx * 15.5 };
    if (seat === 1) return { x: 53.5 + hIdx * 15.5, y: 200 };
    if (seat === 2) return { x: 200, y: 53.5 + hIdx * 15.5 };
    return { x: 346.5 - hIdx * 15.5, y: 200 };
  };

  const baseCenters = mode === '1v1'
    ? {
        0: { x: 84, y: 366 },
        2: { x: 296, y: 94 }
      }
    : {
        0: { x: 106, y: 294 },
        1: { x: 106, y: 106 },
        2: { x: 294, y: 106 },
        3: { x: 294, y: 294 }
      };

  const baseXY = (seat, idx) => {
    const c = baseCenters[seat];
    const step = mode === '1v1' ? 14 : 12.2;
    // 4-petal clover diamond arrangement matching WePlay reference
    const offs = [[0, -step], [step, 0], [0, step], [-step, 0]][idx];
    return { x: c.x + offs[0], y: c.y + offs[1] };
  };

  const nodeXY = (ownerSeat, node) => {
    if (!node) return { x: 190, y: 230 };
    if (node.zone === 'home') return homeXY(ownerSeat, node.homeIdx);
    return trackXY(node.pos);
  };

  const marbleXY = (mb) => {
    if (mb.zone === 'base') return baseXY(mb.owner, mb.idx);
    if (mb.zone === 'home') return homeXY(mb.owner, mb.homeIdx);
    return trackXY(mb.pos);
  };

  // =========================================================================
  // 60FPS STEP-BY-STEP MARBLE HOP & SWAP ANIMATOR
  // =========================================================================
  const cancelActiveAnim = () => {
    if (activeRaf) {
      cancelAnimationFrame(activeRaf);
      activeRaf = 0;
    }
    isAnimating = false;
  };

  const spawnBoardRipple = (x, y, color, maxR, durMs) => {
    const svg = $('#jkSvg', m);
    const fxLayer = svg ? svg.querySelector('#jkAnimFxLayer') : null;
    if (!fxLayer) return;
    const ns = 'http://www.w3.org/2000/svg';
    const c = document.createElementNS(ns, 'circle');
    c.setAttribute('cx', x.toFixed(1));
    c.setAttribute('cy', y.toFixed(1));
    c.setAttribute('r', '5');
    c.setAttribute('fill', 'none');
    c.setAttribute('stroke', color || '#fef08a');
    c.setAttribute('stroke-width', '2.4');
    c.setAttribute('opacity', '0.92');
    fxLayer.appendChild(c);
    const t0 = performance.now();
    const d = durMs || 380;
    const rEnd = maxR || 16;
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / d);
      const r = 5 + (rEnd - 5) * (1 - Math.pow(1 - p, 2));
      c.setAttribute('r', r.toFixed(1));
      c.setAttribute('opacity', (0.9 * (1 - p)).toFixed(2));
      c.setAttribute('stroke-width', (2.4 * (1 - p * 0.55)).toFixed(2));
      if (p < 1 && c.parentNode) {
        requestAnimationFrame(tick);
      } else if (c.parentNode) {
        c.parentNode.removeChild(c);
      }
    };
    requestAnimationFrame(tick);
  };

  const animateMarbleWaypoints = (mbId, waypoints, onDone) => {
    const svg = $('#jkSvg', m);
    const gEl = svg ? svg.querySelector(`[data-jkm="${mbId}"]`) : null;
    if (!gEl || !waypoints || waypoints.length < 2) {
      if (typeof onDone === 'function') onDone();
      return;
    }
    cancelActiveAnim();
    isAnimating = true;
    // Raise moving marble to top of SVG stacking order so it hops cleanly over other stones
    if (gEl.parentNode) gEl.parentNode.appendChild(gEl);

    const mbObj = marbles.find(x => x.id === mbId);
    const hopColor = mbObj && palette[mbObj.owner] ? palette[mbObj.owner].hi : '#fef08a';
    const shEl = gEl.querySelector('[data-jksh]');
    const segCount = waypoints.length - 1;
    let segIdx = 0;
    let segStart = performance.now();

    const stepFrame = (now) => {
      if (over) { cancelActiveAnim(); return; }
      const fromPt = waypoints[segIdx];
      const toPt = waypoints[segIdx + 1];
      const isJump = Boolean(toPt.isTeleport || toPt.isExit);
      // Enjoyable, unhurried step-by-step pacing so every hop is satisfying to watch
      const dur = toPt.isTeleport
        ? 480
        : toPt.isExit
          ? 420
          : (segCount <= 4 ? 235 : segCount <= 8 ? 195 : 165);
      const rawT = Math.min(1, (now - segStart) / dur);
      // Smooth ease-in-out per hop with expressive parabolic arc
      const ease = rawT < 0.5 ? 2 * rawT * rawT : 1 - Math.pow(-2 * rawT + 2, 2) / 2;
      const x = fromPt.x + (toPt.x - fromPt.x) * ease;
      const arcSin = Math.sin(rawT * Math.PI);
      const arcLift = arcSin * (toPt.isTeleport ? 30 : toPt.isExit ? 26 : 14.5);
      const y = fromPt.y + (toPt.y - fromPt.y) * ease - arcLift;
      const sc = 1 + arcSin * (isJump ? 0.34 : 0.22);
      gEl.setAttribute('transform', `translate(${x.toFixed(1)},${y.toFixed(1)}) scale(${sc.toFixed(3)})`);
      if (shEl) {
        shEl.setAttribute('cy', (2 + arcLift * 0.65).toFixed(1));
        shEl.setAttribute('opacity', (0.36 - arcSin * 0.16).toFixed(2));
      }

      if (rawT < 1) {
        activeRaf = requestAnimationFrame(stepFrame);
        return;
      }

      // Snap cleanly on arrival at each hole + crisp landing ripple & wood-click sound
      gEl.setAttribute('transform', `translate(${toPt.x.toFixed(1)},${toPt.y.toFixed(1)})`);
      if (shEl) {
        shEl.setAttribute('cy', '2');
        shEl.setAttribute('opacity', '0.35');
      }
      spawnBoardRipple(toPt.x, toPt.y, toPt.isTeleport ? '#f59e0b' : hopColor, isJump ? 22 : 14, isJump ? 420 : 300);
      if (typeof playSfx === 'function') {
        playSfx('tap');
      }
      segIdx++;
      if (segIdx < segCount) {
        segStart = now;
        activeRaf = requestAnimationFrame(stepFrame);
      } else {
        activeRaf = 0;
        isAnimating = false;
        if (typeof onDone === 'function') onDone();
      }
    };

    activeRaf = requestAnimationFrame(stepFrame);
  };

  const animateDualSwap = (mbAId, ptA, mbBId, ptB, onDone) => {
    const svg = $('#jkSvg', m);
    const elA = svg ? svg.querySelector(`[data-jkm="${mbAId}"]`) : null;
    const elB = svg ? svg.querySelector(`[data-jkm="${mbBId}"]`) : null;
    if (!elA || !elB) {
      if (typeof onDone === 'function') onDone();
      return;
    }
    cancelActiveAnim();
    isAnimating = true;
    if (elA.parentNode) {
      elA.parentNode.appendChild(elA);
      elB.parentNode.appendChild(elB);
    }

    const mbA = marbles.find(x => x.id === mbAId);
    const mbB = marbles.find(x => x.id === mbBId);
    const colA = mbA && palette[mbA.owner] ? palette[mbA.owner].hi : '#fef08a';
    const colB = mbB && palette[mbB.owner] ? palette[mbB.owner].hi : '#60a5fa';

    const dur = 760;
    const start = performance.now();
    const dx = ptB.x - ptA.x;
    const dy = ptB.y - ptA.y;
    const dist = Math.hypot(dx, dy) || 1;
    const nx = -dy / dist;
    const ny = dx / dist;
    const bow = Math.min(46, Math.max(24, dist * 0.28));

    // Draw glowing golden orbital swap arcs in the animation FX layer
    const fxLayer = svg ? svg.querySelector('#jkAnimFxLayer') : null;
    const ns = 'http://www.w3.org/2000/svg';
    let trailGroup = null;
    if (fxLayer) {
      trailGroup = document.createElementNS(ns, 'g');
      const midAx = (ptA.x + ptB.x) / 2 + nx * bow * 1.35;
      const midAy = (ptA.y + ptB.y) / 2 + ny * bow * 1.35 - 12;
      const midBx = (ptA.x + ptB.x) / 2 - nx * bow * 1.35;
      const midBy = (ptA.y + ptB.y) / 2 - ny * bow * 1.35 - 12;

      const makeArc = (dStr, strokeCol) => {
        const p = document.createElementNS(ns, 'path');
        p.setAttribute('d', dStr);
        p.setAttribute('fill', 'none');
        p.setAttribute('stroke', strokeCol);
        p.setAttribute('stroke-width', '3.2');
        p.setAttribute('stroke-linecap', 'round');
        p.setAttribute('stroke-dasharray', '6 5');
        p.setAttribute('opacity', '0.85');
        return p;
      };
      trailGroup.appendChild(makeArc(`M${ptA.x.toFixed(1)} ${ptA.y.toFixed(1)} Q${midAx.toFixed(1)} ${midAy.toFixed(1)} ${ptB.x.toFixed(1)} ${ptB.y.toFixed(1)}`, colA));
      trailGroup.appendChild(makeArc(`M${ptB.x.toFixed(1)} ${ptB.y.toFixed(1)} Q${midBx.toFixed(1)} ${midBy.toFixed(1)} ${ptA.x.toFixed(1)} ${ptA.y.toFixed(1)}`, colB));
      fxLayer.appendChild(trailGroup);
    }

    // Launch shockwave rings at both starting positions
    spawnBoardRipple(ptA.x, ptA.y, colA, 22, 460);
    spawnBoardRipple(ptB.x, ptB.y, colB, 22, 460);
    if (typeof playSfx === 'function') playSfx('turnStart');

    const frame = (now) => {
      if (over) {
        if (trailGroup && trailGroup.parentNode) trailGroup.parentNode.removeChild(trailGroup);
        cancelActiveAnim();
        return;
      }
      const rawT = Math.min(1, (now - start) / dur);
      // Cubic ease-in-out for luxurious sweeping crossover
      const ease = rawT < 0.5
        ? 4 * rawT * rawT * rawT
        : 1 - Math.pow(-2 * rawT + 2, 3) / 2;
      const arch = Math.sin(rawT * Math.PI);
      const ax = ptA.x + dx * ease + nx * bow * arch;
      const ay = ptA.y + dy * ease + ny * bow * arch - arch * 18;
      const bx = ptB.x - dx * ease - nx * bow * arch;
      const by = ptB.y - dy * ease - ny * bow * arch - arch * 18;
      const sc = 1 + arch * 0.34;
      elA.setAttribute('transform', `translate(${ax.toFixed(1)},${ay.toFixed(1)}) scale(${sc.toFixed(3)})`);
      elB.setAttribute('transform', `translate(${bx.toFixed(1)},${by.toFixed(1)}) scale(${sc.toFixed(3)})`);
      if (trailGroup) {
        trailGroup.setAttribute('opacity', (0.9 * Math.sin(Math.min(1, rawT * 1.15) * Math.PI)).toFixed(2));
      }
      if (rawT < 1) {
        activeRaf = requestAnimationFrame(frame);
      } else {
        if (trailGroup && trailGroup.parentNode) trailGroup.parentNode.removeChild(trailGroup);
        elA.setAttribute('transform', `translate(${ptB.x.toFixed(1)},${ptB.y.toFixed(1)})`);
        elB.setAttribute('transform', `translate(${ptA.x.toFixed(1)},${ptA.y.toFixed(1)})`);
        spawnBoardRipple(ptB.x, ptB.y, '#fef08a', 24, 420);
        spawnBoardRipple(ptA.x, ptA.y, '#fef08a', 24, 420);
        activeRaf = 0;
        isAnimating = false;
        if (typeof onDone === 'function') onDone();
      }
    };
    activeRaf = requestAnimationFrame(frame);
  };

  const triggerComboPopup = (label) => {
    comboBanner = label;
    clearTimeout(comboTimer);
    comboTimer = setTimeout(() => {
      comboBanner = null;
      const el = $('#jkComboPop', m);
      if (el) el.remove();
    }, 1250);
  };

  const captureMarbleObj = (vic, moverOwnerSeat) => {
    if (!vic || vic.zone !== 'track') return false;
    if (Rules.isSafeStartMarble(vic, players)) return false;
    if (moverOwnerSeat != null && vic.owner === moverOwnerSeat) return false;
    const pt = trackXY(vic.pos);
    burstCoord = { x: pt.x, y: pt.y, color: palette[vic.owner].hex };
    vic.zone = 'base';
    vic.pos = -1;
    vic.homeIdx = -1;
    vic.stepsFromStart = 0;
    if (typeof playSfx === 'function') playSfx('duelCorrect');
    return true;
  };

  const captureAtPos = (moverSeat, pos) => {
    const vic = marbles.find(x => x.zone === 'track' && x.pos === pos && x.owner !== moverSeat && !Rules.isSafeStartMarble(x, players));
    return vic && captureMarbleObj(vic, moverSeat) ? vic : null;
  };

  const grantComboDraw = (p) => {
    if (!p || p.hand.length >= 5) return false;
    const bonus = drawCards(1);
    if (bonus.length) {
      p.hand.push(bonus[0]);
      return true;
    }
    return false;
  };

  const checkWinner = () => {
    for (const team of [0, 1]) {
      const teamSeats = players.filter(p => p.team === team).map(p => p.seat);
      const teamM = marbles.filter(mb => teamSeats.includes(mb.owner));
      if (teamM.length && teamM.every(mb => mb.zone === 'home')) return team;
    }
    return null;
  };

  const refillHandsIfEmpty = () => {
    if (players.every(p => p.hand.length === 0)) {
      players.forEach(p => { p.hand = drawCards(4); });
      lastActionText = '🃏 New 4-card round dealt!';
    }
  };

  const consumeCard = (p, cardId) => {
    const idx = p.hand.findIndex(c => c.id === cardId);
    if (idx >= 0) discard.push(p.hand.splice(idx, 1)[0]);
  };

  const getTeamScore = (team) => {
    const seats = players.filter(p => p.team === team).map(p => p.seat);
    return marbles.filter(mb => seats.includes(mb.owner) && mb.zone === 'home').length;
  };

  const totalTeamMarbles = mode === '1v1' ? 4 : 8;

  // Pictorial Card Face Renderer (Exact WePlay Card Iconography)
  const renderCardArt = (c) => {
    const r = c.rank;
    const isRed = c.red;
    if (r === 'A' || r === '2') {
      return `
        <div class="jkc-pic">
          <svg viewBox="0 0 38 30" width="34" height="27" aria-hidden="true">
            <path d="M13 3 L25 3 L19 13 Z" fill="currentColor"/>
            <circle cx="19" cy="19" r="4.8" fill="currentColor"/>
            <line x1="5" y1="26" x2="33" y2="26" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <span class="jkc-subnum">${r === 'A' ? '1' : '2'}</span>
        </div>
      `;
    }
    if (r === 'K') {
      return `
        <div class="jkc-pic">
          <svg viewBox="0 0 38 30" width="34" height="26" aria-hidden="true">
            <path d="M13 3 L25 3 L19 13 Z" fill="currentColor"/>
            <circle cx="19" cy="19" r="4.8" fill="currentColor"/>
            <line x1="5" y1="26" x2="33" y2="26" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <span class="jkc-subnum">13▸⊗</span>
        </div>
      `;
    }
    if (r === '7') {
      return `<div class="jkc-num">7</div><div class="jkc-subnum">●+●=</div>`;
    }
    if (r === '5') {
      return `
        <div class="jkc-five-wrap">
          <span class="jkc-num">5</span>
          <span class="jkc-dots4-v" aria-hidden="true">
            <i style="background:#2563eb"></i><i style="background:#ef4444"></i>
            <i style="background:#f59e0b"></i><i style="background:#22c55e"></i>
          </span>
        </div>
      `;
    }
    if (r === '4') {
      return `<div class="jkc-num">4</div><div class="jkc-subnum">↩ −4</div>`;
    }
    if (r === '10') {
      return `<div class="jkc-num">10</div><div class="jkc-subnum">10 / ▸▭</div>`;
    }
    if (r === 'J') {
      return isRed
        ? `<div class="jkc-num">11</div>`
        : `<div class="jkc-swap">⇄</div><div class="jkc-subnum">SWAP</div>`;
    }
    if (r === 'Q') {
      return isRed
        ? `
          <svg viewBox="0 0 42 32" width="38" height="28" aria-hidden="true">
            <polygon points="4,8 16,16 4,24" fill="currentColor"/>
            <path d="M19 7 L36 4 L36 16 L19 19 Z" fill="currentColor"/>
            <path d="M19 22 L36 19 L36 28 L19 29 Z" fill="currentColor" opacity=".88"/>
          </svg>
        `
        : `<div class="jkc-num">12</div>`;
    }
    return `<div class="jkc-num">${r}</div>`;
  };

  // Build Full-Screen Native WePlay-Style Shell
  const openShell = typeof openFullScreenGameView === 'function'
    ? openFullScreenGameView({
        gameId: 'jackaroo',
        title: `Jackaroo Room`,
        subMeta: `ID ${roomCode}`,
        statusText: 'Your Turn',
        statusTone: 'turn',
        themeClass: 'gfs-theme-jackaroo',
        html: `
          <div class="jk-royal-stage ${mode === '2v2' ? 'mode-2v2' : 'mode-1v1'}" id="jkShell" data-testid="jackaroo-stage" data-mode="${mode}">
            ${mode === '2v2' ? `
              <div class="jk-room-top">
                <div class="jk-room-tl">
                  <button type="button" class="jk-ghost-icon" id="jkExitBtn" aria-label="Leave Jackaroo Room">‹</button>
                  <div class="jk-room-idwrap">
                    <b>Jackaroo Room</b>
                    <small>Game · ID ${esc(roomCode)}</small>
                  </div>
                </div>
                <div class="jk-room-tr">
                  <button type="button" class="jk-mini-pill" id="jkRulesBtn" aria-label="Open Jackaroo Rules" title="Rules">📖</button>
                  <button type="button" class="jk-invite-pill" id="jkInviteBtn" aria-label="Invite Friends">+ Invite</button>
                  <span class="jk-viewer-pill" aria-label="Room audience">👁 <b id="jkViewers">14</b></span>
                  <button type="button" class="jk-ghost-icon sm" id="jkMenuBtn" aria-label="Room Menu">•••</button>
                </div>
              </div>
              <div class="jk-seat-strip" id="jkSeatStrip">
                ${players.map(p => `<span class="jk-mini-seat" style="--sc:${p.color.hex}" title="${esc(p.name)}">${jkAvatarHtml(p.avatar)}</span>`).join('')}
                <button type="button" class="jk-seat-plus" data-jk-invite="1" aria-label="Invite friend to seat">+</button>
                <button type="button" class="jk-seat-plus" data-jk-invite="1" aria-label="Invite friend to seat">+</button>
                <button type="button" class="jk-seat-plus" data-jk-invite="1" aria-label="Invite friend to seat">+</button>
                <button type="button" class="jk-seat-plus" data-jk-invite="1" aria-label="Invite friend to seat">+</button>
              </div>
            ` : `
              <div class="jk-top-strip">
                <div class="jk-top-left">
                  <button type="button" class="jk-round-menu" id="jkMenuBtn" aria-label="Game Menu" title="Menu">☰</button>
                  <span class="jk-viewer-pill" aria-label="Spectators">👁 <b id="jkViewers">0</b></span>
                </div>
                <div class="jk-top-right">
                  <button type="button" class="jk-chip-btn" id="jkRulesBtn" aria-label="Open Jackaroo Rules">📖 Rules</button>
                  <button type="button" class="jk-invite-pill" id="jkInviteBtn" aria-label="Invite Friends">+ Invite</button>
                  <button type="button" class="jk-round-menu sm" id="jkExitBtn" aria-label="Exit Game" title="Exit">✕</button>
                </div>
              </div>
            `}

            ${stake > 0 ? `<div class="arena-pot-ribbon jk-pot-bar">Pot ${fmtNum(pay.grossPot)} 🪙 · Win +${fmtNum(pay.winnerPayout)} 🪙 (${pay.feePercent}% fee)</div>` : ''}

            <div class="jk-arena-wrap" id="jkBoardWrap">
              <div class="jk-corners-layer" id="jkCornersLayer"></div>
              <svg class="jk-board-svg ${mode === '1v1' ? 'is-1v1' : 'is-2v2'}" id="jkSvg" viewBox="${mode === '1v1' ? '0 0 380 460' : '0 0 400 400'}" aria-label="Jackaroo Royal Board"></svg>
              <div id="jkPopLayer" class="jk-pop-layer"></div>
            </div>

            <div class="jk-action-bar" id="jkActionBar"></div>
            <div class="jk-hand-tray" id="jkHandTray"></div>

            ${mode === '2v2' ? `<div class="jk-sys-notice">🔔 <b>System:</b> Welcome to Jackaroo Voice Room.</div>` : ''}

            <div id="jkPopoverHost" class="jk-popover-host"></div>

            <div class="jk-voice-dock" id="jkVoiceDock">
              <button type="button" class="jk-dock-btn ${micState.speakerMuted ? 'off' : ''}" id="jkSpkBtn" aria-label="Toggle Speaker Audio" title="Speaker On/Off">
                ${micState.speakerMuted ? '🔇' : '🔊'}
              </button>
              <button type="button" class="jk-dock-btn jk-mic-btn ${micState.live ? 'live' : 'off'}" id="jkMicBtn" aria-pressed="${micState.live ? 'true' : 'false'}" aria-label="Toggle Microphone" title="Toggle Mic">
                ${micState.live ? '🎙️' : '🔇'}
              </button>
              <button type="button" class="jk-dock-btn jk-mic-opt-btn" id="jkMicOptBtn" aria-label="Microphone Options" title="Mic Options">⚙️</button>
              <div class="jk-chat-pill">
                <button type="button" class="jk-ch-toggle" id="jkChBtn" title="Switch All / Team chat">All</button>
                <input type="text" id="jkChatInput" placeholder="Please enter.." maxlength="90" autocomplete="off" aria-label="Table chat message">
              </div>
              <button type="button" class="jk-dock-btn" id="jkEmojiBtn" aria-label="Send Emoji Reaction" title="Emotes">😊</button>
              <button type="button" class="jk-dock-btn" id="jkQvBtn" aria-label="Open Quick Voice Callouts" title="Quick Voice">💬</button>
            </div>

            <div id="jkOverlayHost"></div>
          </div>
        `
      })
    : modal(`Jackaroo Royal · ${mode}`, `<div id="jkShell"></div>`, 'jk-modal');

  const m = openShell;

  // =========================================================================
  // MICROPHONE HARDWARE + OPTIONS + FLOATING BUBBLES
  // =========================================================================
  const stopMicStream = () => {
    if (micState.stream) {
      try { micState.stream.getTracks().forEach(t => t.stop()); } catch {}
      micState.stream = null;
    }
  };

  const showAvatarBubble = (seat, text) => {
    const layer = $('#jkPopLayer', m);
    if (!layer) return;
    const p = findPlayer(seat);
    const b = document.createElement('div');
    const posClass = mode === '1v1'
      ? (seat === 0 ? 'bl' : 'tr')
      : (seat === 0 ? 'bl' : seat === 1 ? 'tl' : seat === 2 ? 'tr' : 'br');
    b.className = `jk-av-bubble ${posClass}`;
    b.innerHTML = `<b>${esc(p?.name?.slice(0, 10) || 'Player')}:</b> ${esc(text)}`;
    layer.appendChild(b);
    setTimeout(() => b.classList.add('out'), 2200);
    setTimeout(() => b.remove(), 2650);
  };

  const setMicLive = async (nextOn) => {
    micState.live = Boolean(nextOn);
    players[0].micOn = micState.live;
    if (micState.live) {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          micState.stream = await navigator.mediaDevices.getUserMedia({
            audio: { noiseSuppression: micState.noiseGate, echoCancellation: true }
          });
        }
      } catch {
        // Headless or denied permission: graceful live-mic UI state
      }
      if (typeof toast === 'function') {
        toast(`Mic Live (${micState.mode === 'ptt' ? 'Push-to-Talk' : 'Open'} · ${micState.channel === 'team' ? 'Team' : 'All'})`);
      }
    } else {
      stopMicStream();
      if (typeof toast === 'function') toast('Mic Muted');
    }
    if (typeof playSfx === 'function') playSfx('tap');
    syncDockUi();
    renderCorners();
  };

  const syncDockUi = () => {
    const spk = $('#jkSpkBtn', m);
    if (spk) {
      spk.classList.toggle('off', micState.speakerMuted);
      spk.textContent = micState.speakerMuted ? '🔇' : '🔊';
    }
    const micBtn = $('#jkMicBtn', m);
    if (micBtn) {
      micBtn.classList.toggle('live', micState.live);
      micBtn.classList.toggle('off', !micState.live);
      micBtn.setAttribute('aria-pressed', micState.live ? 'true' : 'false');
      micBtn.textContent = micState.live ? '🎙️' : '🔇';
      micBtn.title = micState.mode === 'ptt' ? 'Hold to Talk (PTT)' : 'Toggle Live Mic';
    }
    const chBtn = $('#jkChBtn', m);
    if (chBtn) {
      chBtn.textContent = chatChannel === 'team' ? 'Team' : 'All';
      chBtn.classList.toggle('team', chatChannel === 'team');
    }
  };

  const closePopover = () => {
    openPopover = null;
    const host = $('#jkPopoverHost', m);
    if (host) host.innerHTML = '';
  };

  const renderMicOptionsPopover = () => {
    const host = $('#jkPopoverHost', m);
    if (!host) return;
    if (openPopover === 'mic') { closePopover(); return; }
    openPopover = 'mic';
    const tone = typeof QuickVoice !== 'undefined' ? QuickVoice.getTone() : 'female';
    host.innerHTML = `
      <div class="jk-pop-card" role="dialog" aria-label="Microphone Options">
        <div class="jk-pop-head">
          <b>🎙️ Mic &amp; Voice Options</b>
          <button type="button" class="jk-pop-x" id="jkPopClose" aria-label="Close mic options">✕</button>
        </div>
        <div class="jk-opt-row">
          <span>Mic Status</span>
          <button type="button" class="btn sm ${micState.live ? 'ok' : 'ghost'}" id="jkOptMicToggle">${micState.live ? 'Live On' : 'Muted'}</button>
        </div>
        <div class="jk-opt-row">
          <span>Mic Mode</span>
          <div class="jk-seg">
            <button type="button" class="${micState.mode === 'open' ? 'on' : ''}" data-micmode="open">Open Mic</button>
            <button type="button" class="${micState.mode === 'ptt' ? 'on' : ''}" data-micmode="ptt">Push-to-Talk</button>
          </div>
        </div>
        <div class="jk-opt-row">
          <span>Voice Channel</span>
          <div class="jk-seg">
            <button type="button" class="${micState.channel === 'all' ? 'on' : ''}" data-micch="all">All Table</button>
            <button type="button" class="${micState.channel === 'team' ? 'on' : ''}" data-micch="team">Team Only</button>
          </div>
        </div>
        <div class="jk-opt-row">
          <span>Noise Gate</span>
          <button type="button" class="btn sm ${micState.noiseGate ? 'ok' : 'ghost'}" id="jkOptNoise">${micState.noiseGate ? 'On' : 'Off'}</button>
        </div>
        <div class="jk-opt-row">
          <span>AI Voice Tone</span>
          <button type="button" class="btn sm gold" id="jkOptTone">${tone === 'male' ? '♂ Male' : '♀ Female'}</button>
        </div>
      </div>
    `;
    $('#jkPopClose', host).onclick = closePopover;
    $('#jkOptMicToggle', host).onclick = () => { setMicLive(!micState.live); renderMicOptionsPopover(); openPopover = 'mic'; };
    host.querySelectorAll('[data-micmode]').forEach(b => {
      b.onclick = () => {
        micState.mode = b.dataset.micmode;
        if (micState.mode === 'ptt' && micState.live) setMicLive(false);
        openPopover = null;
        renderMicOptionsPopover();
        if (typeof toast === 'function') toast(micState.mode === 'ptt' ? 'Push-to-Talk enabled (hold Mic button)' : 'Open Mic mode selected');
      };
    });
    host.querySelectorAll('[data-micch]').forEach(b => {
      b.onclick = () => {
        micState.channel = b.dataset.micch;
        openPopover = null;
        renderMicOptionsPopover();
        if (typeof toast === 'function') toast(`Voice channel: ${micState.channel === 'team' ? 'Team Only' : 'All Players'}`);
      };
    });
    $('#jkOptNoise', host).onclick = () => {
      micState.noiseGate = !micState.noiseGate;
      openPopover = null;
      renderMicOptionsPopover();
    };
    $('#jkOptTone', host).onclick = () => {
      if (typeof QuickVoice !== 'undefined') QuickVoice.toggleTone();
      openPopover = null;
      renderMicOptionsPopover();
    };
  };

  const renderEmojiPopover = () => {
    const host = $('#jkPopoverHost', m);
    if (!host) return;
    if (openPopover === 'emoji') { closePopover(); return; }
    openPopover = 'emoji';
    const emotes = ['🔥', '😂', '👏', '😎', '😱', '❤️', '👑', '⚡'];
    host.innerHTML = `
      <div class="jk-pop-card jk-emoji-card" role="dialog" aria-label="Emoji reactions">
        <div class="jk-emoji-grid">
          ${emotes.map(e => `<button type="button" class="jk-em-btn" data-jkem="${e}">${e}</button>`).join('')}
        </div>
      </div>
    `;
    host.querySelectorAll('[data-jkem]').forEach(b => {
      b.onclick = () => {
        const em = b.dataset.jkem;
        closePopover();
        showAvatarBubble(0, em);
        if (typeof playSfx === 'function') playSfx('reactionPop');
      };
    });
  };

  // Invite Friend handler (reusable across top bar, + seats, and Game Over)
  const triggerInviteFriend = () => {
    openJackarooInviteModal({
      mode,
      roomCode,
      stake,
      onSwitchMode: (nextMode) => {
        m.close();
        launchJackaroo(stake, rival, nextMode, botTier, roomCode);
      },
      onInviteFriend: (friend) => {
        // Seat the invited friend into the first bot seat not yet replaced
        const slot = players.find(p => p.isBot && !p.isInvitedFriend) || players.find(p => p.isBot);
        if (slot) {
          slot.name = friend.name;
          slot.avatar = friend.avatar || '🎮';
          slot.isInvitedFriend = true;
          slot.micOn = true;
          invitedGuests.push(friend);
          lastActionText = `🤝 ${friend.name} joined your Jackaroo table!`;
          showAvatarBubble(slot.seat, 'Ready to play! 🔥');
          render();
        }
      }
    });
  };

  // =========================================================================
  // VS INTRO & GOLDEN WINGED GAME OVER SCREEN (Screenshots 1 & 7)
  // =========================================================================
  const renderVsIntro = () => {
    const host = $('#jkOverlayHost', m);
    if (!host) return;
    if (!showVsIntro) { host.innerHTML = ''; return; }
    const leftP = players[0];
    const rightP = mode === '1v1' ? players[1] : players[1];
    host.innerHTML = `
      <div class="jk-vs-overlay" id="jkVsOverlay" role="status" aria-label="Match Starting">
        <div class="jk-vs-banner">
          <div class="jk-vs-ribbon left"><span>${leftP.color.badge}</span></div>
          <div class="jk-vs-emblem">VS</div>
          <div class="jk-vs-ribbon right"><span>${rightP.color.badge}</span></div>
        </div>
        <div class="jk-vs-cols">
          <div class="jk-vs-col blue">
            <div class="jk-4balls">
              <i style="--b:#ef4444"></i><i style="--b:#38bdf8"></i>
              <i style="--b:#f59e0b"></i><i style="--b:#22c55e"></i>
            </div>
            <div class="jk-rank-c">${leftP.color.badge}</div>
            <div class="jk-vs-av">${jkAvatarHtml(leftP.avatar)}</div>
            <b>${esc(leftP.name)}</b>
          </div>
          <div class="jk-vs-col gold">
            <div class="jk-4balls">
              <i style="--b:#ef4444"></i><i style="--b:#38bdf8"></i>
              <i style="--b:#f59e0b"></i><i style="--b:#22c55e"></i>
            </div>
            <div class="jk-rank-c">${rightP.color.badge}</div>
            <div class="jk-vs-av">${jkAvatarHtml(rightP.avatar)}</div>
            <b>${esc(rightP.name)}</b>
          </div>
        </div>
        <small class="jk-vs-tap">Tap anywhere to start</small>
      </div>
    `;
    const ov = $('#jkVsOverlay', host);
    const dismiss = () => {
      if (!showVsIntro) return;
      showVsIntro = false;
      clearTimeout(vsTimer);
      host.innerHTML = '';
      if (!over) startTurnTimer();
    };
    if (ov) ov.onclick = dismiss;
    clearTimeout(vsTimer);
    vsTimer = setTimeout(dismiss, 1150);
  };

  const renderGameOverOverlay = (winTeam, res) => {
    const host = $('#jkOverlayHost', m);
    if (!host) return;
    const myWon = winTeam === 0;
    const meP = players[0];
    const oppP = players.find(p => p.team === 1) || players[1];
    let secs = 14;

    host.innerHTML = `
      <div class="jk-go-overlay" id="jkGoOverlay" role="dialog" aria-label="Game Over">
        <div class="jk-go-crest">
          <svg viewBox="0 0 320 76" class="jk-wings-svg" aria-hidden="true">
            <defs>
              <linearGradient id="jkWingG" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="#fef08a"/>
                <stop offset="50%" stop-color="#f59e0b"/>
                <stop offset="100%" stop-color="#92400e"/>
              </linearGradient>
            </defs>
            <path d="M12 18 L86 30 L74 44 L24 44 Z M26 42 L84 44 L76 58 L38 56 Z" fill="url(#jkWingG)" stroke="#fef9c3" stroke-width="1"/>
            <path d="M308 18 L234 30 L246 44 L296 44 Z M294 42 L236 44 L244 58 L282 56 Z" fill="url(#jkWingG)" stroke="#fef9c3" stroke-width="1"/>
            <rect x="82" y="20" width="156" height="38" rx="14" fill="#6b4a1e" stroke="url(#jkWingG)" stroke-width="3.5"/>
            <polygon points="160,6 168,18 160,26 152,18" fill="#10b981" stroke="#fef08a" stroke-width="1.5"/>
          </svg>
          <span class="jk-go-title">GAME OVER</span>
        </div>

        <div class="jk-go-cols">
          <div class="jk-go-col ${myWon ? 'win' : 'lose'}">
            ${myWon ? '<div class="jk-win-tag">WIN</div>' : '<div class="jk-win-tag spacer">&nbsp;</div>'}
            <div class="jk-4balls">
              <i style="--b:#ef4444"></i><i style="--b:#38bdf8"></i>
              <i style="--b:#f59e0b"></i><i style="--b:#22c55e"></i>
            </div>
            <div class="jk-rank-c">C</div>
            <div class="jk-vs-av">${jkAvatarHtml(meP.avatar)}</div>
            <b>${esc(meP.name.slice(0, 12))}</b>
            <span class="jk-pts-pill ${myWon ? 'plus' : 'minus'}">${myWon ? '+18' : '-18'}</span>
          </div>

          <div class="jk-go-col ${!myWon ? 'win' : 'lose'}">
            ${!myWon ? '<div class="jk-win-tag">WIN</div>' : '<div class="jk-win-tag spacer">&nbsp;</div>'}
            <div class="jk-4balls">
              <i style="--b:#ef4444"></i><i style="--b:#38bdf8"></i>
              <i style="--b:#f59e0b"></i><i style="--b:#22c55e"></i>
            </div>
            <div class="jk-rank-c">C</div>
            <div class="jk-vs-av">${jkAvatarHtml(oppP.avatar)}</div>
            <b>${esc(oppP.name.slice(0, 12))}</b>
            <span class="jk-pts-pill ${!myWon ? 'plus' : 'minus'}">${!myWon ? '+18' : '-18'}</span>
            <button type="button" class="jk-add-f-btn" id="jkGoAddFriend" aria-label="Invite or add friend" title="Invite Friend">👤+</button>
          </div>
        </div>

        <div class="jk-go-reward">${esc(res.headline)} · ${esc(res.detail)}</div>

        <div class="jk-go-actions">
          <button type="button" class="jk-go-exit-btn" id="jkGoExit" aria-label="Exit to Lobby">🚪</button>
          <button type="button" class="jk-go-again-btn" id="jkGoAgain">Play Again (<span id="jkGoSec">${secs}</span>s)</button>
        </div>
      </div>
    `;

    $('#jkGoExit', host).onclick = () => { clearInterval(rematchTimer); m.close(); };
    $('#jkGoAgain', host).onclick = () => {
      clearInterval(rematchTimer);
      m.close();
      launchJackaroo(stake, rival, mode, botTier, roomCode);
    };
    $('#jkGoAddFriend', host).onclick = () => triggerInviteFriend();

    clearInterval(rematchTimer);
    rematchTimer = setInterval(() => {
      secs--;
      const secEl = $('#jkGoSec', host);
      if (secEl) secEl.textContent = String(Math.max(0, secs));
      if (secs <= 0) clearInterval(rematchTimer);
    }, 1000);
  };

  // =========================================================================
  // GAME ENGINE FLOW (ANIMATED STEP-BY-STEP + SMART 1-TAP PLAY)
  // =========================================================================
  const endMatch = (winTeam) => {
    over = true;
    cancelActiveAnim();
    stopTurnTimer();
    clearTimeout(hiddenPickTimer);
    pendingHiddenDiscard = null;
    const outcome = winTeam === 0 ? 'win' : 'lose';
    if (typeof me !== 'undefined' && me) {
      me.stats = me.stats || {};
      me.stats.jk_matches = Number(me.stats.jk_matches || 0) + 1;
      if (outcome === 'win') me.stats.jk_wins = Number(me.stats.jk_wins || 0) + 1;
      if (typeof saveMe === 'function') saveMe();
    }
    const res = settleArenaMatchOutcome(outcome, stake, 55, 38, 14);
    render();
    renderGameOverOverlay(winTeam, res);
  };

  const clearSelectionState = () => {
    selectedCardId = null;
    actionSubMode = null;
    chosenSteps = null;
    chosenSweep = false;
    chosenAnyMarble = false;
    jackMyMarbleId = null;
    splitMarbleA = null;
  };

  const stopTurnTimer = () => {
    clearInterval(turnTickTimer);
    turnTickTimer = 0;
    clearTimeout(turnAutoTimer);
    turnAutoTimer = 0;
    clearTimeout(botTimer);
    botTimer = 0;
    clearTimeout(hiddenPickTimer);
    hiddenPickTimer = 0;
  };

  const updateTurnRingDom = () => {
    if (over) return;
    const remMs = Math.max(0, turnDeadline - Date.now());
    const remSec = Math.ceil(remMs / 1000);
    const frac = Math.max(0, Math.min(1, remMs / TURN_MS));
    const fg = m.querySelector('.jk-corner-player.active .jk-turn-ring-fg');
    const pill = m.querySelector('.jk-corner-player.active .jk-turn-pill');
    if (fg) {
      fg.style.strokeDashoffset = String((RING_CIRC * (1 - frac)).toFixed(1));
      fg.classList.toggle('warn', remSec <= 7 && remSec > 4);
      fg.classList.toggle('danger', remSec <= 4);
    }
    if (pill) {
      pill.textContent = `${remSec}s`;
      pill.classList.toggle('warn', remSec <= 7 && remSec > 4);
      pill.classList.toggle('danger', remSec <= 4);
    }
  };

  const runNoobHumanAutoTurn = () => {
    if (over || isAnimating || turnIdx !== 0) return;
    if (pendingHiddenDiscard) {
      const p = pendingHiddenDiscard;
      const enemy = findPlayer(p.targetSeat);
      const pickIdx = enemy && enemy.hand.length ? Math.floor(Math.random() * enemy.hand.length) : 0;
      p.resolvePick(pickIdx);
      return;
    }
    stopTurnTimer();
    const meP = players[0];
    if (!meP || !meP.hand.length) { advanceTurn(false); return; }
    const st = getStateObj();
    const act = Rules.pickNoobAction(0, st);
    if (!act) { advanceTurn(false); return; }

    if (act.type === 'exit_base') {
      const mb = marbles.find(x => x.id === act.marbleId);
      if (mb) {
        runAnimatedBaseExit(meP, mb, act.card, (extra) => advanceTurn(extra));
        return;
      }
    } else if (act.type === 'move') {
      const mb = marbles.find(x => x.id === act.marbleId);
      if (mb) {
        runAnimatedTrackedMove(
          meP,
          mb,
          act.dest,
          act.card,
          `🤖 Auto-Bot moved ${act.steps > 0 ? '+' + act.steps : act.steps} (${act.card.rank}${act.card.suit})`,
          (extra) => advanceTurn(extra)
        );
        return;
      }
    } else if (act.type === 'discard_enemy') {
      runDiscardEnemy(meP, act.targetSeat, act.card, (extra) => advanceTurn(extra));
      return;
    } else if (act.type === 'swap') {
      const myM = marbles.find(x => x.id === act.myMarbleId);
      const oppM = marbles.find(x => x.id === act.oppMarbleId);
      if (myM && oppM) {
        runAnimatedSwap(meP, myM, oppM, act.card, () => advanceTurn(false));
        return;
      }
    } else if (act.type === 'split7' && act.split) {
      const sp = act.split;
      const mA = marbles.find(x => x.id === sp.marbleAId);
      const mB = marbles.find(x => x.id === sp.marbleBId);
      if (mA && mB) {
        const prevZoneA = mA.zone;
        const prevZoneB = mB.zone;
        const wpA = [marbleXY(mA), ...(sp.dA.path || []).map(n => { const p = nodeXY(mA.owner, n); return { x: p.x, y: p.y, isTeleport: Boolean(n.isTeleport) }; })];
        clearSelectionState();
        consumeCard(meP, act.card.id);
        justDroppedCard = true;
        lastActionText = `🤖 Auto-Bot splitting 7 (+${sp.stepA} & +${sp.stepB})…`;
        render();
        animateMarbleWaypoints(mA.id, wpA, () => {
          if (over) return;
          let capCount = 0;
          (sp.dA.passedCaptures || []).forEach(id => { if (captureMarbleObj(marbles.find(x => x.id === id))) capCount++; });
          mA.zone = sp.dA.zone; mA.pos = sp.dA.pos; mA.homeIdx = sp.dA.homeIdx; mA.stepsFromStart = sp.dA.stepsFromStart;
          renderBoardSvg();
          const wpB = [marbleXY(mB), ...(sp.dB.path || []).map(n => { const p = nodeXY(mB.owner, n); return { x: p.x, y: p.y, isTeleport: Boolean(n.isTeleport) }; })];
          animateMarbleWaypoints(mB.id, wpB, () => {
            if (over) return;
            (sp.dB.passedCaptures || []).forEach(id => { if (captureMarbleObj(marbles.find(x => x.id === id))) capCount++; });
            mB.zone = sp.dB.zone; mB.pos = sp.dB.pos; mB.homeIdx = sp.dB.homeIdx; mB.stepsFromStart = sp.dB.stepsFromStart;
            const enteredHome = (prevZoneA !== 'home' && sp.dA.zone === 'home') || (prevZoneB !== 'home' && sp.dB.zone === 'home');
            const extraTurn = Rules.shouldGrantExtraTurn({ capturedCount: capCount, enteredHome, discardedEnemy: false });
            if (Rules.shouldGrantComboDraw({ capturedCount: capCount, enteredHome })) grantComboDraw(meP);
            if (extraTurn) triggerComboPopup(enteredHome ? 'WIN BOX · +1 TURN!' : 'CAPTURE · +1 TURN!');
            advanceTurn(extraTurn);
          });
        });
        return;
      }
    }

    // Fallback dead hand discard
    clearSelectionState();
    consumeCard(meP, act.card.id);
    justDroppedCard = true;
    lastActionText = `🤖 Auto-Bot discarded ${act.card.rank}${act.card.suit}`;
    advanceTurn(false);
  };

  const resumeFromAfk = () => {
    if (!playerAfk || over) return;
    playerAfk = false;
    const bar = $('#jkAfkBanner', m);
    if (bar) bar.remove();
    const dot = m.querySelector('.jk-afk-dot');
    if (dot) dot.remove();
    if (typeof toast === 'function') toast('👋 Manual control resumed!');
    if (turnIdx === 0 && !isAnimating && !showVsIntro) {
      clearTimeout(turnAutoTimer);
      const remMs = Math.max(1200, turnDeadline - Date.now());
      turnAutoTimer = setTimeout(() => {
        if (over || isAnimating || turnIdx !== 0) return;
        playerAfk = true;
        if (typeof toast === 'function') toast('⏱️ 15s time up! Auto-Play Bot took over — tap screen to resume');
        runNoobHumanAutoTurn();
      }, remMs);
    }
  };

  const startTurnTimer = () => {
    stopTurnTimer();
    if (over || showVsIntro) return;
    const curP = players[turnIdx];
    if (!curP) return;

    turnDeadline = Date.now() + TURN_MS;
    updateTurnRingDom();
    turnTickTimer = setInterval(updateTurnRingDom, 100);

    if (curP.isBot) {
      scheduleBotMove();
    } else if (playerAfk) {
      // 15s timer runs visibly, and after 3s noob bot auto-plays unless user taps screen!
      const afkMs = Rules.getTurnActionDelayMs(false, true);
      turnAutoTimer = setTimeout(() => {
        if (over || isAnimating || turnIdx !== 0 || !playerAfk) return;
        runNoobHumanAutoTurn();
      }, afkMs);
    } else {
      turnAutoTimer = setTimeout(() => {
        if (over || isAnimating || turnIdx !== 0) return;
        playerAfk = true;
        if (typeof toast === 'function') toast('⏱️ 15s time up! Auto-Play Bot took over — tap screen to resume');
        runNoobHumanAutoTurn();
      }, TURN_MS);
    }
  };

  const advanceTurn = (extraTurn = false) => {
    stopTurnTimer();
    clearSelectionState();

    const w = checkWinner();
    if (w !== null) { endMatch(w); return; }

    if (extraTurn && players[turnIdx]) {
      const curP = players[turnIdx];
      refillHandsIfEmpty();
      if (curP.hand.length === 0) {
        const extraCard = drawCards(1);
        if (extraCard.length) curP.hand.push(extraCard[0]);
      }
      if (curP.hand.length > 0) {
        if (turnIdx === 0) {
          const st = getStateObj();
          const anyPlayable = players[0].hand.some(c => Rules.isCardPlayable(c, 0, st));
          const controlSeat = Rules.getControlSeat(0, st);
          const mateTag = controlSeat !== 0 ? ` (Helping ${findPlayer(controlSeat)?.name || 'Partner'})` : '';
          lastActionText = playerAfk
            ? '⚡ Bonus Turn! 🤖 Auto-Play ON (3s) — tap screen to resume'
            : (!anyPlayable
                ? `⚡ Bonus Turn! No playable card — tap any card to discard`
                : `⚡ Bonus Turn! Play another glowing card${mateTag}!`);
        } else {
          lastActionText = `⚡ ${curP.color.emoji} ${curP.name} earned a Bonus Turn…`;
        }
        render();
        if (!over) startTurnTimer();
        return;
      }
    }

    refillHandsIfEmpty();
    for (let guard = 0; guard < players.length; guard++) {
      turnIdx = (turnIdx + 1) % players.length;
      if (players[turnIdx].hand.length > 0) break;
    }

    if (!over && turnIdx === 0) {
      const st = getStateObj();
      const anyPlayable = players[0].hand.some(c => Rules.isCardPlayable(c, 0, st));
      const controlSeat = Rules.getControlSeat(0, st);
      const mateTag = controlSeat !== 0 ? ` · Playing for ${findPlayer(controlSeat)?.name || 'Partner'}!` : '';
      if (playerAfk) {
        lastActionText = '🤖 Auto-Play ON (3s) — tap screen to take control';
      } else if (!anyPlayable && players[0].hand.length > 0) {
        lastActionText = 'No playable card — tap any card to discard';
      } else {
        lastActionText = `Tap a glowing card to play${mateTag}`;
      }
    } else if (!over && players[turnIdx]) {
      lastActionText = `${players[turnIdx].color.emoji} ${players[turnIdx].name} is thinking…`;
    }

    render();
    if (!over) {
      startTurnTimer();
    }
  };

  const runAnimatedBaseExit = (moverPlayer, mb, card, onComplete) => {
    stopTurnTimer();
    const stoneOwner = findPlayer(mb.owner) || moverPlayer;
    const startPt = marbleXY(mb);
    const destPt = trackXY(stoneOwner.startPos);
    clearSelectionState();
    consumeCard(moverPlayer, card.id);
    justDroppedCard = true;
    lastActionText = `${moverPlayer.color.emoji} ${moverPlayer.seat === 0 ? 'Opening' : moverPlayer.name + ' opening'} stone with ${card.rank}${card.suit}…`;
    render();

    animateMarbleWaypoints(mb.id, [startPt, { x: destPt.x, y: destPt.y, isExit: true }], () => {
      if (over) return;
      const cap = captureAtPos(stoneOwner.seat, stoneOwner.startPos);
      mb.zone = 'track';
      mb.pos = stoneOwner.startPos;
      mb.homeIdx = -1;
      mb.stepsFromStart = 0;
      const capturedCount = cap ? 1 : 0;
      const extraTurn = Rules.shouldGrantExtraTurn({ capturedCount, enteredHome: false, discardedEnemy: false });
      const comboGot = Rules.shouldGrantComboDraw({ capturedCount, enteredHome: false }) && grantComboDraw(moverPlayer);
      if (cap) triggerComboPopup('CAPTURE · +1 TURN!');
      lastActionText = `${moverPlayer.color.emoji} ${moverPlayer.seat === 0 ? 'Stone entered start square' : moverPlayer.name + ' opened a stone'} (${card.rank}${card.suit})${comboGot ? ' · +1 Card & Bonus Turn!' : ''}`;
      if (typeof playSfx === 'function') playSfx(cap ? 'duelCorrect' : 'turnStart');
      if (typeof onComplete === 'function') onComplete(extraTurn);
    });
  };

  const runAnimatedTrackedMove = (moverPlayer, mb, d, card, labelPrefix, onComplete) => {
    stopTurnTimer();
    const prevZone = mb.zone;
    const startPt = marbleXY(mb);
    const rawPath = (d.path && d.path.length)
      ? d.path
      : [{ zone: d.zone, pos: d.pos, homeIdx: d.homeIdx, isTeleport: d.teleported }];
    const waypoints = [startPt, ...rawPath.map(node => {
      const p = nodeXY(mb.owner, node);
      return { x: p.x, y: p.y, isTeleport: Boolean(node.isTeleport) };
    })];

    clearSelectionState();
    consumeCard(moverPlayer, card.id);
    justDroppedCard = true;
    lastActionText = `${labelPrefix}…`;
    render();

    animateMarbleWaypoints(mb.id, waypoints, () => {
      if (over) return;
      const moveControlSeat = Rules.getControlSeat(moverPlayer.seat, getStateObj());
      const movedOwnStone = mb.owner === moveControlSeat;
      let capturedCount = 0;
      if (movedOwnStone && d.passedCaptures && d.passedCaptures.length) {
        d.passedCaptures.forEach(cid => {
          const vic = marbles.find(x => x.id === cid);
          if (vic && captureMarbleObj(vic, mb.owner)) capturedCount++;
        });
      }
      mb.zone = d.zone;
      mb.pos = d.pos;
      mb.homeIdx = d.homeIdx;
      mb.stepsFromStart = d.stepsFromStart;

      const enteredHome = movedOwnStone && prevZone !== 'home' && d.zone === 'home';
      const extraTurn = Rules.shouldGrantExtraTurn({ capturedCount, enteredHome, discardedEnemy: false });
      const comboGot = Rules.shouldGrantComboDraw({ capturedCount, enteredHome }) && grantComboDraw(moverPlayer);
      if (capturedCount > 0 || enteredHome) {
        triggerComboPopup(capturedCount > 1 ? 'MEGA SWEEP · +1 TURN!' : enteredHome ? 'WIN BOX · +1 TURN!' : 'CAPTURE · +1 TURN!');
      } else if (d.teleported) {
        triggerComboPopup('TELEPORT!');
      }

      lastActionText = `${labelPrefix}${capturedCount > 0 ? ` 💥 Captured ${capturedCount}!` : ''}${d.teleported ? ' 🌀 Teleported!' : ''}${enteredHome ? ' ⭐ Win Box!' : ''}${comboGot ? ' +1 Card & Bonus Turn!' : (extraTurn ? ' + Bonus Turn!' : '')}`;
      if (typeof playSfx === 'function') playSfx(capturedCount > 0 || enteredHome ? 'duelCorrect' : 'tap');
      if (typeof onComplete === 'function') onComplete(extraTurn);
    });
  };

  const runAnimatedSwap = (moverPlayer, myM, oppM, card, onComplete) => {
    stopTurnTimer();
    const ptA = marbleXY(myM);
    const ptB = marbleXY(oppM);
    clearSelectionState();
    consumeCard(moverPlayer, card.id);
    justDroppedCard = true;
    lastActionText = `🔀 Swapping stones with ${card.rank}${card.suit}…`;
    render();

    animateDualSwap(myM.id, ptA, oppM.id, ptB, () => {
      if (over) return;
      const tmp = myM.pos;
      myM.pos = oppM.pos;
      oppM.pos = tmp;
      const myOwner = findPlayer(myM.owner);
      const oppOwner = findPlayer(oppM.owner);
      if (myOwner) myM.stepsFromStart = ((myM.pos - myOwner.startPos) % TRACK_LEN + TRACK_LEN) % TRACK_LEN;
      if (oppOwner) oppM.stepsFromStart = ((oppM.pos - oppOwner.startPos) % TRACK_LEN + TRACK_LEN) % TRACK_LEN;
      const pt = trackXY(myM.pos);
      burstCoord = { x: pt.x, y: pt.y, color: moverPlayer.color.hex };
      triggerComboPopup('SWAPPED!');
      lastActionText = `🔀 ${moverPlayer.seat === 0 ? 'Swapped stones' : moverPlayer.name + ' swapped stones'} with ${oppOwner?.name || 'Rival'}!`;
      if (typeof playSfx === 'function') playSfx('duelCorrect');
      if (typeof onComplete === 'function') onComplete(false);
    });
  };

  const runDiscardEnemy = (moverPlayer, targetSeat, card, onComplete, chosenIdx) => {
    const enemy = targetSeat !== null ? findPlayer(targetSeat) : null;
    if (!enemy || !enemy.hand.length) {
      if (typeof toast === 'function') toast('No rival cards left to discard!');
      return;
    }
    stopTurnTimer();
    clearSelectionState();
    consumeCard(moverPlayer, card.id);
    justDroppedCard = true;
    const idx = typeof chosenIdx === 'number' && chosenIdx >= 0 && chosenIdx < enemy.hand.length
      ? chosenIdx
      : Math.floor(Math.random() * enemy.hand.length);
    const burned = enemy.hand.splice(idx, 1)[0];
    if (burned) discard.push(burned);
    const burnedTxt = burned ? ` (${burned.rank}${burned.suit})` : '';
    triggerComboPopup('DISCARD · +1 TURN!');
    lastActionText = `🔥 ${moverPlayer.seat === 0 ? 'Forced' : moverPlayer.name + ' forced'} ${enemy.name} to discard${burnedTxt} · Bonus Turn!`;
    if (typeof playSfx === 'function') playSfx(moverPlayer.seat === 0 ? 'duelCorrect' : 'duelWrong');
    if (typeof onComplete === 'function') onComplete(true);
  };

  /**
   * Red Queen (1v1) Power: lets the human player choose ONE of the opponent's
   * hidden (face-down) cards to reveal & destroy, then awards a Bonus Turn!
   */
  const openHiddenDiscardPicker = (moverPlayer, targetSeat, card, onComplete) => {
    const enemy = targetSeat !== null ? findPlayer(targetSeat) : null;
    if (!enemy || !enemy.hand.length) {
      if (typeof toast === 'function') toast('No rival cards left to discard!');
      return;
    }
    const host = $('#jkOverlayHost', m);
    if (!host) {
      runDiscardEnemy(moverPlayer, targetSeat, card, onComplete);
      return;
    }

    clearSelectionState();
    let resolved = false;

    const resolvePick = (idx) => {
      if (resolved || over) return;
      resolved = true;
      clearTimeout(hiddenPickTimer);
      pendingHiddenDiscard = null;
      stopTurnTimer();

      const safeIdx = Math.max(0, Math.min(enemy.hand.length - 1, idx));
      const pickedCard = enemy.hand[safeIdx];
      const btn = host.querySelector(`[data-jkhidx="${safeIdx}"]`);
      host.querySelectorAll('[data-jkhidx]').forEach(el => { el.disabled = true; });
      if (btn && pickedCard) {
        btn.classList.add('revealed', pickedCard.red ? 'red' : 'blk');
        btn.innerHTML = `
          <span class="jk-c-corner"><b>${pickedCard.rank}</b><i>${pickedCard.suit}</i></span>
          <div class="jk-c-art">${renderCardArt(pickedCard)}</div>
          <span class="jk-hpick-burn">🔥 BURNED</span>
        `;
      }
      const subEl = $('#jkHPickSub', host);
      if (subEl && pickedCard) {
        subEl.textContent = `🔥 Destroyed ${enemy.name}'s ${pickedCard.rank}${pickedCard.suit}! +1 Bonus Turn!`;
      }
      if (typeof playSfx === 'function') playSfx('duelCorrect');

      hiddenPickTimer = setTimeout(() => {
        if (over) return;
        host.innerHTML = '';
        consumeCard(moverPlayer, card.id);
        justDroppedCard = true;
        const removed = enemy.hand.splice(safeIdx, 1)[0];
        if (removed) discard.push(removed);
        triggerComboPopup('SNIPED · +1 TURN!');
        lastActionText = `🔥 Sniped ${enemy.name}'s hidden ${removed ? removed.rank + removed.suit : 'card'} · Bonus Turn!`;
        if (typeof onComplete === 'function') onComplete(true);
      }, 680);
    };

    pendingHiddenDiscard = { targetSeat, resolvePick };

    // Ensure the player always has at least 8 seconds to pick a hidden card if they tapped Red Q near timeout
    if (!playerAfk && turnDeadline - Date.now() < 8000) {
      turnDeadline = Date.now() + 8000;
      clearTimeout(turnAutoTimer);
      turnAutoTimer = setTimeout(() => {
        if (over || isAnimating || turnIdx !== 0) return;
        playerAfk = true;
        runNoobHumanAutoTurn();
      }, 8000);
      updateTurnRingDom();
    }

    host.innerHTML = `
      <div class="jk-hpick-overlay" data-testid="jk-hidden-discard-picker" role="dialog" aria-label="Choose rival hidden card to discard">
        <div class="jk-hpick-card">
          <div class="jk-hpick-head">
            <span class="jk-hpick-badge">Q♥ POWER</span>
            <b>Pick ${esc(enemy.name)}'s Hidden Card</b>
            <small id="jkHPickSub">Tap 1 face-down card to destroy it &amp; play again!</small>
          </div>
          <div class="jk-hpick-grid">
            ${enemy.hand.map((_, i) => `
              <button type="button" class="jk-hpick-item" data-jkhidx="${i}" aria-label="Pick hidden card ${i + 1}">
                <span class="jk-hpick-crest">✦</span>
                <b>?</b>
                <small>#${i + 1}</small>
              </button>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    host.querySelectorAll('[data-jkhidx]').forEach(btn => {
      btn.onclick = () => resolvePick(Number(btn.dataset.jkhidx));
    });
  };

  const finishBotTurn = (p, extraTurn = false) => {
    if (over) return;
    if (Math.random() < 0.24) {
      const lines = p.team === 0 ? ['Nice move! 🔥', 'Let\'s finish!', 'Good play!'] : ['Watch out! 😎', 'My turn!', 'Good game!'];
      showAvatarBubble(p.seat, lines[Math.floor(Math.random() * lines.length)]);
    }
    advanceTurn(Boolean(extraTurn));
  };

  const scheduleBotMove = () => {
    clearTimeout(botTimer);
    const thinkMs = Rules.getTurnActionDelayMs(true, false);
    botTimer = setTimeout(() => {
      if (over || isAnimating) return;
      const p = players[turnIdx];
      if (!p || !p.isBot) return;
      if (!p.hand.length) { advanceTurn(false); return; }

      const st = getStateObj();
      const controlSeat = Rules.getControlSeat(p.seat, st);
      const myMarbles = marbles.filter(x => x.owner === controlSeat);
      const baseM = myMarbles.filter(x => x.zone === 'base');
      const activeM = myMarbles.filter(x => x.zone !== 'base');
      const trackM = myMarbles.filter(x => x.zone === 'track');

      // 1. Prioritize Home entry or Capture (including King sweep in 1v1!)
      for (const c of p.hand) {
        const role = Rules.getCardRole(c, mode);
        if (!role.steps || !role.steps.length) continue;
        for (const stp of role.steps) {
          const pool = role.anyMarble
            ? marbles.filter(x => Rules.canCard5MoveMarble(x, controlSeat, players))
            : activeM;
          for (const mb of pool) {
            if (mb.owner !== controlSeat && !role.anyMarble) continue;
            const d = Rules.computeMove(mb, stp, st, { sweepCapture: Boolean(role.sweepCapture), moverSeat: controlSeat });
            if (!d.valid) continue;
            if ((mb.owner === controlSeat && mb.zone !== 'home' && d.zone === 'home') || (mb.owner === controlSeat && d.passedCaptures && d.passedCaptures.length)) {
              runAnimatedTrackedMove(p, mb, d, c, `${p.color.emoji} ${p.name} played ${c.rank}${c.suit}`, (extra) => finishBotTurn(p, extra));
              return;
            }
          }
        }
      }

      // 2. Exit base with A, 2, or K (if allowed in mode)
      if (baseM.length && Rules.canExitBase(p.seat, st)) {
        const exitCard = p.hand.find(c => Rules.getCardRole(c, mode).canExitBase);
        if (exitCard) {
          runAnimatedBaseExit(p, baseM[0], exitCard, (extra) => finishBotTurn(p, extra));
          return;
        }
      }

      // 3. Black Jack Swap (never swap stones sitting on their own Safe-Start square!)
      const mySwappableTrack = trackM.filter(x => !Rules.isSafeStartMarble(x, players));
      if (mySwappableTrack.length) {
        const jCard = p.hand.find(c => Rules.getCardRole(c, mode).canSwap);
        const oppTargets = marbles.filter(x => x.zone === 'track' && findPlayer(x.owner)?.team !== p.team && !Rules.isSafeStartMarble(x, players));
        if (jCard && oppTargets.length) {
          oppTargets.sort((a, b) => b.stepsFromStart - a.stepsFromStart);
          const myBehind = mySwappableTrack.slice().sort((a, b) => a.stepsFromStart - b.stepsFromStart)[0];
          const target = oppTargets[0];
          if (target.stepsFromStart > myBehind.stepsFromStart) {
            runAnimatedSwap(p, myBehind, target, jCard, () => finishBotTurn(p, false));
            return;
          }
        }
      }

      // 4. Red Queen (1v1) or 10 Discard rival card (+ Bonus Turn!)
      {
        const discCard = p.hand.find(c => Rules.getCardRole(c, mode).canDiscardNext);
        const targetSeat = Rules.getNextOpponentSeat(p.seat, players);
        if (discCard && targetSeat !== null && (discCard.rank === 'Q' || Math.random() < (botTier === 'pro' ? 0.6 : 0.4))) {
          runDiscardEnemy(p, targetSeat, discCard, (extra) => finishBotTurn(p, extra));
          return;
        }
      }

      // 5. Normal best forward/backward move (prefer furthest advanced stone, respect Card 5 safe-start immunity!)
      const rankedActive = activeM.slice().sort((a, b) => b.stepsFromStart - a.stepsFromStart);
      for (const c of p.hand) {
        const role = Rules.getCardRole(c, mode);
        if (!role.steps || !role.steps.length) continue;
        const pool = role.anyMarble
          ? marbles.filter(x => Rules.canCard5MoveMarble(x, controlSeat, players))
          : rankedActive;
        for (const stp of role.steps) {
          for (const mb of pool) {
            const d = Rules.computeMove(mb, stp, st, { sweepCapture: Boolean(role.sweepCapture), moverSeat: controlSeat });
            if (d.valid) {
              runAnimatedTrackedMove(
                p,
                mb,
                d,
                c,
                `${p.color.emoji} ${p.name} moved ${stp > 0 ? '+' + stp : stp} with ${c.rank}${c.suit}`,
                (extra) => finishBotTurn(p, extra)
              );
              return;
            }
          }
        }
      }

      // 6. Discard unplayable card
      stopTurnTimer();
      if (p.hand.length) {
        const burned = p.hand.shift();
        discard.push(burned);
        justDroppedCard = true;
        lastActionText = `${p.color.emoji} ${p.name} discarded ${burned.rank}${burned.suit}`;
      }
      finishBotTurn(p, false);
    }, thinkMs);
  };

  // Returns Map<marbleId, { dest, steps, label }> for highlighting stones AND destination target rings
  const getSelectableTargets = () => {
    const map = new Map();
    if (over || isAnimating || turnIdx !== 0 || !selectedCardId) return map;
    const st = getStateObj();
    const controlSeat = Rules.getControlSeat(0, st);
    const myM = marbles.filter(x => x.owner === controlSeat);

    if (actionSubMode === 'jack_pick_my') {
      const meP = players[0];
      const hasOpp = marbles.some(
        x => x.owner !== controlSeat && x.zone === 'track' && !Rules.isSafeStartMarble(x, players) && findPlayer(x.owner)?.team !== meP.team
      );
      if (hasOpp) {
        myM
          .filter(x => x.zone === 'track' && !Rules.isSafeStartMarble(x, players))
          .forEach(x => map.set(x.id, { dest: null, steps: 0, label: 'Swap' }));
      }
    } else if (actionSubMode === 'jack_pick_opp') {
      const meP = players[0];
      marbles
        .filter(x => x.owner !== controlSeat && x.zone === 'track' && !Rules.isSafeStartMarble(x, players) && findPlayer(x.owner)?.team !== meP.team)
        .forEach(x => map.set(x.id, { dest: null, steps: 0, label: 'Swap' }));
    } else if (actionSubMode === 'seven_split') {
      if (!splitMarbleA) {
        const opts = Rules.getValidSplit7Options(0, st).filter(o => o.stepA === splitStepA);
        opts.forEach(o => {
          if (!map.has(o.marbleAId)) map.set(o.marbleAId, { dest: o.dA, steps: splitStepA, label: `+${splitStepA}` });
        });
      } else {
        const rem = 7 - splitStepA;
        const mA = marbles.find(x => x.id === splitMarbleA);
        const dA = mA ? Rules.computeMove(mA, splitStepA, st) : null;
        if (dA && dA.valid) {
          const cloned = marbles.map(x => {
            if (x.id === mA.id) return { ...x, zone: dA.zone, pos: dA.pos, homeIdx: dA.homeIdx, stepsFromStart: dA.stepsFromStart };
            if (dA.passedCaptures && dA.passedCaptures.includes(x.id)) return { ...x, zone: 'base', pos: -1, homeIdx: -1, stepsFromStart: 0 };
            return x;
          });
          const nextSt = { ...st, marbles: cloned };
          cloned
            .filter(x => x.owner === controlSeat && x.id !== splitMarbleA && x.zone !== 'base')
            .forEach(x => {
              const dB = Rules.computeMove(x, rem, nextSt);
              if (dB.valid) map.set(x.id, { dest: dB, steps: rem, label: `+${rem}` });
            });
        }
      }
    } else if (chosenSteps !== null) {
      const pool = chosenAnyMarble
        ? marbles.filter(x => Rules.canCard5MoveMarble(x, controlSeat, players))
        : myM.filter(x => x.zone !== 'base');
      pool.forEach(x => {
        const d = Rules.computeMove(x, chosenSteps, st, { sweepCapture: chosenSweep, moverSeat: controlSeat });
        if (d.valid) {
          map.set(x.id, { dest: d, steps: chosenSteps, label: chosenSteps > 0 ? `+${chosenSteps}` : String(chosenSteps) });
        }
      });
    }
    return map;
  };

  const executeCardAutoAction = (card, autoAction) => {
    const meP = players[0];
    if (!autoAction) return false;

    if (autoAction.type === 'exit_base') {
      const mb = marbles.find(x => x.id === autoAction.marbleId);
      if (!mb) return false;
      runAnimatedBaseExit(meP, mb, card, (extra) => advanceTurn(extra));
      return true;
    }

    if (autoAction.type === 'move') {
      const mb = marbles.find(x => x.id === autoAction.marbleId);
      if (!mb) return false;
      const whose = mb.owner === 0 ? 'Moved' : `Moved ${findPlayer(mb.owner)?.name}'s stone`;
      runAnimatedTrackedMove(
        meP,
        mb,
        autoAction.dest,
        card,
        `${meP.color.emoji} ${whose} ${autoAction.steps > 0 ? '+' + autoAction.steps : autoAction.steps} with ${card.rank}${card.suit}`,
        (extra) => advanceTurn(extra)
      );
      return true;
    }

    if (autoAction.type === 'pick_hidden_enemy') {
      openHiddenDiscardPicker(meP, autoAction.targetSeat, card, (extra) => advanceTurn(extra));
      return true;
    }

    if (autoAction.type === 'discard_enemy') {
      runDiscardEnemy(meP, autoAction.targetSeat, card, (extra) => advanceTurn(extra));
      return true;
    }

    if (autoAction.type === 'swap') {
      const myM = marbles.find(x => x.id === autoAction.myMarbleId);
      const oppM = marbles.find(x => x.id === autoAction.oppMarbleId);
      if (!myM || !oppM) return false;
      runAnimatedSwap(meP, myM, oppM, card, () => advanceTurn(false));
      return true;
    }

    return false;
  };

  const handleCardSelect = (cardId) => {
    if (over || isAnimating || turnIdx !== 0 || pendingHiddenDiscard) return;
    const meP = players[0];
    const card = meP.hand.find(c => c.id === cardId);
    if (!card) return;

    const st = getStateObj();
    const legal = Rules.getLegalActionsForCard(card, 0, st);
    const anyHandPlayable = meP.hand.some(c => Rules.isCardPlayable(c, 0, st));

    // Dead hand (no playable card at all): 1-tap discard cleanly
    if (!anyHandPlayable) {
      if (typeof playSfx === 'function') playSfx('tap');
      consumeCard(meP, card.id);
      justDroppedCard = true;
      lastActionText = `Discarded ${card.rank}${card.suit} · Turn passed`;
      advanceTurn();
      return;
    }

    // Card is faded/unplayable while another card CAN be played: block accidental play!
    if (!legal.playable) {
      if (typeof playSfx === 'function') playSfx('duelWrong');
      if (typeof toast === 'function') toast('Use a glowing playable card!');
      return;
    }

    // Zero-friction 1-tap auto-play (e.g. all stones in base -> instant Open, or 1 stone out -> instant +12!)
    if (legal.autoAction && executeCardAutoAction(card, legal.autoAction)) {
      return;
    }

    // Otherwise select card & present only genuinely legal sub-options or stone selection
    if (typeof playSfx === 'function') playSfx('tap');
    selectedCardId = cardId;
    jackMyMarbleId = null;
    splitMarbleA = null;
    chosenSteps = null;
    chosenSweep = false;
    chosenAnyMarble = false;

    const role = legal.role;
    const stepKeys = Object.keys(legal.movesByStep).map(Number);

    if (role.kind === 'ace' || role.kind === 'two' || role.kind === 'king') {
      // If cannot exit base and only 1 step value works, skip the picker straight to stone selection!
      if (!legal.exitBase && stepKeys.length === 1) {
        actionSubMode = 'step';
        chosenSteps = stepKeys[0];
        chosenSweep = Boolean(role.sweepCapture);
        lastActionText = `${card.rank}${card.suit}: Tap a glowing stone or target spot to move +${chosenSteps}`;
      } else {
        actionSubMode = role.kind === 'ace' ? 'ace_pick' : role.kind === 'two' ? 'two_pick' : 'king_pick';
        lastActionText = role.kind === 'ace'
          ? 'Ace: Open Stone, Move +1, or Move +11'
          : role.kind === 'two'
            ? 'Card 2: Open Stone or Move +2'
            : 'King: Open Stone or Move +13 Sweep';
      }
    } else if (role.kind === 'jack_black') {
      const myTrackUnique = Array.from(new Set(legal.swapPairs.map(p => p.myMarbleId)));
      if (myTrackUnique.length === 1) {
        // Only 1 of player's stones is on track — skip picking own stone, jump straight to picking rival!
        jackMyMarbleId = myTrackUnique[0];
        actionSubMode = 'jack_pick_opp';
        lastActionText = `Black J (${card.suit}): Tap a glowing rival stone to SWAP!`;
      } else {
        actionSubMode = 'jack_pick_my';
        lastActionText = `Black J (${card.suit}): Tap your stone to SWAP with a rival`;
      }
    } else if (role.kind === 'seven') {
      if (legal.split7Options.length === 0) {
        actionSubMode = 'step';
        chosenSteps = 7;
        lastActionText = 'Card 7: Tap a glowing stone or target spot to move +7';
      } else if (legal.allMoves.length === 0) {
        actionSubMode = 'seven_split';
        splitStepA = legal.split7Options[0].stepA;
        lastActionText = `Split 7 (${splitStepA}+${7 - splitStepA}): Tap your 1st stone`;
      } else {
        actionSubMode = 'seven_pick';
        lastActionText = 'Card 7: Move +7 on one stone OR Split 7 across two stones';
      }
    } else if (role.kind === 'ten') {
      if (!legal.canDiscardEnemy) {
        actionSubMode = 'step';
        chosenSteps = 10;
        lastActionText = 'Card 10: Tap a glowing stone or target spot to move +10';
      } else {
        actionSubMode = 'ten_pick';
        lastActionText = 'Card 10: Move +10 OR Force rival to discard a card';
      }
    } else if (role.kind === 'any5') {
      actionSubMode = 'step';
      chosenSteps = 5;
      chosenAnyMarble = true;
      lastActionText = 'Card 5: Tap ANY glowing stone on track to move +5';
    } else if (role.kind === 'back') {
      actionSubMode = 'step';
      chosenSteps = -4;
      lastActionText = 'Card 4: Tap a glowing stone to move −4 steps backward';
    } else {
      actionSubMode = 'step';
      chosenSteps = role.steps[0];
      lastActionText = `${card.rank}${card.suit}: Tap a glowing stone or target spot to move +${chosenSteps}`;
    }
    render();
  };

  const handleMarbleClick = (marbleId) => {
    if (over || isAnimating || turnIdx !== 0 || pendingHiddenDiscard) return;
    const targets = getSelectableTargets();
    if (!targets.has(marbleId)) return;
    const st = getStateObj();
    const meP = players[0];
    const card = meP.hand.find(c => c.id === selectedCardId);
    const mb = marbles.find(x => x.id === marbleId);
    if (!card || !mb) return;

    if (actionSubMode === 'jack_pick_my') {
      const oppChoices = marbles.filter(
        x => x.owner !== 0 && x.zone === 'track' && !Rules.isSafeStartMarble(x, players) && findPlayer(x.owner)?.team !== meP.team
      );
      if (oppChoices.length === 1) {
        runAnimatedSwap(meP, mb, oppChoices[0], card, () => advanceTurn());
        return;
      }
      jackMyMarbleId = marbleId;
      actionSubMode = 'jack_pick_opp';
      lastActionText = 'Jack Swap: Tap any glowing rival stone to swap positions!';
      if (typeof playSfx === 'function') playSfx('tap');
      render();
      return;
    }

    if (actionSubMode === 'jack_pick_opp') {
      const myM = marbles.find(x => x.id === jackMyMarbleId);
      if (!myM) return;
      runAnimatedSwap(meP, myM, mb, card, () => advanceTurn());
      return;
    }

    if (actionSubMode === 'seven_split') {
      if (!splitMarbleA) {
        splitMarbleA = marbleId;
        lastActionText = `Split 7: First stone +${splitStepA} locked. Tap your 2nd stone for +${7 - splitStepA}!`;
        if (typeof playSfx === 'function') playSfx('tap');
        render();
        return;
      }
      const mA = marbles.find(x => x.id === splitMarbleA);
      const mB = mb;
      const dA = Rules.computeMove(mA, splitStepA, st);
      if (!dA.valid) return toast('Invalid split target');
      const cloned = marbles.map(x => {
        if (x.id === mA.id) return { ...x, zone: dA.zone, pos: dA.pos, homeIdx: dA.homeIdx, stepsFromStart: dA.stepsFromStart };
        if (dA.passedCaptures && dA.passedCaptures.includes(x.id)) return { ...x, zone: 'base', pos: -1, homeIdx: -1, stepsFromStart: 0 };
        return x;
      });
      const dB = Rules.computeMove(cloned.find(x => x.id === mB.id), 7 - splitStepA, { ...st, marbles: cloned });
      if (!dB.valid) return toast('Invalid 2nd stone for Split 7');

      // Animate Marble A hopping first, commit A, then animate Marble B hopping!
      stopTurnTimer();
      const prevZoneA = mA.zone;
      const prevZoneB = mB.zone;
      const wpA = [marbleXY(mA), ...(dA.path || []).map(n => { const p = nodeXY(mA.owner, n); return { x: p.x, y: p.y, isTeleport: Boolean(n.isTeleport) }; })];
      clearSelectionState();
      consumeCard(meP, card.id);
      justDroppedCard = true;
      lastActionText = `✨ Splitting 7 (+${splitStepA} & +${7 - splitStepA})…`;
      render();

      animateMarbleWaypoints(mA.id, wpA, () => {
        if (over) return;
        let capCount = 0;
        (dA.passedCaptures || []).forEach(id => { if (captureMarbleObj(marbles.find(x => x.id === id))) capCount++; });
        mA.zone = dA.zone; mA.pos = dA.pos; mA.homeIdx = dA.homeIdx; mA.stepsFromStart = dA.stepsFromStart;
        renderBoardSvg();

        const wpB = [marbleXY(mB), ...(dB.path || []).map(n => { const p = nodeXY(mB.owner, n); return { x: p.x, y: p.y, isTeleport: Boolean(n.isTeleport) }; })];
        animateMarbleWaypoints(mB.id, wpB, () => {
          if (over) return;
          (dB.passedCaptures || []).forEach(id => { if (captureMarbleObj(marbles.find(x => x.id === id))) capCount++; });
          mB.zone = dB.zone; mB.pos = dB.pos; mB.homeIdx = dB.homeIdx; mB.stepsFromStart = dB.stepsFromStart;
          const enteredHome = (prevZoneA !== 'home' && dA.zone === 'home') || (prevZoneB !== 'home' && dB.zone === 'home');
          const extraTurn = Rules.shouldGrantExtraTurn({ capturedCount: capCount, enteredHome, discardedEnemy: false });
          const comboGot = Rules.shouldGrantComboDraw({ capturedCount: capCount, enteredHome }) && grantComboDraw(meP);
          if (extraTurn) triggerComboPopup(enteredHome ? 'WIN BOX · +1 TURN!' : 'CAPTURE · +1 TURN!');
          lastActionText = `✨ Split 7 played (+${splitStepA} & +${7 - splitStepA})${comboGot ? ' · +1 Card & Bonus Turn!' : ''}!`;
          if (typeof playSfx === 'function') playSfx('duelCorrect');
          advanceTurn(extraTurn);
        });
      });
      return;
    }

    if (chosenSteps !== null) {
      const d = Rules.computeMove(mb, chosenSteps, st, { sweepCapture: chosenSweep });
      if (!d.valid) return;
      const whose = mb.owner === 0 ? 'Moved' : `Moved ${findPlayer(mb.owner)?.name}'s stone`;
      runAnimatedTrackedMove(
        meP,
        mb,
        d,
        card,
        `${meP.color.emoji} ${whose} ${chosenSteps > 0 ? '+' + chosenSteps : chosenSteps} with ${card.rank}${card.suit}`,
        (extra) => advanceTurn(extra)
      );
    }
  };

  // =========================================================================
  // RENDER CORNER PLAYER AVATARS WITH MIC & TEAM BADGES (Screenshots 5, 8, 9)
  // =========================================================================
  const renderCorners = () => {
    const layer = $('#jkCornersLayer', m);
    if (!layer) return;
    const curSeat = players[turnIdx]?.seat;
    const cornerPos = mode === '1v1'
      ? { 0: 'bl', 2: 'tr' }
      : { 0: 'bl', 1: 'tl', 2: 'tr', 3: 'br' };

    const remSecNow = turnDeadline > 0 ? Math.max(0, Math.ceil((turnDeadline - Date.now()) / 1000)) : TURN_SEC;
    const fracNow = turnDeadline > 0 ? Math.max(0, Math.min(1, (turnDeadline - Date.now()) / TURN_MS)) : 1;
    const dashOffNow = (RING_CIRC * (1 - fracNow)).toFixed(1);

    layer.innerHTML = players.map(p => {
      const pos = cornerPos[p.seat] || 'bl';
      const active = !over && curSeat === p.seat;
      const gColor = p.gender === '♀' ? '#f472b6' : '#38bdf8';
      const cardFan = mode === '2v2'
        ? `<div class="jk-mini-hand ${pos === 'tl' || pos === 'bl' ? 'right' : 'left'}" aria-hidden="true">${Array.from({ length: Math.min(4, Math.max(1, p.hand.length)) }).map(() => '<i></i>').join('')}</div>`
        : '';
      const timerSvg = active
        ? `<svg class="jk-turn-ring-svg" viewBox="0 0 64 64" aria-hidden="true">
             <circle class="jk-turn-ring-bg" cx="32" cy="32" r="28"/>
             <circle class="jk-turn-ring-fg ${remSecNow <= 4 ? 'danger' : remSecNow <= 7 ? 'warn' : ''}" cx="32" cy="32" r="28" stroke-dasharray="${RING_CIRC}" stroke-dashoffset="${dashOffNow}"/>
           </svg>
           <span class="jk-turn-pill ${remSecNow <= 4 ? 'danger' : remSecNow <= 7 ? 'warn' : ''}" data-testid="jk-turn-timer">${remSecNow}s</span>`
        : '';
      const afkTag = playerAfk && p.seat === 0 ? `<span class="jk-afk-dot" title="Auto-Play Active">🤖</span>` : '';
      return `
        <div class="jk-corner-player ${pos} ${active ? 'active' : ''}" style="--pc:${p.color.hex}">
          <div class="jk-cp-row">
            ${pos === 'tr' || pos === 'br' ? cardFan : ''}
            <div class="jk-cp-col">
              <div class="jk-cp-av-ring">
                ${timerSvg}
                <span class="jk-cp-av">${jkAvatarHtml(p.avatar)}</span>
                <span class="jk-cp-badge" style="background:${p.color.hex}">${p.color.badge}</span>
                <span class="jk-cp-mic ${p.micOn ? 'on' : 'off'}" aria-label="${p.micOn ? 'Mic active' : 'Mic muted'}">${p.micOn ? '🎙️' : '🔇'}</span>
                ${afkTag}
              </div>
              <div class="jk-cp-name"><span>${esc(p.name.slice(0, 8))}</span><i class="jk-g-dot" style="background:${gColor}">${p.gender || '♂'}</i></div>
            </div>
            ${pos === 'tl' || pos === 'bl' ? cardFan : ''}
          </div>
        </div>
      `;
    }).join('');

    const seatStrip = $('#jkSeatStrip', m);
    if (seatStrip && mode === '2v2') {
      seatStrip.innerHTML = `
        ${players.map(p => `<span class="jk-mini-seat" style="--sc:${p.color.hex}" title="${esc(p.name)}">${jkAvatarHtml(p.avatar)}</span>`).join('')}
        <button type="button" class="jk-seat-plus" data-jk-invite="1" aria-label="Invite friend to seat">+</button>
        <button type="button" class="jk-seat-plus" data-jk-invite="1" aria-label="Invite friend to seat">+</button>
        <button type="button" class="jk-seat-plus" data-jk-invite="1" aria-label="Invite friend to seat">+</button>
        <button type="button" class="jk-seat-plus" data-jk-invite="1" aria-label="Invite friend to seat">+</button>
      `;
      seatStrip.querySelectorAll('[data-jk-invite]').forEach(btn => {
        btn.onclick = triggerInviteFriend;
      });
    }
  };

  // =========================================================================
  // RENDER ORNATE SCALLOPED CARVED-OAK JACKAROO BOARD SVG (EXACT 52-SPOT)
  // =========================================================================
  const renderBoardSvg = () => {
    const svg = $('#jkSvg', m);
    if (!svg) return;
    const selectableTargets = getSelectableTargets();
    const curTop = discard[discard.length - 1];
    const cx = mode === '1v1' ? 190 : 200;
    const cy = mode === '1v1' ? 230 : 200;

    // 1. Baroque Scalloped Honey-Oak Board + Double Gold & Jade Filigree Molding
    const boardPath1v1 = 'M190 12 C228 12, 256 26, 282 52 C310 68, 352 88, 362 142 C374 196, 374 264, 362 318 C352 372, 310 392, 282 408 C256 434, 228 448, 190 448 C152 448, 124 434, 98 408 C70 392, 28 372, 18 318 C6 264, 6 196, 18 142 C28 88, 70 68, 98 52 C124 26, 152 12, 190 12 Z';
    const boardInner1v1 = 'M190 21 C225 21, 251 34, 276 59 C303 74, 343 94, 353 145 C364 197, 364 263, 353 315 C343 366, 303 386, 276 401 C251 426, 225 439, 190 439 C155 439, 129 426, 104 401 C77 386, 37 366, 27 315 C16 263, 16 197, 27 145 C37 94, 77 74, 104 59 C129 34, 155 21, 190 21 Z';

    const boardPath2v2 = 'M200 10 C236 10, 256 30, 274 52 C296 58, 342 66, 350 112 C368 134, 390 162, 390 200 C390 238, 368 266, 350 288 C342 334, 296 342, 274 348 C256 370, 236 390, 200 390 C164 390, 144 370, 126 348 C104 342, 58 334, 50 288 C32 266, 10 238, 10 200 C10 162, 32 134, 50 112 C58 66, 104 58, 126 52 C144 30, 164 10, 200 10 Z';
    const boardInner2v2 = 'M200 19 C233 19, 251 37, 268 58 C288 64, 333 71, 341 115 C358 136, 381 164, 381 200 C381 236, 358 264, 341 285 C333 329, 288 336, 268 342 C251 363, 233 381, 200 381 C167 381, 149 363, 132 342 C112 336, 67 329, 59 285 C42 264, 19 236, 19 200 C19 164, 42 136, 59 115 C67 71, 112 64, 132 58 C149 37, 167 19, 200 19 Z';

    const gemCrest = (x, y, horiz) => horiz
      ? `<g transform="translate(${x},${y})">
           <polygon points="-11,0 0,-8 11,0 0,8" fill="#fef08a" stroke="#b45309" stroke-width="1.2"/>
           <polygon points="-8,0 0,-5.5 8,0 0,5.5" fill="#10b981"/>
           <polygon points="-8,0 0,-5.5 0,0" fill="#6ee7b7" opacity=".75"/>
         </g>`
      : `<g transform="translate(${x},${y})">
           <polygon points="0,-13 9,0 0,13 -9,0" fill="#fef08a" stroke="#b45309" stroke-width="1.2"/>
           <polygon points="0,-9.5 6.5,0 0,9.5 -6.5,0" fill="#10b981"/>
           <polygon points="0,-9.5 6.5,0 0,0" fill="#6ee7b7" opacity=".75"/>
         </g>`;

    const boardShape = mode === '1v1'
      ? `
        <path d="${boardPath1v1}" fill="url(#jkOak)" stroke="url(#jkGoldTrim)" stroke-width="10"/>
        <path d="${boardPath1v1}" fill="none" stroke="#34ad74" stroke-width="4"/>
        <path d="${boardInner1v1}" fill="none" stroke="#f7e28b" stroke-width="2" stroke-opacity=".85"/>
        <path d="M44 134 Q190 108 336 134 M30 194 Q190 222 350 194 M30 264 Q190 240 350 264 M46 328 Q190 354 334 328" fill="none" stroke="#a67c4b" stroke-opacity=".2" stroke-width="2.2"/>
        <path d="M84 82 Q190 66 296 82 M84 378 Q190 394 296 378" fill="none" stroke="#a67c4b" stroke-opacity=".16" stroke-width="1.8"/>
        ${gemCrest(190, 14, false)}
        ${gemCrest(190, 446, false)}
      `
      : `
        <path d="${boardPath2v2}" fill="url(#jkOak)" stroke="url(#jkGoldTrim)" stroke-width="10"/>
        <path d="${boardPath2v2}" fill="none" stroke="#34ad74" stroke-width="4"/>
        <path d="${boardInner2v2}" fill="none" stroke="#f7e28b" stroke-width="2" stroke-opacity=".85"/>
        <path d="M62 142 Q200 120 338 142 M52 200 Q200 224 348 200 M62 258 Q200 238 338 258" fill="none" stroke="#a67c4b" stroke-opacity=".18" stroke-width="2"/>
        <!-- Carved Ornate Floral Diamond Medallion (matches official WePlay 2v2 reference) -->
        <g opacity=".92">
          <polygon points="200,130 270,200 200,270 130,200" fill="#d9af75" fill-opacity=".55" stroke="#b68749" stroke-width="1.6"/>
          <polygon points="200,140 260,200 200,260 140,200" fill="none" stroke="#f6e0a8" stroke-width="1.2" stroke-opacity=".85"/>
          <path d="M200 152 Q216 178 248 200 Q216 222 200 248 Q184 222 152 200 Q184 178 200 152 Z" fill="none" stroke="#b68749" stroke-width="1.3" stroke-opacity=".65"/>
        </g>
        ${gemCrest(200, 12, false)}
        ${gemCrest(200, 388, false)}
        ${gemCrest(12, 200, true)}
        ${gemCrest(388, 200, true)}
      `;

    // 2. Teleport Dashed Arc Arrows (1v1 only — 2v2 has empty teleportMap!)
    let tpArcs = '';
    const tpEntries = Object.entries(cfg.teleportMap || {});
    tpEntries.forEach(([fromIdx, toIdx]) => {
      const a = trackXY(Number(fromIdx));
      const b = trackXY(Number(toIdx));
      let mx = (a.x + b.x) / 2 + (cx - (a.x + b.x) / 2) * 0.25;
      let my = (a.y + b.y) / 2 + (cy - (a.y + b.y) / 2) * 0.25;
      let ax = a.x, ay = a.y, bx = b.x, by = b.y;
      if (mode === '1v1') {
        const isTop = Number(fromIdx) === 17;
        ax = isTop ? a.x + 10 : a.x - 10;
        bx = isTop ? b.x - 11 : b.x + 11;
        ay = isTop ? a.y + 4 : a.y - 4;
        by = isTop ? b.y + 4 : b.y - 4;
        mx = 190;
        my = isTop ? 164 : 296;
      }
      tpArcs += `<path d="M${ax.toFixed(1)} ${ay.toFixed(1)} Q${mx.toFixed(1)} ${my.toFixed(1)} ${bx.toFixed(1)} ${by.toFixed(1)}" fill="none" stroke="#8c6230" stroke-opacity=".75" stroke-width="2" stroke-dasharray="4.5 4" marker-end="url(#jkTpArrow)"/>`;
    });

    // 3. Track Carved Holes, Start Squares & Golden Swirl Teleports (1v1 only)
    let trackDots = '';
    const tpTargets = new Set(Object.values(cfg.teleportMap || {}));
    const holeR = mode === '1v1' ? 5.1 : 3.9;
    const startHalf = mode === '1v1' ? 8 : 5.6;
    for (let i = 0; i < TRACK_LEN; i++) {
      const pt = trackXY(i);
      const startSeat = Object.keys(cfg.startPositions).find(s => cfg.startPositions[s] === i);
      const isTpStart = cfg.teleportMap && cfg.teleportMap[i] !== undefined;
      const isTpDest = tpTargets.has(i);
      if (startSeat !== undefined) {
        const col = palette[Number(startSeat)].hex;
        trackDots += `
          <rect x="${(pt.x - startHalf).toFixed(1)}" y="${(pt.y - startHalf).toFixed(1)}" width="${(startHalf * 2).toFixed(1)}" height="${(startHalf * 2).toFixed(1)}" rx="${mode === '1v1' ? '4.2' : '3.4'}" fill="#684520" stroke="${col}" stroke-width="${mode === '1v1' ? '2.5' : '2.1'}"/>
        `;
      } else if (isTpStart) {
        trackDots += `
          <g transform="translate(${pt.x.toFixed(1)},${pt.y.toFixed(1)})">
            <circle r="7.8" fill="#fffbeb" stroke="#f59e0b" stroke-width="1.8"/>
            <path d="M0 -4.8 C3.8 -4.8 4.8 -1 1.8 1 C0 1.8 -2.8 1 -1.8 -1 C-1 -1.8 1 -1.8 1 0 M0 4.8 C-3.8 4.8 -4.8 1 -1.8 -1" fill="none" stroke="#d97706" stroke-width="1.8" stroke-linecap="round"/>
            <circle r="1.6" fill="#f59e0b"/>
          </g>
        `;
      } else if (isTpDest) {
        trackDots += `<circle cx="${pt.x.toFixed(1)}" cy="${pt.y.toFixed(1)}" r="6.4" fill="#684520" stroke="#fff7ed" stroke-width="2"/>`;
      } else {
        trackDots += `<circle cx="${pt.x.toFixed(1)}" cy="${pt.y.toFixed(1)}" r="${holeR}" fill="#6f4d27" stroke="#c39a67" stroke-width=".9"/>`;
      }
    }

    // 4. Clover 4-Hole Wooden Bases & Colored Home Columns
    let homeAndBases = '';
    const homeR = mode === '1v1' ? 7.1 : 5.3;
    const petalStep = mode === '1v1' ? 14 : 12.2;
    const petalR = mode === '1v1' ? 11.8 : 10.2;
    const baseHoleR = mode === '1v1' ? 7 : 5.9;
    players.forEach(p => {
      for (let h = 0; h < HOME_LEN; h++) {
        const pt = homeXY(p.seat, h);
        homeAndBases += `<circle cx="${pt.x.toFixed(1)}" cy="${pt.y.toFixed(1)}" r="${homeR}" fill="#66431e" stroke="${p.color.hex}" stroke-width="${mode === '1v1' ? '2.3' : '2'}"/>`;
      }
      const bc = baseCenters[p.seat];
      homeAndBases += `
        <g>
          <circle cx="${bc.x}" cy="${bc.y - petalStep}" r="${petalR}" fill="#c3955d" stroke="#996d3a" stroke-width="1.3"/>
          <circle cx="${bc.x + petalStep}" cy="${bc.y}" r="${petalR}" fill="#c3955d" stroke="#996d3a" stroke-width="1.3"/>
          <circle cx="${bc.x}" cy="${bc.y + petalStep}" r="${petalR}" fill="#c3955d" stroke="#996d3a" stroke-width="1.3"/>
          <circle cx="${bc.x - petalStep}" cy="${bc.y}" r="${petalR}" fill="#c3955d" stroke="#996d3a" stroke-width="1.3"/>
          <circle cx="${bc.x}" cy="${bc.y}" r="${petalR}" fill="#c3955d"/>
          ${[0, 1, 2, 3].map(idx => {
            const hp = baseXY(p.seat, idx);
            return `<circle cx="${hp.x}" cy="${hp.y}" r="${baseHoleR}" fill="#6d4820" stroke="${p.color.hex}" stroke-opacity=".88" stroke-width="1.6"/>`;
          }).join('')}
        </g>
      `;
    });

    // 5. Realistic Fanned White Playing Card Stack in Center
    const shownCard = curTop || { rank: 'A', suit: '♠', red: false };
    const cardInk = shownCard.red ? '#dc2626' : '#1e293b';
    const centerExtra = shownCard.rank === '5'
      ? `<circle cx="15" cy="-6" r="2.6" fill="#2563eb"/><circle cx="15" cy="1" r="2.6" fill="#ef4444"/><circle cx="15" cy="8" r="2.6" fill="#f59e0b"/><circle cx="15" cy="15" r="2.6" fill="#22c55e"/>`
      : shownCard.rank === 'A'
        ? `<text x="2" y="16" text-anchor="middle" font-size="24" fill="${cardInk}">${shownCard.suit}</text>`
        : `<text x="0" y="15" text-anchor="middle" font-size="28" font-weight="900" fill="${cardInk}">${shownCard.rank}</text>`;

    const dropCls = justDroppedCard ? 'jk-card-drop-pop' : '';
    justDroppedCard = false;

    const cardScale = mode === '1v1' ? 1 : 0.84;
    const centerCardSvg = `
      <g transform="translate(${cx},${cy}) scale(${cardScale})">
        <rect x="-27" y="-36" width="54" height="72" rx="8" fill="#cbd5e1" stroke="#94a3b8" stroke-width=".9" transform="rotate(-24) translate(-2,3)" opacity=".88"/>
        <rect x="-27" y="-36" width="54" height="72" rx="8" fill="#e2e8f0" stroke="#cbd5e1" stroke-width=".9" transform="rotate(14) translate(3,2)" opacity=".92"/>
        <rect x="-27" y="-36" width="54" height="72" rx="8" fill="#f1f5f9" stroke="#cbd5e1" stroke-width=".9" transform="rotate(-7) translate(-1,1)" opacity=".96"/>
        <g class="${dropCls}">
          <g transform="rotate(${curTop ? 16 : -10})">
            <rect x="-27" y="-36" width="54" height="72" rx="8" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.3" filter="url(#jkCardSh)"/>
            <text x="-20" y="-19" font-size="13" font-weight="900" fill="${cardInk}">${shownCard.rank}</text>
            <text x="-20" y="-7" font-size="11" fill="${cardInk}">${shownCard.suit}</text>
            ${shownCard.rank === '5'
              ? `<text x="-1" y="14" text-anchor="middle" font-size="28" font-weight="900" fill="${cardInk}">5</text>${centerExtra}`
              : centerExtra}
          </g>
        </g>
      </g>
    `;

    // 6. Clickable Destination Preview Markers (so players see exact landing spots!)
    let destMarkers = '';
    const destR = mode === '1v1' ? 11.5 : 9.2;
    selectableTargets.forEach((info, mbId) => {
      if (!info.dest) return;
      const mb = marbles.find(x => x.id === mbId);
      if (!mb) return;
      const dPt = nodeXY(mb.owner, info.dest);
      destMarkers += `
        <g class="jk-dest-marker" data-jkdest="${mbId}" transform="translate(${dPt.x.toFixed(1)},${dPt.y.toFixed(1)})" role="button" tabindex="0" aria-label="Move stone ${info.label}">
          <circle r="${destR}" fill="rgba(254,240,138,.28)" stroke="#fef08a" stroke-width="2" stroke-dasharray="3.5 2.5" class="jk-pulse-ring"/>
          <circle r="3.6" fill="#fef08a"/>
        </g>
      `;
    });

    // 7. Glossy 3D Marbles centered at (0,0) inside transform="translate(x,y)" for 60fps RAF hopping!
    let marbleNodes = '';
    const mRad = mode === '1v1' ? 8.1 : 6.4;
    const mShadowR = mode === '1v1' ? 7.8 : 6.1;
    const mRingR = mode === '1v1' ? 13 : 10.5;
    marbles.forEach(mb => {
      const pt = marbleXY(mb);
      const col = palette[mb.owner];
      const isSel = selectableTargets.has(mb.id);
      const isPicked = mb.id === jackMyMarbleId || mb.id === splitMarbleA;
      marbleNodes += `
        <g class="jk-marble-g ${isSel ? 'selectable' : ''} ${isPicked ? 'picked' : ''}" data-jkm="${mb.id}" transform="translate(${pt.x.toFixed(1)},${pt.y.toFixed(1)})" role="button" tabindex="${isSel ? '0' : '-1'}" aria-label="${esc(col.name)} stone">
          ${isSel ? `<circle cx="0" cy="0" r="${mRingR}" fill="rgba(254,240,138,.22)" stroke="#fef08a" stroke-width="2.4" class="jk-pulse-ring"/>` : ''}
          <circle data-jksh="1" cx="1.2" cy="2" r="${mShadowR}" fill="rgba(0,0,0,.35)"/>
          <circle cx="0" cy="0" r="${mRad}" fill="url(#jkGrad_${mb.owner})" stroke="${isPicked ? '#fef08a' : '#ffffff'}" stroke-width="${isPicked ? '2.2' : '1.3'}" stroke-opacity=".92"/>
          <ellipse cx="${(-mRad * 0.31).toFixed(1)}" cy="${(-mRad * 0.34).toFixed(1)}" rx="${(mRad * 0.37).toFixed(1)}" ry="${(mRad * 0.21).toFixed(1)}" transform="rotate(-25 ${(-mRad * 0.31).toFixed(1)} ${(-mRad * 0.34).toFixed(1)})" fill="#ffffff" opacity=".88"/>
        </g>
      `;
    });

    const burstSvg = burstCoord
      ? `<g class="jk-burst" transform="translate(${burstCoord.x.toFixed(1)},${burstCoord.y.toFixed(1)})">
          <circle r="19" fill="none" stroke="${burstCoord.color}" stroke-width="3" opacity=".9"/>
          <circle r="11" fill="#fef08a" opacity=".65"/>
        </g>`
      : '';
    burstCoord = null;

    svg.innerHTML = `
      <defs>
        <radialGradient id="jkOak" cx="46%" cy="38%" r="68%">
          <stop offset="0%" stop-color="#edd3aa"/>
          <stop offset="56%" stop-color="#dbb47e"/>
          <stop offset="100%" stop-color="#c2955c"/>
        </radialGradient>
        <linearGradient id="jkGoldTrim" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fef08a"/>
          <stop offset="45%" stop-color="#eab308"/>
          <stop offset="100%" stop-color="#9a6715"/>
        </linearGradient>
        <filter id="jkCardSh" x="-22%" y="-22%" width="144%" height="144%">
          <feDropShadow dx="0" dy="3" stdDeviation="3.2" flood-color="#000" flood-opacity="0.34"/>
        </filter>
        <marker id="jkTpArrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">
          <path d="M1 1.5 L8.5 5 L1 8.5 Z" fill="#8c6230"/>
        </marker>
        ${cfg.activeSeats.map(seat => {
          const c = palette[seat];
          return `
            <radialGradient id="jkGrad_${seat}" cx="34%" cy="28%" r="72%">
              <stop offset="0%" stop-color="${c.hi}"/>
              <stop offset="32%" stop-color="${c.hex}"/>
              <stop offset="100%" stop-color="${c.dark}"/>
            </radialGradient>
          `;
        }).join('')}
      </defs>
      ${boardShape}
      ${tpArcs}
      ${homeAndBases}
      ${trackDots}
      ${centerCardSvg}
      ${destMarkers}
      <g id="jkAnimFxLayer" pointer-events="none"></g>
      ${marbleNodes}
      ${burstSvg}
    `;

    svg.querySelectorAll('[data-jkm]').forEach(el => {
      el.onclick = () => handleMarbleClick(el.dataset.jkm);
    });
    svg.querySelectorAll('[data-jkdest]').forEach(el => {
      el.onclick = () => handleMarbleClick(el.dataset.jkdest);
    });

    // Combo AWESOME! popup
    const popLayer = $('#jkPopLayer', m);
    if (popLayer && comboBanner) {
      let el = $('#jkComboPop', popLayer);
      if (!el) {
        el = document.createElement('div');
        el.id = 'jkComboPop';
        el.className = 'jk-awesome-pop';
        popLayer.appendChild(el);
      }
      el.textContent = comboBanner;
    }
  };

  // =========================================================================
  // MAIN RENDER (ONLY PLAYABLE CARDS GLOW · UNPLAYABLE CARDS FADE)
  // =========================================================================
  const render = () => {
    const curP = players[turnIdx];
    const t0 = getTeamScore(0);
    if (typeof m.setStatus === 'function') {
      m.setStatus(
        over ? 'Finished' : (turnIdx === 0 ? `Your Turn (${t0}/${totalTeamMarbles})` : `${curP.name}…`),
        over ? 'neutral' : (turnIdx === 0 ? 'turn' : 'bot')
      );
    }

    renderCorners();
    renderBoardSvg();

    const st = getStateObj();
    const isMyTurn = !over && !isAnimating && turnIdx === 0;

    const actBar = $('#jkActionBar', m);
    if (actBar) {
      let controls = '';
      if (isMyTurn && selectedCardId) {
        const card = players[0].hand.find(c => c.id === selectedCardId);
        const legal = card ? Rules.getLegalActionsForCard(card, 0, st) : null;
        if (card && legal) {
          if (actionSubMode === 'ace_pick') {
            controls = `<div class="jk-sub-row">
              ${legal.exitBase ? `<button type="button" class="btn sm ok" data-jkopt="instant_open">Open Stone</button>` : ''}
              ${legal.movesByStep[1] ? `<button type="button" class="btn sm" data-jkopt="step:1">Move +1</button>` : ''}
              ${legal.movesByStep[11] ? `<button type="button" class="btn sm gold" data-jkopt="step:11">Move +11</button>` : ''}
              <button type="button" class="btn sm ghost" data-jkopt="cancel">Cancel</button>
            </div>`;
          } else if (actionSubMode === 'two_pick') {
            controls = `<div class="jk-sub-row">
              ${legal.exitBase ? `<button type="button" class="btn sm ok" data-jkopt="instant_open">Open Stone</button>` : ''}
              ${legal.movesByStep[2] ? `<button type="button" class="btn sm" data-jkopt="step:2">Move +2</button>` : ''}
              <button type="button" class="btn sm ghost" data-jkopt="cancel">Cancel</button>
            </div>`;
          } else if (actionSubMode === 'king_pick') {
            controls = `<div class="jk-sub-row">
              ${legal.exitBase ? `<button type="button" class="btn sm ok" data-jkopt="instant_open">Open Stone</button>` : ''}
              ${legal.movesByStep[13] ? `<button type="button" class="btn sm gold" data-jkopt="sweep:13">Move +13 Sweep ⊗</button>` : ''}
              <button type="button" class="btn sm ghost" data-jkopt="cancel">Cancel</button>
            </div>`;
          } else if (actionSubMode === 'seven_pick') {
            controls = `<div class="jk-sub-row">
              ${legal.movesByStep[7] ? `<button type="button" class="btn sm gold" data-jkopt="step:7">Move +7</button>` : ''}
              ${legal.split7Options.length ? `<button type="button" class="btn sm" data-jkopt="split7">Split 7 (2 Stones)</button>` : ''}
              <button type="button" class="btn sm ghost" data-jkopt="cancel">Cancel</button>
            </div>`;
          } else if (actionSubMode === 'seven_split') {
            const validA = Array.from(new Set(legal.split7Options.map(o => o.stepA))).sort((a, b) => a - b);
            controls = `<div class="jk-sub-row">
              ${validA.map(s => `<button type="button" class="btn sm ${splitStepA === s ? 'gold' : 'ghost'}" data-jksplit="${s}">${s}+${7 - s}</button>`).join('')}
              <button type="button" class="btn sm ghost" data-jkopt="cancel">Cancel</button>
            </div>`;
          } else if (actionSubMode === 'ten_pick') {
            controls = `<div class="jk-sub-row">
              ${legal.movesByStep[10] ? `<button type="button" class="btn sm" data-jkopt="step:10">Move +10</button>` : ''}
              ${legal.canDiscardEnemy ? `<button type="button" class="btn sm red" data-jkopt="burn_enemy">▸▭ Discard Rival (+1 Turn)</button>` : ''}
              <button type="button" class="btn sm ghost" data-jkopt="cancel">Cancel</button>
            </div>`;
          } else {
            controls = `<div class="jk-sub-row">
              <button type="button" class="btn sm ghost" data-jkopt="cancel">Change Card</button>
            </div>`;
          }
        }
      }
      const afkBannerHtml = playerAfk && !over
        ? `<button type="button" class="turn-afk-banner" id="jkAfkBanner" data-testid="jk-afk-banner">🤖 Auto-Play Active (3s) · Tap anywhere to resume</button>`
        : '';
      actBar.innerHTML = `${afkBannerHtml}<div class="jk-status-msg">${esc(lastActionText)}</div>${controls}`;
      const afkBtn = $('#jkAfkBanner', actBar);
      if (afkBtn) afkBtn.onclick = () => resumeFromAfk();

      actBar.querySelectorAll('[data-jkopt]').forEach(btn => {
        btn.onclick = () => {
          if (over || isAnimating || turnIdx !== 0) return;
          const opt = btn.dataset.jkopt;
          const meP = players[0];
          const card = meP.hand.find(c => c.id === selectedCardId);
          if (opt === 'cancel') {
            clearSelectionState();
            lastActionText = 'Tap a glowing card to play';
            render();
            return;
          }
          if (!card) return;
          const curSt = getStateObj();
          const legal = Rules.getLegalActionsForCard(card, 0, curSt);

          if (opt === 'instant_open') {
            const mb = marbles.find(x => x.id === legal.exitMarbleId);
            if (!mb) return;
            runAnimatedBaseExit(meP, mb, card, (extra) => advanceTurn(extra));
          } else if (opt.startsWith('step:') || opt.startsWith('sweep:')) {
            const isSweep = opt.startsWith('sweep:');
            const stp = Number(opt.split(':')[1]);
            const validList = legal.movesByStep[stp] || [];
            // If only 1 marble can legally make this step, auto-move immediately!
            if (validList.length === 1) {
              const mv = validList[0];
              const mb = marbles.find(x => x.id === mv.marbleId);
              if (mb) {
                runAnimatedTrackedMove(
                  meP,
                  mb,
                  mv.dest,
                  card,
                  `${meP.color.emoji} Moved +${stp} with ${card.rank}${card.suit}`,
                  (extra) => advanceTurn(extra)
                );
                return;
              }
            }
            actionSubMode = 'step';
            chosenSteps = stp;
            chosenSweep = isSweep;
            lastActionText = isSweep
              ? 'King +13 Sweep: tap a glowing stone or target spot!'
              : `Tap a glowing stone or target spot to move +${stp}`;
            render();
          } else if (opt === 'split7') {
            actionSubMode = 'seven_split';
            splitMarbleA = null;
            if (legal.split7Options.length && !legal.split7Options.some(o => o.stepA === splitStepA)) {
              splitStepA = legal.split7Options[0].stepA;
            }
            lastActionText = `Split 7 (${splitStepA}+${7 - splitStepA}): tap your 1st glowing stone`;
            render();
          } else if (opt === 'burn_enemy') {
            runDiscardEnemy(meP, legal.oppSeatForDiscard, card, (extra) => advanceTurn(extra));
          }
        };
      });

      actBar.querySelectorAll('[data-jksplit]').forEach(btn => {
        btn.onclick = () => {
          splitStepA = Number(btn.dataset.jksplit);
          splitMarbleA = null;
          lastActionText = `Split 7 (${splitStepA}+${7 - splitStepA}): tap your 1st glowing stone`;
          render();
        };
      });
    }

    const handTray = $('#jkHandTray', m);
    if (handTray) {
      const myHand = players[0].hand;
      const playabilityMap = new Map();
      let anyPlayable = false;
      if (isMyTurn) {
        myHand.forEach(c => {
          const ok = Rules.isCardPlayable(c, 0, st);
          playabilityMap.set(c.id, ok);
          if (ok) anyPlayable = true;
        });
      }

      handTray.style.gridTemplateColumns = myHand.length > 0 && myHand.length < 4
        ? `repeat(${myHand.length}, minmax(0, 86px))`
        : `repeat(${Math.max(4, myHand.length)}, minmax(0, 1fr))`;
      handTray.style.justifyContent = myHand.length > 0 && myHand.length < 4 ? 'center' : '';
      handTray.innerHTML = myHand.length
        ? myHand.map(c => {
            const canUse = isMyTurn ? Boolean(playabilityMap.get(c.id)) : false;
            const stateCls = !isMyTurn
              ? 'is-waiting'
              : (anyPlayable ? (canUse ? 'is-playable' : 'is-unplayable') : 'is-discardable');
            const isDisabled = !isMyTurn || (anyPlayable && !canUse);
            return `
              <button type="button" class="jk-card ${c.red ? 'red' : 'blk'} ${stateCls} ${selectedCardId === c.id ? 'sel' : ''}" data-jkcard="${c.id}" data-playable="${canUse ? '1' : '0'}" ${isDisabled ? 'disabled' : ''}>
                <span class="jk-c-corner"><b>${c.rank}</b><i>${c.suit}</i></span>
                <div class="jk-c-art">${renderCardArt(c)}</div>
              </button>
            `;
          }).join('')
        : `<div class="mp-sys-line" style="grid-column:1/-1;text-align:center">Dealing next 4-card round…</div>`;
      handTray.querySelectorAll('[data-jkcard]').forEach(b => {
        b.onclick = () => handleCardSelect(b.dataset.jkcard);
      });
    }
  };

  // =========================================================================
  // BIND TOP BAR & BOTTOM VOICE/MIC/CHAT DOCK
  // =========================================================================
  if ($('#jkExitBtn', m)) {
    $('#jkExitBtn', m).onclick = () => {
      if (typeof playSfx === 'function') playSfx('tap');
      m.close();
    };
  }
  if ($('#jkMenuBtn', m)) {
    $('#jkMenuBtn', m).onclick = () => {
      if (typeof playSfx === 'function') playSfx('tap');
      const nextMode = mode === '1v1' ? '2v2' : '1v1';
      const mm = modal('Jackaroo Room Menu', `
        <div style="display:flex;flex-direction:column;gap:8px">
          <button type="button" class="btn full" id="jkmRules">📖 Rules &amp; Card Roles</button>
          <button type="button" class="btn ok full" id="jkmInvite">👥 Invite Friend (Room ${esc(roomCode)})</button>
          <button type="button" class="btn gold full" id="jkmSwitch">🔄 Switch to ${nextMode === '2v2' ? '4 Players (2v2)' : '2 Players (1v1)'}</button>
          <button type="button" class="btn ghost full" id="jkmLeave">🚪 Leave Table</button>
        </div>
      `);
      $('#jkmRules', mm).onclick = () => { mm.close(); openJackarooRulesModal(0); };
      $('#jkmInvite', mm).onclick = () => { mm.close(); triggerInviteFriend(); };
      $('#jkmSwitch', mm).onclick = () => { mm.close(); m.close(); launchJackaroo(stake, rival, nextMode, botTier, roomCode); };
      $('#jkmLeave', mm).onclick = () => { mm.close(); m.close(); };
    };
  }
  if ($('#jkRulesBtn', m)) {
    $('#jkRulesBtn', m).onclick = () => {
      if (typeof playSfx === 'function') playSfx('tap');
      openJackarooRulesModal(0);
    };
  }
  if ($('#jkInviteBtn', m)) {
    $('#jkInviteBtn', m).onclick = () => {
      if (typeof playSfx === 'function') playSfx('tap');
      triggerInviteFriend();
    };
  }
  m.querySelectorAll('[data-jk-invite]').forEach(btn => {
    btn.onclick = () => {
      if (typeof playSfx === 'function') playSfx('tap');
      triggerInviteFriend();
    };
  });

  if ($('#jkSpkBtn', m)) {
    $('#jkSpkBtn', m).onclick = () => {
      if (typeof SFX !== 'undefined' && typeof SFX.toggle === 'function') {
        micState.speakerMuted = SFX.toggle();
      } else {
        micState.speakerMuted = !micState.speakerMuted;
      }
      syncDockUi();
    };
  }

  const micBtn = $('#jkMicBtn', m);
  if (micBtn) {
    micBtn.onclick = () => {
      if (micState.mode === 'ptt') return; // Handled by pointerdown/up
      setMicLive(!micState.live);
    };
    micBtn.onpointerdown = () => {
      if (micState.mode === 'ptt' && !micState.live) {
        micState.pttHolding = true;
        setMicLive(true);
      }
    };
    const releasePtt = () => {
      if (micState.mode === 'ptt' && micState.pttHolding) {
        micState.pttHolding = false;
        setMicLive(false);
      }
    };
    micBtn.onpointerup = releasePtt;
    micBtn.onpointerleave = releasePtt;
  }

  if ($('#jkMicOptBtn', m)) {
    $('#jkMicOptBtn', m).onclick = (e) => {
      e.stopPropagation();
      if (typeof playSfx === 'function') playSfx('tap');
      renderMicOptionsPopover();
    };
  }

  if ($('#jkChBtn', m)) {
    $('#jkChBtn', m).onclick = () => {
      chatChannel = chatChannel === 'all' ? 'team' : 'all';
      syncDockUi();
      if (typeof playSfx === 'function') playSfx('tap');
    };
  }

  const chatInput = $('#jkChatInput', m);
  if (chatInput) {
    chatInput.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter') {
        const msg = chatInput.value.trim();
        if (!msg) return;
        chatInput.value = '';
        const prefix = chatChannel === 'team' ? '[Team] ' : '';
        showAvatarBubble(0, prefix + msg);
        if (typeof playSfx === 'function') playSfx('chatSend');
      }
    });
  }

  if ($('#jkEmojiBtn', m)) {
    $('#jkEmojiBtn', m).onclick = (e) => {
      e.stopPropagation();
      if (typeof playSfx === 'function') playSfx('tap');
      renderEmojiPopover();
    };
  }

  if ($('#jkQvBtn', m)) {
    $('#jkQvBtn', m).onclick = (e) => {
      e.stopPropagation();
      closePopover();
      if (typeof QuickVoice !== 'undefined') {
        QuickVoice.openPanel($('#jkQvBtn', m), 'jackaroo', (text, ico) => {
          showAvatarBubble(0, `${ico} ${text}`);
        });
      }
    };
  }

  // Any tap anywhere in the Jackaroo stage immediately resumes manual control if AFK Auto-Play is on
  const shellEl = $('#jkShell', m);
  if (shellEl) {
    shellEl.addEventListener('pointerdown', () => {
      if (playerAfk && !over) resumeFromAfk();
    }, true);
  }

  m.onclose = () => {
    over = true;
    cancelActiveAnim();
    stopTurnTimer();
    clearTimeout(hiddenPickTimer);
    pendingHiddenDiscard = null;
    clearTimeout(vsTimer);
    clearTimeout(comboTimer);
    clearInterval(rematchTimer);
    stopMicStream();
    if (typeof QuickVoice !== 'undefined') QuickVoice.closePanel();
  };

  syncDockUi();
  render();
  renderVsIntro();
}
