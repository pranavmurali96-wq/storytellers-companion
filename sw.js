// Storyteller's Companion service worker — the two-file build.
const CACHE = 'stc-pages-1q7d6xg';
const PRECACHE = ["./", "./index.html"];

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

// Answers for this app's own two files and nothing else — not another origin, not a poll to
// a room, not the icons. Everything else goes to the network untouched, and nothing is
// runtime-cached. R135: a worker that answered every GET from its cache froze nine phones
// on the first slice they ever saw.
const INDEX = new URL('./index.html', self.location).href;
const BASE = new URL('./', self.location).pathname;
const SHELL = new Set([BASE, INDEX].map((u) => new URL(u, self.location).pathname));

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
