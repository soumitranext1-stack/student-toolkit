"use strict";
/* =====================================================================
   COUPLE CHRONICLES — HUB, 2-SEAT FIRESTORE LOBBY, DUAL-CHOICE READER,
   CONTINUOUS WEB AUDIO BGM, HI/EN/BN VOICE & CUSTOM NAMED PDF EXPORTER
   ===================================================================== */
(function () {
  const UNLOCKED_KEY = 'sg_cc_unlocked_endings_v1';
  const LANG_KEY = 'sg_cc_voice_lang';

  let activeFilter = 'All';
  let activeLang = 'en';
  let activeRoomId = null;
  let activeRoomUnsub = null;
  let activeBroadcast = null;
  let activeStorageHandler = null;
  let activeView = null;
  let activeReaderMode = null; // 'lobby' | 'reader'
  let voiceMuted = false;

  try {
    const savedL = localStorage.getItem(LANG_KEY) || localStorage.getItem('sg_voice_lang');
    if (savedL === 'en' || savedL === 'hi' || savedL === 'bn') activeLang = savedL;
  } catch {}

  function getRules() {
    return window.StoryRules || null;
  }

  function getCatalog() {
    return Array.isArray(window.STORIES_CATALOG) ? window.STORIES_CATALOG : [];
  }

  function getActiveUid() {
    if (typeof auth !== 'undefined' && auth && auth.currentUser && auth.currentUser.uid) {
      return String(auth.currentUser.uid);
    }
    return typeof uid !== 'undefined' ? String(uid) : 'local_me';
  }

  function myProfile() {
    return {
      uid: getActiveUid(),
      name: (typeof me !== 'undefined' && me && me.name) ? String(me.name) : 'Player',
      avatar: (typeof me !== 'undefined' && me && me.avatar) ? String(me.avatar) : 'av_b1',
      frame: (typeof me !== 'undefined' && me && me.frame) ? String(me.frame) : 'none'
    };
  }

  function getUnlockedMap() {
    try {
      const raw = localStorage.getItem(UNLOCKED_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  }

  function markEndingUnlocked(storyId, endingId) {
    if (!storyId || !endingId) return;
    const map = getUnlockedMap();
    const list = Array.isArray(map[storyId]) ? map[storyId] : [];
    if (!list.includes(endingId)) {
      list.push(endingId);
      map[storyId] = list;
      try { localStorage.setItem(UNLOCKED_KEY, JSON.stringify(map)); } catch {}
    }
  }

  function getChannel() {
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        if (!activeBroadcast) activeBroadcast = new BroadcastChannel('sg_couple_chronicles_sync');
        return activeBroadcast;
      }
    } catch {}
    return null;
  }

  /* ===================================================================
     CONTINUOUS AMBIENT BGM SYNTHESIZER (Loops per scene, crossfades
     smoothly on scene mood change, respects mute, zero external audio)
     =================================================================== */
  const StoryBGM = (() => {
    let ctx = null;
    let masterGain = null;
    let activeMood = null;
    let activeNodes = [];
    let loopTimer = 0;
    let bgmMuted = false;

    const MOODS = {
      noir_train: { chords: [[110, 164.81, 220, 261.63], [98, 146.83, 196, 246.94]], rain: true, filter: 520, tempoMs: 4200 },
      velvet_mystery: { chords: [[130.81, 196, 246.94, 311.13], [116.54, 174.61, 233.08, 293.66]], rain: false, filter: 680, tempoMs: 4600 },
      tension_pulse: { chords: [[92.5, 138.59, 185, 220], [87.31, 130.81, 174.61, 207.65]], rain: true, filter: 440, tempoMs: 3000 },
      reunion_strings: { chords: [[146.83, 220, 293.66, 369.99], [130.81, 196, 261.63, 329.63]], rain: false, filter: 860, tempoMs: 4400 },
      ending_glow: { chords: [[174.61, 220, 261.63, 349.23], [196, 246.94, 293.66, 392]], rain: false, filter: 980, tempoMs: 4800 }
    };

    function isGlobalMuted() {
      return bgmMuted || (typeof SFX !== 'undefined' && typeof SFX.isMuted === 'function' && SFX.isMuted());
    }

    function ensureCtx() {
      if (isGlobalMuted()) return null;
      try {
        if (!ctx) {
          const AC = window.AudioContext || window.webkitAudioContext;
          if (!AC) return null;
          ctx = new AC();
        }
        if (ctx.state === 'suspended') ctx.resume().catch(() => {});
        if (!masterGain) {
          masterGain = ctx.createGain();
          masterGain.gain.setValueAtTime(0.0001, ctx.currentTime);
          masterGain.connect(ctx.destination);
        }
        return ctx;
      } catch {
        return null;
      }
    }

    function clearNodes() {
      if (loopTimer) {
        clearInterval(loopTimer);
        loopTimer = 0;
      }
      activeNodes.forEach(n => {
        try { if (n.stop) n.stop(); } catch {}
        try { if (n.disconnect) n.disconnect(); } catch {}
      });
      activeNodes = [];
    }

    function startMood(moodKey) {
      const target = MOODS[moodKey] ? moodKey : 'noir_train';
      if (isGlobalMuted()) {
        activeMood = target;
        stop(false);
        return;
      }
      // Keep looping uninterrupted if already playing the same mood!
      if (activeMood === target && activeNodes.length > 0 && loopTimer) return;

      const c = ensureCtx();
      if (!c || !masterGain) {
        activeMood = target;
        return;
      }

      clearNodes();
      activeMood = target;
      const spec = MOODS[target];
      const now = c.currentTime;

      masterGain.gain.cancelScheduledValues(now);
      masterGain.gain.setValueAtTime(Math.max(0.0001, masterGain.gain.value || 0.0001), now);
      masterGain.gain.linearRampToValueAtTime(0.075, now + 0.9);

      // Soft warm rain noise bed for rainy/storm moods
      if (spec.rain) {
        try {
          const len = c.sampleRate * 2;
          const buf = c.createBuffer(1, len, c.sampleRate);
          const data = buf.getChannelData(0);
          for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * 0.25;
          const src = c.createBufferSource();
          src.buffer = buf;
          src.loop = true;
          const flt = c.createBiquadFilter();
          flt.type = 'bandpass';
          flt.frequency.value = 950;
          flt.Q.value = 0.7;
          const rg = c.createGain();
          rg.gain.value = 0.18;
          src.connect(flt);
          flt.connect(rg);
          rg.connect(masterGain);
          src.start(now);
          activeNodes.push(src, flt, rg);
        } catch {}
      }

      let chordIdx = 0;
      const playChordPad = () => {
        if (isGlobalMuted() || !ctx || !masterGain) return;
        const notes = spec.chords[chordIdx % spec.chords.length];
        chordIdx++;
        const t = ctx.currentTime;
        const durSec = spec.tempoMs / 1000 + 0.7;
        notes.forEach((freq, i) => {
          try {
            const osc = ctx.createOscillator();
            const flt = ctx.createBiquadFilter();
            const g = ctx.createGain();
            osc.type = i === 0 ? 'sine' : 'triangle';
            osc.frequency.setValueAtTime(freq, t);
            flt.type = 'lowpass';
            flt.frequency.setValueAtTime(spec.filter, t);
            g.gain.setValueAtTime(0.0001, t);
            g.gain.linearRampToValueAtTime(i === 0 ? 0.24 : 0.11, t + 1.1);
            g.gain.exponentialRampToValueAtTime(0.0001, t + durSec);
            osc.connect(flt);
            flt.connect(g);
            g.connect(masterGain);
            osc.start(t);
            osc.stop(t + durSec + 0.08);
            activeNodes.push(osc, flt, g);
            if (activeNodes.length > 36) activeNodes.splice(0, 12);
          } catch {}
        });
      };

      playChordPad();
      loopTimer = setInterval(playChordPad, spec.tempoMs);
    }

    function stop(resetMood) {
      clearNodes();
      if (ctx && masterGain) {
        try {
          const now = ctx.currentTime;
          masterGain.gain.cancelScheduledValues(now);
          masterGain.gain.setValueAtTime(0.0001, now);
        } catch {}
      }
      if (resetMood !== false) activeMood = null;
    }

    function setMuted(m) {
      bgmMuted = Boolean(m);
      if (bgmMuted) stop(false);
      else if (activeMood) startMood(activeMood);
      return bgmMuted;
    }

    function isMuted() {
      return isGlobalMuted();
    }

    return { startMood, stop, setMuted, isMuted };
  })();

  /* ===================================================================
     MULTI-LANGUAGE VOICE NARRATION (EN / HI / BN) WITH CLEANUP
     =================================================================== */
  function stopStoryVoice() {
    try {
      if (typeof VoiceNarrator !== 'undefined' && VoiceNarrator && typeof VoiceNarrator.stop === 'function') {
        VoiceNarrator.stop();
      } else if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    } catch {}
  }

  function speakStoryText(scriptObj, force) {
    if (voiceMuted && !force) return;
    if (typeof SFX !== 'undefined' && typeof SFX.isMuted === 'function' && SFX.isMuted() && !force) return;
    const text = scriptObj ? (scriptObj[activeLang] || scriptObj.en || '') : '';
    if (!text) return;

    if (typeof VoiceNarrator !== 'undefined' && VoiceNarrator && typeof VoiceNarrator.speak === 'function') {
      VoiceNarrator.speak(
        { enText: scriptObj.en || text, hiSpoken: scriptObj.hi || text, bnSpoken: scriptObj.bn || text },
        { lang: activeLang, force: true, ignoreMute: Boolean(force) }
      );
      return;
    }

    // Lightweight direct Web Speech fallback if voice-narrator.js wasn't loaded
    try {
      if (!window.speechSynthesis || typeof SpeechSynthesisUtterance === 'undefined') return;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      const locMap = { en: 'en-IN', hi: 'hi-IN', bn: 'bn-IN' };
      u.lang = locMap[activeLang] || 'en-IN';
      u.rate = activeLang === 'en' ? 0.98 : 0.94;
      const voices = window.speechSynthesis.getVoices() || [];
      const prefix = u.lang.split('-')[0].toLowerCase();
      const v = voices.find(x => String(x.lang || '').toLowerCase() === u.lang.toLowerCase()) ||
                voices.find(x => String(x.lang || '').toLowerCase().startsWith(prefix));
      if (v) u.voice = v;
      window.speechSynthesis.speak(u);
    } catch {}
  }

  /* ===================================================================
     FIRESTORE & CROSS-TAB ROOM STORAGE (game_rooms)
     =================================================================== */
  function cacheCoupleRoomLocally(room, remove) {
    if (!room || !room.id) return;
    if (typeof mpRooms !== 'undefined' && Array.isArray(mpRooms)) {
      const idx = mpRooms.findIndex(r => r && r.id === room.id);
      if (remove) {
        if (idx >= 0) mpRooms.splice(idx, 1);
      } else if (idx >= 0) {
        mpRooms[idx] = room;
      } else {
        mpRooms.unshift(room);
      }
      try {
        localStorage.setItem('sg_mp_rooms', JSON.stringify(mpRooms.slice(0, 30)));
      } catch {}
    }
  }

  async function saveCoupleRoom(rawRoom) {
    const Rules = getRules();
    const room = Rules ? Rules.normalizeCoupleRoom(rawRoom) : rawRoom;
    if (!room || !room.id) return null;
    room.updatedAt = Date.now();
    room.entryCoins = 0;

    cacheCoupleRoomLocally(room, false);
    try {
      const ch = getChannel();
      if (ch) ch.postMessage({ type: 'cc_room_update', room });
    } catch {}

    const canCloud = typeof F !== 'undefined' && F && typeof db !== 'undefined' && db && typeof online !== 'undefined' && online;
    if (canCloud) {
      try {
        await F.setDoc(F.doc(db, 'game_rooms', room.id), room);
      } catch (err) {
        console.warn('Couple Chronicles Firestore save warning:', err);
      }
    }
    return room;
  }

  async function deleteCoupleRoom(roomId) {
    if (!roomId) return;
    cacheCoupleRoomLocally({ id: roomId }, true);
    try {
      const ch = getChannel();
      if (ch) ch.postMessage({ type: 'cc_room_delete', roomId });
    } catch {}
    const canCloud = typeof F !== 'undefined' && F && typeof db !== 'undefined' && db && typeof online !== 'undefined' && online;
    if (canCloud) {
      try { await F.deleteDoc(F.doc(db, 'game_rooms', roomId)); } catch {}
    }
  }

  function teardownStorySession() {
    if (typeof activeRoomUnsub === 'function') {
      try { activeRoomUnsub(); } catch {}
    }
    activeRoomUnsub = null;
    activeRoomId = null;
    activeReaderMode = null;
    if (activeStorageHandler) {
      try { window.removeEventListener('storage', activeStorageHandler); } catch {}
      activeStorageHandler = null;
    }
    if (activeBroadcast) {
      activeBroadcast.onmessage = null;
    }
    StoryBGM.stop(true);
    stopStoryVoice();
  }

  function cleanupCoupleChronicles() {
    teardownStorySession();
    if (activeView && typeof activeView.close === 'function') {
      const v = activeView;
      activeView = null;
      try { v.close(); } catch {}
    }
  }

  /* ===================================================================
     LAZY CUSTOM NAMED STORY BOOK PDF GENERATOR (Runs ONLY on Ending Click)
     =================================================================== */
  function loadImageSafe(src) {
    return new Promise((resolve) => {
      if (!src) return resolve(null);
      let settled = false;
      const done = (val) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        resolve(val);
      };
      const timer = setTimeout(() => done(null), 3500);
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => done(img);
      img.onerror = () => done(null);
      img.src = src;
    });
  }

  function wrapCanvasText(ctx, text, maxWidth) {
    const words = String(text || '').split(/\s+/).filter(Boolean);
    const lines = [];
    let current = '';
    for (let i = 0; i < words.length; i++) {
      const test = current ? current + ' ' + words[i] : words[i];
      if (ctx.measureText(test).width > maxWidth && current) {
        lines.push(current);
        current = words[i];
      } else {
        current = test;
      }
    }
    if (current) lines.push(current);
    return lines;
  }

  async function generateAndDownloadStoryBookPdf(story, state) {
    const Rules = getRules();
    if (!Rules || !story || !state) return false;
    const book = Rules.buildStoryBookData(story, state, activeLang);
    const W = 1240;
    const H = 1754;
    const pages = [];

    const coverImg = await loadImageSafe(book.coverArt);
    const endingObj = story.endings && state.endingId ? story.endings[state.endingId] : null;
    const endImg = endingObj && endingObj.bg ? await loadImageSafe(endingObj.bg) : coverImg;

    // --- PAGE 1: CUSTOM NAMED KEEPSAKE COVER & EPILOGUE ---
    const c1 = document.createElement('canvas');
    c1.width = W;
    c1.height = H;
    const ctx1 = c1.getContext('2d');

    // Deep velvet background
    const bgGrad = ctx1.createLinearGradient(0, 0, 0, H);
    bgGrad.addColorStop(0, '#130e1f');
    bgGrad.addColorStop(0.55, '#191124');
    bgGrad.addColorStop(1, '#0b0913');
    ctx1.fillStyle = bgGrad;
    ctx1.fillRect(0, 0, W, H);

    // Ornate double brass border
    ctx1.strokeStyle = 'rgba(216, 163, 93, 0.72)';
    ctx1.lineWidth = 4;
    ctx1.strokeRect(48, 48, W - 96, H - 96);
    ctx1.strokeStyle = 'rgba(216, 163, 93, 0.28)';
    ctx1.lineWidth = 2;
    ctx1.strokeRect(64, 64, W - 128, H - 128);

    // Header label
    ctx1.fillStyle = '#d8a35d';
    ctx1.font = '700 24px "Plus Jakarta Sans", sans-serif';
    ctx1.textAlign = 'center';
    ctx1.fillText('COUPLE CHRONICLES  ·  PERSONALIZED STORY BOOK', W / 2, 132);

    // Cover illustration frame
    const artX = 110;
    const artY = 175;
    const artW = W - 220;
    const artH = 540;
    ctx1.save();
    ctx1.beginPath();
    ctx1.rect(artX, artY, artW, artH);
    ctx1.clip();
    if (coverImg) {
      const scale = Math.max(artW / coverImg.width, artH / coverImg.height);
      const dw = coverImg.width * scale;
      const dh = coverImg.height * scale;
      ctx1.drawImage(coverImg, artX + (artW - dw) / 2, artY + (artH - dh) / 2, dw, dh);
    } else {
      ctx1.fillStyle = '#29172f';
      ctx1.fillRect(artX, artY, artW, artH);
    }
    const scrim = ctx1.createLinearGradient(0, artY + artH * 0.45, 0, artY + artH);
    scrim.addColorStop(0, 'rgba(12, 9, 20, 0)');
    scrim.addColorStop(1, 'rgba(12, 9, 20, 0.88)');
    ctx1.fillStyle = scrim;
    ctx1.fillRect(artX, artY, artW, artH);
    ctx1.restore();
    ctx1.strokeStyle = 'rgba(216, 163, 93, 0.65)';
    ctx1.lineWidth = 3;
    ctx1.strokeRect(artX, artY, artW, artH);

    // Story Title
    ctx1.fillStyle = '#fdf8f2';
    ctx1.font = '800 50px "Plus Jakarta Sans", Georgia, serif';
    const titleLines = wrapCanvasText(ctx1, book.storyTitle, W - 220);
    let y = 795;
    titleLines.forEach(line => {
      ctx1.fillText(line, W / 2, y);
      y += 62;
    });

    // Starring Partner A & Partner B
    ctx1.fillStyle = '#fda4af';
    ctx1.font = '700 34px "Plus Jakarta Sans", sans-serif';
    ctx1.fillText(`Starring  ${book.partnerAName}  &  ${book.partnerBName}`, W / 2, y + 26);

    ctx1.fillStyle = 'rgba(246, 241, 234, 0.72)';
    ctx1.font = '600 22px "Plus Jakarta Sans", sans-serif';
    ctx1.fillText(`${book.genre}  ·  Completed ${book.completedDate}`, W / 2, y + 70);

    // Unlocked Ending Seal Box
    const sealY = y + 118;
    ctx1.fillStyle = 'rgba(201, 51, 91, 0.16)';
    ctx1.fillRect(130, sealY, W - 260, 146);
    ctx1.strokeStyle = 'rgba(216, 163, 93, 0.65)';
    ctx1.lineWidth = 2;
    ctx1.strokeRect(130, sealY, W - 260, 146);

    ctx1.fillStyle = '#fbbf24';
    ctx1.font = '700 22px "Plus Jakarta Sans", sans-serif';
    ctx1.fillText(book.endingBadge.toUpperCase(), W / 2, sealY + 48);
    ctx1.fillStyle = '#fffbeb';
    ctx1.font = '800 36px "Plus Jakarta Sans", Georgia, serif';
    ctx1.fillText(book.endingTitle, W / 2, sealY + 104);

    // Epilogue Prose
    ctx1.textAlign = 'left';
    ctx1.fillStyle = 'rgba(250, 245, 238, 0.92)';
    ctx1.font = '500 26px "Plus Jakarta Sans", sans-serif';
    const epiLines = wrapCanvasText(ctx1, book.endingSummary, W - 260);
    let ey = sealY + 212;
    epiLines.slice(0, 7).forEach(line => {
      ctx1.fillText(line, 130, ey);
      ey += 40;
    });

    // Footer Stats
    ctx1.textAlign = 'center';
    ctx1.fillStyle = '#d8a35d';
    ctx1.font = '700 22px "Plus Jakarta Sans", sans-serif';
    ctx1.fillText(
      `Trust Bond: ${book.trustScore}   ·   Risk Taken: ${book.riskScore}   ·   Clues Uncovered: ${book.cluesFound.length}`,
      W / 2,
      H - 102
    );

    pages.push({ dataUrl: c1.toDataURL('image/jpeg', 0.88), width: W, height: H });

    // --- PAGE 2+: CHAPTER CHRONICLE (Choices & Key Moments) ---
    const perPage = 4;
    const totalChapPages = Math.max(1, Math.ceil(book.chapters.length / perPage));
    for (let pIdx = 0; pIdx < totalChapPages; pIdx++) {
      const slice = book.chapters.slice(pIdx * perPage, (pIdx + 1) * perPage);
      const cp = document.createElement('canvas');
      cp.width = W;
      cp.height = H;
      const ctx = cp.getContext('2d');

      ctx.fillStyle = '#110e1c';
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = 'rgba(216, 163, 93, 0.55)';
      ctx.lineWidth = 3;
      ctx.strokeRect(48, 48, W - 96, H - 96);

      // Subtle top artwork ribbon on last page
      if (pIdx === 0 && endImg) {
        ctx.save();
        ctx.globalAlpha = 0.16;
        ctx.drawImage(endImg, 50, 50, W - 100, 180);
        ctx.restore();
      }

      ctx.textAlign = 'left';
      ctx.fillStyle = '#d8a35d';
      ctx.font = '700 22px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(`OUR JOURNEY  ·  ${book.partnerAName} & ${book.partnerBName}`, 104, 122);

      ctx.fillStyle = '#fdf8f2';
      ctx.font = '800 38px "Plus Jakarta Sans", Georgia, serif';
      ctx.fillText(pIdx === 0 ? 'Key Chapters & Choices' : 'Key Chapters (Continued)', 104, 178);

      ctx.strokeStyle = 'rgba(216, 163, 93, 0.35)';
      ctx.beginPath();
      ctx.moveTo(104, 206);
      ctx.lineTo(W - 104, 206);
      ctx.stroke();

      let cy = 258;
      slice.forEach(ch => {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
        ctx.fillRect(96, cy - 34, W - 192, 306);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(96, cy - 34, W - 192, 306);

        const heading = ch.splitPartnerBTitle
          ? `Chapter ${ch.index}: ${ch.title}  /  ${ch.splitPartnerBTitle}`
          : `Chapter ${ch.index}: ${ch.title}`;
        ctx.fillStyle = '#f6d598';
        ctx.font = '800 25px "Plus Jakarta Sans", sans-serif';
        ctx.fillText(heading.slice(0, 74), 124, cy + 6);

        ctx.fillStyle = '#fda4af';
        ctx.font = '700 21px "Plus Jakarta Sans", sans-serif';
        ctx.fillText(`${book.partnerAName}: ${ch.choiceA}`.slice(0, 86), 124, cy + 52);

        ctx.fillStyle = '#93c5fd';
        ctx.font = '700 21px "Plus Jakarta Sans", sans-serif';
        ctx.fillText(`${book.partnerBName}: ${ch.choiceB}`.slice(0, 86), 124, cy + 90);

        ctx.fillStyle = 'rgba(246, 241, 234, 0.88)';
        ctx.font = '500 21px "Plus Jakarta Sans", sans-serif';
        const outLines = wrapCanvasText(ctx, ch.outcome, W - 260);
        let oy = cy + 136;
        outLines.slice(0, 3).forEach(line => {
          ctx.fillText(line, 124, oy);
          oy += 34;
        });

        cy += 336;
      });

      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(216, 163, 93, 0.72)';
      ctx.font = '600 20px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(`Study Game · Couple Chronicles   —   Page ${pIdx + 2} of ${totalChapPages + 1}`, W / 2, H - 88);

      pages.push({ dataUrl: cp.toDataURL('image/jpeg', 0.88), width: W, height: H });
    }

    const pdfBytes = Rules.buildPdfFromJpegPages(pages);
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const safeSlug = `${book.partnerAName}-${book.partnerBName}`.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'Couple';
    const a = document.createElement('a');
    a.href = url;
    a.download = `Couple-Chronicles-${safeSlug}.pdf`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      try { a.remove(); } catch {}
      try { URL.revokeObjectURL(url); } catch {}
    }, 1500);
    return true;
  }

  /* ===================================================================
     SHARE & INVITE HELPERS FOR COUPLE LOBBY
     =================================================================== */
  function buildCoupleInviteUrl(room) {
    if (!room) return '';
    if (typeof buildRoomInviteUrl === 'function') {
      return buildRoomInviteUrl({
        gameId: 'couple_chronicles',
        roomCode: room.code,
        roomId: room.id,
        mode: room.storyId || room.subMode || ''
      });
    }
    return `?room=${encodeURIComponent(room.code)}&rid=${encodeURIComponent(room.id)}&game=couple_chronicles&mode=${encodeURIComponent(room.storyId || '')}`;
  }

  function shareCoupleInviteWorldChat(room, story) {
    if (!room) return;
    const url = buildCoupleInviteUrl(room);
    const title = (story && story.title) || room.tierLabel || 'Couple Chronicles';
    const txt = `📖 Join Couple Chronicles: "${title}"! Room Code: ${room.code} ${url}`;
    if (typeof sendWorldMsg === 'function') {
      sendWorldMsg(txt, {
        type: 'game_invite',
        gameId: 'couple_chronicles',
        gameName: `Couple Chronicles · ${title}`,
        roomCode: room.code,
        roomId: room.id,
        mode: room.storyId || '',
        stake: 0,
        url
      });
    }
    if (typeof playSfx === 'function') playSfx('chatSend');
    if (typeof toast === 'function') toast(`Invite shared to World Chat (${room.code})`);
  }

  function openInvitePartnerModal(room, story) {
    if (!room || typeof modal !== 'function') return;
    const inviteUrl = buildCoupleInviteUrl(room);
    const title = (story && story.title) || room.tierLabel || 'Couple Chronicles';
    const friendSet = new Set((typeof me !== 'undefined' && Array.isArray(me?.friends)) ? me.friends : []);
    const selfUid = getActiveUid();

    const playersList = (typeof getRealOnlinePlayers === 'function'
      ? getRealOnlinePlayers({ excludeSelf: true })
      : (typeof allUsers === 'function' ? allUsers().filter(u => u && u.uid !== selfUid) : [])
    )
      .filter(u => u && u.uid && u.uid !== selfUid)
      .sort((a, b) => (friendSet.has(b.uid) ? 1 : 0) - (friendSet.has(a.uid) ? 1 : 0))
      .slice(0, 24);

    const m = modal(`Invite Partner · ${esc(room.code)}`, `
      <div class="wrl-inv-modal">
        <div class="wrl-inv-share-row">
          <button type="button" class="btn ok sm" id="ccModCopyLink">Copy Link</button>
          <button type="button" class="btn ghost sm" id="ccModCopyCode">Copy Code</button>
          <button type="button" class="btn gold sm" id="ccModWorld">World Chat</button>
        </div>
        <div class="wrl-inv-sub">Send DM Invite to Partner</div>
        <div class="wrl-inv-list">
          ${playersList.length ? playersList.map(u => {
            const isFr = friendSet.has(u.uid);
            const on = typeof isUserOnline === 'function' ? isUserOnline(u) : Boolean(u.online);
            return `
              <div class="wrl-inv-row">
                <div class="wrl-inv-user">
                  <span class="sg-av-presence-wrap">${typeof av === 'function' ? av(u, 36) : ''}${on ? '<span class="sg-online-dot sm"></span>' : ''}</span>
                  <div class="wrl-inv-meta">
                    <b>${esc(u.name || 'Player')}</b>
                    <small>${isFr ? 'Friend · ' : ''}${on ? 'Online now' : 'Active recently'}</small>
                  </div>
                </div>
                <button type="button" class="btn sm ok" data-cc-dm="${esc(u.uid)}">Send DM</button>
              </div>
            `;
          }).join('') : `<div class="wrl-inv-empty">No other players online right now — copy the Invite Link or post to World Chat.</div>`}
        </div>
      </div>
    `);

    $('#ccModCopyLink', m).onclick = () => {
      if (typeof copyTextClean === 'function') copyTextClean(inviteUrl, 'Invite Link');
      else { try { navigator.clipboard?.writeText(inviteUrl); } catch {} toast('Invite link copied!'); }
    };
    $('#ccModCopyCode', m).onclick = () => {
      if (typeof copyTextClean === 'function') copyTextClean(room.code, 'Room Code');
      else { try { navigator.clipboard?.writeText(room.code); } catch {} toast(`Copied ${room.code}`); }
    };
    $('#ccModWorld', m).onclick = () => {
      shareCoupleInviteWorldChat(room, story);
      m.close();
    };
    $$('[data-cc-dm]', m).forEach(btn => {
      btn.onclick = () => {
        const target = playersList.find(u => u.uid === btn.dataset.ccDm);
        if (!target) return;
        if (typeof sendUniversalRoomInviteToDm === 'function') {
          sendUniversalRoomInviteToDm(target, {
            gameId: 'couple_chronicles',
            gameName: `Couple Chronicles · ${title}`,
            roomCode: room.code,
            roomId: room.id,
            mode: room.storyId || '',
            stake: 0
          });
        }
        btn.textContent = 'Sent ✓';
        btn.disabled = true;
        if (typeof playSfx === 'function') playSfx('chatSend');
        toast(`Couple Chronicle invite sent to ${target.name}`);
      };
    });
  }

  /* ===================================================================
     INTERACTIVE STORY READER (CO-OP FIRESTORE SYNC + SOLO / TEST DUO)
     =================================================================== */
  function openCoupleStoryReader(opts) {
    const Rules = getRules();
    const o = opts || {};
    const story = o.story || (typeof window.getChronicleStoryById === 'function' ? window.getChronicleStoryById(o.storyId) : getCatalog()[0]);
    if (!Rules || !story) return null;

    teardownStorySession();

    const isCoop = o.playMode === 'coop' && o.room && o.room.id;
    let currentRoom = isCoop ? Rules.normalizeCoupleRoom(o.room) : null;
    let state = isCoop && currentRoom.storyState
      ? currentRoom.storyState
      : Rules.createStorySessionState(story, {
          playMode: isCoop ? 'coop' : 'solo_duo',
          partnerAName: o.partnerAName || myProfile().name,
          partnerBName: o.partnerBName || 'Partner B'
        });

    const selfUid = getActiveUid();
    const myRole = isCoop ? (currentRoom.hostUid === selfUid ? 'A' : 'B') : 'A';
    let soloActiveRole = 'A';
    let lastRenderedSceneKey = '';
    let lastEndingUiSig = '';
    let lastRenderedBg = '';
    let bgToggleIdx = 0;
    let busy = false;

    const view = openFullScreenGameView({
      gameId: 'couple_chronicles_reader',
      title: story.title,
      subMeta: isCoop ? `Room ${currentRoom.code} · Partner ${myRole}` : 'Solo / Test Duo',
      statusText: 'Story Live',
      statusTone: 'turn',
      themeClass: 'gfs-theme-chronicles',
      html: `
        <div class="cc-reader-wrap" id="ccReaderWrap" data-testid="cc-story-reader">
          <div class="cc-scene-backdrop" aria-hidden="true">
            <img class="cc-bg-layer" id="ccBg0" alt="" referrerpolicy="no-referrer">
            <img class="cc-bg-layer" id="ccBg1" alt="" referrerpolicy="no-referrer">
            <div class="cc-bg-scrim"></div>
            <div class="cc-atmo-layer" id="ccAtmoLayer"></div>
          </div>
          <div class="cc-reader-content" id="ccReaderContent"></div>
        </div>
      `,
      onClose: () => {
        teardownStorySession();
        if (activeView === view) activeView = null;
        if (typeof clearMyLiveActivity === 'function') clearMyLiveActivity();
        renderCoupleChroniclesHub();
      }
    });

    activeView = view;
    activeReaderMode = 'reader';
    if (isCoop) activeRoomId = currentRoom.id;

    function updateSceneBackdrop(bgUrl, fxName) {
      const img0 = $('#ccBg0', view);
      const img1 = $('#ccBg1', view);
      const atmo = $('#ccAtmoLayer', view);
      if (atmo) {
        atmo.className = 'cc-atmo-layer ' + (fxName ? 'fx-' + fxName : 'fx-rain-fog');
      }
      if (!bgUrl || bgUrl === lastRenderedBg || !img0 || !img1) return;
      lastRenderedBg = bgUrl;
      bgToggleIdx = bgToggleIdx === 0 ? 1 : 0;
      const incoming = bgToggleIdx === 0 ? img0 : img1;
      const outgoing = bgToggleIdx === 0 ? img1 : img0;
      incoming.src = bgUrl;
      incoming.classList.add('active');
      outgoing.classList.remove('active');
    }

    function buildVoiceScript(scene, endingObj) {
      if (endingObj) {
        return {
          en: `${Rules.pickLangText(endingObj.title, 'en', state.partnerAName, state.partnerBName)}. ${Rules.pickLangText(endingObj.epilogue, 'en', state.partnerAName, state.partnerBName)}`,
          hi: `${Rules.pickLangText(endingObj.title, 'hi', state.partnerAName, state.partnerBName)}। ${Rules.pickLangText(endingObj.epilogue, 'hi', state.partnerAName, state.partnerBName)}`,
          bn: `${Rules.pickLangText(endingObj.title, 'bn', state.partnerAName, state.partnerBName)}। ${Rules.pickLangText(endingObj.epilogue, 'bn', state.partnerAName, state.partnerBName)}`
        };
      }
      if (!scene) return null;
      return {
        en: `${Rules.pickLangText(scene.title, 'en', state.partnerAName, state.partnerBName)}. ${Rules.pickLangText(scene.narration, 'en', state.partnerAName, state.partnerBName)} ${scene.dialogue ? Rules.pickLangText(scene.dialogue.line, 'en', state.partnerAName, state.partnerBName) : ''}`,
        hi: `${Rules.pickLangText(scene.title, 'hi', state.partnerAName, state.partnerBName)}। ${Rules.pickLangText(scene.narration, 'hi', state.partnerAName, state.partnerBName)} ${scene.dialogue ? Rules.pickLangText(scene.dialogue.line, 'hi', state.partnerAName, state.partnerBName) : ''}`,
        bn: `${Rules.pickLangText(scene.title, 'bn', state.partnerAName, state.partnerBName)}। ${Rules.pickLangText(scene.narration, 'bn', state.partnerAName, state.partnerBName)} ${scene.dialogue ? Rules.pickLangText(scene.dialogue.line, 'bn', state.partnerAName, state.partnerBName) : ''}`
      };
    }

    function renderToolbarHtml() {
      const audioMuted = StoryBGM.isMuted() && voiceMuted;
      return `
        <div class="cc-toolbar" role="toolbar" aria-label="Story Language and Audio Controls">
          <div class="cc-lang-seg" role="group" aria-label="Narration Language">
            ${['en', 'hi', 'bn'].map(k => `
              <button type="button" class="cc-lang-btn ${activeLang === k ? 'on' : ''}" data-cc-lang="${k}" data-testid="cc-lang-${k}" aria-pressed="${activeLang === k ? 'true' : 'false'}">
                ${k.toUpperCase()}
              </button>
            `).join('')}
          </div>
          <div class="cc-audio-actions">
            <button type="button" class="cc-tool-btn" id="ccReplayVoiceBtn" data-testid="cc-replay-voice" aria-label="Replay Voice Narration">↺ Replay Voice</button>
            <button type="button" class="cc-tool-btn ${audioMuted ? 'is-off' : ''}" id="ccToggleAudioBtn" data-testid="cc-mute-audio" aria-pressed="${audioMuted ? 'true' : 'false'}">
              ${audioMuted ? '🔇 Muted' : '🔊 Audio On'}
            </button>
          </div>
        </div>
      `;
    }

    function bindToolbar(container, currentVoiceScript) {
      $$('[data-cc-lang]', container).forEach(btn => {
        btn.onclick = () => {
          const next = btn.dataset.ccLang;
          if (!next || next === activeLang) return;
          activeLang = next;
          try { localStorage.setItem(LANG_KEY, activeLang); } catch {}
          if (typeof playSfx === 'function') playSfx('tap');
          renderReader(true);
        };
      });

      const replayBtn = $('#ccReplayVoiceBtn', container);
      if (replayBtn) {
        replayBtn.onclick = () => {
          if (typeof playSfx === 'function') playSfx('tap');
          if (currentVoiceScript) speakStoryText(currentVoiceScript, true);
        };
      }

      const audioBtn = $('#ccToggleAudioBtn', container);
      if (audioBtn) {
        audioBtn.onclick = () => {
          const nextOff = !(StoryBGM.isMuted() && voiceMuted);
          voiceMuted = nextOff;
          StoryBGM.setMuted(nextOff);
          if (nextOff) stopStoryVoice();
          else if (currentVoiceScript) speakStoryText(currentVoiceScript, false);
          renderReader(false);
        };
      }
    }

    function resetReaderScroll() {
      const scroller = (view && view.closest ? view.closest('.gfs-stage-scroll') : null)
        || document.querySelector('#gameFsRoot .gfs-stage-scroll');
      if (!scroller) return;
      scroller.scrollTop = 0;
      requestAnimationFrame(() => { scroller.scrollTop = 0; });
    }

    function renderReader(speakNow) {
      const content = $('#ccReaderContent', view);
      if (!content || !state) return;

      // --- COMPLETED ENDING SCREEN ---
      if (state.completed) {
        const endingObj = (story.endings && state.endingId && story.endings[state.endingId]) || Object.values(story.endings)[0];
        markEndingUnlocked(story.id, state.endingId);
        const unlockedCount = (getUnlockedMap()[story.id] || []).length;
        const totalEndings = Object.keys(story.endings || {}).length || 4;
        const clueMap = window.CHRONICLE_CLUE_LABELS || {};

        updateSceneBackdrop(endingObj.bg || story.coverArt, 'rain-embers');
        StoryBGM.startMood('ending_glow');

        const sceneKey = 'ENDING_' + state.endingId;
        const audioMutedSig = StoryBGM.isMuted() && voiceMuted;
        const endingUiSig = `${sceneKey}|${activeLang}|${audioMutedSig ? 1 : 0}`;
        const voiceScript = buildVoiceScript(null, endingObj);
        const isNewEnding = lastRenderedSceneKey !== sceneKey;
        if (isNewEnding) {
          lastRenderedSceneKey = sceneKey;
          if (typeof playSfx === 'function') playSfx('endingReveal');
          speakStoryText(voiceScript, false);
        } else if (speakNow) {
          speakStoryText(voiceScript, true);
        }

        view.setStatus('Ending Unlocked', 'win');

        if (!isNewEnding && lastEndingUiSig === endingUiSig) {
          return;
        }
        lastEndingUiSig = endingUiSig;

        const clueListText = state.cluesFound.length
          ? state.cluesFound.map(cid => Rules.pickLangText(clueMap[cid] || cid, activeLang, state.partnerAName, state.partnerBName)).join(' · ')
          : 'No hidden clues recovered on this route';

        content.innerHTML = `
          ${renderToolbarHtml()}
          <div class="cc-stage-window" style="min-height:90px;flex:0 0 80px"></div>
          <div class="cc-ending-card" data-testid="cc-ending-screen">
            <div class="cc-ending-kicker" data-testid="cc-ending-badge">${esc(Rules.pickLangText(endingObj.badge, activeLang, state.partnerAName, state.partnerBName))} · ${unlockedCount}/${totalEndings} Unlocked</div>
            <h2 class="cc-ending-title" data-testid="cc-ending-title">${esc(Rules.pickLangText(endingObj.title, activeLang, state.partnerAName, state.partnerBName))}</h2>
            <div class="cc-ending-names">${esc(state.partnerAName)} &amp; ${esc(state.partnerBName)}</div>
            <p class="cc-ending-epilogue">${esc(Rules.pickLangText(endingObj.epilogue, activeLang, state.partnerAName, state.partnerBName))}</p>
            <div class="cc-ending-metrics">
              <div class="cc-ending-metric"><b>${state.trustScore}</b><small>Trust Bond</small></div>
              <div class="cc-ending-metric"><b>${state.riskScore}</b><small>Risk Taken</small></div>
              <div class="cc-ending-metric"><b>${state.cluesFound.length}</b><small>Clues Found</small></div>
            </div>
            <div class="cc-ending-clues"><b>Recovered Evidence:</b> ${esc(clueListText)}</div>
            <div class="cc-ending-actions">
              <button type="button" class="cc-btn-gold" id="ccDownloadPdfBtn" data-testid="cc-download-pdf">Download Story Book PDF</button>
              <button type="button" class="cc-btn-crimson" id="ccReplayStoryBtn" data-testid="cc-replay-story">Replay for Another Ending</button>
            </div>
          </div>
        `;

        bindToolbar(content, voiceScript);

        $('#ccDownloadPdfBtn', content).onclick = async (e) => {
          const btn = e.currentTarget;
          btn.disabled = true;
          btn.textContent = 'Generating PDF…';
          try {
            await generateAndDownloadStoryBookPdf(story, state);
            if (typeof playSfx === 'function') playSfx('clueFound');
            toast('Custom Story Book PDF downloaded!');
          } catch (err) {
            console.warn('PDF generation error:', err);
            toast('Could not generate PDF right now');
          } finally {
            btn.disabled = false;
            btn.textContent = 'Download Story Book PDF';
          }
        };

        $('#ccReplayStoryBtn', content).onclick = async () => {
          if (typeof playSfx === 'function') playSfx('tap');
          const freshState = Rules.createStorySessionState(story, {
            playMode: isCoop ? 'coop' : 'solo_duo',
            partnerAName: state.partnerAName,
            partnerBName: state.partnerBName
          });
          state = freshState;
          soloActiveRole = 'A';
          lastRenderedSceneKey = '';
          if (isCoop && currentRoom) {
            currentRoom.storyState = freshState;
            await saveCoupleRoom(currentRoom);
          }
          renderReader(true);
        };
        if (isNewEnding) resetReaderScroll();
        return;
      }

      // --- ACTIVE INTERACTIVE CHAPTER ---
      // In Solo/Test Duo, automatically focus whichever partner hasn't locked yet
      if (!isCoop) {
        if (!state.pendingChoices.A) soloActiveRole = 'A';
        else if (!state.pendingChoices.B) soloActiveRole = 'B';
      }
      const viewRole = isCoop ? myRole : soloActiveRole;
      const scene = Rules.getSceneForRole(story, state, viewRole);
      if (!scene) return;

      const choices = Rules.getChoicesForRole(scene, viewRole);
      const myPickedId = state.pendingChoices ? state.pendingChoices[viewRole] : null;
      const otherRole = viewRole === 'A' ? 'B' : 'A';
      const otherName = otherRole === 'A' ? state.partnerAName : state.partnerBName;
      const myName = viewRole === 'A' ? state.partnerAName : state.partnerBName;
      const otherPickedId = state.pendingChoices ? state.pendingChoices[otherRole] : null;

      updateSceneBackdrop(scene.bg || story.coverArt, scene.fx);
      StoryBGM.startMood(scene.bgm || 'noir_train');

      const voiceScript = buildVoiceScript(scene, null);
      const sceneKey = `${scene.id}_${viewRole}_${state.stepIndex}`;
      const isNewScene = lastRenderedSceneKey !== sceneKey;
      lastEndingUiSig = '';
      if (isNewScene) {
        lastRenderedSceneKey = sceneKey;
        if (typeof playSfx === 'function') playSfx(scene.sfx || 'sceneOpen');
        speakStoryText(voiceScript, false);
      } else if (speakNow) {
        speakStoryText(voiceScript, true);
      }

      view.setStatus(`Ch. ${scene.chapterNo || (state.stepIndex + 1)}/${scene.totalChapters || 8}`, scene.isSplit ? 'warn' : 'turn');
      view.setSubMeta(isCoop ? `Room ${currentRoom.code} · Partner ${myRole} (${myName})` : `Solo Duo · Playing ${myName} (${viewRole})`);

      let syncBannerHtml = '';
      if (myPickedId && !otherPickedId) {
        syncBannerHtml = `<span class="cc-sync-msg waiting" data-testid="cc-waiting-partner">Choice locked · Waiting for ${esc(otherName)}…</span>`;
      } else if (!myPickedId && otherPickedId) {
        syncBannerHtml = `<span class="cc-sync-msg" data-testid="cc-partner-locked">${esc(otherName)} locked choice… your turn!</span>`;
      } else {
        syncBannerHtml = `<span class="cc-sync-msg">Both partners choose together</span>`;
      }

      const splitBannerHtml = scene.isSplit
        ? `<div class="cc-split-banner" data-testid="cc-split-banner"><span>SPLIT PATH · Partner ${viewRole} View</span><span>${esc(otherName)} is in another carriage</span></div>`
        : (scene.isReunion
          ? `<div class="cc-split-banner is-reunion" data-testid="cc-reunion-banner"><span>REUNION SCENE</span><span>${esc(state.partnerAName)} &amp; ${esc(state.partnerBName)} together again</span></div>`
          : '');

      const outcomeHtml = state.lastOutcome && state.lastOutcome.text
        ? `<div class="cc-outcome-toast-card" data-testid="cc-last-outcome">${esc(Rules.pickLangText(state.lastOutcome.text, activeLang, state.partnerAName, state.partnerBName))}</div>`
        : '';

      content.innerHTML = `
        ${renderToolbarHtml()}
        <div class="cc-scene-meta-strip">
          <span>Chapter ${scene.chapterNo || (state.stepIndex + 1)} of ${scene.totalChapters || 8}</span>
          <span>Trust ${state.trustScore} · Risk ${state.riskScore} · Clues ${state.cluesFound.length}</span>
        </div>
        ${splitBannerHtml}
        <div class="cc-stage-window">${outcomeHtml}</div>
        <article class="cc-story-card" data-testid="cc-scene-card" data-scene-id="${esc(scene.id)}">
          <div class="cc-location-kicker">${esc(Rules.pickLangText(scene.location, activeLang, state.partnerAName, state.partnerBName))}</div>
          <h2 class="cc-scene-title" data-testid="cc-scene-title">${esc(Rules.pickLangText(scene.title, activeLang, state.partnerAName, state.partnerBName))}</h2>
          <p class="cc-narration-text" data-testid="cc-scene-narration">${esc(Rules.pickLangText(scene.narration, activeLang, state.partnerAName, state.partnerBName))}</p>
          ${scene.dialogue ? `
            <div class="cc-dialogue-box">
              <span class="cc-dialogue-speaker">${esc(Rules.pickLangText(scene.dialogue.speaker, activeLang, state.partnerAName, state.partnerBName))}</span>
              <p class="cc-dialogue-line">${esc(Rules.pickLangText(scene.dialogue.line, activeLang, state.partnerAName, state.partnerBName))}</p>
            </div>
          ` : ''}
          <div class="cc-partner-status-row">
            <span class="cc-role-label">Partner ${viewRole}: ${esc(myName)}</span>
            ${syncBannerHtml}
          </div>
          <div class="cc-choices-list" data-testid="cc-choices-list">
            ${choices.map((ch, idx) => {
              const isLocked = myPickedId === ch.id;
              return `
                <button type="button" class="cc-choice-btn ${isLocked ? 'is-locked' : ''}" data-cc-choice="${esc(ch.id)}" data-testid="cc-choice-${idx}" ${myPickedId ? 'disabled' : ''}>
                  <span class="cc-choice-main">${isLocked ? '✓ ' : ''}${esc(Rules.pickLangText(ch.label, activeLang, state.partnerAName, state.partnerBName))}</span>
                  ${ch.hint ? `<span class="cc-choice-hint">${esc(Rules.pickLangText(ch.hint, activeLang, state.partnerAName, state.partnerBName))}</span>` : ''}
                </button>
              `;
            }).join('')}
          </div>
        </article>
      `;

      bindToolbar(content, voiceScript);
      if (isNewScene) resetReaderScroll();

      $$('[data-cc-choice]', content).forEach(btn => {
        btn.onclick = async () => {
          if (busy || myPickedId) return;
          const choiceId = btn.dataset.ccChoice;
          if (!choiceId) return;
          busy = true;
          if (typeof playSfx === 'function') playSfx('choiceLock');

          // Remember our choice for this step so simultaneous Firestore writes never drop it
          if (isCoop) {
            localLocksByStep.set(Number(state.stepIndex || 0), choiceId);
          }

          // In Co-Op mode, pull the freshest room snapshot before locking to merge a partner's concurrent lock
          if (isCoop && currentRoom) {
            const canCloud = typeof F !== 'undefined' && F && typeof db !== 'undefined' && db && typeof online !== 'undefined' && online;
            if (canCloud && typeof F.getDoc === 'function') {
              try {
                const freshSnap = await F.getDoc(F.doc(db, 'game_rooms', currentRoom.id));
                if (freshSnap && freshSnap.exists()) {
                  const freshRoom = Rules.normalizeCoupleRoom({ id: freshSnap.id, ...freshSnap.data() });
                  if (freshRoom && freshRoom.storyState) {
                    const freshStep = Number(freshRoom.storyState.stepIndex || 0);
                    const curStep = Number(state.stepIndex || 0);
                    if (freshStep > curStep || freshRoom.storyState.completed) {
                      currentRoom = freshRoom;
                      state = freshRoom.storyState;
                      busy = false;
                      renderReader(false);
                      return;
                    }
                    if (freshStep === curStep) {
                      currentRoom = freshRoom;
                      state = freshRoom.storyState;
                    }
                  }
                }
              } catch {}
            }
          }

          const res = Rules.lockPartnerChoice(story, state, viewRole, choiceId);
          if (!res.ok) {
            busy = false;
            return;
          }
          state = res.state;

          if (res.resolved && state.lastOutcome && state.lastOutcome.sfx && typeof playSfx === 'function') {
            setTimeout(() => playSfx(state.lastOutcome.sfx), 120);
          }

          if (isCoop && currentRoom) {
            currentRoom.storyState = state;
            await saveCoupleRoom(currentRoom);
          }

          busy = false;
          renderReader(false);
        };
      });
    }

    // Track our local choice per stepIndex so concurrent partner locks merge cleanly
    const localLocksByStep = new Map();

    // Live Firestore & Cross-Tab sync for Co-Op Reader
    if (isCoop && currentRoom) {
      const applyIncomingCoopRoom = async (incomingRaw) => {
        if (!incomingRaw || incomingRaw.id !== activeRoomId || activeReaderMode !== 'reader') return;
        const norm = Rules.normalizeCoupleRoom(incomingRaw);
        if (!norm) return;
        currentRoom = norm;
        if (norm.status === 'closed') {
          teardownStorySession();
          view.close();
          toast('Story session ended by Host');
          return;
        }
        if (norm.storyState) {
          const incomingState = norm.storyState;
          const incStep = Number(incomingState.stepIndex || 0);
          const mySavedLock = localLocksByStep.get(incStep);
          const otherRole = myRole === 'A' ? 'B' : 'A';
          const incPending = incomingState.pendingChoices || { A: null, B: null };

          // Conflict self-heal: if partner's simultaneous write cleared our lock on this same step, re-apply & resolve!
          if (!incomingState.completed && mySavedLock && !incPending[myRole] && incPending[otherRole]) {
            const merged = Rules.lockPartnerChoice(story, incomingState, myRole, mySavedLock);
            if (merged.ok) {
              state = merged.state;
              currentRoom.storyState = state;
              renderReader(false);
              await saveCoupleRoom(currentRoom);
              return;
            }
          }

          // Ignore stale snapshot from an earlier stepIndex
          if (!incomingState.completed && incStep < Number(state.stepIndex || 0)) {
            return;
          }

          state = incomingState;
          renderReader(false);
        }
      };

      const canCloud = typeof F !== 'undefined' && F && typeof db !== 'undefined' && db && typeof online !== 'undefined' && online;
      if (canCloud && typeof F.onSnapshot === 'function') {
        activeRoomUnsub = F.onSnapshot(F.doc(db, 'game_rooms', currentRoom.id), (snap) => {
          if (snap && snap.exists()) applyIncomingCoopRoom({ id: snap.id, ...snap.data() });
        }, () => {});
      }
      const ch = getChannel();
      if (ch) {
        ch.onmessage = (ev) => {
          const d = ev && ev.data;
          if (d && d.type === 'cc_room_update' && d.room && d.room.id === activeRoomId) {
            applyIncomingCoopRoom(d.room);
          }
        };
      }
    }

    renderReader(false);
    return view;
  }

  /* ===================================================================
     2-SEAT COUPLE WAITING ROOM LOBBY (Partner A + Empty Partner B Slot)
     =================================================================== */
  function openCoupleLobbyView(initialRoom) {
    const Rules = getRules();
    if (!Rules || !initialRoom) return null;
    teardownStorySession();

    let currentRoom = Rules.normalizeCoupleRoom(initialRoom);
    const story = typeof window.getChronicleStoryById === 'function'
      ? window.getChronicleStoryById(currentRoom.storyId || currentRoom.subMode)
      : getCatalog()[0];
    if (!story) return null;

    activeRoomId = currentRoom.id;
    activeReaderMode = 'lobby';
    let busy = false;
    let closedByEvent = false;
    let hasSeenRemoteDoc = false;
    let hostResyncAttempted = false;

    const view = openFullScreenGameView({
      gameId: 'couple_chronicles_lobby',
      title: `Couple Chronicles`,
      subMeta: `${story.title} · ${currentRoom.code}`,
      statusText: 'Waiting Lobby',
      statusTone: 'turn',
      themeClass: 'gfs-theme-chronicles',
      html: `<div class="cc-lobby-shell" id="ccLobbyShell" data-testid="cc-couple-lobby" data-room-code="${esc(currentRoom.code)}"></div>`,
      onClose: () => {
        teardownStorySession();
        if (activeView === view) activeView = null;
      }
    });
    activeView = view;

    const renderLobby = () => {
      const shell = $('#ccLobbyShell', view);
      if (!shell || !currentRoom) return;
      const selfUid = getActiveUid();
      const isHost = currentRoom.hostUid === selfUid;
      const seatA = currentRoom.seats[0];
      const seatB = currentRoom.seats[1];
      const hasPartnerB = Boolean(seatB && seatB.kind !== 'empty' && seatB.uid);
      const startCheck = Rules.canStartCoupleStory(currentRoom);

      view.setSubMeta(`${currentRoom.code} · ${hasPartnerB ? '2/2' : '1/2'} Seated`);
      view.setStatus(startCheck.ok ? 'Ready!' : 'Waiting…', startCheck.ok ? 'win' : 'turn');

      const avA = typeof av === 'function'
        ? av({ avatar: seatA.avatar || 'av_b1', frame: seatA.frame || 'none', name: seatA.name }, 52)
        : `<div class="wrl-av-fallback">${esc((seatA.name || 'A').slice(0, 1))}</div>`;
      const avB = hasPartnerB && typeof av === 'function'
        ? av({ avatar: seatB.avatar || 'av_g2', frame: seatB.frame || 'none', name: seatB.name }, 52)
        : '';

      shell.innerHTML = `
        <div class="cc-lobby-hero">
          <img src="${esc(story.coverArt)}" alt="${esc(story.title)}" referrerpolicy="no-referrer">
          <div class="cc-lobby-hero-inner">
            <div>
              <div class="cc-meta-line">${esc(story.genre)} <span class="cc-meta-sep">·</span> ${esc(story.duration)} <span class="cc-meta-sep">·</span> 2-Player Story</div>
              <b style="font-size:17px;display:block;margin-top:3px">${esc(story.title)}</b>
            </div>
            <div style="text-align:right">
              <small style="display:block;font-size:11px;color:rgba(246,241,234,0.72)">ROOM CODE</small>
              <span class="cc-lobby-code" data-testid="cc-room-code">${esc(currentRoom.code)}</span>
            </div>
          </div>
        </div>

        <div class="cc-share-grid">
          <button type="button" class="btn sm ok" id="ccCopyLinkBtn" data-testid="cc-copy-link">Copy Link</button>
          <button type="button" class="btn sm ghost" id="ccCopyCodeBtn" data-testid="cc-copy-code">Copy Code</button>
          <button type="button" class="btn sm gold" id="ccSendDmBtn" data-testid="cc-send-dm">Send in DM</button>
          <button type="button" class="btn sm ghost" id="ccWorldShareBtn" data-testid="cc-share-world">World Chat</button>
        </div>

        <div class="cc-couple-seats" data-testid="cc-couple-seats">
          <div class="cc-seat-card is-host" data-testid="cc-seat-0">
            <div class="cc-seat-top">
              <span>Seat 1</span>
              <span class="cc-seat-role">Partner A · HOST</span>
            </div>
            <div>${avA}</div>
            <b class="cc-seat-name">${esc(seatA.name || 'Partner A')}</b>
            <span class="cc-seat-state host">HOST READY</span>
          </div>

          ${hasPartnerB ? `
            <div class="cc-seat-card ${seatB.ready ? 'is-ready' : ''}" data-testid="cc-seat-1">
              <div class="cc-seat-top">
                <span>Seat 2</span>
                <span class="cc-seat-role">Partner B</span>
              </div>
              <div>${avB}</div>
              <b class="cc-seat-name">${esc(seatB.name || 'Partner B')}</b>
              <span class="cc-seat-state ${seatB.ready ? 'ready' : ''}" data-testid="cc-seat-1-state">
                ${seatB.ready ? '✓ READY' : 'Not Ready'}
              </span>
            </div>
          ` : `
            <button type="button" class="cc-seat-card is-empty" id="ccEmptyPartnerBtn" data-testid="cc-seat-1-empty" aria-label="Empty Seat 2 — Invite Partner">
              <div class="cc-seat-top">
                <span>Seat 2</span>
                <span class="cc-seat-role">Partner B</span>
              </div>
              <div class="cc-empty-circle" aria-hidden="true">+</div>
              <b class="cc-seat-name">Empty Slot</b>
              <span class="cc-seat-state">+ Invite Partner</span>
            </button>
          `}
        </div>

        <div class="cc-lobby-dock">
          <div class="cc-dock-hint" data-testid="cc-lobby-hint">
            ${isHost
              ? esc(startCheck.message)
              : (seatB && seatB.ready ? '✓ You are READY! Waiting for Partner A to start the story…' : 'Tap Ready so Partner A can begin the story')}
          </div>
          ${isHost ? `
            <button type="button" class="cc-btn-crimson" id="ccStartStoryBtn" data-testid="cc-start-story-btn" ${!startCheck.ok ? 'disabled' : ''}>
              ▶ Start Story
            </button>
            <div class="cc-dock-sub">
              <button type="button" class="btn ghost sm" id="ccSoloDuoBtn" data-testid="cc-lobby-solo-duo">Solo / Test Duo</button>
              <button type="button" class="btn red sm" id="ccCloseLobbyBtn" data-testid="cc-close-lobby">Close Room</button>
            </div>
          ` : `
            <button type="button" class="btn ${seatB && seatB.ready ? 'ghost' : 'ok'} full" style="min-height:48px;font-weight:800" id="ccPartnerReadyBtn" data-testid="cc-partner-ready-btn">
              ${seatB && seatB.ready ? '✓ READY (Tap to Cancel)' : '✓ Ready'}
            </button>
            <div class="cc-dock-sub">
              <span></span>
              <button type="button" class="btn red sm" id="ccLeaveLobbyBtn" data-testid="cc-leave-lobby">Leave Room</button>
            </div>
          `}
        </div>
      `;

      const inviteUrl = buildCoupleInviteUrl(currentRoom);
      $('#ccCopyLinkBtn', shell).onclick = () => {
        if (typeof copyTextClean === 'function') copyTextClean(inviteUrl, 'Invite Link');
        else { try { navigator.clipboard?.writeText(inviteUrl); } catch {} toast('Invite link copied!'); }
        if (typeof playSfx === 'function') playSfx('tap');
      };
      $('#ccCopyCodeBtn', shell).onclick = () => {
        if (typeof copyTextClean === 'function') copyTextClean(currentRoom.code, 'Room Code');
        else { try { navigator.clipboard?.writeText(currentRoom.code); } catch {} toast(`Copied ${currentRoom.code}`); }
        if (typeof playSfx === 'function') playSfx('tap');
      };
      $('#ccSendDmBtn', shell).onclick = () => openInvitePartnerModal(currentRoom, story);
      $('#ccWorldShareBtn', shell).onclick = () => shareCoupleInviteWorldChat(currentRoom, story);

      const emptyBtn = $('#ccEmptyPartnerBtn', shell);
      if (emptyBtn) emptyBtn.onclick = () => openInvitePartnerModal(currentRoom, story);

      if (isHost) {
        $('#ccStartStoryBtn', shell).onclick = async () => {
          if (busy) return;
          const res = Rules.startCoupleStoryRoom(currentRoom, story, selfUid);
          if (!res.ok) return toast(res.message || 'Partner B must be Ready first');
          busy = true;
          currentRoom = res.room;
          await saveCoupleRoom(currentRoom);
          busy = false;
          closedByEvent = true;
          openCoupleStoryReader({ playMode: 'coop', room: currentRoom, story });
        };

        $('#ccSoloDuoBtn', shell).onclick = async () => {
          closedByEvent = true;
          currentRoom.status = 'closed';
          saveCoupleRoom(currentRoom).catch(() => {});
          openSoloDuoSetupOrStart(story);
        };

        $('#ccCloseLobbyBtn', shell).onclick = async () => {
          if (busy) return;
          busy = true;
          closedByEvent = true;
          currentRoom.status = 'closed';
          await saveCoupleRoom(currentRoom);
          const rid = currentRoom.id;
          setTimeout(() => deleteCoupleRoom(rid), 1500);
          teardownStorySession();
          view.close();
          toast('Couple room closed');
          busy = false;
        };
      } else {
        $('#ccPartnerReadyBtn', shell).onclick = async () => {
          if (busy) return;
          const res = Rules.togglePartnerReady(currentRoom, selfUid);
          if (!res.ok) return;
          busy = true;
          currentRoom = res.room;
          if (typeof playSfx === 'function') playSfx(res.ready ? 'win' : 'tap');
          renderLobby();
          await saveCoupleRoom(currentRoom);
          busy = false;
        };

        $('#ccLeaveLobbyBtn', shell).onclick = async () => {
          if (busy) return;
          busy = true;
          closedByEvent = true;
          const res = Rules.leaveCoupleSeat(currentRoom, selfUid);
          if (res.ok) await saveCoupleRoom(res.room);
          teardownStorySession();
          view.close();
          toast('Left Couple room');
          busy = false;
        };
      }
    };

    const handleIncomingLobbyUpdate = (incomingRaw) => {
      if (closedByEvent || !incomingRaw || incomingRaw.id !== activeRoomId || activeReaderMode !== 'lobby') return;
      const norm = Rules.normalizeCoupleRoom(incomingRaw);
      if (!norm) return;
      currentRoom = norm;
      cacheCoupleRoomLocally(norm, false);

      if (norm.status === 'closed' || norm.status === 'finished') {
        closedByEvent = true;
        teardownStorySession();
        view.close();
        toast('Host closed the story room');
        return;
      }
      if (norm.status === 'playing') {
        closedByEvent = true;
        openCoupleStoryReader({ playMode: 'coop', room: norm, story });
        return;
      }
      renderLobby();
    };

    const canCloud = typeof F !== 'undefined' && F && typeof db !== 'undefined' && db && typeof online !== 'undefined' && online;
    if (canCloud && typeof F.onSnapshot === 'function') {
      activeRoomUnsub = F.onSnapshot(F.doc(db, 'game_rooms', currentRoom.id), (snap) => {
        if (!snap.exists()) {
          const amHost = currentRoom.hostUid === getActiveUid();
          if (amHost && !hasSeenRemoteDoc) {
            if (!hostResyncAttempted) {
              hostResyncAttempted = true;
              saveCoupleRoom(currentRoom).catch(() => {});
            }
            return;
          }
          const fromCache = Boolean(snap.metadata && snap.metadata.fromCache);
          if (!hasSeenRemoteDoc && fromCache) return;
          if (!closedByEvent && activeRoomId === currentRoom.id) {
            closedByEvent = true;
            teardownStorySession();
            view.close();
            toast('Story room is no longer active');
          }
          return;
        }
        hasSeenRemoteDoc = true;
        handleIncomingLobbyUpdate({ id: snap.id, ...snap.data() });
      }, () => {});
    }

    const ch = getChannel();
    if (ch) {
      ch.onmessage = (ev) => {
        const d = ev && ev.data;
        if (d && d.type === 'cc_room_update' && d.room && d.room.id === activeRoomId) {
          handleIncomingLobbyUpdate(d.room);
        }
      };
    }

    activeStorageHandler = (ev) => {
      if (ev.key !== 'sg_mp_rooms' || !ev.newValue) return;
      try {
        const list = JSON.parse(ev.newValue);
        const found = Array.isArray(list) ? list.find(r => r && r.id === activeRoomId) : null;
        if (found) handleIncomingLobbyUpdate(found);
      } catch {}
    };
    window.addEventListener('storage', activeStorageHandler);

    renderLobby();
    return view;
  }

  function openSoloDuoSetupOrStart(story) {
    if (!story) return;
    const defaultA = myProfile().name || 'Partner A';
    if (typeof modal !== 'function') {
      openCoupleStoryReader({ playMode: 'solo_duo', story, partnerAName: defaultA, partnerBName: 'Aria' });
      return;
    }
    const m = modal(`Solo / Test Duo · ${esc(story.title)}`, `
      <div style="display:flex;flex-direction:column;gap:12px">
        <p style="margin:0;font-size:13px;color:var(--mu);line-height:1.45">
          Control both Partner A and Partner B choices on one screen—including both split paths and your custom named PDF Story Book.
        </p>
        <label style="font-size:12px;font-weight:700;display:flex;flex-direction:column;gap:5px">
          Partner A Name (The Shield)
          <input id="ccSoloNameA" maxlength="28" value="${esc(defaultA)}" style="min-height:42px;padding:0 12px;border-radius:10px;border:1px solid var(--bd);background:var(--s2);color:var(--tx)">
        </label>
        <label style="font-size:12px;font-weight:700;display:flex;flex-direction:column;gap:5px">
          Partner B Name (The Cipher)
          <input id="ccSoloNameB" maxlength="28" value="Aria" style="min-height:42px;padding:0 12px;border-radius:10px;border:1px solid var(--bd);background:var(--s2);color:var(--tx)">
        </label>
        <button type="button" class="cc-btn-crimson" id="ccStartSoloConfirm" data-testid="cc-confirm-solo-start">Begin Story</button>
      </div>
    `);
    $('#ccStartSoloConfirm', m).onclick = () => {
      const nameA = String($('#ccSoloNameA', m)?.value || defaultA).trim() || defaultA;
      const nameB = String($('#ccSoloNameB', m)?.value || 'Aria').trim() || 'Aria';
      m.close();
      openCoupleStoryReader({ playMode: 'solo_duo', story, partnerAName: nameA, partnerBName: nameB });
    };
  }

  async function createCoupleStoryRoom(storyId) {
    const Rules = getRules();
    const story = typeof window.getChronicleStoryById === 'function'
      ? window.getChronicleStoryById(storyId)
      : getCatalog()[0];
    if (!Rules || !story) return null;

    if (typeof window.waitForFirebaseReady === 'function') {
      try { await window.waitForFirebaseReady(4500); } catch {}
    }

    const room = Rules.createCoupleWaitingRoom(story, myProfile());
    await saveCoupleRoom(room);
    if (typeof playSfx === 'function') playSfx('tap');
    return openCoupleLobbyView(room);
  }

  async function joinCoupleStoryRoom(opts) {
    const Rules = getRules();
    const o = opts || {};
    const roomId = String(o.roomId || '').trim();
    const cleanCode = String(o.roomCode || '').trim().toUpperCase();
    if (!Rules || (!roomId && !cleanCode)) {
      if (typeof toast === 'function') toast('Enter a valid Couple Room Code');
      return false;
    }

    let liveRoom = null;
    if (typeof window.fetchLiveGameRoom === 'function') {
      liveRoom = await window.fetchLiveGameRoom({ roomId, roomCode: cleanCode });
    }
    if (!liveRoom) {
      if (typeof toast === 'function') toast(`Story room ${cleanCode || ''} not found or has ended.`);
      return false;
    }

    const res = Rules.joinCoupleRoom(liveRoom, myProfile());
    if (!res.ok) {
      if (typeof toast === 'function') toast(res.message || 'Could not join story room');
      return false;
    }

    const saved = await saveCoupleRoom(res.room);
    if (typeof playSfx === 'function') playSfx('tap');

    if (saved.status === 'playing') {
      const story = typeof window.getChronicleStoryById === 'function'
        ? window.getChronicleStoryById(saved.storyId || saved.subMode)
        : getCatalog()[0];
      openCoupleStoryReader({ playMode: 'coop', room: saved, story });
      return true;
    }
    openCoupleLobbyView(saved);
    return true;
  }

  /* ===================================================================
     COUPLE CHRONICLES DEDICATED HUB VIEW (#v-stories)
     =================================================================== */
  function renderCoupleChroniclesHub() {
    const root = document.getElementById('coupleChroniclesRoot');
    if (!root) return;
    const catalog = getCatalog();
    const unlockedMap = getUnlockedMap();
    const genres = ['All', 'Dark Mystery', 'Midnight Thriller', 'Shadow Pact'];
    const filtered = activeFilter === 'All'
      ? catalog
      : catalog.filter(s => String(s.genre || '').toLowerCase() === activeFilter.toLowerCase());
    const featured = filtered[0] || null;
    const rest = filtered.slice(1);

    root.innerHTML = `
      <div class="cc-hub" data-testid="couple-chronicles-hub">
        <div class="cc-hub-header">
          <div class="cc-hub-title-wrap">
            <h2>Couple Chronicles</h2>
            <p class="cc-hub-sub">Interactive 2-player dark mystery &amp; romance stories with split paths, live partner sync, Hindi/English/Bengali voice, and a personalized PDF storybook.</p>
          </div>
          <form class="cc-join-inline" id="ccQuickJoinForm" autocomplete="off">
            <input id="ccQuickJoinInput" data-testid="cc-join-code-input" maxlength="10" placeholder="CC-XXXX" aria-label="Enter Couple Story Room Code">
            <button type="submit" class="btn sm ok" data-testid="cc-join-code-btn">Join Room</button>
          </form>
        </div>

        <div class="cc-filter-bar" role="tablist" aria-label="Filter stories by genre">
          ${genres.map(g => `
            <button type="button" class="cc-filter-btn ${activeFilter === g ? 'on' : ''}" data-cc-genre="${esc(g)}" role="tab" aria-selected="${activeFilter === g ? 'true' : 'false'}">
              ${esc(g)}
            </button>
          `).join('')}
        </div>

        ${featured ? (() => {
          const uCount = (unlockedMap[featured.id] || []).length;
          return `
            <article class="cc-featured-card" data-testid="cc-featured-story" data-story-id="${esc(featured.id)}">
              <div class="cc-featured-media">
                <img src="${esc(featured.coverArt)}" alt="${esc(featured.title)}" referrerpolicy="no-referrer">
              </div>
              <div class="cc-featured-body">
                <div>
                  <div class="cc-meta-line">
                    <span>${esc(featured.genre)}</span>
                    <span class="cc-meta-sep" aria-hidden="true">·</span>
                    <span>${esc(featured.duration)}</span>
                    <span class="cc-meta-sep" aria-hidden="true">·</span>
                    <span>${featured.scenesCount || 11} Scenes</span>
                    <span class="cc-meta-sep" aria-hidden="true">·</span>
                    <span>${uCount}/${featured.endingsCount || 4} Endings Unlocked</span>
                  </div>
                  <h3 style="margin-top:8px">${esc(featured.title)}</h3>
                  <p class="cc-featured-tagline" style="margin-top:8px">${esc(featured.tagline)}</p>
                </div>
                <div class="cc-role-preview">
                  <div class="cc-role-col">
                    <b>Partner A · The Shield</b>
                    <small>Distract, unlock vaults, confront danger in split paths</small>
                  </div>
                  <div class="cc-role-col">
                    <b>Partner B · The Cipher</b>
                    <small>Decode secrets, protect clues, unlock the reunion gate</small>
                  </div>
                </div>
                <div class="cc-card-actions">
                  <button type="button" class="cc-btn-crimson" data-cc-host="${esc(featured.id)}" data-testid="cc-create-room-btn">Create Couple Room</button>
                  <button type="button" class="cc-btn-outline" data-cc-solo="${esc(featured.id)}" data-testid="cc-solo-duo-btn">Solo / Test Duo</button>
                </div>
              </div>
            </article>
          `;
        })() : `
          <div class="cc-empty-filter">
            No stories published in <b>${esc(activeFilter)}</b> yet — switch to <b>All</b> to play <b>The Midnight Express: Velvet &amp; Shadow</b>.
          </div>
        `}

        ${rest.length ? `
          <div class="cc-grid-head">
            <h3>More Chronicles</h3>
            <small>${rest.length} additional ${rest.length === 1 ? 'story' : 'stories'}</small>
          </div>
          <div class="cc-story-grid">
            ${rest.map(st => {
              const uCount = (unlockedMap[st.id] || []).length;
              return `
                <article class="cc-story-tile" data-story-id="${esc(st.id)}">
                  <div class="cc-tile-thumb">
                    <img src="${esc(st.coverArt)}" alt="${esc(st.title)}" referrerpolicy="no-referrer">
                  </div>
                  <div class="cc-tile-body">
                    <div class="cc-meta-line">
                      <span>${esc(st.genre)}</span>
                      <span class="cc-meta-sep" aria-hidden="true">·</span>
                      <span>${esc(st.duration)}</span>
                      <span class="cc-meta-sep" aria-hidden="true">·</span>
                      <span>${uCount}/${st.endingsCount || 4} Endings</span>
                    </div>
                    <h4>${esc(st.title)}</h4>
                    <p>${esc(st.tagline)}</p>
                    <div class="cc-card-actions" style="margin-top:auto;padding-top:6px">
                      <button type="button" class="cc-btn-crimson" data-cc-host="${esc(st.id)}">Create Couple Room</button>
                      <button type="button" class="cc-btn-outline" data-cc-solo="${esc(st.id)}">Solo Duo</button>
                    </div>
                  </div>
                </article>
              `;
            }).join('')}
          </div>
        ` : ''}
      </div>
    `;

    const joinForm = $('#ccQuickJoinForm', root);
    if (joinForm) {
      joinForm.onsubmit = async (e) => {
        e.preventDefault();
        const raw = String($('#ccQuickJoinInput', root)?.value || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
        if (raw.length < 4) return toast('Enter a valid room code (e.g. CC4821)');
        await joinCoupleStoryRoom({ roomCode: raw });
      };
    }

    $$('[data-cc-genre]', root).forEach(btn => {
      btn.onclick = () => {
        activeFilter = btn.dataset.ccGenre || 'All';
        if (typeof playSfx === 'function') playSfx('tap');
        renderCoupleChroniclesHub();
      };
    });

    $$('[data-cc-host]', root).forEach(btn => {
      btn.onclick = () => createCoupleStoryRoom(btn.dataset.ccHost);
    });

    $$('[data-cc-solo]', root).forEach(btn => {
      btn.onclick = () => {
        const st = typeof window.getChronicleStoryById === 'function'
          ? window.getChronicleStoryById(btn.dataset.ccSolo)
          : getCatalog()[0];
        openSoloDuoSetupOrStart(st);
      };
    });
  }

  window.renderCoupleChroniclesHub = renderCoupleChroniclesHub;
  window.createCoupleStoryRoom = createCoupleStoryRoom;
  window.joinCoupleStoryRoom = joinCoupleStoryRoom;
  window.openCoupleStoryReader = openCoupleStoryReader;
  window.cleanupCoupleChronicles = cleanupCoupleChronicles;
})();
