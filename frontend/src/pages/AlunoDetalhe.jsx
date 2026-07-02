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
  Plus, Loader2, Edit2, Check, X,
} from 'lucide-react'

function Tab({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
        active ? 'border-primary-600 text-primary-700' : 'border-transparent text-gray-500 hover:text-gray-700'
      }`}
    >
      {label}
    </button>
  )
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

  if (isLoading)
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link to="/alunos" className="mt-1 text-gray-400 hover:text-gray-600">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          {editNome ? (
            <div className="flex items-center gap-2">
              <input
                className="input text-xl font-bold py-1"
                value={nomeTemp}
                onChange={(e) => setNomeTemp(e.target.value)}
              />
              <button onClick={() => updateNome({ nome: nomeTemp })} className="text-green-600">
                <Check className="w-5 h-5" />
              </button>
              <button onClick={() => setEditNome(false)} className="text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">{aluno?.nome}</h1>
              <button
                onClick={() => { setNomeTemp(aluno.nome); setEditNome(true) }}
                className="text-gray-400 hover:text-gray-600"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
          )}
          <p className="text-gray-500">{aluno?.email}</p>
          {aluno?.objetivo && <p className="text-sm text-primary-600 mt-0.5">{aluno.objetivo}</p>}
        </div>

        {/* Streak badge */}
        {gami && (
          <div className="flex items-center gap-1.5 bg-orange-50 border border-orange-200 rounded-xl px-3 py-2">
            <Flame className="w-5 h-5 text-orange-500" />
            <div>
              <div className="text-lg font-bold text-orange-600">{gami.streak_atual}</div>
              <div className="text-xs text-orange-400">dias seguidos</div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 flex gap-2 overflow-x-auto">
        {[
          { key: 'treinos', label: 'Treinos' },
          { key: 'gamificacao', label: 'Gamificação' },
          { key: 'sugestoes', label: `IA${sugestoes?.sugestoes_pendentes?.length ? ` (${sugestoes.sugestoes_pendentes.length})` : ''}` },
          { key: 'anamnese', label: 'Anamnese' },
        ].map(({ key, label }) => (
          <Tab key={key} label={label} active={tab === key} onClick={() => setTab(key)} />
        ))}
      </div>

      {/* Tab content */}
      {tab === 'treinos' && (
        <TreinosTab aluno={aluno} treinos={treinos} onCriar={(nome, dia) => criarT({ aluno_id: Number(id), nome, dia_semana: dia })} />
      )}
      {tab === 'gamificacao' && <GamificacaoTab gami={gami} />}
      {tab === 'sugestoes' && <SugestoesTab sugestoes={sugestoes} />}
      {tab === 'anamnese' && <AnamneseTab anamnese={anamnese} onSalvar={salvarAnam} saving={savingAnam} />}
    </div>
  )
}

function TreinosTab({ aluno, treinos, onCriar }) {
  const [showForm, setShowForm] = useState(false)
  const [nome, setNome] = useState('')
  const [dia, setDia] = useState('')
  const DIAS = ['segunda','terca','quarta','quinta','sexta','sabado','domingo']

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="font-semibold text-gray-900">Treinos de {aluno?.nome?.split(' ')[0]}</h2>
        <button className="btn-primary flex items-center gap-2" onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4" /> Novo treino
        </button>
      </div>

      {showForm && (
        <div className="card border-primary-200 border-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <input className="input" placeholder="Nome (ex: Treino A — Peito)" value={nome} onChange={(e) => setNome(e.target.value)} />
            <select className="input" value={dia} onChange={(e) => setDia(e.target.value)}>
              <option value="">Dia da semana (opcional)</option>
              {DIAS.map((d) => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <button className="btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
            <button className="btn-primary" disabled={!nome} onClick={() => { onCriar(nome, dia); setShowForm(false); setNome(''); setDia('') }}>
              Criar treino
            </button>
          </div>
        </div>
      )}

      {treinos.length === 0 ? (
        <div className="text-center py-8 text-gray-400">Nenhum treino cadastrado.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {treinos.map((t) => (
            <Link key={t.id} to={`/treinos/${t.id}`} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold text-gray-900">{t.nome}</div>
                  {t.dia_semana && (
                    <span className="badge-blue mt-1">{t.dia_semana.charAt(0).toUpperCase() + t.dia_semana.slice(1)}</span>
                  )}
                </div>
                <Dumbbell className="w-5 h-5 text-gray-400" />
              </div>
              <div className="text-sm text-gray-400 mt-2">{t.itens?.length || 0} exercício{t.itens?.length !== 1 ? 's' : ''}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

function GamificacaoTab({ gami }) {
  if (!gami) return <div className="text-gray-400 text-center py-8"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>

  const BADGES = {
    primeiro_treino: '🏋️ Primeiro treino',
    streak_7: '🔥 7 dias seguidos',
    streak_30: '🏆 30 dias seguidos',
    treinos_10: '💪 10 treinos',
    treinos_50: '⭐ 50 treinos',
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Streak atual', value: gami.streak_atual, icon: '🔥', color: 'bg-orange-50 border-orange-200' },
          { label: 'Recorde', value: gami.streak_recorde, icon: '🏆', color: 'bg-yellow-50 border-yellow-200' },
          { label: 'Total treinos', value: gami.total_treinos, icon: '💪', color: 'bg-green-50 border-green-200' },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className={`card border-2 ${color} text-center`}>
            <div className="text-3xl mb-1">{icon}</div>
            <div className="text-2xl font-bold text-gray-900">{value}</div>
            <div className="text-xs text-gray-500">{label}</div>
          </div>
        ))}
      </div>

      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Conquistas</h3>
        {gami.conquistas.length === 0 ? (
          <p className="text-gray-400 text-sm">Nenhuma conquista ainda — continue treinando!</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {gami.conquistas.map((c) => (
              <div key={c.id} className="card border-2 border-yellow-200 bg-yellow-50 text-center p-3">
                <div className="text-2xl mb-1">{BADGES[c.codigo]?.split(' ')[0] || '🎖️'}</div>
                <div className="text-xs font-semibold text-gray-700">{c.descricao}</div>
                <div className="text-xs text-gray-400 mt-1">
                  {new Date(c.desbloqueado_em).toLocaleDateString('pt-BR')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function SugestoesTab({ sugestoes }) {
  if (!sugestoes) return <div className="text-gray-400 text-center py-8"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>

  const COR = { aumentar: 'badge-green', manter: 'badge-blue', reduzir: 'badge-red' }

  return (
    <div className="space-y-4">
      {sugestoes.dias_sem_treinar !== null && (
        <div className={`p-4 rounded-xl border ${sugestoes.dias_sem_treinar > 7 ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'}`}>
          <span className={`font-medium ${sugestoes.dias_sem_treinar > 7 ? 'text-red-700' : 'text-blue-700'}`}>
            {sugestoes.dias_sem_treinar === 0
              ? '✅ Treinou hoje!'
              : sugestoes.dias_sem_treinar > 7
              ? `⚠️ ${sugestoes.dias_sem_treinar} dias sem treinar — entrar em contato?`
              : `ℹ️ Último treino há ${sugestoes.dias_sem_treinar} dia${sugestoes.dias_sem_treinar > 1 ? 's' : ''}`}
          </span>
        </div>
      )}

      {sugestoes.sugestoes_pendentes.length === 0 ? (
        <div className="text-center py-8">
          <Brain className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-400 text-sm">
            Nenhuma sugestão ainda. A IA precisa de ao menos 3 execuções do mesmo exercício.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sugestoes.sugestoes_pendentes.map((s) => (
            <div key={s.id} className="card">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={COR[s.acao] || 'badge-blue'}>
                      {s.acao.charAt(0).toUpperCase() + s.acao.slice(1)} carga
                    </span>
                    {s.carga_sugerida && (
                      <span className="text-sm font-semibold text-gray-700">{s.carga_sugerida} kg</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{s.motivo}</p>
                </div>
              </div>
            </div>
          ))}
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

  return (
    <div className="space-y-4">
      <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
        🔒 Dado sensível — trafegado criptografado e não logado (LGPD)
      </p>
      <div className="card space-y-4">
        {[
          { label: 'Objetivo', key: 'objetivo', placeholder: 'Ex: perder peso, ganhar massa...' },
          { label: 'Histórico médico', key: 'historico_medico', placeholder: 'Cirurgias, doenças, etc.' },
          { label: 'Nível de atividade', key: 'nivel_atividade', placeholder: 'sedentario / ativo / muito_ativo' },
          { label: 'Observações', key: 'observacoes', placeholder: 'Observações gerais...' },
        ].map(({ label, key, placeholder }) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <textarea
              className="input resize-none"
              rows={2}
              placeholder={placeholder}
              value={form[key] || ''}
              onChange={set(key)}
            />
          </div>
        ))}
        <button className="btn-primary" disabled={saving} onClick={() => onSalvar(form)}>
          {saving ? 'Salvando...' : 'Salvar anamnese'}
        </button>
      </div>
    </div>
  )
}
