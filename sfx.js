"use strict";
/* ===== Study Game: Lightweight Web Audio API Sound FX System (Zero External Files) ===== */

const SFX = (() => {
  const MUTE_KEY = 'sg_sfx_muted';
  let ctx = null;
  let muted = false;
  let unlocked = false;
  let lastChatRecvTs = 0;

  try {
    muted = localStorage.getItem(MUTE_KEY) === '1';
  } catch {}

  function getCtx() {
    if (muted || !unlocked) return null;
    if (typeof window === 'undefined') return null;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    if (!ctx) {
      try { ctx = new AudioCtx(); } catch { return null; }
    }
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    return ctx;
  }

  function unlock() {
    if (unlocked) return;
    unlocked = true;
    const c = getCtx();
    if (c && c.state === 'suspended') c.resume().catch(() => {});
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('pointerdown', unlock, { once: true, passive: true });
    window.addEventListener('keydown', unlock, { once: true, passive: true });
    window.addEventListener('click', unlock, { once: true, passive: true });
  }

  function tone(c, freq, startOffset, duration, type = 'sine', gainPeak = 0.09, endFreq = null) {
    try {
      const now = c.currentTime + startOffset;
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(Math.max(60, freq), now);
      if (endFreq && endFreq !== freq) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(60, endFreq), now + duration);
      }
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(Math.max(0.001, gainPeak), now + Math.min(0.02, duration * 0.3));
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      osc.connect(gain);
      gain.connect(c.destination);
      osc.start(now);
      osc.stop(now + duration + 0.02);
    } catch {}
  }

  function play(name, opts) {
    if (muted) return false;
    const c = getCtx();
    if (!c) return false;
    opts = opts || {};

    switch (name) {
      case 'coin': {
        const amt = Number(opts.amount || 10);
        const boost = amt >= 500 ? 1.16 : (amt >= 100 ? 1.08 : 1);
        tone(c, 988 * boost, 0, 0.09, 'triangle', 0.09);
        tone(c, 1318.5 * boost, 0.065, 0.16, 'sine', 0.1);
        if (amt >= 100) tone(c, 1568 * boost, 0.13, 0.18, 'sine', 0.08);
        return true;
      }
      case 'taskClaim': {
        tone(c, 587.3, 0, 0.09, 'triangle', 0.09);
        tone(c, 880, 0.07, 0.11, 'triangle', 0.095);
        tone(c, 1174.7, 0.14, 0.2, 'sine', 0.1);
        return true;
      }
      case 'giftSend': {
        const tier = Math.max(1, Math.min(6, Number(opts.tier || 1)));
        const base = 523.25 * (1 + (tier - 1) * 0.06);
        tone(c, base, 0, 0.1, 'triangle', 0.085);
        tone(c, base * 1.25, 0.065, 0.12, 'sine', 0.09);
        tone(c, base * 1.5, 0.13, 0.18, 'sine', 0.095);
        if (tier >= 4 || Number(opts.qty || 1) >= 5) {
          tone(c, base * 2, 0.2, 0.24, 'triangle', 0.09);
        }
        return true;
      }
      case 'giftReceive': {
        tone(c, 659.25, 0, 0.11, 'sine', 0.09);
        tone(c, 783.99, 0.075, 0.11, 'sine', 0.09);
        tone(c, 1046.5, 0.15, 0.2, 'triangle', 0.1);
        tone(c, 1318.5, 0.23, 0.25, 'sine', 0.085);
        return true;
      }
      case 'luckyDrop': {
        const notes = [784, 987.8, 1174.7, 1568, 1975.5];
        notes.forEach((f, idx) => tone(c, f, idx * 0.055, 0.16, idx % 2 ? 'sine' : 'triangle', 0.085));
        return true;
      }
      case 'chatSend': {
        tone(c, 520, 0, 0.055, 'sine', 0.06, 680);
        return true;
      }
      case 'chatRecv': {
        const now = Date.now();
        if (now - lastChatRecvTs < 1200) return false;
        lastChatRecvTs = now;
        tone(c, 620, 0, 0.07, 'sine', 0.055);
        tone(c, 830, 0.06, 0.1, 'sine', 0.055);
        return true;
      }
      case 'redPacketDrop': {
        tone(c, 440, 0, 0.08, 'triangle', 0.09, 660);
        tone(c, 880, 0.07, 0.14, 'sine', 0.1);
        tone(c, 1320, 0.14, 0.2, 'sine', 0.09);
        return true;
      }
      case 'redPacketClaim': {
        [880, 1046.5, 1318.5, 1760].forEach((f, i) => tone(c, f, i * 0.05, 0.16, 'triangle', 0.095));
        return true;
      }
      case 'levelUp': {
        const chord = [523.25, 659.25, 783.99, 1046.5, 1318.5];
        chord.forEach((f, i) => tone(c, f, i * 0.075, 0.26, i === 4 ? 'sine' : 'triangle', 0.1));
        return true;
      }
      case 'duelCorrect': {
        tone(c, 660, 0, 0.07, 'triangle', 0.08);
        tone(c, 990, 0.055, 0.12, 'sine', 0.085);
        return true;
      }
      case 'duelWrong': {
        tone(c, 260, 0, 0.11, 'sawtooth', 0.05, 180);
        return true;
      }
      case 'duelWin': {
        [587.3, 740, 880, 1174.7].forEach((f, i) => tone(c, f, i * 0.07, 0.22, 'triangle', 0.095));
        return true;
      }
      case 'click':
      default: {
        tone(c, 740, 0, 0.04, 'sine', 0.045, 860);
        return true;
      }
    }
  }

  function isMuted() {
    return muted;
  }

  function setMuted(next) {
    muted = Boolean(next);
    try { localStorage.setItem(MUTE_KEY, muted ? '1' : '0'); } catch {}
    syncButtons();
    if (!muted) play('click');
    return muted;
  }

  function toggle() {
    return setMuted(!muted);
  }

  function iconSvg(isOff) {
    if (isOff) {
      return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M22 9l-6 6M16 9l6 6"/></svg>';
    }
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M19 5.5a9.5 9.5 0 0 1 0 13"/></svg>';
  }

  function syncButtons() {
    if (typeof document === 'undefined') return;
    const hdrBtn = document.getElementById('sfxBtn');
    if (hdrBtn) {
      hdrBtn.innerHTML = iconSvg(muted);
      hdrBtn.setAttribute('aria-pressed', muted ? 'true' : 'false');
      hdrBtn.setAttribute('aria-label', muted ? 'Unmute Sound FX' : 'Mute Sound FX');
      hdrBtn.title = muted ? 'Sound FX: Muted (tap to unmute)' : 'Sound FX: On (tap to mute)';
      hdrBtn.classList.toggle('is-muted', muted);
    }
    document.querySelectorAll('[data-sfx-toggle]').forEach(el => {
      el.setAttribute('aria-pressed', muted ? 'true' : 'false');
      const lbl = el.querySelector('[data-sfx-label]');
      if (lbl) lbl.textContent = muted ? 'Muted' : 'Sound On';
      const ico = el.querySelector('[data-sfx-ico]');
      if (ico) ico.innerHTML = iconSvg(muted);
    });
  }

  return { play, isMuted, setMuted, toggle, syncButtons, iconSvg };
})();

function playSfx(name, opts) {
  if (typeof SFX !== 'undefined' && SFX && typeof SFX.play === 'function') {
    return SFX.play(name, opts);
  }
  return false;
}
