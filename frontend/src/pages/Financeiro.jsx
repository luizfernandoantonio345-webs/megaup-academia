import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import {
  listarPlanos, criarPlano, inativarPlano,
  listarCobrancas, criarCobranca, marcarPago,
  resumoFinanceiro, listarAlunos,
} from '../api'
import { DollarSign, Plus, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react'

function StatusBadge({ status }) {
  const map = {
    pago: 'bg-green-100 text-green-800',
    pendente: 'bg-yellow-100 text-yellow-800',
    vencido: 'bg-red-100 text-red-800',
    cancelado: 'bg-gray-100 text-gray-600',
  }
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${map[status] || 'bg-gray-100'}`}>
      {status}
    </span>
  )
}

function CardResumo({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white rounded-xl shadow p-5 flex items-center gap-4">
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  )
}

export default function Financeiro() {
  const qc = useQueryClient()
  const [tab, setTab] = useState('cobrancas')
  const [showPlanoForm, setShowPlanoForm] = useState(false)
  const [showCobForm, setShowCobForm] = useState(false)
  const [planoForm, setPlanoForm] = useState({ aluno_id: '', nome: '', valor: '', dia_vencimento: '10' })
  const [cobForm, setCobForm] = useState({ plano_id: '', vencimento: '' })

  const { data: resumo } = useQuery({ queryKey: ['resumo'], queryFn: () => resumoFinanceiro().then(r => r.data) })
  const { data: planos = [] } = useQuery({ queryKey: ['planos'], queryFn: () => listarPlanos().then(r => r.data) })
  const { data: cobrancas = [] } = useQuery({ queryKey: ['cobrancas'], queryFn: () => listarCobrancas().then(r => r.data) })
  const { data: alunos = [] } = useQuery({ queryKey: ['alunos'], queryFn: () => listarAlunos().then(r => r.data) })

  const mutCriarPlano = useMutation({
    mutationFn: criarPlano,
    onSuccess: () => { toast.success('Plano criado!'); qc.invalidateQueries(['planos', 'resumo']); setShowPlanoForm(false) },
    onError: (e) => toast.error(e.response?.data?.detail || 'Erro ao criar plano'),
  })

  const mutInativarPlano = useMutation({
    mutationFn: inativarPlano,
    onSuccess: () => { toast.success('Plano inativado'); qc.invalidateQueries(['planos', 'resumo']) },
  })

  const mutCriarCob = useMutation({
    mutationFn: criarCobranca,
    onSuccess: () => { toast.success('Cobrança gerada!'); qc.invalidateQueries(['cobrancas', 'resumo']); setShowCobForm(false) },
    onError: (e) => toast.error(e.response?.data?.detail || 'Erro ao gerar cobrança'),
  })

  const mutPagar = useMutation({
    mutationFn: (id) => marcarPago(id),
    onSuccess: () => { toast.success('Marcado como pago!'); qc.invalidateQueries(['cobrancas', 'resumo']) },
  })

  const submitPlano = (e) => {
    e.preventDefault()
    mutCriarPlano.mutate({
      aluno_id: Number(planoForm.aluno_id),
      nome: planoForm.nome,
      valor: parseFloat(planoForm.valor),
      dia_vencimento: Number(planoForm.dia_vencimento),
    })
  }

  const submitCob = (e) => {
    e.preventDefault()
    mutCriarCob.mutate({
      plano_id: Number(cobForm.plano_id),
      vencimento: new Date(cobForm.vencimento).toISOString(),
    })
  }

  const fmt = (v) => `R$ ${Number(v).toFixed(2).replace('.', ',')}`
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('pt-BR') : '—'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Financeiro</h1>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <CardResumo icon={TrendingUp} label="Receita mensal prevista" value={fmt(resumo?.receita_mensal_prevista ?? 0)} color="bg-green-500" />
        <CardResumo icon={DollarSign} label="Alunos com plano" value={resumo?.total_alunos_com_plano ?? 0} color="bg-blue-500" />
        <CardResumo icon={AlertCircle} label="Inadimplentes" value={resumo?.inadimplentes ?? 0} color="bg-red-500" />
        <CardResumo icon={DollarSign} label="Valor inadimplente" value={fmt(resumo?.valor_inadimplente ?? 0)} color="bg-orange-500" />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {['cobrancas', 'planos'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize border-b-2 -mb-px transition-colors ${tab === t ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            {t === 'cobrancas' ? 'Cobranças' : 'Planos'}
          </button>
        ))}
      </div>

      {/* Tab: Cobranças */}
      {tab === 'cobrancas' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setShowCobForm(v => !v)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" /> Nova cobrança
            </button>
          </div>

          {showCobForm && (
            <form onSubmit={submitCob} className="bg-white rounded-xl shadow p-5 space-y-3">
              <h3 className="font-semibold text-gray-700">Gerar cobrança</h3>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Plano</label>
                <select
                  value={cobForm.plano_id}
                  onChange={e => setCobForm(f => ({ ...f, plano_id: e.target.value }))}
                  required
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">Selecionar plano…</option>
                  {planos.filter(p => p.status === 'ativo').map(p => (
                    <option key={p.id} value={p.id}>{p.nome} — {fmt(p.valor)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Vencimento</label>
                <input
                  type="date"
                  value={cobForm.vencimento}
                  onChange={e => setCobForm(f => ({ ...f, vencimento: e.target.value }))}
                  required
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
                  Gerar
                </button>
                <button type="button" onClick={() => setShowCobForm(false)} className="px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100">
                  Cancelar
                </button>
              </div>
            </form>
          )}

          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Aluno</th>
                  <th className="px-4 py-3 text-left">Valor</th>
                  <th className="px-4 py-3 text-left">Vencimento</th>
                  <th className="px-4 py-3 text-left">Pago em</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Link PIX</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {cobrancas.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">Nenhuma cobrança gerada ainda.</td></tr>
                )}
                {cobrancas.map(c => {
                  const aluno = alunos.find(a => a.id === c.aluno_id)
                  return (
                    <tr key={c.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-800">{aluno?.nome ?? `#${c.aluno_id}`}</td>
                      <td className="px-4 py-3 text-gray-700">{fmt(c.valor)}</td>
                      <td className="px-4 py-3 text-gray-600">{fmtDate(c.vencimento)}</td>
                      <td className="px-4 py-3 text-gray-600">{fmtDate(c.pago_em)}</td>
                      <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                      <td className="px-4 py-3">
                        {c.link_pagamento
                          ? <a href={c.link_pagamento} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-xs underline">PIX</a>
                          : <span className="text-gray-400 text-xs">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        {c.status !== 'pago' && (
                          <button
                            onClick={() => mutPagar.mutate(c.id)}
                            className="flex items-center gap-1 text-green-600 hover:text-green-800 text-xs font-medium"
                          >
                            <CheckCircle className="w-4 h-4" /> Pago
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Planos */}
      {tab === 'planos' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setShowPlanoForm(v => !v)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" /> Novo plano
            </button>
          </div>

          {showPlanoForm && (
            <form onSubmit={submitPlano} className="bg-white rounded-xl shadow p-5 space-y-3">
              <h3 className="font-semibold text-gray-700">Criar plano para aluno</h3>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Aluno</label>
                <select
                  value={planoForm.aluno_id}
                  onChange={e => setPlanoForm(f => ({ ...f, aluno_id: e.target.value }))}
                  required
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">Selecionar aluno…</option>
                  {alunos.map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-sm text-gray-600 mb-1">Nome do plano</label>
                  <input
                    value={planoForm.nome}
                    onChange={e => setPlanoForm(f => ({ ...f, nome: e.target.value }))}
                    placeholder="Ex: Mensal 3x"
                    required
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Valor (R$)</label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    value={planoForm.valor}
                    onChange={e => setPlanoForm(f => ({ ...f, valor: e.target.value }))}
                    required
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Dia de vencimento (1–28)</label>
                <input
                  type="number"
                  min="1"
                  max="28"
                  value={planoForm.dia_vencimento}
                  onChange={e => setPlanoForm(f => ({ ...f, dia_vencimento: e.target.value }))}
                  required
                  className="w-32 border rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
                  Criar plano
                </button>
                <button type="button" onClick={() => setShowPlanoForm(false)} className="px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100">
                  Cancelar
                </button>
              </div>
            </form>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            {planos.length === 0 && (
              <p className="text-gray-400 col-span-2 text-center py-8">Nenhum plano cadastrado ainda.</p>
            )}
            {planos.map(p => {
              const aluno = alunos.find(a => a.id === p.aluno_id)
              return (
                <div key={p.id} className="bg-white rounded-xl shadow p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-800">{p.nome}</p>
                      <p className="text-sm text-gray-500">{aluno?.nome ?? `Aluno #${p.aluno_id}`}</p>
                    </div>
                    <StatusBadge status={p.status} />
                  </div>
                  <div className="mt-3 flex items-end justify-between">
                    <div>
                      <p className="text-2xl font-bold text-blue-700">{fmt(p.valor)}<span className="text-sm font-normal text-gray-400">/mês</span></p>
                      <p className="text-xs text-gray-400">Vence todo dia {p.dia_vencimento}</p>
                    </div>
                    {p.status === 'ativo' && (
                      <button
                        onClick={() => mutInativarPlano.mutate(p.id)}
                        className="text-xs text-red-500 hover:underline"
                      >
                        Inativar
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
