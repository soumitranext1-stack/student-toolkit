"use strict";
/* ===== Study Game: 78-Gift Multi-Tier Catalog (1★ to 7★ Sovereign), Gift Wall, Charm Box, Car Drive & Dream Palace Showcase ===== */

const GIFT_TIERS = {
  1: { name: 'Starter', stars: '★', color: '#38bdf8', bg: 'linear-gradient(145deg,#0f2942,#164e63)', border: 'rgba(56,189,248,.45)' },
  2: { name: 'Sweet', stars: '★★', color: '#f472b6', bg: 'linear-gradient(145deg,#3b1231,#701a5c)', border: 'rgba(244,114,182,.48)' },
  3: { name: 'Radiant', stars: '★★★', color: '#2dd4bf', bg: 'linear-gradient(145deg,#0f3330,#115e59)', border: 'rgba(45,212,191,.52)' },
  4: { name: 'Epic', stars: '★★★★', color: '#a855f7', bg: 'linear-gradient(145deg,#2e1065,#581c87)', border: 'rgba(168,85,247,.58)' },
  5: { name: 'Legendary', stars: '★★★★★', color: '#f59e0b', bg: 'linear-gradient(145deg,#451a03,#92400e)', border: 'rgba(245,158,11,.66)' },
  6: { name: 'Mythic', stars: '★★★★★★', color: '#ffd36b', bg: 'linear-gradient(145deg,#3b0764,#9d174d 52%,#b45309)', border: 'rgba(255,211,107,.82)' },
  7: { name: 'Sovereign', stars: '★★★★★★★', color: '#ffe58f', bg: 'linear-gradient(145deg,#31105f,#9f1239 46%,#c27803 100%)', border: 'rgba(255,229,143,.94)' }
};

/* 78 Distinct Gifts across 7 Tiers — Custom SVG Artwork, Zero External Links */
const GIFT_CATALOG = [
  /* Tier 1 — 1★ Starter (12 gifts: 5–20 coins) */
  { id: 'g01_rose', name: 'Red Rose', tier: 1, price: 5, charm: 6, icon: 'rose', c1: '#fb7185', c2: '#e11d48' },
  { id: 'g02_coffee', name: 'Study Coffee', tier: 1, price: 6, charm: 7, icon: 'coffee', c1: '#d97706', c2: '#78350f' },
  { id: 'g03_plane', name: 'Paper Plane', tier: 1, price: 8, charm: 10, icon: 'plane', c1: '#7dd3fc', c2: '#0284c7' },
  { id: 'g04_clover', name: 'Lucky Clover', tier: 1, price: 9, charm: 11, icon: 'clover', c1: '#4ade80', c2: '#15803d' },
  { id: 'g05_pencil', name: 'Star Pencil', tier: 1, price: 10, charm: 12, icon: 'pencil', c1: '#fde047', c2: '#ca8a04' },
  { id: 'g06_candy', name: 'Sweet Candy', tier: 1, price: 10, charm: 12, icon: 'candy', c1: '#f472b6', c2: '#db2777' },
  { id: 'g07_paw', name: 'Cute Paw', tier: 1, price: 12, charm: 15, icon: 'paw', c1: '#fda4af', c2: '#f43f5e' },
  { id: 'g08_heart', name: 'Mini Heart', tier: 1, price: 14, charm: 17, icon: 'heart', c1: '#fb7185', c2: '#be123c' },
  { id: 'g09_sun', name: 'Morning Sun', tier: 1, price: 15, charm: 18, icon: 'sun', c1: '#fde047', c2: '#ea580c' },
  { id: 'g10_note', name: 'Gold Note', tier: 1, price: 16, charm: 20, icon: 'note', c1: '#38bdf8', c2: '#6366f1' },
  { id: 'g11_boba', name: 'Bubble Tea', tier: 1, price: 18, charm: 22, icon: 'boba', c1: '#fcd34d', c2: '#b45309' },
  { id: 'g12_crane', name: 'Paper Crane', tier: 1, price: 20, charm: 25, icon: 'crane', c1: '#a5f3fc', c2: '#0891b2' },

  /* Tier 2 — 2★ Sweet (12 gifts: 25–60 coins) */
  { id: 'g13_bouquet', name: 'Rose Bouquet', tier: 2, price: 25, charm: 32, icon: 'bouquet', c1: '#f472b6', c2: '#be123c' },
  { id: 'g14_choco', name: 'Choco Box', tier: 2, price: 28, charm: 36, icon: 'choco', c1: '#b45309', c2: '#78350f' },
  { id: 'g15_bear', name: 'Teddy Bear', tier: 2, price: 30, charm: 40, icon: 'bear', c1: '#fbbf24', c2: '#b45309' },
  { id: 'g16_cupcake', name: 'Berry Cupcake', tier: 2, price: 32, charm: 42, icon: 'cupcake', c1: '#f9a8d4', c2: '#ec4899' },
  { id: 'g17_ribbon', name: 'Silk Ribbon', tier: 2, price: 35, charm: 45, icon: 'ribbon', c1: '#c084fc', c2: '#7c3aed' },
  { id: 'g18_headphone', name: 'Lo-Fi Beats', tier: 2, price: 38, charm: 50, icon: 'headphone', c1: '#38bdf8', c2: '#4f46e5' },
  { id: 'g19_lantern', name: 'Sky Lantern', tier: 2, price: 40, charm: 52, icon: 'lantern', c1: '#fb923c', c2: '#dc2626' },
  { id: 'g20_camera', name: 'Polaroid Snap', tier: 2, price: 44, charm: 58, icon: 'camera', c1: '#93c5fd', c2: '#2563eb' },
  { id: 'g21_sakura', name: 'Sakura Bloom', tier: 2, price: 48, charm: 64, icon: 'sakura', c1: '#fbcfe8', c2: '#ec4899' },
  { id: 'g22_moon', name: 'Crescent Charm', tier: 2, price: 50, charm: 68, icon: 'moon', c1: '#fde68a', c2: '#d97706' },
  { id: 'g23_fox', name: 'Origami Fox', tier: 2, price: 55, charm: 74, icon: 'fox', c1: '#fb923c', c2: '#ea580c' },
  { id: 'g24_sparkler', name: 'Star Sparkler', tier: 2, price: 60, charm: 82, icon: 'sparkler', c1: '#fef08a', c2: '#f59e0b' },

  /* Tier 3 — 3★ Radiant (12 gifts: 80–180 coins) */
  { id: 'g25_crystal', name: 'Crystal Heart', tier: 3, price: 80, charm: 110, icon: 'crystal', c1: '#67e8f9', c2: '#0284c7' },
  { id: 'g26_wand', name: 'Magic Wand', tier: 3, price: 90, charm: 125, icon: 'wand', c1: '#f0abfc', c2: '#9333ea' },
  { id: 'g27_book', name: 'Golden Tome', tier: 3, price: 95, charm: 132, icon: 'book', c1: '#fde047', c2: '#b45309' },
  { id: 'g28_skate', name: 'Neon Board', tier: 3, price: 100, charm: 140, icon: 'skate', c1: '#2dd4bf', c2: '#0f766e' },
  { id: 'g29_gamepad', name: 'Pro Gamepad', tier: 3, price: 110, charm: 155, icon: 'gamepad', c1: '#818cf8', c2: '#4338ca' },
  { id: 'g30_vinyl', name: 'Gold Vinyl', tier: 3, price: 120, charm: 170, icon: 'vinyl', c1: '#fbbf24', c2: '#1e293b' },
  { id: 'g31_firefly', name: 'Firefly Jar', tier: 3, price: 130, charm: 185, icon: 'firefly', c1: '#bef264', c2: '#0d9488' },
  { id: 'g32_meteor', name: 'Meteor Ring', tier: 3, price: 140, charm: 200, icon: 'meteor', c1: '#38bdf8', c2: '#7c3aed' },
  { id: 'g33_pearl', name: 'Ocean Pearl', tier: 3, price: 150, charm: 215, icon: 'pearl', c1: '#a5f3fc', c2: '#0284c7' },
  { id: 'g34_perfume', name: 'Velvet Scent', tier: 3, price: 160, charm: 230, icon: 'perfume', c1: '#f472b6', c2: '#9d174d' },
  { id: 'g35_maneki', name: 'Lucky Cat', tier: 3, price: 170, charm: 248, icon: 'maneki', c1: '#fde047', c2: '#dc2626' },
  { id: 'g36_prism', name: 'Prism Cube', tier: 3, price: 180, charm: 265, icon: 'prism', c1: '#5eead4', c2: '#6366f1' },

  /* Tier 4 — 4★ Epic (12 gifts: 220–500 coins) */
  { id: 'g37_crown', name: 'Royal Crown', tier: 4, price: 220, charm: 330, icon: 'crown', c1: '#ffd36b', c2: '#d97706' },
  { id: 'g38_diamond', name: 'Diamond Ring', tier: 4, price: 250, charm: 380, icon: 'diamond', c1: '#bae6fd', c2: '#38bdf8' },
  { id: 'g39_katana', name: 'Cyber Katana', tier: 4, price: 280, charm: 430, icon: 'katana', c1: '#22d3ee', c2: '#7c3aed' },
  { id: 'g40_drone', name: 'Plasma Drone', tier: 4, price: 300, charm: 465, icon: 'drone', c1: '#34d399', c2: '#0284c7' },
  { id: 'g41_guitar', name: 'Flame Guitar', tier: 4, price: 320, charm: 500, icon: 'guitar', c1: '#fb923c', c2: '#dc2626' },
  { id: 'g42_brooch', name: 'Sapphire Brooch', tier: 4, price: 350, charm: 550, icon: 'brooch', c1: '#60a5fa', c2: '#1d4ed8' },
  { id: 'g43_trophy', name: 'Grand Trophy', tier: 4, price: 380, charm: 600, icon: 'trophy', c1: '#fde047', c2: '#b45309' },
  { id: 'g44_sneaker', name: 'Winged Kicks', tier: 4, price: 400, charm: 640, icon: 'sneaker', c1: '#f472b6', c2: '#6366f1' },
  { id: 'g45_compass', name: 'Mystic Compass', tier: 4, price: 420, charm: 675, icon: 'compass', c1: '#fcd34d', c2: '#0d9488' },
  { id: 'g46_chalice', name: 'Emerald Chalice', tier: 4, price: 450, charm: 725, icon: 'chalice', c1: '#4ade80', c2: '#047857' },
  { id: 'g47_harp', name: 'Starlight Harp', tier: 4, price: 480, charm: 780, icon: 'harp', c1: '#e9d5ff', c2: '#9333ea' },
  { id: 'g48_feather', name: 'Phoenix Plume', tier: 4, price: 500, charm: 820, icon: 'feather', c1: '#fb923c', c2: '#e11d48' },

  /* Tier 5 — 5★ Legendary (12 gifts: 650–1,800 coins) */
  { id: 'g49_supercar', name: 'Hyper Supercar', tier: 5, price: 650, charm: 1100, icon: 'supercar', c1: '#fb7185', c2: '#b91c1c' },
  { id: 'g50_yacht', name: 'Private Yacht', tier: 5, price: 750, charm: 1280, icon: 'yacht', c1: '#7dd3fc', c2: '#1d4ed8' },
  { id: 'g51_dragon', name: 'Golden Dragon', tier: 5, price: 850, charm: 1460, icon: 'dragon', c1: '#fde047', c2: '#ea580c' },
  { id: 'g52_castle', name: 'Galaxy Castle', tier: 5, price: 950, charm: 1650, icon: 'castle', c1: '#c084fc', c2: '#4338ca' },
  { id: 'g53_scepter', name: 'Imperial Scepter', tier: 5, price: 1050, charm: 1850, icon: 'scepter', c1: '#ffd36b', c2: '#9333ea' },
  { id: 'g54_phoenix', name: 'Solar Phoenix', tier: 5, price: 1150, charm: 2050, icon: 'phoenix', c1: '#fb923c', c2: '#be123c' },
  { id: 'g55_chariot', name: 'Star Chariot', tier: 5, price: 1250, charm: 2250, icon: 'chariot', c1: '#fcd34d', c2: '#0284c7' },
  { id: 'g56_wings', name: 'Astral Wings', tier: 5, price: 1350, charm: 2450, icon: 'wings', c1: '#a5f3fc', c2: '#6366f1' },
  { id: 'g57_throne', name: 'Obsidian Throne', tier: 5, price: 1450, charm: 2680, icon: 'throne', c1: '#e879f9', c2: '#581c87' },
  { id: 'g58_violin', name: 'Nebula Violin', tier: 5, price: 1550, charm: 2900, icon: 'violin', c1: '#fbbf24', c2: '#9d174d' },
  { id: 'g59_mecha', name: 'Mecha Titan', tier: 5, price: 1680, charm: 3180, icon: 'mecha', c1: '#38bdf8', c2: '#0f766e' },
  { id: 'g60_tiara', name: 'Sovereign Tiara', tier: 5, price: 1800, charm: 3450, icon: 'tiara', c1: '#fef08a', c2: '#db2777' },

  /* Tier 6 — 6★ Mythic (12 gifts: 2,500–10,000 coins) */
  { id: 'g61_rocket', name: 'Cosmic Starship', tier: 6, price: 2500, charm: 5000, icon: 'rocket', c1: '#38bdf8', c2: '#7c3aed' },
  { id: 'g62_island', name: 'Diamond Island', tier: 6, price: 3000, charm: 6200, icon: 'island', c1: '#2dd4bf', c2: '#0284c7' },
  { id: 'g63_universe', name: 'Eternal Universe', tier: 6, price: 3500, charm: 7400, icon: 'universe', c1: '#e879f9', c2: '#312e81' },
  { id: 'g64_infcrown', name: 'Infinity Crown', tier: 6, price: 4200, charm: 9000, icon: 'infcrown', c1: '#ffd36b', c2: '#dc2626' },
  { id: 'g65_palace', name: 'Dragon Palace', tier: 6, price: 4800, charm: 10500, icon: 'palace', c1: '#fbbf24', c2: '#991b1b' },
  { id: 'g66_supernova', name: 'Supernova Heart', tier: 6, price: 5500, charm: 12400, icon: 'supernova', c1: '#f472b6', c2: '#f59e0b' },
  { id: 'g67_pegasus', name: 'Divine Pegasus', tier: 6, price: 6200, charm: 14200, icon: 'pegasus', c1: '#bae6fd', c2: '#8b5cf6' },
  { id: 'g68_airship', name: 'Starlight Airship', tier: 6, price: 7000, charm: 16400, icon: 'airship', c1: '#fcd34d', c2: '#0f766e' },
  { id: 'g69_citadel', name: 'Quantum Citadel', tier: 6, price: 7800, charm: 18600, icon: 'citadel', c1: '#67e8f9', c2: '#6d28d9' },
  { id: 'g70_aurora', name: 'Aurora Kingdom', tier: 6, price: 8500, charm: 20800, icon: 'aurora', c1: '#34d399', c2: '#ec4899' },
  { id: 'g71_vault', name: 'Emperor Vault', tier: 6, price: 9200, charm: 23000, icon: 'vault', c1: '#fde047', c2: '#b45309' },
  { id: 'g72_singularity', name: 'Celestial Core', tier: 6, price: 10000, charm: 26000, icon: 'singularity', c1: '#ffd36b', c2: '#a855f7' },

  /* Tier 7 — 7★ Sovereign Ultra-Luxury (6 gifts: 50,000–200,000 coins with Car Drive & Dream Palace Showcases) */
  { id: 'g73_jet', name: 'Royal Private Jet', tier: 7, price: 50000, charm: 10000, icon: 'privatejet', fx: 'palace', c1: '#e0f2fe', c2: '#0284c7' },
  { id: 'g74_yacht_gold', name: 'Golden Mega Yacht', tier: 7, price: 75000, charm: 15000, icon: 'megayacht', fx: 'palace', c1: '#fde047', c2: '#0f766e' },
  { id: 'g75_ferrari', name: 'Ferrari Hypercar', tier: 7, price: 100000, charm: 20000, icon: 'ferrari', fx: 'car', c1: '#ef4444', c2: '#991b1b' },
  { id: 'g76_lambo', name: 'Lamborghini Aventador', tier: 7, price: 130000, charm: 26000, icon: 'lambo', fx: 'car', c1: '#facc15', c2: '#b45309' },
  { id: 'g77_bugatti', name: 'Bugatti Sovereign', tier: 7, price: 160000, charm: 32000, icon: 'bugatti', fx: 'car', c1: '#38bdf8', c2: '#1e3a8a' },
  { id: 'g78_dream_palace', name: 'Dream Palace', tier: 7, price: 200000, charm: 40000, icon: 'dreampalace', fx: 'palace', c1: '#ffd36b', c2: '#9333ea' },

  /* Luxury Couple Rings & Squad Bond Gifts */
  { id: 'g_bond_bestie', name: 'Golden Bestie Locket', tier: 4, cat: 'ring', bondType: 'bestie', price: 300, charm: 60, icon: 'locket', c1: '#f472b6', c2: '#db2777' },
  { id: 'g_bond_bro', name: 'Squad Bro Crest', tier: 4, cat: 'ring', bondType: 'bro', price: 300, charm: 60, icon: 'bro_crest', c1: '#38bdf8', c2: '#1d4ed8' },
  { id: 'g_ring_silver', name: 'Silver Promise Ring', tier: 4, cat: 'ring', bondType: 'couple', weddingDays: 3, price: 500, charm: 100, icon: 'ring_band', c1: '#e2e8f0', c2: '#64748b' },
  { id: 'g_ring_rose', name: 'Rose Gold Love Ring', tier: 5, cat: 'ring', bondType: 'couple', weddingDays: 3, price: 2500, charm: 500, icon: 'ring_band', c1: '#fda4af', c2: '#e11d48' },
  { id: 'g_ring_diamond', name: 'Diamond Eternity Ring', tier: 6, cat: 'ring', bondType: 'couple', weddingDays: 7, price: 5000, charm: 1000, icon: 'ring_band', fx: 'ring', c1: '#bae6fd', c2: '#0284c7' },
  { id: 'g_ring_royal', name: 'Royal Crown Ring', tier: 6, cat: 'ring', bondType: 'couple', weddingDays: 7, price: 15000, charm: 3000, icon: 'ring_band', fx: 'ring', c1: '#ffd36b', c2: '#b45309' },
  { id: 'g_ring_cosmic', name: 'Cosmic Soulmate Ring', tier: 7, cat: 'ring', bondType: 'couple', weddingDays: 7, price: 50000, charm: 10000, icon: 'ring_band', fx: 'ring', c1: '#e879f9', c2: '#6d28d9' }
];

/* Enforce strict 5:1 Gold Coin-to-Charm ratio across every gift in the catalog */
function calcExactCharmForCoins(coins) {
  return Math.max(1, Math.floor(Math.max(0, Number(coins || 0)) / 5));
}
GIFT_CATALOG.forEach(g => {
  g.charm = calcExactCharmForCoins(g.price);
});

const GIFT_BY_ID = Object.fromEntries(GIFT_CATALOG.map(g => [g.id, g]));

/* ===== v13 Photorealistic 3D Luxury Gift & Ring Engine + 10,000+ Coin Continuous FX ===== */
const LUXURY_ANIM_MIN_COINS = 10000;
function isLuxuryAnimatedGift(giftOrPrice) {
  const price = typeof giftOrPrice === 'object' && giftOrPrice ? Number(giftOrPrice.price || 0) : Number(giftOrPrice || 0);
  return Number.isFinite(price) && price >= LUXURY_ANIM_MIN_COINS;
}

function renderLuxury10kFxHtml(gift, compact) {
  if (!isLuxuryAnimatedGift(gift)) return '';
  const count = Number(gift?.price || 0) >= 50000 ? (compact ? 4 : 6) : (compact ? 3 : 4);
  const particles = Array.from({ length: count }, (_, i) => {
    const left = 14 + ((i * 23) % 74);
    const top = 16 + ((i * 29) % 66);
    const delay = (i * 0.55).toFixed(2);
    const dur = (2.8 + (i % 3) * 0.7).toFixed(2);
    return `<i class="lux-ember" style="--lx:${left}%;--ly:${top}%;--ld:${delay}s;--lt:${dur}s"></i>`;
  }).join('');
  return `<span class="lux-10k-fx" aria-hidden="true"><span class="lux-shimmer-sweep"></span><span class="lux-aura-rim"></span>${particles}</span>`;
}

function giftGlyphPath(icon, c1, c2, gid) {
  const u = gid || 'g';
  const metA = `metA_${u}`, metB = `metB_${u}`, gemG = `gemG_${u}`, velG = `velG_${u}`;
  switch (icon) {
    case 'ring_band': return `
      <defs>
        <linearGradient id="${velG}" x1="10" y1="22" x2="38" y2="42" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#311042"/><stop offset="55%" stop-color="#190826"/><stop offset="100%" stop-color="#0a0314"/></linearGradient>
        <linearGradient id="${metA}" x1="12" y1="16" x2="36" y2="38" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#ffffff"/><stop offset="28%" stop-color="${c1}"/><stop offset="68%" stop-color="${c2}"/><stop offset="100%" stop-color="#fff8dc"/></linearGradient>
        <linearGradient id="${gemG}" x1="16" y1="5" x2="32" y2="22" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#ffffff"/><stop offset="35%" stop-color="#e0f2fe"/><stop offset="68%" stop-color="${c1}"/><stop offset="100%" stop-color="${c2}"/></linearGradient>
      </defs>
      <path d="M9 28c0-3 4-5.5 15-5.5s15 2.5 15 5.5v7.5c0 3.2-6 5.5-15 5.5S9 38.7 9 35.5V28z" fill="url(#${velG})" stroke="#ffd36b" stroke-opacity=".55" stroke-width="1"/>
      <ellipse cx="24" cy="28.5" rx="14.2" ry="4.4" fill="#3b0764" fill-opacity=".65"/>
      <ellipse cx="24" cy="27.8" rx="9.8" ry="8.4" fill="none" stroke="rgba(0,0,0,.45)" stroke-width="4.4" transform="translate(0,1.2)"/>
      <ellipse cx="24" cy="27.2" rx="9.8" ry="8.4" fill="none" stroke="url(#${metA})" stroke-width="3.6"/>
      <ellipse cx="24" cy="27.2" rx="9.8" ry="8.4" fill="none" stroke="#ffffff" stroke-opacity=".52" stroke-width="1" stroke-dasharray="14 26"/>
      <path d="M18.8 18.5l2.2-2.6h6l2.2 2.6-5.2 4.6-5.2-4.6z" fill="url(#${metA})" stroke="#ffffff" stroke-width=".6"/>
      <polygon points="24,6.2 31.8,13.6 24,21.5 16.2,13.6" fill="url(#${gemG})" stroke="#ffffff" stroke-width="1.15" stroke-linejoin="round"/>
      <polygon points="24,6.2 28.4,13.6 24,21.5 19.6,13.6" fill="#ffffff" fill-opacity=".42"/>
      <polygon points="16.2,13.6 31.8,13.6 24,10.2" fill="#ffffff" fill-opacity=".58"/>
      <path d="M24 3.5v3.2M24 12.2l5-5M15 9l2.5 1.8M33 9l-2.5 1.8" stroke="#ffffff" stroke-width="1.2" stroke-linecap="round" opacity=".9"/>
      <circle cx="20.5" cy="11.5" r="1.4" fill="#ffffff"/>`;

    case 'locket': return `
      <defs>
        <linearGradient id="${metA}" x1="10" y1="8" x2="38" y2="40" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#fff5f7"/><stop offset="32%" stop-color="#fbcfe8"/><stop offset="65%" stop-color="${c1}"/><stop offset="100%" stop-color="${c2}"/></linearGradient>
        <linearGradient id="${metB}" x1="14" y1="10" x2="34" y2="38" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#fef9c3"/><stop offset="50%" stop-color="#ffd36b"/><stop offset="100%" stop-color="#b45309"/></linearGradient>
      </defs>
      <path d="M16 14c1.5-5.5 14.5-5.5 16 0" fill="none" stroke="url(#${metB})" stroke-width="2.4" stroke-linecap="round"/>
      <circle cx="24" cy="12" r="2.2" fill="#fef08a" stroke="#b45309" stroke-width=".9"/>
      <path d="M24 39.5S11 31.2 11 21.8a7.4 7.4 0 0 1 13-4.8 7.4 7.4 0 0 1 13 4.8c0 9.4-13 17.7-13 17.7z" fill="url(#${metA})" stroke="url(#${metB})" stroke-width="2.1"/>
      <path d="M24 35.6S14.5 29.2 14.5 22.2a4.9 4.9 0 0 1 9.5-1.8 4.9 4.9 0 0 1 9.5 1.8c0 7-9.5 13.4-9.5 13.4z" fill="#831843" fill-opacity=".35" stroke="#fff" stroke-opacity=".45" stroke-width=".9"/>
      <polygon points="24,19 28.2,24.2 24,30.2 19.8,24.2" fill="#ffffff" stroke="#fde047" stroke-width="1"/>
      <polygon points="24,20.4 26.6,24.2 24,28.2 21.4,24.2" fill="#f472b6" fill-opacity=".75"/>
      <ellipse cx="18.2" cy="19.2" rx="3.2" ry="1.4" transform="rotate(-30 18.2 19.2)" fill="#ffffff" opacity=".75"/>`;

    case 'bro_crest': return `
      <defs>
        <linearGradient id="${metA}" x1="10" y1="6" x2="38" y2="42" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#f8fafc"/><stop offset="30%" stop-color="#7dd3fc"/><stop offset="72%" stop-color="#0284c7"/><stop offset="100%" stop-color="#1e3a8a"/></linearGradient>
        <linearGradient id="${metB}" x1="12" y1="8" x2="36" y2="40" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#ffffff"/><stop offset="45%" stop-color="#cbd5e1"/><stop offset="100%" stop-color="#475569"/></linearGradient>
      </defs>
      <path d="M24 6.5l14.5 5.8v11.5c0 8.8-5.9 14.8-14.5 18-8.6-3.2-14.5-9.2-14.5-18V12.3L24 6.5z" fill="url(#${metA})" stroke="url(#${metB})" stroke-width="2.1" stroke-linejoin="round"/>
      <path d="M24 10.2l11 4.4v8.8c0 6.8-4.5 11.4-11 14-6.5-2.6-11-7.2-11-14v-8.8l11-4.4z" fill="#0f172a" fill-opacity=".35" stroke="#bae6fd" stroke-opacity=".55" stroke-width=".9"/>
      <polygon points="24,14 26.8,20.2 33.4,21 28.4,25.4 29.8,32 24,28.6 18.2,32 19.6,25.4 14.6,21 21.2,20.2" fill="#fef08a" stroke="#b45309" stroke-width=".9" stroke-linejoin="round"/>
      <polygon points="24,16.5 25.8,21 24,25.5 22.2,21" fill="#ffffff" opacity=".75"/>
      <ellipse cx="19" cy="13.5" rx="5.5" ry="1.8" transform="rotate(-18 19 13.5)" fill="#ffffff" opacity=".55"/>`;

    case 'ferrari': return `
      <defs>
        <linearGradient id="${metA}" x1="5" y1="14" x2="43" y2="34" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#ff6b6b"/><stop offset="42%" stop-color="#ef4444"/><stop offset="82%" stop-color="#991b1b"/><stop offset="100%" stop-color="#450a0a"/></linearGradient>
        <linearGradient id="${metB}" x1="12" y1="17" x2="34" y2="25" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#e0f2fe"/><stop offset="50%" stop-color="#1e293b"/><stop offset="100%" stop-color="#020617"/></linearGradient>
      </defs>
      <ellipse cx="24" cy="34.8" rx="18" ry="2.8" fill="rgba(0,0,0,.55)"/>
      <path d="M5 29.5l3.5-6.2 9.2-4.4h11.6l8.6 4.2 5.4 2.2v4.8H5z" fill="url(#${metA})" stroke="#fca5a5" stroke-width="1.1" stroke-linejoin="round"/>
      <path d="M14.5 22.4l5.2-3.4h8.6l4.6 3.4H14.5z" fill="url(#${metB})" stroke="#fde047" stroke-width=".85"/>
      <path d="M9 26.5h29" stroke="#ffffff" stroke-opacity=".42" stroke-width="1.2" stroke-linecap="round"/>
      <path d="M38.5 25.5l4.2.9" stroke="#fef08a" stroke-width="2.1" stroke-linecap="round"/>
      <circle cx="14.8" cy="30.8" r="4.3" fill="#090d16" stroke="#ffd36b" stroke-width="1.5"/>
      <circle cx="14.8" cy="30.8" r="1.8" fill="#ef4444"/>
      <circle cx="34.2" cy="30.8" r="4.3" fill="#090d16" stroke="#ffd36b" stroke-width="1.5"/>
      <circle cx="34.2" cy="30.8" r="1.8" fill="#ef4444"/>`;

    case 'lambo': return `
      <defs>
        <linearGradient id="${metA}" x1="5" y1="15" x2="43" y2="34" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#fef9c3"/><stop offset="40%" stop-color="#facc15"/><stop offset="85%" stop-color="#b45309"/></linearGradient>
      </defs>
      <ellipse cx="24" cy="35" rx="18.2" ry="2.7" fill="rgba(0,0,0,.55)"/>
      <path d="M5 30.2l6.2-6.4 9.5-5.2h8.5l13.2 6.2 1 5.4H5z" fill="url(#${metA})" stroke="#fef08a" stroke-width="1.15" stroke-linejoin="round"/>
      <polygon points="14.8,23.2 22.2,18.8 29.4,18.8 34.6,23.2" fill="#0f172a" stroke="#e2e8f0" stroke-width=".75"/>
      <path d="M8.5 26.4h7.5" stroke="#ef4444" stroke-width="1.9" stroke-linecap="round"/>
      <path d="M22 26.8h14" stroke="#111827" stroke-opacity=".55" stroke-width="1.4" stroke-linecap="round"/>
      <circle cx="14.8" cy="31" r="4.3" fill="#0b1020" stroke="#f8fafc" stroke-width="1.5"/>
      <circle cx="14.8" cy="31" r="1.7" fill="#facc15"/>
      <circle cx="34.2" cy="31" r="4.3" fill="#0b1020" stroke="#f8fafc" stroke-width="1.5"/>
      <circle cx="34.2" cy="31" r="1.7" fill="#facc15"/>`;

    case 'bugatti': return `
      <defs>
        <linearGradient id="${metA}" x1="5" y1="15" x2="43" y2="34" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#bae6fd"/><stop offset="42%" stop-color="#0284c7"/><stop offset="85%" stop-color="#1e3a8a"/></linearGradient>
      </defs>
      <ellipse cx="24" cy="34.8" rx="18" ry="2.7" fill="rgba(0,0,0,.55)"/>
      <path d="M5.5 29.5c2.2-5.4 8.2-9.6 17.5-9.6h8.2c5 0 9.2 3.1 11.2 6.2v3.4H5.5z" fill="url(#${metA})" stroke="#e0f2fe" stroke-width="1.15"/>
      <path d="M15.8 20.8c3.2-2.2 9.4-2.2 13.4 0l3.2 3.2H13.8l2-3.2z" fill="#0f172a" stroke="#7dd3fc" stroke-width=".75"/>
      <path d="M21 23.6c4.2 0 6.2 4.2 2.1 6.4" fill="none" stroke="#ffd36b" stroke-width="1.8" stroke-linecap="round"/>
      <circle cx="14.8" cy="30.8" r="4.3" fill="#090d16" stroke="#7dd3fc" stroke-width="1.5"/>
      <circle cx="34.2" cy="30.8" r="4.3" fill="#090d16" stroke="#7dd3fc" stroke-width="1.5"/>`;

    case 'dreampalace': return `
      <defs>
        <linearGradient id="${metA}" x1="12" y1="6" x2="36" y2="36" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#fffbeb"/><stop offset="45%" stop-color="#ffd36b"/><stop offset="100%" stop-color="#b45309"/></linearGradient>
        <linearGradient id="${metB}" x1="8" y1="18" x2="40" y2="38" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#a855f7"/><stop offset="55%" stop-color="#6d28d9"/><stop offset="100%" stop-color="#2e1065"/></linearGradient>
      </defs>
      <path d="M8 36.5V22.5h5v-5l4-4 4 4v5h6v-5l4-4 4 4v5h5v14H8z" fill="url(#${metB})" stroke="url(#${metA})" stroke-width="1.35" stroke-linejoin="round"/>
      <path d="M15.5 22.5c0-7.2 4.2-12.5 8.5-14.8 4.3 2.3 8.5 7.6 8.5 14.8h-17z" fill="url(#${metA})" stroke="#ffffff" stroke-width="1"/>
      <path d="M24 4.8v4.2" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round"/>
      <circle cx="24" cy="5.5" r="1.4" fill="#fef08a"/>
      <rect x="20.2" y="26.5" width="7.6" height="10" rx="3.8" fill="#fef08a" stroke="#f59e0b" stroke-width="1"/>
      <rect x="11.5" y="26" width="4.2" height="6.5" rx="2" fill="#fde047" opacity=".88"/>
      <rect x="32.3" y="26" width="4.2" height="6.5" rx="2" fill="#fde047" opacity=".88"/>
      <rect x="6.5" y="35.5" width="35" height="2.6" rx="1.3" fill="url(#${metA})"/>`;

    case 'megayacht': return `
      <defs>
        <linearGradient id="${metA}" x1="8" y1="14" x2="40" y2="36" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#fef9c3"/><stop offset="50%" stop-color="#f59e0b"/><stop offset="100%" stop-color="#b45309"/></linearGradient>
      </defs>
      <ellipse cx="24" cy="36.8" rx="17" ry="2.4" fill="rgba(56,189,248,.42)"/>
      <path d="M6.5 28.5h35l-5.2 8.2H11.7l-5.2-8.2z" fill="#f8fafc" stroke="#fde047" stroke-width="1.3"/>
      <path d="M12 23.2h24l-3.2 5.3H12v-5.3z" fill="url(#${metA})" stroke="#ffffff" stroke-width=".9"/>
      <path d="M16.5 18.2h14.5l-2.4 5H16.5v-5z" fill="#fffbeb" stroke="#f59e0b" stroke-width="1"/>
      <rect x="18.5" y="19.6" width="9.5" height="2.2" rx="1" fill="#0f172a"/>
      <path d="M11 32h26" stroke="url(#${metA})" stroke-width="1.9" stroke-linecap="round"/>`;

    case 'privatejet': return `
      <defs>
        <linearGradient id="${metA}" x1="8" y1="10" x2="40" y2="36" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#ffffff"/><stop offset="55%" stop-color="#e0f2fe"/><stop offset="100%" stop-color="#38bdf8"/></linearGradient>
      </defs>
      <path d="M7.5 29.2l12.5-4.4 14.2-12.2 6.2-1.2-9.2 12.2 7.2 3.2-3 3.2-9.2-2.2-7 8-3.2-1.1 3.1-7.2-11.6-1.1z" fill="url(#${metA})" stroke="#0284c7" stroke-width="1.25" stroke-linejoin="round"/>
      <path d="M21 22.5l13-9.8" stroke="#ffd36b" stroke-width="2" stroke-linecap="round"/>
      <circle cx="34.5" cy="12.5" r="1.5" fill="#ffffff"/>`;

    case 'crown':
    case 'infcrown': return `
      <defs>
        <linearGradient id="${metA}" x1="9" y1="10" x2="39" y2="36" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#fffbeb"/><stop offset="40%" stop-color="#ffd36b"/><stop offset="85%" stop-color="#d97706"/></linearGradient>
      </defs>
      <polygon points="9.5,32.5 12.8,15.5 19.8,22.5 24,10.8 28.2,22.5 35.2,15.5 38.5,32.5" fill="url(#${metA})" stroke="#fef9c3" stroke-width="1.3" stroke-linejoin="round"/>
      <rect x="10.5" y="32" width="27" height="4.4" rx="2" fill="${c2}" stroke="#fef08a" stroke-width="1"/>
      <circle cx="24" cy="11" r="2.2" fill="#ffffff"/>
      <polygon points="24,21.5 26.8,26 24,30 21.2,26" fill="#ef4444" stroke="#ffffff" stroke-width=".75"/>
      <circle cx="15.8" cy="27.2" r="1.8" fill="#38bdf8"/>
      <circle cx="32.2" cy="27.2" r="1.8" fill="#38bdf8"/>`;

    case 'diamond': return `
      <defs>
        <linearGradient id="${gemG}" x1="16" y1="7" x2="32" y2="23" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#ffffff"/><stop offset="45%" stop-color="#bae6fd"/><stop offset="100%" stop-color="#0284c7"/></linearGradient>
      </defs>
      <circle cx="24" cy="28" r="9.8" fill="none" stroke="#ffd36b" stroke-width="3.6"/>
      <circle cx="24" cy="28" r="9.8" fill="none" stroke="#ffffff" stroke-opacity=".55" stroke-width="1" stroke-dasharray="12 24"/>
      <polygon points="24,7.5 32,14.8 24,22 16,14.8" fill="url(#${gemG})" stroke="#ffffff" stroke-width="1.2"/>
      <polygon points="24,7.5 28,14.8 24,22 20,14.8" fill="#ffffff" fill-opacity=".42"/>`;

    case 'rose': return `<path d="M24 36.5V23" stroke="#16a34a" stroke-width="2.6" stroke-linecap="round"/><path d="M24 30c-5 0-7-3-7-5 3 0 6 1 7 5zm0-2c5 0 7-3 7-5-3 0-6 1-7 5z" fill="#4ade80"/><path d="M24 9.5c5.4 0 8.5 4.2 8.5 8.5S28.8 25.5 24 25.5 15.5 22.3 15.5 18s3.1-8.5 8.5-8.5z" fill="${c2}" stroke="#fecdd3" stroke-width=".9"/><path d="M24 11.8c3.2 0 5.4 2.6 5.4 5.6S27.2 22.5 24 22.5s-5.4-1.8-5.4-5.1 2.2-5.6 5.4-5.6z" fill="${c1}"/><path d="M21.2 15.8c1.6-2 4.2-2 5.4 0" stroke="#fff" stroke-width="1.6" stroke-linecap="round" fill="none"/>`;
    case 'coffee': return `<rect x="13" y="18" width="18" height="15" rx="4" fill="${c1}" stroke="#fef3c7" stroke-width="1"/><path d="M31 20h3a4 4 0 0 1 0 8h-3" stroke="${c1}" stroke-width="2.6" fill="none"/><path d="M11 35h22" stroke="${c2}" stroke-width="2.8" stroke-linecap="round"/><path d="M18 14c0-2 2-2 2-4M24 14c0-2 2-2 2-4" stroke="#fde68a" stroke-width="1.8" stroke-linecap="round" fill="none"/>`;
    case 'plane': return `<path d="M37 11L11 22l9 4 4 10 13-25z" fill="${c1}" stroke="${c2}" stroke-width="1.4" stroke-linejoin="round"/><path d="M20 26L37 11" stroke="#fff" stroke-width="1.5"/>`;
    case 'clover': return `<circle cx="19" cy="18" r="5.5" fill="${c1}"/><circle cx="29" cy="18" r="5.5" fill="${c1}"/><circle cx="19" cy="27" r="5.5" fill="${c2}"/><circle cx="29" cy="27" r="5.5" fill="${c2}"/><path d="M24 29c0 4 2 7 5 8" stroke="#4ade80" stroke-width="2.5" stroke-linecap="round" fill="none"/>`;
    case 'pencil': return `<path d="M13 35l3-9L30 12l6 6-14 14-9 3z" fill="${c1}" stroke="${c2}" stroke-width="1.5" stroke-linejoin="round"/><path d="M28 14l6 6" stroke="#fff" stroke-width="1.8"/><circle cx="14" cy="14" r="2.2" fill="#fff"/>`;
    case 'candy': return `<path d="M11 24l6-5v10l-6-5zm26 0l-6-5v10l6-5z" fill="${c2}"/><circle cx="24" cy="24" r="7.5" fill="${c1}" stroke="#fff" stroke-width=".9"/><path d="M19 21c3-2 7-2 10 0M19 27c3 2 7 2 10 0" stroke="#fff" stroke-width="1.6" stroke-linecap="round" fill="none"/>`;
    case 'paw': return `<ellipse cx="24" cy="28" rx="7.5" ry="6" fill="${c1}"/><circle cx="15" cy="20" r="3" fill="${c2}"/><circle cx="21" cy="16" r="3" fill="${c2}"/><circle cx="27" cy="16" r="3" fill="${c2}"/><circle cx="33" cy="20" r="3" fill="${c2}"/>`;
    case 'heart': return `<path d="M24 36s-12-7.5-12-16a7 7 0 0 1 12-4.8A7 7 0 0 1 36 20c0 8.5-12 16-12 16z" fill="${c1}" stroke="#fff" stroke-width="1.2"/><path d="M17 18a3 3 0 0 1 3-2.5" stroke="#fff" stroke-width="1.8" stroke-linecap="round" fill="none"/>`;
    case 'sun': return `<circle cx="24" cy="24" r="7.5" fill="${c1}" stroke="${c2}" stroke-width="1.6"/><path d="M24 10v4M24 34v4M10 24h4M34 24h4M14 14l3 3M31 31l3 3M34 14l-3 3M17 31l-3 3" stroke="${c1}" stroke-width="2.2" stroke-linecap="round"/>`;
    case 'note': return `<path d="M20 31V15l14-3v15" stroke="${c1}" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/><circle cx="17" cy="31" r="4" fill="${c2}"/><circle cx="31" cy="28" r="4" fill="${c1}"/>`;
    case 'boba': return `<path d="M15 17h18l-2 19H17l-2-19z" fill="${c1}" stroke="${c2}" stroke-width="1.6"/><path d="M24 9v10" stroke="#fff" stroke-width="2.8" stroke-linecap="round"/><circle cx="20" cy="32" r="1.8" fill="#1e293b"/><circle cx="24" cy="33" r="1.8" fill="#1e293b"/><circle cx="28" cy="32" r="1.8" fill="#1e293b"/>`;
    case 'crane': return `<path d="M10 25l14-9 14 7-12 5-4 8-4-7-8-4z" fill="${c1}" stroke="${c2}" stroke-width="1.4" stroke-linejoin="round"/><path d="M24 16l2 12" stroke="#fff" stroke-width="1.4"/>`;
    case 'bouquet': return `<path d="M16 25l8 12 8-12z" fill="#fde68a" stroke="#d97706" stroke-width="1"/><circle cx="19" cy="19" r="5" fill="${c1}"/><circle cx="29" cy="19" r="5" fill="${c2}"/><circle cx="24" cy="15" r="5.5" fill="#fb7185" stroke="#fff" stroke-width=".9"/>`;
    case 'choco': return `<rect x="12" y="14" width="24" height="20" rx="4" fill="${c1}" stroke="${c2}" stroke-width="1.6"/><path d="M24 14v20M12 24h24" stroke="#fde047" stroke-width="2.4"/><circle cx="24" cy="24" r="3" fill="#f43f5e"/>`;
    case 'bear': return `<circle cx="16" cy="16" r="4.5" fill="${c2}"/><circle cx="32" cy="16" r="4.5" fill="${c2}"/><circle cx="24" cy="25" r="10.5" fill="${c1}"/><ellipse cx="24" cy="28" rx="4.5" ry="3.5" fill="#fef3c7"/><circle cx="20.5" cy="23" r="1.4" fill="#1e293b"/><circle cx="27.5" cy="23" r="1.4" fill="#1e293b"/><circle cx="24" cy="26.5" r="1.3" fill="#78350f"/>`;
    case 'cupcake': return `<path d="M15 24h18l-2.5 11h-13L15 24z" fill="${c2}"/><path d="M13 24c0-5 5-8 11-8s11 3 11 8H13z" fill="${c1}"/><circle cx="24" cy="13.5" r="2.8" fill="#ef4444"/>`;
    case 'ribbon': return `<path d="M24 23l-11-7v14l11-7zm0 0l11-7v14l-11-7z" fill="${c1}" stroke="${c2}" stroke-width="1.4" stroke-linejoin="round"/><circle cx="24" cy="23" r="3.5" fill="#fff"/><path d="M22 26l-4 10M26 26l4 10" stroke="${c1}" stroke-width="2.6" stroke-linecap="round"/>`;
    case 'headphone': return `<path d="M13 26v-3a11 11 0 0 1 22 0v3" stroke="${c1}" stroke-width="3" fill="none"/><rect x="10" y="24" width="6" height="10" rx="3" fill="${c2}"/><rect x="32" y="24" width="6" height="10" rx="3" fill="${c2}"/>`;
    case 'lantern': return `<ellipse cx="24" cy="23" rx="9" ry="11" fill="${c1}" stroke="${c2}" stroke-width="1.6"/><path d="M19 13h10M19 33h10M24 34v5" stroke="#fde047" stroke-width="2" stroke-linecap="round"/>`;
    case 'camera': return `<rect x="11" y="16" width="26" height="19" rx="4" fill="${c1}" stroke="${c2}" stroke-width="1.6"/><circle cx="24" cy="25.5" r="5.5" fill="#0f172a" stroke="#fff" stroke-width="1.8"/><rect x="15" y="13" width="6" height="3" rx="1" fill="${c2}"/>`;
    case 'sakura': return `<g fill="${c1}" stroke="${c2}" stroke-width="1">${[0,72,144,216,288].map(a=>`<ellipse cx="24" cy="15" rx="3.8" ry="6.5" transform="rotate(${a} 24 24)"/>`).join('')}</g><circle cx="24" cy="24" r="3.2" fill="#fde047"/>`;
    case 'moon': return `<path d="M29 12a12 12 0 1 0 6 22 10 10 0 1 1-6-22z" fill="${c1}" stroke="${c2}" stroke-width="1.4"/><circle cx="31" cy="17" r="2" fill="#fff"/>`;
    case 'fox': return `<path d="M13 13l6 7h10l6-7 1 13-12 10-12-10 1-13z" fill="${c1}" stroke="${c2}" stroke-width="1.5" stroke-linejoin="round"/><path d="M19 25l5 8 5-8z" fill="#fff7ed"/><circle cx="20" cy="23" r="1.4" fill="#1e293b"/><circle cx="28" cy="23" r="1.4" fill="#1e293b"/>`;
    case 'sparkler': return `<path d="M13 35l14-14" stroke="#cbd5e1" stroke-width="2.5" stroke-linecap="round"/><path d="M29 11l2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6z" fill="${c1}" stroke="${c2}" stroke-width="1.2"/>`;
    case 'crystal': return `<polygon points="24,8.5 36.5,19 24,38.5 11.5,19" fill="${c1}" stroke="#fff" stroke-width="1.3"/><polygon points="24,8.5 30,19 24,38.5 18,19" fill="#fff" opacity=".42"/>`;
    case 'wand': return `<path d="M12 36l15-15" stroke="${c2}" stroke-width="3" stroke-linecap="round"/><polygon points="29,9 31.5,15 38,15.5 33,19.5 34.5,26 29,22.5 23.5,26 25,19.5 20,15.5 26.5,15" fill="${c1}" stroke="#fff" stroke-width="1"/>`;
    case 'book': return `<path d="M11 15c4-2 9-2 13 1 4-3 9-3 13-1v19c-4-2-9-2-13 1-4-3-9-3-13-1V15z" fill="${c1}" stroke="${c2}" stroke-width="1.6"/><path d="M24 16v19" stroke="${c2}" stroke-width="1.8"/>`;
    case 'skate': return `<rect x="10" y="20" width="28" height="8" rx="4" fill="${c1}" stroke="${c2}" stroke-width="1.6"/><circle cx="17" cy="31" r="3" fill="#fde047"/><circle cx="31" cy="31" r="3" fill="#fde047"/>`;
    case 'gamepad': return `<rect x="10" y="17" width="28" height="15" rx="7" fill="${c1}" stroke="${c2}" stroke-width="1.6"/><path d="M16 24.5h5M18.5 22v5" stroke="#fff" stroke-width="2" stroke-linecap="round"/><circle cx="30" cy="23" r="1.6" fill="#fde047"/><circle cx="33" cy="26" r="1.6" fill="#f472b6"/>`;
    case 'vinyl': return `<circle cx="24" cy="24" r="13" fill="#1e293b" stroke="${c1}" stroke-width="2"/><circle cx="24" cy="24" r="8" fill="none" stroke="rgba(255,255,255,.22)" stroke-width="1.2"/><circle cx="24" cy="24" r="4.5" fill="${c1}"/><circle cx="24" cy="24" r="1.5" fill="#0f172a"/>`;
    case 'firefly': return `<rect x="15" y="15" width="18" height="21" rx="6" fill="rgba(255,255,255,.14)" stroke="${c2}" stroke-width="1.8"/><rect x="17" y="11" width="14" height="4" rx="1.5" fill="${c2}"/><circle cx="21" cy="24" r="2.2" fill="${c1}"/><circle cx="28" cy="28" r="2.4" fill="#fde047"/><circle cx="25" cy="20" r="1.6" fill="#fff"/>`;
    case 'meteor': return `<circle cx="24" cy="24" r="8" fill="${c1}"/><ellipse cx="24" cy="24" rx="15" ry="5" transform="rotate(-24 24 24)" fill="none" stroke="${c2}" stroke-width="2.4"/><circle cx="34" cy="16" r="2.4" fill="#fde047"/>`;
    case 'pearl': return `<path d="M11 27c2-9 9-14 13-14s11 5 13 14c-4 5-9 7-13 7s-9-2-13-7z" fill="${c2}"/><circle cx="24" cy="25" r="5.5" fill="#f8fafc" stroke="${c1}" stroke-width="1.6"/>`;
    case 'perfume': return `<rect x="15" y="19" width="18" height="17" rx="5" fill="${c1}" stroke="${c2}" stroke-width="1.6"/><rect x="20" y="12" width="8" height="6" rx="1.5" fill="#fde047"/><path d="M19 26h10" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/>`;
    case 'maneki': return `<circle cx="24" cy="25" r="11" fill="#fff7ed" stroke="${c2}" stroke-width="1.8"/><polygon points="15,17 17,11 22,15" fill="${c2}"/><polygon points="33,17 31,11 26,15" fill="${c2}"/><circle cx="24" cy="31" r="3" fill="${c1}"/>`;
    case 'prism': return `<polygon points="24,10 37,22 24,37 11,22" fill="${c1}" stroke="#fff" stroke-width="1.4"/><path d="M24 10v27M11 22h26" stroke="#fff" stroke-width="1.2" opacity=".7"/>`;
    case 'katana': return `<path d="M12 36L35 12" stroke="${c1}" stroke-width="3.2" stroke-linecap="round"/><path d="M16 27l5 5" stroke="#ffd36b" stroke-width="3" stroke-linecap="round"/><path d="M12 36l6-6" stroke="${c2}" stroke-width="4" stroke-linecap="round"/>`;
    case 'drone': return `<rect x="18" y="20" width="12" height="8" rx="3" fill="${c1}" stroke="${c2}" stroke-width="1.5"/><path d="M12 16h8M28 16h8M12 32h8M28 32h8M18 22l-4-6M30 22l4-6M18 26l-4 6M30 26l4 6" stroke="${c1}" stroke-width="2" stroke-linecap="round"/>`;
    case 'guitar': return `<path d="M29 12l7 7-12 12c-3 3-8 3-11 0s-3-8 0-11l16-8z" fill="${c1}" stroke="${c2}" stroke-width="1.5"/><circle cx="19" cy="29" r="3" fill="#0f172a"/>`;
    case 'brooch': return `<ellipse cx="24" cy="24" rx="10" ry="13" fill="${c1}" stroke="#ffd36b" stroke-width="2.4"/><ellipse cx="24" cy="24" rx="5.5" ry="8" fill="${c2}"/>`;
    case 'trophy': return `<path d="M15 13h18v9a9 9 0 0 1-18 0v-9z" fill="${c1}" stroke="#fef9c3" stroke-width="1.4"/><path d="M15 16h-4a3 3 0 0 0 3 6h1M33 16h4a3 3 0 0 1-3 6h-1M24 31v5M17 36h14" stroke="#ffd36b" stroke-width="2.4" stroke-linecap="round" fill="none"/>`;
    case 'sneaker': return `<path d="M10 29c4-6 10-8 16-8l5 5h7v6H10v-3z" fill="${c1}" stroke="${c2}" stroke-width="1.5" stroke-linejoin="round"/><path d="M17 21l-5-7 8 3" fill="#fff"/>`;
    case 'compass': return `<circle cx="24" cy="24" r="12" fill="none" stroke="${c1}" stroke-width="2.6"/><polygon points="24,14 28,24 24,34 20,24" fill="${c2}"/><polygon points="24,14 28,24 24,24" fill="#ef4444"/>`;
    case 'chalice': return `<path d="M15 13h18l-3 12a6 6 0 0 1-12 0l-3-12z" fill="${c1}" stroke="${c2}" stroke-width="1.6"/><path d="M24 29v7M17 36h14" stroke="#ffd36b" stroke-width="2.6" stroke-linecap="round"/>`;
    case 'harp': return `<path d="M15 35V13c7 0 14 4 18 11l-4 11H15z" fill="none" stroke="${c1}" stroke-width="2.6" stroke-linejoin="round"/><path d="M19 15v20M23 17v18M27 20v15" stroke="${c2}" stroke-width="1.5"/>`;
    case 'feather': return `<path d="M35 11C24 11 14 20 13 35c14-1 22-11 22-24z" fill="${c1}" stroke="${c2}" stroke-width="1.5"/><path d="M12 36L33 14" stroke="#fef08a" stroke-width="1.8" stroke-linecap="round"/>`;
    case 'supercar': return `<path d="M8 28l4-7h12l7-4 9 5v6H8z" fill="${c1}" stroke="#fca5a5" stroke-width="1.3" stroke-linejoin="round"/><circle cx="16" cy="30" r="3.6" fill="#0f172a" stroke="#ffd36b" stroke-width="1.6"/><circle cx="33" cy="30" r="3.6" fill="#0f172a" stroke="#ffd36b" stroke-width="1.6"/>`;
    case 'yacht': return `<path d="M9 28h30l-4 7H13l-4-7z" fill="#f8fafc" stroke="${c2}" stroke-width="1.5"/><polygon points="22,11 22,26 12,26" fill="${c1}"/><polygon points="25,14 25,26 35,26" fill="${c2}"/>`;
    case 'dragon': return `<path d="M11 28c2-9 9-15 17-15 5 0 9 3 9 8 0 6-6 9-12 9 3 3 7 4 11 4-6 4-16 4-25-6z" fill="${c1}" stroke="${c2}" stroke-width="1.6"/><circle cx="30" cy="19" r="1.8" fill="#dc2626"/>`;
    case 'castle': return `<path d="M12 36V20h5v4h4V14l3-4 3 4v10h4v-4h5v16H12z" fill="${c1}" stroke="${c2}" stroke-width="1.5" stroke-linejoin="round"/><rect x="21" y="28" width="6" height="8" rx="3" fill="#0f172a"/>`;
    case 'scepter': return `<path d="M13 36l16-16" stroke="#ffd36b" stroke-width="3" stroke-linecap="round"/><circle cx="31" cy="17" r="6" fill="${c1}" stroke="#fff" stroke-width="1.4"/><circle cx="31" cy="17" r="2.2" fill="#fff"/>`;
    case 'phoenix': return `<path d="M24 35c-4-7-12-9-14-17 5 1 9 4 11 7 0-6 1-11 3-14 2 3 3 8 3 14 2-3 6-6 11-7-2 8-10 10-14 17z" fill="${c1}" stroke="${c2}" stroke-width="1.4"/>`;
    case 'chariot': return `<path d="M12 24h22l-3 7H15l-3-7z" fill="${c1}" stroke="${c2}" stroke-width="1.5"/><circle cx="18" cy="32" r="4" fill="none" stroke="#ffd36b" stroke-width="2.2"/><circle cx="30" cy="32" r="4" fill="none" stroke="#ffd36b" stroke-width="2.2"/><path d="M17 20l7-8 7 8" stroke="#fff" stroke-width="1.8" fill="none"/>`;
    case 'wings': return `<path d="M23 28C14 26 9 18 10 11c5 3 10 7 13 13 3-6 8-10 13-13 1 7-4 15-13 17z" fill="${c1}" stroke="${c2}" stroke-width="1.5"/><circle cx="24" cy="29" r="3" fill="#ffd36b"/>`;
    case 'throne': return `<path d="M15 36V14l9-4 9 4v22h-4v-9H19v9h-4z" fill="${c1}" stroke="${c2}" stroke-width="1.6"/><path d="M12 26h24" stroke="#ffd36b" stroke-width="2.5" stroke-linecap="round"/>`;
    case 'violin': return `<path d="M26 11l4 4-6 6c4 4 4 10 0 13s-9 3-12 0-3-8 1-12l13-11z" fill="${c1}" stroke="${c2}" stroke-width="1.5"/><path d="M15 33l14-18" stroke="#fef08a" stroke-width="1.4"/>`;
    case 'mecha': return `<rect x="14" y="13" width="20" height="19" rx="5" fill="${c1}" stroke="${c2}" stroke-width="1.8"/><rect x="18" y="19" width="12" height="5" rx="2" fill="#0f172a"/><circle cx="21" cy="21.5" r="1.4" fill="#fde047"/><circle cx="27" cy="21.5" r="1.4" fill="#fde047"/><path d="M24 9v4M17 35h14" stroke="#ffd36b" stroke-width="2.2" stroke-linecap="round"/>`;
    case 'tiara': return `<path d="M10 30c3-10 9-16 14-18 5 2 11 8 14 18H10z" fill="none" stroke="${c1}" stroke-width="2.4" stroke-linejoin="round"/><polygon points="24,11 28,20 24,25 20,20" fill="${c2}"/>`;
    case 'rocket': return `<path d="M24 8c6 5 8 13 7 21H17c-1-8 1-16 7-21z" fill="${c1}" stroke="${c2}" stroke-width="1.6"/><circle cx="24" cy="19" r="3.2" fill="#fff"/><path d="M17 25l-5 6h5M31 25l5 6h-5M21 31l3 7 3-7" fill="#f59e0b"/>`;
    case 'island': return `<ellipse cx="24" cy="31" rx="14" ry="5" fill="${c2}"/><polygon points="24,10 34,25 24,31 14,25" fill="${c1}" stroke="#fff" stroke-width="1.3"/>`;
    case 'universe': return `<circle cx="24" cy="24" r="7.5" fill="${c1}"/><ellipse cx="24" cy="24" rx="16" ry="5.5" transform="rotate(-20 24 24)" fill="none" stroke="#ffd36b" stroke-width="2"/><ellipse cx="24" cy="24" rx="16" ry="5.5" transform="rotate(28 24 24)" fill="none" stroke="${c2}" stroke-width="1.8"/>`;
    case 'palace': return `<path d="M10 35V22l14-11 14 11v13H10z" fill="${c1}" stroke="${c2}" stroke-width="1.6"/><path d="M8 22l16-12 16 12" stroke="#ffd36b" stroke-width="2.4" fill="none"/><rect x="20" y="25" width="8" height="10" rx="2" fill="${c2}"/>`;
    case 'supernova': return `<polygon points="24,7 28,18 40,18 30,25 34,37 24,30 14,37 18,25 8,18 20,18" fill="${c1}" stroke="#fff" stroke-width="1.3"/><circle cx="24" cy="23" r="5" fill="#fff"/>`;
    case 'pegasus': return `<path d="M12 29c2-9 9-16 19-16-2 5-1 8 4 10-5 2-8 6-9 12-5-1-10-3-14-6z" fill="${c1}" stroke="${c2}" stroke-width="1.5"/><path d="M16 19l-7-7 11 3" fill="#fff"/>`;
    case 'airship': return `<ellipse cx="24" cy="20" rx="14" ry="8.5" fill="${c1}" stroke="${c2}" stroke-width="1.6"/><rect x="19" y="30" width="10" height="5" rx="2" fill="#ffd36b"/><path d="M20 28v2M28 28v2" stroke="#fff" stroke-width="1.6"/>`;
    case 'citadel': return `<polygon points="24,8 35,16 32,35 16,35 13,16" fill="${c1}" stroke="${c2}" stroke-width="1.6"/><polygon points="24,14 29,22 24,30 19,22" fill="#fff" opacity=".85"/>`;
    case 'aurora': return `<path d="M10 32c4-14 10-20 14-20s10 6 14 20H10z" fill="${c1}" stroke="${c2}" stroke-width="1.6"/><path d="M13 24c4-5 18-5 22 0" stroke="#fff" stroke-width="2" fill="none"/>`;
    case 'vault': return `<rect x="11" y="12" width="26" height="24" rx="5" fill="${c1}" stroke="${c2}" stroke-width="1.8"/><circle cx="24" cy="24" r="6" fill="#0f172a" stroke="#ffd36b" stroke-width="2"/><path d="M24 19v10M19 24h10" stroke="#ffd36b" stroke-width="1.8"/>`;
    default: return `<circle cx="24" cy="24" r="10.5" fill="${c2}" stroke="#ffd36b" stroke-width="2.2"/><circle cx="24" cy="24" r="5" fill="#fff"/><ellipse cx="24" cy="24" rx="16.5" ry="5.5" fill="none" stroke="${c1}" stroke-width="2" transform="rotate(-24 24 24)"/><ellipse cx="24" cy="24" rx="16.5" ry="5.5" fill="none" stroke="#fef08a" stroke-opacity=".75" stroke-width="1.4" transform="rotate(26 24 24)"/>`;
  }
}

let _giftSvgSeq = 0;
function giftSvg(giftOrId, size = 44) {
  const g = typeof giftOrId === 'string' ? GIFT_BY_ID[giftOrId] : giftOrId;
  if (!g) return '';
  const tier = GIFT_TIERS[g.tier] || GIFT_TIERS[1];
  const gid = esc(g.id || 'g') + '_' + (++_giftSvgSeq);
  const isLux10k = isLuxuryAnimatedGift(g);
  const isRing = g.cat === 'ring';
  return `<svg class="gift-svg gift-3d-emblem ${isLux10k ? 'lux-10k-art' : ''} ${isRing ? 'gift-ring-art' : ''}" width="${size}" height="${size}" viewBox="0 0 48 48" aria-hidden="true">
    <defs>
      <radialGradient id="gbg_${gid}" cx="30%" cy="18%" r="85%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="${isLux10k ? '0.68' : '0.52'}"/>
        <stop offset="28%" stop-color="${g.c1}" stop-opacity="${isRing ? '0.42' : '0.54'}"/>
        <stop offset="72%" stop-color="${g.c2}" stop-opacity="0.82"/>
        <stop offset="100%" stop-color="#070a18" stop-opacity="0.96"/>
      </radialGradient>
      <linearGradient id="grm_${gid}" x1="3" y1="3" x2="45" y2="45" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="32%" stop-color="${isLux10k ? '#fef08a' : tier.color}"/>
        <stop offset="68%" stop-color="${g.c1}"/>
        <stop offset="100%" stop-color="${isLux10k ? '#b45309' : g.c2}"/>
      </linearGradient>
      <linearGradient id="gspec_${gid}" x1="12" y1="4" x2="34" y2="21" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.72"/>
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <ellipse cx="24" cy="44.2" rx="14.5" ry="3" fill="rgba(0,0,0,0.52)"/>
    <circle cx="24" cy="23.5" r="21.4" fill="url(#gbg_${gid})" stroke="url(#grm_${gid})" stroke-width="${isLux10k ? '2.4' : '1.9'}"/>
    <circle cx="24" cy="23.5" r="18.6" fill="none" stroke="rgba(255,255,255,${isLux10k ? '0.4' : '0.22'})" stroke-width="0.95"/>
    ${isLux10k ? `<circle cx="24" cy="23.5" r="16.2" fill="none" stroke="rgba(255,229,143,0.28)" stroke-width="0.75" stroke-dasharray="3 3"/>` : ''}
    <ellipse cx="20.5" cy="11" rx="13" ry="5.6" fill="url(#gspec_${gid})"/>
    <g transform="translate(0,-0.4)" filter="drop-shadow(0 3.5px 4.5px rgba(0,0,0,0.62))">${giftGlyphPath(g.icon, g.c1, g.c2, gid)}</g>
    <circle cx="35.5" cy="11.5" r="1.8" fill="#ffffff" opacity="0.92"/>
    ${isLux10k ? `<path d="M10.5 11.5l1.1 2.8 2.8 1.1-2.8 1.1-1.1 2.8-1.1-2.8-2.8-1.1 2.8-1.1z" fill="#fef08a" opacity="0.9"/>` : ''}
  </svg>`;
}

/* Panoramic Multi-Layer Showcase Artwork for Tier 7 Luxury Gifts (Ferrari, Lamborghini, Bugatti, Dream Palace, Mega Yacht, Private Jet) */
function luxuryShowcaseSvg(gift) {
  if (!gift) return '';
  if (gift.fx === 'car') {
    const isLambo = gift.id === 'g76_lambo';
    const isBugatti = gift.id === 'g77_bugatti';
    const bodyGradA = isLambo ? '#fde047' : (isBugatti ? '#38bdf8' : '#ff3b3b');
    const bodyGradB = isLambo ? '#ca8a04' : (isBugatti ? '#1d4ed8' : '#991b1b');
    const accent = isLambo ? '#111827' : (isBugatti ? '#0f172a' : '#ffd36b');
    const rim = isLambo ? '#f8fafc' : (isBugatti ? '#7dd3fc' : '#ffd36b');
    const bodyPath = isLambo
      ? 'M26 88 L46 66 L102 48 L170 46 L236 62 L288 74 L296 88 L292 98 L28 98 Z'
      : (isBugatti
        ? 'M26 88 C36 62 78 46 138 46 L186 46 C224 46 258 60 288 74 L296 88 L290 98 L28 98 Z'
        : 'M24 88 L36 72 L96 52 L166 48 L228 62 L288 74 L296 88 L290 98 L26 98 Z');
    return `<svg class="lux-svg lux-car-svg" viewBox="0 0 340 130" aria-hidden="true">
      <defs>
        <linearGradient id="carBody_${gift.id}" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${bodyGradA}"/>
          <stop offset="100%" stop-color="${bodyGradB}"/>
        </linearGradient>
        <linearGradient id="headBeam_${gift.id}" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#fff8c4" stop-opacity="0.85"/>
          <stop offset="100%" stop-color="#fff8c4" stop-opacity="0"/>
        </linearGradient>
        <linearGradient id="exhaust_${gift.id}" x1="1" y1="0" x2="0" y2="0">
          <stop offset="0%" stop-color="#fb923c" stop-opacity="0.95"/>
          <stop offset="55%" stop-color="#f43f5e" stop-opacity="0.55"/>
          <stop offset="100%" stop-color="#f43f5e" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <polygon points="292,76 340,62 340,98 292,86" fill="url(#headBeam_${gift.id})"/>
      <polygon points="28,88 0,80 0,98 28,94" fill="url(#exhaust_${gift.id})"/>
      <ellipse cx="164" cy="108" rx="134" ry="9" fill="rgba(0,0,0,0.52)"/>
      <path d="${bodyPath}" fill="url(#carBody_${gift.id})" stroke="rgba(255,255,255,0.45)" stroke-width="2" stroke-linejoin="round"/>
      <path d="M96 68 L126 52 L178 52 L212 68 Z" fill="#0f172a" stroke="${rim}" stroke-width="1.5"/>
      <path d="M128 55 L172 55 L196 66 L108 66 Z" fill="rgba(186,230,253,0.28)"/>
      <path d="M52 80 L256 80" stroke="rgba(255,255,255,0.3)" stroke-width="2" stroke-linecap="round"/>
      <rect x="26" y="75" width="16" height="6" rx="3" fill="#ff2d55"/>
      <rect x="276" y="75" width="18" height="6" rx="3" fill="#fef08a"/>
      <circle cx="152" cy="76" r="5" fill="${accent}" stroke="#fff" stroke-width="1"/>
      <g class="lux-wheel" style="transform-origin:84px 96px">
        <circle cx="84" cy="96" r="20" fill="#0b1020" stroke="#334155" stroke-width="3"/>
        <circle cx="84" cy="96" r="12" fill="none" stroke="${rim}" stroke-width="2.5"/>
        <path d="M84 84v24M72 96h24M75.5 87.5l17 17M92.5 87.5l-17 17" stroke="${rim}" stroke-width="1.8"/>
        <circle cx="84" cy="96" r="4" fill="${bodyGradA}"/>
      </g>
      <g class="lux-wheel" style="transform-origin:236px 96px">
        <circle cx="236" cy="96" r="20" fill="#0b1020" stroke="#334155" stroke-width="3"/>
        <circle cx="236" cy="96" r="12" fill="none" stroke="${rim}" stroke-width="2.5"/>
        <path d="M236 84v24M224 96h24M227.5 87.5l17 17M244.5 87.5l-17 17" stroke="${rim}" stroke-width="1.8"/>
        <circle cx="236" cy="96" r="4" fill="${bodyGradA}"/>
      </g>
    </svg>`;
  }

  if (gift.id === 'g74_yacht_gold') {
    return `<svg class="lux-svg lux-palace-svg" viewBox="0 0 340 165" aria-hidden="true">
      <defs>
        <linearGradient id="yachtGold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#fef08a"/><stop offset="55%" stop-color="#f59e0b"/><stop offset="100%" stop-color="#b45309"/>
        </linearGradient>
      </defs>
      <ellipse cx="170" cy="140" rx="145" ry="14" fill="rgba(56,189,248,0.28)"/>
      <path d="M36 106 L306 106 L278 134 L62 134 Z" fill="#f8fafc" stroke="#fde047" stroke-width="2.4"/>
      <path d="M56 118 L286 118" stroke="url(#yachtGold)" stroke-width="4" stroke-linecap="round"/>
      <path d="M74 82 L254 82 L272 106 L64 106 Z" fill="url(#yachtGold)" stroke="#fff" stroke-width="1.6"/>
      <path d="M108 58 L220 58 L236 82 L96 82 Z" fill="#fef3c7" stroke="#f59e0b" stroke-width="1.6"/>
      <rect x="122" y="65" width="84" height="10" rx="5" fill="#0f172a"/>
      <rect x="86" y="89" width="154" height="10" rx="5" fill="#1e293b"/>
      <path d="M166 28 L166 58 M166 32 L198 44 L166 48" stroke="#fde047" stroke-width="2.5" fill="rgba(253,224,71,0.4)"/>
    </svg>`;
  }

  if (gift.id === 'g73_jet') {
    return `<svg class="lux-svg lux-palace-svg" viewBox="0 0 340 165" aria-hidden="true">
      <defs>
        <linearGradient id="jetBody" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#ffffff"/><stop offset="100%" stop-color="#bae6fd"/>
        </linearGradient>
      </defs>
      <path d="M16 116 Q110 100 210 86" stroke="rgba(255,211,107,0.55)" stroke-width="6" stroke-linecap="round" fill="none"/>
      <path d="M56 96 L140 78 L272 56 C296 52 310 58 310 66 C310 74 294 82 270 86 L128 106 L52 110 Z" fill="url(#jetBody)" stroke="#38bdf8" stroke-width="2"/>
      <path d="M168 82 L104 38 L128 36 L210 74 Z" fill="#e0f2fe" stroke="#0284c7" stroke-width="1.6"/>
      <path d="M178 96 L124 136 L148 136 L216 90 Z" fill="#bae6fd" stroke="#0284c7" stroke-width="1.6"/>
      <path d="M62 96 L38 56 L58 54 L88 92 Z" fill="#ffd36b" stroke="#b45309" stroke-width="1.6"/>
      <path d="M116 90 L264 66" stroke="#f59e0b" stroke-width="3" stroke-linecap="round"/>
      <path d="M266 59 L286 58 L280 68 L262 69 Z" fill="#0f172a"/>
    </svg>`;
  }

  if (gift.id !== 'g78_dream_palace') {
    /* High-Value 5,000+ Coin Grand Emblem Stage (Rings, Supernova, Pegasus, Citadel, Airship, Singularity) */
    return `<div class="lux-grand-emblem" style="border-color:${gift.c1}">
      ${giftSvg(gift, 118)}
    </div>`;
  }

  /* Dream Palace (200,000 Coins Sovereign Showcase) */
  return `<svg class="lux-svg lux-palace-svg" viewBox="0 0 340 175" aria-hidden="true">
    <defs>
      <radialGradient id="palaceHalo" cx="50%" cy="46%" r="52%">
        <stop offset="0%" stop-color="#fde047" stop-opacity="0.55"/>
        <stop offset="55%" stop-color="#a855f7" stop-opacity="0.22"/>
        <stop offset="100%" stop-color="#a855f7" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="palaceGold" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#fff4b8"/><stop offset="55%" stop-color="#ffd36b"/><stop offset="100%" stop-color="#d97706"/>
      </linearGradient>
      <linearGradient id="palaceWall" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#6d28d9"/><stop offset="100%" stop-color="#31105f"/>
      </linearGradient>
    </defs>
    <circle cx="170" cy="84" r="82" fill="url(#palaceHalo)"/>
    <ellipse cx="170" cy="154" rx="142" ry="14" fill="rgba(255,211,107,0.22)"/>
    <rect x="44" y="74" width="20" height="76" rx="3" fill="url(#palaceWall)" stroke="#ffd36b" stroke-width="1.6"/>
    <path d="M40 74 Q54 44 68 74 Z" fill="url(#palaceGold)"/>
    <path d="M54 40v12" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
    <rect x="276" y="74" width="20" height="76" rx="3" fill="url(#palaceWall)" stroke="#ffd36b" stroke-width="1.6"/>
    <path d="M272 74 Q286 44 300 74 Z" fill="url(#palaceGold)"/>
    <path d="M286 40v12" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
    <rect x="74" y="84" width="192" height="66" rx="6" fill="url(#palaceWall)" stroke="#ffd36b" stroke-width="2"/>
    <path d="M84 84 Q108 46 132 84 Z" fill="url(#palaceGold)" stroke="#fff" stroke-width="1"/>
    <path d="M208 84 Q232 46 256 84 Z" fill="url(#palaceGold)" stroke="#fff" stroke-width="1"/>
    <path d="M124 84 C124 38 150 22 170 14 C190 22 216 38 216 84 Z" fill="url(#palaceGold)" stroke="#fff" stroke-width="1.8"/>
    <path d="M170 4v14" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/>
    <circle cx="170" cy="6" r="3" fill="#fff"/>
    <path d="M148 150 V112 C148 96 192 96 192 112 V150 Z" fill="#fef08a" stroke="#f59e0b" stroke-width="2"/>
    <path d="M158 150 V118 C158 107 182 107 182 118 V150 Z" fill="#fffbeb"/>
    <rect x="94" y="106" width="24" height="32" rx="12" fill="#fde047" opacity="0.9"/>
    <rect x="222" y="106" width="24" height="32" rx="12" fill="#fde047" opacity="0.9"/>
    <rect x="58" y="148" width="224" height="8" rx="4" fill="url(#palaceGold)"/>
    <circle cx="96" cy="34" r="2.8" fill="#fff"/>
    <circle cx="244" cy="32" r="2.8" fill="#fff"/>
    <circle cx="136" cy="24" r="2" fill="#fde047"/>
    <circle cx="206" cy="24" r="2" fill="#fde047"/>
  </svg>`;
}

/* ===== Gift Events Store & Charm Box Aggregator ===== */
let giftEvents = ls.get('sg_gift_events', []);
if (!Array.isArray(giftEvents)) giftEvents = [];

function getGiftWallStatsForUser(targetUserOrUid) {
  const targetUser = typeof targetUserOrUid === 'string'
    ? (allUsers().find(u => u.uid === targetUserOrUid) || { uid: targetUserOrUid })
    : targetUserOrUid;
  const targetUid = targetUser?.uid || '';
  const counts = {};
  const baseWallet = targetUser && targetUser.giftWallet && typeof targetUser.giftWallet === 'object' ? targetUser.giftWallet : {};
  Object.entries(baseWallet).forEach(([gid, cnt]) => {
    const n = clampSafeInt(cnt, 0, MAX_COINS);
    if (n > 0 && GIFT_BY_ID[gid]) counts[gid] = n;
  });

  const resetAt = Number(targetUser?.giftResetAt || 0);
  const devUpdatedAt = Number(targetUser?.devStatsUpdatedAt || 0);
  const receivedLog = [];
  const countedByEvent = {};
  const unmergedCounts = {};
  let unmergedCharm = 0;

  (giftEvents || []).forEach(ev => {
    const isGuestSeedMatch = Boolean(ev && ev.isDemoSeed && targetUid === uid && me.accountType !== 'account');
    if (!ev || (!isGuestSeedMatch && ev.toUid !== targetUid) || !GIFT_BY_ID[ev.giftId]) return;
    const evTs = Number(ev.ts || 0);
    if (resetAt > 0 && evTs <= resetAt) return;
    receivedLog.push(ev);
    const qty = clampSafeInt(ev.qty || 1, 1, 100);
    countedByEvent[ev.giftId] = (countedByEvent[ev.giftId] || 0) + qty;
    if (!ev.claimedByRecipient && evTs > devUpdatedAt) {
      unmergedCounts[ev.giftId] = (unmergedCounts[ev.giftId] || 0) + qty;
      unmergedCharm += clampSafeInt(ev.charm || 0, 0, MAX_COINS);
    }
  });

  if (devUpdatedAt > 0) {
    /* Authoritative developer edits: only layer truly newer unclaimed gifts on top */
    Object.entries(unmergedCounts).forEach(([gid, pendingCnt]) => {
      counts[gid] = clampSafeInt(Number(counts[gid] || 0) + pendingCnt, 0, MAX_COINS);
    });
  } else {
    Object.entries(countedByEvent).forEach(([gid, evQty]) => {
      const baseCnt = Number(counts[gid] || 0);
      const pendingCnt = Number(unmergedCounts[gid] || 0);
      counts[gid] = Math.max(baseCnt + pendingCnt, evQty);
    });
  }

  const collectedIds = Object.keys(counts).filter(k => counts[k] > 0);
  const totalReceivedCount = Object.values(counts).reduce((sum, n) => sum + n, 0);
  const storedCharm = clampSafeInt(targetUser?.charm || 0, 0, MAX_COINS);
  const eventTotalCharm = receivedLog.reduce((sum, ev) => sum + clampSafeInt(ev.charm || 0, 0, MAX_COINS), 0);
  const totalCharm = devUpdatedAt > 0
    ? clampSafeInt(storedCharm + unmergedCharm, 0, MAX_COINS)
    : Math.max(storedCharm + unmergedCharm, eventTotalCharm, storedCharm);
  const sentCharm = clampSafeInt(targetUser?.charmSent || 0, 0, MAX_COINS);

  receivedLog.sort((a, b) => Number(b.ts || 0) - Number(a.ts || 0));

  return {
    counts,
    collectedCount: collectedIds.length,
    totalCatalog: GIFT_CATALOG.length,
    totalReceivedCount,
    totalCharm,
    sentCharm,
    receivedLog: receivedLog.slice(0, 50)
  };
}

function getGiftBadgesForStats(st) {
  const tierOwned = t => GIFT_CATALOG.filter(g => g.tier === t && Number(st.counts[g.id] || 0) > 0).length;
  return [
    { id: 'b_start', title: 'Warm Starter', desc: 'Collect 3 Starter (1★) gifts', cur: tierOwned(1), goal: 3, color: '#38bdf8', icon: 'g01_rose' },
    { id: 'b_sweet', title: 'Sweet Heart', desc: 'Collect 3 Sweet (2★) gifts', cur: tierOwned(2), goal: 3, color: '#f472b6', icon: 'g13_bouquet' },
    { id: 'b_rad', title: 'Radiant Star', desc: 'Collect 3 Radiant (3★) gifts', cur: tierOwned(3), goal: 3, color: '#2dd4bf', icon: 'g25_crystal' },
    { id: 'b_epic', title: 'Epic Patron', desc: 'Collect 2 Epic (4★) gifts', cur: tierOwned(4), goal: 2, color: '#a855f7', icon: 'g37_crown' },
    { id: 'b_leg', title: 'Legend Collector', desc: 'Collect 1 Legendary (5★) gift', cur: tierOwned(5), goal: 1, color: '#f59e0b', icon: 'g51_dragon' },
    { id: 'b_myth', title: 'Mythic Sovereign', desc: 'Collect 1 Mythic (6★) gift', cur: tierOwned(6), goal: 1, color: '#ffd36b', icon: 'g63_universe' },
    { id: 'b_sov', title: 'Sovereign Tycoon', desc: 'Collect 1 Sovereign (7★) luxury gift', cur: tierOwned(7), goal: 1, color: '#ffe58f', icon: 'g78_dream_palace' },
    { id: 'b_ch1', title: 'Charm Rising', desc: 'Reach 500 Charm in Charm Box', cur: st.totalCharm, goal: 500, color: '#fb7185', icon: 'g08_heart' },
    { id: 'b_ch2', title: 'Charm Superstar', desc: 'Reach 10,000 Charm in Charm Box', cur: st.totalCharm, goal: 10000, color: '#fde047', icon: 'g66_supernova' }
  ];
}

/* Fixed Proportional Lucky Coin Drop + Strict 5:1 Charm Math (Fixes 50x/100x Combo Bug) */
function calcGiftLuckyRange(gift, qty) {
  const safeQty = clampSafeInt(qty, 1, 100);
  const totalCost = clampSafeInt(gift.price * safeQty, 1, MAX_COINS);
  const tierBoost = 1 + ((gift.tier || 1) - 1) * 0.04;
  const minLucky = Math.max(1, clampSafeInt(Math.round(totalCost * 0.08), 1, MAX_COINS));
  const maxLucky = Math.max(minLucky + 1, clampSafeInt(Math.round(totalCost * 1.25 * tierBoost), minLucky + 1, MAX_COINS));
  return { safeQty, totalCost, tierBoost, minLucky, maxLucky };
}

function rollGiftTransactionRewards(gift, qty) {
  const { safeQty, totalCost, tierBoost, minLucky, maxLucky } = calcGiftLuckyRange(gift, qty);
  const recipientCharm = calcExactCharmForCoins(totalCost);
  const senderCharm = Math.max(1, Math.floor(recipientCharm * 0.25));

  const r = Math.random();
  let pct, luckLabel;
  if (r >= 0.98) {
    pct = 0.8 + Math.random() * 0.45;
    luckLabel = 'Mythic Mega Drop';
  } else if (r >= 0.88) {
    pct = 0.45 + Math.random() * 0.3;
    luckLabel = 'Super Jackpot';
  } else if (r >= 0.6) {
    pct = 0.2 + Math.random() * 0.2;
    luckLabel = 'Great Luck';
  } else {
    pct = 0.08 + Math.random() * 0.1;
    luckLabel = 'Lucky Drop';
  }
  const luckyCoins = Math.max(minLucky, clampSafeInt(Math.round(totalCost * pct * tierBoost), minLucky, maxLucky));
  return { totalCost, recipientCharm, senderCharm, luckyCoins, luckLabel, minLucky, maxLucky };
}

/* Multi-Style Gift Animation Classifier + Fixed 50x/100x Combo Scaling */
function getGiftAnimProfile(gift, qtyRaw) {
  const qty = clampSafeInt(qtyRaw || 1, 1, 100);
  const unitPrice = Number(gift?.price || 10);
  const totalCost = unitPrice * qty;
  let style = 'burst';
  if (unitPrice >= 5000 || totalCost >= 5000) style = 'fullscreen';
  else if (unitPrice >= 500 || totalCost >= 1000) style = 'spotlight';
  else if (unitPrice >= 80 || qty >= 10) style = 'orbit';

  let comboLabel = '';
  let comboScale = 1;
  let particles = 12;
  if (qty >= 100) {
    comboLabel = '×100 ULTRA';
    comboScale = 1.42;
    particles = 36;
  } else if (qty >= 50) {
    comboLabel = '×50 MEGA';
    comboScale = 1.28;
    particles = 28;
  } else if (qty >= 10) {
    comboLabel = `×${qty} COMBO`;
    comboScale = 1.14;
    particles = 18;
  }
  return { qty, totalCost, style, comboLabel, comboScale, particles };
}

/* Multi-Style 3D Gift Animation Stage (Burst, Float/Orbit, Spotlight Sweep + Fixed Combo Scaling) */
function showGiftBroadcastAnim(ev) {
  const g = GIFT_BY_ID[ev.giftId];
  if (!g) return;
  const tier = GIFT_TIERS[g.tier] || GIFT_TIERS[1];
  const prof = getGiftAnimProfile(g, ev.qty || 1);
  if (prof.style === 'fullscreen') {
    showLuxuryGiftShowcase(ev, g);
    return;
  }

  $$('.gift-banner-anim, .gift-fx-stage').forEach(el => el.remove());

  /* 1. Multi-Style Animated Center/Upper FX Overlay */
  const layer = document.getElementById('giftAnimLayer') || document.body;
  const fx = document.createElement('div');
  fx.className = `gift-fx-stage gift-style-${prof.style} gift-tier-${g.tier}`;
  fx.style.setProperty('--g-c1', g.c1 || tier.color);
  fx.style.setProperty('--g-c2', g.c2 || '#4f46e5');
  fx.style.setProperty('--g-scale', String(prof.comboScale));

  const sparks = Array.from({ length: prof.particles }, (_, i) => {
    const ang = (360 / prof.particles) * i;
    const dist = 54 + (i % 4) * 20;
    const delay = ((i % 6) * 0.04).toFixed(2);
    return `<i style="--ang:${ang}deg;--dist:${dist}px;--d:${delay}s"></i>`;
  }).join('');

  fx.innerHTML = `
    ${prof.style === 'spotlight' ? '<div class="gfx-beams"><span></span><span></span></div>' : ''}
    ${prof.style === 'orbit' ? '<div class="gfx-orbit-ring r1"><i></i><i></i></div><div class="gfx-orbit-ring r2"><i></i></div>' : ''}
    <div class="gfx-sparks">${sparks}</div>
    <div class="gfx-emblem-wrap">
      ${giftSvg(g, Math.round(78 * Math.min(1.25, prof.comboScale)))}
      ${prof.comboLabel ? `<div class="gfx-combo-badge">${esc(prof.comboLabel)}</div>` : ''}
    </div>
  `;
  layer.appendChild(fx);
  requestAnimationFrame(() => fx.classList.add('in'));
  setTimeout(() => {
    fx.classList.remove('in');
    setTimeout(() => fx.remove(), 420);
  }, prof.style === 'spotlight' ? 2800 : 2200);

  /* 2. Crisp Floating Broadcast Banner */
  const box = document.createElement('div');
  box.className = `gift-banner-anim gift-tier-${g.tier} style-${prof.style}`;
  box.innerHTML = `
    <div class="gba-ico">${giftSvg(g, 48)}</div>
    <div class="gba-copy">
      <div class="gba-top"><b>${esc(ev.fromName || 'Player')}</b> <span>→</span> <b>${esc(ev.toName || 'Player')}</b></div>
      <div class="gba-mid">${esc(g.name)} <strong class="gba-qty" style="color:${tier.color}">×${prof.qty}</strong> · <span style="color:#f9a8d4">+${fmtNum(ev.charm)} 💎</span> · <span style="color:#ffd36b">+${fmtNum(ev.luckyCoins)} 🪙</span></div>
    </div>
  `;
  document.body.appendChild(box);
  requestAnimationFrame(() => box.classList.add('in'));
  setTimeout(() => {
    box.classList.remove('in');
    setTimeout(() => box.remove(), 350);
  }, 3400);
}

/* Full-Screen 5,000+ Coin Celebration Showcase (Car Drive-By, Jet, Yacht, Dream Palace, Grand Emblem + Fixed 50x/100x Combo Scaling) */
function showLuxuryGiftShowcase(ev, giftArg) {
  const g = giftArg || GIFT_BY_ID[ev?.giftId];
  if (!g) return;
  const isCar = g.fx === 'car';
  const tier = GIFT_TIERS[g.tier] || GIFT_TIERS[7];
  const prof = getGiftAnimProfile(g, ev?.qty || 1);
  $$('.lux-showcase, .gift-fx-stage').forEach(el => el.remove());

  const overlay = document.createElement('div');
  overlay.className = `lux-showcase ${isCar ? 'lux-mode-car' : 'lux-mode-palace'} ${prof.qty >= 50 ? 'lux-mega-combo' : ''}`;
  overlay.setAttribute('role', 'status');
  overlay.setAttribute('aria-live', 'polite');
  overlay.dataset.luxGift = g.id;
  overlay.style.setProperty('--g-scale', String(prof.comboScale));

  const qty = prof.qty;
  const fromName = esc(ev?.fromName || ev?.name || 'Player');
  const toName = esc(ev?.toName || 'Player');
  const charmTxt = fmtNum(ev?.charm || g.charm * qty);
  const luckyTxt = fmtNum(ev?.luckyCoins || 0);

  overlay.innerHTML = `
    <div class="lux-stage">
      <div class="lux-spotbeams" aria-hidden="true"><span></span><span></span></div>
      <button type="button" class="lux-close" aria-label="Close showcase">✕</button>
      <div class="lux-kicker">${esc(tier.stars)} ${esc(tier.name)} 5,000+ CELEBRATION${prof.comboLabel ? ` · ${esc(prof.comboLabel)}` : ''}</div>
      ${isCar ? `
        <div class="lux-car-track">
          <div class="lux-speed-lines" aria-hidden="true"><span></span><span></span><span></span><span></span></div>
          <div class="lux-car-mover">${luxuryShowcaseSvg(g)}</div>
          <div class="lux-road-line" aria-hidden="true"></div>
        </div>
      ` : `
        <div class="lux-palace-wrap">
          <div class="lux-sparkles" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i></div>
          <div class="lux-palace-rise">${luxuryShowcaseSvg(g)}</div>
        </div>
      `}
      <div class="lux-caption">
        <div class="lux-title">${esc(g.name)} <span class="lux-combo-chip">×${qty}</span></div>
        <div class="lux-sub"><b>${fromName}</b> → <b>${toName}</b> · <em style="color:#f9a8d4">+${charmTxt} 💎</em>${luckyTxt && Number(ev?.luckyCoins) > 0 ? ` · <em style="color:#fde047">+${luckyTxt} 🪙</em>` : ''}</div>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('in'));

  if (typeof playSfx === 'function') {
    if (isCar) playSfx('giftLuxuryCar', { model: g.id });
    else if (g.cat === 'ring') playSfx('weddingBells');
    else playSfx('giftLuxuryPalace', { model: g.id });
    if (qty >= 50) setTimeout(() => playSfx('comboTick', { qty }), 350);
  }

  let closed = false;
  const dismiss = () => {
    if (closed) return;
    closed = true;
    overlay.classList.remove('in');
    setTimeout(() => overlay.remove(), 320);
  };
  overlay.onclick = e => {
    if (e.target.closest('.lux-close') || e.target === overlay) dismiss();
  };
  setTimeout(dismiss, isCar ? 4300 : 4500);
}

/* ===== Exclusive 1-to-1 Relationship Bonds Engine (Couple Ring, Bro Tag, Bestie Tag) ===== */
const BOND_SLOT_META = {
  couple: { slot: 'couple', label: 'Couple Ring', short: 'Couple', defaultGiftId: 'g_ring_royal', accent: '#f472b6', desc: 'Exclusive 1-to-1 Couple Ring · Unlocks Grand Wedding Room' },
  bro: { slot: 'bro', label: 'Bro Tag', short: 'Bro', defaultGiftId: 'g_bond_bro', accent: '#38bdf8', desc: 'Exclusive 1-to-1 Squad Bro Crest' },
  bestie: { slot: 'bestie', label: 'Bestie Tag', short: 'Bestie', defaultGiftId: 'g_bond_bestie', accent: '#c084fc', desc: 'Exclusive 1-to-1 Golden Bestie Locket' }
};

function normalizeExclusiveUserBonds(rawBonds) {
  if (!Array.isArray(rawBonds)) return [];
  const bySlot = {};
  rawBonds.forEach(b => {
    if (!b || !BOND_SLOT_META[b.type] || !b.partnerUid) return;
    const prev = bySlot[b.type];
    if (!prev || Number(b.since || 0) >= Number(prev.since || 0)) {
      bySlot[b.type] = {
        type: b.type,
        partnerUid: b.partnerUid,
        partnerName: b.partnerName || b.name || 'Partner',
        partnerAvatar: b.partnerAvatar || b.avatar || (b.type === 'bro' ? 'av_b2' : 'av_g1'),
        giftId: b.giftId || BOND_SLOT_META[b.type].defaultGiftId,
        level: Math.max(1, Number(b.level || (b.type === 'couple' ? 3 : b.type === 'bro' ? 2 : 1))),
        since: Number(b.since || Date.now())
      };
    }
  });
  return ['couple', 'bro', 'bestie'].map(s => bySlot[s]).filter(Boolean);
}

function getUserBondInSlot(userObj, slot) {
  return normalizeExclusiveUserBonds(userObj?.bonds).find(b => b.type === slot) || null;
}

function getPendingBondRequestsForMe() {
  const list = Array.isArray(me.pendingProposals) ? me.pendingProposals : [];
  return list.filter(p => p && p.id && BOND_SLOT_META[p.bondType] && p.fromUid !== uid);
}

function unbindMyBondSlot(slot, opts) {
  opts = opts || {};
  const meta = BOND_SLOT_META[slot];
  if (!meta) return false;
  const current = getUserBondInSlot(me, slot);
  if (!current) return false;

  me.bonds = normalizeExclusiveUserBonds(me.bonds).filter(b => b.type !== slot);
  saveMe();
  patchUser(uid, { bonds: me.bonds });
  dbOp(() => F.setDoc(userRef(uid), { bonds: me.bonds }, { merge: true }));

  if (current.partnerUid) {
    const partner = allUsers().find(u => u.uid === current.partnerUid);
    if (partner) {
      const pBonds = normalizeExclusiveUserBonds(partner.bonds).filter(b => !(b.type === slot && b.partnerUid === uid));
      patchUser(current.partnerUid, { bonds: pBonds });
      dbOp(() => F.setDoc(userRef(current.partnerUid), { bonds: pBonds }, { merge: true }));
    }
  }
  if (typeof buildProfile === 'function') buildProfile();
  if (typeof renderChats === 'function') renderChats();
  if (!opts.silent) toast(`Unbound ${meta.label} with ${current.partnerName}. Slot is now open!`);
  return true;
}

function openBondSlotOccupiedModal(slot, currentBond, onAfterUnbind) {
  const meta = BOND_SLOT_META[slot] || BOND_SLOT_META.couple;
  const g = GIFT_BY_ID[currentBond?.giftId || meta.defaultGiftId] || GIFT_CATALOG[0];
  const m = modal(`${meta.label} Slot Occupied`, `
    <div class="prop-modal-box">
      <div style="margin-bottom:8px">${giftSvg(g, 74)}</div>
      <b style="font-size:16px">Exclusive 1-to-1 Bond Rule</b>
      <p style="font-size:13px;color:var(--mu);margin:6px 0 12px">
        Your <b>${esc(meta.label)}</b> is currently active with <b>${esc(currentBond?.partnerName || 'Partner')}</b>.
        Each tag/ring can only be held with <b>1 person at a time</b>. Unbind your current bond first before sending or accepting a new request.
      </p>
      <div class="row" style="gap:8px;margin-top:10px">
        <button type="button" class="btn ghost" id="bsoKeep" style="flex:1">Keep Current</button>
        <button type="button" class="btn red" id="bsoUnbind" style="flex:1">Unbind ${esc(currentBond?.partnerName || 'Partner')}</button>
      </div>
    </div>
  `, 'prop-sheet');
  $('#bsoKeep', m).onclick = () => m.close();
  $('#bsoUnbind', m).onclick = () => {
    unbindMyBondSlot(slot);
    m.close();
    if (typeof onAfterUnbind === 'function') onAfterUnbind();
  };
}

function declinePendingBondProposal(propId) {
  const prop = getPendingBondRequestsForMe().find(p => p.id === propId);
  if (!prop) return false;
  me.pendingProposals = (me.pendingProposals || []).filter(x => x.id !== propId);
  saveMe();
  patchUser(uid, { pendingProposals: me.pendingProposals });
  dbOp(() => F.setDoc(userRef(uid), { pendingProposals: me.pendingProposals }, { merge: true }));
  if (typeof playSfx === 'function') playSfx('tap');
  if (typeof buildProfile === 'function') buildProfile();
  if (typeof renderChats === 'function') renderChats();
  toast(`Declined ${(BOND_SLOT_META[prop.bondType] || BOND_SLOT_META.bestie).label} request from ${prop.fromName}`);
  return true;
}

function acceptPendingBondProposal(propId) {
  const prop = getPendingBondRequestsForMe().find(p => p.id === propId);
  if (!prop) return false;
  const meta = BOND_SLOT_META[prop.bondType] || BOND_SLOT_META.bestie;
  const existingInSlot = getUserBondInSlot(me, prop.bondType);
  if (existingInSlot) {
    openBondSlotOccupiedModal(prop.bondType, existingInSlot, () => acceptPendingBondProposal(propId));
    return false;
  }

  const g = GIFT_BY_ID[prop.giftId] || GIFT_BY_ID[meta.defaultGiftId] || GIFT_CATALOG[0];
  const nowTs = Date.now();
  const isCouple = prop.bondType === 'couple';
  const myBond = {
    type: prop.bondType,
    partnerUid: prop.fromUid,
    partnerName: prop.fromName || 'Player',
    partnerAvatar: prop.fromAvatar || 'av_b1',
    giftId: g.id,
    level: isCouple ? 3 : (prop.bondType === 'bro' ? 2 : 1),
    since: nowTs
  };
  const partnerBond = {
    type: prop.bondType,
    partnerUid: uid,
    partnerName: me.name || 'Player',
    partnerAvatar: me.avatar || 'av_g1',
    giftId: g.id,
    level: myBond.level,
    since: nowTs
  };

  me.pendingProposals = (me.pendingProposals || []).filter(x => x.id !== propId);
  me.bonds = normalizeExclusiveUserBonds([...normalizeExclusiveUserBonds(me.bonds).filter(b => b.type !== prop.bondType), myBond]);
  saveMe();
  patchUser(uid, { bonds: me.bonds, pendingProposals: me.pendingProposals });
  dbOp(() => F.setDoc(userRef(uid), { bonds: me.bonds, pendingProposals: me.pendingProposals }, { merge: true }));

  const sender = allUsers().find(u => u.uid === prop.fromUid) || { uid: prop.fromUid, bonds: [] };
  const sBonds = normalizeExclusiveUserBonds([...normalizeExclusiveUserBonds(sender.bonds).filter(b => b.type !== prop.bondType), partnerBond]);
  patchUser(prop.fromUid, { bonds: sBonds });
  dbOp(() => F.setDoc(userRef(prop.fromUid), { bonds: sBonds }, { merge: true }));

  if (typeof playSfx === 'function') playSfx(isCouple ? 'weddingBells' : 'win');
  if (isCouple && typeof createWeddingPartyRoom === 'function') {
    createWeddingPartyRoom(prop.fromUid, prop.fromName, prop.weddingDays || 3, g.name);
  }
  if (typeof buildProfile === 'function') buildProfile();
  if (typeof renderChats === 'function') renderChats();
  toast(isCouple
    ? `💍 Exclusive Couple Ring accepted with ${prop.fromName}! ${prop.weddingDays || 3}-Day Wedding Room unlocked!`
    : `✨ Exclusive ${meta.label} activated with ${prop.fromName}!`);
  return true;
}

/* Pending Couple / Bestie / Bro Proposal Inbox Modal (Only auto-pops for fresh live incoming requests, not pre-seeded demo requests) */
let shownProposalIds = new Set();
function checkPendingProposals() {
  const list = getPendingBondRequestsForMe();
  const pending = list.filter(p => !p.isDemoSeed && !shownProposalIds.has(p.id));
  if (!pending.length) return;
  const prop = pending[0];
  shownProposalIds.add(prop.id);
  const g = GIFT_BY_ID[prop.giftId] || GIFT_CATALOG[0];
  const meta = BOND_SLOT_META[prop.bondType] || BOND_SLOT_META.bestie;
  const isCouple = prop.bondType === 'couple';
  const title = isCouple ? '💍 Exclusive Couple Ring Request' : (prop.bondType === 'bestie' ? '💖 Exclusive Bestie Tag Request' : '🛡️ Exclusive Bro Tag Request');
  if (typeof playSfx === 'function') playSfx(isCouple ? 'weddingBells' : 'giftReceive');

  const m = modal(title, `
    <div class="prop-modal-box">
      <div style="margin-bottom:8px">${giftSvg(g, 82)}</div>
      <b style="font-size:16px">${esc(prop.fromName || 'Player')}</b>
      <p style="font-size:13px;color:var(--mu);margin:6px 0 10px">sent you <b>${esc(g.name)}</b> and wants to form an exclusive 1-to-1 <b>${esc(meta.label)}</b> on both profiles.</p>
      ${isCouple ? `<div class="prop-wed-pill">✨ Accepting unlocks a ${prop.weddingDays || 3}-Day Grand Wedding Room!</div>` : ''}
      <div class="row" style="margin-top:12px;gap:8px">
        <button type="button" class="btn ghost" id="propDecline" style="flex:1">Decline</button>
        <button type="button" class="btn gold" id="propAccept" style="flex:1">Accept ${esc(meta.short)}</button>
      </div>
    </div>
  `, 'prop-sheet');

  $('#propDecline', m).onclick = () => {
    declinePendingBondProposal(prop.id);
    m.close();
  };
  $('#propAccept', m).onclick = () => {
    m.close();
    acceptPendingBondProposal(prop.id);
  };
}

/* Recipient Auto-Ingest for Incoming Gifts (adds to Gift Wallet, Charm Box, and Lucky Coins once) */
function ingestIncomingGiftEvents(list) {
  if (!Array.isArray(list)) return;
  const keepSeeds = me.accountType !== 'account'
    ? (giftEvents || []).filter(ev => ev && ev.isDemoSeed).map(ev => ({ ...ev, toUid: uid }))
    : [];
  const merged = [...list.slice(0, 250)];
  keepSeeds.forEach(s => { if (!merged.some(x => x && x.id === s.id)) merged.push(s); });
  giftEvents = merged.slice(0, 250);
  ls.set('sg_gift_events', giftEvents);

  let changedMe = false;
  let totalNewLucky = 0;
  let latestIncoming = null;
  const resetAt = Number(me.giftResetAt || 0);

  giftEvents.forEach(ev => {
    if (!ev || !ev.id || ev.isDemoSeed || ev.toUid !== uid || !GIFT_BY_ID[ev.giftId]) return;
    if (resetAt > 0 && Number(ev.ts || 0) <= resetAt) return;
    const doneKey = 'gift_rx_' + ev.id;
    if (me.done[doneKey]) return;

    me.done[doneKey] = 1;
    me.giftWallet = me.giftWallet && typeof me.giftWallet === 'object' ? me.giftWallet : {};
    const safeQty = clampSafeInt(ev.qty || 1, 1, 100);
    me.giftWallet[ev.giftId] = clampSafeInt((me.giftWallet[ev.giftId] || 0) + safeQty, 0, MAX_COINS);
    const gObj = GIFT_BY_ID[ev.giftId];
    const exactCharm = calcExactCharmForCoins((gObj ? gObj.price : 5) * safeQty);
    me.charm = clampSafeInt((me.charm || 0) + exactCharm, 0, MAX_COINS);

    const range = gObj ? calcGiftLuckyRange(gObj, safeQty) : { maxLucky: MAX_COINS };
    const lucky = clampSafeInt(ev.luckyCoins || 0, 0, range.maxLucky);
    if (lucky > 0) {
      me.coins = clampCoins(me.coins + lucky);
      const d = today();
      me.dailyCoinsByDay[d] = clampSafeInt(Number(me.dailyCoinsByDay[d] || 0) + lucky, 0, MAX_DAILY_PTS);
      totalNewLucky += lucky;
    }
    changedMe = true;
    latestIncoming = ev;

    if (!ev.claimedByRecipient) {
      ev.claimedByRecipient = true;
      dbOp(() => F.setDoc(F.doc(db, 'gift_events', ev.id), { claimedByRecipient: true }, { merge: true }));
    }
  });

  if (changedMe) {
    saveMe();
    patchUser(uid, { ...base(), coins: me.coins, charm: me.charm, giftWallet: me.giftWallet });
    dbOp(() => F.setDoc(userRef(uid), { ...base(), coins: me.coins, charm: me.charm, giftWallet: me.giftWallet }, { merge: true }));
    updateHud();
    if (typeof buildProfile === 'function') buildProfile();
    if (typeof renderRanking === 'function') renderRanking();
    if (latestIncoming) {
      const gLatest = GIFT_BY_ID[latestIncoming.giftId];
      const latestProf = gLatest ? getGiftAnimProfile(gLatest, latestIncoming.qty || 1) : null;
      if (latestProf && latestProf.style === 'fullscreen') {
        showLuxuryGiftShowcase(latestIncoming, gLatest);
      } else {
        showGiftBroadcastAnim(latestIncoming);
        if (typeof playSfx === 'function') {
          playSfx('giftSend', { tier: gLatest?.tier || 2, style: latestProf?.style || 'burst' });
          if (totalNewLucky > 0) setTimeout(() => playSfx('luckyDrop'), 220);
        }
      }
      toast(`Received gift! +${fmtNum(totalNewLucky)} Lucky 🪙 & Charm!`);
    }
  }
}

/* Render World Chat / DM Gift Broadcast Card (with Clickable Player Profiles & 5k+ Replay Show) */
function renderWorldGiftCard(m) {
  const g = GIFT_BY_ID[m.giftId] || GIFT_CATALOG[0];
  const tier = GIFT_TIERS[g.tier] || GIFT_TIERS[1];
  const senderUid = m.uid || m.fromUid || '';
  const recipUid = m.toUid || '';
  const senderHtml = senderUid
    ? `<button type="button" class="wc-prof-link" data-wprof="${esc(senderUid)}">${esc(m.fromName || m.name || 'Player')}</button>`
    : `<b>${esc(m.fromName || m.name || 'Player')}</b>`;
  const recipHtml = recipUid
    ? `<button type="button" class="wc-prof-link" data-wprof="${esc(recipUid)}">${esc(m.toName || 'Player')}</button>`
    : `<b>${esc(m.toName || 'Player')}</b>`;
  const isHighVal = Number(g.price || 0) >= 5000;
  const replayBtn = isHighVal
    ? `<button type="button" class="btn gold sm wc-replay-btn" data-replaygift="${esc(g.id)}" data-replayfrom="${esc(m.fromName || m.name || 'Player')}" data-replayto="${esc(m.toName || 'Player')}" data-replayqty="${clampSafeInt(m.qty || 1, 1, 100)}" data-replaycharm="${clampSafeInt(m.charm || g.charm, 0, MAX_COINS)}" data-replaylucky="${clampSafeInt(m.luckyCoins || 0, 0, MAX_COINS)}">${g.fx === 'car' ? 'Replay Drive' : 'Replay Show'}</button>`
    : '';

  return `<div class="wc-gift-card gift-tier-${g.tier}" style="border-color:${tier.border};background:${tier.bg}">
    <div class="wc-gift-art">${giftSvg(g, 58)}</div>
    <div class="wc-gift-meta">
      <div class="wc-gift-kicker">${esc(tier.stars)} ${esc(tier.name)} Gift · ${esc(m.luckLabel || 'Lucky Drop')}</div>
      <div class="wc-gift-title">${senderHtml} sent <span>${esc(g.name)} x${clampSafeInt(m.qty || 1, 1, 100)}</span> to ${recipHtml}</div>
      <div class="wc-gift-stats">
        <span class="gw-stat-charm">+${fmtNum(m.charm || g.charm)} Charm</span>
        <span aria-hidden="true">·</span>
        <span class="gw-stat-lucky">+${fmtNum(m.luckyCoins || 1)} Lucky Coins</span>
        ${replayBtn}
      </div>
    </div>
  </div>`;
}

/* ===== Send Gift Action (Deducts Coins, Updates Charm Box, Posts World Chat + DM Broadcast) ===== */
function executeSendGift(targetUid, giftId, qty, contextOpts) {
  if (typeof isMutedNow === 'function' && isMutedNow()) return toast('You are muted for ' + muteRemainingText());
  if (!targetUid || targetUid === uid) return toast('Pick another player to gift');
  const gift = GIFT_BY_ID[giftId];
  if (!gift) return toast('Gift not found');
  const safeQty = clampSafeInt(qty, 1, 100);
  const lockKey = 'gift_send_' + targetUid + '_' + giftId;
  if (inFlightOps.has(lockKey)) return;

  const rewards = rollGiftTransactionRewards(gift, safeQty);
  if (me.coins < rewards.totalCost) {
    return toast(`Need ${fmtNum(rewards.totalCost)} coins (You have ${fmtNum(me.coins)})`);
  }

  /* Strict 1-to-1 Bond Exclusivity Check BEFORE charging coins or sending request */
  const targetUserPre = allUsers().find(u => u.uid === targetUid) || { uid: targetUid, name: (contextOpts && contextOpts.targetName) || 'Player' };
  if (gift.bondType && BOND_SLOT_META[gift.bondType]) {
    const slotMeta = BOND_SLOT_META[gift.bondType];
    const myCurrentBond = getUserBondInSlot(me, gift.bondType);
    if (myCurrentBond) {
      openBondSlotOccupiedModal(gift.bondType, myCurrentBond);
      return null;
    }
    const targetCurrentBond = getUserBondInSlot(targetUserPre, gift.bondType);
    if (targetCurrentBond) {
      toast(`${targetUserPre.name || 'Player'} already holds an active ${slotMeta.label} with ${targetCurrentBond.partnerName}`);
      return null;
    }
    const targetPending = Array.isArray(targetUserPre.pendingProposals) ? targetUserPre.pendingProposals : [];
    if (targetPending.some(p => p && p.bondType === gift.bondType && p.fromUid === uid)) {
      toast(`Your ${slotMeta.label} request is already pending for ${targetUserPre.name || 'Player'}`);
      return null;
    }
  }

  inFlightOps.add(lockKey);
  try {
    const targetUser = targetUserPre;
    const nowTs = Date.now();
    const evId = 'gf_' + nowTs.toString(36) + Math.random().toString(36).slice(2, 6);

    /* Deduct coins & award sender Gifter Charm */
    me.coins = clampCoins(me.coins - rewards.totalCost);
    me.charmSent = clampSafeInt((me.charmSent || 0) + rewards.senderCharm, 0, MAX_COINS);
    saveMe();
    patchUser(uid, { ...base(), coins: me.coins, charmSent: me.charmSent });
    updateHud();
    dbOp(() => F.setDoc(userRef(uid), { ...base(), coins: me.coins, charmSent: me.charmSent }, { merge: true }));

    /* Task counter + Clan Glory contribution */
    if (typeof bumpStat === 'function') bumpStat('gifts_sent');
    if (typeof addClanGlory === 'function') addClanGlory(Math.max(10, Math.floor(rewards.totalCost / 5)));

    /* Mandatory Request -> Accept Flow: NEVER auto-attach bond; deliver pending request to recipient */
    if (gift.bondType && BOND_SLOT_META[gift.bondType]) {
      const prop = {
        id: 'pr_' + evId,
        fromUid: uid,
        fromName: me.name || 'Player',
        fromAvatar: me.avatar || 'av_b1',
        toUid: targetUid,
        toName: targetUser.name || 'Player',
        giftId: gift.id,
        giftName: gift.name,
        bondType: gift.bondType,
        weddingDays: gift.weddingDays || 3,
        status: 'pending',
        ts: nowTs
      };
      const existingProps = Array.isArray(targetUser.pendingProposals) ? targetUser.pendingProposals : [];
      const nextProps = [...existingProps.filter(p => !(p.bondType === gift.bondType && p.fromUid === uid)), prop].slice(-15);
      patchUser(targetUid, { pendingProposals: nextProps });
      dbOp(() => F.setDoc(userRef(targetUid), { pendingProposals: nextProps }, { merge: true }));
    }

    /* Create Gift Event record */
    const evObj = {
      id: evId,
      fromUid: uid,
      fromName: me.name || 'Player',
      fromAvatar: me.avatar || 'av_b1',
      fromFrame: me.frame || 'none',
      toUid: targetUid,
      toName: targetUser.name || 'Player',
      giftId: gift.id,
      giftName: gift.name,
      tier: gift.tier,
      qty: safeQty,
      unitPrice: gift.price,
      totalCost: rewards.totalCost,
      charm: rewards.recipientCharm,
      senderCharm: rewards.senderCharm,
      luckyCoins: rewards.luckyCoins,
      luckLabel: rewards.luckLabel,
      claimedByRecipient: false,
      ts: nowTs
    };
    giftEvents = [evObj, ...(giftEvents || [])].slice(0, 250);
    ls.set('sg_gift_events', giftEvents);
    dbOp(() => F.setDoc(F.doc(db, 'gift_events', evId), evObj));

    /* Post Animated Gift Broadcast Card into World Chat */
    const worldItem = {
      id: 'wg_' + evId,
      type: 'gift',
      uid,
      name: me.name || 'Player',
      fromName: me.name || 'Player',
      toUid: targetUid,
      toName: targetUser.name || 'Player',
      avatar: me.avatar || 'av_b1',
      frame: me.frame || 'none',
      banner: me.banner || 'bn-aurora',
      textStyle: me.textStyle || '',
      msgStyle: me.msgStyle || '',
      tags: me.tags || [],
      exp: me.exp || 0,
      isDev: devMode,
      giftId: gift.id,
      qty: safeQty,
      charm: rewards.recipientCharm,
      luckyCoins: rewards.luckyCoins,
      luckLabel: rewards.luckLabel,
      text: `Sent ${gift.name} x${safeQty} to ${targetUser.name || 'Player'} (+${rewards.recipientCharm} Charm, +${rewards.luckyCoins} Lucky Coins)`,
      ts: nowTs
    };
    worldMsgs = [...(worldMsgs || []), worldItem].slice(-150);
    ls.set('sg_world_msgs', worldMsgs);
    dbOp(() => F.setDoc(F.doc(db, 'world_chat', worldItem.id), worldItem));

    if (contextOpts && contextOpts.inDm && typeof chats !== 'undefined' && chats[targetUid]) {
      const dmId = 'dg_' + evId;
      chats[targetUid].messages = chats[targetUid].messages || [];
      chats[targetUid].messages.push({
        id: dmId, from: 'me', fromUid: uid, toUid: targetUid, type: 'gift', giftId: gift.id, qty: safeQty,
        fromName: me.name, toName: targetUser.name, charm: rewards.recipientCharm,
        luckyCoins: rewards.luckyCoins, luckLabel: rewards.luckLabel, ts: nowTs
      });
      if (typeof saveChats === 'function') saveChats();
      dbOp(() => F.setDoc(F.doc(db, 'dm_messages', dmId), {
        id: dmId, from: uid, fromName: me.name, to: targetUid, toName: targetUser.name,
        type: 'gift', giftId: gift.id, qty: safeQty, charm: rewards.recipientCharm,
        luckyCoins: rewards.luckyCoins, luckLabel: rewards.luckLabel, ts: nowTs
      }));
    }

    if (contextOpts && contextOpts.inRoom && typeof appendMultiplayerRoomGift === 'function') {
      appendMultiplayerRoomGift(contextOpts.inRoom, evObj);
    }
    if (contextOpts && contextOpts.inPartyRoom && typeof appendPartyRoomGift === 'function') {
      appendPartyRoomGift(contextOpts.inPartyRoom, evObj);
    }

    /* Trigger Multi-Style Gift Animation (Burst, Orbit, Spotlight, or 5,000+ Fullscreen Celebration) */
    const animProf = getGiftAnimProfile(gift, safeQty);
    if (animProf.style === 'fullscreen') {
      showLuxuryGiftShowcase(evObj, gift);
      if (typeof playSfx === 'function' && rewards.luckLabel !== 'Lucky Drop') {
        setTimeout(() => playSfx('luckyDrop'), 1200);
      }
    } else {
      showGiftBroadcastAnim(evObj);
      if (typeof playSfx === 'function') {
        playSfx(gift.bondType === 'couple' ? 'weddingBells' : 'giftSend', { tier: gift.tier, qty: safeQty, style: animProf.style });
        if (safeQty >= 50) setTimeout(() => playSfx('comboTick', { qty: safeQty }), 180);
        if (rewards.luckLabel !== 'Lucky Drop') {
          setTimeout(() => playSfx('luckyDrop'), 260);
        }
      }
    }
    if (typeof buildProfile === 'function') buildProfile();
    if (typeof cur !== 'undefined' && cur && typeof renderThread === 'function') renderThread();
    toast(gift.bondType
      ? `Sent ${gift.name}! Bond proposal delivered to ${targetUser.name || 'Player'}!`
      : `Sent ${gift.name} x${safeQty}! +${fmtNum(rewards.recipientCharm)} Charm · ${rewards.luckLabel}: +${fmtNum(rewards.luckyCoins)} Lucky 🪙`);
    return evObj;
  } finally {
    setTimeout(() => inFlightOps.delete(lockKey), 400);
  }
}

/* ===== v13 Upgraded Animated Gift Wall (Top Gifter Spotlight + Rarity Filters + 10k+ Ambient Motion) ===== */
function getTopGifterForUser(st) {
  const bySender = {};
  (st.receivedLog || []).forEach(ev => {
    const sid = ev.fromUid || ev.fromName || 'vip';
    if (!bySender[sid]) {
      bySender[sid] = {
        uid: ev.fromUid || '',
        name: ev.fromName || 'VIP Gifter',
        avatar: ev.fromAvatar || 'av_g1',
        frame: ev.fromFrame || 'fx_gold',
        charm: 0,
        gifts: 0
      };
    }
    bySender[sid].charm += Number(ev.charm || 0);
    bySender[sid].gifts += Number(ev.qty || 1);
  });
  return Object.values(bySender).sort((a, b) => b.charm - a.charm)[0] || null;
}

function renderGiftWallHtml(targetUser, isSelf) {
  const st = getGiftWallStatsForUser(targetUser);
  const luxOwned = GIFT_CATALOG.filter(g => isLuxuryAnimatedGift(g) && Number(st.counts[g.id] || 0) > 0).length;
  const topGift = GIFT_CATALOG.find(g => isLuxuryAnimatedGift(g) && Number(st.counts[g.id] || 0) > 0) || GIFT_BY_ID['g75_ferrari'] || GIFT_CATALOG[GIFT_CATALOG.length - 1];
  const topGifter = getTopGifterForUser(st);
  const topGifterHtml = topGifter ? `
    <div class="gw-top-gifter" ${topGifter.uid ? `data-prof-link="${esc(topGifter.uid)}"` : ''}>
      <div class="gw-tg-left">
        <span class="gw-tg-crown" aria-hidden="true">👑</span>
        ${av({ avatar: topGifter.avatar, frame: topGifter.frame || 'fx_gold' }, 34)}
        <div class="gw-tg-meta">
          <small>TOP GIFTER SPOTLIGHT</small>
          <b>${esc(topGifter.name)}</b>
        </div>
      </div>
      <div class="gw-tg-right">
        <b>+${fmtNum(topGifter.charm)} 💎</b>
        <small>${fmtNum(topGifter.gifts)} gifts</small>
      </div>
    </div>
  ` : '';

  return `
    <div class="gw-shell" data-gw-uid="${esc(targetUser.uid)}" data-gw-self="${isSelf ? '1' : '0'}">
      <div class="wp-gift-summary">
        <div class="wp-gs-left">
          <div class="wp-gs-title">Animated Gift Wall ${luxOwned > 0 ? `<span class="gw-lux-pill">✨ ${luxOwned} 10k+ Live</span>` : ''}</div>
          <div class="wp-gs-nums">
            <div class="wp-gs-stat"><b>${fmtNum(st.totalReceivedCount)}</b><small>Gifts</small></div>
            <div class="wp-gs-div"></div>
            <div class="wp-gs-stat"><b>${fmtNum(st.totalCharm)}</b><small>Charm</small></div>
            <div class="wp-gs-div"></div>
            <div class="wp-gs-stat"><b>${st.collectedCount}/${st.totalCatalog}</b><small>Vault</small></div>
          </div>
        </div>
        <div class="wp-gs-right">
          <div class="gw-hero-thumb ${isLuxuryAnimatedGift(topGift) ? 'lux-10k-card' : ''}">
            ${renderLuxury10kFxHtml(topGift, true)}
            ${giftSvg(topGift, 48)}
          </div>
          ${!isSelf ? `<button type="button" class="btn gold sm" data-gw-send="${esc(targetUser.uid)}">Gift</button>` : ''}
        </div>
      </div>

      ${topGifterHtml}

      <div class="gw-tabs" role="tablist">
        <button type="button" class="gw-tab on" data-gw-tab="wall" role="tab" aria-selected="true">Wall</button>
        <button type="button" class="gw-tab" data-gw-tab="badges" role="tab" aria-selected="false">Badges</button>
        <button type="button" class="gw-tab" data-gw-tab="received" role="tab" aria-selected="false">Log (${st.receivedLog.length})</button>
      </div>

      <div class="gw-panel" data-gw-panel></div>
    </div>
  `;
}

const VAULT_TABS = [
  ['all', 'All'],
  ['lux10k', '✨ 10k+ Luxury'],
  ['rings', '💍 Rings & Bonds'],
  ['t5', '5★+ Mythic'],
  ['t4', '4★ Royal'],
  ['t3', '3★ Radiant'],
  ['t2', '2★ Sweet'],
  ['t1', '1★ Starter']
];

function matchVaultFilter(g, filterKey) {
  if (filterKey === 'all') return true;
  if (filterKey === 'lux10k') return isLuxuryAnimatedGift(g);
  if (filterKey === 'rings') return g.cat === 'ring';
  if (g.cat === 'ring') return false;
  if (filterKey === 't1') return g.tier === 1;
  if (filterKey === 't2') return g.tier === 2;
  if (filterKey === 't3') return g.tier === 3;
  if (filterKey === 't4') return g.tier === 4 || g.tier === 5;
  if (filterKey === 't5') return g.tier >= 6;
  return true;
}

function openGiftInspectModal(gift, ownedCount, targetUser, isSelf, onAfterGiftSent) {
  const tMeta = GIFT_TIERS[gift.tier] || GIFT_TIERS[1];
  const isLux10k = isLuxuryAnimatedGift(gift);
  const m = modal('Gift Vault Details', `
    <div class="gw-inspect-box ${isLux10k ? 'lux-10k-card' : ''}" style="border-color:${tMeta.border}">
      ${renderLuxury10kFxHtml(gift, false)}
      <div class="gw-inspect-art">${giftSvg(gift, 92)}</div>
      <div class="gw-stars" style="color:${tMeta.color};margin-top:6px">${esc(tMeta.stars)} ${esc(gift.cat === 'ring' ? '3D Luxury Ring & Exclusive Bond' : tMeta.name)}</div>
      <h4 style="margin:4px 0 6px;font-size:18px">${esc(gift.name)}</h4>
      <div class="row wrap" style="justify-content:center;gap:8px;margin-bottom:8px">
        <span class="chip">${fmtNum(gift.price)} 🪙</span>
        <span class="charm-chip">+${fmtNum(gift.charm)} Charm (5:1)</span>
        <span class="exp-chip">Owned: x${fmtNum(ownedCount)}</span>
      </div>
      ${isLux10k ? `<p style="font-size:12px;color:#fde047;margin:4px 0">✨ 10,000+ Luxury Gift: Continuous 3D shimmer & ambient Gift Wall particles!</p>` : ''}
      ${gift.bondType ? `<p style="font-size:12px;color:#f9a8d4;margin:4px 0">💎 Exclusive 1-to-1 ${(BOND_SLOT_META[gift.bondType] || BOND_SLOT_META.couple).label} — sends a request that activates only after acceptance.</p>` : ''}
      ${gift.price >= 5000 ? `<p style="font-size:12px;color:#38bdf8;margin:4px 0">🎬 Triggers Full-Screen 3D Celebration Showcase & Sound FX!</p>` : ''}
      <div class="row" style="margin-top:12px;gap:8px">
        ${gift.price >= 5000 ? `<button type="button" class="btn ghost" id="giPreview" style="flex:1">Preview 3D Show</button>` : ''}
        ${!isSelf ? `<button type="button" class="btn gold" id="giSend" style="flex:1">Send Gift</button>` : `<button type="button" class="btn" id="giOk" style="flex:1">Close</button>`}
      </div>
    </div>
  `, 'gw-inspect-sheet');
  if ($('#giPreview', m)) {
    $('#giPreview', m).onclick = () => showLuxuryGiftShowcase({ fromName: me.name, toName: targetUser?.name || 'VIP', qty: 1, charm: gift.charm, luckyCoins: Math.round(gift.price * 0.25) }, gift);
  }
  if ($('#giSend', m)) {
    $('#giSend', m).onclick = () => {
      m.close();
      openGiftSendModal(targetUser.uid, { preselectGiftId: gift.id, onSent: onAfterGiftSent });
    };
  }
  if ($('#giOk', m)) $('#giOk', m).onclick = () => m.close();
}

function bindGiftWallEvents(rootEl, targetUser, isSelf, onAfterGiftSent) {
  const shell = rootEl.querySelector('.gw-shell');
  if (!shell) return;
  let activeTab = 'wall';
  let activeFilter = 'all';

  const renderPanel = () => {
    const freshUser = allUsers().find(u => u.uid === targetUser.uid) || targetUser;
    const st = getGiftWallStatsForUser(freshUser);
    const panel = shell.querySelector('[data-gw-panel]');
    if (!panel) return;

    const rxTab = shell.querySelector('[data-gw-tab="received"]');
    if (rxTab) rxTab.textContent = `Log (${st.receivedLog.length})`;

    if (activeTab === 'wall') {
      const tierBtns = VAULT_TABS.map(([k, lbl]) =>
        `<button type="button" class="gw-tbtn ${activeFilter === k ? 'on' : ''}" data-gw-filter="${k}">${lbl}</button>`
      ).join('');

      const list = GIFT_CATALOG
        .filter(g => matchVaultFilter(g, activeFilter))
        .sort((a, b) => {
          const ao = Number(st.counts[a.id] || 0) > 0 ? 1 : 0;
          const bo = Number(st.counts[b.id] || 0) > 0 ? 1 : 0;
          if (bo !== ao) return bo - ao;
          const al = isLuxuryAnimatedGift(a) ? 1 : 0;
          const bl = isLuxuryAnimatedGift(b) ? 1 : 0;
          if (ao && bo && bl !== al) return bl - al;
          return b.price - a.price;
        });

      panel.innerHTML = `
        <div class="gw-tier-bar">${tierBtns}</div>
        <div class="gw-grid">
          ${list.map(g => {
            const cnt = Number(st.counts[g.id] || 0);
            const tMeta = GIFT_TIERS[g.tier];
            const isLux10k = isLuxuryAnimatedGift(g);
            const animateWall = isLux10k && cnt > 0;
            return `<button type="button" class="gw-card ${cnt > 0 ? 'owned' : 'locked'} gw-t${g.tier} ${animateWall ? 'lux-10k-card lux-10k-wall' : (isLux10k ? 'lux-10k-preview' : '')}" data-gw-gift="${esc(g.id)}" data-lux10k="${isLux10k ? '1' : '0'}" style="${cnt > 0 ? `border-color:${tMeta.border}` : ''}">
              ${animateWall ? renderLuxury10kFxHtml(g, true) : ''}
              <div class="gw-card-top">
                <span class="gw-stars" style="color:${tMeta.color}">${isLux10k ? '✦ 10k+' : (g.cat === 'ring' ? '💍' : esc(tMeta.stars.slice(0, 5)))}</span>
                <span class="gw-cnt ${cnt > 0 ? 'has' : ''}">x${fmtNum(cnt)}</span>
              </div>
              <div class="gw-art">${giftSvg(g, 50)}</div>
              <div class="gw-name">${esc(g.name)}</div>
              <div class="gw-sub">${fmtNum(g.price)} 🪙 · +${fmtNum(g.charm)}</div>
            </button>`;
          }).join('')}
        </div>
      `;
    } else if (activeTab === 'badges') {
      const badges = getGiftBadgesForStats(st);
      panel.innerHTML = `<div class="gw-badges-grid">${badges.map(b => {
        const pct = Math.min(100, Math.round((Math.min(b.cur, b.goal) / b.goal) * 100));
        const unlocked = b.cur >= b.goal;
        return `<div class="gw-badge-card ${unlocked ? 'on' : ''}">
          <div class="gw-badge-ico">${giftSvg(b.icon, 42)}</div>
          <div class="gw-badge-info">
            <div class="gw-badge-title"><b>${esc(b.title)}</b><span>${unlocked ? 'Unlocked' : `${fmtNum(Math.min(b.cur, b.goal))}/${fmtNum(b.goal)}`}</span></div>
            <small>${esc(b.desc)}</small>
            <div class="gw-prog"><i style="width:${pct}%;background:${b.color}"></i></div>
          </div>
        </div>`;
      }).join('')}</div>`;
    } else {
      panel.innerHTML = st.receivedLog.length
        ? `<div class="gw-rx-list">${st.receivedLog.map(ev => {
            const g = GIFT_BY_ID[ev.giftId] || GIFT_CATALOG[0];
            return `<div class="gw-rx-row">
              <div class="gw-rx-art">${giftSvg(g, 38)}</div>
              <div class="mid">
                <b>${esc(g.name)} ×${clampSafeInt(ev.qty || 1, 1, 100)}</b>
                <small>From ${esc(ev.fromName || 'Player')} · +${fmtNum(ev.charm)} Charm · +${fmtNum(ev.luckyCoins)} Lucky 🪙</small>
              </div>
              <time class="gw-rx-time">${new Date(ev.ts || Date.now()).toLocaleDateString([], { month: 'short', day: 'numeric' })}</time>
            </div>`;
          }).join('')}</div>`
        : `<div class="empty">No gifts received yet. Gifts sent in Chat, Party Rooms, Leaderboard, or Games appear here!</div>`;
    }
  };

  renderPanel();

  shell.onclick = e => {
    const sendBtn = e.target.closest('[data-gw-send]');
    if (sendBtn) {
      openGiftSendModal(sendBtn.dataset.gwSend, {
        onSent: () => {
          renderPanel();
          if (typeof onAfterGiftSent === 'function') onAfterGiftSent();
        }
      });
      return;
    }
    const tabBtn = e.target.closest('[data-gw-tab]');
    if (tabBtn) {
      activeTab = tabBtn.dataset.gwTab;
      shell.querySelectorAll('.gw-tab').forEach(b => {
        const on = b === tabBtn;
        b.classList.toggle('on', on);
        b.setAttribute('aria-selected', on ? 'true' : 'false');
      });
      renderPanel();
      return;
    }
    const fBtn = e.target.closest('[data-gw-filter]');
    if (fBtn) {
      activeFilter = fBtn.dataset.gwFilter || 'all';
      renderPanel();
      return;
    }
    const giftCard = e.target.closest('[data-gw-gift]');
    if (giftCard) {
      const gid = giftCard.dataset.gwGift;
      const g = GIFT_BY_ID[gid];
      if (!g) return;
      const freshUser = allUsers().find(u => u.uid === targetUser.uid) || targetUser;
      const st = getGiftWallStatsForUser(freshUser);
      openGiftInspectModal(g, Number(st.counts[gid] || 0), freshUser, isSelf, () => {
        renderPanel();
        if (typeof onAfterGiftSent === 'function') onAfterGiftSent();
      });
    }
  };
}

/* ===== Send Gift Modal (3D Luxury 10k+ Continuous FX + Exclusive 1-to-1 Bond Request Flow) ===== */
function openGiftSendModal(targetUid, opts) {
  opts = opts || {};
  const otherPlayers = allUsers().filter(u => u.uid !== uid);
  let selectedTargetUid = targetUid && targetUid !== uid ? targetUid : (otherPlayers[0]?.uid || '');
  if (!selectedTargetUid) return toast('No other players available to gift yet');

  let selectedFilter = opts.preselectFilter || 'all';
  let selectedGiftId = opts.preselectGiftId && GIFT_BY_ID[opts.preselectGiftId] ? opts.preselectGiftId : (selectedFilter === 'lux10k' ? 'g75_ferrari' : (selectedFilter === 'rings' ? 'g_ring_royal' : GIFT_CATALOG[0].id));
  let sendMode = 'single';
  let qty = 1;

  const getTargetObj = () => allUsers().find(u => u.uid === selectedTargetUid) || { uid: selectedTargetUid, name: opts.targetName || 'Player', avatar: 'av_b1', frame: 'none' };

  const m = modal('Send 3D Luxury Gift', `
    <div class="gs-wrap">
      <div class="gs-top-row">
        <div class="gs-recip" id="gsRecip"></div>
        <div class="gs-wallet">Wallet: <b id="gsBal">${fmtNum(me.coins)}</b> 🪙</div>
      </div>
      ${opts.allowPickPlayer ? `<label for="gsPickUser" style="margin-top:6px">Recipient</label><select id="gsPickUser">${otherPlayers.slice(0, 40).map(u => `<option value="${esc(u.uid)}" ${u.uid === selectedTargetUid ? 'selected' : ''}>${esc(u.name || u.uid)} (LVL ${fmtNum(calcLevel(u.exp), MAX_LEVEL)})</option>`).join('')}</select>` : ''}
      <div class="gw-tier-bar" id="gsTiers" style="margin-top:10px"></div>
      <div class="gs-grid" id="gsGrid"></div>
      <div id="gsBondNote" class="gs-bond-note" hidden></div>
      <div class="gs-footer">
        <div class="gs-mode-row">
          <div class="gs-seg" role="group" aria-label="Gift send mode">
            <button type="button" class="gs-seg-btn on" data-gsmode="single">Single (x1)</button>
            <button type="button" class="gs-seg-btn" data-gsmode="combo">Combo</button>
          </div>
          <div class="gs-combo-pills" id="gsCombos" hidden>
            ${[5, 10, 25, 50, 100].map(n => `<button type="button" class="gs-cbtn ${n === 10 ? 'on' : ''}" data-gsqty="${n}">x${n}</button>`).join('')}
          </div>
        </div>
        <div class="gs-summary" id="gsSummary"></div>
        <button type="button" class="btn gold full" id="gsSendBtn">Send Gift</button>
      </div>
    </div>
  `, 'gift-send-sheet');

  const renderModalBody = () => {
    const target = getTargetObj();
    const g = GIFT_BY_ID[selectedGiftId] || GIFT_CATALOG[0];
    const range = calcGiftLuckyRange(g, qty);
    const totalCharm = calcExactCharmForCoins(range.totalCost);

    $('#gsRecip', m).innerHTML = `${av(target, 34)}<div><small>Sending to</small><b>${styledName(target)}</b></div>`;
    $('#gsBal', m).textContent = fmtNum(me.coins);

    $('#gsTiers', m).innerHTML = VAULT_TABS.map(([k, lbl]) =>
      `<button type="button" class="gw-tbtn ${selectedFilter === k ? 'on' : ''}" data-gst="${k}">${lbl}</button>`
    ).join('');

    const list = GIFT_CATALOG.filter(item => matchVaultFilter(item, selectedFilter));
    $('#gsGrid', m).innerHTML = list.map(item => {
      const tMeta = GIFT_TIERS[item.tier];
      const active = item.id === selectedGiftId;
      const isLux10k = isLuxuryAnimatedGift(item);
      return `<button type="button" class="gs-item ${active ? 'on' : ''} ${isLux10k ? 'lux-10k-card' : ''}" data-gsid="${esc(item.id)}" data-lux10k="${isLux10k ? '1' : '0'}" style="${active ? `border-color:${tMeta.color}` : ''}">
        ${isLux10k ? renderLuxury10kFxHtml(item, true) : ''}
        <span class="gw-stars" style="color:${tMeta.color}">${isLux10k ? '✦ 10k+' : (item.cat === 'ring' ? '💍' : esc(tMeta.stars.slice(0, 5)))}</span>
        ${giftSvg(item, 46)}
        <b class="gs-iname">${esc(item.name)}</b>
        <small class="gs-iprice">${fmtNum(item.price)} 🪙 · +${fmtNum(item.charm)}</small>
      </button>`;
    }).join('');

    const bondNote = $('#gsBondNote', m);
    if (bondNote) {
      if (g.bondType && BOND_SLOT_META[g.bondType]) {
        const meta = BOND_SLOT_META[g.bondType];
        const myCur = getUserBondInSlot(me, g.bondType);
        bondNote.hidden = false;
        bondNote.className = 'gs-bond-note ' + (myCur ? 'occupied' : 'open');
        bondNote.innerHTML = myCur
          ? `<span>🔒 Your exclusive <b>${esc(meta.label)}</b> is active with <b>${esc(myCur.partnerName)}</b>. Unbind first to send a new request.</span>`
          : `<span>💎 <b>Exclusive 1-to-1 ${esc(meta.label)}</b>: Sends a Request — activates on both profiles only after <b>${esc(target.name || 'Player')}</b> accepts.</span>`;
      } else {
        bondNote.hidden = true;
      }
    }

    const animProf = getGiftAnimProfile(g, qty);
    const fxLabels = { burst: '✨ Burst FX', orbit: '🪐 Orbit FX', spotlight: '🔦 Spotlight FX', fullscreen: isLuxuryAnimatedGift(g) ? '🎬 10k+ Continuous 3D' : '🎬 5k+ Full-Screen' };
    $('#gsCombos', m).hidden = sendMode !== 'combo';
    $('#gsSummary', m).innerHTML = `
      <span><b>${esc(g.name)} ×${qty}</b></span>
      <span>Cost: <b>${fmtNum(range.totalCost)} 🪙</b></span>
      <span>Charm: <b style="color:#f472b6">+${fmtNum(totalCharm)}</b></span>
      <span class="gs-fx-pill style-${animProf.style}">${fxLabels[animProf.style] || '✨ Burst FX'}${animProf.comboLabel ? ' · ' + animProf.comboLabel : ''}</span>
    `;

    const sendBtn = $('#gsSendBtn', m);
    const isBondOccupied = Boolean(g.bondType && getUserBondInSlot(me, g.bondType));
    sendBtn.textContent = isBondOccupied
      ? `Manage / Unbind ${(BOND_SLOT_META[g.bondType] || BOND_SLOT_META.couple).label}`
      : (g.bondType
        ? `Send ${(BOND_SLOT_META[g.bondType] || BOND_SLOT_META.couple).short} Request (${fmtNum(range.totalCost)} 🪙)`
        : (sendMode === 'combo'
          ? `Send ×${qty} (${fmtNum(range.totalCost)} 🪙)`
          : `Send ${g.name} (${fmtNum(range.totalCost)} 🪙)`));
    sendBtn.disabled = !isBondOccupied && me.coins < range.totalCost;
  };

  /* Add Preview FX button next to Send */
  const sendRow = document.createElement('div');
  sendRow.className = 'row';
  sendRow.style.gap = '8px';
  const prevBtn = document.createElement('button');
  prevBtn.type = 'button';
  prevBtn.className = 'btn ghost sm';
  prevBtn.id = 'gsPreviewBtn';
  prevBtn.textContent = 'Preview FX';
  const origSend = $('#gsSendBtn', m);
  origSend.parentNode.insertBefore(sendRow, origSend);
  sendRow.appendChild(prevBtn);
  sendRow.appendChild(origSend);
  origSend.style.flex = '1';

  renderModalBody();

  prevBtn.onclick = () => {
    const g = GIFT_BY_ID[selectedGiftId] || GIFT_CATALOG[0];
    const target = getTargetObj();
    const prof = getGiftAnimProfile(g, qty);
    const evPreview = {
      giftId: g.id,
      fromName: me.name || 'You',
      toName: target.name || 'VIP',
      qty: prof.qty,
      charm: calcExactCharmForCoins(prof.totalCost),
      luckyCoins: Math.round(prof.totalCost * 0.25)
    };
    if (prof.style === 'fullscreen') showLuxuryGiftShowcase(evPreview, g);
    else {
      showGiftBroadcastAnim(evPreview);
      if (typeof playSfx === 'function') playSfx('giftSend', { tier: g.tier, qty: prof.qty, style: prof.style });
    }
  };

  if ($('#gsPickUser', m)) {
    $('#gsPickUser', m).onchange = e => {
      selectedTargetUid = e.target.value;
      renderModalBody();
    };
  }

  m.onclick = e => {
    const tBtn = e.target.closest('[data-gst]');
    if (tBtn) {
      selectedFilter = tBtn.dataset.gst || 'all';
      if (typeof playSfx === 'function') playSfx('tap');
      renderModalBody();
      return;
    }
    const gBtn = e.target.closest('[data-gsid]');
    if (gBtn) {
      selectedGiftId = gBtn.dataset.gsid;
      if (typeof playSfx === 'function') playSfx('tap');
      renderModalBody();
      return;
    }
    const mBtn = e.target.closest('[data-gsmode]');
    if (mBtn) {
      sendMode = mBtn.dataset.gsmode;
      qty = sendMode === 'combo' ? 10 : 1;
      $$('[data-gsmode]', m).forEach(b => b.classList.toggle('on', b === mBtn));
      $$('[data-gsqty]', m).forEach(b => b.classList.toggle('on', Number(b.dataset.gsqty) === qty));
      if (typeof playSfx === 'function') playSfx('tap');
      renderModalBody();
      return;
    }
    const qBtn = e.target.closest('[data-gsqty]');
    if (qBtn) {
      qty = clampSafeInt(qBtn.dataset.gsqty, 1, 100);
      $$('[data-gsqty]', m).forEach(b => b.classList.toggle('on', b === qBtn));
      if (typeof playSfx === 'function') playSfx('comboTick', { qty });
      renderModalBody();
      return;
    }
  };

  $('#gsSendBtn', m).onclick = () => {
    const gSel = GIFT_BY_ID[selectedGiftId];
    if (gSel && gSel.bondType && BOND_SLOT_META[gSel.bondType]) {
      const curBond = getUserBondInSlot(me, gSel.bondType);
      if (curBond) {
        openBondSlotOccupiedModal(gSel.bondType, curBond, () => renderModalBody());
        return;
      }
    }
    const sent = executeSendGift(selectedTargetUid, selectedGiftId, qty, {
      inDm: Boolean(opts.inDm),
      inRoom: opts.inRoom || '',
      inPartyRoom: opts.inPartyRoom || '',
      targetName: getTargetObj().name
    });
    if (sent) {
      renderModalBody();
      if (typeof opts.onSent === 'function') opts.onSent(sent);
    }
  };
}
