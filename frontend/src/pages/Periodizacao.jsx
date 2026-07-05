import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listarProgramas, criarPrograma, deletarPrograma, aplicarPrograma, listarAlunos, seedExercicios } from '../api'
import toast from 'react-hot-toast'
import { Plus, Trash2, Zap, Target, Clock, ChevronDown, ChevronUp, Download, Users, ArrowRight, BarChart2, Loader2 } from 'lucide-react'

const OBJETIVOS = [
  { key: 'hipertrofia',     label: 'Hipertrofia',     color: '#818cf8', bg: 'rgba(99,102,241,0.12)',  border: 'rgba(99,102,241,0.25)', emoji: '💪' },
  { key: 'forca',           label: 'Força',           color: '#f87171', bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.25)',  emoji: '🏋️' },
  { key: 'potencia',        label: 'Potência',        color: '#fbbf24', bg: 'rgba(251,191,36,0.12)',  border: 'rgba(251,191,36,0.25)', emoji: '⚡' },
  { key: 'emagrecimento',   label: 'Emagrecimento',   color: '#34d399', bg: 'rgba(16,185,129,0.12)',  border: 'rgba(16,185,129,0.25)', emoji: '🔥' },
  { key: 'condicionamento', label: 'Condicionamento', color: '#38bdf8', bg: 'rgba(56,189,248,0.12)',  border: 'rgba(56,189,248,0.25)', emoji: '🏃' },
]

const FASES_PRESET = {
  hipertrofia: [
    { nome: 'Adaptação',   semanas: 2, objetivo: 'hipertrofia', series_por_exercicio: 3, repeticoes: '15-20', intensidade_pct: 60, descanso_seg: 60,  descricao: 'Familiarizar com os movimentos, volume baixo' },
    { nome: 'Hipertrofia', semanas: 4, objetivo: 'hipertrofia', series_por_exercicio: 4, repeticoes: '8-12',  intensidade_pct: 70, descanso_seg: 90,  descricao: 'Volume máximo, foco em tempo sob tensão' },
    { nome: 'Intensidade', semanas: 3, objetivo: 'hipertrofia', series_por_exercicio: 5, repeticoes: '6-8',   intensidade_pct: 80, descanso_seg: 120, descricao: 'Cargas altas, menor volume, máxima tensão' },
    { nome: 'Deload',      semanas: 1, objetivo: 'deload',       series_por_exercicio: 2, repeticoes: '15',    intensidade_pct: 50, descanso_seg: 60,  descricao: 'Recuperação ativa, volume e carga reduzidos' },
  ],
  forca: [
    { nome: 'Base',        semanas: 3, objetivo: 'hipertrofia', series_por_exercicio: 4, repeticoes: '8-10',  intensidade_pct: 70, descanso_seg: 90,  descricao: 'Construir base muscular para suportar cargas' },
    { nome: 'Força',       semanas: 4, objetivo: 'forca',       series_por_exercicio: 5, repeticoes: '3-5',   intensidade_pct: 85, descanso_seg: 180, descricao: 'Movimentos compostos pesados, baixo volume' },
    { nome: 'Pico',        semanas: 2, objetivo: 'forca',       series_por_exercicio: 3, repeticoes: '1-3',   intensidade_pct: 90, descanso_seg: 240, descricao: 'Aproximação ao 1RM, preparação para teste' },
    { nome: 'Deload',      semanas: 1, objetivo: 'deload',       series_por_exercicio: 2, repeticoes: '8',     intensidade_pct: 55, descanso_seg: 120, descricao: 'Recuperação completa antes do próximo ciclo' },
  ],
  emagrecimento: [
    { nome: 'Cardio Base', semanas: 2, objetivo: 'condicionamento', series_por_exercicio: 3, repeticoes: '15-20', intensidade_pct: 55, descanso_seg: 45, descricao: 'Estabelecer rotina aeróbica e resistência base' },
    { nome: 'Circuito',    semanas: 4, objetivo: 'emagrecimento',   series_por_exercicio: 4, repeticoes: '12-15', intensidade_pct: 65, descanso_seg: 45, descricao: 'Treino em circuito para maximizar gasto calórico' },
    { nome: 'HIIT',        semanas: 4, objetivo: 'emagrecimento',   series_por_exercicio: 4, repeticoes: '10-12', intensidade_pct: 75, descanso_seg: 30, descricao: 'Alta intensidade intervalada, máxima queima de gordura' },
    { nome: 'Manutenção',  semanas: 2, objetivo: 'condicionamento', series_por_exercicio: 3, repeticoes: '12',    intensidade_pct: 60, descanso_seg: 60, descricao: 'Consolidar resultados e estabelecer novos hábitos' },
  ],
}

const OBJ_META = Object.fromEntries(OBJETIVOS.map(o => [o.key, o]))

function ProgramaCard({ programa, alunos, onDelete }) {
  const qc = useQueryClient()
  const [expanded, setExpanded] = useState(false)
  const [alunoId, setAlunoId] = useState('')
  const [aplicando, setAplicando] = useState(false)
  const obj = OBJ_META[programa.objetivo] || OBJETIVOS[0]
  const fases = programa.fases || []
  const semanas = programa.semanas_total || fases.reduce((s, f) => s + (f.semanas || 0), 0)

  const { mutate: aplicar, isPending: aplicandoMut } = useMutation({
    mutationFn: () => aplicarPrograma({ aluno_id: Number(alunoId), programa_id: programa.id }),
    onSuccess: () => {
      toast.success('Programa aplicado!')
      setAplicando(false)
      setAlunoId('')
      qc.invalidateQueries({ queryKey: ['programas'] })
    },
    onError: e => toast.error(e.response?.data?.detail || 'Erro ao aplicar'),
  })

  return (
    <div style={{ background: '#111113', borderRadius: 20, border: `1px solid ${obj.border}`, overflow: 'hidden' }}>
      <div style={{ height: 3, background: `linear-gradient(90deg, transparent, ${obj.color}, transparent)` }} />
      <div style={{ padding: '20px 22px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
          <div style={{ width: 42, height: 42, borderRadius: 13, background: obj.bg, border: `1px solid ${obj.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
            {obj.emoji}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: 16, fontWeight: 600, color: '#F4F4F5', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              {programa.nome}
            </h3>
            <div style={{ display: 'flex', gap: 10, marginTop: 5, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: obj.color, background: obj.bg, padding: '2px 8px', borderRadius: 999 }}>{obj.label}</span>
              <span style={{ fontSize: 11, color: '#71717A' }}>{semanas} semanas · {fases.length} fases</span>
            </div>
          </div>
          <button onClick={() => onDelete(programa.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2A3A56', padding: 6 }}>
            <Trash2 style={{ width: 13, height: 13 }} />
          </button>
        </div>

        {programa.descricao && (
          <p style={{ fontSize: 12, color: '#71717A', marginBottom: 14, lineHeight: 1.5 }}>{programa.descricao}</p>
        )}

        {/* Fases */}
        <button onClick={() => setExpanded(!expanded)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: '#71717A', fontSize: 12, fontWeight: 600, padding: '6px 0', marginBottom: expanded ? 12 : 0 }}>
          {expanded ? <ChevronUp style={{ width: 13, height: 13 }} /> : <ChevronDown style={{ width: 13, height: 13 }} />}
          {expanded ? 'Ocultar fases' : 'Ver fases'}
        </button>

        {expanded && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
            {fases.map((f, i) => {
              const fObj = OBJ_META[f.objetivo] || OBJETIVOS[0]
              return (
                <div key={i} style={{ padding: '10px 12px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ width: 18, height: 18, borderRadius: '50%', background: fObj.bg, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600, color: fObj.color, flexShrink: 0 }}>{i + 1}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#F4F4F5' }}>{f.nome}</span>
                    <span style={{ fontSize: 11, color: '#71717A', marginLeft: 'auto' }}>{f.semanas}sem</span>
                  </div>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', paddingLeft: 26 }}>
                    <span style={{ fontSize: 11, color: '#71717A' }}>{f.series_por_exercicio}x{f.repeticoes} reps</span>
                    <span style={{ fontSize: 11, color: '#71717A' }}>{f.intensidade_pct}% 1RM</span>
                    <span style={{ fontSize: 11, color: '#71717A' }}>{f.descanso_seg}s descanso</span>
                  </div>
                  {f.descricao && <p style={{ fontSize: 11, color: '#2A3A56', marginTop: 5, paddingLeft: 26 }}>{f.descricao}</p>}
                </div>
              )
            })}
          </div>
        )}

        {/* Aplicar a aluno */}
        {!aplicando ? (
          <button onClick={() => setAplicando(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: obj.color, background: obj.bg, border: `1px solid ${obj.border}`, borderRadius: 10, padding: '8px 14px', cursor: 'pointer', width: '100%', justifyContent: 'center' }}>
            <Users style={{ width: 13, height: 13 }} />
            Aplicar a aluno
          </button>
        ) : (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <select className="input" style={{ flex: 1, fontSize: 13 }} value={alunoId} onChange={e => setAlunoId(e.target.value)}>
              <option value="">Selecionar aluno...</option>
              {(alunos || []).map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}
            </select>
            <button onClick={() => aplicar()} disabled={!alunoId || aplicandoMut} style={{ padding: '8px 14px', borderRadius: 10, background: '#6366f1', border: 'none', color: 'white', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
              {aplicandoMut ? <Loader2 style={{ width: 12, height: 12, animation: 'spin 0.8s linear infinite' }} /> : <ArrowRight style={{ width: 12, height: 12 }} />}
              Aplicar
            </button>
            <button onClick={() => setAplicando(false)} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 10, padding: '8px 10px', color: '#71717A', cursor: 'pointer', fontSize: 12 }}>✕</button>
          </div>
        )}
      </div>
    </div>
  )
}

function NovoPrograma({ alunos, onClose }) {
  const qc = useQueryClient()
  const [nome, setNome] = useState('')
  const [objetivo, setObjetivo] = useState('hipertrofia')
  const [descricao, setDescricao] = useState('')
  const [fases, setFases] = useState(FASES_PRESET.hipertrofia)
  const [usandoPreset, setUsandoPreset] = useState(true)

  const { mutate, isPending } = useMutation({
    mutationFn: () => criarPrograma({ nome, objetivo, descricao: descricao || undefined, fases }),
    onSuccess: () => {
      toast.success('Programa criado!')
      qc.invalidateQueries({ queryKey: ['programas'] })
      onClose()
    },
    onError: e => toast.error(e.response?.data?.detail || 'Erro ao criar'),
  })

  const setFase = (idx, key, val) => {
    const novo = [...fases]
    novo[idx] = { ...novo[idx], [key]: key === 'semanas' || key === 'series_por_exercicio' || key === 'intensidade_pct' || key === 'descanso_seg' ? Number(val) : val }
    setFases(novo)
  }

  const addFase = () => setFases([...fases, { nome: 'Nova fase', semanas: 4, objetivo: 'hipertrofia', series_por_exercicio: 4, repeticoes: '8-12', intensidade_pct: 70, descanso_seg: 90, descricao: '' }])
  const removeFase = (i) => setFases(fases.filter((_, idx) => idx !== i))

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', padding: '16px' }}>
      <div style={{ background: '#111113', borderRadius: 24, border: '1px solid rgba(99,102,241,0.25)', width: '100%', maxWidth: 700, maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '22px 24px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontFamily: 'Inter, sans-serif', fontSize: 18, fontWeight: 600, color: '#F4F4F5', letterSpacing: '-0.02em' }}>Novo Programa de Treino</h2>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.07)', border: 'none', borderRadius: 10, color: '#71717A', cursor: 'pointer', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>✕</button>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          {/* Básico */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            <div style={{ gridColumn: '1/-1' }}>
              <label className="label">Nome do programa *</label>
              <input className="input" placeholder="Ex: Ciclo Hipertrofia 12 Semanas" value={nome} onChange={e => setNome(e.target.value)} />
            </div>
            <div>
              <label className="label">Objetivo principal</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {OBJETIVOS.slice(0, 4).map(o => (
                  <button key={o.key} onClick={() => { setObjetivo(o.key); if (usandoPreset && FASES_PRESET[o.key]) setFases(FASES_PRESET[o.key]) }} style={{ padding: '6px 12px', borderRadius: 10, border: `1px solid ${objetivo === o.key ? o.border : 'rgba(255,255,255,0.08)'}`, background: objetivo === o.key ? o.bg : 'rgba(255,255,255,0.04)', color: objetivo === o.key ? o.color : '#71717A', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                    {o.emoji} {o.label}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <label className="label">Descrição</label>
              <textarea className="input resize-none" rows={2} placeholder="Descreva o objetivo geral do programa..." value={descricao} onChange={e => setDescricao(e.target.value)} />
            </div>
          </div>

          {/* Preset toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 700, color: '#A1A1AA' }}>Fases ({fases.length})</p>
            <div style={{ display: 'flex', gap: 8 }}>
              {FASES_PRESET[objetivo] && (
                <button onClick={() => { setFases(FASES_PRESET[objetivo]); setUsandoPreset(true) }} style={{ fontSize: 11, fontWeight: 700, color: '#6366f1', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 8, padding: '5px 10px', cursor: 'pointer' }}>
                  Usar preset
                </button>
              )}
              <button onClick={addFase} style={{ fontSize: 11, fontWeight: 700, color: '#34d399', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 8, padding: '5px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                <Plus style={{ width: 11, height: 11 }} /> Fase
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {fases.map((f, i) => {
              const fObj = OBJ_META[f.objetivo] || OBJETIVOS[0]
              return (
                <div key={i} style={{ padding: '14px', borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <span style={{ width: 22, height: 22, borderRadius: '50%', background: fObj.bg, border: `1px solid ${fObj.border}`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: fObj.color, flexShrink: 0 }}>{i + 1}</span>
                    <input value={f.nome} onChange={e => { setUsandoPreset(false); setFase(i, 'nome', e.target.value) }} style={{ flex: 1, background: 'none', border: 'none', color: '#F4F4F5', fontSize: 14, fontWeight: 700, fontFamily: 'Inter, sans-serif', outline: 'none' }} />
                    {fases.length > 1 && (
                      <button onClick={() => removeFase(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2A3A56' }}>
                        <Trash2 style={{ width: 12, height: 12 }} />
                      </button>
                    )}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                    {[
                      { key: 'semanas',              label: 'Semanas',      type: 'number' },
                      { key: 'series_por_exercicio', label: 'Séries',       type: 'number' },
                      { key: 'repeticoes',           label: 'Repetições',   type: 'text' },
                      { key: 'intensidade_pct',      label: '% 1RM',        type: 'number' },
                      { key: 'descanso_seg',         label: 'Descanso (s)', type: 'number' },
                    ].map(({ key, label, type }) => (
                      <div key={key}>
                        <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#71717A', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{label}</label>
                        <input type={type} className="input text-center" style={{ fontSize: 13, padding: '8px' }}
                          value={f[key]} onChange={e => { setUsandoPreset(false); setFase(i, key, e.target.value) }} />
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onClose} className="btn-secondary">Cancelar</button>
          <button onClick={() => mutate()} disabled={isPending || !nome || fases.length === 0} className="btn-primary">
            {isPending ? <Loader2 style={{ width: 14, height: 14, animation: 'spin 0.8s linear infinite' }} /> : <Plus style={{ width: 14, height: 14 }} />}
            Criar programa
          </button>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

export default function Periodizacao() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [seedingEx, setSeedingEx] = useState(false)

  const { data: programas = [], isLoading } = useQuery({
    queryKey: ['programas'],
    queryFn: () => listarProgramas().then(r => r.data),
  })
  const { data: alunos = [] } = useQuery({
    queryKey: ['alunos'],
    queryFn: () => listarAlunos().then(r => r.data),
  })

  const { mutate: excluir } = useMutation({
    mutationFn: deletarPrograma,
    onSuccess: () => { toast.success('Programa removido'); qc.invalidateQueries({ queryKey: ['programas'] }) },
    onError: () => toast.error('Erro ao remover'),
  })

  const handleSeed = async () => {
    setSeedingEx(true)
    try {
      const { data } = await seedExercicios()
      toast.success(`${data.criados} exercícios importados! (${data.total_biblioteca} total)`)
      qc.invalidateQueries({ queryKey: ['exercicios'] })
    } catch {
      toast.error('Erro ao importar')
    }
    setSeedingEx(false)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#0a0f1e,#0e1525,#141d30)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: 24, padding: '28px 32px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(167,139,250,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, position: 'relative', zIndex: 1 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{ width: 36, height: 36, borderRadius: 12, background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BarChart2 style={{ width: 17, height: 17, color: 'white' }} />
              </div>
              <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: 26, fontWeight: 600, color: '#F4F4F5', letterSpacing: '-0.03em', margin: 0 }}>Periodização</h1>
            </div>
            <p style={{ fontSize: 13, color: '#71717A', margin: 0 }}>Crie programas estruturados com fases de hipertrofia, força e deload</p>
            {programas.length > 0 && (
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <span style={{ padding: '4px 12px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: 'rgba(167,139,250,0.12)', color: '#c4b5fd', border: '1px solid rgba(167,139,250,0.25)' }}>
                  {programas.length} programa{programas.length !== 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={handleSeed} disabled={seedingEx} className="btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              {seedingEx ? <Loader2 style={{ width: 13, height: 13, animation: 'spin 0.8s linear infinite' }} /> : <Download style={{ width: 13, height: 13 }} />}
              {seedingEx ? 'Importando...' : 'Importar exercícios'}
            </button>
            <button onClick={() => setShowForm(true)} className="btn-primary">
              <Plus style={{ width: 15, height: 15 }} /> Novo programa
            </button>
          </div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>

      {/* Presets info */}
      {programas.length === 0 && !isLoading && (
        <div style={{ background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.18)', borderRadius: 18, padding: '20px 24px' }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 700, color: '#c7d2fe', marginBottom: 8 }}>
            Presets prontos para começar
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {['💪 Hipertrofia 10 semanas', '🏋️ Força 10 semanas', '🔥 Emagrecimento 12 semanas'].map(p => (
              <span key={p} style={{ padding: '6px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', fontSize: 12, color: '#A1A1AA' }}>{p}</span>
            ))}
          </div>
          <p style={{ fontSize: 12, color: '#71717A', marginTop: 10 }}>Clique em "Novo programa" e selecione o objetivo para carregar automaticamente as fases recomendadas.</p>
          <button onClick={() => setShowForm(true)} className="btn-primary" style={{ marginTop: 14 }}>
            <Plus style={{ width: 14, height: 14 }} /> Criar primeiro programa
          </button>
        </div>
      )}

      {/* Lista */}
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
          <Loader2 style={{ width: 24, height: 24, color: '#6366f1', animation: 'spin 1s linear infinite' }} />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
          {programas.map(p => (
            <ProgramaCard key={p.id} programa={p} alunos={alunos} onDelete={excluir} />
          ))}
        </div>
      )}

      {showForm && <NovoPrograma alunos={alunos} onClose={() => setShowForm(false)} />}
    </div>
  )
}
