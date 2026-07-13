import { useState, useEffect, useRef, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../contexts/AuthContext'
import { treinoDodia, listarExercicios, executarTreino, gamificacaoAluno, historicoCargaBatch, treinoAlternativo } from '../../api'
import toast from 'react-hot-toast'
import { Play, Dumbbell, CheckCircle, X, ChevronDown, ChevronUp, Timer, Zap, Check, Pause, Flame, RotateCcw, TrendingUp, TrendingDown, Minus, Plus, Shuffle, Trophy } from 'lucide-react'
import VideoPlayer from '../../components/VideoPlayer'

/* ─── STEPPER ─── */
function Stepper({ label, value, onChange, step = 1, min = 0, hint, isPR = false }) {
  const parse = v => (v === '' || v == null ? NaN : parseFloat(v))
  const inc = () => { const n = parse(value); onChange(String(isNaN(n) ? step : parseFloat((n + step).toFixed(2)))) }
  const dec = () => { const n = parse(value); if (!isNaN(n)) onChange(String(parseFloat(Math.max(min, n - step).toFixed(2)))) }
  const accent = isPR ? '#fbbf24' : '#ef4444'
  return (
    <div>
      <label style={{ display:'block', fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:6 }}>
        {label}
        {hint && <span style={{ display:'block', color:accent, fontSize:9, fontWeight:600, textTransform:'none', letterSpacing:0, marginTop:1 }}>{hint}</span>}
        {isPR && <span style={{ display:'inline-block', marginLeft:4, fontSize:9, color:'#fbbf24', fontWeight:700 }}>🏆</span>}
      </label>
      <div style={{ display:'flex', alignItems:'center', borderRadius:12, border:`1.5px solid ${isPR ? 'rgba(251,191,36,0.35)' : 'rgba(255,255,255,0.09)'}`, background: isPR ? 'rgba(251,191,36,0.05)' : 'rgba(255,255,255,0.03)', overflow:'hidden' }}>
        <button type="button" onClick={dec} style={{ width:40, height:46, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, color:'rgba(255,255,255,0.35)', background:'transparent', border:'none', cursor:'pointer', borderRight:'1px solid rgba(255,255,255,0.07)', transition:'all 0.12s' }}
          onMouseEnter={e => { e.currentTarget.style.background='rgba(255,255,255,0.05)'; e.currentTarget.style.color='rgba(255,255,255,0.7)' }}
          onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='rgba(255,255,255,0.35)' }}>
          <Minus style={{ width:12, height:12 }} />
        </button>
        <input type="text" inputMode="decimal" value={value} onChange={e => onChange(e.target.value)} placeholder="--"
          style={{ flex:1, minWidth:0, textAlign:'center', fontSize:15, fontWeight:800, color: isPR ? '#fbbf24' : '#F4F4F5', background:'transparent', border:'none', outline:'none', padding:'0 2px', height:46, fontFamily:'Inter,sans-serif', letterSpacing:'-0.02em' }} />
        <button type="button" onClick={inc} style={{ width:40, height:46, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, color:accent, background:'transparent', border:'none', cursor:'pointer', borderLeft:'1px solid rgba(255,255,255,0.07)', transition:'all 0.12s' }}
          onMouseEnter={e => { e.currentTarget.style.background=`${accent}10` }}
          onMouseLeave={e => { e.currentTarget.style.background='transparent' }}>
          <Plus style={{ width:12, height:12 }} />
        </button>
      </div>
    </div>
  )
}

/* ─── CONFETTI ─── */
function Confetti() {
  const pieces = useMemo(() => Array.from({ length: 48 }, (_, i) => ({
    id:i, left: Math.random()*100,
    color:['#ef4444','#f59e0b','#10b981','#3b82f6','#a855f7','#ec4899','#fbbf24','#f87171'][Math.floor(Math.random()*8)],
    delay:(Math.random()*1.8).toFixed(2), dur:(2.2+Math.random()*0.8).toFixed(2),
    size:5+Math.floor(Math.random()*9), isCircle:Math.random()>0.45,
  })), [])
  return (
    <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:9998, overflow:'hidden' }}>
      <style>{`@keyframes cfFall{0%{transform:translateY(-20px) rotate(0deg);opacity:1}100%{transform:translateY(110vh) rotate(720deg);opacity:0}}`}</style>
      {pieces.map(p => (
        <div key={p.id} style={{ position:'absolute', left:`${p.left}%`, top:0, width:p.size, height:p.size, background:p.color, borderRadius:p.isCircle?'50%':3, animation:`cfFall ${p.dur}s ease-in ${p.delay}s both` }} />
      ))}
    </div>
  )
}

/* ─── REST TIMER ─── */
function RestTimer({ seconds=60, autoStart=false, onDismiss }) {
  const TOTAL=seconds
  const [elapsed,setElapsed]=useState(0)
  const [running,setRunning]=useState(false)
  const ref=useRef(null)
  useEffect(() => { if(autoStart) beginCount(); return () => clearInterval(ref.current) }, [])
  const beginCount = () => {
    setRunning(true)
    ref.current = setInterval(() => {
      setElapsed(e => {
        if (e >= TOTAL-1) { clearInterval(ref.current); setRunning(false); if(navigator.vibrate) navigator.vibrate([200,100,200]); toast.success('Descansou! Hora de ir! 💪',{icon:'⏱️',duration:3000}); return TOTAL }
        return e+1
      })
    },1000)
  }
  const toggle = () => { if(running){clearInterval(ref.current);setRunning(false)}else beginCount() }
  const reset  = () => { clearInterval(ref.current); setElapsed(0); setRunning(false) }
  const remaining=TOTAL-elapsed
  const r=26, circ=2*Math.PI*r, dash=circ*(1-elapsed/TOTAL)
  const ringColor=remaining<=10?'#ef4444':remaining<=30?'#f59e0b':'#6366f1'
  const min=Math.floor(remaining/60), sec=remaining%60
  return (
    <div style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 16px', borderRadius:18, background:'rgba(99,102,241,0.07)', border:'1px solid rgba(99,102,241,0.22)' }}>
      <div style={{ position:'relative', width:60, height:60, flexShrink:0 }}>
        <svg style={{ width:60, height:60, transform:'rotate(-90deg)' }} viewBox="0 0 60 60">
          <circle cx="30" cy="30" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="4" />
          <circle cx="30" cy="30" r={r} fill="none" stroke={ringColor} strokeWidth="4" strokeLinecap="round"
            strokeDasharray={circ} strokeDashoffset={dash} style={{ transition:'stroke-dashoffset 1s linear, stroke 0.3s', filter:`drop-shadow(0 0 6px ${ringColor})` }} />
        </svg>
        <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <span style={{ fontSize:11, fontWeight:800, color:ringColor, fontFamily:'Inter,sans-serif', letterSpacing:'-0.02em', textShadow:`0 0 12px ${ringColor}80` }}>
            {remaining<=0?'OK!':min>0?`${min}:${String(sec).padStart(2,'0')}`:sec}
          </span>
        </div>
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <p style={{ fontSize:13, fontWeight:700, color:'#F4F4F5', letterSpacing:'-0.01em' }}>Descanso entre séries</p>
        <p style={{ fontSize:11, color:'rgba(255,255,255,0.4)', marginTop:2 }}>
          {remaining<=0?'Pronto para próxima série!':running?`${remaining}s restando...`:'Pausado — pressione play'}
        </p>
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:6 }}>
        <button onClick={reset} style={{ width:36, height:36, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.09)', cursor:'pointer', color:'rgba(255,255,255,0.4)' }}>
          <RotateCcw style={{ width:13, height:13 }} />
        </button>
        <button onClick={toggle} style={{ width:36, height:36, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', color:'white', border:'none', cursor:'pointer', background:running?'rgba(245,158,11,0.85)':'#ef4444', boxShadow:running?'0 4px 12px rgba(245,158,11,0.4)':'0 4px 12px rgba(239,68,68,0.4)' }}>
          {running?<Pause style={{ width:14, height:14 }} />:<Play style={{ width:14, height:14, marginLeft:1 }} />}
        </button>
        <button onClick={onDismiss} style={{ width:36, height:36, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.09)', cursor:'pointer', color:'rgba(255,255,255,0.4)' }}>
          <X style={{ width:14, height:14 }} />
        </button>
      </div>
    </div>
  )
}

/* ─── SET TRACKER ─── */
function SetTracker({ count, completedSets, onToggle }) {
  if (!count) return null
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
      <span style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.38)', textTransform:'uppercase', letterSpacing:'0.07em', flexShrink:0 }}>Séries:</span>
      {Array.from({length:count}).map((_,i) => {
        const done = completedSets.includes(i)
        return (
          <button key={i} onClick={() => onToggle(i)}
            style={{
              width:40, height:40, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:13, fontWeight:800, cursor:'pointer', border:'none', transition:'all 0.2s',
              background: done ? 'rgba(16,185,129,0.9)' : 'rgba(255,255,255,0.05)',
              color: done ? 'white' : 'rgba(255,255,255,0.35)',
              boxShadow: done ? '0 0 16px rgba(16,185,129,0.5), inset 0 1px 0 rgba(255,255,255,0.2)' : 'inset 0 1px 0 rgba(255,255,255,0.06)',
              transform: done ? 'scale(1.08)' : 'scale(1)',
            }}>
            {done ? <Check style={{ width:15, height:15 }} /> : i+1}
          </button>
        )
      })}
    </div>
  )
}

/* ─── SPARKLINE ─── */
function Sparkline({ values }) {
  const valid=(values||[]).filter(v=>v!=null&&!isNaN(v))
  if (valid.length<2) return null
  const W=64, H=20, PAD=2
  const min=Math.min(...valid), max=Math.max(...valid), range=max-min||1
  const pts=valid.map((v,i)=>{ const x=PAD+(i/(valid.length-1))*(W-PAD*2); const y=H-PAD-((v-min)/range)*(H-PAD*2); return `${x.toFixed(1)},${y.toFixed(1)}` })
  const last=valid[valid.length-1], first=valid[0]
  const color=last>first?'#10b981':last<first?'#f87171':'#6b7280'
  const [lx,ly]=pts[pts.length-1].split(',')
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display:'block', overflow:'visible', flexShrink:0 }}>
      <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" opacity="0.75" />
      <circle cx={lx} cy={ly} r="2.5" fill={color} style={{ filter:`drop-shadow(0 0 4px ${color})` }} />
    </svg>
  )
}

/* ─── EXERCISE CARD ─── */
function ExerciseExCard({ item, idx, ex, hist, completedSets, onToggle, videoAberto, onToggleVideo, onChange, onSubstituir, substituindo }) {
  const seriesCount=parseInt(item.series_realizadas)||0
  const allDone=seriesCount>0&&completedSets.length>=seriesCount
  const sessions=Array.isArray(hist)?hist:(hist?.historico||hist?.execucoes||[])
  const last=sessions.length>0?sessions[sessions.length-1]:null
  const prev=sessions.length>1?sessions[sessions.length-2]:null
  const maxCarga=sessions.length>0?Math.max(...sessions.map(s=>s.carga_realizada||0)):null
  const currentCarga=parseFloat(item.carga_realizada)
  const isPR=maxCarga!==null&&!isNaN(currentCarga)&&currentCarga>maxCarga&&currentCarga>0
  const trend=last&&prev&&last.carga_realizada!=null&&prev.carga_realizada!=null
    ? last.carga_realizada>prev.carga_realizada?'up':last.carga_realizada<prev.carga_realizada?'down':'same'
    : null
  const TrendIcon=trend==='up'?TrendingUp:trend==='down'?TrendingDown:Minus
  const trendColor=trend==='up'?'#10b981':trend==='down'?'#f87171':'rgba(255,255,255,0.3)'
  const borderColor=allDone?'rgba(16,185,129,0.3)':isPR?'rgba(251,191,36,0.3)':'rgba(255,255,255,0.07)'
  const badgeBg=allDone?'#10b981':isPR?'#f59e0b':'#ef4444'

  return (
    <div style={{
      padding:18, borderRadius:18,
      background:`radial-gradient(ellipse at 95% 0%, ${allDone?'rgba(16,185,129,0.09)':isPR?'rgba(251,191,36,0.07)':'rgba(239,68,68,0.06)'} 0%, transparent 55%), #111113`,
      border:`1px solid ${borderColor}`,
      boxShadow:'inset 0 1px 0 rgba(255,255,255,0.04)',
      transition:'border-color 0.3s',
    }}>

      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12, marginBottom:16 }}>
        <div style={{ display:'flex', alignItems:'flex-start', gap:12 }}>
          <div style={{
            width:38, height:38, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:13, fontWeight:900, color:'white', flexShrink:0, marginTop:1, transition:'all 0.3s',
            background:badgeBg, boxShadow:`0 4px 14px ${badgeBg}40`,
          }}>
            {allDone?<Check style={{ width:16, height:16 }} />:idx+1}
          </div>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', marginBottom:3 }}>
              <p style={{ fontSize:15, fontWeight:800, color:'#F4F4F5', letterSpacing:'-0.02em', fontFamily:'Inter,sans-serif' }}>
                {ex?.nome||`Exercício ${idx+1}`}
              </p>
              {isPR && (
                <span style={{ fontSize:9, padding:'2px 8px', borderRadius:999, background:'rgba(251,191,36,0.15)', color:'#fbbf24', fontWeight:800, border:'1px solid rgba(251,191,36,0.28)', letterSpacing:'0.05em' }}>
                  🏆 RECORDE
                </span>
              )}
            </div>
            {ex?.grupo_muscular && (
              <p style={{ fontSize:11, color:'rgba(255,255,255,0.38)', marginBottom:4 }}>
                {ex.grupo_muscular}{ex.equipamento?` · ${ex.equipamento}`:''}
              </p>
            )}
            {last && (
              <div>
                <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                  {trend&&<TrendIcon style={{ width:11, height:11, color:trendColor }} />}
                  <span style={{ fontSize:11, fontWeight:700, color:'#f87171', letterSpacing:'-0.01em' }}>
                    Última: {last.carga_realizada!=null?`${last.carga_realizada}kg`:'--'}
                    {last.repeticoes_realizadas?` × ${last.repeticoes_realizadas}`:''}
                  </span>
                </div>
                {sessions.length>=2 && (
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:5 }}>
                    <Sparkline values={sessions.slice(-8).map(s=>s.carga_realizada)} />
                    <span style={{ fontSize:10, color:'rgba(255,255,255,0.3)', fontFamily:'Inter,sans-serif' }}>{sessions.length} sessões</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        {ex?.video_url && (
          <button onClick={onToggleVideo}
            style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, fontWeight:700, padding:'6px 12px', borderRadius:999, cursor:'pointer', border:'1px solid', transition:'all 0.15s', flexShrink:0,
              background: videoAberto?'rgba(99,102,241,0.18)':'rgba(255,255,255,0.05)',
              borderColor: videoAberto?'rgba(99,102,241,0.4)':'rgba(255,255,255,0.1)',
              color: videoAberto?'#a5b4fc':'rgba(255,255,255,0.4)',
            }}>
            {videoAberto?<ChevronUp style={{ width:11, height:11 }} />:<ChevronDown style={{ width:11, height:11 }} />}
            {videoAberto?'Fechar':'Como fazer'}
          </button>
        )}
      </div>

      {ex?.video_url&&videoAberto&&(
        <div style={{ marginBottom:16 }}>
          <VideoPlayer url={ex.video_url} title={ex.nome} />
        </div>
      )}

      <div style={{ marginBottom:16 }}>
        <SetTracker count={seriesCount} completedSets={completedSets} onToggle={onToggle} />
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:14 }}>
        <Stepper label="Carga (kg)" value={item.carga_realizada} step={2.5} hint={last?.carga_realizada!=null?`ult: ${last.carga_realizada}`:null} isPR={isPR} onChange={val=>onChange('carga_realizada',val)} />
        <Stepper label="Reps" value={item.repeticoes_realizadas} step={1} hint={last?.repeticoes_realizadas?`ult: ${last.repeticoes_realizadas}`:null} onChange={val=>onChange('repeticoes_realizadas',val)} />
        <Stepper label="Séries" value={item.series_realizadas} step={1} onChange={val=>onChange('series_realizadas',val)} />
      </div>

      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        {allDone?(
          <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:11, fontWeight:700, color:'#10b981' }}>
            <CheckCircle style={{ width:13, height:13 }} />
            {seriesCount} séries concluídas
          </div>
        ):<div/>}
        <button type="button" onClick={onSubstituir} disabled={substituindo}
          style={{ display:'flex', alignItems:'center', gap:6, fontSize:11, fontWeight:700, padding:'6px 14px', borderRadius:999, background:'rgba(255,255,255,0.04)', color:'rgba(255,255,255,0.35)', border:'1px solid rgba(255,255,255,0.08)', cursor:'pointer', opacity:substituindo?0.6:1, transition:'all 0.15s' }}
          onMouseEnter={e => { if(!substituindo){e.currentTarget.style.background='rgba(255,255,255,0.07)'; e.currentTarget.style.color='rgba(255,255,255,0.6)'} }}
          onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.04)'; e.currentTarget.style.color='rgba(255,255,255,0.35)' }}>
          {substituindo
            ?<span style={{ width:11, height:11, border:'1.5px solid rgba(255,255,255,0.2)', borderTopColor:'white', borderRadius:'50%', display:'inline-block', animation:'spin 0.7s linear infinite' }} />
            :<Shuffle style={{ width:11, height:11 }} />}
          Substituir IA
        </button>
      </div>
    </div>
  )
}

/* ─── MODAL EXECUTAR ─── */
function ModalExecutar({ treino, exercicioMap, alunoId, onClose }) {
  const qc=useQueryClient()
  const [dificuldade,setDificuldade]=useState('ok')
  const [videoAberto,setVideoAberto]=useState(null)
  const [showTimer,setShowTimer]=useState(false)
  const [timerSeconds,setTimerSeconds]=useState(60)
  const [timerKey,setTimerKey]=useState(0)
  const [completedSetsMap,setCompletedSetsMap]=useState({})
  const [substituirState,setSubstituirState]=useState({ exId:null, loading:false, result:null })
  const [celebracao,setCelebracao]=useState(null)
  const [itens,setItens]=useState(
    (treino.itens||[]).map(i=>({ exercicio_id:i.exercicio_id, treino_item_id:i.id, carga_realizada:i.carga!=null?String(i.carga):'', repeticoes_realizadas:i.repeticoes||'', series_realizadas:i.series!=null?String(i.series):'', descanso_seg:i.descanso_seg||60 }))
  )
  const exIds=useMemo(()=>itens.map(i=>i.exercicio_id).filter(Boolean),[itens])
  const { data:histBatch={} }=useQuery({ queryKey:['historico-carga-batch',alunoId,exIds.join(',')], queryFn:()=>historicoCargaBatch(alunoId,exIds).then(r=>r.data), enabled:!!alunoId&&exIds.length>0, staleTime:5*60_000, retry:false })
  const calcStats=(completedMap)=>{
    const prs=itens.filter(item=>{ const hist=histBatch[item.exercicio_id]||[]; const sessions=Array.isArray(hist)?hist:[]; const maxCarga=sessions.length>0?Math.max(...sessions.map(s=>s.carga_realizada||0)):null; const cur=parseFloat(item.carga_realizada); return maxCarga!==null&&!isNaN(cur)&&cur>maxCarga&&cur>0 }).map(item=>exercicioMap[item.exercicio_id]?.nome||'Exercício')
    const sets=Object.values(completedMap).reduce((s,arr)=>s+arr.length,0)
    const volume=itens.reduce((s,i)=>{ const carga=parseFloat(i.carga_realizada)||0; const reps=parseInt(i.repeticoes_realizadas)||0; const series=parseInt(i.series_realizadas)||0; return s+carga*reps*series },0)
    return { sets, volume, prs }
  }
  const { mutate,isPending }=useMutation({
    mutationFn:()=>executarTreino(treino.id,{ dificuldade, itens:itens.map(i=>({ exercicio_id:i.exercicio_id, treino_item_id:i.treino_item_id, carga_realizada:i.carga_realizada?Number(i.carga_realizada):null, repeticoes_realizadas:i.repeticoes_realizadas||null, series_realizadas:i.series_realizadas?Number(i.series_realizadas):null })) }),
    onSuccess:()=>{ qc.invalidateQueries(); setCelebracao(calcStats(completedSetsMap)) },
    onError:()=>toast.error('Erro ao registrar treino'),
  })
  const handleSubstituir=async(exId)=>{
    if (substituirState.exId===exId&&substituirState.result) { setSubstituirState({exId:null,loading:false,result:null}); return }
    const ex=exercicioMap[exId]
    setSubstituirState({exId,loading:true,result:null})
    try {
      const res=await treinoAlternativo({ treino_original:{nome:ex?.nome||'',grupo_muscular:ex?.grupo_muscular||'',equipamento:ex?.equipamento||''}, equipamento_indisponivel:ex?.equipamento||'' })
      setSubstituirState({exId,loading:false,result:res.data})
    } catch { setSubstituirState({exId:null,loading:false,result:null}); toast.error('Não foi possível buscar alternativas') }
  }
  const setItem=(idx,key,val)=>{ const c=[...itens]; c[idx]={...c[idx],[key]:val}; setItens(c) }
  const toggleSet=(exId,setIdx)=>{
    const item=itens.find(i=>i.exercicio_id===exId)
    setCompletedSetsMap(prev=>{
      const cur=prev[exId]||[]
      const isCompleting=!cur.includes(setIdx)
      if(isCompleting){ const secs=item?.descanso_seg||60; setTimerSeconds(secs); setTimerKey(k=>k+1); setShowTimer(true); if(navigator.vibrate)navigator.vibrate(50) }
      return {...prev,[exId]:isCompleting?[...cur,setIdx]:cur.filter(s=>s!==setIdx)}
    })
  }
  const totalSeries=itens.reduce((s,i)=>s+(parseInt(i.series_realizadas)||0),0)
  const completedTotal=Object.values(completedSetsMap).reduce((s,arr)=>s+arr.length,0)
  const pct=totalSeries>0?Math.round((completedTotal/totalSeries)*100):0
  const DIFF=[
    { key:'facil', emoji:'😊', label:'Fácil',  bg:'rgba(16,185,129,0.12)', border:'rgba(16,185,129,0.35)', text:'#34d399' },
    { key:'ok',    emoji:'💪', label:'Normal', bg:'rgba(99,102,241,0.12)', border:'rgba(99,102,241,0.35)', text:'#a5b4fc' },
    { key:'dificil',emoji:'🔥',label:'Pesado', bg:'rgba(239,68,68,0.12)',  border:'rgba(239,68,68,0.35)',  text:'#f87171' },
  ]

  if (celebracao) {
    return (
      <div style={{ position:'fixed', inset:0, zIndex:50, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'#0C0C0D', padding:'0 24px' }}>
        <Confetti />
        <div style={{ maxWidth:360, width:'100%', textAlign:'center' }}>
          <div style={{ fontSize:88, lineHeight:1, marginBottom:20 }}>🏆</div>
          <h2 style={{ fontFamily:'Inter,sans-serif', fontWeight:900, fontSize:30, color:'#F4F4F5', letterSpacing:'-0.04em', marginBottom:6 }}>Treino Concluído!</h2>
          <p style={{ fontSize:14, color:'rgba(255,255,255,0.45)', marginBottom:24 }}>Mandou muito bem! Continue assim 💪</p>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, marginBottom:16 }}>
            {[
              { label:'Séries', value:celebracao.sets, color:'#ef4444' },
              { label:'Volume', value:celebracao.volume>0?`${celebracao.volume.toFixed(0)}kg`:'—', color:'#f59e0b' },
              { label:'Recordes', value:celebracao.prs.length||'—', color:'#10b981' },
            ].map(({ label,value,color }) => (
              <div key={label} style={{ padding:'16px 8px', borderRadius:16, background:'#111113', border:'1px solid rgba(255,255,255,0.07)', boxShadow:'inset 0 1px 0 rgba(255,255,255,0.05)' }}>
                <p style={{ fontSize:26, fontWeight:900, color, fontFamily:'Inter,sans-serif', letterSpacing:'-0.03em', textShadow:`0 0 24px ${color}60` }}>{value}</p>
                <p style={{ fontSize:11, color:'rgba(255,255,255,0.38)', marginTop:3, fontWeight:600 }}>{label}</p>
              </div>
            ))}
          </div>
          {celebracao.prs.length>0&&(
            <div style={{ borderRadius:16, padding:16, background:'rgba(251,191,36,0.08)', border:'1px solid rgba(251,191,36,0.2)', marginBottom:16, textAlign:'left' }}>
              <p style={{ fontSize:12, fontWeight:800, color:'#fbbf24', marginBottom:8 }}>🏆 Novos Recordes Pessoais!</p>
              {celebracao.prs.map((nome,i)=>(
                <p key={i} style={{ fontSize:12, color:'rgba(255,255,255,0.6)', marginTop:4 }}>• {nome}</p>
              ))}
            </div>
          )}
          <button onClick={onClose} style={{ width:'100%', padding:'15px 24px', borderRadius:16, background:'linear-gradient(135deg,#ef4444,#dc2626)', border:'none', color:'white', fontSize:16, fontWeight:800, cursor:'pointer', fontFamily:'Inter,sans-serif', letterSpacing:'-0.02em', boxShadow:'0 6px 24px rgba(239,68,68,0.4), inset 0 1px 0 rgba(255,255,255,0.15)' }}>
            Fechar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ position:'fixed', inset:0, zIndex:50, display:'flex', flexDirection:'column', background:'#0C0C0D' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      {/* Header */}
      <div style={{ background:'rgba(10,10,11,0.95)', borderBottom:'1px solid rgba(255,255,255,0.06)', flexShrink:0, padding:'14px 16px 12px', backdropFilter:'blur(16px)' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12, maxWidth:520, margin:'0 auto 12px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:36, height:36, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', background:'linear-gradient(145deg,#ef4444,#c42121)', boxShadow:'0 3px 12px rgba(239,68,68,0.45)' }}>
              <Zap style={{ width:15, height:15, color:'white' }} />
            </div>
            <div>
              <p style={{ fontSize:10, color:'rgba(255,255,255,0.38)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em' }}>EXECUTANDO</p>
              <h3 style={{ fontFamily:'Inter,sans-serif', fontWeight:800, color:'#F4F4F5', fontSize:15, lineHeight:1.2, letterSpacing:'-0.02em' }}>{treino.nome}</h3>
            </div>
          </div>
          <button onClick={onClose} style={{ width:34, height:34, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.09)', cursor:'pointer', color:'rgba(255,255,255,0.5)' }}>
            <X style={{ width:15, height:15 }} />
          </button>
        </div>
        {totalSeries>0&&(
          <div style={{ maxWidth:520, margin:'0 auto' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:11, marginBottom:5, color:'rgba(255,255,255,0.38)', fontWeight:600 }}>
              <span>{completedTotal} de {totalSeries} séries</span>
              <span style={{ color:pct===100?'#10b981':'#ef4444', fontWeight:800 }}>{pct}%</span>
            </div>
            <div style={{ height:4, background:'rgba(255,255,255,0.06)', borderRadius:4, overflow:'hidden' }}>
              <div style={{ height:'100%', width:`${pct}%`, background:pct===100?'#10b981':'linear-gradient(90deg,#ef4444,#f87171)', borderRadius:4, transition:'width 0.4s ease', boxShadow:pct===100?'0 0 10px rgba(16,185,129,0.6)':'0 0 10px rgba(239,68,68,0.5)' }} />
            </div>
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ flex:1, overflowY:'auto', padding:'16px', paddingBottom:100 }}>
        <div style={{ maxWidth:520, margin:'0 auto', display:'flex', flexDirection:'column', gap:12 }}>

          <div style={{ padding:16, borderRadius:18, background:'#111113', border:'1px solid rgba(255,255,255,0.07)', boxShadow:'inset 0 1px 0 rgba(255,255,255,0.04)' }}>
            <p style={{ fontSize:12, fontWeight:700, color:'rgba(255,255,255,0.5)', marginBottom:10, letterSpacing:'-0.01em' }}>Como está o treino?</p>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
              {DIFF.map(({ key,emoji,label,bg,border,text })=>(
                <button key={key} onClick={()=>setDificuldade(key)}
                  style={{ padding:'12px 6px', borderRadius:14, fontSize:12, fontWeight:800, cursor:'pointer', transition:'all 0.2s', border:`2px solid ${dificuldade===key?border:'rgba(255,255,255,0.07)'}`, background:dificuldade===key?bg:'rgba(255,255,255,0.03)', color:dificuldade===key?text:'rgba(255,255,255,0.38)', boxShadow:dificuldade===key?`0 0 18px ${bg}`:undefined }}>
                  <div style={{ fontSize:22, marginBottom:4 }}>{emoji}</div>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <button onClick={()=>setShowTimer(!showTimer)}
            style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 16px', borderRadius:14, cursor:'pointer', border:`1px solid ${showTimer?'rgba(99,102,241,0.3)':'rgba(255,255,255,0.08)'}`, background:showTimer?'rgba(99,102,241,0.08)':'rgba(255,255,255,0.03)', color:'rgba(255,255,255,0.5)', transition:'all 0.15s', fontSize:13, fontWeight:700 }}>
            <span style={{ display:'flex', alignItems:'center', gap:8 }}>
              <Timer style={{ width:15, height:15, color:'#6366f1' }} />
              Cronômetro de descanso
              {showTimer&&<span style={{ fontSize:9, padding:'2px 7px', borderRadius:999, background:'rgba(99,102,241,0.25)', color:'#a5b4fc', fontWeight:800, textTransform:'uppercase', letterSpacing:'0.05em' }}>AUTO</span>}
            </span>
            {showTimer?<ChevronUp style={{ width:14, height:14 }} />:<ChevronDown style={{ width:14, height:14 }} />}
          </button>

          {showTimer&&<RestTimer key={timerKey} seconds={timerSeconds} autoStart onDismiss={()=>setShowTimer(false)} />}

          {itens.map((item,idx)=>(
            <div key={`${item.exercicio_id}-${idx}`} style={{ display:'flex', flexDirection:'column', gap:8 }}>
              <ExerciseExCard item={item} idx={idx} ex={exercicioMap[item.exercicio_id]} hist={histBatch[item.exercicio_id]||[]} completedSets={completedSetsMap[item.exercicio_id]||[]} onToggle={setIdx=>toggleSet(item.exercicio_id,setIdx)} videoAberto={videoAberto===item.exercicio_id} onToggleVideo={()=>setVideoAberto(videoAberto===item.exercicio_id?null:item.exercicio_id)} onChange={(key,val)=>setItem(idx,key,val)} onSubstituir={()=>handleSubstituir(item.exercicio_id)} substituindo={substituirState.exId===item.exercicio_id&&substituirState.loading} />
              {substituirState.exId===item.exercicio_id&&substituirState.result&&(
                <div style={{ borderRadius:16, padding:16, background:'rgba(99,102,241,0.07)', border:'1px solid rgba(99,102,241,0.22)' }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
                    <p style={{ fontSize:12, fontWeight:800, color:'rgba(255,255,255,0.7)', letterSpacing:'-0.01em' }}>✨ Alternativas sugeridas pela IA</p>
                    <button onClick={()=>setSubstituirState({exId:null,loading:false,result:null})} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.35)', padding:4 }}>
                      <X style={{ width:13, height:13 }} />
                    </button>
                  </div>
                  {substituirState.result.itens?.map((alt,i)=>(
                    <div key={i} style={{ padding:'10px 12px', borderRadius:12, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', marginBottom:6 }}>
                      <p style={{ fontSize:13, fontWeight:700, color:'#F4F4F5', marginBottom:3, letterSpacing:'-0.01em' }}>{alt.exercicio_alternativo}</p>
                      <p style={{ fontSize:11, color:'rgba(255,255,255,0.38)' }}>{alt.motivo}</p>
                    </div>
                  ))}
                  {substituirState.result.observacoes&&<p style={{ fontSize:11, color:'rgba(255,255,255,0.3)', fontStyle:'italic', marginTop:4 }}>{substituirState.result.observacoes}</p>}
                </div>
              )}
            </div>
          ))}

          {pct===100&&(
            <div style={{ borderRadius:20, padding:20, textAlign:'center', background:'linear-gradient(135deg,rgba(5,150,105,0.12),rgba(16,185,129,0.07))', border:'1px solid rgba(16,185,129,0.25)', boxShadow:'0 0 30px rgba(16,185,129,0.08)' }}>
              <div style={{ fontSize:44, marginBottom:8 }}>🏆</div>
              <p style={{ fontFamily:'Inter,sans-serif', fontWeight:800, color:'#34d399', fontSize:17, letterSpacing:'-0.02em', marginBottom:4 }}>Todas as séries concluídas!</p>
              <p style={{ fontSize:12, color:'rgba(255,255,255,0.38)' }}>Finalize para registrar o progresso</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div style={{ flexShrink:0, padding:'12px 16px calc(12px + env(safe-area-inset-bottom))', background:'rgba(10,10,11,0.95)', borderTop:'1px solid rgba(255,255,255,0.05)', backdropFilter:'blur(16px)' }}>
        <div style={{ maxWidth:520, margin:'0 auto' }}>
          <button disabled={isPending} onClick={()=>mutate()}
            style={{ width:'100%', padding:'15px 24px', borderRadius:16, background:'linear-gradient(135deg,#ef4444,#dc2626)', border:'none', color:'white', fontSize:16, fontWeight:800, cursor:isPending?'wait':'pointer', fontFamily:'Inter,sans-serif', letterSpacing:'-0.02em', boxShadow:'0 6px 24px rgba(239,68,68,0.4), inset 0 1px 0 rgba(255,255,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center', gap:10, opacity:isPending?0.8:1, transition:'all 0.15s' }}>
            {isPending?(
              <>
                <span style={{ width:18, height:18, border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'white', borderRadius:'50%', display:'inline-block', animation:'spin 0.7s linear infinite' }} />
                Salvando...
              </>
            ):(
              <>
                <CheckCircle style={{ width:18, height:18 }} />
                Concluir treino
                {pct>0&&<span style={{ background:pct===100?'rgba(16,185,129,0.3)':'rgba(255,255,255,0.2)', borderRadius:999, padding:'3px 10px', fontSize:13, fontWeight:700 }}>{pct}%</span>}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── TREINO CARD ─── */
function TreinoCard({ treino, exercicioMap, onStart }) {
  const [expanded,setExpanded]=useState(false)
  const totalEx=treino.itens?.length||0
  const preview=(treino.itens||[]).slice(0,3)
  const totalSeries=(treino.itens||[]).reduce((s,i)=>s+(parseInt(i.series)||0),0)
  const totalVol=(treino.itens||[]).reduce((s,i)=>s+(parseInt(i.series)||0)*(parseFloat(i.carga)||0),0)

  return (
    <div style={{
      padding:20, borderRadius:20,
      background:'radial-gradient(ellipse at 95% 0%, rgba(99,102,241,0.1) 0%, transparent 55%), #111113',
      border:'1px solid rgba(99,102,241,0.18)',
      boxShadow:'inset 0 1px 0 rgba(255,255,255,0.05)',
    }}>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12, marginBottom:18 }}>
        <div style={{ flex:1, minWidth:0 }}>
          <h3 style={{ fontFamily:'Inter,sans-serif', fontWeight:900, color:'#F4F4F5', fontSize:19, letterSpacing:'-0.03em', lineHeight:1.2, marginBottom:8 }}>
            {treino.nome}
          </h3>
          <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
            {[
              { v:`${totalEx} exercício${totalEx!==1?'s':''}`, show:true },
              { v:`${totalSeries} séries`, show:totalSeries>0 },
              { v:`${totalVol.toFixed(0)}kg vol`, show:totalVol>0 },
            ].filter(x=>x.show).map(({ v },i)=>(
              <span key={i} style={{ fontSize:11, color:'rgba(255,255,255,0.38)', fontWeight:600, padding:'3px 10px', borderRadius:999, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.07)' }}>{v}</span>
            ))}
          </div>
        </div>
        <div style={{ width:46, height:46, borderRadius:14, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, background:'rgba(99,102,241,0.15)', border:'1px solid rgba(99,102,241,0.25)', boxShadow:'0 0 20px rgba(99,102,241,0.15)' }}>
          <Dumbbell style={{ width:21, height:21, color:'#f87171' }} />
        </div>
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:18 }}>
        {preview.map((item,idx)=>(
          <div key={idx} style={{ display:'flex', alignItems:'center', gap:10 }}>
            <span style={{ width:22, height:22, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:800, flexShrink:0, background:'rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.38)' }}>{idx+1}</span>
            <span style={{ fontSize:13, flex:1, minWidth:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', color:'rgba(255,255,255,0.7)', fontWeight:500 }}>
              {exercicioMap[item.exercicio_id]?.nome||`Exercício ${idx+1}`}
            </span>
            <span style={{ fontSize:11, fontWeight:700, flexShrink:0, color:'rgba(255,255,255,0.38)' }}>
              {item.series}×{item.repeticoes}{item.carga?` ${item.carga}kg`:''}
            </span>
          </div>
        ))}
        {totalEx>3&&(
          <button onClick={()=>setExpanded(!expanded)} style={{ display:'flex', alignItems:'center', gap:4, fontSize:11, fontWeight:800, color:'#f87171', background:'none', border:'none', cursor:'pointer', padding:'2px 0' }}>
            {expanded?<ChevronUp style={{ width:11, height:11 }} />:<ChevronDown style={{ width:11, height:11 }} />}
            {expanded?'Mostrar menos':`+${totalEx-3} exercícios`}
          </button>
        )}
        {expanded&&(treino.itens||[]).slice(3).map((item,idx)=>(
          <div key={idx+3} style={{ display:'flex', alignItems:'center', gap:10 }}>
            <span style={{ width:22, height:22, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:800, flexShrink:0, background:'rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.38)' }}>{idx+4}</span>
            <span style={{ fontSize:13, flex:1, minWidth:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', color:'rgba(255,255,255,0.7)', fontWeight:500 }}>
              {exercicioMap[item.exercicio_id]?.nome||`Exercício ${idx+4}`}
            </span>
            <span style={{ fontSize:11, fontWeight:700, flexShrink:0, color:'rgba(255,255,255,0.38)' }}>{item.series}×{item.repeticoes}</span>
          </div>
        ))}
      </div>

      <button onClick={()=>onStart(treino)}
        style={{ width:'100%', padding:'14px 24px', borderRadius:14, background:'linear-gradient(135deg,#ef4444,#dc2626)', border:'none', color:'white', fontSize:15, fontWeight:800, cursor:'pointer', fontFamily:'Inter,sans-serif', letterSpacing:'-0.02em', boxShadow:'0 5px 20px rgba(239,68,68,0.38), inset 0 1px 0 rgba(255,255,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center', gap:8, transition:'all 0.15s' }}
        onMouseEnter={e=>{ e.currentTarget.style.boxShadow='0 8px 28px rgba(239,68,68,0.55), inset 0 1px 0 rgba(255,255,255,0.18)'; e.currentTarget.style.transform='translateY(-1px)' }}
        onMouseLeave={e=>{ e.currentTarget.style.boxShadow='0 5px 20px rgba(239,68,68,0.38), inset 0 1px 0 rgba(255,255,255,0.15)'; e.currentTarget.style.transform='translateY(0)' }}>
        <Play style={{ width:16, height:16 }} />
        Iniciar treino
      </button>
    </div>
  )
}

/* ─── STREAK CARD ─── */
function StreakCard({ gami }) {
  if (!gami) return null
  const daysBar=Math.min(gami.streak_atual,7)
  return (
    <div style={{
      borderRadius:20, padding:'18px 20px', position:'relative', overflow:'hidden',
      background:'radial-gradient(ellipse at 10% -20%, rgba(249,115,22,0.55) 0%, transparent 55%), radial-gradient(ellipse at 90% 120%, rgba(239,68,68,0.35) 0%, transparent 50%), #1a0d08',
      border:'1px solid rgba(249,115,22,0.25)',
      boxShadow:'0 8px 32px rgba(239,68,68,0.18)',
    }}>
      {/* Ambient glow orb */}
      <div style={{ position:'absolute', top:-30, right:-30, width:120, height:120, borderRadius:'50%', background:'rgba(251,146,60,0.25)', filter:'blur(40px)', pointerEvents:'none' }} />

      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', position:'relative', zIndex:1 }}>
        <div>
          <p style={{ fontSize:10, color:'rgba(255,255,255,0.5)', fontWeight:700, marginBottom:4, textTransform:'uppercase', letterSpacing:'0.09em' }}>Sequência atual</p>
          <div style={{ display:'flex', alignItems:'flex-end', gap:8, lineHeight:1 }}>
            <span style={{ fontFamily:'Inter,sans-serif', fontSize:64, fontWeight:900, letterSpacing:'-0.05em', color:'white', textShadow:'0 0 60px rgba(251,146,60,0.7), 0 0 20px rgba(251,146,60,0.4)', lineHeight:1 }}>{gami.streak_atual}</span>
            <Flame style={{ width:34, height:34, marginBottom:8, color:'#fbbf24', filter:'drop-shadow(0 0 10px rgba(251,191,36,0.7))' }} />
          </div>
          <p style={{ fontSize:12, color:'rgba(255,255,255,0.45)', marginTop:2, fontWeight:500 }}>dias consecutivos</p>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:10, textAlign:'right', flexShrink:0 }}>
          <div style={{ padding:'8px 14px', borderRadius:12, background:'rgba(0,0,0,0.25)', backdropFilter:'blur(8px)' }}>
            <p style={{ fontSize:9, color:'rgba(255,255,255,0.45)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:1 }}>Recorde</p>
            <p style={{ fontFamily:'Inter,sans-serif', fontSize:18, fontWeight:900, color:'white', letterSpacing:'-0.03em' }}>🏆 {gami.streak_recorde}</p>
          </div>
          <div style={{ padding:'8px 14px', borderRadius:12, background:'rgba(0,0,0,0.25)', backdropFilter:'blur(8px)' }}>
            <p style={{ fontSize:9, color:'rgba(255,255,255,0.45)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:1 }}>Treinos</p>
            <p style={{ fontFamily:'Inter,sans-serif', fontSize:18, fontWeight:900, color:'white', letterSpacing:'-0.03em' }}>💪 {gami.total_treinos}</p>
          </div>
        </div>
      </div>

      {gami.streak_atual>0&&(
        <div style={{ marginTop:14, paddingTop:12, borderTop:'1px solid rgba(255,255,255,0.1)', position:'relative', zIndex:1 }}>
          <div style={{ display:'flex', gap:4, marginBottom:6 }}>
            {Array.from({length:7}).map((_,i)=>(
              <div key={i} style={{
                flex:1, height:4, borderRadius:4,
                background:i<daysBar?'rgba(255,255,255,0.75)':'rgba(255,255,255,0.12)',
                boxShadow:i<daysBar?'0 0 8px rgba(255,255,255,0.3)':undefined,
                transition:'all 0.3s',
              }} />
            ))}
          </div>
          <p style={{ fontSize:11, color:'rgba(255,255,255,0.45)', fontWeight:500 }}>
            {gami.streak_atual>=7?'7+ dias seguidos! Você é imparável! 🎉':`${7-daysBar} dia${7-daysBar!==1?'s':''} para completar a semana`}
          </p>
        </div>
      )}
    </div>
  )
}

/* ─── MAIN PAGE ─── */
export default function TreinoHoje() {
  const { user, alunoId }=useAuth()
  const [treinoAtivo,setTreinoAtivo]=useState(null)
  const { data:treinosHoje=[],isLoading }=useQuery({ queryKey:['treino-do-dia',alunoId], queryFn:()=>treinoDodia(alunoId).then(r=>r.data), enabled:!!alunoId })
  const { data:gami }=useQuery({ queryKey:['gamificacao',alunoId], queryFn:()=>gamificacaoAluno(alunoId).then(r=>r.data), enabled:!!alunoId })
  const { data:exercicios=[] }=useQuery({ queryKey:['exercicios'], queryFn:()=>listarExercicios().then(r=>r.data) })
  const exercicioMap=Object.fromEntries(exercicios.map(e=>[e.id,e]))
  const hora=new Date().getHours()
  const saudacao=hora<12?'Bom dia':hora<18?'Boa tarde':'Boa noite'
  const DIAS=['Domingo','Segunda','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado']
  const hojeLabel=DIAS[new Date().getDay()]

  if (isLoading) return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        <div className="skeleton" style={{ width:200, height:30, borderRadius:10 }} />
        <div className="skeleton" style={{ width:140, height:22, borderRadius:999 }} />
      </div>
      <div className="skeleton" style={{ height:160, borderRadius:20 }} />
      <div className="skeleton" style={{ height:260, borderRadius:20 }} />
      <div className="skeleton" style={{ height:200, borderRadius:20 }} />
    </div>
  )

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      {/* Greeting */}
      <div style={{ marginBottom:4 }}>
        <h1 style={{ fontFamily:'Inter,sans-serif', fontSize:24, fontWeight:900, color:'#F4F4F5', letterSpacing:'-0.04em', lineHeight:1.1, marginBottom:4 }}>
          {saudacao},{' '}
          <span style={{ color:'#f87171', textShadow:'0 0 30px rgba(248,113,113,0.4)' }}>
            {user?.nome?.split(' ')[0]}
          </span>
        </h1>
        <div style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'4px 12px', borderRadius:999, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ width:6, height:6, borderRadius:'50%', background:'#10b981', boxShadow:'0 0 8px rgba(16,185,129,0.7)' }} />
          <span style={{ fontSize:11, color:'rgba(255,255,255,0.5)', fontWeight:700, letterSpacing:'0.01em' }}>Treinos de {hojeLabel}</span>
        </div>
      </div>

      <StreakCard gami={gami} />

      {treinosHoje.length===0?(
        <div style={{ padding:32, borderRadius:20, background:'#111113', border:'1px solid rgba(255,255,255,0.07)', textAlign:'center', boxShadow:'inset 0 1px 0 rgba(255,255,255,0.04)' }}>
          <div style={{ fontSize:56, marginBottom:16 }}>😴</div>
          <p style={{ fontFamily:'Inter,sans-serif', fontWeight:900, color:'#F4F4F5', fontSize:19, letterSpacing:'-0.03em', marginBottom:6 }}>Dia de descanso!</p>
          <p style={{ fontSize:13, color:'rgba(255,255,255,0.4)', marginBottom:24, lineHeight:1.5 }}>Não há treinos para hoje.<br/>Aproveite para recuperar.</p>
          <div style={{ display:'flex', justifyContent:'center', gap:24 }}>
            {[{ icon:'💧', label:'Hidratação' },{ icon:'🥗', label:'Nutrição' },{ icon:'😴', label:'Descanso' }].map(({ icon,label })=>(
              <div key={label} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
                <div style={{ fontSize:32 }}>{icon}</div>
                <span style={{ fontSize:11, color:'rgba(255,255,255,0.38)', fontWeight:700 }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      ):(
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <p style={{ fontSize:11, fontWeight:800, color:'rgba(255,255,255,0.38)', textTransform:'uppercase', letterSpacing:'0.09em' }}>
              {treinosHoje.length} treino{treinosHoje.length!==1?'s':''} hoje
            </p>
            {gami?.total_treinos>0&&(
              <span style={{ fontSize:11, color:'#f87171', fontWeight:700, padding:'3px 10px', borderRadius:999, background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.18)' }}>
                {gami.total_treinos} totais
              </span>
            )}
          </div>
          {treinosHoje.map(t=><TreinoCard key={t.id} treino={t} exercicioMap={exercicioMap} onStart={setTreinoAtivo} />)}
        </div>
      )}

      {treinoAtivo&&<ModalExecutar treino={treinoAtivo} exercicioMap={exercicioMap} alunoId={alunoId} onClose={()=>setTreinoAtivo(null)} />}
    </div>
  )
}
