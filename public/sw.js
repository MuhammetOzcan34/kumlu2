const CACHE_NAME = 'cam-kumlama-v4';
const urlsToCache = [
  '/'
];

// Install event
self.addEventListener('install', () => self.skipWaiting());

// Fetch event - Network first strategy
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests and manifest.json
  if (!event.request.url.startsWith(self.location.origin) || 
      event.request.url.includes('manifest.json')) {
    return;
  }
  
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // If network request is successful, cache and return response
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseClone);
            });
        }
        return response;
      })
      .catch(() => {
        // If network fails, try cache
        return caches.match(event.request);
      })
  );
});

// Activate event
self.addEventListener('activate', () => self.clients.claim());