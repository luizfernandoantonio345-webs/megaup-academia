'use client'

import { useState, useEffect } from 'react'
import { Users, Dumbbell, QrCode, CheckCircle, X, ChevronRight, Zap } from 'lucide-react'
import Link from 'next/link'

const STORAGE_KEY = 'megaup_onboarding_done_v1'

type Step = {
  icon: React.ElementType
  color: string
  title: string
  desc: string
  action?: { label: string; href: string }
}

const STEPS: Step[] = [
  {
    icon: Zap,
    color: '#E8342B',
    title: 'Bem-vindo à MegaUp!',
    desc: 'Vamos configurar sua academia em 3 passos. Leva menos de 2 minutos.',
  },
  {
    icon: Users,
    color: '#6366f1',
    title: 'Cadastre seu primeiro aluno',
    desc: 'Adicione um aluno com nome, e-mail e plano. Ele receberá um convite por email para acessar o app.',
    action: { label: 'Cadastrar aluno', href: '/alunos/novo' },
  },
  {
    icon: Dumbbell,
    color: '#22c55e',
    title: 'Crie um treino',
    desc: 'Monte o treino do aluno com exercícios, séries, repetições e cargas. A IA pode sugerir progressões automaticamente.',
    action: { label: 'Criar treino', href: '/treinos' },
  },
  {
    icon: QrCode,
    color: '#f59e0b',
    title: 'Configure o QR de check-in',
    desc: 'Imprima ou exiba o QR code na entrada da academia. O aluno escaneia pelo app e a presença é registrada.',
    action: { label: 'Ver QR code', href: '/qr' },
  },
]

export function OnboardingWizard() {
  const [visible, setVisible] = useState(false)
  const [step, setStep] = useState(0)

  useEffect(() => {
    try {
      const done = localStorage.getItem(STORAGE_KEY)
      if (!done) setVisible(true)
    } catch {}
  }, [])

  const dismiss = () => {
    try { localStorage.setItem(STORAGE_KEY, '1') } catch {}
    setVisible(false)
  }

  if (!visible) return null

  const cur = STEPS[step]
  const Icon = cur.icon
  const isLast = step === STEPS.length - 1
  const pct = Math.round(((step + 1) / STEPS.length) * 100)

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9000,
      background: 'rgba(0,0,0,0.72)',
      backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{
        width: '100%', maxWidth: 420,
        background: '#141416',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 24,
        boxShadow: '0 40px 120px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.05)',
        overflow: 'hidden',
        position: 'relative',
      }}>
        {/* Progress bar */}
        <div style={{ height: 3, background: 'rgba(255,255,255,0.06)' }}>
          <div style={{
            height: '100%', width: `${pct}%`,
            background: `linear-gradient(90deg, ${cur.color}, ${cur.color}aa)`,
            transition: 'width 0.4s ease',
            boxShadow: `0 0 10px ${cur.color}80`,
          }} />
        </div>

        {/* Close */}
        <button
          onClick={dismiss}
          style={{
            position: 'absolute', top: 16, right: 16,
            width: 32, height: 32, borderRadius: '50%',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'rgba(255,255,255,0.4)',
          }}
        >
          <X style={{ width: 14, height: 14 }} />
        </button>

        <div style={{ padding: '32px 32px 28px' }}>
          {/* Icon */}
          <div style={{
            width: 64, height: 64, borderRadius: 20,
            background: `${cur.color}15`,
            border: `1px solid ${cur.color}30`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 0 40px ${cur.color}20`,
            marginBottom: 24,
          }}>
            <Icon style={{ width: 28, height: 28, color: cur.color }} />
          </div>

          {/* Step indicator */}
          <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
            Passo {step + 1} de {STEPS.length}
          </div>

          <h2 style={{
            fontFamily: 'Inter, sans-serif', fontSize: 22, fontWeight: 900,
            color: '#F4F4F5', letterSpacing: '-0.04em', lineHeight: 1.2, marginBottom: 12,
          }}>
            {cur.title}
          </h2>

          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, marginBottom: 28 }}>
            {cur.desc}
          </p>

          {/* Dots */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
            {STEPS.map((_, i) => (
              <div key={i} style={{
                height: 4, borderRadius: 4,
                flex: i === step ? 2 : 1,
                background: i <= step ? cur.color : 'rgba(255,255,255,0.1)',
                transition: 'all 0.3s',
              }} />
            ))}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10 }}>
            {step > 0 && (
              <button
                onClick={() => setStep(s => s - 1)}
                style={{
                  flex: 1, padding: '13px 20px', borderRadius: 14, fontFamily: 'Inter, sans-serif',
                  fontSize: 14, fontWeight: 700, cursor: 'pointer',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.5)',
                }}
              >
                Voltar
              </button>
            )}

            {cur.action ? (
              <Link href={cur.action.href} style={{ flex: 2, textDecoration: 'none' }} onClick={dismiss}>
                <button style={{
                  width: '100%', padding: '13px 20px', borderRadius: 14, fontFamily: 'Inter, sans-serif',
                  fontSize: 14, fontWeight: 800, cursor: 'pointer',
                  background: `linear-gradient(135deg, ${cur.color}, ${cur.color}cc)`,
                  border: 'none', color: 'white',
                  boxShadow: `0 4px 20px ${cur.color}45, inset 0 1px 0 rgba(255,255,255,0.15)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}>
                  {cur.action.label}
                  <ChevronRight style={{ width: 16, height: 16 }} />
                </button>
              </Link>
            ) : null}

            {isLast ? (
              <button
                onClick={dismiss}
                style={{
                  flex: 2, padding: '13px 20px', borderRadius: 14, fontFamily: 'Inter, sans-serif',
                  fontSize: 14, fontWeight: 800, cursor: 'pointer',
                  background: `linear-gradient(135deg, ${cur.color}, ${cur.color}cc)`,
                  border: 'none', color: 'white',
                  boxShadow: `0 4px 20px ${cur.color}45, inset 0 1px 0 rgba(255,255,255,0.15)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
              >
                <CheckCircle style={{ width: 16, height: 16 }} />
                Entendido!
              </button>
            ) : (
              <button
                onClick={() => setStep(s => s + 1)}
                style={{
                  flex: cur.action ? 1 : 2, padding: '13px 20px', borderRadius: 14, fontFamily: 'Inter, sans-serif',
                  fontSize: 14, fontWeight: 700, cursor: 'pointer',
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}
              >
                Próximo <ChevronRight style={{ width: 14, height: 14 }} />
              </button>
            )}
          </div>

          <button
            onClick={dismiss}
            style={{ width: '100%', marginTop: 14, background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: 'rgba(255,255,255,0.22)', fontFamily: 'Inter, sans-serif' }}
          >
            Pular configuração inicial
          </button>
        </div>
      </div>
    </div>
  )
}
