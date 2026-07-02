import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { listarAlunos, criarAluno } from '../api'
import toast from 'react-hot-toast'
import { UserPlus, Search, ArrowRight, Loader2, X } from 'lucide-react'

function Avatar({ nome }) {
  const initials = nome?.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
  return (
    <div className="w-10 h-10 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold text-sm">
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
      toast.success('Aluno criado!')
      onClose()
    },
    onError: (err) => toast.error(err.response?.data?.detail || 'Erro'),
  })

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">Novo aluno</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
        </div>
        <div className="space-y-3">
          <input className="input" placeholder="Nome completo" value={form.nome} onChange={set('nome')} required />
          <input className="input" type="email" placeholder="E-mail" value={form.email} onChange={set('email')} required />
          <input className="input" placeholder="Objetivo (ex: perder peso)" value={form.objetivo} onChange={set('objetivo')} />
        </div>
        <div className="flex gap-3 mt-5">
          <button className="btn-secondary flex-1" onClick={onClose}>Cancelar</button>
          <button
            className="btn-primary flex-1"
            disabled={isPending || !form.nome || !form.email}
            onClick={() => mutate(form)}
          >
            {isPending ? 'Criando...' : 'Criar aluno'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Alunos() {
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)

  const { data: alunos = [], isLoading } = useQuery({
    queryKey: ['alunos'],
    queryFn: () => listarAlunos().then((r) => r.data),
  })

  const filtered = alunos.filter(
    (a) => a.nome.toLowerCase().includes(search.toLowerCase()) ||
            a.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Alunos</h1>
          <p className="text-gray-500">{alunos.length} aluno{alunos.length !== 1 ? 's' : ''} cadastrado{alunos.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => setShowModal(true)}>
          <UserPlus className="w-4 h-4" />
          Novo aluno
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          className="input pl-9"
          placeholder="Buscar por nome ou e-mail..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-400 mb-4">
            {search ? 'Nenhum aluno encontrado para essa busca.' : 'Nenhum aluno cadastrado ainda.'}
          </p>
          {!search && (
            <button className="btn-primary" onClick={() => setShowModal(true)}>
              Cadastrar primeiro aluno
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((a) => (
            <Link
              key={a.id}
              to={`/alunos/${a.id}`}
              className="card hover:shadow-md transition-shadow flex items-center gap-4"
            >
              <Avatar nome={a.nome} />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900 truncate">{a.nome}</div>
                <div className="text-sm text-gray-500 truncate">{a.email}</div>
                {a.objetivo && (
                  <div className="text-xs text-primary-600 mt-0.5 truncate">{a.objetivo}</div>
                )}
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
            </Link>
          ))}
        </div>
      )}

      {showModal && <ModalCriar onClose={() => setShowModal(false)} />}
    </div>
  )
}
