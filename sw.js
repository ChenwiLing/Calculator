// 簡單版本：安裝時把核心資產加到快取；離線時優先回應快取
const CACHE = 'calc-pwa-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Cache-first；若離線無法取網路，至少回 index.html（適合單頁）
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // 對於導覽請求（使用者直接開頁/刷新），回 index.html 以支援離線
  if (req.mode === 'navigate') {
    event.respondWith(
      caches.match('./index.html').then(cached => cached || fetch(req))
    );
    return;
  }

  // 其他資源採用 cache-first
  event.respondWith(
    caches.match(req, { ignoreSearch: true }).then(cached => {
      return cached || fetch(req);
    })
  );
});
