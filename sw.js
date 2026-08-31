// Debe coincidir con el campo "sw" de version.json (ver _instrucciones_ia ahi mismo).
const CACHE_NAME = 'tinclass-v163';

// Archivos locales a cachear en la instalación
const STATIC_ASSETS = [
  '/index.html',
  '/styles.css',
  '/auth.css',
  '/app.js',
  '/auth.js',
  '/docx.js',
  '/firebase-config.js',
  '/error-reporter.js',
  '/LogoTinClass.png',
  '/manifest.json',
  '/reporte.html',
  '/denuncia.html',
  '/examen.html',
  '/alumno.html',
  '/padre.html'
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

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// ── Fetch: estrategia según el tipo de recurso ──────────────────────────────
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Solo interceptar GET sobre http/https
  if (request.method !== 'GET') return;
  if (!request.url.startsWith('http')) return;

  // version.json siempre debe venir de red para reflejar la versión publicada.
  if (url.pathname === '/version.json') {
    event.respondWith(fetch(request, { cache: 'no-store' }));
    return;
  }

  // Recursos externos (Firebase, EmailJS, etc.) → solo red
  if (NETWORK_ONLY_ORIGINS.some(origin => url.hostname.includes(origin))) {
    return;
  }

  // Google Fonts → stale-while-revalidate
  if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  // index.html / la navegación misma NUNCA debe salir de la caché HTTP del
  // navegador (ni de un CDN intermedio) -- si queda una copia vieja de
  // index.html, sus <script src="app.js?v=X.XX"> quedan apuntando a
  // versiones viejas aunque esos archivos SÍ tengan su propio cache-busting.
  // Visto en producción: un usuario seguía en v17.99 varios minutos después
  // de publicar v18.00. Mismo tratamiento que version.json, con fallback a
  // caché local solo si de verdad no hay red.
  if (url.pathname === '/index.html' || request.mode === 'navigate') {
    event.respondWith(networkFirstWithCacheFallback(request, true));
    return;
  }

  // Resto de assets locales → network-first con fallback a cache
  event.respondWith(networkFirstWithCacheFallback(request));
});

// ── Estrategias ──────────────────────────────────────────────────────────────
async function networkFirstWithCacheFallback(request, noStore = false) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const networkResponse = await fetch(request, noStore ? { cache: 'no-store' } : undefined);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;

    // Fallback final para navegación
    if (request.mode === 'navigate') {
      const cachedIndex = await cache.match('/index.html');
      if (cachedIndex) return cachedIndex;
      return new Response('<!DOCTYPE html><html><body>Sin conexión</body></html>', {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    }

    return new Response('', { status: 200 });
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
