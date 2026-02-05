const CACHE = "cosmetic-ab-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./sw.js",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k !== CACHE ? caches.delete(k) : null)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((cached) => {
      return (
        cached ||
        fetch(e.request)
          .then((resp) => {
            // خزن ملفات الموقع فقط (نفس الدومين)
            try{
              const url = new URL(e.request.url);
              if (url.origin === location.origin) {
                const copy = resp.clone();
                caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(()=>{});
              }
            }catch{}
            return resp;
          })
          .catch(() => cached)
      );
    })
  );
});
