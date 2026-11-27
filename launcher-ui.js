"use strict";
/* =====================================================================
   ULTRA-MODERN 3D/HD GAME-LAUNCHER LOBBY & CATEGORY FILTER
   · Top Featured Hero Carousel (Budget Clash & Couple Arena)
   · Sticky Horizontal Category Tabs (All, Party & Show, Couple & Social, 1v1 Action, Brain & Quick)
   · Rich 3D Glassmorphic Game Cards with Custom Layered 3D SVG Art
   · Compact LIVE MULTIPLAYER ARENA Room Code Bar
   ===================================================================== */

(function () {
  let activeCategory = 'all';
  let activeHeroIdx = 0;
  let heroTimer = 0;
  let mpDrawerOpen = false;

  const HERO_SLIDES = [
    {
      id: 'budget_clash',
      theme: 'hero-budget',
      kicker: 'LIVE TV GAME SHOW',
      title: 'Budget Clash',
      highlight: '₹10 vs ₹1 Cr',
      pills: ['🎭 Curtain Reveal', '🔊 EN / HI / BN', '👑 Vault Frame'],
      ctaText: 'Play Now',
      subMode: 'ten_vs_cr',
      players: 342
    },
    {
      id: 'couple_arena',
      theme: 'hero-couple',
      kicker: 'DUO & BESTIE PARTY HUB',
      title: 'Couple & Bestie Arena',
      highlight: 'Mind Sync · 3D Wheel',
      pills: ['💗 Love Meter', '🎡 Truth / Dare', '💖 Neon Heart Frame'],
      ctaText: 'Play Now',
      subMode: 'mind_sync',
      players: 298
    }
  ];

  function renderShowGameArtSvg(gameId, accent, accent2) {
    const uid = 'l3d_' + String(gameId || 'x').replace(/[^a-z0-9]/gi, '') + '_' + Math.random().toString(36).slice(2, 6);
    const a1 = accent || '#6366f1';
    const a2 = accent2 || '#1e1b4b';

    const artMap = {
      budget_clash: `
        <g>
          <rect x="0" y="0" width="320" height="146" fill="url(#${uid})"/>
          <path d="M0 0h44c-5 48-7 94-15 146H0V0z" fill="#7f1d1d" opacity=".92"/>
          <path d="M320 0h-44c5 48 7 94 15 146h29V0z" fill="#7f1d1d" opacity=".92"/>
          <path d="M0 0c44 18 82 18 120 0h80c38 18 76 18 120 0v13H0V0z" fill="#991b1b"/>
          <ellipse cx="160" cy="130" rx="88" ry="11" fill="#fbbf24" fill-opacity=".22"/>
          <rect x="108" y="42" width="104" height="68" rx="14" fill="#1e1b4b" stroke="#fde047" stroke-width="3.2"/>
          <rect x="114" y="48" width="92" height="20" rx="7" fill="#fbbf24" fill-opacity=".18"/>
          <path d="M142 42v-7a18 18 0 0 1 36 0v7" fill="none" stroke="#fde047" stroke-width="3.4" stroke-linecap="round"/>
          <text x="160" y="86" text-anchor="middle" font-size="24" font-weight="900" fill="#fef08a">₹1 Cr</text>
          <rect x="40" y="92" width="54" height="26" rx="9" fill="#0f172a" fill-opacity=".9" stroke="#34d399" stroke-width="2"/>
          <text x="67" y="110" text-anchor="middle" font-size="13" font-weight="900" fill="#6ee7b7">₹10</text>
          <rect x="220" y="92" width="66" height="26" rx="9" fill="#f59e0b" stroke="#fffbeb" stroke-width="1.8"/>
          <text x="253" y="109" text-anchor="middle" font-size="11" font-weight="900" fill="#2b1200">JACKPOT</text>
        </g>`,
      couple_arena: `
        <g>
          <rect x="0" y="0" width="320" height="146" fill="url(#${uid})"/>
          <circle cx="160" cy="70" r="56" fill="#ec4899" fill-opacity=".22"/>
          <path d="M160 112s-40-23-40-52c0-16 12-27 26-27 9 0 14 5 14 10 0-5 5-10 14-10 14 0 26 11 26 27 0 29-40 52-40 52z" fill="#f43f5e" stroke="#fde047" stroke-width="3.2" stroke-linejoin="round"/>
          <circle cx="96" cy="56" r="18" fill="#1e1b4b" stroke="#f472b6" stroke-width="2.6"/>
          <path d="M96 64s-9-5.5-9-11.5c0-3.4 2.6-5.8 5.6-5.8 1.9 0 3.4 1.1 3.4 2.5 0-1.4 1.5-2.5 3.4-2.5 3 0 5.6 2.4 5.6 5.8 0 6-9 11.5-9 11.5z" fill="#f472b6"/>
          <circle cx="224" cy="56" r="18" fill="#1e1b4b" stroke="#fbbf24" stroke-width="2.6"/>
          <path d="M224 44l3 8 8 3-8 3-3 8-3-8-8-3 8-3z" fill="#fde047"/>
          <rect x="112" y="96" width="96" height="24" rx="12" fill="#0f172a" fill-opacity=".88" stroke="#fde047" stroke-width="1.8"/>
          <text x="160" y="112" text-anchor="middle" font-size="11.5" font-weight="900" fill="#fde047">100% SYNC</text>
        </g>`,
      couple_mind_sync: `
        <g>
          <rect x="0" y="0" width="320" height="146" fill="url(#${uid})"/>
          <circle cx="114" cy="72" r="34" fill="#be185d" stroke="#fbcfe8" stroke-width="3"/>
          <circle cx="206" cy="72" r="34" fill="#7c3aed" stroke="#fde047" stroke-width="3"/>
          <path d="M148 72h24" stroke="#fde047" stroke-width="4" stroke-dasharray="4 4" stroke-linecap="round"/>
          <path d="M160 54l4 12 12 4-12 4-4 12-4-12-12-4 12-4z" fill="#fef08a"/>
          <path d="M114 84s-14-8.5-14-18c0-5.4 4-9 8.8-9 3 0 5.2 1.8 5.2 4 0-2.2 2.2-4 5.2-4 4.8 0 8.8 3.6 8.8 9 0 9.5-14 18-14 18z" fill="#fbcfe8"/>
          <path d="M206 84s-14-8.5-14-18c0-5.4 4-9 8.8-9 3 0 5.2 1.8 5.2 4 0-2.2 2.2-4 5.2-4 4.8 0 8.8 3.6 8.8 9 0 9.5-14 18-14 18z" fill="#fde047"/>
        </g>`,
      couple_truth_dare: `
        <g>
          <rect x="0" y="0" width="320" height="146" fill="url(#${uid})"/>
          <circle cx="160" cy="74" r="48" fill="#1e1b4b" stroke="#fde047" stroke-width="4"/>
          <path d="M160 74L160 28A46 46 0 0 1 206 74Z" fill="#ec4899"/>
          <path d="M160 74L206 74A46 46 0 0 1 160 120Z" fill="#f59e0b"/>
          <path d="M160 74L160 120A46 46 0 0 1 114 74Z" fill="#8b5cf6"/>
          <path d="M160 74L114 74A46 46 0 0 1 160 28Z" fill="#fb7185"/>
          <circle cx="160" cy="74" r="14" fill="#0f172a" stroke="#fde047" stroke-width="2.5"/>
          <polygon points="160,14 152,30 168,30" fill="#fde047" stroke="#78350f" stroke-width="1.5"/>
        </g>`,
      couple_most_likely: `
        <g>
          <rect x="0" y="0" width="320" height="146" fill="url(#${uid})"/>
          <rect x="66" y="28" width="76" height="90" rx="16" fill="#0f172a" fill-opacity=".82" stroke="#f472b6" stroke-width="2.8"/>
          <rect x="178" y="28" width="76" height="90" rx="16" fill="#0f172a" fill-opacity=".82" stroke="#fbbf24" stroke-width="2.8"/>
          <path d="M86 84l4-24 14 11 14-11 4 24H86z" fill="#f472b6" stroke="#fbcfe8" stroke-width="2" stroke-linejoin="round"/>
          <path d="M216 54l5 14 14 5-14 5-5 14-5-14-14-5 14-5z" fill="#fde047"/>
          <circle cx="160" cy="72" r="17" fill="#f43f5e" stroke="#fff" stroke-width="2.2"/>
          <text x="160" y="77" text-anchor="middle" font-size="12" font-weight="900" fill="#fff">VS</text>
        </g>`,
      couple_love_meter: `
        <g>
          <rect x="0" y="0" width="320" height="146" fill="url(#${uid})"/>
          <rect x="52" y="48" width="216" height="50" rx="25" fill="#0f172a" fill-opacity=".78" stroke="#f472b6" stroke-width="3"/>
          <rect x="58" y="54" width="176" height="38" rx="19" fill="url(#${uid}_bar)"/>
          <text x="160" y="80" text-anchor="middle" font-size="19" font-weight="900" fill="#fff">94% VIBE SYNC</text>
        </g>`
    };

    const custom = artMap[gameId];
    if (custom) {
      return `<svg class="gl-card-svg" viewBox="0 0 320 146" preserveAspectRatio="xMidYMid slice" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id="${uid}" x1="0" y1="0" x2="320" y2="146" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="${a1}"/>
            <stop offset="56%" stop-color="${a2}"/>
            <stop offset="100%" stop-color="#090d1a"/>
          </linearGradient>
          <linearGradient id="${uid}_bar" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="#ec4899"/>
            <stop offset="55%" stop-color="#f43f5e"/>
            <stop offset="100%" stop-color="#fbbf24"/>
          </linearGradient>
        </defs>
        ${custom}
      </svg>`;
    }

    if (typeof ARENA_GAMES !== 'undefined' && typeof renderArenaBannerArt === 'function') {
      const ag = ARENA_GAMES.find(x => x.id === gameId);
      if (ag) return renderArenaBannerArt(ag);
    }

    const svgMap = {
      speed_math: 'math',
      speedmath: 'math',
      brain_puzzle: 'puzzle',
      word_duel: 'word',
      trivia_rush: 'trivia',
      mcq_duel: 'duel'
    };
    const iconHtml = (typeof GAME_SVG !== 'undefined' && GAME_SVG[svgMap[gameId]]) ? GAME_SVG[svgMap[gameId]] : '';
    return `
      <div class="gl-mini-stage" style="--g1:${a1};--g2:${a2}">
        <div class="gl-mini-orb"></div>
        <div class="gl-mini-svg">${iconHtml}</div>
      </div>
    `;
  }

  function renderHeroArt(slideId) {
    if (slideId === 'budget_clash') {
      return `
        <svg class="hero-3d-svg" viewBox="0 0 210 146" fill="none" aria-hidden="true">
          <defs>
            <linearGradient id="hcGold" x1="20" y1="18" x2="180" y2="132" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#fffbeb"/>
              <stop offset="45%" stop-color="#facc15"/>
              <stop offset="100%" stop-color="#b45309"/>
            </linearGradient>
            <linearGradient id="hcVault" x1="40" y1="30" x2="170" y2="122" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#312e81"/>
              <stop offset="100%" stop-color="#0f172a"/>
            </linearGradient>
          </defs>
          <ellipse cx="105" cy="128" rx="74" ry="12" fill="#facc15" fill-opacity=".28"/>
          <path d="M12 10h34c-4 40-5 82-12 118H12V10z" fill="#991b1b" opacity=".88"/>
          <path d="M198 10h-34c4 40 5 82 12 118h22V10z" fill="#991b1b" opacity=".88"/>
          <rect x="44" y="34" width="122" height="82" rx="18" fill="url(#hcVault)" stroke="url(#hcGold)" stroke-width="3.6"/>
          <path d="M84 34V22a21 21 0 0 1 42 0v12" fill="none" stroke="url(#hcGold)" stroke-width="4" stroke-linecap="round"/>
          <rect x="54" y="44" width="102" height="24" rx="8" fill="#fbbf24" fill-opacity=".15"/>
          <text x="105" y="84" text-anchor="middle" font-size="28" font-weight="900" fill="#fef08a">₹1 Cr</text>
          <rect x="20" y="92" width="54" height="26" rx="9" fill="#064e3b" stroke="#34d399" stroke-width="2"/>
          <text x="47" y="110" text-anchor="middle" font-size="13" font-weight="900" fill="#a7f3d0">₹10</text>
          <circle cx="174" cy="30" r="14" fill="#f59e0b" stroke="#fffbeb" stroke-width="2"/>
          <path d="M167 35l2-9 5 4 5-4 2 9h-14z" fill="#2b1200"/>
        </svg>`;
    }
    return `
      <svg class="hero-3d-svg" viewBox="0 0 210 146" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id="hcPink" x1="30" y1="16" x2="176" y2="128" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#f472b6"/>
            <stop offset="52%" stop-color="#ec4899"/>
            <stop offset="100%" stop-color="#f59e0b"/>
          </linearGradient>
        </defs>
        <ellipse cx="105" cy="128" rx="70" ry="12" fill="#f472b6" fill-opacity=".3"/>
        <circle cx="105" cy="70" r="52" fill="#ec4899" fill-opacity=".2"/>
        <path d="M105 118s-48-28-48-62c0-19 14-32 31-32 10 0 17 6 17 13 0-7 7-13 17-13 17 0 31 13 31 32 0 34-48 62-48 62z" fill="url(#hcPink)" stroke="#fef08a" stroke-width="3.4" stroke-linejoin="round"/>
        <circle cx="44" cy="48" r="19" fill="#1e1b4b" stroke="#f472b6" stroke-width="2.6"/>
        <path d="M44 57s-10-6-10-12.5c0-3.8 2.8-6.3 6.2-6.3 2.1 0 3.8 1.2 3.8 2.7 0-1.5 1.7-2.7 3.8-2.7 3.4 0 6.2 2.5 6.2 6.3 0 6.5-10 12.5-10 12.5z" fill="#f472b6"/>
        <circle cx="166" cy="48" r="19" fill="#1e1b4b" stroke="#fde047" stroke-width="2.6"/>
        <path d="M166 36l3.2 8.8 8.8 3.2-8.8 3.2-3.2 8.8-3.2-8.8-8.8-3.2 8.8-3.2z" fill="#fde047"/>
        <rect x="56" y="96" width="98" height="24" rx="12" fill="#0f172a" fill-opacity=".88" stroke="#fde047" stroke-width="2"/>
        <text x="105" y="112" text-anchor="middle" font-size="11.5" font-weight="900" fill="#fde047">SOULMATE 100%</text>
      </svg>`;
  }

  function renderHeroCarouselHtml(scopeId) {
    return `
      <div class="gl-hero-wrap" id="${scopeId}HeroWrap" data-testid="hero-carousel">
        <div class="gl-hero-track" id="${scopeId}HeroTrack">
          ${HERO_SLIDES.map((s, idx) => `
            <article class="gl-hero-slide ${s.theme} ${idx === activeHeroIdx ? 'is-active' : ''}" data-heroslide="${idx}" data-herogame="${s.id}">
              <div class="gl-hero-particles" aria-hidden="true">
                <i></i><i></i><i></i><i></i><i></i><i></i>
              </div>
              <div class="gl-hero-copy">
                <div class="gl-hero-toprow">
                  <span class="gl-hero-kicker">${esc(s.kicker)}</span>
                  <span class="gl-live-badge"><i class="gl-live-dot"></i> ${s.players} Playing</span>
                </div>
                <h2 class="gl-hero-title">${esc(s.title)}</h2>
                <div class="gl-hero-sub">${esc(s.highlight)}</div>
                <div class="gl-hero-pills">
                  ${s.pills.map(p => `<span>${esc(p)}</span>`).join('')}
                </div>
                <div class="gl-hero-actions">
                  <button type="button" class="gl-hero-cta" data-heroplay="${s.id}" data-herosub="${s.subMode}" data-testid="hero-play-${s.id}">
                    ▶ ${esc(s.ctaText)}
                  </button>
                  <button type="button" class="gl-hero-modes-btn" data-heromodes="${s.id}">
                    Modes &amp; Rewards
                  </button>
                </div>
              </div>
              <div class="gl-hero-art">
                ${renderHeroArt(s.id)}
              </div>
            </article>
          `).join('')}
        </div>
        <div class="gl-hero-controls">
          <button type="button" class="gl-hero-arrow" data-heronav="-1" aria-label="Previous featured game">‹</button>
          <div class="gl-hero-dots" role="tablist" aria-label="Featured Games">
            ${HERO_SLIDES.map((s, idx) => `<button type="button" class="gl-hero-dot ${idx === activeHeroIdx ? 'on' : ''}" data-herodot="${idx}" aria-label="${esc(s.title)}"></button>`).join('')}
          </div>
          <button type="button" class="gl-hero-arrow" data-heronav="1" aria-label="Next featured game">›</button>
        </div>
      </div>
    `;
  }

  function bindHeroCarousel(root, scopeId) {
    const wrap = $('#' + scopeId + 'HeroWrap', root);
    if (!wrap) return;

    const syncSlide = (nextIdx) => {
      activeHeroIdx = (nextIdx + HERO_SLIDES.length) % HERO_SLIDES.length;
      $$('.gl-hero-slide', wrap).forEach((el, i) => el.classList.toggle('is-active', i === activeHeroIdx));
      $$('.gl-hero-dot', wrap).forEach((el, i) => el.classList.toggle('on', i === activeHeroIdx));
    };

    wrap.onclick = async (e) => {
      const playBtn = e.target.closest('[data-heroplay]');
      if (playBtn) {
        e.stopPropagation();
        if (typeof playSfx === 'function') playSfx('turnStart');
        const gid = playBtn.dataset.heroplay;
        const sub = playBtn.dataset.herosub || '';
        if (typeof launchStandardizedGame === 'function') {
          await launchStandardizedGame(gid, { subMode: sub || (gid === 'couple_arena' ? 'mind_sync' : 'ten_vs_cr'), stake: 0, modeType: 'bot' });
        } else {
          if (typeof ensureGameModule === 'function') await ensureGameModule(gid);
          if (gid === 'budget_clash' && typeof launchBudgetClash === 'function') {
            launchBudgetClash({ subMode: sub || 'ten_vs_cr', stake: 0, modeType: 'bot' });
          } else if (gid === 'couple_arena' && typeof launchCoupleArena === 'function') {
            launchCoupleArena({ subMode: sub || 'mind_sync', stake: 0, modeType: 'bot' });
          }
        }
        return;
      }
      const modeBtn = e.target.closest('[data-heromodes]');
      if (modeBtn) {
        e.stopPropagation();
        if (typeof playSfx === 'function') playSfx('tap');
        if (typeof openVisualModeSelect === 'function') openVisualModeSelect(modeBtn.dataset.heromodes);
        return;
      }
      const dot = e.target.closest('[data-herodot]');
      if (dot) {
        if (typeof playSfx === 'function') playSfx('tap');
        syncSlide(Number(dot.dataset.herodot));
        return;
      }
      const nav = e.target.closest('[data-heronav]');
      if (nav) {
        if (typeof playSfx === 'function') playSfx('tap');
        syncSlide(activeHeroIdx + Number(nav.dataset.heronav));
        return;
      }
      const slide = e.target.closest('[data-herogame]');
      if (slide && typeof openVisualModeSelect === 'function') {
        if (typeof playSfx === 'function') playSfx('tap');
        openVisualModeSelect(slide.dataset.herogame);
      }
    };

    // Touch swipe support
    let sx = 0;
    wrap.addEventListener('touchstart', (e) => { sx = e.touches[0]?.clientX || 0; }, { passive: true });
    wrap.addEventListener('touchend', (e) => {
      const dx = (e.changedTouches[0]?.clientX || 0) - sx;
      if (Math.abs(dx) > 42) {
        syncSlide(activeHeroIdx + (dx < 0 ? 1 : -1));
      }
    }, { passive: true });

    clearInterval(heroTimer);
    heroTimer = setInterval(() => {
      if (document.hidden || !document.body.contains(wrap) || !wrap.offsetParent) return;
      syncSlide(activeHeroIdx + 1);
    }, 6500);
  }
  window.pauseLauncherHeroTimer = () => {
    clearInterval(heroTimer);
    heroTimer = 0;
  };

  const BADGE_LABEL = {
    bot: '🤖 Bot',
    coin: '🪙 Coin Bet',
    invite: '👥 Invite',
    duo: '❤️ Duo'
  };

  function renderGameCardHtml(g) {
    const SGR = window.ShowGamesRules;
    const liveCount = SGR ? SGR.getLivePlayerCount(g) : (g.onlineBase || 110);
    const badgeKeys = Array.isArray(g.badges) && g.badges.length ? g.badges : ['bot'];
    const modesHtml = badgeKeys.slice(0, 3).map(k => `<span class="gl-mode-chip">${esc(BADGE_LABEL[k] || String(k))}</span>`).join('');
    const badgeHtml = g.featured ? `<span class="gl-card-tag">HOT</span>` : (g.exclusiveKey ? `<span class="gl-card-tag">REWARD</span>` : '');
    return `
      <button type="button" class="gl-game-card ${g.featured ? 'is-featured' : ''}" data-launchgame="${esc(g.id)}" data-testid="launcher-card-${esc(g.id)}" style="--gc1:${g.accent};--gc2:${g.accent2}">
        <div class="gl-card-art">
          ${renderShowGameArtSvg(g.id, g.accent, g.accent2)}
          <div class="gl-card-gloss" aria-hidden="true"></div>
          <div class="gl-card-top-badges">
            <span class="gl-live-badge"><i class="gl-live-dot"></i> ${liveCount} Playing</span>
            ${badgeHtml}
          </div>
        </div>
        <div class="gl-card-body">
          <b class="gl-card-title">${esc(g.name)}</b>
          <div class="gl-card-modes">${modesHtml}</div>
        </div>
      </button>
    `;
  }

  function handleLauncherCardTap(gameId) {
    const SGR = window.ShowGamesRules;
    const g = SGR ? SGR.LAUNCHER_GAMES.find(x => x.id === gameId) : null;
    if (typeof playSfx === 'function') playSfx('tap');

    if (!g) {
      if (typeof openVisualModeSelect === 'function') openVisualModeSelect(gameId);
      return;
    }
    if (g.launcher === 'page' && g.href) {
      if (typeof openPage === 'function') openPage(g.href, 'games');
      else location.assign(g.href);
      return;
    }
    if (g.launcher === 'duel') {
      if (typeof showTab === 'function') showTab('chat');
      if (typeof toast === 'function') toast('Open a friend chat & tap Duel');
      return;
    }
    if (g.launcher === 'couple_sub') {
      if (typeof openVisualModeSelect === 'function') {
        openVisualModeSelect(g.parentGameId || 'couple_arena', null, { mode: g.initialSubMode || 'mind_sync' });
      } else if (typeof launchStandardizedGame === 'function') {
        launchStandardizedGame(g.parentGameId || 'couple_arena', { subMode: g.initialSubMode || 'mind_sync', stake: 0, modeType: 'bot' });
      }
      return;
    }
    if (typeof openVisualModeSelect === 'function') {
      openVisualModeSelect(g.id);
    } else if (typeof openArenaGame === 'function') {
      openArenaGame(g.id);
    }
  }

  function renderCompactMpBarHtml() {
    const openRooms = (typeof mpRooms !== 'undefined' && Array.isArray(mpRooms))
      ? mpRooms.filter(r => r && r.id && r.status !== 'closed').slice(0, 6)
      : [];
    return `
      <div class="gl-mp-bar" id="glMpBar" data-testid="compact-mp-bar">
        <div class="gl-mp-row">
          <div class="gl-mp-brand">
            <span class="gl-live-dot"></span>
            <b>LIVE MULTIPLAYER ARENA</b>
          </div>
          <div class="gl-mp-controls">
            <input id="glMpCodeIn" maxlength="10" placeholder="SG-XXXX" aria-label="Room Code">
            <button type="button" class="btn sm ok" id="glMpJoinBtn">Join</button>
            <button type="button" class="btn sm" id="glMpCreateBtn">+ Room</button>
            <button type="button" class="btn sm ghost" id="glMpToggleBtn">${openRooms.length} Live ${mpDrawerOpen ? '▴' : '▾'}</button>
          </div>
        </div>
        <div class="gl-mp-drawer" id="glMpDrawer" ${mpDrawerOpen ? '' : 'hidden'}>
          ${openRooms.length ? openRooms.map(r => {
            const pList = Object.values(r.players || {});
            const mode = typeof mpModeById === 'function' ? mpModeById(r.mode) : { name: r.mode || 'Arena', icon: 'duel' };
            const inRoom = pList.some(p => p.uid === uid);
            return `
              <div class="mp-room-row">
                <div class="mp-room-ico">${(typeof GAME_SVG !== 'undefined' && GAME_SVG[mode.icon]) || ''}</div>
                <div class="mid">
                  <b>${esc(mode.name)} <span class="mp-code-pill">${esc(r.code)}</span></b>
                  <small>${esc(r.hostName || 'Host')} · ${pList.length}/${r.maxPlayers || 4} · ${r.entryCoins > 0 ? `${r.entryCoins} 🪙` : 'Free'}</small>
                </div>
                <button type="button" class="btn sm ${inRoom ? 'gold' : 'ok'}" data-gljoinroom="${esc(r.id)}">${inRoom ? 'Open' : 'Join'}</button>
              </div>
            `;
          }).join('') : `<div class="mp-empty">No open rooms yet — tap <b>+ Room</b> to host and invite friends!</div>`}
        </div>
      </div>
    `;
  }

  function renderGamesLauncher() {
    const root = $('#gamesLauncherRoot');
    if (!root) return false;
    const SGR = window.ShowGamesRules;
    if (!SGR) return false;

    const cats = SGR.LAUNCHER_CATEGORIES;
    const games = SGR.filterLauncherGames(activeCategory);
    const customSlots = (typeof customGameSlots !== 'undefined' && Array.isArray(customGameSlots)) ? customGameSlots : [];

    root.innerHTML = `
      ${renderHeroCarouselHtml('games')}
      ${renderCompactMpBarHtml()}

      <button type="button" class="gl-chronicles-strip" id="glOpenChroniclesBtn" data-testid="games-hub-chronicles-btn">
        <span class="gl-ch-thumb" style="background-image:url('assets/chronicles/velvet-cover.jpg')" aria-hidden="true"></span>
        <span class="gl-ch-copy">
          <span class="gl-ch-kicker">COUPLE CHRONICLES · 2-PARTNER STORY MODE</span>
          <b class="gl-ch-title">The Midnight Express: Velvet &amp; Shadow</b>
          <span class="gl-ch-sub">Dual choices · Split paths · EN / HI / BN Voice · Custom Story Book PDF</span>
        </span>
        <span class="gl-ch-cta">Open ›</span>
      </button>

      <div class="gl-cat-sticky" role="tablist" aria-label="Game Categories" data-testid="category-tabs">
        <div class="gl-cat-scroll">
          ${cats.map(c => `
            <button type="button" role="tab" aria-selected="${c.id === activeCategory ? 'true' : 'false'}" class="gl-cat-pill ${c.id === activeCategory ? 'on' : ''}" data-glcat="${esc(c.id)}" data-testid="cat-tab-${esc(c.id)}">
              <span>${c.icon}</span>
              <b>${esc(c.label)}</b>
            </button>
          `).join('')}
        </div>
      </div>

      <div class="gl-games-grid" id="glGamesGrid" data-testid="launcher-games-grid">
        ${games.map(renderGameCardHtml).join('')}
        ${activeCategory === 'all' ? customSlots.map((sg, idx) => `
          <div class="gl-game-card" data-customgame="${idx}" role="button" tabindex="0" style="--gc1:#10b981;--gc2:#064e3b">
            <div class="gl-card-art">
              <div class="gl-mini-stage" style="--g1:#10b981;--g2:#064e3b">
                <div class="gl-mini-svg">${typeof GAME_SVG !== 'undefined' ? GAME_SVG.custom : ''}</div>
              </div>
              <div class="gl-card-gloss"></div>
            </div>
            <div class="gl-card-body">
              <b class="gl-card-title">${esc(sg.name || 'Custom Game')}</b>
              <div class="gl-card-modes"><span class="gl-mode-chip">🎮 Custom</span></div>
            </div>
            ${typeof devMode !== 'undefined' && devMode ? `<button type="button" class="btn red sm mg-del-btn" data-delgameslot="${idx}">✕</button>` : ''}
          </div>
        `).join('') : ''}
        ${typeof devMode !== 'undefined' && devMode && activeCategory === 'all' ? `
          <button type="button" class="gl-game-card" data-addgameslot="1" style="--gc1:#f59e0b;--gc2:#78350f">
            <div class="gl-card-art">
              <div class="gl-mini-stage" style="--g1:#f59e0b;--g2:#78350f">
                <div class="gl-mini-svg">${typeof GAME_SVG !== 'undefined' ? GAME_SVG.plus : ''}</div>
              </div>
            </div>
            <div class="gl-card-body">
              <b class="gl-card-title">+ New Slot</b>
              <div class="gl-card-modes"><span class="gl-mode-chip">DEV</span></div>
            </div>
          </button>
        ` : ''}
      </div>
    `;

    bindHeroCarousel(root, 'games');

    const chBtn = $('#glOpenChroniclesBtn', root);
    if (chBtn) {
      chBtn.onclick = () => {
        if (typeof playSfx === 'function') playSfx('tap');
        if (typeof showTab === 'function') showTab('stories');
      };
    }

    // Category tabs
    $$('[data-glcat]', root).forEach(btn => {
      btn.onclick = () => {
        activeCategory = btn.dataset.glcat || 'all';
        if (typeof playSfx === 'function') playSfx('tap');
        renderGamesLauncher();
      };
    });

    // Compact MP bar events
    if ($('#glMpJoinBtn', root)) {
      $('#glMpJoinBtn', root).onclick = () => {
        const code = ($('#glMpCodeIn', root)?.value || '').trim().toUpperCase();
        if (!code) return typeof toast === 'function' && toast('Enter room code (e.g. SG-4K9P)');
        if (typeof joinMultiplayerRoomByCode === 'function') joinMultiplayerRoomByCode(code);
      };
    }
    if ($('#glMpCreateBtn', root)) {
      $('#glMpCreateBtn', root).onclick = () => {
        if (typeof openCreateRoomModal === 'function') openCreateRoomModal();
      };
    }
    if ($('#glMpToggleBtn', root)) {
      $('#glMpToggleBtn', root).onclick = () => {
        mpDrawerOpen = !mpDrawerOpen;
        if (typeof playSfx === 'function') playSfx('tap');
        renderGamesLauncher();
      };
    }
    $$('[data-gljoinroom]', root).forEach(b => {
      b.onclick = () => {
        if (typeof joinMultiplayerRoom === 'function') joinMultiplayerRoom(b.dataset.gljoinroom);
      };
    });

    // Game grid clicks
    const grid = $('#glGamesGrid', root);
    if (grid) {
      grid.onclick = (e) => {
        const del = e.target.closest('[data-delgameslot]');
        if (del) {
          e.stopPropagation();
          if (!devMode) return;
          const idx = Number(del.dataset.delgameslot);
          customGameSlots = customGameSlots.filter((_, i) => i !== idx);
          ls.set('sg_game_slots', customGameSlots);
          dbOp(() => F.setDoc(F.doc(db, 'config', 'game_slots'), { slots: customGameSlots, ts: Date.now() }));
          renderGamesLauncher();
          toast('Game slot removed');
          return;
        }
        if (e.target.closest('[data-addgameslot]')) {
          if (!devMode) return;
          const m = modal('Add Game Slot', `
            <label>Game Title</label><input id="gsN" maxlength="40" placeholder="e.g. Science Sprint">
            <label>Short Description</label><input id="gsD" maxlength="80" placeholder="Quick practice challenge">
            <label>HTML File or URL</label><input id="gsH" maxlength="140" placeholder="science-sprint.html">
            <button class="btn full" id="gsSave">Add Slot</button>
          `);
          $('#gsSave', m).onclick = () => {
            const name = $('#gsN', m).value.trim();
            const desc = $('#gsD', m).value.trim();
            const href = $('#gsH', m).value.trim();
            if (!name || !href) return toast('Enter game title and file/URL');
            customGameSlots = [...(customGameSlots || []), { name, desc: desc || 'Study mini-game', href }];
            ls.set('sg_game_slots', customGameSlots);
            dbOp(() => F.setDoc(F.doc(db, 'config', 'game_slots'), { slots: customGameSlots, ts: Date.now() }));
            m.close();
            renderGamesLauncher();
            toast('Game slot added');
          };
          return;
        }
        const cg = e.target.closest('[data-customgame]');
        if (cg) {
          const item = customGameSlots[Number(cg.dataset.customgame)];
          if (item && item.href) openPage(item.href, 'games');
          return;
        }
        const card = e.target.closest('[data-launchgame]');
        if (card) handleLauncherCardTap(card.dataset.launchgame);
      };
    }

    return true;
  }

  function renderHomeFeaturedLauncher(hostEl) {
    if (!hostEl) return false;
    const SGR = window.ShowGamesRules;
    if (!SGR) return false;

    const featuredIds = ['budget_clash', 'couple_arena', 'ludo', 'uno', 'pool_8ball', 'mind_clash'];
    const cards = featuredIds
      .map(id => SGR.LAUNCHER_GAMES.find(g => g.id === id))
      .filter(Boolean);

    hostEl.className = 'gl-home-launcher';
    hostEl.innerHTML = `
      ${renderHeroCarouselHtml('home')}
      <div class="gl-games-grid gl-home-grid">
        ${cards.map(renderGameCardHtml).join('')}
      </div>
    `;
    bindHeroCarousel(hostEl, 'home');
    hostEl.onclick = (e) => {
      const card = e.target.closest('[data-launchgame]');
      if (card) handleLauncherCardTap(card.dataset.launchgame);
    };
    return true;
  }

  window.renderGamesLauncher = renderGamesLauncher;
  window.renderHomeFeaturedLauncher = renderHomeFeaturedLauncher;
  window.renderShowGameArtSvg = renderShowGameArtSvg;
})();
