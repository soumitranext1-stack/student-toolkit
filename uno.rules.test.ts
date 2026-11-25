import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const code = fs.readFileSync(path.resolve('uno-rules.js'), 'utf8');
const UnoRules = new Function('globalThis', `${code}\nreturn globalThis.UnoRules;`)({});

test('Classic deck has 120 cards and Fun Play doubles to 240 cards', () => {
  const classic = UnoRules.buildDeck('classic', () => 0.42);
  const fun = UnoRules.buildDeck('fun', () => 0.42);
  assert.equal(classic.length, 120);
  assert.equal(fun.length, 240);

  const discardAlls = classic.filter((c: any) => c.value === 'discardAll');
  const wild4s = classic.filter((c: any) => c.value === 'wild4');
  assert.equal(discardAlls.length, 8);
  assert.equal(wild4s.length, 4);
});

test('canPlayCard enforces color/value match and Fun Play +2/+4 stacking', () => {
  const topBlue8 = { id: 't1', color: 'blue', value: '8' };
  const blue5 = { id: 'c1', color: 'blue', value: '5' };
  const red8 = { id: 'c2', color: 'red', value: '8' };
  const green3 = { id: 'c3', color: 'green', value: '3' };
  const wild = { id: 'c4', color: 'wild', value: 'wild' };

  assert.equal(UnoRules.canPlayCard(blue5, topBlue8, 'blue', 0, false), true);
  assert.equal(UnoRules.canPlayCard(red8, topBlue8, 'blue', 0, false), true);
  assert.equal(UnoRules.canPlayCard(green3, topBlue8, 'blue', 0, false), false);
  assert.equal(UnoRules.canPlayCard(wild, topBlue8, 'blue', 0, false), true);

  const topDraw2 = { id: 't2', color: 'yellow', value: 'draw2' };
  const redDraw2 = { id: 'c5', color: 'red', value: 'draw2' };
  const wild4 = { id: 'c6', color: 'wild', value: 'wild4' };

  // Classic cannot stack over pending draw
  assert.equal(UnoRules.canPlayCard(redDraw2, topDraw2, 'yellow', 2, false), false);
  // Fun Play allows stacking +2 on +2 and +4 on +2
  assert.equal(UnoRules.canPlayCard(redDraw2, topDraw2, 'yellow', 2, true), true);
  assert.equal(UnoRules.canPlayCard(wild4, topDraw2, 'yellow', 2, true), true);
  assert.equal(UnoRules.canPlayCard(green3, topDraw2, 'yellow', 2, true), false);
});

test('Discard All Same Color removes all cards of that color in one turn', () => {
  const discardBlue = { id: 'b_all', color: 'blue', value: 'discardAll' };
  const hand = [
    discardBlue,
    { id: 'b1', color: 'blue', value: '4' },
    { id: 'b2', color: 'blue', value: 'skip' },
    { id: 'r1', color: 'red', value: '9' },
    { id: 'w1', color: 'wild', value: 'wild' }
  ];
  const res = UnoRules.applyDiscardAll(hand, discardBlue);
  assert.equal(res.discardedCards.length, 3);
  assert.equal(res.remainingHand.length, 2);
  assert.equal(res.discardedCards[res.discardedCards.length - 1].id, 'b_all');
  assert.ok(res.remainingHand.every((c: any) => c.color !== 'blue'));
});

test('Wild +4 Challenge penalizes bluffer with 4 cards or failed challenger with 6', () => {
  const bluffHand = [
    { id: 'w4', color: 'wild', value: 'wild4' },
    { id: 'g7', color: 'green', value: '7' }
  ];
  const legitHand = [
    { id: 'w4', color: 'wild', value: 'wild4' },
    { id: 'r2', color: 'red', value: '2' }
  ];

  const caught = UnoRules.evaluateWild4Challenge(bluffHand, 'green');
  assert.equal(caught.challengeSucceeded, true);
  assert.equal(caught.offenderDraw, 4);
  assert.equal(caught.challengerDraw, 0);

  const missed = UnoRules.evaluateWild4Challenge(legitHand, 'green');
  assert.equal(missed.challengeSucceeded, false);
  assert.equal(missed.offenderDraw, 0);
  assert.equal(missed.challengerDraw, 6);
});

test('Hand scoring and ranking match WePlay -face / -20 / -50 rules', () => {
  const players = [
    { id: 'p0', name: 'Me', hand: [{ value: '5', color: 'blue' }, { value: 'skip', color: 'red' }] }, // -25
    { id: 'p1', name: 'Minni', hand: [] }, // 0 (Winner)
    { id: 'p2', name: 'Bittu', hand: [{ value: 'wild4', color: 'wild' }] }, // -50
    { id: 'p3', name: 'AyAd', hand: [{ value: '9', color: 'green' }] } // -9
  ];
  const ranked = UnoRules.rankPlayers(players);
  assert.deepEqual(ranked.map((r: any) => r.id), ['p1', 'p3', 'p0', 'p2']);
  assert.equal(ranked[0].score, 0);
  assert.equal(ranked[1].score, -9);
  assert.equal(ranked[2].score, -25);
  assert.equal(ranked[3].score, -50);
});

test('Smart bot prioritizes Discard All combo and selects dominant color for Wild', () => {
  const hand = [
    { id: '1', color: 'blue', value: 'discardAll' },
    { id: '2', color: 'blue', value: '3' },
    { id: '3', color: 'blue', value: '9' },
    { id: '4', color: 'red', value: '5' }
  ];
  const move = UnoRules.chooseBotMove(hand, { id: 't', color: 'blue', value: '1' }, 'blue', 0, false, 5, 'pro');
  assert.equal(move.action, 'play');
  assert.equal(move.card.id, '1');

  const wildHand = [
    { id: 'w', color: 'wild', value: 'wild' },
    { id: 'g1', color: 'green', value: '4' },
    { id: 'g2', color: 'green', value: '8' }
  ];
  const wMove = UnoRules.chooseBotMove(wildHand, { id: 't2', color: 'red', value: '7' }, 'red', 0, false, 4, 'pro');
  assert.equal(wMove.card.id, 'w');
  assert.equal(wMove.chosenColor, 'green');
});

test('UNO Noob Auto-Play plays simple legal card or draws and enforces 15s / 3s AFK / 3-4s Bot delays', () => {
  assert.equal(UnoRules.TURN_CONFIG.TURN_SECONDS, 15);
  assert.equal(UnoRules.getTurnActionDelayMs(false, false), 15000);
  assert.equal(UnoRules.getTurnActionDelayMs(false, true), 3000);
  assert.equal(UnoRules.getTurnActionDelayMs(true, false, () => 0), 3000);
  assert.equal(UnoRules.getTurnActionDelayMs(true, false, () => 0.999), 3999);

  const hand = [
    { id: 'w1', color: 'wild', value: 'wild', kind: 'special' },
    { id: 'b4', color: 'blue', value: '4', kind: 'number' }
  ];
  const mPlay = UnoRules.chooseNoobMove(hand, { id: 't', color: 'blue', value: '9' }, 'blue', 0, false);
  assert.equal(mPlay.action, 'play');
  assert.equal(mPlay.card.id, 'b4');

  const mDraw = UnoRules.chooseNoobMove(
    [{ id: 'r2', color: 'red', value: '2', kind: 'number' }],
    { id: 't', color: 'blue', value: '9' },
    'blue',
    0,
    false
  );
  assert.equal(mDraw.action, 'draw');
});

