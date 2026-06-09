self.addEventListener('push', event => {
  const data = event.data?.json() ?? {}
  event.waitUntil(
    self.registration.showNotification(data.title ?? 'Rotina', {
      body: data.body ?? 'Hora da sua atividade!',
      icon: '/icon-192.png',
      badge: '/icon-72.png',
      data: { url: data.url ?? '/dashboard' },
      actions: [
        { action: 'open', title: '✓ Ver' },
        { action: 'dismiss', title: 'Dispensar' }
      ]
    })
  )
})

self.addEventListener('notificationclick', event => {
  event.notification.close()
  if (event.action === 'dismiss') return
  event.waitUntil(clients.openWindow(event.notification.data?.url ?? '/dashboard'))
})

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', e => e.waitUntil(clients.claim()))
