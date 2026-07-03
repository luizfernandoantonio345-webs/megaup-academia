import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { obterTreino, listarExercicios, adicionarItem, removerItem, executarTreino } from '../api'
import toast from 'react-hot-toast'
import { ArrowLeft, Plus, Trash2, Play, Loader2, X, Video, Clock, Dumbbell, GripVertical } from 'lucide-react'
import { VideoThumb } from '../components/VideoPlayer'

function ModalExecutar({ treino, onClose }) {
  const qc = useQueryClient()
  const [dificuldade, setDificuldade] = useState('ok')
  const [comentario, setComentario] = useState('')
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
      comentario,
      itens: itens.map((i) => ({
        exercicio_id: i.exercicio_id,
        treino_item_id: i.treino_item_id,
        carga_realizada: i.carga_realizada ? Number(i.carga_realizada) : null,
        repeticoes_realizadas: i.repeticoes_realizadas || null,
        series_realizadas: i.series_realizadas ? Number(i.series_realizadas) : null,
      })),
    }),
    onSuccess: () => {
      toast.success('Execução registrada! 💪')
      qc.invalidateQueries()
      onClose()
    },
    onError: (err) => toast.error(err.response?.data?.detail || 'Erro'),
  })

  const setItem = (idx, key, val) => {
    const copy = [...itens]
    copy[idx] = { ...copy[idx], [key]: val }
    setItens(copy)
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg max-h-[88vh] overflow-hidden shadow-glass flex flex-col animate-scale-in">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
          <div>
            <h3 className="font-bold text-lg text-gray-900">Registrar execução</h3>
            <p className="text-xs text-gray-500">{treino.nome}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Difficulty */}
          <div>
            <label className="label">Como foi o treino?</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: 'facil',  emoji: '😊', label: 'Fácil',   cls: 'border-emerald-400 bg-emerald-50 text-emerald-700' },
                { key: 'ok',     emoji: '💪', label: 'Normal',  cls: 'border-primary-400 bg-primary-50 text-primary-700'  },
                { key: 'dificil',emoji: '🔥', label: 'Pesado',  cls: 'border-red-400 bg-red-50 text-red-700'              },
              ].map(({ key, emoji, label, cls }) => (
                <button
                  key={key}
                  onClick={() => setDificuldade(key)}
                  className={`py-3 rounded-2xl border-2 text-sm font-semibold transition-all ${
                    dificuldade === key ? cls : 'border-gray-200 text-gray-400 hover:border-gray-300'
                  }`}
                >
                  <div className="text-xl mb-0.5">{emoji}</div>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Exercise inputs */}
          {itens.length > 0 && (
            <div className="space-y-3">
              <label className="label">Valores realizados</label>
              {itens.map((item, idx) => (
                <div key={idx} className="bg-gray-50 rounded-2xl p-4 space-y-2">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Exercício {idx + 1}</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: 'carga_realizada',      label: 'Carga (kg)', type: 'number' },
                      { key: 'repeticoes_realizadas', label: 'Reps',       type: 'text'   },
                      { key: 'series_realizadas',     label: 'Séries',     type: 'number' },
                    ].map(({ key, label, type }) => (
                      <div key={key}>
                        <label className="text-xs text-gray-400 block mb-1">{label}</label>
                        <input
                          type={type}
                          className="input text-sm text-center font-semibold py-2"
                          value={item[key]}
                          onChange={(e) => setItem(idx, key, e.target.value)}
                          placeholder="—"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Comment */}
          <div>
            <label className="label">Observações do personal (opcional)</label>
            <textarea
              className="input resize-none"
              rows={2}
              placeholder="Como o aluno se sentiu, feedback..."
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
            />
          </div>
        </div>

        <div className="border-t border-gray-100 px-6 py-4 flex gap-3">
          <button className="btn-secondary flex-1" onClick={onClose}>Cancelar</button>
          <button className="btn-gradient flex-1" disabled={isPending} onClick={() => mutate()}>
            {isPending ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Salvando...
              </span>
            ) : '✓ Salvar execução'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function TreinoDetalhe() {
  const { id } = useParams()
  const qc = useQueryClient()
  const [showExecutar, setShowExecutar] = useState(false)
  const [showAddItem, setShowAddItem] = useState(false)
  const [itemForm, setItemForm] = useState({ exercicio_id: '', series: 3, repeticoes: '12', carga: '', descanso_seg: 60 })

  const { data: treino, isLoading } = useQuery({
    queryKey: ['treino', id],
    queryFn: () => obterTreino(id).then((r) => r.data),
  })
  const { data: exercicios = [] } = useQuery({
    queryKey: ['exercicios'],
    queryFn: () => listarExercicios().then((r) => r.data),
  })

  const { mutate: addItem, isPending: addingItem } = useMutation({
    mutationFn: (data) => adicionarItem(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['treino', id] })
      toast.success('Exercício adicionado!')
      setShowAddItem(false)
      setItemForm({ exercicio_id: '', series: 3, repeticoes: '12', carga: '', descanso_seg: 60 })
    },
    onError: (err) => toast.error(err.response?.data?.detail || 'Erro'),
  })

  const { mutate: removeItem } = useMutation({
    mutationFn: (itemId) => removerItem(id, itemId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['treino', id] }); toast.success('Exercício removido') },
    onError: () => toast.error('Erro ao remover'),
  })

  const exercicioMap = Object.fromEntries(exercicios.map((e) => [e.id, e]))

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  const totalVolume = treino?.itens?.reduce((s, i) => s + (i.series || 0) * (parseFloat(i.carga) || 0), 0) || 0

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <Link to={`/alunos/${treino?.aluno_id}`} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" />
          Voltar para o aluno
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="page-title">{treino?.nome}</h1>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              {treino?.dia_semana && (
                <span className="badge-blue capitalize">{treino.dia_semana}</span>
              )}
              <span className="text-sm text-gray-400">
                {treino?.itens?.length || 0} exercício{treino?.itens?.length !== 1 ? 's' : ''}
              </span>
              {totalVolume > 0 && (
                <span className="text-sm text-gray-400">
                  {totalVolume.toFixed(0)} kg de volume total
                </span>
              )}
            </div>
          </div>
          <button className="btn-gradient flex-shrink-0" onClick={() => setShowExecutar(true)}>
            <Play className="w-4 h-4" />
            Registrar execução
          </button>
        </div>
      </div>

      {/* Exercise list */}
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-gray-900">Exercícios</h2>
          <button className="btn-secondary btn-sm" onClick={() => setShowAddItem(!showAddItem)}>
            <Plus className="w-3.5 h-3.5" /> Adicionar
          </button>
        </div>

        {/* Add item form */}
        {showAddItem && (
          <div className="bg-primary-50 border-2 border-primary-200 rounded-2xl p-4 mb-5 animate-slide-down">
            <h3 className="font-semibold text-gray-800 mb-4">Adicionar exercício</h3>
            <div className="space-y-3">
              <div>
                <label className="label">Exercício *</label>
                <select
                  className="input"
                  value={itemForm.exercicio_id}
                  onChange={(e) => setItemForm({ ...itemForm, exercicio_id: e.target.value })}
                >
                  <option value="">Selecionar exercício...</option>
                  {exercicios.map((e) => (
                    <option key={e.id} value={e.id}>{e.nome}{e.grupo_muscular ? ` (${e.grupo_muscular})` : ''}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="label">Séries</label>
                  <input type="number" className="input text-center" value={itemForm.series} onChange={(e) => setItemForm({ ...itemForm, series: Number(e.target.value) })} min="1" />
                </div>
                <div>
                  <label className="label">Reps</label>
                  <input type="text" className="input text-center" placeholder="12 ou 8-12" value={itemForm.repeticoes} onChange={(e) => setItemForm({ ...itemForm, repeticoes: e.target.value })} />
                </div>
                <div>
                  <label className="label">Carga (kg)</label>
                  <input type="number" className="input text-center" placeholder="0" value={itemForm.carga} onChange={(e) => setItemForm({ ...itemForm, carga: e.target.value })} />
                </div>
                <div>
                  <label className="label">Descanso (s)</label>
                  <input type="number" className="input text-center" value={itemForm.descanso_seg} onChange={(e) => setItemForm({ ...itemForm, descanso_seg: Number(e.target.value) })} />
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button className="btn-secondary" onClick={() => setShowAddItem(false)}>Cancelar</button>
              <button
                className="btn-gradient"
                disabled={!itemForm.exercicio_id || addingItem}
                onClick={() => addItem({
                  exercicio_id: Number(itemForm.exercicio_id),
                  series: itemForm.series,
                  repeticoes: itemForm.repeticoes,
                  carga: itemForm.carga ? Number(itemForm.carga) : null,
                  descanso_seg: itemForm.descanso_seg,
                  ordem: treino?.itens?.length || 0,
                })}
              >
                {addingItem ? 'Adicionando...' : 'Adicionar'}
              </button>
            </div>
          </div>
        )}

        {/* Item list */}
        {!treino?.itens?.length ? (
          <div className="empty-state py-10">
            <div className="empty-icon bg-primary-50">
              <Dumbbell className="w-8 h-8 text-primary-400" />
            </div>
            <p className="empty-title">Nenhum exercício ainda</p>
            <p className="empty-message">Adicione exercícios para montar este treino</p>
            <button className="btn-gradient" onClick={() => setShowAddItem(true)}>
              Adicionar exercício
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {treino.itens.map((item, idx) => {
              const ex = exercicioMap[item.exercicio_id]
              return (
                <div key={item.id} className="group flex items-start gap-3 p-4 bg-gray-50 hover:bg-gray-100/80 rounded-2xl transition-colors">
                  <div className="text-gray-300 mt-1 cursor-grab">
                    <GripVertical className="w-4 h-4" />
                  </div>
                  <div className="w-7 h-7 bg-primary-600 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900 text-sm">{ex?.nome || `Exercício #${item.exercicio_id}`}</span>
                      {ex?.video_url && <Video className="w-3.5 h-3.5 text-violet-500" />}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-1 flex-wrap">
                      <span className="font-semibold">{item.series} × {item.repeticoes}</span>
                      {item.carga    && <span>{item.carga} kg</span>}
                      {item.descanso_seg && (
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{item.descanso_seg}s</span>
                      )}
                      {ex?.grupo_muscular && <span className="text-gray-400">{ex.grupo_muscular}</span>}
                    </div>
                    {ex?.video_url && <VideoThumb url={ex.video_url} title={ex.nome} />}
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="flex-shrink-0 w-7 h-7 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                    title="Remover exercício"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {showExecutar && treino && (
        <ModalExecutar treino={treino} onClose={() => setShowExecutar(false)} />
      )}
    </div>
  )
}
