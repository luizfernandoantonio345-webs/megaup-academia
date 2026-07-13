'use client'
import { useEffect } from 'react'

export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((reg) => {
        // Auto-update: check for new SW version in background every 60 min
        setInterval(() => reg.update(), 60 * 60 * 1000)
      })
      .catch(() => {})
  }, [])
  return null
}
