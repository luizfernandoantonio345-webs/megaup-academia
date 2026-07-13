import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { obterTreino, listarExercicios, adicionarItem, removerItem, executarTreino, templateFromTreino, duplicarTreino } from '../api'
import toast from 'react-hot-toast'
import { ArrowLeft, Plus, Trash2, Play, X, Video, Clock, Dumbbell, GripVertical, ChevronDown, Copy, CopyPlus, Zap } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { VideoThumb } from '../components/VideoPlayer'

const DIFICULDADE = [
  { key:'facil',   emoji:'😊', label:'Fácil',  bg:'rgba(16,185,129,0.15)',  border:'rgba(16,185,129,0.4)', text:'#34d399' },
  { key:'ok',      emoji:'💪', label:'Normal', bg:'rgba(99,102,241,0.15)',  border:'rgba(99,102,241,0.4)', text:'#a5b4fc' },
  { key:'dificil', emoji:'🔥', label:'Pesado', bg:'rgba(239,68,68,0.15)',   border:'rgba(239,68,68,0.4)',  text:'#f87171' },
]

const GRUPO_COLORS = {
  Peito:   { bg:'rgba(239,68,68,0.12)',   border:'rgba(239,68,68,0.3)',   text:'#f87171',  glow:'rgba(239,68,68,0.4)' },
  Costas:  { bg:'rgba(6,182,212,0.12)',   border:'rgba(6,182,212,0.3)',   text:'#22d3ee',  glow:'rgba(6,182,212,0.4)' },
  Pernas:  { bg:'rgba(16,185,129,0.12)',  border:'rgba(16,185,129,0.3)',  text:'#34d399',  glow:'rgba(16,185,129,0.4)' },
  Ombros:  { bg:'rgba(245,158,11,0.12)',  border:'rgba(245,158,11,0.3)',  text:'#fbbf24',  glow:'rgba(245,158,11,0.4)' },
  Bíceps:  { bg:'rgba(99,102,241,0.12)',  border:'rgba(99,102,241,0.3)',  text:'#a5b4fc',  glow:'rgba(99,102,241,0.4)' },
  Tríceps: { bg:'rgba(124,58,237,0.12)',  border:'rgba(124,58,237,0.3)',  text:'#c084fc',  glow:'rgba(124,58,237,0.4)' },
  Abdômen: { bg:'rgba(249,115,22,0.12)',  border:'rgba(249,115,22,0.3)',  text:'#fb923c',  glow:'rgba(249,115,22,0.4)' },
  Glúteos: { bg:'rgba(236,72,153,0.12)',  border:'rgba(236,72,153,0.3)',  text:'#f472b6',  glow:'rgba(236,72,153,0.4)' },
  default: { bg:'rgba(100,116,139,0.1)',  border:'rgba(100,116,139,0.25)',text:'#94a3b8',  glow:'rgba(100,116,139,0.3)' },
}

function SkeletonTreino() {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <div className="skeleton" style={{ width:140, height:18, borderRadius:8 }} />
      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        <div className="skeleton" style={{ width:280, height:40, borderRadius:12 }} />
        <div style={{ display:'flex', gap:10 }}>
          <div className="skeleton" style={{ width:80, height:24, borderRadius:999 }} />
          <div className="skeleton" style={{ width:100, height:24, borderRadius:999 }} />
        </div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
        {[0,1,2].map(i => <div key={i} className="skeleton" style={{ height:80, borderRadius:18 }} />)}
      </div>
      <div className="skeleton" style={{ height:360, borderRadius:22 }} />
    </div>
  )
}

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
    <motion.div
      initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.8)', backdropFilter:'blur(12px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50, padding:16 }}
    >
      <motion.div
        initial={{ opacity:0, scale:0.96, y:12 }} animate={{ opacity:1, scale:1, y:0 }}
        exit={{ opacity:0, scale:0.96, y:12 }}
        transition={{ duration:0.28, ease:[0.16,1,0.3,1] }}
        style={{ background:'#111113', border:'1px solid rgba(99,102,241,0.25)', borderRadius:24, width:'100%', maxWidth:520, maxHeight:'88vh', overflow:'hidden', display:'flex', flexDirection:'column', boxShadow:'0 32px 80px rgba(0,0,0,0.7)' }}
      >
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'18px 24px', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
          <div>
            <h3 style={{ fontFamily:'Inter, sans-serif', fontWeight:800, fontSize:16, color:'#F4F4F5', letterSpacing:'-0.02em' }}>Registrar execução</h3>
            <p style={{ fontSize:12, color:'rgba(255,255,255,0.38)', marginTop:2 }}>{treino.nome}</p>
          </div>
          <button onClick={onClose} style={{ width:32, height:32, borderRadius:10, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.08)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(255,255,255,0.5)' }}>
            <X style={{ width:15, height:15 }} />
          </button>
        </div>

        <div style={{ flex:1, overflowY:'auto', padding:24, display:'flex', flexDirection:'column', gap:20 }}>
          <div>
            <p style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:12 }}>Como foi o treino?</p>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
              {DIFICULDADE.map(({ key, emoji, label, bg, border, text }) => (
                <button key={key} onClick={() => setDificuldade(key)} style={{
                  padding:'14px 8px', borderRadius:16,
                  border:`2px solid ${dificuldade === key ? border : 'rgba(255,255,255,0.07)'}`,
                  background: dificuldade === key ? bg : 'rgba(255,255,255,0.03)',
                  color: dificuldade === key ? text : 'rgba(255,255,255,0.35)',
                  fontWeight:700, fontSize:13, cursor:'pointer', transition:'all 0.18s',
                }}>
                  <div style={{ fontSize:24, marginBottom:6 }}>{emoji}</div>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {itens.length > 0 && (
            <div>
              <p style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:12 }}>Valores realizados</p>
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {itens.map((item, idx) => (
                  <div key={idx} style={{ background:'rgba(255,255,255,0.03)', borderRadius:16, padding:14, border:'1px solid rgba(255,255,255,0.06)' }}>
                    <p style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:10 }}>
                      Exercício {idx + 1}
                    </p>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
                      {[
                        { key:'carga_realizada',       label:'Carga (kg)', type:'number' },
                        { key:'repeticoes_realizadas',  label:'Reps',       type:'text' },
                        { key:'series_realizadas',      label:'Séries',     type:'number' },
                      ].map(({ key, label, type }) => (
                        <div key={key}>
                          <label style={{ fontSize:10, color:'rgba(255,255,255,0.35)', display:'block', marginBottom:4, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em' }}>{label}</label>
                          <input
                            type={type}
                            style={{
                              width:'100%', padding:'8px 6px', fontSize:15, fontWeight:800,
                              background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)',
                              borderRadius:10, color:'#F4F4F5', textAlign:'center',
                              outline:'none', fontFamily:'Inter,sans-serif',
                            }}
                            value={item[key]}
                            onChange={e => setItem(idx, key, e.target.value)}
                            placeholder="—"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <p style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:8 }}>Observações (opcional)</p>
            <textarea
              rows={2}
              placeholder="Como o aluno se sentiu, feedback..."
              value={comentario}
              onChange={e => setComentario(e.target.value)}
              style={{
                width:'100%', resize:'none', padding:'12px 14px', fontSize:14,
                background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)',
                borderRadius:12, color:'#F4F4F5', fontFamily:'Inter,sans-serif', outline:'none',
              }}
            />
          </div>
        </div>

        <div style={{ borderTop:'1px solid rgba(255,255,255,0.06)', padding:'14px 24px' }}>
          {volumeTotal > 0 && (
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6, marginBottom:12, padding:'8px 14px', borderRadius:10, background:'rgba(99,102,241,0.1)', border:'1px solid rgba(99,102,241,0.2)' }}>
              <Zap style={{ width:12, height:12, color:'#a5b4fc' }} />
              <span style={{ fontSize:12, color:'#a5b4fc', fontWeight:700 }}>Volume total: {volumeTotal.toLocaleString('pt-BR')} kg</span>
            </div>
          )}
          <div style={{ display:'flex', gap:10 }}>
            <button onClick={onClose} style={{ flex:1, padding:'11px 0', borderRadius:12, border:'1px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.04)', color:'rgba(255,255,255,0.6)', fontSize:14, fontWeight:600, cursor:'pointer' }}>Cancelar</button>
            <button
              disabled={isPending}
              onClick={() => mutate()}
              style={{ flex:1, padding:'11px 0', borderRadius:12, border:'none', background:'linear-gradient(135deg,#ef4444,#dc2626)', color:'white', fontSize:14, fontWeight:700, cursor:isPending?'wait':'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}
            >
              {isPending ? (
                <>
                  <span style={{ width:14, height:14, border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'white', borderRadius:'50%', display:'inline-block', animation:'spin 0.8s linear infinite' }} />
                  Salvando...
                </>
              ) : '✓ Salvar execução'}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
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

  const { data: treino, isLoading } = useQuery({ queryKey:['treino', id], queryFn: () => obterTreino(id).then(r => r.data), staleTime: 5 * 60_000 })
  const { data: exercicios = [] } = useQuery({ queryKey:['exercicios'], queryFn: () => listarExercicios().then(r => r.data), staleTime: 30 * 60_000 })

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
    onSuccess: () => { toast.success('Template salvo!'); setShowSalvarTemplate(false); setTemplateNome('') },
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

  if (isLoading) return <SkeletonTreino />

  const totalVolume = treino?.itens?.reduce((s, i) => s + (i.series || 0) * (parseFloat(i.carga) || 0), 0) || 0
  const totalSeries = treino?.itens?.reduce((s, i) => s + (i.series || 0), 0) || 0
  const temVideo = treino?.itens?.some(i => exercicioMap[i.exercicio_id]?.video_url)

  const grupos = [...new Set(treino?.itens?.map(i => exercicioMap[i.exercicio_id]?.grupo_muscular).filter(Boolean) || [])]

  return (
    <motion.div
      initial={{ opacity:0 }} animate={{ opacity:1 }}
      transition={{ duration:0.3, ease:[0.16,1,0.3,1] }}
      style={{ display:'flex', flexDirection:'column', gap:20 }}
    >
      {/* Back */}
      <Link
        to={`/alunos/${treino?.aluno_id}`}
        style={{ display:'inline-flex', alignItems:'center', gap:6, fontSize:13, fontWeight:600, color:'rgba(255,255,255,0.4)', textDecoration:'none', transition:'color 0.15s', width:'fit-content' }}
        onMouseEnter={e => e.currentTarget.style.color='rgba(255,255,255,0.7)'}
        onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.4)'}
      >
        <ArrowLeft style={{ width:15, height:15 }} /> Voltar para o aluno
      </Link>

      {/* Hero card */}
      <div style={{
        borderRadius:24, padding:'28px 28px 24px', position:'relative', overflow:'hidden',
        background:'radial-gradient(ellipse at 5% -30%, rgba(239,68,68,0.2) 0%, transparent 55%), radial-gradient(ellipse at 95% 110%, rgba(99,102,241,0.12) 0%, transparent 50%), #111113',
        border:'1px solid rgba(255,255,255,0.08)',
        boxShadow:'0 0 0 1px rgba(239,68,68,0.06) inset, 0 24px 60px rgba(0,0,0,0.4)',
      }}>
        {/* glow orb */}
        <div style={{ position:'absolute', top:-40, left:-30, width:200, height:200, borderRadius:'50%', background:'rgba(239,68,68,0.08)', filter:'blur(40px)', pointerEvents:'none' }} />

        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:16, flexWrap:'wrap', position:'relative' }}>
          <div style={{ flex:1, minWidth:0 }}>
            {treino?.dia_semana && (
              <span style={{ display:'inline-flex', alignItems:'center', gap:5, fontSize:10, fontWeight:800, color:'#f87171', textTransform:'uppercase', letterSpacing:'0.1em', padding:'4px 10px', borderRadius:999, background:'rgba(239,68,68,0.12)', border:'1px solid rgba(239,68,68,0.25)', marginBottom:12 }}>
                {treino.dia_semana}
              </span>
            )}
            <h1 style={{ fontFamily:'Inter,sans-serif', fontSize:'clamp(22px,4vw,32px)', fontWeight:900, color:'#F4F4F5', letterSpacing:'-0.04em', lineHeight:1.1, marginBottom:10 }}>
              {treino?.nome}
            </h1>
            {grupos.length > 0 && (
              <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                {grupos.map(g => {
                  const gc = GRUPO_COLORS[g] || GRUPO_COLORS.default
                  return (
                    <span key={g} style={{ fontSize:10, fontWeight:700, padding:'3px 9px', borderRadius:999, background:gc.bg, border:`1px solid ${gc.border}`, color:gc.text }}>
                      {g}
                    </span>
                  )
                })}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            <button
              onClick={handleDuplicar}
              disabled={duplicando}
              style={{ display:'flex', alignItems:'center', gap:6, padding:'9px 14px', borderRadius:12, border:'1px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.05)', color:'rgba(255,255,255,0.55)', fontSize:13, cursor:duplicando?'wait':'pointer', fontWeight:600, transition:'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(52,211,153,0.4)'; e.currentTarget.style.color='#34d399' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(255,255,255,0.1)'; e.currentTarget.style.color='rgba(255,255,255,0.55)' }}
            >
              {duplicando
                ? <span style={{ width:13, height:13, border:'2px solid rgba(255,255,255,0.2)', borderTopColor:'#34d399', borderRadius:'50%', display:'inline-block', animation:'spin 0.8s linear infinite' }} />
                : <CopyPlus style={{ width:13, height:13 }} />}
              {duplicando ? 'Duplicando...' : 'Duplicar'}
            </button>
            <button
              onClick={() => { setTemplateNome(treino?.nome || ''); setShowSalvarTemplate(true) }}
              style={{ display:'flex', alignItems:'center', gap:6, padding:'9px 14px', borderRadius:12, border:'1px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.05)', color:'rgba(255,255,255,0.55)', fontSize:13, cursor:'pointer', fontWeight:600, transition:'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(99,102,241,0.4)'; e.currentTarget.style.color='#a5b4fc' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(255,255,255,0.1)'; e.currentTarget.style.color='rgba(255,255,255,0.55)' }}
            >
              <Copy style={{ width:13, height:13 }} /> Template
            </button>
            <motion.button
              whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
              onClick={() => setShowExecutar(true)}
              style={{ display:'flex', alignItems:'center', gap:7, padding:'10px 18px', borderRadius:12, border:'none', background:'linear-gradient(135deg,#ef4444,#dc2626)', color:'white', fontSize:14, cursor:'pointer', fontWeight:700, boxShadow:'0 4px 20px rgba(239,68,68,0.4)' }}
            >
              <Play style={{ width:15, height:15, fill:'white' }} />
              Registrar execução
            </motion.button>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginTop:24 }}>
          {[
            { label:'Exercícios', value: treino?.itens?.length || 0, color:'#f87171', icon:<Dumbbell style={{ width:13, height:13 }} /> },
            { label:'Séries total', value: totalSeries, color:'#a5b4fc', icon:<Zap style={{ width:13, height:13 }} /> },
            { label:'Volume (kg)', value: totalVolume > 0 ? `${totalVolume.toFixed(0)}` : '—', color:'#34d399', icon:<Clock style={{ width:13, height:13 }} /> },
          ].map(({ label, value, color, icon }) => (
            <div key={label} style={{
              borderRadius:18, padding:'16px', textAlign:'center',
              background:`radial-gradient(ellipse at 50% -10%, ${color}1a 0%, transparent 60%), ${color}08`,
              border:`1px solid ${color}1e`,
              boxShadow:`0 0 28px -10px ${color}30`,
            }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:5, color, marginBottom:8 }}>
                {icon}
                <span style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em' }}>{label}</span>
              </div>
              <p style={{ fontFamily:'Inter,sans-serif', fontSize:42, fontWeight:900, color, letterSpacing:'-0.05em', lineHeight:1, textShadow:`0 0 40px ${color}70, 0 0 14px ${color}40` }}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Exercise list card */}
      <div style={{ borderRadius:22, background:'#111113', border:'1px solid rgba(255,255,255,0.07)', overflow:'hidden', boxShadow:'inset 0 1px 0 rgba(255,255,255,0.04)' }}>
        {/* Card header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'18px 22px', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
          <h2 style={{ fontFamily:'Inter,sans-serif', fontWeight:800, color:'#F4F4F5', fontSize:15, letterSpacing:'-0.02em' }}>Exercícios do treino</h2>
          <motion.button
            whileHover={{ scale:1.04 }} whileTap={{ scale:0.96 }}
            onClick={() => setShowAddItem(!showAddItem)}
            style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 13px', borderRadius:10, border:'1px solid rgba(99,102,241,0.3)', background:'rgba(99,102,241,0.1)', color:'#a5b4fc', fontSize:12, cursor:'pointer', fontWeight:700 }}
          >
            <Plus style={{ width:13, height:13 }} /> Adicionar
          </motion.button>
        </div>

        {/* Add form */}
        <AnimatePresence>
          {showAddItem && (
            <motion.div
              initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }} exit={{ height:0, opacity:0 }}
              transition={{ duration:0.28, ease:[0.16,1,0.3,1] }}
              style={{ overflow:'hidden' }}
            >
              <div style={{ padding:'20px 22px', borderBottom:'1px solid rgba(255,255,255,0.06)', background:'rgba(99,102,241,0.04)' }}>
                <h3 style={{ fontFamily:'Inter,sans-serif', fontWeight:800, color:'#F4F4F5', fontSize:14, marginBottom:16, letterSpacing:'-0.02em' }}>Adicionar exercício</h3>
                <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                  <div>
                    <label style={{ fontSize:11, color:'rgba(255,255,255,0.4)', display:'block', marginBottom:6, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em' }}>Exercício *</label>
                    <div style={{ position:'relative' }}>
                      <select
                        style={{ width:'100%', padding:'10px 36px 10px 12px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(99,102,241,0.25)', borderRadius:12, color:'#F4F4F5', fontSize:14, outline:'none', appearance:'none', fontFamily:'Inter,sans-serif' }}
                        value={itemForm.exercicio_id}
                        onChange={e => setItemForm({ ...itemForm, exercicio_id: e.target.value })}
                      >
                        <option value="">Selecionar exercício...</option>
                        {exercicios.map(e => <option key={e.id} value={e.id}>{e.nome}{e.grupo_muscular ? ` (${e.grupo_muscular})` : ''}</option>)}
                      </select>
                      <ChevronDown style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', width:15, height:15, color:'rgba(255,255,255,0.35)', pointerEvents:'none' }} />
                    </div>
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:10 }}>
                    {[
                      { label:'Séries',      key:'series',       type:'number', min:1 },
                      { label:'Reps',        key:'repeticoes',   type:'text' },
                      { label:'Carga (kg)',  key:'carga',        type:'number' },
                      { label:'Descanso (s)',key:'descanso_seg', type:'number' },
                    ].map(({ label, key, type, min }) => (
                      <div key={key}>
                        <label style={{ fontSize:11, color:'rgba(255,255,255,0.4)', display:'block', marginBottom:5, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em' }}>{label}</label>
                        <input
                          type={type}
                          min={min}
                          placeholder="—"
                          value={itemForm[key]}
                          onChange={e => setItemForm({ ...itemForm, [key]: type === 'number' ? Number(e.target.value) : e.target.value })}
                          style={{ width:'100%', padding:'9px 12px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:10, color:'#F4F4F5', fontSize:14, fontWeight:700, textAlign:'center', outline:'none', fontFamily:'Inter,sans-serif' }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ display:'flex', gap:8, marginTop:16 }}>
                  <button
                    onClick={() => setShowAddItem(false)}
                    style={{ padding:'9px 16px', borderRadius:11, border:'1px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.04)', color:'rgba(255,255,255,0.55)', fontSize:13, fontWeight:600, cursor:'pointer' }}
                  >Cancelar</button>
                  <button
                    disabled={!itemForm.exercicio_id || addingItem}
                    onClick={() => addItem({ exercicio_id:Number(itemForm.exercicio_id), series:itemForm.series, repeticoes:itemForm.repeticoes, carga:itemForm.carga ? Number(itemForm.carga) : null, descanso_seg:itemForm.descanso_seg, ordem:treino?.itens?.length || 0 })}
                    style={{ flex:1, padding:'9px 16px', borderRadius:11, border:'none', background:'linear-gradient(135deg,#6366f1,#4f46e5)', color:'white', fontSize:13, fontWeight:700, cursor: !itemForm.exercicio_id || addingItem ? 'not-allowed' : 'pointer', opacity: !itemForm.exercicio_id ? 0.5 : 1, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}
                  >
                    {addingItem
                      ? <><span style={{ width:13, height:13, border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'white', borderRadius:'50%', display:'inline-block', animation:'spin 0.8s linear infinite' }} />Adicionando...</>
                      : 'Adicionar'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Item list */}
        {!treino?.itens?.length ? (
          <div style={{ padding:'60px 24px', textAlign:'center' }}>
            <div style={{ width:56, height:56, borderRadius:18, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
              <Dumbbell style={{ width:24, height:24, color:'rgba(255,255,255,0.2)' }} />
            </div>
            <p style={{ fontSize:16, fontWeight:800, color:'#F4F4F5', letterSpacing:'-0.02em', marginBottom:6 }}>Nenhum exercício ainda</p>
            <p style={{ fontSize:13, color:'rgba(255,255,255,0.38)', lineHeight:1.5, marginBottom:20 }}>Adicione exercícios para montar este treino.</p>
            <button
              onClick={() => setShowAddItem(true)}
              style={{ display:'inline-flex', alignItems:'center', gap:7, padding:'10px 20px', borderRadius:12, border:'none', background:'rgba(99,102,241,0.15)', border:'1px solid rgba(99,102,241,0.3)', color:'#a5b4fc', fontSize:13, fontWeight:700, cursor:'pointer' }}
            >
              <Plus style={{ width:14, height:14 }} /> Adicionar exercício
            </button>
          </div>
        ) : (
          <div style={{ padding:'10px 16px 16px' }}>
            <AnimatePresence>
              {treino.itens.map((item, idx) => {
                const ex = exercicioMap[item.exercicio_id]
                const grupo = ex?.grupo_muscular
                const gc = GRUPO_COLORS[grupo] || GRUPO_COLORS.default
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity:0, y:12 }}
                    animate={{ opacity:1, y:0 }}
                    exit={{ opacity:0, x:-20, transition:{ duration:0.2 } }}
                    transition={{ delay: Math.min(idx * 0.05, 0.3), duration:0.38, ease:[0.16,1,0.3,1] }}
                  >
                    <ExercicioItem
                      item={item}
                      ex={ex}
                      gc={gc}
                      grupo={grupo}
                      idx={idx}
                      onRemove={() => removeItem(item.id)}
                    />
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showExecutar && treino && <ModalExecutar treino={treino} onClose={() => setShowExecutar(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {showSalvarTemplate && (
          <motion.div
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.8)', backdropFilter:'blur(12px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50, padding:16 }}
          >
            <motion.div
              initial={{ opacity:0, scale:0.95, y:10 }} animate={{ opacity:1, scale:1, y:0 }} exit={{ opacity:0, scale:0.95 }}
              transition={{ duration:0.25, ease:[0.16,1,0.3,1] }}
              style={{ background:'#111113', border:'1px solid rgba(255,255,255,0.1)', borderRadius:22, width:'100%', maxWidth:400, padding:24, boxShadow:'0 32px 80px rgba(0,0,0,0.6)' }}
            >
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
                <h3 style={{ fontSize:16, fontWeight:800, color:'#F4F4F5', letterSpacing:'-0.02em' }}>Salvar como template</h3>
                <button onClick={() => setShowSalvarTemplate(false)} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.4)', padding:4 }}>
                  <X style={{ width:18, height:18 }} />
                </button>
              </div>
              <p style={{ fontSize:13, color:'rgba(255,255,255,0.45)', marginBottom:16, lineHeight:1.55 }}>
                Este treino será salvo como template com todos os {treino?.itens?.length} exercício(s). Você poderá aplicá-lo a qualquer aluno depois.
              </p>
              <div style={{ marginBottom:16 }}>
                <label style={{ fontSize:11, color:'rgba(255,255,255,0.4)', display:'block', marginBottom:6, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em' }}>Nome do template</label>
                <input
                  style={{ width:'100%', padding:'10px 14px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:12, color:'#F4F4F5', fontSize:14, outline:'none', fontFamily:'Inter,sans-serif' }}
                  value={templateNome}
                  onChange={e => setTemplateNome(e.target.value)}
                  placeholder={treino?.nome}
                />
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <button onClick={() => setShowSalvarTemplate(false)} style={{ flex:1, padding:'10px 0', borderRadius:12, border:'1px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.04)', color:'rgba(255,255,255,0.55)', fontSize:13, fontWeight:600, cursor:'pointer' }}>Cancelar</button>
                <button
                  onClick={() => salvarTemplate()}
                  disabled={salvandoTemplate}
                  style={{ flex:1, padding:'10px 0', borderRadius:12, border:'none', background:'linear-gradient(135deg,#6366f1,#4f46e5)', color:'white', fontSize:13, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}
                >
                  {salvandoTemplate
                    ? <><span style={{ width:13, height:13, border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'white', borderRadius:'50%', display:'inline-block', animation:'spin 0.8s linear infinite' }} />Salvando...</>
                    : <><Copy style={{ width:13, height:13 }} />Salvar template</>}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function ExercicioItem({ item, ex, gc, grupo, idx, onRemove }) {
  const [expanded, setExpanded] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  return (
    <div style={{ marginBottom:8 }}>
      <div
        style={{
          borderRadius:16, border:'1px solid rgba(255,255,255,0.06)',
          background:'rgba(255,255,255,0.025)',
          overflow:'hidden', transition:'border-color 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.borderColor='rgba(255,255,255,0.1)'}
        onMouseLeave={e => e.currentTarget.style.borderColor='rgba(255,255,255,0.06)'}
      >
        <div style={{ display:'flex', alignItems:'center', gap:12, padding:'14px 16px' }}>
          {/* Drag handle */}
          <div style={{ color:'rgba(255,255,255,0.18)', cursor:'grab', flexShrink:0 }}>
            <GripVertical style={{ width:14, height:14 }} />
          </div>

          {/* Number badge */}
          <div style={{
            width:28, height:28, borderRadius:9, flexShrink:0,
            background:`linear-gradient(135deg, ${gc.text}30, ${gc.text}15)`,
            border:`1px solid ${gc.border}`,
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:11, fontWeight:900, color:gc.text,
          }}>
            {idx + 1}
          </div>

          {/* Content */}
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', marginBottom:3 }}>
              <span style={{ fontFamily:'Inter,sans-serif', fontWeight:700, fontSize:14, color:'#F4F4F5', letterSpacing:'-0.01em' }}>
                {ex?.nome || `Exercício #${item.exercicio_id}`}
              </span>
              {grupo && (
                <span style={{ fontSize:9, fontWeight:800, padding:'2px 8px', borderRadius:999, background:gc.bg, border:`1px solid ${gc.border}`, color:gc.text, textTransform:'uppercase', letterSpacing:'0.06em' }}>
                  {grupo}
                </span>
              )}
              {ex?.video_url && <Video style={{ width:12, height:12, color:'#a78bfa' }} />}
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:14, fontSize:12, color:'rgba(255,255,255,0.45)', flexWrap:'wrap' }}>
              <span style={{ fontWeight:800, color:'rgba(255,255,255,0.75)', fontSize:13 }}>{item.series} × {item.repeticoes}</span>
              {item.carga && <span style={{ color:gc.text, fontWeight:600 }}>{item.carga} kg</span>}
              {item.descanso_seg && (
                <span style={{ display:'flex', alignItems:'center', gap:3 }}>
                  <Clock style={{ width:10, height:10 }} />{item.descanso_seg}s
                </span>
              )}
            </div>
          </div>

          {/* Right actions */}
          <div style={{ display:'flex', alignItems:'center', gap:6, flexShrink:0 }}>
            {ex?.video_url && (
              <button
                onClick={() => setExpanded(v => !v)}
                style={{ width:30, height:30, borderRadius:9, border:'1px solid rgba(167,139,250,0.25)', background:'rgba(167,139,250,0.08)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#a78bfa', transition:'all 0.15s' }}
              >
                <ChevronDown style={{ width:13, height:13, transform: expanded ? 'rotate(180deg)' : 'none', transition:'transform 0.2s' }} />
              </button>
            )}
            {!confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                style={{ width:30, height:30, borderRadius:9, border:'1px solid rgba(239,68,68,0)', background:'rgba(239,68,68,0)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(255,255,255,0.2)', transition:'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.background='rgba(239,68,68,0.12)'; e.currentTarget.style.borderColor='rgba(239,68,68,0.3)'; e.currentTarget.style.color='#f87171' }}
                onMouseLeave={e => { e.currentTarget.style.background='rgba(239,68,68,0)'; e.currentTarget.style.borderColor='rgba(239,68,68,0)'; e.currentTarget.style.color='rgba(255,255,255,0.2)' }}
              >
                <Trash2 style={{ width:13, height:13 }} />
              </button>
            ) : (
              <div style={{ display:'flex', gap:4 }}>
                <button
                  onClick={() => setConfirmDelete(false)}
                  style={{ padding:'4px 8px', borderRadius:8, border:'1px solid rgba(255,255,255,0.1)', background:'transparent', color:'rgba(255,255,255,0.4)', fontSize:11, fontWeight:700, cursor:'pointer' }}
                >Não</button>
                <button
                  onClick={() => { onRemove(); setConfirmDelete(false) }}
                  style={{ padding:'4px 8px', borderRadius:8, border:'none', background:'rgba(239,68,68,0.2)', color:'#f87171', fontSize:11, fontWeight:700, cursor:'pointer' }}
                >Sim</button>
              </div>
            )}
          </div>
        </div>

        {/* Expandable video */}
        <AnimatePresence>
          {expanded && ex?.video_url && (
            <motion.div
              initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }} exit={{ height:0, opacity:0 }}
              transition={{ duration:0.25, ease:[0.16,1,0.3,1] }}
              style={{ overflow:'hidden', borderTop:'1px solid rgba(255,255,255,0.05)', padding:'12px 16px 14px' }}
            >
              <VideoThumb url={ex.video_url} title={ex.nome} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
