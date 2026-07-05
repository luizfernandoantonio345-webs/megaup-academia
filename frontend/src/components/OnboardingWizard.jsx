import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, UserPlus, Dumbbell, Link as LinkIcon, Brain, CheckCircle, ChevronRight, Sparkles } from 'lucide-react'

const STEPS = [
  {
    id: 'welcome',
    icon: Sparkles,
    color: '#a78bfa',
    bg: 'rgba(167,139,250,0.15)',
    title: 'Bem-vindo ao GymPro!',
    desc: 'Sua conta está pronta. Vamos configurar tudo para você começar a atender seus alunos.',
    cta: 'Começar',
    route: null,
  },
  {
    id: 'aluno',
    icon: UserPlus,
    color: '#34d399',
    bg: 'rgba(52,211,153,0.15)',
    title: 'Adicione seu primeiro aluno',
    desc: 'Cadastre um aluno manualmente ou envie um convite por email para ele se registrar sozinho.',
    cta: 'Adicionar aluno',
    route: '/alunos',
  },
  {
    id: 'treino',
    icon: Dumbbell,
    color: '#38bdf8',
    bg: 'rgba(56,189,248,0.15)',
    title: 'Crie o primeiro treino',
    desc: 'Monte um plano de treino com exercícios da biblioteca de mais de 100 movimentos.',
    cta: 'Criar treino',
    route: '/alunos',
  },
  {
    id: 'convite',
    icon: LinkIcon,
    color: '#f9a8d4',
    bg: 'rgba(249,168,212,0.15)',
    title: 'Convide alunos pelo link',
    desc: 'Gere um link de convite personalizado para seus alunos instalarem o app e fazerem login.',
    cta: 'Gerar link',
    route: '/convites',
  },
  {
    id: 'ia',
    icon: Brain,
    color: '#fbbf24',
    bg: 'rgba(251,191,36,0.15)',
    title: 'Explore a IA de Progressão',
    desc: 'A IA analisa o histórico de carga e sugere automaticamente o aumento ideal para cada aluno.',
    cta: 'Ver sugestões',
    route: '/ia',
  },
]

const STORAGE_KEY = 'onboarding_step'
const DONE_KEY = 'onboarding_done'

export default function OnboardingWizard() {
  const [step, setStep] = useState(0)
  const [visible, setVisible] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const done = localStorage.getItem(DONE_KEY)
    if (done) return
    const saved = parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10)
    setStep(saved)
    setVisible(true)
  }, [])

  if (!visible) return null

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1
  const progress = ((step) / (STEPS.length - 1)) * 100

  function handleCta() {
    if (current.route) {
      close()
      navigate(current.route)
    } else {
      advance()
    }
  }

  function advance() {
    if (isLast) {
      close()
      return
    }
    const next = step + 1
    setStep(next)
    localStorage.setItem(STORAGE_KEY, String(next))
  }

  function close() {
    setVisible(false)
    localStorage.setItem(DONE_KEY, '1')
  }

  const Icon = current.icon

  return (
    <>
      {/* Backdrop */}
      <div
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 200 }}
        onClick={close}
      />

      {/* Modal */}
      <div style={{
        position: 'fixed', bottom: 32, right: 32, zIndex: 201,
        width: 360, background: '#111113',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 24, overflow: 'hidden',
        boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
        animation: 'slide-up 0.3s ease-out',
      }}>
        <style>{`@keyframes slide-up { from { opacity:0; transform:translateY(24px) } to { opacity:1; transform:translateY(0) } }`}</style>

        {/* Progress bar */}
        <div style={{ height: 3, background: 'rgba(255,255,255,0.05)' }}>
          <div style={{ height: '100%', width: `${progress}%`, background: `linear-gradient(90deg, #6366f1, #a78bfa)`, transition: 'width 0.4s ease' }} />
        </div>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px 0' }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {STEPS.map((s, i) => (
              <div key={s.id} style={{
                width: i === step ? 20 : 6, height: 6, borderRadius: 3,
                background: i < step ? '#6366f1' : i === step ? '#818cf8' : 'rgba(255,255,255,0.1)',
                transition: 'all 0.3s',
              }} />
            ))}
          </div>
          <button onClick={close} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#71717A', padding: 4 }}>
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '20px 24px 24px' }}>
          <div style={{
            width: 56, height: 56, borderRadius: 18, background: current.bg,
            border: `1px solid ${current.color}30`, display: 'flex',
            alignItems: 'center', justifyContent: 'center', marginBottom: 18,
            boxShadow: `0 0 24px ${current.color}20`,
          }}>
            <Icon style={{ width: 26, height: 26, color: current.color }} />
          </div>

          <p style={{ fontSize: 11, fontWeight: 700, color: '#71717A', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
            Passo {step + 1} de {STEPS.length}
          </p>
          <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: 20, fontWeight: 600, color: '#F4F4F5', lineHeight: 1.2, marginBottom: 10 }}>
            {current.title}
          </h3>
          <p style={{ fontSize: 14, color: '#71717A', lineHeight: 1.6, marginBottom: 22 }}>
            {current.desc}
          </p>

          {/* Completed steps */}
          {step > 0 && (
            <div style={{ marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {STEPS.slice(0, step).map(s => (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CheckCircle style={{ width: 14, height: 14, color: '#34d399', flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: '#71717A' }}>{s.title}</span>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={handleCta}
              style={{
                flex: 1, background: `linear-gradient(135deg, ${current.color}cc, ${current.color})`,
                border: 'none', borderRadius: 14, color: step === 0 ? '#0C0C0D' : 'white',
                cursor: 'pointer', fontWeight: 600, fontSize: 14, padding: '13px 16px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                boxShadow: `0 4px 20px ${current.color}40`,
                transition: 'all 0.15s',
              }}
            >
              {current.cta} <ChevronRight style={{ width: 15, height: 15 }} />
            </button>
            {step > 0 && !isLast && (
              <button
                onClick={advance}
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, color: '#71717A', cursor: 'pointer', fontWeight: 700, fontSize: 13, padding: '13px 14px' }}
              >
                Pular
              </button>
            )}
            {isLast && (
              <button
                onClick={close}
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, color: '#71717A', cursor: 'pointer', fontWeight: 700, fontSize: 13, padding: '13px 14px' }}
              >
                Concluir
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
