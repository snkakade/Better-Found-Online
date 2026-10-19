const CACHE_NAME = "bfo-outreach-console-v2";
const STATIC_ASSETS = [
  "/console/assets/css/admin.css",
  "/console/assets/js/admin.js",
  "/console/assets/js/twilio.min.js",
  "/console/assets/vendor/phosphor/regular/style.css",
  "/console/assets/vendor/phosphor/regular/Phosphor.woff2",
  "/console/assets/vendor/phosphor/bold/style.css",
  "/console/assets/vendor/phosphor/bold/Phosphor-Bold.woff2",
  "/assets/fonts/Outfit.ttf",
  "/console/assets/images/icon-192.png",
  "/console/assets/images/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
    ))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== "GET" || url.pathname.startsWith("/api/") || request.mode === "navigate") {
    event.respondWith(fetch(request));
    return;
  }

  if (STATIC_ASSETS.includes(url.pathname)) {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request).then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        return response;
      }))
    );
  }
});
