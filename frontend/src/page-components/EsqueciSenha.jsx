import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import api from '../api/client'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'

/* ── SVG Dumbbell Logo ───────────────────────────────────────────────── */
function DumbbellSVG({ size = 32, color = '#ef4444' }) {
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

function LogoBox({ size = 68 }) {
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

function Bracket({ top, right, bottom, left }) {
  return (
    <div style={{
      position:'absolute', width:20, height:20, pointerEvents:'none',
      top, right, bottom, left,
      borderTop:    top    != null ? '2px solid rgba(239,68,68,0.38)' : undefined,
      borderLeft:   left   != null ? '2px solid rgba(239,68,68,0.38)' : undefined,
      borderBottom: bottom != null ? '2px solid rgba(239,68,68,0.38)' : undefined,
      borderRight:  right  != null ? '2px solid rgba(239,68,68,0.38)' : undefined,
      borderRadius:
        top    != null && left  != null ? '14px 0 0 0'  :
        top    != null && right != null ? '0 14px 0 0'  :
        bottom != null && left  != null ? '0 0 0 14px'  : '0 0 14px 0',
    }} />
  )
}

export default function EsqueciSenha() {
  const [email,   setEmail]   = useState('')
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
    <div style={{ minHeight:'100dvh', display:'flex', alignItems:'center', justifyContent:'center', background:'#0C0C0D', padding:'24px 16px', position:'relative', overflow:'hidden' }}>

      {/* Orbs */}
      <div aria-hidden style={{ position:'absolute', top:'-18%', left:'-8%', width:700, height:700, borderRadius:'50%', background:'radial-gradient(circle, rgba(239,68,68,0.10) 0%, transparent 65%)', filter:'blur(90px)', pointerEvents:'none', zIndex:0 }} />
      <div aria-hidden style={{ position:'absolute', bottom:'-18%', right:'-8%', width:600, height:600, borderRadius:'50%', background:'radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 65%)', filter:'blur(80px)', pointerEvents:'none', zIndex:0 }} />
      <div aria-hidden style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(rgba(255,255,255,0.016) 1px, transparent 1px)', backgroundSize:'28px 28px', pointerEvents:'none', zIndex:0 }} />

      <motion.div
        initial={{ opacity:0, y:26, scale:0.97 }}
        animate={{ opacity:1, y:0,  scale:1    }}
        transition={{ duration:0.55, ease:[0.16,1,0.3,1] }}
        style={{
          position:'relative', zIndex:10, width:'100%', maxWidth:420,
          background:'rgba(15,15,17,0.96)',
          backdropFilter:'blur(28px)', WebkitBackdropFilter:'blur(28px)',
          borderRadius:26, border:'1px solid rgba(255,255,255,0.075)',
          padding:'clamp(28px,7vw,46px) clamp(20px,6vw,42px)',
          boxShadow:'0 36px 72px -12px rgba(0,0,0,0.8), 0 0 0 1px rgba(239,68,68,0.07), inset 0 1px 0 rgba(255,255,255,0.06)',
          textAlign:'center',
        }}
      >
        <Bracket top={0}    left={0}  />
        <Bracket top={0}    right={0} />
        <Bracket bottom={0} left={0}  />
        <Bracket bottom={0} right={0} />

        {/* Logo */}
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:16, marginBottom:32 }}>
          <motion.div initial={{ scale:0.65, opacity:0 }} animate={{ scale:1, opacity:1 }} transition={{ delay:0.12, duration:0.5, ease:[0.16,1,0.3,1] }}>
            <LogoBox size={70} />
          </motion.div>
          <span style={{ fontFamily:'Inter,sans-serif', fontSize:20, fontWeight:900, color:'#F4F4F5', letterSpacing:'-0.04em' }}>MegaUp</span>
        </div>

        <AnimatePresence mode="wait">
          {enviado ? (
            <motion.div key="success"
              initial={{ opacity:0, scale:0.94 }} animate={{ opacity:1, scale:1 }}
              transition={{ duration:0.35, ease:[0.16,1,0.3,1] }}>
              <div style={{ width:68, height:68, borderRadius:'50%', background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.25)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px', boxShadow:'0 0 28px rgba(16,185,129,0.15)' }}>
                <CheckCircle style={{ width:30, height:30, color:'#34d399', filter:'drop-shadow(0 0 8px rgba(52,211,153,0.5))' }} />
              </div>
              <h2 style={{ fontFamily:'Inter,sans-serif', fontSize:22, fontWeight:900, color:'#F4F4F5', letterSpacing:'-0.04em', marginBottom:10 }}>E-mail enviado!</h2>
              <p style={{ fontSize:13, color:'rgba(255,255,255,0.4)', lineHeight:1.7, marginBottom:24 }}>
                Se existe uma conta com o e-mail{' '}
                <strong style={{ color:'rgba(255,255,255,0.7)' }}>{email}</strong>,{' '}
                você receberá um link para redefinir sua senha.
              </p>
              {devLink && (
                <div style={{ background:'rgba(99,102,241,0.07)', border:'1px solid rgba(99,102,241,0.18)', borderRadius:12, padding:'12px 16px', marginBottom:20, textAlign:'left' }}>
                  <p style={{ fontSize:11, fontWeight:700, color:'#f87171', marginBottom:6 }}>DEV — Link gerado (SMTP não configurado):</p>
                  <a href={devLink} style={{ fontSize:12, color:'#f87171', wordBreak:'break-all' }}>{devLink}</a>
                </div>
              )}
              <Link to="/login" style={{ display:'inline-flex', alignItems:'center', gap:7, fontSize:14, fontWeight:700, color:'#ef4444', textDecoration:'none', padding:'10px 20px', borderRadius:12, background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', transition:'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.background='rgba(239,68,68,0.14)' }}
                onMouseLeave={e => { e.currentTarget.style.background='rgba(239,68,68,0.08)' }}>
                <ArrowLeft style={{ width:14, height:14 }} /> Voltar ao login
              </Link>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ duration:0.2 }}>
              <div style={{ marginBottom:24, textAlign:'left' }}>
                <h2 style={{ fontFamily:'Inter,sans-serif', fontSize:19, fontWeight:900, color:'#F4F4F5', letterSpacing:'-0.03em', marginBottom:7 }}>
                  Esqueceu a senha?
                </h2>
                <p style={{ fontSize:13, color:'rgba(255,255,255,0.38)', lineHeight:1.65 }}>
                  Digite seu e-mail e enviaremos um link para redefinir sua senha.
                </p>
              </div>

              <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:14, textAlign:'left' }}>
                <div style={{ position:'relative' }}>
                  <Mail aria-hidden style={{ position:'absolute', left:16, top:'50%', transform:'translateY(-50%)', width:16, height:16, color:'rgba(255,255,255,0.28)', pointerEvents:'none' }} />
                  <input type="email" className="login-input" value={email} onChange={e => setEmail(e.target.value)} placeholder="E-mail" required autoFocus />
                </div>

                <button type="submit" disabled={loading || !email} className="login-btn-submit" style={{ marginTop:4 }}>
                  {loading ? (
                    <>
                      <span style={{ width:15, height:15, border:'2px solid rgba(255,255,255,0.25)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin 0.7s linear infinite', display:'inline-block', flexShrink:0 }} />
                      Enviando…
                    </>
                  ) : 'Enviar link de redefinição'}
                </button>
              </form>

              <div style={{ marginTop:24, textAlign:'center' }}>
                <Link to="/login"
                  style={{ display:'inline-flex', alignItems:'center', gap:6, fontSize:13, fontWeight:600, color:'rgba(255,255,255,0.32)', textDecoration:'none', transition:'color 150ms' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.32)'}>
                  <ArrowLeft style={{ width:14, height:14 }} /> Voltar ao login
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <p style={{ marginTop:34, fontSize:11, color:'rgba(82,82,91,0.45)', letterSpacing:'0.1px' }}>
          MegaUp Corp &copy; 2026 — Todos os Direitos Reservados
        </p>
      </motion.div>
    </div>
  )
}
