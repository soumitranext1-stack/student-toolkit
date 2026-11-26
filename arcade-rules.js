"use strict";
/* =====================================================================
   PURE ARCADE & POOL RULES ENGINE (Zero-DOM, Unit-Tested)
   · Mode Selection Coin Validation & Payout Math
   · 8-Ball Pool Substepped Physics, Solids/Stripes/8-Ball Rules & Foul Detection
   · 60-Second Tile Race State Machine
   · Trap Door Duel State Machine
   · Mind Clash 1v1 Generator & Scoring
   · Pocket Territory 6x6 Capture & Power-Up Rules
   ===================================================================== */

(function (global) {
  const MODE_HARD_BOT_COST = 50;
  const PLAYER_VS_BETS = [25, 50, 100, 250];
  const FEE_RATE = 0.10;

  /* ---------- 1. Mode Selection Coin & Bet Validation ---------- */
  function calcMatchPayout(entryCoins) {
    const stake = Math.max(0, Math.floor(Number(entryCoins) || 0));
    if (stake <= 0) {
      return { stake: 0, grossPot: 0, platformFee: 0, winnerPayout: 0, feePercent: 0 };
    }
    const grossPot = stake * 2;
    const platformFee = Math.max(1, Math.round(grossPot * FEE_RATE));
    const winnerPayout = Math.max(stake, grossPot - platformFee);
    return { stake, grossPot, platformFee, winnerPayout, feePercent: Math.round(FEE_RATE * 100) };
  }

  function validateModeEntry({ modeType, difficulty, betAmount, userCoins }) {
    const coins = Math.max(0, Math.floor(Number(userCoins) || 0));
    if (modeType === 'bot') {
      const isHard = difficulty === 'hard';
      const cost = isHard ? MODE_HARD_BOT_COST : 0;
      if (cost > coins) {
        return { ok: false, cost, reason: `Need ${cost} coins for Hard Mode (you have ${coins})` };
      }
      return { ok: true, cost, payout: calcMatchPayout(cost), botTier: isHard ? 'pro' : 'standard' };
    }
    if (modeType === 'pvp') {
      const cost = Math.max(0, Math.floor(Number(betAmount) || 0));
      if (cost <= 0) {
        return { ok: false, cost: 0, reason: 'Select a coin bet amount to play Player VS' };
      }
      if (cost > coins) {
        return { ok: false, cost, reason: `Need ${cost} coins for this bet (you have ${coins})` };
      }
      return { ok: true, cost, payout: calcMatchPayout(cost), botTier: 'pro' };
    }
    // Invite friend can be free or staked
    const cost = Math.max(0, Math.floor(Number(betAmount) || 0));
    if (cost > coins) {
      return { ok: false, cost, reason: `Need ${cost} coins for this room bet` };
    }
    return { ok: true, cost, payout: calcMatchPayout(cost), botTier: 'standard' };
  }

  /* ---------- 2. 8-Ball Pool Physics & Authentic Rules ---------- */
  const POOL = {
    W: 640,
    H: 360,
    RAIL: 30,
    BALL_R: 11,
    POCKET_R: 20,
    FRICTION: 0.986,
    MIN_SPEED: 0.055,
    MAX_POWER: 16.5,
    SUBSTEPS: 5
  };

  function getPoolPockets() {
    const r = POOL.RAIL;
    return [
      { x: r + 3, y: r + 3 },
      { x: POOL.W / 2, y: r - 3 },
      { x: POOL.W - r - 3, y: r + 3 },
      { x: r + 3, y: POOL.H - r - 3 },
      { x: POOL.W / 2, y: POOL.H - r + 3 },
      { x: POOL.W - r - 3, y: POOL.H - r - 3 }
    ];
  }

  function createPoolRack() {
    const cy = POOL.H / 2;
    const cue = {
      id: 0, num: 0, group: 'cue', x: 166, y: cy, vx: 0, vy: 0,
      r: POOL.BALL_R, color: '#f8fafc', stripe: false, alive: true
    };
    // Crisp 9-ball diamond rack (4 Solids: 1-4, 4 Stripes: 9-12, Center: 8-Ball)
    const rx = 448;
    const dx = POOL.BALL_R * 1.82;
    const dy = POOL.BALL_R * 1.07;
    const layout = [
      // col 0 (apex)
      { num: 1, group: 'solids', color: '#f59e0b', stripe: false, cx: 0, cy: 0 },
      // col 1
      { num: 9, group: 'stripes', color: '#eab308', stripe: true, cx: 1, cy: -1 },
      { num: 2, group: 'solids', color: '#2563eb', stripe: false, cx: 1, cy: 1 },
      // col 2 (8-ball center)
      { num: 3, group: 'solids', color: '#ef4444', stripe: false, cx: 2, cy: -2 },
      { num: 8, group: 'eight', color: '#111827', stripe: false, cx: 2, cy: 0 },
      { num: 10, group: 'stripes', color: '#3b82f6', stripe: true, cx: 2, cy: 2 },
      // col 3
      { num: 11, group: 'stripes', color: '#dc2626', stripe: true, cx: 3, cy: -1 },
      { num: 4, group: 'solids', color: '#9333ea', stripe: false, cx: 3, cy: 1 },
      // col 4 (tail)
      { num: 12, group: 'stripes', color: '#9333ea', stripe: true, cx: 4, cy: 0 }
    ];
    const balls = layout.map(b => ({
      id: b.num,
      num: b.num,
      group: b.group,
      x: rx + b.cx * dx,
      y: cy + b.cy * dy,
      vx: 0,
      vy: 0,
      r: POOL.BALL_R,
      color: b.color,
      stripe: b.stripe,
      alive: true
    }));
    return {
      cue,
      balls,
      pockets: getPoolPockets(),
      turn: 'p1', // 'p1' or 'p2'
      groups: { p1: null, p2: null }, // 'solids' | 'stripes' | null
      ballInHand: false,
      firstHitGroup: null,
      pottedThisShot: [],
      scratched: false,
      winner: null,
      winReason: '',
      shotActive: false
    };
  }

  function findOpenCueSpot(state, prefX, prefY) {
    const minX = POOL.RAIL + POOL.BALL_R + 4;
    const maxX = POOL.W - POOL.RAIL - POOL.BALL_R - 4;
    const minY = POOL.RAIL + POOL.BALL_R + 4;
    const maxY = POOL.H - POOL.RAIL - POOL.BALL_R - 4;
    const clampX = Math.max(minX, Math.min(maxX, prefX));
    const clampY = Math.max(minY, Math.min(maxY, prefY));

    const isClear = (x, y) => {
      if (state.pockets.some(p => Math.hypot(x - p.x, y - p.y) < POOL.POCKET_R + 6)) return false;
      return state.balls.every(b => !b.alive || Math.hypot(x - b.x, y - b.y) >= b.r * 2 + 3);
    };

    if (isClear(clampX, clampY)) return { x: clampX, y: clampY };
    // Spiral search for nearest clear legal spot
    for (let rad = 14; rad <= 220; rad += 14) {
      for (let a = 0; a < 16; a++) {
        const ang = (Math.PI * 2 * a) / 16;
        const tx = Math.max(minX, Math.min(maxX, clampX + Math.cos(ang) * rad));
        const ty = Math.max(minY, Math.min(maxY, clampY + Math.sin(ang) * rad));
        if (isClear(tx, ty)) return { x: tx, y: ty };
      }
    }
    return { x: 166, y: POOL.H / 2 };
  }

  function isPoolMoving(state) {
    const all = [state.cue, ...state.balls];
    return all.some(b => b.alive && (Math.abs(b.vx) > POOL.MIN_SPEED || Math.abs(b.vy) > POOL.MIN_SPEED));
  }

  function stepPoolPhysics(state) {
    const events = { cushionHits: 0, ballHits: 0, potted: [], scratched: false };
    const all = [state.cue, ...state.balls];
    const dt = 1 / POOL.SUBSTEPS;
    const minX = POOL.RAIL + POOL.BALL_R;
    const maxX = POOL.W - POOL.RAIL - POOL.BALL_R;
    const minY = POOL.RAIL + POOL.BALL_R;
    const maxY = POOL.H - POOL.RAIL - POOL.BALL_R;

    for (let sub = 0; sub < POOL.SUBSTEPS; sub++) {
      // 1. Move & bounce off rails
      for (const b of all) {
        if (!b.alive) continue;
        b.x += b.vx * dt;
        b.y += b.vy * dt;

        // Check if heading directly into a pocket mouth before rail bounce
        const nearPocket = state.pockets.some(p => Math.hypot(b.x - p.x, b.y - p.y) < POOL.POCKET_R + 4);
        if (!nearPocket) {
          if (b.x < minX) { b.x = minX; b.vx = Math.abs(b.vx) * 0.86; events.cushionHits++; }
          else if (b.x > maxX) { b.x = maxX; b.vx = -Math.abs(b.vx) * 0.86; events.cushionHits++; }
          if (b.y < minY) { b.y = minY; b.vy = Math.abs(b.vy) * 0.86; events.cushionHits++; }
          else if (b.y > maxY) { b.y = maxY; b.vy = -Math.abs(b.vy) * 0.86; events.cushionHits++; }
        }
      }

      // 2. Elastic ball-to-ball collisions
      for (let i = 0; i < all.length; i++) {
        const a = all[i];
        if (!a.alive) continue;
        for (let j = i + 1; j < all.length; j++) {
          const b = all[j];
          if (!b.alive) continue;
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.hypot(dx, dy);
          const minDist = a.r + b.r;
          if (dist > 0.0001 && dist < minDist) {
            const nx = dx / dist;
            const ny = dy / dist;
            const overlap = (minDist - dist) * 0.505;
            a.x -= nx * overlap; a.y -= ny * overlap;
            b.x += nx * overlap; b.y += ny * overlap;

            const rvx = a.vx - b.vx;
            const rvy = a.vy - b.vy;
            const velAlongNormal = rvx * nx + rvy * ny;
            if (velAlongNormal > 0) {
              const restitution = 0.94;
              const impulse = velAlongNormal * restitution;
              a.vx -= impulse * nx; a.vy -= impulse * ny;
              b.vx += impulse * nx; b.vy += impulse * ny;
              events.ballHits++;
              if (state.firstHitGroup === null) {
                if (a.group === 'cue') state.firstHitGroup = b.group;
                else if (b.group === 'cue') state.firstHitGroup = a.group;
              }
            }
          }
        }
      }

      // 3. Pocket detection
      for (const b of state.balls) {
        if (!b.alive) continue;
        if (state.pockets.some(p => Math.hypot(b.x - p.x, b.y - p.y) < POOL.POCKET_R)) {
          b.alive = false;
          b.vx = 0; b.vy = 0;
          state.pottedThisShot.push(b);
          events.potted.push(b);
        }
      }
      if (state.cue.alive && state.pockets.some(p => Math.hypot(state.cue.x - p.x, state.cue.y - p.y) < POOL.POCKET_R - 1)) {
        state.cue.alive = false;
        state.cue.vx = 0; state.cue.vy = 0;
        state.scratched = true;
        events.scratched = true;
      }
    }

    // Apply frame friction once per step
    for (const b of all) {
      if (!b.alive) continue;
      b.vx *= POOL.FRICTION;
      b.vy *= POOL.FRICTION;
      if (Math.hypot(b.vx, b.vy) < POOL.MIN_SPEED) {
        b.vx = 0;
        b.vy = 0;
      }
    }

    return events;
  }

  function countRemainingInGroup(state, group) {
    if (!group) return state.balls.filter(b => b.alive && b.group !== 'eight').length;
    return state.balls.filter(b => b.alive && b.group === group).length;
  }

  function resolvePoolShot(state) {
    const shooter = state.turn;
    const rival = shooter === 'p1' ? 'p2' : 'p1';
    const myGroupBefore = state.groups[shooter];
    const potted = state.pottedThisShot.slice();
    const pottedEight = potted.some(b => b.group === 'eight');
    const scratched = state.scratched;

    // Reset cue ball cleanly if scratched
    if (scratched) {
      const spot = findOpenCueSpot(state, 166, POOL.H / 2);
      state.cue.x = spot.x;
      state.cue.y = spot.y;
      state.cue.vx = 0;
      state.cue.vy = 0;
      state.cue.alive = true;
    }

    // 1. Check 8-Ball potted (Win or Loss immediately)
    if (pottedEight) {
      const ownLeftBefore = myGroupBefore
        ? state.balls.filter(b => b.alive && b.group === myGroupBefore).length
        : 1; // Cannot legally win on open table without clearing a group
      if (!myGroupBefore || ownLeftBefore > 0 || scratched) {
        state.winner = rival;
        state.winReason = scratched ? 'Scratch on the 8-Ball!' : '8-Ball potted too early!';
      } else {
        state.winner = shooter;
        state.winReason = '8-Ball potted cleanly!';
      }
      state.shotActive = false;
      state.pottedThisShot = [];
      state.scratched = false;
      state.firstHitGroup = null;
      return { winner: state.winner, foul: scratched, keepTurn: false, message: state.winReason };
    }

    // 2. Assign Solids vs Stripes on first legal non-8 pot if table was open
    let assignedNow = null;
    if (!myGroupBefore && !scratched) {
      const firstObj = potted.find(b => b.group === 'solids' || b.group === 'stripes');
      if (firstObj) {
        state.groups[shooter] = firstObj.group;
        state.groups[rival] = firstObj.group === 'solids' ? 'stripes' : 'solids';
        assignedNow = firstObj.group;
      }
    }

    const activeGroup = state.groups[shooter];
    const needsEightNow = Boolean(activeGroup && countRemainingInGroup(state, activeGroup) === 0);

    // 3. Foul detection
    let foul = false;
    let foulReason = '';
    if (scratched) {
      foul = true;
      foulReason = 'Cue ball scratched! Ball-in-hand.';
    } else if (state.firstHitGroup === null) {
      foul = true;
      foulReason = 'No ball hit! Ball-in-hand.';
    } else if (activeGroup && !assignedNow) {
      const legalTarget = needsEightNow && !potted.some(b => b.group === activeGroup) ? 'eight' : activeGroup;
      if (state.firstHitGroup !== legalTarget && !(needsEightNow && state.firstHitGroup === 'eight')) {
        // Also allow hitting own group if they just cleared their last ball on this shot
        const clearedOwnThisShot = potted.some(b => b.group === activeGroup);
        if (!clearedOwnThisShot) {
          foul = true;
          foulReason = 'Hit wrong ball group! Ball-in-hand.';
        }
      }
    }

    const pottedOwn = activeGroup
      ? potted.some(b => b.group === activeGroup)
      : potted.some(b => b.group === 'solids' || b.group === 'stripes');

    let keepTurn = false;
    let message = '';
    if (foul) {
      state.turn = rival;
      state.ballInHand = true;
      message = foulReason;
    } else if (pottedOwn) {
      keepTurn = true;
      state.ballInHand = false;
      message = assignedNow
        ? `Claimed ${assignedNow === 'solids' ? 'Solids (1–4)' : 'Stripes (9–12)'}! Shoot again.`
        : 'Nice pot! Shoot again.';
    } else {
      state.turn = rival;
      state.ballInHand = false;
      message = 'Turn passed.';
    }

    state.shotActive = false;
    state.pottedThisShot = [];
    state.scratched = false;
    state.firstHitGroup = null;
    return { winner: null, foul, keepTurn, assignedNow, message };
  }

  /* ---------- 3. 60-Second Tile Race Engine ---------- */
  function createTileRaceBoard(startNum = 1) {
    const nums = [];
    for (let i = 0; i < 25; i++) nums.push(startNum + i);
    for (let i = nums.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [nums[i], nums[j]] = [nums[j], nums[i]];
    }
    const bonusIdx = new Set();
    while (bonusIdx.size < 4) bonusIdx.add(Math.floor(Math.random() * 25));
    return {
      cells: nums.map((val, idx) => ({ val, cleared: false, bonus: bonusIdx.has(idx) })),
      nextTarget: startNum,
      maxTarget: startNum + 24,
      wave: Math.floor((startNum - 1) / 25) + 1
    };
  }

  function tapTileRaceCell(state, idx) {
    const cell = state.cells[idx];
    if (!cell || cell.cleared) return { ok: false, ignored: true };
    if (cell.val !== state.nextTarget) {
      state.streak = 0;
      state.misses = (state.misses || 0) + 1;
      return { ok: false, wrong: true, points: 0, streak: 0 };
    }
    cell.cleared = true;
    state.streak = (state.streak || 0) + 1;
    state.bestStreak = Math.max(state.bestStreak || 0, state.streak);
    const mult = Math.min(5, 1 + Math.floor((state.streak - 1) / 4));
    const basePts = cell.bonus ? 20 : 10;
    const points = basePts * mult;
    state.score = (state.score || 0) + points;
    state.taps = (state.taps || 0) + 1;
    state.nextTarget++;

    let waveCleared = false;
    if (state.nextTarget > state.maxTarget) {
      waveCleared = true;
      state.score += 100;
      const nextBoard = createTileRaceBoard(state.nextTarget);
      state.cells = nextBoard.cells;
      state.maxTarget = nextBoard.maxTarget;
      state.wave = nextBoard.wave;
    }
    return { ok: true, points, mult, streak: state.streak, bonus: cell.bonus, waveCleared };
  }

  /* ---------- 4. Trap Door Duel Engine ---------- */
  function createTrapDoorState() {
    // 5 rows x 4 doors. Each row has 1 trap in rows 0-1, 2 traps in rows 2-4, plus hidden gems/shields
    const rows = [];
    for (let r = 0; r < 5; r++) {
      const trapCount = r >= 2 ? 2 : 1;
      const indices = [0, 1, 2, 3];
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }
      const trapSet = new Set(indices.slice(0, trapCount));
      const shieldIdx = indices[trapCount]; // one safe door holds a bonus shield/gem
      rows.push([0, 1, 2, 3].map(c => ({
        r, c,
        type: trapSet.has(c) ? 'trap' : (c === shieldIdx && r % 2 === 1 ? 'shield' : 'safe'),
        revealedBy: null,
        sabotagedBy: null
      })));
    }
    return {
      rows,
      turn: 'p1',
      players: {
        p1: { row: 0, hp: 3, maxHp: 3, shield: false, sabotages: 1, score: 0 },
        p2: { row: 0, hp: 3, maxHp: 3, shield: false, sabotages: 1, score: 0 }
      },
      winner: null,
      reason: ''
    };
  }

  function stepTrapDoor(state, playerKey, col) {
    if (state.winner) return { ok: false, reason: 'Match finished' };
    const p = state.players[playerKey];
    const rivalKey = playerKey === 'p1' ? 'p2' : 'p1';
    if (!p || p.row >= state.rows.length) return { ok: false };
    const door = state.rows[p.row][col];
    if (!door) return { ok: false };

    const isTrap = door.type === 'trap' || (door.sabotagedBy && door.sabotagedBy !== playerKey);
    door.revealedBy = playerKey;
    let outcome = 'safe';

    if (isTrap) {
      if (p.shield) {
        p.shield = false;
        p.row += 1;
        p.score += 15;
        outcome = 'shield_block';
      } else {
        p.hp = Math.max(0, p.hp - 1);
        outcome = 'trap';
        if (p.hp <= 0) {
          state.winner = rivalKey;
          state.reason = 'Out of hearts on Trap Door!';
        }
      }
    } else if (door.type === 'shield') {
      p.shield = true;
      p.row += 1;
      p.score += 30;
      outcome = 'shield_gain';
    } else {
      p.row += 1;
      p.score += 20;
      outcome = 'safe';
    }

    if (!state.winner && p.row >= state.rows.length) {
      state.winner = playerKey;
      state.reason = 'Reached the Golden Vault!';
    }
    if (!state.winner) {
      state.turn = rivalKey;
    }
    return { ok: true, outcome, door, winner: state.winner };
  }

  function plantTrapSabotage(state, playerKey, rowIdx, colIdx) {
    const p = state.players[playerKey];
    if (!p || p.sabotages <= 0 || state.winner) return { ok: false };
    const door = state.rows[rowIdx] && state.rows[rowIdx][colIdx];
    if (!door || door.revealedBy) return { ok: false };
    p.sabotages--;
    door.sabotagedBy = playerKey;
    return { ok: true };
  }

  /* ---------- 5. Mind Clash 1v1 Generator & Scoring ---------- */
  const MIND_CLASH_BANK = [
    { kind: 'Pattern', q: 'Next in sequence: 2, 6, 12, 20, ?', o: ['28', '30', '32', '26'], a: 1 },
    { kind: 'Logic', q: 'Which shape completes: ▲ ● ■ ▲ ● ?', o: ['▲', '●', '■', '◆'], a: 2 },
    { kind: 'Speed Math', q: '17 × 6 − 12 = ?', o: ['86', '90', '94', '88'], a: 1 },
    { kind: 'Odd One', q: 'Odd one out: 16, 25, 36, 48, 64', o: ['25', '36', '48', '64'], a: 2 },
    { kind: 'Pattern', q: 'Next letter: B, E, H, K, ?', o: ['M', 'N', 'O', 'L'], a: 1 },
    { kind: 'Logic', q: 'If 3 cats catch 3 mice in 3 min, 1 cat catches 1 mouse in?', o: ['1 min', '3 min', '6 min', '9 min'], a: 1 },
    { kind: 'Pattern', q: 'Next number: 3, 9, 27, 81, ?', o: ['162', '243', '216', '270'], a: 1 },
    { kind: 'Speed Math', q: '(144 ÷ 12) + (9 × 4) = ?', o: ['44', '46', '48', '52'], a: 2 },
    { kind: 'Visual', q: 'Mirror symmetry: ◆ ◇ ◆ ◇ ◆ ?', o: ['◆', '◇', '★', '●'], a: 1 },
    { kind: 'Logic', q: 'Half of 2 + 2 equals?', o: ['2', '3', '4', '1'], a: 1 },
    { kind: 'Pattern', q: 'Fibonacci: 5, 8, 13, 21, ?', o: ['32', '34', '35', '29'], a: 1 },
    { kind: 'Odd One', q: 'Odd one out: Mercury, Mars, Moon, Venus', o: ['Mercury', 'Mars', 'Moon', 'Venus'], a: 2 },
    { kind: 'Speed Math', q: '25% of 160 + 15 = ?', o: ['50', '55', '60', '45'], a: 1 },
    { kind: 'Pattern', q: '100, 91, 82, 73, ?', o: ['64', '65', '63', '66'], a: 0 }
  ];

  function createMindClashDeck(count = 7) {
    const arr = MIND_CLASH_BANK.slice();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.slice(0, Math.min(count, arr.length));
  }

  function scoreMindClashAnswer(isCorrect, secondsLeft) {
    if (!isCorrect) return 0;
    const speedBonus = Math.max(0, Math.min(8, Math.round(secondsLeft * 0.8)));
    return 10 + speedBonus;
  }

  /* ---------- 6. Pocket Territory 6x6 Capture Engine ---------- */
  const TERRITORY_SIZE = 6;
  const TERRITORY_MAX_TURNS = 24;

  function createTerritoryState() {
    const grid = Array.from({ length: TERRITORY_SIZE }, () =>
      Array.from({ length: TERRITORY_SIZE }, () => ({ owner: null, shield: false }))
    );
    // Starting corner fortresses
    grid[0][0] = { owner: 'p1', shield: false };
    grid[TERRITORY_SIZE - 1][TERRITORY_SIZE - 1] = { owner: 'p2', shield: false };
    return {
      size: TERRITORY_SIZE,
      grid,
      turn: 'p1',
      turnsLeft: TERRITORY_MAX_TURNS,
      extraMoves: 0,
      powers: {
        p1: { shield: 1, bomb: 1, double: 1 },
        p2: { shield: 1, bomb: 1, double: 1 }
      },
      winner: null
    };
  }

  function countTerritory(state) {
    let p1 = 0, p2 = 0, empty = 0;
    for (let r = 0; r < state.size; r++) {
      for (let c = 0; c < state.size; c++) {
        const o = state.grid[r][c].owner;
        if (o === 'p1') p1++;
        else if (o === 'p2') p2++;
        else empty++;
      }
    }
    return { p1, p2, empty, total: state.size * state.size };
  }

  function applyTerritoryMove(state, playerKey, r, c, powerMode = 'claim') {
    if (state.winner || state.turn !== playerKey) return { ok: false };
    if (r < 0 || r >= state.size || c < 0 || c >= state.size) return { ok: false };
    const cell = state.grid[r][c];
    const rivalKey = playerKey === 'p1' ? 'p2' : 'p1';
    const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    let flipped = 0;

    if (powerMode === 'shield') {
      if (state.powers[playerKey].shield <= 0 || cell.owner !== playerKey || cell.shield) return { ok: false };
      state.powers[playerKey].shield--;
      cell.shield = true;
      return { ok: true, action: 'shield', flipped: 0 };
    }

    if (powerMode === 'bomb') {
      if (state.powers[playerKey].bomb <= 0 || cell.owner !== rivalKey) return { ok: false };
      state.powers[playerKey].bomb--;
      cell.owner = playerKey;
      cell.shield = false;
      flipped++;
      for (const [dr, dc] of dirs) {
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < state.size && nc >= 0 && nc < state.size) {
          const nb = state.grid[nr][nc];
          if (nb.owner === rivalKey && !nb.shield) {
            nb.owner = playerKey;
            flipped++;
          }
        }
      }
    } else {
      // Normal claim or double move
      if (cell.owner !== null) return { ok: false };
      if (powerMode === 'double') {
        if (state.powers[playerKey].double <= 0) return { ok: false };
        state.powers[playerKey].double--;
        state.extraMoves = 1;
      }
      cell.owner = playerKey;
      cell.shield = false;
      for (const [dr, dc] of dirs) {
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < state.size && nc >= 0 && nc < state.size) {
          const nb = state.grid[nr][nc];
          if (nb.owner === rivalKey && !nb.shield) {
            nb.owner = playerKey;
            flipped++;
          }
        }
      }
    }

    state.turnsLeft = Math.max(0, state.turnsLeft - 1);
    const counts = countTerritory(state);
    if (state.turnsLeft <= 0 || counts.empty === 0) {
      state.winner = counts.p1 > counts.p2 ? 'p1' : (counts.p2 > counts.p1 ? 'p2' : 'tie');
      return { ok: true, action: powerMode, flipped, counts, winner: state.winner };
    }

    if (state.extraMoves > 0) {
      state.extraMoves--;
    } else {
      state.turn = rivalKey;
    }
    return { ok: true, action: powerMode, flipped, counts, winner: null };
  }

  function chooseTerritoryBotMove(state, tier = 'standard') {
    const rivalKey = 'p1';
    const botKey = 'p2';
    const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    const empties = [];
    for (let r = 0; r < state.size; r++) {
      for (let c = 0; c < state.size; c++) {
        if (state.grid[r][c].owner === null) {
          let flips = 0;
          let adjOwn = 0;
          for (const [dr, dc] of dirs) {
            const nr = r + dr, nc = c + dc;
            if (nr >= 0 && nr < state.size && nc >= 0 && nc < state.size) {
              const nb = state.grid[nr][nc];
              if (nb.owner === rivalKey && !nb.shield) flips++;
              if (nb.owner === botKey) adjOwn++;
            }
          }
          empties.push({ r, c, score: flips * 10 + adjOwn * 2 + (tier === 'pro' ? 0 : Math.random() * 6) });
        }
      }
    }
    // Pro bot uses bomb when it can flip >= 2 rival tiles
    if (tier === 'pro' && state.powers.p2.bomb > 0 && state.turnsLeft <= 14) {
      let bestBomb = null;
      for (let r = 0; r < state.size; r++) {
        for (let c = 0; c < state.size; c++) {
          if (state.grid[r][c].owner === rivalKey) {
            let gain = 1;
            for (const [dr, dc] of dirs) {
              const nr = r + dr, nc = c + dc;
              if (nr >= 0 && nr < state.size && nc >= 0 && nc < state.size) {
                const nb = state.grid[nr][nc];
                if (nb.owner === rivalKey && !nb.shield) gain++;
              }
            }
            if (gain >= 3 && (!bestBomb || gain > bestBomb.gain)) bestBomb = { r, c, gain, powerMode: 'bomb' };
          }
        }
      }
      if (bestBomb) return bestBomb;
    }
    if (!empties.length) return null;
    empties.sort((a, b) => b.score - a.score);
    const pick = tier === 'pro' ? empties[0] : empties[Math.floor(Math.random() * Math.min(3, empties.length))];
    const useDouble = tier === 'pro' && state.powers.p2.double > 0 && state.turnsLeft <= 10 && empties.length >= 2;
    return { r: pick.r, c: pick.c, powerMode: useDouble ? 'double' : 'claim' };
  }

  const API = {
    MODE_HARD_BOT_COST,
    PLAYER_VS_BETS,
    calcMatchPayout,
    validateModeEntry,
    POOL,
    getPoolPockets,
    createPoolRack,
    findOpenCueSpot,
    isPoolMoving,
    stepPoolPhysics,
    countRemainingInGroup,
    resolvePoolShot,
    createTileRaceBoard,
    tapTileRaceCell,
    createTrapDoorState,
    stepTrapDoor,
    plantTrapSabotage,
    createMindClashDeck,
    scoreMindClashAnswer,
    TERRITORY_SIZE,
    TERRITORY_MAX_TURNS,
    createTerritoryState,
    countTerritory,
    applyTerritoryMove,
    chooseTerritoryBotMove
  };

  global.ArcadeRules = API;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = API;
  }
})(typeof window !== 'undefined' ? window : globalThis);
