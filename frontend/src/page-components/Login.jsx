import { useState } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

/* ── SVG Dumbbell Logo ───────────────────────────────────────────────── */
function DumbbellSVG({ size = 32, color = '#E8342B' }) {
  return (
    <svg width={size} height={Math.round(size * 0.54)} viewBox="0 0 50 27" fill="none" aria-hidden>
      {/* left outer plate */}
      <rect x="0.5"  y="4"   width="8"  height="19" rx="3"   fill={color} />
      {/* left inner plate */}
      <rect x="8.5"  y="7.5" width="5"  height="12" rx="2"   fill={color} />
      {/* bar */}
      <rect x="13.5" y="11.5" width="23" height="4"  rx="2"   fill={color} />
      {/* right inner plate */}
      <rect x="36.5" y="7.5" width="5"  height="12" rx="2"   fill={color} />
      {/* right outer plate */}
      <rect x="41.5" y="4"   width="8"  height="19" rx="3"   fill={color} />
    </svg>
  )
}

/* ── Logo box ────────────────────────────────────────────────────────── */
function LogoBox({ size = 72 }) {
  return (
    <div style={{
      width: size, height: size, flexShrink: 0,
      background: 'linear-gradient(145deg, #1e1f26, #111113)',
      border: '1.5px solid rgba(232,52,43,0.45)',
      borderRadius: Math.round(size * 0.26),
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: [
        '0 0 36px rgba(232,52,43,0.28)',
        '0 0 12px rgba(232,52,43,0.14) inset',
        'inset 0 1px 0 rgba(255,255,255,0.08)',
      ].join(', '),
    }}>
      <DumbbellSVG size={Math.round(size * 0.48)} color="#E8342B" />
    </div>
  )
}

/* ── Corner bracket ──────────────────────────────────────────────────── */
function Bracket({ top, right, bottom, left }) {
  return (
    <div style={{
      position: 'absolute', width: 20, height: 20, pointerEvents: 'none',
      top, right, bottom, left,
      borderTop:    top    != null ? '2px solid rgba(232,52,43,0.38)' : undefined,
      borderLeft:   left   != null ? '2px solid rgba(232,52,43,0.38)' : undefined,
      borderBottom: bottom != null ? '2px solid rgba(232,52,43,0.38)' : undefined,
      borderRight:  right  != null ? '2px solid rgba(232,52,43,0.38)' : undefined,
      borderRadius:
        top    != null && left   != null ? '14px 0 0 0'  :
        top    != null && right  != null ? '0 14px 0 0'  :
        bottom != null && left   != null ? '0 0 0 14px'  : '0 0 14px 0',
    }} />
  )
}

/* ── Left panel features ─────────────────────────────────────────────── */
const FEATURES = [
  { icon: '🏋️', label: 'Treinos personalizados',   sub: 'Ficha criada pelo seu personal trainer' },
  { icon: '📊', label: 'Acompanhe sua evolução',    sub: 'Histórico de cargas, séries e recordes pessoais' },
  { icon: '🤖', label: 'IA de progressão de carga', sub: 'Sugestões inteligentes com Claude AI' },
]

/* ── Main ────────────────────────────────────────────────────────────── */
export default function Login() {
  const { login }    = useAuth()
  const navigate     = useNavigate()
  const [sp]         = useSearchParams()
  const nextUrl      = sp.get('next')

  const [form,    setForm]    = useState({ email: '', senha: '' })
  const [touched, setTouched] = useState({ email: false, senha: false })
  const [loading, setLoading] = useState(false)
  const [showPw,  setShowPw]  = useState(false)
  const [warmMsg, setWarmMsg] = useState(null)

  const set   = k => e => setForm(f => ({ ...f, [k]: e.target.value }))
  const touch = k => ()  => setTouched(t => ({ ...t, [k]: true }))

  const errors = {
    email: touched.email && !form.email.includes('@') ? 'Digite um e-mail válido' : '',
    senha: touched.senha && form.senha.length < 4    ? 'Senha muito curta'        : '',
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setTouched({ email: true, senha: true })
    if (errors.email || errors.senha || loading) return
    setLoading(true); setWarmMsg(null)
    const cold = err => !err.response || [502, 503].includes(err.response?.status)
    let last = null
    for (let i = 0; i < 8; i++) {
      if (i > 0) { setWarmMsg(`Servidor acordando… ${i * 7}s`); await new Promise(r => setTimeout(r, 7000)) }
      try {
        const u = await login(form.email, form.senha)
        return navigate(nextUrl || (u?.role === 'aluno' ? '/aluno' : '/dashboard'))
      } catch (err) { last = err; if (!cold(err)) break }
    }
    setWarmMsg(null); setLoading(false)
    const st = last?.response?.status, dt = last?.response?.data?.detail
    if (st === 401 || st === 403) toast.error('E-mail ou senha incorretos.')
    else if (cold(last)) toast.error('Servidor não respondeu. Tente novamente.')
    else toast.error(typeof dt === 'string' ? dt : 'Erro ao entrar. Tente novamente.')
  }

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', background: '#0D0D0F', overflow: 'hidden', position: 'relative' }}>

      {/* ── Global orbs ── */}
      <div aria-hidden style={{ position:'absolute', top:'-18%',  left:'-8%',  width:700, height:700, borderRadius:'50%', background:'radial-gradient(circle, rgba(232,52,43,0.10) 0%, transparent 65%)', filter:'blur(90px)', pointerEvents:'none', zIndex:0 }} />
      <div aria-hidden style={{ position:'absolute', bottom:'-18%',right:'-8%', width:600, height:600, borderRadius:'50%', background:'radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 65%)',  filter:'blur(80px)', pointerEvents:'none', zIndex:0 }} />
      {/* dot grid */}
      <div aria-hidden style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(rgba(255,255,255,0.016) 1px, transparent 1px)', backgroundSize:'28px 28px', pointerEvents:'none', zIndex:0 }} />

      {/* ── LEFT HERO (desktop only via CSS) ── */}
      <div className="login-left-panel">
        {/* watermark dumbbell */}
        <div aria-hidden style={{ position:'absolute', bottom:-60, right:-80, pointerEvents:'none', opacity:0.035, transform:'rotate(-18deg)' }}>
          <svg width="520" height="280" viewBox="0 0 50 27" fill="white">
            <rect x="0.5" y="4" width="8" height="19" rx="3" fill="white"/>
            <rect x="8.5" y="7.5" width="5" height="12" rx="2" fill="white"/>
            <rect x="13.5" y="11.5" width="23" height="4" rx="2" fill="white"/>
            <rect x="36.5" y="7.5" width="5" height="12" rx="2" fill="white"/>
            <rect x="41.5" y="4" width="8" height="19" rx="3" fill="white"/>
          </svg>
        </div>

        <motion.div initial={{ opacity:0, x:-28 }} animate={{ opacity:1, x:0 }} transition={{ duration:0.65, ease:[0.16,1,0.3,1] }} style={{ position:'relative', zIndex:1 }}>
          {/* Brand */}
          <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:52 }}>
            <LogoBox size={50} />
            <span style={{ fontFamily:'Inter,sans-serif', fontWeight:900, fontSize:21, color:'#F4F4F5', letterSpacing:'-0.04em' }}>MegaUp</span>
          </div>

          {/* Hero text */}
          <div style={{ marginBottom:52 }}>
            <h1 style={{ fontFamily:'Inter,sans-serif', fontSize:'clamp(32px,3.5vw,46px)', fontWeight:900, color:'#F4F4F5', letterSpacing:'-0.055em', lineHeight:1.08, marginBottom:18 }}>
              Transforme cada<br/>
              <span style={{ color:'#E8342B', textShadow:'0 0 48px rgba(232,52,43,0.55)' }}>treino</span>{' '}em<br/>resultado.
            </h1>
            <p style={{ fontSize:14, color:'rgba(255,255,255,0.42)', lineHeight:1.7, maxWidth:320 }}>
              Plataforma completa para personal trainers e academias gerenciarem alunos com inteligência artificial.
            </p>
          </div>

          {/* Feature bullets */}
          <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
            {FEATURES.map(({ icon, label, sub }, i) => (
              <motion.div key={label}
                initial={{ opacity:0, x:-16 }} animate={{ opacity:1, x:0 }}
                transition={{ delay:0.18 + i * 0.09, duration:0.5, ease:[0.16,1,0.3,1] }}
                style={{ display:'flex', alignItems:'flex-start', gap:14 }}>
                <div style={{ width:40, height:40, borderRadius:12, background:'rgba(232,52,43,0.1)', border:'1px solid rgba(232,52,43,0.18)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0, boxShadow:'0 0 16px rgba(232,52,43,0.08)' }}>
                  {icon}
                </div>
                <div>
                  <p style={{ fontSize:14, fontWeight:700, color:'#F4F4F5', letterSpacing:'-0.01em', marginBottom:2 }}>{label}</p>
                  <p style={{ fontSize:12, color:'rgba(255,255,255,0.35)' }}>{sub}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── RIGHT FORM ── */}
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'24px 16px', position:'relative', zIndex:1 }}>
        <motion.div
          initial={{ opacity:0, y:26, scale:0.97 }}
          animate={{ opacity:1, y:0,  scale:1    }}
          transition={{ duration:0.55, ease:[0.16,1,0.3,1] }}
          style={{
            width:'100%', maxWidth:420, position:'relative',
            background:'rgba(15,15,17,0.96)',
            backdropFilter:'blur(28px)', WebkitBackdropFilter:'blur(28px)',
            borderRadius:26,
            border:'1px solid rgba(255,255,255,0.075)',
            padding:'clamp(28px,7vw,46px) clamp(20px,6vw,42px)',
            boxShadow:[
              '0 36px 72px -12px rgba(0,0,0,0.8)',
              '0 0 0 1px rgba(232,52,43,0.07)',
              'inset 0 1px 0 rgba(255,255,255,0.06)',
            ].join(', '),
          }}
        >
          <Bracket top={0}    left={0}  />
          <Bracket top={0}    right={0} />
          <Bracket bottom={0} left={0}  />
          <Bracket bottom={0} right={0} />

          {/* Logo + title */}
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:18, marginBottom:36, textAlign:'center' }}>
            <motion.div initial={{ scale:0.65, opacity:0 }} animate={{ scale:1, opacity:1 }} transition={{ delay:0.14, duration:0.5, ease:[0.16,1,0.3,1] }}>
              <LogoBox size={76} />
            </motion.div>
            <div>
              <h2 style={{ fontFamily:'Inter,sans-serif', fontSize:22, fontWeight:900, color:'#F4F4F5', letterSpacing:'-0.04em', marginBottom:5 }}>
                Bem-vindo de volta
              </h2>
              <p style={{ fontSize:13, color:'rgba(255,255,255,0.35)', fontWeight:400 }}>Entre com suas credenciais de acesso</p>
            </div>
          </div>

          {/* Warm alert */}
          <AnimatePresence>
            {warmMsg && (
              <motion.div
                initial={{ opacity:0, height:0, marginBottom:0 }}
                animate={{ opacity:1, height:'auto', marginBottom:16 }}
                exit={{   opacity:0, height:0, marginBottom:0 }}
                transition={{ duration:0.25 }}
                style={{ padding:'10px 14px', background:'rgba(251,191,36,0.07)', border:'1px solid rgba(251,191,36,0.2)', borderRadius:12, display:'flex', alignItems:'center', gap:10, textAlign:'left', overflow:'hidden' }}>
                <div style={{ width:13, height:13, border:'2px solid rgba(251,191,36,0.3)', borderTopColor:'#fbbf24', borderRadius:'50%', animation:'spin 0.7s linear infinite', flexShrink:0 }} />
                <p style={{ fontSize:12, color:'#fbbf24', margin:0 }}>{warmMsg}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:14, textAlign:'left' }}>

            {/* Email */}
            <div>
              <div style={{ position:'relative' }}>
                <Mail aria-hidden style={{ position:'absolute', left:16, top:'50%', transform:'translateY(-50%)', width:16, height:16, color:'rgba(255,255,255,0.28)', pointerEvents:'none' }} />
                <input type="email" className="login-input" placeholder="E-mail"
                  value={form.email} onChange={set('email')} onBlur={touch('email')}
                  required autoComplete="email"
                  style={errors.email ? { borderColor:'rgba(232,52,43,0.6)', boxShadow:'0 0 0 4px rgba(232,52,43,0.10)' } : {}} />
              </div>
              <AnimatePresence>
                {errors.email && (
                  <motion.p initial={{ opacity:0, y:-4 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-4 }}
                    style={{ fontSize:11, color:'#FF8078', marginTop:5, marginLeft:4 }}>{errors.email}</motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Password */}
            <div>
              <div style={{ position:'relative' }}>
                <Lock aria-hidden style={{ position:'absolute', left:16, top:'50%', transform:'translateY(-50%)', width:16, height:16, color:'rgba(255,255,255,0.28)', pointerEvents:'none' }} />
                <input type={showPw ? 'text' : 'password'} className="login-input login-input-password"
                  placeholder="Senha" value={form.senha} onChange={set('senha')} onBlur={touch('senha')}
                  required autoComplete="current-password"
                  style={errors.senha ? { borderColor:'rgba(232,52,43,0.6)', boxShadow:'0 0 0 4px rgba(232,52,43,0.10)' } : {}} />
                <button type="button" onClick={() => setShowPw(v => !v)} aria-label={showPw ? 'Ocultar senha' : 'Mostrar senha'}
                  style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.28)', padding:4, display:'flex', alignItems:'center', transition:'color 150ms' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.28)'}>
                  {showPw ? <EyeOff style={{ width:16, height:16 }} /> : <Eye style={{ width:16, height:16 }} />}
                </button>
              </div>
              <AnimatePresence>
                {errors.senha && (
                  <motion.p initial={{ opacity:0, y:-4 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-4 }}
                    style={{ fontSize:11, color:'#FF8078', marginTop:5, marginLeft:4 }}>{errors.senha}</motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Forgot */}
            <div style={{ display:'flex', justifyContent:'flex-end', marginTop:-2 }}>
              <Link to="/esqueci-senha"
                style={{ fontSize:13, color:'rgba(255,255,255,0.32)', textDecoration:'none', fontWeight:500, transition:'color 150ms' }}
                onMouseEnter={e => e.currentTarget.style.color = '#E8342B'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.32)'}>
                Esqueci minha senha
              </Link>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading} className="login-btn-submit" style={{ marginTop:10 }}>
              {loading ? (
                <>
                  <span style={{ width:15, height:15, border:'2px solid rgba(255,255,255,0.25)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin 0.7s linear infinite', display:'inline-block', flexShrink:0 }} />
                  {warmMsg ? 'Aguardando servidor…' : 'Entrando…'}
                </>
              ) : (
                <>
                  <span>Entrar na Conta</span>
                  <ArrowRight style={{ width:16, height:16 }} />
                </>
              )}
            </button>
          </form>

          <p style={{ marginTop:34, fontSize:11, color:'rgba(82,82,91,0.45)', textAlign:'center', letterSpacing:'0.1px' }}>
            MegaUp Corp &copy; 2026 — Todos os Direitos Reservados
          </p>
        </motion.div>
      </div>
    </div>
  )
}
