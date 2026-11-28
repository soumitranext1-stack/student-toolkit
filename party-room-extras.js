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

  function isDailyChestVipUser() {
    if (typeof getActiveVipTier === 'function' && typeof me !== 'undefined' && me && getActiveVipTier(me)) {
      return true;
    }
    if (typeof me !== 'undefined' && me && me.ownedRoom && me.ownedRoom.unlocked) {
      return true;
    }
    return false;
  }

  function getRoomDailyEval(rm) {
    const rules = PRE();
    if (!rules) return null;
    const st = loadDailyTaskState();
    const isVip = isDailyChestVipUser();
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
    // In Video Mode (empty or playing video), the Video Card owns the single Add Song / Media controls.
    // Only show the audio mini-bar in Video Mode if the user explicitly switched to Audio playback mode.
    if (rm.mode === 'video' && rm.mediaPlayMode !== 'audio') return '';

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

    const activeIdx = Number.isFinite(Number(rm.queueIndex)) ? Number(rm.queueIndex) : Number(rm.musicQueueIndex ?? 0);
    const activeItem = (queue && queue[activeIdx]) || (queue && queue[0]) || null;
    const title = rm.musicTitle || (activeItem && activeItem.title) || 'Room Audio Track';
    const artist = rm.musicArtist || (activeItem && (activeItem.artist || activeItem.channel)) || 'Room Queue';
    const thumb = rm.musicThumb || (activeItem && (activeItem.thumbnail || activeItem.artworkUrl)) || '';
    const hasErr = Boolean(rm.musicError);
    const prog = (typeof PartyAudioPlayer !== 'undefined' && typeof PartyAudioPlayer.getProgress === 'function')
      ? PartyAudioPlayer.getProgress()
      : { currentSec: 0, durationSec: 0 };
    const fmtClock = (sec) => {
      const s = Math.max(0, Math.floor(Number(sec) || 0));
      return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
    };
    const cat = typeof PMC === 'function' ? PMC() : null;
    const fallbackDurLabel = rm.musicDuration || (activeItem && activeItem.duration) || '';
    const metaDurSec = Number(rm.musicDurationSec || (activeItem && activeItem.durationSec) || 0)
      || (cat && typeof cat.parseDurationLabelToSec === 'function' ? cat.parseDurationLabelToSec(fallbackDurLabel) : 0);
    const effectiveDurSec = prog.durationSec > 0 ? prog.durationSec : metaDurSec;
    const durMax = effectiveDurSec > 0 ? Math.max(1, Math.round(effectiveDurSec)) : 100;
    const curVal = effectiveDurSec > 0 ? Math.min(durMax, Math.max(0, Math.round(prog.currentSec))) : 0;
    const timeText = effectiveDurSec > 0
      ? `${fmtClock(prog.currentSec)} / ${fmtClock(effectiveDurSec)}`
      : `${fmtClock(prog.currentSec)} / ${fallbackDurLabel || '0:00'}`;
    const statusTxt = hasErr
      ? 'Stream unavailable · Tap ⏭ or + Song'
      : `${artist} · ${playing ? 'Playing' : 'Paused'} · Vol ${vol}%`;
    return `
      <div class="pfs-audio-bar active ${playing ? 'playing' : ''} ${hasErr ? 'has-err' : ''}" data-testid="vr-audio-stage-bar">
        <div class="pfs-audio-top">
          <div class="pfs-audio-left">
            <span class="pfs-audio-disc ${playing ? 'spin' : ''} ${thumb ? 'has-art' : ''}" aria-hidden="true">${thumb ? `<img class="pfs-audio-cover" src="${esc(thumb)}" alt="" loading="lazy">` : '♪'}</span>
            <div class="pfs-audio-meta">
              <b data-testid="vr-audio-title">${esc(title)}</b>
              <small>${esc(statusTxt)}</small>
            </div>
          </div>
          <div class="pfs-audio-acts">
            <button type="button" class="pfs-aud-btn ${playing ? 'gold' : 'ok'}" data-pfs-act="audio-toggle" data-testid="vr-audio-toggle-btn" aria-label="${playing ? 'Pause music' : 'Play music'}">${playing ? '⏸' : '▶'}</button>
            <button type="button" class="pfs-aud-btn" data-pfs-act="audio-next" data-testid="vr-audio-next-btn" aria-label="Next song" title="Next track">⏭</button>
            <button type="button" class="pfs-aud-btn" data-pfs-act="open-volume" data-testid="vr-audio-vol-btn" aria-label="Room volume" title="Volume">🎚️</button>
            <button type="button" class="pfs-aud-btn queue" data-pfs-act="open-audio-queue" data-testid="vr-audio-queue-btn" aria-label="Open audio playlist queue" title="Playlist queue">☰${queue.length ? `<span>${queue.length}</span>` : ''}</button>
            <button type="button" class="pfs-aud-btn add" data-pfs-act="open-music" data-testid="vr-add-song-btn" aria-label="Add song">+ Song</button>
          </div>
        </div>
        <div class="pfs-audio-prog-row" data-testid="vr-audio-progress-row">
          <input type="range" class="pfs-audio-scrub" data-audio-scrub data-testid="vr-audio-scrubber" min="0" max="${durMax}" value="${curVal}" step="1" aria-label="Song playback progress">
          <span class="pfs-audio-time tabular-nums" data-audio-time data-testid="vr-audio-time">${esc(timeText)}</span>
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

      const now = Date.now();
      rm.mode = targetModeId;
      rm.mediaPlayMode = targetModeId === 'video' ? 'video' : 'audio';
      rm.modeUpdatedAt = now;
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
            <button type="button" class="rmd-fn-item" data-rmd-fn="level" data-testid="rmd-fn-level"><span>📈</span><em>Level &amp; Perks</em></button>
            <button type="button" class="rmd-fn-item" data-rmd-fn="backgrounds" data-testid="rmd-fn-backgrounds"><span>🎨</span><em>Backgrounds</em></button>
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
      if (fn === 'level') {
        m.close();
        openPartyRoomInfoModal(cur, 'perks');
      } else if (fn === 'backgrounds') {
        m.close();
        openPartyRoomInfoModal(cur, 'backgrounds');
      } else if (fn === 'invite') {
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
    const ownerInfo = idx === 0 && prr && typeof prr.getRoomOwnerDisplayInfo === 'function'
      ? prr.getRoomOwnerDisplayInfo(rm, Date.now(), prr.DEFAULT_STALE_MS)
      : null;
    const displayHeadUser = s || (idx === 0 && ownerInfo ? { name: ownerInfo.name, avatar: ownerInfo.avatar, frame: 'none' } : null);
    const seatLabel = idx === 0
      ? (ownerInfo && !ownerInfo.online ? 'Room Owner · Offline' : 'Owner Stage · Mic #1')
      : (idx === 1 && rm.partnerSeat ? '💞 Partner Seat · Mic #2' : (idx < 4 ? `Seat ${idx} · Mic #${idx + 1}` : `Seat ${idx} · Listener`));

    const m = modal(displayHeadUser ? esc(displayHeadUser.name) : `Seat ${idx}`, `
      <div class="sas-shell" data-testid="vr-seat-action-sheet" data-seat-target="${idx}">
        <div class="sas-head">
          ${displayHeadUser ? av({ avatar: displayHeadUser.avatar, frame: idx === 0 ? 'none' : (displayHeadUser.frame || 'none') }, 44) : `<div class="sas-empty-ico">${plan.isLocked ? '🔒' : '💺'}</div>`}
          <div class="sas-meta">
            <b>${displayHeadUser ? esc(displayHeadUser.name) : (plan.isLocked ? `Seat ${idx} (Closed)` : `Seat ${idx} (Open)`)}</b>
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

  /* ===== 4. Room Info, Level Progress, Perks & Lag-Free Backgrounds ===== */
  function compressCustomBgImageFile(file) {
    return new Promise((resolve, reject) => {
      if (!file || !file.type || !file.type.startsWith('image/')) {
        return reject(new Error('Please choose an image file'));
      }
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Could not read image'));
      reader.onload = () => {
        const img = new Image();
        img.onerror = () => reject(new Error('Unsupported image format'));
        img.onload = () => {
          const maxDim = 960;
          let w = img.naturalWidth || img.width || 640;
          let h = img.naturalHeight || img.height || 960;
          if (w > maxDim || h > maxDim) {
            const ratio = Math.min(maxDim / w, maxDim / h);
            w = Math.max(160, Math.round(w * ratio));
            h = Math.max(160, Math.round(h * ratio));
          }
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (!ctx) return reject(new Error('Canvas unavailable'));
          ctx.drawImage(img, 0, 0, w, h);
          try {
            const dataUrl = canvas.toDataURL('image/jpeg', 0.72);
            resolve(dataUrl);
          } catch {
            reject(new Error('Could not process image'));
          }
        };
        img.src = String(reader.result || '');
      };
      reader.readAsDataURL(file);
    });
  }

  function openRoomRulesEditModal(rm) {
    if (!rm) return;
    if (!assertRoomPerm(rm, 'edit_settings')) return;
    const prr = typeof PRR === 'function' ? PRR() : null;
    const live = partyRooms.find(r => r && r.id === rm.id) || rm;
    const curRules = prr && typeof prr.normalizeRoomRulesText === 'function'
      ? prr.normalizeRoomRulesText(live.roomRules)
      : (live.roomRules || 'Be respectful on mic · Keep chat friendly & spam-free · Follow Room Owner & Admin guidelines.');
    const m = modal('Edit Room Rules', `
      <div class="rlv-rules-edit" data-testid="vr-rules-edit-modal">
        <label for="rlvRulesInput">Room Rules (visible to everyone inside the room)</label>
        <textarea id="rlvRulesInput" rows="4" maxlength="280" data-testid="vr-rules-textarea">${esc(curRules)}</textarea>
        <div class="rlv-rules-edit-acts">
          <button type="button" class="btn ghost full" id="rlvRulesCancel">Cancel</button>
          <button type="button" class="btn gold full" id="rlvRulesSave" data-testid="vr-rules-save-btn">Save Rules</button>
        </div>
      </div>
    `, 'rlv-modal');
    $('#rlvRulesCancel', m).onclick = () => m.close();
    $('#rlvRulesSave', m).onclick = () => {
      if (!assertRoomPerm(live, 'edit_settings')) return;
      const cur = partyRooms.find(r => r && r.id === rm.id) || rm;
      const raw = $('#rlvRulesInput', m)?.value || '';
      const nextRules = prr && typeof prr.normalizeRoomRulesText === 'function'
        ? prr.normalizeRoomRulesText(raw)
        : (raw.trim().slice(0, 280) || curRules);
      cur.roomRules = nextRules;
      logRoomOperation(cur, 'Updated Room Rules', nextRules.slice(0, 60));
      if (cur.isOwnedRoom && typeof syncOwnedRoomProfileSnapshot === 'function') syncOwnedRoomProfileSnapshot(cur);
      persistPartyRoom(cur);
      toast('Room Rules updated');
      m.close();
    };
  }

  function openPartyRoomInfoModal(rm, initialTab) {
    if (!rm) return;
    const prr = typeof PRR === 'function' ? PRR() : null;
    const rules = PRE();
    let activeTab = ['overview', 'perks', 'backgrounds'].includes(initialTab) ? initialTab : 'overview';

    const m = modal('Room Overview & Level', `
      <div class="ri-shell rlv-shell" data-testid="vr-room-info-modal">
        <div class="rlv-tabs" role="tablist" aria-label="Room details sections">
          <button type="button" class="rlv-tab ${activeTab === 'overview' ? 'active' : ''}" role="tab" aria-selected="${activeTab === 'overview'}" data-rlv-tab="overview" data-testid="rlv-tab-overview">Overview</button>
          <button type="button" class="rlv-tab ${activeTab === 'perks' ? 'active' : ''}" role="tab" aria-selected="${activeTab === 'perks'}" data-rlv-tab="perks" data-testid="rlv-tab-perks">Level &amp; Perks</button>
          <button type="button" class="rlv-tab ${activeTab === 'backgrounds' ? 'active' : ''}" role="tab" aria-selected="${activeTab === 'backgrounds'}" data-rlv-tab="backgrounds" data-testid="rlv-tab-backgrounds">Backgrounds</button>
        </div>
        <div id="rlvBody" class="rlv-body"></div>
      </div>
    `, 'ri-modal rlv-modal');

    function getLive() {
      return partyRooms.find(r => r && r.id === rm.id) || rm;
    }

    function renderExpCard(live, lvSum) {
      return `
        <div class="rlv-exp-card" data-testid="rlv-exp-card">
          <div class="rlv-exp-top">
            <div class="rlv-exp-title">
              <span class="rlv-lv-badge tabular-nums" data-testid="rlv-current-level">Lv.${lvSum.level}</span>
              <div>
                <b>${esc(lvSum.tierName || 'Starter Stage')}</b>
                <small>${live.isOwnedRoom ? 'Permanent Owned Room · Perks Active' : 'Earn Room XP from stays, chat &amp; gifts'}</small>
              </div>
            </div>
            <span class="rlv-exp-nums tabular-nums" data-testid="rlv-exp-text">${lvSum.levelXp} / ${lvSum.nextLevelXp} XP</span>
          </div>
          <div class="rlv-bar-track" role="progressbar" aria-valuenow="${lvSum.progressPct}" aria-valuemin="0" aria-valuemax="100">
            <div class="rlv-bar-fill" style="width:${lvSum.progressPct}%"></div>
          </div>
        </div>
      `;
    }

    function renderTab() {
      const live = getLive();
      const body = $('#rlvBody', m);
      if (!body) return;
      $$('[data-rlv-tab]', m).forEach(btn => {
        const on = btn.dataset.rlvTab === activeTab;
        btn.classList.toggle('active', on);
        btn.setAttribute('aria-selected', on ? 'true' : 'false');
      });

      const settings = rules ? rules.normalizeRoomSettings(live) : { region: 'India' };
      const cov = (typeof PARTY_COVERS !== 'undefined' && PARTY_COVERS[live.cover]) || { name: 'Room Cover', bg: 'linear-gradient(135deg,#0ea5e9,#6366f1)', glyph: '✦' };
      const activeMembers = prr ? prr.getOrderedActiveMembers(live, Date.now(), prr.DEFAULT_STALE_MS) : Object.values(live.members || {});
      const admins = prr ? prr.getRoomAdmins(live) : (live.admins || []);
      const followers = Array.isArray(live.followers) ? live.followers : [];
      const isFollowing = followers.some(f => f && f.uid === uid);
      const amAdmin = canModerateRoom(live);
      const lvSum = prr && typeof prr.getRoomLevelSummary === 'function'
        ? prr.getRoomLevelSummary(live)
        : {
            level: 1, xp: Number(live.roomXp || 0), levelXp: 0, nextLevelXp: 100, progressPct: 0,
            tierName: 'Starter Stage', maxAdmins: 3, isOwnedRoom: Boolean(live.isOwnedRoom), perks: []
          };

      if (activeTab === 'overview') {
        const ownerInfo = prr && typeof prr.getRoomOwnerDisplayInfo === 'function'
          ? prr.getRoomOwnerDisplayInfo(live, Date.now(), prr.DEFAULT_STALE_MS)
          : null;
        const rows = [];
        if (ownerInfo && ownerInfo.uid && !activeMembers.some(mb => mb && mb.uid === ownerInfo.uid)) {
          rows.push({
            uid: ownerInfo.uid,
            name: ownerInfo.name,
            avatar: ownerInfo.avatar,
            frame: 'none',
            seatIdx: null,
            offlineOwner: true
          });
        }
        activeMembers.forEach(mb => rows.push(mb));
        const roomRulesTxt = prr && typeof prr.normalizeRoomRulesText === 'function'
          ? prr.normalizeRoomRulesText(live.roomRules)
          : (live.roomRules || 'Be respectful on mic · Keep chat friendly & spam-free · Follow Room Owner & Admin guidelines.');

        body.innerHTML = `
          <div class="ri-hero">
            <div class="ri-cover" style="background:${cov.bg}" aria-hidden="true">${cov.glyph}</div>
            <div class="ri-hero-meta">
              <b class="ri-title" data-testid="ri-title">${esc(live.title)}</b>
              <div class="ri-id-line">
                <span class="tabular-nums">ID ${esc(live.fixedId || live.shortId)}</span>
                <button type="button" class="ri-copy-btn" id="riCopyId" aria-label="Copy Room ID">Copy</button>
              </div>
              <div class="ri-meta-line">
                <span>${esc(live.tag || 'Friends')}</span>
                <span aria-hidden="true">·</span>
                <span>${live.isOwnedRoom ? 'Permanent Owned Room' : 'Normal Room'}</span>
                <span aria-hidden="true">·</span>
                <span class="tabular-nums">Lv.${lvSum.level}</span>
              </div>
            </div>
          </div>

          ${renderExpCard(live, lvSum)}

          <div class="ri-stats-grid" data-testid="ri-stats-grid">
            <div class="ri-stat"><b class="tabular-nums" data-testid="ri-online-cnt">${Math.max(1, activeMembers.length)}</b><small>Online</small></div>
            <div class="ri-stat"><b class="tabular-nums">${Math.max(activeMembers.length, Object.keys(live.members || {}).length)}</b><small>Members</small></div>
            <div class="ri-stat"><b class="tabular-nums" id="riFansCnt">${followers.length}</b><small>Fans</small></div>
            <div class="ri-stat"><b>${esc(settings.region)}</b><small>Region</small></div>
          </div>

          <div class="ri-announce">
            <div class="ri-sec-hdr">
              <small class="ri-sec-lbl">Room Rules</small>
              ${amAdmin ? '<button type="button" class="ri-copy-btn" id="riEditRulesBtn">Edit</button>' : ''}
            </div>
            <p>${esc(roomRulesTxt)}</p>
          </div>

          <div class="ri-members-sec">
            <div class="ri-sec-hdr">
              <small class="ri-sec-lbl">Owner &amp; Admins</small>
              <small class="tabular-nums">${admins.length}/${lvSum.maxAdmins || 3} Admins</small>
            </div>
            <div class="ri-member-list">
              ${rows.map(mb => {
                const isOwn = isSingleOwner(live, mb.uid);
                const isAdm = !isOwn && admins.includes(mb.uid);
                const avUser = isOwn ? { avatar: mb.avatar || 'av_b1', frame: 'none' } : mb;
                const subTxt = isOwn
                  ? (mb.offlineOwner ? 'Offline · Permanent Owner' : (mb.seatIdx != null ? `Online · Seat ${mb.seatIdx}` : 'Online · Owner'))
                  : (mb.seatIdx != null ? `Seat ${mb.seatIdx}` : 'Listener');
                return `<div class="ri-member-row ${isOwn ? 'is-owner-row' : ''}">
                  ${av(avUser, 34)}
                  <div class="ri-m-info">
                    <b>${esc(mb.name)}</b>
                    <small>${esc(subTxt)}</small>
                  </div>
                  ${isOwn ? '<span class="pfs-owner-tag" data-testid="ri-owner-badge">OWNER</span>' : (isAdm ? '<span class="pfs-role-chip admin" data-testid="ri-admin-badge">ADMIN</span>' : '<span class="ri-m-role">Member</span>')}
                </div>`;
              }).join('') || '<div class="mp-empty">No active members</div>'}
            </div>
          </div>

          <div class="ri-footer-acts">
            <button type="button" class="btn ${isFollowing ? 'gold' : 'ok'} full" id="riFollowBtn" data-testid="ri-follow-btn">${isFollowing ? 'Following Room' : '+ Follow Room'}</button>
            <button type="button" class="btn ghost full" id="riSettingsBtn" data-testid="ri-open-settings-btn">Room Settings</button>
          </div>
        `;
      } else if (activeTab === 'perks') {
        const tableRows = Array.isArray(lvSum.perks) && lvSum.perks.length
          ? lvSum.perks
          : (prr && Array.isArray(prr.ROOM_LEVEL_PERKS_TABLE) ? prr.ROOM_LEVEL_PERKS_TABLE : []);
        const isBoosted = Number(live.boostedUntil || 0) > Date.now();
        body.innerHTML = `
          <div class="rlv-perks-view" data-testid="vr-level-perks-tab">
            ${renderExpCard(live, lvSum)}

            <div class="rlv-quick-strip">
              <div class="rlv-q-item">
                <small>Admins Limit</small>
                <b class="tabular-nums">${admins.length} / ${lvSum.maxAdmins || 3}</b>
              </div>
              <div class="rlv-q-item">
                <small>Partner Seat</small>
                <b>${live.partnerSeat ? 'Active' : 'Seat 1 Ready'}</b>
              </div>
              <div class="rlv-q-item">
                <small>Lobby Boost</small>
                <b>${isBoosted ? 'Active' : 'Ready'}</b>
              </div>
            </div>

            <div class="rlv-table-wrap">
              <div class="rlv-table-head">
                <span>Level</span>
                <span>Level-Up Perks &amp; Room Backgrounds</span>
                <span>Status</span>
              </div>
              ${tableRows.map(row => {
                const unlocked = Boolean(row.unlocked);
                return `<div class="rlv-table-row ${unlocked ? 'is-unlocked' : 'is-locked'}" data-testid="rlv-perk-lv-${row.level}">
                  <div class="rlv-t-lv">
                    <b class="tabular-nums">Lv.${row.level}</b>
                    <small class="tabular-nums">${row.xpRequired} XP</small>
                  </div>
                  <div class="rlv-t-desc">
                    <b>${esc(row.perkTitle)}</b>
                    <small>${esc(row.perkDetail)}</small>
                  </div>
                  <div class="rlv-t-stat">
                    ${unlocked
                      ? `<button type="button" class="rlv-status-chip unlocked" data-rlv-jump-bg="${esc(row.bgId)}">${row.unlockedByOwned ? 'Owned' : 'Active'}</button>`
                      : `<span class="rlv-status-chip locked tabular-nums">Lv.${row.level}</span>`
                    }
                  </div>
                </div>`;
              }).join('')}
            </div>

            <div class="ri-footer-acts">
              <button type="button" class="btn gold full" data-rlv-switch="backgrounds" data-testid="rlv-go-bg-btn">Choose Room Background</button>
              <button type="button" class="btn ghost full" id="rlvOpenAdvBtn">Manage Admins &amp; Mic</button>
            </div>
          </div>
        `;
      } else if (activeTab === 'backgrounds') {
        const themeList = (prr && Array.isArray(prr.ROOM_THEMES))
          ? prr.ROOM_THEMES
          : [
              { id: 'default', name: 'Default', desc: 'Balanced twilight indigo studio.', swatch: 'linear-gradient(145deg,#1b2540,#26355c,#192238)' },
              { id: 'dark', name: 'Dark', desc: 'Sleek midnight slate surface.', swatch: 'linear-gradient(145deg,#0b101b,#131c2e,#090d16)' },
              { id: 'light', name: 'Light', desc: 'Soft sky-lavender daylight tint.', swatch: 'linear-gradient(145deg,#d7e7fb,#e6edfc,#dbe5f8)' },
              { id: 'gradient', name: 'Gradient', desc: 'Luminous violet-aurora gradient.', swatch: 'linear-gradient(145deg,#312e81,#5b21b6,#0f4c81)' }
            ];
        const activeThemeId = typeof getEffectiveRoomTheme === 'function' ? getEffectiveRoomTheme(live) : (live.roomTheme || 'default');
        const activeThemeObj = themeList.find(t => t.id === activeThemeId) || themeList[0];

        const bgList = (prr && Array.isArray(prr.ROOM_BACKGROUNDS))
          ? prr.ROOM_BACKGROUNDS
          : Object.values(PARTY_BG_META || {});
        const activeBgId = live.background || 'club';
        const customGate = prr && typeof prr.canSelectRoomBackground === 'function'
          ? prr.canSelectRoomBackground(live, 'custom')
          : { allowed: true, minLevel: 5 };

        body.innerHTML = `
          <div class="rlv-bg-view" data-testid="vr-backgrounds-tab">
            <div class="rlv-bg-head">
              <div>
                <b>Room Theme Style</b>
                <small>Switch instantly between Default, Dark, Light &amp; Gradient</small>
              </div>
              <span class="rlv-active-pill" data-testid="rlv-active-theme-name">${esc(activeThemeObj.name)}</span>
            </div>

            <div class="rlv-theme-grid" data-testid="rlv-theme-grid">
              ${themeList.map(th => {
                const isOn = activeThemeId === th.id;
                return `<button type="button" class="rlv-theme-card ${isOn ? 'selected' : ''}" data-rlv-theme="${esc(th.id)}" data-testid="rlv-theme-${esc(th.id)}">
                  <span class="rlv-theme-swatch" style="background:${th.swatch}">
                    <span class="rlv-theme-dot">${isOn ? '✓' : ''}</span>
                  </span>
                  <span class="rlv-theme-meta">
                    <b>${esc(th.name)}</b>
                    <small>${esc(th.desc)}</small>
                  </span>
                </button>`;
              }).join('')}
            </div>

            <div class="rlv-bg-head" style="margin-top:4px">
              <div>
                <b>Room Background</b>
                <small>Instant zero-lag backdrop switch · ${amAdmin ? 'Tap any unlocked scene to apply' : 'Owner &amp; Admins can change scene'}</small>
              </div>
              <span class="rlv-active-pill" data-testid="rlv-active-bg-name">${esc((PARTY_BG_META[activeBgId] && PARTY_BG_META[activeBgId].name) || activeBgId)}</span>
            </div>

            <div class="rlv-bg-grid" data-testid="rlv-bg-grid">
              ${bgList.map(bg => {
                const gate = prr && typeof prr.canSelectRoomBackground === 'function'
                  ? prr.canSelectRoomBackground(live, bg.id)
                  : { allowed: true, minLevel: bg.minLevel || 1 };
                const isSel = activeBgId === bg.id;
                const previewBg = bg.id === 'custom' && live.customBackgroundUrl
                  ? `linear-gradient(180deg, rgba(7,11,20,.5), rgba(7,10,18,.78)), url("${esc(live.customBackgroundUrl)}") center / cover no-repeat`
                  : (activeThemeId === 'light' && bg.lightCss ? bg.lightCss : bg.css);
                return `<button type="button" class="rlv-bg-card ${isSel ? 'selected' : ''} ${gate.allowed ? '' : 'locked'}" data-rlv-bg="${esc(bg.id)}" data-testid="rlv-bg-${esc(bg.id)}" ${!amAdmin ? 'disabled' : ''}>
                  <div class="rlv-bg-swatch" style="background:${previewBg}">
                    <span class="rlv-bg-lv tabular-nums">${gate.allowed ? (isSel ? 'Active' : `Lv.${bg.minLevel || 1}`) : `🔒 Lv.${bg.minLevel || 1}`}</span>
                  </div>
                  <div class="rlv-bg-meta">
                    <b>${esc(bg.name)}</b>
                    <small>${esc(bg.desc || bg.category || 'Room Theme')}</small>
                  </div>
                </button>`;
              }).join('')}
            </div>

            <div class="rlv-custom-box" data-testid="rlv-custom-bg-box">
              <div class="rlv-custom-head">
                <b>Custom background</b>
                <small class="tabular-nums">${customGate.allowed ? 'Unlocked' : `Unlocks at Lv.${customGate.minLevel} or Owned Room`}</small>
              </div>
              <div class="rlv-custom-row">
                <input id="rlvCustomUrlIn" type="url" placeholder="Paste https:// image URL..." value="${esc(live.customBackgroundUrl || '')}" ${amAdmin && customGate.allowed ? '' : 'disabled'} data-testid="rlv-custom-url-input">
                <button type="button" class="btn sm gold" id="rlvApplyCustomBtn" ${amAdmin && customGate.allowed ? '' : 'disabled'} data-testid="rlv-apply-custom-btn">Apply</button>
              </div>
              <div class="rlv-custom-upload">
                <label class="btn sm ghost ${amAdmin && customGate.allowed ? '' : 'disabled'}" for="rlvCustomFileIn">Upload Image</label>
                <input id="rlvCustomFileIn" type="file" accept="image/*" hidden ${amAdmin && customGate.allowed ? '' : 'disabled'}>
                <small>Auto-compressed locally for zero-lag loading</small>
              </div>
            </div>
          </div>
        `;
      }
    }

    m.addEventListener('click', (e) => {
      const tabBtn = e.target.closest('[data-rlv-tab]');
      if (tabBtn && tabBtn.dataset.rlvTab) {
        activeTab = tabBtn.dataset.rlvTab;
        renderTab();
        return;
      }
      const swBtn = e.target.closest('[data-rlv-switch]');
      if (swBtn && swBtn.dataset.rlvSwitch) {
        activeTab = swBtn.dataset.rlvSwitch;
        renderTab();
        return;
      }
      const jumpBg = e.target.closest('[data-rlv-jump-bg]');
      if (jumpBg) {
        activeTab = 'backgrounds';
        renderTab();
        return;
      }

      const themeBtn = e.target.closest('[data-rlv-theme]');
      if (themeBtn && themeBtn.dataset.rlvTheme) {
        const cur = getLive();
        const thId = themeBtn.dataset.rlvTheme;
        const res = typeof applyRoomThemeInPlace === 'function'
          ? applyRoomThemeInPlace(cur, thId)
          : { ok: false };
        if (res && res.ok) {
          $$('[data-rlv-theme]', m).forEach(b => {
            const on = b.dataset.rlvTheme === res.theme;
            b.classList.toggle('selected', on);
            const dot = b.querySelector('.rlv-theme-dot');
            if (dot) dot.textContent = on ? '✓' : '';
          });
          const label = res.theme.charAt(0).toUpperCase() + res.theme.slice(1);
          const pill = $('[data-testid="rlv-active-theme-name"]', m);
          if (pill) pill.textContent = label;
          toast(`Theme: ${label}`);
        }
        return;
      }

      const bgBtn = e.target.closest('[data-rlv-bg]');
      if (bgBtn && bgBtn.dataset.rlvBg) {
        const cur = getLive();
        const bgId = bgBtn.dataset.rlvBg;
        if (bgId === 'custom') {
          const urlIn = $('#rlvCustomUrlIn', m);
          const customVal = (urlIn && urlIn.value.trim()) || cur.customBackgroundUrl || '';
          const res = typeof applyRoomBackgroundInPlace === 'function'
            ? applyRoomBackgroundInPlace(cur, 'custom', customVal)
            : { ok: false };
          if (res && res.ok) {
            $$('[data-rlv-bg]', m).forEach(b => b.classList.toggle('selected', b.dataset.rlvBg === 'custom'));
            const pill = $('[data-testid="rlv-active-bg-name"]', m);
            if (pill) pill.textContent = 'Custom background';
            toast('Custom background applied');
          }
          return;
        }
        const res = typeof applyRoomBackgroundInPlace === 'function'
          ? applyRoomBackgroundInPlace(cur, bgId)
          : { ok: false };
        if (res && res.ok) {
          $$('[data-rlv-bg]', m).forEach(b => {
            const on = b.dataset.rlvBg === bgId;
            b.classList.toggle('selected', on);
            const tag = b.querySelector('.rlv-bg-lv');
            if (tag && !b.classList.contains('locked')) {
              const info = PARTY_BG_META[b.dataset.rlvBg];
              tag.textContent = on ? 'Active' : `Lv.${(info && info.minLevel) || 1}`;
            }
          });
          const pill = $('[data-testid="rlv-active-bg-name"]', m);
          if (pill) pill.textContent = res.name || bgId;
          toast(`Background: ${res.name || bgId}`);
        }
        return;
      }

      if (e.target.closest('#rlvApplyCustomBtn')) {
        const cur = getLive();
        const urlVal = ($('#rlvCustomUrlIn', m)?.value || '').trim();
        const res = typeof applyRoomBackgroundInPlace === 'function'
          ? applyRoomBackgroundInPlace(cur, 'custom', urlVal)
          : { ok: false };
        if (res && res.ok) {
          toast('Custom background applied');
          renderTab();
        }
        return;
      }

      if (e.target.closest('#riCopyId')) {
        const cur = getLive();
        const idVal = String(cur.fixedId || cur.shortId);
        if (typeof copyTextClean === 'function') copyTextClean(idVal, 'Room ID');
        else toast(`Room ID: ${idVal}`);
        return;
      }

      if (e.target.closest('#riEditRulesBtn')) {
        const cur = getLive();
        m.close();
        openRoomRulesEditModal(cur);
        return;
      }

      if (e.target.closest('#rlvOpenAdvBtn')) {
        const cur = getLive();
        m.close();
        if (typeof openPartyAdvancedPanel === 'function') openPartyAdvancedPanel(cur, 'admins');
        return;
      }

      if (e.target.closest('#riFollowBtn')) {
        const cur = getLive();
        const res = prr && typeof prr.toggleRoomFollower === 'function' ? prr.toggleRoomFollower(cur, uid, me.name || 'Player') : null;
        if (res && res.ok) {
          cur.followers = res.followers;
          if (res.xpDelta) cur.roomXp = Number(cur.roomXp || 0) + res.xpDelta;
          if (res.following) trackRoomDailyEvent('task_follow');
          if (cur.isOwnedRoom && typeof syncOwnedRoomProfileSnapshot === 'function') syncOwnedRoomProfileSnapshot(cur);
          persistPartyRoom(cur);
          toast(res.following ? 'Following this room' : 'Unfollowed room');
          renderTab();
        }
        return;
      }

      if (e.target.closest('#riSettingsBtn')) {
        const cur = getLive();
        m.close();
        openPartyFullSettingsModal(cur);
      }
    });

    m.addEventListener('change', async (e) => {
      const fileIn = e.target.closest('#rlvCustomFileIn');
      if (!fileIn || !fileIn.files || !fileIn.files[0]) return;
      const cur = getLive();
      try {
        const dataUrl = await compressCustomBgImageFile(fileIn.files[0]);
        const res = typeof applyRoomBackgroundInPlace === 'function'
          ? applyRoomBackgroundInPlace(cur, 'custom', dataUrl)
          : { ok: false };
        if (res && res.ok) {
          toast('Custom background uploaded');
          renderTab();
        }
      } catch (err) {
        toast((err && err.message) || 'Could not load image');
      }
    });

    renderTab();
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
    const prrMod = typeof PRR === 'function' ? PRR() : null;
    const themeOptions = (prrMod && Array.isArray(prrMod.ROOM_THEMES))
      ? prrMod.ROOM_THEMES
      : [
          { id: 'default', name: 'Default', swatch: 'linear-gradient(145deg,#1b2540,#26355c)' },
          { id: 'dark', name: 'Dark', swatch: 'linear-gradient(145deg,#0b101b,#131c2e)' },
          { id: 'light', name: 'Light', swatch: 'linear-gradient(145deg,#d7e7fb,#e6edfc)' },
          { id: 'gradient', name: 'Gradient', swatch: 'linear-gradient(145deg,#312e81,#5b21b6,#0f4c81)' }
        ];
    let pickedTheme = typeof getEffectiveRoomTheme === 'function' ? getEffectiveRoomTheme(live) : (s.roomTheme || 'default');

    const m = modal('⚙️ Room Settings', `
      <div class="rset-shell" data-testid="vr-full-settings-modal">
        ${!amAdmin ? '<div class="advp-lock-note">🔒 Read-only room config · You can still switch your Room Theme below.</div>' : ''}

        <div class="rset-theme-box" data-testid="rset-theme-box">
          <div class="rset-theme-head">
            <b>Room Theme</b>
            <small>Default · Dark · Light · Gradient</small>
          </div>
          <div class="rset-theme-pills">
            ${themeOptions.map(th => `
              <button type="button" class="rset-theme-pill ${pickedTheme === th.id ? 'active' : ''}" data-rset-theme="${esc(th.id)}" data-testid="rset-theme-${esc(th.id)}">
                <span class="rset-theme-dot" style="background:${th.swatch}" aria-hidden="true"></span>
                <span>${esc(th.name)}</span>
              </button>
            `).join('')}
          </div>
        </div>

        <div class="rset-group">
          <label for="rsetTitle">Title</label>
          <input id="rsetTitle" maxlength="36" value="${esc(live.title)}" ${dis} data-testid="rset-title">

          <label for="rsetRules" style="margin-top:8px">Room Rules</label>
          <textarea id="rsetRules" rows="2" maxlength="280" ${dis} data-testid="rset-rules">${esc(s.roomRules || live.roomRules || '')}</textarea>

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
    $$('[data-rset-theme]', m).forEach(btn => {
      btn.onclick = () => {
        pickedTheme = btn.dataset.rsetTheme || 'default';
        $$('[data-rset-theme]', m).forEach(b => b.classList.toggle('active', b === btn));
        if (typeof applyRoomThemeInPlace === 'function') {
          applyRoomThemeInPlace(live, pickedTheme);
        }
        toast(`Theme: ${pickedTheme.charAt(0).toUpperCase() + pickedTheme.slice(1)}`);
      };
    });

    $('#rsetOpenBlocklist', m).onclick = () => openBlocklistModal(live);
    $('#rsetOpenOps', m).onclick = () => openOperationRecordModal(live);

    $('#rsetSaveBtn', m).onclick = () => {
      if (!assertRoomPerm(live, 'edit_settings')) return;
      const cur = partyRooms.find(r => r && r.id === rm.id) || rm;
      const prevBg = cur.background;
      const prevMode = cur.mode;
      cur.roomTheme = pickedTheme || cur.roomTheme || 'default';
      if (typeof applyRoomThemeInPlace === 'function') {
        applyRoomThemeInPlace(cur, cur.roomTheme, { persistRoom: false });
      }
      const actor = (typeof me !== 'undefined' && me && me.name) || 'Admin';
      const nextTitle = ($('#rsetTitle', m)?.value || '').trim().slice(0, 36);
      if (nextTitle) cur.title = nextTitle;
      const prrMod = typeof PRR === 'function' ? PRR() : null;
      const rawRules = $('#rsetRules', m)?.value;
      if (rawRules != null) {
        cur.roomRules = prrMod && typeof prrMod.normalizeRoomRulesText === 'function'
          ? prrMod.normalizeRoomRulesText(rawRules)
          : (rawRules.trim().slice(0, 280) || cur.roomRules);
      }
      cur.announcement = ($('#rsetAnnounce', m)?.value || '').trim().slice(0, 160) || cur.announcement;
      cur.cover = $('#rsetCover', m)?.value || cur.cover;
      const pickedBg = $('#rsetBg', m)?.value || cur.background;
      if (pickedBg !== prevBg && typeof applyRoomBackgroundInPlace === 'function') {
        const bgRes = applyRoomBackgroundInPlace(cur, pickedBg);
        if (!bgRes || !bgRes.ok) cur.background = prevBg;
      } else {
        cur.background = pickedBg;
      }
      const nextMode = $('#rsetMode', m)?.value || cur.mode;
      if (nextMode !== prevMode) {
        if (window.PartyModeStages && typeof window.PartyModeStages.onModeWillChange === 'function') {
          window.PartyModeStages.onModeWillChange(prevMode, nextMode);
        }
        const mNow = Date.now();
        cur.mode = nextMode;
        cur.mediaPlayMode = nextMode === 'video' ? 'video' : 'audio';
        cur.modeUpdatedAt = mNow;
        cur.chat = [...(cur.chat || []), {
          id: 'smode_' + mNow.toString(36),
          type: 'sys',
          text: `🔄 ${actor} changed the mode from ${PARTY_MODES_META[prevMode]?.name || prevMode} to ${PARTY_MODES_META[nextMode]?.name || nextMode}`,
          ts: mNow
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

  /* ===== 6. Daily Task Treasure Boxes Modal (WePlay 2-Row Layout: 5 Free + 2 VIP) ===== */
  function grantDailyChestGiftReward(gift, xp, liveRoom) {
    if (!gift || typeof me === 'undefined' || !me) return;
    const charmGain = Math.max(1, Math.floor(Number(gift.charm || 1)));
    me.giftWallet = me.giftWallet && typeof me.giftWallet === 'object' ? me.giftWallet : {};
    const prevQty = Number(me.giftWallet[gift.id] || 0);
    me.giftWallet[gift.id] = typeof clampSafeInt === 'function'
      ? clampSafeInt(prevQty + 1, 0, typeof MAX_COINS !== 'undefined' ? MAX_COINS : 999999999)
      : (prevQty + 1);
    const prevCharm = Number(me.charm || 0);
    me.charm = typeof clampSafeInt === 'function'
      ? clampSafeInt(prevCharm + charmGain, 0, typeof MAX_COINS !== 'undefined' ? MAX_COINS : 999999999)
      : (prevCharm + charmGain);
    if (xp > 0 && typeof addReward === 'function') {
      addReward(0, xp, null, false, { silentSfx: true });
    } else if (typeof saveMe === 'function') {
      saveMe();
    }
    if (typeof saveMe === 'function') saveMe();
    if (typeof updateHud === 'function') updateHud();
    if (typeof patchUser === 'function' && typeof base === 'function' && typeof uid !== 'undefined') {
      patchUser(uid, { ...base(), charm: me.charm, giftWallet: me.giftWallet });
    }
    if (typeof dbOp === 'function' && typeof F !== 'undefined' && typeof userRef === 'function' && typeof base === 'function' && typeof uid !== 'undefined') {
      dbOp(() => F.setDoc(userRef(uid), { ...base(), charm: me.charm, giftWallet: me.giftWallet }, { merge: true }));
    }
    if (liveRoom) {
      liveRoom.roomXp = Number(liveRoom.roomXp || 0) + Math.max(0, Number(xp || 0));
      persistPartyRoom(liveRoom);
    }
    if (typeof playSfx === 'function') playSfx('chestOpen');
    if (typeof markTabsDirty === 'function') markTabsDirty('profile', 'ranking', 'home');
  }

  function renderChestGiftArtwork(gift, size) {
    const sz = size || 38;
    const catGift = typeof GIFT_BY_ID !== 'undefined' && gift && gift.id ? GIFT_BY_ID[gift.id] : null;
    if (catGift && typeof giftSvg === 'function') {
      return giftSvg(catGift, sz);
    }
    return `<span class="dt-won-emoji" aria-hidden="true">${esc((gift && gift.icon) || '🎁')}</span>`;
  }

  function openPartyDailyTasksModal(rm) {
    if (!rm) return;
    const rules = PRE();
    if (!rules) return;
    let tickIv = 0;
    let lastRewardReveal = null;
    let lastStatusSig = '';

    const m = modal('🧰 Daily Room Chests', `<div class="dt-shell dt-wp-shell" id="dtBody" data-testid="vr-daily-tasks-modal"></div>`, 'dt-modal');

    function renderChestSlotHtml(b) {
      const isVipBox = Boolean(b.vipOnly);
      const isClaimed = b.status === 'claimed';
      const isReady = b.status === 'claimable';
      const isLockedVip = b.status === 'locked_vip';
      const chestArt = (typeof GLOSSY_SVG !== 'undefined' && typeof GLOSSY_SVG.chest === 'function')
        ? GLOSSY_SVG.chest(b.tier || (isVipBox ? 'mythic' : 'bronze'))
        : `<span aria-hidden="true">${b.icon || '🎁'}</span>`;

      let pillText = '';
      if (isClaimed) pillText = 'Opened ✓';
      else if (isReady) pillText = 'OPEN';
      else if (isLockedVip) pillText = 'Locked';
      else pillText = fmtMmSs(b.displaySec);

      const topStageLabel = b.stageDurationSec ? `${Math.round(b.stageDurationSec / 60)}m` : 'Free';
      const subLine = isClaimed && b.wonGift
        ? `${b.wonGift.icon || '🎁'} +${b.wonGift.charm} Charm`
        : (isVipBox ? (b.row === 'bottom' ? '44–76 Charm' : '20–36 Charm') : b.shortTag);

      return `<button type="button" class="dt-wp-slot ${esc(b.status)} ${isVipBox ? 'vip-slot' : 'free-slot'}" data-dt-claim-box="${esc(b.id)}" data-status="${esc(b.status)}" data-testid="dt-box-${esc(b.id)}" aria-label="${esc(b.label)} ${esc(pillText)}" ${isClaimed ? 'disabled' : ''}>
        ${isVipBox ? `<span class="dt-vip-ribbon">VIP Only</span>` : `<span class="dt-free-tag">${esc(topStageLabel)}</span>`}
        <span class="dt-wp-chest-art ${isReady ? 'bounce' : ''}">${chestArt}</span>
        <span class="dt-wp-timer tabular-nums ${isReady ? 'ready' : ''}" data-dt-timer="${esc(b.id)}">${esc(pillText)}</span>
        <small class="dt-wp-sub">${esc(subLine)}</small>
      </button>`;
    }

    function renderDaily() {
      const live = partyRooms.find(r => r && r.id === rm.id) || rm;
      const ev = getRoomDailyEval(live);
      const body = $('#dtBody', m);
      if (!body || !ev) return;

      lastStatusSig = ev.boxes.map(b => `${b.id}:${b.status}`).join('|') + '||' + ev.tasks.map(t => `${t.id}:${t.status}`).join('|');
      const boostMin = Math.floor(Number(ev.state.speedBoostSec || 0) / 60);

      const revealHtml = lastRewardReveal ? `
        <div class="dt-reward-reveal" data-testid="dt-reward-reveal">
          <div class="dt-rev-art">${renderChestGiftArtwork(lastRewardReveal.gift, 44)}</div>
          <div class="dt-rev-copy">
            <small>${esc(lastRewardReveal.boxLabel)} Opened!</small>
            <b>${esc(lastRewardReveal.gift.name)} · +${lastRewardReveal.gift.charm} Charm</b>
            <span>Added to Gift Wallet · +${lastRewardReveal.xp} Room XP</span>
          </div>
          <button type="button" class="dt-rev-close" data-dt-close-reveal aria-label="Dismiss reward">✕</button>
        </div>
      ` : '';

      body.innerHTML = `
        <div class="dt-stay-bar">
          <div class="dt-stay-meta">
            <span>Room Stay Time</span>
            <b class="tabular-nums" data-dt-stay>${fmtMmSs(ev.state.staySec)}</b>
          </div>
          <div class="dt-stay-chips">
            ${boostMin > 0 ? `<span class="dt-boost-chip" data-testid="dt-boost-chip">⚡ -${boostMin}m Boost</span>` : ''}
            <span class="dt-tier-chip ${ev.isVip ? 'vip' : ''}">${ev.isVip ? '👑 VIP Active' : '🎁 Free Tier'}</span>
          </div>
        </div>

        ${revealHtml}

        <div class="dt-wp-section" data-testid="dt-row-top">
          <div class="dt-wp-row-hdr">
            <b>Top Row · 5m / 30m / 30m</b>
            <small>1 Charm · +1 VIP</small>
          </div>
          <div class="dt-wp-grid top-row">
            ${ev.topRowBoxes.map(renderChestSlotHtml).join('')}
          </div>
        </div>

        <div class="dt-wp-section" data-testid="dt-row-bottom">
          <div class="dt-wp-row-hdr">
            <b>Bottom Row · Bonus</b>
            <small>6 Charm · +1 VIP</small>
          </div>
          <div class="dt-wp-grid bottom-row">
            ${ev.bottomRowBoxes.map(renderChestSlotHtml).join('')}
          </div>
        </div>

        <div class="dt-sec-hdr">Quick Room Tasks · Cut Countdown (-5m each)</div>
        <div class="dt-task-list">
          ${ev.tasks.map(t => `
            <div class="dt-task-row ${esc(t.status)}" data-testid="dt-task-${esc(t.id)}">
              <div class="dt-task-left">
                <span class="dt-task-ico" aria-hidden="true">${t.icon}</span>
                <div>
                  <b>${esc(t.label)}</b>
                  <small>⏱ -${Math.round((t.speedUpSec || 300) / 60)}m Timer · +${t.coins} 🪙 · +${t.xp} XP</small>
                </div>
              </div>
              <button type="button" class="btn sm ${t.status === 'claimable' ? 'ok' : 'ghost'}" data-dt-claim-task="${esc(t.id)}" data-testid="dt-claim-task-${esc(t.id)}" ${t.status === 'claimed' ? 'disabled' : ''}>
                ${t.status === 'claimed' ? 'Done ✓' : (t.status === 'claimable' ? 'Speed Up' : 'Do Now')}
              </button>
            </div>
          `).join('')}
        </div>
      `;
    }

    function patchDailyTimersInPlace() {
      const live = partyRooms.find(r => r && r.id === rm.id) || rm;
      const ev = getRoomDailyEval(live);
      if (!ev) return;
      const nextSig = ev.boxes.map(b => `${b.id}:${b.status}`).join('|') + '||' + ev.tasks.map(t => `${t.id}:${t.status}`).join('|');
      if (nextSig !== lastStatusSig) {
        renderDaily();
        return;
      }
      const stayEl = $('[data-dt-stay]', m);
      if (stayEl) stayEl.textContent = fmtMmSs(ev.state.staySec);
      ev.boxes.forEach(b => {
        if (b.status === 'countdown' || b.status === 'queued') {
          const tEl = $(`[data-dt-timer="${b.id}"]`, m);
          if (tEl) tEl.textContent = fmtMmSs(b.displaySec);
        }
      });
    }

    m.addEventListener('click', (e) => {
      if (e.target.closest('[data-dt-close-reveal]')) {
        lastRewardReveal = null;
        renderDaily();
        return;
      }

      const live = partyRooms.find(r => r && r.id === rm.id) || rm;
      const boxBtn = e.target.closest('[data-dt-claim-box]');
      if (boxBtn) {
        const res = rules.claimDailyTaskBox(loadDailyTaskState(), boxBtn.dataset.dtClaimBox, {
          nowMs: Date.now(),
          roomStaySec: loadDailyTaskState().staySec,
          isVip: isDailyChestVipUser()
        });
        if (!res.ok) return toast(res.error || 'Not ready yet');
        saveDailyTaskState(res.state);
        grantDailyChestGiftReward(res.gift, res.xp, live);
        lastRewardReveal = { boxLabel: res.box.label, gift: res.gift, xp: res.xp };
        updateDailyBadgeDom();
        toast(`🎁 Won ${res.gift.name} (+${res.gift.charm} Charm)!`);
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
        const res = rules.claimDailyQuickTask(st, tid, { nowMs: Date.now(), isVip: isDailyChestVipUser() });
        if (!res.ok) return toast(res.error || 'Complete task first');
        saveDailyTaskState(res.state);
        if (typeof addReward === 'function') addReward(res.coins, res.xp, `${res.task.label} completed!`, true);
        live.roomXp = Number(live.roomXp || 0) + res.xp;
        persistPartyRoom(live);
        updateDailyBadgeDom();
        const minCut = Math.round((res.speedUpSec || 300) / 60);
        toast(`⚡ -${minCut}m Chest Timer Speed-Up & +${res.coins} 🪙!`);
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
      patchDailyTimersInPlace();
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
    openRoomRulesEditModal,
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
