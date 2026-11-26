"use strict";
/* =====================================================================
   NATURAL MULTI-LANGUAGE AI VOICE NARRATOR (EN / HI / BN)
   · Uses Web Speech API (en-IN / hi-IN / bn-IN with graceful fallback)
   · Speaks natural parallel scripts: { enText, hiSpoken, bnSpoken }
   · Reusable Floating Voice Bar (Auto-Speak + EN | HI | BN + Replay)
   ===================================================================== */

const VoiceNarrator = (() => {
  const LANG_META = {
    en: { code: 'EN', locale: 'en-IN', fallback: 'en-US', label: 'English' },
    hi: { code: 'HI', locale: 'hi-IN', fallback: 'en-IN', label: 'हिन्दी' },
    bn: { code: 'BN', locale: 'bn-IN', fallback: 'en-IN', label: 'বাংলা' }
  };

  let lang = 'en';
  let autoSpeak = true;
  let lastScript = null;
  let speaking = false;
  let cachedVoices = [];

  try {
    const savedLang = localStorage.getItem('sg_voice_lang');
    if (savedLang && LANG_META[savedLang]) lang = savedLang;
    const savedAuto = localStorage.getItem('sg_voice_auto');
    if (savedAuto === '0') autoSpeak = false;
  } catch {}

  function loadVoices() {
    try {
      if (typeof window === 'undefined' || !window.speechSynthesis) return [];
      cachedVoices = window.speechSynthesis.getVoices() || [];
      return cachedVoices;
    } catch {
      return [];
    }
  }

  if (typeof window !== 'undefined' && window.speechSynthesis) {
    loadVoices();
    try {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    } catch {}
  }

  function pickVoiceFor(langKey) {
    const meta = LANG_META[langKey] || LANG_META.en;
    const voices = cachedVoices.length ? cachedVoices : loadVoices();
    if (!voices.length) return null;
    const targetPrefix = meta.locale.toLowerCase();
    const shortCode = targetPrefix.split('-')[0];
    // 1. Exact regional match (e.g., hi-IN, bn-IN, en-IN)
    let v = voices.find(x => String(x.lang || '').toLowerCase() === targetPrefix);
    if (v) return v;
    // 2. Language family match (hi-*, bn-*)
    v = voices.find(x => String(x.lang || '').toLowerCase().startsWith(shortCode + '-')) ||
        voices.find(x => String(x.lang || '').toLowerCase() === shortCode);
    if (v) return v;
    // 3. Graceful Indian English or English fallback
    v = voices.find(x => String(x.lang || '').toLowerCase() === 'en-in') ||
        voices.find(x => String(x.lang || '').toLowerCase().startsWith('en'));
    return v || null;
  }

  function resolveText(script, langKey) {
    if (!script) return '';
    if (typeof script === 'string') return script;
    const lk = langKey || lang;
    if (lk === 'hi' && script.hiSpoken) return script.hiSpoken;
    if (lk === 'bn' && script.bnSpoken) return script.bnSpoken;
    return script.enText || script.text || script.q || '';
  }

  function stop() {
    speaking = false;
    try {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    } catch {}
    syncAllBars();
  }

  function speak(script, opts) {
    const o = opts || {};
    if (script) lastScript = script;
    if (!o.force && !autoSpeak) return false;
    if (typeof SFX !== 'undefined' && typeof SFX.isMuted === 'function' && SFX.isMuted() && !o.ignoreMute) {
      return false;
    }
    const text = resolveText(script || lastScript, o.lang || lang);
    if (!text) return false;
    if (typeof window === 'undefined' || !window.speechSynthesis || typeof SpeechSynthesisUtterance === 'undefined') {
      return false;
    }
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      const activeLang = o.lang || lang;
      const meta = LANG_META[activeLang] || LANG_META.en;
      const voice = pickVoiceFor(activeLang);
      if (voice) {
        utter.voice = voice;
        utter.lang = voice.lang;
      } else {
        utter.lang = meta.locale;
      }
      utter.rate = activeLang === 'en' ? 1.02 : 0.96;
      utter.pitch = 1.04;
      utter.onstart = () => { speaking = true; syncAllBars(); };
      utter.onend = () => { speaking = false; syncAllBars(); };
      utter.onerror = () => { speaking = false; syncAllBars(); };
      window.speechSynthesis.speak(utter);
      return true;
    } catch {
      speaking = false;
      return false;
    }
  }

  function replay() {
    if (!lastScript) return false;
    return speak(lastScript, { force: true, ignoreMute: true });
  }

  function setLang(nextLang) {
    if (!LANG_META[nextLang]) return lang;
    lang = nextLang;
    try { localStorage.setItem('sg_voice_lang', lang); } catch {}
    syncAllBars();
    if (lastScript) speak(lastScript, { force: true, ignoreMute: true });
    return lang;
  }

  function toggleAutoSpeak() {
    autoSpeak = !autoSpeak;
    try { localStorage.setItem('sg_voice_auto', autoSpeak ? '1' : '0'); } catch {}
    if (!autoSpeak) stop();
    syncAllBars();
    return autoSpeak;
  }

  function syncAllBars() {
    if (typeof document === 'undefined') return;
    document.querySelectorAll('[data-voice-bar]').forEach(bar => {
      const autoBtn = bar.querySelector('[data-vn-auto]');
      if (autoBtn) {
        autoBtn.classList.toggle('on', autoSpeak);
        autoBtn.setAttribute('aria-pressed', autoSpeak ? 'true' : 'false');
        autoBtn.innerHTML = `<span class="vn-wave ${speaking ? 'live' : ''}" aria-hidden="true">${autoSpeak ? '🔊' : '🔇'}</span><span>${autoSpeak ? 'Auto' : 'Off'}</span>`;
      }
      bar.querySelectorAll('[data-vn-lang]').forEach(btn => {
        const active = btn.dataset.vnLang === lang;
        btn.classList.toggle('on', active);
        btn.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
    });
  }

  function renderBar(idPrefix) {
    const pid = String(idPrefix || 'vn');
    return `
      <div class="vn-bar vn-floating-bar" id="${pid}VoiceBar" data-voice-bar="1" data-testid="voice-narrator-bar" role="region" aria-label="Voice Narration Controls">
        <button type="button" class="vn-toggle vn-pill vn-auto ${autoSpeak ? 'on' : ''}" data-vn-auto="1" aria-pressed="${autoSpeak ? 'true' : 'false'}" aria-label="Toggle Auto-Speak">
          <span class="vn-wave" aria-hidden="true">${autoSpeak ? '🔊' : '🔇'}</span><span>${autoSpeak ? 'Auto' : 'Off'}</span>
        </button>
        <div class="vn-langs vn-lang-seg" role="group" aria-label="Voice Language">
          ${['en', 'hi', 'bn'].map(k => `<button type="button" class="vn-lang vn-lang-btn ${lang === k ? 'on' : ''}" data-vn-lang="${k}" aria-pressed="${lang === k ? 'true' : 'false'}">${LANG_META[k].code}</button>`).join('')}
        </div>
        <button type="button" class="vn-replay vn-pill" data-vn-replay="1" aria-label="Replay Voice">↺ Replay</button>
      </div>
    `;
  }

  function bindBar(rootEl) {
    const scope = rootEl || document;
    scope.querySelectorAll('[data-voice-bar]').forEach(bar => {
      if (bar.dataset.vnBound === '1') return;
      bar.dataset.vnBound = '1';
      bar.addEventListener('click', (e) => {
        const autoBtn = e.target.closest('[data-vn-auto]');
        if (autoBtn) {
          const on = toggleAutoSpeak();
          if (typeof playSfx === 'function') playSfx('tap');
          if (typeof toast === 'function') toast(on ? 'Auto-Speak ON' : 'Auto-Speak OFF');
          return;
        }
        const langBtn = e.target.closest('[data-vn-lang]');
        if (langBtn) {
          const next = langBtn.dataset.vnLang;
          setLang(next);
          if (typeof playSfx === 'function') playSfx('tap');
          if (typeof toast === 'function') toast(`Host Voice: ${LANG_META[next]?.label || next.toUpperCase()}`);
          return;
        }
        const repBtn = e.target.closest('[data-vn-replay]');
        if (repBtn) {
          if (typeof playSfx === 'function') playSfx('tap');
          replay();
        }
      });
    });
    syncAllBars();
  }

  return {
    speak,
    stop,
    replay,
    setLang,
    getLang: () => lang,
    isAutoSpeak: () => autoSpeak,
    toggleAutoSpeak,
    resolveText,
    renderBar,
    bindBar
  };
})();

window.VoiceNarrator = VoiceNarrator;
