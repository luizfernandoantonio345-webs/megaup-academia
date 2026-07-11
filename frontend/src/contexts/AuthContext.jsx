import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { login as apiLogin, registrarPersonal as apiRegistrar, meuPerfilAluno } from '../api'
import api, { setToken, clearToken } from '../api/client'

const AuthContext = createContext(null)

function parseUser() {
  try { return JSON.parse(localStorage.getItem('user')) } catch { return null }
}

export function AuthProvider({ children }) {
  // user info (name, role, etc.) still cached in localStorage for UX — no token stored there
  const [user, setUser] = useState(null)
  const [alunoId, setAlunoId] = useState(null)
  // authReady: true once we've attempted session restore — prevents redirect-to-login flash
  const [authReady, setAuthReady] = useState(false)

  // On mount: try to restore session from the httpOnly refresh-token cookie
  useEffect(() => {
    const cached = parseUser()
    if (!cached) { setAuthReady(true); return }

    api.post('/auth/refresh', {})
      .then(({ data }) => {
        setToken(data.access_token)
        setUser(cached)
        setAlunoId(cached.aluno_id ?? null)
      })
      .catch(() => {
        // Cookie expired or missing — clear stale user info, show login
        localStorage.removeItem('user')
      })
      .finally(() => setAuthReady(true))
  }, [])

  // When an aluno is logged in but aluno_id isn't stored yet, fetch it once
  useEffect(() => {
    if (user?.role === 'aluno' && !alunoId) {
      meuPerfilAluno()
        .then(({ data }) => {
          setAlunoId(data.id)
          const updated = { ...user, aluno_id: data.id }
          localStorage.setItem('user', JSON.stringify(updated))
          setUser(updated)
        })
        .catch(() => {})
    }
  }, [user?.role, alunoId])

  // Persist auth state after login/register/invite-accept
  const _persist = useCallback((data) => {
    setToken(data.access_token)           // access token → memory only
    const u = data.user
    localStorage.setItem('user', JSON.stringify(u))  // user info (no token) → localStorage
    setUser(u)
    setAlunoId(u.aluno_id ?? null)
    return u
  }, [])

  const login = useCallback(async (email, senha) => {
    const { data } = await apiLogin({ email, senha })
    return _persist(data)
  }, [_persist])

  const registrar = useCallback(async (payload) => {
    const { data } = await apiRegistrar(payload)
    return _persist(data)
  }, [_persist])

  const logout = useCallback(async () => {
    clearToken()
    localStorage.removeItem('user')
    setUser(null)
    setAlunoId(null)
    try { await api.post('/auth/logout') } catch { /* ignore network errors */ }
  }, [])

  const updateUser = useCallback((updates) => {
    setUser(prev => {
      const updated = { ...prev, ...updates }
      localStorage.setItem('user', JSON.stringify(updated))
      return updated
    })
  }, [])

  // Exposed so non-login flows (invite accept) can persist auth without extra API call
  const persistAuth = useCallback((data) => _persist(data), [_persist])

  return (
    <AuthContext.Provider value={{ user, alunoId, login, registrar, logout, updateUser, persistAuth, isAuthenticated: !!user, authReady }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
