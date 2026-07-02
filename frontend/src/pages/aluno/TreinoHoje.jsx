import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../contexts/AuthContext'
import { listarAlunos, treinoDodia, listarExercicios, executarTreino, gamificacaoAluno } from '../../api'
import toast from 'react-hot-toast'
import { Play, Dumbbell, Loader2, CheckCircle, X, ChevronDown, ChevronUp } from 'lucide-react'
import VideoPlayer from '../../components/VideoPlayer'

function ModalExecutar({ treino, exercicioMap, onClose }) {
  const qc = useQueryClient()
  const [dificuldade, setDificuldade] = useState('ok')
  const [videoAberto, setVideoAberto] = useState(null) // exercicio_id com vídeo aberto
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
      toast.success('Treino registrado! 💪 Continue assim!')
      qc.invalidateQueries()
      onClose()
    },
    onError: () => toast.error('Erro ao registrar'),
  })

  const setItem = (idx, key, val) => {
    const copy = [...itens]
    copy[idx] = { ...copy[idx], [key]: val }
    setItens(copy)
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex flex-col">
      <div className="bg-white flex-1 overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center">
          <h3 className="font-bold text-lg">{treino.nome}</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
        </div>

        <div className="p-4 space-y-5">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Como foi?</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: 'facil', emoji: '😊', label: 'Fácil', cls: 'bg-green-50 border-green-400 text-green-700' },
                { key: 'ok', emoji: '😤', label: 'Normal', cls: 'bg-blue-50 border-blue-400 text-blue-700' },
                { key: 'dificil', emoji: '😫', label: 'Pesado', cls: 'bg-red-50 border-red-400 text-red-700' },
              ].map(({ key, emoji, label, cls }) => (
                <button
                  key={key}
                  onClick={() => setDificuldade(key)}
                  className={`py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                    dificuldade === key ? cls : 'border-gray-200 text-gray-400'
                  }`}
                >
                  <div className="text-xl mb-0.5">{emoji}</div>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {itens.map((item, idx) => {
            const ex = exercicioMap[item.exercicio_id]
            const temVideo = !!ex?.video_url
            const videoVisivel = videoAberto === item.exercicio_id

            return (
              <div key={idx} className="bg-gray-50 rounded-2xl p-4 space-y-3">
                {/* Cabeçalho do exercício */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-800">
                      {ex?.nome || `Exercício ${idx + 1}`}
                    </p>
                    {ex?.grupo_muscular && (
                      <p className="text-xs text-gray-400">{ex.grupo_muscular}</p>
                    )}
                  </div>
                  {temVideo && (
                    <button
                      onClick={() => setVideoAberto(videoVisivel ? null : item.exercicio_id)}
                      className="flex items-center gap-1 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-full transition-colors"
                    >
                      {videoVisivel ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      {videoVisivel ? 'Fechar' : 'Ver como fazer'}
                    </button>
                  )}
                </div>

                {/* Player de vídeo expansível */}
                {temVideo && videoVisivel && (
                  <VideoPlayer url={ex.video_url} title={ex.nome} />
                )}

                {/* Campos de registro */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'carga_realizada', label: 'Carga kg', type: 'number' },
                    { key: 'repeticoes_realizadas', label: 'Reps', type: 'text' },
                    { key: 'series_realizadas', label: 'Séries', type: 'number' },
                  ].map(({ key, label, type }) => (
                    <div key={key}>
                      <label className="text-xs text-gray-500 block mb-1">{label}</label>
                      <input
                        type={type}
                        className="input text-center text-sm"
                        value={item[key]}
                        onChange={(e) => setItem(idx, key, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="bg-white border-t border-gray-200 p-4">
        <button
          className="btn-primary w-full py-4 text-base"
          disabled={isPending}
          onClick={() => mutate()}
        >
          {isPending ? 'Salvando...' : '✓ Concluir treino'}
        </button>
      </div>
    </div>
  )
}

export default function TreinoHoje() {
  const { user } = useAuth()
  const [treinoAtivo, setTreinoAtivo] = useState(null)

  // Descobrir o aluno_id do usuário logado
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

  const DIAS_PT = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado']
  const hoje = DIAS_PT[new Date().getDay()]

  if (isLoading)
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )

  return (
    <div className="space-y-6">
      {/* Streak */}
      {gami && (
        <div className="bg-gradient-to-r from-orange-400 to-red-500 rounded-2xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium opacity-80">Streak atual</div>
              <div className="text-4xl font-bold">{gami.streak_atual} 🔥</div>
              <div className="text-sm opacity-70">dias consecutivos</div>
            </div>
            <div className="text-right">
              <div className="text-sm opacity-70">Recorde</div>
              <div className="text-2xl font-bold">🏆 {gami.streak_recorde}</div>
              <div className="text-xs opacity-70">{gami.total_treinos} treinos total</div>
            </div>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-xl font-bold text-gray-900">
          Treinos de {hoje.charAt(0).toUpperCase() + hoje.slice(1)}
        </h2>
        {treinosHoje.length === 0 && (
          <p className="text-gray-400 text-sm mt-1">Hoje é dia de descanso! 😴</p>
        )}
      </div>

      {treinosHoje.length > 0 ? (
        <div className="space-y-4">
          {treinosHoje.map((t) => (
            <div key={t.id} className="card">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{t.nome}</h3>
                  <p className="text-sm text-gray-500">{t.itens?.length || 0} exercícios</p>
                </div>
                <Dumbbell className="w-6 h-6 text-primary-400" />
              </div>

              <div className="space-y-2 mb-4">
                {(t.itens || []).slice(0, 4).map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-sm">
                    <span className="w-5 h-5 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center text-xs font-bold">
                      {idx + 1}
                    </span>
                    <span className="text-gray-700">
                      {exercicioMap[item.exercicio_id]?.nome || `Exercício ${idx + 1}`}
                    </span>
                    <span className="text-gray-400 ml-auto">
                      {item.series}x{item.repeticoes}
                    </span>
                  </div>
                ))}
                {(t.itens?.length || 0) > 4 && (
                  <p className="text-xs text-gray-400">+{t.itens.length - 4} mais...</p>
                )}
              </div>

              <button
                className="btn-primary w-full flex items-center justify-center gap-2"
                onClick={() => setTreinoAtivo(t)}
              >
                <Play className="w-4 h-4" />
                Iniciar treino
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-10">
          <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
          <p className="font-medium text-gray-700">Nenhum treino para hoje</p>
          <p className="text-sm text-gray-400 mt-1">Aproveite para descansar e recuperar! 💤</p>
        </div>
      )}

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
