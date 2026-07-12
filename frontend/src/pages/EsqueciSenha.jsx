import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import api from '../api/client'
import toast from 'react-hot-toast'

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
      style={{ position: 'absolute', pointerEvents: 'none', ...posStyle }}
    >
      <line x1="0" y1="60" x2="60" y2="60" stroke="#ef4444" strokeWidth="1.5" strokeOpacity="0.7" />
      <line x1="60" y1="0" x2="60" y2="60" stroke="#ef4444" strokeWidth="1.5" strokeOpacity="0.7" />
      <line x1="0" y1="30" x2="30" y2="30" stroke="#ef4444" strokeWidth="1" strokeOpacity="0.5" />
      <line x1="30" y1="0" x2="30" y2="30" stroke="#ef4444" strokeWidth="1" strokeOpacity="0.5" />
      <path d="M60 60 L100 60 L100 90 L140 90" stroke="#ef4444" strokeWidth="1" strokeOpacity="0.35" />
      <path d="M60 60 L60 100 L90 100 L90 140" stroke="#ef4444" strokeWidth="1" strokeOpacity="0.35" />
      <line x1="0" y1="80" x2="55" y2="80" stroke="#ef4444" strokeWidth="0.8" strokeOpacity="0.25" />
      <line x1="80" y1="0" x2="80" y2="55" stroke="#ef4444" strokeWidth="0.8" strokeOpacity="0.25" />
      <circle cx="60" cy="60" r="3" fill="#ef4444" fillOpacity="0.9" />
      <circle cx="100" cy="60" r="2" fill="#ef4444" fillOpacity="0.6" />
      <circle cx="100" cy="90" r="2" fill="#ef4444" fillOpacity="0.5" />
      <circle cx="60" cy="100" r="2" fill="#ef4444" fillOpacity="0.6" />
      <circle cx="140" cy="90" r="1.5" fill="#ef4444" fillOpacity="0.35" />
      <defs>
        <linearGradient id="glow-h2" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ef4444" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="glow-v2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ef4444" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  )
}

function LogoM({ size = 52 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden>
      <defs>
        <linearGradient id="logo-bg-es" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2a2a2a" />
          <stop offset="100%" stopColor="#111113" />
        </linearGradient>
        <linearGradient id="logo-stroke-es" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#b91c1c" />
        </linearGradient>
        <pattern id="carbon-es" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
          <rect width="4" height="4" fill="rgba(255,255,255,0.025)" />
          <rect x="4" y="4" width="4" height="4" fill="rgba(255,255,255,0.025)" />
        </pattern>
      </defs>
      <rect width="64" height="64" rx="14" fill="url(#logo-bg-es)" />
      <rect width="64" height="64" rx="14" fill="url(#carbon-es)" />
      <rect width="64" height="64" rx="14" stroke="url(#logo-stroke-es)" strokeWidth="1.5" />
      <path d="M13 46V18L32 36L51 18V46" stroke="url(#logo-stroke-es)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  )
}

export default function EsqueciSenha() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [devLink, setDevLink] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    try {
      const res = await api.post('/public/esqueci-senha', { email })
      setEnviado(true)
      if (res.data?.dev_info) setDevLink(res.data.dev_info)
    } catch {
      toast.error('Erro ao processar solicitação')
    } finally {
      setLoading(false)
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
      <CircuitCorner pos="tl" />
      <CircuitCorner pos="tr" />
      <CircuitCorner pos="bl" />
      <CircuitCorner pos="br" />

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

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
            <LogoM size={52} />
          </div>
          <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>MegaUp</span>
        </div>

        {enviado ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
            }}>
              <CheckCircle style={{ width: 30, height: 30, color: '#34d399' }} />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 10 }}>Email enviado!</h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 24 }}>
              Se existe uma conta com o email{' '}
              <strong style={{ color: 'var(--text-secondary)' }}>{email}</strong>,
              você receberá um link para redefinir sua senha em breve.
            </p>
            {devLink && (
              <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 12, padding: '12px 16px', marginBottom: 20, textAlign: 'left' }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: '#f87171', marginBottom: 6 }}>DEV — Link gerado (SMTP não configurado):</p>
                <a href={devLink} style={{ fontSize: 12, color: '#f87171', wordBreak: 'break-all' }}>{devLink}</a>
              </div>
            )}
            <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 600, color: '#f87171', textDecoration: 'none' }}>
              <ArrowLeft style={{ width: 14, height: 14 }} /> Voltar ao login
            </Link>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 6 }}>
                Esqueceu a senha?
              </h2>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Digite seu e-mail e enviaremos um link para redefinir sua senha.
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ position: 'relative' }}>
                <Mail style={{
                  position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                  width: 16, height: 16, color: 'var(--text-disabled)',
                }} aria-hidden />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="E-mail"
                  required
                  autoFocus
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 10,
                    color: 'var(--text-primary)',
                    fontSize: 14,
                    padding: '13px 14px 13px 42px',
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                  onFocus={e => { e.target.style.borderColor = 'rgba(239,68,68,0.4)' }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)' }}
                />
              </div>

              <button
                type="submit"
                disabled={loading || !email}
                style={{
                  width: '100%',
                  background: loading || !email ? 'rgba(239,68,68,0.5)' : '#ef4444',
                  border: 'none',
                  borderRadius: 10,
                  color: 'white',
                  cursor: loading || !email ? 'not-allowed' : 'pointer',
                  fontWeight: 600,
                  fontSize: 15,
                  padding: '14px',
                  transition: 'background 150ms ease',
                }}
                onMouseEnter={e => { if (!loading && email) e.currentTarget.style.background = '#f87171' }}
                onMouseLeave={e => { if (!loading && email) e.currentTarget.style.background = '#ef4444' }}
              >
                {loading ? 'Enviando…' : 'Enviar link de redefinição'}
              </button>
            </form>

            <div style={{ marginTop: 24, textAlign: 'center' }}>
              <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', textDecoration: 'none' }}>
                <ArrowLeft style={{ width: 14, height: 14 }} /> Voltar ao login
              </Link>
            </div>
          </>
        )}

        <p style={{ marginTop: 28, textAlign: 'center', fontSize: 11, color: 'var(--text-disabled)' }}>
          MegaUp Corp &copy; 2024 - Todos os Direitos Reservados
        </p>
      </div>
    </div>
  )
}
