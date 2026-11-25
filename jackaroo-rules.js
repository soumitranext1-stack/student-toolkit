"use strict";
/* =====================================================================
   JACKAROO ROYAL — PURE RULES ENGINE (v23)
   Supports:
   - 2-Player (1v1): Authentic 52-spot WePlay vertical oval track
     · Seat 0 (Amber, Bottom-Left): start 0, homeEntry 50, home 0..3
     · Seat 2 (Emerald, Top-Right): start 26, homeEntry 24 (50 steps), home 0..3
     · Neck Teleports: 17 -> 31 (top neck), 43 -> 5 (bottom neck) — forward-only
     · Full 52-card deck: includes K (Open / +13 Sweep) & Red Q (Pick Rival Hidden Card)
   - 4-Player (2v2): Authentic 72-spot cruciform cross track (18/quadrant)
     · Seats 0/1/2/3: starts 0, 18, 36, 54; homeEntry after 70 steps
     · Classic cross rules: NO teleport spots, NO Card 13 (K), NO Only-Discard (Red Q)
     · Official Teammate Assist: once all 4 own stones reach Home, play moves partner's stones
   - Bonus Turn & Combo Draw: Capture / Reach Home (+1 Card & Extra Turn), Discard Attack (Extra Turn)
   ===================================================================== */
(function (root) {
  const HOME_LEN = 4;
  const SUITS = ['♠', '♥', '♦', '♣'];
  const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

  function getBoardConfig(mode) {
    if (mode === '1v1') {
      return {
        mode: '1v1',
        trackLen: 52,
        homeEntrySteps: 50,
        homeLen: HOME_LEN,
        activeSeats: [0, 2],
        startPositions: { 0: 0, 2: 26 },
        safeSpots: [0, 26],
        // Top-left swirl 17 -> top-right ring 31; Bottom-right swirl 43 -> bottom-left ring 5
        teleportMap: { 17: 31, 43: 5 }
      };
    }
    return {
      mode: '2v2',
      trackLen: 72,
      homeEntrySteps: 70,
      homeLen: HOME_LEN,
      activeSeats: [0, 1, 2, 3],
      startPositions: { 0: 0, 1: 18, 2: 36, 3: 54 },
      safeSpots: [0, 18, 36, 54],
      // Official 4-Player (2v2) Jackaroo cross board has NO teleport spots
      teleportMap: {}
    };
  }

  /**
   * Builds the authentic mode-specific deck:
   * - 1v1: Full 52 cards (including K 13-sweep and Red Q hidden-card discard)
   * - 2v2: Removes Card 13 (all K) and Only-Discard (Red Q: Q♥, Q♦) -> 46 cards
   */
  function buildDeckForMode(mode) {
    const cards = [];
    let seq = 0;
    const is2v2 = mode === '2v2';
    for (const suit of SUITS) {
      const red = suit === '♥' || suit === '♦';
      for (const rank of RANKS) {
        if (is2v2 && rank === 'K') continue;
        if (is2v2 && rank === 'Q' && red) continue;
        cards.push({ id: `jk_${rank}_${suit}_${seq++}`, rank, suit, red });
      }
    }
    return cards;
  }

  function getCardRole(card, mode) {
    if (!card) return { kind: 'step', steps: [], label: '' };
    const r = card.rank;
    const isRed = card.suit === '♥' || card.suit === '♦' || Boolean(card.red);
    switch (r) {
      case 'A':
        return { kind: 'ace', canExitBase: true, steps: [1, 11], label: 'Open / +1 / +11' };
      case '2':
        return { kind: 'two', canExitBase: true, steps: [2], label: 'Open / +2' };
      case '4':
        return { kind: 'back', steps: [-4], label: 'Back −4' };
      case '5':
        return { kind: 'any5', steps: [5], anyMarble: true, label: 'Any +5' };
      case '7':
        return { kind: 'seven', steps: [7], canSplit: true, label: '7 / Split' };
      case '10':
        return { kind: 'ten', steps: [10], canDiscardNext: true, pickHiddenDiscard: false, label: '+10 / Burn' };
      case 'J':
        return isRed
          ? { kind: 'jack_red', steps: [11], canSwap: false, label: '+11' }
          : { kind: 'jack_black', steps: [], canSwap: true, label: 'Swap' };
      case 'Q':
        if (isRed) {
          if (mode === '2v2') {
            return { kind: 'disabled', steps: [], canDiscardNext: false, pickHiddenDiscard: false, label: '' };
          }
          return { kind: 'queen_red', steps: [], canDiscardNext: true, pickHiddenDiscard: true, label: 'Pick Burn' };
        }
        return { kind: 'queen_black', steps: [12], canDiscardNext: false, pickHiddenDiscard: false, label: '+12' };
      case 'K':
        if (mode === '2v2') {
          return { kind: 'disabled', canExitBase: false, steps: [], sweepCapture: false, label: '' };
        }
        return { kind: 'king', canExitBase: true, steps: [13], sweepCapture: true, label: 'Open / 13⊗' };
      default:
        return { kind: 'step', steps: [Number(r) || 0], label: '+' + r };
    }
  }

  /**
   * In 2v2 mode, once all 4 of a player's own marbles reach their Win Box (home),
   * official Jackaroo rules let that player use their turns to move their teammate's marbles.
   */
  function getControlSeat(seat, state) {
    if (!state || state.mode !== '2v2') return seat;
    const marbles = state.marbles || [];
    const players = state.players || [];
    const own = marbles.filter(m => m.owner === seat);
    if (!own.length || !own.every(m => m.zone === 'home')) return seat;
    const meP = players.find(p => p.seat === seat);
    if (!meP) return seat;
    const mate = players.find(p => p.team === meP.team && p.seat !== seat);
    if (!mate) return seat;
    const mateM = marbles.filter(m => m.owner === mate.seat);
    return mateM.some(m => m.zone !== 'home') ? mate.seat : seat;
  }

  function shouldGrantExtraTurn(ev) {
    if (!ev) return false;
    return Boolean((ev.capturedCount || 0) > 0 || ev.enteredHome || ev.discardedEnemy);
  }

  function shouldGrantComboDraw(ev) {
    if (!ev) return false;
    return Boolean((ev.capturedCount || 0) > 0 || ev.enteredHome);
  }

  function isSafeStartMarble(marble, players) {
    if (!marble) return false;
    if (marble.zone === 'base' || marble.zone === 'home') return true;
    const owner = players.find(p => p.seat === marble.owner);
    return Boolean(owner && marble.zone === 'track' && marble.pos === owner.startPos);
  }

  // Card 5 can move ANY marble on track EXCEPT another player's stone sitting safely on its own opening/start square
  function canCard5MoveMarble(marble, moverSeat, players) {
    if (!marble || marble.zone !== 'track') return false;
    if (marble.owner === moverSeat) return true;
    return !isSafeStartMarble(marble, players);
  }

  function getHomeEntrySpot(owner, cfg) {
    return (owner.startPos + cfg.homeEntrySteps) % cfg.trackLen;
  }

  /**
   * Computes destination, step-by-step path coordinates, teleport, and captures.
   */
  function computeMove(m, steps, state, opts) {
    const o = opts || {};
    const cfg = state.cfg || getBoardConfig(state.mode);
    const marbles = state.marbles || [];
    const players = state.players || [];
    const owner = players.find(p => p.seat === m.owner);
    if (!owner || m.zone === 'base' || !steps) return { valid: false, reason: 'invalid' };

    const homeEntrySteps = cfg.homeEntrySteps != null ? cfg.homeEntrySteps : (cfg.trackLen - 1);

    // Inside Home lane: advance step-by-step without jumping own home stones
    if (m.zone === 'home') {
      if (steps <= 0) return { valid: false, reason: 'home-back' };
      const targetHome = m.homeIdx + steps;
      if (targetHome >= cfg.homeLen) return { valid: false, reason: 'home-overshoot' };
      const blocked = marbles.some(
        x => x.id !== m.id && x.owner === m.owner && x.zone === 'home' && x.homeIdx > m.homeIdx && x.homeIdx <= targetHome
      );
      if (blocked) return { valid: false, reason: 'home-blocked' };
      const path = [];
      for (let h = m.homeIdx + 1; h <= targetHome; h++) {
        path.push({ zone: 'home', pos: -1, homeIdx: h });
      }
      return {
        valid: true,
        zone: 'home',
        pos: -1,
        homeIdx: targetHome,
        stepsFromStart: m.stepsFromStart + steps,
        teleported: false,
        passedCaptures: [],
        path
      };
    }

    // Backward move (-4)
    if (steps < 0) {
      const absSteps = Math.abs(steps);
      const path = [];
      const passedCaptures = [];
      for (let s = 1; s <= absSteps; s++) {
        const checkPos = ((m.pos - s) % cfg.trackLen + cfg.trackLen) % cfg.trackLen;
        const isFinal = s === absSteps;
        const atSpot = marbles.find(x => x.id !== m.id && x.zone === 'track' && x.pos === checkPos);
        if (atSpot) {
          if (atSpot.owner === m.owner) return { valid: false, reason: 'same-color-block' };
          if (isSafeStartMarble(atSpot, players)) return { valid: false, reason: 'start-spot-block' };
          if (isFinal) passedCaptures.push(atSpot.id);
        }
        path.push({ zone: 'track', pos: checkPos, homeIdx: -1 });
      }
      const np = ((m.pos + steps) % cfg.trackLen + cfg.trackLen) % cfg.trackLen;
      // Classic Jackaroo -4 wrap shortcut behind start spot
      const ns = m.stepsFromStart >= absSteps
        ? (m.stepsFromStart - absSteps)
        : (cfg.trackLen + (m.stepsFromStart - absSteps));
      return {
        valid: true,
        zone: 'track',
        pos: np,
        homeIdx: -1,
        stepsFromStart: ns,
        teleported: false,
        passedCaptures,
        path
      };
    }

    // Forward move (+steps)
    let ns = m.stepsFromStart + steps;
    const enteringHome = m.stepsFromStart <= homeEntrySteps && ns > homeEntrySteps;
    const trackStepsToCheck = enteringHome ? Math.max(0, homeEntrySteps - m.stepsFromStart) : steps;
    const passedCaptures = [];
    const path = [];

    for (let s = 1; s <= trackStepsToCheck; s++) {
      const stepPos = (m.pos + s) % cfg.trackLen;
      const isFinalStep = !enteringHome && s === trackStepsToCheck;
      const atSpot = marbles.find(x => x.id !== m.id && x.zone === 'track' && x.pos === stepPos);
      if (atSpot) {
        if (atSpot.owner === m.owner) {
          return { valid: false, reason: 'same-color-block' };
        }
        if (isSafeStartMarble(atSpot, players)) {
          return { valid: false, reason: 'start-spot-block' };
        }
        if (enteringHome && s === trackStepsToCheck && !o.sweepCapture) {
          return { valid: false, reason: 'pre-home-block' };
        }
        if (o.sweepCapture) {
          passedCaptures.push(atSpot.id);
        } else if (isFinalStep) {
          passedCaptures.push(atSpot.id);
        }
      }
      path.push({ zone: 'track', pos: stepPos, homeIdx: -1 });
    }

    if (enteringHome) {
      const hi = ns - (homeEntrySteps + 1);
      if (hi >= cfg.homeLen) return { valid: false, reason: 'home-overshoot' };
      const homeBlocked = marbles.some(
        x => x.id !== m.id && x.owner === m.owner && x.zone === 'home' && x.homeIdx <= hi
      );
      if (homeBlocked) return { valid: false, reason: 'home-blocked' };
      for (let h = 0; h <= hi; h++) {
        path.push({ zone: 'home', pos: -1, homeIdx: h });
      }
      return {
        valid: true,
        zone: 'home',
        pos: -1,
        homeIdx: hi,
        stepsFromStart: ns,
        teleported: false,
        passedCaptures,
        path
      };
    }

    let np = (m.pos + steps) % cfg.trackLen;
    let teleported = false;
    let teleportFrom = -1;
    if (cfg.teleportMap && cfg.teleportMap[np] !== undefined) {
      const tp = cfg.teleportMap[np];
      const tpSteps = ((tp - owner.startPos) % cfg.trackLen + cfg.trackLen) % cfg.trackLen;
      // Only teleport when the swirl advances this marble forward without overshooting its home entry
      if (tpSteps > ns && tpSteps <= homeEntrySteps) {
        const ownAtTp = marbles.some(x => x.id !== m.id && x.owner === m.owner && x.zone === 'track' && x.pos === tp);
        const safeAtTp = marbles.some(x => x.id !== m.id && x.owner !== m.owner && x.zone === 'track' && x.pos === tp && isSafeStartMarble(x, players));
        if (!ownAtTp && !safeAtTp) {
          teleportFrom = np;
          np = tp;
          teleported = true;
          ns = tpSteps;
          path.push({ zone: 'track', pos: tp, homeIdx: -1, isTeleport: true });
          const tpVictim = marbles.find(x => x.id !== m.id && x.owner !== m.owner && x.zone === 'track' && x.pos === tp && !isSafeStartMarble(x, players));
          if (tpVictim && !passedCaptures.includes(tpVictim.id)) {
            passedCaptures.push(tpVictim.id);
          }
        }
      }
    }

    return {
      valid: true,
      zone: 'track',
      pos: np,
      homeIdx: -1,
      stepsFromStart: ns,
      teleported,
      teleportFrom,
      passedCaptures,
      path
    };
  }

  function canExitBase(seat, state) {
    const players = state.players || [];
    const marbles = state.marbles || [];
    const targetSeat = getControlSeat(seat, state);
    const owner = players.find(p => p.seat === targetSeat);
    if (!owner) return false;
    const hasBase = marbles.some(m => m.owner === targetSeat && m.zone === 'base');
    if (!hasBase) return false;
    const ownOnStart = marbles.some(m => m.owner === targetSeat && m.zone === 'track' && m.pos === owner.startPos);
    return !ownOnStart;
  }

  function getNextOpponentSeat(seat, players) {
    const idx = players.findIndex(p => p.seat === seat);
    if (idx < 0) return null;
    for (let offset = 1; offset < players.length; offset++) {
      const cand = players[(idx + offset) % players.length];
      if (cand && cand.team !== players[idx].team && cand.hand && cand.hand.length > 0) {
        return cand.seat;
      }
    }
    return null;
  }

  /**
   * Simulates applying `dA` to marble `mA` on a cloned marble list so 7-split
   * validates the 2nd marble against the real post-move board state.
   */
  function getValidSplit7Options(seat, state) {
    const marbles = state.marbles || [];
    const targetSeat = getControlSeat(seat, state);
    const myActive = marbles.filter(m => m.owner === targetSeat && m.zone !== 'base');
    if (myActive.length < 2) return [];
    const options = [];
    for (let stepA = 1; stepA <= 6; stepA++) {
      const stepB = 7 - stepA;
      for (const mA of myActive) {
        const dA = computeMove(mA, stepA, state);
        if (!dA.valid) continue;
        // Clone marbles with mA moved & any captured stones sent to base
        const cloned = marbles.map(x => {
          if (x.id === mA.id) {
            return { ...x, zone: dA.zone, pos: dA.pos, homeIdx: dA.homeIdx, stepsFromStart: dA.stepsFromStart };
          }
          if (dA.passedCaptures && dA.passedCaptures.includes(x.id)) {
            return { ...x, zone: 'base', pos: -1, homeIdx: -1, stepsFromStart: 0 };
          }
          return x;
        });
        const nextState = { ...state, marbles: cloned };
        for (const mB of cloned) {
          if (mB.owner !== targetSeat || mB.id === mA.id || mB.zone === 'base') continue;
          const dB = computeMove(mB, stepB, nextState);
          if (dB.valid) {
            options.push({ marbleAId: mA.id, stepA, dA, marbleBId: mB.id, stepB, dB });
          }
        }
      }
    }
    return options;
  }

  /**
   * Enumerates ALL legal plays for `card` by `seat` in `state`, and flags
   * `autoAction` whenever tapping the card has a single obvious 1-tap play
   * (e.g. all stones in base -> instant Open, or 1 stone outside -> instant +12!).
   */
  function getLegalActionsForCard(card, seat, state) {
    const mode = state && state.mode ? state.mode : '1v1';
    const role = getCardRole(card, mode);
    const marbles = state.marbles || [];
    const players = state.players || [];
    const controlSeat = getControlSeat(seat, state);
    const myMarbles = marbles.filter(m => m.owner === controlSeat);
    const baseMarbles = myMarbles.filter(m => m.zone === 'base');
    const activeMarbles = myMarbles.filter(m => m.zone !== 'base');
    const myTrack = myMarbles.filter(m => m.zone === 'track');

    const exitBase = Boolean(role.canExitBase && baseMarbles.length > 0 && canExitBase(seat, state));
    const exitMarbleId = exitBase ? baseMarbles[0].id : null;

    const movesByStep = {};
    const allMoves = [];
    if (role.steps && role.steps.length) {
      const pool = role.anyMarble
        ? marbles.filter(m => canCard5MoveMarble(m, controlSeat, players))
        : activeMarbles;
      for (const stp of role.steps) {
        const list = [];
        for (const mb of pool) {
          const d = computeMove(mb, stp, state, { sweepCapture: Boolean(role.sweepCapture) });
          if (d.valid) {
            const item = { marbleId: mb.id, steps: stp, sweepCapture: Boolean(role.sweepCapture), dest: d };
            list.push(item);
            allMoves.push(item);
          }
        }
        if (list.length) movesByStep[stp] = list;
      }
    }

    const oppSeatForDiscard = role.canDiscardNext ? getNextOpponentSeat(seat, players) : null;
    const canDiscardEnemy = oppSeatForDiscard !== null;

    const swapPairs = [];
    if (role.canSwap && myTrack.length) {
      const meP = players.find(p => p.seat === seat);
      // Stones sitting on their own opening/start spot are completely immune to Swap (both own & rival)
      const mySwappable = myTrack.filter(x => !isSafeStartMarble(x, players));
      const oppTargets = marbles.filter(
        x => x.owner !== controlSeat && x.zone === 'track' && !isSafeStartMarble(x, players) &&
          (players.find(p => p.seat === x.owner)?.team !== meP?.team)
      );
      for (const myM of mySwappable) {
        for (const oppM of oppTargets) {
          swapPairs.push({ myMarbleId: myM.id, oppMarbleId: oppM.id });
        }
      }
    }

    const split7Options = role.canSplit ? getValidSplit7Options(seat, state) : [];

    const playable = exitBase || allMoves.length > 0 || canDiscardEnemy || swapPairs.length > 0 || split7Options.length > 0;

    // Determine zero-friction 1-tap autoAction when only one clear play exists!
    let autoAction = null;
    if (playable) {
      const hasStepMoves = allMoves.length > 0;
      const hasSwaps = swapPairs.length > 0;
      const hasSplit = split7Options.length > 0;

      // Case 1: Only exiting base is possible (e.g. all stones in base and tapped A / 2 / K!)
      if (exitBase && !hasStepMoves && !canDiscardEnemy && !hasSwaps && !hasSplit) {
        autoAction = { type: 'exit_base', marbleId: exitMarbleId };
      }
      // Case 2: Only discarding rival's card is possible (Red Queen -> pick hidden card; 10 with no +10 -> direct discard)
      else if (canDiscardEnemy && !exitBase && !hasStepMoves && !hasSwaps && !hasSplit) {
        autoAction = {
          type: role.pickHiddenDiscard ? 'pick_hidden_enemy' : 'discard_enemy',
          targetSeat: oppSeatForDiscard
        };
      }
      // Case 3: Exactly ONE step move across all step options (e.g. 1 stone outside & tapped 12, 8, 6, 3, 4, A, 2, K, 5!)
      else if (!exitBase && !canDiscardEnemy && !hasSwaps && !hasSplit && allMoves.length === 1) {
        autoAction = { type: 'move', ...allMoves[0] };
      }
      // Case 4: Exactly ONE Black Jack swap pair exists
      else if (!exitBase && !canDiscardEnemy && !hasStepMoves && !hasSplit && swapPairs.length === 1) {
        autoAction = { type: 'swap', ...swapPairs[0] };
      }
    }

    return {
      role,
      controlSeat,
      playable,
      exitBase,
      exitMarbleId,
      movesByStep,
      allMoves,
      canDiscardEnemy,
      oppSeatForDiscard,
      swapPairs,
      split7Options,
      autoAction
    };
  }

  function isCardPlayable(card, seat, state) {
    return getLegalActionsForCard(card, seat, state).playable;
  }

  /**
   * Simple Noob Auto-Play selector used when a human player's 15s turn timer expires
   * or after 3s while AFK Auto-Play mode is active.
   */
  function pickNoobAction(seat, state) {
    const players = state.players || [];
    const marbles = state.marbles || [];
    const meP = players.find(p => p.seat === seat);
    if (!meP || !meP.hand || !meP.hand.length) return null;
    const controlSeat = getControlSeat(seat, state);

    // 1. Open a stone from base if possible
    for (const card of meP.hand) {
      const legal = getLegalActionsForCard(card, seat, state);
      if (legal.exitBase && legal.exitMarbleId) {
        return { type: 'exit_base', card, marbleId: legal.exitMarbleId };
      }
    }

    // 2. First simple legal step move (prefer moving own/controlled stone over pushing a rival)
    for (const card of meP.hand) {
      const legal = getLegalActionsForCard(card, seat, state);
      if (legal.allMoves.length) {
        const ownMove = legal.allMoves.find(mv => {
          const mb = marbles.find(x => x.id === mv.marbleId);
          return mb && mb.owner === controlSeat;
        });
        const chosen = ownMove || legal.allMoves[0];
        return { type: 'move', card, ...chosen };
      }
    }

    // 3. Discard enemy card if available
    for (const card of meP.hand) {
      const legal = getLegalActionsForCard(card, seat, state);
      if (legal.canDiscardEnemy && legal.oppSeatForDiscard !== null) {
        return { type: 'discard_enemy', card, targetSeat: legal.oppSeatForDiscard };
      }
    }

    // 4. Split 7 if available
    for (const card of meP.hand) {
      const legal = getLegalActionsForCard(card, seat, state);
      if (legal.split7Options.length) {
        return { type: 'split7', card, split: legal.split7Options[0] };
      }
    }

    // 5. Black Jack swap if available
    for (const card of meP.hand) {
      const legal = getLegalActionsForCard(card, seat, state);
      if (legal.swapPairs.length) {
        return { type: 'swap', card, ...legal.swapPairs[0] };
      }
    }

    // 6. Dead hand — burn first card
    return { type: 'discard_self', card: meP.hand[0] };
  }

  const TURN_CONFIG = {
    TURN_SECONDS: 15,
    AFK_AUTO_MS: 3000,
    BOT_MIN_MS: 3000,
    BOT_MAX_MS: 4000
  };

  function getTurnActionDelayMs(isBot, isAfk, rng) {
    const r = typeof rng === 'function' ? rng : Math.random;
    if (isBot) {
      return TURN_CONFIG.BOT_MIN_MS + Math.floor(r() * (TURN_CONFIG.BOT_MAX_MS - TURN_CONFIG.BOT_MIN_MS));
    }
    return isAfk ? TURN_CONFIG.AFK_AUTO_MS : TURN_CONFIG.TURN_SECONDS * 1000;
  }

  const api = {
    HOME_LEN,
    SUITS,
    RANKS,
    TURN_CONFIG,
    getBoardConfig,
    buildDeckForMode,
    getCardRole,
    getControlSeat,
    shouldGrantExtraTurn,
    shouldGrantComboDraw,
    isSafeStartMarble,
    canCard5MoveMarble,
    getHomeEntrySpot,
    computeMove,
    canExitBase,
    getNextOpponentSeat,
    getValidSplit7Options,
    getLegalActionsForCard,
    isCardPlayable,
    pickNoobAction,
    getTurnActionDelayMs
  };

  root.JackarooRules = api;
})(typeof globalThis !== 'undefined' ? globalThis : window);
