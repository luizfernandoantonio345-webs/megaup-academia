import { useState, useEffect, useCallback } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Dumbbell, Trophy, LogOut, Zap, CalendarDays, MessageCircle, CheckCircle, Bell, BellOff, Download, X } from 'lucide-react'
import OnboardingAluno from '../../components/OnboardingAluno'
import { getVapidPublicKey, subscribePush, unsubscribePush } from '../../api/index'
import toast from 'react-hot-toast'

/* ── Color helpers ──────────────────────────────────────────────────── */
const ALPHA_COLORS = {
  A:'#6366f1',B:'#ec4899',C:'#f97316',D:'#22c55e',E:'#a855f7',F:'#06b6d4',
  G:'#ef4444',H:'#eab308',I:'#14b8a6',J:'#8b5cf6',K:'#f43f5e',L:'#10b981',
  M:'#3b82f6',N:'#fb923c',O:'#84cc16',P:'#e879f9',Q:'#2dd4bf',R:'#f472b6',
  S:'#38bdf8',T:'#4ade80',U:'#fbbf24',V:'#818cf8',W:'#34d399',X:'#f87171',
  Y:'#a78bfa',Z:'#60a5fa',
}
const nameColor = (n) => ALPHA_COLORS[(n || 'A')[0].toUpperCase()] ?? '#6366f1'

/* ── PWA install hook ───────────────────────────────────────────────── */
function usePwaInstall(userId) {
  const [prompt, setPrompt] = useState(null)
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (localStorage.getItem(`megaup_pwa_dismissed_${userId}`)) return
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone
    if (isStandalone) return
    const handler = (e) => { e.preventDefault(); setPrompt(e); setShow(true) }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [userId])

  const install  = async () => { if (!prompt) return; prompt.prompt(); const { outcome } = await prompt.userChoice; if (outcome === 'accepted') setShow(false) }
  const dismiss  = () => { localStorage.setItem(`megaup_pwa_dismissed_${userId}`, '1'); setShow(false) }
  return { show, install, dismiss }
}

/* ── Push subscription hook ─────────────────────────────────────────── */
function urlBase64ToUint8Array(b64) {
  const pad = '='.repeat((4 - b64.length % 4) % 4)
  const raw = atob((b64 + pad).replace(/-/g,'+').replace(/_/g,'/'))
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)))
}

function usePushSubscription() {
  const [subscribed, setSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)
  const supported = 'serviceWorker' in navigator && 'PushManager' in window

  useEffect(() => {
    if (!supported) return
    navigator.serviceWorker.ready.then(r => r.pushManager.getSubscription()).then(s => setSubscribed(!!s)).catch(() => {})
  }, [supported])

  const toggle = useCallback(async () => {
    if (!supported || loading) return
    setLoading(true)
    try {
      const reg      = await navigator.serviceWorker.ready
      const existing = await reg.pushManager.getSubscription()
      if (existing) {
        await unsubscribePush({ endpoint: existing.endpoint, p256dh: '', auth: '' })
        await existing.unsubscribe()
        setSubscribed(false)
      } else {
        if ((await Notification.requestPermission()) !== 'granted') return
        const { data } = await getVapidPublicKey()
        const sub      = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(data.public_key) })
        const keys     = sub.toJSON().keys
        await subscribePush({ endpoint: sub.endpoint, p256dh: keys.p256dh, auth: keys.auth })
        setSubscribed(true)
      }
    } catch { toast.error('Não foi possível ativar notificações.') }
    finally { setLoading(false) }
  }, [supported, loading])

  return { subscribed, loading, supported, toggle }
}

/* ── Nav tabs ───────────────────────────────────────────────────────── */
const TABS = [
  { to:'/aluno',            icon:Dumbbell,      label:'Treino',   color:'#ef4444', end:true  },
  { to:'/aluno/semana',     icon:CalendarDays,  label:'Semana',   color:'#6366f1', end:false },
  { to:'/aluno/checkins',   icon:CheckCircle,   label:'Presença', color:'#22c55e', end:false },
  { to:'/aluno/conquistas', icon:Trophy,        label:'Troféus',  color:'#eab308', end:false },
  { to:'/aluno/chat',       icon:MessageCircle, label:'Chat',     color:'#a855f7', end:false },
]

/* ── Layout ─────────────────────────────────────────────────────────── */
export default function LayoutAluno({ children }) {
  const { user, logout } = useAuth()
  const navigate         = useNavigate()
  const initials         = (user?.nome || '??').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
  const avatarColor      = nameColor(user?.nome || 'A')
  const firstName        = user?.nome?.split(' ')[0] || 'Aluno'

  const { subscribed, loading: pushLoading, supported: pushSupported, toggle: togglePush } = usePushSubscription()
  const { show: showPwa, install: installPwa, dismiss: dismissPwa } = usePwaInstall(user?.id)

  const [showOnboarding, setShowOnboarding] = useState(false)
  useEffect(() => {
    if (!user?.id) return
    const key = `megaup_aluno_ob_${user.id}`
    if (!localStorage.getItem(key)) setShowOnboarding(true)
  }, [user?.id])
  const doneOnboarding = () => { if (user?.id) localStorage.setItem(`megaup_aluno_ob_${user.id}`, '1'); setShowOnboarding(false) }

  return (
    <div style={{
      minHeight: '100dvh',
      background: '#0C0C0D',
      backgroundImage: 'radial-gradient(ellipse at 50% 0%, rgba(239,68,68,0.07) 0%, transparent 55%)',
      display: 'flex',
      flexDirection: 'column',
    }}>

      {/* ── STICKY HEADER ─────────────────────────────────────────── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 30,
        background: 'rgba(10,10,11,0.92)',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        paddingTop: 'env(safe-area-inset-top)',
        boxShadow: '0 1px 0 rgba(255,255,255,0.04)',
      }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 18px', height:54, maxWidth:640, margin:'0 auto' }}>

          {/* Brand */}
          <div style={{ display:'flex', alignItems:'center', gap:9 }}>
            <div style={{
              width:32, height:32, borderRadius:10,
              background:'linear-gradient(145deg,#ef4444,#c42121)',
              display:'flex', alignItems:'center', justifyContent:'center',
              boxShadow:'0 3px 12px rgba(239,68,68,0.45)',
            }}>
              <Zap style={{ width:15, height:15, color:'white' }} />
            </div>
            <span style={{ fontFamily:'Inter,sans-serif', fontWeight:900, color:'#F4F4F5', fontSize:16, letterSpacing:'-0.04em' }}>
              MegaUp
            </span>
          </div>

          {/* User section */}
          <div style={{ display:'flex', alignItems:'center', gap:7 }}>
            <div style={{ textAlign:'right', marginRight:2 }}>
              <div style={{ fontSize:13, fontWeight:700, color:'#F4F4F5', letterSpacing:'-0.01em' }}>{firstName}</div>
            </div>
            <div style={{
              width:34, height:34, borderRadius:'50%',
              background:`${avatarColor}18`, border:`1.5px solid ${avatarColor}30`,
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:12, fontWeight:800, color:avatarColor, letterSpacing:'-0.01em',
              flexShrink:0,
            }}>
              {initials}
            </div>
            {pushSupported && (
              <button
                onClick={togglePush} disabled={pushLoading}
                title={subscribed ? 'Desativar notificações' : 'Ativar notificações'}
                style={{
                  width:34, height:34, borderRadius:10,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  background: subscribed ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${subscribed ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.07)'}`,
                  cursor: pushLoading ? 'wait' : 'pointer',
                  color: subscribed ? '#f87171' : 'rgba(255,255,255,0.4)',
                  transition: 'all 0.15s',
                }}
              >
                {subscribed ? <Bell style={{ width:14, height:14 }} /> : <BellOff style={{ width:14, height:14 }} />}
              </button>
            )}
            <button
              onClick={() => { logout(); navigate('/login') }}
              title="Sair"
              style={{
                width:34, height:34, borderRadius:10,
                display:'flex', alignItems:'center', justifyContent:'center',
                background:'transparent', border:'1px solid rgba(255,255,255,0.07)',
                cursor:'pointer', color:'rgba(255,255,255,0.4)',
                transition:'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background='rgba(239,68,68,0.1)'; e.currentTarget.style.color='#f87171'; e.currentTarget.style.borderColor='rgba(239,68,68,0.28)' }}
              onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='rgba(255,255,255,0.4)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.07)' }}
            >
              <LogOut style={{ width:14, height:14 }} />
            </button>
          </div>
        </div>
      </header>

      {/* ── PWA INSTALL BANNER ────────────────────────────────────── */}
      {showPwa && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(239,68,68,0.1), rgba(99,102,241,0.08))',
          borderBottom: '1px solid rgba(239,68,68,0.18)',
          padding: '10px 18px',
        }}>
          <div style={{ maxWidth:640, margin:'0 auto', display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:36, height:36, borderRadius:11, background:'linear-gradient(145deg,#ef4444,#c42121)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow:'0 3px 10px rgba(239,68,68,0.4)' }}>
              <Zap style={{ width:16, height:16, color:'white' }} />
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <p style={{ fontSize:13, fontWeight:800, color:'#F4F4F5', lineHeight:1.2, marginBottom:1, letterSpacing:'-0.02em' }}>Instale o MegaUp</p>
              <p style={{ fontSize:11, color:'rgba(255,255,255,0.4)' }}>Acesso rápido direto da tela inicial</p>
            </div>
            <button onClick={installPwa} style={{ padding:'7px 16px', borderRadius:9, background:'linear-gradient(135deg,#ef4444,#dc2626)', border:'none', color:'white', fontSize:12, fontWeight:800, cursor:'pointer', display:'flex', alignItems:'center', gap:5, flexShrink:0, boxShadow:'0 4px 12px rgba(239,68,68,0.35)' }}>
              <Download style={{ width:12, height:12 }} /> Instalar
            </button>
            <button onClick={dismissPwa} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.38)', padding:4, flexShrink:0 }}>
              <X style={{ width:14, height:14 }} />
            </button>
          </div>
        </div>
      )}

      {/* ── MAIN CONTENT ──────────────────────────────────────────── */}
      <main style={{
        flex:1, padding:'20px 16px',
        maxWidth:640, margin:'0 auto', width:'100%',
        paddingBottom:'calc(96px + env(safe-area-inset-bottom))',
        boxSizing:'border-box',
      }}>
        {children}
      </main>

      {showOnboarding && <OnboardingAluno onDone={doneOnboarding} />}

      {/* ── BOTTOM NAV ────────────────────────────────────────────── */}
      <nav style={{
        position:'fixed', bottom:0, left:0, right:0, zIndex:40,
        background:'rgba(10,10,11,0.94)',
        backdropFilter:'blur(24px)', WebkitBackdropFilter:'blur(24px)',
        borderTop:'1px solid rgba(255,255,255,0.06)',
        paddingBottom:'env(safe-area-inset-bottom)',
        boxShadow:'0 -1px 0 rgba(255,255,255,0.04)',
      }}>
        <div style={{ maxWidth:480, margin:'0 auto', display:'flex', padding:'5px 0 2px' }}>
          {TABS.map(({ to, icon: Icon, label, color, end }) => (
            <NavLink key={to} to={to} end={end} style={{ flex:1, textDecoration:'none' }}>
              {({ isActive }) => (
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'8px 0 6px', gap:4, position:'relative', cursor:'pointer' }}>
                  {/* Top indicator glow */}
                  {isActive && (
                    <div style={{
                      position:'absolute', top:0, left:'50%', transform:'translateX(-50%)',
                      width:24, height:2.5, borderRadius:2,
                      background:color, boxShadow:`0 0 10px ${color}`,
                    }} />
                  )}
                  {/* Icon */}
                  <div style={{
                    width:32, height:32, borderRadius:10,
                    background: isActive ? `${color}18` : 'transparent',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    transition:'all 0.2s',
                    boxShadow: isActive ? `0 0 16px ${color}25` : 'none',
                  }}>
                    <Icon style={{
                      width:19, height:19,
                      color: isActive ? color : 'rgba(255,255,255,0.32)',
                      transition:'color 0.15s',
                    }} />
                  </div>
                  {/* Label */}
                  <span style={{
                    fontSize:10, lineHeight:1,
                    fontWeight: isActive ? 800 : 400,
                    color: isActive ? color : 'rgba(255,255,255,0.32)',
                    fontFamily:'Inter,sans-serif',
                    transition:'all 0.15s',
                    letterSpacing: isActive ? '-0.01em' : 0,
                  }}>
                    {label}
                  </span>
                </div>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
