import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../../contexts/AuthContext'
import { gamificacaoAluno } from '../../api'
import { Lock, Star, Zap, Flame, Trophy, Target } from 'lucide-react'

const CONQUISTAS = [
  { codigo:'primeiro_treino', emoji:'🏋️', titulo:'Primeiro Passo',   descricao:'Completou o primeiro treino',       xp:50,    raridade:'comum',    categoria:'inicio'   },
  { codigo:'treinos_10',      emoji:'💪', titulo:'Em Ritmo',         descricao:'10 treinos completados',            xp:150,   raridade:'comum',    categoria:'volume'   },
  { codigo:'treinos_25',      emoji:'🔩', titulo:'Constante',        descricao:'25 treinos completados',            xp:300,   raridade:'raro',     categoria:'volume'   },
  { codigo:'treinos_50',      emoji:'⭐', titulo:'Veterano',          descricao:'50 treinos completados',            xp:500,   raridade:'epico',    categoria:'volume'   },
  { codigo:'treinos_100',     emoji:'💎', titulo:'Elite',             descricao:'100 treinos completados',           xp:1500,  raridade:'lendario', categoria:'volume'   },
  { codigo:'streak_3',        emoji:'🔥', titulo:'Aquecendo',        descricao:'3 dias seguidos treinando',         xp:75,    raridade:'comum',    categoria:'streak'   },
  { codigo:'streak_7',        emoji:'🌟', titulo:'Semana de Fogo',   descricao:'7 dias seguidos treinando',         xp:200,   raridade:'raro',     categoria:'streak'   },
  { codigo:'streak_14',       emoji:'⚡', titulo:'Imparavel',        descricao:'14 dias consecutivos',              xp:500,   raridade:'epico',    categoria:'streak'   },
  { codigo:'streak_30',       emoji:'🏆', titulo:'Mes Olimpico',     descricao:'30 dias consecutivos',              xp:1000,  raridade:'lendario', categoria:'streak'   },
  { codigo:'streak_60',       emoji:'👑', titulo:'Lenda Viva',       descricao:'60 dias consecutivos sem parar',    xp:3000,  raridade:'lendario', categoria:'streak'   },
]

const RARIDADE = {
  comum:    { label:'Comum',    bg:'rgba(100,116,139,0.12)', border:'rgba(100,116,139,0.25)', text:'#94A3B8', glow:'none',                          dot:'#64748B' },
  raro:     { label:'Raro',     bg:'rgba(56,189,248,0.12)',  border:'rgba(56,189,248,0.3)',   text:'#38bdf8', glow:'0 0 20px rgba(56,189,248,0.2)',  dot:'#38bdf8' },
  epico:    { label:'Epico',    bg:'rgba(167,139,250,0.12)', border:'rgba(167,139,250,0.3)',  text:'#a78bfa', glow:'0 0 20px rgba(167,139,250,0.25)',dot:'#a78bfa' },
  lendario: { label:'Lendario', bg:'rgba(251,191,36,0.12)',  border:'rgba(251,191,36,0.35)',  text:'#fbbf24', glow:'0 0 24px rgba(251,191,36,0.3)',  dot:'#fbbf24' },
}

const CATEGORY_LABELS = {
  inicio:  { label:'Inicio',   color:'#34d399' },
  volume:  { label:'Volume',   color:'#818cf8' },
  streak:  { label:'Sequencia', color:'#f97316' },
}

function XPBar({ xpTotal }) {
  const level = Math.floor(xpTotal / 200) + 1
  const xpParaProx = level * 200
  const xpBase = (level - 1) * 200
  const pct = Math.min(100, Math.round(((xpTotal - xpBase) / (xpParaProx - xpBase)) * 100))

  return (
    <div className="rounded-3xl p-5 relative overflow-hidden" style={{
      background: 'linear-gradient(135deg, #0D1525 0%, #141D30 100%)',
      border: '1px solid rgba(99,102,241,0.25)',
      boxShadow: '0 0 40px rgba(99,102,241,0.08)',
    }}>
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at 80% 0%, rgba(124,58,237,0.15) 0%, transparent 60%)',
      }} />
      <div className="flex items-center justify-between mb-5 relative z-10">
        <div>
          <p style={{ fontSize: 11, color: '#3D4F6A', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Nivel atual</p>
          <div className="flex items-end gap-3">
            <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 52, fontWeight: 900, color: '#EFF6FF', lineHeight: 1, letterSpacing: '-0.03em' }}>{level}</span>
            <div style={{ marginBottom: 6 }}>
              <p style={{ fontSize: 13, color: '#6366f1', fontWeight: 700 }}>{xpTotal.toLocaleString('pt-BR')} XP</p>
              <p style={{ fontSize: 11, color: '#3D4F6A' }}>total acumulado</p>
            </div>
          </div>
        </div>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', boxShadow: '0 0 24px rgba(99,102,241,0.5)' }}>
          <Zap style={{ width: 26, height: 26, color: 'white' }} />
        </div>
      </div>
      <div className="relative z-10 space-y-2">
        <div className="flex justify-between text-xs" style={{ color: '#3D4F6A' }}>
          <span>Progresso para nivel {level + 1}</span>
          <span style={{ color: '#6366f1', fontWeight: 700 }}>{pct}%</span>
        </div>
        <div className="progress-bar-track" style={{ height: 8 }}>
          <div className="progress-bar-fill" style={{ width: `${pct}%`, height: 8, background: 'linear-gradient(90deg, #4f46e5, #a78bfa)', boxShadow: '0 0 12px rgba(99,102,241,0.5)' }} />
        </div>
        <p style={{ fontSize: 11, color: '#3D4F6A' }}>
          {xpParaProx - xpTotal > 0 ? `${(xpParaProx - xpTotal).toLocaleString('pt-BR')} XP para o proximo nivel` : 'Nivel maximo atingido!'}
        </p>
      </div>
    </div>
  )
}

function StatMini({ icon: Icon, value, label, accent }) {
  return (
    <div className="card text-center p-4 flex flex-col items-center gap-1.5" style={{ border: `1px solid ${accent}20` }}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${accent}18` }}>
        <Icon style={{ width: 20, height: 20, color: accent }} />
      </div>
      <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 26, fontWeight: 900, color: accent, letterSpacing: '-0.02em', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 10, color: '#3D4F6A', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
    </div>
  )
}

function ProgressMilestone({ label, current, targets, color }) {
  const nextTarget = targets.find(t => t > current)
  const prevTarget = targets.filter(t => t <= current).pop() || 0
  const pct = nextTarget ? Math.round(((current - prevTarget) / (nextTarget - prevTarget)) * 100) : 100

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center" style={{ fontSize: 11 }}>
        <span style={{ color: '#64748B', fontWeight: 600 }}>{label}</span>
        <span style={{ color, fontWeight: 700 }}>
          {nextTarget ? `${current}/${nextTarget}` : `${current} ✓`}
        </span>
      </div>
      <div className="progress-bar-track" style={{ height: 6 }}>
        <div className="progress-bar-fill" style={{ width: `${pct}%`, height: 6, background: color, boxShadow: `0 0 8px ${color}60` }} />
      </div>
    </div>
  )
}

function ConquistaCard({ conquista: c, gami, desbloqueadas }) {
  const desbloqueada = desbloqueadas.has(c.codigo)
  const info = gami?.conquistas?.find(x => x.codigo === c.codigo)
  const R = RARIDADE[c.raridade] || RARIDADE.comum

  return (
    <div className="rounded-2xl p-4 transition-all duration-300" style={{
      background: desbloqueada ? R.bg : 'rgba(255,255,255,0.03)',
      border: `1px solid ${desbloqueada ? R.border : 'rgba(255,255,255,0.06)'}`,
      opacity: desbloqueada ? 1 : 0.5,
      boxShadow: desbloqueada ? R.glow : 'none',
    }}>
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0" style={{
          background: desbloqueada ? R.bg : 'rgba(255,255,255,0.04)',
          border: `2px solid ${desbloqueada ? R.border : 'rgba(255,255,255,0.07)'}`,
          fontSize: 26,
          position: 'relative',
        }}>
          {desbloqueada ? c.emoji : <Lock style={{ width: 22, height: 22, color: '#1F2D4A' }} />}
          {desbloqueada && (
            <div style={{
              position: 'absolute', bottom: -4, right: -4, width: 14, height: 14, borderRadius: '50%',
              background: R.dot, border: '2px solid #0E1525',
              boxShadow: `0 0 6px ${R.dot}`,
            }} />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 14, color: desbloqueada ? '#EFF6FF' : '#3D4F6A' }}>
              {c.titulo}
            </span>
            <span style={{ fontSize: 10, fontWeight: 800, color: R.text, background: `${R.bg}`, padding: '2px 8px', borderRadius: 999, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {R.label}
            </span>
          </div>
          <p style={{ fontSize: 12, color: desbloqueada ? '#64748B' : '#1F2D4A' }}>{c.descricao}</p>
          {desbloqueada && info?.desbloqueado_em && (
            <p style={{ fontSize: 11, color: '#10b981', fontWeight: 600, marginTop: 3 }}>
              Desbloqueado {new Date(info.desbloqueado_em).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
            </p>
          )}
        </div>

        <div style={{ flexShrink: 0, textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 999, fontSize: 12, fontWeight: 800,
            background: desbloqueada ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)',
            color: desbloqueada ? '#a5b4fc' : '#1F2D4A',
            fontFamily: 'Space Grotesk, sans-serif',
          }}>
            <Star style={{ width: 11, height: 11 }} />
            {c.xp}
          </div>
          <div style={{ fontSize: 10, color: '#1F2D4A', marginTop: 2 }}>XP</div>
        </div>
      </div>
    </div>
  )
}

export default function Conquistas() {
  const { user } = useAuth()
  const alunoId = user?.id

  const { data: gami, isLoading } = useQuery({
    queryKey: ['gamificacao', alunoId],
    queryFn: () => gamificacaoAluno(alunoId).then(r => r.data),
    enabled: !!alunoId,
  })

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center animate-bounce-light"
        style={{ background: 'rgba(234,179,8,0.12)' }}>
        <Star style={{ width: 24, height: 24, color: '#fbbf24' }} />
      </div>
      <p style={{ fontSize: 13, color: '#3D4F6A' }}>Carregando conquistas...</p>
    </div>
  )

  const desbloqueadas = new Set(gami?.conquistas?.map(c => c.codigo) || [])
  const xpTotal = CONQUISTAS.filter(c => desbloqueadas.has(c.codigo)).reduce((s, c) => s + c.xp, 0)
  const streak = gami?.streak_atual || 0
  const total = gami?.total_treinos || 0

  const conquistadas = CONQUISTAS.filter(c => desbloqueadas.has(c.codigo))
  const bloqueadas = CONQUISTAS.filter(c => !desbloqueadas.has(c.codigo))

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 24, fontWeight: 800, color: '#EFF6FF', letterSpacing: '-0.02em' }}>Conquistas</h1>
        <p style={{ fontSize: 13, color: '#3D4F6A', marginTop: 2 }}>
          {desbloqueadas.size} de {CONQUISTAS.length} desbloqueadas
        </p>
      </div>

      <XPBar xpTotal={xpTotal} />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatMini icon={Flame}  value={streak}                  label="Streak"  accent="#f97316" />
        <StatMini icon={Trophy} value={gami?.streak_recorde || 0} label="Recorde" accent="#fbbf24" />
        <StatMini icon={Target} value={total}                   label="Treinos" accent="#34d399" />
      </div>

      {/* Progress milestones */}
      <div className="card space-y-4">
        <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, color: '#CBD5E1', fontSize: 14, marginBottom: 4 }}>Progresso para proximas conquistas</h3>
        <ProgressMilestone
          label="Treinos totais"
          current={total}
          targets={[10, 25, 50, 100]}
          color="#818cf8"
        />
        <ProgressMilestone
          label="Sequencia atual"
          current={streak}
          targets={[3, 7, 14, 30, 60]}
          color="#f97316"
        />
      </div>

      {/* Unlocked */}
      {conquistadas.length > 0 && (
        <div>
          <p className="section-title">Conquistadas ({conquistadas.length})</p>
          <div className="space-y-3">
            {conquistadas.map(c => (
              <ConquistaCard key={c.codigo} conquista={c} gami={gami} desbloqueadas={desbloqueadas} />
            ))}
          </div>
        </div>
      )}

      {/* Locked */}
      {bloqueadas.length > 0 && (
        <div>
          <p className="section-title">Bloqueadas</p>
          <div className="space-y-3">
            {bloqueadas.map(c => (
              <ConquistaCard key={c.codigo} conquista={c} gami={gami} desbloqueadas={desbloqueadas} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
