const CACHE_NAME = 'techprimesolucoes-orcamento-v1';
const urlsToCache = [
 '/',
 '/index.html',
 '/style.css',
 '/app.js'
];

// Instalação: guarda os arquivos no cache
self.addEventListener('install', event => {
 event.waitUntil(
 caches.open(CACHE_NAME)
 .then(cache => cache.addAll(urlsToCache))
 );
});

// Fetch: serve do cache quando offline
self.addEventListener('fetch', event => {
 event.respondWith(
 caches.match(event.request)
 .then(response => response || fetch(event.request))
 );
});
