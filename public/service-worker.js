const CACHE_NAME = 'limao-azedo-v3-1-2';

const ARQUIVOS_ESTATICOS = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/logo.webp',
  '/icon-192.png',
  '/icon-512.png',
  '/preview-whatsapp.jpg',
  '/manifest.webmanifest'
];

self.addEventListener('install', function(evento) {
  evento.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(ARQUIVOS_ESTATICOS);
      })
      .then(function() {
        return self.skipWaiting();
      })
  );
});

self.addEventListener('activate', function(evento) {
  evento.waitUntil(
    caches.keys()
      .then(function(chaves) {
        return Promise.all(
          chaves
            .filter(function(chave) {
              return chave !== CACHE_NAME;
            })
            .map(function(chave) {
              return caches.delete(chave);
            })
        );
      })
      .then(function() {
        return self.clients.claim();
      })
  );
});

self.addEventListener('fetch', function(evento) {
  const requisicao = evento.request;
  const url = new URL(requisicao.url);

  if (
    requisicao.method !== 'GET' ||
    url.pathname.startsWith('/api/')
  ) {
    return;
  }

  if (
    requisicao.mode === 'navigate' ||
    url.pathname === '/app.js' ||
    url.pathname === '/style.css' ||
    url.pathname === '/index.html'
  ) {
    evento.respondWith(
      fetch(requisicao)
        .then(function(resposta) {
          const copia = resposta.clone();

          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(requisicao, copia);
          });

          return resposta;
        })
        .catch(function() {
          return caches.match(requisicao)
            .then(function(resposta) {
              return resposta || caches.match('/index.html');
            });
        })
    );

    return;
  }

  evento.respondWith(
    caches.match(requisicao)
      .then(function(respostaCache) {
        if (respostaCache) {
          return respostaCache;
        }

        return fetch(requisicao).then(function(respostaRede) {
          const copia = respostaRede.clone();

          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(requisicao, copia);
          });

          return respostaRede;
        });
      })
  );
});
