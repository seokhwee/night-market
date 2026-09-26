// 설치용 서비스 워커: 항상 최신 버전을 받도록 캐시하지 않고 네트워크로 그대로 보냄
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).pathname.startsWith('/ws')) return;
  e.respondWith(fetch(e.request).catch(() => new Response(
    '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width"><body style="background:#141a33;color:#efe9f7;font:16px sans-serif;display:grid;place-items:center;height:100vh;margin:0;text-align:center"><div>인터넷에 연결되어 있지 않아요<br><br><button onclick="location.reload()" style="font-size:16px;padding:10px 18px;border-radius:12px;border:0;background:#ffa24c">다시 시도</button></div>',
    { headers: { 'content-type': 'text/html; charset=utf-8' } })));
});
