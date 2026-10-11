// Service worker: permite usar la app sin internet.
// Para forzar que todos los dispositivos descarguen una versión nueva, cambia el número de VERSION.
const VERSION = "budget-v1";
const CORE = ["/", "/index.html", "/manifest.webmanifest", "/icon-192.png", "/icon-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // La página: primero la red (para recibir actualizaciones); sin internet, la copia guardada.
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req)
        .then(res => { const copy = res.clone(); caches.open(VERSION).then(c => c.put("/index.html", copy)); return res; })
        .catch(() => caches.match("/index.html"))
    );
    return;
  }

  // Archivos propios y tipografías: copia guardada al instante y se actualiza por detrás.
  const ok = url.origin === location.origin || url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com";
  if (!ok) return;
  e.respondWith(
    caches.match(req).then(hit => {
      const net = fetch(req)
        .then(res => { if (res.ok || res.type === "opaque") { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); } return res; })
        .catch(() => hit);
      return hit || net;
    })
  );
});
