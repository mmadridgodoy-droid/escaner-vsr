const C='vsr-v6';
const A=['./','./index.html','./manifest.webmanifest'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(A)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()));});
self.addEventListener('message',e=>{if(e.data==='skip')self.skipWaiting();});
self.addEventListener('fetch',e=>{
  const req=e.request; const u=new URL(req.url);
  if(u.origin!==location.origin) return;
  const isDoc = req.mode==='navigate' || u.pathname.endsWith('/') || u.pathname.endsWith('index.html') || u.pathname.endsWith('manifest.webmanifest') || u.pathname.endsWith('sw.js');
  if(isDoc){
    // network-first: si hay internet, siempre trae lo último; si no, usa caché
    e.respondWith(fetch(req).then(resp=>{const cp=resp.clone();caches.open(C).then(c=>c.put(req,cp));return resp;}).catch(()=>caches.match(req).then(r=>r||caches.match('./index.html'))));
  } else {
    e.respondWith(caches.match(req).then(r=>r||fetch(req).then(resp=>{const cp=resp.clone();caches.open(C).then(c=>c.put(req,cp));return resp;}).catch(()=>caches.match('./index.html'))));
  }
});
