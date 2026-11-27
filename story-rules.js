"use strict";
/* =====================================================================
   COUPLE CHRONICLES — PURE STORY ENGINE, SVG SCENE ART, ROOM STATE & PDF
   · Pure, deterministic rules (zero DOM / Firestore side effects)
   · Exposed on window.StoryRules & module.exports for node:test
   · Lightweight layered SVG scene generator (zero heavy .jpg files)
   · Supports Split Openings & Split Chapters, Dual Choices, Reunion
     echoes, 4-factor romantic drama scoring (Trust / Courage / Sacrifice /
     Family Status), 4 distinct endings, EN/HI/BN localization, and
     spec-compliant multi-page PDF 1.4 JPEG-stream compilation.
   ===================================================================== */
(function (global) {
  const DEFAULT_STORY_ID = 'velvet_and_rain_love_divided';

  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function sanitizeName(raw, fallback) {
    const s = String(raw || '').trim().slice(0, 28);
    return s || fallback;
  }

  function interpolateNames(text, nameA, nameB) {
    const a = sanitizeName(nameA, 'Aarav');
    const b = sanitizeName(nameB, 'Meera');
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

  function escapeSvgText(str) {
    return String(str || '')
      .slice(0, 48)
      .replace(/&/g, '&amp;')
      .replace(/[<>"']/g, '');
  }

  /* ===================================================================
     LIGHTWEIGHT ATMOSPHERIC SVG SCENE ARTWORK (ZERO HEAVY .JPG ASSETS)
     6 bespoke multi-layered romance/drama vistas:
     - cover_divided     : Split twilight — rainy lane left, grand kothi right
     - rain_lane         : Narrow monsoon lane, tin roof, warm workshop lamp
     - kothi_balcony     : Grand mansion arches, chandelier glow, balcony moon
     - midnight_call     : Two distant glowing windows linked across city rain
     - reunion_bridge    : Rainy railway footbridge, single amber lamp, 2 silhouettes
     - courtyard_climax  : Dawn iron mansion gates, lantern garlands, rose-gold sky
     =================================================================== */
  function buildChronicleSceneSvg(themeKey, labelText) {
    const key = String(themeKey || 'cover_divided');
    const safeLabel = escapeSvgText(labelText || '');

    if (key === 'rain_lane') {
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 720" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="rlSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#0b1326"/>
            <stop offset="55%" stop-color="#141e36"/>
            <stop offset="100%" stop-color="#090c17"/>
          </linearGradient>
          <radialGradient id="rlLamp" cx="30%" cy="46%" r="36%">
            <stop offset="0%" stop-color="#fbbf24" stop-opacity="0.52"/>
            <stop offset="48%" stop-color="#f59e0b" stop-opacity="0.18"/>
            <stop offset="100%" stop-color="#090c17" stop-opacity="0"/>
          </radialGradient>
          <radialGradient id="rlWin" cx="72%" cy="54%" r="28%">
            <stop offset="0%" stop-color="#fdba74" stop-opacity="0.48"/>
            <stop offset="100%" stop-color="#0b1326" stop-opacity="0"/>
          </radialGradient>
          <linearGradient id="rlWet" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#131c31"/>
            <stop offset="100%" stop-color="#070a13"/>
          </linearGradient>
        </defs>
        <rect width="1200" height="720" fill="url(#rlSky)"/>
        <circle cx="960" cy="128" r="46" fill="#e0e7ff" opacity="0.16"/>
        <circle cx="960" cy="128" r="30" fill="#f8fafc" opacity="0.5"/>
        <!-- Distant tenements & monsoon roofline -->
        <path d="M0 490 L0 210 L170 210 L170 250 L290 250 L290 175 L460 175 L460 320 L740 320 L740 160 L960 160 L960 215 L1200 215 L1200 490 Z" fill="#0d1424"/>
        <!-- Slanted corrugated tin awning -->
        <polygon points="560,340 1120,300 1140,330 545,368" fill="#1e293b" stroke="#475569" stroke-width="2" opacity="0.9"/>
        <!-- Small room glowing window & study desk silhouette -->
        <rect x="755" y="380" width="175" height="120" rx="6" fill="#2c1d14" stroke="#f59e0b" stroke-opacity="0.55" stroke-width="3"/>
        <rect x="768" y="392" width="68" height="96" rx="3" fill="#fbbf24" opacity="0.72"/>
        <rect x="849" y="392" width="68" height="96" rx="3" fill="#f59e0b" opacity="0.56"/>
        <line x1="768" y1="440" x2="917" y2="440" stroke="#2c1d14" stroke-width="5"/>
        <!-- Streetlamp post -->
        <rect x="352" y="210" width="8" height="315" fill="#1e293b"/>
        <path d="M356 214 Q388 202 406 232" fill="none" stroke="#334155" stroke-width="5"/>
        <ellipse cx="406" cy="240" rx="16" ry="8" fill="#fef08a"/>
        <rect width="1200" height="720" fill="url(#rlLamp)"/>
        <rect width="1200" height="720" fill="url(#rlWin)"/>
        <!-- Wet cobbled lane with warm golden puddle reflections -->
        <rect x="0" y="510" width="1200" height="210" fill="url(#rlWet)"/>
        <ellipse cx="406" cy="566" rx="120" ry="18" fill="#fbbf24" opacity="0.22"/>
        <ellipse cx="406" cy="608" rx="82" ry="11" fill="#f59e0b" opacity="0.16"/>
        <ellipse cx="842" cy="574" rx="115" ry="16" fill="#fb923c" opacity="0.19"/>
        <!-- Lone dreamer silhouette holding phone near glowing alley -->
        <g fill="#070a12" opacity="0.94">
          <circle cx="540" cy="442" r="18"/>
          <path d="M518 468 Q540 458 564 468 L572 562 L512 562 Z"/>
        </g>
        <circle cx="556" cy="488" r="6" fill="#93c5fd" opacity="0.7"/>
        <!-- Diagonal monsoon rain streaks -->
        <g stroke="#cbd5e1" stroke-opacity="0.24" stroke-width="1.4">
          <line x1="120" y1="40" x2="80" y2="210"/><line x1="250" y1="80" x2="210" y2="270"/>
          <line x1="470" y1="30" x2="425" y2="240"/><line x1="640" y1="70" x2="595" y2="280"/>
          <line x1="820" y1="50" x2="775" y2="250"/><line x1="1030" y1="90" x2="985" y2="300"/>
          <line x1="185" y1="290" x2="145" y2="490"/><line x1="690" y1="270" x2="650" y2="465"/>
        </g>
        ${safeLabel ? `<text x="600" y="684" text-anchor="middle" font-family="Georgia,serif" font-size="18" letter-spacing="3.5" fill="#fde68a" opacity="0.5">${safeLabel}</text>` : ''}
      </svg>`;
    }

    if (key === 'kothi_balcony') {
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 720" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="kbSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#1c0d24"/>
            <stop offset="52%" stop-color="#2b1331"/>
            <stop offset="100%" stop-color="#0f0a18"/>
          </linearGradient>
          <radialGradient id="kbChandelier" cx="50%" cy="32%" r="42%">
            <stop offset="0%" stop-color="#fde68a" stop-opacity="0.58"/>
            <stop offset="50%" stop-color="#f43f5e" stop-opacity="0.16"/>
            <stop offset="100%" stop-color="#0f0a18" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <rect width="1200" height="720" fill="url(#kbSky)"/>
        <rect width="1200" height="720" fill="url(#kbChandelier)"/>
        <!-- Stars & Crescent Moon -->
        <g fill="#fef3c7" opacity="0.65">
          <circle cx="148" cy="112" r="2.2"/><circle cx="230" cy="86" r="1.6"/>
          <circle cx="962" cy="94" r="2.2"/><circle cx="1048" cy="148" r="1.8"/>
          <circle cx="888" cy="158" r="1.4"/><circle cx="192" cy="176" r="1.5"/>
        </g>
        <circle cx="1010" cy="120" r="34" fill="#fef08a" opacity="0.82"/>
        <circle cx="1024" cy="112" r="30" fill="#1e0e26"/>
        <!-- Ornate Mansion Pillars & Arches -->
        <path d="M0 0 L1200 0 L1200 720 L1035 720 L1035 230 Q1035 120 910 120 Q785 120 785 230 L785 720 L415 720 L415 230 Q415 120 290 120 Q165 120 165 230 L165 720 L0 720 Z" fill="#140b1d" opacity="0.72"/>
        <path d="M360 720 L360 220 Q600 68 840 220 L840 720 Z" fill="none" stroke="#eab308" stroke-opacity="0.45" stroke-width="4"/>
        <!-- Warm Illuminated Chandelier in Grand Hall -->
        <line x1="600" y1="0" x2="600" y2="165" stroke="#d8a35d" stroke-width="3"/>
        <path d="M510 210 Q600 250 690 210" fill="none" stroke="#f5d08a" stroke-width="3"/>
        <path d="M535 182 Q600 214 665 182" fill="none" stroke="#f5d08a" stroke-width="2.2"/>
        <g fill="#fef08a">
          <circle cx="520" cy="204" r="7"/><circle cx="560" cy="222" r="7"/>
          <circle cx="600" cy="228" r="9"/><circle cx="640" cy="222" r="7"/>
          <circle cx="680" cy="204" r="7"/>
        </g>
        <!-- Balcony Silhouette Looking Out at the Rainy City -->
        <g fill="#0c0714" opacity="0.92">
          <circle cx="600" cy="398" r="19"/>
          <path d="M572 426 Q600 416 628 426 L644 548 L556 548 Z"/>
        </g>
        <!-- Wrought Iron Balustrade -->
        <rect x="0" y="510" width="1200" height="12" fill="#2a1930" stroke="#d8a35d" stroke-opacity="0.45"/>
        <rect x="0" y="618" width="1200" height="102" fill="#0d0815"/>
        <g stroke="#d8a35d" stroke-opacity="0.38" stroke-width="4">
          <line x1="120" y1="522" x2="120" y2="618"/><line x1="240" y1="522" x2="240" y2="618"/>
          <line x1="360" y1="522" x2="360" y2="618"/><line x1="480" y1="522" x2="480" y2="618"/>
          <line x1="600" y1="522" x2="600" y2="618"/><line x1="720" y1="522" x2="720" y2="618"/>
          <line x1="840" y1="522" x2="840" y2="618"/><line x1="960" y1="522" x2="960" y2="618"/>
          <line x1="1080" y1="522" x2="1080" y2="618"/>
        </g>
        ${safeLabel ? `<text x="600" y="684" text-anchor="middle" font-family="Georgia,serif" font-size="18" letter-spacing="3.5" fill="#f6d598" opacity="0.52">${safeLabel}</text>` : ''}
      </svg>`;
    }

    if (key === 'midnight_call') {
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 720" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="mcLeft" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#0c192c"/>
            <stop offset="100%" stop-color="#13223b"/>
          </linearGradient>
          <linearGradient id="mcRight" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#2b122b"/>
            <stop offset="100%" stop-color="#170c22"/>
          </linearGradient>
          <radialGradient id="mcGlowA" cx="24%" cy="54%" r="30%">
            <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.34"/>
            <stop offset="100%" stop-color="#0c192c" stop-opacity="0"/>
          </radialGradient>
          <radialGradient id="mcGlowB" cx="76%" cy="54%" r="30%">
            <stop offset="0%" stop-color="#fb7185" stop-opacity="0.36"/>
            <stop offset="100%" stop-color="#170c22" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <rect x="0" y="0" width="600" height="720" fill="url(#mcLeft)"/>
        <rect x="600" y="0" width="600" height="720" fill="url(#mcRight)"/>
        <rect width="1200" height="720" fill="url(#mcGlowA)"/>
        <rect width="1200" height="720" fill="url(#mcGlowB)"/>
        <!-- City skyline across both halves -->
        <path d="M0 530 L90 530 L90 430 L170 430 L170 470 L280 470 L280 390 L380 390 L380 490 L520 490 L520 440 L600 440 L600 720 L0 720 Z" fill="#08101e" opacity="0.88"/>
        <path d="M600 450 L720 450 L720 350 L840 350 L840 290 L980 290 L980 390 L1080 390 L1080 460 L1200 460 L1200 720 L600 720 Z" fill="#10081a" opacity="0.88"/>
        <!-- Subtle center divider -->
        <line x1="600" y1="40" x2="600" y2="680" stroke="#f6d598" stroke-opacity="0.28" stroke-width="2" stroke-dasharray="6 8"/>
        <!-- Glowing phone connection arc linking the two worlds -->
        <path d="M292 412 Q600 185 908 412" fill="none" stroke="#fde68a" stroke-width="3" stroke-opacity="0.65" stroke-dasharray="10 8"/>
        <path d="M292 412 Q600 225 908 412" fill="none" stroke="#fda4af" stroke-width="1.8" stroke-opacity="0.45"/>
        <!-- Partner A by rainy rooftop window -->
        <rect x="210" y="340" width="160" height="190" rx="8" fill="#172844" stroke="#60a5fa" stroke-opacity="0.45" stroke-width="2"/>
        <circle cx="290" cy="410" r="19" fill="#070d18"/>
        <path d="M262 440 Q290 430 318 440 L325 530 L255 530 Z" fill="#070d18"/>
        <circle cx="308" cy="422" r="5" fill="#7dd3fc"/>
        <!-- Partner B by arched palace window -->
        <path d="M828 530 L828 402 Q908 320 988 402 L988 530 Z" fill="#3b1634" stroke="#f5d08a" stroke-opacity="0.55" stroke-width="2"/>
        <circle cx="908" cy="410" r="19" fill="#120718"/>
        <path d="M880 440 Q908 430 936 440 L946 530 L870 530 Z" fill="#120718"/>
        <circle cx="890" cy="422" r="5" fill="#fda4af"/>
        <!-- Glowing heart pulse at midpoint of call arc -->
        <circle cx="600" cy="296" r="26" fill="#f43f5e" opacity="0.22"/>
        <circle cx="600" cy="296" r="11" fill="#fde68a" opacity="0.88"/>
        ${safeLabel ? `<text x="600" y="684" text-anchor="middle" font-family="Georgia,serif" font-size="18" letter-spacing="3.5" fill="#f6d598" opacity="0.52">${safeLabel}</text>` : ''}
      </svg>`;
    }

    if (key === 'reunion_bridge') {
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 720" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="rbSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#17122b"/>
            <stop offset="54%" stop-color="#2c1732"/>
            <stop offset="100%" stop-color="#0b0914"/>
          </linearGradient>
          <radialGradient id="rbLamp" cx="50%" cy="38%" r="42%">
            <stop offset="0%" stop-color="#fde68a" stop-opacity="0.62"/>
            <stop offset="46%" stop-color="#fb7185" stop-opacity="0.22"/>
            <stop offset="100%" stop-color="#0b0914" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <rect width="1200" height="720" fill="url(#rbSky)"/>
        <rect width="1200" height="720" fill="url(#rbLamp)"/>
        <!-- Distant glowing city bokeh below the bridge -->
        <g opacity="0.45">
          <circle cx="140" cy="495" r="9" fill="#fbbf24"/><circle cx="240" cy="512" r="6" fill="#fda4af"/>
          <circle cx="345" cy="488" r="11" fill="#f59e0b"/><circle cx="855" cy="492" r="10" fill="#fbbf24"/>
          <circle cx="968" cy="510" r="7" fill="#93c5fd"/><circle cx="1065" cy="485" r="9" fill="#fda4af"/>
        </g>
        <!-- Steel Footbridge Arches & Railings -->
        <path d="M0 440 Q600 355 1200 440" fill="none" stroke="#475569" stroke-width="7" opacity="0.72"/>
        <rect x="0" y="535" width="1200" height="185" fill="#0d0b18"/>
        <line x1="0" y1="455" x2="1200" y2="455" stroke="#64748b" stroke-opacity="0.5" stroke-width="4"/>
        <g stroke="#475569" stroke-opacity="0.4" stroke-width="3">
          <line x1="120" y1="455" x2="120" y2="535"/><line x1="260" y1="455" x2="260" y2="535"/>
          <line x1="400" y1="455" x2="400" y2="535"/><line x1="800" y1="455" x2="800" y2="535"/>
          <line x1="940" y1="455" x2="940" y2="535"/><line x1="1080" y1="455" x2="1080" y2="535"/>
        </g>
        <!-- Center Warm Streetlamp -->
        <rect x="596" y="185" width="8" height="350" fill="#1e293b"/>
        <ellipse cx="600" cy="194" rx="26" ry="12" fill="#fef08a"/>
        <!-- Two Lovers Reunited Under One Umbrella -->
        <path d="M510 385 Q600 320 690 385 Z" fill="#9f1239" stroke="#fda4af" stroke-opacity="0.55" stroke-width="2"/>
        <line x1="600" y1="354" x2="600" y2="462" stroke="#e2e8f0" stroke-width="3"/>
        <g fill="#090712">
          <!-- Partner A -->
          <circle cx="568" cy="420" r="17"/>
          <path d="M544 446 Q568 436 592 446 L595 548 L540 548 Z"/>
          <!-- Partner B -->
          <circle cx="630" cy="426" r="16"/>
          <path d="M608 450 Q630 442 652 450 L662 548 L602 548 Z"/>
        </g>
        <!-- Wet bridge reflection -->
        <ellipse cx="600" cy="594" rx="190" ry="22" fill="#fbbf24" opacity="0.22"/>
        ${safeLabel ? `<text x="600" y="684" text-anchor="middle" font-family="Georgia,serif" font-size="18" letter-spacing="3.5" fill="#fef08a" opacity="0.52">${safeLabel}</text>` : ''}
      </svg>`;
    }

    if (key === 'courtyard_climax') {
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 720" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="ccDawn" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#1e1535"/>
            <stop offset="45%" stop-color="#5c213d"/>
            <stop offset="78%" stop-color="#b45309"/>
            <stop offset="100%" stop-color="#140c1a"/>
          </linearGradient>
          <radialGradient id="ccSun" cx="50%" cy="62%" r="44%">
            <stop offset="0%" stop-color="#fef08a" stop-opacity="0.72"/>
            <stop offset="45%" stop-color="#fb7185" stop-opacity="0.28"/>
            <stop offset="100%" stop-color="#140c1a" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <rect width="1200" height="720" fill="url(#ccDawn)"/>
        <rect width="1200" height="720" fill="url(#ccSun)"/>
        <!-- Rising Dawn Sun Behind Open Mansion Gates -->
        <circle cx="600" cy="435" r="88" fill="#fef3c7" opacity="0.74"/>
        <!-- Mansion Courtyard Pillars & Open Iron Gate Wings -->
        <rect x="110" y="185" width="94" height="390" fill="#180e24" stroke="#d8a35d" stroke-opacity="0.45" stroke-width="2"/>
        <rect x="996" y="185" width="94" height="390" fill="#180e24" stroke="#d8a35d" stroke-opacity="0.45" stroke-width="2"/>
        <circle cx="157" cy="172" r="22" fill="#fde68a" opacity="0.88"/>
        <circle cx="1043" cy="172" r="22" fill="#fde68a" opacity="0.88"/>
        <!-- Left & Right Swung-Open Gate Panels -->
        <path d="M204 260 L405 290 L405 565 L204 565 Z" fill="#120a1c" fill-opacity="0.75" stroke="#d8a35d" stroke-opacity="0.52" stroke-width="3"/>
        <path d="M996 260 L795 290 L795 565 L996 565 Z" fill="#120a1c" fill-opacity="0.75" stroke="#d8a35d" stroke-opacity="0.52" stroke-width="3"/>
        <!-- Festive Lantern Garland Arc -->
        <path d="M157 185 Q600 265 1043 185" fill="none" stroke="#f6d598" stroke-opacity="0.55" stroke-width="2.5"/>
        <g fill="#fef08a">
          <circle cx="310" cy="214" r="6"/><circle cx="455" cy="232" r="6"/>
          <circle cx="600" cy="239" r="7"/><circle cx="745" cy="232" r="6"/>
          <circle cx="890" cy="214" r="6"/>
        </g>
        <!-- Courtyard Stone Ground & Converging Path -->
        <rect x="0" y="540" width="1200" height="180" fill="#110a19"/>
        <polygon points="480,540 720,540 870,720 330,720" fill="#231630" opacity="0.85"/>
        <!-- Two Silhouettes Standing Hand-in-Hand at the Threshold -->
        <g fill="#09050f">
          <circle cx="566" cy="442" r="16"/>
          <path d="M544 466 Q566 456 588 466 L592 560 L540 560 Z"/>
          <circle cx="634" cy="446" r="15"/>
          <path d="M614 470 Q634 460 654 470 L664 560 L606 560 Z"/>
        </g>
        ${safeLabel ? `<text x="600" y="684" text-anchor="middle" font-family="Georgia,serif" font-size="18" letter-spacing="3.5" fill="#fef08a" opacity="0.58">${safeLabel}</text>` : ''}
      </svg>`;
    }

    /* Default: `cover_divided` — Rich Girl (Velvet Kothi) vs Poor Boy (Monsoon Lane) */
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 720" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="cvLeft" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#0b152a"/>
          <stop offset="60%" stop-color="#17243f"/>
          <stop offset="100%" stop-color="#090c17"/>
        </linearGradient>
        <linearGradient id="cvRight" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#290f24"/>
          <stop offset="58%" stop-color="#431530"/>
          <stop offset="100%" stop-color="#110918"/>
        </linearGradient>
        <radialGradient id="cvMoon" cx="50%" cy="24%" r="36%">
          <stop offset="0%" stop-color="#fef08a" stop-opacity="0.45"/>
          <stop offset="55%" stop-color="#fb7185" stop-opacity="0.16"/>
          <stop offset="100%" stop-color="#090c17" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <!-- Left World: Monsoon Rain & Humble Lane -->
      <rect x="0" y="0" width="600" height="720" fill="url(#cvLeft)"/>
      <!-- Right World: Velvet Kothi & Chandelier Glow -->
      <rect x="600" y="0" width="600" height="720" fill="url(#cvRight)"/>
      <rect width="1200" height="720" fill="url(#cvMoon)"/>
      <!-- Shared Full Monsoon Moon at Center Horizon -->
      <circle cx="600" cy="176" r="64" fill="#fef3c7" opacity="0.22"/>
      <circle cx="600" cy="176" r="44" fill="#fef08a" opacity="0.82"/>
      <!-- Left Silhouette: Small Slanted Roof, Glowing Study Window, Streetlamp -->
      <path d="M0 540 L0 300 L140 270 L280 300 L280 370 L450 370 L450 540 Z" fill="#0b1222"/>
      <rect x="82" y="346" width="84" height="62" rx="4" fill="#fbbf24" opacity="0.72"/>
      <line x1="124" y1="346" x2="124" y2="408" stroke="#0b1222" stroke-width="4"/>
      <rect x="358" y="255" width="7" height="285" fill="#1e293b"/>
      <ellipse cx="362" cy="256" rx="16" ry="7" fill="#fef08a"/>
      <!-- Right Silhouette: Ornate Kothi Domes & Lit Arched Windows -->
      <path d="M720 540 L720 315 L810 315 L810 245 Q900 185 990 245 L990 315 L1200 315 L1200 540 Z" fill="#17091d"/>
      <path d="M858 345 Q900 305 942 345 L942 425 L858 425 Z" fill="#fde68a" opacity="0.76"/>
      <path d="M1040 365 Q1072 335 1104 365 L1104 432 L1040 432 Z" fill="#fbbf24" opacity="0.62"/>
      <path d="M750 365 Q782 335 814 365 L814 432 L750 432 Z" fill="#fbbf24" opacity="0.56"/>
      <!-- Ground & Wet Monsoon Reflection -->
      <rect x="0" y="538" width="1200" height="182" fill="#090812"/>
      <ellipse cx="362" cy="594" rx="110" ry="16" fill="#fbbf24" opacity="0.18"/>
      <ellipse cx="900" cy="594" rx="130" ry="18" fill="#fb7185" opacity="0.18"/>
      <!-- Center Split-World Bridge: Two Silhouettes Reaching Across the Rain -->
      <g fill="#06050b">
        <circle cx="534" cy="434" r="18"/>
        <path d="M508 462 Q534 452 560 462 L566 566 L502 566 Z"/>
        <circle cx="666" cy="438" r="17"/>
        <path d="M642 466 Q666 456 690 466 L700 566 L634 566 Z"/>
      </g>
      <!-- Subtle Golden Thread Connecting Their Hands -->
      <path d="M558 492 Q600 472 642 492" fill="none" stroke="#fde68a" stroke-width="2.6" stroke-opacity="0.8"/>
      <!-- Rain Lines -->
      <g stroke="#e2e8f0" stroke-opacity="0.2" stroke-width="1.3">
        <line x1="160" y1="50" x2="120" y2="230"/><line x1="310" y1="30" x2="270" y2="210"/>
        <line x1="480" y1="60" x2="440" y2="240"/><line x1="740" y1="45" x2="700" y2="225"/>
        <line x1="940" y1="70" x2="900" y2="250"/><line x1="1110" y1="40" x2="1070" y2="220"/>
      </g>
      ${safeLabel ? `<text x="600" y="684" text-anchor="middle" font-family="Georgia,serif" font-size="18" letter-spacing="3.5" fill="#f6d598" opacity="0.55">${safeLabel}</text>` : ''}
    </svg>`;
  }

  function buildChronicleSceneDataUri(themeKey, labelText) {
    return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(buildChronicleSceneSvg(themeKey, labelText));
  }

  function buildFallbackArtworkDataUri(themeKey, labelText) {
    return buildChronicleSceneDataUri(themeKey, labelText);
  }

  /* ===================================================================
     2-SEAT COUPLE WAITING ROOM LIFECYCLE (ZERO BOTS)
     =================================================================== */
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
    const hostName = sanitizeName(hostProfile && hostProfile.name, 'Aarav');
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
      subMode: String((story && story.id) || DEFAULT_STORY_ID),
      storyId: String((story && story.id) || DEFAULT_STORY_ID),
      tierLabel: String((story && story.title) || 'Velvet & Rain: A Love Divided'),
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
    const gName = sanitizeName(guestProfile && guestProfile.name, 'Meera');
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

  /* ===================================================================
     STORY SESSION STATE, DUAL CHOICES, SPLIT / REUNION & 4-ENDING LOGIC
     =================================================================== */
  function createStorySessionState(story, opts) {
    const o = opts || {};
    const partnerA = sanitizeName(o.partnerAName, 'Aarav');
    const partnerB = sanitizeName(o.partnerBName, 'Meera');
    const startA = (story && (story.startSceneIdA || story.startSceneId)) || 's1a_rain_lane';
    const startB = (story && (story.startSceneIdB || story.startSceneId)) || startA;
    return {
      storyId: story ? story.id : DEFAULT_STORY_ID,
      playMode: o.playMode === 'solo_duo' ? 'solo_duo' : 'coop',
      partnerAName: partnerA,
      partnerBName: partnerB,
      sceneIdA: startA,
      sceneIdB: startB,
      stepIndex: 0,
      trustScore: 3,
      courageScore: 2,
      sacrificeScore: 1,
      statusScore: 1,
      memoriesFound: [],
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
    const courage = Number(state.courageScore || 0);
    const sacrifice = Number(state.sacrificeScore || 0);
    const status = Number(state.statusScore || 0);
    const history = Array.isArray(state.history) ? state.history : [];
    const lastEntry = history.length ? history[history.length - 1] : null;
    const lastChoiceA = lastEntry ? lastEntry.choiceAId : '';
    const lastChoiceB = lastEntry ? lastEntry.choiceBId : '';

    // 1. Bold / New Beginning Ending: Breaking velvet walls together for a fearless new start
    if (
      endings.bold_new_dawn &&
      (
        (lastChoiceA === 'a_run_new_city' && lastChoiceB === 'b_break_chains') ||
        ((lastChoiceA === 'a_run_new_city' || lastChoiceB === 'b_break_chains') && courage >= 9 && trust >= 7) ||
        (courage >= 11 && status <= 4 && lastChoiceA !== 'a_silent_step_back' && lastChoiceB !== 'b_family_compromise')
      )
    ) {
      return 'bold_new_dawn';
    }

    // 2. Bittersweet / Separation Ending: Silent step back, heavy sacrifice with low courage, or low trust
    if (
      endings.bittersweet_rain &&
      (
        lastChoiceA === 'a_silent_step_back' ||
        (sacrifice >= 9 && courage <= 6 && lastChoiceB !== 'b_family_compromise') ||
        (trust <= 5 && lastChoiceB !== 'b_family_compromise')
      )
    ) {
      return 'bittersweet_rain';
    }

    // 3. Dramatic Twist / Compromise Ending: A solemn vow / family pact with sacrifice & status pressure
    if (
      endings.dramatic_compromise &&
      (
        lastChoiceB === 'b_family_compromise' ||
        (status >= 7 && sacrifice >= 6 && courage < 10)
      )
    ) {
      return 'dramatic_compromise';
    }

    // 4. Happy / Together Ending: Trust, self-respect, and standing together win both love & dignity
    if (endings.together_horizon) {
      return 'together_horizon';
    }

    const keys = Object.keys(endings);
    return keys[0] || 'together_horizon';
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

    if (!state.pendingChoices.A || !state.pendingChoices.B) {
      return {
        ok: true,
        resolved: false,
        waitingFor: r === 'A' ? 'B' : 'A',
        state
      };
    }

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
    const deltaCourage = Number(choiceA.courage || 0) + Number(choiceB.courage || 0) + Number((pairOutcome && pairOutcome.courage) || 0);
    const deltaSacrifice = Number(choiceA.sacrifice || 0) + Number(choiceB.sacrifice || 0) + Number((pairOutcome && pairOutcome.sacrifice) || 0);
    const deltaStatus = Number(choiceA.status || 0) + Number(choiceB.status || 0) + Number((pairOutcome && pairOutcome.status) || 0);

    state.trustScore = Math.max(0, Math.min(16, Number(state.trustScore || 0) + deltaTrust));
    state.courageScore = Math.max(0, Math.min(16, Number(state.courageScore || 0) + deltaCourage));
    state.sacrificeScore = Math.max(0, Math.min(16, Number(state.sacrificeScore || 0) + deltaSacrifice));
    state.statusScore = Math.max(0, Math.min(16, Number(state.statusScore || 0) + deltaStatus));

    if (!Array.isArray(state.memoriesFound)) state.memoriesFound = [];
    if (!Array.isArray(state.cluesFound)) state.cluesFound = [];

    const newMemories = [];
    const memCandidates = [
      choiceA.memory || choiceA.clue,
      choiceB.memory || choiceB.clue,
      pairOutcome && (pairOutcome.memory || pairOutcome.clue)
    ].filter(Boolean);

    memCandidates.forEach(mem => {
      if (!state.memoriesFound.includes(mem)) {
        state.memoriesFound.push(mem);
        newMemories.push(mem);
      }
      if (!state.cluesFound.includes(mem)) {
        state.cluesFound.push(mem);
      }
    });

    const outcomeText = (pairOutcome && pairOutcome.text) || {
      en: `{A} and {B} carry the weight of their choices across the monsoon night.`,
      hi: `{A} और {B} के फैसले बारिश भरी रात में दोनों की कहानी को नए मोड़ पर ले आते हैं।`,
      bn: `{A} এবং {B}-এর সিদ্ধান্ত বৃষ্টির রাতে তাদের গল্পকে নতুন মোড়ে নিয়ে যায়।`
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
      newMemories,
      trustAfter: state.trustScore,
      courageAfter: state.courageScore,
      sacrificeAfter: state.sacrificeScore,
      statusAfter: state.statusScore,
      ts: Date.now()
    });

    state.lastOutcome = {
      comboKey,
      text: outcomeText,
      sfx: (pairOutcome && pairOutcome.sfx) || (newMemories.length ? 'clueFound' : 'choiceLock'),
      deltaTrust,
      deltaCourage,
      deltaSacrifice,
      deltaStatus,
      newMemories,
      ts: Date.now()
    };

    state.pendingChoices = { A: null, B: null };
    state.stepIndex = Number(state.stepIndex || 0) + 1;

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
    const nameA = sanitizeName(state && state.partnerAName, 'Aarav');
    const nameB = sanitizeName(state && state.partnerBName, 'Meera');
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
      memories: Array.isArray(h.newMemories) ? h.newMemories : []
    }));

    return {
      storyId: story ? story.id : DEFAULT_STORY_ID,
      storyTitle: pickLangText(story && story.titleLocalized ? story.titleLocalized : (story && story.title), l, nameA, nameB),
      tagline: pickLangText(story && story.taglineLocalized ? story.taglineLocalized : (story && story.tagline), l, nameA, nameB),
      genre: (story && story.genre) || 'Romantic Drama',
      artTheme: (story && story.artTheme) || 'cover_divided',
      endingArtTheme: (endingObj && endingObj.artTheme) || 'courtyard_climax',
      partnerAName: nameA,
      partnerBName: nameB,
      completedDate,
      trustScore: Number((state && state.trustScore) || 0),
      courageScore: Number((state && state.courageScore) || 0),
      sacrificeScore: Number((state && state.sacrificeScore) || 0),
      statusScore: Number((state && state.statusScore) || 0),
      memoriesFound: Array.isArray(state && state.memoriesFound) ? state.memoriesFound.slice() : [],
      endingId: (state && state.endingId) || '',
      endingBadge: endingObj ? pickLangText(endingObj.badge, l, nameA, nameB) : 'Story Complete',
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

  function buildPdfFromJpegPages(pages) {
    if (!Array.isArray(pages) || !pages.length) {
      throw new Error('At least one page is required to build a PDF');
    }
    const pageW = 595.28;
    const pageH = 841.89;
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
    DEFAULT_STORY_ID,
    interpolateNames,
    pickLangText,
    buildChronicleSceneSvg,
    buildChronicleSceneDataUri,
    buildFallbackArtworkDataUri,
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
