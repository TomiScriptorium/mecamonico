const CACHE_NAME = 'mecamonico-v1';
const urlsToCache = [
  './',
  './index.html',
  './iconomecamonico.png'
];

// Instala el Service Worker y guarda en caché los archivos básicos
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Intercepta las peticiones para cargar la app sin internet
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response; // Devuelve la versión guardada si no hay internet
        }
        return fetch(event.request); // Si hay internet y pide algo nuevo, lo descarga
      })
  );
});