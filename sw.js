/* Study Game — Lightweight PWA Service Worker
 * Safe for GitHub Pages subpath hosting, Firebase Auth/Firestore, and PWABuilder.
 * Never caches cross-origin Firebase/Google API requests or non-GET traffic.
 */
'use strict';

const CACHE_NAME = 'study-game-v7';
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
  './gamekit.css'
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

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      await Promise.allSettled(
        CORE_SHELL.map((asset) =>
          cache.add(new Request(asset, { cache: 'reload' })).catch(() => null)
        )
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
      caches.match(request).then((cached) => {
        const networkPromise = fetch(request)
          .then((response) => {
            if (response && response.ok && response.type === 'basic') {
              const copy = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)).catch(() => {});
            }
            return response;
          })
          .catch(() => cached || Response.error());
        return cached || networkPromise;
      })
    );
    return;
  }

  // Same-origin scripts, styles, JSON & subpages: Network-First with cache fallback
  // to avoid stale-cache bugs while keeping offline resilience.
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
        const exact = await caches.match(request);
        if (exact) return exact;
        const cleanUrl = url.origin + url.pathname;
        return (await caches.match(cleanUrl)) || Response.error();
      })
  );
});
