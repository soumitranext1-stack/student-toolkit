"use strict";
/* =====================================================================
   COUPLE & BESTIE ARENA — INTERACTIVE DUO PARTY HUB
   · Pink-and-Gold Neon Glass Stage + Spotlights + Floating Hearts
   · Mode 1: Mind Sync (Dil Ki Dhadkan) — Secret Lock & 100% Sync Explosion
   · Mode 2: Truth, Dare ya Sweet Penalty — Interactive 3D Spinning Wheel
   · Mode 3: Who's Most Likely To? — Rapid Avatar Vote + Spotlight
   · Mode 4: Love & Vibe Meter — 5 Questions -> 0%–100% Heart Meter + Title
   · Floating EN / HI / BN Voice Bar · Exclusive Rewards Unlock
   ===================================================================== */

function launchCoupleArena(opts) {
  const SR = window.ShowGamesRules;
  if (!SR) return;
  const o = opts || {};
  let activeMode = o.subMode || 'mind_sync';
  const myUid = (typeof uid !== 'undefined' && uid) ? String(uid) : 'local_me';
  const myProfile = {
    uid: myUid,
    name: (typeof me !== 'undefined' && me.name) ? me.name : 'You',
    avatar: (typeof me !== 'undefined' && me.avatar) ? me.avatar : 'av_b1'
  };
  const ctrl = window.PvpSyncRules ? window.PvpSyncRules.resolve2PControl(o, myUid, myProfile) : null;
  const isLiveOnline = Boolean(ctrl && ctrl.isLiveOnline);
  const mySide = ctrl ? ctrl.mySide : 'p1';
  const oppSide = mySide === 'p1' ? 'p2' : 'p1';
  const roomId = String(o.roomId || (ctrl && ctrl.roomId) || '').trim();
  const roomCode = String(o.roomCode || (ctrl && ctrl.roomCode) || ('CP' + Math.floor(1000 + Math.random() * 9000))).toUpperCase();
  const p1Name = (ctrl && ctrl.p1Name) || myProfile.name;
  const p2Name = (ctrl && ctrl.p2Name) || o.rival?.name || 'Aria Nova';
  const p1User = (ctrl && ctrl.p1) ? { name: ctrl.p1Name, avatar: ctrl.p1Avatar || 'av_b1', frame: mySide === 'p1' ? (me?.frame || 'none') : 'fx_rose' } : ((typeof me !== 'undefined') ? me : { name: p1Name, avatar: 'av_b1', frame: 'none' });
  const p2User = (ctrl && ctrl.p2) ? { name: ctrl.p2Name, avatar: ctrl.p2Avatar || 'av_g2', frame: mySide === 'p2' ? (me?.frame || 'none') : 'fx_rose' } : (o.rival || { name: p2Name, avatar: 'av_g2', frame: 'fx_rose' });
  const matchStake = Math.max(0, Math.floor(Number(o.stake || 0)));
  const matchStakePaid = Boolean(o.stakeDeducted && matchStake > 0);
  let matchSettled = false;
  // HARD BLOCK: In a live invited partner room, NEVER allow AI Partner mode!
  let duoPlayMode = isLiveOnline ? 'live' : (o.modeType === 'invite' || o.modeType === 'pvp' ? 'pass' : 'bot'); // 'bot' | 'pass' | 'live'
  let liveSync = null;
  let onRemoteCoupleState = null;

  const settleCoupleOutcome = (won, tie, expWin) => {
    const activeStake = (matchStakePaid && !matchSettled) ? matchStake : 0;
    if (activeStake > 0) matchSettled = true;
    const res = SR.settleStrictGameReward({ stake: activeStake, won, tie, expWin: expWin || 25, expLose: 12 });
    if (typeof addReward === 'function') addReward(res.coinsDelta, res.expDelta, null, false, { silentSfx: true });
    if (res.coinsDelta > 0 && typeof playSfx === 'function') playSfx('coin', { amount: res.coinsDelta });
    return res;
  };

  if (typeof setMyLiveActivity === 'function') {
    setMyLiveActivity({ type: 'playing', gameId: 'couple_arena', gameName: 'Couple & Bestie Arena', roomCode, mode: activeMode });
  }

  let over = false;
  let wheelAngle = 0;
  let wheelSpinning = false;
  let dareTimerIv = 0;
  let wheelTickIv = 0;
  let wheelStopTimer = 0;

  const clearCoupleTimers = () => {
    clearInterval(dareTimerIv);
    dareTimerIv = 0;
    clearInterval(wheelTickIv);
    wheelTickIv = 0;
    clearTimeout(wheelStopTimer);
    wheelStopTimer = 0;
    wheelSpinning = false;
  };

  const MODES = [
    { id: 'mind_sync', label: '💓 Mind Sync' },
    { id: 'truth_dare', label: '🎡 Truth / Dare' },
    { id: 'most_likely', label: '👉 Most Likely' },
    { id: 'love_meter', label: '❤️ Love Meter' }
  ];

  const view = openFullScreenGameView({
    gameId: 'couple_arena',
    title: 'Couple & Bestie Arena',
    subMeta: `${p1Name} × ${p2Name}`,
    statusText: 'DUO LIVE',
    statusTone: 'turn',
    themeClass: 'gfs-theme-couple',
    html: `
      <div class="cp-arena" id="cpArena" data-testid="couple-arena-stage">
        <div class="cp-spotlights" aria-hidden="true"><i></i><i></i></div>
        <div class="cp-hearts-bg" aria-hidden="true">
          <span>💖</span><span>✨</span><span>💝</span><span>✨</span><span>💗</span><span>⭐</span>
        </div>

        <div class="cp-top-controls">
          <div class="cp-mode-tabs" role="tablist" aria-label="Couple Arena Modes">
            ${MODES.map(m => `<button type="button" class="cp-mode-tab ${m.id === activeMode ? 'on' : ''}" data-cpmode="${m.id}">${m.label}</button>`).join('')}
          </div>
          <div class="cp-sub-toolbar">
            <div class="cp-duo-toggle" role="group" aria-label="Partner Mode">
              ${isLiveOnline
                ? `<span class="cp-dt-btn on" data-testid="cp-live-partner-badge">💞 Live Partner · ${esc(roomCode)}</span>`
                : `<button type="button" class="cp-dt-btn ${duoPlayMode === 'bot' ? 'on' : ''}" data-cpduo="bot">🤖 AI Partner</button>
                   <button type="button" class="cp-dt-btn ${duoPlayMode === 'pass' ? 'on' : ''}" data-cpduo="pass">👥 2P Secret Lock</button>`}
            </div>
            ${typeof VoiceNarrator !== 'undefined' ? VoiceNarrator.renderBar('cp') : ''}
          </div>
        </div>

        <div class="cp-duo-header">
          <div class="cp-duo-pill">${typeof av === 'function' ? av(p1User, 36) : '🧑'}<b>${esc(p1Name.slice(0, 12))}</b></div>
          <div class="cp-duo-heart" aria-hidden="true">💖</div>
          <div class="cp-duo-pill">${typeof av === 'function' ? av(p2User, 36) : '👩'}<b>${esc(p2Name.slice(0, 12))}</b></div>
        </div>

        <div class="cp-stage-host" id="cpStageHost"></div>
        <div class="cp-burst-layer" id="cpBurstLayer" aria-hidden="true"></div>
      </div>
    `
  });

  if (typeof VoiceNarrator !== 'undefined') VoiceNarrator.bindBar(view);

  const speak = (script) => {
    if (typeof VoiceNarrator !== 'undefined' && script) VoiceNarrator.speak(script);
  };

  const spawnHeartBurst = (emojiList) => {
    const layer = $('#cpBurstLayer', view);
    if (!layer) return;
    const icons = emojiList || ['💖', '✨', '💝', '🔥', '👑'];
    let html = '';
    for (let i = 0; i < 24; i++) {
      const left = 12 + Math.random() * 76;
      const delay = (Math.random() * 0.25).toFixed(2);
      html += `<span class="cp-burst-ico" style="left:${left}%;animation-delay:${delay}s">${icons[i % icons.length]}</span>`;
    }
    layer.innerHTML = html;
    setTimeout(() => { if (layer) layer.innerHTML = ''; }, 1700);
  };

  const renderRewardUnlockBox = (unlocked) => {
    if (!unlocked.length) return '';
    unlocked.forEach(rw => {
      if (typeof grantGameExclusiveReward === 'function') grantGameExclusiveReward(rw);
    });
    return `
      <div class="cp-unlock-box">
        <div class="cp-unlock-hdr">✨ Exclusive Couple Arena Rewards Unlocked!</div>
        ${unlocked.map((rw, idx) => `
          <div class="cp-unlock-row">
            <span>${rw.icon} <b>${esc(rw.label || rw.name || rw.value)}</b></span>
            <button type="button" class="btn gold sm" data-cpequip="${idx}">Equip</button>
          </div>
        `).join('')}
      </div>
    `;
  };

  const bindRewardEquips = (host, unlocked) => {
    $$('[data-cpequip]', host).forEach(b => {
      b.onclick = () => {
        const rw = unlocked[Number(b.dataset.cpequip)];
        if (rw && typeof equipGameExclusiveReward === 'function') {
          equipGameExclusiveReward(rw);
          b.textContent = 'Equipped ✓';
          b.disabled = true;
        }
      };
    });
  };

  const syncTopTabs = () => {
    $$('[data-cpmode]', view).forEach(b => b.classList.toggle('on', b.dataset.cpmode === activeMode));
    $$('[data-cpduo]', view).forEach(b => b.classList.toggle('on', b.dataset.cpduo === duoPlayMode));
  };

  /* ===== MODE 1: MIND SYNC (DIL KI DHADKAN) ===== */
  const runMindSync = () => {
    const prompts = isLiveOnline
      ? SR.MIND_SYNC_PROMPTS.slice(0, 5)
      : (typeof SR.drawPersistentQuestions === 'function'
          ? SR.drawPersistentQuestions('couple_mind_sync', SR.MIND_SYNC_PROMPTS, 5, q => q.id || q.question)
          : SR.MIND_SYNC_PROMPTS.slice(0, 5));
    let idx = 0, matches = 0, p1Pick = null, p2Pick = null, roundScored = false;
    const host = $('#cpStageHost', view);

    const showLiveReveal = (q, finalP1, finalP2) => {
      const ev = SR.evaluateMindSync(finalP1, finalP2);
      if (!roundScored) {
        roundScored = true;
        if (ev.matched) {
          matches++;
          if (typeof playSfx === 'function') playSfx('fanfare');
          spawnHeartBurst(['💖', '✨', '🔥', '💝']);
        } else if (typeof playSfx === 'function') {
          playSfx('funnyBuzzer');
        }
      }
      $$('[data-msopt]', host).forEach((x, i) => {
        x.disabled = true;
        if (i === finalP1 && i === finalP2) x.classList.add('sync-hit');
        else if (i === finalP1 || i === finalP2) x.classList.add('sync-miss');
      });
      const rev = $('#cpMsReveal', host);
      if (rev) {
        rev.innerHTML = `
          <div class="cp-sync-banner ${ev.matched ? 'hit' : 'miss'}" data-testid="cp-sync-reveal">
            <b>${esc(ev.headline)}</b>
            <small>${esc(p1Name)}: ${esc(q.options[finalP1])} · ${esc(p2Name)}: ${esc(q.options[finalP2])}</small>
            <button type="button" class="btn gold sm" id="cpMsNext" style="margin-top:8px">${idx + 1 >= prompts.length ? 'Final Score ›' : 'Next Round ›'}</button>
          </div>
        `;
        $('#cpMsNext', host).onclick = () => {
          p1Pick = null;
          p2Pick = null;
          roundScored = false;
          idx++;
          if (isLiveOnline && liveSync) liveSync.pushState({ mode: 'mind_sync', action: 'next', idx, matches });
          paint();
        };
      }
    };

    const paint = () => {
      if (idx >= prompts.length) {
        const syncRate = Math.round((matches / prompts.length) * 100);
        const settle = settleCoupleOutcome(syncRate >= 50, syncRate === 25, 25);
        if (typeof bumpStat === 'function') bumpStat('games_played');
        const unlocked = SR.checkCoupleExclusiveUnlocks({ syncRate, lovePercent: syncRate, completed: true });
        if (syncRate >= 75) {
          if (typeof playSfx === 'function') playSfx('fanfare');
          spawnHeartBurst(['💖', '👑', '✨', '💝']);
        }
        host.innerHTML = `
          <div class="cp-card cp-result" data-testid="cp-mind-sync-result">
            <div class="cp-kicker">MIND SYNC COMPLETE</div>
            <div class="cp-big-pct">${syncRate}%</div>
            <h3>${syncRate === 100 ? '100% Soulmate Sync! 💍' : (syncRate >= 75 ? 'Telepathic Duo! 💖' : 'Opposites Attract! 😂')}</h3>
            <p class="cp-sub-txt">${matches}/${prompts.length} matched · ${esc(settle.label)}</p>
            ${renderRewardUnlockBox(unlocked)}
            <div class="row" style="gap:8px;justify-content:center;margin-top:12px">
              <button type="button" class="btn ghost sm" id="cpExitBtn">Exit</button>
              <button type="button" class="btn gold sm" id="cpAgainBtn">Rematch</button>
            </div>
          </div>
        `;
        bindRewardEquips(host, unlocked);
        $('#cpExitBtn', host).onclick = () => view.close();
        $('#cpAgainBtn', host).onclick = () => runMindSync();
        return;
      }

      const q = prompts[idx];
      const myLocked = mySide === 'p1' ? p1Pick !== null : p2Pick !== null;
      const partnerName = mySide === 'p1' ? p2Name : p1Name;
      const stepLabel = isLiveOnline
        ? (myLocked ? `🔒 Locked! Waiting for ${partnerName} (${idx + 1}/${prompts.length})` : `Lock Your Secret Answer (${idx + 1}/${prompts.length})`)
        : (p1Pick === null
            ? `${p1Name}: Lock Secret Answer (${idx + 1}/${prompts.length})`
            : `${p2Name}: Lock Secret Answer (${idx + 1}/${prompts.length})`);
      if (p1Pick === null && p2Pick === null) speak(q);

      host.innerHTML = `
        <div class="cp-card">
          <div class="cp-kicker">${esc(stepLabel)}</div>
          <h3 class="cp-q-title">${esc(q.question || q.prompt || '')}</h3>
          <div class="cp-opts-grid">
            ${q.options.map((opt, i) => `<button type="button" class="cp-opt-btn" data-msopt="${i}" data-testid="cp-ms-opt-${i}" ${isLiveOnline && myLocked ? 'disabled' : ''}>${esc(opt)}</button>`).join('')}
          </div>
          <div id="cpMsReveal"></div>
        </div>
      `;

      if (isLiveOnline && p1Pick !== null && p2Pick !== null) {
        showLiveReveal(q, p1Pick, p2Pick);
        return;
      } else if (isLiveOnline && myLocked) {
        $('#cpMsReveal', host).innerHTML = `<div class="cp-sync-banner" data-testid="cp-waiting-partner"><b>🔒 Secret Answer Locked!</b><small>Waiting for ${esc(partnerName)} to lock their answer…</small></div>`;
        return;
      }

      $$('[data-msopt]', host).forEach(b => {
        b.onclick = () => {
          const pick = Number(b.dataset.msopt);
          if (typeof playSfx === 'function') playSfx('heartPop');
          if (isLiveOnline) {
            if (mySide === 'p1') p1Pick = pick; else p2Pick = pick;
            if (liveSync) liveSync.pushState({ mode: 'mind_sync', action: 'pick', idx, side: mySide, pick });
            paint();
            return;
          }
          if (duoPlayMode === 'pass' && p1Pick === null) {
            p1Pick = pick;
            toast(`${p1Name} locked! Pass to ${p2Name}`);
            paint();
            return;
          }
          const finalP1 = duoPlayMode === 'pass' ? p1Pick : pick;
          const finalP2 = duoPlayMode === 'pass'
            ? pick
            : (Math.random() < 0.68 ? finalP1 : (finalP1 + 1 + Math.floor(Math.random() * 3)) % q.options.length);
          showLiveReveal(q, finalP1, finalP2);
        };
      });
    };

    onRemoteCoupleState = (payload) => {
      if (!payload || payload.mode !== 'mind_sync') return;
      if (payload.action === 'pick' && Number(payload.idx) === idx) {
        if (payload.side === 'p1') p1Pick = Number(payload.pick);
        if (payload.side === 'p2') p2Pick = Number(payload.pick);
        paint();
      } else if (payload.action === 'next' && Number(payload.idx) > idx) {
        idx = Number(payload.idx);
        p1Pick = null;
        p2Pick = null;
        roundScored = false;
        paint();
      }
    };

    paint();
  };

  /* ===== MODE 2: TRUTH, DARE YA SWEET PENALTY (3D SPINNING WHEEL) ===== */
  const runTruthDareWheel = () => {
    clearCoupleTimers();
    const wedges = SR.TRUTH_DARE_WEDGES;
    const slice = 360 / wedges.length;
    const host = $('#cpStageHost', view);

    const buildWheelSvg = () => {
      const cx = 130, cy = 130, r = 116;
      const paths = wedges.map((w, i) => {
        const a0 = ((i * slice) - 90) * Math.PI / 180;
        const a1 = (((i + 1) * slice) - 90) * Math.PI / 180;
        const x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0);
        const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
        const mid = (((i + 0.5) * slice) - 90) * Math.PI / 180;
        const tx = cx + r * 0.65 * Math.cos(mid);
        const ty = cy + r * 0.65 * Math.sin(mid);
        const rawRot = (i + 0.5) * slice;
        const rot = (rawRot > 90 && rawRot < 270) ? (rawRot + 180) : rawRot;
        return `
          <path d="M${cx},${cy} L${x0.toFixed(1)},${y0.toFixed(1)} A${r},${r} 0 0,1 ${x1.toFixed(1)},${y1.toFixed(1)} Z" fill="${w.color}" stroke="#fef08a" stroke-width="2"/>
          <text x="${tx.toFixed(1)}" y="${ty.toFixed(1)}" fill="#fff" font-size="9.5" font-weight="800" text-anchor="middle" dominant-baseline="middle" transform="rotate(${rot.toFixed(1)} ${tx.toFixed(1)} ${ty.toFixed(1)})">${esc(w.kind || w.type || 'SPIN')}</text>
        `;
      }).join('');
      return `<svg viewBox="0 0 260 260" class="cp-wheel-svg" id="cpWheelSvg" style="transform:rotate(${wheelAngle}deg)">
        <circle cx="130" cy="130" r="124" fill="#1e1030" stroke="#fde047" stroke-width="5"/>
        ${paths}
        <circle cx="130" cy="130" r="24" fill="#0f172a" stroke="#fde047" stroke-width="4"/>
        <text x="130" y="135" text-anchor="middle" font-size="14" font-weight="900" fill="#fde047">SPIN</text>
      </svg>`;
    };

    host.innerHTML = `
      <div class="cp-card cp-wheel-card">
        <div class="cp-kicker">TRUTH, DARE YA SWEET PENALTY</div>
        <div class="cp-wheel-wrap">
          <div class="cp-wheel-pointer" aria-hidden="true">▼</div>
          ${buildWheelSvg()}
        </div>
        <button type="button" class="btn gold full" id="cpSpinBtn" data-testid="cp-spin-wheel">🎡 Spin 3D Party Wheel</button>
        <div id="cpWheelResult"></div>
      </div>
    `;

    $('#cpSpinBtn', host).onclick = () => {
      if (wheelSpinning || over) return;
      clearCoupleTimers();
      wheelSpinning = true;
      const spinBtn = $('#cpSpinBtn', host);
      spinBtn.disabled = true;
      const extraSpins = 1440 + Math.floor(Math.random() * 720);
      wheelAngle += extraSpins;
      const svg = $('#cpWheelSvg', host);
      if (svg) svg.style.transform = `rotate(${wheelAngle}deg)`;

      let ticks = 0;
      wheelTickIv = setInterval(() => {
        if (over) { clearInterval(wheelTickIv); wheelTickIv = 0; return; }
        ticks++;
        if (typeof playSfx === 'function') playSfx('wheelTick');
        if (ticks >= 14) { clearInterval(wheelTickIv); wheelTickIv = 0; }
      }, 150);

      wheelStopTimer = setTimeout(() => {
        clearInterval(wheelTickIv);
        wheelTickIv = 0;
        wheelStopTimer = 0;
        wheelSpinning = false;
        if (over) return;
        spinBtn.disabled = false;
        const winIdx = SR.resolveWheelWedge(wheelAngle, wedges.length);
        const baseW = wedges[winIdx];
        const seenTd = typeof SR.loadSeenQuestionIds === 'function' ? SR.loadSeenQuestionIds('couple_truth_dare') : [];
        const w = typeof SR.pickTruthDareChallenge === 'function' ? SR.pickTruthDareChallenge(baseW, seenTd) : baseW;
        if (w.variantId && typeof SR.saveSeenQuestionIds === 'function') {
          const nextSeen = [...seenTd.filter(id => id !== w.variantId), w.variantId].slice(-20);
          SR.saveSeenQuestionIds('couple_truth_dare', nextSeen);
        }
        if (typeof playSfx === 'function') playSfx('wheelStop');
        spawnHeartBurst(['✨', '🎤', '💖']);
        speak(w);

        const resEl = $('#cpWheelResult', host);
        if (!resEl) return;
        const wKind = w.kind || w.type || 'DARE';
        const wTitle = w.label || w.title || 'Challenge';
        const wTask = w.task || w.text || '';
        resEl.innerHTML = `
          <div class="cp-dare-result" data-testid="cp-wheel-outcome">
            <span class="cp-dare-badge" style="background:${w.color}">${esc(wKind)} · ${esc(wTitle)}</span>
            <p>${esc(wTask)}</p>
            <div class="row" style="gap:8px;justify-content:center;margin-top:8px;flex-wrap:wrap">
              <button type="button" class="btn ghost sm" id="cpDareTimerBtn">⏱ 2-Min Timer</button>
              <button type="button" class="btn ok sm" id="cpDareDoneBtn">Done! +15 EXP</button>
            </div>
          </div>
        `;
        let sec = 120;
        $('#cpDareTimerBtn', resEl).onclick = () => {
          clearInterval(dareTimerIv);
          const tb = $('#cpDareTimerBtn', resEl);
          dareTimerIv = setInterval(() => {
            if (over) { clearInterval(dareTimerIv); dareTimerIv = 0; return; }
            sec--;
            const m = Math.floor(sec / 60), s = sec % 60;
            if (tb) tb.textContent = `⏱ ${m}:${String(s).padStart(2, '0')}`;
            if (typeof playSfx === 'function' && sec <= 5 && sec > 0) playSfx('timerTick');
            if (sec <= 0) { clearInterval(dareTimerIv); dareTimerIv = 0; toast('Time up! Challenge complete!'); }
          }, 1000);
        };
        $('#cpDareDoneBtn', resEl).onclick = () => {
          clearInterval(dareTimerIv);
          dareTimerIv = 0;
          const settle = settleCoupleOutcome(true, false, 15);
          const unlocked = SR.checkCoupleExclusiveUnlocks({ syncRate: 0, lovePercent: 0, completed: true });
          unlocked.forEach(rw => grantGameExclusiveReward(rw));
          toast(`${settle.label} · Partner in Crime tag unlocked!`);
          $('#cpDareDoneBtn', resEl).disabled = true;
          $('#cpDareDoneBtn', resEl).textContent = 'Claimed ✓';
        };
      }, 2400);
    };
  };

  /* ===== MODE 3: WHO'S MOST LIKELY TO? ===== */
  const runMostLikely = () => {
    const prompts = isLiveOnline
      ? SR.MOST_LIKELY_PROMPTS.slice(0, 5)
      : (typeof SR.drawPersistentQuestions === 'function'
          ? SR.drawPersistentQuestions('couple_most_likely', SR.MOST_LIKELY_PROMPTS, 5, q => q.id || q.prompt)
          : SR.MOST_LIKELY_PROMPTS.slice(0, 5));
    let idx = 0, p1Votes = 0, p2Votes = 0;
    let liveVotes = { p1: null, p2: null };
    let scoredThis = false;
    const host = $('#cpStageHost', view);

    const paint = () => {
      if (idx >= prompts.length) {
        const settle = settleCoupleOutcome(true, false, 20);
        if (typeof bumpStat === 'function') bumpStat('games_played');
        const unlocked = SR.checkCoupleExclusiveUnlocks({ syncRate: 80, lovePercent: 85, completed: true });
        spawnHeartBurst(['👑', '😂', '💖']);
        if (typeof playSfx === 'function') playSfx('fanfare');
        host.innerHTML = `
          <div class="cp-card cp-result" data-testid="cp-most-likely-result">
            <div class="cp-kicker">SPOTLIGHT VERDICT</div>
            <h3>${p1Votes >= p2Votes ? `${esc(p1Name)} Owns the Spotlight! 🌟` : `${esc(p2Name)} Stole the Show! ✨`}</h3>
            <p class="cp-sub-txt">${esc(p1Name)}: ${p1Votes} · ${esc(p2Name)}: ${p2Votes} · ${esc(settle.label)}</p>
            ${renderRewardUnlockBox(unlocked)}
            <div class="row" style="gap:8px;justify-content:center;margin-top:12px">
              <button type="button" class="btn ghost sm" id="cpExitBtn">Exit</button>
              <button type="button" class="btn gold sm" id="cpAgainBtn">Play Again</button>
            </div>
          </div>
        `;
        bindRewardEquips(host, unlocked);
        $('#cpExitBtn', host).onclick = () => view.close();
        $('#cpAgainBtn', host).onclick = () => runMostLikely();
        return;
      }

      const item = prompts[idx];
      if (!liveVotes.p1 && !liveVotes.p2) speak(item);
      const myVoted = Boolean(liveVotes[mySide]);
      const partnerName = mySide === 'p1' ? p2Name : p1Name;
      host.innerHTML = `
        <div class="cp-card">
          <div class="cp-kicker">WHO'S MOST LIKELY TO? · ${idx + 1}/${prompts.length}</div>
          <h3 class="cp-q-title">${esc(item.prompt)}</h3>
          <div class="cp-vote-pair">
            <button type="button" class="cp-av-vote" data-cpvote="p1" data-testid="cp-vote-p1" ${isLiveOnline && myVoted ? 'disabled' : ''}>
              ${typeof av === 'function' ? av(p1User, 62) : '🧑'}
              <b>${esc(p1Name)}</b>
            </button>
            <button type="button" class="cp-av-vote" data-cpvote="p2" data-testid="cp-vote-p2" ${isLiveOnline && myVoted ? 'disabled' : ''}>
              ${typeof av === 'function' ? av(p2User, 62) : '👩'}
              <b>${esc(p2Name)}</b>
            </button>
          </div>
          <div id="cpVoteSpot"></div>
        </div>
      `;

      if (isLiveOnline && liveVotes.p1 && liveVotes.p2) {
        if (!scoredThis) {
          scoredThis = true;
          if (liveVotes.p1 === 'p1') p1Votes++; else p2Votes++;
          if (liveVotes.p2 === 'p1') p1Votes++; else p2Votes++;
        }
        const agreed = liveVotes.p1 === liveVotes.p2;
        const pickedNm = liveVotes[mySide] === 'p1' ? p1Name : p2Name;
        const partnerPickedNm = liveVotes[oppSide] === 'p1' ? p1Name : p2Name;
        $('#cpVoteSpot', host).innerHTML = `
          <div class="cp-sync-banner ${agreed ? 'hit' : 'miss'}" data-testid="cp-ml-live-reveal">
            <b>${agreed ? `🔦 Both pointed at ${esc(pickedNm)}!` : `😂 Split Vote!`}</b>
            <small>You picked ${esc(pickedNm)} · ${esc(partnerName)} picked ${esc(partnerPickedNm)}</small>
            <button type="button" class="btn gold sm" id="cpMlNext" style="margin-top:8px">Next Prompt ›</button>
          </div>
        `;
        $('#cpMlNext', host).onclick = () => {
          idx++;
          liveVotes = { p1: null, p2: null };
          scoredThis = false;
          if (liveSync) liveSync.pushState({ mode: 'most_likely', action: 'next', idx });
          paint();
        };
        return;
      } else if (isLiveOnline && myVoted) {
        $('#cpVoteSpot', host).innerHTML = `<div class="cp-sync-banner" data-testid="cp-waiting-partner"><b>🔒 Vote Locked!</b><small>Waiting for ${esc(partnerName)} to vote…</small></div>`;
        return;
      }

      $$('[data-cpvote]', host).forEach(b => {
        b.onclick = () => {
          const v = b.dataset.cpvote;
          if (typeof playSfx === 'function') playSfx('heartPop');
          spawnHeartBurst(['👉', '😂', '✨']);
          if (isLiveOnline) {
            liveVotes[mySide] = v;
            if (liveSync) liveSync.pushState({ mode: 'most_likely', action: 'vote', idx, side: mySide, vote: v });
            paint();
            return;
          }
          if (v === 'p1') p1Votes++; else p2Votes++;
          $$('[data-cpvote]', host).forEach(x => {
            x.disabled = true;
            x.classList.toggle('spotlight-win', x.dataset.cpvote === v);
          });
          const partnerAgree = Math.random() < 0.72;
          $('#cpVoteSpot', host).innerHTML = `
            <div class="cp-sync-banner ${partnerAgree ? 'hit' : 'miss'}">
              <b>🔦 Spotlight on ${esc(v === 'p1' ? p1Name : p2Name)}!</b>
              <small>${partnerAgree ? `${esc(p2Name)} totally agrees! 😂` : `${esc(p2Name)} pointed right back at you! 😱`}</small>
              <button type="button" class="btn gold sm" id="cpMlNext" style="margin-top:8px">Next Prompt ›</button>
            </div>
          `;
          $('#cpMlNext', host).onclick = () => { idx++; paint(); };
        };
      });
    };

    onRemoteCoupleState = (payload) => {
      if (!payload || payload.mode !== 'most_likely') return;
      if (payload.action === 'vote' && Number(payload.idx) === idx) {
        liveVotes[payload.side] = payload.vote;
        paint();
      } else if (payload.action === 'next' && Number(payload.idx) > idx) {
        idx = Number(payload.idx);
        liveVotes = { p1: null, p2: null };
        scoredThis = false;
        paint();
      }
    };

    paint();
  };

  /* ===== MODE 4: LOVE & VIBE METER (0%–100% ANIMATED HEART METER) ===== */
  const runLoveMeter = () => {
    const qs = typeof SR.drawPersistentQuestions === 'function'
      ? SR.drawPersistentQuestions('couple_love_meter', SR.LOVE_METER_QUESTIONS, 5, q => q.id || q.q)
      : SR.LOVE_METER_QUESTIONS.slice(0, 5);
    let idx = 0;
    const pts = [];
    const host = $('#cpStageHost', view);

    const paint = () => {
      const livePct = idx === 0 ? 12 : Math.min(100, Math.round((pts.reduce((a, b) => a + b, 0) / (qs.length * 20)) * 100));

      if (idx >= qs.length) {
        const res = SR.calculateLoveVibeResult(pts);
        const settle = settleCoupleOutcome(res.percent >= 74, false, 30);
        if (typeof bumpStat === 'function') bumpStat('games_played');
        const unlocked = SR.checkCoupleExclusiveUnlocks({ syncRate: res.percent, lovePercent: res.percent, completed: true });
        if (typeof playSfx === 'function') playSfx('fanfare');
        spawnHeartBurst(['❤️', '💖', '👑', '✨']);
        speak({
          enText: `Your Love and Vibe Meter hit ${res.percent} percent! Official duo title: ${res.title}!`,
          hiSpoken: `आपका लव और वाइब मीटर ${res.percent} प्रतिशत पर पहुँचा! आपकी जोड़ी का टाइटल है ${res.title}!`,
          bnSpoken: `তোমাদের লাভ আর ভাইব মিটার ${res.percent} শতাংশে পৌঁছেছে! তোমাদের জুটির টাইটেল হলো ${res.title}!`
        });

        host.innerHTML = `
          <div class="cp-card cp-result" data-testid="cp-love-meter-result">
            <div class="cp-kicker">OFFICIAL DUO VIBE SCORE</div>
            <div class="cp-big-pct">❤️ ${res.percent}%</div>
            <div class="cp-heart-gauge" style="max-width:300px;margin:0 auto 12px">
              <div class="cp-meter-track"><div class="cp-heart-fill" style="width:${res.percent}%"></div></div>
            </div>
            <div class="cp-duo-title-badge">${res.badge} ${esc(res.title)}</div>
            <p class="cp-sub-txt">${esc(p1Name)} &amp; ${esc(p2Name)} · ${esc(settle.label)}</p>
            ${renderRewardUnlockBox(unlocked)}
            <div class="row" style="gap:8px;justify-content:center;margin-top:12px">
              <button type="button" class="btn ghost sm" id="cpExitBtn">Exit</button>
              <button type="button" class="btn gold sm" id="cpAgainBtn">Test Again</button>
            </div>
          </div>
        `;
        bindRewardEquips(host, unlocked);
        $('#cpExitBtn', host).onclick = () => view.close();
        $('#cpAgainBtn', host).onclick = () => runLoveMeter();
        return;
      }

      const q = qs[idx];
      speak(q);
      host.innerHTML = `
        <div class="cp-card">
          <div class="cp-meter-top">
            <span class="cp-kicker">LOVE &amp; VIBE METER · ${idx + 1}/${qs.length}</span>
            <span class="cp-meter-val">❤️ ${livePct}%</span>
          </div>
          <div class="cp-meter-track"><i style="width:${livePct}%"></i></div>
          <h3 class="cp-q-title">${esc(q.q)}</h3>
          <div class="cp-opts-grid">
            ${q.opts.map((op, i) => `<button type="button" class="cp-opt-btn" data-lmopt="${i}" data-testid="cp-lm-opt-${i}">${esc(op.label)}</button>`).join('')}
          </div>
        </div>
      `;

      $$('[data-lmopt]', host).forEach(b => {
        b.onclick = () => {
          const op = q.opts[Number(b.dataset.lmopt)];
          pts.push(op ? op.pts : 16);
          if (typeof playSfx === 'function') playSfx('heartPop');
          idx++;
          paint();
        };
      });
    };
    paint();
  };

  const renderActiveMode = () => {
    clearCoupleTimers();
    onRemoteCoupleState = null;
    syncTopTabs();
    if (activeMode === 'truth_dare') runTruthDareWheel();
    else if (activeMode === 'most_likely') runMostLikely();
    else if (activeMode === 'love_meter') runLoveMeter();
    else runMindSync();
  };

  if (isLiveOnline && roomId && typeof window.createLiveMatchSync === 'function') {
    liveSync = window.createLiveMatchSync({
      roomId,
      roomCode,
      gameId: 'couple_arena',
      myUid,
      myName: myProfile.name,
      oppUids: ctrl && ctrl.oppUid ? [ctrl.oppUid] : [],
      onLeaveRequest: () => view.close(),
      onState: (payload) => {
        if (over || !payload) return;
        if (payload.switchMode && payload.switchMode !== activeMode) {
          activeMode = payload.switchMode;
          renderActiveMode();
          return;
        }
        if (typeof onRemoteCoupleState === 'function') onRemoteCoupleState(payload);
      }
    });
    liveSync.mountConnectionBanner($('#cpArena', view));
  }

  $$('[data-cpmode]', view).forEach(b => {
    b.onclick = () => {
      activeMode = b.dataset.cpmode;
      if (typeof playSfx === 'function') playSfx('tap');
      if (isLiveOnline && liveSync) liveSync.pushState({ switchMode: activeMode });
      renderActiveMode();
    };
  });

  $$('[data-cpduo]', view).forEach(b => {
    b.onclick = () => {
      if (isLiveOnline) return; // HARD BLOCK: Never switch to AI Partner in a live room!
      duoPlayMode = b.dataset.cpduo;
      if (typeof playSfx === 'function') playSfx('tap');
      renderActiveMode();
    };
  });

  view.onclose = () => {
    over = true;
    clearCoupleTimers();
    if (liveSync) liveSync.destroy();
    if (typeof VoiceNarrator !== 'undefined') VoiceNarrator.stop();
    if (typeof clearMyLiveActivity === 'function') clearMyLiveActivity();
  };

  renderActiveMode();
  return view;
}
window.launchCoupleArena = launchCoupleArena;
