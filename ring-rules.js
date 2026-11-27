"use strict";
/* ===== Study Game: Wedding & Couple Rings Catalog + Pure Selection / Equip / Unlock / Request Rules ===== */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.RingRules = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : window, function () {

  function calcRingCharm(coins) {
    return Math.max(1, Math.floor(Math.max(0, Number(coins || 0)) / 5));
  }

  /* 32 Wedding & Couple Rings:
     - 27 New Designs directly inspired by the Wedding Ring Showcase
     - 5 Upgraded Existing Study Game Couple Rings (preserving existing IDs & compatibility)
  */
  const RAW_WEDDING_RINGS = [
    /* --- Top Luxury Showcase (Screenshot 1 & 2) --- */
    {
      id: 'g_wring_diamond', name: 'Diamond Ring', art: 'diamond',
      source: 'store', sourceLabel: '', group: 'luxury', tier: 7,
      price: 99999, weddingDays: 7,
      c1: '#e0f2fe', c2: '#38bdf8', glow: '#7dd3fc',
      bgA: '#132a47', bgB: '#1d4b7a',
      lore: 'Interlocking rose-gold twin bands crowned with a brilliant-cut ice diamond solitaire.'
    },
    {
      id: 'g_wring_summer_night', name: 'Summer Night Ring', art: 'summer_night',
      source: 'store', sourceLabel: '', group: 'luxury', tier: 7,
      price: 99999, weddingDays: 7,
      c1: '#fde047', c2: '#3b82f6', glow: '#60a5fa',
      bgA: '#15204a', bgB: '#273a82',
      lore: 'Midnight sapphire medallion framed in pavé diamonds with a blazing golden summer star.'
    },
    {
      id: 'g_wring_ruby', name: 'Ruby Ring', art: 'ruby',
      source: 'store', sourceLabel: '', group: 'luxury', tier: 7,
      price: 99999, weddingDays: 7,
      c1: '#fb7185', c2: '#e11d48', glow: '#f43f5e',
      bgA: '#3d102b', bgB: '#6e1b49',
      lore: 'Sculpted twin sovereign gold bands paired with a vivid pigeon-blood faceted ruby.'
    },
    {
      id: 'g_wring_rainbow', name: 'Rainbow Ring', art: 'rainbow',
      source: 'store', sourceLabel: '', group: 'luxury', tier: 6,
      price: 52013, weddingDays: 7,
      c1: '#67e8f9', c2: '#a855f7', glow: '#c084fc',
      bgA: '#1b2259', bgB: '#333b94',
      lore: 'Mirror-polished platinum open band topped with a luminous prism spectrum crown.'
    },
    {
      id: 'g_wring_wolf_king', name: 'Wolf King Ring', art: 'wolf_king',
      source: 'store', sourceLabel: '', group: 'luxury', tier: 6,
      price: 52013, weddingDays: 7,
      c1: '#60a5fa', c2: '#6d28d9', glow: '#818cf8',
      bgA: '#221c54', bgB: '#3f348a',
      lore: 'Octagonal platinum signet housing a glowing electric-sapphire wolf king crest.'
    },
    {
      id: 'g_wring_cherry', name: 'Cherry Ring', art: 'cherry',
      source: 'store', sourceLabel: '', group: 'luxury', tier: 6,
      price: 52013, weddingDays: 7,
      c1: '#fbcfe8', c2: '#ec4899', glow: '#f472b6',
      bgA: '#3d1532', bgB: '#6e2455',
      lore: 'Icy-silver shank blooming with a 5-petal faceted sakura diamond and emerald leaves.'
    },
    {
      id: 'g_wring_butterfly', name: 'Butterfly Ring', art: 'butterfly',
      source: 'store', sourceLabel: '', group: 'classic', tier: 6,
      price: 34520, weddingDays: 7,
      c1: '#fef08a', c2: '#d97706', glow: '#fbbf24',
      bgA: '#102b45', bgB: '#1c4d73',
      lore: 'Molten gold ribbon bow sculpted with a vertical diamond-pavé butterfly knot.'
    },
    {
      id: 'g_wring_crystal', name: 'Crystal Ring', art: 'crystal',
      source: 'store', sourceLabel: '', group: 'classic', tier: 5,
      price: 8888, weddingDays: 5,
      c1: '#7dd3fc', c2: '#0284c7', glow: '#38bdf8',
      bgA: '#0b2d4d', bgB: '#12538c',
      lore: 'Pure platinum solitaire cradling a razor-cut azure crystal in four-prong setting.'
    },

    /* --- Activity & Family Exclusive Collection (Screenshot 1, 2 & 3) --- */
    {
      id: 'g_wring_eternal_devotion', name: 'Eternal Devotion Ring', art: 'eternal_devotion',
      source: 'activity', sourceLabel: 'From Activity', group: 'activity', tier: 7,
      price: 18000, unlockHint: 'Claim via Activity Streak or Unlock', weddingDays: 7,
      c1: '#e9d5ff', c2: '#7c3aed', glow: '#c084fc',
      bgA: '#28105c', bgB: '#4c1d95',
      lore: 'Braided gold-and-violet band holding an iridescent crystal orb with an eternal heart.'
    },
    {
      id: 'g_wring_cupid', name: "Cupid's Ring", art: 'cupid',
      source: 'activity', sourceLabel: 'From Activity', group: 'activity', tier: 6,
      price: 15000, unlockHint: 'Claim via Activity Streak or Unlock', weddingDays: 7,
      c1: '#fbcfe8', c2: '#db2777', glow: '#f472b6',
      bgA: '#32144d', bgB: '#592382',
      lore: 'Winged golden cherub cradling a blazing faceted rose-heart crystal.'
    },
    {
      id: 'g_wring_starry_encounter', name: 'Starry Encounter', art: 'starry_encounter',
      source: 'activity', sourceLabel: 'From Activity', group: 'activity', tier: 7,
      price: 22000, unlockHint: 'Claim via Activity Streak or Unlock', weddingDays: 7,
      c1: '#f0abfc', c2: '#7e22ce', glow: '#e879f9',
      bgA: '#261359', bgB: '#4a2199',
      lore: 'Enchanted pearlescent scallop shell cradling a luminous pink nebula pearl.'
    },
    {
      id: 'g_wring_starry_beloved', name: 'Starry Beloved', art: 'starry_beloved',
      source: 'activity', sourceLabel: 'From Activity', group: 'activity', tier: 7,
      price: 28000, unlockHint: 'Claim via Activity Streak or Unlock', weddingDays: 7,
      c1: '#c4b5fd', c2: '#6d28d9', glow: '#a855f7',
      bgA: '#210e54', bgB: '#431c94',
      lore: 'Twin celestial light-arcs orbiting a rose-nebula planet and crystalline star crest.'
    },
    {
      id: 'g_wring_golden_hoop', name: 'Golden Hoop Ring', art: 'golden_hoop',
      source: 'activity', sourceLabel: 'From Activity', group: 'activity', tier: 6,
      price: 16000, unlockHint: 'Claim via Activity Streak or Unlock', weddingDays: 7,
      c1: '#fef08a', c2: '#d97706', glow: '#f59e0b',
      bgA: '#2c1747', bgB: '#4f2775',
      lore: 'Imperial open-scroll golden hoop carved with luminous cloud-filigree finials.'
    },
    {
      id: 'g_wring_golden_lotus', name: 'Golden Lotus Ring', art: 'golden_lotus',
      source: 'family', sourceLabel: 'From Family', group: 'family', tier: 7,
      price: 24000, unlockHint: 'Join any Clan / Family or Unlock', weddingDays: 7,
      c1: '#fde68a', c2: '#ea580c', glow: '#fb923c',
      bgA: '#1c2459', bgB: '#36418f',
      lore: 'Luminous blooming amber-gold lotus wrapped in flowing silk ribbons and golden butterflies.'
    },
    {
      id: 'g_wring_ice_fire', name: 'Ice and Fire Ring', art: 'ice_fire',
      source: 'family', sourceLabel: 'From Family', group: 'family', tier: 7,
      price: 24000, unlockHint: 'Join any Clan / Family or Unlock', weddingDays: 7,
      c1: '#67e8f9', c2: '#f97316', glow: '#38bdf8',
      bgA: '#0e2c47', bgB: '#194d70',
      lore: 'Glacial ice-crystal shards framing an untamed blazing crimson-gold flame core.'
    },
    {
      id: 'g_wring_paradise_castle', name: 'Paradise Castle Ring', art: 'paradise_castle',
      source: 'activity', sourceLabel: 'From Activity', group: 'activity', tier: 7,
      price: 26000, unlockHint: 'Claim via Activity Streak or Unlock', weddingDays: 7,
      c1: '#93c5fd', c2: '#2563eb', glow: '#60a5fa',
      bgA: '#18245e', bgB: '#2d419c',
      lore: 'Sapphire architectural signet enclosing a fairy-tale castle topped by a golden crown.'
    },
    {
      id: 'g_wring_dream_yacht', name: 'Dream Yacht Ring', art: 'dream_yacht',
      source: 'activity', sourceLabel: 'From Activity', group: 'activity', tier: 7,
      price: 30000, unlockHint: 'Claim via Activity Streak or Unlock', weddingDays: 7,
      c1: '#f0abfc', c2: '#9333ea', glow: '#e879f9',
      bgA: '#260b38', bgB: '#4a1469',
      lore: 'Midnight-plum halo housing a luminous dream yacht gliding on golden-violet waves.'
    },
    {
      id: 'g_wring_hope_arc', name: 'Hope Arc Ring', art: 'hope_arc',
      source: 'activity', sourceLabel: 'From Activity', group: 'activity', tier: 7,
      price: 26000, unlockHint: 'Claim via Activity Streak or Unlock', weddingDays: 7,
      c1: '#67e8f9', c2: '#f59e0b', glow: '#22d3ee',
      bgA: '#0c2f42', bgB: '#165573',
      lore: 'Radiant golden recurve bow and crystal arrow framed by glowing aqua angel wings.'
    },

    /* --- Royal & Haute Joaillerie Collection (Screenshot 3) --- */
    {
      id: 'g_wring_flower', name: 'Flower Ring', art: 'flower',
      source: 'store', sourceLabel: '', group: 'classic', tier: 5,
      price: 5200, weddingDays: 5,
      c1: '#f9a8d4', c2: '#22c55e', glow: '#f472b6',
      bgA: '#36152c', bgB: '#5e2349',
      lore: 'Interlocking emerald vine bands woven with blooming pink wildflower blossoms.'
    },
    {
      id: 'g_wring_platinum', name: 'Platinum Ring', art: 'platinum',
      source: 'store', sourceLabel: '', group: 'classic', tier: 6,
      price: 13142, weddingDays: 7,
      c1: '#e0e7ff', c2: '#818cf8', glow: '#a5b4fc',
      bgA: '#211c52', bgB: '#3c3487',
      lore: 'Twin mirror-polished platinum-lavender bands accented with a pinpoint solitaire glint.'
    },
    {
      id: 'g_wring_crown', name: 'Crown Ring', art: 'crown',
      source: 'store', sourceLabel: '', group: 'luxury', tier: 7,
      price: 520920, weddingDays: 7,
      c1: '#ddd6fe', c2: '#7c3aed', glow: '#a78bfa',
      bgA: '#17265c', bgB: '#2b449e',
      lore: 'Regal pavé-diamond platinum tiara ring showcasing an imperial faceted amethyst heart.'
    },
    {
      id: 'g_wring_i_do', name: 'I Do Ring', art: 'i_do',
      source: 'store', sourceLabel: '', group: 'luxury', tier: 7,
      price: 334420, weddingDays: 7,
      c1: '#fbcfe8', c2: '#ec4899', glow: '#f472b6',
      bgA: '#211c59', bgB: '#3d3391',
      lore: 'Cushion-cut blush pink diamond encircled by a sculpted clover halo of white pavé.'
    },
    {
      id: 'g_wring_feathers', name: 'Feathers Ring', art: 'feathers',
      source: 'store', sourceLabel: '', group: 'luxury', tier: 7,
      price: 334420, weddingDays: 7,
      c1: '#f0abfc', c2: '#38bdf8', glow: '#e879f9',
      bgA: '#2b1859', bgB: '#4f2c96',
      lore: 'Baroque silver-platinum wings embracing a pear-cut iridescent aurora fire-opal.'
    },
    {
      id: 'g_wring_darry', name: 'Darry Ring', art: 'darry',
      source: 'store', sourceLabel: '', group: 'luxury', tier: 7,
      price: 199999, weddingDays: 7,
      c1: '#f8fafc', c2: '#60a5fa', glow: '#bae6fd',
      bgA: '#162559', bgB: '#2a4396',
      lore: 'Signature white-diamond heart encased in a luminous double-row pavé heart halo.'
    },
    {
      id: 'g_wring_swan_love', name: 'Swan Love Ring', art: 'swan_love',
      source: 'store', sourceLabel: '', group: 'luxury', tier: 7,
      price: 166666, weddingDays: 7,
      c1: '#e0f2fe', c2: '#f472b6', glow: '#93c5fd',
      bgA: '#3d1330', bgB: '#6e2152',
      lore: 'Diamond-faceted crystal swan resting gracefully along a white-gold pavé shank.'
    },
    {
      id: 'g_wring_angels_wings', name: "Angel's Wings Ring", art: 'angels_wings',
      source: 'store', sourceLabel: '', group: 'luxury', tier: 7,
      price: 131420, weddingDays: 7,
      c1: '#f9a8d4', c2: '#db2777', glow: '#f472b6',
      bgA: '#221c54', bgB: '#3e358c',
      lore: 'Vivid rose-heart crystal lifted by symmetrical feathered white-platinum angel wings.'
    },
    {
      id: 'g_wring_ocean', name: 'Ocean Ring', art: 'ocean',
      source: 'store', sourceLabel: '', group: 'luxury', tier: 7,
      price: 131420, weddingDays: 7,
      c1: '#60a5fa', c2: '#1d4ed8', glow: '#38bdf8',
      bgA: '#0f2a54', bgB: '#1d4c91',
      lore: 'Deep cobalt-sapphire heart diamond bordered by crisp icy-white pavé brilliance.'
    },

    /* --- 5 Existing Study Game Couple Rings (Upgraded Bespoke SVG + CSS Art, Existing IDs Preserved) --- */
    {
      id: 'g_ring_silver', name: 'Silver Promise Ring', art: 'ring_silver',
      source: 'store', sourceLabel: '', group: 'classic', tier: 4,
      price: 500, weddingDays: 3, isLegacyUpgrade: true,
      c1: '#e2e8f0', c2: '#64748b', glow: '#94a3b8',
      bgA: '#132036', bgB: '#253c5e',
      lore: 'Twisted infinity-silver promise band crowned with a sparkling starlight solitaire.'
    },
    {
      id: 'g_ring_rose', name: 'Rose Gold Love Ring', art: 'ring_rose',
      source: 'store', sourceLabel: '', group: 'classic', tier: 5,
      price: 2500, weddingDays: 3, isLegacyUpgrade: true,
      c1: '#fda4af', c2: '#e11d48', glow: '#fb7185',
      bgA: '#381226', bgB: '#661e42',
      lore: 'Warm rose-gold twin ribbon band cradling a faceted blush-rose heart crystal.'
    },
    {
      id: 'g_ring_diamond', name: 'Diamond Eternity Ring', art: 'ring_diamond',
      source: 'store', sourceLabel: '', group: 'luxury', tier: 6,
      price: 5000, weddingDays: 7, isLegacyUpgrade: true,
      c1: '#bae6fd', c2: '#0284c7', glow: '#38bdf8',
      bgA: '#0d2542', bgB: '#184475',
      lore: 'Pavé platinum eternity shank set with a radiant icy-white solitaire and twin baguettes.'
    },
    {
      id: 'g_ring_royal', name: 'Royal Crown Ring', art: 'ring_royal',
      source: 'store', sourceLabel: '', group: 'luxury', tier: 6,
      price: 15000, weddingDays: 7, isLegacyUpgrade: true,
      c1: '#ffd36b', c2: '#b45309', glow: '#fbbf24',
      bgA: '#2e1d0b', bgB: '#5c3812',
      lore: 'Sovereign gold imperial crown ring inlaid with royal ruby and diamond pearls.'
    },
    {
      id: 'g_ring_cosmic', name: 'Cosmic Soulmate Ring', art: 'ring_cosmic',
      source: 'store', sourceLabel: '', group: 'luxury', tier: 7,
      price: 50000, weddingDays: 7, isLegacyUpgrade: true,
      c1: '#e879f9', c2: '#6d28d9', glow: '#d946ef',
      bgA: '#220e4a', bgB: '#441b87',
      lore: 'Celestial amethyst-gold band with orbiting starlight rings and a cosmic prism gem.'
    }
  ];

  const WEDDING_RING_CATALOG = RAW_WEDDING_RINGS.map(r => ({
    ...r,
    cat: 'ring',
    bondType: 'couple',
    icon: 'wring_' + r.art,
    fx: r.price >= 5000 || r.source !== 'store' ? 'ring' : undefined,
    charm: calcRingCharm(r.price)
  }));

  const WEDDING_RING_BY_ID = Object.fromEntries(WEDDING_RING_CATALOG.map(r => [r.id, r]));

  /* Alias map for non-couple ring gifts (e.g. g38_diamond) so they also inherit upgraded sleek SVG art */
  const GIFT_RING_ART_ALIAS = {
    g38_diamond: 'diamond'
  };

  function getAllWeddingRings() {
    return WEDDING_RING_CATALOG.slice();
  }

  function getRingById(id) {
    return WEDDING_RING_BY_ID[String(id || '')] || null;
  }

  function getArtKeyForGift(giftOrId) {
    if (!giftOrId) return '';
    if (typeof giftOrId === 'string') {
      const r = WEDDING_RING_BY_ID[giftOrId];
      if (r) return r.art;
      return GIFT_RING_ART_ALIAS[giftOrId] || '';
    }
    if (giftOrId.art && WEDDING_RING_BY_ID[giftOrId.id]) return giftOrId.art;
    if (giftOrId.id && WEDDING_RING_BY_ID[giftOrId.id]) return WEDDING_RING_BY_ID[giftOrId.id].art;
    if (giftOrId.id && GIFT_RING_ART_ALIAS[giftOrId.id]) return GIFT_RING_ART_ALIAS[giftOrId.id];
    if (typeof giftOrId.icon === 'string' && giftOrId.icon.startsWith('wring_')) {
      return giftOrId.icon.slice(6);
    }
    return '';
  }

  function isWeddingRing(giftOrId) {
    const id = typeof giftOrId === 'string' ? giftOrId : (giftOrId && giftOrId.id);
    return Boolean(id && WEDDING_RING_BY_ID[id]);
  }

  function getUserOwnedRingIds(userObj, giftStats) {
    const owned = new Set();
    if (userObj && Array.isArray(userObj.ownedRings)) {
      userObj.ownedRings.forEach(id => {
        if (WEDDING_RING_BY_ID[id]) owned.add(id);
      });
    }
    const wallet = userObj && userObj.giftWallet && typeof userObj.giftWallet === 'object'
      ? userObj.giftWallet : {};
    Object.entries(wallet).forEach(([id, cnt]) => {
      if (Number(cnt || 0) > 0 && WEDDING_RING_BY_ID[id]) owned.add(id);
    });
    if (giftStats && giftStats.counts && typeof giftStats.counts === 'object') {
      Object.entries(giftStats.counts).forEach(([id, cnt]) => {
        if (Number(cnt || 0) > 0 && WEDDING_RING_BY_ID[id]) owned.add(id);
      });
    }
    if (userObj && Array.isArray(userObj.bonds)) {
      userObj.bonds.forEach(b => {
        if (b && b.type === 'couple' && b.giftId && WEDDING_RING_BY_ID[b.giftId]) {
          owned.add(b.giftId);
        }
      });
    }
    if (userObj && userObj.equippedRing && WEDDING_RING_BY_ID[userObj.equippedRing]) {
      owned.add(userObj.equippedRing);
    }
    return Array.from(owned);
  }

  function filterWeddingRings(rings, opts) {
    const o = opts || {};
    const list = Array.isArray(rings) ? rings : WEDDING_RING_CATALOG;
    const filter = String(o.filter || 'all').toLowerCase();
    const q = String(o.query || '').trim().toLowerCase();
    const ownedSet = new Set(Array.isArray(o.ownedIds) ? o.ownedIds : []);

    return list.filter(r => {
      if (!r) return false;
      if (filter === 'owned' && !ownedSet.has(r.id)) return false;
      if (filter === 'activity' && r.source !== 'activity') return false;
      if (filter === 'family' && r.source !== 'family') return false;
      if (filter === 'luxury' && r.group !== 'luxury') return false;
      if (filter === 'classic' && r.group !== 'classic') return false;
      if (filter === 'store' && r.source !== 'store') return false;
      if (q) {
        const hay = `${r.name} ${r.sourceLabel || ''} ${r.group || ''} ${r.lore || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }

  function canEquipRing(userObj, ringId, giftStats) {
    if (!WEDDING_RING_BY_ID[ringId]) return false;
    const owned = getUserOwnedRingIds(userObj, giftStats);
    return owned.includes(ringId);
  }

  function equipRingState(userObj, ringId, giftStats) {
    const ring = WEDDING_RING_BY_ID[ringId];
    if (!ring) return { ok: false, reason: 'not_found', equippedRing: userObj?.equippedRing || '' };
    if (!canEquipRing(userObj, ringId, giftStats)) {
      return { ok: false, reason: 'not_owned', equippedRing: userObj?.equippedRing || '' };
    }
    return { ok: true, reason: 'equipped', equippedRing: ring.id, ring };
  }

  function unlockOrBuyRingState(userObj, ringId, opts) {
    const o = opts || {};
    const ring = WEDDING_RING_BY_ID[ringId];
    if (!ring) return { ok: false, reason: 'not_found' };
    const owned = getUserOwnedRingIds(userObj, o.giftStats);
    if (owned.includes(ring.id)) {
      return { ok: true, alreadyOwned: true, cost: 0, mode: 'owned', ownedRings: owned, equippedRing: ring.id, ring };
    }

    const coins = Math.max(0, Number(userObj?.coins || 0));
    const isActivityEligible = ring.source === 'activity' && (
      Number(o.activityDays || (Array.isArray(userObj?.activeDays) ? userObj.activeDays.length : 0)) >= 1 ||
      Number(o.gamesPlayed || 0) >= 1 ||
      Boolean(o.allowActivityClaim)
    );
    const isFamilyEligible = ring.source === 'family' && (
      Boolean(userObj?.clanId) || Boolean(o.allowFamilyClaim)
    );

    if (ring.source === 'activity' && isActivityEligible) {
      const nextOwned = [...new Set([...owned, ring.id])];
      return {
        ok: true, alreadyOwned: false, cost: 0, mode: 'activity_claim',
        coinsLeft: coins, ownedRings: nextOwned, equippedRing: ring.id, ring
      };
    }
    if (ring.source === 'family' && isFamilyEligible) {
      const nextOwned = [...new Set([...owned, ring.id])];
      return {
        ok: true, alreadyOwned: false, cost: 0, mode: 'family_claim',
        coinsLeft: coins, ownedRings: nextOwned, equippedRing: ring.id, ring
      };
    }
    if (ring.source === 'family' && !isFamilyEligible && !o.payWithCoins) {
      return {
        ok: false, reason: 'need_family', ring,
        message: 'Join or create a Clan/Family to claim this ring for free, or unlock with coins.'
      };
    }

    if (coins < ring.price) {
      return {
        ok: false, reason: 'insufficient_coins', needed: ring.price, have: coins, ring
      };
    }
    const nextOwned = [...new Set([...owned, ring.id])];
    return {
      ok: true, alreadyOwned: false, cost: ring.price, mode: 'purchase',
      coinsLeft: coins - ring.price, ownedRings: nextOwned, equippedRing: ring.id, ring
    };
  }

  function selectRingForCoupleRequest(ringId) {
    const ring = WEDDING_RING_BY_ID[ringId];
    if (!ring) return null;
    return {
      giftId: ring.id,
      name: ring.name,
      bondType: 'couple',
      weddingDays: ring.weddingDays || 7,
      cost: ring.price,
      charm: ring.charm,
      source: ring.source,
      sourceLabel: ring.sourceLabel || ''
    };
  }

  return {
    WEDDING_RING_CATALOG,
    WEDDING_RING_BY_ID,
    GIFT_RING_ART_ALIAS,
    calcRingCharm,
    getAllWeddingRings,
    getRingById,
    getArtKeyForGift,
    isWeddingRing,
    getUserOwnedRingIds,
    filterWeddingRings,
    canEquipRing,
    equipRingState,
    unlockOrBuyRingState,
    selectRingForCoupleRequest
  };
});
