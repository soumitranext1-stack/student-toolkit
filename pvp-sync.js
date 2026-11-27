"use strict";
/* =====================================================================
   PVP LIVE MATCH SYNC CONTROLLER (`createLiveMatchSync`)
   · Real-time state synchronization over Firestore `game_rooms/{roomId}`
     with BroadcastChannel + localStorage mirror for zero-latency local sync
   · Monotonic revision guard (`rev`) prevents echo loops & stale overwrites
   · Presence heartbeat & offline/disconnect detection with clean UI banner
     (NEVER silently substitutes a bot on disconnect!)
   · Full teardown on destroy() — zero leaked listeners or timers
   ===================================================================== */
(function (global) {
  function canUseFirestore() {
    const hasAuth = typeof auth !== 'undefined' && auth && auth.currentUser && auth.currentUser.uid;
    return Boolean(hasAuth && typeof F !== 'undefined' && F && typeof db !== 'undefined' && db && typeof online !== 'undefined' && online);
  }

  function storageKey(roomId) {
    return 'sg_live_match_' + String(roomId || '').trim();
  }

  function createLiveMatchSync(opts) {
    const o = opts || {};
    const Rules = global.PvpSyncRules;
    const roomId = String(o.roomId || '').trim();
    const roomCode = String(o.roomCode || '').trim().toUpperCase();
    const gameId = String(o.gameId || 'game').trim();
    const myUid = String(o.myUid || (typeof uid !== 'undefined' && uid) || 'local_me').trim();
    const myName = String(o.myName || (typeof me !== 'undefined' && me?.name) || 'Player').trim();
    const oppUids = Array.isArray(o.oppUids) ? o.oppUids.filter(Boolean) : [];
    const onState = typeof o.onState === 'function' ? o.onState : () => {};
    const onConnectionChange = typeof o.onConnectionChange === 'function' ? o.onConnectionChange : () => {};
    const onLeaveRequest = typeof o.onLeaveRequest === 'function' ? o.onLeaveRequest : null;

    let destroyed = false;
    let lastRev = 0;
    let lastRoomStatus = 'playing';
    let lastPresence = {};
    let snapshotError = false;
    let hasSeenFirestoreDoc = false;
    let unsubFirestore = null;
    let bc = null;
    let storageHandler = null;
    let onlineHandler = null;
    let offlineHandler = null;
    let heartbeatIv = 0;
    let connCheckIv = 0;
    let bannerEl = null;
    let lastConnStatus = 'connected';

    const computeAndEmitConn = () => {
      if (destroyed) return;
      const isOnline = typeof navigator !== 'undefined' ? navigator.onLine !== false : true;
      const ev = Rules && typeof Rules.evaluateConnectionState === 'function'
        ? Rules.evaluateConnectionState({
            online: isOnline,
            snapshotError,
            roomStatus: lastRoomStatus,
            myUid,
            oppUids,
            presence: lastPresence,
            nowMs: Date.now(),
            staleMs: 26000
          })
        : { status: isOnline ? 'connected' : 'offline', healthy: isOnline, title: isOnline ? 'Connected' : 'Connection Lost', detail: '', showRejoin: !isOnline };

      if (bannerEl) {
        if (ev.healthy) {
          bannerEl.hidden = true;
          bannerEl.innerHTML = '';
        } else {
          bannerEl.hidden = false;
          bannerEl.setAttribute('data-conn-status', ev.status);
          bannerEl.innerHTML = `
            <div class="pvp-conn-inner">
              <div class="pvp-conn-copy">
                <b>${typeof esc === 'function' ? esc(ev.title) : ev.title}</b>
                <span>${typeof esc === 'function' ? esc(ev.detail) : ev.detail}</span>
              </div>
              <div class="pvp-conn-actions">
                ${ev.showRejoin ? `<button type="button" class="btn sm ok" data-pvp-rejoin="1">Reconnect</button>` : ''}
                ${onLeaveRequest ? `<button type="button" class="btn sm ghost" data-pvp-leave="1">Leave</button>` : ''}
              </div>
            </div>
          `;
          const rBtn = bannerEl.querySelector('[data-pvp-rejoin]');
          if (rBtn) rBtn.onclick = () => reconnect();
          const lBtn = bannerEl.querySelector('[data-pvp-leave]');
          if (lBtn && onLeaveRequest) lBtn.onclick = () => onLeaveRequest();
        }
      }

      if (ev.status !== lastConnStatus) {
        lastConnStatus = ev.status;
        onConnectionChange(ev);
      }
    };

    const handleIncomingRoomDoc = (docData, source) => {
      if (destroyed || !docData || typeof docData !== 'object') return;
      if (docData.status) lastRoomStatus = String(docData.status);
      if (docData.presence && typeof docData.presence === 'object') {
        lastPresence = { ...lastPresence, ...docData.presence };
      }
      computeAndEmitConn();

      const lm = docData.liveMatch;
      if (!lm || typeof lm !== 'object') return;
      if (lm.gameId && lm.gameId !== gameId) return;
      const rev = Number(lm.rev || 0);
      if (rev <= lastRev) return;
      lastRev = rev;

      // Ignore our own echoed writes from the same tab
      if (lm.updatedBy === myUid && source !== 'reconnect_pull') return;
      try {
        onState(lm.state, { rev, updatedBy: lm.updatedBy, updatedAt: lm.updatedAt, source });
      } catch (err) {
        console.warn('PvpSync onState error:', err);
      }
    };

    const publishLocalMirror = (payload) => {
      if (!roomId) return;
      try {
        localStorage.setItem(storageKey(roomId), JSON.stringify(payload));
      } catch {}
      try {
        if (bc) bc.postMessage({ type: 'live_match', roomId, payload });
      } catch {}
    };

    const sendHeartbeat = async (connected) => {
      if (!roomId) return;
      const entry = { ts: Date.now(), connected: connected !== false, name: myName };
      lastPresence[myUid] = entry;
      if (canUseFirestore() && typeof F.setDoc === 'function') {
        try {
          await F.setDoc(
            F.doc(db, 'game_rooms', roomId),
            { presence: { [myUid]: entry }, updatedAt: Date.now() },
            { merge: true }
          );
        } catch {}
      }
      publishLocalMirror({ status: lastRoomStatus, presence: lastPresence });
    };

    const pushState = async (stateObj) => {
      if (destroyed || !roomId) return false;
      const nextRev = lastRev + 1;
      lastRev = nextRev;
      const now = Date.now();
      const liveMatch = {
        gameId,
        rev: nextRev,
        updatedBy: myUid,
        updatedAt: now,
        state: stateObj
      };
      const entry = { ts: now, connected: true, name: myName };
      lastPresence[myUid] = entry;

      publishLocalMirror({ status: 'playing', presence: lastPresence, liveMatch });

      if (canUseFirestore() && typeof F.setDoc === 'function') {
        try {
          await F.setDoc(
            F.doc(db, 'game_rooms', roomId),
            {
              liveMatch,
              presence: { [myUid]: entry },
              updatedAt: now
            },
            { merge: true }
          );
          if (snapshotError) {
            snapshotError = false;
            computeAndEmitConn();
          }
          return true;
        } catch (err) {
          console.warn('PvpSync pushState Firestore error:', err);
          snapshotError = true;
          computeAndEmitConn();
          return false;
        }
      }
      return true;
    };

    const attachFirestoreListener = () => {
      if (destroyed || !roomId) return;
      if (typeof unsubFirestore === 'function') {
        try { unsubFirestore(); } catch {}
        unsubFirestore = null;
      }
      if (canUseFirestore() && typeof F.onSnapshot === 'function') {
        try {
          unsubFirestore = F.onSnapshot(
            F.doc(db, 'game_rooms', roomId),
            (snap) => {
              if (destroyed) return;
              snapshotError = false;
              if (!snap || !snap.exists()) {
                // Only flag room_closed if we previously saw a server-confirmed room document exist
                if (hasSeenFirestoreDoc) {
                  lastRoomStatus = 'closed';
                  computeAndEmitConn();
                }
                return;
              }
              if (!(snap.metadata && snap.metadata.hasPendingWrites)) {
                hasSeenFirestoreDoc = true;
              }
              handleIncomingRoomDoc(snap.data(), 'firestore');
            },
            (err) => {
              if (destroyed) return;
              console.warn('PvpSync snapshot error:', err);
              snapshotError = true;
              computeAndEmitConn();
            }
          );
        } catch (err) {
          console.warn('PvpSync attach error:', err);
          snapshotError = true;
          computeAndEmitConn();
        }
      }
    };

    const reconnect = async () => {
      if (destroyed || !roomId) return false;
      snapshotError = false;
      attachFirestoreListener();
      await sendHeartbeat(true);
      if (canUseFirestore() && typeof F.getDoc === 'function') {
        try {
          const snap = await F.getDoc(F.doc(db, 'game_rooms', roomId));
          if (snap && snap.exists()) {
            const data = snap.data();
            if (data && data.liveMatch && Number(data.liveMatch.rev || 0) > lastRev) {
              handleIncomingRoomDoc(data, 'reconnect_pull');
            }
            if (data && data.presence) lastPresence = { ...lastPresence, ...data.presence };
            if (data && data.status) lastRoomStatus = data.status;
          }
        } catch {
          snapshotError = true;
        }
      } else {
        try {
          const raw = localStorage.getItem(storageKey(roomId));
          if (raw) handleIncomingRoomDoc(JSON.parse(raw), 'reconnect_pull');
        } catch {}
      }
      computeAndEmitConn();
      if (typeof toast === 'function') toast('Reconnected to live match!');
      return !snapshotError;
    };

    const mountConnectionBanner = (containerEl) => {
      if (!containerEl || destroyed) return null;
      const existing = containerEl.querySelector('[data-testid="pvp-connection-banner"]');
      if (existing) {
        bannerEl = existing;
        computeAndEmitConn();
        return bannerEl;
      }
      const el = document.createElement('div');
      el.className = 'pvp-conn-banner';
      el.setAttribute('data-testid', 'pvp-connection-banner');
      el.setAttribute('role', 'status');
      el.setAttribute('aria-live', 'polite');
      el.hidden = true;
      containerEl.prepend(el);
      bannerEl = el;
      computeAndEmitConn();
      return el;
    };

    // Start listeners immediately if roomId is provided
    if (roomId) {
      if (typeof BroadcastChannel !== 'undefined') {
        try {
          bc = new BroadcastChannel('sg_game_rooms_sync');
          bc.onmessage = (ev) => {
            if (destroyed || !ev?.data) return;
            if (ev.data.type === 'live_match' && ev.data.roomId === roomId && ev.data.payload) {
              handleIncomingRoomDoc(ev.data.payload, 'broadcast');
            }
          };
        } catch {}
      }

      storageHandler = (ev) => {
        if (destroyed || ev.key !== storageKey(roomId) || !ev.newValue) return;
        try { handleIncomingRoomDoc(JSON.parse(ev.newValue), 'storage'); } catch {}
      };
      window.addEventListener('storage', storageHandler);

      onlineHandler = () => { reconnect(); };
      offlineHandler = () => { computeAndEmitConn(); };
      window.addEventListener('online', onlineHandler);
      window.addEventListener('offline', offlineHandler);

      attachFirestoreListener();
      sendHeartbeat(true);
      heartbeatIv = setInterval(() => { if (!destroyed) sendHeartbeat(true); }, 6500);
      connCheckIv = setInterval(() => { if (!destroyed) computeAndEmitConn(); }, 5000);
    }

    const destroy = () => {
      if (destroyed) return;
      destroyed = true;
      clearInterval(heartbeatIv);
      clearInterval(connCheckIv);
      if (typeof unsubFirestore === 'function') {
        try { unsubFirestore(); } catch {}
      }
      unsubFirestore = null;
      if (bc) {
        try { bc.close(); } catch {}
        bc = null;
      }
      if (storageHandler) {
        try { window.removeEventListener('storage', storageHandler); } catch {}
        storageHandler = null;
      }
      if (onlineHandler) {
        try { window.removeEventListener('online', onlineHandler); } catch {}
        onlineHandler = null;
      }
      if (offlineHandler) {
        try { window.removeEventListener('offline', offlineHandler); } catch {}
        offlineHandler = null;
      }
      // Best-effort presence update so opponent sees explicit disconnect banner (never a bot!)
      if (roomId && canUseFirestore() && typeof F.setDoc === 'function') {
        try {
          F.setDoc(
            F.doc(db, 'game_rooms', roomId),
            { presence: { [myUid]: { ts: Date.now(), connected: false, name: myName } }, updatedAt: Date.now() },
            { merge: true }
          );
        } catch {}
      }
    };

    return {
      roomId,
      roomCode,
      pushState,
      reconnect,
      mountConnectionBanner,
      getLastRev: () => lastRev,
      destroy
    };
  }

  global.createLiveMatchSync = createLiveMatchSync;
})(typeof window !== 'undefined' ? window : globalThis);
