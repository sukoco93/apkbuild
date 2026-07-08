const CACHE_NAME = 'tokoku-v2';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-152.png',
  './icon-192.png',
  'https://cdn.jsdelivr.net/npm/vuetify@3.5.2/dist/vuetify.min.css',
  'https://cdn.jsdelivr.net/npm/@mdi/font@7.4.47/css/materialdesignicons.min.css',
  'https://unpkg.com/vue@3/dist/vue.global.js',
  'https://cdn.jsdelivr.net/npm/vuetify@3.5.2/dist/vuetify.min.js',
  'https://unpkg.com/dexie@latest/dist/dexie.js'
  'https://fonts.googleapis.com'
  'https://fonts.gstatic.com" crossorigin>
  'https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,300;14..32,400;14..32,600;14..32,700;14..32,800&display=swap" rel="stylesheet'
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css'
  'https://cdn.jsdelivr.net/npm/dayjs@1/dayjs.min.js'
  'https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js'
  'https://cdn.jsdelivr.net/npm/vue@2.7.16/dist/vue.min.js'
  'https://unpkg.com/dexie@4.0.8/dist/dexie.js'
];

// Install Service Worker
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Aktifkan & Bersihkan Cache Lama
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => { if(key !== CACHE_NAME) return caches.delete(key); })
    )).then(() => self.clients.claim())
  );
});

// Strategi Network First, Fallback to Cache (Biar aman dan tidak nge-bug teks mentah lagi)
self.addEventListener('fetch', e => {
  // Hanya tangani request HTTP/HTTPS (hindari chrome-extension atau content://)
  if (!e.request.url.startsWith('http')) return;

  e.respondWith(
    fetch(e.request)
      .then(response => {
        // Jika internet aman, klon hasilnya ke cache
        if (response.status === 200) {
          const resClone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, resClone));
        }
        return response;
      })
      .catch(() => {
        // Jika offline, ambil dari cache
        return caches.match(e.request).then(cachedResponse => {
          if (cachedResponse) return cachedResponse;
          // Jika mendarat di root path saat offline
          if (e.request.mode === 'navigate') return caches.match('./index.html');
        });
      })
  );
});
        // Jika tidak, fetch dari network dan cache dinamis
        return fetch(e.request).then((res) => {
          // Hanya cache response yang valid
          if (!res || res.status !== 200 || res.type !== 'basic') {
            return res;
          }
          const responseToCache = res.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, responseToCache);
          });
          return res;
        }).catch(() => {
          // Fallback offline (opsional)
          return new Response('Offline – tidak ada koneksi', { status: 503 });
        });
      })
  );
});
