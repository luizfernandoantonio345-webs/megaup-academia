import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listarAlunos, listarSessoes, criarSessao, atualizarSessao, deletarSessao } from '../api'
import { Calendar, Plus, Clock, User, Video, MapPin, Check, X, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'

const STATUS_MAP = {
  agendada:   { label: 'Agendada',   color: '#818cf8', bg: 'rgba(129,140,248,0.12)' },
  confirmada: { label: 'Confirmada', color: '#34d399', bg: 'rgba(52,211,153,0.12)'  },
  concluida:  { label: 'Concluída',  color: '#71717A', bg: 'rgba(75,87,104,0.12)'   },
  cancelada:  { label: 'Cancelada',  color: '#f87171', bg: 'rgba(248,113,113,0.12)' },
}

const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
const DIAS_SEMANA = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']

function pad(n) { return String(n).padStart(2, '0') }

function toDatetimeLocal(dt) {
  if (!dt) return ''
  const d = new Date(dt)
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function Agenda() {
  const qc = useQueryClient()
  const hoje = new Date()
  const [mes, setMes] = useState(hoje.getMonth() + 1)
  const [ano, setAno] = useState(hoje.getFullYear())
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ aluno_id: '', data_hora: '', duracao_min: 60, tipo: 'presencial', notas: '' })
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const { data: sessoes = [] } = useQuery({
    queryKey: ['sessoes', mes, ano],
    queryFn: async () => (await listarSessoes({ mes, ano })).data,
    staleTime: 30_000,
  })
  const { data: alunos = [] } = useQuery({
    queryKey: ['alunos'],
    queryFn: async () => (await listarAlunos()).data,
    staleTime: 60_000,
  })

  const criar = useMutation({
    mutationFn: (d) => criarSessao(d),
    onSuccess: () => { qc.invalidateQueries(['sessoes']); setShowModal(false); toast.success('Sessão agendada!') },
    onError: () => toast.error('Erro ao agendar'),
  })
  const atualizar = useMutation({
    mutationFn: ({ id, ...d }) => atualizarSessao(id, d),
    onSuccess: () => { qc.invalidateQueries(['sessoes']); toast.success('Sessão atualizada!') },
  })
  const deletar = useMutation({
    mutationFn: (id) => deletarSessao(id),
    onSuccess: () => { qc.invalidateQueries(['sessoes']); toast.success('Sessão removida') },
  })

  function navMes(delta) {
    let nm = mes + delta, na = ano
    if (nm > 12) { nm = 1; na++ }
    if (nm < 1)  { nm = 12; na-- }
    setMes(nm); setAno(na)
  }

  // Monta grid do calendário
  const primeiroDia = new Date(ano, mes - 1, 1).getDay()
  const diasNoMes = new Date(ano, mes, 0).getDate()
  const cells = Array.from({ length: primeiroDia + diasNoMes }, (_, i) =>
    i < primeiroDia ? null : i - primeiroDia + 1
  )

  const sessoesPorDia = {}
  sessoes.forEach(s => {
    const d = new Date(s.data_hora).getDate()
    if (!sessoesPorDia[d]) sessoesPorDia[d] = []
    sessoesPorDia[d].push(s)
  })

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.aluno_id || !form.data_hora) return toast.error('Preencha todos os campos obrigatórios')
    criar.mutate({ ...form, aluno_id: Number(form.aluno_id), duracao_min: Number(form.duracao_min) })
  }

  // Próximas sessões (status agendada/confirmada, ordem cronológica)
  const proximas = sessoes
    .filter(s => s.status !== 'cancelada' && s.status !== 'concluida')
    .sort((a, b) => new Date(a.data_hora) - new Date(b.data_hora))

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(56,189,248,0.12)', border: '1px solid rgba(56,189,248,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Calendar style={{ width: 22, height: 22, color: '#38bdf8' }} />
          </div>
          <div>
            <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: 22, fontWeight: 600, color: '#F4F4F5', letterSpacing: '-0.02em' }}>Agenda</h1>
            <p style={{ fontSize: 13, color: '#71717A' }}>Sessões agendadas com seus alunos</p>
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{ background: '#6366f1', border: 'none', borderRadius: 14, color: 'white', cursor: 'pointer', fontWeight: 800, fontSize: 14, padding: '11px 20px', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 0 20px rgba(99,102,241,0.35)' }}
        >
          <Plus style={{ width: 16, height: 16 }} /> Agendar sessão
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20 }}>
        {/* Calendário */}
        <div style={{ background: '#111113', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: '22px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <button onClick={() => navMes(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#71717A', padding: 6 }}><ChevronLeft style={{ width: 18, height: 18 }} /></button>
            <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: 16, color: '#F4F4F5' }}>{MESES[mes-1]} {ano}</span>
            <button onClick={() => navMes(1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#71717A', padding: 6 }}><ChevronRight style={{ width: 18, height: 18 }} /></button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4, marginBottom: 8 }}>
            {DIAS_SEMANA.map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: '#71717A', padding: '4px 0', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{d}</div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4 }}>
            {cells.map((dia, i) => {
              if (!dia) return <div key={i} />
              const isHoje = dia === hoje.getDate() && mes === hoje.getMonth() + 1 && ano === hoje.getFullYear()
              const temSessao = sessoesPorDia[dia]?.length > 0
              return (
                <div key={dia} style={{
                  aspectRatio: '1', borderRadius: 10, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: 3,
                  background: isHoje ? 'rgba(99,102,241,0.2)' : temSessao ? 'rgba(56,189,248,0.08)' : 'rgba(255,255,255,0.02)',
                  border: isHoje ? '1px solid rgba(99,102,241,0.4)' : temSessao ? '1px solid rgba(56,189,248,0.2)' : '1px solid transparent',
                  cursor: temSessao ? 'pointer' : 'default',
                }}>
                  <span style={{ fontSize: 12, fontWeight: isHoje ? 800 : 600, color: isHoje ? '#818cf8' : '#A1A1AA' }}>{dia}</span>
                  {temSessao && (
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#38bdf8', boxShadow: '0 0 6px #38bdf8' }} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Próximas sessões */}
        <div style={{ background: '#111113', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: '22px 20px', display: 'flex', flexDirection: 'column', gap: 12, overflow: 'auto', maxHeight: 500 }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 800, color: '#F4F4F5', marginBottom: 4 }}>Próximas sessões</p>
          {proximas.length === 0 && (
            <p style={{ color: '#71717A', fontSize: 13 }}>Nenhuma sessão agendada</p>
          )}
          {proximas.map(s => {
            const dt = new Date(s.data_hora)
            const st = STATUS_MAP[s.status] || STATUS_MAP.agendada
            return (
              <div key={s.id} style={{ background: '#111113', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 14, padding: '14px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#F4F4F5' }}>{s.aluno_nome}</p>
                    <p style={{ fontSize: 12, color: '#71717A', marginTop: 2 }}>
                      {dt.toLocaleDateString('pt-BR')} às {pad(dt.getHours())}:{pad(dt.getMinutes())} · {s.duracao_min}min
                    </p>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: st.color, background: st.bg, borderRadius: 8, padding: '3px 10px', whiteSpace: 'nowrap' }}>{st.label}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                  {s.tipo === 'online'
                    ? <Video style={{ width: 13, height: 13, color: '#818cf8' }} />
                    : <MapPin style={{ width: 13, height: 13, color: '#34d399' }} />
                  }
                  <span style={{ fontSize: 12, color: '#71717A', textTransform: 'capitalize' }}>{s.tipo}</span>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {s.status === 'agendada' && (
                    <button onClick={() => atualizar.mutate({ id: s.id, status: 'confirmada' })} style={{ flex: 1, background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)', borderRadius: 10, color: '#34d399', cursor: 'pointer', fontSize: 11, fontWeight: 700, padding: '6px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                      <Check style={{ width: 12, height: 12 }} /> Confirmar
                    </button>
                  )}
                  {s.status !== 'concluida' && s.status !== 'cancelada' && (
                    <button onClick={() => atualizar.mutate({ id: s.id, status: 'concluida' })} style={{ flex: 1, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 10, color: '#818cf8', cursor: 'pointer', fontSize: 11, fontWeight: 700, padding: '6px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                      Concluir
                    </button>
                  )}
                  <button onClick={() => { if (confirm('Remover sessão?')) deletar.mutate(s.id) }} style={{ width: 32, background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 10, color: '#f87171', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Trash2 style={{ width: 12, height: 12 }} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Modal novo agendamento */}
      {showModal && (
        <>
          <div onClick={() => setShowModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 50 }} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 51, width: 420, background: '#111113', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 24, padding: 28, boxShadow: '0 32px 80px rgba(0,0,0,0.6)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
              <h2 style={{ fontFamily: 'Inter, sans-serif', fontSize: 18, fontWeight: 800, color: '#F4F4F5' }}>Nova sessão</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#71717A' }}><X style={{ width: 18, height: 18 }} /></button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#71717A', display: 'block', marginBottom: 6 }}>Aluno *</label>
                <select value={form.aluno_id} onChange={set('aluno_id')} required style={{ width: '100%', background: '#111113', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, color: '#F4F4F5', fontSize: 14, padding: '10px 14px' }}>
                  <option value="">Selecione</option>
                  {alunos.map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#71717A', display: 'block', marginBottom: 6 }}>Data e hora *</label>
                <input type="datetime-local" value={form.data_hora} onChange={set('data_hora')} required style={{ width: '100%', background: '#111113', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, color: '#F4F4F5', fontSize: 14, padding: '10px 14px', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#71717A', display: 'block', marginBottom: 6 }}>Duração (min)</label>
                  <input type="number" value={form.duracao_min} onChange={set('duracao_min')} min={15} max={180} style={{ width: '100%', background: '#111113', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, color: '#F4F4F5', fontSize: 14, padding: '10px 14px', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#71717A', display: 'block', marginBottom: 6 }}>Tipo</label>
                  <select value={form.tipo} onChange={set('tipo')} style={{ width: '100%', background: '#111113', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, color: '#F4F4F5', fontSize: 14, padding: '10px 14px' }}>
                    <option value="presencial">Presencial</option>
                    <option value="online">Online</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#71717A', display: 'block', marginBottom: 6 }}>Observações</label>
                <textarea value={form.notas} onChange={set('notas')} rows={2} placeholder="Foco do treino, local..." style={{ width: '100%', background: '#111113', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, color: '#F4F4F5', fontSize: 14, padding: '10px 14px', resize: 'vertical', boxSizing: 'border-box' }} />
              </div>
              <button type="submit" disabled={criar.isPending} style={{ background: '#6366f1', border: 'none', borderRadius: 14, color: 'white', cursor: 'pointer', fontWeight: 800, fontSize: 15, padding: '13px', marginTop: 4 }}>
                {criar.isPending ? 'Agendando…' : 'Confirmar agendamento'}
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  )
}
