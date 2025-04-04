const CACHE_NAME = "v2";
const ASSETS = [
  // Your app's assets
  "/",
  "/index.html",
  "/dashboard.html",
  "/messages.html",
  "/tasks.html",
  "/css/style.css",
  "/js/script.js",
  "/service-worker.js",
  "/icons/apple-touch-icon.png",
  "/icons/favicon-96x96.png",
  "/icons/favicon.ico",
  "/icons/favicon.svg",
  "/icons/site.webmanifest",
  "/manifest.json",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Only cache our own assets during install
      return cache
        .addAll(ASSETS)
        .then(() => console.log("App assets cached successfully"))
        .catch((err) => console.error("Failed to cache app assets:", err));
    })
  );
});

self.addEventListener("fetch", (event) => {
  // Skip non-HTTP requests (like chrome-extension:)
  if (!event.request.url.startsWith("http")) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Return cached response if found
      if (cachedResponse) {
        return cachedResponse;
      }

      // Otherwise fetch from network
      return fetch(event.request)
        .then((networkResponse) => {
          // Only cache successful responses from our origin
          if (
            networkResponse.ok &&
            networkResponse.url.startsWith(self.location.origin)
          ) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Fallback for failed requests
          if (event.request.headers.get("accept").includes("text/html")) {
            return caches.match("/index.html");
          }
          return new Response("Offline", { status: 503 });
        });
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
});
