import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import api from '../api/client'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'

function LogoM() {
  return (
    <div style={{
      width: 60, height: 60,
      background: 'linear-gradient(145deg, #272930 0%, #16171c 100%)',
      border: '2px solid #ef4444',
      borderRadius: 16,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 0 28px rgba(239,68,68,0.28), 0 0 8px rgba(239,68,68,0.12) inset',
      position: 'relative', flexShrink: 0,
    }}>
      <div style={{ position: 'absolute', inset: 0, borderRadius: 14, overflow: 'hidden', pointerEvents: 'none', backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.015) 0px, rgba(255,255,255,0.015) 2px, transparent 2px, transparent 8px)' }} />
      <span style={{ fontSize: 26, fontWeight: 800, color: '#ef4444', letterSpacing: '-2px', lineHeight: 1, position: 'relative', fontFamily: "'Inter', sans-serif", textShadow: '0 0 20px rgba(239,68,68,0.55)' }}>M</span>
    </div>
  )
}

function Bracket({ top, right, bottom, left }) {
  return (
    <div style={{
      position: 'absolute', width: 22, height: 22, top, right, bottom, left,
      borderTop:    top    != null ? '2px solid rgba(239,68,68,0.55)' : undefined,
      borderLeft:   left   != null ? '2px solid rgba(239,68,68,0.55)' : undefined,
      borderBottom: bottom != null ? '2px solid rgba(239,68,68,0.55)' : undefined,
      borderRight:  right  != null ? '2px solid rgba(239,68,68,0.55)' : undefined,
      borderRadius:
        top != null && left  != null ? '16px 0 0 0' :
        top != null && right != null ? '0 16px 0 0' :
        bottom != null && left != null ? '0 0 0 16px' : '0 0 16px 0',
      pointerEvents: 'none',
    }} />
  )
}

export default function EsqueciSenha() {
  const [email, setEmail]   = useState('')
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
    <div
      className="login-grid-bg"
      style={{
        minHeight: '100vh', minHeight: '100dvh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px 16px', position: 'relative', overflow: 'hidden',
      }}
    >
      <div aria-hidden style={{ position: 'absolute', top: '-15%', left: '-15%', width: 600, height: 600, pointerEvents: 'none', zIndex: 1, background: 'radial-gradient(circle, rgba(239,68,68,0.11) 0%, transparent 65%)', filter: 'blur(60px)' }} />
      <div aria-hidden style={{ position: 'absolute', bottom: '-15%', right: '-15%', width: 600, height: 600, pointerEvents: 'none', zIndex: 1, background: 'radial-gradient(circle, rgba(239,68,68,0.09) 0%, transparent 65%)', filter: 'blur(60px)' }} />

      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.97 }}
        animate={{ opacity: 1, y: 0,  scale: 1    }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'relative', zIndex: 10,
          width: '100%', maxWidth: 440,
          background: '#1c1d22',
          borderRadius: 24,
          border: '1px solid rgba(255,255,255,0.055)',
          padding: 'clamp(28px,7vw,48px) clamp(20px,6vw,40px)',
          boxShadow: '0 32px 64px -12px rgba(0,0,0,0.7), 0 0 0 1px rgba(239,68,68,0.06)',
          textAlign: 'center',
        }}
      >
        <Bracket top={0} left={0} />
        <Bracket top={0} right={0} />
        <Bracket bottom={0} left={0} />
        <Bracket bottom={0} right={0} />

        {/* Logo */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginBottom: 28 }}>
          <LogoM />
          <span style={{ fontSize: 20, fontWeight: 700, color: '#F4F4F5', letterSpacing: '-0.03em' }}>MegaUp</span>
        </div>

        <AnimatePresence mode="wait">
          {enviado ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              style={{ textAlign: 'center' }}
            >
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <CheckCircle style={{ width: 30, height: 30, color: '#34d399' }} />
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#F4F4F5', marginBottom: 10 }}>Email enviado!</h2>
              <p style={{ fontSize: 13, color: '#71717A', lineHeight: 1.65, marginBottom: 24 }}>
                Se existe uma conta com o email{' '}
                <strong style={{ color: '#A1A1AA' }}>{email}</strong>,{' '}
                você receberá um link para redefinir sua senha.
              </p>
              {devLink && (
                <div style={{ background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.18)', borderRadius: 12, padding: '12px 16px', marginBottom: 20, textAlign: 'left' }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: '#f87171', marginBottom: 6 }}>DEV — Link gerado (SMTP não configurado):</p>
                  <a href={devLink} style={{ fontSize: 12, color: '#f87171', wordBreak: 'break-all' }}>{devLink}</a>
                </div>
              )}
              <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 600, color: '#ef4444', textDecoration: 'none' }}>
                <ArrowLeft style={{ width: 14, height: 14 }} /> Voltar ao login
              </Link>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
              <div style={{ marginBottom: 24, textAlign: 'left' }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#F4F4F5', letterSpacing: '-0.02em', marginBottom: 6 }}>
                  Esqueceu a senha?
                </h2>
                <p style={{ fontSize: 13, color: '#71717A', lineHeight: 1.6 }}>
                  Digite seu e-mail e enviaremos um link para redefinir sua senha.
                </p>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ position: 'relative' }}>
                  <Mail aria-hidden style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', width: 17, height: 17, color: '#3f3f46', pointerEvents: 'none' }} />
                  <input
                    type="email"
                    className="login-input"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="E-mail"
                    required
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !email}
                  className="login-btn-submit"
                  style={{ marginTop: 6 }}
                >
                  {loading ? (
                    <>
                      <span style={{ width: 15, height: 15, border: '2px solid rgba(255,255,255,0.25)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block', flexShrink: 0 }} />
                      Enviando…
                    </>
                  ) : 'Enviar link de redefinição'}
                </button>
              </form>

              <div style={{ marginTop: 24, textAlign: 'center' }}>
                <Link
                  to="/login"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#52525B', textDecoration: 'none', transition: 'color 150ms' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#A1A1AA'}
                  onMouseLeave={e => e.currentTarget.style.color = '#52525B'}
                >
                  <ArrowLeft style={{ width: 14, height: 14 }} /> Voltar ao login
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <p style={{ marginTop: 36, fontSize: 12, color: 'rgba(82,82,91,0.65)', letterSpacing: '0.2px' }}>
          MegaUp Corp &copy; 2026 &mdash; Todos os Direitos Reservados
        </p>
      </motion.div>
    </div>
  )
}
