import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { listarAlunos, criarAluno } from '../api'
import toast from 'react-hot-toast'
import { UserPlus, Search, ArrowRight, X, Mail, User, Target, LayoutGrid, List, Pin, PinOff } from 'lucide-react'
import { SkeletonCard } from '../components/ui/Skeleton'
import { useDebounce } from '../hooks/useDebounce'
import { useLocalStorage } from '../hooks/useLocalStorage'

function Avatar({ nome, size = 'md' }) {
  const initials = nome?.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
  const px = size === 'lg' ? 48 : 40
  return (
    <div style={{ width: px, height: px, borderRadius: '50%', background: 'var(--bg-elevated)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: px * 0.36, fontWeight: 600, color: 'var(--text-secondary)', flexShrink: 0 }}>
      {initials}
    </div>
  )
}

function ModalCriar({ onClose }) {
  const qc = useQueryClient()
  const [form, setForm] = useState({ nome: '', email: '', objetivo: '' })
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const { mutate, isPending } = useMutation({
    mutationFn: criarAluno,
    onMutate: async (novo) => {
      await qc.cancelQueries({ queryKey: ['alunos'] })
      const prev = qc.getQueryData(['alunos'])
      qc.setQueryData(['alunos'], (old = []) => [
        ...old,
        { id: `temp-${Date.now()}`, ...novo, _optimistic: true },
      ])
      return { prev }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['alunos'] }); toast.success('Aluno criado!'); onClose() },
    onError: (err, _, ctx) => {
      if (ctx?.prev) qc.setQueryData(['alunos'], ctx.prev)
      toast.error(err.response?.data?.detail || 'Não foi possível criar o aluno. Tente novamente.')
    },
  })

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
      <div style={{ width: '100%', maxWidth: 400, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, boxShadow: 'var(--shadow-xl)' }} className="animate-scale-in">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Novo aluno</h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>Preencha as informações básicas</p>
          </div>
          <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-elevated)', border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X style={{ width: 14, height: 14 }} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { k: 'nome',     icon: User,   type: 'text',  label: 'Nome completo *', ph: 'João da Silva'      },
            { k: 'email',    icon: Mail,   type: 'email', label: 'E-mail *',         ph: 'joao@email.com'     },
            { k: 'objetivo', icon: Target, type: 'text',  label: 'Objetivo',         ph: 'Ex: perder peso...' },
          ].map(({ k, icon: Icon, type, label, ph }) => (
            <div key={k}>
              <label className="label">{label}</label>
              <div style={{ position: 'relative' }}>
                <Icon style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: 'var(--text-disabled)' }} />
                <input className="input" style={{ paddingLeft: 36 }} type={type} placeholder={ph} value={form[k]} onChange={set(k)} />
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button className="btn-secondary" style={{ flex: 1 }} onClick={onClose}>Cancelar</button>
          <button className="btn-primary" style={{ flex: 1 }} disabled={isPending || !form.nome || !form.email} onClick={() => mutate(form)}>
            {isPending ? <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} /> : 'Criar aluno'}
          </button>
        </div>
      </div>
    </div>
  )
}

const OBJETIVOS_LABELS = ['Perder peso', 'Ganhar massa', 'Condicionamento', 'Reabilitação', 'Definição', 'Saúde']

export default function Alunos() {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 280)
  const [filtroObjetivo, setFiltroObjetivo] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [viewMode, setViewMode] = useState('grid')
  const [pinnedIds, setPinnedIds] = useLocalStorage('MegaUp-pinned-alunos', [])

  const togglePin = (e, id) => {
    e.preventDefault(); e.stopPropagation()
    setPinnedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const { data: alunos = [], isLoading } = useQuery({
    queryKey: ['alunos'],
    queryFn: () => listarAlunos().then((r) => r.data),
    staleTime: 5 * 60_000,
    placeholderData: (prev) => prev,
  })

  const objetivosUsados = [...new Set(alunos.map(a => a.objetivo).filter(Boolean))]
  const chipsObjetivo = OBJETIVOS_LABELS.filter(l =>
    objetivosUsados.some(o => o.toLowerCase().includes(l.toLowerCase()))
  )

  const filtered = alunos
    .filter((a) => {
      const matchSearch = a.nome?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                          a.email?.toLowerCase().includes(debouncedSearch.toLowerCase())
      const matchObjetivo = !filtroObjetivo ||
        a.objetivo?.toLowerCase().includes(filtroObjetivo.toLowerCase())
      return matchSearch && matchObjetivo
    })
    .sort((a, b) => {
      const pa = pinnedIds.includes(a.id) ? 0 : 1
      const pb = pinnedIds.includes(b.id) ? 0 : 1
      return pa - pb
    })

  return (
    <div className="space-y-6 animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 2 }}>Alunos</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{alunos.length} aluno{alunos.length !== 1 ? 's' : ''} cadastrado{alunos.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }} onClick={() => setShowModal(true)}>
          <UserPlus style={{ width: 14, height: 14 }} /> Novo aluno
        </button>
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: 'var(--text-disabled)' }} />
          <input className="input" style={{ paddingLeft: 36 }} placeholder="Buscar por nome ou e-mail..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)' }}>
          {[{ mode: 'grid', Icon: LayoutGrid }, { mode: 'list', Icon: List }].map(({ mode, Icon }) => (
            <button key={mode} onClick={() => setViewMode(mode)}
              style={{ padding: '0 10px', background: viewMode === mode ? 'var(--bg-elevated)' : 'transparent', color: viewMode === mode ? 'var(--text-secondary)' : 'var(--text-disabled)', cursor: 'pointer', border: 'none', borderLeft: mode === 'list' ? '1px solid var(--border)' : 'none', display: 'flex', alignItems: 'center' }}>
              <Icon style={{ width: 15, height: 15 }} />
            </button>
          ))}
        </div>
      </div>

      {chipsObjetivo.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {['Todos', ...chipsObjetivo].map(obj => {
            const active = obj === 'Todos' ? !filtroObjetivo : filtroObjetivo === obj
            return (
              <button key={obj}
                onClick={() => setFiltroObjetivo(obj === 'Todos' ? '' : (filtroObjetivo === obj ? '' : obj))}
                style={{ padding: '4px 12px', borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: 'pointer', border: '1px solid', transition: 'all 0.1s', borderColor: active ? '#ef4444' : 'var(--border)', background: active ? 'rgba(99,102,241,0.12)' : 'transparent', color: active ? '#fca5a5' : 'var(--text-muted)' }}>
                {obj}
              </button>
            )
          })}
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-icon"><UserPlus style={{ width: 28, height: 28, color: 'var(--text-muted)' }} /></div>
          <p className="empty-title">{search ? 'Nenhum aluno encontrado' : 'Nenhum aluno ainda'}</p>
          <p className="empty-message">{search ? `Nenhum resultado para "${search}"` : 'Cadastre seu primeiro aluno para começar.'}</p>
          {!search && <button className="btn-primary" onClick={() => setShowModal(true)}>Cadastrar aluno</button>}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((a, i) => (
            <Link key={a.id} to={`/alunos/${a.id}`} className="card-interactive stagger-item" style={{ textDecoration: 'none' }}
              onMouseEnter={e => { e.currentTarget.querySelector('.arrow-icon').style.color='#ef4444' }}
              onMouseLeave={e => { e.currentTarget.querySelector('.arrow-icon').style.color='var(--text-disabled)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <Avatar nome={a.nome} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {pinnedIds.includes(a.id) && <Pin style={{ width: 10, height: 10, color: '#ef4444', flexShrink: 0 }} />}
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.nome}</div>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 1 }}>{a.email}</div>
                </div>
                <button onClick={e => togglePin(e, a.id)} title={pinnedIds.includes(a.id) ? 'Desafixar' : 'Fixar no topo'}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: pinnedIds.includes(a.id) ? '#ef4444' : 'var(--text-disabled)', flexShrink: 0 }}>
                  {pinnedIds.includes(a.id) ? <PinOff style={{ width: 12, height: 12 }} /> : <Pin style={{ width: 12, height: 12 }} />}
                </button>
                <ArrowRight className="arrow-icon" style={{ width: 14, height: 14, color: 'var(--text-disabled)', flexShrink: 0, transition: 'color 0.1s' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
                {a.objetivo && <span className="badge-blue" style={{ fontSize: 11 }}>{a.objetivo}</span>}
                {a.tem_debito && <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 999, background: 'rgba(239,68,68,0.12)', color: '#f87171', fontWeight: 700, border: '1px solid rgba(239,68,68,0.25)' }}>⚠ Débito</span>}
                {a.streak_atual > 0 && <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 999, background: 'rgba(249,115,22,0.1)', color: '#fb923c', fontWeight: 700 }}>🔥 {a.streak_atual}d</span>}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {filtered.map((a, i) => (
            <Link key={a.id} to={`/alunos/${a.id}`}
              className="stagger-item"
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', textDecoration: 'none', borderBottom: i < filtered.length - 1 ? '1px solid var(--border-subtle)' : 'none', transition: 'background 0.1s' }}
              onMouseEnter={e => { e.currentTarget.style.background='var(--bg-hover)' }}
              onMouseLeave={e => { e.currentTarget.style.background='transparent' }}>
              <Avatar nome={a.nome} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.nome}</span>
                  {a.tem_debito && <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 999, background: 'rgba(239,68,68,0.12)', color: '#f87171', fontWeight: 700, flexShrink: 0 }}>⚠</span>}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 1 }}>{a.email}</div>
              </div>
              {a.objetivo && <span className="badge-blue" style={{ fontSize: 11 }}>{a.objetivo}</span>}
              <ArrowRight style={{ width: 13, height: 13, color: 'var(--text-disabled)', flexShrink: 0 }} />
            </Link>
          ))}
        </div>
      )}

      {showModal && <ModalCriar onClose={() => setShowModal(false)} />}
    </div>
  )
}


