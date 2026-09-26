// Service worker: app shell network-first (cai para o cache offline) + tiles/CDN com stale-while-revalidate.
const VERSION = 'acaimap-v1';
const SHELL = [
  './', 'index.html', 'manifest.webmanifest',
  'css/tokens.css', 'css/base.css', 'css/components.css', 'css/screens.css',
  'js/main.js', 'js/config.js', 'js/utils.js', 'js/store.js',
  'js/data/mock.js', 'js/data/repository.js', 'js/data/bairros-geo.js',
  'js/components/Icons.js', 'js/components/BottomNavigationBar.js', 'js/components/PillFilter.js',
  'js/components/IconStatRow.js', 'js/components/BatedorCard.js', 'js/components/BottomSheet.js',
  'js/components/AcaiMap.js', 'js/components/Charts.js', 'js/components/Common.js', 'js/components/FilterModal.js',
  'js/screens/ExplorarScreen.js', 'js/screens/MapaScreen.js', 'js/screens/BatedorScreen.js',
  'js/screens/BairrosScreen.js', 'js/screens/EstatisticasScreen.js',
  'data/dashboard_data.js',
  'assets/logo-mark.svg', 'assets/icons/icon-maskable.svg',
  ...[1, 2, 3, 4, 5, 6, 7, 8].map((n) => `assets/fotos/acai-0${n}.jpg`),
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  const { request } = e;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  if (url.origin === location.origin) {
    e.respondWith(
      fetch(request)
        .then((res) => {
          if (res.ok) { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(request, copy)); }
          return res;
        })
        .catch(() => caches.match(request, { ignoreSearch: true })),
    );
    return;
  }

  // Tiles do mapa, fontes e bibliotecas da CDN
  if (/tile\.openstreetmap\.org|cdnjs\.cloudflare\.com|fonts\.(googleapis|gstatic)\.com/.test(url.host)) {
    e.respondWith(
      caches.open(`${VERSION}-rt`).then(async (c) => {
        const hit = await c.match(request);
        const net = fetch(request)
          .then((res) => { if (res.ok || res.type === 'opaque') c.put(request, res.clone()); return res; })
          .catch(() => hit);
        return hit || net;
      }),
    );
  }
});
