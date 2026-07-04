import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { listarAlunos, criarAluno } from '../api'
import toast from 'react-hot-toast'
import { UserPlus, Search, ArrowRight, X, Mail, User, Target, LayoutGrid, List } from 'lucide-react'
import { SkeletonCard } from '../components/ui/Skeleton'

function Avatar({ nome, size = 'md' }) {
  const initials = nome?.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
  const px = size === 'lg' ? 48 : 40
  return (
    <div style={{ width: px, height: px, borderRadius: '50%', background: '#1C1C1E', border: '1px solid #27272A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: px * 0.36, fontWeight: 600, color: '#A1A1AA', flexShrink: 0 }}>
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
      <div style={{ width: '100%', maxWidth: 400, background: '#111113', border: '1px solid #27272A', borderRadius: 12, padding: 24, boxShadow: '0 20px 40px rgba(0,0,0,0.6)' }} className="animate-scale-in">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: '#F4F4F5', margin: 0 }}>Novo aluno</h3>
            <p style={{ fontSize: 12, color: '#71717A', marginTop: 3 }}>Preencha as informações básicas</p>
          </div>
          <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1C1C1E', border: '1px solid #27272A', cursor: 'pointer', color: '#71717A' }}>
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
                <Icon style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: '#52525B' }} />
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
  const [filtroObjetivo, setFiltroObjetivo] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [viewMode, setViewMode] = useState('grid')

  const { data: alunos = [], isLoading } = useQuery({
    queryKey: ['alunos'],
    queryFn: () => listarAlunos().then((r) => r.data),
  })

  const objetivosUsados = [...new Set(alunos.map(a => a.objetivo).filter(Boolean))]
  const chipsObjetivo = OBJETIVOS_LABELS.filter(l =>
    objetivosUsados.some(o => o.toLowerCase().includes(l.toLowerCase()))
  )

  const filtered = alunos.filter((a) => {
    const matchSearch = a.nome?.toLowerCase().includes(search.toLowerCase()) ||
                        a.email?.toLowerCase().includes(search.toLowerCase())
    const matchObjetivo = !filtroObjetivo ||
      a.objetivo?.toLowerCase().includes(filtroObjetivo.toLowerCase())
    return matchSearch && matchObjetivo
  })

  return (
    <div className="space-y-6 animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 600, color: '#F4F4F5', letterSpacing: '-0.02em', marginBottom: 2 }}>Alunos</h1>
          <p style={{ fontSize: 13, color: '#71717A' }}>{alunos.length} aluno{alunos.length !== 1 ? 's' : ''} cadastrado{alunos.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }} onClick={() => setShowModal(true)}>
          <UserPlus style={{ width: 14, height: 14 }} /> Novo aluno
        </button>
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: '#52525B' }} />
          <input className="input" style={{ paddingLeft: 36 }} placeholder="Buscar por nome ou e-mail..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', border: '1px solid #27272A' }}>
          {[{ mode: 'grid', Icon: LayoutGrid }, { mode: 'list', Icon: List }].map(({ mode, Icon }) => (
            <button key={mode} onClick={() => setViewMode(mode)}
              style={{ padding: '0 10px', background: viewMode === mode ? '#1C1C1E' : 'transparent', color: viewMode === mode ? '#A1A1AA' : '#52525B', cursor: 'pointer', border: 'none', borderLeft: mode === 'list' ? '1px solid #27272A' : 'none', display: 'flex', alignItems: 'center' }}>
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
                style={{ padding: '4px 12px', borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: 'pointer', border: '1px solid', transition: 'all 0.1s', borderColor: active ? '#6366f1' : '#27272A', background: active ? 'rgba(99,102,241,0.12)' : 'transparent', color: active ? '#a5b4fc' : '#71717A' }}>
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
          <div className="empty-icon"><UserPlus style={{ width: 28, height: 28, color: '#71717A' }} /></div>
          <p className="empty-title">{search ? 'Nenhum aluno encontrado' : 'Nenhum aluno ainda'}</p>
          <p className="empty-message">{search ? `Nenhum resultado para "${search}"` : 'Cadastre seu primeiro aluno para começar.'}</p>
          {!search && <button className="btn-primary" onClick={() => setShowModal(true)}>Cadastrar aluno</button>}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((a, i) => (
            <Link key={a.id} to={`/alunos/${a.id}`} className="card-interactive" style={{ textDecoration: 'none', animationDelay: `${i * 35}ms` }}
              onMouseEnter={e => { e.currentTarget.querySelector('.arrow-icon').style.color='#6366f1' }}
              onMouseLeave={e => { e.currentTarget.querySelector('.arrow-icon').style.color='#52525B' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <Avatar nome={a.nome} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#F4F4F5', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.nome}</div>
                  <div style={{ fontSize: 11, color: '#71717A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 1 }}>{a.email}</div>
                </div>
                <ArrowRight className="arrow-icon" style={{ width: 14, height: 14, color: '#52525B', flexShrink: 0, transition: 'color 0.1s' }} />
              </div>
              {a.objetivo && <span className="badge-blue" style={{ fontSize: 11 }}>{a.objetivo}</span>}
            </Link>
          ))}
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {filtered.map((a, i) => (
            <Link key={a.id} to={`/alunos/${a.id}`}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', textDecoration: 'none', borderBottom: i < filtered.length - 1 ? '1px solid #1C1C1E' : 'none', transition: 'background 0.1s' }}
              onMouseEnter={e => { e.currentTarget.style.background='#161618' }}
              onMouseLeave={e => { e.currentTarget.style.background='transparent' }}>
              <Avatar nome={a.nome} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#F4F4F5', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.nome}</div>
                <div style={{ fontSize: 11, color: '#71717A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 1 }}>{a.email}</div>
              </div>
              {a.objetivo && <span className="badge-blue" style={{ fontSize: 11 }}>{a.objetivo}</span>}
              <ArrowRight style={{ width: 13, height: 13, color: '#52525B', flexShrink: 0 }} />
            </Link>
          ))}
        </div>
      )}

      {showModal && <ModalCriar onClose={() => setShowModal(false)} />}
    </div>
  )
}
