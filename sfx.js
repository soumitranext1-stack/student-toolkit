"use strict";
/* Study Game — Crisp Web Audio API Sound FX Engine (v11)
 * Zero external audio files, zero broken URLs, instant tactile cues.
 * Preserves all existing playSfx(...) keys + adds micPass, turnStart, stakeLock,
 * matchLose, giftBurst, giftOrbit, giftSpotlight, comboTick, reactionPop, tap.
 */
const SFX = (() => {
  let ctx = null;
  let muted = false;
  let unlocked = false;
  try { muted = localStorage.getItem('sg_sfx_muted') === '1'; } catch {}

  function getCtx() {
    if (muted || !unlocked) return null;
    try {
      if (!ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        ctx = new AC();
      }
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});
      return ctx;
    } catch { return null; }
  }

  function tone(freq, opts = {}) {
    const c = getCtx();
    if (!c) return;
    const now = c.currentTime + (opts.delay || 0);
    const dur = opts.dur || 0.12;
    const type = opts.type || 'sine';
    const vol = opts.vol != null ? opts.vol : 0.12;
    const endFreq = opts.endFreq || freq;
    try {
      const osc = c.createOscillator();
      const g = c.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);
      if (endFreq !== freq) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(24, endFreq), now + dur);
      }
      g.gain.setValueAtTime(0.0001, now);
      g.gain.linearRampToValueAtTime(vol, now + Math.min(0.015, dur * 0.25));
      g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
      osc.connect(g);
      g.connect(c.destination);
      osc.start(now);
      osc.stop(now + dur + 0.02);
    } catch {}
  }

  function noiseBurst(opts = {}) {
    const c = getCtx();
    if (!c) return;
    const now = c.currentTime + (opts.delay || 0);
    const dur = opts.dur || 0.16;
    const vol = opts.vol != null ? opts.vol : 0.05;
    try {
      const len = Math.max(1, Math.floor(c.sampleRate * dur));
      const buf = c.createBuffer(1, len, c.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
      const src = c.createBufferSource();
      src.buffer = buf;
      const flt = c.createBiquadFilter();
      flt.type = opts.filterType || 'bandpass';
      flt.frequency.setValueAtTime(opts.freq || 1800, now);
      const g = c.createGain();
      g.gain.setValueAtTime(vol, now);
      g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
      src.connect(flt);
      flt.connect(g);
      g.connect(c.destination);
      src.start(now);
    } catch {}
  }

  function click() {
    tone(720, { dur: 0.042, type: 'triangle', vol: 0.065, endFreq: 960 });
  }

  function tap() {
    tone(580, { dur: 0.036, type: 'sine', vol: 0.055, endFreq: 840 });
  }

  function coin(amount) {
    const big = Number(amount || 0) >= 80;
    tone(987.77, { dur: 0.08, type: 'triangle', vol: 0.11 });
    tone(1318.51, { delay: 0.065, dur: 0.15, type: 'sine', vol: 0.12 });
    if (big) {
      tone(1567.98, { delay: 0.13, dur: 0.16, type: 'sine', vol: 0.11 });
      tone(1975.53, { delay: 0.2, dur: 0.22, type: 'triangle', vol: 0.1 });
    }
  }

  function stakeLock() {
    tone(440, { dur: 0.07, type: 'triangle', vol: 0.1, endFreq: 660 });
    tone(880, { delay: 0.07, dur: 0.12, type: 'sine', vol: 0.12 });
    tone(1318.5, { delay: 0.14, dur: 0.14, type: 'triangle', vol: 0.09 });
  }

  function taskClaim(amount) {
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
      tone(f, { delay: i * 0.055, dur: 0.14, type: 'triangle', vol: 0.1 });
    });
    if (Number(amount || 0) >= 50) coin(amount);
  }

  function levelUp() {
    [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98].forEach((f, i) => {
      tone(f, { delay: i * 0.065, dur: 0.24, type: i % 2 ? 'sine' : 'triangle', vol: 0.12 });
    });
    noiseBurst({ delay: 0.18, dur: 0.22, freq: 3400, vol: 0.04 });
  }

  function chatSend() {
    tone(520, { dur: 0.055, type: 'sine', vol: 0.07, endFreq: 760 });
  }

  function chatRecv() {
    tone(660, { dur: 0.06, type: 'sine', vol: 0.075 });
    tone(880, { delay: 0.065, dur: 0.09, type: 'sine', vol: 0.08 });
  }

  function turnStart() {
    tone(587.33, { dur: 0.08, type: 'triangle', vol: 0.1 });
    tone(880, { delay: 0.08, dur: 0.14, type: 'sine', vol: 0.11 });
  }

  function micPass() {
    tone(493.88, { dur: 0.07, type: 'sine', vol: 0.09, endFreq: 659.25 });
    tone(783.99, { delay: 0.075, dur: 0.11, type: 'triangle', vol: 0.11, endFreq: 1046.5 });
    noiseBurst({ delay: 0.04, dur: 0.07, freq: 2400, vol: 0.03 });
  }

  function reactionPop() {
    tone(620, { dur: 0.06, type: 'sine', vol: 0.08, endFreq: 1180 });
    tone(1240, { delay: 0.045, dur: 0.07, type: 'triangle', vol: 0.065 });
  }

  function comboTick(comboQty) {
    const boost = Math.min(480, Number(comboQty || 1) * 5);
    tone(740 + boost, { dur: 0.065, type: 'triangle', vol: 0.095, endFreq: 1080 + boost });
  }

  function giftBurst() {
    [659.25, 880, 1174.66, 1567.98].forEach((f, i) => {
      tone(f, { delay: i * 0.045, dur: 0.15, type: 'sine', vol: 0.1 });
    });
    noiseBurst({ delay: 0.05, dur: 0.14, freq: 3800, vol: 0.035 });
  }

  function giftOrbit() {
    [523.25, 659.25, 783.99, 987.77, 1318.51].forEach((f, i) => {
      tone(f, { delay: i * 0.055, dur: 0.2, type: 'triangle', vol: 0.105 });
    });
  }

  function giftSpotlight() {
    tone(220, { dur: 0.22, type: 'sawtooth', vol: 0.055, endFreq: 440 });
    [587.33, 880, 1174.66, 1760].forEach((f, i) => {
      tone(f, { delay: 0.08 + i * 0.06, dur: 0.24, type: 'triangle', vol: 0.115 });
    });
    noiseBurst({ delay: 0.12, dur: 0.24, freq: 2600, vol: 0.045 });
  }

  function giftSend(tier, style) {
    if (style === 'spotlight') return giftSpotlight();
    if (style === 'orbit') return giftOrbit();
    if (style === 'burst') return giftBurst();
    const t = Number(tier || 1);
    const notes = t >= 6
      ? [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98]
      : t >= 4
        ? [587.33, 739.99, 880, 1174.66, 1479.98]
        : [659.25, 880, 1174.66];
    notes.forEach((f, i) => tone(f, { delay: i * 0.055, dur: 0.18, type: i % 2 ? 'sine' : 'triangle', vol: 0.11 }));
    if (t >= 5) noiseBurst({ delay: 0.12, dur: 0.22, freq: 3000, vol: 0.04 });
  }

  function giftReceive(tier) {
    giftSend(Math.max(2, Number(tier || 2)));
  }

  function giftLuxuryCar() {
    tone(95, { dur: 0.32, type: 'sawtooth', vol: 0.09, endFreq: 210 });
    tone(160, { delay: 0.26, dur: 0.36, type: 'sawtooth', vol: 0.095, endFreq: 340 });
    tone(240, { delay: 0.56, dur: 0.42, type: 'triangle', vol: 0.09, endFreq: 490 });
    noiseBurst({ delay: 0.22, dur: 0.48, freq: 1400, vol: 0.05 });
    [523.25, 659.25, 783.99, 1046.5, 1318.51].forEach((f, i) => {
      tone(f, { delay: 0.62 + i * 0.065, dur: 0.24, type: 'triangle', vol: 0.11 });
    });
  }

  function giftLuxuryPalace() {
    [261.63, 329.63, 392.0, 523.25, 659.25, 783.99, 1046.5, 1318.51].forEach((f, i) => {
      tone(f, { delay: i * 0.07, dur: 0.35, type: 'sine', vol: 0.11 });
    });
    tone(1567.98, { delay: 0.58, dur: 0.42, type: 'triangle', vol: 0.12 });
    tone(2093.0, { delay: 0.72, dur: 0.48, type: 'sine', vol: 0.1 });
    noiseBurst({ delay: 0.32, dur: 0.35, freq: 3800, vol: 0.045 });
  }

  function redPacketDrop() {
    tone(660, { dur: 0.09, type: 'triangle', vol: 0.1, endFreq: 920 });
    tone(1046.5, { delay: 0.09, dur: 0.16, type: 'sine', vol: 0.11 });
  }

  function redPacketClaim() {
    coin(150);
  }

  function duelCorrect() {
    tone(783.99, { dur: 0.075, type: 'triangle', vol: 0.1 });
    tone(1174.66, { delay: 0.065, dur: 0.11, type: 'sine', vol: 0.11 });
  }

  function duelWrong() {
    tone(240, { dur: 0.13, type: 'sawtooth', vol: 0.075, endFreq: 165 });
  }

  function duelWin() {
    // Energetic celebratory royal victory fanfare (arpeggio + triumphant chord + shimmer)
    const lead = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98];
    lead.forEach((f, i) => {
      tone(f, { delay: i * 0.065, dur: 0.24, type: i % 2 === 0 ? 'triangle' : 'sine', vol: 0.135 });
    });
    // Triumphant final C-major chord swell
    [523.25, 659.25, 783.99, 1046.5, 1567.98].forEach((f) => {
      tone(f, { delay: 0.42, dur: 0.46, type: 'triangle', vol: 0.085 });
    });
    tone(2093.0, { delay: 0.46, dur: 0.34, type: 'sine', vol: 0.075 });
    noiseBurst({ delay: 0.38, dur: 0.28, freq: 3800, vol: 0.045 });
  }

  function matchLose() {
    [392.0, 349.23, 293.66, 220.0].forEach((f, i) => {
      tone(f, { delay: i * 0.095, dur: 0.2, type: 'triangle', vol: 0.095 });
    });
  }

  function vipEntrance() {
    [392.0, 523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
      tone(f, { delay: i * 0.055, dur: 0.24, type: 'triangle', vol: 0.11 });
    });
    noiseBurst({ delay: 0.16, dur: 0.22, freq: 3400, vol: 0.04 });
  }

  function weddingBells() {
    [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5, 1318.51].forEach((f, i) => {
      tone(f, { delay: i * 0.11, dur: 0.34, type: 'sine', vol: 0.115 });
    });
  }

  function wheelTick() {
    tone(920, { dur: 0.03, type: 'triangle', vol: 0.065, endFreq: 680 });
  }

  function wheelWin() {
    [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98].forEach((f, i) => {
      tone(f, { delay: i * 0.06, dur: 0.24, type: 'triangle', vol: 0.12 });
    });
    noiseBurst({ delay: 0.18, dur: 0.24, freq: 3200, vol: 0.04 });
  }

  function poolHit() {
    tone(320, { dur: 0.045, type: 'triangle', vol: 0.12, endFreq: 140 });
    noiseBurst({ dur: 0.04, freq: 2200, vol: 0.055 });
  }

  function diceRoll() {
    // Tactile wooden/ivory multi-rattle + crisp final land clack
    const hops = [0, 0.055, 0.115, 0.18, 0.255, 0.34];
    const pitches = [460, 580, 510, 670, 590, 740];
    hops.forEach((d, i) => {
      tone(pitches[i], { delay: d, dur: 0.038, type: 'triangle', vol: 0.085, endFreq: pitches[i] * 0.65 });
      noiseBurst({ delay: d, dur: 0.032, freq: 1900 + i * 260, vol: 0.05 });
    });
    tone(310, { delay: 0.35, dur: 0.055, type: 'sine', vol: 0.09, endFreq: 195 });
  }

  function cardPlay() {
    noiseBurst({ dur: 0.055, freq: 2600, vol: 0.065 });
    tone(520, { dur: 0.045, type: 'triangle', vol: 0.085, endFreq: 860 });
  }

  function cardDraw() {
    noiseBurst({ dur: 0.06, freq: 1600, vol: 0.05 });
    tone(420, { delay: 0.015, dur: 0.05, type: 'sine', vol: 0.065, endFreq: 620 });
  }

  function pawnStep() {
    tone(380, { dur: 0.042, type: 'triangle', vol: 0.08, endFreq: 540 });
    noiseBurst({ dur: 0.022, freq: 1500, vol: 0.03 });
  }

  function capture() {
    tone(290, { dur: 0.09, type: 'sawtooth', vol: 0.085, endFreq: 130 });
    tone(660, { delay: 0.04, dur: 0.11, type: 'triangle', vol: 0.12, endFreq: 1180 });
    tone(1318.5, { delay: 0.11, dur: 0.16, type: 'sine', vol: 0.11 });
    noiseBurst({ delay: 0.02, dur: 0.1, freq: 2400, vol: 0.055 });
  }

  function pairMatch(combo) {
    const step = Math.min(8, Math.max(0, Number(combo || 1) - 1));
    const base = 523.25 * Math.pow(1.06, step);
    tone(base, { dur: 0.085, type: 'triangle', vol: 0.105 });
    tone(base * 1.25, { delay: 0.055, dur: 0.13, type: 'sine', vol: 0.115 });
    if (step >= 2) {
      tone(base * 1.5, { delay: 0.11, dur: 0.16, type: 'sine', vol: 0.095 });
    }
  }

  function rowClear() {
    [587.33, 739.99, 880, 1174.66, 1479.98].forEach((f, i) => {
      tone(f, { delay: i * 0.048, dur: 0.17, type: i % 2 ? 'sine' : 'triangle', vol: 0.115 });
    });
    noiseBurst({ delay: 0.08, dur: 0.18, freq: 3600, vol: 0.04 });
  }

  function addRows() {
    [420, 500, 590, 680].forEach((f, i) => {
      tone(f, { delay: i * 0.038, dur: 0.055, type: 'triangle', vol: 0.075 });
    });
  }

  function chestOpen() {
    [440, 554.37, 659.25, 880, 1108.73].forEach((f, i) => {
      tone(f, { delay: i * 0.055, dur: 0.2, type: 'sine', vol: 0.11 });
    });
  }

  function flashDrop() {
    tone(880, { dur: 0.09, type: 'sawtooth', vol: 0.07, endFreq: 1320 });
    tone(1320, { delay: 0.1, dur: 0.14, type: 'triangle', vol: 0.1 });
  }

  function warningAlert() {
    tone(420, { dur: 0.14, type: 'sawtooth', vol: 0.08, endFreq: 300 });
    tone(360, { delay: 0.17, dur: 0.18, type: 'sawtooth', vol: 0.08, endFreq: 240 });
  }

  function curtainWhoosh() {
    noiseBurst({ dur: 0.34, freq: 920, filterType: 'bandpass', vol: 0.075 });
    noiseBurst({ delay: 0.09, dur: 0.28, freq: 1650, filterType: 'bandpass', vol: 0.055 });
    tone(190, { dur: 0.3, type: 'sine', vol: 0.065, endFreq: 420 });
  }

  function timerTick(urgent) {
    const f = urgent ? 1140 : 840;
    tone(f, { dur: 0.036, type: 'triangle', vol: urgent ? 0.085 : 0.055, endFreq: f * 0.72 });
  }

  function fanfare() {
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98, 2093.0];
    notes.forEach((f, i) => {
      tone(f, { delay: i * 0.06, dur: 0.28, type: i % 2 === 0 ? 'triangle' : 'sine', vol: 0.125 });
    });
    [523.25, 783.99, 1046.5, 1567.98].forEach((f) => {
      tone(f, { delay: 0.44, dur: 0.52, type: 'triangle', vol: 0.08 });
    });
    noiseBurst({ delay: 0.36, dur: 0.32, freq: 3900, vol: 0.045 });
  }

  function funnyBuzzer() {
    tone(220, { dur: 0.16, type: 'sawtooth', vol: 0.085, endFreq: 165 });
    tone(155, { delay: 0.15, dur: 0.26, type: 'sawtooth', vol: 0.09, endFreq: 98 });
    tone(110, { delay: 0.16, dur: 0.24, type: 'triangle', vol: 0.07, endFreq: 82 });
  }

  function heartPop() {
    tone(587.33, { dur: 0.08, type: 'sine', vol: 0.09, endFreq: 880 });
    tone(1046.5, { delay: 0.07, dur: 0.13, type: 'triangle', vol: 0.105, endFreq: 1318.51 });
    tone(1567.98, { delay: 0.13, dur: 0.16, type: 'sine', vol: 0.08 });
  }

  function jackpotRoll() {
    [660, 784, 880, 988, 1175, 1319].forEach((f, i) => {
      tone(f, { delay: i * 0.042, dur: 0.07, type: 'triangle', vol: 0.085 });
    });
  }

  function wheelStop() {
    tone(659.25, { dur: 0.09, type: 'triangle', vol: 0.1 });
    tone(987.77, { delay: 0.08, dur: 0.18, type: 'sine', vol: 0.115 });
    noiseBurst({ delay: 0.06, dur: 0.12, freq: 3200, vol: 0.035 });
  }

  function play(name, opts = {}) {
    if (muted) return false;
    switch (name) {
      case 'click': click(); break;
      case 'tap': tap(); break;
      case 'coin': coin(opts.amount); break;
      case 'luckyDrop': coin(180); break;
      case 'stakeLock': stakeLock(); break;
      case 'taskClaim': taskClaim(opts.amount); break;
      case 'levelUp': levelUp(); break;
      case 'chatSend': chatSend(); break;
      case 'chatRecv': chatRecv(); break;
      case 'turnStart': turnStart(); break;
      case 'micPass': micPass(); break;
      case 'reactionPop': reactionPop(); break;
      case 'comboTick': comboTick(opts.qty); break;
      case 'giftBurst': giftBurst(); break;
      case 'giftOrbit': giftOrbit(); break;
      case 'giftSpotlight': giftSpotlight(); break;
      case 'giftSend': giftSend(opts.tier, opts.style); break;
      case 'giftReceive': giftReceive(opts.tier); break;
      case 'giftLuxuryCar':
      case 'carDrive': giftLuxuryCar(); break;
      case 'giftLuxuryPalace':
      case 'palaceReveal': giftLuxuryPalace(); break;
      case 'redPacketDrop': redPacketDrop(); break;
      case 'redPacketClaim': redPacketClaim(); break;
      case 'duelCorrect': duelCorrect(); break;
      case 'duelWrong':
      case 'error':
      case 'wrong': duelWrong(); break;
      case 'duelWin':
      case 'win':
      case 'victory': duelWin(); break;
      case 'matchLose':
      case 'lose':
      case 'defeat': matchLose(); break;
      case 'vipEntrance': vipEntrance(); break;
      case 'weddingBells':
      case 'weddingBell': weddingBells(); break;
      case 'wheelTick': wheelTick(); break;
      case 'wheelWin': wheelWin(); break;
      case 'poolHit': poolHit(); break;
      case 'diceRoll':
      case 'dice': diceRoll(); break;
      case 'cardPlay': cardPlay(); break;
      case 'cardDraw': cardDraw(); break;
      case 'pawnStep':
      case 'move': pawnStep(); break;
      case 'capture': capture(); break;
      case 'pairMatch': pairMatch(opts.combo); break;
      case 'rowClear': rowClear(); break;
      case 'addRows': addRows(); break;
      case 'chestOpen': chestOpen(); break;
      case 'flashDrop': flashDrop(); break;
      case 'warningAlert': warningAlert(); break;
      case 'curtainWhoosh': curtainWhoosh(); break;
      case 'timerTick': timerTick(opts.urgent); break;
      case 'fanfare': fanfare(); break;
      case 'funnyBuzzer': funnyBuzzer(); break;
      case 'heartPop': heartPop(); break;
      case 'jackpotRoll': jackpotRoll(); break;
      case 'wheelStop': wheelStop(); break;
      default: click();
    }
    return true;
  }

  function iconSvg(isOff) {
    if (isOff) {
      return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M22 9l-6 6M16 9l6 6"/></svg>';
    }
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M19 5.5a9.5 9.5 0 0 1 0 13"/></svg>';
  }

  function syncButtons() {
    if (typeof document === 'undefined') return;
    const b = document.getElementById('sfxBtn');
    if (b) {
      b.classList.toggle('is-muted', muted);
      b.setAttribute('aria-pressed', muted ? 'true' : 'false');
      b.setAttribute('aria-label', muted ? 'Unmute Sound FX' : 'Mute Sound FX');
      b.title = muted ? 'Sound FX: Muted (tap to unmute)' : 'Sound FX: On (tap to mute)';
      b.innerHTML = iconSvg(muted);
    }
    document.querySelectorAll('[data-sfx-toggle]').forEach(el => {
      el.setAttribute('aria-pressed', muted ? 'true' : 'false');
      const lbl = el.querySelector('[data-sfx-label]');
      if (lbl) lbl.textContent = muted ? 'Muted' : 'Sound On';
      const ico = el.querySelector('[data-sfx-ico]');
      if (ico) ico.innerHTML = iconSvg(muted);
    });
  }

  function setMuted(v) {
    muted = Boolean(v);
    try { localStorage.setItem('sg_sfx_muted', muted ? '1' : '0'); } catch {}
    syncButtons();
    if (!muted) click();
    return muted;
  }

  function toggle() { return setMuted(!muted); }

  const unlock = () => {
    unlocked = true;
    if (!muted) getCtx();
  };
  window.addEventListener('pointerdown', unlock, { once: true, passive: true });
  window.addEventListener('keydown', unlock, { once: true, passive: true });
  window.addEventListener('click', unlock, { once: true, passive: true });

  return { play, toggle, setMuted, isMuted: () => muted, syncButtons, syncMuteBtn: syncButtons, iconSvg };
})();

function playSfx(name, opts) {
  if (typeof SFX !== 'undefined' && SFX && typeof SFX.play === 'function') return SFX.play(name, opts);
  return false;
}
