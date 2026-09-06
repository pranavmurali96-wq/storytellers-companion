// Storyteller's Companion service worker — offline-first, no network at runtime.
const CACHE = 'stc-1ltsat8';
const PRECACHE = [
  "./",
  "./apple-touch-icon.png",
  "./assets/hero-DWsh3r1K.webp",
  "./assets/index-BjyLcFJl.css",
  "./assets/index-vZ4RhNPi.js",
  "./favicon-32.png",
  "./icon-192.png",
  "./icon-512.png",
  "./index.html",
  "./manifest.webmanifest"
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
    ).then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then((hit) => {
      if (hit) return hit;
      return fetch(e.request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match('./index.html'));
    }),
  );
});
