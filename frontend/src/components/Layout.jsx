import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  LayoutDashboard, Users, Dumbbell, Brain, UserPlus, LogOut,
  Menu, X, DollarSign, Zap, ChevronRight,
} from 'lucide-react'
import { useState } from 'react'

const NAV = [
  { to: '/dashboard',  icon: LayoutDashboard, label: 'Dashboard',       dot: '#6366f1' },
  { to: '/alunos',     icon: Users,            label: 'Alunos',          dot: '#38bdf8' },
  { to: '/exercicios', icon: Dumbbell,         label: 'Exercícios',      dot: '#34d399' },
  { to: '/ia',         icon: Brain,            label: 'IA · Progressão', dot: '#a78bfa' },
  { to: '/financeiro', icon: DollarSign,       label: 'Financeiro',      dot: '#fbbf24' },
  { to: '/convites',   icon: UserPlus,         label: 'Convidar alunos', dot: '#f87171' },
]

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className="flex h-screen" style={{ background: '#070B14' }}>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-[264px] flex-shrink-0" style={{
        background: '#060910',
        borderRight: '1px solid rgba(255,255,255,0.05)',
      }}>
        <SidebarContent user={user} onLogout={handleLogout} />
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="relative flex flex-col w-[264px] z-10 animate-slide-down" style={{
            background: '#060910',
            borderRight: '1px solid rgba(255,255,255,0.05)',
          }}>
            <button
              className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
              style={{ background: 'rgba(255,255,255,0.07)', color: '#64748B' }}
              onClick={() => setOpen(false)}
            >
              <X className="w-4 h-4" />
            </button>
            <SidebarContent user={user} onLogout={handleLogout} />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-auto">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center justify-between px-4 h-14 flex-shrink-0" style={{
          background: '#060910',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}>
          <button
            onClick={() => setOpen(true)}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
            style={{ background: 'rgba(255,255,255,0.06)', color: '#64748B' }}
          >
            <Menu className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{
              background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
              boxShadow: '0 0 12px rgba(99,102,241,0.4)',
            }}>
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-white text-sm" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>FitSaaS</span>
          </div>
          <div className="w-9" />
        </header>

        <main className="flex-1 p-5 lg:p-8 max-w-7xl w-full mx-auto animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  )
}

function SidebarContent({ user, onLogout }) {
  const location = useLocation()
  const initials = user?.nome?.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase() || '??'

  return (
    <div className="flex flex-col h-full py-5">
      {/* Logo */}
      <div className="px-5 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{
            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            boxShadow: '0 0 16px rgba(99,102,241,0.5)',
          }}>
            <Zap style={{ width: 17, height: 17, color: 'white' }} />
          </div>
          <div>
            <div className="font-bold text-white text-sm tracking-wide" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>FitSaaS</div>
            <div className="text-xs font-semibold" style={{ color: '#6366f1' }}>PRO</div>
          </div>
        </div>
      </div>

      <div className="glow-divider mx-5 mb-5" />

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto no-scrollbar">
        <p className="text-xs font-bold uppercase tracking-widest px-3 mb-3" style={{ color: '#1F2D4A', fontFamily: 'Inter, sans-serif' }}>
          Menu
        </p>
        {NAV.map(({ to, icon: Icon, label, dot }) => {
          const isActive = location.pathname.startsWith(to)
          return (
            <NavLink key={to} to={to} className={isActive ? 'nav-item-active' : 'nav-item-inactive'}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{
                background: isActive ? `${dot}25` : 'rgba(255,255,255,0.04)',
              }}>
                <Icon className="w-3.5 h-3.5" style={{ color: isActive ? dot : '#3D4F6A' }} />
              </div>
              <span className="flex-1 text-sm">{label}</span>
              {isActive && (
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: dot, boxShadow: `0 0 8px ${dot}` }} />
              )}
            </NavLink>
          )
        })}
      </nav>

      <div className="glow-divider mx-5 my-4" />

      {/* User + logout */}
      <div className="px-3 space-y-1">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{
            background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
          }}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold truncate" style={{ color: '#CBD5E1' }}>{user?.nome?.split(' ')[0]}</div>
            <div className="text-xs truncate" style={{ color: '#3D4F6A' }}>{user?.email}</div>
          </div>
        </div>
        <button onClick={onLogout} className="nav-item-inactive w-full group">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(239,68,68,0.1)' }}>
            <LogOut className="w-3.5 h-3.5" style={{ color: '#f87171' }} />
          </div>
          <span className="text-sm" style={{ color: '#f87171' }}>Sair da conta</span>
        </button>
      </div>
    </div>
  )
}
