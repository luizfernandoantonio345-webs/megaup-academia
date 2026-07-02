import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  obterTreino, listarExercicios, adicionarItem, removerItem, executarTreino, historicoCarga,
} from '../api'
import toast from 'react-hot-toast'
import { ArrowLeft, Plus, Trash2, Play, Loader2, BarChart2, X, Video } from 'lucide-react'
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
      _nome: i.exercicio_id,
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
      toast.success('Treino registrado! 💪')
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h3 className="font-semibold text-lg">Registrar execução</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Como foi o treino?</label>
            <div className="flex gap-2">
              {[
                { key: 'facil', label: '😊 Fácil', color: 'bg-green-50 border-green-300 text-green-700' },
                { key: 'ok', label: '😤 OK', color: 'bg-blue-50 border-blue-300 text-blue-700' },
                { key: 'dificil', label: '😫 Difícil', color: 'bg-red-50 border-red-300 text-red-700' },
              ].map(({ key, label, color }) => (
                <button
                  key={key}
                  onClick={() => setDificuldade(key)}
                  className={`flex-1 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                    dificuldade === key ? color : 'border-gray-200 text-gray-500'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {itens.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700">Registre os valores realizados:</p>
              {itens.map((item, idx) => (
                <div key={idx} className="bg-gray-50 rounded-xl p-3 space-y-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase">Exercício {idx + 1}</p>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-xs text-gray-500">Carga (kg)</label>
                      <input
                        type="number"
                        className="input text-sm"
                        placeholder="ex: 20"
                        value={item.carga_realizada}
                        onChange={(e) => setItem(idx, 'carga_realizada', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Repetições</label>
                      <input
                        type="text"
                        className="input text-sm"
                        placeholder="ex: 12"
                        value={item.repeticoes_realizadas}
                        onChange={(e) => setItem(idx, 'repeticoes_realizadas', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Séries</label>
                      <input
                        type="number"
                        className="input text-sm"
                        placeholder="ex: 3"
                        value={item.series_realizadas}
                        onChange={(e) => setItem(idx, 'series_realizadas', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Comentário (opcional)</label>
            <textarea
              className="input resize-none"
              rows={2}
              placeholder="Como o aluno se sentiu, observações..."
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
            />
          </div>
        </div>

        <div className="border-t border-gray-200 px-6 py-4 flex gap-3">
          <button className="btn-secondary flex-1" onClick={onClose}>Cancelar</button>
          <button className="btn-primary flex-1" disabled={isPending} onClick={() => mutate()}>
            {isPending ? 'Salvando...' : '✓ Salvar execução'}
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

  const { mutate: addItem } = useMutation({
    mutationFn: (data) => adicionarItem(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['treino', id] }); toast.success('Exercício adicionado!'); setShowAddItem(false) },
    onError: (err) => toast.error(err.response?.data?.detail || 'Erro'),
  })
  const { mutate: removeItem } = useMutation({
    mutationFn: (itemId) => removerItem(id, itemId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['treino', id] }); toast.success('Removido') },
    onError: () => toast.error('Erro ao remover'),
  })

  const exercicioMap = Object.fromEntries(exercicios.map((e) => [e.id, e]))

  if (isLoading)
    return <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary-600" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to={`/alunos/${treino?.aluno_id}`} className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{treino?.nome}</h1>
          {treino?.dia_semana && (
            <span className="badge-blue">{treino.dia_semana.charAt(0).toUpperCase() + treino.dia_semana.slice(1)}</span>
          )}
        </div>
        <button
          className="btn-primary flex items-center gap-2 ml-auto"
          onClick={() => setShowExecutar(true)}
        >
          <Play className="w-4 h-4" /> Registrar execução
        </button>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Exercícios ({treino?.itens?.length || 0})</h2>
          <button
            className="btn-secondary flex items-center gap-2 text-sm"
            onClick={() => setShowAddItem(!showAddItem)}
          >
            <Plus className="w-4 h-4" /> Adicionar
          </button>
        </div>

        {showAddItem && (
          <div className="bg-primary-50 border border-primary-200 rounded-xl p-4 mb-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
              <select
                className="input col-span-2 sm:col-span-1"
                value={itemForm.exercicio_id}
                onChange={(e) => setItemForm({ ...itemForm, exercicio_id: e.target.value })}
              >
                <option value="">Selecionar exercício</option>
                {exercicios.map((e) => <option key={e.id} value={e.id}>{e.nome}</option>)}
              </select>
              <input type="number" className="input" placeholder="Séries" value={itemForm.series}
                onChange={(e) => setItemForm({ ...itemForm, series: Number(e.target.value) })} />
              <input type="text" className="input" placeholder="Reps (ex: 12)" value={itemForm.repeticoes}
                onChange={(e) => setItemForm({ ...itemForm, repeticoes: e.target.value })} />
              <input type="number" className="input" placeholder="Carga (kg)" value={itemForm.carga}
                onChange={(e) => setItemForm({ ...itemForm, carga: e.target.value })} />
              <input type="number" className="input" placeholder="Descanso (s)" value={itemForm.descanso_seg}
                onChange={(e) => setItemForm({ ...itemForm, descanso_seg: Number(e.target.value) })} />
            </div>
            <div className="flex gap-2">
              <button className="btn-secondary text-sm" onClick={() => setShowAddItem(false)}>Cancelar</button>
              <button
                className="btn-primary text-sm"
                disabled={!itemForm.exercicio_id}
                onClick={() => addItem({
                  exercicio_id: Number(itemForm.exercicio_id),
                  series: itemForm.series,
                  repeticoes: itemForm.repeticoes,
                  carga: itemForm.carga ? Number(itemForm.carga) : null,
                  descanso_seg: itemForm.descanso_seg,
                  ordem: treino?.itens?.length || 0,
                })}
              >
                Adicionar
              </button>
            </div>
          </div>
        )}

        {treino?.itens?.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-4">Nenhum exercício. Adicione acima.</p>
        ) : (
          <div className="space-y-2">
            {treino?.itens?.map((item, idx) => {
              const ex = exercicioMap[item.exercicio_id]
              return (
                <div key={item.id} className="p-3 bg-gray-50 rounded-xl space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-gray-400 w-5">{idx + 1}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-800 text-sm">{ex?.nome || `Exercício #${item.exercicio_id}`}</span>
                        {ex?.video_url && <Video className="w-3.5 h-3.5 text-blue-500" title="Tem vídeo" />}
                      </div>
                      <div className="text-xs text-gray-500">
                        {item.series}x{item.repeticoes}
                        {item.carga ? ` · ${item.carga}kg` : ''}
                        {item.descanso_seg ? ` · ${item.descanso_seg}s descanso` : ''}
                      </div>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {ex?.video_url && <VideoThumb url={ex.video_url} title={ex.nome} />}
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
