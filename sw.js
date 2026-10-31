const CACHE_NAME = 'mecamonico-v3';
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

// Librerías que la app carga desde CDN (Tailwind, íconos, fuentes, etc.):
// se guardan para que la app abra sin conexión.
const CDN_HOSTS = [
  'cdn.tailwindcss.com',
  'cdnjs.cloudflare.com',
  'cdn.jsdelivr.net',
  'fonts.googleapis.com',
  'fonts.gstatic.com'
];

// Red primero, caché como respaldo: siempre intenta traer la versión más
// nueva del servidor; si no hay internet, usa la última guardada en caché
// (y la actualiza) para que la app funcione sin conexión.
// Solo se guardan los archivos de la app y de esas librerías (GET). Las
// llamadas a Supabase y a otros servicios pasan directo: así un envío fallido
// se reporta como error y los datos del taller no quedan guardados en caché.
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  const isApp = url.origin === self.location.origin;
  if (!isApp && !CDN_HOSTS.includes(url.hostname)) return;
  event.respondWith(
    fetch(request)
      .then(response => {
        // Las librerías llegan como respuestas "opaque" (sin CORS): igual se guardan.
        if (response.ok || response.type === 'opaque') {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});
