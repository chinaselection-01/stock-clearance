/* stock-clearance.ai service worker — app shell offline caching */
const CACHE = "sc-shell-v1";
const SHELL = [
  "/",
  "/index.html",
  "/styles.css",
  "/app.js",
  "/supabase-config.js",
  "/icon.svg",
  "/icon-maskable.svg"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // Supabase API + CDN: network-first, fall back to cache / shell
  if (url.hostname.endsWith("supabase.co") || url.hostname.includes("jsdelivr")) {
    event.respondWith(
      fetch(req).catch(() => caches.match(req).then(r => r || caches.match("/")))
    );
    return;
  }

  // Same-origin static assets: cache-first, then network, then shell
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(req).then(res =>
        res || fetch(req).then(resp => {
          const copy = resp.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
          return resp;
        }).catch(() => caches.match("/"))
      )
    );
  }
});
