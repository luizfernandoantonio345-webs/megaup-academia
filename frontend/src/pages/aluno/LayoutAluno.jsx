import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Dumbbell, Trophy, LogOut, Zap, Home } from 'lucide-react'

const TABS = [
  { to: '/aluno',            icon: Home,    label: 'Treinos',     end: true  },
  { to: '/aluno/conquistas', icon: Trophy,  label: 'Conquistas',  end: false },
]

export default function LayoutAluno({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const initials = user?.nome?.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase() || '??'

  return (
    <div className="min-h-screen pb-24" style={{ background: '#070B14' }}>
      {/* Header */}
      <header className="sticky top-0 z-30" style={{
        background: 'rgba(6,9,16,0.92)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}>
        <div className="flex items-center justify-between px-4 h-14 max-w-lg mx-auto">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{
              background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
              boxShadow: '0 0 10px rgba(99,102,241,0.45)',
            }}>
              <Zap style={{ width: 13, height: 13, color: 'white' }} />
            </div>
            <span className="font-bold text-white text-sm" style={{ fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '-0.02em' }}>
              FitSaaS
            </span>
          </div>

          {/* User */}
          <div className="flex items-center gap-2.5">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-semibold" style={{ color: '#94A3B8' }}>{user?.nome?.split(' ')[0]}</div>
            </div>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{
              background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
            }}>
              {initials}
            </div>
            <button
              onClick={() => { logout(); navigate('/login') }}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
              style={{ color: '#4B5768' }}
              title="Sair"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="px-4 py-6 max-w-lg mx-auto animate-fade-in">
        {children}
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 inset-x-0 z-30" style={{
        background: 'rgba(6,9,16,0.95)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderTop: '1px solid rgba(255,255,255,0.05)',
      }}>
        <div className="flex max-w-lg mx-auto px-4 py-2">
          {TABS.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className="flex-1 flex flex-col items-center gap-1 py-2 transition-all duration-200"
            >
              {({ isActive }) => (
                <>
                  <div
                    className="w-12 h-8 rounded-xl flex items-center justify-center transition-all duration-200"
                    style={{
                      background: isActive ? 'rgba(99,102,241,0.2)' : 'transparent',
                      boxShadow: isActive ? '0 0 12px rgba(99,102,241,0.2)' : 'none',
                    }}
                  >
                    <Icon
                      className="w-5 h-5 transition-colors"
                      style={{ color: isActive ? '#a5b4fc' : '#3D4F6A' }}
                    />
                  </div>
                  <span
                    className="text-xs font-semibold transition-colors"
                    style={{ color: isActive ? '#a5b4fc' : '#3D4F6A' }}
                  >
                    {label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
