// sw.js — PWA cache v5 (network-first per models.json + SPA fallback)
const CACHE = 'cascos-config-v5';

// Asset statici da precache (evita PDF pesanti / file che cambiano spesso)
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './app.js',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/maskable-192.png',
  './icons/maskable-512.png',
  // Facoltativo ma utile: una prima copia di models.json senza querystring
  './models.json'
];

// ===== Install =====
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// ===== Activate =====
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k.startsWith('cascos-config-') && k !== CACHE)
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

// Utility: dice se la richiesta è per models.json (anche con querystring)
function isModelsJson(url) {
  // es: /subdir/models.json oppure /models.json
  return url.pathname.endsWith('/models.json');
}

// ===== Fetch =====
self.addEventListener('fetch', (e) => {
  const req = e.request;
  const url = new URL(req.url);

  // Solo stessa origine
  if (url.origin !== location.origin) return;

  // 0) Navigazioni: fallback SPA → index.html (cache-first)
  if (req.mode === 'navigate') {
    e.respondWith(
      caches.match('./index.html').then((cached) => cached || fetch('./index.html'))
    );
    return;
  }

  // 1) Network-first per models.json (ignora la querystring per la cache)
  if (isModelsJson(url)) {
    e.respondWith(
      (async () => {
        try {
          const netRes = await fetch(req, { cache: 'no-store' });
          // salviamo nella cache con URL senza query
          const cleanReq = new Request(url.origin + url.pathname);
          const c = await caches.open(CACHE);
          c.put(cleanReq, netRes.clone());
          return netRes;
        } catch (_) {
          // offline/errore → prova cache (ignoreSearch:true gestisce ?v=, ?t=)
          const cached = await caches.match(req, { ignoreSearch: true });
          if (cached) return cached;
          // come ultima spiaggia, un 503 con messaggio chiaro
          return new Response(
            JSON.stringify({ error: 'models.json non disponibile offline' }),
            { status: 503, headers: { 'Content-Type': 'application/json' } }
          );
        }
      })()
    );
    return;
  }

  // 2) Cache-first per il resto degli asset statici
  e.respondWith(
    caches.match(req).then((cached) => cached || fetch(req))
  );
});
