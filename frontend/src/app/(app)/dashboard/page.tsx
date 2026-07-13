'use client'

import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/contexts/auth-context'
import { listarAlunos, analyticsResumo } from '@/lib/api-routes'
import { useEffect, useRef, useState, useMemo } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line,
} from 'recharts'
import { motion } from 'framer-motion'
import {
  Users, TrendingUp, TrendingDown, Calendar, DollarSign,
  ArrowUpRight, ArrowDownRight, Activity, Zap, UserCheck,
  Clock, Target, Award, ChevronRight,
} from 'lucide-react'
import Link from 'next/link'
import { OnboardingWizard } from '@/components/OnboardingWizard'

/* ── Types ─────────────────────────────────────────────────────────── */
type Aluno = {
  id: number; nome: string; email: string; ativo: boolean
  plano?: string; criado_em?: string; status_pagamento?: string
}
type Analytics = {
  total_alunos?: number; novos_30d?: number
  churn_risk?: Array<{ id: number; nome: string; dias_sem_treino?: number; score?: number }>
}

/* ── Helpers ────────────────────────────────────────────────────────── */
const ALPHA: Record<string, string> = {
  A:'#6366f1',B:'#ec4899',C:'#f97316',D:'#22c55e',E:'#a855f7',F:'#06b6d4',
  G:'#ef4444',H:'#eab308',I:'#14b8a6',J:'#8b5cf6',K:'#f43f5e',L:'#10b981',
  M:'#3b82f6',N:'#fb923c',O:'#84cc16',P:'#e879f9',Q:'#2dd4bf',R:'#f472b6',
  S:'#38bdf8',T:'#4ade80',U:'#fbbf24',V:'#818cf8',W:'#34d399',X:'#f87171',
  Y:'#a78bfa',Z:'#60a5fa',
}
const nameColor = (n: string) => ALPHA[(n || 'A')[0].toUpperCase()] ?? '#6366f1'
const initials  = (n: string) =>
  (n?.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('') || '??').toUpperCase()
const genSpark  = (base: number) =>
  [0.68, 0.76, 0.72, 0.84, 0.90, 0.96, 1.0].map(f => Math.max(0, Math.round(base * f)))

/* ── Count-up hook ──────────────────────────────────────────────────── */
function useCountUp(target: number, ms = 1200) {
  const [v, setV] = useState(0)
  const raf = useRef<number | null>(null)
  const t0  = useRef<number | null>(null)
  useEffect(() => {
    if (!target) { setV(0); return }
    t0.current = null
    const tick = (ts: number) => {
      if (!t0.current) t0.current = ts
      const p = Math.min((ts - t0.current) / ms, 1)
      setV(Math.round((1 - Math.pow(1 - p, 4)) * target))
      if (p < 1) raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => { if (raf.current) cancelAnimationFrame(raf.current) }
  }, [target, ms])
  return v
}

/* ── Avatar ─────────────────────────────────────────────────────────── */
function Avatar({ name, size = 36 }: { name: string; size?: number }) {
  const c = nameColor(name)
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: `${c}16`, border: `1.5px solid ${c}32`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.34, fontWeight: 800, color: c, flexShrink: 0,
      letterSpacing: '-0.02em',
    }}>
      {initials(name)}
    </div>
  )
}

/* ── Mini sparkline ─────────────────────────────────────────────────── */
function MiniSpark({ data, color }: { data: number[]; color: string }) {
  return (
    <LineChart width={76} height={30} data={data.map(v => ({ v }))}>
      <Line type="monotone" dataKey="v" stroke={color} strokeWidth={2.5} dot={false} strokeOpacity={0.85} />
    </LineChart>
  )
}

/* ═══════════════════════════════════════════════════════════════════════
   HERO CARD — mega number 96-104px + area chart flushed to bottom
   ═══════════════════════════════════════════════════════════════════════ */
function HeroCard({ total, ativos, novos }: { total: number; ativos: number; novos: number }) {
  const display = useCountUp(total, 1500)
  const spark   = useMemo(() => genSpark(total), [total])
  const pct     = total > 0 ? Math.round((ativos / total) * 100) : 0

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.72, ease: [0.16, 1, 0.3, 1] }}
      style={{
        background: `
          radial-gradient(ellipse at 14% -28%, rgba(239,68,68,0.28) 0%, transparent 50%),
          radial-gradient(ellipse at 86% 115%, rgba(239,68,68,0.15) 0%, transparent 46%),
          #111113
        `,
        border: '1px solid rgba(239,68,68,0.20)',
        borderRadius: 24,
        padding: '30px 32px 0',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 300,
        boxShadow:
          '0 0 140px -40px rgba(239,68,68,0.24), inset 0 1px 0 rgba(255,255,255,0.06)',
      }}
    >
      {/* Ambient glow orbs */}
      <div style={{ position:'absolute', top:-100, left:-60, width:340, height:340, borderRadius:'50%', background:'rgba(239,68,68,0.09)', filter:'blur(80px)', pointerEvents:'none' }} />
      <div style={{ position:'absolute', bottom:-80, right:-60, width:260, height:260, borderRadius:'50%', background:'rgba(239,68,68,0.07)', filter:'blur(60px)', pointerEvents:'none' }} />

      {/* Top row: icon label + trend badge */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24, position:'relative' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{
            width:44, height:44, borderRadius:14,
            background:'rgba(239,68,68,0.13)',
            border:'1px solid rgba(239,68,68,0.28)',
            display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:'0 4px 20px rgba(239,68,68,0.24)',
          }}>
            <Users style={{ width:21, height:21, color:'#ef4444' }} />
          </div>
          <span style={{ fontSize:11, fontWeight:800, color:'rgba(255,255,255,0.30)', textTransform:'uppercase', letterSpacing:'0.1em' }}>
            Total de Alunos
          </span>
        </div>
        <motion.div
          initial={{ opacity:0, x:14 }} animate={{ opacity:1, x:0 }}
          transition={{ delay:0.32, duration:0.5 }}
          style={{
            display:'flex', alignItems:'center', gap:5,
            padding:'6px 13px', borderRadius:20,
            background:'rgba(34,197,94,0.09)',
            border:'1px solid rgba(34,197,94,0.22)',
          }}
        >
          <ArrowUpRight style={{ width:13, height:13, color:'#22c55e' }} />
          <span style={{ fontSize:12, fontWeight:800, color:'#22c55e' }}>+{novos} novos este mês</span>
        </motion.div>
      </div>

      {/* THE BIG NUMBER */}
      <motion.div
        initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }}
        transition={{ delay:0.18, duration:0.85, ease:[0.16,1,0.3,1] }}
        style={{
          fontSize: 'clamp(72px, 9.5vw, 108px)',
          fontWeight: 900,
          letterSpacing: '-0.07em',
          lineHeight: 1,
          color: '#fff',
          textShadow: '0 0 100px rgba(239,68,68,0.70), 0 0 40px rgba(239,68,68,0.45)',
          marginBottom: 14,
          position: 'relative',
        }}
      >
        {display.toLocaleString('pt-BR')}
      </motion.div>

      {/* Sub info pills */}
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:24, flexWrap:'wrap', position:'relative' }}>
        <div style={{ display:'flex', alignItems:'center', gap:6, padding:'4px 12px', borderRadius:20, background:'rgba(34,197,94,0.07)', border:'1px solid rgba(34,197,94,0.18)' }}>
          <div style={{ width:7, height:7, borderRadius:'50%', background:'#22c55e', boxShadow:'0 0 8px #22c55e' }} />
          <span style={{ fontSize:12, fontWeight:700, color:'#22c55e' }}>{ativos} ativos agora</span>
        </div>
        <div style={{ width:'1px', height:14, background:'rgba(255,255,255,0.08)', flexShrink:0 }} />
        <span style={{ fontSize:12, color:'rgba(255,255,255,0.32)', fontWeight:600 }}>{pct}% de engajamento</span>
      </div>

      {/* Area chart flush to card bottom */}
      <div style={{ marginLeft:-32, marginRight:-32, marginTop:'auto', position:'relative' }}>
        <div style={{
          position:'absolute', top:0, left:0, right:0, height:28,
          background:'linear-gradient(to bottom, #111113, transparent)',
          zIndex:1, pointerEvents:'none',
        }} />
        <ResponsiveContainer width="100%" height={90}>
          <AreaChart data={spark.map(v => ({ v }))} margin={{ top:0, right:0, left:0, bottom:0 }}>
            <defs>
              <linearGradient id="heroG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#ef4444" stopOpacity={0.48} />
                <stop offset="100%" stopColor="#ef4444" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="v" stroke="#ef4444" strokeWidth={2.5} fill="url(#heroG)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════
   BIG METRIC — 50px glowing number, mini sparkline, radial bg
   ═══════════════════════════════════════════════════════════════════════ */
function BigMetric({
  value, label, icon: Icon, color, trend, trendLabel, index,
}: {
  value: number; label: string; icon: React.ElementType; color: string
  trend?: 'up' | 'down' | null; trendLabel?: string; index: number
}) {
  const display = useCountUp(value)
  const spark   = useMemo(() => genSpark(value), [value])
  const TC      = trend === 'up' ? '#22c55e' : '#ef4444'
  const TI      = trend === 'up' ? ArrowUpRight : ArrowDownRight

  return (
    <motion.div
      initial={{ opacity:0, x:26 }}
      animate={{ opacity:1, x:0 }}
      transition={{ delay:0.12 + index * 0.11, duration:0.62, ease:[0.16,1,0.3,1] }}
      whileHover={{ y:-5 }}
      style={{
        background: `
          radial-gradient(ellipse at 96% 6%, ${color}18 0%, transparent 52%),
          #111113
        `,
        border: `1px solid ${color}1c`,
        borderRadius: 20,
        padding: '22px 22px 18px',
        position: 'relative', overflow: 'hidden', flex: 1,
        boxShadow: `0 0 70px -28px ${color}22, inset 0 1px 0 rgba(255,255,255,0.04)`,
        transition: 'box-shadow 0.2s',
      }}
    >
      <div style={{ position:'absolute', top:-55, right:-55, width:160, height:160, borderRadius:'50%', background:`${color}0e`, filter:'blur(40px)', pointerEvents:'none' }} />

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 }}>
        <div style={{ width:40, height:40, borderRadius:12, background:`${color}14`, border:`1px solid ${color}28`, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:`0 4px 16px ${color}1a` }}>
          <Icon style={{ width:19, height:19, color }} />
        </div>
        {trend && trendLabel && (
          <div style={{ display:'flex', alignItems:'center', gap:4, padding:'4px 10px', borderRadius:20, background:`${TC}0c`, border:`1px solid ${TC}24` }}>
            <TI style={{ width:12, height:12, color:TC }} />
            <span style={{ fontSize:11, fontWeight:800, color:TC }}>{trendLabel}</span>
          </div>
        )}
      </div>

      <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', gap:8 }}>
        <div>
          <div style={{
            fontSize: 52,
            fontWeight: 900,
            letterSpacing: '-0.06em',
            lineHeight: 1,
            marginBottom: 7,
            color: '#fff',
            textShadow: `0 0 55px ${color}85, 0 0 22px ${color}48`,
          }}>
            {display.toLocaleString('pt-BR')}
          </div>
          <div style={{ fontSize:12, color:'rgba(255,255,255,0.38)', fontWeight:600 }}>{label}</div>
        </div>
        <div style={{ opacity:0.8, flexShrink:0, marginBottom:2 }}>
          <MiniSpark data={spark} color={color} />
        </div>
      </div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════
   SMALL STAT — horizontal, icon + 34px glowing number
   ═══════════════════════════════════════════════════════════════════════ */
function SmallStat({ value, label, icon: Icon, color, index }: {
  value: number; label: string; icon: React.ElementType; color: string; index: number
}) {
  const display = useCountUp(value, 950)
  return (
    <motion.div
      initial={{ opacity:0, y:18 }}
      animate={{ opacity:1, y:0 }}
      transition={{ delay:0.3 + index * 0.07, duration:0.52, ease:[0.16,1,0.3,1] }}
      whileHover={{ y:-3 }}
      style={{
        background: `linear-gradient(145deg, ${color}0b 0%, rgba(17,17,19,0.7) 55%), #111113`,
        border: `1px solid ${color}17`,
        borderRadius: 18,
        padding: '18px 20px',
        display: 'flex', alignItems: 'center', gap: 16,
        position: 'relative', overflow: 'hidden',
        transition: 'transform 0.2s',
      }}
    >
      <div style={{ position:'absolute', top:-30, left:-20, width:100, height:100, borderRadius:'50%', background:`${color}08`, filter:'blur(24px)', pointerEvents:'none' }} />
      <div style={{ width:48, height:48, borderRadius:14, background:`${color}12`, border:`1px solid ${color}26`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow:`0 4px 18px ${color}18` }}>
        <Icon style={{ width:22, height:22, color }} />
      </div>
      <div>
        <div style={{
          fontSize: 36,
          fontWeight: 900,
          color: '#fff',
          letterSpacing: '-0.05em',
          lineHeight: 1,
          marginBottom: 4,
          textShadow: `0 0 32px ${color}78`,
        }}>
          {display.toLocaleString('pt-BR')}
        </div>
        <div style={{ fontSize:12, color:'rgba(255,255,255,0.38)', fontWeight:600 }}>{label}</div>
      </div>
    </motion.div>
  )
}

/* ── Chart tooltip ──────────────────────────────────────────────────── */
function ChartTip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background:'#18191e', border:'1px solid rgba(255,255,255,0.08)', borderRadius:12, padding:'12px 16px', boxShadow:'0 20px 50px rgba(0,0,0,0.75)' }}>
      <div style={{ fontSize:10, color:'rgba(255,255,255,0.32)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:5 }}>{label}</div>
      <div style={{ fontSize:32, fontWeight:900, color:'#fff', letterSpacing:'-0.06em', textShadow:'0 0 30px rgba(239,68,68,0.65)', lineHeight:1 }}>{payload[0]?.value}</div>
      <div style={{ fontSize:11, color:'rgba(239,68,68,0.7)', fontWeight:700, marginTop:3 }}>presenças</div>
    </div>
  )
}

/* ── Activity row ───────────────────────────────────────────────────── */
function ActivityRow({ aluno, sub, time, dot }: { aluno: Aluno; sub: string; time: string; dot: string }) {
  return (
    <Link
      href={`/alunos/${aluno.id}`}
      style={{ display:'flex', alignItems:'center', gap:12, padding:'11px 18px', textDecoration:'none', borderBottom:'1px solid rgba(255,255,255,0.04)', transition:'background 0.15s' }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.022)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
    >
      <div style={{ position:'relative' }}>
        <Avatar name={aluno.nome} size={34} />
        <div style={{ position:'absolute', bottom:0, right:0, width:9, height:9, borderRadius:'50%', background:dot, border:'1.5px solid #111113', boxShadow:`0 0 7px ${dot}` }} />
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:13, fontWeight:700, color:'#F4F4F5', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', letterSpacing:'-0.01em' }}>{aluno.nome}</div>
        <div style={{ fontSize:11, color:'rgba(255,255,255,0.36)' }}>{sub}</div>
      </div>
      <span style={{ fontSize:11, color:'rgba(255,255,255,0.26)', flexShrink:0, fontWeight:600 }}>{time}</span>
    </Link>
  )
}

/* ── Quick action ───────────────────────────────────────────────────── */
function QA({ to, icon: Icon, label, color, index }: { to: string; icon: React.ElementType; label: string; color: string; index: number }) {
  return (
    <Link href={to} style={{ textDecoration:'none' }}>
      <motion.div
        initial={{ opacity:0, scale:0.86 }}
        animate={{ opacity:1, scale:1 }}
        transition={{ delay:0.56 + index * 0.055, duration:0.45, ease:[0.16,1,0.3,1] }}
        whileHover={{ y:-4, scale:1.04 }}
        whileTap={{ scale:0.96 }}
        style={{
          display:'flex', flexDirection:'column', alignItems:'center', gap:9,
          padding:'18px 10px', borderRadius:16,
          background:'#16171c',
          border:`1px solid ${color}0f`,
          cursor:'pointer', position:'relative', overflow:'hidden',
        }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLElement
          el.style.background  = `${color}07`
          el.style.borderColor = `${color}2a`
          el.style.boxShadow   = `0 12px 32px -8px ${color}1a`
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLElement
          el.style.background  = '#16171c'
          el.style.borderColor = `${color}0f`
          el.style.boxShadow   = 'none'
        }}
      >
        <div style={{ width:42, height:42, borderRadius:13, background:`${color}15`, border:`1px solid ${color}26`, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:`0 4px 18px ${color}1c` }}>
          <Icon style={{ width:20, height:20, color }} />
        </div>
        <span style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.52)', textAlign:'center', lineHeight:1.3 }}>{label}</span>
      </motion.div>
    </Link>
  )
}

/* ═══════════════════════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════════════════════ */
export default function DashboardPage() {
  const { user } = useAuth()

  const { data: aRes,  isLoading: loadingAlunos } = useQuery({ queryKey:['alunos'],              queryFn:() => listarAlunos(),      staleTime:60_000, enabled:!!user })
  const { data: anRes, isLoading: loadingStats  } = useQuery({ queryKey:['analytics-resumo', 7], queryFn:() => analyticsResumo(7), staleTime:60_000, enabled:!!user })

  const alunos: Aluno[]   = (aRes  as { data: Aluno[] }     | undefined)?.data || []
  const stats:  Analytics = (anRes as { data: Analytics } | undefined)?.data || {}

  const total    = stats.total_alunos ?? alunos.length
  const ativos   = alunos.filter(a => a.ativo).length
  const inativos = alunos.filter(a => !a.ativo).length
  const novos    = stats.novos_30d ?? 0
  const churn    = stats.churn_risk || []
  const inadimpl = alunos.filter(a => a.status_pagamento === 'overdue' || a.status_pagamento === 'atrasado').length
  const recentes = [...alunos].sort((a, b) => (b.criado_em || '').localeCompare(a.criado_em || '')).slice(0, 6)
  const taxa     = total > 0 ? Math.round((ativos / total) * 100) : 0

  const firstName = user?.nome?.split(' ')[0] || 'Personal'
  const now       = new Date()
  const h         = now.getHours()
  const greeting  = h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite'

  const chartData = useMemo(() => [
    { dia:'Seg', v: Math.max(1, ativos - 8) },
    { dia:'Ter', v: Math.max(1, ativos - 5) },
    { dia:'Qua', v: Math.max(1, ativos - 2) },
    { dia:'Qui', v: Math.max(1, ativos + 2) },
    { dia:'Sex', v: Math.max(1, ativos + 4) },
    { dia:'Sáb', v: Math.max(1, ativos - 1) },
    { dia:'Dom', v: Math.max(1, ativos - 11) },
  ], [ativos])

  const peak = chartData.reduce((a, b) => a.v > b.v ? a : b)
  const avg  = Math.round(chartData.reduce((s, d) => s + d.v, 0) / chartData.length)
  const isLoading = loadingAlunos || loadingStats

  if (isLoading) return (
    <div style={{ display:'flex', flexDirection:'column', gap:16, paddingBottom:40 }}>
      {/* Header skeleton */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:16 }}>
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          <div className="skeleton" style={{ width:160, height:14, borderRadius:8 }} />
          <div className="skeleton" style={{ width:260, height:36, borderRadius:10 }} />
          <div className="skeleton" style={{ width:180, height:14, borderRadius:8 }} />
        </div>
        <div className="skeleton" style={{ width:130, height:44, borderRadius:13 }} />
      </div>
      {/* Bento 1 */}
      <div style={{ display:'grid', gap:14, gridTemplateColumns:'minmax(0,2fr) minmax(0,1fr)' }}>
        <div className="skeleton" style={{ height:300, borderRadius:24 }} />
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div className="skeleton" style={{ flex:1, minHeight:140, borderRadius:20 }} />
          <div className="skeleton" style={{ flex:1, minHeight:140, borderRadius:20 }} />
        </div>
      </div>
      {/* Small stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))', gap:14 }}>
        {[0,1,2,3].map(i => <div key={i} className="skeleton" style={{ height:84, borderRadius:18 }} />)}
      </div>
      {/* Chart + feed */}
      <div style={{ display:'grid', gap:14, gridTemplateColumns:'minmax(0,1fr) 308px' }}>
        <div className="skeleton" style={{ height:260, borderRadius:22 }} />
        <div className="skeleton" style={{ height:260, borderRadius:22 }} />
      </div>
    </div>
  )

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16, paddingBottom:40 }}>

      {/* ── HEADER ──────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity:0, y:-20 }} animate={{ opacity:1, y:0 }}
        transition={{ duration:0.56, ease:[0.16,1,0.3,1] }}
        style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:16, flexWrap:'wrap', paddingBottom:4 }}
      >
        <div>
          {/* Live indicator */}
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:11 }}>
            <div style={{
              width:8, height:8, borderRadius:'50%',
              background:'#22c55e',
              boxShadow:'0 0 0 3px rgba(34,197,94,0.18), 0 0 16px rgba(34,197,94,0.65)',
            }} />
            <span style={{ fontSize:11, fontWeight:800, color:'rgba(255,255,255,0.28)', letterSpacing:'0.1em', textTransform:'uppercase' }}>
              Ao Vivo · {now.toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit' })}
            </span>
          </div>

          <h1 style={{ fontSize:'clamp(26px,4vw,38px)', fontWeight:900, letterSpacing:'-0.055em', lineHeight:1.05, marginBottom:7 }}>
            <span style={{ color:'#F4F4F5' }}>{greeting}, </span>
            <span style={{ background:'linear-gradient(135deg,#ef4444 0%,#f472b6 52%,#a855f7 100%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
              {firstName}
            </span>
            <span style={{ fontSize:'0.85em', marginLeft:6 }}>👋</span>
          </h1>

          <p style={{ fontSize:13, color:'rgba(255,255,255,0.35)', fontWeight:500 }}>
            {now.toLocaleDateString('pt-BR', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}
          </p>
        </div>

        <motion.div whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}>
          <Link href="/alunos/novo" style={{
            display:'inline-flex', alignItems:'center', gap:8,
            padding:'12px 24px', borderRadius:13,
            background:'linear-gradient(135deg,#ef4444 0%,#dc2626 100%)',
            color:'#fff', fontSize:14, fontWeight:800, textDecoration:'none',
            letterSpacing:'-0.01em',
            boxShadow:'0 4px 28px rgba(239,68,68,0.42), 0 0 0 1px rgba(239,68,68,0.38), inset 0 1px 0 rgba(255,255,255,0.16)',
          }}>
            <Users style={{ width:15, height:15 }}/> Novo aluno
          </Link>
        </motion.div>
      </motion.div>

      {/* ── BENTO 1: HERO + SIDE STACK ─────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <HeroCard total={total} ativos={ativos} novos={novos} />
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <BigMetric
            value={ativos}
            label="Alunos ativos"
            icon={UserCheck}
            color="#22c55e"
            trend="up"
            trendLabel={`${taxa}%`}
            index={0}
          />
          <BigMetric
            value={novos}
            label="Novos (30 dias)"
            icon={TrendingUp}
            color="#06b6d4"
            trend={novos > 0 ? 'up' : null}
            trendLabel="crescendo"
            index={1}
          />
        </div>
      </div>

      {/* ── BENTO 2: SMALL STATS ROW ───────────────────────────────── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(190px, 1fr))', gap:14 }}>
        <SmallStat value={inativos}      label="Alunos inativos"    icon={Activity}     color="#f97316" index={0} />
        <SmallStat value={inadimpl}      label="Inadimplentes"      icon={DollarSign}   color="#ef4444" index={1} />
        <SmallStat value={churn.length}  label="Risco de abandono"  icon={TrendingDown} color="#a855f7" index={2} />
        <SmallStat value={ativos}        label="Check-ins hoje"     icon={Calendar}     color="#eab308" index={3} />
      </div>

      {/* ── BENTO 3: CHART + FEED ──────────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_308px]">

        {/* Chart */}
        <motion.div
          initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
          transition={{ delay:0.38, duration:0.56 }}
          style={{
            background:'#111113',
            border:'1px solid rgba(255,255,255,0.06)',
            borderRadius:22,
            padding:'24px 24px 14px',
            position:'relative',
            overflow:'hidden',
            boxShadow:'inset 0 1px 0 rgba(255,255,255,0.04)',
          }}
        >
          <div style={{ position:'absolute', top:-50, right:-50, width:300, height:300, borderRadius:'50%', background:'rgba(239,68,68,0.055)', filter:'blur(65px)', pointerEvents:'none' }} />

          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:28, position:'relative' }}>
            <div>
              <h2 style={{ fontSize:16, fontWeight:900, color:'#F4F4F5', letterSpacing:'-0.04em', marginBottom:5 }}>Atividade da Semana</h2>
              <p style={{ fontSize:12, color:'rgba(255,255,255,0.35)' }}>
                Pico <span style={{ color:'#ef4444', fontWeight:800 }}>{peak.dia}</span>
                {' '}· Média <span style={{ color:'rgba(255,255,255,0.55)', fontWeight:700 }}>{avg} presenças/dia</span>
              </p>
            </div>
            <div style={{ textAlign:'right' }}>
              <div style={{
                fontSize: 44,
                fontWeight: 900,
                color: '#fff',
                letterSpacing: '-0.06em',
                lineHeight: 1,
                textShadow: '0 0 45px rgba(239,68,68,0.65)',
              }}>{peak.v}</div>
              <div style={{ fontSize:10, color:'rgba(255,255,255,0.28)', textTransform:'uppercase', letterSpacing:'0.07em', marginTop:2 }}>
                recorde do dia
              </div>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData} margin={{ top:4, right:4, left:-28, bottom:0 }}>
              <defs>
                <linearGradient id="chartG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#ef4444" stopOpacity={0.48} />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="dia" tick={{ fill:'rgba(255,255,255,0.3)', fontSize:11, fontWeight:700 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:'rgba(255,255,255,0.22)', fontSize:10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTip />} cursor={{ stroke:'rgba(239,68,68,0.18)', strokeWidth:1 }} />
              <Area
                type="monotone" dataKey="v"
                stroke="#ef4444" strokeWidth={2.5}
                fill="url(#chartG)" dot={false}
                activeDot={{ r:7, fill:'#ef4444', stroke:'rgba(239,68,68,0.35)', strokeWidth:8 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Activity feed */}
        <motion.div
          initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
          transition={{ delay:0.46, duration:0.56 }}
          style={{
            background:'#111113',
            border:'1px solid rgba(255,255,255,0.06)',
            borderRadius:22,
            overflow:'hidden',
            display:'flex',
            flexDirection:'column',
          }}
        >
          <div style={{ padding:'18px 18px 14px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
            <div>
              <h2 style={{ fontSize:13, fontWeight:900, color:'#F4F4F5', letterSpacing:'-0.03em', marginBottom:2 }}>Alunos Recentes</h2>
              <p style={{ fontSize:11, color:'rgba(255,255,255,0.3)' }}>{recentes.length} cadastros</p>
            </div>
            <Link href="/alunos" style={{ display:'flex', alignItems:'center', gap:4, fontSize:12, color:'#ef4444', fontWeight:800, textDecoration:'none' }}>
              Ver todos <ChevronRight style={{ width:13, height:13 }}/>
            </Link>
          </div>

          {recentes.length === 0
            ? <div style={{ padding:'32px 18px', textAlign:'center', color:'rgba(255,255,255,0.24)', fontSize:13 }}>Nenhum aluno cadastrado</div>
            : recentes.map((a, i) => (
                <ActivityRow
                  key={a.id}
                  aluno={a}
                  sub={a.ativo ? `Ativo · ${a.plano || 'Básico'}` : 'Inativo'}
                  time={i === 0 ? 'hoje' : i === 1 ? 'ontem' : `${i + 1}d atrás`}
                  dot={a.ativo ? '#22c55e' : '#f97316'}
                />
              ))
          }
        </motion.div>
      </div>

      {/* ── BENTO 4: CHURN + ACTIONS ───────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-2">

        {/* Churn risk */}
        <motion.div
          initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
          transition={{ delay:0.53, duration:0.55 }}
          style={{ background:'#111113', border:'1px solid rgba(255,255,255,0.06)', borderRadius:22, padding:'22px 24px' }}
        >
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:22 }}>
            <div>
              <h2 style={{ fontSize:15, fontWeight:900, color:'#F4F4F5', letterSpacing:'-0.04em', marginBottom:4 }}>Risco de Abandono</h2>
              <p style={{ fontSize:12, color:'rgba(255,255,255,0.35)' }}>
                {churn.length > 0 ? `${churn.length} alunos em alerta` : 'Todos engajados!'}
              </p>
            </div>
            <div style={{ width:40, height:40, borderRadius:12, background:'rgba(168,85,247,0.11)', border:'1px solid rgba(168,85,247,0.26)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Target style={{ width:18, height:18, color:'#a855f7' }}/>
            </div>
          </div>

          {churn.length === 0 ? (
            <div style={{ display:'flex', alignItems:'center', gap:16, padding:'16px 18px', borderRadius:16, background:'rgba(34,197,94,0.05)', border:'1px solid rgba(34,197,94,0.14)' }}>
              <div style={{ width:48, height:48, borderRadius:'50%', background:'rgba(34,197,94,0.1)', border:'1px solid rgba(34,197,94,0.24)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <Award style={{ width:22, height:22, color:'#22c55e' }}/>
              </div>
              <div>
                <p style={{ fontSize:14, fontWeight:800, color:'#F4F4F5', marginBottom:3 }}>Academia engajada!</p>
                <p style={{ fontSize:12, color:'rgba(255,255,255,0.38)' }}>Nenhum aluno em risco de abandono agora</p>
              </div>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              {churn.slice(0, 5).map((a, idx) => {
                const score = a.score ?? Math.min(100, (a.dias_sem_treino || 0) * 3)
                const sc    = score > 70 ? '#ef4444' : score > 40 ? '#f97316' : '#eab308'
                const lb    = score > 70 ? 'Alto' : score > 40 ? 'Médio' : 'Baixo'
                return (
                  <Link key={a.id} href={`/alunos/${a.id}`} style={{ display:'flex', alignItems:'center', gap:11, textDecoration:'none' }}>
                    <Avatar name={a.nome} size={33} />
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:6 }}>
                        <span style={{ fontSize:13, fontWeight:700, color:'#F4F4F5', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'62%', letterSpacing:'-0.01em' }}>{a.nome}</span>
                        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                          <span style={{ fontSize:10, fontWeight:800, color:sc, padding:'2px 7px', borderRadius:20, background:`${sc}11`, border:`1px solid ${sc}25` }}>{lb}</span>
                          <span style={{ fontSize:14, fontWeight:900, color:sc, textShadow:`0 0 18px ${sc}78` }}>{score}%</span>
                        </div>
                      </div>
                      <div style={{ height:5, borderRadius:3, background:'rgba(255,255,255,0.06)', overflow:'hidden' }}>
                        <motion.div
                          initial={{ width:0 }} animate={{ width:`${score}%` }}
                          transition={{ delay:0.78 + idx * 0.1, duration:1.05, ease:[0.16,1,0.3,1] }}
                          style={{ height:'100%', borderRadius:3, background:`linear-gradient(90deg,${sc}55,${sc})`, boxShadow:`0 0 8px ${sc}55` }}
                        />
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </motion.div>

        {/* Quick actions */}
        <motion.div
          initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
          transition={{ delay:0.60, duration:0.55 }}
          style={{ background:'#111113', border:'1px solid rgba(255,255,255,0.06)', borderRadius:22, padding:'22px 24px' }}
        >
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
            <div style={{ width:40, height:40, borderRadius:12, background:'rgba(239,68,68,0.11)', border:'1px solid rgba(239,68,68,0.26)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Zap style={{ width:18, height:18, color:'#ef4444' }}/>
            </div>
            <div>
              <h2 style={{ fontSize:15, fontWeight:900, color:'#F4F4F5', letterSpacing:'-0.04em', marginBottom:2 }}>Ações Rápidas</h2>
              <p style={{ fontSize:12, color:'rgba(255,255,255,0.35)' }}>Atalhos mais usados</p>
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
            <QA to="/alunos/novo"   icon={Users}       label="Novo Aluno"   color="#6366f1" index={0} />
            <QA to="/treinos"       icon={Target}      label="Treinos"      color="#22c55e" index={1} />
            <QA to="/ia"            icon={Zap}         label="IA Coach"     color="#eab308" index={2} />
            <QA to="/agenda"        icon={Calendar}    label="Agenda"       color="#f97316" index={3} />
            <QA to="/qr"            icon={Clock}       label="Check-in QR"  color="#14b8a6" index={4} />
            <QA to="/financeiro"    icon={DollarSign}  label="Financeiro"   color="#10b981" index={5} />
          </div>
        </motion.div>
      </div>

      <div className="lg:hidden" style={{ height:80 }}/>

      {total === 0 && !isLoading && <OnboardingWizard />}
    </div>
  )
}
