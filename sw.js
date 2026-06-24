/* Service worker — L'Rénov Formations (PWA)
   Stratégie : RÉSEAU D'ABORD pour les pages (HTML) -> tes mises à jour s'affichent
   toujours quand tu es en ligne ; repli sur le cache si hors-ligne.
   Cache-first uniquement pour le statique (icônes, manifest).
   Ne touche PAS aux requêtes cloud (autre origine) : elles passent directement. */
const CACHE = 'lrenov-formations-v3';
const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function isHTML(req, url){
  return req.mode === 'navigate' || req.destination === 'document' || url.pathname.endsWith('.html') || url.pathname.endsWith('/');
}

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return; // cloud & POST : tels quels

  if (isHTML(e.request, url)){
    // RÉSEAU D'ABORD : version fraîche si en ligne, sinon cache
    e.respondWith(
      fetch(e.request).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
        return res;
      }).catch(() => caches.match(e.request).then(hit => hit || caches.match('./index.html')))
    );
    return;
  }
  // STATIQUE : cache d'abord, sinon réseau (et on met en cache au passage)
  e.respondWith(
    caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
      return res;
    }).catch(() => undefined))
  );
});
