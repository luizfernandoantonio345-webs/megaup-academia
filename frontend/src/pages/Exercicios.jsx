import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listarExercicios, criarExercicio } from '../api'
import toast from 'react-hot-toast'
import { Plus, Dumbbell, Search, X, Loader2, Video } from 'lucide-react'
import { VideoThumb } from '../components/VideoPlayer'

const GRUPOS = ['', 'Peito', 'Costas', 'Ombros', 'Bíceps', 'Tríceps', 'Pernas', 'Glúteos', 'Core', 'Cardio', 'Outro']

export default function Exercicios() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ nome: '', grupo_muscular: '', equipamento: '', video_url: '' })
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const { data: exercicios = [], isLoading } = useQuery({
    queryKey: ['exercicios'],
    queryFn: () => listarExercicios().then((r) => r.data),
  })

  const { mutate, isPending } = useMutation({
    mutationFn: criarExercicio,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['exercicios'] })
      toast.success('Exercício criado!')
      setShowForm(false)
      setForm({ nome: '', grupo_muscular: '', equipamento: '', video_url: '' })
    },
    onError: (err) => toast.error(err.response?.data?.detail || 'Erro'),
  })

  const filtered = exercicios.filter(
    (e) => e.nome.toLowerCase().includes(search.toLowerCase()) ||
            (e.grupo_muscular || '').toLowerCase().includes(search.toLowerCase())
  )

  const globais = filtered.filter((e) => !e.tenant_id)
  const proprios = filtered.filter((e) => e.tenant_id)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Exercícios</h1>
          <p className="text-gray-500">{exercicios.length} exercício{exercicios.length !== 1 ? 's' : ''} disponíveis</p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4" /> Novo exercício
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          className="input pl-9"
          placeholder="Buscar exercício ou grupo muscular..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {showForm && (
        <div className="card border-2 border-primary-200">
          <div className="flex justify-between mb-4">
            <h3 className="font-semibold">Novo exercício</h3>
            <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-gray-400" /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input className="input" placeholder="Nome do exercício*" value={form.nome} onChange={set('nome')} required />
            <select className="input" value={form.grupo_muscular} onChange={set('grupo_muscular')}>
              {GRUPOS.map((g) => <option key={g} value={g}>{g || 'Grupo muscular...'}</option>)}
            </select>
            <input className="input" placeholder="Equipamento (ex: haltere, barra)" value={form.equipamento} onChange={set('equipamento')} />
            <input className="input" placeholder="Link de vídeo (opcional)" value={form.video_url} onChange={set('video_url')} />
          </div>
          <div className="flex gap-3 mt-4">
            <button className="btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
            <button className="btn-primary" disabled={isPending || !form.nome} onClick={() => mutate(form)}>
              {isPending ? 'Criando...' : 'Criar exercício'}
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary-600" /></div>
      ) : (
        <div className="space-y-6">
          {proprios.length > 0 && (
            <Section title="Meus exercícios" items={proprios} />
          )}
          <Section title="Biblioteca global" items={globais} />
        </div>
      )}
    </div>
  )
}

function Section({ title, items }) {
  if (items.length === 0) return null
  return (
    <div>
      <h2 className="font-semibold text-gray-700 text-sm mb-3 uppercase tracking-wide">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map((e) => (
          <div key={e.id} className="card p-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                {e.video_url
                  ? <Video className="w-4 h-4 text-primary-600" />
                  : <Dumbbell className="w-4 h-4 text-primary-600" />}
              </div>
              <div className="min-w-0">
                <div className="font-medium text-gray-900 text-sm">{e.nome}</div>
                {e.grupo_muscular && <div className="text-xs text-gray-500">{e.grupo_muscular}</div>}
                {e.equipamento && <div className="text-xs text-gray-400">{e.equipamento}</div>}
              </div>
            </div>
            {e.video_url && <VideoThumb url={e.video_url} title={e.nome} />}
          </div>
        ))}
      </div>
    </div>
  )
}
