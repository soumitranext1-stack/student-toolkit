/* Study Game — Lightweight PWA Service Worker
 * Safe for GitHub Pages subpath hosting, Firebase Auth/Firestore, and PWABuilder.
 * Never caches cross-origin Firebase/Google API requests or non-GET traffic.
 */
'use strict';

const CACHE_NAME = 'study-game-v10';
const CORE_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './favicon.svg',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-192.png',
  './icon-maskable-512.png',
  './apple-touch-icon.png',
  './style.css',
  './fx-pack.css',
  './gamekit.css',
  './sfx.js',
  './fx-avatars.js',
  './fx-frames.js',
  './core.js',
  './social.js',
  './party.js',
  './arena.js',
  './gifts.js',
  './firebase.js',
  './home.js',
  './games.js',
  './ranking.js',
  './tasks.js',
  './store.js',
  './chat.js',
  './profile.js',
  './pwa.js',
  './boot.js'
];

function shouldBypassRequest(request) {
  if (!request || request.method !== 'GET') return true;
  let url;
  try {
    url = new URL(request.url);
  } catch {
    return true;
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return true;
  // Strictly bypass all cross-origin traffic (Firebase Auth, Firestore, Google APIs, Fonts, CDNs)
  if (url.origin !== self.location.origin) return true;
  // Bypass Firebase reserved auth paths, API endpoints, and Vite dev internals
  const p = url.pathname;
  if (
    p.includes('/__/') ||
    p.startsWith('/api/') ||
    p.startsWith('/@vite') ||
    p.startsWith('/@fs') ||
    p.startsWith('/node_modules/') ||
    p.startsWith('/src/')
  ) {
    return true;
  }
  return false;
}

function isValidAssetResponse(request, response) {
  if (!response || !response.ok || response.type !== 'basic') return false;
  let pathname = '';
  try {
    pathname = new URL(request.url).pathname.toLowerCase();
  } catch {
    return false;
  }
  const ct = String(response.headers.get('content-type') || '').toLowerCase();
  const dest = request.destination || '';

  if (/\.(m?js)$/.test(pathname) || dest === 'script') {
    if (!ct || ct.includes('text/html')) return false;
    return ct.includes('javascript') || ct.includes('ecmascript');
  }
  if (/\.css$/.test(pathname) || dest === 'style') {
    if (!ct || ct.includes('text/html')) return false;
    return ct.includes('text/css');
  }
  if (/\.json$/.test(pathname)) {
    if (!ct || ct.includes('text/html')) return false;
    return ct.includes('json');
  }
  if (/\.(png|svg|ico|webp|jpg|jpeg)$/.test(pathname) || dest === 'image') {
    return !ct.includes('text/html');
  }
  return true;
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      await Promise.allSettled(
        CORE_SHELL.map(async (asset) => {
          try {
            const req = new Request(asset, { cache: 'reload' });
            const res = await fetch(req);
            if (isValidAssetResponse(req, res)) {
              await cache.put(req, res.clone());
            }
          } catch {
            // Skip unavailable optional asset without poisoning cache
          }
        })
      );
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

async function matchValidCachedAsset(request, url) {
  const exact = await caches.match(request);
  if (exact && isValidAssetResponse(request, exact)) return exact;
  const cleanUrl = url.origin + url.pathname;
  const clean = await caches.match(cleanUrl);
  if (clean && isValidAssetResponse(request, clean)) return clean;
  return null;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (shouldBypassRequest(request)) return;

  const url = new URL(request.url);
  const isImageAsset = /\.(png|svg|ico|webp|jpg|jpeg)$/i.test(url.pathname);

  // Navigation requests: Network-First so deployed updates appear immediately,
  // with clean offline fallback to cached app shell.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.ok && response.type === 'basic') {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)).catch(() => {});
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          const shell = await caches.match('./index.html');
          if (shell) return shell;
          return (await caches.match('./')) || Response.error();
        })
    );
    return;
  }

  // Static icon/image assets: Stale-While-Revalidate for crisp instant rendering.
  if (isImageAsset) {
    event.respondWith(
      matchValidCachedAsset(request, url).then((cached) => {
        const networkPromise = fetch(request)
          .then((response) => {
            if (isValidAssetResponse(request, response)) {
              const copy = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)).catch(() => {});
              return response;
            }
            return cached || response;
          })
          .catch(() => cached || Response.error());
        return cached || networkPromise;
      })
    );
    return;
  }

  // Same-origin scripts, styles, JSON & subpages: Network-First with MIME-validated cache fallback
  // so an HTML error/fallback page can never be cached or executed as JS/CSS.
  event.respondWith(
    fetch(request)
      .then(async (response) => {
        if (isValidAssetResponse(request, response)) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)).catch(() => {});
          return response;
        }
        const fallback = await matchValidCachedAsset(request, url);
        if (fallback) return fallback;
        // Never feed an HTML page to a <script> or <link rel="stylesheet"> tag
        if (/\.(m?js|css|json)$/i.test(url.pathname) || request.destination === 'script' || request.destination === 'style') {
          return Response.error();
        }
        return response;
      })
      .catch(async () => {
        const fallback = await matchValidCachedAsset(request, url);
        return fallback || Response.error();
      })
  );
});
