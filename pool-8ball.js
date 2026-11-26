"use strict";
/* =====================================================================
   8-BALL POOL — FIXED HD PHYSICS, DRAG AIM, PULL-BACK POWER & FULL RULES
   · Authentic Solids (1-4) vs Stripes (9-12) + 8-Ball Win/Foul Detection
   · Ghost-Ball Trajectory + Target Deflection Preview
   · Ball-in-Hand Placement After Scratch/Foul
   · Smooth Mobile Touch Drag Aim + Pull-Back Cue Power Bar + Fine Nudge
   · Supports Bot VS (Normal Free / Hard Coins), Player VS (Bet), Invite Room
   ===================================================================== */

function launchPool8BallPro(opts) {
  const AR = window.ArcadeRules;
  if (!AR) {
    if (typeof toast === 'function') toast('Pool engine failed to load');
    return;
  }
  const o = opts || {};
  const modeType = o.modeType || 'bot'; // 'bot' | 'pvp' | 'invite'
  const botTier = o.botTier || (o.stake > 0 ? 'pro' : 'standard');
  const stake = Math.max(0, Math.floor(Number(o.stake || 0)));
  const roomCode = String(o.roomCode || ('PL' + Math.floor(1000 + Math.random() * 9000))).toUpperCase();
  const isLocalPvp = modeType === 'pvp' && !o.rivalBot;
  const p1Name = (typeof me !== 'undefined' && me.name) ? me.name : 'You';
  const p2Name = o.rival?.name || (isLocalPvp ? 'Player 2' : (botTier === 'pro' ? 'Pro Pool Bot' : 'Pool Bot'));
  const pay = AR.calcMatchPayout(stake);

  if (typeof setMyLiveActivity === 'function') {
    setMyLiveActivity({ type: 'playing', gameId: 'pool_8ball', gameName: '8-Ball Pool', roomCode, mode: modeType });
  }

  const state = AR.createPoolRack();
  const P = AR.POOL;
  const particles = [];
  let aimAngle = 0; // radians from cue ball
  let powerPct = 62; // 10..100
  let draggingAim = false;
  let draggingPower = false;
  let powerStartY = 0;
  let botTimeout = 0;
  let rafId = 0;
  let closed = false;
  let cuePullVisual = 0;
  let bannerMsg = 'Drag felt to aim · Pull power bar to shoot';
  let chatWidget = null;

  const subMeta = stake > 0
    ? `${stake} 🪙 · Pot ${fmtNum(pay.winnerPayout)}`
    : (isLocalPvp ? `Player VS · ${roomCode}` : `Bot ${botTier === 'pro' ? 'Hard' : 'Normal'}`);

  const view = openFullScreenGameView({
    gameId: 'pool_8ball',
    title: '8-Ball Pool',
    subMeta,
    statusText: 'Your Shot',
    statusTone: 'turn',
    themeClass: 'gfs-theme-felt',
    html: `
      <div class="pool-pro-wrap" id="poolProWrap" data-testid="pool-pro-stage">
        <div class="pool-top-hud">
          <div class="pool-pcard active" id="plCard1">
            <div class="pool-phead">
              <b>${esc(p1Name.slice(0, 14))}</b>
              <span class="pool-grp-lbl" id="plGrp1">Open</span>
            </div>
            <div class="pool-rack-dots" id="plDots1"></div>
          </div>
          <div class="pool-vs-mid">
            ${stake > 0 ? `<b class="pool-pot-val">🪙 ${fmtNum(pay.winnerPayout)}</b>` : `<b class="pool-pot-val">8-BALL</b>`}
            <small id="plTurnTag">P1 TURN</small>
          </div>
          <div class="pool-pcard" id="plCard2">
            <div class="pool-phead">
              <b>${esc(p2Name.slice(0, 14))}</b>
              <span class="pool-grp-lbl" id="plGrp2">Open</span>
            </div>
            <div class="pool-rack-dots" id="plDots2"></div>
          </div>
        </div>

        <div class="pool-table-box" id="poolTableBox">
          <canvas id="poolProCanvas" width="${P.W}" height="${P.H}" data-testid="pool-canvas" aria-label="8-Ball Pool Table"></canvas>
          <div class="pool-banner-pill" id="plBanner" data-testid="pool-status">${esc(bannerMsg)}</div>
        </div>

        <div class="pool-ctrl-dock" id="poolCtrlDock">
          <div class="pool-aim-nudge">
            <button type="button" class="pool-nudge-btn" id="plAimL" aria-label="Aim left">↺</button>
            <button type="button" class="pool-nudge-btn" id="plAimR" aria-label="Aim right">↻</button>
          </div>
          <div class="pool-power-wrap">
            <div class="pool-power-top">
              <span>POWER</span>
              <b id="plPowVal">62%</b>
            </div>
            <input type="range" id="plPowRange" class="pool-power-slider" min="15" max="100" value="62" aria-label="Shot power">
          </div>
          <button type="button" class="btn gold pool-shoot-btn" id="plShootBtn" data-testid="pool-shoot-btn">SHOOT</button>
        </div>

        <div id="plChatHost"></div>
        <div id="plResultHost"></div>
      </div>
    `
  });

  const canvas = $('#poolProCanvas', view);
  const ctx = canvas.getContext('2d');
  const powRange = $('#plPowRange', view);
  const powValEl = $('#plPowVal', view);
  const shootBtn = $('#plShootBtn', view);

  // Mount in-game chat cleanly
  if (typeof createInGameChatWidget === 'function' && $('#plChatHost', view)) {
    chatWidget = createInGameChatWidget({
      gameId: 'pool_8ball',
      roomCode,
      quickLines: ['Nice shot! 🎱', 'Close one!', '8-Ball time 🔥', 'GG! 👏']
    });
    chatWidget.mount($('#plChatHost', view));
  }

  const isHumanTurn = () => !state.winner && !state.shotActive && (state.turn === 'p1' || isLocalPvp);

  const renderGroupDots = (playerKey) => {
    const grp = state.groups[playerKey];
    if (!grp) return '<span class="pool-dot open"></span><span class="pool-dot open"></span><span class="pool-dot open"></span><span class="pool-dot open"></span>';
    const list = state.balls.filter(b => b.group === grp);
    return list.map(b => `<span class="pool-dot ${b.alive ? 'alive' : 'potted'} ${b.stripe ? 'stripe' : ''}" style="--bc:${b.color}" title="#${b.num}">${b.alive ? b.num : '✓'}</span>`).join('');
  };

  const syncHud = () => {
    const g1 = state.groups.p1;
    const g2 = state.groups.p2;
    const c1 = $('#plCard1', view);
    const c2 = $('#plCard2', view);
    if (c1) c1.classList.toggle('active', !state.winner && state.turn === 'p1');
    if (c2) c2.classList.toggle('active', !state.winner && state.turn === 'p2');
    if ($('#plGrp1', view)) $('#plGrp1', view).textContent = g1 ? (g1 === 'solids' ? 'Solids' : 'Stripes') : 'Open';
    if ($('#plGrp2', view)) $('#plGrp2', view).textContent = g2 ? (g2 === 'solids' ? 'Solids' : 'Stripes') : 'Open';
    if ($('#plDots1', view)) $('#plDots1', view).innerHTML = renderGroupDots('p1');
    if ($('#plDots2', view)) $('#plDots2', view).innerHTML = renderGroupDots('p2');
    if ($('#plTurnTag', view)) {
      $('#plTurnTag', view).textContent = state.winner
        ? 'FINISHED'
        : (state.ballInHand ? 'BALL IN HAND' : (state.turn === 'p1' ? 'P1 SHOT' : (isLocalPvp ? 'P2 SHOT' : 'BOT SHOT')));
    }
    if ($('#plBanner', view)) $('#plBanner', view).textContent = bannerMsg;
    if (shootBtn) shootBtn.disabled = !isHumanTurn() || state.ballInHand;

    const statusTxt = state.winner
      ? (state.winner === 'p1' ? 'Victory' : 'Finished')
      : (state.ballInHand ? 'Place Cue' : (state.turn === 'p1' ? 'Your Shot' : `${p2Name}…`));
    view.setStatus(statusTxt, state.winner ? (state.winner === 'p1' ? 'ok' : 'bot') : (state.turn === 'p1' ? 'turn' : 'bot'));
  };

  const spawnPocketBurst = (x, y, col) => {
    for (let i = 0; i < 16; i++) {
      const ang = (Math.PI * 2 * i) / 16 + Math.random() * 0.2;
      const spd = 1.4 + Math.random() * 3.0;
      particles.push({ x, y, vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd, life: 1, col });
    }
  };

  const findGhostBallImpact = (angle) => {
    const ux = Math.cos(angle), uy = Math.sin(angle);
    const sx = state.cue.x, sy = state.cue.y;
    let bestT = 260;
    let hitBall = null;
    const minX = P.RAIL + P.BALL_R, maxX = P.W - P.RAIL - P.BALL_R;
    const minY = P.RAIL + P.BALL_R, maxY = P.H - P.RAIL - P.BALL_R;

    // Wall intersection
    if (ux < -0.0001) bestT = Math.min(bestT, (minX - sx) / ux);
    if (ux > 0.0001) bestT = Math.min(bestT, (maxX - sx) / ux);
    if (uy < -0.0001) bestT = Math.min(bestT, (minY - sy) / uy);
    if (uy > 0.0001) bestT = Math.min(bestT, (maxY - sy) / uy);

    // Ray-circle against object balls (radius = 2 * BALL_R)
    const hitR = P.BALL_R * 2;
    for (const b of state.balls) {
      if (!b.alive) continue;
      const fx = sx - b.x, fy = sy - b.y;
      const proj = fx * ux + fy * uy;
      const c = fx * fx + fy * fy - hitR * hitR;
      const disc = proj * proj - c;
      if (disc >= 0) {
        const t = -proj - Math.sqrt(disc);
        if (t > 1 && t < bestT) {
          bestT = t;
          hitBall = b;
        }
      }
    }
    return { gx: sx + ux * bestT, gy: sy + uy * bestT, hitBall };
  };

  const fireShot = (angle, pct) => {
    if (state.shotActive || state.winner || state.ballInHand) return;
    const clampedPct = Math.max(12, Math.min(100, Number(pct) || 60));
    const speed = (clampedPct / 100) * P.MAX_POWER;
    state.cue.vx = Math.cos(angle) * speed;
    state.cue.vy = Math.sin(angle) * speed;
    state.shotActive = true;
    state.firstHitGroup = null;
    state.pottedThisShot = [];
    state.scratched = false;
    cuePullVisual = 0;
    bannerMsg = state.turn === 'p1' ? 'Shot in motion…' : `${p2Name} shot!`;
    if (typeof playSfx === 'function') playSfx('poolHit');
    syncHud();
  };

  const finishMatch = () => {
    const p1Won = state.winner === 'p1';
    const outcome = isLocalPvp ? 'win' : (p1Won ? 'win' : 'lose');
    const res = settleArenaMatchOutcome(outcome, stake, 55, 38, 14);
    if (p1Won) spawnArenaSparks($('#poolTableBox', view), '#fde047', 18);
    if (typeof recordMatchHistory === 'function') {
      recordMatchHistory('pool_8ball', p1Won ? 'win' : 'lose', stake, modeType);
    }
    syncHud();
    const host = $('#plResultHost', view);
    if (host) {
      host.innerHTML = `
        <div class="arena-result-card pool-go-card" data-testid="pool-result-card">
          <b>${isLocalPvp ? `🏆 ${esc(p1Won ? p1Name : p2Name)} Wins!` : esc(res.headline)}</b>
          <small>${esc(state.winReason)} · ${esc(res.detail)}</small>
          <div class="row" style="gap:8px;margin-top:10px;justify-content:center">
            <button type="button" class="btn ghost sm" id="plExitBtn">Exit</button>
            <button type="button" class="btn gold sm" id="plRematchBtn">Rematch</button>
          </div>
        </div>
      `;
      $('#plExitBtn', host).onclick = () => view.close();
      $('#plRematchBtn', host).onclick = () => {
        if (typeof openVisualModeSelect === 'function') openVisualModeSelect('pool_8ball', o.rival?.uid);
        else launchPool8BallPro(o);
      };
    }
  };

  const scheduleBotShot = () => {
    if (closed || state.winner || state.turn !== 'p2' || isLocalPvp) return;
    clearTimeout(botTimeout);
    botTimeout = setTimeout(() => {
      if (closed || state.winner || state.turn !== 'p2') return;
      // Handle Ball-in-Hand placement cleanly for bot
      if (state.ballInHand) {
        const spot = AR.findOpenCueSpot(state, 180 + Math.random() * 140, 100 + Math.random() * 160);
        state.cue.x = spot.x;
        state.cue.y = spot.y;
        state.ballInHand = false;
      }

      const myGrp = state.groups.p2;
      const targets = myGrp
        ? (AR.countRemainingInGroup(state, myGrp) > 0
          ? state.balls.filter(b => b.alive && b.group === myGrp)
          : state.balls.filter(b => b.alive && b.group === 'eight'))
        : state.balls.filter(b => b.alive && b.group !== 'eight');

      if (!targets.length) return;

      // Pick best ghost-ball angle toward a pocket
      let bestAngle = 0;
      let bestScore = -Infinity;
      let bestPower = 68;
      for (const b of targets) {
        for (const pk of state.pockets) {
          const pdx = pk.x - b.x, pdy = pk.y - b.y;
          const pDist = Math.hypot(pdx, pdy) || 1;
          const gx = b.x - (pdx / pDist) * (P.BALL_R * 2);
          const gy = b.y - (pdy / pDist) * (P.BALL_R * 2);
          const cdx = gx - state.cue.x, cdy = gy - state.cue.y;
          const cDist = Math.hypot(cdx, cdy) || 1;
          const cutDot = (cdx * pdx + cdy * pdy) / (cDist * pDist);
          if (cutDot < 0.2) continue; // steep back-cut
          const sc = cutDot * 120 - pDist * 0.16 - cDist * 0.08;
          if (sc > bestScore) {
            bestScore = sc;
            bestAngle = Math.atan2(cdy, cdx);
            bestPower = Math.max(46, Math.min(92, 42 + (pDist + cDist) * 0.09));
          }
        }
      }
      if (bestScore === -Infinity) {
        const t = targets[0];
        bestAngle = Math.atan2(t.y - state.cue.y, t.x - state.cue.x);
      }
      const spread = botTier === 'pro' ? 0.025 : 0.095;
      aimAngle = bestAngle + (Math.random() - 0.5) * spread;
      fireShot(aimAngle, bestPower);
    }, botTier === 'pro' ? 620 : 840);
  };

  const drawBall = (b) => {
    // Contact shadow
    ctx.beginPath();
    ctx.arc(b.x + 2.5, b.y + 3.5, b.r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.42)';
    ctx.fill();

    // Base sphere
    ctx.save();
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.clip();

    if (b.stripe) {
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(b.x - b.r, b.y - b.r, b.r * 2, b.r * 2);
      ctx.fillStyle = b.color;
      ctx.fillRect(b.x - b.r, b.y - b.r * 0.54, b.r * 2, b.r * 1.08);
    } else {
      ctx.fillStyle = b.color;
      ctx.fillRect(b.x - b.r, b.y - b.r, b.r * 2, b.r * 2);
    }

    // 3D glossy highlight + rim shade
    const shade = ctx.createRadialGradient(b.x - b.r * 0.35, b.y - b.r * 0.35, 1.5, b.x, b.y, b.r);
    shade.addColorStop(0, 'rgba(255,255,255,0.68)');
    shade.addColorStop(0.32, 'rgba(255,255,255,0.06)');
    shade.addColorStop(1, 'rgba(0,0,0,0.48)');
    ctx.fillStyle = shade;
    ctx.fillRect(b.x - b.r, b.y - b.r, b.r * 2, b.r * 2);
    ctx.restore();

    // Crisp number circle
    if (b.num > 0) {
      ctx.beginPath();
      ctx.arc(b.x, b.y, 5.2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.94)';
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.font = '800 8px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(b.num), b.x, b.y + 0.5);
    }
  };

  const drawTable = () => {
    const R = P.RAIL;
    // Mahogany wood rail
    const wood = ctx.createLinearGradient(0, 0, P.W, P.H);
    wood.addColorStop(0, '#78350f');
    wood.addColorStop(0.5, '#451a03');
    wood.addColorStop(1, '#5c260a');
    ctx.fillStyle = wood;
    ctx.fillRect(0, 0, P.W, P.H);

    // Brass corner trims + diamond rail sights
    ctx.fillStyle = '#f59e0b';
    [[0, 0], [P.W - 22, 0], [0, P.H - 22], [P.W - 22, P.H - 22]].forEach(([x, y]) => {
      ctx.fillRect(x, y, 22, 22);
    });
    ctx.fillStyle = 'rgba(254, 240, 138, 0.72)';
    [168, 250, 390, 472].forEach(dx => {
      ctx.beginPath(); ctx.arc(dx, R * 0.45, 2.3, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(dx, P.H - R * 0.45, 2.3, 0, Math.PI * 2); ctx.fill();
    });

    // Emerald championship felt
    const felt = ctx.createRadialGradient(P.W * 0.5, P.H * 0.46, 30, P.W * 0.5, P.H * 0.5, P.W * 0.58);
    felt.addColorStop(0, '#0f766e');
    felt.addColorStop(0.52, '#065f46');
    felt.addColorStop(1, '#022c22');
    ctx.fillStyle = felt;
    ctx.fillRect(R, R, P.W - R * 2, P.H - R * 2);

    // Inner cushion bevel shadow
    ctx.strokeStyle = 'rgba(0,0,0,0.48)';
    ctx.lineWidth = 4;
    ctx.strokeRect(R + 1, R + 1, P.W - R * 2 - 2, P.H - R * 2 - 2);

    // Baulk line & head spot
    ctx.strokeStyle = 'rgba(255,255,255,0.16)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(166, R + 6);
    ctx.lineTo(166, P.H - R - 6);
    ctx.stroke();

    // 6 Pockets
    for (const pk of state.pockets) {
      ctx.beginPath(); ctx.arc(pk.x, pk.y, P.POCKET_R + 2, 0, Math.PI * 2);
      ctx.fillStyle = '#3f1d0b'; ctx.fill();
      ctx.beginPath(); ctx.arc(pk.x, pk.y, P.POCKET_R - 1, 0, Math.PI * 2);
      ctx.fillStyle = '#030712'; ctx.fill();
    }

    // Ball-in-Hand placement pulse ring
    if (state.ballInHand && isHumanTurn()) {
      ctx.save();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.arc(state.cue.x, state.cue.y, P.BALL_R + 8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Ghost-Ball Aim Line & Cue Stick
    if (isHumanTurn() && !state.ballInHand) {
      const imp = findGhostBallImpact(aimAngle);
      const ux = Math.cos(aimAngle), uy = Math.sin(aimAngle);

      // Dashed cue aim line
      ctx.save();
      ctx.setLineDash([6, 6]);
      ctx.strokeStyle = 'rgba(254, 240, 138, 0.84)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(state.cue.x + ux * (P.BALL_R + 2), state.cue.y + uy * (P.BALL_R + 2));
      ctx.lineTo(imp.gx, imp.gy);
      ctx.stroke();
      ctx.setLineDash([]);

      // Ghost ball circle
      ctx.beginPath();
      ctx.arc(imp.gx, imp.gy, P.BALL_R, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(254, 240, 138, 0.75)';
      ctx.lineWidth = 1.6;
      ctx.stroke();

      // Predicted target ball path
      if (imp.hitBall) {
        const tdx = imp.hitBall.x - imp.gx, tdy = imp.hitBall.y - imp.gy;
        const td = Math.hypot(tdx, tdy) || 1;
        ctx.strokeStyle = '#34d399';
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(imp.hitBall.x, imp.hitBall.y);
        ctx.lineTo(imp.hitBall.x + (tdx / td) * 72, imp.hitBall.y + (tdy / td) * 72);
        ctx.stroke();
      }

      // Glossy 2-piece billiard cue stick pulled back proportionally to power
      const pull = 16 + (powerPct / 100) * 34 + cuePullVisual;
      const tipX = state.cue.x - ux * pull;
      const tipY = state.cue.y - uy * pull;
      const buttX = state.cue.x - ux * (pull + 150);
      const buttY = state.cue.y - uy * (pull + 150);
      const cueGrad = ctx.createLinearGradient(tipX, tipY, buttX, buttY);
      cueGrad.addColorStop(0, '#38bdf8');
      cueGrad.addColorStop(0.05, '#fef3c7');
      cueGrad.addColorStop(0.62, '#d97706');
      cueGrad.addColorStop(1, '#3b1c0a');
      ctx.strokeStyle = cueGrad;
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(tipX, tipY);
      ctx.lineTo(buttX, buttY);
      ctx.stroke();
      ctx.restore();
    }

    // Draw all active balls
    if (state.cue.alive) drawBall(state.cue);
    for (const b of state.balls) {
      if (b.alive) drawBall(b);
    }

    // Pocket sparkle particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const pt = particles[i];
      pt.x += pt.vx; pt.y += pt.vy; pt.life -= 0.035;
      if (pt.life <= 0) { particles.splice(i, 1); continue; }
      ctx.globalAlpha = pt.life;
      ctx.fillStyle = pt.col;
      ctx.beginPath(); ctx.arc(pt.x, pt.y, 2.8, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
    }
  };

  const loop = () => {
    if (closed) return;
    if (state.shotActive) {
      const ev = AR.stepPoolPhysics(state);
      if (ev.ballHits > 0 && typeof playSfx === 'function') playSfx('tap');
      if (ev.potted.length > 0) {
        ev.potted.forEach(b => spawnPocketBurst(b.x, b.y, b.color === '#111827' ? '#fde047' : b.color));
        if (typeof playSfx === 'function') playSfx('duelCorrect');
        syncHud();
      }
      if (ev.scratched && typeof playSfx === 'function') playSfx('duelWrong');

      if (!AR.isPoolMoving(state)) {
        const res = AR.resolvePoolShot(state);
        bannerMsg = res.message || 'Next shot';
        if (res.foul && typeof playSfx === 'function') playSfx('duelWrong');
        if (res.winner) {
          finishMatch();
        } else {
          // Point cue aim toward a legal target automatically for snappy play
          const grp = state.groups[state.turn];
          const legal = state.balls.find(b => b.alive && (grp ? (AR.countRemainingInGroup(state, grp) > 0 ? b.group === grp : b.group === 'eight') : b.group !== 'eight'));
          if (legal) aimAngle = Math.atan2(legal.y - state.cue.y, legal.x - state.cue.x);
          syncHud();
          if (state.turn === 'p2' && !isLocalPvp) scheduleBotShot();
        }
      }
    }
    drawTable();
    rafId = requestAnimationFrame(loop);
  };

  const toCanvasXY = (ev) => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (ev.clientX - rect.left) * (P.W / rect.width),
      y: (ev.clientY - rect.top) * (P.H / rect.height)
    };
  };

  canvas.addEventListener('pointerdown', (ev) => {
    if (!isHumanTurn()) return;
    canvas.setPointerCapture?.(ev.pointerId);
    const pt = toCanvasXY(ev);
    if (state.ballInHand) {
      const spot = AR.findOpenCueSpot(state, pt.x, pt.y);
      state.cue.x = spot.x;
      state.cue.y = spot.y;
      state.ballInHand = false;
      bannerMsg = 'Cue placed! Aim & shoot.';
      if (typeof playSfx === 'function') playSfx('tap');
      syncHud();
      return;
    }
    draggingAim = true;
    aimAngle = Math.atan2(pt.y - state.cue.y, pt.x - state.cue.x);
  });

  canvas.addEventListener('pointermove', (ev) => {
    if (!isHumanTurn()) return;
    const pt = toCanvasXY(ev);
    if (state.ballInHand) {
      const spot = AR.findOpenCueSpot(state, pt.x, pt.y);
      state.cue.x = spot.x;
      state.cue.y = spot.y;
      return;
    }
    if (draggingAim) {
      aimAngle = Math.atan2(pt.y - state.cue.y, pt.x - state.cue.x);
    }
  });

  canvas.addEventListener('pointerup', () => { draggingAim = false; });
  canvas.addEventListener('pointercancel', () => { draggingAim = false; });

  if (powRange) {
    powRange.addEventListener('input', () => {
      powerPct = Number(powRange.value) || 60;
      if (powValEl) powValEl.textContent = `${powerPct}%`;
    });
    // Releasing slider after drag can also optionally shoot on mobile if user pulls hard, or let SHOOT fire cleanly
  }
  if ($('#plAimL', view)) {
    $('#plAimL', view).onclick = () => { if (isHumanTurn()) { aimAngle -= 0.045; if (typeof playSfx === 'function') playSfx('tap'); } };
  }
  if ($('#plAimR', view)) {
    $('#plAimR', view).onclick = () => { if (isHumanTurn()) { aimAngle += 0.045; if (typeof playSfx === 'function') playSfx('tap'); } };
  }
  if (shootBtn) {
    shootBtn.onclick = () => {
      if (!isHumanTurn() || state.ballInHand) return;
      fireShot(aimAngle, powerPct);
    };
  }

  view.onclose = () => {
    closed = true;
    clearTimeout(botTimeout);
    cancelAnimationFrame(rafId);
    if (chatWidget) chatWidget.destroy();
    if (typeof clearMyLiveActivity === 'function') clearMyLiveActivity();
  };

  syncHud();
  rafId = requestAnimationFrame(loop);
  return view;
}
window.launchPool8BallPro = launchPool8BallPro;
