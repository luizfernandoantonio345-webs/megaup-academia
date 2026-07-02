import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../../contexts/AuthContext'
import { listarAlunos, gamificacaoAluno } from '../../api'
import { Loader2, Lock } from 'lucide-react'

const TODAS_CONQUISTAS = [
  { codigo: 'primeiro_treino', emoji: '🏋️', titulo: 'Primeiro passo', descricao: 'Completou o primeiro treino', xp: 50 },
  { codigo: 'streak_7', emoji: '🔥', titulo: 'Semana de fogo', descricao: '7 dias seguidos treinando', xp: 200 },
  { codigo: 'streak_30', emoji: '🏆', titulo: 'Mês olímpico', descricao: '30 dias consecutivos', xp: 1000 },
  { codigo: 'treinos_10', emoji: '💪', titulo: 'Em ritmo', descricao: '10 treinos completados', xp: 150 },
  { codigo: 'treinos_50', emoji: '⭐', titulo: 'Veterano', descricao: '50 treinos completados', xp: 500 },
]

export default function Conquistas() {
  const { user } = useAuth()

  const { data: alunos = [] } = useQuery({
    queryKey: ['alunos'],
    queryFn: () => listarAlunos().then((r) => r.data),
  })
  const aluno = alunos.find((a) => a.email === user?.email) || alunos[0]

  const { data: gami, isLoading } = useQuery({
    queryKey: ['gamificacao', aluno?.id],
    queryFn: () => gamificacaoAluno(aluno.id).then((r) => r.data),
    enabled: !!aluno,
  })

  if (isLoading)
    return <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary-600" /></div>

  const desbloqueadas = new Set(gami?.conquistas?.map((c) => c.codigo) || [])
  const xpTotal = TODAS_CONQUISTAS.filter((c) => desbloqueadas.has(c.codigo)).reduce((s, c) => s + c.xp, 0)
  const xpMax = TODAS_CONQUISTAS.reduce((s, c) => s + c.xp, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Conquistas</h1>
        <p className="text-gray-500">{desbloqueadas.size} de {TODAS_CONQUISTAS.length} desbloqueadas</p>
      </div>

      {/* XP bar */}
      <div className="card">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">XP Total</span>
          <span className="text-sm font-bold text-primary-600">{xpTotal} / {xpMax} XP</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-primary-500 to-purple-500 h-3 rounded-full transition-all duration-700"
            style={{ width: `${(xpTotal / xpMax) * 100}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Streak', value: `${gami?.streak_atual || 0} 🔥`, color: 'text-orange-600' },
          { label: 'Recorde', value: `${gami?.streak_recorde || 0} 🏆`, color: 'text-yellow-600' },
          { label: 'Treinos', value: `${gami?.total_treinos || 0} 💪`, color: 'text-green-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card text-center p-3">
            <div className={`text-xl font-bold ${color}`}>{value}</div>
            <div className="text-xs text-gray-500">{label}</div>
          </div>
        ))}
      </div>

      {/* Conquistas grid */}
      <div className="space-y-3">
        {TODAS_CONQUISTAS.map((c) => {
          const desbloqueada = desbloqueadas.has(c.codigo)
          const conquista = gami?.conquistas?.find((x) => x.codigo === c.codigo)
          return (
            <div
              key={c.codigo}
              className={`card flex items-center gap-4 transition-all ${
                desbloqueada ? 'border-2 border-yellow-200 bg-yellow-50' : 'opacity-60'
              }`}
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 ${
                desbloqueada ? 'bg-yellow-100' : 'bg-gray-100'
              }`}>
                {desbloqueada ? c.emoji : <Lock className="w-6 h-6 text-gray-400" />}
              </div>
              <div className="flex-1">
                <div className={`font-bold ${desbloqueada ? 'text-gray-900' : 'text-gray-500'}`}>
                  {c.titulo}
                </div>
                <div className="text-sm text-gray-500">{c.descricao}</div>
                {desbloqueada && conquista?.desbloqueado_em && (
                  <div className="text-xs text-yellow-600 mt-0.5">
                    ✓ {new Date(conquista.desbloqueado_em).toLocaleDateString('pt-BR')}
                  </div>
                )}
              </div>
              <div className={`text-sm font-bold ${desbloqueada ? 'text-yellow-600' : 'text-gray-400'}`}>
                +{c.xp} XP
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
