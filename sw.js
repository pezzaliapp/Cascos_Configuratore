// sw.js — PWA cache v5 (network-first per models.json)
const CACHE = 'cascos-config-v5';

// Asset statici da precache (non includere PDF/grandi file variabili)
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './app.js',
  './models.json',        // precached ma con network-first in fetch
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/maskable-192.png',
  './icons/maskable-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  const url = new URL(req.url);

  // Solo stessa origine
  if (url.origin !== location.origin) return;

  // 1) Network-first per models.json (così vedi sempre l’ultima versione)
  if (url.pathname.endsWith('/models.json')) {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const resClone = res.clone();
          caches.open(CACHE).then((c) => c.put(req, resClone));
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  // 2) Cache-first per il resto
  e.respondWith(
    caches.match(req).then((cached) => cached || fetch(req))
  );
});
