"use strict";
/* ===== Study Game Flagship Multiplayer & Party Games Arena (Large Posters + 5 Playable Games + Rival Challenge) ===== */

const ARENA_GAMES = [
  { id: 'squad_arena', title: 'Squad Arena', tag: '1v1 / 2v2', players: '142', reward: '+60', bg: 'linear-gradient(120deg,#0284c7 0%,#4f46e5 55%,#7c3aed 100%)', border: '#7dd3fc', wide: true },
  { id: 'pool_8ball', title: '8-Ball Pool', tag: 'Physics', players: '98', reward: '+75', bg: 'linear-gradient(120deg,#059669 0%,#0f766e 58%,#064e3b 100%)', border: '#6ee7b7', wide: true },
  { id: 'undercover', title: 'Undercover', tag: '4–8 Spy', players: '116', reward: '+70', bg: 'linear-gradient(120deg,#e11d48 0%,#9333ea 60%,#4c1d95 100%)', border: '#fda4af', wide: true },
  { id: 'ludo_snakes', title: 'Ludo Express', tag: '2–4P', players: '84', reward: '+65', bg: 'linear-gradient(130deg,#f59e0b 0%,#ea580c 58%,#b91c1c 100%)', border: '#fde68a', wide: false },
  { id: 'blitz_dots', title: 'Blitz Dots', tag: '60s', players: '63', reward: '+60', bg: 'linear-gradient(130deg,#9333ea 0%,#ec4899 60%,#be185d 100%)', border: '#f5d0fe', wide: false }
];

function renderGamePosterSvg(id) {
  switch (id) {
    case 'pool_8ball':
      return `<svg class="wp-g-art" viewBox="0 0 180 120" fill="none" aria-hidden="true">
        <defs>
          <radialGradient id="gpb8" cx="35%" cy="28%" r="70%"><stop offset="0%" stop-color="#475569"/><stop offset="55%" stop-color="#0f172a"/><stop offset="100%" stop-color="#020617"/></radialGradient>
          <radialGradient id="gpbR" cx="35%" cy="28%" r="70%"><stop offset="0%" stop-color="#fca5a5"/><stop offset="55%" stop-color="#ef4444"/><stop offset="100%" stop-color="#991b1b"/></radialGradient>
          <radialGradient id="gpbY" cx="35%" cy="28%" r="70%"><stop offset="0%" stop-color="#fef08a"/><stop offset="55%" stop-color="#facc15"/><stop offset="100%" stop-color="#ca8a04"/></radialGradient>
          <linearGradient id="gpCue" x1="12" y1="106" x2="110" y2="56" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#92400e"/><stop offset="70%" stop-color="#fde68a"/><stop offset="100%" stop-color="#fff"/></linearGradient>
        </defs>
        <ellipse cx="115" cy="96" rx="52" ry="12" fill="#000" opacity=".28"/>
        <path d="M18 106L108 58" stroke="url(#gpCue)" stroke-width="6.5" stroke-linecap="round"/>
        <circle cx="136" cy="40" r="19" fill="url(#gpbY)" stroke="#fff" stroke-opacity=".35" stroke-width="1.2"/>
        <circle cx="150" cy="70" r="19" fill="url(#gpbR)" stroke="#fff" stroke-opacity=".35" stroke-width="1.2"/>
        <circle cx="112" cy="64" r="24" fill="url(#gpb8)" stroke="#fff" stroke-opacity=".32" stroke-width="1.5"/>
        <circle cx="112" cy="64" r="10.5" fill="#fff"/>
        <text x="112" y="68.5" text-anchor="middle" font-size="13" font-weight="900" fill="#0f172a">8</text>
        <ellipse cx="104" cy="51" rx="7" ry="3.2" transform="rotate(-24 104 51)" fill="#fff" opacity=".4"/>
        <circle cx="72" cy="84" r="14" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.2"/>
      </svg>`;
    case 'undercover':
      return `<svg class="wp-g-art" viewBox="0 0 180 120" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id="gpHat" x1="60" y1="16" x2="150" y2="96" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#312e81"/><stop offset="100%" stop-color="#0f172a"/></linearGradient>
          <linearGradient id="gpBand" x1="72" y1="44" x2="144" y2="54" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#fef08a"/><stop offset="100%" stop-color="#f59e0b"/></linearGradient>
        </defs>
        <circle cx="112" cy="60" r="46" fill="#f43f5e" opacity=".24"/>
        <path d="M56 112c4-24 22-36 54-36s50 12 54 36" fill="url(#gpHat)" stroke="#fda4af" stroke-width="2"/>
        <path d="M78 52h64l-8-26c-14-6-34-6-48 0l-8 26z" fill="url(#gpHat)" stroke="#ffd36b" stroke-width="1.8"/>
        <rect x="64" y="48" width="92" height="9" rx="4.5" fill="url(#gpBand)"/>
        <rect x="86" y="64" width="22" height="10" rx="5" fill="#38bdf8" stroke="#fff" stroke-width="1.2"/>
        <rect x="114" y="64" width="22" height="10" rx="5" fill="#f43f5e" stroke="#fff" stroke-width="1.2"/>
        <circle cx="152" cy="30" r="14" fill="#ffd36b" stroke="#fff" stroke-width="1.5"/>
        <text x="152" y="36" text-anchor="middle" font-size="18" font-weight="900" fill="#7c2d12">?</text>
      </svg>`;
    case 'ludo_snakes':
      return `<svg class="wp-g-art" viewBox="0 0 150 110" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id="gpDice" x1="66" y1="22" x2="132" y2="88" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#ffffff"/><stop offset="100%" stop-color="#fde68a"/></linearGradient>
          <linearGradient id="gpPawn" x1="30" y1="30" x2="64" y2="88" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#fde047"/><stop offset="100%" stop-color="#ea580c"/></linearGradient>
        </defs>
        <ellipse cx="96" cy="92" rx="42" ry="10" fill="#000" opacity=".28"/>
        <path d="M36 86c2-16 8-26 14-26s12 10 14 26H36z" fill="url(#gpPawn)" stroke="#fff" stroke-width="1.6"/>
        <circle cx="50" cy="48" r="11" fill="url(#gpPawn)" stroke="#fff" stroke-width="1.6"/>
        <rect x="72" y="24" width="54" height="54" rx="13" transform="rotate(8 99 51)" fill="url(#gpDice)" stroke="#fff" stroke-width="2"/>
        <circle cx="88" cy="40" r="4.5" fill="#dc2626"/><circle cx="110" cy="62" r="4.5" fill="#dc2626"/><circle cx="99" cy="51" r="5" fill="#0f172a"/>
        <circle cx="110" cy="40" r="4.5" fill="#0f172a"/><circle cx="88" cy="62" r="4.5" fill="#0f172a"/>
      </svg>`;
    case 'blitz_dots':
      return `<svg class="wp-g-art" viewBox="0 0 150 110" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id="gpBolt" x1="88" y1="12" x2="132" y2="96" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#fef08a"/><stop offset="55%" stop-color="#fbbf24"/><stop offset="100%" stop-color="#f97316"/></linearGradient>
        </defs>
        <rect x="34" y="26" width="38" height="38" rx="8" fill="#38bdf8" fill-opacity=".35" stroke="#7dd3fc" stroke-width="2.5"/>
        <rect x="72" y="26" width="38" height="38" rx="8" fill="#f472b6" fill-opacity=".35" stroke="#fbcfe8" stroke-width="2.5"/>
        <circle cx="34" cy="26" r="5" fill="#fff"/><circle cx="72" cy="26" r="5" fill="#fff"/><circle cx="110" cy="26" r="5" fill="#fff"/>
        <circle cx="34" cy="64" r="5" fill="#fff"/><circle cx="72" cy="64" r="5" fill="#fff"/><circle cx="110" cy="64" r="5" fill="#fff"/>
        <path d="M114 14L92 56h20l-12 42 40-50h-22l-4-34z" fill="url(#gpBolt)" stroke="#fff" stroke-width="1.8" stroke-linejoin="round"/>
      </svg>`;
    default:
      return `<svg class="wp-g-art" viewBox="0 0 180 120" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id="gpSw" x1="56" y1="14" x2="156" y2="106" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#fef9c3"/><stop offset="50%" stop-color="#fbbf24"/><stop offset="100%" stop-color="#ea580c"/></linearGradient>
          <radialGradient id="gpSh" cx="40%" cy="30%" r="70%"><stop offset="0%" stop-color="#60a5fa"/><stop offset="65%" stop-color="#1e3a8a"/><stop offset="100%" stop-color="#0f172a"/></radialGradient>
        </defs>
        <circle cx="112" cy="60" r="46" fill="#38bdf8" opacity=".22"/>
        <path d="M72 22L152 98M152 22L72 98" stroke="url(#gpSw)" stroke-width="9" stroke-linecap="round"/>
        <path d="M112 22l30 12v22c0 19-12.5 31-30 37-17.5-6-30-18-30-37V34l30-12z" fill="url(#gpSh)" stroke="#fef08a" stroke-width="3"/>
        <text x="112" y="67" text-anchor="middle" font-size="22" font-weight="900" fill="#fef08a">VS</text>
        <ellipse cx="102" cy="36" rx="12" ry="4" fill="#fff" opacity=".32"/>
      </svg>`;
  }
}

function renderArenaPostersGrid(containerEl) {
  if (!containerEl) return;
  const wideGames = ARENA_GAMES.filter(g => g.wide);
  const compactGames = ARENA_GAMES.filter(g => !g.wide);

  const renderCard = (g, compact) => `
    <div class="wp-game-banner ${compact ? 'compact' : 'wide'}" data-play-arena="${esc(g.id)}" style="background:${g.bg};border-color:${g.border}66" role="button" tabindex="0">
      <div class="wp-gb-shine"></div>
      <div class="wp-gb-left">
        <div class="wp-gb-pills">
          <span class="wp-gb-tag">${esc(g.tag)}</span>
          <span class="wp-gb-live">● ${esc(g.players)}</span>
        </div>
        <b class="wp-gb-title">${esc(g.title)}</b>
        <div class="wp-gb-foot">
          <span class="wp-gb-play">PLAY</span>
          <span class="wp-gb-rw">${esc(g.reward)} 🪙</span>
        </div>
      </div>
      <div class="wp-gb-right">${renderGamePosterSvg(g.id)}</div>
    </div>
  `;

  containerEl.innerHTML = `
    <div class="wp-game-stack">${wideGames.map(g => renderCard(g, false)).join('')}</div>
    <div class="wp-game-grid-2">${compactGames.map(g => renderCard(g, true)).join('')}</div>
  `;

  containerEl.onclick = e => {
    const pb = e.target.closest('[data-play-arena]');
    if (pb) { launchArenaGame(pb.dataset.playArena); return; }
  };
  containerEl.onkeydown = e => {
    if (e.key === 'Enter' || e.key === ' ') {
      const pb = e.target.closest('[data-play-arena]');
      if (pb) { e.preventDefault(); launchArenaGame(pb.dataset.playArena); }
    }
  };
}

function showPostMatchSummary(opts) {
  opts = opts || {};
  const won = Boolean(opts.won);
  const coins = won ? (opts.winCoins || 60) : (opts.loseCoins || 20);
  const exp = won ? 45 : 20;
  bumpStat('games_played');
  if (won) bumpStat('duel_win');
  if (opts.extraStat) bumpStat(opts.extraStat);
  addReward(coins, exp, null, false, { silentSfx: true });
  if (typeof addClanGlory === 'function') addClanGlory(won ? 40 : 15);
  if (typeof evaluateAchievementTitles === 'function') evaluateAchievementTitles();
  if (typeof playSfx === 'function') playSfx(won ? 'duelWin' : 'coin');

  const oppUid = opts.opponentUid || (allUsers().find(u => u.uid !== uid)?.uid || '');
  const oppName = opts.opponentName || (allUsers().find(u => u.uid === oppUid)?.name || 'Arena Rival');

  const m = modal(won ? '🏆 Victory!' : '⚔️ Match Complete', `
    <div style="text-align:center;padding:6px 4px">
      <div style="font-size:44px;line-height:1">${won ? '🏆' : '🎮'}</div>
      <h4 style="margin:8px 0 4px;font-size:19px">${esc(opts.headline || (won ? 'You dominated the match!' : 'Great effort!'))}</h4>
      <p style="font-size:13px;color:var(--mu);margin:0 0 10px">${esc(opts.detail || '')}</p>
      <div class="row wrap" style="justify-content:center;gap:8px;margin-bottom:14px">
        <span class="chip">+${fmtNum(coins)} Coins</span>
        <span class="exp-chip">+${exp} EXP</span>
        ${me.clanId ? `<span class="clan-tag-pill">+${won ? 40 : 15} Clan Glory</span>` : ''}
      </div>
      <div class="row wrap" style="gap:8px">
        <button type="button" class="btn gold" id="pmRematch" style="flex:1">Rematch</button>
        ${oppUid && typeof openGiftSendModal === 'function' ? `<button type="button" class="btn" id="pmGiftOpp" style="flex:1">🎁 Gift ${esc(oppName.slice(0, 12))}</button>` : ''}
      </div>
    </div>
  `);
  $('#pmRematch', m).onclick = () => { m.close(); if (typeof opts.onRematch === 'function') opts.onRematch(); };
  if ($('#pmGiftOpp', m)) {
    $('#pmGiftOpp', m).onclick = () => { m.close(); openGiftSendModal(oppUid, { targetName: oppName }); };
  }
}

/* ===== Game 1: 2v2 / 1v1 Squad Arena (Trivia & Reflex Duel) ===== */
const SQUAD_QUESTIONS = [
  { cat: 'Gaming', q: 'Which battle royale island is the classic map of PUBG?', opts: ['Erangel', 'Bermuda', 'Verdansk', 'Olympus'], a: 0 },
  { cat: 'Anime', q: 'What is Naruto Uzumaki’s signature chakra sphere jutsu?', opts: ['Chidori', 'Rasengan', 'Kamehameha', 'Bankai'], a: 1 },
  { cat: 'Speed Math', q: 'Quick! What is 18 × 7 − 16?', opts: ['110', '118', '104', '126'], a: 0 },
  { cat: 'Logic / IQ', q: 'Complete the sequence: 3, 6, 12, 24, __?', opts: ['36', '42', '48', '54'], a: 2 },
  { cat: 'Movies', q: 'Who snapped the Infinity Gauntlet in Avengers: Endgame?', opts: ['Thor', 'Iron Man', 'Doctor Strange', 'Hulk'], a: 1 },
  { cat: 'GK', q: 'Which planet is known as the Red Planet?', opts: ['Venus', 'Mars', 'Jupiter', 'Mercury'], a: 1 },
  { cat: 'Gaming', q: 'In Chess, which piece moves in an L-shape?', opts: ['Bishop', 'Rook', 'Knight', 'Queen'], a: 2 },
  { cat: 'Speed Math', q: 'What is √225 + 15?', opts: ['25', '30', '35', '40'], a: 1 }
];

function launchSquadArena(rival) {
  let idx = 0, myScore = 0, oppScore = 0, streak = 0;
  const qs = [...SQUAD_QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 6);
  const oppName = (rival && rival.name) || 'Nova Squad';

  const m = modal('⚔️ Squad Arena Duel', `<div id="sqRoot"></div>`, 'arena-game-sheet');
  const renderQ = () => {
    if (idx >= qs.length) {
      m.close();
      showPostMatchSummary({
        won: myScore >= oppScore,
        winCoins: 65,
        headline: myScore >= oppScore ? `Victory! ${myScore} – ${oppScore}` : `Defeat ${myScore} – ${oppScore}`,
        detail: `You vs ${oppName} · Best Streak: ${streak}x`,
        opponentUid: rival?.uid,
        opponentName: oppName,
        onRematch: () => launchSquadArena(rival)
      });
      return;
    }
    const item = qs[idx];
    $('#sqRoot', m).innerHTML = `
      <div class="row" style="justify-content:space-between;margin-bottom:10px">
        <span class="chip">You: ${myScore}</span>
        <span class="dur-pill">${esc(item.cat)} · Q${idx + 1}/${qs.length}</span>
        <span class="exp-chip">${esc(oppName.slice(0, 12))}: ${oppScore}</span>
      </div>
      <div class="card" style="padding:14px;font-size:15px;font-weight:700;margin-bottom:10px">${esc(item.q)}</div>
      <div class="sq-opts">
        ${item.opts.map((op, i) => `<button type="button" class="btn ghost full sq-opt-btn" data-sqa="${i}">${esc(op)}</button>`).join('')}
      </div>
    `;
    $$('[data-sqa]', m).forEach(b => {
      b.onclick = () => {
        const pick = Number(b.dataset.sqa);
        const right = pick === item.a;
        if (right) {
          streak++;
          myScore += 10 + streak * 2;
          if (typeof playSfx === 'function') playSfx('duelCorrect');
        } else {
          streak = 0;
          if (typeof playSfx === 'function') playSfx('duelWrong');
        }
        if (Math.random() < 0.62) oppScore += 10;
        idx++;
        renderQ();
      };
    });
  };
  renderQ();
}

/* ===== Game 2: 8-Ball Pool (Crisp 2D Canvas Physics) ===== */
function launch8BallPool(rival) {
  const m = modal('🎱 8-Ball Pool Pro', `
    <div class="row" style="justify-content:space-between;margin-bottom:8px">
      <span class="chip" id="plScore">Pocketed: 0/5</span>
      <span class="dur-pill" id="plTurn">Drag from Cue Ball to Shoot!</span>
      <span class="exp-chip" id="plShots">Shots: 0</span>
    </div>
    <canvas id="poolCv" width="320" height="200" style="width:100%;border-radius:14px;border:4px solid #92400e;background:#047857;touch-action:none;display:block"></canvas>
    <p style="font-size:12px;color:var(--mu);margin:8px 0 0;text-align:center">Pull back from the white cue ball and release to strike! Pocket all colored balls + 8-Ball.</p>
  `, 'arena-game-sheet');

  const cv = $('#poolCv', m);
  const ctx = cv.getContext('2d');
  const W = cv.width, H = cv.height, R = 8.5;
  const pockets = [[12, 12], [W / 2, 10], [W - 12, 12], [12, H - 12], [W / 2, H - 10], [W - 12, H - 12]];

  const balls = [
    { id: 'cue', x: 84, y: H / 2, vx: 0, vy: 0, color: '#ffffff', alive: true },
    { id: 'b1', x: 215, y: H / 2, vx: 0, vy: 0, color: '#facc15', alive: true },
    { id: 'b2', x: 232, y: H / 2 - 11, vx: 0, vy: 0, color: '#ef4444', alive: true },
    { id: 'b3', x: 232, y: H / 2 + 11, vx: 0, vy: 0, color: '#38bdf8', alive: true },
    { id: 'b4', x: 249, y: H / 2 - 20, vx: 0, vy: 0, color: '#f97316', alive: true },
    { id: 'b8', x: 249, y: H / 2, vx: 0, vy: 0, color: '#0f172a', is8: true, alive: true }
  ];

  let dragging = false, dragX = 0, dragY = 0, shots = 0, pocketed = 0, finished = false, raf = null;

  const isMoving = () => balls.some(b => b.alive && (Math.abs(b.vx) > 0.08 || Math.abs(b.vy) > 0.08));

  const getPos = e => {
    const rect = cv.getBoundingClientRect();
    return { x: (e.clientX - rect.left) * (W / rect.width), y: (e.clientY - rect.top) * (H / rect.height) };
  };

  cv.onpointerdown = e => {
    if (finished || isMoving()) return;
    cv.setPointerCapture(e.pointerId);
    const p = getPos(e);
    dragging = true; dragX = p.x; dragY = p.y;
  };
  cv.onpointermove = e => {
    if (!dragging) return;
    const p = getPos(e);
    dragX = p.x; dragY = p.y;
  };
  cv.onpointerup = () => {
    if (!dragging) return;
    dragging = false;
    const cue = balls[0];
    const dx = cue.x - dragX, dy = cue.y - dragY;
    const dist = Math.hypot(dx, dy);
    if (dist < 6) return;
    const pwr = Math.min(11.5, dist * 0.14);
    cue.vx = (dx / dist) * pwr;
    cue.vy = (dy / dist) * pwr;
    shots++;
    $('#plShots', m).textContent = 'Shots: ' + shots;
    if (typeof playSfx === 'function') playSfx('poolHit', { power: pwr / 11.5 });
  };

  const step = () => {
    for (const b of balls) {
      if (!b.alive) continue;
      b.x += b.vx; b.y += b.vy;
      b.vx *= 0.982; b.vy *= 0.982;
      if (Math.hypot(b.vx, b.vy) < 0.06) { b.vx = 0; b.vy = 0; }
      if (b.x < R + 8) { b.x = R + 8; b.vx = Math.abs(b.vx) * 0.88; }
      if (b.x > W - R - 8) { b.x = W - R - 8; b.vx = -Math.abs(b.vx) * 0.88; }
      if (b.y < R + 8) { b.y = R + 8; b.vy = Math.abs(b.vy) * 0.88; }
      if (b.y > H - R - 8) { b.y = H - R - 8; b.vy = -Math.abs(b.vy) * 0.88; }

      for (const [px, py] of pockets) {
        if (Math.hypot(b.x - px, b.y - py) < 15) {
          if (b.id === 'cue') {
            b.x = 84; b.y = H / 2; b.vx = 0; b.vy = 0;
            toast('Scratch! Cue ball reset.');
          } else {
            b.alive = false; b.vx = 0; b.vy = 0;
            pocketed++;
            $('#plScore', m).textContent = `Pocketed: ${pocketed}/5`;
            if (typeof playSfx === 'function') playSfx('duelCorrect');
            if (pocketed >= 5 || b.is8) {
              finished = true;
              setTimeout(() => {
                m.close();
                showPostMatchSummary({
                  won: pocketed >= 3,
                  winCoins: 75,
                  extraStat: 'pool_win',
                  headline: pocketed >= 5 ? 'Clean Table Clear! 🎱' : `Pocketed ${pocketed} Balls!`,
                  detail: `Finished in ${shots} shots`,
                  opponentUid: rival?.uid,
                  opponentName: rival?.name,
                  onRematch: () => launch8BallPool(rival)
                });
              }, 350);
            }
          }
          break;
        }
      }
    }

    /* Elastic Ball-to-Ball Collisions */
    for (let i = 0; i < balls.length; i++) {
      for (let j = i + 1; j < balls.length; j++) {
        const a = balls[i], b = balls[j];
        if (!a.alive || !b.alive) continue;
        const dx = b.x - a.x, dy = b.y - a.y;
        const dist = Math.hypot(dx, dy);
        if (dist > 0 && dist < R * 2) {
          const nx = dx / dist, ny = dy / dist;
          const overlap = (R * 2 - dist) / 2;
          a.x -= nx * overlap; a.y -= ny * overlap;
          b.x += nx * overlap; b.y += ny * overlap;
          const dvx = a.vx - b.vx, dvy = a.vy - b.vy;
          const imp = dvx * nx + dvy * ny;
          if (imp > 0) {
            a.vx -= imp * nx * 0.94; a.vy -= imp * ny * 0.94;
            b.vx += imp * nx * 0.94; b.vy += imp * ny * 0.94;
          }
        }
      }
    }

    /* Draw Table */
    ctx.fillStyle = '#047857';
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(255,255,255,.14)';
    ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(84, 12); ctx.lineTo(84, H - 12); ctx.stroke();

    pockets.forEach(([px, py]) => {
      ctx.fillStyle = '#090d16';
      ctx.beginPath(); ctx.arc(px, py, 12, 0, Math.PI * 2); ctx.fill();
    });

    const cue = balls[0];
    if (dragging && cue.alive) {
      const dx = cue.x - dragX, dy = cue.y - dragY;
      ctx.strokeStyle = 'rgba(255,211,107,.85)';
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cue.x, cue.y); ctx.lineTo(cue.x + dx * 1.4, cue.y + dy * 1.4); ctx.stroke();
      ctx.setLineDash([]);
      ctx.strokeStyle = '#fde68a';
      ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(cue.x - dx * 0.25, cue.y - dy * 0.25); ctx.lineTo(dragX, dragY); ctx.stroke();
    }

    balls.forEach(b => {
      if (!b.alive) return;
      ctx.fillStyle = b.color;
      ctx.beginPath(); ctx.arc(b.x, b.y, R, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.35)';
      ctx.lineWidth = 1;
      ctx.stroke();
      if (b.is8) {
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(b.x, b.y, 4, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 6px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('8', b.x, b.y + 2);
      }
    });

    if (!finished) raf = requestAnimationFrame(step);
  };
  raf = requestAnimationFrame(step);
  m.onclose = () => { finished = true; if (raf) cancelAnimationFrame(raf); };
}

/* ===== Game 3: Who is Undercover / Spy Word Party (4–6 Players) ===== */
const SPY_PAIRS = [
  ['Coffee', 'Tea', ['Warm morning drink', 'Has caffeine', 'Served in a cup', 'Popular in cafes']],
  ['Football', 'Basketball', ['Played in teams', 'Uses a round ball', 'Has a stadium crowd', 'High energy sport']],
  ['Ferrari', 'Lamborghini', ['Italian luxury', 'Fast engine roar', 'Dream supercar', 'Iconic badge']],
  ['Netflix', 'YouTube', ['Watch videos online', 'Popular on phones', 'Has trending shows', 'Binge worthy']]
];

function launchUndercoverGame() {
  const pair = SPY_PAIRS[Math.floor(Math.random() * SPY_PAIRS.length)];
  const players = [
    { name: me.name || 'You', isMe: true, isSpy: false, clue: '' },
    { name: 'Riya', isSpy: false, clue: pair[2][0] },
    { name: 'Aarav', isSpy: false, clue: pair[2][1] },
    { name: 'Kabir', isSpy: false, clue: pair[2][2] },
    { name: 'Zoya', isSpy: false, clue: pair[2][3] }
  ];
  const spyIdx = 1 + Math.floor(Math.random() * 4);
  players[spyIdx].isSpy = true;
  players[spyIdx].clue = 'Slightly different vibe... definitely iconic!';

  const m = modal('🕵️ Who is Undercover?', `
    <div class="card" style="text-align:center;margin-bottom:10px">
      <small style="color:var(--mu)">Your Secret Civilian Word</small>
      <div style="font-size:22px;font-weight:900;color:var(--gold);margin:4px 0">${esc(pair[0])}</div>
      <small style="color:var(--mu)">One player has a secret Spy word! Give your clue, then vote out the Undercover Spy.</small>
    </div>
    <div id="ucClues"></div>
    <div class="row" style="gap:6px;margin-top:8px" id="ucClueRow">
      <input id="ucIn" maxlength="40" placeholder="Enter your 1-line clue..." style="flex:1">
      <button type="button" class="btn gold sm" id="ucSend">Submit Clue</button>
    </div>
    <div id="ucVoteArea" hidden style="margin-top:10px">
      <b style="font-size:13px;color:var(--gold)">Vote to Eliminate the Undercover Spy:</b>
      <div class="row wrap" style="gap:6px;margin-top:8px" id="ucVoteBtns"></div>
    </div>
  `, 'arena-game-sheet');

  const renderClues = (showAll) => {
    $('#ucClues', m).innerHTML = players.map(p => `
      <div class="pr-msg"><b>${esc(p.name)}:</b> <span>${showAll || p.isMe ? esc(p.clue || 'Thinking...') : 'Waiting for your clue...'}</span></div>
    `).join('');
  };
  renderClues(false);

  $('#ucSend', m).onclick = () => {
    const val = ($('#ucIn', m).value || '').trim();
    if (!val) return toast('Enter your clue first!');
    players[0].clue = val;
    $('#ucClueRow', m).hidden = true;
    renderClues(true);
    $('#ucVoteArea', m).hidden = false;
    $('#ucVoteBtns', m).innerHTML = players.slice(1).map((p, i) => `<button type="button" class="btn ghost sm" style="flex:1" data-ucvote="${i + 1}">Vote ${esc(p.name)}</button>`).join('');
    $$('[data-ucvote]', m).forEach(btn => {
      btn.onclick = () => {
        const pick = Number(btn.dataset.ucvote);
        const caught = pick === spyIdx;
        m.close();
        showPostMatchSummary({
          won: caught,
          winCoins: 70,
          extraStat: caught ? 'undercover_win' : '',
          headline: caught ? `Spy Exposed! ${players[spyIdx].name} was Undercover!` : `${players[spyIdx].name} escaped!`,
          detail: `Civilian Word: ${pair[0]} · Spy Word: ${pair[1]}`,
          onRematch: () => launchUndercoverGame()
        });
      };
    });
  };
}

/* ===== Game 4: Snakes & Ladders / Ludo Express ===== */
function launchLudoSnakes(rival) {
  const LADDERS = { 4: 14, 9: 20, 17: 27 };
  const SNAKES = { 16: 6, 24: 12, 29: 19 };
  let p1 = 1, p2 = 1, turn = 1;
  const oppName = (rival && rival.name) || 'Rival Bot';

  const m = modal('🎲 Snakes & Ludo Express', `
    <div class="row" style="justify-content:space-between;margin-bottom:8px">
      <span class="chip" id="lsP1">🔵 You: Tile 1/30</span>
      <span class="dur-pill" id="lsMsg">Your Turn!</span>
      <span class="exp-chip" id="lsP2">🔴 ${esc(oppName.slice(0, 10))}: Tile 1/30</span>
    </div>
    <div class="ludo-grid" id="lsGrid"></div>
    <button type="button" class="btn gold full" id="lsRoll" style="margin-top:10px">🎲 Roll Dice</button>
  `, 'arena-game-sheet');

  const drawBoard = () => {
    $('#lsP1', m).textContent = `🔵 You: ${p1}/30`;
    $('#lsP2', m).textContent = `🔴 ${oppName.slice(0, 10)}: ${p2}/30`;
    let html = '';
    for (let n = 30; n >= 1; n--) {
      const mark = LADDERS[n] ? '🪜' : (SNAKES[n] ? '🐍' : (n === 30 ? '🏁' : ''));
      html += `<div class="ludo-tile ${LADDERS[n] ? 'lad' : ''} ${SNAKES[n] ? 'snk' : ''}">
        <small>${n}</small>
        <span>${mark}${p1 === n ? '🔵' : ''}${p2 === n ? '🔴' : ''}</span>
      </div>`;
    }
    $('#lsGrid', m).innerHTML = html;
  };
  drawBoard();

  $('#lsRoll', m).onclick = () => {
    if (turn !== 1) return;
    const roll = 1 + Math.floor(Math.random() * 6);
    if (typeof playSfx === 'function') playSfx('wheelTick');
    p1 = Math.min(30, p1 + roll);
    let note = `You rolled ${roll}!`;
    if (LADDERS[p1]) { p1 = LADDERS[p1]; note += ' 🪜 Ladder up!'; }
    if (SNAKES[p1]) { p1 = SNAKES[p1]; note += ' 🐍 Snake down!'; }
    $('#lsMsg', m).textContent = note;
    drawBoard();
    if (p1 >= 30) {
      setTimeout(() => {
        m.close();
        showPostMatchSummary({ won: true, winCoins: 65, headline: 'You Reached Tile 30 First! 🏆', detail: `Final: You 30 vs ${oppName} ${p2}`, opponentUid: rival?.uid, opponentName: oppName, onRematch: () => launchLudoSnakes(rival) });
      }, 450);
      return;
    }
    turn = 2;
    $('#lsRoll', m).disabled = true;
    setTimeout(() => {
      const r2 = 1 + Math.floor(Math.random() * 6);
      p2 = Math.min(30, p2 + r2);
      if (LADDERS[p2]) p2 = LADDERS[p2];
      if (SNAKES[p2]) p2 = SNAKES[p2];
      drawBoard();
      if (p2 >= 30) {
        m.close();
        showPostMatchSummary({ won: false, winCoins: 65, headline: `${oppName} Won the Race!`, detail: `Final: You ${p1} vs ${oppName} 30`, opponentUid: rival?.uid, opponentName: oppName, onRematch: () => launchLudoSnakes(rival) });
        return;
      }
      $('#lsMsg', m).textContent = `${oppName} rolled ${r2}. Your turn!`;
      turn = 1;
      $('#lsRoll', m).disabled = false;
    }, 650);
  };
}

/* ===== Game 5: 1-Minute Blitz Dots-and-Boxes (1v1) ===== */
function launchBlitzDots(rival) {
  const N = 3; /* 3x3 boxes */
  const hEdges = Array.from({ length: N + 1 }, () => Array(N).fill(0));
  const vEdges = Array.from({ length: N }, () => Array(N + 1).fill(0));
  const boxes = Array.from({ length: N }, () => Array(N).fill(0));
  let myScore = 0, oppScore = 0, timeLeft = 60, iv = null;
  const oppName = (rival && rival.name) || 'Blitz Rival';

  const m = modal('⚡ 1-Minute Blitz Dots & Boxes', `
    <div class="row" style="justify-content:space-between;margin-bottom:8px">
      <span class="chip" id="dbMe">You: 0</span>
      <span class="dur-pill" id="dbTime">⏱️ 60s</span>
      <span class="exp-chip" id="dbOpp">${esc(oppName.slice(0, 10))}: 0</span>
    </div>
    <div id="dbBoard" class="dots-board"></div>
    <p style="font-size:12px;color:var(--mu);text-align:center;margin:8px 0 0">Tap lines between dots to close boxes! Completing a box scores +1.</p>
  `, 'arena-game-sheet');

  const checkBoxes = (owner) => {
    let gained = 0;
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        if (!boxes[r][c] && hEdges[r][c] && hEdges[r + 1][c] && vEdges[r][c] && vEdges[r][c + 1]) {
          boxes[r][c] = owner;
          gained++;
        }
      }
    }
    if (owner === 1) myScore += gained; else oppScore += gained;
    return gained;
  };

  const finish = () => {
    if (iv) clearInterval(iv);
    m.close();
    showPostMatchSummary({
      won: myScore >= oppScore,
      winCoins: 60,
      headline: myScore >= oppScore ? `Blitz Victory! ${myScore} – ${oppScore}` : `Blitz Finished ${myScore} – ${oppScore}`,
      detail: `1v1 Dots & Boxes vs ${oppName}`,
      opponentUid: rival?.uid,
      opponentName: oppName,
      onRematch: () => launchBlitzDots(rival)
    });
  };

  const botMove = () => {
    const avail = [];
    for (let r = 0; r <= N; r++) for (let c = 0; c < N; c++) if (!hEdges[r][c]) avail.push(['h', r, c]);
    for (let r = 0; r < N; r++) for (let c = 0; c <= N; c++) if (!vEdges[r][c]) avail.push(['v', r, c]);
    if (!avail.length) { finish(); return; }
    const pick = avail[Math.floor(Math.random() * avail.length)];
    if (pick[0] === 'h') hEdges[pick[1]][pick[2]] = 2; else vEdges[pick[1]][pick[2]] = 2;
    checkBoxes(2);
    render();
    if (myScore + oppScore >= N * N) finish();
  };

  const render = () => {
    $('#dbMe', m).textContent = 'You: ' + myScore;
    $('#dbOpp', m).textContent = `${oppName.slice(0, 10)}: ${oppScore}`;
    let html = '';
    for (let r = 0; r <= N; r++) {
      html += `<div class="db-row">`;
      for (let c = 0; c < N; c++) {
        html += `<span class="db-dot"></span><button type="button" class="db-h ${hEdges[r][c] ? 'on p' + hEdges[r][c] : ''}" data-eh="${r},${c}" ${hEdges[r][c] ? 'disabled' : ''}></button>`;
      }
      html += `<span class="db-dot"></span></div>`;
      if (r < N) {
        html += `<div class="db-row">`;
        for (let c = 0; c < N; c++) {
          html += `<button type="button" class="db-v ${vEdges[r][c] ? 'on p' + vEdges[r][c] : ''}" data-ev="${r},${c}" ${vEdges[r][c] ? 'disabled' : ''}></button><span class="db-box ${boxes[r][c] ? 'p' + boxes[r][c] : ''}">${boxes[r][c] === 1 ? '★' : (boxes[r][c] === 2 ? '✕' : '')}</span>`;
        }
        html += `<button type="button" class="db-v ${vEdges[r][N] ? 'on p' + vEdges[r][N] : ''}" data-ev="${r},${N}" ${vEdges[r][N] ? 'disabled' : ''}></button></div>`;
      }
    }
    $('#dbBoard', m).innerHTML = html;
  };
  render();

  $('#dbBoard', m).onclick = e => {
    const hb = e.target.closest('[data-eh]');
    const vb = e.target.closest('[data-ev]');
    if (!hb && !vb) return;
    if (hb) { const [r, c] = hb.dataset.eh.split(',').map(Number); hEdges[r][c] = 1; }
    else { const [r, c] = vb.dataset.ev.split(',').map(Number); vEdges[r][c] = 1; }
    if (typeof playSfx === 'function') playSfx('click');
    const g = checkBoxes(1);
    render();
    if (myScore + oppScore >= N * N) { finish(); return; }
    if (!g) setTimeout(botMove, 260);
  };

  iv = setInterval(() => {
    timeLeft--;
    const tEl = $('#dbTime', m);
    if (tEl) tEl.textContent = `⏱️ ${timeLeft}s`;
    if (timeLeft <= 0) finish();
  }, 1000);
  m.onclose = () => { if (iv) clearInterval(iv); };
}

function launchArenaGame(gameId, rival) {
  if (typeof playSfx === 'function') playSfx('click');
  if (gameId === 'pool_8ball') return launch8BallPool(rival);
  if (gameId === 'undercover') return launchUndercoverGame();
  if (gameId === 'ludo_snakes') return launchLudoSnakes(rival);
  if (gameId === 'blitz_dots') return launchBlitzDots(rival);
  return launchSquadArena(rival);
}

function openRivalChallenge(targetUid) {
  const rival = allUsers().find(u => u.uid === targetUid) || { uid: targetUid, name: 'Rival Player' };
  const m = modal(`⚔️ Challenge ${rival.name || 'Rival'}`, `
    <p style="font-size:13px;color:var(--mu);margin:0 0 10px">Pick an Arena match to challenge <b>${esc(rival.name || 'Player')}</b>:</p>
    <div style="display:grid;gap:8px">
      ${ARENA_GAMES.map(g => `<button type="button" class="btn ghost full" style="justify-content:space-between" data-ch-game="${esc(g.id)}"><b>${esc(g.title)}</b><span class="chip">+${esc(g.reward)}</span></button>`).join('')}
    </div>
  `);
  $$('[data-ch-game]', m).forEach(b => {
    b.onclick = () => { m.close(); launchArenaGame(b.dataset.chGame, rival); };
  });
}
