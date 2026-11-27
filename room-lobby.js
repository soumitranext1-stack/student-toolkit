"use strict";
/* =====================================================================
   UNIFIED LIVE MULTIPLAYER WAITING ROOM LOBBY & FIRESTORE SYNC ENGINE
   · Real Firestore `game_rooms` creation on Invite Friend (status: 'waiting')
   · Direct Firestore lookup on ?room=XXXX / World Chat / DM / Code Join
     (eliminates "Room is no longer active" false errors across devices/tabs)
   · 2-Seat (1v1/2P) & 4-Seat (4P/2v2) Visual Seat Lobby (zero auto-bots)
   · Guest Ready toggle (green READY badge) & Host Start Game synchronization
   · Optional Host-only "+ Add Bot", Copy Link, Copy Code, World Chat & DM Invite
   ===================================================================== */

(function () {
  let activeLobbyUnsub = null;
  let activeLobbyRoomId = null;
  let activeLobbyView = null;
  let activeLobbyBroadcast = null;
  let activeLobbyStorageHandler = null;
  let launchedRoomKeys = new Set();

  function getRules() {
    return window.RoomLobbyRules || null;
  }

  function getBroadcastChannel() {
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        if (!activeLobbyBroadcast) {
          activeLobbyBroadcast = new BroadcastChannel('sg_game_rooms_sync');
        }
        return activeLobbyBroadcast;
      }
    } catch {}
    return null;
  }

  function getActiveUid() {
    if (typeof auth !== 'undefined' && auth && auth.currentUser && auth.currentUser.uid) {
      return String(auth.currentUser.uid);
    }
    return typeof uid !== 'undefined' ? String(uid) : 'local_me';
  }

  function mySeatProfile() {
    return {
      uid: getActiveUid(),
      name: (typeof me !== 'undefined' && me && me.name) ? String(me.name) : 'Player',
      avatar: (typeof me !== 'undefined' && me && me.avatar) ? String(me.avatar) : 'av_b1',
      frame: (typeof me !== 'undefined' && me && me.frame) ? String(me.frame) : 'none'
    };
  }

  function syncLocalMpRoomsCache(room, remove) {
    if (!room || !room.id) return;
    if (typeof mpRooms === 'undefined' || !Array.isArray(mpRooms)) return;
    const idx = mpRooms.findIndex(r => r && r.id === room.id);
    if (remove) {
      if (idx >= 0) mpRooms.splice(idx, 1);
    } else if (idx >= 0) {
      mpRooms[idx] = room;
    } else {
      mpRooms.unshift(room);
      if (mpRooms.length > 30) mpRooms.length = 30;
    }
    try {
      if (typeof ls !== 'undefined' && ls.set) ls.set('sg_mp_rooms', mpRooms.slice(0, 30));
      else localStorage.setItem('sg_mp_rooms', JSON.stringify(mpRooms.slice(0, 30)));
    } catch {}
    if (typeof renderMultiplayerRooms === 'function') renderMultiplayerRooms();
    if (typeof renderGamesLauncher === 'function' && $('#v-games')?.classList.contains('on')) {
      renderGamesLauncher();
    }
  }

  async function writeRoomToStore(rawRoom, opts) {
    const Rules = getRules();
    const room = Rules ? Rules.normalizeRoomDoc(rawRoom) : rawRoom;
    if (!room || !room.id) return null;
    room.updatedAt = Date.now();
    // Keep Firestore security rules satisfied on every write
    room.entryCoins = Math.max(0, Math.min(500, Math.floor(Number(room.entryCoins || 0))));

    syncLocalMpRoomsCache(room, false);

    try {
      const ch = getBroadcastChannel();
      if (ch) ch.postMessage({ type: 'room_update', room });
    } catch {}

    const canCloud = typeof F !== 'undefined' && F && typeof db !== 'undefined' && db && typeof online !== 'undefined' && online;
    if (canCloud) {
      try {
        await F.setDoc(F.doc(db, 'game_rooms', room.id), room);
      } catch (err) {
        console.warn('writeRoomToStore Firestore write error:', err);
        if (opts && opts.requireCloud) throw err;
      }
    }
    return room;
  }

  async function deleteRoomFromStore(roomId) {
    if (!roomId) return;
    syncLocalMpRoomsCache({ id: roomId }, true);
    try {
      const ch = getBroadcastChannel();
      if (ch) ch.postMessage({ type: 'room_delete', roomId });
    } catch {}
    const canCloud = typeof F !== 'undefined' && F && typeof db !== 'undefined' && db && typeof online !== 'undefined' && online;
    if (canCloud) {
      try {
        await F.deleteDoc(F.doc(db, 'game_rooms', roomId));
      } catch {}
    }
  }

  function findBestMatchingRoom(list, roomId, cleanCode) {
    const arr = (Array.isArray(list) ? list : []).filter(Boolean);
    if (roomId) {
      const byId = arr.find(r => r.id === roomId);
      if (byId) return byId;
    }
    if (!cleanCode) return null;
    const byCode = arr
      .filter(r => String(r.code || '').trim().toUpperCase() === cleanCode)
      .sort((a, b) => Number(b.updatedAt || b.createdAt || 0) - Number(a.updatedAt || a.createdAt || 0));
    if (!byCode.length) return null;
    const waiting = byCode.find(r => r.status === 'waiting');
    if (waiting) return waiting;
    const playing = byCode.find(r => r.status === 'playing');
    if (playing) return playing;
    return byCode[0];
  }

  async function fetchLiveGameRoom(opts) {
    const o = opts || {};
    const roomId = String(o.roomId || '').trim();
    const cleanCode = String(o.roomCode || '').trim().toUpperCase();
    if (!roomId && !cleanCode) return null;

    // Wait for Firebase Auth + Firestore to be initialized before querying
    if (typeof window.waitForFirebaseReady === 'function') {
      try {
        await window.waitForFirebaseReady(4500);
      } catch {}
    }

    const Rules = getRules();
    const canCloud = typeof F !== 'undefined' && F && typeof db !== 'undefined' && db && typeof online !== 'undefined' && online;

    if (canCloud) {
      try {
        if (roomId) {
          const snap = await F.getDoc(F.doc(db, 'game_rooms', roomId));
          if (snap && snap.exists()) {
            const doc = { id: snap.id, ...snap.data() };
            const norm = Rules ? Rules.normalizeRoomDoc(doc) : doc;
            syncLocalMpRoomsCache(norm, false);
            return norm;
          }
        }
        if (cleanCode && typeof F.getDocs === 'function' && typeof F.query === 'function' && typeof F.where === 'function') {
          const q = F.query(F.collection(db, 'game_rooms'), F.where('code', '==', cleanCode));
          const snaps = await F.getDocs(q);
          if (snaps && snaps.docs && snaps.docs.length) {
            const docs = snaps.docs.map(d => ({ id: d.id, ...d.data() }));
            const best = findBestMatchingRoom(docs, roomId, cleanCode);
            if (best) {
              const norm = Rules ? Rules.normalizeRoomDoc(best) : best;
              syncLocalMpRoomsCache(norm, false);
              return norm;
            }
          }
        }
      } catch (err) {
        console.warn('fetchLiveGameRoom Firestore lookup fallback:', err);
      }
    }

    // Fallback to in-memory mpRooms + latest localStorage snapshot (supports offline / cross-tab)
    let cachedList = [];
    try {
      const raw = localStorage.getItem('sg_mp_rooms');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) cachedList = parsed;
      }
    } catch {}
    const combined = [
      ...(typeof mpRooms !== 'undefined' && Array.isArray(mpRooms) ? mpRooms : []),
      ...cachedList
    ];
    const match = findBestMatchingRoom(combined, roomId, cleanCode);
    return match ? (Rules ? Rules.normalizeRoomDoc(match) : match) : null;
  }

  function buildLobbyInviteUrl(room) {
    if (!room) return '';
    if (typeof buildRoomInviteUrl === 'function') {
      return buildRoomInviteUrl({
        gameId: room.mode,
        roomCode: room.code,
        roomId: room.id,
        mode: room.subMode || ''
      });
    }
    return `?room=${encodeURIComponent(room.code)}&game=${encodeURIComponent(room.mode || 'ludo')}&mode=${encodeURIComponent(room.subMode || '')}`;
  }

  function postLobbyInviteToWorldChat(room) {
    if (!room) return;
    const Rules = getRules();
    const meta = Rules ? Rules.getGameMeta(room.mode) : { name: room.tierLabel || 'Arena Match', icon: '🎮' };
    const gameName = room.tierLabel || meta.name;
    const url = buildLobbyInviteUrl(room);
    const modeTag = room.subMode ? ` (${String(room.subMode).toUpperCase()})` : '';
    const stakeTag = Number(room.entryCoins || 0) > 0 ? ` · ${room.entryCoins} 🪙` : ' · Free';
    const txt = `${meta.icon || '🎮'} Join ${gameName}${modeTag}${stakeTag}! Room Code: ${room.code} ${url}`;
    if (typeof sendWorldMsg === 'function') {
      sendWorldMsg(txt, {
        type: 'game_invite',
        gameId: room.mode,
        gameName,
        roomCode: room.code,
        roomId: room.id,
        mode: room.subMode || '',
        stake: Number(room.entryCoins || 0),
        url
      });
    }
    if (typeof playSfx === 'function') playSfx('chatSend');
    if (typeof toast === 'function') toast(`Invite posted to World Chat (${room.code})!`);
  }

  function openLobbyInviteFriendsModal(room) {
    if (!room || typeof modal !== 'function') return;
    const Rules = getRules();
    const meta = Rules ? Rules.getGameMeta(room.mode) : { name: room.tierLabel || 'Arena Match', icon: '🎮' };
    const gameName = room.tierLabel || meta.name;
    const inviteUrl = buildLobbyInviteUrl(room);
    const friendSet = new Set((typeof me !== 'undefined' && Array.isArray(me?.friends)) ? me.friends : []);
    const seatedUids = new Set((room.seats || []).map(s => s && s.uid).filter(Boolean));

    const onlineList = (typeof getRealOnlinePlayers === 'function'
      ? getRealOnlinePlayers({ excludeSelf: true })
      : (typeof allUsers === 'function' ? allUsers().filter(u => u && u.uid !== uid) : [])
    )
      .filter(u => u && u.uid && !seatedUids.has(u.uid))
      .sort((a, b) => (friendSet.has(b.uid) ? 1 : 0) - (friendSet.has(a.uid) ? 1 : 0))
      .slice(0, 24);

    const m = modal(`${meta.icon || '🎮'} Invite Friends · ${esc(room.code)}`, `
      <div class="wrl-inv-modal">
        <div class="wrl-inv-share-row">
          <button type="button" class="btn ok sm" id="wrlModCopyLink">🔗 Copy Invite Link</button>
          <button type="button" class="btn ghost sm" id="wrlModCopyCode">📋 Copy Code (${esc(room.code)})</button>
          <button type="button" class="btn gold sm" id="wrlModWorld">🌍 World Chat</button>
        </div>
        <div class="wrl-inv-sub">Online Friends &amp; Players</div>
        <div class="wrl-inv-list" id="wrlInvFriendsList">
          ${onlineList.length ? onlineList.map(u => {
            const isFr = friendSet.has(u.uid);
            const on = typeof isUserOnline === 'function' ? isUserOnline(u) : Boolean(u.online);
            return `
              <div class="wrl-inv-row">
                <div class="wrl-inv-user">
                  <span class="sg-av-presence-wrap">${av(u, 36)}${on ? '<span class="sg-online-dot sm"></span>' : ''}</span>
                  <div class="wrl-inv-meta">
                    <b>${esc(u.name || 'Player')}</b>
                    <small>${isFr ? '★ Friend · ' : ''}${on ? 'Online now' : 'Active recently'}</small>
                  </div>
                </div>
                <button type="button" class="btn sm ok" data-wrl-sendinv="${esc(u.uid)}">Invite</button>
              </div>
            `;
          }).join('') : `<div class="wrl-inv-empty">No other players online right now — share your <b>Invite Link</b> or post to <b>World Chat</b>!</div>`}
        </div>
      </div>
    `);

    $('#wrlModCopyLink', m).onclick = () => {
      if (typeof copyTextClean === 'function') copyTextClean(inviteUrl, 'Invite Link');
      else { try { navigator.clipboard?.writeText(inviteUrl); } catch {} toast('Invite link copied!'); }
    };
    $('#wrlModCopyCode', m).onclick = () => {
      if (typeof copyTextClean === 'function') copyTextClean(room.code, 'Room Code');
      else { try { navigator.clipboard?.writeText(room.code); } catch {} toast(`Copied ${room.code}`); }
    };
    $('#wrlModWorld', m).onclick = () => {
      postLobbyInviteToWorldChat(room);
      m.close();
    };
    $$('[data-wrl-sendinv]', m).forEach(btn => {
      btn.onclick = () => {
        const target = onlineList.find(u => u.uid === btn.dataset.wrlSendinv);
        if (!target) return;
        if (typeof sendUniversalRoomInviteToDm === 'function') {
          sendUniversalRoomInviteToDm(target, {
            gameId: room.mode,
            gameName,
            roomCode: room.code,
            roomId: room.id,
            mode: room.subMode || '',
            stake: Number(room.entryCoins || 0)
          });
        }
        btn.textContent = 'Sent ✓';
        btn.disabled = true;
        if (typeof playSfx === 'function') playSfx('chatSend');
        toast(`Room invite sent to ${target.name}!`);
      };
    });
  }

  function teardownLobbySubscriptions() {
    if (typeof activeLobbyUnsub === 'function') {
      try { activeLobbyUnsub(); } catch {}
    }
    activeLobbyUnsub = null;
    activeLobbyRoomId = null;
    if (activeLobbyStorageHandler) {
      try { window.removeEventListener('storage', activeLobbyStorageHandler); } catch {}
      activeLobbyStorageHandler = null;
    }
    if (activeLobbyBroadcast) {
      activeLobbyBroadcast.onmessage = null;
    }
  }

  async function transitionLobbyToLiveGame(room) {
    const Rules = getRules();
    if (!room || !room.id) return;
    const launchKey = `${room.id}_${room.startedAt || room.roundNo || 1}`;
    if (launchedRoomKeys.has(launchKey)) return;
    launchedRoomKeys.add(launchKey);

    teardownLobbySubscriptions();
    activeLobbyView = null;

    const myUid = getActiveUid();
    const parts = Rules ? Rules.extractMatchParticipants(room, myUid) : { rival: null, invitedFriends: [], seatRoster: [], isHost: room.hostUid === myUid };
    const stake = Math.max(0, Math.floor(Number(room.entryCoins || 0)));
    const isShowGame = room.mode === 'budget_clash' || room.mode === 'couple_arena';
    let stakeDeducted = false;

    if (stake > 0 && !isShowGame && typeof me !== 'undefined' && me) {
      const stakeDoneKey = 'wrl_stake_' + launchKey;
      if (!me.done?.[stakeDoneKey]) {
        if (Number(me.coins || 0) >= stake) {
          me.done = me.done || {};
          me.done[stakeDoneKey] = 1;
          if (typeof addReward === 'function') addReward(-stake, 0, null, true, { silentSfx: true, skipLevelUp: true });
          stakeDeducted = true;
          if (typeof playSfx === 'function') playSfx('stakeLock');
        }
      }
    } else if (typeof playSfx === 'function') {
      playSfx('turnStart');
    }

    if (typeof launchStandardizedGame === 'function') {
      await launchStandardizedGame(room.mode, {
        modeType: 'invite',
        botTier: stake > 0 ? 'pro' : 'standard',
        stake,
        stakeDeducted,
        subMode: room.subMode || '',
        roomCode: room.code,
        roomId: room.id,
        rival: parts.rival,
        invitedFriends: parts.invitedFriends,
        seatRoster: parts.seatRoster,
        isHost: parts.isHost
      });
    } else if (typeof openMultiplayerRoom === 'function') {
      openMultiplayerRoom(room.id);
    }
  }

  function openWaitingRoomLobbyView(initialRoom) {
    const Rules = getRules();
    if (!Rules || !initialRoom) return null;

    teardownLobbySubscriptions();

    let currentRoom = Rules.normalizeRoomDoc(initialRoom);
    activeLobbyRoomId = currentRoom.id;
    const meta = Rules.getGameMeta(currentRoom.mode);
    const myUid = () => getActiveUid();

    if (typeof setMyLiveActivity === 'function') {
      setMyLiveActivity({
        type: 'playing',
        gameId: currentRoom.mode,
        gameName: currentRoom.tierLabel || meta.name,
        roomCode: currentRoom.code,
        mode: currentRoom.subMode || ''
      });
    }

    const view = openFullScreenGameView({
      gameId: currentRoom.mode + '_waiting_lobby',
      title: `${meta.icon || '🎮'} ${currentRoom.tierLabel || meta.name}`,
      subMeta: `Room ${currentRoom.code}`,
      statusText: 'Waiting Lobby',
      statusTone: 'turn',
      themeClass: 'gfs-theme-lobby',
      html: `<div class="wrl-shell" id="wrlShell" data-testid="waiting-room-lobby" data-room-code="${esc(currentRoom.code)}"></div>`,
      onClose: () => {
        teardownLobbySubscriptions();
        if (activeLobbyView === view) activeLobbyView = null;
        if (typeof clearMyLiveActivity === 'function') clearMyLiveActivity();
      }
    });

    activeLobbyView = view;
    let busy = false;
    let closedByEvent = false;

    const renderLobby = () => {
      const shell = $('#wrlShell', view);
      if (!shell || !currentRoom) return;

      const selfUid = myUid();
      const isHost = currentRoom.hostUid === selfUid;
      const mySeat = currentRoom.seats.find(s => s && s.uid === selfUid);
      const occupiedSeats = currentRoom.seats.filter(s => s && s.kind !== 'empty' && s.uid);
      const emptyCount = currentRoom.seats.length - occupiedSeats.length;
      const startCheck = Rules.canStartRoom(currentRoom);
      const gameMeta = Rules.getGameMeta(currentRoom.mode);
      const formats = Array.isArray(gameMeta.formats) ? gameMeta.formats : [];
      const stakeOpts = [0, 25, 50, 100];
      const myCoins = Math.max(0, Math.floor(Number((typeof me !== 'undefined' && me?.coins) || 0)));
      const seatCount = currentRoom.seats.length;

      view.setSubMeta(`${currentRoom.code} · ${occupiedSeats.length}/${seatCount} Seated`);
      view.setStatus(startCheck.ok ? 'Ready!' : 'Waiting…', startCheck.ok ? 'win' : 'turn');

      const seatsHtml = currentRoom.seats.map((seat, idx) => {
        if (!seat || seat.kind === 'empty' || !seat.uid) {
          return `
            <button type="button" class="wrl-seat-card is-empty" data-wrl-empty-seat="${idx}" data-testid="wrl-seat-${idx}" aria-label="Empty Seat ${idx + 1} — Invite Friend">
              <div class="wrl-empty-plus" aria-hidden="true">+</div>
              <b class="wrl-empty-lbl">Empty Seat</b>
              <span class="wrl-invite-chip">+ Invite</span>
            </button>
          `;
        }

        const isSeatHost = seat.kind === 'host';
        const isSeatBot = seat.kind === 'bot' || Boolean(seat.isBot);
        const isMe = seat.uid === selfUid;
        const avatarHtml = typeof av === 'function'
          ? av({ avatar: seat.avatar || 'av_b1', frame: seat.frame || 'none', name: seat.name }, 44)
          : `<div class="wrl-av-fallback">${esc((seat.name || 'P').slice(0, 1).toUpperCase())}</div>`;

        const roleBadge = isSeatHost
          ? `<span class="wrl-role-badge is-host">👑 HOST</span>`
          : (isSeatBot
            ? `<span class="wrl-role-badge is-bot">🤖 BOT</span>`
            : `<span class="wrl-role-badge is-guest">${isMe ? 'YOU' : 'FRIEND'}</span>`);

        const readyBadge = isSeatHost
          ? `<span class="wrl-ready-pill is-host">HOST READY</span>`
          : (isSeatBot
            ? `<span class="wrl-ready-pill is-ready">✓ READY</span>`
            : (seat.ready
              ? `<span class="wrl-ready-pill is-ready" data-testid="wrl-seat-ready-${idx}">✓ READY</span>`
              : `<span class="wrl-ready-pill is-wait" data-testid="wrl-seat-wait-${idx}">Not Ready</span>`));

        return `
          <div class="wrl-seat-card is-filled ${isSeatHost ? 'is-host-card' : ''} ${seat.ready ? 'is-ready-card' : ''}" data-testid="wrl-seat-${idx}">
            <div class="wrl-seat-top">
              <span class="wrl-seat-num">Seat ${idx + 1}</span>
              <span class="wrl-seat-top-right">
                ${roleBadge}
                ${isHost && !isSeatHost ? `<button type="button" class="wrl-kick-btn" data-wrl-kick="${idx}" title="Remove ${esc(seat.name)}" aria-label="Remove ${esc(seat.name)}">✕</button>` : ''}
              </span>
            </div>
            <div class="wrl-seat-av">${avatarHtml}</div>
            <b class="wrl-seat-name">${esc(seat.name || 'Player')}</b>
            ${readyBadge}
          </div>
        `;
      }).join('');

      const chatList = (currentRoom.chat || []).slice(-18);
      const chatHtml = chatList.map(c => {
        if (c.type === 'sys') {
          return `<div class="wrl-chat-sys">${esc(c.text)}</div>`;
        }
        return `<div class="wrl-chat-msg"><b>${esc(c.name || 'Player')}:</b> <span>${esc(c.text)}</span></div>`;
      }).join('');

      shell.innerHTML = `
        <div class="wrl-top-card">
          <div class="wrl-code-block">
            <span class="wrl-live-tag"><i class="wrl-live-dot"></i> LIVE WAITING ROOM</span>
            <div class="wrl-code-row">
              <b class="wrl-code-val" id="wrlCodeVal" data-testid="wrl-room-code">${esc(currentRoom.code)}</b>
              <span class="wrl-stake-tag">${currentRoom.entryCoins > 0 ? `🪙 ${currentRoom.entryCoins} Stake` : 'Free Friendly'}</span>
            </div>
          </div>
          <div class="wrl-quick-share">
            <button type="button" class="btn sm ok" id="wrlCopyLinkBtn" data-testid="wrl-copy-link">🔗 Copy Link</button>
            <button type="button" class="btn sm ghost" id="wrlCopyCodeBtn" data-testid="wrl-copy-code">📋 Copy Code</button>
            <button type="button" class="btn sm ghost" id="wrlWorldShareBtn" data-testid="wrl-share-world">🌍 World Chat</button>
            <button type="button" class="btn sm gold" id="wrlInviteFriendsBtn" data-testid="wrl-invite-friends">👥 Invite Friends</button>
          </div>
        </div>

        ${(formats.length > 1 || isHost) ? `
          <div class="wrl-config-bar">
            ${formats.length > 1 ? `
              <div class="wrl-chip-group" role="group" aria-label="Match Format">
                ${formats.map(f => `
                  <button type="button" class="wrl-cfg-chip ${currentRoom.subMode === f.id ? 'on' : ''}" data-wrl-fmt="${esc(f.id)}" data-wrl-max="${f.maxPlayers}" ${!isHost ? 'disabled' : ''}>
                    ${esc(f.label)}
                  </button>
                `).join('')}
              </div>
            ` : ''}
            <div class="wrl-chip-group" role="group" aria-label="Entry Stake">
              ${stakeOpts.map(st => `
                <button type="button" class="wrl-cfg-chip ${Number(currentRoom.entryCoins) === st ? 'on' : ''}" data-wrl-stake="${st}" ${(!isHost || (st > myCoins && st !== Number(currentRoom.entryCoins))) ? 'disabled' : ''}>
                  ${st === 0 ? 'Free' : `🪙 ${st}`}
                </button>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <div class="wrl-seats-head">
          <b>Player Seats (${occupiedSeats.length}/${seatCount})</b>
          <small>${seatCount === 2 ? '1v1 / 2-Player Room' : '4-Player / Squad Room'}</small>
        </div>
        <div class="wrl-seats-grid seats-${seatCount}" data-testid="wrl-seats-grid">
          ${seatsHtml}
        </div>

        <div class="wrl-chat-box">
          <div class="wrl-chat-log" id="wrlChatLog">${chatHtml || '<div class="wrl-chat-sys">Invite friends using the link or code above!</div>'}</div>
          <div class="wrl-chat-input-row">
            <input id="wrlChatIn" maxlength="180" placeholder="Say hi to your lobby…" autocomplete="off" aria-label="Lobby chat message">
            <button type="button" class="btn sm" id="wrlChatSendBtn">Send</button>
          </div>
        </div>

        <div class="wrl-dock">
          <div class="wrl-dock-hint" id="wrlDockHint" data-testid="wrl-status-hint">
            ${isHost
              ? esc(startCheck.message)
              : (mySeat && mySeat.ready
                ? '✓ You are READY! Waiting for Host to start the game…'
                : 'Tap Ready below so the Host can start the match')}
          </div>
          ${isHost ? `
            <div class="wrl-dock-actions">
              <button type="button" class="btn gold full wrl-primary-cta" id="wrlStartBtn" data-testid="wrl-start-btn" ${!startCheck.ok ? 'disabled' : ''}>
                ▶ Start Game
              </button>
            </div>
            <div class="wrl-dock-sub-actions">
              ${emptyCount > 0 ? `<button type="button" class="btn ghost sm" id="wrlAddBotBtn" data-testid="wrl-add-bot">+ Add Bot</button>` : '<span></span>'}
              <button type="button" class="btn red sm" id="wrlCloseRoomBtn" data-testid="wrl-close-room">Close Room</button>
            </div>
          ` : `
            <div class="wrl-dock-actions">
              <button type="button" class="btn ${mySeat && mySeat.ready ? 'ghost wrl-ready-active' : 'ok'} full wrl-primary-cta" id="wrlReadyBtn" data-testid="wrl-ready-btn">
                ${mySeat && mySeat.ready ? '✓ READY (Tap to Cancel)' : '✓ Ready'}
              </button>
            </div>
            <div class="wrl-dock-sub-actions">
              <span></span>
              <button type="button" class="btn red sm" id="wrlLeaveRoomBtn" data-testid="wrl-leave-room">Leave Room</button>
            </div>
          `}
        </div>
      `;

      // Scroll chat log to latest message
      const chatLog = $('#wrlChatLog', shell);
      if (chatLog) chatLog.scrollTop = chatLog.scrollHeight;

      // Bind Share & Invite controls
      const inviteUrl = buildLobbyInviteUrl(currentRoom);
      $('#wrlCopyLinkBtn', shell).onclick = () => {
        if (typeof copyTextClean === 'function') copyTextClean(inviteUrl, 'Invite Link');
        else { try { navigator.clipboard?.writeText(inviteUrl); } catch {} toast('Invite link copied!'); }
        if (typeof playSfx === 'function') playSfx('tap');
      };
      $('#wrlCopyCodeBtn', shell).onclick = () => {
        if (typeof copyTextClean === 'function') copyTextClean(currentRoom.code, 'Room Code');
        else { try { navigator.clipboard?.writeText(currentRoom.code); } catch {} toast(`Copied ${currentRoom.code}`); }
        if (typeof playSfx === 'function') playSfx('tap');
      };
      $('#wrlWorldShareBtn', shell).onclick = () => postLobbyInviteToWorldChat(currentRoom);
      $('#wrlInviteFriendsBtn', shell).onclick = () => openLobbyInviteFriendsModal(currentRoom);

      // Empty seat tap -> Invite Friends modal
      $$('[data-wrl-empty-seat]', shell).forEach(btn => {
        btn.onclick = () => {
          if (typeof playSfx === 'function') playSfx('tap');
          openLobbyInviteFriendsModal(currentRoom);
        };
      });

      // Host: format switch
      $$('[data-wrl-fmt]', shell).forEach(btn => {
        btn.onclick = async () => {
          if (!isHost || busy) return;
          const nextFmt = btn.dataset.wrlFmt;
          const nextMax = Number(btn.dataset.wrlMax) || Rules.getDefaultMaxPlayers(currentRoom.mode, nextFmt);
          if (nextFmt === currentRoom.subMode && nextMax === currentRoom.maxPlayers) return;
          const res = Rules.resizeRoomSeats(currentRoom, nextMax, nextFmt, selfUid);
          if (!res.ok) return toast(res.message || 'Could not change format');
          busy = true;
          currentRoom = res.room;
          if (typeof playSfx === 'function') playSfx('tap');
          renderLobby();
          await writeRoomToStore(currentRoom);
          busy = false;
        };
      });

      // Host: stake switch
      $$('[data-wrl-stake]', shell).forEach(btn => {
        btn.onclick = async () => {
          if (!isHost || busy) return;
          const nextStake = Math.max(0, Math.min(500, Number(btn.dataset.wrlStake || 0)));
          if (nextStake === Number(currentRoom.entryCoins)) return;
          if (nextStake > myCoins) return toast(`Need ${nextStake} 🪙 to set this stake`);
          busy = true;
          currentRoom.entryCoins = nextStake;
          if (typeof playSfx === 'function') playSfx('tap');
          renderLobby();
          await writeRoomToStore(currentRoom);
          busy = false;
        };
      });

      // Host: kick seat / remove bot
      $$('[data-wrl-kick]', shell).forEach(btn => {
        btn.onclick = async (e) => {
          e.stopPropagation();
          if (!isHost || busy) return;
          const seatIdx = Number(btn.dataset.wrlKick);
          const res = Rules.removeSeatFromRoom(currentRoom, seatIdx, selfUid);
          if (!res.ok) return;
          busy = true;
          currentRoom = res.room;
          if (typeof playSfx === 'function') playSfx('tap');
          renderLobby();
          await writeRoomToStore(currentRoom);
          busy = false;
        };
      });

      // Lobby Chat send
      const sendChat = async () => {
        const inp = $('#wrlChatIn', shell);
        const text = String(inp?.value || '').trim();
        if (!text) return;
        if (typeof hasBadWord === 'function' && hasBadWord(text)) {
          return toast('Bad language is not allowed');
        }
        inp.value = '';
        const now = Date.now();
        currentRoom.chat = [
          ...(currentRoom.chat || []),
          { id: 'c_' + now + '_' + Math.random().toString(36).slice(2, 5), type: 'msg', uid: selfUid, name: mySeatProfile().name, text, ts: now }
        ].slice(-40);
        if (typeof playSfx === 'function') playSfx('chatSend');
        renderLobby();
        await writeRoomToStore(currentRoom);
      };
      $('#wrlChatSendBtn', shell).onclick = sendChat;
      $('#wrlChatIn', shell).onkeydown = (e) => { if (e.key === 'Enter') sendChat(); };

      // Host actions: Add Bot, Start Game, Close Room
      if (isHost) {
        const addBotBtn = $('#wrlAddBotBtn', shell);
        if (addBotBtn) {
          addBotBtn.onclick = async () => {
            if (busy) return;
            const res = Rules.addBotToRoom(currentRoom, selfUid);
            if (!res.ok) return toast(res.message || 'Cannot add bot');
            busy = true;
            currentRoom = res.room;
            if (typeof playSfx === 'function') playSfx('tap');
            renderLobby();
            await writeRoomToStore(currentRoom);
            busy = false;
          };
        }

        const startBtn = $('#wrlStartBtn', shell);
        if (startBtn) {
          startBtn.onclick = async () => {
            if (busy || startBtn.disabled) return;
            const res = Rules.startRoomMatch(currentRoom, selfUid);
            if (!res.ok) return toast(res.message || 'Players must be Ready first');
            busy = true;
            startBtn.disabled = true;
            startBtn.textContent = 'Starting…';
            currentRoom = res.room;
            await writeRoomToStore(currentRoom);
            busy = false;
            transitionLobbyToLiveGame(currentRoom);
          };
        }

        const closeBtn = $('#wrlCloseRoomBtn', shell);
        if (closeBtn) {
          closeBtn.onclick = async () => {
            if (busy) return;
            busy = true;
            closedByEvent = true;
            currentRoom.status = 'closed';
            await writeRoomToStore(currentRoom);
            const rid = currentRoom.id;
            setTimeout(() => deleteRoomFromStore(rid), 1500);
            teardownLobbySubscriptions();
            view.close();
            toast('Waiting room closed');
            busy = false;
          };
        }
      } else {
        // Guest actions: Ready toggle, Leave Room
        const readyBtn = $('#wrlReadyBtn', shell);
        if (readyBtn) {
          readyBtn.onclick = async () => {
            if (busy) return;
            const res = Rules.togglePlayerReady(currentRoom, selfUid);
            if (!res.ok) return toast('Could not update Ready status');
            busy = true;
            currentRoom = res.room;
            if (typeof playSfx === 'function') playSfx(res.ready ? 'win' : 'tap');
            renderLobby();
            await writeRoomToStore(currentRoom);
            busy = false;
          };
        }

        const leaveBtn = $('#wrlLeaveRoomBtn', shell);
        if (leaveBtn) {
          leaveBtn.onclick = async () => {
            if (busy) return;
            busy = true;
            closedByEvent = true;
            const idx = currentRoom.seats.findIndex(s => s && s.uid === selfUid);
            if (idx >= 0) {
              const res = Rules.removeSeatFromRoom(currentRoom, idx, selfUid);
              if (res.ok) await writeRoomToStore(res.room);
            }
            teardownLobbySubscriptions();
            view.close();
            toast('Left waiting room');
            busy = false;
          };
        }
      }
    };

    const handleIncomingRoomUpdate = (incomingRaw) => {
      if (closedByEvent || !incomingRaw || incomingRaw.id !== activeLobbyRoomId) return;
      const incoming = Rules.normalizeRoomDoc(incomingRaw);
      if (!incoming) return;

      const selfUid = myUid();
      const prevIds = new Set((currentRoom.seats || []).map(s => s && s.uid).filter(Boolean));
      const nextIds = new Set((incoming.seats || []).map(s => s && s.uid).filter(Boolean));

      // Sound feedback when a new friend joins
      let someoneJoined = false;
      nextIds.forEach(id => { if (!prevIds.has(id) && id !== selfUid) someoneJoined = true; });
      if (someoneJoined && typeof playSfx === 'function') playSfx('chatRecv');

      currentRoom = incoming;
      syncLocalMpRoomsCache(currentRoom, false);

      if (currentRoom.status === 'closed' || currentRoom.status === 'finished') {
        closedByEvent = true;
        teardownLobbySubscriptions();
        view.close();
        toast('Host closed the room');
        return;
      }

      if (currentRoom.status === 'playing') {
        closedByEvent = true;
        transitionLobbyToLiveGame(currentRoom);
        return;
      }

      // Check if guest was kicked by host
      if (currentRoom.hostUid !== selfUid && !nextIds.has(selfUid)) {
        closedByEvent = true;
        teardownLobbySubscriptions();
        view.close();
        toast('You were removed from the lobby');
        return;
      }

      renderLobby();
    };

    // 1) Subscribe directly to Firestore room document for instant real-time updates
    const canCloud = typeof F !== 'undefined' && F && typeof db !== 'undefined' && db && typeof online !== 'undefined' && online;
    let hasSeenRemoteDoc = false;
    let hostResyncAttempted = false;
    if (canCloud && typeof F.onSnapshot === 'function') {
      try {
        activeLobbyUnsub = F.onSnapshot(F.doc(db, 'game_rooms', currentRoom.id), (snap) => {
          if (!snap.exists()) {
            const amHost = currentRoom.hostUid === myUid();
            if (amHost && !hasSeenRemoteDoc) {
              if (!hostResyncAttempted) {
                hostResyncAttempted = true;
                writeRoomToStore(currentRoom).catch(() => {});
              }
              return;
            }
            const fromCache = Boolean(snap.metadata && snap.metadata.fromCache);
            if (!hasSeenRemoteDoc && fromCache) return;
            if (!closedByEvent && activeLobbyRoomId === currentRoom.id) {
              closedByEvent = true;
              teardownLobbySubscriptions();
              view.close();
              toast('Room is no longer active');
            }
            return;
          }
          hasSeenRemoteDoc = true;
          handleIncomingRoomUpdate({ id: snap.id, ...snap.data() });
        }, (err) => {
          console.warn('Room lobby snapshot listener error:', err);
        });
      } catch (err) {
        console.warn('Could not attach room snapshot:', err);
      }
    }

    // 2) Same-browser cross-tab BroadcastChannel + localStorage sync fallback
    const ch = getBroadcastChannel();
    if (ch) {
      ch.onmessage = (ev) => {
        const d = ev && ev.data;
        if (!d) return;
        if (d.type === 'room_update' && d.room && d.room.id === activeLobbyRoomId) {
          handleIncomingRoomUpdate(d.room);
        } else if (d.type === 'room_delete' && d.roomId === activeLobbyRoomId) {
          if (!closedByEvent) {
            closedByEvent = true;
            teardownLobbySubscriptions();
            view.close();
            toast('Host closed the room');
          }
        }
      };
    }

    activeLobbyStorageHandler = (ev) => {
      if (ev.key !== 'sg_mp_rooms' || !ev.newValue) return;
      try {
        const list = JSON.parse(ev.newValue);
        const found = Array.isArray(list) ? list.find(r => r && r.id === activeLobbyRoomId) : null;
        if (found) handleIncomingRoomUpdate(found);
      } catch {}
    };
    window.addEventListener('storage', activeLobbyStorageHandler);

    renderLobby();
    return view;
  }

  async function createAndOpenWaitingLobby(opts) {
    const Rules = getRules();
    if (!Rules) {
      if (typeof toast === 'function') toast('Room lobby module not ready');
      return null;
    }
    const o = opts || {};
    const gameId = Rules.normalizeGameId(o.gameId || 'ludo');
    const meta = Rules.getGameMeta(gameId);
    if (typeof window.guardVrBeforeGameLaunch === 'function') {
      const blocked = window.guardVrBeforeGameLaunch(o.gameName || meta.name || 'Game Lobby', () => {
        createAndOpenWaitingLobby({ ...o, bypassVrGuard: true });
      }, o);
      if (blocked) return null;
    }
    const subMode = o.subMode || meta.defaultSubMode || '1v1';
    const maxPlayers = Rules.getDefaultMaxPlayers(gameId, subMode, o.maxPlayers);
    const stake = Math.max(0, Math.min(500, Math.floor(Number(o.stake || 0))));
    const myCoins = Math.max(0, Math.floor(Number((typeof me !== 'undefined' && me?.coins) || 0)));
    if (stake > myCoins) {
      if (typeof toast === 'function') toast(`Need ${stake} 🪙 to host this stake`);
      return null;
    }

    // Wait for Firebase Auth if still booting so hostUid matches request.auth.uid
    if (typeof window.waitForFirebaseReady === 'function') {
      try { await window.waitForFirebaseReady(4500); } catch {}
    }

    const room = Rules.createWaitingRoomDoc({
      gameId,
      gameName: o.gameName || meta.name,
      subMode,
      stake,
      maxPlayers,
      roomCode: o.roomCode || Rules.generateRoomCode(gameId),
      host: mySeatProfile()
    });

    await writeRoomToStore(room);
    if (typeof playSfx === 'function') playSfx('tap');
    if (o.postToWorldChat) postLobbyInviteToWorldChat(room);
    return openWaitingRoomLobbyView(room);
  }

  async function joinAndOpenWaitingLobby(opts) {
    const Rules = getRules();
    if (!Rules) return false;
    const o = opts || {};
    if (typeof window.guardVrBeforeGameLaunch === 'function') {
      const blocked = window.guardVrBeforeGameLaunch(o.gameName || 'Multiplayer Room', () => {
        joinAndOpenWaitingLobby({ ...o, bypassVrGuard: true });
      }, o);
      if (blocked) return false;
    }
    const roomId = String(o.roomId || '').trim();
    const cleanCode = String(o.roomCode || '').trim().toUpperCase();
    if (!roomId && !cleanCode) {
      if (typeof toast === 'function') toast('Enter a valid room code');
      return false;
    }

    let loadToastTimer = setTimeout(() => {
      if (typeof toast === 'function') toast(`Joining room ${cleanCode || '…'}`);
    }, 450);

    const liveRoom = await fetchLiveGameRoom({ roomId, roomCode: cleanCode });
    clearTimeout(loadToastTimer);

    if (!liveRoom) {
      if (typeof toast === 'function') toast(`Room ${cleanCode || ''} not found or has ended.`);
      return false;
    }

    // Route Couple Chronicles rooms straight into the dedicated 2-Partner Couple Chronicles lobby
    if (liveRoom.mode === 'couple_chronicles' || String(liveRoom.code || '').toUpperCase().startsWith('CC')) {
      if (typeof window.ensureCoupleChroniclesLoaded === 'function') {
        await window.ensureCoupleChroniclesLoaded();
      }
      if (typeof window.joinCoupleStoryRoom === 'function') {
        return await window.joinCoupleStoryRoom({ roomId: liveRoom.id, roomCode: liveRoom.code });
      }
    }

    const meProf = mySeatProfile();
    const alreadySeated = (liveRoom.seats || []).some(s => s && s.uid === meProf.uid);

    if (!alreadySeated && Number(liveRoom.entryCoins || 0) > 0) {
      const myCoins = Math.max(0, Math.floor(Number((typeof me !== 'undefined' && me?.coins) || 0)));
      if (myCoins < Number(liveRoom.entryCoins)) {
        if (typeof toast === 'function') toast(`Need ${liveRoom.entryCoins} 🪙 to join this room`);
        return false;
      }
    }

    // Legacy MCQ quiz rooms (math/science/vocab/gk) still work cleanly in openMultiplayerRoom
    const isLegacyQuiz = ['math', 'science', 'vocab', 'gk'].includes(liveRoom.mode);
    if (isLegacyQuiz && typeof openMultiplayerRoom === 'function') {
      if (!alreadySeated) {
        const res = Rules.joinRoomSeat(liveRoom, meProf);
        if (!res.ok) {
          if (typeof toast === 'function') toast(res.message || 'Cannot join room');
          return false;
        }
        await writeRoomToStore(res.room);
      }
      openMultiplayerRoom(liveRoom.id);
      return true;
    }

    const res = Rules.joinRoomSeat(liveRoom, meProf);
    if (!res.ok) {
      if (typeof toast === 'function') toast(res.message || 'Room is no longer active');
      return false;
    }

    const savedRoom = await writeRoomToStore(res.room);
    if (typeof playSfx === 'function') playSfx('tap');

    // If room already started and user was already seated (rejoin), jump straight to board
    if (savedRoom.status === 'playing') {
      await transitionLobbyToLiveGame(savedRoom);
      return true;
    }

    openWaitingRoomLobbyView(savedRoom);
    return true;
  }

  function syncActiveWaitingLobbyFromRooms(roomsList) {
    if (!activeLobbyRoomId || !Array.isArray(roomsList)) return;
    const found = roomsList.find(r => r && r.id === activeLobbyRoomId);
    if (found && activeLobbyView) {
      // Keep local cache fresh; Firestore onSnapshot handles primary updates
      const Rules = getRules();
      if (Rules) {
        const norm = Rules.normalizeRoomDoc(found);
        syncLocalMpRoomsCache(norm, false);
      }
    }
  }

  window.fetchLiveGameRoom = fetchLiveGameRoom;
  window.createAndOpenWaitingLobby = createAndOpenWaitingLobby;
  window.joinAndOpenWaitingLobby = joinAndOpenWaitingLobby;
  window.openWaitingRoomLobbyView = openWaitingRoomLobbyView;
  window.syncActiveWaitingLobbyFromRooms = syncActiveWaitingLobbyFromRooms;
})();
