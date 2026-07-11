import { useQuery } from '@tanstack/react-query'
import { billingStatus } from '../api'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Lock, Zap, ArrowRight } from 'lucide-react'
import { GymDecorBg } from './GymDecorBg'

export default function PlanGate({ children }) {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const { data, isLoading } = useQuery({
    queryKey: ['billing-status'],
    queryFn: () => billingStatus().then(r => r.data),
    staleTime: 5 * 60_000,
    retry: 1,
  })

  // While loading or on error: don't block — show the app
  if (isLoading || !data) return children

  const { tier, trial_ativo } = data
  const expired = trial_ativo === false && tier === 'trial'

  if (!expired) return children

  // Full-page trial expired screen
  return (
    <div style={{
      minHeight: '100vh', background:'var(--bg-page)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: 24,
      position: 'relative', overflow: 'hidden',
    }}>
      <GymDecorBg />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 400, textAlign: 'center' }} className="animate-fade-in">
        <div style={{
          width: 64, height: 64, borderRadius: 18,
          background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
        }}>
          <Lock style={{ width: 28, height: 28, color: '#f87171' }} />
        </div>

        <h1 style={{ fontSize: 22, fontWeight: 600, color:'var(--text-primary)', marginBottom: 8 }}>
          Trial encerrado
        </h1>
        <p style={{ color:'var(--text-muted)', fontSize: 13, lineHeight: 1.7, marginBottom: 28 }}>
          Seu período de teste gratuito chegou ao fim.<br />
          Escolha um plano para continuar gerenciando seus alunos sem interrupções.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button
            onClick={() => navigate('/planos')}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              background: '#ef4444', color: 'white', border: 'none', borderRadius: 12,
              padding: '14px 24px', fontWeight: 600, fontSize: 14, cursor: 'pointer',
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.85' }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
          >
            <Zap style={{ width: 15, height: 15 }} />
            Ver planos e preços
            <ArrowRight style={{ width: 14, height: 14 }} />
          </button>

          <button
            onClick={() => { logout(); navigate('/login') }}
            style={{
              background: 'none', border: '1px solid var(--border)', borderRadius: 12,
              padding: '11px 24px', color:'var(--text-muted)', fontSize: 13,
              fontWeight: 500, cursor: 'pointer', transition: 'border-color 0.15s, color 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color='var(--text-secondary)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color='var(--text-muted)' }}
          >
            Sair da conta
          </button>
        </div>

        <p style={{ fontSize: 11, color:'var(--text-disabled)', marginTop: 24 }}>
          Dúvidas?{' '}
          <a href="https://www.instagram.com/luuiz.dev" target="_blank" rel="noopener noreferrer"
            style={{ color:'var(--text-disabled)', textDecoration: 'none' }}>@luuiz.dev</a>
        </p>
      </div>
    </div>
  )
}

