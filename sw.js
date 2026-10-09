const CACHE_NAME = 'tribuapp-v3';
const PRECACHE_URLS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Do not intercept non-GET or API or Supabase auth calls
  if (event.request.method !== 'GET' || url.pathname.startsWith('/api/') || url.origin !== location.origin) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // If network fails and it is navigation, return cached index.html
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      });

      return cachedResponse || fetchPromise;
    })
  );
});

// --- PUSH & NOTIFICATIONS MANAGEMENT VIA SERVICE WORKER ---

// Listen for incoming Push events (Web Push Protocol)
self.addEventListener('push', (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'Tribuapp', body: event.data.text() };
    }
  } else {
    data = { title: 'Tribuapp', body: 'Novedades en tu tribu familiar' };
  }

  const title = data.title || '⛺ Tribuapp Familiar';
  const options = {
    body: data.body || 'Tienes tareas pendientes o novedades en el menú.',
    icon: data.icon || './icon-192.png',
    badge: data.badge || './icon-192.png',
    vibrate: [120, 60, 120],
    data: {
      url: data.url || './',
      view: data.view || 'dashboard',
      timestamp: Date.now()
    },
    tag: data.tag || 'tribuapp-notification',
    renotify: true
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Handle notification click: focus app window and route to the corresponding view
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetView = event.notification.data?.view || 'dashboard';
  const targetUrl = event.notification.data?.url || './';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          if (targetView && 'postMessage' in client) {
            client.postMessage({ type: 'NAVIGATE_VIEW', targetView });
          }
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// Listen for messages from client page to show a notification via Service Worker
self.addEventListener('message', (event) => {
  if (!event.data) return;

  if (event.data.type === 'SHOW_NOTIFICATION') {
    const { title, options = {} } = event.data;
    const notificationOptions = {
      icon: './icon-192.png',
      badge: './icon-192.png',
      vibrate: [100, 50, 100],
      ...options
    };
    event.waitUntil(
      self.registration.showNotification(title || '⛺ Tribuapp', notificationOptions)
    );
  }
});
