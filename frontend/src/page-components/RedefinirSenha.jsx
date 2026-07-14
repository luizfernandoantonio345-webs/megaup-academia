import { useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { Zap, Lock, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react'
import api from '../api/client'
import toast from 'react-hot-toast'

export default function RedefinirSenha() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token') || ''
  const [senha, setSenha] = useState('')
  const [confirma, setConfirma] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [ok, setOk] = useState(false)
  const [erro, setErro] = useState('')

  const regras = [
    { ok: senha.length >= 6,        label: 'Mínimo 6 caracteres' },
    { ok: /[A-Z]/.test(senha),      label: 'Letra maiúscula' },
    { ok: /[0-9]/.test(senha),      label: 'Número' },
    { ok: senha === confirma && confirma.length > 0, label: 'Senhas coincidem' },
  ]
  const senhaValida = regras.every(r => r.ok)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!senhaValida) return
    if (!token) { toast.error('Token inválido'); return }
    setLoading(true)
    setErro('')
    try {
      await api.post('/public/redefinir-senha', { token, nova_senha: senha })
      setOk(true)
      setTimeout(() => navigate('/login'), 3000)
    } catch (err) {
      setErro(err.response?.data?.detail || 'Token inválido ou expirado')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div style={{ minHeight: '100vh', background:'var(--bg-page)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ textAlign: 'center', maxWidth: 340 }}>
          <XCircle style={{ width: 48, height: 48, color: '#FF8078', margin: '0 auto 16px' }} />
          <h2 style={{ fontFamily: 'Inter, sans-serif', fontSize: 20, fontWeight: 600, color:'var(--text-primary)', marginBottom: 8 }}>Link inválido</h2>
          <p style={{ fontSize: 14, color:'var(--text-muted)', marginBottom: 20 }}>O link de redefinição é inválido ou expirou.</p>
          <Link to="/esqueci-senha" style={{ color: '#FF8078', fontWeight: 600, fontSize: 14 }}>Solicitar novo link</Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background:'var(--bg-page)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 40, justifyContent: 'center' }}>
          <div style={{ width: 38, height: 38, borderRadius: 13, background: '#E8342B', outline: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap style={{ width: 18, height: 18, color: 'white' }} />
          </div>
          <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 20, color:'var(--text-primary)', letterSpacing: '-0.02em' }}>MegaUp</span>
        </div>

        <div style={{ background:'var(--bg-card)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: '36px 32px', outline: 'none' }}>
          {ok ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <CheckCircle style={{ width: 30, height: 30, color: '#34d399' }} />
              </div>
              <h2 style={{ fontFamily: 'Inter, sans-serif', fontSize: 22, fontWeight: 600, color:'var(--text-primary)', marginBottom: 10 }}>Senha redefinida!</h2>
              <p style={{ fontSize: 14, color:'var(--text-muted)', marginBottom: 20 }}>Sua senha foi alterada com sucesso. Redirecionando para o login…</p>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: 28 }}>
                <h2 style={{ fontFamily: 'Inter, sans-serif', fontSize: 24, fontWeight: 600, color:'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 8 }}>Nova senha</h2>
                <p style={{ fontSize: 14, color:'var(--text-muted)' }}>Escolha uma senha forte para sua conta.</p>
              </div>

              {erro && (
                <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)', borderRadius: 12, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <XCircle style={{ width: 15, height: 15, color: '#FF8078', flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: '#FF8078' }}>{erro}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color:'var(--text-muted)', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Nova senha</label>
                  <div style={{ position: 'relative' }}>
                    <Lock style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color:'var(--text-muted)' }} />
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={senha}
                      onChange={e => setSenha(e.target.value)}
                      placeholder="Nova senha"
                      required
                      autoFocus
                      style={{ width: '100%', background:'var(--bg-card)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, color:'var(--text-primary)', fontSize: 15, padding: '13px 44px 13px 42px', boxSizing: 'border-box', outline: 'none' }}
                    />
                    <button type="button" onClick={() => setShowPass(v => !v)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color:'var(--text-muted)' }}>
                      {showPass ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color:'var(--text-muted)', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Confirmar senha</label>
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={confirma}
                    onChange={e => setConfirma(e.target.value)}
                    placeholder="Repita a senha"
                    required
                    style={{ width: '100%', background:'var(--bg-card)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, color:'var(--text-primary)', fontSize: 15, padding: '13px 14px', boxSizing: 'border-box', outline: 'none' }}
                  />
                </div>

                {/* Regras */}
                {senha.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {regras.map(r => (
                      <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 16, height: 16, borderRadius: '50%', background: r.ok ? 'rgba(52,211,153,0.15)' : 'rgba(255,255,255,0.05)', border: `1px solid ${r.ok ? '#34d399' : 'rgba(255,255,255,0.08)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {r.ok && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399' }} />}
                        </div>
                        <span style={{ fontSize: 12, color: r.ok ? '#34d399' : 'var(--text-muted)' }}>{r.label}</span>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !senhaValida}
                  style={{ background: '#E8342B', border: 'none', borderRadius: 14, color: 'white', cursor: loading || !senhaValida ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: 15, padding: '14px', marginTop: 4, opacity: loading || !senhaValida ? 0.7 : 1, outline: 'none' }}
                >
                  {loading ? 'Salvando…' : 'Salvar nova senha'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}


