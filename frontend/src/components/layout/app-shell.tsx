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

/* ── Nav data ───────────────────────────────────────────────────────── */
const NAV_MAIN = [
  { to:'/dashboard',  icon:LayoutDashboard, label:'Dashboard',      color:'#6366f1', bg:'#6366f115', prefetch:{queryKey:['analytics-resumo',7], queryFn:()=>analyticsResumo(7).then((r:any)=>r.data)} },
  { to:'/alunos',     icon:Users,           label:'Alunos',         color:'#22c55e', bg:'#22c55e15', prefetch:{queryKey:['alunos'],             queryFn:()=>listarAlunos().then((r:any)=>r.data)} },
  { to:'/analytics',  icon:BarChart2,       label:'Analytics',      color:'#a855f7', bg:'#a855f715' },
  { to:'/agenda',     icon:Calendar,        label:'Agenda',         color:'#f97316', bg:'#f9731615' },
  { to:'/exercicios', icon:Dumbbell,        label:'Exercícios',     color:'#E8342B', bg:'#E8342B15', prefetch:{queryKey:['exercicios'], queryFn:()=>listarExercicios().then((r:any)=>r.data)} },
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

/* ── Nav item ───────────────────────────────────────────────────────── */
type NavItemProps = {
  to: string; icon: React.ElementType; label: string; color: string; bg: string
  prefetch?: { queryKey: unknown[]; queryFn: () => Promise<unknown> }
}

function NavItem({ to, icon: Icon, label, color, bg, prefetch }: NavItemProps) {
  const pathname = usePathname()
  const qc = useQueryClient()
  const active = pathname === to || (to !== '/dashboard' && pathname.startsWith(to))

  return (
    <Link
      href={to}
      style={{ textDecoration:'none', display:'block' }}
      onMouseEnter={() => { if (prefetch) qc.prefetchQuery({ ...prefetch, staleTime: STALE }) }}
    >
      <motion.div
        whileHover={{ x: active ? 0 : 2 }}
        transition={{ type:'spring', stiffness:600, damping:40 }}
        style={{
          position: 'relative', display:'flex', alignItems:'center', gap:10,
          height: 37, padding:'0 10px 0 12px', borderRadius:9,
          cursor:'pointer', overflow:'visible',
        }}
        onMouseEnter={e => {
          if (!active) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'
        }}
        onMouseLeave={e => {
          if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent'
        }}
      >
        {/* Sliding active pill (shared layoutId → spring-animated between items) */}
        {active && (
          <motion.div
            layoutId="sidebar-pill"
            style={{
              position:'absolute', inset:0, borderRadius:9,
              background:`${color}0e`,
              border:`1px solid ${color}20`,
              zIndex:0,
            }}
            transition={{ type:'spring', stiffness:440, damping:38 }}
          />
        )}
        {/* Left color bar */}
        {active && (
          <motion.div
            layoutId="sidebar-bar"
            style={{
              position:'absolute', left:1, top:'50%', y:'-50%',
              width:3, height:18, borderRadius:2,
              background:color,
              boxShadow:`0 0 10px ${color}`,
              zIndex:1,
            }}
            transition={{ type:'spring', stiffness:440, damping:38 }}
          />
        )}

        {/* Icon box */}
        <div style={{
          position:'relative', zIndex:1,
          width:24, height:24, borderRadius:7,
          background: active ? bg : 'transparent',
          display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
          boxShadow: active ? `0 0 12px ${color}30` : 'none',
          transition: 'background 0.18s, box-shadow 0.18s',
        }}>
          <Icon style={{ width:13, height:13, color: active ? color : 'rgba(255,255,255,0.4)', transition:'color 0.18s' }} />
        </div>

        <span style={{
          position:'relative', zIndex:1,
          fontSize: 13,
          fontWeight: active ? 700 : 400,
          color: active ? '#F4F4F5' : 'rgba(255,255,255,0.45)',
          transition:'color 0.15s, font-weight 0.15s',
          letterSpacing: active ? '-0.01em' : 0,
        }}>
          {label}
        </span>
      </motion.div>
    </Link>
  )
}

/* ── Theme toggle ───────────────────────────────────────────────────── */
function ThemeToggle() {
  const { theme, toggle } = useTheme()
  return (
    <motion.button
      onClick={toggle}
      whileHover={{ scale:1.06 }} whileTap={{ scale:0.94 }}
      aria-label="Alternar tema"
      style={{
        width:32, height:32, borderRadius:8,
        background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.06)',
        cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
        color:'rgba(255,255,255,0.45)',
      }}
    >
      {theme === 'dark' ? <Sun style={{width:14,height:14}}/> : <Moon style={{width:14,height:14}}/>}
    </motion.button>
  )
}

/* ── Notification bell ──────────────────────────────────────────────── */
function NotifBell() {
  const { data } = useQuery({
    queryKey:['notif-resumo'],
    queryFn:async () => (await resumoNotificacoes()).data as { alunos_inativos?: number },
    staleTime:120_000, retry:false,
  })
  const count  = data?.alunos_inativos || 0
  const router = useRouter()
  return (
    <motion.button
      whileHover={{ scale:1.06 }} whileTap={{ scale:0.94 }}
      onClick={() => { if (count) router.push('/inativos') }}
      aria-label={count ? `${count} inativos` : 'Notificações'}
      style={{
        position:'relative', width:32, height:32, borderRadius:8,
        background: count ? 'rgba(249,115,22,0.08)' : 'rgba(255,255,255,0.04)',
        border: count ? '1px solid rgba(249,115,22,0.25)' : '1px solid rgba(255,255,255,0.06)',
        cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
        color: count ? '#f97316' : 'rgba(255,255,255,0.45)',
      }}
    >
      <Bell style={{width:14,height:14}}/>
      {count > 0 && (
        <motion.span
          initial={{ scale:0 }} animate={{ scale:1 }}
          style={{
            position:'absolute', top:-4, right:-4,
            width:16, height:16, borderRadius:'50%',
            background:'#f97316', color:'#fff', fontSize:9, fontWeight:800,
            display:'flex', alignItems:'center', justifyContent:'center',
            border:'2px solid #0D0D0F',
          }}
        >
          {count}
        </motion.span>
      )}
    </motion.button>
  )
}

/* ── Sidebar content ────────────────────────────────────────────────── */
function SidebarContent({ user, onLogout }: { user: { nome: string; email?: string; role?: string } | null; onLogout: () => void }) {
  const inits     = getInitials(user?.nome || '??')
  const roleLabel = user?.role === 'admin_academia' ? 'Administrador' : user?.role === 'personal' ? 'Personal Trainer' : 'Aluno'
  const firstName = user?.nome?.split(' ')[0] || ''

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', padding:'16px 10px 14px' }}>

      {/* Logo */}
      <div style={{ padding:'0 6px 18px', display:'flex', alignItems:'center', gap:11 }}>
        <div style={{
          width:38, height:38,
          background:'linear-gradient(145deg, #FF5D56, #E8342B)',
          borderRadius:12,
          display:'flex', alignItems:'center', justifyContent:'center',
          boxShadow:'0 4px 20px rgba(232,52,43,0.55), inset 0 1px 0 rgba(255,255,255,0.18)',
          flexShrink:0,
        }}>
          <span style={{ fontSize:18, fontWeight:900, color:'white', letterSpacing:'-2px' }}>M</span>
        </div>
        <div>
          <div style={{ fontSize:15, fontWeight:900, color:'#F4F4F5', letterSpacing:'-0.04em', lineHeight:1.1 }}>MegaUp</div>
          <div style={{ fontSize:10, color:'rgba(255,255,255,0.35)', fontWeight:600, letterSpacing:'0.02em' }}>Jardim das Rosas</div>
        </div>
      </div>

      {/* Section divider */}
      <div style={{ height:'1px', background:'linear-gradient(90deg, transparent, rgba(255,255,255,0.08) 40%, rgba(255,255,255,0.08) 60%, transparent)', margin:'0 6px 14px' }} />

      {/* Nav */}
      <LayoutGroup>
        <nav style={{ flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap:2 }}>

          <p style={{ fontSize:10, fontWeight:800, color:'rgba(255,255,255,0.22)', textTransform:'uppercase', letterSpacing:'0.1em', padding:'0 12px 8px' }}>
            Principal
          </p>
          {NAV_MAIN.map(item => <NavItem key={item.to} {...item} />)}

          <div style={{ height:'1px', background:'linear-gradient(90deg, transparent, rgba(255,255,255,0.07) 40%, rgba(255,255,255,0.07) 60%, transparent)', margin:'12px 6px' }} />

          <p style={{ fontSize:10, fontWeight:800, color:'rgba(255,255,255,0.22)', textTransform:'uppercase', letterSpacing:'0.1em', padding:'0 12px 8px' }}>
            Ferramentas
          </p>
          {NAV_TOOLS.map(item => <NavItem key={item.to} {...item} />)}
        </nav>
      </LayoutGroup>

      {/* User card */}
      <div style={{ marginTop:12, paddingTop:14, borderTop:'1px solid rgba(255,255,255,0.06)' }}>
        <div style={{
          display:'flex', alignItems:'center', gap:10,
          padding:'10px 12px', borderRadius:12,
          background:'rgba(255,255,255,0.025)',
          border:'1px solid rgba(255,255,255,0.06)',
          marginBottom:8,
          boxShadow:'inset 0 1px 0 rgba(255,255,255,0.04)',
        }}>
          <div style={{ position:'relative', flexShrink:0 }}>
            <div style={{
              width:32, height:32, borderRadius:'50%',
              background:'linear-gradient(145deg,#E8342B,#7c3aed)',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:11, fontWeight:800, color:'white',
              boxShadow:'0 2px 10px rgba(232,52,43,0.35)',
            }}>
              {inits}
            </div>
            <div style={{
              position:'absolute', bottom:0, right:0,
              width:9, height:9, borderRadius:'50%',
              background:'#22c55e',
              border:'1.5px solid #0D0D0F',
              boxShadow:'0 0 6px rgba(34,197,94,0.7)',
            }} />
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:12, fontWeight:800, color:'#F4F4F5', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', letterSpacing:'-0.01em' }}>{firstName}</div>
            <div style={{ fontSize:10, color:'rgba(255,255,255,0.35)', fontWeight:500 }}>{roleLabel}</div>
          </div>
        </div>

        <div style={{ display:'flex', gap:7 }}>
          <Link href="/perfil" style={{
            flex:1, textDecoration:'none',
            display:'flex', alignItems:'center', justifyContent:'center', gap:5,
            height:32, borderRadius:9,
            background:'transparent', border:'1px solid rgba(255,255,255,0.07)',
            fontSize:12, color:'rgba(255,255,255,0.45)', fontWeight:600,
            transition:'all 0.15s',
          }}
            onMouseEnter={e => { const el=e.currentTarget as HTMLElement; el.style.background='rgba(255,255,255,0.05)'; el.style.color='rgba(255,255,255,0.7)' }}
            onMouseLeave={e => { const el=e.currentTarget as HTMLElement; el.style.background='transparent'; el.style.color='rgba(255,255,255,0.45)' }}
          >
            <UserCircle style={{width:12,height:12}}/> Perfil
          </Link>
          <motion.button
            onClick={onLogout}
            whileHover={{ scale:1.06 }} whileTap={{ scale:0.94 }}
            style={{
              width:32, height:32, borderRadius:9,
              background:'transparent', border:'1px solid rgba(255,255,255,0.07)',
              cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
              color:'rgba(255,255,255,0.45)',
            }}
            onMouseEnter={e => { const el=e.currentTarget as HTMLElement; el.style.background='rgba(232,52,43,0.1)'; el.style.borderColor='rgba(232,52,43,0.32)'; el.style.color='#E8342B' }}
            onMouseLeave={e => { const el=e.currentTarget as HTMLElement; el.style.background='transparent'; el.style.borderColor='rgba(255,255,255,0.07)'; el.style.color='rgba(255,255,255,0.45)' }}
          >
            <LogOut style={{width:13,height:13}}/>
          </motion.button>
        </div>
      </div>
    </div>
  )
}

/* ── Mobile bottom nav ──────────────────────────────────────────────── */
function MobileBottomNav({ user, onLogout }: { user: { nome: string; email?: string } | null; onLogout: () => void }) {
  const pathname  = usePathname()
  const router    = useRouter()
  const [showMore, setShowMore] = useState(false)
  const isSecondary = NAV_TOOLS.some(n => pathname.startsWith(n.to))

  return (
    <>
      <LayoutGroup>
        <nav
          className="nav-blur-bg"
          style={{
            position:'fixed', bottom:0, left:0, right:0, zIndex:50,
            backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)',
            borderTop:'1px solid rgba(255,255,255,0.06)',
            paddingBottom:'env(safe-area-inset-bottom)',
            background:'rgba(12,12,13,0.85)',
          }}
        >
          <div style={{ display:'flex', maxWidth:640, margin:'0 auto', padding:'4px 0' }}>
            {MOBILE_TABS.map(({ to, icon: Icon, label, color }) => {
              const active = pathname === to || (to !== '/dashboard' && pathname.startsWith(to))
              return (
                <Link key={to} href={to} style={{ flex:1, textDecoration:'none' }}>
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'8px 0 7px', gap:3, position:'relative' }}>
                    {active && (
                      <motion.div
                        layoutId="mob-indicator"
                        style={{ position:'absolute', top:0, left:'50%', x:'-50%', width:24, height:2.5, borderRadius:2, background:color, boxShadow:`0 0 8px ${color}` }}
                        transition={{ type:'spring', stiffness:400, damping:35 }}
                      />
                    )}
                    <div style={{ width:30, height:30, borderRadius:9, background: active ? `${color}18` : 'transparent', display:'flex', alignItems:'center', justifyContent:'center', transition:'background 0.2s', boxShadow: active ? `0 0 14px ${color}28` : 'none' }}>
                      <Icon style={{ width:18, height:18, color: active ? color : 'rgba(255,255,255,0.36)', transition:'color 0.15s' }} />
                    </div>
                    <span style={{ fontSize:10, fontWeight: active ? 800 : 400, color: active ? color : 'rgba(255,255,255,0.36)', transition:'all 0.15s', letterSpacing: active ? '-0.01em' : 0 }}>
                      {label}
                    </span>
                  </div>
                </Link>
              )
            })}
            <button onClick={() => setShowMore(true)} style={{ flex:1, background:'none', border:'none', cursor:'pointer', padding:0 }}>
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'8px 0 7px', gap:3 }}>
                <div style={{ width:30, height:30, borderRadius:9, background: isSecondary ? 'rgba(232,52,43,0.12)' : 'transparent', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <MoreHorizontal style={{ width:18, height:18, color: isSecondary ? '#E8342B' : 'rgba(255,255,255,0.36)' }} />
                </div>
                <span style={{ fontSize:10, fontWeight: isSecondary ? 800 : 400, color: isSecondary ? '#E8342B' : 'rgba(255,255,255,0.36)' }}>Mais</span>
              </div>
            </button>
          </div>
        </nav>
      </LayoutGroup>

      <AnimatePresence>
        {showMore && (
          <motion.div
            key="more-overlay"
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            style={{ position:'fixed', inset:0, zIndex:60, display:'flex', flexDirection:'column', justifyContent:'flex-end' }}
          >
            <div
              style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.72)', backdropFilter:'blur(8px)' }}
              onClick={() => setShowMore(false)}
            />
            <motion.div
              initial={{ y:'100%' }} animate={{ y:0 }} exit={{ y:'100%' }}
              transition={{ type:'spring', stiffness:360, damping:36 }}
              style={{
                position:'relative', zIndex:1,
                background:'#18191e',
                border:'1px solid rgba(255,255,255,0.07)',
                borderBottom:'none',
                borderTopLeftRadius:24, borderTopRightRadius:24,
                padding:'8px 18px',
                paddingBottom:'calc(env(safe-area-inset-bottom) + 18px)',
                boxShadow:'0 -20px 60px rgba(0,0,0,0.5)',
              }}
            >
              <div style={{ width:36, height:4, borderRadius:2, background:'rgba(255,255,255,0.12)', margin:'8px auto 18px' }} />
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
                <span style={{ fontSize:16, fontWeight:900, color:'#F4F4F5', letterSpacing:'-0.03em' }}>Ferramentas</span>
                <button
                  onClick={() => setShowMore(false)}
                  style={{ width:30, height:30, borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', cursor:'pointer', color:'rgba(255,255,255,0.5)' }}
                >
                  <X style={{width:13,height:13}}/>
                </button>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:9, marginBottom:16 }}>
                {NAV_TOOLS.map(({ to, icon: Icon, label, color, bg }) => {
                  const active = pathname.startsWith(to)
                  return (
                    <button key={to} onClick={() => { router.push(to); setShowMore(false) }}
                      style={{
                        display:'flex', alignItems:'center', gap:11, padding:'13px 14px',
                        borderRadius:13, cursor:'pointer',
                        border:`1px solid ${active ? color + '30' : 'rgba(255,255,255,0.06)'}`,
                        background: active ? bg : 'rgba(255,255,255,0.03)',
                        textAlign:'left',
                      }}
                    >
                      <div style={{ width:30, height:30, borderRadius:9, background:bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        <Icon style={{ width:14, height:14, color }}/>
                      </div>
                      <span style={{ fontSize:13, fontWeight: active ? 700 : 500, color: active ? '#F4F4F5' : 'rgba(255,255,255,0.55)' }}>
                        {label}
                      </span>
                    </button>
                  )
                })}
              </div>
              <div style={{ borderTop:'1px solid rgba(255,255,255,0.06)', paddingTop:14, display:'flex', gap:9 }}>
                <div style={{ display:'flex', alignItems:'center', gap:11, flex:1, padding:'11px 14px', borderRadius:12, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ width:32, height:32, borderRadius:'50%', background:'linear-gradient(135deg,#E8342B,#7c3aed)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:800, color:'white', flexShrink:0 }}>
                    {getInitials(user?.nome || '??')}
                  </div>
                  <div>
                    <div style={{ fontSize:13, fontWeight:700, color:'#F4F4F5' }}>{user?.nome?.split(' ')[0]}</div>
                    <div style={{ fontSize:11, color:'rgba(255,255,255,0.35)' }}>{user?.email}</div>
                  </div>
                </div>
                <button
                  onClick={() => { onLogout(); setShowMore(false) }}
                  style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:'0 18px', borderRadius:12, cursor:'pointer', border:'1px solid rgba(255,255,255,0.06)', background:'rgba(255,255,255,0.03)', color:'rgba(255,255,255,0.45)', transition:'all 0.15s' }}
                  onMouseEnter={e => { const el=e.currentTarget as HTMLElement; el.style.borderColor='rgba(232,52,43,0.3)'; el.style.color='#E8342B' }}
                  onMouseLeave={e => { const el=e.currentTarget as HTMLElement; el.style.borderColor='rgba(255,255,255,0.06)'; el.style.color='rgba(255,255,255,0.45)' }}
                >
                  <LogOut style={{width:15,height:15}}/>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

/* ── App Shell ──────────────────────────────────────────────────────── */
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

      {/* Desktop sidebar */}
      <aside
        className="sidebar-bg hidden lg:flex flex-col"
        style={{ width:232, flexShrink:0, borderRight:'1px solid rgba(255,255,255,0.06)' }}
      >
        <SidebarContent user={user} onLogout={handleLogout} />
      </aside>

      {/* Main content area */}
      <div className="scroll-content-area">

        {/* Mobile header */}
        <header
          className="lg:hidden nav-blur-bg"
          style={{
            position:'sticky', top:0, zIndex:40, flexShrink:0,
            paddingTop:'env(safe-area-inset-top)',
            backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)',
            borderBottom:'1px solid rgba(255,255,255,0.06)',
            background:'rgba(12,12,13,0.85)',
          }}
        >
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', height:50, padding:'0 18px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:9 }}>
              <div style={{ width:28, height:28, background:'linear-gradient(145deg,#E8342B,#c42121)', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 2px 10px rgba(232,52,43,0.42)' }}>
                <span style={{ fontSize:14, fontWeight:900, color:'white', letterSpacing:'-1.5px' }}>M</span>
              </div>
              <span style={{ fontSize:15, fontWeight:900, color:'#F4F4F5', letterSpacing:'-0.03em' }}>MegaUp</span>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              <NotifBell />
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Desktop top bar */}
        <div className="hidden lg:flex" style={{ alignItems:'center', justifyContent:'flex-end', padding:'12px 28px 0', gap:8 }}>
          <NotifBell />
          <ThemeToggle />
        </div>

        <main
          id="main-content"
          className="flex-1 p-4 lg:p-6 main-content-mobile"
          style={{ maxWidth:1200, width:'100%', margin:'0 auto' }}
        >
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

/* ── Onboarding ─────────────────────────────────────────────────────── */
const OB_STEPS = [
  { icon:'👋', title:'Bem-vindo ao MegaUp!', desc:'Plataforma completa de gestão de alunos. Vamos configurar em 3 passos rápidos.', cta:'Começar', action:null },
  { icon:'👤', title:'Adicione seu primeiro aluno', desc:'Vá em Alunos → Novo aluno. Depois envie um convite por e-mail para ele criar o login.', cta:'Entendido', action:{ label:'Ir para Alunos', to:'/alunos' } },
  { icon:'🏋️', title:'Monte o treino', desc:'Alunos → escolha o aluno → Novo treino. Adicione exercícios e cargas. Use templates para agilizar.', cta:'Entendido', action:{ label:'Ver templates', to:'/templates' } },
  { icon:'🚀', title:'Tudo pronto!', desc:'Acompanhe o progresso no Dashboard, envie sugestões via IA e monitore pagamentos no Financeiro.', cta:'Explorar', action:null },
]

function OnboardingPersonal({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0)
  const router = useRouter()
  const s      = OB_STEPS[step]
  const isLast = step === OB_STEPS.length - 1
  const advance = () => { if (isLast) { onDone(); return } setStep(p => p + 1) }

  return (
    <div style={{ position:'fixed', inset:0, zIndex:200, background:'rgba(0,0,0,0.85)', backdropFilter:'blur(16px)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <motion.div
        initial={{ opacity:0, scale:0.94, y:20 }}
        animate={{ opacity:1, scale:1, y:0 }}
        transition={{ duration:0.45, ease:[0.16,1,0.3,1] }}
        style={{
          background:'linear-gradient(160deg,#18191e 0%,#111113 100%)',
          border:'1px solid rgba(255,255,255,0.07)',
          borderRadius:26, padding:'44px 40px', maxWidth:420, width:'100%',
          textAlign:'center', boxShadow:'0 40px 80px rgba(0,0,0,0.85)',
        }}
      >
        <div style={{ display:'flex', justifyContent:'center', gap:6, marginBottom:34 }}>
          {OB_STEPS.map((_, i) => (
            <div key={i} style={{ height:6, borderRadius:3, background: i===step?'#E8342B':i<step?'rgba(232,52,43,0.4)':'rgba(255,255,255,0.08)', width:i===step?24:6, transition:'all 0.3s', boxShadow:i===step?'0 0 10px rgba(232,52,43,0.6)':'none' }} />
          ))}
        </div>
        <div style={{ fontSize:60, marginBottom:22, lineHeight:1 }}>{s.icon}</div>
        <h2 style={{ fontSize:24, fontWeight:900, color:'#F4F4F5', letterSpacing:'-0.04em', marginBottom:13 }}>{s.title}</h2>
        <p style={{ fontSize:14, color:'rgba(255,255,255,0.5)', lineHeight:1.75, marginBottom:34 }}>{s.desc}</p>
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {s.action && (
            <button
              onClick={() => { advance(); router.push(s.action!.to) }}
              style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'13px 20px', borderRadius:13, border:'1px solid rgba(255,255,255,0.08)', background:'rgba(255,255,255,0.04)', color:'rgba(255,255,255,0.6)', fontSize:13, fontWeight:600, cursor:'pointer' }}
            >
              <ArrowRight style={{width:13,height:13}}/> {s.action.label}
            </button>
          )}
          <button
            onClick={advance}
            style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'15px 20px', borderRadius:13, background:'linear-gradient(135deg,#E8342B,#C8291F)', border:'none', color:'white', fontSize:14, fontWeight:800, cursor:'pointer', boxShadow:'0 4px 20px rgba(232,52,43,0.45), inset 0 1px 0 rgba(255,255,255,0.15)' }}
          >
            {isLast ? <><CheckCircle style={{width:15,height:15}}/> {s.cta}</> : <>{s.cta} <ArrowRight style={{width:14,height:14}}/></>}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
