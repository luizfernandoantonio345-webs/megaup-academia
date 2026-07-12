'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { useTheme } from '@/contexts/theme-context'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { resumoNotificacoes, listarAlunos, resumoFinanceiro, analyticsResumo, listarExercicios } from '@/lib/api-routes'
import { getInitials } from '@/lib/utils'
import { useState, useEffect, type ReactNode } from 'react'
import {
  LayoutDashboard, Users, Dumbbell, UserPlus, LogOut,
  X, DollarSign, MoreHorizontal, Calendar, Bell,
  BarChart2, Gift, CreditCard, Copy, QrCode,
  ArrowRight, CheckCircle, TrendingUp, UserCircle, Sun, Moon,
  Zap, Activity,
} from 'lucide-react'

const ST = 5 * 60_000

const NAV_MAIN = [
  { to: '/dashboard',  icon: LayoutDashboard, label: 'Dashboard',     color: '#6366f1', bg: '#6366f115', prefetch: { queryKey: ['analytics-resumo', 7], queryFn: () => analyticsResumo(7).then(r => r.data) } },
  { to: '/alunos',     icon: Users,           label: 'Alunos',        color: '#22c55e', bg: '#22c55e15', prefetch: { queryKey: ['alunos'], queryFn: () => listarAlunos().then(r => r.data) } },
  { to: '/analytics',  icon: BarChart2,       label: 'Analytics',     color: '#a855f7', bg: '#a855f715' },
  { to: '/agenda',     icon: Calendar,        label: 'Agenda',        color: '#f97316', bg: '#f9731615' },
  { to: '/exercicios', icon: Dumbbell,        label: 'Exercícios',    color: '#ef4444', bg: '#ef444415', prefetch: { queryKey: ['exercicios'], queryFn: () => listarExercicios().then(r => r.data) } },
] as const

const NAV_TOOLS = [
  { to: '/ia',           icon: Zap,        label: 'Sugestões IA',    color: '#eab308', bg: '#eab30815' },
  { to: '/templates',    icon: Copy,       label: 'Templates',       color: '#06b6d4', bg: '#06b6d415' },
  { to: '/qr',           icon: QrCode,     label: 'QR Check-in',     color: '#14b8a6', bg: '#14b8a615' },
  { to: '/financeiro',   icon: DollarSign, label: 'Financeiro',      color: '#10b981', bg: '#10b98115', prefetch: { queryKey: ['resumo'], queryFn: () => resumoFinanceiro().then(r => r.data) } },
  { to: '/convites',     icon: UserPlus,   label: 'Convidar alunos', color: '#f43f5e', bg: '#f43f5e15' },
  { to: '/periodizacao', icon: Activity,   label: 'Periodização',    color: '#8b5cf6', bg: '#8b5cf615' },
  { to: '/inativos',     icon: Bell,       label: 'Inativos',        color: '#f59e0b', bg: '#f59e0b15' },
  { to: '/planos',       icon: CreditCard, label: 'Planos & Billing',color: '#0ea5e9', bg: '#0ea5e915' },
  { to: '/referral',     icon: Gift,       label: 'Indicação',       color: '#ec4899', bg: '#ec489915' },
] as const

const MOBILE_TABS = NAV_MAIN

/* ── Nav item ─────────────────────────────────────────────────── */
type NavItemProps = { to: string; icon: React.ElementType; label: string; color: string; bg: string; prefetch?: { queryKey: unknown[]; queryFn: () => Promise<unknown> } }

function NavItem({ to, icon: Icon, label, color, bg, prefetch }: NavItemProps) {
  const pathname = usePathname()
  const qc = useQueryClient()
  const active = pathname === to || (to !== '/dashboard' && pathname.startsWith(to))

  return (
    <Link href={to} style={{ textDecoration: 'none' }}
      onMouseEnter={() => { if (prefetch) qc.prefetchQuery({ ...prefetch, staleTime: ST }) }}
    >
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, height: 34, padding: '0 10px',
        borderRadius: 8, cursor: 'pointer', transition: 'all 0.15s',
        background: active ? `${color}12` : 'transparent',
        border: active ? `1px solid ${color}25` : '1px solid transparent',
        position: 'relative', overflow: 'hidden',
      }}
        onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
        onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
      >
        {active && <div style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', width: 3, height: 16, borderRadius: 2, background: color }} />}
        <div style={{ width: 22, height: 22, borderRadius: 6, background: active ? bg : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s', flexShrink: 0 }}>
          <Icon style={{ width: 13, height: 13, color: active ? color : 'var(--text-muted)', transition: 'color 0.15s' }} />
        </div>
        <span style={{ fontSize: 13, fontWeight: active ? 600 : 400, color: active ? 'var(--text-primary)' : 'var(--text-muted)', transition: 'all 0.15s' }}>{label}</span>
      </div>
    </Link>
  )
}

/* ── Theme toggle ─────────────────────────────────────────────── */
function ThemeToggle() {
  const { theme, toggle } = useTheme()
  return (
    <button onClick={toggle} aria-label="Alternar tema"
      style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', transition: 'all 0.15s' }}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'var(--text-muted)' }}
    >
      {theme === 'dark' ? <Sun style={{ width: 14, height: 14 }} /> : <Moon style={{ width: 14, height: 14 }} />}
    </button>
  )
}

/* ── Notification bell ────────────────────────────────────────── */
function NotifBell() {
  const { data } = useQuery({ queryKey: ['notif-resumo'], queryFn: async () => (await resumoNotificacoes()).data, staleTime: 120_000, retry: false })
  const count = (data as { alunos_inativos?: number })?.alunos_inativos || 0
  const router = useRouter()
  if (!count) return (
    <button aria-label="Notificações" style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
      <Bell style={{ width: 14, height: 14 }} />
    </button>
  )
  return (
    <button onClick={() => router.push('/inativos')} aria-label={`${count} inativos`}
      style={{ position: 'relative', width: 32, height: 32, borderRadius: 8, background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f97316' }}>
      <Bell style={{ width: 14, height: 14 }} />
      <span style={{ position: 'absolute', top: -4, right: -4, width: 16, height: 16, borderRadius: '50%', background: '#f97316', color: '#fff', fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--bg-page)' }}>{count}</span>
    </button>
  )
}

/* ── Sidebar ──────────────────────────────────────────────────── */
function SidebarContent({ user, onLogout }: { user: { nome: string; email?: string; role?: string } | null; onLogout: () => void }) {
  const initials = getInitials(user?.nome || '??')
  const roleLabel = user?.role === 'admin_academia' ? 'Admin' : user?.role === 'personal' ? 'Personal' : 'Aluno'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '16px 10px 12px' }}>

      {/* Logo */}
      <div style={{ padding: '0 4px 18px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg, #ef4444, #dc2626)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(239,68,68,0.4)', flexShrink: 0 }}>
          <span style={{ fontSize: 15, fontWeight: 900, color: 'white', letterSpacing: '-1px' }}>M</span>
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1.1 }}>MegaUp</div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 500 }}>Jardim das Rosas</div>
        </div>
      </div>

      <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, var(--border), transparent)', margin: '0 4px 14px' }} />

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1 }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-disabled)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 10px 8px' }}>Principal</p>
        {NAV_MAIN.map(item => <NavItem key={item.to} {...item} />)}

        <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, var(--border), transparent)', margin: '12px 4px' }} />

        <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-disabled)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 10px 8px' }}>Ferramentas</p>
        {NAV_TOOLS.map(item => <NavItem key={item.to} {...item} />)}
      </nav>

      {/* User card */}
      <div style={{ marginTop: 8, borderTop: '1px solid var(--border-subtle)', paddingTop: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', marginBottom: 6 }}>
          <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg, #ef4444, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'white', flexShrink: 0, position: 'relative' }}>
            {initials}
            <div style={{ position: 'absolute', bottom: 0, right: 0, width: 8, height: 8, borderRadius: '50%', background: '#22c55e', border: '1.5px solid var(--bg-sidebar)' }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.nome?.split(' ')[0]}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{roleLabel}</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 6 }}>
          <Link href="/perfil" style={{ flex: 1, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, height: 30, borderRadius: 7, background: 'transparent', border: '1px solid var(--border-subtle)', fontSize: 12, color: 'var(--text-muted)', fontWeight: 500, transition: 'all 0.15s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)' }}
          >
            <UserCircle style={{ width: 13, height: 13 }} /> Perfil
          </Link>
          <button onClick={onLogout}
            style={{ width: 30, height: 30, borderRadius: 7, background: 'transparent', border: '1px solid var(--border-subtle)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', transition: 'all 0.15s', flexShrink: 0 }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'; e.currentTarget.style.color = '#ef4444' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.color = 'var(--text-muted)' }}
          >
            <LogOut style={{ width: 13, height: 13 }} />
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Mobile bottom nav ────────────────────────────────────────── */
function MobileBottomNav({ user, onLogout }: { user: { nome: string; email?: string } | null; onLogout: () => void }) {
  const pathname = usePathname()
  const router = useRouter()
  const [showMore, setShowMore] = useState(false)
  const isSecondaryActive = NAV_TOOLS.some(n => pathname.startsWith(n.to))

  return (
    <>
      <nav className="nav-blur-bg" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50, backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderTop: '1px solid var(--border-subtle)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div style={{ display: 'flex', maxWidth: 640, margin: '0 auto', padding: '4px 0' }}>
          {MOBILE_TABS.map(({ to, icon: Icon, label, color }) => {
            const active = pathname === to || (to !== '/dashboard' && pathname.startsWith(to))
            return (
              <Link key={to} href={to} style={{ flex: 1, textDecoration: 'none' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 0 6px', gap: 3, position: 'relative' }}>
                  {active && <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 20, height: 2, borderRadius: 1, background: color }} />}
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: active ? `${color}18` : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}>
                    <Icon style={{ width: 18, height: 18, color: active ? color : 'var(--text-disabled)', transition: 'color 0.15s' }} />
                  </div>
                  <span style={{ fontSize: 10, fontWeight: active ? 700 : 400, color: active ? color : 'var(--text-disabled)', transition: 'all 0.15s' }}>{label}</span>
                </div>
              </Link>
            )
          })}
          <button onClick={() => setShowMore(true)} style={{ flex: 1, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 0 6px', gap: 3 }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: isSecondaryActive ? 'rgba(239,68,68,0.12)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MoreHorizontal style={{ width: 18, height: 18, color: isSecondaryActive ? '#ef4444' : 'var(--text-disabled)' }} />
              </div>
              <span style={{ fontSize: 10, fontWeight: isSecondaryActive ? 700 : 400, color: isSecondaryActive ? '#ef4444' : 'var(--text-disabled)' }}>Mais</span>
            </div>
          </button>
        </div>
      </nav>

      {showMore && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }} onClick={() => setShowMore(false)} />
          <div style={{ position: 'relative', zIndex: 1, background: 'var(--bg-card)', border: '1px solid var(--border)', borderBottom: 'none', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: '8px 16px', paddingBottom: 'calc(env(safe-area-inset-bottom) + 16px)', animation: 'sheetUp 0.25s cubic-bezier(0.16,1,0.3,1)' }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--border)', margin: '8px auto 16px' }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Ferramentas</span>
              <button onClick={() => setShowMore(false)} style={{ width: 28, height: 28, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-elevated)', border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X style={{ width: 13, height: 13 }} />
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
              {NAV_TOOLS.map(({ to, icon: Icon, label, color, bg }) => {
                const active = pathname.startsWith(to)
                return (
                  <button key={to} onClick={() => { router.push(to); setShowMore(false) }}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 10, cursor: 'pointer', border: `1px solid ${active ? color + '30' : 'var(--border-subtle)'}`, background: active ? bg : 'var(--bg-elevated)', textAlign: 'left' }}>
                    <div style={{ width: 28, height: 28, borderRadius: 7, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon style={{ width: 14, height: 14, color }} />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 500, color: active ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{label}</span>
                  </button>
                )
              })}
            </div>
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 12, display: 'flex', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, padding: '10px 14px', borderRadius: 10, background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#ef4444,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'white' }}>{getInitials(user?.nome || '??')}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{user?.nome?.split(' ')[0]}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-disabled)' }}>{user?.email}</div>
                </div>
              </div>
              <button onClick={() => { onLogout(); setShowMore(false) }}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px', borderRadius: 10, cursor: 'pointer', border: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)', color: 'var(--text-muted)', transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'; e.currentTarget.style.color = '#ef4444' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.color = 'var(--text-muted)' }}>
                <LogOut style={{ width: 15, height: 15 }} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

/* ── Main App Shell ───────────────────────────────────────────── */
export function AppShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth()
  const router = useRouter()
  const handleLogout = async () => { await logout(); router.push('/login') }

  const [showOnboarding, setShowOnboarding] = useState(false)
  useEffect(() => {
    if (!user?.id) return
    const key = `megaup_personal_ob_${user.id}`
    if (!localStorage.getItem(key)) setShowOnboarding(true)
  }, [user?.id])
  const doneOnboarding = () => {
    if (user?.id) localStorage.setItem(`megaup_personal_ob_${user.id}`, '1')
    setShowOnboarding(false)
  }

  return (
    <div className="h-screen-dvh page-bg" style={{ display: 'flex' }}>
      <a href="#main-content" className="skip-nav">Pular para o conteúdo</a>

      {/* Desktop sidebar */}
      <aside className="sidebar-bg hidden lg:flex flex-col" style={{ width: 224, flexShrink: 0, borderRight: '1px solid var(--border-subtle)' }}>
        <SidebarContent user={user} onLogout={handleLogout} />
      </aside>

      {/* Content */}
      <div className="scroll-content-area">
        {/* Mobile top bar */}
        <header className="lg:hidden nav-blur-bg" style={{ position: 'sticky', top: 0, zIndex: 40, flexShrink: 0, paddingTop: 'env(safe-area-inset-top)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 48, padding: '0 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 26, height: 26, background: 'linear-gradient(135deg,#ef4444,#dc2626)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(239,68,68,0.4)' }}>
                <span style={{ fontSize: 12, fontWeight: 900, color: 'white', letterSpacing: '-1px' }}>M</span>
              </div>
              <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>MegaUp</span>
            </div>
            <ThemeToggle />
          </div>
        </header>

        {/* Desktop header */}
        <div className="hidden lg:flex" style={{ alignItems: 'center', justifyContent: 'flex-end', padding: '12px 28px 0', gap: 8 }}>
          <NotifBell />
          <ThemeToggle />
        </div>

        {/* Main */}
        <main id="main-content" className="flex-1 p-4 lg:p-6 main-content-mobile" style={{ maxWidth: 1200, width: '100%', margin: '0 auto' }}>
          {children}
        </main>
      </div>

      {/* Mobile nav */}
      <div className="lg:hidden">
        <MobileBottomNav user={user} onLogout={handleLogout} />
      </div>

      {showOnboarding && <OnboardingPersonal onDone={doneOnboarding} />}
    </div>
  )
}

/* ── Onboarding ───────────────────────────────────────────────── */
const OB_STEPS = [
  { icon: '👋', title: 'Bem-vindo ao MegaUp!', desc: 'Sua plataforma completa de gestão de alunos. Vamos configurar tudo em 3 passos rápidos.', cta: 'Começar' },
  { icon: '👤', title: 'Adicione seu primeiro aluno', desc: 'Vá em Alunos → Novo aluno para cadastrar. Depois envie um convite pelo e-mail para ele criar o login.', cta: 'Entendido', action: { label: 'Ir para Alunos', to: '/alunos' } },
  { icon: '🏋️', title: 'Monte o treino', desc: 'Em Alunos → escolha o aluno → Novo treino. Adicione exercícios, séries e cargas. Use templates para agilizar.', cta: 'Entendido', action: { label: 'Ver templates', to: '/templates' } },
  { icon: '🚀', title: 'Tudo pronto!', desc: 'Acompanhe o progresso pelo Dashboard, envie sugestões de carga via IA e monitore pagamentos no Financeiro.', cta: 'Explorar' },
]

function OnboardingPersonal({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0)
  const router = useRouter()
  const s = OB_STEPS[step]
  const isLast = step === OB_STEPS.length - 1
  const advance = () => { if (isLast) { onDone(); return } setStep(s => s + 1) }
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: 'linear-gradient(160deg, #18191e 0%, #111113 100%)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: '40px 36px', maxWidth: 420, width: '100%', textAlign: 'center', boxShadow: '0 32px 64px rgba(0,0,0,0.7)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 32 }}>
          {OB_STEPS.map((_, i) => <div key={i} style={{ width: i === step ? 24 : 6, height: 6, borderRadius: 3, background: i === step ? '#ef4444' : i < step ? 'rgba(239,68,68,0.4)' : 'var(--border)', transition: 'all 0.3s' }} />)}
        </div>
        <div style={{ fontSize: 56, marginBottom: 20 }}>{s.icon}</div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em', marginBottom: 12 }}>{s.title}</h2>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 32 }}>{s.desc}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {s.action && (
            <button onClick={() => { advance(); router.push(s.action!.to) }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 20px', borderRadius: 12, border: '1px solid var(--border)', background: 'rgba(255,255,255,0.04)', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' }}>
              <ArrowRight style={{ width: 14, height: 14 }} /> {s.action.label}
            </button>
          )}
          <button onClick={advance} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px 20px', borderRadius: 12, background: 'linear-gradient(135deg,#ef4444,#dc2626)', border: 'none', color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 16px rgba(239,68,68,0.4)', transition: 'all 0.15s' }}>
            {isLast ? <><CheckCircle style={{ width: 15, height: 15 }} /> {s.cta}</> : <>{s.cta} <ArrowRight style={{ width: 14, height: 14 }} /></>}
          </button>
        </div>
      </div>
    </div>
  )
}
