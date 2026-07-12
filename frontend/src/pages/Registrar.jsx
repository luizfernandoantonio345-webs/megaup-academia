import { useState, useMemo } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import { Zap, User, Mail, Lock, Building2, ArrowRight, Eye, EyeOff, Check, Dumbbell, TrendingUp, Shield, BarChart2 } from 'lucide-react'
import { GymDecorBg, SvgDumbbellHero, SvgPlate } from '../components/GymDecorBg'

function senhaForca(senha) {
  if (!senha) return { score: 0, label: '', color: '' }
  let score = 0
  if (senha.length >= 8)  score++
  if (senha.length >= 12) score++
  if (/[A-Z]/.test(senha)) score++
  if (/[0-9]/.test(senha)) score++
  if (/[^A-Za-z0-9]/.test(senha)) score++
  if (score <= 1) return { score, label: 'Fraca',  color: '#f87171' }
  if (score <= 2) return { score, label: 'Média',  color: '#fbbf24' }
  if (score <= 3) return { score, label: 'Boa',    color: '#34d399' }
  return              { score, label: 'Forte', color: '#ef4444' }
}

function PasswordStrength({ senha }) {
  const { score, label, color } = useMemo(() => senhaForca(senha), [senha])
  if (!senha) return null
  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{
            flex: 1, height: 3, borderRadius: 2,
            background: score >= i ? color : 'var(--border)',
            transition: 'background 0.2s',
          }} />
        ))}
      </div>
      {label && <p style={{ fontSize: 11, color, fontWeight: 500, margin: 0 }}>{label}</p>}
    </div>
  )
}

const BENEFITS = [
  { icon: Dumbbell,   text: 'Gestão completa de alunos e treinos'          },
  { icon: BarChart2,  text: 'Analytics de progressão de carga por aluno'   },
  { icon: TrendingUp, text: 'Gamificação para engajar seus alunos'          },
  { icon: Shield,     text: 'Cobranças e controle financeiro'               },
]

export default function Registrar() {
  const { registrar } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const refCode = searchParams.get('ref') || ''
  const [form, setForm] = useState({ nome: '', email: '', senha: '', nome_academia: '' })
  const [termosAceitos, setTermosAceitos] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!termosAceitos) {
      toast.error('Você precisa aceitar os Termos de Uso para continuar.')
      return
    }
    setLoading(true)
    const toastId = toast.loading('Criando sua conta...')
    try {
      await registrar({ ...form, ref_code: refCode || undefined, termos_aceitos: true })
      toast.success('Conta criada! Bem-vindo ao MegaUp.', { id: toastId })
      navigate('/dashboard')
    } catch (err) {
      const status = err.response?.status
      const detail = err.response?.data?.detail
      if (!err.response || status === 502 || status === 503) {
        toast.error('Servidor iniciando, aguarde e tente novamente em 30s.', { id: toastId })
      } else if (status === 409) {
        toast.error('Este e-mail já está cadastrado.', { id: toastId })
      } else if (status === 429) {
        toast.error('Muitas tentativas. Aguarde 1 minuto.', { id: toastId })
      } else {
        toast.error(typeof detail === 'string' ? detail : 'Erro ao criar conta', { id: toastId })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg-page)', position: 'relative', overflow: 'hidden' }}>
      <GymDecorBg />

      {/* Left panel */}
      <div
        style={{
          display: 'none', width: 460, flexShrink: 0,
          padding: '48px 40px', flexDirection: 'column', justifyContent: 'space-between',
          background: 'var(--bg-sidebar)', borderRight: '1px solid var(--border)',
          position: 'relative', overflow: 'hidden',
        }}
        className="lg:flex"
      >
        {/* Dot-grid pattern */}
        <svg
          aria-hidden
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.04, pointerEvents: 'none' }}
        >
          <defs>
            <pattern id="reg-dotgrid" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
              <circle cx="1.5" cy="1.5" r="1.5" fill="#ffffff"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#reg-dotgrid)"/>
        </svg>

        {/* Subtle corner radial — brand tint */}
        <div style={{
          position: 'absolute', top: -140, right: -140, width: 360, height: 360,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 44 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap style={{ width: 14, height: 14, color: 'white' }} />
            </div>
            <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>MegaUp</span>
          </div>

          <h1 style={{ fontSize: 30, fontWeight: 600, letterSpacing: '-0.04em', lineHeight: 1.15, marginBottom: 12 }}>
            <span className="gradient-text">Comece grátis.</span><br />
            <span style={{ color: 'var(--text-primary)' }}>Cresça sem limite.</span>
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.75, marginBottom: 32 }}>
            Plataforma completa para personal trainers gerirem alunos, prescreverem treinos e acompanharem resultados.
          </p>

          {/* Hero dumbbell illustration */}
          <div style={{
            padding: '20px 20px 16px',
            background: 'rgba(99,102,241,0.05)',
            border: '1px solid rgba(99,102,241,0.14)',
            borderRadius: 16, marginBottom: 28,
          }}>
            <SvgDumbbellHero uid="register" style={{
              width: '100%', display: 'block', marginBottom: 14,
              animation: 'float 5.5s ease-in-out infinite',
            }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <SvgPlate style={{ width: 26, color: '#f87171', opacity: 0.7 }} />
                <SvgPlate style={{ width: 22, color: '#a78bfa', opacity: 0.5 }} />
                <SvgPlate style={{ width: 18, color: '#ef4444', opacity: 0.4 }} />
              </div>
              <span style={{ fontSize: 10, color: 'var(--text-disabled)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                Grátis para começar
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {BENEFITS.map(({ icon: Icon, text }) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 8, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <Icon style={{ width: 14, height: 14, color: 'var(--text-muted)', flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{text}</span>
                <Check style={{ width: 13, height: 13, color: '#4ade80', marginLeft: 'auto', flexShrink: 0 }} />
              </div>
            ))}
          </div>
        </div>

        <p style={{ fontSize: 11, color: 'var(--text-disabled)', position: 'relative' }}>Sem cartão de crédito · Cancele quando quiser</p>
      </div>

      {/* Right panel — form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ width: '100%', maxWidth: 360 }} className="animate-fade-in">
          {/* Mobile logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32 }} className="lg:hidden">
            <div style={{ width: 26, height: 26, borderRadius: 7, background: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap style={{ width: 13, height: 13, color: 'white' }} />
            </div>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>MegaUp</span>
          </div>

          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 6 }}>Criar conta de personal</h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Já tem conta?{' '}
              <Link to="/login" style={{ color: '#ef4444', fontWeight: 500, textDecoration: 'none' }}>Entrar</Link>
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
                  <Icon style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: 'var(--text-disabled)', pointerEvents: 'none' }} />
                  <input className="input" style={{ paddingLeft: 36 }} type={type} placeholder={placeholder} value={form[key]} onChange={set(key)} required={key !== 'nome_academia'} autoComplete={autocomplete} />
                </div>
              </div>
            ))}

            <div>
              <label className="label">Senha *</label>
              <div style={{ position: 'relative' }}>
                <Lock style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: 'var(--text-disabled)', pointerEvents: 'none' }} />
                <input className="input" style={{ paddingLeft: 36, paddingRight: 36 }} type={showPass ? 'text' : 'password'} placeholder="Mínimo 8 caracteres" value={form.senha} onChange={set('senha')} required autoComplete="new-password" />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-disabled)', padding: 2 }}>
                  {showPass ? <EyeOff style={{ width: 14, height: 14 }} /> : <Eye style={{ width: 14, height: 14 }} />}
                </button>
              </div>
              <PasswordStrength senha={form.senha} />
            </div>

            {/* Checkbox termos */}
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', userSelect: 'none' }}>
              <div
                onClick={() => setTermosAceitos(!termosAceitos)}
                style={{
                  width: 18, height: 18, borderRadius: 5, border: `1.5px solid ${termosAceitos ? '#ef4444' : 'var(--text-disabled)'}`,
                  background: termosAceitos ? '#ef4444' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, marginTop: 1, transition: 'all 0.15s', cursor: 'pointer',
                }}
              >
                {termosAceitos && <Check style={{ width: 11, height: 11, color: 'white' }} />}
              </div>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Li e aceito os{' '}
                <Link to="/termos" target="_blank" style={{ color: '#f87171', textDecoration: 'none', fontWeight: 500 }}>Termos de Uso</Link>
                {' '}e a{' '}
                <Link to="/privacidade" target="_blank" style={{ color: '#f87171', textDecoration: 'none', fontWeight: 500 }}>Política de Privacidade</Link>
                {' '}(LGPD)
              </span>
            </label>

            <button type="submit" className="btn-primary btn-xl w-full" style={{ marginTop: 4 }} disabled={loading || !termosAceitos}>
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
        </div>
      </div>
    </div>
  )
}


