const CACHE_VERSION = 'ember-home-shell-v1';
const APP_SHELL = [
  '/',
  '/manifest.webmanifest',
  '/icons/ember-home-icon.svg',
  '/icons/ember-home-icon-180.png',
  '/icons/ember-home-icon-192.png',
  '/icons/ember-home-icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key.startsWith('ember-home-') && key !== CACHE_VERSION)
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

function canCache(response) {
  if (!response || !response.ok || response.type === 'opaque') return false;
  return !response.headers.get('Cache-Control')?.includes('no-store');
}

async function networkFirstNavigation(request) {
  const cache = await caches.open(CACHE_VERSION);
  try {
    const response = await fetch(request);
    if (canCache(response)) {
      await cache.put('/', response.clone());
    }
    return response;
  } catch {
    return (await cache.match('/')) || Response.error();
  }
}

async function cacheFirstAsset(request) {
  const cache = await caches.open(CACHE_VERSION);
  const cached = await cache.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (canCache(response)) {
    await cache.put(request, response.clone());
  }
  return response;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return;

  if (request.mode === 'navigate') {
    event.respondWith(networkFirstNavigation(request));
    return;
  }

  if (['script', 'style', 'image', 'font', 'worker'].includes(request.destination)) {
    event.respondWith(cacheFirstAsset(request));
  }
});
