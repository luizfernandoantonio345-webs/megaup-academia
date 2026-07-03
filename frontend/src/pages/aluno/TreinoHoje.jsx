import { useState, useEffect, useRef, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../contexts/AuthContext'
import { listarAlunos, treinoDodia, listarExercicios, executarTreino, gamificacaoAluno } from '../../api'
import toast from 'react-hot-toast'
import { Play, Dumbbell, CheckCircle, X, ChevronDown, ChevronUp, Timer, Zap, Check, Pause, Flame } from 'lucide-react'
import VideoPlayer from '../../components/VideoPlayer'

/* ─── REST TIMER INLINE ─── */
function RestTimer({ onDismiss }) {
  const TOTAL = 60
  const [elapsed, setElapsed] = useState(0)
  const [running, setRunning] = useState(false)
  const ref = useRef(null)

  const toggle = useCallback(() => {
    if (running) { clearInterval(ref.current); setRunning(false) }
    else {
      setRunning(true)
      ref.current = setInterval(() => {
        setElapsed(e => {
          if (e >= TOTAL - 1) { clearInterval(ref.current); setRunning(false); toast.success('Descanso encerrado! 💪'); return TOTAL }
          return e + 1
        })
      }, 1000)
    }
  }, [running])

  useEffect(() => () => clearInterval(ref.current), [])

  const remaining = TOTAL - elapsed
  const progress = elapsed / TOTAL
  const r = 26, circ = 2 * Math.PI * r
  const dash = circ * (1 - progress)
  const ringColor = remaining <= 10 ? '#ef4444' : remaining <= 30 ? '#f59e0b' : '#6366f1'
  const min = Math.floor(remaining / 60), sec = remaining % 60

  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl animate-slide-down" style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)' }}>
      <div className="relative w-16 h-16 flex-shrink-0">
        <svg className="w-16 h-16 -rotate-90" viewBox="0 0 60 60">
          <circle cx="30" cy="30" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="4" />
          <circle cx="30" cy="30" r={r} fill="none" stroke={ringColor} strokeWidth="4" strokeLinecap="round"
            strokeDasharray={circ} strokeDashoffset={dash} style={{ transition:'stroke-dashoffset 1s linear, stroke 0.3s' }} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold tabular-nums" style={{ color: ringColor, fontFamily:'Space Grotesk, sans-serif' }}>
            {min > 0 ? `${min}:${String(sec).padStart(2,'0')}` : sec}
          </span>
        </div>
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold" style={{ color:'#CBD5E1' }}>Descanso entre séries</p>
        <p className="text-xs" style={{ color:'#3D4F6A' }}>Pressione play para iniciar</p>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={toggle} className="w-9 h-9 rounded-full flex items-center justify-center text-white transition-all"
          style={{ background: running ? 'rgba(245,158,11,0.8)' : 'linear-gradient(135deg,#4f46e5,#7c3aed)', boxShadow: running ? '' : '0 0 16px rgba(99,102,241,0.4)' }}>
          {running ? <Pause style={{ width:14, height:14 }} /> : <Play style={{ width:14, height:14, marginLeft:1 }} />}
        </button>
        <button onClick={onDismiss} className="w-9 h-9 rounded-full flex items-center justify-center transition-colors" style={{ background:'rgba(255,255,255,0.07)', color:'#64748B' }}>
          <X style={{ width:14, height:14 }} />
        </button>
      </div>
    </div>
  )
}

/* ─── SET TRACKER ─── */
function SetTracker({ series, completedSets, onToggle }) {
  if (!series || series === '0') return null
  const count = parseInt(series) || 3
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-bold uppercase tracking-wider" style={{ color:'#3D4F6A' }}>Séries:</span>
      {Array.from({ length: count }).map((_, i) => (
        <button key={i} onClick={() => onToggle(i)}
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all"
          style={{
            background: completedSets.includes(i) ? 'linear-gradient(135deg,#059669,#10b981)' : 'rgba(255,255,255,0.06)',
            border: `2px solid ${completedSets.includes(i) ? '#10b981' : 'rgba(255,255,255,0.1)'}`,
            color: completedSets.includes(i) ? 'white' : '#4B5768',
            transform: completedSets.includes(i) ? 'scale(1.1)' : 'scale(1)',
            boxShadow: completedSets.includes(i) ? '0 0 12px rgba(16,185,129,0.4)' : 'none',
          }}>
          {completedSets.includes(i) ? <Check style={{ width:13, height:13 }} /> : i + 1}
        </button>
      ))}
    </div>
  )
}

/* ─── WORKOUT MODAL (full screen) ─── */
function ModalExecutar({ treino, exercicioMap, onClose }) {
  const qc = useQueryClient()
  const [dificuldade, setDificuldade] = useState('ok')
  const [videoAberto, setVideoAberto] = useState(null)
  const [showTimer, setShowTimer] = useState(false)
  const [completedSetsMap, setCompletedSetsMap] = useState({})
  const [itens, setItens] = useState(
    (treino.itens || []).map(i => ({
      exercicio_id: i.exercicio_id, treino_item_id: i.id,
      carga_realizada: i.carga || '', repeticoes_realizadas: i.repeticoes || '', series_realizadas: i.series || '',
    }))
  )

  const { mutate, isPending } = useMutation({
    mutationFn: () => executarTreino(treino.id, {
      dificuldade,
      itens: itens.map(i => ({
        exercicio_id: i.exercicio_id, treino_item_id: i.treino_item_id,
        carga_realizada: i.carga_realizada ? Number(i.carga_realizada) : null,
        repeticoes_realizadas: i.repeticoes_realizadas || null,
        series_realizadas: i.series_realizadas ? Number(i.series_realizadas) : null,
      })),
    }),
    onSuccess: () => { toast.success('Treino concluído! 💪🔥'); qc.invalidateQueries(); onClose() },
    onError: () => toast.error('Erro ao registrar treino'),
  })

  const setItem = (idx, key, val) => { const c = [...itens]; c[idx] = { ...c[idx], [key]: val }; setItens(c) }
  const toggleSet = (exId, setIdx) => {
    setCompletedSetsMap(prev => {
      const cur = prev[exId] || []
      return { ...prev, [exId]: cur.includes(setIdx) ? cur.filter(s => s !== setIdx) : [...cur, setIdx] }
    })
  }

  const totalSeries = itens.reduce((s, i) => s + (parseInt(i.series_realizadas) || 0), 0)
  const completedTotal = Object.values(completedSetsMap).reduce((s, arr) => s + arr.length, 0)
  const pct = totalSeries > 0 ? Math.round((completedTotal / totalSeries) * 100) : 0

  const DIFF = [
    { key:'facil',   emoji:'😊', label:'Fácil',  bg:'rgba(16,185,129,0.15)',  border:'rgba(16,185,129,0.4)',  text:'#34d399' },
    { key:'ok',      emoji:'💪', label:'Normal', bg:'rgba(99,102,241,0.15)', border:'rgba(99,102,241,0.4)', text:'#a5b4fc' },
    { key:'dificil', emoji:'🔥', label:'Pesado', bg:'rgba(239,68,68,0.15)',  border:'rgba(239,68,68,0.4)',  text:'#f87171' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background:'#070B14' }}>
      {/* Header */}
      <div style={{ background:'rgba(6,9,16,0.98)', borderBottom:'1px solid rgba(255,255,255,0.06)', flexShrink:0, padding:'16px 16px 12px' }}>
        <div className="flex items-center justify-between mb-3 max-w-lg mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background:'linear-gradient(135deg,#4f46e5,#7c3aed)', boxShadow:'0 0 12px rgba(99,102,241,0.4)' }}>
              <Zap style={{ width:14, height:14, color:'white' }} />
            </div>
            <div>
              <p style={{ fontSize:11, color:'#3D4F6A', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em' }}>EXECUTANDO</p>
              <h3 style={{ fontFamily:'Space Grotesk, sans-serif', fontWeight:700, color:'#EFF6FF', fontSize:14 }}>{treino.nome}</h3>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center transition-colors" style={{ background:'rgba(255,255,255,0.08)', color:'#64748B' }}>
            <X style={{ width:15, height:15 }} />
          </button>
        </div>
        {totalSeries > 0 && (
          <div className="max-w-lg mx-auto space-y-1">
            <div className="flex justify-between items-center" style={{ fontSize:11, color:'#3D4F6A' }}>
              <span>{completedTotal} de {totalSeries} séries</span>
              <span style={{ color: pct === 100 ? '#10b981' : '#6366f1', fontWeight:700 }}>{pct}%</span>
            </div>
            <div className="progress-bar-track">
              <div className="progress-bar-fill" style={{ width:`${pct}%`, background:pct === 100 ? 'linear-gradient(90deg,#059669,#10b981)' : 'linear-gradient(90deg,#4f46e5,#7c3aed)' }} />
            </div>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4 max-w-lg mx-auto">
          {/* Difficulty */}
          <div className="card p-4">
            <p className="text-sm font-semibold mb-3" style={{ color:'#94A3B8' }}>Como está o treino?</p>
            <div className="grid grid-cols-3 gap-2">
              {DIFF.map(({ key, emoji, label, bg, border, text }) => (
                <button key={key} onClick={() => setDificuldade(key)}
                  className="py-3 rounded-2xl text-sm font-semibold transition-all"
                  style={{
                    background: dificuldade === key ? bg : 'rgba(255,255,255,0.04)',
                    border: `2px solid ${dificuldade === key ? border : 'rgba(255,255,255,0.07)'}`,
                    color: dificuldade === key ? text : '#3D4F6A',
                    boxShadow: dificuldade === key ? `0 0 16px ${bg}` : 'none',
                  }}>
                  <div className="text-2xl mb-0.5">{emoji}</div>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Timer toggle */}
          <button onClick={() => setShowTimer(!showTimer)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all text-sm font-medium"
            style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', color:'#64748B' }}
            onMouseEnter={e => e.currentTarget.style.borderColor='rgba(99,102,241,0.3)'}
            onMouseLeave={e => e.currentTarget.style.borderColor='rgba(255,255,255,0.07)'}>
            <span className="flex items-center gap-2">
              <Timer style={{ width:15, height:15, color:'#6366f1' }} />
              Cronômetro de descanso
            </span>
            {showTimer ? <ChevronUp style={{ width:14, height:14 }} /> : <ChevronDown style={{ width:14, height:14 }} />}
          </button>

          {showTimer && <RestTimer onDismiss={() => setShowTimer(false)} />}

          {/* Exercise list */}
          {itens.map((item, idx) => {
            const ex = exercicioMap[item.exercicio_id]
            const temVideo = !!ex?.video_url
            const videoVisivel = videoAberto === item.exercicio_id
            const completedSets = completedSetsMap[item.exercicio_id] || []
            const allDone = completedSets.length > 0 && completedSets.length >= (parseInt(item.series_realizadas) || 0)

            return (
              <div key={idx} className="card p-4 space-y-4 animate-slide-up" style={{ animationDelay:`${idx*50}ms`, borderColor: allDone ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.07)' }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                      style={{ background: allDone ? 'linear-gradient(135deg,#059669,#10b981)' : 'linear-gradient(135deg,#4f46e5,#7c3aed)', boxShadow: allDone ? '0 0 12px rgba(16,185,129,0.35)' : '0 0 12px rgba(99,102,241,0.3)' }}>
                      {allDone ? <Check style={{ width:15, height:15 }} /> : idx + 1}
                    </div>
                    <div>
                      <p className="font-bold text-sm" style={{ color:'#EFF6FF', fontFamily:'Space Grotesk, sans-serif' }}>{ex?.nome || `Exercício ${idx + 1}`}</p>
                      {ex?.grupo_muscular && <p className="text-xs" style={{ color:'#3D4F6A' }}>{ex.grupo_muscular}{ex.equipamento ? ` · ${ex.equipamento}` : ''}</p>}
                    </div>
                  </div>
                  {temVideo && (
                    <button onClick={() => setVideoAberto(videoVisivel ? null : item.exercicio_id)}
                      className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full transition-all flex-shrink-0"
                      style={{ background: videoVisivel ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.07)', color: videoVisivel ? '#a5b4fc' : '#4B5768' }}>
                      {videoVisivel ? <ChevronUp style={{ width:11, height:11 }} /> : <ChevronDown style={{ width:11, height:11 }} />}
                      {videoVisivel ? 'Fechar' : 'Como fazer'}
                    </button>
                  )}
                </div>

                {temVideo && videoVisivel && (
                  <div className="animate-slide-down"><VideoPlayer url={ex.video_url} title={ex.nome} /></div>
                )}

                <SetTracker series={item.series_realizadas} completedSets={completedSets} onToggle={setIdx => toggleSet(item.exercicio_id, setIdx)} />

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key:'carga_realizada', label:'Carga (kg)', type:'number' },
                    { key:'repeticoes_realizadas', label:'Repetições', type:'text' },
                    { key:'series_realizadas', label:'Séries', type:'number' },
                  ].map(({ key, label, type }) => (
                    <div key={key}>
                      <label className="label">{label}</label>
                      <input type={type} className="input text-center text-sm font-bold py-2.5" value={item[key]} onChange={e => setItem(idx, key, e.target.value)} placeholder="—" inputMode={type === 'number' ? 'decimal' : 'text'}
                        style={{ fontFamily:'Space Grotesk, sans-serif' }} />
                    </div>
                  ))}
                </div>

                {allDone && (
                  <div className="flex items-center gap-2 text-xs font-semibold" style={{ color:'#10b981' }}>
                    <CheckCircle style={{ width:13, height:13 }} />
                    {item.series_realizadas} séries concluídas ✓
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="flex-shrink-0 p-4" style={{ background:'rgba(6,9,16,0.98)', borderTop:'1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-lg mx-auto">
          <button className="btn-gradient w-full py-4 text-base" disabled={isPending} onClick={() => mutate()}>
            {isPending ? (
              <span className="flex items-center gap-2 justify-center">
                <span className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor:'rgba(255,255,255,0.3)', borderTopColor:'white' }} />
                Salvando...
              </span>
            ) : (
              <span className="flex items-center gap-2 justify-center">
                <CheckCircle style={{ width:18, height:18 }} />
                Concluir treino
                {pct > 0 && <span style={{ background:'rgba(255,255,255,0.2)', borderRadius:999, padding:'2px 8px', fontSize:12 }}>{pct}%</span>}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── TREINO CARD ─── */
function TreinoCard({ treino, exercicioMap, onStart }) {
  const [expanded, setExpanded] = useState(false)
  const totalEx = treino.itens?.length || 0
  const preview = (treino.itens || []).slice(0, 3)

  return (
    <div className="card space-y-4" style={{ border:'1px solid rgba(99,102,241,0.15)' }}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 style={{ fontFamily:'Space Grotesk, sans-serif', fontWeight:800, color:'#EFF6FF', fontSize:18, letterSpacing:'-0.02em' }}>{treino.nome}</h3>
          <p style={{ fontSize:13, color:'#3D4F6A', marginTop:2 }}>{totalEx} exercício{totalEx !== 1 ? 's' : ''}</p>
        </div>
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background:'rgba(99,102,241,0.15)', border:'1px solid rgba(99,102,241,0.2)' }}>
          <Dumbbell style={{ width:20, height:20, color:'#818cf8' }} />
        </div>
      </div>

      <div className="space-y-2">
        {preview.map((item, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background:'rgba(255,255,255,0.07)', color:'#4B5768' }}>{idx + 1}</span>
            <span className="text-sm flex-1 truncate" style={{ color:'#94A3B8' }}>{exercicioMap[item.exercicio_id]?.nome || `Exercício ${idx + 1}`}</span>
            <span className="text-xs font-semibold flex-shrink-0" style={{ color:'#3D4F6A' }}>{item.series}×{item.repeticoes}</span>
          </div>
        ))}
        {totalEx > 3 && (
          <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-1 text-xs font-semibold" style={{ color:'#6366f1' }}>
            {expanded ? <ChevronUp style={{ width:11, height:11 }} /> : <ChevronDown style={{ width:11, height:11 }} />}
            {expanded ? 'Mostrar menos' : `+${totalEx - 3} exercícios`}
          </button>
        )}
        {expanded && (treino.itens || []).slice(3).map((item, idx) => (
          <div key={idx + 3} className="flex items-center gap-3 animate-slide-down">
            <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background:'rgba(255,255,255,0.07)', color:'#4B5768' }}>{idx + 4}</span>
            <span className="text-sm flex-1 truncate" style={{ color:'#94A3B8' }}>{exercicioMap[item.exercicio_id]?.nome || `Exercício ${idx + 4}`}</span>
            <span className="text-xs font-semibold flex-shrink-0" style={{ color:'#3D4F6A' }}>{item.series}×{item.repeticoes}</span>
          </div>
        ))}
      </div>

      <button className="btn-gradient w-full py-3.5" onClick={() => onStart(treino)}>
        <Play style={{ width:16, height:16 }} />
        Iniciar treino
      </button>
    </div>
  )
}

/* ─── STREAK CARD ─── */
function StreakCard({ gami }) {
  if (!gami) return null
  return (
    <div className="rounded-3xl p-5 text-white relative overflow-hidden" style={{
      background:'linear-gradient(135deg, #7c2d12 0%, #9a3412 40%, #c2410c 100%)',
      boxShadow:'0 0 32px rgba(249,115,22,0.25), 0 8px 32px rgba(0,0,0,0.4)',
      border:'1px solid rgba(249,115,22,0.2)',
    }}>
      <div className="absolute inset-0 pointer-events-none" style={{
        background:'radial-gradient(ellipse at 80% 20%, rgba(251,191,36,0.15) 0%, transparent 60%)',
      }} />
      <div className="flex items-center justify-between relative z-10">
        <div>
          <p style={{ fontSize:12, color:'rgba(255,255,255,0.6)', fontWeight:600, marginBottom:4, textTransform:'uppercase', letterSpacing:'0.07em' }}>Sequência atual</p>
          <div className="flex items-end gap-2">
            <span style={{ fontFamily:'Space Grotesk, sans-serif', fontSize:56, fontWeight:900, lineHeight:1, letterSpacing:'-0.03em' }}>{gami.streak_atual}</span>
            <span style={{ fontSize:28, marginBottom:6 }}>🔥</span>
          </div>
          <p style={{ fontSize:12, color:'rgba(255,255,255,0.5)' }}>dias consecutivos</p>
        </div>
        <div className="space-y-3 text-right">
          <div>
            <p style={{ fontSize:11, color:'rgba(255,255,255,0.5)', fontWeight:600 }}>Recorde</p>
            <p style={{ fontFamily:'Space Grotesk, sans-serif', fontSize:20, fontWeight:800 }}>🏆 {gami.streak_recorde}</p>
          </div>
          <div>
            <p style={{ fontSize:11, color:'rgba(255,255,255,0.5)', fontWeight:600 }}>Treinos</p>
            <p style={{ fontFamily:'Space Grotesk, sans-serif', fontSize:20, fontWeight:800 }}>💪 {gami.total_treinos}</p>
          </div>
        </div>
      </div>
      {gami.streak_atual > 0 && (
        <div className="mt-4 pt-3 relative z-10" style={{ borderTop:'1px solid rgba(255,255,255,0.12)' }}>
          <div className="flex gap-1 mb-1.5">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="flex-1 rounded-full" style={{ height:4, background: i < gami.streak_atual ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.12)' }} />
            ))}
          </div>
          <p style={{ fontSize:11, color:'rgba(255,255,255,0.45)' }}>
            {gami.streak_atual >= 7 ? '7+ dias seguidos! Incrível! 🎉' : `${7 - Math.min(gami.streak_atual,7)} dia${7 - Math.min(gami.streak_atual,7) !== 1 ? 's' : ''} para completar a semana`}
          </p>
        </div>
      )}
    </div>
  )
}

/* ─── MAIN PAGE ─── */
export default function TreinoHoje() {
  const { user } = useAuth()
  const [treinoAtivo, setTreinoAtivo] = useState(null)

  const { data: alunos = [] } = useQuery({ queryKey: ['alunos'], queryFn: () => listarAlunos().then(r => r.data) })
  const aluno = alunos.find(a => a.email === user?.email) || alunos[0]

  const { data: treinosHoje = [], isLoading } = useQuery({
    queryKey: ['treino-do-dia', aluno?.id],
    queryFn: () => treinoDodia(aluno.id).then(r => r.data),
    enabled: !!aluno,
  })
  const { data: gami } = useQuery({
    queryKey: ['gamificacao', aluno?.id],
    queryFn: () => gamificacaoAluno(aluno.id).then(r => r.data),
    enabled: !!aluno,
  })
  const { data: exercicios = [] } = useQuery({ queryKey: ['exercicios'], queryFn: () => listarExercicios().then(r => r.data) })
  const exercicioMap = Object.fromEntries(exercicios.map(e => [e.id, e]))

  const DIAS_PT = ['domingo','segunda','terça','quarta','quinta','sexta','sábado']
  const hoje = DIAS_PT[new Date().getDay()]
  const hojeLabel = hoje.charAt(0).toUpperCase() + hoje.slice(1)
  const hora = new Date().getHours()
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite'

  if (isLoading && !aluno) return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center animate-bounce-light" style={{ background:'rgba(99,102,241,0.15)' }}>
        <Dumbbell style={{ width:24, height:24, color:'#818cf8' }} />
      </div>
      <p style={{ fontSize:13, color:'#3D4F6A' }}>Carregando seus treinos...</p>
    </div>
  )

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 style={{ fontFamily:'Space Grotesk, sans-serif', fontSize:22, fontWeight:800, color:'#EFF6FF', letterSpacing:'-0.02em' }}>
          {saudacao}, {user?.nome?.split(' ')[0]}
        </h1>
        <p className="text-sm mt-0.5 capitalize" style={{ color:'#3D4F6A' }}>Treinos de {hojeLabel}</p>
      </div>

      <StreakCard gami={gami} />

      {treinosHoje.length === 0 ? (
        <div className="card text-center py-12 space-y-4">
          <div style={{ fontSize:56 }}>😴</div>
          <div>
            <p style={{ fontFamily:'Space Grotesk, sans-serif', fontWeight:800, color:'#EFF6FF', fontSize:18 }}>Dia de descanso!</p>
            <p style={{ fontSize:13, color:'#3D4F6A', marginTop:6, maxWidth:260, margin:'6px auto 0' }}>
              Não há treinos para hoje. Aproveite para recuperar e hidratar bem.
            </p>
          </div>
          <div className="flex justify-center gap-6 pt-2">
            {[{ icon:'💧', label:'Hidratação' }, { icon:'🥗', label:'Nutrição' }, { icon:'😴', label:'Descanso' }].map(({ icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-1">
                <span style={{ fontSize:24 }}>{icon}</span>
                <span style={{ fontSize:11, color:'#3D4F6A', fontWeight:600 }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {treinosHoje.map(t => (
            <TreinoCard key={t.id} treino={t} exercicioMap={exercicioMap} onStart={setTreinoAtivo} />
          ))}
        </div>
      )}

      {treinoAtivo && (
        <ModalExecutar treino={treinoAtivo} exercicioMap={exercicioMap} onClose={() => setTreinoAtivo(null)} />
      )}
    </div>
  )
}
