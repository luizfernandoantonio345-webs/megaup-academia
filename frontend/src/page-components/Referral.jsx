import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { referralStatus } from '../api'
import { Copy, Check, Users, Gift, Share2, ChevronRight, Zap } from 'lucide-react'
import toast from 'react-hot-toast'

const MILESTONES = [
  { qty: 1, reward: 'Badge exclusivo "Embaixador MegaUp"', icon: '🏅' },
  { qty: 3, reward: '1 mês grátis no plano Starter',        icon: '🎁' },
  { qty: 10, reward: 'Upgrade para Pro por 3 meses',         icon: '🚀' },
]

export default function Referral() {
  const [copied, setCopied] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['referral-status'],
    queryFn: async () => (await referralStatus()).data,
  })

  function copyLink() {
    if (!data?.referral_link) return
    navigator.clipboard.writeText(data.referral_link).then(() => {
      setCopied(true)
      toast.success('Link copiado!')
      setTimeout(() => setCopied(false), 2500)
    })
  }

  function shareLink() {
    if (!data?.referral_link) return
    if (navigator.share) {
      navigator.share({ title: 'MegaUp', text: 'Use meu link para criar sua conta no MegaUp!', url: data.referral_link })
    } else {
      copyLink()
    }
  }

  const indicados = data?.total_indicados ?? 0
  const nextMilestone = MILESTONES.find(m => m.qty > indicados) || MILESTONES[MILESTONES.length - 1]
  const prevMilestone = MILESTONES.filter(m => m.qty <= indicados).pop()

  return (
    <div style={{ padding: 24, maxWidth: 700, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Gift style={{ width: 22, height: 22, color: '#fbbf24' }} />
          </div>
          <div>
            <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: 22, fontWeight: 600, color:'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 2 }}>Indique e Ganhe</h1>
            <p style={{ fontSize: 13, color:'var(--text-muted)' }}>Convide outros personals e ganhe recompensas exclusivas</p>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 14, marginBottom: 28 }}>
        <div style={{ background:'var(--bg-card)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 18, padding: '20px 22px' }}>
          <p style={{ fontSize: 11, color:'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>Seu código</p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 28, fontWeight: 600, color: '#fbbf24', letterSpacing: '0.06em' }}>
            {isLoading ? '——' : data?.referral_code}
          </p>
        </div>
        <div style={{ background:'var(--bg-card)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 18, padding: '20px 22px' }}>
          <p style={{ fontSize: 11, color:'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>Indicações</p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 28, fontWeight: 600, color: '#34d399' }}>{indicados}</p>
        </div>
        <div style={{ background:'var(--bg-card)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 18, padding: '20px 22px' }}>
          <p style={{ fontSize: 11, color:'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>Próxima meta</p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 28, fontWeight: 600, color: '#FF8078' }}>{nextMilestone.qty}</p>
        </div>
      </div>

      {/* Link box */}
      <div style={{ background:'var(--bg-card)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 20, padding: '22px 24px', marginBottom: 28 }}>
        <p style={{ fontSize: 12, fontWeight: 600, color:'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14 }}>Seu link de indicação</p>
        <div style={{ display: 'flex', gap: 10, alignItems: 'stretch', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, background:'var(--bg-page)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '12px 16px', minWidth: 200, overflowX: 'auto' }}>
            <span style={{ fontSize: 13, color:'var(--text-muted)', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
              {isLoading ? 'Carregando…' : data?.referral_link}
            </span>
          </div>
          <button
            onClick={copyLink}
            style={{ background: copied ? 'rgba(52,211,153,0.15)' : 'rgba(99,102,241,0.15)', border: `1px solid ${copied ? 'rgba(52,211,153,0.3)' : 'rgba(99,102,241,0.3)'}`, borderRadius: 12, color: copied ? '#34d399' : '#FF8078', cursor: 'pointer', fontWeight: 600, fontSize: 13, padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 7, transition: 'all 0.15s', whiteSpace: 'nowrap' }}
          >
            {copied ? <><Check style={{ width: 15, height: 15 }} /> Copiado!</> : <><Copy style={{ width: 15, height: 15 }} /> Copiar</>}
          </button>
          <button
            onClick={shareLink}
            style={{ background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.25)', borderRadius: 12, color: '#fbbf24', cursor: 'pointer', fontWeight: 600, fontSize: 13, padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 7, whiteSpace: 'nowrap' }}
          >
            <Share2 style={{ width: 15, height: 15 }} /> Compartilhar
          </button>
        </div>
      </div>

      {/* Progress to next milestone */}
      {indicados < nextMilestone.qty && (
        <div style={{ background:'var(--bg-card)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 18, padding: '20px 24px', marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color:'var(--text-secondary)' }}>Progresso para próxima recompensa</p>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#FF8078' }}>{indicados} / {nextMilestone.qty}</p>
          </div>
          <div style={{ height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${Math.min(100, (indicados / nextMilestone.qty) * 100)}%`, background: 'linear-gradient(90deg, #E8342B, #a78bfa)', borderRadius: 4, transition: 'width 0.6s ease' }} />
          </div>
          <p style={{ fontSize: 12, color:'var(--text-muted)', marginTop: 10 }}>
            Faltam <strong style={{ color: '#FF8078' }}>{nextMilestone.qty - indicados} indicação{nextMilestone.qty - indicados !== 1 ? 'ões' : ''}</strong> para {nextMilestone.icon} {nextMilestone.reward}
          </p>
        </div>
      )}

      {/* Milestones */}
      <div style={{ background:'var(--bg-card)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, overflow: 'hidden' }}>
        <div style={{ padding: '18px 24px 14px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <p style={{ fontSize: 14, fontWeight: 600, color:'var(--text-primary)' }}>Recompensas disponíveis</p>
        </div>
        {MILESTONES.map((m, i) => {
          const unlocked = indicados >= m.qty
          return (
            <div key={m.qty} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 24px', borderBottom: i < MILESTONES.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', opacity: unlocked ? 1 : 0.55 }}>
              <div style={{ width: 42, height: 42, borderRadius: 13, background: unlocked ? 'rgba(52,211,153,0.12)' : 'rgba(255,255,255,0.04)', border: `1px solid ${unlocked ? 'rgba(52,211,153,0.25)' : 'rgba(255,255,255,0.06)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                {m.icon}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color:'var(--text-primary)' }}>{m.reward}</p>
                <p style={{ fontSize: 12, color:'var(--text-muted)', marginTop: 2 }}>{m.qty} indicação{m.qty !== 1 ? 'ões' : ''} confirmada{m.qty !== 1 ? 's' : ''}</p>
              </div>
              {unlocked ? (
                <Check style={{ width: 18, height: 18, color: '#34d399', flexShrink: 0 }} />
              ) : (
                <div style={{ fontSize: 11, fontWeight: 600, color:'var(--text-muted)', background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '4px 10px', flexShrink: 0 }}>
                  {m.qty - indicados} restante{m.qty - indicados !== 1 ? 's' : ''}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* How it works */}
      <div style={{ marginTop: 24, background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 18, padding: '18px 22px' }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#FF8078', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Zap style={{ width: 14, height: 14 }} /> Como funciona
        </p>
        {['Compartilhe seu link exclusivo com outros personal trainers.', 'Quando alguém criar uma conta usando seu link, contamos como uma indicação.', 'Ao atingir as metas, entre em contato para resgatar sua recompensa.'].map((t, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, marginBottom: i < 2 ? 8 : 0 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#E8342B', minWidth: 18, paddingTop: 1 }}>0{i + 1}</span>
            <p style={{ fontSize: 13, color:'var(--text-muted)', lineHeight: 1.5 }}>{t}</p>
          </div>
        ))}
      </div>
    </div>
  )
}


