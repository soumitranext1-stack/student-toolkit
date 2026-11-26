"use strict";
/* =====================================================================
   NUMBER MATCH — PURE RULES ENGINE (v26)
   · Classic 9-column Number Match / Ten Pair puzzle rules
   · Match pairs that are EQUAL (a === b) OR SUM TO 10 (a + b === 10)
   · Valid connection paths across cleared (0) cells:
       1. Horizontal (same row)
       2. Vertical (same column)
       3. Diagonal (45° both directions)
       4. Reading-order wrap-around (linear index adjacency across cleared cells)
   · Full empty rows collapse cleanly for Row Clear bonus points
   · "+ Add Rows" appends all remaining active digits in reading order
   · Pure, zero-DOM module usable in browser & node:test
   ===================================================================== */
(function (root) {
  const COLS = 9;
  const MAX_ADD_USES = 5;

  function cloneGrid(grid) {
    return (Array.isArray(grid) ? grid : []).map(row => (Array.isArray(row) ? row.slice() : []));
  }

  function isValueMatch(a, b) {
    const x = Number(a) || 0;
    const y = Number(b) || 0;
    if (x < 1 || x > 9 || y < 1 || y > 9) return false;
    return x === y || (x + y === 10);
  }

  function inBounds(grid, r, c) {
    return Array.isArray(grid) && r >= 0 && r < grid.length && Array.isArray(grid[r]) && c >= 0 && c < grid[r].length;
  }

  function areCellsConnected(grid, r1, c1, r2, c2) {
    if (!inBounds(grid, r1, c1) || !inBounds(grid, r2, c2)) return false;
    if (r1 === r2 && c1 === c2) return false;
    if ((Number(grid[r1][c1]) || 0) <= 0 || (Number(grid[r2][c2]) || 0) <= 0) return false;

    // 1. Horizontal (same row)
    if (r1 === r2) {
      const minC = Math.min(c1, c2);
      const maxC = Math.max(c1, c2);
      let clear = true;
      for (let c = minC + 1; c < maxC; c++) {
        if ((Number(grid[r1][c]) || 0) > 0) { clear = false; break; }
      }
      if (clear) return true;
    }

    // 2. Vertical (same col)
    if (c1 === c2) {
      const minR = Math.min(r1, r2);
      const maxR = Math.max(r1, r2);
      let clear = true;
      for (let r = minR + 1; r < maxR; r++) {
        if ((Number(grid[r][c1]) || 0) > 0) { clear = false; break; }
      }
      if (clear) return true;
    }

    // 3. Diagonal (both directions)
    const dr = r2 - r1;
    const dc = c2 - c1;
    if (Math.abs(dr) === Math.abs(dc)) {
      const stepR = dr > 0 ? 1 : -1;
      const stepC = dc > 0 ? 1 : -1;
      let clear = true;
      let r = r1 + stepR;
      let c = c1 + stepC;
      while (r !== r2 && c !== c2) {
        if ((Number(grid[r][c]) || 0) > 0) { clear = false; break; }
        r += stepR;
        c += stepC;
      }
      if (clear) return true;
    }

    // 4. Linear reading-order wrap-around (row end -> next active digit)
    const cols = grid[0] ? grid[0].length : COLS;
    const idx1 = r1 * cols + c1;
    const idx2 = r2 * cols + c2;
    const lo = Math.min(idx1, idx2);
    const hi = Math.max(idx1, idx2);
    let linearClear = true;
    for (let idx = lo + 1; idx < hi; idx++) {
      const rr = Math.floor(idx / cols);
      const cc = idx % cols;
      if (inBounds(grid, rr, cc) && (Number(grid[rr][cc]) || 0) > 0) {
        linearClear = false;
        break;
      }
    }
    return linearClear;
  }

  function canMatchPair(grid, r1, c1, r2, c2) {
    if (!inBounds(grid, r1, c1) || !inBounds(grid, r2, c2)) return false;
    if (!isValueMatch(grid[r1][c1], grid[r2][c2])) return false;
    return areCellsConnected(grid, r1, c1, r2, c2);
  }

  function countRemaining(grid) {
    let n = 0;
    for (let r = 0; r < grid.length; r++) {
      for (let c = 0; c < grid[r].length; c++) {
        if ((Number(grid[r][c]) || 0) > 0) n++;
      }
    }
    return n;
  }

  function applyMatch(grid, r1, c1, r2, c2, comboRaw) {
    if (!canMatchPair(grid, r1, c1, r2, c2)) {
      return { ok: false, reason: 'invalid_pair', grid: cloneGrid(grid) };
    }
    const next = cloneGrid(grid);
    const a = Number(next[r1][c1]);
    const b = Number(next[r2][c2]);
    const matchType = a === b ? 'same' : 'sum10';
    const dist = Math.max(Math.abs(r2 - r1), Math.abs(c2 - c1));

    next[r1][c1] = 0;
    next[r2][c2] = 0;

    // Remove completely empty rows
    const kept = [];
    let clearedRows = 0;
    const clearedRowIndices = [];
    for (let r = 0; r < next.length; r++) {
      const hasAny = next[r].some(v => (Number(v) || 0) > 0);
      if (hasAny) kept.push(next[r]);
      else {
        clearedRows++;
        clearedRowIndices.push(r);
      }
    }

    const remainingCount = countRemaining(kept);
    const boardCleared = remainingCount === 0;
    const combo = Math.max(1, Math.min(8, Number(comboRaw) || 1));

    // Scoring: base 10 + distance bonus (up to +12) + row clear (+50/row) + stage clear (+150) + combo bonus
    const basePts = 10 + Math.min(12, Math.max(0, dist - 1) * 3);
    const rowPts = clearedRows * 50;
    const clearBonus = boardCleared ? 150 : 0;
    const comboBonus = combo > 1 ? (combo - 1) * 5 : 0;
    const points = basePts + rowPts + clearBonus + comboBonus;

    return {
      ok: true,
      grid: kept,
      clearedRows,
      clearedRowIndices,
      remainingCount,
      boardCleared,
      matchType,
      distance: dist,
      points
    };
  }

  function findAllValidPairs(grid) {
    const active = [];
    for (let r = 0; r < grid.length; r++) {
      for (let c = 0; c < grid[r].length; c++) {
        const v = Number(grid[r][c]) || 0;
        if (v > 0) active.push([r, c, v]);
      }
    }
    const pairs = [];
    for (let i = 0; i < active.length; i++) {
      const [r1, c1, v1] = active[i];
      for (let j = i + 1; j < active.length; j++) {
        const [r2, c2, v2] = active[j];
        if (!isValueMatch(v1, v2)) continue;
        if (areCellsConnected(grid, r1, c1, r2, c2)) {
          pairs.push([r1, c1, r2, c2]);
        }
      }
    }
    return pairs;
  }

  function findHintPair(grid) {
    const pairs = findAllValidPairs(grid);
    if (!pairs.length) return null;
    // Prefer a pair that clears a row, otherwise higher distance
    let best = pairs[0];
    let bestScore = -1;
    for (const p of pairs) {
      const sim = applyMatch(grid, p[0], p[1], p[2], p[3], 1);
      const s = (sim.boardCleared ? 1000 : 0) + (sim.clearedRows * 200) + (sim.distance * 5);
      if (s > bestScore) {
        bestScore = s;
        best = p;
      }
    }
    return best;
  }

  function appendRemainingRows(grid) {
    const next = cloneGrid(grid);
    const active = [];
    for (let r = 0; r < next.length; r++) {
      for (let c = 0; c < next[r].length; c++) {
        const v = Number(next[r][c]) || 0;
        if (v > 0) active.push(v);
      }
    }
    if (!active.length) {
      return { ok: false, reason: 'board_empty', grid: next, addedCount: 0, addedRows: 0 };
    }

    // Fill trailing zeros on last row first (classic Number Match feel), then append full rows of 9
    let addedRows = 0;
    let ptr = 0;
    if (next.length > 0) {
      const lastRow = next[next.length - 1];
      let lastNonZero = -1;
      for (let c = lastRow.length - 1; c >= 0; c--) {
        if ((Number(lastRow[c]) || 0) > 0) { lastNonZero = c; break; }
      }
      for (let c = lastNonZero + 1; c < COLS && ptr < active.length; c++) {
        lastRow[c] = active[ptr++];
      }
    }
    while (ptr < active.length) {
      const row = new Array(COLS).fill(0);
      for (let c = 0; c < COLS && ptr < active.length; c++) {
        row[c] = active[ptr++];
      }
      next.push(row);
      addedRows++;
    }

    return {
      ok: true,
      grid: next,
      addedCount: active.length,
      addedRows
    };
  }

  function makeRng(seedRaw) {
    if (seedRaw == null) return Math.random;
    let h = 2166136261 >>> 0;
    const str = String(seedRaw);
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    return function () {
      h = (Math.imul(h, 1664525) + 1013904223) >>> 0;
      return h / 4294967296;
    };
  }

  function createBoard(stageRaw, seedRaw) {
    const stage = Math.max(1, Math.floor(Number(stageRaw) || 1));
    const rng = makeRng(seedRaw);
    // Stage 1: 3 rows (27 tiles), Stage 2+: 3-4 rows with balanced pairability
    const numRows = stage >= 3 ? 4 : 3;

    // Try up to 12 times to guarantee a lively opening board with >= 5 valid pairs
    for (let attempt = 0; attempt < 12; attempt++) {
      const flat = [];
      const total = numRows * COLS;
      // Plant a mix of complementary pairs & random digits 1..9 so early combos feel crisp
      while (flat.length < total) {
        const d = 1 + Math.floor(rng() * 9);
        flat.push(d);
        if (flat.length < total && rng() < 0.36) {
          flat.push(rng() < 0.5 ? d : (10 - d));
        }
      }
      // Light shuffle while keeping strong pair density
      for (let i = flat.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        const tmp = flat[i]; flat[i] = flat[j]; flat[j] = tmp;
      }
      const grid = [];
      for (let r = 0; r < numRows; r++) {
        grid.push(flat.slice(r * COLS, (r + 1) * COLS));
      }
      if (findAllValidPairs(grid).length >= 5) {
        return grid;
      }
    }

    // Deterministic guaranteed-rich fallback
    return [
      [3, 7, 4, 4, 8, 2, 5, 5, 1],
      [9, 6, 4, 2, 8, 7, 3, 9, 1],
      [5, 5, 2, 8, 6, 4, 1, 9, 3]
    ];
  }

  const api = {
    COLS,
    MAX_ADD_USES,
    cloneGrid,
    isValueMatch,
    areCellsConnected,
    canMatchPair,
    countRemaining,
    applyMatch,
    findAllValidPairs,
    findHintPair,
    appendRemainingRows,
    createBoard
  };

  root.NumberMatchRules = api;
  if (typeof globalThis !== 'undefined') globalThis.NumberMatchRules = api;
})(typeof window !== 'undefined' ? window : globalThis);
