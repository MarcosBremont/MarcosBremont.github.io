const CACHE_NAME = 'metabot-v1';

// Archivos locales a cachear en la instalación
const STATIC_ASSETS = [
  '/index.html',
  '/styles.css',
  '/auth.css',
  '/app.js',
  '/auth.js',
  '/docx.js',
  '/firebase-config.js',
  '/LogoMetabot.png',
  '/manifest.json'
];

// Dominios externos que se manejan solo con red (sin cache)
const NETWORK_ONLY_ORIGINS = [
  'firebaseapp.com',
  'googleapis.com',
  'firestore.googleapis.com',
  'identitytoolkit.googleapis.com',
  'securetoken.googleapis.com',
  'emailjs.com',
  'api.emailjs.com'
];

// ── Instalación: pre-cache de assets estáticos ──────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// ── Activación: elimina caches obsoletos ────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// ── Fetch: estrategia según el tipo de recurso ──────────────────────────────
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Solo interceptar GET sobre http/https
  if (request.method !== 'GET') return;
  if (!request.url.startsWith('http')) return;

  // Recursos externos (Firebase, EmailJS, etc.) → solo red
  if (NETWORK_ONLY_ORIGINS.some(origin => url.hostname.includes(origin))) {
    return;
  }

  // Google Fonts → stale-while-revalidate
  if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  // Navegación y assets locales → network-first con fallback a cache
  event.respondWith(networkFirstWithCacheFallback(request));
});

// ── Estrategias ──────────────────────────────────────────────────────────────
async function networkFirstWithCacheFallback(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    // Fallback final para navegación
    if (request.mode === 'navigate') {
      return cache.match('/index.html');
    }
    return new Response('Sin conexión', { status: 503 });
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request).then(response => {
    if (response.ok) cache.put(request, response.clone());
    return response;
  }).catch(() => null);
  return cached || fetchPromise;
}
