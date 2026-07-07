import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listarExercicios, criarExercicio, seedExercicios, atualizarExercicio, deletarExercicio } from '../api'
import toast from 'react-hot-toast'
import { Plus, Dumbbell, Search, X, Filter, Download, Play, Edit2, Trash2, Link, Video } from 'lucide-react'
import VideoPlayer, { getYouTubeId } from '../components/VideoPlayer'
import { SkeletonCard } from '../components/ui/Skeleton'

const GRUPOS = ['', 'Peito', 'Costas', 'Ombros', 'Biceps', 'Triceps', 'Pernas', 'Gluteos', 'Core', 'Cardio', 'Outro']

const GRUPO_META = {
  Peito:   { color: '#f87171', bg: 'rgba(239,68,68,0.13)',   border: 'rgba(239,68,68,0.28)',   grad: 'linear-gradient(135deg,#450a0a,#1c0505)' },
  Costas:  { color: '#7dd3fc', bg: 'rgba(56,189,248,0.13)',  border: 'rgba(56,189,248,0.28)',  grad: 'linear-gradient(135deg,#082032,#020d18)' },
  Ombros:  { color: '#fde047', bg: 'rgba(234,179,8,0.13)',   border: 'rgba(234,179,8,0.28)',   grad: 'linear-gradient(135deg,#2d2000,#110d00)' },
  Biceps:  { color: '#34d399', bg: 'rgba(16,185,129,0.13)',  border: 'rgba(16,185,129,0.28)',  grad: 'linear-gradient(135deg,#022c1a,#010f09)' },
  Triceps: { color: '#6ee7b7', bg: 'rgba(52,211,153,0.13)',  border: 'rgba(52,211,153,0.28)',  grad: 'linear-gradient(135deg,#022c20,#01110c)' },
  Pernas:  { color: '#c4b5fd', bg: 'rgba(167,139,250,0.13)', border: 'rgba(167,139,250,0.28)', grad: 'linear-gradient(135deg,#1a0a3d,#0a0520)' },
  Gluteos: { color: '#f9a8d4', bg: 'rgba(236,72,153,0.13)',  border: 'rgba(236,72,153,0.28)',  grad: 'linear-gradient(135deg,#3d0a23,#180510)' },
  Core:    { color: '#fdba74', bg: 'rgba(249,115,22,0.13)',  border: 'rgba(249,115,22,0.28)',  grad: 'linear-gradient(135deg,#2d1200,#110700)' },
  Cardio:  { color: '#38bdf8', bg: 'rgba(14,165,233,0.13)',  border: 'rgba(14,165,233,0.28)',  grad: 'linear-gradient(135deg,#082030,#020c17)' },
  Outro:   { color: '#94a3b8', bg: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.1)',  grad: '#1C1C1E' },
}

function GroupBadge({ grupo }) {
  const key = grupo in GRUPO_META ? grupo : 'Outro'
  const m = GRUPO_META[key]
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 9px', borderRadius: 999, fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', background: m.bg, color: m.color, border: `1px solid ${m.border}` }}>
      {grupo || 'Outro'}
    </span>
  )
}

function ExercicioCard({ exercicio: e, onEdit, onDelete }) {
  const [playing, setPlaying] = useState(false)
  const key = e.grupo_muscular in GRUPO_META ? e.grupo_muscular : 'Outro'
  const meta = GRUPO_META[key]
  const ytId = getYouTubeId(e.video_url)
  const isCustom = !!e.tenant_id

  return (
    <div
      style={{ background: '#111113', border: `1px solid ${meta.border}`, borderRadius: 20, overflow: 'hidden', transition: 'transform 0.2s ease, box-shadow 0.2s ease', display: 'flex', flexDirection: 'column', position: 'relative' }}
      onMouseEnter={ev => { ev.currentTarget.style.transform = 'translateY(-3px)'; ev.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,0.4)' }}
      onMouseLeave={ev => { ev.currentTarget.style.transform = 'translateY(0)'; ev.currentTarget.style.boxShadow = 'none' }}
    >
      {/* Botões de ação — só em exercícios próprios */}
      {isCustom && (
        <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 10, display: 'flex', gap: 6 }}>
          <button onClick={() => onEdit(e)} title="Editar" style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(0,0,0,0.65)', border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>
            <Edit2 style={{ width: 12, height: 12, color: '#A1A1AA' }} />
          </button>
          <button onClick={() => onDelete(e)} title="Deletar" style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(0,0,0,0.65)', border: '1px solid rgba(248,113,113,0.3)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>
            <Trash2 style={{ width: 12, height: 12, color: '#f87171' }} />
          </button>
        </div>
      )}

      {playing ? (
        <div style={{ aspectRatio: '16/9' }}>
          <VideoPlayer url={e.video_url} title={e.nome} className="rounded-none" />
        </div>
      ) : (
        <div onClick={() => e.video_url && setPlaying(true)} style={{ position: 'relative', aspectRatio: '16/9', overflow: 'hidden', cursor: e.video_url ? 'pointer' : 'default', background: meta.grad }}>
          {ytId ? (
            <img src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`} alt={e.nome} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', opacity: 0.88 }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Dumbbell style={{ width: 36, height: 36, color: meta.color, opacity: 0.35 }} />
            </div>
          )}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(12,12,13,0.92) 0%, rgba(0,0,0,0.05) 50%)', pointerEvents: 'none' }} />
          {e.video_url && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: `${meta.color}cc`, boxShadow: `0 0 28px ${meta.color}60`, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>
                <svg width="18" height="18" fill="white" viewBox="0 0 24 24" style={{ marginLeft: 2 }}><path d="M8 5v14l11-7z" /></svg>
              </div>
            </div>
          )}
          {!e.tenant_id && (
            <div style={{ position: 'absolute', top: 10, right: 10 }}>
              <span style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', padding: '2px 7px', borderRadius: 999, background: 'rgba(0,0,0,0.55)', color: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(6px)', letterSpacing: '0.07em' }}>Global</span>
            </div>
          )}
        </div>
      )}

      <div style={{ padding: '14px 16px 18px', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
          <GroupBadge grupo={e.grupo_muscular} />
          {e.video_url && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 999, fontSize: 10, fontWeight: 600, background: 'rgba(99,102,241,0.12)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.2)' }}>
              <Play style={{ width: 8, height: 8 }} />Video
            </span>
          )}
        </div>
        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600, color: '#e2e8f0', lineHeight: 1.3, marginBottom: 8 }}>{e.nome}</div>
        {e.equipamento && <div style={{ fontSize: 12, color: '#71717A', lineHeight: 1.5 }}>{e.equipamento}</div>}
        {isCustom && !e.video_url && (
          <button onClick={() => onEdit(e)} style={{ marginTop: 10, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 10px', borderRadius: 8, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', color: '#818cf8', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
            <Video style={{ width: 10, height: 10 }} />Adicionar vídeo
          </button>
        )}
      </div>
    </div>
  )
}

function ExercicioSection({ title, count, items, onEdit, onDelete }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <h2 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, color: '#71717A', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>{title}</h2>
        <span style={{ background: 'rgba(255,255,255,0.06)', color: '#52525B', fontSize: 11, fontWeight: 600, padding: '1px 8px', borderRadius: 999, border: '1px solid rgba(255,255,255,0.07)' }}>{count}</span>
        <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.04)' }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
        {items.map(e => <ExercicioCard key={e.id} exercicio={e} onEdit={onEdit} onDelete={onDelete} />)}
      </div>
    </div>
  )
}

function ExercicioModal({ mode, initial, onClose, onSubmit, isPending }) {
  const [form, setForm] = useState(initial || { nome: '', grupo_muscular: '', equipamento: '', video_url: '' })
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))
  const ytId = getYouTubeId(form.video_url)

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(4px)' }} onClick={onClose} />
      <div style={{ position: 'relative', background: '#111113', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 20, padding: 28, width: '100%', maxWidth: 520, zIndex: 1, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <h3 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, color: '#F4F4F5', fontSize: 17, margin: 0 }}>
              {mode === 'edit' ? 'Editar exercício' : 'Novo exercício'}
            </h3>
            <p style={{ fontSize: 12, color: '#71717A', marginTop: 4, marginBottom: 0 }}>
              {mode === 'edit' ? 'Atualize as informações' : 'Adicione ao seu banco personalizado'}
            </p>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.06)', color: '#71717A', border: 'none', cursor: 'pointer' }}>
            <X style={{ width: 14, height: 14 }} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label className="label">Nome do exercício *</label>
            <input className="input" placeholder="Ex: Supino reto com barra" value={form.nome} onChange={set('nome')} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="label">Grupo muscular</label>
              <select className="input" value={form.grupo_muscular} onChange={set('grupo_muscular')}>
                {GRUPOS.map(g => <option key={g} value={g}>{g || 'Selecionar...'}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Equipamento</label>
              <input className="input" placeholder="Ex: Barra olímpica" value={form.equipamento} onChange={set('equipamento')} />
            </div>
          </div>

          <div>
            <label className="label" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <Link style={{ width: 11, height: 11 }} />
              Link do vídeo (YouTube)
            </label>
            <input className="input" placeholder="https://youtube.com/watch?v=..." value={form.video_url} onChange={set('video_url')} />
            <div style={{ marginTop: 8, padding: '10px 12px', background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 8 }}>
              <p style={{ fontSize: 11, color: '#71717A', margin: 0, lineHeight: 1.6 }}>
                💡 <strong style={{ color: '#818cf8' }}>Dica:</strong> Grave seu vídeo → suba no YouTube como <em>não listado</em> → cole o link aqui. Só você e seus alunos têm acesso.
              </p>
            </div>
          </div>

          {ytId && (
            <div>
              <label className="label">Prévia do vídeo</label>
              <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', aspectRatio: '16/9', border: '1px solid rgba(255,255,255,0.08)' }}>
                <img src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(99,102,241,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="16" height="16" fill="white" viewBox="0 0 24 24" style={{ marginLeft: 2 }}><path d="M8 5v14l11-7z" /></svg>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
          <button className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn-primary" disabled={isPending || !form.nome.trim()} onClick={() => onSubmit(form)} style={{ flex: 1 }}>
            {isPending
              ? <span style={{ width: 15, height: 15, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
              : (mode === 'edit' ? 'Salvar alterações' : 'Criar exercício')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Exercicios() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [filterGrupo, setFilterGrupo] = useState('')
  const [modal, setModal] = useState(null)  // null | { mode: 'create'|'edit', exercicio?: {} }
  const [seeding, setSeeding] = useState(false)

  const { data: exercicios = [], isLoading } = useQuery({
    queryKey: ['exercicios'],
    queryFn: () => listarExercicios().then(r => r.data),
    staleTime: 5 * 60_000,
    placeholderData: (prev) => prev,
  })

  const { mutate: criar, isPending: criando } = useMutation({
    mutationFn: criarExercicio,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['exercicios'] }); toast.success('Exercício criado!'); setModal(null) },
    onError: err => toast.error(err.response?.data?.detail || 'Erro ao criar'),
  })

  const { mutate: atualizar, isPending: atualizando } = useMutation({
    mutationFn: ({ id, data }) => atualizarExercicio(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['exercicios'] }); toast.success('Exercício atualizado!'); setModal(null) },
    onError: err => toast.error(err.response?.data?.detail || 'Erro ao atualizar'),
  })

  const { mutate: deletar } = useMutation({
    mutationFn: deletarExercicio,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['exercicios'] }); toast.success('Exercício removido') },
    onError: () => toast.error('Erro ao remover'),
  })

  const handleSeed = async () => {
    setSeeding(true)
    try {
      const r = await seedExercicios()
      const { criados, total_biblioteca } = r.data
      await qc.invalidateQueries({ queryKey: ['exercicios'] })
      toast.success(criados > 0 ? `${criados} exercícios importados!` : `Biblioteca já importada (${total_biblioteca} exercícios)`)
    } catch {
      toast.error('Erro ao importar biblioteca')
    } finally {
      setSeeding(false)
    }
  }

  const handleEdit = (ex) => setModal({
    mode: 'edit',
    exercicio: { nome: ex.nome, grupo_muscular: ex.grupo_muscular || '', equipamento: ex.equipamento || '', video_url: ex.video_url || '', _id: ex.id },
  })

  const handleDelete = (ex) => {
    if (window.confirm(`Remover "${ex.nome}"?`)) deletar(ex.id)
  }

  const handleSubmit = (form) => {
    if (modal.mode === 'create') {
      criar(form)
    } else {
      const { _id, ...data } = form
      atualizar({ id: _id, data })
    }
  }

  const filtered = exercicios.filter(e => {
    const q = search.toLowerCase()
    return (
      (!q || e.nome?.toLowerCase().includes(q) || (e.grupo_muscular || '').toLowerCase().includes(q) || (e.equipamento || '').toLowerCase().includes(q)) &&
      (!filterGrupo || e.grupo_muscular === filterGrupo)
    )
  })
  const proprios = filtered.filter(e => e.tenant_id)
  const globais  = filtered.filter(e => !e.tenant_id)
  const grupos = [...new Set(exercicios.map(e => e.grupo_muscular).filter(Boolean))]
  const comVideo = exercicios.filter(e => e.video_url).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="animate-fade-in">

      {/* Header */}
      <div style={{ background: '#111113', border: '1px solid rgba(99,102,241,0.18)', borderRadius: 24, padding: '28px 32px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{ width: 36, height: 36, borderRadius: 12, background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Dumbbell style={{ width: 17, height: 17, color: 'white' }} />
              </div>
              <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: 26, fontWeight: 600, color: '#F4F4F5', letterSpacing: '-0.03em', margin: 0 }}>Biblioteca de Exercícios</h1>
            </div>
            <p style={{ fontSize: 13, color: '#71717A', margin: 0 }}>Prescreva com precisão usando demonstrações em vídeo</p>
            {exercicios.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
                {[
                  { label: `${exercicios.length} exercícios`, color: '#a5b4fc', bg: 'rgba(99,102,241,0.12)', border: 'rgba(99,102,241,0.25)' },
                  { label: `${comVideo} com vídeo`, color: '#34d399', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)' },
                  { label: `${grupos.length} grupos`, color: '#fbbf24', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)' },
                ].map(({ label, color, bg, border }) => (
                  <span key={label} style={{ padding: '4px 12px', borderRadius: 999, fontSize: 11, fontWeight: 600, background: bg, color, border: `1px solid ${border}` }}>{label}</span>
                ))}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button className="btn-secondary btn-sm" onClick={handleSeed} disabled={seeding} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 16px' }}>
              <Download style={{ width: 14, height: 14 }} />
              {seeding ? 'Importando...' : 'Importar biblioteca'}
            </button>
            <button className="btn-primary" onClick={() => setModal({ mode: 'create', exercicio: null })}>
              <Plus style={{ width: 15, height: 15 }} />
              Novo exercício
            </button>
          </div>
        </div>
      </div>

      {/* Banner de importação para quem não tem exercícios */}
      {!seeding && exercicios.length < 5 && (
        <div style={{ background: 'linear-gradient(135deg, rgba(14,165,233,0.07) 0%, rgba(99,102,241,0.07) 100%)', border: '1px solid rgba(99,102,241,0.18)', borderRadius: 18, padding: '20px 24px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 16 }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#c7d2fe', fontFamily: 'Inter, sans-serif', marginBottom: 4 }}>
              Importe 90+ exercícios profissionais com vídeos
            </div>
            <div style={{ fontSize: 12, color: '#71717A' }}>
              Demonstrações no YouTube para cada movimento — peito, costas, pernas, cardio e muito mais.
            </div>
          </div>
          <button className="btn-primary" onClick={handleSeed} disabled={seeding}>
            <Download style={{ width: 14, height: 14 }} />
            Importar agora
          </button>
        </div>
      )}

      {/* Search & Filter */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ position: 'relative', flex: '1 1 260px' }}>
          <Search style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: '#71717A' }} />
          <input className="input" style={{ paddingLeft: 42 }} placeholder="Buscar exercício, grupo ou equipamento..." value={search} onChange={e => setSearch(e.target.value)} />
          {search && <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#71717A' }}><X style={{ width: 14, height: 14 }} /></button>}
        </div>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <Filter style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: '#71717A', pointerEvents: 'none' }} />
          <select className="input" style={{ paddingLeft: 38, paddingRight: 14, minWidth: 180 }} value={filterGrupo} onChange={e => setFilterGrupo(e.target.value)}>
            <option value="">Todos os grupos</option>
            {grupos.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
      </div>

      {/* Chips de grupo muscular */}
      {grupos.length > 0 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['', ...grupos].map(g => {
            const active = filterGrupo === g
            const key2 = g in GRUPO_META ? g : 'Outro'
            const m = GRUPO_META[key2]
            return (
              <button key={g || '__all__'} onClick={() => setFilterGrupo(active && g ? '' : g)} style={{ padding: '5px 14px', borderRadius: 999, cursor: 'pointer', fontSize: 12, fontWeight: 600, transition: 'all 0.15s', background: active ? (g ? m.bg : 'rgba(99,102,241,0.2)') : 'rgba(255,255,255,0.04)', color: active ? (g ? m.color : '#a5b4fc') : '#52525B', border: active ? `1px solid ${g ? m.border : 'rgba(99,102,241,0.35)'}` : '1px solid rgba(255,255,255,0.07)', outline: 'none' }}>
                {g || 'Todos'}
              </button>
            )
          })}
        </div>
      )}

      {/* Grid de exercícios */}
      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          {[1,2,3,4,5,6].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
          {proprios.length > 0 && (
            <ExercicioSection title="Meus exercícios" count={proprios.length} items={proprios} onEdit={handleEdit} onDelete={handleDelete} />
          )}
          {globais.length > 0
            ? <ExercicioSection title="Biblioteca global" count={globais.length} items={globais} onEdit={handleEdit} onDelete={handleDelete} />
            : filtered.length === 0 && exercicios.length === 0 && (
              <div style={{ background: '#111113', border: '1px dashed rgba(99,102,241,0.2)', borderRadius: 24, padding: '60px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, textAlign: 'center' }}>
                <div style={{ width: 72, height: 72, borderRadius: 22, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Dumbbell style={{ width: 30, height: 30, color: '#71717A' }} />
                </div>
                <div>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 18, fontWeight: 600, color: '#F4F4F5', margin: '0 0 8px' }}>Nenhum exercício ainda</p>
                  <p style={{ fontSize: 13, color: '#71717A', maxWidth: 340, lineHeight: 1.6, margin: 0 }}>
                    Importe nossa biblioteca com 90+ exercícios profissionais, cada um com demonstração em vídeo.
                  </p>
                </div>
                <button className="btn-primary" onClick={handleSeed} disabled={seeding}>
                  <Download style={{ width: 15, height: 15 }} />
                  Importar biblioteca completa
                </button>
              </div>
            )
          }
          {filtered.length === 0 && exercicios.length > 0 && (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <p style={{ color: '#71717A', fontSize: 14 }}>Nenhum exercício encontrado para os filtros ativos</p>
              <button className="btn-secondary btn-sm" style={{ marginTop: 12 }} onClick={() => { setSearch(''); setFilterGrupo('') }}>Limpar filtros</button>
            </div>
          )}
        </div>
      )}

      {/* Modal criar/editar */}
      {modal && (
        <ExercicioModal
          mode={modal.mode}
          initial={modal.exercicio}
          onClose={() => setModal(null)}
          onSubmit={handleSubmit}
          isPending={criando || atualizando}
        />
      )}
    </div>
  )
}
