import { useEffect } from 'react'
import api from '../api/client'

// Pings /health every 4 min to keep the Render dyno warm.
export function useKeepAlive(enabled = true) {
  useEffect(() => {
    if (!enabled) return
    const ping = () => api.get('/health').catch(() => {})
    ping()
    const id = setInterval(ping, 4 * 60 * 1000)
    return () => clearInterval(id)
  }, [enabled])
}
