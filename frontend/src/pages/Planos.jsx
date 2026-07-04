import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { billingStatus, billingCheckout, billingPortal } from '../api'
import toast from 'react-hot-toast'
import { Check, Zap, Star, Crown, Rocket, Shield, ArrowRight, ExternalLink, Clock } from 'lucide-react'

const PLANOS = [
  {
    tier: 'free',
    label: 'Free',
    preco: 0,
    preco_anual: 0,
    max_alunos: 3,
    icon: Shield,
    color: '#71717A',
    glow: 'rgba(100,116,139,0.2)',
    border: 'rgba(100,116,139,0.2)',
    destaque: false,
    features: [
      'Até 3 alunos',
      'Treinos ilimitados por aluno',
      'IA de progressão de carga',
      'Gamificação (streak, conquistas)',
      'App mobile (PWA)',
      'Suporte por e-mail',
    ],
  },
  {
    tier: 'starter',
    label: 'Starter',
    preco: 49,
    preco_anual: 470,
    max_alunos: 15,
    icon: Zap,
    color: '#38bdf8',
    glow: 'rgba(56,189,248,0.25)',
    border: 'rgba(56,189,248,0.3)',
    destaque: false,
    features: [
      'Até 15 alunos',
      'Treinos ilimitados por aluno',
      'IA de progressão de carga',
      'Gamificação (streak, conquistas)',
      'App mobile (PWA)',
      'Financeiro e cobranças',
      'Relatórios básicos',
      'Convites por link',
      'Suporte por e-mail',
    ],
  },
  {
    tier: 'pro',
    label: 'Pro',
    preco: 129,
    preco_anual: 1240,
    max_alunos: 50,
    icon: Star,
    color: '#a78bfa',
    glow: 'rgba(167,139,250,0.35)',
    border: 'rgba(167,139,250,0.45)',
    destaque: true,
    features: [
      'Até 50 alunos',
      'Treinos ilimitados por aluno',
      'IA de progressão de carga',
      'Gamificação (streak, conquistas)',
      'App mobile (PWA)',
      'Financeiro e cobranças',
      'IA personalizada por aluno',
      'Relatórios avançados',
      'Convites por link',
      'Suporte prioritário',
    ],
  },
  {
    tier: 'elite',
    label: 'Elite',
    preco: 249,
    preco_anual: 2390,
    max_alunos: null,
    icon: Crown,
    color: '#fbbf24',
    glow: 'rgba(251,191,36,0.3)',
    border: 'rgba(251,191,36,0.35)',
    destaque: false,
    features: [
      'Alunos ilimitados',
      'Treinos ilimitados por aluno',
      'IA de progressão de carga',
      'Gamificação (streak, conquistas)',
      'App mobile (PWA)',
      'Financeiro e cobranças',
      'IA personalizada por aluno',
      'Multi-personal (equipe)',
      'White-label (em breve)',
      'API de integração (em breve)',
      'Gerente de conta dedicado',
    ],
  },
]

const fmt = v => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v)

export default function Planos() {
  const [anual, setAnual] = useState(false)
  const [loadingTier, setLoadingTier] = useState(null)
  const navigate = useNavigate()
  const [params] = useSearchParams()

  const { data: status } = useQuery({
    queryKey: ['billing-status'],
    queryFn: () => billingStatus().then(r => r.data),
  })

  const mutCheckout = useMutation({
    mutationFn: billingCheckout,
    onSuccess: ({ data }) => {
      if (data.checkout_url) window.location.href = data.checkout_url
    },
    onError: e => {
      toast.error(e.response?.data?.detail || 'Erro ao processar pagamento')
      setLoadingTier(null)
    },
  })

  const mutPortal = useMutation({
    mutationFn: billingPortal,
    onSuccess: ({ data }) => {
      if (data.portal_url) window.location.href = data.portal_url
    },
    onError: () => toast.error('Erro ao abrir portal de assinatura'),
  })

  const handleUpgrade = (tier) => {
    if (tier === 'free') return
    setLoadingTier(tier)
    mutCheckout.mutate(tier)
  }

  const planoAtual = status?.tier || 'trial'
  const diasTrial = status?.trial_dias_restantes

  return (
    <div style={{ minHeight: '100vh', background: '#0C0C0D', position: 'relative', overflow: 'hidden' }}>
      {/* Aurora background */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-10%', left: '20%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: '5%', right: '-5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(167,139,250,0.07) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', top: '50%', right: '30%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(251,191,36,0.04) 0%, transparent 70%)' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1100, margin: '0 auto', padding: '48px 24px 80px' }}>

        {/* Back */}
        <button onClick={() => navigate('/dashboard')} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#71717A', background: 'none', border: 'none', cursor: 'pointer', marginBottom: 40 }}>
          ← Voltar ao dashboard
        </button>

        {/* Success message */}
        {params.get('billing') === 'success' && (
          <div style={{ marginBottom: 32, padding: '14px 20px', borderRadius: 16, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#34d399', display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, fontWeight: 600 }}>
            <Check style={{ width: 18, height: 18 }} />
            Assinatura ativada com sucesso! Bem-vindo ao {params.get('plano') || 'novo plano'}.
          </div>
        )}

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          {diasTrial != null && diasTrial > 0 && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 16, padding: '6px 14px', borderRadius: 999, background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.25)', color: '#fbbf24', fontSize: 12, fontWeight: 700 }}>
              <Clock style={{ width: 13, height: 13 }} />
              Trial grátis — {diasTrial} dia{diasTrial !== 1 ? 's' : ''} restantes
            </div>
          )}
          <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: 40, fontWeight: 600, color: '#F4F4F5', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 14 }}>
            Escolha o plano{' '}
            <span style={{ background: 'linear-gradient(135deg, #a5b4fc, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              ideal
            </span>{' '}
            para você
          </h1>
          <p style={{ fontSize: 16, color: '#71717A', maxWidth: 480, margin: '0 auto' }}>
            Comece grátis e escale conforme sua base de alunos cresce. Cancele a qualquer momento.
          </p>
        </div>

        {/* Monthly / Annual toggle */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginBottom: 44 }}>
          <span style={{ fontSize: 14, color: !anual ? '#F4F4F5' : '#71717A', fontWeight: !anual ? 700 : 400 }}>Mensal</span>
          <button
            onClick={() => setAnual(!anual)}
            style={{
              width: 52, height: 28, borderRadius: 14, position: 'relative', cursor: 'pointer', border: 'none',
              background: anual ? 'linear-gradient(135deg, #4f46e5, #7c3aed)' : 'rgba(255,255,255,0.1)',
              transition: 'background 0.3s', boxShadow: anual ? '0 0 16px rgba(99,102,241,0.4)' : 'none',
            }}
          >
            <div style={{
              position: 'absolute', top: 3, left: anual ? 26 : 3, width: 22, height: 22, borderRadius: '50%',
              background: 'white', transition: 'left 0.3s ease', boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
            }} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 14, color: anual ? '#F4F4F5' : '#71717A', fontWeight: anual ? 700 : 400 }}>Anual</span>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#34d399', background: 'rgba(16,185,129,0.15)', padding: '2px 8px', borderRadius: 999, border: '1px solid rgba(16,185,129,0.25)' }}>
              -20%
            </span>
          </div>
        </div>

        {/* Planos grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, alignItems: 'start' }}>
          {PLANOS.map(p => {
            const Icon = p.icon
            const ehAtual = planoAtual === p.tier
            const preco = anual ? Math.round(p.preco_anual / 12) : p.preco
            const economiaAnual = p.preco > 0 ? (p.preco * 12 - p.preco_anual) : 0

            return (
              <div
                key={p.tier}
                style={{
                  borderRadius: 24, overflow: 'hidden', position: 'relative',
                  background: p.destaque ? 'linear-gradient(160deg, #13183a 0%, #111113 100%)' : '#111113',
                  border: `1px solid ${p.destaque ? p.border : 'rgba(255,255,255,0.08)'}`,
                  boxShadow: p.destaque ? `0 0 48px ${p.glow}, 0 24px 48px rgba(0,0,0,0.4)` : '0 4px 24px rgba(0,0,0,0.3)',
                  transform: p.destaque ? 'scale(1.03)' : 'scale(1)',
                }}
              >
                {/* Top color bar */}
                <div style={{ height: 3, background: `linear-gradient(90deg, transparent, ${p.color}, transparent)` }} />

                {/* Recommended badge */}
                {p.destaque && (
                  <div style={{ position: 'absolute', top: 16, right: 16, display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 999, background: `${p.color}25`, border: `1px solid ${p.border}`, fontSize: 10, fontWeight: 800, color: p.color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <Star style={{ width: 10, height: 10 }} /> Recomendado
                  </div>
                )}

                {/* Current plan badge */}
                {ehAtual && (
                  <div style={{ position: 'absolute', top: 16, right: 16, padding: '4px 10px', borderRadius: 999, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', fontSize: 10, fontWeight: 800, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Plano atual
                  </div>
                )}

                <div style={{ padding: '28px 28px 32px' }}>
                  {/* Icon + name */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 14, background: `${p.color}18`, border: `1px solid ${p.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 18px ${p.glow}` }}>
                      <Icon style={{ width: 20, height: 20, color: p.color }} />
                    </div>
                    <div>
                      <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: 18, fontWeight: 800, color: '#F4F4F5', lineHeight: 1 }}>{p.label}</h3>
                      <p style={{ fontSize: 11, color: '#71717A', marginTop: 3 }}>
                        {p.max_alunos ? `até ${p.max_alunos} alunos` : 'alunos ilimitados'}
                      </p>
                    </div>
                  </div>

                  {/* Price */}
                  <div style={{ marginBottom: 24 }}>
                    {preco === 0 ? (
                      <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 38, fontWeight: 600, color: '#F4F4F5', letterSpacing: '-0.03em', lineHeight: 1 }}>
                        Grátis
                      </div>
                    ) : (
                      <>
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4 }}>
                          <span style={{ fontSize: 14, color: '#71717A', fontWeight: 600, marginBottom: 6 }}>R$</span>
                          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 42, fontWeight: 600, color: p.destaque ? p.color : '#F4F4F5', letterSpacing: '-0.03em', lineHeight: 1 }}>
                            {preco}
                          </span>
                          <span style={{ fontSize: 13, color: '#71717A', marginBottom: 6 }}>/mês</span>
                        </div>
                        {anual && economiaAnual > 0 && (
                          <p style={{ fontSize: 12, color: '#34d399', marginTop: 4, fontWeight: 600 }}>
                            Economia de {fmt(economiaAnual)}/ano
                          </p>
                        )}
                        {anual && (
                          <p style={{ fontSize: 11, color: '#71717A', marginTop: 2 }}>
                            Cobrado {fmt(p.preco_anual)}/ano
                          </p>
                        )}
                      </>
                    )}
                  </div>

                  {/* CTA Button */}
                  {ehAtual ? (
                    status?.tem_assinatura ? (
                      <button
                        onClick={() => mutPortal.mutate()}
                        disabled={mutPortal.isPending}
                        style={{ width: '100%', padding: '13px', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 14, fontWeight: 700, cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.06)', color: '#F4F4F5' }}
                      >
                        <ExternalLink style={{ width: 14, height: 14 }} />
                        Gerenciar assinatura
                      </button>
                    ) : (
                      <div style={{ width: '100%', padding: '13px', borderRadius: 14, textAlign: 'center', fontSize: 14, fontWeight: 700, border: '1px solid rgba(16,185,129,0.3)', background: 'rgba(16,185,129,0.08)', color: '#34d399' }}>
                        ✓ Plano atual
                      </div>
                    )
                  ) : p.tier === 'free' ? (
                    <div style={{ width: '100%', padding: '13px', borderRadius: 14, textAlign: 'center', fontSize: 13, color: '#71717A', border: '1px solid rgba(255,255,255,0.07)' }}>
                      Plano padrão (trial expirado)
                    </div>
                  ) : (
                    <button
                      onClick={() => handleUpgrade(p.tier)}
                      disabled={loadingTier === p.tier}
                      style={{
                        width: '100%', padding: '13px', borderRadius: 14,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        fontSize: 14, fontWeight: 800, cursor: 'pointer', border: 'none',
                        background: p.destaque
                          ? `linear-gradient(135deg, ${p.color}cc, ${p.color}88)`
                          : `${p.color}22`,
                        color: p.destaque ? '#111113' : p.color,
                        boxShadow: p.destaque ? `0 0 24px ${p.glow}` : 'none',
                        transition: 'all 0.2s',
                        opacity: loadingTier === p.tier ? 0.6 : 1,
                      }}
                    >
                      {loadingTier === p.tier ? (
                        <span className="flex items-center gap-2">
                          <span style={{ width: 14, height: 14, border: '2px solid rgba(0,0,0,0.3)', borderTopColor: 'currentColor', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                          Processando...
                        </span>
                      ) : (
                        <>
                          Assinar {p.label}
                          <ArrowRight style={{ width: 14, height: 14 }} />
                        </>
                      )}
                    </button>
                  )}

                  {/* Features */}
                  <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {p.features.map(f => (
                      <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 9 }}>
                        <div style={{ width: 18, height: 18, borderRadius: '50%', flexShrink: 0, marginTop: 1, background: `${p.color}20`, border: `1px solid ${p.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Check style={{ width: 10, height: 10, color: p.color }} />
                        </div>
                        <span style={{ fontSize: 13, color: '#A1A1AA', lineHeight: 1.4 }}>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer info */}
        <div style={{ marginTop: 52, textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 32, flexWrap: 'wrap', marginBottom: 24 }}>
            {[
              { icon: Shield, text: 'Pagamento seguro via Stripe' },
              { icon: Rocket, text: 'Cancele a qualquer momento' },
              { icon: Clock,  text: 'Trial de 14 dias grátis' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#71717A' }}>
                <Icon style={{ width: 15, height: 15, color: '#71717A' }} />
                {text}
              </div>
            ))}
          </div>
          <p style={{ fontSize: 12, color: '#52525B' }}>
            Dúvidas? Fale conosco:{' '}
            <a href="https://www.instagram.com/luuiz.dev" target="_blank" rel="noopener noreferrer" style={{ color: '#6366f1', fontWeight: 600, textDecoration: 'none' }}>@luuiz.dev</a>
          </p>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
