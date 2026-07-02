import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import { Dumbbell } from 'lucide-react'

export default function Registrar() {
  const { registrar } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ nome: '', email: '', senha: '', nome_academia: '' })
  const [loading, setLoading] = useState(false)

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await registrar(form)
      toast.success('Conta criada! Bem-vindo ao FitSaaS.')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Erro ao criar conta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-indigo-100 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl mb-4">
            <Dumbbell className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">FitSaaS</h1>
          <p className="text-gray-500 mt-1">Comece grátis · Fique com 100% das suas cobranças</p>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-6">Criar conta de personal</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { label: 'Seu nome', key: 'nome', type: 'text', placeholder: 'João Silva' },
              { label: 'E-mail', key: 'email', type: 'email', placeholder: 'joao@email.com' },
              { label: 'Senha', key: 'senha', type: 'password', placeholder: '••••••••' },
              { label: 'Nome da academia / marca', key: 'nome_academia', type: 'text', placeholder: 'Academia Silva' },
            ].map(({ label, key, type, placeholder }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <input
                  type={type}
                  className="input"
                  placeholder={placeholder}
                  value={form[key]}
                  onChange={set(key)}
                  required
                />
              </div>
            ))}
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Criando conta...' : 'Criar conta grátis'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            Já tem conta?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
