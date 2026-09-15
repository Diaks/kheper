/* Kheper — service worker. Incrémente VERSION à chaque déploiement pour forcer la mise à jour du cache. */
const VERSION = 'kheper-v1.0.0';
const FORMS = ['00-base', '07-reveil', '14-degrossi', '21-affute', '30-homme', '60-eveil', '90-ascension', '120-ascension2', '180-tempete', '270-titan', '365-ultime'];
const ASSETS = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png', ...FORMS.map(f => `./img/${f}.webp`)];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;                       // PUT GitHub : jamais intercepté
  if (url.hostname === 'api.github.com') return;               // données : réseau seul
  // Polices Google : cache au premier chargement, puis cache d'abord
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(caches.open(VERSION + '-fonts').then(async c => { const hit = await c.match(e.request); if (hit) return hit;
      try { const r = await fetch(e.request); if (r.ok || r.type === 'opaque') c.put(e.request, r.clone()); return r; } catch (_) { return hit || Response.error(); } }));
    return;
  }
  if (url.origin !== location.origin) return;
  // Page et manifest : réseau d'abord (pour recevoir les mises à jour), cache en secours
  if (e.request.mode === 'navigate' || url.pathname.endsWith('index.html') || url.pathname.endsWith('manifest.json') || url.pathname.endsWith('/')) {
    e.respondWith(fetch(e.request).then(r => { caches.open(VERSION).then(c => c.put(e.request, r.clone())); return r; })
      .catch(() => caches.match(e.request).then(h => h || caches.match('./index.html'))));
    return;
  }
  // Images, icônes : cache d'abord
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(r => { if (r.ok) caches.open(VERSION).then(c => c.put(e.request, r.clone())); return r; })));
});
