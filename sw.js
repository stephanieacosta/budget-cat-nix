// Service worker: permite usar la app sin internet.
// Para forzar que todos los dispositivos descarguen una versión nueva, cambia VERSION.
const VERSION = "budget-v4";

// Archivos que se guardan al instalar la app.
// Si añades un módulo nuevo dentro de src/, acuérdate de ponerlo aquí.
const CORE = [
  "/",
  "/index.html",
  "/manifest.webmanifest",

  "/src/styles/base.css",
  "/src/styles/theme-cats.css",
  "/src/assets/icon-192.png",
  "/src/assets/icon-512.png",

  "/src/app/main.js",
  "/src/app/render.js",
  "/src/app/events.js",

  "/src/config/index.js",
  "/src/config/constants.js",

  "/src/services/index.js",
  "/src/services/storage.js",
  "/src/services/state.js",
  "/src/services/i18n.js",
  "/src/services/format.js",
  "/src/services/categories.js",
  "/src/services/period.js",
  "/src/services/query.js",
  "/src/services/theme.js",
  "/src/services/rerender.js",

  "/src/shared/index.js",
  "/src/shared/dom.js",
  "/src/shared/ui.js",
  "/src/shared/static-text.js",

  "/src/features/index.js",
  "/src/features/home/index.js",
  "/src/features/home/home-view.js",
  "/src/features/transactions/index.js",
  "/src/features/transactions/transactions-view.js",
  "/src/features/transactions/transaction-form.js",
  "/src/features/stats/index.js",
  "/src/features/stats/stats-view.js",
  "/src/features/categories/index.js",
  "/src/features/categories/category-dialog.js",
  "/src/features/period/index.js",
  "/src/features/period/period-dialog.js",
  "/src/features/backup/index.js",
  "/src/features/backup/backup-dialog.js",
  "/src/features/settings/index.js",
  "/src/features/settings/settings-dialog.js",
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(VERSION)
      // addAll falla entero si un solo archivo falla: se guardan de uno en uno.
      .then(c => Promise.all(CORE.map(u => c.add(u).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
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
        .then(res => {
          const copy = res.clone();
          caches.open(VERSION).then(c => c.put("/index.html", copy));
          return res;
        })
        .catch(() => caches.match("/index.html"))
    );
    return;
  }

  const ours = url.origin === location.origin;
  const fonts = url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com";
  if (!ours && !fonts) return;

  // El código de la app: primero la red, para que una actualización entre
  // completa y no mezclada con módulos viejos de la caché.
  if (ours && (url.pathname.endsWith(".js") || url.pathname.endsWith(".css"))) {
    e.respondWith(
      fetch(req)
        .then(res => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(VERSION).then(c => c.put(req, copy));
          }
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  // Iconos y tipografías: copia guardada al instante, y se actualiza por detrás.
  e.respondWith(
    caches.match(req).then(hit => {
      const net = fetch(req)
        .then(res => {
          if (res.ok || res.type === "opaque") {
            const copy = res.clone();
            caches.open(VERSION).then(c => c.put(req, copy));
          }
          return res;
        })
        .catch(() => hit);
      return hit || net;
    })
  );
});
