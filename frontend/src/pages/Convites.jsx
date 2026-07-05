import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { gerarConvite } from '../api'
import toast from 'react-hot-toast'
import { UserPlus, Copy, Check, Mail, Link2, Zap, Users, Shield, ArrowRight, Share2, ExternalLink, MessageCircle } from 'lucide-react'

const STEPS = [
  { n: 1, emoji: '✉️', text: 'Digite o e-mail do aluno e clique em Convidar.' },
  { n: 2, emoji: '🔗', text: 'Um link unico e seguro e gerado instantaneamente.' },
  { n: 3, emoji: '📱', text: 'Copie e envie para o aluno via WhatsApp, SMS ou e-mail.' },
  { n: 4, emoji: '💪', text: 'O aluno clica, cria uma senha e ja aparece na sua lista.' },
]

export default function Convites() {
  const [email, setEmail] = useState('')
  const [resultado, setResultado] = useState(null)
  const [copied, setCopied] = useState(false)

  const { mutate, isPending } = useMutation({
    mutationFn: () => gerarConvite({ email_aluno: email }),
    onSuccess: ({ data }) => {
      setResultado(data)
      setEmail('')
      toast.success('Convite gerado! Copie o link abaixo. 🔗')
    },
    onError: err => toast.error(err.response?.data?.detail || 'Erro ao gerar convite'),
  })

  // Always build the link from the current frontend origin + token
  // (prevents the backend's FRONTEND_BASE_URL from being wrong in production)
  const linkConvite = resultado
    ? `${window.location.origin}/registro?convite=${resultado.token}`
    : null

  const copiarLink = async () => {
    await navigator.clipboard.writeText(linkConvite)
    setCopied(true)
    toast.success('Link copiado! Cole no WhatsApp ou e-mail do aluno.')
    setTimeout(() => setCopied(false), 2000)
  }

  const compartilharWhatsApp = () => {
    const msg = `Ola! Voce foi convidado para acompanhar seus treinos no GymPro. Clique no link para criar sua conta: ${linkConvite}`
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank')
  }

  return (
    <div className="space-y-6 max-w-xl animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Convidar alunos</h1>
          <p className="page-subtitle">Gere um link e envie para o aluno via WhatsApp ou e-mail.</p>
        </div>
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
          style={{ background: '#6366f1' }}>
          <UserPlus style={{ width: 20, height: 20, color: 'white' }} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: Users,  value: 'Ilimitado', label: 'Alunos',   color: '#a5b4fc', bg: 'rgba(99,102,241,0.1)'  },
          { icon: Zap,    value: '7 dias',     label: 'Validade', color: '#fbbf24', bg: 'rgba(245,158,11,0.1)'  },
          { icon: Shield, value: '100%',       label: 'Seguro',   color: '#34d399', bg: 'rgba(16,185,129,0.1)'  },
        ].map(({ icon: Icon, value, label, color, bg }) => (
          <div key={label} className="card text-center p-4">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mx-auto mb-2" style={{ background: bg }}>
              <Icon style={{ width: 16, height: 16, color }} />
            </div>
            <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 14, color }}>{value}</div>
            <div style={{ fontSize: 11, color: '#71717A', fontWeight: 600, marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Form */}
      <div className="card space-y-5">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <UserPlus style={{ width: 18, height: 18, color: '#818cf8' }} />
          </div>
          <div>
            <h2 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, color: '#F4F4F5', fontSize: 15 }}>Novo convite</h2>
            <p style={{ fontSize: 12, color: '#71717A' }}>Link valido por 7 dias, uso unico</p>
          </div>
        </div>

        <div>
          <label className="label">E-mail do aluno *</label>
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Mail style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: '#71717A', pointerEvents: 'none' }} />
              <input
                type="email"
                className="input pl-10"
                placeholder="aluno@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && email && !isPending && mutate()}
              />
            </div>
            <button className="btn-primary whitespace-nowrap" disabled={isPending || !email} onClick={() => mutate()}>
              {isPending
                ? <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 1s linear infinite' }} />
                : <><ArrowRight style={{ width: 15, height: 15 }} /> Gerar link</>}
            </button>
          </div>
        </div>

        <div className="flex items-start gap-2 rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <MessageCircle style={{ width: 14, height: 14, color: '#34d399', flexShrink: 0, marginTop: 1 }} />
          <span style={{ fontSize: 12, color: '#71717A', lineHeight: 1.5 }}>
            O link e gerado na hora e voce compartilha pelo <strong style={{ color: '#F4F4F5' }}>WhatsApp, SMS ou e-mail</strong>.
            O aluno clica, cria uma senha e ja aparece na sua lista de alunos automaticamente.
          </span>
        </div>
      </div>

      {/* Result — shown after invite is generated */}
      {resultado && linkConvite && (
        <div className="card animate-scale-in space-y-5" style={{ border: '1px solid rgba(16,185,129,0.3)', background: 'rgba(16,185,129,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Check style={{ width: 17, height: 17, color: '#34d399' }} />
            </div>
            <div>
              <p style={{ fontWeight: 600, color: '#34d399', fontSize: 14 }}>Link gerado com sucesso!</p>
              <p style={{ fontSize: 12, color: '#71717A' }}>
                Expira em {new Date(resultado.expira_em).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Link display */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: '#22c55e', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 8 }}>
              Link do convite
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: 14, padding: '10px 14px' }}>
              <Link2 style={{ width: 14, height: 14, color: '#34d399', flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: '#71717A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, fontFamily: 'monospace' }}>
                {linkConvite}
              </span>
            </div>
          </div>

          {/* Share actions */}
          <div className="grid grid-cols-2 gap-3">
            <button onClick={copiarLink}
              className="flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold text-sm transition-all"
              style={{
                background: copied ? 'rgba(16,185,129,0.25)' : 'rgba(16,185,129,0.12)',
                border: `1px solid ${copied ? 'rgba(16,185,129,0.5)' : 'rgba(16,185,129,0.2)'}`,
                color: copied ? '#34d399' : '#22c55e',
              }}>
              {copied ? <Check style={{ width: 14, height: 14 }} /> : <Copy style={{ width: 14, height: 14 }} />}
              {copied ? 'Copiado!' : 'Copiar link'}
            </button>

            <button onClick={compartilharWhatsApp}
              className="flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold text-sm transition-all"
              style={{
                background: 'rgba(37,211,102,0.1)',
                border: '1px solid rgba(37,211,102,0.2)',
                color: '#25d366',
              }}>
              <Share2 style={{ width: 14, height: 14 }} />
              WhatsApp
            </button>
          </div>

          {/* Open link hint */}
          <div className="flex items-center gap-2 text-xs" style={{ color: '#71717A' }}>
            <ExternalLink style={{ width: 12, height: 12, flexShrink: 0 }} />
            <span>Voce tambem pode abrir o link em aba anonima para testar o cadastro como aluno.</span>
          </div>
        </div>
      )}

      {/* How it works */}
      <div className="card">
        <h2 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, color: '#A1A1AA', fontSize: 13, marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Como funciona</h2>
        <div className="space-y-3">
          {STEPS.map(({ n, emoji, text }) => (
            <div key={n} style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, width: 32, height: 32, borderRadius: 10, background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)', fontSize: 15 }}>
                {emoji}
              </div>
              <div style={{ paddingTop: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#71717A', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Passo {n}</span>
                <p style={{ fontSize: 13, color: '#71717A', marginTop: 2, lineHeight: 1.5 }}>{text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
