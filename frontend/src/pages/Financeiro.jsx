import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  listarPlanos, criarPlano, inativarPlano,
  listarCobrancas, criarCobranca, marcarPago,
  resumoFinanceiro, listarAlunos,
} from '../api'
import {
  DollarSign, Plus, CheckCircle, AlertCircle, TrendingUp,
  X, ExternalLink, Ban, Users, Wallet,
} from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { SkeletonStatCard } from '../components/ui/Skeleton'

const fmt  = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(v) || 0)
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('pt-BR') : '—'

function StatusBadge({ status }) {
  const map = {
    pago:      'badge-green',
    pendente:  'badge-yellow',
    vencido:   'badge-red',
    cancelado: 'badge-gray',
  }
  const labels = { pago: 'Pago', pendente: 'Pendente', vencido: 'Vencido', cancelado: 'Cancelado' }
  return <span className={map[status] || 'badge-gray'}>{labels[status] || status}</span>
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-glass px-3 py-2 text-sm">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="text-emerald-600 font-bold">
          {fmt(p.value)}
        </p>
      ))}
    </div>
  )
}

export default function Financeiro() {
  const qc = useQueryClient()
  const [tab, setTab] = useState('cobrancas')
  const [showPlanoForm, setShowPlanoForm] = useState(false)
  const [showCobForm,   setShowCobForm]   = useState(false)
  const [planoForm, setPlanoForm] = useState({ aluno_id: '', nome: '', valor: '', dia_vencimento: '10' })
  const [cobForm,   setCobForm]   = useState({ plano_id: '', vencimento: '' })

  const { data: resumo, isLoading: loadingResumo } = useQuery({
    queryKey: ['resumo'],
    queryFn: () => resumoFinanceiro().then((r) => r.data),
  })
  const { data: planos    = [] } = useQuery({ queryKey: ['planos'],    queryFn: () => listarPlanos().then((r) => r.data)    })
  const { data: cobrancas = [] } = useQuery({ queryKey: ['cobrancas'], queryFn: () => listarCobrancas().then((r) => r.data) })
  const { data: alunos    = [] } = useQuery({ queryKey: ['alunos'],    queryFn: () => listarAlunos().then((r) => r.data)    })

  const mutCriarPlano   = useMutation({ mutationFn: criarPlano,    onSuccess: () => { toast.success('Plano criado!');    qc.invalidateQueries({ queryKey: ['planos'] });    qc.invalidateQueries({ queryKey: ['resumo'] });    setShowPlanoForm(false) }, onError: (e) => toast.error(e.response?.data?.detail || 'Erro') })
  const mutInativarPlano = useMutation({ mutationFn: inativarPlano, onSuccess: () => { toast.success('Plano inativado'); qc.invalidateQueries({ queryKey: ['planos'] });    qc.invalidateQueries({ queryKey: ['resumo'] }) } })
  const mutCriarCob      = useMutation({ mutationFn: criarCobranca, onSuccess: () => { toast.success('Cobrança gerada!');qc.invalidateQueries({ queryKey: ['cobrancas'] }); qc.invalidateQueries({ queryKey: ['resumo'] }); setShowCobForm(false)   }, onError: (e) => toast.error(e.response?.data?.detail || 'Erro') })
  const mutPagar         = useMutation({ mutationFn: (id) => marcarPago(id), onSuccess: () => { toast.success('Marcado como pago!'); qc.invalidateQueries({ queryKey: ['cobrancas'] }); qc.invalidateQueries({ queryKey: ['resumo'] }) } })

  const submitPlano = (e) => { e.preventDefault(); mutCriarPlano.mutate({ aluno_id: Number(planoForm.aluno_id), nome: planoForm.nome, valor: parseFloat(planoForm.valor), dia_vencimento: Number(planoForm.dia_vencimento) }) }
  const submitCob   = (e) => { e.preventDefault(); mutCriarCob.mutate({ plano_id: Number(cobForm.plano_id), vencimento: new Date(cobForm.vencimento).toISOString() }) }

  // Build monthly chart from charges
  const revenueChart = (() => {
    const map = {}
    cobrancas.filter(c => c.status === 'pago').forEach((c) => {
      const m = new Date(c.vencimento).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
      map[m] = (map[m] || 0) + Number(c.valor)
    })
    return Object.entries(map).slice(-6).map(([mes, valor]) => ({ mes, valor }))
  })()

  const stats = [
    { icon: TrendingUp,   label: 'Receita mensal prevista', value: fmt(resumo?.receita_mensal_prevista ?? 0), color: 'bg-gradient-emerald',                      loading: loadingResumo },
    { icon: Users,        label: 'Alunos com plano',        value: resumo?.total_alunos_com_plano ?? 0,       color: 'bg-gradient-brand',                        loading: loadingResumo },
    { icon: AlertCircle,  label: 'Inadimplentes',           value: resumo?.inadimplentes ?? 0,                color: 'bg-gradient-rose',                         loading: loadingResumo },
    { icon: Wallet,       label: 'Valor inadimplente',      value: fmt(resumo?.valor_inadimplente ?? 0),      color: 'bg-gradient-to-br from-orange-500 to-amber-500', loading: loadingResumo },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Financeiro</h1>
          <p className="page-subtitle">Gerencie planos, cobranças e receitas</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ icon: Icon, label, value, color, loading }) => (
          loading ? <SkeletonStatCard key={label} /> : (
            <div key={label} className="card flex items-center gap-4 hover:shadow-card-hover transition-all">
              <div className={`stat-icon ${color}`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-xl font-bold text-gray-900">{value}</div>
                <div className="text-xs text-gray-500 font-medium">{label}</div>
              </div>
            </div>
          )
        ))}
      </div>

      {/* Revenue chart */}
      {revenueChart.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-semibold text-gray-900">Receita por mês</h2>
              <p className="text-xs text-gray-400 mt-0.5">Cobranças pagas nos últimos 6 meses</p>
            </div>
            <div className="w-8 h-8 bg-emerald-50 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={revenueChart}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}   />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${v}`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="valor" name="Receita" stroke="#10b981" strokeWidth={2} fill="url(#revenueGrad)" dot={{ fill: '#10b981', r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Tabs */}
      <div className="tabs">
        {[
          { key: 'cobrancas', label: `Cobranças (${cobrancas.length})` },
          { key: 'planos',    label: `Planos (${planos.length})`       },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => setTab(key)} className={`tab ${tab === key ? 'tab-active' : 'tab-inactive'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* ── Cobranças tab ── */}
      {tab === 'cobrancas' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button className="btn-gradient btn-sm" onClick={() => setShowCobForm(!showCobForm)}>
              <Plus className="w-3.5 h-3.5" /> Nova cobrança
            </button>
          </div>

          {showCobForm && (
            <div className="card border-2 border-primary-200 animate-slide-down">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-900">Gerar cobrança</h3>
                <button onClick={() => setShowCobForm(false)} className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                  <X className="w-3.5 h-3.5 text-gray-500" />
                </button>
              </div>
              <form onSubmit={submitCob} className="space-y-4">
                <div>
                  <label className="label">Plano</label>
                  <select className="input" value={cobForm.plano_id} onChange={(e) => setCobForm((f) => ({ ...f, plano_id: e.target.value }))} required>
                    <option value="">Selecionar plano ativo...</option>
                    {planos.filter((p) => p.status === 'ativo').map((p) => (
                      <option key={p.id} value={p.id}>{p.nome} — {fmt(p.valor)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Data de vencimento</label>
                  <input type="date" className="input" value={cobForm.vencimento} onChange={(e) => setCobForm((f) => ({ ...f, vencimento: e.target.value }))} required />
                </div>
                <div className="flex gap-3">
                  <button type="button" className="btn-secondary" onClick={() => setShowCobForm(false)}>Cancelar</button>
                  <button type="submit" className="btn-gradient" disabled={mutCriarCob.isPending}>
                    {mutCriarCob.isPending ? 'Gerando...' : 'Gerar cobrança'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {cobrancas.length === 0 ? (
            <div className="card empty-state">
              <div className="empty-icon bg-emerald-50">
                <DollarSign className="w-8 h-8 text-emerald-400" />
              </div>
              <p className="empty-title">Nenhuma cobrança ainda</p>
              <p className="empty-message">Crie um plano para um aluno e gere a primeira cobrança.</p>
            </div>
          ) : (
            <div className="card p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/80">
                      {['Aluno','Valor','Vencimento','Pago em','Status','PIX','Ação'].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {cobrancas.map((c) => {
                      const aluno = alunos.find((a) => a.id === c.aluno_id)
                      return (
                        <tr key={c.id} className="hover:bg-gray-50/60 transition-colors">
                          <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">{aluno?.nome ?? `#${c.aluno_id}`}</td>
                          <td className="px-4 py-3 text-gray-700 font-medium whitespace-nowrap">{fmt(c.valor)}</td>
                          <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{fmtDate(c.vencimento)}</td>
                          <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{fmtDate(c.pago_em)}</td>
                          <td className="px-4 py-3 whitespace-nowrap"><StatusBadge status={c.status} /></td>
                          <td className="px-4 py-3">
                            {c.link_pagamento ? (
                              <a href={c.link_pagamento} target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-semibold">
                                <ExternalLink className="w-3 h-3" /> PIX
                              </a>
                            ) : <span className="text-gray-300 text-xs">—</span>}
                          </td>
                          <td className="px-4 py-3">
                            {c.status !== 'pago' && (
                              <button
                                onClick={() => mutPagar.mutate(c.id)}
                                className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 whitespace-nowrap"
                              >
                                <CheckCircle className="w-3.5 h-3.5" /> Marcar pago
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
        </div>
      )}

      {/* ── Planos tab ── */}
      {tab === 'planos' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button className="btn-gradient btn-sm" onClick={() => setShowPlanoForm(!showPlanoForm)}>
              <Plus className="w-3.5 h-3.5" /> Novo plano
            </button>
          </div>

          {showPlanoForm && (
            <div className="card border-2 border-primary-200 animate-slide-down">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-900">Criar plano</h3>
                <button onClick={() => setShowPlanoForm(false)} className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                  <X className="w-3.5 h-3.5 text-gray-500" />
                </button>
              </div>
              <form onSubmit={submitPlano} className="space-y-4">
                <div>
                  <label className="label">Aluno *</label>
                  <select className="input" value={planoForm.aluno_id} onChange={(e) => setPlanoForm((f) => ({ ...f, aluno_id: e.target.value }))} required>
                    <option value="">Selecionar aluno...</option>
                    {alunos.map((a) => <option key={a.id} value={a.id}>{a.nome}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="label">Nome do plano *</label>
                    <input className="input" placeholder="Ex: Mensal 3x" value={planoForm.nome} onChange={(e) => setPlanoForm((f) => ({ ...f, nome: e.target.value }))} required />
                  </div>
                  <div>
                    <label className="label">Valor (R$) *</label>
                    <input type="number" min="1" step="0.01" className="input" placeholder="150,00" value={planoForm.valor} onChange={(e) => setPlanoForm((f) => ({ ...f, valor: e.target.value }))} required />
                  </div>
                </div>
                <div>
                  <label className="label">Dia de vencimento *</label>
                  <input type="number" min="1" max="28" className="input max-w-[140px]" value={planoForm.dia_vencimento} onChange={(e) => setPlanoForm((f) => ({ ...f, dia_vencimento: e.target.value }))} required />
                  <p className="text-xs text-gray-400 mt-1">Entre 1 e 28</p>
                </div>
                <div className="flex gap-3">
                  <button type="button" className="btn-secondary" onClick={() => setShowPlanoForm(false)}>Cancelar</button>
                  <button type="submit" className="btn-gradient" disabled={mutCriarPlano.isPending}>
                    {mutCriarPlano.isPending ? 'Criando...' : 'Criar plano'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {planos.length === 0 ? (
            <div className="card empty-state">
              <div className="empty-icon bg-primary-50">
                <DollarSign className="w-8 h-8 text-primary-400" />
              </div>
              <p className="empty-title">Nenhum plano ainda</p>
              <p className="empty-message">Crie o primeiro plano para começar a cobrar seus alunos.</p>
              <button className="btn-gradient" onClick={() => setShowPlanoForm(true)}>Criar primeiro plano</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {planos.map((p) => {
                const aluno = alunos.find((a) => a.id === p.aluno_id)
                return (
                  <div key={p.id} className="card hover:shadow-card-hover transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-bold text-gray-900">{p.nome}</p>
                        <p className="text-sm text-gray-500">{aluno?.nome ?? `Aluno #${p.aluno_id}`}</p>
                      </div>
                      <StatusBadge status={p.status} />
                    </div>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-2xl font-black text-gray-900">
                          {fmt(p.valor)}
                          <span className="text-sm font-normal text-gray-400">/mês</span>
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">Vence dia {p.dia_vencimento}</p>
                      </div>
                      {p.status === 'ativo' && (
                        <button
                          onClick={() => mutInativarPlano.mutate(p.id)}
                          className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-semibold"
                        >
                          <Ban className="w-3.5 h-3.5" /> Inativar
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
