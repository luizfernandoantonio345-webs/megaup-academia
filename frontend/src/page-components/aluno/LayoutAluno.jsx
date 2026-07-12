import { useState, useEffect, useCallback, useRef } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Dumbbell, Trophy, LogOut, Zap, CalendarDays, MessageCircle, Apple, Bell, BellOff, Download, X, CheckCircle } from 'lucide-react'
import OnboardingAluno from '../../components/OnboardingAluno'
import { getVapidPublicKey, subscribePush, unsubscribePush } from '../../api/index'
import toast from 'react-hot-toast'

function usePwaInstall(userId) {
  const [prompt, setPrompt] = useState(null)
  const [show, setShow] = useState(false)

  useEffect(() => {
    const dismissed = localStorage.getItem(`megaup_pwa_dismissed_${userId}`)
    if (dismissed) return
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone
    if (isStandalone) return

    const handler = (e) => { e.preventDefault(); setPrompt(e); setShow(true) }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [userId])

  const install = async () => {
    if (!prompt) return
    prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'accepted') setShow(false)
  }

  const dismiss = () => {
    localStorage.setItem(`megaup_pwa_dismissed_${userId}`, '1')
    setShow(false)
  }

  return { show, install, dismiss }
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)))
}

function usePushSubscription() {
  const [subscribed, setSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)
  const supported = 'serviceWorker' in navigator && 'PushManager' in window

  useEffect(() => {
    if (!supported) return
    navigator.serviceWorker.ready
      .then(reg => reg.pushManager.getSubscription())
      .then(sub => setSubscribed(!!sub))
      .catch(() => {})
  }, [supported])

  const toggle = useCallback(async () => {
    if (!supported || loading) return
    setLoading(true)
    try {
      const reg = await navigator.serviceWorker.ready
      const existing = await reg.pushManager.getSubscription()

      if (existing) {
        await unsubscribePush({ endpoint: existing.endpoint, p256dh: '', auth: '' })
        await existing.unsubscribe()
        setSubscribed(false)
      } else {
        const perm = await Notification.requestPermission()
        if (perm !== 'granted') return
        const { data } = await getVapidPublicKey()
        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(data.public_key),
        })
        const keys = sub.toJSON().keys
        await subscribePush({ endpoint: sub.endpoint, p256dh: keys.p256dh, auth: keys.auth })
        setSubscribed(true)
      }
    } catch (e) {
      toast.error('Não foi possível ativar notificações. Verifique as permissões do navegador.')
    } finally {
      setLoading(false)
    }
  }, [supported, loading])

  return { subscribed, loading, supported, toggle }
}

const TABS = [
  { to: '/aluno',            icon: Dumbbell,      label: 'Treino',    end: true  },
  { to: '/aluno/semana',     icon: CalendarDays,  label: 'Semana',    end: false },
  { to: '/aluno/checkins',   icon: CheckCircle,   label: 'Presença',  end: false },
  { to: '/aluno/conquistas', icon: Trophy,        label: 'Troféus',   end: false },
  { to: '/aluno/chat',       icon: MessageCircle, label: 'Chat',      end: false },
]

export default function LayoutAluno({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const initials = (user?.nome || '??').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
  const { subscribed, loading: pushLoading, supported: pushSupported, toggle: togglePush } = usePushSubscription()
  const { show: showPwaPrompt, install: installPwa, dismiss: dismissPwa } = usePwaInstall(user?.id)

  const [showOnboarding, setShowOnboarding] = useState(false)
  useEffect(() => {
    if (!user?.id) return
    const key = `megaup_aluno_ob_${user.id}`
    if (!localStorage.getItem(key)) setShowOnboarding(true)
  }, [user?.id])

  const handleDoneOnboarding = () => {
    if (user?.id) localStorage.setItem(`megaup_aluno_ob_${user.id}`, '1')
    setShowOnboarding(false)
  }

  return (
    <div style={{
      minHeight: '100dvh',
      background:'var(--bg-page)',
      display: 'flex',
      flexDirection: 'column',
    }}>

      {/* Sticky header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 30,
        background: 'rgba(10,10,11,0.97)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-subtle)',
        paddingTop: 'env(safe-area-inset-top)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', height: 52, maxWidth: 640, margin: '0 auto' }}>

          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap style={{ width: 14, height: 14, color: 'white' }} />
            </div>
            <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, color:'var(--text-primary)', fontSize: 15, letterSpacing: '-0.01em' }}>
              MegaUp
            </span>
          </div>

          {/* User + actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 13, fontWeight: 500, color:'var(--text-secondary)' }}>{user?.nome?.split(' ')[0]}</div>
            </div>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background:'var(--bg-elevated)', border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 600, color:'var(--text-secondary)',
            }}>
              {initials}
            </div>
            {pushSupported && (
              <button
                onClick={togglePush}
                disabled={pushLoading}
                title={subscribed ? 'Desativar notificações de treino' : 'Ativar notificações de treino'}
                style={{
                  width: 32, height: 32, borderRadius: 8,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: subscribed ? 'rgba(239,68,68,0.12)' : 'transparent',
                  border: `1px solid ${subscribed ? 'rgba(239,68,68,0.35)' : 'var(--border)'}`,
                  cursor: pushLoading ? 'wait' : 'pointer',
                  color: subscribed ? '#f87171' : 'var(--text-muted)',
                  transition: 'all 0.15s',
                }}
              >
                {subscribed
                  ? <Bell style={{ width: 14, height: 14 }} />
                  : <BellOff style={{ width: 14, height: 14 }} />
                }
              </button>
            )}
            <button
              onClick={() => { logout(); navigate('/login') }}
              style={{
                width: 32, height: 32, borderRadius: 8,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'transparent', border: '1px solid var(--border)',
                cursor: 'pointer', color:'var(--text-muted)', transition: 'all 0.1s',
              }}
              title="Sair"
            >
              <LogOut style={{ width: 14, height: 14 }} />
            </button>
          </div>
        </div>
      </header>

      {/* PWA install banner */}
      {showPwaPrompt && (
        <div style={{
          background: 'linear-gradient(135deg,rgba(239,68,68,0.12),rgba(99,102,241,0.10))',
          borderBottom: '1px solid rgba(239,68,68,0.2)',
          padding: '10px 20px',
        }}>
          <div style={{ maxWidth: 640, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Zap style={{ width: 16, height: 16, color: 'white' }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2 }}>Instale o MegaUp</p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Acesso rápido sem abrir o navegador</p>
            </div>
            <button onClick={installPwa} style={{ padding: '6px 14px', borderRadius: 8, background: '#ef4444', border: 'none', color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
              <Download style={{ width: 12, height: 12 }} /> Instalar
            </button>
            <button onClick={dismissPwa} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, flexShrink: 0 }}>
              <X style={{ width: 14, height: 14 }} />
            </button>
          </div>
        </div>
      )}

      {/* Main content */}
      <main style={{
        flex: 1,
        padding: '20px 16px',
        maxWidth: 640, margin: '0 auto', width: '100%',
        paddingBottom: 'calc(88px + env(safe-area-inset-bottom))',
        boxSizing: 'border-box',
      }}>
        {children}
      </main>

      {showOnboarding && <OnboardingAluno onDone={handleDoneOnboarding} />}

      {/* Bottom nav */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 40,
        background: 'rgba(10,10,11,0.97)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderTop: '1px solid var(--border-subtle)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}>
        <div style={{ maxWidth: 480, margin: '0 auto', display: 'flex', padding: '4px 0' }}>
          {TABS.map(({ to, icon: Icon, label, end }) => (
            <NavLink key={to} to={to} end={end} style={{ flex: 1, textDecoration: 'none' }}>
              {({ isActive }) => (
                <div style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  padding: '8px 0 6px', gap: 3, position: 'relative',
                }}>
                  {isActive && (
                    <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 20, height: 2, borderRadius: 1, background: '#ef4444' }} />
                  )}
                  <Icon style={{ width: 20, height: 20, color: isActive ? '#f87171' : 'var(--text-disabled)' }} />
                  <span style={{
                    fontSize: 10, fontWeight: isActive ? 600 : 400,
                    color: isActive ? '#f87171' : 'var(--text-disabled)',
                    fontFamily: 'Inter, sans-serif',
                  }}>{label}</span>
                </div>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}


