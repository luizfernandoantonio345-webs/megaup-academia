import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { listarAlunos, criarAluno } from '../api'
import toast from 'react-hot-toast'
import { UserPlus, Search, ArrowRight, X, Mail, User, Target, LayoutGrid, List } from 'lucide-react'
import { SkeletonCard } from '../components/ui/Skeleton'

function Avatar({ nome, size = 'md' }) {
  const initials = nome?.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
  const sz = size === 'lg' ? 'w-12 h-12 text-base' : 'w-10 h-10 text-sm'
  return (
    <div className={`${sz} rounded-full flex items-center justify-center font-bold text-white flex-shrink-0`} style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
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
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}>
      <div className="w-full max-w-md rounded-2xl p-6 animate-scale-in" style={{ background: '#0E1525', border: '1px solid rgba(99,102,241,0.25)', boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, color: '#EFF6FF', fontSize: 17 }}>Novo aluno</h3>
            <p style={{ fontSize: 13, color: '#3D4F6A', marginTop: 2 }}>Preencha as informações básicas</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors" style={{ background: 'rgba(255,255,255,0.07)', color: '#64748B' }}>
            <X style={{ width: 15, height: 15 }} />
          </button>
        </div>

        <div className="space-y-4">
          {[
            { k: 'nome',     icon: User,   type: 'text',  label: 'Nome completo *', ph: 'João da Silva'       },
            { k: 'email',    icon: Mail,   type: 'email', label: 'E-mail *',         ph: 'joao@email.com'      },
            { k: 'objetivo', icon: Target, type: 'text',  label: 'Objetivo',         ph: 'Ex: perder peso...'  },
          ].map(({ k, icon: Icon, type, label, ph }) => (
            <div key={k}>
              <label className="label">{label}</label>
              <div className="relative">
                <Icon style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: '#3D4F6A' }} />
                <input className="input pl-11" type={type} placeholder={ph} value={form[k]} onChange={set(k)} />
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3 mt-6">
          <button className="btn-secondary flex-1" onClick={onClose}>Cancelar</button>
          <button className="btn-gradient flex-1" disabled={isPending || !form.nome || !form.email} onClick={() => mutate(form)}>
            {isPending ? <span className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} /> : 'Criar aluno'}
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
      <div className="page-header">
        <div>
          <h1 className="page-title">Alunos</h1>
          <p className="page-subtitle">{alunos.length} aluno{alunos.length !== 1 ? 's' : ''} cadastrado{alunos.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn-gradient" onClick={() => setShowModal(true)}>
          <UserPlus style={{ width: 16, height: 16 }} /> Novo aluno
        </button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#3D4F6A' }} />
          <input className="input pl-11" placeholder="Buscar por nome ou e-mail..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
          {[{ mode: 'grid', Icon: LayoutGrid }, { mode: 'list', Icon: List }].map(({ mode, Icon }) => (
            <button key={mode} onClick={() => setViewMode(mode)} className="px-3 py-2 transition-colors"
              style={{ background: viewMode === mode ? 'rgba(99,102,241,0.2)' : 'transparent', color: viewMode === mode ? '#a5b4fc' : '#3D4F6A', borderLeft: mode === 'list' ? '1px solid rgba(255,255,255,0.07)' : 'none' }}>
              <Icon style={{ width: 16, height: 16 }} />
            </button>
          ))}
        </div>
      </div>

      {chipsObjetivo.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <button
            onClick={() => setFiltroObjetivo('')}
            style={{ padding: '5px 14px', borderRadius: 999, fontSize: 12, fontWeight: 700, cursor: 'pointer', border: '1px solid', transition: 'all 0.15s', borderColor: !filtroObjetivo ? '#6366f1' : 'rgba(255,255,255,0.08)', background: !filtroObjetivo ? 'rgba(99,102,241,0.15)' : 'transparent', color: !filtroObjetivo ? '#a5b4fc' : '#3D4F6A' }}
          >
            Todos
          </button>
          {chipsObjetivo.map(obj => (
            <button
              key={obj}
              onClick={() => setFiltroObjetivo(filtroObjetivo === obj ? '' : obj)}
              style={{ padding: '5px 14px', borderRadius: 999, fontSize: 12, fontWeight: 700, cursor: 'pointer', border: '1px solid', transition: 'all 0.15s', borderColor: filtroObjetivo === obj ? '#6366f1' : 'rgba(255,255,255,0.08)', background: filtroObjetivo === obj ? 'rgba(99,102,241,0.15)' : 'transparent', color: filtroObjetivo === obj ? '#a5b4fc' : '#3D4F6A' }}
            >
              {obj}
            </button>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-icon"><UserPlus style={{ width: 28, height: 28, color: '#4B5768' }} /></div>
          <p className="empty-title">{search ? 'Nenhum aluno encontrado' : 'Nenhum aluno ainda'}</p>
          <p className="empty-message">{search ? `Nenhum resultado para "${search}"` : 'Cadastre seu primeiro aluno para começar.'}</p>
          {!search && <button className="btn-gradient" onClick={() => setShowModal(true)}>Cadastrar aluno</button>}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((a, i) => (
            <Link key={a.id} to={`/alunos/${a.id}`} className="card-interactive group" style={{ animationDelay: `${i * 35}ms` }}>
              <div className="flex items-center gap-3 mb-3">
                <Avatar nome={a.nome} />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate" style={{ color: '#CBD5E1', fontFamily: 'Space Grotesk, sans-serif' }}>{a.nome}</div>
                  <div className="text-xs truncate" style={{ color: '#3D4F6A' }}>{a.email}</div>
                </div>
                <ArrowRight style={{ width: 15, height: 15, color: '#1F2D4A', flexShrink: 0, transition: 'all 0.2s' }} className="group-hover:text-indigo-400 group-hover:translate-x-1" />
              </div>
              {a.objetivo && <span className="badge-blue text-xs">{a.objetivo}</span>}
            </Link>
          ))}
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          {filtered.map((a, i) => (
            <Link key={a.id} to={`/alunos/${a.id}`} className="flex items-center gap-4 px-5 py-4 group transition-colors"
              style={{ borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
              onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.03)'}
              onMouseLeave={e => e.currentTarget.style.background='transparent'}
            >
              <Avatar nome={a.nome} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate" style={{ color: '#CBD5E1' }}>{a.nome}</div>
                <div className="text-xs truncate" style={{ color: '#3D4F6A' }}>{a.email}</div>
              </div>
              {a.objetivo && <span className="badge-blue hidden sm:inline-flex">{a.objetivo}</span>}
              <ArrowRight style={{ width: 14, height: 14, color: '#1F2D4A', flexShrink: 0 }} />
            </Link>
          ))}
        </div>
      )}

      {showModal && <ModalCriar onClose={() => setShowModal(false)} />}
    </div>
  )
}
