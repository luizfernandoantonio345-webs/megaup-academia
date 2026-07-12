import axios from 'axios'

// In-memory token — not accessible to XSS (no predictable storage key to steal)
// Lost on page reload; restored by the httpOnly refresh-token cookie via /auth/refresh
let _token = null
export function setToken(t) { _token = t }
export function clearToken() { _token = null }

const _PROD_URL = 'https://megaup-api.onrender.com'
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || _PROD_URL,
  timeout: 65_000,
  withCredentials: true,  // Send httpOnly refresh-token cookie cross-origin
})

api.interceptors.request.use((config) => {
  if (_token) config.headers.Authorization = `Bearer ${_token}`
  return config
})

// Concurrent 401s queue — only one refresh call in flight at a time
let _isRefreshing = false
let _refreshQueue = []

function _drainQueue(newToken, error) {
  _refreshQueue.forEach(({ resolve, reject, config }) => {
    if (newToken) {
      config.headers.Authorization = `Bearer ${newToken}`
      resolve(api(config))
    } else {
      reject(error)
    }
  })
  _refreshQueue = []
}

api.interceptors.response.use(
  (r) => r,
  async (err) => {
    const config = err.config

    // Cold-start retry — backend on Render free tier sleeps after 15 min
    // For network errors (no response at all), retry once for all routes including login
    // For 502/503, retry all non-refresh routes
    const noResponse = !err.response
    const isColdStart = noResponse || err.response.status === 503 || err.response.status === 502
    const isRefresh = config.url?.includes('/auth/refresh')
    if (isColdStart && !config._retried && !isRefresh) {
      config._retried = true
      await new Promise(r => setTimeout(r, 6000))
      return api(config)
    }

    // 401 → try to refresh access token using the httpOnly cookie before logging out
    if (err.response?.status === 401 && !config._refreshAttempted && !config.url?.includes('/auth/')) {
      if (_isRefreshing) {
        return new Promise((resolve, reject) => {
          _refreshQueue.push({ resolve, reject, config: { ...config, _refreshAttempted: true } })
        })
      }

      _isRefreshing = true
      config._refreshAttempted = true

      try {
        const { data } = await api.post('/auth/refresh', {}, { _refreshAttempted: true })
        setToken(data.access_token)
        _drainQueue(data.access_token, null)
        config.headers.Authorization = `Bearer ${data.access_token}`
        return api(config)
      } catch {
        clearToken()
        _drainQueue(null, new Error('Session expired'))
        if (!window.location.pathname.includes('/login')) {
          localStorage.removeItem('user')
          window.location.replace('/login')
        }
      } finally {
        _isRefreshing = false
      }
    }

    return Promise.reject(err)
  }
)

export default api
