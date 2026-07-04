import { useQuery } from '@tanstack/react-query'
import { analyticsResumo } from '../api'
import { useAuth } from '../contexts/AuthContext'
import {
  Users, Dumbbell, TrendingUp, DollarSign, Flame, Activity, BarChart2, Target,
} from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, Legend,
} from 'recharts'

const OBJETIVO_COLORS = {
  'Hipertrofia': '#818cf8',
  'Emagrecimento': '#34d399',
  'Força': '#fbbf24',
  'Condicionamento': '#f9a8d4',
  'Não definido': '#3D4F6A',
}

const DarkTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#141D30', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 10, padding: '10px 14px' }}>
      {label && <p style={{ color: '#4B5768', fontSize: 11, fontWeight: 700, marginBottom: 4 }}>{label}</p>}
      {payload.map(p => (
        <p key={p.dataKey} style={{ color: p.color || '#a5b4fc', fontWeight: 700, fontSize: 14, fontFamily: 'Space Grotesk, sans-serif', margin: 0 }}>
          {p.value}
        </p>
      ))}
    </div>
  )
}

function StatCard({ icon: Icon, color, bg, label, value, sub }) {
  return (
    <div style={{ background: '#0E1525', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: '22px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ width: 42, height: 42, borderRadius: 13, background: bg, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 16px ${color}20` }}>
          <Icon style={{ width: 20, height: 20, color }} />
        </div>
      </div>
      <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 32, fontWeight: 900, color: '#EFF6FF', letterSpacing: '-0.02em', lineHeight: 1, marginBottom: 6 }}>{value}</p>
      <p style={{ fontSize: 13, fontWeight: 700, color: '#94A3B8', marginBottom: sub ? 4 : 0 }}>{label}</p>
      {sub && <p style={{ fontSize: 12, color: '#3D4F6A' }}>{sub}</p>}
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
      <div style={{ padding: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 16 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={{ background: '#0E1525', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 20, padding: 24, height: 120, animation: 'pulse 1.5s infinite' }} />
          ))}
        </div>
      </div>
    )
  }

  const d = data || {}
  const retencao = d.total_alunos > 0 ? Math.round((d.alunos_ativos_7d / d.total_alunos) * 100) : 0

  // Formata dias para exibição curta
  const treinosDia = (d.treinos_por_dia || []).map(r => ({
    dia: r.dia.slice(5),  // MM-DD
    total: r.total,
  })).slice(-14)  // últimos 14 dias

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BarChart2 style={{ width: 22, height: 22, color: '#818cf8' }} />
          </div>
          <div>
            <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 22, fontWeight: 900, color: '#EFF6FF', letterSpacing: '-0.02em' }}>Analytics</h1>
            <p style={{ fontSize: 13, color: '#4B5768' }}>Visão geral do seu negócio</p>
          </div>
        </div>
      </div>

      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 16 }}>
        <StatCard icon={Users}     color="#818cf8" bg="rgba(129,140,248,0.12)" label="Total de alunos"        value={d.total_alunos ?? '—'} />
        <StatCard icon={Activity}  color="#34d399" bg="rgba(52,211,153,0.12)"  label="Ativos (7 dias)"        value={d.alunos_ativos_7d ?? '—'} sub={`${retencao}% de retenção`} />
        <StatCard icon={TrendingUp} color="#f97316" bg="rgba(249,115,22,0.12)" label="Inativos (7 dias)"      value={d.alunos_inativos_7d ?? '—'} sub="sem treinar" />
        <StatCard icon={Dumbbell}  color="#38bdf8" bg="rgba(56,189,248,0.12)"  label="Treinos esta semana"    value={d.treinos_semana ?? '—'} />
        <StatCard icon={DollarSign} color="#fbbf24" bg="rgba(251,191,36,0.12)" label="Receita no mês"         value={`R$${(d.receita_mes ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
        {/* Treinos por dia */}
        <div style={{ background: '#0E1525', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: '22px 24px' }}>
          <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 15, fontWeight: 800, color: '#EFF6FF', marginBottom: 20 }}>Treinos — últimos 14 dias</p>
          {treinosDia.length === 0 ? (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ color: '#3D4F6A', fontSize: 13 }}>Nenhum treino registrado neste período</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={treinosDia} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="dia" tick={{ fill: '#3D4F6A', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#3D4F6A', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<DarkTooltip />} />
                <Line type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={2.5} dot={{ fill: '#6366f1', r: 3 }} activeDot={{ r: 5 }} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Distribuição por objetivo */}
        <div style={{ background: '#0E1525', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: '22px 24px' }}>
          <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 15, fontWeight: 800, color: '#EFF6FF', marginBottom: 20 }}>Por objetivo</p>
          {(d.por_objetivo || []).length === 0 ? (
            <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ color: '#3D4F6A', fontSize: 13 }}>Sem dados</p>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={d.por_objetivo} dataKey="n" nameKey="objetivo" cx="50%" cy="50%" outerRadius={70} isAnimationActive={false}>
                    {(d.por_objetivo || []).map((entry, i) => (
                      <Cell key={i} fill={OBJETIVO_COLORS[entry.objetivo] || '#4B5768'} />
                    ))}
                  </Pie>
                  <Tooltip content={<DarkTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                {(d.por_objetivo || []).map(o => (
                  <div key={o.objetivo} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 3, background: OBJETIVO_COLORS[o.objetivo] || '#4B5768', flexShrink: 0 }} />
                      <span style={{ fontSize: 12, color: '#4B5768' }}>{o.objetivo}</span>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8' }}>{o.n}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Top exercícios */}
        <div style={{ background: '#0E1525', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: '22px 24px' }}>
          <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 15, fontWeight: 800, color: '#EFF6FF', marginBottom: 20 }}>Exercícios mais realizados (30d)</p>
          {(d.top_exercicios || []).length === 0 ? (
            <p style={{ color: '#3D4F6A', fontSize: 13 }}>Nenhum dado ainda</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(d.top_exercicios || []).map((ex, i) => {
                const max = d.top_exercicios[0]?.n || 1
                return (
                  <div key={ex.nome}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 13, color: '#94A3B8', fontWeight: 600 }}>{ex.nome}</span>
                      <span style={{ fontSize: 12, color: '#4B5768' }}>{ex.n}x</span>
                    </div>
                    <div style={{ height: 5, background: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${(ex.n / max) * 100}%`, background: `hsl(${240 - i * 20}, 70%, 60%)`, borderRadius: 3 }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Top streaks */}
        <div style={{ background: '#0E1525', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: '22px 24px' }}>
          <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 15, fontWeight: 800, color: '#EFF6FF', marginBottom: 20 }}>Melhores streaks atuais</p>
          {(d.top_streak || []).length === 0 ? (
            <p style={{ color: '#3D4F6A', fontSize: 13 }}>Nenhum aluno com streak ativo</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {(d.top_streak || []).map((a, i) => (
                <div key={a.nome} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 10, background: i === 0 ? 'rgba(251,191,36,0.15)' : 'rgba(255,255,255,0.05)', border: `1px solid ${i === 0 ? 'rgba(251,191,36,0.3)' : 'rgba(255,255,255,0.06)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 900, color: i === 0 ? '#fbbf24' : '#3D4F6A', flexShrink: 0 }}>
                    {i + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#EFF6FF' }}>{a.nome}</p>
                    <p style={{ fontSize: 12, color: '#4B5768' }}>Recorde: {a.streak_recorde} dias</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.2)', borderRadius: 10, padding: '4px 10px' }}>
                    <Flame style={{ width: 13, height: 13, color: '#f97316' }} />
                    <span style={{ fontSize: 13, fontWeight: 800, color: '#f97316' }}>{a.streak_atual}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
