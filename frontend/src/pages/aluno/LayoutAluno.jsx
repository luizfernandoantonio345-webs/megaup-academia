import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Dumbbell, Trophy, LogOut, Zap } from 'lucide-react'

const TABS = [
  { to: '/aluno',            icon: Dumbbell, label: 'Treino',      end: true,  accent: '#34d399', dot: '#10b981' },
  { to: '/aluno/conquistas', icon: Trophy,   label: 'Conquistas',  end: false, accent: '#fbbf24', dot: '#f59e0b' },
]

export default function LayoutAluno({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const initials = (user?.nome || '??').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()

  return (
    <div style={{ minHeight: '100vh', background: '#070B14', display: 'flex', flexDirection: 'column' }}>

      {/* Sticky top header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 30,
        background: 'rgba(5,8,15,0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        paddingTop: 'env(safe-area-inset-top)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', height: 56, maxWidth: 640, margin: '0 auto' }}>
          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 30, height: 30, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', boxShadow: '0 0 12px rgba(99,102,241,0.45)' }}>
              <Zap style={{ width: 14, height: 14, color: 'white' }} />
            </div>
            <div>
              <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 900, color: 'white', fontSize: 15, letterSpacing: '-0.02em' }}>FitSaaS</span>
            </div>
          </div>

          {/* User + logout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#CBD5E1' }}>{user?.nome?.split(' ')[0]}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end', marginTop: 1 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 5px #10b981' }} />
                <span style={{ fontSize: 10, color: '#10b981', fontWeight: 600 }}>Online</span>
              </div>
            </div>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: 'white', boxShadow: '0 0 10px rgba(99,102,241,0.35)' }}>
              {initials}
            </div>
            <button
              onClick={() => { logout(); navigate('/login') }}
              style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', cursor: 'pointer', color: '#f87171', transition: 'all 0.15s' }}
              title="Sair"
            >
              <LogOut style={{ width: 15, height: 15 }} />
            </button>
          </div>
        </div>
      </header>

      {/* Main content — pb accounts for bottom nav + safe area */}
      <main style={{ flex: 1, padding: '20px 16px', maxWidth: 640, margin: '0 auto', width: '100%', paddingBottom: 'calc(80px + env(safe-area-inset-bottom))' }} className="animate-fade-in">
        {children}
      </main>

      {/* Fixed bottom navigation */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 40,
        background: 'rgba(5,8,15,0.97)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}>
        <div style={{ display: 'flex', maxWidth: 640, margin: '0 auto' }}>
          {TABS.map(({ to, icon: Icon, label, end, accent, dot }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              style={{ flex: 1, textDecoration: 'none' }}
            >
              {({ isActive }) => (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 0 8px', gap: 4, position: 'relative' }}>
                  {/* Active top indicator */}
                  {isActive && (
                    <div style={{
                      position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
                      width: 36, height: 3, borderRadius: 2,
                      background: `linear-gradient(90deg, ${dot}, ${accent})`,
                      boxShadow: `0 0 10px ${dot}`,
                    }} />
                  )}

                  {/* Icon pill */}
                  <div style={{
                    width: 56, height: 34, borderRadius: 14,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: isActive ? `${dot}22` : 'transparent',
                    boxShadow: isActive ? `0 0 16px ${dot}30` : 'none',
                    transition: 'all 0.2s',
                  }}>
                    <Icon style={{ width: 23, height: 23, color: isActive ? accent : '#3D4F6A', transition: 'color 0.2s' }} />
                  </div>

                  <span style={{
                    fontSize: 11, fontWeight: isActive ? 700 : 500,
                    color: isActive ? accent : '#3D4F6A',
                    fontFamily: 'Inter, sans-serif', letterSpacing: isActive ? '0.01em' : 0,
                    transition: 'all 0.2s',
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
