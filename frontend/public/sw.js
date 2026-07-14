const CACHE = 'MegaUp-v9'
const STATIC = [
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

  // Next.js API routes: always network
  if (url.pathname.startsWith('/api')) return

  // API calls to onrender.com: stale-while-revalidate
  if (url.hostname.includes('onrender.com')) {
    e.respondWith(
      caches.open(CACHE).then(async (cache) => {
        const cached = await cache.match(request)
        const netReq = fetch(request).then((res) => {
          if (res.ok) {
            const clone = res.clone()
            cache.put(request, clone)
          }
          return res
        }).catch(() => cached || new Response('', { status: 503 }))
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
          if (res.ok) {
            const clone = res.clone()
            caches.open(CACHE).then((c) => c.put(request, clone))
          }
          return res
        })
      })
    )
    return
  }

  // Next.js static assets (hashed filenames): cache first, immutable
  if (url.pathname.startsWith('/_next/static/')) {
    e.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached
        return fetch(request).then((res) => {
          if (res.ok) {
            const clone = res.clone()
            caches.open(CACHE).then((c) => c.put(request, clone))
          }
          return res
        })
      })
    )
    return
  }

  // Static public assets (icons, manifest): cache first
  if (STATIC.some((s) => url.pathname === s)) {
    e.respondWith(
      caches.match(request).then((cached) => cached || fetch(request))
    )
    return
  }

  // Navigation: always network in Next.js (SSR handles routing)
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
