const CACHE_NAME = "manganest-cache-v1";
const urlsToCache = [
  "./",
  "./index.html",
  "./home.css",
  "./home.js",
  "./logo.png",
  "./logo-192.png",
  "./logo-512.png",
  "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});