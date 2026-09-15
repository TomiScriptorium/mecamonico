const CACHE_NAME = 'mecamonico-v2';
const urlsToCache = [
  './',
  './index.html',
  './iconomecamonico.png'
];

// Instala el Service Worker y guarda en caché los archivos básicos.
// skipWaiting() hace que la versión nueva del Service Worker tome el control
// de inmediato, sin esperar a que se cierren todas las pestañas abiertas.
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// Al activarse, borra cachés de versiones anteriores (ej. mecamonico-v1) y
// toma el control de las pestañas ya abiertas sin esperar a que se recarguen.
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(names =>
      Promise.all(names.filter(name => name !== CACHE_NAME).map(name => caches.delete(name)))
    ).then(() => self.clients.claim())
  );
});

// Red primero, caché como respaldo: siempre intenta traer la versión más
// nueva del servidor; si no hay internet, usa la última guardada en caché
// (y la actualiza) para que la app funcione sin conexión.
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
