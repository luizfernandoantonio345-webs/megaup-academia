import { useState } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'

/* ── Circuit board corner SVGs ─────────────────────────────── */
function CircuitCorner({ pos }) {
  const posStyle = {
    'tl': { top: 0, left: 0 },
    'tr': { top: 0, right: 0, transform: 'scaleX(-1)' },
    'bl': { bottom: 0, left: 0, transform: 'scaleY(-1)' },
    'br': { bottom: 0, right: 0, transform: 'scale(-1,-1)' },
  }[pos]

  return (
    <svg
      aria-hidden
      width="220"
      height="220"
      viewBox="0 0 220 220"
      fill="none"
      style={{
        position: 'absolute',
        pointerEvents: 'none',
        ...posStyle,
      }}
    >
      {/* Outer frame lines */}
      <line x1="0" y1="60" x2="60" y2="60" stroke="#ef4444" strokeWidth="1.5" strokeOpacity="0.7" />
      <line x1="60" y1="0" x2="60" y2="60" stroke="#ef4444" strokeWidth="1.5" strokeOpacity="0.7" />

      {/* Inner corner bracket */}
      <line x1="0" y1="30" x2="30" y2="30" stroke="#ef4444" strokeWidth="1" strokeOpacity="0.5" />
      <line x1="30" y1="0" x2="30" y2="30" stroke="#ef4444" strokeWidth="1" strokeOpacity="0.5" />

      {/* Circuit traces extending inward */}
      <path d="M60 60 L100 60 L100 90 L140 90" stroke="#ef4444" strokeWidth="1" strokeOpacity="0.35" />
      <path d="M60 60 L60 100 L90 100 L90 140" stroke="#ef4444" strokeWidth="1" strokeOpacity="0.35" />
      <path d="M60 60 L80 60 L80 80 L110 80 L110 120" stroke="#ef4444" strokeWidth="0.8" strokeOpacity="0.2" />
      <path d="M60 60 L60 80 L80 80 L80 110 L120 110" stroke="#ef4444" strokeWidth="0.8" strokeOpacity="0.2" />

      {/* Long horizontal/vertical fades */}
      <line x1="0" y1="80" x2="55" y2="80" stroke="#ef4444" strokeWidth="0.8" strokeOpacity="0.25" />
      <line x1="80" y1="0" x2="80" y2="55" stroke="#ef4444" strokeWidth="0.8" strokeOpacity="0.25" />
      <line x1="0" y1="100" x2="45" y2="100" stroke="#ef4444" strokeWidth="0.5" strokeOpacity="0.15" />
      <line x1="100" y1="0" x2="100" y2="45" stroke="#ef4444" strokeWidth="0.5" strokeOpacity="0.15" />

      {/* Nodes / dots at junctions */}
      <circle cx="60" cy="60" r="3" fill="#ef4444" fillOpacity="0.9" />
      <circle cx="100" cy="60" r="2" fill="#ef4444" fillOpacity="0.6" />
      <circle cx="100" cy="90" r="2" fill="#ef4444" fillOpacity="0.5" />
      <circle cx="60" cy="100" r="2" fill="#ef4444" fillOpacity="0.6" />
      <circle cx="90" cy="100" r="2" fill="#ef4444" fillOpacity="0.5" />
      <circle cx="140" cy="90" r="1.5" fill="#ef4444" fillOpacity="0.35" />
      <circle cx="90" cy="140" r="1.5" fill="#ef4444" fillOpacity="0.35" />

      {/* Outer glow via blurred rect */}
      <rect x="0" y="55" width="65" height="10" fill="url(#glow-h)" />
      <rect x="55" y="0" width="10" height="65" fill="url(#glow-v)" />

      <defs>
        <linearGradient id="glow-h" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ef4444" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="glow-v" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ef4444" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  )
}

/* ── Logo M ─────────────────────────────────────────────────── */
function LogoM({ size = 64 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden>
      <defs>
        <linearGradient id="logo-bg" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2a2a2a" />
          <stop offset="100%" stopColor="#111113" />
        </linearGradient>
        <linearGradient id="logo-stroke" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#b91c1c" />
        </linearGradient>
        {/* Carbon fiber pattern */}
        <pattern id="carbon" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
          <rect width="4" height="4" fill="rgba(255,255,255,0.025)" />
          <rect x="4" y="4" width="4" height="4" fill="rgba(255,255,255,0.025)" />
        </pattern>
      </defs>
      <rect width="64" height="64" rx="14" fill="url(#logo-bg)" />
      <rect width="64" height="64" rx="14" fill="url(#carbon)" />
      <rect width="64" height="64" rx="14" stroke="url(#logo-stroke)" strokeWidth="1.5" />
      {/* M letter */}
      <path
        d="M13 46V18L32 36L51 18V46"
        stroke="url(#logo-stroke)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )
}

/* ── Main component ──────────────────────────────────────────── */
export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const nextUrl = searchParams.get('next')
  const [form, setForm] = useState({ email: '', senha: '' })
  const [touched, setTouched] = useState({ email: false, senha: false })
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [warmMsg, setWarmMsg] = useState(null)

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })
  const touch = (k) => () => setTouched(t => ({ ...t, [k]: true }))

  const errors = {
    email: touched.email && !form.email.includes('@') ? 'Digite um e-mail válido' : '',
    senha: touched.senha && form.senha.length < 4 ? 'Senha muito curta' : '',
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setTouched({ email: true, senha: true })
    if (errors.email || errors.senha || loading) return
    setLoading(true)
    setWarmMsg(null)

    const isColdErr = (err) => !err.response || err.response.status === 502 || err.response.status === 503
    let lastErr = null
    for (let i = 0; i < 8; i++) {
      if (i > 0) {
        setWarmMsg(`Servidor acordando... ${i * 7}s`)
        await new Promise(r => setTimeout(r, 7000))
      }
      try {
        const user = await login(form.email, form.senha)
        return navigate(nextUrl || (user?.role === 'aluno' ? '/aluno' : '/dashboard'))
      } catch (err) {
        lastErr = err
        if (!isColdErr(err)) break
      }
    }

    setWarmMsg(null)
    setLoading(false)
    const status = lastErr?.response?.status
    const detail = lastErr?.response?.data?.detail
    if (status === 401 || status === 403) {
      toast.error('E-mail ou senha incorretos.')
    } else if (isColdErr(lastErr)) {
      toast.error('Servidor não respondeu. Tente novamente em instantes.')
    } else {
      toast.error(typeof detail === 'string' ? detail : 'Erro ao entrar. Tente novamente.')
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-page)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Circuit corner decorations */}
      <CircuitCorner pos="tl" />
      <CircuitCorner pos="tr" />
      <CircuitCorner pos="bl" />
      <CircuitCorner pos="br" />

      {/* Subtle red ambient glow top */}
      <div style={{
        position: 'absolute',
        top: -200,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 600,
        height: 400,
        borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(239,68,68,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Login card */}
      <div style={{
        width: '100%',
        maxWidth: 420,
        background: 'rgba(17,17,19,0.95)',
        border: '1px solid rgba(239,68,68,0.2)',
        borderRadius: 20,
        padding: '40px 32px 36px',
        position: 'relative',
        boxShadow: '0 0 60px rgba(239,68,68,0.07), 0 20px 40px rgba(0,0,0,0.5)',
        backdropFilter: 'blur(12px)',
      }}>
        {/* Inner corner accents */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: 28, height: 28, borderTop: '2px solid rgba(239,68,68,0.5)', borderLeft: '2px solid rgba(239,68,68,0.5)', borderRadius: '14px 0 0 0', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: 0, right: 0, width: 28, height: 28, borderTop: '2px solid rgba(239,68,68,0.5)', borderRight: '2px solid rgba(239,68,68,0.5)', borderRadius: '0 14px 0 0', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, width: 28, height: 28, borderBottom: '2px solid rgba(239,68,68,0.5)', borderLeft: '2px solid rgba(239,68,68,0.5)', borderRadius: '0 0 0 14px', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderBottom: '2px solid rgba(239,68,68,0.5)', borderRight: '2px solid rgba(239,68,68,0.5)', borderRadius: '0 0 14px 0', pointerEvents: 'none' }} />

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <LogoM size={64} />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 4 }}>
            MegaUp
          </h1>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
            Área de Login MegaUp
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Acesse sua conta corporativa
          </p>
        </div>

        {/* Warm server message */}
        {warmMsg && (
          <div style={{ marginBottom: 16, padding: '10px 14px', background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 13, height: 13, border: '2px solid rgba(251,191,36,0.3)', borderTopColor: '#fbbf24', borderRadius: '50%', animation: 'spin 0.7s linear infinite', flexShrink: 0 }} />
            <p style={{ fontSize: 12, color: '#fbbf24', margin: 0 }}>{warmMsg}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Email */}
          <div>
            <div style={{ position: 'relative' }}>
              <Mail style={{
                position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                width: 16, height: 16, color: 'var(--text-disabled)',
              }} aria-hidden />
              <input
                id="login-email"
                type="email"
                placeholder="E-mail"
                value={form.email}
                onChange={set('email')}
                onBlur={touch('email')}
                required
                autoComplete="email"
                aria-describedby={errors.email ? 'email-error' : undefined}
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.04)',
                  border: errors.email
                    ? '1px solid rgba(239,68,68,0.6)'
                    : '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 10,
                  color: 'var(--text-primary)',
                  fontSize: 14,
                  padding: '13px 14px 13px 42px',
                  boxSizing: 'border-box',
                  outline: 'none',
                  transition: 'border-color 150ms ease',
                }}
                onFocus={e => { if (!errors.email) e.target.style.borderColor = 'rgba(239,68,68,0.4)' }}
                onBlurCapture={e => { e.target.style.borderColor = errors.email ? 'rgba(239,68,68,0.6)' : 'rgba(255,255,255,0.08)' }}
              />
            </div>
            {errors.email && <p id="email-error" style={{ fontSize: 11, color: '#f87171', margin: '5px 0 0 2px' }} role="alert">{errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <div style={{ position: 'relative' }}>
              <Lock style={{
                position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                width: 16, height: 16, color: 'var(--text-disabled)',
              }} aria-hidden />
              <input
                id="login-senha"
                type={showPass ? 'text' : 'password'}
                placeholder="Senha"
                value={form.senha}
                onChange={set('senha')}
                onBlur={touch('senha')}
                required
                autoComplete="current-password"
                aria-describedby={errors.senha ? 'senha-error' : undefined}
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.04)',
                  border: errors.senha
                    ? '1px solid rgba(239,68,68,0.6)'
                    : '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 10,
                  color: 'var(--text-primary)',
                  fontSize: 14,
                  padding: '13px 42px 13px 42px',
                  boxSizing: 'border-box',
                  outline: 'none',
                  transition: 'border-color 150ms ease',
                }}
                onFocus={e => { if (!errors.senha) e.target.style.borderColor = 'rgba(239,68,68,0.4)' }}
                onBlurCapture={e => { e.target.style.borderColor = errors.senha ? 'rgba(239,68,68,0.6)' : 'rgba(255,255,255,0.08)' }}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                aria-label={showPass ? 'Ocultar senha' : 'Mostrar senha'}
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  color: 'var(--text-disabled)', background: 'none', border: 'none',
                  cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center',
                }}
              >
                {showPass ? <EyeOff style={{ width: 15, height: 15 }} /> : <Eye style={{ width: 15, height: 15 }} />}
              </button>
            </div>
            {errors.senha && <p id="senha-error" style={{ fontSize: 11, color: '#f87171', margin: '5px 0 0 2px' }} role="alert">{errors.senha}</p>}
          </div>

          {/* Forgot password */}
          <div style={{ textAlign: 'right', marginTop: -6 }}>
            <Link
              to="/esqueci-senha"
              style={{ fontSize: 12, color: 'var(--text-muted)', textDecoration: 'none' }}
            >
              Esqueci minha senha
            </Link>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 4,
              width: '100%',
              background: loading ? 'rgba(239,68,68,0.7)' : '#ef4444',
              border: 'none',
              borderRadius: 10,
              color: 'white',
              fontSize: 15,
              fontWeight: 600,
              padding: '14px',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 150ms ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#f87171' }}
            onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#ef4444' }}
          >
            {loading ? (
              <>
                <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block', flexShrink: 0 }} />
                {warmMsg ? 'Aguardando servidor...' : 'Entrando...'}
              </>
            ) : (
              'Entrar na Conta'
            )}
          </button>
        </form>

        {/* Footer */}
        <p style={{ marginTop: 28, textAlign: 'center', fontSize: 11, color: 'var(--text-disabled)' }}>
          MegaUp Corp &copy; 2024 - Todos os Direitos Reservados
        </p>
      </div>
    </div>
  )
}
