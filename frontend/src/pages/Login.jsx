import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import { Zap, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', senha: '' })
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const user = await login(form.email, form.senha)
      toast.success(`Bem-vindo de volta, ${user.nome.split(' ')[0]}!`)
      navigate(user.role === 'aluno' ? '/aluno' : '/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'E-mail ou senha incorretos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-brand-sidebar">
      {/* ── Left panel — brand ── */}
      <div className="hidden lg:flex flex-col justify-between w-[480px] flex-shrink-0 p-12
                      bg-gradient-mesh relative overflow-hidden">
        {/* Blur balls */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-32 right-0 w-48 h-48 bg-violet-600/20 rounded-full blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-gradient-brand rounded-2xl flex items-center justify-center shadow-glow">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-white text-lg">FitSaaS</span>
              <span className="ml-2 text-xs bg-white/10 text-white/70 px-2 py-0.5 rounded-full font-medium">Pro</span>
            </div>
          </div>

          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Gestão inteligente<br />de treinos
          </h1>
          <p className="text-slate-400 text-base leading-relaxed">
            Plataforma completa para personal trainers gerenciarem alunos,
            prescreverem treinos e acompanharem evolução com IA.
          </p>
        </div>

        <div className="relative z-10 space-y-4">
          {[
            { icon: '🏋️', text: 'Gerencie todos os seus alunos em um só lugar' },
            { icon: '🤖', text: 'IA sugere progressão de carga automaticamente' },
            { icon: '🏆', text: 'Gamificação mantém alunos motivados e engajados' },
            { icon: '💰', text: 'Controle financeiro com cobranças e planos' },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-3 text-sm text-slate-300">
              <span className="text-base">{icon}</span>
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-gradient-brand rounded-xl flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">FitSaaS</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Entrar na plataforma</h2>
            <p className="text-sm text-gray-500">
              Não tem conta?{' '}
              <Link to="/registrar" className="text-primary-600 hover:text-primary-700 font-semibold">
                Criar conta grátis
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="label">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  className="input pl-10"
                  placeholder="seu@email.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="label">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPass ? 'text' : 'password'}
                  className="input pl-10 pr-10"
                  placeholder="••••••••"
                  value={form.senha}
                  onChange={(e) => setForm({ ...form, senha: e.target.value })}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn-gradient w-full py-3 text-base mt-2"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Entrando...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Entrar
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-8">
            Ao entrar, você concorda com os{' '}
            <span className="text-gray-600 underline cursor-pointer">Termos de Uso</span>{' '}
            e{' '}
            <span className="text-gray-600 underline cursor-pointer">Política de Privacidade</span>.
          </p>
        </div>
      </div>
    </div>
  )
}
