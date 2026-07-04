/**
 * Aba de Nutrição dentro de AlunoDetalhe.
 * Permite ao personal criar/editar o plano alimentar do aluno.
 */
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { planoNutricao, criarPlanoNutricao, deletarPlanoNutricao, adicionarRefeicao, removerRefeicao } from '../api'
import { Plus, Trash2, ChevronDown, ChevronUp, Apple, Target } from 'lucide-react'
import toast from 'react-hot-toast'

const REFEICOES_PADRAO = ['Café da manhã', 'Lanche manhã', 'Almoço', 'Lanche tarde', 'Jantar', 'Ceia']

function MacroBar({ label, current, meta, color }) {
  const pct = meta > 0 ? Math.min(100, Math.round((current / meta) * 100)) : 0
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#4B5768', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</span>
        <span style={{ fontSize: 11, color: '#4B5768' }}>{current}g / {meta ?? '—'}g</span>
      </div>
      <div style={{ height: 5, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 3, transition: 'width 0.4s' }} />
      </div>
    </div>
  )
}

function RefeicaoCard({ ref: r, planoId, alunoId, onDelete }) {
  const [open, setOpen] = useState(false)
  const kcal = r.alimentos.reduce((s, a) => s + (a.kcal || 0), 0)
  const prot = r.alimentos.reduce((s, a) => s + (a.prot || 0), 0)

  return (
    <div style={{ background: '#141D30', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 14, overflow: 'hidden' }}>
      <div
        onClick={() => setOpen(o => !o)}
        style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Apple style={{ width: 15, height: 15, color: '#34d399' }} />
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#EFF6FF' }}>{r.nome}</p>
            {r.horario && <p style={{ fontSize: 11, color: '#4B5768' }}>{r.horario}</p>}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#fbbf24' }}>{kcal} kcal</p>
            <p style={{ fontSize: 11, color: '#4B5768' }}>{prot.toFixed(1)}g prot.</p>
          </div>
          {open ? <ChevronUp style={{ width: 15, height: 15, color: '#4B5768' }} /> : <ChevronDown style={{ width: 15, height: 15, color: '#4B5768' }} />}
        </div>
      </div>
      {open && (
        <div style={{ padding: '0 16px 14px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          {r.alimentos.length === 0 ? (
            <p style={{ fontSize: 12, color: '#3D4F6A', padding: '10px 0' }}>Nenhum alimento adicionado</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 10 }}>
              <thead>
                <tr>
                  {['Alimento', 'Qtd', 'Kcal', 'Prot', 'Carbo', 'Gord'].map(h => (
                    <th key={h} style={{ fontSize: 10, fontWeight: 700, color: '#3D4F6A', textAlign: 'left', padding: '4px 8px 4px 0', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {r.alimentos.map((a, i) => (
                  <tr key={i} style={{ borderTop: '1px solid rgba(255,255,255,0.03)' }}>
                    <td style={{ padding: '6px 8px 6px 0', fontSize: 13, color: '#94A3B8', fontWeight: 600 }}>{a.nome}</td>
                    <td style={{ padding: '6px 8px 6px 0', fontSize: 12, color: '#4B5768' }}>{a.qtd}</td>
                    <td style={{ padding: '6px 8px 6px 0', fontSize: 12, color: '#fbbf24', fontWeight: 700 }}>{a.kcal ?? '—'}</td>
                    <td style={{ padding: '6px 8px 6px 0', fontSize: 12, color: '#4B5768' }}>{a.prot != null ? `${a.prot}g` : '—'}</td>
                    <td style={{ padding: '6px 8px 6px 0', fontSize: 12, color: '#4B5768' }}>{a.carbo != null ? `${a.carbo}g` : '—'}</td>
                    <td style={{ padding: '6px 8px 6px 0', fontSize: 12, color: '#4B5768' }}>{a.gord != null ? `${a.gord}g` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <button onClick={() => onDelete(r.id)} style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 10, color: '#f87171', cursor: 'pointer', fontSize: 12, fontWeight: 700, padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 5 }}>
              <Trash2 style={{ width: 12, height: 12 }} /> Remover refeição
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function NutricaoTab({ alunoId }) {
  const qc = useQueryClient()
  const [showNovoPlan, setShowNovoPlan] = useState(false)
  const [showNovaRef, setShowNovaRef] = useState(false)
  const [formPlan, setFormPlan] = useState({ nome: 'Plano Alimentar', objetivo_kcal: '', objetivo_proteina: '', objetivo_carbo: '', objetivo_gordura: '', observacoes: '' })
  const [nomeRef, setNomeRef] = useState('')
  const [horarioRef, setHorarioRef] = useState('')
  const [alimentosRef, setAlimentosRef] = useState([{ nome: '', qtd: '', kcal: '', prot: '', carbo: '', gord: '' }])

  const { data: plano, isLoading } = useQuery({
    queryKey: ['nutricao', alunoId],
    queryFn: async () => { const r = await planoNutricao(alunoId); return r.data },
    staleTime: 30_000,
  })

  const criar = useMutation({
    mutationFn: (d) => criarPlanoNutricao(d),
    onSuccess: () => { qc.invalidateQueries(['nutricao', alunoId]); setShowNovoPlan(false); toast.success('Plano criado!') },
    onError: () => toast.error('Erro ao criar plano'),
  })
  const deletarPlano = useMutation({
    mutationFn: (id) => deletarPlanoNutricao(id),
    onSuccess: () => { qc.invalidateQueries(['nutricao', alunoId]); toast.success('Plano removido') },
  })
  const addRef = useMutation({
    mutationFn: ({ planoId, data }) => adicionarRefeicao(planoId, data),
    onSuccess: () => { qc.invalidateQueries(['nutricao', alunoId]); setShowNovaRef(false); toast.success('Refeição adicionada!') },
    onError: () => toast.error('Erro ao adicionar refeição'),
  })
  const remRef = useMutation({
    mutationFn: ({ planoId, refId }) => removerRefeicao(planoId, refId),
    onSuccess: () => { qc.invalidateQueries(['nutricao', alunoId]); toast.success('Refeição removida') },
  })

  function setFP(k) { return (e) => setFormPlan(f => ({ ...f, [k]: e.target.value })) }
  function setAlim(i, k) { return (e) => setAlimentosRef(a => a.map((x, j) => j === i ? { ...x, [k]: e.target.value } : x)) }
  function addAlim() { setAlimentosRef(a => [...a, { nome: '', qtd: '', kcal: '', prot: '', carbo: '', gord: '' }]) }
  function removeAlim(i) { setAlimentosRef(a => a.filter((_, j) => j !== i)) }

  function handleCriarPlano(e) {
    e.preventDefault()
    criar.mutate({
      aluno_id: alunoId,
      nome: formPlan.nome,
      objetivo_kcal: formPlan.objetivo_kcal ? Number(formPlan.objetivo_kcal) : null,
      objetivo_proteina: formPlan.objetivo_proteina ? Number(formPlan.objetivo_proteina) : null,
      objetivo_carbo: formPlan.objetivo_carbo ? Number(formPlan.objetivo_carbo) : null,
      objetivo_gordura: formPlan.objetivo_gordura ? Number(formPlan.objetivo_gordura) : null,
      observacoes: formPlan.observacoes || null,
      refeicoes: [],
    })
  }

  function handleAddRef(e) {
    e.preventDefault()
    if (!plano) return
    const alimentos = alimentosRef.filter(a => a.nome.trim()).map(a => ({
      nome: a.nome, qtd: a.qtd,
      kcal: a.kcal ? Number(a.kcal) : null,
      prot: a.prot ? Number(a.prot) : null,
      carbo: a.carbo ? Number(a.carbo) : null,
      gord: a.gord ? Number(a.gord) : null,
    }))
    addRef.mutate({ planoId: plano.id, data: { nome: nomeRef, horario: horarioRef || null, alimentos } })
  }

  if (isLoading) return <div style={{ padding: 24, color: '#4B5768' }}>Carregando…</div>

  if (!plano) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ background: '#0E1525', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 18, padding: '28px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🥗</div>
          <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 17, fontWeight: 800, color: '#EFF6FF', marginBottom: 8 }}>Nenhum plano nutricional</p>
          <p style={{ fontSize: 13, color: '#4B5768', marginBottom: 20 }}>Crie um plano alimentar personalizado para este aluno.</p>
          <button onClick={() => setShowNovoPlan(true)} style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', border: 'none', borderRadius: 13, color: 'white', cursor: 'pointer', fontWeight: 800, fontSize: 14, padding: '11px 24px' }}>
            Criar plano alimentar
          </button>
        </div>
        {showNovoPlan && (
          <div style={{ background: '#0E1525', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: 24 }}>
            <form onSubmit={handleCriarPlano} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 16, fontWeight: 800, color: '#EFF6FF', marginBottom: 4 }}>Novo plano alimentar</h3>
              <input value={formPlan.nome} onChange={setFP('nome')} placeholder="Nome do plano" style={{ background: '#141D30', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 11, color: '#EFF6FF', fontSize: 14, padding: '10px 14px' }} />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
                {[['objetivo_kcal','Kcal/dia'],['objetivo_proteina','Proteína (g)'],['objetivo_carbo','Carbo (g)'],['objetivo_gordura','Gordura (g)']].map(([k, label]) => (
                  <div key={k}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: '#4B5768', display: 'block', marginBottom: 5 }}>{label}</label>
                    <input type="number" value={formPlan[k]} onChange={setFP(k)} placeholder="0" style={{ width: '100%', background: '#141D30', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, color: '#EFF6FF', fontSize: 14, padding: '8px 10px', boxSizing: 'border-box' }} />
                  </div>
                ))}
              </div>
              <textarea value={formPlan.observacoes} onChange={setFP('observacoes')} rows={2} placeholder="Observações / restrições alimentares…" style={{ background: '#141D30', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 11, color: '#EFF6FF', fontSize: 14, padding: '10px 14px', resize: 'vertical' }} />
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" disabled={criar.isPending} style={{ flex: 1, background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', border: 'none', borderRadius: 12, color: 'white', cursor: 'pointer', fontWeight: 800, fontSize: 14, padding: '11px' }}>
                  {criar.isPending ? 'Criando…' : 'Criar plano'}
                </button>
                <button type="button" onClick={() => setShowNovoPlan(false)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, color: '#4B5768', cursor: 'pointer', fontWeight: 700, fontSize: 14, padding: '11px 18px' }}>Cancelar</button>
              </div>
            </form>
          </div>
        )}
      </div>
    )
  }

  // Totais das refeições
  const totalKcal = plano.refeicoes.reduce((s, r) => s + r.alimentos.reduce((ss, a) => ss + (a.kcal || 0), 0), 0)
  const totalProt = plano.refeicoes.reduce((s, r) => s + r.alimentos.reduce((ss, a) => ss + (a.prot || 0), 0), 0)
  const totalCarbo = plano.refeicoes.reduce((s, r) => s + r.alimentos.reduce((ss, a) => ss + (a.carbo || 0), 0), 0)
  const totalGord = plano.refeicoes.reduce((s, r) => s + r.alimentos.reduce((ss, a) => ss + (a.gord || 0), 0), 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header do plano */}
      <div style={{ background: '#0E1525', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 18, padding: '18px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 16, fontWeight: 800, color: '#EFF6FF' }}>{plano.nome}</p>
            {plano.observacoes && <p style={{ fontSize: 12, color: '#4B5768', marginTop: 4 }}>{plano.observacoes}</p>}
          </div>
          <button onClick={() => { if (confirm('Remover plano?')) deletarPlano.mutate(plano.id) }} style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 10, color: '#f87171', cursor: 'pointer', fontSize: 12, fontWeight: 700, padding: '6px 12px' }}>
            Remover plano
          </button>
        </div>
        {/* Macros */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#4B5768', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Calorias</span>
              <span style={{ fontSize: 11, color: '#fbbf24', fontWeight: 700 }}>{totalKcal} / {plano.objetivo_kcal ?? '—'} kcal</span>
            </div>
            <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${plano.objetivo_kcal ? Math.min(100, Math.round((totalKcal/plano.objetivo_kcal)*100)) : 0}%`, background: 'linear-gradient(90deg,#f97316,#fbbf24)', borderRadius: 3 }} />
            </div>
          </div>
          <MacroBar label="Proteína" current={Math.round(totalProt)} meta={plano.objetivo_proteina} color="#818cf8" />
          <MacroBar label="Carboidrato" current={Math.round(totalCarbo)} meta={plano.objetivo_carbo} color="#34d399" />
          <MacroBar label="Gordura" current={Math.round(totalGord)} meta={plano.objetivo_gordura} color="#f9a8d4" />
        </div>
      </div>

      {/* Refeições */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {plano.refeicoes.map(r => (
          <RefeicaoCard key={r.id} ref={r} planoId={plano.id} alunoId={alunoId} onDelete={(refId) => remRef.mutate({ planoId: plano.id, refId })} />
        ))}
      </div>

      {/* Botão adicionar refeição */}
      {!showNovaRef ? (
        <button onClick={() => setShowNovaRef(true)} style={{ background: 'rgba(52,211,153,0.08)', border: '1px dashed rgba(52,211,153,0.25)', borderRadius: 14, color: '#34d399', cursor: 'pointer', fontWeight: 700, fontSize: 14, padding: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Plus style={{ width: 16, height: 16 }} /> Adicionar refeição
        </button>
      ) : (
        <div style={{ background: '#0E1525', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: 20 }}>
          <form onSubmit={handleAddRef} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <h4 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 15, fontWeight: 800, color: '#EFF6FF' }}>Nova refeição</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#4B5768', display: 'block', marginBottom: 5 }}>Nome da refeição</label>
                <select value={nomeRef} onChange={e => setNomeRef(e.target.value)} style={{ width: '100%', background: '#141D30', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, color: '#EFF6FF', fontSize: 14, padding: '9px 12px' }}>
                  <option value="">Selecione…</option>
                  {REFEICOES_PADRAO.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#4B5768', display: 'block', marginBottom: 5 }}>Horário</label>
                <input type="time" value={horarioRef} onChange={e => setHorarioRef(e.target.value)} style={{ width: '100%', background: '#141D30', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, color: '#EFF6FF', fontSize: 14, padding: '9px 12px', boxSizing: 'border-box' }} />
              </div>
            </div>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#4B5768', marginBottom: -6 }}>Alimentos</p>
            {alimentosRef.map((a, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 60px 60px 60px 60px 32px', gap: 6, alignItems: 'end' }}>
                {[['nome','Alimento'],['qtd','Qtd'],['kcal','Kcal'],['prot','Prot(g)'],['carbo','Carbo(g)'],['gord','Gord(g)']].map(([k, ph]) => (
                  <div key={k}>
                    {i === 0 && <label style={{ fontSize: 10, color: '#3D4F6A', display: 'block', marginBottom: 4 }}>{ph}</label>}
                    <input value={a[k]} onChange={setAlim(i, k)} placeholder={ph} type={['kcal','prot','carbo','gord'].includes(k) ? 'number' : 'text'} style={{ width: '100%', background: '#141D30', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 9, color: '#EFF6FF', fontSize: 12, padding: '7px 8px', boxSizing: 'border-box' }} />
                  </div>
                ))}
                <button type="button" onClick={() => removeAlim(i)} style={{ background: 'none', border: 'none', color: '#3D4F6A', cursor: 'pointer', padding: 0, marginTop: i === 0 ? 16 : 0 }}>✕</button>
              </div>
            ))}
            <button type="button" onClick={addAlim} style={{ background: 'none', border: 'none', color: '#818cf8', cursor: 'pointer', fontSize: 13, fontWeight: 700, textAlign: 'left', padding: 0 }}>+ Adicionar alimento</button>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" disabled={!nomeRef || addRef.isPending} style={{ flex: 1, background: 'linear-gradient(135deg,#10b981,#059669)', border: 'none', borderRadius: 12, color: 'white', cursor: 'pointer', fontWeight: 800, fontSize: 14, padding: '11px' }}>
                {addRef.isPending ? 'Salvando…' : 'Salvar refeição'}
              </button>
              <button type="button" onClick={() => setShowNovaRef(false)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, color: '#4B5768', cursor: 'pointer', fontWeight: 700, fontSize: 14, padding: '11px 18px' }}>Cancelar</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
