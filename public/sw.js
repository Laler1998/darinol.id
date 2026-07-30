/**
 * Darinol.id service worker.
 *
 * Strategy is deliberately network-first for anything that can go stale — a news
 * reader showing yesterday's headlines is worse than one that fails loudly. The
 * cache exists to keep the app usable on a bad connection, not to serve old
 * content to someone who is online.
 *
 *   navigation  -> network first, fall back to cached shell
 *   /api/trends -> network first, fall back to the last successful response
 *   static      -> cache first (Next.js fingerprints these, so they never change)
 */
const VERSION = "v1";
const SHELL_CACHE = `darinol-shell-${VERSION}`;
const DATA_CACHE = `darinol-data-${VERSION}`;
const STATIC_CACHE = `darinol-static-${VERSION}`;
const CURRENT_CACHES = [SHELL_CACHE, DATA_CACHE, STATIC_CACHE];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(["/", "/site.webmanifest"]))
      // A failed precache must not block activation; runtime caching still works.
      .catch(() => undefined)
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => !CURRENT_CACHES.includes(key)).map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

function isStaticAsset(url) {
  return (
    url.pathname.startsWith("/_next/static/") ||
    /\.(?:png|jpg|jpeg|svg|ico|webp|avif|woff2?)$/.test(url.pathname)
  );
}

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);

  try {
    const response = await fetch(request);

    if (response && response.ok) {
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    const cached = await cache.match(request);

    if (cached) return cached;
    throw error;
  }
}

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);

  if (cached) return cached;

  const response = await fetch(request);

  if (response && response.ok) {
    const cache = await caches.open(cacheName);
    cache.put(request, response.clone());
  }

  return response;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Never touch other origins or the analytics beacon.
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/_vercel/")) return;

  if (request.mode === "navigate") {
    event.respondWith(
      networkFirst(request, SHELL_CACHE).catch(
        async () => (await caches.match("/")) ?? Response.error(),
      ),
    );
    return;
  }

  if (url.pathname.startsWith("/api/")) {
    event.respondWith(networkFirst(request, DATA_CACHE));
    return;
  }

  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
  }
});
