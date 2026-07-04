import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  LayoutDashboard, Users, Dumbbell, Brain, UserPlus, LogOut,
  X, DollarSign, Zap, MoreHorizontal, ChevronRight, CreditCard, BarChart2, Gift,
  Calendar, Bell, Apple,
} from 'lucide-react'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { resumoNotificacoes } from '../api'
import PlanBanner from './PlanBanner'
import CommandPalette from './CommandPalette'

const NAV_MAIN = [
  { to: '/dashboard',  icon: LayoutDashboard, label: 'Dashboard',       accent: '#818cf8', dot: '#6366f1' },
  { to: '/alunos',     icon: Users,            label: 'Alunos',          accent: '#7dd3fc', dot: '#38bdf8' },
  { to: '/analytics',  icon: BarChart2,        label: 'Analytics',       accent: '#818cf8', dot: '#6366f1' },
  { to: '/agenda',     icon: Calendar,         label: 'Agenda',           accent: '#38bdf8', dot: '#0ea5e9' },
  { to: '/exercicios', icon: Dumbbell,         label: 'Exercicios',      accent: '#34d399', dot: '#10b981' },
]
const NAV_TOOLS = [
  { to: '/ia',         icon: Brain,       label: 'IA - Progressao', accent: '#c4b5fd', dot: '#a78bfa' },
  { to: '/financeiro', icon: DollarSign,  label: 'Financeiro',      accent: '#fbbf24', dot: '#f59e0b' },
  { to: '/convites',   icon: UserPlus,    label: 'Convidar alunos', accent: '#f9a8d4', dot: '#ec4899' },
  { to: '/periodizacao', icon: BarChart2,  label: 'Periodização',     accent: '#c4b5fd', dot: '#a78bfa' },
  { to: '/inativos',   icon: Bell,        label: 'Inativos',         accent: '#f97316', dot: '#ea580c' },
  { to: '/planos',     icon: CreditCard,  label: 'Planos & Billing', accent: '#34d399', dot: '#10b981' },
  { to: '/referral',   icon: Gift,        label: 'Indique e Ganhe',  accent: '#fbbf24', dot: '#f59e0b' },
]
const ALL_NAV = [...NAV_MAIN, ...NAV_TOOLS]
const MOBILE_TABS = NAV_MAIN  // bottom bar tabs

/* ─── Desktop sidebar nav group ─── */
function NavGroup({ label, items }) {
  const location = useLocation()
  return (
    <div style={{ marginBottom: 24 }}>
      <p style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#1A2540', margin: '0 0 8px 12px', fontFamily: 'Inter, sans-serif' }}>
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
                <div style={{ width: 30, height: 30, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: isActive ? `${dot}25` : 'rgba(255,255,255,0.05)', boxShadow: isActive ? `0 0 12px ${dot}40` : 'none' }}>
                  <Icon style={{ width: 14, height: 14, color: isActive ? accent : '#3D4F6A' }} />
                </div>
                <span style={{ flex: 1, fontSize: 13, fontWeight: isActive ? 700 : 500, color: isActive ? '#c7d2fe' : '#3D4F6A', fontFamily: 'Inter, sans-serif' }}>
                  {lbl}
                </span>
                {isActive && <div style={{ width: 6, height: 6, borderRadius: '50%', background: dot, boxShadow: `0 0 8px ${dot}`, flexShrink: 0 }} />}
              </div>
            </NavLink>
          )
        })}
      </div>
    </div>
  )
}

/* ─── Desktop sidebar content ─── */
function SidebarContent({ user, onLogout }) {
  const initials = (user?.nome || '??').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
  const roleLabel = user?.role === 'personal' ? 'Personal Trainer' : user?.role === 'admin_academia' ? 'Admin Academia' : 'Usuario'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '20px 12px' }}>
      <div style={{ padding: '4px 8px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 40, height: 40, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', boxShadow: '0 0 24px rgba(99,102,241,0.55)' }}>
            <Zap style={{ width: 18, height: 18, color: 'white' }} />
          </div>
          <div>
            <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 900, color: 'white', fontSize: 16, letterSpacing: '-0.02em', lineHeight: 1.1 }}>GymPro</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 1 }}>
              <span style={{ fontSize: 10, fontWeight: 800, color: '#6366f1', letterSpacing: '0.05em' }}>PRO</span>
              <span style={{ width: 3, height: 3, borderRadius: '50%', background: '#1A2540', display: 'inline-block' }} />
              <span style={{ fontSize: 10, color: '#1F2D4A', fontWeight: 600 }}>Academia</span>
            </div>
          </div>
        </div>
      </div>
      <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.3), transparent)', margin: '0 4px 20px' }} />
      <nav style={{ flex: 1, overflowY: 'auto' }}>
        <NavGroup label="Principal" items={NAV_MAIN} />
        <NavGroup label="Ferramentas" items={NAV_TOOLS} />
      </nav>
      <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)', margin: '4px' }} />
      <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 14, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: 'white', flexShrink: 0, boxShadow: '0 0 10px rgba(99,102,241,0.3)' }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#CBD5E1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.nome?.split(' ')[0]}</div>
            <div style={{ fontSize: 10, color: '#3D4F6A', marginTop: 1 }}>{roleLabel}</div>
          </div>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981', flexShrink: 0 }} />
        </div>
        <button onClick={onLogout} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 14, cursor: 'pointer', background: 'transparent', border: '1px solid transparent', width: '100%', transition: 'all 0.15s' }}
          onMouseEnter={ev => { ev.currentTarget.style.background = 'rgba(239,68,68,0.08)'; ev.currentTarget.style.borderColor = 'rgba(239,68,68,0.15)' }}
          onMouseLeave={ev => { ev.currentTarget.style.background = 'transparent'; ev.currentTarget.style.borderColor = 'transparent' }}>
          <div style={{ width: 30, height: 30, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(239,68,68,0.1)', flexShrink: 0 }}>
            <LogOut style={{ width: 13, height: 13, color: '#f87171' }} />
          </div>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#f87171' }}>Sair da conta</span>
        </button>
      </div>
    </div>
  )
}

/* ─── Mobile bottom navigation ─── */
function MobileBottomNav({ user, onLogout }) {
  const location = useLocation()
  const [showMore, setShowMore] = useState(false)
  const navigate = useNavigate()

  const isSecondaryActive = NAV_TOOLS.some(n => location.pathname.startsWith(n.to))

  return (
    <>
      {/* Bottom tab bar */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
        background: 'rgba(5,8,15,0.97)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}>
        <div style={{ display: 'flex', maxWidth: 640, margin: '0 auto' }}>
          {/* Main tabs */}
          {MOBILE_TABS.map(({ to, icon: Icon, label, accent, dot }) => {
            const isActive = location.pathname.startsWith(to)
            return (
              <NavLink key={to} to={to} style={{ flex: 1, textDecoration: 'none' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 0 8px', gap: 4, position: 'relative' }}>
                  {/* Active indicator pill above icon */}
                  {isActive && (
                    <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 32, height: 3, borderRadius: 2, background: dot, boxShadow: `0 0 8px ${dot}` }} />
                  )}
                  <div style={{ width: 48, height: 32, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', background: isActive ? `${dot}20` : 'transparent', transition: 'all 0.2s' }}>
                    <Icon style={{ width: 22, height: 22, color: isActive ? accent : '#3D4F6A', transition: 'color 0.2s' }} />
                  </div>
                  <span style={{ fontSize: 10, fontWeight: isActive ? 700 : 500, color: isActive ? accent : '#3D4F6A', fontFamily: 'Inter, sans-serif', transition: 'color 0.2s' }}>
                    {label}
                  </span>
                </div>
              </NavLink>
            )
          })}

          {/* "Mais" tab */}
          <button onClick={() => setShowMore(true)} style={{ flex: 1, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 0 8px', gap: 4, position: 'relative' }}>
              {isSecondaryActive && (
                <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 32, height: 3, borderRadius: 2, background: '#a78bfa', boxShadow: '0 0 8px #a78bfa' }} />
              )}
              <div style={{ width: 48, height: 32, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', background: isSecondaryActive ? 'rgba(167,139,250,0.15)' : 'transparent', transition: 'all 0.2s' }}>
                <MoreHorizontal style={{ width: 22, height: 22, color: isSecondaryActive ? '#c4b5fd' : '#3D4F6A' }} />
              </div>
              <span style={{ fontSize: 10, fontWeight: isSecondaryActive ? 700 : 500, color: isSecondaryActive ? '#c4b5fd' : '#3D4F6A', fontFamily: 'Inter, sans-serif' }}>
                Mais
              </span>
            </div>
          </button>
        </div>
      </nav>

      {/* "Mais" bottom sheet */}
      {showMore && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          {/* Backdrop */}
          <div
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
            onClick={() => setShowMore(false)}
          />
          {/* Sheet */}
          <div style={{
            position: 'relative', zIndex: 1,
            background: '#0E1525',
            borderTopLeftRadius: 28, borderTopRightRadius: 28,
            border: '1px solid rgba(255,255,255,0.08)',
            borderBottom: 'none',
            padding: '12px 20px',
            paddingBottom: 'calc(env(safe-area-inset-bottom) + 20px)',
            animation: 'slideUp 0.3s cubic-bezier(0.16,1,0.3,1)',
          }}>
            {/* Handle */}
            <div style={{ width: 40, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.15)', margin: '0 auto 20px' }} />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 16, fontWeight: 700, color: '#CBD5E1' }}>Ferramentas</span>
              <button onClick={() => setShowMore(false)} style={{ width: 32, height: 32, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.07)', border: 'none', cursor: 'pointer', color: '#64748B' }}>
                <X style={{ width: 14, height: 14 }} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 16 }}>
              {NAV_TOOLS.map(({ to, icon: Icon, label, accent, dot }) => {
                const isActive = location.pathname.startsWith(to)
                return (
                  <button key={to} onClick={() => { navigate(to); setShowMore(false) }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 16, cursor: 'pointer', width: '100%', border: 'none', textAlign: 'left', transition: 'all 0.15s',
                      background: isActive ? `${dot}15` : 'rgba(255,255,255,0.04)',
                    }}>
                    <div style={{ width: 44, height: 44, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${dot}20`, flexShrink: 0 }}>
                      <Icon style={{ width: 20, height: 20, color: accent }} />
                    </div>
                    <span style={{ flex: 1, fontSize: 15, fontWeight: 600, color: isActive ? '#EFF6FF' : '#94A3B8', fontFamily: 'Inter, sans-serif' }}>{label}</span>
                    <ChevronRight style={{ width: 16, height: 16, color: '#3D4F6A' }} />
                  </button>
                )
              })}
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '0 0 12px' }} />

            {/* User info + logout */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 16, background: 'rgba(255,255,255,0.03)', marginBottom: 8 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: 'white' }}>
                {(user?.nome || '??').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#CBD5E1' }}>{user?.nome?.split(' ')[0]}</div>
                <div style={{ fontSize: 11, color: '#3D4F6A' }}>{user?.email}</div>
              </div>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981' }} />
            </div>

            <button onClick={() => { onLogout(); setShowMore(false) }}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 16, cursor: 'pointer', width: '100%', border: '1px solid rgba(239,68,68,0.15)', background: 'rgba(239,68,68,0.07)', transition: 'all 0.15s' }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(239,68,68,0.12)' }}>
                <LogOut style={{ width: 18, height: 18, color: '#f87171' }} />
              </div>
              <span style={{ fontSize: 15, fontWeight: 600, color: '#f87171', fontFamily: 'Inter, sans-serif' }}>Sair da conta</span>
            </button>
          </div>
        </div>
      )}
    </>
  )
}

/* ─── Main layout ─── */
function NotifBell() {
  const { data } = useQuery({
    queryKey: ['notif-resumo'],
    queryFn: async () => (await resumoNotificacoes()).data,
    staleTime: 120_000,
    retry: false,
  })
  const count = data?.alunos_inativos || 0
  const navigate = useNavigate()
  if (!count) return null
  return (
    <button
      onClick={() => navigate('/inativos')}
      aria-label={`${count} aluno${count !== 1 ? 's' : ''} inativo${count !== 1 ? 's' : ''} — ver lista`}
      title={`${count} aluno${count !== 1 ? 's' : ''} inativo${count !== 1 ? 's' : ''}`}
      style={{ position: 'relative', background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)', borderRadius: 10, cursor: 'pointer', padding: '7px 10px', color: '#f97316', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700 }}
    >
      <Bell style={{ width: 15, height: 15 }} aria-hidden="true" />
      <span aria-hidden="true" style={{ background: '#f97316', color: 'white', borderRadius: 6, fontSize: 10, fontWeight: 900, padding: '1px 5px', lineHeight: 1.4 }}>{count}</span>
    </button>
  )
}

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#070B14' }}>
      {/* Desktop sidebar — hidden on mobile */}
      <aside className="hidden lg:flex flex-col" style={{ width: 270, flexShrink: 0, background: '#05080F', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
        <SidebarContent user={user} onLogout={handleLogout} />
      </aside>

      {/* Content area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowY: 'auto' }}>
        {/* Desktop: no header. Mobile: slim top bar with logo only */}
        <header className="lg:hidden" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 52, flexShrink: 0, background: 'rgba(5,8,15,0.96)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 26, height: 26, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', boxShadow: '0 0 12px rgba(99,102,241,0.45)' }}>
              <Zap style={{ width: 12, height: 12, color: 'white' }} />
            </div>
            <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 900, color: 'white', fontSize: 15, letterSpacing: '-0.02em' }}>GymPro</span>
            <span style={{ fontSize: 10, fontWeight: 800, color: '#6366f1', letterSpacing: '0.05em' }}>PRO</span>
          </div>
        </header>

        {/* Desktop top bar — search + bell */}
        <div className="hidden lg:flex" style={{ alignItems: 'center', justifyContent: 'flex-end', padding: '10px 32px 0', gap: 10 }}>
          <CommandPalette />
          <NotifBell />
        </div>

        {/* Main content — extra bottom padding on mobile for bottom nav */}
        <main className="flex-1 p-4 lg:p-8 pb-24 lg:pb-8 max-w-7xl w-full mx-auto animate-fade-in">
          <PlanBanner />
          {children}
        </main>
      </div>

      {/* Mobile bottom nav — hidden on desktop */}
      <div className="lg:hidden">
        <MobileBottomNav user={user} onLogout={handleLogout} />
      </div>
    </div>
  )
}
