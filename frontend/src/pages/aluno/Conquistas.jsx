import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../../contexts/AuthContext'
import { listarAlunos, gamificacaoAluno } from '../../api'
import { Lock, Star, Zap } from 'lucide-react'

const TODAS_CONQUISTAS = [
  { codigo: 'primeiro_treino', emoji: '🏋️', titulo: 'Primeiro passo',  descricao: 'Completou o primeiro treino',   xp: 50,   raridade: 'comum'    },
  { codigo: 'streak_7',        emoji: '🔥', titulo: 'Semana de fogo',  descricao: '7 dias seguidos treinando',     xp: 200,  raridade: 'raro'     },
  { codigo: 'streak_30',       emoji: '🏆', titulo: 'Mês olímpico',    descricao: '30 dias consecutivos',          xp: 1000, raridade: 'lendário' },
  { codigo: 'treinos_10',      emoji: '💪', titulo: 'Em ritmo',        descricao: '10 treinos completados',        xp: 150,  raridade: 'comum'    },
  { codigo: 'treinos_50',      emoji: '⭐', titulo: 'Veterano',        descricao: '50 treinos completados',        xp: 500,  raridade: 'épico'    },
]

const RARIDADE_COLORS = {
  comum:    { bg: 'bg-gray-50',    border: 'border-gray-200',   text: 'text-gray-600',    badge: 'bg-gray-100 text-gray-500'    },
  raro:     { bg: 'bg-blue-50',    border: 'border-blue-200',   text: 'text-blue-700',    badge: 'bg-blue-100 text-blue-600'    },
  épico:    { bg: 'bg-violet-50',  border: 'border-violet-200', text: 'text-violet-700',  badge: 'bg-violet-100 text-violet-600'},
  lendário: { bg: 'bg-yellow-50',  border: 'border-yellow-300', text: 'text-yellow-700',  badge: 'bg-yellow-100 text-yellow-600'},
}

function XPBar({ xpTotal, xpMax }) {
  const pct = Math.min(100, Math.round((xpTotal / xpMax) * 100))
  const level = Math.floor(xpTotal / 200) + 1

  return (
    <div className="bg-brand-sidebar rounded-3xl p-5 text-white">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs text-slate-400 font-medium mb-0.5">Nível atual</p>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-black">{level}</span>
            <div className="mb-1">
              <p className="text-xs text-slate-400">
                {xpTotal.toLocaleString('pt-BR')} XP
              </p>
            </div>
          </div>
        </div>
        <div className="w-14 h-14 bg-gradient-brand rounded-2xl flex items-center justify-center shadow-glow-sm">
          <Zap className="w-7 h-7 text-white" />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs text-slate-400">
          <span>Progresso para nível {level + 1}</span>
          <span>{pct}%</span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
          <div
            className="h-3 bg-gradient-to-r from-primary-400 to-violet-400 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-xs text-slate-500">
          {xpMax - xpTotal > 0
            ? `${(xpMax - xpTotal).toLocaleString('pt-BR')} XP para o próximo nível`
            : '🎉 Nível máximo atingido!'}
        </p>
      </div>
    </div>
  )
}

function StatPill({ emoji, value, label, color }) {
  return (
    <div className="card text-center p-4">
      <div className={`text-2xl font-black ${color} mb-0.5`}>{value}</div>
      <div className="text-lg mb-1">{emoji}</div>
      <div className="text-xs text-gray-500 font-medium">{label}</div>
    </div>
  )
}

function ConquistaCard({ conquista: c, gami, desbloqueadas }) {
  const desbloqueada = desbloqueadas.has(c.codigo)
  const info = gami?.conquistas?.find((x) => x.codigo === c.codigo)
  const R = RARIDADE_COLORS[c.raridade] || RARIDADE_COLORS.comum

  return (
    <div className={`rounded-2xl border-2 p-4 transition-all duration-300 ${
      desbloqueada
        ? `${R.bg} ${R.border} shadow-sm`
        : 'bg-gray-50 border-gray-100 opacity-60'
    }`}>
      <div className="flex items-center gap-4">
        {/* Icon */}
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 text-2xl ${
          desbloqueada
            ? `${R.bg} border-2 ${R.border}`
            : 'bg-gray-100'
        }`}>
          {desbloqueada ? c.emoji : <Lock className="w-6 h-6 text-gray-300" />}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <span className={`font-bold text-sm ${desbloqueada ? 'text-gray-900' : 'text-gray-400'}`}>
              {c.titulo}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold capitalize ${R.badge}`}>
              {c.raridade}
            </span>
          </div>
          <p className={`text-xs ${desbloqueada ? 'text-gray-600' : 'text-gray-400'}`}>
            {c.descricao}
          </p>
          {desbloqueada && info?.desbloqueado_em && (
            <p className="text-xs text-green-600 font-semibold mt-1 flex items-center gap-1">
              ✓ Desbloqueada em {new Date(info.desbloqueado_em).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
            </p>
          )}
        </div>

        {/* XP badge */}
        <div className={`text-right flex-shrink-0`}>
          <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
            desbloqueada ? 'bg-white/80 text-primary-700' : 'bg-gray-100 text-gray-400'
          }`}>
            <Star className="w-3 h-3" />
            {c.xp} XP
          </div>
        </div>
      </div>
    </div>
  )
}

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

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="w-12 h-12 bg-yellow-100 rounded-2xl flex items-center justify-center animate-bounce-light">
          <Star className="w-6 h-6 text-yellow-500" />
        </div>
        <p className="text-sm text-gray-500">Carregando conquistas...</p>
      </div>
    )
  }

  const desbloqueadas = new Set(gami?.conquistas?.map((c) => c.codigo) || [])
  const xpTotal = TODAS_CONQUISTAS.filter((c) => desbloqueadas.has(c.codigo)).reduce((s, c) => s + c.xp, 0)
  const xpMax = TODAS_CONQUISTAS.reduce((s, c) => s + c.xp, 0)

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Conquistas</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {desbloqueadas.size} de {TODAS_CONQUISTAS.length} desbloqueadas
        </p>
      </div>

      {/* XP Level card */}
      <XPBar xpTotal={xpTotal} xpMax={xpMax} />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatPill emoji="🔥" value={gami?.streak_atual || 0} label="Streak" color="text-orange-600" />
        <StatPill emoji="🏆" value={gami?.streak_recorde || 0} label="Recorde" color="text-yellow-600" />
        <StatPill emoji="💪" value={gami?.total_treinos || 0} label="Treinos" color="text-emerald-600" />
      </div>

      {/* Unlocked */}
      {desbloqueadas.size > 0 && (
        <div>
          <p className="section-title">Conquistadas ({desbloqueadas.size})</p>
          <div className="space-y-3">
            {TODAS_CONQUISTAS.filter(c => desbloqueadas.has(c.codigo)).map((c) => (
              <ConquistaCard key={c.codigo} conquista={c} gami={gami} desbloqueadas={desbloqueadas} />
            ))}
          </div>
        </div>
      )}

      {/* Locked */}
      {TODAS_CONQUISTAS.some(c => !desbloqueadas.has(c.codigo)) && (
        <div>
          <p className="section-title">Bloqueadas</p>
          <div className="space-y-3">
            {TODAS_CONQUISTAS.filter(c => !desbloqueadas.has(c.codigo)).map((c) => (
              <ConquistaCard key={c.codigo} conquista={c} gami={gami} desbloqueadas={desbloqueadas} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
