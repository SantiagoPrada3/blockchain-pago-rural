// Service Worker para PWA
const CACHE_NAME = "pago-rural-v1";
const urlsToCache = [
  "/",
  "/inicio",
  "/pagar",
  "/contactos",
  "/historial",
  "/perfil",
  "pagorural.jpeg",
  "manifest.json",
];

// Instalación del service worker
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Activación del service worker
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Interceptar requests
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Devolver desde cache si existe
      if (response) {
        return response;
      }

      // Sino, hacer fetch normal
      return fetch(event.request).then((response) => {
        // Verificar si es una respuesta válida
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response;
        }

        // Clonar la respuesta
        const responseToCache = response.clone();

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      });
    })
  );
});

// Manejar notificaciones push (opcional)
self.addEventListener("push", (event) => {
  const options = {
    body: event.data ? event.data.text() : "Nueva notificación de Pago Rural",
    icon: "pagorural.jpeg",
    badge: "pagorural.jpeg",
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
  };

  event.waitUntil(self.registration.showNotification("Pago Rural", options));
});