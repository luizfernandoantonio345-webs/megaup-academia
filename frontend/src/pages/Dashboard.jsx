import { useQuery } from '@tanstack/react-query'
import { listarAlunos, listarTreinos } from '../api'
import { useAuth } from '../contexts/AuthContext'
import { Link } from 'react-router-dom'
import { Users, Dumbbell, Brain, UserPlus, ArrowRight, BarChart2, TrendingUp, Zap, Activity } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { SkeletonPage, SkeletonChart } from '../components/ui/Skeleton'
import OnboardingWizard from '../components/OnboardingWizard'
import { useCountUp } from '../hooks/useCountUp'
import { motion } from 'framer-motion'

const DIAS = ['Dom','Seg','Ter','Qua','Qui','Sex','Sab']
const DIAS_API = ['domingo','segunda','terca','quarta','quinta','sexta','sabado']
const DIAS_ALT = ['domingo','segunda','terca','quarta','quinta','sexta','sabado']
// Palette color-blind safe (distinguível por deuteranopia/protanopia)
const BAR_COLORS = ['#6366f1','#38bdf8','#34d399','#fbbf24','#f472b6','#a78bfa','#fb923c']

const DarkTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#141D30', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 12, padding: '10px 14px', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
      <p style={{ color: '#64748B', fontSize: 11, fontWeight: 700, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: '#a5b4fc', fontWeight: 700, fontSize: 15, fontFamily: 'Space Grotesk, sans-serif', margin: 0 }}>
          {p.value} treino{p.value !== 1 ? 's' : ''}
        </p>
      ))}
    </div>
  )
}

function Avatar({ nome, size = 36 }) {
  const initials = (nome || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'linear-gradient(135deg,#4f46e5,#7c3aed)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.33, fontWeight: 700, color: 'white', flexShrink: 0,
      boxShadow: '0 0 12px rgba(99,102,241,0.3)',
    }}>
      {initials}
    </div>
  )
}

function AnimatedNum({ value, suffix = '' }) {
  const num = typeof value === 'number' ? value : parseFloat(value)
  const animated = useCountUp(isNaN(num) ? 0 : num, 900)
  if (typeof value !== 'number' && isNaN(num)) return <span>{value}</span>
  return <span>{animated}{suffix}</span>
}

function StatCard({ icon: Icon, label, value, sub, gradient, to, accent }) {
  const inner = (
    <motion.div
      className="card relative overflow-hidden"
      style={{ cursor: to ? 'pointer' : 'default' }}
      whileHover={to ? { y: -4, boxShadow: `0 20px 48px rgba(0,0,0,0.45), 0 0 28px ${accent}25` } : {}}
      whileTap={to ? { scale: 0.98 } : {}}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
    >
      <div style={{ position: 'absolute', top: -24, right: -24, width: 130, height: 130, borderRadius: '50%', background: `radial-gradient(circle, ${accent}20 0%, transparent 70%)`, pointerEvents: 'none' }} />
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, position: 'relative', zIndex: 1 }}>
        <motion.div
          style={{ width: 52, height: 52, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: gradient, boxShadow: `0 0 24px ${accent}50` }}
          whileHover={{ scale: 1.08, rotate: 4 }}
          transition={{ type: 'spring', stiffness: 500, damping: 20 }}
        >
          <Icon style={{ width: 22, height: 22, color: 'white' }} />
        </motion.div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 34, fontWeight: 900, color: '#EFF6FF', letterSpacing: '-0.04em', lineHeight: 1 }}>
            <AnimatedNum value={value} />
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, marginTop: 4, color: '#94A3B8' }}>{label}</div>
          {sub && <div style={{ fontSize: 11, marginTop: 2, color: '#3D4F6A' }}>{sub}</div>}
        </div>
        {to && <ArrowRight style={{ width: 15, height: 15, flexShrink: 0, marginTop: 4, color: accent, opacity: 0.7 }} />}
      </div>
    </motion.div>
  )
  return to ? <Link to={to} style={{ display: 'block', textDecoration: 'none' }}>{inner}</Link> : inner
}

function ProgressRing({ value, max, color, size = 52 }) {
  const r = (size - 8) / 2
  const circ = 2 * Math.PI * r
  const pct = Math.min(1, max > 0 ? value / max : 0)
  const offset = circ * (1 - pct)
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} stroke="rgba(255,255,255,0.07)" strokeWidth={7} fill="none" />
      <circle cx={size/2} cy={size/2} r={r} stroke={color} strokeWidth={7} fill="none"
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.16,1,0.3,1)', filter: `drop-shadow(0 0 6px ${color}80)` }}
      />
    </svg>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const { data: alunos = [], isLoading: la } = useQuery({ queryKey: ['alunos'], queryFn: () => listarAlunos().then(r => r.data) })
  const { data: treinos = [], isLoading: lt } = useQuery({ queryKey: ['treinos'], queryFn: () => listarTreinos().then(r => r.data) })

  if (la || lt) return <SkeletonPage />

  const treinosPorDia = DIAS.map((dia, i) => ({
    dia,
    treinos: treinos.filter((t) => {
      const d = (t.dia_semana || '').toLowerCase()
      return d === DIAS_API[i] || d === DIAS_ALT[i]
    }).length,
  }))

  const recentAlunos = [...alunos].reverse().slice(0, 5)
  const hora = new Date().getHours()
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite'
  const avgEx = treinos.length > 0 ? (treinos.reduce((s, t) => s + (t.itens?.length || 0), 0) / treinos.length).toFixed(1) : '0'
  const dataHoje = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }} className="animate-fade-in">
      <OnboardingWizard />

      {/* Hero banner */}
      <div style={{
        background: 'linear-gradient(135deg, #08091a 0%, #0a1020 40%, #0e1430 70%, #12192e 100%)',
        border: '1px solid rgba(99,102,241,0.2)',
        borderRadius: 28, padding: '32px 36px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -60, left: -40, width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(79,70,229,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -40, right: 80, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 24, position: 'relative', zIndex: 1 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#34d399', boxShadow: '0 0 8px #34d399' }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Sistema ativo</span>
            </div>
            <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 36, fontWeight: 900, color: '#EFF6FF', letterSpacing: '-0.04em', lineHeight: 1.1, margin: '0 0 4px' }}>
              {saudacao}, {user?.nome?.split(' ')[0]}
            </h1>
            <p style={{ fontSize: 13, color: '#3D4F6A', margin: '0 0 20px', textTransform: 'capitalize' }}>{dataHoje}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
              {[
                { label: 'Alunos', val: alunos.length, color: '#a5b4fc' },
                { label: 'Treinos', val: treinos.length, color: '#34d399' },
                { label: 'Ex/treino', val: Number(avgEx), color: '#fbbf24' },
              ].map(({ label, val, color }, i) => (
                <motion.div
                  key={label}
                  style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.4, ease: [0.16,1,0.3,1] }}
                >
                  <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 28, fontWeight: 900, color, lineHeight: 1 }}>
                    <AnimatedNum value={val} />
                  </span>
                  <span style={{ fontSize: 11, color: '#3D4F6A', fontWeight: 600 }}>{label}</span>
                </motion.div>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-end' }}>
            <Link to="/convites" className="btn-gradient">
              <UserPlus style={{ width: 16, height: 16 }} />
              Adicionar aluno
            </Link>
            <Link to="/exercicios" style={{
              display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#4B5768',
              textDecoration: 'none', padding: '7px 14px', borderRadius: 999,
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', fontWeight: 600,
            }}>
              <Dumbbell style={{ width: 13, height: 13 }} />
              Exercicios
            </Link>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        <StatCard icon={Users}     label="Alunos ativos"      value={alunos.length}  sub="na plataforma"       gradient="linear-gradient(135deg,#4f46e5,#7c3aed)" accent="#6366f1" to="/alunos" />
        <StatCard icon={Dumbbell}  label="Treinos prescritos"  value={treinos.length} sub={`media ${avgEx} ex`} gradient="linear-gradient(135deg,#059669,#10b981)" accent="#10b981" />
        <StatCard icon={Brain}     label="IA - Progressao"     value="Ver"            sub="Sugestoes ativas"    gradient="linear-gradient(135deg,#7c3aed,#a78bfa)"  accent="#a78bfa" to="/ia" />
        <StatCard icon={BarChart2} label="Financeiro"          value="Ver"            sub="Cobrancas e planos"  gradient="linear-gradient(135deg,#d97706,#f59e0b)"  accent="#f59e0b" to="/financeiro" />
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,3fr) minmax(0,2fr)', gap: 20 }}>
        {/* Bar chart — isAnimationActive=false to prevent removeChild crash */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, color: '#CBD5E1', fontSize: 15, margin: 0 }}>Distribuicao semanal</h2>
              <p style={{ fontSize: 12, color: '#3D4F6A', marginTop: 4, marginBottom: 0 }}>Treinos por dia da semana</p>
            </div>
            <div style={{ width: 36, height: 36, borderRadius: 12, background: 'rgba(99,102,241,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity style={{ width: 16, height: 16, color: '#818cf8' }} />
            </div>
          </div>
          {treinos.length === 0 ? (
            <div className="empty-state" style={{ paddingTop: 40, paddingBottom: 40 }}>
              <div className="empty-icon"><Dumbbell style={{ width: 28, height: 28, color: '#4B5768' }} /></div>
              <p className="empty-title">Nenhum treino ainda</p>
              <p className="empty-message">Crie treinos para ver a distribuição semanal</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={treinosPorDia} barSize={28} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="dia" tick={{ fontSize: 11, fill: '#64748B', fontFamily: 'Inter, sans-serif' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} allowDecimals={false} width={20} />
                <Tooltip content={<DarkTooltip />} cursor={{ fill: 'rgba(99,102,241,0.07)', radius: 8 }} />
                <Bar dataKey="treinos" radius={[8, 8, 3, 3]} isAnimationActive={false}>
                  {treinosPorDia.map((_, i) => (
                    <Cell key={`cell-${i}`} fill={BAR_COLORS[i % BAR_COLORS.length]} fillOpacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Overview */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, color: '#CBD5E1', fontSize: 15, margin: 0 }}>Visao geral</h2>
              <TrendingUp style={{ width: 16, height: 16, color: '#10b981' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {[
                { label: 'Alunos',    value: alunos.length,  max: Math.max(alunos.length, 10),  color: 'linear-gradient(90deg,#4f46e5,#7c3aed)', ring: '#6366f1' },
                { label: 'Treinos',   value: treinos.length, max: Math.max(treinos.length, 20), color: 'linear-gradient(90deg,#059669,#10b981)', ring: '#10b981' },
                { label: 'Ex/treino', value: Number(avgEx),  max: 12,                           color: 'linear-gradient(90deg,#7c3aed,#a78bfa)', ring: '#a78bfa' },
              ].map(({ label, value, max, color, ring }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <ProgressRing value={value} max={max} color={ring} size={52} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 12, color: '#64748B' }}>{label}</span>
                      <span style={{ fontSize: 14, fontWeight: 800, color: '#CBD5E1', fontFamily: 'Space Grotesk, sans-serif' }}>{value}</span>
                    </div>
                    <div className="progress-bar-track">
                      <div className="progress-bar-fill" style={{ width: `${Math.min(100, max > 0 ? (Number(value) / max) * 100 : 0)}%`, background: color }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ marginTop: 20, paddingTop: 18, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <Link to="/convites" className="btn-gradient" style={{ width: '100%', justifyContent: 'center', display: 'flex' }}>
              <UserPlus style={{ width: 15, height: 15 }} />
              Convidar aluno
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
        {/* Recent students */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, color: '#CBD5E1', fontSize: 15, margin: 0 }}>Alunos recentes</h2>
            <Link to="/alunos" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, color: '#6366f1', textDecoration: 'none' }}>
              Ver todos <ArrowRight style={{ width: 13, height: 13 }} />
            </Link>
          </div>
          {recentAlunos.length === 0 ? (
            <div className="empty-state" style={{ paddingTop: 32, paddingBottom: 32 }}>
              <div className="empty-icon"><Users style={{ width: 24, height: 24, color: '#4B5768' }} /></div>
              <p className="empty-title">Nenhum aluno ainda</p>
              <Link to="/convites" className="btn-gradient btn-sm">Enviar convite</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {recentAlunos.map((a) => (
                <Link key={a.id} to={`/alunos/${a.id}`}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 14, textDecoration: 'none', color: 'inherit', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.04)'}
                  onMouseLeave={e => e.currentTarget.style.background='transparent'}
                >
                  <Avatar nome={a.nome} size={38} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#CBD5E1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.nome}</div>
                    <div style={{ fontSize: 11, color: '#3D4F6A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.email}</div>
                  </div>
                  <ArrowRight style={{ width: 13, height: 13, color: '#1F2D4A', flexShrink: 0 }} />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="card">
          <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, color: '#CBD5E1', fontSize: 15, margin: '0 0 16px' }}>Acoes rapidas</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { to: '/convites',   icon: UserPlus,  label: 'Enviar convite por e-mail',     accent: '#6366f1', bg: 'rgba(99,102,241,0.1)'  },
              { to: '/exercicios', icon: Dumbbell,  label: 'Gerenciar banco de exercicios',  accent: '#10b981', bg: 'rgba(16,185,129,0.1)'  },
              { to: '/ia',         icon: Brain,     label: 'Ver sugestoes da IA por aluno',  accent: '#a78bfa', bg: 'rgba(167,139,250,0.1)' },
              { to: '/financeiro', icon: BarChart2, label: 'Cobrancas e planos',             accent: '#f59e0b', bg: 'rgba(245,158,11,0.1)'  },
            ].map(({ to, icon: Icon, label, accent, bg }) => (
              <Link key={to} to={to}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 14, border: '1px solid rgba(255,255,255,0.05)', textDecoration: 'none', transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.background = bg; e.currentTarget.style.borderColor = `${accent}40`; e.currentTarget.style.transform = 'translateX(2px)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; e.currentTarget.style.transform = '' }}
              >
                <div style={{ width: 36, height: 36, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: bg }}>
                  <Icon style={{ width: 16, height: 16, color: accent }} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, flex: 1, color: '#94A3B8' }}>{label}</span>
                <ArrowRight style={{ width: 13, height: 13, color: '#1F2D4A' }} />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
