import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../../contexts/AuthContext'
import { gamificacaoAluno, feedConquistas } from '../../api'
import { Lock, Star, Zap, Flame, Trophy, Target, Users } from 'lucide-react'

const CONQUISTAS = [
  { codigo:'primeiro_treino', emoji:'🏋️', titulo:'Primeiro Passo',   descricao:'Completou o primeiro treino',       xp:50,    raridade:'comum',    categoria:'inicio'   },
  { codigo:'treinos_10',      emoji:'💪', titulo:'Em Ritmo',         descricao:'10 treinos completados',            xp:150,   raridade:'comum',    categoria:'volume'   },
  { codigo:'treinos_25',      emoji:'🔩', titulo:'Constante',        descricao:'25 treinos completados',            xp:300,   raridade:'raro',     categoria:'volume'   },
  { codigo:'treinos_50',      emoji:'⭐', titulo:'Veterano',          descricao:'50 treinos completados',            xp:500,   raridade:'epico',    categoria:'volume'   },
  { codigo:'treinos_100',     emoji:'💎', titulo:'Elite',             descricao:'100 treinos completados',           xp:1500,  raridade:'lendario', categoria:'volume'   },
  { codigo:'streak_3',        emoji:'🔥', titulo:'Aquecendo',        descricao:'3 dias seguidos treinando',         xp:75,    raridade:'comum',    categoria:'streak'   },
  { codigo:'streak_7',        emoji:'🌟', titulo:'Semana de Fogo',   descricao:'7 dias seguidos treinando',         xp:200,   raridade:'raro',     categoria:'streak'   },
  { codigo:'streak_14',       emoji:'⚡', titulo:'Imparável',        descricao:'14 dias consecutivos',              xp:500,   raridade:'epico',    categoria:'streak'   },
  { codigo:'streak_30',       emoji:'🏆', titulo:'Mês Olímpico',     descricao:'30 dias consecutivos',              xp:1000,  raridade:'lendario', categoria:'streak'   },
  { codigo:'streak_60',       emoji:'👑', titulo:'Lenda Viva',       descricao:'60 dias consecutivos sem parar',    xp:3000,  raridade:'lendario', categoria:'streak'   },
]

const RARIDADE = {
  comum:    { label:'Comum',    bg:'rgba(100,116,139,0.12)', border:'rgba(100,116,139,0.22)', text:'#94a3b8', dot:'#94a3b8',   glow:'none' },
  raro:     { label:'Raro',     bg:'rgba(56,189,248,0.12)',  border:'rgba(56,189,248,0.3)',   text:'#38bdf8', dot:'#38bdf8',   glow:'0 0 24px rgba(56,189,248,0.2)' },
  epico:    { label:'Épico',    bg:'rgba(167,139,250,0.12)', border:'rgba(167,139,250,0.3)',  text:'#a78bfa', dot:'#a78bfa',   glow:'0 0 24px rgba(167,139,250,0.2)' },
  lendario: { label:'Lendário', bg:'rgba(251,191,36,0.12)',  border:'rgba(251,191,36,0.35)',  text:'#fbbf24', dot:'#fbbf24',   glow:'0 0 30px rgba(251,191,36,0.25)' },
}

const CONQUISTAS_MAP = Object.fromEntries(CONQUISTAS.map(c => [c.codigo, c]))

function tempoRelativo(iso) {
  if (!iso) return ''
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)
  if (d === 0) return 'hoje'
  if (d === 1) return 'ontem'
  if (d < 7) return `há ${d} dias`
  if (d < 30) return `há ${Math.floor(d/7)} sem.`
  return `há ${Math.floor(d/30)} m.`
}

function XPBar({ xpTotal }) {
  const level = Math.floor(xpTotal / 200) + 1
  const xpParaProx = level * 200
  const xpBase = (level - 1) * 200
  const pct = Math.min(100, Math.round(((xpTotal - xpBase) / (xpParaProx - xpBase)) * 100))
  return (
    <div style={{
      borderRadius:20, padding:'20px', position:'relative', overflow:'hidden',
      background:'radial-gradient(ellipse at 10% -20%, rgba(99,102,241,0.25) 0%, transparent 55%), radial-gradient(ellipse at 90% 120%, rgba(239,68,68,0.12) 0%, transparent 50%), #111113',
      border:'1px solid rgba(99,102,241,0.22)', boxShadow:'0 8px 32px rgba(99,102,241,0.1)',
    }}>
      <div style={{ position:'absolute', top:-20, right:-20, width:100, height:100, borderRadius:'50%', background:'rgba(99,102,241,0.15)', filter:'blur(36px)', pointerEvents:'none' }} />
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:20, position:'relative', zIndex:1 }}>
        <div>
          <p style={{ fontSize:10, color:'rgba(255,255,255,0.4)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.09em', marginBottom:6 }}>Nível atual</p>
          <div style={{ display:'flex', alignItems:'flex-end', gap:12, lineHeight:1 }}>
            <span style={{ fontFamily:'Inter,sans-serif', fontSize:62, fontWeight:900, color:'white', letterSpacing:'-0.05em', textShadow:'0 0 60px rgba(99,102,241,0.8), 0 0 20px rgba(99,102,241,0.5)' }}>{level}</span>
            <div style={{ marginBottom:8 }}>
              <p style={{ fontSize:14, color:'#818cf8', fontWeight:800, letterSpacing:'-0.02em' }}>{xpTotal.toLocaleString('pt-BR')} XP</p>
              <p style={{ fontSize:11, color:'rgba(255,255,255,0.35)' }}>acumulados</p>
            </div>
          </div>
        </div>
        <div style={{ width:52, height:52, borderRadius:16, display:'flex', alignItems:'center', justifyContent:'center', background:'linear-gradient(145deg,#ef4444,#c42121)', boxShadow:'0 4px 18px rgba(239,68,68,0.45)' }}>
          <Zap style={{ width:24, height:24, color:'white' }} />
        </div>
      </div>
      <div style={{ position:'relative', zIndex:1 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:11, marginBottom:6, color:'rgba(255,255,255,0.38)', fontWeight:600 }}>
          <span>Progresso para nível {level+1}</span>
          <span style={{ color:'#818cf8', fontWeight:800 }}>{pct}%</span>
        </div>
        <div style={{ height:7, background:'rgba(255,255,255,0.06)', borderRadius:999, overflow:'hidden' }}>
          <div style={{ height:'100%', width:`${pct}%`, background:'linear-gradient(90deg,#6366f1,#818cf8)', borderRadius:999, transition:'width 0.5s ease', boxShadow:'0 0 12px rgba(99,102,241,0.6)' }} />
        </div>
        <p style={{ fontSize:11, color:'rgba(255,255,255,0.3)', marginTop:6 }}>
          {xpParaProx-xpTotal>0?`${(xpParaProx-xpTotal).toLocaleString('pt-BR')} XP para o próximo nível`:'Nível máximo atingido!'}
        </p>
      </div>
    </div>
  )
}

function StatMini({ icon:Icon, value, label, accent }) {
  return (
    <div style={{
      borderRadius:18, padding:'16px 12px', textAlign:'center', display:'flex', flexDirection:'column', alignItems:'center', gap:8,
      background:`${accent}09`, border:`1px solid ${accent}22`,
      boxShadow:`0 0 20px ${accent}08`,
    }}>
      <div style={{ width:38, height:38, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', background:`${accent}18` }}>
        <Icon style={{ width:18, height:18, color:accent }} />
      </div>
      <div style={{ fontFamily:'Inter,sans-serif', fontSize:28, fontWeight:900, color:accent, letterSpacing:'-0.03em', lineHeight:1, textShadow:`0 0 24px ${accent}60` }}>{value}</div>
      <div style={{ fontSize:9, color:'rgba(255,255,255,0.38)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em' }}>{label}</div>
    </div>
  )
}

function ProgressMilestone({ label, current, targets, color }) {
  const nextTarget = targets.find(t=>t>current)
  const prevTarget = targets.filter(t=>t<=current).pop() || 0
  const pct = nextTarget ? Math.round(((current-prevTarget)/(nextTarget-prevTarget))*100) : 100
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:12 }}>
        <span style={{ color:'rgba(255,255,255,0.5)', fontWeight:600 }}>{label}</span>
        <span style={{ color, fontWeight:800, letterSpacing:'-0.01em' }}>{nextTarget?`${current}/${nextTarget}`:`${current} ✓`}</span>
      </div>
      <div style={{ height:5, background:'rgba(255,255,255,0.06)', borderRadius:999, overflow:'hidden' }}>
        <div style={{ height:'100%', width:`${pct}%`, background:color, borderRadius:999, boxShadow:`0 0 8px ${color}60`, transition:'width 0.4s ease' }} />
      </div>
    </div>
  )
}

function ConquistaCard({ conquista:c, gami, desbloqueadas }) {
  const desbloqueada = desbloqueadas.has(c.codigo)
  const info = gami?.conquistas?.find(x=>x.codigo===c.codigo)
  const R = RARIDADE[c.raridade] || RARIDADE.comum
  return (
    <div style={{
      borderRadius:18, padding:16, transition:'all 0.2s',
      background: desbloqueada ? R.bg : 'rgba(255,255,255,0.02)',
      border: `1px solid ${desbloqueada ? R.border : 'rgba(255,255,255,0.06)'}`,
      opacity: desbloqueada ? 1 : 0.45,
      boxShadow: desbloqueada ? R.glow : 'none',
    }}>
      <div style={{ display:'flex', alignItems:'center', gap:14 }}>
        {/* Emoji/icon badge */}
        <div style={{
          width:56, height:56, borderRadius:16, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:24, position:'relative',
          background: desbloqueada ? R.bg : 'rgba(255,255,255,0.03)',
          border: `1.5px solid ${desbloqueada ? R.border : 'rgba(255,255,255,0.07)'}`,
          boxShadow: desbloqueada ? R.glow : 'none',
        }}>
          {desbloqueada ? c.emoji : <Lock style={{ width:20, height:20, color:'rgba(255,255,255,0.2)' }} />}
          {desbloqueada && (
            <div style={{ position:'absolute', bottom:-5, right:-5, width:16, height:16, borderRadius:'50%', background:R.dot, border:'2.5px solid #0C0C0D', boxShadow:`0 0 8px ${R.dot}` }} />
          )}
        </div>

        {/* Content */}
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', marginBottom:3 }}>
            <span style={{ fontFamily:'Inter,sans-serif', fontWeight:800, fontSize:14, color:desbloqueada?'#F4F4F5':'rgba(255,255,255,0.4)', letterSpacing:'-0.01em' }}>
              {c.titulo}
            </span>
            <span style={{ fontSize:9, fontWeight:800, color:R.text, background:`${R.bg}`, padding:'2px 8px', borderRadius:999, textTransform:'uppercase', letterSpacing:'0.06em', border:`1px solid ${R.border}` }}>
              {R.label}
            </span>
          </div>
          <p style={{ fontSize:12, color:desbloqueada?'rgba(255,255,255,0.4)':'rgba(255,255,255,0.2)', marginBottom:desbloqueada&&info?.desbloqueado_em?4:0 }}>{c.descricao}</p>
          {desbloqueada&&info?.desbloqueado_em&&(
            <p style={{ fontSize:11, color:'#10b981', fontWeight:700 }}>
              ✓ {new Date(info.desbloqueado_em).toLocaleDateString('pt-BR',{day:'2-digit',month:'short',year:'numeric'})}
            </p>
          )}
        </div>

        {/* XP badge */}
        <div style={{ flexShrink:0, textAlign:'center' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'5px 10px', borderRadius:999, fontSize:12, fontWeight:800, fontFamily:'Inter,sans-serif',
            background: desbloqueada?`${R.bg}`:'rgba(255,255,255,0.04)',
            color: desbloqueada?R.text:'rgba(255,255,255,0.25)',
            border:`1px solid ${desbloqueada?R.border:'rgba(255,255,255,0.07)'}`,
          }}>
            <Star style={{ width:11, height:11 }} />
            {c.xp}
          </div>
          <div style={{ fontSize:9, color:'rgba(255,255,255,0.25)', marginTop:2, fontWeight:600 }}>XP</div>
        </div>
      </div>
    </div>
  )
}

/* ── Colored avatar for name initials ── */
const ALPHA_COLORS = { A:'#6366f1',B:'#ec4899',C:'#f97316',D:'#22c55e',E:'#a855f7',F:'#06b6d4',G:'#ef4444',H:'#eab308',I:'#14b8a6',J:'#8b5cf6',K:'#f43f5e',L:'#10b981',M:'#3b82f6',N:'#fb923c',O:'#84cc16',P:'#e879f9',Q:'#2dd4bf',R:'#f472b6',S:'#38bdf8',T:'#4ade80',U:'#fbbf24',V:'#818cf8',W:'#34d399',X:'#f87171',Y:'#a78bfa',Z:'#60a5fa' }
const nameColor = n => ALPHA_COLORS[(n||'A')[0].toUpperCase()] ?? '#6366f1'

function FeedItem({ item }) {
  const nome = item.aluno_nome?.split(' ')[0] || 'Aluno'
  const c = CONQUISTAS_MAP[item.codigo]
  const initials = (item.aluno_nome||'??').split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase()
  const aColor = nameColor(item.aluno_nome)
  const R = c ? (RARIDADE[c.raridade]||RARIDADE.comum) : RARIDADE.comum
  return (
    <div style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 0', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ width:34, height:34, borderRadius:'50%', background:`${aColor}18`, border:`1.5px solid ${aColor}30`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:800, color:aColor, flexShrink:0 }}>
        {initials}
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:13, color:'rgba(255,255,255,0.7)', fontFamily:'Inter,sans-serif', lineHeight:1.4 }}>
          <strong style={{ fontWeight:700, color:'#F4F4F5' }}>{nome}</strong>
          {' desbloqueou '}
          <span style={{ color:R.text||'rgba(255,255,255,0.7)', fontWeight:700 }}>
            {c?`${c.emoji} ${c.titulo}`:item.codigo}
          </span>
        </div>
        <div style={{ fontSize:11, color:'rgba(255,255,255,0.3)', marginTop:2 }}>{tempoRelativo(item.desbloqueado_em)}</div>
      </div>
    </div>
  )
}

export default function Conquistas() {
  const { alunoId } = useAuth()
  const { data:gami, isLoading, isError } = useQuery({ queryKey:['gamificacao',alunoId], queryFn:()=>gamificacaoAluno(alunoId).then(r=>r.data), enabled:!!alunoId })
  const { data:feed=[] } = useQuery({ queryKey:['feed-conquistas'], queryFn:()=>feedConquistas().then(r=>r.data), staleTime:3*60_000 })

  if (isLoading) return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'80px 0', gap:12 }}>
      <div style={{ width:52, height:52, borderRadius:16, background:'rgba(234,179,8,0.12)', border:'1px solid rgba(234,179,8,0.2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <Star style={{ width:22, height:22, color:'#fbbf24' }} />
      </div>
      <p style={{ fontSize:13, color:'rgba(255,255,255,0.38)', fontWeight:600 }}>Carregando conquistas...</p>
    </div>
  )

  if (isError) return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'80px 24px', gap:12, textAlign:'center' }}>
      <div style={{ fontSize:44 }}>😕</div>
      <p style={{ fontSize:16, fontWeight:800, color:'#F4F4F5', letterSpacing:'-0.02em' }}>Não foi possível carregar</p>
      <p style={{ fontSize:13, color:'rgba(255,255,255,0.38)' }}>Verifique sua conexão e tente novamente.</p>
    </div>
  )

  const desbloqueadas = new Set(gami?.conquistas?.map(c=>c.codigo)||[])
  const xpTotal = CONQUISTAS.filter(c=>desbloqueadas.has(c.codigo)).reduce((s,c)=>s+c.xp,0)
  const streak = gami?.streak_atual||0
  const total = gami?.total_treinos||0
  const conquistadas = CONQUISTAS.filter(c=>desbloqueadas.has(c.codigo))
  const bloqueadas = CONQUISTAS.filter(c=>!desbloqueadas.has(c.codigo))

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      {/* Header */}
      <div>
        <h1 style={{ fontFamily:'Inter,sans-serif', fontSize:26, fontWeight:900, color:'#F4F4F5', letterSpacing:'-0.04em', lineHeight:1.1, marginBottom:4 }}>
          Conquistas
        </h1>
        <p style={{ fontSize:12, color:'rgba(255,255,255,0.38)', fontWeight:600 }}>
          {desbloqueadas.size} de {CONQUISTAS.length} desbloqueadas
        </p>
      </div>

      <XPBar xpTotal={xpTotal} />

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10 }}>
        <StatMini icon={Flame}  value={streak}                    label="Streak"  accent="#f97316" />
        <StatMini icon={Trophy} value={gami?.streak_recorde||0}   label="Recorde" accent="#fbbf24" />
        <StatMini icon={Target} value={total}                     label="Treinos" accent="#34d399" />
      </div>

      {/* Progress milestones */}
      <div style={{ padding:'18px', borderRadius:18, background:'#111113', border:'1px solid rgba(255,255,255,0.07)', boxShadow:'inset 0 1px 0 rgba(255,255,255,0.04)', display:'flex', flexDirection:'column', gap:14 }}>
        <h3 style={{ fontFamily:'Inter,sans-serif', fontWeight:800, color:'#F4F4F5', fontSize:14, letterSpacing:'-0.02em', marginBottom:2 }}>Progresso para próximas conquistas</h3>
        <ProgressMilestone label="Treinos totais"  current={total}  targets={[10,25,50,100]} color="#f87171" />
        <ProgressMilestone label="Sequência atual" current={streak} targets={[3,7,14,30,60]} color="#fb923c" />
      </div>

      {/* Unlocked */}
      {conquistadas.length>0&&(
        <div>
          <p style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.38)', textTransform:'uppercase', letterSpacing:'0.09em', marginBottom:12 }}>
            Conquistadas ({conquistadas.length})
          </p>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {conquistadas.map(c=><ConquistaCard key={c.codigo} conquista={c} gami={gami} desbloqueadas={desbloqueadas} />)}
          </div>
        </div>
      )}

      {/* Locked */}
      {bloqueadas.length>0&&(
        <div>
          <p style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.38)', textTransform:'uppercase', letterSpacing:'0.09em', marginBottom:12 }}>
            Bloqueadas
          </p>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {bloqueadas.map(c=><ConquistaCard key={c.codigo} conquista={c} gami={gami} desbloqueadas={desbloqueadas} />)}
          </div>
        </div>
      )}

      {/* Feed */}
      {feed.length>0&&(
        <div style={{ padding:'18px 20px', borderRadius:18, background:'#111113', border:'1px solid rgba(255,255,255,0.07)', boxShadow:'inset 0 1px 0 rgba(255,255,255,0.04)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3 }}>
            <Users style={{ width:14, height:14, color:'#ef4444' }} />
            <h3 style={{ fontFamily:'Inter,sans-serif', fontWeight:800, color:'#F4F4F5', fontSize:14, letterSpacing:'-0.02em' }}>Mural da Academia</h3>
          </div>
          <p style={{ fontSize:11, color:'rgba(255,255,255,0.35)', marginBottom:14 }}>Conquistas recentes dos colegas</p>
          {feed.slice(0,12).map((item,i)=><FeedItem key={i} item={item} />)}
        </div>
      )}
    </div>
  )
}
