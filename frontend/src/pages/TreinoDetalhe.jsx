import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { obterTreino, listarExercicios, adicionarItem, removerItem, executarTreino, templateFromTreino, duplicarTreino } from '../api'
import toast from 'react-hot-toast'
import { ArrowLeft, Plus, Trash2, Play, Loader2, X, Video, Clock, Dumbbell, GripVertical, ChevronDown, Copy, CopyPlus } from 'lucide-react'
import { VideoThumb } from '../components/VideoPlayer'

const DIFICULDADE = [
  { key:'facil',   emoji:'😊', label:'Fácil',  bg:'rgba(16,185,129,0.12)', border:'rgba(16,185,129,0.35)', text:'#34d399' },
  { key:'ok',      emoji:'💪', label:'Normal', bg:'rgba(99,102,241,0.12)', border:'rgba(99,102,241,0.35)', text:'#fca5a5' },
  { key:'dificil', emoji:'🔥', label:'Pesado', bg:'rgba(239,68,68,0.12)',  border:'rgba(239,68,68,0.35)',  text:'#f87171' },
]

function ModalExecutar({ treino, onClose }) {
  const qc = useQueryClient()
  const [dificuldade, setDificuldade] = useState('ok')
  const [comentario, setComentario] = useState('')
  const [itens, setItens] = useState(
    (treino.itens || []).map(i => ({
      exercicio_id: i.exercicio_id,
      treino_item_id: i.id,
      carga_realizada: i.carga || '',
      repeticoes_realizadas: i.repeticoes || '',
      series_realizadas: i.series || '',
    }))
  )

  const { mutate, isPending } = useMutation({
    mutationFn: () => executarTreino(treino.id, {
      dificuldade, comentario,
      itens: itens.map(i => ({
        exercicio_id: i.exercicio_id,
        treino_item_id: i.treino_item_id,
        carga_realizada: i.carga_realizada ? Number(i.carga_realizada) : null,
        repeticoes_realizadas: i.repeticoes_realizadas || null,
        series_realizadas: i.series_realizadas ? Number(i.series_realizadas) : null,
      })),
    }),
    onSuccess: () => { toast.success('Execução registrada! 💪'); qc.invalidateQueries(); onClose() },
    onError: err => toast.error(err.response?.data?.detail || 'Erro'),
  })

  const setItem = (idx, key, val) => {
    const copy = [...itens]
    copy[idx] = { ...copy[idx], [key]: val }
    setItens(copy)
  }

  const volumeTotal = itens.reduce((acc, i) => {
    const s = Number(i.series_realizadas) || 0
    const r = Number(i.repeticoes_realizadas) || 0
    const c = Number(i.carga_realizada) || 0
    return acc + s * r * c
  }, 0)

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', backdropFilter:'blur(8px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50, padding:16 }}>
      <div className="animate-scale-in" style={{ background:'var(--bg-card)', border:'1px solid rgba(99,102,241,0.2)', borderRadius:24, width:'100%', maxWidth:520, maxHeight:'88vh', overflow:'hidden', display:'flex', flexDirection:'column' }}>
        {/* Modal header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'18px 24px', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
          <div>
            <h3 style={{ fontFamily:'Inter, sans-serif', fontWeight:600, fontSize:16, color:'var(--text-primary)' }}>Registrar execução</h3>
            <p style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>{treino.nome}</p>
          </div>
          <button onClick={onClose} style={{ width:32, height:32, borderRadius:10, background:'rgba(255,255,255,0.07)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text-muted)' }}>
            <X style={{ width:15, height:15 }} />
          </button>
        </div>

        {/* Modal body */}
        <div style={{ flex:1, overflowY:'auto', padding:24, display:'flex', flexDirection:'column', gap:20 }}>
          {/* Difficulty */}
          <div>
            <label className="label">Como foi o treino?</label>
            <div className="grid grid-cols-3 gap-2">
              {DIFICULDADE.map(({ key, emoji, label, bg, border, text }) => (
                <button key={key} onClick={() => setDificuldade(key)} style={{
                  padding:'12px 8px', borderRadius:16, border:`2px solid ${dificuldade === key ? border : 'rgba(255,255,255,0.07)'}`,
                  background: dificuldade === key ? bg : 'rgba(255,255,255,0.03)',
                  color: dificuldade === key ? text : 'var(--text-muted)',
                  fontWeight:600, fontSize:13, cursor:'pointer', transition:'all 0.15s',
                }}>
                  <div style={{ fontSize:22, marginBottom:4 }}>{emoji}</div>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Exercise inputs */}
          {itens.length > 0 && (
            <div>
              <label className="label">Valores realizados</label>
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {itens.map((item, idx) => (
                  <div key={idx} style={{ background:'rgba(255,255,255,0.03)', borderRadius:16, padding:14, border:'1px solid rgba(255,255,255,0.05)' }}>
                    <p style={{ fontSize:11, fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:10 }}>
                      Exercício {idx + 1}
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { key:'carga_realizada',       label:'Carga (kg)', type:'number' },
                        { key:'repeticoes_realizadas',  label:'Reps',       type:'text' },
                        { key:'series_realizadas',      label:'Séries',     type:'number' },
                      ].map(({ key, label, type }) => (
                        <div key={key}>
                          <label style={{ fontSize:10, color:'var(--text-muted)', display:'block', marginBottom:4, fontWeight:600 }}>{label}</label>
                          <input type={type} className="input text-center font-semibold" style={{ padding:'8px 4px', fontSize:13 }} value={item[key]} onChange={e => setItem(idx, key, e.target.value)} placeholder="—" />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Comment */}
          <div>
            <label className="label">Observações do personal (opcional)</label>
            <textarea className="input resize-none" rows={2} placeholder="Como o aluno se sentiu, feedback..." value={comentario} onChange={e => setComentario(e.target.value)} />
          </div>
        </div>

        {/* Modal footer */}
        <div style={{ borderTop:'1px solid rgba(255,255,255,0.05)', padding:'14px 24px' }}>
          {volumeTotal > 0 && (
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6, marginBottom:12, padding:'7px 12px', borderRadius:8, background:'rgba(99,102,241,0.08)', border:'1px solid rgba(99,102,241,0.15)' }}>
              <Dumbbell style={{ width:12, height:12, color:'#f87171' }} />
              <span style={{ fontSize:12, color:'#fca5a5', fontWeight:600 }}>Volume total: {volumeTotal.toLocaleString('pt-BR')} kg</span>
            </div>
          )}
          <div style={{ display:'flex', gap:10 }}>
          <button className="btn-secondary flex-1" onClick={onClose}>Cancelar</button>
          <button className="btn-primary flex-1" disabled={isPending} onClick={() => mutate()}>
            {isPending ? (
              <span style={{ display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ width:14, height:14, border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'white', borderRadius:'50%', display:'inline-block', animation:'spin 1s linear infinite' }} />
                Salvando...
              </span>
            ) : '✓ Salvar execução'}
          </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const GRUPO_COLORS = {
  Peito:    { bg:'rgba(239,68,68,0.1)',    text:'#f87171' },
  Costas:   { bg:'rgba(6,182,212,0.1)',    text:'#22d3ee' },
  Pernas:   { bg:'rgba(16,185,129,0.1)',   text:'#34d399' },
  Ombros:   { bg:'rgba(245,158,11,0.1)',   text:'#fbbf24' },
  Bíceps:   { bg:'rgba(99,102,241,0.1)',   text:'#fca5a5' },
  Tríceps:  { bg:'rgba(124,58,237,0.1)',   text:'#c084fc' },
  Abdômen:  { bg:'rgba(249,115,22,0.1)',   text:'#fb923c' },
  Glúteos:  { bg:'rgba(236,72,153,0.1)',   text:'#f472b6' },
  default:  { bg:'rgba(100,116,139,0.1)',  text:'var(--text-secondary)' },
}

export default function TreinoDetalhe() {
  const { id } = useParams()
  const qc = useQueryClient()
  const [showExecutar, setShowExecutar] = useState(false)
  const [showAddItem, setShowAddItem] = useState(false)
  const [itemForm, setItemForm] = useState({ exercicio_id: '', series: 3, repeticoes: '12', carga: '', descanso_seg: 60 })
  const [showSalvarTemplate, setShowSalvarTemplate] = useState(false)
  const [templateNome, setTemplateNome] = useState('')
  const [duplicando, setDuplicando] = useState(false)

  const { data: treino, isLoading } = useQuery({ queryKey:['treino', id], queryFn: () => obterTreino(id).then(r => r.data) })
  const { data: exercicios = [] } = useQuery({ queryKey:['exercicios'], queryFn: () => listarExercicios().then(r => r.data) })

  const { mutate: addItem, isPending: addingItem } = useMutation({
    mutationFn: data => adicionarItem(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey:['treino', id] }); toast.success('Exercício adicionado!'); setShowAddItem(false); setItemForm({ exercicio_id:'', series:3, repeticoes:'12', carga:'', descanso_seg:60 }) },
    onError: err => toast.error(err.response?.data?.detail || 'Erro'),
  })
  const { mutate: removeItem } = useMutation({
    mutationFn: itemId => removerItem(id, itemId),
    onSuccess: () => { qc.invalidateQueries({ queryKey:['treino', id] }); toast.success('Exercício removido') },
    onError: () => toast.error('Erro ao remover'),
  })
  const { mutate: salvarTemplate, isPending: salvandoTemplate } = useMutation({
    mutationFn: () => templateFromTreino(id, { nome: templateNome || treino?.nome }),
    onSuccess: () => { toast.success('Template salvo! Acesse em Ferramentas → Templates ✅'); setShowSalvarTemplate(false); setTemplateNome('') },
    onError: err => toast.error(err.response?.data?.detail || 'Erro ao salvar template'),
  })

  const handleDuplicar = async () => {
    setDuplicando(true)
    try {
      const { data } = await duplicarTreino(id)
      qc.invalidateQueries({ queryKey: ['treino'] })
      toast.success(`Treino duplicado! "${data.nome}" criado.`)
    } catch {
      toast.error('Erro ao duplicar treino')
    } finally {
      setDuplicando(false)
    }
  }

  const exercicioMap = Object.fromEntries(exercicios.map(e => [e.id, e]))

  if (isLoading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:256 }}>
      <Loader2 style={{ width:32, height:32, color:'#ef4444', animation:'spin 1s linear infinite' }} />
    </div>
  )

  const totalVolume = treino?.itens?.reduce((s, i) => s + (i.series || 0) * (parseFloat(i.carga) || 0), 0) || 0

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back link */}
      <Link to={`/alunos/${treino?.aluno_id}`} className="inline-flex items-center gap-2 text-sm font-medium transition-colors" style={{ color:'var(--text-muted)' }}
        onMouseEnter={e => e.currentTarget.style.color='var(--text-secondary)'}
        onMouseLeave={e => e.currentTarget.style.color='var(--text-muted)'}>
        <ArrowLeft style={{ width:15, height:15 }} /> Voltar para o aluno
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 style={{ fontFamily:'Inter, sans-serif', fontSize:26, fontWeight:600, color:'var(--text-primary)', letterSpacing:'-0.025em' }}>{treino?.nome}</h1>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            {treino?.dia_semana && <span className="badge-blue capitalize">{treino.dia_semana}</span>}
            <span style={{ fontSize:13, color:'var(--text-muted)' }}>{treino?.itens?.length || 0} exercício{treino?.itens?.length !== 1 ? 's' : ''}</span>
            {totalVolume > 0 && <span style={{ fontSize:13, color:'var(--text-muted)' }}>{totalVolume.toFixed(0)} kg volume total</span>}
          </div>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={handleDuplicar} disabled={duplicando}
            title="Duplicar treino para o mesmo aluno"
            style={{ display:'flex', alignItems:'center', gap:6, padding:'9px 14px', borderRadius:10, border:'1px solid var(--border)', background:'var(--bg-elevated)', color:'var(--text-muted)', fontSize:13, cursor: duplicando ? 'wait' : 'pointer', fontWeight:500 }}
            onMouseEnter={e => { e.currentTarget.style.color='var(--text-secondary)'; e.currentTarget.style.borderColor='rgba(52,211,153,0.35)' }}
            onMouseLeave={e => { e.currentTarget.style.color='var(--text-muted)'; e.currentTarget.style.borderColor='var(--border)' }}>
            <CopyPlus style={{ width:13, height:13 }} /> {duplicando ? 'Duplicando...' : 'Duplicar'}
          </button>
          <button onClick={() => { setTemplateNome(treino?.nome || ''); setShowSalvarTemplate(true) }}
            style={{ display:'flex', alignItems:'center', gap:6, padding:'9px 14px', borderRadius:10, border:'1px solid var(--border)', background:'var(--bg-elevated)', color:'var(--text-muted)', fontSize:13, cursor:'pointer', fontWeight:500 }}
            onMouseEnter={e => { e.currentTarget.style.color='var(--text-secondary)'; e.currentTarget.style.borderColor='rgba(99,102,241,0.35)' }}
            onMouseLeave={e => { e.currentTarget.style.color='var(--text-muted)'; e.currentTarget.style.borderColor='var(--border)' }}>
            <Copy style={{ width:13, height:13 }} /> Template
          </button>
          <button className="btn-primary flex-shrink-0" onClick={() => setShowExecutar(true)}>
            <Play style={{ width:15, height:15 }} />
            Registrar execução
          </button>
        </div>
      </div>

      {/* Exercise list card */}
      <div className="card">
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
          <h2 style={{ fontFamily:'Inter, sans-serif', fontWeight:600, color:'var(--text-primary)', fontSize:15 }}>Exercícios do treino</h2>
          <button className="btn-secondary btn-sm" onClick={() => setShowAddItem(!showAddItem)}>
            <Plus style={{ width:13, height:13 }} /> Adicionar
          </button>
        </div>

        {/* Add form */}
        {showAddItem && (
          <div className="animate-slide-down mb-5 rounded-2xl p-4" style={{ background:'rgba(99,102,241,0.06)', border:'1px solid rgba(99,102,241,0.2)' }}>
            <h3 style={{ fontFamily:'Inter, sans-serif', fontWeight:600, color:'var(--text-primary)', fontSize:14, marginBottom:16 }}>Adicionar exercício</h3>
            <div className="space-y-3">
              <div>
                <label className="label">Exercício *</label>
                <div style={{ position:'relative' }}>
                  <select className="input appearance-none" style={{ paddingRight:36 }} value={itemForm.exercicio_id} onChange={e => setItemForm({ ...itemForm, exercicio_id: e.target.value })}>
                    <option value="">Selecionar exercício...</option>
                    {exercicios.map(e => <option key={e.id} value={e.id}>{e.nome}{e.grupo_muscular ? ` (${e.grupo_muscular})` : ''}</option>)}
                  </select>
                  <ChevronDown style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', width:15, height:15, color:'var(--text-muted)', pointerEvents:'none' }} />
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label:'Séries',   key:'series',       type:'number', min:1 },
                  { label:'Reps',     key:'repeticoes',   type:'text' },
                  { label:'Carga (kg)',key:'carga',       type:'number' },
                  { label:'Descanso (s)',key:'descanso_seg',type:'number' },
                ].map(({ label, key, type, min }) => (
                  <div key={key}>
                    <label className="label">{label}</label>
                    <input type={type} className="input text-center font-semibold" min={min} placeholder="—"
                      value={itemForm[key]}
                      onChange={e => setItemForm({ ...itemForm, [key]: type === 'number' ? Number(e.target.value) : e.target.value })} />
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button className="btn-secondary" onClick={() => setShowAddItem(false)}>Cancelar</button>
              <button className="btn-primary" disabled={!itemForm.exercicio_id || addingItem}
                onClick={() => addItem({ exercicio_id:Number(itemForm.exercicio_id), series:itemForm.series, repeticoes:itemForm.repeticoes, carga:itemForm.carga ? Number(itemForm.carga) : null, descanso_seg:itemForm.descanso_seg, ordem:treino?.itens?.length || 0 })}>
                {addingItem ? 'Adicionando...' : 'Adicionar'}
              </button>
            </div>
          </div>
        )}

        {/* Item list */}
        {!treino?.itens?.length ? (
          <div className="empty-state py-10">
            <div className="empty-icon"><Dumbbell style={{ width:28, height:28, color:'var(--text-muted)' }} /></div>
            <p className="empty-title">Nenhum exercício ainda</p>
            <p className="empty-message">Adicione exercícios para montar este treino</p>
            <button className="btn-primary" onClick={() => setShowAddItem(true)}>Adicionar exercício</button>
          </div>
        ) : (
          <div className="space-y-2">
            {treino.itens.map((item, idx) => {
              const ex = exercicioMap[item.exercicio_id]
              const grupo = ex?.grupo_muscular
              const gc = GRUPO_COLORS[grupo] || GRUPO_COLORS.default
              return (
                <div key={item.id} className="group flex items-start gap-3 rounded-2xl p-4 transition-all duration-150" style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.05)' }}
                  onMouseEnter={e => { e.currentTarget.style.background='rgba(99,102,241,0.06)'; e.currentTarget.style.border='1px solid rgba(99,102,241,0.12)' }}
                  onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.03)'; e.currentTarget.style.border='1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ color:'var(--text-disabled)', marginTop:2, cursor:'grab' }}>
                    <GripVertical style={{ width:15, height:15 }} />
                  </div>
                  <div style={{ width:26, height:26, background:'#ef4444', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:11, fontWeight:600, flexShrink:0, marginTop:2 }}>
                    {idx + 1}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', marginBottom:4 }}>
                      <span style={{ fontFamily:'Inter, sans-serif', fontWeight:600, fontSize:14, color:'var(--text-primary)' }}>{ex?.nome || `Exercício #${item.exercicio_id}`}</span>
                      {grupo && <span style={{ fontSize:10, fontWeight:600, padding:'2px 8px', borderRadius:999, background:gc.bg, color:gc.text }}>{grupo}</span>}
                      {ex?.video_url && <Video style={{ width:13, height:13, color:'#a78bfa' }} />}
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:12, fontSize:12, color:'var(--text-muted)', flexWrap:'wrap' }}>
                      <span style={{ fontWeight:600, color:'var(--text-secondary)' }}>{item.series} × {item.repeticoes}</span>
                      {item.carga     && <span>{item.carga} kg</span>}
                      {item.descanso_seg && <span style={{ display:'flex', alignItems:'center', gap:4 }}><Clock style={{ width:11, height:11 }} />{item.descanso_seg}s</span>}
                    </div>
                    {ex?.video_url && <VideoThumb url={ex.video_url} title={ex.nome} />}
                  </div>
                  <button onClick={() => removeItem(item.id)} style={{ flexShrink:0, width:30, height:30, borderRadius:10, border:'none', background:'rgba(239,68,68,0)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text-disabled)', transition:'all 0.15s', opacity:0 }}
                    className="group-hover:opacity-100"
                    onMouseEnter={e => { e.currentTarget.style.background='rgba(239,68,68,0.15)'; e.currentTarget.style.color='#f87171'; e.currentTarget.style.opacity=1 }}
                    onMouseLeave={e => { e.currentTarget.style.background='rgba(239,68,68,0)'; e.currentTarget.style.color='var(--text-disabled)' }}
                    title="Remover exercício">
                    <Trash2 style={{ width:13, height:13 }} />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {showExecutar && treino && <ModalExecutar treino={treino} onClose={() => setShowExecutar(false)} />}

      {/* Modal: Salvar como template */}
      {showSalvarTemplate && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', backdropFilter:'blur(8px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50, padding:16 }}>
          <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:20, width:'100%', maxWidth:400, padding:24 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <h3 style={{ fontSize:16, fontWeight:600, color:'var(--text-primary)', margin:0 }}>Salvar como template</h3>
              <button onClick={() => setShowSalvarTemplate(false)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)' }}><X style={{ width:18, height:18 }} /></button>
            </div>
            <p style={{ fontSize:13, color:'var(--text-muted)', marginBottom:16 }}>
              Este treino será salvo como template com todos os {treino?.itens?.length} exercício(s). Você poderá aplicá-lo a qualquer aluno depois.
            </p>
            <div style={{ marginBottom:16 }}>
              <label className="label">Nome do template</label>
              <input className="input" value={templateNome} onChange={e => setTemplateNome(e.target.value)} placeholder={treino?.nome} />
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={() => setShowSalvarTemplate(false)} className="btn-secondary flex-1">Cancelar</button>
              <button onClick={() => salvarTemplate()} disabled={salvandoTemplate} className="btn-primary flex-1" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                <Copy style={{ width:13, height:13 }} />
                {salvandoTemplate ? 'Salvando...' : 'Salvar template'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

