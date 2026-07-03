import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { listarPlanos, criarPlano, inativarPlano, listarCobrancas, criarCobranca, marcarPago, resumoFinanceiro, listarAlunos } from '../api'
import { DollarSign, Plus, CheckCircle, AlertCircle, TrendingUp, X, ExternalLink, Ban, Users, Wallet } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { SkeletonStatCard } from '../components/ui/Skeleton'

const fmt     = (v) => new Intl.NumberFormat('pt-BR', { style:'currency', currency:'BRL' }).format(Number(v) || 0)
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('pt-BR') : '—'

function StatusBadge({ status }) {
  const map = { pago:'badge-green', pendente:'badge-amber', vencido:'badge-red', cancelado:'badge-gray' }
  const labels = { pago:'Pago', pendente:'Pendente', vencido:'Vencido', cancelado:'Cancelado' }
  return <span className={map[status] || 'badge-gray'}>{labels[status] || status}</span>
}

const DarkTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background:'#141D30', border:'1px solid rgba(16,185,129,0.3)', borderRadius:12, padding:'10px 14px', boxShadow:'0 8px 24px rgba(0,0,0,0.4)' }}>
      <p style={{ color:'#64748B', fontSize:11, fontWeight:700, marginBottom:4 }}>{label}</p>
      <p style={{ color:'#34d399', fontWeight:700, fontSize:15, fontFamily:'Space Grotesk, sans-serif' }}>{fmt(payload[0]?.value)}</p>
    </div>
  )
}

export default function Financeiro() {
  const qc = useQueryClient()
  const [tab, setTab] = useState('cobrancas')
  const [showPlanoForm, setShowPlanoForm] = useState(false)
  const [showCobForm, setShowCobForm] = useState(false)
  const [planoForm, setPlanoForm] = useState({ aluno_id:'', nome:'', valor:'', dia_vencimento:'10' })
  const [cobForm, setCobForm] = useState({ plano_id:'', vencimento:'' })

  const { data: resumo, isLoading: loadingResumo } = useQuery({ queryKey:['resumo'],    queryFn: () => resumoFinanceiro().then(r => r.data) })
  const { data: planos    = [] } = useQuery({ queryKey:['planos'],    queryFn: () => listarPlanos().then(r => r.data) })
  const { data: cobrancas = [] } = useQuery({ queryKey:['cobrancas'], queryFn: () => listarCobrancas().then(r => r.data) })
  const { data: alunos    = [] } = useQuery({ queryKey:['alunos'],    queryFn: () => listarAlunos().then(r => r.data) })

  const mutCriarPlano   = useMutation({ mutationFn: criarPlano,    onSuccess: () => { toast.success('Plano criado!');     qc.invalidateQueries({queryKey:['planos']});    qc.invalidateQueries({queryKey:['resumo']});    setShowPlanoForm(false) }, onError: e => toast.error(e.response?.data?.detail || 'Erro') })
  const mutInativarPlano = useMutation({ mutationFn: inativarPlano, onSuccess: () => { toast.success('Plano inativado'); qc.invalidateQueries({queryKey:['planos']});    qc.invalidateQueries({queryKey:['resumo']}) } })
  const mutCriarCob      = useMutation({ mutationFn: criarCobranca, onSuccess: () => { toast.success('Cobrança gerada!');qc.invalidateQueries({queryKey:['cobrancas']}); qc.invalidateQueries({queryKey:['resumo']}); setShowCobForm(false) }, onError: e => toast.error(e.response?.data?.detail || 'Erro') })
  const mutPagar         = useMutation({ mutationFn: id => marcarPago(id), onSuccess: () => { toast.success('Marcado como pago!'); qc.invalidateQueries({queryKey:['cobrancas']}); qc.invalidateQueries({queryKey:['resumo']}) } })

  const submitPlano = e => { e.preventDefault(); mutCriarPlano.mutate({ aluno_id:Number(planoForm.aluno_id), nome:planoForm.nome, valor:parseFloat(planoForm.valor), dia_vencimento:Number(planoForm.dia_vencimento) }) }
  const submitCob   = e => { e.preventDefault(); mutCriarCob.mutate({ plano_id:Number(cobForm.plano_id), vencimento:new Date(cobForm.vencimento).toISOString() }) }

  const revenueChart = (() => {
    const map = {}
    cobrancas.filter(c => c.status === 'pago').forEach(c => {
      const m = new Date(c.vencimento).toLocaleDateString('pt-BR', { month:'short', year:'2-digit' })
      map[m] = (map[m] || 0) + Number(c.valor)
    })
    return Object.entries(map).slice(-6).map(([mes, valor]) => ({ mes, valor }))
  })()

  const STATS = [
    { icon:TrendingUp,  label:'Receita mensal prevista', value:fmt(resumo?.receita_mensal_prevista ?? 0), gradient:'linear-gradient(135deg,#059669,#10b981)', accent:'#10b981', loading:loadingResumo },
    { icon:Users,       label:'Alunos com plano',        value:resumo?.total_alunos_com_plano ?? 0,       gradient:'linear-gradient(135deg,#4f46e5,#7c3aed)', accent:'#6366f1', loading:loadingResumo },
    { icon:AlertCircle, label:'Inadimplentes',            value:resumo?.inadimplentes ?? 0,                gradient:'linear-gradient(135deg,#e11d48,#f43f5e)', accent:'#f87171', loading:loadingResumo },
    { icon:Wallet,      label:'Valor inadimplente',       value:fmt(resumo?.valor_inadimplente ?? 0),      gradient:'linear-gradient(135deg,#d97706,#f59e0b)', accent:'#fbbf24', loading:loadingResumo },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Financeiro</h1>
          <p className="page-subtitle">Gerencie planos, cobranças e receitas</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map(({ icon:Icon, label, value, gradient, accent, loading }) => (
          loading ? <SkeletonStatCard key={label} /> : (
            <div key={label} className="card flex items-center gap-4">
              <div className="stat-icon" style={{ background: gradient }}>
                <Icon style={{ width:20, height:20, color:'white' }} />
              </div>
              <div>
                <div style={{ fontFamily:'Space Grotesk, sans-serif', fontSize:20, fontWeight:800, color:'#EFF6FF', letterSpacing:'-0.02em' }}>{value}</div>
                <div style={{ fontSize:11, color:'#3D4F6A', fontWeight:600 }}>{label}</div>
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
              <h2 style={{ fontFamily:'Space Grotesk, sans-serif', fontWeight:700, color:'#CBD5E1', fontSize:15 }}>Receita por mês</h2>
              <p style={{ fontSize:12, color:'#3D4F6A', marginTop:2 }}>Cobranças pagas nos últimos 6 meses</p>
            </div>
            <TrendingUp style={{ width:16, height:16, color:'#10b981' }} />
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={revenueChart}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}   />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="mes" tick={{ fontSize:11, fill:'#3D4F6A' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize:11, fill:'#3D4F6A' }} axisLine={false} tickLine={false} tickFormatter={v => `R$${v}`} width={50} />
              <Tooltip content={<DarkTooltip />} />
              <Area type="monotone" dataKey="valor" stroke="#10b981" strokeWidth={2} fill="url(#revGrad)" dot={{ fill:'#10b981', r:3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Tabs */}
      <div className="tabs">
        {[{ key:'cobrancas', label:`Cobranças (${cobrancas.length})` }, { key:'planos', label:`Planos (${planos.length})` }].map(({ key, label }) => (
          <button key={key} onClick={() => setTab(key)} className={`tab ${tab === key ? 'tab-active' : 'tab-inactive'}`}>{label}</button>
        ))}
      </div>

      {/* Cobranças */}
      {tab === 'cobrancas' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button className="btn-gradient btn-sm" onClick={() => setShowCobForm(!showCobForm)}>
              <Plus style={{ width:13, height:13 }} /> Nova cobrança
            </button>
          </div>

          {showCobForm && (
            <div className="card animate-slide-down" style={{ border:'1px solid rgba(99,102,241,0.3)' }}>
              <div className="flex justify-between items-center mb-4">
                <h3 style={{ fontFamily:'Space Grotesk, sans-serif', fontWeight:700, color:'#EFF6FF', fontSize:14 }}>Gerar cobrança</h3>
                <button onClick={() => setShowCobForm(false)} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background:'rgba(255,255,255,0.07)', color:'#64748B' }}>
                  <X style={{ width:13, height:13 }} />
                </button>
              </div>
              <form onSubmit={submitCob} className="space-y-4">
                <div>
                  <label className="label">Plano</label>
                  <select className="input" value={cobForm.plano_id} onChange={e => setCobForm(f => ({ ...f, plano_id:e.target.value }))} required>
                    <option value="">Selecionar plano ativo...</option>
                    {planos.filter(p => p.status === 'ativo').map(p => <option key={p.id} value={p.id}>{p.nome} — {fmt(p.valor)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Data de vencimento</label>
                  <input type="date" className="input" value={cobForm.vencimento} onChange={e => setCobForm(f => ({ ...f, vencimento:e.target.value }))} required />
                </div>
                <div className="flex gap-3">
                  <button type="button" className="btn-secondary" onClick={() => setShowCobForm(false)}>Cancelar</button>
                  <button type="submit" className="btn-gradient" disabled={mutCriarCob.isPending}>{mutCriarCob.isPending ? 'Gerando...' : 'Gerar cobrança'}</button>
                </div>
              </form>
            </div>
          )}

          {cobrancas.length === 0 ? (
            <div className="card empty-state">
              <div className="empty-icon"><DollarSign style={{ width:28, height:28, color:'#4B5768' }} /></div>
              <p className="empty-title">Nenhuma cobrança ainda</p>
              <p className="empty-message">Crie um plano para um aluno e gere a primeira cobrança.</p>
            </div>
          ) : (
            <div className="card p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                      {['Aluno','Valor','Vencimento','Pago em','Status','PIX','Ação'].map(h => (
                        <th key={h} className="px-4 py-3 text-left" style={{ fontSize:11, fontWeight:700, color:'#3D4F6A', textTransform:'uppercase', letterSpacing:'0.06em', whiteSpace:'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {cobrancas.map((c, i) => {
                      const aluno = alunos.find(a => a.id === c.aluno_id)
                      return (
                        <tr key={c.id} style={{ borderTop: i > 0 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
                          onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.02)'}
                          onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                          <td className="px-4 py-3 font-semibold whitespace-nowrap" style={{ color:'#CBD5E1' }}>{aluno?.nome ?? `#${c.aluno_id}`}</td>
                          <td className="px-4 py-3 font-bold whitespace-nowrap" style={{ color:'#EFF6FF', fontFamily:'Space Grotesk, sans-serif' }}>{fmt(c.valor)}</td>
                          <td className="px-4 py-3 whitespace-nowrap" style={{ color:'#64748B' }}>{fmtDate(c.vencimento)}</td>
                          <td className="px-4 py-3 whitespace-nowrap" style={{ color:'#64748B' }}>{fmtDate(c.pago_em)}</td>
                          <td className="px-4 py-3 whitespace-nowrap"><StatusBadge status={c.status} /></td>
                          <td className="px-4 py-3">
                            {c.link_pagamento ? (
                              <a href={c.link_pagamento} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs font-semibold" style={{ color:'#818cf8' }}>
                                <ExternalLink style={{ width:12, height:12 }} /> PIX
                              </a>
                            ) : <span style={{ color:'#1F2D4A', fontSize:12 }}>—</span>}
                          </td>
                          <td className="px-4 py-3">
                            {c.status !== 'pago' && (
                              <button onClick={() => mutPagar.mutate(c.id)} className="flex items-center gap-1 text-xs font-semibold whitespace-nowrap" style={{ color:'#34d399' }}>
                                <CheckCircle style={{ width:12, height:12 }} /> Marcar pago
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

      {/* Planos */}
      {tab === 'planos' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button className="btn-gradient btn-sm" onClick={() => setShowPlanoForm(!showPlanoForm)}>
              <Plus style={{ width:13, height:13 }} /> Novo plano
            </button>
          </div>

          {showPlanoForm && (
            <div className="card animate-slide-down" style={{ border:'1px solid rgba(99,102,241,0.3)' }}>
              <div className="flex justify-between items-center mb-4">
                <h3 style={{ fontFamily:'Space Grotesk, sans-serif', fontWeight:700, color:'#EFF6FF', fontSize:14 }}>Criar plano</h3>
                <button onClick={() => setShowPlanoForm(false)} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background:'rgba(255,255,255,0.07)', color:'#64748B' }}>
                  <X style={{ width:13, height:13 }} />
                </button>
              </div>
              <form onSubmit={submitPlano} className="space-y-4">
                <div>
                  <label className="label">Aluno *</label>
                  <select className="input" value={planoForm.aluno_id} onChange={e => setPlanoForm(f => ({ ...f, aluno_id:e.target.value }))} required>
                    <option value="">Selecionar aluno...</option>
                    {alunos.map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="label">Nome do plano *</label>
                    <input className="input" placeholder="Ex: Mensal 3x" value={planoForm.nome} onChange={e => setPlanoForm(f => ({ ...f, nome:e.target.value }))} required />
                  </div>
                  <div>
                    <label className="label">Valor (R$) *</label>
                    <input type="number" min="1" step="0.01" className="input" placeholder="150,00" value={planoForm.valor} onChange={e => setPlanoForm(f => ({ ...f, valor:e.target.value }))} required />
                  </div>
                </div>
                <div>
                  <label className="label">Dia de vencimento *</label>
                  <input type="number" min="1" max="28" className="input max-w-[120px]" value={planoForm.dia_vencimento} onChange={e => setPlanoForm(f => ({ ...f, dia_vencimento:e.target.value }))} required />
                </div>
                <div className="flex gap-3">
                  <button type="button" className="btn-secondary" onClick={() => setShowPlanoForm(false)}>Cancelar</button>
                  <button type="submit" className="btn-gradient" disabled={mutCriarPlano.isPending}>{mutCriarPlano.isPending ? 'Criando...' : 'Criar plano'}</button>
                </div>
              </form>
            </div>
          )}

          {planos.length === 0 ? (
            <div className="card empty-state">
              <div className="empty-icon"><DollarSign style={{ width:28, height:28, color:'#4B5768' }} /></div>
              <p className="empty-title">Nenhum plano ainda</p>
              <p className="empty-message">Crie o primeiro plano para começar a cobrar seus alunos.</p>
              <button className="btn-gradient" onClick={() => setShowPlanoForm(true)}>Criar primeiro plano</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {planos.map(p => {
                const aluno = alunos.find(a => a.id === p.aluno_id)
                return (
                  <div key={p.id} className="card">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p style={{ fontFamily:'Space Grotesk, sans-serif', fontWeight:700, color:'#CBD5E1', fontSize:14 }}>{p.nome}</p>
                        <p style={{ fontSize:12, color:'#3D4F6A', marginTop:2 }}>{aluno?.nome ?? `Aluno #${p.aluno_id}`}</p>
                      </div>
                      <StatusBadge status={p.status} />
                    </div>
                    <div className="flex items-end justify-between">
                      <div>
                        <p style={{ fontFamily:'Space Grotesk, sans-serif', fontSize:24, fontWeight:900, color:'#EFF6FF', letterSpacing:'-0.02em' }}>
                          {fmt(p.valor)}<span style={{ fontSize:13, fontWeight:400, color:'#3D4F6A' }}>/mês</span>
                        </p>
                        <p style={{ fontSize:11, color:'#3D4F6A', marginTop:2 }}>Vence dia {p.dia_vencimento}</p>
                      </div>
                      {p.status === 'ativo' && (
                        <button onClick={() => mutInativarPlano.mutate(p.id)} className="flex items-center gap-1 text-xs font-semibold" style={{ color:'#f87171' }}>
                          <Ban style={{ width:12, height:12 }} /> Inativar
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
