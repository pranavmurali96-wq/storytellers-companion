// Storyteller's Companion service worker — offline-first, no network at runtime.
const CACHE = 'stc-pp7puj';
const PRECACHE = [
  "./",
  "./apple-touch-icon.png",
  "./assets/death-day-DLxKfIEO.webp",
  "./assets/death-night-DnoEO8uB.webp",
  "./assets/hero-DWsh3r1K.webp",
  "./assets/index-BRQ7rFUF.js",
  "./assets/index-DfjP3h7L.css",
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

// **This worker answers for the app's own shell and for nothing else.**
//
// It used to answer for every GET the page made, cache-first, with `ignoreSearch`, and
// runtime-cache whatever came back. That is fine for an app that never asks the network
// anything at runtime, which this was until the Automaton — and then it froze: nine phones
// polling a room got the first slice back for the whole night, countdown stuck at the
// second the worker first saw. `ignoreSearch` made it worse, because every poll matched
// the same cached entry whatever its query string said.
//
// So: same origin, in the precache list, or a navigation. Everything else goes to the
// network untouched, and nothing is ever runtime-cached.
const SHELL = new Set(PRECACHE.map((p) => new URL(p, self.location).pathname));
const INDEX = new URL('./index.html', self.location).href;
const BASE = new URL('./', self.location).pathname;

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return;
  const navigating = e.request.mode === 'navigate' && url.pathname.startsWith(BASE);
  if (!navigating && !SHELL.has(url.pathname)) return;
  e.respondWith(
    caches.match(navigating ? INDEX : e.request, { ignoreSearch: true }).then((hit) => {
      if (hit) return hit;
      return fetch(e.request).catch(() => caches.match(INDEX));
    }),
  );
});
