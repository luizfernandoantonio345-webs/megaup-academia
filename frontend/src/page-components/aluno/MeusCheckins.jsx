import { useQuery } from '@tanstack/react-query'
import { meusCheckins } from '../../api'
import { CheckCircle, Calendar, Flame } from 'lucide-react'

const BRT_OFFSET = -3 * 60

function toBRT(isoStr) {
  const d = new Date(isoStr)
  d.setMinutes(d.getMinutes() + d.getTimezoneOffset() + BRT_OFFSET)
  return d
}

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
}

const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
const DIAS_SEMANA = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']

function CalendarioMes({ ano, mes, checkinDias }) {
  const primeiroDia = new Date(ano, mes, 1).getDay()
  const diasNoMes = new Date(ano, mes + 1, 0).getDate()
  const hoje = new Date()

  const cells = []
  for (let i = 0; i < primeiroDia; i++) cells.push(null)
  for (let d = 1; d <= diasNoMes; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)

  return (
    <div>
      <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
        {MESES[mes]} {ano}
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 3 }}>
        {DIAS_SEMANA.map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: 10, color: 'var(--text-disabled)', fontWeight: 600, paddingBottom: 4 }}>{d}</div>
        ))}
        {cells.map((dia, i) => {
          if (!dia) return <div key={`e${i}`} />
          const isCheckin = checkinDias.has(`${ano}-${String(mes + 1).padStart(2,'0')}-${String(dia).padStart(2,'0')}`)
          const isHoje = hoje.getFullYear() === ano && hoje.getMonth() === mes && hoje.getDate() === dia
          return (
            <div key={dia} style={{
              aspectRatio: '1',
              borderRadius: 6,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: isCheckin ? 700 : 400,
              background: isCheckin ? '#ef4444' : isHoje ? 'rgba(255,255,255,0.06)' : 'transparent',
              color: isCheckin ? 'white' : isHoje ? 'var(--text-primary)' : 'var(--text-muted)',
              border: isHoje && !isCheckin ? '1px solid rgba(255,255,255,0.12)' : 'none',
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
  const { data: checkins = [], isLoading, isError } = useQuery({
    queryKey: ['meus-checkins'],
    queryFn: () => meusCheckins().then(r => r.data),
    staleTime: 60_000,
  })

  if (isLoading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', gap: 12 }}>
      <div style={{ width: 52, height: 52, borderRadius: 18, background: 'rgba(239,68,68,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Calendar style={{ width: 22, height: 22, color: '#f87171' }} />
      </div>
      <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Carregando presença...</p>
    </div>
  )

  if (isError) return (
    <div style={{ textAlign: 'center', padding: '80px 24px' }}>
      <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>Não foi possível carregar</p>
      <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Verifique sua conexão e tente novamente.</p>
    </div>
  )

  // Agrupa check-ins por dia (BRT) para o calendário
  const checkinDias = new Set(
    checkins.map(c => {
      const d = toBRT(c.data)
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
    })
  )

  // Calcula streak atual e total do mês
  const hoje = new Date()
  const totalMes = [...checkinDias].filter(ds => {
    const [y, m] = ds.split('-').map(Number)
    return y === hoje.getFullYear() && m === hoje.getMonth() + 1
  }).length

  // Streak: dias consecutivos até hoje
  let streak = 0
  const cursor = new Date(hoje)
  while (true) {
    const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2,'0')}-${String(cursor.getDate()).padStart(2,'0')}`
    if (!checkinDias.has(key)) break
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }

  // Meses distintos nos últimos 2 meses
  const mesesMostrar = []
  for (let i = 1; i >= 0; i--) {
    const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1)
    mesesMostrar.push({ ano: d.getFullYear(), mes: d.getMonth() })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 14, background: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CheckCircle style={{ width: 18, height: 18, color: 'white' }} />
        </div>
        <div>
          <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: 22, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1 }}>
            Minha Presença
          </h1>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>Histórico de check-ins na academia</p>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '16px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <Flame style={{ width: 16, height: 16, color: '#f87171' }} />
            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Sequência</span>
          </div>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 28, fontWeight: 700, color: streak > 0 ? '#f87171' : 'var(--text-secondary)', letterSpacing: '-0.03em', lineHeight: 1 }}>
            {streak}
          </p>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>dias consecutivos</p>
        </div>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '16px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <Calendar style={{ width: 16, height: 16, color: '#60a5fa' }} />
            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Este mês</span>
          </div>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 28, fontWeight: 700, color: '#60a5fa', letterSpacing: '-0.03em', lineHeight: 1 }}>
            {totalMes}
          </p>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>visitas à academia</p>
        </div>
      </div>

      {/* Calendário dos últimos 2 meses */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, padding: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {mesesMostrar.map(({ ano, mes }) => (
            <CalendarioMes key={`${ano}-${mes}`} ano={ano} mes={mes} checkinDias={checkinDias} />
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ width: 14, height: 14, borderRadius: 3, background: '#ef4444' }} />
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Check-in realizado</span>
        </div>
      </div>

      {/* Lista recente */}
      {checkins.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 24px' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🏋️</div>
          <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>Nenhum check-in ainda</p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Escaneie o QR code na academia para registrar sua presença.</p>
        </div>
      ) : (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Últimas visitas</p>
          </div>
          {checkins.slice(0, 10).map((c, i) => {
            const d = toBRT(c.data)
            return (
              <div key={c.id} style={{
                display: 'flex', alignItems: 'center', gap: 14, padding: '12px 20px',
                borderBottom: i < Math.min(checkins.length, 10) - 1 ? '1px solid var(--border-subtle)' : 'none',
              }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <CheckCircle style={{ width: 15, height: 15, color: '#f87171' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                    {DIAS_SEMANA[d.getDay()]}, {d.getDate()} de {MESES[d.getMonth()]}
                  </p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {String(d.getHours()).padStart(2,'0')}:{String(d.getMinutes()).padStart(2,'0')}
                  </p>
                </div>
                <CheckCircle style={{ width: 14, height: 14, color: '#34d399' }} />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
