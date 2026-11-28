"use strict";
/* =====================================================================
   PARTY / VR ROOM LIFECYCLE, HOST TRANSFER, YOUTUBE AD-SYNC,
   LOBBY FILTERING, STRICT OWNER/ADMIN RBAC & ADVANCED ROOM PERKS RULES
   · 100% pure functions (zero DOM / Firestore side effects)
   · Shared by browser (window.PartyRoomRules) & Node unit tests
   · Seat-ordered automatic host handoff when current owner leaves/drops
   · Auto-leave + ghost-seat eviction + empty room auto-close (or idle for Owned)
   · Strict seat deduplication (zero clone/duplicate seats on seat switch)
   · Strict Owner & Admin (max 3) permissions for mode/settings/playlist/video
   · 2,000-coin one-time Advanced / Owned Room unlock + 8 Advanced perks
   ===================================================================== */
(function (global) {
  const DEFAULT_STALE_MS = 28000;
  const BOT_UID_RE = /^(bot_|demo_|fake_)/i;
  const ADVANCED_ROOM_COST = 2000;
  const MAX_ROOM_ADMINS = 3;
  const LOBBY_CATEGORIES = ['All', 'Friends', 'Music', 'Video', 'Game', 'Chats'];
  const ROOM_TAGS = ['Friends', 'Music', 'Game', 'Chats'];

  const DEFAULT_ROOM_RULES = 'Be respectful on mic · Keep chat friendly & spam-free · Follow Room Owner & Admin guidelines.';

  const ROOM_THEMES = [
    {
      id: 'default',
      name: 'Default',
      desc: 'Balanced twilight indigo studio with crisp tinted cards.',
      swatch: 'linear-gradient(145deg, #1b2540 0%, #26355c 52%, #192238 100%)',
      accent: '#60a5fa'
    },
    {
      id: 'dark',
      name: 'Dark',
      desc: 'Sleek midnight slate surface for focused night sessions.',
      swatch: 'linear-gradient(145deg, #0b101b 0%, #131c2e 52%, #090d16 100%)',
      accent: '#818cf8'
    },
    {
      id: 'light',
      name: 'Light',
      desc: 'Soft sky-lavender daylight tint with crisp ink contrast.',
      swatch: 'linear-gradient(145deg, #d7e7fb 0%, #e6edfc 52%, #dbe5f8 100%)',
      accent: '#2563eb'
    },
    {
      id: 'gradient',
      name: 'Gradient',
      desc: 'Luminous violet-aurora gradient with rich atmospheric depth.',
      swatch: 'linear-gradient(145deg, #312e81 0%, #5b21b6 48%, #0f4c81 100%)',
      accent: '#c084fc'
    }
  ];

  function normalizeRoomTheme(raw) {
    const k = String(raw || '').trim().toLowerCase();
    if (k === 'dark' || k === 'light' || k === 'gradient' || k === 'default') return k;
    return 'default';
  }

  const ROOM_BACKGROUNDS = [
    {
      id: 'club',
      name: 'Club',
      minLevel: 1,
      ownedUnlock: true,
      category: 'Featured',
      accent: '#60a5fa',
      desc: 'Refined twilight lounge with sapphire & indigo ambient depth.',
      css: 'radial-gradient(ellipse 90% 48% at 50% -6%, rgba(59, 130, 246, .28), transparent 62%), radial-gradient(circle at 88% 82%, rgba(99, 102, 241, .22), transparent 52%), linear-gradient(172deg, #151e34 0%, #1d2946 48%, #141c2f 100%)',
      lightCss: 'radial-gradient(ellipse 90% 48% at 50% -6%, rgba(56, 189, 248, .32), transparent 62%), radial-gradient(circle at 88% 82%, rgba(99, 102, 241, .2), transparent 50%), linear-gradient(172deg, #d8e9fc 0%, #e5effd 48%, #dce6f8 100%)'
    },
    {
      id: 'diamonden_party',
      name: 'Diamonden Party',
      minLevel: 2,
      ownedUnlock: true,
      category: 'Featured',
      accent: '#f59e0b',
      desc: 'Champagne-gold & crystal gala lounge with warm radiance.',
      css: 'radial-gradient(ellipse 86% 46% at 50% -4%, rgba(245, 158, 11, .24), transparent 60%), radial-gradient(circle at 16% 36%, rgba(56, 189, 248, .18), transparent 46%), radial-gradient(circle at 86% 68%, rgba(251, 191, 36, .16), transparent 48%), linear-gradient(170deg, #1b1c2d 0%, #24223a 50%, #161827 100%)',
      lightCss: 'radial-gradient(ellipse 86% 46% at 50% -4%, rgba(251, 191, 36, .34), transparent 60%), radial-gradient(circle at 16% 36%, rgba(125, 211, 252, .26), transparent 46%), linear-gradient(170deg, #f9eed4 0%, #f4ebd8 50%, #e6edf9 100%)'
    },
    {
      id: 'stars_world',
      name: 'Stars of a different world',
      minLevel: 3,
      ownedUnlock: true,
      category: 'Featured',
      accent: '#a78bfa',
      desc: 'Cosmic indigo starfield with delicate aurora shimmer.',
      css: 'radial-gradient(2px 2px at 18% 22%, rgba(224, 231, 255, .72), transparent 60%), radial-gradient(2px 2px at 78% 16%, rgba(196, 181, 253, .76), transparent 60%), radial-gradient(1.8px 1.8px at 62% 38%, rgba(125, 211, 252, .68), transparent 60%), radial-gradient(ellipse 92% 48% at 50% 0%, rgba(129, 140, 248, .3), transparent 62%), radial-gradient(circle at 82% 76%, rgba(192, 132, 252, .22), transparent 50%), linear-gradient(172deg, #151738 0%, #201f4d 52%, #131630 100%)',
      lightCss: 'radial-gradient(2px 2px at 18% 22%, rgba(99, 102, 241, .5), transparent 60%), radial-gradient(2px 2px at 78% 16%, rgba(139, 92, 246, .52), transparent 60%), radial-gradient(ellipse 92% 48% at 50% 0%, rgba(129, 140, 248, .32), transparent 62%), linear-gradient(172deg, #dfe4fd 0%, #eae5fe 52%, #dce5fa 100%)'
    },
    {
      id: 'future_city',
      name: 'Future City',
      minLevel: 4,
      ownedUnlock: true,
      category: 'Featured',
      accent: '#38bdf8',
      desc: 'Sleek architectural skyline with crisp cyan-emerald horizons.',
      css: 'radial-gradient(ellipse 88% 44% at 50% -4%, rgba(14, 165, 233, .28), transparent 60%), radial-gradient(circle at 18% 78%, rgba(45, 212, 191, .2), transparent 48%), linear-gradient(180deg, rgba(148, 163, 184, .06) 1px, transparent 1px) 0 0 / 100% 34px, linear-gradient(172deg, #102033 0%, #152b42 52%, #0f1c2e 100%)',
      lightCss: 'radial-gradient(ellipse 88% 44% at 50% -4%, rgba(14, 165, 233, .32), transparent 60%), radial-gradient(circle at 18% 78%, rgba(45, 212, 191, .24), transparent 48%), linear-gradient(172deg, #d4f0fa 0%, #dfeefc 52%, #d9e9f7 100%)'
    },
    {
      id: 'custom',
      name: 'Custom background',
      minLevel: 5,
      ownedUnlock: true,
      category: 'Custom',
      accent: '#94a3b8',
      desc: 'Upload an image or paste an HTTPS backdrop URL with auto readability veil.',
      css: 'radial-gradient(ellipse 85% 44% at 50% 0%, rgba(100, 116, 139, .26), transparent 60%), linear-gradient(172deg, #161f33 0%, #1d2840 54%, #131b2c 100%)',
      lightCss: 'radial-gradient(ellipse 85% 44% at 50% 0%, rgba(100, 116, 139, .24), transparent 60%), linear-gradient(172deg, #dde6f4 0%, #e5ecf7 54%, #d8e2f2 100%)'
    },
    {
      id: 'stage',
      name: 'Sunlit Stage',
      minLevel: 1,
      ownedUnlock: true,
      category: 'Classic',
      accent: '#f59e0b',
      desc: 'Warm amber spotlight lounge with balanced depth.',
      css: 'radial-gradient(ellipse 84% 44% at 50% 0%, rgba(245, 158, 11, .24), transparent 60%), linear-gradient(172deg, #211d2b 0%, #292438 52%, #181726 100%)',
      lightCss: 'radial-gradient(ellipse 84% 44% at 50% 0%, rgba(245, 158, 11, .28), transparent 60%), linear-gradient(172deg, #faeed7 0%, #f4eadc 52%, #e6eaf6 100%)'
    },
    {
      id: 'grid',
      name: 'Sky Studio',
      minLevel: 1,
      ownedUnlock: true,
      category: 'Classic',
      accent: '#38bdf8',
      desc: 'Crisp glacier-blue studio with serene atmospheric sheen.',
      css: 'radial-gradient(ellipse 84% 44% at 50% 0%, rgba(56, 189, 248, .26), transparent 60%), linear-gradient(172deg, #142238 0%, #1b2e4a 54%, #121e32 100%)',
      lightCss: 'radial-gradient(ellipse 84% 44% at 50% 0%, rgba(56, 189, 248, .3), transparent 60%), linear-gradient(172deg, #d7ecfc 0%, #e3effc 54%, #dce7f7 100%)'
    },
    {
      id: 'neon',
      name: 'Lilac Breeze',
      minLevel: 1,
      ownedUnlock: true,
      category: 'Classic',
      accent: '#a855f7',
      desc: 'Velvet lavender twilight atmosphere for relaxed voice chats.',
      css: 'radial-gradient(ellipse 84% 44% at 24% 4%, rgba(168, 85, 247, .28), transparent 60%), linear-gradient(170deg, #1d1838 0%, #271f4a 52%, #16152e 100%)',
      lightCss: 'radial-gradient(ellipse 84% 44% at 24% 4%, rgba(167, 139, 250, .32), transparent 60%), linear-gradient(170deg, #e7dffd 0%, #eee7fe 52%, #e0e5f9 100%)'
    },
    {
      id: 'royal',
      name: 'Mint Blossom',
      minLevel: 1,
      ownedUnlock: true,
      category: 'Classic',
      accent: '#34d399',
      desc: 'Deep emerald-jade lounge with crisp botanical highlights.',
      css: 'radial-gradient(ellipse 84% 44% at 50% 4%, rgba(52, 211, 153, .24), transparent 60%), linear-gradient(170deg, #11262c 0%, #16333a 52%, #102029 100%)',
      lightCss: 'radial-gradient(ellipse 84% 44% at 50% 4%, rgba(52, 211, 153, .3), transparent 60%), linear-gradient(170deg, #d6f5e8 0%, #e2f6ee 52%, #dcebf2 100%)'
    }
  ];

  const ROOM_LEVEL_PERKS_TABLE = [
    { level: 1, xpRequired: 0, maxAdmins: 1, perkTitle: 'Club Background & Rules Card', perkDetail: '1 Admin slot · Clean Room Rules card · Club theme', bgId: 'club', badge: 'Starter' },
    { level: 2, xpRequired: 100, maxAdmins: 2, perkTitle: 'Diamonden Party & Partner Seat', perkDetail: '2 Admin slots · Partner/Guest Seat 1 · Diamonden Party theme', bgId: 'diamonden_party', badge: 'Rising' },
    { level: 3, xpRequired: 260, maxAdmins: 2, perkTitle: 'Stars of a different world', perkDetail: '2 Admin slots · Rec Card / Lobby Boost · Starfield theme', bgId: 'stars_world', badge: 'Star' },
    { level: 4, xpRequired: 480, maxAdmins: 3, perkTitle: 'Future City & 3 Admin Slots', perkDetail: '3 Admin slots (Max) · HD Studio Audio · Future City theme', bgId: 'future_city', badge: 'Elite' },
    { level: 5, xpRequired: 760, maxAdmins: 3, perkTitle: 'Custom background & VIP Lounge', perkDetail: '3 Admin slots · Custom background image/URL · Room Guard badge', bgId: 'custom', badge: 'Hall' }
  ];

  const ADVANCED_ROOM_PERKS = [
    { id: 'level', icon: '📈', name: 'Room Level', shortDesc: 'Earn room XP from chat, stays & gifts to unlock higher tiers.' },
    { id: 'follow', icon: '📣', name: 'Follow & Rally', shortDesc: 'Let fans follow your room & send instant Rally invites.' },
    { id: 'boost', icon: '🚀', name: 'Rec Card / Boost', shortDesc: 'Pin & highlight your room at the top of the Room Lobby.' },
    { id: 'admin', icon: '🛡️', name: 'Admin (Max 3)', shortDesc: 'Appoint up to 3 trusted Admins to moderate & manage playlist.' },
    { id: 'guard', icon: '⚔️', name: 'Room Guard', shortDesc: 'Recognize loyal supporters with Room Guard shield badges.' },
    { id: 'mic_order', icon: '🎙️', name: 'Mic Order', shortDesc: 'Manage mic turn queue & lock/unlock stage seats smoothly.' },
    { id: 'fixed_id', icon: '🆔', name: 'Fixed ID', shortDesc: 'Permanent clean 6-digit Room ID tied to your profile forever.' },
    { id: 'hq_mode', icon: '🎧', name: 'High Quality Mode', shortDesc: 'Enable high-clarity HD voice & music studio sound mode.' }
  ];

  function isBotOrSeedUid(uid) {
    return BOT_UID_RE.test(String(uid || '').trim());
  }

  function generateFixedRoomId(seedStr) {
    let h = 2166136261;
    const s = String(seedStr || 'owned_room');
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return String(100000 + (Math.abs(h) % 899999));
  }

  /**
   * Strictly guarantees zero clone / duplicate seats for the same uid.
   * When a user switches seats, only their latest seat entry survives.
   */
  function deduplicateSeats(seats) {
    if (!seats || typeof seats !== 'object') return {};
    const bestByUid = new Map();
    Object.keys(seats)
      .sort((a, b) => Number(a) - Number(b))
      .forEach((k) => {
        const occ = seats[k];
        if (!occ || !occ.uid) return;
        const u = String(occ.uid).trim();
        if (!u) return;
        const ts = Math.max(Number(occ.lastSeen || 0), Number(occ.joinedAt || 0));
        const prev = bestByUid.get(u);
        if (!prev || ts >= prev.ts) {
          bestByUid.set(u, { key: String(k), ts, occ: { ...occ, uid: u } });
        }
      });
    const clean = {};
    bestByUid.forEach((info) => {
      clean[info.key] = info.occ;
    });
    return clean;
  }

  /**
   * Strict seat sanitizer that prevents the Room Owner from EVER occupying or
   * cloning into guest seats (1..8) and keeps Seat 0 reserved strictly for ownerUid.
   */
  function sanitizeRoomSeats(seats, ownerUid) {
    const clean = deduplicateSeats(seats);
    const owner = String(ownerUid || '').trim();
    if (!owner) return clean;

    let strayOwnerKey = null;
    Object.keys(clean)
      .sort((a, b) => Number(a) - Number(b))
      .forEach((k) => {
        if (k !== '0' && clean[k] && clean[k].uid === owner) {
          if (strayOwnerKey == null) strayOwnerKey = k;
          else delete clean[k];
        }
      });

    if (strayOwnerKey != null) {
      const strayEntry = clean[strayOwnerKey];
      delete clean[strayOwnerKey];
      if (!clean['0']) {
        clean['0'] = { ...strayEntry, uid: owner };
      } else if (clean['0'].uid !== owner) {
        const displaced = clean['0'];
        clean['0'] = { ...strayEntry, uid: owner };
        if (!clean[strayOwnerKey]) {
          clean[strayOwnerKey] = { ...displaced };
        } else {
          for (let i = 1; i <= 8; i++) {
            if (!clean[String(i)]) {
              clean[String(i)] = { ...displaced };
              break;
            }
          }
        }
      }
    }

    if (clean['0'] && clean['0'].uid !== owner) {
      const displaced = clean['0'];
      delete clean['0'];
      for (let i = 1; i <= 8; i++) {
        if (!clean[String(i)]) {
          clean[String(i)] = { ...displaced };
          break;
        }
      }
    }

    return deduplicateSeats(clean);
  }

  function canUserTakeSeat(room, actorUid, seatIdx) {
    const idx = Number(seatIdx);
    const uidStr = String(actorUid || '').trim();
    if (!room || !uidStr || !Number.isFinite(idx) || idx < 0 || idx > 8) {
      return { allowed: false, reason: 'Invalid seat' };
    }
    const amOwner = isRoomOwner(room, uidStr);
    const amAdmin = amOwner || isRoomAdminOnly(room, uidStr);
    const isLocked = Array.isArray(room.lockedSeats) && room.lockedSeats.includes(idx);

    if (idx === 0) {
      if (!amOwner) {
        return { allowed: false, reason: 'Seat 0 is reserved strictly for the Room Owner' };
      }
      return { allowed: true, reason: '' };
    }

    // Guest seats 1..8: Room Owner stays strictly in dedicated Owner slot (Seat 0)
    if (amOwner) {
      return { allowed: false, reason: 'Room Owner stays in the dedicated Owner slot (Seat 0)' };
    }

    if (isLocked && !amAdmin) {
      return { allowed: false, reason: 'This seat is locked by Room Owner / Admin' };
    }
    return { allowed: true, reason: '' };
  }

  function normalizeMemberEntry(raw, fallbackSeatIdx) {
    if (!raw || typeof raw !== 'object') return null;
    const uid = String(raw.uid || '').trim();
    if (!uid) return null;
    const seatNum = raw.seatIdx != null && Number.isFinite(Number(raw.seatIdx))
      ? Number(raw.seatIdx)
      : (fallbackSeatIdx != null && Number.isFinite(Number(fallbackSeatIdx)) ? Number(fallbackSeatIdx) : null);
    return {
      uid,
      name: String(raw.name || 'Player').trim() || 'Player',
      avatar: String(raw.avatar || 'av_b1'),
      frame: String(raw.frame || 'none'),
      seatIdx: seatNum,
      joinedAt: Number(raw.joinedAt || raw.lastSeen || 0),
      lastSeen: Number(raw.lastSeen || raw.joinedAt || 0),
      connected: raw.connected !== false
    };
  }

  function normalizeMembersMap(room, nowMs) {
    const now = Number(nowMs || Date.now());
    const map = {};
    const rawMembers = room && room.members && typeof room.members === 'object' ? room.members : {};
    Object.keys(rawMembers).forEach((k) => {
      const entry = normalizeMemberEntry(rawMembers[k], null);
      if (entry) {
        if (!entry.lastSeen) entry.lastSeen = now;
        if (!entry.joinedAt) entry.joinedAt = entry.lastSeen;
        map[entry.uid] = entry;
      }
    });

    const rawSeats = deduplicateSeats(room && room.seats);
    Object.keys(rawSeats)
      .sort((a, b) => Number(a) - Number(b))
      .forEach((seatKey) => {
        const occ = rawSeats[seatKey];
        if (!occ || !occ.uid) return;
        const u = String(occ.uid).trim();
        const seatIdx = Number(seatKey);
        const existing = map[u];
        const joinedAt = Number(occ.joinedAt || (existing && existing.joinedAt) || now);
        const seatSeen = Number(occ.lastSeen || 0);
        const memberSeen = Number((existing && existing.lastSeen) || 0);
        const lastSeen = (seatSeen > 0 || memberSeen > 0)
          ? Math.max(seatSeen, memberSeen)
          : (joinedAt || now);
        map[u] = {
          uid: u,
          name: String(occ.name || (existing && existing.name) || 'Player').trim() || 'Player',
          avatar: String(occ.avatar || (existing && existing.avatar) || 'av_b1'),
          frame: String(occ.frame || (existing && existing.frame) || 'none'),
          seatIdx: Number.isFinite(seatIdx) ? seatIdx : null,
          joinedAt,
          lastSeen,
          connected: existing ? existing.connected !== false : occ.connected !== false
        };
      });

    return map;
  }

  function isMemberActive(member, nowMs, staleMs, roomIsSeed) {
    if (!member || !member.uid) return false;
    if (member.connected === false) return false;
    if (roomIsSeed && isBotOrSeedUid(member.uid)) return true;
    const limit = Number(staleMs || DEFAULT_STALE_MS);
    const seen = Number(member.lastSeen || member.joinedAt || 0);
    if (seen > 0 && Number(nowMs || Date.now()) - seen > limit) return false;
    return true;
  }

  /**
   * Returns active room members strictly sorted by:
   * 1) Lowest occupied seatIndex (0, 1, 2, 3, ..., 8)
   * 2) Unseated listeners ordered by earliest joinedAt
   * 3) Deterministic uid tie-breaker
   */
  function getOrderedActiveMembers(room, nowMs, staleMs) {
    const now = Number(nowMs || Date.now());
    const limit = Number(staleMs || DEFAULT_STALE_MS);
    const roomIsSeed = Boolean(room && (room.isSeed || String(room.id || '').startsWith('pr_seed_')));
    const map = normalizeMembersMap(room, now);
    return Object.values(map)
      .filter((m) => isMemberActive(m, now, limit, roomIsSeed))
      .sort((a, b) => {
        const aSeated = a.seatIdx != null && Number.isFinite(a.seatIdx);
        const bSeated = b.seatIdx != null && Number.isFinite(b.seatIdx);
        if (aSeated && bSeated && a.seatIdx !== b.seatIdx) return a.seatIdx - b.seatIdx;
        if (aSeated !== bSeated) return aSeated ? -1 : 1;
        if (a.joinedAt !== b.joinedAt) return a.joinedAt - b.joinedAt;
        return String(a.uid).localeCompare(String(b.uid));
      });
  }

  /* ===== Strict Owner & Admin (Max 3) Permissions ===== */
  function isPermanentOwnedRoom(room) {
    return Boolean(room && (room.isOwnedRoom || room.isAdvanced));
  }

  function getPermanentOwnerUid(room) {
    if (!room) return '';
    if (isPermanentOwnedRoom(room)) {
      return String(room.ownerUid || room.creatorUid || room.hostUid || '').trim();
    }
    return String(room.activeHostUid || room.hostUid || '').trim();
  }

  function getEffectiveOwnerUid(room) {
    if (!room) return '';
    if (isPermanentOwnedRoom(room)) {
      return getPermanentOwnerUid(room);
    }
    return String(room.activeHostUid || room.hostUid || '').trim();
  }

  function isRoomOwner(room, actorUid) {
    const u = String(actorUid || '').trim();
    if (!room || !u) return false;
    if (isPermanentOwnedRoom(room)) {
      const perm = getPermanentOwnerUid(room);
      return Boolean(perm && perm === u);
    }
    const eff = getEffectiveOwnerUid(room);
    return Boolean(eff && eff === u);
  }

  function getRoomAdmins(room) {
    if (!room || !Array.isArray(room.admins)) return [];
    const owner = getEffectiveOwnerUid(room);
    const permOwner = isPermanentOwnedRoom(room) ? getPermanentOwnerUid(room) : '';
    return [...new Set(room.admins.map((a) => String(a || '').trim()).filter((a) => a && a !== owner && a !== permOwner))]
      .slice(0, MAX_ROOM_ADMINS);
  }

  function isRoomAdminOnly(room, actorUid) {
    const u = String(actorUid || '').trim();
    if (!room || !u || isRoomOwner(room, u)) return false;
    return getRoomAdmins(room).includes(u);
  }

  function getRoomRole(room, actorUid) {
    if (isRoomOwner(room, actorUid)) return 'owner';
    if (isRoomAdminOnly(room, actorUid)) return 'admin';
    return 'member';
  }

  /**
   * Resolves the Room Owner's display identity and live Online/Offline presence
   * so Seat 0 and Room Info can ALWAYS show the Owner's logo/name (online or offline).
   */
  function getRoomOwnerDisplayInfo(room, nowMs, staleMs) {
    const now = Number(nowMs || Date.now());
    const limit = Number(staleMs || DEFAULT_STALE_MS);
    if (!room) {
      return { uid: '', name: 'Owner', avatar: 'av_b1', frame: 'none', online: false, seated: false, seatIdx: null, isOwnedRoom: false };
    }
    const isOwned = isPermanentOwnedRoom(room);
    const ownerUid = getEffectiveOwnerUid(room);
    const activeList = getOrderedActiveMembers(room, now, limit);
    const activeOwner = ownerUid ? activeList.find((m) => m && m.uid === ownerUid) : null;
    const seats = sanitizeRoomSeats(room.seats, ownerUid);
    const seatKey = ownerUid && seats['0'] && seats['0'].uid === ownerUid
      ? '0'
      : null;
    const ownerSeat = seatKey != null ? seats[seatKey] : null;
    const rawMember = ownerUid && room.members && room.members[ownerUid] ? room.members[ownerUid] : null;

    const name = String(
      (ownerSeat && ownerSeat.name) ||
      (activeOwner && activeOwner.name) ||
      (isOwned ? room.ownerName : '') ||
      room.ownerName ||
      room.activeHostName ||
      room.hostName ||
      (rawMember && rawMember.name) ||
      'Owner'
    ).trim() || 'Owner';

    const avatar = String(
      (ownerSeat && ownerSeat.avatar) ||
      (activeOwner && activeOwner.avatar) ||
      room.ownerAvatar ||
      (rawMember && rawMember.avatar) ||
      'av_b1'
    ).trim() || 'av_b1';

    const frame = String(
      (ownerSeat && ownerSeat.frame) ||
      (activeOwner && activeOwner.frame) ||
      room.ownerFrame ||
      (rawMember && rawMember.frame) ||
      'none'
    ).trim() || 'none';

    return {
      uid: ownerUid,
      name,
      avatar,
      frame,
      online: Boolean(activeOwner || ownerSeat),
      seated: Boolean(ownerSeat),
      seatIdx: seatKey != null ? Number(seatKey) : null,
      isOwnedRoom: isOwned
    };
  }

  /**
   * Protects the active room mode (Normal, Acquaint, Auction, Video, Games) and mediaPlayMode
   * against stale snapshots or reaction sync events overwriting a newer local mode change.
   */
  function resolveSafeRoomMode(prevRoom, incomingRoom, nowMs) {
    const now = Number(nowMs || Date.now());
    const validModes = new Set(['normal', 'acquaint', 'auction', 'video', 'games']);
    const incMode = incomingRoom && validModes.has(incomingRoom.mode) ? incomingRoom.mode : 'normal';
    const incMedia = incomingRoom && incomingRoom.mediaPlayMode === 'video'
      ? 'video'
      : (incomingRoom && incomingRoom.mediaPlayMode === 'audio' ? 'audio' : (incMode === 'video' ? 'video' : 'audio'));
    const incTs = Number((incomingRoom && incomingRoom.modeUpdatedAt) || 0);

    if (!prevRoom || typeof prevRoom !== 'object') {
      return { mode: incMode, mediaPlayMode: incMedia, modeUpdatedAt: incTs };
    }
    const prevMode = validModes.has(prevRoom.mode) ? prevRoom.mode : 'normal';
    const prevMedia = prevRoom.mediaPlayMode === 'video'
      ? 'video'
      : (prevRoom.mediaPlayMode === 'audio' ? 'audio' : (prevMode === 'video' ? 'video' : 'audio'));
    const prevTs = Number(prevRoom.modeUpdatedAt || 0);

    if (prevTs > incTs && (now - prevTs) < 20000) {
      return { mode: prevMode, mediaPlayMode: prevMedia, modeUpdatedAt: prevTs };
    }
    return { mode: incMode, mediaPlayMode: incMedia, modeUpdatedAt: Math.max(incTs, prevTs) };
  }

  const OWNER_ONLY_ACTIONS = new Set(['manage_admins', 'edit_owned_room', 'transfer_host']);
  const MODERATOR_ACTIONS = new Set([
    'change_mode',
    'edit_settings',
    'lock_seat',
    'kick_member',
    'mute_member',
    'control_playlist',
    'control_video',
    'rally_followers',
    'manage_mic_order',
    'toggle_boost',
    'toggle_hq'
  ]);

  const ACTION_DENY_LABELS = {
    manage_admins: 'Only the Room Owner can add or remove Admins',
    edit_owned_room: 'Only the Room Owner can edit Owned Room settings',
    transfer_host: 'Only the Room Owner can transfer ownership',
    change_mode: 'Only Room Owner or Admins can change Room Mode',
    edit_settings: 'Only Room Owner or Admins can edit Room Settings',
    lock_seat: 'Only Room Owner or Admins can lock or unlock seats',
    kick_member: 'Only Room Owner or Admins can kick members',
    mute_member: 'Only Room Owner or Admins can mute members',
    control_playlist: 'Only Room Owner or Admins can manage the room playlist',
    control_video: 'Only Room Owner or Admins can control video playback',
    rally_followers: 'Only Room Owner or Admins can send a Rally ping',
    manage_mic_order: 'Only Room Owner or Admins can manage Mic Order',
    toggle_boost: 'Only Room Owner or Admins can activate Room Boost',
    toggle_hq: 'Only Room Owner or Admins can toggle High Quality Mode'
  };

  function getPermissionErrorMessage(action) {
    return ACTION_DENY_LABELS[action] || 'Only Room Owner or Admins can perform this action';
  }

  function canPerformRoomAction(room, actorUid, action) {
    const u = String(actorUid || '').trim();
    if (!room || !u) {
      return { allowed: false, role: 'guest', reason: getPermissionErrorMessage(action) };
    }
    const owner = isRoomOwner(room, u);
    const admin = !owner && isRoomAdminOnly(room, u);
    const role = owner ? 'owner' : (admin ? 'admin' : 'member');

    if (OWNER_ONLY_ACTIONS.has(action)) {
      return owner
        ? { allowed: true, role, reason: '' }
        : { allowed: false, role, reason: getPermissionErrorMessage(action) };
    }
    if (MODERATOR_ACTIONS.has(action)) {
      return (owner || admin)
        ? { allowed: true, role, reason: '' }
        : { allowed: false, role, reason: getPermissionErrorMessage(action) };
    }
    const kicked = Array.isArray(room.kickedUids) && room.kickedUids.includes(u) && !owner;
    if (kicked) {
      return { allowed: false, role, reason: 'You cannot participate in this room' };
    }
    return { allowed: true, role, reason: '' };
  }

  function setRoomAdmin(room, actorUid, targetUid, makeAdmin) {
    const perm = canPerformRoomAction(room, actorUid, 'manage_admins');
    if (!perm.allowed) {
      return { ok: false, error: perm.reason, admins: getRoomAdmins(room) };
    }
    const target = String(targetUid || '').trim();
    if (!target) {
      return { ok: false, error: 'Select a valid member', admins: getRoomAdmins(room) };
    }
    if (isRoomOwner(room, target)) {
      return { ok: false, error: 'Room Owner already has full permissions', admins: getRoomAdmins(room) };
    }
    const current = getRoomAdmins(room);
    if (makeAdmin) {
      if (current.includes(target)) {
        return { ok: true, changed: false, admins: current };
      }
      if (current.length >= MAX_ROOM_ADMINS) {
        return { ok: false, error: `Maximum ${MAX_ROOM_ADMINS} Admins allowed per room`, admins: current };
      }
      return { ok: true, changed: true, admins: [...current, target] };
    }
    if (!current.includes(target)) {
      return { ok: true, changed: false, admins: current };
    }
    return { ok: true, changed: true, admins: current.filter((a) => a !== target) };
  }

  /* ===== 2,000-Coin One-Time Advanced / Owned Room Unlock ===== */
  function createDefaultOwnedRoomState(profile, opts) {
    const o = opts || {};
    const now = Number(o.nowMs || Date.now());
    const ownerUid = String((profile && profile.uid) || o.uid || '').trim();
    const ownerName = String((profile && profile.name) || o.ownerName || 'Owner').trim() || 'Owner';
    const ownerAvatar = String((profile && profile.avatar) || o.ownerAvatar || 'av_b1').trim() || 'av_b1';
    const ownerFrame = String((profile && profile.frame) || o.ownerFrame || 'none').trim() || 'none';
    const fixedId = String(o.fixedId || generateFixedRoomId('owned_' + ownerUid));
    const roomId = String(o.roomId || ('pr_owned_' + ownerUid));
    const tag = ROOM_TAGS.includes(o.tag) ? o.tag : 'Friends';
    const title = String(o.title || `${ownerName}'s Room`).trim().slice(0, 36) || `${ownerName}'s Room`;
    return {
      unlocked: true,
      isOwnedRoom: true,
      isAdvanced: true,
      roomId,
      fixedId,
      ownerUid,
      ownerName,
      ownerAvatar,
      ownerFrame,
      title,
      tag,
      mode: String(o.mode || 'normal'),
      cover: String(o.cover || 'cover_crown'),
      background: String(o.background || 'club'),
      roomTheme: normalizeRoomTheme(o.roomTheme || 'default'),
      password: String(o.password || '').trim().slice(0, 20),
      admins: [],
      followers: [],
      guards: [],
      micOrder: [],
      lockedSeats: [],
      roomXp: 0,
      boostedUntil: 0,
      hqAudio: true,
      lastRallyAt: 0,
      purchasedAt: now,
      updatedAt: now
    };
  }

  function unlockAdvancedRoomPurchase(profile, opts) {
    if (!profile || typeof profile !== 'object') {
      return { ok: false, error: 'Profile not ready' };
    }
    const o = opts || {};
    const now = Number(o.nowMs || Date.now());
    const curCoins = Math.max(0, Math.trunc(Number(profile.coins || 0)));

    if (profile.ownedRoom && profile.ownedRoom.unlocked) {
      return {
        ok: true,
        alreadyUnlocked: true,
        cost: 0,
        remainingCoins: curCoins,
        ownedRoom: { ...profile.ownedRoom }
      };
    }

    if (curCoins < ADVANCED_ROOM_COST) {
      return {
        ok: false,
        alreadyUnlocked: false,
        cost: ADVANCED_ROOM_COST,
        remainingCoins: curCoins,
        missingCoins: ADVANCED_ROOM_COST - curCoins,
        error: `Need ${ADVANCED_ROOM_COST.toLocaleString()} coins to unlock Advanced Room (you need ${(ADVANCED_ROOM_COST - curCoins).toLocaleString()} more)`
      };
    }

    const ownedRoom = createDefaultOwnedRoomState(profile, { ...o, nowMs: now });
    return {
      ok: true,
      alreadyUnlocked: false,
      cost: ADVANCED_ROOM_COST,
      remainingCoins: curCoins - ADVANCED_ROOM_COST,
      ownedRoom
    };
  }

  /* ===== Advanced Room Perks Helpers ===== */
  function computeRoomLevel(xpRaw) {
    const xp = Math.max(0, Math.floor(Number(xpRaw || 0)));
    let level = 1;
    let remaining = xp;
    let needed = 100;
    while (remaining >= needed && level < 50) {
      remaining -= needed;
      level += 1;
      needed = 100 + (level - 1) * 60;
    }
    const progressPct = Math.max(0, Math.min(100, Math.round((remaining / needed) * 100)));
    const tierName = level >= 15 ? 'Royal Legend' : (level >= 10 ? 'Diamond Hall' : (level >= 5 ? 'Star Lounge' : (level >= 2 ? 'Rising Club' : 'Starter Stage')));
    return { level, xp, levelXp: remaining, nextLevelXp: needed, progressPct, tierName };
  }

  function getRoomBackgroundById(bgId) {
    const id = String(bgId || '').trim();
    return ROOM_BACKGROUNDS.find((b) => b.id === id) || ROOM_BACKGROUNDS[0];
  }

  function sanitizeCustomBackgroundUrl(rawUrl) {
    const s = String(rawUrl || '').trim();
    if (!s || s.length > 260000) return '';
    if (/[\r\n"<>()\\]/.test(s)) return '';
    if (/^https:\/\/[^\s]+$/i.test(s)) return s;
    if (/^data:image\/(png|jpeg|jpg|webp|gif);base64,[A-Za-z0-9+/=]+$/i.test(s)) return s;
    return '';
  }

  function normalizeRoomRulesText(raw) {
    const s = String(raw == null ? '' : raw).replace(/\s+/g, ' ').trim();
    return s ? s.slice(0, 280) : DEFAULT_ROOM_RULES;
  }

  function canSelectRoomBackground(room, bgId) {
    const bg = getRoomBackgroundById(bgId);
    const lv = computeRoomLevel(room && room.roomXp);
    const isOwned = isPermanentOwnedRoom(room);
    if (isOwned && bg.ownedUnlock) {
      return { allowed: true, reason: '', minLevel: bg.minLevel, unlockedByOwned: lv.level < bg.minLevel };
    }
    if (lv.level >= bg.minLevel) {
      return { allowed: true, reason: '', minLevel: bg.minLevel, unlockedByOwned: false };
    }
    return {
      allowed: false,
      reason: `Reach Room Lv.${bg.minLevel} or unlock Advanced Room to use ${bg.name}`,
      minLevel: bg.minLevel,
      unlockedByOwned: false
    };
  }

  function resolveRoomBackdropCss(room, themeOverride) {
    const theme = normalizeRoomTheme(themeOverride || (room && room.roomTheme) || 'default');
    const bgId = room && room.background ? String(room.background) : 'club';
    const bg = getRoomBackgroundById(bgId);
    if (bg.id === 'custom') {
      const safeUrl = sanitizeCustomBackgroundUrl(room && room.customBackgroundUrl);
      if (safeUrl) {
        const scrim = theme === 'light'
          ? 'linear-gradient(180deg, rgba(226, 236, 252, .68) 0%, rgba(235, 242, 254, .60) 48%, rgba(220, 232, 250, .78) 100%)'
          : 'linear-gradient(180deg, rgba(11, 16, 30, .64) 0%, rgba(15, 23, 42, .56) 48%, rgba(10, 14, 26, .78) 100%)';
        return `${scrim}, url("${safeUrl}") center / cover no-repeat`;
      }
    }
    if (theme === 'light') {
      return bg.lightCss || 'radial-gradient(ellipse 88% 46% at 50% -4%, rgba(56, 189, 248, .28), transparent 60%), linear-gradient(172deg, #d8e9fc 0%, #e5effd 50%, #dce6f8 100%)';
    }
    if (theme === 'dark') {
      return `radial-gradient(ellipse 84% 42% at 50% -6%, ${bg.accent || '#6366f1'}28, transparent 60%), linear-gradient(172deg, #090e1a 0%, #101829 52%, #080c15 100%)`;
    }
    if (theme === 'gradient') {
      return 'radial-gradient(ellipse 90% 48% at 16% 6%, rgba(192, 132, 252, .34), transparent 58%), radial-gradient(ellipse 82% 52% at 86% 24%, rgba(56, 189, 248, .3), transparent 56%), radial-gradient(circle at 50% 90%, rgba(244, 114, 182, .22), transparent 54%), linear-gradient(155deg, #1d1b4b 0%, #37236b 46%, #133b63 100%)';
    }
    return bg.css;
  }

  function getRoomLevelSummary(room) {
    const lv = computeRoomLevel(room && room.roomXp);
    const isOwned = isPermanentOwnedRoom(room);
    const perks = ROOM_LEVEL_PERKS_TABLE.map((row) => ({
      ...row,
      unlocked: lv.level >= row.level || (isOwned && row.level <= 5),
      unlockedByOwned: isOwned && lv.level < row.level
    }));
    const currentRow = perks.filter((p) => p.unlocked).slice(-1)[0] || perks[0];
    const maxAdmins = isOwned ? MAX_ROOM_ADMINS : Math.min(MAX_ROOM_ADMINS, currentRow ? currentRow.maxAdmins : 1);
    const unlockedBackgrounds = ROOM_BACKGROUNDS.filter((b) => canSelectRoomBackground(room, b.id).allowed).map((b) => b.id);
    return {
      ...lv,
      isOwnedRoom: isOwned,
      maxAdmins,
      unlockedBackgrounds,
      perks
    };
  }

  function toggleRoomFollower(room, userUid, userName) {
    const u = String(userUid || '').trim();
    if (!room || !u) return { ok: false, following: false, followers: [] };
    const list = Array.isArray(room.followers) ? room.followers.filter((f) => f && f.uid) : [];
    const exists = list.some((f) => f.uid === u);
    const next = exists
      ? list.filter((f) => f.uid !== u)
      : [...list, { uid: u, name: String(userName || 'Player').trim() || 'Player', ts: Date.now() }].slice(-200);
    return { ok: true, following: !exists, followers: next, xpDelta: exists ? 0 : 15 };
  }

  function toggleRoomGuard(room, userUid, userName) {
    const u = String(userUid || '').trim();
    if (!room || !u) return { ok: false, isGuard: false, guards: [] };
    const list = Array.isArray(room.guards) ? room.guards.filter((g) => g && g.uid) : [];
    const exists = list.some((g) => g.uid === u);
    const next = exists
      ? list.filter((g) => g.uid !== u)
      : [...list, { uid: u, name: String(userName || 'Player').trim() || 'Player', tier: 'Guardian', ts: Date.now() }].slice(-50);
    return { ok: true, isGuard: !exists, guards: next, xpDelta: exists ? 0 : 25 };
  }

  function updateMicOrderQueue(room, action, targetUid, actorUid, targetName) {
    const cur = Array.isArray(room && room.micOrder) ? room.micOrder.filter((x) => x && x.uid) : [];
    const tUid = String(targetUid || '').trim();
    const aUid = String(actorUid || '').trim();
    if (action === 'request') {
      if (!tUid) return { ok: false, error: 'Invalid user', micOrder: cur };
      if (cur.some((x) => x.uid === tUid)) return { ok: true, changed: false, micOrder: cur };
      return {
        ok: true,
        changed: true,
        micOrder: [...cur, { uid: tUid, name: String(targetName || 'Player').trim() || 'Player', ts: Date.now() }].slice(-20)
      };
    }
    if (action === 'cancel') {
      if (tUid !== aUid && !canPerformRoomAction(room, aUid, 'manage_mic_order').allowed) {
        return { ok: false, error: getPermissionErrorMessage('manage_mic_order'), micOrder: cur };
      }
      return { ok: true, changed: cur.some((x) => x.uid === tUid), micOrder: cur.filter((x) => x.uid !== tUid) };
    }
    const perm = canPerformRoomAction(room, aUid, 'manage_mic_order');
    if (!perm.allowed) {
      return { ok: false, error: perm.reason, micOrder: cur };
    }
    if (action === 'clear') {
      return { ok: true, changed: cur.length > 0, micOrder: [] };
    }
    if (action === 'grant' || action === 'remove') {
      return { ok: true, changed: cur.some((x) => x.uid === tUid), micOrder: cur.filter((x) => x.uid !== tUid) };
    }
    return { ok: false, error: 'Unknown mic order action', micOrder: cur };
  }

  /* ===== Lobby Filtering & Sorting ===== */
  function matchesLobbyCategory(room, category) {
    const cat = String(category || 'All').trim();
    if (!cat || cat === 'All') return true;
    const tag = String((room && room.tag) || '').trim().toLowerCase();
    const mode = String((room && room.mode) || 'normal').trim().toLowerCase();
    if (cat === 'Video') return mode === 'video' || tag === 'video' || tag === 'watch';
    if (cat === 'Game') return mode === 'games' || tag === 'game' || tag === 'games' || tag === 'gaming';
    if (cat === 'Music') return tag === 'music' || Boolean(room && room.musicPlaying);
    if (cat === 'Friends') return tag === 'friends' || tag === 'acquaint' || mode === 'acquaint';
    if (cat === 'Chats') return tag === 'chats' || tag === 'chat' || tag === 'chill' || tag === 'study' || tag === 'voice';
    return tag === cat.toLowerCase();
  }

  /**
   * Filters rooms for the public Room Lobby:
   * - Excludes closed, idle, expired, and 0-active-member empty rooms
   * - Filters by category tab (All, Friends, Music, Video, Game, Chats)
   * - Sorts active Rec Card / Boosted rooms first, then Owned Rooms, then live member count
   */
  function filterLobbyRooms(rooms, category, nowMs) {
    const now = Number(nowMs || Date.now());
    const list = Array.isArray(rooms) ? rooms : [];
    return list
      .filter((rm) => {
        if (!rm || !rm.id) return false;
        if (rm.status === 'closed' || rm.status === 'idle') return false;
        if (rm.expiresAt && Number(rm.expiresAt) <= now) return false;
        const activeMembers = getOrderedActiveMembers(rm, now, DEFAULT_STALE_MS);
        if (activeMembers.length === 0) return false;
        return matchesLobbyCategory(rm, category);
      })
      .sort((a, b) => {
        const aBoost = Number(a.boostedUntil || 0) > now ? 1 : 0;
        const bBoost = Number(b.boostedUntil || 0) > now ? 1 : 0;
        if (aBoost !== bBoost) return bBoost - aBoost;
        const aOwned = a.isOwnedRoom ? 1 : 0;
        const bOwned = b.isOwnedRoom ? 1 : 0;
        if (aOwned !== bOwned) return bOwned - aOwned;
        const aCnt = getOrderedActiveMembers(a, now, DEFAULT_STALE_MS).length;
        const bCnt = getOrderedActiveMembers(b, now, DEFAULT_STALE_MS).length;
        if (aCnt !== bCnt) return bCnt - aCnt;
        return Number(b.updatedAt || b.createdAt || 0) - Number(a.updatedAt || a.createdAt || 0);
      });
  }

  /**
   * Pure room lifecycle reconciler:
   * - Evicts leavingUid and any timed-out / disconnected ghost seats
   * - Strictly deduplicates seats so zero duplicate/clone seats ever exist
   * - Transfers hostUid/hostName to the next lowest-seat active player if current owner left/offline
   * - Promotes the new owner to Seat 0 (Owner Stage) if Seat 0 is vacant
   * - Auto-closes temporary rooms (`status = 'closed'`) when zero active players remain
   * - Transitions permanent Owned Rooms to `status = 'idle'` when empty (hidden from live lobby, permanent on owner's profile)
   */
  function reconcileRoomLifecycle(room, opts) {
    if (!room || typeof room !== 'object') {
      return { changed: false, closed: true, idle: false, hostTransferred: false, newHost: null, removedUids: [], room: null };
    }
    const o = opts || {};
    const now = Number(o.nowMs || Date.now());
    const staleMs = Number(o.staleMs || DEFAULT_STALE_MS);
    const leavingUid = o.leavingUid ? String(o.leavingUid).trim() : '';
    const isSeedRoom = Boolean(room.isSeed || String(room.id || '').startsWith('pr_seed_'));
    const isOwnedRoom = Boolean(room.isOwnedRoom || room.isAdvanced);

    const membersMap = normalizeMembersMap(room, now);
    const removedUids = [];
    const nextSeats = {};
    const nextMembers = {};

    Object.values(membersMap).forEach((m) => {
      if (leavingUid && m.uid === leavingUid) {
        removedUids.push(m.uid);
        return;
      }
      if (!isMemberActive(m, now, staleMs, isSeedRoom)) {
        removedUids.push(m.uid);
        return;
      }
      nextMembers[m.uid] = { ...m };
    });

    const dedupedRawSeats = deduplicateSeats(room.seats);
    Object.keys(dedupedRawSeats)
      .sort((a, b) => Number(a) - Number(b))
      .forEach((seatKey) => {
        const occ = dedupedRawSeats[seatKey];
        if (!occ || !occ.uid) return;
        const u = String(occ.uid).trim();
        if (!nextMembers[u]) return;
        nextSeats[seatKey] = {
          ...occ,
          uid: u,
          lastSeen: nextMembers[u].lastSeen,
          connected: true
        };
        nextMembers[u].seatIdx = Number(seatKey);
      });

    const activeOrdered = Object.values(nextMembers).sort((a, b) => {
      const aSeated = a.seatIdx != null && Number.isFinite(a.seatIdx);
      const bSeated = b.seatIdx != null && Number.isFinite(b.seatIdx);
      if (aSeated && bSeated && a.seatIdx !== b.seatIdx) return a.seatIdx - b.seatIdx;
      if (aSeated !== bSeated) return aSeated ? -1 : 1;
      if (a.joinedAt !== b.joinedAt) return a.joinedAt - b.joinedAt;
      return String(a.uid).localeCompare(String(b.uid));
    });

    const permOwnerUid = isOwnedRoom ? getPermanentOwnerUid(room) : '';
    const permOwnerName = isOwnedRoom
      ? (String(room.ownerName || (room.members && permOwnerUid && room.members[permOwnerUid] && room.members[permOwnerUid].name) || room.hostName || 'Owner').trim() || 'Owner')
      : '';
    const permOwnerAvatar = isOwnedRoom
      ? (String(room.ownerAvatar || (room.members && permOwnerUid && room.members[permOwnerUid] && room.members[permOwnerUid].avatar) || (room.seats && room.seats['0'] && room.seats['0'].uid === permOwnerUid && room.seats['0'].avatar) || 'av_b1').trim() || 'av_b1')
      : String(room.ownerAvatar || '');
    const permOwnerFrame = isOwnedRoom
      ? (String(room.ownerFrame || (room.members && permOwnerUid && room.members[permOwnerUid] && room.members[permOwnerUid].frame) || 'none').trim() || 'none')
      : String(room.ownerFrame || '');

    const preservedAdmins = isOwnedRoom
      ? getRoomAdmins({ ...room, ownerUid: permOwnerUid })
      : getRoomAdmins(room).filter((a) => Boolean(nextMembers[a]));

    let repairedOwnerLock = false;
    const effectiveOwnerForSeats = isOwnedRoom ? permOwnerUid : getEffectiveOwnerUid(room);
    const rawSeatBefore = deduplicateSeats(nextSeats);
    const cleanedSeats = sanitizeRoomSeats(rawSeatBefore, effectiveOwnerForSeats);

    // Detect if owner seat lock or duplicate owner seat repair occurred
    if (effectiveOwnerForSeats) {
      const hadStrayOwner = Object.keys(rawSeatBefore).some((k) => k !== '0' && rawSeatBefore[k] && rawSeatBefore[k].uid === effectiveOwnerForSeats);
      const hadNonOwnerSeat0 = Boolean(rawSeatBefore['0'] && rawSeatBefore['0'].uid !== effectiveOwnerForSeats);
      if (hadStrayOwner || hadNonOwnerSeat0) {
        repairedOwnerLock = true;
      }
    }

    // Re-sync every member's seatIdx strictly from sanitized seats so nobody has stale/duplicate seatIdx
    Object.keys(nextMembers).forEach((u) => {
      nextMembers[u].seatIdx = null;
    });
    Object.keys(cleanedSeats).forEach((seatKey) => {
      const occ = cleanedSeats[seatKey];
      if (occ && occ.uid && nextMembers[occ.uid]) {
        nextMembers[occ.uid].seatIdx = Number(seatKey);
      }
    });

    const nextRoom = {
      ...room,
      creatorUid: String(room.creatorUid || permOwnerUid || room.hostUid || '').trim(),
      ownerUid: isOwnedRoom ? permOwnerUid : String(room.ownerUid || '').trim(),
      ownerName: isOwnedRoom ? permOwnerName : String(room.ownerName || ''),
      ownerAvatar: permOwnerAvatar,
      ownerFrame: permOwnerFrame,
      seats: cleanedSeats,
      members: nextMembers,
      admins: preservedAdmins,
      chat: Array.isArray(room.chat) ? [...room.chat] : []
    };

    if (isOwnedRoom && permOwnerUid) {
      if (nextRoom.hostUid !== permOwnerUid || nextRoom.activeHostUid !== permOwnerUid) {
        repairedOwnerLock = true;
      }
      nextRoom.hostUid = permOwnerUid;
      nextRoom.activeHostUid = permOwnerUid;
      nextRoom.hostName = permOwnerName;
      nextRoom.activeHostName = permOwnerName;
    }

    // Empty room -> clear temporary playlist; Owned Rooms go idle (stay on owner profile), Temporary Rooms auto-close
    if (activeOrdered.length === 0 && !isSeedRoom) {
      nextRoom.status = isOwnedRoom ? 'idle' : 'closed';
      if (!isOwnedRoom) {
        nextRoom.closedAt = now;
        nextRoom.expiresAt = now;
      } else if (permOwnerUid) {
        nextRoom.hostUid = permOwnerUid;
        nextRoom.activeHostUid = permOwnerUid;
        nextRoom.hostName = permOwnerName;
        nextRoom.activeHostName = permOwnerName;
      }
      nextRoom.updatedAt = now;
      nextRoom.queue = [];
      nextRoom.queueIndex = -1;
      nextRoom.musicQueue = [];
      nextRoom.musicQueueIndex = -1;
      nextRoom.musicTrackId = '';
      nextRoom.musicUrl = '';
      nextRoom.musicTitle = '';
      nextRoom.musicArtist = '';
      nextRoom.musicLanguage = '';
      nextRoom.musicIsFallback = false;
      nextRoom.musicPlaying = false;
      nextRoom.youtubeId = '';
      nextRoom.videoTitle = '';
      nextRoom.videoSync = {
        kind: 'youtube',
        videoId: '',
        videoUrl: '',
        searchQuery: '',
        playing: false,
        seekSec: 0,
        durationSec: 0,
        playbackRate: 1,
        updatedAt: now,
        updatedBy: '',
        seq: 0
      };
      return {
        changed: true,
        closed: !isOwnedRoom,
        idle: isOwnedRoom,
        hostTransferred: false,
        newHost: null,
        removedUids,
        room: nextRoom
      };
    }

    let hostTransferred = false;
    let newHost = null;

    // Permanent Owned Rooms NEVER transfer Owner tag/seat to Admins or other members,
    // even when the permanent owner goes offline. Only temporary Free Normal Rooms transfer host.
    if (!isOwnedRoom) {
      const prevHostUid = String(room.activeHostUid || room.hostUid || '').trim();
      const prevHostName = String(room.activeHostName || room.hostName || '').trim();
      const hostStillActive = Boolean(prevHostUid && nextMembers[prevHostUid]);

      if (!hostStillActive && activeOrdered.length > 0) {
        const candidate = activeOrdered[0];
        hostTransferred = true;
        newHost = candidate;
        nextRoom.hostUid = candidate.uid;
        nextRoom.hostName = candidate.name;
        nextRoom.activeHostUid = candidate.uid;
        nextRoom.activeHostName = candidate.name;
        nextRoom.admins = nextRoom.admins.filter((a) => a !== candidate.uid);

        // Promote new host into Seat 0 (Owner Stage & Mic #1) if Seat 0 is empty
        if (!nextRoom.seats['0']) {
          const oldSeatKey = Object.keys(nextRoom.seats).find((k) => nextRoom.seats[k] && nextRoom.seats[k].uid === candidate.uid);
          const existingOcc = oldSeatKey != null ? nextRoom.seats[oldSeatKey] : null;
          if (oldSeatKey != null) delete nextRoom.seats[oldSeatKey];
          nextRoom.seats['0'] = {
            uid: candidate.uid,
            name: candidate.name,
            avatar: candidate.avatar || (existingOcc && existingOcc.avatar) || 'av_b1',
            frame: candidate.frame || (existingOcc && existingOcc.frame) || 'none',
            muted: existingOcc ? Boolean(existingOcc.muted) : false,
            speaking: existingOcc ? !existingOcc.muted : true,
            joinedAt: candidate.joinedAt || now,
            lastSeen: now,
            connected: true
          };
          nextRoom.seats = deduplicateSeats(nextRoom.seats);
          nextRoom.members[candidate.uid].seatIdx = 0;
        }

        const prevLabel = prevHostName ? `${prevHostName} left — ` : '';
        nextRoom.chat = [
          ...nextRoom.chat,
          {
            id: 'host_' + now.toString(36) + '_' + candidate.uid.slice(0, 6),
            type: 'sys',
            text: `👑 ${prevLabel}${candidate.name} is now the Room Owner!`,
            ts: now
          }
        ].slice(-45);
      }
    }

    const changed = removedUids.length > 0 || hostTransferred || repairedOwnerLock || nextRoom.status === 'closed';
    if (changed) nextRoom.updatedAt = now;

    return {
      changed,
      closed: nextRoom.status === 'closed',
      idle: nextRoom.status === 'idle',
      hostTransferred,
      newHost,
      removedUids,
      room: nextRoom
    };
  }

  /**
   * Pure YouTube Ad / Buffering / Drift detector for Watch-Together VR rooms.
   */
  function detectYouTubeAdOrBuffer(params) {
    const p = params || {};
    const playerState = Number(p.playerState);
    const curVid = String(p.currentVideoId || '').trim();
    const expVid = String(p.expectedVideoId || '').trim();
    const localSec = Number(p.localSec || 0);
    const localDur = Number(p.localDur || 0);
    const expectedDur = Number(p.expectedDur || 0);
    const targetSec = Number(p.targetSec || 0);
    const seekFailedRecently = Boolean(p.seekFailedRecently);
    const driftSec = Math.round((targetSec - localSec) * 10) / 10;

    const videoIdMismatch = Boolean(curVid && expVid && curVid !== expVid);
    const shortAdDuration = Boolean(expectedDur > 45 && localDur > 0 && localDur <= 35 && Math.abs(localDur - expectedDur) > 20);
    const pinnedByAd = Boolean(seekFailedRecently && playerState === 1 && targetSec > 15 && localDur > 0 && localDur <= 65 && Math.abs(driftSec) > 6);

    if (videoIdMismatch || shortAdDuration || pinnedByAd) {
      return {
        status: 'ad',
        inAd: true,
        isBuffering: false,
        needsSnapAfterAd: true,
        driftSec
      };
    }

    if (playerState === 3) {
      return {
        status: 'buffering',
        inAd: false,
        isBuffering: true,
        needsSnapAfterAd: false,
        driftSec
      };
    }

    if (Math.abs(driftSec) > 2.2) {
      return {
        status: 'behind',
        inAd: false,
        isBuffering: false,
        needsSnapAfterAd: false,
        driftSec
      };
    }

    return {
      status: 'synced',
      inAd: false,
      isBuffering: false,
      needsSnapAfterAd: false,
      driftSec
    };
  }

  function summarizeViewerSyncIssues(viewerStates, myUid, nowMs, staleMs) {
    const now = Number(nowMs || Date.now());
    const limit = Number(staleMs || 18000);
    const map = viewerStates && typeof viewerStates === 'object' ? viewerStates : {};
    const inAd = [];
    const buffering = [];
    Object.values(map).forEach((entry) => {
      if (!entry || !entry.uid) return;
      if (now - Number(entry.ts || 0) > limit) return;
      const label = entry.uid === myUid ? 'You' : (entry.name || 'Viewer');
      if (entry.status === 'ad') inAd.push({ uid: entry.uid, name: label });
      else if (entry.status === 'buffering') buffering.push({ uid: entry.uid, name: label });
    });
    return { inAd, buffering, hasIssues: inAd.length > 0 || buffering.length > 0 };
  }

  function mergeRoomChatMessages(sources, deletedIds, maxCount) {
    const delSet = new Set(Array.isArray(deletedIds) ? deletedIds : []);
    const byId = new Map();
    (Array.isArray(sources) ? sources : []).forEach((list) => {
      if (!Array.isArray(list)) return;
      list.forEach((m) => {
        if (!m || !m.id || delSet.has(m.id)) return;
        if (m.type === 'reaction') return;
        const prev = byId.get(m.id);
        if (!prev || Number(m.ts || 0) >= Number(prev.ts || 0)) {
          byId.set(m.id, m);
        }
      });
    });
    const sorted = Array.from(byId.values()).sort((a, b) => Number(a.ts || 0) - Number(b.ts || 0));
    const cap = Number(maxCount || 45);
    return sorted.slice(-cap);
  }

  function mergeRoomReactions(sources, maxCount) {
    const byId = new Map();
    (Array.isArray(sources) ? sources : []).forEach((list) => {
      if (!Array.isArray(list)) return;
      list.forEach((r) => {
        if (!r || !r.id || !r.emoji) return;
        if (!byId.has(r.id)) byId.set(r.id, r);
      });
    });
    const sorted = Array.from(byId.values()).sort((a, b) => Number(a.ts || 0) - Number(b.ts || 0));
    const cap = Number(maxCount || 24);
    return sorted.slice(-cap);
  }

  function shouldBlockGameLaunchForVr(params) {
    const p = params || {};
    if (p.bypassVrGuard) return false;
    return Boolean(p.activePartyRoomId || p.minimizedPartyRoomId);
  }

  const api = {
    DEFAULT_STALE_MS,
    ADVANCED_ROOM_COST,
    MAX_ROOM_ADMINS,
    LOBBY_CATEGORIES,
    ROOM_TAGS,
    DEFAULT_ROOM_RULES,
    ROOM_THEMES,
    ROOM_BACKGROUNDS,
    ROOM_LEVEL_PERKS_TABLE,
    ADVANCED_ROOM_PERKS,
    normalizeRoomTheme,
    isBotOrSeedUid,
    generateFixedRoomId,
    deduplicateSeats,
    sanitizeRoomSeats,
    canUserTakeSeat,
    normalizeMembersMap,
    getOrderedActiveMembers,
    isPermanentOwnedRoom,
    getEffectiveOwnerUid,
    getPermanentOwnerUid,
    isRoomOwner,
    getRoomAdmins,
    isRoomAdminOnly,
    getRoomRole,
    getRoomOwnerDisplayInfo,
    resolveSafeRoomMode,
    getPermissionErrorMessage,
    canPerformRoomAction,
    setRoomAdmin,
    createDefaultOwnedRoomState,
    unlockAdvancedRoomPurchase,
    computeRoomLevel,
    getRoomBackgroundById,
    sanitizeCustomBackgroundUrl,
    normalizeRoomRulesText,
    canSelectRoomBackground,
    resolveRoomBackdropCss,
    getRoomLevelSummary,
    toggleRoomFollower,
    toggleRoomGuard,
    updateMicOrderQueue,
    matchesLobbyCategory,
    filterLobbyRooms,
    reconcileRoomLifecycle,
    detectYouTubeAdOrBuffer,
    summarizeViewerSyncIssues,
    mergeRoomChatMessages,
    mergeRoomReactions,
    shouldBlockGameLaunchForVr
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  if (global) {
    global.PartyRoomRules = api;
  }
})(typeof window !== 'undefined' ? window : globalThis);
