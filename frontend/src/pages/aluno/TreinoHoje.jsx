import { useState, useEffect, useRef, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../contexts/AuthContext'
import { listarAlunos, treinoDodia, listarExercicios, executarTreino, gamificacaoAluno } from '../../api'
import toast from 'react-hot-toast'
import {
  Play, Dumbbell, CheckCircle, X, ChevronDown, ChevronUp,
  Timer, Flame, Trophy, Zap, Check, RotateCcw, Pause,
  ChevronRight, Star,
} from 'lucide-react'
import VideoPlayer from '../../components/VideoPlayer'

/* ─────────────────────────────────────────────
   REST TIMER (inline, lightweight)
───────────────────────────────────────────── */
function RestTimerInline({ onDismiss }) {
  const [seconds, setSeconds] = useState(60)
  const [running, setRunning] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const total = 60
  const intervalRef = useRef(null)

  const toggle = useCallback(() => {
    if (running) {
      clearInterval(intervalRef.current)
      setRunning(false)
    } else {
      setRunning(true)
      intervalRef.current = setInterval(() => {
        setElapsed((e) => {
          if (e >= total - 1) {
            clearInterval(intervalRef.current)
            setRunning(false)
            toast.success('Descanso encerrado! 💪')
            return total
          }
          return e + 1
        })
      }, 1000)
    }
  }, [running, total])

  useEffect(() => () => clearInterval(intervalRef.current), [])

  const remaining = total - elapsed
  const progress = elapsed / total
  const circ = 2 * Math.PI * 26
  const dash = circ * (1 - progress)
  const min = Math.floor(remaining / 60)
  const sec = remaining % 60
  const color = remaining <= 10 ? '#ef4444' : remaining <= 30 ? '#f59e0b' : '#4f46e5'

  return (
    <div className="flex items-center gap-4 bg-white rounded-2xl border border-gray-100 shadow-card p-4 animate-slide-down">
      <div className="relative w-16 h-16 flex-shrink-0">
        <svg className="w-16 h-16 -rotate-90" viewBox="0 0 60 60">
          <circle cx="30" cy="30" r="26" fill="none" stroke="#f1f5f9" strokeWidth="4" />
          <circle
            cx="30" cy="30" r="26" fill="none"
            stroke={color} strokeWidth="4" strokeLinecap="round"
            strokeDasharray={circ} strokeDashoffset={dash}
            style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold tabular-nums" style={{ color }}>
            {min > 0 ? `${min}:${String(sec).padStart(2,'0')}` : sec}
          </span>
        </div>
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-gray-800">Descanso entre séries</p>
        <p className="text-xs text-gray-400">Pressione play para iniciar</p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={toggle}
          className={`w-9 h-9 rounded-full flex items-center justify-center text-white transition-all ${
            running ? 'bg-amber-500' : 'bg-primary-600 shadow-glow-sm'
          }`}
        >
          {running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
        </button>
        <button
          onClick={onDismiss}
          className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   SET TRACKER (check off each set)
───────────────────────────────────────────── */
function SetTracker({ series, completedSets, onToggle }) {
  if (!series || series === '0') return null
  const count = parseInt(series) || 3
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-gray-500 mr-1">Séries:</span>
      {Array.from({ length: count }).map((_, i) => (
        <button
          key={i}
          onClick={() => onToggle(i)}
          className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all text-xs font-bold ${
            completedSets.includes(i)
              ? 'bg-emerald-500 border-emerald-500 text-white scale-110'
              : 'border-gray-300 text-gray-400 hover:border-emerald-400 hover:text-emerald-500'
          }`}
          title={completedSets.includes(i) ? 'Série concluída' : `Série ${i + 1}`}
        >
          {completedSets.includes(i) ? <Check className="w-3.5 h-3.5" /> : i + 1}
        </button>
      ))}
    </div>
  )
}

/* ─────────────────────────────────────────────
   WORKOUT MODAL — full screen executor
───────────────────────────────────────────── */
function ModalExecutar({ treino, exercicioMap, onClose }) {
  const qc = useQueryClient()
  const [dificuldade, setDificuldade] = useState('ok')
  const [videoAberto, setVideoAberto] = useState(null)
  const [showTimer, setShowTimer] = useState(false)
  const [completedSetsMap, setCompletedSetsMap] = useState({})
  const [itens, setItens] = useState(
    (treino.itens || []).map((i) => ({
      exercicio_id: i.exercicio_id,
      treino_item_id: i.id,
      carga_realizada: i.carga || '',
      repeticoes_realizadas: i.repeticoes || '',
      series_realizadas: i.series || '',
    }))
  )

  const { mutate, isPending } = useMutation({
    mutationFn: () => executarTreino(treino.id, {
      dificuldade,
      itens: itens.map((i) => ({
        exercicio_id: i.exercicio_id,
        treino_item_id: i.treino_item_id,
        carga_realizada: i.carga_realizada ? Number(i.carga_realizada) : null,
        repeticoes_realizadas: i.repeticoes_realizadas || null,
        series_realizadas: i.series_realizadas ? Number(i.series_realizadas) : null,
      })),
    }),
    onSuccess: () => {
      toast.success('Treino concluído! 💪🔥 Continue assim!')
      qc.invalidateQueries()
      onClose()
    },
    onError: () => toast.error('Erro ao registrar treino'),
  })

  const setItem = (idx, key, val) => {
    const copy = [...itens]
    copy[idx] = { ...copy[idx], [key]: val }
    setItens(copy)
  }

  const toggleSet = (exercicioId, setIdx) => {
    setCompletedSetsMap((prev) => {
      const current = prev[exercicioId] || []
      const updated = current.includes(setIdx)
        ? current.filter((s) => s !== setIdx)
        : [...current, setIdx]
      return { ...prev, [exercicioId]: updated }
    })
  }

  const totalSeries = itens.reduce((s, i) => s + (parseInt(i.series_realizadas) || 0), 0)
  const completedSeriesTotal = Object.values(completedSetsMap).reduce((s, arr) => s + arr.length, 0)
  const progressPct = totalSeries > 0 ? Math.round((completedSeriesTotal / totalSeries) * 100) : 0

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-50">
      {/* Header */}
      <div className="bg-brand-sidebar text-white px-4 pt-4 pb-3 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-brand rounded-lg flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Executando</p>
              <h3 className="font-bold text-sm">{treino.nome}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress bar */}
        {totalSeries > 0 && (
          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs text-slate-400">
              <span>{completedSeriesTotal} de {totalSeries} séries</span>
              <span>{progressPct}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-1.5">
              <div
                className="h-1.5 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4 max-w-lg mx-auto">
          {/* Difficulty selector */}
          <div className="card p-4">
            <p className="text-sm font-semibold text-gray-700 mb-3">Como está o treino?</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: 'facil',  emoji: '😊', label: 'Fácil',  cls: 'border-emerald-400 bg-emerald-50 text-emerald-700' },
                { key: 'ok',     emoji: '💪', label: 'Normal', cls: 'border-primary-400 bg-primary-50 text-primary-700'  },
                { key: 'dificil',emoji: '🔥', label: 'Pesado', cls: 'border-red-400 bg-red-50 text-red-700'              },
              ].map(({ key, emoji, label, cls }) => (
                <button
                  key={key}
                  onClick={() => setDificuldade(key)}
                  className={`py-3 rounded-2xl border-2 text-sm font-semibold transition-all ${
                    dificuldade === key ? cls : 'border-gray-200 text-gray-400 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-0.5">{emoji}</div>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Rest timer toggle */}
          <button
            onClick={() => setShowTimer(!showTimer)}
            className="w-full flex items-center justify-between px-4 py-3 bg-white rounded-2xl border border-gray-100 shadow-card text-sm font-medium text-gray-700 hover:border-primary-200 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Timer className="w-4 h-4 text-primary-500" />
              Cronômetro de descanso
            </span>
            {showTimer ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
          </button>

          {showTimer && (
            <RestTimerInline onDismiss={() => setShowTimer(false)} />
          )}

          {/* Exercise list */}
          {itens.map((item, idx) => {
            const ex = exercicioMap[item.exercicio_id]
            const temVideo = !!ex?.video_url
            const videoVisivel = videoAberto === item.exercicio_id
            const completedSets = completedSetsMap[item.exercicio_id] || []

            return (
              <div key={idx} className="card p-4 space-y-4 animate-slide-up" style={{ animationDelay: `${idx * 60}ms` }}>
                {/* Exercise header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary-600 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{ex?.nome || `Exercício ${idx + 1}`}</p>
                      {ex?.grupo_muscular && (
                        <p className="text-xs text-gray-400">{ex.grupo_muscular} · {ex.equipamento || ''}</p>
                      )}
                    </div>
                  </div>
                  {temVideo && (
                    <button
                      onClick={() => setVideoAberto(videoVisivel ? null : item.exercicio_id)}
                      className={`flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors flex-shrink-0 ${
                        videoVisivel
                          ? 'bg-primary-100 text-primary-700'
                          : 'bg-gray-100 text-gray-600 hover:bg-primary-50 hover:text-primary-600'
                      }`}
                    >
                      {videoVisivel ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      {videoVisivel ? 'Fechar' : 'Como fazer'}
                    </button>
                  )}
                </div>

                {/* Video */}
                {temVideo && videoVisivel && (
                  <div className="animate-slide-down">
                    <VideoPlayer url={ex.video_url} title={ex.nome} />
                  </div>
                )}

                {/* Set tracker */}
                <SetTracker
                  series={item.series_realizadas}
                  completedSets={completedSets}
                  onToggle={(setIdx) => toggleSet(item.exercicio_id, setIdx)}
                />

                {/* Input fields */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'carga_realizada',      label: 'Carga (kg)', type: 'number' },
                    { key: 'repeticoes_realizadas', label: 'Repetições', type: 'text'   },
                    { key: 'series_realizadas',     label: 'Séries',     type: 'number' },
                  ].map(({ key, label, type }) => (
                    <div key={key}>
                      <label className="text-xs text-gray-500 block mb-1.5 font-medium">{label}</label>
                      <input
                        type={type}
                        className="input text-center text-sm font-semibold py-2.5"
                        value={item[key]}
                        onChange={(e) => setItem(idx, key, e.target.value)}
                        placeholder="—"
                        inputMode={type === 'number' ? 'decimal' : 'text'}
                      />
                    </div>
                  ))}
                </div>

                {/* Set progress indicator */}
                {completedSets.length > 0 && parseInt(item.series_realizadas) > 0 && (
                  <div className="flex items-center gap-2 text-xs text-emerald-600 font-medium">
                    <Check className="w-3.5 h-3.5" />
                    {completedSets.length} de {item.series_realizadas} séries concluídas
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="bg-white border-t border-gray-100 p-4 flex-shrink-0">
        <div className="max-w-lg mx-auto">
          <button
            className="btn-gradient w-full py-4 text-base"
            disabled={isPending}
            onClick={() => mutate()}
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Salvando...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Concluir treino
                {progressPct > 0 && <span className="bg-white/20 rounded-full px-2 py-0.5 text-sm">{progressPct}%</span>}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   WORKOUT CARD (today's list)
───────────────────────────────────────────── */
function TreinoCard({ treino, exercicioMap, onStart }) {
  const [expanded, setExpanded] = useState(false)
  const totalEx = treino.itens?.length || 0
  const preview = (treino.itens || []).slice(0, 3)

  return (
    <div className="card space-y-4 hover:shadow-card-hover transition-all duration-200">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-bold text-gray-900 text-lg">{treino.nome}</h3>
          <p className="text-sm text-gray-500 mt-0.5">
            {totalEx} exercício{totalEx !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="w-10 h-10 bg-primary-50 rounded-2xl flex items-center justify-center">
          <Dumbbell className="w-5 h-5 text-primary-600" />
        </div>
      </div>

      {/* Exercise preview */}
      <div className="space-y-2">
        {preview.map((item, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <span className="w-5 h-5 bg-gray-100 text-gray-500 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
              {idx + 1}
            </span>
            <span className="text-sm text-gray-700 flex-1 truncate">
              {exercicioMap[item.exercicio_id]?.nome || `Exercício ${idx + 1}`}
            </span>
            <span className="text-xs text-gray-400 font-medium flex-shrink-0">
              {item.series}×{item.repeticoes}
            </span>
          </div>
        ))}
        {totalEx > 3 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs text-primary-600 font-semibold hover:text-primary-700"
          >
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {expanded ? 'Mostrar menos' : `+${totalEx - 3} exercícios`}
          </button>
        )}
        {expanded && (treino.itens || []).slice(3).map((item, idx) => (
          <div key={idx + 3} className="flex items-center gap-3 animate-slide-down">
            <span className="w-5 h-5 bg-gray-100 text-gray-500 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
              {idx + 4}
            </span>
            <span className="text-sm text-gray-700 flex-1 truncate">
              {exercicioMap[item.exercicio_id]?.nome || `Exercício ${idx + 4}`}
            </span>
            <span className="text-xs text-gray-400 font-medium flex-shrink-0">
              {item.series}×{item.repeticoes}
            </span>
          </div>
        ))}
      </div>

      <button
        className="btn-gradient w-full"
        onClick={() => onStart(treino)}
      >
        <Play className="w-4 h-4" />
        Iniciar treino
      </button>
    </div>
  )
}

/* ─────────────────────────────────────────────
   STREAK CARD
───────────────────────────────────────────── */
function StreakCard({ gami }) {
  if (!gami) return null
  return (
    <div className="rounded-3xl bg-gradient-to-br from-orange-400 via-red-500 to-rose-600 p-5 text-white shadow-glow-amber">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-white/70 mb-1">Sequência atual</p>
          <div className="flex items-end gap-2">
            <span className="text-5xl font-black">{gami.streak_atual}</span>
            <span className="text-2xl mb-1">🔥</span>
          </div>
          <p className="text-sm text-white/70">dias consecutivos</p>
        </div>
        <div className="text-right space-y-3">
          <div>
            <p className="text-xs text-white/60 font-medium">Recorde</p>
            <p className="text-xl font-bold flex items-center gap-1 justify-end">
              🏆 {gami.streak_recorde}
            </p>
          </div>
          <div>
            <p className="text-xs text-white/60 font-medium">Total</p>
            <p className="text-xl font-bold flex items-center gap-1 justify-end">
              💪 {gami.total_treinos}
            </p>
          </div>
        </div>
      </div>
      {gami.streak_atual > 0 && (
        <div className="mt-4 pt-3 border-t border-white/20">
          <div className="flex gap-1">
            {Array.from({ length: Math.min(gami.streak_atual, 7) }).map((_, i) => (
              <div key={i} className="flex-1 h-1.5 bg-white/60 rounded-full" />
            ))}
            {Array.from({ length: Math.max(0, 7 - gami.streak_atual) }).map((_, i) => (
              <div key={i} className="flex-1 h-1.5 bg-white/20 rounded-full" />
            ))}
          </div>
          <p className="text-xs text-white/60 mt-1.5">
            {gami.streak_atual >= 7 ? '7+ dias seguidos! Incrível! 🎉' : `${7 - gami.streak_atual} dia${7 - gami.streak_atual !== 1 ? 's' : ''} para completar a semana`}
          </p>
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────── */
export default function TreinoHoje() {
  const { user } = useAuth()
  const [treinoAtivo, setTreinoAtivo] = useState(null)

  const { data: alunos = [] } = useQuery({
    queryKey: ['alunos'],
    queryFn: () => listarAlunos().then((r) => r.data),
  })
  const aluno = alunos.find((a) => a.email === user?.email) || alunos[0]

  const { data: treinosHoje = [], isLoading } = useQuery({
    queryKey: ['treino-do-dia', aluno?.id],
    queryFn: () => treinoDodia(aluno.id).then((r) => r.data),
    enabled: !!aluno,
  })

  const { data: gami } = useQuery({
    queryKey: ['gamificacao', aluno?.id],
    queryFn: () => gamificacaoAluno(aluno.id).then((r) => r.data),
    enabled: !!aluno,
  })

  const { data: exercicios = [] } = useQuery({
    queryKey: ['exercicios'],
    queryFn: () => listarExercicios().then((r) => r.data),
  })
  const exercicioMap = Object.fromEntries(exercicios.map((e) => [e.id, e]))

  const DIAS_PT = ['domingo','segunda','terça','quarta','quinta','sexta','sábado']
  const hoje = DIAS_PT[new Date().getDay()]
  const hojeLabel = hoje.charAt(0).toUpperCase() + hoje.slice(1)

  if (isLoading && !aluno) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="w-12 h-12 bg-primary-100 rounded-2xl flex items-center justify-center animate-bounce-light">
          <Dumbbell className="w-6 h-6 text-primary-600" />
        </div>
        <p className="text-sm text-gray-500">Carregando seus treinos...</p>
      </div>
    )
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Greeting */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">
          Olá, {user?.nome?.split(' ')[0]}! 👋
        </h1>
        <p className="text-sm text-gray-500 capitalize">Treinos de {hojeLabel}</p>
      </div>

      {/* Streak card */}
      <StreakCard gami={gami} />

      {/* Workout list */}
      {treinosHoje.length === 0 ? (
        <div className="card text-center py-12 space-y-3">
          <div className="text-6xl">😴</div>
          <div>
            <p className="font-bold text-gray-800 text-lg">Dia de descanso!</p>
            <p className="text-sm text-gray-500 mt-1 max-w-xs mx-auto">
              Não há treinos para hoje. Aproveite para recuperar e hidratar bem.
            </p>
          </div>
          <div className="flex justify-center gap-4 pt-2">
            {[
              { icon: '💧', label: 'Hidratação' },
              { icon: '🥗', label: 'Nutrição'   },
              { icon: '😴', label: 'Descanso'   },
            ].map(({ icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-1">
                <span className="text-2xl">{icon}</span>
                <span className="text-xs text-gray-400 font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {treinosHoje.map((t) => (
            <TreinoCard
              key={t.id}
              treino={t}
              exercicioMap={exercicioMap}
              onStart={setTreinoAtivo}
            />
          ))}
        </div>
      )}

      {/* Execution modal */}
      {treinoAtivo && (
        <ModalExecutar
          treino={treinoAtivo}
          exercicioMap={exercicioMap}
          onClose={() => setTreinoAtivo(null)}
        />
      )}
    </div>
  )
}
