import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { analyticsAluno } from '../api'
import { Printer, ArrowLeft, TrendingUp, TrendingDown, Minus } from 'lucide-react'

const BADGE_LABELS = {
  primeiro_treino: '🏋️ Primeiro Treino',
  streak_3: '🔥 Streak 3 dias',
  streak_7: '🔥 Streak 7 dias',
  streak_14: '🔥 Streak 14 dias',
  streak_30: '🔥 Streak 30 dias',
  treinos_10: '💪 10 Treinos',
  treinos_50: '💪 50 Treinos',
  treinos_100: '🏆 100 Treinos',
  carga_up: '📈 Carga aumentada',
  peso_meta: '⚡ Meta de peso',
}

function EvolIcon({ pct }) {
  if (!pct) return <Minus style={{ width: 14, height: 14, color: '#71717A' }} />
  if (pct > 0) return <TrendingUp style={{ width: 14, height: 14, color: '#34d399' }} />
  return <TrendingDown style={{ width: 14, height: 14, color: '#f87171' }} />
}

export default function RelatorioAluno() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['analytics-aluno', id],
    queryFn: async () => (await analyticsAluno(id)).data,
    staleTime: 60_000,
  })

  if (isLoading) {
    return (
      <div style={{ padding: 48, textAlign: 'center', color: '#71717A' }}>
        Gerando relatório…
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div style={{ padding: 48, textAlign: 'center' }}>
        <p style={{ color: '#f87171', marginBottom: 16 }}>Erro ao carregar dados do aluno.</p>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#A1A1AA', cursor: 'pointer', padding: '8px 16px', fontSize: 13 }}>
          Voltar
        </button>
      </div>
    )
  }

  const { aluno, personal, periodo, resumo, avaliacoes, progresso_exercicios, conquistas, gerado_em } = data
  const primeiraAv = avaliacoes[0]
  const ultimaAv = avaliacoes[avaliacoes.length - 1]
  const varPeso = primeiraAv && ultimaAv && primeiraAv.peso && ultimaAv.peso
    ? (ultimaAv.peso - primeiraAv.peso).toFixed(1)
    : null
  const varGordura = primeiraAv && ultimaAv && primeiraAv.percentual_gordura && ultimaAv.percentual_gordura
    ? (ultimaAv.percentual_gordura - primeiraAv.percentual_gordura).toFixed(1)
    : null

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; color: black !important; }
          .print-page { background: white !important; color: #111 !important; padding: 32px !important; }
          .print-card { background: #f8f8f8 !important; border: 1px solid #e5e7eb !important; border-radius: 12px !important; }
          .print-text-main { color: #111 !important; }
          .print-text-sub { color: #555 !important; }
          .print-text-muted { color: #888 !important; }
          .print-badge { background: #f0f0f0 !important; color: #333 !important; border: 1px solid #ddd !important; }
          .evolucao-pos { color: #16a34a !important; }
          .evolucao-neg { color: #dc2626 !important; }
        }
      `}</style>

      {/* Toolbar (não imprime) */}
      <div className="no-print" style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 12, background: '#111113' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#A1A1AA', cursor: 'pointer', padding: '8px 14px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
          <ArrowLeft style={{ width: 14, height: 14 }} /> Voltar
        </button>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#F4F4F5' }}>Relatório de {aluno.nome}</p>
          <p style={{ fontSize: 12, color: '#71717A' }}>Período: {periodo.inicio} a {periodo.fim}</p>
        </div>
        <button
          onClick={() => window.print()}
          style={{ background: '#6366f1', border: 'none', borderRadius: 12, color: 'white', cursor: 'pointer', fontWeight: 600, fontSize: 14, padding: '10px 22px', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 0 20px rgba(99,102,241,0.4)' }}
        >
          <Printer style={{ width: 16, height: 16 }} /> Imprimir / Salvar PDF
        </button>
      </div>

      {/* Conteúdo do relatório */}
      <div className="print-page" style={{ maxWidth: 800, margin: '0 auto', padding: '32px 24px', color: '#F4F4F5', fontFamily: 'Inter, sans-serif' }}>

        {/* Cabeçalho */}
        <div style={{ textAlign: 'center', marginBottom: 36, borderBottom: '2px solid rgba(99,102,241,0.3)', paddingBottom: 24 }}>
          <div style={{ fontSize: 28, fontFamily: 'Inter, sans-serif', fontWeight: 600, letterSpacing: '-0.03em', marginBottom: 6 }} className="print-text-main">
            ⚡ GymPro — Relatório de Evolução
          </div>
          <p className="print-text-sub" style={{ fontSize: 14, color: '#71717A', marginBottom: 4 }}>
            Aluno: <strong className="print-text-main" style={{ color: '#F4F4F5' }}>{aluno.nome}</strong> · Personal: {personal}
          </p>
          <p className="print-text-muted" style={{ fontSize: 12, color: '#71717A' }}>
            Período: {periodo.inicio} a {periodo.fim} · Gerado em {gerado_em}
          </p>
        </div>

        {/* KPIs rápidos */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 28 }}>
          {[
            { label: 'Treinos no mês', value: resumo.frequencia_30d, color: '#818cf8' },
            { label: 'Total de treinos', value: resumo.total_treinos, color: '#34d399' },
            { label: 'Streak atual', value: `${aluno.streak_atual}d`, color: '#f97316' },
            { label: 'Conquistas', value: resumo.conquistas_total, color: '#fbbf24' },
          ].map(k => (
            <div key={k.label} className="print-card" style={{ background: '#111113', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '16px 14px', textAlign: 'center' }}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 26, fontWeight: 600, color: k.color, lineHeight: 1, marginBottom: 6 }} className="print-text-main">{k.value}</p>
              <p style={{ fontSize: 11, color: '#71717A', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }} className="print-text-muted">{k.label}</p>
            </div>
          ))}
        </div>

        {/* Avaliações físicas */}
        {avaliacoes.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontFamily: 'Inter, sans-serif', fontSize: 16, fontWeight: 600, color: '#F4F4F5', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }} className="print-text-main">
              📏 Avaliações Físicas
            </h2>
            {/* Variações */}
            <div style={{ display: 'flex', gap: 14, marginBottom: 16, flexWrap: 'wrap' }}>
              {varPeso !== null && (
                <div className="print-card" style={{ background: '#111113', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '12px 16px', minWidth: 160 }}>
                  <p style={{ fontSize: 11, color: '#71717A', fontWeight: 700, marginBottom: 6 }} className="print-text-muted">Variação de Peso</p>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 22, fontWeight: 600, color: parseFloat(varPeso) < 0 ? '#34d399' : '#f87171' }} className={parseFloat(varPeso) < 0 ? 'evolucao-pos' : 'evolucao-neg'}>
                    {parseFloat(varPeso) > 0 ? '+' : ''}{varPeso} kg
                  </p>
                  <p style={{ fontSize: 11, color: '#71717A' }} className="print-text-muted">{primeiraAv.peso} → {ultimaAv.peso} kg</p>
                </div>
              )}
              {varGordura !== null && (
                <div className="print-card" style={{ background: '#111113', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '12px 16px', minWidth: 160 }}>
                  <p style={{ fontSize: 11, color: '#71717A', fontWeight: 700, marginBottom: 6 }} className="print-text-muted">Variação Gordura</p>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 22, fontWeight: 600, color: parseFloat(varGordura) < 0 ? '#34d399' : '#f87171' }} className={parseFloat(varGordura) < 0 ? 'evolucao-pos' : 'evolucao-neg'}>
                    {parseFloat(varGordura) > 0 ? '+' : ''}{varGordura}%
                  </p>
                  <p style={{ fontSize: 11, color: '#71717A' }} className="print-text-muted">{primeiraAv.percentual_gordura} → {ultimaAv.percentual_gordura}%</p>
                </div>
              )}
            </div>
            {/* Tabela de avaliações */}
            <div style={{ background: '#111113', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, overflow: 'hidden' }} className="print-card">
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    {['Data', 'Peso (kg)', 'Gordura (%)', 'Cintura (cm)', 'Quadril (cm)'].map(h => (
                      <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#71717A', textTransform: 'uppercase', letterSpacing: '0.04em' }} className="print-text-muted">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {avaliacoes.map((av, i) => {
                    let medidas = {}
                    try { medidas = JSON.parse(av.medidas || '{}') } catch {}
                    return (
                      <tr key={i} style={{ borderBottom: i < avaliacoes.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                        <td style={{ padding: '10px 14px', color: '#A1A1AA', fontWeight: 600 }} className="print-text-sub">{av.data}</td>
                        <td style={{ padding: '10px 14px', color: '#F4F4F5', fontWeight: 700 }} className="print-text-main">{av.peso ?? '—'}</td>
                        <td style={{ padding: '10px 14px', color: '#F4F4F5' }} className="print-text-main">{av.percentual_gordura ?? '—'}</td>
                        <td style={{ padding: '10px 14px', color: '#F4F4F5' }} className="print-text-main">{medidas.cintura ?? '—'}</td>
                        <td style={{ padding: '10px 14px', color: '#F4F4F5' }} className="print-text-main">{medidas.quadril ?? '—'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Progresso por exercício */}
        {progresso_exercicios.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontFamily: 'Inter, sans-serif', fontSize: 16, fontWeight: 600, color: '#F4F4F5', marginBottom: 14 }} className="print-text-main">
              📈 Evolução de Cargas (90 dias)
            </h2>
            <div style={{ background: '#111113', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, overflow: 'hidden' }} className="print-card">
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    {['Exercício', 'Grupo', 'Inicial (kg)', 'Máximo (kg)', 'Evolução', 'Execuções'].map(h => (
                      <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#71717A', textTransform: 'uppercase', letterSpacing: '0.04em' }} className="print-text-muted">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {progresso_exercicios.map((ex, i) => (
                    <tr key={i} style={{ borderBottom: i < progresso_exercicios.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                      <td style={{ padding: '10px 14px', color: '#F4F4F5', fontWeight: 700 }} className="print-text-main">{ex.nome}</td>
                      <td style={{ padding: '10px 14px', color: '#71717A' }} className="print-text-muted">{ex.grupo ?? '—'}</td>
                      <td style={{ padding: '10px 14px', color: '#A1A1AA' }} className="print-text-sub">{ex.carga_inicial ?? '—'}</td>
                      <td style={{ padding: '10px 14px', color: '#F4F4F5', fontWeight: 700 }} className="print-text-main">{ex.carga_maxima ?? '—'}</td>
                      <td style={{ padding: '10px 14px' }}>
                        {ex.evolucao_pct != null ? (
                          <span style={{ color: ex.evolucao_pct >= 0 ? '#34d399' : '#f87171', fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }} className={ex.evolucao_pct >= 0 ? 'evolucao-pos' : 'evolucao-neg'}>
                            <EvolIcon pct={ex.evolucao_pct} />
                            {ex.evolucao_pct > 0 ? '+' : ''}{ex.evolucao_pct}%
                          </span>
                        ) : <span style={{ color: '#71717A' }}>—</span>}
                      </td>
                      <td style={{ padding: '10px 14px', color: '#71717A' }} className="print-text-muted">{ex.execucoes}x</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Conquistas */}
        {conquistas.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontFamily: 'Inter, sans-serif', fontSize: 16, fontWeight: 600, color: '#F4F4F5', marginBottom: 14 }} className="print-text-main">
              🏆 Conquistas Desbloqueadas
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {conquistas.map(c => (
                <div key={c.codigo} className="print-badge" style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 10, padding: '6px 14px', fontSize: 13, color: '#a5b4fc' }}>
                  {BADGE_LABELS[c.codigo] || c.codigo}
                  <span style={{ fontSize: 11, color: '#71717A', marginLeft: 8 }}>· {c.data}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rodapé */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 20, textAlign: 'center', marginTop: 20 }}>
          <p style={{ fontSize: 11, color: '#71717A' }} className="print-text-muted">
            Relatório gerado por <strong>GymPro</strong> · {gerado_em} · Objetivo do aluno: {aluno.objetivo || 'Não definido'}
          </p>
        </div>
      </div>
    </>
  )
}
