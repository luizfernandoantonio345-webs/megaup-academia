import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { listarAlunos, sugestoesAluno, treinoAlternativo, gerarTreino, gamificacaoAluno } from '../api'
import toast from 'react-hot-toast'
import { Brain, Zap, TrendingUp, TrendingDown, Minus, ChevronDown, Sparkles, AlertCircle, CheckCircle2, Clock, Dumbbell, Timer } from 'lucide-react'

function Avatar({ nome, size = 28 }) {
  const initials = (nome || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: '#ef4444', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.38, fontWeight: 600, flexShrink: 0 }}>
      {initials}
    </div>
  )
}

const ACAO_CONFIG = {
  aumentar: { icon: TrendingUp,   label: 'Aumentar carga', bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.25)',  text: '#34d399', iconColor: '#10b981', dot: '#10b981' },
  manter:   { icon: Minus,        label: 'Manter carga',   bg: 'rgba(99,102,241,0.1)',  border: 'rgba(99,102,241,0.25)',  text: '#fca5a5', iconColor: '#ef4444', dot: '#ef4444' },
  reduzir:  { icon: TrendingDown, label: 'Reduzir carga',  bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.25)',   text: '#f87171', iconColor: '#ef4444', dot: '#ef4444' },
}

function AlunoContextBanner({ aluno, gami, dias }) {
  if (!aluno) return null
  return (
    <div className="rounded-2xl p-4 flex items-center gap-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <Avatar nome={aluno.nome} size={44} />
      <div className="flex-1 min-w-0">
        <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, color:'var(--text-primary)', fontSize: 15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {aluno.nome}
        </p>
        <p style={{ fontSize: 12, color:'var(--text-muted)', marginTop: 2 }}>{aluno.email}</p>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        {dias !== null && (
          <div className="text-center">
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 16, fontWeight: 600, color: dias === 0 ? '#34d399' : dias > 7 ? '#f87171' : '#fbbf24' }}>{dias === 0 ? 'Hoje' : `${dias}d`}</div>
            <div style={{ fontSize: 10, color:'var(--text-muted)', fontWeight: 600 }}>Ultimo</div>
          </div>
        )}
        {gami && (
          <div className="text-center">
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 16, fontWeight: 600, color: '#f97316' }}>{gami.streak_atual}🔥</div>
            <div style={{ fontSize: 10, color:'var(--text-muted)', fontWeight: 600 }}>Streak</div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function IA() {
  const [alunoSel, setAlunoSel] = useState('')
  const [tab, setTab] = useState('sugestoes')

  const { data: alunos = [] } = useQuery({ queryKey: ['alunos'], queryFn: () => listarAlunos().then(r => r.data) })
  const alunoSelecionado = alunos.find(a => String(a.id) === String(alunoSel))

  const { data: sugestoes, isLoading: loadingSug } = useQuery({
    queryKey: ['sugestoes', alunoSel],
    queryFn: () => sugestoesAluno(alunoSel).then(r => r.data),
    enabled: !!alunoSel,
  })
  const { data: gami } = useQuery({
    queryKey: ['gamificacao', alunoSel],
    queryFn: () => gamificacaoAluno(alunoSel).then(r => r.data),
    enabled: !!alunoSel,
  })

  const nPendentes = sugestoes?.sugestoes_pendentes?.length || 0

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Inteligencia Artificial</h1>
          <p className="page-subtitle">Progressao automatica e treinos alternativos</p>
        </div>
        <div className="relative">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: '#ef4444' }}>
            <Brain style={{ width: 22, height: 22, color: 'white' }} />
          </div>
          <div style={{ position: 'absolute', top: -2, right: -2, width: 12, height: 12, borderRadius: '50%', background: '#34d399', border: '2px solid var(--bg-page)' }} />
        </div>
      </div>

      {/* How it works banner */}
      <div className="rounded-2xl p-4" style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.08), rgba(99,102,241,0.06))', border: '1px solid rgba(124,58,237,0.2)' }}>
        <div className="flex items-start gap-3">
          <Sparkles style={{ width: 16, height: 16, color: '#a78bfa', flexShrink: 0, marginTop: 1 }} />
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#a78bfa', marginBottom: 4 }}>Como funciona a IA de progressao</p>
            <p style={{ fontSize: 12, color:'var(--text-muted)', lineHeight: 1.6 }}>
              Apos <strong style={{ color:'var(--text-primary)' }}>3 ou mais execucoes</strong> do mesmo exercicio, a IA analisa o historico de carga e performance para sugerir se deve aumentar, manter ou reduzir o peso — tudo baseado nos dados reais do aluno.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {[
          { key: 'sugestoes',   label: `Sugestões${nPendentes > 0 ? ` (${nPendentes})` : ''}` },
          { key: 'gerar',       label: '✨ Gerar Treino' },
          { key: 'alternativo', label: 'Alternativo' },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => setTab(key)} className={`tab ${tab === key ? 'tab-active' : 'tab-inactive'}`}>{label}</button>
        ))}
      </div>

      {tab === 'sugestoes' && (
        <div className="space-y-5">
          {/* Aluno selector */}
          <div>
            <label className="label">Selecionar aluno</label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                {alunoSelecionado ? <Avatar nome={alunoSelecionado.nome} /> : <Brain style={{ width: 16, height: 16, color:'var(--text-muted)' }} />}
              </div>
              <select className="input pl-12 appearance-none" value={alunoSel} onChange={e => setAlunoSel(e.target.value)}>
                <option value="">Escolher aluno para ver sugestoes...</option>
                {alunos.map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}
              </select>
              <ChevronDown style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color:'var(--text-muted)', pointerEvents: 'none' }} />
            </div>
          </div>

          {/* Aluno context */}
          {alunoSelecionado && !loadingSug && sugestoes && (
            <AlunoContextBanner aluno={alunoSelecionado} gami={gami} dias={sugestoes.dias_sem_treinar} />
          )}

          {/* Status badge */}
          {alunoSel && !loadingSug && sugestoes && sugestoes.dias_sem_treinar !== null && (
            <div className="flex items-center gap-3 p-4 rounded-2xl" style={{
              background: sugestoes.dias_sem_treinar === 0 ? 'rgba(16,185,129,0.1)' : sugestoes.dias_sem_treinar > 7 ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
              border: `1px solid ${sugestoes.dias_sem_treinar === 0 ? 'rgba(16,185,129,0.25)' : sugestoes.dias_sem_treinar > 7 ? 'rgba(239,68,68,0.25)' : 'rgba(245,158,11,0.25)'}`,
            }}>
              {sugestoes.dias_sem_treinar === 0
                ? <CheckCircle2 style={{ width: 18, height: 18, color: '#34d399', flexShrink: 0 }} />
                : sugestoes.dias_sem_treinar > 7
                  ? <AlertCircle style={{ width: 18, height: 18, color: '#f87171', flexShrink: 0 }} />
                  : <Clock style={{ width: 18, height: 18, color: '#fbbf24', flexShrink: 0 }} />}
              <p style={{ fontWeight: 600, fontSize: 14, color: sugestoes.dias_sem_treinar === 0 ? '#34d399' : sugestoes.dias_sem_treinar > 7 ? '#f87171' : '#fbbf24' }}>
                {sugestoes.dias_sem_treinar === 0
                  ? 'Treinou hoje!'
                  : sugestoes.dias_sem_treinar > 7
                    ? `${sugestoes.dias_sem_treinar} dias sem treinar — vale entrar em contato!`
                    : `Ultimo treino ha ${sugestoes.dias_sem_treinar} dia${sugestoes.dias_sem_treinar > 1 ? 's' : ''}`}
              </p>
            </div>
          )}

          {/* Loading */}
          {alunoSel && loadingSug && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center animate-bounce-light"
                  style={{ background: 'rgba(124,58,237,0.15)' }}>
                  <Brain style={{ width: 28, height: 28, color: '#a78bfa' }} />
                </div>
                <div style={{ position: 'absolute', top: -4, right: -4, width: 14, height: 14, borderRadius: '50%', background: '#ef4444', animation: 'ping 1s cubic-bezier(0,0,0.2,1) infinite' }} />
              </div>
              <p style={{ fontSize: 14, color:'var(--text-muted)', fontWeight: 500 }}>A IA esta analisando o historico...</p>
            </div>
          )}

          {/* Suggestions */}
          {sugestoes && !loadingSug && (
            nPendentes === 0 ? (
              <div className="card empty-state">
                <div className="empty-icon"><Brain style={{ width: 28, height: 28, color:'var(--text-muted)' }} /></div>
                <p className="empty-title">Sem sugestoes ainda</p>
                <p className="empty-message">A IA precisa de pelo menos 3 execucoes do mesmo exercicio para gerar sugestoes automaticas de progressao.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p style={{ fontSize: 11, color:'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                    {nPendentes} sugestao{nPendentes !== 1 ? 'es' : ''} gerada{nPendentes !== 1 ? 's' : ''}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#a78bfa', fontWeight: 600 }}>
                    <Sparkles style={{ width: 12, height: 12 }} />
                    Gerado por IA
                  </div>
                </div>
                {sugestoes.sugestoes_pendentes.map(s => {
                  const cfg = ACAO_CONFIG[s.acao] || ACAO_CONFIG.manter
                  const IconAcao = cfg.icon
                  return (
                    <div key={s.id} className="rounded-2xl p-4 animate-slide-up" style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: 'rgba(255,255,255,0.07)', position: 'relative' }}>
                          <IconAcao style={{ width: 18, height: 18, color: cfg.iconColor }} />
                          <div style={{ position: 'absolute', top: -3, right: -3, width: 10, height: 10, borderRadius: '50%', background: cfg.dot, border: '2px solid var(--bg-card)' }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1.5">
                            <span style={{ fontSize: 11, fontWeight: 600, color: cfg.text, background: 'rgba(255,255,255,0.08)', padding: '3px 10px', borderRadius: 999, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                              {cfg.label}
                            </span>
                            {s.carga_sugerida && (
                              <span style={{ fontSize: 16, fontWeight: 600, color:'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}>
                                {s.carga_sugerida} kg
                              </span>
                            )}
                          </div>
                          <p style={{ fontSize: 13, color:'var(--text-secondary)', lineHeight: 1.5 }}>{s.motivo}</p>
                          <p style={{ fontSize: 11, color:'var(--text-muted)', marginTop: 6 }}>
                            Gerado {new Date(s.gerado_em).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          )}

          {/* Empty — no aluno selected */}
          {!alunoSel && (
            <div className="space-y-4">
              <div className="card empty-state">
                <div className="empty-icon"><Brain style={{ width: 28, height: 28, color:'var(--text-muted)' }} /></div>
                <p className="empty-title">Selecione um aluno</p>
                <p className="empty-message">Escolha um aluno acima para visualizar as sugestoes de progressao geradas automaticamente pela IA.</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: '📊', title: 'Analise real', desc: 'Baseada no historico de execucoes do aluno' },
                  { icon: '🧠', title: 'IA adaptativa', desc: 'Aprende com o padrao de evolucao de cada pessoa' },
                  { icon: '⚡', title: 'Progressao segura', desc: 'Evita overload e sugere aumentos graduais' },
                ].map(({ icon, title, desc }) => (
                  <div key={title} className="card p-4 text-center" style={{ border: '1px solid rgba(124,58,237,0.12)' }}>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
                    <p style={{ fontSize: 12, fontWeight: 600, color:'var(--text-primary)', marginBottom: 4 }}>{title}</p>
                    <p style={{ fontSize: 11, color:'var(--text-muted)', lineHeight: 1.5 }}>{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'gerar' && <GerarTreinoTab />}
      {tab === 'alternativo' && <TreinoAlternativoTab />}
    </div>
  )
}

const OBJETIVOS = [
  { value: 'hipertrofia',    label: 'Hipertrofia',     emoji: '💪' },
  { value: 'perda_de_peso',  label: 'Perda de peso',   emoji: '🔥' },
  { value: 'condicionamento',label: 'Condicionamento',  emoji: '🏃' },
  { value: 'definicao',      label: 'Definição',        emoji: '⚡' },
  { value: 'forca',          label: 'Força',            emoji: '🏋️' },
]
const NIVEIS   = [
  { value: 'iniciante',     label: 'Iniciante'      },
  { value: 'intermediario', label: 'Intermediário'  },
  { value: 'avancado',      label: 'Avançado'       },
]
const EQUIPAMENTOS_OPCOES = ['Halteres', 'Barra', 'Máquinas', 'Cabo', 'Peso Corporal', 'Anilhas', 'Kettlebell']

function GerarTreinoTab() {
  const [form, setForm] = useState({ objetivo: 'hipertrofia', nivel: 'intermediario', dias_por_semana: 3, equipamentos: ['Halteres', 'Máquinas'], restricoes: '' })
  const [resultado, setResultado] = useState(null)

  const { mutate, isPending } = useMutation({
    mutationFn: () => gerarTreino({ ...form, equipamentos: form.equipamentos }),
    onSuccess: ({ data }) => setResultado(data),
    onError: () => toast.error('Erro ao gerar treino — IA pode estar indisponível'),
  })

  const toggleEquip = (eq) => setForm(f => ({
    ...f, equipamentos: f.equipamentos.includes(eq) ? f.equipamentos.filter(e => e !== eq) : [...f.equipamentos, eq]
  }))

  return (
    <div className="space-y-5">
      <div className="card space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <Sparkles style={{ width: 18, height: 18, color: '#ef4444' }} />
          </div>
          <div>
            <h3 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, color: 'var(--text-primary)', fontSize: 15 }}>Gerador de treino com IA</h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>Claude cria um plano completo e periodizado</p>
          </div>
        </div>

        {/* Objetivo */}
        <div>
          <label className="label">Objetivo</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {OBJETIVOS.map(o => (
              <button key={o.value} type="button" onClick={() => setForm(f => ({ ...f, objetivo: o.value }))}
                style={{ padding: '7px 14px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: '1px solid', transition: 'all 0.1s', borderColor: form.objetivo === o.value ? '#ef4444' : 'rgba(255,255,255,0.1)', background: form.objetivo === o.value ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.04)', color: form.objetivo === o.value ? '#f87171' : 'var(--text-muted)' }}>
                {o.emoji} {o.label}
              </button>
            ))}
          </div>
        </div>

        {/* Nível + Dias */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div>
            <label className="label">Nível</label>
            <select className="input" value={form.nivel} onChange={e => setForm(f => ({ ...f, nivel: e.target.value }))}>
              {NIVEIS.map(n => <option key={n.value} value={n.value}>{n.label}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Dias/semana</label>
            <select className="input" value={form.dias_por_semana} onChange={e => setForm(f => ({ ...f, dias_por_semana: Number(e.target.value) }))}>
              {[2, 3, 4, 5, 6].map(d => <option key={d} value={d}>{d} dias</option>)}
            </select>
          </div>
        </div>

        {/* Equipamentos */}
        <div>
          <label className="label">Equipamentos disponíveis</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {EQUIPAMENTOS_OPCOES.map(eq => {
              const active = form.equipamentos.includes(eq)
              return (
                <button key={eq} type="button" onClick={() => toggleEquip(eq)}
                  style={{ padding: '5px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: '1px solid', transition: 'all 0.1s', borderColor: active ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.1)', background: active ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.04)', color: active ? '#34d399' : 'var(--text-muted)' }}>
                  {eq}
                </button>
              )
            })}
          </div>
        </div>

        {/* Restrições */}
        <div>
          <label className="label">Restrições / Lesões (opcional)</label>
          <input className="input" placeholder="Ex: dor no joelho, evitar agachamento profundo..." value={form.restricoes} onChange={e => setForm(f => ({ ...f, restricoes: e.target.value }))} />
        </div>

        <button className="btn-primary w-full py-3.5" disabled={isPending} onClick={() => mutate()}>
          {isPending ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
              <span className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} />
              Claude está criando seu treino...
            </span>
          ) : (
            <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
              <Sparkles style={{ width: 16, height: 16 }} /> Gerar Treino com IA
            </span>
          )}
        </button>
      </div>

      {isPending && (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center animate-bounce-light" style={{ background: 'rgba(239,68,68,0.12)' }}>
            <Brain style={{ width: 28, height: 28, color: '#ef4444' }} />
          </div>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 500 }}>Claude está montando seu treino personalizado...</p>
          <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Isso pode levar 10-20 segundos</p>
        </div>
      )}

      {resultado && !isPending && (
        <div className="space-y-4 animate-fade-in">
          {resultado.metodologia && (
            <div className="rounded-2xl p-4 flex items-center gap-3" style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.18)' }}>
              <Sparkles style={{ width: 15, height: 15, color: '#ef4444', flexShrink: 0 }} />
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#f87171' }}>{resultado.metodologia}</p>
                {resultado.observacoes && <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, lineHeight: 1.5 }}>{resultado.observacoes}</p>}
              </div>
            </div>
          )}
          {resultado.sessoes?.map((sessao, si) => (
            <div key={si} className="card space-y-4">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0" style={{ background: '#ef4444' }}>
                  {si + 1}
                </div>
                <div>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, color: 'var(--text-primary)', fontSize: 14 }}>{sessao.nome}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1, textTransform: 'capitalize' }}>{sessao.dia}</p>
                </div>
              </div>
              <div className="space-y-3">
                {sessao.exercicios?.map((ex, ei) => (
                  <div key={ei} style={{ padding: '12px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{ex.exercicio}</p>
                        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{ex.grupo_muscular}{ex.equipamento ? ` · ${ex.equipamento}` : ''}</p>
                      </div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 11, padding: '3px 9px', borderRadius: 6, background: 'rgba(239,68,68,0.1)', color: '#f87171', fontWeight: 700 }}>
                          {ex.series}×{ex.repeticoes}
                        </span>
                        <span style={{ fontSize: 11, padding: '3px 9px', borderRadius: 6, background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Timer style={{ width: 10, height: 10 }} /> {ex.descanso_seg}s
                        </span>
                        {ex.carga_inicial_kg && (
                          <span style={{ fontSize: 11, padding: '3px 9px', borderRadius: 6, background: 'rgba(16,185,129,0.1)', color: '#34d399', fontWeight: 700 }}>
                            ~{ex.carga_inicial_kg}kg
                          </span>
                        )}
                      </div>
                    </div>
                    {ex.observacao && <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6, lineHeight: 1.5 }}>💡 {ex.observacao}</p>}
                  </div>
                ))}
              </div>
            </div>
          ))}
          {resultado.sessoes?.length === 0 && (
            <div className="card empty-state">
              <p className="empty-title">Não foi possível gerar o treino</p>
              <p className="empty-message">{resultado.observacoes || 'Tente novamente ou verifique se a IA está disponível.'}</p>
            </div>
          )}
        </div>
      )}
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
    onError: () => toast.error('Erro ao gerar alternativo — IA pode estar indisponivel'),
  })

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.2)' }}>
            <Zap style={{ width: 18, height: 18, color: '#fbbf24' }} />
          </div>
          <div>
            <h3 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, color:'var(--text-primary)', fontSize: 15 }}>Treino alternativo por IA</h3>
            <p style={{ fontSize: 12, color:'var(--text-muted)', marginTop: 1 }}>Informe o equipamento indisponivel</p>
          </div>
        </div>

        <div className="flex gap-3">
          <input
            className="input flex-1"
            placeholder="Ex: barra, rack, pull-down, halteres..."
            value={equipamento}
            onChange={e => setEquipamento(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && equipamento && !isPending && mutate()}
          />
          <button className="btn-primary px-5" disabled={isPending || !equipamento} onClick={() => mutate()}>
            {isPending
              ? <span className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} />
              : <Zap style={{ width: 16, height: 16 }} />}
          </button>
        </div>
        <p style={{ fontSize: 12, color:'var(--text-muted)', marginTop: 10, lineHeight: 1.5 }}>
          A IA sugerira exercicios alternativos que preservam o grupo muscular, adaptados para o equipamento disponivel.
        </p>
      </div>

      {isPending && (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center animate-bounce-light"
            style={{ background: 'rgba(124,58,237,0.15)' }}>
            <Brain style={{ width: 26, height: 26, color: '#a78bfa' }} />
          </div>
          <p style={{ fontSize: 13, color:'var(--text-muted)', fontWeight: 500 }}>Gerando alternativas com IA...</p>
          <p style={{ fontSize: 11, color:'var(--text-muted)' }}>Isso pode levar alguns segundos</p>
        </div>
      )}

      {resultado && !isPending && (
        <div className="card space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles style={{ width: 15, height: 15, color: '#a78bfa' }} />
            <h4 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, color:'var(--text-primary)', fontSize: 15 }}>Sugestoes da IA</h4>
          </div>

          {resultado.itens?.length === 0 ? (
            <p style={{ fontSize: 13, color:'var(--text-muted)' }}>Nenhum exercicio precisa de substituicao para esse equipamento.</p>
          ) : (
            <div className="space-y-3">
              {(resultado.itens || []).map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 p-4 rounded-2xl animate-slide-up"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                    style={{ background: 'rgba(99,102,241,0.2)', color: '#fca5a5', fontFamily: 'Inter, sans-serif' }}>
                    {idx + 1}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap text-sm mb-1.5">
                      <span style={{ color: '#f87171', textDecoration: 'line-through', fontWeight: 500 }}>{item.exercicio_original}</span>
                      <span style={{ color:'var(--text-muted)', fontSize: 16 }}>→</span>
                      <span style={{ color: '#34d399', fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>{item.exercicio_alternativo}</span>
                    </div>
                    <p style={{ fontSize: 12, color:'var(--text-muted)', lineHeight: 1.5 }}>{item.motivo}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {resultado.observacoes && (
            <div className="alert-info text-sm flex items-start gap-2">
              <span style={{ flexShrink: 0 }}>💡</span>
              <span>{resultado.observacoes}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

