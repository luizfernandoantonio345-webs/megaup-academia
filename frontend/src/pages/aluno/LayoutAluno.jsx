import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Dumbbell, Trophy, LogOut, Zap, CalendarDays, MessageCircle, Apple } from 'lucide-react'

const TABS = [
  { to: '/aluno',            icon: Dumbbell,      label: 'Treino',     end: true  },
  { to: '/aluno/semana',     icon: CalendarDays,  label: 'Semana',     end: false },
  { to: '/aluno/conquistas', icon: Trophy,        label: 'Conquistas', end: false },
  { to: '/aluno/nutricao',   icon: Apple,         label: 'Nutrição',   end: false },
  { to: '/aluno/chat',       icon: MessageCircle, label: 'Chat',       end: false },
]

export default function LayoutAluno({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const initials = (user?.nome || '??').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()

  return (
    <div style={{
      minHeight: '100vh',
      minHeight: '100dvh',
      background: '#0C0C0D',
      display: 'flex',
      flexDirection: 'column',
    }}>

      {/* Sticky header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 30,
        background: 'rgba(10,10,11,0.97)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid #1C1C1E',
        paddingTop: 'env(safe-area-inset-top)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', height: 52, maxWidth: 640, margin: '0 auto' }}>

          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap style={{ width: 14, height: 14, color: 'white' }} />
            </div>
            <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, color: '#F4F4F5', fontSize: 15, letterSpacing: '-0.01em' }}>
              GymPro
            </span>
          </div>

          {/* User + logout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#A1A1AA' }}>{user?.nome?.split(' ')[0]}</div>
            </div>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: '#1C1C1E', border: '1px solid #27272A',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 600, color: '#A1A1AA',
            }}>
              {initials}
            </div>
            <button
              onClick={() => { logout(); navigate('/login') }}
              style={{
                width: 32, height: 32, borderRadius: 8,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'transparent', border: '1px solid #27272A',
                cursor: 'pointer', color: '#71717A', transition: 'all 0.1s',
              }}
              title="Sair"
            >
              <LogOut style={{ width: 14, height: 14 }} />
            </button>
          </div>
        </div>
      </header>

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

      {/* Bottom nav */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 40,
        background: 'rgba(10,10,11,0.97)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderTop: '1px solid #1C1C1E',
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
                    <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 20, height: 2, borderRadius: 1, background: '#6366f1' }} />
                  )}
                  <Icon style={{ width: 20, height: 20, color: isActive ? '#818cf8' : '#52525B' }} />
                  <span style={{
                    fontSize: 10, fontWeight: isActive ? 600 : 400,
                    color: isActive ? '#818cf8' : '#52525B',
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
