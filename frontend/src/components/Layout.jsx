import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  LayoutDashboard, Users, Dumbbell, Brain, UserPlus, LogOut,
  Menu, X, DollarSign, Zap,
} from 'lucide-react'
import { useState } from 'react'

const NAV_MAIN = [
  { to: '/dashboard',  icon: LayoutDashboard, label: 'Dashboard',       accent: '#818cf8', dot: '#6366f1' },
  { to: '/alunos',     icon: Users,            label: 'Alunos',          accent: '#7dd3fc', dot: '#38bdf8' },
  { to: '/exercicios', icon: Dumbbell,         label: 'Exercicios',      accent: '#34d399', dot: '#10b981' },
]
const NAV_TOOLS = [
  { to: '/ia',         icon: Brain,            label: 'IA - Progressao', accent: '#c4b5fd', dot: '#a78bfa' },
  { to: '/financeiro', icon: DollarSign,       label: 'Financeiro',      accent: '#fbbf24', dot: '#f59e0b' },
  { to: '/convites',   icon: UserPlus,         label: 'Convidar alunos', accent: '#f9a8d4', dot: '#ec4899' },
]

function NavGroup({ label, items }) {
  const location = useLocation()
  return (
    <div style={{ marginBottom: 24 }}>
      <p style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#1A2540', padding: '0 12px', marginBottom: 6, fontFamily: 'Inter, sans-serif', margin: '0 0 8px 12px' }}>
        {label}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {items.map(({ to, icon: Icon, label: lbl, accent, dot }) => {
          const isActive = location.pathname.startsWith(to)
          return (
            <NavLink key={to} to={to} style={{ textDecoration: 'none' }}>
              <div
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 12px', borderRadius: 14, cursor: 'pointer',
                  background: isActive ? 'rgba(99,102,241,0.15)' : 'transparent',
                  border: isActive ? '1px solid rgba(99,102,241,0.22)' : '1px solid transparent',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={ev => { if (!isActive) { ev.currentTarget.style.background = 'rgba(255,255,255,0.05)'; ev.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)' } }}
                onMouseLeave={ev => { if (!isActive) { ev.currentTarget.style.background = 'transparent'; ev.currentTarget.style.borderColor = 'transparent' } }}
              >
                <div style={{
                  width: 30, height: 30, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  background: isActive ? `${dot}25` : 'rgba(255,255,255,0.05)',
                  boxShadow: isActive ? `0 0 12px ${dot}40` : 'none',
                }}>
                  <Icon style={{ width: 14, height: 14, color: isActive ? accent : '#3D4F6A' }} />
                </div>
                <span style={{ flex: 1, fontSize: 13, fontWeight: isActive ? 700 : 500, color: isActive ? '#c7d2fe' : '#3D4F6A', fontFamily: 'Inter, sans-serif' }}>
                  {lbl}
                </span>
                {isActive && (
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: dot, boxShadow: `0 0 8px ${dot}`, flexShrink: 0 }} />
                )}
              </div>
            </NavLink>
          )
        })}
      </div>
    </div>
  )
}

function SidebarContent({ user, onLogout }) {
  const initials = (user?.nome || '??').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
  const roleLabel = user?.role === 'personal' ? 'Personal Trainer' : user?.role === 'admin_academia' ? 'Admin Academia' : 'Usuario'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '20px 12px' }}>
      {/* Logo */}
      <div style={{ padding: '4px 8px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            boxShadow: '0 0 24px rgba(99,102,241,0.55)',
          }}>
            <Zap style={{ width: 18, height: 18, color: 'white' }} />
          </div>
          <div>
            <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 900, color: 'white', fontSize: 16, letterSpacing: '-0.02em', lineHeight: 1.1 }}>FitSaaS</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 1 }}>
              <span style={{ fontSize: 10, fontWeight: 800, color: '#6366f1', letterSpacing: '0.05em' }}>PRO</span>
              <span style={{ width: 3, height: 3, borderRadius: '50%', background: '#1A2540', display: 'inline-block' }} />
              <span style={{ fontSize: 10, color: '#1F2D4A', fontWeight: 600 }}>Academia</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.3), transparent)', margin: '0 4px 20px' }} />

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: 'auto' }}>
        <NavGroup label="Principal" items={NAV_MAIN} />
        <NavGroup label="Ferramentas" items={NAV_TOOLS} />
      </nav>

      <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)', margin: '4px' }} />

      {/* User profile */}
      <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 14, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: 'white', flexShrink: 0, boxShadow: '0 0 10px rgba(99,102,241,0.3)' }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#CBD5E1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.nome?.split(' ')[0]}
            </div>
            <div style={{ fontSize: 10, color: '#3D4F6A', marginTop: 1 }}>{roleLabel}</div>
          </div>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981', flexShrink: 0 }} />
        </div>
        <button
          onClick={onLogout}
          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 14, cursor: 'pointer', background: 'transparent', border: '1px solid transparent', width: '100%', transition: 'all 0.15s' }}
          onMouseEnter={ev => { ev.currentTarget.style.background = 'rgba(239,68,68,0.08)'; ev.currentTarget.style.borderColor = 'rgba(239,68,68,0.15)' }}
          onMouseLeave={ev => { ev.currentTarget.style.background = 'transparent'; ev.currentTarget.style.borderColor = 'transparent' }}
        >
          <div style={{ width: 30, height: 30, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(239,68,68,0.1)', flexShrink: 0 }}>
            <LogOut style={{ width: 13, height: 13, color: '#f87171' }} />
          </div>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#f87171' }}>Sair da conta</span>
        </button>
      </div>
    </div>
  )
}

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#070B14' }}>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col" style={{ width: 270, flexShrink: 0, background: '#05080F', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
        <SidebarContent user={user} onLogout={handleLogout} />
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div className="lg:hidden" style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }} onClick={() => setOpen(false)} />
          <aside style={{ position: 'relative', width: 270, background: '#05080F', borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', zIndex: 10 }} className="animate-slide-down">
            <button
              style={{ position: 'absolute', top: 16, right: 16, width: 32, height: 32, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.07)', color: '#64748B', border: 'none', cursor: 'pointer' }}
              onClick={() => setOpen(false)}
            >
              <X style={{ width: 14, height: 14 }} />
            </button>
            <SidebarContent user={user} onLogout={handleLogout} />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowY: 'auto' }}>
        {/* Mobile header */}
        <header className="lg:hidden" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', height: 56, flexShrink: 0, background: '#05080F', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <button
            onClick={() => setOpen(true)}
            style={{ width: 36, height: 36, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.06)', color: '#64748B', border: 'none', cursor: 'pointer' }}
          >
            <Menu style={{ width: 16, height: 16 }} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', boxShadow: '0 0 14px rgba(99,102,241,0.45)' }}>
              <Zap style={{ width: 13, height: 13, color: 'white' }} />
            </div>
            <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, color: 'white', fontSize: 15 }}>FitSaaS</span>
          </div>
          <div style={{ width: 36 }} />
        </header>

        <main className="flex-1 p-5 lg:p-8 max-w-7xl w-full mx-auto animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  )
}
