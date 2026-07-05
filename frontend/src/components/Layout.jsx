import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  LayoutDashboard, Users, Dumbbell, Brain, UserPlus, LogOut,
  X, DollarSign, Zap, MoreHorizontal, ChevronRight, CreditCard,
  BarChart2, Gift, Calendar, Bell, Apple, ChevronDown,
} from 'lucide-react'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { resumoNotificacoes } from '../api'
import PlanBanner from './PlanBanner'
import CommandPalette from './CommandPalette'

const NAV_MAIN = [
  { to: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard'       },
  { to: '/alunos',       icon: Users,            label: 'Alunos'          },
  { to: '/analytics',    icon: BarChart2,        label: 'Analytics'       },
  { to: '/agenda',       icon: Calendar,         label: 'Agenda'          },
  { to: '/exercicios',   icon: Dumbbell,         label: 'Exercícios'      },
]

const NAV_TOOLS = [
  { to: '/ia',           icon: Brain,       label: 'IA — Progressão'  },
  { to: '/financeiro',   icon: DollarSign,  label: 'Financeiro'        },
  { to: '/convites',     icon: UserPlus,    label: 'Convidar alunos'   },
  { to: '/periodizacao', icon: BarChart2,   label: 'Periodização'      },
  { to: '/inativos',     icon: Bell,        label: 'Inativos'          },
  { to: '/planos',       icon: CreditCard,  label: 'Planos & Billing'  },
  { to: '/referral',     icon: Gift,        label: 'Indicação'         },
]

const ALL_NAV    = [...NAV_MAIN, ...NAV_TOOLS]
const MOBILE_TABS = NAV_MAIN

/* ─── Nav item ─── */
function NavItem({ to, icon: Icon, label }) {
  const location = useLocation()
  const active = location.pathname === to || (to !== '/dashboard' && location.pathname.startsWith(to))
  return (
    <NavLink to={to} style={{ textDecoration: 'none' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 9,
        height: 34, padding: '0 10px', borderRadius: 6,
        cursor: 'pointer', color: active ? '#F4F4F5' : '#71717A',
        background: active ? '#1C1C1E' : 'transparent',
        fontWeight: active ? 500 : 400,
        fontSize: 13, fontFamily: 'Inter, sans-serif',
        transition: 'color 0.1s, background 0.1s',
      }}
      onMouseEnter={e => { if (!active) { e.currentTarget.style.background = '#161618'; e.currentTarget.style.color = '#A1A1AA' } }}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#71717A' } }}
      >
        <Icon style={{ width: 15, height: 15, flexShrink: 0, opacity: active ? 1 : 0.6 }} />
        <span>{label}</span>
      </div>
    </NavLink>
  )
}

/* ─── Desktop sidebar ─── */
function SidebarContent({ user, onLogout }) {
  const initials = (user?.nome || '??').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '14px 10px' }}>

      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '2px 8px 14px' }}>
        <div style={{ width: 22, height: 22, borderRadius: 6, background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Zap style={{ width: 12, height: 12, color: 'white' }} />
        </div>
        <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, color: '#F4F4F5', fontSize: 14, letterSpacing: '-0.01em' }}>GymPro</span>
      </div>

      <div style={{ height: 1, background: '#1C1C1E', margin: '0 2px 12px' }} />

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1 }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: '#52525B', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '0 10px 6px', fontFamily: 'Inter, sans-serif' }}>
          Principal
        </p>
        {NAV_MAIN.map(item => <NavItem key={item.to} {...item} />)}

        <div style={{ height: 1, background: '#1C1C1E', margin: '10px 4px' }} />

        <p style={{ fontSize: 11, fontWeight: 600, color: '#52525B', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '0 10px 6px', fontFamily: 'Inter, sans-serif' }}>
          Ferramentas
        </p>
        {NAV_TOOLS.map(item => <NavItem key={item.to} {...item} />)}
      </nav>

      {/* User */}
      <div style={{ marginTop: 8, borderTop: '1px solid #1C1C1E', paddingTop: 10, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '0 10px', height: 36 }}>
          <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#1C1C1E', border: '1px solid #27272A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600, color: '#A1A1AA', flexShrink: 0, fontFamily: 'Inter, sans-serif' }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#A1A1AA', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'Inter, sans-serif' }}>
              {user?.nome?.split(' ')[0]}
            </div>
          </div>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', flexShrink: 0 }} title="Online" />
        </div>
        <button onClick={onLogout}
          style={{ display: 'flex', alignItems: 'center', gap: 9, height: 32, padding: '0 10px', borderRadius: 6, cursor: 'pointer', background: 'transparent', border: 'none', width: '100%', color: '#71717A', fontSize: 13, fontFamily: 'Inter, sans-serif', transition: 'background 0.1s, color 0.1s' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.08)'; e.currentTarget.style.color = '#f87171' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#71717A' }}
        >
          <LogOut style={{ width: 14, height: 14, flexShrink: 0 }} />
          <span>Sair</span>
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
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
        background: 'rgba(10,10,11,0.97)', backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderTop: '1px solid #1C1C1E',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}>
        <div style={{ display: 'flex', maxWidth: 640, margin: '0 auto', padding: '4px 0' }}>
          {MOBILE_TABS.map(({ to, icon: Icon, label }) => {
            const active = location.pathname === to || (to !== '/dashboard' && location.pathname.startsWith(to))
            return (
              <NavLink key={to} to={to} style={{ flex: 1, textDecoration: 'none' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 0 6px', gap: 3, position: 'relative' }}>
                  {active && (
                    <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 20, height: 2, borderRadius: 1, background: '#6366f1' }} />
                  )}
                  <Icon style={{ width: 20, height: 20, color: active ? '#818cf8' : '#52525B' }} />
                  <span style={{ fontSize: 10, fontWeight: active ? 600 : 400, color: active ? '#818cf8' : '#52525B', fontFamily: 'Inter, sans-serif' }}>
                    {label}
                  </span>
                </div>
              </NavLink>
            )
          })}

          <button onClick={() => setShowMore(true)} style={{ flex: 1, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 0 6px', gap: 3 }}>
              <MoreHorizontal style={{ width: 20, height: 20, color: isSecondaryActive ? '#818cf8' : '#52525B' }} />
              <span style={{ fontSize: 10, fontWeight: isSecondaryActive ? 600 : 400, color: isSecondaryActive ? '#818cf8' : '#52525B', fontFamily: 'Inter, sans-serif' }}>
                Mais
              </span>
            </div>
          </button>
        </div>
      </nav>

      {showMore && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)' }} onClick={() => setShowMore(false)} />
          <div style={{
            position: 'relative', zIndex: 1,
            background: '#111113', border: '1px solid #1C1C1E', borderBottom: 'none',
            borderTopLeftRadius: 16, borderTopRightRadius: 16,
            padding: '8px 16px',
            paddingBottom: 'calc(env(safe-area-inset-bottom) + 16px)',
            animation: 'sheetUp 0.25s cubic-bezier(0.16,1,0.3,1)',
          }}>
            <div style={{ width: 32, height: 3, borderRadius: 2, background: '#27272A', margin: '6px auto 18px' }} />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600, color: '#A1A1AA' }}>Ferramentas</span>
              <button onClick={() => setShowMore(false)} style={{ width: 28, height: 28, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1C1C1E', border: '1px solid #27272A', cursor: 'pointer', color: '#71717A' }}>
                <X style={{ width: 13, height: 13 }} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 14 }}>
              {NAV_TOOLS.map(({ to, icon: Icon, label }) => {
                const active = location.pathname.startsWith(to)
                return (
                  <button key={to} onClick={() => { navigate(to); setShowMore(false) }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px',
                      borderRadius: 8, cursor: 'pointer', border: '1px solid',
                      borderColor: active ? '#27272A' : '#1C1C1E',
                      background: active ? '#1C1C1E' : '#161618',
                      textAlign: 'left',
                    }}>
                    <Icon style={{ width: 16, height: 16, color: active ? '#818cf8' : '#71717A', flexShrink: 0 }} />
                    <span style={{ fontSize: 13, fontWeight: 500, color: active ? '#F4F4F5' : '#A1A1AA', fontFamily: 'Inter, sans-serif' }}>{label}</span>
                  </button>
                )
              })}
            </div>

            <div style={{ borderTop: '1px solid #1C1C1E', paddingTop: 12, display: 'flex', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, padding: '10px 14px', borderRadius: 8, background: '#161618', border: '1px solid #1C1C1E' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#1C1C1E', border: '1px solid #27272A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: '#A1A1AA', fontFamily: 'Inter, sans-serif' }}>
                  {(user?.nome || '??').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#A1A1AA', fontFamily: 'Inter, sans-serif' }}>{user?.nome?.split(' ')[0]}</div>
                  <div style={{ fontSize: 11, color: '#52525B', fontFamily: 'Inter, sans-serif' }}>{user?.email}</div>
                </div>
              </div>
              <button onClick={() => { onLogout(); setShowMore(false) }}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px', borderRadius: 8, cursor: 'pointer', border: '1px solid #1C1C1E', background: '#161618', color: '#71717A', transition: 'all 0.1s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(248,113,113,0.2)'; e.currentTarget.style.color = '#f87171' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#1C1C1E'; e.currentTarget.style.color = '#71717A' }}
              >
                <LogOut style={{ width: 15, height: 15 }} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

/* ─── Notification bell ─── */
function NotifBell() {
  const { data } = useQuery({
    queryKey: ['notif-resumo'],
    queryFn: async () => (await resumoNotificacoes()).data,
    staleTime: 120_000, retry: false,
  })
  const count = data?.alunos_inativos || 0
  const navigate = useNavigate()
  if (!count) return null
  return (
    <button
      onClick={() => navigate('/inativos')}
      aria-label={`${count} aluno${count !== 1 ? 's' : ''} inativo${count !== 1 ? 's' : ''}`}
      style={{ position: 'relative', background: 'transparent', border: '1px solid #27272A', borderRadius: 6, cursor: 'pointer', padding: '5px 10px', color: '#71717A', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 500, fontFamily: 'Inter, sans-serif', transition: 'all 0.1s' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = '#3F3F46'; e.currentTarget.style.color = '#A1A1AA' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = '#27272A'; e.currentTarget.style.color = '#71717A' }}
    >
      <Bell style={{ width: 13, height: 13 }} aria-hidden="true" />
      <span style={{ background: '#f97316', color: 'white', borderRadius: 4, fontSize: 10, fontWeight: 600, padding: '0 5px', lineHeight: 1.6 }}>{count}</span>
    </button>
  )
}

/* ─── Main layout ─── */
export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0C0C0D' }}>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col" style={{ width: 220, flexShrink: 0, background: '#0A0A0B', borderRight: '1px solid #1C1C1E' }}>
        <SidebarContent user={user} onLogout={handleLogout} />
      </aside>

      {/* Content area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowY: 'auto' }}>

        {/* Mobile top bar */}
        <header className="lg:hidden" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 48, flexShrink: 0, background: 'rgba(10,10,11,0.97)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #1C1C1E' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <div style={{ width: 20, height: 20, borderRadius: 5, background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap style={{ width: 11, height: 11, color: 'white' }} />
            </div>
            <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, color: '#F4F4F5', fontSize: 14, letterSpacing: '-0.01em' }}>GymPro</span>
          </div>
        </header>

        {/* Desktop header row */}
        <div className="hidden lg:flex" style={{ alignItems: 'center', justifyContent: 'flex-end', padding: '10px 24px 0', gap: 8 }}>
          <CommandPalette />
          <NotifBell />
        </div>

        {/* Main content */}
        <main className="flex-1 p-4 lg:p-6 pb-24 lg:pb-6" style={{ maxWidth: 1200, width: '100%', margin: '0 auto' }}>
          <PlanBanner />
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <div className="lg:hidden">
        <MobileBottomNav user={user} onLogout={handleLogout} />
      </div>
    </div>
  )
}
