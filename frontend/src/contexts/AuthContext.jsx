import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { login as apiLogin, registrarPersonal as apiRegistrar, meuPerfilAluno } from '../api'

const AuthContext = createContext(null)

function parseUser() {
  try { return JSON.parse(localStorage.getItem('user')) } catch { return null }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(parseUser)
  const [alunoId, setAlunoId] = useState(() => parseUser()?.aluno_id ?? null)

  // When an aluno is already logged in (cached) but aluno_id isn't stored yet,
  // fetch it once from /alunos/meu-perfil and persist it.
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

  const _persist = (userData) => {
    localStorage.setItem('token', userData._token)
    const u = userData.user
    localStorage.setItem('user', JSON.stringify(u))
    setUser(u)
    setAlunoId(u.aluno_id ?? null)
    return u
  }

  const login = useCallback(async (email, senha) => {
    const { data } = await apiLogin({ email, senha })
    return _persist({ _token: data.access_token, user: data.user })
  }, [])

  const registrar = useCallback(async (payload) => {
    const { data } = await apiRegistrar(payload)
    return _persist({ _token: data.access_token, user: data.user })
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    setAlunoId(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, alunoId, login, registrar, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
