'use client'

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react'
import { login as apiLogin, registrarPersonal as apiRegistrar, meuPerfilAluno } from '@/lib/api-routes'
import api, { setToken, clearToken } from '@/lib/api'

// ── Types ─────────────────────────────────────────────────────────────────────
export interface User {
  id: number
  nome: string
  email: string
  role: 'admin_academia' | 'personal' | 'aluno'
  aluno_id?: number
  avatar_url?: string
  academia_nome?: string
  plano?: string
}

interface AuthState {
  user: User | null
  alunoId: number | null
  authReady: boolean
  isAuthenticated: boolean
  login: (email: string, senha: string) => Promise<User>
  registrar: (payload: Record<string, unknown>) => Promise<User>
  logout: () => Promise<void>
  updateUser: (updates: Partial<User>) => void
  persistAuth: (data: { access_token: string; user: User }) => User
}

// ── Context ───────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthState | null>(null)

function parseUser(): User | null {
  if (typeof window === 'undefined') return null
  try {
    return JSON.parse(localStorage.getItem('user') ?? 'null')
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [alunoId, setAlunoId] = useState<number | null>(null)
  const [authReady, setAuthReady] = useState(false)

  // Restaura sessão a partir do cookie httpOnly de refresh
  useEffect(() => {
    const cached = parseUser()
    if (!cached) {
      setAuthReady(true)
      return
    }
    api
      .post('/auth/refresh', {})
      .then(({ data }) => {
        setToken(data.access_token)
        setUser(cached)
        setAlunoId(cached.aluno_id ?? null)
      })
      .catch(() => {
        localStorage.removeItem('user')
      })
      .finally(() => setAuthReady(true))
  }, [])

  // Busca aluno_id se não estiver cacheado
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
  }, [user?.role, alunoId]) // eslint-disable-line react-hooks/exhaustive-deps

  const _persist = useCallback(
    (data: { access_token: string; user: User }): User => {
      setToken(data.access_token)
      const u = data.user
      localStorage.setItem('user', JSON.stringify(u))
      setUser(u)
      setAlunoId(u.aluno_id ?? null)
      return u
    },
    []
  )

  const login = useCallback(
    async (email: string, senha: string): Promise<User> => {
      const { data } = await apiLogin({ email, senha })
      return _persist(data)
    },
    [_persist]
  )

  const registrar = useCallback(
    async (payload: Record<string, unknown>): Promise<User> => {
      const { data } = await apiRegistrar(payload)
      return _persist(data)
    },
    [_persist]
  )

  const logout = useCallback(async () => {
    clearToken()
    localStorage.removeItem('user')
    setUser(null)
    setAlunoId(null)
    try {
      await api.post('/auth/logout')
    } catch {}
  }, [])

  const updateUser = useCallback((updates: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev
      const updated = { ...prev, ...updates }
      localStorage.setItem('user', JSON.stringify(updated))
      return updated
    })
  }, [])

  const persistAuth = useCallback(
    (data: { access_token: string; user: User }) => _persist(data),
    [_persist]
  )

  return (
    <AuthContext.Provider
      value={{
        user,
        alunoId,
        authReady,
        isAuthenticated: !!user,
        login,
        registrar,
        logout,
        updateUser,
        persistAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
