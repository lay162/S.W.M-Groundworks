// NFC Service Worker — forwards card detection to open tabs
self.addEventListener('install', function (event) {
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('message', function (event) {
  if (event.data && event.data.type === 'SWM_CARD_DETECTED') {
    event.waitUntil(handleCardDetection(event.data.url));
  }
});

function handleCardDetection(url) {
  return self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clients) {
    clients.forEach(function (client) {
      client.postMessage({ type: 'OPEN_SWM_CARD', url: url });
    });
  });
}
