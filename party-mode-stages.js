"use strict";

/* ===== Study Game — Distinct Lazy-Loaded Room Mode Stages (v45) =====
   Each Room Mode (Normal, Acquaint, Auction, Video, Games) renders ONLY its
   active layout and tears down inactive mode DOM/players on switch for zero lag. */

(function () {
  const PMSR = () => (typeof window !== 'undefined' && window.PartyModeStagesRules ? window.PartyModeStagesRules : null);

  let mountedRoomId = '';
  let mountedMode = '';
  let activeCleanupFns = [];

  function registerCleanup(fn) {
    if (typeof fn === 'function') activeCleanupFns.push(fn);
  }

  function runModeCleanup(prevMode, nextMode) {
    while (activeCleanupFns.length) {
      const fn = activeCleanupFns.pop();
      try { fn(); } catch {}
    }
    if (prevMode === 'video' && nextMode !== 'video') {
      if (typeof PartyVideoSync !== 'undefined' && typeof PartyVideoSync.destroy === 'function') {
        try { PartyVideoSync.destroy(); } catch {}
      }
      const vSlot = document.getElementById('pfsVideoSlot');
      if (vSlot) vSlot.innerHTML = '';
    }
  }

  function onModeWillChange(prevMode, nextMode) {
    runModeCleanup(prevMode, nextMode);
    mountedMode = nextMode || '';
    const stage = document.getElementById('pfsStageSlot');
    if (stage) stage.dataset.modeSig = '';
  }

  function getModeThemeClass(mode) {
    const m = PMSR() ? PMSR().sanitizeMode(mode) : String(mode || 'normal');
    return `pfs-mode-${m}`;
  }

  function getModeBackdropOverride(rm, defaultBgCss, themeId) {
    const m = PMSR() ? PMSR().sanitizeMode(rm && rm.mode) : String((rm && rm.mode) || 'normal');
    const th = String(themeId || (rm && rm.roomTheme) || 'default').toLowerCase();
    if (th === 'gradient') return defaultBgCss;

    if (m === 'acquaint') {
      if (th === 'light') {
        return 'radial-gradient(circle at 50% 10%, rgba(244, 114, 182, .28), transparent 56%), radial-gradient(circle at 84% 72%, rgba(167, 139, 250, .24), transparent 54%), linear-gradient(180deg, #fae2ec 0%, #f1e6fb 55%, #e2e8fa 100%)';
      }
      if (th === 'dark') {
        return 'radial-gradient(circle at 50% 10%, rgba(244, 114, 182, .22), transparent 54%), radial-gradient(circle at 84% 72%, rgba(167, 139, 250, .16), transparent 52%), linear-gradient(180deg, #160e1d 0%, #191224 55%, #0d0c18 100%)';
      }
      return 'radial-gradient(circle at 50% 10%, rgba(244, 114, 182, .26), transparent 56%), radial-gradient(circle at 84% 72%, rgba(167, 139, 250, .22), transparent 54%), linear-gradient(180deg, #241934 0%, #2a1e42 55%, #1a1830 100%)';
    }
    if (m === 'auction') {
      if (th === 'light') {
        return 'radial-gradient(circle at 50% 8%, rgba(251, 191, 36, .34), transparent 54%), radial-gradient(circle at 18% 44%, rgba(251, 146, 60, .2), transparent 48%), linear-gradient(180deg, #faefd2 0%, #f5e8cc 55%, #e8e6df 100%)';
      }
      if (th === 'dark') {
        return 'radial-gradient(circle at 50% 8%, rgba(245, 158, 11, .22), transparent 52%), linear-gradient(180deg, #171310 0%, #1d1714 55%, #0e0e14 100%)';
      }
      return 'radial-gradient(circle at 50% 8%, rgba(245, 158, 11, .26), transparent 54%), radial-gradient(circle at 18% 44%, rgba(251, 146, 60, .18), transparent 48%), linear-gradient(180deg, #251e22 0%, #2c2430 55%, #191926 100%)';
    }
    if (m === 'games') {
      if (th === 'light') {
        return 'radial-gradient(circle at 50% 10%, rgba(56, 189, 248, .3), transparent 56%), radial-gradient(circle at 86% 68%, rgba(52, 211, 153, .22), transparent 52%), linear-gradient(180deg, #d7ecfc 0%, #e1edfb 55%, #d9f2ea 100%)';
      }
      if (th === 'dark') {
        return 'radial-gradient(circle at 50% 10%, rgba(56, 189, 248, .22), transparent 54%), radial-gradient(circle at 86% 68%, rgba(52, 211, 153, .16), transparent 50%), linear-gradient(180deg, #0c1724 0%, #101e2f 55%, #0b1620 100%)';
      }
      return 'radial-gradient(circle at 50% 10%, rgba(56, 189, 248, .28), transparent 56%), radial-gradient(circle at 86% 68%, rgba(52, 211, 153, .2), transparent 52%), linear-gradient(180deg, #13233a 0%, #192f4a 55%, #122634 100%)';
    }
    return defaultBgCss;
  }

  function buildStageSignature(rm) {
    const m = PMSR() ? PMSR().sanitizeMode(rm.mode) : String(rm.mode || 'normal');
    const prr = typeof window !== 'undefined' && window.PartyRoomRules ? window.PartyRoomRules : null;
    const ownerInfo = prr && typeof prr.getRoomOwnerDisplayInfo === 'function'
      ? prr.getRoomOwnerDisplayInfo(rm, Date.now(), prr.DEFAULT_STALE_MS)
      : { uid: rm.ownerUid || rm.hostUid || '', name: rm.ownerName || rm.hostName || '', avatar: rm.ownerAvatar || '', online: Boolean(rm.seats && rm.seats['0']) };
    const seats = rm.seats || {};
    const seatSig = Object.keys(seats).sort().map(k => {
      const s = seats[k];
      return `${k}:${s?.uid || ''}:${s?.muted ? 1 : 0}:${s?.speaking ? 1 : 0}:${s?.name || ''}`;
    }).join('|');
    const lockSig = (rm.lockedSeats || []).join(',');
    const adminSig = (rm.admins || []).join(',');
    let modeSig = '';
    if (m === 'acquaint') modeSig = JSON.stringify(rm.acquaintState || {});
    else if (m === 'auction') modeSig = JSON.stringify(rm.auctionState || {});
    else if (m === 'games') modeSig = JSON.stringify(rm.gamesStageState || {});
    else if (m === 'video') modeSig = `${rm.mediaPlayMode || ''}:${rm.youtubeId || ''}:${(rm.queue || []).length}`;
    return `${rm.id}::${m}::${rm.partnerSeat ? 1 : 0}::${ownerInfo.uid}:${ownerInfo.name}:${ownerInfo.avatar}:${ownerInfo.online ? 1 : 0}::${seatSig}::${lockSig}::${adminSig}::${modeSig}`;
  }

  /* ===== 1. Normal Mode Stage ===== */
  function renderNormalStage(rm, renderSeatTile) {
    return `
      <div class="pms-normal-stage" data-testid="vr-stage-normal">
        <div class="pfs-owner-solo">${renderSeatTile(rm, 0)}</div>
        <div class="pfs-seats-4col">
          ${[1, 2, 3, 4, 5, 6, 7, 8].map(i => renderSeatTile(rm, i)).join('')}
        </div>
      </div>
    `;
  }

  /* ===== 2. Acquaint Mode Stage (Heart / Couple Theme) ===== */
  function renderAcquaintStage(rm, renderSeatTile) {
    const rules = PMSR();
    const st = rules ? rules.normalizeAcquaintState(rm.acquaintState) : { status: 'waiting', phase: 'waiting', hearts: 0 };
    const actions = rules ? rules.ACQUAINT_ACTIONS : [];
    const seat0 = rm.seats && rm.seats['0'];
    const seat1 = rm.seats && rm.seats['1'];
    const canHost = typeof canModerateRoom === 'function' ? canModerateRoom(rm) : true;
    const statusLine = st.status === 'waiting'
      ? 'Waiting for guests...'
      : (st.lastNotice || st.prompt || 'Couple stage is live!');

    return `
      <div class="pms-acquaint-stage" data-testid="vr-stage-acquaint">
        <div class="pms-acq-hero">
          <div class="pms-acq-top-row">
            <span class="pms-acq-badge">💞 ACQUAINT COUPLE STAGE</span>
            <span class="pms-acq-hearts" data-testid="acq-hearts-count">❤️ ${st.hearts}</span>
          </div>

          <div class="pms-acq-couple-deck">
            <div class="pms-acq-slot host">
              ${renderSeatTile(rm, 0)}
            </div>
            <div class="pms-acq-bridge" aria-hidden="true">
              <span class="pms-acq-heart-orb ${st.status === 'active' ? 'live' : ''}">💗</span>
              <small>${st.status === 'active' ? (st.phase.toUpperCase()) : 'PAIR'}</small>
            </div>
            <div class="pms-acq-slot guest">
              ${renderSeatTile(rm, 1)}
            </div>
          </div>

          <div class="pms-acq-status-bar">
            <div class="pms-acq-status-txt" data-testid="acq-status-text">${esc(statusLine)}</div>
            ${canHost
              ? (st.status === 'waiting'
                  ? `<button type="button" class="btn sm gold pms-acq-start-btn" data-pfs-act="mode-acq-start" data-testid="acq-start-btn">▶ Start</button>`
                  : `<button type="button" class="btn sm ghost pms-acq-start-btn" data-pfs-act="mode-acq-reset" data-testid="acq-reset-btn">↺ Reset</button>`)
              : ''}
          </div>

          <div class="pms-acq-pills" role="group" aria-label="Acquaint stage actions">
            ${actions.map(a => `
              <button type="button" class="pms-acq-pill ${st.phase === a.id ? 'active' : ''}" data-pfs-act="mode-acq-${esc(a.id)}" data-testid="acq-act-${esc(a.id)}" title="${esc(a.desc)}">
                <span aria-hidden="true">${a.icon}</span>
                <span>${esc(a.label)}</span>
              </button>
            `).join('')}
          </div>
        </div>

        <div class="pms-acq-seats-hdr">
          <span>Numbered Guest Seats (2–8)</span>
          <small>${seat0 && seat1 ? 'Couple paired · Tap any seat' : 'Tap Seat 1 or any seat to join'}</small>
        </div>
        <div class="pfs-seats-4col pms-acq-grid">
          ${[2, 3, 4, 5, 6, 7, 8].map(i => renderSeatTile(rm, i)).join('')}
        </div>
      </div>
    `;
  }

  /* ===== 3. Auction Mode Stage (Spotlight + Bidding + VIP Frame) ===== */
  function renderAuctionStage(rm, renderSeatTile) {
    const rules = PMSR();
    const st = rules ? rules.normalizeAuctionState(rm.auctionState) : { tab: 'bidding', bidType: 'ordinary', relationship: '', startingPrice: 0, currentBid: 0, status: 'idle' };
    const canHost = typeof canModerateRoom === 'function' ? canModerateRoom(rm) : true;
    const relLabel = st.relationship
      ? `${st.bidType === 'bff' ? '💎 BFF · ' : ''}${st.relationship}`
      : 'No relationship set';
    const priceLabel = st.currentBid > 0
      ? `${st.currentBid} 🪙 (${st.highestBidderName})`
      : (st.startingPrice > 0 ? `Start: ${st.startingPrice} 🪙` : 'No price set');

    return `
      <div class="pms-auction-stage" data-testid="vr-stage-auction">
        <div class="pms-auc-spotlight" aria-hidden="true"></div>

        <div class="pms-auc-tabs" role="tablist" aria-label="Auction sub-mode">
          <button type="button" role="tab" aria-selected="${st.tab === 'bidding' ? 'true' : 'false'}" class="pms-auc-tab ${st.tab === 'bidding' ? 'active' : ''}" data-pfs-act="mode-auc-tab-bidding" data-testid="auc-tab-bidding">🔨 Bidding</button>
          <button type="button" role="tab" aria-selected="${st.tab === 'relationship' ? 'true' : 'false'}" class="pms-auc-tab ${st.tab === 'relationship' ? 'active' : ''}" data-pfs-act="mode-auc-tab-relationship" data-testid="auc-tab-relationship">💞 Relationship Advancement</button>
        </div>

        <div class="pms-auc-slots-row">
          <div class="pms-auc-info-slot ${st.relationship ? 'filled' : ''}" data-testid="auc-rel-slot">
            <small>RELATIONSHIP</small>
            <b>${esc(relLabel)}</b>
          </div>
          <div class="pms-auc-info-slot ${st.startingPrice > 0 || st.currentBid > 0 ? 'filled' : ''}" data-testid="auc-price-slot">
            <small>${st.currentBid > 0 ? 'HIGHEST BID' : 'STARTING PRICE'}</small>
            <b>${esc(priceLabel)}</b>
          </div>
        </div>

        <div class="pms-auc-center-stage">
          <div class="pms-auc-host-col">
            <span class="pms-auc-col-tag">AUCTIONEER</span>
            ${renderSeatTile(rm, 0)}
            <button type="button" class="btn sm ghost pms-auc-set-btn" data-pfs-act="mode-auc-settings" data-testid="auc-settings-btn">⚙️ Settings</button>
          </div>
          <div class="pms-auc-vip-col" data-testid="auc-vip-frame">
            <span class="pms-auc-vip-crown">👑 VIP SEAT</span>
            <div class="pms-auc-vip-ring">
              ${renderSeatTile(rm, 1)}
            </div>
            <small class="pms-auc-vip-sub">${st.status === 'sold' && st.vipName ? `🏆 Sold to ${esc(st.vipName)}` : 'Golden VIP Throne'}</small>
          </div>
        </div>

        <div class="pms-auc-bid-bar">
          <button type="button" class="btn sm gold" data-pfs-act="mode-auc-bid-50" data-testid="auc-bid-50">🔨 +50 Bid</button>
          <button type="button" class="btn sm ok" data-pfs-act="mode-auc-bid-200" data-testid="auc-bid-200">💎 +200 Bid</button>
          ${canHost ? `<button type="button" class="btn sm ghost" data-pfs-act="mode-auc-sold" data-testid="auc-sold-btn">⚡ Hammer Sold</button>` : ''}
        </div>

        <div class="pfs-seats-4col pms-auc-guests">
          ${[2, 3, 4, 5, 6, 7, 8].map(i => renderSeatTile(rm, i)).join('')}
        </div>
      </div>
    `;
  }

  /* ===== 4. Video Mode Stage (Clean Cinema Seats — Zero Duplicate Add Song Button) ===== */
  function renderVideoStage(rm, renderSeatTile) {
    const micCount = [0, 1, 2, 3].filter(i => rm.seats && rm.seats[String(i)]).length;
    return `
      <div class="pms-video-stage" data-testid="vr-stage-video">
        <div class="pms-vid-quick-row">
          <span class="pms-vid-lbl">Cinema Stage · Mic 1–4</span>
          <span class="pms-vid-count tabular-nums">${micCount}/4 on mic</span>
        </div>
        <div class="pfs-seats-4col pms-vid-mics">
          ${[0, 1, 2, 3].map(i => renderSeatTile(rm, i)).join('')}
        </div>
        <div class="pfs-seats-4col pms-vid-listeners">
          ${[4, 5, 6, 7].map(i => renderSeatTile(rm, i)).join('')}
        </div>
      </div>
    `;
  }

  /* ===== 5. Games Mode Stage (Game & Sub-Mode Selector + VS Lobby) ===== */
  function renderGamesStage(rm, renderSeatTile) {
    const rules = PMSR();
    const st = rules ? rules.normalizeGamesStageState(rm.gamesStageState) : { gameId: 'uno', tierId: 'classic_free', lobbyStatus: 'idle', players: [] };
    const catalog = rules ? rules.ROOM_GAMES_CATALOG : [];
    const tiers = rules ? rules.ROOM_GAME_TIERS : [];
    const activeGame = catalog.find(g => g.id === st.gameId) || catalog[0] || { id: 'uno', name: 'Oh My Card', icon: '🃏', accent: '#f59e0b', players: '2-4P', desc: '' };
    const activeTier = tiers.find(t => t.id === st.tierId) || tiers[0] || { id: 'classic_free', label: 'Classic Free', fee: 0, badge: 'Free' };

    const prr = typeof window !== 'undefined' && window.PartyRoomRules ? window.PartyRoomRules : null;
    const ownerInfo = prr && typeof prr.getRoomOwnerDisplayInfo === 'function'
      ? prr.getRoomOwnerDisplayInfo(rm, Date.now(), prr.DEFAULT_STALE_MS)
      : { uid: rm.ownerUid || rm.hostUid, name: rm.ownerName || rm.hostName || 'Owner', avatar: rm.ownerAvatar || 'av_b1', online: false };
    const hostSeat = (rm.seats && rm.seats['0']) || { uid: ownerInfo.uid, name: ownerInfo.name || 'Owner', avatar: ownerInfo.avatar || 'av_b1', frame: 'none' };
    const rivalSeat = Object.keys(rm.seats || {})
      .filter(k => rm.seats[k] && rm.seats[k].uid !== hostSeat.uid)
      .map(k => rm.seats[k])[0] || null;
    const isLobbyOpen = st.lobbyStatus === 'waiting' || st.lobbyStatus === 'ready';

    return `
      <div class="pms-games-stage" data-testid="vr-stage-games">
        <div class="pms-gm-head">
          <span class="pms-gm-badge">🎮 ROOM GAMES ARENA</span>
          <small>${esc(activeGame.players)} · Voice Mic Active</small>
        </div>

        <div class="pms-gm-grid" role="group" aria-label="Select room game">
          ${catalog.map(g => `
            <button type="button" class="pms-gm-card ${g.id === activeGame.id ? 'active' : ''}" data-pfs-act="mode-gm-pick" data-gm-id="${esc(g.id)}" data-testid="gm-pick-${esc(g.id)}" style="--gm-accent:${g.accent}">
              <span class="pms-gm-ico" aria-hidden="true">${g.icon}</span>
              <span class="pms-gm-name">${esc(g.name)}</span>
            </button>
          `).join('')}
        </div>

        <div class="pms-gm-tiers" role="tablist" aria-label="Game sub-mode tier">
          ${tiers.map(t => `
            <button type="button" role="tab" aria-selected="${t.id === activeTier.id ? 'true' : 'false'}" class="pms-gm-tier ${t.id === activeTier.id ? 'active' : ''}" data-pfs-act="mode-gm-tier" data-tier-id="${esc(t.id)}" data-testid="gm-tier-${esc(t.id)}">
              <b>${esc(t.label)}</b>
              <small>${esc(t.badge)}</small>
            </button>
          `).join('')}
        </div>

        <div class="pms-gm-vs-card" data-testid="gm-vs-lobby">
          <div class="pms-gm-vs-top">
            <span>${activeGame.icon} <b>${esc(activeGame.name)}</b></span>
            <span class="pms-gm-tier-pill">${esc(activeTier.label)} · ${esc(activeTier.badge)}</span>
          </div>
          <div class="pms-gm-vs-arena">
            <div class="pms-gm-player">
              <div class="pms-gm-av">${typeof av === 'function' ? av(hostSeat, 40) : '<span>🎮</span>'}</div>
              <b>${esc(hostSeat.name || 'Host')}</b>
              <small>Host Ready</small>
            </div>
            <div class="pms-gm-vs-badge" aria-hidden="true">VS</div>
            <div class="pms-gm-player ${rivalSeat ? 'joined' : 'waiting'}">
              <div class="pms-gm-av">${rivalSeat && typeof av === 'function' ? av(rivalSeat, 40) : '<span class="pms-gm-wait-ico">?</span>'}</div>
              <b>${rivalSeat ? esc(rivalSeat.name) : (isLobbyOpen ? 'Waiting...' : 'Open Slot')}</b>
              <small>${rivalSeat ? 'Ready' : 'Invite or Bot'}</small>
            </div>
          </div>
          <div class="pms-gm-vs-acts">
            <button type="button" class="btn sm ok" data-pfs-act="mode-gm-invite" data-testid="gm-invite-btn">👥 Invite Friends</button>
            <button type="button" class="btn sm gold" data-pfs-act="mode-gm-launch" data-testid="gm-launch-btn">▶ Play Now</button>
            <button type="button" class="btn sm ghost" data-pfs-act="mode-gm-cancel" data-testid="gm-cancel-btn">✕ Cancel</button>
          </div>
        </div>

        <div class="pfs-seats-4col pms-gm-mics">
          ${[0, 1, 2, 3].map(i => renderSeatTile(rm, i)).join('')}
        </div>
      </div>
    `;
  }

  /* ===== Main Lazy-Mount Entrypoint ===== */
  function renderActiveModeStage(rm, stageEl, renderSeatTile) {
    if (!rm || !stageEl || typeof renderSeatTile !== 'function') return;
    const mode = PMSR() ? PMSR().sanitizeMode(rm.mode) : String(rm.mode || 'normal');

    if (mountedRoomId !== rm.id || mountedMode !== mode) {
      runModeCleanup(mountedMode, mode);
      mountedRoomId = rm.id;
      mountedMode = mode;
      stageEl.dataset.modeSig = '';
    }

    const sig = buildStageSignature(rm);
    if (stageEl.dataset.modeSig === sig) return;
    stageEl.dataset.modeSig = sig;
    stageEl.dataset.activeMode = mode;

    if (mode === 'acquaint') {
      stageEl.innerHTML = renderAcquaintStage(rm, renderSeatTile);
    } else if (mode === 'auction') {
      stageEl.innerHTML = renderAuctionStage(rm, renderSeatTile);
    } else if (mode === 'video') {
      stageEl.innerHTML = renderVideoStage(rm, renderSeatTile);
    } else if (mode === 'games') {
      stageEl.innerHTML = renderGamesStage(rm, renderSeatTile);
    } else {
      stageEl.innerHTML = renderNormalStage(rm, renderSeatTile);
    }
  }

  /* ===== Auction Settings Modal ===== */
  function openAuctionSettingsModal(rm) {
    if (!rm) return;
    if (!assertRoomPerm(rm, 'edit_settings')) return;
    const rules = PMSR();
    const st = rules ? rules.normalizeAuctionState(rm.auctionState) : { tab: 'bidding', bidType: 'ordinary', relationship: '', startingPrice: 0 };
    let selBidType = st.bidType || 'ordinary';
    let selRelation = st.relationship || '';
    let selPrice = st.startingPrice || 0;

    const m = modal('🔨 Auction Settings', `
      <div class="auc-set-shell" data-testid="vr-auction-settings-modal">
        <div class="auc-set-sec">
          <div class="rmd-sec-title">Auction Type</div>
          <div class="auc-type-row">
            ${(rules ? rules.AUCTION_BID_TYPES : []).map(bt => `
              <button type="button" class="auc-type-btn ${selBidType === bt.id ? 'active' : ''}" data-auc-type="${esc(bt.id)}" data-testid="auc-type-${esc(bt.id)}">
                <b>${esc(bt.label)}</b>
                <small>${esc(bt.desc)}</small>
              </button>
            `).join('')}
          </div>
        </div>

        <div class="auc-set-sec">
          <div class="rmd-sec-title">Relationship Tag</div>
          <div class="auc-rel-chips">
            ${(rules ? rules.AUCTION_RELATION_TAGS : []).map(tag => `
              <button type="button" class="auc-rel-chip ${selRelation === tag ? 'active' : ''}" data-auc-rel="${esc(tag)}" data-testid="auc-rel-${esc(tag.toLowerCase().replace(/[^a-z0-9]+/g, '-'))}">${esc(tag)}</button>
            `).join('')}
          </div>
        </div>

        <div class="auc-set-sec">
          <label class="rmd-sec-title" for="aucStartPriceIn">Starting Price (Coins)</label>
          <input type="number" id="aucStartPriceIn" min="0" max="1000000" step="50" value="${selPrice}" placeholder="e.g. 500" data-testid="auc-price-input">
          <div class="auc-price-presets">
            ${[100, 250, 500, 1000, 2500].map(p => `<button type="button" class="btn sm ghost" data-auc-preset="${p}">${p} 🪙</button>`).join('')}
          </div>
        </div>

        <div class="rmc-acts" style="margin-top:12px">
          <button type="button" class="btn ghost full" id="aucSetCancel">Cancel</button>
          <button type="button" class="btn gold full" id="aucSetConfirm" data-testid="auc-settings-confirm">Confirm</button>
        </div>
      </div>
    `, 'auc-set-modal');

    m.addEventListener('click', (e) => {
      const tb = e.target.closest('[data-auc-type]');
      if (tb) {
        selBidType = tb.dataset.aucType;
        $$('[data-auc-type]', m).forEach(b => b.classList.toggle('active', b === tb));
        if (selBidType === 'bff' && !selRelation) {
          selRelation = 'BFF';
          $$('[data-auc-rel]', m).forEach(b => b.classList.toggle('active', b.dataset.aucRel === selRelation));
        }
        return;
      }
      const rb = e.target.closest('[data-auc-rel]');
      if (rb) {
        selRelation = selRelation === rb.dataset.aucRel ? '' : rb.dataset.aucRel;
        $$('[data-auc-rel]', m).forEach(b => b.classList.toggle('active', b.dataset.aucRel === selRelation));
        return;
      }
      const pb = e.target.closest('[data-auc-preset]');
      if (pb) {
        selPrice = Number(pb.dataset.aucPreset || 0);
        const inp = $('#aucStartPriceIn', m);
        if (inp) inp.value = String(selPrice);
      }
    });

    $('#aucSetCancel', m).onclick = () => m.close();
    $('#aucSetConfirm', m).onclick = () => {
      if (!assertRoomPerm(rm, 'edit_settings')) return;
      const inpVal = Number($('#aucStartPriceIn', m)?.value || 0);
      const res = rules ? rules.applyAuctionSettings(rm.auctionState, {
        bidType: selBidType,
        relationship: selRelation,
        startingPrice: inpVal
      }, Date.now()) : null;
      if (res && res.ok) {
        rm.auctionState = res.state;
        const now = Date.now();
        rm.chat = [...(rm.chat || []), {
          id: 'auc_' + now.toString(36),
          type: 'sys',
          text: `🔨 Auction configured: ${selBidType === 'bff' ? 'BFF' : 'Ordinary bidding'}${selRelation ? ` · ${selRelation}` : ''}${res.state.startingPrice ? ` · Starting ${res.state.startingPrice} 🪙` : ''}`,
          ts: now
        }].slice(-45);
        if (window.PartyRoomExtras && typeof window.PartyRoomExtras.logRoomOperation === 'function') {
          window.PartyRoomExtras.logRoomOperation(rm, 'Updated Auction Settings', `${selRelation || 'Open'} · ${res.state.startingPrice} 🪙`);
        }
        persistPartyRoom(rm);
        toast('🔨 Auction settings updated!');
      }
      m.close();
    };
  }

  /* ===== Launch Real Game from Games Mode Stage ===== */
  async function launchSelectedRoomGame(rm) {
    const rules = PMSR();
    const st = rules ? rules.normalizeGamesStageState(rm.gamesStageState) : { gameId: 'uno', tierId: 'classic_free' };
    const tier = (rules ? rules.ROOM_GAME_TIERS : []).find(t => t.id === st.tierId) || { fee: 0, label: 'Classic Free' };
    const gameMeta = (rules ? rules.ROOM_GAMES_CATALOG : []).find(g => g.id === st.gameId) || { id: 'uno', name: 'Oh My Card' };

    if (tier.fee > 0 && typeof me !== 'undefined' && Number(me.coins || 0) < tier.fee) {
      toast(`Need ${tier.fee} 🪙 for ${tier.label} mode!`);
      return;
    }

    const otherSeat = Object.values(rm.seats || {}).find(s => s && s.uid !== uid) || null;
    const rival = otherSeat ? { uid: otherSeat.uid, name: otherSeat.name, avatar: otherSeat.avatar || 'av_b1' } : null;

    if (typeof minimizePartyRoom === 'function') minimizePartyRoom({ silent: true });

    const modMap = { uno: 'uno', jackaroo: 'jackaroo', ludo: 'ludo', pool8: 'pool8', budget: 'budget', couple: 'couple' };
    if (typeof ensureGameModule === 'function' && modMap[st.gameId]) {
      try { await ensureGameModule(modMap[st.gameId]); } catch {}
    }

    if (st.gameId === 'uno' && typeof launchUnoGame === 'function') {
      launchUnoGame(tier.fee, rival, '1v1', 'standard', rm.shortId);
    } else if (st.gameId === 'jackaroo' && typeof launchJackaroo === 'function') {
      launchJackaroo(tier.fee, rival, '1v1', 'standard', rm.shortId);
    } else if (st.gameId === 'ludo' && typeof launchLudoGame === 'function') {
      launchLudoGame({ stake: tier.fee, mode: '1v1', roomCode: rm.shortId });
    } else if (st.gameId === 'pool8' && typeof launchPool8BallPro === 'function') {
      launchPool8BallPro({ stake: tier.fee, rival });
    } else if (st.gameId === 'pool8' && typeof launchPool8Ball === 'function') {
      launchPool8Ball(tier.fee, rival);
    } else if (st.gameId === 'budget' && typeof launchBudgetClash === 'function') {
      launchBudgetClash({ stake: tier.fee, rival });
    } else if (st.gameId === 'couple' && typeof launchCoupleArena === 'function') {
      launchCoupleArena({ stake: tier.fee, rival });
    } else {
      toast(`🎮 Ready to play ${gameMeta.name} (${tier.label})!`);
    }
  }

  /* ===== Action Dispatcher for All Mode Stages ===== */
  function handleAction(rm, act, btnEl) {
    if (!rm || !act) return false;
    const rules = PMSR();
    if (!rules) return false;
    const now = Date.now();
    const actorName = (typeof me !== 'undefined' && me && me.name) || 'Host';

    /* --- Acquaint Actions --- */
    if (act.startsWith('mode-acq-')) {
      const sub = act.replace('mode-acq-', '');
      if ((sub === 'start' || sub === 'reset') && !assertRoomPerm(rm, 'change_mode')) return true;
      const otherSeatKey = Object.keys(rm.seats || {}).find(k => rm.seats[k] && rm.seats[k].uid !== uid);
      const otherSeat = otherSeatKey != null ? rm.seats[otherSeatKey] : null;
      const res = rules.applyAcquaintAction(rm.acquaintState, sub, {
        actorName,
        targetSeat: otherSeatKey != null ? Number(otherSeatKey) : 1,
        targetName: otherSeat ? otherSeat.name : 'Seat 1'
      }, now);
      if (res.ok) {
        rm.acquaintState = res.state;
        if (res.chatText) {
          rm.chat = [...(rm.chat || []), { id: 'acq_' + now.toString(36), type: 'sys', text: res.chatText, ts: now }].slice(-45);
        }
        persistPartyRoom(rm);
        toast(res.state.lastNotice || '💞 Acquaint updated');
      }
      return true;
    }

    /* --- Auction Actions --- */
    if (act === 'mode-auc-settings') {
      openAuctionSettingsModal(rm);
      return true;
    }
    if (act === 'mode-auc-tab-bidding' || act === 'mode-auc-tab-relationship') {
      if (!assertRoomPerm(rm, 'edit_settings')) return true;
      const tab = act === 'mode-auc-tab-relationship' ? 'relationship' : 'bidding';
      const res = rules.applyAuctionSettings(rm.auctionState, { tab }, now);
      rm.auctionState = res.state;
      persistPartyRoom(rm);
      toast(tab === 'relationship' ? '💞 Switched to Relationship Advancement' : '🔨 Switched to Bidding');
      return true;
    }
    if (act === 'mode-auc-bid-50' || act === 'mode-auc-bid-200') {
      const inc = act === 'mode-auc-bid-200' ? 200 : 50;
      const res = rules.placeAuctionBid(rm.auctionState, uid, actorName, inc, now);
      if (res.ok) {
        rm.auctionState = res.state;
        rm.chat = [...(rm.chat || []), { id: 'bid_' + now.toString(36), type: 'sys', text: res.chatText, ts: now }].slice(-45);
        persistPartyRoom(rm);
        toast(`🔨 Bid placed: ${res.bidAmount} 🪙`);
      }
      return true;
    }
    if (act === 'mode-auc-sold') {
      if (!assertRoomPerm(rm, 'edit_settings')) return true;
      const res = rules.concludeAuction(rm.auctionState, now);
      if (!res.ok) {
        toast(`🔨 ${res.reason || 'Place a bid first!'}`);
        return true;
      }
      rm.auctionState = res.state;
      rm.chat = [...(rm.chat || []), { id: 'sld_' + now.toString(36), type: 'sys', text: res.chatText, ts: now }].slice(-45);
      persistPartyRoom(rm);
      toast(`👑 Sold to ${res.state.vipName}!`);
      return true;
    }

    /* --- Games Mode Actions --- */
    if (act === 'mode-gm-pick') {
      const gmId = btnEl && btnEl.dataset ? btnEl.dataset.gmId : '';
      const res = rules.selectRoomGame(rm.gamesStageState, gmId, now);
      if (res.ok) {
        rm.gamesStageState = res.state;
        persistPartyRoom(rm);
      }
      return true;
    }
    if (act === 'mode-gm-tier') {
      const tierId = btnEl && btnEl.dataset ? btnEl.dataset.tierId : '';
      const res = rules.selectRoomGameTier(rm.gamesStageState, tierId, now);
      if (res.ok) {
        rm.gamesStageState = res.state;
        persistPartyRoom(rm);
      }
      return true;
    }
    if (act === 'mode-gm-invite') {
      const lRes = rules.openRoomGameLobby(rm.gamesStageState, { uid, name: actorName, avatar: (me && me.avatar) || 'av_b1' }, now);
      rm.gamesStageState = lRes.state;
      persistPartyRoom(rm);
      if (typeof openPartyInviteModal === 'function') openPartyInviteModal(rm);
      return true;
    }
    if (act === 'mode-gm-launch') {
      const lRes = rules.openRoomGameLobby(rm.gamesStageState, { uid, name: actorName, avatar: (me && me.avatar) || 'av_b1' }, now);
      rm.gamesStageState = lRes.state;
      persistPartyRoom(rm);
      launchSelectedRoomGame(rm);
      return true;
    }
    if (act === 'mode-gm-cancel') {
      const cRes = rules.cancelRoomGameLobby(rm.gamesStageState, now);
      rm.gamesStageState = cRes.state;
      persistPartyRoom(rm);
      toast('🎮 Game lobby cancelled');
      return true;
    }

    return false;
  }

  window.PartyModeStages = {
    registerCleanup,
    onModeWillChange,
    runModeCleanup,
    getModeThemeClass,
    getModeBackdropOverride,
    renderActiveModeStage,
    openAuctionSettingsModal,
    handleAction
  };
})();
