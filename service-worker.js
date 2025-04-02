const CACHE_NAME = "v1";
const urlsToCache = [
  "/",
  "/student.html",
  "/dashboard.html",
  "/tasks.html",
  "/profile.html",
  "/messages.html",
  "/student.css",
  "/task.css",
  "/messages.css",
  "/script.js",
  "/manifest.json",
  "/art-student-owl.jpg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.all(
        urlsToCache.map((url) => {
          console.log(`Fetching ${url}`);
          return fetch(url)
            .then((response) => {
              if (!response.ok) {
                throw new Error(`Failed to fetch ${url}: ${response.status}`);
              }
              return cache.put(url, response);
            })
            .catch((err) => {
              console.error(`Не вдалося кешувати ${url}:`, err);
              return Promise.resolve();
            });
        })
      );
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse.ok) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse.clone());
            });
          }
          return networkResponse;
        })
        .catch(() => {
          if (event.request.mode === "navigate") {
            return caches.match("/offline.html");
          }
          return new Response("Offline", { status: 503 });
        });
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => {
        return Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        );
      })
      .then(() => {
        console.log("Новий Service Worker активовано.");
        return self.clients.claim();
      })
  );
});
