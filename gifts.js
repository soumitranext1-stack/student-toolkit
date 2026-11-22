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
  { id: 'g73_jet', name: 'Royal Private Jet', tier: 7, price: 50000, charm: 140000, icon: 'privatejet', fx: 'palace', c1: '#e0f2fe', c2: '#0284c7' },
  { id: 'g74_yacht_gold', name: 'Golden Mega Yacht', tier: 7, price: 75000, charm: 220000, icon: 'megayacht', fx: 'palace', c1: '#fde047', c2: '#0f766e' },
  { id: 'g75_ferrari', name: 'Ferrari Hypercar', tier: 7, price: 100000, charm: 320000, icon: 'ferrari', fx: 'car', c1: '#ef4444', c2: '#991b1b' },
  { id: 'g76_lambo', name: 'Lamborghini Aventador', tier: 7, price: 130000, charm: 440000, icon: 'lambo', fx: 'car', c1: '#facc15', c2: '#b45309' },
  { id: 'g77_bugatti', name: 'Bugatti Sovereign', tier: 7, price: 160000, charm: 560000, icon: 'bugatti', fx: 'car', c1: '#38bdf8', c2: '#1e3a8a' },
  { id: 'g78_dream_palace', name: 'Dream Palace', tier: 7, price: 200000, charm: 750000, icon: 'dreampalace', fx: 'palace', c1: '#ffd36b', c2: '#9333ea' }
];

const GIFT_BY_ID = Object.fromEntries(GIFT_CATALOG.map(g => [g.id, g]));

/* Crisp Procedural Multi-Layer Vector SVG Generator (unique silhouettes for all 72 gifts) */
function giftGlyphPath(icon, c1, c2) {
  switch (icon) {
    case 'rose': return `<path d="M24 36V23" stroke="#22c55e" stroke-width="2.6" stroke-linecap="round"/><path d="M24 30c-5 0-7-3-7-5 3 0 6 1 7 5zm0-2c5 0 7-3 7-5-3 0-6 1-7 5z" fill="#4ade80"/><path d="M24 10c5 0 8 4 8 8s-3.5 7-8 7-8-3-8-7 3-8 8-8z" fill="${c2}"/><path d="M24 12c3 0 5 2.5 5 5.5S27 22 24 22s-5-1.5-5-4.5 2-5.5 5-5.5z" fill="${c1}"/><path d="M21.5 16c1.5-1.8 4-1.8 5 0" stroke="#fff" stroke-width="1.4" stroke-linecap="round" fill="none"/>`;
    case 'coffee': return `<rect x="13" y="18" width="18" height="15" rx="4" fill="${c1}"/><path d="M31 20h3a4 4 0 0 1 0 8h-3" stroke="${c1}" stroke-width="2.6" fill="none"/><path d="M11 35h22" stroke="${c2}" stroke-width="2.8" stroke-linecap="round"/><path d="M18 14c0-2 2-2 2-4M24 14c0-2 2-2 2-4" stroke="#fde68a" stroke-width="1.8" stroke-linecap="round" fill="none"/>`;
    case 'plane': return `<path d="M37 11L11 22l9 4 4 10 13-25z" fill="${c1}" stroke="${c2}" stroke-width="1.4" stroke-linejoin="round"/><path d="M20 26L37 11" stroke="#fff" stroke-width="1.5"/>`;
    case 'clover': return `<circle cx="19" cy="18" r="5.5" fill="${c1}"/><circle cx="29" cy="18" r="5.5" fill="${c1}"/><circle cx="19" cy="27" r="5.5" fill="${c2}"/><circle cx="29" cy="27" r="5.5" fill="${c2}"/><path d="M24 29c0 4 2 7 5 8" stroke="#4ade80" stroke-width="2.5" stroke-linecap="round" fill="none"/>`;
    case 'pencil': return `<path d="M13 35l3-9L30 12l6 6-14 14-9 3z" fill="${c1}" stroke="${c2}" stroke-width="1.5" stroke-linejoin="round"/><path d="M28 14l6 6" stroke="#fff" stroke-width="1.8"/><circle cx="14" cy="14" r="2.2" fill="#fff"/>`;
    case 'candy': return `<path d="M11 24l6-5v10l-6-5zm26 0l-6-5v10l6-5z" fill="${c2}"/><circle cx="24" cy="24" r="7.5" fill="${c1}"/><path d="M19 21c3-2 7-2 10 0M19 27c3 2 7 2 10 0" stroke="#fff" stroke-width="1.6" stroke-linecap="round" fill="none"/>`;
    case 'paw': return `<ellipse cx="24" cy="28" rx="7.5" ry="6" fill="${c1}"/><circle cx="15" cy="20" r="3" fill="${c2}"/><circle cx="21" cy="16" r="3" fill="${c2}"/><circle cx="27" cy="16" r="3" fill="${c2}"/><circle cx="33" cy="20" r="3" fill="${c2}"/>`;
    case 'heart': return `<path d="M24 36s-12-7.5-12-16a7 7 0 0 1 12-4.8A7 7 0 0 1 36 20c0 8.5-12 16-12 16z" fill="${c1}" stroke="${c2}" stroke-width="1.4"/><path d="M17 18a3 3 0 0 1 3-2.5" stroke="#fff" stroke-width="1.8" stroke-linecap="round" fill="none"/>`;
    case 'sun': return `<circle cx="24" cy="24" r="7.5" fill="${c1}" stroke="${c2}" stroke-width="1.6"/><path d="M24 10v4M24 34v4M10 24h4M34 24h4M14 14l3 3M31 31l3 3M34 14l-3 3M17 31l-3 3" stroke="${c1}" stroke-width="2.2" stroke-linecap="round"/>`;
    case 'note': return `<path d="M20 31V15l14-3v15" stroke="${c1}" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/><circle cx="17" cy="31" r="4" fill="${c2}"/><circle cx="31" cy="28" r="4" fill="${c1}"/>`;
    case 'boba': return `<path d="M15 17h18l-2 19H17l-2-19z" fill="${c1}" stroke="${c2}" stroke-width="1.6"/><path d="M24 9v10" stroke="#fff" stroke-width="2.8" stroke-linecap="round"/><circle cx="20" cy="32" r="1.8" fill="#1e293b"/><circle cx="24" cy="33" r="1.8" fill="#1e293b"/><circle cx="28" cy="32" r="1.8" fill="#1e293b"/>`;
    case 'crane': return `<path d="M10 25l14-9 14 7-12 5-4 8-4-7-8-4z" fill="${c1}" stroke="${c2}" stroke-width="1.4" stroke-linejoin="round"/><path d="M24 16l2 12" stroke="#fff" stroke-width="1.4"/>`;
    case 'bouquet': return `<path d="M16 25l8 12 8-12z" fill="#fde68a"/><circle cx="19" cy="19" r="5" fill="${c1}"/><circle cx="29" cy="19" r="5" fill="${c2}"/><circle cx="24" cy="15" r="5.5" fill="#fb7185"/>`;
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
    case 'crystal': return `<polygon points="24,9 36,19 24,38 12,19" fill="${c1}" stroke="${c2}" stroke-width="1.6"/><polygon points="24,9 30,19 24,38 18,19" fill="#fff" opacity=".32"/>`;
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
    case 'prism': return `<polygon points="24,10 37,22 24,37 11,22" fill="${c1}" stroke="${c2}" stroke-width="1.6"/><path d="M24 10v27M11 22h26" stroke="#fff" stroke-width="1.2" opacity=".7"/>`;
    case 'crown': return `<polygon points="10,32 13,16 20,23 24,12 28,23 35,16 38,32" fill="${c1}" stroke="${c2}" stroke-width="1.6" stroke-linejoin="round"/><rect x="11" y="32" width="26" height="4" rx="1.5" fill="${c2}"/><circle cx="24" cy="12" r="2" fill="#fff"/>`;
    case 'diamond': return `<circle cx="24" cy="27" r="9.5" fill="none" stroke="#ffd36b" stroke-width="3"/><polygon points="24,9 31,15 24,21 17,15" fill="${c1}" stroke="${c2}" stroke-width="1.4"/>`;
    case 'katana': return `<path d="M12 36L35 12" stroke="${c1}" stroke-width="3.2" stroke-linecap="round"/><path d="M16 27l5 5" stroke="#ffd36b" stroke-width="3" stroke-linecap="round"/><path d="M12 36l6-6" stroke="${c2}" stroke-width="4" stroke-linecap="round"/>`;
    case 'drone': return `<rect x="18" y="20" width="12" height="8" rx="3" fill="${c1}" stroke="${c2}" stroke-width="1.5"/><path d="M12 16h8M28 16h8M12 32h8M28 32h8M18 22l-4-6M30 22l4-6M18 26l-4 6M30 26l4 6" stroke="${c1}" stroke-width="2" stroke-linecap="round"/>`;
    case 'guitar': return `<path d="M29 12l7 7-12 12c-3 3-8 3-11 0s-3-8 0-11l16-8z" fill="${c1}" stroke="${c2}" stroke-width="1.5"/><circle cx="19" cy="29" r="3" fill="#0f172a"/>`;
    case 'brooch': return `<ellipse cx="24" cy="24" rx="10" ry="13" fill="${c1}" stroke="#ffd36b" stroke-width="2.4"/><ellipse cx="24" cy="24" rx="5.5" ry="8" fill="${c2}"/>`;
    case 'trophy': return `<path d="M15 13h18v9a9 9 0 0 1-18 0v-9z" fill="${c1}" stroke="${c2}" stroke-width="1.6"/><path d="M15 16h-4a3 3 0 0 0 3 6h1M33 16h4a3 3 0 0 1-3 6h-1M24 31v5M17 36h14" stroke="${c1}" stroke-width="2.4" stroke-linecap="round" fill="none"/>`;
    case 'sneaker': return `<path d="M10 29c4-6 10-8 16-8l5 5h7v6H10v-3z" fill="${c1}" stroke="${c2}" stroke-width="1.5" stroke-linejoin="round"/><path d="M17 21l-5-7 8 3" fill="#fff"/>`;
    case 'compass': return `<circle cx="24" cy="24" r="12" fill="none" stroke="${c1}" stroke-width="2.6"/><polygon points="24,14 28,24 24,34 20,24" fill="${c2}"/><polygon points="24,14 28,24 24,24" fill="#ef4444"/>`;
    case 'chalice': return `<path d="M15 13h18l-3 12a6 6 0 0 1-12 0l-3-12z" fill="${c1}" stroke="${c2}" stroke-width="1.6"/><path d="M24 29v7M17 36h14" stroke="#ffd36b" stroke-width="2.6" stroke-linecap="round"/>`;
    case 'harp': return `<path d="M15 35V13c7 0 14 4 18 11l-4 11H15z" fill="none" stroke="${c1}" stroke-width="2.6" stroke-linejoin="round"/><path d="M19 15v20M23 17v18M27 20v15" stroke="${c2}" stroke-width="1.5"/>`;
    case 'feather': return `<path d="M35 11C24 11 14 20 13 35c14-1 22-11 22-24z" fill="${c1}" stroke="${c2}" stroke-width="1.5"/><path d="M12 36L33 14" stroke="#fef08a" stroke-width="1.8" stroke-linecap="round"/>`;
    case 'supercar': return `<path d="M8 28l4-7h12l7-4 9 5v6H8z" fill="${c1}" stroke="${c2}" stroke-width="1.5" stroke-linejoin="round"/><circle cx="16" cy="30" r="3.6" fill="#0f172a" stroke="#ffd36b" stroke-width="1.6"/><circle cx="33" cy="30" r="3.6" fill="#0f172a" stroke="#ffd36b" stroke-width="1.6"/>`;
    case 'yacht': return `<path d="M9 28h30l-4 7H13l-4-7z" fill="#f8fafc" stroke="${c2}" stroke-width="1.5"/><polygon points="22,11 22,26 12,26" fill="${c1}"/><polygon points="25,14 25,26 35,26" fill="${c2}"/>`;
    case 'dragon': return `<path d="M11 28c2-9 9-15 17-15 5 0 9 3 9 8 0 6-6 9-12 9 3 3 7 4 11 4-6 4-16 4-25-6z" fill="${c1}" stroke="${c2}" stroke-width="1.6"/><circle cx="30" cy="19" r="1.8" fill="#dc2626"/>`;
    case 'castle': return `<path d="M12 36V20h5v4h4V14l3-4 3 4v10h4v-4h5v16H12z" fill="${c1}" stroke="${c2}" stroke-width="1.5" stroke-linejoin="round"/><rect x="21" y="28" width="6" height="8" rx="3" fill="#0f172a"/>`;
    case 'scepter': return `<path d="M13 36l16-16" stroke="#ffd36b" stroke-width="3" stroke-linecap="round"/><circle cx="31" cy="17" r="6" fill="${c1}" stroke="${c2}" stroke-width="1.8"/><circle cx="31" cy="17" r="2.2" fill="#fff"/>`;
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
    case 'infcrown': return `<polygon points="9,31 13,14 20,22 24,10 28,22 35,14 39,31" fill="${c1}" stroke="${c2}" stroke-width="1.6"/><path d="M16 35c3-3 6 3 8 0s5-3 8 0" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/>`;
    case 'palace': return `<path d="M10 35V22l14-11 14 11v13H10z" fill="${c1}" stroke="${c2}" stroke-width="1.6"/><path d="M8 22l16-12 16 12" stroke="#ffd36b" stroke-width="2.4" fill="none"/><rect x="20" y="25" width="8" height="10" rx="2" fill="${c2}"/>`;
    case 'supernova': return `<polygon points="24,7 28,18 40,18 30,25 34,37 24,30 14,37 18,25 8,18 20,18" fill="${c1}" stroke="${c2}" stroke-width="1.4"/><circle cx="24" cy="23" r="5" fill="#fff"/>`;
    case 'pegasus': return `<path d="M12 29c2-9 9-16 19-16-2 5-1 8 4 10-5 2-8 6-9 12-5-1-10-3-14-6z" fill="${c1}" stroke="${c2}" stroke-width="1.5"/><path d="M16 19l-7-7 11 3" fill="#fff"/>`;
    case 'airship': return `<ellipse cx="24" cy="20" rx="14" ry="8.5" fill="${c1}" stroke="${c2}" stroke-width="1.6"/><rect x="19" y="30" width="10" height="5" rx="2" fill="#ffd36b"/><path d="M20 28v2M28 28v2" stroke="#fff" stroke-width="1.6"/>`;
    case 'citadel': return `<polygon points="24,8 35,16 32,35 16,35 13,16" fill="${c1}" stroke="${c2}" stroke-width="1.6"/><polygon points="24,14 29,22 24,30 19,22" fill="#fff" opacity=".85"/>`;
    case 'aurora': return `<path d="M10 32c4-14 10-20 14-20s10 6 14 20H10z" fill="${c1}" stroke="${c2}" stroke-width="1.6"/><path d="M13 24c4-5 18-5 22 0" stroke="#fff" stroke-width="2" fill="none"/>`;
    case 'vault': return `<rect x="11" y="12" width="26" height="24" rx="5" fill="${c1}" stroke="${c2}" stroke-width="1.8"/><circle cx="24" cy="24" r="6" fill="#0f172a" stroke="#ffd36b" stroke-width="2"/><path d="M24 19v10M19 24h10" stroke="#ffd36b" stroke-width="1.8"/>`;
    case 'privatejet': return `<path d="M8 29l12-4 14-12 6-1-9 12 7 3-3 3-9-2-7 8-3-1 3-7-11-1z" fill="${c1}" stroke="${c2}" stroke-width="1.4" stroke-linejoin="round"/><path d="M22 22l12-9" stroke="#ffd36b" stroke-width="1.6" stroke-linecap="round"/>`;
    case 'megayacht': return `<path d="M7 29h34l-5 8H12l-5-8z" fill="#f8fafc" stroke="${c2}" stroke-width="1.5"/><path d="M13 24h22l-3 5H13v-5z" fill="${c1}" stroke="${c2}" stroke-width="1.3"/><path d="M17 19h13l-2 5H17v-5z" fill="#fef08a"/><path d="M12 32h24" stroke="#f59e0b" stroke-width="1.8" stroke-linecap="round"/>`;
    case 'ferrari': return `<path d="M6 29l3-6 9-4h11l8 4 5 2v4H6z" fill="${c1}" stroke="${c2}" stroke-width="1.5" stroke-linejoin="round"/><path d="M15 22l5-3h8l4 3H15z" fill="#1e293b" stroke="#fde047" stroke-width=".9"/><circle cx="15" cy="30.5" r="4" fill="#0f172a" stroke="#ffd36b" stroke-width="1.6"/><circle cx="34" cy="30.5" r="4" fill="#0f172a" stroke="#ffd36b" stroke-width="1.6"/><path d="M39 26h3" stroke="#fef08a" stroke-width="2" stroke-linecap="round"/>`;
    case 'lambo': return `<path d="M6 30l6-6 9-5h8l13 6 1 5H6z" fill="${c1}" stroke="${c2}" stroke-width="1.5" stroke-linejoin="round"/><polygon points="15,23 22,19 29,19 34,23" fill="#0f172a"/><circle cx="15" cy="31" r="4" fill="#111827" stroke="#fff" stroke-width="1.5"/><circle cx="34" cy="31" r="4" fill="#111827" stroke="#fff" stroke-width="1.5"/><path d="M9 26h5" stroke="#ef4444" stroke-width="1.8" stroke-linecap="round"/>`;
    case 'bugatti': return `<path d="M6 29c2-5 8-9 17-9h8c5 0 9 3 11 6v3H6z" fill="${c1}" stroke="${c2}" stroke-width="1.5"/><path d="M16 21c3-2 9-2 13 0l3 3H14l2-3z" fill="#0f172a"/><path d="M21 24c4 0 6 4 2 6" fill="none" stroke="#ffd36b" stroke-width="1.6"/><circle cx="15" cy="30.5" r="4" fill="#0f172a" stroke="#7dd3fc" stroke-width="1.6"/><circle cx="34" cy="30.5" r="4" fill="#0f172a" stroke="#7dd3fc" stroke-width="1.6"/>`;
    case 'dreampalace': return `<path d="M8 36V23h5v-5l4-4 4 4v5h6v-5l4-4 4 4v5h5v13H8z" fill="${c2}" stroke="${c1}" stroke-width="1.4" stroke-linejoin="round"/><path d="M16 23c0-7 4-12 8-14 4 2 8 7 8 14H16z" fill="${c1}" stroke="#fff" stroke-width="1.1"/><path d="M24 6v4" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/><rect x="20.5" y="27" width="7" height="9" rx="3.5" fill="#fef08a"/><circle cx="13" cy="11" r="1.4" fill="#fff"/><circle cx="35" cy="11" r="1.4" fill="#fff"/>`;
    default: return `<circle cx="24" cy="24" r="11" fill="${c2}" stroke="${c1}" stroke-width="2.2"/><circle cx="24" cy="24" r="5" fill="#fff"/><ellipse cx="24" cy="24" rx="16" ry="5" fill="none" stroke="${c1}" stroke-width="1.8" transform="rotate(-25 24 24)"/>`;
  }
}

function giftSvg(giftOrId, size = 44) {
  const g = typeof giftOrId === 'string' ? GIFT_BY_ID[giftOrId] : giftOrId;
  if (!g) return '';
  const tier = GIFT_TIERS[g.tier] || GIFT_TIERS[1];
  return `<svg class="gift-svg" width="${size}" height="${size}" viewBox="0 0 48 48" aria-hidden="true">
    <circle cx="24" cy="24" r="21" fill="${g.c1}" fill-opacity="0.14" stroke="${tier.color}" stroke-opacity="0.42" stroke-width="1.3"/>
    <circle cx="24" cy="24" r="16.5" fill="${g.c2}" fill-opacity="0.12"/>
    ${giftGlyphPath(g.icon, g.c1, g.c2)}
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
    <!-- Twin Outer Minarets -->
    <rect x="44" y="74" width="20" height="76" rx="3" fill="url(#palaceWall)" stroke="#ffd36b" stroke-width="1.6"/>
    <path d="M40 74 Q54 44 68 74 Z" fill="url(#palaceGold)"/>
    <path d="M54 40v12" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
    <rect x="276" y="74" width="20" height="76" rx="3" fill="url(#palaceWall)" stroke="#ffd36b" stroke-width="1.6"/>
    <path d="M272 74 Q286 44 300 74 Z" fill="url(#palaceGold)"/>
    <path d="M286 40v12" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
    <!-- Main Palace Body -->
    <rect x="74" y="84" width="192" height="66" rx="6" fill="url(#palaceWall)" stroke="#ffd36b" stroke-width="2"/>
    <!-- Inner Side Domes -->
    <path d="M84 84 Q108 46 132 84 Z" fill="url(#palaceGold)" stroke="#fff" stroke-width="1"/>
    <path d="M208 84 Q232 46 256 84 Z" fill="url(#palaceGold)" stroke="#fff" stroke-width="1"/>
    <!-- Grand Central Golden Dome -->
    <path d="M124 84 C124 38 150 22 170 14 C190 22 216 38 216 84 Z" fill="url(#palaceGold)" stroke="#fff" stroke-width="1.8"/>
    <path d="M170 4v14" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/>
    <circle cx="170" cy="6" r="3" fill="#fff"/>
    <!-- Illuminated Royal Arches -->
    <path d="M148 150 V112 C148 96 192 96 192 112 V150 Z" fill="#fef08a" stroke="#f59e0b" stroke-width="2"/>
    <path d="M158 150 V118 C158 107 182 107 182 118 V150 Z" fill="#fffbeb"/>
    <rect x="94" y="106" width="24" height="32" rx="12" fill="#fde047" opacity="0.9"/>
    <rect x="222" y="106" width="24" height="32" rx="12" fill="#fde047" opacity="0.9"/>
    <!-- Royal Steps & Sparkles -->
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
    if (!ev || ev.toUid !== targetUid || !GIFT_BY_ID[ev.giftId]) return;
    const evTs = Number(ev.ts || 0);
    if (resetAt > 0 && evTs <= resetAt) return;
    receivedLog.push(ev);
    const qty = clampSafeInt(ev.qty || 1, 1, 99);
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

/* Proportional Lucky Coin Drop + Charm Calculation */
function rollGiftTransactionRewards(gift, qty) {
  const safeQty = clampSafeInt(qty, 1, 99);
  const totalCost = clampSafeInt(gift.price * safeQty, 1, MAX_COINS);
  const recipientCharm = clampSafeInt(gift.charm * safeQty, 1, MAX_COINS);
  const senderCharm = Math.max(1, Math.round(recipientCharm * 0.25));

  const r = Math.random();
  const tierBoost = 1 + (gift.tier - 1) * 0.04;
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
  const maxLuckyCap = gift.tier >= 7 ? 250000 : 50000;
  const luckyCoins = Math.max(1, clampSafeInt(Math.round(totalCost * pct * tierBoost), 1, maxLuckyCap));
  return { totalCost, recipientCharm, senderCharm, luckyCoins, luckLabel };
}

/* Sleek World-Chat-Style Floating Gift Broadcast Banner Animation */
function showGiftBroadcastAnim(ev) {
  const g = GIFT_BY_ID[ev.giftId];
  if (!g) return;
  const tier = GIFT_TIERS[g.tier] || GIFT_TIERS[1];
  $$('.gift-banner-anim').forEach(el => el.remove());
  const box = document.createElement('div');
  box.className = `gift-banner-anim gift-tier-${g.tier}`;
  box.innerHTML = `
    <div class="gba-ico">${giftSvg(g, 48)}</div>
    <div class="gba-copy">
      <div class="gba-top"><b>${esc(ev.fromName || 'Player')}</b> <span>sent to</span> <b>${esc(ev.toName || 'Player')}</b></div>
      <div class="gba-mid">${esc(g.name)} <strong style="color:${tier.color}">x${ev.qty}</strong> · <span style="color:#f472b6">+${fmtNum(ev.charm)} Charm</span> · <span style="color:#ffd36b">+${fmtNum(ev.luckyCoins)} Lucky 🪙</span></div>
    </div>
  `;
  document.body.appendChild(box);
  requestAnimationFrame(() => box.classList.add('in'));
  setTimeout(() => {
    box.classList.remove('in');
    setTimeout(() => box.remove(), 350);
  }, 3400);
}

/* Full-Stage Luxury Showcase Overlay (Car Drive-Across + Engine SFX & Grand Dream Palace Reveal) */
function showLuxuryGiftShowcase(ev, giftArg) {
  const g = giftArg || GIFT_BY_ID[ev?.giftId];
  if (!g) return;
  const isCar = g.fx === 'car';
  const tier = GIFT_TIERS[g.tier] || GIFT_TIERS[7];
  $$('.lux-showcase').forEach(el => el.remove());

  const overlay = document.createElement('div');
  overlay.className = `lux-showcase ${isCar ? 'lux-mode-car' : 'lux-mode-palace'}`;
  overlay.setAttribute('role', 'status');
  overlay.setAttribute('aria-live', 'polite');
  overlay.dataset.luxGift = g.id;

  const qty = clampSafeInt(ev?.qty || 1, 1, 99);
  const fromName = esc(ev?.fromName || ev?.name || 'Player');
  const toName = esc(ev?.toName || 'Player');
  const charmTxt = fmtNum(ev?.charm || g.charm * qty);
  const luckyTxt = fmtNum(ev?.luckyCoins || 0);

  overlay.innerHTML = `
    <div class="lux-stage">
      <button type="button" class="lux-close" aria-label="Close showcase">✕</button>
      <div class="lux-kicker">${esc(tier.stars)} ${esc(tier.name)} ULTRA-LUXURY ARRIVAL</div>
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
        <div class="lux-title">${esc(g.name)} <span>×${qty}</span></div>
        <div class="lux-sub"><b>${fromName}</b> gifted <b>${toName}</b> · <em style="color:#f9a8d4">+${charmTxt} Charm</em>${luckyTxt && Number(ev?.luckyCoins) > 0 ? ` · <em style="color:#fde047">+${luckyTxt} Lucky 🪙</em>` : ''}</div>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('in'));

  if (typeof playSfx === 'function') {
    playSfx(isCar ? 'carDrive' : 'palaceReveal', { model: g.id });
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

/* Recipient Auto-Ingest for Incoming Gifts (adds to Gift Wallet, Charm Box, and Lucky Coins once) */
function ingestIncomingGiftEvents(list) {
  if (!Array.isArray(list)) return;
  giftEvents = list.slice(0, 250);
  ls.set('sg_gift_events', giftEvents);

  let changedMe = false;
  let totalNewLucky = 0;
  let latestIncoming = null;
  const resetAt = Number(me.giftResetAt || 0);

  giftEvents.forEach(ev => {
    if (!ev || !ev.id || ev.toUid !== uid || !GIFT_BY_ID[ev.giftId]) return;
    if (resetAt > 0 && Number(ev.ts || 0) <= resetAt) return;
    const doneKey = 'gift_rx_' + ev.id;
    if (me.done[doneKey]) return;

    me.done[doneKey] = 1;
    me.giftWallet = me.giftWallet && typeof me.giftWallet === 'object' ? me.giftWallet : {};
    me.giftWallet[ev.giftId] = clampSafeInt((me.giftWallet[ev.giftId] || 0) + clampSafeInt(ev.qty || 1, 1, 99), 0, MAX_COINS);
    me.charm = clampSafeInt((me.charm || 0) + clampSafeInt(ev.charm || 0, 0, MAX_COINS), 0, MAX_COINS);

    const gObj = GIFT_BY_ID[ev.giftId];
    const maxLucky = gObj && gObj.tier >= 7 ? 250000 : 50000;
    const lucky = clampSafeInt(ev.luckyCoins || 0, 0, maxLucky);
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
      if (gLatest && gLatest.tier >= 7) {
        showLuxuryGiftShowcase(latestIncoming, gLatest);
      } else {
        showGiftBroadcastAnim(latestIncoming);
        if (typeof playSfx === 'function') {
          playSfx('giftReceive');
          if (totalNewLucky > 0) setTimeout(() => playSfx('luckyDrop'), 220);
        }
      }
      toast(`Received gift! +${fmtNum(totalNewLucky)} Lucky Coins & Charm added!`);
    }
  }
}

/* Render World Chat / DM Gift Broadcast Card (with Clickable Player Profiles & Tier 7 Replay Show) */
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
  const replayBtn = g.tier >= 7
    ? `<button type="button" class="btn gold sm wc-replay-btn" data-replaygift="${esc(g.id)}" data-replayfrom="${esc(m.fromName || m.name || 'Player')}" data-replayto="${esc(m.toName || 'Player')}" data-replayqty="${clampSafeInt(m.qty || 1, 1, 99)}" data-replaycharm="${clampSafeInt(m.charm || g.charm, 0, MAX_COINS)}" data-replaylucky="${clampSafeInt(m.luckyCoins || 0, 0, 250000)}">${g.fx === 'car' ? 'Replay Drive' : 'Replay Show'}</button>`
    : '';

  return `<div class="wc-gift-card gift-tier-${g.tier}" style="border-color:${tier.border};background:${tier.bg}">
    <div class="wc-gift-art">${giftSvg(g, 58)}</div>
    <div class="wc-gift-meta">
      <div class="wc-gift-kicker">${esc(tier.stars)} ${esc(tier.name)} Gift Broadcast · ${esc(m.luckLabel || 'Lucky Drop')}</div>
      <div class="wc-gift-title">${senderHtml} sent <span>${esc(g.name)} x${clampSafeInt(m.qty || 1, 1, 99)}</span> to ${recipHtml}</div>
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
  if (!targetUid || targetUid === uid) return toast('Pick another player to gift');
  const gift = GIFT_BY_ID[giftId];
  if (!gift) return toast('Gift not found');
  const safeQty = clampSafeInt(qty, 1, 99);
  const lockKey = 'gift_send_' + targetUid + '_' + giftId;
  if (inFlightOps.has(lockKey)) return;

  const rewards = rollGiftTransactionRewards(gift, safeQty);
  if (me.coins < rewards.totalCost) {
    return toast(`Need ${fmtNum(rewards.totalCost)} coins (You have ${fmtNum(me.coins)})`);
  }

  inFlightOps.add(lockKey);
  try {
    const targetUser = allUsers().find(u => u.uid === targetUid) || { uid: targetUid, name: (contextOpts && contextOpts.targetName) || 'Player' };
    const nowTs = Date.now();
    const evId = 'gf_' + nowTs.toString(36) + Math.random().toString(36).slice(2, 6);

    /* Deduct coins & award sender Gifter Charm */
    me.coins = clampCoins(me.coins - rewards.totalCost);
    me.charmSent = clampSafeInt((me.charmSent || 0) + rewards.senderCharm, 0, MAX_COINS);
    saveMe();
    patchUser(uid, { ...base(), coins: me.coins, charmSent: me.charmSent });
    updateHud();
    dbOp(() => F.setDoc(userRef(uid), { ...base(), coins: me.coins, charmSent: me.charmSent }, { merge: true }));

    /* Create Gift Event record (feeds Recipient Gift Wall, Charm Box & Lucky Coin drop) */
    const evObj = {
      id: evId,
      fromUid: uid,
      fromName: me.name || 'Player',
      fromAvatar: me.avatar || '🦊',
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
      avatar: me.avatar || '🦊',
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

    /* Also mirror into DM thread if opened or requested */
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

    /* Mirror into active Multiplayer Room feed if sent from a room */
    if (contextOpts && contextOpts.inRoom && typeof appendMultiplayerRoomGift === 'function') {
      appendMultiplayerRoomGift(contextOpts.inRoom, evObj);
    }

    if (gift.tier >= 7) {
      showLuxuryGiftShowcase(evObj, gift);
      if (typeof playSfx === 'function' && rewards.luckLabel !== 'Lucky Drop') {
        setTimeout(() => playSfx('luckyDrop'), 1200);
      }
    } else {
      showGiftBroadcastAnim(evObj);
      if (typeof playSfx === 'function') {
        playSfx('giftSend', { tier: gift.tier, qty: safeQty });
        if (rewards.luckLabel !== 'Lucky Drop') {
          setTimeout(() => playSfx('luckyDrop'), 240);
        }
      }
    }
    if (typeof buildProfile === 'function') buildProfile();
    if (typeof cur !== 'undefined' && cur && typeof renderThread === 'function') renderThread();
    toast(`Sent ${gift.name} x${safeQty}! +${fmtNum(rewards.recipientCharm)} Charm · ${rewards.luckLabel}: +${fmtNum(rewards.luckyCoins)} Lucky 🪙`);
    return evObj;
  } finally {
    setTimeout(() => inFlightOps.delete(lockKey), 400);
  }
}

/* ===== WePlay-Style Multi-Tier Gift Wall Component (Profile & Public Profile) ===== */
function renderGiftWallHtml(targetUser, isSelf) {
  const st = getGiftWallStatsForUser(targetUser);
  return `
    <div class="gw-shell" data-gw-uid="${esc(targetUser.uid)}" data-gw-self="${isSelf ? '1' : '0'}">
      <div class="gw-charm-box">
        <div class="gw-charm-head">
          <div>
            <div class="gw-charm-kicker">Charm Box &amp; Gift Wallet</div>
            <div class="gw-charm-score">${fmtNum(st.totalCharm)} <span>Charm</span></div>
          </div>
          ${!isSelf
            ? `<button type="button" class="btn gold sm" data-gw-send="${esc(targetUser.uid)}">Send Gift</button>`
            : `<span class="gw-self-sent">Sent Charm: ${fmtNum(st.sentCharm)}</span>`}
        </div>
        <div class="gw-charm-metrics">
          <span>Collected <b>${st.collectedCount}/${st.totalCatalog}</b></span>
          <span aria-hidden="true">·</span>
          <span>Received <b>${fmtNum(st.totalReceivedCount)}</b></span>
          <span aria-hidden="true">·</span>
          <span>Gifter Charm <b>${fmtNum(st.sentCharm)}</b></span>
        </div>
      </div>

      <div class="gw-tabs" role="tablist">
        <button type="button" class="gw-tab on" data-gw-tab="wall" role="tab" aria-selected="true">Gift Wall</button>
        <button type="button" class="gw-tab" data-gw-tab="badges" role="tab" aria-selected="false">Gift Badges</button>
        <button type="button" class="gw-tab" data-gw-tab="received" role="tab" aria-selected="false">Received (${st.receivedLog.length})</button>
      </div>

      <div class="gw-panel" data-gw-panel></div>
    </div>
  `;
}

function bindGiftWallEvents(rootEl, targetUser, isSelf, onAfterGiftSent) {
  const shell = rootEl.querySelector('.gw-shell');
  if (!shell) return;
  let activeTab = 'wall';
  let activeTier = 0; /* 0 = All */

  const renderPanel = () => {
    const freshUser = allUsers().find(u => u.uid === targetUser.uid) || targetUser;
    const st = getGiftWallStatsForUser(freshUser);
    const panel = shell.querySelector('[data-gw-panel]');
    if (!panel) return;

    const scoreEl = shell.querySelector('.gw-charm-score');
    if (scoreEl) scoreEl.innerHTML = `${fmtNum(st.totalCharm)} <span>Charm</span>`;
    const metricsEl = shell.querySelector('.gw-charm-metrics');
    if (metricsEl) {
      metricsEl.innerHTML = `<span>Collected <b>${st.collectedCount}/${st.totalCatalog}</b></span><span aria-hidden="true">·</span><span>Received <b>${fmtNum(st.totalReceivedCount)}</b></span><span aria-hidden="true">·</span><span>Gifter Charm <b>${fmtNum(st.sentCharm)}</b></span>`;
    }
    const rxTab = shell.querySelector('[data-gw-tab="received"]');
    if (rxTab) rxTab.textContent = `Received (${st.receivedLog.length})`;

    if (activeTab === 'wall') {
      const tierBtns = [
        `<button type="button" class="gw-tbtn ${activeTier === 0 ? 'on' : ''}" data-gw-tier="0">All (${GIFT_CATALOG.length})</button>`,
        ...[1, 2, 3, 4, 5, 6, 7].map(t => `<button type="button" class="gw-tbtn ${activeTier === t ? 'on' : ''}" data-gw-tier="${t}">${t}★ ${GIFT_TIERS[t].name}</button>`)
      ].join('');

      const list = GIFT_CATALOG
        .filter(g => activeTier === 0 || g.tier === activeTier)
        .sort((a, b) => (Number(st.counts[b.id] || 0) > 0 ? 1 : 0) - (Number(st.counts[a.id] || 0) > 0 ? 1 : 0) || a.tier - b.tier || a.price - b.price);

      panel.innerHTML = `
        <div class="gw-tier-bar">${tierBtns}</div>
        <div class="gw-grid">
          ${list.map(g => {
            const cnt = Number(st.counts[g.id] || 0);
            const tMeta = GIFT_TIERS[g.tier];
            return `<button type="button" class="gw-card ${cnt > 0 ? 'owned' : 'locked'} gw-t${g.tier}" data-gw-gift="${esc(g.id)}" style="${cnt > 0 ? `border-color:${tMeta.border}` : ''}">
              <div class="gw-card-top">
                <span class="gw-stars" style="color:${tMeta.color}">${esc(tMeta.stars)}</span>
                <span class="gw-cnt ${cnt > 0 ? 'has' : ''}">x${fmtNum(cnt)}</span>
              </div>
              <div class="gw-art">${giftSvg(g, 44)}</div>
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
                <b>${esc(g.name)} ×${clampSafeInt(ev.qty || 1, 1, 99)}</b>
                <small>From ${esc(ev.fromName || 'Player')} · +${fmtNum(ev.charm)} Charm · +${fmtNum(ev.luckyCoins)} Lucky 🪙</small>
              </div>
              <time class="gw-rx-time">${new Date(ev.ts || Date.now()).toLocaleDateString([], { month: 'short', day: 'numeric' })}</time>
            </div>`;
          }).join('')}</div>`
        : `<div class="empty">No gifts received yet. Gifts sent in Chat, Leaderboard, or Games appear here!</div>`;
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
    const tierBtn = e.target.closest('[data-gw-tier]');
    if (tierBtn) {
      activeTier = Number(tierBtn.dataset.gwTier || 0);
      renderPanel();
      return;
    }
    const giftCard = e.target.closest('[data-gw-gift]');
    if (giftCard) {
      const gid = giftCard.dataset.gwGift;
      if (!isSelf) {
        openGiftSendModal(targetUser.uid, {
          preselectGiftId: gid,
          onSent: () => {
            renderPanel();
            if (typeof onAfterGiftSent === 'function') onAfterGiftSent();
          }
        });
      } else {
        const g = GIFT_BY_ID[gid];
        if (g) toast(`${g.name} (${GIFT_TIERS[g.tier].stars}) · ${fmtNum(g.price)} coins · +${fmtNum(g.charm)} Charm`);
      }
    }
  };
}

/* ===== Send Gift Modal (Single & Combo Modes, 72 Tiered Gifts) ===== */
function openGiftSendModal(targetUid, opts) {
  opts = opts || {};
  const otherPlayers = allUsers().filter(u => u.uid !== uid);
  let selectedTargetUid = targetUid && targetUid !== uid ? targetUid : (otherPlayers[0]?.uid || '');
  if (!selectedTargetUid) return toast('No other players available to gift yet');

  let selectedTier = 0;
  let selectedGiftId = opts.preselectGiftId && GIFT_BY_ID[opts.preselectGiftId] ? opts.preselectGiftId : GIFT_CATALOG[0].id;
  let sendMode = 'single'; /* 'single' | 'combo' */
  let qty = 1;

  const getTargetObj = () => allUsers().find(u => u.uid === selectedTargetUid) || { uid: selectedTargetUid, name: opts.targetName || 'Player', avatar: '🦊', frame: 'none' };

  const m = modal('Send Gift', `
    <div class="gs-wrap">
      <div class="gs-top-row">
        <div class="gs-recip" id="gsRecip"></div>
        <div class="gs-wallet">Your Wallet: <b id="gsBal">${fmtNum(me.coins)}</b> 🪙</div>
      </div>
      ${opts.allowPickPlayer ? `<label for="gsPickUser" style="margin-top:6px">Recipient</label><select id="gsPickUser">${otherPlayers.slice(0, 40).map(u => `<option value="${esc(u.uid)}" ${u.uid === selectedTargetUid ? 'selected' : ''}>${esc(u.name || u.uid)} (LVL ${fmtNum(calcLevel(u.exp), MAX_LEVEL)})</option>`).join('')}</select>` : ''}
      <div class="gw-tier-bar" id="gsTiers" style="margin-top:10px"></div>
      <div class="gs-grid" id="gsGrid"></div>
      <div class="gs-footer">
        <div class="gs-mode-row">
          <div class="gs-seg" role="group" aria-label="Gift send mode">
            <button type="button" class="gs-seg-btn on" data-gsmode="single">Single (x1)</button>
            <button type="button" class="gs-seg-btn" data-gsmode="combo">Combo</button>
          </div>
          <div class="gs-combo-pills" id="gsCombos" hidden>
            ${[5, 10, 25, 50, 99].map(n => `<button type="button" class="gs-cbtn ${n === 5 ? 'on' : ''}" data-gsqty="${n}">x${n}</button>`).join('')}
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
    const totalCost = g.price * qty;
    const totalCharm = g.charm * qty;
    const minLucky = Math.max(1, Math.round(totalCost * 0.08));
    const maxLuckyCap = g.tier >= 7 ? 250000 : 50000;
    const maxLucky = Math.min(maxLuckyCap, Math.max(2, Math.round(totalCost * (1.25 * (1 + (g.tier - 1) * 0.04)))));

    $('#gsRecip', m).innerHTML = `${av(target, 34)}<div><small>Sending to</small><b>${styledName(target)}</b></div>`;
    $('#gsBal', m).textContent = fmtNum(me.coins);

    $('#gsTiers', m).innerHTML = [
      `<button type="button" class="gw-tbtn ${selectedTier === 0 ? 'on' : ''}" data-gst="0">All (${GIFT_CATALOG.length})</button>`,
      ...[1, 2, 3, 4, 5, 6, 7].map(t => `<button type="button" class="gw-tbtn ${selectedTier === t ? 'on' : ''}" data-gst="${t}">${t}★ ${GIFT_TIERS[t].name}</button>`)
    ].join('');

    const list = GIFT_CATALOG.filter(item => selectedTier === 0 || item.tier === selectedTier);
    $('#gsGrid', m).innerHTML = list.map(item => {
      const tMeta = GIFT_TIERS[item.tier];
      const active = item.id === selectedGiftId;
      return `<button type="button" class="gs-item ${active ? 'on' : ''}" data-gsid="${esc(item.id)}" style="${active ? `border-color:${tMeta.color}` : ''}">
        <span class="gw-stars" style="color:${tMeta.color}">${esc(tMeta.stars)}</span>
        ${giftSvg(item, 42)}
        <b class="gs-iname">${esc(item.name)}</b>
        <small class="gs-iprice">${fmtNum(item.price)} 🪙</small>
      </button>`;
    }).join('');

    $('#gsCombos', m).hidden = sendMode !== 'combo';
    $('#gsSummary', m).innerHTML = `
      <span><b>${esc(g.name)} ×${qty}</b></span>
      <span>Cost: <b>${fmtNum(totalCost)} 🪙</b></span>
      <span>Charm: <b style="color:#f472b6">+${fmtNum(totalCharm)}</b></span>
      <span>Lucky Drop: <b style="color:#ffd36b">+${fmtNum(minLucky)}–${fmtNum(maxLucky)} 🪙</b></span>
    `;

    const sendBtn = $('#gsSendBtn', m);
    sendBtn.textContent = sendMode === 'combo'
      ? `Send Combo ${g.name} ×${qty} (${fmtNum(totalCost)} 🪙)`
      : `Send ${g.name} (${fmtNum(totalCost)} 🪙)`;
    sendBtn.disabled = me.coins < totalCost;
  };

  renderModalBody();

  if ($('#gsPickUser', m)) {
    $('#gsPickUser', m).onchange = e => {
      selectedTargetUid = e.target.value;
      renderModalBody();
    };
  }

  m.onclick = e => {
    const tBtn = e.target.closest('[data-gst]');
    if (tBtn) {
      selectedTier = Number(tBtn.dataset.gst || 0);
      renderModalBody();
      return;
    }
    const gBtn = e.target.closest('[data-gsid]');
    if (gBtn) {
      selectedGiftId = gBtn.dataset.gsid;
      renderModalBody();
      return;
    }
    const mBtn = e.target.closest('[data-gsmode]');
    if (mBtn) {
      sendMode = mBtn.dataset.gsmode;
      qty = sendMode === 'combo' ? 5 : 1;
      $$('[data-gsmode]', m).forEach(b => b.classList.toggle('on', b === mBtn));
      $$('[data-gsqty]', m).forEach(b => b.classList.toggle('on', Number(b.dataset.gsqty) === qty));
      renderModalBody();
      return;
    }
    const qBtn = e.target.closest('[data-gsqty]');
    if (qBtn) {
      qty = clampSafeInt(qBtn.dataset.gsqty, 1, 99);
      $$('[data-gsqty]', m).forEach(b => b.classList.toggle('on', b === qBtn));
      renderModalBody();
      return;
    }
  };

  $('#gsSendBtn', m).onclick = () => {
    const sent = executeSendGift(selectedTargetUid, selectedGiftId, qty, {
      inDm: Boolean(opts.inDm),
      inRoom: opts.inRoom || '',
      targetName: getTargetObj().name
    });
    if (sent) {
      renderModalBody();
      if (typeof opts.onSent === 'function') opts.onSent(sent);
    }
  };
}
