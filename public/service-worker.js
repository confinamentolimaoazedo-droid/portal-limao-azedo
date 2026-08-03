const CACHE_NAME = 'portal-limao-azedo-v6-4';

const ARQUIVOS = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/push-client.js',
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
    caches.keys().then(function(keys) {
      return Promise.all(
        keys
          .filter(function(key) {
            return key !== CACHE_NAME;
          })
          .map(function(key) {
            return caches.delete(key);
          })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

self.addEventListener('push', function(event) {
  let data = {
    title: 'Limão Azedo Confinamento',
    body: 'Há uma atualização no seu lote.',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    url: '/'
  };

  try {
    if (event.data) {
      data = Object.assign(
        data,
        JSON.parse(event.data.text())
      );
    }
  } catch (error) {
    console.error('Push inválido:', error);
  }

  event.waitUntil(
    self.registration.showNotification(
      data.title,
      {
        body: data.body,
        icon: data.icon,
        badge: data.badge,
        tag: data.tag || 'limao-azedo',
        renotify: true,
        data: {
          url: data.url || '/'
        }
      }
    )
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  const targetUrl =
    event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then(function(windowClients) {
      for (const client of windowClients) {
        if ('focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }

      return clients.openWindow(targetUrl);
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
      .then(function(response) {
        if (response.ok) {
          const copy = response.clone();

          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(event.request, copy);
          });
        }

        return response;
      })
      .catch(function() {
        return caches.match(event.request);
      })
  );
});
