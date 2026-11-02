// 앱 껍데기를 기기에 저장해 두어 인터넷이 끊겨도 열리게 한다 (늘 인터넷의 새것을 먼저 받는다)
const CACHE = 'seam-v21';
const SHELL = ['./', 'index.html', 'css/app.css', 'js/app.js', 'manifest.webmanifest', 'images/logo.png', 'images/hero.jpg', 'images/icon-192.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL))); self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  if (new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(fetch(e.request).then(r => { const c = r.clone(); caches.open(CACHE).then(x => x.put(e.request, c)); return r; })
    .catch(() => caches.match(e.request)));
});
