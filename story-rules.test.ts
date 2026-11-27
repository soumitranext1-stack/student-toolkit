import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const StoryRules = require('./story-rules.js');
const StoryData = require('./story-data.js');

const story = StoryData.STORIES_CATALOG[0];

const EXPECTED_FILES = [
  'cc_velvet_express_cover_1795752308826.jpg',
  'cc_dining_car_mystery_1795752310029.jpg',
  'cc_compartment_archive_split_1795752310326.jpg',
  'cc_engine_corridor_split_1795752309442.jpg',
  'cc_bridge_reunion_finale_1795752313442.jpg'
];

test('all 5 exact story image files exist on disk and are mapped cleanly in story-data.js', () => {
  for (const filename of EXPECTED_FILES) {
    const abs = path.resolve(process.cwd(), filename);
    assert.equal(fs.existsSync(abs), true, `Missing image file on disk: ${filename}`);
    assert.ok(fs.statSync(abs).size > 1024, `Image file looks empty: ${filename}`);
  }

  assert.equal(story.coverArt, './cc_velvet_express_cover_1795752308826.jpg');
  assert.equal(story.scenes.s1_platform.bg, './cc_velvet_express_cover_1795752308826.jpg');
  assert.equal(story.scenes.s2_dining_car.bg, './cc_dining_car_mystery_1795752310029.jpg');
  assert.equal(story.scenes.s4b_cabin.bg, './cc_compartment_archive_split_1795752310326.jpg');
  assert.equal(story.scenes.s5b_archive.bg, './cc_compartment_archive_split_1795752310326.jpg');
  assert.equal(story.scenes.s3_blackout.bg, './cc_engine_corridor_split_1795752309442.jpg');
  assert.equal(story.scenes.s4a_corridor.bg, './cc_engine_corridor_split_1795752309442.jpg');
  assert.equal(story.scenes.s5a_vestibule.bg, './cc_engine_corridor_split_1795752309442.jpg');
  assert.equal(story.scenes.s6_reunion.bg, './cc_bridge_reunion_finale_1795752313442.jpg');
  assert.equal(story.scenes.s7_confrontation.bg, './cc_bridge_reunion_finale_1795752313442.jpg');
  assert.equal(story.scenes.s8_viaduct_choice.bg, './cc_bridge_reunion_finale_1795752313442.jpg');

  // Every single scene and ending bg must be a relative path pointing to an existing file
  for (const [sid, sc] of Object.entries<any>(story.scenes)) {
    assert.ok(sc.bg.startsWith('./'), `Scene ${sid} bg must be GitHub-Pages-safe relative path`);
    assert.equal(fs.existsSync(path.resolve(process.cwd(), sc.bg)), true, `Scene ${sid} bg file missing: ${sc.bg}`);
  }
  for (const [eid, end] of Object.entries<any>(story.endings)) {
    assert.ok(end.bg.startsWith('./'), `Ending ${eid} bg must be GitHub-Pages-safe relative path`);
    assert.equal(fs.existsSync(path.resolve(process.cwd(), end.bg)), true, `Ending ${eid} bg file missing: ${end.bg}`);
  }
});

test('image candidate resolver returns GitHub Pages relative paths and atmospheric SVG fallback', () => {
  const c1 = StoryRules.resolveChronicleImageCandidates('./cc_velvet_express_cover_1795752308826.jpg');
  assert.equal(c1[0], './cc_velvet_express_cover_1795752308826.jpg');
  assert.ok(c1.includes('./src/assets/images/cc_velvet_express_cover_1795752308826.jpg'));
  assert.ok(c1.every((p: string) => p.startsWith('./')));

  const legacy = StoryRules.resolveChronicleImageCandidates('assets/chronicles/dining-car.jpg');
  assert.equal(legacy[0], './cc_dining_car_mystery_1795752310029.jpg');

  const svgUri = StoryRules.buildFallbackArtworkDataUri('bridge', 'Embers <Under> Moon');
  assert.ok(svgUri.startsWith('data:image/svg+xml;charset=UTF-8,'));
  assert.ok(decodeURIComponent(svgUri).includes('Embers Under Moon'));
});

test('2-seat couple room lifecycle enforces Partner B join, Ready toggle, and Host start', () => {
  const host = { uid: 'u_host', name: 'Aarav', avatar: 'av_b1', frame: 'none' };
  const partner = { uid: 'u_partner', name: 'Meera', avatar: 'av_g2', frame: 'none' };
  const third = { uid: 'u_extra', name: 'Rohan', avatar: 'av_b3', frame: 'none' };

  const room = StoryRules.createCoupleWaitingRoom(story, host, { roomCode: 'CC4821' });
  assert.equal(room.code, 'CC4821');
  assert.equal(room.seats.length, 2);
  assert.equal(room.seats[0].role, 'A');
  assert.equal(room.seats[1].kind, 'empty');
  assert.equal(StoryRules.canStartCoupleStory(room).ok, false);

  const joined = StoryRules.joinCoupleRoom(room, partner);
  assert.equal(joined.ok, true);
  assert.equal(joined.role, 'B');
  assert.equal(joined.room.seats[1].ready, false);
  assert.equal(StoryRules.canStartCoupleStory(joined.room).ok, false);

  // Full room rejects 3rd user
  const fullAttempt = StoryRules.joinCoupleRoom(joined.room, third);
  assert.equal(fullAttempt.ok, false);
  assert.equal(fullAttempt.reason, 'full');

  // Non-host cannot start
  const guestStart = StoryRules.startCoupleStoryRoom(joined.room, story, partner.uid);
  assert.equal(guestStart.ok, false);

  // Partner B taps Ready -> Host starts story
  const readyRes = StoryRules.togglePartnerReady(joined.room, partner.uid);
  assert.equal(readyRes.ok, true);
  assert.equal(readyRes.ready, true);
  assert.equal(StoryRules.canStartCoupleStory(readyRes.room).ok, true);

  const started = StoryRules.startCoupleStoryRoom(readyRes.room, story, host.uid);
  assert.equal(started.ok, true);
  assert.equal(started.room.status, 'playing');
  assert.equal(started.room.storyState.partnerAName, 'Aarav');
  assert.equal(started.room.storyState.partnerBName, 'Meera');
});

function runRoute(pairs: Array<[string, string]>) {
  let state = StoryRules.createStorySessionState(story, {
    playMode: 'coop',
    partnerAName: 'Aarav',
    partnerBName: 'Meera'
  });
  let splitSeen = false;
  let reunionSeen = false;

  for (const [choiceA, choiceB] of pairs) {
    const scA = StoryRules.getSceneForRole(story, state, 'A');
    const scB = StoryRules.getSceneForRole(story, state, 'B');
    if (scA.isSplit && scB.isSplit && scA.id !== scB.id) splitSeen = true;
    if (scA.isReunion) reunionSeen = true;

    const rA = StoryRules.lockPartnerChoice(story, state, 'A', choiceA);
    assert.equal(rA.ok, true, `Choice A failed: ${choiceA} on ${scA.id}`);
    assert.equal(rA.resolved, false);
    state = rA.state;

    const rB = StoryRules.lockPartnerChoice(story, state, 'B', choiceB);
    assert.equal(rB.ok, true, `Choice B failed: ${choiceB} on ${scB.id}`);
    assert.equal(rB.resolved, true);
    state = rB.state;
  }

  return { state, splitSeen, reunionSeen };
}

test('split & reunite navigation works and all 4 distinct endings are reachable', () => {
  // 1. True Ending: velvet_vow
  const r1 = runRoute([
    ['a_shield_board', 'b_inspect_seal'],
    ['a_distract_conductor', 'b_palm_menu'],
    ['a_vow_corridor', 'b_slip_cabin7'],
    ['a_pick_lock', 'b_decode_locket'],
    ['a_disarm_broker', 'b_release_and_take_ledger'],
    ['a_share_truth', 'b_bind_locket'],
    ['a_stand_firm', 'b_override_brakes'],
    ['a_velvet_vow', 'b_keep_vow']
  ]);
  assert.equal(r1.splitSeen, true);
  assert.equal(r1.reunionSeen, true);
  assert.equal(r1.state.completed, true);
  assert.equal(r1.state.endingId, 'velvet_vow');

  // 2. Dark Ending: shadow_pact
  const r2 = runRoute([
    ['a_chase_courier', 'b_hide_envelope'],
    ['a_distract_conductor', 'b_palm_menu'],
    ['a_lure_guards', 'b_pass_hairpin'],
    ['a_pick_lock', 'b_decode_locket'],
    ['a_disarm_broker', 'b_release_and_take_ledger'],
    ['a_share_truth', 'b_set_trap'],
    ['a_seize_crown', 'b_seal_pact'],
    ['a_night_throne', 'b_keep_vow']
  ]);
  assert.equal(r2.state.completed, true);
  assert.equal(r2.state.endingId, 'shadow_pact');

  // 3. Thriller Ending: crimson_escape
  const r3 = runRoute([
    ['a_shield_board', 'b_hide_envelope'],
    ['a_distract_conductor', 'b_check_glasses'],
    ['a_vow_corridor', 'b_slip_cabin7'],
    ['a_pry_trunk', 'b_tap_signal'],
    ['a_disarm_broker', 'b_burn_decoy'],
    ['a_share_truth', 'b_bind_locket'],
    ['a_stand_firm', 'b_override_brakes'],
    ['a_velvet_vow', 'b_vanish_mist']
  ]);
  assert.equal(r3.state.completed, true);
  assert.equal(r3.state.endingId, 'crimson_escape');

  // 4. Mystery Ending: midnight_ghost
  const r4 = runRoute([
    ['a_chase_courier', 'b_hide_envelope'],
    ['a_confront_conductor', 'b_palm_menu'],
    ['a_vow_corridor', 'b_slip_cabin7'],
    ['a_pry_trunk', 'b_tap_signal'],
    ['a_feint_pact', 'b_burn_decoy'],
    ['a_keep_guard', 'b_set_trap'],
    ['a_stand_firm', 'b_override_brakes'],
    ['a_velvet_vow', 'b_keep_vow']
  ]);
  assert.equal(r4.state.completed, true);
  assert.equal(r4.state.endingId, 'midnight_ghost');
});

test('EN/HI/BN name interpolation, StoryBook data, and binary PDF 1.4 builder work cleanly', () => {
  const { state } = runRoute([
    ['a_shield_board', 'b_inspect_seal'],
    ['a_distract_conductor', 'b_palm_menu'],
    ['a_vow_corridor', 'b_slip_cabin7'],
    ['a_pick_lock', 'b_decode_locket'],
    ['a_disarm_broker', 'b_release_and_take_ledger'],
    ['a_share_truth', 'b_bind_locket'],
    ['a_stand_firm', 'b_override_brakes'],
    ['a_velvet_vow', 'b_keep_vow']
  ]);

  const hiTitle = StoryRules.pickLangText(story.scenes.s1_platform.narration, 'hi', 'Aarav', 'Meera');
  const bnTitle = StoryRules.pickLangText(story.scenes.s1_platform.narration, 'bn', 'Aarav', 'Meera');
  assert.ok(hiTitle.includes('Aarav') && hiTitle.includes('Meera'));
  assert.ok(bnTitle.includes('Aarav') && bnTitle.includes('Meera'));

  const book = StoryRules.buildStoryBookData(story, state, 'en');
  assert.equal(book.partnerAName, 'Aarav');
  assert.equal(book.partnerBName, 'Meera');
  assert.equal(book.chapters.length, 8);
  assert.equal(book.coverArt, './cc_velvet_express_cover_1795752308826.jpg');
  assert.equal(book.endingId, 'velvet_vow');

  // Compile minimal valid PDF 1.4 binary stream
  const dummyJpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0xff, 0xd9]);
  const pdfBytes = StoryRules.buildPdfFromJpegPages([
    { jpegBytes: dummyJpeg, width: 1240, height: 1754 },
    { jpegBytes: dummyJpeg, width: 1240, height: 1754 }
  ]);
  const text = Buffer.from(pdfBytes).toString('latin1');
  assert.ok(text.startsWith('%PDF-1.4\n'));
  assert.ok(text.includes('/Count 2'));
  assert.ok(text.trimEnd().endsWith('%%EOF'));
});
