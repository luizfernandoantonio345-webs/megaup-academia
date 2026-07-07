import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import { Zap, Mail, Lock, ArrowRight, Eye, EyeOff, Dumbbell, TrendingUp, Users } from 'lucide-react'
import api from '../api/client'

const FEATURES = [
  { icon: Dumbbell,   title: 'Treinos personalizados',            desc: 'Monte e prescreva treinos para cada aluno com facilidade.' },
  { icon: TrendingUp, title: 'Analytics de progressão de carga',  desc: 'Analise o histórico de carga e acompanhe a evolução de cada aluno.' },
  { icon: Users,      title: 'Gestão completa de alunos',         desc: 'Acompanhe streak, conquistas e pagamentos em tempo real.' },
]

// ── Decorative SVG components ────────────────────────────────────────────────

function SvgDumbbell({ style }) {
  return (
    <svg viewBox="0 0 320 100" fill="currentColor" style={style} xmlns="http://www.w3.org/2000/svg">
      {/* Left outer plate */}
      <rect x="0" y="18" width="36" height="64" rx="8"/>
      {/* Left inner plate */}
      <rect x="36" y="6" width="22" height="88" rx="6"/>
      {/* Bar */}
      <rect x="58" y="40" width="204" height="20" rx="10"/>
      {/* Right inner plate */}
      <rect x="262" y="6" width="22" height="88" rx="6"/>
      {/* Right outer plate */}
      <rect x="284" y="18" width="36" height="64" rx="8"/>
    </svg>
  )
}

function SvgPlate({ style }) {
  // evenodd: outer filled → middle hole → inner ring filled → center hole → hub filled
  return (
    <svg viewBox="0 0 120 120" fill="currentColor" style={style} xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" d="
        M60 60 m-56 0 a56 56 0 1 1 112 0 a56 56 0 1 1-112 0
        M60 60 m-42 0 a42 42 0 1 1  84 0 a42 42 0 1 1 -84 0
        M60 60 m-30 0 a30 30 0 1 1  60 0 a30 30 0 1 1 -60 0
        M60 60 m-14 0 a14 14 0 1 1  28 0 a14 14 0 1 1 -28 0
        M60 60 m -8 0 a 8  8 0 1 1  16 0 a 8  8 0 1 1 -16 0
      "/>
    </svg>
  )
}

// ── Login page ───────────────────────────────────────────────────────────────

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', senha: '' })

  useEffect(() => {
    api.get('/ping').catch(() => {})
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
    try {
      const user = await login(form.email, form.senha)
      navigate(user?.role === 'aluno' ? '/aluno' : '/dashboard')
    } catch {
      toast.error('E-mail ou senha incorretos. Verifique suas credenciais.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#0C0C0D', position: 'relative', overflow: 'hidden' }}>

      {/* ── Decorative gym equipment background ── */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        {/* Large dumbbell — top right, tilted */}
        <SvgDumbbell style={{
          position: 'absolute', top: -24, right: -70,
          width: 420, color: '#6366f1', opacity: 0.055,
          transform: 'rotate(-14deg)', flexShrink: 0,
        }} />

        {/* Medium dumbbell — bottom left, tilted opposite */}
        <SvgDumbbell style={{
          position: 'absolute', bottom: -16, left: -100,
          width: 320, color: '#818cf8', opacity: 0.04,
          transform: 'rotate(18deg)', flexShrink: 0,
        }} />

        {/* Small dumbbell — mid right */}
        <SvgDumbbell style={{
          position: 'absolute', top: '48%', right: -30,
          width: 200, color: '#6366f1', opacity: 0.03,
          transform: 'rotate(-6deg)', flexShrink: 0,
        }} />

        {/* Weight plate — top left area */}
        <SvgPlate style={{
          position: 'absolute', top: '6%', left: '12%',
          width: 130, color: '#6366f1', opacity: 0.045,
        }} />

        {/* Weight plate — bottom right */}
        <SvgPlate style={{
          position: 'absolute', bottom: '8%', right: '4%',
          width: 180, color: '#818cf8', opacity: 0.035,
        }} />

        {/* Small plate — upper mid */}
        <SvgPlate style={{
          position: 'absolute', top: '-4%', left: '45%',
          width: 100, color: '#6366f1', opacity: 0.03,
        }} />
      </div>

      {/* ── Left panel (desktop only) ── */}
      <div
        style={{
          display: 'none', width: 440, flexShrink: 0,
          padding: '48px 40px', flexDirection: 'column', justifyContent: 'space-between',
          background: 'rgba(10,10,11,0.85)', borderRight: '1px solid #1C1C1E',
          backdropFilter: 'blur(2px)',
        }}
        className="lg:flex"
      >
        <div>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 40 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap style={{ width: 14, height: 14, color: 'white' }} />
            </div>
            <span style={{ fontSize: 15, fontWeight: 600, color: '#F4F4F5', letterSpacing: '-0.02em' }}>GymPro</span>
          </div>

          {/* Hero headline */}
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: 26, fontWeight: 600, color: '#F4F4F5', letterSpacing: '-0.03em', lineHeight: 1.2, marginBottom: 10 }}>
              Plataforma para<br />personal trainers
            </h1>
            <p style={{ fontSize: 13, color: '#71717A', lineHeight: 1.7 }}>
              Gerencie alunos, prescreva treinos e acompanhe evolução com inteligência artificial.
            </p>
          </div>

          {/* Decorative dumbbell illustration */}
          <div style={{
            padding: '20px 24px', background: 'rgba(99,102,241,0.06)',
            border: '1px solid rgba(99,102,241,0.15)', borderRadius: 16, marginBottom: 32,
          }}>
            <SvgDumbbell style={{ width: '100%', color: '#6366f1', opacity: 0.5, display: 'block', marginBottom: 12 }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <SvgPlate style={{ width: 28, color: '#818cf8', opacity: 0.6 }} />
                <SvgPlate style={{ width: 28, color: '#a78bfa', opacity: 0.4 }} />
                <SvgPlate style={{ width: 28, color: '#6366f1', opacity: 0.5 }} />
              </div>
              <span style={{ fontSize: 11, color: '#52525B', fontWeight: 500 }}>Progressive overload</span>
            </div>
          </div>

          {/* Features */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: '#1C1C1E', border: '1px solid #27272A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon style={{ width: 13, height: 13, color: '#71717A' }} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#A1A1AA', marginBottom: 2 }}>{title}</div>
                  <div style={{ fontSize: 12, color: '#52525B', lineHeight: 1.5 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p style={{ fontSize: 11, color: '#3F3F46' }}>
          Desenvolvido por{' '}
          <a href="https://www.instagram.com/luuiz.dev" target="_blank" rel="noopener noreferrer"
            style={{ color: '#71717A', textDecoration: 'none' }}>@luuiz.dev</a>
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
            <span style={{ fontSize: 14, fontWeight: 600, color: '#F4F4F5' }}>GymPro</span>
          </div>

          {/* Mobile dumbbell accent */}
          <div className="lg:hidden" style={{ marginBottom: 24 }}>
            <SvgDumbbell style={{ width: '100%', maxWidth: 180, color: '#6366f1', opacity: 0.3, display: 'block', margin: '0 auto' }} />
          </div>

          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 20, fontWeight: 600, color: '#F4F4F5', letterSpacing: '-0.02em', marginBottom: 6 }}>
              Entrar na conta
            </h2>
            <p style={{ fontSize: 13, color: '#71717A' }}>
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
                <Mail style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: '#52525B' }} aria-hidden="true" />
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
                <Lock style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: '#52525B' }} aria-hidden="true" />
                <input
                  id="login-senha"
                  className={`input pl-10 pr-10 ${errors.senha ? 'input-error' : ''}`}
                  type={showPass ? 'text' : 'password'} placeholder="Sua senha"
                  value={form.senha} onChange={set('senha')} onBlur={touch('senha')}
                  required autoComplete="current-password" aria-describedby={errors.senha ? 'senha-error' : undefined}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  aria-label={showPass ? 'Ocultar senha' : 'Mostrar senha'}
                  style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#52525B', background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
                  {showPass ? <EyeOff style={{ width: 15, height: 15 }} /> : <Eye style={{ width: 15, height: 15 }} />}
                </button>
              </div>
              {errors.senha && <p id="senha-error" className="field-error" role="alert">{errors.senha}</p>}
            </div>

            <button type="submit" className="btn-primary btn-xl w-full" style={{ marginTop: 4 }} disabled={loading}>
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                  Entrando...
                </span>
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  Entrar
                  <ArrowRight style={{ width: 15, height: 15 }} />
                </span>
              )}
            </button>
          </form>

          <p style={{ marginTop: 24, textAlign: 'center', fontSize: 11, color: '#3F3F46' }}>
            Desenvolvido por{' '}
            <a href="https://www.instagram.com/luuiz.dev" target="_blank" rel="noopener noreferrer"
              style={{ color: '#52525B', textDecoration: 'none' }}>@luuiz.dev</a>
          </p>
        </div>
      </div>
    </div>
  )
}
