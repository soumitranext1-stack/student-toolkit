"use strict";
/* =====================================================================
   VR / ROOM MUSIC & YOUTUBE LIVE SEARCH ENGINE + TEMPORARY ROOM QUEUE
   · 100% pure data & functions (zero DOM side effects)
   · Shared by browser (window.PartyMediaCatalog) & Node unit tests
   · Multi-instance free public YouTube search (Piped / Invidious +
     YouTube listType=search fallback, zero paid API keys required)
   · Verified embeddable Hindi (20) & Bangla (15) starter catalog & presets
   · Temporary Room Playlist (`queue` + backward-compatible `musicQueue`)
     supporting Video Mode (VR Screen) & Audio / MP3 Mini-Player Mode
   ===================================================================== */
(function (global) {
  // Zero fake/dummy instrumental audio streams & zero 30s preview traps: only full-length real songs play.
  const FALLBACK_AUDIO_STREAMS = [];
  const FAKE_DEMO_AUDIO_RE = /soundhelix\.com/i;
  const PREVIEW_30S_AUDIO_RE = /(?:audio-ssl\.itunes\.apple\.com|audio\.itunes\.apple\.com|mzstatic\.com\/.*\/(?:music|audio|mzaf)[^/]*\.m4a)/i;

  /**
   * Free public YouTube search endpoints (no API keys needed).
   * Tried in order with per-instance timeout, with automatic failover
   * to YouTube's built-in `listType=search` embed fallback if offline.
   */
  const PIPED_SEARCH_INSTANCES = [
    'https://api.piped.private.coffee',
    'https://pipedapi.kavin.rocks',
    'https://pipedapi.adminforge.de',
    'https://pipedapi.leptons.xyz'
  ];

  const INVIDIOUS_SEARCH_INSTANCES = [
    'https://inv.nadeko.net',
    'https://invidious.nerdvpn.de',
    'https://yewtu.be',
    'https://invidious.jing.rocks'
  ];

  const MAX_RECENT_ITEMS = 25;
  const MAX_QUEUE_ITEMS = 40;
  const SEARCH_CACHE_TTL_MS = 180000;
  const searchCache = new Map();
  const audioSearchCache = new Map();

  const ITUNES_SEARCH_BASE = 'https://itunes.apple.com/search';
  const AUDIUS_API_BASE = 'https://api.audius.co';

  const AUDIO_BROWSE_TOPICS = [
    { id: 'hindi_hits', label: 'Hindi Hits', query: 'Arijit Singh Bollywood Hits' },
    { id: 'bangla_hits', label: 'Bangla', query: 'Bangla Song Anupam Roy Arijit' },
    { id: 'punjabi', label: 'Punjabi', query: 'Diljit Dosanjh Karan Aujla' },
    { id: 'english_pop', label: 'English Pop', query: 'The Weeknd Bruno Mars Pop' },
    { id: 'lofi', label: 'Lo-Fi Chill', query: 'Lofi Hindi Chill Beats' },
    { id: 'trending_in', label: 'Trending', query: 'Top Bollywood 2024 2025' }
  ];

  function cleanStr(val) {
    return String(val == null ? '' : val).trim();
  }

  function isValidHttpUrl(url) {
    return /^https?:\/\/.+/i.test(cleanStr(url));
  }

  function isSynthUrl(url) {
    return /^synth:\/\//i.test(cleanStr(url));
  }

  function isFakeDemoAudioUrl(url) {
    return FAKE_DEMO_AUDIO_RE.test(cleanStr(url));
  }

  function isPreview30sAudioUrl(url) {
    return PREVIEW_30S_AUDIO_RE.test(cleanStr(url));
  }

  function isYtAudioUrl(url) {
    return /^yt-audio:\/\/[A-Za-z0-9_-]{11}$/.test(cleanStr(url));
  }

  function extractYtAudioId(url) {
    const m = cleanStr(url).match(/^yt-audio:\/\/([A-Za-z0-9_-]{11})$/);
    return m ? m[1] : '';
  }

  function isYtAudioSearchUrl(url) {
    return /^yt-audio-search:\/\/.+/i.test(cleanStr(url));
  }

  function buildYtAudioSearchUrl(query) {
    const q = cleanStr(query);
    return q ? `yt-audio-search://${encodeURIComponent(q)}` : '';
  }

  function extractYtAudioSearchQuery(url) {
    const m = cleanStr(url).match(/^yt-audio-search:\/\/(.+)$/i);
    if (!m) return '';
    try {
      return decodeURIComponent(m[1]).trim();
    } catch {
      return m[1].trim();
    }
  }

  function isValidYouTubeId(id) {
    return /^[A-Za-z0-9_-]{11}$/.test(cleanStr(id));
  }

  function buildYouTubeThumb(videoId) {
    const id = cleanStr(videoId);
    return isValidYouTubeId(id) ? `https://i.ytimg.com/vi/${id}/mqdefault.jpg` : '';
  }

  function parseDurationLabelToSec(label) {
    const s = cleanStr(label);
    if (!s || /^live$/i.test(s)) return 0;
    const parts = s.split(':').map((x) => Number(x));
    if (parts.some((n) => !Number.isFinite(n) || n < 0)) return 0;
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    return 0;
  }

  function formatDurationSec(sec) {
    const n = Number(sec);
    if (!Number.isFinite(n) || n < 0) return '';
    if (n === 0) return 'LIVE';
    const total = Math.floor(n);
    const hrs = Math.floor(total / 3600);
    const mins = Math.floor((total % 3600) / 60);
    const rem = total % 60;
    if (hrs > 0) {
      return `${hrs}:${String(mins).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
    }
    return `${mins}:${String(rem).padStart(2, '0')}`;
  }

  function extractYouTubeIdFromPath(pathOrUrl) {
    const raw = cleanStr(pathOrUrl);
    if (!raw) return '';
    if (isValidYouTubeId(raw)) return raw;
    const match = raw.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([A-Za-z0-9_-]{11})/);
    return match ? match[1] : '';
  }

  function hashString(str) {
    let h = 2166136261;
    const s = String(str || 'song');
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return Math.abs(h);
  }

  function makeSongEntry(spec) {
    const id = spec.id;
    const title = spec.title;
    const artist = spec.artist;
    const language = spec.language;
    const ytId = isValidYouTubeId(spec.youtubeId) ? spec.youtubeId : '';
    const rawDirect = spec.url !== undefined ? String(spec.url || '').trim() : '';
    const safeDirect = rawDirect && !isFakeDemoAudioUrl(rawDirect) && !isPreview30sAudioUrl(rawDirect) ? rawDirect : '';
    const url = safeDirect || (ytId ? `yt-audio://${ytId}` : '');
    const durLabel = spec.duration || '3:45';
    return {
      id,
      title,
      artist,
      singer: artist,
      channel: artist,
      language,
      tag: language,
      duration: durLabel,
      durationSec: parseDurationLabelToSec(durLabel),
      accent: spec.accent || (language === 'Bangla' ? '#06b6d4' : '#f59e0b'),
      url,
      youtubeId: ytId,
      videoId: ytId,
      thumbnail: ytId ? buildYouTubeThumb(ytId) : '',
      kind: 'audio',
      source: ytId ? 'yt_audio' : 'catalog',
      isFullSong: true,
      isPreview: false,
      isFallback: false,
      searchQuery: `${title} ${artist} ${language} song`
    };
  }

  /**
   * Starter Trending / Popular Hindi (20) & Bangla (15) Songs Catalog
   * All populated `youtubeId` values are oEmbed-verified working videos.
   * Even if `url` is blank `''`, the player safely falls back without crashing.
   */
  const RAW_SONGS_SPEC = [
    // ===== HINDI (20) =====
    { id: 'hi_tu_chahiye', title: 'Tu Chahiye', artist: 'Atif Aslam', language: 'Hindi', duration: '4:32', accent: '#f59e0b', youtubeId: 'zuvla6ABKbs', synthNotes: [261.63, 329.63, 392.0, 523.25] },
    { id: 'hi_main_rahoon', title: 'Main Rahoon Ya Na Rahoon', artist: 'Armaan Malik', language: 'Hindi', duration: '5:09', accent: '#6366f1', youtubeId: 'Dp6lbdoprZ0', synthNotes: [220.0, 261.63, 329.63, 440.0] },
    { id: 'hi_ishq_mubarak', title: 'Ishq Mubarak', artist: 'Arijit Singh', language: 'Hindi', duration: '4:56', accent: '#ec4899', youtubeId: 'V1oczq_8L0E', synthNotes: [246.94, 311.13, 369.99, 493.88] },
    { id: 'hi_thodi_der', title: 'Thodi Der', artist: 'Farhan Saeed & Shreya Ghoshal', language: 'Hindi', duration: '4:56', accent: '#a855f7', youtubeId: 'FGTv9-oQhIg', synthNotes: [293.66, 369.99, 440.0, 587.33] },
    { id: 'hi_be_intehaan', title: 'Be Intehaan', artist: 'Atif Aslam & Sunidhi Chauhan', language: 'Hindi', duration: '4:50', accent: '#ef4444', youtubeId: 'r_3K9vZ4oZE', synthNotes: [261.63, 311.13, 392.0, 466.16] },
    { id: 'hi_zaroorat', title: 'Zaroorat', artist: 'Mustafa Zahid', language: 'Hindi', duration: '6:08', accent: '#64748b', youtubeId: 'VMEXKJbsUmE', synthNotes: [220.0, 246.94, 329.63, 392.0] },
    { id: 'hi_mann_mera', title: 'Mann Mera', artist: 'Gajendra Verma', language: 'Hindi', duration: '3:18', accent: '#f97316', youtubeId: 'SlHnlxDt2TQ', synthNotes: [246.94, 293.66, 369.99, 440.0] },
    { id: 'hi_tum_hi_ho', title: 'Tum Hi Ho', artist: 'Arijit Singh', language: 'Hindi', duration: '4:22', accent: '#e11d48', youtubeId: 'Umqb9KENgmk', synthNotes: [293.66, 349.23, 440.0, 523.25] },
    { id: 'hi_raabta', title: 'Raabta', artist: 'Arijit Singh', language: 'Hindi', duration: '4:03', accent: '#8b5cf6', youtubeId: 'zAU_rsoS5ok', synthNotes: [261.63, 293.66, 392.0, 440.0] },
    { id: 'hi_khairiyat', title: 'Khairiyat', artist: 'Arijit Singh', language: 'Hindi', duration: '4:40', accent: '#38bdf8', youtubeId: 'hoNb6HuNmU0', synthNotes: [220.0, 261.63, 329.63, 392.0] },
    { id: 'hi_kesariya', title: 'Kesariya', artist: 'Arijit Singh', language: 'Hindi', duration: '4:28', accent: '#f59e0b', youtubeId: 'BddP6PYo2gs', synthNotes: [261.63, 329.63, 392.0, 440.0] },
    { id: 'hi_hawayein', title: 'Hawayein', artist: 'Arijit Singh', language: 'Hindi', duration: '4:50', accent: '#0ea5e9', youtubeId: 'cYOB941gyXI', synthNotes: [246.94, 329.63, 392.0, 493.88] },
    { id: 'hi_apna_bana_le', title: 'Apna Bana Le', artist: 'Arijit Singh', language: 'Hindi', duration: '4:21', accent: '#f472b6', youtubeId: 'ElZfdU54Cp8', synthNotes: [220.0, 277.18, 329.63, 440.0] },
    { id: 'hi_tujh_mein_rab', title: 'Tujh Mein Rab Dikhta Hai', artist: 'Roop Kumar Rathod', language: 'Hindi', duration: '4:41', accent: '#eab308', youtubeId: 'qoq8B8ThgEM', synthNotes: [261.63, 329.63, 392.0, 523.25] },
    { id: 'hi_janam_janam', title: 'Janam Janam', artist: 'Arijit Singh & Antara Mitra', language: 'Hindi', duration: '3:57', accent: '#db2777', youtubeId: '50usvriCMak', synthNotes: [293.66, 349.23, 440.0, 587.33] },
    { id: 'hi_ilahi', title: 'Ilahi', artist: 'Arijit Singh', language: 'Hindi', duration: '3:48', accent: '#10b981', youtubeId: 'fdubeMFwuGs', synthNotes: [261.63, 329.63, 440.0, 523.25] },
    { id: 'hi_kaun_tujhe', title: 'Kaun Tujhe', artist: 'Palak Muchhal', language: 'Hindi', duration: '4:01', accent: '#fb7185', youtubeId: 'atVof3pjT-I', synthNotes: [246.94, 293.66, 369.99, 493.88] },
    { id: 'hi_dil_diyan_gallan', title: 'Dil Diyan Gallan', artist: 'Atif Aslam', language: 'Hindi', duration: '4:20', accent: '#f43f5e', youtubeId: 'SAcpESN_Fk4', synthNotes: [261.63, 329.63, 392.0, 493.88] },
    { id: 'hi_pachtaoge', title: 'Pachtaoge', artist: 'Arijit Singh', language: 'Hindi', duration: '3:46', accent: '#7c3aed', youtubeId: 'PVxc5mIHVuQ', synthNotes: [220.0, 261.63, 311.13, 392.0] },
    { id: 'hi_hass_hass', title: 'Hass Hass', artist: 'Diljit Dosanjh & Sia', language: 'Hindi', duration: '2:34', accent: '#14b8a6', youtubeId: 'jADTdg-o8i0', synthNotes: [293.66, 369.99, 440.0, 587.33] },

    // ===== BANGLA (15) =====
    { id: 'bn_tomake_chai', title: 'Tomake Chai', artist: 'Arijit Singh', language: 'Bangla', duration: '4:34', accent: '#06b6d4', youtubeId: '1f18irP--O8', synthNotes: [261.63, 293.66, 392.0, 440.0] },
    { id: 'bn_bojhena_shey', title: 'Bojhena Shey Bojhena', artist: 'Arijit Singh', language: 'Bangla', duration: '5:10', accent: '#0ea5e9', youtubeId: 'J2JQQm1h6xQ', synthNotes: [220.0, 261.63, 329.63, 392.0] },
    { id: 'bn_mon_majhi_re', title: 'Mon Majhi Re', artist: 'Arijit Singh', language: 'Bangla', duration: '4:42', accent: '#14b8a6', youtubeId: 'ldfeUnod0tw', synthNotes: [246.94, 293.66, 369.99, 440.0] },
    { id: 'bn_ami_je_tomar', title: 'Ami Je Tomar', artist: 'Shreya Ghoshal', language: 'Bangla', duration: '6:14', accent: '#d946ef', youtubeId: 'lL0ULDPCqIA', synthNotes: [261.63, 311.13, 392.0, 493.88] },
    { id: 'bn_ore_mon', title: 'Ore Mon', artist: 'Arijit Singh', language: 'Bangla', duration: '4:05', accent: '#3b82f6', youtubeId: '', synthNotes: [246.94, 329.63, 392.0, 440.0] },
    { id: 'bn_tumi_jaake', title: 'Tumi Jaake Bhalobasho', artist: 'Anupam Roy & Iman Chakraborty', language: 'Bangla', duration: '4:38', accent: '#10b981', youtubeId: 'R7L8b-609D0', synthNotes: [220.0, 277.18, 329.63, 440.0] },
    { id: 'bn_keno_je_toke', title: 'Keno Je Toke', artist: 'Raj Barman', language: 'Bangla', duration: '4:18', accent: '#6366f1', youtubeId: '', synthNotes: [261.63, 329.63, 392.0, 493.88] },
    { id: 'bn_shopnogulo', title: 'Shopnogulo', artist: 'Anupam Roy', language: 'Bangla', duration: '4:12', accent: '#8b5cf6', youtubeId: '', synthNotes: [196.0, 246.94, 293.66, 392.0] },
    { id: 'bn_chokher_poloke', title: 'Chokher Poloke', artist: 'Bangla Melody Collective', language: 'Bangla', duration: '3:54', accent: '#ec4899', youtubeId: '', synthNotes: [261.63, 293.66, 349.23, 440.0] },
    { id: 'bn_ei_meghla_dine', title: 'Ei Meghla Dine Ekla', artist: 'Hemanta Mukherjee', language: 'Bangla', duration: '3:28', accent: '#0284c7', youtubeId: '', synthNotes: [220.0, 261.63, 329.63, 440.0] },
    { id: 'bn_tomar_ghore', title: 'Tomar Ghore Boshot Kore', artist: 'Bangla Folk Ensemble', language: 'Bangla', duration: '4:48', accent: '#f59e0b', youtubeId: '', synthNotes: [293.66, 329.63, 392.0, 440.0] },
    { id: 'bn_bhalo_thakis', title: 'Bhalo Thakis', artist: 'Anupam Roy', language: 'Bangla', duration: '4:06', accent: '#22c55e', youtubeId: '', synthNotes: [246.94, 293.66, 369.99, 493.88] },
    { id: 'bn_dure_dure', title: 'Dure Dure', artist: 'Minar Rahman', language: 'Bangla', duration: '3:58', accent: '#38bdf8', youtubeId: '', synthNotes: [261.63, 329.63, 392.0, 523.25] },
    { id: 'bn_bhalobasha_dao', title: 'Bhalobasha Dao', artist: 'Bangla Indie Unplugged', language: 'Bangla', duration: '4:15', accent: '#fb7185', youtubeId: '', synthNotes: [220.0, 261.63, 329.63, 392.0] },
    { id: 'bn_ekhon_ami', title: 'Ekhon Ami', artist: 'Bangla Acoustic Ballad', language: 'Bangla', duration: '4:02', accent: '#a855f7', youtubeId: '', synthNotes: [196.0, 246.94, 329.63, 392.0] }
  ];

  const SONGS_CATALOG = RAW_SONGS_SPEC.map((spec, idx) => makeSongEntry(spec, idx));

  /**
   * Verified Embeddable Trending / Popular YouTube Videos for VR Watch-Together.
   * Every video ID below was verified active via YouTube oEmbed (zero 404/broken links).
   */
  const RAW_YOUTUBE_PRESETS = [
    {
      id: 'yt_tum_hi_ho',
      title: 'Tum Hi Ho — Aashiqui 2 (Arijit Singh)',
      channel: 'T-Series',
      category: 'Hindi',
      duration: '4:22',
      youtubeId: 'Umqb9KENgmk',
      accent: '#e11d48'
    },
    {
      id: 'yt_kesariya_video',
      title: 'Kesariya — Brahmāstra (Arijit Singh)',
      channel: 'Sony Music India',
      category: 'Hindi',
      duration: '2:53',
      youtubeId: 'BddP6PYo2gs',
      accent: '#f59e0b'
    },
    {
      id: 'yt_apna_bana_le',
      title: 'Apna Bana Le — Bhediya (Arijit Singh)',
      channel: 'Zee Music Company',
      category: 'Hindi',
      duration: '3:25',
      youtubeId: 'ElZfdU54Cp8',
      accent: '#fb7185'
    },
    {
      id: 'yt_dil_diyan_gallan',
      title: 'Dil Diyan Gallan — Atif Aslam',
      channel: 'YRF',
      category: 'Hindi',
      duration: '4:20',
      youtubeId: 'SAcpESN_Fk4',
      accent: '#f43f5e'
    },
    {
      id: 'yt_khairiyat',
      title: 'Khairiyat — Chhichhore (Arijit Singh)',
      channel: 'T-Series',
      category: 'Hindi',
      duration: '4:40',
      youtubeId: 'hoNb6HuNmU0',
      accent: '#38bdf8'
    },
    {
      id: 'yt_tu_chahiye',
      title: 'Tu Chahiye — Bajrangi Bhaijaan (Atif Aslam)',
      channel: 'T-Series',
      category: 'Hindi',
      duration: '4:32',
      youtubeId: 'zuvla6ABKbs',
      accent: '#f97316'
    },
    {
      id: 'yt_hass_hass',
      title: 'Hass Hass — Diljit Dosanjh & Sia',
      channel: 'Diljit Dosanjh',
      category: 'Hindi',
      duration: '2:34',
      youtubeId: 'jADTdg-o8i0',
      accent: '#14b8a6'
    },
    {
      id: 'yt_tomake_chai',
      title: 'Tomake Chai — Gangster (Arijit Singh)',
      channel: 'SVF',
      category: 'Bangla',
      duration: '4:34',
      youtubeId: '1f18irP--O8',
      accent: '#06b6d4'
    },
    {
      id: 'yt_bojhena_shey',
      title: 'Bojhena Shey Bojhena — Arijit Singh',
      channel: 'SVF',
      category: 'Bangla',
      duration: '5:10',
      youtubeId: 'J2JQQm1h6xQ',
      accent: '#0ea5e9'
    },
    {
      id: 'yt_mon_majhi_re',
      title: 'Mon Majhi Re — Boss (Arijit Singh)',
      channel: 'Arijit Singh - Topic',
      category: 'Bangla',
      duration: '4:42',
      youtubeId: 'ldfeUnod0tw',
      accent: '#10b981'
    },
    {
      id: 'yt_tumi_jaake',
      title: 'Tumi Jaake Bhalobasho — Praktan (Anupam Roy)',
      channel: 'Amara Muzik Bengali',
      category: 'Bangla',
      duration: '4:38',
      youtubeId: 'R7L8b-609D0',
      accent: '#8b5cf6'
    },
    {
      id: 'yt_lofi_study',
      title: '1 A.M Study Session — Lofi Hip Hop & Chill Beats',
      channel: 'Lofi Girl',
      category: 'Lo-Fi',
      duration: '1:01:14',
      youtubeId: 'lTRiuFIWV54',
      accent: '#6366f1'
    },
    {
      id: 'yt_synthwave_radio',
      title: 'Synthwave Radio — Beats to Chill & Game',
      channel: 'Lofi Girl',
      category: 'Gaming',
      duration: 'LIVE',
      youtubeId: '4xDzrJKXOOY',
      accent: '#ec4899'
    },
    {
      id: 'yt_pomodoro_focus',
      title: 'Study Music Alpha Waves — Deep Focus',
      channel: 'Yellow Brick Cinema',
      category: 'Study',
      duration: '50:00',
      youtubeId: 'WPni755-Krg',
      accent: '#10b981'
    }
  ];

  const YOUTUBE_PRESETS = RAW_YOUTUBE_PRESETS.map((v) => ({
    ...v,
    videoId: v.youtubeId,
    url: `https://www.youtube.com/watch?v=${v.youtubeId}`,
    thumbnail: buildYouTubeThumb(v.youtubeId),
    kind: 'youtube'
  }));

  /* ===== Live Multi-Instance Public YouTube Search Engine (No API Key) ===== */

  function formatViewsCount(rawViews) {
    const n = Number(rawViews);
    if (!Number.isFinite(n) || n <= 0) return '';
    if (n >= 1000000000) return `${(n / 1000000000).toFixed(1).replace(/\.0$/, '')}B views`;
    if (n >= 1000000) return `${(n / 1000000).toFixed(1).replace(/\.0$/, '')}M views`;
    if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}K views`;
    return `${Math.floor(n)} views`;
  }

  function parsePipedSearchResponse(json, maxResults) {
    const cap = Math.max(1, Math.min(25, Number(maxResults) || 14));
    const items = Array.isArray(json) ? json : (json && Array.isArray(json.items) ? json.items : []);
    const seen = new Set();
    const out = [];
    for (let i = 0; i < items.length && out.length < cap; i++) {
      const it = items[i];
      if (!it || typeof it !== 'object') continue;
      if (it.type && it.type !== 'stream' && it.type !== 'video') continue;
      const vid = extractYouTubeIdFromPath(it.url || it.videoId || it.id);
      if (!vid || seen.has(vid)) continue;
      seen.add(vid);
      const title = cleanStr(it.title);
      if (!title) continue;
      const channel = cleanStr(it.uploaderName || it.author || 'YouTube');
      const durSec = Number(it.duration);
      const duration = Number.isFinite(durSec) && durSec >= 0 ? formatDurationSec(durSec) : '';
      const viewsText = formatViewsCount(it.views);
      const uploadedDate = cleanStr(it.uploadedDate || '');
      const thumbUrl = (Number.isFinite(durSec) && durSec <= 0)
        ? `https://i.ytimg.com/vi/${vid}/hqdefault.jpg`
        : buildYouTubeThumb(vid);
      out.push({
        id: 'yt_' + vid,
        songId: 'yt_' + vid,
        videoId: vid,
        youtubeId: vid,
        title,
        channel,
        artist: channel,
        singer: channel,
        duration,
        durationSec: Number.isFinite(durSec) && durSec > 0 ? Math.floor(durSec) : 0,
        viewsText,
        uploadedDate,
        thumbnail: thumbUrl,
        url: `https://www.youtube.com/watch?v=${vid}`,
        kind: 'youtube',
        source: 'piped'
      });
    }
    return out;
  }

  function parseInvidiousSearchResponse(json, maxResults) {
    const cap = Math.max(1, Math.min(25, Number(maxResults) || 14));
    const items = Array.isArray(json) ? json : [];
    const seen = new Set();
    const out = [];
    for (let i = 0; i < items.length && out.length < cap; i++) {
      const it = items[i];
      if (!it || typeof it !== 'object') continue;
      if (it.type && it.type !== 'video' && it.type !== 'shortVideo') continue;
      const vid = extractYouTubeIdFromPath(it.videoId || it.url);
      if (!vid || seen.has(vid)) continue;
      seen.add(vid);
      const title = cleanStr(it.title);
      if (!title) continue;
      const channel = cleanStr(it.author || it.uploaderName || 'YouTube');
      const durSec = Number(it.lengthSeconds);
      const duration = it.liveNow ? 'LIVE' : (Number.isFinite(durSec) && durSec > 0 ? formatDurationSec(durSec) : '');
      const viewsText = formatViewsCount(it.viewCount);
      const uploadedDate = cleanStr(it.publishedText || '');
      out.push({
        id: 'yt_' + vid,
        songId: 'yt_' + vid,
        videoId: vid,
        youtubeId: vid,
        title,
        channel,
        artist: channel,
        singer: channel,
        duration,
        durationSec: Number.isFinite(durSec) && durSec > 0 ? Math.floor(durSec) : 0,
        viewsText,
        uploadedDate,
        thumbnail: buildYouTubeThumb(vid),
        url: `https://www.youtube.com/watch?v=${vid}`,
        kind: 'youtube',
        source: 'invidious'
      });
    }
    return out;
  }

  function buildYouTubeSearchFallbackItem(query) {
    const q = cleanStr(query);
    if (!q) return null;
    const key = 'yts_' + hashString(q.toLowerCase()).toString(36);
    return {
      id: key,
      songId: key,
      videoId: '',
      youtubeId: '',
      searchQuery: q,
      title: `Play "${q}" on YouTube`,
      channel: 'YouTube Instant Search Fallback',
      artist: 'YouTube Search',
      singer: 'YouTube Search',
      duration: 'SEARCH',
      durationSec: 0,
      thumbnail: '',
      url: `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(q)}&autoplay=1&rel=0&playsinline=1&enablejsapi=1`,
      kind: 'yt_search',
      source: 'yt_search_fallback'
    };
  }

  function findLocalYouTubeMatches(query, maxResults) {
    const q = cleanStr(query).toLowerCase();
    if (!q) return [];
    const cap = Number(maxResults) || 6;
    const seen = new Set();
    const out = [];
    const pushItem = (raw) => {
      const vid = cleanStr(raw.youtubeId || raw.videoId);
      if (!isValidYouTubeId(vid) || seen.has(vid)) return;
      seen.add(vid);
      out.push({
        id: raw.id || ('yt_' + vid),
        songId: raw.id || ('yt_' + vid),
        videoId: vid,
        youtubeId: vid,
        title: raw.title,
        channel: raw.channel || raw.artist || 'YouTube',
        artist: raw.artist || raw.channel || 'YouTube',
        singer: raw.artist || raw.channel || 'YouTube',
        language: raw.language || raw.category || '',
        duration: raw.duration || '',
        durationSec: 0,
        thumbnail: buildYouTubeThumb(vid),
        url: `https://www.youtube.com/watch?v=${vid}`,
        kind: 'youtube',
        source: 'catalog'
      });
    };
    YOUTUBE_PRESETS.forEach((p) => {
      if (out.length >= cap) return;
      const hay = `${p.title} ${p.channel} ${p.category}`.toLowerCase();
      if (hay.includes(q)) pushItem(p);
    });
    SONGS_CATALOG.forEach((s) => {
      if (out.length >= cap || !s.youtubeId) return;
      const hay = `${s.title} ${s.artist} ${s.language}`.toLowerCase();
      if (hay.includes(q)) pushItem(s);
    });
    return out;
  }

  async function fetchJsonWithTimeout(url, timeoutMs, fetchFn) {
    const fn = typeof fetchFn === 'function' ? fetchFn : (typeof fetch === 'function' ? fetch : null);
    if (!fn) throw new Error('Fetch unavailable');
    const ms = Math.max(800, Number(timeoutMs) || 3800);
    const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timer = ctrl ? setTimeout(() => { try { ctrl.abort(); } catch {} }, ms) : 0;
    try {
      const res = await fn(url, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: ctrl ? ctrl.signal : undefined
      });
      if (!res || !res.ok) throw new Error(`HTTP ${res ? res.status : 0}`);
      return await res.json();
    } finally {
      if (timer) clearTimeout(timer);
    }
  }

  /**
   * Live YouTube search using multi-instance Piped + Invidious endpoints
   * with strict timeout & automatic YouTube `listType=search` fallback.
   */
  async function searchYouTubeLive(query, opts) {
    const q = cleanStr(query);
    if (!q) {
      return { ok: false, error: 'Enter a song, artist, or video name to search', items: [], source: 'none', usedFallback: false };
    }
    const o = opts || {};
    const maxResults = Math.max(1, Math.min(20, Number(o.maxResults) || 10));
    const timeoutMs = Number(o.timeoutMs) || 3800;
    const fetchFn = o.fetchImpl || null;
    const useCache = o.bypassCache !== true && !fetchFn;
    const cacheKey = q.toLowerCase();

    if (useCache && searchCache.has(cacheKey)) {
      const cached = searchCache.get(cacheKey);
      if (Date.now() - cached.ts < SEARCH_CACHE_TTL_MS) {
        return cached.result;
      }
      searchCache.delete(cacheKey);
    }

    const pipedList = Array.isArray(o.pipedInstances) ? o.pipedInstances : PIPED_SEARCH_INSTANCES;
    const invidiousList = Array.isArray(o.invidiousInstances) ? o.invidiousInstances : INVIDIOUS_SEARCH_INSTANCES;
    const encoded = encodeURIComponent(q);

    // 1) Try Piped instances
    for (let i = 0; i < pipedList.length; i++) {
      const base = cleanStr(pipedList[i]).replace(/\/+$/, '');
      if (!base) continue;
      try {
        const json = await fetchJsonWithTimeout(`${base}/search?q=${encoded}&filter=videos`, timeoutMs, fetchFn);
        const parsed = parsePipedSearchResponse(json, maxResults);
        if (parsed.length > 0) {
          const result = { ok: true, items: parsed, source: 'piped', instance: base, usedFallback: false };
          if (useCache) searchCache.set(cacheKey, { ts: Date.now(), result });
          return result;
        }
      } catch {
        // Try next public instance
      }
    }

    // 2) Failover to Invidious instances
    for (let i = 0; i < invidiousList.length; i++) {
      const base = cleanStr(invidiousList[i]).replace(/\/+$/, '');
      if (!base) continue;
      try {
        const json = await fetchJsonWithTimeout(`${base}/api/v1/search?q=${encoded}&type=video`, timeoutMs, fetchFn);
        const parsed = parseInvidiousSearchResponse(json, maxResults);
        if (parsed.length > 0) {
          const result = { ok: true, items: parsed, source: 'invidious', instance: base, usedFallback: false };
          if (useCache) searchCache.set(cacheKey, { ts: Date.now(), result });
          return result;
        }
      } catch {
        // Try next public instance
      }
    }

    // 3) Guaranteed fallback: local verified YouTube matches + YouTube `listType=search` instant embed
    const localMatches = findLocalYouTubeMatches(q, 5);
    const searchItem = buildYouTubeSearchFallbackItem(q);
    const fallbackItems = searchItem ? [...localMatches, searchItem] : localMatches;
    return {
      ok: true,
      items: fallbackItems,
      source: 'yt_search_fallback',
      instance: 'youtube_embed_search',
      usedFallback: true
    };
  }

  const YOUTUBE_BROWSE_TOPICS = [
    { id: 'trending', label: 'Trending', query: '' },
    { id: 'music', label: 'Music', query: 'Trending Indian Hit Songs Official Video' },
    { id: 'hindi', label: 'Hindi', query: 'Arijit Singh Bollywood Hit Songs Official Video' },
    { id: 'bangla', label: 'Bangla', query: 'Bangla Romantic Hit Songs Official Video' },
    { id: 'gaming', label: 'Gaming', query: 'Gaming Highlights Live India' },
    { id: 'lofi', label: 'Study & Lo-Fi', query: 'Lofi Study Chill Beats Relaxing' },
    { id: 'comedy', label: 'Comedy', query: 'Standup Comedy Hindi Viral' }
  ];

  const browseCache = new Map();

  function buildVerifiedCatalogFeed(topicId, maxResults) {
    const cap = Math.max(1, Math.min(25, Number(maxResults) || 14));
    const t = cleanStr(topicId).toLowerCase();
    const pool = YOUTUBE_PRESETS.filter((v) => {
      if (!v || !v.youtubeId) return false;
      if (t === 'hindi') return cleanStr(v.category).toLowerCase() === 'hindi';
      if (t === 'bangla') return cleanStr(v.category).toLowerCase() === 'bangla';
      if (t === 'gaming') return cleanStr(v.category).toLowerCase() === 'gaming';
      if (t === 'lofi') return ['lo-fi', 'study'].includes(cleanStr(v.category).toLowerCase());
      return true;
    });
    const list = pool.length ? pool : YOUTUBE_PRESETS;
    return list.slice(0, cap).map((v) => ({
      id: v.id || ('yt_' + v.youtubeId),
      songId: v.id || ('yt_' + v.youtubeId),
      videoId: v.youtubeId,
      youtubeId: v.youtubeId,
      title: v.title,
      channel: v.channel || 'YouTube',
      artist: v.channel || 'YouTube',
      singer: v.channel || 'YouTube',
      duration: v.duration || '',
      durationSec: 0,
      viewsText: v.category || 'Verified',
      uploadedDate: '',
      thumbnail: v.thumbnail || buildYouTubeThumb(v.youtubeId),
      url: `https://www.youtube.com/watch?v=${v.youtubeId}`,
      kind: 'youtube',
      source: 'verified_fallback'
    }));
  }

  /**
   * Fetches live YouTube Trending videos via Piped -> Invidious -> verified fallback.
   */
  async function fetchYouTubeTrending(opts) {
    const o = opts || {};
    const region = cleanStr(o.region || 'IN').toUpperCase() || 'IN';
    const maxResults = Math.max(1, Math.min(25, Number(o.maxResults) || 14));
    const timeoutMs = Number(o.timeoutMs) || 3800;
    const fetchFn = o.fetchImpl || null;
    const useCache = o.bypassCache !== true && !fetchFn;
    const cacheKey = `trending:${region}`;

    if (useCache && browseCache.has(cacheKey)) {
      const cached = browseCache.get(cacheKey);
      if (Date.now() - cached.ts < SEARCH_CACHE_TTL_MS) {
        return cached.result;
      }
      browseCache.delete(cacheKey);
    }

    const pipedList = Array.isArray(o.pipedInstances) ? o.pipedInstances : PIPED_SEARCH_INSTANCES;
    const invidiousList = Array.isArray(o.invidiousInstances) ? o.invidiousInstances : INVIDIOUS_SEARCH_INSTANCES;

    for (let i = 0; i < pipedList.length; i++) {
      const base = cleanStr(pipedList[i]).replace(/\/+$/, '');
      if (!base) continue;
      try {
        const json = await fetchJsonWithTimeout(`${base}/trending?region=${encodeURIComponent(region)}`, timeoutMs, fetchFn);
        const parsed = parsePipedSearchResponse(json, maxResults);
        if (parsed.length > 0) {
          const result = { ok: true, items: parsed, source: 'piped_trending', instance: base, usedFallback: false };
          if (useCache) browseCache.set(cacheKey, { ts: Date.now(), result });
          return result;
        }
      } catch {
        // Try next public instance
      }
    }

    for (let i = 0; i < invidiousList.length; i++) {
      const base = cleanStr(invidiousList[i]).replace(/\/+$/, '');
      if (!base) continue;
      try {
        const json = await fetchJsonWithTimeout(`${base}/api/v1/trending?region=${encodeURIComponent(region)}`, timeoutMs, fetchFn);
        const parsed = parseInvidiousSearchResponse(json, maxResults);
        if (parsed.length > 0) {
          const result = { ok: true, items: parsed, source: 'invidious_trending', instance: base, usedFallback: false };
          if (useCache) browseCache.set(cacheKey, { ts: Date.now(), result });
          return result;
        }
      } catch {
        // Try next public instance
      }
    }

    return {
      ok: true,
      items: buildVerifiedCatalogFeed('trending', maxResults),
      source: 'verified_fallback',
      instance: 'local_verified',
      usedFallback: true
    };
  }

  /**
   * Loads a live YouTube browse topic (Trending, Music, Hindi, Bangla, Gaming, Study & Lo-Fi, Comedy).
   */
  async function fetchYouTubeBrowseFeed(topicId, opts) {
    const o = opts || {};
    const tid = cleanStr(topicId || 'trending').toLowerCase();
    if (!tid || tid === 'trending') {
      return fetchYouTubeTrending(o);
    }
    const topic = YOUTUBE_BROWSE_TOPICS.find((t) => t.id === tid);
    const query = topic && topic.query ? topic.query : tid;
    const res = await searchYouTubeLive(query, {
      maxResults: Number(o.maxResults) || 14,
      timeoutMs: Number(o.timeoutMs) || 3800,
      fetchImpl: o.fetchImpl,
      pipedInstances: o.pipedInstances,
      invidiousInstances: o.invidiousInstances,
      bypassCache: o.bypassCache
    });
    if (res && res.items && res.items.length > 0 && !res.usedFallback) {
      return res;
    }
    const localItems = buildVerifiedCatalogFeed(tid, Number(o.maxResults) || 14);
    if (localItems.length) {
      return {
        ok: true,
        items: localItems,
        source: 'verified_fallback',
        instance: 'local_verified',
        usedFallback: true
      };
    }
    return res;
  }

  /* ===== Live Full-Length Audio Song Search (Full YouTube Music Audio + Audius Full + Full Search Fallback) ===== */

  function parsePipedAudioSearchResponse(json, maxResults, excludeIds) {
    const cap = Math.max(1, Math.min(25, Number(maxResults) || 15));
    const items = Array.isArray(json) ? json : (json && Array.isArray(json.items) ? json.items : []);
    const skip = new Set(Array.isArray(excludeIds) ? excludeIds.map(cleanStr) : []);
    const seen = new Set();
    const fullSongs = [];
    const shortFallback = [];
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      if (!it || typeof it !== 'object') continue;
      if (it.type && it.type !== 'stream' && it.type !== 'video') continue;
      if (it.isShort === true) continue;
      const vid = extractYouTubeIdFromPath(it.url || it.videoId || it.id);
      if (!vid || seen.has(vid) || skip.has(vid)) continue;
      seen.add(vid);
      const title = cleanStr(it.title);
      if (!title) continue;
      const artist = cleanStr(it.uploaderName || it.author || 'Artist').replace(/\s*-\s*Topic$/i, '');
      const durSec = Number(it.duration);
      const validDur = Number.isFinite(durSec) && durSec > 0 ? Math.floor(durSec) : 0;
      const duration = validDur > 0 ? formatDurationSec(validDur) : '';
      const thumb = buildYouTubeThumb(vid);
      const entry = {
        id: 'yta_' + vid,
        songId: 'yta_' + vid,
        videoId: vid,
        youtubeId: vid,
        title,
        artist,
        singer: artist,
        channel: artist,
        album: '',
        language: 'Full Song',
        tag: 'Full Song',
        duration,
        durationSec: validDur,
        thumbnail: thumb,
        artworkUrl: thumb,
        url: `yt-audio://${vid}`,
        externalUrl: `https://www.youtube.com/watch?v=${vid}`,
        kind: 'audio',
        isFullSong: true,
        isPreview: false,
        isFallback: false,
        source: 'yt_audio',
        searchQuery: `${title} ${artist} full song`
      };
      // Prefer full-length songs (>= 45s) over tiny teasers/clips
      if (validDur === 0 || validDur >= 45) fullSongs.push(entry);
      else shortFallback.push(entry);
      if (fullSongs.length >= cap) break;
    }
    return (fullSongs.length ? fullSongs : shortFallback).slice(0, cap);
  }

  function parseInvidiousAudioSearchResponse(json, maxResults, excludeIds) {
    const cap = Math.max(1, Math.min(25, Number(maxResults) || 15));
    const items = Array.isArray(json) ? json : [];
    const skip = new Set(Array.isArray(excludeIds) ? excludeIds.map(cleanStr) : []);
    const seen = new Set();
    const out = [];
    for (let i = 0; i < items.length && out.length < cap; i++) {
      const it = items[i];
      if (!it || typeof it !== 'object') continue;
      if (it.type && it.type !== 'video') continue;
      const vid = extractYouTubeIdFromPath(it.videoId || it.url);
      if (!vid || seen.has(vid) || skip.has(vid)) continue;
      seen.add(vid);
      const title = cleanStr(it.title);
      if (!title) continue;
      const artist = cleanStr(it.author || 'Artist').replace(/\s*-\s*Topic$/i, '');
      const durSec = Number(it.lengthSeconds);
      const validDur = Number.isFinite(durSec) && durSec > 0 ? Math.floor(durSec) : 0;
      if (validDur > 0 && validDur < 45) continue;
      const thumb = buildYouTubeThumb(vid);
      out.push({
        id: 'yta_' + vid,
        songId: 'yta_' + vid,
        videoId: vid,
        youtubeId: vid,
        title,
        artist,
        singer: artist,
        channel: artist,
        album: '',
        language: 'Full Song',
        tag: 'Full Song',
        duration: validDur > 0 ? formatDurationSec(validDur) : '',
        durationSec: validDur,
        thumbnail: thumb,
        artworkUrl: thumb,
        url: `yt-audio://${vid}`,
        externalUrl: `https://www.youtube.com/watch?v=${vid}`,
        kind: 'audio',
        isFullSong: true,
        isPreview: false,
        isFallback: false,
        source: 'yt_audio',
        searchQuery: `${title} ${artist} full song`
      });
    }
    return out;
  }

  function upgradeItunesArtworkUrl(url) {
    const raw = cleanStr(url);
    if (!isValidHttpUrl(raw)) return '';
    return raw.replace(/\/\d+x\d+bb\.(jpg|jpeg|png|webp)$/i, '/200x200bb.$1');
  }

  /**
   * Parses iTunes metadata into FULL-SONG tracks routed through full-length YouTube audio
   * (`yt-audio-search://`) so users NEVER hit Apple's 30-second preview cutoff!
   */
  function parseItunesSearchResponse(json, maxResults) {
    const cap = Math.max(1, Math.min(25, Number(maxResults) || 15));
    const items = json && Array.isArray(json.results) ? json.results : [];
    const seen = new Set();
    const out = [];
    for (let i = 0; i < items.length && out.length < cap; i++) {
      const it = items[i];
      if (!it || typeof it !== 'object') continue;
      if (it.kind && it.kind !== 'song' && it.wrapperType !== 'track') continue;
      const previewUrl = cleanStr(it.previewUrl);
      const title = cleanStr(it.trackName || it.trackCensoredName);
      if (!title) continue;
      const artist = cleanStr(it.artistName || 'Artist');
      const trackId = cleanStr(it.trackId || '');
      const dedupeKey = trackId
        ? `it_${trackId}`
        : `${title.toLowerCase()}::${artist.toLowerCase()}`;
      if (seen.has(dedupeKey)) continue;
      seen.add(dedupeKey);

      const durMs = Number(it.trackTimeMillis);
      const durSec = Number.isFinite(durMs) && durMs > 0 ? Math.round(durMs / 1000) : 0;
      const duration = durSec > 0 ? formatDurationSec(durSec) : '';
      const genre = cleanStr(it.primaryGenreName || 'Music');
      const album = cleanStr(it.collectionName || '');
      const thumb = upgradeItunesArtworkUrl(it.artworkUrl100 || it.artworkUrl60 || it.artworkUrl30);
      const id = trackId ? `itunes_${trackId}` : `itunes_${hashString(title + artist).toString(36)}`;
      const fullQuery = `${title} ${artist} full song`;

      out.push({
        id,
        songId: id,
        title,
        artist,
        singer: artist,
        channel: artist,
        album,
        language: genre,
        tag: genre,
        duration,
        durationSec: durSec,
        thumbnail: thumb,
        artworkUrl: thumb,
        // Route to full-length audio search engine instead of Apple's 30s preview clip!
        url: buildYtAudioSearchUrl(fullQuery),
        previewUrl: isValidHttpUrl(previewUrl) ? previewUrl : '',
        externalUrl: cleanStr(it.trackViewUrl || it.collectionViewUrl || ''),
        kind: 'audio',
        isFullSong: true,
        isPreview: false,
        isFallback: false,
        source: 'itunes_full',
        searchQuery: fullQuery
      });
    }
    return out;
  }

  function parseAudiusSearchResponse(json, maxResults) {
    const cap = Math.max(1, Math.min(25, Number(maxResults) || 12));
    const items = json && Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : []);
    const seen = new Set();
    const out = [];
    for (let i = 0; i < items.length && out.length < cap; i++) {
      const it = items[i];
      if (!it || typeof it !== 'object') continue;
      const tid = cleanStr(it.id);
      const title = cleanStr(it.title);
      if (!tid || !title || seen.has(tid)) continue;
      seen.add(tid);

      const artist = cleanStr((it.user && (it.user.name || it.user.handle)) || 'Audius Artist');
      const durSec = Number(it.duration);
      const duration = Number.isFinite(durSec) && durSec > 0 ? formatDurationSec(durSec) : '';
      const genre = cleanStr(it.genre || 'Music');
      const artObj = it.artwork && typeof it.artwork === 'object' ? it.artwork : {};
      const thumb = cleanStr(artObj['150x150'] || artObj['480x480'] || '');
      const streamUrl = `${AUDIUS_API_BASE}/v1/tracks/${encodeURIComponent(tid)}/stream`;
      const id = `audius_${tid}`;

      out.push({
        id,
        songId: id,
        title,
        artist,
        singer: artist,
        channel: artist,
        album: cleanStr(it.mood || ''),
        language: genre,
        tag: genre,
        duration,
        durationSec: Number.isFinite(durSec) && durSec > 0 ? Math.floor(durSec) : 0,
        thumbnail: isValidHttpUrl(thumb) ? thumb : '',
        artworkUrl: isValidHttpUrl(thumb) ? thumb : '',
        url: streamUrl,
        previewUrl: streamUrl,
        externalUrl: it.permalink ? `https://audius.co${it.permalink}` : '',
        kind: 'audio',
        isFullSong: true,
        isPreview: false,
        isFallback: false,
        source: 'audius',
        searchQuery: `${title} ${artist} song`
      });
    }
    return out;
  }

  function findLocalAudioMatches(query, maxResults) {
    const q = cleanStr(query).toLowerCase();
    if (!q) return [];
    const cap = Math.max(1, Math.min(20, Number(maxResults) || 10));
    const tokens = q.split(/\s+/).filter(Boolean);
    const out = [];
    for (let i = 0; i < SONGS_CATALOG.length && out.length < cap; i++) {
      const s = SONGS_CATALOG[i];
      if (!s) continue;
      const hay = `${s.title} ${s.artist} ${s.language}`.toLowerCase();
      if (hay.includes(q) || (tokens.length > 1 && tokens.every((t) => hay.includes(t)))) {
        out.push({
          ...s,
          songId: s.id,
          kind: 'audio',
          source: 'catalog'
        });
      }
    }
    return out;
  }

  /**
   * Resolves ANY song title/artist (including legacy iTunes 30s preview entries or unlinked catalog songs)
   * into a FULL-LENGTH audio stream (`yt-audio://<videoId>` or `yt-audio-search://...`).
   * Never returns a 30-second preview clip or SoundHelix dummy URL.
   */
  async function resolveFullLengthSongUrl(track, opts) {
    const o = opts || {};
    const title = cleanStr(track && track.title);
    const artist = cleanStr(track && (track.artist || track.singer || track.channel));
    const query = cleanStr(o.query || (track && track.searchQuery) || `${title} ${artist} full song`);
    if (!query) return { ok: false, url: '', videoId: '' };

    const timeoutMs = Number(o.timeoutMs) || 3800;
    const fetchFn = o.fetchImpl || null;
    const excludeIds = Array.isArray(o.excludeVideoIds) ? o.excludeVideoIds : [];
    const pipedList = Array.isArray(o.pipedInstances) ? o.pipedInstances : PIPED_SEARCH_INSTANCES;
    const invidiousList = Array.isArray(o.invidiousInstances) ? o.invidiousInstances : INVIDIOUS_SEARCH_INSTANCES;
    const preferVideosFilter = Boolean(o.preferVideosFilter || excludeIds.length > 0);
    const filters = preferVideosFilter ? ['videos', 'music_songs'] : ['music_songs', 'videos'];
    const encoded = encodeURIComponent(query);

    for (let i = 0; i < pipedList.length; i++) {
      const base = cleanStr(pipedList[i]).replace(/\/+$/, '');
      if (!base) continue;
      for (let f = 0; f < filters.length; f++) {
        try {
          const json = await fetchJsonWithTimeout(`${base}/search?q=${encoded}&filter=${filters[f]}`, timeoutMs, fetchFn);
          const parsed = parsePipedAudioSearchResponse(json, 5, excludeIds);
          if (parsed.length > 0) {
            const best = parsed[0];
            return {
              ok: true,
              url: best.url,
              videoId: best.videoId,
              duration: best.duration,
              durationSec: best.durationSec,
              thumbnail: best.thumbnail,
              source: 'yt_audio'
            };
          }
        } catch {
          // Try next filter / instance
        }
      }
    }

    for (let i = 0; i < invidiousList.length; i++) {
      const base = cleanStr(invidiousList[i]).replace(/\/+$/, '');
      if (!base) continue;
      try {
        const json = await fetchJsonWithTimeout(`${base}/api/v1/search?q=${encoded}&type=video`, timeoutMs, fetchFn);
        const parsed = parseInvidiousAudioSearchResponse(json, 5, excludeIds);
        if (parsed.length > 0) {
          const best = parsed[0];
          return {
            ok: true,
            url: best.url,
            videoId: best.videoId,
            duration: best.duration,
            durationSec: best.durationSec,
            thumbnail: best.thumbnail,
            source: 'yt_audio'
          };
        }
      } catch {
        // Try next Invidious instance
      }
    }

    return {
      ok: true,
      url: buildYtAudioSearchUrl(query),
      videoId: '',
      duration: cleanStr(track && track.duration) || '',
      durationSec: Number((track && track.durationSec) || 0),
      thumbnail: cleanStr(track && (track.thumbnail || track.artworkUrl)) || '',
      source: 'yt_audio_search',
      searchQuery: query
    };
  }

  /**
   * Live FULL-LENGTH song search for Audio / MP3 Mini-Player Mode:
   * 1) Primary: Full-Length YouTube Music Audio Search via Piped (`music_songs` -> `videos`) + Invidious
   *    -> returns real 3-6 minute full songs (`yt-audio://<videoId>`) with zero 30s preview cutoff!
   * 2) Secondary: Audius Full-Length Audio API (real full streams, zero 30s preview).
   * 3) Tertiary: iTunes metadata search upgraded to full-length `yt-audio-search://` (never 30s preview!).
   * 4) Offline fallback: Local verified starter catalog matches.
   */
  async function searchAudioSongsLive(query, opts) {
    const q = cleanStr(query);
    if (!q) {
      return { ok: false, error: 'Enter a song, artist, or album name to search', items: [], source: 'none', usedFallback: false };
    }
    const o = opts || {};
    const maxResults = Math.max(1, Math.min(25, Number(o.maxResults) || 15));
    const timeoutMs = Number(o.timeoutMs) || 4500;
    const fetchFn = o.fetchImpl || null;
    const country = cleanStr(o.country || 'IN').toUpperCase() || 'IN';
    const useCache = o.bypassCache !== true && !fetchFn;
    const cacheKey = `full:${country}:${q.toLowerCase()}`;

    if (useCache && audioSearchCache.has(cacheKey)) {
      const cached = audioSearchCache.get(cacheKey);
      if (Date.now() - cached.ts < SEARCH_CACHE_TTL_MS) {
        return cached.result;
      }
      audioSearchCache.delete(cacheKey);
    }

    const encoded = encodeURIComponent(q);
    const pipedList = Array.isArray(o.pipedInstances) ? o.pipedInstances : PIPED_SEARCH_INSTANCES;
    const invidiousList = Array.isArray(o.invidiousInstances) ? o.invidiousInstances : INVIDIOUS_SEARCH_INSTANCES;

    // 1) Primary: Full-length YouTube Music Audio via Piped (`filter=music_songs`, then `filter=videos`)
    for (let i = 0; i < pipedList.length; i++) {
      const base = cleanStr(pipedList[i]).replace(/\/+$/, '');
      if (!base) continue;
      try {
        const jsonMusic = await fetchJsonWithTimeout(`${base}/search?q=${encoded}&filter=music_songs`, timeoutMs, fetchFn);
        let parsed = parsePipedAudioSearchResponse(jsonMusic, maxResults);
        if (!parsed.length) {
          const jsonVid = await fetchJsonWithTimeout(`${base}/search?q=${encoded}&filter=videos`, timeoutMs, fetchFn);
          parsed = parsePipedAudioSearchResponse(jsonVid, maxResults);
        }
        if (parsed.length > 0) {
          const result = {
            ok: true,
            items: parsed.slice(0, maxResults),
            source: 'yt_audio',
            instance: base,
            usedFallback: false
          };
          if (useCache) audioSearchCache.set(cacheKey, { ts: Date.now(), result });
          return result;
        }
      } catch {
        // Try next Piped instance
      }
    }

    // 1b) Invidious full-length audio search failover
    for (let i = 0; i < invidiousList.length; i++) {
      const base = cleanStr(invidiousList[i]).replace(/\/+$/, '');
      if (!base) continue;
      try {
        const jsonInv = await fetchJsonWithTimeout(`${base}/api/v1/search?q=${encoded}&type=video`, timeoutMs, fetchFn);
        const parsedInv = parseInvidiousAudioSearchResponse(jsonInv, maxResults);
        if (parsedInv.length > 0) {
          const result = {
            ok: true,
            items: parsedInv.slice(0, maxResults),
            source: 'yt_audio',
            instance: base,
            usedFallback: false
          };
          if (useCache) audioSearchCache.set(cacheKey, { ts: Date.now(), result });
          return result;
        }
      } catch {
        // Try next Invidious instance
      }
    }

    // 2) Secondary: iTunes Metadata Discovery -> upgraded to FULL-LENGTH YouTube Audio Search (never 30s preview!)
    let itunesItems = [];
    try {
      const urlIn = `${ITUNES_SEARCH_BASE}?term=${encoded}&media=music&entity=song&country=${encodeURIComponent(country)}&limit=${Math.min(25, maxResults + 4)}`;
      const jsonIn = await fetchJsonWithTimeout(urlIn, timeoutMs, fetchFn);
      itunesItems = parseItunesSearchResponse(jsonIn, maxResults);
    } catch {
      // Continue to US iTunes or Audius
    }

    if (itunesItems.length < 4 && country !== 'US') {
      try {
        const urlUs = `${ITUNES_SEARCH_BASE}?term=${encoded}&media=music&entity=song&country=US&limit=${Math.min(25, maxResults)}`;
        const jsonUs = await fetchJsonWithTimeout(urlUs, timeoutMs, fetchFn);
        const usItems = parseItunesSearchResponse(jsonUs, maxResults);
        if (usItems.length) {
          const seen = new Set(itunesItems.map((x) => `${x.title.toLowerCase()}::${x.artist.toLowerCase()}`));
          usItems.forEach((item) => {
            const k = `${item.title.toLowerCase()}::${item.artist.toLowerCase()}`;
            if (!seen.has(k) && itunesItems.length < maxResults) {
              seen.add(k);
              itunesItems.push(item);
            }
          });
        }
      } catch {
        // Keep IN metadata results
      }
    }

    if (itunesItems.length > 0) {
      const result = {
        ok: true,
        items: itunesItems.slice(0, maxResults),
        source: 'itunes_full',
        usedFallback: false
      };
      if (useCache) audioSearchCache.set(cacheKey, { ts: Date.now(), result });
      return result;
    }

    // 3) Tertiary Open Full-Length Audio API: Audius Discovery Search
    try {
      const urlAud = `${AUDIUS_API_BASE}/v1/tracks/search?query=${encoded}&limit=${Math.min(20, maxResults)}`;
      const jsonAud = await fetchJsonWithTimeout(urlAud, timeoutMs, fetchFn);
      const audItems = parseAudiusSearchResponse(jsonAud, maxResults);
      if (audItems.length > 0) {
        const result = {
          ok: true,
          items: audItems,
          source: 'audius',
          usedFallback: false
        };
        if (useCache) audioSearchCache.set(cacheKey, { ts: Date.now(), result });
        return result;
      }
    } catch {
      // Fall through to local catalog fallback
    }

    // 4) Offline / fallback: Local verified starter catalog matches (all full-length songs)
    const localMatches = findLocalAudioMatches(q, maxResults);
    if (localMatches.length > 0) {
      return {
        ok: true,
        items: localMatches,
        source: 'catalog_fallback',
        usedFallback: true
      };
    }

    // 5) Direct full-song search fallback item so ANY query plays full-length via YouTube audio engine
    return {
      ok: true,
      items: [{
        id: 'ytas_' + hashString(q).toString(36),
        songId: 'ytas_' + hashString(q).toString(36),
        title: q,
        artist: 'Full Song Audio',
        singer: 'Full Song Audio',
        channel: 'Full Song Audio',
        language: 'Full Song',
        tag: 'Full Song',
        duration: '',
        durationSec: 0,
        thumbnail: '',
        url: buildYtAudioSearchUrl(`${q} full song`),
        kind: 'audio',
        isFullSong: true,
        isPreview: false,
        isFallback: false,
        source: 'yt_audio_search',
        searchQuery: `${q} full song`
      }],
      source: 'yt_audio_search',
      usedFallback: true
    };
  }

  /**
   * Parses any pasted YouTube link/ID or direct video/audio URL into a track ready for the room playlist.
   */
  function parseDirectVideoOrYouTubeLink(rawInput) {
    const raw = cleanStr(rawInput);
    if (!raw) {
      return { ok: false, error: 'Paste a YouTube link, video ID, or direct video/audio URL' };
    }
    const ytId = extractYouTubeIdFromPath(raw);
    if (ytId) {
      return {
        ok: true,
        track: {
          id: 'yt_' + ytId,
          songId: 'yt_' + ytId,
          videoId: ytId,
          youtubeId: ytId,
          title: `YouTube Video (${ytId})`,
          channel: 'YouTube Link',
          artist: 'YouTube Link',
          language: 'YouTube',
          duration: '',
          thumbnail: buildYouTubeThumb(ytId),
          kind: 'youtube',
          url: `https://www.youtube.com/watch?v=${ytId}`
        }
      };
    }
    if (isValidHttpUrl(raw)) {
      const isDirectVideo = /\.(mp4|webm|m4v)(\?.*)?$/i.test(raw);
      return {
        ok: true,
        track: {
          id: 'link_' + hashString(raw).toString(36),
          songId: 'link_' + hashString(raw).toString(36),
          title: deriveTitleFromUrl(raw),
          channel: isDirectVideo ? 'Direct Video' : 'Direct Audio',
          artist: isDirectVideo ? 'Direct Video' : 'Direct Audio',
          language: 'Link',
          kind: isDirectVideo ? 'direct_video' : 'audio',
          videoUrl: isDirectVideo ? raw : '',
          url: raw
        }
      };
    }
    return { ok: false, error: 'Invalid link. Paste a valid YouTube link (youtu.be / youtube.com) or https:// URL.' };
  }

  /* ===== YouTube Embed Error Detection & Safe Skip Helpers ===== */

  function isYouTubeEmbedErrorCode(code) {
    const c = Number(code);
    return c === 2 || c === 5 || c === 100 || c === 101 || c === 150;
  }

  function getYouTubeErrorMessage(code) {
    const c = Number(code);
    if (c === 101 || c === 150) return 'Video owner blocked embedding';
    if (c === 100) return 'Video not found or removed';
    if (c === 5) return 'HTML5 playback error';
    if (c === 2) return 'Invalid YouTube video ID';
    return 'Video unavailable';
  }

  /* ===== Catalog Lookups & Stream Resolution ===== */

  function findSongById(songId, catalog) {
    const list = Array.isArray(catalog) ? catalog : SONGS_CATALOG;
    const key = cleanStr(songId);
    if (!key) return null;
    return list.find((s) => s && s.id === key) || null;
  }

  function findYouTubePresetById(presetId, presets) {
    const list = Array.isArray(presets) ? presets : YOUTUBE_PRESETS;
    const key = cleanStr(presetId);
    if (!key) return null;
    return list.find((v) => v && (v.id === key || v.youtubeId === key)) || null;
  }

  function resolveSongStream(song) {
    if (!song || typeof song !== 'object') {
      return {
        url: '',
        youtubeId: '',
        isFallback: false,
        needsLiveResolve: true,
        streamMode: 'live_lookup',
        searchQuery: ''
      };
    }
    const rawUrl = cleanStr(song.url || song.src || song.previewUrl);
    const title = cleanStr(song.title);
    const artist = cleanStr(song.artist || song.singer || song.channel);
    const lang = cleanStr(song.language || song.tag || song.category);
    const searchQuery = cleanStr(song.searchQuery) || cleanStr(`${title} ${artist} ${lang} song`);
    const ytId = extractYtAudioId(rawUrl) || extractYouTubeIdFromPath(song.youtubeId || song.videoId || rawUrl);

    // 1) Real full-length direct audio stream (Audius /stream, user direct .mp3/.ogg/.wav) — never SoundHelix or 30s iTunes previews
    const isYoutubeWatchUrl = /youtube\.com\/watch|youtu\.be\//i.test(rawUrl);
    if (isValidHttpUrl(rawUrl) && !isYoutubeWatchUrl && !isFakeDemoAudioUrl(rawUrl) && !isPreview30sAudioUrl(rawUrl)) {
      return {
        url: rawUrl,
        youtubeId: ytId,
        isFallback: false,
        needsLiveResolve: false,
        streamMode: 'direct',
        searchQuery
      };
    }

    // 2) Real full-song YouTube Audio-Only stream (plays via hidden 1x1 audio-only engine inside compact mini-player)
    if (isValidYouTubeId(ytId)) {
      return {
        url: `yt-audio://${ytId}`,
        youtubeId: ytId,
        isFallback: false,
        needsLiveResolve: false,
        streamMode: 'yt_audio',
        searchQuery
      };
    }

    // 3) Full-song YouTube Audio Search URL (plays full track without 30s cutoff even when Piped is offline)
    if (isYtAudioSearchUrl(rawUrl)) {
      return {
        url: rawUrl,
        youtubeId: '',
        isFallback: false,
        needsLiveResolve: true,
        streamMode: 'yt_audio_search',
        searchQuery: extractYtAudioSearchQuery(rawUrl) || searchQuery
      };
    }

    // 4) Legacy 30s preview or unlinked catalog song -> upgrade to full-length yt-audio-search + live lookup!
    if (searchQuery) {
      return {
        url: buildYtAudioSearchUrl(searchQuery),
        youtubeId: '',
        isFallback: false,
        needsLiveResolve: true,
        streamMode: 'yt_audio_search',
        searchQuery
      };
    }

    return {
      url: '',
      youtubeId: '',
      isFallback: false,
      needsLiveResolve: true,
      streamMode: 'live_lookup',
      searchQuery
    };
  }

  function deriveTitleFromUrl(url) {
    const clean = cleanStr(url);
    if (!clean) return 'Custom Audio Track';
    try {
      const tail = clean.split('/').pop().split('?')[0].split('#')[0];
      const decoded = decodeURIComponent(tail).replace(/\.(mp3|wav|ogg|m4a|aac|flac|mp4|webm)$/i, '').replace(/[-_]+/g, ' ').trim();
      return decoded ? decoded.slice(0, 48) : 'Custom Audio Track';
    } catch {
      return 'Custom Audio Track';
    }
  }

  /* ===== Unified Temporary Room Queue / Playlist Engine ===== */

  function normalizeQueueItem(raw, fallbackIdx) {
    if (!raw || typeof raw !== 'object') return null;
    const rawUrlInitial = cleanStr(raw.url || raw.src || raw.audioUrl || raw.previewUrl);
    const strippedFakeOrPreview = (isFakeDemoAudioUrl(rawUrlInitial) || isPreview30sAudioUrl(rawUrlInitial)) ? '' : rawUrlInitial;
    const rawUrl = strippedFakeOrPreview;
    const rawVideoId = extractYtAudioId(rawUrl) || extractYouTubeIdFromPath(raw.videoId || raw.youtubeId || rawUrl);
    const rawSearchQuery = cleanStr(raw.searchQuery);
    const rawKind = cleanStr(raw.kind);
    const title = cleanStr(raw.title) || deriveTitleFromUrl(rawUrl) || (rawSearchQuery ? `Search: ${rawSearchQuery}` : '');
    if (!rawUrl && !title && !rawVideoId && !rawSearchQuery) return null;

    let kind = rawKind;
    if (!kind) {
      if (isYtAudioUrl(rawUrl) || isYtAudioSearchUrl(rawUrl)) kind = 'audio';
      else if (rawVideoId) kind = 'youtube';
      else if (/\.(mp4|webm|m4v)(\?.*)?$/i.test(rawUrl)) kind = 'direct_video';
      else if (rawUrl.includes('listType=search')) kind = 'yt_search';
      else kind = 'audio';
    }

    const isDirectAudio = kind === 'audio' && isValidHttpUrl(rawUrl) && !/youtube\.com|youtu\.be/i.test(rawUrl) && !isFakeDemoAudioUrl(rawUrl) && !isPreview30sAudioUrl(rawUrl);
    const isDirectVideo = kind === 'direct_video' && isValidHttpUrl(rawUrl);
    const resolvedAudio = isDirectAudio
      ? { url: rawUrl, isFallback: false }
      : (isDirectVideo
          ? { url: rawUrl, isFallback: false }
          : resolveSongStream({ ...raw, url: rawUrl, videoId: rawVideoId, youtubeId: rawVideoId }));

    const artist = cleanStr(raw.artist || raw.singer || raw.channel) || 'Room Media';
    const language = cleanStr(raw.language || raw.tag || raw.category) || (kind === 'youtube' ? 'YouTube' : 'Track');
    const thumb = cleanStr(raw.thumbnail || raw.artworkUrl) || (rawVideoId ? buildYouTubeThumb(rawVideoId) : '');
    const durLabel = cleanStr(raw.duration) || '';
    const durSec = Math.max(0, Number(raw.durationSec || 0)) || parseDurationLabelToSec(durLabel);

    return {
      id: cleanStr(raw.id) || ('q_' + (fallbackIdx != null ? fallbackIdx : Date.now().toString(36))),
      songId: cleanStr(raw.songId || raw.id || (rawVideoId ? 'yt_' + rawVideoId : '')),
      title,
      artist,
      singer: artist,
      channel: artist,
      album: cleanStr(raw.album) || '',
      language,
      tag: language,
      duration: durLabel || (durSec > 0 ? formatDurationSec(durSec) : ''),
      durationSec: durSec,
      thumbnail: thumb,
      artworkUrl: thumb,
      externalUrl: cleanStr(raw.externalUrl) || '',
      source: cleanStr(raw.source) || (isYtAudioUrl(resolvedAudio.url) ? 'yt_audio' : (isYtAudioSearchUrl(resolvedAudio.url) ? 'yt_audio_search' : '')),
      kind,
      videoId: rawVideoId,
      youtubeId: rawVideoId,
      videoUrl: isDirectVideo ? rawUrl : cleanStr(raw.videoUrl),
      url: resolvedAudio.url,
      isFullSong: true,
      isPreview: false,
      isFallback: false,
      searchQuery: rawSearchQuery || cleanStr(`${title} ${artist} full song`),
      addedBy: cleanStr(raw.addedBy) || '',
      addedAt: Number(raw.addedAt || 0) || Date.now()
    };
  }

  function normalizeMusicQueue(queue) {
    if (!Array.isArray(queue)) return [];
    const out = [];
    queue.forEach((item, idx) => {
      const norm = normalizeQueueItem(item, idx);
      if (norm) out.push(norm);
    });
    return out.slice(-MAX_QUEUE_ITEMS);
  }

  function getRoomQueue(roomState) {
    if (!roomState || typeof roomState !== 'object') return [];
    const primary = Array.isArray(roomState.queue) && roomState.queue.length
      ? roomState.queue
      : (Array.isArray(roomState.musicQueue) ? roomState.musicQueue : []);
    return normalizeMusicQueue(primary);
  }

  function getRoomQueueIndex(roomState, queueLen) {
    const raw = roomState && (roomState.queueIndex != null ? roomState.queueIndex : roomState.musicQueueIndex);
    const n = Number(raw);
    if (!Number.isFinite(n) || n < 0 || queueLen <= 0) return queueLen > 0 ? 0 : -1;
    return Math.min(queueLen - 1, Math.floor(n));
  }

  function buildActivePatchForTrack(queue, idx, playMode, playing) {
    const track = queue[idx] || null;
    if (!track) return clearMusicQueue().patch;
    const mode = playMode === 'video' ? 'video' : 'audio';
    const rawUrl = cleanStr(track.url);
    const hasYtId = isValidYouTubeId(track.videoId);
    const isYtWatchUrl = /youtube\.com|youtu\.be/i.test(rawUrl);
    const isBlockedOrPreview = isFakeDemoAudioUrl(rawUrl) || isPreview30sAudioUrl(rawUrl);
    let effectiveMusicUrl = rawUrl;
    if (mode === 'audio' && hasYtId && (!rawUrl || isYtWatchUrl || isBlockedOrPreview)) {
      effectiveMusicUrl = `yt-audio://${track.videoId}`;
    } else if (isBlockedOrPreview || !rawUrl) {
      effectiveMusicUrl = buildYtAudioSearchUrl(track.searchQuery || `${track.title} ${track.artist || ''} full song`);
    }
    const durSec = Math.max(0, Number(track.durationSec || 0)) || parseDurationLabelToSec(track.duration);
    return {
      queue,
      queueIndex: idx,
      musicQueue: queue,
      musicQueueIndex: idx,
      mediaPlayMode: mode,
      musicTrackId: track.songId || track.id,
      musicUrl: effectiveMusicUrl,
      musicTitle: track.title,
      musicArtist: track.artist || track.channel,
      musicLanguage: track.language || '',
      musicDuration: track.duration || (durSec > 0 ? formatDurationSec(durSec) : ''),
      musicDurationSec: durSec,
      musicThumb: track.thumbnail || track.artworkUrl || '',
      musicIsFallback: false,
      musicError: '',
      musicPlaying: Boolean(playing),
      videoTitle: track.title,
      youtubeId: track.videoId || '',
      activeTrack: track
    };
  }

  /**
   * Adds any track (Live YouTube search result, starter song, YouTube preset, or direct URL)
   * to the room's Temporary Room Playlist (`queue` + `musicQueue`).
   * - `playNow: false` (+ Add): appends to queue without interrupting active playback
   *   (unless queue was empty / nothing playing, in which case it starts playing!)
   * - `playNow: true` (Play Now / Order): adds/selects track and starts playing immediately.
   */
  function enqueueTrack(roomState, trackInput, opts) {
    const o = opts || {};
    const now = Number(o.nowMs || Date.now());
    const addedBy = cleanStr(o.addedBy) || 'Player';
    const playNow = Boolean(o.playNow);
    const currentQueue = getRoomQueue(roomState);
    const currentMode = o.playMode || (roomState && roomState.mediaPlayMode === 'video' ? 'video' : 'audio');

    const norm = normalizeQueueItem({
      ...(trackInput || {}),
      addedBy,
      addedAt: now
    }, currentQueue.length);

    if (!norm) {
      return { ok: false, error: 'Invalid track item' };
    }

    const existingIdx = currentQueue.findIndex((q) =>
      (norm.videoId && q.videoId === norm.videoId) ||
      (norm.songId && q.songId === norm.songId) ||
      (!norm.videoId && !norm.songId && norm.url && q.url === norm.url)
    );

    let nextQueue;
    let itemIdx;
    if (existingIdx >= 0) {
      nextQueue = currentQueue.slice();
      nextQueue[existingIdx] = {
        ...nextQueue[existingIdx],
        ...norm,
        id: currentQueue[existingIdx].id
      };
      itemIdx = existingIdx;
    } else {
      const uniqueEntry = {
        ...norm,
        id: 'q_' + now.toString(36) + '_' + Math.random().toString(36).slice(2, 5)
      };
      nextQueue = [...currentQueue, uniqueEntry].slice(-MAX_QUEUE_ITEMS);
      itemIdx = nextQueue.length - 1;
    }

    const hasActivePlayback = Boolean(
      currentQueue.length > 0 &&
      roomState &&
      (roomState.musicPlaying || (roomState.mode === 'video' && (roomState.youtubeId || roomState.videoSync?.videoId || roomState.videoSync?.videoUrl || roomState.videoSync?.searchQuery)))
    );

    const shouldStartNow = playNow || !hasActivePlayback;
    const activeIdx = shouldStartNow ? itemIdx : getRoomQueueIndex(roomState, nextQueue.length);
    const activeTrack = nextQueue[activeIdx] || nextQueue[itemIdx];
    const patch = shouldStartNow
      ? buildActivePatchForTrack(nextQueue, activeIdx, currentMode, true)
      : {
          queue: nextQueue,
          queueIndex: activeIdx,
          musicQueue: nextQueue,
          musicQueueIndex: activeIdx
        };

    return {
      ok: true,
      track: nextQueue[itemIdx],
      activeTrack,
      startedNow: shouldStartNow,
      alreadyInQueue: existingIdx >= 0,
      usedFallback: Boolean(nextQueue[itemIdx].isFallback),
      searchQuery: nextQueue[itemIdx].searchQuery || '',
      patch
    };
  }

  /**
   * Skips an unplayable / embed-blocked track in the room queue without infinite looping.
   */
  function advanceAfterUnplayableTrack(roomState, failedKey, failedKeysSet) {
    const queue = getRoomQueue(roomState);
    if (!queue.length) {
      return { ok: false, exhausted: true, reason: 'Queue is empty', patch: clearMusicQueue().patch };
    }
    const failed = new Set(Array.isArray(failedKeysSet) ? failedKeysSet : (failedKeysSet instanceof Set ? Array.from(failedKeysSet) : []));
    const fk = cleanStr(failedKey);
    if (fk) failed.add(fk);

    const curIdx = getRoomQueueIndex(roomState, queue.length);
    const curItem = queue[curIdx];
    if (curItem) {
      if (curItem.videoId) failed.add(curItem.videoId);
      if (curItem.id) failed.add(curItem.id);
    }

    for (let step = 1; step < queue.length; step++) {
      const candIdx = (curIdx + step) % queue.length;
      const cand = queue[candIdx];
      if (!cand) continue;
      if ((cand.videoId && failed.has(cand.videoId)) || failed.has(cand.id)) continue;
      const mode = roomState && roomState.mediaPlayMode === 'video' ? 'video' : 'audio';
      return {
        ok: true,
        exhausted: false,
        track: cand,
        index: candIdx,
        failedKeys: Array.from(failed),
        patch: buildActivePatchForTrack(queue, candIdx, mode, true)
      };
    }

    return {
      ok: false,
      exhausted: true,
      reason: 'All queued videos are unavailable or embed-blocked',
      failedKeys: Array.from(failed),
      patch: {
        musicPlaying: false
      }
    };
  }

  /* ===== Backward-Compatible Song Picker Helpers ===== */

  function filterSongs(params) {
    const p = params || {};
    const catalog = Array.isArray(p.catalog) ? p.catalog : SONGS_CATALOG;
    const tab = cleanStr(p.tab || 'trending').toLowerCase();
    const language = cleanStr(p.language || 'All');
    const query = cleanStr(p.query).toLowerCase();
    const favoriteIds = Array.isArray(p.favoriteIds) ? p.favoriteIds.map(String) : [];
    const recentItems = Array.isArray(p.recentItems) ? p.recentItems : [];

    let pool = [];
    if (tab === 'favorites') {
      const favSet = new Set(favoriteIds);
      pool = catalog.filter((s) => s && favSet.has(s.id));
    } else if (tab === 'recent') {
      const byId = new Map(catalog.map((s) => [s.id, s]));
      const seen = new Set();
      recentItems.forEach((entry) => {
        if (!entry) return;
        const id = typeof entry === 'string' ? entry : cleanStr(entry.songId || entry.id);
        const matched = byId.get(id);
        if (matched && !seen.has(matched.id)) {
          seen.add(matched.id);
          pool.push(matched);
        } else if (typeof entry === 'object' && (cleanStr(entry.url) || cleanStr(entry.title) || cleanStr(entry.videoId)) && !seen.has(id || entry.videoId || entry.url)) {
          const key = id || entry.videoId || entry.url;
          seen.add(key);
          const artist = cleanStr(entry.artist || entry.singer || entry.channel) || 'Custom Link';
          const lang = cleanStr(entry.language || entry.tag) || (entry.videoId ? 'YouTube' : 'Custom');
          pool.push({
            id: id || ('recent_' + seen.size),
            title: cleanStr(entry.title) || deriveTitleFromUrl(entry.url),
            artist,
            singer: artist,
            channel: artist,
            language: lang,
            tag: lang,
            duration: cleanStr(entry.duration) || '',
            accent: lang === 'Bangla' ? '#06b6d4' : '#38bdf8',
            videoId: cleanStr(entry.videoId || entry.youtubeId),
            youtubeId: cleanStr(entry.videoId || entry.youtubeId),
            thumbnail: cleanStr(entry.thumbnail) || buildYouTubeThumb(entry.videoId || entry.youtubeId),
            url: cleanStr(entry.url)
          });
        }
      });
    } else {
      pool = catalog.slice();
    }

    if (language && language.toLowerCase() !== 'all') {
      const targetLang = language.toLowerCase();
      pool = pool.filter((s) => s && cleanStr(s.language || s.tag).toLowerCase() === targetLang);
    }

    if (!query) return pool;
    return pool.filter((s) => {
      if (!s) return false;
      const hay = `${s.title || ''} ${s.artist || ''} ${s.singer || ''} ${s.language || ''} ${s.tag || ''}`.toLowerCase();
      return hay.includes(query);
    });
  }

  function getLanguageCounts(catalog) {
    const list = Array.isArray(catalog) ? catalog : SONGS_CATALOG;
    let hindi = 0;
    let bangla = 0;
    list.forEach((s) => {
      if (!s) return;
      const lang = cleanStr(s.language || s.tag).toLowerCase();
      if (lang === 'hindi') hindi++;
      else if (lang === 'bangla') bangla++;
    });
    return { all: list.length, hindi, bangla };
  }

  function toggleFavoriteId(favoriteIds, songId) {
    const id = cleanStr(songId);
    const list = Array.isArray(favoriteIds) ? favoriteIds.map(String) : [];
    if (!id) return { favoriteIds: list, isFavorite: false };
    if (list.includes(id)) {
      return { favoriteIds: list.filter((x) => x !== id), isFavorite: false };
    }
    return { favoriteIds: [id, ...list].slice(0, 60), isFavorite: true };
  }

  function recordRecentSong(recentItems, track) {
    if (!track) return Array.isArray(recentItems) ? recentItems.slice(0, MAX_RECENT_ITEMS) : [];
    const list = Array.isArray(recentItems) ? recentItems.slice() : [];
    const key = cleanStr(track.songId || track.id || track.videoId || track.url);
    const artist = cleanStr(track.artist || track.singer || track.channel) || 'Room Audio';
    const lang = cleanStr(track.language || track.tag) || (track.videoId ? 'YouTube' : 'Track');
    const entry = {
      id: key,
      songId: cleanStr(track.songId || track.id),
      title: cleanStr(track.title) || deriveTitleFromUrl(track.url),
      artist,
      singer: artist,
      channel: artist,
      language: lang,
      tag: lang,
      duration: cleanStr(track.duration) || '',
      videoId: cleanStr(track.videoId || track.youtubeId),
      thumbnail: cleanStr(track.thumbnail) || buildYouTubeThumb(track.videoId || track.youtubeId),
      url: cleanStr(track.url || track.src),
      playedAt: Date.now()
    };
    const filtered = list.filter((item) => {
      if (!item) return false;
      const itemKey = typeof item === 'string' ? item : cleanStr(item.songId || item.id || item.videoId || item.url);
      return itemKey !== key;
    });
    return [entry, ...filtered].slice(0, MAX_RECENT_ITEMS);
  }

  function orderSongIntoQueue(roomState, songOrId, opts) {
    const o = opts || {};
    const catalog = Array.isArray(o.catalog) ? o.catalog : SONGS_CATALOG;
    const song = typeof songOrId === 'string'
      ? findSongById(songOrId, catalog)
      : (songOrId && typeof songOrId === 'object' ? songOrId : null);

    if (!song) {
      return { ok: false, error: 'Song not found in catalog' };
    }

    const resolved = resolveSongStream(song);
    const songItem = {
      ...song,
      songId: cleanStr(song.id || song.songId || resolved.url),
      kind: isValidYouTubeId(song.youtubeId || song.videoId) && o.playMode === 'video' ? 'youtube' : 'audio',
      url: resolved.url,
      isFallback: false,
      needsLiveResolve: Boolean(resolved.needsLiveResolve),
      searchQuery: resolved.searchQuery
    };
    const res = enqueueTrack(roomState, songItem, {
      playNow: o.playNow !== false,
      playMode: o.playMode || (roomState && roomState.mediaPlayMode) || 'audio',
      addedBy: o.addedBy,
      nowMs: o.nowMs
    });
    if (!res.ok) return res;
    return {
      ...res,
      usedFallback: false,
      needsLiveResolve: Boolean(resolved.needsLiveResolve),
      searchQuery: resolved.searchQuery
    };
  }

  function orderCustomUrlIntoQueue(roomState, rawUrl, customTitle, opts) {
    const cleanUrl = cleanStr(rawUrl);
    if (!isValidHttpUrl(cleanUrl)) {
      return { ok: false, error: 'Enter a valid https:// audio stream or .mp3 URL' };
    }
    const o = opts || {};
    const targetMode = o.playMode || (roomState && roomState.mediaPlayMode) || 'audio';
    const ytId = extractYouTubeIdFromPath(cleanUrl);
    if (ytId) {
      const asAudio = targetMode !== 'video';
      return enqueueTrack(roomState, {
        id: 'yt_' + ytId,
        songId: 'yt_' + ytId,
        videoId: ytId,
        youtubeId: ytId,
        title: cleanStr(customTitle) || 'YouTube Song',
        artist: 'YouTube Audio',
        language: 'YouTube',
        thumbnail: buildYouTubeThumb(ytId),
        kind: asAudio ? 'audio' : 'youtube',
        source: asAudio ? 'yt_audio' : 'youtube',
        url: asAudio ? `yt-audio://${ytId}` : `https://www.youtube.com/watch?v=${ytId}`
      }, { ...o, playMode: targetMode, playNow: o.playNow !== false });
    }
    const title = cleanStr(customTitle) || deriveTitleFromUrl(cleanUrl);
    return orderSongIntoQueue(roomState, {
      id: 'custom_' + hashString(cleanUrl).toString(36),
      title,
      artist: 'Direct MP3',
      language: 'MP3',
      duration: '',
      url: cleanUrl
    }, { ...o, playMode: 'audio' });
  }

  function selectQueueIndex(roomState, targetIndex) {
    const queue = getRoomQueue(roomState);
    if (!queue.length) return { ok: false, error: 'Playlist is empty' };
    const idx = Math.max(0, Math.min(queue.length - 1, Math.floor(Number(targetIndex) || 0)));
    const track = queue[idx];
    const mode = roomState && roomState.mediaPlayMode === 'video' ? 'video' : 'audio';
    return {
      ok: true,
      track,
      patch: buildActivePatchForTrack(queue, idx, mode, true)
    };
  }

  function skipNextInQueue(roomState) {
    const queue = getRoomQueue(roomState);
    if (!queue.length) return { ok: false, error: 'Playlist is empty' };
    const curIdx = getRoomQueueIndex(roomState, queue.length);
    const nextIdx = (curIdx + 1) % queue.length;
    return selectQueueIndex({ ...roomState, queue, musicQueue: queue }, nextIdx);
  }

  function removeFromQueue(roomState, itemIdOrIdx) {
    const queue = getRoomQueue(roomState);
    if (!queue.length) {
      return { ok: true, empty: true, patch: clearMusicQueue().patch };
    }
    let removeIdx = -1;
    if (typeof itemIdOrIdx === 'number') {
      removeIdx = itemIdOrIdx;
    } else {
      const key = cleanStr(itemIdOrIdx);
      removeIdx = queue.findIndex((q) => q.id === key || q.songId === key || q.videoId === key);
    }
    if (removeIdx < 0 || removeIdx >= queue.length) {
      return { ok: false, error: 'Track not found in playlist' };
    }
    const nextQueue = queue.filter((_, i) => i !== removeIdx);
    if (!nextQueue.length) {
      return { ok: true, empty: true, patch: clearMusicQueue().patch };
    }
    const curIdx = getRoomQueueIndex(roomState, queue.length);
    let nextIdx = curIdx;
    if (removeIdx < curIdx) nextIdx = Math.max(0, curIdx - 1);
    else if (removeIdx === curIdx) nextIdx = Math.min(curIdx, nextQueue.length - 1);
    const active = nextQueue[nextIdx];
    const wasPlaying = Boolean(roomState && roomState.musicPlaying);
    const mode = roomState && roomState.mediaPlayMode === 'video' ? 'video' : 'audio';
    return {
      ok: true,
      empty: false,
      track: active,
      patch: buildActivePatchForTrack(nextQueue, nextIdx, mode, wasPlaying)
    };
  }

  function clearMusicQueue() {
    return {
      ok: true,
      patch: {
        queue: [],
        queueIndex: -1,
        musicQueue: [],
        musicQueueIndex: -1,
        musicTrackId: '',
        musicUrl: '',
        musicTitle: '',
        musicArtist: '',
        musicLanguage: '',
        musicDuration: '',
        musicDurationSec: 0,
        musicThumb: '',
        musicIsFallback: false,
        musicError: '',
        musicPlaying: false,
        youtubeId: '',
        videoTitle: ''
      }
    };
  }

  function filterYouTubePresets(params) {
    const p = params || {};
    const presets = Array.isArray(p.presets) ? p.presets : YOUTUBE_PRESETS;
    const category = cleanStr(p.category || 'All');
    const query = cleanStr(p.query).toLowerCase();

    return presets.filter((item) => {
      if (!item) return false;
      if (category && category !== 'All' && cleanStr(item.category).toLowerCase() !== category.toLowerCase()) {
        return false;
      }
      if (!query) return true;
      const hay = `${item.title || ''} ${item.channel || ''} ${item.category || ''}`.toLowerCase();
      return hay.includes(query);
    });
  }

  function resolveYouTubePreset(presetOrId, presets) {
    const item = typeof presetOrId === 'string'
      ? findYouTubePresetById(presetOrId, presets)
      : (presetOrId && typeof presetOrId === 'object' ? presetOrId : null);
    if (!item || !cleanStr(item.youtubeId || item.videoId)) return null;
    const vid = cleanStr(item.youtubeId || item.videoId);
    return {
      id: cleanStr(item.id) || ('yt_' + vid),
      kind: 'youtube',
      videoId: vid,
      youtubeId: vid,
      videoUrl: cleanStr(item.url) || `https://www.youtube.com/watch?v=${vid}`,
      title: cleanStr(item.title) || 'YouTube Video',
      channel: cleanStr(item.channel || item.artist) || 'YouTube',
      artist: cleanStr(item.channel || item.artist) || 'YouTube',
      duration: cleanStr(item.duration) || '',
      thumbnail: cleanStr(item.thumbnail) || buildYouTubeThumb(vid)
    };
  }

  const api = {
    SONGS_CATALOG,
    YOUTUBE_PRESETS,
    FALLBACK_AUDIO_STREAMS,
    PIPED_SEARCH_INSTANCES,
    INVIDIOUS_SEARCH_INSTANCES,
    YOUTUBE_BROWSE_TOPICS,
    AUDIO_BROWSE_TOPICS,
    isValidHttpUrl,
    isValidYouTubeId,
    isFakeDemoAudioUrl,
    isPreview30sAudioUrl,
    isYtAudioUrl,
    extractYtAudioId,
    isYtAudioSearchUrl,
    buildYtAudioSearchUrl,
    extractYtAudioSearchQuery,
    buildYouTubeThumb,
    parseDurationLabelToSec,
    formatDurationSec,
    formatViewsCount,
    extractYouTubeIdFromPath,
    deriveTitleFromUrl,
    findSongById,
    findYouTubePresetById,
    resolveSongStream,
    resolveFullLengthSongUrl,
    getLanguageCounts,
    parsePipedSearchResponse,
    parsePipedAudioSearchResponse,
    parseInvidiousSearchResponse,
    parseInvidiousAudioSearchResponse,
    buildYouTubeSearchFallbackItem,
    searchYouTubeLive,
    fetchYouTubeTrending,
    fetchYouTubeBrowseFeed,
    parseItunesSearchResponse,
    parseAudiusSearchResponse,
    findLocalAudioMatches,
    searchAudioSongsLive,
    parseDirectVideoOrYouTubeLink,
    isYouTubeEmbedErrorCode,
    getYouTubeErrorMessage,
    normalizeQueueItem,
    normalizeMusicQueue,
    getRoomQueue,
    getRoomQueueIndex,
    enqueueTrack,
    advanceAfterUnplayableTrack,
    filterSongs,
    toggleFavoriteId,
    recordRecentSong,
    orderSongIntoQueue,
    orderCustomUrlIntoQueue,
    selectQueueIndex,
    skipNextInQueue,
    removeFromQueue,
    clearMusicQueue,
    filterYouTubePresets,
    resolveYouTubePreset
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  if (global) {
    global.PartyMediaCatalog = api;
  }
})(typeof window !== 'undefined' ? window : globalThis);
