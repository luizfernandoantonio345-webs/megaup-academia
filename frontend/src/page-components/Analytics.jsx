import { useState } from 'react'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { analyticsResumo } from '../api'
import { useAuth } from '../contexts/AuthContext'
import { Users, Dumbbell, TrendingUp, DollarSign, Flame, Activity, BarChart2 } from 'lucide-react'

const PERIODOS = [
  { dias: 7,  label: '7d' },
  { dias: 30, label: '30d' },
  { dias: 90, label: '90d' },
]
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts'

const OBJETIVO_COLORS = {
  'Hipertrofia':   '#f87171',
  'Emagrecimento': '#34d399',
  'Força':         '#fbbf24',
  'Condicionamento':'#f9a8d4',
  'Não definido':  '#52525B',
}

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background:'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', boxShadow: '0 4px 12px rgba(0,0,0,0.4)' }}>
      {label && <p style={{ color:'var(--text-muted)', fontSize: 11, fontWeight: 500, marginBottom: 3 }}>{label}</p>}
      {payload.map(p => (
        <p key={p.dataKey} style={{ color: p.color || '#fca5a5', fontWeight: 600, fontSize: 14, margin: 0 }}>{p.value}</p>
      ))}
    </div>
  )
}

function StatCard({ icon: Icon, label, value, sub, color = '#ef4444' }) {
  return (
    <div style={{
      background:`radial-gradient(ellipse at 10% -20%, ${color}18 0%, transparent 55%), #111113`,
      border:`1px solid ${color}18`,
      borderRadius:20, padding:'20px 22px', position:'relative', overflow:'hidden',
      boxShadow:`inset 0 1px 0 rgba(255,255,255,0.05)`,
      transition:'transform 200ms ease, box-shadow 200ms ease',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow=`0 12px 32px -8px rgba(0,0,0,0.5), 0 0 0 1px ${color}22` }}
      onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow=`inset 0 1px 0 rgba(255,255,255,0.05)` }}
    >
      <div aria-hidden style={{ position:'absolute', top:-25, right:-15, width:90, height:90, borderRadius:'50%', background:`${color}0c`, filter:'blur(22px)', pointerEvents:'none' }} />
      <div style={{ width:34, height:34, borderRadius:10, background:`${color}14`, border:`1px solid ${color}22`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:14 }}>
        <Icon style={{ width:15, height:15, color }} />
      </div>
      <p style={{ fontSize:48, fontWeight:900, color:'#F4F4F5', letterSpacing:'-0.06em', lineHeight:1, marginBottom:8, textShadow:`0 0 40px ${color}50` }}>{value}</p>
      <p style={{ fontSize:12, color:'rgba(255,255,255,0.45)', fontWeight:600, marginBottom: sub ? 3 : 0 }}>{label}</p>
      {sub && <p style={{ fontSize:11, color:'rgba(255,255,255,0.28)' }}>{sub}</p>}
    </div>
  )
}

function Panel({ title, children }) {
  return (
    <div style={{ background:'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '18px 20px' }}>
      <p style={{ fontSize: 13, fontWeight: 600, color:'var(--text-primary)', marginBottom: 16 }}>{title}</p>
      {children}
    </div>
  )
}

export default function Analytics() {
  const { user } = useAuth()
  const [dias, setDias] = useState(7)

  const { data } = useQuery({
    queryKey: ['analytics-resumo', dias],
    queryFn: async () => (await analyticsResumo(dias)).data,
    staleTime: 5 * 60_000,
    placeholderData: keepPreviousData,
  })

  const d = data || {}
  const retencao = d.total_alunos > 0 ? Math.round((d.alunos_ativos_7d / d.total_alunos) * 100) : 0
  const treinosDia = (d.treinos_por_dia || []).map(r => ({ dia: r.dia.slice(5), total: r.total }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }} className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 600, color:'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 2 }}>Analytics</h1>
          <p style={{ fontSize: 13, color:'var(--text-muted)' }}>Visão geral do seu negócio</p>
        </div>
        <div style={{ display: 'flex', gap: 6, background:'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 4 }}>
          {PERIODOS.map(p => (
            <button key={p.dias} onClick={() => setDias(p.dias)} style={{
              padding: '5px 14px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600,
              background: dias === p.dias ? '#ef4444' : 'transparent',
              color: dias === p.dias ? 'white' : 'var(--text-muted)',
              transition: 'background 0.15s, color 0.15s',
            }}>{p.label}</button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(190px,1fr))', gap: 14 }}>
        <StatCard icon={Users}      color="#6366f1" label="Total de alunos"     value={d.total_alunos ?? '—'} />
        <StatCard icon={Activity}   color="#22c55e" label={`Ativos (${dias}d)`} value={d.alunos_ativos_7d ?? '—'} sub={`${retencao}% de retenção`} />
        <StatCard icon={TrendingUp} color="#f97316" label={`Inativos (${dias}d)`} value={d.alunos_inativos_7d ?? '—'} sub="sem treinar" />
        <StatCard icon={Dumbbell}   color="#ef4444" label={`Treinos (${dias}d)`} value={d.treinos_semana ?? '—'} />
        <StatCard icon={DollarSign} color="#34d399" label="Receita no mês"       value={`R$${(d.receita_mes ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`} />
      </div>

      <div className="rg-1-300" style={{ gap: 16 }}>
        {/* Treinos por dia */}
        <Panel title={`Treinos — últimos ${dias} dias`}>
          {treinosDia.length === 0 ? (
            <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ color:'var(--text-muted)', fontSize: 13 }}>Nenhum treino neste período</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={treinosDia} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 4" vertical={false} stroke="#1C1C1E" />
                <XAxis dataKey="dia" tick={{ fill:'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill:'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} />
                <Line type="monotone" dataKey="total" stroke="#ef4444" strokeWidth={2} dot={{ fill: '#ef4444', r: 2.5 }} activeDot={{ r: 4 }} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Panel>

        {/* Por objetivo */}
        <Panel title="Por objetivo">
          {(d.por_objetivo || []).length === 0 ? (
            <div style={{ height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ color:'var(--text-muted)', fontSize: 13 }}>Sem dados</p>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={130}>
                <PieChart>
                  <Pie data={d.por_objetivo} dataKey="n" nameKey="objetivo" cx="50%" cy="50%" outerRadius={60} isAnimationActive={false}>
                    {(d.por_objetivo || []).map((entry, i) => (
                      <Cell key={i} fill={OBJETIVO_COLORS[entry.objetivo] || '#52525B'} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 6 }}>
                {(d.por_objetivo || []).map(o => (
                  <div key={o.objetivo} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: OBJETIVO_COLORS[o.objetivo] || '#52525B', flexShrink: 0 }} />
                      <span style={{ fontSize: 12, color:'var(--text-muted)' }}>{o.objetivo}</span>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, color:'var(--text-secondary)' }}>{o.n}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </Panel>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Top exercícios */}
        <Panel title={`Exercícios mais realizados (${dias}d)`}>
          {(d.top_exercicios || []).length === 0 ? (
            <p style={{ color:'var(--text-muted)', fontSize: 13 }}>Nenhum dado ainda</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(d.top_exercicios || []).map((ex, i) => {
                const max = d.top_exercicios[0]?.n || 1
                return (
                  <div key={ex.nome}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 12, color:'var(--text-secondary)' }}>{ex.nome}</span>
                      <span style={{ fontSize: 11, color:'var(--text-muted)' }}>{ex.n}x</span>
                    </div>
                    <div style={{ height: 4, background:'var(--bg-elevated)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${(ex.n / max) * 100}%`, background: '#ef4444', borderRadius: 2, opacity: 0.6 + i * 0.06 }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Panel>

        {/* Top streaks */}
        <Panel title="Melhores streaks atuais">
          {(d.top_streak || []).length === 0 ? (
            <p style={{ color:'var(--text-muted)', fontSize: 13 }}>Nenhum aluno com streak ativo</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(d.top_streak || []).map((a, i) => (
                <div key={a.nome} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 22, height: 22, borderRadius: 6, background:'var(--bg-elevated)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: i === 0 ? '#fbbf24' : 'var(--text-muted)', flexShrink: 0 }}>
                    {i + 1}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 500, color:'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.nome}</p>
                    <p style={{ fontSize: 11, color:'var(--text-muted)' }}>Recorde: {a.streak_recorde}d</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)', borderRadius: 6, padding: '3px 8px' }}>
                    <Flame style={{ width: 12, height: 12, color: '#f97316' }} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#f97316' }}>{a.streak_atual}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </div>
  )
}

