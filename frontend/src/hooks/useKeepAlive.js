import { useEffect } from 'react'
import api from '../api/client'

// Pings /health every 4 min to keep the Render dyno warm (always-on, regardless of auth).
export function useKeepAlive() {
  useEffect(() => {
    const ping = () => api.get('/health').catch(() => {})
    ping()
    const id = setInterval(ping, 4 * 60 * 1000)
    return () => clearInterval(id)
  }, [])
}
