"use strict";
/* ===== Study Game Social Arena: Charm Tiers, Activity Chests, VIP Entrance, Lucky Spin Wheel, Clans, Achievement Titles & Moderation/Reports ===== */

/* ===== 0. High-Detail 3D Glossy SVG Artwork Library (Icons, Chests, Badges, Bond Emblems) ===== */
const GLOSSY_SVG = {
  ranking: `<svg class="g3d-ico" viewBox="0 0 48 48" fill="none" aria-hidden="true">
    <defs>
      <linearGradient id="g3rA" x1="6" y1="4" x2="42" y2="44" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#fef08a"/><stop offset="50%" stop-color="#f59e0b"/><stop offset="100%" stop-color="#b45309"/></linearGradient>
      <radialGradient id="g3rB" cx="35%" cy="25%" r="70%"><stop offset="0%" stop-color="#fffbeb"/><stop offset="100%" stop-color="#f59e0b"/></radialGradient>
    </defs>
    <path d="M24 4l16 6.5v13c0 10.5-6.8 17.5-16 21-9.2-3.5-16-10.5-16-21v-13L24 4z" fill="url(#g3rA)" stroke="#fff7ed" stroke-width="1.6"/>
    <path d="M24 7l13 5.3v10.7c0 8.5-5.4 14.3-13 17.2-7.6-2.9-13-8.7-13-17.2V12.3L24 7z" fill="#78350f" fill-opacity=".35"/>
    <path d="M15 28l-2-10 6 4 5-7 5 7 6-4-2 10H15z" fill="url(#g3rB)" stroke="#92400e" stroke-width="1.2" stroke-linejoin="round"/>
    <rect x="16" y="30" width="16" height="3.2" rx="1.6" fill="#fef08a"/>
    <ellipse cx="19" cy="12" rx="8" ry="3.2" fill="#fff" opacity=".32"/>
  </svg>`,
  tasks: `<svg class="g3d-ico" viewBox="0 0 48 48" fill="none" aria-hidden="true">
    <defs>
      <linearGradient id="g3tA" x1="6" y1="4" x2="42" y2="44" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#6ee7b7"/><stop offset="52%" stop-color="#10b981"/><stop offset="100%" stop-color="#047857"/></linearGradient>
      <linearGradient id="g3tB" x1="12" y1="10" x2="36" y2="38" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#ffffff"/><stop offset="100%" stop-color="#d1fae5"/></linearGradient>
    </defs>
    <path d="M24 4l16 6.5v13c0 10.5-6.8 17.5-16 21-9.2-3.5-16-10.5-16-21v-13L24 4z" fill="url(#g3tA)" stroke="#ecfdf5" stroke-width="1.6"/>
    <rect x="15" y="13" width="18" height="22" rx="4" fill="url(#g3tB)" stroke="#065f46" stroke-width="1.2"/>
    <path d="M19.5 24l3.2 3.2 6.3-6.7" stroke="#059669" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M20 12h8" stroke="#fbbf24" stroke-width="3.2" stroke-linecap="round"/>
    <ellipse cx="19" cy="11" rx="8" ry="3" fill="#fff" opacity=".3"/>
  </svg>`,
  friends: `<svg class="g3d-ico" viewBox="0 0 48 48" fill="none" aria-hidden="true">
    <defs>
      <linearGradient id="g3fA" x1="6" y1="4" x2="42" y2="44" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#7dd3fc"/><stop offset="52%" stop-color="#3b82f6"/><stop offset="100%" stop-color="#1d4ed8"/></linearGradient>
    </defs>
    <path d="M24 4l16 6.5v13c0 10.5-6.8 17.5-16 21-9.2-3.5-16-10.5-16-21v-13L24 4z" fill="url(#g3fA)" stroke="#e0f2fe" stroke-width="1.6"/>
    <circle cx="20" cy="20" r="4.8" fill="#fff"/><path d="M13 32c1-4.5 3.6-6.8 7-6.8s6 2.3 7 6.8z" fill="#fff"/>
    <circle cx="30" cy="21.5" r="3.8" fill="#bae6fd"/><path d="M26 32c.8-3.4 2.5-5.2 5-5.2 2.4 0 4.2 1.8 5 5.2z" fill="#bae6fd"/>
    <ellipse cx="19" cy="11" rx="8" ry="3" fill="#fff" opacity=".3"/>
  </svg>`,
  events: `<svg class="g3d-ico" viewBox="0 0 48 48" fill="none" aria-hidden="true">
    <defs>
      <linearGradient id="g3eA" x1="6" y1="4" x2="42" y2="44" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#f9a8d4"/><stop offset="52%" stop-color="#ec4899"/><stop offset="100%" stop-color="#9d174d"/></linearGradient>
    </defs>
    <path d="M24 4l16 6.5v13c0 10.5-6.8 17.5-16 21-9.2-3.5-16-10.5-16-21v-13L24 4z" fill="url(#g3eA)" stroke="#fdf2f8" stroke-width="1.6"/>
    <circle cx="24" cy="24" r="10.5" fill="#fff" fill-opacity=".22" stroke="#fef08a" stroke-width="2.2"/>
    <path d="M24 14v10l7 4" stroke="#fef08a" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="24" cy="24" r="2.6" fill="#fff"/>
    <ellipse cx="19" cy="11" rx="8" ry="3" fill="#fff" opacity=".32"/>
  </svg>`,
  vip: `<svg class="g3d-ico" viewBox="0 0 48 48" fill="none" aria-hidden="true">
    <defs>
      <linearGradient id="g3vA" x1="6" y1="8" x2="42" y2="40" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#fef08a"/><stop offset="50%" stop-color="#f59e0b"/><stop offset="100%" stop-color="#ea580c"/></linearGradient>
    </defs>
    <polygon points="14,10 34,10 43,21 24,42 5,21" fill="url(#g3vA)" stroke="#fff7ed" stroke-width="1.6" stroke-linejoin="round"/>
    <polygon points="14,10 34,10 29,21 19,21" fill="#fff" fill-opacity=".45"/>
    <polygon points="19,21 29,21 24,42" fill="#fff" fill-opacity=".22"/>
    <path d="M5 21h38" stroke="#fff" stroke-opacity=".55" stroke-width="1.3"/>
  </svg>`,
  shop: `<svg class="g3d-ico" viewBox="0 0 48 48" fill="none" aria-hidden="true">
    <defs>
      <linearGradient id="g3sA" x1="8" y1="8" x2="40" y2="42" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#fda4af"/><stop offset="55%" stop-color="#f43f5e"/><stop offset="100%" stop-color="#be123c"/></linearGradient>
    </defs>
    <path d="M10 19h28l-2 20a3 3 0 0 1-3 3H15a3 3 0 0 1-3-3l-2-20z" fill="url(#g3sA)" stroke="#ffe4e6" stroke-width="1.5"/>
    <path d="M7 18c0-5 3-9 8-9h18c5 0 8 4 8 9a4.5 4.5 0 0 1-8.5 2 4.5 4.5 0 0 1-8.5 0 4.5 4.5 0 0 1-8.5 0A4.5 4.5 0 0 1 7 18z" fill="#fff1f2" stroke="#f43f5e" stroke-width="1.3"/>
    <rect x="19" y="29" width="10" height="13" rx="2.5" fill="#fff1f2" fill-opacity=".85"/>
  </svg>`,
  clans: `<svg class="g3d-ico" viewBox="0 0 48 48" fill="none" aria-hidden="true">
    <defs>
      <linearGradient id="g3cA" x1="8" y1="6" x2="40" y2="42" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#fdba74"/><stop offset="50%" stop-color="#f97316"/><stop offset="100%" stop-color="#c2410c"/></linearGradient>
    </defs>
    <rect x="8" y="8" width="32" height="32" rx="10" fill="url(#g3cA)" stroke="#ffedd5" stroke-width="1.6"/>
    <path d="M24 14l9 4v7c0 6-3.8 10-9 12-5.2-2-9-6-9-12v-7l9-4z" fill="#fff7ed" fill-opacity=".92"/>
    <polygon points="24,18 26.2,22.8 31.4,23.5 27.6,27 28.6,32 24,29.5 19.4,32 20.4,27 16.6,23.5 21.8,22.8" fill="#f97316"/>
  </svg>`,
  spin: `<svg class="g3d-ico" viewBox="0 0 48 48" fill="none" aria-hidden="true">
    <defs>
      <linearGradient id="g3spA" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#c084fc"/><stop offset="50%" stop-color="#6366f1"/><stop offset="100%" stop-color="#06b6d4"/></linearGradient>
    </defs>
    <circle cx="24" cy="24" r="19" fill="url(#g3spA)" stroke="#fef08a" stroke-width="2.4"/>
    <path d="M24 5v38M5 24h38M10.5 10.5l27 27M37.5 10.5l-27 27" stroke="#ffffff" stroke-opacity=".35" stroke-width="1.5"/>
    <circle cx="24" cy="24" r="6.5" fill="#fef08a" stroke="#b45309" stroke-width="1.6"/>
    <circle cx="24" cy="24" r="2.6" fill="#fff"/>
  </svg>`,
  chest(tier) {
    const uid = ++GLOSSY_SVG._seq;
    const pal = tier === 'mythic' ? ['#f0abfc', '#9333ea', '#581c87', '#fef08a']
      : tier === 'gold' ? ['#fef08a', '#f59e0b', '#92400e', '#fffbeb']
      : tier === 'silver' ? ['#f8fafc', '#94a3b8', '#475569', '#38bdf8']
      : ['#fed7aa', '#d97706', '#7c2d12', '#fde68a'];
    return `<svg class="g3d-chest" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="chT_${tier}_${uid}" x1="6" y1="8" x2="42" y2="42" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="${pal[0]}"/><stop offset="55%" stop-color="${pal[1]}"/><stop offset="100%" stop-color="${pal[2]}"/></linearGradient>
      </defs>
      <rect x="7" y="18" width="34" height="22" rx="5" fill="url(#chT_${tier}_${uid})" stroke="${pal[3]}" stroke-width="1.6"/>
      <path d="M6 21c0-7 4-11 18-11s18 4 18 11H6z" fill="${pal[0]}" stroke="${pal[3]}" stroke-width="1.6"/>
      <rect x="13" y="10" width="5" height="30" rx="1.5" fill="${pal[3]}" fill-opacity=".75"/>
      <rect x="30" y="10" width="5" height="30" rx="1.5" fill="${pal[3]}" fill-opacity=".75"/>
      <rect x="20" y="19" width="8" height="9" rx="2.5" fill="${pal[3]}" stroke="${pal[2]}" stroke-width="1.2"/>
      <circle cx="24" cy="23.5" r="1.6" fill="${pal[2]}"/>
      <ellipse cx="20" cy="14" rx="7" ry="2.2" fill="#fff" opacity=".45"/>
    </svg>`;
  },
  badge(kind) {
    const uid = ++GLOSSY_SVG._seq;
    const map = {
      gold_star: ['#fef08a', '#f59e0b', '#b45309', `<polygon points="18,9.5 20.4,15 26.2,15.6 21.8,19.4 23.1,25.2 18,22.2 12.9,25.2 14.2,19.4 9.8,15.6 15.6,15" fill="#fff"/>`],
      mic_pro: ['#fed7aa', '#fb923c', '#c2410c', `<rect x="15" y="10" width="6" height="9.5" rx="3" fill="#fff"/><path d="M12.5 17.5a5.5 5.5 0 0 0 11 0M18 23v3.2M15 26.2h6" stroke="#fff" stroke-width="2" stroke-linecap="round"/>`],
      crown_vip: ['#f5d0fe', '#c084fc', '#6b21a8', `<path d="M11 23l-1.5-8.5 4.8 3.5L18 11.5 21.7 18l4.8-3.5L25 23H11z" fill="#fff"/>`],
      heart_guard: ['#fecdd3', '#fb7185', '#be123c', `<path d="M18 25.2s-7-4.4-7-9.4c0-2.5 1.9-4.3 4.2-4.3 1.4 0 2.4.7 2.8 1.6.4-.9 1.4-1.6 2.8-1.6 2.3 0 4.2 1.8 4.2 4.3 0 5-7 9.4-7 9.4z" fill="#fff"/>`],
      shield_clan: ['#bae6fd', '#38bdf8', '#0369a1', `<polygon points="18,9.5 24,18 18,26.5 12,18" fill="#fff"/>`]
    };
    const p = map[kind] || map.gold_star;
    return `<svg class="g3d-badge" viewBox="0 0 36 36" fill="none" aria-hidden="true">
      <defs><linearGradient id="bg3_${kind}_${uid}" x1="4" y1="3" x2="32" y2="33" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="${p[0]}"/><stop offset="55%" stop-color="${p[1]}"/><stop offset="100%" stop-color="${p[2]}"/></linearGradient></defs>
      <polygon points="18,2 30,8.5 30,22.5 18,34 6,22.5 6,8.5" fill="url(#bg3_${kind}_${uid})" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/>
      <polygon points="18,5.5 27,10.5 27,21 18,30 9,21 9,10.5" fill="#fff" fill-opacity=".2"/>
      ${p[3]}
    </svg>`;
  },
  coupleRings: `<svg class="g3d-rings" viewBox="0 0 96 60" fill="none" aria-hidden="true">
    <defs>
      <linearGradient id="cpr1" x1="10" y1="6" x2="54" y2="52" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#ffffff"/><stop offset="28%" stop-color="#fef08a"/><stop offset="68%" stop-color="#f59e0b"/><stop offset="100%" stop-color="#b45309"/></linearGradient>
      <linearGradient id="cpr2" x1="40" y1="6" x2="86" y2="52" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#ffffff"/><stop offset="28%" stop-color="#fbcfe8"/><stop offset="68%" stop-color="#ec4899"/><stop offset="100%" stop-color="#9d174d"/></linearGradient>
      <linearGradient id="cprGem" x1="38" y1="3" x2="58" y2="25" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#ffffff"/><stop offset="45%" stop-color="#bae6fd"/><stop offset="100%" stop-color="#f472b6"/></linearGradient>
    </defs>
    <ellipse cx="48" cy="53" rx="34" ry="4.5" fill="rgba(0,0,0,0.42)"/>
    <circle cx="36" cy="33" r="16.5" stroke="rgba(0,0,0,0.38)" stroke-width="6.4" transform="translate(0,1.5)"/>
    <circle cx="60" cy="33" r="16.5" stroke="rgba(0,0,0,0.38)" stroke-width="6.4" transform="translate(0,1.5)"/>
    <circle cx="36" cy="32.5" r="16.5" stroke="url(#cpr1)" stroke-width="5.2"/>
    <circle cx="36" cy="32.5" r="16.5" stroke="#ffffff" stroke-opacity=".55" stroke-width="1.2" stroke-dasharray="18 40"/>
    <circle cx="60" cy="32.5" r="16.5" stroke="url(#cpr2)" stroke-width="5.2"/>
    <circle cx="60" cy="32.5" r="16.5" stroke="#ffffff" stroke-opacity=".55" stroke-width="1.2" stroke-dasharray="18 40"/>
    <polygon points="48,3.5 57.5,14 48,24.5 38.5,14" fill="url(#cprGem)" stroke="#ffffff" stroke-width="1.5" stroke-linejoin="round"/>
    <polygon points="48,3.5 53,14 48,24.5 43,14" fill="#ffffff" fill-opacity=".48"/>
    <polygon points="38.5,14 57.5,14 48,9.5" fill="#ffffff" fill-opacity=".62"/>
    <circle cx="24" cy="20" r="2.2" fill="#ffffff"/><circle cx="72" cy="20" r="2.2" fill="#fef08a"/>
  </svg>`,
  bondEmblem(type) {
    const uid = ++GLOSSY_SVG._seq;
    if (type === 'couple') {
      return `<svg class="g3d-bond" viewBox="0 0 56 56" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id="beCpV_${uid}" x1="10" y1="28" x2="46" y2="52" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#4a044e"/><stop offset="100%" stop-color="#170624"/></linearGradient>
          <linearGradient id="beCpR_${uid}" x1="12" y1="16" x2="44" y2="46" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#ffffff"/><stop offset="30%" stop-color="#fef08a"/><stop offset="68%" stop-color="#f472b6"/><stop offset="100%" stop-color="#be185d"/></linearGradient>
          <linearGradient id="beCpG_${uid}" x1="20" y1="5" x2="36" y2="24" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#ffffff"/><stop offset="45%" stop-color="#e0f2fe"/><stop offset="100%" stop-color="#f472b6"/></linearGradient>
        </defs>
        <path d="M10 34c0-3.5 5-6.5 18-6.5s18 3 18 6.5v8.5c0 3.8-7.5 6.5-18 6.5s-18-2.7-18-6.5V34z" fill="url(#beCpV_${uid})" stroke="#ffd36b" stroke-opacity=".55" stroke-width="1.2"/>
        <ellipse cx="28" cy="33" rx="11.5" ry="9.8" stroke="url(#beCpR_${uid})" stroke-width="4.2"/>
        <ellipse cx="28" cy="33" rx="11.5" ry="9.8" stroke="#ffffff" stroke-opacity=".55" stroke-width="1.1" stroke-dasharray="16 32"/>
        <polygon points="28,6 37,15.5 28,25 19,15.5" fill="url(#beCpG_${uid})" stroke="#ffffff" stroke-width="1.4" stroke-linejoin="round"/>
        <polygon points="28,6 33,15.5 28,25 23,15.5" fill="#ffffff" fill-opacity=".46"/>
        <path d="M28 2.5v3M16 10l3 2M40 10l-3 2" stroke="#fef08a" stroke-width="1.4" stroke-linecap="round"/>
      </svg>`;
    }
    if (type === 'bro') {
      return `<svg class="g3d-bond" viewBox="0 0 56 56" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id="beBr_${uid}" x1="8" y1="6" x2="48" y2="50" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#e0f2fe"/><stop offset="32%" stop-color="#38bdf8"/><stop offset="72%" stop-color="#1d4ed8"/><stop offset="100%" stop-color="#0f172a"/></linearGradient>
          <linearGradient id="beBrR_${uid}" x1="10" y1="6" x2="46" y2="50" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#ffffff"/><stop offset="45%" stop-color="#cbd5e1"/><stop offset="100%" stop-color="#475569"/></linearGradient>
        </defs>
        <path d="M28 6l19 7.5v14.5c0 11.6-7.8 19.2-19 22.8C16.8 47.2 9 39.6 9 28V13.5L28 6z" fill="url(#beBr_${uid})" stroke="url(#beBrR_${uid})" stroke-width="2.2" stroke-linejoin="round"/>
        <path d="M28 10.5l14.5 5.8v11.5c0 8.8-5.8 14.6-14.5 17.6-8.7-3-14.5-8.8-14.5-17.6V16.3L28 10.5z" fill="#0f172a" fill-opacity=".32" stroke="#bae6fd" stroke-opacity=".55" stroke-width="1"/>
        <polygon points="28,15.5 31.8,23.6 40.5,24.8 34.2,30.8 35.8,39.5 28,35.4 20.2,39.5 21.8,30.8 15.5,24.8 24.2,23.6" fill="#fef08a" stroke="#b45309" stroke-width="1.1" stroke-linejoin="round"/>
        <polygon points="28,18.5 30.2,24.5 28,30.5 25.8,24.5" fill="#ffffff" opacity=".72"/>
      </svg>`;
    }
    return `<svg class="g3d-bond" viewBox="0 0 56 56" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="beBf_${uid}" x1="8" y1="8" x2="48" y2="50" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#fdf4ff"/><stop offset="32%" stop-color="#e879f9"/><stop offset="72%" stop-color="#9333ea"/><stop offset="100%" stop-color="#3b0764"/></linearGradient>
        <linearGradient id="beBfG_${uid}" x1="16" y1="6" x2="40" y2="48" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#fef9c3"/><stop offset="50%" stop-color="#ffd36b"/><stop offset="100%" stop-color="#b45309"/></linearGradient>
      </defs>
      <path d="M19 14c1.8-6 16.2-6 18 0" stroke="url(#beBfG_${uid})" stroke-width="2.6" stroke-linecap="round"/>
      <path d="M28 48S10 37.5 10 24.5a9.4 9.4 0 0 1 18-3.4 9.4 9.4 0 0 1 18 3.4C46 37.5 28 48 28 48z" fill="url(#beBf_${uid})" stroke="url(#beBfG_${uid})" stroke-width="2.2"/>
      <polygon points="28,20 34.5,27.5 28,36.5 21.5,27.5" fill="#ffffff" stroke="#fde047" stroke-width="1.2"/>
      <polygon points="28,22.2 31.8,27.5 28,33.4 24.2,27.5" fill="#f472b6" fill-opacity=".8"/>
      <ellipse cx="19.5" cy="21" rx="4" ry="1.8" transform="rotate(-28 19.5 21)" fill="#ffffff" opacity=".68"/>
    </svg>`;
  },
  _seq: 0
};

/* ===== v13 Exclusive 1-to-1 Relationship Bonds Showcase (Couple Ring, Bro Tag, Bestie Tag) ===== */
function normalizeBondItem(b, idx) {
  const type = b?.type || 'bestie';
  const partnerUid = b?.partnerUid || b?.uid || '';
  const partnerName = b?.partnerName || b?.name || b?.nick || 'Partner';
  const rawAv = b?.partnerAvatar || b?.avatar || b?.av || (type === 'bro' ? 'av_b2' : 'av_g1');
  const partnerAvatar = /^(b|g)[1-5]$/.test(rawAv) ? `av_${rawAv}` : rawAv;
  const lvNum = Number(b?.level) || (type === 'couple' ? 3 : (type === 'bro' ? 2 : (idx === 0 ? 2 : 1)));
  const giftId = b?.giftId || (type === 'couple' ? 'g_ring_royal' : (type === 'bro' ? 'g_bond_bro' : 'g_bond_bestie'));
  return { type, partnerUid, partnerName, partnerAvatar, lvNum, giftId, since: Number(b?.since || Date.now()) };
}

function renderPendingBondRequestsBannerHtml(compact) {
  const reqs = typeof getPendingBondRequestsForMe === 'function' ? getPendingBondRequestsForMe() : [];
  if (!reqs.length) return '';
  return `
    <div class="bond-req-inbox ${compact ? 'compact' : ''}" data-bond-req-box>
      <div class="bond-req-head">
        <b>💌 Incoming Bond Requests</b>
        <span class="bond-req-cnt">${reqs.length} pending</span>
      </div>
      <div class="bond-req-list">
        ${reqs.map(p => {
          const meta = (typeof BOND_SLOT_META !== 'undefined' && BOND_SLOT_META[p.bondType]) || { label: 'Exclusive Bond', short: 'Bond', accent: '#f472b6' };
          const g = (typeof GIFT_BY_ID !== 'undefined' && GIFT_BY_ID[p.giftId]) || null;
          return `<div class="bond-req-card" data-req-id="${esc(p.id)}">
            <div class="bond-req-art">${g && typeof giftSvg === 'function' ? giftSvg(g, 46) : GLOSSY_SVG.bondEmblem(p.bondType)}</div>
            <div class="bond-req-info">
              <div class="bond-req-top">
                <b>${esc(p.fromName || 'Player')}</b>
                <span class="bond-req-tag" style="color:${meta.accent}">${esc(meta.label)}</span>
              </div>
              <small>Sent ${esc(g ? g.name : meta.label)} · Exclusive 1-to-1 invite</small>
            </div>
            <div class="bond-req-acts">
              <button type="button" class="btn gold sm" data-accept-bond="${esc(p.id)}" aria-label="Accept ${esc(meta.label)} from ${esc(p.fromName || 'Player')}">Accept</button>
              <button type="button" class="btn ghost sm" data-decline-bond="${esc(p.id)}" aria-label="Decline ${esc(meta.label)} from ${esc(p.fromName || 'Player')}">Decline</button>
            </div>
          </div>`;
        }).join('')}
      </div>
    </div>
  `;
}

function renderBondsGridHtml(userObj, isSelf) {
  const normList = typeof normalizeExclusiveUserBonds === 'function'
    ? normalizeExclusiveUserBonds(userObj?.bonds)
    : (Array.isArray(userObj?.bonds) ? userObj.bonds : []);
  const bySlot = {};
  normList.forEach((raw, idx) => {
    const item = normalizeBondItem(raw, idx);
    if (!bySlot[item.type]) bySlot[item.type] = item;
  });

  const slotConfigs = [
    { slot: 'couple', label: 'Couple Ring', cls: 'lv3', giftId: 'g_ring_royal' },
    { slot: 'bro', label: 'Bro Tag', cls: 'lv2', giftId: 'g_bond_bro' },
    { slot: 'bestie', label: 'Bestie Tag', cls: 'lv1', giftId: 'g_bond_bestie' }
  ];

  const activeCount = Object.keys(bySlot).length;
  const pendingReqs = isSelf && typeof getPendingBondRequestsForMe === 'function' ? getPendingBondRequestsForMe() : [];

  const cards = slotConfigs.map(cfg => {
    const b = bySlot[cfg.slot];
    if (b) {
      const days = Math.max(1, Math.floor((Date.now() - Number(b.since || Date.now())) / 86400000) + 1);
      const giftObj = typeof GIFT_BY_ID !== 'undefined' ? GIFT_BY_ID[b.giftId] : null;
      const isLux10k = giftObj && typeof isLuxuryAnimatedGift === 'function' && isLuxuryAnimatedGift(giftObj);
      return `<div class="wp-bond-card ${cfg.cls} exclusive-active ${isLux10k ? 'lux-10k-card lux-10k-wall' : ''}" data-bond-slot="${cfg.slot}">
        ${isLux10k && typeof renderLuxury10kFxHtml === 'function' ? renderLuxury10kFxHtml(giftObj, true) : ''}
        <div class="wp-bond-toprow">
          <span class="wp-bond-lv">${esc(cfg.label)}</span>
          <span class="wp-bond-days">${days}d</span>
        </div>
        <button type="button" class="wp-bond-mainbtn" data-open-bonds="${esc(userObj.uid || '')}" aria-label="View ${esc(cfg.label)} with ${esc(b.partnerName)}">
          <div class="wp-bond-art">${GLOSSY_SVG.bondEmblem(cfg.slot)}</div>
          <div class="wp-bond-av">${av({ avatar: b.partnerAvatar, frame: 'none' }, 34)}</div>
          <b class="wp-bond-name">${esc(b.partnerName)}</b>
          <small class="wp-bond-exc">1-to-1 Active</small>
        </button>
        ${isSelf ? `<button type="button" class="wp-bond-unbind" data-unbind-slot="${cfg.slot}" aria-label="Unbind ${esc(cfg.label)}">Unbind</button>` : ''}
      </div>`;
    }
    return `<button type="button" class="wp-bond-card empty-slot exclusive-open" data-unlock-bond="${esc(userObj.uid || '')}" data-bond-gift="${cfg.giftId}" data-bond-slot="${cfg.slot}" aria-label="Send ${esc(cfg.label)} Request">
      <span class="wp-bond-lv muted">${esc(cfg.label)}</span>
      <div class="wp-bond-art ghost-art">${GLOSSY_SVG.bondEmblem(cfg.slot)}</div>
      <span class="wp-bond-plus">+</span>
      <small>${isSelf ? 'Send Request' : 'Open Slot'}</small>
    </button>`;
  }).join('');

  return `
    <div class="wp-section-card wp-bff-card v13-bonds-card">
      <div class="wp-sec-head" data-open-bonds="${esc(userObj.uid || '')}">
        <div class="row" style="gap:6px">
          <b>Exclusive Bonds</b>
          <span class="wp-heart-cnt">♥ ${activeCount}/3</span>
          ${pendingReqs.length ? `<span class="bond-req-pill">${pendingReqs.length} Request${pendingReqs.length > 1 ? 's' : ''}</span>` : ''}
        </div>
        <span class="wp-chev">›</span>
      </div>
      <div class="wp-bond-grid">${cards}</div>
      ${isSelf ? renderPendingBondRequestsBannerHtml(false) : ''}
    </div>
  `;
}

function openBondsShowcaseModal(targetUser) {
  const u = targetUser || me;
  const isSelf = u.uid === uid;
  const normList = typeof normalizeExclusiveUserBonds === 'function'
    ? normalizeExclusiveUserBonds(u.bonds)
    : (Array.isArray(u.bonds) ? u.bonds : []);
  const bonds = normList.map((raw, i) => normalizeBondItem(raw, i));
  const cp = bonds.find(b => b.type === 'couple') || null;
  const daysTogether = cp ? Math.max(1, Math.floor((Date.now() - Number(cp.since || Date.now())) / 86400000) + 1) : 0;
  const partnerUser = cp ? { uid: cp.partnerUid, name: cp.partnerName, avatar: cp.partnerAvatar, frame: 'fx_gold' } : null;

  const slotConfigs = [
    { slot: 'couple', label: 'Couple Ring', cls: 'lv3', giftId: 'g_ring_royal' },
    { slot: 'bro', label: 'Bro Tag', cls: 'lv2', giftId: 'g_bond_bro' },
    { slot: 'bestie', label: 'Bestie Tag', cls: 'lv1', giftId: 'g_bond_bestie' }
  ];

  const bondCards = slotConfigs.map(cfg => {
    const b = bonds.find(x => x.type === cfg.slot);
    if (b) {
      const days = Math.max(1, Math.floor((Date.now() - Number(b.since || Date.now())) / 86400000) + 1);
      return `<div class="wp-bond-card ${cfg.cls} exclusive-active">
        <div class="wp-bond-toprow"><span class="wp-bond-lv">${esc(cfg.label)}</span><span class="wp-bond-days">${days}d</span></div>
        <button type="button" class="wp-bond-mainbtn" data-bp-uid="${esc(b.partnerUid)}">
          <div class="wp-bond-art">${GLOSSY_SVG.bondEmblem(cfg.slot)}</div>
          <div class="wp-bond-av">${av({ avatar: b.partnerAvatar, frame: 'none' }, 36)}</div>
          <b class="wp-bond-name">${esc(b.partnerName)}</b>
          <small class="wp-bond-sub">Exclusive 1-to-1</small>
        </button>
        ${isSelf ? `<button type="button" class="wp-bond-unbind" data-modal-unbind="${cfg.slot}">Unbind</button>` : ''}
      </div>`;
    }
    return `<button type="button" class="wp-bond-card empty-slot" data-modal-send-slot="${cfg.giftId}">
      <span class="wp-bond-lv muted">${esc(cfg.label)}</span>
      <div class="wp-bond-art ghost-art">${GLOSSY_SVG.bondEmblem(cfg.slot)}</div>
      <span class="wp-bond-plus">+</span>
      <small>Send Request</small>
    </button>`;
  }).join('');

  const m = modal('Exclusive 1-to-1 Bonds', `
    <div class="wp-cp-banner">
      <div class="wp-cp-ribbon">${cp ? 'EXCLUSIVE COUPLE' : 'COUPLE RING SLOT'}</div>
      <div class="wp-cp-duo">
        <div class="wp-cp-person">
          ${av(u, 60)}
          <b>${esc(u.name || 'Player')}</b>
        </div>
        <div class="wp-cp-mid">
          ${GLOSSY_SVG.coupleRings}
          <span class="wp-cp-days">${cp ? `Together ${daysTogether}d` : '1-to-1 Exclusive'}</span>
        </div>
        <div class="wp-cp-person">
          ${partnerUser ? av(partnerUser, 60) : `<div class="wp-cp-empty-av">+</div>`}
          <b>${esc(partnerUser ? partnerUser.name : 'Open Slot')}</b>
        </div>
      </div>
    </div>

    <div class="wp-bond-grid" style="margin-top:12px">
      ${bondCards}
    </div>
    ${isSelf ? renderPendingBondRequestsBannerHtml(false) : ''}
  `, 'wp-bff-sheet');

  $$('[data-bp-uid]', m).forEach(btn => {
    btn.onclick = () => {
      if (btn.dataset.bpUid) { m.close(); openPublicProfile(btn.dataset.bpUid); }
    };
  });
  $$('[data-modal-send-slot]', m).forEach(btn => {
    btn.onclick = () => {
      m.close();
      if (typeof openGiftSendModal === 'function') {
        openGiftSendModal(isSelf ? null : u.uid, { allowPickPlayer: isSelf, preselectFilter: 'rings', preselectGiftId: btn.dataset.modalSendSlot });
      }
    };
  });
  $$('[data-modal-unbind]', m).forEach(btn => {
    btn.onclick = e => {
      e.stopPropagation();
      const slot = btn.dataset.modalUnbind;
      if (typeof unbindMyBondSlot === 'function') {
        unbindMyBondSlot(slot);
        m.close();
        openBondsShowcaseModal(me);
      }
    };
  });
  $$('[data-accept-bond]', m).forEach(btn => {
    btn.onclick = e => {
      e.stopPropagation();
      if (typeof acceptPendingBondProposal === 'function') {
        acceptPendingBondProposal(btn.dataset.acceptBond);
        m.close();
        openBondsShowcaseModal(me);
      }
    };
  });
  $$('[data-decline-bond]', m).forEach(btn => {
    btn.onclick = e => {
      e.stopPropagation();
      if (typeof declinePendingBondProposal === 'function') {
        declinePendingBondProposal(btn.dataset.declineBond);
        m.close();
        openBondsShowcaseModal(me);
      }
    };
  });
}

/* ===== 1. Charm Milestone Badges & Rank Progression ===== */
const CHARM_TIERS = [
  { min: 0, icon: '★', label: 'Star I', color: '#38bdf8' },
  { min: 100, icon: '★★', label: 'Star II', color: '#60a5fa' },
  { min: 500, icon: '★★★', label: 'Star III', color: '#2dd4bf' },
  { min: 1500, icon: '💎', label: 'Diamond I', color: '#818cf8' },
  { min: 5000, icon: '💎💎', label: 'Diamond II', color: '#c084fc' },
  { min: 15000, icon: '💎💎💎', label: 'Diamond III', color: '#f472b6' },
  { min: 50000, icon: '👑', label: 'Royal Crown', color: '#f59e0b' },
  { min: 150000, icon: '👑✨', label: 'Sovereign', color: '#ffd36b' }
];

function getCharmTierInfo(charmVal) {
  const c = Math.max(0, Number(charmVal || 0));
  let curIdx = 0;
  for (let i = 0; i < CHARM_TIERS.length; i++) {
    if (c >= CHARM_TIERS[i].min) curIdx = i;
  }
  const cur = CHARM_TIERS[curIdx];
  const next = CHARM_TIERS[curIdx + 1] || null;
  const pct = next ? Math.min(100, Math.round(((c - cur.min) / Math.max(1, next.min - cur.min)) * 100)) : 100;
  return { ...cur, next, pct, charm: c };
}

function renderCharmProgressHtml(charmVal) {
  const t = getCharmTierInfo(charmVal);
  return `
    <div class="charm-tier-card">
      <div class="row" style="justify-content:space-between;gap:8px">
        <span style="font-weight:800;font-size:12.5px;color:${t.color}">${t.icon} ${esc(t.label)}</span>
        <small style="color:var(--mu);font-weight:700">${t.next ? `${fmtNum(t.charm)} / ${fmtNum(t.next.min)}` : 'MAX'}</small>
      </div>
      <div class="gw-prog" style="margin-top:6px"><i style="width:${t.pct}%;background:${t.color}"></i></div>
    </div>
  `;
}

/* ===== 2. Achievement Titles ===== */
const ACHIEVEMENT_TITLES = [
  { id: 'MVP', name: 'Arena MVP', desc: '3+ Matches', check: () => (stats.games_played || 0) >= 3 },
  { id: 'Generous King', name: 'Generous King', desc: '100+ Sent Charm', check: () => (me.charmSent || 0) >= 100 },
  { id: 'Room Host', name: 'Room Host', desc: 'Host 1+ Room', check: () => (stats.rooms_hosted || 0) >= 1 },
  { id: 'Heartbreaker', name: 'Heartbreaker', desc: '500+ Charm', check: () => (me.charm || 0) >= 500 || (me.bonds || []).some(b => b.type === 'couple') },
  { id: 'Undercover Master', name: 'Spy Master', desc: 'Win Undercover', check: () => (stats.undercover_win || 0) >= 1 },
  { id: 'Pool Shark', name: 'Pool Shark', desc: 'Win 8-Ball Pool', check: () => (stats.pool_win || 0) >= 1 }
];

function evaluateAchievementTitles() {
  const unlocked = new Set(Array.isArray(me.unlockedTitles) ? me.unlockedTitles : []);
  let changed = false;
  ACHIEVEMENT_TITLES.forEach(t => {
    if (!unlocked.has(t.id) && t.check()) {
      unlocked.add(t.id);
      changed = true;
    }
  });
  if (changed) {
    me.unlockedTitles = [...unlocked];
    saveMe();
    dbOp(() => F.setDoc(userRef(uid), { unlockedTitles: me.unlockedTitles }, { merge: true }));
  }
  return me.unlockedTitles || [];
}

/* ===== 3. Online Activity Treasure Chests (Bronze / Silver / Gold / Mythic) ===== */
const ACTIVITY_CHESTS = [
  { id: 'ch_bronze', tier: 'bronze', name: 'Bronze', needSec: 60, coins: 40, exp: 20, color: '#fb923c', icon: '🧰' },
  { id: 'ch_silver', tier: 'silver', name: 'Silver', needSec: 240, coins: 90, exp: 35, color: '#cbd5e1', icon: '🎁' },
  { id: 'ch_gold', tier: 'gold', name: 'Gold', needSec: 480, coins: 180, exp: 60, color: '#ffd36b', icon: '👑' },
  { id: 'ch_mythic', tier: 'mythic', name: 'Mythic', needSec: 900, coins: 350, exp: 100, ticket: 1, color: '#c084fc', icon: '💎' }
];

function getTodayClaimedChests() {
  const d = today();
  return (me.claimedChestsDay && Array.isArray(me.claimedChestsDay[d])) ? me.claimedChestsDay[d] : [];
}

function renderActivityChestsStrip() {
  const sec = Number(me.activitySec || 0);
  const claimed = getTodayClaimedChests();
  return `
    <div class="chest-strip">
      ${ACTIVITY_CHESTS.map(ch => {
        const done = claimed.includes(ch.id);
        const ready = !done && sec >= ch.needSec;
        const remMin = Math.max(1, Math.ceil((ch.needSec - sec) / 60));
        return `<button type="button" class="chest-pill ${ready ? 'ready' : ''} ${done ? 'done' : ''}" data-open-chest="${ch.id}" style="border-color:${ready ? ch.color : ''}">
          <span class="chest-ico">${GLOSSY_SVG.chest(ch.tier)}</span>
          <b>+${ch.coins}</b>
          <small>${done ? '✓' : (ready ? 'OPEN' : `${remMin}m`)}</small>
        </button>`;
      }).join('')}
    </div>
  `;
}

function claimActivityChest(chestId) {
  const ch = ACTIVITY_CHESTS.find(x => x.id === chestId);
  if (!ch) return;
  const d = today();
  const claimed = getTodayClaimedChests();
  if (claimed.includes(ch.id)) return toast('Already opened today!');
  if (Number(me.activitySec || 0) < ch.needSec) {
    const left = formatCountdownMs((ch.needSec - Number(me.activitySec || 0)) * 1000);
    return toast(`Stay active ${left} more to unlock ${ch.name}!`);
  }
  me.claimedChestsDay = me.claimedChestsDay || {};
  me.claimedChestsDay[d] = [...claimed, ch.id];
  if (ch.ticket) me.spinTickets = clampSafeInt((me.spinTickets || 0) + ch.ticket, 0, 9999);
  saveMe();
  const capRes = typeof grantCappedFreeCoins === 'function'
    ? grantCappedFreeCoins(ch.coins, ch.exp, null, false, { silentSfx: true })
    : (addReward(ch.coins, ch.exp, null, false, { silentSfx: true }), { granted: ch.coins, capped: false });
  if (typeof playSfx === 'function') playSfx('chestOpen');
  if (typeof renderHomeHub === 'function') renderHomeHub();
  toast(capRes.granted > 0
    ? `${ch.icon} ${ch.name} Opened! +${capRes.granted} 🪙 & +${ch.exp} EXP${ch.ticket ? ' + 1 Spin Ticket!' : ''}`
    : `${ch.icon} ${ch.name} Opened! +${ch.exp} EXP (Daily free coin cap reached)`);
}

function openMysteryBoxReward(isPaidSpin = false) {
  const r = Math.random();
  let msg = '';
  if (r < 0.45) {
    const c = 120 + Math.floor(Math.random() * 200);
    if (isPaidSpin) {
      addReward(c, 35, null, true, { silentSfx: true });
      msg = `+${fmtNum(c)} Gold Coins & +35 EXP!`;
    } else {
      const capRes = typeof grantCappedFreeCoins === 'function' ? grantCappedFreeCoins(c, 35, null, true, { silentSfx: true }) : { granted: c };
      msg = capRes.granted > 0 ? `+${fmtNum(capRes.granted)} Gold Coins & +35 EXP!` : `+35 EXP (Daily free coin cap reached)`;
    }
  } else if (r < 0.72) {
    const frames = ['fx_gold', 'fx_phoenix', 'fx_galaxy', 'fx_aurora'];
    const fr = frames[Math.floor(Math.random() * frames.length)];
    me.tempUnlocks['frame:' + fr] = Math.max(Date.now(), Number(me.tempUnlocks['frame:' + fr] || 0)) + 3 * 86400000;
    me.frame = fr;
    saveMe();
    patchUser(uid, { ...base(), tempUnlocks: me.tempUnlocks });
    dbOp(() => F.setDoc(userRef(uid), { ...base(), tempUnlocks: me.tempUnlocks }, { merge: true }));
    msg = `Luxury 3-Day Avatar Frame Unlocked & Equipped!`;
  } else if (r < 0.9) {
    me.vipTier = me.vipTier || 'silver';
    me.vipUntil = Math.max(Date.now(), Number(me.vipUntil || 0)) + 2 * 86400000;
    saveMe();
    patchUser(uid, { vipTier: me.vipTier, vipUntil: me.vipUntil });
    dbOp(() => F.setDoc(userRef(uid), { vipTier: me.vipTier, vipUntil: me.vipUntil }, { merge: true }));
    msg = `👑 2-Day Silver VIP Trial Activated!`;
  } else {
    if (isPaidSpin) {
      addReward(1000, 80, null, true, { silentSfx: true });
      msg = `💎 JACKPOT! +1,000 Gold Coins & +80 EXP!`;
    } else {
      const capRes = typeof grantCappedFreeCoins === 'function' ? grantCappedFreeCoins(120, 80, null, true, { silentSfx: true }) : { granted: 120 };
      msg = capRes.granted > 0 ? `💎 JACKPOT! +${fmtNum(capRes.granted)} Gold Coins & +80 EXP!` : `+80 EXP (Daily free coin cap reached)`;
    }
  }
  if (typeof playSfx === 'function') playSfx('wheelWin');
  const m = modal('Royal Mystery Box Opened!', `
    <div style="text-align:center;padding:10px 4px">
      <div style="font-size:48px;line-height:1">🎁</div>
      <h4 style="margin:10px 0 6px;color:var(--gold)">${esc(msg)}</h4>
      <button type="button" class="btn gold full" id="mbOk" style="margin-top:12px">Collect</button>
    </div>
  `);
  $('#mbOk', m).onclick = () => m.close();
}

/* ===== 4. VIP & Entry Effect Banner ===== */
function showVipEntranceBanner(userObj, locationLabel) {
  const u = userObj || me;
  const vip = getActiveVipTier(u);
  const fx = u.entryEffect || (vip === 'royal' ? 'entry-dragon' : (vip === 'gold' ? 'entry-gold' : (vip === 'silver' ? 'entry-cyber' : '')));
  if (!vip && !fx) return;
  $$('.vip-entrance-banner').forEach(el => el.remove());
  const el = document.createElement('div');
  el.className = `vip-entrance-banner ${fx || 'entry-gold'}`;
  const badge = vip ? (vip === 'royal' ? '👑 ROYAL VIP' : (vip === 'gold' ? '✨ GOLD VIP' : '⚡ SILVER VIP')) : '✨ LUXURY ENTRY';
  el.innerHTML = `
    <div class="veb-av">${av(u, 42)}</div>
    <div class="veb-copy">
      <small>${badge} · ${esc(locationLabel || 'Social Arena')}</small>
      <b>${styledName(u)} has arrived!</b>
    </div>
  `;
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add('in'));
  if (typeof playSfx === 'function') playSfx('vipEntrance');
  setTimeout(() => {
    el.classList.remove('in');
    setTimeout(() => el.remove(), 340);
  }, 3200);
}

/* ===== 5. Lucky Spin Wheel Modal ===== */
const WHEEL_PRIZES = [
  { label: '+100 🪙', kind: 'coins', val: 100, color: '#1e3a8a' },
  { label: '+250 🪙', kind: 'coins', val: 250, color: '#6d28d9' },
  { label: '3D Frame', kind: 'frame', val: 'fx_aurora', color: '#0f766e' },
  { label: '+50 🪙', kind: 'coins', val: 50, color: '#334155' },
  { label: '1,000 🪙', kind: 'coins', val: 1000, color: '#b45309' },
  { label: 'VIP 1D', kind: 'vip', val: 'silver', color: '#9d174d' },
  { label: 'Mystery 🎁', kind: 'mystery', val: 1, color: '#4338ca' },
  { label: '+500 🪙', kind: 'coins', val: 500, color: '#0369a1' }
];

function openLuckySpinModal() {
  let spinning = false;
  let curRot = 0;

  const slicesSvg = WHEEL_PRIZES.map((p, i) => {
    const a1 = (i * 45 - 90) * Math.PI / 180;
    const a2 = ((i + 1) * 45 - 90) * Math.PI / 180;
    const x1 = 120 + 110 * Math.cos(a1), y1 = 120 + 110 * Math.sin(a1);
    const x2 = 120 + 110 * Math.cos(a2), y2 = 120 + 110 * Math.sin(a2);
    const mid = ((i + 0.5) * 45);
    return `<g>
      <path d="M120 120 L${x1.toFixed(1)} ${y1.toFixed(1)} A110 110 0 0 1 ${x2.toFixed(1)} ${y2.toFixed(1)} Z" fill="${p.color}" stroke="#ffd36b" stroke-width="1.5"/>
      <text x="120" y="34" fill="#fff" font-size="11" font-weight="800" text-anchor="middle" transform="rotate(${mid} 120 120)">${esc(p.label)}</text>
    </g>`;
  }).join('');

  const m = modal('🎡 Lucky Spin Wheel', `
    <div class="wheel-wrap">
      <div class="wheel-pointer" aria-hidden="true">▼</div>
      <div class="wheel-disc" id="wheelDisc">
        <svg viewBox="0 0 240 240" width="240" height="240">
          <circle cx="120" cy="120" r="115" fill="#0b1222" stroke="#ffd36b" stroke-width="4"/>
          ${slicesSvg}
          <circle cx="120" cy="120" r="24" fill="#0f172a" stroke="#ffd36b" stroke-width="3"/>
          <text x="120" y="124" fill="#ffd36b" font-size="11" font-weight="900" text-anchor="middle">SPIN</text>
        </svg>
      </div>
      <div class="wheel-status" id="wheelStatus">1 Free Daily Spin · Tickets: <b id="wtCnt">${fmtNum(me.spinTickets || 0)}</b></div>
      <div class="row wrap" style="gap:8px;width:100%;margin-top:8px">
        <button type="button" class="btn gold" id="spinFreeBtn" style="flex:1">Free / Ticket Spin</button>
        <button type="button" class="btn" id="spinCoinBtn" style="flex:1">Spin · 150 🪙</button>
        <button type="button" class="btn ghost full" id="spinAdBtn">Watch Ad for Free Spin</button>
      </div>
    </div>
  `, 'wheel-sheet');

  const syncSpinUI = () => {
    const freeLeft = me.spinFreeDay !== today();
    const tix = Number(me.spinTickets || 0);
    $('#wtCnt', m).textContent = fmtNum(tix);
    const fb = $('#spinFreeBtn', m);
    fb.textContent = freeLeft ? 'FREE Daily Spin!' : (tix > 0 ? `Use Ticket (${tix})` : 'No Free Spin');
    fb.disabled = spinning || (!freeLeft && tix <= 0);
    $('#spinCoinBtn', m).disabled = spinning || me.coins < 150;
    $('#spinAdBtn', m).disabled = spinning;
  };
  syncSpinUI();

  const doSpin = (mode) => {
    if (spinning) return;
    if (mode === 'free') {
      if (me.spinFreeDay !== today()) me.spinFreeDay = today();
      else if ((me.spinTickets || 0) > 0) me.spinTickets -= 1;
      else return toast('No free spin or tickets left');
    } else if (mode === 'coin') {
      if (me.coins < 150) return toast('Need 150 coins');
      me.coins = clampCoins(me.coins - 150);
    }
    saveMe(); updateHud();
    spinning = true;
    syncSpinUI();

    const winIdx = Math.floor(Math.random() * WHEEL_PRIZES.length);
    const sliceCenter = winIdx * 45 + 22.5;
    const targetDeg = 360 - sliceCenter;
    curRot = curRot + 1440 + ((targetDeg - (curRot % 360) + 360) % 360);
    $('#wheelDisc', m).style.transform = `rotate(${curRot}deg)`;

    let ticks = 0;
    const tickIv = setInterval(() => {
      ticks++;
      if (typeof playSfx === 'function') playSfx('wheelTick');
      if (ticks >= 14) clearInterval(tickIv);
    }, 180);

    setTimeout(() => {
      clearInterval(tickIv);
      const prize = WHEEL_PRIZES[winIdx];
      bumpStat('wheel_spin');
      if (prize.kind === 'coins') {
        if (mode === 'coin') {
          addReward(prize.val, 25, null, false, { silentSfx: true });
        } else if (typeof grantCappedFreeCoins === 'function') {
          const cr = grantCappedFreeCoins(prize.val, 25, null, false, { silentSfx: true });
          if (cr.capped) toast(`Free spin capped at +${cr.granted} 🪙 (Daily free cap ${cr.cap} 🪙)`);
        } else {
          addReward(prize.val, 25, null, false, { silentSfx: true });
        }
      } else if (prize.kind === 'frame') {
        me.tempUnlocks['frame:' + prize.val] = Math.max(Date.now(), Number(me.tempUnlocks['frame:' + prize.val] || 0)) + 3 * 86400000;
        me.frame = prize.val;
        saveMe();
        patchUser(uid, { ...base(), tempUnlocks: me.tempUnlocks });
        dbOp(() => F.setDoc(userRef(uid), { ...base(), tempUnlocks: me.tempUnlocks }, { merge: true }));
      } else if (prize.kind === 'vip') {
        me.vipTier = me.vipTier || 'silver';
        me.vipUntil = Math.max(Date.now(), Number(me.vipUntil || 0)) + 86400000;
        saveMe();
        patchUser(uid, { vipTier: me.vipTier, vipUntil: me.vipUntil });
        dbOp(() => F.setDoc(userRef(uid), { vipTier: me.vipTier, vipUntil: me.vipUntil }, { merge: true }));
      } else if (prize.kind === 'mystery') {
        openMysteryBoxReward(mode === 'coin');
      }
      if (typeof playSfx === 'function') playSfx('wheelWin');
      $('#wheelStatus', m).innerHTML = `<b style="color:var(--gold)">🎉 You Won: ${esc(prize.label)}!</b>`;
      toast('Lucky Wheel Won: ' + prize.label);
      spinning = false;
      syncSpinUI();
    }, 3300);
  };

  $('#spinFreeBtn', m).onclick = () => doSpin('free');
  $('#spinCoinBtn', m).onclick = () => doSpin('coin');
  $('#spinAdBtn', m).onclick = () => openRewardAd(() => doSpin('ad'));
}

/* ===== 6. Clans / Gaming Squads & Weekly Clan Wars ===== */
let clansList = ls.get('sg_clans_cache', []);
if (!Array.isArray(clansList)) clansList = [];
const CLAN_EMBLEMS = ['🐉', '⚔️', '👑', '⚡', '🔥', '🛡️', '🦅', '💎'];

function ingestClans(list) {
  if (!Array.isArray(list)) return;
  clansList = list.sort((a, b) => Number(b.weeklyGlory || 0) - Number(a.weeklyGlory || 0));
  ls.set('sg_clans_cache', clansList);
  if (typeof renderRanking === 'function') renderRanking();
}

function addClanGlory(pts) {
  const n = clampSafeInt(pts, 0, 500000);
  if (!n || !me.clanId) return;
  const c = clansList.find(x => x.id === me.clanId);
  if (!c) return;
  c.weeklyGlory = clampSafeInt(Number(c.weeklyGlory || 0) + n, 0, MAX_COINS);
  c.updatedAt = Date.now();
  ls.set('sg_clans_cache', clansList);
  dbOp(() => F.setDoc(F.doc(db, 'clans', c.id), { weeklyGlory: c.weeklyGlory, updatedAt: c.updatedAt }, { merge: true }));
}

function renderClanLeaderboardHtml() {
  const sorted = [...clansList].sort((a, b) => Number(b.weeklyGlory || 0) - Number(a.weeklyGlory || 0));
  if (!sorted.length) {
    return `<div class="empty">No Clans yet! Create your Gaming Squad to dominate Weekly Clan Wars.</div>`;
  }
  return sorted.map((c, idx) => {
    const isMine = me.clanId === c.id;
    const membersCnt = Array.isArray(c.members) ? c.members.length : 1;
    return `<div class="card row clan-row ${isMine ? 'mine' : ''}">
      <div class="rk">${idx < 3 ? ['🥇', '🥈', '🥉'][idx] : idx + 1}</div>
      <div class="clan-emblem">${esc(c.emblem || '⚔️')}</div>
      <div class="mid">
        <b><span class="clan-tag-pill">[${esc(c.tag || 'CLAN')}]</span> ${esc(c.name || 'Squad')}</b>
        <small>${membersCnt} Members · Leader: ${esc(c.leaderName || 'Player')}</small>
      </div>
      <div style="text-align:right">
        <div class="chip">⚔️ ${fmtNum(c.weeklyGlory || 0)}</div>
        ${!isMine ? `<button type="button" class="btn ghost sm" style="margin-top:4px" data-join-clan="${esc(c.id)}">Join</button>` : `<span class="p-tag tag-fx-emerald" style="font-size:10px;margin-top:4px">Joined</span>`}
        ${devMode ? `<button type="button" class="btn red sm" style="margin-top:4px;margin-left:4px" data-del-clan="${esc(c.id)}">✕</button>` : ''}
      </div>
    </div>`;
  }).join('');
}

function joinClanById(clanId) {
  if (needLogin('Clans')) return;
  const c = clansList.find(x => x.id === clanId);
  if (!c) return;
  const members = Array.isArray(c.members) ? [...c.members] : [];
  if (!members.some(m => m.uid === uid)) {
    members.push({ uid, name: me.name || 'Player', role: 'Member', joinedAt: Date.now() });
  }
  c.members = members;
  me.clanId = c.id;
  me.clanTag = c.tag;
  saveMe();
  patchUser(uid, { clanId: c.id, clanTag: c.tag });
  dbOp(() => F.setDoc(userRef(uid), { clanId: c.id, clanTag: c.tag }, { merge: true }));
  dbOp(() => F.setDoc(F.doc(db, 'clans', c.id), { members }, { merge: true }));
  ls.set('sg_clans_cache', clansList);
  if (typeof buildProfile === 'function') buildProfile();
  if (typeof renderRanking === 'function') renderRanking();
  toast(`Joined [${c.tag}] ${c.name}!`);
}

function openClansModal() {
  const myClan = clansList.find(c => c.id === me.clanId);
  const m = modal('⚔️ Clans & Weekly Clan Wars', `
    ${myClan ? `
      <div class="card clan-hero-card">
        <div class="row" style="gap:10px">
          <div class="clan-emblem lg">${esc(myClan.emblem || '⚔️')}</div>
          <div class="mid">
            <b><span class="clan-tag-pill">[${esc(myClan.tag)}]</span> ${esc(myClan.name)}</b>
            <small style="display:block;color:var(--mu)">Weekly Glory: <b>${fmtNum(myClan.weeklyGlory || 0)}</b> · ${(myClan.members || []).length} Members</small>
          </div>
          <button type="button" class="btn ghost sm" id="leaveClanBtn">Leave</button>
        </div>
      </div>
    ` : `
      <div class="card">
        <b>Create Your Gaming Squad (200 🪙)</b>
        <div class="row" style="margin-top:8px;gap:6px">
          <input id="clTag" maxlength="4" placeholder="TAG (4)" style="width:90px;text-transform:uppercase">
          <input id="clName" maxlength="24" placeholder="Clan Name..." style="flex:1">
        </div>
        <div class="row wrap" style="gap:6px;margin-top:8px" id="clEmbPick">
          ${CLAN_EMBLEMS.map((em, i) => `<button type="button" class="chipbtn ${i === 0 ? 'on' : ''}" data-clemb="${em}">${em}</button>`).join('')}
        </div>
        <button type="button" class="btn gold full" id="createClanBtn" style="margin-top:10px">Create Clan (200 🪙)</button>
      </div>
    `}
    <div style="margin-top:12px">
      <h4 style="margin:0 0 8px">🏆 Weekly Clan Wars Leaderboard</h4>
      <div id="clansListWrap">${renderClanLeaderboardHtml()}</div>
    </div>
  `, 'clans-sheet');

  let chosenEmblem = CLAN_EMBLEMS[0];
  if ($('#clEmbPick', m)) {
    $('#clEmbPick', m).onclick = e => {
      const b = e.target.closest('[data-clemb]');
      if (!b) return;
      chosenEmblem = b.dataset.clemb;
      $$('[data-clemb]', m).forEach(x => x.classList.toggle('on', x === b));
    };
  }
  if ($('#createClanBtn', m)) {
    $('#createClanBtn', m).onclick = () => {
      if (needLogin('creating a Clan')) return;
      const tag = $('#clTag', m).value.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4);
      const name = $('#clName', m).value.trim().slice(0, 24);
      if (tag.length < 2 || name.length < 2) return toast('Enter a 2–4 char TAG and Clan name');
      if (me.coins < 200) return toast('Need 200 coins to create a Clan');
      me.coins = clampCoins(me.coins - 200);
      const id = 'cl_' + Date.now().toString(36);
      const clan = {
        id, tag, name, emblem: chosenEmblem,
        leaderUid: uid, leaderName: me.name || 'Player',
        weeklyGlory: 50,
        members: [{ uid, name: me.name || 'Player', role: 'Leader', joinedAt: Date.now() }],
        createdAt: Date.now(), updatedAt: Date.now()
      };
      clansList.unshift(clan);
      me.clanId = id;
      me.clanTag = tag;
      saveMe(); updateHud();
      ls.set('sg_clans_cache', clansList);
      patchUser(uid, { coins: me.coins, clanId: id, clanTag: tag });
      dbOp(() => F.setDoc(userRef(uid), { coins: me.coins, clanId: id, clanTag: tag }, { merge: true }));
      dbOp(() => F.setDoc(F.doc(db, 'clans', id), clan));
      m.close();
      if (typeof buildProfile === 'function') buildProfile();
      toast(`Clan [${tag}] ${name} created!`);
      openClansModal();
    };
  }
  if ($('#leaveClanBtn', m)) {
    $('#leaveClanBtn', m).onclick = () => {
      const c = clansList.find(x => x.id === me.clanId);
      if (c && Array.isArray(c.members)) {
        c.members = c.members.filter(x => x.uid !== uid);
        dbOp(() => F.setDoc(F.doc(db, 'clans', c.id), { members: c.members }, { merge: true }));
      }
      me.clanId = ''; me.clanTag = '';
      saveMe();
      patchUser(uid, { clanId: '', clanTag: '' });
      dbOp(() => F.setDoc(userRef(uid), { clanId: '', clanTag: '' }, { merge: true }));
      m.close(); toast('Left clan'); openClansModal();
    };
  }
  $('#clansListWrap', m).onclick = e => {
    const jb = e.target.closest('[data-join-clan]');
    if (jb) { joinClanById(jb.dataset.joinClan); m.close(); openClansModal(); return; }
    const dbBtn = e.target.closest('[data-del-clan]');
    if (dbBtn && devMode) {
      const cid = dbBtn.dataset.delClan;
      clansList = clansList.filter(x => x.id !== cid);
      ls.set('sg_clans_cache', clansList);
      dbOp(() => F.deleteDoc(F.doc(db, 'clans', cid)));
      m.close(); toast('Clan deleted'); openClansModal();
    }
  };
}

/* ===== 7. User Report System With Compressed Screenshot Proof & Developer Moderation Center ===== */
let reportsList = ls.get('sg_reports_cache', []);
if (!Array.isArray(reportsList)) reportsList = [];

function ingestReports(list) {
  if (!Array.isArray(list)) return;
  reportsList = list;
  ls.set('sg_reports_cache', reportsList);
  const badge = $('#devReportBadge');
  if (badge) {
    const openCnt = reportsList.filter(r => r.status !== 'resolved').length;
    badge.textContent = openCnt > 0 ? String(openCnt) : '';
    badge.hidden = openCnt === 0;
  }
}

function compressImageFileToDataUrl(file, maxDim = 640, quality = 0.72) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        let w = img.width, h = img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) { h = Math.round(h * (maxDim / w)); w = maxDim; }
          else { w = Math.round(w * (maxDim / h)); h = maxDim; }
        }
        const cv = document.createElement('canvas');
        cv.width = w; cv.height = h;
        cv.getContext('2d').drawImage(img, 0, 0, w, h);
        resolve(cv.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function openReportModal(opts) {
  opts = opts || {};
  let proofDataUrl = '';
  const m = modal('🚩 Report User / Room', `
    <div style="font-size:13px;color:var(--mu);margin-bottom:8px">
      Reporting: <b style="color:var(--tx)">${esc(opts.targetName || opts.targetUid || 'User')}</b> (${esc(opts.context || 'chat')})
    </div>
    <label>Reason</label>
    <select id="rpReason">
      <option value="Abuse / Harassment">Abuse / Harassment</option>
      <option value="Spam / Scam">Spam / Scam</option>
      <option value="Inappropriate Content">Inappropriate Content</option>
      <option value="Cheating / Exploiting">Cheating / Exploiting</option>
      <option value="Other">Other</option>
    </select>
    <label style="margin-top:8px">Details</label>
    <textarea id="rpDetails" maxlength="300" placeholder="Describe what happened..." style="min-height:68px"></textarea>
    <label style="margin-top:8px">Attach Screenshot Proof (Optional)</label>
    <input type="file" id="rpFile" accept="image/*" style="padding:6px">
    <div id="rpPreview" style="margin-top:8px"></div>
    <button type="button" class="btn red full" id="rpSubmit" style="margin-top:12px">Submit Report to Moderator</button>
  `, 'report-sheet');

  $('#rpFile', m).onchange = async e => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    try {
      proofDataUrl = await compressImageFileToDataUrl(f, 540, 0.68);
      $('#rpPreview', m).innerHTML = `<img src="${proofDataUrl}" alt="Report screenshot proof" style="max-width:100%;max-height:150px;border-radius:10px;border:1px solid var(--bd)">`;
    } catch {
      toast('Could not process screenshot');
    }
  };

  $('#rpSubmit', m).onclick = () => {
    const reason = $('#rpReason', m).value;
    const details = $('#rpDetails', m).value.trim();
    if (!details) return toast('Please enter short details');
    const id = 'rep_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
    const rep = {
      id,
      reporterUid: uid,
      reporterName: me.name || 'Player',
      targetUid: opts.targetUid || '',
      targetName: opts.targetName || 'Unknown',
      context: opts.context || 'profile',
      reason,
      details,
      proofImage: proofDataUrl || '',
      status: 'open',
      ts: Date.now()
    };
    reportsList.unshift(rep);
    ls.set('sg_reports_cache', reportsList.slice(0, 60));
    dbOp(() => F.setDoc(F.doc(db, 'reports', id), rep));
    m.close();
    toast('Report submitted with proof. Developer will review it.');
  };
}

function openDevModerationCenter() {
  if (!isDevSession()) return toast('Developer only');
  const m = modal('🛡️ Developer Report & Moderation Center', `
    <div class="card" style="margin-bottom:10px">
      <b style="color:var(--gold)">Global Arena Controls</b>
      <div class="row wrap" style="gap:6px;margin-top:8px">
        <button type="button" class="btn gold sm" id="dmFlashBtn">⚡ Launch 10s Chat Flash Drop</button>
        <button type="button" class="btn sm" id="dmLifafaBtn">🧧 Global Coin Lifafa</button>
        <button type="button" class="btn ghost sm" id="dmNoticeBtn">📢 Global Announcement</button>
      </div>
    </div>
    <h4 style="margin:0 0 8px">User Reports (${reportsList.length})</h4>
    <div id="dmReportsWrap"></div>
  `, 'dev-mod-sheet');

  const renderRepList = () => {
    const wrap = $('#dmReportsWrap', m);
    if (!reportsList.length) {
      wrap.innerHTML = `<div class="empty">No user reports yet.</div>`;
      return;
    }
    wrap.innerHTML = reportsList.map(r => `
      <div class="card rep-card ${r.status === 'resolved' ? 'resolved' : ''}">
        <div class="row" style="justify-content:space-between;gap:6px">
          <b>${esc(r.reason)} · Target: ${esc(r.targetName || r.targetUid)}</b>
          <span class="dur-pill">${esc(r.status || 'open')}</span>
        </div>
        <small style="color:var(--mu)">Reported by ${esc(r.reporterName)} (${esc(r.context)}) · ${new Date(r.ts || Date.now()).toLocaleString()}</small>
        <p style="margin:6px 0;font-size:13px">${esc(r.details)}</p>
        ${r.proofImage ? `<img src="${r.proofImage}" alt="Screenshot proof" class="rep-proof-img" data-zoom-img="${esc(r.id)}">` : ''}
        <div class="row wrap" style="gap:6px;margin-top:8px">
          ${r.targetUid ? `<button type="button" class="btn sm gold" data-rep-warn="${esc(r.targetUid)}" data-rep-id="${esc(r.id)}">⚠️ Warn</button>` : ''}
          ${r.targetUid ? `<button type="button" class="btn sm ghost" data-rep-mute="${esc(r.targetUid)}" data-rep-id="${esc(r.id)}">🔇 Mute 1h</button>` : ''}
          ${r.targetUid ? `<button type="button" class="btn sm red" data-rep-ban="${esc(r.targetUid)}" data-rep-id="${esc(r.id)}">🚫 Ban 24h</button>` : ''}
          ${r.targetUid ? `<button type="button" class="btn sm ghost" data-rep-prof="${esc(r.targetUid)}">Inspect User</button>` : ''}
          <button type="button" class="btn sm ok" data-rep-resolve="${esc(r.id)}">✓ Resolve</button>
        </div>
      </div>
    `).join('');
  };
  renderRepList();

  $('#dmFlashBtn', m).onclick = () => {
    m.close();
    if (typeof launchChatFlashDrop === 'function') launchChatFlashDrop();
    else toast('Open World Chat to launch Flash Drops');
  };
  $('#dmLifafaBtn', m).onclick = () => {
    m.close();
    showTab('chat');
    if (typeof openThread === 'function') openThread('world');
    if (typeof openRedPacketDropModal === 'function') openRedPacketDropModal();
  };
  $('#dmNoticeBtn', m).onclick = () => {
    const txt = prompt('Enter Global Announcement banner text:');
    if (txt === null) return;
    const clean = txt.trim().slice(0, 180);
    notice = clean ? { text: clean, ts: Date.now() } : null;
    ls.set('sg_notice', notice);
    dbOp(() => F.setDoc(F.doc(db, 'config', 'notice'), notice || { text: '' }));
    if (typeof renderNotice === 'function') renderNotice();
    toast(clean ? 'Global announcement published' : 'Announcement cleared');
  };

  $('#dmReportsWrap', m).onclick = e => {
    const zi = e.target.closest('[data-zoom-img]');
    if (zi) {
      const r = reportsList.find(x => x.id === zi.dataset.zoomImg);
      if (r && r.proofImage) {
        modal('Screenshot Proof', `<img src="${r.proofImage}" alt="Full screenshot proof" style="width:100%;border-radius:10px">`);
      }
      return;
    }
    const markResolved = (rid) => {
      reportsList = reportsList.map(x => x.id === rid ? { ...x, status: 'resolved' } : x);
      ls.set('sg_reports_cache', reportsList);
      dbOp(() => F.setDoc(F.doc(db, 'reports', rid), { status: 'resolved' }, { merge: true }));
      renderRepList();
    };
    const wb = e.target.closest('[data-rep-warn]');
    if (wb) { devSendWarning(wb.dataset.repWarn, 'Moderator warning following user report.'); markResolved(wb.dataset.repId); return; }
    const mb = e.target.closest('[data-rep-mute]');
    if (mb) { devSetMute(mb.dataset.repMute, 60); markResolved(mb.dataset.repId); return; }
    const bb = e.target.closest('[data-rep-ban]');
    if (bb) { devSetBan(bb.dataset.repBan, 24, 'Reported violation verified by moderator.'); markResolved(bb.dataset.repId); return; }
    const pb = e.target.closest('[data-rep-prof]');
    if (pb) { m.close(); openPublicProfile(pb.dataset.repProf); return; }
    const rb = e.target.closest('[data-rep-resolve]');
    if (rb) { markResolved(rb.dataset.repResolve); }
  };
}

/* ===== Developer Admin Cleanup Center (Useless User IDs & Unwanted/Stale Rooms) ===== */
function openDevAdminCleanupModal() {
  if (!isDevSession()) return toast('Developer only tool');
  let activeTab = 'users'; // 'users' | 'rooms'
  let userFilter = 'useless'; // 'useless' | 'all' | 'guests'
  let armedConfirmKey = '';

  const SR = typeof ShowGamesRules !== 'undefined' ? ShowGamesRules : null;
  const classifyUser = (u) => {
    if (SR && typeof SR.classifyCleanupUser === 'function') return SR.classifyCleanupUser(u, Date.now());
    const id = String(u?.uid || '');
    if (isDevAccount(u) || id === uid) return { useless: false, reason: 'Protected' };
    if (/^(bot_|demo_|fake_|test_)/i.test(id)) return { useless: true, reason: 'Test / Bot ID' };
    const ageD = Math.floor((Date.now() - Number(u?.lastSeen || 0)) / 86400000);
    if (u?.accountType !== 'account' && ageD >= 3) return { useless: true, reason: `Inactive Guest (${ageD}d)` };
    return { useless: false, reason: 'Active' };
  };

  const m = modal('🛠️ Developer Admin Cleanup Center', `
    <div class="dev-adm-tabs" role="tablist">
      <button type="button" class="btn sm gold" data-admtab="users" data-testid="dev-adm-tab-users">👤 User IDs</button>
      <button type="button" class="btn sm ghost" data-admtab="rooms" data-testid="dev-adm-tab-rooms">🎙️ Voice &amp; Game Rooms</button>
    </div>
    <div id="devAdmBody" style="margin-top:10px"></div>
  `, 'dev-mod-sheet');

  const deleteAnyPartyRoom = async (rid) => {
    if (!rid) return;
    if (typeof activePartyRoomId !== 'undefined' && (activePartyRoomId === rid || minimizedPartyRoomId === rid)) {
      if (typeof closePartyRoom === 'function') closePartyRoom();
    }
    if (online && db && F) {
      await dbOp(() => F.deleteDoc(F.doc(db, 'party_rooms', rid)));
    }
    if (typeof partyRooms !== 'undefined' && Array.isArray(partyRooms)) {
      partyRooms = partyRooms.filter(r => r && r.id !== rid);
      if (typeof savePartyRoomsLocal === 'function') savePartyRoomsLocal();
      if (typeof renderPartyHub === 'function') renderPartyHub();
    }
  };

  const deleteAnyGameRoom = async (rid) => {
    if (!rid) return;
    if (online && db && F) {
      await dbOp(() => F.deleteDoc(F.doc(db, 'game_rooms', rid)));
    }
    if (typeof mpRooms !== 'undefined' && Array.isArray(mpRooms)) {
      mpRooms = mpRooms.filter(r => r && r.id !== rid);
      ls.set('sg_mp_rooms', mpRooms);
      if (typeof renderMultiplayerRooms === 'function') renderMultiplayerRooms();
    }
  };

  const renderBody = () => {
    $$('[data-admtab]', m).forEach(b => {
      b.className = b.dataset.admtab === activeTab ? 'btn sm gold' : 'btn sm ghost';
    });
    const body = $('#devAdmBody', m);
    if (!body) return;

    if (activeTab === 'users') {
      const all = allUsers().filter(u => u && u.uid && u.uid !== uid && !isDevAccount(u));
      const rows = all.map(u => ({ u, cls: classifyUser(u) }));
      const uselessRows = rows.filter(x => x.cls.useless);
      const shown = userFilter === 'useless'
        ? uselessRows
        : (userFilter === 'guests' ? rows.filter(x => x.u.accountType !== 'account') : rows);

      body.innerHTML = `
        <div class="row wrap" style="justify-content:space-between;gap:6px;margin-bottom:8px">
          <div class="row" style="gap:5px">
            <button type="button" class="chipbtn ${userFilter === 'useless' ? 'on' : ''}" data-ufilt="useless">Useless/Test (${uselessRows.length})</button>
            <button type="button" class="chipbtn ${userFilter === 'guests' ? 'on' : ''}" data-ufilt="guests">Guests</button>
            <button type="button" class="chipbtn ${userFilter === 'all' ? 'on' : ''}" data-ufilt="all">All (${rows.length})</button>
          </div>
          <button type="button" class="btn red sm" id="devBulkDelUsers" ${!uselessRows.length ? 'disabled' : ''}>🧹 Purge ${uselessRows.length} Useless IDs</button>
        </div>
        <div class="dev-adm-list">
          ${shown.length ? shown.slice(0, 40).map(({ u, cls }) => {
            const armed = armedConfirmKey === 'u:' + u.uid;
            return `<div class="dev-adm-row">
              ${av(u, 34)}
              <div class="mid">
                <b>${esc(u.name || 'Unnamed')} <small style="color:var(--mu)">(${u.accountType === 'account' ? 'Google' : 'Guest'})</small></b>
                <small style="display:block;color:var(--mu)">ID: ${esc(String(u.uid).slice(-10))} · 🪙 ${fmtNum(u.coins)} · Lv.${calcLevel(u.exp)} · <span style="color:${cls.useless ? '#fda4af' : '#6ee7b7'}">${esc(cls.reason)}</span></small>
              </div>
              <button type="button" class="btn ${armed ? 'crimson' : 'red'} sm" data-del-uid="${esc(u.uid)}">${armed ? 'Confirm ✓' : 'Delete'}</button>
            </div>`;
          }).join('') : '<div class="mp-empty">No matching user records to clean up.</div>'}
        </div>
      `;
      return;
    }

    // ROOMS TAB (Voice / Party Rooms + Live Game Rooms)
    const pList = typeof partyRooms !== 'undefined' && Array.isArray(partyRooms) ? partyRooms : [];
    const gList = typeof mpRooms !== 'undefined' && Array.isArray(mpRooms) ? mpRooms : [];
    const staleVoice = pList.filter(r => typeof isFakeOrStalePartyRoom === 'function' ? isFakeOrStalePartyRoom(r) : false);
    const staleGame = gList.filter(r => {
      const pCnt = Object.keys(r?.players || {}).length;
      const age = Date.now() - Number(r?.updatedAt || r?.createdAt || 0);
      return pCnt === 0 || r?.status === 'finished' || r?.status === 'closed' || age > 3600000;
    });

    body.innerHTML = `
      <div class="row wrap" style="justify-content:space-between;gap:6px;margin-bottom:8px">
        <small style="color:var(--mu)">Voice Rooms: <b>${pList.length}</b> · Game Rooms: <b>${gList.length}</b></small>
        <button type="button" class="btn red sm" id="devPurgeAllRooms">🧹 Purge ${staleVoice.length + staleGame.length} Empty/Stale Rooms</button>
      </div>
      <div class="dev-adm-sec">🎙️ Voice / VR Rooms (${pList.length})</div>
      <div class="dev-adm-list">
        ${pList.length ? pList.map(rm => {
          const seated = Object.keys(rm.seats || {}).length;
          const stale = typeof isFakeOrStalePartyRoom === 'function' && isFakeOrStalePartyRoom(rm);
          const armed = armedConfirmKey === 'pr:' + rm.id;
          return `<div class="dev-adm-row">
            <div class="mid">
              <b>${esc(rm.title || 'Voice Room')} <small style="color:var(--gold)">[${esc(rm.mode || 'normal')}]</small></b>
              <small style="display:block;color:var(--mu)">Host: ${esc(rm.hostName || 'Owner')} · Seated: ${seated} · ${stale ? '<span style="color:#fda4af">Stale / Empty</span>' : '<span style="color:#6ee7b7">Live</span>'}</small>
            </div>
            <button type="button" class="btn ${armed ? 'crimson' : 'red'} sm" data-del-pr="${esc(rm.id)}">${armed ? 'Confirm ✓' : 'Delete'}</button>
          </div>`;
        }).join('') : '<div class="mp-empty">No Voice Rooms active.</div>'}
      </div>
      <div class="dev-adm-sec" style="margin-top:10px">⚔️ Multiplayer Game Rooms (${gList.length})</div>
      <div class="dev-adm-list">
        ${gList.length ? gList.map(rm => {
          const pCnt = Object.keys(rm.players || {}).length;
          const armed = armedConfirmKey === 'gr:' + rm.id;
          return `<div class="dev-adm-row">
            <div class="mid">
              <b>${esc(rm.tierLabel || rm.mode || 'Game Room')} (${esc(rm.code || rm.id)})</b>
              <small style="display:block;color:var(--mu)">Players: ${pCnt} · Status: ${esc(rm.status || 'open')}</small>
            </div>
            <button type="button" class="btn ${armed ? 'crimson' : 'red'} sm" data-del-gr="${esc(rm.id)}">${armed ? 'Confirm ✓' : 'Delete'}</button>
          </div>`;
        }).join('') : '<div class="mp-empty">No Multiplayer Game Rooms active.</div>'}
      </div>
    `;
  };

  renderBody();

  m.onclick = async (e) => {
    const tb = e.target.closest('[data-admtab]');
    if (tb) { activeTab = tb.dataset.admtab; armedConfirmKey = ''; renderBody(); return; }
    const uf = e.target.closest('[data-ufilt]');
    if (uf) { userFilter = uf.dataset.ufilt; armedConfirmKey = ''; renderBody(); return; }

    if (e.target.closest('#devBulkDelUsers')) {
      const targets = allUsers().filter(u => u && u.uid && u.uid !== uid && !isDevAccount(u) && classifyUser(u).useless);
      let count = 0;
      for (const t of targets) {
        if (typeof devDeleteUserRecord === 'function' && await devDeleteUserRecord(t.uid)) count++;
      }
      toast(count ? `🧹 Deleted ${count} useless/inactive user IDs` : 'Nothing to purge');
      renderBody();
      return;
    }

    if (e.target.closest('#devPurgeAllRooms')) {
      let n = 0;
      if (typeof clearFakeVoiceRooms === 'function') n += Number(await clearFakeVoiceRooms() || 0);
      const gList = typeof mpRooms !== 'undefined' && Array.isArray(mpRooms) ? [...mpRooms] : [];
      for (const r of gList) {
        const pCnt = Object.keys(r?.players || {}).length;
        const age = Date.now() - Number(r?.updatedAt || r?.createdAt || 0);
        if (pCnt === 0 || r?.status === 'finished' || r?.status === 'closed' || age > 3600000) {
          await deleteAnyGameRoom(r.id);
          n++;
        }
      }
      toast(n ? `🧹 Purged ${n} empty/stale rooms!` : 'All rooms are currently active');
      renderBody();
      return;
    }

    const du = e.target.closest('[data-del-uid]');
    if (du) {
      const tid = du.dataset.delUid;
      if (armedConfirmKey !== 'u:' + tid) { armedConfirmKey = 'u:' + tid; renderBody(); return; }
      armedConfirmKey = '';
      if (typeof devDeleteUserRecord === 'function') await devDeleteUserRecord(tid);
      renderBody();
      return;
    }

    const dp = e.target.closest('[data-del-pr]');
    if (dp) {
      const rid = dp.dataset.delPr;
      if (armedConfirmKey !== 'pr:' + rid) { armedConfirmKey = 'pr:' + rid; renderBody(); return; }
      armedConfirmKey = '';
      await deleteAnyPartyRoom(rid);
      toast('🗑️ Voice room deleted');
      renderBody();
      return;
    }

    const dg = e.target.closest('[data-del-gr]');
    if (dg) {
      const rid = dg.dataset.delGr;
      if (armedConfirmKey !== 'gr:' + rid) { armedConfirmKey = 'gr:' + rid; renderBody(); return; }
      armedConfirmKey = '';
      await deleteAnyGameRoom(rid);
      toast('🗑️ Game room deleted');
      renderBody();
    }
  };
}
window.openDevAdminCleanupModal = openDevAdminCleanupModal;

/* Online Activity Chest Timer (ticks every 10 seconds while active) */
setInterval(() => {
  if (typeof me !== 'undefined' && me && !me.banned) {
    me.activitySec = clampSafeInt(Number(me.activitySec || 0) + 10, 0, 8640000);
    if (me.activitySec % 30 === 0) saveMe();
  }
}, 10000);
