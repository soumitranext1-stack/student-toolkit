import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const code = fs.readFileSync(path.resolve('jackaroo-rules.js'), 'utf8');
const JackarooRules = new Function('globalThis', `${code}\nreturn globalThis.JackarooRules;`)({});

function make1v1State(marbles: any[], hand0: any[] = [], hand2: any[] = []) {
  const cfg = JackarooRules.getBoardConfig('1v1');
  return {
    mode: '1v1',
    cfg,
    players: [
      { seat: 0, team: 0, startPos: cfg.startPositions[0], hand: hand0 },
      { seat: 2, team: 1, startPos: cfg.startPositions[2], hand: hand2 }
    ],
    marbles
  };
}

test('card roles match reference rules for A, 2, 4, 5, 7, 10, J, Q, K', () => {
  assert.equal(JackarooRules.getCardRole({ rank: 'A', suit: '♣' }).canExitBase, true);
  assert.equal(JackarooRules.getCardRole({ rank: '2', suit: '♠' }).canExitBase, true);
  assert.equal(JackarooRules.getCardRole({ rank: '4', suit: '♦' }).steps[0], -4);
  assert.equal(JackarooRules.getCardRole({ rank: '5', suit: '♣' }).anyMarble, true);
  assert.equal(JackarooRules.getCardRole({ rank: '7', suit: '♥' }).canSplit, true);
  assert.equal(JackarooRules.getCardRole({ rank: '10', suit: '♠' }).canDiscardNext, true);
  assert.equal(JackarooRules.getCardRole({ rank: 'J', suit: '♣' }).canSwap, true);
  assert.equal(JackarooRules.getCardRole({ rank: 'J', suit: '♦' }).steps[0], 11);
  assert.equal(JackarooRules.getCardRole({ rank: 'Q', suit: '♠' }).steps[0], 12);
  assert.equal(JackarooRules.getCardRole({ rank: 'Q', suit: '♥' }).canDiscardNext, true);
  assert.equal(JackarooRules.getCardRole({ rank: 'K', suit: '♣' }).sweepCapture, true);
});

test('1v1 board has 52 spots with exact homeEntrySteps=50 and step-by-step path', () => {
  const cfg = JackarooRules.getBoardConfig('1v1');
  assert.equal(cfg.trackLen, 52);
  assert.equal(cfg.homeEntrySteps, 50);

  const m0 = { id: 'm0', owner: 0, zone: 'track', pos: 49, homeIdx: -1, stepsFromStart: 49 };
  const state = make1v1State([m0]);
  const res = JackarooRules.computeMove(m0, 3, state);
  assert.equal(res.valid, true);
  assert.equal(res.zone, 'home');
  assert.equal(res.homeIdx, 1);
  // Path goes track 50 -> home 0 -> home 1 (3 hops!)
  assert.equal(res.path.length, 3);
  assert.equal(res.path[0].pos, 50);
  assert.equal(res.path[1].zone, 'home');
  assert.equal(res.path[1].homeIdx, 0);
  assert.equal(res.path[2].homeIdx, 1);
});

test('cannot cross same-color stone within forward range', () => {
  const m0 = { id: 'm0', owner: 0, zone: 'track', pos: 4, homeIdx: -1, stepsFromStart: 4 };
  const m1 = { id: 'm1', owner: 0, zone: 'track', pos: 7, homeIdx: -1, stepsFromStart: 7 };
  const state = make1v1State([m0, m1]);

  const blocked = JackarooRules.computeMove(m0, 5, state);
  assert.equal(blocked.valid, false);
  assert.equal(blocked.reason, 'same-color-block');

  const ok = JackarooRules.computeMove(m0, 2, state);
  assert.equal(ok.valid, true);
  assert.equal(ok.pos, 6);
  assert.equal(ok.path.length, 2);
});

test('cannot move past rival stone sitting at its starting safe spot', () => {
  const m0 = { id: 'm0', owner: 0, zone: 'track', pos: 24, homeIdx: -1, stepsFromStart: 24 };
  const oppSafe = { id: 'm2', owner: 2, zone: 'track', pos: 26, homeIdx: -1, stepsFromStart: 0 };
  const state = make1v1State([m0, oppSafe]);

  const res = JackarooRules.computeMove(m0, 4, state);
  assert.equal(res.valid, false);
  assert.equal(res.reason, 'start-spot-block');
});

test('cannot enter home if a stone blocks the step right before home', () => {
  const m0 = { id: 'm0', owner: 0, zone: 'track', pos: 48, homeIdx: -1, stepsFromStart: 48 };
  const blocker = { id: 'm2', owner: 2, zone: 'track', pos: 50, homeIdx: -1, stepsFromStart: 24 };
  const state = make1v1State([m0, blocker]);

  const res = JackarooRules.computeMove(m0, 4, state);
  assert.equal(res.valid, false);
  assert.equal(res.reason, 'pre-home-block');
});

test('King +13 sweep captures ALL passed non-safe rival stones', () => {
  const m0 = { id: 'm0', owner: 0, zone: 'track', pos: 2, homeIdx: -1, stepsFromStart: 2 };
  const oppA = { id: 'o1', owner: 2, zone: 'track', pos: 6, homeIdx: -1, stepsFromStart: 32 };
  const oppB = { id: 'o2', owner: 2, zone: 'track', pos: 11, homeIdx: -1, stepsFromStart: 37 };
  const state = make1v1State([m0, oppA, oppB]);

  const res = JackarooRules.computeMove(m0, 13, state, { sweepCapture: true });
  assert.equal(res.valid, true);
  assert.equal(res.pos, 15);
  assert.deepEqual(res.passedCaptures, ['o1', 'o2']);
  assert.equal(res.path.length, 13);
});

test('1v1 neck teleport jumps forward ONLY (17->31 for seat 0, 43->5 for seat 2)', () => {
  // Seat 0 lands on 17 -> jumps forward to 31!
  const m0 = { id: 'm0', owner: 0, zone: 'track', pos: 12, homeIdx: -1, stepsFromStart: 12 };
  const st0 = make1v1State([m0]);
  const r0 = JackarooRules.computeMove(m0, 5, st0);
  assert.equal(r0.valid, true);
  assert.equal(r0.teleported, true);
  assert.equal(r0.teleportFrom, 17);
  assert.equal(r0.pos, 31);
  assert.equal(r0.stepsFromStart, 31);
  assert.equal(r0.path[r0.path.length - 1].isTeleport, true);

  // Seat 0 landing on 43 must NOT teleport backwards to 5!
  const m0Late = { id: 'm0', owner: 0, zone: 'track', pos: 40, homeIdx: -1, stepsFromStart: 40 };
  const stLate = make1v1State([m0Late]);
  const rLate = JackarooRules.computeMove(m0Late, 3, stLate);
  assert.equal(rLate.valid, true);
  assert.equal(rLate.teleported, false);
  assert.equal(rLate.pos, 43);

  // Seat 2 lands on 43 (stepsFromStart=17) -> jumps forward to 5 (stepsFromStart=31)!
  const m2 = { id: 'm2', owner: 2, zone: 'track', pos: 38, homeIdx: -1, stepsFromStart: 12 };
  const st2 = make1v1State([m2]);
  const r2 = JackarooRules.computeMove(m2, 5, st2);
  assert.equal(r2.valid, true);
  assert.equal(r2.teleported, true);
  assert.equal(r2.pos, 5);
  assert.equal(r2.stepsFromStart, 31);
});

test('Smart 1-tap auto-action & card playability: all in base auto-opens, 1 stone out auto-moves +12, unplayable fades', () => {
  // Scenario A: All 4 marbles in base -> Card 8 is unplayable (faded), Card K auto-exits base in 1 tap!
  const allBase = [
    { id: 'b0', owner: 0, zone: 'base', pos: -1, homeIdx: -1, stepsFromStart: 0 },
    { id: 'b1', owner: 0, zone: 'base', pos: -1, homeIdx: -1, stepsFromStart: 0 },
    { id: 'b2', owner: 0, zone: 'base', pos: -1, homeIdx: -1, stepsFromStart: 0 },
    { id: 'b3', owner: 0, zone: 'base', pos: -1, homeIdx: -1, stepsFromStart: 0 }
  ];
  const stBase = make1v1State(allBase);
  const act8 = JackarooRules.getLegalActionsForCard({ rank: '8', suit: '♠' }, 0, stBase);
  assert.equal(act8.playable, false);

  const actK = JackarooRules.getLegalActionsForCard({ rank: 'K', suit: '♣' }, 0, stBase);
  assert.equal(actK.playable, true);
  assert.equal(actK.autoAction?.type, 'exit_base');
  assert.equal(actK.autoAction?.marbleId, 'b0');

  // Scenario B: Exactly 1 marble outside base -> Black Q (+12) auto-moves it in 1 tap!
  const oneOut = [
    { id: 'b0', owner: 0, zone: 'track', pos: 0, homeIdx: -1, stepsFromStart: 0 },
    { id: 'b1', owner: 0, zone: 'base', pos: -1, homeIdx: -1, stepsFromStart: 0 }
  ];
  const stOne = make1v1State(oneOut);
  const actQ12 = JackarooRules.getLegalActionsForCard({ rank: 'Q', suit: '♣' }, 0, stOne);
  assert.equal(actQ12.playable, true);
  assert.equal(actQ12.autoAction?.type, 'move');
  assert.equal(actQ12.autoAction?.marbleId, 'b0');
  assert.equal(actQ12.autoAction?.steps, 12);
  assert.equal(actQ12.autoAction?.dest.pos, 12);
});

test('2v2 board has 72 spots, ZERO teleport spots, and authentic -4 wrap behind home entry', () => {
  const cfg = JackarooRules.getBoardConfig('2v2');
  assert.equal(cfg.trackLen, 72);
  assert.equal(cfg.homeEntrySteps, 70);
  assert.deepEqual(cfg.startPositions, { 0: 0, 1: 18, 2: 36, 3: 54 });
  assert.equal(Object.keys(cfg.teleportMap).length, 0);

  const m0 = { id: 'm0', owner: 0, zone: 'track', pos: 0, homeIdx: -1, stepsFromStart: 0 };
  const state2v2 = {
    mode: '2v2',
    cfg,
    players: [
      { seat: 0, team: 0, startPos: 0, hand: [] },
      { seat: 1, team: 1, startPos: 18, hand: [] },
      { seat: 2, team: 0, startPos: 36, hand: [] },
      { seat: 3, team: 1, startPos: 54, hand: [] }
    ],
    marbles: [m0]
  };
  // Moving -4 from Start (0) wraps cleanly to spot 68 (2 steps before Home Entry 70!)
  const back4 = JackarooRules.computeMove(m0, -4, state2v2);
  assert.equal(back4.valid, true);
  assert.equal(back4.pos, 68);
  assert.equal(back4.stepsFromStart, 68);
  assert.equal(back4.teleported, false);
});

test('Safe-Start stone is 100% immune to Black Jack Swap, crossing/King sweep/-4, AND rival Card 5', () => {
  // Seat 0 stone is standing on its own opening/start spot (pos 0)
  const mySafe = { id: 'm0', owner: 0, zone: 'track', pos: 0, homeIdx: -1, stepsFromStart: 0 };
  const rivalA = { id: 'o1', owner: 2, zone: 'track', pos: 50, homeIdx: -1, stepsFromStart: 24 };
  const rivalB = { id: 'o2', owner: 2, zone: 'track', pos: 2, homeIdx: -1, stepsFromStart: 28 };
  const state = make1v1State([mySafe, rivalA, rivalB]);

  // 1. Rival CANNOT cross or capture mySafe with normal forward move OR King +13 sweep
  const fwdCross = JackarooRules.computeMove(rivalA, 5, state);
  assert.equal(fwdCross.valid, false);
  assert.equal(fwdCross.reason, 'start-spot-block');

  const kingSweep = JackarooRules.computeMove(rivalA, 13, state, { sweepCapture: true });
  assert.equal(kingSweep.valid, false);
  assert.equal(kingSweep.reason, 'start-spot-block');

  // 2. Rival CANNOT cross or capture mySafe moving -4 backward
  const backCross = JackarooRules.computeMove(rivalB, -4, state);
  assert.equal(backCross.valid, false);
  assert.equal(backCross.reason, 'start-spot-block');

  // 3. Rival CANNOT swap mySafe with Black Jack (J♠/J♣)
  const rivalJack = JackarooRules.getLegalActionsForCard({ rank: 'J', suit: '♠' }, 2, state);
  assert.equal(rivalJack.swapPairs.length, 0);
  assert.equal(rivalJack.playable, false);

  // 4. Player on safe start also cannot swap their own safe-start stone
  const myJack = JackarooRules.getLegalActionsForCard({ rank: 'J', suit: '♣' }, 0, state);
  assert.equal(myJack.swapPairs.length, 0);

  // 5. Rival CANNOT push mySafe forward with Card 5!
  assert.equal(JackarooRules.canCard5MoveMarble(mySafe, 2, state.players), false);
  const rivalFive = JackarooRules.getLegalActionsForCard({ rank: '5', suit: '♥' }, 2, state);
  assert.ok(rivalFive.allMoves.every((mv: any) => mv.marbleId !== 'm0'));

  // 6. Owner CAN still move their own stone off their own start spot with Card 5!
  assert.equal(JackarooRules.canCard5MoveMarble(mySafe, 0, state.players), true);
  const myFive = JackarooRules.getLegalActionsForCard({ rank: '5', suit: '♥' }, 0, state);
  assert.ok(myFive.allMoves.some((mv: any) => mv.marbleId === 'm0' && mv.dest.pos === 5));
});

test('Noob Auto-Play and 15s / 3s AFK / 3-4s Bot turn timing work deterministically', () => {
  assert.equal(JackarooRules.TURN_CONFIG.TURN_SECONDS, 15);
  assert.equal(JackarooRules.getTurnActionDelayMs(false, false), 15000);
  assert.equal(JackarooRules.getTurnActionDelayMs(false, true), 3000);
  assert.equal(JackarooRules.getTurnActionDelayMs(true, false, () => 0), 3000);
  assert.equal(JackarooRules.getTurnActionDelayMs(true, false, () => 0.999), 3999);

  const allBase = [
    { id: 'b0', owner: 0, zone: 'base', pos: -1, homeIdx: -1, stepsFromStart: 0 },
    { id: 'b1', owner: 0, zone: 'base', pos: -1, homeIdx: -1, stepsFromStart: 0 }
  ];
  const st = make1v1State(allBase, [
    { id: 'c1', rank: '6', suit: '♠' },
    { id: 'c2', rank: 'A', suit: '♥' }
  ]);
  const noobAct = JackarooRules.pickNoobAction(0, st);
  assert.equal(noobAct.type, 'exit_base');
  assert.equal(noobAct.card.id, 'c2');
});

test('2v2 deck removes Card 13 (all K) and Only-Discard (Red Q), while 1v1 keeps full 52 cards', () => {
  const deck1v1 = JackarooRules.buildDeckForMode('1v1');
  assert.equal(deck1v1.length, 52);
  assert.equal(deck1v1.filter((c: any) => c.rank === 'K').length, 4);
  assert.equal(deck1v1.filter((c: any) => c.rank === 'Q' && c.red).length, 2);

  const deck2v2 = JackarooRules.buildDeckForMode('2v2');
  assert.equal(deck2v2.length, 46);
  assert.equal(deck2v2.filter((c: any) => c.rank === 'K').length, 0);
  assert.equal(deck2v2.filter((c: any) => c.rank === 'Q' && c.red).length, 0);
  // Black Q (+12), 10 (+10 / Burn), A & 2 (Open) remain in 2v2!
  assert.equal(deck2v2.filter((c: any) => c.rank === 'Q' && !c.red).length, 2);
  assert.equal(deck2v2.filter((c: any) => c.rank === '10').length, 4);
  assert.equal(deck2v2.filter((c: any) => c.rank === 'A' || c.rank === '2').length, 8);
});

test('Card 10 does direct discard while Red Q opens Hidden-Card Picker in 1v1, and Bonus Turn triggers on Capture / Win Box / Discard', () => {
  const role10 = JackarooRules.getCardRole({ rank: '10', suit: '♠' }, '1v1');
  assert.equal(role10.canDiscardNext, true);
  assert.equal(role10.pickHiddenDiscard, false);

  const roleRedQ = JackarooRules.getCardRole({ rank: 'Q', suit: '♥', red: true }, '1v1');
  assert.equal(roleRedQ.canDiscardNext, true);
  assert.equal(roleRedQ.pickHiddenDiscard, true);

  // Red Q autoAction opens interactive hidden-card picker when opponent has cards
  const st = make1v1State(
    [{ id: 'b0', owner: 0, zone: 'base', pos: -1, homeIdx: -1, stepsFromStart: 0 }],
    [{ id: 'qh', rank: 'Q', suit: '♥', red: true }],
    [{ id: 'e1', rank: '8', suit: '♠' }, { id: 'e2', rank: 'K', suit: '♣' }]
  );
  const redQAct = JackarooRules.getLegalActionsForCard({ id: 'qh', rank: 'Q', suit: '♥', red: true }, 0, st);
  assert.equal(redQAct.playable, true);
  assert.equal(redQAct.autoAction?.type, 'pick_hidden_enemy');
  assert.equal(redQAct.autoAction?.targetSeat, 2);

  // Card 10 with no stones out auto-does direct discard (NOT hidden picker)
  const tenAct = JackarooRules.getLegalActionsForCard({ id: 't10', rank: '10', suit: '♣' }, 0, st);
  assert.equal(tenAct.playable, true);
  assert.equal(tenAct.autoAction?.type, 'discard_enemy');

  // Bonus Turn & Combo Draw rules
  assert.equal(JackarooRules.shouldGrantExtraTurn({ capturedCount: 1, enteredHome: false, discardedEnemy: false }), true);
  assert.equal(JackarooRules.shouldGrantExtraTurn({ capturedCount: 0, enteredHome: true, discardedEnemy: false }), true);
  assert.equal(JackarooRules.shouldGrantExtraTurn({ capturedCount: 0, enteredHome: false, discardedEnemy: true }), true);
  assert.equal(JackarooRules.shouldGrantExtraTurn({ capturedCount: 0, enteredHome: false, discardedEnemy: false }), false);

  assert.equal(JackarooRules.shouldGrantComboDraw({ capturedCount: 1, enteredHome: false }), true);
  assert.equal(JackarooRules.shouldGrantComboDraw({ capturedCount: 0, enteredHome: true }), true);
  assert.equal(JackarooRules.shouldGrantComboDraw({ capturedCount: 0, enteredHome: false }), false);
});

test('2v2 Teammate Assist: once all 4 own stones reach Home, player controls partner stones automatically', () => {
  const cfg = JackarooRules.getBoardConfig('2v2');
  const marbles = [
    { id: 'm0_0', owner: 0, zone: 'home', pos: -1, homeIdx: 0, stepsFromStart: 71 },
    { id: 'm0_1', owner: 0, zone: 'home', pos: -1, homeIdx: 1, stepsFromStart: 72 },
    { id: 'm0_2', owner: 0, zone: 'home', pos: -1, homeIdx: 2, stepsFromStart: 73 },
    { id: 'm0_3', owner: 0, zone: 'home', pos: -1, homeIdx: 3, stepsFromStart: 74 },
    { id: 'm2_0', owner: 2, zone: 'track', pos: 40, homeIdx: -1, stepsFromStart: 4 }
  ];
  const state2v2 = {
    mode: '2v2',
    cfg,
    players: [
      { seat: 0, team: 0, startPos: 0, hand: [] },
      { seat: 1, team: 1, startPos: 18, hand: [] },
      { seat: 2, team: 0, startPos: 36, hand: [] },
      { seat: 3, team: 1, startPos: 54, hand: [] }
    ],
    marbles
  };
  assert.equal(JackarooRules.getControlSeat(0, state2v2), 2);
  const legal = JackarooRules.getLegalActionsForCard({ rank: '6', suit: '♠' }, 0, state2v2);
  assert.equal(legal.playable, true);
  assert.equal(legal.controlSeat, 2);
  assert.equal(legal.autoAction?.type, 'move');
  assert.equal(legal.autoAction?.marbleId, 'm2_0');
  assert.equal(legal.autoAction?.dest.pos, 46);
});



