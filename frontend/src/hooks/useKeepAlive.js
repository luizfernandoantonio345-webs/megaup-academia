import { useEffect } from 'react'
import api from '../api/client'

// Pings /ping every 4 min to keep the Render free dyno warm.
export function useKeepAlive() {
  useEffect(() => {
    const ping = () => api.get('/ping').catch(() => {})
    const id = setInterval(ping, 4 * 60 * 1000)
    return () => clearInterval(id)
  }, [])
}
