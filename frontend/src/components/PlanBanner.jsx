import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { billingStatus } from '../api'
import { Clock, Zap, ArrowRight, X } from 'lucide-react'
import { useState } from 'react'

export default function PlanBanner() {
  const navigate = useNavigate()
  const [dismissed, setDismissed] = useState(false)

  const { data } = useQuery({
    queryKey: ['billing-status'],
    queryFn: () => billingStatus().then(r => r.data),
    staleTime: 5 * 60 * 1000,
  })

  if (!data || dismissed) return null

  const { tier, trial_ativo, trial_dias_restantes, limite_alunos, alunos_atuais } = data

  // Don't show for paid plans unless close to limit
  const paidPlan = tier && !['trial', 'free'].includes(tier)
  const pctAlunos = limite_alunos ? alunos_atuais / limite_alunos : 0
  const nearLimit = pctAlunos >= 0.8 && limite_alunos !== null

  if (paidPlan && !nearLimit) return null

  // Banner config based on state
  let config
  if (trial_ativo && trial_dias_restantes != null) {
    const urgent = trial_dias_restantes <= 3
    config = {
      bg: urgent ? 'rgba(251,191,36,0.1)' : 'rgba(99,102,241,0.1)',
      border: urgent ? 'rgba(251,191,36,0.3)' : 'rgba(99,102,241,0.25)',
      icon: Clock,
      iconColor: urgent ? '#fbbf24' : '#a78bfa',
      text: urgent
        ? `Seu trial expira em ${trial_dias_restantes} dia${trial_dias_restantes !== 1 ? 's' : ''}!`
        : `${trial_dias_restantes} dias restantes no trial grátis`,
      sub: urgent ? 'Escolha um plano agora para não perder acesso.' : 'Aproveite todos os recursos antes que acabe.',
      cta: 'Ver planos',
      ctaBg: urgent ? 'rgba(251,191,36,0.2)' : 'rgba(99,102,241,0.2)',
      ctaColor: urgent ? '#fbbf24' : '#a78bfa',
      ctaBorder: urgent ? 'rgba(251,191,36,0.35)' : 'rgba(99,102,241,0.3)',
    }
  } else if (tier === 'free' || (trial_ativo === false && !paidPlan)) {
    config = {
      bg: 'rgba(99,102,241,0.08)',
      border: 'rgba(99,102,241,0.2)',
      icon: Zap,
      iconColor: '#FF8078',
      text: 'Você está no plano Free — limite de 3 alunos',
      sub: 'Faça upgrade para escalar sua academia.',
      cta: 'Fazer upgrade',
      ctaBg: 'rgba(99,102,241,0.18)',
      ctaColor: '#FF8078',
      ctaBorder: 'rgba(99,102,241,0.28)',
    }
  } else if (nearLimit) {
    config = {
      bg: 'rgba(251,191,36,0.08)',
      border: 'rgba(251,191,36,0.25)',
      icon: Zap,
      iconColor: '#fbbf24',
      text: `${alunos_atuais} de ${limite_alunos} alunos usados`,
      sub: 'Você está próximo do limite do plano. Faça upgrade para crescer.',
      cta: 'Ampliar plano',
      ctaBg: 'rgba(251,191,36,0.15)',
      ctaColor: '#fbbf24',
      ctaBorder: 'rgba(251,191,36,0.3)',
    }
  } else {
    return null
  }

  const Icon = config.icon

  return (
    <div style={{
      marginBottom: 16,
      padding: '10px 14px',
      borderRadius: 14,
      background: config.bg,
      border: `1px solid ${config.border}`,
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      position: 'relative',
    }}>
      <div style={{ width: 30, height: 30, borderRadius: 10, background: `${config.iconColor}18`, border: `1px solid ${config.iconColor}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon style={{ width: 14, height: 14, color: config.iconColor }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color:'var(--text-primary)', margin: 0, lineHeight: 1.2 }}>{config.text}</p>
        <p style={{ fontSize: 11, color:'var(--text-muted)', margin: '2px 0 0', lineHeight: 1.3 }}>{config.sub}</p>
      </div>
      <button
        onClick={() => navigate('/planos')}
        style={{
          display: 'flex', alignItems: 'center', gap: 5,
          padding: '7px 12px', borderRadius: 10, flexShrink: 0,
          background: config.ctaBg, border: `1px solid ${config.ctaBorder}`,
          color: config.ctaColor, fontSize: 12, fontWeight: 600, cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        {config.cta}
        <ArrowRight style={{ width: 11, height: 11 }} />
      </button>
      <button
        onClick={() => setDismissed(true)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color:'var(--text-disabled)', padding: 4, display: 'flex', alignItems: 'center', flexShrink: 0 }}
      >
        <X style={{ width: 13, height: 13 }} />
      </button>
    </div>
  )
}

