import { useState, useEffect, useRef, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../contexts/AuthContext'
import { treinoDodia, listarExercicios, executarTreino, gamificacaoAluno, historicoCargaBatch } from '../../api'
import toast from 'react-hot-toast'
import { Play, Dumbbell, CheckCircle, X, ChevronDown, ChevronUp, Timer, Zap, Check, Pause, Flame, RotateCcw, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import VideoPlayer from '../../components/VideoPlayer'

/* ─── REST TIMER ─── */
function RestTimer({ seconds = 60, autoStart = false, onDismiss }) {
  const TOTAL = seconds
  const [elapsed, setElapsed] = useState(0)
  const [running, setRunning] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (autoStart) beginCount()
    return () => clearInterval(ref.current)
  }, [])

  const beginCount = () => {
    setRunning(true)
    ref.current = setInterval(() => {
      setElapsed(e => {
        if (e >= TOTAL - 1) {
          clearInterval(ref.current)
          setRunning(false)
          if (navigator.vibrate) navigator.vibrate([200, 100, 200])
          toast.success('Descansou! Hora de ir! 💪', { icon: '⏱️', duration: 3000 })
          return TOTAL
        }
        return e + 1
      })
    }, 1000)
  }

  const toggle = () => {
    if (running) { clearInterval(ref.current); setRunning(false) }
    else beginCount()
  }

  const reset = () => {
    clearInterval(ref.current)
    setElapsed(0)
    setRunning(false)
  }

  const remaining = TOTAL - elapsed
  const r = 26, circ = 2 * Math.PI * r
  const dash = circ * (1 - elapsed / TOTAL)
  const ringColor = remaining <= 10 ? '#ef4444' : remaining <= 30 ? '#f59e0b' : '#6366f1'
  const min = Math.floor(remaining / 60), sec = remaining % 60

  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl animate-slide-down"
      style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)' }}>
      <div className="relative w-16 h-16 flex-shrink-0">
        <svg className="w-16 h-16 -rotate-90" viewBox="0 0 60 60">
          <circle cx="30" cy="30" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="4" />
          <circle cx="30" cy="30" r={r} fill="none" stroke={ringColor} strokeWidth="4" strokeLinecap="round"
            strokeDasharray={circ} strokeDashoffset={dash}
            style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold tabular-nums"
            style={{ color: ringColor, fontFamily: 'Inter, sans-serif' }}>
            {remaining <= 0 ? 'OK!' : min > 0 ? `${min}:${String(sec).padStart(2, '0')}` : sec}
          </span>
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold" style={{ color: '#F4F4F5' }}>Descanso entre series</p>
        <p className="text-xs truncate" style={{ color: '#71717A' }}>
          {remaining <= 0 ? 'Pronto para proxima serie!' : running ? `${remaining}s restando...` : 'Pausado — pressione play'}
        </p>
      </div>
      <div className="flex items-center gap-1.5">
        <button onClick={reset} className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
          style={{ background: 'rgba(255,255,255,0.07)', color: '#71717A' }}>
          <RotateCcw style={{ width: 13, height: 13 }} />
        </button>
        <button onClick={toggle} className="w-9 h-9 rounded-full flex items-center justify-center text-white transition-all"
          style={{ background: running ? 'rgba(245,158,11,0.85)' : '#6366f1',  }}>
          {running ? <Pause style={{ width: 14, height: 14 }} /> : <Play style={{ width: 14, height: 14, marginLeft: 1 }} />}
        </button>
        <button onClick={onDismiss} className="w-9 h-9 rounded-full flex items-center justify-center transition-colors"
          style={{ background: 'rgba(255,255,255,0.07)', color: '#71717A' }}>
          <X style={{ width: 14, height: 14 }} />
        </button>
      </div>
    </div>
  )
}

/* ─── SET TRACKER ─── */
function SetTracker({ count, completedSets, onToggle }) {
  if (!count) return null
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs font-bold uppercase tracking-wider flex-shrink-0" style={{ color: '#71717A' }}>Series:</span>
      {Array.from({ length: count }).map((_, i) => (
        <button key={i} onClick={() => onToggle(i)}
          className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all"
          style={{
            background: completedSets.includes(i) ? '#10b981' : 'rgba(255,255,255,0.06)',
            border: `2px solid ${completedSets.includes(i) ? '#10b981' : 'rgba(255,255,255,0.1)'}`,
            color: completedSets.includes(i) ? 'white' : '#71717A',
            transform: completedSets.includes(i) ? 'scale(1.1)' : 'scale(1)',
            boxShadow: 'none',
          }}>
          {completedSets.includes(i) ? <Check style={{ width: 14, height: 14 }} /> : i + 1}
        </button>
      ))}
    </div>
  )
}

/* ─── EXERCISE CARD COM HISTORICO ─── */
function ExerciseExCard({ item, idx, ex, hist, completedSets, onToggle, videoAberto, onToggleVideo, onChange }) {
  const seriesCount = parseInt(item.series_realizadas) || 0
  const allDone = seriesCount > 0 && completedSets.length >= seriesCount

  const sessions = Array.isArray(hist) ? hist : (hist?.historico || hist?.execucoes || [])
  const last = sessions.length > 0 ? sessions[sessions.length - 1] : null
  const prev = sessions.length > 1 ? sessions[sessions.length - 2] : null

  const trend = last && prev && last.carga_realizada != null && prev.carga_realizada != null
    ? last.carga_realizada > prev.carga_realizada ? 'up'
      : last.carga_realizada < prev.carga_realizada ? 'down' : 'same'
    : null

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus
  const trendColor = trend === 'up' ? '#10b981' : trend === 'down' ? '#ef4444' : '#6366f1'

  return (
    <div className="card p-4 space-y-4"
      style={{ borderColor: allDone ? 'rgba(16,185,129,0.35)' : 'rgba(255,255,255,0.07)', transition: 'border-color 0.3s' }}>

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-0.5"
            style={{
              background: allDone ? '#10b981' : '#6366f1',
              boxShadow: 'none',
              transition: 'all 0.3s',
            }}>
            {allDone ? <Check style={{ width: 15, height: 15 }} /> : idx + 1}
          </div>
          <div>
            <p className="font-bold text-sm leading-tight" style={{ color: '#F4F4F5', fontFamily: 'Inter, sans-serif' }}>
              {ex?.nome || `Exercicio ${idx + 1}`}
            </p>
            {ex?.grupo_muscular && (
              <p className="text-xs mt-0.5" style={{ color: '#71717A' }}>
                {ex.grupo_muscular}{ex.equipamento ? ` · ${ex.equipamento}` : ''}
              </p>
            )}
            {last && (
              <div className="flex items-center gap-1.5 mt-1">
                {trend && <TrendIcon style={{ width: 11, height: 11, color: trendColor }} />}
                <span className="text-xs font-semibold" style={{ color: '#6366f1' }}>
                  Ultima vez: {last.carga_realizada != null ? `${last.carga_realizada}kg` : '--'}
                  {last.repeticoes_realizadas ? ` x ${last.repeticoes_realizadas}` : ''}
                </span>
              </div>
            )}
          </div>
        </div>
        {ex?.video_url && (
          <button onClick={onToggleVideo}
            className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full transition-all flex-shrink-0"
            style={{ background: videoAberto ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.07)', color: videoAberto ? '#a5b4fc' : '#71717A' }}>
            {videoAberto ? <ChevronUp style={{ width: 11, height: 11 }} /> : <ChevronDown style={{ width: 11, height: 11 }} />}
            {videoAberto ? 'Fechar' : 'Como fazer'}
          </button>
        )}
      </div>

      {ex?.video_url && videoAberto && (
        <div className="animate-slide-down">
          <VideoPlayer url={ex.video_url} title={ex.nome} />
        </div>
      )}

      <SetTracker count={seriesCount} completedSets={completedSets} onToggle={onToggle} />

      <div className="grid grid-cols-3 gap-2">
        {[
          { key: 'carga_realizada',       label: 'Carga (kg)',  type: 'number', hint: last?.carga_realizada != null ? `ult: ${last.carga_realizada}` : null },
          { key: 'repeticoes_realizadas', label: 'Repeticoes',  type: 'text',   hint: last?.repeticoes_realizadas ? `ult: ${last.repeticoes_realizadas}` : null },
          { key: 'series_realizadas',     label: 'Series',      type: 'number', hint: null },
        ].map(({ key, label, type, hint }) => (
          <div key={key}>
            <label style={{ display: 'block', fontSize: 10, fontWeight: 600, color: '#71717A', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
              {label}
              {hint && (
                <span style={{ display: 'block', color: '#6366f1', fontSize: 9, fontWeight: 600, textTransform: 'none', letterSpacing: 0, marginTop: 1 }}>
                  {hint}
                </span>
              )}
            </label>
            <input
              type={type}
              className="input text-center text-sm font-bold py-2.5"
              value={item[key]}
              onChange={e => onChange(key, e.target.value)}
              placeholder="--"
              inputMode={type === 'number' ? 'decimal' : 'text'}
              style={{ fontFamily: 'Inter, sans-serif' }}
            />
          </div>
        ))}
      </div>

      {allDone && (
        <div className="flex items-center gap-2 text-xs font-semibold" style={{ color: '#10b981' }}>
          <CheckCircle style={{ width: 13, height: 13 }} />
          {seriesCount} series concluidas
        </div>
      )}
    </div>
  )
}

/* ─── MODAL EXECUTAR (tela cheia) ─── */
function ModalExecutar({ treino, exercicioMap, alunoId, onClose }) {
  const qc = useQueryClient()
  const [dificuldade, setDificuldade] = useState('ok')
  const [videoAberto, setVideoAberto] = useState(null)
  const [showTimer, setShowTimer] = useState(false)
  const [timerSeconds, setTimerSeconds] = useState(60)
  const [timerKey, setTimerKey] = useState(0)
  const [completedSetsMap, setCompletedSetsMap] = useState({})
  const [itens, setItens] = useState(
    (treino.itens || []).map(i => ({
      exercicio_id: i.exercicio_id,
      treino_item_id: i.id,
      carga_realizada: i.carga != null ? String(i.carga) : '',
      repeticoes_realizadas: i.repeticoes || '',
      series_realizadas: i.series != null ? String(i.series) : '',
      descanso_seg: i.descanso_seg || 60,
    }))
  )

  // Batch: uma query para todos os exercícios do treino (evita N+1)
  const exIds = useMemo(() => itens.map(i => i.exercicio_id).filter(Boolean), [itens])
  const { data: histBatch = {} } = useQuery({
    queryKey: ['historico-carga-batch', alunoId, exIds.join(',')],
    queryFn: () => historicoCargaBatch(alunoId, exIds).then(r => r.data),
    enabled: !!alunoId && exIds.length > 0,
    staleTime: 5 * 60_000,
    retry: false,
  })

  const { mutate, isPending } = useMutation({
    mutationFn: () => executarTreino(treino.id, {
      dificuldade,
      itens: itens.map(i => ({
        exercicio_id: i.exercicio_id,
        treino_item_id: i.treino_item_id,
        carga_realizada: i.carga_realizada ? Number(i.carga_realizada) : null,
        repeticoes_realizadas: i.repeticoes_realizadas || null,
        series_realizadas: i.series_realizadas ? Number(i.series_realizadas) : null,
      })),
    }),
    onSuccess: () => { toast.success('Treino concluido! Mandou bem! 💪🔥'); qc.invalidateQueries(); onClose() },
    onError: () => toast.error('Erro ao registrar treino'),
  })

  const setItem = (idx, key, val) => {
    const c = [...itens]
    c[idx] = { ...c[idx], [key]: val }
    setItens(c)
  }

  const toggleSet = (exId, setIdx) => {
    const item = itens.find(i => i.exercicio_id === exId)
    setCompletedSetsMap(prev => {
      const cur = prev[exId] || []
      const isCompleting = !cur.includes(setIdx)
      if (isCompleting) {
        const secs = item?.descanso_seg || 60
        setTimerSeconds(secs)
        setTimerKey(k => k + 1)
        setShowTimer(true)
      }
      return { ...prev, [exId]: isCompleting ? [...cur, setIdx] : cur.filter(s => s !== setIdx) }
    })
  }

  const totalSeries = itens.reduce((s, i) => s + (parseInt(i.series_realizadas) || 0), 0)
  const completedTotal = Object.values(completedSetsMap).reduce((s, arr) => s + arr.length, 0)
  const pct = totalSeries > 0 ? Math.round((completedTotal / totalSeries) * 100) : 0

  const DIFF = [
    { key: 'facil',   emoji: '😊', label: 'Facil',  bg: 'rgba(16,185,129,0.15)',  border: 'rgba(16,185,129,0.4)',  text: '#34d399' },
    { key: 'ok',      emoji: '💪', label: 'Normal', bg: 'rgba(99,102,241,0.15)',  border: 'rgba(99,102,241,0.4)',  text: '#a5b4fc' },
    { key: 'dificil', emoji: '🔥', label: 'Pesado', bg: 'rgba(239,68,68,0.15)',   border: 'rgba(239,68,68,0.4)',   text: '#f87171' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: '#0C0C0D' }}>
      {/* Header */}
      <div style={{ background: '#0C0C0D', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0, padding: '16px 16px 12px' }}>
        <div className="flex items-center justify-between mb-3 max-w-lg mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: '#6366f1' }}>
              <Zap style={{ width: 14, height: 14, color: 'white' }} />
            </div>
            <div>
              <p style={{ fontSize: 11, color: '#71717A', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em' }}>EXECUTANDO</p>
              <h3 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, color: '#F4F4F5', fontSize: 14, lineHeight: 1.2 }}>{treino.nome}</h3>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.08)', color: '#71717A' }}>
            <X style={{ width: 15, height: 15 }} />
          </button>
        </div>

        {totalSeries > 0 && (
          <div className="max-w-lg mx-auto space-y-1">
            <div className="flex justify-between items-center" style={{ fontSize: 11, color: '#71717A' }}>
              <span>{completedTotal} de {totalSeries} series</span>
              <span style={{ color: pct === 100 ? '#10b981' : '#6366f1', fontWeight: 600 }}>{pct}%</span>
            </div>
            <div className="progress-bar-track">
              <div className="progress-bar-fill" style={{
                width: `${pct}%`,
                background: pct === 100 ? '#10b981' : '#6366f1',
              }} />
            </div>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4 max-w-lg mx-auto">

          {/* Difficulty selector */}
          <div className="card p-4">
            <p className="text-sm font-semibold mb-3" style={{ color: '#A1A1AA' }}>Como esta o treino?</p>
            <div className="grid grid-cols-3 gap-2">
              {DIFF.map(({ key, emoji, label, bg, border, text }) => (
                <button key={key} onClick={() => setDificuldade(key)}
                  className="py-3 rounded-2xl text-sm font-semibold transition-all"
                  style={{
                    background: dificuldade === key ? bg : 'rgba(255,255,255,0.04)',
                    border: `2px solid ${dificuldade === key ? border : 'rgba(255,255,255,0.07)'}`,
                    color: dificuldade === key ? text : '#71717A',
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
            style={{
              background: showTimer ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${showTimer ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.07)'}`,
              color: '#71717A',
            }}>
            <span className="flex items-center gap-2">
              <Timer style={{ width: 15, height: 15, color: '#6366f1' }} />
              Cronometro de descanso
              {showTimer && (
                <span style={{ fontSize: 9, padding: '1px 6px', borderRadius: 999, background: 'rgba(99,102,241,0.25)', color: '#a5b4fc', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  AUTO
                </span>
              )}
            </span>
            {showTimer ? <ChevronUp style={{ width: 14, height: 14 }} /> : <ChevronDown style={{ width: 14, height: 14 }} />}
          </button>

          {showTimer && (
            <RestTimer
              key={timerKey}
              seconds={timerSeconds}
              autoStart
              onDismiss={() => setShowTimer(false)}
            />
          )}

          {/* Exercises */}
          {itens.map((item, idx) => (
            <ExerciseExCard
              key={`${item.exercicio_id}-${idx}`}
              item={item}
              idx={idx}
              ex={exercicioMap[item.exercicio_id]}
              hist={histBatch[item.exercicio_id] || []}
              completedSets={completedSetsMap[item.exercicio_id] || []}
              onToggle={setIdx => toggleSet(item.exercicio_id, setIdx)}
              videoAberto={videoAberto === item.exercicio_id}
              onToggleVideo={() => setVideoAberto(videoAberto === item.exercicio_id ? null : item.exercicio_id)}
              onChange={(key, val) => setItem(idx, key, val)}
            />
          ))}

          {pct === 100 && (
            <div className="rounded-3xl p-5 text-center" style={{
              background: 'linear-gradient(135deg, rgba(5,150,105,0.15), rgba(16,185,129,0.08))',
              border: '1px solid rgba(16,185,129,0.3)',
            }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>🏆</div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, color: '#34d399', fontSize: 16 }}>Todas as series concluidas!</p>
              <p style={{ fontSize: 12, color: '#71717A', marginTop: 4 }}>Finalize para registrar o progresso</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="flex-shrink-0 p-4" style={{ background: '#0C0C0D', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-lg mx-auto">
          <button className="btn-primary w-full py-4 text-base" disabled={isPending} onClick={() => mutate()}>
            {isPending ? (
              <span className="flex items-center gap-2 justify-center">
                <span className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} />
                Salvando...
              </span>
            ) : (
              <span className="flex items-center gap-2 justify-center">
                <CheckCircle style={{ width: 18, height: 18 }} />
                Concluir treino
                {pct > 0 && (
                  <span style={{ background: pct === 100 ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.2)', borderRadius: 999, padding: '2px 8px', fontSize: 12, fontWeight: 600 }}>
                    {pct}%
                  </span>
                )}
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
  const totalSeries = (treino.itens || []).reduce((s, i) => s + (parseInt(i.series) || 0), 0)
  const totalVol = (treino.itens || []).reduce((s, i) => s + (parseInt(i.series) || 0) * (parseFloat(i.carga) || 0), 0)

  return (
    <div className="card space-y-4" style={{ border: '1px solid rgba(99,102,241,0.18)' }}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, color: '#F4F4F5', fontSize: 18, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            {treino.nome}
          </h3>
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <span style={{ fontSize: 12, color: '#71717A' }}>{totalEx} exercicio{totalEx !== 1 ? 's' : ''}</span>
            {totalSeries > 0 && <span style={{ fontSize: 12, color: '#71717A' }}>{totalSeries} series</span>}
            {totalVol > 0 && <span style={{ fontSize: 12, color: '#71717A' }}>{totalVol.toFixed(0)}kg vol</span>}
          </div>
        </div>
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.2)' }}>
          <Dumbbell style={{ width: 20, height: 20, color: '#818cf8' }} />
        </div>
      </div>

      <div className="space-y-2">
        {preview.map((item, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{ background: 'rgba(255,255,255,0.07)', color: '#71717A' }}>{idx + 1}</span>
            <span className="text-sm flex-1 truncate" style={{ color: '#A1A1AA' }}>
              {exercicioMap[item.exercicio_id]?.nome || `Exercicio ${idx + 1}`}
            </span>
            <span className="text-xs font-semibold flex-shrink-0" style={{ color: '#71717A' }}>
              {item.series}x{item.repeticoes}{item.carga ? ` ${item.carga}kg` : ''}
            </span>
          </div>
        ))}
        {totalEx > 3 && (
          <button onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs font-semibold" style={{ color: '#6366f1' }}>
            {expanded ? <ChevronUp style={{ width: 11, height: 11 }} /> : <ChevronDown style={{ width: 11, height: 11 }} />}
            {expanded ? 'Mostrar menos' : `+${totalEx - 3} exercicios`}
          </button>
        )}
        {expanded && (treino.itens || []).slice(3).map((item, idx) => (
          <div key={idx + 3} className="flex items-center gap-3 animate-slide-down">
            <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{ background: 'rgba(255,255,255,0.07)', color: '#71717A' }}>{idx + 4}</span>
            <span className="text-sm flex-1 truncate" style={{ color: '#A1A1AA' }}>
              {exercicioMap[item.exercicio_id]?.nome || `Exercicio ${idx + 4}`}
            </span>
            <span className="text-xs font-semibold flex-shrink-0" style={{ color: '#71717A' }}>
              {item.series}x{item.repeticoes}
            </span>
          </div>
        ))}
      </div>

      <button className="btn-primary w-full py-3.5" onClick={() => onStart(treino)}>
        <Play style={{ width: 16, height: 16 }} />
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
      background: '#c2410c',
      border: '1px solid rgba(249,115,22,0.2)',
    }}>
      <div className="flex items-center justify-between relative z-10">
        <div>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Sequencia atual</p>
          <div className="flex items-end gap-2">
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 56, fontWeight: 600, lineHeight: 1, letterSpacing: '-0.03em' }}>{gami.streak_atual}</span>
            <Flame style={{ width: 32, height: 32, marginBottom: 8, color: '#fbbf24' }} />
          </div>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>dias consecutivos</p>
        </div>
        <div className="space-y-3 text-right">
          <div>
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recorde</p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 22, fontWeight: 600 }}>🏆 {gami.streak_recorde}</p>
          </div>
          <div>
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Treinos</p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 22, fontWeight: 600 }}>💪 {gami.total_treinos}</p>
          </div>
        </div>
      </div>
      {gami.streak_atual > 0 && (
        <div className="mt-4 pt-3 relative z-10" style={{ borderTop: '1px solid rgba(255,255,255,0.12)' }}>
          <div className="flex gap-1 mb-1.5">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="flex-1 rounded-full" style={{ height: 4, background: i < Math.min(gami.streak_atual, 7) ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.12)' }} />
            ))}
          </div>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>
            {gami.streak_atual >= 7 ? '7+ dias seguidos! Voce e imparavel! 🎉' : `${7 - Math.min(gami.streak_atual, 7)} dia${7 - Math.min(gami.streak_atual, 7) !== 1 ? 's' : ''} para completar a semana`}
          </p>
        </div>
      )}
    </div>
  )
}

/* ─── MAIN PAGE ─── */
export default function TreinoHoje() {
  const { user, alunoId } = useAuth()
  const [treinoAtivo, setTreinoAtivo] = useState(null)

  const { data: treinosHoje = [], isLoading } = useQuery({
    queryKey: ['treino-do-dia', alunoId],
    queryFn: () => treinoDodia(alunoId).then(r => r.data),
    enabled: !!alunoId,
  })
  const { data: gami } = useQuery({
    queryKey: ['gamificacao', alunoId],
    queryFn: () => gamificacaoAluno(alunoId).then(r => r.data),
    enabled: !!alunoId,
  })
  const { data: exercicios = [] } = useQuery({
    queryKey: ['exercicios'],
    queryFn: () => listarExercicios().then(r => r.data),
  })
  const exercicioMap = Object.fromEntries(exercicios.map(e => [e.id, e]))

  const hora = new Date().getHours()
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite'
  const DIAS_LABEL = ['Domingo', 'Segunda', 'Terca-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sabado']
  const hojeLabel = DIAS_LABEL[new Date().getDay()]

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center animate-bounce-light"
        style={{ background: 'rgba(99,102,241,0.15)' }}>
        <Dumbbell style={{ width: 24, height: 24, color: '#818cf8' }} />
      </div>
      <p style={{ fontSize: 13, color: '#71717A' }}>Carregando seus treinos...</p>
    </div>
  )

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: 22, fontWeight: 600, color: '#F4F4F5', letterSpacing: '-0.02em' }}>
          {saudacao}, {user?.nome?.split(' ')[0]}
        </h1>
        <p className="text-sm mt-0.5" style={{ color: '#71717A' }}>Treinos de {hojeLabel}</p>
      </div>

      <StreakCard gami={gami} />

      {treinosHoje.length === 0 ? (
        <div className="card text-center py-12 space-y-4">
          <div style={{ fontSize: 56 }}>😴</div>
          <div>
            <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, color: '#F4F4F5', fontSize: 18 }}>Dia de descanso!</p>
            <p style={{ fontSize: 13, color: '#71717A', marginTop: 6 }}>
              Nao ha treinos para hoje. Aproveite para recuperar.
            </p>
          </div>
          <div className="flex justify-center gap-6 pt-2">
            {[{ icon: '💧', label: 'Hidratacao' }, { icon: '🥗', label: 'Nutricao' }, { icon: '😴', label: 'Descanso' }].map(({ icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-1">
                <span style={{ fontSize: 28 }}>{icon}</span>
                <span style={{ fontSize: 11, color: '#71717A', fontWeight: 600 }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p style={{ fontSize: 13, fontWeight: 600, color: '#71717A', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              {treinosHoje.length} treino{treinosHoje.length !== 1 ? 's' : ''} para hoje
            </p>
            {gami && gami.total_treinos > 0 && (
              <span style={{ fontSize: 11, color: '#6366f1', fontWeight: 600, padding: '2px 10px', borderRadius: 999, background: 'rgba(99,102,241,0.12)' }}>
                {gami.total_treinos} totais
              </span>
            )}
          </div>
          {treinosHoje.map(t => (
            <TreinoCard key={t.id} treino={t} exercicioMap={exercicioMap} onStart={setTreinoAtivo} />
          ))}
        </div>
      )}

      {treinoAtivo && (
        <ModalExecutar
          treino={treinoAtivo}
          exercicioMap={exercicioMap}
          alunoId={alunoId}
          onClose={() => setTreinoAtivo(null)}
        />
      )}
    </div>
  )
}
