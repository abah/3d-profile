const CACHE = 'car-showroom-v3';

const SHELL = [
    './visualizer.html',
    './css/visualizer.css',
    './js/visualizer.js',
    './js/cars.js',
    './js/real-cars.js',
    './js/pwa.js',
    './manifest.webmanifest',
    './icons/icon-192.png',
    './icons/icon-512.png',
    './icons/icon-512-maskable.png',
    './icons/apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
    event.waitUntil((async () => {
        const cache = await caches.open(CACHE);
        await Promise.all(SHELL.map((url) => cache.add(url).catch(() => null)));
        await self.skipWaiting();
    })());
});

self.addEventListener('activate', (event) => {
    event.waitUntil((async () => {
        const keys = await caches.keys();
        await Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)));
        await self.clients.claim();
    })());
});

function isCdnAsset(url) {
    return (
        url.hostname.endsWith('jsdelivr.net') ||
        url.hostname.endsWith('googleapis.com') ||
        url.hostname.endsWith('gstatic.com')
    );
}

async function staleWhileRevalidate(request) {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(request);
    const network = fetch(request).then((response) => {
        if (response && response.ok) cache.put(request, response.clone());
        return response;
    }).catch(() => cached);
    return cached || network;
}

self.addEventListener('fetch', (event) => {
    const request = event.request;
    if (request.method !== 'GET') return;

    const url = new URL(request.url);

    if (request.mode === 'navigate') {
        event.respondWith((async () => {
            try {
                const fresh = await fetch(request);
                const cache = await caches.open(CACHE);
                cache.put('./visualizer.html', fresh.clone());
                return fresh;
            } catch {
                return (await caches.match('./visualizer.html')) || (await caches.match(request));
            }
        })());
        return;
    }

    if (url.origin === self.location.origin) {
        event.respondWith(staleWhileRevalidate(request));
        return;
    }

    if (isCdnAsset(url)) {
        event.respondWith(staleWhileRevalidate(request));
    }
});
