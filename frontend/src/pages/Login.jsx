import { useState } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

/* ── Brand logo ─────────────────────────────────────────────── */
function LogoM() {
  return (
    <div style={{
      width: 68,
      height: 68,
      background: 'linear-gradient(145deg, #272930 0%, #16171c 100%)',
      border: '2px solid #ef4444',
      borderRadius: 18,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 0 28px rgba(239,68,68,0.28), 0 0 8px rgba(239,68,68,0.12) inset',
      position: 'relative',
      flexShrink: 0,
    }}>
      {/* carbon fiber */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: 16, overflow: 'hidden', pointerEvents: 'none',
        backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.015) 0px, rgba(255,255,255,0.015) 2px, transparent 2px, transparent 8px)',
      }} />
      <span style={{
        fontSize: 30,
        fontWeight: 800,
        color: '#ef4444',
        letterSpacing: '-2px',
        lineHeight: 1,
        position: 'relative',
        fontFamily: "'Inter', sans-serif",
        textShadow: '0 0 20px rgba(239,68,68,0.55)',
      }}>M</span>
    </div>
  )
}

/* ── Corner bracket ─────────────────────────────────────────── */
function Bracket({ top, right, bottom, left }) {
  return (
    <div style={{
      position: 'absolute',
      width: 22, height: 22,
      top, right, bottom, left,
      borderTop:    top    != null ? '2px solid rgba(239,68,68,0.55)' : undefined,
      borderLeft:   left   != null ? '2px solid rgba(239,68,68,0.55)' : undefined,
      borderBottom: bottom != null ? '2px solid rgba(239,68,68,0.55)' : undefined,
      borderRight:  right  != null ? '2px solid rgba(239,68,68,0.55)' : undefined,
      borderRadius:
        top    != null && left   != null ? '16px 0 0 0' :
        top    != null && right  != null ? '0 16px 0 0' :
        bottom != null && left   != null ? '0 0 0 16px' : '0 0 16px 0',
      pointerEvents: 'none',
    }} />
  )
}

/* ── Main ───────────────────────────────────────────────────── */
export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const nextUrl = searchParams.get('next')

  const [form, setForm]       = useState({ email: '', senha: '' })
  const [touched, setTouched] = useState({ email: false, senha: false })
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [warmMsg, setWarmMsg] = useState(null)

  const set   = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))
  const touch = (k) => ()  => setTouched(t => ({ ...t, [k]: true }))

  const errors = {
    email: touched.email && !form.email.includes('@') ? 'Digite um e-mail válido' : '',
    senha: touched.senha && form.senha.length < 4    ? 'Senha muito curta'        : '',
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setTouched({ email: true, senha: true })
    if (errors.email || errors.senha || loading) return
    setLoading(true)
    setWarmMsg(null)

    const isColdErr = (err) =>
      !err.response || err.response.status === 502 || err.response.status === 503

    let lastErr = null
    for (let i = 0; i < 8; i++) {
      if (i > 0) {
        setWarmMsg(`Servidor acordando… ${i * 7}s`)
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
    <div
      className="login-grid-bg"
      style={{
        minHeight: '100vh',
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Ambient glow — top-left */}
      <div aria-hidden style={{
        position: 'absolute', top: '-15%', left: '-15%',
        width: 600, height: 600, pointerEvents: 'none', zIndex: 1,
        background: 'radial-gradient(circle, rgba(239,68,68,0.11) 0%, transparent 65%)',
        filter: 'blur(60px)',
      }} />
      {/* Ambient glow — bottom-right */}
      <div aria-hidden style={{
        position: 'absolute', bottom: '-15%', right: '-15%',
        width: 600, height: 600, pointerEvents: 'none', zIndex: 1,
        background: 'radial-gradient(circle, rgba(239,68,68,0.09) 0%, transparent 65%)',
        filter: 'blur(60px)',
      }} />

      {/* ── Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.97 }}
        animate={{ opacity: 1, y: 0,  scale: 1    }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          maxWidth: 440,
          background: '#1c1d22',
          borderRadius: 24,
          border: '1px solid rgba(255,255,255,0.055)',
          padding: 'clamp(28px,7vw,48px) clamp(20px,6vw,40px)',
          boxShadow: '0 32px 64px -12px rgba(0,0,0,0.7), 0 0 0 1px rgba(239,68,68,0.06)',
          textAlign: 'center',
        }}
      >
        {/* Corner brackets */}
        <Bracket top={0}    left={0}  />
        <Bracket top={0}    right={0} />
        <Bracket bottom={0} left={0}  />
        <Bracket bottom={0} right={0} />

        {/* ── Logo + header ── */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, marginBottom: 32 }}>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1,   opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            <LogoM />
          </motion.div>
          <div>
            <h1 style={{ fontSize: 'clamp(20px,4vw,26px)', fontWeight: 700, color: '#F4F4F5', letterSpacing: '-0.03em', marginBottom: 3 }}>
              MegaUp
            </h1>
            <h2 style={{ fontSize: 14, fontWeight: 500, color: '#A1A1AA', marginBottom: 3 }}>
              Área de Login MegaUp
            </h2>
            <p style={{ fontSize: 13, color: '#52525B' }}>
              Acesse sua conta corporativa
            </p>
          </div>
        </div>

        {/* ── Warm server alert ── */}
        <AnimatePresence>
          {warmMsg && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
              exit={{   opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.25 }}
              style={{ padding: '10px 14px', background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left', overflow: 'hidden' }}
            >
              <div style={{ width: 13, height: 13, border: '2px solid rgba(251,191,36,0.3)', borderTopColor: '#fbbf24', borderRadius: '50%', animation: 'spin 0.7s linear infinite', flexShrink: 0 }} />
              <p style={{ fontSize: 12, color: '#fbbf24', margin: 0 }}>{warmMsg}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Form ── */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14, textAlign: 'left' }}>

          {/* Email */}
          <div>
            <div style={{ position: 'relative' }}>
              <Mail
                aria-hidden
                style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', width: 17, height: 17, color: '#3f3f46', pointerEvents: 'none' }}
              />
              <input
                id="login-email"
                className="login-input"
                type="email"
                placeholder="E-mail"
                value={form.email}
                onChange={set('email')}
                onBlur={touch('email')}
                required
                autoComplete="email"
                aria-describedby={errors.email ? 'email-err' : undefined}
                style={errors.email ? { borderColor: 'rgba(239,68,68,0.7)', boxShadow: '0 0 0 4px rgba(239,68,68,0.10)' } : {}}
              />
            </div>
            <AnimatePresence>
              {errors.email && (
                <motion.p
                  id="email-err"
                  role="alert"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{   opacity: 0, y: -4 }}
                  style={{ fontSize: 11, color: '#f87171', marginTop: 5, marginLeft: 4 }}
                >
                  {errors.email}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Password */}
          <div>
            <div style={{ position: 'relative' }}>
              <Lock
                aria-hidden
                style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', width: 17, height: 17, color: '#3f3f46', pointerEvents: 'none' }}
              />
              <input
                id="login-senha"
                className="login-input login-input-password"
                type={showPass ? 'text' : 'password'}
                placeholder="Senha"
                value={form.senha}
                onChange={set('senha')}
                onBlur={touch('senha')}
                required
                autoComplete="current-password"
                aria-describedby={errors.senha ? 'senha-err' : undefined}
                style={errors.senha ? { borderColor: 'rgba(239,68,68,0.7)', boxShadow: '0 0 0 4px rgba(239,68,68,0.10)' } : {}}
              />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                aria-label={showPass ? 'Ocultar senha' : 'Mostrar senha'}
                style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#3f3f46', padding: 4, display: 'flex', alignItems: 'center', transition: 'color 150ms' }}
                onMouseEnter={e => e.currentTarget.style.color = '#A1A1AA'}
                onMouseLeave={e => e.currentTarget.style.color = '#3f3f46'}
              >
                {showPass
                  ? <EyeOff style={{ width: 16, height: 16 }} />
                  : <Eye    style={{ width: 16, height: 16 }} />
                }
              </button>
            </div>
            <AnimatePresence>
              {errors.senha && (
                <motion.p
                  id="senha-err"
                  role="alert"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{   opacity: 0, y: -4 }}
                  style={{ fontSize: 11, color: '#f87171', marginTop: 5, marginLeft: 4 }}
                >
                  {errors.senha}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Forgot link */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: -2 }}>
            <Link
              to="/esqueci-senha"
              style={{ fontSize: 13, color: '#52525B', textDecoration: 'none', fontWeight: 500, transition: 'color 150ms' }}
              onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
              onMouseLeave={e => e.currentTarget.style.color = '#52525B'}
            >
              Esqueci minha senha
            </Link>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="login-btn-submit"
            style={{ marginTop: 10 }}
          >
            {loading ? (
              <>
                <span style={{ width: 15, height: 15, border: '2px solid rgba(255,255,255,0.25)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block', flexShrink: 0 }} />
                {warmMsg ? 'Aguardando servidor…' : 'Entrando…'}
              </>
            ) : (
              <>
                <span>Entrar na Conta</span>
                <ArrowRight style={{ width: 16, height: 16 }} />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <p style={{ marginTop: 36, fontSize: 12, color: 'rgba(82,82,91,0.65)', letterSpacing: '0.2px' }}>
          MegaUp Corp &copy; 2026 &mdash; Todos os Direitos Reservados
        </p>
      </motion.div>
    </div>
  )
}
