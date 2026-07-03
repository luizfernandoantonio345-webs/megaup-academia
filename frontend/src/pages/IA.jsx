import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { listarAlunos, sugestoesAluno, treinoAlternativo } from '../api'
import toast from 'react-hot-toast'
import { Brain, Zap, TrendingUp, TrendingDown, Minus, ChevronDown } from 'lucide-react'

function Avatar({ nome }) {
  const initials = nome?.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
  return (
    <div style={{ width:28, height:28, borderRadius:'50%', background:'linear-gradient(135deg,#4f46e5,#7c3aed)', color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, flexShrink:0 }}>
      {initials}
    </div>
  )
}

const ACAO_CONFIG = {
  aumentar: { icon: TrendingUp,   label: 'Aumentar carga', bg:'rgba(16,185,129,0.1)',  border:'rgba(16,185,129,0.25)',  text:'#34d399', iconColor:'#10b981' },
  manter:   { icon: Minus,        label: 'Manter carga',   bg:'rgba(99,102,241,0.1)',  border:'rgba(99,102,241,0.25)',  text:'#a5b4fc', iconColor:'#6366f1' },
  reduzir:  { icon: TrendingDown, label: 'Reduzir carga',  bg:'rgba(239,68,68,0.1)',   border:'rgba(239,68,68,0.25)',   text:'#f87171', iconColor:'#ef4444' },
}

export default function IA() {
  const [alunoSel, setAlunoSel] = useState('')
  const [tab, setTab] = useState('sugestoes')

  const { data: alunos = [] } = useQuery({ queryKey: ['alunos'], queryFn: () => listarAlunos().then(r => r.data) })

  const { data: sugestoes, isLoading: loadingSug } = useQuery({
    queryKey: ['sugestoes', alunoSel],
    queryFn: () => sugestoesAluno(alunoSel).then(r => r.data),
    enabled: !!alunoSel,
  })
  const alunoSelecionado = alunos.find(a => String(a.id) === String(alunoSel))

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">IA · Progressão de Carga</h1>
          <p className="page-subtitle">Sugestões automáticas baseadas no histórico dos alunos</p>
        </div>
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background:'linear-gradient(135deg,#7c3aed,#a78bfa)', boxShadow:'0 0 20px rgba(124,58,237,0.4)' }}>
          <Brain style={{ width:20, height:20, color:'white' }} />
        </div>
      </div>

      <div className="tabs">
        {[{ key:'sugestoes', label:'Sugestões por aluno' }, { key:'alternativo', label:'Treino alternativo' }].map(({ key, label }) => (
          <button key={key} onClick={() => setTab(key)} className={`tab ${tab === key ? 'tab-active' : 'tab-inactive'}`}>{label}</button>
        ))}
      </div>

      {tab === 'sugestoes' && (
        <div className="space-y-5">
          <div className="card p-4">
            <label className="label">Selecionar aluno</label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                {alunoSelecionado ? <Avatar nome={alunoSelecionado.nome} /> : <Brain style={{ width:16, height:16, color:'#3D4F6A' }} />}
              </div>
              <select className="input pl-12 appearance-none" value={alunoSel} onChange={e => setAlunoSel(e.target.value)}>
                <option value="">Escolher aluno para ver sugestões...</option>
                {alunos.map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}
              </select>
              <ChevronDown style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', width:15, height:15, color:'#3D4F6A', pointerEvents:'none' }} />
            </div>
          </div>

          {alunoSel && loadingSug && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center animate-bounce-light" style={{ background:'rgba(124,58,237,0.15)' }}>
                <Brain style={{ width:28, height:28, color:'#a78bfa' }} />
              </div>
              <p style={{ fontSize:14, color:'#4B5768', fontWeight:500 }}>A IA está analisando o histórico...</p>
            </div>
          )}

          {sugestoes && !loadingSug && (
            <div className="space-y-4">
              {sugestoes.dias_sem_treinar !== null && (
                <div className="flex items-center gap-3 p-4 rounded-2xl" style={{
                  background: sugestoes.dias_sem_treinar === 0 ? 'rgba(16,185,129,0.1)' : sugestoes.dias_sem_treinar > 7 ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                  border: `1px solid ${sugestoes.dias_sem_treinar === 0 ? 'rgba(16,185,129,0.25)' : sugestoes.dias_sem_treinar > 7 ? 'rgba(239,68,68,0.25)' : 'rgba(245,158,11,0.25)'}`,
                }}>
                  <span style={{ fontSize:22 }}>{sugestoes.dias_sem_treinar === 0 ? '✅' : sugestoes.dias_sem_treinar > 7 ? '⚠️' : '⏱️'}</span>
                  <p style={{ fontWeight:600, fontSize:14, color: sugestoes.dias_sem_treinar === 0 ? '#34d399' : sugestoes.dias_sem_treinar > 7 ? '#f87171' : '#fbbf24' }}>
                    {sugestoes.dias_sem_treinar === 0 ? 'Treinou hoje!' : `Último treino há ${sugestoes.dias_sem_treinar} dia${sugestoes.dias_sem_treinar > 1 ? 's' : ''}`}
                  </p>
                </div>
              )}

              {sugestoes.sugestoes_pendentes.length === 0 ? (
                <div className="card empty-state">
                  <div className="empty-icon"><Brain style={{ width:28, height:28, color:'#4B5768' }} /></div>
                  <p className="empty-title">Sem sugestões ainda</p>
                  <p className="empty-message">A IA precisa de pelo menos 3 execuções do mesmo exercício para gerar sugestões.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p style={{ fontSize:11, color:'#4B5768', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em' }}>
                    {sugestoes.sugestoes_pendentes.length} sugestão{sugestoes.sugestoes_pendentes.length > 1 ? 'ões' : ''} gerada{sugestoes.sugestoes_pendentes.length > 1 ? 's' : ''}
                  </p>
                  {sugestoes.sugestoes_pendentes.map((s) => {
                    const cfg = ACAO_CONFIG[s.acao] || ACAO_CONFIG.manter
                    const IconAcao = cfg.icon
                    return (
                      <div key={s.id} className="rounded-2xl p-4 animate-slide-up" style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background:'rgba(255,255,255,0.07)' }}>
                            <IconAcao style={{ width:17, height:17, color:cfg.iconColor }} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap mb-1.5">
                              <span style={{ fontSize:11, fontWeight:700, color:cfg.text, background:'rgba(255,255,255,0.08)', padding:'2px 10px', borderRadius:999, textTransform:'uppercase', letterSpacing:'0.05em' }}>{cfg.label}</span>
                              {s.carga_sugerida && (
                                <span style={{ fontSize:14, fontWeight:800, color:'#EFF6FF', fontFamily:'Space Grotesk, sans-serif' }}>→ {s.carga_sugerida} kg</span>
                              )}
                            </div>
                            <p style={{ fontSize:13, color:'#94A3B8' }}>{s.motivo}</p>
                            <p style={{ fontSize:11, color:'#3D4F6A', marginTop:6 }}>
                              {new Date(s.gerado_em).toLocaleDateString('pt-BR', { day:'2-digit', month:'short', year:'numeric' })}
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

          {!alunoSel && (
            <div className="card empty-state">
              <div className="empty-icon"><Brain style={{ width:28, height:28, color:'#4B5768' }} /></div>
              <p className="empty-title">Selecione um aluno</p>
              <p className="empty-message">Escolha um aluno acima para visualizar as sugestões de progressão geradas pela IA.</p>
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
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background:'rgba(245,158,11,0.15)' }}>
            <Zap style={{ width:16, height:16, color:'#fbbf24' }} />
          </div>
          <div>
            <h3 style={{ fontFamily:'Space Grotesk, sans-serif', fontWeight:700, color:'#CBD5E1', fontSize:14 }}>Gerar treino alternativo</h3>
            <p style={{ fontSize:12, color:'#3D4F6A' }}>Informe o equipamento indisponível</p>
          </div>
        </div>
        <div className="flex gap-3">
          <input className="input flex-1" placeholder="Ex: barra, rack, pull-down, halteres..." value={equipamento} onChange={e => setEquipamento(e.target.value)} onKeyDown={e => e.key === 'Enter' && equipamento && !isPending && mutate()} />
          <button className="btn-gradient px-5" disabled={isPending || !equipamento} onClick={() => mutate()}>
            {isPending ? <span className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor:'rgba(255,255,255,0.3)', borderTopColor:'white' }} /> : <Zap style={{ width:16, height:16 }} />}
          </button>
        </div>
        <p style={{ fontSize:12, color:'#3D4F6A', marginTop:8 }}>A IA sugerirá exercícios alternativos que preservam o grupo muscular trabalhado.</p>
      </div>

      {isPending && (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center animate-bounce-light" style={{ background:'rgba(124,58,237,0.15)' }}>
            <Brain style={{ width:26, height:26, color:'#a78bfa' }} />
          </div>
          <p style={{ fontSize:13, color:'#4B5768', fontWeight:500 }}>Gerando alternativas com IA...</p>
        </div>
      )}

      {resultado && !isPending && (
        <div className="card space-y-4">
          <h4 style={{ fontFamily:'Space Grotesk, sans-serif', fontWeight:700, color:'#CBD5E1', fontSize:15 }}>Sugestões da IA</h4>
          {resultado.itens.length === 0 ? (
            <p style={{ fontSize:13, color:'#4B5768' }}>Nenhum exercício precisa de substituição para esse equipamento.</p>
          ) : (
            <div className="space-y-3">
              {resultado.itens.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-xl animate-slide-up" style={{ background:'rgba(255,255,255,0.04)' }}>
                  <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5" style={{ background:'rgba(99,102,241,0.2)', color:'#a5b4fc' }}>{idx+1}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap text-sm mb-1">
                      <span style={{ color:'#f87171', textDecoration:'line-through', fontWeight:500 }}>{item.exercicio_original}</span>
                      <span style={{ color:'#3D4F6A' }}>→</span>
                      <span style={{ color:'#34d399', fontWeight:700 }}>{item.exercicio_alternativo}</span>
                    </div>
                    <p style={{ fontSize:12, color:'#4B5768' }}>{item.motivo}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          {resultado.observacoes && (
            <div className="alert-info text-sm">💡 {resultado.observacoes}</div>
          )}
        </div>
      )}
    </div>
  )
}
