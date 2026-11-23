/* =====================================================================
   AVATARS: Clean 5 Boy + 5 Girl Sleek Portrait Avatars + Custom Photo
   + Exclusive Leaderboard Top 1-3 SVG Emblems (No cluttered store avatars)
   ===================================================================== */
"use strict";

function makePortraitSvg(id, bg1, bg2, accent, hairColor, skin, style) {
  const isGirl = style.startsWith('girl');
  const hairBack = isGirl
    ? `<path d="M12 34c0-14 9-23 20-23s20 9 20 23v16c-4 3.5-10 5-20 5s-16-1.5-20-5V34z" fill="url(#ah_${id})"/>
       <path d="M15 35c1-11 8-19 17-19s16 8 17 19" stroke="#ffffff" stroke-opacity=".18" stroke-width="1.5" fill="none"/>`
    : '';
  const hairTop = isGirl
    ? `<path d="M16 30c1-12 8-18 16-18s15 6 16 18c-4.5-4.5-10-6.5-16-6.5s-11.5 2-16 6.5z" fill="url(#ah_${id})"/>
       <path d="M21 19c4-3.5 10-4.5 16-2" stroke="#ffffff" stroke-opacity=".35" stroke-width="2" stroke-linecap="round" fill="none"/>
       <path d="M25 22c3-1.6 7-1.8 11-.4" stroke="${accent}" stroke-opacity=".55" stroke-width="1.2" stroke-linecap="round" fill="none"/>`
    : `<path d="M17 29c1-11 7.5-17 15-17s14 5.5 15 16.5c-3.5-4.5-8-6.8-15-6.8-7 0-11.5 2.5-15 7.3z" fill="url(#ah_${id})"/>
       <path d="M21 18c4.5-3.2 10.5-3.6 16-1.4" stroke="#ffffff" stroke-opacity=".32" stroke-width="2" stroke-linecap="round" fill="none"/>
       <path d="M22 17l6 3.8 7-3.8" stroke="${accent}" stroke-width="1.4" stroke-linecap="round" opacity=".68"/>`;
  const accessory =
    style === 'boy_cyber'
      ? `<rect x="20" y="28.2" width="24" height="6.2" rx="3.1" fill="url(#aglass_${id})" stroke="${accent}" stroke-width="1.6"/>
         <path d="M23 29.8h18" stroke="#ffffff" stroke-opacity=".55" stroke-width="1" stroke-linecap="round"/>`
    : style === 'boy_hood'
      ? `<path d="M10 60c3.5-12.5 11-18 22-18s18.5 5.5 22 18" fill="#0f172a" stroke="${accent}" stroke-width="1.8"/>
         <path d="M16 58c3-8 9-12 16-12s13 4 16 12" stroke="#ffffff" stroke-opacity=".18" stroke-width="1.2" fill="none"/>`
    : style === 'girl_crown'
      ? `<path d="M21 15l4-6.5 7 5 7-5 4 6.5z" fill="url(#acrn_${id})" stroke="#92400e" stroke-width="1.1" stroke-linejoin="round"/>
         <circle cx="32" cy="12" r="1.7" fill="#ffffff"/><circle cx="25" cy="13.2" r="1.1" fill="#fde047"/><circle cx="39" cy="13.2" r="1.1" fill="#fde047"/>`
    : style === 'girl_visor'
      ? `<rect x="21" y="28.2" width="22" height="5.8" rx="2.9" fill="url(#aglass_${id})" stroke="${accent}" stroke-width="1.5"/>
         <path d="M24 29.8h16" stroke="#ffffff" stroke-opacity=".5" stroke-width="1" stroke-linecap="round"/>`
    : style === 'boy_headset'
      ? `<path d="M15.5 32v-3.5a16.5 16.5 0 0 1 33 0V32" stroke="url(#aacc_${id})" stroke-width="2.8" fill="none"/>
         <rect x="12.5" y="28.5" width="5" height="10" rx="2.5" fill="url(#aacc_${id})" stroke="#ffffff" stroke-opacity=".4" stroke-width=".8"/>
         <rect x="46.5" y="28.5" width="5" height="10" rx="2.5" fill="url(#aacc_${id})" stroke="#ffffff" stroke-opacity=".4" stroke-width=".8"/>`
    : isGirl
      ? `<circle cx="19.5" cy="34.5" r="1.8" fill="${accent}" stroke="#ffffff" stroke-width=".6"/><circle cx="44.5" cy="34.5" r="1.8" fill="${accent}" stroke="#ffffff" stroke-width=".6"/>`
      : `<path d="M24 46.5l8 5.5 8-5.5" stroke="#ffffff" stroke-opacity=".45" stroke-width="1.4" fill="none"/>`;
  const eyes = (style === 'boy_cyber' || style === 'girl_visor')
    ? `<circle cx="27" cy="31.4" r="1.7" fill="${accent}"/><circle cx="37" cy="31.4" r="1.7" fill="${accent}"/><circle cx="27.5" cy="30.9" r=".6" fill="#fff"/><circle cx="37.5" cy="30.9" r=".6" fill="#fff"/>`
    : `<ellipse cx="26.5" cy="31.8" rx="2" ry="2.2" fill="#0f172a"/><ellipse cx="37.5" cy="31.8" rx="2" ry="2.2" fill="#0f172a"/>
       <circle cx="27.2" cy="31" r=".85" fill="#fff"/><circle cx="38.2" cy="31" r=".85" fill="#fff"/>
       <circle cx="25.9" cy="32.6" r=".4" fill="${accent}" opacity=".8"/><circle cx="36.9" cy="32.6" r=".4" fill="${accent}" opacity=".8"/>`;
  const blush = isGirl
    ? `<ellipse cx="23.5" cy="35.2" rx="2.6" ry="1.3" fill="#fb7185" opacity=".32"/><ellipse cx="40.5" cy="35.2" rx="2.6" ry="1.3" fill="#fb7185" opacity=".32"/>`
    : '';
  const outfit = `
    <path d="M10 63c2.5-12 10-18.5 22-18.5s19.5 6.5 22 18.5z" fill="url(#aacc_${id})"/>
    <path d="M16 62c2-8.5 7.5-13.5 16-13.5s14 5 16 13.5" fill="none" stroke="#ffffff" stroke-opacity=".28" stroke-width="1.3"/>
    <path d="M25.5 45l6.5 6.5 6.5-6.5" fill="none" stroke="#ffffff" stroke-opacity=".68" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`;

  return `<svg class="av-svg" viewBox="0 0 64 64" fill="none" aria-hidden="true">
    <defs>
      <radialGradient id="ag_${id}" cx="30%" cy="22%" r="80%">
        <stop offset="0%" stop-color="${accent}" stop-opacity=".55"/>
        <stop offset="45%" stop-color="${bg1}"/>
        <stop offset="100%" stop-color="${bg2}"/>
      </radialGradient>
      <radialGradient id="ask_${id}" cx="38%" cy="30%" r="72%">
        <stop offset="0%" stop-color="#fff4ea" stop-opacity=".42"/>
        <stop offset="55%" stop-color="${skin}"/>
        <stop offset="100%" stop-color="#b4744c"/>
      </radialGradient>
      <linearGradient id="ah_${id}" x1="16" y1="12" x2="48" y2="48" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="${hairColor}"/>
        <stop offset="55%" stop-color="${hairColor}"/>
        <stop offset="100%" stop-color="#090d1a"/>
      </linearGradient>
      <linearGradient id="aacc_${id}" x1="12" y1="42" x2="52" y2="64" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="${accent}"/>
        <stop offset="100%" stop-color="${bg2}"/>
      </linearGradient>
      <linearGradient id="aglass_${id}" x1="20" y1="28" x2="44" y2="35" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#0f172a"/>
        <stop offset="50%" stop-color="#1e293b"/>
        <stop offset="100%" stop-color="#020617"/>
      </linearGradient>
      <linearGradient id="acrn_${id}" x1="21" y1="8" x2="43" y2="16" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#fef08a"/>
        <stop offset="55%" stop-color="#fbbf24"/>
        <stop offset="100%" stop-color="#d97706"/>
      </linearGradient>
    </defs>
    <circle cx="32" cy="32" r="32" fill="url(#ag_${id})"/>
    <ellipse cx="22" cy="14" rx="18" ry="10" fill="#ffffff" opacity=".12"/>
    ${hairBack}
    ${outfit}
    <rect x="27.8" y="39.5" width="8.4" height="8" rx="3.4" fill="${skin}"/>
    <path d="M28 42.5c2.2 1.2 5.8 1.2 8 0" stroke="#000" stroke-opacity=".18" stroke-width="2" fill="none"/>
    <circle cx="32" cy="31" r="12.8" fill="${skin}"/>
    <circle cx="32" cy="31" r="12.8" fill="url(#ask_${id})" opacity=".72"/>
    ${blush}
    ${hairTop}
    ${accessory}
    ${eyes}
    <path d="M28.6 37.3c2 1.7 4.8 1.7 6.8 0" stroke="#7c2d12" stroke-opacity=".75" stroke-width="1.6" stroke-linecap="round"/>
    <circle cx="32" cy="32" r="31" stroke="#ffffff" stroke-opacity=".22" stroke-width="1.5"/>
  </svg>`;
}

const DEFAULT_BOY_AVATARS = [
  { id: 'av_b1', name: 'Apex Ace', gender: 'boy', svg: makePortraitSvg('b1', '#1e3a8a', '#0f172a', '#38bdf8', '#1e293b', '#f2c5a0', 'boy_headset') },
  { id: 'av_b2', name: 'Cyber Striker', gender: 'boy', svg: makePortraitSvg('b2', '#312e81', '#0f172a', '#2dd4bf', '#0f172a', '#e8b48e', 'boy_cyber') },
  { id: 'av_b3', name: 'Shadow Rogue', gender: 'boy', svg: makePortraitSvg('b3', '#9a3412', '#1c1917', '#fbbf24', '#1c1917', '#dca680', 'boy_hood') },
  { id: 'av_b4', name: 'Royal Knight', gender: 'boy', svg: makePortraitSvg('b4', '#581c87', '#172554', '#ffd36b', '#3b2416', '#f4c8a2', 'boy_classic') },
  { id: 'av_b5', name: 'Volt Captain', gender: 'boy', svg: makePortraitSvg('b5', '#065f46', '#0f172a', '#34d399', '#1e293b', '#ce946c', 'boy_classic2') }
];

const DEFAULT_GIRL_AVATARS = [
  { id: 'av_g1', name: 'Nova Queen', gender: 'girl', svg: makePortraitSvg('g1', '#be185d', '#3b0764', '#f472b6', '#1e1b4b', '#f6ceb3', 'girl_crown') },
  { id: 'av_g2', name: 'Neon Valkyrie', gender: 'girl', svg: makePortraitSvg('g2', '#0e7490', '#0f172a', '#22d3ee', '#312e81', '#f3c5a0', 'girl_visor') },
  { id: 'av_g3', name: 'Aurora Star', gender: 'girl', svg: makePortraitSvg('g3', '#7c3aed', '#1e1b4b', '#c084fc', '#4c1d95', '#f8d7be', 'girl_classic') },
  { id: 'av_g4', name: 'Velvet Rose', gender: 'girl', svg: makePortraitSvg('g4', '#be123c', '#450a0a', '#fb7185', '#291711', '#ebb997', 'girl_classic2') },
  { id: 'av_g5', name: 'Solar Empress', gender: 'girl', svg: makePortraitSvg('g5', '#b45309', '#422006', '#ffd36b', '#3f1d0b', '#dda781', 'girl_crown') }
];

const DEFAULT_AVATAR_MAP = Object.fromEntries(
  [...DEFAULT_BOY_AVATARS, ...DEFAULT_GIRL_AVATARS].map(a => [a.id, a])
);

/* Clean free avatars: 5 sleek Boy + 5 sleek Girl presets (legacy emoji fallback still renders safely) */
const FX_FREE_AVATARS = [...DEFAULT_BOY_AVATARS.map(a => a.id), ...DEFAULT_GIRL_AVATARS.map(a => a.id)];

/* Exclusive Top 1-3 Leaderboard Avatars/Crests (NOT sold in Store, earned only from Leaderboard Top 1-3) */
const LB_EXCLUSIVE_AVATARS = {
  lb_av_top1: {
    id: 'lb_av_top1',
    rank: 1,
    name: 'Sovereign Crown Crest',
    svg: `<svg class="av-svg" viewBox="0 0 64 64" fill="none" aria-label="Top 1 Sovereign Crest">
      <defs>
        <radialGradient id="lb1bg" cx="35%" cy="25%" r="75%"><stop offset="0%" stop-color="#78350f"/><stop offset="100%" stop-color="#1c0d00"/></radialGradient>
        <linearGradient id="lb1g" x1="10" y1="12" x2="54" y2="52" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#fff9c4"/><stop offset="45%" stop-color="#ffd036"/><stop offset="100%" stop-color="#b45309"/></linearGradient>
      </defs>
      <circle cx="32" cy="32" r="30" fill="url(#lb1bg)" stroke="url(#lb1g)" stroke-width="3"/>
      <ellipse cx="26" cy="15" rx="14" ry="7" fill="#fff" opacity=".16"/>
      <path d="M14 42L10 21l12 9 10-15 10 15 12-9-4 21H14z" fill="url(#lb1g)" stroke="#5c2d00" stroke-width="1.8" stroke-linejoin="round"/>
      <rect x="14" y="44" width="36" height="5.5" rx="2.7" fill="url(#lb1g)"/>
      <circle cx="32" cy="31" r="3.6" fill="#ef4444" stroke="#fff" stroke-width="1"/>
    </svg>`
  },
  lb_av_top2: {
    id: 'lb_av_top2',
    rank: 2,
    name: 'Celestial Silver Crest',
    svg: `<svg class="av-svg" viewBox="0 0 64 64" fill="none" aria-label="Top 2 Silver Crest">
      <defs>
        <radialGradient id="lb2bg" cx="35%" cy="25%" r="75%"><stop offset="0%" stop-color="#1e3a5f"/><stop offset="100%" stop-color="#090f1d"/></radialGradient>
        <linearGradient id="lb2g" x1="12" y1="10" x2="52" y2="54" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#ffffff"/><stop offset="50%" stop-color="#bfdbfe"/><stop offset="100%" stop-color="#475569"/></linearGradient>
      </defs>
      <circle cx="32" cy="32" r="30" fill="url(#lb2bg)" stroke="url(#lb2g)" stroke-width="3"/>
      <ellipse cx="26" cy="15" rx="14" ry="7" fill="#fff" opacity=".15"/>
      <path d="M32 12l5.8 12.2 13.4 1.8-9.8 9.4 2.4 13.4L32 42.4 20.2 48.8l2.4-13.4-9.8-9.4 13.4-1.8L32 12z" fill="url(#lb2g)" stroke="#1e293b" stroke-width="1.8" stroke-linejoin="round"/>
      <circle cx="32" cy="32" r="4.2" fill="#38bdf8" stroke="#fff" stroke-width="1"/>
    </svg>`
  },
  lb_av_top3: {
    id: 'lb_av_top3',
    rank: 3,
    name: 'Ember Bronze Shield',
    svg: `<svg class="av-svg" viewBox="0 0 64 64" fill="none" aria-label="Top 3 Bronze Crest">
      <defs>
        <radialGradient id="lb3bg" cx="35%" cy="25%" r="75%"><stop offset="0%" stop-color="#5c210b"/><stop offset="100%" stop-color="#1a0902"/></radialGradient>
        <linearGradient id="lb3g" x1="12" y1="10" x2="52" y2="54" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#ffedd5"/><stop offset="50%" stop-color="#e3904f"/><stop offset="100%" stop-color="#7c2d12"/></linearGradient>
      </defs>
      <circle cx="32" cy="32" r="30" fill="url(#lb3bg)" stroke="url(#lb3g)" stroke-width="3"/>
      <path d="M32 12l17 7v13c0 11-7.4 18.6-17 22-9.6-3.4-17-11-17-22V19l17-7z" fill="url(#lb3g)" stroke="#431407" stroke-width="1.8" stroke-linejoin="round"/>
      <path d="M32 20l4 8.5 9 1.2-6.6 6.2 1.7 9L32 40.6l-8.1 4.3 1.7-9-6.6-6.2 9-1.2L32 20z" fill="#fff7ed"/>
    </svg>`
  }
};

function isCustomPhotoAvatar(val) {
  return typeof val === 'string' && (val.startsWith('data:image/') || val.startsWith('https://'));
}

let _avSvgSeq = 0;
function uniqueAvatarSvg(svg) {
  const sfx = '_' + (++_avSvgSeq);
  return svg
    .replace(/\bid="([^"]+)"/g, (_, id) => `id="${id}${sfx}"`)
    .replace(/url\(#([^)]+)\)/g, (_, id) => `url(#${id}${sfx})`);
}

function renderAvatarGlyph(avatarVal) {
  if (isCustomPhotoAvatar(avatarVal)) {
    const safeUrl = String(avatarVal).replace(/"/g, '&quot;');
    return `<img class="av-photo" src="${safeUrl}" alt="Player avatar" referrerpolicy="no-referrer">`;
  }
  if (avatarVal && LB_EXCLUSIVE_AVATARS[avatarVal]) {
    return uniqueAvatarSvg(LB_EXCLUSIVE_AVATARS[avatarVal].svg);
  }
  if (avatarVal && DEFAULT_AVATAR_MAP[avatarVal]) {
    return uniqueAvatarSvg(DEFAULT_AVATAR_MAP[avatarVal].svg);
  }
  if (!avatarVal || avatarVal === '🦊') {
    return uniqueAvatarSvg(DEFAULT_AVATAR_MAP.av_b1.svg);
  }
  const safe = String(avatarVal).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  return `<span>${safe}</span>`;
}

/* Store Cleanup: Zero paid/cluttered avatars in Store */
const AVATAR_CATS = [];
const AVATAR_ALL = [...DEFAULT_BOY_AVATARS, ...DEFAULT_GIRL_AVATARS];
const AVATAR_MAP = DEFAULT_AVATAR_MAP;
const avatarMeta = e => LB_EXCLUSIVE_AVATARS[e] || DEFAULT_AVATAR_MAP[e] || null;
const FX_AVATAR_STORE_ROWS = [];
const FX_AVATAR_PROFILE = [
  { id: 'boys', name: 'Boys', list: DEFAULT_BOY_AVATARS.map(a => a.id) },
  { id: 'girls', name: 'Girls', list: DEFAULT_GIRL_AVATARS.map(a => a.id) }
];
