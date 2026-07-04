import { useState } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import { Zap, User, Mail, Lock, Building2, ArrowRight, Eye, EyeOff, Check, Dumbbell, Brain, TrendingUp, Shield } from 'lucide-react'

const BENEFITS = [
  { icon: Dumbbell,   text: 'Gestão completa de alunos e treinos'   },
  { icon: Brain,      text: 'IA para progressão de carga automática' },
  { icon: TrendingUp, text: 'Gamificação para engajar seus alunos'   },
  { icon: Shield,     text: 'Cobranças e controle financeiro'        },
]

export default function Registrar() {
  const { registrar } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const refCode = searchParams.get('ref') || ''
  const [form, setForm] = useState({ nome: '', email: '', senha: '', nome_academia: '' })
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await registrar({ ...form, ref_code: refCode || undefined })
      toast.success('Conta criada! Bem-vindo ao GymPro.')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Erro ao criar conta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#0C0C0D' }}>
      {/* Left panel */}
      <div style={{ display: 'none', width: 420, flexShrink: 0, padding: '48px 40px', flexDirection: 'column', justifyContent: 'space-between', background: '#0A0A0B', borderRight: '1px solid #1C1C1E' }} className="lg:flex">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 48 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap style={{ width: 14, height: 14, color: 'white' }} />
            </div>
            <span style={{ fontSize: 15, fontWeight: 600, color: '#F4F4F5', letterSpacing: '-0.02em' }}>GymPro</span>
          </div>

          <h1 style={{ fontSize: 24, fontWeight: 600, color: '#F4F4F5', letterSpacing: '-0.03em', lineHeight: 1.25, marginBottom: 10 }}>
            Comece grátis<br />hoje mesmo
          </h1>
          <p style={{ fontSize: 13, color: '#71717A', lineHeight: 1.7, marginBottom: 32 }}>
            Plataforma completa para personal trainers gerirem alunos, prescreverem treinos e acompanharem resultados.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {BENEFITS.map(({ icon: Icon, text }) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 8, background: '#111113', border: '1px solid #1C1C1E' }}>
                <Icon style={{ width: 14, height: 14, color: '#71717A', flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: '#A1A1AA' }}>{text}</span>
                <Check style={{ width: 13, height: 13, color: '#4ade80', marginLeft: 'auto', flexShrink: 0 }} />
              </div>
            ))}
          </div>
        </div>

        <p style={{ fontSize: 11, color: '#3F3F46' }}>Sem cartão de crédito · Cancele quando quiser</p>
      </div>

      {/* Right panel — form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ width: '100%', maxWidth: 360 }} className="animate-fade-in">
          {/* Mobile logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32 }} className="lg:hidden">
            <div style={{ width: 26, height: 26, borderRadius: 7, background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap style={{ width: 13, height: 13, color: 'white' }} />
            </div>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#F4F4F5' }}>GymPro</span>
          </div>

          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 20, fontWeight: 600, color: '#F4F4F5', letterSpacing: '-0.02em', marginBottom: 6 }}>Criar conta de personal</h2>
            <p style={{ fontSize: 13, color: '#71717A' }}>
              Já tem conta?{' '}
              <Link to="/login" style={{ color: '#6366f1', fontWeight: 500, textDecoration: 'none' }}>Entrar</Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { label: 'Seu nome completo *', key: 'nome',          Icon: User,      type: 'text',  placeholder: 'João Silva',         autocomplete: 'name' },
              { label: 'E-mail *',            key: 'email',         Icon: Mail,      type: 'email', placeholder: 'joao@email.com',     autocomplete: 'email' },
              { label: 'Nome da academia',    key: 'nome_academia', Icon: Building2, type: 'text',  placeholder: 'Ex: Academia Silva', autocomplete: 'organization' },
            ].map(({ label, key, Icon, type, placeholder, autocomplete }) => (
              <div key={key}>
                <label className="label">{label}</label>
                <div style={{ position: 'relative' }}>
                  <Icon style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: '#52525B', pointerEvents: 'none' }} />
                  <input className="input" style={{ paddingLeft: 36 }} type={type} placeholder={placeholder} value={form[key]} onChange={set(key)} required={key !== 'nome_academia'} autoComplete={autocomplete} />
                </div>
              </div>
            ))}

            <div>
              <label className="label">Senha *</label>
              <div style={{ position: 'relative' }}>
                <Lock style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: '#52525B', pointerEvents: 'none' }} />
                <input className="input" style={{ paddingLeft: 36, paddingRight: 36 }} type={showPass ? 'text' : 'password'} placeholder="Mínimo 8 caracteres" value={form.senha} onChange={set('senha')} required autoComplete="new-password" />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#52525B', padding: 2 }}>
                  {showPass ? <EyeOff style={{ width: 14, height: 14 }} /> : <Eye style={{ width: 14, height: 14 }} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary btn-xl w-full" style={{ marginTop: 4 }} disabled={loading}>
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                  Criando conta...
                </span>
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  Criar conta grátis
                  <ArrowRight style={{ width: 15, height: 15 }} />
                </span>
              )}
            </button>
          </form>

          <p style={{ fontSize: 11, color: '#52525B', textAlign: 'center', marginTop: 20, lineHeight: 1.6 }}>
            Ao criar sua conta, você concorda com os{' '}
            <span style={{ color: '#71717A', cursor: 'pointer' }}>Termos de Uso</span>
            {' '}e{' '}
            <span style={{ color: '#71717A', cursor: 'pointer' }}>Política de Privacidade</span>.
          </p>
        </div>
      </div>
    </div>
  )
}
