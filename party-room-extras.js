"use strict";
/* =====================================================================
   PARTY ROOM EXTRAS — UI CONTROLLERS & MODALS (v44)
   · Room Mode & Room Function Drawer (with Mode Switch Confirmation)
   · Dedicated In-Room Audio Stage Bar (+ Add song, Queue, Volume)
   · Seat Tap Action Sheet (Sit, Close Seat, Mute, Invite, Cancel)
   · Room Info / Members View (Cover, ID, Tags, Owner/Admin, Online/Members/Fans/Region)
   · Full Room Settings Screen (Title, Cover, Announcement, Mode, Tag, Bg,
     Partner Seat, HQ Mode, Bans, Password, Blocklist, Operation Record, Room ID)
   · Daily Task Treasure Boxes (Timers, VIP Box, Quick Tasks, Coin Rewards)
   · Create PvP / PK Mode + Live Room PK Stage Banner + Rules
   · "Who's the Winner?" Room Mini-Game + Rules
   ===================================================================== */
(function (global) {
  function PRE() {
    return global.PartyRoomExtrasRules || null;
  }

  function fmtMmSs(totalSec) {
    const s = Math.max(0, Math.floor(Number(totalSec || 0)));
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
  }

  function fmtRelTime(ts) {
    const d = Math.max(0, Math.floor((Date.now() - Number(ts || Date.now())) / 1000));
    if (d < 60) return 'Just now';
    if (d < 3600) return `${Math.floor(d / 60)}m ago`;
    return `${Math.floor(d / 3600)}h ago`;
  }

  /* ===== Daily Task Local State & Stay Timer ===== */
  const DAILY_LS_KEY = 'sg_party_daily_tasks_v1';
  let dailyStayTicker = 0;

  function loadDailyTaskState() {
    const rules = PRE();
    const raw = typeof ls !== 'undefined' ? ls.get(DAILY_LS_KEY, null) : null;
    if (rules && typeof rules.normalizeDailyState === 'function') {
      return rules.normalizeDailyState(raw, Date.now());
    }
    return raw || { dayKey: '', staySec: 0, claimedBoxes: [], completedTasks: [], claimedTasks: [] };
  }

  function saveDailyTaskState(st) {
    if (typeof ls !== 'undefined') ls.set(DAILY_LS_KEY, st);
  }

  function trackRoomDailyEvent(taskId) {
    const rules = PRE();
    if (!rules || !taskId) return;
    const next = rules.markDailyQuickTaskDone(loadDailyTaskState(), taskId, Date.now());
    saveDailyTaskState(next);
    updateDailyBadgeDom();
  }

  function startRoomDailyStayTimer() {
    if (dailyStayTicker) return;
    dailyStayTicker = setInterval(() => {
      if (typeof getCurrentVrRoomId === 'function' && !getCurrentVrRoomId()) return;
      const st = loadDailyTaskState();
      st.staySec = Number(st.staySec || 0) + 1;
      saveDailyTaskState(st);
      updateDailyBadgeDom();

      // Tick live PK countdown if active in current room
      if (typeof partyRooms !== 'undefined' && typeof activePartyRoomId !== 'undefined' && activePartyRoomId) {
        const rm = partyRooms.find(r => r && r.id === activePartyRoomId);
        const rules = PRE();
        if (rm && rm.pkSession && rm.pkSession.status === 'active' && rules) {
          const t = rules.evaluatePkTimerState(rm.pkSession, Date.now());
          if (t.ended) {
            handleRoomPkAction(rm, 'pk-end');
          } else {
            const clk = document.querySelector('[data-testid="vr-pk-clock"]');
            if (clk) clk.textContent = fmtMmSs(t.remainingSec);
          }
        }
      }
    }, 1000);
  }

  function getRoomDailyEval(rm) {
    const rules = PRE();
    if (!rules) return null;
    const st = loadDailyTaskState();
    const isVip = Boolean(
      (rm && rm.isOwnedRoom) ||
      (rm && Array.isArray(rm.guards) && rm.guards.some(g => g && g.uid === uid)) ||
      (typeof me !== 'undefined' && me && me.ownedRoom && me.ownedRoom.unlocked)
    );
    return rules.evaluateDailyTasks(st, { nowMs: Date.now(), roomStaySec: st.staySec, isVip });
  }

  function updateDailyBadgeDom() {
    const rm = typeof partyRooms !== 'undefined' && typeof activePartyRoomId !== 'undefined'
      ? partyRooms.find(r => r && r.id === activePartyRoomId)
      : null;
    if (!rm) return;
    const ev = getRoomDailyEval(rm);
    const cnt = ev ? ev.claimableCount : 0;
    document.querySelectorAll('[data-daily-badge]').forEach(el => {
      el.textContent = cnt > 0 ? String(cnt) : '';
      el.hidden = cnt <= 0;
    });
  }

  /* ===== Helper: Record Operation Log + Persist ===== */
  function logRoomOperation(rm, action, detail) {
    const rules = PRE();
    if (!rm || !rules) return;
    rm.operationLog = rules.appendOperationRecord(rm, uid, (typeof me !== 'undefined' && me?.name) || 'Owner', action, detail, Date.now());
  }

  /* ===== 1. Dedicated In-Room Audio Stage Bar ===== */
  function renderRoomAudioStageBar(rm) {
    if (!rm) return '';
    const isFullVideoActive = rm.mode === 'video' && rm.mediaPlayMode === 'video' && Boolean(rm.youtubeId || rm.videoSync?.videoId || rm.videoSync?.videoUrl || rm.videoSync?.searchQuery);
    if (isFullVideoActive) return '';

    const queue = typeof getRoomPlaylist === 'function' ? getRoomPlaylist(rm) : (Array.isArray(rm.queue) ? rm.queue : []);
    const hasAudio = Boolean(rm.musicUrl || rm.musicTitle || queue.length);
    const playing = Boolean(rm.musicPlaying && (rm.musicUrl || queue.length));
    const vol = Number.isFinite(Number(rm.volume)) ? Number(rm.volume) : 75;

    if (!hasAudio) {
      return `
        <div class="pfs-audio-bar empty" data-testid="vr-audio-stage-bar">
          <div class="pfs-audio-left">
            <span class="pfs-audio-disc" aria-hidden="true">♪</span>
            <div class="pfs-audio-meta">
              <b>Room Audio &amp; Music</b>
              <small>Search Hindi, Bangla &amp; English songs or paste an audio link</small>
            </div>
          </div>
          <div class="pfs-audio-acts">
            <button type="button" class="btn sm ok" data-pfs-act="open-music" data-testid="vr-add-song-btn">+ Add song</button>
          </div>
        </div>
      `;
    }

    const title = rm.musicTitle || (queue[0] && queue[0].title) || 'Room Audio Track';
    const artist = rm.musicArtist || (queue[0] && (queue[0].artist || queue[0].channel)) || 'Room Queue';
    return `
      <div class="pfs-audio-bar active ${playing ? 'playing' : ''}" data-testid="vr-audio-stage-bar">
        <div class="pfs-audio-left">
          <span class="pfs-audio-disc ${playing ? 'spin' : ''}" aria-hidden="true">♪</span>
          <div class="pfs-audio-meta">
            <b data-testid="vr-audio-title">${esc(title)}</b>
            <small>${esc(artist)} · ${playing ? 'Playing' : 'Paused'}${queue.length ? ` · Queue ${queue.length}` : ''} · Vol ${vol}%</small>
          </div>
        </div>
        <div class="pfs-audio-acts">
          <button type="button" class="pfs-aud-btn ${playing ? 'gold' : 'ok'}" data-pfs-act="audio-toggle" data-testid="vr-audio-toggle-btn" aria-label="${playing ? 'Pause music' : 'Play music'}">${playing ? '⏸' : '▶'}</button>
          <button type="button" class="pfs-aud-btn" data-pfs-act="audio-next" data-testid="vr-audio-next-btn" aria-label="Next song" title="Next track">⏭</button>
          <button type="button" class="pfs-aud-btn" data-pfs-act="open-volume" data-testid="vr-audio-vol-btn" aria-label="Room volume" title="Volume">🎚️</button>
          <button type="button" class="pfs-aud-btn add" data-pfs-act="open-music" data-testid="vr-add-song-btn" aria-label="Add song">+ Song</button>
        </div>
      </div>
    `;
  }

  /* ===== 2. Room Mode & Room Function Drawer + Mode Switch Confirmation ===== */
  function openModeSwitchConfirmModal(rm, targetModeId, onConfirmed) {
    if (!rm || !targetModeId) return;
    if (!assertRoomPerm(rm, 'change_mode')) return;
    const md = (typeof PARTY_MODES_META !== 'undefined' && PARTY_MODES_META[targetModeId]) || { id: targetModeId, name: targetModeId, desc: '' };
    if (rm.mode === targetModeId) {
      toast(`Already in ${md.name} mode`);
      return;
    }

    const cm = modal('Switch Room Mode?', `
      <div class="rmc-shell" data-testid="vr-mode-confirm-modal">
        <p class="rmc-desc">Switch this room from <b>${esc(PARTY_MODES_META[rm.mode]?.name || rm.mode)}</b> to <b>${esc(md.name)}</b>?</p>
        <small class="rmc-sub">${esc(md.desc)} · Active guest mics will stand up while the new stage loads.</small>
        <div class="rmc-acts">
          <button type="button" class="btn ghost full" id="rmcCancel" data-testid="vr-mode-confirm-cancel">Cancel</button>
          <button type="button" class="btn gold full" id="rmcConfirm" data-testid="vr-mode-confirm-ok">Confirm</button>
        </div>
      </div>
    `, 'rmc-modal');

    $('#rmcCancel', cm).onclick = () => cm.close();
    $('#rmcConfirm', cm).onclick = () => {
      if (!assertRoomPerm(rm, 'change_mode')) return;
      const prevMode = rm.mode || 'normal';
      const prevName = PARTY_MODES_META[prevMode]?.name || prevMode;
      const actor = (typeof me !== 'undefined' && me && me.name) || 'Admin';
      const modeRules = window.PartyModeStagesRules || null;
      const plan = modeRules ? modeRules.buildModeSwitchCleanupPlan(prevMode, targetModeId, actor) : null;

      if (window.PartyModeStages && typeof window.PartyModeStages.onModeWillChange === 'function') {
        window.PartyModeStages.onModeWillChange(prevMode, targetModeId);
      }

      if (plan && plan.standUpGuestMics && modeRules && typeof modeRules.applyGuestMicStandUp === 'function') {
        const ownerId = (typeof getEffectiveOwnerUid === 'function' ? getEffectiveOwnerUid(rm) : (rm.activeHostUid || rm.hostUid)) || uid;
        rm.seats = modeRules.applyGuestMicStandUp(rm.seats, ownerId);
        if (rm.members && typeof rm.members === 'object') {
          Object.keys(rm.members).forEach(mUid => {
            if (rm.members[mUid] && mUid !== ownerId) {
              rm.members[mUid].seatIdx = null;
            }
          });
        }
      }

      rm.mode = targetModeId;
      rm.mediaPlayMode = targetModeId === 'video' ? 'video' : 'audio';
      const now = Date.now();
      const logLine = (plan && plan.systemLog) || `🔄 ${actor} changed the mode from ${prevName} to ${md.name}`;
      rm.chat = [...(rm.chat || []), {
        id: 'mode_' + now.toString(36),
        type: 'sys',
        text: logLine,
        ts: now
      }].slice(-45);
      logRoomOperation(rm, 'Changed Room Mode', `${prevName} → ${md.name}`);
      if (rm.isOwnedRoom && typeof syncOwnedRoomProfileSnapshot === 'function') syncOwnedRoomProfileSnapshot(rm);
      persistPartyRoom(rm, { fullReplace: true });
      toast(`Room mode switched to ${md.name}`);
      cm.close();
      if (typeof onConfirmed === 'function') onConfirmed();
    };
  }

  function openRoomVolumeModal(rm) {
    if (!rm) return;
    const initVol = Number.isFinite(Number(rm.volume)) ? Number(rm.volume) : 75;
    const vm = modal('🎚️ Room Audio & Video Volume', `
      <div class="rvol-shell" data-testid="vr-volume-modal">
        <div class="rvol-top">
          <span>Master Output</span>
          <b id="rvolVal" data-testid="vr-volume-value">${initVol}%</b>
        </div>
        <input type="range" id="rvolRange" min="0" max="100" value="${initVol}" aria-label="Room volume percentage" data-testid="vr-volume-slider">
        <div class="rvol-presets">
          <button type="button" class="btn sm ghost" data-rvol="0">Mute</button>
          <button type="button" class="btn sm ghost" data-rvol="35">35%</button>
          <button type="button" class="btn sm ghost" data-rvol="70">70%</button>
          <button type="button" class="btn sm ok" data-rvol="100">100%</button>
        </div>
      </div>
    `);

    function applyVol(v) {
      const clamped = Math.max(0, Math.min(100, Math.round(Number(v))));
      rm.volume = clamped;
      const lbl = $('#rvolVal', vm);
      const rng = $('#rvolRange', vm);
      if (lbl) lbl.textContent = `${clamped}%`;
      if (rng) rng.value = String(clamped);
      if (typeof PartyAudioPlayer !== 'undefined' && typeof PartyAudioPlayer.setVolume === 'function') {
        PartyAudioPlayer.setVolume(clamped / 100);
      }
      if (typeof PartyVideoSync !== 'undefined' && typeof PartyVideoSync.setVolume === 'function') {
        PartyVideoSync.setVolume(clamped);
      }
      persistPartyRoom(rm);
    }

    const rng = $('#rvolRange', vm);
    if (rng) rng.oninput = () => applyVol(rng.value);
    $$('[data-rvol]', vm).forEach(b => {
      b.onclick = () => applyVol(b.dataset.rvol);
    });
  }

  function openReportRoomModal(rm) {
    if (!rm) return;
    const reasons = ['Spam or scam links', 'Abusive voice or chat', 'Inappropriate video/audio', 'Impersonation / Fake room'];
    const rep = modal('🚩 Report Room', `
      <div class="list" style="gap:8px" data-testid="vr-report-modal">
        <small style="color:var(--mu)">Select a reason to report <b>${esc(rm.title)}</b> (ID ${esc(rm.fixedId || rm.shortId)}):</small>
        ${reasons.map(r => `<button type="button" class="btn ghost full" data-rep-reason="${esc(r)}">${esc(r)}</button>`).join('')}
      </div>
    `);
    $$('[data-rep-reason]', rep).forEach(btn => {
      btn.onclick = () => {
        toast(`🚩 Report submitted: ${btn.dataset.repReason}`);
        rep.close();
      };
    });
  }

  function openPartyRoomMenuDrawer(rm) {
    if (!rm) return;
    const live = partyRooms.find(r => r && r.id === rm.id) || rm;
    const modeIcons = { normal: '🎙️', acquaint: '💞', auction: '🔨', video: '🎬', games: '🎮' };
    const m = modal('Room Mode & Function', `
      <div class="rmd-shell" data-testid="vr-room-menu-drawer">
        <div class="rmd-sec">
          <div class="rmd-sec-title">Room Mode</div>
          <div class="rmd-mode-grid">
            ${Object.values(PARTY_MODES_META).map(md => `
              <button type="button" class="rmd-mode-tile ${live.mode === md.id ? 'active' : ''}" data-rmd-mode="${esc(md.id)}" data-testid="rmd-mode-${esc(md.id)}">
                <span class="rmd-tile-ico" aria-hidden="true">${modeIcons[md.id] || '✨'}</span>
                <span class="rmd-tile-lbl">${esc(md.name)}</span>
              </button>
            `).join('')}
          </div>
        </div>

        <div class="rmd-sec">
          <div class="rmd-sec-title">Room Tag</div>
          <div class="rmd-tag-row">
            ${PARTY_TAGS.map(t => `
              <button type="button" class="rmd-tag-btn ${live.tag === t ? 'active' : ''}" data-rmd-tag="${esc(t)}" data-testid="rmd-tag-${esc(t.toLowerCase())}">${esc(t)}</button>
            `).join('')}
          </div>
        </div>

        <div class="rmd-sec">
          <div class="rmd-sec-title">Room Function</div>
          <div class="rmd-fn-grid">
            <button type="button" class="rmd-fn-item" data-rmd-fn="invite" data-testid="rmd-fn-invite"><span>👥</span><em>Invite Friends</em></button>
            <button type="button" class="rmd-fn-item ${live.giftSoundsOn !== false ? 'on' : ''}" data-rmd-fn="gift-sounds" data-testid="rmd-fn-gift-sounds"><span>${live.giftSoundsOn !== false ? '🔔' : '🔕'}</span><em>Gift Sounds</em></button>
            <button type="button" class="rmd-fn-item" data-rmd-fn="report" data-testid="rmd-fn-report"><span>🚩</span><em>Report Room</em></button>
            <button type="button" class="rmd-fn-item danger" data-rmd-fn="exit" data-testid="rmd-fn-exit"><span>🚪</span><em>Exit</em></button>
            <button type="button" class="rmd-fn-item ${live.rallyReceiveOn !== false ? 'on' : ''}" data-rmd-fn="rally" data-testid="rmd-fn-rally"><span>📣</span><em>Rally Receive</em></button>
            <button type="button" class="rmd-fn-item" data-rmd-fn="settings" data-testid="rmd-fn-settings"><span>⚙️</span><em>Settings</em></button>
            <button type="button" class="rmd-fn-item" data-rmd-fn="volume" data-testid="rmd-fn-volume"><span>🎚️</span><em>Volume</em></button>
            <button type="button" class="rmd-fn-item" data-rmd-fn="daily" data-testid="rmd-fn-daily"><span>🧰</span><em>Daily Task</em></button>
            <button type="button" class="rmd-fn-item" data-rmd-fn="pk" data-testid="rmd-fn-pk"><span>⚔️</span><em>Create PvP</em></button>
            <button type="button" class="rmd-fn-item" data-rmd-fn="wtw" data-testid="rmd-fn-wtw"><span>🏆</span><em>Who's Winner</em></button>
            <button type="button" class="rmd-fn-item" data-rmd-fn="music" data-testid="rmd-fn-music"><span>♪</span><em>Add Song</em></button>
            <button type="button" class="rmd-fn-item" data-rmd-fn="perks" data-testid="rmd-fn-perks"><span>👑</span><em>Room Perks</em></button>
          </div>
        </div>
      </div>
    `, 'rmd-sheet-modal');

    m.addEventListener('click', (e) => {
      const cur = partyRooms.find(r => r && r.id === rm.id) || rm;
      const modeBtn = e.target.closest('[data-rmd-mode]');
      if (modeBtn) {
        const targetMode = modeBtn.dataset.rmdMode;
        if (!assertRoomPerm(cur, 'change_mode')) return;
        if (cur.mode === targetMode) {
          toast(`Room is already in ${PARTY_MODES_META[targetMode]?.name || targetMode} mode`);
          return;
        }
        openModeSwitchConfirmModal(cur, targetMode, () => m.close());
        return;
      }

      const tagBtn = e.target.closest('[data-rmd-tag]');
      if (tagBtn) {
        if (!assertRoomPerm(cur, 'edit_settings')) return;
        cur.tag = tagBtn.dataset.rmdTag;
        logRoomOperation(cur, 'Changed Room Tag', cur.tag);
        if (cur.isOwnedRoom && typeof syncOwnedRoomProfileSnapshot === 'function') syncOwnedRoomProfileSnapshot(cur);
        persistPartyRoom(cur);
        $$('[data-rmd-tag]', m).forEach(b => b.classList.toggle('active', b.dataset.rmdTag === cur.tag));
        toast(`Room tag updated to ${cur.tag}`);
        return;
      }

      const fnBtn = e.target.closest('[data-rmd-fn]');
      if (!fnBtn) return;
      const fn = fnBtn.dataset.rmdFn;
      if (fn === 'invite') {
        m.close();
        if (typeof openPartyInviteModal === 'function') openPartyInviteModal(cur);
      } else if (fn === 'gift-sounds') {
        cur.giftSoundsOn = cur.giftSoundsOn === false;
        fnBtn.classList.toggle('on', cur.giftSoundsOn !== false);
        fnBtn.querySelector('span').textContent = cur.giftSoundsOn !== false ? '🔔' : '🔕';
        persistPartyRoom(cur);
        toast(cur.giftSoundsOn ? '🔔 Gift Sounds ON' : '🔕 Gift Sounds OFF');
      } else if (fn === 'report') {
        m.close();
        openReportRoomModal(cur);
      } else if (fn === 'exit') {
        m.close();
        if (typeof closePartyRoom === 'function') closePartyRoom();
      } else if (fn === 'rally') {
        cur.rallyReceiveOn = cur.rallyReceiveOn === false;
        fnBtn.classList.toggle('on', cur.rallyReceiveOn !== false);
        persistPartyRoom(cur);
        toast(cur.rallyReceiveOn ? '📣 Rally Receive enabled' : 'Rally Receive muted');
      } else if (fn === 'settings') {
        m.close();
        openPartyFullSettingsModal(cur);
      } else if (fn === 'volume') {
        m.close();
        openRoomVolumeModal(cur);
      } else if (fn === 'daily') {
        m.close();
        openPartyDailyTasksModal(cur);
      } else if (fn === 'pk') {
        m.close();
        openPartyCreatePkModal(cur);
      } else if (fn === 'wtw') {
        m.close();
        openPartyWhosWinnerModal(cur);
      } else if (fn === 'music') {
        m.close();
        if (typeof openPartyMusicModal === 'function') openPartyMusicModal(cur);
      } else if (fn === 'perks') {
        m.close();
        if (typeof openPartyAdvancedPanel === 'function') openPartyAdvancedPanel(cur, 'perks');
      }
    });
  }

  /* ===== 3. Seat Tap Action Sheet (Sit, Close Seat, Mute, Invite, Cancel) ===== */
  function openSeatTapActionSheet(rm, seatIdx) {
    if (!rm) return;
    const rules = PRE();
    const prr = typeof PRR === 'function' ? PRR() : null;
    const idx = Number(seatIdx);
    const plan = rules && typeof rules.getSeatTapActions === 'function'
      ? rules.getSeatTapActions(rm, uid, idx)
      : { seatIdx: idx, occupied: Boolean(rm.seats && rm.seats[String(idx)]), isLocked: false, occupant: rm.seats && rm.seats[String(idx)], actions: [] };

    const s = plan.occupant;
    const seatLabel = idx === 0
      ? 'Owner Stage · Mic #1'
      : (idx === 1 && rm.partnerSeat ? '💞 Partner Seat · Mic #2' : (idx < 4 ? `Seat ${idx} · Mic #${idx + 1}` : `Seat ${idx} · Listener`));

    const m = modal(s ? esc(s.name) : `Seat ${idx}`, `
      <div class="sas-shell" data-testid="vr-seat-action-sheet" data-seat-target="${idx}">
        <div class="sas-head">
          ${s ? av(s, 44) : `<div class="sas-empty-ico">${plan.isLocked ? '🔒' : '💺'}</div>`}
          <div class="sas-meta">
            <b>${s ? esc(s.name) : (plan.isLocked ? `Seat ${idx} (Closed)` : `Seat ${idx} (Open)`)}</b>
            <small>${esc(seatLabel)}</small>
          </div>
        </div>
        <div class="sas-actions">
          ${plan.actions.map(act => {
            const cls = act.id === 'cancel' ? 'ghost' : (act.id === 'kick' || act.id === 'leave_seat' ? 'red' : (act.id === 'sit' || act.id === 'gift' ? 'ok' : 'ghost'));
            return `<button type="button" class="btn ${cls} full sas-btn ${act.allowed ? '' : 'is-locked'}" data-sas-act="${esc(act.id)}" data-testid="sas-act-${esc(act.id)}">
              <span>${act.icon} ${esc(act.label)}</span>
              ${!act.allowed ? '<small class="sas-lock-tag">🔒</small>' : ''}
            </button>`;
          }).join('')}
        </div>
      </div>
    `, 'sas-sheet-modal');

    m.addEventListener('click', async (e) => {
      const btn = e.target.closest('[data-sas-act]');
      if (!btn) return;
      const actId = btn.dataset.sasAct;
      const actDef = plan.actions.find(a => a.id === actId);
      if (actId === 'cancel') {
        m.close();
        return;
      }
      if (actDef && !actDef.allowed) {
        toast(`🔒 ${actDef.reason || 'Permission required'}`);
        return;
      }

      const cur = partyRooms.find(r => r && r.id === rm.id) || rm;
      if (actId === 'sit') {
        // If admin sits on a locked seat, auto-unlock it cleanly
        if (Array.isArray(cur.lockedSeats) && cur.lockedSeats.includes(idx) && canModerateRoom(cur)) {
          cur.lockedSeats = cur.lockedSeats.filter(n => n !== idx);
        }
        partyTakeSeat(cur, idx);
        m.close();
      } else if (actId === 'leave_seat') {
        partyLeaveSeat(cur);
        m.close();
      } else if (actId === 'toggle_lock') {
        if (!assertRoomPerm(cur, 'lock_seat')) return;
        const set = new Set(Array.isArray(cur.lockedSeats) ? cur.lockedSeats : []);
        const willLock = !set.has(idx);
        if (willLock) {
          set.add(idx);
          // Clear occupant if closing seat
          if (cur.seats && cur.seats[String(idx)]) delete cur.seats[String(idx)];
        } else {
          set.delete(idx);
        }
        cur.lockedSeats = [...set].sort((a, b) => a - b);
        logRoomOperation(cur, willLock ? 'Closed Seat' : 'Opened Seat', `Seat ${idx}`);
        if (cur.isOwnedRoom && typeof syncOwnedRoomProfileSnapshot === 'function') syncOwnedRoomProfileSnapshot(cur);
        persistPartyRoom(cur, { fullReplace: true });
        toast(willLock ? `🔒 Seat ${idx} closed` : `🔓 Seat ${idx} opened`);
        m.close();
      } else if (actId === 'toggle_mute') {
        const occ = cur.seats && cur.seats[String(idx)];
        if (!occ) { m.close(); return; }
        if (occ.uid !== uid && !assertRoomPerm(cur, 'mute_member')) return;
        occ.muted = !occ.muted;
        occ.speaking = !occ.muted && idx < 4;
        if (occ.uid === uid && typeof PartyWebRtcMesh !== 'undefined') {
          if (!occ.muted) await PartyWebRtcMesh.enableMic(true);
          else PartyWebRtcMesh.setMicMuted(true);
        }
        logRoomOperation(cur, occ.muted ? 'Muted Seat' : 'Unmuted Seat', `${occ.name} (Seat ${idx})`);
        persistPartyRoom(cur);
        toast(occ.muted ? `🔇 ${occ.name} muted` : `🎙️ ${occ.name} unmuted`);
        m.close();
      } else if (actId === 'invite') {
        m.close();
        if (typeof openPartyInviteModal === 'function') openPartyInviteModal(cur);
      } else if (actId === 'gift' && s) {
        m.close();
        if (typeof openGiftSendModal === 'function') openGiftSendModal(s.uid, { targetName: s.name, inPartyRoom: cur.id });
      } else if (actId === 'toggle_admin' && s) {
        if (!assertRoomPerm(cur, 'manage_admins')) return;
        const isAdm = prr && prr.isRoomAdminOnly(cur, s.uid);
        const res = prr ? prr.setRoomAdmin(cur, uid, s.uid, !isAdm) : { ok: false, error: 'Unable to update admin' };
        if (!res.ok) return toast(res.error || 'Unable to update admin');
        cur.admins = res.admins;
        logRoomOperation(cur, isAdm ? 'Removed Admin' : 'Appointed Admin', s.name);
        if (cur.isOwnedRoom && typeof syncOwnedRoomProfileSnapshot === 'function') syncOwnedRoomProfileSnapshot(cur);
        persistPartyRoom(cur);
        toast(isAdm ? `${s.name} admin removed` : `🛡️ ${s.name} is now Room Admin`);
        m.close();
      } else if (actId === 'kick' && s) {
        if (!assertRoomPerm(cur, 'kick_member')) return;
        const res = rules
          ? rules.toggleBlocklistUser(cur, uid, me.name || 'Owner', { uid: s.uid, name: s.name }, true, Date.now())
          : null;
        delete cur.seats[String(idx)];
        if (cur.members && cur.members[s.uid]) delete cur.members[s.uid];
        if (res && res.ok) {
          cur.blocklist = res.blocklist;
          cur.kickedUids = res.kickedUids;
          cur.operationLog = res.operationLog;
        }
        cur.chat = [...(cur.chat || []), { id: 'k_' + Date.now().toString(36), type: 'sys', text: `${s.name} was removed by ${me.name}`, ts: Date.now() }].slice(-45);
        persistPartyRoom(cur, { fullReplace: true });
        toast(`${s.name} removed & added to blocklist`);
        m.close();
      }
    });
  }

  /* ===== 4. Room Info / Members View ===== */
  function openPartyRoomInfoModal(rm) {
    if (!rm) return;
    const prr = typeof PRR === 'function' ? PRR() : null;
    const rules = PRE();
    const live = partyRooms.find(r => r && r.id === rm.id) || rm;
    const settings = rules ? rules.normalizeRoomSettings(live) : { region: 'India' };
    const cov = (typeof PARTY_COVERS !== 'undefined' && PARTY_COVERS[live.cover]) || { name: 'Room Cover', bg: 'linear-gradient(135deg,#0ea5e9,#6366f1)', glyph: '✦' };
    const activeMembers = prr ? prr.getOrderedActiveMembers(live, Date.now(), prr.DEFAULT_STALE_MS) : Object.values(live.members || {});
    const admins = prr ? prr.getRoomAdmins(live) : (live.admins || []);
    const followers = Array.isArray(live.followers) ? live.followers : [];
    const isFollowing = followers.some(f => f && f.uid === uid);
    const lv = prr && typeof prr.computeRoomLevel === 'function' ? prr.computeRoomLevel(live.roomXp) : { level: 1, tierName: 'Starter Stage' };

    const m = modal('Room Info', `
      <div class="ri-shell" data-testid="vr-room-info-modal">
        <div class="ri-hero">
          <div class="ri-cover" style="background:${cov.bg}" aria-hidden="true">${cov.glyph}</div>
          <div class="ri-hero-meta">
            <b class="ri-title" data-testid="ri-title">${live.isOwnedRoom ? '👑 ' : ''}${esc(live.title)}</b>
            <div class="ri-id-line">
              <span>ID ${esc(live.fixedId || live.shortId)}</span>
              <button type="button" class="ri-copy-btn" id="riCopyId" aria-label="Copy Room ID">Copy</button>
            </div>
            <div class="ri-meta-line">
              <span>${esc(live.tag || 'Friends')}</span>
              <span aria-hidden="true">·</span>
              <span>${live.isOwnedRoom ? 'Advanced Room' : 'Normal Room'}</span>
              <span aria-hidden="true">·</span>
              <span>Lv.${lv.level}</span>
            </div>
          </div>
        </div>

        <div class="ri-stats-grid">
          <div class="ri-stat"><b data-testid="ri-online-cnt">${Math.max(1, activeMembers.length)}</b><small>Online</small></div>
          <div class="ri-stat"><b>${Math.max(activeMembers.length, Object.keys(live.members || {}).length)}</b><small>Members</small></div>
          <div class="ri-stat"><b id="riFansCnt">${followers.length}</b><small>Fans</small></div>
          <div class="ri-stat"><b>${esc(settings.region)}</b><small>Region</small></div>
        </div>

        <div class="ri-announce">
          <small class="ri-sec-lbl">Announcement</small>
          <p>${esc(live.announcement || 'Welcome to our Voice Party Room!')}</p>
        </div>

        <div class="ri-members-sec">
          <div class="ri-sec-hdr">
            <small class="ri-sec-lbl">Owner &amp; Room Members</small>
            <small>${admins.length}/3 Admins</small>
          </div>
          <div class="ri-member-list">
            ${activeMembers.map(mb => {
              const isOwn = isSingleOwner(live, mb.uid);
              const isAdm = !isOwn && admins.includes(mb.uid);
              return `<div class="ri-member-row">
                ${av(mb, 34)}
                <div class="ri-m-info">
                  <b>${esc(mb.name)}</b>
                  <small>${mb.seatIdx != null ? `Seat ${mb.seatIdx}` : 'Listener'}</small>
                </div>
                ${isOwn ? '<span class="pfs-owner-tag">OWNER</span>' : (isAdm ? '<span class="pfs-role-chip admin">ADMIN</span>' : '<span class="ri-m-role">Member</span>')}
              </div>`;
            }).join('') || '<div class="mp-empty">No active members</div>'}
          </div>
        </div>

        <div class="ri-footer-acts">
          <button type="button" class="btn ${isFollowing ? 'gold' : 'ok'} full" id="riFollowBtn" data-testid="ri-follow-btn">${isFollowing ? '✓ Following Room' : '+ Follow Room'}</button>
          <button type="button" class="btn ghost full" id="riSettingsBtn" data-testid="ri-open-settings-btn">⚙️ Room Settings</button>
        </div>
      </div>
    `, 'ri-modal');

    $('#riCopyId', m).onclick = () => {
      const idVal = String(live.fixedId || live.shortId);
      if (typeof copyTextClean === 'function') copyTextClean(idVal, 'Room ID');
      else toast(`Room ID: ${idVal}`);
    };
    $('#riFollowBtn', m).onclick = () => {
      const cur = partyRooms.find(r => r && r.id === rm.id) || rm;
      const res = prr && typeof prr.toggleRoomFollower === 'function' ? prr.toggleRoomFollower(cur, uid, me.name || 'Player') : null;
      if (res && res.ok) {
        cur.followers = res.followers;
        if (res.xpDelta) cur.roomXp = Number(cur.roomXp || 0) + res.xpDelta;
        if (res.following) trackRoomDailyEvent('task_follow');
        if (cur.isOwnedRoom && typeof syncOwnedRoomProfileSnapshot === 'function') syncOwnedRoomProfileSnapshot(cur);
        persistPartyRoom(cur);
        const btn = $('#riFollowBtn', m);
        const cnt = $('#riFansCnt', m);
        if (btn) {
          btn.className = `btn ${res.following ? 'gold' : 'ok'} full`;
          btn.textContent = res.following ? '✓ Following Room' : '+ Follow Room';
        }
        if (cnt) cnt.textContent = String(cur.followers.length);
        toast(res.following ? '✓ Following this room!' : 'Unfollowed room');
      }
    };
    $('#riSettingsBtn', m).onclick = () => {
      m.close();
      openPartyFullSettingsModal(live);
    };
  }

  /* ===== 5. Full Room Settings Screen (Owner & Admin Controlled) ===== */
  function openBlocklistModal(rm) {
    const rules = PRE();
    const live = partyRooms.find(r => r && r.id === rm.id) || rm;
    const amAdmin = canModerateRoom(live);
    const bm = modal('🚫 Room Blocklist', `<div id="rblBody" data-testid="vr-blocklist-modal"></div>`);

    function renderBl() {
      const cur = partyRooms.find(r => r && r.id === rm.id) || rm;
      const list = rules ? rules.normalizeRoomSettings(cur).blocklist : (cur.blocklist || []);
      const body = $('#rblBody', bm);
      if (!body) return;
      body.innerHTML = list.length ? `
        <div class="list" style="gap:7px">
          ${list.map(b => `
            <div class="advp-member-row">
              <div class="advp-m-left"><b>${esc(b.name)}</b><small>Blocked by ${esc(b.blockedBy || 'Admin')} · ${fmtRelTime(b.ts)}</small></div>
              ${amAdmin ? `<button type="button" class="btn sm ghost" data-unblock-uid="${esc(b.uid)}">Unblock</button>` : '<span class="ri-m-role">Blocked</span>'}
            </div>
          `).join('')}
        </div>
      ` : '<div class="mp-empty">Blocklist is empty.</div>';
    }

    bm.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-unblock-uid]');
      if (!btn) return;
      const cur = partyRooms.find(r => r && r.id === rm.id) || rm;
      const tUid = btn.dataset.unblockUid;
      const target = (cur.blocklist || []).find(b => b.uid === tUid) || { uid: tUid, name: 'Player' };
      const res = rules ? rules.toggleBlocklistUser(cur, uid, me.name || 'Owner', target, false, Date.now()) : null;
      if (!res || !res.ok) return toast(res?.error || 'Owner or Admins only');
      cur.blocklist = res.blocklist;
      cur.kickedUids = res.kickedUids;
      cur.operationLog = res.operationLog;
      persistPartyRoom(cur);
      toast(`Unblocked ${target.name}`);
      renderBl();
    });
    renderBl();
  }

  function openOperationRecordModal(rm) {
    const live = partyRooms.find(r => r && r.id === rm.id) || rm;
    const logs = Array.isArray(live.operationLog) ? live.operationLog.slice().reverse() : [];
    modal('📋 Operation Record', `
      <div class="rop-list" data-testid="vr-operation-record-modal">
        ${logs.length ? logs.map(op => `
          <div class="rop-row">
            <div class="rop-top"><b>${esc(op.action)}</b><small>${fmtRelTime(op.ts)}</small></div>
            <div class="rop-sub">${esc(op.actorName)}${op.detail ? ` · ${esc(op.detail)}` : ''}</div>
          </div>
        `).join('') : '<div class="mp-empty">No room moderation or setting changes recorded yet.</div>'}
      </div>
    `);
  }

  function openPartyFullSettingsModal(rm) {
    if (!rm) return;
    const rules = PRE();
    const live = partyRooms.find(r => r && r.id === rm.id) || rm;
    const s = rules ? rules.normalizeRoomSettings(live) : {
      partnerSeat: Boolean(live.partnerSeat),
      banTextChat: Boolean(live.banTextChat),
      banPhotoChat: Boolean(live.banPhotoChat),
      banRedPacket: Boolean(live.banRedPacket),
      region: live.region || 'India',
      blocklist: live.blocklist || [],
      operationLog: live.operationLog || []
    };
    const amOwner = isSingleOwner(live, uid);
    const amAdmin = canModerateRoom(live);
    const hasPass = Boolean(live.password);
    const dis = amAdmin ? '' : 'disabled';

    const m = modal('⚙️ Room Settings', `
      <div class="rset-shell" data-testid="vr-full-settings-modal">
        ${!amAdmin ? '<div class="advp-lock-note">🔒 Read-only view · Only Room Owner or Admins can change Room Settings.</div>' : ''}

        <div class="rset-group">
          <label for="rsetTitle">Title</label>
          <input id="rsetTitle" maxlength="36" value="${esc(live.title)}" ${dis} data-testid="rset-title">

          <label for="rsetAnnounce" style="margin-top:8px">Announcement</label>
          <textarea id="rsetAnnounce" rows="2" maxlength="160" ${dis} data-testid="rset-announce">${esc(live.announcement || '')}</textarea>
        </div>

        <div class="rset-grid2">
          <div>
            <label for="rsetCover">Cover</label>
            <select id="rsetCover" ${dis}>
              ${Object.entries(PARTY_COVERS).map(([cid, cv]) => `<option value="${cid}" ${live.cover === cid ? 'selected' : ''}>${cv.glyph} ${cv.name}</option>`).join('')}
            </select>
          </div>
          <div>
            <label for="rsetBg">Room Background</label>
            <select id="rsetBg" ${dis}>
              ${Object.values(PARTY_BG_META).map(b => `<option value="${b.id}" ${live.background === b.id ? 'selected' : ''}>${b.name}</option>`).join('')}
            </select>
          </div>
          <div>
            <label for="rsetMode">Room Mode</label>
            <select id="rsetMode" ${dis}>
              ${Object.values(PARTY_MODES_META).map(md => `<option value="${md.id}" ${live.mode === md.id ? 'selected' : ''}>${md.name}</option>`).join('')}
            </select>
          </div>
          <div>
            <label for="rsetTag">Room Tag</label>
            <select id="rsetTag" ${dis}>
              ${PARTY_TAGS.map(t => `<option value="${t}" ${live.tag === t ? 'selected' : ''}>${t}</option>`).join('')}
            </select>
          </div>
          <div>
            <label for="rsetRegion">Region</label>
            <select id="rsetRegion" ${dis}>
              ${(rules ? rules.ROOM_REGIONS : ['India', 'Global']).map(rg => `<option value="${rg}" ${s.region === rg ? 'selected' : ''}>${rg}</option>`).join('')}
            </select>
          </div>
          <div>
            <label>Room ID</label>
            <button type="button" class="btn sm ghost full" id="rsetCopyId" style="height:40px">🆔 ${esc(live.fixedId || live.shortId)} ⧉</button>
          </div>
        </div>

        <div class="rset-toggles">
          <label class="rset-toggle-row"><span>💞 Partner Seat (Co-Host Seat 1)</span><input type="checkbox" id="rsetPartnerSeat" ${s.partnerSeat ? 'checked' : ''} ${dis} data-testid="rset-partner-seat"></label>
          <label class="rset-toggle-row"><span>🎧 High Quality Mode</span><input type="checkbox" id="rsetHq" ${live.hqAudio ? 'checked' : ''} ${dis} data-testid="rset-hq"></label>
          <label class="rset-toggle-row"><span>🔇 Ban Text Chatting</span><input type="checkbox" id="rsetBanText" ${s.banTextChat ? 'checked' : ''} ${dis} data-testid="rset-ban-text"></label>
          <label class="rset-toggle-row"><span>🖼️ Ban Photo Chatting</span><input type="checkbox" id="rsetBanPhoto" ${s.banPhotoChat ? 'checked' : ''} ${dis} data-testid="rset-ban-photo"></label>
          <label class="rset-toggle-row"><span>🧧 Ban Red Packet</span><input type="checkbox" id="rsetBanRp" ${s.banRedPacket ? 'checked' : ''} ${dis} data-testid="rset-ban-rp"></label>
          <label class="rset-toggle-row"><span>🔑 Password Lock</span><input type="checkbox" id="rsetPassOn" ${hasPass ? 'checked' : ''} ${amOwner ? '' : 'disabled'} data-testid="rset-pass-toggle"></label>
        </div>

        <div id="rsetPassWrap" ${hasPass ? '' : 'hidden'} style="margin-top:6px">
          <input id="rsetPassVal" type="text" maxlength="20" placeholder="Enter room passcode..." value="${esc(live.password || '')}" ${amOwner ? '' : 'disabled'} data-testid="rset-pass-input">
        </div>

        <div class="rset-links">
          <button type="button" class="rset-link-row" id="rsetOpenBlocklist" data-testid="rset-open-blocklist">
            <span>🚫 Blocklist</span>
            <small>${s.blocklist.length} ›</small>
          </button>
          <button type="button" class="rset-link-row" id="rsetOpenOps" data-testid="rset-open-ops">
            <span>📋 Operation Record</span>
            <small>${s.operationLog.length} ›</small>
          </button>
        </div>

        <button type="button" class="btn gold full" id="rsetSaveBtn" data-testid="rset-save-btn" style="margin-top:10px">Save Room Settings</button>
      </div>
    `, 'rset-modal');

    const passToggle = $('#rsetPassOn', m);
    const passWrap = $('#rsetPassWrap', m);
    if (passToggle && passWrap) {
      passToggle.onchange = () => { passWrap.hidden = !passToggle.checked; };
    }
    $('#rsetCopyId', m).onclick = () => {
      const idVal = String(live.fixedId || live.shortId);
      if (typeof copyTextClean === 'function') copyTextClean(idVal, 'Room ID');
      else toast(`Room ID: ${idVal}`);
    };
    $('#rsetOpenBlocklist', m).onclick = () => openBlocklistModal(live);
    $('#rsetOpenOps', m).onclick = () => openOperationRecordModal(live);

    $('#rsetSaveBtn', m).onclick = () => {
      if (!assertRoomPerm(live, 'edit_settings')) return;
      const cur = partyRooms.find(r => r && r.id === rm.id) || rm;
      const prevBg = cur.background;
      const prevMode = cur.mode;
      const actor = (typeof me !== 'undefined' && me && me.name) || 'Admin';
      const nextTitle = ($('#rsetTitle', m)?.value || '').trim().slice(0, 36);
      if (nextTitle) cur.title = nextTitle;
      cur.announcement = ($('#rsetAnnounce', m)?.value || '').trim().slice(0, 160) || cur.announcement;
      cur.cover = $('#rsetCover', m)?.value || cur.cover;
      cur.background = $('#rsetBg', m)?.value || cur.background;
      const nextMode = $('#rsetMode', m)?.value || cur.mode;
      if (nextMode !== prevMode) {
        if (window.PartyModeStages && typeof window.PartyModeStages.onModeWillChange === 'function') {
          window.PartyModeStages.onModeWillChange(prevMode, nextMode);
        }
        cur.mode = nextMode;
        cur.mediaPlayMode = nextMode === 'video' ? 'video' : 'audio';
        cur.chat = [...(cur.chat || []), {
          id: 'smode_' + Date.now().toString(36),
          type: 'sys',
          text: `🔄 ${actor} changed the mode from ${PARTY_MODES_META[prevMode]?.name || prevMode} to ${PARTY_MODES_META[nextMode]?.name || nextMode}`,
          ts: Date.now()
        }].slice(-45);
      }
      if (cur.background !== prevBg) {
        const bgName = (typeof PARTY_BG_META !== 'undefined' && PARTY_BG_META[cur.background]?.name) || cur.background;
        cur.chat = [...(cur.chat || []), {
          id: 'sbg_' + Date.now().toString(36),
          type: 'sys',
          text: `🎨 ${actor} changed the background to ${bgName}`,
          ts: Date.now()
        }].slice(-45);
      }
      cur.tag = $('#rsetTag', m)?.value || cur.tag;
      cur.region = $('#rsetRegion', m)?.value || 'India';
      cur.partnerSeat = Boolean($('#rsetPartnerSeat', m)?.checked);
      cur.hqAudio = Boolean($('#rsetHq', m)?.checked);
      cur.banTextChat = Boolean($('#rsetBanText', m)?.checked);
      cur.banPhotoChat = Boolean($('#rsetBanPhoto', m)?.checked);
      cur.banRedPacket = Boolean($('#rsetBanRp', m)?.checked);
      if (isSingleOwner(cur, uid)) {
        cur.password = $('#rsetPassOn', m)?.checked ? ($('#rsetPassVal', m)?.value || '').trim().slice(0, 20) : '';
      }
      logRoomOperation(cur, 'Updated Settings', `${cur.title} · ${cur.tag}${cur.partnerSeat ? ' · Partner Seat' : ''}`);
      if (cur.isOwnedRoom && typeof syncOwnedRoomProfileSnapshot === 'function') syncOwnedRoomProfileSnapshot(cur);
      persistPartyRoom(cur, { fullReplace: nextMode !== prevMode });
      if (typeof buildProfile === 'function') buildProfile();
      toast('✓ Room Settings saved!');
      m.close();
    };
  }

  /* ===== 6. Daily Task Treasure Boxes Modal ===== */
  function openPartyDailyTasksModal(rm) {
    if (!rm) return;
    const rules = PRE();
    if (!rules) return;
    let tickIv = 0;

    const m = modal('🧰 Daily Room Task Boxes', `<div class="dt-shell" id="dtBody" data-testid="vr-daily-tasks-modal"></div>`, 'dt-modal');

    function renderDaily() {
      const live = partyRooms.find(r => r && r.id === rm.id) || rm;
      const ev = getRoomDailyEval(live);
      const body = $('#dtBody', m);
      if (!body || !ev) return;

      body.innerHTML = `
        <div class="dt-stay-bar">
          <span>Today's Room Time</span>
          <b class="tabular-nums">${fmtMmSs(ev.state.staySec)}</b>
        </div>
        <div class="dt-box-grid">
          ${ev.boxes.map(b => {
            const stateTag = b.status === 'claimed'
              ? 'Claimed'
              : (b.status === 'claimable'
                ? 'Ready'
                : (b.status === 'locked_vip' ? 'VIP Only' : 'Preparing'));
            const btnLabel = b.status === 'claimed'
              ? 'Claimed ✓'
              : (b.status === 'claimable'
                ? `Claim +${b.coins} 🪙`
                : (b.status === 'locked_vip' ? 'VIP Only' : `Preparing · ${fmtMmSs(b.remainingSec)}`));
            return `<div class="dt-box-card ${b.status}" data-status="${esc(b.status)}" data-testid="dt-box-${esc(b.id)}">
              <span class="dt-box-state ${esc(b.status)}">${esc(stateTag)}</span>
              <div class="dt-box-ico" aria-hidden="true">${b.icon}</div>
              <b>${esc(b.label)}</b>
              <small class="tabular-nums">+${b.coins} 🪙 · +${b.xp} XP</small>
              <button type="button" class="btn sm ${b.status === 'claimable' ? 'gold' : 'ghost'} full tabular-nums" data-dt-claim-box="${esc(b.id)}" data-testid="dt-claim-${esc(b.id)}" ${b.status === 'claimed' ? 'disabled' : ''}>${esc(btnLabel)}</button>
            </div>`;
          }).join('')}
        </div>
        <div class="dt-sec-hdr">Quick Room Tasks</div>
        <div class="dt-task-list">
          ${ev.tasks.map(t => `
            <div class="dt-task-row">
              <div class="dt-task-left">
                <span class="dt-task-ico" aria-hidden="true">${t.icon}</span>
                <div>
                  <b>${esc(t.label)}</b>
                  <small>+${t.coins} 🪙 · +${t.xp} Room XP</small>
                </div>
              </div>
              <button type="button" class="btn sm ${t.status === 'claimable' ? 'ok' : 'ghost'}" data-dt-claim-task="${esc(t.id)}" ${t.status === 'claimed' ? 'disabled' : ''}>
                ${t.status === 'claimed' ? 'Done ✓' : (t.status === 'claimable' ? 'Claim' : 'Do Now')}
              </button>
            </div>
          `).join('')}
        </div>
      `;
    }

    m.addEventListener('click', (e) => {
      const live = partyRooms.find(r => r && r.id === rm.id) || rm;
      const boxBtn = e.target.closest('[data-dt-claim-box]');
      if (boxBtn) {
        const res = rules.claimDailyTaskBox(loadDailyTaskState(), boxBtn.dataset.dtClaimBox, {
          nowMs: Date.now(),
          roomStaySec: loadDailyTaskState().staySec,
          isVip: Boolean(live.isOwnedRoom || (live.guards || []).some(g => g.uid === uid) || me?.ownedRoom?.unlocked)
        });
        if (!res.ok) return toast(res.error || 'Not ready yet');
        saveDailyTaskState(res.state);
        if (typeof addReward === 'function') addReward(res.coins, res.xp, `${res.box.label} claimed!`, true);
        live.roomXp = Number(live.roomXp || 0) + res.xp;
        persistPartyRoom(live);
        updateDailyBadgeDom();
        toast(`🎉 Opened ${res.box.label}! +${res.coins} 🪙`);
        renderDaily();
        return;
      }

      const taskBtn = e.target.closest('[data-dt-claim-task]');
      if (taskBtn) {
        const tid = taskBtn.dataset.dtClaimTask;
        const st = loadDailyTaskState();
        const ev = getRoomDailyEval(live);
        const target = ev && ev.tasks.find(x => x.id === tid);
        if (target && target.status === 'pending') {
          if (tid === 'task_follow') {
            m.close();
            openPartyRoomInfoModal(live);
          } else if (tid === 'task_gift') {
            m.close();
            if (typeof openGiftSendModal === 'function') openGiftSendModal(null, { allowPickPlayer: true, inPartyRoom: live.id });
          } else {
            m.close();
            const inp = document.getElementById('pfsChatIn');
            if (inp) inp.focus();
          }
          return;
        }
        const res = rules.claimDailyQuickTask(st, tid, { nowMs: Date.now() });
        if (!res.ok) return toast(res.error || 'Complete task first');
        saveDailyTaskState(res.state);
        if (typeof addReward === 'function') addReward(res.coins, res.xp, `${res.task.label} reward!`, true);
        live.roomXp = Number(live.roomXp || 0) + res.xp;
        persistPartyRoom(live);
        updateDailyBadgeDom();
        toast(`✨ Claimed +${res.coins} 🪙!`);
        renderDaily();
      }
    });

    const origClose = m.close;
    m.close = () => {
      if (tickIv) { clearInterval(tickIv); tickIv = 0; }
      origClose();
    };
    renderDaily();
    tickIv = setInterval(() => {
      if (!document.body.contains(m)) { clearInterval(tickIv); tickIv = 0; return; }
      renderDaily();
    }, 1000);
  }

  /* ===== 7. Create PvP / PK Mode + Live Stage Banner + Rules ===== */
  function openPkRulesModal() {
    const rules = PRE();
    const secs = rules ? rules.PK_RULES_SECTIONS : [];
    const tiers = rules ? rules.PK_MIC_OUTFIT_TIERS.filter(t => t.minScore > 0) : [];
    modal('📜 Room PK Rules & Tiers', `
      <div class="pk-rules-shell" data-testid="vr-pk-rules-modal">
        ${secs.map(s => `
          <div class="pk-rule-card">
            <b>${esc(s.title)}</b>
            <p>${esc(s.body)}</p>
          </div>
        `).join('')}
        <div class="pk-rule-card">
          <b>Mic Outfit Tiers</b>
          <div class="pk-tier-grid">
            ${tiers.map(t => `<div class="pk-tier-chip" style="border-color:${t.color}"><b>${esc(t.badge)}</b><small>${t.minScore.toLocaleString()}+ pts</small></div>`).join('')}
          </div>
        </div>
      </div>
    `);
  }

  function openPartyCreatePkModal(rm) {
    if (!rm) return;
    const rules = PRE();
    if (!rules) return;
    let selMode = '1v1';
    let selScoring = 'gifts';
    let selDur = 5;

    const m = modal('⚔️ Create PvP / PK', `
      <div class="pk-create-shell" data-testid="vr-create-pk-modal">
        <div class="pk-head-bar">
          <small>Choose PK format, scoring method &amp; duration</small>
          <button type="button" class="btn sm ghost" id="pkOpenRulesBtn" data-testid="pk-rules-btn">📜 Rules</button>
        </div>

        <div class="pk-sec-lbl">PK Mode</div>
        <div class="pk-mode-list">
          ${rules.PK_MODES.map(md => `
            <button type="button" class="pk-opt-card ${selMode === md.id ? 'on' : ''}" data-pk-mode="${esc(md.id)}" data-testid="pk-mode-${esc(md.id)}">
              <span class="pk-opt-ico">${md.icon}</span>
              <div><b>${esc(md.name)}</b><small>${esc(md.desc)}</small></div>
            </button>
          `).join('')}
        </div>

        <div class="pk-sec-lbl">Scoring Basis</div>
        <div class="pk-score-grid">
          ${rules.PK_SCORING.map(sc => `
            <button type="button" class="pk-opt-card compact ${selScoring === sc.id ? 'on' : ''}" data-pk-score="${esc(sc.id)}" data-testid="pk-score-${esc(sc.id)}">
              <span>${sc.icon}</span>
              <b>${esc(sc.name)}</b>
            </button>
          `).join('')}
        </div>

        <div class="pk-sec-lbl">Duration</div>
        <div class="pk-dur-grid">
          ${rules.PK_DURATIONS.map(d => `
            <button type="button" class="pk-dur-btn ${selDur === d ? 'on' : ''}" data-pk-dur="${d}" data-testid="pk-dur-${d}">${d} min</button>
          `).join('')}
        </div>

        <button type="button" class="btn gold full" id="pkInitiateBtn" data-testid="pk-initiate-btn" style="margin-top:12px">⚔️ Initiate PvP</button>
      </div>
    `, 'pk-modal');

    m.addEventListener('click', (e) => {
      const mBtn = e.target.closest('[data-pk-mode]');
      if (mBtn) {
        selMode = mBtn.dataset.pkMode;
        $$('[data-pk-mode]', m).forEach(b => b.classList.toggle('on', b.dataset.pkMode === selMode));
        return;
      }
      const sBtn = e.target.closest('[data-pk-score]');
      if (sBtn) {
        selScoring = sBtn.dataset.pkScore;
        $$('[data-pk-score]', m).forEach(b => b.classList.toggle('on', b.dataset.pkScore === selScoring));
        return;
      }
      const dBtn = e.target.closest('[data-pk-dur]');
      if (dBtn) {
        selDur = Number(dBtn.dataset.pkDur);
        $$('[data-pk-dur]', m).forEach(b => b.classList.toggle('on', Number(b.dataset.pkDur) === selDur));
        return;
      }
      if (e.target.closest('#pkOpenRulesBtn')) {
        openPkRulesModal();
        return;
      }
      if (e.target.closest('#pkInitiateBtn')) {
        const cur = partyRooms.find(r => r && r.id === rm.id) || rm;
        const res = rules.createRoomPkSession(cur, uid, { mode: selMode, scoring: selScoring, durationMin: selDur }, Date.now());
        if (!res.ok) return toast(`🔒 ${res.error}`);
        cur.pkSession = res.pk;
        cur.chat = [...(cur.chat || []), {
          id: 'pk_' + Date.now().toString(36),
          type: 'sys',
          text: `⚔️ ${me.name || 'Owner'} started ${res.pk.title} (${selDur} min · ${selScoring === 'votes' ? 'Votes' : 'Gifts'})!`,
          ts: Date.now()
        }].slice(-45);
        logRoomOperation(cur, 'Initiated PvP / PK', `${res.pk.title} (${selDur}m)`);
        persistPartyRoom(cur);
        toast(`⚔️ ${res.pk.title} is LIVE!`);
        m.close();
      }
    });
  }

  function renderRoomPkStageBanner(rm) {
    const rules = PRE();
    if (!rm || !rm.pkSession || rm.pkSession.status !== 'active' || !rules) return '';
    const pk = rm.pkSession;
    const t = rules.evaluatePkTimerState(pk, Date.now());
    if (t.ended) return '';

    const red = Number(pk.redScore || 0);
    const blue = Number(pk.blueScore || 0);
    const total = red + blue;
    const redPct = total > 0 ? Math.max(12, Math.min(88, Math.round((red / total) * 100))) : 50;
    const redTier = rules.getMicOutfitTier(red);
    const blueTier = rules.getMicOutfitTier(blue);
    const actionLabel = pk.scoring === 'votes' ? '🗳️ Vote' : '🎁 +50 PK';

    return `
      <div class="pfs-pk-banner ${t.inBonusTime ? 'bonus' : ''}" data-testid="vr-pk-banner">
        <div class="pfs-pk-top">
          <div class="pfs-pk-title">
            <b>⚔️ ${esc(pk.title)}</b>
            ${t.inBonusTime ? '<span class="pfs-pk-pill bonus">2× BONUS</span>' : ''}
            ${t.freezeActive ? `<span class="pfs-pk-pill freeze">❄️ ${esc(t.freezeTarget.toUpperCase())} FROZEN</span>` : ''}
          </div>
          <div class="pfs-pk-clock-row">
            <span class="pfs-pk-clock tabular-nums" data-testid="vr-pk-clock">${fmtMmSs(t.remainingSec)}</span>
            <button type="button" class="pfs-pk-mini-btn" data-pfs-act="pk-rules" aria-label="PK Rules">?</button>
            ${canModerateRoom(rm) ? '<button type="button" class="pfs-pk-mini-btn end" data-pfs-act="pk-end" data-testid="vr-pk-end-btn">End</button>' : ''}
          </div>
        </div>

        <div class="pfs-pk-bar">
          <div class="pfs-pk-fill red" style="width:${redPct}%"><span>🔴 ${red.toLocaleString()}${redTier.badge ? ` ${redTier.badge}` : ''}</span></div>
          <div class="pfs-pk-fill blue" style="width:${100 - redPct}%"><span>${blueTier.badge ? `${blueTier.badge} ` : ''}${blue.toLocaleString()} 🔵</span></div>
        </div>

        <div class="pfs-pk-acts">
          <button type="button" class="btn sm red" data-pfs-act="pk-score-red" data-testid="vr-pk-score-red">${actionLabel} Red</button>
          <button type="button" class="btn sm ghost" data-pfs-act="pk-freeze" data-testid="vr-pk-freeze">❄️ Freeze</button>
          <button type="button" class="btn sm ok" data-pfs-act="pk-score-blue" data-testid="vr-pk-score-blue">${actionLabel} Blue</button>
        </div>
      </div>
    `;
  }

  function handleRoomPkAction(rm, act) {
    const rules = PRE();
    if (!rm || !rules) return;
    if (act === 'pk-rules') { openPkRulesModal(); return; }
    if (!rm.pkSession || rm.pkSession.status !== 'active') return;

    if (act === 'pk-end') {
      if (!assertRoomPerm(rm, 'change_mode')) return;
      const done = rules.finalizePkSession(rm.pkSession);
      rm.pkSession = done;
      rm.chat = [...(rm.chat || []), {
        id: 'pkend_' + Date.now().toString(36),
        type: 'sys',
        text: `🏆 PK Finished! Winner: ${done.winner} (Red ${done.redScore} vs Blue ${done.blueScore})`,
        ts: Date.now()
      }].slice(-45);
      persistPartyRoom(rm);
      toast(`🏆 PK Winner: ${done.winner}!`);
      return;
    }

    if (act === 'pk-freeze') {
      const mySeatKey = typeof findUserSeatKeyInRoom === 'function' ? findUserSeatKeyInRoom(rm, uid) : '0';
      const mySide = (Number(mySeatKey || 0) % 2 === 0) ? 'red' : 'blue';
      const res = rules.triggerPkFreeze(rm.pkSession, mySide, Date.now());
      if (!res.ok) return toast(res.error);
      rm.pkSession = res.pk;
      persistPartyRoom(rm);
      toast(`❄️ Froze ${res.pk.freezeTarget.toUpperCase()} team for 15 seconds!`);
      return;
    }

    if (act === 'pk-score-red' || act === 'pk-score-blue') {
      const side = act === 'pk-score-red' ? 'red' : 'blue';
      const kind = rm.pkSession.scoring === 'votes' ? 'vote' : 'gift';
      if (kind === 'gift') {
        const cost = 5;
        if (typeof me !== 'undefined' && Number(me.coins || 0) < cost) {
          return toast(`Need ${cost} coins to send PK Gift`);
        }
        if (typeof addReward === 'function') addReward(-cost, 5, null, true);
        trackRoomDailyEvent('task_gift');
      }
      const res = rules.recordPkContribution(rm.pkSession, {
        actorUid: uid,
        side,
        points: kind === 'vote' ? 10 : 50,
        kind,
        targetUid: uid,
        targetName: (typeof me !== 'undefined' && me?.name) || 'Player',
        nowMs: Date.now()
      });
      if (!res.ok) return toast(res.error);
      rm.pkSession = res.pk;
      persistPartyRoom(rm);
      toast(`${side === 'red' ? '🔴' : '🔵'} +${res.added} PK pts${res.multiplier > 1 ? ' (2× Bonus!)' : ''}`);
    }
  }

  /* ===== 8. "Who's the Winner?" Room Mini-Game + Rules ===== */
  function openWtwRulesModal() {
    const rules = PRE();
    const secs = rules ? rules.WTW_RULES_SECTIONS : [];
    modal("🏆 Who's the Winner? — Rules", `
      <div class="pk-rules-shell" data-testid="vr-wtw-rules-modal">
        ${secs.map(s => `
          <div class="pk-rule-card">
            <b>${esc(s.title)}</b>
            <p>${esc(s.body)}</p>
          </div>
        `).join('')}
      </div>
    `);
  }

  function openPartyWhosWinnerModal(rm) {
    if (!rm) return;
    const rules = PRE();
    const prr = typeof PRR === 'function' ? PRR() : null;
    if (!rules) return;

    let selectedEntryId = rules.WTW_ENTRANCE_OPTIONS[0].id;
    let activeGame = null;

    const m = modal("🏆 Who's the Winner?", `<div class="wtw-shell" id="wtwBody" data-testid="vr-wtw-modal"></div>`, 'wtw-modal');

    function getRoster() {
      const live = partyRooms.find(r => r && r.id === rm.id) || rm;
      const members = prr ? prr.getOrderedActiveMembers(live, Date.now(), prr.DEFAULT_STALE_MS) : Object.values(live.members || {});
      const roster = members.map(mb => ({ uid: mb.uid, name: mb.name || 'Player', avatar: mb.avatar || 'av_b1' }));
      if (!roster.some(p => p.uid === uid)) {
        roster.unshift({ uid, name: (typeof me !== 'undefined' && me?.name) || 'You', avatar: (typeof me !== 'undefined' && me?.avatar) || 'av_b1' });
      }
      // Ensure at least 4 contenders for an exciting room tournament even when testing solo
      const fillers = [
        { uid: 'wtw_g1', name: 'Riya', avatar: 'av_g2' },
        { uid: 'wtw_g2', name: 'Kabir', avatar: 'av_b2' },
        { uid: 'wtw_g3', name: 'Zoya', avatar: 'av_g3' }
      ];
      for (let i = 0; i < fillers.length && roster.length < 4; i++) {
        if (!roster.some(p => p.uid === fillers[i].uid)) roster.push(fillers[i]);
      }
      return roster.slice(0, 8);
    }

    function renderWtw() {
      const body = $('#wtwBody', m);
      if (!body) return;

      if (!activeGame) {
        const entry = rules.WTW_ENTRANCE_OPTIONS.find(e => e.id === selectedEntryId) || rules.WTW_ENTRANCE_OPTIONS[0];
        const roster = getRoster();
        const pot = roster.length * entry.cost;
        body.innerHTML = `
          <div class="pk-head-bar">
            <small>Pick entrance gift &amp; battle for the Winner Pot</small>
            <button type="button" class="btn sm ghost" id="wtwRulesBtn" data-testid="wtw-rules-btn">📜 Rules</button>
          </div>

          <div class="wtw-pot-card">
            <small>WINNER POT (${roster.length} Players)</small>
            <b class="tabular-nums" data-testid="wtw-pot-amount">${pot.toLocaleString()} 🪙</b>
          </div>

          <div class="pk-sec-lbl">Select Entrance Gift</div>
          <div class="wtw-entry-grid">
            ${rules.WTW_ENTRANCE_OPTIONS.map(opt => `
              <button type="button" class="wtw-entry-card ${selectedEntryId === opt.id ? 'on' : ''}" data-wtw-entry="${esc(opt.id)}" data-testid="wtw-entry-${esc(opt.id)}">
                <span class="wtw-entry-ico">${opt.icon}</span>
                <b>${esc(opt.name)}</b>
                <small>${opt.cost} 🪙</small>
              </button>
            `).join('')}
          </div>

          <div class="pk-sec-lbl">Contenders (${roster.length})</div>
          <div class="wtw-roster">
            ${roster.map(p => `<span class="wtw-chip">${esc(p.name)}</span>`).join('')}
          </div>

          <button type="button" class="btn gold full" id="wtwStartBtn" data-testid="wtw-start-btn" style="margin-top:12px">🏆 START (${entry.cost} 🪙)</button>
        `;
        return;
      }

      const finished = activeGame.status === 'finished';
      body.innerHTML = `
        <div class="wtw-pot-card ${finished ? 'won' : ''}">
          <small>${finished ? 'CHAMPION WINNER POT' : `ROUND ${activeGame.round || 1} · WINNER POT`}</small>
          <b class="tabular-nums">${activeGame.pot.toLocaleString()} 🪙</b>
          ${finished && activeGame.winner ? `<div class="wtw-winner-banner" data-testid="wtw-winner-banner">👑 ${esc(activeGame.winner.name)} Wins ${activeGame.pot.toLocaleString()} 🪙!</div>` : ''}
        </div>

        <div class="wtw-arena-grid">
          ${activeGame.players.map(p => `
            <div class="wtw-player-tile ${p.eliminated ? 'out' : 'alive'} ${activeGame.winner && activeGame.winner.uid === p.uid ? 'champ' : ''}">
              <span>${activeGame.winner && activeGame.winner.uid === p.uid ? '👑' : (p.eliminated ? '💥' : '🔥')}</span>
              <b>${esc(p.name)}</b>
              <small>${activeGame.winner && activeGame.winner.uid === p.uid ? 'WINNER' : (p.eliminated ? 'Out' : 'Alive')}</small>
            </div>
          `).join('')}
        </div>

        <div class="wtw-log">
          ${activeGame.roundsLog.map(r => `
            <div class="wtw-log-row">Round ${r.round}: Eliminated <b>${esc(r.eliminatedNames.join(', '))}</b> · ${r.survivorCount} left</div>
          `).join('') || '<div class="wtw-log-row">Arena ready — tap Next Elimination Round!</div>'}
        </div>

        <div class="rmc-acts" style="margin-top:10px">
          ${finished
            ? '<button type="button" class="btn gold full" id="wtwReplayBtn" data-testid="wtw-replay-btn">Play Again</button>'
            : '<button type="button" class="btn ok full" id="wtwNextRoundBtn" data-testid="wtw-next-round-btn">⚡ Next Elimination Round</button>'
          }
        </div>
      `;
    }

    m.addEventListener('click', (e) => {
      const eBtn = e.target.closest('[data-wtw-entry]');
      if (eBtn && !activeGame) {
        selectedEntryId = eBtn.dataset.wtwEntry;
        renderWtw();
        return;
      }
      if (e.target.closest('#wtwRulesBtn')) {
        openWtwRulesModal();
        return;
      }
      if (e.target.closest('#wtwStartBtn')) {
        const roster = getRoster();
        const created = rules.createWtwGame(selectedEntryId, roster, { myCoins: typeof me !== 'undefined' ? Number(me.coins || 0) : 0 });
        if (!created.ok) return toast(created.error);
        if (typeof addReward === 'function') addReward(-created.game.entry.cost, 0, null, true);
        activeGame = created.game;
        // Run Round 1 right away for instant action
        const r1 = rules.advanceWtwRound(activeGame);
        if (r1.ok) activeGame = r1.game;
        if (activeGame.status === 'finished') awardWtwWinner(rm, activeGame);
        renderWtw();
        return;
      }
      if (e.target.closest('#wtwNextRoundBtn') && activeGame) {
        const step = rules.advanceWtwRound(activeGame);
        if (step.ok) activeGame = step.game;
        if (activeGame.status === 'finished') awardWtwWinner(rm, activeGame);
        renderWtw();
        return;
      }
      if (e.target.closest('#wtwReplayBtn')) {
        activeGame = null;
        renderWtw();
      }
    });

    function awardWtwWinner(room, g) {
      const live = partyRooms.find(r => r && r.id === room.id) || room;
      if (!g || !g.winner) return;
      if (g.winner.uid === uid && typeof addReward === 'function') {
        addReward(g.pot, 30, `Won Who's the Winner? (+${g.pot} coins)`, true);
        if (typeof SFX !== 'undefined' && typeof SFX.playWin === 'function') SFX.playWin();
      }
      live.roomXp = Number(live.roomXp || 0) + 30;
      live.chat = [...(live.chat || []), {
        id: 'wtw_' + Date.now().toString(36),
        type: 'sys',
        text: `🏆 Who's the Winner? ${g.winner.name} survived all rounds and won the ${g.pot.toLocaleString()} 🪙 pot!`,
        ts: Date.now()
      }].slice(-45);
      persistPartyRoom(live);
      toast(`👑 ${g.winner.name} won ${g.pot.toLocaleString()} 🪙!`);
    }

    renderWtw();
  }

  /* ===== Auto-start Stay Timer ===== */
  startRoomDailyStayTimer();

  global.PartyRoomExtras = {
    renderRoomAudioStageBar,
    renderRoomPkStageBanner,
    handleRoomPkAction,
    openPartyRoomMenuDrawer,
    openModeSwitchConfirmModal,
    openSeatTapActionSheet,
    openPartyRoomInfoModal,
    openPartyFullSettingsModal,
    openPartyDailyTasksModal,
    openPartyCreatePkModal,
    openPkRulesModal,
    openPartyWhosWinnerModal,
    openWtwRulesModal,
    openRoomVolumeModal,
    trackRoomDailyEvent,
    getRoomDailyEval,
    updateDailyBadgeDom,
    logRoomOperation
  };
})(typeof window !== 'undefined' ? window : globalThis);
