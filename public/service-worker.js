const CACHE_NAME = 'portal-limao-azedo-v6-2';

const ARQUIVOS = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/manifest.webmanifest',
  '/logo.png',
  '/icon-192.png',
  '/icon-512.png'
];

self.addEventListener('install', function(event) {
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(ARQUIVOS);
    })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(chaves) {
      return Promise.all(
        chaves
          .filter(function(chave) {
            return chave !== CACHE_NAME;
          })
          .map(function(chave) {
            return caches.delete(chave);
          })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function(event) {
  const url = new URL(event.request.url);

  if (
    event.request.method !== 'GET' ||
    url.pathname.startsWith('/api/')
  ) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(function(resposta) {
        const copia = resposta.clone();

        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(event.request, copia);
        });

        return resposta;
      })
      .catch(function() {
        return caches.match(event.request);
      })
  );
});
