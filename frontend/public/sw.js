const CACHE = 'MegaUp-v3'
const STATIC = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.svg',
  '/icon-512.svg',
  '/favicon.svg',
]

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(STATIC)).then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (e) => {
  const { request } = e
  const url = new URL(request.url)

  if (request.method !== 'GET') return

  // Auth endpoints: always network, never serve stale credentials
  if (url.pathname.startsWith('/auth')) return

  // API calls: stale-while-revalidate — return cached instantly, update in background
  if (url.hostname.includes('onrender.com') || url.pathname.startsWith('/api')) {
    e.respondWith(
      caches.open(CACHE).then(async (cache) => {
        const cached = await cache.match(request)
        const netReq = fetch(request).then((res) => {
          if (res.ok) cache.put(request, res.clone())
          return res
        }).catch(() => cached)
        // Serve cached immediately; network updates cache in background
        return cached || netReq
      })
    )
    return
  }

  // YouTube thumbnails: cache first
  if (url.hostname.includes('img.youtube.com')) {
    e.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached
        return fetch(request).then((res) => {
          caches.open(CACHE).then((c) => c.put(request, res.clone()))
          return res
        })
      })
    )
    return
  }

  // JS/CSS assets (hashed filenames): cache first, update in background
  if (url.pathname.startsWith('/assets/')) {
    e.respondWith(
      caches.match(request).then((cached) => {
        const network = fetch(request).then((res) => {
          if (res.ok) caches.open(CACHE).then((c) => c.put(request, res.clone()))
          return res
        })
        return cached || network
      })
    )
    return
  }

  // Navigation: network first, fall back to cached index.html for SPA
  if (request.mode === 'navigate') {
    e.respondWith(
      fetch(request).catch(() => caches.match('/index.html'))
    )
    return
  }

  // Everything else: cache first, then network
  e.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request).then((res) => {
        if (res.ok) caches.open(CACHE).then((c) => c.put(request, res.clone()))
        return res
      })
      return cached || network
    })
  )
})

// ── Push notifications ──────────────────────────────────────────────────────

self.addEventListener('push', (event) => {
  if (!event.data) return

  let payload
  try { payload = event.data.json() }
  catch { payload = { titulo: 'MegaUp', corpo: event.data.text(), url: '/' } }

  event.waitUntil(
    self.registration.showNotification(payload.titulo || 'MegaUp', {
      body: payload.corpo || '',
      icon: '/icon-192.svg',
      badge: '/icon-192.svg',
      data: { url: payload.url || '/' },
      vibrate: [200, 100, 200],
      tag: 'MegaUp',
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url || '/'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if ('focus' in client) { client.navigate(url); return client.focus() }
      }
      if (clients.openWindow) return clients.openWindow(url)
    })
  )
})

