import { useQuery } from '@tanstack/react-query'
import { listarAlunos, listarTreinos } from '../api'
import { useAuth } from '../contexts/AuthContext'
import { Link } from 'react-router-dom'
import {
  Users, Dumbbell, Brain, UserPlus, ArrowRight,
  TrendingUp, TrendingDown, BarChart2, Zap,
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { SkeletonPage } from '../components/ui/Skeleton'

const DIAS = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']

function StatCard({ icon: Icon, label, value, sub, color, to, trend }) {
  const card = (
    <div className="card group flex items-start gap-4 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200">
      <div className={`stat-icon ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-2xl font-bold text-gray-900 animate-number-in">{value}</div>
        <div className="text-sm text-gray-500 font-medium mt-0.5">{label}</div>
        {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
      </div>
      {trend !== undefined && (
        <div className={`flex items-center gap-1 text-xs font-semibold mt-1 ${
          trend >= 0 ? 'text-emerald-600' : 'text-red-500'
        }`}>
          {trend >= 0
            ? <TrendingUp className="w-3.5 h-3.5" />
            : <TrendingDown className="w-3.5 h-3.5" />}
        </div>
      )}
    </div>
  )
  return to ? <Link to={to} className="block">{card}</Link> : card
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-glass px-3 py-2 text-sm">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="font-medium">
          {p.value} {p.name}
        </p>
      ))}
    </div>
  )
}

function Avatar({ nome, size = 'sm' }) {
  const initials = nome?.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
  const sz = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm'
  return (
    <div className={`${sz} bg-gradient-to-br from-primary-500 to-violet-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0`}>
      {initials}
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()

  const { data: alunos = [], isLoading: loadingAlunos } = useQuery({
    queryKey: ['alunos'],
    queryFn: () => listarAlunos().then((r) => r.data),
  })
  const { data: treinos = [], isLoading: loadingTreinos } = useQuery({
    queryKey: ['treinos'],
    queryFn: () => listarTreinos().then((r) => r.data),
  })

  if (loadingAlunos || loadingTreinos) return <SkeletonPage />

  // Chart data: workouts per day of week
  const treinosPorDia = DIAS.map((dia, i) => ({
    dia,
    treinos: treinos.filter((t) => {
      const d = t.dia_semana?.toLowerCase()
      const map = ['domingo','segunda','terça','quarta','quinta','sexta','sábado']
      return d === map[i]
    }).length,
  }))

  // Recent students (last 6)
  const recentAlunos = [...alunos].reverse().slice(0, 6)

  const hoje = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ── Page header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Olá, {user?.nome?.split(' ')[0]}! 👋
          </h1>
          <p className="text-sm text-gray-500 mt-0.5 capitalize">{hoje}</p>
        </div>
        <Link to="/convites" className="btn-gradient self-start">
          <UserPlus className="w-4 h-4" />
          Adicionar aluno
        </Link>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="Alunos ativos"
          value={alunos.length}
          sub={alunos.length === 0 ? 'Convide o primeiro!' : undefined}
          color="bg-gradient-brand"
          to="/alunos"
        />
        <StatCard
          icon={Dumbbell}
          label="Treinos prescritos"
          value={treinos.length}
          sub={`${(treinos.length / Math.max(alunos.length,1)).toFixed(1)} por aluno`}
          color="bg-gradient-emerald"
        />
        <StatCard
          icon={Brain}
          label="IA · Progressão"
          value="Ver"
          sub="Sugestões automáticas"
          color="bg-gradient-to-br from-violet-500 to-purple-600"
          to="/ia"
        />
        <StatCard
          icon={BarChart2}
          label="Financeiro"
          value="Ver"
          sub="Cobranças e planos"
          color="bg-gradient-to-br from-amber-500 to-orange-500"
          to="/financeiro"
        />
      </div>

      {/* ── Charts row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Treinos por dia */}
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-semibold text-gray-900">Treinos por dia da semana</h2>
              <p className="text-xs text-gray-400 mt-0.5">Distribuição dos treinos prescritos</p>
            </div>
            <div className="w-8 h-8 bg-primary-50 rounded-xl flex items-center justify-center">
              <BarChart2 className="w-4 h-4 text-primary-600" />
            </div>
          </div>
          {treinos.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <Dumbbell className="w-10 h-10 text-gray-200 mb-3" />
              <p className="text-sm text-gray-400">Nenhum treino cadastrado ainda</p>
              <p className="text-xs text-gray-300 mt-1">Crie treinos para seus alunos para ver o gráfico</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={treinosPorDia} barSize={22}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="dia" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="treinos" name="treinos" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.7} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Crescimento de alunos */}
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-semibold text-gray-900">Visão geral</h2>
              <p className="text-xs text-gray-400 mt-0.5">Totais da plataforma</p>
            </div>
            <div className="w-8 h-8 bg-emerald-50 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <div className="space-y-4">
            {[
              {
                label: 'Alunos cadastrados',
                value: alunos.length,
                max: Math.max(alunos.length, 10),
                color: 'bg-gradient-brand',
                icon: Users,
              },
              {
                label: 'Treinos cadastrados',
                value: treinos.length,
                max: Math.max(treinos.length, 20),
                color: 'bg-gradient-emerald',
                icon: Dumbbell,
              },
              {
                label: 'Exercícios por treino (média)',
                value: treinos.length > 0
                  ? (treinos.reduce((s, t) => s + (t.itens?.length || 0), 0) / treinos.length).toFixed(1)
                  : 0,
                max: 12,
                color: 'bg-gradient-to-r from-violet-500 to-purple-500',
                icon: Zap,
              },
            ].map(({ label, value, max, color, icon: Icon }) => (
              <div key={label} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Icon className="w-3.5 h-3.5 text-gray-400" />
                    {label}
                  </div>
                  <span className="font-bold text-gray-900 text-sm">{value}</span>
                </div>
                <div className="progress-bar-track h-2">
                  <div
                    className={`progress-bar-fill h-2 ${color}`}
                    style={{ width: `${Math.min(100, (Number(value) / max) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent students */}
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-gray-900">Alunos recentes</h2>
            <Link to="/alunos" className="flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700">
              Ver todos <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {recentAlunos.length === 0 ? (
            <div className="empty-state py-10">
              <div className="empty-icon bg-primary-50">
                <Users className="w-7 h-7 text-primary-400" />
              </div>
              <p className="empty-title">Nenhum aluno ainda</p>
              <p className="empty-message">Convide seu primeiro aluno para começar</p>
              <Link to="/convites" className="btn-primary btn-sm">Enviar convite</Link>
            </div>
          ) : (
            <ul className="divide-y divide-gray-50">
              {recentAlunos.map((a) => (
                <li key={a.id}>
                  <Link
                    to={`/alunos/${a.id}`}
                    className="flex items-center gap-3 py-3 px-2 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <Avatar nome={a.nome} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-900 truncate">{a.nome}</div>
                      <div className="text-xs text-gray-400 truncate">{a.email}</div>
                    </div>
                    {a.objetivo && (
                      <span className="badge-blue hidden sm:inline-flex">{a.objetivo}</span>
                    )}
                    <ArrowRight className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Quick actions */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-5">Ações rápidas</h2>
          <div className="space-y-2">
            {[
              { to: '/convites',   icon: UserPlus,  label: 'Enviar convite por e-mail',       color: 'bg-primary-50', iconColor: 'text-primary-600' },
              { to: '/exercicios', icon: Dumbbell,  label: 'Gerenciar banco de exercícios',    color: 'bg-emerald-50', iconColor: 'text-emerald-600' },
              { to: '/ia',         icon: Brain,     label: 'Ver sugestões da IA por aluno',    color: 'bg-violet-50',  iconColor: 'text-violet-600'  },
              { to: '/financeiro', icon: BarChart2, label: 'Acompanhar cobranças e planos',    color: 'bg-amber-50',   iconColor: 'text-amber-600'   },
            ].map(({ to, icon: Icon, label, color, iconColor }) => (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-primary-200 hover:bg-primary-50/50 transition-all group"
              >
                <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-4 h-4 ${iconColor}`} />
                </div>
                <span className="text-sm text-gray-700 font-medium group-hover:text-gray-900 flex-1">{label}</span>
                <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-primary-500 transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
