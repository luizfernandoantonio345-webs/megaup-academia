import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { listarAlunos, sugestoesAluno, sugerirCarga, treinoAlternativo } from '../api'
import toast from 'react-hot-toast'
import { Brain, Zap, Loader2 } from 'lucide-react'

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

  const COR = { aumentar: 'badge-green', manter: 'badge-blue', reduzir: 'badge-red' }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">IA · Progressão de Carga</h1>
        <p className="text-gray-500">Sugestões automáticas geradas com base no histórico dos alunos.</p>
      </div>

      <div className="flex gap-2 border-b border-gray-200">
        {[
          { key: 'sugestoes', label: 'Sugestões por aluno' },
          { key: 'alternativo', label: 'Treino alternativo' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === key ? 'border-primary-600 text-primary-700' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'sugestoes' && (
        <div className="space-y-4">
          <select className="input max-w-xs" value={alunoSel} onChange={(e) => setAlunoSel(e.target.value)}>
            <option value="">Selecionar aluno...</option>
            {alunos.map((a) => <option key={a.id} value={a.id}>{a.nome}</option>)}
          </select>

          {alunoSel && loadingSug && (
            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary-600" /></div>
          )}

          {sugestoes && (
            <div className="space-y-4">
              {sugestoes.dias_sem_treinar !== null && (
                <div className={`p-4 rounded-xl border ${sugestoes.dias_sem_treinar > 7 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                  <p className={`font-medium ${sugestoes.dias_sem_treinar > 7 ? 'text-red-700' : 'text-green-700'}`}>
                    {sugestoes.dias_sem_treinar === 0
                      ? '✅ Treinou hoje!'
                      : `⏱️ Último treino há ${sugestoes.dias_sem_treinar} dia${sugestoes.dias_sem_treinar > 1 ? 's' : ''}`}
                  </p>
                </div>
              )}

              {sugestoes.sugestoes_pendentes.length === 0 ? (
                <div className="card text-center py-8">
                  <Brain className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">Sem sugestões ainda. A IA precisa de ≥ 3 execuções do mesmo exercício.</p>
                </div>
              ) : (
                sugestoes.sugestoes_pendentes.map((s) => (
                  <div key={s.id} className="card">
                    <div className="flex items-start gap-3">
                      <Brain className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={COR[s.acao] || 'badge-blue'}>
                            {s.acao.charAt(0).toUpperCase() + s.acao.slice(1)} carga
                          </span>
                          {s.carga_sugerida && (
                            <span className="text-sm font-bold text-gray-700">→ {s.carga_sugerida} kg</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{s.motivo}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(s.gerado_em).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
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
    onError: () => toast.error('Erro ao gerar alternativo'),
  })

  return (
    <div className="space-y-4 max-w-lg">
      <div className="card">
        <h3 className="font-semibold mb-3">Gerar treino alternativo</h3>
        <p className="text-sm text-gray-500 mb-4">
          Informe o equipamento indisponível e a IA sugerirá substituições.
        </p>
        <div className="flex gap-3">
          <input
            className="input flex-1"
            placeholder="Ex: barra, halteres, rack..."
            value={equipamento}
            onChange={(e) => setEquipamento(e.target.value)}
          />
          <button className="btn-primary flex items-center gap-2" disabled={isPending || !equipamento} onClick={() => mutate()}>
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            Gerar
          </button>
        </div>
      </div>

      {resultado && (
        <div className="card space-y-3">
          <h4 className="font-semibold">Sugestões da IA</h4>
          {resultado.itens.map((i, idx) => (
            <div key={idx} className="bg-gray-50 rounded-xl p-3">
              <div className="text-sm">
                <span className="text-red-500 line-through">{i.exercicio_original}</span>
                <span className="mx-2 text-gray-400">→</span>
                <span className="text-green-700 font-medium">{i.exercicio_alternativo}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">{i.motivo}</p>
            </div>
          ))}
          {resultado.observacoes && (
            <p className="text-sm text-gray-600 italic">{resultado.observacoes}</p>
          )}
        </div>
      )}
    </div>
  )
}
