import { useQuery } from '@tanstack/react-query'
import { analyticsResumo } from '../api'
import { useAuth } from '../contexts/AuthContext'
import { Users, Dumbbell, TrendingUp, DollarSign, Flame, Activity, BarChart2 } from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts'

const OBJETIVO_COLORS = {
  'Hipertrofia':   '#818cf8',
  'Emagrecimento': '#34d399',
  'Força':         '#fbbf24',
  'Condicionamento':'#f9a8d4',
  'Não definido':  '#52525B',
}

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#1C1C1E', border: '1px solid #27272A', borderRadius: 8, padding: '8px 12px', boxShadow: '0 4px 12px rgba(0,0,0,0.4)' }}>
      {label && <p style={{ color: '#71717A', fontSize: 11, fontWeight: 500, marginBottom: 3 }}>{label}</p>}
      {payload.map(p => (
        <p key={p.dataKey} style={{ color: p.color || '#a5b4fc', fontWeight: 600, fontSize: 14, margin: 0 }}>{p.value}</p>
      ))}
    </div>
  )
}

function StatCard({ icon: Icon, label, value, sub }) {
  return (
    <div style={{ background: '#111113', border: '1px solid #27272A', borderRadius: 12, padding: '18px 20px' }}>
      <Icon style={{ width: 15, height: 15, color: '#52525B', marginBottom: 14, display: 'block' }} />
      <p style={{ fontSize: 26, fontWeight: 600, color: '#F4F4F5', letterSpacing: '-0.03em', lineHeight: 1, marginBottom: 5 }}>{value}</p>
      <p style={{ fontSize: 12, color: '#A1A1AA', marginBottom: sub ? 3 : 0 }}>{label}</p>
      {sub && <p style={{ fontSize: 11, color: '#71717A' }}>{sub}</p>}
    </div>
  )
}

function Panel({ title, children }) {
  return (
    <div style={{ background: '#111113', border: '1px solid #27272A', borderRadius: 12, padding: '18px 20px' }}>
      <p style={{ fontSize: 13, fontWeight: 600, color: '#F4F4F5', marginBottom: 16 }}>{title}</p>
      {children}
    </div>
  )
}

export default function Analytics() {
  const { user } = useAuth()
  const { data, isLoading } = useQuery({
    queryKey: ['analytics-resumo'],
    queryFn: async () => (await analyticsResumo()).data,
    staleTime: 60_000,
  })

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 14 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ borderRadius: 12, height: 110 }} />
          ))}
        </div>
      </div>
    )
  }

  const d = data || {}
  const retencao = d.total_alunos > 0 ? Math.round((d.alunos_ativos_7d / d.total_alunos) * 100) : 0
  const treinosDia = (d.treinos_por_dia || []).map(r => ({ dia: r.dia.slice(5), total: r.total })).slice(-14)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }} className="animate-fade-in">
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 18, fontWeight: 600, color: '#F4F4F5', letterSpacing: '-0.02em', marginBottom: 2 }}>Analytics</h1>
        <p style={{ fontSize: 13, color: '#71717A' }}>Visão geral do seu negócio</p>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(190px,1fr))', gap: 14 }}>
        <StatCard icon={Users}      label="Total de alunos"     value={d.total_alunos ?? '—'} />
        <StatCard icon={Activity}   label="Ativos (7 dias)"     value={d.alunos_ativos_7d ?? '—'} sub={`${retencao}% de retenção`} />
        <StatCard icon={TrendingUp} label="Inativos (7 dias)"   value={d.alunos_inativos_7d ?? '—'} sub="sem treinar" />
        <StatCard icon={Dumbbell}   label="Treinos esta semana" value={d.treinos_semana ?? '—'} />
        <StatCard icon={DollarSign} label="Receita no mês"      value={`R$${(d.receita_mes ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16 }}>
        {/* Treinos por dia */}
        <Panel title="Treinos — últimos 14 dias">
          {treinosDia.length === 0 ? (
            <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ color: '#71717A', fontSize: 13 }}>Nenhum treino neste período</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={treinosDia} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 4" vertical={false} stroke="#1C1C1E" />
                <XAxis dataKey="dia" tick={{ fill: '#71717A', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#71717A', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} />
                <Line type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1', r: 2.5 }} activeDot={{ r: 4 }} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Panel>

        {/* Por objetivo */}
        <Panel title="Por objetivo">
          {(d.por_objetivo || []).length === 0 ? (
            <div style={{ height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ color: '#71717A', fontSize: 13 }}>Sem dados</p>
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
                      <span style={{ fontSize: 12, color: '#71717A' }}>{o.objetivo}</span>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#A1A1AA' }}>{o.n}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </Panel>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Top exercícios */}
        <Panel title="Exercícios mais realizados (30d)">
          {(d.top_exercicios || []).length === 0 ? (
            <p style={{ color: '#71717A', fontSize: 13 }}>Nenhum dado ainda</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(d.top_exercicios || []).map((ex, i) => {
                const max = d.top_exercicios[0]?.n || 1
                return (
                  <div key={ex.nome}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 12, color: '#A1A1AA' }}>{ex.nome}</span>
                      <span style={{ fontSize: 11, color: '#71717A' }}>{ex.n}x</span>
                    </div>
                    <div style={{ height: 4, background: '#1C1C1E', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${(ex.n / max) * 100}%`, background: '#6366f1', borderRadius: 2, opacity: 0.6 + i * 0.06 }} />
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
            <p style={{ color: '#71717A', fontSize: 13 }}>Nenhum aluno com streak ativo</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(d.top_streak || []).map((a, i) => (
                <div key={a.nome} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 22, height: 22, borderRadius: 6, background: '#1C1C1E', border: '1px solid #27272A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: i === 0 ? '#fbbf24' : '#71717A', flexShrink: 0 }}>
                    {i + 1}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 500, color: '#F4F4F5', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.nome}</p>
                    <p style={{ fontSize: 11, color: '#71717A' }}>Recorde: {a.streak_recorde}d</p>
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
