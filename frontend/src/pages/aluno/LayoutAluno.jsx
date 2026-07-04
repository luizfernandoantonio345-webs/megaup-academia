import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Dumbbell, Trophy, LogOut, Zap, CalendarDays, MessageCircle, Apple } from 'lucide-react'

const TABS = [
  { to: '/aluno',            icon: Dumbbell,       label: 'Treino',    end: true,  color: '#34d399', glow: 'rgba(52,211,153,0.35)'  },
  { to: '/aluno/semana',     icon: CalendarDays,   label: 'Semana',    end: false, color: '#818cf8', glow: 'rgba(129,140,248,0.35)' },
  { to: '/aluno/conquistas', icon: Trophy,         label: 'Conquistas',end: false, color: '#fbbf24', glow: 'rgba(251,191,36,0.35)' },
  { to: '/aluno/nutricao',   icon: Apple,          label: 'Nutrição',  end: false, color: '#34d399', glow: 'rgba(52,211,153,0.35)' },
  { to: '/aluno/chat',       icon: MessageCircle,  label: 'Chat',      end: false, color: '#f9a8d4', glow: 'rgba(249,168,212,0.35)' },
]

export default function LayoutAluno({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const initials = (user?.nome || '??').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()

  return (
    <div style={{ minHeight: '100vh', background: '#0C0C0D', display: 'flex', flexDirection: 'column' }}>

      {/* Aurora blobs — decorative background */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        
        
        
      </div>

      {/* ── Sticky header ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 30,
        background: 'rgba(5,8,15,0.9)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        paddingTop: 'env(safe-area-inset-top)',
      }}>
        {/* Top glint */}
        <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: 1, background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.4), transparent)', pointerEvents: 'none' }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', height: 58, maxWidth: 640, margin: '0 auto' }}>

          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 11,
              background: '#6366f1',
              boxShadow: '0 0 14px rgba(99,102,241,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Zap style={{ width: 15, height: 15, color: 'white' }} />
            </div>
            <div>
              <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, color: 'white', fontSize: 16, letterSpacing: '-0.03em' }}>
                GymPro
              </span>
            </div>
          </div>

          {/* User + logout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#F4F4F5' }}>{user?.nome?.split(' ')[0]}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end', marginTop: 1 }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981', animation: 'pulse-dot 2s infinite' }} />
                <span style={{ fontSize: 10, color: '#10b981', fontWeight: 600 }}>Online</span>
              </div>
            </div>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: '#6366f1',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 800, color: 'white',
              boxShadow: '0 0 12px rgba(99,102,241,0.4)',
            }}>
              {initials}
            </div>
            <button
              onClick={() => { logout(); navigate('/login') }}
              style={{
                width: 36, height: 36, borderRadius: 11,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.13)',
                cursor: 'pointer', color: '#f87171', transition: 'all 0.15s',
              }}
              title="Sair"
            >
              <LogOut style={{ width: 15, height: 15 }} />
            </button>
          </div>
        </div>
      </header>

      {/* ── Main content ── */}
      <main style={{
        flex: 1, position: 'relative', zIndex: 1,
        padding: '20px 16px',
        maxWidth: 640, margin: '0 auto', width: '100%',
        paddingBottom: 'calc(96px + env(safe-area-inset-bottom))',
      }}>
        {children}
      </main>

      {/* ── Floating pill bottom nav ── */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 40,
        paddingBottom: 'env(safe-area-inset-bottom)',
        pointerEvents: 'none',
      }}>
        <div style={{
          maxWidth: 400, margin: '0 auto 18px',
          background: 'rgba(7,10,20,0.88)',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          borderRadius: 30,
          border: '1px solid rgba(255,255,255,0.09)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.55), 0 0 0 1px rgba(99,102,241,0.07), inset 0 1px 0 rgba(255,255,255,0.05)',
          padding: '6px 8px',
          display: 'flex',
          pointerEvents: 'all',
        }}>
          {TABS.map(({ to, icon: Icon, label, end, color, glow }) => (
            <NavLink key={to} to={to} end={end} style={{ flex: 1, textDecoration: 'none' }}>
              {({ isActive }) => (
                <div style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  padding: '9px 4px 7px', gap: 4,
                  borderRadius: 24,
                  background: isActive ? `${color}15` : 'transparent',
                  boxShadow: isActive ? `0 0 18px ${glow}` : 'none',
                  transition: 'all 0.25s ease',
                }}>
                  <div style={{ position: 'relative' }}>
                    <Icon style={{
                      width: 22, height: 22,
                      color: isActive ? color : '#2D3F5A',
                      transition: 'color 0.2s',
                      filter: isActive ? `drop-shadow(0 0 6px ${color})` : 'none',
                    }} />
                    {isActive && (
                      <div style={{
                        position: 'absolute', bottom: -3, left: '50%',
                        transform: 'translateX(-50%)',
                        width: 4, height: 4, borderRadius: '50%',
                        background: color,
                        boxShadow: `0 0 8px ${color}`,
                      }} />
                    )}
                  </div>
                  <span style={{
                    fontSize: 10, fontWeight: isActive ? 800 : 500,
                    color: isActive ? color : '#2D3F5A',
                    fontFamily: 'Inter, sans-serif',
                    letterSpacing: isActive ? '0.02em' : 0,
                    transition: 'all 0.2s',
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
