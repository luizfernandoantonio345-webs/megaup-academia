import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../../contexts/AuthContext'
import { listarAlunos, gamificacaoAluno } from '../../api'
import { Lock, Star, Zap } from 'lucide-react'

const CONQUISTAS = [
  { codigo:'primeiro_treino', emoji:'🏋️', titulo:'Primeiro Passo',   descricao:'Completou o primeiro treino',    xp:50,   raridade:'comum'    },
  { codigo:'streak_7',        emoji:'🔥', titulo:'Semana de Fogo',   descricao:'7 dias seguidos treinando',      xp:200,  raridade:'raro'     },
  { codigo:'streak_30',       emoji:'🏆', titulo:'Mês Olímpico',     descricao:'30 dias consecutivos',           xp:1000, raridade:'lendário' },
  { codigo:'treinos_10',      emoji:'💪', titulo:'Em Ritmo',         descricao:'10 treinos completados',         xp:150,  raridade:'comum'    },
  { codigo:'treinos_50',      emoji:'⭐', titulo:'Veterano',          descricao:'50 treinos completados',         xp:500,  raridade:'épico'    },
]

const RARIDADE = {
  comum:    { label:'Comum',    bg:'rgba(100,116,139,0.12)', border:'rgba(100,116,139,0.25)', text:'#94A3B8', glow:'none' },
  raro:     { label:'Raro',    bg:'rgba(56,189,248,0.12)',  border:'rgba(56,189,248,0.3)',   text:'#38bdf8', glow:'0 0 20px rgba(56,189,248,0.2)' },
  épico:    { label:'Épico',   bg:'rgba(167,139,250,0.12)', border:'rgba(167,139,250,0.3)',  text:'#a78bfa', glow:'0 0 20px rgba(167,139,250,0.25)' },
  lendário: { label:'Lendário',bg:'rgba(251,191,36,0.12)',  border:'rgba(251,191,36,0.35)',  text:'#fbbf24', glow:'0 0 24px rgba(251,191,36,0.3)' },
}

function XPBar({ xpTotal, xpMax }) {
  const level = Math.floor(xpTotal / 200) + 1
  const xpParaProx = level * 200
  const xpBase = (level - 1) * 200
  const pct = Math.min(100, Math.round(((xpTotal - xpBase) / (xpParaProx - xpBase)) * 100))

  return (
    <div className="rounded-3xl p-5 relative overflow-hidden" style={{
      background:'linear-gradient(135deg, #0D1525 0%, #141D30 100%)',
      border:'1px solid rgba(99,102,241,0.25)',
      boxShadow:'0 0 40px rgba(99,102,241,0.08)',
    }}>
      <div className="absolute inset-0 pointer-events-none" style={{
        background:'radial-gradient(ellipse at 80% 0%, rgba(124,58,237,0.15) 0%, transparent 60%)',
      }} />
      <div className="flex items-center justify-between mb-5 relative z-10">
        <div>
          <p style={{ fontSize:11, color:'#3D4F6A', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:4 }}>Nível atual</p>
          <div className="flex items-end gap-3">
            <span style={{ fontFamily:'Space Grotesk, sans-serif', fontSize:52, fontWeight:900, color:'#EFF6FF', lineHeight:1, letterSpacing:'-0.03em' }}>{level}</span>
            <div style={{ marginBottom:6 }}>
              <p style={{ fontSize:13, color:'#6366f1', fontWeight:700 }}>{xpTotal.toLocaleString('pt-BR')} XP</p>
              <p style={{ fontSize:11, color:'#3D4F6A' }}>nível {level}</p>
            </div>
          </div>
        </div>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background:'linear-gradient(135deg,#4f46e5,#7c3aed)', boxShadow:'0 0 24px rgba(99,102,241,0.5)' }}>
          <Zap style={{ width:26, height:26, color:'white' }} />
        </div>
      </div>
      <div className="relative z-10 space-y-2">
        <div className="flex justify-between text-xs" style={{ color:'#3D4F6A' }}>
          <span>Progresso para nível {level + 1}</span>
          <span style={{ color:'#6366f1', fontWeight:700 }}>{pct}%</span>
        </div>
        <div className="progress-bar-track" style={{ height:8 }}>
          <div className="progress-bar-fill" style={{ width:`${pct}%`, height:8, background:'linear-gradient(90deg, #4f46e5, #a78bfa)', boxShadow:'0 0 12px rgba(99,102,241,0.5)' }} />
        </div>
        <p style={{ fontSize:11, color:'#3D4F6A' }}>
          {xpParaProx - xpTotal > 0
            ? `${(xpParaProx - xpTotal).toLocaleString('pt-BR')} XP para o próximo nível`
            : '🎉 Nível máximo atingido!'}
        </p>
      </div>
    </div>
  )
}

function StatPill({ emoji, value, label, accent }) {
  return (
    <div className="card text-center p-4" style={{ border:`1px solid ${accent}20` }}>
      <div style={{ fontFamily:'Space Grotesk, sans-serif', fontSize:28, fontWeight:900, color:accent, letterSpacing:'-0.02em' }}>{value}</div>
      <div style={{ fontSize:22, margin:'4px 0' }}>{emoji}</div>
      <div style={{ fontSize:11, color:'#3D4F6A', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em' }}>{label}</div>
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
        }}>
          {desbloqueada ? c.emoji : <Lock style={{ width:22, height:22, color:'#1F2D4A' }} />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <span style={{ fontFamily:'Space Grotesk, sans-serif', fontWeight:700, fontSize:14, color: desbloqueada ? '#EFF6FF' : '#3D4F6A' }}>{c.titulo}</span>
            <span style={{ fontSize:10, fontWeight:800, color:R.text, background:`${R.bg}`, padding:'2px 8px', borderRadius:999, textTransform:'uppercase', letterSpacing:'0.06em' }}>
              {R.label}
            </span>
          </div>
          <p style={{ fontSize:12, color: desbloqueada ? '#64748B' : '#1F2D4A' }}>{c.descricao}</p>
          {desbloqueada && info?.desbloqueado_em && (
            <p style={{ fontSize:11, color:'#10b981', fontWeight:600, marginTop:4 }}>
              ✓ {new Date(info.desbloqueado_em).toLocaleDateString('pt-BR', { day:'2-digit', month:'short', year:'numeric' })}
            </p>
          )}
        </div>

        <div style={{ flexShrink:0 }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'4px 10px', borderRadius:999, fontSize:11, fontWeight:700,
            background: desbloqueada ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)',
            color: desbloqueada ? '#a5b4fc' : '#1F2D4A',
          }}>
            <Star style={{ width:11, height:11 }} />
            {c.xp} XP
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Conquistas() {
  const { user } = useAuth()
  const { data: alunos = [] } = useQuery({ queryKey:['alunos'], queryFn: () => listarAlunos().then(r => r.data) })
  const aluno = alunos.find(a => a.email === user?.email) || alunos[0]

  const { data: gami, isLoading } = useQuery({
    queryKey: ['gamificacao', aluno?.id],
    queryFn: () => gamificacaoAluno(aluno.id).then(r => r.data),
    enabled: !!aluno,
  })

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center animate-bounce-light" style={{ background:'rgba(234,179,8,0.12)' }}>
        <Star style={{ width:24, height:24, color:'#fbbf24' }} />
      </div>
      <p style={{ fontSize:13, color:'#3D4F6A' }}>Carregando conquistas...</p>
    </div>
  )

  const desbloqueadas = new Set(gami?.conquistas?.map(c => c.codigo) || [])
  const xpTotal = CONQUISTAS.filter(c => desbloqueadas.has(c.codigo)).reduce((s, c) => s + c.xp, 0)
  const xpMax = CONQUISTAS.reduce((s, c) => s + c.xp, 0)

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 style={{ fontFamily:'Space Grotesk, sans-serif', fontSize:24, fontWeight:800, color:'#EFF6FF', letterSpacing:'-0.02em' }}>Conquistas</h1>
        <p style={{ fontSize:13, color:'#3D4F6A', marginTop:2 }}>
          {desbloqueadas.size} de {CONQUISTAS.length} desbloqueadas
        </p>
      </div>

      <XPBar xpTotal={xpTotal} xpMax={xpMax} />

      <div className="grid grid-cols-3 gap-3">
        <StatPill emoji="🔥" value={gami?.streak_atual || 0}   label="Streak"  accent="#f97316" />
        <StatPill emoji="🏆" value={gami?.streak_recorde || 0} label="Recorde" accent="#fbbf24" />
        <StatPill emoji="💪" value={gami?.total_treinos || 0}  label="Treinos" accent="#34d399" />
      </div>

      {desbloqueadas.size > 0 && (
        <div>
          <p className="section-title">Conquistadas ({desbloqueadas.size})</p>
          <div className="space-y-3">
            {CONQUISTAS.filter(c => desbloqueadas.has(c.codigo)).map(c => (
              <ConquistaCard key={c.codigo} conquista={c} gami={gami} desbloqueadas={desbloqueadas} />
            ))}
          </div>
        </div>
      )}

      {CONQUISTAS.some(c => !desbloqueadas.has(c.codigo)) && (
        <div>
          <p className="section-title">Bloqueadas</p>
          <div className="space-y-3">
            {CONQUISTAS.filter(c => !desbloqueadas.has(c.codigo)).map(c => (
              <ConquistaCard key={c.codigo} conquista={c} gami={gami} desbloqueadas={desbloqueadas} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
