import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { alunosInativos, enviarNudge } from '../api'
import { useNavigate } from 'react-router-dom'
import { Bell, Send, AlertTriangle, Clock, ChevronRight, MessageCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const openWhatsApp = (nome, diasInativo) => {
  const dias = diasInativo ? `há ${diasInativo} dias` : 'faz um tempo'
  const msg = `Oi ${nome.split(' ')[0]}! 👋 Vi que você não treina ${dias}. Tudo bem? A academia está com saudades! Bora voltar? 💪🔥`
  window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank', 'noopener')
}

export default function Inativos() {
  const [dias, setDias] = useState(7)
  const navigate = useNavigate()

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['alunos-inativos', dias],
    queryFn: async () => (await alunosInativos(dias)).data,
    staleTime: 60_000,
  })

  const nudge = useMutation({
    mutationFn: (alunoId) => enviarNudge(alunoId),
    onSuccess: () => toast.success('Mensagem de incentivo enviada pelo chat!'),
    onError: () => toast.error('Erro ao enviar mensagem'),
  })

  const alunos = data?.alunos || []

  return (
    <div style={{ padding: 24, maxWidth: 800, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Bell style={{ width: 22, height: 22, color: '#f97316' }} />
        </div>
        <div>
          <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: 22, fontWeight: 600, color:'var(--text-primary)', letterSpacing: '-0.02em' }}>Alunos Inativos</h1>
          <p style={{ fontSize: 13, color:'var(--text-muted)' }}>Identifique e reconecte quem sumiu</p>
        </div>
      </div>

      {/* Filtro de dias */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {[3, 7, 14, 30].map(d => (
          <button
            key={d}
            onClick={() => setDias(d)}
            style={{ background: dias === d ? 'rgba(249,115,22,0.15)' : 'rgba(255,255,255,0.04)', border: `1px solid ${dias === d ? 'rgba(249,115,22,0.3)' : 'rgba(255,255,255,0.07)'}`, borderRadius: 12, color: dias === d ? '#f97316' : 'var(--text-muted)', cursor: 'pointer', fontWeight: 600, fontSize: 13, padding: '8px 18px', transition: 'all 0.15s' }}
          >
            +{d} dias
          </button>
        ))}
      </div>

      {/* Stat */}
      {!isLoading && data && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 14 }}>
          <div style={{ background:'radial-gradient(ellipse at 10% -20%, rgba(249,115,22,0.18) 0%, transparent 55%), #111113', border: '1px solid rgba(249,115,22,0.2)', borderRadius: 18, padding: '20px 22px', position:'relative', overflow:'hidden' }}>
            <div aria-hidden style={{ position:'absolute', top:-20, right:-15, width:80, height:80, borderRadius:'50%', background:'rgba(249,115,22,0.1)', filter:'blur(20px)', pointerEvents:'none' }} />
            <p style={{ fontSize: 11, fontWeight: 700, color:'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>Sem treinar há +{dias}d</p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 48, fontWeight: 900, color: '#f97316', letterSpacing:'-0.05em', lineHeight:1, textShadow:'0 0 32px rgba(249,115,22,0.55)' }}>{data.total}</p>
          </div>
          <div style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)', borderRadius: 18, padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <AlertTriangle style={{ width: 28, height: 28, color: '#f97316', flexShrink: 0 }} />
            <p style={{ fontSize: 13, color:'var(--text-secondary)', lineHeight: 1.5 }}>
              {data.total === 0
                ? 'Ótimo! Todos os alunos treinaram recentemente.'
                : `${data.total} aluno${data.total !== 1 ? 's precisam' : ' precisa'} de atenção. Envie uma mensagem de incentivo!`}
            </p>
          </div>
        </div>
      )}

      {/* Lista */}
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} style={{ background:'var(--bg-card)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, height: 80, animation: 'pulse 1.5s infinite' }} />
          ))}
        </div>
      ) : alunos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 24px', background:'var(--bg-card)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 18, fontWeight: 600, color:'var(--text-primary)', marginBottom: 8 }}>Todos em dia!</p>
          <p style={{ fontSize: 14, color:'var(--text-muted)' }}>Nenhum aluno inativo nos últimos {dias} dias.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {alunos.map(a => (
            <div key={a.id} style={{ background:'var(--bg-card)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
              {/* Avatar */}
              <div style={{ width: 42, height: 42, borderRadius: 14, background: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 600, color: '#f97316', flexShrink: 0 }}>
                {a.nome.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color:'var(--text-primary)', marginBottom: 3 }}>{a.nome}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Clock style={{ width: 12, height: 12, color: '#f97316' }} />
                    <span style={{ fontSize: 12, color:'var(--text-muted)' }}>
                      {a.ultimo_treino ? `Último: ${a.ultimo_treino} (${a.dias_inativo}d atrás)` : 'Nunca treinou'}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <button
                  onClick={() => openWhatsApp(a.nome, a.dias_inativo)}
                  title="Enviar mensagem via WhatsApp"
                  style={{ background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.25)', borderRadius: 11, color: '#25d366', cursor: 'pointer', fontWeight: 600, fontSize: 12, padding: '7px 11px', display: 'flex', alignItems: 'center', gap: 5 }}
                >
                  <MessageCircle style={{ width: 13, height: 13 }} /> WA
                </button>
                <button
                  onClick={() => nudge.mutate(a.id)}
                  disabled={nudge.isPending}
                  title="Enviar mensagem de incentivo pelo chat do app"
                  style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 11, color: '#FF8078', cursor: 'pointer', fontWeight: 600, fontSize: 12, padding: '7px 13px', display: 'flex', alignItems: 'center', gap: 5 }}
                >
                  <Send style={{ width: 12, height: 12 }} /> Nudge
                </button>
                <button
                  onClick={() => navigate(`/alunos/${a.id}`)}
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 11, color:'var(--text-muted)', cursor: 'pointer', padding: '7px 10px', display: 'flex', alignItems: 'center' }}
                >
                  <ChevronRight style={{ width: 14, height: 14 }} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

