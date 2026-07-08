import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import { Zap, Mail, Lock, ArrowRight, Eye, EyeOff, Dumbbell, TrendingUp, Users } from 'lucide-react'
import api from '../api/client'
import { GymDecorBg, SvgDumbbellHero, SvgPlate } from '../components/GymDecorBg'

const FEATURES = [
  { icon: Dumbbell,   title: 'Treinos personalizados',           desc: 'Monte e prescreva treinos para cada aluno com facilidade.' },
  { icon: TrendingUp, title: 'Analytics de progressão de carga', desc: 'Analise o histórico de carga e acompanhe a evolução de cada aluno.' },
  { icon: Users,      title: 'Gestão completa de alunos',        desc: 'Acompanhe streak, conquistas e pagamentos em tempo real.' },
]

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', senha: '' })
  const [serverSlow, setServerSlow] = useState(false)
  const [warmingUp, setWarmingUp] = useState(null)

  useEffect(() => {
    let mounted = true
    const t = setTimeout(() => { if (mounted) setServerSlow(true) }, 2000)
    api.get('/health', { timeout: 8000 })
      .then(() => { if (mounted) setServerSlow(false) })
      .catch(() => { if (mounted) setServerSlow(true) })
      .finally(() => clearTimeout(t))
    return () => { mounted = false; clearTimeout(t) }
  }, [])

  const [touched, setTouched] = useState({ email: false, senha: false })
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })
  const touch = (k) => () => setTouched(t => ({ ...t, [k]: true }))

  const errors = {
    email: touched.email && !form.email.includes('@') ? 'Digite um e-mail válido' : '',
    senha: touched.senha && form.senha.length < 4 ? 'Senha muito curta' : '',
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setTouched({ email: true, senha: true })
    if (errors.email || errors.senha) return
    setLoading(true)
    setWarmingUp(null)

    const MAX_RETRIES = 3
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const user = await login(form.email, form.senha)
        navigate(user?.role === 'aluno' ? '/aluno' : '/dashboard')
        return
      } catch (err) {
        const isNetwork = !err.response
        const isCreds = err.response?.status === 401 || err.response?.status === 403

        if (isCreds) {
          toast.error('E-mail ou senha incorretos. Verifique suas credenciais.')
          break
        }

        if (isNetwork && attempt < MAX_RETRIES) {
          setServerSlow(true)
          setWarmingUp(`Servidor iniciando... tentativa ${attempt + 1}/${MAX_RETRIES}`)
          await new Promise(r => setTimeout(r, 8000))
          continue
        }

        toast.error('Servidor indisponível. Aguarde alguns instantes e tente novamente.')
        break
      }
    }

    setLoading(false)
    setWarmingUp(null)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg-page)', position: 'relative', overflow: 'hidden' }}>
      <GymDecorBg />

      {/* ── Left panel (desktop only) ── */}
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
            <pattern id="login-dotgrid" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
              <circle cx="1.5" cy="1.5" r="1.5" fill="#ffffff"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#login-dotgrid)"/>
        </svg>

        {/* Subtle corner radial — brand tint */}
        <div style={{
          position: 'absolute', top: -140, right: -140, width: 360, height: 360,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 44 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap style={{ width: 14, height: 14, color: 'white' }} />
            </div>
            <span style={{ fontSize: 15, fontWeight: 600, color:'var(--text-primary)', letterSpacing: '-0.02em' }}>GymPro</span>
          </div>

          {/* Hero headline */}
          <div style={{ marginBottom: 36 }}>
            <h1 style={{ fontSize: 30, fontWeight: 600, letterSpacing: '-0.04em', lineHeight: 1.15, marginBottom: 12 }}>
              <span className="gradient-text">Evolução real.</span><br />
              <span style={{ color:'var(--text-primary)' }}>Para cada aluno.</span>
            </h1>
            <p style={{ fontSize: 13, color:'var(--text-muted)', lineHeight: 1.75 }}>
              Plataforma completa para personal trainers: treinos, progressão de carga, gamificação e gestão financeira.
            </p>
          </div>

          {/* Hero dumbbell illustration */}
          <div style={{
            padding: '20px 20px 16px',
            background: 'rgba(99,102,241,0.05)',
            border: '1px solid rgba(99,102,241,0.14)',
            borderRadius: 16, marginBottom: 32,
          }}>
            <SvgDumbbellHero uid="login" style={{
              width: '100%', display: 'block', marginBottom: 14,
              animation: 'float 5s ease-in-out infinite',
            }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <SvgPlate style={{ width: 26, color: '#818cf8', opacity: 0.7 }} />
                <SvgPlate style={{ width: 22, color: '#a78bfa', opacity: 0.5 }} />
                <SvgPlate style={{ width: 18, color: '#6366f1', opacity: 0.4 }} />
              </div>
              <span style={{ fontSize: 10, color:'var(--text-disabled)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                Progressive overload
              </span>
            </div>
          </div>

          {/* Feature list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background:'var(--bg-card)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon style={{ width: 14, height: 14, color:'var(--text-muted)' }} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color:'var(--text-secondary)', marginBottom: 2 }}>{title}</div>
                  <div style={{ fontSize: 12, color:'var(--text-disabled)', lineHeight: 1.5 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p style={{ fontSize: 11, color:'var(--text-disabled)', position: 'relative' }}>
          Desenvolvido por{' '}
          <a href="https://www.instagram.com/luuiz.dev" target="_blank" rel="noopener noreferrer"
            style={{ color:'var(--text-muted)', textDecoration: 'none' }}>@luuiz.dev</a>
        </p>
      </div>

      {/* ── Right panel — form ── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative' }}>
        <div style={{ width: '100%', maxWidth: 360 }} className="animate-fade-in">

          {/* Mobile logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28 }} className="lg:hidden">
            <div style={{ width: 26, height: 26, borderRadius: 7, background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap style={{ width: 13, height: 13, color: 'white' }} />
            </div>
            <span style={{ fontSize: 14, fontWeight: 600, color:'var(--text-primary)' }}>GymPro</span>
          </div>

          {/* Mobile dumbbell accent */}
          <div className="lg:hidden" style={{ marginBottom: 24 }}>
            <SvgDumbbellHero uid="login-m" style={{
              width: '100%', maxWidth: 200, display: 'block', margin: '0 auto',
              opacity: 0.55,
            }} />
          </div>

          {/* Cold start banner */}
          {serverSlow && (
            <div style={{
              marginBottom: 16, padding: '10px 14px',
              background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)',
              borderRadius: 10, display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <div style={{ width: 14, height: 14, border: '2px solid rgba(251,191,36,0.3)', borderTopColor: '#fbbf24', borderRadius: '50%', animation: 'spin 0.7s linear infinite', flexShrink: 0 }} />
              <p style={{ fontSize: 12, color: '#fbbf24', margin: 0 }}>
                Servidor acordando... o primeiro acesso pode levar até 60s.
              </p>
            </div>
          )}

          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 20, fontWeight: 600, color:'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 6 }}>
              Entrar na conta
            </h2>
            <p style={{ fontSize: 13, color:'var(--text-muted)' }}>
              Não tem conta?{' '}
              <Link to="/registrar" style={{ color: '#6366f1', fontWeight: 500, textDecoration: 'none' }}>
                Criar conta grátis
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label htmlFor="login-email" className="label">E-mail</label>
              <div style={{ position: 'relative' }}>
                <Mail style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color:'var(--text-disabled)' }} aria-hidden="true" />
                <input
                  id="login-email"
                  className={`input pl-10 ${errors.email ? 'input-error' : touched.email && form.email ? 'input-success' : ''}`}
                  type="email" placeholder="seu@email.com"
                  value={form.email} onChange={set('email')} onBlur={touch('email')}
                  required autoComplete="email" aria-describedby={errors.email ? 'email-error' : undefined}
                />
              </div>
              {errors.email && <p id="email-error" className="field-error" role="alert">{errors.email}</p>}
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label htmlFor="login-senha" className="label" style={{ margin: 0 }}>Senha</label>
                <Link to="/esqueci-senha" style={{ fontSize: 11, color: '#6366f1', textDecoration: 'none' }}>
                  Esqueci minha senha
                </Link>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color:'var(--text-disabled)' }} aria-hidden="true" />
                <input
                  id="login-senha"
                  className={`input pl-10 pr-10 ${errors.senha ? 'input-error' : ''}`}
                  type={showPass ? 'text' : 'password'} placeholder="Sua senha"
                  value={form.senha} onChange={set('senha')} onBlur={touch('senha')}
                  required autoComplete="current-password" aria-describedby={errors.senha ? 'senha-error' : undefined}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  aria-label={showPass ? 'Ocultar senha' : 'Mostrar senha'}
                  style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color:'var(--text-disabled)', background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
                  {showPass ? <EyeOff style={{ width: 15, height: 15 }} /> : <Eye style={{ width: 15, height: 15 }} />}
                </button>
              </div>
              {errors.senha && <p id="senha-error" className="field-error" role="alert">{errors.senha}</p>}
            </div>

            <button type="submit" className="btn-primary btn-xl w-full" style={{ marginTop: 4 }} disabled={loading}>
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                  {warmingUp || 'Entrando...'}
                </span>
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  Entrar
                  <ArrowRight style={{ width: 15, height: 15 }} />
                </span>
              )}
            </button>
          </form>

          <p style={{ marginTop: 24, textAlign: 'center', fontSize: 11, color:'var(--text-disabled)' }}>
            Desenvolvido por{' '}
            <a href="https://www.instagram.com/luuiz.dev" target="_blank" rel="noopener noreferrer"
              style={{ color:'var(--text-disabled)', textDecoration: 'none' }}>@luuiz.dev</a>
          </p>
        </div>
      </div>
    </div>
  )
}
