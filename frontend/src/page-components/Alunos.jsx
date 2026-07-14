import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { listarAlunos, criarAluno } from '../api'
import toast from 'react-hot-toast'
import { UserPlus, Search, X, Mail, User, Target, LayoutGrid, List, Pin, PinOff, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { SkeletonCard } from '../components/ui/Skeleton'
import { useDebounce } from '../hooks/useDebounce'
import { useLocalStorage } from '../hooks/useLocalStorage'

/* ── Color system ───────────────────────────────────────────────────── */
const ALPHA = {
  A:'#6366f1',B:'#ec4899',C:'#f97316',D:'#22c55e',E:'#a855f7',F:'#06b6d4',
  G:'#E8342B',H:'#eab308',I:'#14b8a6',J:'#8b5cf6',K:'#f43f5e',L:'#10b981',
  M:'#3b82f6',N:'#fb923c',O:'#84cc16',P:'#e879f9',Q:'#2dd4bf',R:'#f472b6',
  S:'#38bdf8',T:'#4ade80',U:'#fbbf24',V:'#818cf8',W:'#34d399',X:'#FF8078',
  Y:'#a78bfa',Z:'#60a5fa',
}
const nameColor = (n) => ALPHA[(n || 'A')[0].toUpperCase()] ?? '#6366f1'
const getInits  = (n) => (n?.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('') || '??').toUpperCase()

/* ── Avatar ─────────────────────────────────────────────────────────── */
function Avatar({ nome, size = 42 }) {
  const c = nameColor(nome)
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: `${c}16`, border: `1.5px solid ${c}30`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.34, fontWeight: 800, color: c, flexShrink: 0,
      letterSpacing: '-0.02em',
    }}>
      {getInits(nome)}
    </div>
  )
}

/* ── Modal criar aluno ──────────────────────────────────────────────── */
function ModalCriar({ onClose }) {
  const qc = useQueryClient()
  const [form, setForm] = useState({ nome: '', email: '', objetivo: '' })
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const { mutate, isPending } = useMutation({
    mutationFn: criarAluno,
    onMutate: async (novo) => {
      await qc.cancelQueries({ queryKey: ['alunos'] })
      const prev = qc.getQueryData(['alunos'])
      qc.setQueryData(['alunos'], (old = []) => [...old, { id: `temp-${Date.now()}`, ...novo, _optimistic: true }])
      return { prev }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['alunos'] }); toast.success('Aluno criado!'); onClose() },
    onError: (err, _, ctx) => {
      if (ctx?.prev) qc.setQueryData(['alunos'], ctx.prev)
      toast.error(err.response?.data?.detail || 'Não foi possível criar o aluno.')
    },
  })

  return (
    <div style={{ position:'fixed', inset:0, display:'flex', alignItems:'center', justifyContent:'center', zIndex:50, padding:16, background:'rgba(0,0,0,0.78)', backdropFilter:'blur(12px)', WebkitBackdropFilter:'blur(12px)' }}>
      <div className="animate-scale-in" style={{ width:'100%', maxWidth:420, background:'linear-gradient(160deg,#18191e 0%,#111113 100%)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:22, padding:28, boxShadow:'0 32px 80px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.05)' }}>

        {/* Modal header */}
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:24 }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
              <div style={{ width:36, height:36, borderRadius:11, background:'rgba(232,52,43,0.12)', border:'1px solid rgba(232,52,43,0.25)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <UserPlus style={{ width:17, height:17, color:'#E8342B' }} />
              </div>
              <h3 style={{ fontSize:16, fontWeight:900, color:'#F4F4F5', letterSpacing:'-0.04em' }}>Novo aluno</h3>
            </div>
            <p style={{ fontSize:12, color:'rgba(255,255,255,0.38)', marginLeft:46 }}>Preencha as informações básicas</p>
          </div>
          <button onClick={onClose} style={{ width:30, height:30, borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', cursor:'pointer', color:'rgba(255,255,255,0.5)', flexShrink:0 }}>
            <X style={{ width:14, height:14 }} />
          </button>
        </div>

        {/* Fields */}
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {[
            { k:'nome',     icon:User,   type:'text',  label:'Nome completo',  ph:'João da Silva'       },
            { k:'email',    icon:Mail,   type:'email', label:'E-mail',          ph:'joao@email.com'      },
            { k:'objetivo', icon:Target, type:'text',  label:'Objetivo',        ph:'Ex: perder peso...'  },
          ].map(({ k, icon: Icon, type, label, ph }) => (
            <div key={k}>
              <label className="label">{label}</label>
              <div style={{ position:'relative' }}>
                <Icon style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', width:15, height:15, color:'rgba(255,255,255,0.28)', pointerEvents:'none' }} />
                <input
                  className="input"
                  style={{ paddingLeft:40, height:44, borderRadius:12 }}
                  type={type}
                  placeholder={ph}
                  value={form[k]}
                  onChange={set(k)}
                />
              </div>
            </div>
          ))}
        </div>

        <div style={{ display:'flex', gap:10, marginTop:22 }}>
          <button className="btn-secondary" style={{ flex:1, height:42, borderRadius:12 }} onClick={onClose}>
            Cancelar
          </button>
          <button
            className="btn-primary"
            style={{ flex:2, height:42, borderRadius:12 }}
            disabled={isPending || !form.nome || !form.email}
            onClick={() => mutate(form)}
          >
            {isPending
              ? <span style={{ width:15, height:15, border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'white', borderRadius:'50%', animation:'spin 0.7s linear infinite', display:'inline-block' }} />
              : <><UserPlus style={{ width:14, height:14 }} /> Criar aluno</>
            }
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Stat pill ──────────────────────────────────────────────────────── */
function StatPill({ label, value, color }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 14px', borderRadius:20, background:`${color}09`, border:`1px solid ${color}1c` }}>
      <div style={{ width:6, height:6, borderRadius:'50%', background:color, boxShadow:`0 0 6px ${color}` }} />
      <span style={{ fontSize:13, fontWeight:800, color, letterSpacing:'-0.02em' }}>{value}</span>
      <span style={{ fontSize:12, color:'rgba(255,255,255,0.35)', fontWeight:500 }}>{label}</span>
    </div>
  )
}

/* ── Constants ──────────────────────────────────────────────────────── */
const OBJETIVOS_LABELS = ['Perder peso', 'Ganhar massa', 'Condicionamento', 'Reabilitação', 'Definição', 'Saúde']

/* ── Main page ──────────────────────────────────────────────────────── */
export default function Alunos() {
  const [search, setSearch]           = useState('')
  const debouncedSearch               = useDebounce(search, 280)
  const [filtroObjetivo, setFiltro]   = useState('')
  const [showModal, setShowModal]     = useState(false)
  const [viewMode, setViewMode]       = useState('grid')
  const [pinnedIds, setPinnedIds]     = useLocalStorage('MegaUp-pinned-alunos', [])

  const togglePin = (e, id) => {
    e.preventDefault(); e.stopPropagation()
    setPinnedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const { data: alunos = [], isLoading } = useQuery({
    queryKey: ['alunos'],
    queryFn: () => listarAlunos().then(r => r.data),
    staleTime: 5 * 60_000,
    placeholderData: prev => prev,
  })

  const ativos   = alunos.filter(a => a.ativo).length
  const inativos = alunos.filter(a => !a.ativo).length

  const objetivosUsados = [...new Set(alunos.map(a => a.objetivo).filter(Boolean))]
  const chipsObjetivo   = OBJETIVOS_LABELS.filter(l =>
    objetivosUsados.some(o => o.toLowerCase().includes(l.toLowerCase()))
  )

  const filtered = alunos
    .filter(a => {
      const q = debouncedSearch.toLowerCase()
      return (a.nome?.toLowerCase().includes(q) || a.email?.toLowerCase().includes(q)) &&
             (!filtroObjetivo || a.objetivo?.toLowerCase().includes(filtroObjetivo.toLowerCase()))
    })
    .sort((a, b) => {
      const pa = pinnedIds.includes(a.id) ? 0 : 1
      const pb = pinnedIds.includes(b.id) ? 0 : 1
      return pa - pb
    })

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20, paddingBottom:40 }}>

      {/* ── HEADER ──────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity:0, y:-16 }} animate={{ opacity:1, y:0 }}
        transition={{ duration:0.52, ease:[0.16,1,0.3,1] }}
        style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:16, flexWrap:'wrap' }}
      >
        <div>
          <h1 style={{ fontSize:'clamp(22px,3.5vw,32px)', fontWeight:900, color:'#F4F4F5', letterSpacing:'-0.055em', lineHeight:1.05, marginBottom:8 }}>
            Alunos
          </h1>
          <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
            <StatPill value={alunos.length} label="total"    color="#6366f1" />
            <StatPill value={ativos}        label="ativos"   color="#22c55e" />
            {inativos > 0 && <StatPill value={inativos} label="inativos" color="#f97316" />}
          </div>
        </div>
        <motion.button
          whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
          className="btn-primary"
          style={{ display:'inline-flex', alignItems:'center', gap:7, height:42, paddingLeft:18, paddingRight:18, borderRadius:13, fontSize:14 }}
          onClick={() => setShowModal(true)}
        >
          <UserPlus style={{ width:15, height:15 }} /> Novo aluno
        </motion.button>
      </motion.div>

      {/* ── SEARCH + VIEW TOGGLE ────────────────────────────────────── */}
      <div style={{ display:'flex', gap:10, alignItems:'center' }}>
        <div style={{ position:'relative', flex:1 }}>
          <Search style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', width:16, height:16, color:'rgba(255,255,255,0.28)', pointerEvents:'none' }} />
          <input
            className="input"
            style={{ paddingLeft:44, height:44, borderRadius:13, fontSize:14, background:'rgba(255,255,255,0.03)' }}
            placeholder="Buscar por nome ou e-mail..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.4)', display:'flex', padding:4 }}>
              <X style={{ width:14, height:14 }} />
            </button>
          )}
        </div>

        {/* View toggle */}
        <div style={{ display:'flex', borderRadius:11, overflow:'hidden', border:'1px solid rgba(255,255,255,0.07)', background:'rgba(255,255,255,0.03)', flexShrink:0 }}>
          {[{ mode:'grid', Icon:LayoutGrid }, { mode:'list', Icon:List }].map(({ mode, Icon }) => (
            <button key={mode} onClick={() => setViewMode(mode)} style={{
              width:44, height:44,
              background: viewMode === mode ? 'rgba(232,52,43,0.12)' : 'transparent',
              color: viewMode === mode ? '#E8342B' : 'rgba(255,255,255,0.35)',
              cursor:'pointer', border:'none',
              borderLeft: mode === 'list' ? '1px solid rgba(255,255,255,0.07)' : 'none',
              display:'flex', alignItems:'center', justifyContent:'center',
              transition:'all 0.15s',
            }}>
              <Icon style={{ width:16, height:16 }} />
            </button>
          ))}
        </div>
      </div>

      {/* ── FILTER CHIPS ────────────────────────────────────────────── */}
      {chipsObjetivo.length > 0 && (
        <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
          {['Todos', ...chipsObjetivo].map(obj => {
            const active = obj === 'Todos' ? !filtroObjetivo : filtroObjetivo === obj
            return (
              <button
                key={obj}
                onClick={() => setFiltro(obj === 'Todos' ? '' : (filtroObjetivo === obj ? '' : obj))}
                style={{
                  padding:'5px 14px', borderRadius:20, fontSize:12, fontWeight:700,
                  cursor:'pointer', border:'1px solid', transition:'all 0.15s',
                  borderColor: active ? 'rgba(232,52,43,0.35)' : 'rgba(255,255,255,0.08)',
                  background: active ? 'rgba(232,52,43,0.1)' : 'rgba(255,255,255,0.03)',
                  color: active ? '#fca5a5' : 'rgba(255,255,255,0.45)',
                  boxShadow: active ? '0 0 14px rgba(232,52,43,0.12)' : 'none',
                }}
              >
                {obj}
              </button>
            )
          })}
        </div>
      )}

      {/* ── CONTENT ─────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => <SkeletonCard key={i} />)}
        </div>

      ) : filtered.length === 0 ? (
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'80px 24px', gap:14, textAlign:'center', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:20, boxShadow:'inset 0 1px 0 rgba(255,255,255,0.04)' }}>
          <div style={{ width:60, height:60, borderRadius:20, background:'rgba(232,52,43,0.08)', border:'1px solid rgba(232,52,43,0.18)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <UserPlus style={{ width:28, height:28, color:'#E8342B' }} />
          </div>
          <div>
            <p style={{ fontSize:16, fontWeight:900, color:'#F4F4F5', letterSpacing:'-0.04em', marginBottom:6 }}>
              {search ? 'Nenhum aluno encontrado' : 'Nenhum aluno ainda'}
            </p>
            <p style={{ fontSize:13, color:'rgba(255,255,255,0.38)', lineHeight:1.6 }}>
              {search ? `Sem resultados para "${search}". Tente outro nome.` : 'Cadastre seu primeiro aluno para começar.'}
            </p>
          </div>
          {!search && (
            <button className="btn-primary" style={{ marginTop:4, height:42, paddingLeft:20, paddingRight:20, borderRadius:12 }} onClick={() => setShowModal(true)}>
              <UserPlus style={{ width:14, height:14 }} /> Cadastrar aluno
            </button>
          )}
        </div>

      ) : viewMode === 'grid' ? (
        /* ── GRID VIEW ──────────────────────────────────────────────── */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
          {filtered.map((a, i) => {
            const c = nameColor(a.nome)
            return (
              <motion.div
                key={a.id}
                initial={{ opacity:0, y:16 }}
                animate={{ opacity:1, y:0 }}
                exit={{ opacity:0, scale:0.95 }}
                transition={{ delay: Math.min(i * 0.04, 0.32), duration:0.42, ease:[0.16,1,0.3,1] }}
                whileHover={{ y:-4, boxShadow:`inset 0 1px 0 rgba(255,255,255,0.07), 0 16px 40px -8px rgba(0,0,0,0.55), 0 0 0 1px ${c}20` }}
              >
              <Link
                to={`/alunos/${a.id}`}
                style={{
                  textDecoration: 'none', display: 'block',
                  background: `radial-gradient(ellipse at 95% 0%, ${c}0e 0%, transparent 55%), #111113`,
                  border: `1px solid rgba(255,255,255,0.07)`,
                  borderRadius: 18,
                  padding: '18px 18px 14px',
                  transition: 'border-color 220ms ease',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
                  position: 'relative', overflow: 'hidden',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = `${c}22` }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)' }}
              >
                {/* Top glow orb */}
                <div style={{ position:'absolute', top:-40, right:-30, width:100, height:100, borderRadius:'50%', background:`${c}0a`, filter:'blur(24px)', pointerEvents:'none' }} />

                {/* Card header */}
                <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14, position:'relative' }}>
                  <div style={{ position:'relative' }}>
                    <Avatar nome={a.nome} size={44} />
                    <div style={{ position:'absolute', bottom:1, right:1, width:10, height:10, borderRadius:'50%', background: a.ativo !== false ? '#22c55e' : '#f97316', border:'1.5px solid #111113', boxShadow:`0 0 6px ${a.ativo !== false ? '#22c55e' : '#f97316'}` }} />
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:2 }}>
                      {pinnedIds.includes(a.id) && <Pin style={{ width:10, height:10, color:'#E8342B', flexShrink:0 }} />}
                      <div style={{ fontSize:14, fontWeight:800, color:'#F4F4F5', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', letterSpacing:'-0.02em' }}>
                        {a.nome}
                      </div>
                    </div>
                    <div style={{ fontSize:11, color:'rgba(255,255,255,0.35)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{a.email}</div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:4, flexShrink:0 }}>
                    <button
                      onClick={e => togglePin(e, a.id)}
                      title={pinnedIds.includes(a.id) ? 'Desafixar' : 'Fixar'}
                      style={{ background:'none', border:'none', cursor:'pointer', padding:4, color: pinnedIds.includes(a.id) ? '#E8342B' : 'rgba(255,255,255,0.25)', transition:'color 0.15s' }}
                    >
                      {pinnedIds.includes(a.id) ? <PinOff style={{ width:12, height:12 }} /> : <Pin style={{ width:12, height:12 }} />}
                    </button>
                    <ChevronRight style={{ width:15, height:15, color:'rgba(255,255,255,0.22)', transition:'color 0.15s' }} />
                  </div>
                </div>

                {/* Divider */}
                <div style={{ height:'1px', background:'rgba(255,255,255,0.04)', marginBottom:11 }} />

                {/* Badges */}
                <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' }}>
                  {a.ativo !== false ? (
                    <span style={{ fontSize:10, padding:'2px 8px', borderRadius:999, background:'rgba(34,197,94,0.08)', color:'#4ade80', fontWeight:700, border:'1px solid rgba(34,197,94,0.2)' }}>Ativo</span>
                  ) : (
                    <span style={{ fontSize:10, padding:'2px 8px', borderRadius:999, background:'rgba(249,115,22,0.08)', color:'#fb923c', fontWeight:700, border:'1px solid rgba(249,115,22,0.2)' }}>Inativo</span>
                  )}
                  {a.objetivo && (
                    <span style={{ fontSize:10, padding:'2px 8px', borderRadius:999, background:`${c}10`, color:c, fontWeight:700, border:`1px solid ${c}22`, maxWidth:120, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {a.objetivo}
                    </span>
                  )}
                  {a.tem_debito && (
                    <span style={{ fontSize:10, padding:'2px 8px', borderRadius:999, background:'rgba(232,52,43,0.09)', color:'#FF8078', fontWeight:700, border:'1px solid rgba(232,52,43,0.22)' }}>⚠ Débito</span>
                  )}
                  {a.streak_atual > 0 && (
                    <span style={{ fontSize:10, padding:'2px 8px', borderRadius:999, background:'rgba(249,115,22,0.08)', color:'#fb923c', fontWeight:700, border:'1px solid rgba(249,115,22,0.2)' }}>🔥 {a.streak_atual}d</span>
                  )}
                </div>
              </Link>
              </motion.div>
            )
          })}
          </AnimatePresence>
        </div>

      ) : (
        /* ── LIST VIEW ──────────────────────────────────────────────── */
        <div style={{ background:'#141416', border:'1px solid rgba(255,255,255,0.06)', borderRadius:20, overflow:'hidden', boxShadow:'inset 0 1px 0 rgba(255,255,255,0.05)' }}>
          {filtered.map((a, i) => {
            const c = nameColor(a.nome)
            return (
              <Link
                key={a.id}
                to={`/alunos/${a.id}`}
                className="stagger-item"
                style={{
                  display:'flex', alignItems:'center', gap:13,
                  padding:'13px 18px', textDecoration:'none',
                  borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                  transition:'background 0.15s',
                  animationDelay: `${i * 0.03}s`,
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.025)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
              >
                <div style={{ position:'relative', flexShrink:0 }}>
                  <Avatar nome={a.nome} size={38} />
                  <div style={{ position:'absolute', bottom:0, right:0, width:9, height:9, borderRadius:'50%', background: a.ativo !== false ? '#22c55e' : '#f97316', border:'1.5px solid #111113' }} />
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:2 }}>
                    <span style={{ fontSize:13, fontWeight:800, color:'#F4F4F5', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', letterSpacing:'-0.01em' }}>{a.nome}</span>
                    {a.tem_debito && <span style={{ fontSize:10, padding:'1px 6px', borderRadius:999, background:'rgba(232,52,43,0.1)', color:'#FF8078', fontWeight:700, flexShrink:0, border:'1px solid rgba(232,52,43,0.22)' }}>⚠</span>}
                    {a.streak_atual > 0 && <span style={{ fontSize:10, padding:'1px 6px', borderRadius:999, background:'rgba(249,115,22,0.08)', color:'#fb923c', fontWeight:700, flexShrink:0 }}>🔥</span>}
                  </div>
                  <div style={{ fontSize:11, color:'rgba(255,255,255,0.35)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{a.email}</div>
                </div>
                {a.objetivo && (
                  <span style={{ fontSize:11, padding:'3px 10px', borderRadius:999, background:`${c}0f`, color:c, fontWeight:700, border:`1px solid ${c}22`, flexShrink:0, maxWidth:110, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {a.objetivo}
                  </span>
                )}
                {pinnedIds.includes(a.id) && <Pin style={{ width:11, height:11, color:'#E8342B', flexShrink:0 }} />}
                <ChevronRight style={{ width:15, height:15, color:'rgba(255,255,255,0.22)', flexShrink:0 }} />
              </Link>
            )
          })}
        </div>
      )}

      {showModal && <ModalCriar onClose={() => setShowModal(false)} />}
    </div>
  )
}
