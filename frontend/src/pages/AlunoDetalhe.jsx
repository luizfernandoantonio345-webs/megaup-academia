import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  obterAluno, listarTreinos, gamificacaoAluno, sugestoesAluno,
  obterAnamnese, salvarAnamnese, criarTreino, atualizarAluno,
} from '../api'
import toast from 'react-hot-toast'
import {
  ArrowLeft, Dumbbell, Flame, Trophy, Brain, ClipboardList,
  Plus, Loader2, Edit2, Check, X, TrendingUp, TrendingDown, Minus,
} from 'lucide-react'

function Avatar({ nome, size = 'lg' }) {
  const initials = nome?.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
  const cl = size === 'lg' ? 'w-16 h-16 text-xl' : 'w-10 h-10 text-sm'
  return (
    <div className={`${cl} bg-gradient-to-br from-primary-500 to-violet-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0`}>
      {initials}
    </div>
  )
}

const ACAO_CONFIG = {
  aumentar: { icon: TrendingUp,  badge: 'badge-green',  label: 'Aumentar', bg: 'bg-emerald-50 border-emerald-200', iconColor: 'text-emerald-500' },
  manter:   { icon: Minus,       badge: 'badge-blue',   label: 'Manter',   bg: 'bg-blue-50 border-blue-200',       iconColor: 'text-blue-500'    },
  reduzir:  { icon: TrendingDown,badge: 'badge-red',    label: 'Reduzir',  bg: 'bg-red-50 border-red-200',         iconColor: 'text-red-500'     },
}

export default function AlunoDetalhe() {
  const { id } = useParams()
  const qc = useQueryClient()
  const [tab, setTab] = useState('treinos')
  const [editNome, setEditNome] = useState(false)
  const [nomeTemp, setNomeTemp] = useState('')

  const { data: aluno, isLoading } = useQuery({
    queryKey: ['aluno', id],
    queryFn: () => obterAluno(id).then((r) => r.data),
  })
  const { data: treinos = [] } = useQuery({
    queryKey: ['treinos', id],
    queryFn: () => listarTreinos(id).then((r) => r.data),
  })
  const { data: gami } = useQuery({
    queryKey: ['gamificacao', id],
    queryFn: () => gamificacaoAluno(id).then((r) => r.data),
  })
  const { data: sugestoes } = useQuery({
    queryKey: ['sugestoes', id],
    queryFn: () => sugestoesAluno(id).then((r) => r.data),
  })
  const { data: anamnese } = useQuery({
    queryKey: ['anamnese', id],
    queryFn: () => obterAnamnese(id).then((r) => r.data),
    enabled: tab === 'anamnese',
  })

  const { mutate: updateNome } = useMutation({
    mutationFn: (data) => atualizarAluno(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['aluno', id] }); setEditNome(false) },
    onError: () => toast.error('Erro ao salvar'),
  })

  const { mutate: salvarAnam, isPending: savingAnam } = useMutation({
    mutationFn: (data) => salvarAnamnese(id, data),
    onSuccess: () => { toast.success('Anamnese salva!'); qc.invalidateQueries({ queryKey: ['anamnese', id] }) },
    onError: () => toast.error('Erro ao salvar anamnese'),
  })

  const { mutate: criarT } = useMutation({
    mutationFn: (data) => criarTreino(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['treinos', id] }); toast.success('Treino criado!') },
    onError: (err) => toast.error(err.response?.data?.detail || 'Erro'),
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  const nSugestoes = sugestoes?.sugestoes_pendentes?.length || 0

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back */}
      <Link to="/alunos" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Voltar para alunos
      </Link>

      {/* Student header card */}
      <div className="card">
        <div className="flex items-start gap-4">
          <Avatar nome={aluno?.nome} />
          <div className="flex-1 min-w-0">
            {editNome ? (
              <div className="flex items-center gap-2 mb-1">
                <input
                  className="input text-lg font-bold py-1.5"
                  value={nomeTemp}
                  onChange={(e) => setNomeTemp(e.target.value)}
                  autoFocus
                />
                <button onClick={() => updateNome({ nome: nomeTemp })} className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center hover:bg-emerald-200 transition-colors">
                  <Check className="w-4 h-4" />
                </button>
                <button onClick={() => setEditNome(false)} className="w-8 h-8 bg-gray-100 text-gray-500 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 mb-0.5">
                <h1 className="text-xl font-bold text-gray-900">{aluno?.nome}</h1>
                <button
                  onClick={() => { setNomeTemp(aluno.nome); setEditNome(true) }}
                  className="text-gray-300 hover:text-gray-500 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            <p className="text-sm text-gray-500">{aluno?.email}</p>
            {aluno?.objetivo && (
              <span className="badge-blue mt-2 text-xs">{aluno.objetivo}</span>
            )}
          </div>

          {/* Streak badge */}
          {gami && gami.streak_atual > 0 && (
            <div className="flex-shrink-0 flex flex-col items-center gap-1 bg-gradient-to-br from-orange-400 to-red-500 text-white rounded-2xl px-4 py-3 shadow-glow-amber">
              <Flame className="w-5 h-5" />
              <div className="text-2xl font-black">{gami.streak_atual}</div>
              <div className="text-xs text-white/70">streak</div>
            </div>
          )}
        </div>

        {/* Quick stats */}
        {gami && (
          <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-gray-100">
            {[
              { label: 'Streak atual', value: `${gami.streak_atual}🔥`, color: 'text-orange-600' },
              { label: 'Recorde', value: `${gami.streak_recorde}🏆`, color: 'text-yellow-600' },
              { label: 'Total treinos', value: `${gami.total_treinos}💪`, color: 'text-emerald-600' },
            ].map(({ label, value, color }) => (
              <div key={label} className="text-center">
                <div className={`text-xl font-bold ${color}`}>{value}</div>
                <div className="text-xs text-gray-400 mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="tabs">
        {[
          { key: 'treinos',     icon: Dumbbell,      label: 'Treinos'                                      },
          { key: 'gamificacao', icon: Trophy,         label: 'Gamificação'                                  },
          { key: 'sugestoes',   icon: Brain,         label: `IA${nSugestoes ? ` (${nSugestoes})` : ''}`   },
          { key: 'anamnese',    icon: ClipboardList, label: 'Anamnese'                                     },
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

      {/* Tab content */}
      <div className="animate-fade-in">
        {tab === 'treinos'     && <TreinosTab aluno={aluno} treinos={treinos} onCriar={(nome, dia) => criarT({ aluno_id: Number(id), nome, dia_semana: dia })} />}
        {tab === 'gamificacao' && <GamificacaoTab gami={gami} />}
        {tab === 'sugestoes'   && <SugestoesTab sugestoes={sugestoes} />}
        {tab === 'anamnese'    && <AnamneseTab anamnese={anamnese} onSalvar={salvarAnam} saving={savingAnam} />}
      </div>
    </div>
  )
}

function TreinosTab({ aluno, treinos, onCriar }) {
  const [showForm, setShowForm] = useState(false)
  const [nome, setNome] = useState('')
  const [dia, setDia] = useState('')
  const DIAS = ['segunda','terca','quarta','quinta','sexta','sabado','domingo']
  const DIAS_LABEL = { segunda:'Segunda',terca:'Terça',quarta:'Quarta',quinta:'Quinta',sexta:'Sexta',sabado:'Sábado',domingo:'Domingo' }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-gray-900">Treinos de {aluno?.nome?.split(' ')[0]}</h2>
        <button className="btn-gradient btn-sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="w-3.5 h-3.5" /> Novo treino
        </button>
      </div>

      {showForm && (
        <div className="card border-2 border-primary-200 animate-slide-down">
          <h3 className="font-semibold text-gray-900 mb-4">Novo treino</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <div>
              <label className="label">Nome do treino *</label>
              <input className="input" placeholder="Ex: Treino A — Peito e Tríceps" value={nome} onChange={(e) => setNome(e.target.value)} />
            </div>
            <div>
              <label className="label">Dia da semana</label>
              <select className="input" value={dia} onChange={(e) => setDia(e.target.value)}>
                <option value="">Qualquer dia (sem dia fixo)</option>
                {DIAS.map((d) => <option key={d} value={d}>{DIAS_LABEL[d]}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
            <button
              className="btn-gradient"
              disabled={!nome}
              onClick={() => { onCriar(nome, dia); setShowForm(false); setNome(''); setDia('') }}
            >
              Criar treino
            </button>
          </div>
        </div>
      )}

      {treinos.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-icon bg-primary-50">
            <Dumbbell className="w-8 h-8 text-primary-400" />
          </div>
          <p className="empty-title">Nenhum treino ainda</p>
          <p className="empty-message">Crie o primeiro treino para {aluno?.nome?.split(' ')[0]}</p>
          <button className="btn-gradient" onClick={() => setShowForm(true)}>Criar primeiro treino</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {treinos.map((t) => (
            <Link
              key={t.id}
              to={`/treinos/${t.id}`}
              className="card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 group"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-bold text-gray-900">{t.nome}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{t.itens?.length || 0} exercício{t.itens?.length !== 1 ? 's' : ''}</div>
                </div>
                <div className="w-8 h-8 bg-primary-50 group-hover:bg-primary-100 rounded-xl flex items-center justify-center transition-colors">
                  <Dumbbell className="w-4 h-4 text-primary-600" />
                </div>
              </div>
              {t.dia_semana && (
                <span className="badge-blue capitalize">{t.dia_semana}</span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

function GamificacaoTab({ gami }) {
  if (!gami) return (
    <div className="flex justify-center py-12">
      <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
    </div>
  )

  const BADGES = {
    primeiro_treino: { emoji: '🏋️', label: 'Primeiro treino', color: 'border-gray-200 bg-gray-50' },
    streak_7:        { emoji: '🔥', label: '7 dias seguidos', color: 'border-orange-200 bg-orange-50' },
    streak_30:       { emoji: '🏆', label: '30 dias seguidos', color: 'border-yellow-200 bg-yellow-50' },
    treinos_10:      { emoji: '💪', label: '10 treinos', color: 'border-emerald-200 bg-emerald-50' },
    treinos_50:      { emoji: '⭐', label: '50 treinos', color: 'border-violet-200 bg-violet-50' },
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Streak atual', value: gami.streak_atual, emoji: '🔥', color: 'border-orange-200 bg-orange-50' },
          { label: 'Recorde',      value: gami.streak_recorde, emoji: '🏆', color: 'border-yellow-200 bg-yellow-50' },
          { label: 'Total treinos',value: gami.total_treinos, emoji: '💪', color: 'border-emerald-200 bg-emerald-50' },
        ].map(({ label, value, emoji, color }) => (
          <div key={label} className={`card border-2 ${color} text-center`}>
            <div className="text-3xl mb-1">{emoji}</div>
            <div className="text-2xl font-black text-gray-900">{value}</div>
            <div className="text-xs text-gray-500 font-medium">{label}</div>
          </div>
        ))}
      </div>

      <div>
        <p className="section-title">Conquistas desbloqueadas</p>
        {gami.conquistas.length === 0 ? (
          <div className="card empty-state py-10">
            <div className="text-4xl mb-3">🎯</div>
            <p className="empty-title">Nenhuma conquista ainda</p>
            <p className="empty-message">Continue treinando para desbloquear as primeiras conquistas!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {gami.conquistas.map((c) => {
              const b = BADGES[c.codigo] || { emoji: '🎖️', label: c.descricao, color: 'border-gray-200 bg-gray-50' }
              return (
                <div key={c.id} className={`card border-2 ${b.color} text-center p-4`}>
                  <div className="text-3xl mb-1.5">{b.emoji}</div>
                  <div className="text-xs font-bold text-gray-700">{b.label}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {new Date(c.desbloqueado_em).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function SugestoesTab({ sugestoes }) {
  if (!sugestoes) return (
    <div className="flex justify-center py-12">
      <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
    </div>
  )

  return (
    <div className="space-y-4">
      {sugestoes.dias_sem_treinar !== null && (
        <div className={`p-4 rounded-2xl border ${
          sugestoes.dias_sem_treinar === 0
            ? 'bg-emerald-50 border-emerald-200'
            : sugestoes.dias_sem_treinar > 7
              ? 'bg-red-50 border-red-200'
              : 'bg-amber-50 border-amber-200'
        }`}>
          <p className={`font-semibold text-sm ${
            sugestoes.dias_sem_treinar === 0 ? 'text-emerald-700' : sugestoes.dias_sem_treinar > 7 ? 'text-red-700' : 'text-amber-700'
          }`}>
            {sugestoes.dias_sem_treinar === 0
              ? '✅ Treinou hoje!'
              : sugestoes.dias_sem_treinar > 7
                ? `⚠️ ${sugestoes.dias_sem_treinar} dias sem treinar — vale entrar em contato!`
                : `⏱️ Último treino há ${sugestoes.dias_sem_treinar} dia${sugestoes.dias_sem_treinar > 1 ? 's' : ''}`}
          </p>
        </div>
      )}

      {sugestoes.sugestoes_pendentes.length === 0 ? (
        <div className="card empty-state py-10">
          <div className="empty-icon bg-violet-50">
            <Brain className="w-8 h-8 text-violet-400" />
          </div>
          <p className="empty-title">Sem sugestões ainda</p>
          <p className="empty-message">A IA precisa de pelo menos 3 execuções do mesmo exercício.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sugestoes.sugestoes_pendentes.map((s) => {
            const cfg = ACAO_CONFIG[s.acao] || ACAO_CONFIG.manter
            const IconAcao = cfg.icon
            return (
              <div key={s.id} className={`rounded-2xl border p-4 ${cfg.bg}`}>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-white/70 rounded-xl flex items-center justify-center flex-shrink-0">
                    <IconAcao className={`w-4.5 h-4.5 ${cfg.iconColor}`} style={{ width: 18, height: 18 }} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={cfg.badge}>{cfg.label} carga</span>
                      {s.carga_sugerida && (
                        <span className="text-sm font-bold text-gray-800">→ {s.carga_sugerida} kg</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700">{s.motivo}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function AnamneseTab({ anamnese, onSalvar, saving }) {
  const [form, setForm] = useState(anamnese || {
    objetivo: '', historico_medico: '', restricoes: [], medicamentos: [], nivel_atividade: '', lesoes: [], observacoes: '',
  })
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const fields = [
    { label: 'Objetivo de saúde/fitness',  key: 'objetivo',         placeholder: 'Ex: perder peso, ganhar massa, condicionamento...' },
    { label: 'Histórico médico',           key: 'historico_medico', placeholder: 'Cirurgias, doenças crônicas, condições...'          },
    { label: 'Nível de atividade física',  key: 'nivel_atividade',  placeholder: 'sedentário / ativo / muito ativo'                   },
    { label: 'Observações adicionais',     key: 'observacoes',      placeholder: 'Qualquer observação relevante...'                   },
  ]

  return (
    <div className="space-y-5">
      <div className="alert-warning flex items-start gap-2">
        <span>🔒</span>
        <span>Dados sensíveis — trafegados com criptografia e não são registrados em logs (LGPD Art. 11).</span>
      </div>
      <div className="card space-y-5">
        {fields.map(({ label, key, placeholder }) => (
          <div key={key}>
            <label className="label">{label}</label>
            <textarea
              className="input resize-none"
              rows={3}
              placeholder={placeholder}
              value={form[key] || ''}
              onChange={set(key)}
            />
          </div>
        ))}
        <button className="btn-gradient" disabled={saving} onClick={() => onSalvar(form)}>
          {saving ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Salvando...
            </span>
          ) : 'Salvar anamnese'}
        </button>
      </div>
    </div>
  )
}
