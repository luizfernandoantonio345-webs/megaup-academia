import { useQuery } from '@tanstack/react-query'
import { listarAlunos, listarTreinos } from '../api'
import { useAuth } from '../contexts/AuthContext'
import { Link } from 'react-router-dom'
import { Users, Dumbbell, Brain, UserPlus, ArrowRight, BarChart2, Zap, TrendingUp } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { SkeletonPage } from '../components/ui/Skeleton'

const DIAS = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']

function StatCard({ icon: Icon, label, value, sub, gradient, to, accent }) {
  const content = (
    <div className="card group relative overflow-hidden" style={{ cursor: to ? 'pointer' : 'default' }}>
      <div style={{
        position: 'absolute', top: -20, right: -20, width: 120, height: 120,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${accent}18 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />
      <div className="flex items-start gap-4 relative z-10">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: gradient }}>
          <Icon style={{ width: 20, height: 20, color: 'white' }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-3xl font-black animate-number-in" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#EFF6FF', letterSpacing: '-0.03em' }}>
            {value}
          </div>
          <div className="text-sm font-medium mt-0.5" style={{ color: '#94A3B8' }}>{label}</div>
          {sub && <div className="text-xs mt-0.5" style={{ color: '#3D4F6A' }}>{sub}</div>}
        </div>
        {to && <ArrowRight className="w-4 h-4 flex-shrink-0 mt-1 transition-transform group-hover:translate-x-1" style={{ color: accent }} />}
      </div>
    </div>
  )
  return to ? <Link to={to} className="block">{content}</Link> : content
}

const DarkTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#141D30', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 12, padding: '10px 14px', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
      <p style={{ color: '#64748B', fontSize: 11, fontWeight: 700, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: '#a5b4fc', fontWeight: 700, fontSize: 15, fontFamily: 'Space Grotesk, sans-serif' }}>
          {p.value} treino{p.value !== 1 ? 's' : ''}
        </p>
      ))}
    </div>
  )
}

function Avatar({ nome }) {
  const initials = nome?.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
  return (
    <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{
      background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
    }}>
      {initials}
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const { data: alunos = [], isLoading: la } = useQuery({ queryKey: ['alunos'], queryFn: () => listarAlunos().then(r => r.data) })
  const { data: treinos = [], isLoading: lt } = useQuery({ queryKey: ['treinos'], queryFn: () => listarTreinos().then(r => r.data) })

  if (la || lt) return <SkeletonPage />

  const treinosPorDia = DIAS.map((dia, i) => ({
    dia,
    treinos: treinos.filter((t) => {
      const d = t.dia_semana?.toLowerCase()
      return d === ['domingo','segunda','terça','quarta','quinta','sexta','sábado'][i]
    }).length,
  }))

  const recentAlunos = [...alunos].reverse().slice(0, 5)
  const hoje = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
  const hora = new Date().getHours()
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite'
  const avgEx = treinos.length > 0
    ? (treinos.reduce((s, t) => s + (t.itens?.length || 0), 0) / treinos.length).toFixed(1)
    : 0

  return (
    <div className="space-y-7 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 26, fontWeight: 800, color: '#EFF6FF', letterSpacing: '-0.03em', lineHeight: 1.2 }}>
            {saudacao}, {user?.nome?.split(' ')[0]}
          </h1>
          <p className="text-sm mt-0.5 capitalize" style={{ color: '#3D4F6A' }}>{hoje}</p>
        </div>
        <Link to="/convites" className="btn-gradient self-start">
          <UserPlus style={{ width: 16, height: 16 }} />
          Adicionar aluno
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users}    label="Alunos ativos"     value={alunos.length}  sub="na plataforma"    gradient="linear-gradient(135deg,#4f46e5,#7c3aed)" accent="#6366f1" to="/alunos" />
        <StatCard icon={Dumbbell} label="Treinos prescritos" value={treinos.length} sub={`${avgEx} ex/treino`} gradient="linear-gradient(135deg,#059669,#10b981)" accent="#10b981" />
        <StatCard icon={Brain}    label="IA · Progressão"   value="Ver"            sub="Sugestões ativas"  gradient="linear-gradient(135deg,#7c3aed,#a78bfa)"  accent="#a78bfa" to="/ia" />
        <StatCard icon={BarChart2} label="Financeiro"       value="Ver"            sub="Cobranças e planos" gradient="linear-gradient(135deg,#d97706,#f59e0b)" accent="#f59e0b" to="/financeiro" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Bar chart */}
        <div className="card lg:col-span-3">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, color: '#CBD5E1', fontSize: 15 }}>Treinos por dia</h2>
              <p style={{ fontSize: 12, color: '#3D4F6A', marginTop: 2 }}>Distribuição semanal dos treinos prescritos</p>
            </div>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.12)' }}>
              <BarChart2 style={{ width: 15, height: 15, color: '#818cf8' }} />
            </div>
          </div>
          {treinos.length === 0 ? (
            <div className="empty-state py-10">
              <div className="empty-icon"><Dumbbell style={{ width: 28, height: 28, color: '#4B5768' }} /></div>
              <p className="empty-title">Nenhum treino ainda</p>
              <p className="empty-message">Crie treinos para ver a distribuição semanal</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={190}>
              <BarChart data={treinosPorDia} barSize={24}>
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.6} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="dia" tick={{ fontSize: 11, fill: '#3D4F6A', fontFamily: 'Inter' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#3D4F6A' }} axisLine={false} tickLine={false} allowDecimals={false} width={20} />
                <Tooltip content={<DarkTooltip />} cursor={{ fill: 'rgba(99,102,241,0.08)', radius: 6 }} />
                <Bar dataKey="treinos" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Overview */}
        <div className="card lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, color: '#CBD5E1', fontSize: 15 }}>Visão geral</h2>
              <TrendingUp style={{ width: 16, height: 16, color: '#10b981' }} />
            </div>
            <div className="space-y-4">
              {[
                { label: 'Alunos', value: alunos.length, max: Math.max(alunos.length, 10),   color: 'linear-gradient(90deg,#4f46e5,#7c3aed)', accent: '#6366f1' },
                { label: 'Treinos', value: treinos.length, max: Math.max(treinos.length, 20), color: 'linear-gradient(90deg,#059669,#10b981)', accent: '#10b981' },
                { label: 'Ex/treino', value: avgEx, max: 12,                                  color: 'linear-gradient(90deg,#7c3aed,#a78bfa)', accent: '#a78bfa' },
              ].map(({ label, value, max, color, accent }) => (
                <div key={label}>
                  <div className="flex justify-between mb-2">
                    <span style={{ fontSize: 12, color: '#64748B' }}>{label}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#CBD5E1', fontFamily: 'Space Grotesk, sans-serif' }}>{value}</span>
                  </div>
                  <div className="progress-bar-track">
                    <div className="progress-bar-fill" style={{ width: `${Math.min(100, (Number(value) / max) * 100)}%`, background: color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-5" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <Link to="/convites" className="btn-gradient w-full justify-center">
              <UserPlus style={{ width: 15, height: 15 }} />
              Convidar aluno
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent students */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, color: '#CBD5E1', fontSize: 15 }}>Alunos recentes</h2>
            <Link to="/alunos" className="flex items-center gap-1 text-xs font-semibold" style={{ color: '#6366f1' }}>
              Ver todos <ArrowRight style={{ width: 13, height: 13 }} />
            </Link>
          </div>
          {recentAlunos.length === 0 ? (
            <div className="empty-state py-8">
              <div className="empty-icon"><Users style={{ width: 24, height: 24, color: '#4B5768' }} /></div>
              <p className="empty-title">Nenhum aluno ainda</p>
              <Link to="/convites" className="btn-gradient btn-sm">Enviar convite</Link>
            </div>
          ) : (
            <div className="space-y-1">
              {recentAlunos.map((a) => (
                <Link key={a.id} to={`/alunos/${a.id}`} className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group" style={{ ':hover': { background: 'rgba(255,255,255,0.04)' } }}
                  onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.04)'}
                  onMouseLeave={e => e.currentTarget.style.background='transparent'}
                >
                  <Avatar nome={a.nome} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate" style={{ color: '#CBD5E1' }}>{a.nome}</div>
                    <div className="text-xs truncate" style={{ color: '#3D4F6A' }}>{a.email}</div>
                  </div>
                  {a.objetivo && <span className="badge-blue hidden sm:inline-flex">{a.objetivo}</span>}
                  <ArrowRight style={{ width: 13, height: 13, color: '#1F2D4A', flexShrink: 0 }} />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="card">
          <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, color: '#CBD5E1', fontSize: 15, marginBottom: 16 }}>Ações rápidas</h2>
          <div className="space-y-2">
            {[
              { to: '/convites',   icon: UserPlus,   label: 'Enviar convite por e-mail',      accent: '#6366f1', bg: 'rgba(99,102,241,0.1)'  },
              { to: '/exercicios', icon: Dumbbell,   label: 'Gerenciar banco de exercícios',   accent: '#10b981', bg: 'rgba(16,185,129,0.1)'  },
              { to: '/ia',         icon: Brain,      label: 'Ver sugestões da IA por aluno',   accent: '#a78bfa', bg: 'rgba(167,139,250,0.1)' },
              { to: '/financeiro', icon: BarChart2,  label: 'Acompanhar cobranças e planos',   accent: '#f59e0b', bg: 'rgba(245,158,11,0.1)'  },
            ].map(({ to, icon: Icon, label, accent, bg }) => (
              <Link key={to} to={to} className="flex items-center gap-3 px-3 py-3 rounded-xl transition-all group"
                style={{ border: '1px solid rgba(255,255,255,0.05)' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor=`${accent}30`; e.currentTarget.style.background=bg }}
                onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(255,255,255,0.05)'; e.currentTarget.style.background='transparent' }}
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
                  <Icon style={{ width: 16, height: 16, color: accent }} />
                </div>
                <span className="text-sm font-medium flex-1" style={{ color: '#94A3B8' }}>{label}</span>
                <ArrowRight style={{ width: 13, height: 13, color: '#1F2D4A' }} />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
