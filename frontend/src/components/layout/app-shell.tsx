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
} from 'lucide-react'

const ST = 5 * 60_000

const NAV_MAIN = [
  { to: '/dashboard',  icon: LayoutDashboard, label: 'Dashboard',   prefetch: { queryKey: ['analytics-resumo', 7], queryFn: () => analyticsResumo(7).then((r) => r.data) } },
  { to: '/alunos',     icon: Users,            label: 'Alunos',      prefetch: { queryKey: ['alunos'],              queryFn: () => listarAlunos().then((r) => r.data) } },
  { to: '/analytics',  icon: BarChart2,        label: 'Analytics' },
  { to: '/agenda',     icon: Calendar,         label: 'Agenda' },
  { to: '/exercicios', icon: Dumbbell,         label: 'Exercícios',  prefetch: { queryKey: ['exercicios'],          queryFn: () => listarExercicios().then((r) => r.data) } },
] as const

const NAV_TOOLS = [
  { to: '/ia',           icon: TrendingUp, label: 'Sugestões IA' },
  { to: '/templates',    icon: Copy,       label: 'Templates' },
  { to: '/qr',           icon: QrCode,     label: 'QR Check-in' },
  { to: '/financeiro',   icon: DollarSign, label: 'Financeiro',    prefetch: { queryKey: ['resumo'], queryFn: () => resumoFinanceiro().then((r) => r.data) } },
  { to: '/convites',     icon: UserPlus,   label: 'Convidar alunos' },
  { to: '/periodizacao', icon: BarChart2,  label: 'Periodização' },
  { to: '/inativos',     icon: Bell,       label: 'Inativos' },
  { to: '/planos',       icon: CreditCard, label: 'Planos & Billing' },
  { to: '/referral',     icon: Gift,       label: 'Indicação' },
] as const

const MOBILE_TABS = NAV_MAIN

/* ── Nav item ─────────────────────────────────────────────── */
function NavItem({ to, icon: Icon, label, prefetch }: { to: string; icon: React.ElementType; label: string; prefetch?: { queryKey: unknown[]; queryFn: () => Promise<unknown> } }) {
  const pathname = usePathname()
  const qc = useQueryClient()
  const active = pathname === to || (to !== '/dashboard' && pathname.startsWith(to))

  return (
    <Link href={to} style={{ textDecoration: 'none' }}
      onMouseEnter={() => {
        if (prefetch) qc.prefetchQuery({ ...prefetch, staleTime: ST })
      }}
    >
      <div className={active ? 'nav-item nav-item-active' : 'nav-item'}>
        <Icon style={{ width: 15, height: 15, flexShrink: 0, opacity: active ? 1 : 0.6 }} />
        <span>{label}</span>
      </div>
    </Link>
  )
}

/* ── Theme toggle ─────────────────────────────────────────── */
function ThemeToggle() {
  const { theme, toggle } = useTheme()
  return (
    <button onClick={toggle} aria-label="Alternar tema"
      style={{ width: 32, height: 32, borderRadius: 6, background: 'transparent', border: '1px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', transition: 'all 0.1s' }}
      onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)' }}
    >
      {theme === 'dark' ? <Sun style={{ width: 14, height: 14 }} /> : <Moon style={{ width: 14, height: 14 }} />}
    </button>
  )
}

/* ── Notification bell ────────────────────────────────────── */
function NotifBell() {
  const { data } = useQuery({ queryKey: ['notif-resumo'], queryFn: async () => (await resumoNotificacoes()).data, staleTime: 120_000, retry: false })
  const count = (data as { alunos_inativos?: number })?.alunos_inativos || 0
  const router = useRouter()
  if (!count) return null
  return (
    <button onClick={() => router.push('/inativos')} aria-label={`${count} aluno${count !== 1 ? 's' : ''} inativo${count !== 1 ? 's' : ''}`}
      style={{ position: 'relative', background: 'transparent', border: '1px solid var(--border)', borderRadius: 6, cursor: 'pointer', padding: '5px 10px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 500, transition: 'all 0.1s' }}>
      <Bell style={{ width: 13, height: 13 }} />
      <span style={{ background: '#f97316', color: 'white', borderRadius: 4, fontSize: 10, fontWeight: 600, padding: '0 5px', lineHeight: 1.6 }}>{count}</span>
    </button>
  )
}

/* ── Sidebar content ──────────────────────────────────────── */
function SidebarContent({ user, onLogout }: { user: { nome: string; email?: string } | null; onLogout: () => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '14px 10px' }}>
      <div style={{ padding: '2px 4px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 22, height: 22, background: '#ef4444', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: 'white', letterSpacing: '-1px' }}>M</span>
        </div>
        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>MegaUp</span>
      </div>

      <div style={{ height: 1, background: 'var(--border-subtle)', margin: '0 2px 12px' }} />

      <nav style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1 }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-disabled)', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '0 10px 6px' }}>Principal</p>
        {NAV_MAIN.map((item) => <NavItem key={item.to} {...item} />)}

        <div style={{ height: 1, background: 'var(--border-subtle)', margin: '10px 4px' }} />

        <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-disabled)', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '0 10px 6px' }}>Ferramentas</p>
        {NAV_TOOLS.map((item) => <NavItem key={item.to} {...item} />)}
      </nav>

      <div style={{ marginTop: 8, borderTop: '1px solid var(--border-subtle)', paddingTop: 10, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '0 10px', height: 36 }}>
          <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--bg-elevated)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600, color: 'var(--text-secondary)', flexShrink: 0 }}>
            {getInitials(user?.nome || '??')}
          </div>
          <div style={{ flex: 1, minWidth: 0, fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.nome?.split(' ')[0]}
          </div>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', flexShrink: 0 }} title="Online" />
        </div>

        <Link href="/perfil" style={{ textDecoration: 'none' }}>
          <div className="nav-item">
            <UserCircle style={{ width: 14, height: 14, flexShrink: 0 }} />
            <span>Meu perfil</span>
          </div>
        </Link>

        <button onClick={onLogout}
          style={{ display: 'flex', alignItems: 'center', gap: 9, height: 32, padding: '0 10px', borderRadius: 6, cursor: 'pointer', background: 'transparent', border: 'none', width: '100%', color: 'var(--text-muted)', fontSize: 13, transition: 'background 0.1s, color 0.1s', textAlign: 'left' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-danger-muted)'; e.currentTarget.style.color = 'var(--color-danger)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)' }}
        >
          <LogOut style={{ width: 14, height: 14, flexShrink: 0 }} />
          <span>Sair</span>
        </button>
      </div>
    </div>
  )
}

/* ── Mobile bottom nav ────────────────────────────────────── */
function MobileBottomNav({ user, onLogout }: { user: { nome: string; email?: string } | null; onLogout: () => void }) {
  const pathname = usePathname()
  const router = useRouter()
  const [showMore, setShowMore] = useState(false)
  const isSecondaryActive = NAV_TOOLS.some((n) => pathname.startsWith(n.to))

  return (
    <>
      <nav className="nav-blur-bg" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50, backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderTop: '1px solid var(--border-subtle)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div style={{ display: 'flex', maxWidth: 640, margin: '0 auto', padding: '4px 0' }}>
          {MOBILE_TABS.map(({ to, icon: Icon, label }) => {
            const active = pathname === to || (to !== '/dashboard' && pathname.startsWith(to))
            return (
              <Link key={to} href={to} style={{ flex: 1, textDecoration: 'none' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 0 6px', gap: 3, position: 'relative' }}>
                  {active && <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 20, height: 2, borderRadius: 1, background: '#ef4444' }} />}
                  <Icon style={{ width: 20, height: 20, color: active ? '#f87171' : 'var(--text-disabled)' }} />
                  <span style={{ fontSize: 10, fontWeight: active ? 600 : 400, color: active ? '#f87171' : 'var(--text-disabled)' }}>{label}</span>
                </div>
              </Link>
            )
          })}
          <button onClick={() => setShowMore(true)} style={{ flex: 1, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 0 6px', gap: 3 }}>
              <MoreHorizontal style={{ width: 20, height: 20, color: isSecondaryActive ? '#f87171' : 'var(--text-disabled)' }} />
              <span style={{ fontSize: 10, fontWeight: isSecondaryActive ? 600 : 400, color: isSecondaryActive ? '#f87171' : 'var(--text-disabled)' }}>Mais</span>
            </div>
          </button>
        </div>
      </nav>

      {showMore && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)' }} onClick={() => setShowMore(false)} />
          <div style={{ position: 'relative', zIndex: 1, background: 'var(--bg-card)', border: '1px solid var(--border)', borderBottom: 'none', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: '8px 16px', paddingBottom: 'calc(env(safe-area-inset-bottom) + 16px)', animation: 'sheetUp 0.25s cubic-bezier(0.16,1,0.3,1)' }}>
            <div style={{ width: 32, height: 3, borderRadius: 2, background: 'var(--border)', margin: '6px auto 18px' }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)' }}>Ferramentas</span>
              <button onClick={() => setShowMore(false)} style={{ width: 28, height: 28, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-elevated)', border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X style={{ width: 13, height: 13 }} />
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 14 }}>
              {NAV_TOOLS.map(({ to, icon: Icon, label }) => {
                const active = pathname.startsWith(to)
                return (
                  <button key={to} onClick={() => { router.push(to); setShowMore(false) }}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 8, cursor: 'pointer', border: '1px solid', borderColor: active ? 'var(--border)' : 'var(--border-subtle)', background: active ? 'var(--bg-elevated)' : 'var(--bg-sidebar)', textAlign: 'left' }}>
                    <Icon style={{ width: 16, height: 16, color: active ? '#f87171' : 'var(--text-muted)', flexShrink: 0 }} />
                    <span style={{ fontSize: 13, fontWeight: 500, color: active ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{label}</span>
                  </button>
                )
              })}
            </div>
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 12, display: 'flex', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, padding: '10px 14px', borderRadius: 8, background: 'var(--bg-sidebar)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--bg-elevated)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)' }}>
                  {getInitials(user?.nome || '??')}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>{user?.nome?.split(' ')[0]}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-disabled)' }}>{user?.email}</div>
                </div>
              </div>
              <button onClick={() => { onLogout(); setShowMore(false) }}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px', borderRadius: 8, cursor: 'pointer', border: '1px solid var(--border-subtle)', background: 'var(--bg-sidebar)', color: 'var(--text-muted)', transition: 'all 0.1s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(248,113,113,0.2)'; e.currentTarget.style.color = '#f87171' }}
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

/* ── Main App Shell ───────────────────────────────────────── */
export function AppShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  // Onboarding
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
      <aside className="sidebar-bg hidden lg:flex flex-col" style={{ width: 220, flexShrink: 0 }}>
        <SidebarContent user={user} onLogout={handleLogout} />
      </aside>

      {/* Content */}
      <div className="scroll-content-area">
        {/* Mobile top bar */}
        <header className="lg:hidden nav-blur-bg" style={{ position: 'sticky', top: 0, zIndex: 40, flexShrink: 0, paddingTop: 'env(safe-area-inset-top)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 48, padding: '0 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 20, height: 20, background: '#ef4444', borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 10, fontWeight: 800, color: 'white', letterSpacing: '-1px' }}>M</span>
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>MegaUp</span>
            </div>
            <ThemeToggle />
          </div>
        </header>

        {/* Desktop header */}
        <div className="hidden lg:flex" style={{ alignItems: 'center', justifyContent: 'flex-end', padding: '10px 24px 0', gap: 8 }}>
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

/* ── Onboarding ───────────────────────────────────────────── */
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
  const advance = () => { if (isLast) { onDone(); return } setStep((s) => s + 1) }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 24, padding: '36px 32px', maxWidth: 420, width: '100%', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 28 }}>
          {OB_STEPS.map((_, i) => <div key={i} style={{ width: i === step ? 20 : 6, height: 6, borderRadius: 3, background: i === step ? '#ef4444' : i < step ? 'rgba(239,68,68,0.4)' : 'var(--border)', transition: 'all 0.3s' }} />)}
        </div>
        <div style={{ fontSize: 52, marginBottom: 16 }}>{s.icon}</div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 12 }}>{s.title}</h2>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.65, marginBottom: 28 }}>{s.desc}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {s.action && (
            <button onClick={() => { advance(); router.push(s.action!.to) }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '11px 20px', borderRadius: 12, border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
              <ArrowRight style={{ width: 14, height: 14 }} /> {s.action.label}
            </button>
          )}
          <button onClick={advance} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px 20px', borderRadius: 12, background: '#ef4444', border: 'none', color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            {isLast ? <><CheckCircle style={{ width: 15, height: 15 }} /> {s.cta}</> : <>{s.cta} <ArrowRight style={{ width: 14, height: 14 }} /></>}
          </button>
        </div>
      </div>
    </div>
  )
}
