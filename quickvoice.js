"use strict";
/* =====================================================================
   FREE FIRE-STYLE GAME-SPECIFIC AI VOICE QUICK-CHAT (v12)
   - Web Speech API TTS with Male / Female voice tone preference
   - Respects global SFX.isMuted() toggle
   - Clean pop-up callout panel + floating chat bubble over player avatar
   ===================================================================== */

const QUICK_VOICE_PRESETS = {
  jackaroo: [
    { ico: '🆘', text: 'Help me!' },
    { ico: '🔀', text: 'Swap now!' },
    { ico: '🛡️', text: 'Block them!' },
    { ico: '🔥', text: 'Nice move!' },
    { ico: '🏃', text: 'Save me!' },
    { ico: '⚡', text: 'Hurry up!' },
    { ico: '🤝', text: 'Good game!' },
    { ico: '👑', text: 'Finish strong!' }
  ],
  uno: [
    { ico: '💥', text: 'Play +4 / Block them!' },
    { ico: '🚨', text: 'UNO! Watch out!' },
    { ico: '🆘', text: 'Help me!' },
    { ico: '🔥', text: 'Nice move!' },
    { ico: '⚡', text: 'Hurry up!' },
    { ico: '🏃', text: 'Save me!' },
    { ico: '🤝', text: 'Good game!' },
    { ico: '🎯', text: 'My turn!' }
  ],
  ludo_snakes: [
    { ico: '🎲', text: 'Roll a six!' },
    { ico: '🛡️', text: 'Block them!' },
    { ico: '🔥', text: 'Nice move!' },
    { ico: '🏃', text: 'Save me!' },
    { ico: '⚡', text: 'Hurry up!' },
    { ico: '🤝', text: 'Good game!' }
  ],
  pool_8ball: [
    { ico: '🎱', text: 'Watch this shot!' },
    { ico: '😮', text: 'Close one!' },
    { ico: '🎯', text: 'My turn!' },
    { ico: '👏', text: 'Well played!' },
    { ico: '⚡', text: 'Hurry up!' },
    { ico: '🤝', text: 'Good game!' }
  ],
  blitz_dots: [
    { ico: '🧠', text: 'Watch this shot!' },
    { ico: '😮', text: 'Close one!' },
    { ico: '🎯', text: 'My turn!' },
    { ico: '👏', text: 'Well played!' },
    { ico: '🔥', text: 'Nice move!' },
    { ico: '🤝', text: 'Good game!' }
  ],
  squad_arena: [
    { ico: '⚡', text: 'Too fast!' },
    { ico: '😮', text: 'Close one!' },
    { ico: '🎯', text: 'My turn!' },
    { ico: '👏', text: 'Well played!' },
    { ico: '🔥', text: 'Nice streak!' },
    { ico: '🤝', text: 'Good game!' }
  ],
  undercover: [
    { ico: '🕵️', text: 'Nice clue!' },
    { ico: '👀', text: 'I suspect you!' },
    { ico: '🎯', text: 'My turn!' },
    { ico: '🤝', text: 'Trust me!' },
    { ico: '👏', text: 'Well played!' },
    { ico: '⚡', text: 'Pass the mic!' }
  ],
  voice_room: [
    { ico: '👋', text: 'Hello everyone!' },
    { ico: '🎙️', text: 'Pass the mic!' },
    { ico: '🔥', text: 'Nice move!' },
    { ico: '👏', text: 'Well played!' },
    { ico: '🎮', text: 'Let\'s play!' },
    { ico: '🤝', text: 'Good game!' }
  ]
};

const QuickVoice = (() => {
  const TONE_KEY = 'sg_voice_tone';
  let activePanel = null;
  let voicesCache = [];

  function loadVoices() {
    try {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        voicesCache = window.speechSynthesis.getVoices() || [];
      }
    } catch { /* ignore */ }
  }
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    loadVoices();
    try { window.speechSynthesis.onvoiceschanged = loadVoices; } catch { /* ignore */ }
  }

  function getTone() {
    try {
      const t = localStorage.getItem(TONE_KEY);
      return t === 'male' ? 'male' : 'female';
    } catch {
      return 'female';
    }
  }

  function setTone(tone) {
    const clean = tone === 'male' ? 'male' : 'female';
    try { localStorage.setItem(TONE_KEY, clean); } catch { /* ignore */ }
    document.querySelectorAll('[data-voice-tone-label]').forEach(el => {
      el.textContent = clean === 'male' ? 'Male' : 'Female';
    });
    return clean;
  }

  function toggleTone() {
    const next = getTone() === 'female' ? 'male' : 'female';
    setTone(next);
    speak(next === 'male' ? 'Male voice ready!' : 'Female voice ready!', { forceTone: next });
    return next;
  }

  function pickSpeechVoice(tone) {
    loadVoices();
    if (!voicesCache.length) return null;
    const en = voicesCache.filter(v => /^en/i.test(v.lang || ''));
    const pool = en.length ? en : voicesCache;
    const femaleRx = /female|samantha|victoria|karen|moira|zira|aria|jenny|susan|google us english|sara|fiona|tessa|natasha/i;
    const maleRx = /male|daniel|alex|david|mark|fred|guy|christopher|google uk english male|james|ryan|arthur/i;
    const targetRx = tone === 'male' ? maleRx : femaleRx;
    return pool.find(v => targetRx.test(v.name || '')) || pool[0] || null;
  }

  function speak(text, opts = {}) {
    if (!text) return;
    if (typeof SFX !== 'undefined' && typeof SFX.isMuted === 'function' && SFX.isMuted()) return;

    const tone = opts.forceTone || getTone();
    /* Crisp radio-beep cue so callout always feels immediate & game-like */
    if (typeof playSfx === 'function') playSfx('reactionPop');

    try {
      if (typeof window !== 'undefined' && window.speechSynthesis && typeof SpeechSynthesisUtterance === 'function') {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(String(text));
        const v = pickSpeechVoice(tone);
        if (v) u.voice = v;
        u.lang = (v && v.lang) || 'en-US';
        u.pitch = tone === 'male' ? 0.82 : 1.18;
        u.rate = tone === 'male' ? 1.02 : 1.06;
        u.volume = 0.92;
        window.speechSynthesis.speak(u);
      }
    } catch { /* silent fallback on headless browsers */ }
  }

  function getPresets(gameKey) {
    return QUICK_VOICE_PRESETS[gameKey] || QUICK_VOICE_PRESETS.voice_room;
  }

  function showBubble(hostEl, text, speakerName, isMe = true) {
    if (!hostEl) return;
    const prev = hostEl.querySelector('.qv-float-bubble');
    if (prev) prev.remove();
    const b = document.createElement('div');
    b.className = 'qv-float-bubble ' + (isMe ? 'me' : 'other');
    b.setAttribute('role', 'status');
    b.innerHTML = `<span class="qv-fb-wave" aria-hidden="true">🔊</span><span>${speakerName ? `<b>${esc(speakerName)}:</b> ` : ''}${esc(text)}</span>`;
    hostEl.appendChild(b);
    setTimeout(() => { b.classList.add('out'); }, 2500);
    setTimeout(() => { if (b.parentNode) b.remove(); }, 2900);
  }

  function closePanel() {
    if (activePanel && activePanel.parentNode) activePanel.remove();
    activePanel = null;
  }

  function openPanel(anchorEl, gameKey, onPick) {
    if (activePanel && activePanel.dataset.anchorId === (anchorEl?.id || '')) {
      closePanel();
      return;
    }
    closePanel();
    const presets = getPresets(gameKey);
    const tone = getTone();

    const panel = document.createElement('div');
    panel.className = 'qv-panel';
    panel.dataset.anchorId = anchorEl?.id || '';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Quick Voice Chat Callouts');
    panel.innerHTML = `
      <div class="qv-panel-head">
        <b>🎙️ Quick Voice Chat</b>
        <div class="row" style="gap:5px">
          <button type="button" class="qv-tone-chip" data-qv-tone="1" title="Switch Male / Female AI Voice">
            ${tone === 'male' ? '♂ Male' : '♀ Female'}
          </button>
          <button type="button" class="qv-close-x" aria-label="Close Quick Voice Chat">✕</button>
        </div>
      </div>
      <div class="qv-wheel-grid">
        ${presets.map((p, idx) => `
          <button type="button" class="qv-callout-btn" data-qv-idx="${idx}">
            <span class="qv-c-ico" aria-hidden="true">${p.ico}</span>
            <span class="qv-c-txt">${esc(p.text)}</span>
          </button>
        `).join('')}
      </div>
    `;

    const host = anchorEl?.closest('.sheet, .party-fs-shell') || document.body;
    host.appendChild(panel);
    activePanel = panel;

    panel.querySelector('.qv-close-x').onclick = e => { e.stopPropagation(); closePanel(); };
    panel.querySelector('[data-qv-tone]').onclick = e => {
      e.stopPropagation();
      const next = toggleTone();
      e.currentTarget.textContent = next === 'male' ? '♂ Male' : '♀ Female';
    };
    panel.querySelectorAll('[data-qv-idx]').forEach(btn => {
      btn.onclick = e => {
        e.stopPropagation();
        const item = presets[Number(btn.dataset.qvIdx)];
        closePanel();
        if (!item) return;
        speak(item.text);
        if (typeof onPick === 'function') onPick(item.text, item.ico);
      };
    });

    setTimeout(() => {
      const outside = ev => {
        if (!activePanel) { document.removeEventListener('click', outside); return; }
        if (!activePanel.contains(ev.target) && (!anchorEl || !anchorEl.contains(ev.target))) {
          closePanel();
          document.removeEventListener('click', outside);
        }
      };
      document.addEventListener('click', outside);
    }, 30);
  }

  /** Renders compact Mic + Quick Voice Chat bar for every game match */
  function renderGameVoiceBar(uidSuffix) {
    const id = esc(uidSuffix || 'gm');
    return `
      <div class="qv-game-bar" data-qv-bar="${id}">
        <button type="button" class="qv-mic-pill off" id="qvMic_${id}" aria-pressed="false" aria-label="Toggle Microphone">
          <span>🔇</span><em>Mic Off</em>
        </button>
        <button type="button" class="qv-trigger-pill" id="qvBtn_${id}" aria-label="Open Quick Voice Chat">
          <span>🗣️</span><em>Quick Voice</em>
        </button>
        <span class="qv-status-tag" id="qvLast_${id}">Tap Quick Voice when mic is off</span>
      </div>
    `;
  }

  function bindGameVoiceBar(root, uidSuffix, gameKey, bubbleHostSelector) {
    const micBtn = root.querySelector(`#qvMic_${uidSuffix}`);
    const qvBtn = root.querySelector(`#qvBtn_${uidSuffix}`);
    const lastEl = root.querySelector(`#qvLast_${uidSuffix}`);
    let micOn = false;

    if (micBtn) {
      micBtn.onclick = () => {
        micOn = !micOn;
        micBtn.classList.toggle('on', micOn);
        micBtn.classList.toggle('off', !micOn);
        micBtn.setAttribute('aria-pressed', micOn ? 'true' : 'false');
        micBtn.innerHTML = micOn ? '<span>🎙️</span><em>Mic Live</em>' : '<span>🔇</span><em>Mic Off</em>';
        if (typeof playSfx === 'function') playSfx('tap');
        if (lastEl) lastEl.textContent = micOn ? 'Live mic active' : 'Mic muted · Use Quick Voice';
      };
    }

    if (qvBtn) {
      qvBtn.onclick = e => {
        e.stopPropagation();
        if (typeof playSfx === 'function') playSfx('tap');
        openPanel(qvBtn, gameKey, (text, ico) => {
          const host = (bubbleHostSelector && root.querySelector(bubbleHostSelector)) || root.querySelector('.arena-hud-bar') || root;
          showBubble(host, `${ico} ${text}`, me?.name || 'You', true);
          if (lastEl) lastEl.textContent = `${ico} "${text}"`;
        });
      };
    }
  }

  return {
    getTone,
    setTone,
    toggleTone,
    speak,
    getPresets,
    showBubble,
    openPanel,
    closePanel,
    renderGameVoiceBar,
    bindGameVoiceBar
  };
})();
