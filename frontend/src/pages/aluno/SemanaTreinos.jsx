import { useState, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../../contexts/AuthContext'
import { listarTreinos, listarExercicios } from '../../api'
import { Calendar, Moon, Dumbbell, ChevronDown, ChevronUp, Target, Clock, Zap } from 'lucide-react'

const JS_TO_DIA = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado']
const DIAS_ORDEM = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo']

const DIAS_INFO = {
  segunda: { curto: 'Seg', full: 'Segunda-feira' },
  terca:   { curto: 'Ter', full: 'Terça-feira'   },
  quarta:  { curto: 'Qua', full: 'Quarta-feira'  },
  quinta:  { curto: 'Qui', full: 'Quinta-feira'  },
  sexta:   { curto: 'Sex', full: 'Sexta-feira'   },
  sabado:  { curto: 'Sáb', full: 'Sábado'        },
  domingo: { curto: 'Dom', full: 'Domingo'        },
}

function getTema(nome = '') {
  const n = nome.toLowerCase()
  if (n.includes('glut') || n.includes('posterior'))
    return { color: '#f43f5e', bg: 'rgba(244,63,94,0.1)', border: 'rgba(244,63,94,0.3)', glow: 'rgba(244,63,94,0.22)' }
  if (n.includes('costas') || n.includes('biceps') || n.includes('bíceps'))
    return { color: '#38bdf8', bg: 'rgba(56,189,248,0.1)', border: 'rgba(56,189,248,0.3)', glow: 'rgba(56,189,248,0.22)' }
  if (n.includes('perna') || n.includes('quad') || n.includes('panturrilha'))
    return { color: '#34d399', bg: 'rgba(52,211,153,0.1)', border: 'rgba(52,211,153,0.3)', glow: 'rgba(52,211,153,0.22)' }
  if (n.includes('ombro') || n.includes('trapez'))
    return { color: '#fb923c', bg: 'rgba(251,146,60,0.1)', border: 'rgba(251,146,60,0.3)', glow: 'rgba(251,146,60,0.22)' }
  if (n.includes('peito') || n.includes('triceps') || n.includes('tríceps'))
    return { color: '#c084fc', bg: 'rgba(192,132,252,0.1)', border: 'rgba(192,132,252,0.3)', glow: 'rgba(192,132,252,0.22)' }
  if (n.includes('core') || n.includes('abdom'))
    return { color: '#fbbf24', bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.3)', glow: 'rgba(251,191,36,0.22)' }
  return { color: '#818cf8', bg: 'rgba(129,140,248,0.1)', border: 'rgba(129,140,248,0.3)', glow: 'rgba(129,140,248,0.22)' }
}

function DayPill({ dia, isHoje, isAtivo, treinosDia, onClick }) {
  const tema = treinosDia.length > 0 ? getTema(treinosDia[0].nome) : null
  const { curto } = DIAS_INFO[dia]

  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7,
        padding: '12px 16px', minWidth: 58,
        borderRadius: 20, flexShrink: 0,
        border: `1px solid ${isAtivo ? (tema?.border || 'rgba(99,102,241,0.5)') : isHoje ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.06)'}`,
        background: isAtivo ? (tema?.bg || 'rgba(99,102,241,0.12)') : isHoje ? 'rgba(99,102,241,0.06)' : 'rgba(255,255,255,0.02)',
        boxShadow: isAtivo ? `0 0 22px ${tema?.glow || 'rgba(99,102,241,0.3)'}` : 'none',
        cursor: 'pointer', transition: 'all 0.22s ease',
        position: 'relative',
      }}
    >
      {isHoje && (
        <div style={{
          position: 'absolute', top: -1, left: '50%', transform: 'translateX(-50%)',
          width: 24, height: 2, borderRadius: 2,
          background: isAtivo
            ? `linear-gradient(90deg, transparent, ${tema?.color || '#a78bfa'}, transparent)`
            : 'linear-gradient(90deg, transparent, #6366f1, transparent)',
        }} />
      )}
      <span style={{
        fontSize: 10, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase',
        color: isAtivo ? (tema?.color || '#a5b4fc') : isHoje ? '#818cf8' : '#2D3F5A',
        fontFamily: 'Inter, sans-serif', transition: 'color 0.2s',
      }}>{curto}</span>
      <div style={{
        width: 7, height: 7, borderRadius: '50%',
        background: tema
          ? isAtivo ? tema.color : `${tema.color}66`
          : isHoje ? '#6366f1' : 'rgba(255,255,255,0.08)',
        boxShadow: isAtivo && tema ? `0 0 8px ${tema.glow}` : 'none',
        transition: 'all 0.2s',
      }} />
    </button>
  )
}

function ExRow({ item, idx, exMap }) {
  const ex = exMap[item.exercicio_id]
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0',
      borderBottom: '1px solid rgba(255,255,255,0.04)',
    }}>
      <div style={{
        width: 28, height: 28, borderRadius: 9, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(255,255,255,0.05)',
        fontSize: 11, fontWeight: 600, color: '#71717A',
        fontFamily: 'Inter, sans-serif',
      }}>{idx + 1}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, color: '#F4F4F5', fontWeight: 600, lineHeight: 1.3 }}>
          {ex?.nome || `Exercício ${idx + 1}`}
        </p>
        {ex?.grupo_muscular && (
          <p style={{ fontSize: 10, color: '#2D3F5A', marginTop: 2, textTransform: 'capitalize' }}>
            {ex.grupo_muscular}
          </p>
        )}
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: '#818cf8', fontFamily: 'Inter, sans-serif' }}>
          {item.series}×{item.repeticoes}
        </p>
        {item.carga && (
          <p style={{ fontSize: 11, color: '#71717A' }}>{item.carga}kg</p>
        )}
      </div>
    </div>
  )
}

function TreinoWeekCard({ treino, exMap }) {
  const [aberto, setAberto] = useState(false)
  const tema = getTema(treino.nome)
  const itens = (treino.itens || []).sort((a, b) => a.ordem - b.ordem)
  const totalEx = itens.length
  const totalSeries = itens.reduce((s, i) => s + (parseInt(i.series) || 0), 0)
  const tempoEst = Math.max(20, Math.round(totalSeries * 1.8))

  return (
    <div style={{
      borderRadius: 22, overflow: 'hidden',
      background: tema.bg,
      border: `1px solid ${tema.border}`,
      boxShadow: `0 4px 28px ${tema.glow}`,
    }}>
      {/* Color accent line */}
      <div style={{ height: 2, background: `linear-gradient(90deg, transparent, ${tema.color}, transparent)` }} />

      {/* Header */}
      <div style={{ padding: '16px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 13 }}>
          <div style={{
            width: 46, height: 46, borderRadius: 15, flexShrink: 0,
            background: `${tema.color}1a`, border: `1.5px solid ${tema.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 0 18px ${tema.glow}`,
          }}>
            <Dumbbell style={{ width: 20, height: 20, color: tema.color }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{
              fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600,
              color: '#F4F4F5', lineHeight: 1.25, letterSpacing: '-0.01em',
            }}>{treino.nome}</h3>
            <div style={{ display: 'flex', gap: 14, marginTop: 6, flexWrap: 'wrap' }}>
              {[
                `${totalEx} exerc.`,
                `${totalSeries} séries`,
                `~${tempoEst}min`,
              ].map(l => (
                <span key={l} style={{ fontSize: 11, color: `${tema.color}bb`, fontWeight: 600 }}>{l}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Toggle exercises */}
      <button
        onClick={() => setAberto(!aberto)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 18px', background: 'rgba(0,0,0,0.25)', border: 'none',
          borderTop: `1px solid ${tema.border}50`, cursor: 'pointer',
        }}
      >
        <span style={{ fontSize: 12, color: tema.color, fontWeight: 700 }}>
          {aberto ? 'Ocultar exercícios' : `Ver ${totalEx} exercícios`}
        </span>
        {aberto
          ? <ChevronUp style={{ width: 14, height: 14, color: tema.color }} />
          : <ChevronDown style={{ width: 14, height: 14, color: tema.color }} />
        }
      </button>

      {aberto && (
        <div style={{ padding: '4px 18px 16px', borderTop: `1px solid ${tema.border}20` }}>
          {itens.map((item, idx) => (
            <ExRow key={item.id ?? idx} item={item} idx={idx} exMap={exMap} />
          ))}
        </div>
      )}
    </div>
  )
}

/* ─── MAIN ─── */
export default function SemanaTreinos() {
  const diaAtual = JS_TO_DIA[new Date().getDay()]
  const [diaAtivo, setDiaAtivo] = useState(diaAtual)
  const { alunoId } = useAuth()

  const { data: treinos = [], isLoading } = useQuery({
    queryKey: ['todos-treinos', alunoId],
    queryFn: () => listarTreinos(alunoId).then(r => r.data),
    enabled: !!alunoId,
    staleTime: 60_000,
  })
  const { data: exercicios = [] } = useQuery({
    queryKey: ['exercicios'],
    queryFn: () => listarExercicios().then(r => r.data),
  })

  const exMap = Object.fromEntries(exercicios.map(e => [e.id, e]))

  const porDia = {}
  treinos.forEach(t => {
    if (t.dia_semana) {
      if (!porDia[t.dia_semana]) porDia[t.dia_semana] = []
      porDia[t.dia_semana].push(t)
    }
  })

  const diasComTreino = DIAS_ORDEM.filter(d => (porDia[d] || []).length > 0).length
  const totalExercicios = treinos.reduce((s, t) => s + (t.itens?.length || 0), 0)
  const treinosDia = porDia[diaAtivo] || []

  if (isLoading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', gap: 12 }}>
      <div style={{ width: 52, height: 52, borderRadius: 18, background: 'rgba(99,102,241,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Calendar style={{ width: 22, height: 22, color: '#818cf8' }} />
      </div>
      <p style={{ fontSize: 13, color: '#71717A' }}>Carregando semana...</p>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

      {/* ── Header ── */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 13,
            background: '#6366f1',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 18px rgba(99,102,241,0.45)',
          }}>
            <Calendar style={{ width: 17, height: 17, color: 'white' }} />
          </div>
          <h1 style={{
            fontFamily: 'Inter, sans-serif', fontSize: 22, fontWeight: 600,
            color: '#F4F4F5', letterSpacing: '-0.02em',
          }}>Minha Semana</h1>
        </div>
        <p style={{ fontSize: 13, color: '#71717A', marginLeft: 46 }}>
          {diasComTreino > 0
            ? `${diasComTreino} dia${diasComTreino !== 1 ? 's' : ''} de treino · ${7 - diasComTreino} descanso`
            : 'Nenhum treino programado ainda'}
        </p>
      </div>

      {/* ── Stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        {[
          { label: 'Treinos', value: diasComTreino, Icon: Dumbbell, color: '#818cf8', glow: 'rgba(129,140,248,0.2)' },
          { label: 'Descanso', value: 7 - diasComTreino, Icon: Moon, color: '#38bdf8', glow: 'rgba(56,189,248,0.2)' },
          { label: 'Exercícios', value: totalExercicios, Icon: Target, color: '#34d399', glow: 'rgba(52,211,153,0.2)' },
        ].map(({ label, value, Icon, color, glow }) => (
          <div key={label} style={{
            borderRadius: 18, padding: '14px',
            background: `${color}0c`, border: `1px solid ${color}22`,
            boxShadow: `0 2px 16px ${glow}`,
            display: 'flex', flexDirection: 'column', gap: 6,
          }}>
            <Icon style={{ width: 15, height: 15, color }} />
            <span style={{
              fontFamily: 'Inter, sans-serif', fontSize: 26, fontWeight: 600,
              color, lineHeight: 1, letterSpacing: '-0.02em',
            }}>{value}</span>
            <span style={{
              fontSize: 10, color: '#71717A', fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.05em',
            }}>{label}</span>
          </div>
        ))}
      </div>

      {/* ── Week visual strip ── */}
      <div style={{
        borderRadius: 18, padding: '14px 16px',
        background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
      }}>
        <p style={{ fontSize: 10, color: '#2D3F5A', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>
          Visão geral
        </p>
        <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end' }}>
          {DIAS_ORDEM.map(dia => {
            const qt = (porDia[dia] || []).length
            const tema = qt > 0 ? getTema((porDia[dia][0] || {}).nome) : null
            const isHoje = dia === diaAtual
            const isAtivo = dia === diaAtivo
            return (
              <button
                key={dia}
                onClick={() => setDiaAtivo(dia)}
                style={{
                  flex: 1, height: qt > 0 ? 38 : 18, borderRadius: 6,
                  background: isAtivo
                    ? (tema?.color || '#6366f1')
                    : qt > 0
                      ? `${tema?.color || '#6366f1'}40`
                      : 'rgba(255,255,255,0.05)',
                  border: isHoje ? `1.5px solid ${tema?.color || '#6366f1'}` : 'none',
                  boxShadow: isAtivo ? `0 0 12px ${tema?.glow || 'rgba(99,102,241,0.4)'}` : 'none',
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
                title={DIAS_INFO[dia].full}
              />
            )
          })}
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
          {DIAS_ORDEM.map(dia => (
            <div key={dia} style={{ flex: 1, textAlign: 'center' }}>
              <span style={{
                fontSize: 9, color: dia === diaAtual ? '#818cf8' : '#52525B',
                fontWeight: 700, textTransform: 'uppercase',
              }}>
                {DIAS_INFO[dia].curto.slice(0, 1)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Day selector horizontal pills ── */}
      <div style={{
        display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, paddingTop: 2,
        scrollbarWidth: 'none', msOverflowStyle: 'none',
      }}>
        {DIAS_ORDEM.map(dia => (
          <DayPill
            key={dia}
            dia={dia}
            isHoje={dia === diaAtual}
            isAtivo={dia === diaAtivo}
            treinosDia={porDia[dia] || []}
            onClick={() => setDiaAtivo(dia)}
          />
        ))}
      </div>

      {/* ── Day content ── */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <h2 style={{
            fontFamily: 'Inter, sans-serif', fontSize: 18, fontWeight: 600,
            color: '#F4F4F5', letterSpacing: '-0.01em',
          }}>{DIAS_INFO[diaAtivo].full}</h2>
          {diaAtivo === diaAtual && (
            <span style={{
              fontSize: 10, fontWeight: 600, color: '#818cf8',
              background: 'rgba(99,102,241,0.15)', padding: '2px 9px',
              borderRadius: 999, textTransform: 'uppercase', letterSpacing: '0.06em',
              border: '1px solid rgba(99,102,241,0.25)',
            }}>Hoje</span>
          )}
        </div>

        {treinosDia.length === 0 ? (
          <div style={{
            borderRadius: 22, padding: '36px 24px', textAlign: 'center',
            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>😴</div>
            <p style={{
              fontFamily: 'Inter, sans-serif', fontWeight: 600,
              color: '#F4F4F5', fontSize: 17,
            }}>Dia de descanso</p>
            <p style={{ fontSize: 12, color: '#71717A', marginTop: 6 }}>
              Recuperação muscular é parte do treino
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {treinosDia.map(t => (
              <TreinoWeekCard key={t.id} treino={t} exMap={exMap} />
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
