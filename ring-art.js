"use strict";
/* ===== Study Game: Layered SVG + CSS Jewelry Artwork Engine for Wedding & Couple Rings (Zero Heavy JPGs) ===== */
(function (root) {
  let _ringSvgSeq = 0;

  function escAttr(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function sparkle(x, y, r, color) {
    const c = color || '#ffffff';
    return `<path d="M${x} ${y - r}L${x + r * 0.28} ${y - r * 0.28}L${x + r} ${y}L${x + r * 0.28} ${y + r * 0.28}L${x} ${y + r}L${x - r * 0.28} ${y + r * 0.28}L${x - r} ${y}L${x - r * 0.28} ${y - r * 0.28}Z" fill="${c}" opacity="0.95"/>`;
  }

  function ringGlyphSvgBody(artKey, idPrefix) {
    const p = idPrefix;
    switch (artKey) {
      /* 1. Diamond Ring — Twin warm-gold interlocking bands + brilliant ice diamond */
      case 'diamond':
        return `
          <defs>
            <linearGradient id="${p}_g1" x1="12" y1="22" x2="54" y2="66" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#fff3d6"/><stop offset="32%" stop-color="#f2b872"/><stop offset="72%" stop-color="#c97d3b"/><stop offset="100%" stop-color="#ffe5b4"/>
            </linearGradient>
            <linearGradient id="${p}_g2" x1="34" y1="22" x2="76" y2="66" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#fff8e7"/><stop offset="36%" stop-color="#f5c07d"/><stop offset="76%" stop-color="#b86b2b"/><stop offset="100%" stop-color="#ffe2a8"/>
            </linearGradient>
            <linearGradient id="${p}_gem" x1="46" y1="12" x2="66" y2="33" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#ffffff"/><stop offset="42%" stop-color="#d7f3ff"/><stop offset="76%" stop-color="#7dd3fc"/><stop offset="100%" stop-color="#38bdf8"/>
            </linearGradient>
          </defs>
          <ellipse cx="44" cy="69" rx="26" ry="4.5" fill="rgba(4,9,24,.45)"/>
          <circle cx="33" cy="46" r="16.2" fill="none" stroke="rgba(45,20,5,.45)" stroke-width="6" transform="translate(0,1.5)"/>
          <circle cx="53" cy="46" r="16.2" fill="none" stroke="rgba(45,20,5,.45)" stroke-width="6" transform="translate(0,1.5)"/>
          <circle cx="33" cy="45.5" r="16.2" fill="none" stroke="url(#${p}_g1)" stroke-width="5"/>
          <circle cx="33" cy="45.5" r="16.2" fill="none" stroke="#ffffff" stroke-opacity=".55" stroke-width="1.2" stroke-dasharray="16 38"/>
          <circle cx="53" cy="45.5" r="16.2" fill="none" stroke="url(#${p}_g2)" stroke-width="5"/>
          <circle cx="53" cy="45.5" r="16.2" fill="none" stroke="#ffffff" stroke-opacity=".55" stroke-width="1.2" stroke-dasharray="18 42"/>
          <g transform="translate(55,26) rotate(12)">
            <polygon points="-9,-4 9,-4 12,1 0,11 -12,1" fill="url(#${p}_gem)" stroke="#ffffff" stroke-width="1.2" stroke-linejoin="round"/>
            <polygon points="-6,-4 6,-4 4,1 -4,1" fill="#ffffff" fill-opacity=".68"/>
            <polygon points="-4,1 4,1 0,11" fill="#e0f2fe" fill-opacity=".55"/>
            <path d="M-12 1h24" stroke="#ffffff" stroke-opacity=".75" stroke-width=".9"/>
          </g>
          ${sparkle(68, 16, 4.2, '#ffffff')}
          ${sparkle(21, 29, 2.5, '#fef08a')}
        `;

      /* 2. Summer Night Ring — Silver band + crescent moon + deep sapphire night gem + golden 8-point star */
      case 'summer_night':
        return `
          <defs>
            <linearGradient id="${p}_band" x1="10" y1="36" x2="78" y2="52" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#e2e8f0"/><stop offset="45%" stop-color="#ffffff"/><stop offset="100%" stop-color="#94a3b8"/>
            </linearGradient>
            <radialGradient id="${p}_sap" cx="38%" cy="32%" r="68%">
              <stop offset="0%" stop-color="#60a5fa"/><stop offset="48%" stop-color="#1d4ed8"/><stop offset="100%" stop-color="#0f1742"/>
            </radialGradient>
            <linearGradient id="${p}_star" x1="28" y1="24" x2="48" y2="52" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#fffbeb"/><stop offset="48%" stop-color="#fde047"/><stop offset="100%" stop-color="#ea580c"/>
            </linearGradient>
          </defs>
          <ellipse cx="44" cy="69" rx="22" ry="4" fill="rgba(4,9,24,.45)"/>
          <rect x="12" y="39" width="64" height="10.5" rx="5.2" fill="url(#${p}_band)" stroke="#cbd5e1" stroke-width="1"/>
          <rect x="15" y="41" width="58" height="2.4" rx="1.2" fill="#ffffff" opacity=".7"/>
          <circle cx="44" cy="44" r="18.2" fill="#e2e8f0" stroke="#ffffff" stroke-width="1.4"/>
          <circle cx="44" cy="44" r="15.8" fill="url(#${p}_sap)" stroke="#93c5fd" stroke-width="1.1"/>
          <path d="M44 28.5 A15.5 15.5 0 0 0 33 55.2 A12.5 12.5 0 0 1 44 28.5Z" fill="#dbeafe" opacity=".88"/>
          <polygon points="44,31 54,39 51,54 38,54 34,40" fill="#3b82f6" fill-opacity=".38"/>
          <polygon points="48,34 55,44 48,54 41,44" fill="#93c5fd" fill-opacity=".35"/>
          <circle cx="44" cy="44" r="17.2" fill="none" stroke="#ffffff" stroke-width="1.8" stroke-dasharray="1.6 2.9" stroke-linecap="round"/>
          <path d="M39 29l2.4 7.8 7.8 2.4-7.8 2.4-2.4 7.8-2.4-7.8-7.8-2.4 7.8-2.4Z" fill="url(#${p}_star)" stroke="#fff7ed" stroke-width=".9"/>
          <path d="M39 33l4.2 6.2-4.2 6.2-4.2-6.2Z" fill="#ffffff" opacity=".55"/>
          ${sparkle(20, 26, 4.8, '#ffffff')}
          ${sparkle(65, 29, 3, '#fde047')}
        `;

      /* 3. Ruby Ring — Twin rich-gold interlocking bands + vivid crimson ruby */
      case 'ruby':
        return `
          <defs>
            <linearGradient id="${p}_gold" x1="12" y1="22" x2="72" y2="68" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#fef9c3"/><stop offset="32%" stop-color="#facc15"/><stop offset="72%" stop-color="#ca8a04"/><stop offset="100%" stop-color="#fef08a"/>
            </linearGradient>
            <linearGradient id="${p}_rub" x1="44" y1="12" x2="66" y2="36" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#fda4af"/><stop offset="36%" stop-color="#f43f5e"/><stop offset="74%" stop-color="#be123c"/><stop offset="100%" stop-color="#881337"/>
            </linearGradient>
          </defs>
          <ellipse cx="44" cy="69" rx="26" ry="4.5" fill="rgba(30,4,14,.48)"/>
          <circle cx="33" cy="46" r="16.2" fill="none" stroke="rgba(60,30,0,.45)" stroke-width="6" transform="translate(0,1.4)"/>
          <circle cx="53" cy="46" r="16.2" fill="none" stroke="rgba(60,30,0,.45)" stroke-width="6" transform="translate(0,1.4)"/>
          <circle cx="33" cy="45.5" r="16.2" fill="none" stroke="url(#${p}_gold)" stroke-width="5"/>
          <circle cx="33" cy="45.5" r="16.2" fill="none" stroke="#ffffff" stroke-opacity=".58" stroke-width="1.2" stroke-dasharray="16 38"/>
          <circle cx="53" cy="45.5" r="16.2" fill="none" stroke="url(#${p}_gold)" stroke-width="5"/>
          <circle cx="53" cy="45.5" r="16.2" fill="none" stroke="#ffffff" stroke-opacity=".58" stroke-width="1.2" stroke-dasharray="18 40"/>
          <g transform="translate(55,26) rotate(14)">
            <polygon points="-9,-4 9,-4 12,1 0,11 -12,1" fill="url(#${p}_rub)" stroke="#fecdd3" stroke-width="1.2" stroke-linejoin="round"/>
            <polygon points="-6,-4 6,-4 4,1 -4,1" fill="#ffffff" fill-opacity=".46"/>
            <polygon points="-4,1 4,1 0,11" fill="#fb7185" fill-opacity=".6"/>
          </g>
          ${sparkle(68, 17, 4.2, '#ffe4e6')}
          ${sparkle(20, 31, 2.6, '#fef08a')}
        `;

      /* 4. Rainbow Ring — 3D platinum open cuff with inlaid dots + glowing vertical rainbow bars */
      case 'rainbow':
        return `
          <defs>
            <linearGradient id="${p}_pt" x1="14" y1="30" x2="72" y2="66" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#ffffff"/><stop offset="38%" stop-color="#dbeafe"/><stop offset="72%" stop-color="#93c5fd"/><stop offset="100%" stop-color="#e0e7ff"/>
            </linearGradient>
          </defs>
          <ellipse cx="44" cy="70" rx="25" ry="4.5" fill="rgba(8,12,35,.48)"/>
          <g transform="rotate(14 44 48)">
            <ellipse cx="44" cy="52" rx="22" ry="12.5" fill="none" stroke="rgba(15,23,42,.45)" stroke-width="8" transform="translate(0,1.6)"/>
            <ellipse cx="44" cy="51" rx="22" ry="12.5" fill="none" stroke="url(#${p}_pt)" stroke-width="6.8"/>
            <ellipse cx="44" cy="51" rx="22" ry="12.5" fill="none" stroke="#ffffff" stroke-width="1.3" stroke-opacity=".75" stroke-dasharray="28 50"/>
            <g>
              <rect x="24" y="25" width="4.4" height="14" rx="1.6" fill="#ff3b5c" stroke="#ffe4e6" stroke-width=".6"/>
              <rect x="29.5" y="22" width="4.6" height="17" rx="1.6" fill="#fb923c" stroke="#ffedd5" stroke-width=".6"/>
              <rect x="35.2" y="18" width="4.8" height="21" rx="1.6" fill="#facc15" stroke="#fef9c3" stroke-width=".6"/>
              <rect x="41.2" y="15" width="5" height="24" rx="1.6" fill="#4ade80" stroke="#dcfce7" stroke-width=".6"/>
              <rect x="47.4" y="18.5" width="4.8" height="20.5" rx="1.6" fill="#22d3ee" stroke="#cffafe" stroke-width=".6"/>
              <rect x="53.4" y="23" width="4.6" height="16" rx="1.6" fill="#3b82f6" stroke="#dbeafe" stroke-width=".6"/>
              <rect x="59.1" y="27" width="4.2" height="12" rx="1.6" fill="#a855f7" stroke="#f3e8ff" stroke-width=".6"/>
            </g>
            <path d="M21 43 C32 37 56 37 67 43" fill="none" stroke="url(#${p}_pt)" stroke-width="7.2" stroke-linecap="round"/>
            <path d="M22 41.5 C32 36 56 36 66 41.5" fill="none" stroke="#ffffff" stroke-width="1.6" stroke-linecap="round"/>
            <circle cx="31" cy="43" r="1.7" fill="#1e293b" stroke="#ffffff" stroke-width=".8"/>
            <circle cx="40" cy="42" r="1.7" fill="#1e293b" stroke="#ffffff" stroke-width=".8"/>
            <circle cx="49" cy="42" r="1.7" fill="#1e293b" stroke="#ffffff" stroke-width=".8"/>
            <circle cx="58" cy="43" r="1.7" fill="#1e293b" stroke="#ffffff" stroke-width=".8"/>
          </g>
          ${sparkle(25, 25, 4.4, '#ffffff')}
          ${sparkle(64, 24, 3.8, '#fef08a')}
          ${sparkle(46, 15, 3.4, '#ffffff')}
        `;

      /* 5. Wolf King Ring — Heavy octagonal platinum signet + faceted neon-blue/violet gem with howling wolf */
      case 'wolf_king':
        return `
          <defs>
            <linearGradient id="${p}_sh" x1="10" y1="36" x2="78" y2="54" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#cbd5e1"/><stop offset="50%" stop-color="#ffffff"/><stop offset="100%" stop-color="#94a3b8"/>
            </linearGradient>
            <linearGradient id="${p}_gem" x1="26" y1="22" x2="62" y2="66" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#38bdf8"/><stop offset="45%" stop-color="#2563eb"/><stop offset="82%" stop-color="#7c3aed"/><stop offset="100%" stop-color="#4338ca"/>
            </linearGradient>
          </defs>
          <ellipse cx="44" cy="70" rx="24" ry="4" fill="rgba(8,10,36,.48)"/>
          <rect x="11" y="38.5" width="66" height="11.5" rx="4.5" fill="url(#${p}_sh)" stroke="#94a3b8" stroke-width="1.1"/>
          <polygon points="30,24 58,24 65,31 65,57 58,64 30,64 23,57 23,31" fill="url(#${p}_sh)" stroke="#e2e8f0" stroke-width="1.5" stroke-linejoin="round"/>
          <polygon points="32,27 56,27 62,33 62,55 56,61 32,61 26,55 26,33" fill="url(#${p}_gem)" stroke="#bae6fd" stroke-width="1.2"/>
          <polygon points="35,32 53,32 57,36 57,52 53,56 35,56 31,52 31,36" fill="#0f2557" stroke="#7dd3fc" stroke-width="1"/>
          <polygon points="32,27 56,27 53,32 35,32" fill="#e0f2fe" fill-opacity=".5"/>
          <polygon points="56,27 62,33 57,36 53,32" fill="#38bdf8" fill-opacity=".45"/>
          <path d="M35 53 C35.5 47 36.5 42.5 39 39.5 L40 34.5 L43.5 38 L46.2 34 L47.4 39 L53.5 41.8 L52.5 44.5 L48.8 45.2 L51.4 47.4 L47.5 48.8 L49.5 53 Z" fill="#60a5fa" stroke="#e0f2fe" stroke-width=".95" stroke-linejoin="round"/>
          <polygon points="44.2,40.4 47,41.2 44.8,42.3" fill="#ffffff"/>
          ${sparkle(60, 25, 3.8, '#bae6fd')}
          ${sparkle(25, 58, 2.8, '#c084fc')}
        `;

      /* 6. Cherry Ring — Sleek icy-silver band + 5-petal faceted pink cherry blossom + emerald leaves */
      case 'cherry':
        return `
          <defs>
            <linearGradient id="${p}_pet" x1="0" y1="-20" x2="0" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#fdf2f8"/><stop offset="35%" stop-color="#f472b6"/><stop offset="100%" stop-color="#be185d"/>
            </linearGradient>
            <linearGradient id="${p}_leaf" x1="48" y1="22" x2="68" y2="42" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#86efac"/><stop offset="100%" stop-color="#16a34a"/>
            </linearGradient>
          </defs>
          <ellipse cx="44" cy="69" rx="23" ry="4" fill="rgba(45,10,30,.42)"/>
          <rect x="11" y="39" width="66" height="10" rx="5" fill="#dbeafe" stroke="#bae6fd" stroke-width="1.2"/>
          <rect x="15" y="41" width="58" height="2.4" rx="1.2" fill="#ffffff" opacity=".82"/>
          <path d="M53 31 C60 22 68 24 67 31 C64 36 57 36 53 31Z" fill="url(#${p}_leaf)" stroke="#dcfce7" stroke-width=".8"/>
          <path d="M55 51 C62 50 67 55 64 60 C59 61 55 57 55 51Z" fill="url(#${p}_leaf)" stroke="#dcfce7" stroke-width=".8"/>
          <path d="M23 51 C27 57 24 63 19 60 C18 55 20 52 23 51Z" fill="url(#${p}_leaf)" stroke="#dcfce7" stroke-width=".7"/>
          <g transform="translate(44,44)">
            ${[0, 72, 144, 216, 288].map(a => `
              <g transform="rotate(${a})">
                <path d="M0 0 C-8.5 -6 -10 -18.5 0 -20.5 C10 -18.5 8.5 -6 0 0Z" fill="url(#${p}_pet)" stroke="#fbcfe8" stroke-width="1.1"/>
                <path d="M0 -3 L-4.2 -13.5 L0 -18.5 L4.2 -13.5 Z" fill="#ffffff" fill-opacity=".35"/>
                <line x1="0" y1="-2" x2="0" y2="-17" stroke="#9d174d" stroke-opacity=".42" stroke-width=".9"/>
              </g>
            `).join('')}
            <polygon points="0,-7 6.5,0 0,7 -6.5,0" fill="#e0f2fe" stroke="#ffffff" stroke-width="1.2"/>
            <polygon points="0,-4 3.5,0 0,4 -3.5,0" fill="#ffffff" fill-opacity=".86"/>
          </g>
          ${sparkle(25, 22, 4.4, '#ffffff')}
          ${sparkle(66, 49, 2.8, '#fbcfe8')}
        `;

      /* 7. Butterfly Ring — Sculpted glossy golden band + dimensional golden ribbon bow with diamond center */
      case 'butterfly':
        return `
          <defs>
            <linearGradient id="${p}_gld" x1="14" y1="20" x2="74" y2="66" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#fef9c3"/><stop offset="34%" stop-color="#facc15"/><stop offset="76%" stop-color="#ca8a04"/><stop offset="100%" stop-color="#fef08a"/>
            </linearGradient>
            <linearGradient id="${p}_bow" x1="18" y1="24" x2="70" y2="48" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#fffbeb"/><stop offset="45%" stop-color="#fbbf24"/><stop offset="100%" stop-color="#b45309"/>
            </linearGradient>
          </defs>
          <ellipse cx="44" cy="69" rx="24" ry="4.2" fill="rgba(45,25,0,.45)"/>
          <ellipse cx="44" cy="51" rx="23" ry="12.5" fill="none" stroke="rgba(80,40,0,.45)" stroke-width="6.4" transform="translate(0,1.6)"/>
          <ellipse cx="44" cy="50" rx="23" ry="12.5" fill="none" stroke="url(#${p}_gld)" stroke-width="5.2"/>
          <ellipse cx="44" cy="50" rx="23" ry="12.5" fill="none" stroke="#ffffff" stroke-opacity=".55" stroke-width="1.2" stroke-dasharray="18 42"/>
          <path d="M44 37 C34 24 20 26 19 37 C18 45 31 46 44 41 Z" fill="url(#${p}_bow)" stroke="#fef9c3" stroke-width="1.2"/>
          <path d="M44 37 C54 24 68 26 69 37 C70 45 57 46 44 41 Z" fill="url(#${p}_bow)" stroke="#fef9c3" stroke-width="1.2"/>
          <path d="M42 40 L27 51 L33 53 L43 44 Z" fill="#eab308" stroke="#fef08a" stroke-width=".9"/>
          <path d="M46 40 L61 51 L55 53 L45 44 Z" fill="#eab308" stroke="#fef08a" stroke-width=".9"/>
          <rect x="40.5" y="31.5" width="7" height="14" rx="3.2" fill="#f8fafc" stroke="#fef08a" stroke-width="1"/>
          <circle cx="44" cy="35" r="1.4" fill="#bae6fd"/><circle cx="44" cy="38.5" r="1.4" fill="#ffffff"/><circle cx="44" cy="42" r="1.4" fill="#bae6fd"/>
          ${sparkle(65, 23, 3.8, '#fef08a')}
          ${sparkle(22, 27, 2.8, '#ffffff')}
        `;

      /* 8. Crystal Ring — Elegant upright platinum solitaire ring + crisp cyan crystal */
      case 'crystal':
        return `
          <defs>
            <linearGradient id="${p}_sil" x1="20" y1="24" x2="68" y2="74" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#ffffff"/><stop offset="40%" stop-color="#e2e8f0"/><stop offset="78%" stop-color="#94a3b8"/><stop offset="100%" stop-color="#f8fafc"/>
            </linearGradient>
            <linearGradient id="${p}_cry" x1="32" y1="12" x2="56" y2="30" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#ffffff"/><stop offset="35%" stop-color="#bae6fd"/><stop offset="78%" stop-color="#0ea5e9"/><stop offset="100%" stop-color="#0369a1"/>
            </linearGradient>
          </defs>
          <ellipse cx="44" cy="74" rx="18" ry="3.5" fill="rgba(4,18,40,.42)"/>
          <circle cx="44" cy="50" r="19" fill="none" stroke="rgba(8,22,48,.4)" stroke-width="6.4" transform="translate(0,1.5)"/>
          <circle cx="44" cy="49.5" r="19" fill="none" stroke="url(#${p}_sil)" stroke-width="5"/>
          <circle cx="44" cy="49.5" r="19" fill="none" stroke="#ffffff" stroke-opacity=".7" stroke-width="1.2" stroke-dasharray="20 46"/>
          <path d="M37 29 L41 34 L47 34 L51 29" fill="none" stroke="#e2e8f0" stroke-width="2.2" stroke-linecap="round"/>
          <polygon points="36,15 52,15 57,21 44,32 31,21" fill="url(#${p}_cry)" stroke="#ffffff" stroke-width="1.2" stroke-linejoin="round"/>
          <polygon points="39,15 49,15 47,21 41,21" fill="#ffffff" fill-opacity=".68"/>
          <polygon points="41,21 47,21 44,32" fill="#e0f2fe" fill-opacity=".5"/>
          <path d="M31 21h26" stroke="#ffffff" stroke-opacity=".8" stroke-width=".95"/>
          ${sparkle(57, 13, 4.2, '#ffffff')}
          ${sparkle(28, 22, 2.5, '#bae6fd')}
        `;

      /* 9. Eternal Devotion Ring — Braided gold-violet band + iridescent crystal orb with glowing heart + swirling ribbons */
      case 'eternal_devotion':
        return `
          <defs>
            <linearGradient id="${p}_band" x1="14" y1="34" x2="74" y2="68" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#fef08a"/><stop offset="48%" stop-color="#f59e0b"/><stop offset="100%" stop-color="#e9d5ff"/>
            </linearGradient>
            <radialGradient id="${p}_orb" cx="35%" cy="28%" r="70%">
              <stop offset="0%" stop-color="#ffffff"/><stop offset="35%" stop-color="#e0f2fe"/><stop offset="68%" stop-color="#c084fc"/><stop offset="100%" stop-color="#4c1d95"/>
            </radialGradient>
          </defs>
          <ellipse cx="44" cy="70" rx="25" ry="4.5" fill="rgba(16,6,42,.5)"/>
          <ellipse cx="44" cy="53" rx="23.5" ry="12" fill="none" stroke="url(#${p}_band)" stroke-width="4.8"/>
          <ellipse cx="44" cy="53" rx="23.5" ry="12" fill="none" stroke="#ffffff" stroke-opacity=".55" stroke-width="1.2" stroke-dasharray="16 40"/>
          <path d="M18 46 C26 30 62 30 70 46" fill="none" stroke="#f0abfc" stroke-width="3" stroke-linecap="round" opacity=".82"/>
          <path d="M16 42 C28 54 60 54 72 42" fill="none" stroke="#fde047" stroke-width="2.2" stroke-linecap="round" opacity=".9"/>
          <circle cx="44" cy="36" r="14.5" fill="url(#${p}_orb)" stroke="#ffffff" stroke-width="1.4"/>
          <ellipse cx="44" cy="36" rx="21" ry="6.5" transform="rotate(-18 44 36)" fill="none" stroke="#fef08a" stroke-width="1.8" stroke-opacity=".85"/>
          <path d="M44 43.2 C37.5 39 36.5 32.5 40.5 30.8 C42.4 30 43.6 31.2 44 32.4 C44.4 31.2 45.6 30 47.5 30.8 C51.5 32.5 50.5 39 44 43.2Z" fill="#f472b6" stroke="#ffffff" stroke-width="1"/>
          <path d="M51 63.5 C48.5 62 48 59.5 49.8 59 C50.5 58.8 51 59.4 51 59.4 C51 59.4 51.5 58.8 52.2 59 C54 59.5 53.5 62 51 63.5Z" fill="#e0f2fe" stroke="#ffffff" stroke-width=".6"/>
          ${sparkle(22, 26, 4.2, '#fef08a')}
          ${sparkle(67, 24, 4, '#ffffff')}
        `;

      /* 10. Cupid's Ring — Golden halo band + winged cherub Cupid cradling a faceted pink heart */
      case 'cupid':
        return `
          <defs>
            <linearGradient id="${p}_gold" x1="16" y1="36" x2="72" y2="68" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#fef08a"/><stop offset="55%" stop-color="#f59e0b"/><stop offset="100%" stop-color="#b45309"/>
            </linearGradient>
            <linearGradient id="${p}_hrt" x1="34" y1="42" x2="54" y2="62" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#fbcfe8"/><stop offset="45%" stop-color="#f43f5e"/><stop offset="100%" stop-color="#be123c"/>
            </linearGradient>
          </defs>
          <ellipse cx="44" cy="70" rx="23" ry="4" fill="rgba(35,10,45,.42)"/>
          <ellipse cx="44" cy="54" rx="22" ry="11.5" fill="none" stroke="url(#${p}_gold)" stroke-width="4.4"/>
          <path d="M29 44 C18 42 14 33 17 28 C22 29 27 33 32 38Z" fill="#ffffff" stroke="#fde68a" stroke-width="1.1"/>
          <path d="M59 44 C70 42 74 33 71 28 C66 29 61 33 56 38Z" fill="#ffffff" stroke="#fde68a" stroke-width="1.1"/>
          <circle cx="44" cy="34" r="11.5" fill="#ffe4cc" stroke="#f59e0b" stroke-width=".9"/>
          <path d="M32 32 C32 22 40 19 44 19 C48 19 56 22 56 32 C52 28 47 26 44 26 C41 26 36 28 32 32Z" fill="#facc15" stroke="#d97706" stroke-width="1"/>
          <path d="M34 22 C39 18 49 18 54 22" fill="none" stroke="#fef08a" stroke-width="2.4" stroke-linecap="round"/>
          <circle cx="39.5" cy="35" r="1.4" fill="#3f2a1d"/><circle cx="48.5" cy="35" r="1.4" fill="#3f2a1d"/>
          <ellipse cx="36.8" cy="37.5" rx="2.1" ry="1.1" fill="#fb7185" opacity=".55"/>
          <ellipse cx="51.2" cy="37.5" rx="2.1" ry="1.1" fill="#fb7185" opacity=".55"/>
          <path d="M44 62.5 C34 56 32 48.5 37.5 45.8 C40.5 44.3 43 46 44 47.8 C45 46 47.5 44.3 50.5 45.8 C56 48.5 54 56 44 62.5Z" fill="url(#${p}_hrt)" stroke="#ffffff" stroke-width="1.3"/>
          <polygon points="44,48 48.5,52 44,59 39.5,52" fill="#ffffff" fill-opacity=".35"/>
          ${sparkle(65, 20, 4.4, '#ffffff')}
          ${sparkle(21, 22, 2.8, '#fef08a')}
        `;

      /* 11. Starry Encounter — Enchanted lavender scallop-shell ring cradling luminous cosmic pearl + stars */
      case 'starry_encounter':
        return `
          <defs>
            <linearGradient id="${p}_shl" x1="20" y1="18" x2="68" y2="54" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#f5d0fe"/><stop offset="48%" stop-color="#c084fc"/><stop offset="100%" stop-color="#7e22ce"/>
            </linearGradient>
            <radialGradient id="${p}_prl" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stop-color="#ffffff"/><stop offset="40%" stop-color="#f9a8d4"/><stop offset="80%" stop-color="#db2777"/><stop offset="100%" stop-color="#701a75"/>
            </radialGradient>
            <linearGradient id="${p}_bnd" x1="16" y1="42" x2="72" y2="68" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#e0f2fe"/><stop offset="50%" stop-color="#c4b5fd"/><stop offset="100%" stop-color="#60a5fa"/>
            </linearGradient>
          </defs>
          <ellipse cx="44" cy="70" rx="25" ry="4.2" fill="rgba(18,6,48,.5)"/>
          <ellipse cx="44" cy="54" rx="22.5" ry="11.5" fill="none" stroke="url(#${p}_bnd)" stroke-width="5.2"/>
          <ellipse cx="44" cy="54" rx="22.5" ry="11.5" fill="none" stroke="#ffffff" stroke-opacity=".65" stroke-width="1.2" stroke-dasharray="18 40"/>
          <path d="M21 44 C20 28 31 20 44 20 C57 20 68 28 67 44 C59 50 29 50 21 44Z" fill="url(#${p}_shl)" stroke="#ffffff" stroke-width="1.3"/>
          <path d="M44 20v26M34 23l4 23M54 23l-4 23M26 30l6 16M62 30l-6 16" stroke="#ffffff" stroke-opacity=".42" stroke-width="1.1"/>
          <circle cx="44" cy="40" r="8.8" fill="url(#${p}_prl)" stroke="#ffffff" stroke-width="1.1"/>
          <circle cx="41" cy="36.8" r="2.6" fill="#ffffff" opacity=".82"/>
          <polygon points="22,22 24.4,26.8 29.5,27.5 25.8,31 26.8,36 22,33.5 17.2,36 18.2,31 14.5,27.5 19.6,26.8" fill="#f9a8d4" stroke="#ffffff" stroke-width=".9"/>
          ${sparkle(67, 29, 4.4, '#bae6fd')}
          ${sparkle(48, 15, 3.2, '#ffffff')}
        `;

      /* 12. Starry Beloved — Celestial twin light-arcs orbiting rose-nebula Saturn planet + star crest */
      case 'starry_beloved':
        return `
          <defs>
            <radialGradient id="${p}_pl" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stop-color="#fff1f2"/><stop offset="38%" stop-color="#f472b6"/><stop offset="78%" stop-color="#9333ea"/><stop offset="100%" stop-color="#3b0764"/>
            </radialGradient>
            <linearGradient id="${p}_arc" x1="16" y1="20" x2="72" y2="66" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#bae6fd"/><stop offset="50%" stop-color="#e879f9"/><stop offset="100%" stop-color="#60a5fa"/>
            </linearGradient>
          </defs>
          <ellipse cx="44" cy="71" rx="23" ry="4" fill="rgba(15,6,46,.5)"/>
          <ellipse cx="44" cy="50" rx="22" ry="13.5" fill="none" stroke="url(#${p}_arc)" stroke-width="4.2"/>
          <path d="M22 46 C18 28 32 16 44 20 C33 23 26 32 28 45Z" fill="#e0f2fe" fill-opacity=".82" stroke="#c084fc" stroke-width="1"/>
          <path d="M66 46 C70 28 56 16 44 20 C55 23 62 32 60 45Z" fill="#f5d0fe" fill-opacity=".82" stroke="#60a5fa" stroke-width="1"/>
          <circle cx="44" cy="39" r="10.2" fill="url(#${p}_pl)" stroke="#ffffff" stroke-width="1.2"/>
          <ellipse cx="44" cy="39" rx="19.5" ry="5.6" transform="rotate(-16 44 39)" fill="none" stroke="#fef08a" stroke-width="2" stroke-opacity=".9"/>
          <path d="M44 57l2.5 5 5.5 2.5-5.5 2.5-2.5 5-2.5-5-5.5-2.5 5.5-2.5Z" fill="#bae6fd" stroke="#ffffff" stroke-width=".9"/>
          ${sparkle(66, 20, 4.6, '#ffffff')}
          ${sparkle(20, 24, 3.4, '#fef08a')}
        `;

      /* 13. Golden Hoop Ring — Imperial open-scroll double-curl golden filigree hoop */
      case 'golden_hoop':
        return `
          <defs>
            <linearGradient id="${p}_gh" x1="14" y1="22" x2="74" y2="66" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#fffbeb"/><stop offset="28%" stop-color="#fde047"/><stop offset="68%" stop-color="#f59e0b"/><stop offset="100%" stop-color="#b45309"/>
            </linearGradient>
          </defs>
          <ellipse cx="44" cy="69" rx="24" ry="4.2" fill="rgba(40,18,0,.48)"/>
          <path d="M39 36 C39 24 23 22 21 32 C19 42 26 42 29 36 C25 36 25 31 29 30 C33 29 35 34 34 40 C22 43 17 50 20 58 C24 66 64 66 68 58 C71 50 66 43 54 40 C53 34 55 29 59 30 C63 31 63 36 59 36 C62 42 69 42 67 32 C65 22 49 24 49 36" fill="none" stroke="rgba(70,30,0,.45)" stroke-width="8" stroke-linecap="round" transform="translate(0,1.6)"/>
          <path d="M39 36 C39 24 23 22 21 32 C19 42 26 42 29 36 C25 36 25 31 29 30 C33 29 35 34 34 40 C22 43 17 50 20 58 C24 66 64 66 68 58 C71 50 66 43 54 40 C53 34 55 29 59 30 C63 31 63 36 59 36 C62 42 69 42 67 32 C65 22 49 24 49 36" fill="none" stroke="url(#${p}_gh)" stroke-width="6.2" stroke-linecap="round"/>
          <path d="M24 58 C34 62 54 62 64 58" fill="none" stroke="#ffffff" stroke-opacity=".68" stroke-width="1.6" stroke-linecap="round"/>
          <circle cx="30" cy="31" r="2" fill="#fffbeb"/><circle cx="58" cy="31" r="2" fill="#fffbeb"/>
          ${sparkle(44, 23, 4.2, '#fef08a')}
          ${sparkle(68, 42, 2.8, '#ffffff')}
        `;

      /* 14. Golden Lotus Ring — Luminous rose-gold ring + blooming amber-gold lotus + silk ribbons */
      case 'golden_lotus':
        return `
          <defs>
            <linearGradient id="${p}_lt" x1="22" y1="16" x2="66" y2="56" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#fef9c3"/><stop offset="44%" stop-color="#fb923c"/><stop offset="100%" stop-color="#e11d48"/>
            </linearGradient>
            <linearGradient id="${p}_rb" x1="16" y1="36" x2="72" y2="70" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#fef08a"/><stop offset="55%" stop-color="#f472b6"/><stop offset="100%" stop-color="#f59e0b"/>
            </linearGradient>
          </defs>
          <ellipse cx="44" cy="70" rx="24" ry="4.2" fill="rgba(25,10,45,.45)"/>
          <ellipse cx="44" cy="52" rx="21.5" ry="11.5" fill="none" stroke="url(#${p}_rb)" stroke-width="4.4"/>
          <path d="M40 54 C36 62 44 68 51 73 C49 65 48 59 45 54Z" fill="#fde047" opacity=".88"/>
          <path d="M44 16 C37 26 36 38 44 45 C52 38 51 26 44 16Z" fill="url(#${p}_lt)" stroke="#fef9c3" stroke-width="1.1"/>
          <path d="M44 45 C32 42 23 32 23 23 C33 25 40 33 44 45Z" fill="url(#${p}_lt)" stroke="#fef9c3" stroke-width="1.1"/>
          <path d="M44 45 C56 42 65 32 65 23 C55 25 48 33 44 45Z" fill="url(#${p}_lt)" stroke="#fef9c3" stroke-width="1.1"/>
          <path d="M44 46 C28 48 20 40 19 33 C28 34 36 39 44 46Z" fill="#fb923c" stroke="#fef08a" stroke-width="1"/>
          <path d="M44 46 C60 48 68 40 69 33 C60 34 52 39 44 46Z" fill="#fb923c" stroke="#fef08a" stroke-width="1"/>
          <circle cx="44" cy="40" r="4.2" fill="#fffbeb" stroke="#f59e0b" stroke-width="1"/>
          ${sparkle(25, 19, 4.4, '#fef08a')}
          ${sparkle(66, 26, 3.2, '#ffffff')}
        `;

      /* 15. Ice and Fire Ring — Opalescent icy band flanked by sharp blue ice shards + blazing central flame */
      case 'ice_fire':
        return `
          <defs>
            <linearGradient id="${p}_ice" x1="16" y1="20" x2="72" y2="64" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#ffffff"/><stop offset="45%" stop-color="#7dd3fc"/><stop offset="100%" stop-color="#0284c7"/>
            </linearGradient>
            <linearGradient id="${p}_fir" x1="44" y1="16" x2="44" y2="48" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#fef08a"/><stop offset="45%" stop-color="#f97316"/><stop offset="100%" stop-color="#dc2626"/>
            </linearGradient>
          </defs>
          <ellipse cx="44" cy="70" rx="23" ry="4" fill="rgba(5,20,42,.45)"/>
          <ellipse cx="44" cy="53" rx="20.5" ry="12" fill="none" stroke="url(#${p}_ice)" stroke-width="5"/>
          <ellipse cx="44" cy="53" rx="20.5" ry="12" fill="none" stroke="#ffffff" stroke-opacity=".7" stroke-width="1.2" stroke-dasharray="18 38"/>
          <polygon points="34,42 20,24 27,37 16,38 28,46 19,53 33,50" fill="url(#${p}_ice)" stroke="#ffffff" stroke-width="1" stroke-linejoin="round"/>
          <polygon points="54,42 68,24 61,37 72,38 60,46 69,53 55,50" fill="url(#${p}_ice)" stroke="#ffffff" stroke-width="1" stroke-linejoin="round"/>
          <path d="M44 17 C51 26 55 34 52 42 C50 47 38 47 36 42 C33 34 37 26 44 17Z" fill="url(#${p}_fir)" stroke="#fef08a" stroke-width="1.2"/>
          <path d="M44 26 C48 31 49 36 47 41 C45 43 43 43 41 41 C39 36 40 31 44 26Z" fill="#fef08a" opacity=".88"/>
          ${sparkle(65, 22, 4.2, '#bae6fd')}
          ${sparkle(25, 20, 3, '#fde047')}
        `;

      /* 16. Paradise Castle Ring — Silver-sapphire frame housing fairy-tale castle + golden crown */
      case 'paradise_castle':
        return `
          <defs>
            <linearGradient id="${p}_pt" x1="16" y1="24" x2="72" y2="70" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#ffffff"/><stop offset="48%" stop-color="#bae6fd"/><stop offset="100%" stop-color="#3b82f6"/>
            </linearGradient>
            <linearGradient id="${p}_sky" x1="30" y1="26" x2="58" y2="54" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#60a5fa"/><stop offset="60%" stop-color="#2563eb"/><stop offset="100%" stop-color="#1e3a8a"/>
            </linearGradient>
          </defs>
          <ellipse cx="44" cy="72" rx="22" ry="4" fill="rgba(8,14,42,.48)"/>
          <path d="M25 42 C16 50 18 65 36 67 M63 42 C72 50 70 65 52 67" fill="none" stroke="url(#${p}_pt)" stroke-width="5.2" stroke-linecap="round"/>
          <rect x="27" y="25" width="34" height="28" rx="6.5" fill="url(#${p}_pt)" stroke="#ffffff" stroke-width="1.4"/>
          <rect x="30.5" y="28.5" width="27" height="21" rx="4" fill="url(#${p}_sky)" stroke="#93c5fd" stroke-width="1"/>
          <path d="M34 48 V38 h3 v3 h3 v-6 l4 -4 l4 4 v6 h3 v-3 h3 v10 Z" fill="#e0f2fe" stroke="#ffffff" stroke-width=".7" stroke-linejoin="round"/>
          <rect x="42.2" y="42" width="3.6" height="6" rx="1.8" fill="#1d4ed8"/>
          <polygon points="36,24 38,17 41.5,21 44,15.5 46.5,21 50,17 52,24" fill="#fde047" stroke="#b45309" stroke-width=".8" stroke-linejoin="round"/>
          ${sparkle(60, 58, 5, '#ffffff')}
          ${sparkle(25, 22, 3.2, '#fef08a')}
        `;

      /* 17. Dream Yacht Ring — Midnight-plum cosmic ring + glowing luxury yacht + golden wave trails */
      case 'dream_yacht':
        return `
          <defs>
            <linearGradient id="${p}_wv" x1="14" y1="20" x2="74" y2="68" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#fef08a"/><stop offset="45%" stop-color="#e879f9"/><stop offset="100%" stop-color="#7c3aed"/>
            </linearGradient>
            <linearGradient id="${p}_yh" x1="24" y1="30" x2="64" y2="54" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#ffffff"/><stop offset="50%" stop-color="#f5d0fe"/><stop offset="100%" stop-color="#a855f7"/>
            </linearGradient>
          </defs>
          <circle cx="44" cy="44" r="24" fill="rgba(168,85,247,.18)" stroke="url(#${p}_wv)" stroke-width="3.2"/>
          <path d="M22 52 C14 36 26 18 46 20" fill="none" stroke="#fde047" stroke-width="2.6" stroke-linecap="round"/>
          <path d="M66 36 C74 52 60 68 38 66" fill="none" stroke="#f0abfc" stroke-width="2.6" stroke-linecap="round"/>
          <path d="M25 46 L63 44 L56 54 L31 54 Z" fill="url(#${p}_yh)" stroke="#ffffff" stroke-width="1.2" stroke-linejoin="round"/>
          <path d="M31 39 L55 38 L58 44 L29 45 Z" fill="#c084fc" stroke="#ffffff" stroke-width=".9"/>
          <path d="M36 33 L50 33 L52 38 L34 38 Z" fill="#fef08a" opacity=".92"/>
          <path d="M24 57 C36 61 52 61 64 56" fill="none" stroke="#fde047" stroke-width="2.2" stroke-linecap="round"/>
          ${sparkle(62, 22, 4.4, '#fef08a')}
          ${sparkle(24, 60, 3.4, '#f0abfc')}
        `;

      /* 18. Hope Arc Ring — Sculpted golden bow & crystal arrow flanked by glowing aqua angel wings */
      case 'hope_arc':
        return `
          <defs>
            <linearGradient id="${p}_wg" x1="10" y1="22" x2="78" y2="56" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#ffffff"/><stop offset="50%" stop-color="#67e8f9"/><stop offset="100%" stop-color="#0284c7"/>
            </linearGradient>
            <linearGradient id="${p}_bw" x1="22" y1="26" x2="66" y2="64" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#fef9c3"/><stop offset="50%" stop-color="#f59e0b"/><stop offset="100%" stop-color="#b45309"/>
            </linearGradient>
          </defs>
          <ellipse cx="44" cy="70" rx="22" ry="4" fill="rgba(6,34,48,.42)"/>
          <path d="M38 42 C24 34 15 36 12 46 C20 48 28 49 36 47 Z" fill="url(#${p}_wg)" stroke="#ffffff" stroke-width=".9"/>
          <path d="M50 42 C64 34 73 36 76 46 C68 48 60 49 52 47 Z" fill="url(#${p}_wg)" stroke="#ffffff" stroke-width=".9"/>
          <path d="M22 46 C28 24 60 24 66 46 C58 58 30 58 22 46Z" fill="none" stroke="url(#${p}_bw)" stroke-width="4.4" stroke-linejoin="round"/>
          <path d="M44 17 V59" stroke="#e0f2fe" stroke-width="2.2" stroke-linecap="round"/>
          <polygon points="44,12 49,21 44,19 39,21" fill="#ffffff" stroke="#22d3ee" stroke-width=".9"/>
          <circle cx="44" cy="39" r="5" fill="#67e8f9" stroke="#fef08a" stroke-width="1.5"/>
          ${sparkle(44, 15, 3.8, '#ffffff')}
          ${sparkle(67, 29, 3, '#fef08a')}
        `;

      /* 19. Flower Ring — Twin interlocking emerald vine bands with pink wildflower blossoms */
      case 'flower':
        return `
          <defs>
            <linearGradient id="${p}_vn" x1="12" y1="24" x2="76" y2="66" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#86efac"/><stop offset="55%" stop-color="#22c55e"/><stop offset="100%" stop-color="#15803d"/>
            </linearGradient>
          </defs>
          <ellipse cx="44" cy="69" rx="25" ry="4" fill="rgba(20,40,20,.38)"/>
          <circle cx="34" cy="46" r="15.5" fill="none" stroke="url(#${p}_vn)" stroke-width="4.4"/>
          <circle cx="54" cy="46" r="15.5" fill="none" stroke="url(#${p}_vn)" stroke-width="4.4"/>
          <g fill="#4ade80" stroke="#166534" stroke-width=".6">
            <ellipse cx="21" cy="38" rx="4.5" ry="2.2" transform="rotate(-35 21 38)"/>
            <ellipse cx="22" cy="54" rx="4.5" ry="2.2" transform="rotate(30 22 54)"/>
            <ellipse cx="44" cy="56" rx="4.8" ry="2.2" transform="rotate(-15 44 56)"/>
            <ellipse cx="67" cy="40" rx="4.5" ry="2.2" transform="rotate(35 67 40)"/>
            <ellipse cx="64" cy="56" rx="4.5" ry="2.2" transform="rotate(-30 64 56)"/>
          </g>
          <g transform="translate(49,33)">
            ${[0, 72, 144, 216, 288].map(a => `<circle cx="0" cy="-4.6" r="3.4" fill="#f472b6" transform="rotate(${a})"/>`).join('')}
            <circle cx="0" cy="0" r="2.2" fill="#fef08a"/>
          </g>
          <g transform="translate(36,30) scale(0.75)">
            ${[0, 72, 144, 216, 288].map(a => `<circle cx="0" cy="-4.6" r="3.4" fill="#fbcfe8" transform="rotate(${a})"/>`).join('')}
            <circle cx="0" cy="0" r="2.2" fill="#fde047"/>
          </g>
          <g transform="translate(59,36) scale(0.68)">
            ${[0, 72, 144, 216, 288].map(a => `<circle cx="0" cy="-4.6" r="3.4" fill="#f9a8d4" transform="rotate(${a})"/>`).join('')}
            <circle cx="0" cy="0" r="2.2" fill="#fef08a"/>
          </g>
          ${sparkle(25, 25, 3.2, '#ffffff')}
        `;

      /* 20. Platinum Ring — Twin mirror-polished cool platinum/lavender bands + diamond glint */
      case 'platinum':
        return `
          <defs>
            <linearGradient id="${p}_pl1" x1="12" y1="22" x2="54" y2="66" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#ffffff"/><stop offset="35%" stop-color="#c7d2fe"/><stop offset="72%" stop-color="#60a5fa"/><stop offset="100%" stop-color="#e0e7ff"/>
            </linearGradient>
            <linearGradient id="${p}_pl2" x1="34" y1="22" x2="76" y2="66" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#ffffff"/><stop offset="38%" stop-color="#e0e7ff"/><stop offset="75%" stop-color="#818cf8"/><stop offset="100%" stop-color="#f8fafc"/>
            </linearGradient>
          </defs>
          <ellipse cx="44" cy="69" rx="25" ry="4" fill="rgba(10,16,45,.42)"/>
          <circle cx="34" cy="46" r="16.2" fill="none" stroke="url(#${p}_pl1)" stroke-width="4.4"/>
          <circle cx="34" cy="46" r="16.2" fill="none" stroke="#ffffff" stroke-opacity=".75" stroke-width="1.2" stroke-dasharray="18 42"/>
          <circle cx="54" cy="46" r="16.2" fill="none" stroke="url(#${p}_pl2)" stroke-width="4.4"/>
          <circle cx="54" cy="46" r="16.2" fill="none" stroke="#ffffff" stroke-opacity=".75" stroke-width="1.2" stroke-dasharray="18 42"/>
          <circle cx="54" cy="29.8" r="2.4" fill="#e0f2fe" stroke="#ffffff" stroke-width="1"/>
          ${sparkle(54, 29.8, 5, '#ffffff')}
          ${sparkle(23, 33, 2.6, '#bae6fd')}
        `;

      /* 21. Crown Ring — Regal silver-platinum tiara ring + royal amethyst heart + pavé arches */
      case 'crown':
        return `
          <defs>
            <linearGradient id="${p}_cr" x1="14" y1="20" x2="74" y2="66" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#ffffff"/><stop offset="45%" stop-color="#e2e8f0"/><stop offset="100%" stop-color="#94a3b8"/>
            </linearGradient>
            <linearGradient id="${p}_am" x1="30" y1="26" x2="58" y2="58" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#f5d0fe"/><stop offset="36%" stop-color="#a855f7"/><stop offset="78%" stop-color="#5b21b6"/><stop offset="100%" stop-color="#2e1065"/>
            </linearGradient>
          </defs>
          <ellipse cx="44" cy="70" rx="25" ry="4.5" fill="rgba(10,12,42,.48)"/>
          <path d="M18 52 C22 34 32 24 44 20 C56 24 66 34 70 52 C60 63 28 63 18 52Z" fill="none" stroke="url(#${p}_cr)" stroke-width="5.2" stroke-linejoin="round"/>
          <path d="M21 52 C32 61 56 61 67 52" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-dasharray="2 3" stroke-linecap="round"/>
          <path d="M44 54.5 C31 46.5 29 36.5 35.8 32.8 C39.5 30.8 42.6 32.6 44 35.2 C45.4 32.6 48.5 30.8 52.2 32.8 C59 36.5 57 46.5 44 54.5Z" fill="url(#${p}_am)" stroke="#ffffff" stroke-width="1.5"/>
          <polygon points="44,35.5 49.5,41 44,50.5 38.5,41" fill="#ffffff" fill-opacity=".35"/>
          <circle cx="44" cy="21" r="3.8" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.1"/>
          <circle cx="28" cy="34" r="2.2" fill="#ffffff"/><circle cx="60" cy="34" r="2.2" fill="#ffffff"/>
          ${sparkle(65, 22, 4.6, '#ffffff')}
          ${sparkle(22, 27, 2.8, '#e9d5ff')}
        `;

      /* 22. I Do Ring — Haute-joaillerie platinum ring + cushion pink diamond + clover pavé halo */
      case 'i_do':
        return `
          <defs>
            <linearGradient id="${p}_pk" x1="28" y1="24" x2="60" y2="60" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#fff1f2"/><stop offset="40%" stop-color="#f9a8d4"/><stop offset="78%" stop-color="#ec4899"/><stop offset="100%" stop-color="#9d174d"/>
            </linearGradient>
          </defs>
          <ellipse cx="44" cy="70" rx="22" ry="4" fill="rgba(20,10,42,.45)"/>
          <rect x="12" y="39.5" width="64" height="9" rx="4.5" fill="#e2e8f0" stroke="#ffffff" stroke-width="1"/>
          <circle cx="19" cy="44" r="2.4" fill="#f472b6" stroke="#ffffff" stroke-width=".8"/>
          <circle cx="69" cy="44" r="2.4" fill="#f472b6" stroke="#ffffff" stroke-width=".8"/>
          <path d="M44 19 L55 28 L66 44 L55 60 L44 69 L33 60 L22 44 L33 28 Z" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.4" stroke-linejoin="round"/>
          <path d="M44 21 L54 29 L63 44 L54 59 L44 67 L34 59 L25 44 L34 29 Z" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-dasharray="1.8 2.8" stroke-linecap="round"/>
          <polygon points="44,25 56,34 56,54 44,63 32,54 32,34" fill="url(#${p}_pk)" stroke="#ffffff" stroke-width="1.2"/>
          <polygon points="44,29 52,37 52,51 44,59 36,51 36,37" fill="#ffffff" fill-opacity=".35"/>
          <path d="M32 44h24M44 25v38" stroke="#ffffff" stroke-opacity=".55" stroke-width=".9"/>
          ${sparkle(60, 22, 4.4, '#ffffff')}
          ${sparkle(26, 58, 3, '#fbcfe8')}
        `;

      /* 23. Feathers Ring — Silver-platinum baroque wings embracing pear iridescent aurora fire-opal */
      case 'feathers':
        return `
          <defs>
            <linearGradient id="${p}_op" x1="34" y1="24" x2="54" y2="56" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#67e8f9"/><stop offset="32%" stop-color="#c084fc"/><stop offset="65%" stop-color="#fb7185"/><stop offset="100%" stop-color="#fde047"/>
            </linearGradient>
          </defs>
          <ellipse cx="44" cy="70" rx="22" ry="4" fill="rgba(20,10,45,.45)"/>
          <ellipse cx="44" cy="54" rx="19" ry="11" fill="none" stroke="#e2e8f0" stroke-width="4.4"/>
          <path d="M34 45 C22 41 14 31 15 24 C22 27 28 31 35 37 Z" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1"/>
          <path d="M33 49 C22 48 16 41 18 35 C24 38 29 41 34 44 Z" fill="#e2e8f0" stroke="#ffffff" stroke-width=".9"/>
          <path d="M54 45 C66 41 74 31 73 24 C66 27 60 31 53 37 Z" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1"/>
          <path d="M55 49 C66 48 72 41 70 35 C64 38 59 41 54 44 Z" fill="#e2e8f0" stroke="#ffffff" stroke-width=".9"/>
          <path d="M44 24 C51 34 54 42 52 48 C50 53 38 53 36 48 C34 42 37 34 44 24Z" fill="url(#${p}_op)" stroke="#ffffff" stroke-width="1.5"/>
          <path d="M44 28 C47 35 48 41 44 48 C40 41 41 35 44 28Z" fill="#ffffff" fill-opacity=".42"/>
          <circle cx="44" cy="21" r="2.2" fill="#ffffff"/>
          ${sparkle(65, 22, 4.2, '#ffffff')}
          ${sparkle(22, 23, 3, '#bae6fd')}
        `;

      /* 24. Darry Ring — Iconic heart-halo white diamond with double-row pavé heart border */
      case 'darry':
        return `
          <defs>
            <linearGradient id="${p}_dr" x1="28" y1="24" x2="60" y2="62" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#ffffff"/><stop offset="48%" stop-color="#e0f2fe"/><stop offset="100%" stop-color="#93c5fd"/>
            </linearGradient>
          </defs>
          <ellipse cx="44" cy="70" rx="22" ry="4" fill="rgba(10,16,44,.45)"/>
          <rect x="11" y="39" width="66" height="10" rx="5" fill="#e2e8f0" stroke="#ffffff" stroke-width="1.2"/>
          <circle cx="17.5" cy="44" r="1.8" fill="#ffffff"/><circle cx="70.5" cy="44" r="1.8" fill="#ffffff"/>
          <path d="M44 66 C24 54 20 38 29.5 31 C35.5 26.8 41.2 29.5 44 33.8 C46.8 29.5 52.5 26.8 58.5 31 C68 38 64 54 44 66Z" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.6"/>
          <path d="M44 64 C26 53 23 39 31 33 C36 29.5 41 31.8 44 35.5 C47 31.8 52 29.5 57 33 C65 39 62 53 44 64Z" fill="none" stroke="#93c5fd" stroke-width="2.1" stroke-dasharray="1.6 2.6" stroke-linecap="round"/>
          <path d="M44 58 C31 50 29 40 35 36 C38.5 33.8 42 35.5 44 38.2 C46 35.5 49.5 33.8 53 36 C59 40 57 50 44 58Z" fill="url(#${p}_dr)" stroke="#ffffff" stroke-width="1.3"/>
          <polygon points="44,38 50,43 44,54 38,43" fill="#ffffff" fill-opacity=".62"/>
          ${sparkle(56, 25, 4.4, '#ffffff')}
          ${sparkle(25, 31, 2.8, '#bae6fd')}
        `;

      /* 25. Swan Love Ring — Faceted crystal-diamond swan gliding across icy platinum pavé band */
      case 'swan_love':
        return `
          <defs>
            <linearGradient id="${p}_sw" x1="22" y1="20" x2="66" y2="58" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#ffffff"/><stop offset="46%" stop-color="#dbeafe"/><stop offset="100%" stop-color="#93c5fd"/>
            </linearGradient>
          </defs>
          <ellipse cx="44" cy="68" rx="25" ry="4" fill="rgba(45,10,32,.42)"/>
          <rect x="11" y="45" width="66" height="10.5" rx="5.2" fill="#e2e8f0" stroke="#ffffff" stroke-width="1.2"/>
          <circle cx="17" cy="50.2" r="2" fill="#bae6fd"/><circle cx="71" cy="50.2" r="2" fill="#bae6fd"/>
          <path d="M24 50 C25 41 34 38 41 39 C47 39 54 31 61 25 C61 36 58 49 52 52 L24 52 Z" fill="url(#${p}_sw)" stroke="#ffffff" stroke-width="1.3" stroke-linejoin="round"/>
          <path d="M35 45 C31 39 30 27 36 24 C40 22 44 25 43 29 C41 28 38 28 37 31 C36 35 39 40 43 43 Z" fill="#ffffff" stroke="#bae6fd" stroke-width="1.1"/>
          <polygon points="43,27 46.5,28.5 43,30" fill="#f472b6"/>
          <polygon points="44,41 56,33 54,48 41,49" fill="#ffffff" fill-opacity=".5"/>
          <polygon points="32,46 44,41 41,49 28,49" fill="#93c5fd" fill-opacity=".42"/>
          ${sparkle(48, 22, 4.2, '#ffffff')}
          ${sparkle(65, 34, 3, '#fbcfe8')}
        `;

      /* 26. Angel's Wings Ring — Polished platinum band + vivid rose-pink heart + symmetrical feathered wings */
      case 'angels_wings':
        return `
          <defs>
            <linearGradient id="${p}_awh" x1="30" y1="26" x2="58" y2="56" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#fbcfe8"/><stop offset="42%" stop-color="#f43f5e"/><stop offset="100%" stop-color="#be123c"/>
            </linearGradient>
          </defs>
          <ellipse cx="44" cy="70" rx="23" ry="4" fill="rgba(16,12,44,.45)"/>
          <ellipse cx="44" cy="51" rx="20" ry="12.5" fill="none" stroke="#e2e8f0" stroke-width="4.6"/>
          <path d="M34 40 C22 39 14 33 13 27 C21 27 28 30 35 35 Z" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
          <path d="M34 45 C22 46 16 41 16 36 C23 37 28 39 35 41 Z" fill="#f1f5f9" stroke="#cbd5e1" stroke-width=".9"/>
          <path d="M54 40 C66 39 74 33 75 27 C67 27 60 30 53 35 Z" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
          <path d="M54 45 C66 46 72 41 72 36 C65 37 60 39 53 41 Z" fill="#f1f5f9" stroke="#cbd5e1" stroke-width=".9"/>
          <path d="M44 54 C32 46.5 30 37 36.5 33.5 C40 31.6 42.8 33.4 44 35.8 C45.2 33.4 48 31.6 51.5 33.5 C58 37 56 46.5 44 54Z" fill="url(#${p}_awh)" stroke="#ffffff" stroke-width="1.4"/>
          <polygon points="44,36 49,41 44,49.5 39,41" fill="#ffffff" fill-opacity=".38"/>
          ${sparkle(65, 22, 4, '#ffffff')}
          ${sparkle(22, 24, 2.8, '#fbcfe8')}
        `;

      /* 27. Ocean Ring — Deep cobalt-sapphire faceted heart bordered by crisp white pavé diamonds */
      case 'ocean':
        return `
          <defs>
            <linearGradient id="${p}_oc" x1="28" y1="24" x2="60" y2="62" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#93c5fd"/><stop offset="42%" stop-color="#2563eb"/><stop offset="80%" stop-color="#1e3a8a"/><stop offset="100%" stop-color="#0f172a"/>
            </linearGradient>
          </defs>
          <ellipse cx="44" cy="70" rx="22" ry="4" fill="rgba(6,16,44,.45)"/>
          <rect x="11" y="39" width="66" height="10" rx="5" fill="#e2e8f0" stroke="#ffffff" stroke-width="1.1"/>
          <path d="M44 64 C26 53 23 39 31 32 C36 28 41 30.5 44 34.5 C47 30.5 52 28 57 32 C65 39 62 53 44 64Z" fill="#f8fafc" stroke="#bae6fd" stroke-width="1.5"/>
          <path d="M44 62.2 C28 52 25.5 40 32.5 33.8 C36.8 30.4 41.2 32.4 44 36 C46.8 32.4 51.2 30.4 55.5 33.8 C62.5 40 60 52 44 62.2Z" fill="none" stroke="#ffffff" stroke-width="2" stroke-dasharray="1.6 2.5" stroke-linecap="round"/>
          <path d="M44 58.5 C31 50.5 29 40.5 35 36.2 C38.5 33.8 42 35.6 44 38.4 C46 35.6 49.5 33.8 53 36.2 C59 40.5 57 50.5 44 58.5Z" fill="url(#${p}_oc)" stroke="#bae6fd" stroke-width="1.2"/>
          <polygon points="44,38.4 50,43.5 44,54 38,43.5" fill="#60a5fa" fill-opacity=".5"/>
          <polygon points="35,38 44,43.5 38,48" fill="#ffffff" fill-opacity=".3"/>
          ${sparkle(57, 25, 4.4, '#ffffff')}
          ${sparkle(27, 30, 2.8, '#7dd3fc')}
        `;

      /* --- 5 Upgraded Existing Study Game Rings --- */
      case 'ring_silver':
        return `
          <defs>
            <linearGradient id="${p}_s" x1="16" y1="22" x2="72" y2="68" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#ffffff"/><stop offset="42%" stop-color="#cbd5e1"/><stop offset="82%" stop-color="#64748b"/><stop offset="100%" stop-color="#f1f5f9"/>
            </linearGradient>
          </defs>
          <ellipse cx="44" cy="70" rx="22" ry="4" fill="rgba(8,14,28,.45)"/>
          <ellipse cx="44" cy="50" rx="21" ry="13.5" fill="none" stroke="url(#${p}_s)" stroke-width="5"/>
          <ellipse cx="44" cy="50" rx="21" ry="13.5" fill="none" stroke="#ffffff" stroke-opacity=".75" stroke-width="1.2" stroke-dasharray="18 42"/>
          <path d="M25 46 C34 38 54 38 63 46" fill="none" stroke="#e2e8f0" stroke-width="2.4" stroke-linecap="round"/>
          <polygon points="44,17 54,28 44,39 34,28" fill="#e0f2fe" stroke="#ffffff" stroke-width="1.4" stroke-linejoin="round"/>
          <polygon points="44,17 49.5,28 44,39 38.5,28" fill="#ffffff" fill-opacity=".58"/>
          ${sparkle(57, 18, 4.2, '#ffffff')}
        `;

      case 'ring_rose':
        return `
          <defs>
            <linearGradient id="${p}_rg" x1="14" y1="24" x2="74" y2="68" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#fff1f2"/><stop offset="38%" stop-color="#fda4af"/><stop offset="76%" stop-color="#e11d48"/><stop offset="100%" stop-color="#fecdd3"/>
            </linearGradient>
          </defs>
          <ellipse cx="44" cy="70" rx="23" ry="4" fill="rgba(40,8,20,.45)"/>
          <ellipse cx="44" cy="51" rx="21.5" ry="12.5" fill="none" stroke="url(#${p}_rg)" stroke-width="5"/>
          <ellipse cx="44" cy="51" rx="21.5" ry="12.5" fill="none" stroke="#ffffff" stroke-opacity=".6" stroke-width="1.2" stroke-dasharray="18 40"/>
          <path d="M44 43 C32 36 31 26.5 37.5 23.5 C40.5 22 43 23.8 44 26 C45 23.8 47.5 22 50.5 23.5 C57 26.5 56 36 44 43Z" fill="#fb7185" stroke="#ffffff" stroke-width="1.4"/>
          <polygon points="44,26 48.5,31 44,39 39.5,31" fill="#ffffff" fill-opacity=".46"/>
          ${sparkle(60, 21, 4.2, '#ffe4e6')}
        `;

      case 'ring_diamond':
        return `
          <defs>
            <linearGradient id="${p}_ed" x1="16" y1="22" x2="72" y2="68" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#ffffff"/><stop offset="40%" stop-color="#bae6fd"/><stop offset="80%" stop-color="#0284c7"/><stop offset="100%" stop-color="#e0f2fe"/>
            </linearGradient>
          </defs>
          <ellipse cx="44" cy="70" rx="22" ry="4" fill="rgba(6,18,40,.46)"/>
          <ellipse cx="44" cy="51" rx="21" ry="13" fill="none" stroke="url(#${p}_ed)" stroke-width="5.2"/>
          <ellipse cx="44" cy="51" rx="21" ry="13" fill="none" stroke="#ffffff" stroke-width="1.6" stroke-dasharray="1.8 3.2" stroke-linecap="round"/>
          <rect x="27" y="34" width="6.5" height="4.5" rx="1.2" transform="rotate(-18 30 36)" fill="#e0f2fe" stroke="#ffffff" stroke-width=".9"/>
          <rect x="54.5" y="34" width="6.5" height="4.5" rx="1.2" transform="rotate(18 57 36)" fill="#e0f2fe" stroke="#ffffff" stroke-width=".9"/>
          <polygon points="44,14 56,26 44,39 32,26" fill="url(#${p}_ed)" stroke="#ffffff" stroke-width="1.5" stroke-linejoin="round"/>
          <polygon points="44,14 50,26 44,39 38,26" fill="#ffffff" fill-opacity=".6"/>
          <path d="M32 26h24" stroke="#ffffff" stroke-opacity=".8" stroke-width="1"/>
          ${sparkle(61, 16, 4.6, '#ffffff')}
          ${sparkle(25, 22, 3, '#bae6fd')}
        `;

      case 'ring_royal':
        return `
          <defs>
            <linearGradient id="${p}_ry" x1="14" y1="20" x2="74" y2="68" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#fffbeb"/><stop offset="36%" stop-color="#fde047"/><stop offset="76%" stop-color="#d97706"/><stop offset="100%" stop-color="#fef08a"/>
            </linearGradient>
          </defs>
          <ellipse cx="44" cy="70" rx="23" ry="4" fill="rgba(42,20,0,.48)"/>
          <ellipse cx="44" cy="52" rx="21" ry="12" fill="none" stroke="url(#${p}_ry)" stroke-width="5.2"/>
          <polygon points="24,42 29,22 37,32 44,16 51,32 59,22 64,42" fill="url(#${p}_ry)" stroke="#fffbeb" stroke-width="1.3" stroke-linejoin="round"/>
          <polygon points="44,26 49,33 44,40 39,33" fill="#e11d48" stroke="#ffffff" stroke-width="1"/>
          <circle cx="44" cy="15.5" r="2.6" fill="#ffffff"/>
          <circle cx="29" cy="21.5" r="2.1" fill="#fef08a"/><circle cx="59" cy="21.5" r="2.1" fill="#fef08a"/>
          ${sparkle(64, 18, 4.4, '#fef08a')}
        `;

      case 'ring_cosmic':
      default:
        return `
          <defs>
            <linearGradient id="${p}_cs" x1="14" y1="18" x2="74" y2="68" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#f5d0fe"/><stop offset="44%" stop-color="#c084fc"/><stop offset="82%" stop-color="#6d28d9"/><stop offset="100%" stop-color="#fde047"/>
            </linearGradient>
          </defs>
          <ellipse cx="44" cy="70" rx="23" ry="4" fill="rgba(22,6,50,.5)"/>
          <ellipse cx="44" cy="52" rx="21" ry="12" fill="none" stroke="url(#${p}_cs)" stroke-width="5"/>
          <ellipse cx="44" cy="34" rx="24" ry="7.5" transform="rotate(-18 44 34)" fill="none" stroke="#fef08a" stroke-width="1.8" stroke-opacity=".88"/>
          <ellipse cx="44" cy="34" rx="24" ry="7.5" transform="rotate(18 44 34)" fill="none" stroke="#67e8f9" stroke-width="1.5" stroke-opacity=".75"/>
          <polygon points="44,15 55,28 44,41 33,28" fill="url(#${p}_cs)" stroke="#ffffff" stroke-width="1.4" stroke-linejoin="round"/>
          <polygon points="44,18 50,28 44,38 38,28" fill="#ffffff" fill-opacity=".46"/>
          ${sparkle(64, 18, 4.4, '#ffffff')}
          ${sparkle(22, 24, 3.2, '#fef08a')}
        `;
    }
  }

  function renderRingSvg(ringOrArtKey, size, opts) {
    const o = opts || {};
    const rules = root.RingRules;
    let ring = null;
    let artKey = '';
    if (typeof ringOrArtKey === 'string') {
      ring = rules && rules.getRingById(ringOrArtKey);
      artKey = ring ? ring.art : (rules && rules.GIFT_RING_ART_ALIAS[ringOrArtKey]) || ringOrArtKey;
    } else if (ringOrArtKey && typeof ringOrArtKey === 'object') {
      ring = (rules && rules.getRingById(ringOrArtKey.id)) || ringOrArtKey;
      artKey = (rules && rules.getArtKeyForGift(ring)) || ring.art || 'diamond';
    }
    if (!artKey) artKey = 'diamond';
    const px = Number(size || 64);
    const seq = ++_ringSvgSeq;
    const prefix = 'wr_' + artKey.replace(/[^a-z0-9_]/gi, '') + '_' + seq;
    const glow = (ring && ring.glow) || o.glow || '#7dd3fc';
    const bgA = (ring && ring.bgA) || '#132445';
    const bgB = (ring && ring.bgB) || '#233c70';
    const withPlate = o.plate !== false;

    if (!withPlate) {
      return `<svg class="wring-svg ${escAttr(o.cls || '')}" width="${px}" height="${px}" viewBox="0 0 88 88" fill="none" aria-hidden="true" style="--ring-glow:${escAttr(glow)}">${ringGlyphSvgBody(artKey, prefix)}</svg>`;
    }

    return `<span class="wring-art-stage ${escAttr(o.cls || '')}" style="--ring-size:${px}px;--ring-glow:${escAttr(glow)};--ring-bga:${escAttr(bgA)};--ring-bgb:${escAttr(bgB)}">
      <span class="wring-aura" aria-hidden="true"></span>
      <svg class="wring-svg" width="${px}" height="${px}" viewBox="0 0 88 88" fill="none" aria-hidden="true">${ringGlyphSvgBody(artKey, prefix)}</svg>
    </span>`;
  }

  function renderRingCardArtwork(ring, size) {
    return renderRingSvg(ring, size || 78, { plate: true, cls: 'wring-card-art' });
  }

  const api = {
    renderRingSvg,
    renderRingCardArtwork,
    ringGlyphSvgBody
  };
  root.RingArt = api;
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : window);
