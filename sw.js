const CACHE_NAME = 'tribuapp-v13';
// Todas las navegaciones se guardan bajo esta única clave (sin query: los
// enlaces de invitación llevan tokens que no deben quedar en Cache Storage).
// Rutas relativas a la carpeta del SW: la app puede servirse en una subcarpeta (GitHub Pages).
const BASE_URL = new URL('./', self.location).href;
const SHELL_URL = BASE_URL + 'index.html';
const NETWORK_TIMEOUT_MS = 3500;
const PRECACHE_URLS = [
  'index.html',
  'style.css',
  'app.js',
  'register-sw.js',
  'vendor/supabase-js.mjs',
  'manifest.json',
  'icon-192.png',
  'icon-512.png',
  'icon-maskable.png',
  'apple-touch-icon.png'
].map((path) => BASE_URL + path);

// Tipo de contenido esperado según la extensión. Lo que no esté aquí no se cachea,
// y tampoco una respuesta cuyo content-type no coincida (p. ej. el fallback SPA
// que devuelve index.html con 200 para una ruta inexistente).
const EXPECTED_TYPES = {
  html: 'text/html',
  js: 'javascript',
  mjs: 'javascript',
  css: 'text/css',
  json: 'json',
  webmanifest: 'json',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  svg: 'image/svg+xml',
  ico: 'image/',
  webp: 'image/webp',
  woff2: 'font/woff2'
};

function expectedTypeFor(pathname) {
  const match = /\.([a-z0-9]+)$/i.exec(pathname);
  return match ? EXPECTED_TYPES[match[1].toLowerCase()] || null : null;
}

function isCacheable(response, expectedType) {
  if (!response || !response.ok || response.status !== 200 || response.type !== 'basic' || response.redirected) return false;
  if (!expectedType) return false;
  const contentType = (response.headers.get('content-type') || '').toLowerCase();
  return contentType.includes(expectedType);
}

// Copia sin la URL original (que podría llevar ?invite=...)
async function cleanCopy(response) {
  const body = await response.clone().blob();
  return new Response(body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers
  });
}

async function putInCache(key, response) {
  const cache = await caches.open(CACHE_NAME);
  await cache.put(key, await cleanCopy(response));
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all(PRECACHE_URLS.map(async (path) => {
      try {
        const response = await fetch(path, { cache: 'reload' });
        if (isCacheable(response, expectedTypeFor(path))) {
          await putInCache(path, response);
        } else {
          console.warn('[sw] No se precachea (respuesta inesperada):', path);
        }
      } catch (error) {
        console.warn('[sw] No se pudo precachear:', path, error);
      }
    })).then(() => self.skipWaiting())
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

// Red primero; si la red tarda más de NETWORK_TIMEOUT_MS o falla, caché.
// Si vence el plazo y no hay nada en caché, se sigue esperando a la red.
function networkFirst(request, cacheKey, expectedType) {
  return new Promise((resolve, reject) => {
    let settled = false;
    const finish = (response) => {
      if (!settled) {
        settled = true;
        resolve(response);
      }
    };

    const network = fetch(request).then((response) => {
      if (isCacheable(response, expectedType)) {
        putInCache(cacheKey, response).catch(() => {});
      }
      return response;
    });

    const timer = setTimeout(async () => {
      const cached = await caches.match(cacheKey);
      if (cached) finish(cached);
    }, NETWORK_TIMEOUT_MS);

    network.then((response) => {
      clearTimeout(timer);
      finish(response);
    }).catch(async (error) => {
      clearTimeout(timer);
      const cached = await caches.match(cacheKey);
      if (cached) finish(cached);
      else if (!settled) {
        settled = true;
        reject(error);
      }
    });
  });
}

async function cacheFirst(request, cacheKey, expectedType) {
  const cached = await caches.match(cacheKey);
  if (cached) return cached;
  const response = await fetch(request);
  if (isCacheable(response, expectedType)) {
    await putInCache(cacheKey, response).catch(() => {});
  }
  return response;
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Sólo GET del propio origen; nada de /api ni de otros orígenes (Supabase, etc.)
  if (request.method !== 'GET' || url.origin !== self.location.origin || url.pathname.startsWith('/api/')) {
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      networkFirst(new Request(request, { cache: 'reload' }), SHELL_URL, EXPECTED_TYPES.html)
    );
    return;
  }

  if (url.href === new URL('sw.js', BASE_URL).href) return;

  const expectedType = expectedTypeFor(url.pathname);
  if (!expectedType) return;

  // Clave sin query para no acumular variantes ni guardar parámetros
  const cacheKey = url.origin + url.pathname;
  if (expectedType.startsWith('image/') || expectedType.startsWith('font/')) {
    event.respondWith(cacheFirst(request, cacheKey, expectedType));
  } else {
    event.respondWith(networkFirst(new Request(request, { cache: 'no-cache' }), cacheKey, expectedType));
  }
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
  let targetUrl = './';
  try {
    const rawUrl = event.notification.data?.url || './';
    const parsed = new URL(rawUrl, self.location.origin);
    if (parsed.origin === self.location.origin) {
      targetUrl = parsed.href;
    }
  } catch {
    targetUrl = './';
  }

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
