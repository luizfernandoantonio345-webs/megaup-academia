'use client'

import { useEffect } from 'react'

export default function ChunkErrorHandler() {
  useEffect(() => {
    function handleRejection(event: PromiseRejectionEvent) {
      const reason = event.reason
      const msg: string = reason?.message ?? String(reason ?? '')

      const isChunkError =
        msg.includes('Failed to fetch dynamically imported module') ||
        msg.includes('Loading chunk') ||
        msg.includes('ChunkLoadError') ||
        reason?.name === 'ChunkLoadError'

      if (!isChunkError) return

      event.preventDefault()

      const key = 'chunk_reload_count'
      const count = parseInt(sessionStorage.getItem(key) || '0')
      if (count < 3) {
        sessionStorage.setItem(key, String(count + 1))
        window.location.reload()
      }
    }

    window.addEventListener('unhandledrejection', handleRejection)
    return () => window.removeEventListener('unhandledrejection', handleRejection)
  }, [])

  return null
}
