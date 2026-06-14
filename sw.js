/* Service worker — L'Rénov Formations (PWA)
   Met en cache l'app pour le plein écran + le hors-ligne.
   Ne touche PAS aux requêtes cloud (autre origine) : elles passent directement. */
const CACHE = 'lrenov-formations-v1';
const ASSETS = [
  './',
  './index.html',
  './cockpit_formateur_IA_MutuelleDePoitiers.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // On ne gère que le même domaine en GET. Le cloud (Apps Script, autre origine) passe tel quel.
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  e.respondWith(
    caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
      return res;
    }).catch(() => caches.match('./index.html')))
  );
});
