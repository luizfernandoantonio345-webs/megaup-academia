import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { listarAlunos, sugestoesAluno, treinoAlternativo } from '../api'
import toast from 'react-hot-toast'
import { Brain, Zap, TrendingUp, TrendingDown, Minus, ChevronDown } from 'lucide-react'

function Avatar({ nome }) {
  const initials = nome?.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
  return (
    <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-violet-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
      {initials}
    </div>
  )
}

const ACAO_CONFIG = {
  aumentar: {
    icon: TrendingUp,
    badge: 'badge-green',
    label: 'Aumentar carga',
    bg: 'bg-emerald-50 border-emerald-200',
    iconColor: 'text-emerald-500',
  },
  manter: {
    icon: Minus,
    badge: 'badge-blue',
    label: 'Manter carga',
    bg: 'bg-blue-50 border-blue-200',
    iconColor: 'text-blue-500',
  },
  reduzir: {
    icon: TrendingDown,
    badge: 'badge-red',
    label: 'Reduzir carga',
    bg: 'bg-red-50 border-red-200',
    iconColor: 'text-red-500',
  },
}

export default function IA() {
  const [alunoSel, setAlunoSel] = useState('')
  const [tab, setTab] = useState('sugestoes')

  const { data: alunos = [] } = useQuery({
    queryKey: ['alunos'],
    queryFn: () => listarAlunos().then((r) => r.data),
  })

  const { data: sugestoes, isLoading: loadingSug } = useQuery({
    queryKey: ['sugestoes', alunoSel],
    queryFn: () => sugestoesAluno(alunoSel).then((r) => r.data),
    enabled: !!alunoSel,
  })

  const alunoSelecionado = alunos.find(a => String(a.id) === String(alunoSel))

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">IA · Progressão de Carga</h1>
          <p className="page-subtitle">Sugestões automáticas baseadas no histórico dos alunos</p>
        </div>
        <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-glow-sm">
          <Brain className="w-5 h-5 text-white" />
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {[
          { key: 'sugestoes',   label: 'Sugestões por aluno' },
          { key: 'alternativo', label: 'Treino alternativo'   },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`tab ${tab === key ? 'tab-active' : 'tab-inactive'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'sugestoes' && (
        <div className="space-y-5">
          {/* Student selector */}
          <div className="card p-4">
            <label className="label">Selecionar aluno</label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                {alunoSelecionado
                  ? <Avatar nome={alunoSelecionado.nome} />
                  : <Brain className="w-4 h-4 text-gray-400" />}
              </div>
              <select
                className="input pl-12 appearance-none"
                value={alunoSel}
                onChange={(e) => setAlunoSel(e.target.value)}
              >
                <option value="">Escolher aluno para ver sugestões...</option>
                {alunos.map((a) => <option key={a.id} value={a.id}>{a.nome}</option>)}
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Loading */}
          {alunoSel && loadingSug && (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="w-12 h-12 bg-violet-100 rounded-2xl flex items-center justify-center animate-bounce-light">
                <Brain className="w-6 h-6 text-violet-500" />
              </div>
              <p className="text-sm text-gray-500 font-medium">A IA está analisando o histórico...</p>
            </div>
          )}

          {/* Results */}
          {sugestoes && !loadingSug && (
            <div className="space-y-4">
              {/* Activity indicator */}
              {sugestoes.dias_sem_treinar !== null && (
                <div className={`flex items-center gap-3 p-4 rounded-2xl border ${
                  sugestoes.dias_sem_treinar === 0
                    ? 'bg-emerald-50 border-emerald-200'
                    : sugestoes.dias_sem_treinar > 7
                      ? 'bg-red-50 border-red-200'
                      : 'bg-amber-50 border-amber-200'
                }`}>
                  <span className="text-2xl">
                    {sugestoes.dias_sem_treinar === 0 ? '✅' : sugestoes.dias_sem_treinar > 7 ? '⚠️' : '⏱️'}
                  </span>
                  <p className={`font-semibold text-sm ${
                    sugestoes.dias_sem_treinar === 0
                      ? 'text-emerald-700'
                      : sugestoes.dias_sem_treinar > 7
                        ? 'text-red-700'
                        : 'text-amber-700'
                  }`}>
                    {sugestoes.dias_sem_treinar === 0
                      ? 'Treinou hoje!'
                      : `Último treino há ${sugestoes.dias_sem_treinar} dia${sugestoes.dias_sem_treinar > 1 ? 's' : ''}`}
                  </p>
                </div>
              )}

              {sugestoes.sugestoes_pendentes.length === 0 ? (
                <div className="card empty-state">
                  <div className="empty-icon bg-violet-50">
                    <Brain className="w-7 h-7 text-violet-400" />
                  </div>
                  <p className="empty-title">Sem sugestões ainda</p>
                  <p className="empty-message">
                    A IA precisa de pelo menos 3 execuções do mesmo exercício para gerar sugestões de progressão.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-gray-500 font-medium">
                    {sugestoes.sugestoes_pendentes.length} sugestão{sugestoes.sugestoes_pendentes.length > 1 ? 'ões' : ''} gerada{sugestoes.sugestoes_pendentes.length > 1 ? 's' : ''}
                  </p>
                  {sugestoes.sugestoes_pendentes.map((s) => {
                    const cfg = ACAO_CONFIG[s.acao] || ACAO_CONFIG.manter
                    const IconAcao = cfg.icon
                    return (
                      <div key={s.id} className={`rounded-2xl border p-4 ${cfg.bg} animate-slide-up`}>
                        <div className="flex items-start gap-3">
                          <div className={`w-9 h-9 rounded-xl bg-white/60 flex items-center justify-center flex-shrink-0`}>
                            <IconAcao className={`w-4.5 h-4.5 ${cfg.iconColor}`} style={{ width: 18, height: 18 }} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className={cfg.badge}>{cfg.label}</span>
                              {s.carga_sugerida && (
                                <span className="text-sm font-bold text-gray-800">
                                  → {s.carga_sugerida} kg
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-700">{s.motivo}</p>
                            <p className="text-xs text-gray-400 mt-1.5">
                              {new Date(s.gerado_em).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* No student selected */}
          {!alunoSel && (
            <div className="card empty-state">
              <div className="empty-icon bg-violet-50">
                <Brain className="w-8 h-8 text-violet-400" />
              </div>
              <p className="empty-title">Selecione um aluno</p>
              <p className="empty-message">
                Escolha um aluno acima para visualizar as sugestões de progressão geradas pela IA.
              </p>
            </div>
          )}
        </div>
      )}

      {tab === 'alternativo' && <TreinoAlternativoTab />}
    </div>
  )
}

function TreinoAlternativoTab() {
  const [equipamento, setEquipamento] = useState('')
  const [resultado, setResultado] = useState(null)

  const { mutate, isPending } = useMutation({
    mutationFn: () => treinoAlternativo({
      treino_original: { nome: 'Treino', itens: [{ exercicio: 'Supino com barra', equipamento }] },
      equipamento_indisponivel: equipamento,
    }),
    onSuccess: ({ data }) => setResultado(data),
    onError: () => toast.error('Erro ao gerar alternativo — IA pode estar indisponível'),
  })

  return (
    <div className="space-y-5 max-w-2xl">
      {/* Form */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center">
            <Zap className="w-4.5 h-4.5 text-amber-600" style={{ width: 18, height: 18 }} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Gerar treino alternativo</h3>
            <p className="text-xs text-gray-500">Informe o equipamento indisponível</p>
          </div>
        </div>
        <div className="flex gap-3">
          <input
            className="input flex-1"
            placeholder="Ex: barra, rack, pull-down, halteres..."
            value={equipamento}
            onChange={(e) => setEquipamento(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && equipamento && !isPending && mutate()}
          />
          <button
            className="btn-gradient px-5"
            disabled={isPending || !equipamento}
            onClick={() => mutate()}
          >
            {isPending ? (
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <Zap className="w-4 h-4" />
            )}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          A IA sugerirá exercícios alternativos que preservam o grupo muscular trabalhado.
        </p>
      </div>

      {/* Loading */}
      {isPending && (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <div className="w-12 h-12 bg-violet-100 rounded-2xl flex items-center justify-center animate-bounce-light">
            <Brain className="w-6 h-6 text-violet-500" />
          </div>
          <p className="text-sm text-gray-500 font-medium">Gerando alternativas com IA...</p>
        </div>
      )}

      {/* Results */}
      {resultado && !isPending && (
        <div className="card space-y-4">
          <h4 className="font-bold text-gray-900">Sugestões da IA</h4>
          {resultado.itens.length === 0 ? (
            <p className="text-sm text-gray-500">Nenhum exercício precisa de substituição para esse equipamento.</p>
          ) : (
            <div className="space-y-3">
              {resultado.itens.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl animate-slide-up">
                  <span className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap text-sm mb-1">
                      <span className="text-red-500 line-through font-medium">{item.exercicio_original}</span>
                      <span className="text-gray-400">→</span>
                      <span className="text-emerald-700 font-semibold">{item.exercicio_alternativo}</span>
                    </div>
                    <p className="text-xs text-gray-500">{item.motivo}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          {resultado.observacoes && (
            <div className="alert-info text-sm italic">
              💡 {resultado.observacoes}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
