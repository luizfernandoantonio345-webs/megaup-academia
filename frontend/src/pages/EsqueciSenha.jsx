import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Zap, Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import api from '../api/client'
import toast from 'react-hot-toast'

export default function EsqueciSenha() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [devLink, setDevLink] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    try {
      const res = await api.post('/public/esqueci-senha', { email })
      setEnviado(true)
      if (res.data?.dev_info) setDevLink(res.data.dev_info)
    } catch {
      toast.error('Erro ao processar solicitação')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#070B14', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 40, justifyContent: 'center' }}>
          <div style={{ width: 38, height: 38, borderRadius: 13, background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', boxShadow: '0 0 20px rgba(99,102,241,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap style={{ width: 18, height: 18, color: 'white' }} />
          </div>
          <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 900, fontSize: 20, color: '#EFF6FF', letterSpacing: '-0.02em' }}>GymPro</span>
        </div>

        <div style={{ background: '#0E1525', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: '36px 32px', boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }}>
          {enviado ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <CheckCircle style={{ width: 30, height: 30, color: '#34d399' }} />
              </div>
              <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 22, fontWeight: 900, color: '#EFF6FF', marginBottom: 10 }}>Email enviado!</h2>
              <p style={{ fontSize: 14, color: '#4B5768', lineHeight: 1.6, marginBottom: 24 }}>
                Se existe uma conta com o email <strong style={{ color: '#94A3B8' }}>{email}</strong>, você receberá um link para redefinir sua senha em breve.
              </p>
              {devLink && (
                <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 12, padding: '12px 16px', marginBottom: 20, textAlign: 'left' }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#818cf8', marginBottom: 6 }}>DEV MODE — Link gerado (SMTP não configurado):</p>
                  <a href={devLink} style={{ fontSize: 12, color: '#818cf8', wordBreak: 'break-all' }}>{devLink}</a>
                </div>
              )}
              <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 700, color: '#818cf8', textDecoration: 'none' }}>
                <ArrowLeft style={{ width: 14, height: 14 }} /> Voltar ao login
              </Link>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: 28 }}>
                <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 24, fontWeight: 900, color: '#EFF6FF', letterSpacing: '-0.02em', marginBottom: 8 }}>Esqueceu a senha?</h2>
                <p style={{ fontSize: 14, color: '#4B5768', lineHeight: 1.6 }}>
                  Digite seu email e enviaremos um link para redefinir sua senha.
                </p>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#4B5768', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</label>
                  <div style={{ position: 'relative' }}>
                    <Mail style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#3D4F6A' }} />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      required
                      autoFocus
                      style={{ width: '100%', background: '#141D30', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, color: '#EFF6FF', fontSize: 15, padding: '13px 14px 13px 42px', boxSizing: 'border-box', outline: 'none' }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !email}
                  style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', border: 'none', borderRadius: 14, color: 'white', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 800, fontSize: 15, padding: '14px', opacity: loading || !email ? 0.7 : 1, boxShadow: '0 0 24px rgba(99,102,241,0.35)' }}
                >
                  {loading ? 'Enviando…' : 'Enviar link de redefinição'}
                </button>
              </form>

              <div style={{ marginTop: 24, textAlign: 'center' }}>
                <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 600, color: '#4B5768', textDecoration: 'none' }}>
                  <ArrowLeft style={{ width: 14, height: 14 }} /> Voltar ao login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
