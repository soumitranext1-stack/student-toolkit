"use strict";
/* =====================================================================
   UNO / OH MY CARD — PURE DECOUPLED RULES ENGINE (v19)
   Supports: Classic (4P), Fun Play (2 Decks + Stacking), 1v1 Duel
   Zero DOM dependencies so unit tests run directly via node:test.
   ===================================================================== */

(function (root) {
  const COLORS = ['red', 'blue', 'yellow', 'green'];
  const FUNCTION_TYPES = ['skip', 'draw2', 'reverse', 'discardAll'];
  const SPECIAL_TYPES = ['wild', 'wild4'];

  function shuffle(arr, rng) {
    const r = typeof rng === 'function' ? rng : Math.random;
    const out = arr.slice();
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(r() * (i + 1));
      const tmp = out[i];
      out[i] = out[j];
      out[j] = tmp;
    }
    return out;
  }

  function buildDeck(mode, rng) {
    const deckCount = mode === 'fun' ? 2 : 1;
    const cards = [];
    let seq = 1;
    for (let d = 0; d < deckCount; d++) {
      for (const color of COLORS) {
        // 0-9: 2 copies per color per deck (matching WePlay Card Type rules)
        for (let n = 0; n <= 9; n++) {
          cards.push({ id: `u${seq++}`, color, value: String(n), kind: 'number' });
          cards.push({ id: `u${seq++}`, color, value: String(n), kind: 'number' });
        }
        // 4 Function cards: Skip, Draw 2, Reverse, Discard All Same Color (2 per color)
        for (const fn of FUNCTION_TYPES) {
          cards.push({ id: `u${seq++}`, color, value: fn, kind: 'function' });
          cards.push({ id: `u${seq++}`, color, value: fn, kind: 'function' });
        }
      }
      // Special cards: 4 Wild + 4 Wild +4 per deck
      for (let i = 0; i < 4; i++) {
        cards.push({ id: `u${seq++}`, color: 'wild', value: 'wild', kind: 'special' });
        cards.push({ id: `u${seq++}`, color: 'wild', value: 'wild4', kind: 'special' });
      }
    }
    return shuffle(cards, rng);
  }

  function scoreCard(card) {
    if (!card) return 0;
    if (card.value === 'wild' || card.value === 'wild4') return 50;
    if (FUNCTION_TYPES.includes(card.value)) return 20;
    const n = Number(card.value);
    return Number.isFinite(n) ? n : 0;
  }

  function scoreHand(hand) {
    if (!Array.isArray(hand) || !hand.length) return 0;
    let total = 0;
    for (const c of hand) total += scoreCard(c);
    return total;
  }

  function canPlayCard(card, topCard, activeColor, pendingDraw, funStacking) {
    if (!card || !topCard) return false;
    const drawAmt = Number(pendingDraw) || 0;
    if (drawAmt > 0) {
      if (!funStacking) return false;
      if (card.value === 'wild4') return true;
      if (topCard.value === 'draw2' && card.value === 'draw2') return true;
      return false;
    }
    if (card.color === 'wild' || card.value === 'wild' || card.value === 'wild4') return true;
    if (card.color === activeColor) return true;
    if (card.value === topCard.value) return true;
    return false;
  }

  function getPlayableCards(hand, topCard, activeColor, pendingDraw, funStacking) {
    if (!Array.isArray(hand)) return [];
    return hand.filter(c => canPlayCard(c, topCard, activeColor, pendingDraw, funStacking));
  }

  function applyDiscardAll(hand, playedCard) {
    if (!Array.isArray(hand) || !playedCard) {
      return { remainingHand: Array.isArray(hand) ? hand.slice() : [], discardedCards: [] };
    }
    const targetColor = playedCard.color;
    const discardedCards = [];
    const remainingHand = [];
    for (const c of hand) {
      if (c.id === playedCard.id || (targetColor !== 'wild' && c.color === targetColor)) {
        discardedCards.push(c);
      } else {
        remainingHand.push(c);
      }
    }
    // Keep the played discardAll card last so it sits on top of the discard pile
    discardedCards.sort((a, b) => (a.id === playedCard.id ? 1 : b.id === playedCard.id ? -1 : 0));
    return { remainingHand, discardedCards };
  }

  function evaluateWild4Challenge(prevHandBeforePlay, prevActiveColor) {
    const hand = Array.isArray(prevHandBeforePlay) ? prevHandBeforePlay : [];
    const hadMatchingColor = hand.some(c => c && c.color !== 'wild' && c.color === prevActiveColor);
    if (hadMatchingColor) {
      return {
        bluffed: true,
        challengeSucceeded: true,
        offenderDraw: 4,
        challengerDraw: 0
      };
    }
    return {
      bluffed: false,
      challengeSucceeded: false,
      offenderDraw: 0,
      challengerDraw: 6
    };
  }

  function getNextSeat(currentIdx, playerCount, direction, steps) {
    const n = Math.max(1, Number(playerCount) || 4);
    const dir = direction === -1 ? -1 : 1;
    const s = steps == null ? 1 : Number(steps);
    return (((currentIdx + dir * s) % n) + n) % n;
  }

  function rankPlayers(players) {
    const list = (Array.isArray(players) ? players : []).map((p, idx) => {
      const penalty = scoreHand(p.hand || []);
      return {
        idx,
        id: p.id || String(idx),
        name: p.name || `Player ${idx + 1}`,
        cardCount: (p.hand || []).length,
        penalty,
        score: penalty === 0 ? 0 : -penalty
      };
    });
    list.sort((a, b) => {
      if (a.cardCount === 0 && b.cardCount !== 0) return -1;
      if (b.cardCount === 0 && a.cardCount !== 0) return 1;
      if (a.penalty !== b.penalty) return a.penalty - b.penalty;
      return a.cardCount - b.cardCount;
    });
    return list;
  }

  function pickDominantColor(hand, fallback) {
    const counts = { red: 0, blue: 0, yellow: 0, green: 0 };
    for (const c of (hand || [])) {
      if (counts[c.color] !== undefined) counts[c.color]++;
    }
    let best = fallback && counts[fallback] !== undefined ? fallback : 'blue';
    let max = -1;
    for (const col of COLORS) {
      if (counts[col] > max) {
        max = counts[col];
        best = col;
      }
    }
    return best;
  }

  function chooseBotMove(hand, topCard, activeColor, pendingDraw, funStacking, nextCardCount, botTier) {
    const playable = getPlayableCards(hand, topCard, activeColor, pendingDraw, funStacking);
    if (!playable.length) return { action: 'draw', card: null, chosenColor: activeColor };

    const isPro = botTier === 'pro';
    const danger = (Number(nextCardCount) || 7) <= 2;

    const scored = playable.map(card => {
      let score = 10;
      if (card.value === 'discardAll') {
        const sameCount = hand.filter(c => c.color === card.color).length;
        score += 35 + sameCount * 14;
      } else if (card.value === 'draw2') {
        score += danger ? 55 : (isPro ? 28 : 22);
      } else if (card.value === 'skip' || card.value === 'reverse') {
        score += danger ? 44 : 20;
      } else if (card.value === 'wild4') {
        const hasNormalMatch = playable.some(c => c.color !== 'wild');
        score += danger ? 58 : (hasNormalMatch && isPro ? -10 : 8);
      } else if (card.value === 'wild') {
        const hasNormalMatch = playable.some(c => c.color !== 'wild');
        score += hasNormalMatch ? -6 : 12;
      } else {
        // Prefer high-value number cards first to shed penalty points
        score += 12 + (Number(card.value) || 0) * 1.4;
      }
      // Slightly prefer keeping dominant color active
      if (card.color !== 'wild') {
        const colCount = hand.filter(c => c.color === card.color).length;
        score += colCount * 1.5;
      }
      return { card, score };
    });

    scored.sort((a, b) => b.score - a.score);
    const chosen = scored[0].card;
    const remaining = hand.filter(c => c.id !== chosen.id);
    const chosenColor = chosen.color === 'wild'
      ? pickDominantColor(remaining, activeColor)
      : chosen.color;

    return { action: 'play', card: chosen, chosenColor };
  }

  /**
   * Simple Noob Auto-Play selector used when a human player's 15s timer expires
   * or after 3s while AFK Auto-Play mode is active.
   */
  function chooseNoobMove(hand, topCard, activeColor, pendingDraw, funStacking) {
    const playable = getPlayableCards(hand, topCard, activeColor, pendingDraw, funStacking);
    if (!playable.length) return { action: 'draw', card: null, chosenColor: activeColor };
    // Noob bot plays a simple number card first, otherwise the first playable card
    const chosen = playable.find(c => c.kind === 'number') || playable[0];
    const remaining = (hand || []).filter(c => c.id !== chosen.id);
    const chosenColor = chosen.color === 'wild'
      ? pickDominantColor(remaining, activeColor)
      : chosen.color;
    return { action: 'play', card: chosen, chosenColor };
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

  const UnoRules = {
    COLORS,
    FUNCTION_TYPES,
    SPECIAL_TYPES,
    TURN_CONFIG,
    buildDeck,
    scoreCard,
    scoreHand,
    canPlayCard,
    getPlayableCards,
    applyDiscardAll,
    evaluateWild4Challenge,
    getNextSeat,
    rankPlayers,
    pickDominantColor,
    chooseBotMove,
    chooseNoobMove,
    getTurnActionDelayMs
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = UnoRules;
  }
  root.UnoRules = UnoRules;
})(typeof globalThis !== 'undefined' ? globalThis : window);
