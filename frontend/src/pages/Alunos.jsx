import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { listarAlunos, criarAluno } from '../api'
import toast from 'react-hot-toast'
import { UserPlus, Search, ArrowRight, X, Mail, User, Target, LayoutGrid, List } from 'lucide-react'
import { SkeletonCard } from '../components/ui/Skeleton'

function Avatar({ nome, size = 'md' }) {
  const initials = nome?.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
  const cl = size === 'lg'
    ? 'w-12 h-12 text-base'
    : 'w-10 h-10 text-sm'
  return (
    <div className={`${cl} bg-gradient-to-br from-primary-500 to-violet-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0`}>
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
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['alunos'] })
      toast.success('Aluno criado com sucesso!')
      onClose()
    },
    onError: (err) => toast.error(err.response?.data?.detail || 'Erro ao criar aluno'),
  })

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-glass animate-scale-in">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-bold text-lg text-gray-900">Novo aluno</h3>
            <p className="text-sm text-gray-500">Preencha as informações básicas</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="label">Nome completo *</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input className="input pl-10" placeholder="João da Silva" value={form.nome} onChange={set('nome')} required />
            </div>
          </div>
          <div>
            <label className="label">E-mail *</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input className="input pl-10" type="email" placeholder="joao@email.com" value={form.email} onChange={set('email')} required />
            </div>
          </div>
          <div>
            <label className="label">Objetivo</label>
            <div className="relative">
              <Target className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input className="input pl-10" placeholder="Ex: perder peso, ganhar massa..." value={form.objetivo} onChange={set('objetivo')} />
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button className="btn-secondary flex-1" onClick={onClose}>Cancelar</button>
          <button
            className="btn-gradient flex-1"
            disabled={isPending || !form.nome || !form.email}
            onClick={() => mutate(form)}
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Criando...
              </span>
            ) : 'Criar aluno'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Alunos() {
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [viewMode, setViewMode] = useState('grid')

  const { data: alunos = [], isLoading } = useQuery({
    queryKey: ['alunos'],
    queryFn: () => listarAlunos().then((r) => r.data),
  })

  const filtered = alunos.filter(
    (a) => a.nome.toLowerCase().includes(search.toLowerCase()) ||
            a.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Alunos</h1>
          <p className="page-subtitle">
            {alunos.length} aluno{alunos.length !== 1 ? 's' : ''} cadastrado{alunos.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button className="btn-gradient" onClick={() => setShowModal(true)}>
          <UserPlus className="w-4 h-4" />
          Novo aluno
        </button>
      </div>

      {/* Search + view toggle */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            className="input pl-10"
            placeholder="Buscar por nome ou e-mail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex rounded-xl border border-gray-200 overflow-hidden">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-2 transition-colors ${viewMode === 'grid' ? 'bg-primary-50 text-primary-600' : 'text-gray-400 hover:text-gray-600'}`}
            title="Visualização em grade"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-2 border-l border-gray-200 transition-colors ${viewMode === 'list' ? 'bg-primary-50 text-primary-600' : 'text-gray-400 hover:text-gray-600'}`}
            title="Visualização em lista"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-icon bg-primary-50">
            <UserPlus className="w-8 h-8 text-primary-400" />
          </div>
          <p className="empty-title">
            {search ? 'Nenhum aluno encontrado' : 'Nenhum aluno ainda'}
          </p>
          <p className="empty-message">
            {search
              ? `Nenhum aluno com "${search}". Tente outro termo.`
              : 'Cadastre seu primeiro aluno para começar a prescrever treinos.'}
          </p>
          {!search && (
            <button className="btn-gradient" onClick={() => setShowModal(true)}>
              Cadastrar primeiro aluno
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((a, i) => (
            <Link
              key={a.id}
              to={`/alunos/${a.id}`}
              className="card group flex flex-col gap-4 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <div className="flex items-center gap-3">
                <Avatar nome={a.nome} />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 truncate">{a.nome}</div>
                  <div className="text-xs text-gray-400 truncate">{a.email}</div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-primary-500 transition-colors flex-shrink-0" />
              </div>
              {a.objetivo && (
                <div className="flex">
                  <span className="badge-blue text-xs truncate max-w-full">{a.objetivo}</span>
                </div>
              )}
            </Link>
          ))}
        </div>
      ) : (
        <div className="card p-0 overflow-hidden divide-y divide-gray-50">
          {filtered.map((a) => (
            <Link
              key={a.id}
              to={`/alunos/${a.id}`}
              className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors group"
            >
              <Avatar nome={a.nome} />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900 truncate text-sm">{a.nome}</div>
                <div className="text-xs text-gray-400 truncate">{a.email}</div>
              </div>
              {a.objetivo && (
                <span className="badge-blue hidden sm:inline-flex">{a.objetivo}</span>
              )}
              <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-primary-500 transition-colors flex-shrink-0" />
            </Link>
          ))}
        </div>
      )}

      {showModal && <ModalCriar onClose={() => setShowModal(false)} />}
    </div>
  )
}
