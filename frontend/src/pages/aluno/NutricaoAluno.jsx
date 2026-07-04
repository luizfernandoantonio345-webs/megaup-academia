import { useQuery } from '@tanstack/react-query'
import { meuPerfilAluno, planoNutricao } from '../../api'
import { Apple, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'

function RefeicaoCard({ r }) {
  const [open, setOpen] = useState(false)
  const kcal = r.alimentos.reduce((s, a) => s + (a.kcal || 0), 0)
  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden' }}>
      <div onClick={() => setOpen(o => !o)} style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 11, background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Apple style={{ width: 16, height: 16, color: '#34d399' }} />
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#F4F4F5' }}>{r.nome}</p>
            {r.horario && <p style={{ fontSize: 11, color: '#71717A' }}>{r.horario}</p>}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 800, color: '#fbbf24' }}>{kcal} kcal</span>
          {open ? <ChevronUp style={{ width: 14, height: 14, color: '#71717A' }} /> : <ChevronDown style={{ width: 14, height: 14, color: '#71717A' }} />}
        </div>
      </div>
      {open && r.alimentos.length > 0 && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '12px 16px' }}>
          {r.alimentos.map((a, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: i < r.alimentos.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none' }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#A1A1AA' }}>{a.nome}</p>
                <p style={{ fontSize: 11, color: '#71717A' }}>{a.qtd}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: 12, color: '#fbbf24', fontWeight: 700 }}>{a.kcal ?? '—'} kcal</p>
                <p style={{ fontSize: 11, color: '#71717A' }}>P:{a.prot ?? '—'}g C:{a.carbo ?? '—'}g G:{a.gord ?? '—'}g</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function NutricaoAluno() {
  const { data: perfil } = useQuery({
    queryKey: ['meu-perfil'],
    queryFn: async () => (await meuPerfilAluno()).data,
    staleTime: 300_000,
  })

  const { data: plano, isLoading } = useQuery({
    queryKey: ['nutricao-aluno', perfil?.id],
    queryFn: async () => { const r = await planoNutricao(perfil.id); return r.data },
    enabled: !!perfil?.id,
    staleTime: 60_000,
  })

  if (isLoading) return <div style={{ padding: 24, color: '#71717A', textAlign: 'center' }}>Carregando…</div>

  if (!plano) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 24px' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🥗</div>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 18, fontWeight: 600, color: '#F4F4F5', marginBottom: 8 }}>Nenhum plano ainda</p>
        <p style={{ fontSize: 14, color: '#71717A' }}>Seu personal ainda não criou um plano alimentar para você.</p>
      </div>
    )
  }

  const totalKcal = plano.refeicoes.reduce((s, r) => s + r.alimentos.reduce((ss, a) => ss + (a.kcal || 0), 0), 0)
  const totalProt = plano.refeicoes.reduce((s, r) => s + r.alimentos.reduce((ss, a) => ss + (a.prot || 0), 0), 0)
  const totalCarbo = plano.refeicoes.reduce((s, r) => s + r.alimentos.reduce((ss, a) => ss + (a.carbo || 0), 0), 0)
  const totalGord = plano.refeicoes.reduce((s, r) => s + r.alimentos.reduce((ss, a) => ss + (a.gord || 0), 0), 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: 22, fontWeight: 600, color: '#F4F4F5', letterSpacing: '-0.02em', marginBottom: 4 }}>{plano.nome}</h1>
        {plano.observacoes && <p style={{ fontSize: 13, color: '#71717A' }}>{plano.observacoes}</p>}
      </div>

      {/* Macros resumo */}
      <div style={{ background: 'linear-gradient(135deg,rgba(251,191,36,0.1),rgba(249,115,22,0.08))', border: '1px solid rgba(251,191,36,0.2)', borderRadius: 20, padding: '18px 20px' }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#71717A', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Total diário prescrito</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
          {[
            { label: 'Kcal', value: `${totalKcal}`, meta: plano.objetivo_kcal, color: '#fbbf24' },
            { label: 'Prot.', value: `${Math.round(totalProt)}g`, meta: plano.objetivo_proteina ? `${plano.objetivo_proteina}g` : null, color: '#818cf8' },
            { label: 'Carbo', value: `${Math.round(totalCarbo)}g`, meta: plano.objetivo_carbo ? `${plano.objetivo_carbo}g` : null, color: '#34d399' },
            { label: 'Gord.', value: `${Math.round(totalGord)}g`, meta: plano.objetivo_gordura ? `${plano.objetivo_gordura}g` : null, color: '#f9a8d4' },
          ].map(m => (
            <div key={m.label} style={{ textAlign: 'center' }}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 20, fontWeight: 600, color: m.color, lineHeight: 1 }}>{m.value}</p>
              <p style={{ fontSize: 10, color: '#71717A', marginTop: 4, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{m.label}</p>
              {m.meta && <p style={{ fontSize: 10, color: '#71717A' }}>meta: {m.meta}</p>}
            </div>
          ))}
        </div>
      </div>

      {/* Lista de refeições */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {plano.refeicoes.map(r => <RefeicaoCard key={r.id} r={r} />)}
      </div>
    </div>
  )
}
