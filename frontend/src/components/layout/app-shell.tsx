'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { useTheme } from '@/contexts/theme-context'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { resumoNotificacoes, listarAlunos, resumoFinanceiro, analyticsResumo, listarExercicios } from '@/lib/api-routes'
import { getInitials } from '@/lib/utils'
import { useState, useEffect, type ReactNode } from 'react'
import { motion, LayoutGroup, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Users, Dumbbell, UserPlus, LogOut,
  X, DollarSign, MoreHorizontal, Calendar, Bell,
  BarChart2, Gift, CreditCard, Copy, QrCode,
  ArrowRight, CheckCircle, UserCircle, Sun, Moon,
  Zap, Activity,
} from 'lucide-react'

const STALE = 5 * 60_000

/* ── Nav data ─────────────────────────────────────────────────── */
const NAV_MAIN = [
  { to:'/dashboard',  icon:LayoutDashboard, label:'Dashboard',      color:'#6366f1', bg:'#6366f115', prefetch:{queryKey:['analytics-resumo',7], queryFn:()=>analyticsResumo(7).then((r:any)=>r.data)} },
  { to:'/alunos',     icon:Users,           label:'Alunos',         color:'#22c55e', bg:'#22c55e15', prefetch:{queryKey:['alunos'],             queryFn:()=>listarAlunos().then((r:any)=>r.data)} },
  { to:'/analytics',  icon:BarChart2,       label:'Analytics',      color:'#a855f7', bg:'#a855f715' },
  { to:'/agenda',     icon:Calendar,        label:'Agenda',         color:'#f97316', bg:'#f9731615' },
  { to:'/exercicios', icon:Dumbbell,        label:'Exercícios',     color:'#ef4444', bg:'#ef444415', prefetch:{queryKey:['exercicios'],          queryFn:()=>listarExercicios().then((r:any)=>r.data)} },
] as const

const NAV_TOOLS = [
  { to:'/ia',          icon:Zap,        label:'Sugestões IA',    color:'#eab308', bg:'#eab30815' },
  { to:'/templates',   icon:Copy,       label:'Templates',        color:'#06b6d4', bg:'#06b6d415' },
  { to:'/qr',          icon:QrCode,     label:'QR Check-in',      color:'#14b8a6', bg:'#14b8a615' },
  { to:'/financeiro',  icon:DollarSign, label:'Financeiro',       color:'#10b981', bg:'#10b98115', prefetch:{queryKey:['resumo'], queryFn:()=>resumoFinanceiro().then((r:any)=>r.data)} },
  { to:'/convites',    icon:UserPlus,   label:'Convidar alunos',  color:'#f43f5e', bg:'#f43f5e15' },
  { to:'/periodizacao',icon:Activity,   label:'Periodização',     color:'#8b5cf6', bg:'#8b5cf615' },
  { to:'/inativos',    icon:Bell,       label:'Inativos',         color:'#f59e0b', bg:'#f59e0b15' },
  { to:'/planos',      icon:CreditCard, label:'Planos & Billing', color:'#0ea5e9', bg:'#0ea5e915' },
  { to:'/referral',    icon:Gift,       label:'Indicação',        color:'#ec4899', bg:'#ec489915' },
] as const

const MOBILE_TABS = NAV_MAIN

/* ── Nav Item ─────────────────────────────────────────────────── */
type NavItemProps = {
  to: string; icon: React.ElementType; label: string; color: string; bg: string
  prefetch?: { queryKey: unknown[]; queryFn: () => Promise<unknown> }
}

function NavItem({ to, icon: Icon, label, color, bg, prefetch }: NavItemProps) {
  const pathname = usePathname()
  const qc = useQueryClient()
  const active = pathname === to || (to !== '/dashboard' && pathname.startsWith(to))

  return (
    <Link href={to} style={{ textDecoration:'none', display:'block' }}
      onMouseEnter={() => { if (prefetch) qc.prefetchQuery({ ...prefetch, staleTime: STALE }) }}
    >
      <motion.div
        whileHover={{ x: active ? 0 : 1 }}
        style={{ position:'relative', display:'flex', alignItems:'center', gap:9, height:34, padding:'0 10px 0 12px', borderRadius:8, cursor:'pointer', overflow:'visible' }}
      >
        {/* Sliding active pill */}
        {active && (
          <motion.div
            layoutId="sidebar-pill"
            style={{ position:'absolute', inset:0, borderRadius:8, background:`${color}10`, border:`1px solid ${color}22`, zIndex:0 }}
            transition={{ type:'spring', stiffness:420, damping:36 }}
          />
        )}
        {/* Left color bar */}
        {active && (
          <motion.div
            layoutId="sidebar-bar"
            style={{ position:'absolute', left:1, top:'50%', y:'-50%', width:3, height:16, borderRadius:2, background:color, zIndex:1 }}
            transition={{ type:'spring', stiffness:420, damping:36 }}
          />
        )}

        <motion.div
          animate={{ background: active ? bg : 'transparent' }}
          style={{ position:'relative', zIndex:1, width:22, height:22, borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}
        >
          <Icon style={{ width:13, height:13, color: active ? color : 'var(--text-muted)', transition:'color 0.18s' }} />
        </motion.div>

        <span style={{ position:'relative', zIndex:1, fontSize:13, fontWeight: active ? 600 : 400, color: active ? 'var(--text-primary)' : 'var(--text-muted)', transition:'color 0.15s' }}>
          {label}
        </span>
      </motion.div>
    </Link>
  )
}

/* ── Theme Toggle ──────────────────────────────────────────────── */
function ThemeToggle() {
  const { theme, toggle } = useTheme()
  return (
    <motion.button onClick={toggle} whileHover={{scale:1.06}} whileTap={{scale:0.94}}
      aria-label="Alternar tema"
      style={{ width:32, height:32, borderRadius:8, background:'rgba(255,255,255,0.04)', border:'1px solid var(--border)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text-muted)' }}
    >
      {theme === 'dark' ? <Sun style={{width:14,height:14}}/> : <Moon style={{width:14,height:14}}/>}
    </motion.button>
  )
}

/* ── Notification Bell ─────────────────────────────────────────── */
function NotifBell() {
  const { data } = useQuery({ queryKey:['notif-resumo'], queryFn:async()=>(await resumoNotificacoes()).data as {alunos_inativos?:number}, staleTime:120_000, retry:false })
  const count = data?.alunos_inativos || 0
  const router = useRouter()
  return (
    <motion.button whileHover={{scale:1.06}} whileTap={{scale:0.94}}
      onClick={() => { if (count) router.push('/inativos') }}
      aria-label={count ? `${count} inativos` : 'Notificações'}
      style={{ position:'relative', width:32, height:32, borderRadius:8, background: count ? 'rgba(249,115,22,0.08)' : 'rgba(255,255,255,0.04)', border: count ? '1px solid rgba(249,115,22,0.25)' : '1px solid var(--border)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color: count ? '#f97316' : 'var(--text-muted)' }}
    >
      <Bell style={{width:14,height:14}}/>
      {count > 0 && (
        <motion.span initial={{scale:0}} animate={{scale:1}} style={{ position:'absolute', top:-4, right:-4, width:16, height:16, borderRadius:'50%', background:'#f97316', color:'#fff', fontSize:9, fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center', border:'2px solid var(--bg-page)' }}>
          {count}
        </motion.span>
      )}
    </motion.button>
  )
}

/* ── Sidebar Content ───────────────────────────────────────────── */
function SidebarContent({ user, onLogout }: { user: { nome: string; email?: string; role?: string } | null; onLogout: () => void }) {
  const inits = getInitials(user?.nome || '??')
  const roleLabel = user?.role === 'admin_academia' ? 'Admin' : user?.role === 'personal' ? 'Personal' : 'Aluno'

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', padding:'14px 10px 12px' }}>

      {/* Logo */}
      <div style={{ padding:'0 4px 16px', display:'flex', alignItems:'center', gap:10 }}>
        <div style={{ width:34, height:34, background:'linear-gradient(135deg,#ef4444,#dc2626)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 14px rgba(239,68,68,0.45)', flexShrink:0 }}>
          <span style={{ fontSize:16, fontWeight:900, color:'white', letterSpacing:'-2px' }}>M</span>
        </div>
        <div>
          <div style={{ fontSize:14, fontWeight:800, color:'var(--text-primary)', letterSpacing:'-0.03em', lineHeight:1.1 }}>MegaUp</div>
          <div style={{ fontSize:10, color:'var(--text-muted)', fontWeight:500 }}>Jardim das Rosas</div>
        </div>
      </div>

      <div style={{ height:1, background:'linear-gradient(90deg,transparent,var(--border),transparent)', margin:'0 4px 12px' }} />

      {/* Nav with layoutGroup for pill animation */}
      <LayoutGroup>
        <nav style={{ flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap:1 }}>
          <p style={{ fontSize:10, fontWeight:800, color:'var(--text-disabled)', textTransform:'uppercase', letterSpacing:'0.08em', padding:'0 10px 8px' }}>Principal</p>
          {NAV_MAIN.map(item => <NavItem key={item.to} {...item} />)}

          <div style={{ height:1, background:'linear-gradient(90deg,transparent,var(--border),transparent)', margin:'12px 4px' }} />

          <p style={{ fontSize:10, fontWeight:800, color:'var(--text-disabled)', textTransform:'uppercase', letterSpacing:'0.08em', padding:'0 10px 8px' }}>Ferramentas</p>
          {NAV_TOOLS.map(item => <NavItem key={item.to} {...item} />)}
        </nav>
      </LayoutGroup>

      {/* User card */}
      <div style={{ marginTop:10, borderTop:'1px solid var(--border-subtle)', paddingTop:12 }}>
        <div style={{ display:'flex', alignItems:'center', gap:9, padding:'9px 10px', borderRadius:10, background:'rgba(255,255,255,0.025)', border:'1px solid var(--border-subtle)', marginBottom:8 }}>
          <div style={{ position:'relative', flexShrink:0 }}>
            <div style={{ width:30, height:30, borderRadius:'50%', background:'linear-gradient(135deg,#ef4444,#7c3aed)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:800, color:'white' }}>
              {inits}
            </div>
            <div style={{ position:'absolute', bottom:0, right:0, width:8, height:8, borderRadius:'50%', background:'#22c55e', border:'1.5px solid var(--bg-sidebar)' }} />
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:12, fontWeight:700, color:'var(--text-primary)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.nome?.split(' ')[0]}</div>
            <div style={{ fontSize:10, color:'var(--text-muted)' }}>{roleLabel}</div>
          </div>
        </div>
        <div style={{ display:'flex', gap:6 }}>
          <Link href="/perfil" style={{ flex:1, textDecoration:'none', display:'flex', alignItems:'center', justifyContent:'center', gap:5, height:30, borderRadius:7, background:'transparent', border:'1px solid var(--border-subtle)', fontSize:12, color:'var(--text-muted)', fontWeight:500, transition:'all 0.15s' }}
            onMouseEnter={e=>{const el=e.currentTarget as HTMLElement;el.style.background='rgba(255,255,255,0.04)';el.style.color='var(--text-secondary)'}}
            onMouseLeave={e=>{const el=e.currentTarget as HTMLElement;el.style.background='transparent';el.style.color='var(--text-muted)'}}
          >
            <UserCircle style={{width:12,height:12}}/> Perfil
          </Link>
          <motion.button onClick={onLogout} whileHover={{scale:1.06}} whileTap={{scale:0.94}}
            style={{ width:30, height:30, borderRadius:7, background:'transparent', border:'1px solid var(--border-subtle)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text-muted)', transition:'all 0.15s' }}
            onMouseEnter={e=>{const el=e.currentTarget as HTMLElement;el.style.background='rgba(239,68,68,0.1)';el.style.borderColor='rgba(239,68,68,0.3)';el.style.color='#ef4444'}}
            onMouseLeave={e=>{const el=e.currentTarget as HTMLElement;el.style.background='transparent';el.style.borderColor='var(--border-subtle)';el.style.color='var(--text-muted)'}}
          >
            <LogOut style={{width:12,height:12}}/>
          </motion.button>
        </div>
      </div>
    </div>
  )
}

/* ── Mobile Bottom Nav ─────────────────────────────────────────── */
function MobileBottomNav({ user, onLogout }: { user: { nome: string; email?: string } | null; onLogout: () => void }) {
  const pathname = usePathname()
  const router   = useRouter()
  const [showMore, setShowMore] = useState(false)
  const isSecondary = NAV_TOOLS.some(n => pathname.startsWith(n.to))

  return (
    <>
      <LayoutGroup>
        <nav className="nav-blur-bg" style={{ position:'fixed', bottom:0, left:0, right:0, zIndex:50, backdropFilter:'blur(16px)', WebkitBackdropFilter:'blur(16px)', borderTop:'1px solid var(--border-subtle)', paddingBottom:'env(safe-area-inset-bottom)' }}>
          <div style={{ display:'flex', maxWidth:640, margin:'0 auto', padding:'4px 0' }}>
            {MOBILE_TABS.map(({ to, icon: Icon, label, color }) => {
              const active = pathname === to || (to !== '/dashboard' && pathname.startsWith(to))
              return (
                <Link key={to} href={to} style={{ flex:1, textDecoration:'none' }}>
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'8px 0 6px', gap:3, position:'relative' }}>
                    {active && <motion.div layoutId="mob-indicator" style={{ position:'absolute', top:0, left:'50%', x:'-50%', width:22, height:2.5, borderRadius:2, background:color }} transition={{type:'spring',stiffness:400,damping:35}} />}
                    <div style={{ width:28, height:28, borderRadius:7, background: active ? `${color}18` : 'transparent', display:'flex', alignItems:'center', justifyContent:'center', transition:'background 0.2s' }}>
                      <Icon style={{ width:17, height:17, color: active ? color : 'var(--text-disabled)', transition:'color 0.15s' }} />
                    </div>
                    <span style={{ fontSize:10, fontWeight: active ? 700 : 400, color: active ? color : 'var(--text-disabled)', transition:'all 0.15s' }}>{label}</span>
                  </div>
                </Link>
              )
            })}
            <button onClick={() => setShowMore(true)} style={{ flex:1, background:'none', border:'none', cursor:'pointer', padding:0 }}>
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'8px 0 6px', gap:3 }}>
                <div style={{ width:28, height:28, borderRadius:7, background: isSecondary ? 'rgba(239,68,68,0.12)' : 'transparent', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <MoreHorizontal style={{ width:17, height:17, color: isSecondary ? '#ef4444' : 'var(--text-disabled)' }} />
                </div>
                <span style={{ fontSize:10, fontWeight: isSecondary ? 700 : 400, color: isSecondary ? '#ef4444' : 'var(--text-disabled)' }}>Mais</span>
              </div>
            </button>
          </div>
        </nav>
      </LayoutGroup>

      <AnimatePresence>
        {showMore && (
          <motion.div key="more-overlay" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            style={{ position:'fixed', inset:0, zIndex:60, display:'flex', flexDirection:'column', justifyContent:'flex-end' }}
          >
            <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.65)', backdropFilter:'blur(6px)' }} onClick={() => setShowMore(false)} />
            <motion.div initial={{y:'100%'}} animate={{y:0}} exit={{y:'100%'}} transition={{type:'spring',stiffness:350,damping:35}}
              style={{ position:'relative', zIndex:1, background:'var(--bg-card)', border:'1px solid var(--border)', borderBottom:'none', borderTopLeftRadius:22, borderTopRightRadius:22, padding:'8px 16px', paddingBottom:'calc(env(safe-area-inset-bottom) + 16px)' }}
            >
              <div style={{ width:36, height:4, borderRadius:2, background:'var(--border)', margin:'8px auto 16px' }} />
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
                <span style={{ fontSize:15, fontWeight:800, color:'var(--text-primary)' }}>Ferramentas</span>
                <button onClick={() => setShowMore(false)} style={{ width:28, height:28, borderRadius:7, display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg-elevated)', border:'1px solid var(--border)', cursor:'pointer', color:'var(--text-muted)' }}>
                  <X style={{width:13,height:13}}/>
                </button>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:14 }}>
                {NAV_TOOLS.map(({ to, icon: Icon, label, color, bg }) => {
                  const active = pathname.startsWith(to)
                  return (
                    <button key={to} onClick={() => { router.push(to); setShowMore(false) }}
                      style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 14px', borderRadius:11, cursor:'pointer', border:`1px solid ${active?color+'30':'var(--border-subtle)'}`, background: active ? bg : 'var(--bg-elevated)', textAlign:'left' }}
                    >
                      <div style={{ width:28, height:28, borderRadius:7, background:bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        <Icon style={{width:14,height:14,color}}/>
                      </div>
                      <span style={{ fontSize:13, fontWeight:500, color: active ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{label}</span>
                    </button>
                  )
                })}
              </div>
              <div style={{ borderTop:'1px solid var(--border-subtle)', paddingTop:12, display:'flex', gap:8 }}>
                <div style={{ display:'flex', alignItems:'center', gap:10, flex:1, padding:'10px 14px', borderRadius:10, background:'var(--bg-elevated)', border:'1px solid var(--border-subtle)' }}>
                  <div style={{ width:30, height:30, borderRadius:'50%', background:'linear-gradient(135deg,#ef4444,#7c3aed)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:'white' }}>{getInitials(user?.nome||'??')}</div>
                  <div>
                    <div style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)' }}>{user?.nome?.split(' ')[0]}</div>
                    <div style={{ fontSize:11, color:'var(--text-disabled)' }}>{user?.email}</div>
                  </div>
                </div>
                <button onClick={() => { onLogout(); setShowMore(false) }}
                  style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:'0 16px', borderRadius:10, cursor:'pointer', border:'1px solid var(--border-subtle)', background:'var(--bg-elevated)', color:'var(--text-muted)', transition:'all 0.15s' }}
                  onMouseEnter={e=>{const el=e.currentTarget as HTMLElement;el.style.borderColor='rgba(239,68,68,0.3)';el.style.color='#ef4444'}}
                  onMouseLeave={e=>{const el=e.currentTarget as HTMLElement;el.style.borderColor='var(--border-subtle)';el.style.color='var(--text-muted)'}}
                >
                  <LogOut style={{width:14,height:14}}/>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

/* ── App Shell ─────────────────────────────────────────────────── */
export function AppShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth()
  const router = useRouter()
  const handleLogout = async () => { await logout(); router.push('/login') }

  const [showOnboarding, setShowOnboarding] = useState(false)
  useEffect(() => {
    if (!user?.id) return
    const key = `megaup_ob_${user.id}`
    if (!localStorage.getItem(key)) setShowOnboarding(true)
  }, [user?.id])
  const doneOnboarding = () => {
    if (user?.id) localStorage.setItem(`megaup_ob_${user.id}`, '1')
    setShowOnboarding(false)
  }

  return (
    <div className="h-screen-dvh page-bg" style={{ display:'flex' }}>
      <a href="#main-content" className="skip-nav">Pular para o conteúdo</a>

      {/* Sidebar desktop */}
      <aside className="sidebar-bg hidden lg:flex flex-col" style={{ width:224, flexShrink:0, borderRight:'1px solid var(--border-subtle)' }}>
        <SidebarContent user={user} onLogout={handleLogout} />
      </aside>

      {/* Main content */}
      <div className="scroll-content-area">
        {/* Mobile header */}
        <header className="lg:hidden nav-blur-bg" style={{ position:'sticky', top:0, zIndex:40, flexShrink:0, paddingTop:'env(safe-area-inset-top)', backdropFilter:'blur(16px)', WebkitBackdropFilter:'blur(16px)', borderBottom:'1px solid var(--border-subtle)' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', height:48, padding:'0 16px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ width:26, height:26, background:'linear-gradient(135deg,#ef4444,#dc2626)', borderRadius:7, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 2px 8px rgba(239,68,68,0.4)' }}>
                <span style={{ fontSize:13, fontWeight:900, color:'white', letterSpacing:'-1.5px' }}>M</span>
              </div>
              <span style={{ fontSize:14, fontWeight:800, color:'var(--text-primary)', letterSpacing:'-0.02em' }}>MegaUp</span>
            </div>
            <ThemeToggle />
          </div>
        </header>

        {/* Desktop top bar */}
        <div className="hidden lg:flex" style={{ alignItems:'center', justifyContent:'flex-end', padding:'10px 28px 0', gap:8 }}>
          <NotifBell />
          <ThemeToggle />
        </div>

        <main id="main-content" className="flex-1 p-4 lg:p-6 main-content-mobile" style={{ maxWidth:1180, width:'100%', margin:'0 auto' }}>
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

/* ── Onboarding ────────────────────────────────────────────────── */
const OB_STEPS = [
  { icon:'👋', title:'Bem-vindo ao MegaUp!', desc:'Plataforma completa de gestão de alunos. Vamos configurar em 3 passos rápidos.', cta:'Começar', action: null },
  { icon:'👤', title:'Adicione seu primeiro aluno', desc:'Vá em Alunos → Novo aluno. Depois envie um convite por e-mail para ele criar o login.', cta:'Entendido', action:{ label:'Ir para Alunos', to:'/alunos' } },
  { icon:'🏋️', title:'Monte o treino', desc:'Alunos → escolha o aluno → Novo treino. Adicione exercícios e cargas. Use templates para agilizar.', cta:'Entendido', action:{ label:'Ver templates', to:'/templates' } },
  { icon:'🚀', title:'Tudo pronto!', desc:'Acompanhe o progresso no Dashboard, envie sugestões via IA e monitore pagamentos no Financeiro.', cta:'Explorar', action: null },
]

function OnboardingPersonal({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0)
  const router = useRouter()
  const s = OB_STEPS[step]
  const isLast = step === OB_STEPS.length - 1
  const advance = () => { if (isLast) { onDone(); return } setStep(prev => prev+1) }

  return (
    <div style={{ position:'fixed', inset:0, zIndex:200, background:'rgba(0,0,0,0.82)', backdropFilter:'blur(12px)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ background:'linear-gradient(160deg,#18191e 0%,#111113 100%)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:24, padding:'40px 36px', maxWidth:420, width:'100%', textAlign:'center', boxShadow:'0 40px 80px rgba(0,0,0,0.8)' }}>
        <div style={{ display:'flex', justifyContent:'center', gap:6, marginBottom:32 }}>
          {OB_STEPS.map((_,i) => <div key={i} style={{ height:6, borderRadius:3, background: i===step?'#ef4444':i<step?'rgba(239,68,68,0.4)':'var(--border)', width: i===step?24:6, transition:'all 0.3s' }} />)}
        </div>
        <div style={{ fontSize:56, marginBottom:20 }}>{s.icon}</div>
        <h2 style={{ fontSize:22, fontWeight:800, color:'var(--text-primary)', letterSpacing:'-0.03em', marginBottom:12 }}>{s.title}</h2>
        <p style={{ fontSize:14, color:'var(--text-muted)', lineHeight:1.7, marginBottom:32 }}>{s.desc}</p>
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {s.action && (
            <button onClick={() => { advance(); router.push(s.action!.to) }}
              style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'12px 20px', borderRadius:12, border:'1px solid var(--border)', background:'rgba(255,255,255,0.04)', color:'var(--text-secondary)', fontSize:13, fontWeight:600, cursor:'pointer' }}
            >
              <ArrowRight style={{width:13,height:13}}/> {s.action.label}
            </button>
          )}
          <button onClick={advance}
            style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'14px 20px', borderRadius:12, background:'linear-gradient(135deg,#ef4444,#dc2626)', border:'none', color:'white', fontSize:14, fontWeight:700, cursor:'pointer', boxShadow:'0 4px 16px rgba(239,68,68,0.4)' }}
          >
            {isLast ? <><CheckCircle style={{width:15,height:15}}/> {s.cta}</> : <>{s.cta} <ArrowRight style={{width:14,height:14}}/></>}
          </button>
        </div>
      </div>
    </div>
  )
}
