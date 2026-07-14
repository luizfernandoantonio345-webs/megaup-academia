import { useQuery } from '@tanstack/react-query'
import { listarAlunos, analyticsResumo } from '../api'
import { useAuth } from '../contexts/AuthContext'
import { Link } from 'react-router-dom'
import {
  Users, Dumbbell, UserPlus, ArrowRight,
  BarChart2, TrendingUp, Activity, AlertTriangle, Zap,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts'
import OnboardingWizard from '../components/OnboardingWizard'
import { useCountUp } from '../hooks/useCountUp'
import { motion } from 'framer-motion'

/* ── color helpers ──────────────────────────────────────────────────── */
const ALPHA = {
  A:'#6366f1',B:'#ec4899',C:'#f97316',D:'#22c55e',E:'#a855f7',F:'#06b6d4',
  G:'#E8342B',H:'#eab308',I:'#14b8a6',J:'#8b5cf6',K:'#f43f5e',L:'#10b981',
  M:'#3b82f6',N:'#fb923c',O:'#84cc16',P:'#e879f9',Q:'#2dd4bf',R:'#f472b6',
  S:'#38bdf8',T:'#4ade80',U:'#fbbf24',V:'#818cf8',W:'#34d399',X:'#FF8078',
  Y:'#a78bfa',Z:'#60a5fa',
}
const nameColor = n => ALPHA[(n || 'A')[0].toUpperCase()] ?? '#6366f1'
const getInits  = n => (n?.split(' ').filter(Boolean).slice(0,2).map(w=>w[0]).join('') || '??').toUpperCase()

/* ── Avatar ─────────────────────────────────────────────────────────── */
function Avatar({ nome, size = 38 }) {
  const c = nameColor(nome)
  return (
    <div style={{
      width:size, height:size, borderRadius:'50%',
      background:`${c}15`, border:`1.5px solid ${c}28`,
      display:'flex', alignItems:'center', justifyContent:'center',
      fontSize:size*0.34, fontWeight:900, color:c, flexShrink:0,
      letterSpacing:'-0.01em',
    }}>{getInits(nome)}</div>
  )
}

/* ── Custom chart tooltip ────────────────────────────────────────────── */
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background:'rgba(15,15,17,0.97)', border:'1px solid rgba(232,52,43,0.25)', borderRadius:12, padding:'8px 14px', boxShadow:'0 8px 24px rgba(0,0,0,0.5)' }}>
      <p style={{ color:'rgba(255,255,255,0.38)', fontSize:11, fontWeight:600, marginBottom:3 }}>{label}</p>
      <p style={{ color:'#F4F4F5', fontWeight:800, fontSize:16, margin:0, letterSpacing:'-0.02em' }}>
        {payload[0].value} treino{payload[0].value !== 1 ? 's' : ''}
      </p>
    </div>
  )
}

/* ── Big KPI card ────────────────────────────────────────────────────── */
function KpiCard({ value, label, color, icon: Icon, to, delay = 0 }) {
  const num = typeof value === 'number' ? value : parseFloat(value)
  const counted = useCountUp(isNaN(num) ? 0 : num, 900)
  const display = isNaN(num) ? value : counted

  const inner = (
    <motion.div
      initial={{ opacity:0, y:18 }}
      animate={{ opacity:1, y:0 }}
      transition={{ delay, duration:0.5, ease:[0.16,1,0.3,1] }}
      style={{
        background:`radial-gradient(ellipse at 10% -20%, ${color}22 0%, transparent 55%), #111113`,
        border:`1px solid ${color}18`,
        borderRadius:20,
        padding:'20px 22px',
        position:'relative', overflow:'hidden',
        boxShadow:`inset 0 1px 0 rgba(255,255,255,0.05)`,
        transition:'transform 200ms ease, box-shadow 200ms ease, border-color 200ms ease',
      }}
      whileHover={{ y:-3, boxShadow:`0 14px 36px -8px rgba(0,0,0,0.5), 0 0 0 1px ${color}28` }}
    >
      {/* Ambient orb */}
      <div style={{ position:'absolute', top:-30, right:-20, width:110, height:110, borderRadius:'50%', background:`${color}0d`, filter:'blur(28px)', pointerEvents:'none' }} />

      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:14 }}>
        <div style={{ width:36, height:36, borderRadius:11, background:`${color}14`, border:`1px solid ${color}22`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <Icon style={{ width:16, height:16, color }} />
        </div>
        {to && <ArrowRight style={{ width:13, height:13, color:'rgba(255,255,255,0.2)' }} />}
      </div>

      <div style={{ fontSize:56, fontWeight:900, color:'#F4F4F5', lineHeight:1, letterSpacing:'-0.06em', marginBottom:6, textShadow:`0 0 48px ${color}50` }}>
        {display}
      </div>
      <div style={{ fontSize:12, color:'rgba(255,255,255,0.4)', fontWeight:600, letterSpacing:'0.01em' }}>{label}</div>
    </motion.div>
  )

  return to
    ? <Link to={to} style={{ textDecoration:'none', display:'block' }}>{inner}</Link>
    : inner
}

/* ── Quick action row ────────────────────────────────────────────────── */
const ACTIONS = [
  { to:'/convites',   icon:UserPlus,   label:'Convidar aluno',      color:'#E8342B' },
  { to:'/exercicios', icon:Dumbbell,   label:'Exercícios',          color:'#6366f1' },
  { to:'/ia',         icon:Zap,        label:'Progressão IA',       color:'#f97316' },
  { to:'/financeiro', icon:BarChart2,  label:'Financeiro',          color:'#22c55e' },
]

export default function Dashboard() {
  const { user } = useAuth()

  const PD = prev => prev
  const { data: alunos = [], isLoading: la } = useQuery({
    queryKey: ['alunos'],
    queryFn: () => listarAlunos().then(r => r.data),
    staleTime: 5 * 60_000,
    placeholderData: PD,
  })

  const { data: analytics, isLoading: lan } = useQuery({
    queryKey: ['analytics-resumo', 7],
    queryFn: () => analyticsResumo(7).then(r => r.data),
    staleTime: 5 * 60_000,
    placeholderData: PD,
  })

  const hora = new Date().getHours()
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite'
  const recentAlunos = [...alunos].reverse().slice(0, 6)

  const treinosDia = (analytics?.treinos_por_dia || []).slice(-7).map(r => ({
    dia: r.dia.slice(5),
    treinos: r.total,
  }))

  const totalTreinos = analytics?.treinos_semana ?? 0
  const totalAlunos  = analytics?.total_alunos ?? alunos.length
  const ativos       = analytics?.alunos_ativos_7d ?? 0
  const maxBar       = Math.max(...treinosDia.map(d => d.treinos), 1)

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:18, position:'relative' }} className="animate-fade-in">
      <OnboardingWizard />

      {/* ── HEADER ──────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity:0, y:-14 }} animate={{ opacity:1, y:0 }}
        transition={{ duration:0.5, ease:[0.16,1,0.3,1] }}
        style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:16, flexWrap:'wrap' }}
      >
        <div>
          <h1 style={{ fontSize:'clamp(24px,4vw,34px)', fontWeight:900, color:'#F4F4F5', letterSpacing:'-0.055em', lineHeight:1.05, marginBottom:5 }}>
            {saudacao},{' '}
            <span style={{ color:'#E8342B', textShadow:'0 0 32px rgba(232,52,43,0.45)' }}>
              {user?.nome?.split(' ')[0]}
            </span>
          </h1>
          <p style={{ fontSize:13, color:'rgba(255,255,255,0.35)', fontWeight:500 }}>
            {new Date().toLocaleDateString('pt-BR', { weekday:'long', day:'numeric', month:'long' })}
          </p>
        </div>
        <Link to="/convites" style={{
          display:'inline-flex', alignItems:'center', gap:7,
          background:'linear-gradient(135deg,#E8342B,#C8291F)', color:'white',
          border:'none', borderRadius:13, padding:'10px 18px',
          fontWeight:800, fontSize:13, textDecoration:'none', letterSpacing:'-0.01em',
          boxShadow:'0 4px 18px rgba(232,52,43,0.38)',
          transition:'transform 150ms ease, box-shadow 150ms ease',
        }}
          onMouseEnter={e => { e.currentTarget.style.transform='translateY(-1px)'; e.currentTarget.style.boxShadow='0 8px 28px rgba(232,52,43,0.5)' }}
          onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 4px 18px rgba(232,52,43,0.38)' }}
        >
          <UserPlus style={{ width:15, height:15 }} />
          Novo aluno
        </Link>
      </motion.div>

      {/* ── KPI BENTO GRID ──────────────────────────────────────────── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:12 }}>
        <KpiCard value={la  ? '…' : totalAlunos}   label="Total de alunos"    color="#6366f1" icon={Users}      to="/alunos"    delay={0.04} />
        <KpiCard value={lan ? '…' : totalTreinos}  label="Treinos esta semana" color="#E8342B" icon={Activity}   delay={0.08} />
        <KpiCard value={lan ? '…' : ativos}         label="Alunos ativos (7d)" color="#22c55e" icon={TrendingUp}  delay={0.12} />
        <KpiCard value={lan ? '…' : (analytics?.risco_abandono?.length ?? 0)} label="Em risco de abandono" color="#f97316" icon={AlertTriangle} to="/inativos" delay={0.16} />
      </div>

      {/* ── CHARTS ROW ──────────────────────────────────────────────── */}
      <div className="rg-3-2" style={{ gap:12 }}>
        {/* Activity bar chart */}
        <motion.div
          initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
          transition={{ delay:0.2, duration:0.5, ease:[0.16,1,0.3,1] }}
          style={{ background:'#141416', border:'1px solid rgba(255,255,255,0.07)', borderRadius:22, padding:'22px 20px', boxShadow:'inset 0 1px 0 rgba(255,255,255,0.05)' }}
        >
          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:20 }}>
            <div>
              <h2 style={{ fontSize:15, fontWeight:800, color:'#F4F4F5', letterSpacing:'-0.035em', marginBottom:3 }}>Atividade</h2>
              <p style={{ fontSize:12, color:'rgba(255,255,255,0.35)' }}>Treinos executados — últimos 7 dias</p>
            </div>
            <div style={{ width:34, height:34, borderRadius:10, background:'rgba(232,52,43,0.1)', border:'1px solid rgba(232,52,43,0.18)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Activity style={{ width:15, height:15, color:'#E8342B' }} />
            </div>
          </div>
          {lan ? (
            <div className="skeleton" style={{ height:180, borderRadius:12 }} />
          ) : treinosDia.length === 0 ? (
            <div style={{ height:180, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:10 }}>
              <div style={{ width:48, height:48, borderRadius:16, background:'rgba(232,52,43,0.08)', border:'1px solid rgba(232,52,43,0.15)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Dumbbell style={{ width:18, height:18, color:'#E8342B' }} />
              </div>
              <p style={{ fontSize:13, color:'rgba(255,255,255,0.35)', fontWeight:600 }}>Nenhuma execução ainda</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={treinosDia} barSize={24} margin={{ top:2, right:4, left:-20, bottom:0 }}>
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#E8342B" stopOpacity={0.95} />
                    <stop offset="100%" stopColor="#C8291F" stopOpacity={0.55} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 4" vertical={false} stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="dia" tick={{ fontSize:11, fill:'rgba(255,255,255,0.32)', fontWeight:500 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize:11, fill:'rgba(255,255,255,0.32)' }} axisLine={false} tickLine={false} allowDecimals={false} width={18} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill:'rgba(255,255,255,0.025)', radius:6 }} />
                <Bar dataKey="treinos" radius={[6,6,2,2]} fill="url(#barGrad)" isAnimationActive={false}>
                  {treinosDia.map((entry, i) => (
                    <Cell key={i} fillOpacity={entry.treinos === maxBar ? 1 : 0.65} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Overview progress bars */}
        <motion.div
          initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
          transition={{ delay:0.25, duration:0.5, ease:[0.16,1,0.3,1] }}
          style={{ background:'#141416', border:'1px solid rgba(255,255,255,0.07)', borderRadius:22, padding:'22px 20px', display:'flex', flexDirection:'column', boxShadow:'inset 0 1px 0 rgba(255,255,255,0.05)' }}
        >
          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:20 }}>
            <div>
              <h2 style={{ fontSize:15, fontWeight:800, color:'#F4F4F5', letterSpacing:'-0.035em', marginBottom:3 }}>Visão geral</h2>
              <p style={{ fontSize:12, color:'rgba(255,255,255,0.35)' }}>Métricas principais</p>
            </div>
            <div style={{ width:34, height:34, borderRadius:10, background:'rgba(99,102,241,0.1)', border:'1px solid rgba(99,102,241,0.18)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <TrendingUp style={{ width:15, height:15, color:'#818cf8' }} />
            </div>
          </div>
          {lan ? (
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              {[0,1,2].map(i => <div key={i} className="skeleton" style={{ height:44, borderRadius:12 }} />)}
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:18, flex:1, justifyContent:'center' }}>
              {[
                { label:'Total alunos',    value:totalAlunos,  max:Math.max(totalAlunos,10),   color:'#6366f1' },
                { label:'Treinos (7d)',    value:totalTreinos, max:Math.max(totalTreinos,20),  color:'#E8342B' },
                { label:'Alunos ativos',  value:ativos,       max:Math.max(totalAlunos,1),    color:'#22c55e' },
              ].map(({ label, value, max, color }) => (
                <div key={label}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                    <span style={{ fontSize:12, color:'rgba(255,255,255,0.45)', fontWeight:600 }}>{label}</span>
                    <span style={{ fontSize:14, fontWeight:900, color, letterSpacing:'-0.02em', textShadow:`0 0 18px ${color}60` }}>{value}</span>
                  </div>
                  <div style={{ height:5, background:'rgba(255,255,255,0.05)', borderRadius:999, overflow:'hidden' }}>
                    <div style={{
                      height:'100%', borderRadius:999,
                      width:`${Math.min(100, max > 0 ? (value/max)*100 : 0)}%`,
                      background:`linear-gradient(90deg,${color}cc,${color})`,
                      boxShadow:`0 0 8px ${color}50`,
                      transition:'width 0.8s cubic-bezier(0.16,1,0.3,1)',
                    }} />
                  </div>
                </div>
              ))}
            </div>
          )}
          <div style={{ marginTop:20, paddingTop:16, borderTop:'1px solid rgba(255,255,255,0.05)' }}>
            <Link to="/convites" style={{
              width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:6,
              background:'rgba(232,52,43,0.07)', border:'1px solid rgba(232,52,43,0.18)',
              borderRadius:12, padding:'10px 0', color:'#FF8078', fontWeight:700, fontSize:13,
              textDecoration:'none', transition:'all 0.15s',
            }}
              onMouseEnter={e => e.currentTarget.style.background='rgba(232,52,43,0.12)'}
              onMouseLeave={e => e.currentTarget.style.background='rgba(232,52,43,0.07)'}
            >
              <UserPlus style={{ width:13, height:13 }} />
              Convidar aluno
            </Link>
          </div>
        </motion.div>
      </div>

      {/* ── BOTTOM ROW ──────────────────────────────────────────────── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:12 }}>
        {/* Recent students */}
        <motion.div
          initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
          transition={{ delay:0.3, duration:0.5, ease:[0.16,1,0.3,1] }}
          style={{ background:'#141416', border:'1px solid rgba(255,255,255,0.07)', borderRadius:22, padding:'22px 20px', boxShadow:'inset 0 1px 0 rgba(255,255,255,0.05)' }}
        >
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
            <h2 style={{ fontSize:15, fontWeight:800, color:'#F4F4F5', letterSpacing:'-0.035em' }}>Alunos recentes</h2>
            <Link to="/alunos" style={{ fontSize:12, color:'#FF8078', textDecoration:'none', display:'flex', alignItems:'center', gap:3, fontWeight:700 }}>
              Ver todos <ArrowRight style={{ width:12, height:12 }} />
            </Link>
          </div>
          {la ? (
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {[0,1,2,3].map(i => <div key={i} className="skeleton" style={{ height:46, borderRadius:12 }} />)}
            </div>
          ) : recentAlunos.length === 0 ? (
            <div style={{ padding:'32px 0', textAlign:'center' }}>
              <div style={{ width:48, height:48, borderRadius:16, background:'rgba(232,52,43,0.08)', border:'1px solid rgba(232,52,43,0.15)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 12px' }}>
                <Users style={{ width:18, height:18, color:'#E8342B' }} />
              </div>
              <p style={{ fontSize:13, fontWeight:700, color:'rgba(255,255,255,0.6)', marginBottom:12 }}>Nenhum aluno ainda</p>
              <Link to="/convites" style={{ display:'inline-flex', alignItems:'center', gap:6, background:'linear-gradient(135deg,#E8342B,#C8291F)', color:'white', borderRadius:10, padding:'8px 16px', fontWeight:700, fontSize:12, textDecoration:'none' }}>
                <UserPlus style={{ width:13, height:13 }} /> Enviar convite
              </Link>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column' }}>
              {recentAlunos.map((a, i) => {
                const c = nameColor(a.nome)
                return (
                  <Link key={a.id} to={`/alunos/${a.id}`} style={{
                    display:'flex', alignItems:'center', gap:11, padding:'10px 0',
                    textDecoration:'none',
                    borderBottom: i < recentAlunos.length-1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                    transition:'opacity 0.15s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.opacity='0.72'}
                    onMouseLeave={e => e.currentTarget.style.opacity='1'}
                  >
                    <div style={{ position:'relative', flexShrink:0 }}>
                      <Avatar nome={a.nome} size={36} />
                      <div style={{ position:'absolute', bottom:0, right:0, width:9, height:9, borderRadius:'50%', background:a.ativo!==false?'#22c55e':'#f97316', border:'1.5px solid #111113', boxShadow:`0 0 5px ${a.ativo!==false?'#22c55e':'#f97316'}` }} />
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:13, fontWeight:800, color:'#F4F4F5', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', letterSpacing:'-0.01em' }}>{a.nome}</div>
                      {a.objetivo && <div style={{ fontSize:11, color:'rgba(255,255,255,0.32)', marginTop:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{a.objetivo}</div>}
                    </div>
                    <ArrowRight style={{ width:12, height:12, color:'rgba(255,255,255,0.18)', flexShrink:0 }} />
                  </Link>
                )
              })}
            </div>
          )}
        </motion.div>

        {/* Quick actions */}
        <motion.div
          initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
          transition={{ delay:0.34, duration:0.5, ease:[0.16,1,0.3,1] }}
          style={{ background:'#141416', border:'1px solid rgba(255,255,255,0.07)', borderRadius:22, padding:'22px 20px', boxShadow:'inset 0 1px 0 rgba(255,255,255,0.05)' }}
        >
          <h2 style={{ fontSize:15, fontWeight:800, color:'#F4F4F5', letterSpacing:'-0.035em', marginBottom:14 }}>Ações rápidas</h2>
          <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
            {ACTIONS.map(({ to, icon:Icon, label, color }) => (
              <Link key={to} to={to} style={{
                display:'flex', alignItems:'center', gap:11,
                padding:'11px 12px', borderRadius:13, textDecoration:'none',
                transition:'background 0.15s', border:'1px solid transparent',
              }}
                onMouseEnter={e => { e.currentTarget.style.background='rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.06)' }}
                onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.borderColor='transparent' }}
              >
                <div style={{ width:34, height:34, borderRadius:10, background:`${color}10`, border:`1px solid ${color}1e`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <Icon style={{ width:15, height:15, color }} />
                </div>
                <span style={{ fontSize:13, fontWeight:700, color:'rgba(255,255,255,0.72)', letterSpacing:'-0.01em' }}>{label}</span>
                <ArrowRight style={{ width:12, height:12, color:'rgba(255,255,255,0.18)', flexShrink:0, marginLeft:'auto' }} />
              </Link>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── CHURN RISK PANEL ────────────────────────────────────────── */}
      {!lan && analytics?.risco_abandono?.length > 0 && (
        <motion.div
          initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
          transition={{ delay:0.38, duration:0.5, ease:[0.16,1,0.3,1] }}
          style={{ background:'radial-gradient(ellipse at 0% 0%, rgba(249,115,22,0.09) 0%, transparent 55%), #111113', border:'1px solid rgba(249,115,22,0.18)', borderRadius:22, padding:'22px 20px', boxShadow:'inset 0 1px 0 rgba(255,255,255,0.04)' }}
        >
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
            <div style={{ display:'flex', alignItems:'center', gap:9 }}>
              <div style={{ width:34, height:34, borderRadius:10, background:'rgba(249,115,22,0.1)', border:'1px solid rgba(249,115,22,0.2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <AlertTriangle style={{ width:15, height:15, color:'#fb923c' }} />
              </div>
              <div>
                <h2 style={{ fontSize:15, fontWeight:800, color:'#F4F4F5', letterSpacing:'-0.035em' }}>Risco de abandono</h2>
                <p style={{ fontSize:11, color:'rgba(255,255,255,0.35)' }}>{analytics.risco_abandono.length} aluno{analytics.risco_abandono.length!==1?'s':''} em alerta</p>
              </div>
            </div>
            <Link to="/inativos" style={{ fontSize:12, color:'#fb923c', textDecoration:'none', display:'flex', alignItems:'center', gap:3, fontWeight:700 }}>
              Ver todos <ArrowRight style={{ width:12, height:12 }} />
            </Link>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
            {analytics.risco_abandono.map((a, i) => {
              const scoreColor = a.score >= 8 ? '#FF8078' : a.score >= 5 ? '#fb923c' : '#fbbf24'
              return (
                <Link key={a.id} to={`/alunos/${a.id}`} style={{
                  display:'flex', alignItems:'center', gap:11, padding:'9px 0',
                  textDecoration:'none',
                  borderBottom: i < analytics.risco_abandono.length-1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                }}
                  onMouseEnter={e => e.currentTarget.style.opacity='0.72'}
                  onMouseLeave={e => e.currentTarget.style.opacity='1'}
                >
                  <Avatar nome={a.nome} size={34} />
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                      <span style={{ fontSize:13, fontWeight:800, color:'#F4F4F5', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', letterSpacing:'-0.01em' }}>{a.nome}</span>
                      <span style={{ fontSize:11, fontWeight:700, color:scoreColor, flexShrink:0, marginLeft:8, textShadow:`0 0 12px ${scoreColor}70` }}>
                        {a.dias_inativo === 999 ? 'Nunca treinou' : `${a.dias_inativo}d sem treinar`}
                      </span>
                    </div>
                    <div style={{ height:4, background:'rgba(255,255,255,0.05)', borderRadius:999, overflow:'hidden' }}>
                      <div style={{ height:'100%', width:`${(a.score/10)*100}%`, background:`linear-gradient(90deg,${scoreColor}99,${scoreColor})`, borderRadius:999, boxShadow:`0 0 6px ${scoreColor}50` }} />
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </motion.div>
      )}
    </div>
  )
}
