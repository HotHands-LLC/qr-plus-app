// Custom service worker additions
// next-pwa generates the main SW, this file adds custom logic

self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};
  const title = data.title || 'QR+';
  const options = {
    body: data.body || 'Agent response ready',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    data: data,
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(clients.openWindow(url));
});
