"use strict";
/* =====================================================================
   LUDO ROYAL — PURE RULES ENGINE (v25)
   Decoupled, deterministic, zero-DOM rules module for 1v1 & 4P Ludo:
   - Classic 15x15 cross board, 52-cell clockwise outer track
   - 8 Safe Star squares (start tiles + star tiles, capture immune)
   - Roll 6 to exit base; exact roll to enter Center Royal Crown (step 56)
   - Captures on non-safe track tiles send rival pawn(s) back to base
   - Bonus roll on 6, capture, or reaching Home Crown (3 consecutive 6s forfeit)
   - Strict clockwise seat turn order (1v1: 0->2->0, 4P: 0->1->2->3->0)
   ===================================================================== */
(function (root) {
  const TRACK_LEN = 52;
  const HOME_LANE_LEN = 5; // steps 51..55
  const FINISH_STEP = 56;  // step 56 = Center Crown Home!
  const TOKENS_PER_PLAYER = 4;

  // 0: Red (Bottom-Left), 1: Green (Top-Left), 2: Yellow (Top-Right), 3: Blue (Bottom-Right)
  const START_POSITIONS = { 0: 0, 1: 13, 2: 26, 3: 39 };
  const SAFE_POSITIONS = [0, 8, 13, 21, 26, 34, 39, 47];
  const SAFE_SET = new Set(SAFE_POSITIONS);

  // Exact 52 clockwise [col, row] coordinates on a 15x15 grid (0..14)
  const OUTER_TRACK_COORDS = [
    [6, 13], [6, 12], [6, 11], [6, 10], [6, 9],             // 0..4   (Red start at 0)
    [5, 8], [4, 8], [3, 8], [2, 8], [1, 8], [0, 8],         // 5..10  (Safe star at 8)
    [0, 7],                                                  // 11     (Green home turn)
    [0, 6], [1, 6], [2, 6], [3, 6], [4, 6], [5, 6],         // 12..17 (Green start at 13)
    [6, 5], [6, 4], [6, 3], [6, 2], [6, 1], [6, 0],         // 18..23 (Safe star at 21)
    [7, 0],                                                  // 24     (Yellow home turn)
    [8, 0], [8, 1], [8, 2], [8, 3], [8, 4], [8, 5],         // 25..30 (Yellow start at 26)
    [9, 6], [10, 6], [11, 6], [12, 6], [13, 6], [14, 6],    // 31..36 (Safe star at 34)
    [14, 7],                                                 // 37     (Blue home turn)
    [14, 8], [13, 8], [12, 8], [11, 8], [10, 8], [9, 8],    // 38..43 (Blue start at 39)
    [8, 9], [8, 10], [8, 11], [8, 12], [8, 13], [8, 14],    // 44..49 (Safe star at 47)
    [7, 14],                                                 // 50     (Red home turn)
    [6, 14]                                                  // 51     (wraps to 0)
  ];

  // Colored home columns (homeIdx 0..4 => stepsFromStart 51..55)
  const HOME_LANE_COORDS = {
    0: [[7, 13], [7, 12], [7, 11], [7, 10], [7, 9]],  // Red (bottom -> center)
    1: [[1, 7], [2, 7], [3, 7], [4, 7], [5, 7]],      // Green (left -> center)
    2: [[7, 1], [7, 2], [7, 3], [7, 4], [7, 5]],      // Yellow (top -> center)
    3: [[13, 7], [12, 7], [11, 7], [10, 7], [9, 7]]   // Blue (right -> center)
  };

  // Center crown landing positions for finished tokens (step 56)
  const HOME_FINISH_COORDS = {
    0: [7, 8.15],
    1: [5.85, 7],
    2: [7, 5.85],
    3: [8.15, 7]
  };

  // Yard base cradles for each player's 4 pawns
  const YARD_SLOTS = {
    0: [[1.6, 10.6], [3.9, 10.6], [1.6, 12.9], [3.9, 12.9]],   // Red (Bottom-Left)
    1: [[1.6, 1.6], [3.9, 1.6], [1.6, 3.9], [3.9, 3.9]],       // Green (Top-Left)
    2: [[10.6, 1.6], [12.9, 1.6], [10.6, 3.9], [12.9, 3.9]],   // Yellow (Top-Right)
    3: [[10.6, 10.6], [12.9, 10.6], [10.6, 12.9], [12.9, 12.9]]// Blue (Bottom-Right)
  };

  const SEAT_PALETTE = {
    0: { key: 'red', name: 'Ruby Red', hex: '#ef4444', dark: '#991b1b', light: '#fca5a5', emoji: '🔴' },
    1: { key: 'green', name: 'Emerald', hex: '#10b981', dark: '#065f46', light: '#6ee7b7', emoji: '🟢' },
    2: { key: 'yellow', name: 'Royal Gold', hex: '#f59e0b', dark: '#92400e', light: '#fde68a', emoji: '🟡' },
    3: { key: 'blue', name: 'Sapphire', hex: '#3b82f6', dark: '#1e3a8a', light: '#93c5fd', emoji: '🔵' }
  };

  function getActiveSeats(mode) {
    return mode === '1v1' ? [0, 2] : [0, 1, 2, 3];
  }

  function isSafeTrackPos(pos) {
    return SAFE_SET.has(((Number(pos) % TRACK_LEN) + TRACK_LEN) % TRACK_LEN);
  }

  function getTokenCoord(token) {
    if (!token) return [7, 7];
    if (token.zone === 'base') {
      const slots = YARD_SLOTS[token.owner] || YARD_SLOTS[0];
      return slots[token.idx % 4] || [2, 11];
    }
    if (token.zone === 'track') {
      const idx = ((Number(token.pos) % TRACK_LEN) + TRACK_LEN) % TRACK_LEN;
      return OUTER_TRACK_COORDS[idx] || [6, 13];
    }
    if (token.zone === 'homeLane') {
      const lane = HOME_LANE_COORDS[token.owner] || HOME_LANE_COORDS[0];
      return lane[Math.max(0, Math.min(HOME_LANE_LEN - 1, token.homeIdx))] || [7, 9];
    }
    return HOME_FINISH_COORDS[token.owner] || [7, 7];
  }

  function createInitialState(opts) {
    const o = opts || {};
    const mode = o.mode === '1v1' ? '1v1' : '4p';
    const activeSeats = getActiveSeats(mode);
    const playersMeta = o.playersMeta || {};
    const players = activeSeats.map(seat => {
      const meta = playersMeta[seat] || {};
      return {
        seat,
        uid: meta.uid || (seat === 0 ? 'me' : `ludo_bot_${seat}`),
        name: meta.name || (seat === 0 ? 'You' : `${SEAT_PALETTE[seat].name} Bot`),
        avatar: meta.avatar || 'av_b1',
        isBot: meta.isBot !== undefined ? Boolean(meta.isBot) : seat !== 0,
        startPos: START_POSITIONS[seat],
        color: SEAT_PALETTE[seat]
      };
    });

    const tokens = [];
    players.forEach(p => {
      for (let i = 0; i < TOKENS_PER_PLAYER; i++) {
        tokens.push({
          id: `lt_${p.seat}_${i}`,
          owner: p.seat,
          idx: i,
          zone: 'base',      // 'base' | 'track' | 'homeLane' | 'home'
          pos: -1,           // 0..51 when zone === 'track'
          homeIdx: -1,       // 0..4 when zone === 'homeLane'
          stepsFromStart: -1 // -1 in base, 0..50 track, 51..55 homeLane, 56 home
        });
      }
    });

    return {
      mode,
      players,
      tokens,
      turnIdx: 0,
      consecutiveSixes: 0,
      winnerSeat: null
    };
  }

  function buildStepPath(token, startPos, targetSteps) {
    const path = [];
    const curSteps = token.stepsFromStart;
    if (token.zone === 'base' && targetSteps === 0) {
      path.push({ zone: 'track', pos: startPos, homeIdx: -1, stepsFromStart: 0 });
      return path;
    }
    for (let s = curSteps + 1; s <= targetSteps; s++) {
      if (s <= 50) {
        path.push({ zone: 'track', pos: (startPos + s) % TRACK_LEN, homeIdx: -1, stepsFromStart: s });
      } else if (s < FINISH_STEP) {
        path.push({ zone: 'homeLane', pos: -1, homeIdx: s - 51, stepsFromStart: s });
      } else {
        path.push({ zone: 'home', pos: -1, homeIdx: HOME_LANE_LEN, stepsFromStart: FINISH_STEP });
      }
    }
    return path;
  }

  function getCapturableTokensAt(state, moverSeat, trackPos) {
    if (isSafeTrackPos(trackPos)) return [];
    return (state.tokens || []).filter(
      t => t.owner !== moverSeat && t.zone === 'track' && t.pos === trackPos
    );
  }

  function getLegalMoves(state, seat, diceRaw) {
    const dice = Math.trunc(Number(diceRaw) || 0);
    if (!state || dice < 1 || dice > 6) return [];
    const startPos = START_POSITIONS[seat];
    if (startPos === undefined) return [];
    const myTokens = (state.tokens || []).filter(t => t.owner === seat);
    const moves = [];

    for (const t of myTokens) {
      if (t.zone === 'home') continue;

      // Base exit requires rolling a 6
      if (t.zone === 'base') {
        if (dice !== 6) continue;
        moves.push({
          tokenId: t.id,
          type: 'exit',
          fromZone: 'base',
          toZone: 'track',
          toPos: startPos,
          toHomeIdx: -1,
          toSteps: 0,
          captures: [], // Start square is always a Safe Star
          path: buildStepPath(t, startPos, 0)
        });
        continue;
      }

      const nextSteps = t.stepsFromStart + dice;
      if (nextSteps > FINISH_STEP) continue; // Exact roll required to enter Home Crown

      if (nextSteps === FINISH_STEP) {
        moves.push({
          tokenId: t.id,
          type: 'home',
          fromZone: t.zone,
          toZone: 'home',
          toPos: -1,
          toHomeIdx: HOME_LANE_LEN,
          toSteps: FINISH_STEP,
          captures: [],
          path: buildStepPath(t, startPos, FINISH_STEP)
        });
      } else if (nextSteps >= 51) {
        moves.push({
          tokenId: t.id,
          type: 'move',
          fromZone: t.zone,
          toZone: 'homeLane',
          toPos: -1,
          toHomeIdx: nextSteps - 51,
          toSteps: nextSteps,
          captures: [],
          path: buildStepPath(t, startPos, nextSteps)
        });
      } else {
        const destPos = (startPos + nextSteps) % TRACK_LEN;
        const victims = getCapturableTokensAt(state, seat, destPos);
        moves.push({
          tokenId: t.id,
          type: victims.length ? 'capture' : 'move',
          fromZone: t.zone,
          toZone: 'track',
          toPos: destPos,
          toHomeIdx: -1,
          toSteps: nextSteps,
          captures: victims.map(v => v.id),
          path: buildStepPath(t, startPos, nextSteps)
        });
      }
    }
    return moves;
  }

  function checkWinner(state) {
    if (!state || !Array.isArray(state.players)) return null;
    for (const p of state.players) {
      const mine = state.tokens.filter(t => t.owner === p.seat);
      if (mine.length === TOKENS_PER_PLAYER && mine.every(t => t.zone === 'home')) {
        return p.seat;
      }
    }
    return null;
  }

  function advanceTurn(state, bonusTurn) {
    if (!state || !Array.isArray(state.players) || !state.players.length) return 0;
    if (bonusTurn) return state.turnIdx;
    state.consecutiveSixes = 0;
    state.turnIdx = (state.turnIdx + 1) % state.players.length;
    return state.turnIdx;
  }

  function checkThreeSixesForfeit(state, dice) {
    if (!state) return false;
    if (dice === 6) {
      state.consecutiveSixes = (Number(state.consecutiveSixes) || 0) + 1;
      if (state.consecutiveSixes >= 3) {
        state.consecutiveSixes = 0;
        advanceTurn(state, false);
        return true;
      }
    } else {
      state.consecutiveSixes = 0;
    }
    return false;
  }

  function applyMove(state, seat, tokenId, dice) {
    const legal = getLegalMoves(state, seat, dice);
    const move = legal.find(m => m.tokenId === tokenId);
    if (!move) return { ok: false, reason: 'illegal_move' };

    const token = state.tokens.find(t => t.id === tokenId);
    if (!token) return { ok: false, reason: 'token_not_found' };

    token.zone = move.toZone;
    token.pos = move.toPos;
    token.homeIdx = move.toHomeIdx;
    token.stepsFromStart = move.toSteps;

    const capturedTokens = [];
    if (move.captures && move.captures.length) {
      move.captures.forEach(cid => {
        const vic = state.tokens.find(x => x.id === cid);
        if (vic) {
          vic.zone = 'base';
          vic.pos = -1;
          vic.homeIdx = -1;
          vic.stepsFromStart = -1;
          capturedTokens.push(vic);
        }
      });
    }

    const enteredHome = move.toZone === 'home';
    const winnerSeat = checkWinner(state);
    if (winnerSeat !== null) state.winnerSeat = winnerSeat;

    const bonusTurn = winnerSeat === null && (dice === 6 || capturedTokens.length > 0 || enteredHome);
    const nextTurnIdx = advanceTurn(state, bonusTurn);

    return {
      ok: true,
      move,
      capturedTokens,
      enteredHome,
      bonusTurn,
      winnerSeat,
      nextTurnIdx,
      nextSeat: state.players[nextTurnIdx]?.seat ?? null
    };
  }

  function isSquareThreatened(state, seat, trackPos) {
    if (isSafeTrackPos(trackPos)) return false;
    const rivals = (state.tokens || []).filter(t => t.owner !== seat && t.zone === 'track');
    for (const r of rivals) {
      const dist = ((trackPos - r.pos) % TRACK_LEN + TRACK_LEN) % TRACK_LEN;
      if (dist >= 1 && dist <= 6) return true;
    }
    return false;
  }

  function chooseBotMove(state, seat, dice, tier) {
    const legal = getLegalMoves(state, seat, dice);
    if (!legal.length) return null;
    if (legal.length === 1) return legal[0];

    const pro = tier === 'pro';
    let best = legal[0];
    let bestScore = -1e9;

    for (const mv of legal) {
      const tok = state.tokens.find(t => t.id === mv.tokenId);
      let sc = 0;
      if (mv.type === 'home') sc += 140;
      if (mv.captures.length) sc += 110 + mv.captures.length * 25;
      if (mv.toZone === 'homeLane' && mv.fromZone === 'track') sc += 75;
      if (mv.type === 'exit') sc += 62;
      if (mv.toZone === 'track' && isSafeTrackPos(mv.toPos)) sc += 44;
      if (tok && tok.zone === 'track' && isSquareThreatened(state, seat, tok.pos)) {
        sc += pro ? 48 : 26; // Escape danger!
      }
      if (mv.toZone === 'track' && isSquareThreatened(state, seat, mv.toPos)) {
        sc -= pro ? 42 : 16; // Avoid landing in rival line of fire
      }
      sc += mv.toSteps * 0.7;
      if (!pro) sc += (Math.random() - 0.5) * 14;
      if (sc > bestScore) {
        bestScore = sc;
        best = mv;
      }
    }
    return best;
  }

  const api = {
    TRACK_LEN,
    HOME_LANE_LEN,
    FINISH_STEP,
    TOKENS_PER_PLAYER,
    START_POSITIONS,
    SAFE_POSITIONS,
    OUTER_TRACK_COORDS,
    HOME_LANE_COORDS,
    HOME_FINISH_COORDS,
    YARD_SLOTS,
    SEAT_PALETTE,
    getActiveSeats,
    isSafeTrackPos,
    getTokenCoord,
    createInitialState,
    getLegalMoves,
    checkWinner,
    advanceTurn,
    checkThreeSixesForfeit,
    applyMove,
    chooseBotMove
  };

  root.LudoRules = api;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : window);
