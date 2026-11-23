"use strict";
/* =====================================================================
   UNO CARD CLASH — 2-4 PLAYERS / 1v1 HIGH-GRAPHIC 3D CARD GAME (v12)
   Full Classic Rules: 0-9, +2, +4 Wild, Reverse, Skip, Wild Color Picker,
   Glowing UNO! Call Button with +2 Missed-UNO Penalty, Smart AI,
   Glossy 3D Fanned Cards & Free Fire-Style Quick Voice Chat.
   ===================================================================== */

function launchUnoGame(stake, rival, modeRaw) {
  const mode = modeRaw === '1v1' ? '1v1' : '4p';
  const COLORS = ['red', 'yellow', 'green', 'blue'];
  const COLOR_META = {
    red: { label: 'Red', hex: '#ef4444', dark: '#991b1b', glow: 'rgba(239,68,68,.55)' },
    yellow: { label: 'Yellow', hex: '#eab308', dark: '#a16207', glow: 'rgba(234,179,8,.55)' },
    green: { label: 'Green', hex: '#22c55e', dark: '#166534', glow: 'rgba(34,197,94,.55)' },
    blue: { label: 'Blue', hex: '#3b82f6', dark: '#1d4ed8', glow: 'rgba(59,130,246,.55)' },
    wild: { label: 'Wild', hex: '#1e1b4b', dark: '#09090b', glow: 'rgba(168,85,247,.6)' }
  };

  const pay = calcArenaStakePayout(stake);
  const oppName = rival?.name || 'UNO Pro Bot';

  const shuffle = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  let seq = 0;
  const buildDeck = () => {
    const d = [];
    for (const color of COLORS) {
      d.push({ id: `u_${color}_0_${seq++}`, color, value: '0' });
      ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'skip', 'reverse', 'draw2'].forEach(v => {
        d.push({ id: `u_${color}_${v}_${seq++}`, color, value: v });
        d.push({ id: `u_${color}_${v}_${seq++}`, color, value: v });
      });
    }
    for (let i = 0; i < 4; i++) {
      d.push({ id: `u_w_${seq++}`, color: 'wild', value: 'wild' });
      d.push({ id: `u_w4_${seq++}`, color: 'wild', value: 'wild4' });
    }
    return shuffle(d);
  };

  let deck = buildDeck();
  const names = mode === '1v1' ? [me?.name || 'You', oppName] : [me?.name || 'You', 'Aria Bot', 'Leo Bot', 'Zara Bot'];
  const avatars = [me?.avatar || 'av_b1', 'av_g1', 'av_b3', 'av_g3'];
  const players = names.map((name, i) => ({
    id: i === 0 ? 'me' : `bot_${i}`,
    name,
    avatar: avatars[i],
    isBot: i !== 0,
    hand: deck.splice(0, 7),
    calledUno: false
  }));

  let startIdx = deck.findIndex(c => c.color !== 'wild' && /^\d$/.test(c.value));
  if (startIdx < 0) startIdx = 0;
  const discard = [deck.splice(startIdx, 1)[0]];
  let activeColor = discard[0].color;
  let currentTurn = 0;
  let direction = 1;
  let over = false;
  let pendingWildCardId = null;
  let vulnerableSeat = null; // seat at 1 card who forgot to shout UNO!
  let statusLine = 'Match color, number, or play a Wild card!';
  let botTimer = 0;

  const topCard = () => discard[discard.length - 1];
  const canPlay = (c) => c.color === 'wild' || c.color === activeColor || c.value === topCard().value;
  const nextSeat = (cur, steps = 1) => ((cur + direction * steps) % players.length + players.length) % players.length;

  const drawFromDeck = (count) => {
    const out = [];
    for (let i = 0; i < count; i++) {
      if (!deck.length && discard.length > 1) {
        const top = discard.pop();
        deck = shuffle(discard);
        discard.length = 0;
        discard.push(top);
      }
      if (deck.length) out.push(deck.pop());
    }
    return out;
  };

  const cardGlyph = (v) => {
    if (v === 'skip') return '⊘';
    if (v === 'reverse') return '⇄';
    if (v === 'draw2') return '+2';
    if (v === 'wild') return '✦';
    if (v === 'wild4') return '+4';
    return v;
  };

  const cardLabel = (c) => {
    const g = cardGlyph(c.value);
    return c.color === 'wild' ? (c.value === 'wild4' ? 'Wild +4' : 'Wild') : `${COLOR_META[c.color].label} ${g}`;
  };

  const m = modal(`UNO Clash · ${mode === '1v1' ? '1v1' : '4-Player'}${stake > 0 ? ` · ${stake} 🪙` : ''}`, `
    <div class="uno-shell" id="unoShell" data-testid="uno-stage">
      <div class="arena-hud-bar uno-hud">
        <span class="hud-pill me" id="unoMyCnt">You: 7 cards</span>
        <span class="hud-pill turn" id="unoTurnPill">Your Turn</span>
        <span class="hud-pill bot" id="unoDirPill">↻ Clockwise</span>
      </div>
      ${stake > 0 ? `<div class="arena-pot-ribbon">Pot ${fmtNum(pay.grossPot)} 🪙 · Win +${fmtNum(pay.winnerPayout)} 🪙 (${pay.feePercent}% fee)</div>` : ''}

      <div class="uno-table" id="unoTable">
        <div class="uno-opponents" id="unoOpps"></div>

        <div class="uno-center-zone">
          <button type="button" class="uno-pile-draw" id="unoDrawBtn" aria-label="Draw Card from Deck">
            <span class="uno-back-oval">UNO</span>
            <small id="unoDeckCnt">Draw</small>
          </button>

          <div class="uno-discard-wrap" id="unoDiscardWrap"></div>

          <div class="uno-side-controls">
            <div class="uno-color-orb" id="unoColorOrb" title="Active Color"></div>
            <button type="button" class="uno-shout-btn" id="unoShoutBtn" aria-label="Call UNO!">UNO!</button>
            <button type="button" class="uno-catch-btn" id="unoCatchBtn" hidden>Catch +2!</button>
          </div>
        </div>

        <div class="uno-status-banner" id="unoStatus">${esc(statusLine)}</div>
        <div class="uno-color-picker" id="unoColorPicker" hidden>
          <b>Choose Wild Color</b>
          <div class="uno-cp-orbs">
            ${COLORS.map(col => `<button type="button" class="uno-cp-btn c-${col}" data-unocol="${col}" aria-label="Pick ${col}">${COLOR_META[col].label}</button>`).join('')}
          </div>
        </div>
      </div>

      <div class="uno-hand-scroll" id="unoMyHand" aria-label="Your UNO Hand"></div>
      ${typeof QuickVoice !== 'undefined' ? QuickVoice.renderGameVoiceBar('uno') : ''}
      <div id="unoFoot"></div>
    </div>
  `, 'uno-modal');

  if (typeof QuickVoice !== 'undefined') {
    QuickVoice.bindGameVoiceBar(m, 'uno', 'uno', '#unoTable');
  }

  const finishMatch = (winnerIdx) => {
    over = true;
    clearTimeout(botTimer);
    const won = winnerIdx === 0;
    const res = settleArenaMatchOutcome(won ? 'win' : 'lose', stake, 52, 36, 14);
    const foot = $('#unoFoot', m);
    if (foot) {
      foot.innerHTML = `<div class="arena-result-card"><b>${esc(res.headline)}</b><small>${won ? 'You emptied your hand first!' : `${esc(players[winnerIdx].name)} won this round!`} · ${esc(res.detail)}</small><button type="button" class="btn gold sm" id="unoAgain" style="margin-top:8px">Play Again</button></div>`;
      $('#unoAgain', m).onclick = () => { m.close(); openArenaGame('uno', rival?.uid); };
    }
    render();
  };

  const executeCardPlay = (seatIdx, cardId, chosenColor) => {
    const p = players[seatIdx];
    const idx = p.hand.findIndex(c => c.id === cardId);
    if (idx < 0) return false;
    const card = p.hand[idx];
    if (!canPlay(card)) return false;

    p.hand.splice(idx, 1);
    discard.push(card);
    activeColor = card.color === 'wild' ? (chosenColor || 'red') : card.color;

    if (typeof playSfx === 'function') {
      playSfx(card.value === 'wild4' || card.value === 'draw2' ? 'duelCorrect' : 'tap');
    }

    if (p.hand.length === 0) {
      statusLine = `🏆 ${p.name} played ${cardLabel(card)} and WON!`;
      finishMatch(seatIdx);
      return true;
    }

    /* Check UNO! vulnerability when hitting 1 card */
    if (p.hand.length === 1) {
      if (!p.calledUno) {
        vulnerableSeat = seatIdx;
        if (seatIdx === 0) {
          statusLine = '🚨 You have 1 card! Tap UNO! fast before a bot catches you (+2)!';
        }
      } else {
        if (vulnerableSeat === seatIdx) vulnerableSeat = null;
      }
    } else {
      p.calledUno = false;
      if (vulnerableSeat === seatIdx) vulnerableSeat = null;
    }

    let step = 1;
    if (card.value === 'reverse') {
      if (players.length === 2) {
        step = 2;
        statusLine = `⇄ ${p.name} played Reverse (acts as Skip in 1v1)!`;
      } else {
        direction *= -1;
        statusLine = `⇄ ${p.name} reversed turn direction!`;
      }
    } else if (card.value === 'skip') {
      const skipped = players[nextSeat(seatIdx, 1)];
      step = 2;
      statusLine = `⊘ ${p.name} skipped ${skipped.name}!`;
    } else if (card.value === 'draw2') {
      const victimIdx = nextSeat(seatIdx, 1);
      players[victimIdx].hand.push(...drawFromDeck(2));
      players[victimIdx].calledUno = false;
      step = 2;
      statusLine = `💥 ${p.name} hit ${players[victimIdx].name} with +2!`;
    } else if (card.value === 'wild4') {
      const victimIdx = nextSeat(seatIdx, 1);
      players[victimIdx].hand.push(...drawFromDeck(4));
      players[victimIdx].calledUno = false;
      step = 2;
      statusLine = `🌈 ${p.name} dropped WILD +4 (${COLOR_META[activeColor].label}) on ${players[victimIdx].name}!`;
    } else if (card.value === 'wild') {
      statusLine = `🌈 ${p.name} changed color to ${COLOR_META[activeColor].label}!`;
    } else {
      statusLine = `${p.name} played ${cardLabel(card)}`;
    }

    currentTurn = nextSeat(seatIdx, step);
    render();
    if (!over && players[currentTurn].isBot) scheduleBotTurn();
    return true;
  };

  const scheduleBotTurn = () => {
    clearTimeout(botTimer);
    botTimer = setTimeout(() => {
      if (over) return;

      /* Smart Bot catches player if player forgot to shout UNO! (65% chance) */
      if (vulnerableSeat === 0 && players[0].hand.length === 1 && !players[0].calledUno && Math.random() < 0.65) {
        players[0].hand.push(...drawFromDeck(2));
        vulnerableSeat = null;
        statusLine = `🚨 Caught! You forgot UNO! (+2 penalty cards)`;
        if (typeof playSfx === 'function') playSfx('duelWrong');
        if (typeof QuickVoice !== 'undefined') QuickVoice.showBubble($('#unoTable', m), 'Caught you! +2 cards!', players[currentTurn].name, false);
        render();
      }

      const p = players[currentTurn];
      if (!p || !p.isBot) return;

      /* Smart AI picks optimal playable card */
      const playable = p.hand.filter(canPlay);
      const colCnt = { red: 0, yellow: 0, green: 0, blue: 0 };
      p.hand.forEach(c => { if (c.color !== 'wild') colCnt[c.color]++; });
      const bestColor = COLORS.slice().sort((a, b) => colCnt[b] - colCnt[a])[0] || 'red';

      if (playable.length) {
        const nextP = players[nextSeat(currentTurn, 1)];
        const urgent = nextP.hand.length <= 2;
        const score = (c) => {
          let s = c.color === 'wild' ? (c.value === 'wild4' ? 8 : 14) : 25 + (Number(c.value) || 10);
          if (c.value === 'draw2') s += 30;
          if (c.value === 'skip' || c.value === 'reverse') s += 24;
          if (urgent && (c.value === 'draw2' || c.value === 'wild4' || c.value === 'skip')) s += 50;
          return s;
        };
        playable.sort((a, b) => score(b) - score(a));
        const pick = playable[0];

        /* Bot remembers to call UNO 75% of the time (25% chance user can catch them!) */
        if (p.hand.length === 2 && Math.random() < 0.75) {
          p.calledUno = true;
          if (typeof QuickVoice !== 'undefined') QuickVoice.showBubble($('#unoTable', m), 'UNO! Watch out!', p.name, false);
        }
        executeCardPlay(currentTurn, pick.id, bestColor);
      } else {
        const drawn = drawFromDeck(1);
        p.hand.push(...drawn);
        p.calledUno = false;
        statusLine = `${p.name} drew a card`;
        if (typeof playSfx === 'function') playSfx('tap');
        currentTurn = nextSeat(currentTurn, 1);
        render();
        if (!over && players[currentTurn].isBot) scheduleBotTurn();
      }
    }, 680);
  };

  const renderUnoCardHtml = (c, playable, interactive) => {
    const g = cardGlyph(c.value);
    const isWild = c.color === 'wild';
    const cls = `uno-card c-${c.color} ${playable ? 'playable' : (interactive ? 'dim' : '')} ${isWild ? 'is-wild' : ''}`;
    const inner = `
      <span class="uc-corner tl">${g}</span>
      <span class="uc-oval"><b class="uc-center">${g}</b></span>
      <span class="uc-corner br">${g}</span>
    `;
    if (interactive) {
      return `<button type="button" class="${cls}" data-ucid="${c.id}" ${!playable || over || currentTurn !== 0 ? 'disabled' : ''} aria-label="${esc(cardLabel(c))}">${inner}</button>`;
    }
    return `<div class="${cls} top-discard" aria-label="Top card ${esc(cardLabel(c))}">${inner}</div>`;
  };

  const render = () => {
    const meP = players[0];
    if ($('#unoMyCnt', m)) $('#unoMyCnt', m).textContent = `You: ${meP.hand.length} card${meP.hand.length === 1 ? '' : 's'}`;
    if ($('#unoTurnPill', m)) $('#unoTurnPill', m).textContent = over ? 'Finished' : (currentTurn === 0 ? 'Your Turn' : `${players[currentTurn].name}…`);
    if ($('#unoDirPill', m)) $('#unoDirPill', m).textContent = direction === 1 ? '↻ Clockwise' : '↺ Counter';
    if ($('#unoDeckCnt', m)) $('#unoDeckCnt', m).textContent = `Draw (${deck.length})`;
    if ($('#unoStatus', m)) $('#unoStatus', m).textContent = statusLine;

    const orb = $('#unoColorOrb', m);
    if (orb) {
      orb.style.background = `radial-gradient(circle at 32% 28%, #fff 0%, ${COLOR_META[activeColor].hex} 40%, ${COLOR_META[activeColor].dark} 100%)`;
      orb.style.boxShadow = `0 0 18px ${COLOR_META[activeColor].glow}`;
      orb.textContent = COLOR_META[activeColor].label[0];
    }

    const opps = $('#unoOpps', m);
    if (opps) {
      opps.innerHTML = players.slice(1).map((p, idx) => {
        const seat = idx + 1;
        const active = !over && currentTurn === seat;
        return `
          <div class="uno-opp-seat ${active ? 'active' : ''}">
            ${av({ avatar: p.avatar, name: p.name }, 34)}
            <div class="uno-opp-meta">
              <b>${esc(p.name)}</b>
              <span>🃏 ${p.hand.length}${p.hand.length === 1 && p.calledUno ? ' · <b>UNO!</b>' : ''}</span>
            </div>
          </div>
        `;
      }).join('');
    }

    const discWrap = $('#unoDiscardWrap', m);
    if (discWrap) {
      discWrap.innerHTML = renderUnoCardHtml(topCard(), false, false);
    }

    const unoBtn = $('#unoShoutBtn', m);
    if (unoBtn) {
      const canShout = !over && meP.hand.length <= 2 && !meP.calledUno;
      unoBtn.classList.toggle('ready', canShout);
      unoBtn.classList.toggle('called', meP.calledUno);
      unoBtn.textContent = meP.calledUno ? 'UNO ✓' : 'UNO!';
    }

    const catchBtn = $('#unoCatchBtn', m);
    if (catchBtn) {
      const canCatchBot = !over && vulnerableSeat !== null && vulnerableSeat !== 0 && players[vulnerableSeat].hand.length === 1 && !players[vulnerableSeat].calledUno;
      catchBtn.hidden = !canCatchBot;
    }

    const cp = $('#unoColorPicker', m);
    if (cp) cp.hidden = !pendingWildCardId;

    const handEl = $('#unoMyHand', m);
    if (handEl) {
      handEl.innerHTML = meP.hand.map(c => renderUnoCardHtml(c, !over && currentTurn === 0 && canPlay(c), true)).join('');
      handEl.querySelectorAll('[data-ucid]').forEach(btn => {
        btn.onclick = () => {
          if (over || currentTurn !== 0 || pendingWildCardId) return;
          const card = meP.hand.find(x => x.id === btn.dataset.ucid);
          if (!card || !canPlay(card)) return;
          if (card.color === 'wild') {
            pendingWildCardId = card.id;
            statusLine = 'Pick the next active color!';
            if (typeof playSfx === 'function') playSfx('tap');
            render();
            return;
          }
          executeCardPlay(0, card.id);
        };
      });
    }
  };

  $('#unoDrawBtn', m).onclick = () => {
    if (over || currentTurn !== 0 || pendingWildCardId) return;
    const drawn = drawFromDeck(1);
    players[0].hand.push(...drawn);
    players[0].calledUno = false;
    if (typeof playSfx === 'function') playSfx('tap');
    const c = drawn[0];
    if (c && canPlay(c)) {
      statusLine = `Drew playable ${cardLabel(c)}! Play it or tap Draw again.`;
      render();
      return;
    }
    statusLine = 'Drew 1 card · Passing turn';
    currentTurn = nextSeat(0, 1);
    render();
    if (!over && players[currentTurn].isBot) scheduleBotTurn();
  };

  $('#unoShoutBtn', m).onclick = () => {
    if (over) return;
    if (players[0].hand.length <= 2) {
      players[0].calledUno = true;
      if (vulnerableSeat === 0) vulnerableSeat = null;
      statusLine = '🔥 UNO! Safe at 1 card!';
      if (typeof QuickVoice !== 'undefined') {
        QuickVoice.speak('UNO!');
        QuickVoice.showBubble($('#unoTable', m), '🚨 UNO!', me?.name || 'You', true);
      } else if (typeof playSfx === 'function') playSfx('duelWin');
      render();
    } else {
      toast('Tap UNO! when you have 1 or 2 cards left');
    }
  };

  $('#unoCatchBtn', m).onclick = () => {
    if (over || vulnerableSeat === null || vulnerableSeat === 0) return;
    const target = players[vulnerableSeat];
    if (target.hand.length === 1 && !target.calledUno) {
      target.hand.push(...drawFromDeck(2));
      vulnerableSeat = null;
      statusLine = `🎯 Caught ${target.name} without UNO! +2 penalty!`;
      if (typeof playSfx === 'function') playSfx('duelCorrect');
      render();
    }
  };

  m.querySelectorAll('[data-unocol]').forEach(btn => {
    btn.onclick = () => {
      if (!pendingWildCardId) return;
      const cid = pendingWildCardId;
      const col = btn.dataset.unocol;
      pendingWildCardId = null;
      executeCardPlay(0, cid, col);
    };
  });

  m.onclose = () => {
    over = true;
    clearTimeout(botTimer);
    if (typeof QuickVoice !== 'undefined') QuickVoice.closePanel();
  };

  render();
}
