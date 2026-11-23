"use strict";
/* =====================================================================
   JACKAROO ROYAL — 4-PLAYER (2v2 TEAM) & 1v1 MARBLE CARD BOARD GAME (v12)
   Full rulebook: Ace (Base/+1/+11), King (Base/+13), Queen (+12),
   Jack (Swap non-safe marbles), 7 (Move 7 or Split across 2 marbles),
   4 (-4 backward), 10 (+10 or Burn opponent card), Safe Zones, Capture,
   Smart AI Teammates & Opponents, 3D Glossy Marbles & Quick Voice Chat.
   ===================================================================== */

function launchJackaroo(stake, rival, modeRaw) {
  const mode = modeRaw === '1v1' ? '1v1' : '2v2';
  const TRACK_LEN = 48;
  const HOME_LEN = 4;
  const SAFE_SPOTS = [0, 12, 24, 36];
  const SUITS = ['♠', '♥', '♦', '♣'];
  const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  const SEAT_COLORS = [
    { name: 'Sapphire', hex: '#38bdf8', dark: '#0369a1', glow: 'rgba(56,189,248,.65)', emoji: '🔵' },
    { name: 'Crimson', hex: '#f43f5e', dark: '#9f1239', glow: 'rgba(244,63,94,.65)', emoji: '🔴' },
    { name: 'Emerald', hex: '#10b981', dark: '#047857', glow: 'rgba(16,185,129,.65)', emoji: '🟢' },
    { name: 'Amber', hex: '#f59e0b', dark: '#b45309', glow: 'rgba(245,158,11,.65)', emoji: '🟡' }
  ];

  const pay = calcArenaStakePayout(stake);
  const activeSeats = mode === '1v1' ? [0, 2] : [0, 1, 2, 3];
  const oppName = rival?.name || (mode === '1v1' ? 'Royal Bot' : 'Viper Duo');

  const shuffle = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  let deckSeq = 0;
  const makeDeck = () => {
    const d = [];
    for (const suit of SUITS) {
      for (const rank of RANKS) {
        d.push({ id: `jk_${rank}_${suit}_${deckSeq++}`, rank, suit, red: suit === '♥' || suit === '♦' });
      }
    }
    return shuffle(d);
  };

  let deck = makeDeck();
  let discard = [];

  const drawCards = (count) => {
    const out = [];
    for (let i = 0; i < count; i++) {
      if (!deck.length) {
        deck = discard.length ? shuffle(discard) : makeDeck();
        discard = [];
      }
      if (deck.length) out.push(deck.pop());
    }
    return out;
  };

  const seatNames = {
    0: me?.name || 'You',
    1: 'Nova Bot',
    2: mode === '1v1' ? oppName : 'Atlas (Mate)',
    3: 'Viper Bot'
  };

  const players = activeSeats.map(seat => ({
    seat,
    team: mode === '1v1' ? (seat === 0 ? 0 : 1) : (seat % 2),
    name: seatNames[seat],
    isBot: seat !== 0,
    startPos: seat * 12,
    hand: drawCards(4),
    color: SEAT_COLORS[seat]
  }));

  /* Give player a guaranteed Ace or King in opening hand so gameplay starts exciting immediately */
  if (!players[0].hand.some(c => c.rank === 'A' || c.rank === 'K')) {
    const akIdx = deck.findIndex(c => c.rank === 'A' || c.rank === 'K');
    if (akIdx >= 0) {
      const swapped = deck.splice(akIdx, 1)[0];
      deck.push(players[0].hand[0]);
      players[0].hand[0] = swapped;
    }
  }

  const marbles = [];
  players.forEach(p => {
    for (let i = 0; i < 4; i++) {
      marbles.push({
        id: `jm_${p.seat}_${i}`,
        owner: p.seat,
        idx: i,
        zone: 'base', // 'base' | 'track' | 'home'
        pos: -1,
        homeIdx: -1,
        stepsFromStart: 0
      });
    }
  });

  let turnIdx = 0;
  let over = false;
  let selectedCardId = null;
  let actionSubMode = null; // null | 'ace_pick' | 'king_pick' | 'jack_pick_my' | 'jack_pick_opp' | 'seven_split' | 'ten_pick'
  let chosenSteps = null;
  let jackMyMarbleId = null;
  let splitStepA = 3;
  let splitMarbleA = null;
  let lastActionText = 'Tap a card (A/K exits base, J swaps, 7 splits, 4 goes back, 10 burns)!';
  let burstCoord = null;
  let botTimer = 0;

  const findPlayer = seat => players.find(p => p.seat === seat);

  const isSafe = m => {
    if (m.zone === 'base' || m.zone === 'home') return true;
    const p = findPlayer(m.owner);
    return p && m.pos === p.startPos && m.stepsFromStart === 0;
  };

  const computeDest = (m, steps) => {
    if (m.zone === 'base') return { valid: false };
    if (m.zone === 'home') {
      if (steps <= 0) return { valid: false };
      const th = m.homeIdx + steps;
      if (th >= HOME_LEN) return { valid: false };
      const blocked = marbles.some(o => o.id !== m.id && o.owner === m.owner && o.zone === 'home' && o.homeIdx > m.homeIdx && o.homeIdx <= th);
      if (blocked) return { valid: false };
      return { valid: true, zone: 'home', pos: -1, homeIdx: th, stepsFromStart: m.stepsFromStart + steps };
    }
    if (steps < 0) {
      const np = ((m.pos + steps) % TRACK_LEN + TRACK_LEN) % TRACK_LEN;
      const ns = Math.max(0, m.stepsFromStart + steps);
      if (marbles.some(o => o.id !== m.id && o.owner === m.owner && o.zone === 'track' && o.pos === np)) return { valid: false };
      if (marbles.some(o => o.owner !== m.owner && o.zone === 'track' && o.pos === np && isSafe(o))) return { valid: false };
      return { valid: true, zone: 'track', pos: np, homeIdx: -1, stepsFromStart: ns };
    }
    const ns = m.stepsFromStart + steps;
    if (ns >= TRACK_LEN) {
      const hi = ns - TRACK_LEN;
      if (hi >= HOME_LEN) return { valid: false };
      if (marbles.some(o => o.id !== m.id && o.owner === m.owner && o.zone === 'home' && o.homeIdx <= hi)) return { valid: false };
      return { valid: true, zone: 'home', pos: -1, homeIdx: hi, stepsFromStart: ns };
    }
    const np = (m.pos + steps) % TRACK_LEN;
    if (marbles.some(o => o.id !== m.id && o.owner === m.owner && o.zone === 'track' && o.pos === np)) return { valid: false };
    if (marbles.some(o => o.owner !== m.owner && o.zone === 'track' && o.pos === np && isSafe(o))) return { valid: false };
    return { valid: true, zone: 'track', pos: np, homeIdx: -1, stepsFromStart: ns };
  };

  /* Coordinate mapping for 360x360 Royal Wooden Circular Board */
  const CX = 180, CY = 180, R_TRACK = 134;
  const trackXY = (pos) => {
    const angle = (Math.PI / 2) + (pos / TRACK_LEN) * Math.PI * 2; // pos 0 at bottom (You!)
    return { x: CX + Math.cos(angle) * R_TRACK, y: CY + Math.sin(angle) * R_TRACK };
  };
  const homeXY = (seat, hIdx) => {
    const baseAngle = (Math.PI / 2) + ((seat * 12) / TRACK_LEN) * Math.PI * 2;
    const r = 104 - hIdx * 21;
    return { x: CX + Math.cos(baseAngle) * r, y: CY + Math.sin(baseAngle) * r };
  };
  const baseCenters = {
    0: { x: 54, y: 300 },   // Bottom-left (You - Blue)
    1: { x: 54, y: 60 },    // Top-left (Crimson)
    2: { x: 306, y: 60 },   // Top-right (Emerald)
    3: { x: 306, y: 300 }   // Bottom-right (Amber)
  };
  const baseXY = (seat, idx) => {
    const c = baseCenters[seat];
    const offs = [[-11, -11], [11, -11], [-11, 11], [11, 11]][idx];
    return { x: c.x + offs[0], y: c.y + offs[1] };
  };
  const marbleXY = (m) => {
    if (m.zone === 'base') return baseXY(m.owner, m.idx);
    if (m.zone === 'home') return homeXY(m.owner, m.homeIdx);
    return trackXY(m.pos);
  };

  const captureAt = (moverSeat, pos) => {
    const vic = marbles.find(m => m.zone === 'track' && m.pos === pos && m.owner !== moverSeat && !isSafe(m));
    if (!vic) return null;
    const pt = trackXY(pos);
    burstCoord = { x: pt.x, y: pt.y, color: SEAT_COLORS[vic.owner].hex };
    vic.zone = 'base';
    vic.pos = -1;
    vic.homeIdx = -1;
    vic.stepsFromStart = 0;
    if (typeof playSfx === 'function') playSfx('duelCorrect');
    return vic;
  };

  const checkWinner = () => {
    for (const team of [0, 1]) {
      const teamSeats = players.filter(p => p.team === team).map(p => p.seat);
      const teamM = marbles.filter(m => teamSeats.includes(m.owner));
      if (teamM.length && teamM.every(m => m.zone === 'home')) return team;
    }
    return null;
  };

  const refillHandsIfEmpty = () => {
    if (players.every(p => p.hand.length === 0)) {
      players.forEach(p => { p.hand = drawCards(4); });
      lastActionText = '🃏 New 4-card round dealt!';
    }
  };

  const consumeCard = (p, cardId) => {
    const idx = p.hand.findIndex(c => c.id === cardId);
    if (idx >= 0) discard.push(p.hand.splice(idx, 1)[0]);
  };

  const cardTag = (rank) => {
    if (rank === 'A') return 'Base/+1/+11';
    if (rank === 'K') return 'Base/+13';
    if (rank === 'Q') return '+12';
    if (rank === 'J') return 'Swap';
    if (rank === '7') return '7 / Split';
    if (rank === '4') return 'Back −4';
    if (rank === '10') return '+10 / Burn';
    return '+' + rank;
  };

  const getTeamScore = (team) => {
    const seats = players.filter(p => p.team === team).map(p => p.seat);
    return marbles.filter(m => seats.includes(m.owner) && m.zone === 'home').length;
  };

  const totalTeamMarbles = mode === '1v1' ? 4 : 8;

  const m = modal(`Jackaroo Royal · ${mode === '2v2' ? '2v2 Team' : '1v1'}${stake > 0 ? ` · ${stake} 🪙` : ''}`, `
    <div class="jk-shell" id="jkShell" data-testid="jackaroo-stage">
      <div class="arena-hud-bar jk-hud" id="jkHud">
        <span class="hud-pill me" id="jkTeam0">🔵 ${mode === '2v2' ? 'Your Team' : 'You'}: 0/${totalTeamMarbles}</span>
        <span class="hud-pill turn" id="jkTurn">Your Turn</span>
        <span class="hud-pill bot" id="jkTeam1">${mode === '2v2' ? '🔴 Rivals' : '🟢 ' + esc(oppName)}: 0/${totalTeamMarbles}</span>
      </div>
      ${stake > 0 ? `<div class="arena-pot-ribbon">Pot ${fmtNum(pay.grossPot)} 🪙 · Win +${fmtNum(pay.winnerPayout)} 🪙 (${pay.feePercent}% fee)</div>` : ''}
      <div class="jk-board-wrap" id="jkBoardWrap">
        <svg class="jk-board-svg" id="jkSvg" viewBox="0 0 360 360" aria-label="Jackaroo Royal Board"></svg>
      </div>
      <div class="jk-action-bar" id="jkActionBar"></div>
      <div class="jk-hand-tray" id="jkHandTray"></div>
      ${typeof QuickVoice !== 'undefined' ? QuickVoice.renderGameVoiceBar('jk') : ''}
      <div id="jkFoot"></div>
    </div>
  `, 'jk-modal');

  if (typeof QuickVoice !== 'undefined') {
    QuickVoice.bindGameVoiceBar(m, 'jk', 'jackaroo', '#jkBoardWrap');
  }

  const endMatch = (winTeam) => {
    over = true;
    clearTimeout(botTimer);
    const outcome = winTeam === 0 ? 'win' : 'lose';
    const res = settleArenaMatchOutcome(outcome, stake, 55, 38, 14);
    const foot = $('#jkFoot', m);
    if (foot) {
      foot.innerHTML = `<div class="arena-result-card"><b>${esc(res.headline)}</b><small>${winTeam === 0 ? 'All team marbles reached Royal Home!' : 'Rivals filled their Home first.'} · ${esc(res.detail)}</small><button type="button" class="btn gold sm" id="jkAgain" style="margin-top:8px">Play Again</button></div>`;
      $('#jkAgain', m).onclick = () => { m.close(); openArenaGame('jackaroo', rival?.uid); };
    }
    render();
  };

  const advanceTurn = () => {
    selectedCardId = null;
    actionSubMode = null;
    chosenSteps = null;
    jackMyMarbleId = null;
    splitMarbleA = null;

    const w = checkWinner();
    if (w !== null) { endMatch(w); return; }

    refillHandsIfEmpty();
    /* Skip any player whose hand was burned empty until next deal */
    for (let guard = 0; guard < players.length; guard++) {
      turnIdx = (turnIdx + 1) % players.length;
      if (players[turnIdx].hand.length > 0) break;
    }
    render();
    if (!over && players[turnIdx].isBot) {
      scheduleBotMove();
    }
  };

  /* Smart Jackaroo Bot AI (plays teammate & rival seats intelligently) */
  const scheduleBotMove = () => {
    clearTimeout(botTimer);
    botTimer = setTimeout(() => {
      if (over) return;
      const p = players[turnIdx];
      if (!p || !p.isBot) return;
      if (!p.hand.length) { advanceTurn(); return; }

      const myMarbles = marbles.filter(x => x.owner === p.seat);
      const baseM = myMarbles.filter(x => x.zone === 'base');
      const activeM = myMarbles.filter(x => x.zone !== 'base');
      const trackM = myMarbles.filter(x => x.zone === 'track');
      let acted = false;

      /* 1. Try entering home stretch or capturing an opponent */
      outer:
      for (const c of p.hand) {
        if (c.rank === 'J' || c.rank === '4') continue;
        const stepOpts = c.rank === 'A' ? [11, 1] : c.rank === 'K' ? [13] : c.rank === 'Q' ? [12] : [Number(c.rank)];
        for (const stp of stepOpts) {
          for (const mb of activeM) {
            const d = computeDest(mb, stp);
            if (!d.valid) continue;
            const wouldCapture = d.zone === 'track' && marbles.some(o => o.zone === 'track' && o.pos === d.pos && o.owner !== p.seat && !isSafe(o));
            if (d.zone === 'home' || wouldCapture) {
              if (d.zone === 'track') captureAt(p.seat, d.pos);
              mb.zone = d.zone; mb.pos = d.pos; mb.homeIdx = d.homeIdx; mb.stepsFromStart = d.stepsFromStart;
              consumeCard(p, c.id);
              lastActionText = `${p.color.emoji} ${p.name} played ${c.rank}${c.suit}${wouldCapture ? ' and CAPTURED!' : ' into Home!'}`;
              if (typeof playSfx === 'function') playSfx(wouldCapture ? 'duelWrong' : 'turnStart');
              acted = true;
              break outer;
            }
          }
        }
      }

      /* 2. Exit base with Ace/King */
      if (!acted && baseM.length) {
        const exitCard = p.hand.find(c => c.rank === 'A' || c.rank === 'K');
        const startBlocked = marbles.some(x => x.owner === p.seat && x.zone === 'track' && x.pos === p.startPos);
        if (exitCard && !startBlocked) {
          const mb = baseM[0];
          captureAt(p.seat, p.startPos);
          mb.zone = 'track'; mb.pos = p.startPos; mb.stepsFromStart = 0;
          consumeCard(p, exitCard.id);
          lastActionText = `${p.color.emoji} ${p.name} used ${exitCard.rank}${exitCard.suit} to exit Base!`;
          if (typeof playSfx === 'function') playSfx('tap');
          acted = true;
        }
      }

      /* 3. Jack swap if opponent is far ahead and not safe */
      if (!acted && trackM.length) {
        const jCard = p.hand.find(c => c.rank === 'J');
        const oppTargets = marbles.filter(x => x.zone === 'track' && findPlayer(x.owner)?.team !== p.team && !isSafe(x));
        if (jCard && oppTargets.length) {
          oppTargets.sort((a, b) => b.stepsFromStart - a.stepsFromStart);
          const myBehind = trackM.slice().sort((a, b) => a.stepsFromStart - b.stepsFromStart)[0];
          const target = oppTargets[0];
          if (target.stepsFromStart > myBehind.stepsFromStart) {
            const tmp = myBehind.pos;
            myBehind.pos = target.pos;
            target.pos = tmp;
            myBehind.stepsFromStart = ((myBehind.pos - p.startPos) % TRACK_LEN + TRACK_LEN) % TRACK_LEN;
            const to = findPlayer(target.owner);
            if (to) target.stepsFromStart = ((target.pos - to.startPos) % TRACK_LEN + TRACK_LEN) % TRACK_LEN;
            consumeCard(p, jCard.id);
            lastActionText = `${p.color.emoji} ${p.name} played J${jCard.suit} to SWAP marbles!`;
            if (typeof playSfx === 'function') playSfx('micPass');
            acted = true;
          }
        }
      }

      /* 4. Card 10 burn an enemy card if opponent has cards */
      if (!acted) {
        const tenCard = p.hand.find(c => c.rank === '10');
        const enemy = players.find(o => o.team !== p.team && o.hand.length > 0);
        if (tenCard && enemy && Math.random() < 0.45) {
          consumeCard(p, tenCard.id);
          const burned = enemy.hand.pop();
          if (burned) discard.push(burned);
          lastActionText = `🔥 ${p.name} played 10${tenCard.suit} and burned ${enemy.name}'s card!`;
          if (typeof playSfx === 'function') playSfx('duelWrong');
          acted = true;
        }
      }

      /* 5. Any legal move forward/backward */
      if (!acted && activeM.length) {
        outer2:
        for (const c of p.hand) {
          if (c.rank === 'J') continue;
          const opts = c.rank === 'A' ? [11, 1] : c.rank === 'K' ? [13] : c.rank === 'Q' ? [12] : c.rank === '4' ? [-4] : [Number(c.rank)];
          for (const stp of opts) {
            for (const mb of activeM) {
              const d = computeDest(mb, stp);
              if (d.valid) {
                if (d.zone === 'track') captureAt(p.seat, d.pos);
                mb.zone = d.zone; mb.pos = d.pos; mb.homeIdx = d.homeIdx; mb.stepsFromStart = d.stepsFromStart;
                consumeCard(p, c.id);
                lastActionText = `${p.color.emoji} ${p.name} moved ${stp > 0 ? '+' + stp : stp} with ${c.rank}${c.suit}`;
                if (typeof playSfx === 'function') playSfx('tap');
                acted = true;
                break outer2;
              }
            }
          }
        }
      }

      /* 6. Otherwise burn a card to pass */
      if (!acted && p.hand.length) {
        const burned = p.hand.shift();
        discard.push(burned);
        lastActionText = `${p.color.emoji} ${p.name} discarded ${burned.rank}${burned.suit}`;
      }

      /* Occasional bot Quick Voice callout bubble */
      if (Math.random() < 0.22 && typeof QuickVoice !== 'undefined') {
        const lines = p.team === 0 ? ['Help me!', 'Nice move!', 'Finish strong!'] : ['Block them!', 'Swap now!', 'Watch out!'];
        const line = lines[Math.floor(Math.random() * lines.length)];
        QuickVoice.showBubble($('#jkBoardWrap', m), line, p.name, false);
      }

      advanceTurn();
    }, 640);
  };

  /* Compute which marbles are currently highlighted as clickable targets for Player 0 */
  const getSelectableMarbleIds = () => {
    const ids = new Set();
    if (over || turnIdx !== 0 || !selectedCardId) return ids;
    const meP = players[0];
    const card = meP.hand.find(c => c.id === selectedCardId);
    if (!card) return ids;
    const myM = marbles.filter(x => x.owner === 0);

    if (actionSubMode === 'leave_base') {
      const startBlocked = myM.some(x => x.zone === 'track' && x.pos === 0);
      if (!startBlocked) myM.filter(x => x.zone === 'base').forEach(x => ids.add(x.id));
    } else if (actionSubMode === 'jack_pick_my') {
      myM.filter(x => x.zone === 'track').forEach(x => ids.add(x.id));
    } else if (actionSubMode === 'jack_pick_opp') {
      marbles.filter(x => x.owner !== 0 && x.zone === 'track' && !isSafe(x)).forEach(x => ids.add(x.id));
    } else if (actionSubMode === 'seven_split') {
      if (!splitMarbleA) {
        myM.filter(x => x.zone !== 'base' && computeDest(x, splitStepA).valid).forEach(x => ids.add(x.id));
      } else {
        const rem = 7 - splitStepA;
        myM.filter(x => x.id !== splitMarbleA && x.zone !== 'base' && computeDest(x, rem).valid).forEach(x => ids.add(x.id));
      }
    } else if (chosenSteps !== null) {
      myM.filter(x => x.zone !== 'base' && computeDest(x, chosenSteps).valid).forEach(x => ids.add(x.id));
    }
    return ids;
  };

  const handleCardSelect = (cardId) => {
    if (over || turnIdx !== 0) return;
    const card = players[0].hand.find(c => c.id === cardId);
    if (!card) return;
    if (typeof playSfx === 'function') playSfx('tap');
    selectedCardId = cardId;
    jackMyMarbleId = null;
    splitMarbleA = null;
    chosenSteps = null;

    if (card.rank === 'A') {
      actionSubMode = 'ace_pick';
      lastActionText = 'Ace selected: choose Exit Base, +1, or +11';
    } else if (card.rank === 'K') {
      actionSubMode = 'king_pick';
      lastActionText = 'King selected: choose Exit Base or +13';
    } else if (card.rank === 'J') {
      actionSubMode = 'jack_pick_my';
      lastActionText = 'Jack Swap: tap one of your track marbles first';
    } else if (card.rank === '7') {
      actionSubMode = 'seven_pick';
      lastActionText = 'Card 7: move +7 on one marble OR Split 7 across two marbles';
    } else if (card.rank === '10') {
      actionSubMode = 'ten_pick';
      lastActionText = 'Card 10: move +10 OR Burn a rival\'s card!';
    } else if (card.rank === '4') {
      actionSubMode = 'step';
      chosenSteps = -4;
      lastActionText = 'Card 4: tap a marble to move −4 steps backward';
    } else {
      actionSubMode = 'step';
      chosenSteps = card.rank === 'Q' ? 12 : Number(card.rank);
      lastActionText = `${card.rank}${card.suit}: tap a glowing marble to move +${chosenSteps}`;
    }
    render();
  };

  const handleMarbleClick = (marbleId) => {
    const selectable = getSelectableMarbleIds();
    if (!selectable.has(marbleId)) return;
    const meP = players[0];
    const card = meP.hand.find(c => c.id === selectedCardId);
    const mb = marbles.find(x => x.id === marbleId);
    if (!card || !mb) return;

    if (actionSubMode === 'leave_base') {
      captureAt(0, 0);
      mb.zone = 'track'; mb.pos = 0; mb.stepsFromStart = 0;
      consumeCard(meP, card.id);
      lastActionText = `🔵 Your marble exited Base onto Safe Star!`;
      if (typeof playSfx === 'function') playSfx('turnStart');
      advanceTurn();
      return;
    }

    if (actionSubMode === 'jack_pick_my') {
      jackMyMarbleId = marbleId;
      actionSubMode = 'jack_pick_opp';
      lastActionText = 'Jack Swap: now tap any glowing rival marble (outside safe zone) to swap!';
      if (typeof playSfx === 'function') playSfx('tap');
      render();
      return;
    }

    if (actionSubMode === 'jack_pick_opp') {
      const myM = marbles.find(x => x.id === jackMyMarbleId);
      if (!myM) return;
      const tmp = myM.pos;
      myM.pos = mb.pos;
      mb.pos = tmp;
      myM.stepsFromStart = ((myM.pos - meP.startPos) % TRACK_LEN + TRACK_LEN) % TRACK_LEN;
      const oppOwner = findPlayer(mb.owner);
      if (oppOwner) mb.stepsFromStart = ((mb.pos - oppOwner.startPos) % TRACK_LEN + TRACK_LEN) % TRACK_LEN;
      const pt = trackXY(myM.pos);
      burstCoord = { x: pt.x, y: pt.y, color: '#38bdf8' };
      consumeCard(meP, card.id);
      lastActionText = `🔀 Jack Swap executed with ${oppOwner?.name || 'Rival'}!`;
      if (typeof playSfx === 'function') playSfx('duelCorrect');
      advanceTurn();
      return;
    }

    if (actionSubMode === 'seven_split') {
      if (!splitMarbleA) {
        splitMarbleA = marbleId;
        lastActionText = `Split 7: First marble +${splitStepA} set. Now tap your 2nd marble for +${7 - splitStepA}!`;
        if (typeof playSfx === 'function') playSfx('tap');
        render();
        return;
      }
      const mA = marbles.find(x => x.id === splitMarbleA);
      const mB = mb;
      const dA = computeDest(mA, splitStepA);
      const dB = computeDest(mB, 7 - splitStepA);
      if (!dA.valid || !dB.valid) return toast('Invalid split target');
      if (dA.zone === 'track') captureAt(0, dA.pos);
      mA.zone = dA.zone; mA.pos = dA.pos; mA.homeIdx = dA.homeIdx; mA.stepsFromStart = dA.stepsFromStart;
      if (dB.zone === 'track') captureAt(0, dB.pos);
      mB.zone = dB.zone; mB.pos = dB.pos; mB.homeIdx = dB.homeIdx; mB.stepsFromStart = dB.stepsFromStart;
      consumeCard(meP, card.id);
      lastActionText = `✨ Split 7 played (+${splitStepA} & +${7 - splitStepA})!`;
      if (typeof playSfx === 'function') playSfx('duelCorrect');
      advanceTurn();
      return;
    }

    if (chosenSteps !== null) {
      const d = computeDest(mb, chosenSteps);
      if (!d.valid) return;
      let cap = null;
      if (d.zone === 'track') cap = captureAt(0, d.pos);
      mb.zone = d.zone; mb.pos = d.pos; mb.homeIdx = d.homeIdx; mb.stepsFromStart = d.stepsFromStart;
      consumeCard(meP, card.id);
      lastActionText = cap
        ? `💥 Captured rival marble with ${card.rank}${card.suit}!`
        : `🔵 Moved ${chosenSteps > 0 ? '+' + chosenSteps : chosenSteps} with ${card.rank}${card.suit}${d.zone === 'home' ? ' into Home!' : ''}`;
      if (typeof playSfx === 'function') playSfx(d.zone === 'home' ? 'duelCorrect' : 'tap');
      advanceTurn();
    }
  };

  const renderBoardSvg = () => {
    const svg = $('#jkSvg', m);
    if (!svg) return;
    const selectable = getSelectableMarbleIds();

    let trackDots = '';
    for (let i = 0; i < TRACK_LEN; i++) {
      const pt = trackXY(i);
      const isSafeSpot = SAFE_SPOTS.includes(i);
      const seatForSafe = SAFE_SPOTS.indexOf(i);
      if (isSafeSpot) {
        const col = SEAT_COLORS[seatForSafe].hex;
        trackDots += `
          <circle cx="${pt.x.toFixed(1)}" cy="${pt.y.toFixed(1)}" r="8.5" fill="rgba(15,23,42,.82)" stroke="${col}" stroke-width="2.2"/>
          <text x="${pt.x.toFixed(1)}" y="${(pt.y + 3.2).toFixed(1)}" text-anchor="middle" font-size="9" fill="#fde047">★</text>
        `;
      } else {
        trackDots += `<circle cx="${pt.x.toFixed(1)}" cy="${pt.y.toFixed(1)}" r="5.2" fill="#2c1810" stroke="#a16207" stroke-opacity=".55" stroke-width="1.2"/>`;
      }
    }

    let homeSlots = '';
    players.forEach(p => {
      for (let h = 0; h < HOME_LEN; h++) {
        const pt = homeXY(p.seat, h);
        homeSlots += `<circle cx="${pt.x.toFixed(1)}" cy="${pt.y.toFixed(1)}" r="6.8" fill="rgba(15,23,42,.68)" stroke="${p.color.hex}" stroke-opacity=".75" stroke-width="1.6"/>`;
      }
      /* Base carved wood pit */
      const bc = baseCenters[p.seat];
      const lblY = (p.seat === 0 || p.seat === 3) ? (bc.y + 37) : (bc.y - 30);
      homeSlots += `
        <rect x="${bc.x - 25}" y="${bc.y - 25}" width="50" height="50" rx="13" fill="rgba(22,12,8,.82)" stroke="${p.color.hex}" stroke-width="2" stroke-opacity=".75"/>
        <text x="${bc.x}" y="${lblY}" text-anchor="middle" font-size="9.5" font-weight="800" fill="${p.color.hex}">${esc(p.name.slice(0, 10))}</text>
      `;
    });

    let marbleNodes = '';
    marbles.forEach(mb => {
      const pt = marbleXY(mb);
      const col = SEAT_COLORS[mb.owner];
      const isSel = selectable.has(mb.id);
      const isPicked = mb.id === jackMyMarbleId || mb.id === splitMarbleA;
      marbleNodes += `
        <g class="jk-marble-g ${isSel ? 'selectable' : ''} ${isPicked ? 'picked' : ''}" data-jkm="${mb.id}" role="button" tabindex="${isSel ? '0' : '-1'}" aria-label="${esc(col.name)} marble">
          ${isSel ? `<circle cx="${pt.x.toFixed(1)}" cy="${pt.y.toFixed(1)}" r="12.5" fill="none" stroke="#fef08a" stroke-width="2.4" class="jk-pulse-ring"/>` : ''}
          <circle cx="${(pt.x + 1.5).toFixed(1)}" cy="${(pt.y + 2.5).toFixed(1)}" r="7.8" fill="rgba(0,0,0,.45)"/>
          <circle cx="${pt.x.toFixed(1)}" cy="${pt.y.toFixed(1)}" r="8" fill="url(#jkGrad_${mb.owner})" stroke="${isPicked ? '#fef08a' : '#ffffff'}" stroke-width="${isPicked ? '2.2' : '1.1'}" stroke-opacity=".85"/>
          <ellipse cx="${(pt.x - 2.6).toFixed(1)}" cy="${(pt.y - 2.8).toFixed(1)}" rx="2.8" ry="1.8" transform="rotate(-25 ${(pt.x - 2.6).toFixed(1)} ${(pt.y - 2.8).toFixed(1)})" fill="#ffffff" opacity=".78"/>
        </g>
      `;
    });

    const burstSvg = burstCoord
      ? `<g class="jk-burst" transform="translate(${burstCoord.x.toFixed(1)},${burstCoord.y.toFixed(1)})">
          <circle r="18" fill="none" stroke="${burstCoord.color}" stroke-width="3" opacity=".85"/>
          <circle r="10" fill="#fef08a" opacity=".6"/>
        </g>`
      : '';
    burstCoord = null;

    const curTop = discard[discard.length - 1];
    svg.innerHTML = `
      <defs>
        <radialGradient id="jkWoodBg" cx="45%" cy="35%" r="70%">
          <stop offset="0%" stop-color="#6b3a1f"/>
          <stop offset="55%" stop-color="#452110"/>
          <stop offset="100%" stop-color="#230f06"/>
        </radialGradient>
        <radialGradient id="jkFeltCenter" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stop-color="#0f5132"/>
          <stop offset="100%" stop-color="#062c1b"/>
        </radialGradient>
        ${SEAT_COLORS.map((c, i) => `
          <radialGradient id="jkGrad_${i}" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stop-color="#ffffff" stop-opacity=".9"/>
            <stop offset="28%" stop-color="${c.hex}"/>
            <stop offset="100%" stop-color="${c.dark}"/>
          </radialGradient>
        `).join('')}
      </defs>
      <rect x="6" y="6" width="348" height="348" rx="34" fill="url(#jkWoodBg)" stroke="#d97706" stroke-width="4.5"/>
      <rect x="13" y="13" width="334" height="334" rx="28" fill="none" stroke="#fef08a" stroke-opacity=".28" stroke-width="1.5"/>
      <circle cx="${CX}" cy="${CY}" r="147" fill="none" stroke="#f59e0b" stroke-opacity=".35" stroke-width="2" stroke-dasharray="6 4"/>
      <circle cx="${CX}" cy="${CY}" r="118" fill="url(#jkFeltCenter)" stroke="#b45309" stroke-width="3"/>
      <circle cx="${CX}" cy="${CY}" r="28" fill="rgba(15,23,42,.82)" stroke="#fbbf24" stroke-width="2.2"/>
      ${curTop
        ? `<text x="${CX}" y="${CY + 5}" text-anchor="middle" font-size="14" font-weight="900" fill="${curTop.red ? '#fb7185' : '#f8fafc'}">${curTop.rank}${curTop.suit}</text>`
        : `<text x="${CX}" y="${CY + 4}" text-anchor="middle" font-size="10" font-weight="900" fill="#fde047">ROYAL</text>`}
      ${trackDots}
      ${homeSlots}
      ${marbleNodes}
      ${burstSvg}
    `;

    svg.querySelectorAll('[data-jkm]').forEach(el => {
      el.onclick = () => handleMarbleClick(el.dataset.jkm);
    });
  };

  const render = () => {
    const t0 = getTeamScore(0);
    const t1 = getTeamScore(1);
    const curP = players[turnIdx];
    if ($('#jkTeam0', m)) $('#jkTeam0', m).textContent = `🔵 ${mode === '2v2' ? 'Team' : 'You'}: ${t0}/${totalTeamMarbles}`;
    if ($('#jkTeam1', m)) $('#jkTeam1', m).textContent = `${mode === '2v2' ? '🔴 Rivals' : '🟢 ' + oppName}: ${t1}/${totalTeamMarbles}`;
    if ($('#jkTurn', m)) $('#jkTurn', m).textContent = over ? 'Finished' : (turnIdx === 0 ? 'Your Turn' : `${curP.name}…`);

    renderBoardSvg();

    const actBar = $('#jkActionBar', m);
    if (actBar) {
      let controls = '';
      if (!over && turnIdx === 0 && selectedCardId) {
        const card = players[0].hand.find(c => c.id === selectedCardId);
        if (actionSubMode === 'ace_pick') {
          controls = `<div class="jk-sub-row">
            <button type="button" class="btn sm ok" data-jkopt="leave_base">Exit Base</button>
            <button type="button" class="btn sm" data-jkopt="step:1">Move +1</button>
            <button type="button" class="btn sm gold" data-jkopt="step:11">Move +11</button>
            <button type="button" class="btn sm ghost" data-jkopt="burn">Discard</button>
          </div>`;
        } else if (actionSubMode === 'king_pick') {
          controls = `<div class="jk-sub-row">
            <button type="button" class="btn sm ok" data-jkopt="leave_base">Exit Base</button>
            <button type="button" class="btn sm gold" data-jkopt="step:13">Move +13</button>
            <button type="button" class="btn sm ghost" data-jkopt="burn">Discard</button>
          </div>`;
        } else if (actionSubMode === 'seven_pick') {
          controls = `<div class="jk-sub-row">
            <button type="button" class="btn sm gold" data-jkopt="step:7">Move +7</button>
            <button type="button" class="btn sm" data-jkopt="split7">Split 7 (2 Marbles)</button>
            <button type="button" class="btn sm ghost" data-jkopt="burn">Discard</button>
          </div>`;
        } else if (actionSubMode === 'seven_split') {
          controls = `<div class="jk-sub-row">
            ${[1, 2, 3, 4, 5, 6].map(s => `<button type="button" class="btn sm ${splitStepA === s ? 'gold' : 'ghost'}" data-jksplit="${s}">${s}+${7 - s}</button>`).join('')}
          </div>`;
        } else if (actionSubMode === 'ten_pick') {
          controls = `<div class="jk-sub-row">
            <button type="button" class="btn sm" data-jkopt="step:10">Move +10</button>
            <button type="button" class="btn sm red" data-jkopt="burn_enemy">🔥 Burn Rival Card</button>
            <button type="button" class="btn sm ghost" data-jkopt="burn">Discard</button>
          </div>`;
        } else if (card) {
          controls = `<div class="jk-sub-row">
            <button type="button" class="btn sm ghost" data-jkopt="burn">No move? Discard ${card.rank}${card.suit}</button>
          </div>`;
        }
      }
      actBar.innerHTML = `<div class="jk-status-msg">${esc(lastActionText)}</div>${controls}`;

      actBar.querySelectorAll('[data-jkopt]').forEach(btn => {
        btn.onclick = () => {
          const opt = btn.dataset.jkopt;
          if (opt === 'leave_base') {
            actionSubMode = 'leave_base';
            chosenSteps = null;
            lastActionText = 'Tap a glowing blue marble inside your Base to enter Safe Star!';
            render();
          } else if (opt.startsWith('step:')) {
            actionSubMode = 'step';
            chosenSteps = Number(opt.split(':')[1]);
            lastActionText = `Tap a glowing marble to move +${chosenSteps}`;
            render();
          } else if (opt === 'split7') {
            actionSubMode = 'seven_split';
            splitMarbleA = null;
            lastActionText = `Split 7 (${splitStepA}+${7 - splitStepA}): tap your 1st marble`;
            render();
          } else if (opt === 'burn_enemy') {
            const enemy = players.find(o => o.team !== 0 && o.hand.length > 0);
            if (!enemy) return toast('No rival cards left to burn!');
            consumeCard(players[0], selectedCardId);
            const burned = enemy.hand.pop();
            if (burned) discard.push(burned);
            if (typeof playSfx === 'function') playSfx('duelCorrect');
            lastActionText = `🔥 Burned ${enemy.name}'s card with 10!`;
            advanceTurn();
          } else if (opt === 'burn') {
            consumeCard(players[0], selectedCardId);
            lastActionText = 'Discarded card · Passed turn';
            if (typeof playSfx === 'function') playSfx('tap');
            advanceTurn();
          }
        };
      });

      actBar.querySelectorAll('[data-jksplit]').forEach(btn => {
        btn.onclick = () => {
          splitStepA = Number(btn.dataset.jksplit);
          splitMarbleA = null;
          lastActionText = `Split 7 (${splitStepA}+${7 - splitStepA}): tap 1st marble`;
          render();
        };
      });
    }

    const handTray = $('#jkHandTray', m);
    if (handTray) {
      const myHand = players[0].hand;
      handTray.innerHTML = myHand.length
        ? myHand.map(c => `
            <button type="button" class="jk-card ${c.red ? 'red' : 'blk'} ${selectedCardId === c.id ? 'sel' : ''}" data-jkcard="${c.id}" ${over || turnIdx !== 0 ? 'disabled' : ''}>
              <span class="jk-c-top">${c.rank}${c.suit}</span>
              <b class="jk-c-mid">${c.rank}</b>
              <em class="jk-c-tag">${cardTag(c.rank)}</em>
            </button>
          `).join('')
        : `<div class="mp-sys-line">Waiting for next 4-card deal…</div>`;
      handTray.querySelectorAll('[data-jkcard]').forEach(b => {
        b.onclick = () => handleCardSelect(b.dataset.jkcard);
      });
    }
  };

  m.onclose = () => {
    over = true;
    clearTimeout(botTimer);
    if (typeof QuickVoice !== 'undefined') QuickVoice.closePanel();
  };

  render();
}
