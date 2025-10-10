// sw.js — safe app-shell + PDF bypass
const CACHE = 'cascos-config-v5';
const CORE = [
  './',
  './index.html',
  './app.js',
  './models.json',
  './manifest.webmanifest',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => (k === CACHE ? null : caches.delete(k))))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  // Non GET? esci.
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // ---- BYPASS: PDF e file statici non vanno in fallback! ----
  const pathname = url.pathname || '';
  const isPDF = pathname.endsWith('.pdf');
  const isStaticAsset =
    /\.(?:js|css|png|jpg|jpeg|webp|svg|ico|json|webmanifest)$/.test(pathname) ||
    pathname.startsWith('/docs/') || pathname.startsWith('/ARMS_FILES/');

  if (isPDF || isStaticAsset) {
    // Vai in rete (con fallback cache se offline)
    e.respondWith(
      fetch(req).catch(() => caches.match(req))
    );
    return;
  }

  // ---- APP-SHELL per navigazioni HTML senza estensione ----
  const acceptHTML = req.headers.get('accept') || '';
  const isNavigate = req.mode === 'navigate' ||
    (acceptHTML.includes('text/html') && !pathname.split('/').pop().includes('.'));

  if (isNavigate && url.origin === location.origin) {
    e.respondWith(
      fetch('./index.html', { cache: 'no-cache' })
        .then(r => (r.ok ? r : caches.match('./index.html')))
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  // ---- Cache-first per il resto ----
  e.respondWith(
    caches.match(req).then(cached => cached || fetch(req).then(resp => {
      const copy = resp.clone();
      caches.open(CACHE).then(c => c.put(req, copy));
      return resp;
    }))
  );
});
