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

      // Hard-reload com timestamp = força busca nova do HTML sem cache
      const url = new URL(window.location.href)
      if (!url.searchParams.get('_cr')) {
        url.searchParams.set('_cr', Date.now().toString())
        window.location.replace(url.toString())
      }
    }

    window.addEventListener('unhandledrejection', handleRejection)
    return () => window.removeEventListener('unhandledrejection', handleRejection)
  }, [])

  return null
}
