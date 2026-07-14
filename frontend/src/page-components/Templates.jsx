import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listarTemplates, criarTemplate, deletarTemplate, aplicarTemplate, listarAlunos } from '../api'
import toast from 'react-hot-toast'
import { Plus, Trash2, Dumbbell, Copy, X, Check, ChevronDown, Users } from 'lucide-react'

const OBJETIVOS = [
  { key: 'hipertrofia',     label: 'Hipertrofia',     color: '#E8342B' },
  { key: 'forca',           label: 'Força',            color: '#f97316' },
  { key: 'emagrecimento',   label: 'Emagrecimento',   color: '#10b981' },
  { key: 'condicionamento', label: 'Condicionamento', color: '#3b82f6' },
  { key: 'reabilitacao',    label: 'Reabilitação',    color: '#a855f7' },
]

const DIAS = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo']
const DIA_LABEL = { segunda:'Seg', terca:'Ter', quarta:'Qua', quinta:'Qui', sexta:'Sex', sabado:'Sáb', domingo:'Dom' }
const OBJ_MAP = Object.fromEntries(OBJETIVOS.map(o => [o.key, o]))

function ModalCriar({ onClose }) {
  const qc = useQueryClient()
  const [form, setForm] = useState({ nome: '', objetivo: '', dia_semana: '', descricao: '' })
  const { mutate, isPending } = useMutation({
    mutationFn: () => criarTemplate({ nome: form.nome, objetivo: form.objetivo || null, dia_semana: form.dia_semana || null, descricao: form.descricao || null }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['templates'] }); toast.success('Template criado!'); onClose() },
    onError: err => toast.error(err.response?.data?.detail || 'Erro'),
  })
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', backdropFilter:'blur(8px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50, padding:16 }}>
      <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:20, width:'100%', maxWidth:440, padding:24 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <h2 style={{ fontSize:17, fontWeight:600, color:'var(--text-primary)', margin:0 }}>Novo template</h2>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', padding:4 }}><X size={18}/></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="label">Nome do template *</label>
            <input className="input" placeholder="Ex: Treino A — Push Day" value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} />
          </div>
          <div>
            <label className="label">Objetivo</label>
            <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
              {OBJETIVOS.map(o => (
                <button key={o.key} type="button"
                  onClick={() => setForm({ ...form, objetivo: form.objetivo === o.key ? '' : o.key })}
                  style={{ padding:'5px 10px', borderRadius:20, border:`1px solid ${form.objetivo === o.key ? o.color : 'var(--border)'}`, background: form.objetivo === o.key ? `${o.color}22` : 'transparent', color: form.objetivo === o.key ? o.color : 'var(--text-muted)', fontSize:12, cursor:'pointer', fontWeight: form.objetivo === o.key ? 600 : 400 }}>
                  {o.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Dia sugerido</label>
            <div style={{ display:'flex', gap:4 }}>
              {DIAS.map(d => (
                <button key={d} type="button"
                  onClick={() => setForm({ ...form, dia_semana: form.dia_semana === d ? '' : d })}
                  style={{ flex:1, padding:'6px 0', borderRadius:8, border:`1px solid ${form.dia_semana === d ? '#E8342B' : 'var(--border)'}`, background: form.dia_semana === d ? 'rgba(232,52,43,0.12)' : 'transparent', color: form.dia_semana === d ? '#E8342B' : 'var(--text-muted)', fontSize:11, cursor:'pointer', fontWeight: form.dia_semana === d ? 600 : 400 }}>
                  {DIA_LABEL[d]}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Descrição (opcional)</label>
            <textarea className="input" rows={2} placeholder="Notas, equipamentos necessários..." value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} style={{ resize:'none' }} />
          </div>
          <button onClick={() => form.nome.trim() && mutate()} disabled={!form.nome.trim() || isPending} className="btn-primary w-full py-3">
            {isPending ? 'Criando...' : 'Criar template'}
          </button>
        </div>
      </div>
    </div>
  )
}

function ModalAplicar({ template, onClose }) {
  const qc = useQueryClient()
  const [alunoId, setAlunoId] = useState('')
  const [dia, setDia] = useState(template.dia_semana || '')
  const { data: alunos = [] } = useQuery({ queryKey:['alunos'], queryFn: () => listarAlunos().then(r => r.data) })
  const { mutate, isPending } = useMutation({
    mutationFn: () => aplicarTemplate(template.id, { aluno_id: Number(alunoId), dia_semana: dia || null }),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['treinos'] })
      toast.success(`Treino "${res.data.nome}" criado para o aluno! ✅`)
      onClose()
    },
    onError: err => toast.error(err.response?.data?.detail || 'Erro'),
  })
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', backdropFilter:'blur(8px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50, padding:16 }}>
      <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:20, width:'100%', maxWidth:400, padding:24 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <div>
            <h2 style={{ fontSize:17, fontWeight:600, color:'var(--text-primary)', margin:0 }}>Aplicar template</h2>
            <p style={{ fontSize:12, color:'var(--text-muted)', margin:'4px 0 0' }}>{template.nome}</p>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', padding:4 }}><X size={18}/></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="label">Selecionar aluno *</label>
            <div style={{ position:'relative' }}>
              <select className="input" value={alunoId} onChange={e => setAlunoId(e.target.value)} style={{ appearance:'none', paddingRight:36 }}>
                <option value="">— Escolha um aluno —</option>
                {alunos.map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}
              </select>
              <ChevronDown size={14} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)', pointerEvents:'none' }} />
            </div>
          </div>
          <div>
            <label className="label">Dia da semana</label>
            <div style={{ display:'flex', gap:4 }}>
              {DIAS.map(d => (
                <button key={d} type="button"
                  onClick={() => setDia(dia === d ? '' : d)}
                  style={{ flex:1, padding:'6px 0', borderRadius:8, border:`1px solid ${dia === d ? '#E8342B' : 'var(--border)'}`, background: dia === d ? 'rgba(232,52,43,0.12)' : 'transparent', color: dia === d ? '#E8342B' : 'var(--text-muted)', fontSize:11, cursor:'pointer', fontWeight: dia === d ? 600 : 400 }}>
                  {DIA_LABEL[d]}
                </button>
              ))}
            </div>
          </div>
          <button onClick={() => alunoId && mutate()} disabled={!alunoId || isPending} className="btn-primary w-full py-3">
            {isPending ? 'Aplicando...' : `Criar treino para o aluno`}
          </button>
        </div>
      </div>
    </div>
  )
}

function TemplateCard({ template, onDelete, onAplicar }) {
  const obj = OBJ_MAP[template.objetivo]
  return (
    <div className="card" style={{ display:'flex', flexDirection:'column', gap:12 }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:8 }}>
        <div style={{ flex:1, minWidth:0 }}>
          <h3 style={{ fontSize:14, fontWeight:600, color:'var(--text-primary)', margin:0, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{template.nome}</h3>
          <div style={{ display:'flex', gap:6, marginTop:6, flexWrap:'wrap' }}>
            {obj && (
              <span style={{ padding:'2px 8px', borderRadius:20, background:`${obj.color}18`, color:obj.color, fontSize:11, fontWeight:600 }}>{obj.label}</span>
            )}
            {template.dia_semana && (
              <span style={{ padding:'2px 8px', borderRadius:20, background:'rgba(99,102,241,0.1)', color:'#fca5a5', fontSize:11 }}>{DIA_LABEL[template.dia_semana] || template.dia_semana}</span>
            )}
          </div>
        </div>
        <button onClick={onDelete} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', padding:4, flexShrink:0, borderRadius:6 }}
          onMouseEnter={e => e.currentTarget.style.color='#E8342B'}
          onMouseLeave={e => e.currentTarget.style.color='var(--text-muted)'}>
          <Trash2 size={15}/>
        </button>
      </div>

      {/* Exercise count */}
      <div style={{ display:'flex', alignItems:'center', gap:6, color:'var(--text-muted)', fontSize:13 }}>
        <Dumbbell size={13}/>
        <span>{template.n_exercicios} exercício{template.n_exercicios !== 1 ? 's' : ''}</span>
      </div>

      {template.descricao && (
        <p style={{ fontSize:12, color:'var(--text-muted)', margin:0, lineHeight:1.5 }}>{template.descricao}</p>
      )}

      {/* Apply button */}
      <button onClick={onAplicar} className="btn-primary" style={{ marginTop:'auto', display:'flex', alignItems:'center', justifyContent:'center', gap:6, fontSize:13, padding:'8px 0' }}>
        <Copy size={13}/> Aplicar a aluno
      </button>
    </div>
  )
}

export default function Templates() {
  const qc = useQueryClient()
  const [showCriar, setShowCriar] = useState(false)
  const [aplicando, setAplicando] = useState(null)

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['templates'],
    queryFn: () => listarTemplates().then(r => r.data),
    staleTime: 5 * 60_000,
  })

  const { mutate: del } = useMutation({
    mutationFn: (id) => deletarTemplate(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['templates'] }); toast.success('Template removido') },
    onError: () => toast.error('Erro ao remover'),
  })

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:700, color:'var(--text-primary)', margin:0 }}>Templates</h1>
          <p style={{ fontSize:13, color:'var(--text-muted)', marginTop:4 }}>Treinos prontos para aplicar a qualquer aluno</p>
        </div>
        <button onClick={() => setShowCriar(true)} className="btn-primary" style={{ display:'flex', alignItems:'center', gap:6, fontSize:13 }}>
          <Plus size={15}/> Novo template
        </button>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div style={{ textAlign:'center', padding:48, color:'var(--text-muted)' }}>Carregando...</div>
      ) : templates.length === 0 ? (
        <div className="card" style={{ textAlign:'center', padding:48 }}>
          <Dumbbell size={32} style={{ color:'var(--text-muted)', margin:'0 auto 12px' }}/>
          <p style={{ color:'var(--text-muted)', fontSize:14, margin:0 }}>Nenhum template ainda.</p>
          <p style={{ color:'var(--text-muted)', fontSize:13, marginTop:4 }}>Crie um template ou salve um treino existente como template.</p>
          <button onClick={() => setShowCriar(true)} className="btn-primary" style={{ marginTop:16, fontSize:13 }}>
            Criar primeiro template
          </button>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))', gap:16 }}>
          {templates.map(t => (
            <TemplateCard
              key={t.id}
              template={t}
              onDelete={() => { if (confirm(`Remover template "${t.nome}"?`)) del(t.id) }}
              onAplicar={() => setAplicando(t)}
            />
          ))}
        </div>
      )}

      {showCriar && <ModalCriar onClose={() => setShowCriar(false)} />}
      {aplicando && <ModalAplicar template={aplicando} onClose={() => setAplicando(null)} />}
    </div>
  )
}
