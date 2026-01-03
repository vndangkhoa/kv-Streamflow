const CACHE_NAME = 'kv-stream-v1';
const ASSETS = [
    '/',
    '/index.html',
    '/watch.html',
    '/styles/index.css',
    '/icons/icon-512.png'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => response || fetch(event.request))
    );
});
