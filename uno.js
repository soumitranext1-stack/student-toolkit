"use strict";
/* =====================================================================
   UNO / OH MY CARD — GARDEN PICNIC ARENA (v19)
   · Classic (4P), Fun Play (2 Decks + Stacking), & 1v1 Duel
   · Sunny Garden Picnic Meadow, Scalloped Lace Mat, Color-Reactive Arrows,
     Robot Visor Draw Dispenser, Golden ONE Button, Candy Mascot Cards
   · Wild +4 Challenge, Discard All Same Color, 5:00 Match Countdown
   · 4-Page Leafy-Green Rules Modal, Invite Friend Modal, Live Mic Options
   ===================================================================== */

const UNO_COLOR_META = {
  red: { label: 'Pink', hex: '#e6397b', dark: '#b51d5b', light: '#ff6ba3', glow: 'rgba(230,57,123,.45)' },
  blue: { label: 'Blue', hex: '#1575e8', dark: '#0c52ad', light: '#4ea0ff', glow: 'rgba(21,117,232,.45)' },
  yellow: { label: 'Yellow', hex: '#f5a623', dark: '#c97b06', light: '#ffd166', glow: 'rgba(245,166,35,.45)' },
  green: { label: 'Green', hex: '#78b824', dark: '#50840f', light: '#a3df46', glow: 'rgba(120,184,36,.45)' },
  wild: { label: 'Wild', hex: '#f59e0b', dark: '#b45309', light: '#fde047', glow: 'rgba(251,191,36,.5)' }
};

const UNO_BOT_ROSTER = [
  { uid: 'uno_b1', name: 'AyAd...', avatar: 'av_b1', gender: '♂' },
  { uid: 'uno_b2', name: 'Minni', avatar: 'av_g2', gender: '♀' },
  { uid: 'uno_b3', name: 'Bittu', avatar: 'av_b3', gender: '♂' },
  { uid: 'uno_b4', name: 'Zoya', avatar: 'av_g1', gender: '♀' },
  { uid: 'uno_b5', name: 'Kabir', avatar: 'av_b2', gender: '♂' }
];

const UNO_QUICK_CHATS = [
  'Nice card! 🔥',
  'Hold on! 😅',
  'Stack it! +2/+4 ⚡',
  'ONE!! 🎉',
  'Good game! 👏',
  'No mercy! 😈'
];

const UNO_EMOTES = ['😂', '🔥', '😱', '🥳', '😎', '💥', '👏', '❤️'];

function unoAvatarHtml(av) {
  if (typeof renderAvatarGlyph === 'function') return renderAvatarGlyph(av || 'av_b1');
  return '<span>🎮</span>';
}

function unoShortName(name, maxLen) {
  const s = String(name || 'Player').trim();
  const limit = maxLen || 8;
  return s.length > limit ? s.slice(0, limit - 1) + '…' : s;
}

function unoFormatClock(sec) {
  const s = Math.max(0, Math.floor(Number(sec) || 0));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
}

function unoMascotSvg(size) {
  const s = size || 26;
  return `<svg class="uno-mascot-svg" width="${s}" height="${s}" viewBox="0 0 36 36" fill="none" aria-hidden="true">
    <rect x="6" y="7" width="24" height="22" rx="10" fill="#ffffff" stroke="#0284c7" stroke-width="2"/>
    <rect x="10" y="12" width="16" height="9" rx="4.5" fill="#0f172a"/>
    <circle cx="15" cy="16.5" r="2" fill="#38bdf8"/>
    <circle cx="21" cy="16.5" r="2" fill="#38bdf8"/>
    <path d="M15 24c1.6 1.5 4.4 1.5 6 0" stroke="#0284c7" stroke-width="1.8" stroke-linecap="round"/>
    <circle cx="18" cy="4.5" r="2.2" fill="#38bdf8"/>
  </svg>`;
}

function unoCardCornerGlyph(card) {
  if (!card) return '';
  if (card.value === 'skip') return '×';
  if (card.value === 'draw2') return '+2';
  if (card.value === 'reverse') return '⇄';
  if (card.value === 'discardAll') {
    return `<svg viewBox="0 0 18 18" width="13" height="13" fill="none" aria-hidden="true">
      <rect x="2" y="5" width="9" height="11" rx="2" fill="currentColor" opacity=".45"/>
      <rect x="5" y="3" width="9" height="11" rx="2" fill="currentColor" opacity=".75"/>
      <rect x="8" y="1.5" width="8.5" height="10.5" rx="2" fill="currentColor"/>
    </svg>`;
  }
  if (card.value === 'wild') {
    return `<svg viewBox="0 0 18 18" width="13" height="13" aria-hidden="true">
      <path d="M9 1a8 8 0 0 1 8 8H9V1z" fill="#1575e8"/>
      <path d="M17 9a8 8 0 0 1-8 8V9h8z" fill="#78b824"/>
      <path d="M9 17a8 8 0 0 1-8-8h8v8z" fill="#f5a623"/>
      <path d="M1 9a8 8 0 0 1 8-8v8H1z" fill="#e6397b"/>
      <circle cx="9" cy="9" r="3" fill="#fff"/>
    </svg>`;
  }
  if (card.value === 'wild4') return '+4';
  return esc(String(card.value));
}

function unoCardCenterArt(card, large) {
  const mSize = large ? 28 : 19;
  if (card.value === 'skip') {
    return `<div class="uc-center-icon uc-skip-ico">
      ${unoMascotSvg(mSize)}
      <svg viewBox="0 0 48 48" width="${large ? 48 : 34}" height="${large ? 48 : 34}" fill="none" aria-hidden="true">
        <path d="M12 12l24 24M36 12L12 36" stroke="#fff" stroke-width="8.5" stroke-linecap="round"/>
      </svg>
    </div>`;
  }
  if (card.value === 'draw2') {
    return `<div class="uc-center-icon uc-d2-ico">
      ${unoMascotSvg(mSize)}
      <svg viewBox="0 0 54 48" width="${large ? 52 : 36}" height="${large ? 46 : 32}" fill="none" aria-hidden="true">
        <rect x="7" y="12" width="22" height="30" rx="5" transform="rotate(-12 18 27)" fill="#fff" stroke="rgba(0,0,0,.14)" stroke-width="1.5"/>
        <rect x="24" y="9" width="22" height="30" rx="5" transform="rotate(10 35 24)" fill="#fff" stroke="rgba(0,0,0,.14)" stroke-width="1.5"/>
      </svg>
    </div>`;
  }
  if (card.value === 'reverse') {
    return `<div class="uc-center-icon uc-rev-ico">
      ${unoMascotSvg(mSize - 2)}
      <svg viewBox="0 0 52 52" width="${large ? 48 : 34}" height="${large ? 48 : 34}" fill="none" aria-hidden="true">
        <path d="M13 22a14 14 0 0 1 22-8l3-3v11H27l4-4a9 9 0 0 0-13 5" stroke="#fff" stroke-width="4.6" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M39 30a14 14 0 0 1-22 8l-3 3V30h11l-4 4a9 9 0 0 0 13-5" stroke="#fff" stroke-width="4.6" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>`;
  }
  if (card.value === 'discardAll') {
    return `<div class="uc-center-icon uc-dall-ico">
      ${unoMascotSvg(mSize - 2)}
      <svg viewBox="0 0 54 48" width="${large ? 50 : 35}" height="${large ? 44 : 31}" fill="none" aria-hidden="true">
        <rect x="8" y="24" width="34" height="16" rx="4" fill="#fff" opacity=".55"/>
        <rect x="11" y="17" width="34" height="16" rx="4" fill="#fff" opacity=".8"/>
        <rect x="14" y="10" width="34" height="16" rx="4" fill="#fff"/>
        <path d="M23 18h16" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
      </svg>
    </div>`;
  }
  if (card.value === 'wild') {
    return `<div class="uc-center-icon uc-wild-ico">
      <svg viewBox="0 0 56 56" width="${large ? 56 : 40}" height="${large ? 56 : 40}" aria-hidden="true">
        <circle cx="28" cy="28" r="24" fill="#fff"/>
        <path d="M28 6a22 22 0 0 1 22 22H28V6z" fill="#1575e8"/>
        <path d="M50 28a22 22 0 0 1-22 22V28h22z" fill="#78b824"/>
        <path d="M28 50A22 22 0 0 1 6 28h22v22z" fill="#f5a623"/>
        <path d="M6 28A22 22 0 0 1 28 6v22H6z" fill="#e6397b"/>
        <circle cx="28" cy="28" r="11" fill="#fff"/>
      </svg>
      <span class="uc-wild-mascot">${unoMascotSvg(large ? 22 : 16)}</span>
    </div>`;
  }
  if (card.value === 'wild4') {
    return `<div class="uc-center-icon uc-w4-ico">
      ${unoMascotSvg(mSize - 2)}
      <svg viewBox="0 0 60 48" width="${large ? 56 : 40}" height="${large ? 44 : 32}" fill="none" aria-hidden="true">
        <rect x="5" y="15" width="16" height="24" rx="4" transform="rotate(-18 13 27)" fill="#e6397b" stroke="#fff" stroke-width="2"/>
        <rect x="16" y="11" width="16" height="24" rx="4" transform="rotate(-6 24 23)" fill="#1575e8" stroke="#fff" stroke-width="2"/>
        <rect x="27" y="11" width="16" height="24" rx="4" transform="rotate(7 35 23)" fill="#f5a623" stroke="#fff" stroke-width="2"/>
        <rect x="37" y="15" width="16" height="24" rx="4" transform="rotate(18 45 27)" fill="#78b824" stroke="#fff" stroke-width="2"/>
      </svg>
    </div>`;
  }
  return `<div class="uc-center-num">
    <span class="uc-num-mascot">${unoMascotSvg(mSize)}</span>
    <b>${esc(String(card.value))}</b>
  </div>`;
}

function renderUnoCardHtml(card, opts) {
  const o = opts || {};
  const col = card.color === 'wild' ? 'wild' : (UNO_COLOR_META[card.color] ? card.color : 'blue');
  const cls = [
    'uno-wp-card',
    `col-${col}`,
    o.large ? 'is-large' : '',
    o.mini ? 'is-mini' : '',
    o.playable ? 'is-playable' : '',
    o.dimmed ? 'is-dimmed' : '',
    o.pop ? 'is-pop' : ''
  ].filter(Boolean).join(' ');
  const styleAttr = o.style ? ` style="${o.style}"` : '';
  const dataAttr = o.index !== undefined ? ` data-card-idx="${o.index}"` : '';
  const tag = o.interactive ? 'button' : 'div';
  const typeAttr = o.interactive ? ' type="button"' : '';
  const disAttr = o.interactive && o.dimmed ? ' aria-disabled="true"' : '';
  return `<${tag}${typeAttr} class="${cls}"${dataAttr}${styleAttr}${disAttr}>
    <span class="uc-inner">
      <span class="uc-corner-tab">${unoCardCornerGlyph(card)}</span>
      <span class="uc-art">${unoCardCenterArt(card, !!o.large)}</span>
    </span>
  </${tag}>`;
}

function renderUnoCardBackFan(count) {
  const shown = Math.max(1, Math.min(7, Number(count) || 0));
  const mid = (shown - 1) / 2;
  let html = '';
  for (let i = 0; i < shown; i++) {
    const off = i - mid;
    const rot = (off * 6).toFixed(1);
    const tx = (off * 7).toFixed(1);
    const ty = (Math.abs(off) * 1.4).toFixed(1);
    html += `<i class="uno-back-mini" style="transform:translate(${tx}px,${ty}px) rotate(${rot}deg)"></i>`;
  }
  return `<div class="uno-rival-fan" aria-hidden="true">${html}</div>`;
}

function renderGardenScenerySvg() {
  return `
  <div class="uno-garden-scenery" aria-hidden="true">
    <!-- Top-left woven straw hat + cute snail -->
    <svg class="uno-prop-hat" viewBox="0 0 150 130" fill="none">
      <ellipse cx="74" cy="70" rx="58" ry="48" fill="#d9a557" stroke="#b98338" stroke-width="3" stroke-dasharray="5 3"/>
      <ellipse cx="74" cy="64" rx="34" ry="27" fill="#e8bc6e" stroke="#c38d40" stroke-width="2.5"/>
      <path d="M40 76c14 10 52 10 68 0" stroke="#c96b7e" stroke-width="7" stroke-linecap="round"/>
      <circle cx="48" cy="84" r="10" fill="#d8758a"/>
      <path d="M36 92l12-8 10 12-16 4z" fill="#c76278"/>
      <!-- Cute purple snail peeking under brim -->
      <ellipse cx="89" cy="108" rx="18" ry="10" fill="#e9d5ff" stroke="#a855f7" stroke-width="2"/>
      <circle cx="80" cy="104" r="11" fill="#a855f7" stroke="#7e22ce" stroke-width="2"/>
      <path d="M80 104c3 0 4-3 2-5-3-2-7 1-6 5" stroke="#f3e8ff" stroke-width="2" stroke-linecap="round"/>
      <circle cx="96" cy="95" r="4.5" fill="#fff" stroke="#4c1d95" stroke-width="1.5"/>
      <circle cx="96.5" cy="95" r="2" fill="#1e1b4b"/>
      <circle cx="104" cy="97" r="4.5" fill="#fff" stroke="#4c1d95" stroke-width="1.5"/>
      <circle cx="104.5" cy="97" r="2" fill="#1e1b4b"/>
    </svg>

    <!-- Top-right wooden picnic stump with taiyaki snack plate -->
    <svg class="uno-prop-stump" viewBox="0 0 150 140" fill="none">
      <path d="M12 72l88 52 44-42-88-54z" fill="#60a5fa" opacity=".55"/>
      <ellipse cx="96" cy="48" rx="56" ry="48" fill="#7c4a2d" stroke="#532d18" stroke-width="5"/>
      <ellipse cx="96" cy="44" rx="46" ry="38" fill="#9c6441"/>
      <circle cx="94" cy="44" r="30" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="3"/>
      <!-- Two golden taiyaki fish cakes -->
      <ellipse cx="86" cy="39" rx="14" ry="8" transform="rotate(-24 86 39)" fill="#b47b4e" stroke="#784421" stroke-width="1.8"/>
      <ellipse cx="102" cy="51" rx="14" ry="8" transform="rotate(14 102 51)" fill="#c28554" stroke="#784421" stroke-width="1.8"/>
    </svg>

    <!-- Bottom-left peeking cat -->
    <svg class="uno-prop-cat" viewBox="0 0 130 110" fill="none">
      <path d="M26 70c-12-22-2-48 16-44 10 2 14 14 8 24" stroke="#6b4423" stroke-width="15" stroke-linecap="round"/>
      <ellipse cx="66" cy="86" rx="42" ry="32" fill="#c99e75" stroke="#8a623c" stroke-width="3"/>
      <ellipse cx="48" cy="96" rx="15" ry="12" fill="#fef3c7"/>
    </svg>

    <!-- Decorative garden butterflies & leaves -->
    <span class="uno-leaf-dec l1"></span>
    <span class="uno-leaf-dec l2"></span>
    <span class="uno-leaf-dec l3"></span>
    <span class="uno-butterfly b1">🦋</span>
    <span class="uno-butterfly b2">✦</span>
  </div>`;
}

function renderScallopedMatSvg(activeColor, direction) {
  const c = UNO_COLOR_META[activeColor] || UNO_COLOR_META.blue;
  const dirClass = direction === -1 ? ' is-ccw' : '';
  // Generate 36 creamy lace scallops around a circle
  let scallops = '';
  for (let i = 0; i < 36; i++) {
    const a = (i / 36) * Math.PI * 2;
    const cx = (180 + Math.cos(a) * 158).toFixed(1);
    const cy = (180 + Math.sin(a) * 158).toFixed(1);
    scallops += `<circle cx="${cx}" cy="${cy}" r="14" fill="#f7f4dc"/>`;
  }
  return `<svg class="uno-mat-svg" viewBox="0 0 360 360" fill="none" aria-hidden="true">
    <defs>
      <radialGradient id="unoMatGrad" cx="50%" cy="46%" r="54%">
        <stop offset="0%" stop-color="#6dbb51"/>
        <stop offset="78%" stop-color="#569e3f"/>
        <stop offset="100%" stop-color="#488a34"/>
      </radialGradient>
    </defs>
    <g opacity=".97" filter="drop-shadow(0 8px 18px rgba(24,58,12,.28))">${scallops}</g>
    <circle cx="180" cy="180" r="153" fill="url(#unoMatGrad)" stroke="#f7f4dc" stroke-width="6"/>
    <circle cx="180" cy="180" r="142" stroke="rgba(255,255,255,.18)" stroke-width="2" stroke-dasharray="6 6"/>
    <!-- Subtle center watermark -->
    <text x="180" y="196" text-anchor="middle" font-size="68" font-weight="900" fill="rgba(255,255,255,.09)" letter-spacing="3">UNO</text>
    <!-- 4 Color-Reactive Curved Directional Arrows (flips on Reverse) -->
    <g class="uno-dir-arrows${dirClass}" style="--arr-c:${c.hex};--arr-l:${c.light}">
      <!-- Top-Left to Left -->
      <path d="M168 62 A118 118 0 0 0 74 134" stroke="#ffffff" stroke-width="18" stroke-linecap="round"/>
      <path d="M168 62 A118 118 0 0 0 74 134" stroke="${c.hex}" stroke-width="11" stroke-linecap="round"/>
      <path d="M68 112 L72 140 L98 130" stroke="#ffffff" stroke-width="17" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M68 112 L72 140 L98 130" stroke="${c.hex}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>

      <!-- Left to Bottom -->
      <path d="M64 192 A118 118 0 0 0 138 286" stroke="#ffffff" stroke-width="18" stroke-linecap="round"/>
      <path d="M64 192 A118 118 0 0 0 138 286" stroke="${c.hex}" stroke-width="11" stroke-linecap="round"/>
      <path d="M116 292 L144 288 L134 262" stroke="#ffffff" stroke-width="17" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M116 292 L144 288 L134 262" stroke="${c.hex}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>

      <!-- Bottom to Right -->
      <path d="M192 298 A118 118 0 0 0 286 226" stroke="#ffffff" stroke-width="18" stroke-linecap="round"/>
      <path d="M192 298 A118 118 0 0 0 286 226" stroke="${c.hex}" stroke-width="11" stroke-linecap="round"/>
      <path d="M292 248 L288 220 L262 230" stroke="#ffffff" stroke-width="17" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M292 248 L288 220 L262 230" stroke="${c.hex}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>

      <!-- Right to Top -->
      <path d="M296 168 A118 118 0 0 0 222 74" stroke="#ffffff" stroke-width="18" stroke-linecap="round"/>
      <path d="M296 168 A118 118 0 0 0 222 74" stroke="${c.hex}" stroke-width="11" stroke-linecap="round"/>
      <path d="M244 68 L216 72 L226 98" stroke="#ffffff" stroke-width="17" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M244 68 L216 72 L226 98" stroke="${c.hex}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
    </g>
  </svg>`;
}

/* =====================================================================
   4-PAGE LEAFY-GREEN RULES MODAL (Exact WePlay "Card Type" / "Game Rules")
   ===================================================================== */
function openUnoRulesModal(initialPage) {
  let page = Math.max(0, Math.min(3, Number(initialPage) || 0));

  const miniCard = (color, value) =>
    renderUnoCardHtml({ color, value }, { mini: true });

  const pages = [
    {
      title: 'Card Type',
      body: `
        <h4 class="ur-sec-h">1. Number Cards</h4>
        <div class="ur-num-fan">
          ${miniCard('red', '0')}${miniCard('blue', '1')}${miniCard('yellow', '2')}${miniCard('green', '3')}${miniCard('red', '4')}
          ${miniCard('blue', '5')}${miniCard('yellow', '6')}${miniCard('green', '7')}${miniCard('red', '8')}${miniCard('blue', '9')}
        </div>
        <p class="ur-p">There are 4 colors of number cards (0–9), each with 2 cards. The score equals the card value.</p>
        <h4 class="ur-sec-h">2. Function Cards</h4>
        <div class="ur-fn-row">${miniCard('red', 'skip')}<p>You can skip your next player's turn compulsively by using this card.</p></div>
        <div class="ur-fn-row">${miniCard('yellow', 'draw2')}<p>If you use this card, the player next to you will skip their turn and draw 2 cards.</p></div>
        <div class="ur-fn-row">${miniCard('green', 'reverse')}<p>The order of turn will be reversed when it is used (acts as Skip in 1v1).</p></div>
        <div class="ur-fn-row">${miniCard('blue', 'discardAll')}<p>It allows you to discard all your cards of the same color in one turn.</p></div>
        <p class="ur-p ur-foot-note">These 4 types of cards (2 for each color) and their score will be <b>−20</b>.</p>
      `
    },
    {
      title: 'Card Type',
      body: `
        <h4 class="ur-sec-h">3. Special Cards</h4>
        <div class="ur-fn-row">${miniCard('wild', 'wild')}<p>It can match with any card and it can change the current color of the card.</p></div>
        <div class="ur-fn-row">${miniCard('wild', 'wild4')}<p>It can change the current color and let next player draw 4 cards.</p></div>
        <p class="ur-p">There are 2 types of special cards and each type has 4 cards; their score will be <b>−50</b>.</p>
        <p class="ur-p">Players can play Wild +4 at any time, but it will trigger a <b>Challenge</b> from the next player. If the player held a card of the previous color, it's a successful challenge and the player must draw 4 cards; otherwise, the challenger draws 6 cards. The next player can also refuse the challenge and draw 4.</p>
        <h4 class="ur-sec-h">4. Fun Play Card Types</h4>
        <p class="ur-p">There are <b>two decks</b> in Fun Play mode — all types of cards are doubled (240 cards total)!</p>
      `
    },
    {
      title: 'Game Rules',
      body: `
        <h4 class="ur-sec-h">1. Rules of Playing</h4>
        <p class="ur-p">Each player starts with 7 cards. Play a card matching the active <b>Color</b> or <b>Number / Symbol</b>, or play a Wild card.</p>
        <div class="ur-match-demo">
          <div class="ur-demo-pair">${miniCard('yellow', '1')}<b>=</b>${miniCard('yellow', '5')}</div>
          <div class="ur-demo-pair">${miniCard('red', '8')}<b>=</b>${miniCard('blue', '8')}</div>
        </div>
        <h4 class="ur-sec-h">2. Rules for ONE</h4>
        <p class="ur-p">Tap the golden <b>ONE</b> button when you are down to 1–2 cards! If you forget to call ONE before another player catches you, you draw <b>+2 penalty cards</b>.</p>
        <h4 class="ur-sec-h">3. Victory Rules</h4>
        <p class="ur-p">First player to empty their hand wins immediately! If the <b>05:00</b> match timer reaches 00:00, the player with the highest score (lowest card penalty) wins.</p>
      `
    },
    {
      title: 'Game Rules',
      body: `
        <h4 class="ur-sec-h">Classic &amp; Stake Payouts</h4>
        <p class="ur-p">In 4-Player tables, 1st place claims <b>70%</b> glory and 2nd place takes <b>30%</b>. In Stake matches, the winner takes 90% of the pot!</p>
        <h4 class="ur-sec-h">4. Stacking Rules (Fun Play)</h4>
        <div class="ur-match-demo">
          <div class="ur-demo-pair">${miniCard('red', 'draw2')}<b>+</b>${miniCard('blue', 'draw2')}<b>= +4!</b></div>
          <div class="ur-demo-pair">${miniCard('wild', 'wild4')}<b>→ +8!</b></div>
        </div>
        <p class="ur-p">In <b>Fun Play</b> mode, when hit with a <b>+2</b> or <b>+4</b>, you can stack another <b>+2</b> (on +2) or <b>+4</b> (on +2 or +4) to pass the combined draw penalty to the next player!</p>
        <p class="ur-p">If you cannot stack, tap the robot card shooter to draw the stacked penalty.</p>
      `
    }
  ];

  const m = modal('', `<div class="uno-rules-wrap" id="unoRulesWrap"></div>`, 'uno-rules-modal');
  const head = m.querySelector('.mh');
  if (head) head.style.display = 'none';

  const renderPage = () => {
    const p = pages[page];
    const wrap = m.querySelector('#unoRulesWrap');
    if (!wrap) return;
    wrap.innerHTML = `
      <div class="uno-leaf-board">
        <div class="uno-leaf-crown" aria-hidden="true"></div>
        <div class="uno-leaf-head">
          <span class="ur-leaf-dots">••• 🍃</span>
          <h3>${esc(p.title)}</h3>
          <span class="ur-leaf-dots">🍃 •••</span>
          <button type="button" class="ur-close-x" id="urCloseBtn" aria-label="Close rules">✕</button>
        </div>
        <div class="uno-leaf-paper">${p.body}</div>
      </div>
      <div class="uno-rules-pager">
        <button type="button" class="ur-nav-btn" id="urPrevBtn" ${page === 0 ? 'disabled' : ''}>‹</button>
        <div class="ur-dots">
          ${pages.map((_, i) => `<button type="button" class="ur-dot ${i === page ? 'on' : ''}" data-ur-pg="${i}" aria-label="Page ${i + 1}"></button>`).join('')}
        </div>
        <button type="button" class="ur-nav-btn" id="urNextBtn" ${page === pages.length - 1 ? 'disabled' : ''}>›</button>
      </div>
    `;
    const closeBtn = wrap.querySelector('#urCloseBtn');
    if (closeBtn) closeBtn.onclick = () => m.close();
    const prevBtn = wrap.querySelector('#urPrevBtn');
    if (prevBtn) prevBtn.onclick = () => { if (page > 0) { page--; renderPage(); } };
    const nextBtn = wrap.querySelector('#urNextBtn');
    if (nextBtn) nextBtn.onclick = () => { if (page < pages.length - 1) { page++; renderPage(); } };
    wrap.querySelectorAll('[data-ur-pg]').forEach(dot => {
      dot.onclick = () => {
        page = Number(dot.dataset.urPg) || 0;
        renderPage();
      };
    });
  };
  renderPage();
  return m;
}
window.openUnoRulesModal = openUnoRulesModal;

/* =====================================================================
   INVITE FRIEND MODAL (Room Code + Share + Mode Switch + Online Roster)
   ===================================================================== */
function openUnoInviteModal(opts) {
  const o = opts || {};
  const roomCode = o.roomCode || ('UN' + Math.floor(1000 + Math.random() * 9000));
  const curMode = o.mode || 'classic';
  const stake = Number(o.stake) || 0;

  const roster = typeof getRealOnlineUsers === 'function'
    ? getRealOnlineUsers().slice(0, 12)
    : (typeof allUsers === 'function' ? allUsers() : [])
        .filter(u => u && u.uid !== (typeof me !== 'undefined' ? me.uid : '') && !(typeof isGuestUser === 'function' && isGuestUser(u)))
        .slice(0, 12);
  const friends = roster.length ? roster : [];

  const modeLabel = curMode === 'fun' ? 'Fun Play (2 Decks + Stack)' : (curMode === '1v1' ? '1v1 Duel' : 'Classic (4 Players)');
  const invUrl = typeof buildRoomInviteUrl === 'function'
    ? buildRoomInviteUrl({ type: 'game', gameId: 'uno', roomCode, mode: curMode, stake })
    : `?room=${encodeURIComponent(roomCode)}&game=uno&mode=${encodeURIComponent(curMode)}`;
  const shareText = `🃏 Join my UNO Garden (${modeLabel}) table! Room Code: ${roomCode} ${invUrl}`;

  const m = modal('👥 Invite Friends · UNO Garden', `
    <div class="uno-inv-shell">
      <div class="uno-inv-code-card">
        <div>
          <small>TABLE ROOM CODE</small>
          <b class="uno-inv-code">${esc(roomCode)}</b>
          <span>${esc(modeLabel)} · ${stake > 0 ? `${stake} 🪙 Stake` : 'Free Table'}</span>
        </div>
        <div class="uno-inv-code-btns">
          <button type="button" class="btn sm" id="unoCopyCodeBtn">Copy</button>
          <button type="button" class="btn gold sm" id="unoShareChatBtn">World Chat</button>
        </div>
      </div>

      ${typeof o.onSwitchMode === 'function' ? `
        <div class="uno-inv-modes">
          <button type="button" class="uno-inv-mbtn ${curMode === 'classic' ? 'on' : ''}" data-umode="classic">Classic 4P</button>
          <button type="button" class="uno-inv-mbtn ${curMode === 'fun' ? 'on' : ''}" data-umode="fun">Fun Play +Stack</button>
          <button type="button" class="uno-inv-mbtn ${curMode === '1v1' ? 'on' : ''}" data-umode="1v1">1v1 Duel</button>
        </div>
      ` : ''}

      <div class="uno-inv-lbl">Online Players (${friends.length}) — Tap to Invite</div>
      <div class="uno-inv-list">
        ${friends.length ? friends.map(f => {
          const act = typeof getUserLiveActivity === 'function' ? getUserLiveActivity(f) : { label: 'Online' };
          return `
          <div class="uno-inv-row">
            <div class="uno-inv-av"><span class="sg-av-presence-wrap">${unoAvatarHtml(f.avatar || 'av_b1')}<span class="sg-online-dot sm"></span></span></div>
            <div class="uno-inv-info">
              <b>${esc(f.name || 'Friend')}</b>
              <small>${esc(act.label || 'Online · Ready for UNO')}</small>
            </div>
            <button type="button" class="btn sm uno-inv-seat-btn" data-inv-uid="${esc(f.uid)}">Invite</button>
          </div>`;
        }).join('') : '<div class="jki-empty">No active online friends right now. Post clickable invite to World Chat!</div>'}
      </div>
    </div>
  `, 'uno-invite-modal');

  const copyBtn = $('#unoCopyCodeBtn', m);
  if (copyBtn) {
    copyBtn.onclick = () => {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(shareText).catch(() => {});
      }
      toast(`UNO invite (${roomCode}) copied!`);
    };
  }
  const shareBtn = $('#unoShareChatBtn', m);
  if (shareBtn) {
    shareBtn.onclick = () => {
      if (typeof sendWorldMsg === 'function') {
        try {
          sendWorldMsg(shareText, {
            type: 'game_invite',
            gameId: 'uno',
            gameName: 'UNO Garden',
            roomCode,
            mode: curMode,
            stake,
            url: invUrl
          });
        } catch {}
      }
      toast(`Posted clickable UNO invite (${roomCode}) to World Chat!`);
    };
  }
  $$('[data-umode]', m).forEach(btn => {
    btn.onclick = () => {
      const nm = btn.dataset.umode;
      m.close();
      if (typeof o.onSwitchMode === 'function') o.onSwitchMode(nm);
    };
  });
  $$('[data-inv-uid]', m).forEach(btn => {
    btn.onclick = () => {
      const targetUid = btn.dataset.invUid;
      const friend = friends.find(x => x.uid === targetUid);
      if (!friend) return;
      btn.textContent = 'Invited ✓';
      btn.disabled = true;
      if (typeof sendUniversalRoomInviteToDm === 'function') {
        sendUniversalRoomInviteToDm(friend, {
          type: 'game',
          gameId: 'uno',
          gameName: 'UNO Garden',
          roomCode,
          mode: curMode,
          stake,
          text: shareText
        });
      }
      toast(`Sent clickable UNO invite to ${friend.name}!`);
      if (typeof o.onInviteFriend === 'function') {
        o.onInviteFriend(friend);
      }
    };
  });
  return m;
}
window.openUnoInviteModal = openUnoInviteModal;

/* =====================================================================
   MAIN UNO / OH MY CARD FULL-SCREEN GARDEN TABLE LAUNCHER
   ===================================================================== */
function launchUnoGame(stakeRaw, rival, modeRaw, botTierRaw, roomCodeRaw, launchOpts) {
  const Rules = window.UnoRules;
  if (!Rules) {
    toast('UNO rules module failed to load');
    return;
  }

  const lOpts = launchOpts || {};
  const isSpectating = Boolean(lOpts.spectate);
  const stake = isSpectating ? 0 : Math.max(0, Math.floor(Number(stakeRaw) || 0));
  const mode = (modeRaw === 'fun' || modeRaw === '1v1') ? modeRaw : 'classic';
  const funStacking = mode === 'fun';
  const playerCount = mode === '1v1' ? 2 : 4;
  const botTier = botTierRaw === 'pro' ? 'pro' : 'standard';
  const roomCode = roomCodeRaw || ('UN' + Math.floor(1000 + Math.random() * 9000));
  const modeTitle = mode === 'fun' ? 'Fun Play' : (mode === '1v1' ? '1v1 Duel' : 'Classic Free');

  // Build players array: Seat 0 = Me (or spectated friend), Seat 1..N-1 = Rivals/Bots
  const pool = UNO_BOT_ROSTER.slice();
  const pickBot = (idx) => {
    if (idx === 0 && rival && rival.name && !isSpectating) {
      return {
        id: rival.uid || 'rival_1',
        name: rival.name,
        avatar: rival.avatar || 'av_b1',
        gender: '♂',
        isBot: true
      };
    }
    const b = pool[idx % pool.length];
    return { id: b.uid, name: b.name, avatar: b.avatar, gender: b.gender, isBot: true };
  };

  const spectatedUser = lOpts.spectatedUser || (isSpectating ? rival : null);
  const myName = isSpectating
    ? ((spectatedUser && spectatedUser.name) || 'Player')
    : ((typeof me !== 'undefined' && me && me.name) ? me.name : 'You');
  const myAv = isSpectating
    ? ((spectatedUser && spectatedUser.avatar) || 'av_b1')
    : ((typeof me !== 'undefined' && me && me.avatar) ? me.avatar : 'av_b1');

  const players = [
    { id: isSpectating ? (spectatedUser?.uid || 'spec_0') : 'me', name: myName, avatar: myAv, gender: '♂', isBot: isSpectating, hand: [], saidUno: false, micOn: false }
  ];
  for (let i = 1; i < playerCount; i++) {
    const b = pickBot(i - 1);
    players.push({ ...b, hand: [], saidUno: false, micOn: false });
  }

  // Deck & Initial Deal
  let deck = Rules.buildDeck(mode);
  const discard = [];
  const drawOne = () => {
    if (!deck.length) {
      if (discard.length > 1) {
        const top = discard.pop();
        // Reshuffle discard pile back into deck
        const recycled = discard.splice(0, discard.length);
        for (let i = recycled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [recycled[i], recycled[j]] = [recycled[j], recycled[i]];
        }
        deck = recycled;
        discard.push(top);
      } else {
        deck = Rules.buildDeck(mode);
      }
    }
    return deck.pop();
  };

  for (let i = 0; i < 7; i++) {
    for (const p of players) p.hand.push(drawOne());
  }

  // Pick a clean number starting card
  let startCard = drawOne();
  let guard = 0;
  while ((startCard.color === 'wild' || startCard.kind !== 'number') && guard < 40) {
    deck.unshift(startCard);
    startCard = drawOne();
    guard++;
  }
  discard.push(startCard);

  let activeColor = startCard.color === 'wild' ? 'blue' : startCard.color;
  let direction = 1; // 1 = clockwise, -1 = counter-clockwise
  let turnIdx = 0;
  let pendingDraw = 0;
  let finished = false;
  let settled = false;
  let timeLeftSec = 300; // 05:00 WePlay countdown timer
  let phase = 'matching'; // 'matching' -> 'matched' -> 'playing' -> 'gameover'
  let pendingWildCardIdx = null;
  let pendingWild4Challenge = null; // { offenderIdx, prevHand, prevActiveColor, newColor }
  let catchTargetIdx = null; // bot who forgot ONE
  let statusBanner = 'Your turn! Match color or number.';
  let lastPopCardId = startCard.id;

  // Voice & Mic State
  let micState = {
    live: false,
    mode: 'open', // 'open' | 'ptt'
    noiseGate: true,
    tone: 'Natural',
    stream: null
  };
  let activePopover = null; // null | 'mic' | 'chat' | 'menu'
  let seatBubbles = {}; // seatIdx -> text

  const timers = [];
  const addTimer = (fn, ms) => {
    const id = setTimeout(fn, ms);
    timers.push(id);
    return id;
  };
  let clockInterval = null;
  let turnTickInterval = null;
  let turnActionTimer = null;
  let turnDeadline = 0;
  let playerAfk = false;
  const TURN_SEC = (Rules.TURN_CONFIG && Rules.TURN_CONFIG.TURN_SECONDS) || 15;
  const TURN_MS = TURN_SEC * 1000;
  const UNO_RING_CIRC = 176; // 2 * PI * 28

  const stopTurnTimer = () => {
    if (turnTickInterval) { clearInterval(turnTickInterval); turnTickInterval = null; }
    if (turnActionTimer) { clearTimeout(turnActionTimer); turnActionTimer = null; }
  };

  const clearAllTimers = () => {
    stopTurnTimer();
    while (timers.length) clearTimeout(timers.pop());
    if (clockInterval) { clearInterval(clockInterval); clockInterval = null; }
  };

  const stopMicStream = () => {
    if (micState.stream) {
      try { micState.stream.getTracks().forEach(t => t.stop()); } catch {}
      micState.stream = null;
    }
    micState.live = false;
    players[0].micOn = false;
  };

  const view = openFullScreenGameView({
    gameId: 'uno',
    title: isSpectating ? `Spectating ${myName} · UNO` : 'Oh My Card · UNO',
    subMeta: modeTitle,
    statusText: isSpectating ? 'Spectating' : modeTitle,
    statusTone: 'turn',
    themeClass: 'gfs-theme-uno',
    html: `<div class="uno-garden-root" id="unoGardenRoot" data-testid="uno-garden-root"></div>${isSpectating ? '<div id="unoTableChatHost" class="uno-tchat-host"></div>' : ''}`
  });

  if (!isSpectating && typeof setMyLiveActivity === 'function') {
    setMyLiveActivity({ type: 'game', gameId: 'uno', gameName: 'UNO Garden', roomCode, mode });
  }

  let tableChatWidget = null;
  if (isSpectating && typeof createInGameChatWidget === 'function') {
    tableChatWidget = createInGameChatWidget({
      roomCode,
      gameName: 'UNO Garden',
      spectate: true,
      quickMessages: ['Nice play! 🃏', 'Watch out +4! 🔥', 'ONE! 🔔', 'Good game! 🤝'],
      onSend: (txt) => {
        showBubble(0, txt);
      }
    });
    const chatHost = $('#unoTableChatHost', view);
    if (chatHost) tableChatWidget.mount(chatHost);
  }

  view.onclose = () => {
    finished = true;
    clearAllTimers();
    stopMicStream();
    if (tableChatWidget && typeof tableChatWidget.destroy === 'function') tableChatWidget.destroy();
    if (!isSpectating && typeof setMyLiveActivity === 'function') {
      setMyLiveActivity({ type: 'online' });
    }
  };

  const rootEl = $('#unoGardenRoot', view);

  const showBubble = (seatIdx, text) => {
    seatBubbles[seatIdx] = text;
    render();
    addTimer(() => {
      if (seatBubbles[seatIdx] === text) {
        delete seatBubbles[seatIdx];
        render();
      }
    }, 2200);
  };

  const getSeatSlotClass = (idx) => {
    if (idx === 0) return 'slot-me';
    if (playerCount === 2) return 'slot-top-center';
    if (idx === 1) return 'slot-left';
    if (idx === 2) return 'slot-top';
    return 'slot-right';
  };

  const topCard = () => discard[discard.length - 1];

  const finishMatch = (reasonText) => {
    if (finished) return;
    finished = true;
    phase = 'gameover';
    clearAllTimers();
    const ranked = Rules.rankPlayers(players);
    const myRank = ranked.findIndex(r => r.id === 'me');
    const won = myRank === 0;
    let outcomeInfo = { headline: isSpectating ? `🏆 ${ranked[0].name} Won!` : (won ? '🏆 Victory!' : 'Match Complete'), detail: reasonText || '' };
    if (!settled && !isSpectating) {
      settled = true;
      if (typeof settleArenaMatchOutcome === 'function') {
        outcomeInfo = settleArenaMatchOutcome(won ? 'win' : 'lose', stake, 38, 65, 22);
      } else if (typeof playSfx === 'function') {
        playSfx(won ? 'duelWin' : 'matchLose');
      }
    } else if (typeof playSfx === 'function') {
      playSfx('duelWin');
    }
    if (won && typeof spawnArenaSparks === 'function') {
      spawnArenaSparks(rootEl, '#fde047', 16);
    }
    statusBanner = reasonText || outcomeInfo.headline;
    renderGameOver(ranked, outcomeInfo);
  };

  const checkForWin = (pIdx) => {
    if (players[pIdx].hand.length === 0) {
      const winner = players[pIdx];
      finishMatch(`${winner.name} emptied their hand!`);
      return true;
    }
    return false;
  };

  const updateTurnRingDom = () => {
    if (!rootEl || finished || phase !== 'playing') return;
    const remMs = Math.max(0, turnDeadline - Date.now());
    const remSec = Math.ceil(remMs / 1000);
    const frac = Math.max(0, Math.min(1, remMs / TURN_MS));
    const fg = rootEl.querySelector('.uno-seat.is-turn .uno-turn-ring-fg');
    const pill = rootEl.querySelector('.uno-seat.is-turn .uno-turn-pill');
    if (fg) {
      fg.style.strokeDashoffset = String((UNO_RING_CIRC * (1 - frac)).toFixed(1));
      fg.classList.toggle('warn', remSec <= 7 && remSec > 4);
      fg.classList.toggle('danger', remSec <= 4);
    }
    if (pill) {
      pill.textContent = `${remSec}s`;
      pill.classList.toggle('warn', remSec <= 7 && remSec > 4);
      pill.classList.toggle('danger', remSec <= 4);
    }
  };

  const runNoobHumanAutoTurn = () => {
    if (finished || phase !== 'playing' || turnIdx !== 0) return;
    stopTurnTimer();
    // If Wild +4 challenge prompt is open, automatically accept +4 so match never stalls
    if (pendingWild4Challenge) {
      resolveUserWild4Decision(false);
      return;
    }
    // If Wild color picker was open, pick dominant color and play that wild card
    if (pendingWildCardIdx !== null) {
      const idx = pendingWildCardIdx;
      pendingWildCardIdx = null;
      const card = players[0].hand[idx];
      if (card) {
        const rem = players[0].hand.filter((_, i) => i !== idx);
        const col = Rules.pickDominantColor(rem, activeColor);
        handleCardPlay(0, idx, col);
        return;
      }
    }
    const meHand = players[0].hand;
    const move = Rules.chooseNoobMove(meHand, topCard(), activeColor, pendingDraw, funStacking);
    if (move.action === 'draw' || !move.card) {
      showBubble(0, '🤖 Auto Draw');
      handleDrawAction(0);
      return;
    }
    const idx = meHand.findIndex(c => c.id === move.card.id);
    if (idx < 0) {
      handleDrawAction(0);
      return;
    }
    if (meHand.length === 2) players[0].saidUno = true;
    showBubble(0, '🤖 Auto-Play');
    handleCardPlay(0, idx, move.chosenColor);
  };

  const resumeFromAfk = () => {
    if (!playerAfk || finished) return;
    playerAfk = false;
    const bar = rootEl && rootEl.querySelector('#unoAfkBanner');
    if (bar) bar.remove();
    const dot = rootEl && rootEl.querySelector('.uno-afk-dot');
    if (dot) dot.remove();
    toast('👋 Manual control resumed!');
    if (phase === 'playing' && turnIdx === 0) {
      if (turnActionTimer) clearTimeout(turnActionTimer);
      const remMs = Math.max(1200, turnDeadline - Date.now());
      turnActionTimer = setTimeout(() => {
        if (finished || phase !== 'playing' || turnIdx !== 0) return;
        playerAfk = true;
        toast('⏱️ 15s time up! Auto-Play Bot took over — tap screen to resume');
        runNoobHumanAutoTurn();
      }, remMs);
    }
  };

  const startTurnTimer = () => {
    stopTurnTimer();
    if (finished || phase !== 'playing') return;
    const curP = players[turnIdx];
    if (!curP) return;

    turnDeadline = Date.now() + TURN_MS;
    updateTurnRingDom();
    turnTickInterval = setInterval(updateTurnRingDom, 100);

    if (curP.isBot && !pendingWild4Challenge) {
      // Bots wait a realistic 3–4 seconds while their 15s countdown ring ticks down
      const botMs = Rules.getTurnActionDelayMs(true, false);
      turnActionTimer = setTimeout(() => runBotTurn(), botMs);
    } else if (turnIdx === 0) {
      if (playerAfk) {
        // 15s timer starts visibly; after 3s noob bot plays automatically unless user taps screen
        const afkMs = Rules.getTurnActionDelayMs(false, true);
        turnActionTimer = setTimeout(() => {
          if (finished || phase !== 'playing' || turnIdx !== 0 || !playerAfk) return;
          runNoobHumanAutoTurn();
        }, afkMs);
      } else {
        turnActionTimer = setTimeout(() => {
          if (finished || phase !== 'playing' || turnIdx !== 0) return;
          playerAfk = true;
          toast('⏱️ 15s time up! Auto-Play Bot took over — tap screen to resume');
          runNoobHumanAutoTurn();
        }, TURN_MS);
      }
    }
  };

  const advanceTurn = (steps) => {
    if (finished) return;
    stopTurnTimer();
    turnIdx = Rules.getNextSeat(turnIdx, players.length, direction, steps == null ? 1 : steps);
    if (turnIdx === 0 && playerAfk) {
      statusBanner = '🤖 Auto-Play ON (3s) — tap screen to take control';
    } else if (players[turnIdx] && players[turnIdx].isBot) {
      statusBanner = `${players[turnIdx].name} is thinking…`;
    }
    render();
    startTurnTimer();
  };

  const handleCardPlay = (pIdx, cardIdx, chosenColor) => {
    if (finished) return;
    const p = players[pIdx];
    const card = p.hand[cardIdx];
    if (!card) return;
    if (!Rules.canPlayCard(card, topCard(), activeColor, pendingDraw, funStacking)) return;
    stopTurnTimer();

    const prevHandSnapshot = p.hand.slice();
    const prevColorSnapshot = activeColor;
    let discardedCount = 1;

    if (card.value === 'discardAll') {
      const res = Rules.applyDiscardAll(p.hand, card);
      p.hand = res.remainingHand;
      for (const dc of res.discardedCards) discard.push(dc);
      discardedCount = res.discardedCards.length;
      activeColor = card.color;
    } else {
      p.hand.splice(cardIdx, 1);
      discard.push(card);
      activeColor = card.color === 'wild' ? (chosenColor || 'blue') : card.color;
    }

    lastPopCardId = card.id;
    if (typeof playSfx === 'function') {
      const isSpecial = ['reverse', 'skip', 'draw2', 'wild', 'wild4', 'discardAll'].includes(card.value);
      playSfx(isSpecial ? 'capture' : 'cardPlay');
    }

    // Reset ONE flag if player has > 1 card
    if (p.hand.length > 1) p.saidUno = false;

    // Bot ONE call / forget chance (25% chance to forget so user can tap Catch +2!)
    if (p.hand.length === 1) {
      if (p.isBot) {
        if (Math.random() < 0.72) {
          p.saidUno = true;
          showBubble(pIdx, 'ONE! 🔔');
        } else {
          p.saidUno = false;
          catchTargetIdx = pIdx;
        }
      } else if (!p.saidUno) {
        // User had 1 card left without pressing ONE earlier — show brief reminder; bots may catch if not pressed
        statusBanner = 'Quick! Tap ONE! before getting caught!';
      }
    } else if (catchTargetIdx === pIdx) {
      catchTargetIdx = null;
    }

    if (checkForWin(pIdx)) return;

    // Resolve card effects
    if (card.value === 'discardAll') {
      statusBanner = `${p.name} cleared ${discardedCount} ${UNO_COLOR_META[activeColor].label} card${discardedCount > 1 ? 's' : ''}!`;
      showBubble(pIdx, `Clear ×${discardedCount}! ✨`);
      advanceTurn(1);
      return;
    }

    if (card.value === 'reverse') {
      if (players.length === 2) {
        statusBanner = `${p.name} played Reverse (acts as Skip in 1v1)!`;
        showBubble(pIdx, 'Reverse! ⇄');
        advanceTurn(2);
      } else {
        direction = direction === 1 ? -1 : 1;
        statusBanner = `${p.name} reversed turn order!`;
        showBubble(pIdx, 'Reverse! ⇄');
        advanceTurn(1);
      }
      return;
    }

    if (card.value === 'skip') {
      const skipped = players[Rules.getNextSeat(pIdx, players.length, direction, 1)];
      statusBanner = `${p.name} skipped ${skipped.name}!`;
      showBubble(pIdx, 'Skip! ×');
      advanceTurn(2);
      return;
    }

    if (card.value === 'draw2') {
      if (funStacking) {
        pendingDraw += 2;
        statusBanner = `${p.name} stacked +2 (Total +${pendingDraw})!`;
        showBubble(pIdx, `Stack +${pendingDraw}! ⚡`);
        advanceTurn(1);
      } else {
        const victimIdx = Rules.getNextSeat(pIdx, players.length, direction, 1);
        players[victimIdx].hand.push(drawOne(), drawOne());
        players[victimIdx].saidUno = false;
        statusBanner = `${p.name} hit ${players[victimIdx].name} with +2!`;
        showBubble(pIdx, '+2! 💥');
        showBubble(victimIdx, '+2 cards 😵');
        advanceTurn(2);
      }
      return;
    }

    if (card.value === 'wild') {
      statusBanner = `${p.name} switched color to ${UNO_COLOR_META[activeColor].label}!`;
      showBubble(pIdx, `${UNO_COLOR_META[activeColor].label}! 🎨`);
      advanceTurn(1);
      return;
    }

    if (card.value === 'wild4') {
      const nextIdx = Rules.getNextSeat(pIdx, players.length, direction, 1);
      if (funStacking) {
        pendingDraw += 4;
        statusBanner = `${p.name} dropped Wild +4 (Stack +${pendingDraw}) → ${UNO_COLOR_META[activeColor].label}!`;
        showBubble(pIdx, `+${pendingDraw}! 🌈`);
        advanceTurn(1);
        return;
      }

      // Classic / 1v1 Wild +4 Challenge mechanic (matching WePlay rules page 2!)
      showBubble(pIdx, `Wild +4 → ${UNO_COLOR_META[activeColor].label}!`);
      if (nextIdx === 0) {
        // Ask the human player whether to Challenge or Accept +4!
        turnIdx = 0;
        pendingWild4Challenge = {
          offenderIdx: pIdx,
          prevHand: prevHandSnapshot,
          prevActiveColor: prevColorSnapshot,
          newColor: activeColor
        };
        statusBanner = `${p.name} played Wild +4! Challenge or Draw 4?`;
        render();
        startTurnTimer();
        return;
      } else {
        // Bot decides whether to challenge (~38% chance)
        const botChallenges = Math.random() < 0.38;
        if (botChallenges) {
          const res = Rules.evaluateWild4Challenge(prevHandSnapshot, prevColorSnapshot);
          if (res.challengeSucceeded) {
            for (let k = 0; k < res.offenderDraw; k++) players[pIdx].hand.push(drawOne());
            players[pIdx].saidUno = false;
            statusBanner = `${players[nextIdx].name} challenged & CAUGHT ${p.name}! ${p.name} draws 4!`;
            showBubble(nextIdx, 'Caught bluff! ⚖️');
            showBubble(pIdx, 'Busted +4 😅');
            advanceTurn(1);
          } else {
            for (let k = 0; k < res.challengerDraw; k++) players[nextIdx].hand.push(drawOne());
            players[nextIdx].saidUno = false;
            statusBanner = `${players[nextIdx].name} challenged & FAILED! Draws 6 cards!`;
            showBubble(nextIdx, 'Failed +6! 😱');
            advanceTurn(2);
          }
        } else {
          for (let k = 0; k < 4; k++) players[nextIdx].hand.push(drawOne());
          players[nextIdx].saidUno = false;
          statusBanner = `${players[nextIdx].name} accepted +4 cards!`;
          showBubble(nextIdx, '+4 cards 😵');
          advanceTurn(2);
        }
        return;
      }
    }

    // Standard number card
    statusBanner = `${p.name} played ${UNO_COLOR_META[activeColor].label} ${card.value}`;
    advanceTurn(1);
  };

  const resolveUserWild4Decision = (doChallenge) => {
    if (!pendingWild4Challenge || finished) return;
    stopTurnTimer();
    const ch = pendingWild4Challenge;
    pendingWild4Challenge = null;
    const offender = players[ch.offenderIdx];
    if (!doChallenge) {
      for (let k = 0; k < 4; k++) players[0].hand.push(drawOne());
      players[0].saidUno = false;
      statusBanner = `You accepted +4 from ${offender.name}. Turn skipped.`;
      showBubble(0, '+4 cards 😅');
      advanceTurn(1);
      return;
    }
    const res = Rules.evaluateWild4Challenge(ch.prevHand, ch.prevActiveColor);
    if (res.challengeSucceeded) {
      for (let k = 0; k < res.offenderDraw; k++) offender.hand.push(drawOne());
      offender.saidUno = false;
      statusBanner = `Challenge WON! ${offender.name} bluffed and draws 4! Your turn!`;
      showBubble(0, 'Caught bluff! ⚖️');
      showBubble(ch.offenderIdx, 'Busted +4 😵');
      if (typeof playSfx === 'function') playSfx('coin');
      turnIdx = 0;
      render();
      startTurnTimer();
    } else {
      for (let k = 0; k < res.challengerDraw; k++) players[0].hand.push(drawOne());
      players[0].saidUno = false;
      statusBanner = `Challenge failed — ${offender.name} had no ${UNO_COLOR_META[ch.prevActiveColor].label}! You draw 6.`;
      showBubble(0, 'Ouch +6! 😱');
      if (typeof playSfx === 'function') playSfx('duelWrong');
      advanceTurn(1);
    }
  };

  const handleDrawAction = (pIdx) => {
    if (finished || pIdx !== turnIdx) return;
    stopTurnTimer();
    const p = players[pIdx];
    if (pendingDraw > 0) {
      const amt = pendingDraw;
      pendingDraw = 0;
      for (let k = 0; k < amt; k++) p.hand.push(drawOne());
      p.saidUno = false;
      statusBanner = `${p.name} drew stacked +${amt} cards!`;
      showBubble(pIdx, `Drew +${amt} 😵`);
      if (typeof playSfx === 'function') playSfx('duelWrong');
      advanceTurn(1);
      return;
    }

    const drawn = drawOne();
    p.hand.push(drawn);
    p.saidUno = false;
    if (typeof playSfx === 'function') playSfx('cardDraw');
    statusBanner = `${p.name} drew a card from the visor shooter.`;
    showBubble(pIdx, 'Draw 🃏');
    advanceTurn(1);
  };

  const runBotTurn = () => {
    if (finished || phase !== 'playing' || !players[turnIdx].isBot) return;
    const bot = players[turnIdx];
    const nextIdx = Rules.getNextSeat(turnIdx, players.length, direction, 1);
    // If human forgot ONE with 1 card, bot has 45% chance to catch!
    if (players[0].hand.length === 1 && !players[0].saidUno && Math.random() < 0.45) {
      players[0].hand.push(drawOne(), drawOne());
      statusBanner = `${bot.name} caught you forgetting ONE! +2 cards!`;
      showBubble(turnIdx, 'Caught! +2! 😈');
      toast('Forgot to shout ONE! Drew +2 penalty cards.');
    }

    const move = Rules.chooseBotMove(
      bot.hand,
      topCard(),
      activeColor,
      pendingDraw,
      funStacking,
      players[nextIdx].hand.length,
      botTier
    );
    if (move.action === 'draw' || !move.card) {
      handleDrawAction(turnIdx);
      return;
    }
    const idx = bot.hand.findIndex(c => c.id === move.card.id);
    if (idx < 0) {
      handleDrawAction(turnIdx);
      return;
    }
    handleCardPlay(turnIdx, idx, move.chosenColor);
  };

  const startPlayingPhase = () => {
    if (phase === 'playing' || finished) return;
    phase = 'playing';
    if (!clockInterval) {
      clockInterval = setInterval(() => {
        if (finished || phase !== 'playing') return;
        timeLeftSec--;
        const clk = rootEl && rootEl.querySelector('#unoClockVal');
        if (clk) clk.textContent = unoFormatClock(timeLeftSec);
        if (timeLeftSec <= 0) {
          finishMatch('Time up! Ranked by highest card score.');
        }
      }, 1000);
    }
    render();
    startTurnTimer();
  };

  const toggleLiveMic = async () => {
    if (micState.live) {
      stopMicStream();
      toast('Mic muted');
      render();
      return;
    }
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        micState.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      }
      micState.live = true;
      players[0].micOn = true;
      toast(`Live Mic ON (${micState.mode === 'ptt' ? 'Push-to-Talk' : 'Open Mic'} · ${micState.tone})`);
    } catch {
      // Fallback to voice-room simulated live mic state when browser denies mic in preview
      micState.live = true;
      players[0].micOn = true;
      toast(`Voice Room Mic ON (${micState.tone})`);
    }
    render();
  };

  const openModeSwitch = (newMode) => {
    if (newMode === mode) return;
    clearAllTimers();
    stopMicStream();
    launchUnoGame(stake, rival, newMode, botTier, roomCode);
  };

  const seatInvitedFriend = (friend) => {
    if (!friend || !friend.name) return;
    const targetIdx = players.length > 1 ? 1 : 0;
    if (targetIdx > 0) {
      players[targetIdx].name = friend.name;
      players[targetIdx].avatar = friend.avatar || 'av_b1';
      players[targetIdx].id = friend.uid || players[targetIdx].id;
      showBubble(targetIdx, 'Joined! 👋');
      render();
    }
  };

  const renderPopoverHtml = () => {
    if (!activePopover) return '';
    if (activePopover === 'mic') {
      const tones = ['Natural', 'Deep', 'Crisp', 'Studio'];
      return `<div class="uno-pop-card uno-mic-pop" data-testid="uno-mic-popover">
        <div class="uno-pop-head">
          <b>🎙️ Mic &amp; Voice Options</b>
          <button type="button" class="uno-pop-x" data-close-pop="1">✕</button>
        </div>
        <div class="uno-pop-row">
          <span>Live Microphone</span>
          <button type="button" class="uno-tog-btn ${micState.live ? 'on' : ''}" id="unoPopMicLive">${micState.live ? 'ON · Live' : 'OFF · Muted'}</button>
        </div>
        <div class="uno-pop-row">
          <span>Input Mode</span>
          <div class="uno-seg">
            <button type="button" class="${micState.mode === 'open' ? 'on' : ''}" data-mic-mode="open">Open Mic</button>
            <button type="button" class="${micState.mode === 'ptt' ? 'on' : ''}" data-mic-mode="ptt">Push-to-Talk</button>
          </div>
        </div>
        <div class="uno-pop-row">
          <span>Noise Gate</span>
          <button type="button" class="uno-tog-btn ${micState.noiseGate ? 'on' : ''}" id="unoPopNoiseGate">${micState.noiseGate ? 'Enabled' : 'Off'}</button>
        </div>
        <div class="uno-pop-row col">
          <span>AI Voice Tone</span>
          <div class="uno-tone-pills">
            ${tones.map(t => `<button type="button" class="${micState.tone === t ? 'on' : ''}" data-mic-tone="${t}">${t}</button>`).join('')}
          </div>
        </div>
      </div>`;
    }
    if (activePopover === 'chat') {
      return `<div class="uno-pop-card uno-chat-pop" data-testid="uno-chat-popover">
        <div class="uno-pop-head">
          <b>💬 Quick Voice &amp; Emotes</b>
          <button type="button" class="uno-pop-x" data-close-pop="1">✕</button>
        </div>
        <div class="uno-emote-grid">
          ${UNO_EMOTES.map(em => `<button type="button" class="uno-em-btn" data-uno-em="${em}">${em}</button>`).join('')}
        </div>
        <div class="uno-qc-list">
          ${UNO_QUICK_CHATS.map(msg => `<button type="button" class="uno-qc-btn" data-uno-qc="${esc(msg)}">${esc(msg)}</button>`).join('')}
        </div>
      </div>`;
    }
    if (activePopover === 'menu') {
      return `<div class="uno-pop-card uno-menu-pop" data-testid="uno-menu-popover">
        <div class="uno-pop-head">
          <b>☰ Table Menu · ${esc(modeTitle)}</b>
          <button type="button" class="uno-pop-x" data-close-pop="1">✕</button>
        </div>
        <div class="uno-menu-list">
          <button type="button" id="unoMenuRules">📖 Card Types &amp; Rules</button>
          <button type="button" id="unoMenuInvite">👥 Invite Friend (Code ${esc(roomCode)})</button>
          <button type="button" data-menu-mode="classic" class="${mode === 'classic' ? 'on' : ''}">🌿 Classic 4P</button>
          <button type="button" data-menu-mode="fun" class="${mode === 'fun' ? 'on' : ''}">⚡ Fun Play (2 Decks + Stack)</button>
          <button type="button" data-menu-mode="1v1" class="${mode === '1v1' ? 'on' : ''}">⚔️ 1v1 Duel</button>
          <button type="button" id="unoMenuExit" class="danger">🚪 Exit Table</button>
        </div>
      </div>`;
    }
    return '';
  };

  const renderMatchingOverlay = () => {
    if (phase !== 'matching' && phase !== 'matched') return '';
    const isMatched = phase === 'matched';
    const slots = [];
    for (let i = 0; i < playerCount; i++) {
      const p = players[i];
      const revealed = i === 0 || isMatched;
      slots.push(`
        <div class="uno-vs-slot s${i} ${revealed ? 'filled' : 'empty'}">
          <div class="uno-vs-av">${revealed ? unoAvatarHtml(p.avatar) : '<span>Empty</span>'}</div>
          ${revealed ? `<span class="uno-vs-name">${esc(unoShortName(p.name, 9))}</span>` : ''}
        </div>
      `);
    }
    return `<div class="uno-match-overlay" id="unoMatchOverlay" data-testid="uno-match-overlay">
      <div class="uno-match-top">
        <button type="button" class="uno-m-pill" id="unoMatchExitBtn">✕ Exit</button>
        <span class="uno-m-title">${esc(modeTitle)}</span>
        <button type="button" class="uno-m-pill" id="unoMatchSkipBtn">Start ›</button>
      </div>
      <div class="uno-match-radar">
        <div class="uno-radar-ring"></div>
        <div class="uno-vs-badge">VS</div>
        ${slots.join('')}
      </div>
      <div class="uno-match-status">
        <b>${isMatched ? 'Match succeeded!' : 'Matching...'}</b>
        <small>${isMatched ? 'Dealing 7 cards · Tap anywhere to play' : 'Finding table players · Tap to start immediately'}</small>
      </div>
    </div>`;
  };

  const renderGameOver = (ranked, outcomeInfo) => {
    if (!rootEl) return;
    render(); // refresh table underneath
    const host = document.createElement('div');
    host.className = 'uno-go-overlay';
    host.dataset.testid = 'uno-gameover-overlay';
    host.innerHTML = `
      <div class="uno-go-card">
        <div class="uno-leaf-crown" aria-hidden="true"></div>
        <h3 class="uno-go-h">${ranked[0].id === 'me' ? '🏆 VICTORY!' : '🌿 MATCH OVER'}</h3>
        <p class="uno-go-sub">${esc(outcomeInfo.headline)} ${outcomeInfo.detail ? '· ' + esc(outcomeInfo.detail) : ''}</p>
        <div class="uno-go-ranks">
          ${ranked.map((r, i) => {
            const p = players[r.idx];
            return `<div class="uno-go-row ${r.id === 'me' ? 'is-me' : ''} ${i === 0 ? 'is-win' : ''}">
              <span class="uno-go-pos">#${i + 1}</span>
              <div class="uno-go-av">${unoAvatarHtml(p.avatar)}</div>
              <div class="uno-go-meta">
                <b>${esc(p.name)}</b>
                <small>${r.cardCount === 0 ? 'Cleared hand!' : `${r.cardCount} cards left`}</small>
              </div>
              <span class="uno-go-score">${r.score === 0 ? 'WIN' : r.score}</span>
            </div>`;
          }).join('')}
        </div>
        <div class="uno-go-actions">
          <button type="button" class="uno-go-exit" id="unoGoExitBtn">Exit</button>
          <button type="button" class="uno-go-again" id="unoGoAgainBtn">Play Again</button>
        </div>
      </div>
    `;
    rootEl.appendChild(host);
    const ex = host.querySelector('#unoGoExitBtn');
    if (ex) ex.onclick = () => view.close();
    const ag = host.querySelector('#unoGoAgainBtn');
    if (ag) ag.onclick = () => launchUnoGame(stake, rival, mode, botTier, roomCode);
  };

  const render = () => {
    if (!rootEl) return;
    const top = topCard();
    const isMyTurn = !isSpectating && phase === 'playing' && turnIdx === 0 && !finished && !pendingWild4Challenge;
    const sfxMuted = typeof SFX !== 'undefined' && typeof SFX.isMuted === 'function' ? SFX.isMuted() : false;

    const myHand = players[0].hand;
    const totalCards = myHand.length;
    const mid = (totalCards - 1) / 2;
    const overlapPx = totalCards > 9 ? -22 : (totalCards > 6 ? -14 : (totalCards > 4 ? -8 : -2));

    const handHtml = myHand.map((card, idx) => {
      const playable = isMyTurn && Rules.canPlayCard(card, top, activeColor, pendingDraw, funStacking);
      const off = idx - mid;
      const rot = (off * (totalCards > 8 ? 1.6 : 2.1)).toFixed(1);
      const ty = (Math.abs(off) * (totalCards > 8 ? 1.1 : 1.5)).toFixed(1);
      const ml = idx === 0 ? 0 : overlapPx;
      return renderUnoCardHtml(card, {
        interactive: !isSpectating,
        index: idx,
        playable,
        dimmed: !isSpectating && !playable,
        style: `margin-left:${ml}px;transform:translateY(${ty}px) rotate(${rot}deg);z-index:${idx + 1}`
      });
    }).join('');

    const remSecNow = turnDeadline > 0 ? Math.max(0, Math.ceil((turnDeadline - Date.now()) / 1000)) : TURN_SEC;
    const fracNow = turnDeadline > 0 ? Math.max(0, Math.min(1, (turnDeadline - Date.now()) / TURN_MS)) : 1;
    const dashOffNow = (UNO_RING_CIRC * (1 - fracNow)).toFixed(1);
    const makeTurnRing = (isTurnSeat) => isTurnSeat
      ? `<svg class="uno-turn-ring-svg" viewBox="0 0 64 64" aria-hidden="true">
           <circle class="uno-turn-ring-bg" cx="32" cy="32" r="28"/>
           <circle class="uno-turn-ring-fg ${remSecNow <= 4 ? 'danger' : remSecNow <= 7 ? 'warn' : ''}" cx="32" cy="32" r="28" stroke-dasharray="${UNO_RING_CIRC}" stroke-dashoffset="${dashOffNow}"/>
         </svg>
         <span class="uno-turn-pill ${remSecNow <= 4 ? 'danger' : remSecNow <= 7 ? 'warn' : ''}" data-testid="uno-turn-timer">${remSecNow}s</span>`
      : '';

    const opponentsHtml = players.slice(1).map((p, i) => {
      const sIdx = i + 1;
      const isTurn = phase === 'playing' && turnIdx === sIdx && !finished;
      const bubble = seatBubbles[sIdx] ? `<div class="uno-seat-bubble">${esc(seatBubbles[sIdx])}</div>` : '';
      const unoTag = p.hand.length === 1 && p.saidUno ? `<span class="uno-said-badge">ONE!</span>` : '';
      return `<div class="uno-seat ${getSeatSlotClass(sIdx)} ${isTurn ? 'is-turn' : ''}" data-seat="${sIdx}">
        ${renderUnoCardBackFan(p.hand.length)}
        <div class="uno-av-ring">
          ${makeTurnRing(isTurn)}
          <div class="uno-av-clip">${unoAvatarHtml(p.avatar)}</div>
          <span class="uno-cnt-badge">${p.hand.length}</span>
          ${unoTag}
        </div>
        <span class="uno-seat-name">${esc(unoShortName(p.name, 9))}</span>
        ${bubble}
      </div>`;
    }).join('');

    const oneBtnActive = !isSpectating && players[0].hand.length <= 2 && !players[0].saidUno;
    const myBubble = seatBubbles[0] ? `<div class="uno-seat-bubble me">${esc(seatBubbles[0])}</div>` : '';

    const wildPickerHtml = pendingWildCardIdx !== null ? `
      <div class="uno-center-dialog" data-testid="uno-wild-picker">
        <div class="uno-dialog-box">
          <b>Choose Active Color</b>
          <div class="uno-color-wheel-grid">
            <button type="button" class="uno-cw-btn c-red" data-pick-color="red">Pink</button>
            <button type="button" class="uno-cw-btn c-blue" data-pick-color="blue">Blue</button>
            <button type="button" class="uno-cw-btn c-yellow" data-pick-color="yellow">Yellow</button>
            <button type="button" class="uno-cw-btn c-green" data-pick-color="green">Green</button>
          </div>
          <button type="button" class="uno-dlg-cancel" id="unoCancelWildBtn">Cancel</button>
        </div>
      </div>
    ` : '';

    const challengeHtml = pendingWild4Challenge ? `
      <div class="uno-center-dialog" data-testid="uno-challenge-dialog">
        <div class="uno-dialog-box">
          <b>⚡ Wild +4 Challenge!</b>
          <p>${esc(players[pendingWild4Challenge.offenderIdx].name)} played Wild +4! Did they bluff while holding <b>${esc(UNO_COLOR_META[pendingWild4Challenge.prevActiveColor].label)}</b>?</p>
          <div class="uno-ch-btns">
            <button type="button" class="uno-ch-btn challenge" id="unoDoChallengeBtn">⚔️ Challenge</button>
            <button type="button" class="uno-ch-btn accept" id="unoAccept4Btn">Draw 4</button>
          </div>
        </div>
      </div>
    ` : '';

    const catchHtml = (!isSpectating && catchTargetIdx !== null && players[catchTargetIdx] && players[catchTargetIdx].hand.length === 1 && !players[catchTargetIdx].saidUno)
      ? `<button type="button" class="uno-catch-pill" id="unoCatchBtn">🔔 Catch ${esc(unoShortName(players[catchTargetIdx].name, 7))} +2!</button>`
      : '';

    rootEl.innerHTML = `
      ${renderGardenScenerySvg()}
      ${isSpectating ? `<div class="sg-spectate-banner">👁️ Spectating <b>${esc(myName)}</b>'s UNO match · Room ${esc(roomCode)}</div>` : ''}

      <!-- Top Garden HUD Bar -->
      <div class="uno-top-hud">
        <div class="uno-top-left">
          <button type="button" class="uno-blue-menu-btn" id="unoMenuBtn" aria-label="Open UNO Menu" data-testid="uno-menu-btn">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#fff" stroke-width="2.8" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
          </button>
          <span class="uno-mode-chip ${mode === 'fun' ? 'is-fun' : ''}">${isSpectating ? '👁️ Live View' : (mode === 'fun' ? '⚡ Fun +Stack' : (mode === '1v1' ? '⚔️ 1v1' : '🌿 Classic'))}</span>
        </div>

        <div class="uno-clock-pill" aria-label="Match countdown timer">
          <span id="unoClockVal">${unoFormatClock(timeLeftSec)}</span>
          <span class="uno-alarm-ico" aria-hidden="true">
            <svg viewBox="0 0 36 36" width="32" height="32" fill="none">
              <circle cx="9" cy="9" r="5" fill="#ef4444"/>
              <circle cx="27" cy="9" r="5" fill="#ef4444"/>
              <circle cx="18" cy="19" r="13" fill="#f43f5e" stroke="#be123c" stroke-width="2"/>
              <circle cx="18" cy="19" r="9.5" fill="#fff5f5"/>
              <path d="M18 13v6l4 3" stroke="#be123c" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </span>
        </div>

        <div class="uno-top-right">
          <button type="button" class="uno-top-pill" id="unoRulesBtn" title="Card Types & Rules" data-testid="uno-rules-btn">?</button>
          <button type="button" class="uno-top-pill invite" id="unoInviteBtn" title="Invite Friend" data-testid="uno-invite-btn">👥</button>
          <button type="button" class="uno-top-pill exit" id="unoExitTopBtn" title="Exit Table">✕</button>
        </div>
      </div>

      <!-- Center Picnic Table Stage -->
      <div class="uno-table-stage">
        <div class="uno-mat-wrap">
          ${renderScallopedMatSvg(activeColor, direction)}

          <!-- Center Active Card -->
          <div class="uno-center-pile">
            ${renderUnoCardHtml(top, { large: true, pop: top.id === lastPopCardId })}
            ${pendingDraw > 0 ? `<span class="uno-stack-pill">STACK +${pendingDraw}!</span>` : ''}
          </div>

          <!-- Robot Visor Draw Deck Dispenser (Left Edge) -->
          <button type="button" class="uno-visor-deck ${isMyTurn ? 'is-ready' : ''}" id="unoDrawBtn" data-testid="uno-draw-btn" title="${pendingDraw > 0 ? `Take +${pendingDraw} stack` : 'Tap to draw a card'}">
            <span class="uno-visor-card-peek"></span>
            <span class="uno-visor-body">
              <span class="uno-visor-ant"></span>
              <span class="uno-visor-screen">
                <i>&gt;</i><i>&lt;</i>
              </span>
            </span>
            <span class="uno-visor-lbl">${pendingDraw > 0 ? `TAKE +${pendingDraw}` : `DRAW (${deck.length})`}</span>
          </button>

          <!-- Opponent Seats -->
          ${opponentsHtml}

          <!-- User Avatar (Bottom-Left of Mat) -->
          <div class="uno-seat slot-me ${phase === 'playing' && turnIdx === 0 && !finished ? 'is-turn' : ''}" data-seat="0">
            <div class="uno-av-ring me">
              ${makeTurnRing(phase === 'playing' && turnIdx === 0 && !finished)}
              <div class="uno-av-clip">${unoAvatarHtml(players[0].avatar)}</div>
              ${players[0].micOn ? `<span class="uno-mic-dot live" title="Mic Live">🎙</span>` : ''}
              ${playerAfk ? `<span class="uno-afk-dot" title="Auto-Play Active">🤖</span>` : ''}
              ${players[0].saidUno ? `<span class="uno-said-badge">ONE!</span>` : ''}
            </div>
            <span class="uno-seat-name">${esc(unoShortName(players[0].name, 9))}</span>
            ${myBubble}
          </div>

          <!-- Tactile Golden ONE Button (Bottom-Right of Mat) -->
          <button type="button" class="uno-one-btn ${oneBtnActive ? 'is-hot' : ''} ${players[0].saidUno ? 'is-called' : ''}" id="unoOneBtn" data-testid="uno-one-btn" aria-label="Shout ONE">
            <span class="uno-one-face">
              <i class="uno-one-dot"></i>
              <b>ONE</b>
            </span>
          </button>

          ${catchHtml}
        </div>

        ${playerAfk && !finished ? `<button type="button" class="turn-afk-banner uno-afk" id="unoAfkBanner" data-testid="uno-afk-banner">🤖 Auto-Play Active (3s) · Tap anywhere to resume</button>` : ''}

        <div class="uno-status-strip">
          <span class="uno-col-dot" style="background:${(UNO_COLOR_META[activeColor] || UNO_COLOR_META.blue).hex}"></span>
          <span class="uno-status-txt">${esc(statusBanner)}</span>
        </div>
      </div>

      <!-- Bottom Fanned Player Hand -->
      <div class="uno-hand-zone">
        <div class="uno-hand-fan" id="unoHandFan" data-testid="uno-hand-fan">
          ${handHtml}
        </div>
      </div>

      <!-- Popover Host cleanly ABOVE the bottom dock -->
      <div class="uno-popover-host" id="unoPopoverHost">${renderPopoverHtml()}</div>

      <!-- Bottom Garden Voice / Mic / Chat Dock -->
      <div class="uno-voice-dock" data-testid="uno-voice-dock">
        <div class="uno-dock-left">
          <button type="button" class="uno-g-btn spk ${sfxMuted ? 'muted' : ''}" id="unoSpkBtn" aria-label="Toggle Sound" title="Sound FX">
            <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 5L6 9H3v6h3l5 4V5z"/>
              ${sfxMuted ? '<path d="M22 9l-6 6M16 9l6 6"/>' : '<path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M19 5.5a9.5 9.5 0 0 1 0 13"/>'}
            </svg>
          </button>
          <button type="button" class="uno-g-btn mic ${micState.live ? 'live' : 'muted'}" id="unoMicBtn" aria-label="Toggle Live Mic" title="Toggle Live Mic" data-testid="uno-mic-btn">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
              <rect x="9" y="2.5" width="6" height="11" rx="3"/>
              <path d="M5 10.5a7 7 0 0 0 14 0M12 17.5V21"/>
              ${micState.live ? '' : '<path d="M3 3l18 18"/>'}
            </svg>
          </button>
          <button type="button" class="uno-g-btn gear ${activePopover === 'mic' ? 'on' : ''}" id="unoMicOptsBtn" aria-label="Mic Options" title="Mic & Voice Options" data-testid="uno-mic-opts-btn">⚙️</button>
        </div>

        <form class="uno-dock-chat-form" id="unoChatForm">
          <input type="text" id="unoChatInput" placeholder="Say hi..." maxlength="60" autocomplete="off">
        </form>

        <button type="button" class="uno-g-btn chat ${activePopover === 'chat' ? 'on' : ''}" id="unoChatPopBtn" aria-label="Quick Voice & Emotes" title="Quick Voice & Emotes" data-testid="uno-chat-btn">
          <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="#fff" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5z"/>
            <circle cx="9" cy="11.5" r="1" fill="#fff"/><circle cx="12.5" cy="11.5" r="1" fill="#fff"/><circle cx="16" cy="11.5" r="1" fill="#fff"/>
          </svg>
        </button>
      </div>

      ${wildPickerHtml}
      ${challengeHtml}
      ${renderMatchingOverlay()}
    `;

    bindEvents();
  };

  const bindEvents = () => {
    if (!rootEl) return;

    // Matching overlay skip/exit
    const matchOv = rootEl.querySelector('#unoMatchOverlay');
    if (matchOv) {
      const mExit = rootEl.querySelector('#unoMatchExitBtn');
      if (mExit) mExit.onclick = (e) => { e.stopPropagation(); view.close(); };
      const mSkip = rootEl.querySelector('#unoMatchSkipBtn');
      if (mSkip) mSkip.onclick = (e) => { e.stopPropagation(); startPlayingPhase(); };
      matchOv.onclick = () => startPlayingPhase();
    }

    // Top bar actions
    const menuBtn = rootEl.querySelector('#unoMenuBtn');
    if (menuBtn) menuBtn.onclick = () => { activePopover = activePopover === 'menu' ? null : 'menu'; render(); };
    const rulesBtn = rootEl.querySelector('#unoRulesBtn');
    if (rulesBtn) rulesBtn.onclick = () => { activePopover = null; openUnoRulesModal(0); };
    const invBtn = rootEl.querySelector('#unoInviteBtn');
    if (invBtn) invBtn.onclick = () => {
      activePopover = null;
      openUnoInviteModal({
        roomCode,
        mode,
        stake,
        onSwitchMode: openModeSwitch,
        onInviteFriend: seatInvitedFriend
      });
    };
    const exitTop = rootEl.querySelector('#unoExitTopBtn');
    if (exitTop) exitTop.onclick = () => view.close();

    // Draw dispenser
    const drawBtn = rootEl.querySelector('#unoDrawBtn');
    if (drawBtn) {
      drawBtn.onclick = () => {
        if (phase !== 'playing' || turnIdx !== 0 || finished || pendingWild4Challenge) {
          toast('Wait for your turn!');
          return;
        }
        handleDrawAction(0);
      };
    }

    // Golden ONE button
    const oneBtn = rootEl.querySelector('#unoOneBtn');
    if (oneBtn) {
      oneBtn.onclick = () => {
        if (players[0].hand.length <= 2) {
          players[0].saidUno = true;
          showBubble(0, 'ONE!! 🔔');
          if (typeof playSfx === 'function') playSfx('coin');
          toast('ONE! You are protected!');
          render();
        } else {
          showBubble(0, 'ONE soon! ✨');
          toast('Shout ONE when you have 1–2 cards left!');
        }
      };
    }

    // Catch rival forgetting ONE
    const catchBtn = rootEl.querySelector('#unoCatchBtn');
    if (catchBtn && catchTargetIdx !== null) {
      catchBtn.onclick = () => {
        const target = players[catchTargetIdx];
        if (target && target.hand.length === 1 && !target.saidUno) {
          target.hand.push(drawOne(), drawOne());
          statusBanner = `Caught ${target.name} forgetting ONE! +2 penalty cards!`;
          showBubble(0, 'Caught +2! 🔔');
          showBubble(catchTargetIdx, 'Busted +2 😅');
          if (typeof playSfx === 'function') playSfx('coin');
          catchTargetIdx = null;
          render();
        }
      };
    }

    // Player hand card click
    rootEl.querySelectorAll('#unoHandFan [data-card-idx]').forEach(btn => {
      btn.onclick = () => {
        if (phase !== 'playing' || turnIdx !== 0 || finished || pendingWild4Challenge) return;
        const idx = Number(btn.dataset.cardIdx);
        const card = players[0].hand[idx];
        if (!card) return;
        if (!Rules.canPlayCard(card, topCard(), activeColor, pendingDraw, funStacking)) {
          if (typeof playSfx === 'function') playSfx('duelWrong');
          toast(pendingDraw > 0 ? 'Stack a +2/+4 or tap the visor shooter to draw!' : 'Match active color or symbol, or draw!');
          return;
        }
        if (card.color === 'wild') {
          pendingWildCardIdx = idx;
          render();
          return;
        }
        handleCardPlay(0, idx, card.color);
      };
    });

    // Wild color picker
    rootEl.querySelectorAll('[data-pick-color]').forEach(btn => {
      btn.onclick = () => {
        const col = btn.dataset.pickColor;
        const idx = pendingWildCardIdx;
        pendingWildCardIdx = null;
        if (idx !== null) handleCardPlay(0, idx, col);
      };
    });
    const cancelWild = rootEl.querySelector('#unoCancelWildBtn');
    if (cancelWild) cancelWild.onclick = () => { pendingWildCardIdx = null; render(); };

    // Wild +4 Challenge dialog
    const doCh = rootEl.querySelector('#unoDoChallengeBtn');
    if (doCh) doCh.onclick = () => resolveUserWild4Decision(true);
    const acc4 = rootEl.querySelector('#unoAccept4Btn');
    if (acc4) acc4.onclick = () => resolveUserWild4Decision(false);

    // Bottom Garden Dock
    const spkBtn = rootEl.querySelector('#unoSpkBtn');
    if (spkBtn) {
      spkBtn.onclick = () => {
        if (typeof SFX !== 'undefined' && typeof SFX.toggle === 'function') {
          const off = SFX.toggle();
          toast(off ? 'Table sound muted' : 'Table sound on');
          render();
        }
      };
    }
    const micBtn = rootEl.querySelector('#unoMicBtn');
    if (micBtn) micBtn.onclick = () => toggleLiveMic();
    const micOptsBtn = rootEl.querySelector('#unoMicOptsBtn');
    if (micOptsBtn) micOptsBtn.onclick = () => { activePopover = activePopover === 'mic' ? null : 'mic'; render(); };
    const chatPopBtn = rootEl.querySelector('#unoChatPopBtn');
    if (chatPopBtn) chatPopBtn.onclick = () => { activePopover = activePopover === 'chat' ? null : 'chat'; render(); };

    const chatForm = rootEl.querySelector('#unoChatForm');
    if (chatForm) {
      chatForm.onsubmit = (e) => {
        e.preventDefault();
        const inp = rootEl.querySelector('#unoChatInput');
        const txt = inp ? inp.value.trim() : '';
        if (!txt) return;
        inp.value = '';
        if (!isSpectating) showBubble(0, txt);
        if (tableChatWidget && typeof tableChatWidget.pushMessage === 'function') {
          tableChatWidget.pushMessage(isSpectating ? `${(me && me.name) || 'Spectator'} 👁️` : ((me && me.name) || 'You'), txt, true);
        }
      };
    }

    // Popover bindings
    rootEl.querySelectorAll('[data-close-pop]').forEach(b => {
      b.onclick = () => { activePopover = null; render(); };
    });
    const popLive = rootEl.querySelector('#unoPopMicLive');
    if (popLive) popLive.onclick = () => toggleLiveMic();
    rootEl.querySelectorAll('[data-mic-mode]').forEach(b => {
      b.onclick = () => { micState.mode = b.dataset.micMode; toast(`Mic Mode: ${micState.mode === 'ptt' ? 'Push-to-Talk' : 'Open Mic'}`); render(); };
    });
    const popNG = rootEl.querySelector('#unoPopNoiseGate');
    if (popNG) popNG.onclick = () => { micState.noiseGate = !micState.noiseGate; render(); };
    rootEl.querySelectorAll('[data-mic-tone]').forEach(b => {
      b.onclick = () => { micState.tone = b.dataset.micTone; toast(`Voice Tone: ${micState.tone}`); render(); };
    });

    rootEl.querySelectorAll('[data-uno-em]').forEach(b => {
      b.onclick = () => {
        activePopover = null;
        if (!isSpectating) showBubble(0, b.dataset.unoEm);
        if (tableChatWidget && typeof tableChatWidget.pushMessage === 'function') tableChatWidget.pushMessage((me && me.name) || 'You', b.dataset.unoEm, true);
      };
    });
    rootEl.querySelectorAll('[data-uno-qc]').forEach(b => {
      b.onclick = () => {
        activePopover = null;
        if (!isSpectating) showBubble(0, b.dataset.unoQc);
        if (tableChatWidget && typeof tableChatWidget.pushMessage === 'function') tableChatWidget.pushMessage((me && me.name) || 'You', b.dataset.unoQc, true);
      };
    });

    const mRules = rootEl.querySelector('#unoMenuRules');
    if (mRules) mRules.onclick = () => { activePopover = null; render(); openUnoRulesModal(0); };
    const mInv = rootEl.querySelector('#unoMenuInvite');
    if (mInv) mInv.onclick = () => {
      activePopover = null;
      render();
      openUnoInviteModal({
        roomCode,
        mode,
        stake,
        onSwitchMode: openModeSwitch,
        onInviteFriend: seatInvitedFriend
      });
    };
    rootEl.querySelectorAll('[data-menu-mode]').forEach(b => {
      b.onclick = () => openModeSwitch(b.dataset.menuMode);
    });
    const mExit = rootEl.querySelector('#unoMenuExit');
    if (mExit) mExit.onclick = () => view.close();

    const afkBtn = rootEl.querySelector('#unoAfkBanner');
    if (afkBtn) afkBtn.onclick = () => resumeFromAfk();
  };

  // Any tap anywhere in the UNO table immediately resumes manual control if AFK Auto-Play is active
  if (rootEl) {
    rootEl.addEventListener('pointerdown', () => {
      if (playerAfk && !finished) resumeFromAfk();
    }, true);
  }

  // Render initial matching screen (skip straight to playing when spectating!)
  if (isSpectating) {
    startPlayingPhase();
  } else {
    render();
    addTimer(() => {
      if (phase === 'matching' && !finished) {
        phase = 'matched';
        render();
      }
    }, 550);
    addTimer(() => {
      if ((phase === 'matching' || phase === 'matched') && !finished) {
        startPlayingPhase();
      }
    }, 1150);
  }
}
window.launchUnoGame = launchUnoGame;
