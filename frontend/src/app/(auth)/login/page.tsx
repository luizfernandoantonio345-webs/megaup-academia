'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/auth-context'
import { useQueryClient } from '@tanstack/react-query'
import { listarAlunos, analyticsResumo } from '@/lib/api-routes'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import { Mail, Lock, Eye, EyeOff, ArrowRight, TrendingUp, Users, Zap } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

/* ── Dumbbell SVG logo ─────────────────────────────────────────────── */
function DumbbellSVG({ size = 32, color = '#ef4444' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={Math.round(size * 0.54)} viewBox="0 0 50 27" fill="none" aria-hidden>
      <rect x="0.5"  y="4"    width="8"  height="19" rx="3" fill={color} />
      <rect x="8.5"  y="7.5"  width="5"  height="12" rx="2" fill={color} />
      <rect x="13.5" y="11.5" width="23" height="4"  rx="2" fill={color} />
      <rect x="36.5" y="7.5"  width="5"  height="12" rx="2" fill={color} />
      <rect x="41.5" y="4"    width="8"  height="19" rx="3" fill={color} />
    </svg>
  )
}

function LogoBox({ size = 68 }: { size?: number }) {
  return (
    <div style={{
      width: size, height: size, flexShrink: 0,
      background: 'linear-gradient(145deg, #1e1f26, #111113)',
      border: '1.5px solid rgba(239,68,68,0.45)',
      borderRadius: Math.round(size * 0.26),
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 0 36px rgba(239,68,68,0.28), 0 0 12px rgba(239,68,68,0.14) inset, inset 0 1px 0 rgba(255,255,255,0.08)',
    }}>
      <DumbbellSVG size={Math.round(size * 0.48)} color="#ef4444" />
    </div>
  )
}

function Bracket({ top, right, bottom, left }: { top?: number; right?: number; bottom?: number; left?: number }) {
  return (
    <div style={{
      position: 'absolute', width: 22, height: 22, pointerEvents: 'none',
      top, right, bottom, left,
      borderTop:    top    != null ? '2px solid rgba(239,68,68,0.38)' : undefined,
      borderLeft:   left   != null ? '2px solid rgba(239,68,68,0.38)' : undefined,
      borderBottom: bottom != null ? '2px solid rgba(239,68,68,0.38)' : undefined,
      borderRight:  right  != null ? '2px solid rgba(239,68,68,0.38)' : undefined,
      borderRadius:
        top != null && left  != null ? '14px 0 0 0'  :
        top != null && right != null ? '0 14px 0 0'  :
        bottom != null && left  != null ? '0 0 0 14px'  : '0 0 14px 0',
    }} />
  )
}

const FEATURES = [
  { Icon: TrendingUp, text: 'Acompanhamento em tempo real de treinos e resultados' },
  { Icon: Users,      text: 'Gestão completa de alunos, professores e planos' },
  { Icon: Zap,        text: 'IA de progressão de cargas personalizada por aluno' },
]

function LoginContent() {
  const { login } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()
  const nextUrl = searchParams?.get('next')

  const [form, setForm] = useState({ email: '', senha: '' })
  const [touched, setTouched] = useState({ email: false, senha: false })
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [warmMsg, setWarmMsg] = useState<string | null>(null)

  // Pre-warm backend on mount — so server is alive before user clicks submit
  useEffect(() => {
    api.get('/health', { timeout: 30_000 }).catch(() => {})
  }, [])

  const set = (k: 'email' | 'senha') => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))
  const touch = (k: 'email' | 'senha') => () =>
    setTouched((t) => ({ ...t, [k]: true }))

  const errors = {
    email: touched.email && !form.email.includes('@') ? 'Digite um e-mail válido' : '',
    senha: touched.senha && form.senha.length < 4 ? 'Senha muito curta' : '',
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setTouched({ email: true, senha: true })
    if (errors.email || errors.senha || loading) return
    setLoading(true)
    setWarmMsg(null)

    const isColdErr = (err: { response?: { status: number } }) =>
      !err.response || err.response.status === 502 || err.response.status === 503

    let lastErr: { response?: { status: number; data?: { detail?: string } } } | null = null
    for (let i = 0; i < 8; i++) {
      if (i > 0) {
        setWarmMsg(`Servidor acordando… ${i * 7}s`)
        await new Promise((r) => setTimeout(r, 7000))
      }
      try {
        const user = await login(form.email, form.senha)
        // Prefetch critical data while token is fresh — dashboard loads from cache
        if (user?.role !== 'aluno') {
          await Promise.all([
            queryClient.prefetchQuery({ queryKey: ['alunos'], queryFn: listarAlunos, staleTime: 60_000 }),
            queryClient.prefetchQuery({ queryKey: ['analytics-resumo', 7], queryFn: () => analyticsResumo(7), staleTime: 60_000 }),
          ])
        }
        router.push(nextUrl || (user?.role === 'aluno' ? '/aluno' : '/dashboard'))
        return
      } catch (err) {
        lastErr = err as typeof lastErr
        if (!isColdErr(lastErr!)) break
      }
    }

    setWarmMsg(null)
    setLoading(false)
    const status = lastErr?.response?.status
    const detail = lastErr?.response?.data?.detail
    if (status === 401 || status === 403) {
      toast.error('E-mail ou senha incorretos.')
    } else if (isColdErr(lastErr!)) {
      toast.error('Servidor não respondeu. Tente novamente em instantes.')
    } else {
      toast.error(typeof detail === 'string' ? detail : 'Erro ao entrar. Tente novamente.')
    }
  }

  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', background: '#0C0C0D',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Ambient orbs */}
      <div aria-hidden style={{ position: 'absolute', top: '-15%', left: '-8%', width: 650, height: 650, borderRadius: '50%', background: 'radial-gradient(circle,rgba(239,68,68,0.10) 0%,transparent 65%)', filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0 }} />
      <div aria-hidden style={{ position: 'absolute', bottom: '-15%', right: '-8%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle,rgba(99,102,241,0.07) 0%,transparent 65%)', filter: 'blur(70px)', pointerEvents: 'none', zIndex: 0 }} />
      {/* Dot grid */}
      <div aria-hidden style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.016) 1px,transparent 1px)', backgroundSize: '28px 28px', pointerEvents: 'none', zIndex: 0 }} />

      {/* ── LEFT HERO PANEL (hidden mobile, shown ≥900px) ── */}
      <div className="login-left-panel" style={{ position: 'relative', zIndex: 10 }}>
        <div aria-hidden style={{ position: 'absolute', left: 0, top: '12%', bottom: '12%', width: 1, background: 'linear-gradient(180deg,transparent,rgba(239,68,68,0.38) 30%,rgba(239,68,68,0.38) 70%,transparent)', pointerEvents: 'none' }} />

        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
          {/* Brand row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 64 }}>
            <LogoBox size={48} />
            <span style={{ fontSize: 22, fontWeight: 900, color: '#F4F4F5', letterSpacing: '-0.04em' }}>MegaUp</span>
          </div>

          {/* Headline */}
          <div style={{ marginBottom: 52 }}>
            <h1 style={{ fontSize: 'clamp(30px,3.5vw,44px)', fontWeight: 900, color: '#F4F4F5', letterSpacing: '-0.045em', lineHeight: 1.1, marginBottom: 18 }}>
              Transforme cada{' '}
              <span style={{ color: '#ef4444', textShadow: '0 0 40px rgba(239,68,68,0.55)' }}>treino</span>{' '}
              em resultado.
            </h1>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.4)', lineHeight: 1.7 }}>
              Plataforma completa para gestão de academia,<br />alunos e progressão de cargas com IA.
            </p>
          </div>

          {/* Feature bullets */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {FEATURES.map(({ Icon, text }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}
              >
                <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                  <Icon style={{ width: 15, height: 15, color: '#f87171' }} />
                </div>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.65, margin: 0 }}>{text}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Watermark dumbbell */}
        <div aria-hidden style={{ position: 'absolute', bottom: 44, left: 56, opacity: 0.04 }}>
          <DumbbellSVG size={130} color="#ef4444" />
        </div>
      </div>

      {/* ── RIGHT FORM PANEL ── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', position: 'relative', zIndex: 10 }}>
        <motion.div
          initial={{ opacity: 0, y: 28, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          style={{
            width: '100%', maxWidth: 420, position: 'relative',
            background: 'rgba(15,15,17,0.96)',
            backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)',
            borderRadius: 26, border: '1px solid rgba(255,255,255,0.075)',
            padding: 'clamp(28px,7vw,48px) clamp(20px,6vw,44px)',
            boxShadow: '0 36px 72px -12px rgba(0,0,0,0.8),0 0 0 1px rgba(239,68,68,0.07),inset 0 1px 0 rgba(255,255,255,0.06)',
            textAlign: 'center',
          } as React.CSSProperties}
        >
          <Bracket top={0}    left={0}  />
          <Bracket top={0}    right={0} />
          <Bracket bottom={0} left={0}  />
          <Bracket bottom={0} right={0} />

          {/* Logo */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, marginBottom: 32 }}>
            <motion.div initial={{ scale: 0.75, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.15, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
              <LogoBox size={70} />
            </motion.div>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 900, color: '#F4F4F5', letterSpacing: '-0.04em', marginBottom: 5 }}>MegaUp</h2>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.32)' }}>Acesse sua conta para continuar</p>
            </div>
          </div>

          {/* Warm-up banner */}
          <AnimatePresence>
            {warmMsg && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.25 }}
                style={{ padding: '10px 14px', background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left', overflow: 'hidden' }}
              >
                <div style={{ width: 13, height: 13, border: '2px solid rgba(251,191,36,0.3)', borderTopColor: '#fbbf24', borderRadius: '50%', animation: 'spin 0.7s linear infinite', flexShrink: 0 }} />
                <p style={{ fontSize: 12, color: '#fbbf24', margin: 0 }}>{warmMsg}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14, textAlign: 'left' }}>
            <div>
              <div style={{ position: 'relative' }}>
                <Mail aria-hidden style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', width: 17, height: 17, color: 'rgba(255,255,255,0.22)', pointerEvents: 'none' }} />
                <input
                  id="login-email" className="login-input" type="email"
                  placeholder="E-mail" value={form.email}
                  onChange={set('email')} onBlur={touch('email')}
                  required autoComplete="email"
                  style={errors.email ? { borderColor: 'rgba(239,68,68,0.7)', boxShadow: '0 0 0 4px rgba(239,68,68,0.10)' } : {}}
                />
              </div>
              <AnimatePresence>
                {errors.email && (
                  <motion.p role="alert" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} style={{ fontSize: 11, color: '#f87171', marginTop: 5, marginLeft: 4 }}>
                    {errors.email}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <div>
              <div style={{ position: 'relative' }}>
                <Lock aria-hidden style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', width: 17, height: 17, color: 'rgba(255,255,255,0.22)', pointerEvents: 'none' }} />
                <input
                  id="login-senha" className="login-input login-input-password"
                  type={showPass ? 'text' : 'password'}
                  placeholder="Senha" value={form.senha}
                  onChange={set('senha')} onBlur={touch('senha')}
                  required autoComplete="current-password"
                  style={errors.senha ? { borderColor: 'rgba(239,68,68,0.7)', boxShadow: '0 0 0 4px rgba(239,68,68,0.10)' } : {}}
                />
                <button
                  type="button" onClick={() => setShowPass((v) => !v)}
                  aria-label={showPass ? 'Ocultar senha' : 'Mostrar senha'}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.28)', padding: 4, display: 'flex', alignItems: 'center' }}
                >
                  {showPass ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
                </button>
              </div>
              <AnimatePresence>
                {errors.senha && (
                  <motion.p role="alert" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} style={{ fontSize: 11, color: '#f87171', marginTop: 5, marginLeft: 4 }}>
                    {errors.senha}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: -2 }}>
              <Link
                href="/esqueci-senha"
                style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', textDecoration: 'none', fontWeight: 600, transition: 'color 150ms' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.65)' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.3)' }}
              >
                Esqueci minha senha
              </Link>
            </div>

            <button type="submit" disabled={loading} className="login-btn-submit" style={{ marginTop: 10 }}>
              {loading ? (
                <>
                  <span style={{ width: 15, height: 15, border: '2px solid rgba(255,255,255,0.25)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block', flexShrink: 0 }} />
                  {warmMsg ? 'Aguardando servidor…' : 'Entrando…'}
                </>
              ) : (
                <><span>Entrar na Conta</span><ArrowRight style={{ width: 16, height: 16 }} /></>
              )}
            </button>
          </form>

          <p style={{ marginTop: 36, fontSize: 11, color: 'rgba(82,82,91,0.45)' }}>
            MegaUp Corp &copy; 2026 &mdash; Todos os Direitos Reservados
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  )
}
