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
let storeCat = 'all';
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
  if (typeof GIFT_CATALOG === 'undefined' || typeof giftSvg !== 'function') return '';
  const luxList = GIFT_CATALOG.filter(g => (typeof isLuxuryAnimatedGift === 'function' && isLuxuryAnimatedGift(g)) || g.cat === 'ring')
    .sort((a, b) => b.price - a.price);
  const shown = onlyFeatured ? luxList.slice(0, 6) : luxList;
  return `
    <div class="store-lux-showcase" style="grid-column:1/-1">
      <div class="store-lux-head">
        <div>
          <b>✨ 3D Luxury 10,000+ Gifts &amp; Exclusive Rings</b>
          <small>Photorealistic 3D metallic art · Continuous shimmer &amp; ambient Gift Wall particles</small>
        </div>
        ${onlyFeatured ? `<button type="button" class="btn ghost sm" id="stViewAllLux">View All (${luxList.length})</button>` : ''}
      </div>
      <div class="store-lux-grid">
        ${shown.map(g => {
          const is10k = typeof isLuxuryAnimatedGift === 'function' && isLuxuryAnimatedGift(g);
          const tMeta = (typeof GIFT_TIERS !== 'undefined' && GIFT_TIERS[g.tier]) || { color: '#ffd36b', name: 'Luxury' };
          return `<div class="store-lux-tile ${is10k ? 'lux-10k-card' : ''}" data-lux10k="${is10k ? '1' : '0'}">
            ${is10k && typeof renderLuxury10kFxHtml === 'function' ? renderLuxury10kFxHtml(g, false) : ''}
            <div class="slt-top">
              <span class="slt-badge" style="color:${tMeta.color}">${is10k ? '✦ 10k+ LIVE 3D' : (g.bondType ? '💎 1-to-1 BOND' : '💍 RING')}</span>
              <span class="slt-price">${fmtNum(g.price)} 🪙</span>
            </div>
            <div class="slt-art">${giftSvg(g, 66)}</div>
            <b class="slt-name">${esc(g.name)}</b>
            <small class="slt-sub">+${fmtNum(g.charm)} Charm${g.bondType ? ' · Request → Accept' : ''}</small>
            <div class="row" style="gap:6px;margin-top:8px;width:100%">
              ${g.price >= 5000 ? `<button type="button" class="btn ghost sm" style="flex:1" data-st-prevgift="${esc(g.id)}">Preview</button>` : ''}
              <button type="button" class="btn gold sm" style="flex:1" data-st-sendgift="${esc(g.id)}">${g.bondType ? 'Request' : 'Send'}</button>
            </div>
          </div>`;
        }).join('')}
      </div>
    </div>
  `;
}

function renderStore() {
  cleanExpiredUnlocks();
  const tabsEl = $('#storeTabs');
  const listEl = $('#storeList');
  if (!tabsEl || !listEl) return;

  tabsEl.innerHTML = CATS.map(c => `<button class="chipbtn ${c[0] === storeCat ? 'on' : ''}" data-cat="${c[0]}">${c[1]}</button>`).join('');

  const quickBar = `
    <div class="store-quick-banner card" style="grid-column:1/-1">
      <div class="row wrap" style="justify-content:space-between;gap:10px">
        <div>
          <b style="font-size:15px">💎 3D Luxury Gifts, Rings &amp; Lucky Wheel</b>
          <p style="font-size:12px;color:var(--mu);margin:3px 0 0">Send exclusive 1-to-1 Couple Rings, Bro/Bestie Tags, or 10,000+ animated luxury gifts.</p>
        </div>
        <div class="row wrap" style="gap:8px">
          <button type="button" class="btn gold sm" id="stOpenRings">💍 Rings &amp; Gifts</button>
          <button type="button" class="btn sm" id="stOpenWheel">🎡 Lucky Spin (${fmtNum(me.spinTickets || 0)})</button>
        </div>
      </div>
    </div>
  `;

  if (storeCat === 'luxgifts') {
    listEl.innerHTML = quickBar + renderStoreLuxGiftsShowcase(false);
  } else {
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
    listEl.innerHTML = quickBar + featuredLux + (cardsHtml || '<div class="empty">No items in this category</div>');
  }

  if ($('#stOpenRings', listEl)) {
    $('#stOpenRings', listEl).onclick = () => {
      if (typeof openGiftSendModal === 'function') openGiftSendModal('', { allowPickPlayer: true, preselectFilter: 'rings' });
    };
  }
  if ($('#stOpenWheel', listEl)) {
    $('#stOpenWheel', listEl).onclick = () => {
      if (typeof openLuckySpinModal === 'function') openLuckySpinModal();
    };
  }
  if ($('#stViewAllLux', listEl)) {
    $('#stViewAllLux', listEl).onclick = () => {
      storeCat = 'luxgifts';
      renderStore();
    };
  }
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

$('#storeTabs').onclick = e => { const c = e.target.dataset.cat; if (c) { storeCat = c; renderStore(); } };
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
