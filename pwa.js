"use strict";
/* Study Game — PWA Service Worker Registration, In-App Install Prompt & Offline Indicator */
(function initStudyGamePWA() {
  let deferredPrompt = null;
  let installed = false;

  const isStandalone = () => {
    try {
      return (
        window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true
      );
    } catch {
      return false;
    }
  };

  const isIOS = () => {
    try {
      return /iphone|ipad|ipod/i.test(window.navigator.userAgent || '');
    } catch {
      return false;
    }
  };

  installed = isStandalone();

  function syncInstallUI() {
    const standalone = installed || isStandalone();
    const hdrBtn = document.getElementById('pwaInstallBtn');
    if (hdrBtn) {
      // Keep header clean: reveal compact install button only when native prompt is ready
      hdrBtn.hidden = standalone || !deferredPrompt;
    }
    const pfRow = document.getElementById('pfInstallRow');
    if (pfRow) {
      pfRow.hidden = standalone;
      const sub = pfRow.querySelector('[data-pwa-sub]');
      if (sub) {
        sub.textContent = deferredPrompt
          ? '1-tap install on your device'
          : isIOS()
            ? 'Add to Home Screen on iPhone / iPad'
            : 'Install Study Game as an app';
      }
    }
  }

  function syncOfflineUI() {
    const bar = document.getElementById('offlineBar');
    if (!bar) return;
    const offline = typeof navigator !== 'undefined' && navigator.onLine === false;
    bar.hidden = !offline;
  }

  function openInstallGuideModal() {
    if (typeof modal !== 'function') return;
    if (isIOS()) {
      modal(
        'Install on iPhone / iPad',
        `<div style="font-size:13.5px;line-height:1.55;color:var(--tx)">
          <p style="margin-bottom:8px">Install <b>Study Game</b> on your Home Screen for full-screen launch:</p>
          <ol style="padding-left:18px;display:flex;flex-direction:column;gap:6px;color:var(--mu)">
            <li>Tap the <b style="color:var(--tx)">Share</b> icon in Safari&rsquo;s toolbar.</li>
            <li>Scroll down and tap <b style="color:var(--tx)">Add to Home Screen</b>.</li>
            <li>Tap <b style="color:var(--tx)">Add</b> to finish.</li>
          </ol>
        </div>`
      );
    } else {
      modal(
        'Install Study Game',
        `<div style="font-size:13.5px;line-height:1.55;color:var(--tx)">
          <p style="margin-bottom:8px">Run <b>Study Game</b> as a standalone app on Android or Desktop:</p>
          <ol style="padding-left:18px;display:flex;flex-direction:column;gap:6px;color:var(--mu)">
            <li>Open your browser menu (<b style="color:var(--tx)">⋮</b> or address bar icon).</li>
            <li>Tap <b style="color:var(--tx)">Install app</b> or <b style="color:var(--tx)">Add to Home screen</b>.</li>
          </ol>
        </div>`
      );
    }
  }

  async function triggerInstall() {
    if (installed || isStandalone()) {
      if (typeof toast === 'function') toast('Study Game is already installed');
      syncInstallUI();
      return false;
    }
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice && choice.outcome === 'accepted') {
          installed = true;
          deferredPrompt = null;
          syncInstallUI();
          return true;
        }
      } catch {
        // Fallback to manual instructions if prompt cannot be shown
      }
      deferredPrompt = null;
      syncInstallUI();
      return false;
    }
    openInstallGuideModal();
    return false;
  }

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    syncInstallUI();
  });

  window.addEventListener('appinstalled', () => {
    installed = true;
    deferredPrompt = null;
    syncInstallUI();
    if (typeof toast === 'function') toast('Study Game installed!');
  });

  window.addEventListener('online', syncOfflineUI);
  window.addEventListener('offline', syncOfflineUI);

  function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) return;
    const isSecure =
      window.location.protocol === 'https:' ||
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1';
    if (!isSecure) return;
    try {
      navigator.serviceWorker
        .register('./sw.js', { scope: './' })
        .then((reg) => {
          if (reg && typeof reg.update === 'function') {
            reg.update().catch(() => {});
          }
        })
        .catch(() => {
          // Silently ignore SW registration errors in restricted WebViews
        });
    } catch {
      // Safe guard
    }
  }

  function bindHeaderInstallBtn() {
    const hdrBtn = document.getElementById('pwaInstallBtn');
    if (hdrBtn && !hdrBtn.dataset.pwaBound) {
      hdrBtn.dataset.pwaBound = '1';
      hdrBtn.addEventListener('click', triggerInstall);
    }
    syncInstallUI();
    syncOfflineUI();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindHeaderInstallBtn);
  } else {
    bindHeaderInstallBtn();
  }

  if (document.readyState === 'complete') {
    registerServiceWorker();
  } else {
    window.addEventListener('load', registerServiceWorker, { once: true });
  }

  window.PWA = {
    isStandalone,
    isIOS,
    isInstallable: () => !!deferredPrompt,
    triggerInstall,
    syncUI: () => {
      syncInstallUI();
      syncOfflineUI();
    },
  };
})();
