"use strict";
/* =====================================================================
   CHESS BLITZ ARENA — FULL-SCREEN INTEGRATED BLITZ CHESS
   · Complete Legal Engine (Castling, En Passant, Promotion, Check/Mate/Stalemate)
   · 3-Min Blitz Clocks + Material Advantage + Captured Trays
   · Bot VS (Normal Free / Hard Coins Alpha-Beta AI), Player VS (Bet), Invite Room
   ===================================================================== */

(function (global) {
  const FILES = 'abcdefgh';
  const KN = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
  const DIRS = [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [-1, 1], [1, -1], [1, 1]];
  const VAL = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 0 };
  const GLYPH = {
    K: '♚', Q: '♛', R: '♜', B: '♝', N: '♞', P: '♟',
    k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟'
  };

  const isW = p => p && p === p.toUpperCase();

  function createChessState() {
    const b = Array(64).fill('');
    const back = 'rnbqkbnr';
    for (let c = 0; c < 8; c++) {
      b[c] = back[c];
      b[8 + c] = 'p';
      b[48 + c] = 'P';
      b[56 + c] = back[c].toUpperCase();
    }
    return { b, turn: 'w', cas: { K: 1, Q: 1, k: 1, q: 1 }, ep: -1, capW: [], capB: [], last: null };
  }

  function cloneChess(s) {
    return {
      b: s.b.slice(),
      turn: s.turn,
      cas: { ...s.cas },
      ep: s.ep,
      capW: s.capW.slice(),
      capB: s.capB.slice(),
      last: s.last ? { ...s.last } : null
    };
  }

  function isAttacked(b, sq, by) {
    const r = sq >> 3, c = sq & 7, w = by === 'w';
    const pr = w ? r + 1 : r - 1, pc = w ? 'P' : 'p';
    if (pr >= 0 && pr < 8) {
      for (const dc of [-1, 1]) {
        const cc = c + dc;
        if (cc >= 0 && cc < 8 && b[pr * 8 + cc] === pc) return true;
      }
    }
    const N = w ? 'N' : 'n', K = w ? 'K' : 'k', R = w ? 'R' : 'r', B = w ? 'B' : 'b', Q = w ? 'Q' : 'q';
    for (const [dr, dc] of KN) {
      const rr = r + dr, cc = c + dc;
      if (rr >= 0 && rr < 8 && cc >= 0 && cc < 8 && b[rr * 8 + cc] === N) return true;
    }
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (!dr && !dc) continue;
        const rr = r + dr, cc = c + dc;
        if (rr >= 0 && rr < 8 && cc >= 0 && cc < 8 && b[rr * 8 + cc] === K) return true;
      }
    }
    for (const [dr, dc] of DIRS) {
      let rr = r + dr, cc = c + dc;
      while (rr >= 0 && rr < 8 && cc >= 0 && cc < 8) {
        const p = b[rr * 8 + cc];
        if (p) {
          if (p === Q || ((dr && dc) ? p === B : p === R)) return true;
          break;
        }
        rr += dr; cc += dc;
      }
    }
    return false;
  }

  function inCheck(s, side) {
    const k = side === 'w' ? 'K' : 'k';
    const sq = s.b.indexOf(k);
    if (sq < 0) return true;
    return isAttacked(s.b, sq, side === 'w' ? 'b' : 'w');
  }

  function applyChessMove(s, mv) {
    const ns = cloneChess(s);
    const b = ns.b;
    const p = b[mv.f];
    const w = isW(p);
    let captured = b[mv.t];

    // En passant capture
    if (p.toLowerCase() === 'p' && mv.t === s.ep && !captured) {
      const epSq = w ? mv.t + 8 : mv.t - 8;
      captured = b[epSq];
      b[epSq] = '';
    }
    if (captured) {
      if (w) ns.capW.push(captured);
      else ns.capB.push(captured);
    }

    b[mv.t] = mv.pr ? (w ? mv.pr.toUpperCase() : mv.pr.toLowerCase()) : p;
    b[mv.f] = '';

    // Castling rook shift
    if (p.toLowerCase() === 'k' && Math.abs((mv.t & 7) - (mv.f & 7)) === 2) {
      if (mv.t > mv.f) { b[mv.t - 1] = b[mv.t + 1]; b[mv.t + 1] = ''; }
      else { b[mv.t + 1] = b[mv.t - 2]; b[mv.t - 2] = ''; }
    }

    // Castling rights update
    if (p === 'K') { ns.cas.K = 0; ns.cas.Q = 0; }
    if (p === 'k') { ns.cas.k = 0; ns.cas.q = 0; }
    if (mv.f === 63 || mv.t === 63) ns.cas.K = 0;
    if (mv.f === 56 || mv.t === 56) ns.cas.Q = 0;
    if (mv.f === 7 || mv.t === 7) ns.cas.k = 0;
    if (mv.f === 0 || mv.t === 0) ns.cas.q = 0;

    ns.ep = (p.toLowerCase() === 'p' && Math.abs(mv.t - mv.f) === 16) ? ((mv.f + mv.t) >> 1) : -1;
    ns.turn = s.turn === 'w' ? 'b' : 'w';
    ns.last = { f: mv.f, t: mv.t };
    return ns;
  }

  function genPseudo(s) {
    const b = s.b, w = s.turn === 'w', out = [];
    for (let i = 0; i < 64; i++) {
      const p = b[i];
      if (!p || isW(p) !== w) continue;
      const t = p.toLowerCase(), r = i >> 3, c = i & 7;
      if (t === 'p') {
        const d = w ? -1 : 1, r1 = r + d;
        if (r1 < 0 || r1 > 7) continue;
        const promo = r1 === (w ? 0 : 7);
        const pushP = to => { if (promo) out.push({ f: i, t: to, pr: 'q' }); else out.push({ f: i, t: to }); };
        if (!b[r1 * 8 + c]) {
          pushP(r1 * 8 + c);
          if (r === (w ? 6 : 1) && !b[(r + 2 * d) * 8 + c]) out.push({ f: i, t: (r + 2 * d) * 8 + c });
        }
        for (const dc of [-1, 1]) {
          const cc = c + dc;
          if (cc < 0 || cc > 7) continue;
          const to = r1 * 8 + cc, tp = b[to];
          if (tp && isW(tp) !== w) pushP(to);
          else if (!tp && to === s.ep) out.push({ f: i, t: to });
        }
      } else if (t === 'n') {
        for (const [dr, dc] of KN) {
          const rr = r + dr, cc = c + dc;
          if (rr < 0 || rr > 7 || cc < 0 || cc > 7) continue;
          const tp = b[rr * 8 + cc];
          if (!tp || isW(tp) !== w) out.push({ f: i, t: rr * 8 + cc });
        }
      } else if (t === 'k') {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (!dr && !dc) continue;
            const rr = r + dr, cc = c + dc;
            if (rr < 0 || rr > 7 || cc < 0 || cc > 7) continue;
            const tp = b[rr * 8 + cc];
            if (!tp || isW(tp) !== w) out.push({ f: i, t: rr * 8 + cc });
          }
        }
        if (i === (w ? 60 : 4)) {
          const opp = w ? 'b' : 'w', rk = w ? 'R' : 'r';
          if ((w ? s.cas.K : s.cas.k) && b[i + 3] === rk && !b[i + 1] && !b[i + 2] && !isAttacked(b, i, opp) && !isAttacked(b, i + 1, opp) && !isAttacked(b, i + 2, opp)) {
            out.push({ f: i, t: i + 2 });
          }
          if ((w ? s.cas.Q : s.cas.q) && b[i - 4] === rk && !b[i - 1] && !b[i - 2] && !b[i - 3] && !isAttacked(b, i, opp) && !isAttacked(b, i - 1, opp) && !isAttacked(b, i - 2, opp)) {
            out.push({ f: i, t: i - 2 });
          }
        }
      } else {
        const dirs = t === 'b' ? DIRS.slice(4) : (t === 'r' ? DIRS.slice(0, 4) : DIRS);
        for (const [dr, dc] of dirs) {
          let rr = r + dr, cc = c + dc;
          while (rr >= 0 && rr < 8 && cc >= 0 && cc < 8) {
            const to = rr * 8 + cc, tp = b[to];
            if (!tp) out.push({ f: i, t: to });
            else {
              if (isW(tp) !== w) out.push({ f: i, t: to });
              break;
            }
            rr += dr; cc += dc;
          }
        }
      }
    }
    return out;
  }

  function legalMoves(s) {
    return genPseudo(s).filter(mv => !inCheck(applyChessMove(s, mv), s.turn));
  }

  function evalChess(s) {
    let score = 0;
    for (let i = 0; i < 64; i++) {
      const p = s.b[i];
      if (!p) continue;
      const t = p.toLowerCase();
      const r = i >> 3, c = i & 7;
      const centerBonus = (r >= 2 && r <= 5 && c >= 2 && c <= 5) ? 16 : 0;
      const v = (VAL[t] || 0) + centerBonus;
      score += isW(p) ? v : -v;
    }
    return score;
  }

  function pickBotChessMove(s, tier) {
    const moves = legalMoves(s);
    if (!moves.length) return null;
    const isMax = s.turn === 'w';
    const depth = tier === 'pro' ? 2 : 1;

    const search = (st, d, alpha, beta, maximizing) => {
      const ms = legalMoves(st);
      if (!ms.length) {
        if (inCheck(st, st.turn)) return maximizing ? -99999 : 99999;
        return 0;
      }
      if (d === 0) return evalChess(st);
      if (maximizing) {
        let best = -Infinity;
        for (const m of ms) {
          const v = search(applyChessMove(st, m), d - 1, alpha, beta, false);
          if (v > best) best = v;
          if (best > alpha) alpha = best;
          if (beta <= alpha) break;
        }
        return best;
      } else {
        let best = Infinity;
        for (const m of ms) {
          const v = search(applyChessMove(st, m), d - 1, alpha, beta, true);
          if (v < best) best = v;
          if (best < beta) beta = best;
          if (beta <= alpha) break;
        }
        return best;
      }
    };

    let bestMove = moves[0];
    let bestVal = isMax ? -Infinity : Infinity;
    for (const mv of moves) {
      const val = search(applyChessMove(s, mv), depth - 1, -Infinity, Infinity, !isMax) + (tier === 'pro' ? 0 : (Math.random() - 0.5) * 45);
      if (isMax ? val > bestVal : val < bestVal) {
        bestVal = val;
        bestMove = mv;
      }
    }
    return bestMove;
  }

  global.ChessBlitzRules = { createChessState, legalMoves, applyChessMove, inCheck, pickBotChessMove };

  function launchChessBlitzArena(opts) {
    const o = opts || {};
    const modeType = o.modeType || 'bot';
    const botTier = o.botTier || (o.stake > 0 ? 'pro' : 'standard');
    const stake = Math.max(0, Math.floor(Number(o.stake || 0)));
    const roomCode = String(o.roomCode || ('CH' + Math.floor(1000 + Math.random() * 9000))).toUpperCase();
    const isLocalPvp = modeType === 'pvp' && !o.rivalBot;
    const p1Name = (typeof me !== 'undefined' && me.name) ? me.name : 'You';
    const p2Name = o.rival?.name || (isLocalPvp ? 'Player 2' : (botTier === 'pro' ? 'Grandmaster Bot' : 'Chess Bot'));
    const pay = typeof calcArenaStakePayout === 'function' ? calcArenaStakePayout(stake) : { grossPot: stake * 2, winnerPayout: stake * 2 };

    if (typeof setMyLiveActivity === 'function') {
      setMyLiveActivity({ type: 'playing', gameId: 'chess_blitz', gameName: 'Chess Blitz', roomCode, mode: modeType });
    }

    let st = createChessState();
    let selSq = -1;
    let legal = legalMoves(st);
    let wClock = 180;
    let bClock = 180;
    let over = false;
    let clkId = 0;
    let botTimer = 0;
    let chatWidget = null;

    const fmtClk = sec => {
      const s = Math.max(0, Math.floor(sec));
      return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
    };

    const view = openFullScreenGameView({
      gameId: 'chess_blitz',
      title: 'Chess Blitz',
      subMeta: stake > 0 ? `${stake} 🪙 · Pot ${fmtNum(pay.winnerPayout)}` : (isLocalPvp ? `Player VS · ${roomCode}` : `3+0 Blitz · ${botTier === 'pro' ? 'Hard' : 'Normal'}`),
      statusText: 'White Turn',
      statusTone: 'turn',
      themeClass: 'gfs-theme-wood',
      html: `
        <div class="chess-ar-wrap" id="chessArWrap" data-testid="chess-arena-stage">
          <div class="chess-pbar top" id="chTopBar">
            <div class="chess-pl">
              <span class="chess-side-dot b">♚</span>
              <div><b>${esc(p2Name)}</b><div class="chess-caps" id="chCapB"></div></div>
            </div>
            <span class="chess-clk" id="chClkB">3:00</span>
          </div>

          <div class="chess-board-grid" id="chBoardGrid" data-testid="chess-board" role="grid" aria-label="Chess Blitz Board"></div>

          <div class="chess-pbar bot active" id="chBotBar">
            <div class="chess-pl">
              <span class="chess-side-dot w">♔</span>
              <div><b>${esc(p1Name)}</b><div class="chess-caps" id="chCapW"></div></div>
            </div>
            <span class="chess-clk active" id="chClkW">3:00</span>
          </div>

          <div id="chResultHost"></div>
          <div id="chChatHost"></div>
        </div>
      `
    });

    if (typeof createInGameChatWidget === 'function' && $('#chChatHost', view)) {
      chatWidget = createInGameChatWidget({
        gameId: 'chess_blitz',
        roomCode,
        quickLines: ['Check! ♟️', 'Good move!', 'Watch the clock ⏱️', 'GG! 👏']
      });
      chatWidget.mount($('#chChatHost', view));
    }

    const endChess = (winnerSide, reason) => {
      if (over) return;
      over = true;
      clearInterval(clkId);
      clearTimeout(botTimer);
      const outcome = winnerSide === 'draw' ? 'tie' : (isLocalPvp ? 'win' : (winnerSide === 'w' ? 'win' : 'lose'));
      const res = settleArenaMatchOutcome(outcome, stake, 55, 38, 14);
      if (winnerSide === 'w') spawnArenaSparks($('#chBoardGrid', view), '#fde047', 16);
      view.setStatus('Finished', outcome === 'win' ? 'ok' : (outcome === 'tie' ? 'neutral' : 'bot'));
      const host = $('#chResultHost', view);
      if (host) {
        const title = winnerSide === 'draw'
          ? '🤝 Draw'
          : (isLocalPvp ? `🏆 ${esc(winnerSide === 'w' ? p1Name : p2Name)} Wins!` : esc(res.headline));
        host.innerHTML = `
          <div class="arena-result-card" data-testid="chess-result-card">
            <b>${title}</b>
            <small>${esc(reason)} · ${esc(res.detail)}</small>
            <div class="row" style="gap:8px;margin-top:10px;justify-content:center">
              <button type="button" class="btn ghost sm" id="chExitBtn">Exit</button>
              <button type="button" class="btn gold sm" id="chRematchBtn">Rematch</button>
            </div>
          </div>
        `;
        $('#chExitBtn', host).onclick = () => view.close();
        $('#chRematchBtn', host).onclick = () => {
          if (typeof openVisualModeSelect === 'function') openVisualModeSelect('chess_blitz', o.rival?.uid);
          else launchChessBlitzArena(o);
        };
      }
    };

    const renderBoard = () => {
      const boardEl = $('#chBoardGrid', view);
      if (!boardEl) return;
      const targets = new Map();
      if (selSq >= 0) {
        legal.filter(m => m.f === selSq).forEach(m => targets.set(m.t, m));
      }
      const checkedKingSq = inCheck(st, st.turn) ? st.b.indexOf(st.turn === 'w' ? 'K' : 'k') : -1;

      let html = '';
      for (let i = 0; i < 64; i++) {
        const r = i >> 3, c = i & 7;
        const light = (r + c) % 2 === 0;
        const p = st.b[i];
        const isSel = i === selSq;
        const isLast = st.last && (i === st.last.f || i === st.last.t);
        const isChk = i === checkedKingSq;
        const mv = targets.get(i);
        const tgtCls = mv ? (p ? 'cap' : 'tgt') : '';
        html += `<button type="button" class="ch-sq ${light ? 'lt' : 'dk'} ${isSel ? 'sel' : ''} ${isLast ? 'last' : ''} ${isChk ? 'chk' : ''} ${tgtCls}" data-chsq="${i}" aria-label="${FILES[c]}${8 - r}${p ? ' ' + p : ''}">
          ${p ? `<span class="ch-pc ${isW(p) ? 'w' : 'b'}">${GLYPH[p]}</span>` : ''}
        </button>`;
      }
      boardEl.innerHTML = html;

      if ($('#chCapW', view)) $('#chCapW', view).textContent = st.capW.map(p => GLYPH[p]).join('');
      if ($('#chCapB', view)) $('#chCapB', view).textContent = st.capB.map(p => GLYPH[p]).join('');
      if ($('#chTopBar', view)) $('#chTopBar', view).classList.toggle('active', !over && st.turn === 'b');
      if ($('#chBotBar', view)) $('#chBotBar', view).classList.toggle('active', !over && st.turn === 'w');
      if ($('#chClkW', view)) { $('#chClkW', view).textContent = fmtClk(wClock); $('#chClkW', view).classList.toggle('active', !over && st.turn === 'w'); }
      if ($('#chClkB', view)) { $('#chClkB', view).textContent = fmtClk(bClock); $('#chClkB', view).classList.toggle('active', !over && st.turn === 'b'); }
      if (!over) {
        const chkTxt = checkedKingSq >= 0 ? ' · Check!' : '';
        view.setStatus((st.turn === 'w' ? 'White Turn' : (isLocalPvp ? 'Black Turn' : `${p2Name}…`)) + chkTxt, st.turn === 'w' ? 'turn' : 'bot');
      }
    };

    const commitMove = (mv) => {
      const cap = Boolean(st.b[mv.t]);
      st = applyChessMove(st, mv);
      selSq = -1;
      legal = legalMoves(st);
      if (typeof playSfx === 'function') playSfx(cap ? 'capture' : 'pawnStep');
      renderBoard();
      if (!legal.length) {
        if (inCheck(st, st.turn)) {
          endChess(st.turn === 'w' ? 'b' : 'w', 'Checkmate!');
        } else {
          endChess('draw', 'Stalemate');
        }
        return;
      }
      if (!isLocalPvp && st.turn === 'b' && !over) {
        botTimer = setTimeout(() => {
          if (over || st.turn !== 'b') return;
          const bmv = pickBotChessMove(st, botTier);
          if (bmv) commitMove(bmv);
        }, botTier === 'pro' ? 420 : 540);
      }
    };

    $('#chBoardGrid', view).onclick = (e) => {
      if (over) return;
      if (!isLocalPvp && st.turn !== 'w') return;
      const btn = e.target.closest('[data-chsq]');
      if (!btn) return;
      const sq = Number(btn.dataset.chsq);
      if (selSq >= 0) {
        const mv = legal.find(m => m.f === selSq && m.t === sq);
        if (mv) { commitMove(mv); return; }
      }
      const p = st.b[sq];
      if (p && (st.turn === 'w' ? isW(p) : !isW(p))) {
        selSq = sq === selSq ? -1 : sq;
        if (typeof playSfx === 'function') playSfx('tap');
        renderBoard();
      } else {
        selSq = -1;
        renderBoard();
      }
    };

    clkId = setInterval(() => {
      if (over) return;
      if (st.turn === 'w') {
        wClock--;
        if ($('#chClkW', view)) $('#chClkW', view).textContent = fmtClk(wClock);
        if (wClock <= 0) endChess('b', 'White ran out of time');
      } else {
        bClock--;
        if ($('#chClkB', view)) $('#chClkB', view).textContent = fmtClk(bClock);
        if (bClock <= 0) endChess('w', 'Black ran out of time');
      }
    }, 1000);

    view.onclose = () => {
      over = true;
      clearInterval(clkId);
      clearTimeout(botTimer);
      if (chatWidget) chatWidget.destroy();
      if (typeof clearMyLiveActivity === 'function') clearMyLiveActivity();
    };

    renderBoard();
    return view;
  }

  global.launchChessBlitzArena = launchChessBlitzArena;
})(typeof window !== 'undefined' ? window : globalThis);
