// Storyteller's Companion service worker — offline-first, no network at runtime.
const CACHE = 'stc-cets1o';
const PRECACHE = [
  "./",
  "./apple-touch-icon.png",
  "./assets/death-day-DLxKfIEO.webp",
  "./assets/death-night-DnoEO8uB.webp",
  "./assets/hero-DWsh3r1K.webp",
  "./assets/index-UvSsN8AV.js",
  "./assets/index-WVK9nuA7.css",
  "./assets/playfair-display-700-latin-CuDiGg7c.woff2",
  "./assets/poster-frame-DZns2iko.webp",
  "./assets/square-day-BpwbzgNT.webp",
  "./assets/square-night-BeFJ0xKY.webp",
  "./assets/vellum-4D-bU_gT.webp",
  "./assets/win-evil-zD8CnHqU.webp",
  "./assets/win-good-CA1gaj1J.webp",
  "./favicon-32.png",
  "./fonts/OFL.txt",
  "./fonts/playfair-display-700-latin.woff2",
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
