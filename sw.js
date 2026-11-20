// Swagat — SPM NIWAS Background Service Worker for Lock-Screen Gate Notifications
const CACHE_NAME = 'swagat-spm-niwas-v3';

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

// Handle OS Web Push payloads when app is completely closed
self.addEventListener('push', (event) => {
    let payload = {
        title: '🚪 Guest at Main Gate — Swagat',
        body: 'A walk-in visitor is waiting at SPM NIWAS Main Gate for your approval.',
        tag: 'swagat-gate-arrival'
    };
    try {
        if (event.data) {
            const parsed = event.data.json();
            payload = { ...payload, ...parsed };
        }
    } catch (e) {
        if (event.data) payload.body = event.data.text();
    }

    event.waitUntil(
        self.registration.showNotification(payload.title, {
            body: payload.body,
            tag: payload.tag,
            renotify: true,
            requireInteraction: true,
            vibrate: [300, 150, 300, 150, 450],
            data: { url: './' }
        })
    );
});

// Clicking the lock-screen notification opens or focuses the Swagat Host screen immediately
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const targetUrl = event.notification.data?.url || './';
    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            for (const client of clientList) {
                if ('focus' in client) {
                    return client.focus();
                }
            }
            if (self.clients.openWindow) {
                return self.clients.openWindow(targetUrl);
            }
        })
    );
});
