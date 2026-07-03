import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import { Zap, User, Mail, Lock, Building2, ArrowRight, Eye, EyeOff, Check } from 'lucide-react'

const BENEFITS = [
  'Gestão completa de alunos e treinos',
  'IA para progressão de carga automática',
  'Gamificação para engajar seus alunos',
  'Cobranças e controle financeiro',
]

export default function Registrar() {
  const { registrar } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ nome: '', email: '', senha: '', nome_academia: '' })
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await registrar(form)
      toast.success('Conta criada! Bem-vindo ao FitSaaS. 🎉')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Erro ao criar conta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-brand-sidebar">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-[440px] flex-shrink-0 p-12 bg-gradient-mesh relative overflow-hidden">
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-32 right-0 w-48 h-48 bg-violet-600/20 rounded-full blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-gradient-brand rounded-2xl flex items-center justify-center shadow-glow">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-white text-lg">FitSaaS</span>
          </div>
          <h1 className="text-3xl font-bold text-white leading-tight mb-3">
            Comece grátis<br />hoje mesmo
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Crie sua conta e tenha uma plataforma completa para
            gerenciar seus alunos e prescrever treinos com inteligência.
          </p>
        </div>

        <div className="relative z-10 space-y-3">
          {BENEFITS.map((b) => (
            <div key={b} className="flex items-center gap-3 text-sm text-slate-300">
              <div className="w-5 h-5 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center justify-center flex-shrink-0">
                <Check className="w-3 h-3 text-emerald-400" />
              </div>
              {b}
            </div>
          ))}
        </div>
      </div>

      {/* Right panel - form */}
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
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Criar conta de personal</h2>
            <p className="text-sm text-gray-500">
              Já tem conta?{' '}
              <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold">
                Entrar
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Seu nome completo *</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input className="input pl-10" type="text" placeholder="João Silva" value={form.nome} onChange={set('nome')} required autoComplete="name" />
              </div>
            </div>

            <div>
              <label className="label">E-mail *</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input className="input pl-10" type="email" placeholder="joao@email.com" value={form.email} onChange={set('email')} required autoComplete="email" />
              </div>
            </div>

            <div>
              <label className="label">Senha *</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input className="input pl-10 pr-10" type={showPass ? 'text' : 'password'} placeholder="Mínimo 8 caracteres" value={form.senha} onChange={set('senha')} required autoComplete="new-password" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="label">Nome da academia / marca</label>
              <div className="relative">
                <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input className="input pl-10" type="text" placeholder="Ex: Academia Silva" value={form.nome_academia} onChange={set('nome_academia')} autoComplete="organization" />
              </div>
            </div>

            <button type="submit" className="btn-gradient w-full py-3 text-base mt-2" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Criando conta...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Criar conta grátis
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </button>
          </form>

          <p className="text-xs text-gray-400 text-center mt-6">
            Ao criar sua conta, você concorda com os{' '}
            <span className="underline cursor-pointer text-gray-500">Termos de Uso</span>
            {' '}e{' '}
            <span className="underline cursor-pointer text-gray-500">Política de Privacidade</span>.
          </p>
        </div>
      </div>
    </div>
  )
}
