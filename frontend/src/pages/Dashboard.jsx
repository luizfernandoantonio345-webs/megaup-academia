import { useQuery } from '@tanstack/react-query'
import { listarAlunos, listarTreinos } from '../api'
import { useAuth } from '../contexts/AuthContext'
import { Link } from 'react-router-dom'
import { Users, Dumbbell, UserPlus, ArrowRight, BarChart2, TrendingUp, Activity } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { SkeletonPage } from '../components/ui/Skeleton'
import OnboardingWizard from '../components/OnboardingWizard'
import { useCountUp } from '../hooks/useCountUp'

const DIAS     = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']
const DIAS_API = ['domingo','segunda','terca','quarta','quinta','sexta','sabado']

// color-blind safe, muted para não virar arco-íris
const BAR_COLOR = '#6366f1'

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#1C1C1E', border: '1px solid #27272A', borderRadius: 8, padding: '8px 12px', boxShadow: '0 4px 12px rgba(0,0,0,0.4)' }}>
      <p style={{ color: '#71717A', fontSize: 11, fontWeight: 500, marginBottom: 3 }}>{label}</p>
      <p style={{ color: '#F4F4F5', fontWeight: 600, fontSize: 14, margin: 0 }}>
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
      background: '#1C1C1E', border: '1px solid #27272A',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.38, fontWeight: 600, color: '#A1A1AA', flexShrink: 0,
      fontFamily: 'Inter, sans-serif',
    }}>
      {initials}
    </div>
  )
}

function Kpi({ value, label, to }) {
  const num = typeof value === 'number' ? value : parseFloat(value)
  const counted = useCountUp(isNaN(num) ? 0 : num, 700)
  const display = isNaN(num) ? value : counted

  const inner = (
    <div style={{ padding: '16px 20px', borderRight: '1px solid #1C1C1E' }}>
      <p style={{ fontSize: 24, fontWeight: 600, color: '#F4F4F5', letterSpacing: '-0.03em', lineHeight: 1, marginBottom: 4, fontFamily: 'Inter, sans-serif' }}>
        {display}
      </p>
      <p style={{ fontSize: 12, color: '#71717A', fontFamily: 'Inter, sans-serif' }}>{label}</p>
    </div>
  )
  return to
    ? <Link to={to} style={{ textDecoration: 'none', display: 'block' }} className="group"
        onMouseEnter={e => e.currentTarget.querySelector('p:first-child').style.color='#818cf8'}
        onMouseLeave={e => e.currentTarget.querySelector('p:first-child').style.color='#F4F4F5'}
      >{inner}</Link>
    : inner
}

export default function Dashboard() {
  const { user } = useAuth()
  const { data: alunos = [], isLoading: la } = useQuery({ queryKey: ['alunos'], queryFn: () => listarAlunos().then(r => r.data) })
  const { data: treinos = [], isLoading: lt } = useQuery({ queryKey: ['treinos'], queryFn: () => listarTreinos().then(r => r.data) })

  if (la || lt) return <SkeletonPage />

  const treinosPorDia = DIAS.map((dia, i) => ({
    dia,
    treinos: treinos.filter(t => {
      const d = (t.dia_semana || '').toLowerCase()
      return d === DIAS_API[i]
    }).length,
  }))

  const recentAlunos = [...alunos].reverse().slice(0, 6)
  const hora = new Date().getHours()
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite'
  const avgEx = treinos.length > 0
    ? (treinos.reduce((s, t) => s + (t.itens?.length || 0), 0) / treinos.length).toFixed(1)
    : '0'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }} className="animate-fade-in">
      <OnboardingWizard />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 600, color: '#F4F4F5', letterSpacing: '-0.02em', marginBottom: 2 }}>
            {saudacao}, {user?.nome?.split(' ')[0]}
          </h1>
          <p style={{ fontSize: 13, color: '#71717A' }}>
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <Link to="/convites" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <UserPlus style={{ width: 14, height: 14 }} />
          Adicionar aluno
        </Link>
      </div>

      {/* KPI strip */}
      <div className="kpi-strip">
        <Kpi value={alunos.length}   label="Alunos"       to="/alunos" />
        <Kpi value={treinos.length}  label="Treinos"       />
        <Kpi value={Number(avgEx)}   label="Ex / treino"   />
        <Kpi value="Analytics"       label="Ver relatório" to="/analytics" />
      </div>

      {/* Charts row */}
      <div className="rg-3-2" style={{ gap: 16 }}>
        {/* Bar chart */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <h2 style={{ fontSize: 14, fontWeight: 600, color: '#F4F4F5', margin: 0 }}>Distribuição semanal</h2>
              <p style={{ fontSize: 12, color: '#71717A', marginTop: 2 }}>Treinos por dia da semana</p>
            </div>
            <Activity style={{ width: 15, height: 15, color: '#52525B' }} />
          </div>
          {treinos.length === 0 ? (
            <div className="empty-state" style={{ padding: '32px 0' }}>
              <div className="empty-icon"><Dumbbell style={{ width: 16, height: 16, color: '#52525B' }} /></div>
              <p className="empty-title">Nenhum treino ainda</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={treinosPorDia} barSize={22} margin={{ top: 2, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 4" vertical={false} stroke="#1C1C1E" />
                <XAxis dataKey="dia" tick={{ fontSize: 11, fill: '#71717A', fontFamily: 'Inter, sans-serif' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#71717A' }} axisLine={false} tickLine={false} allowDecimals={false} width={18} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)', radius: 4 }} />
                <Bar dataKey="treinos" radius={[4, 4, 2, 2]} fill={BAR_COLOR} fillOpacity={0.8} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Overview */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, color: '#F4F4F5', margin: 0 }}>Visão geral</h2>
            <TrendingUp style={{ width: 15, height: 15, color: '#52525B' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { label: 'Alunos',    value: alunos.length,  max: Math.max(alunos.length, 10),  color: '#6366f1' },
              { label: 'Treinos',   value: treinos.length, max: Math.max(treinos.length, 20), color: '#4ade80' },
              { label: 'Ex/treino', value: Number(avgEx),  max: 12,                           color: '#60a5fa' },
            ].map(({ label, value, max, color }) => (
              <div key={label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: '#71717A' }}>{label}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#A1A1AA' }}>{value}</span>
                </div>
                <div className="progress-bar-track">
                  <div className="progress-bar-fill" style={{ width: `${Math.min(100, max > 0 ? (Number(value) / max) * 100 : 0)}%`, background: color }} />
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #1C1C1E' }}>
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
            <h2 style={{ fontSize: 14, fontWeight: 600, color: '#F4F4F5', margin: 0 }}>Alunos recentes</h2>
            <Link to="/alunos" style={{ fontSize: 12, color: '#6366f1', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3, fontWeight: 500 }}>
              Ver todos <ArrowRight style={{ width: 12, height: 12 }} />
            </Link>
          </div>
          {recentAlunos.length === 0 ? (
            <div className="empty-state" style={{ padding: '24px 0' }}>
              <div className="empty-icon"><Users style={{ width: 16, height: 16, color: '#52525B' }} /></div>
              <p className="empty-title">Nenhum aluno ainda</p>
              <Link to="/convites" className="btn-primary btn-sm">Enviar convite</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {recentAlunos.map((a, i) => (
                <Link key={a.id} to={`/alunos/${a.id}`}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', textDecoration: 'none', borderBottom: i < recentAlunos.length - 1 ? '1px solid #1C1C1E' : 'none' }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.75'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                  <Avatar nome={a.nome} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#F4F4F5', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.nome}</div>
                    {a.objetivo && <div style={{ fontSize: 11, color: '#71717A', marginTop: 1 }}>{a.objetivo}</div>}
                  </div>
                  <ArrowRight style={{ width: 12, height: 12, color: '#52525B', flexShrink: 0 }} />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="card">
          <h2 style={{ fontSize: 14, fontWeight: 600, color: '#F4F4F5', margin: '0 0 14px' }}>Ações rápidas</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {[
              { to: '/convites',   icon: UserPlus, label: 'Enviar convite por e-mail'     },
              { to: '/exercicios', icon: Dumbbell, label: 'Gerenciar exercícios'            },
              { to: '/ia',         icon: TrendingUp, label: 'Sugestões de progressão'        },
              { to: '/financeiro', icon: BarChart2, label: 'Cobranças e planos'            },
            ].map(({ to, icon: Icon, label }) => (
              <Link key={to} to={to}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', borderRadius: 6, textDecoration: 'none', transition: 'background 0.1s' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#1C1C1E' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
              >
                <Icon style={{ width: 14, height: 14, color: '#71717A', flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: '#A1A1AA', fontFamily: 'Inter, sans-serif' }}>{label}</span>
                <ArrowRight style={{ width: 12, height: 12, color: '#52525B', flexShrink: 0, marginLeft: 'auto' }} />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
