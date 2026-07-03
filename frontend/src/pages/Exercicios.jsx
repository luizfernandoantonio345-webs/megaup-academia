import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listarExercicios, criarExercicio } from '../api'
import toast from 'react-hot-toast'
import { Plus, Dumbbell, Search, X, Video, Filter } from 'lucide-react'
import { VideoThumb } from '../components/VideoPlayer'
import { SkeletonCard } from '../components/ui/Skeleton'

const GRUPOS = ['', 'Peito', 'Costas', 'Ombros', 'Bíceps', 'Tríceps', 'Pernas', 'Glúteos', 'Core', 'Cardio', 'Outro']

const GRUPO_COLORS = {
  'Peito':   { bg: 'bg-red-50',     text: 'text-red-600',    border: 'border-red-200'    },
  'Costas':  { bg: 'bg-blue-50',    text: 'text-blue-600',   border: 'border-blue-200'   },
  'Ombros':  { bg: 'bg-yellow-50',  text: 'text-yellow-600', border: 'border-yellow-200' },
  'Bíceps':  { bg: 'bg-green-50',   text: 'text-green-600',  border: 'border-green-200'  },
  'Tríceps': { bg: 'bg-emerald-50', text: 'text-emerald-600',border: 'border-emerald-200'},
  'Pernas':  { bg: 'bg-purple-50',  text: 'text-purple-600', border: 'border-purple-200' },
  'Glúteos': { bg: 'bg-pink-50',    text: 'text-pink-600',   border: 'border-pink-200'   },
  'Core':    { bg: 'bg-orange-50',  text: 'text-orange-600', border: 'border-orange-200' },
  'Cardio':  { bg: 'bg-sky-50',     text: 'text-sky-600',    border: 'border-sky-200'    },
  'Outro':   { bg: 'bg-gray-50',    text: 'text-gray-600',   border: 'border-gray-200'   },
}

function GroupBadge({ grupo }) {
  const c = GRUPO_COLORS[grupo] || { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200' }
  return (
    <span className={`badge border ${c.bg} ${c.text} ${c.border} text-xs`}>
      {grupo}
    </span>
  )
}

export default function Exercicios() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [filterGrupo, setFilterGrupo] = useState('')
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
      toast.success('Exercício criado com sucesso!')
      setShowForm(false)
      setForm({ nome: '', grupo_muscular: '', equipamento: '', video_url: '' })
    },
    onError: (err) => toast.error(err.response?.data?.detail || 'Erro ao criar exercício'),
  })

  const filtered = exercicios.filter((e) => {
    const matchSearch = e.nome.toLowerCase().includes(search.toLowerCase()) ||
                        (e.grupo_muscular || '').toLowerCase().includes(search.toLowerCase()) ||
                        (e.equipamento || '').toLowerCase().includes(search.toLowerCase())
    const matchGrupo  = !filterGrupo || e.grupo_muscular === filterGrupo
    return matchSearch && matchGrupo
  })

  const proprios = filtered.filter((e) => e.tenant_id)
  const globais  = filtered.filter((e) => !e.tenant_id)

  const gruposDisponiveis = [...new Set(exercicios.map(e => e.grupo_muscular).filter(Boolean))]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Exercícios</h1>
          <p className="page-subtitle">{exercicios.length} exercício{exercicios.length !== 1 ? 's' : ''} disponíveis</p>
        </div>
        <button className="btn-gradient" onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4" />
          Novo exercício
        </button>
      </div>

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            className="input pl-10"
            placeholder="Buscar por nome, grupo ou equipamento..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <select
            className="input pl-10 pr-4 min-w-[180px]"
            value={filterGrupo}
            onChange={(e) => setFilterGrupo(e.target.value)}
          >
            <option value="">Todos os grupos</option>
            {gruposDisponiveis.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
      </div>

      {/* Category pills */}
      {gruposDisponiveis.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterGrupo('')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
              !filterGrupo
                ? 'bg-primary-600 text-white border-primary-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
            }`}
          >
            Todos
          </button>
          {gruposDisponiveis.map(g => {
            const c = GRUPO_COLORS[g] || { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200' }
            const active = filterGrupo === g
            return (
              <button
                key={g}
                onClick={() => setFilterGrupo(active ? '' : g)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                  active
                    ? `${c.bg} ${c.text} ${c.border} ring-1 ring-offset-1 ring-current`
                    : `bg-white text-gray-600 border-gray-200 hover:${c.bg} hover:${c.text} hover:${c.border}`
                }`}
              >
                {g}
              </button>
            )
          })}
        </div>
      )}

      {/* Create form */}
      {showForm && (
        <div className="card border-2 border-primary-200 animate-slide-down">
          <div className="flex justify-between items-start mb-5">
            <div>
              <h3 className="font-bold text-gray-900">Novo exercício</h3>
              <p className="text-sm text-gray-500">Adicione ao seu banco pessoal</p>
            </div>
            <button
              onClick={() => setShowForm(false)}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Nome do exercício *</label>
              <input className="input" placeholder="Ex: Supino reto com barra" value={form.nome} onChange={set('nome')} required />
            </div>
            <div>
              <label className="label">Grupo muscular</label>
              <select className="input" value={form.grupo_muscular} onChange={set('grupo_muscular')}>
                {GRUPOS.map((g) => <option key={g} value={g}>{g || 'Selecionar grupo...'}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Equipamento</label>
              <input className="input" placeholder="Ex: barra olímpica, haltere" value={form.equipamento} onChange={set('equipamento')} />
            </div>
            <div>
              <label className="label">Link de vídeo demonstrativo</label>
              <input className="input" placeholder="YouTube, Vimeo ou MP4..." value={form.video_url} onChange={set('video_url')} />
            </div>
          </div>
          <div className="flex gap-3 mt-5">
            <button className="btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
            <button className="btn-gradient" disabled={isPending || !form.nome} onClick={() => mutate(form)}>
              {isPending ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Criando...
                </span>
              ) : 'Criar exercício'}
            </button>
          </div>
        </div>
      )}

      {/* Results */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <div className="space-y-8">
          {proprios.length > 0 && (
            <ExercicioSection title="Meus exercícios" badge={proprios.length} items={proprios} />
          )}
          {globais.length > 0 ? (
            <ExercicioSection title="Biblioteca global" badge={globais.length} items={globais} />
          ) : filtered.length === 0 ? (
            <div className="card empty-state">
              <div className="empty-icon bg-primary-50">
                <Dumbbell className="w-8 h-8 text-primary-400" />
              </div>
              <p className="empty-title">Nenhum exercício encontrado</p>
              <p className="empty-message">Tente ajustar a busca ou os filtros</p>
              <button className="btn-gradient" onClick={() => { setSearch(''); setFilterGrupo('') }}>
                Limpar filtros
              </button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}

function ExercicioSection({ title, badge, items }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <h2 className="section-title mb-0">{title}</h2>
        <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-0.5 rounded-full">{badge}</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((e) => (
          <ExercicioCard key={e.id} exercicio={e} />
        ))}
      </div>
    </div>
  )
}

function ExercicioCard({ exercicio: e }) {
  return (
    <div className="card p-4 space-y-3 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
          e.video_url ? 'bg-violet-50' : 'bg-primary-50'
        }`}>
          {e.video_url
            ? <Video className="w-4.5 h-4.5 text-violet-600" style={{ width: 18, height: 18 }} />
            : <Dumbbell className="w-4.5 h-4.5 text-primary-600" style={{ width: 18, height: 18 }} />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-gray-900 text-sm leading-tight">{e.nome}</div>
          {e.equipamento && (
            <div className="text-xs text-gray-400 mt-0.5 truncate">{e.equipamento}</div>
          )}
        </div>
      </div>

      {e.grupo_muscular && <GroupBadge grupo={e.grupo_muscular} />}

      {e.video_url && <VideoThumb url={e.video_url} title={e.nome} />}
    </div>
  )
}
