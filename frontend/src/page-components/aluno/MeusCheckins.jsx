import { useQuery } from '@tanstack/react-query'
import { meusCheckins } from '../../api'
import { CheckCircle, Calendar, Flame } from 'lucide-react'

const BRT_OFFSET = -3 * 60

function toBRT(isoStr) {
  const d = new Date(isoStr)
  d.setMinutes(d.getMinutes() + d.getTimezoneOffset() + BRT_OFFSET)
  return d
}

const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
const DIAS_SEMANA = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']

function CalendarioMes({ ano, mes, checkinDias }) {
  const primeiroDia = new Date(ano, mes, 1).getDay()
  const diasNoMes = new Date(ano, mes+1, 0).getDate()
  const hoje = new Date()
  const cells = []
  for (let i=0; i<primeiroDia; i++) cells.push(null)
  for (let d=1; d<=diasNoMes; d++) cells.push(d)
  while (cells.length%7!==0) cells.push(null)

  return (
    <div>
      <p style={{ fontSize:12, fontWeight:800, color:'rgba(255,255,255,0.5)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:12, fontFamily:'Inter,sans-serif' }}>
        {MESES[mes]} {ano}
      </p>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:4 }}>
        {DIAS_SEMANA.map(d=>(
          <div key={d} style={{ textAlign:'center', fontSize:10, color:'rgba(255,255,255,0.25)', fontWeight:700, paddingBottom:6 }}>{d}</div>
        ))}
        {cells.map((dia,i)=>{
          if (!dia) return <div key={`e${i}`} />
          const key = `${ano}-${String(mes+1).padStart(2,'0')}-${String(dia).padStart(2,'0')}`
          const isCheckin = checkinDias.has(key)
          const isHoje = hoje.getFullYear()===ano && hoje.getMonth()===mes && hoje.getDate()===dia
          return (
            <div key={dia} style={{
              aspectRatio:'1', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:11, fontWeight:isCheckin?800:400,
              background: isCheckin ? 'linear-gradient(145deg,#ef4444,#c42121)' : isHoje ? 'rgba(255,255,255,0.07)' : 'transparent',
              color: isCheckin ? 'white' : isHoje ? '#F4F4F5' : 'rgba(255,255,255,0.4)',
              border: isHoje&&!isCheckin ? '1px solid rgba(255,255,255,0.15)' : 'none',
              boxShadow: isCheckin ? '0 2px 10px rgba(239,68,68,0.45)' : 'none',
              transition:'all 0.15s',
            }}>
              {dia}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function MeusCheckins() {
  const { data:checkins=[], isLoading, isError } = useQuery({
    queryKey:['meus-checkins'],
    queryFn:()=>meusCheckins().then(r=>r.data),
    staleTime:60_000,
  })

  if (isLoading) return (
    <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        <div className="skeleton" style={{ width:180, height:28, borderRadius:10 }} />
        <div className="skeleton" style={{ width:240, height:14, borderRadius:8 }} />
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        <div className="skeleton" style={{ height:110, borderRadius:18 }} />
        <div className="skeleton" style={{ height:110, borderRadius:18 }} />
      </div>
      <div className="skeleton" style={{ height:260, borderRadius:20 }} />
    </div>
  )

  if (isError) return (
    <div style={{ textAlign:'center', padding:'80px 24px' }}>
      <p style={{ fontSize:15, fontWeight:800, color:'#F4F4F5', marginBottom:8 }}>Não foi possível carregar</p>
      <p style={{ fontSize:13, color:'rgba(255,255,255,0.38)' }}>Verifique sua conexão e tente novamente.</p>
    </div>
  )

  const checkinDias = new Set(checkins.map(c=>{
    const d=toBRT(c.data)
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
  }))

  const hoje = new Date()
  const totalMes = [...checkinDias].filter(ds=>{
    const [y,m]=ds.split('-').map(Number)
    return y===hoje.getFullYear()&&m===hoje.getMonth()+1
  }).length

  let streak = 0
  const cursor = new Date(hoje)
  while (true) {
    const key=`${cursor.getFullYear()}-${String(cursor.getMonth()+1).padStart(2,'0')}-${String(cursor.getDate()).padStart(2,'0')}`
    if (!checkinDias.has(key)) break
    streak++
    cursor.setDate(cursor.getDate()-1)
  }

  const mesesMostrar = []
  for (let i=1; i>=0; i--) {
    const d = new Date(hoje.getFullYear(), hoje.getMonth()-i, 1)
    mesesMostrar.push({ ano:d.getFullYear(), mes:d.getMonth() })
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
      {/* Header */}
      <div>
        <h1 style={{ fontFamily:'Inter,sans-serif', fontSize:26, fontWeight:900, color:'#F4F4F5', letterSpacing:'-0.04em', lineHeight:1.1, marginBottom:4 }}>
          Minha Presença
        </h1>
        <p style={{ fontSize:12, color:'rgba(255,255,255,0.38)', fontWeight:500 }}>Histórico de check-ins na academia</p>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        <div style={{
          borderRadius:18, padding:'18px', position:'relative', overflow:'hidden',
          background: streak>0 ? 'radial-gradient(ellipse at 10% -20%, rgba(249,115,22,0.2) 0%, transparent 55%), #111113' : '#111113',
          border:`1px solid ${streak>0?'rgba(249,115,22,0.25)':'rgba(255,255,255,0.07)'}`,
          boxShadow: streak>0 ? '0 0 24px rgba(249,115,22,0.08)' : 'none',
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:10 }}>
            <Flame style={{ width:15, height:15, color:'#f97316' }} />
            <span style={{ fontSize:10, color:'rgba(255,255,255,0.38)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em' }}>Sequência</span>
          </div>
          <p style={{ fontFamily:'Inter,sans-serif', fontSize:42, fontWeight:900, color:streak>0?'#f97316':'rgba(255,255,255,0.3)', letterSpacing:'-0.04em', lineHeight:1, textShadow:streak>0?'0 0 30px rgba(249,115,22,0.6)':undefined }}>
            {streak}
          </p>
          <p style={{ fontSize:11, color:'rgba(255,255,255,0.35)', marginTop:4 }}>dias consecutivos</p>
        </div>
        <div style={{
          borderRadius:18, padding:'18px',
          background:'radial-gradient(ellipse at 90% -20%, rgba(56,189,248,0.12) 0%, transparent 55%), #111113',
          border:'1px solid rgba(56,189,248,0.18)',
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:10 }}>
            <Calendar style={{ width:15, height:15, color:'#38bdf8' }} />
            <span style={{ fontSize:10, color:'rgba(255,255,255,0.38)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em' }}>Este mês</span>
          </div>
          <p style={{ fontFamily:'Inter,sans-serif', fontSize:42, fontWeight:900, color:'#38bdf8', letterSpacing:'-0.04em', lineHeight:1, textShadow:'0 0 30px rgba(56,189,248,0.5)' }}>
            {totalMes}
          </p>
          <p style={{ fontSize:11, color:'rgba(255,255,255,0.35)', marginTop:4 }}>visitas à academia</p>
        </div>
      </div>

      {/* Calendários */}
      <div style={{ borderRadius:20, padding:20, background:'#111113', border:'1px solid rgba(255,255,255,0.07)', boxShadow:'inset 0 1px 0 rgba(255,255,255,0.04)' }}>
        <div style={{ display:'flex', flexDirection:'column', gap:28 }}>
          {mesesMostrar.map(({ ano,mes })=>(
            <CalendarioMes key={`${ano}-${mes}`} ano={ano} mes={mes} checkinDias={checkinDias} />
          ))}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginTop:20, paddingTop:16, borderTop:'1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ width:18, height:18, borderRadius:5, background:'linear-gradient(145deg,#ef4444,#c42121)', boxShadow:'0 2px 8px rgba(239,68,68,0.4)' }} />
          <span style={{ fontSize:11, color:'rgba(255,255,255,0.38)' }}>Check-in realizado</span>
        </div>
      </div>

      {/* Lista recente */}
      {checkins.length===0?(
        <div style={{ textAlign:'center', padding:'40px 24px', borderRadius:20, background:'#111113', border:'1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ fontSize:44, marginBottom:16 }}>🏋️</div>
          <p style={{ fontSize:16, fontWeight:800, color:'#F4F4F5', letterSpacing:'-0.02em', marginBottom:6 }}>Nenhum check-in ainda</p>
          <p style={{ fontSize:13, color:'rgba(255,255,255,0.38)', lineHeight:1.5 }}>Escaneie o QR code na academia<br/>para registrar sua presença.</p>
        </div>
      ):(
        <div style={{ borderRadius:20, background:'#111113', border:'1px solid rgba(255,255,255,0.07)', overflow:'hidden', boxShadow:'inset 0 1px 0 rgba(255,255,255,0.04)' }}>
          <div style={{ padding:'14px 20px', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
            <p style={{ fontSize:13, fontWeight:800, color:'rgba(255,255,255,0.6)', letterSpacing:'-0.01em' }}>Últimas visitas</p>
          </div>
          {checkins.slice(0,10).map((c,i)=>{
            const d=toBRT(c.data)
            return (
              <div key={c.id} style={{
                display:'flex', alignItems:'center', gap:14, padding:'12px 20px',
                borderBottom: i<Math.min(checkins.length,10)-1?'1px solid rgba(255,255,255,0.04)':'none',
                transition:'background 0.12s',
              }}>
                <div style={{ width:36, height:36, borderRadius:11, background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.18)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <CheckCircle style={{ width:15, height:15, color:'#f87171' }} />
                </div>
                <div style={{ flex:1 }}>
                  <p style={{ fontSize:14, fontWeight:700, color:'#F4F4F5', letterSpacing:'-0.01em' }}>
                    {DIAS_SEMANA[d.getDay()]}, {d.getDate()} de {MESES[d.getMonth()]}
                  </p>
                  <p style={{ fontSize:11, color:'rgba(255,255,255,0.35)', marginTop:2 }}>
                    {String(d.getHours()).padStart(2,'0')}:{String(d.getMinutes()).padStart(2,'0')}
                  </p>
                </div>
                <CheckCircle style={{ width:16, height:16, color:'#10b981', filter:'drop-shadow(0 0 6px rgba(16,185,129,0.5))' }} />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
