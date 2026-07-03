import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listarExercicios, criarExercicio } from '../api'
import toast from 'react-hot-toast'
import { Plus, Dumbbell, Search, X, Video, Filter } from 'lucide-react'
import { VideoThumb } from '../components/VideoPlayer'
import { SkeletonCard } from '../components/ui/Skeleton'

const GRUPOS = ['', 'Peito', 'Costas', 'Ombros', 'Bíceps', 'Tríceps', 'Pernas', 'Glúteos', 'Core', 'Cardio', 'Outro']

const GRUPO_COLORS = {
  'Peito':   { bg: 'rgba(239,68,68,0.1)',    text: '#f87171',  border: 'rgba(239,68,68,0.25)'   },
  'Costas':  { bg: 'rgba(56,189,248,0.1)',   text: '#7dd3fc',  border: 'rgba(56,189,248,0.25)'  },
  'Ombros':  { bg: 'rgba(234,179,8,0.1)',    text: '#fde047',  border: 'rgba(234,179,8,0.25)'   },
  'Bíceps':  { bg: 'rgba(16,185,129,0.1)',   text: '#34d399',  border: 'rgba(16,185,129,0.25)'  },
  'Tríceps': { bg: 'rgba(52,211,153,0.1)',   text: '#6ee7b7',  border: 'rgba(52,211,153,0.25)'  },
  'Pernas':  { bg: 'rgba(167,139,250,0.1)',  text: '#c4b5fd',  border: 'rgba(167,139,250,0.25)' },
  'Glúteos': { bg: 'rgba(236,72,153,0.1)',   text: '#f9a8d4',  border: 'rgba(236,72,153,0.25)'  },
  'Core':    { bg: 'rgba(249,115,22,0.1)',   text: '#fdba74',  border: 'rgba(249,115,22,0.25)'  },
  'Cardio':  { bg: 'rgba(14,165,233,0.1)',   text: '#7dd3fc',  border: 'rgba(14,165,233,0.25)'  },
  'Outro':   { bg: 'rgba(255,255,255,0.06)', text: '#64748B',  border: 'rgba(255,255,255,0.1)'  },
}

function GroupBadge({ grupo }) {
  const c = GRUPO_COLORS[grupo] || GRUPO_COLORS['Outro']
  return (
    <span style={{ display:'inline-flex', alignItems:'center', padding:'3px 10px', borderRadius:999, fontSize:11, fontWeight:700, background:c.bg, color:c.text, border:`1px solid ${c.border}`, textTransform:'uppercase', letterSpacing:'0.05em' }}>
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
      toast.success('Exercício criado!')
      setShowForm(false)
      setForm({ nome: '', grupo_muscular: '', equipamento: '', video_url: '' })
    },
    onError: (err) => toast.error(err.response?.data?.detail || 'Erro ao criar exercício'),
  })

  const filtered = exercicios.filter((e) => {
    const q = search.toLowerCase()
    return (!q || e.nome.toLowerCase().includes(q) || (e.grupo_muscular||'').toLowerCase().includes(q) || (e.equipamento||'').toLowerCase().includes(q))
        && (!filterGrupo || e.grupo_muscular === filterGrupo)
  })
  const proprios = filtered.filter(e => e.tenant_id)
  const globais  = filtered.filter(e => !e.tenant_id)
  const grupos = [...new Set(exercicios.map(e => e.grupo_muscular).filter(Boolean))]

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Exercícios</h1>
          <p className="page-subtitle">{exercicios.length} exercício{exercicios.length !== 1 ? 's' : ''} disponíveis</p>
        </div>
        <button className="btn-gradient" onClick={() => setShowForm(true)}>
          <Plus style={{ width: 16, height: 16 }} /> Novo exercício
        </button>
      </div>

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', width:16, height:16, color:'#3D4F6A' }} />
          <input className="input pl-11" placeholder="Buscar por nome, grupo ou equipamento..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="relative">
          <Filter style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', width:15, height:15, color:'#3D4F6A', pointerEvents:'none' }} />
          <select className="input pl-11 pr-4 min-w-[180px]" value={filterGrupo} onChange={e => setFilterGrupo(e.target.value)}>
            <option value="">Todos os grupos</option>
            {grupos.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
      </div>

      {/* Category pills */}
      {grupos.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setFilterGrupo('')} className="btn-sm transition-all"
            style={{ background: !filterGrupo ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)', color: !filterGrupo ? '#a5b4fc' : '#4B5768', border: `1px solid ${!filterGrupo ? 'rgba(99,102,241,0.35)' : 'rgba(255,255,255,0.07)'}`, borderRadius: 999 }}>
            Todos
          </button>
          {grupos.map(g => {
            const c = GRUPO_COLORS[g] || GRUPO_COLORS['Outro']
            const active = filterGrupo === g
            return (
              <button key={g} onClick={() => setFilterGrupo(active ? '' : g)} className="btn-sm transition-all"
                style={{ background: active ? c.bg : 'rgba(255,255,255,0.04)', color: active ? c.text : '#4B5768', border: `1px solid ${active ? c.border : 'rgba(255,255,255,0.07)'}`, borderRadius: 999 }}>
                {g}
              </button>
            )
          })}
        </div>
      )}

      {/* Create form */}
      {showForm && (
        <div className="card animate-slide-down" style={{ border: '1px solid rgba(99,102,241,0.3)' }}>
          <div className="flex justify-between items-start mb-5">
            <div>
              <h3 style={{ fontFamily:'Space Grotesk, sans-serif', fontWeight:700, color:'#EFF6FF', fontSize:15 }}>Novo exercício</h3>
              <p style={{ fontSize:12, color:'#3D4F6A', marginTop:2 }}>Adicione ao seu banco pessoal</p>
            </div>
            <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background:'rgba(255,255,255,0.07)', color:'#64748B' }}>
              <X style={{ width:14, height:14 }} />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Nome do exercício *</label>
              <input className="input" placeholder="Ex: Supino reto com barra" value={form.nome} onChange={set('nome')} />
            </div>
            <div>
              <label className="label">Grupo muscular</label>
              <select className="input" value={form.grupo_muscular} onChange={set('grupo_muscular')}>
                {GRUPOS.map(g => <option key={g} value={g}>{g || 'Selecionar grupo...'}</option>)}
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
              {isPending ? <span className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor:'rgba(255,255,255,0.3)', borderTopColor:'white' }} /> : 'Criar exercício'}
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
          {proprios.length > 0 && <ExercicioSection title="Meus exercícios" count={proprios.length} items={proprios} />}
          {globais.length > 0
            ? <ExercicioSection title="Biblioteca global" count={globais.length} items={globais} />
            : filtered.length === 0 && (
              <div className="card empty-state">
                <div className="empty-icon"><Dumbbell style={{ width:28, height:28, color:'#4B5768' }} /></div>
                <p className="empty-title">Nenhum exercício encontrado</p>
                <p className="empty-message">Tente ajustar a busca ou os filtros</p>
                <button className="btn-gradient" onClick={() => { setSearch(''); setFilterGrupo('') }}>Limpar filtros</button>
              </div>
            )
          }
        </div>
      )}
    </div>
  )
}

function ExercicioSection({ title, count, items }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <h2 style={{ fontFamily:'Space Grotesk, sans-serif', fontWeight:700, color:'#94A3B8', fontSize:13, textTransform:'uppercase', letterSpacing:'0.06em' }}>{title}</h2>
        <span style={{ background:'rgba(255,255,255,0.07)', color:'#64748B', fontSize:11, fontWeight:700, padding:'2px 8px', borderRadius:999 }}>{count}</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(e => <ExercicioCard key={e.id} exercicio={e} />)}
      </div>
    </div>
  )
}

function ExercicioCard({ exercicio: e }) {
  return (
    <div className="card-interactive space-y-3">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: e.video_url ? 'rgba(167,139,250,0.15)' : 'rgba(99,102,241,0.12)' }}>
          {e.video_url
            ? <Video style={{ width:17, height:17, color:'#c4b5fd' }} />
            : <Dumbbell style={{ width:17, height:17, color:'#818cf8' }} />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm leading-tight" style={{ color:'#CBD5E1', fontFamily:'Space Grotesk, sans-serif' }}>{e.nome}</div>
          {e.equipamento && <div className="text-xs mt-0.5 truncate" style={{ color:'#3D4F6A' }}>{e.equipamento}</div>}
        </div>
      </div>
      {e.grupo_muscular && <GroupBadge grupo={e.grupo_muscular} />}
      {e.video_url && <VideoThumb url={e.video_url} title={e.nome} />}
    </div>
  )
}
