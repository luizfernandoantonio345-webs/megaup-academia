import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { atualizarMeuPerfil } from '../api'
import { useAuth } from '../contexts/AuthContext'

const OBJETIVOS = [
  { key: 'hipertrofia',     label: 'Ganhar músculo',  icon: '💪', color: '#E8342B' },
  { key: 'emagrecimento',   label: 'Emagrecer',        icon: '🔥', color: '#f97316' },
  { key: 'forca',           label: 'Ganhar força',     icon: '⚡', color: '#eab308' },
  { key: 'condicionamento', label: 'Condicionamento', icon: '🏃', color: '#10b981' },
  { key: 'saude',           label: 'Saúde geral',      icon: '❤️', color: '#3b82f6' },
]

const FEATURES = [
  { icon: '📋', title: 'Treino do dia',    desc: 'Seus exercícios te esperam todo dia, com sugestão de carga baseada no seu histórico' },
  { icon: '🔥', title: 'Sequência diária', desc: 'Não quebre sua sequência! Treine consistentemente e bata seus recordes' },
  { icon: '🏆', title: 'Conquistas',       desc: 'Desbloqueie badges ao atingir metas e evoluir suas cargas' },
]

export default function OnboardingAluno({ onDone }) {
  const { user } = useAuth()
  const [step, setStep] = useState(0)
  const [objetivo, setObjetivo] = useState('')

  const { mutate: salvarObjetivo, isPending } = useMutation({
    mutationFn: () => atualizarMeuPerfil({ objetivo }),
    onSettled: () => setStep(2),
  })

  const handleStep1Continue = () => {
    if (objetivo) salvarObjetivo()
    else setStep(2)
  }

  const firstName = user?.nome?.split(' ')[0] || 'Aluno'

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(0,0,0,0.88)',
      backdropFilter: 'blur(14px)',
      WebkitBackdropFilter: 'blur(14px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px 16px',
    }}>
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 24,
        width: '100%', maxWidth: 400,
        overflow: 'hidden',
        animation: 'fadeInUp 0.35s ease',
      }}>
        {/* Progress dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, padding: '20px 0 0' }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: i === step ? 24 : 6, height: 6, borderRadius: 3,
              background: i <= step ? '#E8342B' : 'var(--border)',
              transition: 'all 0.3s ease',
            }} />
          ))}
        </div>

        <div style={{ padding: '24px 28px 28px' }}>

          {/* Step 0 — Boas-vindas */}
          {step === 0 && (
            <>
              <div style={{ textAlign: 'center', marginBottom: 28 }}>
                <div style={{ fontSize: 52, marginBottom: 14, lineHeight: 1 }}>💪</div>
                <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 10px', fontFamily: 'Inter, sans-serif' }}>
                  Olá, {firstName}!
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.65, margin: 0, fontFamily: 'Inter, sans-serif' }}>
                  Bem-vindo ao{' '}
                  <strong style={{ color: '#E8342B', fontWeight: 700 }}>MegaUp</strong>
                  ! Seu personal já preparou seus treinos. Vamos conhecer o app?
                </p>
              </div>
              <button
                onClick={() => setStep(1)}
                style={{ width: '100%', padding: '14px 0', borderRadius: 12, background: '#E8342B', color: 'white', border: 'none', fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
                Começar →
              </button>
            </>
          )}

          {/* Step 1 — Objetivo */}
          {step === 1 && (
            <>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 6px', fontFamily: 'Inter, sans-serif' }}>
                Qual é seu foco?
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: '0 0 18px', fontFamily: 'Inter, sans-serif' }}>
                Escolha seu principal objetivo
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                {OBJETIVOS.map(o => {
                  const sel = objetivo === o.key
                  return (
                    <button
                      key={o.key}
                      onClick={() => setObjetivo(sel ? '' : o.key)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '12px 14px', borderRadius: 12,
                        border: `1.5px solid ${sel ? o.color : 'var(--border)'}`,
                        background: sel ? `${o.color}1a` : 'transparent',
                        cursor: 'pointer', textAlign: 'left',
                        transition: 'all 0.15s ease',
                        width: '100%',
                      }}>
                      <span style={{ fontSize: 20, flexShrink: 0 }}>{o.icon}</span>
                      <span style={{
                        flex: 1, fontSize: 14, fontWeight: sel ? 600 : 400,
                        color: sel ? o.color : 'var(--text-secondary)',
                        fontFamily: 'Inter, sans-serif',
                      }}>{o.label}</span>
                      {sel && (
                        <span style={{ color: o.color, fontSize: 16, fontWeight: 700 }}>✓</span>
                      )}
                    </button>
                  )
                })}
              </div>
              <button
                onClick={handleStep1Continue}
                disabled={isPending}
                style={{
                  width: '100%', padding: '14px 0', borderRadius: 12,
                  background: '#E8342B', color: 'white', border: 'none',
                  fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600,
                  cursor: 'pointer', opacity: isPending ? 0.7 : 1,
                  transition: 'opacity 0.15s',
                }}>
                {isPending ? 'Salvando...' : objetivo ? 'Continuar →' : 'Pular →'}
              </button>
            </>
          )}

          {/* Step 2 — Tour */}
          {step === 2 && (
            <>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 6px', fontFamily: 'Inter, sans-serif' }}>
                Como funciona
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: '0 0 18px', fontFamily: 'Inter, sans-serif' }}>
                Tudo que você precisa, em um só lugar
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                {FEATURES.map((f, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'flex-start', gap: 14,
                    padding: '14px 16px', borderRadius: 12,
                    border: '1px solid var(--border)',
                    background: 'var(--bg-elevated)',
                  }}>
                    <span style={{ fontSize: 22, flexShrink: 0, marginTop: 1 }}>{f.icon}</span>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4, fontFamily: 'Inter, sans-serif' }}>{f.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.55, fontFamily: 'Inter, sans-serif' }}>{f.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={onDone}
                style={{
                  width: '100%', padding: '14px 0', borderRadius: 12,
                  background: '#E8342B', color: 'white', border: 'none',
                  fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600,
                  cursor: 'pointer',
                }}>
                Começar a treinar! 🚀
              </button>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
