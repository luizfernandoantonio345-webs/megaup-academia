import axios from 'axios'

// Token em memória — não acessível por XSS
let _token: string | null = null
export const setToken = (t: string) => { _token = t }
export const clearToken = () => { _token = null }

const PROD_URL = 'https://megaup-api.onrender.com'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || PROD_URL,
  timeout: 65_000,
  withCredentials: true, // envia cookie httpOnly cross-origin
})

api.interceptors.request.use((config) => {
  if (_token) config.headers.Authorization = `Bearer ${_token}`
  return config
})

// Fila de refreshes concorrentes — só 1 chamada em voo por vez
let _isRefreshing = false
let _refreshQueue: Array<{
  resolve: (v: unknown) => void
  reject: (e: unknown) => void
  config: typeof api.defaults
}> = []

function drainQueue(newToken: string | null, error: Error | null) {
  _refreshQueue.forEach(({ resolve, reject, config }) => {
    if (newToken) {
      // @ts-expect-error — config dinâmico do axios
      config.headers.Authorization = `Bearer ${newToken}`
      // @ts-expect-error
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

    // Cold-start: retry automático em 502/503 (exceto rotas de auth)
    const isColdStart =
      !err.response ||
      err.response.status === 503 ||
      err.response.status === 502
    const isAuthRoute = config.url?.startsWith('/auth/')

    if (isColdStart && !config._retried && !isAuthRoute) {
      config._retried = true
      await new Promise((r) => setTimeout(r, 8000))
      return api(config)
    }

    // 401 → tenta refresh pelo cookie httpOnly antes de redirecionar
    if (
      err.response?.status === 401 &&
      !config._refreshAttempted &&
      !config.url?.includes('/auth/')
    ) {
      if (_isRefreshing) {
        return new Promise((resolve, reject) => {
          _refreshQueue.push({
            resolve,
            reject,
            config: { ...config, _refreshAttempted: true },
          })
        })
      }

      _isRefreshing = true
      config._refreshAttempted = true

      try {
        const { data } = await api.post('/auth/refresh', {}, {
          // @ts-expect-error
          _refreshAttempted: true,
        })
        setToken(data.access_token)
        drainQueue(data.access_token, null)
        config.headers.Authorization = `Bearer ${data.access_token}`
        return api(config)
      } catch {
        clearToken()
        drainQueue(null, new Error('Session expired'))
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
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
