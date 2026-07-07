import { useQuery } from '@tanstack/react-query'
import { listarAlunos, analyticsResumo } from '../api'
import { useAuth } from '../contexts/AuthContext'
import { Link } from 'react-router-dom'
import {
  Users, Dumbbell, UserPlus, ArrowRight,
  BarChart2, TrendingUp, Activity,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import OnboardingWizard from '../components/OnboardingWizard'
import { useCountUp } from '../hooks/useCountUp'

// Days of week in PT for the chart (executions by date → last 7 entries)
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', boxShadow: '0 4px 12px rgba(0,0,0,0.4)' }}>
      <p style={{ color: 'var(--text-muted)', fontSize: 11, fontWeight: 500, marginBottom: 3 }}>{label}</p>
      <p style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: 14, margin: 0 }}>
        {payload[0].value} treino{payload[0].value !== 1 ? 's' : ''}
      </p>
    </div>
  )
}

function Avatar({ nome, size = 32 }) {
  const initials = (nome || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'var(--bg-elevated)', border: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.38, fontWeight: 600, color: 'var(--text-secondary)', flexShrink: 0,
    }}>{initials}</div>
  )
}

function Kpi({ value, label, to }) {
  const num = typeof value === 'number' ? value : parseFloat(value)
  const counted = useCountUp(isNaN(num) ? 0 : num, 700)
  const display = isNaN(num) ? value : counted
  const inner = (
    <div style={{ padding: '16px 20px', borderRight: '1px solid var(--border-subtle)' }}>
      <p style={{ fontSize: 24, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1, marginBottom: 4 }}>{display}</p>
      <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{label}</p>
    </div>
  )
  return to
    ? <Link to={to} style={{ textDecoration: 'none', display: 'block' }}
        onMouseEnter={e => e.currentTarget.querySelector('p').style.color = '#818cf8'}
        onMouseLeave={e => e.currentTarget.querySelector('p').style.color='var(--text-primary)'}
      >{inner}</Link>
    : inner
}

function CardSkeleton({ height = 200 }) {
  return <div className="skeleton" style={{ borderRadius: 12, height }} />
}

export default function Dashboard() {
  const { user } = useAuth()

  const PD = (prev) => prev
  const { data: alunos = [], isLoading: la } = useQuery({
    queryKey: ['alunos'],
    queryFn: () => listarAlunos().then(r => r.data),
    staleTime: 5 * 60_000,
    placeholderData: PD,
  })

  // Analytics already aggregates everything the dashboard needs — no need to load all treinos
  const { data: analytics, isLoading: lan } = useQuery({
    queryKey: ['analytics-resumo', 7],
    queryFn: () => analyticsResumo(7).then(r => r.data),
    staleTime: 5 * 60_000,
    placeholderData: PD,
  })

  const hora = new Date().getHours()
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite'
  const recentAlunos = [...alunos].reverse().slice(0, 6)

  // Last 7 days of training activity from analytics
  const treinosDia = (analytics?.treinos_por_dia || []).slice(-7).map(r => ({
    dia: r.dia.slice(5), // "MM-DD"
    treinos: r.total,
  }))

  const totalTreinos = analytics?.treinos_semana ?? 0
  const totalAlunos = analytics?.total_alunos ?? alunos.length
  const ativos = analytics?.alunos_ativos_7d ?? 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, position: 'relative' }} className="animate-fade-in">
      {/* Subtle dot-grid pattern */}
      <svg aria-hidden style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', opacity: 0.018, pointerEvents: 'none', zIndex: 0 }}>
        <defs>
          <pattern id="dash-dotgrid" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
            <circle cx="1.5" cy="1.5" r="1.5" fill="currentColor"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dash-dotgrid)" style={{ color: 'var(--text-primary)' }}/>
      </svg>
      <OnboardingWizard />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 2 }}>
            {saudacao}, {user?.nome?.split(' ')[0]}
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <Link to="/convites" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <UserPlus style={{ width: 14, height: 14 }} />
          Adicionar aluno
        </Link>
      </div>

      {/* KPI strip — renders as soon as one query resolves */}
      <div className="kpi-strip">
        <Kpi value={la ? '…' : totalAlunos}   label="Alunos"        to="/alunos" />
        <Kpi value={lan ? '…' : totalTreinos} label="Treinos (7d)"  />
        <Kpi value={lan ? '…' : ativos}       label="Ativos (7d)"   />
        <Kpi value="Analytics"                label="Ver relatório"  to="/analytics" />
      </div>

      {/* Charts row */}
      <div className="rg-3-2" style={{ gap: 16 }}>
        {/* Bar chart */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Atividade — últimos 7 dias</h2>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Treinos executados por dia</p>
            </div>
            <Activity style={{ width: 15, height: 15, color: 'var(--text-disabled)' }} />
          </div>
          {lan ? (
            <CardSkeleton height={180} />
          ) : treinosDia.length === 0 ? (
            <div className="empty-state" style={{ padding: '32px 0' }}>
              <div className="empty-icon"><Dumbbell style={{ width: 16, height: 16, color: 'var(--text-disabled)' }} /></div>
              <p className="empty-title">Nenhuma execução ainda</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={treinosDia} barSize={22} margin={{ top: 2, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 4" vertical={false} stroke="#1C1C1E" />
                <XAxis dataKey="dia" tick={{ fontSize: 11, fill:'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill:'var(--text-muted)' }} axisLine={false} tickLine={false} allowDecimals={false} width={18} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)', radius: 4 }} />
                <Bar dataKey="treinos" radius={[4, 4, 2, 2]} fill="#6366f1" fillOpacity={0.8} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Overview */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Visão geral</h2>
            <TrendingUp style={{ width: 15, height: 15, color: 'var(--text-disabled)' }} />
          </div>
          {lan ? (
            <CardSkeleton height={140} />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { label: 'Total alunos',   value: totalAlunos, max: Math.max(totalAlunos, 10),  color: '#6366f1' },
                { label: 'Treinos (7d)',   value: totalTreinos, max: Math.max(totalTreinos, 20), color: '#4ade80' },
                { label: 'Alunos ativos', value: ativos,       max: Math.max(totalAlunos, 1),   color: '#60a5fa' },
              ].map(({ label, value, max, color }) => (
                <div key={label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{label}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>{value}</span>
                  </div>
                  <div className="progress-bar-track">
                    <div className="progress-bar-fill" style={{ width: `${Math.min(100, max > 0 ? (value / max) * 100 : 0)}%`, background: color }} />
                  </div>
                </div>
              ))}
            </div>
          )}
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border-subtle)' }}>
            <Link to="/convites" className="btn-secondary" style={{ width: '100%', justifyContent: 'center', display: 'flex', gap: 6 }}>
              <UserPlus style={{ width: 13, height: 13 }} />
              Convidar aluno
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        {/* Recent students */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Alunos recentes</h2>
            <Link to="/alunos" style={{ fontSize: 12, color: '#6366f1', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3, fontWeight: 500 }}>
              Ver todos <ArrowRight style={{ width: 12, height: 12 }} />
            </Link>
          </div>
          {la ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 40, borderRadius: 8 }} />
              ))}
            </div>
          ) : recentAlunos.length === 0 ? (
            <div className="empty-state" style={{ padding: '24px 0' }}>
              <div className="empty-icon"><Users style={{ width: 16, height: 16, color: 'var(--text-disabled)' }} /></div>
              <p className="empty-title">Nenhum aluno ainda</p>
              <Link to="/convites" className="btn-primary btn-sm">Enviar convite</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {recentAlunos.map((a, i) => (
                <Link key={a.id} to={`/alunos/${a.id}`}
                  className="stagger-item"
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', textDecoration: 'none', borderBottom: i < recentAlunos.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.75'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                  <Avatar nome={a.nome} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.nome}</div>
                    {a.objetivo && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{a.objetivo}</div>}
                  </div>
                  <ArrowRight style={{ width: 12, height: 12, color: 'var(--text-disabled)', flexShrink: 0 }} />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="card">
          <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 14px' }}>Ações rápidas</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {[
              { to: '/convites',   icon: UserPlus,   label: 'Enviar convite por e-mail'  },
              { to: '/exercicios', icon: Dumbbell,   label: 'Gerenciar exercícios'         },
              { to: '/ia',         icon: TrendingUp, label: 'Sugestões de progressão'      },
              { to: '/financeiro', icon: BarChart2,  label: 'Cobranças e planos'           },
            ].map(({ to, icon: Icon, label }) => (
              <Link key={to} to={to}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', borderRadius: 6, textDecoration: 'none', transition: 'background 0.1s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-elevated)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
              >
                <Icon style={{ width: 14, height: 14, color: 'var(--text-muted)', flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{label}</span>
                <ArrowRight style={{ width: 12, height: 12, color: 'var(--text-disabled)', flexShrink: 0, marginLeft: 'auto' }} />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
