import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Dumbbell, Trophy, Home, LogOut, Zap } from 'lucide-react'

const navTabs = [
  { to: '/aluno',             icon: Home,   label: 'Hoje',      end: true  },
  { to: '/aluno/conquistas',  icon: Trophy, label: 'Conquistas', end: false },
]

export default function LayoutAluno({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const handleLogout = () => { logout(); navigate('/login') }

  const initials = user?.nome?.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase() || '??'

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* ── Header ── */}
      <header className="sticky top-0 z-30 bg-brand-sidebar/95 backdrop-blur-sm border-b border-white/5">
        <div className="flex items-center justify-between px-4 h-14 max-w-lg mx-auto">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-gradient-brand rounded-lg flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-white text-sm tracking-wide">FitSaaS</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-brand flex items-center justify-center text-xs font-bold text-white">
                {initials}
              </div>
              <span className="text-sm text-slate-300 font-medium hidden sm:block">
                {user?.nome?.split(' ')[0]}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="text-slate-500 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-white/5"
              title="Sair"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ── Page Content ── */}
      <main className="px-4 py-6 max-w-lg mx-auto animate-fade-in">
        {children}
      </main>

      {/* ── Bottom Nav ── */}
      <nav className="fixed bottom-0 inset-x-0 z-30 bg-brand-sidebar/95 backdrop-blur-sm border-t border-white/5">
        <div className="flex max-w-lg mx-auto">
          {navTabs.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center gap-1 py-3 text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'text-white'
                    : 'text-slate-500 hover:text-slate-300'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`w-10 h-7 rounded-xl flex items-center justify-center transition-all ${
                    isActive ? 'bg-white/15' : ''
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
