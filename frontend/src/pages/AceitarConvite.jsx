import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { infoConvite, aceitarConvite } from '../api'
import toast from 'react-hot-toast'
import { Dumbbell, Loader2 } from 'lucide-react'

export default function AceitarConvite() {
  const [params] = useSearchParams()
  const token = params.get('convite')
  const navigate = useNavigate()
  const [info, setInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ nome: '', senha: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!token) { setLoading(false); return }
    infoConvite(token)
      .then(({ data }) => setInfo(data))
      .catch(() => toast.error('Convite inválido ou expirado'))
      .finally(() => setLoading(false))
  }, [token])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const { data } = await aceitarConvite({ token, nome: form.nome, senha: form.senha })
      localStorage.setItem('token', data.access_token)
      localStorage.setItem('user', JSON.stringify(data.user))
      toast.success('Conta criada! Bora treinar 💪')
      navigate('/aluno')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Erro ao aceitar convite')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )

  if (!info)
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Convite não encontrado ou expirado.</p>
          <Link to="/login" className="text-primary-600 font-medium">Ir para login</Link>
        </div>
      </div>
    )

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-indigo-100 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl mb-4">
            <Dumbbell className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Você foi convidado!</h1>
          <p className="text-gray-500 mt-1">
            <strong>{info.nome_personal}</strong> de <strong>{info.nome_academia}</strong>
          </p>
        </div>

        <div className="card">
          <p className="text-sm text-gray-500 mb-4">
            E-mail: <strong>{info.email_aluno}</strong>
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Seu nome</label>
              <input
                type="text"
                className="input"
                placeholder="Como quer ser chamado"
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Crie uma senha</label>
              <input
                type="password"
                className="input"
                placeholder="••••••••"
                value={form.senha}
                onChange={(e) => setForm({ ...form, senha: e.target.value })}
                required
                minLength={6}
              />
            </div>
            <button type="submit" className="btn-primary w-full" disabled={submitting}>
              {submitting ? 'Criando conta...' : 'Criar conta e entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
