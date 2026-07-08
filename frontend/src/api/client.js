import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  timeout: 65_000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (r) => r,
  async (err) => {
    const config = err.config
    // Auto-retry once on network/timeout errors for non-auth endpoints
    if (!err.response && !config._retried && !config.url?.includes('/auth/')) {
      config._retried = true
      await new Promise(r => setTimeout(r, 5000))
      return api(config)
    }
    if (
      err.response?.status === 401 &&
      !window.location.pathname.includes('/login') &&
      !window.location.pathname.includes('/registro')
    ) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.replace('/login')
    }
    return Promise.reject(err)
  }
)

export default api
