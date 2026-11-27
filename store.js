"use strict";
/* ===== Luxury Store: VIP Passes, Entry Effects, Frames, Banners, Chests & Spins, Glow Tags (Zero Cluttered Avatars) ===== */

const DURATIONS = {
  '1d': { label: '1 Day', ms: 86400000, mult: 1 },
  '2d': { label: '2 Days', ms: 172800000, mult: 1.8 },
  '1w': { label: '1 Week', ms: 604800000, mult: 4.5 }
};

const VIP_PASS_ITEMS = [
  { id: 'vip_silver_7d', kind: 'vip', value: 'silver', days: 7, name: 'Silver VIP Pass (7D)', basePrice: 800, tier: 'VIP Silver', desc: 'Silver VIP badge, glowing entrance banner in Party Rooms & Chat, +10% bonus daily streak.' },
  { id: 'vip_gold_7d', kind: 'vip', value: 'gold', days: 7, name: 'Gold VIP Pass (7D)', basePrice: 2000, tier: 'VIP Gold', desc: 'Gold VIP crest, priority Party Room seat aura, Golden Entrance Banner + SFX.' },
  { id: 'vip_royal_7d', kind: 'vip', value: 'royal', days: 7, name: 'Royal VIP Sovereign (7D)', basePrice: 5000, tier: 'VIP Royal', desc: 'Royal Crown VIP badge, Dragon Flame entrance show, priority seat halo & 2 free Spin Tickets.' }
];

const ENTRY_FX_ROWS = [
  ['entry-gold', 'Golden Carpet Entry', 120, 'Royal golden spotlight & chime on entering Party Rooms & World Chat', 'Royal Entry'],
  ['entry-cyber', 'Cyber Beam Arrival', 140, 'Electric cyan holographic portal arrival banner', 'Cyber Entry'],
  ['entry-dragon', 'Dragon Flame Entrance', 200, 'Blazing crimson-gold dragon crest banner + roar chime', 'Mythic Entry'],
  ['entry-petals', 'Rose Petals Showcase', 160, 'Luxury floating rose petals arrival for VIP lounges', 'Romantic Entry']
];

const CHEST_SPIN_ITEMS = [
  { id: 'bundle_spin1', kind: 'bundle', value: 'spin_1', name: 'Lucky Spin Ticket ×1', basePrice: 150, tier: 'Spin', desc: 'Use on the Lucky Spin Wheel to win Coins, 3D/7D Frames, VIP trials & Mystery Gifts.' },
  { id: 'bundle_spin5', kind: 'bundle', value: 'spin_5', name: 'Lucky Spin Pack ×5', basePrice: 650, tier: 'Best Value', desc: '5 Lucky Spin Tickets at a discount — instant spin ready!' },
  { id: 'bundle_mystery', kind: 'bundle', value: 'mystery_box', name: 'Royal Mystery Box', basePrice: 400, tier: 'Mystery Box', desc: 'Instant surprise loot: 150–1,500 Gold Coins, 3D Luxury Frame, or Silver VIP trial!' }
];

const STORE_GLOW_TAGS = [
  ['Neon Scholar', 'Neon Scholar', 35, 'Radiant Neon · Electric cyan glow tag', 'Radiant Neon'],
  ['Cyber Genius', 'Cyber Genius', 38, 'Radiant Neon · Pulse circuit lighting tag', 'Radiant Neon'],
  ['Blaze Ace', 'Blaze Ace', 45, 'Solar Flame · Blazing amber lighting tag', 'Solar Flame'],
  ['Solar Legend', 'Solar Legend', 50, 'Solar Flame · Sunburst golden fire glow', 'Solar Flame'],
  ['Aurora Prodigy', 'Aurora Prodigy', 58, 'Celestial Prism · Flowing northern-lights tag', 'Celestial Prism'],
  ['Galaxy Ace', 'Galaxy Ace', 56, 'Celestial Prism · Animated cosmic gradient', 'Celestial Prism'],
  ['Grand Champion', 'Grand Champion', 60, 'Royal Elite · Molten gold spotlight tag', 'Royal Elite'],
  ['Royal Mentor', 'Royal Mentor', 50, 'Royal Elite · Sovereign gold rim glow', 'Royal Elite'],
  ['Emerald Brain', 'Emerald Brain', 44, 'Royal Elite · Radiant emerald gem glow', 'Royal Elite'],
  ['Diamond Ranker', 'Diamond Ranker', 52, 'Royal Elite · Crystalline ice-blue halo', 'Royal Elite'],
  ['Crimson Striker', 'Crimson Striker', 46, 'Royal Elite · Ruby lighting edge tag', 'Royal Elite']
];

const DEFAULT_ITEMS = [];
(function () {
  VIP_PASS_ITEMS.forEach(v => DEFAULT_ITEMS.push(v));
  CHEST_SPIN_ITEMS.forEach(c => DEFAULT_ITEMS.push(c));
  const add = (kind, rows) => rows.forEach(r => {
    const key = `${kind}:${r[0]}`;
    if (typeof isRankExclusiveKey === 'function' && isRankExclusiveKey(key)) return;
    DEFAULT_ITEMS.push({ id: kind + '_' + r[0], name: r[1], kind, value: r[0], basePrice: r[2], desc: r[3], tier: r[4] || '' });
  });
  add('entry', ENTRY_FX_ROWS);
  if (typeof FX_STORE_ROWS !== 'undefined') {
    add('frame', FX_STORE_ROWS.frame || []);
    add('banner', FX_STORE_ROWS.banner || []);
    add('text', FX_STORE_ROWS.text || []);
    add('msg', FX_STORE_ROWS.msg || []);
  }
  add('bio', [
    ['bio-gold', 'Gold Bio Glow', 42, 'Glowing gold bio text'],
    ['bio-cyan', 'Cyan Bio Glow', 42, 'Glowing cyan bio text'],
    ['bio-pink', 'Pink Bio Glow', 44, 'Glowing pink bio text'],
    ['bio-rainbow', 'Rainbow Bio Glow', 52, 'Animated rainbow bio']
  ]);
  add('tag', STORE_GLOW_TAGS);
})();

let customItems = ls.get('sg_store_custom', []).filter(c => c && c.kind !== 'avatar' && !(typeof isRankExclusiveKey === 'function' && isRankExclusiveKey(`${c.kind}:${c.value}`)));
let storeItems = [...DEFAULT_ITEMS, ...customItems];

const CATS = [
  ['all', 'All'],
  ['rings', '💍 Wedding Rings'],
  ['luxgifts', '💎 3D Gifts & Rings'],
  ['vip', '👑 VIP Pass'],
  ['frame', 'Frames'],
  ['banner', 'Banners'],
  ['entry', 'Entry FX'],
  ['bundle', 'Chests & Spins'],
  ['tag', 'Glow Tags'],
  ['text', 'Name Glow'],
  ['msg', 'Msg Border']
];
let storeCat = 'rings';
let ringFilter = 'all';
let ringQuery = '';
let selectedRingId = 'g_wring_diamond';
const itemKey = it => `${it.kind}:${it.value || it.id}`;

function itemPreview(it) {
  if (it.kind === 'vip') {
    const cls = it.value === 'royal' ? 'vip-royal' : (it.value === 'gold' ? 'vip-gold' : 'vip-silver');
    return `<div class="store-vip-stage"><span class="vip-pill ${cls}" style="font-size:14px;padding:6px 16px">👑 ${esc(it.tier)}</span><small style="margin-top:6px;color:var(--mu)">${it.days} Days Active</small></div>`;
  }
  if (it.kind === 'bundle') {
    const ico = it.value === 'mystery_box' ? '🎁' : '🎡';
    return `<div class="store-vip-stage"><div style="font-size:34px;line-height:1">${ico}</div><small style="margin-top:4px;color:var(--gold);font-weight:700">${esc(it.tier)}</small></div>`;
  }
  if (it.kind === 'entry') {
    return `<div class="entry-preview-bar ${esc(it.value)}">✨ ${esc(me.name || 'Player')} entered the Arena!</div>`;
  }
  if (it.kind === 'frame') return av({ avatar: me.avatar || 'av_b1', frame: it.value }, 58);
  if (it.kind === 'banner') return `<div class="bn-box ${esc(it.value)}" style="padding:10px 16px;font-size:12px;width:100%"><b>${esc(it.name)}</b></div>`;
  if (it.kind === 'msg') return `<div class="bub ${esc(it.value)}" style="background:var(--s1);font-size:12px">Luxury glow chat bubble</div>`;
  if (it.kind === 'bio') return `<span class="${esc(it.value)}" style="font-size:13px">Your glowing bio ✨</span>`;
  if (it.kind === 'tag') return `<span class="p-tag ${tagClassFor(it.value)}" style="font-size:13px;padding:6px 15px">${esc(it.value)}</span>`;
  return `<span class="${esc(it.value)}" style="font-size:18px;font-weight:800">${esc(it.name)}</span>`;
}

function renderStoreLuxGiftsShowcase(onlyFeatured) {
  if (typeof ensureWeddingRingsSynced === 'function') ensureWeddingRingsSynced();
  if (typeof GIFT_CATALOG === 'undefined' || typeof giftSvg !== 'function') return '';
  const luxList = GIFT_CATALOG.filter(g => (typeof isLuxuryAnimatedGift === 'function' && isLuxuryAnimatedGift(g)) || g.cat === 'ring')
    .sort((a, b) => b.price - a.price);
  const shown = onlyFeatured ? luxList.slice(0, 6) : luxList;
  const totalRings = typeof RingRules !== 'undefined' ? RingRules.getAllWeddingRings().length : 32;
  const ownedRingCount = getMyOwnedRingIds().length;
  return `
    <div class="store-lux-showcase" style="grid-column:1/-1" data-testid="store-lux-showcase">
      <div class="store-lux-head">
        <div>
          <b>✨ 3D Luxury 10,000+ Gifts &amp; Exclusive Rings</b>
          <small>Photorealistic 3D metallic art · All ${totalRings} upgraded Wedding &amp; Couple Rings synced live</small>
        </div>
        <div class="row wrap" style="gap:6px">
          <button type="button" class="btn gold sm" data-open-wring-tab>💍 Wedding Rings (${totalRings})</button>
          <button type="button" class="wr-bag-btn" data-wr-openbag>🎒 Ring Bag (${ownedRingCount})</button>
          ${onlyFeatured ? `<button type="button" class="btn ghost sm" id="stViewAllLux">View All (${luxList.length})</button>` : ''}
        </div>
      </div>
      <div class="store-lux-grid">
        ${shown.map(g => {
          const is10k = typeof isLuxuryAnimatedGift === 'function' && isLuxuryAnimatedGift(g);
          const isRing = g.cat === 'ring';
          const tMeta = (typeof GIFT_TIERS !== 'undefined' && GIFT_TIERS[g.tier]) || { color: '#ffd36b', name: 'Luxury' };
          const priceHtml = g.sourceLabel
            ? `<span class="wr-source-tag ${g.source === 'family' ? 'family' : 'activity'}">${esc(g.sourceLabel)}</span>`
            : `<span class="slt-price">${isRing ? fmtRingCoins(g.price) : fmtNum(g.price)} 🪙</span>`;
          return `<div class="store-lux-tile ${is10k ? 'lux-10k-card' : ''}" data-lux10k="${is10k ? '1' : '0'}">
            ${is10k && typeof renderLuxury10kFxHtml === 'function' ? renderLuxury10kFxHtml(g, false) : ''}
            <div class="slt-top">
              <span class="slt-badge" style="color:${tMeta.color}">${isRing ? '💍 RING' : (is10k ? '✦ 10k+ LIVE 3D' : '💎 1-to-1 BOND')}</span>
              ${priceHtml}
            </div>
            <div class="slt-art">${giftSvg(g, 66)}</div>
            <b class="slt-name">${esc(g.name)}</b>
            <small class="slt-sub">+${isRing ? fmtRingCoins(g.charm) : fmtNum(g.charm)} Charm${g.bondType ? ' · Request → Accept' : ''}</small>
            <div class="row" style="gap:6px;margin-top:8px;width:100%">
              ${(g.price >= 5000 || isRing) ? `<button type="button" class="btn ghost sm" style="flex:1" data-st-prevgift="${esc(g.id)}">Preview</button>` : ''}
              <button type="button" class="btn gold sm" style="flex:1" data-st-sendgift="${esc(g.id)}">${g.bondType ? 'Request' : 'Send'}</button>
            </div>
          </div>`;
        }).join('')}
      </div>
    </div>
  `;
}

function getMyOwnedRingIds() {
  if (typeof RingRules === 'undefined') return [];
  const gst = typeof getGiftWallStatsForUser === 'function' ? getGiftWallStatsForUser(me) : null;
  return RingRules.getUserOwnedRingIds(me, gst);
}

function persistRingWalletUpdate(toastMsg) {
  saveMe();
  patchUser(uid, { ...base(), coins: me.coins, giftWallet: me.giftWallet || {}, ownedRings: me.ownedRings || [], equippedRing: me.equippedRing || '' });
  dbOp(() => F.setDoc(userRef(uid), { ...base(), coins: me.coins, giftWallet: me.giftWallet || {}, ownedRings: me.ownedRings || [], equippedRing: me.equippedRing || '' }, { merge: true }));
  updateHud();
  if (typeof markTabsDirty === 'function') markTabsDirty(['profile', 'store']);
  if (typeof activeAppTab !== 'undefined' && activeAppTab === 'profile' && typeof buildProfile === 'function') buildProfile();
  if (typeof activeAppTab !== 'undefined' && activeAppTab === 'store') renderStore();
  if (toastMsg) toast(toastMsg);
}

function handleEquipRingAction(ringId) {
  if (typeof RingRules === 'undefined') return false;
  const gst = typeof getGiftWallStatsForUser === 'function' ? getGiftWallStatsForUser(me) : null;
  const res = RingRules.equipRingState(me, ringId, gst);
  if (!res.ok) {
    toast(res.reason === 'not_owned' ? 'Unlock or buy this ring first to equip it' : 'Ring not found');
    return false;
  }
  me.equippedRing = res.equippedRing;
  if (!Array.isArray(me.ownedRings)) me.ownedRings = [];
  if (!me.ownedRings.includes(res.equippedRing)) me.ownedRings.push(res.equippedRing);
  if (typeof playSfx === 'function') playSfx('taskClaim');
  persistRingWalletUpdate(`💍 Equipped ${res.ring.name}!`);
  return true;
}

function handleAcquireRingAction(ringId, opts) {
  if (typeof RingRules === 'undefined') return false;
  const ring = RingRules.getRingById(ringId);
  if (!ring) return false;
  const gst = typeof getGiftWallStatsForUser === 'function' ? getGiftWallStatsForUser(me) : null;
  const res = RingRules.unlockOrBuyRingState(me, ringId, {
    giftStats: gst,
    activityDays: Array.isArray(me.activeDays) ? me.activeDays.length : 1,
    gamesPlayed: Number((typeof stats !== 'undefined' && stats.games_played) || 0),
    payWithCoins: Boolean(opts && opts.payWithCoins)
  });

  if (!res.ok) {
    if (res.reason === 'need_family') {
      toast('Join a Clan/Family to claim free, or unlock with coins!');
      return false;
    }
    if (res.reason === 'insufficient_coins') {
      toast(`Need ${fmtNum(res.needed)} coins (You have ${fmtNum(res.have)})`);
      return false;
    }
    toast('Could not unlock ring');
    return false;
  }

  if (res.cost > 0) {
    me.coins = clampCoins(me.coins - res.cost);
    bumpStat('store_buy');
  }
  me.ownedRings = res.ownedRings;
  me.giftWallet = me.giftWallet && typeof me.giftWallet === 'object' ? me.giftWallet : {};
  me.giftWallet[ring.id] = Math.max(1, Number(me.giftWallet[ring.id] || 0));
  me.equippedRing = ring.id;

  if (typeof playSfx === 'function') playSfx(ring.price >= 50000 ? 'weddingBells' : 'chestOpen');
  const msg = res.mode === 'activity_claim'
    ? `✨ Claimed ${ring.name} from Activity & Equipped!`
    : (res.mode === 'family_claim'
      ? `🛡️ Claimed ${ring.name} from Family & Equipped!`
      : `💍 Unlocked & Equipped ${ring.name}!`);
  persistRingWalletUpdate(msg);
  return true;
}

function fmtRingCoins(n) {
  return String(Math.max(0, Math.round(Number(n || 0))));
}

function renderWeddingRingTileHtml(ring, ownedSet, isSelected, isEquipped) {
  const isOwned = ownedSet.has(ring.id);
  const footHtml = ring.sourceLabel
    ? `<span class="wr-source-tag ${ring.source === 'family' ? 'family' : 'activity'}">${esc(ring.sourceLabel)}</span>`
    : `<span class="wr-price"><span class="wr-coin-dot" aria-hidden="true">✦</span>${fmtRingCoins(ring.price)}</span>`;
  const cornerMark = isEquipped
    ? `<span class="wr-corner-mark">EQUIPPED</span>`
    : (isOwned ? `<span class="wr-corner-mark owned">OWNED</span>` : '');
  const artHtml = typeof RingArt !== 'undefined'
    ? RingArt.renderRingSvg(ring, 88, { plate: true })
    : (typeof giftSvg === 'function' ? giftSvg(ring, 68) : '');

  return `<button type="button" class="wr-card ${isSelected ? 'selected' : ''} ${isEquipped ? 'equipped' : ''}" data-wr-select="${esc(ring.id)}" style="--ring-glow:${esc(ring.glow || '#7dd3fc')}" aria-pressed="${isSelected ? 'true' : 'false'}" aria-label="${esc(ring.name)}">
    <div class="wr-stage-wrap">
      ${cornerMark}
      ${artHtml}
    </div>
    <span class="wr-name">${esc(ring.name)}</span>
    <div class="wr-foot">${footHtml}</div>
  </button>`;
}

function renderWeddingRingInspectorHtml(ring, ownedSet) {
  if (!ring) return '';
  const isOwned = ownedSet.has(ring.id);
  const isEquipped = me.equippedRing === ring.id;
  const artHtml = typeof RingArt !== 'undefined'
    ? RingArt.renderRingSvg(ring, 82, { plate: true })
    : '';
  let statusTxt = ring.group === 'luxury' ? 'Luxury Collection' : 'Classic Collection';
  let statusCls = '';
  if (isEquipped) { statusTxt = 'Equipped on Profile'; statusCls = 'eq'; }
  else if (isOwned) { statusTxt = 'In Your Ring Bag'; statusCls = 'fam'; }
  else if (ring.sourceLabel) { statusTxt = ring.sourceLabel; statusCls = ring.source === 'family' ? 'fam' : ''; }

  let primaryBtnHtml = '';
  if (isEquipped) {
    primaryBtnHtml = `<button type="button" class="btn sm" disabled>Equipped ✓</button>`;
  } else if (isOwned) {
    primaryBtnHtml = `<button type="button" class="btn gold sm" data-wr-equip="${esc(ring.id)}">Equip Ring</button>`;
  } else if (ring.source === 'activity') {
    primaryBtnHtml = `<button type="button" class="btn gold sm" data-wr-acquire="${esc(ring.id)}">Claim Activity Ring</button>`;
  } else if (ring.source === 'family') {
    primaryBtnHtml = me.clanId
      ? `<button type="button" class="btn gold sm" data-wr-acquire="${esc(ring.id)}">Claim Family Ring</button>`
      : `<button type="button" class="btn gold sm" data-wr-acquire="${esc(ring.id)}" data-wr-pay="1">Unlock · ${fmtRingCoins(ring.price)} 🪙</button>`;
  } else {
    primaryBtnHtml = `<button type="button" class="btn gold sm" data-wr-acquire="${esc(ring.id)}">Buy &amp; Equip · ${fmtRingCoins(ring.price)} 🪙</button>`;
  }

  return `<div class="wr-inspector" style="--sel-glow:${esc(ring.glow || '#7dd3fc')}" data-testid="wedding-ring-inspector">
    ${artHtml}
    <div class="wr-insp-meta">
      <div class="wr-insp-title-row">
        <b>${esc(ring.name)}</b>
        <span class="wr-insp-status ${statusCls}">${esc(statusTxt)}</span>
      </div>
      <p class="wr-insp-lore">${esc(ring.lore || 'Exclusive 1-to-1 Couple & Wedding Ring.')}</p>
      <div class="wr-insp-stats">
        <span>${ring.sourceLabel ? `<strong>${esc(ring.sourceLabel)}</strong>` : `<strong>${fmtRingCoins(ring.price)} 🪙</strong>`}</span>
        <span aria-hidden="true">·</span>
        <span><em>+${fmtRingCoins(ring.charm)} Charm</em></span>
        <span aria-hidden="true">·</span>
        <span>${ring.weddingDays || 7}d Wedding Room</span>
      </div>
    </div>
    <div class="wr-insp-acts">
      ${primaryBtnHtml}
      <div class="wr-insp-subacts">
        <button type="button" class="btn ghost sm" data-wr-preview="${esc(ring.id)}">Preview 3D</button>
        <button type="button" class="btn sm" data-wr-request="${esc(ring.id)}">Couple Req</button>
      </div>
    </div>
  </div>`;
}

function renderWeddingRingsBoutique(onlyFeatured) {
  if (typeof RingRules === 'undefined') return '';
  const allRings = RingRules.getAllWeddingRings();
  const ownedIds = getMyOwnedRingIds();
  const ownedSet = new Set(ownedIds);

  if (onlyFeatured) {
    const featured = allRings.slice(0, 6);
    return `
      <div class="wr-boutique" data-testid="wedding-rings-featured">
        <div class="wr-header">
          <div class="wr-header-copy">
            <b>💍 Wedding &amp; Couple Rings (${allRings.length})</b>
            <small>Glowing SVG jewelry collection · Equip on Profile or send 1-to-1 Couple Requests</small>
          </div>
          <div class="wr-header-acts">
            <button type="button" class="wr-bag-btn" data-wr-openbag>🎒 Ring Bag (${ownedIds.length})</button>
            <button type="button" class="btn ghost sm" id="stViewAllRings">View All (${allRings.length})</button>
          </div>
        </div>
        <div class="wr-grid">
          ${featured.map(r => renderWeddingRingTileHtml(r, ownedSet, selectedRingId === r.id, me.equippedRing === r.id)).join('')}
        </div>
      </div>
    `;
  }

  const filtered = RingRules.filterWeddingRings(allRings, {
    filter: ringFilter,
    query: ringQuery,
    ownedIds
  });
  const activeRing = filtered.find(r => r.id === selectedRingId) || RingRules.getRingById(selectedRingId) || filtered[0] || allRings[0];
  if (activeRing) selectedRingId = activeRing.id;

  const filterChips = [
    ['all', `All (${allRings.length})`],
    ['luxury', 'Luxury'],
    ['classic', 'Classic'],
    ['activity', 'From Activity'],
    ['family', 'From Family'],
    ['owned', `Owned (${ownedIds.length})`]
  ];

  return `
    <div class="wr-boutique" data-testid="wedding-rings-boutique">
      <div class="wr-header">
        <div class="wr-header-copy">
          <b>💍 Wedding Ring Boutique</b>
          <small>Select any ring to preview, equip on your profile, or send an exclusive 1-to-1 Couple Request</small>
        </div>
        <div class="wr-header-acts">
          <button type="button" class="wr-bag-btn" data-wr-openbag>🎒 Ring Bag (${ownedIds.length})</button>
        </div>
      </div>

      <div class="wr-controls">
        <div class="wr-filters" role="group" aria-label="Filter wedding rings">
          ${filterChips.map(([k, lbl]) => `<button type="button" class="wr-fbtn ${ringFilter === k ? 'on' : ''}" data-wr-filter="${k}">${lbl}</button>`).join('')}
        </div>
        <input type="search" class="wr-search" id="wrSearchIn" value="${esc(ringQuery)}" placeholder="Search 32 rings..." aria-label="Search wedding rings">
      </div>

      ${renderWeddingRingInspectorHtml(activeRing, ownedSet)}

      <div class="wr-grid" data-testid="wedding-rings-grid">
        ${filtered.length
          ? filtered.map(r => renderWeddingRingTileHtml(r, ownedSet, activeRing && activeRing.id === r.id, me.equippedRing === r.id)).join('')
          : '<div class="empty" style="grid-column:1/-1">No rings match your filter. Try switching back to All.</div>'}
      </div>
    </div>
  `;
}

function openRingInventoryModal() {
  if (typeof RingRules === 'undefined') return toast('Rings catalog unavailable');
  let bagSelectedId = me.equippedRing || getMyOwnedRingIds()[0] || 'g_wring_diamond';
  const m = modal('🎒 My Ring Bag', `<div id="wrBagBody" class="wr-bag-modal"></div>`, 'wr-bag-sheet');

  const paintBag = () => {
    const ownedIds = getMyOwnedRingIds();
    const ownedSet = new Set(ownedIds);
    const ownedRings = RingRules.getAllWeddingRings().filter(r => ownedSet.has(r.id));
    const active = ownedRings.find(r => r.id === bagSelectedId) || ownedRings[0] || null;
    if (active) bagSelectedId = active.id;

    const body = $('#wrBagBody', m);
    if (!body) return;
    if (!ownedRings.length) {
      body.innerHTML = `<div class="empty">Your Ring Bag is empty. Browse the Wedding Ring Boutique to collect or claim your first ring!</div>
        <button type="button" class="btn gold full" id="wrBagBrowse" style="margin-top:10px">Browse Wedding Rings</button>`;
      if ($('#wrBagBrowse', body)) {
        $('#wrBagBrowse', body).onclick = () => { m.close(); openWeddingRingsStore(); };
      }
      return;
    }

    body.innerHTML = `
      ${renderWeddingRingInspectorHtml(active, ownedSet)}
      <div class="wr-grid" data-testid="ring-bag-grid">
        ${ownedRings.map(r => renderWeddingRingTileHtml(r, ownedSet, active && active.id === r.id, me.equippedRing === r.id)).join('')}
      </div>
      <button type="button" class="btn ghost full" id="wrBagBrowseAll" style="margin-top:10px">Explore All ${RingRules.getAllWeddingRings().length} Wedding Rings</button>
    `;

    if ($('#wrBagBrowseAll', body)) {
      $('#wrBagBrowseAll', body).onclick = () => { m.close(); openWeddingRingsStore(); };
    }
  };

  paintBag();

  m.onclick = e => {
    const sel = e.target.closest('[data-wr-select]');
    if (sel) {
      bagSelectedId = sel.dataset.wrSelect;
      if (typeof playSfx === 'function') playSfx('tap');
      paintBag();
      return;
    }
    const eq = e.target.closest('[data-wr-equip]');
    if (eq) {
      handleEquipRingAction(eq.dataset.wrEquip);
      paintBag();
      return;
    }
    const prev = e.target.closest('[data-wr-preview]');
    if (prev) {
      const g = typeof GIFT_BY_ID !== 'undefined' ? GIFT_BY_ID[prev.dataset.wrPreview] : null;
      if (g && typeof showLuxuryGiftShowcase === 'function') {
        showLuxuryGiftShowcase({ fromName: me.name || 'You', toName: 'Ring Showcase', qty: 1, charm: g.charm, luckyCoins: Math.round(g.price * 0.25) }, g);
      }
      return;
    }
    const req = e.target.closest('[data-wr-request]');
    if (req) {
      m.close();
      if (typeof openGiftSendModal === 'function') {
        openGiftSendModal('', { allowPickPlayer: true, preselectFilter: 'rings', preselectGiftId: req.dataset.wrRequest });
      }
    }
  };
}
window.openRingInventoryModal = openRingInventoryModal;

function openWeddingRingsStore(preselectId) {
  storeCat = 'rings';
  if (preselectId && typeof RingRules !== 'undefined' && RingRules.getRingById(preselectId)) {
    selectedRingId = preselectId;
  }
  if (typeof showTab === 'function') showTab('store');
  renderStore();
}
window.openWeddingRingsStore = openWeddingRingsStore;

function renderStore() {
  cleanExpiredUnlocks();
  const tabsEl = $('#storeTabs');
  const listEl = $('#storeList');
  if (!tabsEl || !listEl) return;

  tabsEl.innerHTML = CATS.map(c => `<button class="chipbtn ${c[0] === storeCat ? 'on' : ''}" data-cat="${c[0]}">${c[1]}</button>`).join('');

  const ownedRingCount = getMyOwnedRingIds().length;
  const quickBar = `
    <div class="store-quick-banner card" style="grid-column:1/-1">
      <div class="row wrap" style="justify-content:space-between;gap:10px">
        <div>
          <b style="font-size:15px">💎 3D Luxury Gifts, Wedding Rings &amp; Lucky Wheel</b>
          <p style="font-size:12px;color:var(--mu);margin:3px 0 0">Collect, equip, or propose with 32 bespoke Wedding &amp; Couple Rings or 10,000+ animated luxury gifts.</p>
        </div>
        <div class="row wrap" style="gap:8px">
          <button type="button" class="btn gold sm" id="stOpenRings">💍 Wedding Rings</button>
          <button type="button" class="btn ghost sm" id="stOpenRingBag">🎒 Ring Bag (${ownedRingCount})</button>
          <button type="button" class="btn sm" id="stOpenWheel">🎡 Lucky Spin (${fmtNum(me.spinTickets || 0)})</button>
        </div>
      </div>
    </div>
  `;

  if (storeCat === 'rings') {
    listEl.innerHTML = renderWeddingRingsBoutique(false);
  } else if (storeCat === 'luxgifts') {
    listEl.innerHTML = quickBar + renderStoreLuxGiftsShowcase(false);
  } else {
    const featuredRings = storeCat === 'all' ? renderWeddingRingsBoutique(true) : '';
    const featuredLux = storeCat === 'all' ? renderStoreLuxGiftsShowcase(true) : '';
    const cardsHtml = storeItems
      .filter(it => storeCat === 'all' || it.kind === storeCat)
      .map(it => {
        const tierBadge = it.tier ? `<span class="tier-pill">${esc(it.tier)}</span>` : '';
        if (it.kind === 'vip' || it.kind === 'bundle') {
          const activeVip = it.kind === 'vip' && getActiveVipTier(me) === it.value;
          return `<div class="card store-card-lux">
            <div class="prod-stage">${itemPreview(it)}</div>
            <div class="row" style="justify-content:space-between;gap:6px"><b>${esc(it.name)}</b>${tierBadge}</div>
            <p style="color:var(--mu);font-size:12px;margin:4px 0 10px">${esc(it.desc || '')}</p>
            <button type="button" class="btn ${it.kind === 'vip' ? 'gold' : ''} sm full" data-buyinstant="${esc(it.id)}">${activeVip ? 'Extend' : 'Buy Now'} · ${fmtNum(it.basePrice)} 🪙</button>
          </div>`;
        }
        const exp = Number(me.tempUnlocks[itemKey(it)] || 0), isAct = exp > Date.now();
        return `<div class="card store-card-lux">
          <div class="prod-stage">${itemPreview(it)}</div>
          <div class="row" style="justify-content:space-between;gap:6px">
            <b>${esc(it.name)}</b>
            <div class="row" style="gap:5px">${tierBadge}<span class="dur-pill">${isAct ? Math.max(1, Math.ceil((exp - Date.now()) / 3600000)) + 'h left' : 'Timed'}</span></div>
          </div>
          <p style="color:var(--mu);font-size:12px;margin:4px 0 8px">${esc(it.desc || '')}</p>
          <div class="row wrap">${Object.entries(DURATIONS).map(([dk, dv]) => `<button class="btn sm ${isAct ? 'ghost' : ''}" data-buy="${esc(it.id)}" data-dur="${dk}" style="flex:1">${dv.label} · ${fmtNum(Math.max(5, Math.round((it.basePrice || 40) * dv.mult)))} 🪙</button>`).join('')}</div>
          ${devMode && String(it.id).startsWith('c_') ? `<button class="btn red sm" style="margin-top:8px" data-delitem="${esc(it.id)}">Delete item</button>` : ''}
        </div>`;
      }).join('');
    listEl.innerHTML = quickBar + featuredRings + featuredLux + (cardsHtml || '<div class="empty">No items in this category</div>');
  }

  if ($('#stOpenRings', listEl)) {
    $('#stOpenRings', listEl).onclick = () => {
      storeCat = 'rings';
      renderStore();
    };
  }
  if ($('#stOpenRingBag', listEl)) {
    $('#stOpenRingBag', listEl).onclick = () => openRingInventoryModal();
  }
  if ($('#stOpenWheel', listEl)) {
    $('#stOpenWheel', listEl).onclick = () => {
      if (typeof openLuckySpinModal === 'function') openLuckySpinModal();
    };
  }
  if ($('#stViewAllRings', listEl)) {
    $('#stViewAllRings', listEl).onclick = () => {
      storeCat = 'rings';
      renderStore();
    };
  }
  if ($('#stViewAllLux', listEl)) {
    $('#stViewAllLux', listEl).onclick = () => {
      storeCat = 'luxgifts';
      renderStore();
    };
  }
  if ($('#wrSearchIn', listEl)) {
    $('#wrSearchIn', listEl).oninput = e => {
      ringQuery = e.target.value || '';
      const pos = e.target.selectionStart || ringQuery.length;
      renderStore();
      const fresh = $('#wrSearchIn', listEl);
      if (fresh) {
        fresh.focus();
        try { fresh.setSelectionRange(pos, pos); } catch {}
      }
    };
  }
  $$('[data-wr-openbag]', listEl).forEach(btn => {
    btn.onclick = () => openRingInventoryModal();
  });
  $$('[data-wr-filter]', listEl).forEach(btn => {
    btn.onclick = () => {
      ringFilter = btn.dataset.wrFilter || 'all';
      if (typeof playSfx === 'function') playSfx('tap');
      renderStore();
    };
  });
  $$('[data-wr-select]', listEl).forEach(btn => {
    btn.onclick = () => {
      selectedRingId = btn.dataset.wrSelect;
      if (storeCat !== 'rings') storeCat = 'rings';
      if (typeof playSfx === 'function') playSfx('tap');
      renderStore();
    };
  });
  $$('[data-wr-equip]', listEl).forEach(btn => {
    btn.onclick = () => handleEquipRingAction(btn.dataset.wrEquip);
  });
  $$('[data-wr-acquire]', listEl).forEach(btn => {
    btn.onclick = () => handleAcquireRingAction(btn.dataset.wrAcquire, { payWithCoins: btn.dataset.wrPay === '1' });
  });
  $$('[data-wr-preview]', listEl).forEach(btn => {
    btn.onclick = () => {
      const g = typeof GIFT_BY_ID !== 'undefined' ? GIFT_BY_ID[btn.dataset.wrPreview] : null;
      if (g && typeof showLuxuryGiftShowcase === 'function') {
        showLuxuryGiftShowcase({ fromName: me.name || 'You', toName: 'Wedding Showcase', qty: 1, charm: g.charm, luckyCoins: Math.round(g.price * 0.25) }, g);
      }
    };
  });
  $$('[data-wr-request]', listEl).forEach(btn => {
    btn.onclick = () => {
      const gid = btn.dataset.wrRequest;
      if (typeof openGiftSendModal === 'function') {
        openGiftSendModal('', { allowPickPlayer: true, preselectFilter: 'rings', preselectGiftId: gid });
      }
    };
  });
  $$('[data-open-wring-tab]', listEl).forEach(btn => {
    btn.onclick = () => {
      storeCat = 'rings';
      if (typeof playSfx === 'function') playSfx('tap');
      renderStore();
    };
  });
  $$('[data-st-prevgift]', listEl).forEach(btn => {
    btn.onclick = () => {
      const g = typeof GIFT_BY_ID !== 'undefined' ? GIFT_BY_ID[btn.dataset.stPrevgift] : null;
      if (g && typeof showLuxuryGiftShowcase === 'function') {
        showLuxuryGiftShowcase({ fromName: me.name || 'You', toName: 'VIP Showcase', qty: 1, charm: g.charm, luckyCoins: Math.round(g.price * 0.25) }, g);
      }
    };
  });
  $$('[data-st-sendgift]', listEl).forEach(btn => {
    btn.onclick = () => {
      const gid = btn.dataset.stSendgift;
      const g = typeof GIFT_BY_ID !== 'undefined' ? GIFT_BY_ID[gid] : null;
      if (typeof openGiftSendModal === 'function') {
        openGiftSendModal('', { allowPickPlayer: true, preselectFilter: g?.cat === 'ring' ? 'rings' : 'lux10k', preselectGiftId: gid });
      }
    };
  });
}

$('#storeTabs').onclick = e => {
  const btn = e.target.closest('[data-cat]');
  const c = btn && btn.dataset.cat;
  if (c) {
    storeCat = c;
    if (typeof playSfx === 'function') playSfx('tap');
    renderStore();
  }
};
$('#storeList').onclick = e => {
  const del = e.target.dataset.delitem;
  if (del) {
    if (!devMode) return toast('Developer only');
    customItems = customItems.filter(x => x.id !== del); ls.set('sg_store_custom', customItems);
    storeItems = [...DEFAULT_ITEMS, ...customItems];
    dbOp(() => F.deleteDoc(F.doc(db, 'store_items', del)));
    renderStore(); toast('Item deleted'); return;
  }

  const instantBtn = e.target.closest('[data-buyinstant]');
  if (instantBtn) {
    if (needLogin('the Store')) return;
    const it = storeItems.find(x => x.id === instantBtn.dataset.buyinstant);
    if (!it) return;
    if (me.coins < it.basePrice) return toast(`Need ${fmtNum(it.basePrice)} coins`);
    me.coins = clampCoins(me.coins - it.basePrice);
    if (it.kind === 'vip') {
      const addMs = (it.days || 7) * 86400000;
      const baseEnd = getActiveVipTier(me) === it.value ? Number(me.vipUntil || Date.now()) : Date.now();
      me.vipTier = it.value;
      me.vipUntil = baseEnd + addMs;
      if (it.value === 'royal') me.spinTickets = clampSafeInt((me.spinTickets || 0) + 2, 0, 9999);
      saveMe();
      patchUser(uid, { ...base(), coins: me.coins, vipTier: me.vipTier, vipUntil: me.vipUntil });
      dbOp(() => F.setDoc(userRef(uid), { ...base(), coins: me.coins, vipTier: me.vipTier, vipUntil: me.vipUntil }, { merge: true }));
      if (typeof showVipEntranceBanner === 'function') showVipEntranceBanner(me, 'VIP Lounge Activated');
      toast(`Activated ${it.name}!`);
    } else if (it.kind === 'bundle') {
      if (it.value === 'spin_1') {
        me.spinTickets = clampSafeInt((me.spinTickets || 0) + 1, 0, 9999);
        toast('+1 Lucky Spin Ticket added!');
      } else if (it.value === 'spin_5') {
        me.spinTickets = clampSafeInt((me.spinTickets || 0) + 5, 0, 9999);
        toast('+5 Lucky Spin Tickets added!');
      } else if (it.value === 'mystery_box') {
        saveMe(); updateHud();
        if (typeof openMysteryBoxReward === 'function') openMysteryBoxReward();
        else { addReward(500, 30, null, true); toast('Mystery Box opened: +500 Coins!'); }
      }
      saveMe();
      patchUser(uid, { ...base(), coins: me.coins });
      dbOp(() => F.setDoc(userRef(uid), { ...base(), coins: me.coins }, { merge: true }));
    }
    bumpStat('store_buy'); updateHud();
    if (typeof buildProfile === 'function') buildProfile();
    renderStore();
    if (typeof playSfx === 'function') playSfx('chestOpen');
    return;
  }

  const btn = e.target.closest('[data-buy]'); if (!btn) return;
  if (needLogin('the Store')) return;
  const buyKey = 'buy_' + btn.dataset.buy + '_' + btn.dataset.dur;
  if (inFlightOps.has(buyKey)) return;
  const it = storeItems.find(x => x.id === btn.dataset.buy), dur = DURATIONS[btn.dataset.dur];
  if (!it || !dur) return;
  if (typeof isRankExclusiveKey === 'function' && isRankExclusiveKey(itemKey(it))) return toast('Exclusive to Leaderboard Top 1–3');
  const cost = Math.max(5, Math.round((it.basePrice || 40) * dur.mult));
  if (me.coins < cost) return toast('Not enough coins');

  inFlightOps.add(buyKey);
  try {
    me.coins = clampCoins(me.coins - cost);
    const key = itemKey(it);
    me.tempUnlocks[key] = Math.max(Date.now(), Number(me.tempUnlocks[key] || 0)) + dur.ms;
    if (it.kind === 'frame' && it.value !== 'dev') me.frame = it.value;
    if (it.kind === 'banner') me.banner = it.value;
    if (it.kind === 'text') me.textStyle = it.value;
    if (it.kind === 'msg') me.msgStyle = it.value;
    if (it.kind === 'bio') me.bioStyle = it.value;
    if (it.kind === 'entry') me.entryEffect = it.value;
    if (it.kind === 'tag') {
      me.tags = [...me.tags.filter(x => x !== it.value && !FREE_TAGS.includes(x)), it.value].slice(-3);
    }
    saveMe();
    patchUser(uid, { ...base(), coins: me.coins, tempUnlocks: me.tempUnlocks });
    dbOp(() => F.setDoc(userRef(uid), { ...base(), coins: me.coins, tempUnlocks: me.tempUnlocks }, { merge: true }));
    bumpStat('store_buy'); updateHud(); buildProfile(); renderStore(); renderRanking();
    if (typeof playSfx === 'function') playSfx('taskClaim');
    toast(`Unlocked ${it.name} (${dur.label})`);
  } finally {
    setTimeout(() => inFlightOps.delete(buyKey), 400);
  }
};

$('#addStoreBtn').onclick = () => {
  if (!devMode) return toast('Developer only');
  const m = modal('Add Store Item (Developer)', `<label>Kind</label><select id="siK"><option>tag</option><option>frame</option><option>banner</option><option>entry</option><option>text</option><option>msg</option><option>bio</option></select><label>Name</label><input id="siN" maxlength="40"><label>Value (CSS class, frame key, or tag text)</label><input id="siV" maxlength="80"><div class="row"><div style="flex:1"><label>Price (1 day)</label><input id="siP" type="number" min="5" max="10000" value="40"></div></div><label>Description</label><input id="siD" maxlength="100"><label>…or paste JSON</label><textarea id="siJ" placeholder='{"name":"Gold Tag","kind":"tag","value":"Gold Scholar","basePrice":45}'></textarea><button class="btn full" id="siS">Save item</button>`);
  $('#siS', m).onclick = () => {
    if (!devMode) return;
    let it; const raw = $('#siJ', m).value.trim();
    try { it = raw ? JSON.parse(raw) : { kind: $('#siK', m).value, name: $('#siN', m).value.trim(), value: $('#siV', m).value.trim(), basePrice: +$('#siP', m).value || 40, desc: $('#siD', m).value.trim() }; } catch { return toast('Invalid JSON'); }
    if (!it || !it.name || !it.value || !['frame', 'banner', 'entry', 'text', 'msg', 'bio', 'tag'].includes(it.kind)) return toast('Need kind, name and value');
    if (typeof isRankExclusiveKey === 'function' && isRankExclusiveKey(`${it.kind}:${it.value}`)) return toast('Cannot sell Leaderboard Top 1–3 exclusive items');
    it = { id: 'c_' + Date.now().toString(36), name: String(it.name).slice(0, 40), kind: it.kind, value: String(it.value).slice(0, 80), basePrice: clampSafeInt(it.basePrice || 40, 5, 10000), desc: String(it.desc || '').slice(0, 100) };
    customItems.push(it); ls.set('sg_store_custom', customItems); storeItems = [...DEFAULT_ITEMS, ...customItems];
    dbOp(() => F.setDoc(F.doc(db, 'store_items', it.id), it), () => toast('Could not sync item'));
    m.close(); renderStore(); toast('Item added');
  };
};
