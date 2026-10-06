// Explox service worker — makes repeat visits fast (the game is ~25 script files + music) by caching them in the browser.
//
//   * Game files (scripts, music, images, fonts under /play/):  STALE-WHILE-REVALIDATE — the cached copy is served instantly, and a fresh copy is
//     fetched in the background for next time. So an update always arrives on the next load, even if someone forgot to bump a ?v= on a script tag.
//   * The page itself (HTML):  NETWORK-FIRST — you always get the newest page when online, with the cached one only as an offline fallback.
//   * Anything else (the Explox server's /api calls, Stripe, other sites) is NOT touched.
//
// To force everyone onto a clean cache (e.g. after a bad deploy) bump CACHE below.
var CACHE = 'explox-play-v1';

self.addEventListener('install', function (e) { self.skipWaiting(); });
self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) { return Promise.all(keys.filter(function (k) { return k.indexOf('explox-play-') === 0 && k !== CACHE; }).map(function (k) { return caches.delete(k); })); })
      .then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return;                       // other sites / the game server: leave alone
  if (url.pathname.indexOf('/api/') !== -1) return;

  var isPage = req.mode === 'navigate' || /\.html?$/i.test(url.pathname) || url.pathname.slice(-1) === '/';
  if (isPage) {                                                          // network first, cache as an offline fallback
    e.respondWith(
      fetch(req).then(function (res) { var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(req, copy); }); return res; })
        .catch(function () { return caches.match(req); })
    );
    return;
  }
  if (!/\.(js|mp3|ogg|wav|png|jpg|jpeg|webp|gif|svg|woff2?|ttf|json)$/i.test(url.pathname)) return;
  e.respondWith(
    caches.open(CACHE).then(function (cache) {
      return cache.match(req).then(function (cached) {
        var fresh = fetch(req).then(function (res) { if (res && res.status === 200) cache.put(req, res.clone()); return res; }).catch(function () { return cached; });
        return cached || fresh;                                          // cached copy now; the network copy updates the cache for next time
      });
    })
  );
});
