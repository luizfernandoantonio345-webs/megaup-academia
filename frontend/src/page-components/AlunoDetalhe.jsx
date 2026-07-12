import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { obterAluno, listarTreinos, gamificacaoAluno, sugestoesAluno, obterAnamnese, salvarAnamnese, criarTreino, atualizarAluno, listarExercicios, historicoCarga, listarAvaliacoes, criarAvaliacao, deletarAvaliacao, listarTemplates, aplicarTemplate } from '../api'
import toast from 'react-hot-toast'
import { ArrowLeft, Dumbbell, Flame, Trophy, ClipboardList, Plus, Loader2, Edit2, Check, X, TrendingUp, TrendingDown, Minus, BarChart2, ChevronDown, MessageCircle, Scale, Trash2, FileText, Copy } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import ChatBox from '../components/ChatBox'
import NutricaoTab from '../components/NutricaoTab'
import FotosEvolucaoTab from '../components/FotosEvolucaoTab'

function Avatar({ nome }) {
  const initials = nome?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
  return (
    <div style={{ width:64, height:64, borderRadius:'50%', background:'var(--bg-elevated)', border:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, fontWeight:600, color:'var(--text-secondary)', flexShrink:0 }}>
      {initials}
    </div>
  )
}

const ACAO_CONFIG = {
  aumentar: { icon:TrendingUp,  label:'Aumentar', bg:'rgba(16,185,129,0.1)',  border:'rgba(16,185,129,0.25)', text:'#34d399',  iconColor:'#10b981' },
  manter:   { icon:Minus,       label:'Manter',   bg:'rgba(99,102,241,0.1)', border:'rgba(99,102,241,0.25)',text:'#fca5a5',  iconColor:'#ef4444' },
  reduzir:  { icon:TrendingDown,label:'Reduzir',  bg:'rgba(239,68,68,0.1)',  border:'rgba(239,68,68,0.25)',  text:'#f87171',  iconColor:'#ef4444' },
}

export default function AlunoDetalhe() {
  const { id } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [tab, setTab] = useState('treinos')
  const [editNome, setEditNome] = useState(false)
  const [nomeTemp, setNomeTemp] = useState('')

  const ST = 5 * 60_000
  const PD = (prev) => prev
  const { data: aluno, isLoading } = useQuery({ queryKey:['aluno', id], queryFn: () => obterAluno(id).then(r => r.data), staleTime: ST, placeholderData: PD })
  const { data: treinos = [] } = useQuery({ queryKey:['treinos', id], queryFn: () => listarTreinos(id).then(r => r.data), staleTime: ST, placeholderData: PD })
  const { data: gami }   = useQuery({ queryKey:['gamificacao', id], queryFn: () => gamificacaoAluno(id).then(r => r.data), staleTime: ST, placeholderData: PD })
  // sugestoes: lazy — só busca quando o tab é aberto (evita request desnecessário no carregamento)
  const { data: sugestoes } = useQuery({ queryKey:['sugestoes', id], queryFn: () => sugestoesAluno(id).then(r => r.data), staleTime: ST, enabled: tab === 'sugestoes' })
  const { data: anamnese }  = useQuery({ queryKey:['anamnese', id], queryFn: () => obterAnamnese(id).then(r => r.data), enabled: tab === 'anamnese', staleTime: ST })
  const { data: exercicios = [] } = useQuery({ queryKey:['exercicios'], queryFn: () => listarExercicios().then(r => r.data), enabled: tab === 'progresso', staleTime: ST })
  const { data: avaliacoes = [], refetch: refetchAv } = useQuery({ queryKey:['avaliacoes', id], queryFn: () => listarAvaliacoes(id).then(r => r.data), enabled: tab === 'avaliacao', staleTime: ST })

  const { mutate: updateNome } = useMutation({
    mutationFn: data => atualizarAluno(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey:['aluno', id] }); setEditNome(false) },
    onError: () => toast.error('Erro ao salvar'),
  })
  const { mutate: salvarAnam, isPending: savingAnam } = useMutation({
    mutationFn: data => salvarAnamnese(id, data),
    onSuccess: () => { toast.success('Anamnese salva!'); qc.invalidateQueries({ queryKey:['anamnese', id] }) },
    onError: () => toast.error('Erro ao salvar anamnese'),
  })
  const { mutate: criarT } = useMutation({
    mutationFn: data => criarTreino(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey:['treinos', id] }); toast.success('Treino criado!') },
    onError: err => toast.error(err.response?.data?.detail || 'Erro'),
  })

  const nSugestoes = sugestoes?.sugestoes_pendentes?.length || 0

  return (
    <div className="space-y-6 animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/alunos" className="inline-flex items-center gap-2 text-sm font-medium transition-colors" style={{ color:'var(--text-muted)' }}
          onMouseEnter={e => e.currentTarget.style.color='var(--text-secondary)'}
          onMouseLeave={e => e.currentTarget.style.color='var(--text-muted)'}>
          <ArrowLeft style={{ width:15, height:15 }} /> Voltar para alunos
        </Link>
        <button
          onClick={() => navigate(`/alunos/${id}/relatorio`)}
          style={{ background:'rgba(99,102,241,0.12)', border:'1px solid rgba(99,102,241,0.25)', borderRadius:12, color:'#f87171', cursor:'pointer', fontWeight:600, fontSize:13, padding:'8px 16px', display:'flex', alignItems:'center', gap:6 }}
        >
          <FileText style={{ width:14, height:14 }} /> Relatório PDF
        </button>
      </div>

      {/* Student header */}
      <div className="card">
        {isLoading ? (
          <div style={{ display:'flex', gap:16, alignItems:'center' }}>
            <div className="skeleton" style={{ width:64, height:64, borderRadius:'50%', flexShrink:0 }} />
            <div style={{ flex:1, display:'flex', flexDirection:'column', gap:8 }}>
              <div className="skeleton" style={{ height:20, width:'40%', borderRadius:6 }} />
              <div className="skeleton" style={{ height:14, width:'60%', borderRadius:6 }} />
            </div>
          </div>
        ) : (
        <div className="flex items-start gap-4">
          <Avatar nome={aluno?.nome} />
          <div className="flex-1 min-w-0">
            {editNome ? (
              <div className="flex items-center gap-2 mb-1">
                <input className="input text-lg font-bold py-1.5" value={nomeTemp} onChange={e => setNomeTemp(e.target.value)} autoFocus style={{ fontFamily:'Inter, sans-serif' }} />
                <button onClick={() => updateNome({ nome: nomeTemp })} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background:'rgba(16,185,129,0.2)', color:'#34d399' }}>
                  <Check style={{ width:14, height:14 }} />
                </button>
                <button onClick={() => setEditNome(false)} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background:'rgba(255,255,255,0.07)', color:'var(--text-muted)' }}>
                  <X style={{ width:14, height:14 }} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 mb-0.5">
                <h1 style={{ fontFamily:'Inter, sans-serif', fontSize:20, fontWeight:600, color:'var(--text-primary)', letterSpacing:'-0.02em' }}>{aluno?.nome}</h1>
                <button onClick={() => { setNomeTemp(aluno?.nome || ''); setEditNome(true) }} style={{ color:'var(--text-disabled)', background:'none', border:'none', cursor:'pointer', padding:2 }}>
                  <Edit2 style={{ width:13, height:13 }} />
                </button>
              </div>
            )}
            <p style={{ fontSize:13, color:'var(--text-muted)' }}>{aluno?.email}</p>
            {aluno?.objetivo && <span className="badge-blue mt-2 text-xs">{aluno.objetivo}</span>}
          </div>

          {gami && gami.streak_atual > 0 && (
            <div className="flex-shrink-0 flex flex-col items-center gap-1 rounded-2xl px-4 py-3 text-white" style={{ background:'#c2410c' }}>
              <Flame style={{ width:18, height:18 }} />
              <div style={{ fontFamily:'Inter, sans-serif', fontSize:24, fontWeight:600, lineHeight:1 }}>{gami.streak_atual}</div>
              <div style={{ fontSize:10, color:'rgba(255,255,255,0.6)', fontWeight:600 }}>streak</div>
            </div>
          )}
        </div>
        )}

        {gami && (
          <div className="grid grid-cols-3 gap-3 mt-5 pt-5" style={{ borderTop:'1px solid rgba(255,255,255,0.05)' }}>
            {[
              { label:'Streak', value:`${gami.streak_atual}🔥`, color:'#f97316' },
              { label:'Recorde', value:`${gami.streak_recorde}🏆`, color:'#fbbf24' },
              { label:'Treinos', value:`${gami.total_treinos}💪`, color:'#34d399' },
            ].map(({ label, value, color }) => (
              <div key={label} className="text-center">
                <div style={{ fontFamily:'Inter, sans-serif', fontSize:20, fontWeight:600, color }}>{value}</div>
                <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:2, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em' }}>{label}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="tabs">
        {[
          { key:'treinos',     label:'Treinos' },
          { key:'progresso',   label:'Progresso' },
          { key:'avaliacao',   label:'Avaliação' },
          { key:'fotos',       label:'Fotos' },
          { key:'gamificacao', label:'Conquistas' },
          { key:'sugestoes',   label:`Sugestões${nSugestoes ? ` (${nSugestoes})` : ''}` },
          { key:'anamnese',    label:'Anamnese' },
          { key:'nutricao',    label:'Nutrição' },
          { key:'chat',        label:'Chat' },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => setTab(key)} className={`tab ${tab === key ? 'tab-active' : 'tab-inactive'}`}>{label}</button>
        ))}
      </div>

      <div className="animate-fade-in">
        {tab === 'treinos'     && <TreinosTab aluno={aluno} treinos={treinos} onCriar={(nome, dia) => criarT({ aluno_id:Number(id), nome, dia_semana:dia })} />}
        {tab === 'progresso'   && <ProgresoTab alunoId={id} treinos={treinos} exercicios={exercicios} />}
        {tab === 'avaliacao'   && <AvaliacaoTab alunoId={id} avaliacoes={avaliacoes} onRefresh={refetchAv} />}
        {tab === 'fotos'       && <FotosEvolucaoTab alunoId={Number(id)} />}
        {tab === 'gamificacao' && <GamificacaoTab gami={gami} />}
        {tab === 'sugestoes'   && <SugestoesTab sugestoes={sugestoes} />}
        {tab === 'anamnese'    && <AnamneseTab anamnese={anamnese} onSalvar={salvarAnam} saving={savingAnam} />}
        {tab === 'nutricao'    && <NutricaoTab alunoId={Number(id)} />}
        {tab === 'chat'        && (
          <div className="card" style={{ height: 520 }}>
            <div className="flex items-center gap-2 mb-4" style={{ borderBottom:'1px solid rgba(255,255,255,0.06)', paddingBottom:14 }}>
              <div style={{ width:32, height:32, borderRadius:10, background:'rgba(99,102,241,0.15)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <MessageCircle style={{ width:14, height:14, color:'#f87171' }} />
              </div>
              <div>
                <p style={{ fontFamily:'Inter, sans-serif', fontWeight:600, color:'var(--text-primary)', fontSize:14, lineHeight:1 }}>Chat com {aluno?.nome?.split(' ')[0]}</p>
                <p style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }}>As mensagens são privadas entre você e o aluno</p>
              </div>
            </div>
            <ChatBox alunoId={Number(id)} outroNome={aluno?.nome?.split(' ')[0]} />
          </div>
        )}
      </div>
    </div>
  )
}

function ProgresoTab({ alunoId, treinos, exercicios }) {
  const exIds = [...new Set((treinos || []).flatMap(t => (t.itens || []).map(i => i.exercicio_id)))]
  const exMap = Object.fromEntries(exercicios.map(e => [e.id, e]))
  const availableEx = exIds.map(eid => exMap[eid]).filter(Boolean)
  const [selectedExId, setSelectedExId] = useState(availableEx[0]?.id || null)

  const { data: hist, isLoading } = useQuery({
    queryKey: ['historico-carga', alunoId, selectedExId],
    queryFn: () => historicoCarga(alunoId, selectedExId).then(r => r.data),
    enabled: !!alunoId && !!selectedExId,
    retry: false,
  })

  const sessions = hist?.historico || hist?.execucoes || []
  const chartData = sessions.map(s => ({
    data: s.data ? new Date(s.data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
      : s.created_at ? new Date(s.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : '—',
    carga: s.carga_realizada != null ? Number(s.carga_realizada) : null,
    reps: s.repeticoes_realizadas || null,
  })).filter(d => d.carga != null)

  const maxCarga = chartData.length > 0 ? Math.max(...chartData.map(d => d.carga)) : 0
  const lastCarga = chartData.length > 0 ? chartData[chartData.length - 1].carga : null
  const prevCarga = chartData.length > 1 ? chartData[chartData.length - 2].carga : null
  const delta = lastCarga != null && prevCarga != null ? lastCarga - prevCarga : null

  const DotTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
      <div style={{ background:'var(--bg-card)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 12, padding: '8px 14px', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
        <p style={{ color:'var(--text-muted)', fontSize: 11, fontWeight: 600, marginBottom: 2 }}>{label}</p>
        <p style={{ color: '#fca5a5', fontWeight: 600, fontSize: 15, fontFamily: 'Inter, sans-serif' }}>{payload[0]?.value} kg</p>
      </div>
    )
  }

  if (availableEx.length === 0) return (
    <div className="card empty-state py-12">
      <div className="empty-icon"><BarChart2 style={{ width: 28, height: 28, color:'var(--text-muted)' }} /></div>
      <p className="empty-title">Sem dados de progresso</p>
      <p className="empty-message">Adicione treinos com exercicios e execute-os para ver a evolucao de carga.</p>
    </div>
  )

  return (
    <div className="space-y-5">
      {/* Exercise selector */}
      <div>
        <label className="label">Exercicio</label>
        <div style={{ position: 'relative' }}>
          <select className="input appearance-none" style={{ paddingRight: 36 }}
            value={selectedExId || ''} onChange={e => setSelectedExId(Number(e.target.value))}>
            {availableEx.map(ex => (
              <option key={ex.id} value={ex.id}>{ex.nome}{ex.grupo_muscular ? ` (${ex.grupo_muscular})` : ''}</option>
            ))}
          </select>
          <ChevronDown style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color:'var(--text-muted)', pointerEvents: 'none' }} />
        </div>
      </div>

      {/* Stats row */}
      {chartData.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Maximo', value: `${maxCarga}kg`, color: '#fca5a5' },
            { label: 'Ultima', value: lastCarga != null ? `${lastCarga}kg` : '--', color: '#34d399' },
            { label: 'Variacao', value: delta != null ? `${delta > 0 ? '+' : ''}${delta}kg` : '--', color: delta == null ? 'var(--text-muted)' : delta > 0 ? '#34d399' : delta < 0 ? '#f87171' : '#ef4444' },
          ].map(({ label, value, color }) => (
            <div key={label} className="card text-center p-3">
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 20, fontWeight: 600, color, letterSpacing: '-0.02em' }}>{value}</div>
              <div style={{ fontSize: 11, color:'var(--text-muted)', fontWeight: 600, marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Chart */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, color:'var(--text-primary)', fontSize: 14 }}>Evolucao de carga</h3>
            <p style={{ fontSize: 12, color:'var(--text-muted)', marginTop: 2 }}>
              {chartData.length > 0 ? `${chartData.length} sessao${chartData.length !== 1 ? 'es' : ''} registrada${chartData.length !== 1 ? 's' : ''}` : 'Sem execucoes registradas'}
            </p>
          </div>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.12)' }}>
            <TrendingUp style={{ width: 16, height: 16, color: '#f87171' }} />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 style={{ width: 22, height: 22, color: '#ef4444', animation: 'spin 1s linear infinite' }} />
          </div>
        ) : chartData.length === 0 ? (
          <div className="empty-state py-10">
            <div style={{ fontSize: 36, marginBottom: 8 }}>📊</div>
            <p className="empty-title">Sem dados ainda</p>
            <p className="empty-message">Execute este exercicio para aparecer o grafico</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="data" tick={{ fontSize: 11, fill:'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill:'var(--text-muted)' }} axisLine={false} tickLine={false} width={40} tickFormatter={v => `${v}kg`} />
              <Tooltip content={<DotTooltip />} />
              <Line type="monotone" dataKey="carga" stroke="#ef4444" strokeWidth={2.5}
                dot={{ fill: '#ef4444', r: 4, strokeWidth: 0 }}
                activeDot={{ r: 6, fill: '#fca5a5', strokeWidth: 0 }}
                isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* History list */}
      {sessions.length > 0 && (
        <div>
          <p className="section-title">Historico de execucoes</p>
          <div className="space-y-2">
            {[...sessions].reverse().slice(0, 8).map((s, i) => {
              const dateStr = s.data
                ? new Date(s.data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: '2-digit' })
                : s.created_at
                  ? new Date(s.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: '2-digit' })
                  : '—'
              return (
                <div key={i} className="rounded-2xl p-3 flex items-center gap-4"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(99,102,241,0.12)' }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#f87171', fontFamily: 'Inter, sans-serif' }}>
                      {sessions.length - i}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p style={{ fontSize: 13, fontWeight: 600, color:'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}>
                      {s.carga_realizada != null ? `${s.carga_realizada}kg` : '--'}
                      {s.repeticoes_realizadas ? ` × ${s.repeticoes_realizadas} reps` : ''}
                      {s.series_realizadas ? ` × ${s.series_realizadas} series` : ''}
                    </p>
                    <p style={{ fontSize: 11, color:'var(--text-muted)' }}>{dateStr}</p>
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

function TreinosTab({ aluno, treinos, onCriar }) {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [showTemplate, setShowTemplate] = useState(false)
  const [nome, setNome] = useState('')
  const [dia, setDia] = useState('')
  const [templateId, setTemplateId] = useState('')
  const [templateDia, setTemplateDia] = useState('')
  const DIAS = ['segunda','terca','quarta','quinta','sexta','sabado','domingo']
  const DIAS_LABEL = { segunda:'Segunda',terca:'Terça',quarta:'Quarta',quinta:'Quinta',sexta:'Sexta',sabado:'Sábado',domingo:'Domingo' }

  const { data: templates = [] } = useQuery({
    queryKey: ['templates'],
    queryFn: () => listarTemplates().then(r => r.data),
    enabled: showTemplate,
    staleTime: 5 * 60_000,
  })

  const { mutate: aplicar, isPending: aplicando } = useMutation({
    mutationFn: () => aplicarTemplate(templateId, { aluno_id: Number(aluno.id), dia_semana: templateDia || null }),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['treinos', String(aluno.id)] })
      toast.success(`Treino "${res.data.nome}" aplicado! ✅`)
      setShowTemplate(false)
      setTemplateId('')
      setTemplateDia('')
    },
    onError: err => toast.error(err.response?.data?.detail || 'Erro'),
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h2 style={{ fontFamily:'Inter, sans-serif', fontWeight:600, color:'var(--text-secondary)', fontSize:13 }}>Treinos de {aluno?.nome?.split(' ')[0]}</h2>
        <div style={{ display:'flex', gap:6 }}>
          <button style={{ display:'flex', alignItems:'center', gap:5, padding:'6px 12px', borderRadius:8, border:'1px solid var(--border)', background:'var(--bg-elevated)', color:'var(--text-muted)', fontSize:12, cursor:'pointer', fontWeight:500 }}
            onClick={() => setShowTemplate(!showTemplate)}
            onMouseEnter={e => e.currentTarget.style.color='var(--text-secondary)'}
            onMouseLeave={e => e.currentTarget.style.color='var(--text-muted)'}>
            <Copy style={{ width:11, height:11 }} /> Template
          </button>
          <button className="btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
            <Plus style={{ width:12, height:12 }} /> Novo treino
          </button>
        </div>
      </div>

      {/* Template picker */}
      {showTemplate && (
        <div className="card animate-slide-down" style={{ border:'1px solid rgba(99,102,241,0.3)' }}>
          <h3 style={{ fontFamily:'Inter, sans-serif', fontWeight:600, color:'var(--text-primary)', fontSize:14, marginBottom:16, display:'flex', alignItems:'center', gap:6 }}>
            <Copy style={{ width:14, height:14, color:'#f87171' }}/> Aplicar template
          </h3>
          {templates.length === 0 ? (
            <p style={{ fontSize:13, color:'var(--text-muted)', marginBottom:12 }}>
              Nenhum template criado. Vá em <strong>Ferramentas → Templates</strong> para criar um.
            </p>
          ) : (
            <div className="space-y-3 mb-4">
              <div>
                <label className="label">Selecionar template</label>
                <select className="input" value={templateId} onChange={e => { setTemplateId(e.target.value); const t = templates.find(x => String(x.id) === e.target.value); setTemplateDia(t?.dia_semana || '') }}>
                  <option value="">— Escolha um template —</option>
                  {templates.map(t => <option key={t.id} value={t.id}>{t.nome} ({t.n_exercicios} ex.)</option>)}
                </select>
              </div>
              <div>
                <label className="label">Dia da semana</label>
                <select className="input" value={templateDia} onChange={e => setTemplateDia(e.target.value)}>
                  <option value="">Qualquer dia</option>
                  {DIAS.map(d => <option key={d} value={d}>{DIAS_LABEL[d]}</option>)}
                </select>
              </div>
            </div>
          )}
          <div className="flex gap-2">
            <button className="btn-secondary" onClick={() => setShowTemplate(false)}>Cancelar</button>
            <button className="btn-primary" disabled={!templateId || aplicando} onClick={() => aplicar()}>
              {aplicando ? 'Aplicando...' : 'Aplicar template'}
            </button>
          </div>
        </div>
      )}

      {showForm && (
        <div className="card animate-slide-down" style={{ border:'1px solid rgba(99,102,241,0.3)' }}>
          <h3 style={{ fontFamily:'Inter, sans-serif', fontWeight:600, color:'var(--text-primary)', fontSize:14, marginBottom:16 }}>Novo treino</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <div>
              <label className="label">Nome do treino *</label>
              <input className="input" placeholder="Ex: Treino A — Peito e Tríceps" value={nome} onChange={e => setNome(e.target.value)} />
            </div>
            <div>
              <label className="label">Dia da semana</label>
              <select className="input" value={dia} onChange={e => setDia(e.target.value)}>
                <option value="">Qualquer dia</option>
                {DIAS.map(d => <option key={d} value={d}>{DIAS_LABEL[d]}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
            <button className="btn-primary" disabled={!nome} onClick={() => { onCriar(nome, dia); setShowForm(false); setNome(''); setDia('') }}>Criar treino</button>
          </div>
        </div>
      )}

      {treinos.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-icon"><Dumbbell style={{ width:28, height:28, color:'var(--text-muted)' }} /></div>
          <p className="empty-title">Nenhum treino ainda</p>
          <p className="empty-message">Crie o primeiro treino para {aluno?.nome?.split(' ')[0]}</p>
          <button className="btn-primary" onClick={() => setShowForm(true)}>Criar primeiro treino</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {treinos.map(t => (
            <Link key={t.id} to={`/treinos/${t.id}`} className="card-interactive group">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div style={{ fontFamily:'Inter, sans-serif', fontWeight:600, color:'var(--text-primary)', fontSize:14 }}>{t.nome}</div>
                  <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>{t.itens?.length || 0} exercício{t.itens?.length !== 1 ? 's' : ''}</div>
                </div>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background:'rgba(99,102,241,0.12)' }}>
                  <Dumbbell style={{ width:15, height:15, color:'#f87171' }} />
                </div>
              </div>
              {t.dia_semana && <span className="badge-blue capitalize">{t.dia_semana}</span>}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

function GamificacaoTab({ gami }) {
  if (!gami) return <div className="flex justify-center py-12"><Loader2 style={{ width:24, height:24, color:'#ef4444', animation:'spin 1s linear infinite' }} /></div>

  const BADGES = {
    primeiro_treino: { emoji:'🏋️', label:'Primeiro treino', border:'rgba(100,116,139,0.3)', bg:'rgba(100,116,139,0.1)' },
    streak_7:        { emoji:'🔥', label:'7 dias seguidos', border:'rgba(249,115,22,0.35)', bg:'rgba(249,115,22,0.1)' },
    streak_30:       { emoji:'🏆', label:'30 dias seguidos', border:'rgba(251,191,36,0.35)',bg:'rgba(251,191,36,0.1)' },
    treinos_10:      { emoji:'💪', label:'10 treinos', border:'rgba(16,185,129,0.3)',       bg:'rgba(16,185,129,0.08)' },
    treinos_50:      { emoji:'⭐', label:'50 treinos', border:'rgba(167,139,250,0.35)',     bg:'rgba(167,139,250,0.1)' },
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-3">
        {[
          { label:'Streak', value:gami.streak_atual, emoji:'🔥', border:'rgba(249,115,22,0.25)', bg:'rgba(249,115,22,0.08)', color:'#f97316' },
          { label:'Recorde', value:gami.streak_recorde, emoji:'🏆', border:'rgba(251,191,36,0.25)', bg:'rgba(251,191,36,0.08)', color:'#fbbf24' },
          { label:'Treinos', value:gami.total_treinos, emoji:'💪', border:'rgba(16,185,129,0.25)', bg:'rgba(16,185,129,0.08)', color:'#34d399' },
        ].map(({ label, value, emoji, border, bg, color }) => (
          <div key={label} className="card text-center" style={{ border:`1px solid ${border}`, background:bg }}>
            <div style={{ fontSize:26, marginBottom:4 }}>{emoji}</div>
            <div style={{ fontFamily:'Inter, sans-serif', fontSize:24, fontWeight:600, color }}>{value}</div>
            <div style={{ fontSize:11, color:'var(--text-muted)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em' }}>{label}</div>
          </div>
        ))}
      </div>

      <div>
        <p className="section-title">Conquistas desbloqueadas</p>
        {(gami.conquistas?.length ?? 0) === 0 ? (
          <div className="card empty-state py-10">
            <div style={{ fontSize:40, marginBottom:8 }}>🎯</div>
            <p className="empty-title">Nenhuma conquista ainda</p>
            <p className="empty-message">Continue treinando para desbloquear as primeiras conquistas!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {(gami.conquistas || []).map(c => {
              const b = BADGES[c.codigo] || { emoji:'🎖️', label:c.descricao, border:'rgba(100,116,139,0.25)', bg:'rgba(100,116,139,0.08)' }
              return (
                <div key={c.id} className="card text-center p-4" style={{ border:`1px solid ${b.border}`, background:b.bg }}>
                  <div style={{ fontSize:28, marginBottom:6 }}>{b.emoji}</div>
                  <div style={{ fontSize:11, fontWeight:600, color:'var(--text-primary)' }}>{b.label}</div>
                  <div style={{ fontSize:10, color:'var(--text-muted)', marginTop:4 }}>
                    {new Date(c.desbloqueado_em).toLocaleDateString('pt-BR', { day:'2-digit', month:'short' })}
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
  if (!sugestoes) return <div className="flex justify-center py-12"><Loader2 style={{ width:24, height:24, color:'#ef4444', animation:'spin 1s linear infinite' }} /></div>

  return (
    <div className="space-y-4">
      {sugestoes.dias_sem_treinar !== null && (
        <div className="p-4 rounded-2xl" style={{
          background: sugestoes.dias_sem_treinar === 0 ? 'rgba(16,185,129,0.1)' : sugestoes.dias_sem_treinar > 7 ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
          border: `1px solid ${sugestoes.dias_sem_treinar === 0 ? 'rgba(16,185,129,0.25)' : sugestoes.dias_sem_treinar > 7 ? 'rgba(239,68,68,0.25)' : 'rgba(245,158,11,0.25)'}`,
        }}>
          <p style={{ fontWeight:600, fontSize:13, color: sugestoes.dias_sem_treinar === 0 ? '#34d399' : sugestoes.dias_sem_treinar > 7 ? '#f87171' : '#fbbf24' }}>
            {sugestoes.dias_sem_treinar === 0 ? '✅ Treinou hoje!' : sugestoes.dias_sem_treinar > 7 ? `⚠️ ${sugestoes.dias_sem_treinar} dias sem treinar — vale entrar em contato!` : `⏱️ Último treino há ${sugestoes.dias_sem_treinar} dia${sugestoes.dias_sem_treinar > 1 ? 's' : ''}`}
          </p>
        </div>
      )}

      {(sugestoes.sugestoes_pendentes?.length ?? 0) === 0 ? (
        <div className="card empty-state py-10">
          <div className="empty-icon"><BarChart2 style={{ width:28, height:28, color:'var(--text-muted)' }} /></div>
          <p className="empty-title">Sem sugestões ainda</p>
          <p className="empty-message">Necessário ao menos 3 execuções do mesmo exercício para gerar sugestões.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {(sugestoes.sugestoes_pendentes || []).map(s => {
            const cfg = ACAO_CONFIG[s.acao] || ACAO_CONFIG.manter
            const IconAcao = cfg.icon
            return (
              <div key={s.id} className="rounded-2xl p-4" style={{ background:cfg.bg, border:`1px solid ${cfg.border}` }}>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background:'rgba(255,255,255,0.07)' }}>
                    <IconAcao style={{ width:17, height:17, color:cfg.iconColor }} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span style={{ fontSize:11, fontWeight:600, color:cfg.text, padding:'2px 10px', borderRadius:999, background:'rgba(255,255,255,0.08)', textTransform:'uppercase', letterSpacing:'0.05em' }}>{cfg.label} carga</span>
                      {s.carga_sugerida && <span style={{ fontSize:14, fontWeight:600, color:'var(--text-primary)', fontFamily:'Inter, sans-serif' }}>→ {s.carga_sugerida} kg</span>}
                    </div>
                    <p style={{ fontSize:13, color:'var(--text-secondary)' }}>{s.motivo}</p>
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

const MEDIDAS_FIELDS = [
  { key:'peso',               label:'Peso (kg)',        placeholder:'75.5', unit:'kg',  group:'basico' },
  { key:'percentual_gordura', label:'% Gordura',        placeholder:'18.2', unit:'%',   group:'basico' },
  { key:'altura',             label:'Altura (cm)',      placeholder:'175',  unit:'cm',  group:'basico' },
  { key:'cintura',            label:'Cintura (cm)',     placeholder:'82',   unit:'cm',  group:'medidas' },
  { key:'quadril',            label:'Quadril (cm)',     placeholder:'96',   unit:'cm',  group:'medidas' },
  { key:'peito',              label:'Peito/Tórax (cm)', placeholder:'100',  unit:'cm',  group:'medidas' },
  { key:'abdomen',            label:'Abdômen (cm)',     placeholder:'88',   unit:'cm',  group:'medidas' },
  { key:'braco',              label:'Braço (cm)',       placeholder:'34',   unit:'cm',  group:'medidas' },
  { key:'perna',              label:'Coxa (cm)',        placeholder:'56',   unit:'cm',  group:'medidas' },
  { key:'panturrilha',        label:'Panturrilha (cm)', placeholder:'38',   unit:'cm',  group:'medidas' },
]

const CIRCUM_OPCOES = [
  { key:'cintura', label:'Cintura', color:'#f87171' },
  { key:'quadril', label:'Quadril', color:'#a78bfa' },
  { key:'peito',   label:'Peito',   color:'#60a5fa' },
  { key:'abdomen', label:'Abdômen', color:'#f97316' },
  { key:'braco',   label:'Braço',   color:'#34d399' },
  { key:'perna',   label:'Coxa',    color:'#fbbf24' },
]

function imcCategoria(imc) {
  if (imc < 18.5) return { label:'Abaixo do peso', color:'#60a5fa' }
  if (imc < 25)   return { label:'Peso normal',     color:'#34d399' }
  if (imc < 30)   return { label:'Sobrepeso',       color:'#fbbf24' }
  return                  { label:'Obesidade',       color:'#ef4444' }
}

function DeltaBadge({ delta, unit = '', invertColors = false }) {
  if (delta == null) return null
  const positive = delta > 0
  const good = invertColors ? !positive : positive
  const color = good ? '#34d399' : '#f87171'
  return (
    <span style={{ fontSize:10, color, fontWeight:600 }}>
      {positive ? '+' : ''}{Number(delta).toFixed(1)}{unit}
    </span>
  )
}

function AvaliacaoTab({ alunoId, avaliacoes, onRefresh }) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(Object.fromEntries(MEDIDAS_FIELDS.map(f => [f.key, ''])))
  const [chartMedida, setChartMedida] = useState('cintura')

  const { mutate: salvar, isPending: saving } = useMutation({
    mutationFn: () => {
      const medidas = {}
      MEDIDAS_FIELDS.filter(f => f.group === 'medidas' || f.key === 'altura').forEach(f => {
        if (form[f.key]) medidas[f.key] = Number(form[f.key])
      })
      return criarAvaliacao(alunoId, {
        peso: form.peso ? Number(form.peso) : null,
        percentual_gordura: form.percentual_gordura ? Number(form.percentual_gordura) : null,
        medidas: Object.keys(medidas).length ? medidas : null,
      })
    },
    onSuccess: () => {
      toast.success('Avaliação registrada!')
      setShowForm(false)
      setForm(Object.fromEntries(MEDIDAS_FIELDS.map(f => [f.key, ''])))
      onRefresh()
    },
    onError: () => toast.error('Erro ao salvar avaliação'),
  })

  const { mutate: excluir } = useMutation({
    mutationFn: (avId) => deletarAvaliacao(alunoId, avId),
    onSuccess: () => { toast.success('Removida'); onRefresh() },
    onError: () => toast.error('Erro ao remover'),
  })

  const last  = avaliacoes[avaliacoes.length - 1]
  const prev  = avaliacoes[avaliacoes.length - 2]
  const first = avaliacoes[0]

  // IMC from last eval with known altura
  const lastAltura = [...avaliacoes].reverse().find(a => a.medidas?.altura)?.medidas?.altura
  const imc = last?.peso && lastAltura
    ? (last.peso / Math.pow(lastAltura / 100, 2)).toFixed(1)
    : null
  const imcCat = imc ? imcCategoria(Number(imc)) : null

  // Massa magra = peso × (1 - gordura/100)
  const massaMagra = last?.peso && last?.percentual_gordura
    ? (last.peso * (1 - last.percentual_gordura / 100)).toFixed(1)
    : null

  // Deltas
  const deltaPeso  = last?.peso  && prev?.peso  ? last.peso  - prev.peso  : null
  const deltaGord  = last?.percentual_gordura && prev?.percentual_gordura ? last.percentual_gordura - prev.percentual_gordura : null

  // Progress vs first
  const progressoPeso = first?.peso && last?.peso && first !== last ? last.peso - first.peso : null
  const progressoGord = first?.percentual_gordura && last?.percentual_gordura && first !== last
    ? last.percentual_gordura - first.percentual_gordura : null

  // Chart: peso
  const chartPeso = avaliacoes.filter(a => a.peso).map(a => ({
    data: new Date(a.data).toLocaleDateString('pt-BR', { day:'2-digit', month:'short' }), peso: a.peso,
  }))
  // Chart: gordura
  const chartGord = avaliacoes.filter(a => a.percentual_gordura).map(a => ({
    data: new Date(a.data).toLocaleDateString('pt-BR', { day:'2-digit', month:'short' }), gordura: a.percentual_gordura,
  }))
  // Chart: selected circumference
  const chartCirc = avaliacoes.filter(a => a.medidas?.[chartMedida]).map(a => ({
    data: new Date(a.data).toLocaleDateString('pt-BR', { day:'2-digit', month:'short' }), valor: a.medidas[chartMedida],
  }))

  const circColor = CIRCUM_OPCOES.find(o => o.key === chartMedida)?.color || '#f87171'

  const MiniTooltip = (unit) => ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
      <div style={{ background:'var(--bg-card)', border:'1px solid rgba(99,102,241,0.3)', borderRadius:10, padding:'8px 12px', fontSize:12 }}>
        <span style={{ color:'var(--text-muted)' }}>{label}: </span>
        <span style={{ color:'#fca5a5', fontWeight:600 }}>{payload[0].value}{unit}</span>
      </div>
    )
  }

  // Auto-fill form from last evaluation (pre-populates so trainer only changes what changed)
  const prefill = () => {
    if (!last) return
    const filled = { peso: last.peso ?? '', percentual_gordura: last.percentual_gordura ?? '' }
    MEDIDAS_FIELDS.filter(f => f.group === 'medidas' || f.key === 'altura').forEach(f => {
      filled[f.key] = last.medidas?.[f.key] ?? ''
    })
    setForm(prev => Object.fromEntries(MEDIDAS_FIELDS.map(f => [f.key, String(filled[f.key] ?? '')])))
  }

  // IMC live preview while filling form
  const formImc = form.peso && form.altura
    ? (Number(form.peso) / Math.pow(Number(form.altura) / 100, 2)).toFixed(1)
    : null
  const formImcCat = formImc ? imcCategoria(Number(formImc)) : null

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 style={{ fontFamily:'Inter, sans-serif', fontWeight:600, color:'var(--text-secondary)', fontSize:13 }}>Avaliação física</h2>
        <button className="btn-primary btn-sm" onClick={() => { prefill(); setShowForm(!showForm) }}>
          <Plus style={{ width:12, height:12 }} /> Nova avaliação
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card animate-slide-down" style={{ border:'1px solid rgba(99,102,241,0.3)' }}>
          <h3 style={{ fontFamily:'Inter, sans-serif', fontWeight:600, color:'var(--text-primary)', fontSize:14, marginBottom:4 }}>Registro de avaliação</h3>
          {last && <p style={{ fontSize:11, color:'var(--text-muted)', marginBottom:16 }}>Pré-preenchido com última avaliação — altere apenas o que mudou.</p>}

          {/* Métricas principais */}
          <p style={{ fontSize:11, fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>Métricas principais</p>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {MEDIDAS_FIELDS.filter(f => f.group === 'basico').map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="label">{label}</label>
                <input className="input" type="number" step="0.1" placeholder={placeholder}
                  value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} />
              </div>
            ))}
          </div>
          {formImc && (
            <div style={{ padding:'8px 12px', borderRadius:10, background:`${formImcCat.color}15`, border:`1px solid ${formImcCat.color}30`, marginBottom:16, display:'flex', gap:8, alignItems:'center' }}>
              <span style={{ fontSize:13, fontWeight:700, color:formImcCat.color }}>IMC {formImc}</span>
              <span style={{ fontSize:12, color:'var(--text-muted)' }}>·</span>
              <span style={{ fontSize:12, color:formImcCat.color }}>{formImcCat.label}</span>
            </div>
          )}

          {/* Circunferências */}
          <p style={{ fontSize:11, fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>Circunferências (cm)</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {MEDIDAS_FIELDS.filter(f => f.group === 'medidas' && f.key !== 'altura').map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="label" style={{ fontSize:11 }}>{label.replace(' (cm)', '')}</label>
                <input className="input" type="number" step="0.5" placeholder={placeholder}
                  value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} />
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <button className="btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
            <button className="btn-primary" disabled={saving} onClick={() => salvar()}>
              {saving ? 'Salvando...' : 'Registrar avaliação'}
            </button>
          </div>
        </div>
      )}

      {/* Summary cards */}
      {last ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="card text-center p-3">
            <div style={{ fontFamily:'Inter, sans-serif', fontSize:20, fontWeight:600, color:'#34d399', letterSpacing:'-0.02em' }}>
              {last.peso ? `${last.peso}kg` : '—'}
            </div>
            <div style={{ fontSize:11, color:'var(--text-muted)', fontWeight:600, marginTop:2, textTransform:'uppercase', letterSpacing:'0.05em' }}>Peso</div>
            <div style={{ display:'flex', justifyContent:'center', gap:6, marginTop:3 }}>
              {deltaPeso != null && <DeltaBadge delta={deltaPeso} unit="kg" invertColors />}
              {progressoPeso != null && avaliacoes.length > 2 && <span style={{ fontSize:10, color:'var(--text-muted)' }}>/ total <DeltaBadge delta={progressoPeso} unit="kg" invertColors /></span>}
            </div>
          </div>
          <div className="card text-center p-3">
            <div style={{ fontFamily:'Inter, sans-serif', fontSize:20, fontWeight:600, color:'#fbbf24', letterSpacing:'-0.02em' }}>
              {last.percentual_gordura ? `${last.percentual_gordura}%` : '—'}
            </div>
            <div style={{ fontSize:11, color:'var(--text-muted)', fontWeight:600, marginTop:2, textTransform:'uppercase', letterSpacing:'0.05em' }}>% Gordura</div>
            {deltaGord != null && <div style={{ marginTop:3 }}><DeltaBadge delta={deltaGord} unit="%" invertColors /></div>}
          </div>
          <div className="card text-center p-3">
            <div style={{ fontFamily:'Inter, sans-serif', fontSize:20, fontWeight:600, color:imcCat?.color || 'var(--text-secondary)', letterSpacing:'-0.02em' }}>
              {imc || '—'}
            </div>
            <div style={{ fontSize:11, color:'var(--text-muted)', fontWeight:600, marginTop:2, textTransform:'uppercase', letterSpacing:'0.05em' }}>IMC</div>
            {imcCat && <div style={{ fontSize:10, color:imcCat.color, marginTop:2 }}>{imcCat.label}</div>}
          </div>
          <div className="card text-center p-3">
            <div style={{ fontFamily:'Inter, sans-serif', fontSize:20, fontWeight:600, color:'#c084fc', letterSpacing:'-0.02em' }}>
              {massaMagra ? `${massaMagra}kg` : '—'}
            </div>
            <div style={{ fontSize:11, color:'var(--text-muted)', fontWeight:600, marginTop:2, textTransform:'uppercase', letterSpacing:'0.05em' }}>Massa Magra</div>
          </div>
        </div>
      ) : null}

      {/* Peso chart */}
      {chartPeso.length >= 2 && (
        <div className="card">
          <p style={{ fontFamily:'Inter, sans-serif', fontWeight:600, color:'var(--text-primary)', fontSize:13, marginBottom:12 }}>Evolução de peso</p>
          <ResponsiveContainer width="100%" height={150}>
            <LineChart data={chartPeso} margin={{ top:4, right:8, left:-12, bottom:0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="data" tick={{ fontSize:11, fill:'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize:11, fill:'var(--text-muted)' }} axisLine={false} tickLine={false} width={40} tickFormatter={v => `${v}kg`} />
              <Tooltip content={MiniTooltip('kg')} />
              <Line type="monotone" dataKey="peso" stroke="#34d399" strokeWidth={2.5}
                dot={{ fill:'#34d399', r:4, strokeWidth:0 }} activeDot={{ r:6, fill:'#6ee7b7', strokeWidth:0 }} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Body fat chart */}
      {chartGord.length >= 2 && (
        <div className="card">
          <p style={{ fontFamily:'Inter, sans-serif', fontWeight:600, color:'var(--text-primary)', fontSize:13, marginBottom:12 }}>% Gordura corporal</p>
          <ResponsiveContainer width="100%" height={130}>
            <LineChart data={chartGord} margin={{ top:4, right:8, left:-12, bottom:0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="data" tick={{ fontSize:11, fill:'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize:11, fill:'var(--text-muted)' }} axisLine={false} tickLine={false} width={36} tickFormatter={v => `${v}%`} />
              <Tooltip content={MiniTooltip('%')} />
              <Line type="monotone" dataKey="gordura" stroke="#fbbf24" strokeWidth={2.5}
                dot={{ fill:'#fbbf24', r:4, strokeWidth:0 }} activeDot={{ r:6, fill:'#fde68a', strokeWidth:0 }} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Circumferences chart */}
      {avaliacoes.some(a => a.medidas && Object.keys(a.medidas).length > 0) && (
        <div className="card">
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
            <p style={{ fontFamily:'Inter, sans-serif', fontWeight:600, color:'var(--text-primary)', fontSize:13, margin:0 }}>Circunferências</p>
            <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
              {CIRCUM_OPCOES.map(o => (
                <button key={o.key} onClick={() => setChartMedida(o.key)}
                  style={{ padding:'3px 8px', borderRadius:20, border:`1px solid ${chartMedida === o.key ? o.color : 'var(--border)'}`, background: chartMedida === o.key ? `${o.color}18` : 'transparent', color: chartMedida === o.key ? o.color : 'var(--text-muted)', fontSize:11, cursor:'pointer', fontWeight: chartMedida === o.key ? 600 : 400 }}>
                  {o.label}
                </button>
              ))}
            </div>
          </div>
          {chartCirc.length >= 2 ? (
            <ResponsiveContainer width="100%" height={130}>
              <LineChart data={chartCirc} margin={{ top:4, right:8, left:-12, bottom:0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="data" tick={{ fontSize:11, fill:'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize:11, fill:'var(--text-muted)' }} axisLine={false} tickLine={false} width={40} tickFormatter={v => `${v}cm`} />
                <Tooltip content={MiniTooltip('cm')} />
                <Line type="monotone" dataKey="valor" stroke={circColor} strokeWidth={2.5}
                  dot={{ fill:circColor, r:4, strokeWidth:0 }} activeDot={{ r:6 }} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p style={{ fontSize:12, color:'var(--text-muted)', textAlign:'center', padding:'12px 0' }}>
              Registre pelo menos 2 avaliações para ver o gráfico de {CIRCUM_OPCOES.find(o=>o.key===chartMedida)?.label?.toLowerCase()}.
            </p>
          )}
        </div>
      )}

      {/* History list */}
      {avaliacoes.length === 0 ? (
        <div className="card empty-state py-10">
          <div className="empty-icon"><Scale style={{ width:28, height:28, color:'var(--text-muted)' }} /></div>
          <p className="empty-title">Sem avaliações ainda</p>
          <p className="empty-message">Registre a primeira avaliação para acompanhar a evolução física</p>
          <button className="btn-primary" onClick={() => setShowForm(true)}>Registrar avaliação</button>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="section-title">Histórico completo</p>
          {[...avaliacoes].reverse().map(av => (
            <div key={av.id} className="rounded-2xl p-3 flex items-start gap-3"
              style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginBottom:3 }}>
                  {av.peso && <span style={{ fontSize:13, fontWeight:600, color:'#34d399' }}>{av.peso}kg</span>}
                  {av.percentual_gordura && <span style={{ fontSize:13, fontWeight:600, color:'#fbbf24' }}>{av.percentual_gordura}%</span>}
                  {av.medidas?.cintura  && <span style={{ fontSize:12, color:'var(--text-secondary)' }}>Cin {av.medidas.cintura}cm</span>}
                  {av.medidas?.quadril  && <span style={{ fontSize:12, color:'var(--text-secondary)' }}>Quad {av.medidas.quadril}cm</span>}
                  {av.medidas?.peito   && <span style={{ fontSize:12, color:'var(--text-secondary)' }}>Peito {av.medidas.peito}cm</span>}
                  {av.medidas?.abdomen && <span style={{ fontSize:12, color:'var(--text-secondary)' }}>Abd {av.medidas.abdomen}cm</span>}
                </div>
                <p style={{ fontSize:11, color:'var(--text-muted)', margin:0 }}>
                  {new Date(av.data).toLocaleDateString('pt-BR', { day:'2-digit', month:'long', year:'numeric' })}
                </p>
              </div>
              <button onClick={() => excluir(av.id)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-disabled)', padding:6, borderRadius:8 }}>
                <Trash2 style={{ width:13, height:13 }} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function AnamneseTab({ anamnese, onSalvar, saving }) {
  const [form, setForm] = useState(anamnese || { objetivo:'', historico_medico:'', restricoes:[], medicamentos:[], nivel_atividade:'', lesoes:[], observacoes:'' })
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  return (
    <div className="space-y-5">
      <div className="alert-warning flex items-start gap-2">
        <span>🔒</span>
        <span>Dados sensíveis — trafegados com criptografia e não são registrados em logs (LGPD Art. 11).</span>
      </div>
      <div className="card space-y-5">
        {[
          { label:'Objetivo de saúde/fitness',  key:'objetivo',         placeholder:'Ex: perder peso, ganhar massa, condicionamento...' },
          { label:'Histórico médico',           key:'historico_medico', placeholder:'Cirurgias, doenças crônicas, condições...' },
          { label:'Nível de atividade física',  key:'nivel_atividade',  placeholder:'sedentário / ativo / muito ativo' },
          { label:'Observações adicionais',     key:'observacoes',      placeholder:'Qualquer observação relevante...' },
        ].map(({ label, key, placeholder }) => (
          <div key={key}>
            <label className="label">{label}</label>
            <textarea className="input resize-none" rows={3} placeholder={placeholder} value={form[key] || ''} onChange={set(key)} />
          </div>
        ))}
        <button className="btn-primary" disabled={saving} onClick={() => onSalvar(form)}>
          {saving ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor:'rgba(255,255,255,0.3)', borderTopColor:'white' }} />Salvando...</span> : 'Salvar anamnese'}
        </button>
      </div>
    </div>
  )
}

