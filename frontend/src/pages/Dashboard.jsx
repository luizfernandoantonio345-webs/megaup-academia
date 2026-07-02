import { useQuery } from '@tanstack/react-query'
import { listarAlunos, listarTreinos } from '../api'
import { useAuth } from '../contexts/AuthContext'
import { Link } from 'react-router-dom'
import { Users, Dumbbell, TrendingUp, Brain, ArrowRight, Loader2 } from 'lucide-react'

function StatCard({ icon: Icon, label, value, color, to }) {
  const content = (
    <div className={`card flex items-center gap-4 hover:shadow-md transition-shadow ${to ? 'cursor-pointer' : ''}`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <div className="text-sm text-gray-500">{label}</div>
      </div>
    </div>
  )
  return to ? <Link to={to}>{content}</Link> : content
}

export default function Dashboard() {
  const { user } = useAuth()
  const { data: alunos = [], isLoading: loadingAlunos } = useQuery({
    queryKey: ['alunos'],
    queryFn: () => listarAlunos().then((r) => r.data),
  })
  const { data: treinos = [] } = useQuery({
    queryKey: ['treinos'],
    queryFn: () => listarTreinos().then((r) => r.data),
  })

  if (loadingAlunos)
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )

  const alunosComSugestao = alunos.filter((a) => a.id) // placeholder

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Olá, {user?.nome?.split(' ')[0]} 👋
        </h1>
        <p className="text-gray-500">Veja como seus alunos estão se saindo hoje.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="Alunos ativos"
          value={alunos.length}
          color="bg-primary-600"
          to="/alunos"
        />
        <StatCard
          icon={Dumbbell}
          label="Treinos cadastrados"
          value={treinos.length}
          color="bg-emerald-500"
        />
        <StatCard
          icon={Brain}
          label="Sugestões da IA"
          value="Ver"
          color="bg-purple-500"
          to="/ia"
        />
        <StatCard
          icon={TrendingUp}
          label="Convidar aluno"
          value="+"
          color="bg-orange-500"
          to="/convites"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lista rápida de alunos */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Últimos alunos</h2>
            <Link to="/alunos" className="text-sm text-primary-600 flex items-center gap-1 hover:underline">
              Ver todos <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {alunos.length === 0 ? (
            <EmptyState
              msg="Nenhum aluno ainda."
              action={{ to: '/convites', label: 'Convidar primeiro aluno' }}
            />
          ) : (
            <ul className="space-y-2">
              {alunos.slice(0, 6).map((a) => (
                <li key={a.id}>
                  <Link
                    to={`/alunos/${a.id}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar nome={a.nome} />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{a.nome}</div>
                        <div className="text-xs text-gray-400">{a.email}</div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Dicas rápidas */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Acesso rápido</h2>
          <div className="space-y-3">
            {[
              { to: '/alunos/novo', label: 'Criar novo aluno manualmente', icon: Users },
              { to: '/convites', label: 'Enviar convite por e-mail', icon: Users },
              { to: '/exercicios', label: 'Gerenciar banco de exercícios', icon: Dumbbell },
              { to: '/ia', label: 'Ver sugestões de progressão', icon: Brain },
            ].map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors"
              >
                <Icon className="w-5 h-5 text-primary-600" />
                <span className="text-sm text-gray-700">{label}</span>
                <ArrowRight className="w-4 h-4 text-gray-400 ml-auto" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function Avatar({ nome }) {
  const initials = nome?.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
  return (
    <div className="w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-bold">
      {initials}
    </div>
  )
}

function EmptyState({ msg, action }) {
  return (
    <div className="text-center py-8">
      <p className="text-gray-400 text-sm mb-3">{msg}</p>
      {action && (
        <Link to={action.to} className="btn-primary text-sm">
          {action.label}
        </Link>
      )}
    </div>
  )
}
