"use strict";
/* =====================================================================
   COUPLE CHRONICLES — PURE STORY ENGINE, ROOM STATE & PDF BUILDER
   · Pure, deterministic rules (zero DOM / Firestore side effects)
   · Exposed on window.StoryRules & module.exports for node:test
   · Handles 2-seat couple waiting lobby (Partner A / Partner B, zero bots),
     dual-choice resolution, split & reunite scene navigation,
     4-ending scoring evaluator, EN/HI/BN text interpolation, and
     spec-compliant multi-page PDF 1.4 JPEG-stream compilation.
   ===================================================================== */
(function (global) {
  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function sanitizeName(raw, fallback) {
    const s = String(raw || '').trim().slice(0, 28);
    return s || fallback;
  }

  function interpolateNames(text, nameA, nameB) {
    const a = sanitizeName(nameA, 'Partner A');
    const b = sanitizeName(nameB, 'Partner B');
    return String(text || '')
      .replace(/\{A\}/g, a)
      .replace(/\{B\}/g, b);
  }

  function pickLangText(localized, lang, nameA, nameB) {
    if (!localized) return '';
    if (typeof localized === 'string') return interpolateNames(localized, nameA, nameB);
    const l = lang === 'hi' || lang === 'bn' ? lang : 'en';
    const raw = localized[l] || localized.en || localized.hi || localized.bn || '';
    return interpolateNames(raw, nameA, nameB);
  }

  function generateStoryRoomCode() {
    return 'CC' + String(Math.floor(1000 + Math.random() * 9000));
  }

  function createEmptyPartnerSeat() {
    return {
      uid: '',
      name: '',
      avatar: '',
      frame: 'none',
      kind: 'empty',
      role: 'B',
      ready: false,
      isBot: false
    };
  }

  function createCoupleWaitingRoom(story, hostProfile, opts) {
    const o = opts || {};
    const now = Date.now();
    const code = String(o.roomCode || generateStoryRoomCode()).trim().toUpperCase();
    const hostUid = String((hostProfile && hostProfile.uid) || 'local_host');
    const hostName = sanitizeName(hostProfile && hostProfile.name, 'Partner A');
    const id = String(o.roomId || ('room_' + code.toLowerCase() + '_' + Math.random().toString(36).slice(2, 8)));

    const seatA = {
      uid: hostUid,
      name: hostName,
      avatar: String((hostProfile && hostProfile.avatar) || 'av_b1'),
      frame: String((hostProfile && hostProfile.frame) || 'none'),
      kind: 'host',
      role: 'A',
      ready: true,
      isBot: false,
      joinedAt: now
    };
    const seatB = createEmptyPartnerSeat();

    return {
      id,
      code,
      mode: 'couple_chronicles',
      subMode: String((story && story.id) || 'midnight_express_velvet_shadow'),
      storyId: String((story && story.id) || 'midnight_express_velvet_shadow'),
      tierLabel: String((story && story.title) || 'Couple Chronicles'),
      entryCoins: 0,
      maxPlayers: 2,
      hostUid,
      hostName,
      status: 'waiting',
      seats: [seatA, seatB],
      players: [{ uid: hostUid, name: hostName, avatar: seatA.avatar, frame: seatA.frame, score: 0 }],
      storyState: null,
      chat: [
        {
          id: 'sys_' + now,
          type: 'sys',
          text: `${hostName} opened "${(story && story.title) || 'Couple Chronicles'}" (${code})`,
          ts: now
        }
      ],
      createdAt: now,
      updatedAt: now
    };
  }

  function normalizeCoupleRoom(rawRoom) {
    if (!rawRoom || typeof rawRoom !== 'object') return null;
    const room = clone(rawRoom);
    room.mode = 'couple_chronicles';
    room.maxPlayers = 2;
    room.entryCoins = 0;
    if (!Array.isArray(room.seats) || room.seats.length !== 2) {
      const existing = Array.isArray(room.seats) ? room.seats : [];
      const s0 = existing[0] && existing[0].uid ? { ...existing[0], role: 'A', kind: 'host', ready: true, isBot: false } : createEmptyPartnerSeat();
      const s1 = existing[1] && existing[1].uid ? { ...existing[1], role: 'B', isBot: false } : createEmptyPartnerSeat();
      room.seats = [s0, s1];
    } else {
      room.seats[0] = room.seats[0] && room.seats[0].uid
        ? { ...room.seats[0], role: 'A', kind: 'host', ready: true, isBot: false }
        : createEmptyPartnerSeat();
      room.seats[1] = room.seats[1] && room.seats[1].uid
        ? { ...room.seats[1], role: 'B', kind: 'guest', isBot: false }
        : createEmptyPartnerSeat();
    }
    if (!Array.isArray(room.chat)) room.chat = [];
    return room;
  }

  function joinCoupleRoom(rawRoom, guestProfile) {
    const room = normalizeCoupleRoom(rawRoom);
    if (!room) return { ok: false, reason: 'not_found', message: 'Story room not found.' };
    if (room.status === 'closed' || room.status === 'finished') {
      return { ok: false, reason: 'closed', message: 'This story room has ended.' };
    }
    const gUid = String((guestProfile && guestProfile.uid) || '').trim();
    if (!gUid) return { ok: false, reason: 'invalid', message: 'Player profile not ready.' };

    // Already seated (Host or Partner B rejoining)
    const existingIdx = room.seats.findIndex(s => s && s.uid === gUid);
    if (existingIdx >= 0) {
      return { ok: true, alreadySeated: true, seatIndex: existingIdx, role: existingIdx === 0 ? 'A' : 'B', room };
    }

    if (room.status !== 'waiting') {
      return { ok: false, reason: 'started', message: 'This story has already started.' };
    }
    if (room.seats[1] && room.seats[1].kind !== 'empty' && room.seats[1].uid) {
      return { ok: false, reason: 'full', message: 'Both partner seats are already full.' };
    }

    const now = Date.now();
    const gName = sanitizeName(guestProfile && guestProfile.name, 'Partner B');
    room.seats[1] = {
      uid: gUid,
      name: gName,
      avatar: String((guestProfile && guestProfile.avatar) || 'av_g2'),
      frame: String((guestProfile && guestProfile.frame) || 'none'),
      kind: 'guest',
      role: 'B',
      ready: false,
      isBot: false,
      joinedAt: now
    };
    room.players = room.seats
      .filter(s => s && s.uid)
      .map(s => ({ uid: s.uid, name: s.name, avatar: s.avatar, frame: s.frame, score: 0 }));
    room.chat.push({
      id: 'sys_j_' + now,
      type: 'sys',
      text: `${gName} joined as Partner B`,
      ts: now
    });
    room.updatedAt = now;
    return { ok: true, alreadySeated: false, seatIndex: 1, role: 'B', room };
  }

  function togglePartnerReady(rawRoom, targetUid) {
    const room = normalizeCoupleRoom(rawRoom);
    if (!room || room.status !== 'waiting') return { ok: false, reason: 'invalid' };
    const seat = room.seats[1];
    if (!seat || seat.kind === 'empty' || seat.uid !== String(targetUid || '')) {
      return { ok: false, reason: 'not_partner_b' };
    }
    seat.ready = !seat.ready;
    room.updatedAt = Date.now();
    return { ok: true, ready: seat.ready, room };
  }

  function leaveCoupleSeat(rawRoom, targetUid) {
    const room = normalizeCoupleRoom(rawRoom);
    if (!room) return { ok: false };
    const tUid = String(targetUid || '');
    if (room.seats[1] && room.seats[1].uid === tUid) {
      const leftName = room.seats[1].name || 'Partner B';
      room.seats[1] = createEmptyPartnerSeat();
      room.players = room.seats.filter(s => s && s.uid).map(s => ({ uid: s.uid, name: s.name, avatar: s.avatar, frame: s.frame, score: 0 }));
      room.chat.push({ id: 'sys_l_' + Date.now(), type: 'sys', text: `${leftName} left the room`, ts: Date.now() });
      room.updatedAt = Date.now();
      return { ok: true, room };
    }
    return { ok: false };
  }

  function canStartCoupleStory(rawRoom) {
    const room = normalizeCoupleRoom(rawRoom);
    if (!room) return { ok: false, reason: 'not_found', message: 'Room not found' };
    if (room.status !== 'waiting') return { ok: false, reason: 'not_waiting', message: 'Story already started' };
    const seatA = room.seats[0];
    const seatB = room.seats[1];
    if (!seatA || !seatA.uid) return { ok: false, reason: 'no_host', message: 'Host missing' };
    if (!seatB || seatB.kind === 'empty' || !seatB.uid) {
      return { ok: false, reason: 'waiting_partner', message: 'Invite Partner B to Seat 2 to begin' };
    }
    if (!seatB.ready) {
      return { ok: false, reason: 'not_ready', message: `Waiting for ${seatB.name || 'Partner B'} to tap Ready…` };
    }
    return { ok: true, reason: 'ready', message: 'Both partners ready — Start Story!' };
  }

  function createStorySessionState(story, opts) {
    const o = opts || {};
    const partnerA = sanitizeName(o.partnerAName, 'Partner A');
    const partnerB = sanitizeName(o.partnerBName, 'Partner B');
    const startId = (story && story.startSceneId) || 's1_platform';
    return {
      storyId: story ? story.id : 'midnight_express_velvet_shadow',
      playMode: o.playMode === 'solo_duo' ? 'solo_duo' : 'coop',
      partnerAName: partnerA,
      partnerBName: partnerB,
      sceneIdA: startId,
      sceneIdB: startId,
      stepIndex: 0,
      trustScore: 3,
      riskScore: 1,
      cluesFound: [],
      pendingChoices: { A: null, B: null },
      lastOutcome: null,
      history: [],
      completed: false,
      endingId: null,
      startedAt: Date.now(),
      completedAt: null
    };
  }

  function startCoupleStoryRoom(rawRoom, story, actorUid) {
    const room = normalizeCoupleRoom(rawRoom);
    if (!room) return { ok: false, message: 'Room not found' };
    if (room.hostUid !== String(actorUid || '')) {
      return { ok: false, message: 'Only Partner A (Host) can start the story' };
    }
    const check = canStartCoupleStory(room);
    if (!check.ok) return { ok: false, message: check.message };
    const now = Date.now();
    room.status = 'playing';
    room.startedAt = now;
    room.updatedAt = now;
    room.storyState = createStorySessionState(story, {
      playMode: 'coop',
      partnerAName: room.seats[0].name,
      partnerBName: room.seats[1].name
    });
    return { ok: true, room };
  }

  function getSceneForRole(story, state, role) {
    if (!story || !story.scenes || !state) return null;
    const sid = role === 'B' ? state.sceneIdB : state.sceneIdA;
    return story.scenes[sid] || null;
  }

  function getChoicesForRole(scene, role) {
    if (!scene) return [];
    if (scene.isSplit) {
      return Array.isArray(scene.choices) ? scene.choices : [];
    }
    if (role === 'B') return Array.isArray(scene.choicesB) ? scene.choicesB : [];
    return Array.isArray(scene.choicesA) ? scene.choicesA : [];
  }

  function evaluateStoryEnding(story, state) {
    const endings = (story && story.endings) || {};
    const trust = Number(state.trustScore || 0);
    const risk = Number(state.riskScore || 0);
    const clueCount = Array.isArray(state.cluesFound) ? state.cluesFound.length : 0;

    if (trust >= 6 && clueCount >= 3 && risk <= 5 && endings.velvet_vow) {
      return 'velvet_vow';
    }
    if (trust >= 4 && risk >= 5 && endings.shadow_pact) {
      return 'shadow_pact';
    }
    if (trust >= 4 && endings.crimson_escape) {
      return 'crimson_escape';
    }
    if (endings.midnight_ghost) {
      return 'midnight_ghost';
    }
    const keys = Object.keys(endings);
    return keys[0] || 'velvet_vow';
  }

  function lockPartnerChoice(story, rawState, role, choiceId) {
    if (!story || !rawState) return { ok: false, reason: 'invalid' };
    const state = clone(rawState);
    if (state.completed) return { ok: false, reason: 'completed', state };

    const r = role === 'B' ? 'B' : 'A';
    const sceneForRole = getSceneForRole(story, state, r);
    if (!sceneForRole) return { ok: false, reason: 'missing_scene', state };

    const validChoices = getChoicesForRole(sceneForRole, r);
    const picked = validChoices.find(c => c.id === choiceId);
    if (!picked) return { ok: false, reason: 'invalid_choice', state };

    state.pendingChoices = state.pendingChoices || { A: null, B: null };
    state.pendingChoices[r] = choiceId;

    // Wait if the other partner has not locked their choice yet
    if (!state.pendingChoices.A || !state.pendingChoices.B) {
      return {
        ok: true,
        resolved: false,
        waitingFor: r === 'A' ? 'B' : 'A',
        state
      };
    }

    // Both partners locked! Resolve combined outcome & transition
    const sceneA = story.scenes[state.sceneIdA];
    const sceneB = story.scenes[state.sceneIdB];
    const choiceA = getChoicesForRole(sceneA, 'A').find(c => c.id === state.pendingChoices.A);
    const choiceB = getChoicesForRole(sceneB, 'B').find(c => c.id === state.pendingChoices.B);
    if (!choiceA || !choiceB) {
      state.pendingChoices = { A: null, B: null };
      return { ok: false, reason: 'mismatch', state };
    }

    const comboKey = `${choiceA.id}+${choiceB.id}`;
    const pairTable = (sceneA && sceneA.outcomes) || {};
    const pairOutcome = pairTable[comboKey] || pairTable.default || null;

    const deltaTrust = Number(choiceA.trust || 0) + Number(choiceB.trust || 0) + Number((pairOutcome && pairOutcome.trust) || 0);
    const deltaRisk = Number(choiceA.risk || 0) + Number(choiceB.risk || 0) + Number((pairOutcome && pairOutcome.risk) || 0);

    state.trustScore = Math.max(0, Math.min(12, Number(state.trustScore || 0) + deltaTrust));
    state.riskScore = Math.max(0, Math.min(12, Number(state.riskScore || 0) + deltaRisk));

    const newClues = [];
    const clueCandidates = [choiceA.clue, choiceB.clue, pairOutcome && pairOutcome.clue].filter(Boolean);
    clueCandidates.forEach(cl => {
      if (!state.cluesFound.includes(cl)) {
        state.cluesFound.push(cl);
        newClues.push(cl);
      }
    });

    const outcomeText = (pairOutcome && pairOutcome.text) || {
      en: `{A} and {B} move in quiet sync as the midnight rails echo beneath them.`,
      hi: `{A} और {B} के फैसले एक साथ जुड़ते ही आधी रात की ट्रेन में नया मोड़ आ जाता है।`,
      bn: `{A} এবং {B}-এর সিদ্ধান্ত একসাথে মিলতেই মধ্যরাতের ট্রেনে নতুন মোড় আসে।`
    };

    state.history = Array.isArray(state.history) ? state.history : [];
    state.history.push({
      step: state.stepIndex + 1,
      sceneIdA: state.sceneIdA,
      sceneIdB: state.sceneIdB,
      isSplit: Boolean(sceneA && sceneA.isSplit),
      chapterTitleA: sceneA ? sceneA.title : null,
      chapterTitleB: sceneB ? sceneB.title : null,
      choiceAId: choiceA.id,
      choiceBId: choiceB.id,
      choiceALabel: choiceA.label,
      choiceBLabel: choiceB.label,
      outcomeText,
      newClues,
      trustAfter: state.trustScore,
      riskAfter: state.riskScore,
      ts: Date.now()
    });

    state.lastOutcome = {
      comboKey,
      text: outcomeText,
      sfx: (pairOutcome && pairOutcome.sfx) || (newClues.length ? 'clueFound' : 'choiceLock'),
      deltaTrust,
      deltaRisk,
      newClues,
      ts: Date.now()
    };

    state.pendingChoices = { A: null, B: null };
    state.stepIndex = Number(state.stepIndex || 0) + 1;

    // Determine next scene(s)
    const nextSpec = (pairOutcome && pairOutcome.next) || (sceneA && sceneA.next) || 'ENDING';

    if (nextSpec === 'ENDING') {
      const endingId = evaluateStoryEnding(story, state);
      state.completed = true;
      state.endingId = endingId;
      state.completedAt = Date.now();
      return { ok: true, resolved: true, finished: true, endingId, state };
    }

    if (typeof nextSpec === 'object' && nextSpec.A && nextSpec.B) {
      state.sceneIdA = nextSpec.A;
      state.sceneIdB = nextSpec.B;
    } else if (typeof nextSpec === 'string') {
      state.sceneIdA = nextSpec;
      state.sceneIdB = nextSpec;
    }

    return { ok: true, resolved: true, finished: false, state };
  }

  function buildStoryBookData(story, state, lang) {
    const l = lang === 'hi' || lang === 'bn' ? lang : 'en';
    const nameA = sanitizeName(state && state.partnerAName, 'Partner A');
    const nameB = sanitizeName(state && state.partnerBName, 'Partner B');
    const endingObj = (story && story.endings && state && state.endingId && story.endings[state.endingId]) || null;
    const completedDate = new Date((state && state.completedAt) || Date.now()).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });

    const chapters = ((state && state.history) || []).map((h, idx) => ({
      index: idx + 1,
      title: pickLangText(h.chapterTitleA, l, nameA, nameB) || `Chapter ${idx + 1}`,
      splitPartnerBTitle: h.isSplit ? pickLangText(h.chapterTitleB, l, nameA, nameB) : '',
      choiceA: pickLangText(h.choiceALabel, l, nameA, nameB),
      choiceB: pickLangText(h.choiceBLabel, l, nameA, nameB),
      outcome: pickLangText(h.outcomeText, l, nameA, nameB),
      clues: Array.isArray(h.newClues) ? h.newClues : []
    }));

    return {
      storyId: story ? story.id : '',
      storyTitle: pickLangText(story && story.titleLocalized ? story.titleLocalized : (story && story.title), l, nameA, nameB),
      tagline: pickLangText(story && story.taglineLocalized ? story.taglineLocalized : (story && story.tagline), l, nameA, nameB),
      genre: (story && story.genre) || 'Dark Mystery',
      coverArt: (story && story.coverArt) || '',
      partnerAName: nameA,
      partnerBName: nameB,
      completedDate,
      trustScore: Number((state && state.trustScore) || 0),
      riskScore: Number((state && state.riskScore) || 0),
      cluesFound: Array.isArray(state && state.cluesFound) ? state.cluesFound.slice() : [],
      endingId: (state && state.endingId) || '',
      endingBadge: endingObj ? pickLangText(endingObj.badge, l, nameA, nameB) : 'Chronicle Complete',
      endingTitle: endingObj ? pickLangText(endingObj.title, l, nameA, nameB) : 'The Final Chapter',
      endingSummary: endingObj ? pickLangText(endingObj.epilogue, l, nameA, nameB) : '',
      chapters
    };
  }

  /* ===== Pure Zero-Dependency Binary PDF 1.4 Compiler (A4 Multi-Page JPEG Streams) ===== */
  function concatUint8Arrays(chunks) {
    let total = 0;
    for (let i = 0; i < chunks.length; i++) total += chunks[i].length;
    const out = new Uint8Array(total);
    let offset = 0;
    for (let i = 0; i < chunks.length; i++) {
      out.set(chunks[i], offset);
      offset += chunks[i].length;
    }
    return out;
  }

  function asciiBytes(str) {
    const arr = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++) arr[i] = str.charCodeAt(i) & 0xff;
    return arr;
  }

  function base64ToUint8(b64) {
    const clean = String(b64 || '').replace(/^data:image\/jpeg;base64,/i, '');
    if (typeof Buffer !== 'undefined' && typeof Buffer.from === 'function') {
      return new Uint8Array(Buffer.from(clean, 'base64'));
    }
    const bin = atob(clean);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i) & 0xff;
    return out;
  }

  /**
   * Builds a valid PDF 1.4 document containing 1..N A4 portrait pages (595.28 x 841.89 pt),
   * each backed by a JPEG byte stream (`{ jpegBytes | dataUrl, width, height }`).
   */
  function buildPdfFromJpegPages(pages) {
    if (!Array.isArray(pages) || !pages.length) {
      throw new Error('At least one page is required to build a PDF');
    }
    const pageW = 595.28;
    const pageH = 841.89;
    // Object IDs:
    // 1 = Catalog, 2 = Pages
    // For page i (0-based):
    //   imgId = 3 + i * 3
    //   contentId = 4 + i * 3
    //   pageId = 5 + i * 3
    const objects = [];
    const pageIds = [];

    for (let i = 0; i < pages.length; i++) {
      const p = pages[i];
      const jpegBytes = p.jpegBytes instanceof Uint8Array ? p.jpegBytes : base64ToUint8(p.dataUrl);
      const imgW = Math.max(1, Math.round(Number(p.width) || 1240));
      const imgH = Math.max(1, Math.round(Number(p.height) || 1754));
      const imgId = 3 + i * 3;
      const contentId = 4 + i * 3;
      const pageId = 5 + i * 3;
      pageIds.push(pageId);

      const imgHeader = `${imgId} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${imgW} /Height ${imgH} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBytes.length} >>\nstream\n`;
      const imgFooter = `\nendstream\nendobj\n`;
      objects.push({ id: imgId, bytes: concatUint8Arrays([asciiBytes(imgHeader), jpegBytes, asciiBytes(imgFooter)]) });

      const drawCmd = `q\n${pageW.toFixed(2)} 0 0 ${pageH.toFixed(2)} 0 0 cm\n/Im${i} Do\nQ\n`;
      const contentObj = `${contentId} 0 obj\n<< /Length ${drawCmd.length} >>\nstream\n${drawCmd}endstream\nendobj\n`;
      objects.push({ id: contentId, bytes: asciiBytes(contentObj) });

      const pageObj = `${pageId} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageW.toFixed(2)} ${pageH.toFixed(2)}] /Resources << /XObject << /Im${i} ${imgId} 0 R >> >> /Contents ${contentId} 0 R >>\nendobj\n`;
      objects.push({ id: pageId, bytes: asciiBytes(pageObj) });
    }

    const catalogObj = asciiBytes(`1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`);
    const pagesObj = asciiBytes(`2 0 obj\n<< /Type /Pages /Kids [${pageIds.map(id => `${id} 0 R`).join(' ')}] /Count ${pageIds.length} >>\nendobj\n`);

    const ordered = [
      { id: 1, bytes: catalogObj },
      { id: 2, bytes: pagesObj },
      ...objects.sort((a, b) => a.id - b.id)
    ];

    const header = asciiBytes('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');
    const chunks = [header];
    const offsets = [0];
    let cursor = header.length;

    for (let i = 0; i < ordered.length; i++) {
      offsets.push(cursor);
      chunks.push(ordered[i].bytes);
      cursor += ordered[i].bytes.length;
    }

    const xrefStart = cursor;
    let xref = `xref\n0 ${ordered.length + 1}\n0000000000 65535 f \n`;
    for (let i = 1; i < offsets.length; i++) {
      xref += String(offsets[i]).padStart(10, '0') + ' 00000 n \n';
    }
    const trailer = `trailer\n<< /Size ${ordered.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;
    chunks.push(asciiBytes(xref + trailer));

    return concatUint8Arrays(chunks);
  }

  const api = {
    interpolateNames,
    pickLangText,
    generateStoryRoomCode,
    createCoupleWaitingRoom,
    normalizeCoupleRoom,
    joinCoupleRoom,
    togglePartnerReady,
    leaveCoupleSeat,
    canStartCoupleStory,
    createStorySessionState,
    startCoupleStoryRoom,
    getSceneForRole,
    getChoicesForRole,
    evaluateStoryEnding,
    lockPartnerChoice,
    buildStoryBookData,
    buildPdfFromJpegPages
  };

  global.StoryRules = api;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
})(typeof window !== 'undefined' ? window : globalThis);
