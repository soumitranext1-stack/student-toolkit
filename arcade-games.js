"use strict";
/* =====================================================================
   4 NEW VISUAL-FIRST ARCADE & STRATEGY GAMES
   · 60-Second Tile Race (Fast ascending grid tap race + streak multipliers)
   · Trap Door Duel (5-row tense chamber crossing with shields & sabotage)
   · Mind Clash 1v1 (Head-to-head visual logic/pattern speed race)
   · Pocket Territory (6x6 tap-and-capture board with Shield/Bomb/Double)
   ===================================================================== */

/* ---------- 1. 60-SECOND TILE RACE ---------- */
function launchTileRace(opts) {
  const AR = window.ArcadeRules;
  if (!AR) return;
  const o = opts || {};
  const myUid = (typeof uid !== 'undefined' && uid) ? String(uid) : 'local_me';
  const myProfile = { uid: myUid, name: (typeof me !== 'undefined' && me?.name) || 'You', avatar: (typeof me !== 'undefined' && me?.avatar) || 'av_b1' };
  const ctrl = window.PvpSyncRules ? window.PvpSyncRules.resolve2PControl(o, myUid, myProfile) : null;
  const isLiveOnline = Boolean(ctrl && ctrl.isLiveOnline);
  const botAllowed = ctrl ? ctrl.botAllowed : (o.modeType !== 'pvp' && o.modeType !== 'invite');
  const modeType = ctrl ? ctrl.modeType : (o.modeType || 'bot');
  const botTier = o.botTier || (o.stake > 0 ? 'pro' : 'standard');
  const stake = Math.max(0, Math.floor(Number(o.stake || 0)));
  const roomId = String(o.roomId || (ctrl && ctrl.roomId) || '').trim();
  const roomCode = String(o.roomCode || (ctrl && ctrl.roomCode) || ('TR' + Math.floor(1000 + Math.random() * 9000))).toUpperCase();
  const oppName = (ctrl && ctrl.oppName) || o.rival?.name || (botTier === 'pro' ? 'Turbo Pro Bot' : 'Speed Bot');
  const pay = AR.calcMatchPayout(stake);

  if (typeof setMyLiveActivity === 'function') {
    setMyLiveActivity({ type: 'playing', gameId: 'tile_race', gameName: '60-Second Tile Race', roomCode, mode: modeType });
  }

  const state = {
    ...AR.createTileRaceBoard(1),
    score: 0,
    rivalScore: 0,
    streak: 0,
    bestStreak: 0,
    taps: 0,
    misses: 0,
    timeLeft: 60,
    over: false
  };
  let clkId = 0, rivalId = 0, chatWidget = null, liveSync = null;

  const view = openFullScreenGameView({
    gameId: 'tile_race',
    title: '60-Second Tile Race',
    subMeta: stake > 0 ? `${stake} 🪙 · Pot ${fmtNum(pay.winnerPayout)}` : `Room ${roomCode}`,
    statusText: '60s',
    statusTone: 'turn',
    themeClass: 'gfs-theme-number-match',
    html: `
      <div class="arc-stage" id="trStage" data-testid="tile-race-stage">
        <div class="arc-hud-row">
          <div class="arc-stat me"><small>YOU</small><b id="trScore" data-testid="tr-score">0</b></div>
          <div class="arc-stat target"><small>TAP NEXT</small><b id="trNext" data-testid="tr-next">1</b></div>
          <div class="arc-stat timer"><small>TIME</small><b id="trTime">60s</b></div>
          <div class="arc-stat rival"><small>${esc(oppName.slice(0, 10).toUpperCase())}</small><b id="trRival">0</b></div>
        </div>

        <div class="arc-streak-strip">
          <span id="trStreakLbl">Streak ×1</span>
          <span id="trWaveLbl">Wave 1</span>
        </div>

        <div class="tr-grid" id="trGrid" data-testid="tr-grid" role="grid" aria-label="60-Second Tile Race Grid"></div>
        <div id="trResultHost"></div>
        <div id="trChatHost"></div>
      </div>
    `
  });

  if (typeof createInGameChatWidget === 'function' && $('#trChatHost', view)) {
    chatWidget = createInGameChatWidget({
      gameId: 'tile_race',
      roomCode,
      quickLines: ['So fast! ⚡', 'Combo fire 🔥', 'Watch this!', 'GG! 👏']
    });
    chatWidget.mount($('#trChatHost', view));
  }

  const renderGrid = () => {
    const gridEl = $('#trGrid', view);
    if (!gridEl) return;
    gridEl.innerHTML = state.cells.map((cell, i) => {
      const isNext = !cell.cleared && cell.val === state.nextTarget;
      return `<button type="button" class="tr-cell ${cell.cleared ? 'cleared' : ''} ${cell.bonus ? 'bonus' : ''} ${isNext ? 'is-target' : ''}" data-tridx="${i}" ${cell.cleared || state.over ? 'disabled' : ''} aria-label="Tile ${cell.val}">
        <span>${cell.cleared ? '' : cell.val}</span>
      </button>`;
    }).join('');
    if ($('#trScore', view)) $('#trScore', view).textContent = String(state.score);
    if ($('#trNext', view)) $('#trNext', view).textContent = String(state.nextTarget);
    if ($('#trRival', view)) $('#trRival', view).textContent = String(state.rivalScore);
    const mult = Math.min(5, 1 + Math.floor(Math.max(0, state.streak - 1) / 4));
    if ($('#trStreakLbl', view)) $('#trStreakLbl', view).textContent = `Streak ${state.streak} · ×${mult}`;
    if ($('#trWaveLbl', view)) $('#trWaveLbl', view).textContent = `Wave ${state.wave}`;
  };

  const finish = () => {
    if (state.over) return;
    state.over = true;
    clearInterval(clkId);
    clearInterval(rivalId);
    const outcome = state.score > state.rivalScore ? 'win' : (state.score === state.rivalScore ? 'tie' : 'lose');
    const res = settleArenaMatchOutcome(outcome, stake, 45, 32, 12);
    if (outcome === 'win') spawnArenaSparks($('#trStage', view), '#fde047', 16);
    view.setStatus('Finished', outcome === 'win' ? 'ok' : (outcome === 'tie' ? 'neutral' : 'bot'));
    renderGrid();
    const host = $('#trResultHost', view);
    if (host) {
      host.innerHTML = `
        <div class="arena-result-card" data-testid="tr-result-card">
          <b>${esc(res.headline)}</b>
          <small>You ${state.score} vs ${esc(oppName)} ${state.rivalScore} · Best Streak ${state.bestStreak} · ${esc(res.detail)}</small>
          <div class="row" style="gap:8px;margin-top:10px;justify-content:center">
            <button type="button" class="btn ghost sm" id="trExitBtn">Exit</button>
            <button type="button" class="btn gold sm" id="trRematchBtn">Rematch</button>
          </div>
        </div>
      `;
      $('#trExitBtn', host).onclick = () => view.close();
      $('#trRematchBtn', host).onclick = () => {
        if (typeof openVisualModeSelect === 'function') openVisualModeSelect('tile_race', o.rival?.uid);
        else launchTileRace(o);
      };
    }
  };

  const syncTrScore = () => {
    if (isLiveOnline && liveSync) {
      liveSync.pushState({ senderUid: myUid, score: state.score, wave: state.wave, over: state.over });
    }
  };

  if (isLiveOnline && roomId && typeof window.createLiveMatchSync === 'function') {
    liveSync = window.createLiveMatchSync({
      roomId,
      roomCode,
      gameId: 'tile_race',
      myUid,
      myName: myProfile.name,
      oppUids: ctrl && ctrl.oppUid ? [ctrl.oppUid] : [],
      onLeaveRequest: () => view.close(),
      onState: (payload) => {
        if (!payload || payload.senderUid === myUid) return;
        if (typeof payload.score === 'number') {
          state.rivalScore = Math.max(state.rivalScore, payload.score);
          if ($('#trRival', view)) $('#trRival', view).textContent = String(state.rivalScore);
        }
      }
    });
    liveSync.mountConnectionBanner($('#trStage', view));
  }

  $('#trGrid', view).onclick = (e) => {
    if (state.over) return;
    const btn = e.target.closest('[data-tridx]');
    if (!btn) return;
    const res = AR.tapTileRaceCell(state, Number(btn.dataset.tridx));
    if (res.ignored) return;
    if (res.ok) {
      if (typeof playSfx === 'function') playSfx(res.waveCleared ? 'rowClear' : 'pairMatch', { combo: state.streak });
      if (res.waveCleared) spawnArenaSparks($('#trGrid', view), '#38bdf8', 14);
      renderGrid();
      syncTrScore();
    } else if (res.wrong) {
      if (typeof playSfx === 'function') playSfx('duelWrong');
      btn.classList.add('shake');
      setTimeout(() => btn.classList.remove('shake'), 260);
      if ($('#trStreakLbl', view)) $('#trStreakLbl', view).textContent = 'Streak 0 · ×1';
    }
  };

  clkId = setInterval(() => {
    if (state.over) return;
    state.timeLeft--;
    if ($('#trTime', view)) $('#trTime', view).textContent = `${state.timeLeft}s`;
    view.setStatus(`${state.timeLeft}s`, state.timeLeft <= 10 ? 'bot' : 'turn');
    if (state.timeLeft <= 0) {
      syncTrScore();
      finish();
    }
  }, 1000);

  // HARD BLOCK: Only run simulated bot score ticker in explicit Bot/Practice mode!
  if (botAllowed && !isLiveOnline) {
    rivalId = setInterval(() => {
      if (state.over) return;
      const gain = botTier === 'pro' ? (18 + Math.floor(Math.random() * 24)) : (10 + Math.floor(Math.random() * 14));
      state.rivalScore += gain;
      if ($('#trRival', view)) $('#trRival', view).textContent = String(state.rivalScore);
    }, botTier === 'pro' ? 1900 : 2600);
  }

  view.onclose = () => {
    state.over = true;
    clearInterval(clkId);
    clearInterval(rivalId);
    if (liveSync) liveSync.destroy();
    if (chatWidget) chatWidget.destroy();
    if (typeof clearMyLiveActivity === 'function') clearMyLiveActivity();
  };

  renderGrid();
  return view;
}
window.launchTileRace = launchTileRace;

/* ---------- 2. TRAP DOOR DUEL ---------- */
function launchTrapDoorDuel(opts) {
  const AR = window.ArcadeRules;
  if (!AR) return;
  const o = opts || {};
  const myUid = (typeof uid !== 'undefined' && uid) ? String(uid) : 'local_me';
  const myProfile = { uid: myUid, name: (typeof me !== 'undefined' && me?.name) || 'You', avatar: (typeof me !== 'undefined' && me?.avatar) || 'av_b1' };
  const ctrl = window.PvpSyncRules ? window.PvpSyncRules.resolve2PControl(o, myUid, myProfile) : null;
  const isLiveOnline = Boolean(ctrl && ctrl.isLiveOnline);
  const isLocalPvp = ctrl ? ctrl.isLocalPassAndPlay : (o.modeType === 'pvp' && !o.rivalBot);
  const mySide = ctrl ? ctrl.mySide : 'p1';
  const modeType = ctrl ? ctrl.modeType : (o.modeType || 'bot');
  const botTier = o.botTier || (o.stake > 0 ? 'pro' : 'standard');
  const stake = Math.max(0, Math.floor(Number(o.stake || 0)));
  const roomId = String(o.roomId || (ctrl && ctrl.roomId) || '').trim();
  const roomCode = String(o.roomCode || (ctrl && ctrl.roomCode) || ('TD' + Math.floor(1000 + Math.random() * 9000))).toUpperCase();
  const p1Name = (ctrl && ctrl.p1Name) || myProfile.name;
  const p2Name = (ctrl && ctrl.p2Name) || o.rival?.name || (isLocalPvp ? 'Player 2' : (botTier === 'pro' ? 'Shadow Pro Bot' : 'Vault Bot'));
  const pay = AR.calcMatchPayout(stake);

  const canActNow = () => {
    if (over) return false;
    if (window.PvpSyncRules && ctrl) return window.PvpSyncRules.canActOn2PTurn(state.turn, ctrl);
    return state.turn === 'p1' || isLocalPvp;
  };
  const shouldRunBotNow = () => {
    if (over) return false;
    if (window.PvpSyncRules && ctrl) return window.PvpSyncRules.shouldRun2PBot(state.turn, ctrl);
    return !isLocalPvp && !isLiveOnline && state.turn === 'p2';
  };

  if (typeof setMyLiveActivity === 'function') {
    setMyLiveActivity({ type: 'playing', gameId: 'trap_door', gameName: 'Trap Door Duel', roomCode, mode: modeType });
  }

  const state = AR.createTrapDoorState();
  let sabotageMode = false;
  let botTimer = 0;
  let over = false;
  let banner = isLiveOnline && mySide !== 'p1' ? `Waiting for ${p1Name} to pick Row 1…` : 'Pick a door on Row 1 to reach the Golden Vault';
  let chatWidget = null;
  let liveSync = null;

  const view = openFullScreenGameView({
    gameId: 'trap_door',
    title: 'Trap Door Duel',
    subMeta: stake > 0 ? `${stake} 🪙 · Pot ${fmtNum(pay.winnerPayout)}` : `Room ${roomCode}`,
    statusText: isLiveOnline && mySide !== 'p1' ? `${p1Name}…` : 'Your Step',
    statusTone: 'turn',
    themeClass: 'gfs-theme-spy',
    html: `
      <div class="arc-stage" id="tdStage" data-testid="trap-door-stage">
        <div class="td-hud-pair">
          <div class="td-pcard active" id="tdP1Card">
            <b>${esc(p1Name.slice(0, 12))}</b>
            <div class="td-hearts" id="tdP1Hp">❤️❤️❤️</div>
            <small id="tdP1Meta">Row 1/5</small>
          </div>
          <div class="td-vault-ico" aria-hidden="true">🏆<span>VAULT</span></div>
          <div class="td-pcard" id="tdP2Card">
            <b>${esc(p2Name.slice(0, 12))}</b>
            <div class="td-hearts" id="tdP2Hp">❤️❤️❤️</div>
            <small id="tdP2Meta">Row 1/5</small>
          </div>
        </div>

        <div class="td-banner" id="tdBanner">${esc(banner)}</div>
        <div class="td-chamber" id="tdChamber" data-testid="td-chamber"></div>

        <div class="td-actions">
          <button type="button" class="btn ghost sm" id="tdSabotageBtn">⚡ Plant Trap (1)</button>
        </div>

        <div id="tdResultHost"></div>
        <div id="tdChatHost"></div>
      </div>
    `
  });

  if (typeof createInGameChatWidget === 'function' && $('#tdChatHost', view)) {
    chatWidget = createInGameChatWidget({
      gameId: 'trap_door',
      roomCode,
      quickLines: ['Watch your step! 🕳️', 'Shield saved me 🛡️', 'Vault is mine! 🏆', 'GG!']
    });
    chatWidget.mount($('#tdChatHost', view));
  }

  const heartsStr = (hp, maxHp, shield) => '❤️'.repeat(hp) + '🖤'.repeat(Math.max(0, maxHp - hp)) + (shield ? ' 🛡️' : '');

  const finish = () => {
    if (over) return;
    over = true;
    clearTimeout(botTimer);
    const iWon = state.winner === mySide;
    const outcome = isLocalPvp ? 'win' : (iWon ? 'win' : 'lose');
    const res = settleArenaMatchOutcome(outcome, stake, 48, 34, 12);
    if (iWon) spawnArenaSparks($('#tdStage', view), '#fde047', 16);
    view.setStatus('Finished', iWon ? 'ok' : 'bot');
    const host = $('#tdResultHost', view);
    if (host) {
      host.innerHTML = `
        <div class="arena-result-card" data-testid="td-result-card">
          <b>${isLocalPvp ? `🏆 ${esc(state.winner === 'p1' ? p1Name : p2Name)} Wins!` : esc(res.headline)}</b>
          <small>${esc(state.reason)} · ${esc(res.detail)}</small>
          <div class="row" style="gap:8px;margin-top:10px;justify-content:center">
            <button type="button" class="btn ghost sm" id="tdExitBtn">Exit</button>
            <button type="button" class="btn gold sm" id="tdRematchBtn">Rematch</button>
          </div>
        </div>
      `;
      $('#tdExitBtn', host).onclick = () => view.close();
      $('#tdRematchBtn', host).onclick = () => {
        if (typeof openVisualModeSelect === 'function') openVisualModeSelect('trap_door', o.rival?.uid);
        else launchTrapDoorDuel(o);
      };
    }
  };

  const renderChamber = () => {
    const p1 = state.players.p1, p2 = state.players.p2;
    if ($('#tdP1Hp', view)) $('#tdP1Hp', view).textContent = heartsStr(p1.hp, p1.maxHp, p1.shield);
    if ($('#tdP2Hp', view)) $('#tdP2Hp', view).textContent = heartsStr(p2.hp, p2.maxHp, p2.shield);
    if ($('#tdP1Meta', view)) $('#tdP1Meta', view).textContent = `Row ${Math.min(5, p1.row + 1)}/5`;
    if ($('#tdP2Meta', view)) $('#tdP2Meta', view).textContent = `Row ${Math.min(5, p2.row + 1)}/5`;
    if ($('#tdP1Card', view)) $('#tdP1Card', view).classList.toggle('active', !over && state.turn === 'p1');
    if ($('#tdP2Card', view)) $('#tdP2Card', view).classList.toggle('active', !over && state.turn === 'p2');
    if ($('#tdBanner', view)) $('#tdBanner', view).textContent = banner;

    const sabBtn = $('#tdSabotageBtn', view);
    const activeP = state.players[state.turn];
    const canAct = canActNow();
    if (sabBtn) {
      sabBtn.textContent = sabotageMode ? 'Cancel Trap' : `⚡ Plant Trap (${activeP.sabotages})`;
      sabBtn.disabled = !canAct || (!sabotageMode && activeP.sabotages <= 0);
      sabBtn.classList.toggle('gold', sabotageMode);
    }

    const ch = $('#tdChamber', view);
    if (!ch) return;
    // Render top (Row 5 Vault) down to bottom (Row 1 Start)
    let html = '';
    for (let r = state.rows.length - 1; r >= 0; r--) {
      const row = state.rows[r];
      const activeRow = !over && activeP.row === r;
      html += `<div class="td-row ${activeRow ? 'active-row' : ''}">
        <span class="td-row-idx">R${r + 1}</span>
        <div class="td-doors">
          ${row.map((door, c) => {
            const revealed = Boolean(door.revealedBy);
            const isSabTarget = sabotageMode && !revealed && canAct;
            const clickable = (!sabotageMode && activeRow && canAct) || isSabTarget;
            let glyph = '🚪';
            let cls = 'closed';
            if (revealed) {
              if (door.type === 'trap' || door.sabotagedBy) { glyph = '🕳️'; cls = 'trap'; }
              else if (door.type === 'shield') { glyph = '🛡️'; cls = 'shield'; }
              else { glyph = '💎'; cls = 'safe'; }
            } else if (door.sabotagedBy === mySide || (!isLiveOnline && door.sabotagedBy === state.turn)) {
              glyph = '⚡';
              cls = 'armed';
            }
            const p1Here = p1.row === r && !over;
            const p2Here = p2.row === r && !over;
            return `<button type="button" class="td-door ${cls} ${clickable ? 'clickable' : ''} ${isSabTarget ? 'sab-tgt' : ''}" data-tdr="${r}" data-tdc="${c}" ${clickable ? '' : 'disabled'} aria-label="Row ${r + 1} Door ${c + 1}">
              <span class="td-glyph">${glyph}</span>
              ${(c === 0 && p1Here) ? '<i class="td-mark p1">1</i>' : ''}
              ${(c === 3 && p2Here) ? '<i class="td-mark p2">2</i>' : ''}
            </button>`;
          }).join('')}
        </div>
      </div>`;
    }
    ch.innerHTML = html;
    if (!over) {
      const activeNm = state.turn === 'p1' ? p1Name : p2Name;
      view.setStatus(canAct ? (isLocalPvp ? `${activeNm} Step` : 'Your Step') : `${activeNm}…`, canAct ? 'turn' : 'bot');
    }
  };

  const pushTdSync = () => {
    if (isLiveOnline && liveSync) {
      liveSync.pushState({
        rows: state.rows,
        players: state.players,
        turn: state.turn,
        winner: state.winner,
        reason: state.reason,
        banner
      });
    }
  };

  if (isLiveOnline && roomId && typeof window.createLiveMatchSync === 'function') {
    liveSync = window.createLiveMatchSync({
      roomId,
      roomCode,
      gameId: 'trap_door',
      myUid,
      myName: myProfile.name,
      oppUids: ctrl && ctrl.oppUid ? [ctrl.oppUid] : [],
      onLeaveRequest: () => view.close(),
      onState: (snap) => {
        if (over || !snap) return;
        if (Array.isArray(snap.rows)) state.rows = snap.rows;
        if (snap.players) state.players = snap.players;
        if (snap.turn) state.turn = snap.turn;
        state.winner = snap.winner || null;
        state.reason = snap.reason || '';
        if (snap.banner) banner = snap.banner;
        sabotageMode = false;
        if (typeof playSfx === 'function') playSfx('pawnStep');
        renderChamber();
        if (state.winner) finish();
      }
    });
    liveSync.mountConnectionBanner($('#tdStage', view));
    if (ctrl && ctrl.isHost) pushTdSync();
  }

  const runBotMove = () => {
    if (!shouldRunBotNow()) return; // HARD BLOCK: Never run bot AI in live PvP/invite rooms!
    botTimer = setTimeout(() => {
      if (!shouldRunBotNow()) return;
      const p2 = state.players.p2;
      const row = state.rows[p2.row];
      if (!row) return;
      // Smart bot picks already revealed safe doors first, or avoids revealed traps
      let candidates = row.filter(d => d.revealedBy && d.type !== 'trap' && d.sabotagedBy !== 'p1');
      if (!candidates.length) candidates = row.filter(d => !d.revealedBy);
      if (!candidates.length) candidates = row;
      // Pro bot has slight intuition advantage
      let pick = candidates[Math.floor(Math.random() * candidates.length)];
      if (botTier === 'pro' && Math.random() < 0.45) {
        const safeOnly = candidates.filter(d => d.type !== 'trap' && d.sabotagedBy !== 'p1');
        if (safeOnly.length) pick = safeOnly[Math.floor(Math.random() * safeOnly.length)];
      }
      const res = AR.stepTrapDoor(state, 'p2', pick.c);
      if (res.ok) {
        banner = res.outcome === 'trap' ? `${p2Name} fell into a Trap Door! 🕳️` : `${p2Name} cleared Row ${p2.row}!`;
        if (typeof playSfx === 'function') playSfx(res.outcome === 'trap' ? 'duelWrong' : 'pawnStep');
        renderChamber();
        if (res.winner) finish();
      }
    }, botTier === 'pro' ? 620 : 800);
  };

  $('#tdChamber', view).onclick = (e) => {
    if (!canActNow()) return;
    const btn = e.target.closest('[data-tdr]');
    if (!btn) return;
    const r = Number(btn.dataset.tdr), c = Number(btn.dataset.tdc);

    if (sabotageMode) {
      const ok = AR.plantTrapSabotage(state, state.turn, r, c);
      sabotageMode = false;
      if (ok.ok) {
        banner = `⚡ Secret trap armed on Row ${r + 1}! Now pick your door.`;
        if (typeof playSfx === 'function') playSfx('capture');
        pushTdSync();
      }
      renderChamber();
      return;
    }

    const activeKey = state.turn;
    const res = AR.stepTrapDoor(state, activeKey, c);
    if (!res.ok) return;
    if (res.outcome === 'trap') {
      banner = '🕳️ Trap Door! Lost 1 Heart!';
      if (typeof playSfx === 'function') playSfx('duelWrong');
    } else if (res.outcome === 'shield_block') {
      banner = '🛡️ Shield absorbed the Trap Door & advanced!';
      if (typeof playSfx === 'function') playSfx('rowClear');
    } else if (res.outcome === 'shield_gain') {
      banner = '🛡️ Found a Shield + Safe Passage!';
      if (typeof playSfx === 'function') playSfx('duelCorrect');
    } else {
      banner = '💎 Safe door! Stepped forward!';
      if (typeof playSfx === 'function') playSfx('duelCorrect');
    }
    renderChamber();
    pushTdSync();
    if (res.winner) finish();
    else if (shouldRunBotNow()) runBotMove();
  };

  if ($('#tdSabotageBtn', view)) {
    $('#tdSabotageBtn', view).onclick = () => {
      if (!canActNow()) return;
      sabotageMode = !sabotageMode;
      banner = sabotageMode ? 'Tap any closed door to plant a hidden trap!' : 'Pick a door on your active row';
      if (typeof playSfx === 'function') playSfx('tap');
      renderChamber();
    };
  }

  view.onclose = () => {
    over = true;
    clearTimeout(botTimer);
    if (liveSync) liveSync.destroy();
    if (chatWidget) chatWidget.destroy();
    if (typeof clearMyLiveActivity === 'function') clearMyLiveActivity();
  };

  renderChamber();
  return view;
}
window.launchTrapDoorDuel = launchTrapDoorDuel;

/* ---------- 3. MIND CLASH 1v1 ---------- */
function launchMindClash(opts) {
  const AR = window.ArcadeRules;
  if (!AR) return;
  const o = opts || {};
  const myUid = (typeof uid !== 'undefined' && uid) ? String(uid) : 'local_me';
  const myProfile = { uid: myUid, name: (typeof me !== 'undefined' && me?.name) || 'You', avatar: (typeof me !== 'undefined' && me?.avatar) || 'av_b1' };
  const ctrl = window.PvpSyncRules ? window.PvpSyncRules.resolve2PControl(o, myUid, myProfile) : null;
  const isLiveOnline = Boolean(ctrl && ctrl.isLiveOnline);
  const botAllowed = ctrl ? ctrl.botAllowed : (o.modeType !== 'pvp' && o.modeType !== 'invite');
  const modeType = ctrl ? ctrl.modeType : (o.modeType || 'bot');
  const botTier = o.botTier || (o.stake > 0 ? 'pro' : 'standard');
  const stake = Math.max(0, Math.floor(Number(o.stake || 0)));
  const roomId = String(o.roomId || (ctrl && ctrl.roomId) || '').trim();
  const roomCode = String(o.roomCode || (ctrl && ctrl.roomCode) || ('MC' + Math.floor(1000 + Math.random() * 9000))).toUpperCase();
  const p1Name = myProfile.name;
  const oppName = (ctrl && ctrl.oppName) || o.rival?.name || (botTier === 'pro' ? 'Apex Mind Bot' : 'Logic Bot');
  const pay = AR.calcMatchPayout(stake);

  if (typeof setMyLiveActivity === 'function') {
    setMyLiveActivity({ type: 'playing', gameId: 'mind_clash', gameName: 'Mind Clash 1v1', roomCode, mode: modeType });
  }

  const deck = AR.createMindClashDeck(7);
  let idx = 0, myScore = 0, oppScore = 0, secLeft = 10, locked = false, over = false;
  let tickId = 0, nextId = 0, chatWidget = null, liveSync = null;

  const view = openFullScreenGameView({
    gameId: 'mind_clash',
    title: 'Mind Clash 1v1',
    subMeta: stake > 0 ? `${stake} 🪙 · Pot ${fmtNum(pay.winnerPayout)}` : `Room ${roomCode}`,
    statusText: 'R 1/7',
    statusTone: 'turn',
    themeClass: 'gfs-theme-trivia',
    html: `
      <div class="arc-stage" id="mcStage" data-testid="mind-clash-stage">
        <div class="mc-track-card">
          <div class="mc-racer">
            <span>${esc(p1Name.slice(0, 10))}</span>
            <div class="mc-bar"><i id="mcMyBar" style="width:0%"></i></div>
            <b id="mcMyPts" data-testid="mc-score">0</b>
          </div>
          <div class="mc-racer rival">
            <span>${esc(oppName.slice(0, 10))}</span>
            <div class="mc-bar"><i id="mcOppBar" style="width:0%"></i></div>
            <b id="mcOppPts">0</b>
          </div>
        </div>

        <div id="mcVoiceHost">${window.VoiceNarrator ? window.VoiceNarrator.renderBar('mc') : ''}</div>
        <div id="mcBody"></div>
        <div id="mcChatHost"></div>
      </div>
    `
  });

  if (window.VoiceNarrator) window.VoiceNarrator.bindBar($('#mcVoiceHost', view), 'mc');

  if (typeof createInGameChatWidget === 'function' && $('#mcChatHost', view)) {
    chatWidget = createInGameChatWidget({
      gameId: 'mind_clash',
      roomCode,
      quickLines: ['Big brain! 🧠', 'Too fast ⚡', 'Close round!', 'GG!']
    });
    chatWidget.mount($('#mcChatHost', view));
  }

  const syncTrack = () => {
    const maxPts = deck.length * 18;
    if ($('#mcMyPts', view)) $('#mcMyPts', view).textContent = String(myScore);
    if ($('#mcOppPts', view)) $('#mcOppPts', view).textContent = String(oppScore);
    if ($('#mcMyBar', view)) $('#mcMyBar', view).style.width = `${Math.min(100, Math.round((myScore / maxPts) * 100))}%`;
    if ($('#mcOppBar', view)) $('#mcOppBar', view).style.width = `${Math.min(100, Math.round((oppScore / maxPts) * 100))}%`;
  };

  const renderRound = () => {
    clearInterval(tickId);
    const body = $('#mcBody', view);
    if (!body) return;
    syncTrack();

    if (idx >= deck.length) {
      over = true;
      const outcome = myScore > oppScore ? 'win' : (myScore === oppScore ? 'tie' : 'lose');
      const res = settleArenaMatchOutcome(outcome, stake, 48, 34, 12);
      if (outcome === 'win') spawnArenaSparks($('#mcStage', view), '#fde047', 16);
      view.setStatus('Finished', outcome === 'win' ? 'ok' : (outcome === 'tie' ? 'neutral' : 'bot'));
      body.innerHTML = `
        <div class="arena-result-card" data-testid="mc-result-card">
          <b>${esc(res.headline)}</b>
          <small>Score ${myScore} – ${oppScore} · ${esc(res.detail)}</small>
          <div class="row" style="gap:8px;margin-top:10px;justify-content:center">
            <button type="button" class="btn ghost sm" id="mcExitBtn">Exit</button>
            <button type="button" class="btn gold sm" id="mcRematchBtn">Rematch</button>
          </div>
        </div>
      `;
      $('#mcExitBtn', body).onclick = () => view.close();
      $('#mcRematchBtn', body).onclick = () => {
        if (typeof openVisualModeSelect === 'function') openVisualModeSelect('mind_clash', o.rival?.uid);
        else launchMindClash(o);
      };
      return;
    }

    const q = deck[idx];
    secLeft = 10;
    locked = false;
    view.setStatus(`R ${idx + 1}/${deck.length}`, 'turn');

    body.innerHTML = `
      <div class="mc-q-meta">
        <span class="mc-kind">${esc(q.kind)}</span>
        <span class="mc-timer" id="mcTimer">⏱ 10s</span>
      </div>
      <div class="sq-question-glass"><b>${esc(q.q)}</b></div>
      <div class="sq-opts-grid">
        ${q.o.map((opt, i) => `<button type="button" class="sq-opt-btn" data-mca="${i}"><span class="sq-opt-ltr">${String.fromCharCode(65 + i)}</span><span>${esc(opt)}</span></button>`).join('')}
      </div>
    `;

    if (window.VoiceNarrator) {
      window.VoiceNarrator.speak({ enText: q.q, hiSpoken: q.hiSpoken || q.q, bnSpoken: q.bnSpoken || q.q });
    }

    const submitChoice = (pick) => {
      if (over || locked) return;
      locked = true;
      clearInterval(tickId);
      const ok = pick === q.a;
      const pts = AR.scoreMindClashAnswer(ok, secLeft);
      myScore += pts;
      // HARD BLOCK: Only simulate bot score in explicit Bot/Practice mode!
      if (botAllowed && !isLiveOnline) {
        const oppAcc = botTier === 'pro' ? 0.84 : 0.62;
        if (Math.random() < oppAcc) {
          oppScore += AR.scoreMindClashAnswer(true, botTier === 'pro' ? 6 + Math.random() * 3 : 3 + Math.random() * 4);
        }
      }
      if (isLiveOnline && liveSync) {
        liveSync.pushState({ senderUid: myUid, score: myScore, round: idx + 1 });
      }
      if (pick >= 0) {
        const chosenBtn = body.querySelector(`[data-mca="${pick}"]`);
        if (chosenBtn) chosenBtn.classList.add(ok ? 'correct' : 'wrong');
      }
      const rightBtn = body.querySelector(`[data-mca="${q.a}"]`);
      if (rightBtn) rightBtn.classList.add('correct');
      if (typeof playSfx === 'function') playSfx(ok ? 'duelCorrect' : 'duelWrong');
      if (ok) spawnArenaSparks($('#mcStage', view), '#34d399', 10);
      syncTrack();
      nextId = setTimeout(() => { idx++; renderRound(); }, 520);
    };

    $$('[data-mca]', body).forEach(b => {
      b.onclick = () => submitChoice(Number(b.dataset.mca));
    });

    tickId = setInterval(() => {
      if (over || locked) return;
      secLeft--;
      if ($('#mcTimer', view)) $('#mcTimer', view).textContent = `⏱ ${Math.max(0, secLeft)}s`;
      if (secLeft <= 0) submitChoice(-1);
    }, 1000);
  };

  if (isLiveOnline && roomId && typeof window.createLiveMatchSync === 'function') {
    liveSync = window.createLiveMatchSync({
      roomId,
      roomCode,
      gameId: 'mind_clash',
      myUid,
      myName: myProfile.name,
      oppUids: ctrl && ctrl.oppUid ? [ctrl.oppUid] : [],
      onLeaveRequest: () => view.close(),
      onState: (payload) => {
        if (!payload || payload.senderUid === myUid) return;
        if (typeof payload.score === 'number') {
          oppScore = Math.max(oppScore, payload.score);
          syncTrack();
        }
      }
    });
    liveSync.mountConnectionBanner($('#mcStage', view));
  }

  view.onclose = () => {
    over = true;
    clearInterval(tickId);
    clearTimeout(nextId);
    if (liveSync) liveSync.destroy();
    if (window.VoiceNarrator) window.VoiceNarrator.stop();
    if (chatWidget) chatWidget.destroy();
    if (typeof clearMyLiveActivity === 'function') clearMyLiveActivity();
  };

  renderRound();
  return view;
}
window.launchMindClash = launchMindClash;

/* ---------- 4. POCKET TERRITORY ---------- */
function launchPocketTerritory(opts) {
  const AR = window.ArcadeRules;
  if (!AR) return;
  const o = opts || {};
  const myUid = (typeof uid !== 'undefined' && uid) ? String(uid) : 'local_me';
  const myProfile = { uid: myUid, name: (typeof me !== 'undefined' && me?.name) || 'You', avatar: (typeof me !== 'undefined' && me?.avatar) || 'av_b1' };
  const ctrl = window.PvpSyncRules ? window.PvpSyncRules.resolve2PControl(o, myUid, myProfile) : null;
  const isLiveOnline = Boolean(ctrl && ctrl.isLiveOnline);
  const isLocalPvp = ctrl ? ctrl.isLocalPassAndPlay : (o.modeType === 'pvp' && !o.rivalBot);
  const mySide = ctrl ? ctrl.mySide : 'p1';
  const modeType = ctrl ? ctrl.modeType : (o.modeType || 'bot');
  const botTier = o.botTier || (o.stake > 0 ? 'pro' : 'standard');
  const stake = Math.max(0, Math.floor(Number(o.stake || 0)));
  const roomId = String(o.roomId || (ctrl && ctrl.roomId) || '').trim();
  const roomCode = String(o.roomCode || (ctrl && ctrl.roomCode) || ('PT' + Math.floor(1000 + Math.random() * 9000))).toUpperCase();
  const p1Name = (ctrl && ctrl.p1Name) || myProfile.name;
  const p2Name = (ctrl && ctrl.p2Name) || o.rival?.name || (isLocalPvp ? 'Player 2' : (botTier === 'pro' ? 'Pro Bot' : 'AI Bot'));
  const shortPt = (nm) => {
    const s = String(nm || '').trim();
    return s.length > 12 ? (s.slice(0, 11) + '…') : s;
  };
  const p1Lbl = shortPt(p1Name);
  const p2Lbl = shortPt(p2Name);
  const pay = AR.calcMatchPayout(stake);

  const canActNow = () => {
    if (over) return false;
    if (window.PvpSyncRules && ctrl) return window.PvpSyncRules.canActOn2PTurn(state.turn, ctrl);
    return state.turn === 'p1' || isLocalPvp;
  };
  const shouldRunBotNow = () => {
    if (over) return false;
    if (window.PvpSyncRules && ctrl) return window.PvpSyncRules.shouldRun2PBot(state.turn, ctrl);
    return !isLocalPvp && !isLiveOnline && state.turn === 'p2';
  };

  if (typeof setMyLiveActivity === 'function') {
    setMyLiveActivity({ type: 'playing', gameId: 'pocket_territory', gameName: 'Pocket Territory', roomCode, mode: modeType });
  }

  const state = AR.createTerritoryState();
  let activePower = 'claim'; // 'claim' | 'shield' | 'bomb' | 'double'
  let botTimer = 0;
  let over = false;
  let chatWidget = null;
  let liveSync = null;

  const view = openFullScreenGameView({
    gameId: 'pocket_territory',
    title: 'Pocket Territory',
    subMeta: stake > 0 ? `${stake} 🪙 · Pot ${fmtNum(pay.winnerPayout)}` : `Room ${roomCode}`,
    statusText: isLiveOnline && mySide !== 'p1' ? `${p1Name}…` : 'Your Turn',
    statusTone: 'turn',
    themeClass: 'gfs-theme-wood',
    html: `
      <div class="arc-stage" id="ptStage" data-testid="territory-stage">
        <div class="pt-dom-card">
          <div class="pt-dom-nums">
            <b class="p1" id="ptP1Cnt">🔵 ${esc(p1Lbl)}: 1</b>
            <span id="ptTurnsLbl">${state.turnsLeft} left</span>
            <b class="p2" id="ptP2Cnt">${esc(p2Lbl)}: 1 🔴</b>
          </div>
          <div class="pt-dom-bar"><i id="ptBarP1" style="width:50%"></i></div>
        </div>

        <div class="pt-grid" id="ptGrid" data-testid="pt-grid" role="grid" aria-label="Pocket Territory 6x6 Board"></div>

        <div class="pt-power-dock" id="ptPowerDock">
          <button type="button" class="pt-pow-btn" data-ptpow="shield" id="ptPowShield">🛡️ Shield <b>1</b></button>
          <button type="button" class="pt-pow-btn" data-ptpow="bomb" id="ptPowBomb">💥 Bomb <b>1</b></button>
          <button type="button" class="pt-pow-btn" data-ptpow="double" id="ptPowDouble">⚡ 2× Move <b>1</b></button>
        </div>

        <div id="ptResultHost"></div>
        <div id="ptChatHost"></div>
      </div>
    `
  });

  if (typeof createInGameChatWidget === 'function' && $('#ptChatHost', view)) {
    chatWidget = createInGameChatWidget({
      gameId: 'pocket_territory',
      roomCode,
      quickLines: ['Territory stolen! 💥', 'Shielded! 🛡️', 'Double claim ⚡', 'GG! 👏']
    });
    chatWidget.mount($('#ptChatHost', view));
  }

  const finish = () => {
    if (over) return;
    over = true;
    clearTimeout(botTimer);
    const counts = AR.countTerritory(state);
    const iWon = state.winner === mySide;
    const outcome = state.winner === 'tie' ? 'tie' : (isLocalPvp ? 'win' : (iWon ? 'win' : 'lose'));
    const res = settleArenaMatchOutcome(outcome, stake, 52, 36, 14);
    if (iWon) spawnArenaSparks($('#ptStage', view), '#38bdf8', 18);
    view.setStatus('Finished', outcome === 'win' ? 'ok' : (outcome === 'tie' ? 'neutral' : 'bot'));
    const host = $('#ptResultHost', view);
    if (host) {
      host.innerHTML = `
        <div class="arena-result-card" data-testid="pt-result-card">
          <b>${state.winner === 'tie' ? '🤝 Territory Draw' : (isLocalPvp ? `🏆 ${esc(state.winner === 'p1' ? p1Name : p2Name)} Wins!` : esc(res.headline))}</b>
          <small>Tiles ${counts.p1} vs ${counts.p2} · ${esc(res.detail)}</small>
          <div class="row" style="gap:8px;margin-top:10px;justify-content:center">
            <button type="button" class="btn ghost sm" id="ptExitBtn">Exit</button>
            <button type="button" class="btn gold sm" id="ptRematchBtn">Rematch</button>
          </div>
        </div>
      `;
      $('#ptExitBtn', host).onclick = () => view.close();
      $('#ptRematchBtn', host).onclick = () => {
        if (typeof openVisualModeSelect === 'function') openVisualModeSelect('pocket_territory', o.rival?.uid);
        else launchPocketTerritory(o);
      };
    }
  };

  const renderBoard = () => {
    const counts = AR.countTerritory(state);
    const pct = Math.round((counts.p1 / Math.max(1, counts.p1 + counts.p2)) * 100);
    if ($('#ptP1Cnt', view)) $('#ptP1Cnt', view).textContent = `🔵 ${p1Lbl}: ${counts.p1}`;
    if ($('#ptP2Cnt', view)) $('#ptP2Cnt', view).textContent = `${p2Lbl}: ${counts.p2} 🔴`;
    if ($('#ptTurnsLbl', view)) $('#ptTurnsLbl', view).textContent = `${state.turnsLeft} left`;
    if ($('#ptBarP1', view)) $('#ptBarP1', view).style.width = `${pct}%`;

    const curKey = state.turn;
    const canAct = canActNow();
    const pows = state.powers[isLiveOnline ? mySide : curKey];

    const bindPowBtn = (id, key) => {
      const btn = $(id, view);
      if (!btn) return;
      const bEl = btn.querySelector('b');
      if (bEl) bEl.textContent = String(pows[key]);
      btn.disabled = !canAct || pows[key] <= 0;
      btn.classList.toggle('on', activePower === key);
    };
    bindPowBtn('#ptPowShield', 'shield');
    bindPowBtn('#ptPowBomb', 'bomb');
    bindPowBtn('#ptPowDouble', 'double');

    const gridEl = $('#ptGrid', view);
    if (!gridEl) return;
    let html = '';
    for (let r = 0; r < state.size; r++) {
      for (let c = 0; c < state.size; c++) {
        const cell = state.grid[r][c];
        const rivalKey = curKey === 'p1' ? 'p2' : 'p1';
        let valid = false;
        if (canAct) {
          if (activePower === 'shield') valid = cell.owner === curKey && !cell.shield;
          else if (activePower === 'bomb') valid = cell.owner === rivalKey;
          else valid = cell.owner === null;
        }
        html += `<button type="button" class="pt-cell ${cell.owner || 'empty'} ${cell.shield ? 'shielded' : ''} ${valid ? 'valid' : ''}" data-ptr="${r}" data-ptc="${c}" ${valid ? '' : 'disabled'} aria-label="Tile ${r + 1},${c + 1}">
          ${cell.shield ? '🛡️' : (cell.owner === 'p1' ? '◆' : (cell.owner === 'p2' ? '●' : ''))}
        </button>`;
      }
    }
    gridEl.innerHTML = html;
    if (!over) {
      const extraTag = state.extraMoves > 0 ? ' (2×!)' : '';
      const activeNm = curKey === 'p1' ? p1Name : p2Name;
      view.setStatus((canAct ? (isLocalPvp ? `${activeNm} Turn` : 'Your Turn') : `${activeNm}…`) + extraTag, canAct ? 'turn' : 'bot');
    }
  };

  const pushPtSync = () => {
    if (isLiveOnline && liveSync) {
      liveSync.pushState({
        grid: state.grid,
        powers: state.powers,
        turn: state.turn,
        turnsLeft: state.turnsLeft,
        extraMoves: state.extraMoves,
        winner: state.winner
      });
    }
  };

  if (isLiveOnline && roomId && typeof window.createLiveMatchSync === 'function') {
    liveSync = window.createLiveMatchSync({
      roomId,
      roomCode,
      gameId: 'pocket_territory',
      myUid,
      myName: myProfile.name,
      oppUids: ctrl && ctrl.oppUid ? [ctrl.oppUid] : [],
      onLeaveRequest: () => view.close(),
      onState: (snap) => {
        if (over || !snap) return;
        if (Array.isArray(snap.grid)) state.grid = snap.grid;
        if (snap.powers) state.powers = snap.powers;
        if (snap.turn) state.turn = snap.turn;
        if (snap.turnsLeft !== undefined) state.turnsLeft = Number(snap.turnsLeft);
        if (snap.extraMoves !== undefined) state.extraMoves = Number(snap.extraMoves);
        state.winner = snap.winner || null;
        activePower = 'claim';
        if (typeof playSfx === 'function') playSfx('pawnStep');
        renderBoard();
        if (state.winner) finish();
      }
    });
    liveSync.mountConnectionBanner($('#ptStage', view));
  }

  const runBotTurn = () => {
    if (!shouldRunBotNow()) return; // HARD BLOCK: Never run bot AI in live PvP/invite rooms!
    botTimer = setTimeout(() => {
      if (!shouldRunBotNow()) return;
      const mv = AR.chooseTerritoryBotMove(state, botTier);
      if (!mv) return;
      const res = AR.applyTerritoryMove(state, 'p2', mv.r, mv.c, mv.powerMode);
      if (res.ok) {
        if (typeof playSfx === 'function') playSfx(res.flipped > 0 ? 'capture' : 'tap');
        renderBoard();
        if (res.winner) finish();
        else if (shouldRunBotNow()) runBotTurn();
      }
    }, botTier === 'pro' ? 520 : 680);
  };

  $('#ptPowerDock', view).onclick = (e) => {
    if (!canActNow()) return;
    const btn = e.target.closest('[data-ptpow]');
    if (!btn || btn.disabled) return;
    const p = btn.dataset.ptpow;
    activePower = activePower === p ? 'claim' : p;
    if (typeof playSfx === 'function') playSfx('tap');
    renderBoard();
  };

  $('#ptGrid', view).onclick = (e) => {
    if (!canActNow()) return;
    const curKey = state.turn;
    const btn = e.target.closest('[data-ptr]');
    if (!btn) return;
    const r = Number(btn.dataset.ptr), c = Number(btn.dataset.ptc);
    const res = AR.applyTerritoryMove(state, curKey, r, c, activePower);
    if (!res.ok) return;
    activePower = 'claim';
    if (res.action === 'shield') {
      if (typeof playSfx === 'function') playSfx('rowClear');
      renderBoard();
      pushPtSync();
      return;
    }
    if (typeof playSfx === 'function') playSfx(res.flipped > 0 ? 'capture' : 'pawnStep');
    if (res.flipped >= 2) spawnArenaSparks($('#ptGrid', view), curKey === 'p1' ? '#38bdf8' : '#f43f5e', 12);
    renderBoard();
    pushPtSync();
    if (res.winner) finish();
    else if (shouldRunBotNow()) runBotTurn();
  };

  view.onclose = () => {
    over = true;
    clearTimeout(botTimer);
    if (liveSync) liveSync.destroy();
    if (chatWidget) chatWidget.destroy();
    if (typeof clearMyLiveActivity === 'function') clearMyLiveActivity();
  };

  renderBoard();
  return view;
}
window.launchPocketTerritory = launchPocketTerritory;
