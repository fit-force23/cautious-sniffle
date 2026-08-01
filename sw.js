/* BENCH125 Service Worker — PWAとして正式インストール可能にする + オフライン対応 */
const CACHE = "bench125-v12";
const CORE = ["./", "index.html", "manifest.json", "icon-192.png", "icon-512.png", "icon-180.png"];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(CORE)).catch(() => {}).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* ネットワーク優先(常に最新のアプリ・データを表示)、オフライン時はキャッシュから */
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request)
      .then(resp => {
        const copy = resp.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
        return resp;
      })
      .catch(() => caches.match(e.request).then(r => r || caches.match("index.html")))
  );
});
