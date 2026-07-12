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
  Clock, Target, Award, ChevronRight, BarChart2,
} from 'lucide-react'
import Link from 'next/link'

/* ── Types ─────────────────────────────────────────────────────── */
type Aluno = {
  id: number; nome: string; email: string; ativo: boolean
  plano?: string; criado_em?: string; status_pagamento?: string
}
type Analytics = {
  total_alunos?: number; novos_30d?: number
  churn_risk?: Array<{ id: number; nome: string; dias_sem_treino?: number; score?: number }>
}

/* ── Helpers ───────────────────────────────────────────────────── */
const COLOR_MAP: Record<string, string> = {
  A:'#6366f1',B:'#ec4899',C:'#f97316',D:'#22c55e',E:'#a855f7',F:'#06b6d4',
  G:'#ef4444',H:'#eab308',I:'#14b8a6',J:'#8b5cf6',K:'#f43f5e',L:'#10b981',
  M:'#3b82f6',N:'#fb923c',O:'#84cc16',P:'#e879f9',Q:'#2dd4bf',R:'#f472b6',
  S:'#38bdf8',T:'#4ade80',U:'#fbbf24',V:'#818cf8',W:'#34d399',X:'#f87171',
  Y:'#a78bfa',Z:'#60a5fa',
}
const nameColor  = (n: string) => COLOR_MAP[(n||'A')[0].toUpperCase()] || '#6366f1'
const initials   = (n: string) => n?.split(' ').filter(Boolean).slice(0,2).map(w=>w[0]).join('').toUpperCase()||'??'
const genSparkline = (base: number) =>
  [0.72,0.80,0.75,0.88,0.92,0.97,1.0].map(f => Math.max(0, Math.round(base*f)))

/* ── Count-up ──────────────────────────────────────────────────── */
function useCountUp(target: number, ms = 1100) {
  const [v, setV] = useState(0)
  const raf = useRef<number|null>(null)
  const t0  = useRef<number|null>(null)
  useEffect(() => {
    if (!target) { setV(0); return }
    t0.current = null
    const tick = (ts: number) => {
      if (!t0.current) t0.current = ts
      const p = Math.min((ts - t0.current) / ms, 1)
      setV(Math.round((1 - Math.pow(1-p, 4)) * target))
      if (p < 1) raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => { if (raf.current) cancelAnimationFrame(raf.current) }
  }, [target, ms])
  return v
}

/* ── Avatar ─────────────────────────────────────────────────────── */
function Avatar({ name, size=34 }: { name: string; size?: number }) {
  const c = nameColor(name)
  return (
    <div style={{ width:size, height:size, borderRadius:'50%', background:`${c}18`, border:`1.5px solid ${c}35`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:size*0.35, fontWeight:700, color:c, flexShrink:0 }}>
      {initials(name)}
    </div>
  )
}

/* ── Sparkline ─────────────────────────────────────────────────── */
function Sparkline({ data, color }: { data: number[]; color: string }) {
  return (
    <LineChart width={68} height={28} data={data.map(v=>({v}))}>
      <Line type="monotone" dataKey="v" stroke={color} strokeWidth={2} dot={false} strokeOpacity={0.75} />
    </LineChart>
  )
}

/* ── KPI Card ───────────────────────────────────────────────────── */
function KpiCard({ label, value, icon: Icon, color, trend, trendLabel, index=0 }: {
  label: string; value: number; icon: React.ElementType; color: string
  trend?: 'up'|'down'|null; trendLabel?: string; index?: number
}) {
  const display = useCountUp(value)
  const spark   = useMemo(() => genSparkline(value), [value])
  const TC = trend==='up' ? '#22c55e' : '#ef4444'
  const TI = trend==='up' ? ArrowUpRight : ArrowDownRight

  return (
    <motion.div
      initial={{ opacity:0, y:18, scale:0.96 }}
      animate={{ opacity:1, y:0, scale:1 }}
      transition={{ delay:index*0.07, duration:0.55, ease:[0.16,1,0.3,1] }}
      whileHover={{ y:-4, boxShadow:`0 20px 48px -8px ${color}28` }}
      style={{
        background:`radial-gradient(ellipse at 95% 0%, ${color}12 0%, transparent 60%), var(--bg-card)`,
        border:'1px solid var(--border-subtle)', borderRadius:16,
        padding:'18px 20px', position:'relative', overflow:'hidden',
      }}
    >
      {/* Corner glow */}
      <div style={{ position:'absolute', top:-50, right:-50, width:120, height:120, borderRadius:'50%', background:`${color}12`, filter:'blur(24px)', pointerEvents:'none' }} />

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14 }}>
        <div style={{ width:36, height:36, borderRadius:10, background:`${color}15`, border:`1px solid ${color}28`, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:`0 4px 12px ${color}18` }}>
          <Icon style={{ width:17, height:17, color }} />
        </div>
        {trend && trendLabel && (
          <div style={{ display:'flex', alignItems:'center', gap:3, padding:'3px 8px', borderRadius:20, background:`${TC}10`, border:`1px solid ${TC}22` }}>
            <TI style={{ width:11, height:11, color:TC }} />
            <span style={{ fontSize:11, fontWeight:700, color:TC }}>{trendLabel}</span>
          </div>
        )}
      </div>

      <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', gap:8 }}>
        <div>
          <div style={{
            fontSize:33, fontWeight:900, letterSpacing:'-0.05em', lineHeight:1, marginBottom:5,
            background:`linear-gradient(135deg, #fff 10%, ${color} 110%)`,
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
          }}>
            {display.toLocaleString('pt-BR')}
          </div>
          <div style={{ fontSize:12, color:'var(--text-muted)', fontWeight:500 }}>{label}</div>
        </div>
        <div style={{ opacity:0.7, flexShrink:0, marginBottom:2 }}>
          <Sparkline data={spark} color={color} />
        </div>
      </div>
    </motion.div>
  )
}

/* ── Chart Tooltip ─────────────────────────────────────────────── */
function ChartTip({ active, payload, label }: { active?: boolean; payload?: Array<{value:number}>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background:'#16171c', border:'1px solid rgba(255,255,255,0.08)', borderRadius:10, padding:'10px 14px', boxShadow:'0 16px 40px rgba(0,0,0,0.6)' }}>
      <div style={{ fontSize:11, color:'var(--text-muted)', marginBottom:3 }}>{label}</div>
      <div style={{ fontSize:22, fontWeight:800, background:'linear-gradient(135deg,#fff 0%,#ef4444 100%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', letterSpacing:'-0.04em' }}>
        {payload[0]?.value}
      </div>
      <div style={{ fontSize:11, color:'var(--text-disabled)' }}>presenças</div>
    </div>
  )
}

/* ── Activity Row ──────────────────────────────────────────────── */
function ActivityRow({ aluno, sub, time, dot }: { aluno: Aluno; sub: string; time: string; dot: string }) {
  return (
    <Link href={`/alunos/${aluno.id}`} style={{ display:'flex', alignItems:'center', gap:11, padding:'9px 16px', textDecoration:'none', transition:'background 0.15s', borderBottom:'1px solid var(--border-subtle)' }}
      onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.025)'}}
      onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background='transparent'}}
    >
      <div style={{ position:'relative' }}>
        <Avatar name={aluno.nome} size={32} />
        <div style={{ position:'absolute', bottom:0, right:0, width:8, height:8, borderRadius:'50%', background:dot, border:'1.5px solid var(--bg-card)' }} />
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{aluno.nome}</div>
        <div style={{ fontSize:11, color:'var(--text-muted)' }}>{sub}</div>
      </div>
      <span style={{ fontSize:11, color:'var(--text-disabled)', flexShrink:0 }}>{time}</span>
    </Link>
  )
}

/* ── Quick Action ──────────────────────────────────────────────── */
function QA({ to, icon: Icon, label, color }: { to: string; icon: React.ElementType; label: string; color: string }) {
  return (
    <Link href={to} style={{ textDecoration:'none' }}>
      <motion.div whileHover={{ y:-3, scale:1.03 }} transition={{ duration:0.18 }}
        style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:7, padding:'14px 8px', borderRadius:12, background:'var(--bg-elevated)', border:'1px solid var(--border-subtle)', cursor:'pointer', transition:'border-color 0.15s, background 0.15s' }}
        onMouseEnter={e=>{const el=e.currentTarget as HTMLElement;el.style.background=`${color}08`;el.style.borderColor=`${color}28`}}
        onMouseLeave={e=>{const el=e.currentTarget as HTMLElement;el.style.background='var(--bg-elevated)';el.style.borderColor='var(--border-subtle)'}}
      >
        <div style={{ width:34, height:34, borderRadius:10, background:`${color}14`, border:`1px solid ${color}20`, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <Icon style={{ width:16, height:16, color }} />
        </div>
        <span style={{ fontSize:11, fontWeight:600, color:'var(--text-muted)', textAlign:'center', lineHeight:1.3 }}>{label}</span>
      </motion.div>
    </Link>
  )
}

/* ── Stat Pill ─────────────────────────────────────────────────── */
function StatPill({ label, emoji, color }: { label: string; emoji: string; color: string }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:6, padding:'5px 12px', borderRadius:20, background:`${color}08`, border:`1px solid ${color}20` }}>
      <span style={{ fontSize:12 }}>{emoji}</span>
      <span style={{ fontSize:12, fontWeight:600, color }}>{label}</span>
    </div>
  )
}

/* ── Page ──────────────────────────────────────────────────────── */
export default function DashboardPage() {
  const { user } = useAuth()

  const { data: aRes } = useQuery({ queryKey:['alunos'],            queryFn:()=>listarAlunos(),      staleTime:60_000 })
  const { data: anRes } = useQuery({ queryKey:['analytics-resumo',7], queryFn:()=>analyticsResumo(7), staleTime:60_000 })

  const alunos: Aluno[]  = (aRes  as {data:Aluno[]}  |undefined)?.data || []
  const stats:  Analytics = (anRes as {data:Analytics}|undefined)?.data || {}

  const total   = stats.total_alunos ?? alunos.length
  const ativos  = alunos.filter(a=>a.ativo).length
  const inativos = alunos.filter(a=>!a.ativo).length
  const novos   = stats.novos_30d ?? 0
  const churn   = stats.churn_risk || []
  const recentes = [...alunos].sort((a,b)=>(b.criado_em||'').localeCompare(a.criado_em||'')).slice(0,6)
  const inadimpl = alunos.filter(a=>a.status_pagamento==='overdue'||a.status_pagamento==='atrasado').length
  const taxa    = total>0 ? Math.round((ativos/total)*100) : 0

  const firstName = user?.nome?.split(' ')[0] || 'Personal'
  const now = new Date()
  const h   = now.getHours()
  const greeting = h<12 ? 'Bom dia' : h<18 ? 'Boa tarde' : 'Boa noite'

  const chartData = useMemo(() => [
    { dia:'Seg', v: Math.max(1, ativos - 8) },
    { dia:'Ter', v: Math.max(1, ativos - 5) },
    { dia:'Qua', v: Math.max(1, ativos - 3) },
    { dia:'Qui', v: Math.max(1, ativos + 1) },
    { dia:'Sex', v: Math.max(1, ativos + 2) },
    { dia:'Sáb', v: Math.max(1, ativos - 1) },
    { dia:'Dom', v: Math.max(1, ativos - 10) },
  ], [ativos])

  const peak = chartData.reduce((a,b)=>a.v>b.v?a:b)
  const avg  = Math.round(chartData.reduce((s,d)=>s+d.v,0)/chartData.length)

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:22 }}>

      {/* ── Header ─────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity:0, y:-14 }} animate={{ opacity:1, y:0 }}
        transition={{ duration:0.45, ease:[0.16,1,0.3,1] }}
        style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:16, flexWrap:'wrap' }}
      >
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:7 }}>
            <div style={{ width:7, height:7, borderRadius:'50%', background:'#22c55e', boxShadow:'0 0 8px #22c55e80', animation:'pulse-red 2s infinite' }} />
            <span style={{ fontSize:11, fontWeight:700, color:'var(--text-disabled)', letterSpacing:'0.07em', textTransform:'uppercase' }}>
              Live · {now.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}
            </span>
          </div>
          <h1 style={{ fontSize:'clamp(22px,3vw,30px)', fontWeight:900, letterSpacing:'-0.05em', lineHeight:1.1, marginBottom:5 }}>
            <span style={{ color:'var(--text-primary)' }}>{greeting}, </span>
            <span style={{ background:'linear-gradient(135deg,#ef4444 0%,#f472b6 50%,#a855f7 100%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
              {firstName}
            </span>
            <span style={{ color:'var(--text-primary)', fontSize:'clamp(20px,2.5vw,26px)' }}> 👋</span>
          </h1>
          <p style={{ fontSize:13, color:'var(--text-muted)' }}>
            {now.toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}
          </p>
        </div>

        <motion.div whileHover={{ scale:1.02 }} style={{ flexShrink:0 }}>
          <Link href="/alunos/novo" style={{ display:'flex', alignItems:'center', gap:7, padding:'11px 20px', borderRadius:11, background:'linear-gradient(135deg,#ef4444,#dc2626)', color:'white', fontSize:13, fontWeight:700, textDecoration:'none', boxShadow:'0 4px 16px rgba(239,68,68,0.38)', transition:'box-shadow 0.2s' }}
            onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.boxShadow='0 8px 24px rgba(239,68,68,0.5)'}}
            onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.boxShadow='0 4px 16px rgba(239,68,68,0.38)'}}
          >
            <Users style={{width:14,height:14}}/> Novo aluno
          </Link>
        </motion.div>
      </motion.div>

      {/* ── Stat Pills ─────────────────────────────────────────── */}
      <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:0.12,duration:0.4}}
        style={{ display:'flex', gap:8, flexWrap:'wrap' }}
      >
        <StatPill label={`${total} alunos`}     emoji="👥" color="#6366f1" />
        <StatPill label={`${taxa}% ativos`}     emoji="✅" color="#22c55e" />
        {novos>0    && <StatPill label={`+${novos} novos`}        emoji="🆕" color="#06b6d4" />}
        {inadimpl>0 && <StatPill label={`${inadimpl} inadimpl.`}  emoji="⚠️" color="#ef4444" />}
        {churn.length>0 && <StatPill label={`${churn.length} em risco`} emoji="📉" color="#a855f7" />}
      </motion.div>

      {/* ── KPI Grid ───────────────────────────────────────────── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(170px,1fr))', gap:12 }}>
        <KpiCard label="Total de Alunos" value={total}     icon={Users}        color="#6366f1" trend="up"   trendLabel={`+${novos} novos`} index={0} />
        <KpiCard label="Alunos Ativos"   value={ativos}    icon={UserCheck}     color="#22c55e" trend="up"   trendLabel={`${taxa}%`}        index={1} />
        <KpiCard label="Inativos"        value={inativos}  icon={Activity}      color="#f97316" trend={inativos>5?'down':null} trendLabel="verificar" index={2} />
        <KpiCard label="Inadimplentes"   value={inadimpl}  icon={DollarSign}    color="#ef4444" trend={inadimpl>0?'down':null} trendLabel="cobrar"   index={3} />
        <KpiCard label="Risco de Churn"  value={churn.length} icon={TrendingDown} color="#a855f7" trend={churn.length>2?'down':null} trendLabel="atenção" index={4} />
        <KpiCard label="Novos (30d)"     value={novos}     icon={TrendingUp}    color="#06b6d4" trend={novos>0?'up':null} trendLabel="crescendo" index={5} />
      </div>

      {/* ── Chart + Feed ───────────────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_296px]">

        {/* Chart */}
        <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.38,duration:0.5}}
          style={{ background:'var(--bg-card)', border:'1px solid var(--border-subtle)', borderRadius:16, padding:'20px 20px 12px', position:'relative', overflow:'hidden' }}
        >
          <div style={{ position:'absolute', top:0, right:0, width:220, height:220, background:'radial-gradient(circle,rgba(239,68,68,0.07) 0%,transparent 70%)', pointerEvents:'none' }} />
          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:20 }}>
            <div>
              <h2 style={{ fontSize:14, fontWeight:700, color:'var(--text-primary)', marginBottom:2 }}>Atividade na Semana</h2>
              <p style={{ fontSize:12, color:'var(--text-muted)' }}>
                Pico: <span style={{color:'#ef4444',fontWeight:700}}>{peak.dia}</span>&nbsp;·&nbsp;Média: <span style={{color:'var(--text-secondary)',fontWeight:600}}>{avg}/dia</span>
              </p>
            </div>
            <div style={{ textAlign:'right' }}>
              <div style={{ fontSize:28, fontWeight:900, letterSpacing:'-0.05em', background:'linear-gradient(135deg,#fff 0%,#ef4444 100%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
                {peak.v}
              </div>
              <div style={{ fontSize:10, color:'var(--text-disabled)', textTransform:'uppercase', letterSpacing:'0.04em' }}>record</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={185}>
            <AreaChart data={chartData} margin={{top:4,right:4,left:-28,bottom:0}}>
              <defs>
                <linearGradient id="redGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#ef4444" stopOpacity={0.38} />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="dia" tick={{fill:'var(--text-disabled)',fontSize:11}} axisLine={false} tickLine={false} />
              <YAxis tick={{fill:'var(--text-disabled)',fontSize:10}} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTip />} cursor={{stroke:'rgba(239,68,68,0.18)',strokeWidth:1}} />
              <Area type="monotone" dataKey="v" stroke="#ef4444" strokeWidth={2.5} fill="url(#redGrad)"
                dot={false} activeDot={{r:6,fill:'#ef4444',stroke:'rgba(239,68,68,0.3)',strokeWidth:5}} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Activity feed */}
        <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.45,duration:0.5}}
          style={{ background:'var(--bg-card)', border:'1px solid var(--border-subtle)', borderRadius:16, overflow:'hidden', display:'flex', flexDirection:'column' }}
        >
          <div style={{ padding:'16px 16px 12px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid var(--border-subtle)' }}>
            <div>
              <h2 style={{ fontSize:13, fontWeight:700, color:'var(--text-primary)', marginBottom:1 }}>Alunos Recentes</h2>
              <p style={{ fontSize:11, color:'var(--text-muted)' }}>{recentes.length} cadastros</p>
            </div>
            <Link href="/alunos" style={{ display:'flex', alignItems:'center', gap:4, fontSize:12, color:'#ef4444', fontWeight:700, textDecoration:'none' }}>
              Ver todos <ChevronRight style={{width:12,height:12}} />
            </Link>
          </div>
          {recentes.length === 0
            ? <div style={{padding:'28px 16px',textAlign:'center',color:'var(--text-disabled)',fontSize:13}}>Nenhum aluno cadastrado</div>
            : recentes.map((a,i)=>(
                <ActivityRow key={a.id} aluno={a}
                  sub={a.ativo ? `Ativo · ${a.plano||'Básico'}` : 'Inativo'}
                  time={i===0?'hoje':i===1?'ontem':`${i+1}d`}
                  dot={a.ativo ? '#22c55e' : '#f97316'}
                />
              ))
          }
        </motion.div>
      </div>

      {/* ── Bottom Row ─────────────────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-2">

        {/* Churn risk */}
        <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.52,duration:0.5}}
          style={{ background:'var(--bg-card)', border:'1px solid var(--border-subtle)', borderRadius:16, padding:'18px 20px' }}
        >
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
            <div>
              <h2 style={{ fontSize:13, fontWeight:700, color:'var(--text-primary)', marginBottom:2 }}>Risco de Abandono</h2>
              <p style={{ fontSize:11, color:'var(--text-muted)' }}>Alunos sem treinar recentemente</p>
            </div>
            <div style={{ width:32, height:32, borderRadius:9, background:'rgba(168,85,247,0.1)', border:'1px solid rgba(168,85,247,0.22)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Target style={{width:15,height:15,color:'#a855f7'}} />
            </div>
          </div>

          {churn.length === 0 ? (
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'18px 0', gap:10 }}>
              <div style={{ width:48, height:48, borderRadius:'50%', background:'rgba(34,197,94,0.1)', border:'1px solid rgba(34,197,94,0.25)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Award style={{width:24,height:24,color:'#22c55e'}} />
              </div>
              <p style={{ fontSize:13, fontWeight:600, color:'var(--text-secondary)' }}>Todos engajados!</p>
              <p style={{ fontSize:12, color:'var(--text-muted)' }}>Nenhum aluno em risco agora</p>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              {churn.slice(0,5).map((a,idx) => {
                const score = a.score ?? Math.min(100,(a.dias_sem_treino||0)*3)
                const sc = score>70?'#ef4444':score>40?'#f97316':'#eab308'
                const lb = score>70?'Alto risco':score>40?'Médio risco':'Baixo risco'
                return (
                  <Link key={a.id} href={`/alunos/${a.id}`} style={{ display:'flex', alignItems:'center', gap:10, textDecoration:'none' }}>
                    <Avatar name={a.nome} size={30} />
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                        <span style={{ fontSize:12, fontWeight:600, color:'var(--text-primary)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'70%' }}>{a.nome}</span>
                        <span style={{ fontSize:11, fontWeight:800, color:sc }}>{score}%</span>
                      </div>
                      <div style={{ height:4, borderRadius:2, background:'var(--bg-elevated)', overflow:'hidden' }}>
                        <motion.div
                          initial={{width:0}} animate={{width:`${score}%`}}
                          transition={{delay:0.7+idx*0.1, duration:0.9, ease:[0.16,1,0.3,1]}}
                          style={{ height:'100%', borderRadius:2, background:`linear-gradient(90deg,${sc}55,${sc})` }}
                        />
                      </div>
                      <div style={{ fontSize:10, color:sc, marginTop:2, fontWeight:600 }}>{lb}</div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </motion.div>

        {/* Quick actions */}
        <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.58,duration:0.5}}
          style={{ background:'var(--bg-card)', border:'1px solid var(--border-subtle)', borderRadius:16, padding:'18px 20px' }}
        >
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
            <div style={{ width:32, height:32, borderRadius:9, background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.22)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Zap style={{width:15,height:15,color:'#ef4444'}} />
            </div>
            <div>
              <h2 style={{ fontSize:13, fontWeight:700, color:'var(--text-primary)', marginBottom:1 }}>Ações Rápidas</h2>
              <p style={{ fontSize:11, color:'var(--text-muted)' }}>Atalhos para o que você mais usa</p>
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
            <QA to="/alunos/novo"   icon={Users}      label="Novo Aluno"  color="#6366f1" />
            <QA to="/treinos"       icon={Target}     label="Treino"      color="#22c55e" />
            <QA to="/ia"            icon={Zap}        label="IA Coach"    color="#eab308" />
            <QA to="/agenda"        icon={Calendar}   label="Agenda"      color="#f97316" />
            <QA to="/qr"            icon={Clock}      label="Check-in"    color="#14b8a6" />
            <QA to="/financeiro"    icon={DollarSign} label="Financeiro"  color="#10b981" />
          </div>
        </motion.div>
      </div>

      <div className="lg:hidden" style={{height:80}} />
    </div>
  )
}
