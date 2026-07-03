import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  LayoutDashboard, Users, Dumbbell, Brain, UserPlus, LogOut,
  Menu, X, DollarSign, ChevronRight, Zap,
} from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { to: '/dashboard',  icon: LayoutDashboard, label: 'Dashboard',       color: 'text-indigo-400' },
  { to: '/alunos',     icon: Users,            label: 'Alunos',          color: 'text-sky-400'    },
  { to: '/exercicios', icon: Dumbbell,         label: 'Exercícios',      color: 'text-emerald-400'},
  { to: '/ia',         icon: Brain,            label: 'IA · Progressão', color: 'text-violet-400' },
  { to: '/financeiro', icon: DollarSign,       label: 'Financeiro',      color: 'text-amber-400'  },
  { to: '/convites',   icon: UserPlus,         label: 'Convidar alunos', color: 'text-rose-400'   },
]

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className="flex h-screen bg-slate-50">
      {/* ── Desktop Sidebar ── */}
      <aside className="hidden lg:flex flex-col w-[260px] flex-shrink-0 bg-brand-sidebar">
        <SidebarContent navItems={navItems} user={user} onLogout={handleLogout} />
      </aside>

      {/* ── Mobile Overlay ── */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative flex flex-col w-[260px] bg-brand-sidebar z-10 animate-slide-down">
            <button
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
            <SidebarContent navItems={navItems} user={user} onLogout={handleLogout} />
          </aside>
        </div>
      )}

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-auto">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center px-4 h-14 bg-brand-sidebar border-b border-white/5 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="mr-3 text-slate-400 hover:text-white transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-brand rounded-lg flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-white text-sm">FitSaaS</span>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  )
}

function SidebarContent({ navItems, user, onLogout }) {
  const location = useLocation()
  const initials = user?.nome?.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase() || '??'

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 pt-6 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-brand rounded-xl flex items-center justify-center flex-shrink-0 shadow-glow-sm">
            <Zap className="w-4.5 h-4.5 text-white" style={{ width: 18, height: 18 }} />
          </div>
          <div>
            <div className="font-bold text-white text-sm tracking-wide">FitSaaS</div>
            <div className="text-xs text-slate-500 font-medium">Pro</div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-white/5 mx-5" />

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto no-scrollbar">
        <p className="text-xs font-semibold text-slate-600 uppercase tracking-widest px-3 mb-3">Menu</p>
        {navItems.map(({ to, icon: Icon, label, color }) => {
          const isActive = location.pathname.startsWith(to)
          return (
            <NavLink
              key={to}
              to={to}
              className={isActive ? 'nav-item-active' : 'nav-item-inactive'}
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                isActive ? 'bg-white/20' : 'bg-white/5'
              }`}>
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : color}`} />
              </div>
              <span className="flex-1 text-sm">{label}</span>
              {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/40" />}
            </NavLink>
          )
        })}
      </nav>

      {/* Divider */}
      <div className="h-px bg-white/5 mx-5" />

      {/* User + Logout */}
      <div className="p-4 space-y-1">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/5">
          <div className="w-8 h-8 rounded-full bg-gradient-brand flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-white truncate">{user?.nome?.split(' ')[0]}</div>
            <div className="text-xs text-slate-500 truncate">{user?.email}</div>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="nav-item-inactive w-full mt-1"
        >
          <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-white/5 flex-shrink-0">
            <LogOut className="w-3.5 h-3.5 text-red-400" />
          </div>
          <span className="text-sm text-red-400">Sair</span>
        </button>
      </div>
    </div>
  )
}
