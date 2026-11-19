const CACHE='fukuoka-teamlab-20261119-v1';
const FILES=['./','./index.html','./styles.css?v=teamlab20261119','./script.js?v=teamlab20261119','./trip-places.js?v=teamlab20261119','./trip-map.js?v=teamlab20261119','./trip-transport.js?v=teamlab20261119','./manifest.webmanifest','./icon.svg','./assets/fukuoka-hero.webp','./assets/ohori-fukuoka-castle.webp','./assets/itoshima.webp','./assets/mojiko-sarakura.webp','./assets/dazaifu.webp'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('fukuoka-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;
 if(event.request.mode==='navigate')event.respondWith(fetch(event.request).catch(()=>caches.match('./index.html')));
 else event.respondWith(caches.match(event.request).then(hit=>hit||fetch(event.request)));
});

